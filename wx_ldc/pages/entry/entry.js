Page({
  onReady: function() {
    var o = this;
    this.homeTimer = setTimeout((function() {
      return o.goHome()
    }), 800)
  },
  onUnload: function() {
    clearTimeout(this.homeTimer)
  },
  goHome: function() {
    wx.switchTab({
      url: "/pages/dashboard/dashboard"
    })
  }
});