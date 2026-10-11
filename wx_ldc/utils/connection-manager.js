var e = require("../@babel/runtime/helpers/regeneratorRuntime"),
  n = require("../@babel/runtime/helpers/asyncToGenerator"),
  t = require("./ble"),
  r = require("./bms-client"),
  c = require("./cloud"),
  a = require("./remote-command"),
  i = require("./telemetry"),
  u = null,
  o = [],
  s = !1,
  d = !1,
  p = !1,
  f = -1,
  v = {},
  l = -1,
  b = {},
  m = 0;

function k() {
  try {
    getApp().globalData.debugMode && console.log.apply(console, arguments)
  } catch (e) {}
}

function x(e) {
  return String(e || "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function I(e, n, t) {
  var r = x(n),
    c = x(t);
  return [e.deviceId, e.name, e.localName].map(x).filter(Boolean).some((function(e) {
    return r && (e === r || e.indexOf(r) >= 0 || r.indexOf(e) >= 0) || c && (e === c || e.indexOf(c) >= 0 || c.indexOf(e) >= 0)
  }))
}

function h() {
  return getApp().globalData
}

function g() {
  var e = h();
  return {
    connected: !!e.connected,
    deviceId: e.deviceId || "",
    deviceName: e.deviceName || "",
    connectionSeq: e.connectionSeq || 0,
    connectionStatus: e.connectionStatus || (e.connected ? "已连接：" : "离线："),
    connecting: d,
    reconnecting: s
  }
}

function S() {
  u && u(g()), o.slice().forEach((function(e) {
    return e(g())
  }))
}

function y(e) {
  Object.assign(h(), e), S()
}

function w(e) {
  if (e && e.deviceId) try {
    wx.setStorageSync("bms_last_connected_device", {
      deviceId: e.deviceId,
      deviceName: e.name || e.deviceName || e.deviceId,
      savedAt: Date.now()
    })
  } catch (e) {}
}

function N() {
  try {
    wx.removeStorageSync("bms_last_connected_device")
  } catch (e) {}
}

function T(e) {
  if (!(e instanceof Date) || Number.isNaN(e.getTime())) return null;
  var n = e.getFullYear() - 2022;
  return n < 0 || n > 255 ? null : [(255 & n) << 8 | e.getMonth() + 1 & 255, (255 & e.getDate()) << 8 | 255 & e.getHours(), (255 & e.getMinutes()) << 8 | 255 & e.getSeconds()]
}

function D(e, n) {
  return q.apply(this, arguments)
}

function q() {
  return (q = n(e().mark((function n(t, c) {
    var a;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (f !== t) {
            e.next = 2;
            break
          }
          return e.abrupt("return");
        case 2:
          if (a = T(new Date)) {
            e.next = 5;
            break
          }
          return e.abrupt("return");
        case 5:
          if (e.prev = 5, j(t, c) && h().connected) {
            e.next = 8;
            break
          }
          return e.abrupt("return");
        case 8:
          return e.next = 10, r.readDevicePassword(2e3);
        case 10:
          if (j(t, c) && h().connected) {
            e.next = 12;
            break
          }
          return e.abrupt("return");
        case 12:
          return e.next = 14, r.writeRegisters(256, a, 1800, {
            skipUnlock: !0,
            noResponse: !0
          });
        case 14:
          return f = t, k("[BMS time sync] ok", t), e.abrupt("return", !0);
        case 19:
          return e.prev = 19, e.t0 = e.catch(5), k("[BMS time sync] failed", e.t0 && (e.t0.errMsg || e.t0.message || e.t0)), e.abrupt("return", !1);
        case 23:
        case "end":
          return e.stop()
      }
    }), n, null, [
      [5, 19]
    ])
  })))).apply(this, arguments)
}

function O(t, r, c, a) {
  clearTimeout(v[t]), v[t] = setTimeout(n(e().mark((function n() {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (delete v[t], j(t, r) && h().connected && f !== t) {
            e.next = 3;
            break
          }
          return e.abrupt("return");
        case 3:
          return e.next = 5, D(t, r);
        case 5:
          !e.sent && a > 1 && j(t, r) && h().connected && O(t, r, 1500, a - 1);
        case 7:
        case "end":
          return e.stop()
      }
    }), n)
  }))), c || 3500)
}

function M(e) {
  if (!e || !e.length) return "";
  for (var n = [], t = 0; t < e.length; t++) {
    var r = 255 & e[t];
    if (0 === r) break;
    n.push(String.fromCharCode(r))
  }
  return n.join("").trim()
}

function P(e) {
  y(Object.assign({
    connected: !1,
    connectionStatus: "离线："
  }, e || {}))
}

function _(e, n) {
  return A.apply(this, arguments)
}

function A() {
  return (A = n(e().mark((function n(t, u) {
    var o, s, d, p;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (l !== t) {
            e.next = 2;
            break
          }
          return e.abrupt("return", !0);
        case 2:
          if (c.isReady()) {
            e.next = 4;
            break
          }
          return e.abrupt("return", !1);
        case 4:
          if (e.prev = 4, j(t, u) && h().connected) {
            e.next = 7;
            break
          }
          return e.abrupt("return", !1);
        case 7:
          return e.next = 9, r.readRegisters(2052, 12, 3500);
        case 9:
          if (o = e.sent, s = M(o)) {
            e.next = 13;
            break
          }
          return e.abrupt("return", !1);
        case 13:
          if (j(t, u)) {
            e.next = 15;
            break
          }
          return e.abrupt("return", !1);
        case 15:
          return (d = h()).bmsid = s, s, e.next = 20, c.bindDevice({
            bmsid: s,
            deviceId: d.deviceId || u,
            deviceName: d.deviceName || ""
          });
        case 20:
          if ((p = e.sent) && !0 === p.ok) {
            e.next = 24;
            break
          }
          return k("[BMS cloud bind] rejected", t, s, p && p.error), e.abrupt("return", !1);
        case 24:
          return l = t, k("[BMS cloud bind] ok", t, s), i.reportOnce(!0), a.pollOnce(), e.abrupt("return", !0);
        case 31:
          return e.prev = 31, e.t0 = e.catch(4), "function" == typeof r.resetPending && r.resetPending(), k("[BMS cloud bind] failed", e.t0 && (e.t0.errMsg || e.t0.message || e.t0)), e.abrupt("return", !1);
        case 36:
        case "end":
          return e.stop()
      }
    }), n, null, [
      [4, 31]
    ])
  })))).apply(this, arguments)
}

function C(t, r, a, i) {
  c.isReady() && (clearTimeout(b[t]), b[t] = setTimeout(n(e().mark((function n() {
    var c;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (delete b[t], j(t, r) && h().connected && l !== t) {
            e.next = 3;
            break
          }
          return e.abrupt("return");
        case 3:
          return e.next = 5, _(t, r);
        case 5:
          !e.sent && i > 1 && j(t, r) && h().connected && (c = Math.min(Math.max(a || 5e3, 5e3) + 5e3, 3e4), C(t, r, c, i - 1));
        case 7:
        case "end":
          return e.stop()
      }
    }), n)
  }))), a || 5e3))
}

function U(e, n) {
  return E.apply(this, arguments)
}

function E() {
  return (E = n(e().mark((function n(r, c) {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return c && (u = c), e.next = 3, t.init(r);
        case 3:
          return R(), e.abrupt("return", !0);
        case 5:
        case "end":
          return e.stop()
      }
    }), n)
  })))).apply(this, arguments)
}

function R() {
  p || (p = !0, t.onConnectionStateChange((function(e) {
    var n = h();
    if (e.connected && n.deviceId && e.deviceId !== n.deviceId) t.disconnectDevice(e.deviceId);
    else if (!(e.connected || n.deviceId && e.deviceId !== n.deviceId)) {
      if (d || s) return r.resetPending(), void r.resetUnlock();
      r.resetPending(), r.resetUnlock(), f = -1, Object.keys(v).forEach((function(e) {
        return clearTimeout(v[e])
      })), v = {}, l = -1, Object.keys(b).forEach((function(e) {
        return clearTimeout(b[e])
      })), b = {}, n.bmsid = "", P()
    }
  })))
}

function j(e, n) {
  var t, r, c = h();
  return (c.connectionSeq || 0) === e && (t = c.deviceId, r = n, String(t || "") === String(r || ""))
}

function B(e) {
  var n = h(),
    c = n.deviceId || "",
    a = (n.connectionSeq || 0) + 1;
  return d = !0, s = !1, t.cancelPendingOperations(), r.resetPending(), r.resetUnlock(), l = -1, y({
    connectionSeq: a,
    connected: !1,
    deviceId: e.deviceId,
    deviceName: e.name || e.deviceId,
    bmsid: "",
    connectionStatus: "离线："
  }), {
    seq: a,
    previousDeviceId: c
  }
}

function F() {
  return (F = n(e().mark((function r(c, a) {
    var i, u, o, s, p, f;
    return e().wrap((function(r) {
      for (;;) switch (r.prev = r.next) {
        case 0:
          if (f = function() {
              return (f = n(e().mark((function n(r) {
                return e().wrap((function(e) {
                  for (;;) switch (e.prev = e.next) {
                    case 0:
                      if (!i.mock && !c.mock) {
                        e.next = 8;
                        break
                      }
                      if (j(s, c.deviceId)) {
                        e.next = 3;
                        break
                      }
                      return e.abrupt("return", {
                        ok: !1,
                        cancelled: !0
                      });
                    case 3:
                      return d = !1, y({
                        connected: !0,
                        deviceName: u,
                        connectionStatus: "已连接："
                      }), w({
                        deviceId: c.deviceId,
                        name: u
                      }), O(s, c.deviceId, 9e3, 4), e.abrupt("return", {
                        ok: !0,
                        mock: !0
                      });
                    case 8:
                      return e.next = 10, t.connect(c.deviceId, i.timeoutMs);
                    case 10:
                      if (j(s, c.deviceId)) {
                        e.next = 14;
                        break
                      }
                      return e.next = 13, t.disconnectDevice(c.deviceId);
                    case 13:
                      return e.abrupt("return", {
                        ok: !1,
                        cancelled: !0
                      });
                    case 14:
                      return d = !1, y({
                        connected: !0,
                        deviceName: u,
                        connectionStatus: "已连接："
                      }), w({
                        deviceId: c.deviceId,
                        name: u
                      }), O(s, c.deviceId, 9e3, 4), C(s, c.deviceId, 6e3, 4), e.abrupt("return", {
                        ok: !0
                      });
                    case 20:
                    case "end":
                      return e.stop()
                  }
                }), n)
              })))).apply(this, arguments)
            }, p = function(e) {
              return f.apply(this, arguments)
            }, i = a || {}, u = c.name || c.deviceId, o = B({
              deviceId: c.deviceId,
              name: u
            }), s = o.seq, o.previousDeviceId, (m += 1) % 8 != 0 || "function" != typeof t.resetAdapter) {
            r.next = 14;
            break
          }
          return r.prev = 7, r.next = 10, t.resetAdapter();
        case 10:
          r.next = 14;
          break;
        case 12:
          r.prev = 12, r.t0 = r.catch(7);
        case 14:
          return r.prev = 14, r.next = 17, p(!1);
        case 17:
          return r.abrupt("return", r.sent);
        case 20:
          if (r.prev = 20, r.t1 = r.catch(14), j(s, c.deviceId)) {
            r.next = 24;
            break
          }
          return r.abrupt("return", {
            ok: !1,
            cancelled: !0
          });
        case 24:
          if ("function" != typeof t.resetAdapter) {
            r.next = 32;
            break
          }
          return r.prev = 25, r.next = 28, t.resetAdapter();
        case 28:
          r.next = 32;
          break;
        case 30:
          r.prev = 30, r.t2 = r.catch(25);
        case 32:
          if (j(s, c.deviceId)) {
            r.next = 34;
            break
          }
          return r.abrupt("return", {
            ok: !1,
            cancelled: !0
          });
        case 34:
          return r.prev = 34, r.next = 37, p(!0);
        case 37:
          return r.abrupt("return", r.sent);
        case 40:
          return r.prev = 40, r.t3 = r.catch(34), j(s, c.deviceId) && P({
            deviceName: u
          }), r.abrupt("return", {
            ok: !1,
            error: r.t3
          });
        case 44:
          return r.prev = 44, j(s, c.deviceId) && (d = !1, S()), r.finish(44);
        case 47:
        case "end":
          return r.stop()
      }
    }), r, null, [
      [7, 12],
      [14, 20, 44, 47],
      [25, 30],
      [34, 40]
    ])
  })))).apply(this, arguments)
}

function L() {
  return (L = n(e().mark((function n(c) {
    var a, i, u, o, p, f, v, l, b, m;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return a = c || {}, i = h(), e.next = 4, U(a.onFound || null);
        case 4:
          if (u = i.connectionSeq || 0, o = i.deviceId || "", p = i.deviceName || "", !(!o || !a.force && i.connected || d || s || a.mock)) {
            e.next = 9;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            skipped: !0
          });
        case 9:
          s = !0, r.resetPending(), r.resetUnlock(), y({
            connectionStatus: "重连中："
          }), f = a.directAttempts || 2, v = a.timeoutMs || 3e3, e.prev = 15, l = 0;
        case 17:
          if (!(l < f)) {
            e.next = 39;
            break
          }
          if (j(u, o)) {
            e.next = 20;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            cancelled: !0
          });
        case 20:
          return e.prev = 20, e.next = 23, t.connect(o, v);
        case 23:
          if (j(u, o)) {
            e.next = 27;
            break
          }
          return e.next = 26, t.disconnectDevice(o);
        case 26:
          return e.abrupt("return", {
            ok: !1,
            cancelled: !0
          });
        case 27:
          return y({
            connected: !0,
            deviceId: o,
            deviceName: p,
            connectionStatus: "已连接："
          }), w({
            deviceId: o,
            name: p
          }), O(u, o, 9e3, 4), C(u, o, 6e3, 4), e.abrupt("return", {
            ok: !0
          });
        case 34:
          e.prev = 34, e.t0 = e.catch(20);
        case 36:
          l++, e.next = 17;
          break;
        case 39:
          if (!(b = a.findDevice || function(e, n, t) {
              return G(e, n, t, a.scanTimeoutMs)
            }) || !j(u, o)) {
            e.next = 58;
            break
          }
          return e.next = 43, b(o, p, u);
        case 43:
          if (m = e.sent, j(u, o)) {
            e.next = 46;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            cancelled: !0
          });
        case 46:
          if (!m || !m.deviceId) {
            e.next = 58;
            break
          }
          return e.next = 49, t.connect(m.deviceId, v);
        case 49:
          if (j(u, o)) {
            e.next = 53;
            break
          }
          return e.next = 52, t.disconnectDevice(m.deviceId);
        case 52:
          return e.abrupt("return", {
            ok: !1,
            cancelled: !0
          });
        case 53:
          return y({
            connected: !0,
            deviceId: o,
            deviceName: m.name || p,
            connectionStatus: "已连接："
          }), w({
            deviceId: o,
            name: m.name || p
          }), O(u, o, 9e3, 4), C(u, o, 6e3, 4), e.abrupt("return", {
            ok: !0
          });
        case 58:
          return j(u, o) && P(), e.abrupt("return", {
            ok: !1
          });
        case 60:
          return e.prev = 60, s = !1, S(), e.finish(60);
        case 64:
        case "end":
          return e.stop()
      }
    }), n, null, [
      [15, , 60, 64],
      [20, 34]
    ])
  })))).apply(this, arguments)
}

function G(e, n, t, r) {
  return z.apply(this, arguments)
}

function z() {
  return (z = n(e().mark((function n(r, c, a, i) {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (j(a, r)) {
            e.next = 2;
            break
          }
          return e.abrupt("return", null);
        case 2:
          return e.next = 4, U(null);
        case 4:
          return e.abrupt("return", new Promise((function(e) {
            var n = !1,
              u = function(r) {
                n || (n = !0, o(), clearTimeout(s), clearInterval(d), t.stopScan(), e(r || null))
              },
              o = t.onDeviceFound((function(e) {
                j(a, r) ? I(e, r, c) && u(e) : u(null)
              })),
              s = setTimeout((function() {
                return u(null)
              }), i || 5e3),
              d = setInterval((function() {
                j(a, r) || u(null)
              }), 200);
            t.startScan(!1).catch((function() {
              return u(null)
            }))
          })));
        case 5:
        case "end":
          return e.stop()
      }
    }), n)
  })))).apply(this, arguments)
}

function H() {
  return (H = n(e().mark((function n(c) {
    var a, i;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return a = c || {}, d = !1, s = !1, t.cancelPendingOperations(), r.resetPending(), r.resetUnlock(), e.next = 8, t.disconnect();
        case 8:
          return e.next = 10, new Promise((function(e) {
            return setTimeout(e, 100)
          }));
        case 10:
          i = {}, a.clearTarget && (i.deviceId = "", i.deviceName = "", i.connectionSeq = (h().connectionSeq || 0) + 1, N()), P(i);
        case 13:
        case "end":
          return e.stop()
      }
    }), n)
  })))).apply(this, arguments)
}
module.exports = {
  STATUS_CONNECTED: "已连接：",
  STATUS_RECONNECTING: "重连中：",
  STATUS_OFFLINE: "离线：",
  init: U,
  installConnectionListener: R,
  subscribe: function(e) {
    return "function" != typeof e ? function() {} : (o.indexOf(e) < 0 && o.push(e), e(g()), function() {
      o = o.filter((function(n) {
        return n !== e
      }))
    })
  },
  getState: g,
  connectDevice: function(e, n) {
    return F.apply(this, arguments)
  },
  reconnect: function(e) {
    return L.apply(this, arguments)
  },
  disconnect: function(e) {
    return H.apply(this, arguments)
  },
  restoreLastDevice: function() {
    var e = null;
    try {
      e = wx.getStorageSync("bms_last_connected_device")
    } catch (n) {
      e = null
    }
    if (!e || !e.deviceId) return !1;
    var n = h();
    return n.deviceId || y({
      connected: !1,
      connectionSeq: (n.connectionSeq || 0) + 1,
      deviceId: e.deviceId,
      deviceName: e.deviceName || e.deviceId,
      connectionStatus: "离线：",
      restoredLastDevice: !0
    }), !0
  },
  isCurrent: j
};