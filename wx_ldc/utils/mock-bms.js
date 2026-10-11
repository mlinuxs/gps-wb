var e = require("./crc16").appendCrc;

function n(e, n, r) {
  var t = 2 * n;
  e[t] = r >> 8 & 255, e[t + 1] = 255 & r
}

function r(e, n, r) {
  var t = 2 * n,
    i = r >>> 0;
  e[t] = i >> 24 & 255, e[t + 1] = i >> 16 & 255, e[t + 2] = i >> 8 & 255, e[t + 3] = 255 & i
}

function t(e, n, t) {
  r(e, n, t >>> 0)
}

function i(e, n, r, t) {
  for (var i = 2 * n, a = String(t || ""), c = 0; c < r; c++) e[i + c] = c < a.length ? 127 & a.charCodeAt(c) : 0
}

function a(e, n, r) {
  var t = 2 * n,
    i = new DataView(new ArrayBuffer(4));
  i.setFloat32(0, r, !1), e[t] = i.getUint8(0), e[t + 1] = i.getUint8(1), e[t + 2] = i.getUint8(2), e[t + 3] = i.getUint8(3)
}

function c(e, n, r, t, i, a) {
  return (e - 2022 & 63) << 26 | (15 & n) << 22 | (31 & r) << 17 | (31 & t) << 12 | (63 & i) << 6 | 63 & a
}

function o(e, o) {
  var u, f, v;
  return e >= 2048 ? (i(v = new Uint8Array(64), 4, 24, "MOCK-BMS-DEVICE-0001"), u = v, f = 2048) : e >= 1536 ? (u = function() {
    var e = new Uint8Array(18);
    return t(e, 3, 16909060), a(e, 7, 1), e
  }(), f = 1536) : e >= 1024 ? (u = function() {
    var e = new Uint8Array(240);
    return n(e, 0, 3e3), n(e, 1, 18), t(e, 2, 49600), t(e, 4, 5e4), n(e, 6, 120), n(e, 7, 12), i(e, 8, 32, "BT202606220001"), t(e, 24, c(2026, 6, 3, 18, 37, 54)), t(e, 26, c(2026, 4, 29, 11, 32, 56)), t(e, 72, 2), t(e, 74, 1280), e
  }(), f = 1024) : e >= 768 ? (u = function() {
    for (var e = new Uint8Array(128), n = 0; n < 32; n++) a(e, 2 * n, .12 + .005 * n);
    return e
  }(), f = 768) : e >= 512 ? (u = function() {
    var e = new Uint8Array(192),
      r = {
        512: 16,
        513: 0,
        514: 2,
        515: 1001,
        516: 258,
        517: 21,
        518: 60,
        519: 600,
        520: 5840,
        521: 5e3,
        522: 3650,
        523: 1e3,
        524: 30,
        525: 120,
        532: 3300,
        533: 10,
        534: 1e3,
        528: 3750,
        529: 3600,
        535: 2500,
        536: 2800,
        538: 120,
        544: 80,
        546: 55,
        548: 0,
        550: 65,
        552: 65516,
        554: 80
      };
    return Object.keys(r).forEach((function(t) {
      return n(e, Number(t) - 512, r[t])
    })), i(e, 48, 12, "LA2601150001"), i(e, 54, 8, "LA"), i(e, 58, 24, "B108-300A"), i(e, 70, 8, "LAXNY"), i(e, 74, 24, "LABMS-B108-300A"), i(e, 86, 8, "20260115"), e
  }(), f = 512) : (u = function() {
    var e = new Uint8Array(128);
    n(e, 0, 2981), n(e, 1, 2976), n(e, 2, 2979), n(e, 3, 2982), r(e, 4, 4e4), r(e, 6, 5e5), r(e, 8, 74200), n(e, 14, 0), n(e, 15, 2048), n(e, 19, 775), n(e, 20, 25688), n(e, 21, 1030), n(e, 22, 785), n(e, 23, 12320), n(e, 24, 4096), n(e, 26, 86), n(e, 27, 9e3), n(e, 28, 1e4), n(e, 31, 21);
    for (var t = 0; t < 16; t++) n(e, 32 + t, 3278 + t % 5 * 3);
    return e
  }(), f = 0), u.slice(2 * (e - f), 2 * (e - f + o))
}
module.exports = {
  buildReadResponse: function(n, r, t) {
    var i = o(r, t),
      a = new Uint8Array(5 + i.length);
    return a[0] = n, a[1] = 3, a[2] = r >> 8 & 255, a[3] = 255 & r, a[4] = i.length, a.set(i, 5), e(a).buffer
  },
  devices: function() {
    return [{
      deviceId: "MOCK_BMS_001",
      name: "BMS-16S-DEMO",
      localName: "BMS-16S-DEMO",
      RSSI: -43,
      connectable: !0,
      advertisServiceUUIDs: ["00002760-08C2-11E1-9073-0E8AC72E1001"],
      mock: !0
    }, {
      deviceId: "MOCK_SENSOR",
      name: "TempSensor-A1",
      localName: "TempSensor-A1",
      RSSI: -66,
      connectable: !0,
      advertisServiceUUIDs: [],
      mock: !0
    }]
  }
};