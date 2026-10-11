var e = {
  envId: "cloud1-d0glpyg8z0ff99305",
  traceUser: !0
};
module.exports = {
  cloudConfig: e,
  isCloudConfigured: function() {
    return "string" == typeof e.envId && "" !== e.envId.trim()
  }
};