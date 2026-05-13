<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CryptoJS from 'crypto-js'
import { useI18nt } from '@/i18n/useI18nt'
import UsageGuide from '@/components/UsageGuide.vue'

const { t } = useI18nt()

const mode = ref<'encrypt' | 'decrypt'>('encrypt')

interface AlgorithmDef {
  key: string
  labelKey: string
  isBlockCipher: boolean
  keySizes: number[]
  defaultKeySize: number
}

const algorithms = ref<AlgorithmDef[]>([
  { key: 'AES', labelKey: 'cryptoTool.algAES', isBlockCipher: true, keySizes: [128, 192, 256], defaultKeySize: 256 },
  { key: 'DES', labelKey: 'cryptoTool.algDES', isBlockCipher: true, keySizes: [64], defaultKeySize: 64 },
  { key: 'TripleDES', labelKey: 'cryptoTool.alg3DES', isBlockCipher: true, keySizes: [128, 192], defaultKeySize: 192 },
  { key: 'Rabbit', labelKey: 'cryptoTool.algRabbit', isBlockCipher: false, keySizes: [128], defaultKeySize: 128 },
  { key: 'RC4', labelKey: 'cryptoTool.algRC4', isBlockCipher: false, keySizes: [128, 256], defaultKeySize: 128 },
  { key: 'RC4Drop', labelKey: 'cryptoTool.algRC4Drop', isBlockCipher: false, keySizes: [128, 256], defaultKeySize: 128 },
])

const selectedAlg = ref('AES')
const selectedMode = ref('CBC')
const selectedPadding = ref('Pkcs7')
const keyInput = ref('')
const keySize = ref(256)
const ivInput = ref('')
const input = ref('')
const output = ref('')
const showKey = ref(false)
const showGuide = ref(false)
const errorMsg = ref('')
const copied = ref(false)
const outputFormat = ref<'base64' | 'hex'>('base64')

const modes = ['ECB', 'CBC', 'CFB', 'OFB', 'CTR']
const paddings = ['Pkcs7', 'Iso10126', 'AnsiX923', 'ZeroPadding', 'NoPadding']

const currentAlg = computed(() => algorithms.value.find(a => a.key === selectedAlg.value)!)
const isBlockCipher = computed(() => currentAlg.value?.isBlockCipher ?? true)
const needsIV = computed(() => isBlockCipher.value && selectedMode.value !== 'ECB')

watch(selectedAlg, (algKey: string) => {
  const alg = algorithms.value.find(a => a.key === algKey)
  if (alg) {
    keySize.value = alg.defaultKeySize
  }
  errorMsg.value = ''
  output.value = ''
})

watch(keySize, () => { errorMsg.value = ''; output.value = '' })

function doConvert() {
  errorMsg.value = ''
  output.value = ''

  if (!input.value) {
    errorMsg.value = t('cryptoTool.errorEmptyInput')
    return
  }
  if (!keyInput.value) {
    errorMsg.value = t('cryptoTool.errorEmptyKey')
    return
  }

  try {
    if (mode.value === 'encrypt') {
      doEncrypt()
    } else {
      doDecrypt()
    }
  } catch (e: any) {
    errorMsg.value = t('cryptoTool.errorGeneric') + (e.message ? ': ' + e.message : '')
  }
}

function doEncrypt() {
  const key = keyInput.value
  const plaintext = input.value

  if (!isBlockCipher.value) {
    // Stream ciphers: Rabbit, RC4, RC4Drop
    let encrypted: CryptoJS.lib.CipherParams
    if (selectedAlg.value === 'RC4Drop') {
      encrypted = CryptoJS.RC4Drop.encrypt(plaintext, key, { drop: 768 })
    } else if (selectedAlg.value === 'Rabbit') {
      encrypted = CryptoJS.Rabbit.encrypt(plaintext, key)
    } else if (selectedAlg.value === 'RC4') {
      encrypted = CryptoJS.RC4.encrypt(plaintext, key)
    } else {
      throw new Error(`Unknown algorithm: ${selectedAlg.value}`)
    }
    output.value = outputFormat.value === 'hex'
      ? encrypted.ciphertext.toString(CryptoJS.enc.Hex)
      : encrypted.toString()
    return
  }

  // Block ciphers with options
  const algObj = (CryptoJS as any)[selectedAlg.value] as {
    encrypt: (p: string, k: string, o?: any) => CryptoJS.lib.CipherParams
  }

  const opts: any = {
    mode: (CryptoJS.mode as any)[selectedMode.value],
    padding: (CryptoJS.pad as any)[selectedPadding.value],
  }

  if (needsIV.value) {
    if (!ivInput.value) {
      errorMsg.value = t('cryptoTool.errorEmptyIV')
      return
    }
    opts.iv = CryptoJS.enc.Utf8.parse(ivInput.value)
  }

  const encrypted = algObj.encrypt(plaintext, key, opts)
  output.value = outputFormat.value === 'hex'
    ? encrypted.ciphertext.toString(CryptoJS.enc.Hex)
    : encrypted.toString()
}

function doDecrypt() {
  const key = keyInput.value
  const ciphertext = input.value

  if (!isBlockCipher.value) {
    // Stream ciphers
    let decrypted: CryptoJS.lib.WordArray
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
    })
    if (selectedAlg.value === 'RC4Drop') {
      decrypted = CryptoJS.RC4Drop.decrypt(cipherParams, key, { drop: 768 })
    } else if (selectedAlg.value === 'Rabbit') {
      decrypted = CryptoJS.Rabbit.decrypt(cipherParams, key)
    } else if (selectedAlg.value === 'RC4') {
      decrypted = CryptoJS.RC4.decrypt(cipherParams, key)
    } else {
      throw new Error(`Unknown algorithm: ${selectedAlg.value}`)
    }
    output.value = decrypted.toString(CryptoJS.enc.Utf8)
    if (!output.value) {
      throw new Error(t('cryptoTool.errorDecrypt'))
    }
    return
  }

  // Block ciphers
  const algObj = (CryptoJS as any)[selectedAlg.value] as {
    decrypt: (c: string, k: string, o?: any) => CryptoJS.lib.WordArray
  }

  const opts: any = {
    mode: (CryptoJS.mode as any)[selectedMode.value],
    padding: (CryptoJS.pad as any)[selectedPadding.value],
  }

  if (needsIV.value) {
    if (!ivInput.value) {
      errorMsg.value = t('cryptoTool.errorEmptyIV')
      return
    }
    opts.iv = CryptoJS.enc.Utf8.parse(ivInput.value)
  }

  const decrypted = algObj.decrypt(ciphertext, key, opts)
  output.value = decrypted.toString(CryptoJS.enc.Utf8)
  if (!output.value) {
    throw new Error(t('cryptoTool.errorDecrypt'))
  }
}

function copyResult() {
  if (!output.value) return
  navigator.clipboard.writeText(output.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

function clearAll() {
  input.value = ''
  output.value = ''
  errorMsg.value = ''
  keyInput.value = ''
  ivInput.value = ''
}
</script>

<template>
  <div class="crypto-tool">
    <h1>{{ t('cryptoTool.title') }}</h1>
    <p class="desc">{{ t('cryptoTool.desc') }}</p>

    <!-- Mode Tabs -->
    <div class="mode-tabs">
      <button
        :class="['tab', { active: mode === 'encrypt' }]"
        @click="mode = 'encrypt'; output = ''; errorMsg = ''"
      >
        🔒 {{ t('cryptoTool.tabEncrypt') }}
      </button>
      <button
        :class="['tab', { active: mode === 'decrypt' }]"
        @click="mode = 'decrypt'; output = ''; errorMsg = ''"
      >
        🔓 {{ t('cryptoTool.tabDecrypt') }}
      </button>
    </div>

    <!-- Algorithm Selection -->
    <div class="form-group">
      <label>{{ t('cryptoTool.algorithm') }}</label>
      <div class="alg-grid">
        <button
          v-for="alg in algorithms"
          :key="alg.key"
          :class="['alg-btn', { active: selectedAlg === alg.key }]"
          @click="selectedAlg = alg.key"
        >
          {{ t(alg.labelKey) }}
        </button>
      </div>
    </div>

    <!-- Key Size (for block ciphers with multiple key sizes) -->
    <div v-if="currentAlg.keySizes.length > 1" class="form-group">
      <label>{{ t('cryptoTool.keySize') }}</label>
      <div class="opt-row">
        <button
          v-for="size in currentAlg.keySizes"
          :key="size"
          :class="['opt-btn', { active: keySize === size }]"
          @click="keySize = size"
        >
          {{ size }} {{ t('cryptoTool.bit') }}
        </button>
      </div>
    </div>

    <!-- Mode & Padding for Block Ciphers -->
    <template v-if="isBlockCipher">
      <div class="form-row">
        <div class="form-group">
          <label>{{ t('cryptoTool.mode') }}</label>
          <div class="opt-row">
            <button
              v-for="m in modes"
              :key="m"
              :class="['opt-btn', { active: selectedMode === m }]"
              @click="selectedMode = m; output = ''; errorMsg = ''"
            >
              {{ m }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('cryptoTool.padding') }}</label>
          <div class="opt-row">
            <button
              v-for="p in paddings"
              :key="p"
              :class="['opt-btn', { active: selectedPadding === p }]"
              @click="selectedPadding = p; output = ''; errorMsg = ''"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>

      <!-- IV Input for non-ECB modes -->
      <div v-if="needsIV" class="form-group">
        <label>{{ t('cryptoTool.iv') }}</label>
        <input
          v-model="ivInput"
          type="text"
          :placeholder="t('cryptoTool.ivPlaceholder')"
          class="input-field"
        />
      </div>
    
    <UsageGuide toolKey="cryptoTool" />
  </template>

    <!-- Key Input -->
    <div class="form-group">
      <label>{{ t('cryptoTool.key') }}</label>
      <div class="key-row">
        <input
          v-model="keyInput"
          :type="showKey ? 'text' : 'password'"
          :placeholder="t('cryptoTool.keyPlaceholder')"
          class="input-field key-field"
        />
        <button class="btn btn-icon" @click="showKey = !showKey">
          {{ showKey ? '🙈' : '👁️' }}
        </button>
      </div>
    </div>

    <!-- Output Format -->
    <div class="form-group">
      <label>{{ t('cryptoTool.outputFormat') }}</label>
      <div class="opt-row">
        <button
          :class="['opt-btn', { active: outputFormat === 'base64' }]"
          @click="outputFormat = 'base64'; output = ''; errorMsg = ''"
        >
          Base64
        </button>
        <button
          :class="['opt-btn', { active: outputFormat === 'hex' }]"
          @click="outputFormat = 'hex'; output = ''; errorMsg = ''"
        >
          Hex
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <div class="form-group">
      <label>{{ mode === 'encrypt' ? t('cryptoTool.plaintext') : t('cryptoTool.ciphertext') }}</label>
      <textarea
        v-model="input"
        :placeholder="mode === 'encrypt' ? t('cryptoTool.plaintextPlaceholder') : t('cryptoTool.ciphertextPlaceholder')"
        rows="4"
        class="input-area"
      ></textarea>
    </div>

    <button class="btn btn-convert" @click="doConvert">
      {{ mode === 'encrypt' ? '🔒 ' + t('cryptoTool.btnEncrypt') : '🔓 ' + t('cryptoTool.btnDecrypt') }}
    </button>

    <!-- Error Message -->
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <!-- Output -->
    <div v-if="output" class="output-section">
      <div class="output-header">
        <h3>{{ t('cryptoTool.result') }}</h3>
        <div class="output-actions">
          <button class="btn btn-copy" @click="copyResult">
            {{ copied ? t('cryptoTool.copied') : t('cryptoTool.copy') }}
          </button>
          <button class="btn btn-clear" @click="clearAll">{{ t('cryptoTool.clear') }}</button>
        </div>
      </div>
      <pre class="output-area">{{ output }}</pre>
    </div>

    <!-- Guide -->
    <div class="guide-section">
      <button class="guide-toggle" @click="showGuide = !showGuide">
        {{ showGuide ? '▼' : '▶' }} {{ t('cryptoTool.guideTitle') }}
      </button>
      <div v-if="showGuide" class="guide-content">
        <div class="algo-guide" v-for="alg in algorithms" :key="alg.key">
          <h4>{{ t(alg.labelKey) }}</h4>
          <p>{{ t(alg.key === 'AES' ? 'cryptoTool.guideAES' : '') }}</p>
          <p v-if="alg.key === 'DES'">{{ t('cryptoTool.guideDES') }}</p>
          <p v-if="alg.key === 'TripleDES'">{{ t('cryptoTool.guide3DES') }}</p>
          <p v-if="alg.key === 'Rabbit'">{{ t('cryptoTool.guideRabbit') }}</p>
          <p v-if="alg.key === 'RC4'">{{ t('cryptoTool.guideRC4') }}</p>
          <p v-if="alg.key === 'RC4Drop'">{{ t('cryptoTool.guideRC4Drop') }}</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.crypto-tool {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.desc {
  color: #666;
  margin-bottom: 1.5rem;
}

.mode-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.tab {
  flex: 1;
  padding: 0.7rem;
  border: none;
  background: #f8f8f8;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.tab.active {
  background: #4a90d9;
  color: white;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.alg-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.alg-btn {
  padding: 0.4rem 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}

.alg-btn.active {
  background: #4a90d9;
  color: white;
  border-color: #4a90d9;
}

.alg-btn:hover:not(.active) {
  background: #f0f4f8;
}

.opt-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.opt-btn {
  padding: 0.3rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.opt-btn.active {
  background: #5a9f5a;
  color: white;
  border-color: #5a9f5a;
}

.opt-btn:hover:not(.active) {
  background: #f0f4f8;
}

.input-field {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
}

.key-row {
  display: flex;
  gap: 0.4rem;
}

.key-field {
  flex: 1;
}

.btn-icon {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
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
}

.input-area:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-convert {
  width: 100%;
  padding: 0.75rem;
  background: #4a90d9;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.btn-convert:hover {
  background: #357abd;
}

.btn-copy {
  background: #4a90d9;
  color: white;
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

.error-msg {
  background: #fff0f0;
  color: #c33;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
}

.output-section {
  margin-bottom: 1.5rem;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.output-header h3 {
  font-size: 1rem;
  color: #333;
}

.output-actions {
  display: flex;
  gap: 0.4rem;
}

.output-area {
  background: #1e1e1e;
  color: #e0e0e0;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.85rem;
  word-break: break-all;
  white-space: pre-wrap;
  overflow-x: auto;
  user-select: all;
}

.guide-section {
  margin-top: 1rem;
}

.guide-toggle {
  width: 100%;
  padding: 0.7rem;
  background: #f0f4f8;
  border: 1px solid #dde4ec;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #444;
  cursor: pointer;
  text-align: left;
}

.guide-toggle:hover {
  background: #e4eaf1;
}

.guide-content {
  margin-top: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fafbfc;
  border: 1px solid #e8ecf0;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #444;
}

.guide-content h4 {
  color: #2c5282;
  margin: 1rem 0 0.4rem;
  font-size: 0.95rem;
}

.guide-content h4:first-child {
  margin-top: 0;
}

.guide-content ul {
  padding-left: 1.2rem;
  margin: 0.3rem 0;
}

.guide-content li {
  margin-bottom: 0.2rem;
}

.algo-guide {
  margin-bottom: 1rem;
}
</style>
