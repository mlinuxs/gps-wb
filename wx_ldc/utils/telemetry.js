var e = require("../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../@babel/runtime/helpers/asyncToGenerator"),
  r = require("./cloud"),
  n = require("./remote-command"),
  u = null,
  c = !1,
  a = 0,
  i = "",
  o = 0,
  s = null;

function l() {
  try {
    getApp().globalData.debugMode && console.log.apply(console, arguments)
  } catch (e) {}
}

function p() {
  try {
    return getApp().globalData
  } catch (e) {
    return null
  }
}

function m(e, t) {
  if (!e || !e.connected || e.mockMode || !e.bmsid) return !1;
  if (!r.isReady()) return !1;
  var n = Date.now(),
    u = e.connectionSeq || 0,
    c = e.bmsid !== i || u !== o;
  return !(!t && !c && n - a < 2e4) && (a = n, i = e.bmsid, o = u, !0)
}

function b(e) {
  return s && e ? s.bmsid !== e.bmsid || s.seq !== (e.connectionSeq || 0) || Date.now() - s.capturedAt > 12e3 ? null : s : null
}

function d(e) {
  var t = p();
  return !(!(e && t && t.connected) || t.mockMode || t.bmsid !== e.bmsid || (t.connectionSeq || 0) !== e.seq)
}

function f(e) {
  return q.apply(this, arguments)
}

function q() {
  return (q = t(e().mark((function t(r) {
    var u, i, o, s;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (!c) {
            e.next = 2;
            break
          }
          return e.abrupt("return", null);
        case 2:
          if (m(u = p(), !!r)) {
            e.next = 5;
            break
          }
          return e.abrupt("return", null);
        case 5:
          if (i = {
              bmsid: u.bmsid,
              seq: u.connectionSeq || 0
            }, c = !0, e.prev = 7, !(o = b(u))) {
            e.next = 15;
            break
          }
          return e.next = 12, n.reportMetrics(o.metrics, i);
        case 12:
          e.t0 = e.sent, e.next = 18;
          break;
        case 15:
          return e.next = 17, n.reportNow(i);
        case 17:
          e.t0 = e.sent;
        case 18:
          if (s = e.t0, d(i)) {
            e.next = 21;
            break
          }
          return e.abrupt("return", null);
        case 21:
          return l("[telemetry] report", u.bmsid, o ? "cache" : "read", s), e.abrupt("return", s);
        case 25:
          return e.prev = 25, e.t1 = e.catch(7), a = 0, l("[telemetry] failed", e.t1 && (e.t1.message || e.t1.errMsg || e.t1)), e.abrupt("return", null);
        case 30:
          return e.prev = 30, c = !1, e.finish(30);
        case 33:
        case "end":
          return e.stop()
      }
    }), t, null, [
      [7, 25, 30, 33]
    ])
  })))).apply(this, arguments)
}
module.exports = {
  start: function() {
    u || (u = setInterval((function() {
      return f(!1)
    }), 5e3), setTimeout((function() {
      return f(!0)
    }), 1500))
  },
  stop: function() {
    clearInterval(u), u = null
  },
  reset: function() {
    a = 0, i = "", o = 0, s = null
  },
  reportOnce: f,
  updateSnapshot: function(e) {
    var t = p();
    e && e.metrics && t && t.bmsid && (s = {
      bmsid: t.bmsid,
      seq: t.connectionSeq || 0,
      metrics: e.metrics,
      capturedAt: Date.now()
    })
  }
};