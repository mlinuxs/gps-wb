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
exports.main = function() {
  var o = e(t().mark((function e(o, s) {
    var c, u, d, l, p, b, m, h, f, g, x, v, y, k, w, A, S, N, j;
    return t().wrap((function(t) {
      for (;;) switch (t.prev = t.next) {
        case 0:
          if (c = i(o), u = c.data, d = c.http, l = function(t) {
              return d ? (e = t, {
                statusCode: 200,
                headers: {
                  "content-type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(e)
              }) : t;
              var e
            }, p = n.getWXContext(), b = p.OPENID, m = String(u.bmsid || "").trim(), h = String(u.clientId || "").trim(), f = b || (h ? "app:" + h : ""), m) {
            t.next = 8;
            break
          }
          return t.abrupt("return", l({
            ok: !1,
            error: "缺少 bmsid"
          }));
        case 8:
          return g = new Date, x = new Date(g.getTime() + 1296e6), v = u.metrics && "object" === r(u.metrics) ? u.metrics : {}, y = u.location && "object" === r(u.location) ? u.location : null, k = a.collection("devices"), w = a.collection("bindings"), t.prev = 14, t.next = 17, k.where({
            bmsid: m
          }).limit(1).get();
        case 17:
          if ((A = t.sent).data && A.data.length) {
            t.next = 20;
            break
          }
          return t.abrupt("return", l({
            ok: !1,
            bmsid: m,
            error: "设备未添加到后台，拒绝上报"
          }));
        case 20:
          if (!f) {
            t.next = 27;
            break
          }
          return t.next = 23, w.where({
            openid: f,
            bmsid: m
          }).limit(1).get();
        case 23:
          if ((S = t.sent).data && S.data.length) {
            t.next = 27;
            break
          }
          return t.next = 27, w.add({
            data: {
              openid: f,
              bmsid: m,
              role: "owner",
              createdAt: g
            }
          });
        case 27:
          return t.next = 29, a.collection("telemetry").where({
            bmsid: m,
            expiresAt: a.command.lt(g)
          }).remove().catch((function() {
            return null
          }));
        case 29:
          return N = {
            bmsid: m,
            openid: f,
            metrics: v,
            reportedAt: g,
            expiresAt: x
          }, y && (N.location = y), t.next = 33, a.collection("telemetry").add({
            data: N
          });
        case 33:
          return j = {
            online: !0,
            status: "online",
            lastStatusAt: g,
            latest: v,
            lastSeenAt: g
          }, y && (j.location = y, j.lastLocationAt = g), t.next = 37, k.doc(A.data[0]._id).update({
            data: j
          });
        case 37:
          t.next = 42;
          break;
        case 39:
          return t.prev = 39, t.t0 = t.catch(14), t.abrupt("return", l({
            ok: !1,
            bmsid: m,
            error: String(t.t0 && t.t0.message || t.t0)
          }));
        case 42:
          return t.abrupt("return", l({
            ok: !0,
            bmsid: m
          }));
        case 43:
        case "end":
          return t.stop()
      }
    }), e, null, [
      [14, 39]
    ])
  })));
  return function(t, e) {
    return o.apply(this, arguments)
  }
}();