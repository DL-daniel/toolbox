<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { wubiData } from '../data/wubiData'

const { t } = useI18n()

type Tab = 'query' | 'keyboard' | 'practice' | 'chars'
const tab = ref<Tab>('query')
const queryTab = ref<'char'|'code'>('char')

// === Query ===
const input = ref('')
const result = ref<[string, string][] | null>(null)
const codeResult = ref<string[]>([])

function doSearch() {
  const q = input.value.trim()
  if (!q) { result.value = null; codeResult.value = []; return }
  if (queryTab.value === 'char') {
    const r = wubiData.filter(([c]) => c === q)
    result.value = r.length > 0 ? r.map(([_, code, explain]) => [code, explain]) : null
  } else {
    codeResult.value = wubiData.filter(([_, c]) => c.startsWith(q.toUpperCase())).map(([char]) => char)
  }
}

// === Practice ===
const practiceChar = ref('')
const practiceAnswer = ref('')
const practiceFeedback = ref<'none'|'correct'|'wrong'>('none')
const practiceInputRef = ref<HTMLInputElement | null>(null)
const stats = ref({ total: 0, correct: 0, wrong: 0, streak: 0, bestStreak: 0 })
const practiceHistory = ref<{ char: string; answer: string; correct: boolean }[]>([])

function getRandomPracticeChar(): string {
  const idx = Math.floor(Math.random() * wubiData.length)
  return wubiData[idx][0]
}

function nextPractice() {
  practiceChar.value = getRandomPracticeChar()
  practiceAnswer.value = ''
  practiceFeedback.value = 'none'
  setTimeout(() => practiceInputRef.value?.focus(), 50)
}

function checkPractice() {
  const correctCodes = wubiData.filter(([c]) => c === practiceChar.value).map(([_, code]) => code)
  const userCode = practiceAnswer.value.trim().toUpperCase()
  const isCorrect = correctCodes.includes(userCode)
  practiceFeedback.value = isCorrect ? 'correct' : 'wrong'
  stats.value.total++
  if (isCorrect) {
    stats.value.correct++
    stats.value.streak++
    if (stats.value.streak > stats.value.bestStreak) stats.value.bestStreak = stats.value.streak
  } else {
    stats.value.wrong++
    stats.value.streak = 0
  }
  practiceHistory.value.unshift({ char: practiceChar.value, answer: userCode, correct: isCorrect })
  if (practiceHistory.value.length > 20) practiceHistory.value.pop()
}

function skipPractice() { nextPractice() }

const accuracy = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.correct / stats.value.total) * 100)
})

// === Keyboard ===
interface KeyInfo { key: string; zone: number; radicals: string[] }
const keyboardData: KeyInfo[][] = [
  [
    { key: 'Q', zone: 3, radicals: ['金','儿','夕'] },
    { key: 'W', zone: 3, radicals: ['人','八','癶'] },
    { key: 'E', zone: 3, radicals: ['月','用','乃'] },
    { key: 'R', zone: 3, radicals: ['白','手','扌','斤'] },
    { key: 'T', zone: 3, radicals: ['禾','竹','丿'] },
    { key: 'Y', zone: 4, radicals: ['言','文','方','亠'] },
    { key: 'U', zone: 4, radicals: ['立','辛','丷','疒'] },
    { key: 'I', zone: 4, radicals: ['水','⺌','小'] },
    { key: 'O', zone: 4, radicals: ['火','米'] },
    { key: 'P', zone: 4, radicals: ['之','辶','冖'] },
  ],
  [
    { key: 'A', zone: 1, radicals: ['工','匚','七'] },
    { key: 'S', zone: 1, radicals: ['木','丁','西'] },
    { key: 'D', zone: 1, radicals: ['大','石','古','厂'] },
    { key: 'F', zone: 1, radicals: ['土','士','二','干','寸'] },
    { key: 'G', zone: 1, radicals: ['王','一','五'] },
    { key: 'H', zone: 2, radicals: ['目','丨','卜'] },
    { key: 'J', zone: 2, radicals: ['日','曰','早','虫'] },
    { key: 'K', zone: 2, radicals: ['口','川'] },
    { key: 'L', zone: 2, radicals: ['田','甲','口','车'] },
    { key: ';', zone: 0, radicals: ['\''] },
  ],
  [
    { key: 'Z', zone: 0, radicals: ['万能键'] },
    { key: 'X', zone: 5, radicals: ['纟','弓','匕'] },
    { key: 'C', zone: 5, radicals: ['又','巴','马'] },
    { key: 'V', zone: 5, radicals: ['女','刀','九','臼'] },
    { key: 'B', zone: 5, radicals: ['子','耳','阝','了'] },
    { key: 'N', zone: 5, radicals: ['已','己','巳','尸','心'] },
    { key: 'M', zone: 2, radicals: ['山','由','贝','几'] },
    { key: ',', zone: 0, radicals: [','] },
    { key: '.', zone: 0, radicals: ['.'] },
    { key: '/', zone: 0, radicals: ['/'] },
  ],
]

const zoneNames = ['', '横区（一）', '竖区（丨）', '撇区（丿）', '捺区（丶）', '折区（乙）']
const zoneColors = ['#999', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336']
const zoneKeys = ['', 'GFDSA', 'HJKLM', 'TREWQ', 'YUIOP', 'NBVCX']

// === Common Characters ===
type DiffLevel = 'basic'|'intermediate'|'advanced'
const diffLevel = ref<DiffLevel>('basic')

const commonChars = '的一是在不了有和人这中大为上个国我以要他时来用们到他会作要对生'
const groupedChars = computed(() => {
  const groups: Record<DiffLevel, { char: string; code: string; explain: string }[]> = {
    basic: [], intermediate: [], advanced: []
  }
  for (const [char, code, explain] of wubiData) {
    let level: DiffLevel
    if (code.length <= 4 && char.length === 1 && commonChars.includes(char)) {
      level = 'basic'
    } else if (code.length <= 2) {
      level = 'intermediate'
    } else {
      level = 'advanced'
    }
    groups[level].push({ char, code, explain })
  }
  return groups
})

const currentGroup = computed(() => groupedChars.value[diffLevel.value] || [])

function charToCode(c: string): string {
  const r = wubiData.filter(([ch]) => ch === c)
  return r.length > 0 ? r[0][1] : ''
}

function lookupChar(char: string) {
  tab.value = 'query'
  queryTab.value = 'char'
  input.value = char
  doSearch()
}
</script>

<template>
  <div class="wubi">
    <div class="tool-header">
      <h2>{{ t('wubiTool.title') }}</h2>
      <p class="desc">{{ t('wubiTool.desc') }}</p>
    </div>

    <div class="main-tabs">
      <button :class="{active:tab==='query'}" @click="tab='query'">🔍 {{ t('wubiTool.query') }}</button>
      <button :class="{active:tab==='keyboard'}" @click="tab='keyboard'">⌨️ {{ t('wubiTool.keyboard') }}</button>
      <button :class="{active:tab==='practice'}" @click="tab='practice';nextPractice()">🎯 {{ t('wubiTool.practice') }}</button>
      <button :class="{active:tab==='chars'}" @click="tab='chars'">📋 {{ t('wubiTool.chars') }}</button>
    </div>

    <!-- ====== 查询 Tab ====== -->
    <div v-if="tab==='query'">
      <div class="sub-tabs">
        <button :class="{active:queryTab==='char'}" @click="queryTab='char';doSearch()">{{ t('wubiTool.byChar') }}</button>
        <button :class="{active:queryTab==='code'}" @click="queryTab='code';doSearch()">{{ t('wubiTool.byCode') }}</button>
      </div>
      <div class="input-wrap">
        <input v-model="input" :placeholder="queryTab==='char'?t('wubiTool.charPlaceholder'):t('wubiTool.codePlaceholder')" class="input" @input="doSearch" maxlength="10" />
      </div>

      <div v-if="queryTab==='char' && result && result.length>0" class="result-card">
        <div class="char-detail">
          <span class="big-char">{{ input }}</span>
          <div class="char-info">
            <div class="code-info">{{ t('wubiTool.code') }}: <strong>{{ result[0][0] }}</strong></div>
            <div class="explain-info">{{ t('wubiTool.explain') }}: {{ result[0][1] }}</div>
            <div class="level-info" v-if="result[0][0].length===1">{{ t('wubiTool.level') }}: <span class="lvl lvl1">{{ t('wubiTool.lvl1') }}</span></div>
            <div class="level-info" v-else-if="result[0][0].length===2">{{ t('wubiTool.level') }}: <span class="lvl lvl2">{{ t('wubiTool.lvl2') }}</span></div>
            <div class="level-info" v-else-if="result[0][0].length===3">{{ t('wubiTool.level') }}: <span class="lvl lvl3">{{ t('wubiTool.lvl3') }}</span></div>
            <div class="level-info" v-else>{{ t('wubiTool.level') }}: <span class="lvl lvl4">{{ t('wubiTool.lvl4') }}</span></div>
          </div>
        </div>
        <div v-if="result.length>1" class="alt-codes">
          <div class="alt-title">{{ t('wubiTool.altCodes') }}:</div>
          <div v-for="([c, exp], i) in result.slice(1)" :key="i" class="alt-item">
            <span class="alt-code">{{ c }}</span>
            <span class="alt-exp">{{ exp }}</span>
          </div>
        </div>
      </div>

      <div v-if="queryTab==='code' && codeResult.length" class="result-card">
        <div class="result-summary">{{ t('wubiTool.matchCount', { n: codeResult.length }) }}</div>
        <div class="code-char-grid">
          <div v-for="c in codeResult.slice(0,200)" :key="c" class="code-char-item" @click="lookupChar(c)">
            <span class="cc-char">{{ c }}</span>
            <span class="cc-code">{{ charToCode(c) }}</span>
          </div>
        </div>
        <p v-if="codeResult.length>200" class="more">{{ t('wubiTool.moreResults', { n: codeResult.length - 200 }) }}</p>
      </div>

      <p v-if="input && queryTab==='char' && result && result.length===0" class="no-result">{{ t('wubiTool.noResult') }}</p>
      <p v-if="input && queryTab==='code' && codeResult.length===0" class="no-result">{{ t('wubiTool.noResult') }}</p>
    </div>

    <!-- ====== 键盘分区 Tab ====== -->
    <div v-if="tab==='keyboard'">
      <div class="section-desc">{{ t('wubiTool.keyDesc') }}</div>
      <div class="zone-legend">
        <div v-for="z in 5" :key="z" class="zone-tag" :style="{ background: zoneColors[z]+'20', color: zoneColors[z], borderColor: zoneColors[z] }">
          <span class="zone-dot" :style="{ background: zoneColors[z] }"></span>
          {{ zoneNames[z] }} [{{ zoneKeys[z] }}]
        </div>
      </div>
      <div class="keyboard">
        <div v-for="(row, ri) in keyboardData" :key="ri" class="kb-row">
          <div v-for="k in row" :key="k.key" :class="['kb-key', 'zone-'+k.zone]">
            <span class="kb-keycap">{{ k.key }}</span>
            <span class="kb-rads">{{ k.radicals.join(' ') }}</span>
          </div>
        </div>
      </div>
      <div class="kb-hint">{{ t('wubiTool.zHint') }}</div>
    </div>

    <!-- ====== 练习模式 Tab ====== -->
    <div v-if="tab==='practice'">
      <div class="practice-stats">
        <div class="stat-item"><span class="stat-label">{{ t('wubiTool.accuracy') }}</span><span class="stat-val" :class="{good:accuracy>=80,ok:accuracy>=50&&accuracy<80,bad:accuracy<50&&stats.total>0}">{{ accuracy }}%</span></div>
        <div class="stat-item"><span class="stat-label">{{ t('wubiTool.streak') }}</span><span class="stat-val">{{ stats.streak }}🔥</span></div>
        <div class="stat-item"><span class="stat-label">{{ t('wubiTool.bestStreak') }}</span><span class="stat-val">{{ stats.bestStreak }}</span></div>
        <div class="stat-item"><span class="stat-label">{{ t('wubiTool.total') }}</span><span class="stat-val">{{ stats.total }}({{ stats.correct }}✓ {{ stats.wrong }}✗)</span></div>
      </div>

      <div v-if="practiceChar" class="practice-area">
        <div class="practice-char">{{ practiceChar }}</div>
        <div class="practice-hint">{{ t('wubiTool.practiceHint') }}</div>
        <div class="practice-input-row">
          <input v-model="practiceAnswer" :placeholder="t('wubiTool.practicePlaceholder')" class="input practice-input" maxlength="4" @keyup.enter="practiceFeedback==='none'?checkPractice():nextPractice()" ref="practiceInputRef" />
          <button v-if="practiceFeedback==='none'" class="btn" @click="checkPractice">{{ t('wubiTool.check') }}</button>
          <button v-if="practiceFeedback==='none'" class="btn btn-skip" @click="skipPractice()">{{ t('wubiTool.skip') }}</button>
          <button v-if="practiceFeedback!=='none'" class="btn" @click="nextPractice()">{{ t('wubiTool.next') }}</button>
        </div>
        <div v-if="practiceFeedback==='correct'" class="feedback correct">{{ t('wubiTool.correct') }} ✅ {{ t('wubiTool.answerIs') }} <strong>{{ charToCode(practiceChar) }}</strong></div>
        <div v-if="practiceFeedback==='wrong'" class="feedback wrong">{{ t('wubiTool.wrong') }} ❌ {{ t('wubiTool.answerIs') }} <strong>{{ charToCode(practiceChar) }}</strong></div>
      </div>

      <div v-if="!practiceChar" class="practice-start">
        <button class="btn btn-start" @click="nextPractice()">{{ t('wubiTool.startPractice') }}</button>
      </div>

      <div v-if="practiceHistory.length" class="history">
        <div class="history-title">{{ t('wubiTool.history') }}</div>
        <div v-for="(h, i) in practiceHistory" :key="i" :class="['history-item', h.correct?'h-correct':'h-wrong']">
          <span class="h-char">{{ h.char }}</span>
          <span class="h-code">{{ h.answer }}</span>
          <span class="h-result">{{ h.correct ? '✓' : '✗' }}</span>
          <span class="h-correct-code" v-if="!h.correct">{{ charToCode(h.char) }}</span>
        </div>
      </div>
    </div>

    <!-- ====== 常用字表 Tab ====== -->
    <div v-if="tab==='chars'">
      <div class="section-desc">{{ t('wubiTool.charsDesc') }}</div>
      <div class="diff-tabs">
        <button :class="{active:diffLevel==='basic'}" @click="diffLevel='basic'">{{ t('wubiTool.basic') }} <span class="badge">{{ groupedChars.basic.length }}</span></button>
        <button :class="{active:diffLevel==='intermediate'}" @click="diffLevel='intermediate'">{{ t('wubiTool.intermediate') }} <span class="badge">{{ groupedChars.intermediate.length }}</span></button>
        <button :class="{active:diffLevel==='advanced'}" @click="diffLevel='advanced'">{{ t('wubiTool.advanced') }} <span class="badge">{{ groupedChars.advanced.length }}</span></button>
      </div>
      <div class="char-table">
        <div v-for="item in currentGroup" :key="item.char" class="char-row" @click="lookupChar(item.char)">
          <span class="ct-char">{{ item.char }}</span>
          <span class="ct-code">{{ item.code }}</span>
          <span class="ct-exp">{{ item.explain }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wubi { max-width: 680px; margin: 0 auto; }
.main-tabs { display: flex; gap: 0.4rem; margin: 1rem 0; flex-wrap: wrap; }
.main-tabs button { padding: 0.5rem 1rem; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; font-size: 0.88rem; transition: all 0.15s; }
.main-tabs .active { background: #667eea; color: #fff; border-color: #667eea; }
.sub-tabs { display: flex; gap: 0.4rem; margin-bottom: 0.8rem; }
.sub-tabs button { padding: 0.35rem 0.9rem; border: 1px solid #ddd; background: #f8f9fa; border-radius: 16px; cursor: pointer; font-size: 0.8rem; }
.sub-tabs .active { background: #667eea; color: #fff; border-color: #667eea; }
.input-wrap { margin-bottom: 0.8rem; }
.input { width: 100%; padding: 0.7rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box; }
.result-card { background: #fff; border-radius: 12px; padding: 1rem 1.2rem; box-shadow: 0 2px 8px rgba(0,0,0,.06); margin-top: 0.5rem; }
.char-detail { display: flex; gap: 1.2rem; align-items: center; padding: 0.5rem 0; }
.big-char { font-size: 3.5rem; font-weight: 700; color: #333; line-height: 1; }
.char-info { flex: 1; }
.code-info { font-size: 1.1rem; color: #333; margin-bottom: 0.3rem; }
.code-info strong { color: #667eea; font-size: 1.3rem; font-family: monospace; }
.explain-info { font-size: 0.85rem; color: #888; margin-bottom: 0.3rem; }
.level-info { font-size: 0.8rem; color: #666; }
.lvl { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 8px; font-weight: 600; font-size: 0.75rem; }
.lvl1 { background: #e8f5e9; color: #2e7d32; }
.lvl2 { background: #e3f2fd; color: #1565c0; }
.lvl3 { background: #fff3e0; color: #e65100; }
.lvl4 { background: #fbe9e7; color: #c62828; }
.alt-codes { margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid #f0f0f0; }
.alt-title { font-size: 0.8rem; color: #999; margin-bottom: 0.3rem; }
.alt-item { display: flex; gap: 1rem; padding: 0.3rem 0; font-size: 0.85rem; }
.alt-code { font-family: monospace; font-weight: 600; color: #667eea; min-width: 80px; }
.alt-exp { color: #888; }
.result-summary { font-size: 0.85rem; color: #888; margin-bottom: 0.5rem; }
.code-char-grid { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.code-char-item { display: flex; flex-direction: column; align-items: center; padding: 0.3rem 0.6rem; background: #eef2ff; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.code-char-item:hover { background: #dde0ff; }
.cc-char { font-size: 1.1rem; font-weight: 600; color: #333; }
.cc-code { font-size: 0.65rem; color: #8899cc; font-family: monospace; }
.more { color: #999; text-align: center; margin-top: 0.5rem; font-size: 0.85rem; }
.no-result { text-align: center; color: #999; margin-top: 1rem; font-size: 0.9rem; }
.section-desc { font-size: 0.85rem; color: #888; margin-bottom: 1rem; }
.zone-legend { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
.zone-tag { display: flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; border: 1px solid; font-weight: 600; }
.zone-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.keyboard { display: flex; flex-direction: column; gap: 4px; margin-bottom: 0.5rem; }
.kb-row { display: flex; gap: 4px; justify-content: center; }
.kb-key { display: flex; flex-direction: column; align-items: center; padding: 6px 10px; border-radius: 6px; min-width: 52px; min-height: 52px; background: #f8f9fa; border: 1px solid #ddd; cursor: default; }
.kb-keycap { font-size: 1rem; font-weight: 700; color: #333; }
.kb-rads { font-size: 0.6rem; color: #888; line-height: 1.2; text-align: center; margin-top: 2px; }
.zone-1 { background: #e8f5e9; border-color: #c8e6c9; }
.zone-2 { background: #e3f2fd; border-color: #bbdefb; }
.zone-3 { background: #fff3e0; border-color: #ffe0b2; }
.zone-4 { background: #f3e5f5; border-color: #e1bee7; }
.zone-5 { background: #fbe9e7; border-color: #ffccbc; }
.kb-hint { font-size: 0.78rem; color: #999; text-align: center; margin-top: 0.3rem; }
.practice-stats { display: flex; gap: 0.8rem; justify-content: center; background: #fff; border-radius: 12px; padding: 0.8rem; box-shadow: 0 2px 8px rgba(0,0,0,.05); margin-bottom: 1rem; flex-wrap: wrap; }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
.stat-label { font-size: 0.75rem; color: #999; }
.stat-val { font-size: 1rem; font-weight: 700; color: #333; }
.stat-val.good { color: #2e7d32; } .stat-val.ok { color: #e65100; } .stat-val.bad { color: #c62828; }
.practice-area { text-align: center; }
.practice-char { font-size: 5rem; font-weight: 700; color: #333; margin: 0.5rem 0; line-height: 1.2; }
.practice-hint { font-size: 0.85rem; color: #888; margin-bottom: 1rem; }
.practice-input-row { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.8rem; }
.practice-input { max-width: 200px; text-align: center; font-family: monospace; font-size: 1.2rem; text-transform: uppercase; }
.btn { padding: 0.6rem 1.2rem; background: #667eea; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; white-space: nowrap; }
.btn:hover { background: #5a6fd6; }
.btn-skip { background: #999; }
.btn-start { padding: 0.8rem 2rem; font-size: 1rem; }
.feedback { padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem; margin-bottom: 0.5rem; }
.correct { background: #e8f5e9; color: #2e7d32; }
.wrong { background: #fbe9e7; color: #c62828; }
.practice-start { text-align: center; padding: 2rem 0; }
.history { margin-top: 1rem; }
.history-title { font-size: 0.85rem; color: #999; margin-bottom: 0.5rem; }
.history-item { display: flex; gap: 0.5rem; align-items: center; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.85rem; margin: 0.2rem 0; }
.h-correct { background: #f1f8e9; }
.h-wrong { background: #fbe9e7; }
.h-char { font-size: 1rem; font-weight: 600; min-width: 1.5rem; text-align: center; }
.h-code { font-family: monospace; font-weight: 600; color: #667eea; min-width: 3rem; }
.h-result { font-weight: 700; min-width: 1rem; }
.h-correct-code { color: #c62828; font-family: monospace; font-weight: 600; }
.diff-tabs { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
.diff-tabs button { padding: 0.4rem 1rem; border: 1px solid #ddd; background: #fff; border-radius: 20px; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem; }
.diff-tabs .active { background: #667eea; color: #fff; border-color: #667eea; }
.diff-tabs .active .badge { background: rgba(255,255,255,0.3); color: #fff; }
.badge { font-size: 0.7rem; padding: 0.05rem 0.4rem; border-radius: 8px; background: #eef2ff; color: #667eea; }
.char-table { display: grid; gap: 2px; }
.char-row { display: flex; gap: 1rem; align-items: center; padding: 0.4rem 0.8rem; background: #fff; border-radius: 6px; cursor: pointer; transition: background 0.1s; }
.char-row:hover { background: #eef2ff; }
.ct-char { font-size: 1.2rem; font-weight: 600; color: #333; min-width: 2rem; text-align: center; }
.ct-code { font-family: monospace; font-weight: 600; color: #667eea; min-width: 80px; font-size: 0.9rem; }
.ct-exp { font-size: 0.8rem; color: #888; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (prefers-color-scheme: dark) {
  .main-tabs button, .sub-tabs button, .diff-tabs button { background: #1a1a2e; border-color: #333; color: #aaa; }
  .main-tabs .active, .sub-tabs .active, .diff-tabs .active { background: #667eea; color: #fff; border-color: #667eea; }
  .input, .result-card, .practice-stats { background: #1a1a2e; color: #eee; border-color: #333; }
  .big-char, .cc-char, .practice-char, .ct-char, .h-char, .h-code, .stat-val { color: #eee; }
  .kb-key { background: #2a2a3e; border-color: #444; }
  .kb-keycap { color: #ddd; }
  .zone-1 { background: #1b3d1b; border-color: #2e5e2e; }
  .zone-2 { background: #1a2e4e; border-color: #2a4e6e; }
  .zone-3 { background: #3d2e1b; border-color: #5e4e2e; }
  .zone-4 { background: #2a1a3e; border-color: #4a2e5e; }
  .zone-5 { background: #3d1b1b; border-color: #5e2e2e; }
  .code-char-item { background: #2a2a4e; }
  .code-char-item:hover { background: #3a3a6e; }
  .char-row { background: #1a1a2e; }
  .char-row:hover { background: #252545; }
  .h-correct { background: #1b3d1b; }
  .h-wrong { background: #3d1b1b; }
  .alt-codes { border-top-color: #333; }
  .code-info strong { color: #8899ff; }
  .lvl1 { background: #1b3d1b; color: #81c784; }
  .lvl2 { background: #1a2e4e; color: #64b5f6; }
  .lvl3 { background: #3d2e1b; color: #ffb74d; }
  .lvl4 { background: #3d1b1b; color: #e57373; }
}
</style>
