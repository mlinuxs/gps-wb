var t = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  e = require("../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("../../@babel/runtime/helpers/typeof"),
  n = require("wx-server-sdk");
n.init({
  env: n.DYNAMIC_CURRENT_ENV
});
var a = n.database();

function u(t) {
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

function i(t, e) {
  return c.apply(this, arguments)
}

function c() {
  return (c = e(t().mark((function e(r, n) {
    var u;
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
          return u = t.sent, t.abrupt("return", !(!u.data || !u.data.length));
        case 6:
        case "end":
          return t.stop()
      }
    }), e)
  })))).apply(this, arguments)
}
exports.main = function() {
  var r = e(t().mark((function e(r, c) {
    var o, d, p, f, m, b, l, h, g, x, k, y, v;
    return t().wrap((function(t) {
      for (;;) switch (t.prev = t.next) {
        case 0:
          if (o = u(r), d = o.data, p = o.http, f = function(t) {
              return p ? s(t) : t
            }, m = n.getWXContext(), b = m.OPENID, l = String(d.commandId || "").trim(), h = String(d.clientId || "").trim(), g = b || (h ? "app:" + h : ""), l) {
            t.next = 8;
            break
          }
          return t.abrupt("return", f({
            ok: !1,
            error: "缺少 commandId"
          }));
        case 8:
          return x = !1 === d.success ? "failed" : "done", k = new Date, t.prev = 10, t.next = 13, a.collection("commands").doc(l).get();
        case 13:
          if (y = t.sent, (v = y && y.data) && v.bmsid) {
            t.next = 17;
            break
          }
          return t.abrupt("return", f({
            ok: !1,
            commandId: l,
            error: "指令不存在"
          }));
        case 17:
          if (t.t0 = !g, t.t0) {
            t.next = 22;
            break
          }
          return t.next = 21, i(g, v.bmsid);
        case 21:
          t.t0 = !t.sent;
        case 22:
          if (!t.t0) {
            t.next = 24;
            break
          }
          return t.abrupt("return", f({
            ok: !1,
            commandId: l,
            error: "未绑定该设备"
          }));
        case 24:
          return t.next = 26, a.collection("commands").doc(l).update({
            data: {
              status: x,
              result: d.result || "",
              finishedBy: g,
              finishedAt: k
            }
          });
        case 26:
          t.next = 31;
          break;
        case 28:
          return t.prev = 28, t.t1 = t.catch(10), t.abrupt("return", f({
            ok: !1,
            commandId: l,
            error: String(t.t1 && t.t1.message || t.t1)
          }));
        case 31:
          return t.abrupt("return", f({
            ok: !0,
            commandId: l,
            status: x
          }));
        case 32:
        case "end":
          return t.stop()
      }
    }), e, null, [
      [10, 28]
    ])
  })));
  return function(t, e) {
    return r.apply(this, arguments)
  }
}();