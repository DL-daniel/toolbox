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
import PhoneLookup from '@/views/PhoneLookup.vue'
import EmergencyPhones from '@/views/EmergencyPhones.vue'
import AreaCodeLookup from '@/views/AreaCodeLookup.vue'
import IdCardLookup from '@/views/IdCardLookup.vue'
import ReactionTest from '@/views/ReactionTest.vue'
import BmiCalculator from '@/views/BmiCalculator.vue'
import BarcodeGenerator from '@/views/BarcodeGenerator.vue'
import TimestampConverter from '@/views/TimestampConverter.vue'
import WebSocketTester from '@/views/WebSocketTester.vue'
import PasswordGenerator from '@/views/PasswordGenerator.vue'
import RandomNumberGenerator from '@/views/RandomNumberGenerator.vue'
import WubiTool from '@/views/WubiTool.vue'
import RegexTester from '@/views/RegexTester.vue'
import ChineseAlmanac from '@/views/ChineseAlmanac.vue'
import LunarConverter from '@/views/LunarConverter.vue'
import WeightConverter from '@/views/WeightConverter.vue'
import VolumeConverter from '@/views/VolumeConverter.vue'
import DensityConverter from '@/views/DensityConverter.vue'
import TemperatureConverter from '@/views/TemperatureConverter.vue'
import PressureConverter from '@/views/PressureConverter.vue'
import LengthConverter from '@/views/LengthConverter.vue'
import AreaConverter from '@/views/AreaConverter.vue'
import CurrencyConverter from '@/views/CurrencyConverter.vue'
import TextToImage from '@/views/TextToImage.vue'

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
    meta: { title: '人民币大小写转换', description: '阿拉伯数字金额转换为中文大写金额，支持财务票据专用格式，实时转换' },
  },
  {
    path: '/m3u8-player',
    name: 'M3u8Player',
    component: M3u8Player,
    meta: { title: 'M3U8 在线播放器', description: '在线播放 M3U8/HLS 视频流和直播，支持自适应码率，无需安装插件' },
  },
  {
    path: '/world-clock',
    name: 'WorldClock',
    component: WorldClock,
    meta: { title: '世界时钟', description: '全球70+城市时间同时查看，支持按大洲分组搜索，实时与手动模式切换' },
  },
  {
    path: '/base64',
    name: 'Base64',
    component: Base64Tool,
    meta: { title: 'Base64 编解码', description: '在线 Base64 编码解码工具，支持文本和文件上传，UTF-8 解码' },
  },
  {
    path: '/color-converter',
    name: 'ColorConverter',
    component: ColorConverter,
    meta: { title: '颜色值转换', description: 'HEX/RGB/RGBA/HSL 颜色格式在线互转，内置取色器，实时预览' },
  },
  {
    path: '/qr-generator',
    name: 'QrGenerator',
    component: QrGenerator,
    meta: { title: '二维码生成', description: '在线二维码生成器，支持文本和网址生成二维码，PNG/SVG 格式下载' },
  },
  {
    path: '/coord-converter',
    name: 'CoordinateConverter',
    component: CoordinateConverter,
    meta: { title: '坐标转换', description: 'WGS84/GCJ02/BD09 坐标系在线互转，支持批量转换和坐标拾取链接' },
  },
  {
    path: '/md5',
    name: 'Md5',
    component: Md5Tool,
    meta: { title: 'MD5 加密', description: '在线 MD5 哈希计算器，支持 32位/16位 大小写输出，含密码字典反向查询' },
  },
  {
    path: '/crypto',
    name: 'CryptoTool',
    component: CryptoTool,
    meta: { title: '加解密工具', description: 'AES/TripleDES/Rabbit/RC4 在线加解密工具，浏览器本地处理，安全可靠' },
  },
  {
    path: '/crc',
    name: 'CrcTool',
    component: CrcTool,
    meta: { title: 'CRC 校验', description: '支持13种 CRC 算法在线计算（CRC-1至CRC-32），文本和十六进制输入' },
  },
  {
    path: '/cron-generator',
    name: 'CronGenerator',
    component: CronGenerator,
    meta: { title: 'Cron 定时任务', description: 'Cron 表达式在线生成器，12种常用预设，支持自定义配置和实时描述' },
  },
  {
    path: '/unicode',
    name: 'UnicodeTool',
    component: UnicodeTool,
    meta: { title: 'Unicode 文本转换', description: 'Unicode 编码转换、文本统计分析、全角半角互转、码点查看一站式工具' },
  },
  {
    path: '/date-diff',
    name: 'DateDiffCalc',
    component: DateDiffCalc,
    meta: { title: '时间差计算器', description: '在线日期计算器，支持日期差值和日期推算，自动处理闰年' },
  },
  {
    path: '/json-parser',
    name: 'JsonParser',
    component: JsonParser,
    meta: { title: 'JSON 解析器', description: 'JSON 格式化压缩在线工具，语法错误检测，支持树形视图浏览' },
  },
  {
    path: '/rsa-generator',
    name: 'RsaGenerator',
    component: RsaGenerator,
    meta: { title: 'RSA 密钥对生成', description: '在线 RSA 密钥生成器，支持1024/2048/4096位，PKCS格式输出，浏览器本地生成' },
  },
  {
    path: '/format-converter',
    name: 'FormatConverter',
    component: FormatConverter,
    meta: { title: '格式转换器', description: 'JSON/YAML/TOML 在线互转工具，自动检测输入格式，一键格式切换' },
  },
  {
    path: '/image-watermark',
    name: 'ImageWatermark',
    component: ImageWatermark,
    meta: { title: '图片水印', description: '在线图片水印工具，支持文字和图片水印，自定义位置大小透明度' },
  },
  {
    path: '/pdf-merger',
    name: 'PdfMerger',
    component: PdfMerger,
    meta: { title: 'PDF 合并', description: '在线 PDF 合并工具，支持最多20个文件，拖拽排序，保持原始格式' },
  },
  {
    path: '/pdf-watermark',
    name: 'PdfWatermark',
    component: PdfWatermark,
    meta: { title: 'PDF 水印', description: '在线 PDF 添加水印工具，支持文字和图片水印，自定义位置和透明度' },
  },
  {
    path: '/pdf-compressor',
    name: 'PdfCompressor',
    component: PdfCompressor,
    meta: { title: 'PDF 压缩', description: '在线 PDF 压缩工具，支持智能压缩和OCR压缩模式，实时大小对比' },
  },
  {
    path: '/phone-lookup',
    name: 'PhoneLookup',
    component: PhoneLookup,
    meta: { title: '手机号码归属地查询', description: '手机号码归属地在线查询，支持移动联通电信广电虚拟运营商，显示省份城市和运营商' },
  },
  {
    path: '/emergency-phones',
    name: 'EmergencyPhones',
    component: EmergencyPhones,
    meta: { title: '常用电话列表', description: '报警急救银行航空公司等常用联系电话大全，分类查看便于快速查找' },
  },
  {
    path: '/area-code',
    name: 'AreaCodeLookup',
    component: AreaCodeLookup,
    meta: { title: '区号邮编查询', description: '全国城市区号和邮政编码在线查询，支持按城市名称搜索' },
  },
  {
    path: '/id-card',
    name: 'IdCardLookup',
    component: IdCardLookup,
    meta: { title: '身份证所在地查询', description: '身份证号码解析，查询发证地区、出生日期、性别，支持18位和15位身份证' },
  },
  {
    path: '/reaction-test',
    name: 'ReactionTest',
    component: ReactionTest,
    meta: { title: '反应速度测试', description: '在线反应速度测试工具，测试点击反应时间，5轮测试取平均值' },
  },
  {
    path: '/bmi-calculator',
    name: 'BmiCalculator',
    component: BmiCalculator,
    meta: { title: 'BMI 体质指数计算', description: 'BMI 体质指数在线计算器，支持公制和英制单位，计算结果分类显示' },
  },
  {
    path: '/barcode-generator',
    name: 'BarcodeGenerator',
    component: BarcodeGenerator,
    meta: { title: '条形码生成器', description: '在线条形码生成器，支持 Code128/Code39/EAN-13/UPC 格式，SVG 下载' },
  },
  {
    path: '/timestamp-converter',
    name: 'TimestampConverter',
    component: TimestampConverter,
    meta: { title: '时间戳转换工具', description: 'Unix 时间戳与日期时间互转，支持秒级和毫秒级时间戳，一键获取当前时间戳' },
  },
  {
    path: '/websocket-tester',
    name: 'WebSocketTester',
    component: WebSocketTester,
    meta: { title: 'WebSocket 测试工具', description: '在线 WebSocket 连接测试工具，支持自定义地址连接，实时发送接收消息' },
  },
  {
    path: '/password-generator',
    name: 'PasswordGenerator',
    component: PasswordGenerator,
    meta: { title: '随机密码生成', description: '随机密码在线生成器，可自定义长度和字符类型，密码强度实时评估' },
  },
  {
    path: '/random-number',
    name: 'RandomNumberGenerator',
    component: RandomNumberGenerator,
    meta: { title: '随机数生成器', description: '在线随机数生成器，设置范围和数量，支持不重复和排序输出' },
  },
  {
    path: '/wubi-tool',
    name: 'WubiTool',
    component: WubiTool,
    meta: { title: '五笔学习工具', description: '五笔字型编码查询，支持汉字查编码和编码查汉字，含常用字五笔拆解说明' },
  },
  {
    path: '/regex-tester',
    name: 'RegexTester',
    component: RegexTester,
    meta: { title: '正则表达式测试', description: '在线正则表达式测试工具，实时匹配与替换，支持多行和全局标记' },
  },
  {
    path: '/chinese-almanac',
    name: 'ChineseAlmanac',
    component: ChineseAlmanac,
    meta: { title: '老黄历查询', description: '每日老黄历在线查询，查看宜忌事项、干支纪年、生肖等信息' },
  },
  {
    path: '/lunar-converter',
    name: 'LunarConverter',
    component: LunarConverter,
    meta: { title: '农历公历查询', description: '公历农历日期互转查询，显示干支纪年和生肖属相' },
  },
  {
    path: '/weight-converter',
    name: 'WeightConverter',
    component: WeightConverter,
    meta: { title: '重量单位换算', description: '千克克毫克吨磅盎司斤两克拉等重量单位在线换算' },
  },
  {
    path: '/volume-converter',
    name: 'VolumeConverter',
    component: VolumeConverter,
    meta: { title: '体积单位换算', description: '升毫升立方米加仑夸脱品脱杯液体盎司等体积单位在线换算' },
  },
  {
    path: '/density-converter',
    name: 'DensityConverter',
    component: DensityConverter,
    meta: { title: '密度单位换算', description: 'kg/m³ g/cm³ g/L lb/ft³ kg/L 等密度单位在线换算' },
  },
  {
    path: '/temperature-converter',
    name: 'TemperatureConverter',
    component: TemperatureConverter,
    meta: { title: '温度单位换算', description: '摄氏度华氏度开尔文列氏度等温度单位在线换算' },
  },
  {
    path: '/pressure-converter',
    name: 'PressureConverter',
    component: PressureConverter,
    meta: { title: '压力单位换算', description: '帕斯卡千帕兆帕巴标准大气压psi毫米汞柱等压力单位在线换算' },
  },
  {
    path: '/length-converter',
    name: 'LengthConverter',
    component: LengthConverter,
    meta: { title: '长度单位换算', description: '米千米厘米毫米微米纳米英里码英尺英寸海里里等长度单位在线换算' },
  },
  {
    path: '/area-converter',
    name: 'AreaConverter',
    component: AreaConverter,
    meta: { title: '面积单位换算', description: '平方米平方公里公顷英亩平方英尺亩等面积单位在线换算' },
  },
  {
    path: '/currency-converter',
    name: 'CurrencyConverter',
    component: CurrencyConverter,
    meta: { title: '汇率换算', description: '全球货币实时汇率换算，支持美元欧元人民币日元英镑等30+种货币，自动获取最新汇率' },
  },
  {
    path: '/text-to-image',
    name: 'TextToImage',
    component: TextToImage,
    meta: { title: '文字转图片', description: '将文本转换为图片，支持自定义字体、颜色、尺寸、背景，一键下载PNG，适用于社交媒体配图制作' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
