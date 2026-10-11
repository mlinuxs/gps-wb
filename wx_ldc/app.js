var e = require("./utils/connection-manager"),
  n = require("./utils/ble"),
  t = require("./utils/cloud"),
  o = require("./utils/remote-command"),
  c = require("./utils/telemetry"),
  a = require("./utils/theme");
App({
  globalData: {
    slaveAddr: 22,
    connected: !1,
    mockMode: !1,
    debugMode: !1,
    deviceId: "",
    deviceName: "",
    bmsid: "",
    firmwareWord: null,
    firmwareText: "",
    connectionSeq: 0,
    connectionStatus: "离线：",
    restoredLastDevice: !1,
    pendingOpenDeviceList: !1,
    pendingScanCode: !1,
    pendingScanConnect: ""
  },
  onLaunch: function(n) {
    var i = wx.getSystemInfoSync();
    if (this.globalData.mockMode = "devtools" === i.platform, this.globalData.debugMode = "devtools" === i.platform, wx.setEnableDebug && this.globalData.debugMode && wx.setEnableDebug({
        enableDebug: !0
      }), !this.globalData.mockMode) try {
      wx.closeBluetoothAdapter({
        complete: function() {
          setTimeout((function() {
            try {
              wx.openBluetoothAdapter({})
            } catch (e) {}
          }), 200)
        }
      })
    } catch (e) {}
    t.isReady() && (t.login(), o.start(), c.start()), e.installConnectionListener(), e.restoreLastDevice(), this.handleScanLaunch(n), a.sync()
  },
  onShow: function(e) {
    this.handleScanLaunch(e)
  },
  onHide: function() {
    var e = this.globalData || {};
    if (e.connected || "function" != typeof n.shutdownSync) {
      if ("function" == typeof n.disconnectAllExcept) try {
        n.disconnectAllExcept(e.deviceId || "")
      } catch (e) {}
    } else n.shutdownSync()
  },
  onError: function() {
    "function" == typeof n.shutdownSync && n.shutdownSync()
  },
  handleScanLaunch: function(e) {
    var n = function(e) {
      if (!e) return "";
      var n = e.query || {};
      if (n.q) try {
        return decodeURIComponent(n.q)
      } catch (e) {
        return n.q
      }
      if (n.scene) try {
        return decodeURIComponent(n.scene)
      } catch (e) {
        return n.scene
      }
      var t = ["deviceId", "id", "name", "deviceName", "mac", "address", "sn", "serial", "code", "slaveAddr"];
      return t.some((function(e) {
        return void 0 !== n[e] && "" !== n[e]
      })) ? t.filter((function(e) {
        return void 0 !== n[e] && "" !== n[e]
      })).map((function(e) {
        return e + "=" + n[e]
      })).join("&") : ""
    }(e);
    n && (this.globalData.pendingScanConnect = n, wx.switchTab && wx.switchTab({
      url: "/pages/dashboard/dashboard",
      fail: function() {}
    }))
  }
});