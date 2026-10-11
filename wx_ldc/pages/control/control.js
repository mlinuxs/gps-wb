var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  n = require("../../utils/bms-client"),
  a = require("../../utils/protocol"),
  r = require("../../utils/connection-manager"),
  o = require("../../utils/connect-animation"),
  c = require("../../utils/tabbar"),
  s = require("../../utils/theme"),
  i = null,
  u = 0,
  l = 0,
  h = null,
  d = 0,
  g = !1,
  p = {
    reboot: [0, 0, "重启系统"],
    shutdown: [1, 0, "系统关机"],
    factory: [2, 0, "恢复出厂"],
    currentZero: [257, 0, "电流归零"],
    dischargeOn: [3, 0, "强制放电开启"],
    dischargeOff: [4, 0, "强制关闭放电"],
    dischargeCancel: [5, 0, "取消强制放电"],
    chargeOn: [6, 0, "强制充电开启"],
    chargeOff: [7, 0, "强制关闭充电"],
    chargeCancel: [8, 0, "取消强制充电"],
    heatOn: [32, 1, "开启加热"],
    heatOff: [32, 0, "关闭加热"],
    forceStart: [48, 1, "强制开启"]
  };

function b(e, t) {
  return 1 == (e >>> t & 1)
}

function f(e) {
  if (!(e instanceof Date) || Number.isNaN(e.getTime())) return null;
  var t = e.getFullYear() - 2022,
    n = e.getMonth() + 1,
    a = e.getDate(),
    r = e.getHours(),
    o = e.getMinutes(),
    c = e.getSeconds();
  return t < 0 || t > 255 ? null : [(255 & t) << 8 | 255 & n, (255 & a) << 8 | 255 & r, (255 & o) << 8 | 255 & c]
}

function m(e) {
  var t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
  return t ? function(e, t, n) {
    t /= 100, n /= 100;
    var a = (1 - Math.abs(2 * n - 1)) * t,
      r = a * (1 - Math.abs(e / 60 % 2 - 1)),
      o = n - a / 2,
      c = 0,
      s = 0,
      i = 0;
    e < 60 ? (c = a, s = r) : e < 120 ? (c = r, s = a) : e < 180 ? (s = a, i = r) : e < 240 ? (s = r, i = a) : e < 300 ? (c = r, i = a) : (c = a, i = r);
    return "#" + [c, s, i].map((function(e) {
      return Math.round(255 * (e + o)).toString(16).padStart(2, "0")
    })).join("").toUpperCase()
  }(360 * Math.max(0, Math.min(1, (t.clientX - 9) / 151)), 86, 18 + 44 * (1 - Math.max(0, Math.min(1, (t.clientY - 44) / 102)))) : ""
}
Page({
  data: {
    mockMode: !1,
    connected: !1,
    connectionStatus: "离线：",
    deviceName: "BMS",
    runtime: "--",
    nowText: "--",
    lastCommand: "",
    showFactoryButton: !1,
    showConnectFly: !1,
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    themeOptions: s.options(),
    showThemePalette: !1,
    switches: [{
      key: "charge",
      title: "充电开关",
      icon: "■",
      checked: !0
    }, {
      key: "discharge",
      title: "放电开关",
      icon: "■",
      checked: !0
    }, {
      key: "heat",
      title: "加热开关",
      icon: "■",
      checked: !1
    }, {
      key: "tempMask",
      title: "温控禁用",
      icon: "■",
      checked: !1
    }]
  },
  onShow: function() {
    var e = this;
    this.pageVisible = !0, this.connectionAnimationReady = !1, c.sync(this, "/pages/control/control"), this.unsubscribeTheme || (this.unsubscribeTheme = s.subscribe(this)), s.sync(this);
    var t = getApp();
    this.unsubscribeConnection || (this.unsubscribeConnection = r.subscribe((function(t) {
      return e.syncConnectionState(t)
    }))), this.setData({
      mockMode: t.globalData.mockMode,
      connected: t.globalData.connected,
      connectionStatus: t.globalData.connectionStatus || (t.globalData.connected ? "已连接：" : "离线："),
      deviceName: t.globalData.deviceName || (t.globalData.mockMode ? "BMS-16S-DEMO" : "BMS"),
      showFactoryButton: g
    }), t.globalData.connected && !o.isRunning(this) && o.clear(this), t.globalData.pendingOpenDeviceList && (t.globalData.pendingOpenDeviceList = !1, this.openDeviceList()), t.globalData.pendingScanCode && (t.globalData.pendingScanCode = !1, this.scanCode()), i && clearInterval(i), i = setInterval((function() {
      return e.refresh()
    }), 2e3), this.refresh()
  },
  onHide: function() {
    this.pageVisible = !1, this.connectionAnimationReady = !1, i && clearInterval(i), this.cancelHiddenHold(), o.clear(this), i = null
  },
  onUnload: function() {
    this.pageVisible = !1, this.connectionAnimationReady = !1, i && clearInterval(i), this.cancelHiddenHold(), o.clear(this), i = null, this.unsubscribeConnection && this.unsubscribeConnection(), this.unsubscribeConnection = null, this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTheme = null
  },
  cycleTheme: function() {
    s.togglePalette()
  },
  selectTheme: function(e) {
    s.selectColor(e.currentTarget.dataset.color), s.closePalette()
  },
  touchThemePalette: function(e) {
    var t = m(e);
    t && s.previewColor(t)
  },
  commitThemePalette: function(e) {
    var t = m(e);
    t && s.selectColor(t)
  },
  closeThemePalette: function() {
    s.closePalette()
  },
  syncConnectionState: function(e) {
    var t = this;
    e || (e = r.getState());
    var n = this.data.connected,
      a = void 0 !== this.activeConnectionSeq && this.activeConnectionSeq !== e.connectionSeq,
      c = n && !e.connected,
      s = !n && e.connected;
    this.activeConnectionSeq = e.connectionSeq, this.setData({
      connected: e.connected,
      connectionStatus: e.connectionStatus,
      deviceName: e.deviceName || (getApp().globalData.mockMode ? "BMS-16S-DEMO" : "BMS")
    }), o.shouldRun(this, n, e) ? o.trigger(this) : e.connected || o.clear(this), a && (l = 0, this.refreshing = !1), (a || c || !e.connected) && (c && (this.refreshing = !1, l = 0), this.clearControlState()), (s || a && e.connected) && setTimeout((function() {
      return t.refresh()
    }), 200)
  },
  refresh: function() {
    var n = this;
    return t(e().mark((function t() {
      var a, o, c, s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (!n.refreshing) {
              e.next = 3;
              break
            }
            return n.refreshAgain = !0, e.abrupt("return");
          case 3:
            if (n.refreshing = !0, e.prev = 4, a = getApp(), o = a.globalData.connectionSeq || 0, n.syncConnectionState(r.getState()), a.globalData.connected) {
              e.next = 12;
              break
            }
            return l = 0, n.tryReconnect(), e.abrupt("return");
          case 12:
            return e.next = 14, n.loadSwitchStates(!0, o);
          case 14:
            return c = e.sent, e.next = 17, n.loadBmsTime(!0, o);
          case 17:
            if (s = e.sent, (getApp().globalData.connectionSeq || 0) === o) {
              e.next = 20;
              break
            }
            return e.abrupt("return");
          case 20:
            if (!c && !s) {
              e.next = 23;
              break
            }
            return l = 0, e.abrupt("return");
          case 23:
            (l += 1) >= 2 && (l = 0, n.tryReconnect(!0));
          case 25:
            return e.prev = 25, n.refreshing = !1, n.refreshAgain && (n.refreshAgain = !1, setTimeout((function() {
              return n.refresh()
            }), 100)), e.finish(25);
          case 29:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [4, , 25, 29]
      ])
    })))()
  },
  loadSwitchStates: function(r, o) {
    var c = this;
    return t(e().mark((function t() {
      var s, i, u, l;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 3;
              break
            }
            return e.abrupt("return", !1);
          case 3:
            return e.prev = 3, e.next = 6, n.readRegisters(15, 1, 2e3);
          case 6:
            return s = e.sent, i = a.u16(s, 0), e.next = 10, n.readRegisters(517, 1, 2e3);
          case 10:
            if (u = e.sent, l = a.u16(u, 0), void 0 === o || (getApp().globalData.connectionSeq || 0) === o) {
              e.next = 14;
              break
            }
            return e.abrupt("return", !1);
          case 14:
            return c.updateSwitches({
              charge: !b(i, 5),
              discharge: !b(i, 3),
              heat: b(i, 6),
              tempMask: b(l, 6)
            }), e.abrupt("return", !0);
          case 18:
            return e.prev = 18, e.t0 = e.catch(3), r || wx.showToast({
              title: e.t0.errMsg || e.t0.message || "读取控制状态失败",
              icon: "none"
            }), e.abrupt("return", !1);
          case 22:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [3, 18]
      ])
    })))()
  },
  updateSwitches: function(e) {
    var t = this.data.switches.map((function(t) {
      return Object.prototype.hasOwnProperty.call(e, t.key) ? Object.assign({}, t, {
        checked: !!e[t.key]
      }) : t
    }));
    this.setData({
      switches: t
    })
  },
  loadBmsTime: function(r, o) {
    var c = this;
    return t(e().mark((function t() {
      var s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 3;
              break
            }
            return e.abrupt("return", !1);
          case 3:
            return e.prev = 3, e.next = 6, n.readRegisters(21, 3, 2e3);
          case 6:
            if (s = e.sent, void 0 === o || (getApp().globalData.connectionSeq || 0) === o) {
              e.next = 9;
              break
            }
            return e.abrupt("return", !1);
          case 9:
            return c.setData({
              nowText: c.formatRtc(a.u16(s, 0), a.u16(s, 1), a.u16(s, 2))
            }), e.abrupt("return", !0);
          case 13:
            return e.prev = 13, e.t0 = e.catch(3), c.setData({
              nowText: "--"
            }), r || wx.showToast({
              title: e.t0.errMsg || e.t0.message || "读取 BMS 时间失败",
              icon: "none"
            }), e.abrupt("return", !1);
          case 18:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [3, 13]
      ])
    })))()
  },
  tryReconnect: function(n) {
    var a = this;
    return t(e().mark((function t() {
      var o, c, s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (o = getApp(), c = r.getState(), o.globalData.deviceId && !o.globalData.mockMode && !c.connecting && !c.reconnecting) {
              e.next = 4;
              break
            }
            return e.abrupt("return");
          case 4:
            if (!c.connected || n) {
              e.next = 6;
              break
            }
            return e.abrupt("return");
          case 6:
            if (!(Date.now() - u < 8e3)) {
              e.next = 8;
              break
            }
            return e.abrupt("return");
          case 8:
            return u = Date.now(), e.prev = 9, e.next = 12, r.reconnect({
              directAttempts: 2,
              timeoutMs: 3e3,
              mock: o.globalData.mockMode,
              force: !!n
            });
          case 12:
            s = e.sent, a.syncConnectionState(r.getState()), s.ok && setTimeout((function() {
              return a.refresh()
            }), 300), e.next = 20;
            break;
          case 17:
            e.prev = 17, e.t0 = e.catch(9), a.syncConnectionState(r.getState());
          case 20:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [9, 17]
      ])
    })))()
  },
  clearControlState: function() {
    this.setData({
      runtime: "--",
      nowText: "--",
      lastCommand: "",
      showFactoryButton: g,
      switches: this.data.switches.map((function(e) {
        return Object.assign({}, e, {
          checked: !1
        })
      }))
    })
  },
  startControlPageHold: function(e) {
    if (function(e) {
        var t = e && e.touches && e.touches[0];
        if (!t) return !1;
        var n = 0;
        try {
          n = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).windowHeight || 0
        } catch (e) {}
        return !!n && t.clientY >= .58 * n
      }(e)) {
      var t = e.touches && e.touches[0];
      d = t ? t.clientY : 0, this.startHiddenHold()
    }
  },
  moveControlPageHold: function(e) {
    if (h) {
      var t = e.touches && e.touches[0];
      t && Math.abs(t.clientY - d) > 18 && this.cancelHiddenHold()
    }
  },
  startHiddenHold: function() {
    var e = this;
    this.data.showFactoryButton || (this.cancelHiddenHold(), h = setTimeout((function() {
      h = null, g = !0, e.setData({
        showFactoryButton: !0
      }), wx.showToast({
        title: "已显示恢复出厂",
        icon: "none"
      })
    }), 1e4))
  },
  noopTouch: function() {},
  cancelHiddenHold: function() {
    h && (clearTimeout(h), h = null)
  },
  sendCommand: function(e) {
    var t = this,
      n = e.currentTarget.dataset.cmd,
      a = p[n];
    if (a) {
      var r = "shutdown" === n ? "进入关机后需要插入充电器激活，长时间不用电池可进入关机，请谨慎操作" : "factory" === n ? "确认后 BMS 会恢复设置里的所有数据至出厂前数据" : "currentZero" === n ? "请确认电池包处于静置且无负载、无充电状态，否则禁止操作" : "是否执行：" + a[2];
      wx.showModal({
        title: "确认操作",
        content: r,
        confirmText: "确认",
        cancelText: "取消",
        success: function(e) {
          e.confirm && t.writeCommand(a, {
            noResponse: !0
          })
        }
      })
    }
  },
  writeCommand: function(a, r) {
    var o = this;
    return t(e().mark((function t() {
      var c, s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (c = r || {}, getApp().globalData.connected) {
              e.next = 6;
              break
            }
            return o.clearControlState(), wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 6:
            return wx.showLoading({
              title: "发送中"
            }), e.prev = 7, e.next = 10, n.writeRegisters(a[0], [a[1]], void 0, c.noResponse ? {
              noResponse: !0
            } : void 0);
          case 10:
            s = e.sent, o.setData({
              lastCommand: a[2] + (s.mock ? "（模拟）" : "")
            }), wx.hideLoading(), wx.showToast({
              title: "已发送",
              icon: "success"
            }), 2 === a[0] && o.notifyDashboardFactoryReset(), e.next = 21;
            break;
          case 17:
            e.prev = 17, e.t0 = e.catch(7), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "发送失败",
              icon: "none"
            });
          case 21:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [7, 17]
      ])
    })))()
  },
  notifyDashboardFactoryReset: function() {
    var e = getApp(),
      t = e.globalData.pendingDashboardQuickFields || {};
    ["capacity", "cellType", "cellCount"].forEach((function(e) {
      t[e] = !0
    })), t.updatedAt = Date.now(), e.globalData.pendingDashboardQuickFields = t
  },
  toggleSwitch: function(n) {
    var a = this;
    return t(e().mark((function t() {
      var r, o, c;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (r = n.currentTarget.dataset.key, o = n.detail.value, c = a.data.switches.map((function(e) {
                return e.key !== r ? e : Object.assign({}, e, {
                  checked: o
                })
              })), a.setData({
                switches: c
              }), e.prev = 4, "charge" !== r) {
              e.next = 9;
              break
            }
            return e.next = 8, a.writeCommand(o ? [8, 0, "取消手动关闭充电"] : [7, 0, "手动关闭充电"]);
          case 8:
            return e.abrupt("return");
          case 9:
            if ("discharge" !== r) {
              e.next = 13;
              break
            }
            return e.next = 12, a.writeCommand(o ? [5, 0, "取消手动关闭放电"] : [4, 0, "手动关闭放电"]);
          case 12:
            return e.abrupt("return");
          case 13:
            if ("heat" !== r) {
              e.next = 17;
              break
            }
            return e.next = 16, a.writeCommand(o ? [32, 1, "开启加热"] : [32, 0, "关闭加热"]);
          case 16:
            return e.abrupt("return");
          case 17:
            if ("tempMask" !== r) {
              e.next = 21;
              break
            }
            return e.next = 20, a.setTempControlDisabled(o);
          case 20:
            return e.abrupt("return");
          case 21:
            e.next = 26;
            break;
          case 23:
            e.prev = 23, e.t0 = e.catch(4), a.loadSwitchStates(!0);
          case 26:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [4, 23]
      ])
    })))()
  },
  setTempControlDisabled: function(r) {
    var o = this;
    return t(e().mark((function t() {
      var c, s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 5;
              break
            }
            return o.clearControlState(), wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 5:
            return wx.showLoading({
              title: "设置中"
            }), e.prev = 6, e.next = 9, n.readRegisters(517, 1, 2e3);
          case 9:
            return c = e.sent, s = a.u16(c, 0), r ? s |= 64 : s &= -65, e.next = 14, n.writeRegisters(517, [s]);
          case 14:
            wx.hideLoading(), o.setData({
              lastCommand: r ? "开启温控禁止" : "关闭温控禁止"
            }), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), o.loadSwitchStates(!0), e.next = 25;
            break;
          case 20:
            throw e.prev = 20, e.t0 = e.catch(6), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            }), e.t0;
          case 25:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [6, 20]
      ])
    })))()
  },
  syncTime: function() {
    var a = this;
    return t(e().mark((function t() {
      var r;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 5;
              break
            }
            return a.clearControlState(), wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 5:
            if (r = f(new Date)) {
              e.next = 9;
              break
            }
            return wx.showToast({
              title: "时间格式无效",
              icon: "none"
            }), e.abrupt("return");
          case 9:
            return wx.showLoading({
              title: "对时中"
            }), e.prev = 10, e.next = 13, n.writeRegisters(256, r, 1800, {
              noResponse: !0
            });
          case 13:
            return wx.hideLoading(), a.setData({
              lastCommand: "时间校准"
            }), e.next = 17, a.loadBmsTime();
          case 17:
            wx.showToast({
              title: "对时成功",
              icon: "success"
            }), e.next = 24;
            break;
          case 20:
            e.prev = 20, e.t0 = e.catch(10), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "对时失败",
              icon: "none"
            });
          case 24:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [10, 20]
      ])
    })))()
  },
  changePassword: function() {
    wx.showToast({
      title: "修改密码请到我的页面",
      icon: "none"
    })
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
  formatRtc: function(e, t, n) {
    var a = t >> 8 & 255,
      r = 255 & t,
      o = n >> 8 & 255,
      c = 255 & n;
    return 2022 + (e >> 8 & 255) + "-" + String(255 & e).padStart(2, "0") + "-" + String(a).padStart(2, "0") + " " + String(r).padStart(2, "0") + ":" + String(o).padStart(2, "0") + ":" + String(c).padStart(2, "0")
  }
});