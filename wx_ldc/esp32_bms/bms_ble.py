# -*- coding: utf-8 -*-
"""
锂安 BMS 蓝牙驱动层（MicroPython / ESP32）

移植自微信小程序 utils/ble.js：
  * 服务   UUID: 00002760-08C2-11E1-9073-0E8AC72E1001
  * 写特征 UUID: 00002760-08C2-11E1-9073-0E8AC72E0001
  * 通知特征 UUID: 00002760-08C2-11E1-9073-0E8AC72E0002
  * 小程序端协商 MTU=185（写分片 = MTU-3）；本驱动默认按 20 字节分片，
    若固件支持 MTU 交换（_IRQ_MTU_EXCHANGED）则自动放大分片

UUID 在空中以小端字节序传输，下面的常量即为小端字节串。
"""

import time
import binascii
import ubluetooth as bluetooth
from micropython import const

_IRQ_CENTRAL_CONNECT = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)
_IRQ_SCAN_RESULT = const(5)
_IRQ_SCAN_DONE = const(6)
_IRQ_PERIPHERAL_CONNECT = const(7)
_IRQ_PERIPHERAL_DISCONNECT = const(8)
_IRQ_GATTC_SERVICE_RESULT = const(9)
_IRQ_GATTC_SERVICE_DONE = const(10)
_IRQ_GATTC_CHARACTERISTIC_RESULT = const(11)
_IRQ_GATTC_CHARACTERISTIC_DONE = const(12)
_IRQ_GATTC_DESCRIPTOR_RESULT = const(13)
_IRQ_GATTC_DESCRIPTOR_DONE = const(14)
_IRQ_GATTC_WRITE_DONE = const(17)
_IRQ_GATTC_NOTIFY = const(18)
_IRQ_MTU_EXCHANGED = const(21)

# 服务/特征 UUID（标准写法）
SERVICE_UUID = '00002760-08C2-11E1-9073-0E8AC72E1001'
WRITE_UUID = '00002760-08C2-11E1-9073-0E8AC72E0001'
NOTIFY_UUID = '00002760-08C2-11E1-9073-0E8AC72E0002'

# 空中传输为小端字节序
SERVICE_UUID_LE = binascii.unhexlify('01102ec78a0e7390e111c20860270000')
WRITE_UUID_LE = binascii.unhexlify('01002ec78a0e7390e111c20860270000')
NOTIFY_UUID_LE = binascii.unhexlify('02002ec78a0e7390e111c20860270000')
# 广播数据中可能出现的两种字节序十六进制串（用于扫描过滤）
_UUID_HEX_LE = '01102ec78a0e7390e111c20860270000'
_UUID_HEX_BE = '0000276008c211e190730e8ac72e1001'

# 写/通知特征 UUID 的两种表示（bytes 小端 / str 标准格式）
WRITE_UUID_LE_HEX = '01002ec78a0e7390e111c20860270000'
WRITE_UUID_BE_HEX = '0000276008c211e190730e8ac72e0001'
NOTIFY_UUID_LE_HEX = '02002ec78a0e7390e111c20860270000'
NOTIFY_UUID_BE_HEX = '0000276008c211e190730e8ac72e0002'

CCCD_UUID = b'\x02\x29'          # 0x2902 客户端特征配置描述符
CCCD_UUID_LE_HEX = '0229000000001000800000805f9b34fb'
CCCD_UUID_BE_HEX = '0000290200001000800000805f9b34fb'

# 名称关键字（同小程序端）
NAME_KEYWORDS = ('bms', 'battery', 'smartbms', 'jbd', 'daly', 'jk', 'jikong', 'ant', 'labms')
NAME_PREFIX = 'labms'


def _parse_adv_name(adv):
    """从广播数据解析设备名称（0x08 短名 / 0x09 完整名）"""
    names = []
    i = 0
    while i + 1 < len(adv):
        length = adv[i]
        if length == 0 or i + 1 + length > len(adv):
            break
        ad_type = adv[i + 1]
        payload = adv[i + 2:i + 1 + length]
        if ad_type in (0x08, 0x09):
            try:
                names.append(payload.decode('utf-8', 'ignore'))
            except Exception:
                pass
        i += 1 + length
    return ' '.join(names).strip()


def is_bms_device(name, adv_hex):
    """判断广播是否来自锂安 BMS：广播含服务 UUID（任一字节序）或名称匹配"""
    if _UUID_HEX_LE in adv_hex or _UUID_HEX_BE in adv_hex:
        return True
    n = (name or '').lower()
    if n.startswith(NAME_PREFIX):
        return True
    return any(k in n for k in NAME_KEYWORDS)


def _uuid_hex(u):
    """IRQ 事件中的 uuid 可能是 bytes(小端) / str(标准格式) / int(16或32位)，
    统一为小写 hex 串；固件异常（None/坏对象）时返回 '?' 不崩溃"""
    if isinstance(u, str):
        return u.replace('-', '').lower()
    if isinstance(u, int):
        return '%08x' % u if u > 0xFFFF else '%04x' % u
    try:
        return binascii.hexlify(u).decode()
    except Exception:
        return '?'


class BleError(Exception):
    pass


class BmsBle:
    """BLE 客户端驱动：扫描 / 连接 / 发现服务与特征 / 订阅通知 / 分片写"""

    def __init__(self):
        try:
            self._ble = bluetooth.BLE()
            self._ble.active(True)
        except Exception as e:
            raise BleError('BLE 初始化失败: %s' % e)
        try:
            self._ble.config(mtu=185)     # 协商较大 MTU（部分固件不支持则忽略）
        except Exception:
            pass
        self._ble.irq(self._irq)

        self._conn_handle = None
        self._write_handle = None
        self._notify_handle = None
        self._cccd_handle = None
        self._write_props = 0
        self._write_chunk = 20

        self._scan_results = {}
        self._scan_keys = []
        self._scan_done = False
        self._found_bms_at = None
        self._parsed_count = 0
        self._connect_ok = False
        self._disconnected = False
        self._services = []
        self._services_done = False
        self._chars = []
        self._chars_done = False
        self._descs = []
        self._descs_done = False
        self._write_done_evt = False
        self._rx = []                     # 通知数据缓冲

    # ---------- 事件回调（IRQ 上下文，仅做简单赋值/append） ----------

    def _irq(self, ev, data):
        if ev == _IRQ_SCAN_RESULT:
            addr_type, addr, adv_type, rssi, adv_data = data
            key = binascii.hexlify(addr).decode()
            rec = self._scan_results.get(key)
            if rec is None:
                rec = {'addr_type': addr_type, 'addr': addr, 'adv': bytearray(),
                       'rssi': rssi, 'has_scan_rsp': False}
                self._scan_results[key] = rec
                self._scan_keys.append(key)
            # adv_type=4 是扫描响应（SCAN_RSP），拼接到已有广播数据；
            # 其他类型是新广播包，但只在首次收到时替换（保留已拼接的 SCAN_RSP）
            if adv_type == 4:                       # SCAN_RSP
                if not rec['has_scan_rsp']:
                    rec['adv'] += adv_data
                    rec['has_scan_rsp'] = True
            elif not rec.get('has_adv'):
                rec['adv'] = bytearray(adv_data)
                rec['has_adv'] = True
            rec['rssi'] = rssi
        elif ev == _IRQ_SCAN_DONE:
            self._scan_done = True
        elif ev == _IRQ_PERIPHERAL_CONNECT:
            conn_handle, addr_type, addr = data
            self._conn_handle = conn_handle
            self._connect_ok = True
        elif ev == _IRQ_PERIPHERAL_DISCONNECT:
            conn_handle, addr_type, addr = data
            self._conn_handle = None
            self._rx = []
            self._disconnected = True
        elif ev == _IRQ_GATTC_SERVICE_RESULT:
            conn_handle, start_handle, end_handle, uuid = data
            self._services.append((start_handle, end_handle, uuid))
        elif ev == _IRQ_GATTC_SERVICE_DONE:
            self._services_done = True
        elif ev == _IRQ_GATTC_CHARACTERISTIC_RESULT:
            if len(data) == 5:
                # v1.28: (conn_handle, def_handle, value_handle, properties, uuid)
                conn_handle, def_handle, value_handle, props, uuid = data
            else:                          # 旧版固件无 props 字段
                conn_handle, def_handle, value_handle, uuid = data
                props = 0
            self._chars.append((def_handle, value_handle, uuid, props))
        elif ev == _IRQ_GATTC_CHARACTERISTIC_DONE:
            self._chars_done = True
        elif ev == _IRQ_GATTC_DESCRIPTOR_RESULT:
            conn_handle, dsc_handle, uuid = data
            self._descs.append((dsc_handle, uuid))
        elif ev == _IRQ_GATTC_DESCRIPTOR_DONE:
            self._descs_done = True
        elif ev == _IRQ_GATTC_WRITE_DONE:
            self._write_done_evt = True
        elif ev == _IRQ_GATTC_NOTIFY:
            conn_handle, value_handle, notify_data = data
            # v1.28 固件 notify_data 可能是特殊对象/None，安全转 bytes
            try:
                b = bytes(notify_data)
            except Exception:
                b = b''
            if b:
                self._rx.append(b)
        elif ev == _IRQ_MTU_EXCHANGED:
            try:
                conn_handle, mtu = data
                self._write_chunk = max(20, mtu - 3)
            except Exception:
                pass

    # ---------- 通用等待 ----------

    def _wait(self, done_attr, timeout_ms, results_attr=None, stable_ms=400):
        """等待完成标志；若提供 results_attr，结果数稳定 stable_ms 也视为完成"""
        t0 = time.ticks_ms()
        last_count = -1
        last_change = t0
        while time.ticks_diff(time.ticks_ms(), t0) < timeout_ms:
            if getattr(self, done_attr):
                return True
            if results_attr is not None:
                c = len(getattr(self, results_attr))
                if c != last_count:
                    last_count = c
                    last_change = time.ticks_ms()
                elif c > 0 and time.ticks_diff(time.ticks_ms(), last_change) >= stable_ms:
                    return True
            time.sleep_ms(30)
        return results_attr is not None and len(getattr(self, results_attr)) > 0

    # ---------- 扫描 ----------

    def scan(self, timeout_ms=10000, stop_when_bms=True, progress_cb=None):
        """扫描并返回设备列表。
        stop_when_bms=True 时仅标记已找到（不提前停止扫描，避免 BLE 栈崩溃）。
        progress_cb(设备总数, 是否已找到BMS) 每约 2s 回调一次，用于打印扫描进度。"""
        self._scan_results = {}
        self._scan_keys = []
        self._scan_done = False
        self._found_bms_at = None
        self._parsed_count = 0
        try:
            self._ble.gap_scan(timeout_ms, 30000, 30000, True)
        except Exception as e:
            raise BleError('启动扫描失败: %s' % e)
        t0 = time.ticks_ms()
        last_report = t0
        while not self._scan_done:
            now = time.ticks_ms()
            if stop_when_bms and self._found_bms_at is None:
                # 只解析新出现的设备，避免重复解析旧设备
                while self._parsed_count < len(self._scan_keys):
                    key = self._scan_keys[self._parsed_count]
                    self._parsed_count += 1
                    rec = self._scan_results.get(key)
                    if rec is None:
                        continue
                    adv = bytes(rec['adv'])
                    adv_hex = binascii.hexlify(adv).decode()
                    if is_bms_device(_parse_adv_name(adv), adv_hex):
                        self._found_bms_at = now
                        break
            if progress_cb is not None and \
                    time.ticks_diff(now, last_report) > 2000:
                last_report = now
                progress_cb(len(self._scan_results), self._found_bms_at is not None)
            if time.ticks_diff(now, t0) >= timeout_ms:
                break
            time.sleep_ms(50)
        # 不调用 gap_scan(None)，让扫描自然超时结束（避免 ESP32-C3 BLE 栈崩溃）
        # 等待扫描完成 + 额外延迟让 BLE 栈稳定
        time.sleep_ms(500)
        # 等待 _IRQ_SCAN_DONE 事件（最多额外等 2s）
        t_wait = time.ticks_ms()
        while not self._scan_done and time.ticks_diff(time.ticks_ms(), t_wait) < 2000:
            time.sleep_ms(50)
        time.sleep_ms(200)  # 额外稳定时间
        out = []
        for rec in self._scan_results.values():
            adv = bytes(rec['adv'])
            out.append({
                'addr_type': rec['addr_type'],
                'addr': rec['addr'],
                'rssi': rec['rssi'],
                'name': _parse_adv_name(adv),
                'adv_hex': binascii.hexlify(adv).decode(),
                'is_bms': is_bms_device(_parse_adv_name(adv),
                                        binascii.hexlify(adv).decode()),
            })
        return out

    def find_bms(self, timeout_ms=15000, name_contains=None, progress_cb=None):
        """扫描并返回第一个匹配的 BMS 设备（优先 UUID/前缀精确匹配），未找到返回 None。
        name_contains: 指定名称关键字（子串匹配，忽略大小写），
                       附近有多台 BMS 时用于锁定目标设备。
        progress_cb:   扫描进度回调（设备总数, 是否已找到BMS）。"""
        devices = self.scan(timeout_ms, progress_cb=progress_cb)
        candidates = [d for d in devices if d['is_bms']]
        if name_contains:
            kw = name_contains.lower()
            matched = [d for d in candidates if kw in (d['name'] or '').lower()]
            if matched:
                candidates = matched
        if not candidates:
            return None
        candidates.sort(key=lambda d: d['rssi'], reverse=True)
        return candidates[0]

    # ---------- 连接 ----------

    @property
    def connected(self):
        return self._conn_handle is not None

    def connect(self, device, timeout_ms=15000):
        """连接 BMS 并完成服务发现 + 订阅通知"""
        self._connect_ok = False
        self._disconnected = False
        self._rx = []
        try:
            self._ble.gap_connect(device['addr_type'], bytearray(device['addr']))
        except Exception as e:
            raise BleError('发起连接失败: %s' % e)
        t0 = time.ticks_ms()
        while not self._connect_ok:
            if self._disconnected:
                raise BleError('连接失败（对端拒绝）')
            if time.ticks_diff(time.ticks_ms(), t0) > timeout_ms:
                raise BleError('连接超时')
            time.sleep_ms(50)

        # 不依赖服务 UUID 解析（ESP32-C3 v1.28 固件 IRQ 事件中 uuid 对象异常），
        # 全范围发现特征，按 GATT 属性(props)匹配写/通知特征
        self._discover_chars(1, 0xFFFF, timeout_ms)
        print('  [debug] 发现 %d 个特征:' % len(self._chars))
        for c in self._chars:
            print('    def=%04X value=%04X props=0x%02X uuid=%s' % (
                c[0], c[1], c[3], _uuid_hex(c[2])))
        # 协商 MTU：微信小程序协商 185，BMS 支持大通知包；
        # 不协商则 MTU=23，23B 以上的响应帧会被拆包且第二片丢失 -> CRC 失败超时
        try:
            self._ble.gattc_exchange_mtu(self._conn_handle)
            t0 = time.ticks_ms()
            while time.ticks_diff(time.ticks_ms(), t0) < 3000:
                if self._write_chunk > 20:
                    break
                time.sleep_ms(50)
        except Exception:
            pass
        print('  [debug] MTU 协商后写分片=%d' % self._write_chunk)
        w, n = self._find_chars()
        if w is None or n is None:
            self.disconnect()
            raise BleError('未找到写入/通知特征')
        self._write_handle = w[1]
        self._notify_handle = n[1]
        self._write_props = w[3] if len(w) > 3 else 0
        print('  [debug] 写特征 value=%04X props=0x%02X | 通知特征 value=%04X'
              % (self._write_handle, self._write_props, self._notify_handle))
        self._enable_notify(w, n)
        time.sleep_ms(300)                 # 同小程序：订阅后稍作等待
        return True

    def _discover_services(self, timeout_ms):
        self._services = []
        self._services_done = False
        self._ble.gattc_discover_services(self._conn_handle)
        if not self._wait('_services_done', timeout_ms, '_services'):
            raise BleError('服务发现超时')

    def _find_service(self):
        for start, end, uuid in self._services:
            if _uuid_hex(uuid) in (_UUID_HEX_LE, _UUID_HEX_BE):
                return (start, end)
        # 宽松匹配：UUID 中含 2760
        for start, end, uuid in self._services:
            h = _uuid_hex(uuid)
            if '6027' in h or '2760' in h:
                return (start, end)
        return self._services[0][:2] if self._services else None

    def _discover_chars(self, start_handle, end_handle, timeout_ms):
        self._chars = []
        self._chars_done = False
        self._ble.gattc_discover_characteristics(self._conn_handle, start_handle, end_handle)
        if not self._wait('_chars_done', timeout_ms, '_chars'):
            raise BleError('特征发现超时')

    def _find_chars(self):
        """按 GATT 属性匹配写/通知特征（固件 uuid 异常，不能按 UUID 匹配）。

        实测 BMS 只响应 write-without-response(0x04) 特征的无响应写
        （与电脑端 bleak response=False 一致），故写特征优先 0x04，
        其次 0x08(write)；通知特征取 notify(0x10)。"""
        write_char = None
        for ch in self._chars:
            if write_char is None and (ch[3] & 0x04):        # write-no-rsp
                write_char = ch
        for ch in self._chars:
            if write_char is None and (ch[3] & 0x08):        # write
                write_char = ch
        notify_char = None
        for ch in self._chars:
            if notify_char is None and (ch[3] & 0x10):       # notify
                notify_char = ch
        if write_char is None or notify_char is None:
            return None, None
        if write_char[1] == notify_char[1]:
            print('  [warn] 写/通知特征句柄相同(%04X)，可能匹配错误' % write_char[1])
        return write_char, notify_char

    def _enable_notify(self, write_char, notify_char):
        """发现 0x2902 描述符并写入 0x0001 订阅通知。

        固件 uuid 异常，不解析描述符 uuid；从 notify value_handle 起发现
        描述符，取第一个作为 CCCD（该设备 notify 特征紧跟唯一 CCCD）。
        带异常保护：发现失败不崩溃，可回退尝试 def_handle。"""
        self._descs = []
        self._descs_done = False
        # 用 value_handle 到 0xFFFF 发现描述符（部分固件 def_handle 返回 0xFFFF）
        start_handles = [notify_char[1]]
        if notify_char[0] not in (0xFFFF,) and notify_char[0] != notify_char[1]:
            start_handles.append(notify_char[0])
        for start in start_handles:
            self._descs = []
            self._descs_done = False
            try:
                self._ble.gattc_discover_descriptors(
                    self._conn_handle, start, 0xFFFF)
            except Exception as e:
                print('  [warn] 发现描述符失败 handle=%04X: %s' % (start, e))
                continue
            if not self._wait('_descs_done', 3000, '_descs', stable_ms=200):
                print('  [warn] 描述符发现超时 handle=%04X' % start)
                continue
            if self._descs:
                break
        for d in self._descs:
            print('    [debug] DESC handle=%04X uuid=%s' % (d[0], _uuid_hex(d[1])))
        cccd = self._descs[0][0] if self._descs else None
        if cccd is None:
            raise BleError('未找到 CCCD 描述符')
        self._cccd_handle = cccd
        print('  [debug] 订阅通知: 写 CCCD handle=%04X = 01 00' % cccd)
        # CCCD 描述符写入必须带响应(mode=1)，不受写特征 props 影响
        self._write_done_evt = False
        try:
            self._ble.gattc_write(self._conn_handle, cccd, bytes((0x01, 0x00)), 1)
        except Exception as e:
            raise BleError('订阅 CCCD 写入失败: %s' % e)
        t0 = time.ticks_ms()
        while not self._write_done_evt:
            if self._conn_handle is None:
                raise BleError('订阅 CCCD 写入时连接断开')
            if time.ticks_diff(time.ticks_ms(), t0) > 1500:
                raise BleError('订阅 CCCD 写入超时')
            time.sleep_ms(10)

    # ---------- 数据收发 ----------

    def write(self, data, handle=None, timeout_ms=1500):
        """分片写数据（默认写特征）。

        写模式与电脑端 bleak 对齐（host_demo 用 response=False）：
        写特征属性为 write-no-rsp(0x04) 时用 mode=0（实测 BMS 仅响应此模式），
        否则用带响应写 mode=1。mode=0 无 ACK，不等待 WRITE_DONE 事件。
        """
        if self._conn_handle is None:
            raise BleError('蓝牙未连接')
        h = handle if handle is not None else self._write_handle
        mode = 0 if (self._write_props & 0x04) else 1
        i = 0
        while i < len(data):
            chunk = data[i:i + self._write_chunk]
            self._write_done_evt = False
            try:
                self._ble.gattc_write(self._conn_handle, h, chunk, mode)
            except Exception as e:
                raise BleError('BLE 写入失败: %s' % e)
            if mode == 0:
                time.sleep_ms(30)           # no-rsp 无 ACK：稍等避免连写过快
            else:
                t0 = time.ticks_ms()
                while not self._write_done_evt:
                    if self._conn_handle is None:
                        raise BleError('写入时连接断开')
                    if time.ticks_diff(time.ticks_ms(), t0) > timeout_ms:
                        raise BleError('写入超时')
                    time.sleep_ms(10)
            i += len(chunk)
        return True

    def read_rx(self):
        """取出并清空当前累积的通知数据（可能为 b''）"""
        if not self._rx:
            return b''
        buf = b''.join(self._rx)
        self._rx = []
        return buf

    def disconnect(self):
        if self._conn_handle is not None:
            try:
                self._ble.gap_disconnect(self._conn_handle)
            except Exception:
                pass
        self._conn_handle = None
        self._rx = []
