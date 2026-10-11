var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../../@babel/runtime/helpers/asyncToGenerator"),
  t = require("../../@babel/runtime/helpers/typeof"),
  n = require("../../@babel/runtime/helpers/createForOfIteratorHelper"),
  a = require("wx-server-sdk");
a.init({
  env: a.DYNAMIC_CURRENT_ENV
});
var u = a.database(),
  i = ["lock", "unlock", "writeRegister", "writeRegisters", "reportNow"];

function s(e) {
  if (!Array.isArray(e) || !e.length) return null;
  var r, a = [],
    u = n(e);
  try {
    for (u.s(); !(r = u.n()).done;) {
      var i = r.value;
      if (!i || "object" !== t(i)) return null;
      var s = Number(i.addr);
      if (!Number.isFinite(s)) return null;
      var o = Array.isArray(i.values) ? i.values : [i.value];
      if (!o.length) return null;
      var l, c = [],
        b = n(o);
      try {
        for (b.s(); !(l = b.n()).done;) {
          var d = l.value,
            p = Number(d);
          if (!Number.isFinite(p)) return null;
          c.push(65535 & p)
        }
      } catch (e) {
        b.e(e)
      } finally {
        b.f()
      }
      a.push({
        addr: 65535 & s,
        values: c
      })
    }
  } catch (e) {
    u.e(e)
  } finally {
    u.f()
  }
  return a
}

function o(e) {
  return l.apply(this, arguments)
}

function l() {
  return (l = r(e().mark((function r(t) {
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
          return e.prev = 2, e.next = 5, u.collection("users").where({
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
  var t = r(e().mark((function r(t, n) {
    var l, c, b, d, p, f, v, m, g;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (r = void 0, n = void 0, k = void 0, x = void 0, r = a.getWXContext() || {}, n = "function" == typeof a.getCloudbaseContext ? a.getCloudbaseContext() : {}, k = process.env || {}, x = "true" === String(k.TCB_ISANONYMOUS_USER || "").toLowerCase(), l = r.OPENID || n.OPENID || n.CUSTOM_USER_ID || n.TCB_CUSTOM_USER_ID || n.TCB_UUID || n.UID || (x ? "" : k.TCB_UUID) || "", c = String(t.bmsid || "").trim(), b = String(t.action || "").trim(), c) {
            e.next = 5;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "缺少 bmsid"
          });
        case 5:
          if (!(i.indexOf(b) < 0)) {
            e.next = 7;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "不支持的指令"
          });
        case 7:
          return e.next = 9, o(l);
        case 9:
          if ("admin" === e.sent) {
            e.next = 12;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "需要管理员权限"
          });
        case 12:
          if (d = new Date, p = {
              bmsid: c,
              action: b,
              status: "pending",
              createdBy: l,
              createdAt: d
            }, "writeRegister" !== b) {
            e.next = 21;
            break
          }
          if (f = Number(t.addr), v = Number(t.value), Number.isFinite(f) && Number.isFinite(v)) {
            e.next = 19;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "writeRegister 需要 addr 和 value"
          });
        case 19:
          p.addr = 65535 & f, p.value = 65535 & v;
        case 21:
          if ("writeRegisters" !== b) {
            e.next = 27;
            break
          }
          if (m = s(t.writes)) {
            e.next = 25;
            break
          }
          return e.abrupt("return", {
            ok: !1,
            error: "writeRegisters 需要 writes:[{addr,values}]"
          });
        case 25:
          p.writes = m, t.label && (p.label = String(t.label).slice(0, 40));
        case 27:
          return e.prev = 27, e.next = 30, u.collection("commands").add({
            data: p
          });
        case 30:
          return g = e.sent, e.abrupt("return", {
            ok: !0,
            commandId: g._id,
            bmsid: c,
            action: b
          });
        case 34:
          return e.prev = 34, e.t0 = e.catch(27), e.abrupt("return", {
            ok: !1,
            error: String(e.t0 && e.t0.message || e.t0)
          });
        case 37:
        case "end":
          return e.stop()
      }
      var r, n, k, x
    }), r, null, [
      [27, 34]
    ])
  })));
  return function(e, r) {
    return t.apply(this, arguments)
  }
}();