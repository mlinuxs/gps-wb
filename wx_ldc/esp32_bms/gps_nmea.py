# -*- coding: utf-8 -*-
"""
途强 GPS NMEA 解析模块（MicroPython / ESP32-C3）

硬件接线：
  GPS TXD  -> ESP32 GPIO5 (UART1 RX)
  GPS RXD  <- ESP32 GPIO4 (UART1 TX，可不接，占位)
波特率 115200，8N1

解析 $GNRMC 核心定位语句，返回定位元组：
  (UTC时间, 纬度, N/S, 经度, E/W, 速度km/h)
非阻塞读取：read_fix() 每次只消耗串口缓冲区已有数据，不影响 BLE 轮询。
"""

try:
    from machine import UART, Pin
except ImportError:
    UART = None
    Pin = None


class GpsNmea:
    """途强 GPS 串口读取 + $GNRMC 解析"""

    def __init__(self, rx=5, tx=4, baudrate=115200):
        if UART is None:
            raise RuntimeError('非 MicroPython 环境，无 machine.UART')
        self._uart = UART(1, baudrate=baudrate, bits=8, parity=None,
                          stop=1, tx=Pin(tx), rx=Pin(rx), timeout=100)
        self._uart.read()            # 清空接收缓冲区
        self.last_fix = None         # 最近一次有效定位
        self.last_line = None        # 最近一条 $GNRMC 原文

    def read_fix(self):
        """非阻塞读取：返回最新解析到的有效定位元组；无新数据/未定位返回 None"""
        while self._uart.any():
            line = self._uart.readline()
            if not line:
                continue
            try:
                s = line.decode('utf-8', 'replace').strip()
            except Exception:
                continue
            if not s.startswith('$GNRMC'):
                continue
            self.last_line = s
            fix = self._parse_rmc(s)
            if fix:
                self.last_fix = fix
                return fix
        return None

    @staticmethod
    def _parse_rmc(line):
        """解析 $GNRMC 行，返回 (UTC时间, 纬度, N/S, 经度, E/W, 速度km/h) 或 None"""
        p = line.split(',')
        if len(p) < 10 or p[2] != 'A':       # 状态 A = 有效定位
            return None
        try:
            # 纬度 2001.347581,N -> 20.022459
            lat = float(p[3][:2]) + float(p[3][2:]) / 60.0
            lon = float(p[5][:3]) + float(p[5][3:]) / 60.0
            speed = float(p[7]) * 1.852       # 节 -> km/h
            return (p[1], round(lat, 6), p[4], round(lon, 6), p[6], round(speed, 1))
        except (ValueError, IndexError):
            return None
