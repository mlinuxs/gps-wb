var t = [{
    name: "墨绿",
    color: "#14532D",
    dark: "#0F3D22"
  }, {
    name: "深蓝",
    color: "#1D4ED8",
    dark: "#1E40AF"
  }, {
    name: "紫色",
    color: "#7E22CE",
    dark: "#6B21A8"
  }, {
    name: "橙色",
    color: "#C2410C",
    dark: "#9A3412"
  }, {
    name: "青色",
    color: "#0F766E",
    dark: "#115E59"
  }],
  r = ["#14532D", "#166534", "#15803D", "#16A34A", "#22C55E", "#0F766E", "#0D9488", "#14B8A6", "#1E3A8A", "#1D4ED8", "#2563EB", "#3B82F6", "#0EA5E9", "#0284C7", "#0369A1", "#075985", "#4C1D95", "#6B21A8", "#7E22CE", "#9333EA", "#A855F7", "#C026D3", "#DB2777", "#E11D48", "#7F1D1D", "#B91C1C", "#DC2626", "#EA580C", "#C2410C", "#D97706", "#CA8A04", "#A16207", "#111827", "#374151", "#475569", "#64748B", "#6B7280", "#78716C", "#57534E", "#3F3F46"],
  o = ["#DC2626", "#F97316", "#F59E0B", "#EAB308", "#22C55E", "#0EA5E9", "#2563EB", "#7C3AED", "#DB2777"],
  n = ["#EF4444", "#F97316", "#F59E0B"],
  e = [],
  c = 0,
  a = "",
  u = !1,
  i = !1,
  l = null,
  f = 0,
  h = "";

function m() {
  return a ? {
    name: "自定义",
    color: a,
    dark: (r = a, o = s(r) || t[0].dark, n = parseInt(o.slice(1), 16), e = Math.max(0, Math.round(.78 * (n >> 16 & 255))), u = Math.max(0, Math.round(.78 * (n >> 8 & 255))), i = Math.max(0, Math.round(.78 * (255 & n))), "#" + [e, u, i].map((function(t) {
      return t.toString(16).padStart(2, "0")
    })).join("").toUpperCase())
  } : t[c] || t[0];
  var r, o, n, e, u, i
}

function s(t) {
  var r = String(t || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(r) ? r.toUpperCase() : ""
}

function F(r) {
  var o = s(r) || t[0].color,
    n = parseInt(o.slice(1), 16),
    e = (n >> 16 & 255) / 255,
    c = (n >> 8 & 255) / 255,
    a = (255 & n) / 255,
    u = Math.max(e, c, a),
    i = Math.min(e, c, a),
    l = (u + i) / 2,
    f = 0,
    h = 0;
  if (u !== i) {
    var m = u - i;
    h = l > .5 ? m / (2 - u - i) : m / (u + i), f = u === e ? (c - a) / m + (c < a ? 6 : 0) : u === c ? (a - e) / m + 2 : (e - c) / m + 4, f *= 60
  }
  return {
    h: f,
    s: h,
    l: l
  }
}

function C(t, r) {
  var o = Math.abs(t - r) % 360;
  return o > 180 ? 360 - o : o
}

function d(t) {
  var r = (t % 360 + 360) % 360;
  return r <= 20 || r >= 330
}

function E(t) {
  var r = t || m(),
    e = function(t) {
      for (var r = F(t).h, e = o.map((function(t) {
          return {
            color: t,
            h: F(t).h
          }
        })).slice().sort((function(t, o) {
          return C(o.h, r) - C(t.h, r)
        })), c = n.map((function(t) {
          return {
            color: t,
            h: F(t).h
          }
        })).filter((function(t) {
          return C(t.h, r) >= 55
        })).sort((function(t, o) {
          return C(o.h, r) - C(t.h, r)
        }))[0] || e[0], a = null, u = -1, i = 0; i < e.length; i += 1) {
        var l = e[i];
        if (l.color !== c.color && !d(l.h)) {
          var f = Math.min(C(l.h, r), C(l.h, c.h));
          f > u && (u = f, a = l)
        }
      }
      return a || (a = e.find((function(t) {
        return t.color !== c.color && !d(t.h)
      })) || e.find((function(t) {
        return t.color !== c.color
      })) || e[0]), {
        high: c.color,
        low: a.color
      }
    }(r.color);
  return "--theme-color:" + r.color + ";--theme-color-dark:" + r.dark + ";--cell-high-color:" + e.high + ";--cell-low-color:" + e.low + ";"
}

function g() {
  var t = m();
  return {
    themeIndex: c,
    themeName: t.name,
    themeColor: t.color,
    themeStyle: E(t),
    themeButtonStopped: u,
    showThemePalette: i
  }
}

function v(t, r) {
  var o = "number" == typeof r ? r : 0;
  try {
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: t.color,
      animation: {
        duration: o,
        timingFunc: "easeInOut"
      }
    })
  } catch (t) {}
  try {
    wx.setBackgroundColor && wx.setBackgroundColor({
      backgroundColor: "#FFFFFF",
      backgroundColorTop: "#FFFFFF",
      backgroundColorBottom: "#F6F8FA"
    })
  } catch (t) {}
}

function p() {
  l && (clearTimeout(l), l = null);
  var t = g();
  e.slice().forEach((function(r) {
    try {
      r(t)
    } catch (t) {}
  }))
}

function D(t) {
  t && "function" == typeof t.setData && t.setData(g()), v(m(), 0)
}! function() {
  try {
    var r = Number(wx.getStorageSync("bms_theme_index"));
    Number.isFinite(r) && r >= 0 && r < t.length && (c = r);
    var o = s(wx.getStorageSync("bms_theme_color"));
    o && (a = o)
  } catch (t) {}
  v(m())
}(), module.exports = {
  THEMES: t,
  apply: D,
  closePalette: function() {
    i = !1, p()
  },
  current: m,
  next: function() {
    a = "", h = "", c = (c + 1) % t.length;
    try {
      wx.setStorageSync("bms_theme_index", c), wx.removeStorageSync("bms_theme_color")
    } catch (t) {}
    return p(), v(m(), 0), m()
  },
  options: function() {
    return r.map((function(t, r) {
      return {
        index: r,
        color: t
      }
    }))
  },
  patch: g,
  previewColor: function(t) {
    var r = s(t);
    return r ? (r === h || (h = r, a = r, function() {
      var t = Date.now(),
        r = t - f;
      if (r >= 40) return f = t, v(m(), 0), void p();
      l || (l = setTimeout((function() {
        l = null, f = Date.now(), v(m(), 0), p()
      }), 40 - r))
    }()), m()) : m()
  },
  select: function(r) {
    var o = Number(r);
    if (!Number.isFinite(o) || o < 0 || o >= t.length) return m();
    a = "", h = "", c = o;
    try {
      wx.setStorageSync("bms_theme_index", c), wx.removeStorageSync("bms_theme_color")
    } catch (t) {}
    return p(), v(m(), 0), m()
  },
  selectColor: function(t) {
    var r = s(t);
    if (!r) return m();
    a = r, h = "", f = 0;
    try {
      wx.setStorageSync("bms_theme_color", a)
    } catch (t) {}
    return p(), v(m(), 0), m()
  },
  stopButtonBlink: function() {
    u = !0, p()
  },
  style: E,
  subscribe: function(t) {
    if (!t || "function" != typeof t.setData) return function() {};
    var r = function(r) {
      return t.setData(r)
    };
    return e.push(r), r(g()), v(m(), 0),
      function() {
        var t = e.indexOf(r);
        t >= 0 && e.splice(t, 1)
      }
  },
  sync: function(t) {
    return D(t), m()
  },
  togglePalette: function() {
    u = !0, i = !i, p()
  }
};