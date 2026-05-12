<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const status = ref<'waiting'|'ready'|'running'|'result'>('waiting')
const result = ref<number[]>([])
const lastReaction = ref(0)
const avgReaction = ref(0)
const bestReaction = ref(0)
let startTime = 0

function startTest() {
  result.value = []
  status.value = 'ready'
  const delay = 1000 + Math.random() * 3000
  setTimeout(() => {
    if (status.value !== 'ready') return
    status.value = 'running'
    startTime = Date.now()
  }, delay)
}

function handleClick() {
  if (status.value === 'running') {
    const time = Date.now() - startTime
    lastReaction.value = time
    result.value.push(time)
    if (result.value.length >= 5) {
      const sorted = [...result.value].sort((a,b) => a-b)
      bestReaction.value = sorted[0]
      avgReaction.value = Math.round(result.value.reduce((a,b) => a+b, 0) / result.value.length)
      status.value = 'result'
    } else {
      status.value = 'waiting'
    }
  } else if (status.value === 'ready') {
    // Clicked too early - false start
    lastReaction.value = -1
    status.value = 'waiting'
  }
}

function reset() {
  status.value = 'waiting'
  result.value = []
  lastReaction.value = 0
}

function grade(ms: number): string {
  if (ms < 150) return t('reactionTest.grade1')
  if (ms < 200) return t('reactionTest.grade2')
  if (ms < 250) return t('reactionTest.grade3')
  if (ms < 300) return t('reactionTest.grade4')
  return t('reactionTest.grade5')
}
</script>

<template>
  <div class="reaction-test">
    <div class="tool-header">
      <h2>{{ t('reactionTest.title') }}</h2>
      <p class="desc">{{ t('reactionTest.desc') }}</p>
    </div>
    <div class="click-area" :class="status" @click="handleClick">
      <span v-if="status==='waiting'">{{ t('reactionTest.waiting') }}</span>
      <span v-if="status==='ready'">{{ t('reactionTest.waitGreen') }}</span>
      <span v-if="status==='running'">{{ t('reactionTest.clickNow') }}</span>
    </div>
    <div class="stats" v-if="lastReaction > 0 && status !== 'result'">
      <div class="stat">{{ t('reactionTest.last') }}: <strong>{{ lastReaction }}ms</strong> ({{ grade(lastReaction) }})</div>
      <div class="stat">{{ t('reactionTest.progress') }}: {{ result.length }}/5</div>
    </div>
    <div class="result-card" v-if="status==='result'">
      <h3>{{ t('reactionTest.results') }}</h3>
      <div class="stat-row"><span>{{ t('reactionTest.best') }}</span><span class="val">{{ bestReaction }}ms</span></div>
      <div class="stat-row"><span>{{ t('reactionTest.avg') }}</span><span class="val">{{ avgReaction }}ms ({{ grade(avgReaction) }})</span></div>
      <div class="stat-row" v-for="(r,i) in result" :key="i"><span>{{ t('reactionTest.testNum', {n: i+1}) }}</span><span class="val">{{ r }}ms</span></div>
      <button class="btn" @click="reset">{{ t('reactionTest.retry') }}</button>
    </div>
    <button v-if="status==='waiting' && result.length===0" class="btn start-btn" @click="startTest">{{ t('reactionTest.start') }}</button>
    <button v-if="status==='waiting' && result.length>0" class="btn start-btn" @click="startTest">{{ t('reactionTest.next') }}</button>
  </div>
</template>

<style scoped>
.reaction-test { max-width: 500px; margin: 0 auto; text-align:center; }
.click-area { width:100%; height:200px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; font-weight:600; cursor:pointer; transition:all 0.15s; margin:1rem 0; user-select:none; }
.click-area.waiting { background:#e0e0e0; color:#666; }
.click-area.ready { background:#ff9800; color:#fff; }
.click-area.running { background:#4caf50; color:#fff; }
.stats { margin:0.5rem 0; }
.stat { color:#666; font-size:0.9rem; margin:0.2rem 0; }
.stat strong { color:#333; }
.result-card { background:#fff; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.06); text-align:left; }
.stat-row { display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid #f0f0f0; }
.stat-row .val { font-weight:600; color:#667eea; }
.btn { padding:0.7rem 2rem; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:1rem; margin-top:1rem; }
.start-btn { background:#667eea; }
@media (prefers-color-scheme: dark) {
  .click-area.waiting { background:#2a2a2a; color:#888; }
  .result-card { background:#1a1a2e; }
  .stat-row { border-color:#333; }
  .stat { color:#999; }
  .stat strong { color:#ddd; }
}
</style>