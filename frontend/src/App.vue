<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { watch } from 'vue'

interface RouteMeta {
  title?: string
  description?: string
  schema?: string
  category?: string
}

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

const SITE_URL = 'https://toolbox.mzxy.top'
const DEFAULT_DESC_ZH = '慕泽工具箱 - 在线实用工具箱，提供Base64编码、CRC校验、坐标转换、二维码生成、PDF处理、汇率换算、正则测试、单位换算等44+免费在线工具'
const DEFAULT_DESC_EN = 'Muze Toolbox - Free online tools including Base64, CRC, coordinate conversion, QR code, PDF processing, currency converter, regex tester, unit converter and 40+ more'

function updateMeta() {
  const siteName = t('nav.title')
  const meta = (route.meta || {}) as RouteMeta
  const pageTitle = meta.title
  const title = pageTitle ? siteName + ' - ' + pageTitle : siteName
  document.title = title

  const isZh = locale.value.startsWith('zh')
  const defaultDesc = isZh ? DEFAULT_DESC_ZH : DEFAULT_DESC_EN
  const pageDesc = meta.description || defaultDesc

  // --- meta description ---
  setOrUpdateMeta('description', pageDesc)

  // --- keywords (zh only) ---
  setOrUpdateMeta('keywords', isZh
    ? '在线工具箱, 慕泽工具箱, 免费工具, ' + (pageTitle || 'Base64, CRC, 二维码, 坐标转换, PDF, 汇率, 正则')
    : 'online tools, toolbox, free tools, Base64, CRC, QR code, PDF, regex, currency converter')

  // --- Open Graph ---
  setOrUpdateMeta('og:title', title, 'property')
  setOrUpdateMeta('og:description', pageDesc, 'property')
  setOrUpdateMeta('og:type', 'website', 'property')
  setOrUpdateMeta('og:url', SITE_URL + route.path, 'property')
  setOrUpdateMeta('og:site_name', siteName, 'property')
  setOrUpdateMeta('og:locale', isZh ? 'zh_CN' : 'en_US', 'property')

  // --- Twitter Card ---
  setOrUpdateMeta('twitter:card', 'summary')
  setOrUpdateMeta('twitter:title', title)
  setOrUpdateMeta('twitter:description', pageDesc)

  // --- Canonical ---
  setOrUpdateLink('canonical', SITE_URL + route.path)

  // --- JSON-LD structured data ---
  updateStructuredData(title, pageDesc, route.path, meta)
}

function setOrUpdateMeta(name: string, content: string, attr: string = 'name') {
  const sel = attr === 'property' ? `meta[property="${name}"]` : `meta[${attr}="${name}"]`
  let el = document.querySelector(sel) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOrUpdateLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function updateStructuredData(title: string, desc: string, path: string, meta: RouteMeta) {
  let script = document.getElementById('ld-schema') as HTMLScriptElement | null

  // Build BreadcrumbList
  const pathParts = path === '/' ? [] : path.split('/').filter(Boolean)
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: t('nav.title'), item: SITE_URL + '/' },
  ]
  if (pathParts.length > 0) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: meta.title || pathParts[pathParts.length - 1],
      item: SITE_URL + path,
    })
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': SITE_URL + path + '#webapp',
        name: title,
        url: SITE_URL + path,
        description: desc,
        applicationCategory: meta.schema || 'UtilityApplication',
        operatingSystem: 'All',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
        inLanguage: locale.value.startsWith('zh') ? 'zh-CN' : 'en',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': SITE_URL + path + '#breadcrumb',
        itemListElement: breadcrumbItems,
      },
    ],
  }

  if (!script) {
    script = document.createElement('script')
    script.id = 'ld-schema'
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(schema)
}

watch(locale, updateMeta)
watch(() => route.path, updateMeta, { immediate: true })
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-inner">
        <div class="logo" @click="router.push('/')">
          <span class="logo-icon">🧰</span>
          <span class="logo-text">{{ t('nav.title') }}</span>
        </div>
        <nav class="nav-links" aria-label="Main navigation">
          <button class="nav-btn" @click="router.push('/')">{{ t('nav.home') }}</button>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
    <main class="app-main" role="main">
      <router-view />
    </main>
    <footer class="app-footer">
      <div class="footer-inner">
        <span>&copy; 2026 {{ t('nav.title') }}</span>
        <a href="/sitemap.xml" target="_blank">Sitemap</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0.6rem 1.5rem;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.nav-links {
  flex: 1;
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

.app-main {
  flex: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.app-footer {
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.8rem 0;
  margin-top: auto;
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: #999;
}

.footer-inner a {
  color: #667eea;
  text-decoration: none;
}

.footer-inner a:hover {
  text-decoration: underline;
}

@media (prefers-color-scheme: dark) {
  .app-container {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  }
  .app-header {
    background: rgba(26, 26, 46, 0.85);
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }
  .logo-text { color: #e0e0e0; }
  .nav-btn { color: #999; }
  .nav-btn:hover { color: #ddd; background: rgba(255,255,255,0.05); }
  .app-footer {
    background: rgba(26, 26, 46, 0.6);
    border-top-color: rgba(255, 255, 255, 0.05);
  }
}
</style>
