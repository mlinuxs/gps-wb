var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  a = require("../../utils/ble"),
  n = require("../../utils/connection-manager"),
  c = require("../../utils/mock-bms"),
  s = ["BMS", "Battery", "SmartBMS", "JBD", "Daly", "JK", "Jikong", "ANT", "Xiaoxiang"];

function r(e) {
  var t = (e.name || e.localName || "").toLowerCase();
  return s.some((function(e) {
    return t.indexOf(e.toLowerCase()) >= 0
  }))
}

function i(e) {
  var t = e.name || e.localName || "";
  return {
    deviceId: e.deviceId,
    name: t || "未广播名称",
    localName: e.localName || "",
    RSSI: "number" == typeof e.RSSI ? e.RSSI : "--",
    connectable: !1 !== e.connectable,
    services: (e.advertisServiceUUIDs || []).join(", "),
    isBms: r(e) || (e.advertisServiceUUIDs || []).join(",").indexOf("2760") >= 0,
    mock: !!e.mock
  }
}

function o(e) {
  return e.slice().sort((function(e, t) {
    return e.isBms !== t.isBms ? e.isBms ? -1 : 1 : e.connectable !== t.connectable ? e.connectable ? -1 : 1 : "未广播名称" !== e.name != ("未广播名称" !== t.name) ? "未广播名称" !== e.name ? -1 : 1 : (Number(t.RSSI) || -999) - (Number(e.RSSI) || -999)
  }))
}
Page({
  data: {
    mockMode: !1,
    connected: !1,
    deviceName: "",
    scanning: !1,
    onlyBms: !1,
    devices: [],
    status: ""
  },
  onLoad: function() {
    var e = getApp();
    this.setData({
      mockMode: e.globalData.mockMode,
      connected: e.globalData.connected,
      deviceName: e.globalData.deviceName
    }), e.globalData.mockMode ? this.loadMockDevices() : this.initBle()
  },
  onShow: function() {
    var e = getApp();
    this.setData({
      connected: e.globalData.connected,
      deviceName: e.globalData.deviceName
    })
  },
  loadMockDevices: function() {
    this.setData({
      status: "电脑预览模式：蓝牙由模拟数据代替。真实 BMS 请用手机真机调试。",
      devices: c.devices().map(i)
    })
  },
  initBle: function() {
    var a = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.prev = 0, e.next = 3, n.init((function(e) {
              return a.upsertDevice(e)
            }));
          case 3:
            a.setData({
              status: "蓝牙已就绪，请开始扫描。"
            }), e.next = 9;
            break;
          case 6:
            e.prev = 6, e.t0 = e.catch(0), a.setData({
              status: "蓝牙初始化失败：" + (e.t0.errMsg || e.t0.message || JSON.stringify(e.t0))
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
  upsertDevice: function(e) {
    var t = i(e);
    t.lastSeenAt = Date.now();
    var a = this.data.devices.slice(),
      n = a.findIndex((function(e) {
        return e.deviceId === t.deviceId
      }));
    n >= 0 ? a[n] = Object.assign({}, a[n], t) : a.push(t), this.setData({
      devices: o(a)
    })
  },
  currentScanDevices: function() {
    var e = Date.now();
    return o((this.data.devices || []).filter((function(t) {
      return e - (t.lastSeenAt || 0) <= 2500
    })))
  },
  scanAll: function() {
    this.data.mockMode ? this.loadMockDevices() : this.startScan(!1)
  },
  scanBms: function() {
    this.data.mockMode ? this.loadMockDevices() : this.startScan(!0)
  },
  startScan: function(n) {
    var c = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return c.setData({
              devices: [],
              scanning: !0,
              onlyBms: n,
              status: n ? "正在扫描全部蓝牙，并优先显示疑似 BMS 设备..." : "正在扫描附近蓝牙设备..."
            }), e.prev = 1, e.next = 4, a.startScan(n);
          case 4:
            e.next = 10;
            break;
          case 6:
            return e.prev = 6, e.t0 = e.catch(1), c.setData({
              scanning: !1,
              status: e.t0.message || e.t0.errMsg || "蓝牙扫描失败"
            }), e.abrupt("return");
          case 10:
            clearTimeout(c.scanTimer), c.scanTimer = setTimeout((function() {
              return c.stopScan()
            }), 15e3), clearInterval(c.scanExpireTimer), c.scanExpireTimer = setInterval((function() {
              c.data.scanning && c.setData({
                devices: c.currentScanDevices()
              })
            }), 1e3);
          case 14:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [1, 6]
      ])
    })))()
  },
  stopScan: function() {
    this.scanTimer && clearTimeout(this.scanTimer), clearInterval(this.scanExpireTimer), a.stopScan();
    var e = this.currentScanDevices();
    this.setData({
      devices: e,
      scanning: !1,
      status: "扫描已停止，共发现 " + e.length + " 个设备。"
    })
  },
  bindDevice: function(c) {
    var s = this;
    return t(e().mark((function t() {
      var r, i;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if ((r = c.currentTarget.dataset.device).connectable) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "该设备不可连接",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            return wx.showLoading({
              title: "连接中..."
            }), e.prev = 5, s.data.scanning && !s.data.mockMode && a.stopScan(), s.setData({
              connected: !1,
              deviceName: r.name,
              scanning: !1
            }), e.next = 10, n.connectDevice(r, {
              mock: s.data.mockMode || r.mock
            });
          case 10:
            if ((i = e.sent).ok) {
              e.next = 13;
              break
            }
            throw i.error || new Error("连接失败");
          case 13:
            s.setData({
              connected: !0,
              deviceName: r.name,
              status: "已连接：" + r.name
            }), wx.switchTab({
              url: "../dashboard/dashboard"
            }), e.next = 20;
            break;
          case 17:
            e.prev = 17, e.t0 = e.catch(5), s.setData({
              status: "连接失败：" + (e.t0.errMsg || e.t0.message || JSON.stringify(e.t0))
            });
          case 20:
            wx.hideLoading();
          case 21:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [5, 17]
      ])
    })))()
  },
  disconnect: function() {
    var a = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.next = 2, n.disconnect({
              clearTarget: !0
            });
          case 2:
            a.setData({
              connected: !1,
              deviceName: "",
              status: "已断开连接。"
            });
          case 3:
          case "end":
            return e.stop()
        }
      }), t)
    })))()
  },
  onUnload: function() {
    this.scanTimer && clearTimeout(this.scanTimer), clearInterval(this.scanExpireTimer), this.data.mockMode || a.stopScan()
  }
});