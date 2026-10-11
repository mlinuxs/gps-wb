var e = require("../../@babel/runtime/helpers/regeneratorRuntime"),
  t = require("../../@babel/runtime/helpers/asyncToGenerator"),
  r = require("../../utils/bms-client"),
  s = require("../../utils/theme"),
  i = require("../../utils/protocol");

function a(e) {
  return e >= 1048576 ? (e / 1024 / 1024).toFixed(2) + " MB" : e >= 1024 ? (e / 1024).toFixed(1) + " KB" : e + " B"
}
Page({
  data: {
    themeIndex: 0,
    themeColor: "#14532D",
    themeName: "墨绿",
    connected: !1,
    currentVersion: "--",
    targetVersionWord: 258,
    fileName: "未选择固件",
    fileSize: "--",
    hasFirmware: !1,
    fileBoxPromptClass: "",
    filePromptVisible: !1,
    progress: 0,
    upgrading: !1,
    status: "请选择固件文件"
  },
  onLoad: function() {
    this.unsubscribeTheme = s.subscribe(this), s.sync(this)
  },
  onShow: function() {
    this.refreshVersion()
  },
  onUnload: function() {
    this.unsubscribeTheme && this.unsubscribeTheme(), this.unsubscribeTheme = null
  },
  refreshVersion: function() {
    var s = this;
    return t(e().mark((function t() {
      var a, n, o;
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            if (a = getApp().globalData.connected, s.setData({
                connected: a
              }), a) {
              e.next = 6;
              break
            }
            return s.stopFilePromptBlink(), s.setData({
              currentVersion: "--",
              status: "请先连接 BMS"
            }), e.abrupt("return");
          case 6:
            return s.firmware && s.firmware.length || s.startFilePromptBlink(), e.prev = 7, e.next = 10, r.readRegisters(19, 1, 2e3);
          case 10:
            n = e.sent, o = i.u16(n, 0), s.setData({
              currentVersion: (t = o, l = void 0, u = void 0, l = t >> 8 & 255, u = String(255 & t).padStart(2, "0"), l + "." + u),
              targetVersionWord: o || 258,
              status: s.firmware ? "固件已选择" : "请选择固件文件"
            }), e.next = 18;
            break;
          case 15:
            e.prev = 15, e.t0 = e.catch(7), s.setData({
              currentVersion: "--",
              status: e.t0.message || e.t0.errMsg || "读取版本失败"
            });
          case 18:
          case "end":
            return e.stop()
        }
        var t, l, u
      }), t, null, [
        [7, 15]
      ])
    })))()
  },
  chooseFile: function() {
    var e = this;
    this.data.upgrading || (wx.chooseMessageFile ? wx.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["bin"],
      success: function(t) {
        var r = t.tempFiles && t.tempFiles[0];
        r ? e.readFirmwareFile(r) : e.data.hasFirmware || e.flashFilePrompt()
      },
      fail: function(t) {
        t && String(t.errMsg || "").indexOf("cancel") >= 0 ? e.data.hasFirmware || e.flashFilePrompt() : wx.showToast({
          title: "选择文件失败",
          icon: "none"
        })
      }
    }) : wx.showToast({
      title: "当前微信版本不支持选择文件",
      icon: "none"
    }))
  },
  readFirmwareFile: function(e) {
    var t = this;
    if (!/\.bin$/i.test(e.name || "")) return this.firmware = null, this.setData({
      hasFirmware: !1,
      fileName: "未选择固件",
      fileSize: "--",
      status: "仅支持.bin 固件文件"
    }), this.startFilePromptBlink(), void wx.showToast({
      title: "仅支持.bin 文件",
      icon: "none"
    });
    wx.getFileSystemManager().readFile({
      filePath: e.path,
      success: function(r) {
        var s, i;
        try {
          if (!(s = (i = r.data) instanceof ArrayBuffer ? new Uint8Array(i) : new Uint8Array(i || [])).length) throw new Error("固件文件为空")
        } catch (e) {
          return t.firmware = null, t.setData({
            hasFirmware: !1,
            fileName: "未选择固件",
            fileSize: "--",
            status: e.message || "固件文件无效"
          }), t.startFilePromptBlink(), void wx.showToast({
            title: e.message || "固件文件无效",
            icon: "none"
          })
        }
        t.firmware = s, t.stopFilePromptBlink(), t.setData({
          fileName: e.name || "firmware",
          fileSize: a(s.length),
          hasFirmware: !0,
          fileBoxPromptClass: "",
          filePromptVisible: !1,
          progress: 0,
          status: "固件已选择"
        })
      },
      fail: function(e) {
        t.setData({
          status: e.message || e.errMsg || "读取固件失败"
        }), wx.showToast({
          title: "读取固件失败",
          icon: "none"
        })
      }
    })
  },
  startUpgrade: function() {
    var e = this;
    if (!this.data.upgrading)
      if (getApp().globalData.connected)
        if (this.firmware && this.firmware.length) {
          var t = this.data.targetVersionWord || 258;
          wx.showModal({
            title: "确认升级",
            content: "固件 " + this.data.fileName + "\n升级过程中请勿断电或断开蓝牙。",
            confirmText: "开始",
            cancelText: "取消",
            success: function(r) {
              r.confirm && e.runUpgrade(t)
            }
          })
        } else this.flashFilePrompt();
    else wx.showToast({
      title: "请先连接 BMS",
      icon: "none"
    })
  },
  flashFilePrompt: function() {
    this.startFilePromptBlink(), this.setData({
      status: "请选择固件文件"
    }), wx.showToast({
      title: "请选择固件文件",
      icon: "none"
    })
  },
  startFilePromptBlink: function() {
    this.setData({
      fileBoxPromptClass: "file-box-alert",
      filePromptVisible: !0
    })
  },
  stopFilePromptBlink: function() {
    this.setData({
      fileBoxPromptClass: "",
      filePromptVisible: !1
    })
  },
  runUpgrade: function(s) {
    var i = this;
    return t(e().mark((function t() {
      return e().wrap((function(e) {
        for (;;) switch (e.prev = e.next) {
          case 0:
            return i.setData({
              upgrading: !0,
              progress: 0,
              status: "开始升级"
            }), e.prev = 1, e.next = 4, r.otaRun({
              version: s,
              firmware: i.firmware,
              timeoutMs: 5e3,
              packetRetry: 2,
              packetDelayMs: 5,
              onProgress: function(e, t) {
                var r = t ? Math.min(100, Math.round(100 * e / t)) : 0;
                i.setData({
                  progress: r,
                  status: "正在发送 " + r + "%"
                })
              }
            });
          case 4:
            i.setData({
              upgrading: !1,
              progress: 100,
              status: "升级完成，设备可能会自动重启"
            }), wx.showModal({
              title: "升级完成",
              content: "固件升级已完成，请确认。",
              showCancel: !1,
              confirmText: "确认",
              success: function() {
                return i.refreshVersion()
              }
            }), e.next = 12;
            break;
          case 8:
            e.prev = 8, e.t0 = e.catch(1), i.setData({
              upgrading: !1,
              status: e.t0.message || e.t0.errMsg || "升级失败"
            }), wx.showToast({
              title: e.t0.message || e.t0.errMsg || "升级失败",
              icon: "none"
            });
          case 12:
          case "end":
            return e.stop()
        }
      }), t, null, [
        [1, 8]
      ])
    })))()
  }
});