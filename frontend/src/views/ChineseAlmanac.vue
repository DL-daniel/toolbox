<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLunarYearGanZhi, getZodiac, getRandomYiJi } from '../data/lunarData'
const { t } = useI18n()
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const day = ref(now.getDate())
const almanac = ref(getRandomYiJi())

function refresh() {
  almanac.value = getRandomYiJi()
}
refresh()

const ganZhi = computed(() => getLunarYearGanZhi(year.value))
const zodiacSign = computed(() => getZodiac(year.value))
const dateStr = computed(() => year.value + '-' + String(month.value).padStart(2,'0') + '-' + String(day.value).padStart(2,'0'))
</script>

<template>
  <div class="almanac">
    <div class="tool-header"><h2>{{ t('chineseAlmanac.title') }}</h2><p class="desc">{{ t('chineseAlmanac.desc') }}</p></div>
    <div class="date-picker">
      <input v-model.number="year" type="number" class="input-sm" min="1900" max="2100" />年
      <input v-model.number="month" type="number" class="input-sm" min="1" max="12" />月
      <input v-model.number="day" type="number" class="input-sm" min="1" max="31" />日
    </div>
    <div class="almanac-card">
      <div class="date-main">{{ dateStr }}</div>
      <div class="ganzhi">{{ ganZhi }}年 【{{ zodiacSign }}年】</div>
      <div class="yi-ji">
        <div class="yi-section"><h3>宜</h3><div class="tags"><span v-for="y in almanac.yi" :key="y" class="tag yi-tag">{{ y }}</span></div></div>
        <div class="ji-section"><h3>忌</h3><div class="tags"><span v-for="j in almanac.ji" :key="j" class="tag ji-tag">{{ j }}</span></div></div>
      </div>
      <button class="refresh-btn" @click="refresh">🔄 {{ t('chineseAlmanac.refresh') }}</button>
    </div>
  </div>
</template>
<style scoped>
.almanac{max-width:500px;margin:0 auto}
.date-picker{display:flex;align-items:center;gap:.5rem;justify-content:center;margin:1rem 0}
.input-sm{width:60px;padding:.5rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;text-align:center}
.almanac-card{background:linear-gradient(135deg,#fffbe6,#fff3cd);border-radius:16px;padding:1.5rem;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.08);border:1px solid #ffe58f}
.date-main{font-size:1.3rem;font-weight:700;color:#8d6e00}
.ganzhi{color:#b8860b;font-size:1.1rem;margin:.5rem 0}
.yi-ji{text-align:left;margin-top:1rem}
.yi-section,.ji-section{margin:.8rem 0}
.yi-section h3,.ji-section h3{font-size:.9rem;margin:0 0 .4rem;color:#333}
.ji-section h3{color:#c62828}
.tags{display:flex;flex-wrap:wrap;gap:.4rem}
.tag{padding:.3rem .8rem;border-radius:16px;font-size:.85rem}
.yi-tag{background:#e8f5e9;color:#2e7d32;border:1px solid #c8e6c9}
.ji-tag{background:#fbe9e7;color:#c62828;border:1px solid #ffcdd2}
.refresh-btn{margin-top:1rem;padding:.5rem 1.5rem;background:#b8860b;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:.9rem}
.refresh-btn:hover{background:#a07500}
@media(prefers-color-scheme:dark){
  .input-sm{background:#1a1a2e;border-color:#333;color:#eee}
  .almanac-card{background:linear-gradient(135deg,#2a2a1e,#1a1a0e);border-color:#666}
  .date-main{color:#ffd54f}
  .ganzhi{color:#ffb300}
  .yi-section h3{color:#ddd}
  .yi-tag{background:#1b3d1b;color:#81c784}
  .ji-tag{background:#3d1b1b;color:#e57373}
}
</style>