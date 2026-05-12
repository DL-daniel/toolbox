<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const length = ref(16)
const useUppercase = ref(true)
const useLowercase = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(false)
const password = ref('')
const copied = ref(false)

const strength = computed(() => {
  let pool = 0
  if (useUppercase.value) pool += 26
  if (useLowercase.value) pool += 26
  if (useNumbers.value) pool += 10
  if (useSymbols.value) pool += 32
  const entropy = Math.log2(pool) * length.value
  if (entropy >= 80) return { label: t('passwordGenerator.strong'), cls: 'strong' }
  if (entropy >= 50) return { label: t('passwordGenerator.medium'), cls: 'medium' }
  return { label: t('passwordGenerator.weak'), cls: 'weak' }
})

function generate() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const nums = '0123456789'
  const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  let chars = ''
  if (useUppercase.value) chars += upper
  if (useLowercase.value) chars += lower
  if (useNumbers.value) chars += nums
  if (useSymbols.value) chars += syms
  if (!chars) return
  let result = ''
  const arr = new Uint32Array(length.value)
  crypto.getRandomValues(arr)
  for (let i = 0; i < length.value; i++) result += chars[arr[i] % chars.length]
  password.value = result
  copied.value = false
}

function copyPwd() {
  navigator.clipboard.writeText(password.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="pwd-gen">
    <div class="tool-header">
      <h2>{{ t('passwordGenerator.title') }}</h2>
      <p class="desc">{{ t('passwordGenerator.desc') }}</p>
    </div>
    <div class="options">
      <div class="opt-row"><label>{{ t('passwordGenerator.length') }}</label><input v-model.number="length" type="range" min="4" max="64" class="range" /><span class="len-val">{{ length }}</span></div>
      <label class="opt-row toggle"><input type="checkbox" v-model="useUppercase" />{{ t('passwordGenerator.uppercase') }}</label>
      <label class="opt-row toggle"><input type="checkbox" v-model="useLowercase" />{{ t('passwordGenerator.lowercase') }}</label>
      <label class="opt-row toggle"><input type="checkbox" v-model="useNumbers" />{{ t('passwordGenerator.numbers') }}</label>
      <label class="opt-row toggle"><input type="checkbox" v-model="useSymbols" />{{ t('passwordGenerator.symbols') }}</label>
    </div>
    <button class="btn" @click="generate">{{ t('passwordGenerator.generate') }}</button>
    <div v-if="password" class="result-card">
      <div class="pwd-display">{{ password }}</div>
      <div class="pwd-actions">
        <span class="strength-badge" :class="strength.cls">{{ strength.label }}</span>
        <button class="btn-sm" @click="copyPwd">{{ copied ? t('common.copied') : t('common.copy') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pwd-gen { max-width: 500px; margin: 0 auto; }
.options { background:#fff; border-radius:12px; padding:1.2rem; box-shadow:0 2px 8px rgba(0,0,0,0.05); margin:1rem 0; }
.opt-row { display:flex; align-items:center; gap:0.8rem; margin:0.6rem 0; }
.range { flex:1; }
.len-val { font-weight:700; color:#667eea; min-width:2rem; text-align:center; }
.toggle { cursor:pointer; color:#555; font-size:0.95rem; }
.toggle input { margin-right:0.5rem; }
.btn { padding:0.7rem 2rem; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:1rem; width:100%; }
.result-card { background:#fff; border-radius:12px; padding:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-top:1rem; text-align:center; }
.pwd-display { font-family:monospace; font-size:1.3rem; font-weight:700; color:#333; word-break:break-all; padding:0.5rem 0; }
.pwd-actions { display:flex; gap:0.5rem; justify-content:center; align-items:center; margin-top:0.8rem; }
.strength-badge { padding:0.2rem 0.8rem; border-radius:12px; font-size:0.8rem; font-weight:600; }
.strong { background:#e8f5e9; color:#2e7d32; }
.medium { background:#fff3e0; color:#e65100; }
.weak { background:#fbe9e7; color:#c62828; }
.btn-sm { padding:0.4rem 1rem; background:#667eea; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:0.85rem; }
@media (prefers-color-scheme: dark) {
  .options,.result-card { background:#1a1a2e; }
  .toggle { color:#aaa; }
  .pwd-display { color:#eee; }
  .strong { background:#1b3d1b; color:#81c784; }
  .medium { background:#3d2e1b; color:#ffb74d; }
  .weak { background:#3d1b1b; color:#e57373; }
}
</style>