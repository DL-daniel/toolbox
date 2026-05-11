import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import en from './locales/en'

type Messages = typeof zhCN

// 后续新增语言只需在这里添加导入和注册
const messages: Record<string, Messages> = {
  'zh-CN': zhCN,
  'en': en,
}

// 检测浏览器语言偏好
function getBrowserLocale(): string {
  const langs = navigator.languages || [navigator.language]
  for (const lang of langs) {
    if (lang.startsWith('zh')) return 'zh-CN'
    if (lang.startsWith('en')) return 'en'
  }
  return 'zh-CN'
}

// 从 localStorage 读取用户上次选择的语言，否则自动检测
const savedLang = localStorage.getItem('toolbox-lang')
const defaultLocale = savedLang || getBrowserLocale()

const i18n = createI18n({
  legacy: false,         // 使用 Composition API 模式
  locale: defaultLocale, // 当前语言
  fallbackLocale: 'en',  // 兜底语言
  messages,
  globalInjection: true, // 允许在模板中直接使用 $t()
})

export default i18n
