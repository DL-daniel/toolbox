<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const pattern = ref('')
const flags = ref('gm')
const text = ref('')
const testMode = ref<'match'|'replace'>('match')
const replaceWith = ref('')

const matches = computed(() => {
  if (!pattern.value || !text.value) return []
  try {
    const re = new RegExp(pattern.value, flags.value)
    if (testMode.value === 'match') {
      const results: { full: string; groups: string[]; index: number }[] = []
      let m: RegExpExecArray | null
      while ((m = re.exec(text.value)) !== null) {
        results.push({ full: m[0], groups: m.slice(1), index: m.index })
        if (m.index === re.lastIndex) re.lastIndex++
      }
      return results
    }
    return [{ full: text.value.replace(re, replaceWith.value), groups: [], index: 0 }]
  } catch { return [] }
})

const error = computed(() => {
  if (!pattern.value) return ''
  try { new RegExp(pattern.value, flags.value); return '' }
  catch (e: any) { return e.message }
})
</script>

<template>
  <div class="regex">
    <div class="tool-header"><h2>{{ t('regexTester.title') }}</h2><p class="desc">{{ t('regexTester.desc') }}</p></div>
    <div class="tabs"><button :class="{active:testMode==='match'}" @click="testMode='match'">{{ t('regexTester.match') }}</button><button :class="{active:testMode==='replace'}" @click="testMode='replace'">{{ t('regexTester.replace') }}</button></div>
    <div class="input-row"><input v-model="pattern" :placeholder="t('regexTester.patternPlaceholder')" class="input mono" /><input v-model="flags" class="input flags" maxlength="5" /></div>
    <div v-if="error" class="error">{{ error }}</div>
    <textarea v-model="text" :placeholder="t('regexTester.textPlaceholder')" class="textarea" rows="5"></textarea>
    <div v-if="testMode==='replace'" class="input-row"><input v-model="replaceWith" :placeholder="t('regexTester.replacePlaceholder')" class="input" /></div>
    <div v-if="matches.length" class="result-card">
      <div v-if="testMode==='match'">
        <p class="match-count">{{ t('regexTester.matches') }}: {{ matches.length }}</p>
        <div v-for="(m,i) in matches.slice(0,200)" :key="i" class="match-item">
          <code>#{{ i+1 }} pos {{ m.index }}: &quot;{{ m.full }}&quot;</code>
          <div v-if="m.groups.length" class="groups"><span v-for="(g,j) in m.groups" :key="j" class="group">[${{ j+1 }}] {{ g }}</span></div>
        </div>
      </div>
      <div v-else class="replace-result"><code>{{ matches[0].full }}</code></div>
    </div>
  </div>
</template>

<style scoped>
.regex{max-width:700px;margin:0 auto}
.tabs{display:flex;gap:.5rem;margin:1rem 0}
.tabs button{padding:.5rem 1rem;border:1px solid #ddd;background:#fff;border-radius:20px;cursor:pointer;font-size:.85rem}
.tabs .active{background:#667eea;color:#fff;border-color:#667eea}
.input-row{display:flex;gap:.5rem;margin:.5rem 0}
.input{flex:1;padding:.6rem;border:1px solid #ddd;border-radius:6px;font-size:.95rem}
.flags{width:70px;flex:none;text-align:center}
.mono{font-family:monospace}
.textarea{width:100%;padding:.7rem;border:1px solid #ddd;border-radius:8px;font-size:.9rem;font-family:monospace;box-sizing:border-box;resize:vertical}
.error{color:#e53935;font-size:.85rem;padding:.3rem 0}
.result-card{background:#fff;border-radius:12px;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,.06);margin-top:.5rem}
.match-count{color:#666;font-size:.85rem;margin-bottom:.5rem}
.match-item{padding:.4rem 0;border-bottom:1px solid #f0f0f0;font-size:.85rem}
.match-item code{color:#333;font-family:monospace;word-break:break-all}
.groups{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.2rem}
.group{background:#eef2ff;color:#667eea;padding:.1rem .5rem;border-radius:4px;font-size:.8rem}
.replace-result{font-size:.9rem;padding:.3rem 0}
.replace-result code{color:#2e7d32;font-family:monospace;word-break:break-all}
@media(prefers-color-scheme:dark){
  .tabs button{background:#1a1a2e;border-color:#333;color:#aaa}
  .tabs .active{background:#667eea;color:#fff}
  .input,.textarea{background:#1a1a2e;border-color:#333;color:#eee}
  .result-card{background:#1a1a2e}
  .match-item{border-color:#333}
  .match-item code{color:#ddd}
  .match-count{color:#999}
}
</style>
