<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { lookupIdCard, validateIdCard } from '../data/idCardData'
import UsageGuide from '@/components/UsageGuide.vue'
const { t } = useI18n()
const idInput = ref('')
const result = ref<{ province: string; city: string; district: string } | null>(null)
const validation = ref<{ valid: boolean; message: string } | null>(null)
const birth = ref('')
const gender = ref('')

function doLookup() {
  const id = idInput.value.trim()
  if (id.length < 15) return
  result.value = lookupIdCard(id)
  validation.value = validateIdCard(id)
  if (id.length === 18 && /^\d{17}[\dX]$/.test(id.toUpperCase())) {
    const y = id.slice(6,10), m = id.slice(10,12), d = id.slice(12,14)
    birth.value = y + '-' + m + '-' + d
    gender.value = parseInt(id[16]) % 2 === 0 ? t('idCardLookup.female') : t('idCardLookup.male')
  } else if (id.length === 15) {
    const y = '19' + id.slice(6,8), m = id.slice(8,10), d = id.slice(10,12)
    birth.value = y + '-' + m + '-' + d
    gender.value = parseInt(id[14]) % 2 === 0 ? t('idCardLookup.female') : t('idCardLookup.male')
  }
}
</script>

<template>
  <div class="id-card">
    <div class="tool-header">
      <h2>{{ t('idCardLookup.title') }}</h2>
      <p class="desc">{{ t('idCardLookup.desc') }}</p>
    </div>
    <div class="input-group">
      <input v-model="idInput" :placeholder="t('idCardLookup.placeholder')" class="input" maxlength="18" @input="doLookup" />
    </div>
    <div v-if="validation" class="result-card">
      <div class="validation" :class="{ valid: validation.valid, invalid: !validation.valid }">{{ validation.message }}</div>
      <div class="result-grid" v-if="result">
        <div class="item"><span class="lbl">{{ t('idCardLookup.province') }}</span><span class="val">{{ result.province }}</span></div>
        <div class="item"><span class="lbl">{{ t('idCardLookup.city') }}</span><span class="val">{{ result.city }}</span></div>
        <div class="item"><span class="lbl">{{ t('idCardLookup.district') }}</span><span class="val">{{ result.district }}</span></div>
        <div class="item" v-if="birth"><span class="lbl">{{ t('idCardLookup.birth') }}</span><span class="val">{{ birth }}</span></div>
        <div class="item" v-if="gender"><span class="lbl">{{ t('idCardLookup.gender') }}</span><span class="val">{{ gender }}</span></div>
      </div>
    </div>
  </div>

    <UsageGuide toolKey="idCardLookup" />
  </template>

<style scoped>
.id-card { max-width: 600px; margin: 0 auto; }
.input-group { margin: 1rem 0; }
.input { width:100%; padding:0.7rem 1rem; border:1px solid #ddd; border-radius:8px; font-size:1rem; box-sizing:border-box; }
.result-card { background:#fff; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.validation { padding:0.5rem 1rem; border-radius:6px; margin-bottom:1rem; font-size:0.9rem; }
.valid { background:#e8f5e9; color:#2e7d32; }
.invalid { background:#fbe9e7; color:#c62828; }
.result-grid { display:grid; gap:0.8rem; }
.item { display:flex; justify-content:space-between; padding:0.4rem 0; border-bottom:1px solid #f0f0f0; }
.lbl { color:#888; font-size:0.9rem; }
.val { font-weight:600; color:#333; }
@media (prefers-color-scheme: dark) {
  .result-card { background:#1a1a2e; }
  .item { border-color:#333; }
  .val { color:#eee; }
  .input { background:#1a1a2e; border-color:#333; color:#eee; }
  .valid { background:#1b3d1b; color:#81c784; }
  .invalid { background:#3d1b1b; color:#e57373; }
}
</style>