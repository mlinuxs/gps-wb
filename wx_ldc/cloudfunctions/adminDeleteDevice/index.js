var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  t = require("wx-server-sdk");
t.init({
  env: t.DYNAMIC_CURRENT_ENV
});
var n = t.database();

function a(e) {
  return s.apply(this, arguments)
}

function s() {
  return (s = r(e().mark((function r(t) {
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

function u(e, r) {
  return i.apply(this, arguments)
}

function i() {
  return (i = r(e().mark((function r(t, a) {
    var s;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.prev = 0, e.next = 3, n.collection(t).where(a).remove();
        case 3:
          return s = e.sent, e.abrupt("return", s && (s.deleted || s.stats && s.stats.removed) || 0);
        case 7:
          return e.prev = 7, e.t0 = e.catch(0), e.abrupt("return", 0);
        case 10:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [0, 7]
    ])
  })))).apply(this, arguments)
}
exports.main = function() {
  var s = r(e().mark((function r(s, i) {
    var c, o, d, p, l, b;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return r = void 0, i = void 0, m = void 0, v = void 0, r = t.getWXContext() || {}, i = "function" == typeof t.getCloudbaseContext ? t.getCloudbaseContext() : {}, m = process.env || {}, v = "true" === String(m.TCB_ISANONYMOUS_USER || "").toLowerCase(), c = r.OPENID || i.OPENID || i.CUSTOM_USER_ID || i.TCB_CUSTOM_USER_ID || i.TCB_UUID || i.UID || (v ? "" : m.TCB_UUID) || "", e.next = 3, a(c);
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
          if (o = String(s.bmsid || "").trim()) {
            e.next = 9;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "缺少 BMSID"
          });
        case 9:
          return e.prev = 9, e.next = 12, n.collection("devices").where({
            bmsid: o
          }).limit(1).get();
        case 12:
          if ((d = e.sent).data && d.data.length) {
            e.next = 15;
            break
          }
          return e.abrupt("return", {
            ok: !0,
            bmsid: o,
            deleted: !1
          });
        case 15:
          return e.next = 17, n.collection("devices").doc(d.data[0]._id).remove();
        case 17:
          return e.next = 19, u("bindings", {
            bmsid: o
          });
        case 19:
          return p = e.sent, e.next = 22, u("commands", {
            bmsid: o
          });
        case 22:
          return l = e.sent, e.next = 25, u("telemetry", {
            bmsid: o
          });
        case 25:
          return b = e.sent, e.abrupt("return", {
            ok: !0,
            bmsid: o,
            deleted: !0,
            bindingsDeleted: p,
            commandsDeleted: l,
            telemetryDeleted: b
          });
        case 29:
          return e.prev = 29, e.t0 = e.catch(9), e.abrupt("return", {
            ok: !1,
            bmsid: o,
            error: String(e.t0 && e.t0.message || e.t0)
          });
        case 32:
        case "end":
          return e.stop()
      }
      var r, i, m, v
    }), r, null, [
      [9, 29]
    ])
  })));
  return function(e, r) {
    return s.apply(this, arguments)
  }
}();