<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'

const { t } = useI18nt()

const input = ref('')
const error = ref('')
const copiedFormat = ref('')

// Parsed color values
const r = ref(0)
const g = ref(0)
const b = ref(0)

// Color picker (uncontrolled — native &lt;input type=&quot;color&quot;&gt; handles its own value)
const colorInputRef = ref<HTMLInputElement | null>(null)

// Computed hex for swatch background display
const colorPickerHex = computed(() => {
  return '#' + [r.value, g.value, b.value].map(v => v.toString(16).padStart(2, '0')).join('')
})

type InputFormat = 'hex' | 'rgb' | 'unknown'

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.replace(/^#/, '').trim()
  // #RGB -> #RRGGBB
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  // #RGBA -> #RRGGBBAA
  if (h.length === 4) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  if (h.length === 6) {
    const rr = parseInt(h.slice(0, 2), 16)
    const gg = parseInt(h.slice(2, 4), 16)
    const bb = parseInt(h.slice(4, 6), 16)
    if (isNaN(rr) || isNaN(gg) || isNaN(bb)) return null
    return { r: rr, g: gg, b: bb }
  }
  // 8-digit hex with alpha — ignore alpha
  if (h.length === 8) {
    const rr = parseInt(h.slice(0, 2), 16)
    const gg = parseInt(h.slice(2, 4), 16)
    const bb = parseInt(h.slice(4, 6), 16)
    if (isNaN(rr) || isNaN(gg) || isNaN(bb)) return null
    return { r: rr, g: gg, b: bb }
  }
  return null
}

// Parse RGB or RGBA string: rgb(r,g,b) or rgba(r,g,b,a)
function parseRgbOrRgba(str: string): { r: number; g: number; b: number } | null {
  const trimmed = str.trim().toLowerCase().replace(/\s/g, '')
  // Parse rgb(r,g,b) or rgba(r,g,b,a) — ignore alpha
  const rgbaMatch = trimmed.match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,[\d.]+)?\)$/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1])
    const g = parseInt(rgbaMatch[2])
    const b = parseInt(rgbaMatch[3])
    if (r > 255 || g > 255 || b > 255) return null
    return { r, g, b }
  }
  return null
}

function detectFormat(val: string): InputFormat {
  const trimmed = val.trim().toLowerCase()
  if (trimmed.startsWith('#')) return 'hex'
  if (trimmed.startsWith('rgb')) return 'rgb'
  return 'unknown'
}

function handleInput() {
  error.value = ''
  const val = input.value
  if (!val) {
    r.value = g.value = b.value = 0
    return
  }

  let parsed: { r: number; g: number; b: number } | null = null
  const fmt = detectFormat(val)

  if (fmt === 'hex') {
    parsed = parseHex(val)
  } else if (fmt === 'rgb') {
    parsed = parseRgbOrRgba(val)
  } else {
    error.value = t('colorConverter.errorUnknown')
    return
  }

  if (!parsed || parsed.r === null || parsed.g === null || parsed.b === null) {
    error.value = t('colorConverter.errorParse')
    return
  }

  r.value = parsed.r
  g.value = parsed.g
  b.value = parsed.b
}

// Computed conversions
const hex6 = computed(() => {
  return '#' + [r.value, g.value, b.value]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
})

const rgbStr = computed(() => `rgb(${r.value}, ${g.value}, ${b.value})`)

const hslStr = computed(() => {
  const rd = r.value / 255
  const gd = g.value / 255
  const bd = b.value / 255
  const max = Math.max(rd, gd, bd)
  const min = Math.min(rd, gd, bd)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rd) h = ((gd - bd) / d + (gd < bd ? 6 : 0)) * 60
    else if (max === gd) h = ((bd - rd) / d + 2) * 60
    else h = ((rd - gd) / d + 4) * 60
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
})

const bgStyle = computed(() => {
  return { backgroundColor: `rgb(${r.value}, ${g.value}, ${b.value})` }
})

const textColor = computed(() => {
  // WCAG relative luminance — pick black or white for readable text
  const luminance = 0.299 * r.value + 0.587 * g.value + 0.114 * b.value
  return luminance > 140 ? '#1a1a1a' : '#ffffff'
})

function copyValue(val: string, label: string) {
  navigator.clipboard.writeText(val).then(() => {
    copiedFormat.value = label
    setTimeout(() => { copiedFormat.value = '' }, 1500)
  })
}

// Called when the native color picker is confirmed (change event)
function onPickerChange() {
  if (!colorInputRef.value) return
  const newHex = colorInputRef.value.value
  // Only process valid hex values
  if (!/^#[0-9a-f]{6}$/i.test(newHex)) return
  input.value = newHex
  handleInput()
}

function openColorPicker() {
  colorInputRef.value?.click()
}
</script>

<template>
  <div class="color-converter">
    <div class="tool-header">
      <h2>{{ t('colorConverter.title') }}</h2>
      <p class="desc">{{ t('colorConverter.desc') }}</p>
    </div>

    <!-- Input -->
    <div class="input-section">
      <button type="button" class="picker-swatch" :style="{ backgroundColor: colorPickerHex }" @click="openColorPicker" :title="t('colorConverter.pick')">
      </button>
      <input
        type="color"
        ref="colorInputRef"
        @change="onPickerChange"
        class="hidden-picker"
      />
      <input
        v-model="input"
        :placeholder="t('colorConverter.placeholder')"
        class="color-input"
        @input="handleInput"
        spellcheck="false"
      />
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- Color Preview -->
    <div v-if="input && !error" class="preview-section">
      <div class="color-preview" :style="{ ...bgStyle, color: textColor }">
        <span class="preview-label">{{ t('colorConverter.preview') }}</span>
      </div>
    </div>

    <!-- Results -->
    <div v-if="input && !error" class="results">
      <div class="result-row" v-for="item in [
        { label: 'HEX', val: hex6 },
        { label: 'RGB', val: rgbStr },
        { label: 'HSL', val: hslStr },
      ]" :key="item.label"
      >
        <span class="result-label">{{ item.label }}</span>
        <code class="result-value">{{ item.val }}</code>
        <button
          class="btn-copy"
          @click="copyValue(item.val, item.label)"
          :title="t('colorConverter.copy')"
        >
          {{ copiedFormat === item.label ? '✅' : '📋' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-converter {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  display: flex;
  gap: 0.5rem;
}
.color-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
}
.color-input:focus {
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}

/* Color picker swatch */
.picker-swatch {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 2px solid #ddd;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.15s;
  padding: 0;
  position: relative;
}
.picker-swatch:hover {
  border-color: #4a90d9;
}
.picker-swatch:active {
  transform: scale(0.95);
}
.hidden-picker {
  position: fixed;
  top: -100px;
  left: -100px;
  width: 0;
  height: 0;
  visibility: hidden;
  pointer-events: none;
}


.error-msg {
  background: #fff0f0;
  color: #d32f2f;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #ffcdd2;
}

.preview-section {
  border-radius: 12px;
  overflow: hidden;
}
.color-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background-color 0.15s, color 0.15s;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.result-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}
.result-label {
  font-weight: 600;
  color: #555;
  font-size: 0.8rem;
  min-width: 90px;
  flex-shrink: 0;
}
.result-value {
  flex: 1;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #333;
  word-break: break-all;
}
.btn-copy {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.1s;
  flex-shrink: 0;
}
.btn-copy:hover {
  background: #eee;
}
</style>
