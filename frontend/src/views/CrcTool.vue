<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'

const { t } = useI18nt()

const input = ref('')
const inputMode = ref<'text' | 'hex'>('text')
const outputFormat = ref<'hex' | 'dec'>('hex')
const hexParseError = ref('')

// --------------- Pure CRC implementations (no Node.js Buffer) ---------------
function hexToBytes(s: string): { bytes: number[]; error: string } {
  const raw = s.replace(/[\s,]+/g, '')
  if (!raw) return { bytes: [], error: '' }
  if (!/^[0-9a-fA-F]*$/.test(raw)) return { bytes: [], error: t('crcTool.hexInvalid') }
  if (raw.length % 2 !== 0) return { bytes: [], error: t('crcTool.hexOddLength') }
  const bytes: number[] = []
  for (let i = 0; i < raw.length; i += 2) {
    bytes.push(parseInt(raw.substring(i, i + 2), 16))
  }
  return { bytes, error: '' }
}

function textToBytes(s: string): number[] {
  const out: number[] = []
  for (let i = 0; i < s.length; i++) {
    let cp = s.charCodeAt(i)
    if (cp < 0x80) { out.push(cp); continue }
    if (cp < 0x800) { out.push(0xc0 | (cp >> 6)); out.push(0x80 | (cp & 0x3f)); continue }
    if (cp < 0xd800 || cp >= 0xe000) {
      out.push(0xe0 | (cp >> 12)); out.push(0x80 | ((cp >> 6) & 0x3f)); out.push(0x80 | (cp & 0x3f)); continue
    }
    i++; const cp2 = s.charCodeAt(i)
    cp = 0x10000 + ((cp & 0x3ff) << 10) + (cp2 & 0x3ff)
    out.push(0xf0 | (cp >> 18)); out.push(0x80 | ((cp >> 12) & 0x3f))
    out.push(0x80 | ((cp >> 6) & 0x3f)); out.push(0x80 | (cp & 0x3f))
  }
  return out
}

function makeTable(poly: number, width: number): number[] {
  const table: number[] = []
  const msb = 1 << (width - 1)
  const mask = (1 << width) - 1
  for (let i = 0; i < 256; i++) {
    let crc = i << (width - 8)
    for (let j = 0; j < 8; j++) {
      if (crc & msb) crc = ((crc << 1) ^ poly) & mask
      else crc = (crc << 1) & mask
    }
    table.push(crc)
  }
  return table
}

function crcReflected(table: number[], bytes: number[], init: number, xorOut: number): number {
  let crc = init
  for (const b of bytes) {
    crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ xorOut) >>> 0
}

function crcNormal(table: number[], bytes: number[], _width: number, init: number, xorOut: number): number {
  const mask = (1 << _width) - 1
  let crc = init
  for (const b of bytes) {
    crc = ((crc << 8) ^ table[((crc >> (_width - 8)) ^ b) & 0xff]) & mask
  }
  return (crc ^ xorOut) >>> 0
}

// CRC-1 (parity)
function crc1Calc(bytes: number[]): number {
  let v = 0
  for (const b of bytes) {
    v ^= b
    for (let i = 0; i < 8; i++) { v = (v >> 1) ^ (v & 1 ? 0x80 : 0) }
  }
  return v & 1
}

const t8_reflected  = makeTable(0x8c, 8)     // poly 0x31 reflected
const t16_reflected = makeTable(0xa001, 16)  // poly 0x8005 reflected
const t16_ccitt_ref = makeTable(0x8408, 16)  // poly 0x1021 reflected
const t32_reflected = makeTable(0xedb88320, 32) // poly 0x04C11DB7 reflected

const t8_dvbs2       = makeTable(0xd5, 8)
const t16_xmodem     = makeTable(0x1021, 16)
const t24_normal     = makeTable(0x864cfb, 24)
const t32_normal     = makeTable(0x04c11db7, 32)

interface CrcDef {
  fn: (bytes: number[]) => number
  name: string
  labelKey: string
  bits: number
  alias: string
}

const algorithms: CrcDef[] = [
  { fn: (b) => crc1Calc(b),                                              name: 'CRC-1',        labelKey: 'crcTool.alg1',       bits: 1,  alias: 'Parity' },
  { fn: (b) => crcReflected(t8_reflected, b, 0x00, 0x00),               name: 'CRC-8',        labelKey: 'crcTool.alg8',       bits: 8,  alias: 'ITU' },
  { fn: (b) => crcReflected(t8_reflected, b, 0xFF, 0x00),               name: 'CRC-8/1-Wire', labelKey: 'crcTool.alg81wire',  bits: 8,  alias: 'MAXIM' },
  { fn: (b) => crcNormal(t8_dvbs2, b, 8, 0x00, 0x00),                   name: 'CRC-8/DVB-S2', labelKey: 'crcTool.alg8dvbs2',  bits: 8,  alias: 'DVB-S2' },
  { fn: (b) => crcReflected(t16_reflected, b, 0x0000, 0x0000),          name: 'CRC-16',       labelKey: 'crcTool.alg16',      bits: 16, alias: 'IBM ARC' },
  { fn: (b) => crcReflected(t16_ccitt_ref, b, 0xFFFF, 0x0000),          name: 'CRC-16/CCITT', labelKey: 'crcTool.alg16ccitt', bits: 16, alias: 'CCITT' },
  { fn: (b) => crcReflected(t16_ccitt_ref, b, 0x0000, 0x0000),          name: 'CRC-16/KERMIT',labelKey: 'crcTool.alg16kermit',bits: 16, alias: 'KERMIT' },
  { fn: (b) => crcReflected(t16_reflected, b, 0xFFFF, 0x0000),          name: 'CRC-16/MODBUS',labelKey: 'crcTool.alg16modbus',bits: 16, alias: 'MODBUS' },
  { fn: (b) => crcNormal(t16_xmodem, b, 16, 0x0000, 0x0000),            name: 'CRC-16/XMODEM',labelKey: 'crcTool.alg16xmodem',bits: 16, alias: 'XMODEM' },
  { fn: (b) => crcNormal(t24_normal, b, 24, 0x000000, 0x000000),        name: 'CRC-24',       labelKey: 'crcTool.alg24',      bits: 24, alias: '' },
  { fn: (b) => crcNormal(t32_normal, b, 32, 0xFFFFFFFF, 0xFFFFFFFF),    name: 'CRC-32',       labelKey: 'crcTool.alg32',      bits: 32, alias: 'ISO/IEC 802-3' },
  { fn: (b) => crcNormal(t32_normal, b, 32, 0xFFFFFFFF, 0x00000000),    name: 'CRC-32/MPEG-2',labelKey: 'crcTool.alg32mpeg',  bits: 32, alias: 'MPEG-2' },
  { fn: (b) => crcReflected(t32_reflected, b, 0xFFFFFFFF, 0xFFFFFFFF),  name: 'CRC-32/JAM',   labelKey: 'crcTool.alg32jam',   bits: 32, alias: 'BZIP2' },
]

const bitGroups = computed(() => {
  const groups: { bits: number; label: string; algs: CrcDef[] }[] = []
  const seen = new Set<number>()
  for (const alg of algorithms) {
    if (!seen.has(alg.bits)) {
      seen.add(alg.bits)
      groups.push({ bits: alg.bits, label: `CRC-${alg.bits}`, algs: algorithms.filter(a => a.bits === alg.bits) })
    }
  }
  return groups
})

interface CrcResult { alg: CrcDef; hex: string; dec: string }

const results = ref<CrcResult[]>([])

function formatHex(val: number, bits: number): string {
  return val.toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0')
}

const currentBytes = computed(() => {
  if (inputMode.value === 'hex') {
    const r = hexToBytes(input.value)
    hexParseError.value = r.error
    return r.bytes
  }
  return textToBytes(input.value)
})

const byteCount = computed(() => currentBytes.value.length)

function compute() {
  if (!input.value || (inputMode.value === 'hex' && hexParseError.value)) {
    results.value = []; return
  }
  const bytes = currentBytes.value
  if (!bytes.length) { results.value = []; return }
  results.value = algorithms.map(alg => {
    const val = alg.fn(bytes)
    return { alg, hex: formatHex(val, alg.bits), dec: String(val) }
  })
}

watch(input, compute)

const copiedIndex = ref<number | null>(null)

async function copyResult(index: number) {
  const res = results.value[index]
  if (!res) return
  const text = outputFormat.value === 'hex' ? res.hex : res.dec
  try {
    await navigator.clipboard.writeText(text)
    copiedIndex.value = index
    setTimeout(() => { copiedIndex.value = null }, 1500)
  } catch { /* */ }
}

function copyAll() {
  if (!results.value.length) return
  const lines = results.value.map(r => `${r.alg.name}\t${r.hex}\t${r.dec}`).join('\n')
  navigator.clipboard.writeText(lines).catch(() => {})
}
</script>

<template>
  <div class="crc-tool">
    <h1>{{ t('crcTool.title') }}</h1>
    <p class="desc">{{ t('crcTool.desc') }}</p>

    <div class="input-section">
      <div class="mode-toggle">
        <button
          :class="['mode-btn', { active: inputMode === 'text' }]"
          @click="inputMode = 'text'; hexParseError = ''"
        >{{ t('crcTool.modeText') }}</button>
        <button
          :class="['mode-btn', { active: inputMode === 'hex' }]"
          @click="inputMode = 'hex'; hexParseError = ''"
        >{{ t('crcTool.modeHex') }}</button>
      </div>
      <textarea
        v-model="input"
        :placeholder="t(inputMode === 'hex' ? 'crcTool.hexPlaceholder' : 'crcTool.placeholder')"
        class="input-area"
        :class="{ 'input-error': hexParseError }"
        rows="4"
        spellcheck="false"
      />
      <div class="input-bar">
        <span v-if="hexParseError" class="error-text">{{ hexParseError }}</span>
        <span v-else class="input-info">
          {{ t('crcTool.bytes') }}: {{ byteCount }}
          <template v-if="inputMode === 'hex' && currentBytes.length">
            &nbsp;·&nbsp;
            <span class="mono-sm">{{ currentBytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ') }}</span>
          </template>
        </span>
        <button v-if="input" class="btn btn-clear" @click="input = ''; hexParseError = ''">{{ t('crcTool.clear') }}</button>
      </div>
    </div>

    <div v-if="results.length" class="results-section">
      <div class="results-header">
        <h3>{{ t('crcTool.results') }}</h3>
        <div class="results-actions">
          <select v-model="outputFormat" class="format-select">
            <option value="hex">HEX</option>
            <option value="dec">DEC</option>
          </select>
          <button class="btn btn-copy-all" @click="copyAll">{{ t('crcTool.copyAll') }}</button>
        </div>
      </div>

      <div class="results-table">
        <div class="table-row table-header">
          <span class="col-alg">{{ t('crcTool.colAlg') }}</span>
          <span class="col-alias">{{ t('crcTool.colAlias') }}</span>
          <span class="col-bits">{{ t('crcTool.colBits') }}</span>
          <span class="col-value">{{ t('crcTool.colValue') }}</span>
          <span class="col-action">{{ t('crcTool.colAction') }}</span>
        </div>

        <template v-for="group in bitGroups" :key="group.bits">
          <div class="group-header">{{ group.label }}</div>
          <div
            v-for="res in results.filter(r => r.alg.bits === group.bits)"
            :key="res.alg.name"
            class="table-row"
          >
            <span class="col-alg">{{ t(res.alg.labelKey) }}</span>
            <span class="col-alias">{{ res.alg.alias }}</span>
            <span class="col-bits">{{ res.alg.bits }}</span>
            <span class="col-value mono">{{ outputFormat === 'hex' ? res.hex : res.dec }}</span>
            <span class="col-action">
              <button class="btn btn-copy" @click="copyResult(results.indexOf(res))">
                {{ copiedIndex === results.indexOf(res) ? t('crcTool.copied') : t('crcTool.copy') }}
              </button>
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crc-tool {
  max-width: 860px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
  color: #1a1a1a;
}

.desc {
  color: #666;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.input-section {
  margin-bottom: 1.25rem;
}

.input-area {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'SF Mono', 'Consolas', monospace;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.input-area:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
}

.input-bar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.5rem;
  justify-content: space-between;
}

.input-info {
  font-size: 0.8rem;
  color: #999;
}

.error-text {
  font-size: 0.8rem;
  color: #d32f2f;
}

.input-area.input-error {
  border-color: #d32f2f;
}

.input-area.input-error:focus {
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2);
}

.mono-sm {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
}

.mode-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 0.5rem;
  background: #f0f2f4;
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
}

.mode-btn {
  padding: 0.4rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  color: #666;
}

.mode-btn.active {
  background: #4a90d9;
  color: white;
  font-weight: 500;
}

.mode-btn:not(.active):hover {
  background: #e0e4ea;
}

.btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-clear {
  background: #eee;
  color: #666;
}

.btn-clear:hover {
  background: #ddd;
}

.btn-copy {
  background: #4a90d9;
  color: white;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
}

.btn-copy:hover {
  background: #357abd;
}

.btn-copy-all {
  background: #5a9f5a;
  color: white;
}

.btn-copy-all:hover {
  background: #4a8f4a;
}

.results-section {
  margin-top: 0.5rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.results-header h3 {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.results-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.format-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  background: white;
  cursor: pointer;
}

.results-table {
  border: 1px solid #e8ecf0;
  border-radius: 8px;
  overflow: hidden;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
  border-bottom: 1px solid #f0f2f4;
  font-size: 0.85rem;
}

.table-row:last-child {
  border-bottom: none;
}

.table-header {
  background: #f5f7fa;
  font-weight: 600;
  color: #555;
  font-size: 0.78rem;
}

.table-row:hover:not(.table-header):not(.group-header) {
  background: #fafbfc;
}

.group-header {
  background: #edf1f7;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4a6a8a;
  border-bottom: 1px solid #e0e4ea;
}

.col-alg { flex: 2; }
.col-alias { flex: 1.5; }
.col-bits { flex: 0.5; text-align: center; }
.col-value { flex: 3; }
.col-action { flex: 1; text-align: right; }

.mono {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.82rem;
  color: #333;
  user-select: all;
  letter-spacing: 0.02em;
}
</style>
