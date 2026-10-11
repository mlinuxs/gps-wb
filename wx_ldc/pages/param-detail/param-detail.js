var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/toConsumableArray"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  a = require("../../utils/bms-client"),
  n = require("../../utils/theme"),
  s = require("../../utils/protocol");

function i(e, t, r, a, n, s) {
  return Object.assign({
    name: e,
    value: t,
    unit: r,
    addr: a,
    scale: n || 1,
    inputType: "text"
  }, s || {})
}

function u(e, t, r, a, n, s) {
  return i(e, t, r, a, n, Object.assign({
    signed: !0
  }, s || {}))
}

function o(e, t) {
  return s.f32(e, t)
}

function c(e) {
  return s.f32ToWords(e)
}
var d = ["磷酸铁锂", "三元锂", "钛酸锂", "钠离子"],
  l = [1026, 1028];

function p(e) {
  return new Promise((function(t) {
    return setTimeout(t, e)
  }))
}

function b(e, t, r) {
  return w.apply(this, arguments)
}

function w() {
  return (w = r(e().mark((function t(r, n, s) {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.prev = 0, e.next = 3, a.readRegisters(r, n, s);
        case 3:
          return e.abrupt("return", e.sent);
        case 6:
          return e.prev = 6, e.t0 = e.catch(0), "function" == typeof a.resetPending && a.resetPending(), e.next = 11, p(120);
        case 11:
          return e.abrupt("return", a.readRegisters(r, n, s));
        case 12:
        case "end":
          return e.stop()
      }
    }), t, null, [
      [0, 6]
    ])
  })))).apply(this, arguments)
}
var h = {
  quick: {
    title: "快速设置",
    quick: !0,
    rows: [i("电池实际串数", "12", "串", 512, 1, {
      inputType: "number"
    }), i("电池物理容量", "50", "AH", null, 1, {
      kind: "capacity"
    })]
  },
  voltage: {
    title: "电压参数",
    read: !0,
    rows: [i("过充保护电压", "4250", "mV", 528), i("过充恢复电压", "4150", "mV", 529), i("过放保护电压", "2700", "mV", 535), i("过放恢复电压", "3000", "mV", 536)]
  },
  temperature: {
    title: "温度参数",
    read: !0,
    rows: [u("充电高温保护", "65", "℃", 546), u("充电高温恢复", "55", "℃", 547), u("充电低温保护", "-25", "℃", 548), u("充电低温恢复", "-15", "℃", 549), u("放电高温保护", "75", "℃", 550), u("放电高温恢复", "65", "℃", 551), u("放电低温保护", "-30", "℃", 552), u("放电低温恢复", "-20", "℃", 553), u("MOS 高温保护", "100", "℃", 554), u("MOS 高温恢复", "85", "℃", 555)]
  },
  current: {
    title: "电流参数",
    read: !0,
    rows: [i("充电过流保护\n电流", "375", "A", 544), i("充电过流延时", "3000", "ms", 545), i("放电过流 1 保护\n电流", "375", "A", 538), i("放电过流 1 延时", "10000", "ms", 539), i("放电过流 2 保护\n电流", "1125", "A", 540), i("放电过流 2 延时", "400", "ms", 541), i("短路保护电流", "4500", "A", 542), i("短路保护延时", "1024", "us", 543), i("采样电阻值", "0.0425", "mΩ", 526, 1, {
      kind: "sampleResistor"
    })]
  },
  balance: {
    title: "均衡参数",
    read: !0,
    rows: [i("均衡启动电压", "3300", "mV", 532), i("均衡启动阈值", "10", "mV", 533), i("均衡延时", "1000", "ms", 534)]
  },
  wire: {
    title: "线损补偿",
    scroll: !0,
    wireComp: !0,
    rows: []
  },
  system: {
    title: "系统参数",
    read: !0,
    rows: [i("额定充电电压", "504", "V", 520, 10), i("休眠延时", "5", "s", 518), i("关机延时", "3600", "s", 519), i("满充延时", "30", "s", 524), i("满充电压", "4100", "mV", 522), i("满充电流", "2000", "mA", 523), u("零电流显示阈值", "120", "mA", 525), i("XBB", "1.00", "", 1543, 1, {
      kind: "xbb"
    })]
  }
};

function x(e) {
  return String(null == e ? "" : e).trim()
}

function f(e) {
  return (e || []).map((function(e) {
    return Object.assign({}, e, {
      originalValue: x(e.value),
      dirty: !1
    })
  }))
}

function g(e, t) {
  var r = Number(e);
  if (!Number.isFinite(r)) return null;
  var a = Math.round(r * (t || 1));
  return a < -32768 || a > 65535 ? null : a < 0 ? a + 65536 : a
}

function m(e, t) {
  var r = t || 1;
  return String(1 === r ? e : e / r)
}

function k(e) {
  return Number.isFinite(e) ? Number.isInteger(e) ? String(e) : e.toFixed(2) : "0"
}

function v(e) {
  return Number.isFinite(e) ? Number(e.toFixed(4)).toString() : "0"
}

function y(e) {
  return Number.isFinite(e) ? e.toFixed(3) : "0.000"
}

function T(e) {
  return Number.isFinite(e) ? e.toFixed(2) : "1.00"
}

function D(e) {
  var t = e >> 8 & 255;
  return t > 3 || 3 === t && (255 & e) >= 7
}
Page({
  data: {
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    title: "",
    rows: [],
    quick: !1,
    cellTypes: d,
    cellTypeIndex: 0,
    originalCellTypeIndex: 0,
    cellTypeDirty: !1,
    dataReady: !1,
    loadingText: "读取参数中",
    loadError: "",
    quickTip: "设置完上面三项电池参数即可使用，其他页面参数无需设置。"
  },
  onLoad: function(e) {
    this.unsubscribeTheme = n.subscribe(this), n.sync(this);
    var t = h[e.type] || h.quick;
    this.routeType = e.type || "quick";
    var r = t.wireComp ? [] : (t.rows || []).map((function(e, t) {
      return Object.assign({}, e, {
        id: t,
        value: "",
        originalValue: "",
        dirty: !1
      })
    }));
    this.setData({
      title: t.title,
      rows: r,
      quick: !!t.quick,
      dataReady: !1,
      loadingText: "读取参数中",
      loadError: ""
    }), wx.setNavigationBarTitle({
      title: "锂安 BMS"
    }), t.quick && this.loadQuick(), t.wireComp && this.loadWireComp(), t.read && this.loadGroup()
  },
  onUnload: function() {
    this.flushQuickDashboardRefresh(), this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTheme = null
  },
  markQuickDashboardField: function(e) {
    ("quick" === this.routeType || this.data.quick) && (this.changedQuickDashboardFields || (this.changedQuickDashboardFields = {}), this.changedQuickDashboardFields[e] = !0)
  },
  flushQuickDashboardRefresh: function() {
    var e = Object.keys(this.changedQuickDashboardFields || {});
    if (e.length) {
      this.changedQuickDashboardFields = {};
      var t = getApp(),
        r = t.globalData.pendingDashboardQuickFields || {};
      e.forEach((function(e) {
        r[e] = !0
      })), r.updatedAt = Date.now(), t.globalData.pendingDashboardQuickFields = r
    }
  },
  loadGroup: function() {
    var a = this;
    return r(e().mark((function r() {
      var n, i, u, c, d, l, p, w, x;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return a.setData({
              loadError: "请先绑定 BMS。",
              dataReady: !1
            }), e.abrupt("return");
          case 4:
            if (n = h[a.routeType] || h.quick, i = n.rows.map((function(e, t) {
                return Object.assign({
                  id: t
                }, e)
              })), (u = i.filter((function(e) {
                return "number" == typeof e.addr && "xbb" !== e.kind
              })).map((function(e) {
                return e.addr
              }))).length) {
              e.next = 10;
              break
            }
            return a.setData({
              rows: f(i),
              dataReady: !0,
              loadError: ""
            }), e.abrupt("return");
          case 10:
            return c = Math.min.apply(Math, t(u)), d = i.filter((function(e) {
              return "number" == typeof e.addr && "xbb" !== e.kind
            })).map((function(e) {
              return e.addr + ("sampleResistor" === e.kind || "wireComp" === e.kind ? 1 : 0)
            })), l = Math.max.apply(Math, t(d)), p = l - c + 1, e.prev = 14, e.next = 17, b(c, p, 2500);
          case 17:
            return w = e.sent, x = i.map((function(e) {
              if ("number" != typeof e.addr || "xbb" === e.kind) return e;
              var t = e.addr - c;
              if ("sampleResistor" === e.kind) return Object.assign({}, e, {
                value: v(o(w, t))
              });
              if ("wireComp" === e.kind) return Object.assign({}, e, {
                value: y(o(w, t))
              });
              var r = e.signed ? s.i16(w, t) : s.u16(w, t);
              return Object.assign({}, e, {
                value: m(r, e.scale)
              })
            })), e.next = 21, a.loadXbbRows(x);
          case 21:
            x = e.sent, a.setData({
              rows: f(x),
              dataReady: !0,
              loadError: ""
            }), e.next = 29;
            break;
          case 25:
            e.prev = 25, e.t0 = e.catch(14), a.setData({
              loadError: e.t0.errMsg || e.t0.message || "读取失败",
              dataReady: !1
            }), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "读取失败",
              icon: "none"
            });
          case 29:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [14, 25]
      ])
    })))()
  },
  loadXbbRows: function(t) {
    return r(e().mark((function r() {
      var a, n;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if ((t || []).some((function(e) {
                return "xbb" === e.kind
              }))) {
              e.next = 3;
              break
            }
            return e.abrupt("return", t);
          case 3:
            return e.prev = 3, e.next = 6, b(1543, 2, 2500);
          case 6:
            return a = e.sent, n = T(o(a, 0)), e.abrupt("return", t.map((function(e) {
              return "xbb" === e.kind ? Object.assign({}, e, {
                value: n
              }) : e
            })));
          case 11:
            return e.prev = 11, e.t0 = e.catch(3), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "XBB 读取失败",
              icon: "none"
            }), e.abrupt("return", t);
          case 15:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [3, 11]
      ])
    })))()
  },
  loadQuick: function() {
    var t = this;
    return r(e().mark((function r() {
      var a, n, i, u, o, c, l;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return t.setData({
              loadError: "请先绑定 BMS。",
              dataReady: !1
            }), e.abrupt("return");
          case 4:
            return e.prev = 4, e.next = 7, b(512, 2, 2500);
          case 7:
            return a = e.sent, n = s.u16(a, 0), i = s.u16(a, 1), e.next = 12, b(1028, 2, 2500);
          case 12:
            return u = e.sent, o = s.u32(u, 0) / 1e3, (c = h.quick.rows.map((function(e, t) {
              return Object.assign({
                id: t
              }, e)
            }))).forEach((function(e) {
              512 === e.addr && (e.value = String(n)), "capacity" === e.kind && (e.value = k(o))
            })), e.next = 18, t.buildQuickTip();
          case 18:
            l = e.sent, t.setData({
              rows: f(c),
              cellTypeIndex: i >= 0 && i < d.length ? i : 0,
              originalCellTypeIndex: i >= 0 && i < d.length ? i : 0,
              cellTypeDirty: !1,
              dataReady: !0,
              loadError: "",
              quickTip: l
            }), e.next = 26;
            break;
          case 22:
            e.prev = 22, e.t0 = e.catch(4), t.setData({
              loadError: e.t0.errMsg || e.t0.message || "读取失败",
              dataReady: !1
            }), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "读取失败",
              icon: "none"
            });
          case 26:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [4, 22]
      ])
    })))()
  },
  buildQuickTip: function() {
    return r(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.abrupt("return", "设置完上面三项电池参数即可使用，其他页面参数无需设置。");
          case 1:
          case "end":
            return e.stop()
        }
      }), t)
    })))()
  },
  loadWireComp: function() {
    var t = this;
    return r(e().mark((function r() {
      var a, n, u, o, c, d, l, p;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return t.setData({
              loadError: "请先绑定 BMS。",
              dataReady: !1
            }), e.abrupt("return");
          case 4:
            return e.prev = 4, e.next = 7, t.refreshWireCompSupport();
          case 7:
            if (e.sent) {
              e.next = 12;
              break
            }
            return t.setData({
              rows: [],
              dataReady: !1,
              loadError: "固件版本需 >= 3.7"
            }), wx.showToast({
              title: "固件版本需 >= 3.7",
              icon: "none"
            }), e.abrupt("return");
          case 12:
            return e.next = 14, b(512, 1, 2500);
          case 14:
            n = e.sent, a = s.u16(n, 0), e.next = 23;
            break;
          case 18:
            return e.prev = 18, e.t0 = e.catch(4), t.setData({
              loadError: e.t0.errMsg || e.t0.message || "读取失败",
              dataReady: !1
            }), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "读取失败",
              icon: "none"
            }), e.abrupt("return");
          case 23:
            if (a > 0 || (a = 0), a > 32 && (a = 32), u = Array.from({
                length: a
              }, (function(e, t) {
                return Object.assign({
                  id: t
                }, i("电池" + (t + 1), "0.000", "mΩ", 768 + 2 * t, 1, {
                  kind: "wireComp"
                }))
              })), a) {
              e.next = 29;
              break
            }
            return t.setData({
              rows: [],
              dataReady: !0,
              loadError: ""
            }), e.abrupt("return");
          case 29:
            e.prev = 29, o = [], c = 0, d = u;
          case 32:
            if (!(c < d.length)) {
              e.next = 41;
              break
            }
            return l = d[c], e.next = 36, t.readWireCompRowValue(l.addr);
          case 36:
            p = e.sent, o.push(Object.assign({}, l, {
              value: p
            }));
          case 38:
            c++, e.next = 32;
            break;
          case 41:
            t.setData({
              rows: f(o),
              dataReady: !0,
              loadError: ""
            }), e.next = 48;
            break;
          case 44:
            e.prev = 44, e.t1 = e.catch(29), t.setData({
              loadError: e.t1.errMsg || e.t1.message || "读取失败",
              dataReady: !1
            }), wx.showToast({
              title: e.t1.errMsg || e.t1.message || "读取失败",
              icon: "none"
            });
          case 48:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [4, 18],
        [29, 44]
      ])
    })))()
  },
  readWireCompRowValue: function(t) {
    return r(e().mark((function r() {
      var a;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.next = 2, b(t, 2, 2500);
          case 2:
            return a = e.sent, e.abrupt("return", y(o(a, 0)));
          case 4:
          case "end":
            return e.stop()
        }
      }), r)
    })))()
  },
  onValueInput: function(e) {
    var t, r, a = Number(e.currentTarget.dataset.id),
      n = this.data.rows.slice();
    n[a] = Object.assign({}, n[a], {
      value: e.detail.value,
      dirty: (t = e.detail.value, r = n[a] && n[a].originalValue, x(t) !== x(r))
    }), this.setData({
      rows: n
    })
  },
  onCellTypeChange: function(e) {
    var t = Number(e.detail.value);
    this.setData({
      cellTypeIndex: t,
      cellTypeDirty: t !== this.data.originalCellTypeIndex
    })
  },
  markRowSaved: function(e) {
    var t = Number(e),
      r = this.data.rows.slice();
    r[t] && (r[t] = Object.assign({}, r[t], {
      originalValue: x(r[t].value),
      dirty: !1
    }), this.setData({
      rows: r
    }))
  },
  setCellType: function() {
    var t = this;
    return r(e().mark((function r() {
      var n;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (n = getApp(), t.data.dataReady) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "参数读取中",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            if (n.globalData.connected) {
              e.next = 7;
              break
            }
            return wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 7:
            return wx.showLoading({
              title: "设置中"
            }), e.prev = 8, e.next = 11, a.writeRegisters(513, [t.data.cellTypeIndex]);
          case 11:
            wx.hideLoading(), t.setData({
              originalCellTypeIndex: t.data.cellTypeIndex,
              cellTypeDirty: !1
            }), t.markQuickDashboardField("cellType"), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), e.next = 21;
            break;
          case 17:
            e.prev = 17, e.t0 = e.catch(8), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            });
          case 21:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [8, 17]
      ])
    })))()
  },
  setParam: function(t) {
    var n = this;
    return r(e().mark((function r() {
      var s, i;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (s = n.data.rows[t.currentTarget.dataset.id]) {
              e.next = 3;
              break
            }
            return e.abrupt("return");
          case 3:
            if (n.data.dataReady) {
              e.next = 6;
              break
            }
            return wx.showToast({
              title: "参数读取中",
              icon: "none"
            }), e.abrupt("return");
          case 6:
            if ("capacity" !== s.kind) {
              e.next = 10;
              break
            }
            return e.next = 9, n.setCapacity(s);
          case 9:
            return e.abrupt("return");
          case 10:
            if ("sampleResistor" !== s.kind) {
              e.next = 14;
              break
            }
            return e.next = 13, n.setResistor(s);
          case 13:
            return e.abrupt("return");
          case 14:
            if ("wireComp" !== s.kind) {
              e.next = 18;
              break
            }
            return e.next = 17, n.setWireComp(s);
          case 17:
            return e.abrupt("return");
          case 18:
            if ("xbb" !== s.kind) {
              e.next = 22;
              break
            }
            return e.next = 21, n.setXbb(s);
          case 21:
            return e.abrupt("return");
          case 22:
            if ("number" == typeof s.addr) {
              e.next = 25;
              break
            }
            return wx.showToast({
              title: "该参数地址待补充",
              icon: "none"
            }), e.abrupt("return");
          case 25:
            if (getApp().globalData.connected) {
              e.next = 29;
              break
            }
            return wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 29:
            if (null !== (i = g(s.value, s.scale))) {
              e.next = 33;
              break
            }
            return wx.showToast({
              title: "请输入有效数值",
              icon: "none"
            }), e.abrupt("return");
          case 33:
            return wx.showLoading({
              title: "设置中"
            }), e.prev = 34, e.next = 37, a.writeRegisters(s.addr, [i]);
          case 37:
            wx.hideLoading(), n.markRowSaved(s.id), 512 === s.addr && n.markQuickDashboardField("cellCount"), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), e.next = 47;
            break;
          case 43:
            e.prev = 43, e.t0 = e.catch(34), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            });
          case 47:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [34, 43]
      ])
    })))()
  },
  setCapacity: function(t) {
    var n = this;
    return r(e().mark((function r() {
      var s, i, u, o, c, d;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            if (s = Number(t.value), Number.isFinite(s) && !(s <= 0)) {
              e.next = 8;
              break
            }
            return wx.showToast({
              title: "请输入有效容量",
              icon: "none"
            }), e.abrupt("return");
          case 8:
            i = Math.round(1e3 * s), u = [i >>> 16 & 65535, 65535 & i], wx.showLoading({
              title: "设置中"
            }), e.prev = 11, o = 0, c = l;
          case 13:
            if (!(o < c.length)) {
              e.next = 20;
              break
            }
            return d = c[o], e.next = 17, a.writeRegisters(d, u);
          case 17:
            o++, e.next = 13;
            break;
          case 20:
            wx.hideLoading(), n.markRowSaved(t.id), n.markQuickDashboardField("capacity"), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), e.next = 30;
            break;
          case 26:
            e.prev = 26, e.t0 = e.catch(11), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            });
          case 30:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [11, 26]
      ])
    })))()
  },
  setResistor: function(t) {
    var n = this;
    return r(e().mark((function r() {
      var s, i, u, o;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            if (s = Number(t.value), Number.isFinite(s) && !(s <= 0)) {
              e.next = 8;
              break
            }
            return wx.showToast({
              title: "请输入有效电阻值",
              icon: "none"
            }), e.abrupt("return");
          case 8:
            return wx.showLoading({
              title: "设置中"
            }), e.prev = 9, e.next = 12, a.writeRegisters(t.addr, c(s));
          case 12:
            return e.next = 14, n.readWireCompRowValue(t.addr);
          case 14:
            i = e.sent, u = n.data.rows.slice(), o = Number(t.id), u[o] ? (u[o] = Object.assign({}, u[o], {
              value: i,
              originalValue: x(i),
              dirty: !1
            }), n.setData({
              rows: u
            })) : n.markRowSaved(t.id), wx.hideLoading(), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), e.next = 26;
            break;
          case 22:
            e.prev = 22, e.t0 = e.catch(9), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            });
          case 26:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [9, 22]
      ])
    })))()
  },
  setWireComp: function(t) {
    var n = this;
    return r(e().mark((function r() {
      var s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            if (s = Number(t.value), Number.isFinite(s) && !(s < 0)) {
              e.next = 8;
              break
            }
            return wx.showToast({
              title: "请输入有效阻值",
              icon: "none"
            }), e.abrupt("return");
          case 8:
            return wx.showLoading({
              title: "设置中"
            }), e.prev = 9, e.next = 12, a.writeRegisters(t.addr, c(s));
          case 12:
            wx.hideLoading(), n.markRowSaved(t.id), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), e.next = 21;
            break;
          case 17:
            e.prev = 17, e.t0 = e.catch(9), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            });
          case 21:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [9, 17]
      ])
    })))()
  },
  setXbb: function(t) {
    var n = this;
    return r(e().mark((function r() {
      var s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            if (s = Number(t.value), !(!Number.isFinite(s) || s < .5 || s > 5)) {
              e.next = 8;
              break
            }
            return wx.showToast({
              title: "XBB 范围 0.50-5.00",
              icon: "none"
            }), e.abrupt("return");
          case 8:
            return wx.showLoading({
              title: "设置中"
            }), e.prev = 9, e.next = 12, a.writeRegisters(t.addr, c(s));
          case 12:
            wx.hideLoading(), n.markRowSaved(t.id), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), e.next = 21;
            break;
          case 17:
            e.prev = 17, e.t0 = e.catch(9), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            });
          case 21:
          case "end":
            return e.stop()
        }
      }), r, null, [
        [9, 17]
      ])
    })))()
  },
  refreshWireCompSupport: function() {
    return r(e().mark((function t() {
      var r, a, n, i;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return r = getApp(), a = D(r.globalData.firmwareWord), e.prev = 2, e.next = 5, b(19, 1, 2500);
          case 5:
            return n = e.sent, i = s.u16(n, 0), r.globalData.firmwareWord = i, r.globalData.firmwareText = "v" + (i >> 8 & 255) + "." + String(255 & i).padStart(2, "0"), e.abrupt("return", D(i));
          case 12:
            return e.prev = 12, e.t0 = e.catch(2), e.abrupt("return", a);
          case 15:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [2, 12]
      ])
    })))()
  }
});