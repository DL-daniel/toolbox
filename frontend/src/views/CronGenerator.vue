<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import UsageGuide from '@/components/UsageGuide.vue'

const { t } = useI18nt()

// --- Presets ---
const presets = [
  { label: 'cronTool.presetMin', expr: '* * * * *' },
  { label: 'cronTool.preset5min', expr: '*/5 * * * *' },
  { label: 'cronTool.presetHourly', expr: '0 * * * *' },
  { label: 'cronTool.presetDaily', expr: '0 0 * * *' },
  { label: 'cronTool.presetDaily9', expr: '0 9 * * *' },
  { label: 'cronTool.presetWeeklyMon', expr: '0 0 * * 1' },
  { label: 'cronTool.presetMonthly', expr: '0 0 1 * *' },
  { label: 'cronTool.presetCustom', expr: '' },
]

const selectedPreset = ref(presets[0].expr)
const customMinute = ref('*')
const customHour = ref('*')
const customDayOfMonth = ref('*')
const customMonth = ref('*')
const customDayOfWeek = ref('*')

// --- Derived expression ---
const cronExpr = computed(() => {
  if (selectedPreset.value === '') {
    // Custom mode
    return `${customMinute.value} ${customHour.value} ${customDayOfMonth.value} ${customMonth.value} ${customDayOfWeek.value}`.trim()
  }
  return selectedPreset.value
})

// --- Validation ---
function validateField(value: string, min: number, max: number): boolean {
  if (!value || value === '*') return true
  const parts = value.split(',')
  return parts.every(p => {
    p = p.trim()
    if (!p) return false
    // */n or range
    const stepMatch = p.match(/^\*\/(\d+)$/)
    if (stepMatch) {
      const n = parseInt(stepMatch[1])
      return n >= 1 && n <= max
    }
    const rangeMatch = p.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const a = parseInt(rangeMatch[1]), b = parseInt(rangeMatch[2])
      return a >= min && a <= max && b >= min && b <= max && a <= b
    }
    // plain number
    if (/^\d+$/.test(p)) {
      const n = parseInt(p)
      return n >= min && n <= max
    }
    return false
  })
}

const validationErrors = computed(() => {
  if (selectedPreset.value !== '') return []
  const errors: string[] = []
  if (!validateField(customMinute.value, 0, 59)) errors.push('Minute')
  if (!validateField(customHour.value, 0, 23)) errors.push('Hour')
  if (!validateField(customDayOfMonth.value, 1, 31)) errors.push('DayOfMonth')
  if (!validateField(customMonth.value, 1, 12)) errors.push('Month')
  if (!validateField(customDayOfWeek.value, 0, 7)) errors.push('DayOfWeek')
  return errors
})

const isValid = computed(() => validationErrors.value.length === 0)

// --- Human-readable description ---
const cronDescription = computed(() => {
  const parts = cronExpr.value.split(/\s+/)
  if (parts.length !== 5) return t('cronTool.invalidExpr')

  const [min, hour, dom, mon, dow] = parts

  const minTxt = min === '*' ? t('cronTool.every') : min
  const hourTxt = hour === '*' ? t('cronTool.every') : hour

  if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') return t('cronTool.descEveryMin')

  // Common patterns
  if (min === '0' && hour === '*' && dom === '*' && mon === '*' && dow === '*') return t('cronTool.descEveryHour')
  if (min === '0' && hour !== '*' && dom === '*' && mon === '*' && dow === '*') return t('cronTool.descDailyAt').replace('{time}', `${hour.padStart(2, '0')}:00`)
  if (min !== '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') return t('cronTool.descEveryHourAt').replace('{min}', min)

  if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow === '*') return t('cronTool.descDailyMidnight')
  if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow !== '*') return t('cronTool.descWeekly').replace('{dow}', dow)
  if (min === '0' && hour === '0' && dom !== '*' && mon === '*' && dow === '*') return t('cronTool.descMonthly').replace('{dom}', dom)

  // Fallback
  return `${t('cronTool.minute')}: ${minTxt}, ${t('cronTool.hour')}: ${hourTxt}, ${t('cronTool.dom')}: ${dom}, ${t('cronTool.month')}: ${mon}, ${t('cronTool.dow')}: ${dow}`
})

// --- Apply preset ---
function applyPreset(expr: string) {
  selectedPreset.value = expr
}

// --- Copy ---
const copied = ref(false)
async function copyExpr() {
  try {
    await navigator.clipboard.writeText(cronExpr.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch { /* */ }
}

// --- Common examples ---
interface CronExample {
  expr: string
  descKey: string
  categoryKey: string
}

const examples: CronExample[] = [
  { expr: '*/10 * * * *',    descKey: 'cronTool.exDesc10m',    categoryKey: 'cronTool.catFreq' },
  { expr: '*/30 * * * *',    descKey: 'cronTool.exDesc30m',    categoryKey: 'cronTool.catFreq' },
  { expr: '0 */2 * * *',     descKey: 'cronTool.exDesc2h',     categoryKey: 'cronTool.catFreq' },
  { expr: '0 */6 * * *',     descKey: 'cronTool.exDesc6h',     categoryKey: 'cronTool.catFreq' },
  { expr: '0 9,18 * * *',    descKey: 'cronTool.exDescTwice',  categoryKey: 'cronTool.catDaily' },
  { expr: '30 4 * * *',      descKey: 'cronTool.exDesc430',    categoryKey: 'cronTool.catDaily' },
  { expr: '0 0 * * 0',       descKey: 'cronTool.exDescSun',    categoryKey: 'cronTool.catWeekly' },
  { expr: '0 0 * * 1-5',     descKey: 'cronTool.exDescWday',   categoryKey: 'cronTool.catWeekly' },
  { expr: '0 9 * * 1-5',     descKey: 'cronTool.exDescWday9',  categoryKey: 'cronTool.catWeekly' },
  { expr: '*/30 9-17 * * 1-5', descKey: 'cronTool.exDescWork', categoryKey: 'cronTool.catWeekly' },
  { expr: '0 0 1 */3 *',     descKey: 'cronTool.exDescQuarter',categoryKey: 'cronTool.catMonthly' },
  { expr: '0 0 1 1 *',       descKey: 'cronTool.exDescYearly', categoryKey: 'cronTool.catMonthly' },
]

const exampleCategories = computed(() => {
  const cats: { key: string; items: CronExample[] }[] = []
  const seen = new Set<string>()
  for (const ex of examples) {
    if (!seen.has(ex.categoryKey)) {
      seen.add(ex.categoryKey)
      cats.push({ key: ex.categoryKey, items: examples.filter(e => e.categoryKey === ex.categoryKey) })
    }
  }
  return cats
})

function applyExample(expr: string) {
  // Switch to custom mode and fill fields
  selectedPreset.value = ''
  const parts = expr.split(/\s+/)
  if (parts.length === 5) {
    customMinute.value = parts[0]
    customHour.value = parts[1]
    customDayOfMonth.value = parts[2]
    customMonth.value = parts[3]
    customDayOfWeek.value = parts[4]
  }
}
</script>

<template>
  <div class="cron-tool">
    <h1>{{ t('cronTool.title') }}</h1>
    <p class="desc">{{ t('cronTool.desc') }}</p>

    <!-- Presets -->
    <section class="section">
      <h3>{{ t('cronTool.presets') }}</h3>
      <div class="preset-grid">
        <button
          v-for="p in presets"
          :key="p.expr"
          :class="['preset-btn', { active: selectedPreset === p.expr }]"
          @click="applyPreset(p.expr)"
        >
          {{ t(p.label) }}
        </button>
      </div>
    </section>

    <!-- Custom fields (visible only in Custom mode) -->
    <section v-if="selectedPreset === ''" class="section">
      <h3>{{ t('cronTool.customFields') }}</h3>
      <div class="fields-grid">
        <div class="field-group">
          <label>{{ t('cronTool.minute') }} <span class="field-hint">(0-59, */n)</span></label>
          <input v-model="customMinute" type="text" :class="{ invalid: !validateField(customMinute, 0, 59) }" />
        </div>
        <div class="field-group">
          <label>{{ t('cronTool.hour') }} <span class="field-hint">(0-23, */n)</span></label>
          <input v-model="customHour" type="text" :class="{ invalid: !validateField(customHour, 0, 23) }" />
        </div>
        <div class="field-group">
          <label>{{ t('cronTool.dom') }} <span class="field-hint">(1-31)</span></label>
          <input v-model="customDayOfMonth" type="text" :class="{ invalid: !validateField(customDayOfMonth, 1, 31) }" />
        </div>
        <div class="field-group">
          <label>{{ t('cronTool.month') }} <span class="field-hint">(1-12)</span></label>
          <input v-model="customMonth" type="text" :class="{ invalid: !validateField(customMonth, 1, 12) }" />
        </div>
        <div class="field-group">
          <label>{{ t('cronTool.dow') }} <span class="field-hint">(0-7, 0=Sun)</span></label>
          <input v-model="customDayOfWeek" type="text" :class="{ invalid: !validateField(customDayOfWeek, 0, 7) }" />
        </div>
      </div>
    </section>

    <!-- Result -->
    <section class="section result-section">
      <h3>{{ t('cronTool.result') }}</h3>
      <div :class="['expr-box', { 'expr-invalid': !isValid }]">
        <code class="expr-text">{{ cronExpr }}</code>
        <button class="btn btn-copy" @click="copyExpr" :disabled="!isValid">
          {{ copied ? t('cronTool.copied') : t('cronTool.copy') }}
        </button>
      </div>
      <p v-if="isValid" class="desc-text">{{ cronDescription }}</p>
      <p v-else class="error-text">{{ t('cronTool.fieldErrors') }}</p>
    </section>

    <!-- Help notes -->
    <section class="section help-section">
      <details>
        <summary>{{ t('cronTool.helpTitle') }}</summary>
        <div class="help-table">
          <div class="help-row"><span class="help-field">*</span><span>{{ t('cronTool.helpAny') }}</span></div>
          <div class="help-row"><span class="help-field">,</span><span>{{ t('cronTool.helpList') }}</span></div>
          <div class="help-row"><span class="help-field">-</span><span>{{ t('cronTool.helpRange') }}</span></div>
          <div class="help-row"><span class="help-field">*/n</span><span>{{ t('cronTool.helpStep') }}</span></div>
        </div>
      </details>
    </section>

    <!-- Examples -->
    <section class="section examples-section">
      <h3>{{ t('cronTool.examples') }}</h3>
      <div v-for="cat in exampleCategories" :key="cat.key" class="example-category">
        <h4>{{ t(cat.key) }}</h4>
        <div class="example-list">
          <div v-for="ex in cat.items" :key="ex.expr" class="example-row">
            <code class="example-expr">{{ ex.expr }}</code>
            <span class="example-desc">{{ t(ex.descKey) }}</span>
            <button class="btn-use" @click="applyExample(ex.expr)">{{ t('cronTool.use') }}</button>
          </div>
        </div>
      </div>
    </section>
  </div>

    <UsageGuide toolKey="cronGenerator" />
  </template>

<style scoped>
.cron-tool {
  max-width: 680px;
  margin: 0 auto;
  padding: 1rem;
}

h1 { margin-bottom: 0.3rem; }
.desc { color: #666; margin-bottom: 1.5rem; }

.section {
  margin-bottom: 1.5rem;
}

.section h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
  color: #444;
}

/* Presets */
.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.preset-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background: #fff;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  color: #333;
}

.preset-btn:hover {
  border-color: #4a90d9;
  background: #f0f6ff;
}

.preset-btn.active {
  border-color: #4a90d9;
  background: #4a90d9;
  color: #fff;
  font-weight: 500;
}

/* Custom fields */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.25rem;
}

.field-hint {
  font-weight: 400;
  color: #999;
}

.field-group input {
  padding: 0.45rem 0.6rem;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'SF Mono', 'Consolas', monospace;
  outline: none;
  transition: border-color 0.15s;
}

.field-group input:focus {
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.15);
}

.field-group input.invalid {
  border-color: #d32f2f;
}

/* Result */
.result-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.expr-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
}

.expr-box.expr-invalid {
  border-color: #e2e8f0;
  opacity: 0.6;
}

.expr-text {
  flex: 1;
  font-size: 1.15rem;
  font-family: 'SF Mono', 'Consolas', monospace;
  color: #1a1a2e;
  letter-spacing: 0.06em;
  word-break: break-all;
}

.btn-copy {
  padding: 0.35rem 0.8rem;
  border: 1px solid #d0d5dd;
  border-radius: 5px;
  background: #fff;
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn-copy:hover:not(:disabled) {
  background: #4a90d9;
  color: #fff;
  border-color: #4a90d9;
}

.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.desc-text {
  margin-top: 0.6rem;
  font-size: 0.88rem;
  color: #4a90d9;
  font-weight: 500;
}

.error-text {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  color: #d32f2f;
}

/* Help */
.help-section details {
  cursor: pointer;
}

.help-section summary {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.help-table {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
}

.help-row {
  display: flex;
  gap: 1rem;
  font-size: 0.82rem;
  color: #555;
}

.help-field {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-weight: 600;
  min-width: 3rem;
  color: #4a90d9;
}

/* Examples */
.examples-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafbfc;
}

.example-category {
  margin-bottom: 0.8rem;
}

.example-category:last-child {
  margin-bottom: 0;
}

.example-category h4 {
  font-size: 0.82rem;
  font-weight: 600;
  color: #777;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.example-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 5px;
  transition: background 0.12s;
}

.example-row:hover {
  background: #f0f4ff;
}

.example-expr {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.85rem;
  color: #4a90d9;
  font-weight: 600;
  min-width: 9rem;
  letter-spacing: 0.04em;
}

.example-desc {
  flex: 1;
  font-size: 0.82rem;
  color: #555;
}

.btn-use {
  padding: 0.2rem 0.5rem;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  background: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  color: #666;
  transition: all 0.12s;
  white-space: nowrap;
}

.btn-use:hover {
  border-color: #4a90d9;
  background: #4a90d9;
  color: #fff;
}

@media (prefers-color-scheme: dark) {
  .cron-tool { color: #e0e0e0; }
  .desc { color: #aaa; }
  .section h3 { color: #ccc; }
  .preset-btn {
    background: #2a2a3a;
    border-color: #3a3a4a;
    color: #ccc;
  }
  .preset-btn:hover {
    border-color: #5a8ed9;
    background: #2a3250;
  }
  .preset-btn.active {
    background: #4a90d9;
    border-color: #4a90d9;
    color: #fff;
  }
  .field-group label { color: #bbb; }
  .field-hint { color: #777; }
  .field-group input {
    background: #1e1e2e;
    border-color: #3a3a4a;
    color: #e0e0e0;
  }
  .field-group input:focus {
    border-color: #4a90d9;
    box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.25);
  }
  .result-section {
    background: #1a1a2a;
    border-color: #2a2a3a;
  }
  .expr-box {
    background: #1e1e2e;
    border-color: #3a3a4a;
  }
  .expr-text { color: #e0e0e0; }
  .btn-copy {
    background: #2a2a3a;
    border-color: #3a3a4a;
    color: #ccc;
  }
  .btn-copy:hover:not(:disabled) {
    background: #4a90d9;
    border-color: #4a90d9;
    color: #fff;
  }
  .desc-text { color: #5a9ef0; }
  .help-section summary { color: #aaa; }
  .help-row { color: #aaa; }
  .help-field { color: #5a9ef0; }
  .examples-section {
    border-color: #2a2a3a;
    background: #1a1a2a;
  }
  .example-category h4 { color: #888; }
  .example-row:hover { background: #242438; }
  .example-expr { color: #5a9ef0; }
  .example-desc { color: #aaa; }
  .btn-use {
    background: #2a2a3a;
    border-color: #3a3a4a;
    color: #aaa;
  }
  .btn-use:hover {
    border-color: #5a8ed9;
    background: #4a90d9;
    color: #fff;
  }
}
</style>
