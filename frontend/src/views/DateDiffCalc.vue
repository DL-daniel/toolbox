<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
const { t } = useI18nt()

// ── Mode ──
type Mode = 'diff' | 'add'
const mode = ref<Mode>('diff')

// ── Diff mode ──
const d1 = ref('2026-01-01')
const t1 = ref('00:00')
const d2 = ref(new Date().toISOString().slice(0, 10))
const t2 = ref(new Date().toISOString().slice(11, 16))

function toDate(d: string, tm: string) { return new Date(`${d}T${tm}:00`) }

const diffResult = computed(() => {
  if (mode.value !== 'diff') return null
  const a = toDate(d1.value, t1.value).getTime()
  const b = toDate(d2.value, t2.value).getTime()
  if (isNaN(a) || isNaN(b)) return null
  let ms = Math.abs(b - a)
  const neg = b < a
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  const week = Math.floor(day / 7)
  // approximate month/year
  const month = Math.floor(day / 30.4375)
  const year = Math.floor(day / 365.25)
  return {
    neg, ms, sec, min, hr, day, week, month, year,
    total: { year, month, week, day, hr, min, sec }
  }
})

// ── Add mode ──
const baseDate = ref(new Date().toISOString().slice(0, 10))
const baseTime = ref(new Date().toISOString().slice(11, 16))
const addYears = ref(0)
const addMonths = ref(0)
const addWeeks = ref(0)
const addDays = ref(0)
const addHours = ref(0)
const addMinutes = ref(0)
const addSeconds = ref(0)

const addResult = computed(() => {
  if (mode.value !== 'add') return null
  const d = new Date(`${baseDate.value}T${baseTime.value}:00`)
  if (isNaN(d.getTime())) return null
  d.setFullYear(d.getFullYear() + addYears.value)
  d.setMonth(d.getMonth() + addMonths.value)
  d.setDate(d.getDate() + addDays.value + addWeeks.value * 7)
  d.setHours(d.getHours() + addHours.value)
  d.setMinutes(d.getMinutes() + addMinutes.value)
  d.setSeconds(d.getSeconds() + addSeconds.value)
  return d
})

const isDiff = computed(() => mode.value === 'diff')
</script>

<template>
  <div class="tool">
    <h2>{{ t('dateDiff.title') }}</h2>
    <p class="subtitle">{{ t('dateDiff.subtitle') }}</p>

    <!-- Mode switch -->
    <div class="mode-tabs">
      <button :class="{ active: mode==='diff' }" @click="mode='diff'">{{ t('dateDiff.modeDiff') }}</button>
      <button :class="{ active: mode==='add' }" @click="mode='add'">{{ t('dateDiff.modeAdd') }}</button>
    </div>

    <!-- Diff inputs -->
    <template v-if="isDiff">
      <div class="date-group">
        <div class="date-field">
          <label>{{ t('dateDiff.start') }}</label>
          <input type="date" v-model="d1" class="input" />
          <input type="time" v-model="t1" class="input time" />
        </div>
        <div class="date-field">
          <label>{{ t('dateDiff.end') }}</label>
          <input type="date" v-model="d2" class="input" />
          <input type="time" v-model="t2" class="input time" />
        </div>
      </div>

      <div v-if="diffResult" class="result-card">
        <div class="big-diff">
          <span :class="{ neg: diffResult.neg }">{{ diffResult.neg ? '−' : '' }}</span>
          <span class="big-num">{{ diffResult.day }}</span>
          <span class="big-unit">{{ t('dateDiff.days') }}</span>
        </div>
        <div class="diff-detail">
          <div class="detail-item"><span class="label">{{ t('dateDiff.years') }}</span><span class="val">{{ diffResult.year }}</span></div>
          <div class="detail-item"><span class="label">{{ t('dateDiff.months') }}</span><span class="val">{{ diffResult.month }}</span></div>
          <div class="detail-item"><span class="label">{{ t('dateDiff.weeks') }}</span><span class="val">{{ diffResult.week }}</span></div>
          <div class="detail-item"><span class="label">{{ t('dateDiff.hours') }}</span><span class="val">{{ diffResult.hr }}</span></div>
          <div class="detail-item"><span class="label">{{ t('dateDiff.minutes') }}</span><span class="val">{{ diffResult.min }}</span></div>
          <div class="detail-item"><span class="label">{{ t('dateDiff.seconds') }}</span><span class="val">{{ diffResult.sec }}</span></div>
        </div>
      </div>
    </template>

    <!-- Add mode -->
    <template v-else>
      <div class="date-group">
        <div class="date-field">
          <label>{{ t('dateDiff.base') }}</label>
          <input type="date" v-model="baseDate" class="input" />
          <input type="time" v-model="baseTime" class="input time" />
        </div>
      </div>

      <div class="add-fields">
        <div class="add-row">
          <div class="add-item">
            <label>{{ t('dateDiff.years') }}</label>
            <input type="number" v-model.number="addYears" min="0" class="input num" />
          </div>
          <div class="add-item">
            <label>{{ t('dateDiff.months') }}</label>
            <input type="number" v-model.number="addMonths" min="0" class="input num" />
          </div>
          <div class="add-item">
            <label>{{ t('dateDiff.weeks') }}</label>
            <input type="number" v-model.number="addWeeks" min="0" class="input num" />
          </div>
          <div class="add-item">
            <label>{{ t('dateDiff.days') }}</label>
            <input type="number" v-model.number="addDays" min="0" class="input num" />
          </div>
        </div>
        <div class="add-row">
          <div class="add-item">
            <label>{{ t('dateDiff.hours') }}</label>
            <input type="number" v-model.number="addHours" min="0" max="23" class="input num" />
          </div>
          <div class="add-item">
            <label>{{ t('dateDiff.minutes') }}</label>
            <input type="number" v-model.number="addMinutes" min="0" max="59" class="input num" />
          </div>
          <div class="add-item">
            <label>{{ t('dateDiff.seconds') }}</label>
            <input type="number" v-model.number="addSeconds" min="0" max="59" class="input num" />
          </div>
        </div>
      </div>

      <div v-if="addResult" class="result-card">
        <div class="big-diff">
          <span class="big-num">{{ addResult.toLocaleDateString() }}</span>
        </div>
        <div class="diff-detail" style="justify-content:center">
          <span class="val" style="font-size:1.1rem">{{ addResult.toLocaleTimeString() }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tool { max-width: 660px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 1.2rem; }

.mode-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; }
.mode-tabs button {
  padding: 0.45rem 1.2rem;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  background: #fff;
  color: #555;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.12s;
}
.mode-tabs button.active { border-color: #4a90d9; background: #4a90d9; color: #fff; }
.mode-tabs button:not(.active):hover { background: #f5f7fa; }

.date-group { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.date-field { flex: 1; min-width: 200px; }
.date-field label { display: block; font-size: 0.78rem; color: #777; margin-bottom: 0.25rem; font-weight: 600; }

.input {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  color: #333;
  box-sizing: border-box;
}
.input:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 3px rgba(74,144,217,0.1); }
.time { margin-top: 0.3rem; }
.num { width: 80px; }

.add-fields { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1rem; }
.add-row { display: flex; gap: 0.8rem; flex-wrap: wrap; }
.add-item { display: flex; flex-direction: column; gap: 0.2rem; }
.add-item label { font-size: 0.78rem; color: #777; font-weight: 600; }

.result-card {
  background: #f5f9ff;
  border: 1px solid #dce8f5;
  border-radius: 12px;
  padding: 1.2rem;
  text-align: center;
}
.big-diff { margin-bottom: 0.8rem; }
.big-num { font-size: 2.5rem; font-weight: 700; color: #4a90d9; }
.big-unit { font-size: 1.2rem; color: #777; margin-left: 0.3rem; }
.neg { color: #d32f2f; font-size: 2.5rem; font-weight: 700; }

.diff-detail { display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; }
.detail-item { display: flex; gap: 0.3rem; align-items: baseline; }
.detail-item .label { font-size: 0.78rem; color: #999; }
.detail-item .val { font-size: 1rem; font-weight: 600; color: #555; }

@media (prefers-color-scheme: dark) {
  .input { background: #1e1e2e; border-color: #333; color: #ddd; }
  .mode-tabs button { background: #1e1e2e; border-color: #333; color: #aaa; }
  .mode-tabs button.active { background: #4a90d9; border-color: #4a90d9; color: #fff; }
  .mode-tabs button:not(.active):hover { background: #2a2a3a; }
  .result-card { background: #12121e; border-color: #2a3a4a; }
  .detail-item .val { color: #ccc; }
  .big-unit { color: #999; }
}
</style>
