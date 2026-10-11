var r = require("./crc16"),
  n = r.crc16,
  t = r.appendCrc,
  e = r.verifyCrc;

function i(r) {
  return r >> 8 & 255
}

function a(r) {
  return 255 & r
}

function u(r, n) {
  return (255 & r[n]) << 8 | 255 & r[n + 1]
}

function o(r, n, t) {
  if (r.length < 7) throw new Error("升级响应长度不足");
  if (!e(r)) throw new Error("CRC 校验失败");
  if (128 & r[1]) throw new Error("BMS 异常码 0x" + r[2].toString(16));
  if (69 !== r[1]) throw new Error("不是 0x45 升级响应");
  if ((r[2] << 8 | r[3]) !== n) throw new Error("升级响应命令不匹配");
  if (r[4] !== t) throw new Error("升级响应字节数不匹配");
  if (r.length !== 5 + t + 2) throw new Error("升级响应长度不匹配")
}

function f(r, n) {
  var t = 2 * n;
  return (255 & r[t]) << 8 | 255 & r[t + 1]
}

function w(r, n) {
  var t = 2 * n;
  return (r[t] << 24 >>> 0 | r[t + 1] << 16 | r[t + 2] << 8 | r[t + 3]) >>> 0
}
module.exports = {
  DEFAULT_ADDR: 22,
  FC_READ: 3,
  FC_WRITE: 16,
  FC_UPGRADE: 69,
  KEY_UPGRADE_REQUEST: 4103,
  KEY_UPGRADE_DATA: 4104,
  KEY_UPGRADE_FINISH: 4105,
  buildRead03: function(r, n, e) {
    return t(new Uint8Array([r || 22, 3, i(n), a(n), i(e), a(e)])).buffer
  },
  buildWrite10: function(r, n, e) {
    var u = [r || 22, 16, i(n), a(n), i(e.length), a(e.length), 2 * e.length];
    return e.forEach((function(r) {
      return u.push(i(r), a(r))
    })), t(new Uint8Array(u)).buffer
  },
  buildUpgradeRequest: function(r, n, e) {
    var u = new Uint8Array([r || 22, 69, i(4103), a(4103), 6, i(n), a(n), e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e]);
    return t(u).buffer
  },
  buildUpgradeData: function(r, n, e) {
    var u = new Uint8Array(e || []),
      o = u.length + 2;
    if (o > 255) throw new Error("升级分包过大");
    var f = new Uint8Array(7 + u.length);
    return f[0] = r || 22, f[1] = 69, f[2] = i(4104), f[3] = a(4104), f[4] = o, f[5] = i(n), f[6] = a(n), f.set(u, 7), t(f).buffer
  },
  buildUpgradeFinish: function(r, n) {
    var e = n >>> 0,
      u = new Uint8Array([r || 22, 69, i(4105), a(4105), 4, e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, 255 & e]);
    return t(u).buffer
  },
  expectedRead03Length: function(r, n) {
    var t = new Uint8Array(r);
    if (t.length >= 2 && 128 & t[1]) return 5;
    if (t.length >= 3 && 3 === t[1]) {
      var i = t[2],
        a = 5 + i;
      if ((!n || i === 2 * n) && t.length >= a && e(t.slice(0, a))) return a
    }
    if (t.length >= 5 && 3 === t[1]) {
      var u = t[4],
        o = 7 + u;
      if ((!n || u === 2 * n) && t.length >= o && e(t.slice(0, o))) return o
    }
    return 0
  },
  expectedWrite10Length: function(r) {
    var n = new Uint8Array(r);
    return n.length >= 2 && 128 & n[1] ? 5 : 16 !== n[1] ? 0 : n.length >= 7 && e(n.slice(0, 7)) ? 7 : n.length >= 8 && e(n.slice(0, 8)) ? 8 : 0
  },
  expectedUpgrade45Length: function(r) {
    var n = new Uint8Array(r);
    if (n.length >= 2 && 128 & n[1]) return 5;
    if (n.length < 5 || 69 !== n[1]) return 0;
    var t = 5 + n[4] + 2;
    return n.length >= t && e(n.slice(0, t)) ? t : 0
  },
  parseRead03: function(r, n) {
    var t = new Uint8Array(r);
    if (t.length < 5) throw new Error("响应帧长度不足");
    if (!e(t)) throw new Error("CRC 校验失败");
    if (128 & t[1]) throw new Error("BMS 异常码 0x" + t[2].toString(16));
    if (3 !== t[1]) throw new Error("不是 0x03 响应");
    var i = t.length >= 7 && t.length === 7 + t[4] && (!n || t[4] === 2 * n);
    if (!(t.length !== 5 + t[2] || n && i)) {
      var a = t[2];
      return {
        slave: t[0],
        start: null,
        data: t.slice(3, 3 + a)
      }
    }
    if (t.length < 7) throw new Error("响应帧长度不足");
    var u = t[2] << 8 | t[3],
      o = t[4];
    if (t.length !== 7 + o) throw new Error("响应字节数不匹配");
    return {
      slave: t[0],
      start: u,
      data: t.slice(5, 5 + o)
    }
  },
  parseWrite10: function(r) {
    var n = new Uint8Array(r);
    if (n.length < 7) throw new Error("响应帧长度不足");
    if (!e(n)) throw new Error("CRC 校验失败");
    if (128 & n[1]) throw new Error("BMS 异常码 0x" + n[2].toString(16));
    if (16 !== n[1]) throw new Error("不是 0x10 响应");
    var t = n[2] << 8 | n[3],
      i = n.length >= 8 ? n[4] << 8 | n[5] : null;
    return {
      slave: n[0],
      start: t,
      count: i
    }
  },
  parseUpgradeRequest: function(r) {
    var n = new Uint8Array(r);
    return o(n, 4103, 3), {
      rc: 255 & n[5],
      segmentSize: u(n, 6)
    }
  },
  parseUpgradeDataAck: function(r) {
    var n = new Uint8Array(r);
    return o(n, 4104, 2), {
      id: u(n, 5)
    }
  },
  parseUpgradeFinish: function(r) {
    var n = new Uint8Array(r);
    return o(n, 4105, 1), {
      rc: 255 & n[5]
    }
  },
  u16: f,
  i16: function(r, n) {
    var t = f(r, n);
    return t >= 32768 ? t - 65536 : t
  },
  u32: w,
  i32: function(r, n) {
    var t = w(r, n);
    return t > 2147483647 ? t - 4294967296 : t
  },
  f32: function(r, n) {
    var t = 2 * n,
      e = new ArrayBuffer(4),
      i = new DataView(e);
    return i.setUint8(0, 255 & r[t]), i.setUint8(1, 255 & r[t + 1]), i.setUint8(2, 255 & r[t + 2]), i.setUint8(3, 255 & r[t + 3]), i.getFloat32(0, !1)
  },
  f32ToWords: function(r) {
    var n = new ArrayBuffer(4),
      t = new DataView(n);
    return t.setFloat32(0, r, !1), [t.getUint8(0) << 8 | t.getUint8(1), t.getUint8(2) << 8 | t.getUint8(3)]
  },
  k2c: function(r) {
    return (r - 2731) / 10
  },
  bytesToHex: function(r) {
    return Array.prototype.map.call(new Uint8Array(r), (function(r) {
      return r.toString(16).padStart(2, "0")
    })).join(" ")
  },
  crc16: n,
  crc32: function(r) {
    for (var n = new Uint8Array(r || []), t = 4294967295, e = 0; e < n.length; e++) {
      t ^= n[e];
      for (var i = 0; i < 8; i++) t = 1 & t ? t >>> 1 ^ 3988292384 : t >>> 1
    }
    return (4294967295 ^ t) >>> 0
  }
};