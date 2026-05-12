<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const text = ref('')
const format = ref<'CODE128'|'CODE39'|'EAN13'|'UPC'>('CODE128')
const showBarcode = ref(false)
let JsBarcode: any = null

watch(text, () => { showBarcode.value = false })

async function generate() {
  if (!text.value) return
  showBarcode.value = false
  await nextTick()
  if (!JsBarcode) {
    const mod = await import('jsbarcode')
    JsBarcode = mod.default || mod
  }
  await nextTick()
  try {
    JsBarcode('#barcode-svg', text.value, { format: format.value, displayValue: true, fontSize: 18, height: 60 })
    showBarcode.value = true
  } catch { showBarcode.value = false }
}

function download() {
  const svg = document.querySelector('#barcode-svg') as SVGElement
  if (!svg) return
  const xml = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([xml], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'barcode.svg'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="barcode-gen">
    <div class="tool-header">
      <h2>{{ t('barcodeGenerator.title') }}</h2>
      <p class="desc">{{ t('barcodeGenerator.desc') }}</p>
    </div>
    <div class="input-row">
      <input v-model="text" :placeholder="t('barcodeGenerator.placeholder')" class="input" @keyup.enter="generate" />
      <select v-model="format" class="select">
        <option value="CODE128">Code128</option>
        <option value="CODE39">Code39</option>
        <option value="EAN13">EAN-13</option>
        <option value="UPC">UPC</option>
      </select>
    </div>
    <button class="btn" @click="generate">{{ t('barcodeGenerator.generate') }}</button>
    <div v-if="showBarcode" class="barcode-wrap">
      <svg id="barcode-svg"></svg>
      <button class="btn btn-sm" @click="download">{{ t('barcodeGenerator.download') }}</button>
    </div>
  </div>
</template>

<style scoped>
.barcode-gen { max-width: 500px; margin: 0 auto; text-align:center; }
.input-row { display:flex; gap:0.5rem; margin:1rem 0; }
.input { flex:1; padding:0.7rem; border:1px solid #ddd; border-radius:8px; font-size:1rem; }
.select { padding:0.7rem; border:1px solid #ddd; border-radius:8px; background:#fff; font-size:0.9rem; }
.btn { padding:0.7rem 2rem; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:1rem; }
.btn-sm { margin-top:1rem; padding:0.5rem 1.2rem; font-size:0.85rem; }
.barcode-wrap { margin-top:1.5rem; background:#fff; padding:1.5rem; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
@media (prefers-color-scheme: dark) {
  .input,.select { background:#1a1a2e; border-color:#333; color:#eee; }
  .barcode-wrap { background:#1a1a2e; }
}
</style>