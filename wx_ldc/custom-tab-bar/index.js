var t = require("../utils/tabbar"),
  e = require("../utils/theme"),
  a = [{
    pagePath: "/pages/dashboard/dashboard",
    text: "实时状态",
    iconClass: "tab-icon-realtime"
  }, {
    pagePath: "/pages/params/params",
    text: "参数设置",
    iconClass: "tab-icon-params"
  }, {
    pagePath: "/pages/control/control",
    text: "BMS控制",
    iconClass: "tab-icon-control"
  }, {
    pagePath: "/pages/mine/mine",
    text: "我的",
    iconClass: "tab-icon-mine"
  }];

function s(t) {
  return String(t || "").replace(/^\//, "")
}

function i(t) {
  var i = s(t),
    n = e.current().color;
  return a.map((function(t, e) {
    var a = s(t.pagePath) === i;
    return Object.assign({}, t, {
      itemClass: "tabbar-item-" + e,
      active: a,
      color: a ? n : "#2A2F2D"
    })
  }))
}
Component({
  data: {
    list: i("")
  },
  lifetimes: {
    attached: function() {
      var a = this;
      this.unsubscribeTabbar = t.subscribe((function(t) {
        return a.setActivePath(t)
      })), this.unsubscribeTheme = e.subscribe({
        setData: function() {
          return a.setActivePath(t.get())
        }
      })
    },
    detached: function() {
      this.unsubscribeTabbar && this.unsubscribeTabbar(), this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTabbar = null, this.unsubscribeTheme = null
    }
  },
  pageLifetimes: {
    show: function() {
      this.setActivePath(t.get())
    }
  },
  methods: {
    setActivePath: function(e) {
      this.setData({
        list: i(e || t.get())
      })
    },
    switchTab: function(e) {
      var s = e.currentTarget.dataset.path,
        i = a.find((function(t) {
          return t.pagePath === s
        }));
      i && (t.set(i.pagePath), wx.switchTab({
        url: i.pagePath
      }))
    }
  }
});