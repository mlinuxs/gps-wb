var t = 0,
  e = null;
module.exports = {
  getLocation: function(o) {
    var n = o || {},
      l = Date.now();
    return !n.force && l - t < 6e4 ? Promise.resolve(null) : e || (t = l, e = new Promise((function(t) {
      if (!wx || "function" != typeof wx.getLocation) return e = null, void t(null);
      wx.getLocation({
        type: "wgs84",
        success: function(o) {
          e = null, t({
            latitude: o.latitude,
            longitude: o.longitude,
            accuracy: o.accuracy,
            altitude: o.altitude,
            speed: o.speed,
            capturedAt: (new Date).toISOString()
          })
        },
        fail: function(o) {
          try {
            getApp().globalData.debugMode && console.log("[location] getLocation failed", o)
          } catch (t) {}
          e = null, t(null)
        }
      })
    })))
  },
  LOCATION_REPORT_INTERVAL_MS: 6e4
};