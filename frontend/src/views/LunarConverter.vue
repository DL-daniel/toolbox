<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { solarToLunar } from '../data/lunarData'
const { t } = useI18n()
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const day = ref(now.getDate())

const result = computed(() => {
  const r = solarToLunar(year.value, month.value, day.value)
  if (!r) return null
  return r
})
</script>

<template>
  <div class="lunar">
    <div class="tool-header"><h2>{{ t('lunarConverter.title') }}</h2><p class="desc">{{ t('lunarConverter.desc') }}</p></div>
    <div class="date-picker">
      <input v-model.number="year" type="number" min="1900" max="2100" class="input-sm" /><span>年</span>
      <input v-model.number="month" type="number" min="1" max="12" class="input-sm" /><span>月</span>
      <input v-model.number="day" type="number" min="1" max="31" class="input-sm" /><span>日</span>
    </div>
    <div v-if="result" class="result-card">
      <p class="lunar-gz">{{ t('lunarConverter.ganZhi') }}: <strong>{{ result.ganZhi }}</strong></p>
      <p class="lunar-gz">{{ t('lunarConverter.zodiac') }}: <strong>{{ result.zodiac }}</strong></p>
    </div>
  </div>
</template>
<style scoped>
.lunar{max-width:500px;margin:0 auto}
.date-picker{display:flex;align-items:center;gap:.5rem;justify-content:center;margin:1.5rem 0}
.input-sm{width:60px;padding:.5rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;text-align:center}
.result-card{background:linear-gradient(135deg,#fce4ec,#f3e5f5);border-radius:16px;padding:1.5rem;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.08)}
.lunar-gz{font-size:1.2rem;margin:.5rem 0;color:#333}
.lunar-gz strong{color:#7b1fa2}
@media(prefers-color-scheme:dark){
  .input-sm{background:#1a1a2e;border-color:#333;color:#eee}
  .result-card{background:linear-gradient(135deg,#2a1a2e,#1a1a2e)}
  .lunar-gz{color:#ddd}
  .lunar-gz strong{color:#ce93d8}
}
</style>