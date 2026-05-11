/**
 * 坐标系转换工具
 *
 * 支持三种坐标系互转：
 * - WGS84: 国际标准 GPS 坐标系（Google Earth、iOS 原生地图等）
 * - GCJ02: 火星坐标系，中国国测局加密偏移（高德、腾讯、Google 中国）
 * - BD09: 百度坐标系，在 GCJ02 基础上二次加密偏移
 */

const PI = Math.PI
const X_PI = (PI * 3000.0) / 180.0
const A = 6378245.0
const EE = 0.00669342162296594323

export type CoordSystem = 'wgs84' | 'gcj02' | 'bd09'

export interface CoordPoint {
  lat: number
  lng: number
}

function outOfChina(lat: number, lng: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320.0 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0
  return ret
}

function transformLon(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0
  return ret
}

/** WGS84 → GCJ02 */
function wgs84ToGcj02(wgsLat: number, wgsLng: number): CoordPoint {
  if (outOfChina(wgsLat, wgsLng)) return { lat: wgsLat, lng: wgsLng }
  const dLat = transformLat(wgsLng - 105.0, wgsLat - 35.0)
  const dLon = transformLon(wgsLng - 105.0, wgsLat - 35.0)
  const radLat = (wgsLat / 180.0) * PI
  let magic = Math.sin(radLat)
  magic = 1 - EE * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  const mgLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI)
  const mgLng = (dLon * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI)
  return { lat: wgsLat + mgLat, lng: wgsLng + mgLng }
}

/** GCJ02 → WGS84（迭代逼近法提高精度） */
function gcj02ToWgs84(gcjLat: number, gcjLng: number): CoordPoint {
  if (outOfChina(gcjLat, gcjLng)) return { lat: gcjLat, lng: gcjLng }
  let lat = gcjLat
  let lng = gcjLng
  // 迭代逼近，减小误差
  for (let i = 0; i < 5; i++) {
    const d = wgs84ToGcj02(lat, lng)
    lat -= d.lat - gcjLat
    lng -= d.lng - gcjLng
  }
  return { lat, lng }
}

/** GCJ02 → BD09 */
function gcj02ToBd09(gcjLat: number, gcjLng: number): CoordPoint {
  const z = Math.sqrt(gcjLng * gcjLng + gcjLat * gcjLat) + 0.00002 * Math.sin(gcjLat * X_PI)
  const theta = Math.atan2(gcjLat, gcjLng) + 0.000003 * Math.cos(gcjLng * X_PI)
  return {
    lat: z * Math.sin(theta) + 0.006,
    lng: z * Math.cos(theta) + 0.0065,
  }
}

/** BD09 → GCJ02 */
function bd09ToGcj02(bdLat: number, bdLng: number): CoordPoint {
  const x = bdLng - 0.0065
  const y = bdLat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI)
  return {
    lat: z * Math.sin(theta),
    lng: z * Math.cos(theta),
  }
}

// ============ 公开 API ============

export interface CoordResult {
  wgs84: CoordPoint
  gcj02: CoordPoint
  bd09: CoordPoint
}

function round(p: CoordPoint): CoordPoint {
  return { lat: round6(p.lat), lng: round6(p.lng) }
}

function round6(v: number): number {
  return Math.round(v * 1_000_000) / 1_000_000
}

/** 从指定系统转换到所有系统 */
export function convert(input: CoordPoint, from: CoordSystem): CoordResult {
  // 先统一转为 GCJ02（枢纽坐标系）
  let gcj: CoordPoint
  switch (from) {
    case 'wgs84':
      gcj = wgs84ToGcj02(input.lat, input.lng)
      break
    case 'gcj02':
      gcj = { lat: input.lat, lng: input.lng }
      break
    case 'bd09':
      gcj = bd09ToGcj02(input.lat, input.lng)
      break
  }

  const wgs84 = gcj02ToWgs84(gcj.lat, gcj.lng)
  const bd09 = gcj02ToBd09(gcj.lat, gcj.lng)

  return {
    wgs84: round(wgs84),
    gcj02: round(gcj),
    bd09: round(bd09),
  }
}

/** 校验纬度值 */
export function isValidLat(v: number): boolean {
  return v >= -90 && v <= 90
}

/** 校验经度值 */
export function isValidLng(v: number): boolean {
  return v >= -180 && v <= 180
}

/** 坐标系简称映射 */
export const SYSTEM_LABELS: Record<CoordSystem, string> = {
  wgs84: 'WGS84',
  gcj02: 'GCJ-02',
  bd09: 'BD-09',
}

/** 坐标系全称 */
export const SYSTEM_NAMES: Record<CoordSystem, string> = {
  wgs84: 'WGS84（国际标准 GPS）',
  gcj02: 'GCJ-02 火星坐标系（高德/腾讯/Google 中国）',
  bd09: 'BD-09 百度坐标系',
}
