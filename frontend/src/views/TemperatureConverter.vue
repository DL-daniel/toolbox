<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const units=[{key:'c',name:'°C 摄氏度',toBase:(v:number)=>v,fromBase:(v:number)=>v},{key:'f',name:'°F 华氏度',toBase:(v:number)=>(v-32)*5/9,fromBase:(v:number)=>v*9/5+32},{key:'k',name:'K 开尔文',toBase:(v:number)=>v-273.15,fromBase:(v:number)=>v+273.15},{key:'r',name:'°Ré 列氏度',toBase:(v:number)=>v*1.25,fromBase:(v:number)=>v*0.8}]
const fromVal=ref(25);const fromUnit=ref('c')
const results=computed(()=>{const f=units.find(u=>u.key===fromUnit.value);if(!f)return [];const base=f.toBase(fromVal.value);return units.map(u=>({unit:u,value:u.fromBase(base)}))})
</script>
<template><div class="converter"><div class="tool-header"><h2>{{t('temperatureConverter.title')}}</h2><p class="desc">{{t('temperatureConverter.desc')}}</p></div>
<div class="convert-row"><input v-model.number="fromVal" type="number" class="input"/><select v-model="fromUnit" class="select"><option v-for="u in units" :key="u.key" :value="u.key">{{u.name}}</option></select></div>
<div class="results"><div v-for="r in results" :key="r.unit.key" class="result-row"><span class="r-name">{{r.unit.name}}</span><span class="r-val">{{r.value.toFixed(2)}}</span></div></div></div></template>
<style scoped>.converter{max-width:500px;margin:0 auto}.convert-row{display:flex;gap:.5rem;margin:1rem 0}.input{flex:1;padding:.7rem;border:1px solid #ddd;border-radius:8px;font-size:1rem}.select{padding:.7rem;border:1px solid #ddd;border-radius:8px;background:#fff;font-size:.9rem}.results{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}.result-row{display:flex;justify-content:space-between;padding:.7rem 1.2rem;border-bottom:1px solid #f0f0f0}.result-row:last-child{border-bottom:none}.r-name{color:#666;font-size:.9rem}.r-val{font-weight:600;color:#333;font-family:monospace}@media(prefers-color-scheme:dark){.input,.select{background:#1a1a2e;border-color:#333;color:#eee}.results{background:#1a1a2e}.result-row{border-color:#333}.r-name{color:#999}.r-val{color:#eee}}</style>