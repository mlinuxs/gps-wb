var e = require("../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../@babel/runtime/helpers/typeof"),
  t = require("../@babel/runtime/helpers/createForOfIteratorHelper"),
  n = require("../@babel/runtime/helpers/asyncToGenerator"),
  a = require("./cloud"),
  u = require("./bms-client"),
  i = require("./protocol"),
  s = require("./location"),
  c = require("./registers"),
  o = c.CELL_TYPES,
  l = c.ALARM_BITS,
  p = c.decodeBits,
  m = [
    [0, "过压保护"],
    [1, "欠压保护"],
    [2, "放电过流2保护"],
    [3, "放电过流1保护"],
    [4, "充电过流保护"],
    [5, "短路保护"],
    [6, "断线保护"],
    [7, "低压禁充保护"],
    [8, "充电低温保护"],
    [9, "充电高温保护"],
    [10, "放电低温保护"],
    [11, "放电高温保护"],
    [18, "硬件放电保护"],
    [19, "硬件充电保护"],
    [20, "PRO状态"],
    [21, "CTLD状态"],
    [22, "PD状态"]
  ],
  d = [
    [0, "超高压报警"],
    [1, "超低压报警"],
    [2, "防拆卸报警"],
    [3, "电压线断线"],
    [4, "温度线断线"],
    [5, "AFE 通讯失效"],
    [6, "压差过大"]
  ],
  f = [
    [0, "零电流未校准", !1],
    [1, "电流未校准", !1],
    [2, "强制开启放电", !0],
    [3, "手动关闭放电", !0],
    [4, "强制开启充电", !0],
    [5, "手动关闭充电", !0],
    [6, "电池加热中", !0],
    [8, "满充电", !0],
    [10, "允许容量更新", !0],
    [13, "AFE 配置失败", !0],
    [15, "固件未解锁", !0]
  ],
  b = null,
  h = !1,
  v = !1,
  x = {};

function k() {
  try {
    getApp().globalData.debugMode && console.log.apply(console, arguments)
  } catch (e) {}
}

function g() {
  try {
    return getApp().globalData
  } catch (e) {
    return null
  }
}

function y() {
  var e = g();
  return e && e.connected && !e.mockMode && e.bmsid ? {
    bmsid: e.bmsid,
    seq: e.connectionSeq || 0
  } : null
}

function w(e) {
  var r = g();
  return !(!(e && r && r.connected) || r.mockMode || r.bmsid !== e.bmsid || (r.connectionSeq || 0) !== e.seq)
}

function M(e, r) {
  return Math.floor((e >>> 0) / Math.pow(2, r)) % 2 == 1
}

function N(e, r) {
  return r.filter((function(r) {
    return M(e, r[0]) === (!(r.length > 2) || r[2])
  })).map((function(e) {
    return e[1]
  }))
}

function _(e) {
  for (var r = i.u32(e, 4) / 1e3, t = i.i32(e, 6) / 1e3, n = i.u32(e, 8), a = i.u16(e, 20), u = i.u16(e, 19), s = i.u16(e, 24), c = s >> 8 & 255, b = 10 * i.u16(e, 27), h = 10 * i.u16(e, 28), v = [], x = 0; x < Math.max(0, Math.min(c, 32)); x++) {
    var k = i.u16(e, 32 + x);
    v.push(k)
  }
  var g = v.length ? Math.max.apply(null, v) : 0,
    y = v.length ? Math.min.apply(null, v) : 0,
    w = i.u32(e, 12),
    _ = i.u16(e, 14),
    C = i.u16(e, 15);
  return {
    voltage: Number(r.toFixed(3)),
    current: Number(t.toFixed(3)),
    soc: 255 & a,
    soh: a >> 8 & 255,
    firmware: "v" + (u >> 8 & 255) + "." + String(255 & u).padStart(2, "0"),
    maxMv: g,
    minMv: y,
    deltaMv: v.length ? g - y : 0,
    cellCount: c,
    cellTypeCode: 255 & s,
    cellType: o[255 & s] || "未知",
    cellVoltages: v.slice(),
    mosTemp: Number(i.k2c(i.u16(e, 0)).toFixed(1)),
    temp1: Number(i.k2c(i.u16(e, 1)).toFixed(1)),
    temp2: Number(i.k2c(i.u16(e, 2)).toFixed(1)),
    remainCap: n,
    remainAh: Number((n / 1e3).toFixed(1)),
    fullCap: b,
    fullAh: Number((b / 1e3).toFixed(1)),
    designCap: h,
    designAh: Number((h / 1e3).toFixed(1)),
    cycle: i.u16(e, 26),
    chargeMos: M(w, 17),
    dischargeMos: M(w, 16),
    alarms: p(_, l),
    protectStatus: N(w, m),
    alarmStatusItems: N(_, d),
    packStatus: N(C, f)
  }
}

function C(e) {
  return F.apply(this, arguments)
}

function F() {
  return (F = n(e().mark((function r(t) {
    var n, i, c;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (w(n = t || y())) {
            e.next = 3;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "设备状态已变化，取消上报"
          });
        case 3:
          return e.next = 5, u.readRegisters(0, 64, 3500);
        case 5:
          if (i = e.sent, w(n)) {
            e.next = 8;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "设备已切换，取消上报"
          });
        case 8:
          return e.next = 10, s.getLocation();
        case 10:
          return c = e.sent, e.abrupt("return", a.reportTelemetry({
            bmsid: n.bmsid,
            metrics: _(i),
            location: c
          }));
        case 12:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function q() {
  return (q = n(e().mark((function r(t, n) {
    var u, i;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (w(u = n || y())) {
            e.next = 3;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "设备状态已变化，取消上报"
          });
        case 3:
          return e.next = 5, s.getLocation();
        case 5:
          if (i = e.sent, w(u)) {
            e.next = 8;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "设备已切换，取消上报"
          });
        case 8:
          return e.abrupt("return", a.reportTelemetry({
            bmsid: u.bmsid,
            metrics: t || {},
            location: i
          }));
        case 9:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function A(e, r, t) {
  return S.apply(this, arguments)
}

function S() {
  return (S = n(e().mark((function r(t, n, u) {
    var i;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (t) {
            e.next = 2;
            break
          }
          return e.abrupt("return", !0);
        case 2:
          return e.next = 4, a.finishCommand({
            commandId: t,
            success: !!n,
            result: u || ""
          });
        case 4:
          if (!(i = e.sent) || !0 !== i.ok) {
            e.next = 8;
            break
          }
          return delete x[t], e.abrupt("return", !0);
        case 8:
          return x[t] = {
            success: !!n,
            result: u || ""
          }, e.abrupt("return", !1);
        case 10:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function T(e) {
  var n = String(e.action || "").trim();
  if ("lock" === n) return {
    writes: [{
      addr: 2051,
      values: [1]
    }],
    label: "锁定电池"
  };
  if ("unlock" === n) return {
    writes: [{
      addr: 2051,
      values: [0]
    }],
    label: "解锁电池"
  };
  if ("writeRegister" === n) {
    var a = Number(e.addr),
      u = Number(e.value);
    return Number.isFinite(a) && Number.isFinite(u) ? {
      writes: [{
        addr: 65535 & a,
        values: [65535 & u]
      }],
      label: "写寄存器 0x" + (65535 & a).toString(16)
    } : null
  }
  if ("writeRegisters" === n) {
    var i = function(e) {
      if (!Array.isArray(e) || !e.length) return null;
      var n, a = [],
        u = t(e);
      try {
        for (u.s(); !(n = u.n()).done;) {
          var i = n.value;
          if (!i || "object" !== r(i)) return null;
          var s = Number(i.addr);
          if (!Number.isFinite(s)) return null;
          var c = Array.isArray(i.values) ? i.values : [i.value];
          if (!c.length) return null;
          var o, l = [],
            p = t(c);
          try {
            for (p.s(); !(o = p.n()).done;) {
              var m = o.value,
                d = Number(m);
              if (!Number.isFinite(d)) return null;
              l.push(65535 & d)
            }
          } catch (e) {
            p.e(e)
          } finally {
            p.f()
          }
          a.push({
            addr: 65535 & s,
            values: l
          })
        }
      } catch (e) {
        u.e(e)
      } finally {
        u.f()
      }
      return a
    }(e.writes);
    return i ? {
      writes: i,
      label: e.label || "快速设置"
    } : null
  }
  return null
}

function R(e, r) {
  return I.apply(this, arguments)
}

function I() {
  return (I = n(e().mark((function r(n, a) {
    var i, s, c, o, l, p;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (w(a)) {
            e.next = 2;
            break
          }
          return e.abrupt("return");
        case 2:
          if (!(n && n._id && x[n._id])) {
            e.next = 9;
            break
          }
          return i = x[n._id], e.next = 6, A(n._id, i.success, i.result);
        case 6:
          return e.sent || k("[remote cmd] finishCommand retry failed", n._id), e.abrupt("return");
        case 9:
          if (s = T(n), "reportNow" !== String(n.action || "").trim()) {
            e.next = 28;
            break
          }
          return e.prev = 11, e.next = 14, C(a);
        case 14:
          return c = e.sent, e.next = 17, A(n._id, !(!c || !c.ok), c && c.ok ? "读取并上报成功" : c && c.error || "读取上报失败");
        case 17:
          e.sent || k("[remote cmd] finishCommand 回执失败(reportNow)", n._id), e.next = 27;
          break;
        case 21:
          return e.prev = 21, e.t0 = e.catch(11), e.next = 25, A(n._id, !1, e.t0 && (e.t0.message || e.t0.errMsg) || "读取上报失败");
        case 25:
          e.sent || k("[remote cmd] finishCommand 回执失败(reportNow失败)", n._id);
        case 27:
          return e.abrupt("return");
        case 28:
          if (s) {
            e.next = 34;
            break
          }
          return e.next = 31, A(n._id, !1, "未知指令");
        case 31:
          return e.sent || k("[remote cmd] finishCommand 回执失败(未知指令)", n._id), e.abrupt("return");
        case 34:
          e.prev = 34, o = t(s.writes), e.prev = 36, o.s();
        case 38:
          if ((l = o.n()).done) {
            e.next = 46;
            break
          }
          if (p = l.value, w(a)) {
            e.next = 42;
            break
          }
          return e.abrupt("return");
        case 42:
          return e.next = 44, u.writeRegisters(p.addr, p.values, 2e3, {
            skipUnlock: !0
          });
        case 44:
          e.next = 38;
          break;
        case 46:
          e.next = 51;
          break;
        case 48:
          e.prev = 48, e.t1 = e.catch(36), o.e(e.t1);
        case 51:
          return e.prev = 51, o.f(), e.finish(51);
        case 54:
          return e.next = 56, A(n._id, !0, s.label + " 成功");
        case 56:
          e.sent || k("[remote cmd] finishCommand 回执失败(成功但未回写)", n._id), k("[remote cmd] done", n._id, s.label), e.next = 69;
          break;
        case 61:
          return e.prev = 61, e.t2 = e.catch(34), "function" == typeof u.resetPending && u.resetPending(), e.next = 66, A(n._id, !1, e.t2 && (e.t2.message || e.t2.errMsg) || "执行失败");
        case 66:
          e.sent || k("[remote cmd] finishCommand 回执失败(执行失败)", n._id), k("[remote cmd] failed", n._id, e.t2 && (e.t2.message || e.t2.errMsg || e.t2));
        case 69:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [11, 21],
      [34, 61],
      [36, 48, 51, 54]
    ])
  })))).apply(this, arguments)
}

function L() {
  return P.apply(this, arguments)
}

function P() {
  return (P = n(e().mark((function r() {
    var t, n, u, i;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!v) {
            e.next = 2;
            break
          }
          return e.abrupt("return");
        case 2:
          if (t = y()) {
            e.next = 5;
            break
          }
          return e.abrupt("return");
        case 5:
          if (a.isReady()) {
            e.next = 7;
            break
          }
          return e.abrupt("return");
        case 7:
          return v = !0, e.prev = 8, e.next = 11, a.getPendingCommands(t.bmsid);
        case 11:
          n = e.sent, u = n && n.commands || [], i = 0;
        case 14:
          if (!(i < u.length)) {
            e.next = 22;
            break
          }
          if (w(t)) {
            e.next = 17;
            break
          }
          return e.abrupt("break", 22);
        case 17:
          return e.next = 19, R(u[i], t);
        case 19:
          i++, e.next = 14;
          break;
        case 22:
          e.next = 27;
          break;
        case 24:
          e.prev = 24, e.t0 = e.catch(8), k("[remote cmd] poll error", e.t0 && (e.t0.message || e.t0.errMsg || e.t0));
        case 27:
          return e.prev = 27, v = !1, e.finish(27);
        case 30:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [8, 24, 27, 30]
    ])
  })))).apply(this, arguments)
}
module.exports = {
  start: function() {
    h || a.isReady() && (h = !0, clearInterval(b), b = setInterval(L, 8e3), setTimeout(L, 1500))
  },
  stop: function() {
    h = !1, clearInterval(b), b = null
  },
  pollOnce: L,
  reportNow: C,
  reportMetrics: function(e, r) {
    return q.apply(this, arguments)
  }
};