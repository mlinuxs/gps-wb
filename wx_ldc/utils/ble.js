var e = require("../@babel/runtime/helpers/createForOfIteratorHelper"),
  t = require("../@babel/runtime/helpers/regeneratorRuntime"),
  n = require("../@babel/runtime/helpers/asyncToGenerator"),
  r = "00002760-08C2-11E1-9073-0E8AC72E1001",
  o = "00002760-08C2-11E1-9073-0E8AC72E0001",
  c = "00002760-08C2-11E1-9073-0E8AC72E0002",
  i = !1,
  u = "",
  a = "",
  s = "",
  f = "",
  l = "",
  p = 20,
  h = null,
  d = [],
  w = null,
  x = [],
  v = !1,
  m = !1,
  b = !1,
  y = 0,
  g = 0,
  E = null,
  k = null,
  D = !1,
  A = !0,
  T = {},
  B = 0,
  S = {};

function C(e) {
  e && (S[e] = Date.now() + 2e4)
}

function I() {
  var e = Date.now(),
    t = [];
  return Object.keys(S).forEach((function(n) {
    S[n] > e ? t.push(n) : delete S[n]
  })), t
}
var L = null;

function O() {
  if (null !== L) return L;
  try {
    var e = wx.getSystemInfoSync ? wx.getSystemInfoSync() : null;
    L = !(!e || "android" !== String(e.platform || "").toLowerCase())
  } catch (e) {
    L = !1
  }
  return L
}

function P() {
  return O() ? 900 : 500
}

function z() {
  return O() ? 350 : 200
}

function M(e) {
  return new Promise((function(t) {
    return setTimeout(t, e)
  }))
}
var U = "请打开蓝牙总开关\n请打开微信的蓝牙和定位授权\n请打开微信的附近设备授权";

function j() {
  try {
    getApp().globalData.debugMode && console.log.apply(console, arguments)
  } catch (e) {}
}

function F() {
  var e, t, n, r;
  try {
    if (wx.getSystemSetting) {
      var o = wx.getSystemSetting();
      e = o && o.bluetoothEnabled, r = o && o.locationEnabled
    }
  } catch (e) {}
  try {
    if (wx.getAppAuthorizeSetting) {
      var c = wx.getAppAuthorizeSetting();
      t = c && c.bluetoothAuthorized, n = c && c.locationAuthorized
    }
  } catch (e) {}
  return {
    bluetoothEnabled: e,
    bluetoothAuthorized: t,
    locationAuthorized: n,
    locationEnabled: r
  }
}

function R(e) {
  var t = F();
  if (!1 === t.bluetoothEnabled) return U;
  if (!1 === t.locationEnabled) return U;
  if ("denied" === t.bluetoothAuthorized || !1 === t.bluetoothAuthorized) return U;
  if ("denied" === t.locationAuthorized || !1 === t.locationAuthorized) return U;
  if (!(!0 !== t.bluetoothEnabled || !0 !== t.locationEnabled || !0 !== t.bluetoothAuthorized && "authorized" !== t.bluetoothAuthorized || !0 !== t.locationAuthorized && "authorized" !== t.locationAuthorized)) return "";
  e && e.errCode;
  var n = String(e && (e.errMsg || e.message) || "").toLowerCase();
  return n.indexOf("auth deny") >= 0 || n.indexOf("auth denied") >= 0 || n.indexOf("permission") >= 0 ? U : ""
}

function N() {
  return !1 === F().bluetoothEnabled ? U : ""
}

function V() {
  return new Promise((function(e) {
    wx.getSetting ? wx.getSetting({
      success: function(t) {
        return e(t && t.authSetting || {})
      },
      fail: function() {
        return e(null)
      }
    }) : e(null)
  }))
}

function q(e, t) {
  return new Promise((function(n) {
    wx.authorize ? t && Object.prototype.hasOwnProperty.call(t, e) ? n(!0 === t[e]) : wx.authorize({
      scope: e,
      success: function() {
        return n(!0)
      },
      fail: function() {
        return n(!1)
      }
    }) : n(!0)
  }))
}

function K() {
  return _.apply(this, arguments)
}

function _() {
  return (_ = n(t().mark((function e() {
    var n, r, o, c, u;
    return t().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.next = 2, V();
        case 2:
          return n = e.sent, r = !(n && Object.prototype.hasOwnProperty.call(n, "scope.bluetooth")), o = !(n && Object.prototype.hasOwnProperty.call(n, "scope.userLocation")), e.next = 7, q("scope.bluetooth", n);
        case 7:
          return e.next = 9, q("scope.userLocation", n);
        case 9:
          if (!r && !o) {
            e.next = 11;
            break
          }
          return e.abrupt("return");
        case 11:
          if (!i) {
            e.next = 13;
            break
          }
          return e.abrupt("return");
        case 13:
          c = N(), u = 0;
        case 15:
          if (!(c && u < 3)) {
            e.next = 22;
            break
          }
          return e.next = 18, M(200);
        case 18:
          c = N();
        case 19:
          u += 1, e.next = 15;
          break;
        case 22:
          if (!c) {
            e.next = 25;
            break
          }
          throw ne(c), new Error(c);
        case 25:
        case "end":
          return e.stop()
      }
    }), e)
  })))).apply(this, arguments)
}

function G(e) {
  e && e.deviceId && (D && !A || (h && h(e), d.slice().forEach((function(t) {
    t !== h && t(e)
  }))))
}

function H(e) {
  e && e()
}

function J() {
  clearInterval(E), E = null
}

function W() {
  clearInterval(E), E = null
}

function Y() {
  clearInterval(k), k = null
}

function Q(e) {
  return new Promise((function(t, n) {
    wx.startBluetoothDevicesDiscovery(Object.assign({}, e, {
      success: function() {
        return t(!0)
      },
      fail: n
    }))
  }))
}

function X() {
  return Z.apply(this, arguments)
}

function Z() {
  return (Z = n(t().mark((function e() {
    var n, r, o;
    return t().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          n = [{
            allowDuplicatesKey: !0,
            powerLevel: "high",
            interval: 0
          }, {
            allowDuplicatesKey: !0
          }, {
            allowDuplicatesKey: !1
          }], r = null, o = 0;
        case 3:
          if (!(o < n.length)) {
            e.next = 16;
            break
          }
          return e.prev = 4, e.next = 7, Q(n[o]);
        case 7:
          return e.abrupt("return", !0);
        case 10:
          e.prev = 10, e.t0 = e.catch(4), r = e.t0;
        case 13:
          o += 1, e.next = 3;
          break;
        case 16:
          throw r || new Error("蓝牙扫描失败");
        case 17:
        case "end":
          return e.stop()
      }
    }), e, null, [
      [4, 10]
    ])
  })))).apply(this, arguments)
}

function $() {
  Y()
}

function ee() {
  wx.openAppAuthorizeSetting ? wx.openAppAuthorizeSetting({
    fail: function() {}
  }) : wx.openSetting && wx.openSetting({
    fail: function() {}
  })
}

function te() {
  if (O()) return wx.openSystemBluetoothSetting ? void wx.openSystemBluetoothSetting({
    fail: function() {
      return ee()
    }
  }) : void ee();
  wx.showModal && wx.showModal({
    title: "请开启蓝牙",
    content: "请前往 iOS 系统设置 → 蓝牙，打开蓝牙开关后回到小程序。",
    confirmText: "知道了",
    showCancel: !1
  })
}

function ne(e) {
  if (e && wx.showModal && !(Date.now() - g < 2500)) {
    g = Date.now();
    var t, n = !1 === (t = F()).bluetoothAuthorized || "denied" === t.bluetoothAuthorized ? {
      content: "微信的蓝牙权限未开启，请前往设置授权后重试。",
      confirmText: "去设置",
      open: ee
    } : !1 === t.bluetoothEnabled ? {
      content: "蓝牙总开关未打开，请先打开手机蓝牙。",
      confirmText: "打开蓝牙",
      open: te
    } : {
      content: U,
      confirmText: "去设置",
      open: ee
    };
    wx.showModal({
      title: "提示",
      content: n.content || e,
      confirmText: n.confirmText,
      cancelText: "知道了",
      success: function(e) {
        e.confirm && n.open()
      }
    })
  }
}

function re(e) {
  var t = R(e);
  return t ? new Error(t) : e
}

function oe(e) {
  ne(R(e))
}

function ce() {
  if (!v) {
    v = !0;
    try {
      wx.onBluetoothDeviceFound((function(e) {
        (e.devices || []).forEach(G)
      }))
    } catch (e) {}
  }
}

function ie(e) {
  var t = String(e && (e.errMsg || e.message) || "").toLowerCase();
  if (t.indexOf("auth deny") >= 0 || t.indexOf("auth denied") >= 0) return !1;
  var n = F();
  return !1 !== n.bluetoothEnabled && ("denied" !== n.bluetoothAuthorized && !1 !== n.bluetoothAuthorized)
}

function ue() {
  return new Promise((function(e, t) {
    try {
      wx.openBluetoothAdapter({
        success: function() {
          return e(!0)
        },
        fail: function(e) {
          return t(e || new Error("openBluetoothAdapter fail"))
        }
      })
    } catch (e) {
      t(e)
    }
  }))
}

function ae() {
  return (ae = n(t().mark((function e(n) {
    var r, o, c;
    return t().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if ("function" == typeof n && (h = n, d.indexOf(n) < 0 && d.push(n)), !i) {
            e.next = 4;
            break
          }
          return ce(), e.abrupt("return", !0);
        case 4:
          r = 3, o = null, c = 0;
        case 7:
          if (!(c < r)) {
            e.next = 28;
            break
          }
          return e.prev = 8, e.next = 11, ue();
        case 11:
          return i = !0, ce(), e.abrupt("return", !0);
        case 16:
          if (e.prev = 16, e.t0 = e.catch(8), o = e.t0, i = !1, !(c < r - 1 && ie(e.t0))) {
            e.next = 24;
            break
          }
          return e.next = 23, M(300);
        case 23:
          return e.abrupt("continue", 25);
        case 24:
          return e.abrupt("break", 28);
        case 25:
          c += 1, e.next = 7;
          break;
        case 28:
          throw oe(o), re(o);
        case 30:
        case "end":
          return e.stop()
      }
    }), e, null, [
      [8, 16]
    ])
  })))).apply(this, arguments)
}

function se(e) {
  var t = F();
  return !1 === t.locationEnabled || ("denied" === t.locationAuthorized || !1 === t.locationAuthorized || String(e && (e.errMsg || e.message) || "").toLowerCase().indexOf("location") >= 0)
}

function fe() {
  return new Promise((function(e) {
    wx.getLocation ? wx.getLocation({
      type: "wgs84",
      success: function() {
        return e(!0)
      },
      fail: function() {
        return e(!1)
      }
    }) : e(!1)
  }))
}

function le() {
  return (le = n(t().mark((function e(n) {
    var r;
    return t().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.next = 2, K();
        case 2:
          return r = !1, e.abrupt("return", new Promise((function(e, t) {
            D = !0, A = !1, {}, Y();
            var n = function() {
                A = !0, H((function() {
                  D ? (J(), $(), e(!0)) : e(!1)
                }))
              },
              o = function(e) {
                if (O() && !r && se(e)) return r = !0, void fe().then((function(t) {
                  t && D ? a(0) : c(e)
                }));
                c(e)
              },
              c = function(e) {
                D = !1, A = !0, W(), Y(), i = !1, oe(e), t(re(e))
              },
              u = function(e) {
                return String(e && (e.errMsg || e.message || e)).toLowerCase().indexOf("system error") >= 0
              },
              a = function t(r) {
                X().then(n).catch((function(c) {
                  if (!(r < 1 && u(c))) return r < 2 && u(c) ? (i = !1, v = !1, void wx.closeBluetoothAdapter({
                    complete: function() {
                      return setTimeout((function() {
                        D ? wx.openBluetoothAdapter({
                          success: function() {
                            if (i = !0, !v) {
                              v = !0;
                              try {
                                wx.onBluetoothDeviceFound((function(e) {
                                  (e.devices || []).forEach(G)
                                }))
                              } catch (e) {}
                            }
                            D ? X().then(n).catch(o) : e(!1)
                          },
                          fail: o
                        }) : e(!1)
                      }), 400)
                    }
                  })) : void o(c);
                  wx.stopBluetoothDevicesDiscovery({
                    complete: function() {
                      return setTimeout((function() {
                        D ? t(r + 1) : e(!1)
                      }), 500)
                    }
                  })
                }))
              };
            wx.stopBluetoothDevicesDiscovery({
              complete: function() {
                return setTimeout((function() {
                  D ? a(0) : e(!1)
                }), 180)
              }
            })
          })));
        case 4:
        case "end":
          return e.stop()
      }
    }), e)
  })))).apply(this, arguments)
}

function pe() {
  return D = !1, A = !0, W(), Y(), new Promise((function(e) {
    var t = !1,
      n = function(n) {
        t || (t = !0, clearTimeout(r), e(n))
      },
      r = setTimeout((function() {
        return n(!1)
      }), 800);
    wx.stopBluetoothDevicesDiscovery({
      complete: function() {
        return n(!0)
      }
    })
  }))
}

function he() {
  return (he = n(t().mark((function e(n, r) {
    var o, c, i, s;
    return t().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return o = ++y, e.next = 3, pe();
        case 3:
          if (c = u, !a || a === n) {
            e.next = 9;
            break
          }
          return e.next = 7, we();
        case 7:
          return e.next = 9, ye(a);
        case 9:
          if (!c || c === n) {
            e.next = 14;
            break
          }
          return e.next = 12, ye(c);
        case 12:
          return e.next = 14, M(z());
        case 14:
          if (Ee(), o !== y) {
            e.next = 25;
            break
          }
          if (!I().filter((function(e) {
              return e && e !== n
            })).length) {
            e.next = 25;
            break
          }
          return e.prev = 18, e.next = 21, ve(n);
        case 21:
          e.next = 25;
          break;
        case 23:
          e.prev = 23, e.t0 = e.catch(18);
        case 25:
          if (i = B ? Date.now() - B : 1 / 0, s = P(), !(c || i < s)) {
            e.next = 30;
            break
          }
          return e.next = 30, M(s);
        case 30:
          return a = n, C(n), e.abrupt("return", new Promise((function(e, t) {
            var c = !1,
              i = r || 1e4,
              s = setTimeout((function() {
                o === y && ye(n).then((function() {
                  o === y && Ee()
                })), o === y && (a = ""), l(new Error("连接超时"))
              }), i + 2500),
              f = function(e, t) {
                c || (c = !0, clearTimeout(s), e(t))
              },
              l = function(e) {
                return f(t, e)
              };
            o === y ? wx.createBLEConnection({
              deviceId: n,
              timeout: i,
              success: function() {
                o === y ? (a = "", u = n, de(n).then((function() {
                  return xe()
                })).then((function() {
                  o === y && u === n ? (f(e, !0), S = {}, C(n), setTimeout((function() {
                    o === y && u === n && ve(n).catch((function() {}))
                  }), 1200)) : ye(n).then((function() {
                    return l(new Error("连接操作已取消"))
                  }))
                })).catch((function(e) {
                  ye(n).then((function() {
                    o === y && Ee(), l(e)
                  }))
                }))) : ye(n).then((function() {
                  return l(new Error("连接操作已取消"))
                }))
              },
              fail: function(e) {
                o === y && (a = ""), oe(e), l(re(e))
              }
            }) : l(new Error("连接操作已取消"))
          })));
        case 33:
        case "end":
          return e.stop()
      }
    }), e, null, [
      [18, 23]
    ])
  })))).apply(this, arguments)
}

function de(e) {
  return new Promise((function(t) {
    wx.setBLEMTU ? wx.setBLEMTU({
      deviceId: e,
      mtu: 185,
      success: function(e) {
        j("[BLE MTU]", (p = Math.max(20, (e && e.mtu ? e.mtu : 185) - 3)) + 3), t(!0)
      },
      fail: function() {
        p = 20, t(!1)
      }
    }) : t(!1)
  }))
}

function we() {
  y += 1;
  var e = a;
  return a = "", e && e !== u ? ye(e) : Promise.resolve(!1)
}

function xe() {
  return new Promise((function(e, t) {
    wx.getBLEDeviceServices({
      deviceId: u,
      success: function(n) {
        var i = (n.services || []).find((function(e) {
          return ke(e.uuid, r) || e.uuid.toUpperCase().indexOf("2760") >= 0
        }));
        i ? (s = i.uuid, new Promise((function(e, t) {
          wx.getBLEDeviceCharacteristics({
            deviceId: u,
            serviceId: s,
            success: function(n) {
              var r = n.characteristics || [];
              j("[BLE characteristics]", r.map((function(e) {
                return e.uuid + " " + JSON.stringify(e.properties)
              })));
              var i = r.filter((function(e) {
                  return e.properties.write || e.properties.writeNoResponse
                })),
                a = r.filter((function(e) {
                  return e.properties.notify || e.properties.indicate
                })),
                p = i.find((function(e) {
                  return ke(e.uuid, o)
                })) || i.find((function(e) {
                  return e.uuid.toUpperCase().indexOf("0001") >= 0
                })) || i[0],
                h = a.find((function(e) {
                  return ke(e.uuid, c)
                })) || a.find((function(e) {
                  return e.uuid.toUpperCase().indexOf("0002") >= 0
                })) || a[0];
              p && h ? (f = p.uuid, p.properties.writeNoResponse && !p.properties.write ? "writeNoResponse" : "write", l = h.uuid, wx.notifyBLECharacteristicValueChange({
                deviceId: u,
                serviceId: s,
                characteristicId: l,
                state: !0,
                success: function() {
                  return setTimeout((function() {
                    return e(!0)
                  }), 200)
                },
                fail: function(e) {
                  oe(e), t(re(e))
                }
              })) : t(new Error("未找到写入或通知特征"))
            },
            fail: function(e) {
              oe(e), t(re(e))
            }
          })
        })).then(e).catch(t)) : t(new Error("未找到 BMS 服务 2760"))
      },
      fail: function(e) {
        oe(e), t(re(e))
      }
    })
  }))
}

function ve(e) {
  return new Promise((function(t) {
    var n = !1,
      o = function(e) {
        n || (n = !0, clearTimeout(c), t(e))
      },
      c = setTimeout((function() {
        return o(!1)
      }), 800),
      i = I().filter((function(t) {
        return t && t !== e
      })),
      u = function(t) {
        var n = {};
        t.forEach((function(t) {
          t && t !== e && (n[t] = !0)
        })), i.forEach((function(e) {
          n[e] = !0
        }));
        var r = Object.keys(n);
        if (!r.length) return o(!0);
        Promise.all(r.map((function(e) {
          return ye(e)
        }))).then((function() {
          return o(!0)
        })).catch((function() {
          return o(!1)
        }))
      },
      a = !1,
      s = setTimeout((function() {
        a || (a = !0, u([]))
      }), 400),
      f = function(e) {
        a || (a = !0, clearTimeout(s), u(e))
      };
    try {
      wx.getConnectedBluetoothDevices({
        services: [r],
        success: function(e) {
          return f((e && e.devices || []).map((function(e) {
            return e.deviceId
          })))
        },
        fail: function() {
          try {
            wx.getConnectedBluetoothDevices({
              success: function(e) {
                return f((e && e.devices || []).map((function(e) {
                  return e.deviceId
                })))
              },
              fail: function() {
                return f([])
              }
            })
          } catch (e) {
            f([])
          }
        }
      })
    } catch (e) {
      f([])
    }
  }))
}

function me() {
  return (me = n(t().mark((function e() {
    var n, r;
    return t().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return y += 1, D = !1, A = !0, W(), Y(), n = a, r = u, Ee(), a = "", e.prev = 9, e.next = 12, new Promise((function(e) {
            var t = !1,
              n = function() {
                t || (t = !0, clearTimeout(r), e())
              },
              r = setTimeout(n, 800);
            wx.stopBluetoothDevicesDiscovery({
              complete: n
            })
          }));
        case 12:
          e.next = 16;
          break;
        case 14:
          e.prev = 14, e.t0 = e.catch(9);
        case 16:
          if (e.prev = 16, !r) {
            e.next = 20;
            break
          }
          return e.next = 20, ye(r);
        case 20:
          e.next = 24;
          break;
        case 22:
          e.prev = 22, e.t1 = e.catch(16);
        case 24:
          if (e.prev = 24, !n || n === r) {
            e.next = 28;
            break
          }
          return e.next = 28, ye(n);
        case 28:
          e.next = 32;
          break;
        case 30:
          e.prev = 30, e.t2 = e.catch(24);
        case 32:
          return S = {}, e.next = 35, new Promise((function(e) {
            var t = !1,
              n = function() {
                t || (t = !0, clearTimeout(r), e())
              },
              r = setTimeout(n, 800);
            try {
              wx.closeBluetoothAdapter({
                complete: n
              })
            } catch (e) {
              n()
            }
          }));
        case 35:
          return i = !1, v = !1, e.next = 39, M(150);
        case 39:
          return e.next = 41, new Promise((function(e) {
            var t = !1,
              n = function() {
                t || (t = !0, clearTimeout(r), e())
              },
              r = setTimeout(n, 800);
            try {
              wx.openBluetoothAdapter({
                success: function() {
                  if (i = !0, !v) {
                    v = !0;
                    try {
                      wx.onBluetoothDeviceFound((function(e) {
                        (e.devices || []).forEach(G)
                      }))
                    } catch (e) {}
                  }
                  n()
                },
                fail: function() {
                  return n()
                }
              })
            } catch (e) {
              n()
            }
          }));
        case 41:
          B = Date.now();
        case 42:
        case "end":
          return e.stop()
      }
    }), e, null, [
      [9, 14],
      [16, 22],
      [24, 30]
    ])
  })))).apply(this, arguments)
}

function be() {
  return (be = n(t().mark((function n() {
    var r, o, c, s, f, l;
    return t().wrap((function(t) {
      for (;;) switch (t.prev = t.next) {
        case 0:
          return y += 1, D = !1, A = !0, W(), Y(), r = a, o = u, c = I(), Ee(), a = "", t.prev = 10, t.next = 13, new Promise((function(e) {
            var t = !1,
              n = function() {
                t || (t = !0, clearTimeout(r), e())
              },
              r = setTimeout(n, 800);
            wx.stopBluetoothDevicesDiscovery({
              complete: n
            })
          }));
        case 13:
          t.next = 17;
          break;
        case 15:
          t.prev = 15, t.t0 = t.catch(10);
        case 17:
          if (t.prev = 17, !o) {
            t.next = 21;
            break
          }
          return t.next = 21, ye(o);
        case 21:
          t.next = 25;
          break;
        case 23:
          t.prev = 23, t.t1 = t.catch(17);
        case 25:
          if (t.prev = 25, !r || r === o) {
            t.next = 29;
            break
          }
          return t.next = 29, ye(r);
        case 29:
          t.next = 33;
          break;
        case 31:
          t.prev = 31, t.t2 = t.catch(25);
        case 33:
          s = e(c), t.prev = 34, s.s();
        case 36:
          if ((f = s.n()).done) {
            t.next = 49;
            break
          }
          if ((l = f.value) && l !== o && l !== r) {
            t.next = 40;
            break
          }
          return t.abrupt("continue", 47);
        case 40:
          return t.prev = 40, t.next = 43, ye(l);
        case 43:
          t.next = 47;
          break;
        case 45:
          t.prev = 45, t.t3 = t.catch(40);
        case 47:
          t.next = 36;
          break;
        case 49:
          t.next = 54;
          break;
        case 51:
          t.prev = 51, t.t4 = t.catch(34), s.e(t.t4);
        case 54:
          return t.prev = 54, s.f(), t.finish(54);
        case 57:
          return S = {}, t.next = 60, M(150);
        case 60:
          return t.next = 62, new Promise((function(e) {
            var t = !1,
              n = function() {
                t || (t = !0, clearTimeout(r), i = !1, e())
              },
              r = setTimeout(n, 800);
            wx.closeBluetoothAdapter({
              complete: n
            })
          }));
        case 62:
          B = Date.now(), v = !1, b = !1;
        case 65:
        case "end":
          return t.stop()
      }
    }), n, null, [
      [10, 15],
      [17, 23],
      [25, 31],
      [34, 51, 54, 57],
      [40, 45]
    ])
  })))).apply(this, arguments)
}

function ye(e) {
  return new Promise((function(t) {
    if (e) {
      ge(e);
      var n = !1,
        r = function(e) {
          n || (n = !0, clearTimeout(o), B = Date.now(), t(e))
        },
        o = setTimeout((function() {
          return r(!1)
        }), 800);
      wx.closeBLEConnection({
        deviceId: e,
        complete: function() {
          return r(!0)
        }
      })
    } else t(!1)
  }))
}

function ge(e) {
  e && (T[e] = Date.now() + 2500)
}

function Ee() {
  u = "", s = "", f = "", "write", l = "", p = 20
}

function ke(e, t) {
  return String(e || "").toLowerCase() === String(t || "").toLowerCase()
}
module.exports = {
  SERVICE_UUID: r,
  WRITE_UUID: o,
  NOTIFY_UUID: c,
  init: function(e) {
    return ae.apply(this, arguments)
  },
  onDeviceFound: function(e) {
    return "function" != typeof e ? function() {} : (d.indexOf(e) < 0 && d.push(e), function() {
      d = d.filter((function(t) {
        return t !== e
      }))
    })
  },
  startScan: function(e) {
    return le.apply(this, arguments)
  },
  stopScan: pe,
  connect: function(e, t) {
    return he.apply(this, arguments)
  },
  cancelPendingOperations: we,
  disconnect: function() {
    y += 1;
    var e = a,
      t = u;
    return Ee(), a = "", Promise.all([ye(t), ye(e)]).then((function() {
      return !0
    }))
  },
  disconnectDevice: function(e) {
    return e && e === u && Ee(), ye(e)
  },
  write: function(e) {
    return new Promise((function(t, n) {
      u && s && f ? function e(t, n, r, o) {
        var c = Math.min(n + p, t.byteLength);
        wx.writeBLECharacteristicValue({
          deviceId: u,
          serviceId: s,
          characteristicId: f,
          value: t.slice(n, c),
          success: function() {
            c >= t.byteLength ? r(!0) : e(t, c, r, o)
          },
          fail: function(e) {
            oe(e), o(re(e))
          }
        })
      }(e, 0, t, n) : n(new Error("蓝牙未连接"))
    }))
  },
  onData: function(e) {
    w = e, m || (m = !0, wx.onBLECharacteristicValueChange((function(e) {
      !u || e.deviceId && e.deviceId !== u || w && w(e.value)
    })))
  },
  onConnectionStateChange: function(e) {
    return "function" == typeof e && x.indexOf(e) < 0 && x.push(e), b || (b = !0, wx.onBLEConnectionStateChange((function(e) {
        !e.connected && function(e) {
          if (!e) return !1;
          var t = T[e] || 0;
          return !!t && (delete T[e], Date.now() <= t)
        }(e.deviceId) || (e.connected || u && e.deviceId !== u || Ee(), x.slice().forEach((function(t) {
          return t(e)
        })))
      }))),
      function() {
        x = x.filter((function(t) {
          return t !== e
        }))
      }
  },
  shutdown: function() {
    return be.apply(this, arguments)
  },
  shutdownSync: function() {
    y += 1, D = !1, A = !0, W(), Y();
    var e = a,
      t = u,
      n = I();
    Ee(), a = "", i = !1, B = Date.now();
    try {
      wx.stopBluetoothDevicesDiscovery({})
    } catch (e) {}
    try {
      t && (ge(t), wx.closeBLEConnection({
        deviceId: t
      }))
    } catch (e) {}
    try {
      e && e !== t && (ge(e), wx.closeBLEConnection({
        deviceId: e
      }))
    } catch (e) {}
    n.forEach((function(n) {
      if (n && n !== t && n !== e) try {
        ge(n), wx.closeBLEConnection({
          deviceId: n
        })
      } catch (e) {}
    })), S = {};
    try {
      wx.closeBluetoothAdapter({})
    } catch (e) {}
    v = !1, b = !1
  },
  disconnectAllExcept: ve,
  resetAdapter: function() {
    return me.apply(this, arguments)
  }
};