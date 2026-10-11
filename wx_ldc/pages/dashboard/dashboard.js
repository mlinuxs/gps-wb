var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  a = require("../../@babel/runtime/helpers/typeof"),
  n = require("../../utils/ble"),
  r = require("../../utils/connection-manager"),
  s = require("../../utils/bms-client"),
  i = require("../../utils/protocol"),
  c = require("../../utils/mock-bms"),
  o = require("../../utils/connect-animation"),
  u = require("../../utils/telemetry"),
  l = require("../../utils/tabbar"),
  d = require("../../utils/theme"),
  h = require("../../utils/registers"),
  m = h.CELL_TYPES,
  p = h.ALARM_BITS,
  f = h.PACK_BITS,
  v = h.decodeBits;

function g(e, t) {
  var a = String(e && (e.errMsg || e.message) || "").toLowerCase();
  return a ? a.indexOf("system error") >= 0 ? "" : a.indexOf("fail") >= 0 || a.indexOf("error") >= 0 ? t || "" : e.errMsg || e.message || t || "" : t || ""
}
var b = null,
  x = 0,
  C = !1,
  D = !1,
  S = null,
  w = !1,
  k = null,
  T = !1;

function y(e) {
  return (Number(e) || 0) > 24 ? 2e3 : 1200
}
var M = ["runtime", "soc", "socLevel", "socPercent", "socTextWidth", "socBatteryClass", "socBlinkClass", "soh", "voltage", "current", "totalPower", "remainCap", "remainAh", "fullCap", "designCap", "designAh", "cycle", "mosTemp", "temp1", "temp2", "temp3", "firmware", "cellCount", "cellType", "rtc", "alarms", "states", "alarmText", "protectText", "batteryStateText", "afeStatusItems", "alarmStatusItems", "packStatusItems", "chargeMos", "chargeMosClass", "dischargeMos", "dischargeMosClass", "balanceStatus", "balanceStatusClass", "runStatus", "runStatusClass", "maxVoltage", "minVoltage", "maxCellNo", "minCellNo", "deltaVoltage", "avgVoltage", "balanceCurrent", "cells", "cellGridClass"],
  A = ["BMS", "Battery", "SmartBMS", "JBD", "Daly", "JK", "Jikong", "ANT", "LABMS"],
  N = ["LABMS"],
  I = ["ffff4e6174696f6e73"],
  R = [
    [0, "过压保护"],
    [1, "欠压保护"],
    [2, "放电过流2保护"],
    [3, "放电过流1保护"],
    [4, "充电过流保护"],
    [5, "短路保护"],
    [6, "断线保护"],
    [7, "低压禁充保护"],
    [8, "充电低温保护"],
    [9, "充电高温保护"],
    [10, "放电低温保护"],
    [11, "放电高温保护"],
    [18, "硬件放电保护"],
    [19, "硬件充电保护"],
    [20, "PRO状态"],
    [21, "CTLD状态"],
    [22, "PD状态"]
  ],
  F = [
    [0, "超高压报警"],
    [1, "超低压报警"],
    [2, "防拆卸报警"],
    [3, "电压线断线"],
    [4, "温度线断线"],
    [5, "AFE 通讯失效"],
    [6, "压差过大"]
  ],
  L = [
    [0, "零电流未校准", !1],
    [1, "电流未校准", !1],
    [2, "强制开启放电", !0],
    [3, "手动关闭放电", !0],
    [4, "强制开启充电", !0],
    [5, "手动关闭充电", !0],
    [6, "电池加热中", !0],
    [8, "满充电", !0],
    [10, "允许容量更新", !0],
    [13, "AFE 配置失败", !0],
    [15, "固件未解锁", !0]
  ];

function B(e, t) {
  return Math.floor((e >>> 0) / Math.pow(2, t)) % 2 == 1
}

function P(e, t) {
  return t.filter((function(t) {
    return B(e, t[0]) === (!(t.length > 2) || t[2])
  })).map((function(e) {
    return e[1]
  }))
}
var O = {};

function U(e) {
  return L.filter((function(t) {
    var a = !(t.length > 2) || t[2],
      n = B(e, t[0]) === a;
    if (!1 !== a) return n;
    var r = "bit_" + t[0];
    return n ? (O[r] = (O[r] || 0) + 1, O[r] >= 2) : (O[r] = 0, !1)
  })).map((function(e) {
    return {
      text: e[1],
      danger: 3 === e[0] || 5 === e[0] || 15 === e[0]
    }
  }))
}

function V(e) {
  var t = (e.name || e.localName || "").toLowerCase();
  return A.some((function(e) {
    return t.indexOf(e.toLowerCase()) >= 0
  }))
}

function _(e) {
  var t, a, n = q("00002760-08C2-11E1-9073-0E8AC72E1001");
  return function(e) {
    return [e.name, e.localName].some((function(e) {
      var t = String(e || "").trim().toUpperCase();
      return N.some((function(e) {
        return t.slice(0, e.length) === e
      }))
    }))
  }(e) || (e.advertisServiceUUIDs || []).some((function(e) {
    return q(e) === n
  })) || function(e, t) {
    if (!e || !t) return !1;
    var a = new Uint8Array(e),
      n = Array.prototype.map.call(a, (function(e) {
        return e.toString(16).padStart(2, "0")
      })).join(""),
      r = t.match(/../g).reverse().join("");
    if (n.indexOf(t) >= 0 || n.indexOf(r) >= 0) return !0;
    for (var s = 0; s < a.length;) {
      var i = a[s];
      if (!i) break;
      var c = a[s + 1],
        o = s + 1 + i;
      if ((6 === c || 7 === c) && o <= a.length)
        for (var u = s + 2; u + 15 < o; u += 16) {
          if (Array.prototype.map.call(a.slice(u, u + 16), (function(e) {
              return e.toString(16).padStart(2, "0")
            })).reverse().join("") === t) return !0
        }
      s = o
    }
    return !1
  }(e.advertisData, n) || (t = e.advertisData, !!(a = j(t)) && I.some((function(e) {
    return a.indexOf(e) >= 0
  })))
}

function j(e) {
  return e ? Array.prototype.map.call(new Uint8Array(e), (function(e) {
    return e.toString(16).padStart(2, "0")
  })).join("") : ""
}

function E(e) {
  return (e.advertisServiceUUIDs || []).join(", ") || "--"
}

function q(e) {
  return String(e || "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function G(e) {
  var t = e.name || e.localName || "";
  return {
    deviceId: e.deviceId,
    rawDeviceId: e.deviceId,
    localName: e.localName || "",
    advertisData: e.advertisData,
    advertisDataHex: j(e.advertisData),
    uuidText: E(e),
    name: t || "未广播名称",
    RSSI: "number" == typeof e.RSSI ? e.RSSI : "--",
    dbm: ("number" == typeof e.RSSI ? e.RSSI : "--") + "dbm",
    connectable: !1 !== e.connectable,
    isBms: V(e) || _(e),
    isBmsUuid: _(e),
    mock: !!e.mock
  }
}

function W(e, t) {
  var a = getApp(),
    n = a.globalData.connected && a.globalData.deviceId || "",
    r = (e || []).filter((function(e) {
      return !n || e.deviceId !== n
    }));
  return t ? r.filter((function(e) {
    return e.isBmsUuid
  })) : r
}

function H(e) {
  return String(e || "").replace(/^.*?[?#]/, "").split("&").reduce((function(e, t) {
    var a, n, r = t.indexOf("=");
    if (r <= 0) return e;
    try {
      a = decodeURIComponent(t.slice(0, r)).trim(), n = decodeURIComponent(t.slice(r + 1)).trim()
    } catch (t) {
      return e
    }
    return a && (e[a] = n), e
  }), {})
}

function Q(e) {
  var t = String(e || "").trim();
  if (!t) return null;
  try {
    var n = JSON.parse(t);
    if (n && "object" === a(n)) return {
      raw: t,
      deviceId: n.deviceId || n.id || "",
      name: n.name || n.deviceName || "",
      mac: n.mac || n.address || "",
      sn: n.sn || n.serial || n.code || "",
      slaveAddr: n.slaveAddr
    }
  } catch (e) {}
  var r = t.indexOf("=") >= 0 ? H(t) : {};
  return r.deviceId || r.id || r.name || r.deviceName || r.mac || r.address || r.sn || r.serial || r.code ? {
    raw: t,
    deviceId: r.deviceId || r.id || "",
    name: r.name || r.deviceName || "",
    mac: r.mac || r.address || "",
    sn: r.sn || r.serial || r.code || "",
    slaveAddr: r.slaveAddr
  } : {
    raw: t,
    deviceId: t,
    name: "",
    mac: t,
    sn: t,
    slaveAddr: void 0
  }
}

function J(e, t) {
  var a = [e.deviceId, e.name, e.mac, e.sn, e.raw].map(q).filter((function(e) {
    return e.length >= 4
  }));
  if (!a.length) return !1;
  var n = [t.deviceId, t.rawDeviceId, t.name, t.localName, t.advertisDataHex].map(q).filter(Boolean);
  return a.some((function(e) {
    return n.some((function(t) {
      return t === e || t.indexOf(e) >= 0 || e.indexOf(t) >= 0
    }))
  }))
}

function z(e) {
  if (!e || e.length > 18) return null;
  for (var t = [], a = 0; a < e.length; a++) {
    var n = e.charCodeAt(a);
    if (n < 32 || n > 126) return null;
    t.push(255 & n)
  }
  for (; t.length < 18;) t.push(0);
  for (var r = [], s = 0; s < t.length; s += 2) r.push((255 & t[s]) << 8 | 255 & t[s + 1]);
  return r
}

function K(e) {
  var t = String(e || "").match(/^(.*?)(\d{4})$/);
  if (!t) return "";
  var a = Number(t[2]) + 1;
  if (a > 9999) return "";
  var n = t[1] + String(a).padStart(4, "0");
  return n.length <= 18 ? n : ""
}

function Y(e) {
  var t = String(e || "").trim();
  if (!t) return "";
  try {
    var n = JSON.parse(t);
    if (n && "object" === a(n)) return String(n.bluetoothName || n.btName || n.bleName || n.name || n.deviceName || t).trim()
  } catch (e) {}
  var r = t.indexOf("=") >= 0 ? H(t) : {};
  return String(r.bluetoothName || r.btName || r.bleName || r.name || r.deviceName || t).trim()
}

function $(e) {
  var t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
  return t ? function(e, t, a) {
    t /= 100, a /= 100;
    var n = (1 - Math.abs(2 * a - 1)) * t,
      r = n * (1 - Math.abs(e / 60 % 2 - 1)),
      s = a - n / 2,
      i = 0,
      c = 0,
      o = 0;
    e < 60 ? (i = n, c = r) : e < 120 ? (i = r, c = n) : e < 180 ? (c = n, o = r) : e < 240 ? (c = r, o = n) : e < 300 ? (i = r, o = n) : (i = n, o = r);
    return "#" + [i, c, o].map((function(e) {
      return Math.round(255 * (e + s)).toString(16).padStart(2, "0")
    })).join("").toUpperCase()
  }(360 * Math.max(0, Math.min(1, (t.clientX - 9) / 151)), 86, 18 + 44 * (1 - Math.max(0, Math.min(1, (t.clientY - 44) / 102)))) : ""
}
Page({
  data: {
    connected: !1,
    connectionStatus: "离线：",
    mockMode: !1,
    scanning: !1,
    showDevices: !1,
    deviceName: "",
    devices: [],
    filteredDevices: [],
    bmsOnly: !1,
    showConnectFly: !1,
    dataReady: !1,
    cachedDashboardUpdating: !1,
    lastUpdate: "--",
    runtime: "--",
    soc: "--",
    socLevel: "empty",
    socPercent: 0,
    socTextWidth: 100,
    socBatteryClass: "soc-battery-ok",
    socBlinkClass: "",
    soh: "--",
    voltage: "--",
    current: "--",
    remainCap: "--",
    fullCap: "--",
    designCap: "--",
    cycle: "--",
    mosTemp: "--",
    temp1: "--",
    temp2: "--",
    temp3: "--",
    firmware: "--",
    cellCount: "--",
    cellType: "--",
    rtc: "--",
    alarms: [],
    states: [],
    chargeMos: "开启",
    chargeMosClass: "status-on",
    dischargeMos: "开启",
    dischargeMosClass: "status-on",
    balanceStatus: "关闭",
    balanceStatusClass: "status-idle",
    runStatus: "静置中",
    runStatusClass: "status-idle",
    totalPower: "0.00",
    maxVoltage: "--",
    minVoltage: "--",
    maxCellNo: "--",
    minCellNo: "--",
    deltaVoltage: "--",
    avgVoltage: "--",
    balanceCurrent: "0.000",
    designAh: "--",
    remainAh: "--",
    alarmText: "无",
    protectText: "无",
    batteryStateText: "无",
    afeStatusItems: [],
    alarmStatusItems: [],
    packStatusItems: [],
    logCount: 0,
    cells: [],
    cellGridClass: "cells-grid-4",
    error: "",
    showBluetoothNamePanel: !1,
    bluetoothNameInput: "",
    bluetoothNameStatus: "",
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    themeOptions: d.options(),
    showThemePalette: !1,
    showThemeGuide: !1
  },
  onShow: function() {
    var e = this;
    this.pageVisible = !0, this.connectionAnimationReady = !1, l.sync(this, "/pages/dashboard/dashboard"), this.unsubscribeTheme || (this.unsubscribeTheme = d.subscribe(this)), d.sync(this);
    var t = getApp();
    t.globalData.connected || t.globalData.deviceId || r.restoreLastDevice(), this.unsubscribeConnection || (this.unsubscribeConnection = r.subscribe((function(t) {
      return e.syncConnectionState(t)
    })));
    var a = t.globalData.connectionSeq || 0;
    if (this.activeConnectionSeq !== a && (this.activeConnectionSeq = a, x = 0, C = !1, this.clearData()), this.setData({
        connected: t.globalData.connected,
        connectionStatus: t.globalData.connectionStatus || (t.globalData.connected ? "已连接：" : "离线："),
        mockMode: t.globalData.mockMode,
        deviceName: t.globalData.deviceName || (t.globalData.mockMode ? "BMS-16S-DEMO" : ""),
        showBluetoothNamePanel: w
      }), this.applyCachedDashboardIfNeeded(r.getState()), this.maybeShowThemeGuide(), t.globalData.connected && !o.isRunning(this) && o.clear(this), t.globalData.mockMode ? (this.applyDevices(c.devices().map(G).filter((function(e) {
        return e.connectable
      }))), this.ensureMockConnected()) : this.initBle(), this.ensureEntryAutoConnect(!0), this.scheduleRefresh(0), this.refreshPendingQuickFields(), t.globalData.pendingOpenDeviceList && (t.globalData.pendingOpenDeviceList = !1, this.openDeviceList()), t.globalData.pendingScanCode && (t.globalData.pendingScanCode = !1, this.scanCode()), t.globalData.pendingScanConnect) {
      var n = t.globalData.pendingScanConnect;
      t.globalData.pendingScanConnect = "", this.connectFromScanned(Q(n))
    }
  },
  onHide: function() {
    this.pageVisible = !1, this.refreshing = !1, this.refreshStartedAt = 0, this.connectionAnimationReady = !1, b && clearTimeout(b), this.cancelBluetoothNameHold(), this.data.scanning && !this.data.mockMode && n.stopScan(), clearTimeout(this.scanTimer), clearTimeout(this.deviceListUpdateTimer), o.clear(this), b = null, this.cancelAutoConnectCandidate(), this.stopReconnectLoop(), "function" == typeof r.resumeStateEvents && r.resumeStateEvents()
  },
  onUnload: function() {
    this.pageVisible = !1, this.refreshing = !1, this.refreshStartedAt = 0, this.connectionAnimationReady = !1, b && clearTimeout(b), b = null, this.cancelBluetoothNameHold(), o.clear(this), this.cancelAutoConnectCandidate(), this.unsubscribeConnection && this.unsubscribeConnection(), this.unsubscribeConnection = null, this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTheme = null
  },
  cycleTheme: function() {
    this.dismissThemeGuide(), d.togglePalette()
  },
  maybeShowThemeGuide: function() {
    try {
      if (wx.getStorageSync("dashboard_theme_guide_seen_v1")) return
    } catch (e) {}
    this.data.showThemeGuide || this.setData({
      showThemeGuide: !0
    })
  },
  dismissThemeGuide: function() {
    this.data.showThemeGuide && this.setData({
      showThemeGuide: !1
    });
    try {
      wx.setStorageSync("dashboard_theme_guide_seen_v1", 1)
    } catch (e) {}
  },
  selectTheme: function(e) {
    d.selectColor(e.currentTarget.dataset.color), d.closePalette()
  },
  touchThemePalette: function(e) {
    var t = $(e);
    t && d.previewColor(t)
  },
  commitThemePalette: function(e) {
    var t = $(e);
    t && d.selectColor(t)
  },
  closeThemePalette: function() {
    d.closePalette()
  },
  cancelBleAfterOffline: function(a) {
    var s = this;
    return t(e().mark((function t() {
      var i;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return C = !1, D = !1, i = "function" == typeof r.cancelActiveConnection ? r.cancelActiveConnection({
              deviceName: a || getApp().globalData.deviceName || s.data.deviceName
            }) : n.cancelPendingOperations(), e.next = 5, Promise.race([Promise.resolve(i).catch((function() {})), new Promise((function(e) {
              return setTimeout(e, 800)
            }))]);
          case 5:
            s.syncConnectionState(r.getState());
          case 6:
          case "end":
            return e.stop()
        }
      }), t)
    })))()
  },
  cancelActiveBleBeforeScan: function(a) {
    var s = this;
    return t(e().mark((function t() {
      var i;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return i = "function" == typeof r.cancelActiveConnection ? r.cancelActiveConnection({
              deviceName: a || getApp().globalData.deviceName || s.data.deviceName
            }) : n.cancelPendingOperations(), e.next = 3, Promise.race([Promise.resolve(i).catch((function() {})), new Promise((function(e) {
              return setTimeout(e, 800)
            }))]);
          case 3:
            return s.syncConnectionState(r.getState()), e.next = 6, new Promise((function(e) {
              return setTimeout(e, 300)
            }));
          case 6:
          case "end":
            return e.stop()
        }
      }), t)
    })))()
  },
  syncConnectionState: function(e) {
    e || (e = r.getState());
    var t = this.data.connected,
      a = void 0 !== this.activeConnectionSeq && this.activeConnectionSeq !== e.connectionSeq,
      n = t && !e.connected;
    this.activeConnectionSeq = e.connectionSeq, this.setData({
      connected: e.connected,
      connectionStatus: e.connectionStatus,
      deviceName: e.deviceName || (this.data.mockMode ? "BMS-16S-DEMO" : "")
    }), o.shouldRun(this, t, e) ? o.trigger(this) : e.connected || o.clear(this), a ? (x = 0, this.clearData(), clearTimeout(k), k = null) : n ? (x = 0, this.refreshing = !1, this.refreshStartedAt = 0, "function" == typeof s.resetPending && s.resetPending(), this.setData({
      dataReady: !1,
      cachedDashboardUpdating: !1,
      error: "设备已离线"
    }), D || this.data.showDevices || this.data.mockMode || this.scheduleNextReconnect(0)) : e.connected ? (clearTimeout(k), k = null) : !e.connected && this.data.cachedDashboardUpdating && this.setData({
      cachedDashboardUpdating: !1
    }), this.applyCachedDashboardIfNeeded(e)
  },
  dashboardCacheDeviceId: function(e) {
    var t = e || r.getState();
    return String(t && t.deviceId || getApp().globalData.deviceId || "")
  },
  readDashboardCacheStore: function() {
    try {
      var e = wx.getStorageSync("dashboard_metrics_cache_v1");
      if (e && "object" === a(e) && e.devices && "object" === a(e.devices)) return e
    } catch (e) {}
    return {
      devices: {}
    }
  },
  writeDashboardCacheStore: function(e) {
    try {
      wx.setStorageSync("dashboard_metrics_cache_v1", e)
    } catch (e) {}
  },
  pruneDashboardCacheStore: function(e, t) {
    var a = e.devices || {};
    return Object.keys(a).forEach((function(e) {
      var n = Number(a[e] && a[e].savedAt) || 0;
      (!n || t - n > 6048e5) && delete a[e]
    })), Object.keys(a).sort((function(e, t) {
      return (a[t].savedAt || 0) - (a[e].savedAt || 0)
    })).slice(50).forEach((function(e) {
      return delete a[e]
    })), e.devices = a, e
  },
  dashboardCachePayload: function() {
    var e = this,
      t = {};
    return M.forEach((function(a) {
      t[a] = e.data[a]
    })), t
  },
  saveDashboardCache: function() {},
  applyCachedDashboardIfNeeded: function(e) {},
  ensureMockConnected: function() {
    return t(e().mark((function t() {
      var a, n;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if ((a = getApp()).globalData.mockMode && !a.globalData.connected) {
              e.next = 3;
              break
            }
            return e.abrupt("return");
          case 3:
            if (n = c.devices().find((function(e) {
                return e.mock && e.connectable && "MOCK_BMS_001" === e.deviceId
              })) || c.devices()[0]) {
              e.next = 6;
              break
            }
            return e.abrupt("return");
          case 6:
            return e.prev = 6, e.next = 9, r.connectDevice(n, {
              mock: !0
            });
          case 9:
            e.next = 13;
            break;
          case 11:
            e.prev = 11, e.t0 = e.catch(6);
          case 13:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [6, 11]
      ])
    })))()
  },
  initBle: function() {
    var a = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.prev = 0, e.next = 3, r.init((function(e) {
              return a.upsertDevice(e, a.scanSessionStartedAt)
            }));
          case 3:
            return e.abrupt("return", !0);
          case 6:
            return e.prev = 6, e.t0 = e.catch(0), a.setData({
              error: e.t0.errMsg || e.t0.message || "蓝牙初始化失败"
            }), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "蓝牙初始化失败",
              icon: "none"
            }), e.abrupt("return", !1);
          case 11:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [0, 6]
      ])
    })))()
  },
  upsertDevice: function(e, t) {
    if (!this.data.showDevices || !t || t === this.scanSessionStartedAt) {
      var a = G(e);
      if (a.connectable) {
        this.deviceMap = this.deviceMap || {};
        var n = this.deviceMap[a.deviceId] || {};
        this.deviceMap[a.deviceId] = Object.assign({}, n, a, {
          lastSeenAt: Date.now(),
          isBms: !(!n.isBms && !a.isBms),
          isBmsUuid: !(!n.isBmsUuid && !a.isBmsUuid),
          advertisData: a.advertisData || n.advertisData,
          advertisDataHex: a.advertisDataHex || n.advertisDataHex,
          uuidText: "--" !== a.uuidText ? a.uuidText : n.uuidText || "--"
        });
        var r = this.currentScanDevices();
        this.scheduleDeviceListUpdate(r)
      }
    }
  },
  currentScanDevices: function() {
    var e = Date.now(),
      t = this.deviceMap || {};
    return this.data.scanning && Object.keys(t).forEach((function(a) {
      e - (t[a].lastSeenAt || 0) > 2e4 && delete t[a]
    })), Object.keys(t).map((function(e) {
      return t[e]
    })).slice().sort((function(e, t) {
      return (Number(t.RSSI) || -999) - (Number(e.RSSI) || -999)
    }))
  },
  applyDevices: function(e, t) {
    var a = e || [],
      n = W(a, this.data.bmsOnly);
    this.setData(Object.assign({
      devices: a,
      filteredDevices: n
    }, t || {})), this.evaluateAutoConnectCandidate(a)
  },
  toggleBmsOnly: function(e) {
    var t = e.detail.value,
      a = W(this.data.devices, t);
    this.setData({
      bmsOnly: t,
      filteredDevices: a
    }), this.evaluateAutoConnectCandidate(this.data.devices)
  },
  evaluateAutoConnectCandidate: function(e) {
    var t = this,
      a = getApp();
    if (this.data.showDevices)
      if (a.globalData && a.globalData.connected) this.cancelAutoConnectCandidate();
      else if (D || C) this.cancelAutoConnectCandidate();
    else {
      var n = (null != e ? e : this.data.devices || []).filter((function(e) {
        return e && e.isBmsUuid && !1 !== e.connectable && e.deviceId
      }));
      if (1 === n.length) {
        var r = n[0];
        r && !1 !== r.connectable && r.deviceId ? this.autoConnectTimer && this.autoConnectCandidateId === r.deviceId || (this.cancelAutoConnectCandidate(), this.autoConnectCandidateId = r.deviceId, this.autoConnectTimer = setTimeout((function() {
          t.autoConnectTimer = null;
          var e = t.autoConnectCandidateId;
          if (t.autoConnectCandidateId = null, t.data.showDevices) {
            var a = (t.data.devices || []).filter((function(e) {
              return e && e.isBmsUuid && !1 !== e.connectable && e.deviceId
            }));
            if (1 === a.length && a[0].deviceId === e) {
              var n = getApp();
              n.globalData && n.globalData.connected || D || C || t.connectDevice({
                currentTarget: {
                  dataset: {
                    device: a[0]
                  }
                }
              })
            }
          }
        }), 2500)) : this.cancelAutoConnectCandidate()
      } else this.cancelAutoConnectCandidate()
    } else this.cancelAutoConnectCandidate()
  },
  cancelAutoConnectCandidate: function() {
    this.autoConnectTimer && (clearTimeout(this.autoConnectTimer), this.autoConnectTimer = null), this.autoConnectCandidateId = null
  },
  onCellTap: function(e) {
    var t = e.currentTarget.dataset.level,
      a = e.currentTarget.dataset.index,
      n = e.currentTarget.dataset.voltage;
    "cell-high" === t ? wx.showToast({
      title: "NO." + a + " 单体最高电压 " + n + "V",
      icon: "none",
      duration: 1500
    }) : "cell-low" === t && wx.showToast({
      title: "NO." + a + " 单体最低电压 " + n + "V",
      icon: "none",
      duration: 1500
    })
  },
  scheduleDeviceListUpdate: function(e) {
    var t = this;
    this.pendingDevices = e;
    var a = Date.now(),
      n = this.lastDeviceListUpdateAt || 0,
      r = Math.max(0, 1e3 - (a - n));
    if (!r) return clearTimeout(this.deviceListUpdateTimer), this.lastDeviceListUpdateAt = a, this.applyDevices(this.currentScanDevices()), void(this.data.showDevices && this.scheduleDeviceListUpdate(this.currentScanDevices()));
    this.deviceListUpdateTimer || (this.deviceListUpdateTimer = setTimeout((function() {
      t.deviceListUpdateTimer = null, t.lastDeviceListUpdateAt = Date.now(), t.applyDevices(t.currentScanDevices()), t.data.showDevices && t.scheduleDeviceListUpdate(t.currentScanDevices())
    }), r))
  },
  pendingQuickFields: function() {
    var e = getApp().globalData.pendingDashboardQuickFields || {};
    return ["cellType", "cellCount", "capacity"].filter((function(t) {
      return e[t]
    }))
  },
  refreshPendingQuickFields: function() {
    var e = this.pendingQuickFields();
    if (e.length) {
      var t = getApp(),
        a = t.globalData.pendingDashboardQuickFields || {};
      e.forEach((function(e) {
        delete a[e]
      })), delete a.updatedAt, t.globalData.pendingDashboardQuickFields = a, e.indexOf("capacity") >= 0 && "function" == typeof this.invalidateDesignCapacity && this.invalidateDesignCapacity(), (e.indexOf("cellCount") >= 0 || e.indexOf("cellType") >= 0) && (this._prioritizeCellOnce = !0), this.scheduleRefresh(0)
    }
  },
  refreshQuickFields: function() {},
  refresh: function() {
    var a = this;
    return t(e().mark((function t() {
      var n, i;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (!a.refreshing) {
              e.next = 6;
              break
            }
            if (!(Date.now() - (a.refreshStartedAt || 0) < 15e3)) {
              e.next = 4;
              break
            }
            return e.abrupt("return");
          case 4:
            "function" == typeof s.resetPending && s.resetPending(), a.refreshing = !1;
          case 6:
            if (a.refreshing = !0, a.refreshStartedAt = Date.now(), a.refreshFrameId = (a.refreshFrameId || 0) + 1, e.prev = 9, (n = getApp()).globalData.connected) {
              e.next = 19;
              break
            }
            return x = 0, a.resetDashboardReadCache(), a.syncConnectionState(r.getState()), "--" === a.data.lastUpdate && a.clearData(), a.data.cachedDashboardUpdating && a.setData({
              cachedDashboardUpdating: !1
            }), !n.globalData.deviceId || D || a.data.showDevices || (a.scheduleNextReconnect(n.globalData.restoredLastDevice ? 0 : void 0), n.globalData.restoredLastDevice = !1), e.abrupt("return");
          case 19:
            if (!C) {
              e.next = 21;
              break
            }
            return e.abrupt("return");
          case 21:
            if (!a.data.showDevices && !D) {
              e.next = 24;
              break
            }
            return x = 0, e.abrupt("return");
          case 24:
            return e.prev = 24, e.next = 27, a.refreshDashboardCoreFast();
          case 27:
            return e.next = 29, a.refreshDashboardStatusFast();
          case 29:
            x = 0, a.syncConnectionState(r.getState()), e.next = 42;
            break;
          case 33:
            if (e.prev = 33, e.t0 = e.catch(24), !a.data.showDevices && !D) {
              e.next = 38;
              break
            }
            return x = 0, e.abrupt("return");
          case 38:
            return x += 1, a.setData({
              error: e.t0.message || String(e.t0)
            }), x >= 3 && ("function" == typeof s.resetPending && s.resetPending(), a.reconnectDevice()), e.abrupt("return");
          case 42:
            return e.prev = 42, e.next = 45, a.readDashboardDataResume();
          case 45:
            return i = e.sent, e.next = 48, a.ensureDesignCapacity(a.refreshFrameId);
          case 48:
            a.decode(i), e.next = 54;
            break;
          case 51:
            e.prev = 51, e.t1 = e.catch(42), a.setData({
              error: e.t1.message || String(e.t1)
            });
          case 54:
            return e.prev = 54, a.refreshing = !1, a.refreshStartedAt = 0, e.finish(54);
          case 58:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [9, , 54, 58],
        [24, 33],
        [42, 51]
      ])
    })))()
  },
  resetDashboardReadCache: function() {
    this.dashboardReadCache = null
  },
  dashboardReadSegments: function(e) {
    for (var t = [], a = 0; a < 64;) {
      for (; a < 64 && e && e.done[a];) a += 1;
      if (a >= 64) break;
      for (var n = 0; n < 8 && a + n < 64 && (!e || !e.done[a + n]);) n += 1;
      t.push({
        start: 0 + a,
        offset: a,
        count: n
      }), a += n
    }
    return t
  },
  ensureDashboardReadCache: function() {
    return this.dashboardReadCache || (this.dashboardReadCache = {
      data: new Uint8Array(128),
      done: {}
    }), this.dashboardReadCache
  },
  fillDashboardReadCache: function(e, t, a) {
    for (var n = this.ensureDashboardReadCache(), r = t instanceof Uint8Array ? t : new Uint8Array(t || []), s = Math.min(a || Math.floor(r.length / 2), Math.floor(r.length / 2)), i = 0; i < s; i++) {
      var c = e + i - 0;
      c < 0 || c >= 64 || (n.data.set(r.slice(2 * i, 2 * i + 2), 2 * c), n.done[c] = !0)
    }
  },
  readDashboardDataResume: function() {
    var a = this;
    return t(e().mark((function t() {
      var n, r, i, c, o, u;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            n = a.ensureDashboardReadCache(), r = a.dashboardReadSegments(n), i = 0;
          case 3:
            if (!(i < r.length)) {
              e.next = 12;
              break
            }
            return c = r[i], e.next = 7, s.readRegisters(c.start, c.count, 2500);
          case 7:
            o = e.sent, a.fillDashboardReadCache(c.start, o, c.count);
          case 9:
            i++, e.next = 3;
            break;
          case 12:
            if (Array.from({
                length: 64
              }).every((function(e, t) {
                return n.done[t]
              }))) {
              e.next = 15;
              break
            }
            throw new Error("BMS 数据未读完整");
          case 15:
            return u = n.data.slice(0), a.resetDashboardReadCache(), e.abrupt("return", u);
          case 18:
          case "end":
            return e.stop()
        }
      }), t)
    })))()
  },
  refreshDashboardCoreFast: function() {
    var a = this;
    return t(e().mark((function t() {
      var n, r, c, o, u, l, d, h, p, f, v, g, b, x, C, D, S, w, k, T, M, A, N, I, L, O, V, _, j, E, q, G, W, H, Q, J, z, K, Y, $, X, Z, ee, te, ae, ne, re, se, ie, ce, oe, ue, le, de, he, me, pe, fe, ve, ge, be, xe, Ce, De, Se, we, ke;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.next = 2, s.readRegisters(0, 4, 2500);
          case 2:
            return n = e.sent, e.next = 5, s.readRegisters(4, 6, 2500);
          case 5:
            return r = e.sent, a.fillDashboardReadCache(0, n, 4), a.fillDashboardReadCache(4, r, 6), c = i.u32(r, 0) / 1e3, o = i.i32(r, 2), u = o / 1e3, l = i.u32(r, 4), a.setData({
              dataReady: !0,
              cachedDashboardUpdating: !1,
              error: "",
              voltage: c.toFixed(3),
              current: u.toFixed(2),
              totalPower: Math.abs(c * u).toFixed(2),
              remainCap: l,
              remainAh: (l / 1e3).toFixed(1),
              mosTemp: i.k2c(i.u16(n, 0)).toFixed(1),
              temp1: i.k2c(i.u16(n, 1)).toFixed(1),
              temp2: i.k2c(i.u16(n, 2)).toFixed(1),
              temp3: i.k2c(i.u16(n, 3)).toFixed(1),
              runStatus: o > 0 ? "充电中" : o < 0 ? "放电中" : "静置中",
              runStatusClass: 0 === o ? "status-idle" : "status-off"
            }), (d = !!a._prioritizeCellOnce) && (a._prioritizeCellOnce = !1), h = null, p = null, f = 0, v = null, e.prev = 19, e.next = 22, s.readRegisters(20, 5, 2500);
          case 22:
            v = e.sent, a.fillDashboardReadCache(20, v, 5), g = i.u16(v, 0), b = 255 & g, x = i.u16(v, 4), f = x >> 8 & 255, h = v.slice(8, 10), a.fillDashboardReadCache(24, h, 1), d ? (a.setData({
              cellCount: f,
              cellType: m[255 & x] || "未知"
            }), a.setData({
              soc: b,
              soh: g >> 8 & 255,
              socLevel: a.getSocLevel(b),
              socPercent: a.getSocPercent(b),
              socTextWidth: a.getSocTextWidth(b),
              socBatteryClass: b < 20 ? "soc-battery-low" : "soc-battery-ok",
              socBlinkClass: b < 10 ? "soc-battery-blink" : ""
            })) : a.setData({
              soc: b,
              soh: g >> 8 & 255,
              socLevel: a.getSocLevel(b),
              socPercent: a.getSocPercent(b),
              socTextWidth: a.getSocTextWidth(b),
              socBatteryClass: b < 20 ? "soc-battery-low" : "soc-battery-ok",
              socBlinkClass: b < 10 ? "soc-battery-blink" : ""
            }), e.next = 35;
            break;
          case 33:
            e.prev = 33, e.t0 = e.catch(19);
          case 35:
            if (!((C = Math.max(0, Math.min(f || Number(a.data.cellCount) || 0, 32))) > 0)) {
              e.next = 56;
              break
            }
            D = null, S = 0;
          case 39:
            if (!(S <= 2)) {
              e.next = 55;
              break
            }
            return e.prev = 40, e.next = 43, s.readRegisters(32, C, y(C));
          case 43:
            return D = e.sent, e.abrupt("break", 55);
          case 47:
            if (e.prev = 47, e.t1 = e.catch(40), !(S < 2)) {
              e.next = 52;
              break
            }
            return e.next = 52, new Promise((function(e) {
              return setTimeout(e, 150)
            }));
          case 52:
            S++, e.next = 39;
            break;
          case 55:
            if (D) {
              for (a.fillDashboardReadCache(32, D, C), w = [], k = 0; k < C; k++) T = i.u16(D, k), w.push({
                index: k + 1,
                voltage: (T / 1e3).toFixed(3),
                mv: T
              });
              M = w.map((function(e) {
                return e.mv
              })), A = Math.max.apply(null, M), N = Math.min.apply(null, M), I = w.find((function(e) {
                return e.mv === A
              })), L = w.find((function(e) {
                return e.mv === N
              })), O = Math.round(M.reduce((function(e, t) {
                return e + t
              }), 0) / M.length), p = {
                maxVoltage: (A / 1e3).toFixed(3),
                minVoltage: (N / 1e3).toFixed(3),
                maxCellNo: String(I.index).padStart(2, "0"),
                minCellNo: String(L.index).padStart(2, "0"),
                deltaVoltage: ((A - N) / 1e3).toFixed(3),
                avgVoltage: (O / 1e3).toFixed(3),
                cells: w.map((function(e) {
                  return Object.assign({}, e, {
                    no: String(e.index).padStart(2, "0"),
                    levelClass: e.index === I.index ? "cell-high" : e.index === L.index ? "cell-low" : "cell-normal",
                    rankText: e.index === I.index ? "最高" : e.index === L.index ? "最低" : ""
                  })
                })),
                cellGridClass: a.getCellGridClass(C)
              }, V = h ? 255 & i.u16(h, 0) : null, _ = Object.assign({}, p), f > 0 && (_.cellCount = f), null !== V && (_.cellType = m[V] || "未知"), a.setData(_)
            }
          case 56:
            return j = null, e.prev = 57, e.next = 60, s.readRegisters(26, 3, 2500);
          case 60:
            j = e.sent, a.fillDashboardReadCache(26, j, 3), e.next = 66;
            break;
          case 64:
            e.prev = 64, e.t2 = e.catch(57);
          case 66:
            return e.prev = 66, e.next = 69, a.ensureDesignCapacity(a.refreshFrameId);
          case 69:
            e.next = 73;
            break;
          case 71:
            e.prev = 71, e.t3 = e.catch(66);
          case 73:
            return j && (E = 10 * i.u16(j, 2), q = "number" == typeof a.designCapacityOverride ? a.designCapacityOverride : E, a.setData({
              cycle: i.u16(j, 0),
              fullCap: 10 * i.u16(j, 1),
              designCap: q,
              designAh: (q / 1e3).toFixed(1)
            })), Math.max(0, Math.min(f, 32)), G = null, e.prev = 76, e.next = 79, s.readRegisters(12, 4, 2500);
          case 79:
            W = e.sent, a.fillDashboardReadCache(12, W, 4), H = i.u32(W, 0), Q = i.u16(W, 2), J = i.u16(W, 3), z = B(H, 16), K = B(H, 17), Y = B(H, 23), $ = U(J), a._functionTempDisabled && $.push({
              text: "温控已禁用",
              danger: !1
            }), a._deviceDisabled && $.push({
              text: "设备已禁用",
              danger: !0
            }), G = {
              afeStatusItems: P(H, R),
              alarmStatusItems: P(Q, F),
              packStatusItems: $,
              chargeMos: K ? "开启" : "关闭",
              chargeMosClass: K ? "status-on" : "status-off",
              dischargeMos: z ? "开启" : "关闭",
              dischargeMosClass: z ? "status-on" : "status-off",
              balanceStatus: Y ? "均衡中" : "关闭",
              balanceStatusClass: Y ? "status-balancing" : "status-idle"
            }, e.next = 95;
            break;
          case 93:
            e.prev = 93, e.t4 = e.catch(76);
          case 95:
            if (X = v) {
              e.next = 107;
              break
            }
            return e.prev = 97, e.next = 100, s.readRegisters(20, 1, 2500);
          case 100:
            X = e.sent, a.fillDashboardReadCache(20, X, 1), e.next = 107;
            break;
          case 104:
            e.prev = 104, e.t5 = e.catch(97), X = null;
          case 107:
            if (Z = h) {
              e.next = 119;
              break
            }
            return e.prev = 109, e.next = 112, s.readRegisters(24, 1, 2500);
          case 112:
            Z = e.sent, a.fillDashboardReadCache(24, Z, 1), e.next = 119;
            break;
          case 116:
            e.prev = 116, e.t6 = e.catch(109), Z = null;
          case 119:
            if (ee = j) {
              e.next = 131;
              break
            }
            return e.prev = 121, e.next = 124, s.readRegisters(26, 3, 2500);
          case 124:
            ee = e.sent, a.fillDashboardReadCache(26, ee, 3), e.next = 131;
            break;
          case 128:
            e.prev = 128, e.t7 = e.catch(121), ee = null;
          case 131:
            return e.next = 133, a.ensureDesignCapacity(a.refreshFrameId);
          case 133:
            if (te = i.u32(r, 0) / 1e3, ae = i.i32(r, 2), ne = ae / 1e3, re = i.u32(r, 4), se = X ? i.u16(X, 0) : null, ie = null !== se ? 255 & se : null, ce = Z ? i.u16(Z, 0) : null, oe = ee ? 10 * i.u16(ee, 1) : null, ue = ee ? 10 * i.u16(ee, 2) : null, le = "number" == typeof a.designCapacityOverride ? a.designCapacityOverride : ue, de = null !== ce ? ce >> 8 & 255 : 0, he = Math.max(0, Math.min(de, 32)), p || !(he > 0)) {
              e.next = 165;
              break
            }
            me = null, pe = 0;
          case 148:
            if (!(pe <= 2)) {
              e.next = 164;
              break
            }
            return e.prev = 149, e.next = 152, s.readRegisters(32, he, y(he));
          case 152:
            return me = e.sent, e.abrupt("break", 164);
          case 156:
            if (e.prev = 156, e.t8 = e.catch(149), !(pe < 2)) {
              e.next = 161;
              break
            }
            return e.next = 161, new Promise((function(e) {
              return setTimeout(e, 150)
            }));
          case 161:
            pe++, e.next = 148;
            break;
          case 164:
            if (me) try {
              for (a.fillDashboardReadCache(32, me, he), fe = [], ve = 0; ve < he; ve++) ge = i.u16(me, ve), fe.push({
                index: ve + 1,
                voltage: (ge / 1e3).toFixed(3),
                mv: ge
              });
              be = fe.map((function(e) {
                return e.mv
              })), xe = Math.max.apply(null, be), Ce = Math.min.apply(null, be), De = fe.find((function(e) {
                return e.mv === xe
              })), Se = fe.find((function(e) {
                return e.mv === Ce
              })), we = Math.round(be.reduce((function(e, t) {
                return e + t
              }), 0) / be.length), p = {
                maxVoltage: (xe / 1e3).toFixed(3),
                minVoltage: (Ce / 1e3).toFixed(3),
                maxCellNo: String(De.index).padStart(2, "0"),
                minCellNo: String(Se.index).padStart(2, "0"),
                deltaVoltage: ((xe - Ce) / 1e3).toFixed(3),
                avgVoltage: (we / 1e3).toFixed(3),
                cells: fe.map((function(e) {
                  return Object.assign({}, e, {
                    no: String(e.index).padStart(2, "0"),
                    levelClass: e.index === De.index ? "cell-high" : e.index === Se.index ? "cell-low" : "cell-normal",
                    rankText: e.index === De.index ? "最高" : e.index === Se.index ? "最低" : ""
                  })
                })),
                cellGridClass: a.getCellGridClass(he)
              }
            } catch (e) {}
            case 165: ke = {
              dataReady: !0,
              cachedDashboardUpdating: !1,
              error: "",
              lastUpdate: (new Date).toLocaleTimeString(),
              voltage: te.toFixed(3),
              current: ne.toFixed(2),
              totalPower: Math.abs(te * ne).toFixed(2),
              remainCap: re,
              remainAh: (re / 1e3).toFixed(1),
              mosTemp: i.k2c(i.u16(n, 0)).toFixed(1),
              temp1: i.k2c(i.u16(n, 1)).toFixed(1),
              temp2: i.k2c(i.u16(n, 2)).toFixed(1),
              temp3: i.k2c(i.u16(n, 3)).toFixed(1),
              runStatus: ae > 0 ? "充电中" : ae < 0 ? "放电中" : "静置中",
              runStatusClass: 0 === ae ? "status-idle" : "status-off"
            }, null !== ie && (ke.soh = se >> 8 & 255, ke.soc = ie, ke.socLevel = a.getSocLevel(ie), ke.socPercent = a.getSocPercent(ie), ke.socTextWidth = a.getSocTextWidth(ie), ke.socBatteryClass = ie < 20 ? "soc-battery-low" : "soc-battery-ok", ke.socBlinkClass = ie < 10 ? "soc-battery-blink" : ""), null !== ce && (ke.cellCount = de, ke.cellType = m[255 & ce] || "未知"), ee && (ke.cycle = i.u16(ee, 0), ke.fullCap = oe), "number" == typeof le && (ke.designCap = le, ke.designAh = (le / 1e3).toFixed(1)), p && Object.assign(ke, p), G && Object.assign(ke, G), a.setData(ke);
          case 173:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [19, 33],
        [40, 47],
        [57, 64],
        [66, 71],
        [76, 93],
        [97, 104],
        [109, 116],
        [121, 128],
        [149, 156]
      ])
    })))()
  },
  refreshDashboardStatusFast: function() {
    var a = this;
    return t(e().mark((function t() {
      var n, r, c, o, u, l, d, h, m, p, f, v, g;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.prev = 0, e.next = 3, s.readRegisters(31, 1, 2500);
          case 3:
            return n = e.sent, e.next = 6, a.readDeviceDisabled();
          case 6:
            if (r = e.sent, a.fillDashboardReadCache(31, n, 1), c = a.dashboardReadCache, o = c ? c.data.slice(24, 32) : null) {
              e.next = 12;
              break
            }
            return e.abrupt("return");
          case 12:
            u = i.u32(o, 0), l = i.u16(o, 2), d = i.u16(o, 3), h = i.u16(n, 0), m = B(u, 16), p = B(u, 17), f = B(u, 23), v = U(d), (g = B(h, 6)) && v.push({
              text: "温控已禁用",
              danger: !1
            }), r && v.push({
              text: "设备已禁用",
              danger: !0
            }), a._deviceDisabled = r, a._functionTempDisabled = g, a.setData({
              afeStatusItems: P(u, R),
              alarmStatusItems: P(l, F),
              packStatusItems: v,
              chargeMos: p ? "开启" : "关闭",
              chargeMosClass: p ? "status-on" : "status-off",
              dischargeMos: m ? "开启" : "关闭",
              dischargeMosClass: m ? "status-on" : "status-off",
              balanceStatus: f ? "均衡中" : "关闭",
              balanceStatusClass: f ? "status-balancing" : "status-idle"
            }, (function() {
              return a.saveDashboardCache()
            })), e.next = 30;
            break;
          case 28:
            e.prev = 28, e.t0 = e.catch(0);
          case 30:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [0, 28]
      ])
    })))()
  },
  ensureDesignCapacity: function(a) {
    var n = this;
    return t(e().mark((function t() {
      var r;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (null == a || n.designCapacityFrameId !== a) {
              e.next = 2;
              break
            }
            return e.abrupt("return");
          case 2:
            return e.prev = 2, e.next = 5, s.readRegisters(1028, 2, 2500);
          case 5:
            r = e.sent, n.designCapacityOverride = i.u32(r, 0), n.designCapacityLoaded = !0, null != a && (n.designCapacityFrameId = a), e.next = 15;
            break;
          case 11:
            e.prev = 11, e.t0 = e.catch(2), n.designCapacityLoaded = !1, n.designCapacityFrameId = null;
          case 15:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [2, 11]
      ])
    })))()
  },
  invalidateDesignCapacity: function() {
    this.designCapacityFrameId = null
  },
  scheduleRefresh: function(a) {
    var n = this;
    clearTimeout(b), this.pageVisible && (b = setTimeout(t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return b = null, e.next = 3, n.refresh();
          case 3:
            n.scheduleRefresh(2e3);
          case 4:
          case "end":
            return e.stop()
        }
      }), t)
    }))), a || 0))
  },
  stopReconnectLoop: function() {
    T = !0, clearTimeout(k), k = null
  },
  scheduleNextReconnect: function(e) {
    var t = this,
      a = getApp();
    if (!a.globalData.mockMode && a.globalData.deviceId && !(D || C || this.data.showDevices || a.globalData.pendingOpenDeviceList || a.globalData.pendingScanCode || a.globalData.pendingScanConnect || (T = !1, k))) {
      var n = void 0 !== e ? e : 3e3;
      k = setTimeout((function() {
        k = null, t.reconnectDevice()
      }), Math.max(0, n))
    }
  },
  reconnectDevice: function() {
    var a = this;
    return t(e().mark((function t() {
      var n, i, c, o;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (n = getApp(), i = n.globalData.deviceId, c = n.globalData.deviceName || a.data.deviceName, !(C || D || !i || a.data.mockMode || a.data.showDevices)) {
              e.next = 5;
              break
            }
            return e.abrupt("return");
          case 5:
            if (!T) {
              e.next = 7;
              break
            }
            return e.abrupt("return");
          case 7:
            return C = !0, x = 0, a.resetDashboardReadCache(), "function" == typeof s.resetPending && s.resetPending(), o = {
              ok: !1
            }, e.prev = 12, e.next = 15, r.reconnect({
              directAttempts: 2,
              timeoutMs: 3500,
              mock: a.data.mockMode,
              force: n.globalData.connected
            });
          case 15:
            o = e.sent, e.next = 21;
            break;
          case 18:
            e.prev = 18, e.t0 = e.catch(12), o = {
              ok: !1,
              error: e.t0
            };
          case 21:
            return e.prev = 21, C = !1, a.syncConnectionState(r.getState()), e.finish(21);
          case 25:
            if (!o.ok) {
              e.next = 30;
              break
            }
            return a.setData({
              error: ""
            }), "function" == typeof s.resetPending && s.resetPending(), setTimeout((function() {
              return a.refresh()
            }), 120), e.abrupt("return");
          case 30:
            if (!D && !T) {
              e.next = 32;
              break
            }
            return e.abrupt("return");
          case 32:
            if (!n.globalData.connected) {
              e.next = 36;
              break
            }
            return a.setData({
              error: "BMS 通讯超时"
            }), setTimeout((function() {
              return a.refresh()
            }), 500), e.abrupt("return");
          case 36:
            return a.setData({
              error: "设备已离线"
            }), e.next = 39, a.cancelBleAfterOffline(c);
          case 39:
            T || a.scheduleNextReconnect();
          case 40:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [12, 18, 21, 25]
      ])
    })))()
  },
  ensureEntryAutoConnect: function(e) {
    var t = getApp();
    t.globalData.connected || t.globalData.mockMode || D || C || t.globalData.pendingOpenDeviceList || t.globalData.pendingScanCode || t.globalData.pendingScanConnect || t.globalData.deviceId && this.scheduleNextReconnect(0)
  },
  readDeviceDisabled: function() {
    return t(e().mark((function t() {
      var a;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.prev = 0, e.next = 3, s.readRegisters(2051, 1, 2500);
          case 3:
            return a = e.sent, e.abrupt("return", 0 !== i.u16(a, 0));
          case 7:
            return e.prev = 7, e.t0 = e.catch(0), e.abrupt("return", !1);
          case 10:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [0, 7]
      ])
    })))()
  },
  decode: function(e) {
    var t = this,
      a = !!this._deviceDisabled,
      n = i.u16(e, 20),
      r = i.u16(e, 19),
      s = "v" + (r >> 8 & 255) + "." + String(255 & r).padStart(2, "0"),
      c = getApp();
    c.globalData.firmwareWord = r, c.globalData.firmwareText = s;
    for (var o = i.u16(e, 24), l = i.u32(e, 12), d = i.u16(e, 14), h = i.u16(e, 15), g = i.u16(e, 31), b = o >> 8 & 255, x = Math.max(0, Math.min(b, 32)), C = v(d, p), D = v(h, f), S = B(l, 16), w = B(l, 17), k = B(l, 23), T = [], y = 0; y < x; y++) {
      var M = i.u16(e, 32 + y);
      T.push({
        index: y + 1,
        voltage: (M / 1e3).toFixed(3),
        mv: M
      })
    }
    var A = T.map((function(e) {
        return e.mv
      })),
      N = A.length ? Math.max.apply(null, A) : 0,
      I = A.length ? Math.min.apply(null, A) : 0,
      L = A.length ? T.find((function(e) {
        return e.mv === N
      })) : null,
      O = A.length ? T.find((function(e) {
        return e.mv === I
      })) : null,
      V = A.length ? Math.round(A.reduce((function(e, t) {
        return e + t
      }), 0) / A.length) : 0,
      _ = i.u32(e, 4) / 1e3,
      j = i.i32(e, 6),
      E = j / 1e3,
      q = i.u32(e, 8),
      G = 10 * i.u16(e, 27),
      W = 10 * i.u16(e, 28),
      H = "number" == typeof this.designCapacityOverride ? this.designCapacityOverride : W,
      Q = 255 & n,
      J = U(h);
    B(g, 6) && J.push({
      text: "温控已禁用",
      danger: !1
    }), a && J.push({
      text: "设备已禁用",
      danger: !0
    });
    var z = {
      voltage: Number(_.toFixed(3)),
      current: Number(E.toFixed(3)),
      soc: Q,
      soh: n >> 8 & 255,
      firmware: s,
      maxMv: N,
      minMv: I,
      deltaMv: A.length ? N - I : 0,
      cellCount: b,
      cellTypeCode: 255 & o,
      cellType: m[255 & o] || "未知",
      cellVoltages: A.slice(),
      mosTemp: Number(i.k2c(i.u16(e, 0)).toFixed(1)),
      temp1: Number(i.k2c(i.u16(e, 1)).toFixed(1)),
      temp2: Number(i.k2c(i.u16(e, 2)).toFixed(1)),
      remainCap: q,
      remainAh: Number((q / 1e3).toFixed(1)),
      fullCap: G,
      designCap: H,
      designAh: Number((H / 1e3).toFixed(1)),
      cycle: i.u16(e, 26),
      chargeMos: w,
      dischargeMos: S,
      alarms: C,
      protectStatus: P(l, R),
      alarmStatusItems: P(d, F),
      packStatus: J.map((function(e) {
        return e.text
      }))
    };
    u.updateSnapshot({
      metrics: z
    }), this.setData({
      dataReady: !0,
      cachedDashboardUpdating: !1,
      error: "",
      lastUpdate: (new Date).toLocaleTimeString(),
      runtime: this.formatRuntime(i.u32(e, 30)),
      soh: n >> 8 & 255,
      soc: Q,
      socLevel: this.getSocLevel(Q),
      socPercent: this.getSocPercent(Q),
      socTextWidth: this.getSocTextWidth(Q),
      socBatteryClass: Q < 20 ? "soc-battery-low" : "soc-battery-ok",
      socBlinkClass: Q < 10 ? "soc-battery-blink" : "",
      voltage: _.toFixed(3),
      current: E.toFixed(2),
      totalPower: Math.abs(_ * E).toFixed(2),
      remainCap: q,
      remainAh: (q / 1e3).toFixed(1),
      mosTemp: i.k2c(i.u16(e, 0)).toFixed(1),
      temp1: i.k2c(i.u16(e, 1)).toFixed(1),
      temp2: i.k2c(i.u16(e, 2)).toFixed(1),
      temp3: i.k2c(i.u16(e, 3)).toFixed(1),
      firmware: s,
      cellCount: b,
      cellType: m[255 & o] || "未知",
      cycle: i.u16(e, 26),
      fullCap: G,
      designCap: H,
      designAh: (H / 1e3).toFixed(1),
      rtc: this.formatRtc(i.u16(e, 21), i.u16(e, 22), i.u16(e, 23)),
      alarms: C,
      states: D,
      alarmText: C.length ? C.join(", ") : "无",
      protectText: C.length ? C.join(", ") : "无",
      batteryStateText: D.length ? D.join(", ") : "无",
      afeStatusItems: P(l, R),
      alarmStatusItems: P(d, F),
      packStatusItems: J,
      chargeMos: w ? "开启" : "关闭",
      chargeMosClass: w ? "status-on" : "status-off",
      dischargeMos: S ? "开启" : "关闭",
      dischargeMosClass: S ? "status-on" : "status-off",
      balanceStatus: k ? "均衡中" : "关闭",
      balanceStatusClass: k ? "status-balancing" : "status-idle",
      runStatus: j > 0 ? "充电中" : j < 0 ? "放电中" : "静置中",
      runStatusClass: 0 === j ? "status-idle" : "status-off",
      maxVoltage: A.length ? (N / 1e3).toFixed(3) : "--",
      minVoltage: A.length ? (I / 1e3).toFixed(3) : "--",
      maxCellNo: L ? String(L.index).padStart(2, "0") : "--",
      minCellNo: O ? String(O.index).padStart(2, "0") : "--",
      deltaVoltage: A.length ? ((N - I) / 1e3).toFixed(3) : "--",
      avgVoltage: A.length ? (V / 1e3).toFixed(3) : "--",
      cells: T.map((function(e) {
        return Object.assign({}, e, {
          no: String(e.index).padStart(2, "0"),
          levelClass: L && e.index === L.index ? "cell-high" : O && e.index === O.index ? "cell-low" : "cell-normal",
          rankText: L && e.index === L.index ? "最高" : O && e.index === O.index ? "最低" : ""
        })
      })),
      cellGridClass: this.getCellGridClass(x)
    }, (function() {
      return t.saveDashboardCache()
    }))
  },
  clearData: function() {
    this.resetDashboardReadCache(), this.designCapacityOverride = null, this.designCapacityLoaded = !1, this.setData({
      dataReady: !1,
      cachedDashboardUpdating: !1,
      error: "",
      runtime: "--",
      soc: "--",
      socLevel: "empty",
      socPercent: 0,
      socTextWidth: 100,
      socBatteryClass: "soc-battery-ok",
      socBlinkClass: "",
      soh: "--",
      voltage: "--",
      current: "--",
      remainCap: "--",
      fullCap: "--",
      designCap: "--",
      designAh: "--",
      remainAh: "--",
      cycle: "--",
      mosTemp: "--",
      temp1: "--",
      temp2: "--",
      temp3: "--",
      firmware: "--",
      cellCount: "--",
      cellType: "--",
      rtc: "--",
      alarms: [],
      states: [],
      chargeMos: "关闭",
      chargeMosClass: "status-off",
      dischargeMos: "关闭",
      dischargeMosClass: "status-off",
      balanceStatus: "关闭",
      balanceStatusClass: "status-idle",
      runStatus: "静置中",
      runStatusClass: "status-idle",
      totalPower: "--",
      maxVoltage: "--",
      minVoltage: "--",
      maxCellNo: "--",
      minCellNo: "--",
      deltaVoltage: "--",
      avgVoltage: "--",
      balanceCurrent: "0.000",
      alarmText: "无",
      protectText: "无",
      batteryStateText: "无",
      afeStatusItems: [],
      alarmStatusItems: [],
      packStatusItems: [],
      cells: [],
      cellGridClass: "cells-grid-4"
    })
  },
  getSocLevel: function(e) {
    var t = Number(e);
    return !Number.isFinite(t) || t <= 0 ? "empty" : t <= 10 ? "10" : t <= 20 ? "20" : t <= 30 ? "30" : t <= 40 ? "40" : t <= 50 ? "50" : t <= 60 ? "60" : t <= 70 ? "70" : t <= 80 ? "80" : t <= 90 ? "90" : "100"
  },
  getSocPercent: function(e) {
    var t = Number(e);
    return Number.isFinite(t) ? t < 0 ? 0 : t > 100 ? 100 : Math.round(t) : 0
  },
  getSocTextWidth: function(e) {
    var t = this.getSocPercent(e);
    return t <= 0 ? 100 : Math.round(1e4 / t)
  },
  getCellGridClass: function(e) {
    return e > 24 ? "cells-grid-2" : e > 16 ? "cells-grid-3" : "cells-grid-4"
  },
  formatRtc: function(e, t, a) {
    var n = t >> 8 & 255,
      r = 255 & t,
      s = a >> 8 & 255,
      i = 255 & a;
    return 2022 + (e >> 8 & 255) + "-" + String(255 & e).padStart(2, "0") + "-" + String(n).padStart(2, "0") + " " + String(r).padStart(2, "0") + ":" + String(s).padStart(2, "0") + ":" + String(i).padStart(2, "0")
  },
  formatRuntime: function(e) {
    return !Number.isFinite(e) || e <= 0 ? "--" : Math.floor(e / 86400) + "天" + Math.floor(e % 86400 / 3600) + "时" + Math.floor(e % 3600 / 60) + "分" + e % 60 + "秒"
  },
  showAlarms: function() {
    var e = this.data.alarms.length ? this.data.alarms.join(", ") : "无报警";
    wx.showModal({
      title: "报警信息",
      content: e,
      showCancel: !1
    })
  },
  startBluetoothNameHold: function() {
    var e = this;
    this.data.showBluetoothNamePanel || (this.cancelBluetoothNameHold(), S = setTimeout((function() {
      S = null, w = !0, e.setData({
        showBluetoothNamePanel: !0,
        bluetoothNameStatus: ""
      }), wx.showToast({
        title: "已显示修改蓝牙名称",
        icon: "none"
      })
    }), 1e4))
  },
  noopTouch: function() {},
  cancelBluetoothNameHold: function() {
    S && (clearTimeout(S), S = null)
  },
  onBluetoothNameInput: function(e) {
    this.setData({
      bluetoothNameInput: e.detail.value,
      bluetoothNameStatus: ""
    })
  },
  scanBluetoothName: function() {
    var a = this;
    return t(e().mark((function t() {
      var n, r;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.prev = 0, e.next = 3, new Promise((function(e, t) {
              wx.scanCode({
                onlyFromCamera: !0,
                scanType: ["qrCode", "barCode"],
                success: e,
                fail: t
              })
            }));
          case 3:
            n = e.sent, r = Y(n.result), a.setData({
              bluetoothNameInput: r,
              bluetoothNameStatus: "扫码已填入"
            }), e.next = 13;
            break;
          case 8:
            if (e.prev = 8, e.t0 = e.catch(0), !(e.t0 && String(e.t0.errMsg || e.t0.message || e.t0).indexOf("cancel") >= 0)) {
              e.next = 12;
              break
            }
            return e.abrupt("return");
          case 12:
            wx.showToast({
              title: e.t0.errMsg || e.t0.message || "扫码失败",
              icon: "none"
            });
          case 13:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [0, 8]
      ])
    })))()
  },
  writeBluetoothName: function() {
    var a = this;
    return t(e().mark((function t() {
      var n, r, i;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (getApp().globalData.connected) {
              e.next = 3;
              break
            }
            return wx.showToast({
              title: "请先绑定 BMS",
              icon: "none"
            }), e.abrupt("return");
          case 3:
            if (n = String(a.data.bluetoothNameInput || "").trim(), r = z(n)) {
              e.next = 8;
              break
            }
            return wx.showToast({
              title: "名称需为 1-18 个 ASCII 字符",
              icon: "none"
            }), e.abrupt("return");
          case 8:
            return wx.showLoading({
              title: "写入中"
            }), e.prev = 9, e.next = 12, s.writeRegisters(586, r, 2500);
          case 12:
            i = K(n), wx.hideLoading(), a.setData({
              bluetoothNameInput: i || n,
              bluetoothNameStatus: i ? "写入成功，已自动加一" : "写入成功"
            }), wx.showToast({
              title: "设置成功",
              icon: "success"
            }), e.next = 22;
            break;
          case 18:
            e.prev = 18, e.t0 = e.catch(9), wx.hideLoading(), wx.showToast({
              title: e.t0.errMsg || e.t0.message || "设置失败",
              icon: "none"
            });
          case 22:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [9, 18]
      ])
    })))()
  },
  openDeviceList: function() {
    var a = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (!(C || D || r.getState && (r.getState().connecting || r.getState().reconnecting))) {
              e.next = 5;
              break
            }
            return C = !1, D = !1, e.next = 5, a.cancelActiveBleBeforeScan(getApp().globalData.deviceName || a.data.deviceName);
          case 5:
            if (a.stopReconnectLoop(), "function" == typeof r.pauseStateEvents && r.pauseStateEvents(), a.data.mockMode) {
              e.next = 15;
              break
            }
            return e.prev = 8, e.next = 11, n.stopScan();
          case 11:
            e.next = 15;
            break;
          case 13:
            e.prev = 13, e.t0 = e.catch(8);
          case 15:
            if (clearTimeout(a.scanTimer), a.scanTimer = null, a.clearDeviceScanCache(), a.setData({
                showDevices: !0,
                scanning: !0,
                devices: [],
                filteredDevices: []
              }), !a.data.mockMode) {
              e.next = 22;
              break
            }
            return a.scanDevices(), e.abrupt("return");
          case 22:
            return e.next = 24, a.initBle();
          case 24:
            if (e.sent) {
              e.next = 28;
              break
            }
            return a.setData({
              scanning: !1
            }), e.abrupt("return");
          case 28:
            a.scanDevices();
          case 29:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [8, 13]
      ])
    })))()
  },
  closeDeviceList: function() {
    this.data.scanning && !this.data.mockMode && n.stopScan(), clearTimeout(this.scanTimer), clearTimeout(this.deviceListUpdateTimer), this.deviceListUpdateTimer = null, this.deviceMap = {}, this.pendingDevices = [], this.setData({
      showDevices: !1,
      scanning: !1,
      devices: [],
      filteredDevices: []
    }), this.cancelAutoConnectCandidate(), "function" == typeof r.resumeStateEvents && r.resumeStateEvents()
  },
  clearDeviceScanCache: function() {
    clearTimeout(this.deviceListUpdateTimer), this.deviceListUpdateTimer = null, this.deviceMap = {}, this.pendingDevices = [], this.lastDeviceListUpdateAt = 0, this.scanSessionStartedAt = Date.now()
  },
  scanDevices: function() {
    var a = this;
    return t(e().mark((function t() {
      var r, s;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (!a.data.mockMode) {
              e.next = 4;
              break
            }
            return r = c.devices().map(G).filter((function(e) {
              return e.connectable
            })), a.applyDevices(r, {
              scanning: !1
            }), e.abrupt("return");
          case 4:
            return a.deviceMap = {}, a.pendingDevices = [], a.lastDeviceListUpdateAt = 0, clearTimeout(a.deviceListUpdateTimer), a.deviceListUpdateTimer = null, a.applyDevices([], {
              scanning: !0
            }), e.prev = 10, e.next = 13, n.startScan(!1);
          case 13:
            e.next = 21;
            break;
          case 15:
            return e.prev = 15, e.t0 = e.catch(10), s = g(e.t0, "蓝牙搜索失败"), a.setData({
              scanning: !1,
              error: s
            }), s && wx.showToast({
              title: s,
              icon: "none"
            }), e.abrupt("return");
          case 21:
            clearTimeout(a.scanTimer), a.scanTimer = setTimeout((function() {
              return a.stopScan()
            }), 15e3);
          case 23:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [10, 15]
      ])
    })))()
  },
  stopScan: function() {
    clearTimeout(this.scanTimer), n.stopScan(), clearTimeout(this.deviceListUpdateTimer), this.deviceListUpdateTimer = null, this.applyDevices(this.currentScanDevices()), this.setData({
      scanning: !1
    })
  },
  connectDevice: function(a) {
    var s = this;
    return t(e().mark((function t() {
      var i, c;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if ((i = a.currentTarget.dataset.device) && !1 !== i.connectable) {
              e.next = 4;
              break
            }
            return wx.showToast({
              title: "请选择可连接设备",
              icon: "none"
            }), e.abrupt("return");
          case 4:
            return getApp(), D = !0, s.setData({
              showDevices: !1,
              autoScanning: !1,
              scanning: !1,
              connected: !1,
              connectionStatus: "离线：",
              deviceName: i.name
            }), wx.showLoading({
              title: "连接中",
              mask: !0
            }), s.cancelAutoConnectCandidate(), C = !1, x = 0, s.stopReconnectLoop(), "function" == typeof r.resumeStateEvents && r.resumeStateEvents(), clearTimeout(s.autoScanTimer), s.autoScanTimer = null, s.data.scanning && !s.data.mockMode && n.stopScan(), clearTimeout(s.scanTimer), clearTimeout(s.deviceListUpdateTimer), s.deviceListUpdateTimer = null, s.clearData(), e.prev = 20, e.next = 23, s.withConnectGuard(r.connectDevice(i, {
              mock: i.mock || s.data.mockMode,
              timeoutMs: 5e3
            }), i);
          case 23:
            if (c = e.sent, s.syncConnectionState(r.getState()), c.ok) {
              e.next = 27;
              break
            }
            throw c.error || new Error("连接失败");
          case 27:
            return s.setData({
              showDevices: !1,
              autoScanning: !1,
              scanning: !1
            }), s.applyCachedDashboardIfNeeded(r.getState()), e.prev = 29, e.next = 32, s.refresh();
          case 32:
            e.next = 36;
            break;
          case 34:
            e.prev = 34, e.t0 = e.catch(29);
          case 36:
            e.next = 44;
            break;
          case 38:
            return e.prev = 38, e.t1 = e.catch(20), e.next = 42, s.cancelBleAfterOffline(i.name);
          case 42:
            s.syncConnectionState(r.getState()), s.setData({
              connected: !1,
              connectionStatus: "离线：",
              error: e.t1.errMsg || e.t1.message || "连接失败"
            });
          case 44:
            return e.prev = 44, D = !1, wx.hideLoading(), e.finish(44);
          case 48:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [20, 38, 44, 48],
        [29, 34]
      ])
    })))()
  },
  withConnectGuard: function(e, t) {
    var a = null,
      n = new Promise((function(e, t) {
        a = setTimeout((function() {
          return t(new Error("连接无响应"))
        }), 12e3)
      }));
    return Promise.race([e, n]).finally((function() {
      return clearTimeout(a)
    }))
  },
  scanCode: function() {
    var a = this;
    return t(e().mark((function t() {
      var n;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.prev = 0, e.next = 3, new Promise((function(e, t) {
              wx.scanCode({
                onlyFromCamera: !0,
                scanType: ["qrCode", "barCode"],
                success: e,
                fail: t
              })
            }));
          case 3:
            return n = e.sent, e.next = 6, a.connectFromScanned(Q(n.result));
          case 6:
            return e.abrupt("return");
          case 9:
            if (e.prev = 9, e.t0 = e.catch(0), !(e.t0 && String(e.t0.errMsg || e.t0.message || e.t0).indexOf("cancel") >= 0)) {
              e.next = 13;
              break
            }
            return e.abrupt("return");
          case 13:
            return wx.showToast({
              title: e.t0.errMsg || e.t0.message || "扫码失败",
              icon: "none"
            }), e.abrupt("return");
          case 15:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [0, 9]
      ])
    })))()
  },
  connectFromScanned: function(a) {
    var r = this;
    return t(e().mark((function t() {
      var s, i, o, u, l;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (a && (a.deviceId || a.name || a.mac || a.sn || a.raw)) {
              e.next = 3;
              break
            }
            return wx.showToast({
              title: "二维码无设备信息",
              icon: "none"
            }), e.abrupt("return");
          case 3:
            if (s = getApp(), void 0 !== a.slaveAddr && "" !== a.slaveAddr && (i = Number(a.slaveAddr), Number.isFinite(i) && (s.globalData.slaveAddr = i)), r.cancelAutoConnectCandidate(), r.stopReconnectLoop(), !r.data.showDevices) {
              e.next = 21;
              break
            }
            if (!r.data.scanning || r.data.mockMode) {
              e.next = 16;
              break
            }
            return e.prev = 9, e.next = 12, n.stopScan();
          case 12:
            e.next = 16;
            break;
          case 14:
            e.prev = 14, e.t0 = e.catch(9);
          case 16:
            clearTimeout(r.scanTimer), r.scanTimer = null, clearTimeout(r.deviceListUpdateTimer), r.deviceListUpdateTimer = null, r.setData({
              showDevices: !1,
              scanning: !1
            });
          case 21:
            if (o = r.deviceMap ? Object.keys(r.deviceMap).map((function(e) {
                return r.deviceMap[e]
              })) : [], u = r.data.mockMode ? c.devices().map(G).filter((function(e) {
                return e.connectable
              })) : o.length ? o : r.data.devices || [], (l = (u || []).find((function(e) {
                return J(a, e)
              }))) || r.data.mockMode) {
              e.next = 28;
              break
            }
            return e.next = 27, r.waitForScannedDevice(a, 8e3);
          case 27:
            l = e.sent;
          case 28:
            if (l || !a.deviceId || a.deviceId === a.raw || (t = a.deviceId, /^[0-9a-f]{12}$/.test(q(t))) || (l = {
                deviceId: a.deviceId,
                name: a.name || a.deviceId,
                connectable: !0
              }), l && l.deviceId) {
              e.next = 32;
              break
            }
            return wx.showToast({
              title: "二维码缺少 deviceId",
              icon: "none"
            }), e.abrupt("return");
          case 32:
            return e.next = 34, r.connectDevice({
              currentTarget: {
                dataset: {
                  device: l
                }
              }
            });
          case 34:
          case "end":
            return e.stop()
        }
        var t
      }), t, null, [
        [9, 14]
      ])
    })))()
  },
  waitForScannedDevice: function(a, r) {
    var s = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return e.next = 2, s.initBle();
          case 2:
            if (e.sent) {
              e.next = 5;
              break
            }
            return e.abrupt("return", null);
          case 5:
            return e.prev = 5, e.next = 8, n.stopScan();
          case 8:
            e.next = 12;
            break;
          case 10:
            e.prev = 10, e.t0 = e.catch(5);
          case 12:
            return s.setData({
              scanning: !0
            }), e.prev = 13, e.next = 16, n.startScan(!1);
          case 16:
            e.next = 22;
            break;
          case 18:
            return e.prev = 18, e.t1 = e.catch(13), s.setData({
              scanning: !1,
              error: g(e.t1, "蓝牙搜索失败")
            }), e.abrupt("return", null);
          case 22:
            return e.abrupt("return", new Promise((function(e) {
              var t = !1,
                i = function(a) {
                  if (!t) {
                    t = !0;
                    try {
                      c && c()
                    } catch (e) {}
                    clearTimeout(o);
                    try {
                      n.stopScan()
                    } catch (e) {}
                    s.setData({
                      scanning: !1
                    }), e(a || null)
                  }
                },
                c = n.onDeviceFound((function(e) {
                  if (e && e.deviceId) {
                    var t = G(e);
                    t.connectable && J(a, t) && i(t)
                  }
                })),
                o = setTimeout((function() {
                  return i(null)
                }), r || 8e3)
            })));
          case 23:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [5, 10],
        [13, 18]
      ])
    })))()
  }
});