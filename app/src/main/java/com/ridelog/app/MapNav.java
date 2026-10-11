package com.ridelog.app;

import java.net.URLEncoder;
import java.util.Locale;

/**
 * 骑行导航工具：WGS84→GCJ02→BD09 坐标转换 + 高德/百度骑行导航 URI 拼装。
 *
 * 不集成地图 SDK、不需要密钥：通过 URI 唤起已安装的高德/百度地图 APP，
 * 未安装时回退到网页版导航（需网络）。
 */
public final class MapNav {

    private MapNav() {
    }

    // ------------------------------------------------------------ 坐标转换

    private static final double PI = Math.PI;
    private static final double A = 6378245.0;
    private static final double EE = 0.00669342162296594323;

    /** WGS84（GPS 原始）→ GCJ02（高德），返回 {lat, lon}。 */
    public static double[] wgs2gcj(double lat, double lon) {
        if (outOfChina(lat, lon)) return new double[]{lat, lon};
        double[] d = delta(lat, lon);
        return new double[]{lat + d[0], lon + d[1]};
    }

    /** GCJ02 → BD09（百度），返回 {lat, lon}。 */
    public static double[] gcj2bd(double lat, double lon) {
        double x = lon, y = lat;
        double z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * PI * 3000.0 / 180.0);
        double t = Math.atan2(y, x) + 0.000003 * Math.cos(x * PI * 3000.0 / 180.0);
        return new double[]{z * Math.sin(t) + 0.006, z * Math.cos(t) + 0.0065};
    }

    private static boolean outOfChina(double lat, double lon) {
        return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
    }

    private static double[] delta(double lat, double lon) {
        double dLat = tLat(lon - 105.0, lat - 35.0);
        double dLon = tLon(lon - 105.0, lat - 35.0);
        double radLat = lat / 180.0 * PI;
        double magic = Math.sin(radLat);
        magic = 1 - EE * magic * magic;
        double sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
        dLon = (dLon * 180.0) / (A / sqrtMagic * Math.cos(radLat) * PI);
        return new double[]{dLat, dLon};
    }

    private static double tLat(double x, double y) {
        double r = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        r += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        r += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
        r += (160.0 * Math.sin(y / 12.0 * PI) + 320.0 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
        return r;
    }

    private static double tLon(double x, double y) {
        double r = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        r += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        r += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
        r += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
        return r;
    }

    // ------------------------------------------------------------ 坐标解析

    /**
     * 解析用户输入坐标，自动识别 "经度,纬度"（高德习惯）或 "纬度,经度" 顺序。
     * 返回 {lat, lon}；无效输入返回 null。
     */
    public static double[] parseCoord(String s) {
        if (s == null) return null;
        s = s.trim().replace("，", ",");
        if (s.length() == 0) return null;
        String[] p = s.split(",");
        if (p.length != 2) return null;
        try {
            double a = Double.parseDouble(p[0].trim());
            double b = Double.parseDouble(p[1].trim());
            if (a >= 70 && a <= 140 && b >= 1 && b <= 60) return new double[]{b, a}; // 经度,纬度
            if (b >= 70 && b <= 140 && a >= 1 && a <= 60) return new double[]{a, b}; // 纬度,经度
            return new double[]{b, a}; // 缺省按 经度,纬度
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // ------------------------------------------------------------ URI 拼装

    private static String enc(String s) {
        try {
            return URLEncoder.encode(s, "UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    private static String n6(double v) {
        return String.format(Locale.US, "%.6f", v);
    }

    private static String latLon(double[] c) {
        return n6(c[0]) + "," + n6(c[1]);
    }

    /** 高德 APP 路线规划（目的地为名称，骑行 t=3）。 */
    public static String amapAppUri(String name, double[] fromGcj) {
        StringBuilder sb = new StringBuilder("androidamap://route?sourceApplication=rideLog");
        if (fromGcj != null) {
            sb.append("&sname=").append(enc("我的位置"))
              .append("&slat=").append(n6(fromGcj[0]))
              .append("&slon=").append(n6(fromGcj[1]));
        }
        sb.append("&dname=").append(enc(name)).append("&dev=0&m=0&t=3");
        return sb.toString();
    }

    /** 高德网页导航（callnative=1，已装 APP 时自动唤起），目的地为 GCJ02 坐标。 */
    public static String amapWebUri(String name, double[] destGcj, double[] fromGcj) {
        StringBuilder sb = new StringBuilder("https://uri.amap.com/navigation?");
        if (fromGcj != null) {
            sb.append("from=").append(n6(fromGcj[1])).append(",").append(n6(fromGcj[0]))
              .append(",").append(enc("我的位置")).append("&");
        }
        sb.append("to=").append(n6(destGcj[1])).append(",").append(n6(destGcj[0]))
          .append(",").append(enc(name));
        sb.append("&via=&mode=ride&policy=&src=rideLog&coordinate=gaode&callnative=1");
        return sb.toString();
    }

    /** 高德网页搜索兜底（目的地为名称且未装 APP）。 */
    public static String amapSearchUri(String name) {
        return "https://m.amap.com/search/view/keywords=" + enc(name);
    }

    /** 百度 APP 骑行路线（坐标转 BD09）。 */
    public static String baiduAppUri(String name, double[] destGcj, double[] fromGcj) {
        StringBuilder sb = new StringBuilder("baidumap://map/direction?");
        if (fromGcj != null) {
            double[] o = gcj2bd(fromGcj[0], fromGcj[1]);
            sb.append("origin=").append(latLon(o)).append(":").append(enc("我的位置")).append("&");
        }
        if (destGcj != null) {
            double[] d = gcj2bd(destGcj[0], destGcj[1]);
            sb.append("destination=").append(latLon(d)).append(":").append(enc(name));
        } else {
            sb.append("destination=").append(enc(name));
        }
        sb.append("&mode=riding&coord_type=bd09ll&src=rideLog");
        return sb.toString();
    }

    /** 百度网页路线兜底（GCJ02 输入，声明 coord_type）。 */
    public static String baiduWebUri(String name, double[] destGcj, double[] fromGcj) {
        StringBuilder sb = new StringBuilder("https://api.map.baidu.com/direction?");
        if (fromGcj != null) {
            sb.append("origin=").append(latLon(fromGcj)).append(":").append(enc("我的位置")).append("&");
        }
        if (destGcj != null) {
            sb.append("destination=").append(latLon(destGcj)).append(":").append(enc(name));
        } else {
            sb.append("destination=").append(enc(name));
        }
        sb.append("&mode=riding");
        if (fromGcj != null || destGcj != null) {
            sb.append("&coord_type=gcj02");
        }
        sb.append("&region=&output=html&src=rideLog");
        return sb.toString();
    }
}
