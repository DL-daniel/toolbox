<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import cities, { REGION_META, type CityInfo } from '@/utils/worldCities'

const { t, locale } = useI18nt()

const now = ref(new Date())
const searchQuery = ref('')
const selectedIds = ref<string[]>([])
const mode = ref<'realtime' | 'manual'>('realtime')
const manualTimeStr = ref('')

const timer = ref<ReturnType<typeof setInterval> | null>(null)

// Load saved selection and mode from localStorage
onMounted(() => {
  try {
    const saved = localStorage.getItem('worldClock_selected')
    if (saved) selectedIds.value = JSON.parse(saved)
    const savedMode = localStorage.getItem('worldClock_mode')
    if (savedMode === 'realtime' || savedMode === 'manual') mode.value = savedMode
  } catch { /* ignore */ }
  startRealtime()
})

onUnmounted(() => {
  stopRealtime()
})

function updateNow() {
  now.value = new Date()
}

function startRealtime() {
  updateNow()
  if (timer.value) clearInterval(timer.value)
  timer.value = setInterval(updateNow, 1000)
}

function stopRealtime() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function switchToRealtime() {
  mode.value = 'realtime'
  localStorage.setItem('worldClock_mode', 'realtime')
  startRealtime()
}

function switchToManual() {
  mode.value = 'manual'
  localStorage.setItem('worldClock_mode', 'manual')
  // Initialize manual time to current moment
  const d = new Date()
  manualTimeStr.value = datetimeLocal(d)
  stopRealtime()
}

function datetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// The effective reference time: real-time or manual
const referenceTime = computed(() => {
  if (mode.value === 'manual' && manualTimeStr.value) {
    const d = new Date(manualTimeStr.value)
    return isNaN(d.getTime()) ? now.value : d
  }
  return now.value
})

function toggleCity(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
  localStorage.setItem('worldClock_selected', JSON.stringify(selectedIds.value))
}

function clearAll() {
  selectedIds.value = []
  localStorage.removeItem('worldClock_selected')
}

function selectAll() {
  selectedIds.value = filteredCities.value.map(c => c.id)
  localStorage.setItem('worldClock_selected', JSON.stringify(selectedIds.value))
}

// Group all cities by region
const regionOrder = [
  'eastAsia', 'southeastAsia', 'southAsia', 'middleEast',
  'europeWest', 'europeCentral', 'europeEast',
  'northAmericaEast', 'northAmericaCentral', 'northAmericaWest',
  'southAmerica', 'oceania', 'africa',
]

const filteredCities = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return cities
  return cities.filter(c =>
    c.nameZh.includes(q) ||
    c.nameEn.toLowerCase().includes(q)
  )
})

const groupedCities = computed(() => {
  const map = new Map<string, CityInfo[]>()
  for (const region of regionOrder) {
    const list = filteredCities.value.filter(c => c.region === region)
    if (list.length > 0) map.set(region, list)
  }
  return map
})

const selectedCities = computed(() => {
  return selectedIds.value
    .map(id => cities.find(c => c.id === id)!)
    .filter(Boolean)
})

function formatTime(tz: string): string {
  try {
    return referenceTime.value.toLocaleTimeString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return '--:--:--'
  }
}

function formatDate(tz: string): string {
  try {
    return referenceTime.value.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'zh-CN', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '---'
  }
}

function getUtcOffset(tz: string): number | null {
  const ref = referenceTime.value
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(ref)
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || ''
    const match = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/)
    if (!match) return null
    const sign = match[1] === '+' ? 1 : -1
    const hours = parseInt(match[2], 10)
    const minutes = parseInt(match[3] || '0', 10)
    return sign * (hours + minutes / 60)
  } catch {
    return null
  }
}

function getOffsetString(tz: string): string {
  const offset = getUtcOffset(tz)
  if (offset === null) return ''
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(referenceTime.value)
    const shortName = parts.find(p => p.type === 'timeZoneName')?.value?.replace('GMT', 'UTC') || ''
    if (shortName) return shortName
    const sign = offset >= 0 ? '+' : ''
    return `UTC${sign}${offset.toFixed(1).replace('.0', '')}`
  } catch {
    return ''
  }
}

function timeDiff(tz: string): string {
  const targetOffset = getUtcOffset(tz)
  if (targetOffset === null) return ''
  // Get local UTC offset
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const localOffset = getUtcOffset(localTz) ?? 0
  const diff = Math.round(targetOffset - localOffset)
  if (diff === 0) return '±0'
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff}h`
}
</script>

<template>
  <div class="world-clock">
    <!-- Search & Controls -->
    <!-- Mode toggle -->
    <div class="mode-bar">
      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ active: mode === 'realtime' }"
          @click="switchToRealtime"
        >
          🕐 {{ t('worldClock.realtime') }}
        </button>
        <button
          class="mode-btn"
          :class="{ active: mode === 'manual' }"
          @click="switchToManual"
        >
          ✏️ {{ t('worldClock.manual') }}
        </button>
      </div>
      <input
        v-if="mode === 'manual'"
        v-model="manualTimeStr"
        type="datetime-local"
        class="manual-time-input"
      />
      <span v-else class="live-indicator">● {{ t('worldClock.live') }}</span>
    </div>

    <div class="controls">
      <input
        v-model="searchQuery"
        :placeholder="t('worldClock.searchPlaceholder')"
        class="search-input"
      />
      <div class="action-buttons">
        <button class="btn btn-sm" @click="selectAll" :disabled="filteredCities.length === 0">
          {{ t('worldClock.selectAll') }}
        </button>
        <button class="btn btn-sm" @click="clearAll" :disabled="selectedIds.length === 0">
          {{ t('worldClock.clearAll') }}
        </button>
      </div>
    </div>

    <div class="main-layout">
      <!-- Left: City picker -->
      <div class="city-picker">
        <div v-for="[region, regionCities] in groupedCities" :key="region" class="region-group">
          <div class="region-title">
            {{ locale === 'en' ? REGION_META[region]?.nameEn : REGION_META[region]?.nameZh }}
            <span class="region-count">{{ regionCities.length }}</span>
          </div>
          <div class="city-list">
            <div
              v-for="city in regionCities"
              :key="city.id"
              class="city-item"
              :class="{ selected: selectedIds.includes(city.id) }"
              @click="toggleCity(city.id)"
            >
              <span class="city-checkbox">
                <span v-if="selectedIds.includes(city.id)" class="check-mark">✓</span>
              </span>
              <span class="city-name">{{ locale === 'en' ? city.nameEn : city.nameZh }}</span>
              <span class="city-offset">{{ getOffsetString(city.timezone) }}</span>
            </div>
          </div>
        </div>
        <div v-if="filteredCities.length === 0" class="no-results">
          {{ t('worldClock.noResults') }}
        </div>
      </div>

      <!-- Right: Selected clocks -->
      <div class="clock-board">
        <div v-if="selectedCities.length === 0" class="empty-state">
          <div class="empty-icon">🕐</div>
          <p>{{ t('worldClock.emptyHint') }}</p>
        </div>
        <div v-else class="clock-grid">
          <div v-for="city in selectedCities" :key="city.id" class="clock-card">
            <button class="card-remove" @click="toggleCity(city.id)" :title="t('common.remove')">×</button>
            <div class="card-city">{{ locale === 'en' ? city.nameEn : city.nameZh }}</div>
            <div class="card-time">{{ formatTime(city.timezone) }}</div>
            <div class="card-date">{{ formatDate(city.timezone) }}</div>
            <div class="card-meta">
              <span class="card-offset">{{ getOffsetString(city.timezone) }}</span>
              <span class="card-diff">{{ timeDiff(city.timezone) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.world-clock {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.mode-toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.mode-btn {
  padding: 0.4rem 0.85rem;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
  color: #666;
}
.mode-btn:first-child {
  border-right: 1px solid #eee;
}
.mode-btn:hover {
  background: #f5f8ff;
}
.mode-btn.active {
  background: #4a90d9;
  color: white;
  font-weight: 600;
}

.manual-time-input {
  padding: 0.4rem 0.75rem;
  border: 1px solid #4a90d9;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  font-family: 'SF Mono', 'Consolas', monospace;
  color: #333;
}
.manual-time-input:focus {
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15);
}

.live-indicator {
  font-size: 0.8rem;
  color: #4caf50;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.6rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.btn:hover:not(:disabled) {
  border-color: #4a90d9;
  color: #4a90d9;
}
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  gap: 0.4rem;
}

.main-layout {
  display: flex;
  gap: 1.5rem;
  min-height: 500px;
}

/* Left panel - city picker */
.city-picker {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  max-height: 65vh;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 0.5rem;
  background: #fafafa;
}

.region-group {
  margin-bottom: 0.5rem;
}

.region-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.4rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.region-count {
  background: #e8e8e8;
  border-radius: 10px;
  padding: 0 0.5rem;
  font-size: 0.7rem;
  color: #999;
  line-height: 1.6;
}

.city-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.city-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.9rem;
}
.city-item:hover {
  background: #eef5ff;
}
.city-item.selected {
  background: #dce9fa;
  color: #2a6ec9;
}

.city-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.selected .city-checkbox {
  border-color: #4a90d9;
  background: #4a90d9;
  color: white;
}
.check-mark {
  font-size: 0.7rem;
  font-weight: bold;
}

.city-name {
  flex: 1;
}

.city-offset {
  font-size: 0.75rem;
  color: #999;
  font-family: 'SF Mono', 'Cascadia Code', monospace;
}

.no-results {
  text-align: center;
  color: #999;
  padding: 2rem 1rem;
  font-size: 0.9rem;
}

/* Right panel - clock board */
.clock-board {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #ccc;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.empty-state p {
  font-size: 1rem;
}

.clock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.clock-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.2s;
}
.clock-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-remove {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: transparent;
  color: #ccc;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}
.card-remove:hover {
  background: #fee;
  color: #e44;
}

.card-city {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.3rem;
}

.card-time {
  font-size: 1.8rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  color: #1a1a1a;
  letter-spacing: 1px;
}

.card-date {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.2rem;
}

.card-meta {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: #aaa;
  font-family: 'SF Mono', 'Cascadia Code', monospace;
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  .city-picker {
    width: 100%;
    max-height: 300px;
  }
  .clock-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
