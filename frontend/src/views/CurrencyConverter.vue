<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const currencies = [
  { code: 'CNY', name: '人民币', sign: '¥', country: '🇨🇳' },
  { code: 'USD', name: '美元', sign: '$', country: '🇺🇸' },
  { code: 'EUR', name: '欧元', sign: '€', country: '🇪🇺' },
  { code: 'GBP', name: '英镑', sign: '£', country: '🇬🇧' },
  { code: 'JPY', name: '日元', sign: '¥', country: '🇯🇵' },
  { code: 'KRW', name: '韩元', sign: '₩', country: '🇰🇷' },
  { code: 'HKD', name: '港币', sign: 'HK$', country: '🇭🇰' },
  { code: 'TWD', name: '新台币', sign: 'NT$', country: '🇹🇼' },
  { code: 'SGD', name: '新加坡元', sign: 'S$', country: '🇸🇬' },
  { code: 'AUD', name: '澳元', sign: 'A$', country: '🇦🇺' },
  { code: 'CAD', name: '加元', sign: 'C$', country: '🇨🇦' },
  { code: 'CHF', name: '瑞士法郎', sign: 'CHF', country: '🇨🇭' },
  { code: 'NZD', name: '新西兰元', sign: 'NZ$', country: '🇳🇿' },
  { code: 'THB', name: '泰铢', sign: '฿', country: '🇹🇭' },
  { code: 'VND', name: '越南盾', sign: '₫', country: '🇻🇳' },
  { code: 'MYR', name: '马来西亚林吉特', sign: 'RM', country: '🇲🇾' },
  { code: 'IDR', name: '印尼盾', sign: 'Rp', country: '🇮🇩' },
  { code: 'PHP', name: '菲律宾比索', sign: '₱', country: '🇵🇭' },
  { code: 'INR', name: '印度卢比', sign: '₹', country: '🇮🇳' },
  { code: 'RUB', name: '俄罗斯卢布', sign: '₽', country: '🇷🇺' },
  { code: 'BRL', name: '巴西雷亚尔', sign: 'R$', country: '🇧🇷' },
  { code: 'MXN', name: '墨西哥比索', sign: 'Mex$', country: '🇲🇽' },
  { code: 'SEK', name: '瑞典克朗', sign: 'kr', country: '🇸🇪' },
  { code: 'NOK', name: '挪威克朗', sign: 'kr', country: '🇳🇴' },
  { code: 'DKK', name: '丹麦克朗', sign: 'kr', country: '🇩🇰' },
  { code: 'PLN', name: '波兰兹罗提', sign: 'zł', country: '🇵🇱' },
  { code: 'TRY', name: '土耳其里拉', sign: '₺', country: '🇹🇷' },
  { code: 'AED', name: '阿联酋迪拉姆', sign: 'د.إ', country: '🇦🇪' },
  { code: 'SAR', name: '沙特里亚尔', sign: '﷼', country: '🇸🇦' },
  { code: 'ZAR', name: '南非兰特', sign: 'R', country: '🇿🇦' },
  { code: 'MOP', name: '澳门元', sign: 'MOP$', country: '🇲🇴' },
  { code: 'ARS', name: '阿根廷比索', sign: 'AR$', country: '🇦🇷' },
  { code: 'CZK', name: '捷克克朗', sign: 'Kč', country: '🇨🇿' },
  { code: 'ILS', name: '以色列新谢克尔', sign: '₪', country: '🇮🇱' },
  { code: 'NGN', name: '尼日利亚奈拉', sign: '₦', country: '🇳🇬' },
  { code: 'EGP', name: '埃及镑', sign: 'E£', country: '🇪🇬' },
]

const popular = ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'HKD', 'SGD', 'THB', 'AUD']

const fromCode = ref('USD')
const toCode = ref('CNY')
const amount = ref(100)
const rates = ref<Record<string, number>>({})
const loading = ref(false)
const error = ref('')
const lastUpdate = ref('')

const fromCurrency = computed(() => currencies.find(c => c.code === fromCode.value))
const toCurrency = computed(() => currencies.find(c => c.code === toCode.value))

const rate = computed(() => {
  if (!rates.value[fromCode.value] || !rates.value[toCode.value]) return 0
  return rates.value[toCode.value] / rates.value[fromCode.value]
})

const result = computed(() => {
  return amount.value * rate.value
})

function swap() {
  const tmp = fromCode.value
  fromCode.value = toCode.value
  toCode.value = tmp
}

function formatNum(n: number, decimals = 2): string {
  if (Math.abs(n) >= 1e4) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (Math.abs(n) >= 1) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals })
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6 })
}

async function fetchRates() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    if (data.result !== 'success') throw new Error('API error')
    rates.value = data.rates
    rates.value['USD'] = 1
    lastUpdate.value = data.time_last_update_utc || ''
  } catch (e: any) {
    error.value = e.message || t('currencyConverter.loadError')
  } finally {
    loading.value = false
  }
}

fetchRates()
</script>

<template>
  <div class="cc">
    <div class="tool-header"><h2>{{ t('currencyConverter.title') }}</h2><p class="desc">{{ t('currencyConverter.desc') }}</p></div>

    <div class="converter">
      <div class="amount-row">
        <label>{{ t('currencyConverter.amount') }}</label>
        <input v-model.number="amount" type="number" min="0" step="any" class="input amount-input" />
      </div>

      <div class="currency-pair">
        <div class="curr-select">
          <label>{{ t('currencyConverter.from') }}</label>
          <select v-model="fromCode" class="input">
            <optgroup :label="t('currencyConverter.popular')">
              <option v-for="c in currencies.filter(c=>popular.includes(c.code))" :key="c.code" :value="c.code">{{ c.country }} {{ c.code }} - {{ c.name }}</option>
            </optgroup>
            <optgroup :label="t('currencyConverter.all')">
              <option v-for="c in currencies.filter(c=>!popular.includes(c.code))" :key="c.code" :value="c.code">{{ c.country }} {{ c.code }} - {{ c.name }}</option>
            </optgroup>
          </select>
        </div>

        <button class="swap-btn" @click="swap" :title="t('currencyConverter.swap')">⇄</button>

        <div class="curr-select">
          <label>{{ t('currencyConverter.to') }}</label>
          <select v-model="toCode" class="input">
            <optgroup :label="t('currencyConverter.popular')">
              <option v-for="c in currencies.filter(c=>popular.includes(c.code))" :key="c.code" :value="c.code">{{ c.country }} {{ c.code }} - {{ c.name }}</option>
            </optgroup>
            <optgroup :label="t('currencyConverter.all')">
              <option v-for="c in currencies.filter(c=>!popular.includes(c.code))" :key="c.code" :value="c.code">{{ c.country }} {{ c.code }} - {{ c.name }}</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading">{{ t('currencyConverter.loading') }}</div>
      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!loading && !error && rate > 0" class="result-box">
        <div class="result-amount">
          <span class="result-sign">{{ fromCurrency?.sign }}</span>
          <span class="result-num">{{ formatNum(amount) }}</span>
          <span class="result-code">{{ fromCode }}</span>
        </div>
        <div class="result-eq">=</div>
        <div class="result-amount result-target">
          <span class="result-sign">{{ toCurrency?.sign }}</span>
          <span class="result-num">{{ formatNum(result) }}</span>
          <span class="result-code">{{ toCode }}</span>
        </div>
      </div>

      <div v-if="rate > 0" class="rate-info">
        <div class="rate-line">1 {{ fromCode }} = {{ formatNum(rate, 6) }} {{ toCode }}</div>
        <div class="rate-line">1 {{ toCode }} = {{ formatNum(1 / rate, 6) }} {{ fromCode }}</div>
        <div v-if="lastUpdate" class="update-time">{{ t('currencyConverter.updated') }}: {{ lastUpdate }}</div>
      </div>

      <div class="rate-actions">
        <button class="btn" @click="fetchRates" :disabled="loading">{{ loading ? t('currencyConverter.loading') : t('currencyConverter.refresh') }}</button>
      </div>
    </div>

    <div class="quick-pairs">
      <div class="qp-title">{{ t('currencyConverter.quickPairs') }}</div>
      <div class="qp-grid">
        <button v-for="pair in [['USD','CNY'],['EUR','CNY'],['GBP','CNY'],['JPY','CNY'],['USD','JPY'],['EUR','USD'],['GBP','USD'],['AUD','USD']]" :key="pair[0]+pair[1]" class="qp-btn" @click="fromCode=pair[0];toCode=pair[1];amount=1">
          {{ pair[0] }} → {{ pair[1] }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cc { max-width: 520px; margin: 0 auto; }
.converter { background: #fff; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,.06); margin: 1rem 0; }
.amount-row { margin-bottom: 1rem; }
.amount-row label { display: block; font-size: 0.85rem; color: #888; margin-bottom: 0.3rem; }
.amount-input { font-size: 1.5rem; font-weight: 700; text-align: center; padding: 0.8rem; }
.currency-pair { display: flex; align-items: flex-end; gap: 0.5rem; margin-bottom: 1rem; }
.curr-select { flex: 1; }
.curr-select label { display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.3rem; }
.curr-select select { width: 100%; padding: 0.6rem; font-size: 0.95rem; }
.swap-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #ddd; background: #fff; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.15s; flex-shrink: 0; margin-bottom: 0; }
.swap-btn:hover { background: #f0f2ff; border-color: #667eea; }
.input { width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
.loading { text-align: center; color: #888; padding: 1rem; }
.error { text-align: center; color: #c62828; padding: 0.5rem; background: #fbe9e7; border-radius: 8px; margin: 0.5rem 0; }
.result-box { text-align: center; padding: 1rem 0; }
.result-amount { font-size: 1.3rem; color: #333; margin: 0.3rem 0; display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
.result-target { font-size: 1.8rem; font-weight: 700; color: #1a1a1a; }
.result-sign { color: #667eea; font-weight: 600; }
.result-num { letter-spacing: -0.5px; }
.result-code { color: #888; font-size: 0.9rem; }
.result-eq { font-size: 1.5rem; color: #ccc; margin: 0.3rem 0; }
.rate-info { background: #f8f9fc; border-radius: 10px; padding: 0.8rem; text-align: center; }
.rate-line { font-size: 0.85rem; color: #666; padding: 0.15rem 0; font-family: monospace; }
.update-time { font-size: 0.75rem; color: #aaa; margin-top: 0.3rem; }
.rate-actions { text-align: center; margin-top: 0.8rem; }
.btn { padding: 0.6rem 1.5rem; background: #667eea; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn:hover { background: #5a6fd6; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.quick-pairs { margin-top: 0.5rem; }
.qp-title { font-size: 0.85rem; color: #888; margin-bottom: 0.5rem; }
.qp-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.qp-btn { padding: 0.3rem 0.7rem; background: #eef2ff; border: 1px solid #dde0ff; border-radius: 8px; font-size: 0.8rem; color: #667eea; cursor: pointer; transition: 0.1s; font-family: monospace; }
.qp-btn:hover { background: #dde0ff; }

@media (prefers-color-scheme: dark) {
  .converter,.qp-btn { background: #1a1a2e; }
  .input, .curr-select select { background: #1a1a2e; border-color: #333; color: #eee; }
  .amount-input { color: #eee; }
  .swap-btn { background: #1a1a2e; border-color: #444; color: #ddd; }
  .swap-btn:hover { background: #252545; border-color: #667eea; }
  .result-amount { color: #ddd; }
  .result-target { color: #eee; }
  .rate-info { background: #1e1e32; }
  .rate-line { color: #999; }
  .qp-btn { background: #2a2a4e; border-color: #3a3a6e; color: #8899ff; }
  .qp-btn:hover { background: #3a3a6e; }
}
</style>
