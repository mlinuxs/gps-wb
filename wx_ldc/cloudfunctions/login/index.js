var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  n = require("wx-server-sdk");
n.init({
  env: n.DYNAMIC_CURRENT_ENV
});
var r = n.database();
r.command;

function a(e, t) {
  var n = e || {},
    r = t || {},
    a = process.env || {},
    i = "true" === String(a.TCB_ISANONYMOUS_USER || "").toLowerCase();
  return n.OPENID || r.OPENID || r.CUSTOM_USER_ID || r.TCB_CUSTOM_USER_ID || r.TCB_UUID || r.UID || (i ? "" : a.TCB_UUID) || ""
}
exports.main = function() {
  var i = t(e().mark((function t(i, o) {
    var s, u, c, d, p, b, l, C, f, O, I, N, U, g, D;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          N = function(e) {
            try {
              return JSON.parse(JSON.stringify(e, (function(e, t) {
                return "function" == typeof t ? "[fn]" : I(e) ? "[masked]" : /OPENID|UID|UUID|CUSTOM_USER_ID/i.test(e) ? O(t) : t
              })))
            } catch (e) {
              return String(e)
            }
          }, I = function(e) {
            return /SECRET|TOKEN|KEY|PASSWORD|ENVIRON|ENVIRONMENT|HTTP|CONTEXT_CNFG/i.test(String(e || ""))
          }, O = function(e) {
            var t = String(null == e ? "" : e);
            return t ? t.length <= 8 ? "***" : t.slice(0, 4) + "***" + t.slice(-4) : ""
          }, s = n.getWXContext(), u = "function" == typeof n.getCloudbaseContext ? n.getCloudbaseContext() : {}, c = {};
          try {
            "function" == typeof n.getCloudbaseContext && (c = n.getCloudbaseContext(o) || {})
          } catch (e) {}
          if (d = s.APPID, p = s.UNIONID, b = Object.assign({}, u, c), l = a(s, b), C = new Date, f = r.collection("users"), U = {}, Object.keys(process.env || {}).filter((function(e) {
              return /UID|UUID|OPENID|USER|LOGIN|TCB|WX|AUTH/i.test(e)
            })).forEach((function(e) {
              U[e] = I(e) ? "[masked]" : O(process.env[e])
            })), g = {
              wxKeys: s ? Object.keys(s) : [],
              wxDump: N(s),
              tcbNoArgKeys: u ? Object.keys(u) : [],
              tcbWithCtxKeys: c ? Object.keys(c) : [],
              tcbWithCtxDump: N(c),
              contextKeys: o ? Object.keys(o) : [],
              contextDump: N(o),
              envIdentity: U,
              resolved: O(l)
            }, l) {
            e.next = 17;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            openid: "",
            error: "未取到用户标识",
            diag: g
          });
        case 17:
          return e.prev = 17, e.next = 20, f.where({
            openid: l
          }).limit(1).get();
        case 20:
          if (!(D = e.sent).data || !D.data.length) {
            e.next = 26;
            break
          }
          return e.next = 24, f.doc(D.data[0]._id).update({
            data: {
              lastLoginAt: C,
              unionid: p || D.data[0].unionid || ""
            }
          });
        case 24:
          e.next = 28;
          break;
        case 26:
          return e.next = 28, f.add({
            data: {
              openid: l,
              unionid: p || "",
              appid: d || "",
              role: "user",
              createdAt: C,
              lastLoginAt: C
            }
          });
        case 28:
          e.next = 33;
          break;
        case 30:
          return e.prev = 30, e.t0 = e.catch(17), e.abrupt("return", {
            ok: !1,
            openid: l,
            error: String(e.t0 && e.t0.message || e.t0),
            diag: g
          });
        case 33:
          return e.abrupt("return", {
            ok: !0,
            openid: l,
            unionid: p || ""
          });
        case 34:
        case "end":
          return e.stop()
      }
    }), t, null, [
      [17, 30]
    ])
  })));
  return function(e, t) {
    return i.apply(this, arguments)
  }
}();