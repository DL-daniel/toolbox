<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const units = [
  { key:'kg', name:'kg', factor:1 },
  { key:'g', name:'g', factor:0.001 },
  { key:'mg', name:'mg', factor:0.000001 },
  { key:'t', name:'t (吨)', factor:1000 },
  { key:'lb', name:'lb (磅)', factor:0.453592 },
  { key:'oz', name:'oz (盎司)', factor:0.0283495 },
  { key:'jin', name:'斤', factor:0.5 },
  { key:'liang', name:'两', factor:0.05 },
  { key:'ct', name:'ct (克拉)', factor:0.0002 },
]
const fromVal = ref(1)
const fromUnit = ref('kg')

const results = computed(() => {
  const f = units.find(u => u.key === fromUnit.value)
  if (!f) return []
  const baseValue = fromVal.value * f.factor
  return units.map(u => ({ unit: u, value: baseValue / u.factor }))
})
</script>

<template>
  <div class="converter">
    <div class="tool-header"><h2>{{ t('weightConverter.title') }}</h2><p class="desc">{{ t('weightConverter.desc') }}</p></div>
    <div class="convert-row"><input v-model.number="fromVal" type="number" class="input" /><select v-model="fromUnit" class="select"><option v-for="u in units" :key="u.key" :value="u.key">{{ u.name }}</option></select></div>
    <div class="results"><div v-for="r in results" :key="r.unit.key" class="result-row"><span class="r-name">{{ r.unit.name }}</span><span class="r-val">{{ r.value < 0.0001 ? r.value.toExponential(4) : r.value.toLocaleString(undefined, {maximumFractionDigits:6}) }}</span></div></div>
  </div>
</template>
<style scoped>
.converter{max-width:500px;margin:0 auto}
.convert-row{display:flex;gap:.5rem;margin:1rem 0}
.input{flex:1;padding:.7rem;border:1px solid #ddd;border-radius:8px;font-size:1rem}
.select{padding:.7rem;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:.9rem}
.results{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.result-row{display:flex;justify-content:space-between;padding:.7rem 1.2rem;border-bottom:1px solid #f0f0f0}
.result-row:last-child{border-bottom:none}
.r-name{color:#666;font-size:.9rem}
.r-val{font-weight:600;color:#333;font-family:monospace}
@media(prefers-color-scheme:dark){
  .input,.select{background:#1a1a2e;border-color:#333;color:#eee}
  .results{background:#1a1a2e}
  .result-row{border-color:#333}
  .r-name{color:#999}
  .r-val{color:#eee}
}
</style>