var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("wx-server-sdk");
r.init({
  env: r.DYNAMIC_CURRENT_ENV
});
var n = r.database(),
  a = n.command;

function u(e) {
  return s.apply(this, arguments)
}

function s() {
  return (s = t(e().mark((function t(r) {
    var a;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (r) {
            e.next = 2;
            break
          }
          return e.abrupt("return", "");
        case 2:
          return e.prev = 2, e.next = 5, n.collection("users").where({
            openid: r
          }).limit(1).get();
        case 5:
          return a = e.sent, e.abrupt("return", a.data && a.data[0] && a.data[0].role || "user");
        case 9:
          return e.prev = 9, e.t0 = e.catch(2), e.abrupt("return", "");
        case 12:
        case "end":
          return e.stop()
      }
    }), t, null, [
      [2, 9]
    ])
  })))).apply(this, arguments)
}

function i(e) {
  if (!e) return 0;
  if (e instanceof Date) return e.getTime();
  var t = new Date(e).getTime();
  return Number.isFinite(t) ? t : 0
}
exports.main = function() {
  var s = t(e().mark((function t(s, o) {
    var c, l, d, m, p, f, v;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return c = Date.now(), t = void 0, s = void 0, o = void 0, b = void 0, t = r.getWXContext() || {}, s = "function" == typeof r.getCloudbaseContext ? r.getCloudbaseContext() : {}, o = process.env || {}, b = "true" === String(o.TCB_ISANONYMOUS_USER || "").toLowerCase(), l = t.OPENID || s.OPENID || s.CUSTOM_USER_ID || s.TCB_CUSTOM_USER_ID || s.TCB_UUID || s.UID || (b ? "" : o.TCB_UUID) || "", e.next = 4, u(l);
        case 4:
          if ("admin" === e.sent) {
            e.next = 7;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "需要管理员权限",
            devices: []
          });
        case 7:
          return e.prev = 7, e.next = 10, n.collection("devices").orderBy("lastSeenAt", "desc").limit(200).get();
        case 10:
          if (d = e.sent, (m = d.data || []).length) {
            e.next = 14;
            break
          }
          return e.abrupt("return", {
            ok: !0,
            devices: [],
            serverTime: c
          });
        case 14:
          if (p = m.map((function(e) {
              return e.bmsid
            })).filter(Boolean), f = {}, !p.length) {
            e.next = 21;
            break
          }
          return e.next = 19, n.collection("commands").where({
            bmsid: a.in(p)
          }).orderBy("createdAt", "desc").limit(500).get();
        case 19:
          (e.sent.data || []).forEach((function(e) {
            f[e.bmsid] || (f[e.bmsid] = e)
          }));
        case 21:
          return v = m.map((function(e) {
            var t = f[e.bmsid] || null,
              r = i(e.lastSeenAt);
            return {
              bmsid: e.bmsid,
              deviceName: e.deviceName || "",
              sn: e.sn || "",
              manufacturer: e.manufacturer || "",
              model: e.model || "",
              customerGroup: e.customerGroup || e.group || "",
              latest: e.latest || null,
              location: e.location || null,
              lastSeenAt: e.lastSeenAt || null,
              lastStatusAt: e.lastStatusAt || null,
              lastOfflineAt: e.lastOfflineAt || null,
              online: r > 0 && c - r <= 12e4,
              lastCommand: t ? {
                action: t.action || "",
                status: t.status || "",
                result: t.result || "",
                createdAt: t.createdAt || null
              } : null
            }
          })), e.abrupt("return", {
            ok: !0,
            devices: v,
            serverTime: c
          });
        case 25:
          return e.prev = 25, e.t0 = e.catch(7), e.abrupt("return", {
            ok: !1,
            error: String(e.t0 && e.t0.message || e.t0),
            devices: []
          });
        case 28:
        case "end":
          return e.stop()
      }
      var t, s, o, b
    }), t, null, [
      [7, 25]
    ])
  })));
  return function(e, t) {
    return s.apply(this, arguments)
  }
}();