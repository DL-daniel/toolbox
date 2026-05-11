<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import CryptoJS from 'crypto-js'
import { useI18nt } from '@/i18n/useI18nt'
import { COMMON_PASSWORDS } from '@/utils/md5Dict'

const { t } = useI18nt()

// Tab
const activeTab = ref<'encrypt' | 'decrypt'>('encrypt')

// Encrypt state
const input = ref('')
const md5_32_lower = ref('')
const md5_32_upper = ref('')
const md5_16_lower = ref('')
const md5_16_upper = ref('')
const charCount = ref(0)
const utf8Bytes = ref(0)
const copied_32l = ref(false)
const copied_32u = ref(false)
const copied_16l = ref(false)
const copied_16u = ref(false)
// Decrypt state
const decryptInput = ref('')
const decryptResult = ref<string | null>(null)
const decryptStatus = ref<'idle' | 'found' | 'notfound'>('idle')

// Lookup table built at mount time
let lookupTable = new Map<string, string>()
const dictSize = ref(0)

onMounted(() => {
  // Build reverse lookup table: hash → plaintext
  for (const pw of COMMON_PASSWORDS) {
    const h = CryptoJS.MD5(pw).toString()
    lookupTable.set(h, pw)
    lookupTable.set(h.toUpperCase(), pw)
  }
  dictSize.value = lookupTable.size / 2 // /2 because we stored both lower and upper
})

// Encrypt compute
function compute() {
  if (!input.value) {
    md5_32_lower.value = ''
    md5_32_upper.value = ''
    md5_16_lower.value = ''
    md5_16_upper.value = ''
    charCount.value = 0
    utf8Bytes.value = 0
    return
  }
  const hash = CryptoJS.MD5(input.value).toString()
  md5_32_lower.value = hash
  md5_32_upper.value = hash.toUpperCase()
  md5_16_lower.value = hash.substring(8, 24)
  md5_16_upper.value = hash.substring(8, 24).toUpperCase()
  charCount.value = input.value.length
  utf8Bytes.value = new TextEncoder().encode(input.value).length
}

watch(input, compute)

function copyToClipboard(text: string, type: string) {
  navigator.clipboard.writeText(text)
  if (type === '32l') {
    copied_32l.value = true; setTimeout(() => { copied_32l.value = false }, 1500)
  } else if (type === '32u') {
    copied_32u.value = true; setTimeout(() => { copied_32u.value = false }, 1500)
  } else if (type === '16l') {
    copied_16l.value = true; setTimeout(() => { copied_16l.value = false }, 1500)
  } else if (type === '16u') {
    copied_16u.value = true; setTimeout(() => { copied_16u.value = false }, 1500)
  }
}

function clearInput() {
  input.value = ''
}

// Decrypt lookup
function doLookup() {
  const hash = decryptInput.value.trim()
  if (!hash) {
    decryptStatus.value = 'idle'
    decryptResult.value = null
    return
  }
  const plain = lookupTable.get(hash)
  if (plain) {
    decryptResult.value = plain
    decryptStatus.value = 'found'
  } else {
    decryptResult.value = null
    decryptStatus.value = 'notfound'
  }
}
</script>

<template>
  <div class="md5-tool">
    <h1>{{ t('md5Tool.title') }}</h1>
    <p class="desc">{{ t('md5Tool.desc') }}</p>

    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'encrypt' }"
        @click="activeTab = 'encrypt'"
      >{{ t('md5Tool.tabEncrypt') }}</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'decrypt' }"
        @click="activeTab = 'decrypt'"
      >{{ t('md5Tool.tabDecrypt') }}</button>
    </div>

    <!-- Encrypt Tab -->
    <div v-if="activeTab === 'encrypt'" class="encrypt-section">
      <div class="input-section">
        <textarea
          v-model="input"
          :placeholder="t('md5Tool.inputPlaceholder')"
          rows="4"
          class="input-area"
        ></textarea>
        <div class="input-info">
          <span>{{ t('md5Tool.charCount') }}: {{ charCount }}</span>
          <span>{{ t('md5Tool.utf8Bytes') }}: {{ utf8Bytes }}</span>
          <button v-if="input" class="btn btn-clear" @click="clearInput">{{ t('md5Tool.clear') }}</button>
        </div>
      </div>

      <div v-if="md5_32_lower" class="results">
        <h3>{{ t('md5Tool.result') }}</h3>
        <div class="hash-row">
          <span class="hash-label">32 位小写</span>
          <code class="hash-value">{{ md5_32_lower }}</code>
          <button class="btn btn-copy" @click="copyToClipboard(md5_32_lower, '32l')">
            {{ copied_32l ? t('md5Tool.copied') : t('md5Tool.copy') }}
          </button>
        </div>
        <div class="hash-row">
          <span class="hash-label">32 位大写</span>
          <code class="hash-value">{{ md5_32_upper }}</code>
          <button class="btn btn-copy" @click="copyToClipboard(md5_32_upper, '32u')">
            {{ copied_32u ? t('md5Tool.copied') : t('md5Tool.copy') }}
          </button>
        </div>
        <div class="hash-row">
          <span class="hash-label">16 位小写</span>
          <code class="hash-value">{{ md5_16_lower }}</code>
          <button class="btn btn-copy" @click="copyToClipboard(md5_16_lower, '16l')">
            {{ copied_16l ? t('md5Tool.copied') : t('md5Tool.copy') }}
          </button>
        </div>
        <div class="hash-row">
          <span class="hash-label">16 位大写</span>
          <code class="hash-value">{{ md5_16_upper }}</code>
          <button class="btn btn-copy" @click="copyToClipboard(md5_16_upper, '16u')">
            {{ copied_16u ? t('md5Tool.copied') : t('md5Tool.copy') }}
          </button>
        </div>
      </div>


    </div>

    <!-- Decrypt Tab -->
    <div v-if="activeTab === 'decrypt'" class="decrypt-section">
      <div class="input-section">
        <input
          v-model="decryptInput"
          :placeholder="t('md5Tool.decryptPlaceholder')"
          class="input-area decrypt-input"
          @keyup.enter="doLookup"
        />
        <div class="input-info">
          <button class="btn btn-primary" @click="doLookup">{{ t('md5Tool.decryptBtn') }}</button>
          <span class="dict-info">{{ t('md5Tool.decryptDictSize', { count: dictSize }) }}</span>
        </div>
      </div>

      <div v-if="decryptStatus === 'found'" class="result-card success">
        <div class="result-header">{{ t('md5Tool.decryptFound') }}</div>
        <div class="result-plaintext">{{ (decryptResult as string) }}</div>
      </div>
      <div v-else-if="decryptStatus === 'notfound'" class="result-card failure">
        {{ t('md5Tool.decryptNotFound') }}
      </div>

      <div class="decrypt-note">
        {{ t('md5Tool.decryptNote') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.md5-tool {
  max-width: 800px;
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

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid #e8ecf0;
}

.tab-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.15s;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #4a90d9;
  border-bottom-color: #4a90d9;
  font-weight: 600;
}

/* Input */
.input-section {
  margin-bottom: 1.25rem;
}

.input-area {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.input-area:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
}

.decrypt-input {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.9rem;
}

.input-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #888;
  flex-wrap: wrap;
}

.dict-info {
  color: #999;
  font-size: 0.8rem;
}

/* Results */
.results {
  margin-bottom: 1.25rem;
}

.results h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #333;
}

.hash-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  background: #f8f8f8;
  border-radius: 6px;
  margin-bottom: 0.4rem;
}

.hash-label {
  flex-shrink: 0;
  font-size: 0.78rem;
  color: #666;
  min-width: 80px;
}

.hash-value {
  flex: 1;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.85rem;
  color: #333;
  word-break: break-all;
  user-select: all;
}

/* Buttons */
.btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-copy {
  background: #4a90d9;
  color: white;
  flex-shrink: 0;
}

.btn-copy:hover {
  background: #357abd;
}

.btn-clear {
  background: #eee;
  color: #666;
}

.btn-clear:hover {
  background: #ddd;
}

.btn-primary {
  background: #4a90d9;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
}

/* Decrypt */
.decrypt-section .input-section {
  margin-bottom: 1rem;
}

.result-card {
  padding: 1.2rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.result-card.success {
  background: #f0faf0;
  border: 1px solid #b8e6b8;
}

.result-card.failure {
  background: #fff5f5;
  border: 1px solid #f0c0c0;
  color: #c44;
}

.result-header {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #2a7a2a;
}

.result-plaintext {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 1.1rem;
  color: #1a5a1a;
  padding: 0.5rem 0.75rem;
  background: white;
  border-radius: 4px;
  display: inline-block;
  user-select: all;
}

.decrypt-note {
  font-size: 0.82rem;
  color: #888;
  background: #faf8f0;
  border: 1px solid #eee8d8;
  border-radius: 6px;
  padding: 0.7rem 1rem;
  line-height: 1.5;
}
</style>
