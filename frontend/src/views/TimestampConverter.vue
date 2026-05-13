<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UsageGuide from '@/components/UsageGuide.vue'
const { t } = useI18n()
const tsInput = ref('')
const dateInput = ref('')
const result = computed(() => {
  if (tsInput.value) {
    const ms = parseInt(tsInput.value)
    if (isNaN(ms)) return ''
    const isSeconds = ms < 1e12
    const d = new Date(isSeconds ? ms * 1000 : ms)
    return d.toString() !== 'Invalid Date' ? d.toLocaleString('zh-CN') : ''
  }
  return ''
})
const tsResult = computed(() => {
  if (dateInput.value) {
    const d = new Date(dateInput.value)
    if (isNaN(d.getTime())) return ''
    return { sec: Math.floor(d.getTime() / 1000), ms: d.getTime() }
  }
  return null
})

function now() { tsInput.value = String(Date.now()) }
function copy(v: string) { navigator.clipboard.writeText(v) }
</script>

<template>
  <div class="ts-conv">
    <div class="tool-header">
      <h2>{{ t('timestampConverter.title') }}</h2>
      <p class="desc">{{ t('timestampConverter.desc') }}</p>
    </div>
    <div class="section">
      <h3>{{ t('timestampConverter.tsToDate') }}</h3>
      <div class="input-row">
        <input v-model="tsInput" :placeholder="t('timestampConverter.tsPlaceholder')" class="input" />
        <button class="btn-sm" @click="now">{{ t('timestampConverter.now') }}</button>
      </div>
      <div v-if="result" class="result-box">{{ result }}</div>
    </div>
    <div class="section">
      <h3>{{ t('timestampConverter.dateToTs') }}</h3>
      <input v-model="dateInput" type="datetime-local" class="input" />
      <div v-if="tsResult" class="result-box">
        <div class="ts-line"><span>{{ t('timestampConverter.seconds') }}:</span><code>{{ tsResult.sec }}</code><button class="copy-btn" @click="copy(String(tsResult.sec))">{{ t('timestampConverter.copy') }}</button></div>
        <div class="ts-line"><span>{{ t('timestampConverter.milliseconds') }}:</span><code>{{ tsResult.ms }}</code><button class="copy-btn" @click="copy(String(tsResult.ms))">{{ t('timestampConverter.copy') }}</button></div>
      </div>
    </div>
  </div>

    <UsageGuide toolKey="timestampConverter" />
  </template>

<style scoped>
.ts-conv { max-width: 500px; margin: 0 auto; }
.section { background:#fff; border-radius:12px; padding:1.2rem; margin-bottom:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
.section h3 { margin:0 0 0.8rem; font-size:1rem; color:#333; }
.input-row { display:flex; gap:0.5rem; }
.input { flex:1; padding:0.6rem; border:1px solid #ddd; border-radius:6px; font-size:0.95rem; width:100%; box-sizing:border-box; }
.btn-sm { padding:0.6rem 1rem; background:#667eea; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; white-space:nowrap; }
.result-box { margin-top:0.8rem; padding:0.8rem; background:#f8f9fa; border-radius:8px; color:#333; }
.ts-line { display:flex; align-items:center; gap:0.5rem; margin:0.3rem 0; }
.ts-line span { color:#666; font-size:0.85rem; min-width:80px; }
.ts-line code { flex:1; font-family:monospace; background:#eef2ff; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.9rem; word-break:break-all; }
.copy-btn { padding:0.2rem 0.6rem; background:#667eea; color:#fff; border:none; border-radius:4px; font-size:0.75rem; cursor:pointer; }
@media (prefers-color-scheme: dark) {
  .section { background:#1a1a2e; }
  .section h3 { color:#ddd; }
  .input { background:#1a1a2e; border-color:#333; color:#eee; }
  .result-box { background:#252545; color:#ddd; }
  .ts-line code { background:#2a2a4e; color:#ddd; }
  .ts-line span { color:#999; }
}
</style>