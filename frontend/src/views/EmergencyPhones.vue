<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import UsageGuide from '@/components/UsageGuide.vue'
const { t } = useI18n()

interface PhoneEntry { name: string; phone: string; category: string }
const categories = ['police','hospital','utility','service','bank','airline'] as const
const activeCat = ref<string>('police')

const phones: PhoneEntry[] = [
  { name:'报警电话', phone:'110', category:'police' },
  { name:'火警', phone:'119', category:'police' },
  { name:'急救中心', phone:'120', category:'police' },
  { name:'交通事故报警', phone:'122', category:'police' },
  { name:'短信报警', phone:'12110', category:'police' },
  { name:'森林火警', phone:'12119', category:'police' },
  { name:'水上求救', phone:'12395', category:'police' },
  { name:'全国急救中心', phone:'120', category:'hospital' },
  { name:'红十字会急救', phone:'999', category:'hospital' },
  { name:'疾病预防控制中心', phone:'12320', category:'hospital' },
  { name:'供电服务热线', phone:'95598', category:'utility' },
  { name:'供水服务热线', phone:'96116', category:'utility' },
  { name:'燃气服务热线', phone:'96777', category:'utility' },
  { name:'天气预报', phone:'12121', category:'utility' },
  { name:'邮政客服', phone:'11185', category:'utility' },
  { name:'铁路客服', phone:'12306', category:'utility' },
  { name:'民航订票', phone:'95539', category:'utility' },
  { name:'政府服务便民热线', phone:'12345', category:'service' },
  { name:'消费者投诉举报', phone:'12315', category:'service' },
  { name:'环保举报', phone:'12369', category:'service' },
  { name:'劳动保障咨询', phone:'12333', category:'service' },
  { name:'文化市场举报', phone:'12318', category:'service' },
  { name:'烟草专卖举报', phone:'12313', category:'service' },
  { name:'知识产权维权', phone:'12330', category:'service' },
  { name:'国家电网客服', phone:'95598', category:'service' },
  { name:'中国银行', phone:'95566', category:'bank' },
  { name:'工商银行', phone:'95588', category:'bank' },
  { name:'建设银行', phone:'95533', category:'bank' },
  { name:'农业银行', phone:'95599', category:'bank' },
  { name:'招商银行', phone:'95555', category:'bank' },
  { name:'交通银行', phone:'95559', category:'bank' },
  { name:'邮政储蓄银行', phone:'95580', category:'bank' },
  { name:'国航客服', phone:'95583', category:'airline' },
  { name:'南航客服', phone:'95539', category:'airline' },
  { name:'东航客服', phone:'95530', category:'airline' },
  { name:'海航客服', phone:'95339', category:'airline' },
  { name:'铁路12306', phone:'12306', category:'airline' },
]

const filtered = () => phones.filter(p => p.category === activeCat.value)
const catLabel = (c: string) => t('emergencyPhones.cat_' + c)
</script>

<template>
  <div class="emergency-phones">
    <div class="tool-header">
      <h2>{{ t('emergencyPhones.title') }}</h2>
      <p class="desc">{{ t('emergencyPhones.desc') }}</p>
    </div>
    <div class="tabs">
      <button v-for="c in categories" :key="c" :class="['tab', { active: activeCat === c }]" @click="activeCat = c">{{ catLabel(c) }}</button>
    </div>
    <div class="phone-list">
      <div v-for="p in filtered()" :key="p.phone + p.name" class="phone-item">
        <span class="phone-name">{{ p.name }}</span>
        <span class="phone-number">{{ p.phone }}</span>
      </div>
    </div>
  </div>

    <UsageGuide toolKey="emergencyPhones" />
  </template>

<style scoped>
.emergency-phones { max-width: 600px; margin: 0 auto; }
.tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 1rem 0; }
.tab { padding:0.5rem 1rem; border:1px solid #ddd; background:#fff; border-radius:20px; cursor:pointer; font-size:0.85rem; }
.tab.active { background:#667eea; color:#fff; border-color:#667eea; }
.phone-list { background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.phone-item { display:flex; justify-content:space-between; padding:0.8rem 1.2rem; border-bottom:1px solid #f0f0f0; }
.phone-item:last-child { border-bottom:none; }
.phone-name { color:#333; }
.phone-number { font-weight:700; color:#667eea; font-family:monospace; font-size:1.1rem; }
@media (prefers-color-scheme: dark) {
  .tab { background: #1a1a2e; border-color: #333; color: #aaa; }
  .phone-list { background: #1a1a2e; }
  .phone-item { border-color: #333; }
  .phone-name { color: #ddd; }
  .tab.active { background:#667eea; color:#fff; }
}
</style>