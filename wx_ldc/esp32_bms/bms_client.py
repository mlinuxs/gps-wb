# -*- coding: utf-8 -*-
"""
锂安 BMS 客户端（请求-应答事务层）

移植自微信小程序 utils/bms-client.js：
  * 一次请求-应答事务：发帧 -> 累积通知数据 -> 按 expected 长度截帧 -> 校验解析
  * 读寄存器单次最多 8 个，分片间 30ms
  * 默认响应超时 1600ms（读电芯电压等大块时建议 2000ms）
"""

import time
import bms_protocol as P

# ---- 计时兼容层 ----
# MicroPython 提供 ticks_ms / ticks_diff / sleep_ms，CPython 的 time 模块没有。
# 本模块号称"CPython / MicroPython 通用"，故在此做兼容，使电脑端(bleak)也能直接用。
try:
    _ticks_ms = time.ticks_ms
    _ticks_diff = time.ticks_diff
    _sleep_ms = time.sleep_ms
except AttributeError:                       # CPython
    _ticks_ms = lambda: int(time.time() * 1000)
    _ticks_diff = lambda new, old: new - old
    _sleep_ms = lambda ms: time.sleep(ms / 1000.0)


class BmsError(Exception):
    pass


class BmsClient:

    def __init__(self, ble, slave=P.DEFAULT_ADDR):
        """
        ble: 需提供 write(bytes) / read_rx() -> bytes / connected 属性
             （bms_ble.BmsBle 或电脑端 host_demo.HostBle 均可实现）
        slave: BMS 从机地址，默认 22 (0x16)
        """
        self.ble = ble
        self.slave = slave
        self._rx = b''

    # ---------- 事务 ----------

    def _drain(self):
        chunk = self.ble.read_rx()
        while chunk:
            self._rx += chunk
            chunk = self.ble.read_rx()

    def _transact(self, frame, expected_len_fn, timeout_ms=1600):
        self._rx = b''
        self._drain()
        self._rx = b''                          # 丢弃事务前的残留数据
        if not self.ble.connected:
            raise BmsError('蓝牙未连接')
        self.ble.write(frame)
        t0 = _ticks_ms()
        while _ticks_diff(_ticks_ms(), t0) < timeout_ms:
            self._drain()
            if self._rx:
                n = expected_len_fn(self._rx)
                if n > 0 and len(self._rx) >= n:
                    resp = self._rx[:n]
                    self._rx = self._rx[n:]
                    return resp
            if not self.ble.connected:
                raise BmsError('等待响应时连接断开')
            _sleep_ms(15)
        self._rx = b''
        raise BmsError('BMS 响应超时')

    # ---------- 寄存器读写 ----------

    def read_registers(self, start, count, timeout_ms=1600):
        """读保持寄存器，返回原始数据字节（大端，2 字节/寄存器）"""
        if count <= 0:
            return b''
        timeout_ms = 2000 if count > 24 else timeout_ms
        out = bytearray()
        i = 0
        while i < count:
            n = min(P.MAX_REGS_PER_READ, count - i)
            frame = P.build_read03(self.slave, start + i, n)
            resp = self._transact(frame,
                                  lambda b, _n=n: P.expected_read03_length(b, _n),
                                  timeout_ms)
            rstart, data = P.parse_read03(resp, n)
            if rstart is not None and rstart != start + i and rstart != 0:
                raise BmsError('响应起始地址不匹配: 期望 %d 实际 %d' % (start + i, rstart))
            # 锂安 BMS 0x0804 区响应不回显起始地址（rstart=0）且功能码为 0x00，
            # 数据仍有效，宽容处理（该区为 BMSID ASCII 数据）
            if rstart == 0 and rstart != start + i:
                print('  [warn] 响应未回显地址(期望 %d)，按数据有效处理' % (start + i))
            out += data
            i += n
            if i < count:
                _sleep_ms(30)                   # 分片间隔，同小程序
        return bytes(out)

    def write_registers(self, start, values, timeout_ms=1800):
        """写多寄存器。values: 16 位整数列表"""
        if not values:
            raise BmsError('写入值不能为空')
        frame = P.build_write10(self.slave, start, values)
        resp = self._transact(frame, P.expected_write10_length, timeout_ms)
        rstart, cnt = P.parse_write10(resp)
        if rstart != start:
            raise BmsError('写入响应地址不匹配')
        if cnt is not None and cnt != len(values):
            raise BmsError('写入响应数量不匹配')
        return True

    # ---------- 业务读取 ----------

    def read_dashboard(self):
        """读取并解码仪表盘全部数据（电压/电流/SOC/温度/电芯/报警等）"""
        base = self.read_registers(0, 10)
        fw = self.read_registers(19, 1)
        status = self.read_registers(12, 4)
        head = self.read_registers(20, 5)
        cap = self.read_registers(26, 3)
        runtime = self.read_registers(30, 2)

        # 先拿电芯串数（寄存器 24 高字节），再读电芯电压
        n = (P.u16(head, 4) >> 8) & 0xFF
        n = 0 if n > 32 else max(0, n)
        cell_bytes = self.read_registers(32, n) if n else b''
        return P.decode_dashboard(base, fw, status, head, cap, runtime, cell_bytes)

    def read_device_info(self):
        """读取设备信息（BMSID / SN / 厂商 / 循环记录等，同"电池信息"页）

        地址映射（对照小程序 battery-info.js 的 i() 映射后核对）：
          0x0230 (560)  42 regs  SN / 厂商 / 型号 / 客户 / 版本日期
          0x0400 (1024) 24 regs  循环次数 / 满充容量 / 闲置时长 / BT 码
          0x0804 (2052) 12 regs  BMSID（ASCII）
        """
        out = {}
        info = self.read_registers(560, 42, 2500)     # 0x0230 起
        out['sn'] = P.regs_to_ascii(info, 0, 12)
        out['manufacturer'] = P.regs_to_ascii(info, 12, 8)
        out['model'] = P.regs_to_ascii(info, 20, 24)
        out['customer'] = P.regs_to_ascii(info, 44, 8)
        out['customer_model'] = P.regs_to_ascii(info, 52, 24)
        out['version_date'] = P.regs_to_ascii(info, 76, 8)

        rec = self.read_registers(1024, 24, 2500)     # 0x0400 起：循环记录区
        out['cycle_count'] = P.u16(rec, 1)            # 0x0401
        out['full_charge_cap_mah'] = P.u32(rec, 2)    # 0x0402-0x0403
        out['max_idle_hours'] = P.u16(rec, 6)         # 0x0406
        out['last_idle_hours'] = P.u16(rec, 7)        # 0x0407
        out['bt_code'] = P.regs_to_ascii(rec, 16, 32) # 0x0408 起

        dev = self.read_registers(2052, 12, 3500)     # 0x0804 起：BMSID（ASCII）
        out['bmsid'] = P.regs_to_ascii(dev, 0, 24)
        return out
