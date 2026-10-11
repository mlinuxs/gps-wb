var e = require("../@babel/runtime/helpers/regeneratorRuntime"),
  r = require("../@babel/runtime/helpers/asyncToGenerator"),
  n = require("./cloud-config"),
  t = n.cloudConfig,
  u = n.isCloudConfigured,
  i = !1,
  o = !1;

function c() {
  return !(!wx || !wx.cloud) && u()
}

function s() {
  if (i) return !0;
  if (o) return !1;
  if (!c()) return o = !0, !1;
  try {
    return wx.cloud.init({
      env: t.envId.trim(),
      traceUser: !!t.traceUser
    }), i = !0, !0
  } catch (e) {
    return o = !0, !1
  }
}

function a(e, r) {
  return l.apply(this, arguments)
}

function l() {
  return (l = r(e().mark((function r(n, t) {
    var u, i;
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          if (s()) {
            e.next = 4;
            break
          }
          throw (u = new Error("云开发未配置")).code = "CLOUD_NOT_CONFIGURED", u;
        case 4:
          return e.next = 6, wx.cloud.callFunction({
            name: n,
            data: t || {}
          });
        case 6:
          return i = e.sent, e.abrupt("return", i && i.result);
        case 8:
        case "end":
          return e.stop()
      }
    }), r)
  })))).apply(this, arguments)
}

function d(e, r) {
  return f.apply(this, arguments)
}

function f() {
  return (f = r(e().mark((function r(n, t) {
    return e().wrap((function(e) {
      for (;;) switch (e.prev = e.next) {
        case 0:
          return e.prev = 0, e.next = 3, a(n, t);
        case 3:
          return e.abrupt("return", e.sent);
        case 6:
          return e.prev = 6, e.t0 = e.catch(0), e.abrupt("return", null);
        case 9:
        case "end":
          return e.stop()
      }
    }), r, null, [
      [0, 6]
    ])
  })))).apply(this, arguments)
}
module.exports = {
  isReady: function() {
    return s()
  },
  cloudAvailable: c,
  call: a,
  callSilent: d,
  login: function() {
    return d("login", {})
  },
  bindDevice: function(e) {
    return e && e.bmsid ? d("bindDevice", e) : Promise.resolve(null)
  },
  reportTelemetry: function(e) {
    return e && e.bmsid ? d("reportTelemetry", e) : Promise.resolve(null)
  },
  getPendingCommands: function(e) {
    return e ? d("getPendingCommands", {
      bmsid: e
    }) : Promise.resolve(null)
  },
  finishCommand: function(e) {
    return e && e.commandId ? d("finishCommand", e) : Promise.resolve(null)
  },
  getBindings: function() {
    return d("getBindings", {})
  }
};