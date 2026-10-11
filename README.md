# 骑行导航（OPPO Watch 3 Pro 手表版）

> 本仓库为**手表版**。手机版（三区布局 + 高德地图导航）见 https://github.com/mlinuxs/gps-mb

通过 **BLE 蓝牙电池保护板** 读取电压/电流/电量/压差，通过 **手表 GPS** 记录位置、速度、里程，
数据实时显示在单屏仪表盘（WebView + H5），并持续写入 **CSV 日志**（手表 Download 目录）。

- 目标设备：**OPPO Watch 3 Pro（378×496 物理 / 约 189×248 CSS 视口，Android 11 / ColorOS Watch）**
- 技术架构：**Java 原生 + WebView 套壳（H5 纯 ES5，无前端框架，离线运行）**
- 构建环境：**Gradle 5.6.4 + AGP 3.6.4 + JDK8**，零第三方依赖，`gradlew assembleDebug` 直接出 APK
- `targetSdkVersion 23`（消除 Android 9+「此应用专为旧版 Android 打造」弹窗），`compileSdkVersion 21`，
  Android 6.0+ 运行时权限通过**反射**申请（compileSdk 21 无该 API）

---

## 一、界面布局（单屏免滚动，整体等比缩放）

以 190px 设计宽度绘制，JS `fitScreen()` 按 `innerWidth / 190` 整体 transform 缩放铺满全屏，
任意分辨率不重叠、不变形。

```
┌──────────────────────────────┐
│ 蓝牙状态 GPS状态 ⌁手表电量% ●记录 │  ← 顶栏（绿=正常 黄=警告 红=错误）
├──────────────────────────────┤
│   12.3  │   87%              │  ← Hero：瞬时速度(蓝,44px) │竖线│ 剩余电量(绿,44px)
├──────────────┬───────────────┤
│  里程  12.5km │  电压  54.32V  │
│  均速  21.3km/h│ 电流  -8.42A  │  ← 左右双栏 6 卡片（17px 数值）
│  时长  01:23  │  压差  0.012V  │
├──────────────┴───────────────┤
│ [开始/停止] [暂停] [蓝牙]      │  ← 两行三列按钮
│ [百度地图] [轮换] [常亮]       │
└──────────────────────────────┘
```

## 二、功能一览

| 模块 | 功能 |
|---|---|
| BLE 蓝牙 | 启动即自动搜索连接 LABMS 系列保护板（断线重连、失败回扫）；也可弹窗列表选择或手动输 MAC；Modbus-RTU 协议解析电压/电流/电量/温度/压差 |
| GPS 定位 | 启动即自动记录；Haversine 累加里程；停车过滤（<2km/h 持续 30s 判停，离开 20m 或连续 3 点 ≥4km/h 恢复）；平均速度=里程÷有效骑行时长（剔除停车/暂停） |
| 地图轮换 | 点【轮换】后每 10 秒在「本 APP 数据屏」与「地图 APP」之间自动切换；前台服务支撑 Android 11 后台拉起 Activity；再点一次停止轮换 |
| 地图调起 | 【百度地图】按钮调起地图 APP 骑行导航（`baidumap://map/direction?...&mode=riding`）；**四级匹配链**：本次缓存 → 手动选择（持久保存）→ 已知包名清单 → 按应用名/包名打分自动识别；已知包名清单（手表版优先）：<br>`com.baidu.BaiduMap.watch`、`com.autonavi.minimap.watch`、`com.baidu.BaiduMap`、`com.autonavi.minimap` |
| 手表电量 | 监听 `ACTION_BATTERY_CHANGED` 粘性广播，顶栏实时显示手表自身电量百分比 |
| 前台服务 | 启动即进入前台采集，通知栏常驻「骑行记录中」，PARTIAL_WAKE_LOCK 保持 CPU |
| 屏幕常亮 | H5 开关控制 `FLAG_KEEP_SCREEN_ON` |
| CSV 记录 | 1 秒 1 行（静止时段自动降频 30 秒 1 条并标注状态），UTF-8 带 BOM（Excel 直接打开），保存到 `Download/RideLog_yyyyMMdd_HHmmss.csv` |
| 暂停记录 | GPS 保持定位，暂停计时/里程/CSV 写入；继续后无缝接续，暂停期漂移不计入 |
| JS Bridge | H5→Java：`startRecord / stopRecord / pauseRecord / resumeRecord / setScreenKeepOn / startBleScan / stopBleScan / connectBle / disconnectBle / openBaiduMap / requestMapCandidates / setMapPackage / setRotateMode`；Java→H5：`onDataUpdate / onStatusUpdate / onBleDevices / onWatchBattery / onMapCandidates`，1Hz 节流推送 |

## 三、工程目录

```
Gps-mb/
├── build.gradle / settings.gradle / gradle.properties
├── gradlew / gradlew.bat / gradle/wrapper/...
└── app/
    ├── build.gradle             # minSdk 21 / targetSdk 23 / compileSdk 21，Java 8
    └── src/main/
        ├── AndroidManifest.xml  # 权限 + Activity + 前台服务
        ├── assets/index.html    # H5 单屏仪表盘（ES5，全部内联，等比缩放）
        ├── res/                 # 图标、主题
        └── java/com/ridelog/app/
            ├── MainActivity.java    # WebView、JS桥、运行时权限、手表电量、10秒轮换、地图调起
            ├── JsBridge.java        # H5->Java @JavascriptInterface
            ├── RideService.java     # 前台服务、1Hz 聚合、通知、WakeLock
            ├── ble/BleManager.java  # BLE 扫描/连接/重连/GATT 订阅/Modbus 轮询
            ├── ble/BmsParser.java   # 二进制协议解析（粘包/断帧/校验）
            ├── ble/BmsData.java
            ├── ble/LianModbus.java  # Modbus-RTU 帧构造（CRC-16/XMODEM）
            ├── gps/GpsManager.java  # 定位/里程/停车过滤/滤波
            ├── gps/GpsData.java
            └── storage/CsvLogger.java
```

## 四、编译步骤

1. 安装 **JDK 8**，设置 `JAVA_HOME`。
2. Android SDK 命令行工具安装平台与构建工具：
   ```
   sdkmanager "platforms;android-21" "build-tools;28.0.3"
   ```
3. 项目根目录新建 `local.properties`：
   ```
   sdk.dir=D:/Android/Sdk
   ```
4. 根目录执行 `gradlew.bat assembleDebug`，产物在 `app/build/outputs/apk/debug/app-debug.apk`。

> 本工程未使用 AndroidX 与任何第三方库，全部为 Android 系统 API。

## 五、手表安装与使用

1. `adb install app-debug.apk`（或手表端文件管理器安装，允许未知来源）。
2. 打开 APP → 自动开始 GPS 记录 + 自动搜索连接 LABMS 保护板（顶栏绿点即正常）。
3. 导航：先打开手表的**百度地图**开始骑行导航 → 切回本 APP → 点【轮换】，此后每 10 秒自动在导航/数据屏之间切换；点【百度地图】可手动调起。
4. 找不到地图 APP 时：【百度地图】按钮**长按 700ms** 打开选择器，手动选择一次后持久记住。
5. 点【停止】结束记录，CSV 保存在手表 Download 目录。

## 六、电池保护板 BLE 协议适配

本机（锂安/LABMS）保护板为 **Modbus-RTU over BLE（0x03 读保持寄存器）**，非主动上报帧。
连接 `00002760-...-1001` 服务后，由 App 周期发送读寄存器请求，把通知响应帧解析成仪表盘数据。

- 写入特征 `...-0001`（WRITE_NO_RESPONSE），通知特征 `...-0002`，连接后协商 **MTU=185**
- 帧结构：`[从机=22][0x03][起始Hi][起始Lo][数量Hi][数量Lo][CRC低][CRC高]`
- CRC：CRC-16/XMODEM（初值 0x0000，poly 0x1021，高位在前，低字节在前追加），见 [LianModbus.java](app/src/main/java/com/ridelog/app/ble/LianModbus.java)
- 轮询顺序：寄存器 0-7（电压 u32 mV / 电流 i32 mA / 温度 0.1K）→ 20-24（SOC/电芯串数）→ 32 起按串数读单体电压，见 [BleManager.java](app/src/main/java/com/ridelog/app/ble/BleManager.java)

若你的保护板寄存器表不同，只需调整 `LianModbus` 解码常量与 `BleManager` 的读块起始地址/映射。

## 七、常见问题

| 现象 | 处理 |
|---|---|
| GPS 一直「无信号」 | 到露天环境等待 30 秒~2 分钟；确认手表「位置信息」已打开 |
| 搜不到蓝牙设备 | 打开手表蓝牙；确认保护板已通电；App 只连接 LABMS 系列设备 |
| 调不起百度地图 | 手表未装百度地图，或包名不同 → 长按【百度地图】手动选择 |
| 轮换后回不来 | 保持本 APP 通知常驻（前台服务）；部分系统限制下用最近任务切回 |
| 电流显示负数 | 充/放电方向由保护板固件定义，数值符号按原始数据透传 |
| CSV 在哪里 | 手表存储 `Download` 目录，UTF-8 带 BOM，Excel 直接打开 |
