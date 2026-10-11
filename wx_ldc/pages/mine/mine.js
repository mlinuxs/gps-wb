var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  n = require("../../utils/ble"),
  a = require("../../utils/bms-client"),
  i = require("../../utils/protocol"),
  r = require("../../utils/mock-bms"),
  s = require("../../utils/connection-manager"),
  c = require("../../utils/connect-animation"),
  o = require("../../utils/registers").CELL_TYPES,
  u = require("../../utils/cloud"),
  d = require("../../utils/tabbar"),
  l = require("../../utils/theme"),
  h = ["BMS", "Battery", "SmartBMS", "JBD", "Daly", "JK", "Jikong", "ANT", "LABMS"],
  v = ["LABMS"],
  p = ["ffff4e6174696f6e73"],
  m = null,
  g = 0;

function f(e) {
  var t = (e.name || e.localName || "").toLowerCase();
  return h.some((function(e) {
    return t.indexOf(e.toLowerCase()) >= 0
  }))
}

function b(e) {
  var t, n, a = w("00002760-08C2-11E1-9073-0E8AC72E1001");
  return function(e) {
    return [e.name, e.localName].some((function(e) {
      var t = String(e || "").trim().toUpperCase();
      return v.some((function(e) {
        return t.slice(0, e.length) === e
      }))
    }))
  }(e) || (e.advertisServiceUUIDs || []).some((function(e) {
    return w(e) === a
  })) || function(e, t) {
    if (!e || !t) return !1;
    var n = new Uint8Array(e),
      a = Array.prototype.map.call(n, (function(e) {
        return e.toString(16).padStart(2, "0")
      })).join(""),
      i = t.match(/../g).reverse().join("");
    if (a.indexOf(t) >= 0 || a.indexOf(i) >= 0) return !0;
    for (var r = 0; r < n.length;) {
      var s = n[r];
      if (!s) break;
      var c = n[r + 1],
        o = r + 1 + s;
      if ((6 === c || 7 === c) && o <= n.length)
        for (var u = r + 2; u + 15 < o; u += 16) {
          if (Array.prototype.map.call(n.slice(u, u + 16), (function(e) {
              return e.toString(16).padStart(2, "0")
            })).reverse().join("") === t) return !0
        }
      r = o
    }
    return !1
  }(e.advertisData, a) || (t = e.advertisData, !!(n = D(t)) && p.some((function(e) {
    return n.indexOf(e) >= 0
  })))
}

function w(e) {
  return String(e || "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function D(e) {
  return e ? Array.prototype.map.call(new Uint8Array(e), (function(e) {
    return e.toString(16).padStart(2, "0")
  })).join("") : ""
}

function S(e) {
  return (e.advertisServiceUUIDs || []).join(", ") || "--"
}

function T(e) {
  var t = e.name || e.localName || "";
  return {
    deviceId: e.deviceId,
    advertisData: e.advertisData,
    advertisDataHex: D(e.advertisData),
    uuidText: S(e),
    name: t || "未广播名称",
    RSSI: "number" == typeof e.RSSI ? e.RSSI : "--",
    dbm: ("number" == typeof e.RSSI ? e.RSSI : "--") + "dbm",
    connectable: !1 !== e.connectable,
    isBms: f(e) || b(e),
    isBmsUuid: b(e),
    mock: !!e.mock
  }
}

function x(e, t) {
  var n = getApp(),
    a = n.globalData.connected && n.globalData.deviceId || "",
    i = (e || []).filter((function(e) {
      return !a || e.deviceId !== a
    }));
  return t ? i.filter((function(e) {
    return e.isBmsUuid
  })) : i
}

function y(e) {
  if (!e) return "";
  var t = e instanceof Date ? e : new Date(e);
  if (Number.isNaN(t.getTime())) return "";
  var n = function(e) {
    return String(e).padStart(2, "0")
  };
  return t.getFullYear() + "-" + n(t.getMonth() + 1) + "-" + n(t.getDate()) + " " + n(t.getHours()) + ":" + n(t.getMinutes())
}

function k(e) {
  var t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
  return t ? function(e, t, n) {
    t /= 100, n /= 100;
    var a = (1 - Math.abs(2 * n - 1)) * t,
      i = a * (1 - Math.abs(e / 60 % 2 - 1)),
      r = n - a / 2,
      s = 0,
      c = 0,
      o = 0;
    e < 60 ? (s = a, c = i) : e < 120 ? (s = i, c = a) : e < 180 ? (c = a, o = i) : e < 240 ? (c = i, o = a) : e < 300 ? (s = i, o = a) : (s = a, o = i);
    return "#" + [s, c, o].map((function(e) {
      return Math.round(255 * (e + r)).toString(16).padStart(2, "0")
    })).join("").toUpperCase()
  }(360 * Math.max(0, Math.min(1, (t.clientX - 9) / 151)), 86, 18 + 44 * (1 - Math.max(0, Math.min(1, (t.clientY - 44) / 102)))) : ""
}
Page({
  data: {
    mockMode: !1,
    connected: !1,
    connectionStatus: "离线：",
    scanning: !1,
    showDevices: !1,
    showPassword: !1,
    showConnectFly: !1,
    deviceName: "--",
    firmware: "--",
    cellType: "--",
    cellCount: "--",
    rtc: "--",
    devices: [],
    filteredDevices: [],
    bmsOnly: !1,
    status: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    changingPassword: !1,
    cloudEnabled: !1,
    boundDevices: [],
    boundLoading: !1,
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    themeOptions: l.options(),
    showThemePalette: !1
  },
  onShow: function() {
    var e = this;
    this.pageVisible = !0, this.connectionAnimationReady = !1, d.sync(this, "/pages/mine/mine"), this.unsubscribeTheme || (this.unsubscribeTheme = l.subscribe(this)), l.sync(this);
    var t = getApp();
    this.unsubscribeConnection || (this.unsubscribeConnection = s.subscribe((function(t) {
      return e.syncConnectionState(t)
    }))), this.setData({
      mockMode: t.globalData.mockMode,
      connected: t.globalData.connected,
      connectionStatus: t.globalData.connectionStatus || (t.globalData.connected ? "已连接：" : "离线："),
      deviceName: t.globalData.deviceName || "--"
    }), t.globalData.mockMode ? this.applyDevices(r.devices().map(T)) : this.initBle(), t.globalData.connected ? (c.isRunning(this) || c.clear(this), this.loadHardware()) : this.clearHardware(), this.loadBoundDevices(), t.globalData.pendingOpenDeviceList && (t.globalData.pendingOpenDeviceList = !1, this.openDeviceList()), t.globalData.pendingScanCode && (t.globalData.pendingScanCode = !1, this.scanCode()), m && clearInterval(m), m = setInterval((function() {
      return e.refresh()
    }), 2e3), this.refresh()
  },
  onReady: function() {
    d.sync(this, "/pages/mine/mine")
  },
  onHide: function() {
    this.pageVisible = !1, this.connectionAnimationReady = !1, m && clearInterval(m), c.clear(this), m = null
  },
  onUnload: function() {
    this.pageVisible = !1, this.connectionAnimationReady = !1, m && clearInterval(m), c.clear(this), m = null, this.unsubscribeConnection && this.unsubscribeConnection(), this.unsubscribeConnection = null, this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTheme = null
  },
  cycleTheme: function() {
    l.togglePalette()
  },
  selectTheme: function(e) {
    l.selectColor(e.currentTarget.dataset.color), l.closePalette()
  },
  touchThemePalette: function(e) {
    var t = k(e);
    t && l.previewColor(t)
  },
  commitThemePalette: function(e) {
    var t = k(e);
    t && l.selectColor(t)
  },
  closeThemePalette: function() {
    l.closePalette()
  },
  syncConnectionState: function(e) {
    e || (e = s.getState());
    var t = this.data.connected,
      n = void 0 !== this.activeConnectionSeq && this.activeConnectionSeq !== e.connectionSeq,
      a = t && !e.connected;
    this.activeConnectionSeq = e.connectionSeq, this.setData({
      connected: e.connected,
      connectionStatus: e.connectionStatus,
      deviceName: e.deviceName || "--"
    }), c.shouldRun(this, t, e) ? c.trigger(this) : e.connected || c.clear(this), (n || a || !e.connected) && this.clearHardware(), !t && e.connected && this.loadHardware()
  },
  refresh: function() {
    var e = getApp();
    this.syncConnectionState(s.getState()), e.globalData.connected ? this.loadHardware() : this.tryReconnect()
  },
  tryReconnect: function() {
    var n = this;
    return t(e().mark((function t() {
      var a, i, r;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (a = getApp(), i = s.getState(), !(!a.globalData.deviceId || a.globalData.mockMode || i.connected || i.connecting || i.reconnecting)) {
              e.next = 4;
              break
            }
            return e.abrupt("return");
          case 4:
            if (!(Date.now() - g < 8e3)) {
              e.next = 6;
              break
            }
            return e.abrupt("return");
          case 6:
            return g = Date.now(), e.prev = 7, e.next = 10, s.reconnect({
              directAttempts: 2,
              timeoutMs: 3e3,
              mock: a.globalData.mockMode
            });
          case 10:
            r = e.sent, n.syncConnectionState(s.getState()), r.ok && n.loadHardware(), e.next = 19;
            break;
          case 15:
            e.prev = 15, e.t0 = e.catch(7), n.syncConnectionState(s.getState()), n.setData({
              status: e.t0.errMsg || e.t0.message || "重连失败"
            });
          case 19:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [7, 15]
      ])
    })))()
  },
  initBle: function() {
    var n = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.prev = 0, e.next = 3, s.init((function(e) {
              return n.upsertDevice(e)
            }));
          case 3:
            n.setData({
              status: "蓝牙已就绪"
            }), e.next = 9;
            break;
          case 6:
            e.prev = 6, e.t0 = e.catch(0), n.setData({
              status: e.t0.errMsg || e.t0.message || "蓝牙初始化失败"
            });
          case 9:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [0, 6]
      ])
    })))()
  },
  loadHardware: function() {
    var n = this;
    return t(e().mark((function t() {
      var r, s, c;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (!n.loadingHardware) {
              e.next = 2;
              break
            }
            return e.abrupt("return");
          case 2:
            if (n.loadingHardware = !0, e.prev = 3, getApp().globalData.connected) {
              e.next = 8;
              break
            }
            return n.clearHardware(), e.abrupt("return");
          case 8:
            return e.next = 10, a.readRegisters(0, 32);
          case 10:
            r = e.sent, s = i.u16(r, 19), c = i.u16(r, 24), n.setData({
              firmware: (s >> 8 & 255) + "." + (255 & s),
              cellType: o[255 & c] || "未知",
              cellCount: c >> 8 & 255,
              rtc: n.formatRtc(i.u16(r, 21), i.u16(r, 22), i.u16(r, 23))
            }), e.next = 19;
            break;
          case 16:
            e.prev = 16, e.t0 = e.catch(3), n.setData({
              status: e.t0.message || String(e.t0)
            });
          case 19:
            return e.prev = 19, n.loadingHardware = !1, e.finish(19);
          case 22:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [3, 16, 19, 22]
      ])
    })))()
  },
  clearHardware: function() {
    this.setData({
      firmware: "--",
      cellType: "--",
      cellCount: "--",
      rtc: "--",
      status: ""
    })
  },
  loadBoundDevices: function() {
    var n = this;
    return t(e().mark((function t() {
      var a, i, r, s, c;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (a = u.isReady(), n.setData({
                cloudEnabled: a
              }), a) {
              e.next = 4;
              break
            }
            return e.abrupt("return");
          case 4:
            if (!n.loadingBound) {
              e.next = 6;
              break
            }
            return e.abrupt("return");
          case 6:
            return n.loadingBound = !0, n.setData({
              boundLoading: !0
            }), e.prev = 8, e.next = 11, u.getBindings();
          case 11:
            i = e.sent, r = i && i.devices || [], s = getApp().globalData.bmsid || "", c = r.map((function(e) {
              return {
                bmsid: e.bmsid,
                title: e.deviceName || e.sn || e.bmsid,
                sub: e.model || e.manufacturer || "",
                roleText: "owner" === e.role ? "拥有者" : "成员",
                online: !!s && e.bmsid === s,
                lastSeenText: y(e.lastSeenAt)
              }
            })), n.setData({
              boundDevices: c,
              boundLoading: !1
            }), e.next = 21;
            break;
          case 18:
            e.prev = 18, e.t0 = e.catch(8), n.setData({
              boundLoading: !1
            });
          case 21:
            return e.prev = 21, n.loadingBound = !1, e.finish(21);
          case 24:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [8, 18, 21, 24]
      ])
    })))()
  },
  applyDevices: function(e, t) {
    var n = e || [];
    this.setData(Object.assign({
      devices: n,
      filteredDevices: x(n, this.data.bmsOnly)
    }, t || {}))
  },
  toggleBmsOnly: function(e) {
    var t = e.detail.value;
    this.setData({
      bmsOnly: t,
      filteredDevices: x(this.data.devices, t)
    })
  },
  upsertDevice: function(e) {
    var t = T(e);
    this.deviceMap = this.deviceMap || {};
    var n = this.deviceMap[t.deviceId] || {};
    this.deviceMap[t.deviceId] = Object.assign({}, n, t, {
      lastSeenAt: Date.now(),
      isBms: !(!n.isBms && !t.isBms),
      isBmsUuid: !(!n.isBmsUuid && !t.isBmsUuid),
      advertisData: t.advertisData || n.advertisData,
      advertisDataHex: t.advertisDataHex || n.advertisDataHex,
      uuidText: "--" !== t.uuidText ? t.uuidText : n.uuidText || "--"
    }), this.scheduleDeviceListUpdate(this.currentScanDevices())
  },
  currentScanDevices: function() {
    var e = Date.now(),
      t = this.deviceMap || {};
    return this.data.scanning && Object.keys(t).forEach((function(n) {
      e - (t[n].lastSeenAt || 0) > 2e4 && delete t[n]
    })), Object.keys(t).map((function(e) {
      return t[e]
    })).slice().sort((function(e, t) {
      return (Number(t.RSSI) || -999) - (Number(e.RSSI) || -999)
    }))
  },
  scheduleDeviceListUpdate: function(e) {
    var t = this;
    this.pendingDevices = e;
    var n = Date.now(),
      a = this.lastDeviceListUpdateAt || 0,
      i = Math.max(0, 1e3 - (n - a));
    if (!i) return clearTimeout(this.deviceListUpdateTimer), this.lastDeviceListUpdateAt = n, this.applyDevices(this.currentScanDevices()), void(this.data.scanning && this.scheduleDeviceListUpdate(this.currentScanDevices()));
    this.deviceListUpdateTimer || (this.deviceListUpdateTimer = setTimeout((function() {
      t.deviceListUpdateTimer = null, t.lastDeviceListUpdateAt = Date.now(), t.applyDevices(t.currentScanDevices()), t.data.scanning && t.scheduleDeviceListUpdate(t.currentScanDevices())
    }), i))
  },
  openDeviceList: function() {
    getApp().globalData.pendingOpenDeviceList = !0, wx.switchTab({
      url: "../dashboard/dashboard"
    })
  },
  closeDeviceList: function() {
    this.data.scanning && !this.data.mockMode && n.stopScan(), clearTimeout(this.deviceListUpdateTimer), this.deviceListUpdateTimer = null, this.clearDeviceScanCache(), this.setData({
      showDevices: !1,
      scanning: !1,
      devices: [],
      filteredDevices: []
    })
  },
  clearDeviceScanCache: function() {
    clearTimeout(this.deviceListUpdateTimer), this.deviceListUpdateTimer = null, this.deviceMap = {}, this.pendingDevices = [], this.lastDeviceListUpdateAt = 0
  },
  scanDevices: function() {
    var e = this;
    this.data.mockMode ? this.applyDevices(r.devices().map(T), {
      scanning: !1,
      status: "模拟设备列表"
    }) : (this.deviceMap = {}, this.pendingDevices = [], this.lastDeviceListUpdateAt = 0, clearTimeout(this.deviceListUpdateTimer), this.deviceListUpdateTimer = null, this.applyDevices([], {
      scanning: !0,
      status: "正在搜索设备"
    }), n.startScan(!1).catch((function(t) {
      e.setData({
        scanning: !1,
        status: t.message || t.errMsg || "蓝牙搜索失败"
      })
    })), clearTimeout(this.scanTimer), this.scanTimer = setTimeout((function() {
      return e.stopScan()
    }), 15e3))
  },
  stopScan: function() {
    clearTimeout(this.scanTimer), n.stopScan(), clearTimeout(this.deviceListUpdateTimer), this.deviceListUpdateTimer = null, this.applyDevices(this.currentScanDevices()), this.setData({
      scanning: !1,
      status: "搜索完成"
    })
  },
  connectDevice: function(a) {
    var i = this;
    return t(e().mark((function t() {
      var r, c;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if ((r = a.currentTarget.dataset.device) && !1 !== r.connectable) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "请选择可连接设备",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            return wx.showLoading({
              title: "连接中"
            }), e.prev = 5, i.data.scanning && !i.data.mockMode && n.stopScan(), clearTimeout(i.scanTimer), clearTimeout(i.deviceListUpdateTimer), i.deviceListUpdateTimer = null, i.clearHardware(), i.setData({
              connected: !1,
              connectionStatus: "离线：",
              deviceName: r.name,
              showDevices: !1,
              scanning: !1
            }), e.next = 14, s.connectDevice(r, {
              mock: r.mock || i.data.mockMode
            });
          case 14:
            if (c = e.sent, i.syncConnectionState(s.getState()), c.ok) {
              e.next = 18;
              break
            }
            throw c.error || new Error("连接失败");
          case 18:
            i.setData({
              showDevices: !1,
              scanning: !1,
              status: "连接成功"
            }), i.loadHardware(), e.next = 26;
            break;
          case 22:
            e.prev = 22, e.t0 = e.catch(5), i.syncConnectionState(s.getState()), i.setData({
              status: e.t0.errMsg || e.t0.message || "连接失败"
            });
          case 26:
            wx.hideLoading();
          case 27:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [5, 22]
      ])
    })))()
  },
  changePassword: function() {
    getApp().globalData.connected ? this.setData({
      showPassword: !0,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      changingPassword: !1
    }) : wx.showToast({
      title: "请先连接 BMS",
      icon: "none"
    })
  },
  scanCode: function() {
    getApp().globalData.pendingScanCode = !0, wx.switchTab({
      url: "../dashboard/dashboard"
    })
  },
  closePassword: function() {
    this.data.changingPassword || this.setData({
      showPassword: !1
    })
  },
  confirmPassword: function() {
    var n = this;
    return t(e().mark((function t() {
      var i, r;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (!n.data.changingPassword) {
              e.next = 2;
              break
            }
            return e.abrupt("return");
          case 2:
            if (getApp().globalData.connected) {
              e.next = 5;
              break
            }
            return wx.showToast({
              title: "请先连接 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 5:
            if (i = String(n.data.oldPassword || "").trim().toUpperCase(), r = function(e) {
                return /^\d{4}$/.test(e)
              }, i) {
              e.next = 10;
              break
            }
            return wx.showToast({
              title: "请输入原密码",
              icon: "none"
            }), e.abrupt("return");
          case 10:
            if ("EDCB" === i || r(n.data.oldPassword)) {
              e.next = 14;
              break
            }
            return wx.showToast({
              title: "原密码为 4 位数字",
              icon: "none"
            }), e.abrupt("return");
          case 14:
            if (r(n.data.newPassword) && r(n.data.confirmPassword)) {
              e.next = 17;
              break
            }
            return wx.showToast({
              title: "新密码为 4 位数字",
              icon: "none"
            }), e.abrupt("return");
          case 17:
            if (n.data.newPassword === n.data.confirmPassword) {
              e.next = 20;
              break
            }
            return wx.showToast({
              title: "两次新密码不一致",
              icon: "none"
            }), e.abrupt("return");
          case 20:
            if ("EDCB" === i || n.data.oldPassword !== n.data.newPassword) {
              e.next = 23;
              break
            }
            return wx.showToast({
              title: "新密码不能与原密码相同",
              icon: "none"
            }), e.abrupt("return");
          case 23:
            return n.setData({
              changingPassword: !0
            }), wx.showLoading({
              title: "修改中"
            }), e.prev = 25, e.next = 28, a.changePassword(i, n.data.newPassword, 3e3);
          case 28:
            wx.hideLoading(), n.setData({
              showPassword: !1,
              changingPassword: !1,
              oldPassword: "",
              newPassword: "",
              confirmPassword: "",
              status: "密码修改成功"
            }), wx.showToast({
              title: "修改成功",
              icon: "success"
            }), e.next = 38;
            break;
          case 33:
            e.prev = 33, e.t0 = e.catch(25), wx.hideLoading(), n.setData({
              changingPassword: !1,
              status: e.t0.message || e.t0.errMsg || "修改密码失败"
            }), wx.showToast({
              title: e.t0.message || e.t0.errMsg || "修改密码失败",
              icon: "none"
            });
          case 38:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [25, 33]
      ])
    })))()
  },
  setOld: function(e) {
    this.setData({
      oldPassword: String(e.detail.value || "").trim().toUpperCase()
    })
  },
  setNew: function(e) {
    this.setData({
      newPassword: e.detail.value
    })
  },
  setConfirm: function(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },
  ota: function() {
    wx.navigateTo({
      url: "../ota/ota"
    })
  },
  batteryInfo: function() {
    wx.navigateTo({
      url: "../battery-info/battery-info"
    })
  },
  protectionRecord: function() {
    wx.navigateTo({
      url: "../protection-record/protection-record"
    })
  },
  formatRtc: function(e, t, n) {
    return 2022 + (e >> 8 & 255) + "-" + (255 & e) + "-" + (t >> 8 & 255) + " " + (255 & t) + ":" + (n >> 8 & 255) + ":" + (255 & n)
  }
});