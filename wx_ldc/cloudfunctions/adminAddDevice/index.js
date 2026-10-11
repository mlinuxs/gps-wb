var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  t = require("wx-server-sdk");
t.init({
  env: t.DYNAMIC_CURRENT_ENV
});
var n = t.database();

function a(e) {
  return u.apply(this, arguments)
}

function u() {
  return (u = r(e().mark((function r(t) {
    var a;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (t) {
            e.next = 2;
            break
          }
          return e.abrupt("return", "");
        case 2:
          return e.prev = 2, e.next = 5, n.collection("users").where({
            openid: t
          }).limit(1).get();
        case 5:
          return a = e.sent, e.abrupt("return", a.data && a.data[0] && a.data[0].role || "user");
        case 9:
          return e.prev = 9, e.t0 = e.catch(2), e.abrupt("return", "");
        case 12:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [2, 9]
    ])
  })))).apply(this, arguments)
}
exports.main = function() {
  var u = r(e().mark((function r(u, i) {
    var s, o, c, d, p, m;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return r = void 0, i = void 0, l = void 0, b = void 0, r = t.getWXContext() || {}, i = "function" == typeof t.getCloudbaseContext ? t.getCloudbaseContext() : {}, l = process.env || {}, b = "true" === String(l.TCB_ISANONYMOUS_USER || "").toLowerCase(), s = r.OPENID || i.OPENID || i.CUSTOM_USER_ID || i.TCB_CUSTOM_USER_ID || i.TCB_UUID || i.UID || (b ? "" : l.TCB_UUID) || "", e.next = 3, a(s);
        case 3:
          if ("admin" === e.sent) {
            e.next = 6;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "需要管理员权限"
          });
        case 6:
          if (o = String(u.bmsid || "").trim()) {
            e.next = 9;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "缺少 BMSID"
          });
        case 9:
          return c = new Date, d = n.collection("devices"), p = {
            bmsid: o,
            deviceName: String(u.deviceName || "").trim(),
            sn: String(u.sn || "").trim(),
            manufacturer: String(u.manufacturer || "").trim(),
            model: String(u.model || "").trim(),
            customerGroup: String(u.customerGroup || u.group || "").trim(),
            updatedAt: c
          }, e.prev = 12, e.next = 15, d.where({
            bmsid: o
          }).limit(1).get();
        case 15:
          if (!(m = e.sent).data || !m.data.length) {
            e.next = 20;
            break
          }
          return e.next = 19, d.doc(m.data[0]._id).update({
            data: p
          });
        case 19:
          return e.abrupt("return", {
            ok: !0,
            bmsid: o,
            updated: !0
          });
        case 20:
          return e.next = 22, d.add({
            data: Object.assign({
              createdAt: c,
              lastSeenAt: null,
              online: !1,
              status: "offline"
            }, p)
          });
        case 22:
          return e.abrupt("return", {
            ok: !0,
            bmsid: o,
            created: !0
          });
        case 25:
          return e.prev = 25, e.t0 = e.catch(12), e.abrupt("return", {
            ok: !1,
            bmsid: o,
            error: String(e.t0 && e.t0.message || e.t0)
          });
        case 28:
        case "end":
          return e.stop()
      }
      var r, i, l, b
    }), r, null, [
      [12, 25]
    ])
  })));
  return function(e, r) {
    return u.apply(this, arguments)
  }
}();