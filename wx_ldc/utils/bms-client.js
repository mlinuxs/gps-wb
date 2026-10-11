var e = require("../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../@babel/runtime/helpers/asyncToGenerator"),
  t = require("./ble"),
  n = require("./mock-bms"),
  a = require("./protocol"),
  u = a.buildRead03,
  c = a.buildWrite10,
  s = a.buildUpgradeRequest,
  i = a.buildUpgradeData,
  o = a.buildUpgradeFinish,
  p = a.expectedRead03Length,
  f = a.expectedWrite10Length,
  l = a.expectedUpgrade45Length,
  h = a.parseRead03,
  b = a.parseWrite10,
  x = a.parseUpgradeRequest,
  d = a.parseUpgradeDataAck,
  w = a.parseUpgradeFinish,
  k = a.crc16,
  g = a.crc32,
  m = a.bytesToHex,
  v = null,
  y = new Uint8Array(0),
  S = !1,
  A = Math.floor(8);

function M() {
  try {
    getApp().globalData.debugMode && console.log.apply(console, arguments)
  } catch (e) {}
}

function U(e) {
  return new Promise((function(r) {
    return setTimeout(r, e)
  }))
}

function E() {
  return getApp().globalData.mockMode
}

function D() {
  S || (S = !0, t.onData((function(e) {
    if (v) {
      var r, t, n;
      M("[BMS RX chunk]", m(e)), r = y, t = new Uint8Array(e), (n = new Uint8Array(r.length + t.length)).set(r), n.set(t, r.length), y = n;
      var a = v.expectedLength(y.buffer);
      if (a > 0 && y.length >= a) {
        var u = y.slice(0, a);
        y = y.slice(a), clearTimeout(v.timer), v.resolve(u.buffer), v = null, M("[BMS RX frame]", m(u))
      }
    }
  })))
}

function R(e, r, t) {
  return T.apply(this, arguments)
}

function T() {
  return (T = r(e().mark((function r(n, a, u) {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return D(), e.next = 3, P(u);
        case 3:
          return e.abrupt("return", new Promise((function(e, r) {
            y = new Uint8Array(0), v = {
              resolve: e,
              reject: r,
              timer: setTimeout((function() {
                v && (v.reject(new Error("BMS 响应超时")), v = null, y = new Uint8Array(0))
              }), u || 1600),
              expectedLength: a
            }, M("[BMS TX]", m(n)), t.write(n).catch((function(e) {
              v && (clearTimeout(v.timer), v.reject(e), v = null)
            }))
          })));
        case 4:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function P(e) {
  return B.apply(this, arguments)
}

function B() {
  return (B = r(e().mark((function r(t) {
    var n;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          n = Date.now() + Math.max(3e3, t || 1600);
        case 1:
          if (!v) {
            e.next = 8;
            break
          }
          if (!(Date.now() >= n)) {
            e.next = 4;
            break
          }
          throw new Error("上一条 BMS 请求尚未完成");
        case 4:
          return e.next = 6, U(50);
        case 6:
          e.next = 1;
          break;
        case 8:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function q(e, r, t) {
  return L.apply(this, arguments)
}

function L() {
  return (L = r(e().mark((function r(t, n, a) {
    var u, c, s, i, o, p, f, l;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!((u = Number(n) || 0) <= 0)) {
            e.next = 3;
            break
          }
          return e.abrupt("return", new Uint8Array(0));
        case 3:
          if (!(u <= A)) {
            e.next = 5;
            break
          }
          return e.abrupt("return", _(t, u, a));
        case 5:
          c = [], s = 0, i = 0;
        case 8:
          if (!(i < u)) {
            e.next = 21;
            break
          }
          return o = Math.min(A, u - i), e.next = 12, _(t + i, o, a);
        case 12:
          if (p = e.sent, c.push(p), s += p.length, !(i + o < u)) {
            e.next = 18;
            break
          }
          return e.next = 18, U(30);
        case 18:
          i += A, e.next = 8;
          break;
        case 21:
          return f = new Uint8Array(s), l = 0, c.forEach((function(e) {
            f.set(e, l), l += e.length
          })), e.abrupt("return", f);
        case 25:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function _(e, r, t) {
  return j.apply(this, arguments)
}

function j() {
  return (j = r(e().mark((function r(t, a, c) {
    var s, i, o, f;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (s = getApp().globalData.slaveAddr || 22, !E()) {
            e.next = 4;
            break
          }
          return i = h(n.buildReadResponse(s, t, a), a), e.abrupt("return", i.data);
        case 4:
          return e.next = 6, R(u(s, t, a), (function(e) {
            return p(e, a)
          }), c);
        case 6:
          if (o = e.sent, null === (f = h(o, a)).start || f.start === t) {
            e.next = 10;
            break
          }
          throw new Error("响应起始地址不匹配");
        case 10:
          return e.abrupt("return", f.data);
        case 11:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function N(e, r) {
  return F.apply(this, arguments)
}

function F() {
  return (F = r(e().mark((function r(t, n) {
    var a;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.next = 2, R(t, l, n || 2500);
        case 2:
          return a = e.sent, e.abrupt("return", a);
        case 4:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}
var X = !1;

function z() {
  try {
    var e = wx.getStorageSync("bms_saved_password");
    return /^\d{4}$/.test(e) ? e : ""
  } catch (e) {
    return ""
  }
}

function W(e) {
  try {
    wx.setStorageSync("bms_saved_password", e)
  } catch (e) {}
}

function C() {
  try {
    wx.removeStorageSync("bms_saved_password")
  } catch (e) {}
}

function $(e) {
  var r = String(null == e ? "" : e).replace(/\D/g, "");
  if (4 !== r.length) return null;
  var t = r.split("").map(Number);
  return [65535 & (t[0] << 8 | t[1]), 65535 & (t[2] << 8 | t[3])]
}

function G(e) {
  return !e || e.length < 4 ? "" : [e[0], e[1], e[2], e[3]].map((function(e) {
    return String(255 & e)
  })).join("")
}

function H(e) {
  return new Promise((function(r) {
    wx.showModal({
      title: "请输入 BMS 密码",
      content: e || "",
      editable: !0,
      placeholderText: "4 位数字密码",
      confirmText: "解锁",
      cancelText: "取消",
      success: function(e) {
        return r(e.confirm ? e.content : null)
      },
      fail: function() {
        return r(null)
      }
    })
  }))
}

function I(e) {
  return J.apply(this, arguments)
}

function J() {
  return (J = r(e().mark((function r(t) {
    var n, a;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.next = 2, q(1539, 2, t || 2e3);
        case 2:
          return n = e.sent, a = G(n), e.abrupt("return", {
            decoded: a
          });
        case 5:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function K() {
  return (K = r(e().mark((function r(t, n, a) {
    var u, c, s, i;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (u = Q(t), c = O(t), s = O(n), (c || u) && s) {
            e.next = 5;
            break
          }
          throw new Error("密码必须为 4 位数字");
        case 5:
          if (!E()) {
            e.next = 9;
            break
          }
          return W(s), X = !0, e.abrupt("return", !0);
        case 9:
          if (u) {
            e.next = 15;
            break
          }
          return e.next = 12, I(a || 2500);
        case 12:
          if (e.sent.decoded === c) {
            e.next = 15;
            break
          }
          throw new Error("原密码不正确");
        case 15:
          return X = !0, i = $(s), e.next = 19, re(1539, i, a || 2500, {
            skipUnlock: !0
          });
        case 19:
          return e.next = 21, I(a || 2500);
        case 21:
          if (e.sent.decoded === s) {
            e.next = 26;
            break
          }
          throw C(), X = !1, new Error("新密码写入后校验失败");
        case 26:
          return W(s), X = !0, e.abrupt("return", !0);
        case 29:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function O(e) {
  var r = String(null == e ? "" : e).replace(/\D/g, "");
  return /^\d{4}$/.test(r) ? r : ""
}

function Q(e) {
  return "EDCB" === String(null == e ? "" : e).trim().toUpperCase()
}

function V(e) {
  return Y.apply(this, arguments)
}

function Y() {
  return (Y = r(e().mark((function r(t) {
    var n, a, u, c, s, i;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!E() && !X) {
            e.next = 2;
            break
          }
          return e.abrupt("return", !0);
        case 2:
          return wx.showLoading({
            title: "读取密码"
          }), e.prev = 3, e.next = 6, I(t);
        case 6:
          a = e.sent, n = a.decoded, wx.hideLoading(), e.next = 16;
          break;
        case 11:
          return e.prev = 11, e.t0 = e.catch(3), wx.hideLoading(), wx.showToast({
            title: "读取密码失败，请重试",
            icon: "none"
          }), e.abrupt("return", !1);
        case 16:
          if (!(u = z()) || u !== n) {
            e.next = 20;
            break
          }
          return X = !0, e.abrupt("return", !0);
        case 20:
          c = 0;
        case 21:
          if (!(c < 3)) {
            e.next = 39;
            break
          }
          return e.next = 24, H();
        case 24:
          if (null != (s = e.sent)) {
            e.next = 27;
            break
          }
          return e.abrupt("return", !1);
        case 27:
          if (4 === (i = String(s).replace(/\D/g, "")).length) {
            e.next = 31;
            break
          }
          return wx.showToast({
            title: "密码必须为 4 位数字",
            icon: "none"
          }), e.abrupt("continue", 36);
        case 31:
          if (i !== n) {
            e.next = 35;
            break
          }
          return X = !0, W(i), e.abrupt("return", !0);
        case 35:
          wx.showToast({
            title: "密码错误，请重试",
            icon: "none"
          });
        case 36:
          c++, e.next = 21;
          break;
        case 39:
          return e.abrupt("return", !1);
        case 40:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [3, 11]
    ])
  })))).apply(this, arguments)
}

function Z() {
  return (Z = r(e().mark((function r(t) {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.abrupt("return", V(t));
        case 1:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function ee() {
  return (ee = r(e().mark((function r(t) {
    var n, a;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!E() && !X) {
            e.next = 2;
            break
          }
          return e.abrupt("return", !0);
        case 2:
          if (n = z()) {
            e.next = 5;
            break
          }
          return e.abrupt("return", !1);
        case 5:
          return e.prev = 5, e.next = 8, I(t || 2e3);
        case 8:
          if (!(a = e.sent).decoded || a.decoded !== n) {
            e.next = 12;
            break
          }
          return X = !0, e.abrupt("return", !0);
        case 12:
          e.next = 16;
          break;
        case 14:
          e.prev = 14, e.t0 = e.catch(5);
        case 16:
          return e.abrupt("return", !1);
        case 17:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [5, 14]
    ])
  })))).apply(this, arguments)
}

function re(e, r, t, n) {
  return te.apply(this, arguments)
}

function te() {
  return (te = r(e().mark((function r(n, a, u, s) {
    var i, o, p, l, h, x, d;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (i = s || {}, o = getApp().globalData.slaveAddr || 22, Array.isArray(a) && 0 !== a.length) {
            e.next = 4;
            break
          }
          throw new Error("写入值不能为空");
        case 4:
          if (i.skipUnlock || E() || X) {
            e.next = 12;
            break
          }
          return e.next = 7, V();
        case 7:
          if (e.sent) {
            e.next = 12;
            break
          }
          throw (p = new Error("已取消，未通过密码校验")).needPassword = !0, p;
        case 12:
          if (l = a.map((function(e) {
              return 65535 & Number(e)
            })), !E()) {
            e.next = 15;
            break
          }
          return e.abrupt("return", {
            start: n,
            count: l.length,
            mock: !0
          });
        case 15:
          if (!i.noResponse) {
            e.next = 23;
            break
          }
          return e.next = 18, P(u || 1800);
        case 18:
          return h = c(o, n, l), M("[BMS TX no-response]", m(h)), e.next = 22, t.write(h);
        case 22:
          return e.abrupt("return", {
            start: n,
            count: l.length,
            noResponse: !0
          });
        case 23:
          return e.next = 25, R(c(o, n, l), f, u || 1800);
        case 25:
          if (x = e.sent, (d = b(x)).start === n) {
            e.next = 29;
            break
          }
          throw new Error("写入响应地址不匹配");
        case 29:
          if (null === d.count || d.count === l.length) {
            e.next = 31;
            break
          }
          throw new Error("写入响应数量不匹配");
        case 31:
          return e.abrupt("return", d);
        case 32:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function ne(e, r, t) {
  return ae.apply(this, arguments)
}

function ae() {
  return (ae = r(e().mark((function r(t, n, a) {
    var u, c;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!E()) {
            e.next = 2;
            break
          }
          return e.abrupt("return", {
            rc: 0,
            segmentSize: 128
          });
        case 2:
          return u = getApp().globalData.slaveAddr || 22, e.next = 5, N(s(u, 65535 & t, n >>> 0), a || 3e3);
        case 5:
          return c = e.sent, e.abrupt("return", x(c));
        case 7:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function ue(e, r, t) {
  return ce.apply(this, arguments)
}

function ce() {
  return (ce = r(e().mark((function r(t, n, a) {
    var u, c;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!E()) {
            e.next = 2;
            break
          }
          return e.abrupt("return", {
            id: 65535 & t
          });
        case 2:
          return u = getApp().globalData.slaveAddr || 22, e.next = 5, N(i(u, 65535 & t, n), a || 2500);
        case 5:
          return c = e.sent, e.abrupt("return", d(c));
        case 7:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function se(e, r) {
  return ie.apply(this, arguments)
}

function ie() {
  return (ie = r(e().mark((function r(t, n) {
    var a, u;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!E()) {
            e.next = 2;
            break
          }
          return e.abrupt("return", {
            rc: 0
          });
        case 2:
          return a = getApp().globalData.slaveAddr || 22, e.next = 5, N(o(a, t >>> 0), n || 5e3);
        case 5:
          return u = e.sent, e.abrupt("return", w(u));
        case 7:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function oe() {
  return (oe = r(e().mark((function r(t) {
    var n, a, u, c, s, i, o, p, f, l, h, b, x, d, w;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (n = t || {}, (a = new Uint8Array(n.firmware || [])).length) {
            e.next = 4;
            break
          }
          throw new Error("请选择固件文件");
        case 4:
          if (u = Number(n.version), !(!Number.isFinite(u) || u < 0 || u > 65535)) {
            e.next = 7;
            break
          }
          throw new Error("版本号无效");
        case 7:
          return e.next = 9, ne(u, a.length, n.timeoutMs || 5e3);
        case 9:
          if (0 === (c = e.sent).rc) {
            e.next = 12;
            break
          }
          throw new Error("BMS 拒绝升级，返回码 " + c.rc);
        case 12:
          if (c.segmentSize > 0) {
            e.next = 14;
            break
          }
          throw new Error("升级分包大小无效");
        case 14:
          s = Math.min(c.segmentSize, 253), i = 1, o = 0, p = n.packetRetry || 2, f = 0;
        case 19:
          if (!(f < a.length)) {
            e.next = 53;
            break
          }
          l = a.slice(f, Math.min(f + s, a.length)), h = void 0, b = 0;
        case 23:
          if (!(b <= p)) {
            e.next = 43;
            break
          }
          return e.prev = 24, e.next = 27, ue(i, l, n.timeoutMs || 3e3);
        case 27:
          if ((x = e.sent).id === i) {
            e.next = 30;
            break
          }
          throw new Error("升级包响应序号不匹配：发送 " + i + "，响应 " + x.id);
        case 30:
          return h = null, e.abrupt("break", 43);
        case 34:
          if (e.prev = 34, e.t0 = e.catch(24), h = e.t0, !(b < p)) {
            e.next = 40;
            break
          }
          return e.next = 40, U(180 + 120 * b);
        case 40:
          b++, e.next = 23;
          break;
        case 43:
          if (!h) {
            e.next = 45;
            break
          }
          throw h;
        case 45:
          return o += l.length, "function" == typeof n.onProgress && n.onProgress(o, a.length, i), i += 1, e.next = 50, U(n.packetDelayMs || 30);
        case 50:
          f += s, e.next = 19;
          break;
        case 53:
          return d = k(a) >>> 0, e.next = 56, se(d, n.finishTimeoutMs || 6e3);
        case 56:
          if (0 === (w = e.sent).rc) {
            e.next = 61;
            break
          }
          return e.next = 60, se(g(a), n.finishTimeoutMs || 6e3);
        case 60:
          w = e.sent;
        case 61:
          if (0 === w.rc) {
            e.next = 63;
            break
          }
          throw new Error("升级结束失败，返回码 " + w.rc);
        case 63:
          return e.abrupt("return", !0);
        case 64:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [24, 34]
    ])
  })))).apply(this, arguments)
}
module.exports = {
  readRegisters: q,
  writeRegisters: re,
  unlock: function(e) {
    return Z.apply(this, arguments)
  },
  unlockSilently: function(e) {
    return ee.apply(this, arguments)
  },
  ensureUnlocked: V,
  resetUnlock: function() {
    X = !1
  },
  resetPending: function() {
    v && (clearTimeout(v.timer), v.reject(new Error("BMS 请求已重置")), v = null), y = new Uint8Array(0)
  },
  isUnlocked: function() {
    return X
  },
  encodePassword: $,
  decodePassword: G,
  readDevicePassword: I,
  changePassword: function(e, r, t) {
    return K.apply(this, arguments)
  },
  otaRequest: ne,
  otaSendPacket: ue,
  otaFinish: se,
  otaRun: function(e) {
    return oe.apply(this, arguments)
  }
};