<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const min = ref(1)
const max = ref(100)
const count = ref(5)
const unique = ref(true)
const numbers = ref<number[]>([])
const sortResult = ref(false)
const errorMsg = ref('')

const range = computed(() => {
  const lo = Math.min(min.value, max.value)
  const hi = Math.max(min.value, max.value)
  return { lo, hi, total: hi - lo + 1 }
})

const countValid = computed(() => {
  const n = Math.min(Math.max(count.value, 1), 1000)
  if (unique.value && n > range.value.total) {
    return { valid: false, max: range.value.total, msg: t('randomNumber.limitUnique', { n: range.value.total }) }
  }
  if (n > 1000) {
    return { valid: false, max: 1000, msg: t('randomNumber.limitMax', { n: 1000 }) }
  }
  return { valid: true, max: n, msg: '' }
})

function generate() {
  errorMsg.value = ''
  const n = Math.min(Math.max(count.value, 1), 1000)
  const { lo, total } = range.value
  if (unique.value && n > total) {
    errorMsg.value = t('randomNumber.errorUnique', { n: total })
    numbers.value = []
    return
  }
  if (unique.value) {
    const set = new Set<number>()
    while (set.size < n) {
      set.add(Math.floor(Math.random() * total) + lo)
    }
    numbers.value = [...set]
  } else {
    numbers.value = Array.from({ length: n }, () => Math.floor(Math.random() * total) + lo)
  }
  if (sortResult.value) numbers.value.sort((a, b) => a - b)
}

function copyResult() {
  navigator.clipboard.writeText(numbers.value.join(', '))
}
</script>

<template>
  <div class="rng">
    <div class="tool-header">
      <h2>{{ t('randomNumber.title') }}</h2>
      <p class="desc">{{ t('randomNumber.desc') }}</p>
    </div>
    <div class="options">
      <div class="opt-row">
        <label>{{ t('randomNumber.min') }}</label>
        <input v-model.number="min" type="number" class="input-sm" />
        <span class="hint">{{ t('randomNumber.minHint') }}</span>
      </div>
      <div class="opt-row">
        <label>{{ t('randomNumber.max') }}</label>
        <input v-model.number="max" type="number" class="input-sm" />
        <span class="hint">{{ t('randomNumber.maxHint') }}</span>
      </div>
      <div class="opt-row">
        <label>{{ t('randomNumber.count') }}</label>
        <input v-model.number="count" type="number" min="1" max="1000" class="input-sm" />
        <span class="hint">{{ unique ? t('randomNumber.countHintUnique', { n: range.total }) : t('randomNumber.countHint') }}</span>
      </div>
      <div class="range-info">
        <span class="range-badge">
          {{ t('randomNumber.rangeBadge', { lo: range.lo, hi: range.hi, total: range.total }) }}
        </span>
      </div>
      <div v-if="!countValid.valid" class="warning">
        ⚠️ {{ countValid.msg }}
      </div>
      <div class="checkbox-group">
        <label class="opt-row toggle"><input type="checkbox" v-model="unique" />{{ t('randomNumber.unique') }}</label>
        <label class="opt-row toggle"><input type="checkbox" v-model="sortResult" />{{ t('randomNumber.sort') }}</label>
      </div>
    </div>
    <button class="btn" @click="generate">{{ t('randomNumber.generate') }}</button>
    <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    <div v-if="numbers.length" class="result-card">
      <div class="result-summary">{{ t('randomNumber.resultCount', { n: numbers.length, lo: range.lo, hi: range.hi }) }}</div>
      <div class="nums">{{ numbers.join(', ') }}</div>
      <button class="btn-sm" @click="copyResult">{{ t('common.copy') }}</button>
    </div>
  </div>
</template>

<style scoped>
.rng { max-width: 500px; margin: 0 auto; }
.options { background:#fff; border-radius:12px; padding:1.2rem; box-shadow:0 2px 8px rgba(0,0,0,0.05); margin:1rem 0; }
.opt-row { display:flex; align-items:center; gap:0.6rem; margin:0.5rem 0; }
.input-sm { width:80px; padding:0.4rem 0.6rem; border:1px solid #ddd; border-radius:6px; font-size:0.95rem; text-align:center; }
.opt-row label { min-width:60px; color:#555; font-size:0.9rem; flex-shrink:0; }
.hint { font-size:0.78rem; color:#999; }
.toggle { cursor:pointer; color:#555; font-size:0.9rem; }
.toggle input { margin-right:0.4rem; }
.checkbox-group { display:flex; gap:1.5rem; margin-top:0.8rem; padding-top:0.8rem; border-top:1px solid #f0f0f0; }
.btn { padding:0.7rem 2rem; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:1rem; width:100%; }
.btn:hover { background:#5a6fd6; }
.result-card { background:#fff; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-top:1rem; text-align:center; }
.result-summary { font-size:0.85rem; color:#888; margin-bottom:0.5rem; }
.nums { font-family:monospace; font-size:1.1rem; color:#333; word-break:break-all; padding:0.5rem 0; line-height:1.8; }
.btn-sm { margin-top:0.8rem; padding:0.4rem 1rem; background:#667eea; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; }
.range-info { margin:0.3rem 0; }
.range-badge { display:inline-block; background:#eef2ff; color:#667eea; font-size:0.8rem; padding:0.2rem 0.8rem; border-radius:10px; font-weight:600; }
.warning { color:#e65100; font-size:0.85rem; padding:0.3rem 0.5rem; background:#fff3e0; border-radius:6px; margin:0.3rem 0; }
.error { color:#c62828; font-size:0.9rem; padding:0.5rem; background:#fbe9e7; border-radius:8px; margin-top:0.5rem; text-align:center; }
@media (prefers-color-scheme: dark) {
  .options,.result-card { background:#1a1a2e; }
  .input-sm { background:#1a1a2e; border-color:#333; color:#eee; }
  .opt-row label,.toggle { color:#aaa; }
  .hint { color:#777; }
  .nums { color:#eee; }
  .range-badge { background:#2a2a4e; color:#8899ff; }
  .warning { background:#3d2e1b; color:#ffb74d; }
  .error { background:#3d1b1b; color:#e57373; }
  .checkbox-group { border-top-color:#333; }
}
</style>
