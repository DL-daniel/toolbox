<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import QRCode from 'qrcode'
import UsageGuide from '@/components/UsageGuide.vue'

const { t } = useI18nt()

const text = ref('')
const errorCorrection = ref<'L' | 'M' | 'Q' | 'H'>('M')
const qrSize = ref(256)
const dataUrl = ref('')
const svgContent = ref('')
const error = ref('')
const downloadFormat = ref<'png' | 'svg'>('png')

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function generate() {
  const val = text.value.trim()
  if (!val) {
    dataUrl.value = ''
    svgContent.value = ''
    error.value = ''
    return
  }

  error.value = ''

  const opts = {
    width: qrSize.value,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: errorCorrection.value,
  }

  // Generate PNG for display
  QRCode.toDataURL(val, opts)
    .then((url: string) => {
      dataUrl.value = url
    })
    .catch((err: Error) => {
      error.value = err.message || t('qrGenerator.errorGenerate')
    })

  // Generate SVG content for SVG download
  QRCode.toString(val, { ...opts, type: 'svg' })
    .then((svg: string) => {
      svgContent.value = svg
    })
    .catch(() => { /* non-critical, PNG display works fine */ })
}

watch(text, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(generate, 300)
})

watch([qrSize, errorCorrection], () => {
  if (text.value.trim()) generate()
})

function download() {
  if (!dataUrl.value) return

  const link = document.createElement('a')

  if (downloadFormat.value === 'svg' && svgContent.value) {
    const blob = new Blob([svgContent.value], { type: 'image/svg+xml' })
    link.href = URL.createObjectURL(blob)
    link.download = 'qrcode.svg'
    link.click()
    URL.revokeObjectURL(link.href)
  } else {
    link.download = 'qrcode.png'
    link.href = dataUrl.value
    link.click()
  }
}

function handleClear() {
  text.value = ''
  dataUrl.value = ''
  error.value = ''
}
</script>

<template>
  <div class="qr-generator">
    <div class="tool-header">
      <h2>{{ t('qrGenerator.title') }}</h2>
      <p class="desc">{{ t('qrGenerator.desc') }}</p>
    </div>

    <!-- Input -->
    <div class="input-section">
      <textarea
        v-model="text"
        :placeholder="t('qrGenerator.placeholder')"
        class="qr-input"
        rows="3"
        spellcheck="false"
      ></textarea>
      <button v-if="text" class="btn-clear" @click="handleClear" :title="t('qrGenerator.clear')">✕</button>
    </div>

    <!-- Options -->
    <div class="options-row">
      <div class="option-group">
        <label>{{ t('qrGenerator.size') }}</label>
        <select v-model.number="qrSize">
          <option :value="128">128</option>
          <option :value="256">256</option>
          <option :value="384">384</option>
          <option :value="512">512</option>
          <option :value="1024">1024</option>
        </select>
      </div>
      <div class="option-group">
        <label>{{ t('qrGenerator.errorLevel') }}</label>
        <select v-model="errorCorrection">
          <option value="L">L (7%)</option>
          <option value="M">M (15%)</option>
          <option value="Q">Q (25%)</option>
          <option value="H">H (30%)</option>
        </select>
      </div>
      <div class="option-group">
        <label>{{ t('qrGenerator.format') }}</label>
        <select v-model="downloadFormat">
          <option value="png">PNG</option>
          <option value="svg">SVG</option>
        </select>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- QR Code Display -->
    <div v-if="dataUrl" class="qr-display">
      <div class="qr-image-wrap">
        <img :src="dataUrl" :alt="t('qrGenerator.qrAlt')" class="qr-image" />
      </div>
      <button class="btn-download" @click="download">
        {{ t('qrGenerator.download') }} (.{{ downloadFormat }})
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!dataUrl && !text" class="empty-state">
      <span class="empty-icon">📱</span>
      <p>{{ t('qrGenerator.empty') }}</p>
    </div>
  </div>

    <UsageGuide toolKey="qrGenerator" />
  </template>

<style scoped>
.qr-generator {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.input-section {
  position: relative;
}
.qr-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.qr-input:focus {
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}
.btn-clear {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: background 0.15s;
}
.btn-clear:hover {
  background: #ddd;
}

.options-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-width: 120px;
}
.option-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
}
.option-group select {
  padding: 0.5rem 0.6rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  background: white;
  cursor: pointer;
  transition: border-color 0.15s;
}
.option-group select:focus {
  border-color: #4a90d9;
}

.error-msg {
  background: #fff0f0;
  color: #d32f2f;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #ffcdd2;
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.qr-image-wrap {
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: inline-flex;
}
.qr-image {
  display: block;
  max-width: 100%;
  height: auto;
}
.btn-download {
  padding: 0.65rem 2rem;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-download:hover {
  background: #357abd;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #999;
}
.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}
.empty-state p {
  font-size: 0.95rem;
}
</style>
