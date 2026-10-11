var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  t = require("wx-server-sdk");
t.init({
  env: t.DYNAMIC_CURRENT_ENV
});
var n = t.database(),
  a = n.command;
exports.main = function() {
  var i = r(e().mark((function r(i, s) {
    var u, c, o, l, d, m, b, p;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return u = t.getWXContext(), c = u.OPENID, e.prev = 1, e.next = 4, n.collection("bindings").where({
            openid: c
          }).orderBy("createdAt", "desc").limit(100).get();
        case 4:
          if (o = e.sent, (l = o.data || []).length) {
            e.next = 8;
            break
          }
          return e.abrupt("return", {
            ok: !0,
            devices: []
          });
        case 8:
          return d = l.map((function(e) {
            return e.bmsid
          })).filter(Boolean), e.next = 11, n.collection("devices").where({
            bmsid: a.in(d)
          }).limit(100).get();
        case 11:
          return m = e.sent, b = {}, (m.data || []).forEach((function(e) {
            b[e.bmsid] = e
          })), p = l.map((function(e) {
            var r = b[e.bmsid] || {};
            return {
              bmsid: e.bmsid,
              role: e.role || "owner",
              boundAt: e.createdAt,
              deviceName: r.deviceName || "",
              sn: r.sn || "",
              manufacturer: r.manufacturer || "",
              model: r.model || "",
              latest: r.latest || null,
              lastSeenAt: r.lastSeenAt || null
            }
          })), e.abrupt("return", {
            ok: !0,
            devices: p
          });
        case 18:
          return e.prev = 18, e.t0 = e.catch(1), e.abrupt("return", {
            ok: !1,
            error: String(e.t0 && e.t0.message || e.t0),
            devices: []
          });
        case 21:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [1, 18]
    ])
  })));
  return function(e, r) {
    return i.apply(this, arguments)
  }
}();