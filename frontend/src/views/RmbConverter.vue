<script setup lang="ts">
import { ref } from 'vue'
import { rmbToChinese } from '@/utils/rmb'
import { useI18nt } from '@/i18n/useI18nt'

const { t, locale } = useI18nt()

const amount = ref('')
const result = ref('')
const copied = ref(false)

const quickAmounts = [100, 500, 1000, 12345.67, 999999.99, 0.01, 10086.01]

function convert() {
  if (!amount.value.trim()) return

  const num = parseFloat(amount.value)
  if (isNaN(num)) return

  result.value = rmbToChinese(num)
}

function setQuickAmount(val: number) {
  amount.value = String(val)
  result.value = rmbToChinese(val)
}

function copyResult() {
  if (!result.value) return
  navigator.clipboard.writeText(result.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  })
}

function handleInput() {
  // 只允许数字和小数点
  amount.value = amount.value.replace(/[^0-9.]/g, '')
}
</script>

<template>
  <div class="rmb-converter">
    <div class="tool-header">
      <h2>{{ t('rmbConverter.title') }}</h2>
      <p class="desc">{{ t('rmbConverter.desc') }}</p>
    </div>

    <div class="card">
      <div class="input-section">
        <div class="input-row">
          <span class="currency-symbol">¥</span>
          <input
            type="text"
            class="amount-input"
            v-model="amount"
            :placeholder="t('rmbConverter.placeholder')"
            @input="handleInput"
            @keyup.enter="convert"
          />
          <button class="btn-convert" @click="convert">{{ t('rmbConverter.convert') }}</button>
        </div>

        <div class="quick-amounts">
          <span class="quick-label">{{ t('rmbConverter.quickAmounts') }}：</span>
          <button
            v-for="val in quickAmounts"
            :key="val"
            class="quick-btn"
            @click="setQuickAmount(val)"
          >
            ¥{{ val.toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN') }}
          </button>
        </div>
      </div>

      <div v-if="result" class="result-section">
        <div class="result-header">
          <span>{{ t('rmbConverter.result') }}：</span>
          <button class="copy-btn" @click="copyResult">
            {{ copied ? t('rmbConverter.copied') : t('rmbConverter.copy') }}
          </button>
        </div>
        <div class="result-text">{{ result }}</div>
      </div>
    </div>

    <div class="card rules-card">
      <h3>{{ t('rmbConverter.rules') }}</h3>
      <ul>
        <li>{{ t('rmbConverter.rule1') }}</li>
        <li>{{ t('rmbConverter.rule2') }}</li>
        <li>{{ t('rmbConverter.rule3') }}</li>
      </ul>
      <div class="example">
        <strong>{{ t('rmbConverter.example') }}：</strong>
        <code>12345.67 → 壹万贰仟叁佰肆拾伍元陆角柒分</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rmb-converter {
  max-width: 700px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.tool-header h2 {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}

.desc {
  color: #666;
  font-size: 0.95rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-symbol {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
}

.amount-input {
  flex: 1;
  padding: 0.7rem 1rem;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'Consolas', 'Monaco', monospace;
}

.amount-input:focus {
  border-color: #667eea;
}

.btn-convert {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-convert:hover {
  opacity: 0.9;
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.quick-label {
  font-size: 0.85rem;
  color: #888;
  white-space: nowrap;
}

.quick-btn {
  padding: 0.3rem 0.6rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #555;
  transition: all 0.2s;
  font-family: 'Consolas', 'Monaco', monospace;
}

.quick-btn:hover {
  background: #e8e8ff;
  border-color: #667eea;
  color: #4338ca;
}

.result-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.copy-btn {
  padding: 0.3rem 0.8rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #555;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #e8e8ff;
  border-color: #667eea;
}

.result-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  padding: 1rem;
  background: #f9f9ff;
  border-radius: 8px;
  border: 1px solid #eef;
  line-height: 1.6;
  word-break: break-all;
}

.rules-card h3 {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #555;
}

.rules-card ul {
  list-style: none;
  padding: 0;
}

.rules-card li {
  padding: 0.3rem 0;
  color: #666;
  font-size: 0.9rem;
}

.rules-card li::before {
  content: '• ';
  color: #667eea;
  font-weight: bold;
}

.example {
  margin-top: 0.8rem;
  padding: 0.6rem;
  background: #f5f5ff;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #555;
}

.example code {
  color: #4338ca;
  font-family: 'Consolas', 'Monaco', monospace;
}
</style>
