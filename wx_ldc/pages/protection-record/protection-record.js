var e = require("../../@babel/runtime/helpers/slicedToArray"),
  r = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  n = require("../../utils/bms-client"),
  s = require("../../utils/protocol"),
  a = require("../../utils/theme"),
  u = [
    [1, "电压过充"],
    [2, "电压过放"],
    [4, "放电二级过流"],
    [8, "放电一级过流"],
    [16, "充电过流"],
    [32, "放电短路"],
    [256, "充电低温"],
    [512, "充电高温"],
    [1024, "放电低温"],
    [2048, "放电高温"]
  ];

function c(e) {
  return new Promise((function(r) {
    return setTimeout(r, e)
  }))
}

function o(e, r, t, n) {
  return i.apply(this, arguments)
}

function i() {
  return (i = t(r().mark((function e(t, s, a, u) {
    var o, i;
    return r().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          i = 0;
        case 1:
          if (!(i < u)) {
            e.next = 17;
            break
          }
          return e.prev = 2, e.next = 5, n.readRegisters(t, s, a);
        case 5:
          return e.abrupt("return", e.sent);
        case 8:
          if (e.prev = 8, e.t0 = e.catch(2), o = e.t0, !(i < u - 1)) {
            e.next = 14;
            break
          }
          return e.next = 14, c(180 + 120 * i);
        case 14:
          i++, e.next = 1;
          break;
        case 17:
          throw o || new Error("读取失败");
        case 18:
        case "end":
          return e.stop()
      }
    }), e, null, [
      [2, 8]
    ])
  })))).apply(this, arguments)
}

function h(e) {
  if (!e) return "--";
  var r = (62914560 & e) >>> 22,
    t = (4063232 & e) >>> 17,
    n = (126976 & e) >>> 12,
    s = (4032 & e) >>> 6,
    a = 63 & e;
  return f(2022 + ((4227858432 & e) >>> 26), 4) + "-" + f(r, 2) + "-" + f(t, 2) + " " + f(n, 2) + ":" + f(s, 2) + ":" + f(a, 2)
}

function l(r) {
  var t = r >>> 0;
  if (!t) return "--";
  if (3 === t) return "断线";
  var n = [],
    s = 0;
  u.forEach((function(r) {
    var a = e(r, 2),
      u = a[0],
      c = a[1];
    s |= u, t & u && n.push(c)
  }));
  var a = t & ~s;
  return a && n.push("未知" + d(a)), n.length ? n.join("、") : d(t)
}

function d(e) {
  return "0x" + (e >>> 0).toString(16).toUpperCase().padStart(8, "0")
}

function f(e, r) {
  return String(e).padStart(r, "0")
}
Page({
  data: {
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    connected: !1,
    loading: !1,
    records: [],
    hasRecords: !1,
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
    var e = this;
    return t(r().mark((function t() {
      var n, s, a;
      return r().wrap((function(r) {
        for (;;) switch (r.prev = r.next) {
          case 0:
            if (n = getApp().globalData.connected, e.setData({
                connected: n,
                status: ""
              }), n) {
              r.next = 5;
              break
            }
            return e.setData({
              records: [],
              hasRecords: !1,
              loading: !1
            }), r.abrupt("return");
          case 5:
            return e.setData({
              loading: !0,
              records: [],
              hasRecords: !1,
              status: "正在读取保护记录"
            }), r.next = 8, e.readProtectionRecords();
          case 8:
            s = r.sent, a = s.failedSlots || s.filter((function(e) {
              return e.error
            })).length, e.setData({
              loading: !1,
              records: s.slice(),
              hasRecords: s.length > 0,
              status: a ? "读取完成，" + a + " 条失败，共 " + s.length + " 条记录" : "读取完成，共 " + s.length + " 条记录"
            });
          case 11:
          case "end":
            return r.stop()
        }
      }), t)
    })))()
  },
  readProtectionRecords: function() {
    var e = this;
    return t(r().mark((function t() {
      return r().wrap((function(r) {
        for (;;) switch (r.prev = r.next) {
          case 0:
            return r.prev = 0, r.next = 3, e.readProtectionRecordsBlock();
          case 3:
            return r.abrupt("return", r.sent);
          case 6:
            return r.prev = 6, r.t0 = r.catch(0), e.setData({
              status: "整块读取失败，正在逐条重试：" + (r.t0.message || r.t0.errMsg || "读取失败")
            }), r.next = 11, c(120);
          case 11:
            return r.next = 13, e.readProtectionRecordsBySlot();
          case 13:
            return r.abrupt("return", r.sent);
          case 14:
          case "end":
            return r.stop()
        }
      }), t, null, [
        [0, 6]
      ])
    })))()
  },
  readProtectionRecordsBlock: function() {
    var e = this;
    return t(r().mark((function t() {
      var n, a, u, c;
      return r().wrap((function(r) {
        for (;;) switch (r.prev = r.next) {
          case 0:
            return r.next = 2, o(1048, 96, 3500, 2);
          case 2:
            if ((n = r.sent) && !(n.length < 192)) {
              r.next = 5;
              break
            }
            throw new Error("保护记录数据长度不足");
          case 5:
            a = [], u = 0;
          case 7:
            if (!(u < 24)) {
              r.next = 15;
              break
            }
            if (c = s.u32(n, 2 * u)) {
              r.next = 11;
              break
            }
            return r.abrupt("continue", 12);
          case 11:
            a.push({
              index: u + 1,
              time: h(c),
              event: l(s.u32(n, 48 + 2 * u)),
              error: ""
            });
          case 12:
            u++, r.next = 7;
            break;
          case 15:
            return e.setData({
              records: a.slice(),
              hasRecords: a.length > 0,
              status: "已整块读取，有效 " + a.length + " 条"
            }), r.abrupt("return", a);
          case 17:
          case "end":
            return r.stop()
        }
      }), t)
    })))()
  },
  readProtectionRecordsBySlot: function() {
    var e = this;
    return t(r().mark((function t() {
      var n, a, u, i, d, f, p, b, x;
      return r().wrap((function(r) {
        for (;;) switch (r.prev = r.next) {
          case 0:
            n = [], a = 0, u = 0, i = 0;
          case 4:
            if (!(i < 24)) {
              r.next = 42;
              break
            }
            return d = 1048 + 2 * i, f = 1096 + 2 * i, r.prev = 7, r.next = 10, o(d, 2, 1800, 2);
          case 10:
            if (p = r.sent, b = s.u32(p, 0)) {
              r.next = 18;
              break
            }
            return a = 0, e.setData({
              records: n.slice(),
              hasRecords: n.length > 0,
              status: "已扫描 " + (i + 1) + "/24，有效 " + n.length + " 条"
            }), r.next = 17, c(40);
          case 17:
            return r.abrupt("continue", 39);
          case 18:
            return r.next = 20, c(40);
          case 20:
            return r.next = 22, o(f, 2, 1800, 2);
          case 22:
            return x = r.sent, n.push({
              index: i + 1,
              time: h(b),
              event: l(s.u32(x, 0)),
              error: ""
            }), a = 0, e.setData({
              records: n.slice(),
              hasRecords: n.length > 0,
              status: "已扫描 " + (i + 1) + "/24，有效 " + n.length + " 条"
            }), r.next = 28, c(40);
          case 28:
            r.next = 39;
            break;
          case 30:
            if (r.prev = 30, r.t0 = r.catch(7), a += 1, u += 1, e.setData({
                records: n.slice(),
                hasRecords: n.length > 0,
                status: "第 " + (i + 1) + " 槽读取失败，已跳过；有效 " + n.length + " 条"
              }), !(a >= 2)) {
              r.next = 37;
              break
            }
            return r.abrupt("break", 42);
          case 37:
            return r.next = 39, c(160);
          case 39:
            i++, r.next = 4;
            break;
          case 42:
            return n.failedSlots = u, r.abrupt("return", n);
          case 44:
          case "end":
            return r.stop()
        }
      }), t, null, [
        [7, 30]
      ])
    })))()
  }
});