package com.ridelog.app;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.ridelog.app.ble.BleManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.util.Locale;

/**
 * 唯一界面：全屏 WebView 加载 assets/index.html（file:///android_asset/index.html）。
 * 负责绑定 RideService、注册数据回调、屏幕常亮、JS 调用分发。
 */
public class MainActivity extends Activity {

    private static final String TAG = "MainActivity";
    /* 地图应用按「应用显示名 + 包名」关键字自动识别；识别不到时可手动选择，选择结果持久保存 */
    private static final long ROTATE_INTERVAL_MS = 10000L;
    private static final int PERM_REQ = 1001;
    private static final String PREFS = "ridelog";
    private static final String PREF_MAP_PKG = "map_pkg";
    /* 已知地图包名，按优先级排列：手表版优先于手机版，百度优先 */
    private static final String[] PREFERRED_MAP_PKGS = {
            "com.baidu.BaiduMap.watch",
            "com.autonavi.minimap.watch",
            "com.baidu.BaiduMap",
            "com.autonavi.minimap"
    };

    private WebView webView;
    private RideService service;
    private boolean bound = false;
    private boolean serviceStarted = false;

    /* 已解析到的地图包名（首次使用时查找一次并缓存） */
    private String resolvedMapPkg;

    /* 手表自身电量：随系统广播变化推送给 H5 顶部状态行 */
    private final BroadcastReceiver batteryReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent == null) { return; }
            int level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
            int scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
            if (level < 0 || scale <= 0) { return; }
            int pct = Math.round(level * 100f / scale);
            try {
                JSONObject o = new JSONObject();
                o.put("level", pct);
                callJs("onWatchBattery", o.toString());
            } catch (Exception e) {
                Log.w(TAG, "push watch battery fail", e);
            }
        }
    };

    /* 地图轮换：每 10 秒在「本 APP 数据屏」与「地图 APP」之间切换 */
    private boolean rotateMode = false;
    private boolean activityVisible = false;
    private final Handler rotateHandler = new Handler(Looper.getMainLooper());

    private final Runnable rotateRunnable = new Runnable() {
        @Override
        public void run() {
            if (!rotateMode) return;
            if (activityVisible) {
                /* 本 APP 在前 → 切到地图 */
                launchMap();
            } else {
                /* 地图在前 → 切回本 APP */
                bringSelfToFront();
            }
            rotateHandler.postDelayed(this, ROTATE_INTERVAL_MS);
        }
    };

    private final RideService.UiCallback uiCallback = new RideService.UiCallback() {
        @Override
        public void onDataUpdate(String json) {
            callJs("onDataUpdate", json);
        }

        @Override
        public void onStatusUpdate(String json) {
            callJs("onStatusUpdate", json);
        }

        @Override
        public void onBleDevices(String json) {
            callJs("onBleDevices", json);
        }
    };

    private final ServiceConnection conn = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder binder) {
            service = ((RideService.LocalBinder) binder).getService();
            service.setUiCallback(uiCallback);
            bound = true;
            // 启动即自动搜索连接 LABMS 系列保护板
            service.autoConnectBle(BleManager.TARGET_DEVICE_NAME);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            service = null;
            bound = false;
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setWebViewClient(new WebViewClient());
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        // 放宽 file:// 页面资源访问限制（兼容部分旧 WebView）
        try {
            webView.getSettings().setAllowFileAccessFromFileURLs(true);
            webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        } catch (Exception ignored) {
        }
        webView.addJavascriptInterface(new JsBridge(this), "AndroidBridge");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");

        // 手表电量：注册后系统会立即回传一次当前值，之后随变化回调
        try {
            registerReceiver(batteryReceiver, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
        } catch (Exception e) {
            Log.w(TAG, "register battery receiver fail", e);
        }

        // 授权后才启动采集服务：服务 onCreate 会立即开始 GPS 记录并创建 CSV
        if (hasCollectPermissions()) {
            startCollectService();
        } else {
            requestCollectPermissions();
        }
    }

    // ------------------------------------------------------------ 运行时权限（Android 6.0+）

    /** 采集所需权限：定位（GPS + BLE 扫描）与存储（CSV 落盘）。 */
    private static String[] collectPermissions() {
        return new String[]{
                android.Manifest.permission.ACCESS_FINE_LOCATION,
                android.Manifest.permission.ACCESS_COARSE_LOCATION,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
                android.Manifest.permission.READ_EXTERNAL_STORAGE
        };
    }

    /** Android 6.0 以下为安装时授权，直接视为已授权。 */
    private boolean hasCollectPermissions() {
        if (Build.VERSION.SDK_INT < 23) { return true; }
        try {
            java.lang.reflect.Method check =
                    Context.class.getMethod("checkSelfPermission", String.class);
            for (String p : collectPermissions()) {
                Object r = check.invoke(this, p);
                if (!(r instanceof Integer) || ((Integer) r) != PackageManager.PERMISSION_GRANTED) {
                    return false;
                }
            }
            return true;
        } catch (Throwable t) {
            Log.w(TAG, "checkSelfPermission fail, assume granted", t);
            return true;
        }
    }

    /** compileSdk=21 无 requestPermissions，用反射调用（Android 6.0+ 运行时存在该方法）。 */
    private void requestCollectPermissions() {
        try {
            java.lang.reflect.Method req =
                    Activity.class.getMethod("requestPermissions", String[].class, int.class);
            req.invoke(this, collectPermissions(), PERM_REQ);
        } catch (Throwable t) {
            Log.w(TAG, "requestPermissions fail", t);
            startCollectService();
        }
    }

    /**
     * 系统权限回调。compileSdk=21 无法写 @Override，但运行期签名一致，
     * Android 6.0+ 会正常回调到这里（Activity 的实现本身为空，无需 super）。
     */
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode != PERM_REQ) { return; }
        if (hasCollectPermissions()) {
            startCollectService();
        } else {
            Toast.makeText(this, "缺少定位/存储权限，无法记录骑行数据，请在系统设置中授予",
                    Toast.LENGTH_LONG).show();
        }
    }

    private void startCollectService() {
        if (serviceStarted) { return; }
        serviceStarted = true;
        Intent svc = new Intent(this, RideService.class);
        try {
            startService(svc);
            bindService(svc, conn, Context.BIND_AUTO_CREATE);
        } catch (Exception e) {
            Log.e(TAG, "start/bind service fail", e);
        }
    }

    // ------------------------------------------------------------ H5 指令入口

    public void onStartRecord() {
        if (service != null) service.startRecord();
    }

    public void onStopRecord() {
        if (service != null) service.stopRecord();
    }

    public void onPauseRecord() {
        if (service != null) service.pauseRecord();
    }

    public void onResumeRecord() {
        if (service != null) service.resumeRecord();
    }

    public void onStartBleScan() {
        if (service != null) service.startBleScan();
    }

    public void onStopBleScan() {
        if (service != null) service.stopBleScan();
    }

    public void onConnectBle(String mac) {
        if (service != null) service.connectBle(mac);
    }

    public void onDisconnectBle() {
        if (service != null) service.disconnectBle();
    }

    public void onSetScreenKeepOn(boolean enable) {
        if (enable) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    /** 打开手表上的地图应用，导航交给地图自身完成；未识别到时弹出选择列表。 */
    public void onOpenBaiduMap() {
        if (mapPackage() == null) {
            Toast.makeText(this, "未自动识别到地图应用，请手动选择", Toast.LENGTH_SHORT).show();
            onRequestMapCandidates();
            return;
        }
        launchMap();
    }

    // ------------------------------------------------------------ 生命周期（轮换用）

    @Override
    protected void onResume() {
        super.onResume();
        activityVisible = true;
    }

    @Override
    protected void onPause() {
        super.onPause();
        activityVisible = false;
    }

    // ------------------------------------------------------------ 地图轮换

    /** H5 开关：每 10 秒在本 APP 与地图 APP 之间切换显示。 */
    public void onSetRotateMode(boolean enable) {
        rotateMode = enable;
        rotateHandler.removeCallbacks(rotateRunnable);
        if (enable) {
            if (mapPackage() == null) {
                Toast.makeText(this, "未识别到地图应用，请先手动选择", Toast.LENGTH_SHORT).show();
                onRequestMapCandidates();
                rotateMode = false;
                return;
            }
            Toast.makeText(this, "地图轮换已开启（每10秒）", Toast.LENGTH_SHORT).show();
            rotateHandler.postDelayed(rotateRunnable, ROTATE_INTERVAL_MS);
        } else {
            Toast.makeText(this, "地图轮换已关闭", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * 解析地图应用包名，优先级：
     * 1) 本次已解析缓存  2) 用户手动选择  3) 已知包名清单（手表版优先）  4) 按名称/包名自动识别。
     */
    private String mapPackage() {
        if (resolvedMapPkg != null && isInstalled(resolvedMapPkg)) { return resolvedMapPkg; }
        String saved = savedMapPkg();
        if (saved != null && isInstalled(saved)) {
            resolvedMapPkg = saved;
            return resolvedMapPkg;
        }
        for (String p : PREFERRED_MAP_PKGS) {
            if (isInstalled(p)) {
                resolvedMapPkg = p;
                return resolvedMapPkg;
            }
        }
        resolvedMapPkg = autoFindMapPackage();
        return resolvedMapPkg;
    }

    private String savedMapPkg() {
        try {
            return getSharedPreferences(PREFS, MODE_PRIVATE).getString(PREF_MAP_PKG, null);
        } catch (Throwable t) {
            return null;
        }
    }

    private boolean isInstalled(String pkg) {
        if (pkg == null) { return false; }
        try {
            getPackageManager().getPackageInfo(pkg, 0);
            return true;
        } catch (Throwable t) {
            return false;
        }
    }

    private String appLabel(String pkg) {
        try {
            android.content.pm.ApplicationInfo ai = getPackageManager().getApplicationInfo(pkg, 0);
            return String.valueOf(getPackageManager().getApplicationLabel(ai));
        } catch (Throwable t) {
            return pkg;
        }
    }

    /**
     * 自动识别地图应用：按「应用名 + 包名」打分取最高分。
     * 名称命中（如「百度地图」）权重高于包名命中，避免误唤起无关应用。
     */
    private String autoFindMapPackage() {
        PackageManager pm = getPackageManager();
        int bestScore = 0;
        String best = null;
        try {
            List<android.content.pm.ApplicationInfo> apps = pm.getInstalledApplications(0);
            for (android.content.pm.ApplicationInfo ai : apps) {
                if (ai == null || ai.packageName == null) { continue; }
                if (getPackageName().equals(ai.packageName)) { continue; }
                String pkg = ai.packageName.toLowerCase(Locale.US);
                String label;
                try {
                    label = String.valueOf(pm.getApplicationLabel(ai));
                } catch (Throwable t) {
                    label = "";
                }
                int score = 0;
                if (label.contains("百度地图")) { score = 100; }
                else if (pkg.contains("baidu") && pkg.contains("map")) { score = 95; }
                else if (label.contains("百度")) { score = 90; }
                else if (pkg.contains("baidu")) { score = 80; }
                else if (label.contains("地图")) { score = 60; }
                else if (label.contains("导航")) { score = 45; }
                if (score > bestScore) { bestScore = score; best = ai.packageName; }
            }
            if (bestScore < 45) { best = null; }
        } catch (Throwable t) {
            Log.w(TAG, "auto find map package fail", t);
        }
        return best;
    }

    /** 扫描疑似地图/导航类应用，推送给 H5 供用户手动指定。 */
    public void onRequestMapCandidates() {
        try {
            PackageManager pm = getPackageManager();
            List<android.content.pm.ApplicationInfo> apps = pm.getInstalledApplications(0);
            JSONArray arr = new JSONArray();
            for (android.content.pm.ApplicationInfo ai : apps) {
                if (ai == null || ai.packageName == null) { continue; }
                if (getPackageName().equals(ai.packageName)) { continue; }
                String pkg = ai.packageName.toLowerCase(Locale.US);
                String label;
                try {
                    label = String.valueOf(pm.getApplicationLabel(ai));
                } catch (Throwable t) {
                    label = "";
                }
                boolean hit = label.contains("地图") || label.contains("导航") || label.contains("出行")
                        || pkg.contains("map") || pkg.contains("nav")
                        || pkg.contains("baidu") || pkg.contains("amap") || pkg.contains("autonavi");
                if (!hit) { continue; }
                JSONObject o = new JSONObject();
                o.put("label", label);
                o.put("pkg", ai.packageName);
                arr.put(o);
            }
            JSONObject out = new JSONObject();
            out.put("apps", arr);
            callJs("onMapCandidates", out.toString());
        } catch (Throwable t) {
            Log.w(TAG, "list map candidates fail", t);
        }
    }

    /** H5 手动指定地图包名：校验、持久保存并立即打开。 */
    public void onSetMapPackage(String pkg) {
        if (pkg == null || pkg.trim().length() == 0) { return; }
        String p = pkg.trim();
        if (!isInstalled(p)) {
            Toast.makeText(this, "该应用不存在：" + p, Toast.LENGTH_LONG).show();
            return;
        }
        resolvedMapPkg = p;
        try {
            getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(PREF_MAP_PKG, p).apply();
        } catch (Throwable ignored) {
        }
        Toast.makeText(this, "已设为：" + appLabel(p), Toast.LENGTH_SHORT).show();
        launchMap();
    }

    /** 把地图 APP 拉到前台；无启动入口时退回百度地图 URI 协议。 */
    private void launchMap() {
        String pkg = mapPackage();
        if (pkg == null) { return; }
        try {
            Intent i = getPackageManager().getLaunchIntentForPackage(pkg);
            if (i != null) {
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                startActivity(i);
                return;
            }
        } catch (Exception e) {
            Log.w(TAG, "launch map by package fail", e);
        }
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("baidumap://map/show"));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            Log.w(TAG, "launch map by uri fail", e);
        }
    }

    /** 把本 APP 拉回前台。前台服务(RideService)在 Android 11 上允许后台启动 Activity。 */
    private void bringSelfToFront() {
        try {
            Intent i = new Intent(this, MainActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            Log.w(TAG, "bringSelfToFront fail", e);
        }
    }

    // ------------------------------------------------------------ Java -> H5

    private void callJs(final String fn, final String json) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (webView == null) return;
                try {
                    webView.evaluateJavascript("javascript:" + fn + "(" + jsQuote(json) + ");", null);
                } catch (Exception e) {
                    Log.w(TAG, "callJs fail: " + fn, e);
                }
            }
        });
    }

    /** 把 JSON 字符串包成安全的 JS 单引号字符串字面量。 */
    private static String jsQuote(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 8);
        sb.append('\'');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\':
                    sb.append("\\\\");
                    break;
                case '\'':
                    sb.append("\\'");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                default:
                    sb.append(c);
            }
        }
        sb.append('\'');
        return sb.toString();
    }

    @Override
    protected void onDestroy() {
        rotateMode = false;
        rotateHandler.removeCallbacks(rotateRunnable);
        try {
            unregisterReceiver(batteryReceiver);
        } catch (Exception ignored) {
        }
        if (service != null) {
            try {
                service.setUiCallback(null);
            } catch (Exception ignored) {
            }
        }
        if (bound) {
            try {
                unbindService(conn);
            } catch (Exception ignored) {
            }
            bound = false;
        }
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
