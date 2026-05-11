import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import RmbConverter from '@/views/RmbConverter.vue'
import M3u8Player from '@/views/M3u8Player.vue'
import WorldClock from '@/views/WorldClock.vue'
import Base64Tool from '@/views/Base64Tool.vue'
import ColorConverter from '@/views/ColorConverter.vue'
import QrGenerator from '@/views/QrGenerator.vue'
import CoordinateConverter from '@/views/CoordinateConverter.vue'
import Md5Tool from '@/views/Md5Tool.vue'
import CryptoTool from '@/views/CryptoTool.vue'
import CrcTool from '@/views/CrcTool.vue'
import CronGenerator from '@/views/CronGenerator.vue'
import UnicodeTool from '@/views/UnicodeTool.vue'
import DateDiffCalc from '@/views/DateDiffCalc.vue'
import JsonParser from '@/views/JsonParser.vue'
import RsaGenerator from '@/views/RsaGenerator.vue'
import FormatConverter from '@/views/FormatConverter.vue'
import ImageWatermark from '@/views/ImageWatermark.vue'
import PdfMerger from '@/views/PdfMerger.vue'
import PdfWatermark from '@/views/PdfWatermark.vue'
import PdfCompressor from '@/views/PdfCompressor.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/rmb-converter',
    name: 'RmbConverter',
    component: RmbConverter,
    meta: { title: '人民币大小写转换' },
  },
  {
    path: '/m3u8-player',
    name: 'M3u8Player',
    component: M3u8Player,
    meta: { title: 'M3U8 在线播放器' },
  },
  {
    path: '/world-clock',
    name: 'WorldClock',
    component: WorldClock,
    meta: { title: '世界时钟' },
  },
  {
    path: '/base64',
    name: 'Base64',
    component: Base64Tool,
    meta: { title: 'Base64 编解码' },
  },
  {
    path: '/color-converter',
    name: 'ColorConverter',
    component: ColorConverter,
    meta: { title: '颜色值转换' },
  },
  {
    path: '/qr-generator',
    name: 'QrGenerator',
    component: QrGenerator,
    meta: { title: '二维码生成' },
  },
  {
    path: '/coord-converter',
    name: 'CoordinateConverter',
    component: CoordinateConverter,
    meta: { title: '坐标转换' },
  },
  {
    path: '/md5',
    name: 'Md5',
    component: Md5Tool,
    meta: { title: 'MD5 加密' },
  },
  {
    path: '/crypto',
    name: 'CryptoTool',
    component: CryptoTool,
    meta: { title: '加解密工具' },
  },
  {
    path: '/crc',
    name: 'CrcTool',
    component: CrcTool,
    meta: { title: 'CRC 校验' },
  },
  {
    path: '/cron-generator',
    name: 'CronGenerator',
    component: CronGenerator,
    meta: { title: 'Cron 定时任务' },
  },
  {
    path: '/unicode',
    name: 'UnicodeTool',
    component: UnicodeTool,
    meta: { title: 'Unicode 文本转换' },
  },
  {
    path: '/date-diff',
    name: 'DateDiffCalc',
    component: DateDiffCalc,
    meta: { title: '时间差计算器' },
  },
  {
    path: '/json-parser',
    name: 'JsonParser',
    component: JsonParser,
    meta: { title: 'JSON 解析器' },
  },
  {
    path: '/rsa-generator',
    name: 'RsaGenerator',
    component: RsaGenerator,
    meta: { title: 'RSA 密钥对生成' },
  },
  {
    path: '/format-converter',
    name: 'FormatConverter',
    component: FormatConverter,
    meta: { title: '格式转换器' },
  },
  {
    path: '/image-watermark',
    name: 'ImageWatermark',
    component: ImageWatermark,
    meta: { title: '图片水印' },
  },
  {
    path: '/pdf-merger',
    name: 'PdfMerger',
    component: PdfMerger,
    meta: { title: 'PDF 合并' },
  },
  {
    path: '/pdf-watermark',
    name: 'PdfWatermark',
    component: PdfWatermark,
    meta: { title: 'PDF 水印' },
  },
  {
    path: '/pdf-compressor',
    name: 'PdfCompressor',
    component: PdfCompressor,
    meta: { title: 'PDF 压缩' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
