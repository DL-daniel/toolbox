<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UsageGuide from '@/components/UsageGuide.vue'
import { cityData } from '../data/cityData'
const { t } = useI18n()
const query = ref('')
const results = computed(() => {
  if (!query.value) return []
  const q = query.value.toLowerCase()
  return cityData.filter(c => c.city.includes(q) || c.province.includes(q) || c.areaCode.includes(q) || c.zipCode.includes(q))
})
</script>

<template>
  <div class="area-code">
    <div class="tool-header">
      <h2>{{ t('areaCodeLookup.title') }}</h2>
      <p class="desc">{{ t('areaCodeLookup.desc') }}</p>
    </div>
    <input v-model="query" :placeholder="t('areaCodeLookup.placeholder')" class="search-input" />
    <div class="results" v-if="results.length">
      <div class="result-row" v-for="c in results" :key="c.city+c.areaCode">
        <div class="city-info">
          <span class="city-name">{{ c.city }}</span>
          <span class="province-tag">{{ c.province }}</span>
        </div>
        <div class="codes">
          <span class="code-item">{{ t('areaCodeLookup.areaCode') }}: <strong>{{ c.areaCode }}</strong></span>
          <span class="code-item">{{ t('areaCodeLookup.zipCode') }}: <strong>{{ c.zipCode }}</strong></span>
        </div>
      </div>
    </div>
    <p v-else-if="query" class="no-result">{{ t('areaCodeLookup.noResult') }}</p>
  </div>

    <UsageGuide toolKey="areaCodeZip" />
  </template>

<style scoped>
.area-code { max-width: 600px; margin: 0 auto; }
.search-input { width:100%; padding:0.7rem 1rem; border:1px solid #ddd; border-radius:8px; font-size:1rem; margin:1rem 0; box-sizing:border-box; }
.results { display:flex; flex-direction:column; gap:0.5rem; }
.result-row { display:flex; justify-content:space-between; align-items:center; background:#fff; border-radius:10px; padding:1rem 1.2rem; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
.city-info { display:flex; align-items:center; gap:0.5rem; }
.city-name { font-size:1.05rem; font-weight:600; color:#333; }
.province-tag { background:#eef2ff; color:#667eea; font-size:0.75rem; padding:2px 8px; border-radius:8px; }
.codes { display:flex; gap:1rem; }
.code-item { font-size:0.9rem; color:#666; }
.code-item strong { color:#333; font-size:1rem; }
.no-result { text-align:center; color:#999; margin-top:1rem; }
@media (prefers-color-scheme: dark) {
  .search-input { background:#1a1a2e; border-color:#333; color:#eee; }
  .result-row { background:#1a1a2e; }
  .city-name { color:#eee; }
  .province-tag { background:#2a2a4e; color:#8899ff; }
  .code-item { color:#999; }
  .code-item strong { color:#ddd; }
}
</style>