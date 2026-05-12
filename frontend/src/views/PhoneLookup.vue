<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { lookupPhone } from '../data/phoneData'

const { t } = useI18n()
const phoneInput = ref('')
const result = ref<{ carrier: string; province: string; city: string } | null>(null)
const searched = ref(false)

function doLookup() {
  searched.value = true
  result.value = lookupPhone(phoneInput.value)
}
</script>

<template>
  <div class="phone-lookup">
    <div class="tool-header">
      <h2>{{ t('phoneLookup.title') }}</h2>
      <p class="desc">{{ t('phoneLookup.desc') }}</p>
    </div>
    <div class="input-group">
      <input v-model="phoneInput" :placeholder="t('phoneLookup.placeholder')" class="input" @keyup.enter="doLookup" maxlength="11" />
      <button class="btn" @click="doLookup">{{ t('phoneLookup.lookup') }}</button>
    </div>
    <div v-if="searched" class="result-card">
      <div v-if="result" class="result-grid">
        <div class="result-item"><span class="label">{{ t('phoneLookup.carrier') }}</span><span class="value">{{ result.carrier }}</span></div>
        <div class="result-item"><span class="label">{{ t('phoneLookup.province') }}</span><span class="value">{{ result.province }}</span></div>
        <div class="result-item"><span class="label">{{ t('phoneLookup.city') }}</span><span class="value">{{ result.city }}</span></div>
      </div>
      <p v-else class="no-result">{{ t('phoneLookup.noResult') }}</p>
    </div>
  </div>
</template>

<style scoped>
.phone-lookup { max-width: 600px; margin: 0 auto; }
.input-group { display: flex; gap: 0.5rem; margin: 1rem 0; }
.input { flex:1; padding:0.7rem 1rem; border:1px solid #ddd; border-radius:8px; font-size:1rem; }
.btn { padding:0.7rem 1.5rem; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:1rem; }
.btn:hover { background:#5a6fd6; }
.result-card { background:#fff; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-top:1rem; }
.result-grid { display: grid; gap: 1rem; }
.result-item { display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid #f0f0f0; }
.label { color:#888; font-size:0.9rem; }
.value { font-weight:600; color:#333; }
.no-result { color:#999; text-align:center; padding:1rem; }
@media (prefers-color-scheme: dark) {
  .result-card { background:#1a1a2e; }
  .result-item { border-color:#333; }
  .value { color:#eee; }
  .input { background:#1a1a2e; border-color:#333; color:#eee; }
}
</style>