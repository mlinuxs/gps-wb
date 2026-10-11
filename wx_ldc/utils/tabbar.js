var t = "",
  n = 0,
  e = [];

function r(t) {
  return "/" + String(t || "").replace(/^\//, "")
}

function u() {
  var t = "function" == typeof getCurrentPages ? getCurrentPages() : [],
    n = t[t.length - 1];
  return n && n.route ? r(n.route) : ""
}

function c(c) {
  var o = r(c || u());
  o && o !== t && (n += 1, function(t) {
    e.slice().forEach((function(n) {
      try {
        n(t)
      } catch (t) {}
    }))
  }(t = o))
}

function o() {
  return t || u()
}
module.exports = {
  get: o,
  set: c,
  sync: function(e, r) {
    var u = n + 1;
    c(r), e && "function" == typeof e.getTabBar && [0, 50, 150, 300].forEach((function(c) {
      setTimeout((function() {
        if (!(n > u)) {
          var c = e.getTabBar && e.getTabBar();
          c && "function" == typeof c.setActivePath && c.setActivePath(t || r)
        }
      }), c)
    }))
  },
  subscribe: function(t) {
    return "function" != typeof t ? function() {} : (e.push(t), t(o()), function() {
      var n = e.indexOf(t);
      n >= 0 && e.splice(n, 1)
    })
  }
};