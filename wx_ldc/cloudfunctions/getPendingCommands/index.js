var t = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  e = require("../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("../../@babel/runtime/helpers/typeof"),
  n = require("wx-server-sdk");
n.init({
  env: n.DYNAMIC_CURRENT_ENV
});
var a = n.database();

function i(t) {
  if (!t || "object" !== r(t)) return {
    data: {},
    http: !1
  };
  if (!("string" == typeof t.httpMethod || "string" == typeof t.path)) return {
    data: t,
    http: !1
  };
  var e = t.body;
  if ("string" == typeof e && e.length) try {
    e = JSON.parse(e)
  } catch (t) {
    e = {}
  }
  return {
    data: e && "object" === r(e) ? e : {},
    http: !0
  }
}

function s(t) {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(t)
  }
}

function u(t, e) {
  return o.apply(this, arguments)
}

function o() {
  return (o = e(t().mark((function e(r, n) {
    var i;
    return t().wrap((function(t) {
      for (;;) switch (t.prev = t.next) {
        case 0:
          if (r && n) {
            t.next = 2;
            break
          }
          return t.abrupt("return", !1);
        case 2:
          return t.next = 4, a.collection("bindings").where({
            openid: r,
            bmsid: n
          }).limit(1).get();
        case 4:
          return i = t.sent, t.abrupt("return", !(!i.data || !i.data.length));
        case 6:
        case "end":
          return t.stop()
      }
    }), e)
  })))).apply(this, arguments)
}
exports.main = function() {
  var r = e(t().mark((function e(r, o) {
    var c, p, d, b, m, f, h, l, g, y;
    return t().wrap((function(t) {
      for (;;) switch (t.prev = t.next) {
        case 0:
          if (c = i(r), p = c.data, d = c.http, b = function(t) {
              return d ? s(t) : t
            }, m = n.getWXContext(), f = m.OPENID, h = String(p.bmsid || "").trim(), l = String(p.clientId || "").trim(), g = f || (l ? "app:" + l : ""), h) {
            t.next = 8;
            break
          }
          return t.abrupt("return", b({
            ok: !1,
            error: "缺少 bmsid",
            commands: []
          }));
        case 8:
          if (t.prev = 8, t.t0 = !g, t.t0) {
            t.next = 14;
            break
          }
          return t.next = 13, u(g, h);
        case 13:
          t.t0 = !t.sent;
        case 14:
          if (!t.t0) {
            t.next = 16;
            break
          }
          return t.abrupt("return", b({
            ok: !1,
            bmsid: h,
            error: "未绑定该设备",
            commands: []
          }));
        case 16:
          return t.next = 18, a.collection("commands").where({
            bmsid: h,
            status: "pending"
          }).orderBy("createdAt", "asc").limit(20).get();
        case 18:
          return y = t.sent, t.abrupt("return", b({
            ok: !0,
            bmsid: h,
            commands: y.data || []
          }));
        case 22:
          return t.prev = 22, t.t1 = t.catch(8), t.abrupt("return", b({
            ok: !1,
            bmsid: h,
            error: String(t.t1 && t.t1.message || t.t1),
            commands: []
          }));
        case 25:
        case "end":
          return t.stop()
      }
    }), e, null, [
      [8, 22]
    ])
  })));
  return function(t, e) {
    return r.apply(this, arguments)
  }
}();