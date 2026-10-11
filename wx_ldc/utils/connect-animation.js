function e(e) {
  try {
    return e * (wx.getSystemInfoSync ? wx.getSystemInfoSync() : {
      windowWidth: 375
    }).windowWidth / 750
  } catch (t) {
    return e / 2
  }
}

function t(t) {
  var n = function() {
      try {
        return wx.getSystemInfoSync ? wx.getSystemInfoSync() : {
          windowWidth: 375,
          windowHeight: 667
        }
      } catch (e) {
        return {
          windowWidth: 375,
          windowHeight: 667
        }
      }
    }(),
    i = "search" === t ? -122 : 122,
    c = e(190);
  return {
    left: Math.round(n.windowWidth / 2 + e(i) - c / 2) + "px",
    top: Math.round(.46 * n.windowHeight - c / 2) + "px",
    width: Math.round(c) + "px",
    height: Math.round(c) + "px",
    fontSize: Math.round(e(138)) + "px",
    lineHeight: Math.round(c) + "px"
  }
}

function n(e, t, n) {
  return "left:" + e.left + ";top:" + e.top + ";width:" + e.width + ";height:" + e.height + ";font-size:" + e.fontSize + ";line-height:" + e.lineHeight + ";opacity:" + t + ";transition:" + n + ";"
}

function i(t, i) {
  var c = {
    left: i,
    top: e(18) + "px",
    width: e(88) + "px",
    height: e(78) + "px",
    fontSize: e(54) + "px",
    lineHeight: e(78) + "px"
  };
  return n(t ? {
    left: t.left + "px",
    top: t.top + "px",
    width: t.width + "px",
    height: t.height + "px",
    fontSize: e(54) + "px",
    lineHeight: t.height + "px"
  } : c, "0.18", "left 760ms cubic-bezier(0.2, 0.8, 0.2, 1), top 760ms cubic-bezier(0.2, 0.8, 0.2, 1), width 760ms cubic-bezier(0.2, 0.8, 0.2, 1), height 760ms cubic-bezier(0.2, 0.8, 0.2, 1), font-size 760ms cubic-bezier(0.2, 0.8, 0.2, 1), line-height 760ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 760ms ease")
}

function c(e) {
  e && (e.connectFlyTimer && clearTimeout(e.connectFlyTimer), e.connectFlyClearTimer && clearTimeout(e.connectFlyClearTimer), e.connectFlyTimer = null, e.connectFlyClearTimer = null, e.connectFlyRunning = !1, "function" == typeof e.setData && e.data && e.setData({
    showConnectFly: !1,
    connectFlySearchStyle: "",
    connectFlyCameraStyle: ""
  }))
}
module.exports = {
  trigger: function(o) {
    if (o && "function" == typeof o.setData) {
      c(o), o.connectFlyRunning = !0;
      var r = t("search"),
        l = t("camera");
      o.setData({
          showConnectFly: !0,
          connectFlySearchStyle: n(r, "1", "none"),
          connectFlyCameraStyle: n(l, "1", "none")
        }),
        function(e, t) {
          e && "function" == typeof e.createSelectorQuery ? (wx.createSelectorQuery ? wx.createSelectorQuery().in(e) : e.createSelectorQuery()).select(".head-action-search").boundingClientRect().select(".head-action-camera").boundingClientRect().exec((function(e) {
            return t(e && e[0], e && e[1])
          })) : t(null, null)
        }(o, (function(t, n) {
          o.connectFlyTimer = setTimeout((function() {
            o.setData({
              connectFlySearchStyle: i(t, "calc(100vw - " + e(182) + "px)"),
              connectFlyCameraStyle: i(n, "calc(100vw - " + e(92) + "px)")
            })
          }), 60), o.connectFlyClearTimer = setTimeout((function() {
            return c(o)
          }), 940)
        }))
    }
  },
  clear: c,
  isRunning: function(e) {
    return !(!e || !e.connectFlyRunning)
  },
  shouldRun: function(e, t, n) {
    return !(!e || !n) && (!!e.pageVisible && (e.connectionAnimationReady ? !t && !!n.connected : (e.connectionAnimationReady = !0, !1)))
  }
};