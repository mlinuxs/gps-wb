# -*- coding: utf-8 -*-
"""
锂安 BMS 电脑端读取程序（CPython + bleak）

在电脑（macOS/Windows/Linux）上用系统蓝牙扫描并连接锂安 BMS，
复用与 ESP32 完全相同的 bms_protocol / bms_client 协议层读取仪表盘与设备信息。

用法：
  python host_demo.py --scan                  # 仅扫描，列出所有设备（含厂商/服务数据）
  python host_demo.py [--name 关键字] [--rounds N]  # 名称能识别时直连；识别不出自动转探测
  python host_demo.py --probe [--top 6]       # 逐台连接探测：谁含 2760 服务就读取谁

main.py 在电脑环境（无 ubluetooth）会自动切换到本模块：
  asyncio.run(host_demo.run_host(TARGET_NAME or None))

关键实现要点：
  1) 微信小程序是"先全量扫描、连接后再用 getBLEDeviceServices 找 2760 服务"，
     而实测这块电池保护板既不广播设备名也不广播服务 UUID，
     所以不能只靠名称/广播 UUID 识别，必须逐台连接后按服务判断（--probe）。
  2) bleak 是异步 API，而 bms_client 是同步协议层：
     故在后台线程常驻一个 asyncio 事件循环承载 bleak 操作，
     主线程用 run_coroutine_threadsafe 同步提交，通知数据经 deque 回传。
"""

import asyncio
import sys
import threading
import time
from collections import deque

from bleak import BleakClient, BleakScanner

# ---- 与 bms_ble.py / utils/ble.js 相同的常量 ----
SERVICE_UUID = '00002760-08c2-11e1-9073-0e8ac72e1001'
WRITE_UUID = '00002760-08c2-11e1-9073-0e8ac72e0001'
NOTIFY_UUID = '00002760-08c2-11e1-9073-0e8ac72e0002'

NAME_PREFIX = 'labms'
NAME_KEYWORDS = ('bms', 'battery', 'smartbms', 'jbd', 'daly', 'jk', 'jikong',
                 'ant', 'labms', 'xiaoxiang')

POLL_INTERVAL_S = 3          # 轮询间隔（秒）


# ---------------- 后台事件循环（承载 bleak 异步操作） ----------------

class BleLoop:
    """后台线程 + 常驻 asyncio 事件循环。

    bleak 的 connect / start_notify / write_gatt_char 都是协程，
    而 bms_client.BmsClient 是同步协议层，故让 bleak 跑在独立线程的 loop 上，
    主线程通过 run() 同步提交任务并等待结果。
    """

    def __init__(self):
        self.loop = asyncio.new_event_loop()
        self._th = threading.Thread(target=self._run, daemon=True)
        self._th.start()

    def _run(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    def run(self, coro, timeout=20):
        return asyncio.run_coroutine_threadsafe(coro, self.loop).result(timeout)

    def stop(self):
        try:
            self.loop.call_soon_threadsafe(self.loop.stop)
        except Exception:
            pass


# ---------------- 设备识别 ----------------

def looks_like_bms(name, svc_uuids, svc_data=None):
    """名称关键字匹配 或 广播/服务数据中出现 2760 服务标识"""
    for u in (svc_uuids or []):
        if '2760' in u.replace('-', '').lower():
            return True
    for u in (svc_data or {}):
        if '2760' in str(u).replace('-', '').lower():
            return True
    n = (name or '').lower().strip()
    if n.startswith(NAME_PREFIX):
        return True
    return any(k in n for k in NAME_KEYWORDS)


# ---------------- bleak 适配层（对接 BmsClient 需要的同步接口） ----------------

class HostBle:
    """把 bleak 包装成 BmsClient 所需的接口：write(bytes) / read_rx() / connected"""

    def __init__(self, loop, client, write_char, notify_char):
        self._loop = loop                  # BleLoop
        self._client = client
        self._write_char = write_char
        self._notify_char = notify_char
        self._rx = deque()
        props = set(getattr(write_char, 'properties', set()) or set())
        # write-without-response 特征 -> response=False（BMS 只认这种写，同小程序）
        self._resp = 'write-without-response' not in props

    @property
    def connected(self):
        try:
            return self._client.is_connected
        except Exception:
            return False

    def _on_notify(self, _char, data):
        """回调运行在 loop 线程，只做一次 deque.append（线程安全）"""
        if data:
            self._rx.append(bytes(data))

    def write(self, data):
        """同步分片写：把协程提交给后台 loop 并等待完成"""
        if not self.connected:
            raise ConnectionError('蓝牙未连接')
        data = bytes(data)
        for i in range(0, len(data), 20):
            self._loop.run(
                self._client.write_gatt_char(self._write_char,
                                             data[i:i + 20],
                                             response=self._resp),
                timeout=10)
        return True

    def read_rx(self):
        if not self._rx:
            return b''
        parts = []
        while self._rx:
            parts.append(self._rx.popleft())
        return b''.join(parts)


# ---------------- 扫描 ----------------

def _hex(d):
    try:
        return bytes(d).hex()
    except Exception:
        return str(d)


async def scan_devices(timeout_s=15, verbose=True):
    """扫描并返回设备信息列表（含 is_bms 标记），按 RSSI 排序"""
    print('正在扫描蓝牙设备（%d 秒）...' % timeout_s)
    advs = await BleakScanner.discover(timeout=timeout_s, return_adv=True)
    out = []
    for addr, adv in advs.items():
        # 新版 bleak 返回 (BleakDevice, AdvertisementData) 元组，老版直接是 AdvertisementData
        if isinstance(adv, tuple):
            adv = adv[1]
        name = adv.local_name or ''
        svc = [u.lower() for u in (adv.service_uuids or [])]
        md = {str(k): _hex(v) for k, v in (adv.manufacturer_data or {}).items()}
        sd = {str(k): _hex(v) for k, v in (adv.service_data or {}).items()}
        out.append({
            'addr': addr,
            'name': name,
            'rssi': adv.rssi,
            'svc': svc,
            'md': md,
            'sd': sd,
            'is_bms': looks_like_bms(name, svc, sd),
        })
    out.sort(key=lambda d: d['rssi'], reverse=True)
    if verbose:
        print('共发现 %d 台设备（按信号强度排序）:' % len(out))
        for d in out:
            print('  [%s] %s  rssi=%d%s'
                  % (d['addr'], d['name'] or '(无名称)', d['rssi'],
                     '  <== 疑似BMS' if d['is_bms'] else ''))
            if d['svc']:
                print('        services: %s' % ','.join(d['svc']))
            if d['md']:
                print('        manufacturer: %s' % d['md'])
            if d['sd']:
                print('        service_data: %s' % d['sd'])
    return out


# ---------------- 连接与读取（同步入口） ----------------

def pick_chars(client):
    """挑出写/通知特征，返回 (write_char, notify_char, has_2760, svc_uuids)"""
    svc_uuids = [s.uuid.lower() for s in client.services]
    has_2760 = any('2760' in u for u in svc_uuids)

    write_char = notify_char = None
    for s in client.services:
        for c in s.characteristics:
            u = (c.uuid or '').lower()
            if u == WRITE_UUID:
                write_char = c
            elif u == NOTIFY_UUID:
                notify_char = c

    # UUID 缺失时按属性兜底（同 ESP32/小程序的 props 匹配策略）
    if write_char is None or notify_char is None:
        all_w, all_n = [], []
        for s in client.services:
            for c in s.characteristics:
                p = set(c.properties or [])
                if 'write-without-response' in p:
                    all_w.insert(0, c)
                elif 'write' in p and c not in all_w:
                    all_w.append(c)
                if 'notify' in p:
                    all_n.append(c)
        write_char = write_char or (all_w[0] if all_w else None)
        notify_char = notify_char or (all_n[0] if all_n else None)
    return write_char, notify_char, has_2760, svc_uuids


async def _connect_async(addr, timeout=15.0):
    client = BleakClient(addr)
    await client.connect(timeout=timeout)
    write_char, notify_char, has2760, svcs = pick_chars(client)
    return client, write_char, notify_char, has2760, svcs


def read_bms(addr, label='', rounds=1, with_info=True, connect_timeout=15.0):
    """连接一台设备并读数；返回 (dashboard dict|None, 说明字符串)"""
    from bms_client import BmsClient
    bl = BleLoop()
    client = None
    try:
        client, w, n, has2760, svcs = bl.run(_connect_async(addr, connect_timeout), timeout=30)
        print('已连接 %s (MTU=%s)' % (addr, getattr(client, 'mtu_size', '?')))
        print('  [debug] 服务: %s' % ','.join(svcs))
        print('  [debug] 写特征 %s props=%s | 通知特征 %s'
              % (getattr(w, 'uuid', 'None') if w else 'None',
                 sorted(set(getattr(w, 'properties', []) or [])) if w else '',
                 getattr(n, 'uuid', 'None') if n else 'None'))
        if not has2760:
            return None, '非 BMS（无 2760 服务）'
        if w is None or n is None:
            return None, '有 2760 服务但缺写/通知特征'

        hostble = HostBle(bl, client, w, n)
        bl.run(client.start_notify(n, hostble._on_notify), timeout=10)
        print('已订阅通知')

        bms = BmsClient(hostble, slave=22)
        if with_info:
            try:
                print_info(bms.read_device_info())
            except Exception as e:
                print('读取设备信息失败: %r（不影响实时数据）' % e)
        dash = None
        for i in range(rounds):
            print('\n--- 第 %d/%d 轮 ---' % (i + 1, rounds))
            dash = bms.read_dashboard()          # 同步协议层（内部轮询通知缓冲）
            print_dashboard(dash)
            if i + 1 < rounds:
                time.sleep(POLL_INTERVAL_S)
        return dash, 'OK'
    except Exception as e:
        return None, '失败: %s: %s' % (e.__class__.__name__, e)
    finally:
        if client is not None:
            try:
                bl.run(client.disconnect(), timeout=8)
            except Exception:
                pass
        bl.stop()


async def probe_all(top=6, scan_timeout=12, rounds=1):
    """扫描后按信号强度逐台连接，找到含 2760 服务的设备即读取数据"""
    devs = await scan_devices(scan_timeout, verbose=True)
    if not devs:
        print('未扫描到任何蓝牙设备')
        return 1
    targets = devs[:top]
    print('\n开始逐台连接探测（共 %d 台，按信号强度）...' % len(targets))
    for d in targets:
        label = '%s rssi=%d' % (d['name'] or '(无名称)', d['rssi'])
        dash, msg = read_bms(d['addr'], label=label, rounds=rounds)
        print('  [%s] %s -> %s' % (d['addr'], d['name'] or '(无名称)', msg))
        if dash:
            print('\n>>> 成功读取 BMS 数据（%s）' % label)
            return 0
    print('\n探测完毕，未找到含 2760 服务的设备。')
    print('提示：若手机上的微信小程序正连接着 BMS，BMS 会停止广播/拒绝新连接，')
    print('      请先在小程序里断开（或关闭手机蓝牙）后再试。')
    return 1


# ---------------- 结果打印 ----------------

def print_dashboard(d):
    print('=' * 46)
    print(' 锂安 BMS 实时数据  %s' % d.get('rtc', ''))
    print('=' * 46)
    print(' 电压        : %s V' % d['voltage_v'])
    print(' 电流        : %s A（%s）' % (d['current_a'], d['run_status']))
    print(' 功率        : %s W' % d['power_w'])
    print(' SOC / SOH   : %d%% / %d%%' % (d['soc'], d['soh']))
    print(' 剩余/满充/设计容量: %d / %d / %d mAh'
          % (d['remain_cap_mah'], d['full_cap_mah'], d['design_cap_mah']))
    print(' 循环次数    : %d' % d['cycle'])
    print(' 固件版本    : %s' % d['firmware'])
    print(' 电芯        : %s x %d' % (d['cell_type'], d['cell_count']))
    print(' 温度(℃)    : MOS %s | T1 %s | T2 %s | T3 %s'
          % (d['mos_temp_c'], d['temp1_c'], d['temp2_c'], d['temp3_c']))
    print(' 充电 MOS    : %s   放电 MOS: %s'
          % ('开启' if d['charge_mos'] else '关闭',
             '开启' if d['discharge_mos'] else '关闭'))
    print(' 运行时长    : %s' % d['runtime'])
    cells = d.get('cell_voltages_mv') or []
    if cells:
        print(' 电芯电压(mV): %d(最大) %d(最小) 压差%d 平均%d'
              % (d['cell_max_mv'], d['cell_min_mv'],
                 d['cell_delta_mv'], d['cell_avg_mv']))
        print('    ' + ' '.join('#%d:%d' % (i + 1, v) for i, v in enumerate(cells)))
    print(' 保护        : %s' % ('、'.join(d['protections']) or '无'))
    print(' 报警        : %s' % ('、'.join(d['alarms']) or '无'))
    print(' 状态        : %s' % ('、'.join(d['pack_status']) or '无'))


def print_info(info):
    print('-' * 46)
    print(' 设备信息')
    print('-' * 46)
    for k in ('bmsid', 'sn', 'manufacturer', 'model', 'customer',
              'customer_model', 'version_date'):
        print(' %-12s: %s' % (k, info.get(k, '--')))
    print(' 循环次数    : %d 次' % info.get('cycle_count', 0))
    print(' 满充容量    : %d mAh' % info.get('full_charge_cap_mah', 0))
    print(' BT 码       : %s' % info.get('bt_code', '--'))


# ---------------- 主流程 ----------------

async def run_host(name_keyword=None, rounds=3, scan_timeout=15, probe=False,
                   top=6, addr=None):
    """扫描 -> 识别/探测 BMS -> 读仪表盘与设备信息。

    addr: 已知设备地址时直连（该保护板广播间歇、且无名称/UUID，
          短扫描常漏掉，记住地址后直连最稳）。
    """
    if addr:
        print('直连模式: %s（跳过扫描）' % addr)
        dash, msg = read_bms(addr, rounds=rounds)
        print('结果: %s' % msg)
        return 0 if dash else 1

    devs = await scan_devices(scan_timeout, verbose=True)
    cands = [d for d in devs if d['is_bms']]
    if name_keyword:
        kw = name_keyword.lower()
        matched = [d for d in cands if kw in d['name'].lower()]
        if matched:
            cands = matched
    if cands and not probe:
        d = cands[0]
        print('\n>>> 按名称/广播识别到 BMS: %s %s (rssi=%d)'
              % (d['addr'], d['name'], d['rssi']))
        dash, msg = read_bms(d['addr'], rounds=rounds)
        print('结果: %s' % msg)
        return 0 if dash else 1

    print('\n名称/广播未能识别出 BMS（该保护板可能不广播名称与 UUID），转入探测模式...')
    return await probe_all(top=top, scan_timeout=scan_timeout, rounds=rounds)


def _parse_args(argv):
    scan_only = probe = False
    name = None
    addr = None
    rounds = 3
    timeout = 15
    top = 6
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == '--scan':
            scan_only = True
        elif a == '--probe':
            probe = True
        elif a == '--addr' and i + 1 < len(argv):
            addr = argv[i + 1]
            i += 1
        elif a == '--name' and i + 1 < len(argv):
            name = argv[i + 1]
            i += 1
        elif a == '--rounds' and i + 1 < len(argv):
            rounds = int(argv[i + 1])
            i += 1
        elif a == '--top' and i + 1 < len(argv):
            top = int(argv[i + 1])
            i += 1
        elif a == '--timeout' and i + 1 < len(argv):
            timeout = int(argv[i + 1])
            i += 1
        i += 1
    return scan_only, probe, name, rounds, timeout, top, addr


if __name__ == '__main__':
    scan_only, probe, name, rounds, timeout, top, addr = _parse_args(sys.argv[1:])
    if scan_only:
        asyncio.run(scan_devices(timeout, verbose=True))
        sys.exit(0)
    rc = asyncio.run(run_host(name, rounds=rounds, scan_timeout=timeout,
                              probe=probe, top=top, addr=addr))
    sys.exit(rc)
