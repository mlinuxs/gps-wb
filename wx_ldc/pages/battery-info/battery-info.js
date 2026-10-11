var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  n = require("../../utils/bms-client"),
  t = require("../../utils/protocol"),
  a = require("../../utils/theme");

function u() {
  return s.apply(this, arguments)
}

function s() {
  return (s = r(e().mark((function r() {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.prev = 0, e.next = 3, n.readRegisters(2052, 12, 3500);
        case 3:
          return e.abrupt("return", e.sent);
        case 6:
          return e.prev = 6, e.t0 = e.catch(0), "function" == typeof n.resetPending && n.resetPending(), e.abrupt("return", null);
        case 10:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [0, 6]
    ])
  })))).apply(this, arguments)
}

function o(e, r, n) {
  return c.map((function(t) {
    return {
      addr: t.addr,
      name: t.name,
      value: t.read(i(t.source, e, r, n))
    }
  }))
}

function i(e, r, n, t) {
  return "info" === e ? r : "device" === e ? t : n
}
Page({
  data: {
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    connected: !1,
    loading: !1,
    rows: [],
    status: ""
  },
  onLoad: function() {
    this.unsubscribeTheme = a.subscribe(this), a.sync(this)
  },
  onShow: function() {
    this.refresh()
  },
  onUnload: function() {
    this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTheme = null
  },
  refresh: function() {
    var t = this;
    return r(e().mark((function r() {
      var a, s, i, c;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (a = getApp().globalData.connected, t.setData({
                connected: a,
                status: ""
              }), a) {
              e.next = 5;
              break
            }
            return t.setData({
              rows: [],
              loading: !1
            }), e.abrupt("return");
          case 5:
            return t.setData({
              loading: !0
            }), e.prev = 6, e.next = 9, n.readRegisters(560, 42, 2500);
          case 9:
            return s = e.sent, e.next = 12, n.readRegisters(1024, 24, 2500);
          case 12:
            return i = e.sent, e.next = 15, u();
          case 15:
            c = e.sent, t.setData({
              rows: o(s, i, c),
              loading: !1
            }), e.next = 22;
            break;
          case 19:
            e.prev = 19, e.t0 = e.catch(6), t.setData({
              rows: [],
              loading: !1,
              status: e.t0.message || String(e.t0)
            });
          case 22:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [6, 19]
      ])
    })))()
  }
});
var c = [{
  addr: "0x0804",
  name: "BMSID",
  source: "device",
  read: function(e) {
    return d(e, 0, 24)
  }
}, {
  addr: "0x0230",
  name: "电池 SN",
  source: "info",
  read: function(e) {
    return d(e, 0, 12)
  }
}, {
  addr: "0x0236",
  name: "制造厂商",
  source: "info",
  read: function(e) {
    return d(e, 12, 8)
  }
}, {
  addr: "0x023A",
  name: "厂商型号",
  source: "info",
  read: function(e) {
    return d(e, 20, 24)
  }
}, {
  addr: "0x0246",
  name: "客户名称",
  source: "info",
  read: function(e) {
    return d(e, 44, 8)
  }
}, {
  addr: "0x024A",
  name: "客户型号",
  source: "info",
  read: function(e) {
    return d(e, 52, 24)
  }
}, {
  addr: "0x0256",
  name: "版本日期",
  source: "info",
  read: function(e) {
    return d(e, 76, 8)
  }
}, {
  addr: "0x0401",
  name: "循环次数",
  source: "record",
  read: function(e) {
    return t.u16(e, 1) + " 次"
  }
}, {
  addr: "0x0402",
  name: "满充容量",
  source: "record",
  read: function(e) {
    return t.u32(e, 2) + " mAh"
  }
}, {
  addr: "0x0406",
  name: "最长未充电间隔",
  source: "record",
  read: function(e) {
    return t.u16(e, 6) + " h"
  }
}, {
  addr: "0x0407",
  name: "最近未充电间隔",
  source: "record",
  read: function(e) {
    return t.u16(e, 7) + " h"
  }
}, {
  addr: "0x0408",
  name: "BT 码",
  source: "record",
  read: function(e) {
    return d(e, 16, 32)
  }
}];

function d(e, r, n) {
  if (!e || !e.length) return "--";
  for (var t = [], a = r; a < r + n && a < e.length; a++) {
    var u = 255 & e[a];
    if (0 === u) break;
    t.push(String.fromCharCode(u))
  }
  return t.join("").trim() || "--"
}