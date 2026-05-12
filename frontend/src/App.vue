<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { watch } from 'vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// 动态更新页面标题和描述
function updateMeta() {
  const siteName = t('nav.title')
  const pageTitle = route.meta?.title as string | undefined
  document.title = pageTitle ? siteName + ' - ' + pageTitle : siteName
  
  // 更新 meta description
  let descEl = document.querySelector('meta[name="description"]')
  if (!descEl) {
    descEl = document.createElement('meta')
    descEl.setAttribute('name', 'description')
    document.head.appendChild(descEl)
  }
  const pageDesc = route.meta?.description as string | undefined
  descEl.setAttribute('content', pageDesc || siteName + ' - 在线实用工具箱，提供Base64编码、CRC校验、坐标转换、二维码生成、PDF处理等20+免费在线工具')
}

watch(locale, () => {
  updateMeta()
})
// 路由变化时更新标题和描述
watch(() => route.path, () => {
  updateMeta()
}, { immediate: true })
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-inner">
        <div class="logo" @click="router.push('/')">
          <span class="logo-icon">🧰</span>
          <span class="logo-text">{{ t('nav.title') }}</span>
        </div>
        <nav class="nav-links">
          <button class="nav-btn" @click="router.push('/')">{{ t('nav.home') }}</button>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
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
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>
