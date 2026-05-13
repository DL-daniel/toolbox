<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UsageGuide from '@/components/UsageGuide.vue'
const { t } = useI18n()
const height = ref(170)
const weight = ref(65)
const unit = ref<'metric'|'imperial'>('metric')

const bmi = computed(() => {
  const h = unit.value === 'metric' ? height.value / 100 : height.value * 0.0254
  const w = unit.value === 'metric' ? weight.value : weight.value * 0.453592
  if (!h || !w) return 0
  return Math.round(w / (h * h) * 10) / 10
})

const category = computed(() => {
  const v = bmi.value
  if (v <= 0) return ''
  if (v < 18.5) return t('bmiCalc.underweight')
  if (v < 24) return t('bmiCalc.normal')
  if (v < 28) return t('bmiCalc.overweight')
  return t('bmiCalc.obese')
})

const catColor = computed(() => {
  const v = bmi.value
  if (v <= 0 || v >= 18.5 && v < 24) return '#4caf50'
  if (v < 18.5 || v < 28) return '#ff9800'
  return '#f44336'
})
</script>

<template>
  <div class="bmi-calc">
    <div class="tool-header">
      <h2>{{ t('bmiCalc.title') }}</h2>
      <p class="desc">{{ t('bmiCalc.desc') }}</p>
    </div>
    <div class="unit-switch">
      <button :class="{ active: unit==='metric' }" @click="unit='metric'">{{ t('bmiCalc.metric') }}</button>
      <button :class="{ active: unit==='imperial' }" @click="unit='imperial'">{{ t('bmiCalc.imperial') }}</button>
    </div>
    <div class="inputs">
      <div class="input-group">
        <label>{{ unit==='metric' ? t('bmiCalc.heightCm') : t('bmiCalc.heightIn') }}</label>
        <input v-model.number="height" type="number" min="50" max="250" class="input" />
      </div>
      <div class="input-group">
        <label>{{ unit==='metric' ? t('bmiCalc.weightKg') : t('bmiCalc.weightLb') }}</label>
        <input v-model.number="weight" type="number" min="10" max="300" class="input" />
      </div>
    </div>
    <div class="result-card" v-if="bmi > 0">
      <div class="bmi-value" :style="{ color: catColor }">{{ bmi }}</div>
      <div class="bmi-label">BMI</div>
      <div class="bmi-cat" :style="{ background: catColor + '20', color: catColor }">{{ category }}</div>
      <div class="bmi-scale">
        <div class="scale-bar">
          <div class="scale-section" style="left:0;width:18.5%;background:#ff9800">18.5</div>
          <div class="scale-section" style="left:18.5%;width:5.5%;background:#4caf50">24</div>
          <div class="scale-section" style="left:24%;width:4%;background:#ff9800">28</div>
          <div class="scale-section" style="right:0;width:28%;background:#f44336"></div>
          <div class="bmi-pointer" :style="{ left: Math.min((bmi / 40) * 100, 95) + '%' }">▼</div>
        </div>
      </div>
    </div>
  </div>

    <UsageGuide toolKey="bmiCalculator" />
  </template>

<style scoped>
.bmi-calc { max-width: 500px; margin: 0 auto; text-align:center; }
.unit-switch { display:flex; gap:0.5rem; justify-content:center; margin:1rem 0; }
.unit-switch button { padding:0.4rem 1.2rem; border:1px solid #ddd; background:#fff; border-radius:20px; cursor:pointer; }
.unit-switch .active { background:#667eea; color:#fff; border-color:#667eea; }
.inputs { display:flex; gap:1rem; justify-content:center; margin:1.5rem 0; }
.input-group { text-align:left; }
.input-group label { display:block; margin-bottom:0.3rem; color:#666; font-size:0.85rem; }
.input { width:120px; padding:0.6rem; border:1px solid #ddd; border-radius:8px; font-size:1.1rem; text-align:center; }
.result-card { background:#fff; border-radius:16px; padding:2rem; box-shadow:0 4px 16px rgba(0,0,0,0.08); margin-top:1rem; }
.bmi-value { font-size:3rem; font-weight:800; }
.bmi-label { color:#999; font-size:0.9rem; margin-bottom:0.5rem; }
.bmi-cat { display:inline-block; padding:0.3rem 1rem; border-radius:16px; font-weight:600; font-size:0.9rem; margin:0.5rem 0 1.5rem; }
.bmi-scale { position:relative; height:30px; }
.scale-bar { position:relative; height:8px; background:#eee; border-radius:4px; margin-top:10px; }
.scale-section { position:absolute; top:0; height:100%; display:flex; align-items:center; justify-content:center; font-size:0.65rem; color:#fff; }
.bmi-pointer { position:absolute; top:-20px; font-size:0.8rem; color:#667eea; transform:translateX(-50%); }
@media (prefers-color-scheme: dark) {
  .unit-switch button { background:#1a1a2e; border-color:#333; color:#aaa; }
  .unit-switch .active { background:#667eea; color:#fff; }
  .input { background:#1a1a2e; border-color:#333; color:#eee; }
  .input-group label { color:#999; }
  .result-card { background:#1a1a2e; }
  .bmi-label { color:#888; }
  .scale-bar { background:#333; }
}
</style>