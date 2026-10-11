var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("../../utils/bms-client"),
  a = require("../../utils/protocol");
Page({
  data: {
    cells: [],
    min: "--",
    max: "--",
    delta: "--",
    avg: "--",
    maxBar: 5e3,
    error: ""
  },
  onShow: function() {
    this.refresh()
  },
  refresh: function() {
    var n = this;
    return t(e().mark((function t() {
      var s, l, i, u, c, h, o, m, g, p;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return n.setData({
              error: "请先绑定 BMS。",
              cells: [],
              min: "--",
              max: "--",
              delta: "--",
              avg: "--"
            }), e.abrupt("return");
          case 4:
            return e.prev = 4, e.next = 7, r.readRegisters(24, 1);
          case 7:
            if (s = e.sent, !(l = Math.max(0, Math.min(a.u16(s, 0) >> 8 & 255, 32)))) {
              e.next = 15;
              break
            }
            return e.next = 12, r.readRegisters(32, l);
          case 12:
            e.t0 = e.sent, e.next = 16;
            break;
          case 15:
            e.t0 = [];
          case 16:
            for (i = e.t0, u = [], c = 0; c < l; c++) h = a.u16(i, c), u.push({
              index: c + 1,
              mv: h
            });
            o = u.map((function(e) {
              return e.mv
            })), m = o.length ? Math.min.apply(null, o) : 0, g = o.length ? Math.max.apply(null, o) : 0, p = o.length ? Math.round(o.reduce((function(e, t) {
              return e + t
            }), 0) / o.length) : 0, u.forEach((function(e) {
              e.isMin = !!o.length && e.mv === m, e.isMax = !!o.length && e.mv === g
            })), n.setData({
              error: "",
              cells: u,
              min: o.length ? m : "--",
              max: o.length ? g : "--",
              delta: o.length ? g - m : "--",
              avg: o.length ? p : "--",
              maxBar: g || 5e3
            }), e.next = 30;
            break;
          case 27:
            e.prev = 27, e.t1 = e.catch(4), n.setData({
              error: e.t1.message || String(e.t1)
            });
          case 30:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [4, 27]
      ])
    })))()
  }
});