# -*- coding: utf-8 -*-
"""
锂安 BMS ESP32 读取程序（MicroPython 主入口）

功能：
  1. 蓝牙扫描，自动识别锂安 BMS（广播含 2760 服务 UUID 或名称含 BMS/LABMS 等）
  2. 连接、订阅通知特征
  3. 循环读取仪表盘数据（电压/电流/SOC/温度/电芯电压/报警状态），
     掉线自动重连
  4. 输出人类可读报表 + 一行 JSON（便于串口转发 / MQTT / 上报服务器）
  5. 串口读取途强 GPS（$GNRMC），解析经纬度/速度，与电池信息一同显示

平台自动检测：
  * ESP32 (MicroPython)  —— 使用 ubluetooth，直接运行
  * 电脑 (CPython)       —— 自动改用 bleak 模式（等价于运行 host_demo.py）

部署：把 bms_protocol.py / bms_ble.py / bms_client.py / main.py
     / gps_nmea.py 5 个文件都放到 ESP32 的根目录
     （覆盖默认 main.py），复位即自动运行。
"""

import sys

# ================= 配置 =================
TARGET_NAME = 'LABMS-46191G38155'          # 指定目标 BMS 名称（子串匹配，如 'LABMS-46191G38155'）；
                          # 留空 = 自动连接信号最强的锂安 BMS
BMS_ADDR = b'\xb1\x41\x00\x0b\x33\x36'  # 直连 BMS 地址（PUBLIC, b141000b3336），跳过扫描避免崩溃
SLAVE_ADDR = 22           # BMS 从机地址（默认 22）
SCAN_TIMEOUT_MS = 15000   # 扫描超时
POLL_INTERVAL_S = 3       # 数据轮询间隔（秒）
READ_INFO_ONCE = True     # 连接后先读一次设备信息（SN/厂商/循环次数等）
JSON_ONLY = False         # True = 只输出 JSON 行（便于程序解析转发）

# ---- GPS 配置（途强定位器，NMEA $GNRMC）----
GPS_ENABLED = True        # False = 禁用 GPS，仅运行 BMS 功能
GPS_RX_PIN = 5            # GPS TXD -> ESP32 GPIO5（UART1 RX）
GPS_TX_PIN = 4            # GPS RXD  <- ESP32 GPIO4（UART1 TX，可不接，占位）
GPS_BAUD = 115200
# ========================================

# ---- 平台检测：必须先于 bms_ble 导入（电脑端没有 ubluetooth 模块） ----
IS_MICROPYTHON = True
try:
    import ubluetooth  # noqa: F401
except ImportError:
    IS_MICROPYTHON = False

if not IS_MICROPYTHON:
    print('检测到电脑环境（无 ubluetooth），切换到 bleak 电脑模式...')
    print('（如需在 ESP32 上运行，请把本文件部署到板子根目录）')
    try:
        import asyncio
        import host_demo
        asyncio.run(host_demo.run_host(TARGET_NAME or None))
    except KeyboardInterrupt:
        pass
    sys.exit(0)

import time
import bms_ble
from bms_client import BmsClient, BmsError
import bms_protocol as P

try:
    import ujson as json
except ImportError:
    import json


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
    if d.get('cell_voltages_mv'):
        cells = d['cell_voltages_mv']
        print(' 电芯电压(mV): %d(最大#%d) %d(最小#%d) 压差%d 平均%d'
              % (d['cell_max_mv'], cells.index(d['cell_max_mv']) + 1,
                 d['cell_min_mv'], cells.index(d['cell_min_mv']) + 1,
                 d['cell_delta_mv'], d['cell_avg_mv']))
        line = ''
        for i, mv in enumerate(cells):
            line += '#%d %d  ' % (i + 1, mv)
            if (i + 1) % 4 == 0:
                print('   ' + line)
                line = ''
        if line:
            print('   ' + line)
    print(' 保护        : %s' % ('、'.join(d['protections']) or '无'))
    print(' 报警        : %s' % ('、'.join(d['alarms']) or '无'))
    print(' 状态        : %s' % ('、'.join(d['pack_status']) or '无'))


def print_info(info):
    print('-' * 46)
    print(' 设备信息')
    print('-' * 46)
    print(' BMSID       : %s' % info['bmsid'])
    print(' 电池 SN     : %s' % info['sn'])
    print(' 制造厂商    : %s' % info['manufacturer'])
    print(' 厂商型号    : %s' % info['model'])
    print(' 客户名称    : %s' % info['customer'])
    print(' 客户型号    : %s' % info['customer_model'])
    print(' 版本日期    : %s' % info['version_date'])
    print(' 循环次数    : %d 次' % info['cycle_count'])
    print(' 满充容量    : %d mAh' % info['full_charge_cap_mah'])
    print(' 最长未充电  : %d h / 最近 %d h' % (info['max_idle_hours'],
                                                info['last_idle_hours']))
    print(' BT 码       : %s' % info['bt_code'])


def print_gps(fix):
    print('=' * 46)
    if fix:
        t, lat, ns, lon, ew, spd = fix
        print(' 途强 GPS 定位   UTC %s' % t)
        print('=' * 46)
        print(' 纬度        : %.6f %s' % (lat, ns))
        print(' 经度        : %.6f %s' % (lon, ew))
        print(' 速度        : %.1f km/h' % spd)
    else:
        print(' 途强 GPS: 等待卫星定位...')


def poll_loop(ble, client, gps=None):
    """已连接状态下循环读取；异常向上抛出触发重连"""
    while True:
        fix = None
        if gps is not None:
            try:
                fix = gps.read_fix()
            except Exception as e:
                print('GPS 读取异常: %s（禁用 GPS）' % e)
                gps = None
        d = client.read_dashboard()
        if JSON_ONLY:
            rec = dict(d)
            if fix:
                rec['gps'] = {
                    'utc': fix[0], 'lat': fix[1], 'ns': fix[2],
                    'lon': fix[3], 'ew': fix[4], 'speed_kmh': fix[5],
                }
            print(json.dumps(rec))
        else:
            print_dashboard(d)
            if gps is not None:
                print_gps(fix)
        time.sleep(POLL_INTERVAL_S)


def _scan_progress(total, found):
    """扫描进度回调（每约 2s 一次）"""
    print('  扫描中... 已发现 %d 台设备，%s'
          % (total, '已找到目标 BMS' if found else '暂无 BMS（继续扫描）'))


def main():
    print('锂安 BMS + 途强 GPS ESP32 读取程序启动（从机地址 %d）...' % SLAVE_ADDR)
    if BMS_ADDR:
        print('直连模式: 跳过扫描，直接连接 %s' % ':'.join('%02X' % b for b in BMS_ADDR))
    elif TARGET_NAME:
        print('目标设备: %s（仅连接名称含该关键字的 BMS）' % TARGET_NAME)
    # GPS 初始化（失败不影响 BMS 主功能）
    gps = None
    if GPS_ENABLED:
        try:
            import gps_nmea
            gps = gps_nmea.GpsNmea(rx=GPS_RX_PIN, tx=GPS_TX_PIN, baudrate=GPS_BAUD)
            print('GPS 初始化成功 (UART1, RX=GPIO%d, %d baud)'
                  % (GPS_RX_PIN, GPS_BAUD))
        except Exception as e:
            print('GPS 初始化失败: %s（仅运行 BMS 功能）' % e)
    # BLE 初始化容错：失败则提示并重试（部分板子/固件第一次上电 BLE 控制器未就绪）
    while True:
        try:
            ble = bms_ble.BmsBle()
            break
        except Exception as e:
            print('BLE 初始化失败: %s，3 秒后重试' % e)
            time.sleep(3)
    while True:
        if BMS_ADDR:
            # 直连模式：跳过扫描
            dev = {'addr_type': 0, 'addr': BMS_ADDR, 'rssi': 0, 'name': '直连设备'}
            print('正在连接 BMS (%s)...' % ':'.join('%02X' % b for b in BMS_ADDR))
        else:
            print('正在扫描 BMS ...')
            try:
                dev = ble.find_bms(SCAN_TIMEOUT_MS,
                                   name_contains=TARGET_NAME or None,
                                   progress_cb=_scan_progress)
            except Exception as e:
                print('扫描失败: %s' % e)
                time.sleep(3)
                continue
            if not dev:
                print('未发现 BMS 设备，%d 秒后重试' % 3)
                time.sleep(3)
                continue
            print('发现 BMS: %s (RSSI %d)' % (dev['name'] or '(未广播名称)',
                                              dev['rssi']))
        try:
            ble.connect(dev)
            print('已连接，订阅通知成功')
        except Exception as e:
            print('连接失败: %s，重新扫描' % e)
            sys.print_exception(e)
            ble.disconnect()
            time.sleep(2)
            continue

        client = BmsClient(ble, slave=SLAVE_ADDR)
        if READ_INFO_ONCE:
            try:
                print_info(client.read_device_info())
            except Exception as e:
                print('读取设备信息失败: %s（不影响实时数据）' % e)
        try:
            poll_loop(ble, client, gps)
        except (BmsError, bms_ble.BleError) as e:
            print('通讯中断: %s，3 秒后重连' % e)
        except Exception as e:
            print('异常: %s，3 秒后重连' % e)
        ble.disconnect()
        time.sleep(3)


if __name__ == '__main__':
    main()
