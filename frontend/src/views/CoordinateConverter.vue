<script setup lang="ts">
import { ref, watch } from 'vue'
import UsageGuide from '@/components/UsageGuide.vue'
import { useI18nt } from '@/i18n/useI18nt'
import {
  type CoordSystem,
  type CoordResult,
  convert,
  isValidLat,
  isValidLng,
  SYSTEM_LABELS,
} from '@/utils/coordConv'

const { t } = useI18nt()

const srcSystem = ref<CoordSystem>('wgs84')
const inputLat = ref('39.9042')
const inputLng = ref('116.4074')
const latErr = ref('')
const lngErr = ref('')
const result = ref<CoordResult | null>(null)
const copiedKey = ref('')
const showKnowledge = ref(false)

function doConvert() {
  const lat = parseFloat(inputLat.value)
  const lng = parseFloat(inputLng.value)

  latErr.value = ''
  lngErr.value = ''

  if (isNaN(lat)) {
    latErr.value = t('coordConverter.errorLat')
    return
  }
  if (isNaN(lng)) {
    lngErr.value = t('coordConverter.errorLng')
    return
  }
  if (!isValidLat(lat)) {
    latErr.value = t('coordConverter.errorLatRange')
    return
  }
  if (!isValidLng(lng)) {
    lngErr.value = t('coordConverter.errorLngRange')
    return
  }

  result.value = convert({ lat, lng }, srcSystem.value)
}

watch([inputLat, inputLng, srcSystem], () => {
  doConvert()
})

function copyToClipboard(text: string, key: string) {
  navigator.clipboard.writeText(text).then(() => {
    copiedKey.value = key
    setTimeout(() => {
      copiedKey.value = ''
    }, 1500)
  })
}

function copyAll() {
  if (!result.value) return
  const lines = [
    `WGS84: ${result.value.wgs84.lat}, ${result.value.wgs84.lng}`,
    `GCJ02: ${result.value.gcj02.lat}, ${result.value.gcj02.lng}`,
    `BD09:  ${result.value.bd09.lat}, ${result.value.bd09.lng}`,
  ]
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    copiedKey.value = 'all'
    setTimeout(() => {
      copiedKey.value = ''
    }, 1500)
  })
}

function formatCoord(v: number): string {
  return v.toFixed(6)
}

function formatCoordAxis(lat: number, lng: number): string {
  return `${formatCoord(lat)}, ${formatCoord(lng)}`
}
</script>

<template>
  <div class="coord-converter">
    <div class="tool-header">
      <h2>{{ t('coordConverter.title') }}</h2>
      <p class="desc">{{ t('coordConverter.desc') }}</p>
    </div>

    <!-- Input -->
    <div class="input-section">
      <div class="input-row">
        <div class="input-group">
          <label>{{ t('coordConverter.latitude') }}</label>
          <input
            v-model="inputLat"
            type="text"
            inputmode="decimal"
            class="coord-input"
            placeholder="39.9042"
          />
          <span v-if="latErr" class="input-error">{{ latErr }}</span>
        </div>
        <div class="input-group">
          <label>{{ t('coordConverter.longitude') }}</label>
          <input
            v-model="inputLng"
            type="text"
            inputmode="decimal"
            class="coord-input"
            placeholder="116.4074"
          />
          <span v-if="lngErr" class="input-error">{{ lngErr }}</span>
        </div>
      </div>

      <div class="system-select-row">
        <label>{{ t('coordConverter.inputSystem') }}</label>
        <div class="system-btns">
          <button
            v-for="sys in (['wgs84', 'gcj02', 'bd09'] as CoordSystem[])"
            :key="sys"
            :class="['sys-btn', { active: srcSystem === sys }]"
            @click="srcSystem = sys"
          >
            {{ SYSTEM_LABELS[sys] }}
          </button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="result" class="results-section">
      <div class="results-header">
        <h3>{{ t('coordConverter.result') }}</h3>
        <button class="btn-copy-all" @click="copyAll">
          {{ copiedKey === 'all' ? t('coordConverter.copied') : t('coordConverter.copyAll') }}
        </button>
      </div>

      <div class="result-cards">
        <div
          v-for="sys in (['wgs84', 'gcj02', 'bd09'] as CoordSystem[])"
          :key="sys"
          class="result-card"
          :class="sys"
        >
          <div class="card-label">{{ SYSTEM_LABELS[sys] }}</div>
          <div class="card-coords">{{ formatCoordAxis(result[sys].lat, result[sys].lng) }}</div>
          <button class="btn-copy" @click="copyToClipboard(formatCoordAxis(result[sys].lat, result[sys].lng), sys)">
            {{ copiedKey === sys ? t('coordConverter.copied') : t('coordConverter.copy') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Knowledge -->
    <div class="knowledge-section">
      <button class="knowledge-toggle" @click="showKnowledge = !showKnowledge">
        <span class="toggle-icon">{{ showKnowledge ? '▼' : '▶' }}</span>
        {{ t('coordConverter.knowledge') }}
      </button>

      <div v-if="showKnowledge" class="knowledge-content">
        <div class="kb-card">
          <h4>WGS84</h4>
          <p>{{ t('coordConverter.kbWgs84') }}</p>
        </div>
        <div class="kb-card">
          <h4>GCJ-02</h4>
          <p>{{ t('coordConverter.kbGcj02') }}</p>
        </div>
        <div class="kb-card">
          <h4>BD-09</h4>
          <p>{{ t('coordConverter.kbBd09') }}</p>
        </div>
        <div class="kb-card note">
          <p>{{ t('coordConverter.kbNote') }}</p>
        </div>
      </div>
    </div>

    <!-- Picker Links -->
    <div class="links-section">
      <h3>{{ t('coordConverter.pickers') }}</h3>
      <div class="picker-links">
        <a
          href="https://api.map.baidu.com/lbsapi/getpoint/index.html"
          target="_blank"
          rel="noopener"
          class="picker-link baidu"
        >
          <span class="picker-icon">🗺️</span>
          <span class="picker-name">百度坐标拾取系统</span>
          <span class="picker-arrow">↗</span>
        </a>
        <a
          href="https://lbs.amap.com/tools/picker"
          target="_blank"
          rel="noopener"
          class="picker-link amap"
        >
          <span class="picker-icon">🗺️</span>
          <span class="picker-name">高德坐标拾取</span>
          <span class="picker-arrow">↗</span>
        </a>
        <a
          href="https://lbs.qq.com/getPoint/"
          target="_blank"
          rel="noopener"
          class="picker-link tencent"
        >
          <span class="picker-icon">🗺️</span>
          <span class="picker-name">腾讯坐标拾取器</span>
          <span class="picker-arrow">↗</span>
        </a>
      </div>
    </div>
  </div>

    <UsageGuide toolKey="coordConverter" />
  </template>

<style scoped>
.coord-converter {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tool-header {
  text-align: center;
}
.tool-header h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}
.desc {
  color: #666;
  font-size: 0.95rem;
}

/* Input */
.input-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.input-row {
  display: flex;
  gap: 1rem;
}
.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
}
.coord-input {
  padding: 0.7rem 0.8rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Consolas', 'Courier New', monospace;
  outline: none;
  transition: border-color 0.15s;
}
.coord-input:focus {
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}
.input-error {
  font-size: 0.75rem;
  color: #d32f2f;
}

.system-select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.system-select-row label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}
.system-btns {
  display: flex;
  gap: 0.4rem;
}
.sys-btn {
  padding: 0.35rem 0.8rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 500;
}
.sys-btn:hover {
  border-color: #bbb;
}
.sys-btn.active {
  border-color: #4a90d9;
  background: #eef4fb;
  color: #2a5d9e;
}

/* Results */
.results-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.results-header h3 {
  font-size: 1.05rem;
  color: #1a1a1a;
}
.btn-copy-all {
  padding: 0.35rem 0.8rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-copy-all:hover {
  border-color: #4a90d9;
  color: #2a5d9e;
}

.result-cards {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.result-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
  font-size: 0.9rem;
}
.result-card.wgs84 {
  border-left: 4px solid #4caf50;
}
.result-card.gcj02 {
  border-left: 4px solid #ff9800;
}
.result-card.bd09 {
  border-left: 4px solid #2196f3;
}
.card-label {
  font-weight: 700;
  font-size: 0.8rem;
  color: #555;
  min-width: 52px;
}
.card-coords {
  font-family: 'Consolas', 'Courier New', monospace;
  color: #1a1a1a;
  flex: 1;
}
.btn-copy {
  padding: 0.25rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
}
.btn-copy:hover {
  border-color: #4a90d9;
  color: #2a5d9e;
}

/* Knowledge */
.knowledge-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.knowledge-toggle {
  width: 100%;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.1s;
}
.knowledge-toggle:hover {
  background: #f9f9f9;
}
.toggle-icon {
  font-size: 0.7rem;
  color: #999;
}
.knowledge-content {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.kb-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  border-left: 4px solid #4a90d9;
}
.kb-card h4 {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #1a1a1a;
}
.kb-card p {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.6;
}
.kb-card.note {
  border-left-color: #e67e22;
  background: #fff8f0;
}
.kb-card.note p {
  font-weight: 500;
}

/* Picker Links */
.links-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.links-section h3 {
  font-size: 1.05rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
}
.picker-links {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.picker-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #1a1a1a;
  border: 1px solid #eee;
  transition: all 0.15s;
}
.picker-link:hover {
  border-color: #4a90d9;
  background: #f5f8fe;
  transform: translateX(3px);
}
.picker-icon {
  font-size: 1.2rem;
}
.picker-name {
  flex: 1;
  font-size: 0.9rem;
}
.picker-arrow {
  color: #999;
  font-size: 0.85rem;
}
</style>
