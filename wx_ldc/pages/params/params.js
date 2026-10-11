var e = require("../../@babel/runtime/helpers/slicedToArray"),
  t = require("../../@babel/runtime/helpers/defineProperty"),
  n = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  a = require("../../utils/bms-client"),
  o = require("../../utils/protocol"),
  i = require("../../utils/connection-manager"),
  c = require("../../utils/connect-animation"),
  s = require("../../utils/tabbar"),
  u = require("../../utils/theme"),
  l = require("../../utils/registers"),
  h = l.PARAMS,
  p = l.CELL_TYPES,
  d = null,
  m = 0,
  b = {
    "快速设置": "quick",
    "电压参数": "voltage",
    "温度参数": "temperature",
    "电流参数": "current",
    "均衡参数": "balance",
    "线损补偿": "wire",
    "系统参数": "system"
  };

function g(e, t, n) {
  var r = o.u16(e, t);
  return "u16" === n ? String(r) : "i16" === n ? String(o.i16(e, t)) : "hex" === n ? "0x" + r.toString(16).toUpperCase().padStart(4, "0") : "version" === n ? (r >> 8 & 255) + "." + (255 & r) : "cellType" === n ? p[r] || "未知(" + r + ")" : "u16x0.01" === n ? (.01 * r).toFixed(2) : "i16x0.01" === n ? (.01 * o.i16(e, t)).toFixed(2) : String(r)
}

function f(e) {
  var t = e >> 8 & 255;
  return t > 3 || 3 === t && (255 & e) >= 7
}

function v(e) {
  var t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
  return t ? function(e, t, n) {
    t /= 100, n /= 100;
    var r = (1 - Math.abs(2 * n - 1)) * t,
      a = r * (1 - Math.abs(e / 60 % 2 - 1)),
      o = n - r / 2,
      i = 0,
      c = 0,
      s = 0;
    e < 60 ? (i = r, c = a) : e < 120 ? (i = a, c = r) : e < 180 ? (c = r, s = a) : e < 240 ? (c = a, s = r) : e < 300 ? (i = a, s = r) : (i = r, s = a);
    return "#" + [i, c, s].map((function(e) {
      return Math.round(255 * (e + o)).toString(16).padStart(2, "0")
    })).join("").toUpperCase()
  }(360 * Math.max(0, Math.min(1, (t.clientX - 9) / 151)), 86, 18 + 44 * (1 - Math.max(0, Math.min(1, (t.clientY - 44) / 102)))) : ""
}
Page({
  data: {
    connected: !1,
    connectionStatus: "离线：",
    deviceName: "BMS",
    params: [],
    error: "",
    showConnectFly: !1,
    showOtherParams: !1,
    showWireComp: !1,
    wireCompChecked: !1,
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    themeOptions: u.options(),
    showThemePalette: !1
  },
  onShow: function() {
    var e = this;
    this.pageVisible = !0, this.connectionAnimationReady = !1, s.sync(this, "/pages/params/params"), this.unsubscribeTheme || (this.unsubscribeTheme = u.subscribe(this)), u.sync(this);
    var t = getApp();
    this.unsubscribeConnection || (this.unsubscribeConnection = i.subscribe((function(t) {
      return e.syncConnectionState(t)
    }))), this.setData({
      connected: t.globalData.connected,
      connectionStatus: t.globalData.connectionStatus || (t.globalData.connected ? "已连接：" : "离线："),
      deviceName: t.globalData.deviceName || (t.globalData.mockMode ? "BMS-16S-DEMO" : "BMS"),
      showWireComp: f(t.globalData.firmwareWord),
      wireCompChecked: null !== t.globalData.firmwareWord && void 0 !== t.globalData.firmwareWord
    }), t.globalData.connected && !c.isRunning(this) && c.clear(this), this.refresh(), d && clearInterval(d), d = setInterval((function() {
      return e.refresh()
    }), 2e3)
  },
  onHide: function() {
    this.pageVisible = !1, this.connectionAnimationReady = !1, d && clearInterval(d), c.clear(this), d = null
  },
  onUnload: function() {
    this.pageVisible = !1, this.connectionAnimationReady = !1, d && clearInterval(d), c.clear(this), d = null, this.unsubscribeConnection && this.unsubscribeConnection(), this.unsubscribeConnection = null, this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTheme = null
  },
  cycleTheme: function() {
    u.togglePalette()
  },
  selectTheme: function(e) {
    u.selectColor(e.currentTarget.dataset.color), u.closePalette()
  },
  touchThemePalette: function(e) {
    var t = v(e);
    t && u.previewColor(t)
  },
  commitThemePalette: function(e) {
    var t = v(e);
    t && u.selectColor(t)
  },
  closeThemePalette: function() {
    u.closePalette()
  },
  syncConnectionState: function(e) {
    e || (e = i.getState());
    var t = this.data.connected,
      n = void 0 !== this.activeConnectionSeq && this.activeConnectionSeq !== e.connectionSeq,
      r = t && !e.connected,
      a = !t && e.connected;
    this.activeConnectionSeq = e.connectionSeq, this.setData({
      connected: e.connected,
      connectionStatus: e.connectionStatus,
      deviceName: e.deviceName || (getApp().globalData.mockMode ? "BMS-16S-DEMO" : "BMS")
    }), c.shouldRun(this, t, e) ? c.trigger(this) : e.connected || c.clear(this), (n || r || !e.connected) && (this.setData({
      params: [],
      error: e.connected ? "" : "请先绑定 BMS。",
      showWireComp: !1,
      wireCompChecked: !1
    }), r && (this.refreshing = !1)), (a || n && e.connected) && this.refresh()
  },
  openItem: function(e) {
    return r(n().mark((function t() {
      var r, a, o;
      return n().wrap((function(t) {
        for (;;) switch (t.prev = t.next) {
          case 0:
            r = e.currentTarget.dataset.type, a = e.currentTarget.dataset.name, o = r || b[a] || "quick", wx.navigateTo({
              url: "../param-detail/param-detail?type=" + o
            });
          case 4:
          case "end":
            return t.stop()
        }
      }), t)
    })))()
  },
  toggleSection: function(e) {
    var n = e.currentTarget.dataset.key;
    n && this.setData(t({}, n, !this.data[n]))
  },
  openDeviceList: function() {
    getApp().globalData.pendingOpenDeviceList = !0, wx.switchTab({
      url: "../dashboard/dashboard"
    })
  },
  scanCode: function() {
    getApp().globalData.pendingScanCode = !0, wx.switchTab({
      url: "../dashboard/dashboard"
    })
  },
  refresh: function() {
    var t = this;
    return r(n().mark((function r() {
      var o, i, c;
      return n().wrap((function(n) {
        for (;;) switch (n.prev = n.next) {
          case 0:
            if (!t.refreshing) {
              n.next = 2;
              break
            }
            return n.abrupt("return");
          case 2:
            if (t.refreshing = !0, n.prev = 3, o = getApp(), t.setData({
                connected: o.globalData.connected,
                connectionStatus: o.globalData.connectionStatus || (o.globalData.connected ? "已连接：" : "离线："),
                deviceName: o.globalData.deviceName || (o.globalData.mockMode ? "BMS-16S-DEMO" : "BMS")
              }), o.globalData.connected) {
              n.next = 10;
              break
            }
            return t.setData({
              error: "请先绑定 BMS。",
              params: [],
              showWireComp: !1,
              wireCompChecked: !1
            }), t.tryReconnect(), n.abrupt("return");
          case 10:
            return t.refreshWireCompSupport(), n.prev = 11, n.next = 14, a.readRegisters(512, 48, 2500);
          case 14:
            i = n.sent, c = h.slice(0, 6).map((function(t) {
              var n = e(t, 4),
                r = n[0],
                a = n[1],
                o = n[2],
                c = n[3],
                s = r - 512;
              return {
                addr: "0x" + r.toString(16).toUpperCase().padStart(4, "0"),
                name: a,
                value: g(i, s, o),
                unit: c
              }
            })), t.setData({
              error: "",
              params: c
            }), n.next = 22;
            break;
          case 19:
            n.prev = 19, n.t0 = n.catch(11), t.setData({
              error: n.t0.message || String(n.t0)
            });
          case 22:
            return n.prev = 22, t.refreshing = !1, n.finish(22);
          case 25:
          case "end":
            return n.stop()
        }
      }), r, null, [
        [3, , 22, 25],
        [11, 19]
      ])
    })))()
  },
  tryReconnect: function() {
    var e = this;
    return r(n().mark((function t() {
      var r, a, o;
      return n().wrap((function(t) {
        for (;;) switch (t.prev = t.next) {
          case 0:
            if (r = getApp(), a = i.getState(), !(!r.globalData.deviceId || r.globalData.mockMode || a.connected || a.connecting || a.reconnecting)) {
              t.next = 4;
              break
            }
            return t.abrupt("return");
          case 4:
            if (!(Date.now() - m < 8e3)) {
              t.next = 6;
              break
            }
            return t.abrupt("return");
          case 6:
            return m = Date.now(), t.prev = 7, t.next = 10, i.reconnect({
              directAttempts: 2,
              timeoutMs: 3e3,
              mock: r.globalData.mockMode
            });
          case 10:
            o = t.sent, e.syncConnectionState(i.getState()), o.ok && e.refresh(), t.next = 19;
            break;
          case 15:
            t.prev = 15, t.t0 = t.catch(7), e.syncConnectionState(i.getState()), e.setData({
              error: t.t0.errMsg || t.t0.message || "重连失败"
            });
          case 19:
          case "end":
            return t.stop()
        }
      }), t, null, [
        [7, 15]
      ])
    })))()
  },
  refreshWireCompSupport: function() {
    var e = this;
    return r(n().mark((function t() {
      var r, i, c, s;
      return n().wrap((function(t) {
        for (;;) switch (t.prev = t.next) {
          case 0:
            if ((r = getApp()).globalData.connected) {
              t.next = 3;
              break
            }
            return t.abrupt("return");
          case 3:
            return (i = f(r.globalData.firmwareWord)) !== e.data.showWireComp && e.setData({
              showWireComp: i
            }), t.prev = 5, t.next = 8, a.readRegisters(19, 1, 2e3);
          case 8:
            c = t.sent, s = o.u16(c, 0), r.globalData.firmwareWord = s, r.globalData.firmwareText = "v" + (s >> 8 & 255) + "." + String(255 & s).padStart(2, "0"), e.setData({
              showWireComp: f(s),
              wireCompChecked: !0
            }), t.next = 18;
            break;
          case 15:
            t.prev = 15, t.t0 = t.catch(5), i && e.setData({
              showWireComp: !0,
              wireCompChecked: !0
            });
          case 18:
          case "end":
            return t.stop()
        }
      }), t, null, [
        [5, 15]
      ])
    })))()
  }
});