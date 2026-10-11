package com.ridelog.app;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;

import java.lang.ref.WeakReference;

/**
 * H5 -> Java 桥接接口，注入为 window.AndroidBridge。
 * 方法由 WebView 内部线程调用，统一切回主线程执行。
 *
 * H5 可调用：
 *   startRecord()              开始蓝牙/GPS采集 + 新建CSV + 前台服务
 *   stopRecord()               停止全部采集，保存CSV，撤前台服务
 *   setScreenKeepOn(boolean)   屏幕常亮开关
 *   startBleScan()             扫描周边BLE设备（结果经 onBleDevices 推送）
 *   connectBle(mac)            连接指定MAC的保护板（自动重连3次）
 *   disconnectBle()            断开蓝牙
 */
public class JsBridge {

    private final WeakReference<MainActivity> actRef;
    private final Handler main = new Handler(Looper.getMainLooper());

    public JsBridge(MainActivity act) {
        actRef = new WeakReference<MainActivity>(act);
    }

    @JavascriptInterface
    public void startRecord() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onStartRecord();
            }
        });
    }

    @JavascriptInterface
    public void stopRecord() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onStopRecord();
            }
        });
    }

    /** 暂停记录：GPS 保持，暂停计时/里程/CSV 写入。 */
    @JavascriptInterface
    public void pauseRecord() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onPauseRecord();
            }
        });
    }

    /** 继续记录。 */
    @JavascriptInterface
    public void resumeRecord() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onResumeRecord();
            }
        });
    }

    @JavascriptInterface
    public void setScreenKeepOn(final boolean enable) {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onSetScreenKeepOn(enable);
            }
        });
    }

    @JavascriptInterface
    public void startBleScan() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onStartBleScan();
            }
        });
    }

    @JavascriptInterface
    public void stopBleScan() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onStopBleScan();
            }
        });
    }

    @JavascriptInterface
    public void connectBle(final String mac) {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onConnectBle(mac);
            }
        });
    }

    @JavascriptInterface
    public void disconnectBle() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onDisconnectBle();
            }
        });
    }

    /** 打开手表上的百度地图，目的地由用户在百度地图内自行设置。 */
    @JavascriptInterface
    public void openBaiduMap() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onOpenBaiduMap();
            }
        });
    }

    /** 请求地图应用候选列表（结果经 onMapCandidates 推送）。 */
    @JavascriptInterface
    public void requestMapCandidates() {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onRequestMapCandidates();
            }
        });
    }

    /** 手动指定地图应用包名，保存后立即打开。 */
    @JavascriptInterface
    public void setMapPackage(final String pkg) {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onSetMapPackage(pkg);
            }
        });
    }

    /**
     * 地图轮换开关：开启后每 10 秒在本 APP 数据屏与地图 APP 之间切换。
     */
    @JavascriptInterface
    public void setRotateMode(final boolean enable) {
        main.post(new Runnable() {
            @Override
            public void run() {
                MainActivity a = actRef.get();
                if (a != null) a.onSetRotateMode(enable);
            }
        });
    }
}
