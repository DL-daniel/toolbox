<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import UsageGuide from '@/components/UsageGuide.vue'

const { t } = useI18nt()

type Mode = 'encode' | 'decode'

const mode = ref<Mode>('encode')
const input = ref('')
const output = ref('')
const error = ref('')
const isUtf8 = ref(true)

function toggleMode() {
  const newMode = mode.value === 'encode' ? 'decode' : 'encode'
  mode.value = newMode
  // Swap input and output, clear error
  const tmp = input.value
  input.value = output.value
  output.value = tmp
  error.value = ''
}

function b64Encode(str: string): string {
  try {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  } catch {
    throw new Error('encode_failed')
  }
}

function b64Decode(str: string): string {
  try {
    const binary = atob(str.trim())
    if (isUtf8.value) {
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      return new TextDecoder().decode(bytes)
    } else {
      // Hex output mode
      const hex: string[] = []
      for (let i = 0; i < binary.length; i++) {
        hex.push(binary.charCodeAt(i).toString(16).padStart(2, '0'))
      }
      return hex.join(' ')
    }
  } catch {
    throw new Error('decode_failed')
  }
}

function handleConvert() {
  error.value = ''
  const raw = input.value
  if (!raw) {
    error.value = mode.value === 'encode' ? t('base64Tool.errorEmptyInput') : t('base64Tool.errorEmptyInput')
    output.value = ''
    return
  }
  try {
    if (mode.value === 'encode') {
      output.value = b64Encode(raw)
    } else {
      output.value = b64Decode(raw)
    }
  } catch (e: any) {
    if (e.message === 'encode_failed') {
      error.value = t('base64Tool.errorEncode')
    } else if (e.message === 'decode_failed') {
      error.value = t('base64Tool.errorDecode')
    } else {
      error.value = e.message || t('base64Tool.errorGeneric')
    }
    output.value = ''
  }
}

function copyOutput() {
  if (output.value) {
    navigator.clipboard.writeText(output.value)
  }
}

const placeholderText = computed(() =>
  mode.value === 'encode' ? t('base64Tool.placeholderEncode') : t('base64Tool.placeholderDecode')
)
</script>

<template>
  <div class="base64-tool">
    <div class="tool-header">
      <h2>{{ t('base64Tool.title') }}</h2>
      <p class="desc">{{ t('base64Tool.desc') }}</p>
    </div>

    <!-- Mode toggle & options -->
    <div class="control-bar">
      <div class="mode-tabs">
        <button
          class="tab-btn"
          :class="{ active: mode === 'encode' }"
          @click="mode = 'encode'; output = ''; error = ''"
        >
          🔒 {{ t('base64Tool.tabEncode') }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'decode' }"
          @click="mode = 'decode'; output = ''; error = ''"
        >
          🔓 {{ t('base64Tool.tabDecode') }}
        </button>
      </div>
      <!-- Swap button -->
      <button class="btn btn-icon swap-btn" @click="toggleMode" :title="t('base64Tool.swap')">
        ⇄
      </button>
      <label class="utf8-toggle" v-if="mode === 'decode'">
        <input type="checkbox" v-model="isUtf8" />
        <span>{{ t('base64Tool.utf8Decode') }}</span>
      </label>
    </div>

    <!-- Input -->
    <div class="editor-section">
      <div class="section-label">{{ mode === 'encode' ? t('base64Tool.inputText') : t('base64Tool.inputBase64') }}</div>
      <textarea
        v-model="input"
        :placeholder="placeholderText"
        class="code-textarea"
        rows="5"
        spellcheck="false"
      ></textarea>
    </div>

    <!-- Convert button -->
    <button class="btn btn-primary" @click="handleConvert">
      ⚡ {{ t('base64Tool.convert') }}
    </button>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- Output -->
    <div class="editor-section" v-if="output">
      <div class="section-label">
        {{ mode === 'encode' ? t('base64Tool.outputBase64') : t('base64Tool.outputText') }}
        <button class="btn btn-sm" @click="copyOutput">{{ t('base64Tool.copy') }}</button>
      </div>
      <textarea
        :value="output"
        class="code-textarea"
        rows="5"
        readonly
        spellcheck="false"
      ></textarea>
    </div>
  </div>

    <UsageGuide toolKey="base64" />
  </template>

<style scoped>
.base64-tool {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-header {
  text-align: center;
}

.tool-header h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.desc {
  color: #666;
  font-size: 0.95rem;
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.mode-tabs {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.tab-btn {
  padding: 0.45rem 1.2rem;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  transition: all 0.15s;
}
.tab-btn:first-child {
  border-right: 1px solid #eee;
}
.tab-btn:hover {
  background: #f5f8ff;
}
.tab-btn.active {
  background: #4a90d9;
  color: white;
  font-weight: 600;
}

.swap-btn {
  font-size: 1.3rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: background 0.15s;
}
.swap-btn:hover {
  background: #f0f4ff;
}

.utf8-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #555;
  font-weight: 600;
}

.code-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.code-textarea:focus {
  border-color: #4a90d9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}
.code-textarea[readonly] {
  background: #f8f9fa;
  color: #333;
}

.btn {
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: all 0.15s;
}
.btn-primary {
  padding: 0.65rem 2rem;
  background: #4a90d9;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  align-self: center;
}
.btn-primary:hover {
  background: #3a7bc8;
}
.btn-sm {
  padding: 0.25rem 0.7rem;
  background: #e8f0fe;
  color: #4a90d9;
  font-size: 0.8rem;
}
.btn-sm:hover {
  background: #d4e4fc;
}

.error-msg {
  background: #fff0f0;
  color: #d32f2f;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #ffcdd2;
}
</style>
