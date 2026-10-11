var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("../../@babel/runtime/helpers/typeof"),
  n = require("wx-server-sdk");
n.init({
  env: n.DYNAMIC_CURRENT_ENV
});
var a = n.database();

function i(e) {
  if (!e || "object" !== r(e)) return {
    data: {},
    http: !1
  };
  if (!("string" == typeof e.httpMethod || "string" == typeof e.path)) return {
    data: e,
    http: !1
  };
  var t = e.body;
  if ("string" == typeof t && t.length) try {
    t = JSON.parse(t)
  } catch (e) {
    t = {}
  }
  return {
    data: t && "object" === r(t) ? t : {},
    http: !0
  }
}

function s(e) {
  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(e)
  }
}
exports.main = function() {
  var r = t(e().mark((function t(r, u) {
    var d, o, c, p, b, l, m, f, h, g, v, x, k, y, N;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (d = i(r), o = d.data, c = d.http, p = n.getWXContext(), b = p.OPENID, l = String(o.bmsid || "").trim(), m = String(o.clientId || "").trim(), f = b || (m ? "app:" + m : ""), h = function(e) {
              return c ? s(e) : e
            }, l) {
            e.next = 8;
            break
          }
          return e.abrupt("return", h({
            ok: !1,
            error: "缺少 bmsid"
          }));
        case 8:
          return g = new Date, v = a.collection("devices"), x = a.collection("bindings"), k = {
            deviceName: o.deviceName || "",
            deviceId: o.deviceId || "",
            sn: o.sn || "",
            manufacturer: o.manufacturer || "",
            model: o.model || ""
          }, e.prev = 12, e.next = 15, v.where({
            bmsid: l
          }).limit(1).get();
        case 15:
          if ((y = e.sent).data && y.data.length) {
            e.next = 18;
            break
          }
          return e.abrupt("return", h({
            ok: !1,
            bmsid: l,
            error: "设备未添加到后台，拒绝绑定"
          }));
        case 18:
          return e.next = 20, v.doc(y.data[0]._id).update({
            data: Object.assign({}, k, {
              online: !0,
              status: "online",
              lastBindAt: g,
              lastSeenAt: g,
              lastStatusAt: g
            })
          });
        case 20:
          if (!f) {
            e.next = 27;
            break
          }
          return e.next = 23, x.where({
            openid: f,
            bmsid: l
          }).limit(1).get();
        case 23:
          if ((N = e.sent).data && N.data.length) {
            e.next = 27;
            break
          }
          return e.next = 27, x.add({
            data: {
              openid: f,
              bmsid: l,
              role: "owner",
              createdAt: g
            }
          });
        case 27:
          e.next = 32;
          break;
        case 29:
          return e.prev = 29, e.t0 = e.catch(12), e.abrupt("return", h({
            ok: !1,
            bmsid: l,
            error: String(e.t0 && e.t0.message || e.t0)
          }));
        case 32:
          return e.abrupt("return", h({
            ok: !0,
            bmsid: l
          }));
        case 33:
        case "end":
          return e.stop()
      }
    }), t, null, [
      [12, 29]
    ])
  })));
  return function(e, t) {
    return r.apply(this, arguments)
  }
}();