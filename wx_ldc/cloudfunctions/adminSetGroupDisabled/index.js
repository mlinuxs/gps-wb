var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  t = require("wx-server-sdk");
t.init({
  env: t.DYNAMIC_CURRENT_ENV
});
var a = t.database();

function n(e) {
  return u.apply(this, arguments)
}

function u() {
  return (u = r(e().mark((function r(t) {
    var n;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (t) {
            e.next = 2;
            break
          }
          return e.abrupt("return", "");
        case 2:
          return e.prev = 2, e.next = 5, a.collection("users").where({
            openid: t
          }).limit(1).get();
        case 5:
          return n = e.sent, e.abrupt("return", n.data && n.data[0] && n.data[0].role || "user");
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
  var u = r(e().mark((function r(u) {
    var s, i, o, c, d, p, l;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return r = void 0, b = void 0, v = void 0, f = void 0, r = t.getWXContext() || {}, b = "function" == typeof t.getCloudbaseContext ? t.getCloudbaseContext() : {}, v = process.env || {}, f = "true" === String(v.TCB_ISANONYMOUS_USER || "").toLowerCase(), s = r.OPENID || b.OPENID || b.CUSTOM_USER_ID || b.TCB_CUSTOM_USER_ID || b.TCB_UUID || b.UID || (f ? "" : v.TCB_UUID) || "", e.next = 3, n(s);
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
          if (i = String(u.group || u.customerGroup || "").trim()) {
            e.next = 9;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "缺少分组名称"
          });
        case 9:
          return o = !!u.disabled, c = new Date, d = a.collection("deviceGroups"), e.prev = 12, e.next = 15, d.where({
            name: i
          }).limit(1).get();
        case 15:
          if (p = e.sent, l = {
              name: i,
              disabled: o,
              updatedAt: c,
              updatedBy: s
            }, !p.data || !p.data.length) {
            e.next = 21;
            break
          }
          return e.next = 20, d.doc(p.data[0]._id).update({
            data: l
          });
        case 20:
          return e.abrupt("return", {
            ok: !0,
            group: i,
            disabled: o,
            updated: !0
          });
        case 21:
          return e.next = 23, d.add({
            data: Object.assign({
              createdAt: c
            }, l)
          });
        case 23:
          return e.abrupt("return", {
            ok: !0,
            group: i,
            disabled: o,
            created: !0
          });
        case 26:
          return e.prev = 26, e.t0 = e.catch(12), e.abrupt("return", {
            ok: !1,
            group: i,
            disabled: o,
            error: String(e.t0 && e.t0.message || e.t0)
          });
        case 29:
        case "end":
          return e.stop()
      }
      var r, b, v, f
    }), r, null, [
      [12, 26]
    ])
  })));
  return function(e) {
    return u.apply(this, arguments)
  }
}();