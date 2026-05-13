<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UsageGuide from '@/components/UsageGuide.vue'
const { t } = useI18n()
const units=[{key:'m',name:'m (米)',factor:1},{key:'km',name:'km (千米)',factor:1000},{key:'cm',name:'cm (厘米)',factor:0.01},{key:'mm',name:'mm (毫米)',factor:0.001},{key:'um',name:'µm (微米)',factor:0.000001},{key:'nm',name:'nm (纳米)',factor:1e-9},{key:'mi',name:'mi (英里)',factor:1609.34},{key:'yd',name:'yd (码)',factor:0.9144},{key:'ft',name:'ft (英尺)',factor:0.3048},{key:'in',name:'in (英寸)',factor:0.0254},{key:'nmi',name:'nmi (海里)',factor:1852},{key:'li',name:'里',factor:500}]
const fromVal=ref(1);const fromUnit=ref('m')
const results=computed(()=>{const f=units.find(u=>u.key===fromUnit.value);if(!f)return [];const b=fromVal.value*f.factor;return units.map(u=>({unit:u,value:b/u.factor}))})
</script>
<template><div class="converter"><div class="tool-header"><h2>{{t('lengthConverter.title')}}</h2><p class="desc">{{t('lengthConverter.desc')}}</p></div>
<div class="convert-row"><input v-model.number="fromVal" type="number" class="input"/><select v-model="fromUnit" class="select"><option v-for="u in units" :key="u.key" :value="u.key">{{u.name}}</option></select></div>
<div class="results"><div v-for="r in results" :key="r.unit.key" class="result-row"><span class="r-name">{{r.unit.name}}</span><span class="r-val">{{r.value<0.0001?r.value.toExponential(4):r.value.toLocaleString(undefined,{maximumFractionDigits:6})}}</span></div></div></div>
    <UsageGuide toolKey="lengthConverter" />
  </template>
<style scoped>.converter{max-width:500px;margin:0 auto}.convert-row{display:flex;gap:.5rem;margin:1rem 0}.input{flex:1;padding:.7rem;border:1px solid #ddd;border-radius:8px;font-size:1rem}.select{padding:.7rem;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:.9rem}.results{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}.result-row{display:flex;justify-content:space-between;padding:.7rem 1.2rem;border-bottom:1px solid #f0f0f0}.result-row:last-child{border-bottom:none}.r-name{color:#666;font-size:.9rem}.r-val{font-weight:600;color:#333;font-family:monospace}@media(prefers-color-scheme:dark){.input,.select{background:#1a1a2e;border-color:#333;color:#eee}.results{background:#1a1a2e}.result-row{border-color:#333}.r-name{color:#999}.r-val{color:#eee}}</style>