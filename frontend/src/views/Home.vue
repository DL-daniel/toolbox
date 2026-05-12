<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import { RouterLink } from 'vue-router'

const { t } = useI18nt()

interface ToolCard {
  titleKey: string
  descKey: string
  icon: string
  route: string
}

interface ToolCategory {
  nameKey: string
  icon: string
  tools: ToolCard[]
}

const categories: ToolCategory[] = [
  {
    nameKey: 'home.category.encoding',
    icon: '🪪',
    tools: [
      { titleKey: 'base64Tool.title', descKey: 'base64Tool.desc', icon: '🔒', route: '/base64' },
      { titleKey: 'unicodeTool.title', descKey: 'unicodeTool.desc', icon: '🔤', route: '/unicode' },
      { titleKey: 'formatConv.title', descKey: 'formatConv.desc', icon: '🔄', route: '/format-converter' },
      { titleKey: 'barcodeGenerator.title', descKey: 'barcodeGenerator.desc', icon: '📊', route: '/barcode-generator' },
    ],
  },
  {
    nameKey: 'home.category.security',
    icon: '🔐',
    tools: [
      { titleKey: 'md5Tool.title', descKey: 'md5Tool.desc', icon: '🔐', route: '/md5' },
      { titleKey: 'cryptoTool.title', descKey: 'cryptoTool.desc', icon: '🔑', route: '/crypto' },
      { titleKey: 'crcTool.title', descKey: 'crcTool.desc', icon: '🔍', route: '/crc' },
      { titleKey: 'rsaGenerator.title', descKey: 'rsaGenerator.desc', icon: '🔑', route: '/rsa-generator' },
      { titleKey: 'passwordGenerator.title', descKey: 'passwordGenerator.desc', icon: '🔐', route: '/password-generator' },
      { titleKey: 'wubiTool.title', descKey: 'wubiTool.desc', icon: '📝', route: '/wubi-tool' },
    ],
  },
  {
    nameKey: 'home.category.finance',
    icon: '💰',
    tools: [
      { titleKey: 'rmbConverter.title', descKey: 'rmbConverter.desc', icon: '💰', route: '/rmb-converter' },
      { titleKey: 'worldClock.title', descKey: 'worldClock.desc', icon: '🕐', route: '/world-clock' },
      { titleKey: 'dateDiff.title', descKey: 'dateDiff.desc', icon: '📅', route: '/date-diff' },
      { titleKey: 'cronTool.title', descKey: 'cronTool.desc', icon: '⏰', route: '/cron-generator' },
      { titleKey: 'bmiCalc.title', descKey: 'bmiCalc.desc', icon: '⚖️', route: '/bmi-calculator' },
      { titleKey: 'timestampConverter.title', descKey: 'timestampConverter.desc', icon: '⏱️', route: '/timestamp-converter' },
      { titleKey: 'chineseAlmanac.title', descKey: 'chineseAlmanac.desc', icon: '📜', route: '/chinese-almanac' },
      { titleKey: 'lunarConverter.title', descKey: 'lunarConverter.desc', icon: '🌙', route: '/lunar-converter' },
      { titleKey: 'currencyConverter.title', descKey: 'currencyConverter.desc', icon: '💱', route: '/currency-converter' },
    ],
  },
  {
    nameKey: 'home.category.document',
    icon: '📄',
    tools: [
      { titleKey: 'imageWatermark.title', descKey: 'imageWatermark.desc', icon: '🖼️', route: '/image-watermark' },
      { titleKey: 'pdfMerger.title', descKey: 'pdfMerger.desc', icon: '📄', route: '/pdf-merger' },
      { titleKey: 'pdfWatermark.title', descKey: 'pdfWatermark.desc', icon: '💧', route: '/pdf-watermark' },
      { titleKey: 'pdfCompressor.title', descKey: 'pdfCompressor.desc', icon: '🗜️', route: '/pdf-compressor' },
    ],
  },
  {
    nameKey: 'home.category.devTools',
    icon: '🛠️',
    tools: [
      { titleKey: 'jsonParser.title', descKey: 'jsonParser.desc', icon: '📋', route: '/json-parser' },
      { titleKey: 'colorConverter.title', descKey: 'colorConverter.desc', icon: '🎨', route: '/color-converter' },
      { titleKey: 'qrGenerator.title', descKey: 'qrGenerator.desc', icon: '📱', route: '/qr-generator' },
      { titleKey: 'coordConverter.title', descKey: 'coordConverter.desc', icon: '🌍', route: '/coord-converter' },
      { titleKey: 'webSocketTester.title', descKey: 'webSocketTester.desc', icon: '🔌', route: '/websocket-tester' },
      { titleKey: 'randomNumber.title', descKey: 'randomNumber.desc', icon: '🎲', route: '/random-number' },
      { titleKey: 'regexTester.title', descKey: 'regexTester.desc', icon: '🔍', route: '/regex-tester' },
    ],
  },
  {
    nameKey: 'home.category.media',
    icon: '📺',
    tools: [
      { titleKey: 'm3u8Player.title', descKey: 'm3u8Player.desc', icon: '📺', route: '/m3u8-player' },
      { titleKey: 'reactionTest.title', descKey: 'reactionTest.desc', icon: '⚡', route: '/reaction-test' },
    ],
  },
  {
    nameKey: 'home.category.lookup',
    icon: '🔍',
    tools: [
      { titleKey: 'phoneLookup.title', descKey: 'phoneLookup.desc', icon: '📞', route: '/phone-lookup' },
      { titleKey: 'emergencyPhones.title', descKey: 'emergencyPhones.desc', icon: '🆘', route: '/emergency-phones' },
      { titleKey: 'areaCodeLookup.title', descKey: 'areaCodeLookup.desc', icon: '📍', route: '/area-code' },
      { titleKey: 'idCardLookup.title', descKey: 'idCardLookup.desc', icon: '🪪', route: '/id-card' },
    ],
  },
  {
    nameKey: 'home.category.converters',
    icon: '⚖️',
    tools: [
      { titleKey: 'weightConverter.title', descKey: 'weightConverter.desc', icon: '⚖️', route: '/weight-converter' },
      { titleKey: 'volumeConverter.title', descKey: 'volumeConverter.desc', icon: '🧪', route: '/volume-converter' },
      { titleKey: 'densityConverter.title', descKey: 'densityConverter.desc', icon: '🔬', route: '/density-converter' },
      { titleKey: 'temperatureConverter.title', descKey: 'temperatureConverter.desc', icon: '🌡️', route: '/temperature-converter' },
      { titleKey: 'pressureConverter.title', descKey: 'pressureConverter.desc', icon: '💨', route: '/pressure-converter' },
      { titleKey: 'lengthConverter.title', descKey: 'lengthConverter.desc', icon: '📏', route: '/length-converter' },
      { titleKey: 'areaConverter.title', descKey: 'areaConverter.desc', icon: '📐', route: '/area-converter' },
    ],
  },
]

// 侧边栏展开/收起
const sidebarOpen = ref(false)

// 当前滚动激活的分类索引
const activeIndex = ref(0)

// 滚动监听
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-cat-idx'))
          if (!isNaN(idx)) activeIndex.value = idx
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px' }
  )
  document.querySelectorAll('[data-cat-idx]').forEach(el => observer?.observe(el))
})

onUnmounted(() => observer?.disconnect())

// 点击侧边栏滚动到对应分类
function scrollTo(idx: number) {
  const el = document.querySelector(`[data-cat-idx="${idx}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  sidebarOpen.value = false
}

const totalTools = computed(() => categories.reduce((s, c) => s + c.tools.length, 0))
</script>

<template>
  <div class="home-layout">
    <!-- 侧边栏遮罩 (移动端) -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

    <!-- 侧边栏 -->
    <aside :class="['sidebar', { open: sidebarOpen }]">
      <div class="sidebar-header">
        <span class="sidebar-logo">🛠️</span>
        <span class="sidebar-title">{{ t('nav.title') }}</span>
        <span class="sidebar-count">{{ totalTools }}</span>
      </div>
      <nav class="sidebar-nav">
        <a
          v-for="(cat, i) in categories"
          :key="cat.nameKey"
          :class="['sidebar-link', { active: activeIndex === i }]"
          @click.prevent="scrollTo(i)"
          href="#"
        >
          <span class="sl-icon">{{ cat.icon }}</span>
          <span class="sl-text">{{ t(cat.nameKey) }}</span>
          <span class="sl-count">{{ cat.tools.length }}</span>
        </a>
      </nav>
    </aside>

    <!-- 主内容 -->
    <main class="main-content">
      <!-- 移动端汉堡菜单 -->
      <div class="mobile-header">
        <button class="hamburger" @click="sidebarOpen = !sidebarOpen">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <span class="mobile-title">{{ t('nav.title') }}</span>
      </div>

      <div class="hero">
        <h2>{{ t('home.welcome') }}</h2>
        <p class="subtitle">{{ t('home.subtitle') }} · {{ totalTools }} 个工具</p>
      </div>

      <section
        v-for="(cat, i) in categories"
        :key="cat.nameKey"
        :data-cat-idx="i"
        class="category"
      >
        <h3 class="category-title">
          <span class="cat-icon">{{ cat.icon }}</span>
          {{ t(cat.nameKey) }}
          <span class="cat-tool-count">{{ cat.tools.length }}</span>
        </h3>
        <div class="tool-grid">
          <RouterLink
            v-for="tool in cat.tools"
            :key="tool.route"
            :to="tool.route"
            class="tool-card"
          >
            <div class="card-icon">{{ tool.icon }}</div>
            <h4>{{ t(tool.titleKey) }}</h4>
            <p>{{ t(tool.descKey) }}</p>
          </RouterLink>
        </div>
      </section>

      <section class="category">
        <h3 class="category-title"><span class="cat-icon">🔧</span> {{ t('home.moreComing') }}</h3>
        <div class="tool-grid">
          <div class="tool-card placeholder">
            <div class="card-icon">🔧</div>
            <h4>{{ t('home.moreComing') }}</h4>
            <p>{{ t('home.moreDesc') }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* === 整体布局 === */
.home-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

/* === 侧边栏 === */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e8eaee;
  padding: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #e8eaee;
  font-weight: 700;
  font-size: 1rem;
  color: #333;
}

.sidebar-logo {
  font-size: 1.4rem;
}

.sidebar-count {
  margin-left: auto;
  background: #667eea;
  color: #fff;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
}

.sidebar-nav {
  padding: 0.5rem 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1rem;
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.15s;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.sidebar-link:hover {
  background: #f5f6fa;
  color: #333;
}

.sidebar-link.active {
  background: #eef0ff;
  color: #667eea;
  font-weight: 600;
  border-left-color: #667eea;
}

.sl-icon {
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
}

.sl-count {
  margin-left: auto;
  color: #bbb;
  font-size: 0.75rem;
  background: #f0f0f0;
  padding: 0.1rem 0.45rem;
  border-radius: 8px;
}

.sidebar-link.active .sl-count {
  background: #dde0ff;
  color: #667eea;
}

/* === 主内容 === */
.main-content {
  flex: 1;
  padding: 2rem 2.5rem 3rem;
  max-width: 1200px;
}

.hero {
  text-align: center;
  padding: 1.5rem 0 2rem;
}

.hero h2 {
  font-size: 1.8rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: #888;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
  width: 100%;
}

.tool-card {
  display: block;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
}

.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
}

.tool-card h4 {
  font-size: 1rem;
  margin-bottom: 0.4rem;
  color: #1a1a1a;
}

.tool-card p {
  font-size: 0.85rem;
  color: #888;
  line-height: 1.5;
}

.category {
  width: 100%;
  margin-bottom: 2.5rem;
}

.category-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #444;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e4ea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cat-icon {
  font-size: 1.2rem;
}

.cat-tool-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: #999;
  background: #f0f0f0;
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
  font-weight: 500;
}

/* === 移动端菜单 === */
.mobile-header {
  display: none;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 0;
  margin-bottom: 0.5rem;
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger .bar {
  width: 22px;
  height: 2.5px;
  background: #555;
  border-radius: 2px;
  transition: 0.2s;
}

.mobile-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #333;
}

.sidebar-overlay {
  display: none;
}

/* === 响应式：小屏 === */
@media (max-width: 768px) {
  .home-layout {
    flex-direction: column;
  }

  .sidebar {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 260px;
    height: 100vh;
    z-index: 200;
    box-shadow: 4px 0 20px rgba(0,0,0,0.15);
  }

  .sidebar.open {
    display: block;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 199;
  }

  .mobile-header {
    display: flex;
  }

  .main-content {
    padding: 0.5rem 1rem 2rem;
  }

  .hero h2 {
    font-size: 1.4rem;
  }

  .tool-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  .tool-card {
    padding: 1.2rem;
  }
}

/* === 暗色模式 === */
@media (prefers-color-scheme: dark) {
  .sidebar {
    background: #1a1a2e;
    border-right-color: #2a2a3e;
  }
  .sidebar-header {
    border-bottom-color: #2a2a3e;
    color: #e0e0e0;
  }
  .sidebar-link {
    color: #999;
  }
  .sidebar-link:hover {
    background: #252545;
    color: #ddd;
  }
  .sidebar-link.active {
    background: #2a2a4e;
    color: #8899ff;
  }
  .sl-count {
    background: #2a2a3e;
    color: #777;
  }
  .sidebar-link.active .sl-count {
    background: #3a3a6e;
    color: #8899ff;
  }
  .hero h2 { color: #e0e0e0; }
  .subtitle { color: #999; }
  .tool-card {
    background: #1e1e2e;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .tool-card:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.5);
  }
  .tool-card h4 { color: #e0e0e0; }
  .tool-card p { color: #888; }
  .category-title {
    color: #aaa;
    border-bottom-color: #2a2a3a;
  }
  .cat-tool-count {
    background: #2a2a3a;
    color: #777;
  }
  .placeholder { border-color: #3a3a4a; }
  .hamburger .bar { background: #999; }
  .mobile-title { color: #ddd; }
}

.placeholder {
  opacity: 0.6;
  border: 2px dashed #ddd;
  cursor: default;
}

.placeholder:hover {
  transform: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
