# -*- coding: utf-8 -*-
"""
锂安 BMS 通信协议层（纯协议，无蓝牙依赖，CPython / MicroPython 通用）

移植自微信小程序 utils/crc16.js 与 utils/protocol.js

帧结构（Modbus 风格，但 CRC 为 CRC-16/XMODEM，低字节在前）：
    [从机地址][功能码][数据 ...][CRC低][CRC高]

要点：
  * CRC 初值为 0x0000（不是标准 Modbus 的 0xFFFF！），多项式 0x1021，高位在前，无反转
  * 寄存器数据为大端（高字节在前）
  * 功能码 0x03 读保持寄存器，0x10 写多个寄存器
  * 单次读请求最多 8 个寄存器（小程序端限制，BMS 端也按此实现）
"""

DEFAULT_ADDR = 22          # 默认从机地址 0x16
FC_READ = 0x03
FC_WRITE = 0x10
MAX_REGS_PER_READ = 8      # 单次读取的最大寄存器数

# ---------------- CRC ----------------

def crc16(data):
    """CRC-16/XMODEM: poly=0x1021, init=0x0000, 无输入/输出反转"""
    crc = 0
    for b in data:
        crc ^= b << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return crc


def append_crc(payload):
    """payload: bytes -> bytes(尾部追加 CRC 低字节 + 高字节)"""
    c = crc16(payload)
    return bytes(payload) + bytes((c & 0xFF, (c >> 8) & 0xFF))


def verify_crc(frame):
    """校验整帧（含尾部 2 字节 CRC）"""
    if not frame or len(frame) < 3:
        return False
    expect = frame[-2] | (frame[-1] << 8)
    return crc16(frame[:-2]) == expect


# ---------------- 帧构造 ----------------

def build_read03(slave, start, count):
    """构造 0x03 读寄存器请求帧"""
    return append_crc(bytes((slave & 0xFF, FC_READ,
                             (start >> 8) & 0xFF, start & 0xFF,
                             (count >> 8) & 0xFF, count & 0xFF)))


def build_write10(slave, start, values):
    """构造 0x10 写多寄存器请求帧。values: 16 位整数列表"""
    head = bytes((slave & 0xFF, FC_WRITE,
                  (start >> 8) & 0xFF, start & 0xFF,
                  (len(values) >> 8) & 0xFF, len(values) & 0xFF,
                  len(values) * 2))
    body = bytearray()
    for v in values:
        body.append((v >> 8) & 0xFF)
        body.append(v & 0xFF)
    return append_crc(head + bytes(body))


# ---------------- 响应长度判定（用于流式收包） ----------------

def expected_read03_length(buf, count=None):
    """返回期望的完整帧长度；不完整/校验失败返回 0。

    兼容：锂安 BMS 对部分寄存器区（实测 0x0804 BMSID 块）的响应
    功能码回显为 0x00 而非 0x03，帧结构仍为扩展格式，一并接受。"""
    n = len(buf)
    if n >= 2 and (buf[1] & 0x80):          # 异常响应帧
        return 5
    if n >= 3 and buf[1] in (FC_READ, 0x00):
        bc = buf[2]                          # 标准格式: [addr,03,字节数,数据...,crc]
        total = 5 + bc
        if (count is None or bc == 2 * count) and n >= total and verify_crc(buf[:total]):
            return total
    if n >= 5 and buf[1] in (FC_READ, 0x00):
        bc = buf[4]                          # 扩展格式: [addr,03,起始Hi,起始Lo,字节数,数据...,crc]
        total = 7 + bc
        if (count is None or bc == 2 * count) and n >= total and verify_crc(buf[:total]):
            return total
    return 0


def expected_write10_length(buf):
    n = len(buf)
    if n >= 2 and (buf[1] & 0x80):
        return 5
    if n < 2 or buf[1] != FC_WRITE:
        return 0
    if n >= 7 and verify_crc(buf[:7]):
        return 7
    if n >= 8 and verify_crc(buf[:8]):
        return 8
    return 0


# ---------------- 响应解析 ----------------

def parse_read03(buf, count=None):
    """解析 0x03 响应，返回 (start, data_bytes)；start 为 None 表示标准格式。
    兼容锂安 BMS 0x0804 BMSID 区块非标回显（功能码为 0x00，帧结构仍为扩展格式）。"""
    if len(buf) < 5:
        raise ValueError('响应帧长度不足')
    if not verify_crc(buf):
        raise ValueError('CRC 校验失败')
    if buf[1] & 0x80:
        raise ValueError('BMS 异常码 0x%02X' % buf[2])
    if buf[1] not in (FC_READ, 0x00):
        raise ValueError('不是 0x03 响应')
    # 标准格式
    if len(buf) == 5 + buf[2] and not (count is not None and
                                       len(buf) == 7 + buf[4] and buf[4] == 2 * count):
        return None, bytes(buf[3:3 + buf[2]])
    # 扩展格式（回显起始地址）
    if len(buf) < 7:
        raise ValueError('响应帧长度不足')
    start = (buf[2] << 8) | buf[3]
    bc = buf[4]
    if len(buf) != 7 + bc:
        raise ValueError('响应字节数不匹配')
    return start, bytes(buf[5:5 + bc])


def parse_write10(buf):
    if len(buf) < 7:
        raise ValueError('响应帧长度不足')
    if not verify_crc(buf):
        raise ValueError('CRC 校验失败')
    if buf[1] & 0x80:
        raise ValueError('BMS 异常码 0x%02X' % buf[2])
    if buf[1] != FC_WRITE:
        raise ValueError('不是 0x10 响应')
    start = (buf[2] << 8) | buf[3]
    cnt = ((buf[4] << 8) | buf[5]) if len(buf) >= 8 else None
    return start, cnt


# ---------------- 数据解码（寄存器下标按字计） ----------------

def u16(data, reg):
    i = 2 * reg
    return (data[i] << 8) | data[i + 1]


def i16(data, reg):
    v = u16(data, reg)
    return v - 65536 if v >= 32768 else v


def u32(data, reg):
    i = 2 * reg
    return (data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]


def i32(data, reg):
    v = u32(data, reg)
    return v - 4294967296 if v > 2147483647 else v


def k2c(raw):
    """0.1K 原始值 -> 摄氏度"""
    return (raw - 2731) / 10


def regs_to_ascii(data, byte_off, byte_len):
    """按字节截取 ASCII 字符串（遇 0 截断），用于 SN / 厂商等信息"""
    out = []
    for i in range(byte_off, min(byte_off + byte_len, len(data))):
        b = data[i]
        if b == 0:
            break
        if 32 <= b <= 126:
            out.append(chr(b))
    s = ''.join(out).strip()
    return s or '--'


# ---------------- 标签表 / 业务解码 ----------------

CELL_TYPES = {0: '磷酸铁锂', 1: '三元锂', 2: '钛酸锂', 3: '钠离子'}

# 寄存器 14：报警位
ALARM_BITS = (
    (0, '超高压报警'), (1, '超低压报警'), (2, '防拆卸报警'), (3, '电压线断线'),
    (4, '温度线断线'), (5, 'AFE 通讯失效'), (6, '压差过大'),
)

# 寄存器 12-13（u32）：保护状态位
PROTECT_BITS = (
    (0, '过压保护'), (1, '欠压保护'), (2, '放电过流2保护'), (3, '放电过流1保护'),
    (4, '充电过流保护'), (5, '短路保护'), (6, '断线保护'), (7, '低压禁充保护'),
    (8, '充电低温保护'), (9, '充电高温保护'), (10, '放电低温保护'), (11, '放电高温保护'),
    (18, '硬件放电保护'), (19, '硬件充电保护'), (20, 'PRO 状态'), (21, 'CTLD 状态'),
    (22, 'PD 状态'),
)

# 寄存器 15：电池包状态位
PACK_BITS = (
    (0, '零电流未校准'), (1, '电流未校准'), (2, '强制开启放电'), (3, '手动关闭放电'),
    (4, '强制开启充电'), (5, '手动关闭充电'), (6, '电池加热中'), (8, '满充电'),
    (10, '允许容量更新'), (13, 'AFE 配置失败'), (15, '固件未解锁'),
)


def decode_bits(value, table):
    return [name for bit, name in table if (value >> bit) & 1]


def format_rtc(r21, r22, r23):
    """寄存器 21/22/23 -> 'YYYY-MM-DD HH:MM:SS'（基准年 2022，同小程序）"""
    return '%04d-%02d-%02d %02d:%02d:%02d' % (
        2022 + ((r21 >> 8) & 0xFF), r21 & 0xFF, (r22 >> 8) & 0xFF,
        r22 & 0xFF, (r23 >> 8) & 0xFF, r23 & 0xFF)


def format_runtime(sec):
    if sec <= 0:
        return '--'
    return '%d天%02d时%02d分%02d秒' % (
        sec // 86400, (sec % 86400) // 3600, (sec % 3600) // 60, sec % 60)


def decode_dashboard(base, fw, status, head, cap, runtime, cell_bytes):
    """
    解析仪表盘数据（寄存器块原文 -> 字典）。
    参数均为 readRegisters 返回的原始字节：
      base    寄存器 0-9   温度/电压/电流/剩余容量
      fw      寄存器 19    固件版本
      status  寄存器 12-15 状态位
      head    寄存器 20-24 SOC/RTC/电芯类型与串数
      cap     寄存器 26-28 循环次数/满充容量/设计容量
      runtime 寄存器 30-31 运行时长
      cell_bytes 寄存器 32..32+N-1 电芯电压
    """
    out = {}
    out['mos_temp_c'] = round(k2c(u16(base, 0)), 1)
    out['temp1_c'] = round(k2c(u16(base, 1)), 1)
    out['temp2_c'] = round(k2c(u16(base, 2)), 1)
    out['temp3_c'] = round(k2c(u16(base, 3)), 1)

    voltage_mv = u32(base, 4)
    current_ma = i32(base, 6)
    out['voltage_v'] = round(voltage_mv / 1000, 3)
    out['current_a'] = round(current_ma / 1000, 2)
    out['power_w'] = round(abs(voltage_mv * current_ma) / 1000000, 2)
    out['remain_cap_mah'] = u32(base, 8)
    out['run_status'] = '充电中' if current_ma > 0 else ('放电中' if current_ma < 0 else '静置中')

    w = u16(fw, 0)
    out['firmware'] = 'v%d.%02d' % ((w >> 8) & 0xFF, w & 0xFF)

    st = u32(status, 0)
    alarm = u16(status, 2)
    pack = u16(status, 3)
    out['charge_mos'] = bool((st >> 17) & 1)
    out['discharge_mos'] = bool((st >> 16) & 1)
    out['protections'] = decode_bits(st, PROTECT_BITS)
    out['alarms'] = decode_bits(alarm, ALARM_BITS)
    out['pack_status'] = decode_bits(pack, PACK_BITS)

    soc_soh = u16(head, 0)
    out['soc'] = soc_soh & 0xFF
    out['soh'] = (soc_soh >> 8) & 0xFF
    out['rtc'] = format_rtc(u16(head, 1), u16(head, 2), u16(head, 3))
    cc = u16(head, 4)
    out['cell_type'] = CELL_TYPES.get(cc & 0xFF, '未知(%d)' % (cc & 0xFF))
    out['cell_count'] = (cc >> 8) & 0xFF

    out['cycle'] = u16(cap, 0)
    out['full_cap_mah'] = 10 * u16(cap, 1)
    out['design_cap_mah'] = 10 * u16(cap, 2)
    out['runtime'] = format_runtime(u32(runtime, 0))

    n = out['cell_count']
    n = 0 if n > 32 else max(0, n)
    cells = [u16(cell_bytes, i) for i in range(n)] if (n and len(cell_bytes) >= 2 * n) else []
    out['cell_voltages_mv'] = cells
    if cells:
        out['cell_max_mv'] = max(cells)
        out['cell_min_mv'] = min(cells)
        out['cell_delta_mv'] = max(cells) - min(cells)
        out['cell_avg_mv'] = sum(cells) // len(cells)
    return out


def hexs(data):
    return ' '.join('%02X' % b for b in data)
