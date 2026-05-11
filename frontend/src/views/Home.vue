<script setup lang="ts">
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
    ],
  },
  {
    nameKey: 'home.category.media',
    icon: '📺',
    tools: [
      { titleKey: 'm3u8Player.title', descKey: 'm3u8Player.desc', icon: '📺', route: '/m3u8-player' },
    ],
  },
]
</script>

<template>
  <div class="home">
    <div class="hero">
      <h2>{{ t('home.welcome') }}</h2>
      <p class="subtitle">{{ t('home.subtitle') }}</p>
    </div>

    <section v-for="cat in categories" :key="cat.nameKey" class="category">
      <h3 class="category-title"><span class="cat-icon">{{ cat.icon }}</span> {{ t(cat.nameKey) }}</h3>
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
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.hero {
  text-align: center;
  padding: 2rem 0;
}

.hero h2 {
  font-size: 2rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.tool-card {
  display: block;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tool-card h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.tool-card p {
  font-size: 0.9rem;
  color: #888;
  line-height: 1.5;
}

.category {
  width: 100%;
}

.category-title {
  font-size: 1.2rem;
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
  font-size: 1.4rem;
}

@media (prefers-color-scheme: dark) {
  .hero h2 { color: #e0e0e0; }
  .subtitle { color: #999; }
  .tool-card { background: #1e1e2e; box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
  .tool-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
  .tool-card h4 { color: #e0e0e0; }
  .tool-card p { color: #888; }
  .category-title {
    color: #aaa;
    border-bottom-color: #2a2a3a;
  }
  .placeholder { border-color: #3a3a4a; }
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
