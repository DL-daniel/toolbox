<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import UsageGuide from '@/components/UsageGuide.vue'
const { t } = useI18nt()

const raw = ref('')
const error = ref('')
const expanded = ref<Set<string>>(new Set())
const fileInput = ref<HTMLInputElement>()

interface FlatNode {
  key: string
  path: string
  type: string
  depth: number
  isLeaf: boolean
  hasChildren: boolean
  value: string
}

function openFilePicker() { fileInput.value?.click() }

function loadFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const r = new FileReader()
  r.onload = () => { raw.value = r.result as string }
  r.readAsText(f)
}

function buildFlat(data: any, depth = 0, path = '$'): FlatNode[] {
  const result: FlatNode[] = []
  if (data === null) {
    result.push({ key: path, path, type: 'null', depth, isLeaf: true, hasChildren: false, value: 'null' })
    return result
  }
  const t = typeof data
  if (t === 'object' && Array.isArray(data)) {
    const key = path.split('.').pop() || path
    result.push({ key: key === '$' ? 'root' : key, path, type: 'array', depth, isLeaf: false, hasChildren: data.length > 0, value: `[${data.length}]` })
    if (expanded.value.has(path)) {
      data.forEach((v, i) => { result.push(...buildFlat(v, depth + 1, `${path}[${i}]`)) })
    }
  } else if (t === 'object') {
    const keys = Object.keys(data)
    const key = path.split('.').pop() || path
    result.push({ key: key === '$' ? 'root' : key, path, type: 'object', depth, isLeaf: false, hasChildren: keys.length > 0, value: `{${keys.length}}` })
    if (expanded.value.has(path)) {
      keys.forEach(k => { result.push(...buildFlat(data[k], depth + 1, `${path}.${k}`)) })
    }
  } else {
    const key = path.split('.').pop() || path
    const v = t === 'string' ? `"${data}"` : String(data)
    result.push({ key, path, type: t as string, depth, isLeaf: true, hasChildren: false, value: v })
  }
  return result
}

const flatNodes = computed(() => {
  error.value = ''
  if (!raw.value.trim()) return []
  try {
    const parsed = JSON.parse(raw.value.trim())
    expanded.value.add('$')
    return buildFlat(parsed)
  } catch (e: any) {
    error.value = e.message
    return []
  }
})

function toggle(path: string) {
  if (expanded.value.has(path)) expanded.value.delete(path)
  else expanded.value.add(path)
}

function format() {
  if (!raw.value.trim()) return
  try { raw.value = JSON.stringify(JSON.parse(raw.value.trim()), null, 2); error.value = '' }
  catch (e: any) { error.value = e.message }
}

function compress() {
  if (!raw.value.trim()) return
  try { raw.value = JSON.stringify(JSON.parse(raw.value.trim())); error.value = '' }
  catch (e: any) { error.value = e.message }
}

async function copyPath(p: string) { await navigator.clipboard.writeText(p) }

function expandAll() {
  expanded.value = new Set(flatNodes.value.filter(n => n.hasChildren).map(n => n.path))
  expanded.value.add('$')
}
function collapseAll() { expanded.value = new Set(['$']) }

function typeClass(t: string) {
  const map: Record<string, string> = { string: 'str', number: 'num', boolean: 'bool', null: 'null' }
  return map[t] || ''
}
</script>

<template>
  <div class="tool">
    <div class="tool-header">

      <h2>{{ t('jsonParser.title') }}</h2>

      <p class="desc">{{ t('jsonParser.subtitle') }}</p>

    </div>

    <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">
      <textarea v-model="raw" :placeholder="t('jsonParser.placeholder')" rows="8" class="textarea" spellcheck="false" style="flex:1"></textarea>
    </div>

    <div class="actions">
      <button @click="format" class="btn">{{ t('jsonParser.format') }}</button>
      <button @click="compress" class="btn">{{ t('jsonParser.compress') }}</button>
      <input ref="fileInput" type="file" accept=".json" @change="loadFile" hidden />
      <button @click="openFilePicker" class="btn">📂</button>
      <span v-if="flatNodes.length" class="info">{{ t('jsonParser.size', { n: flatNodes.filter(n => n.isLeaf).length }) }}</span>
    </div>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="flatNodes.length" class="tree-wrap">
      <div class="tree-actions">
        <button @click="expandAll" class="btn-sm">{{ t('jsonParser.expandAll') }}</button>
        <button @click="collapseAll" class="btn-sm">{{ t('jsonParser.collapseAll') }}</button>
      </div>
      <div class="tree">
        <div v-for="node in flatNodes" :key="node.path" class="node-row" :style="{ paddingLeft: (node.depth * 16) + 'px' }">
          <!-- toggle arrow for containers -->
          <span v-if="node.hasChildren" class="arrow" :class="{ open: expanded.has(node.path) }" @click="toggle(node.path)">▶</span>
          <span v-else class="arrow-spacer"></span>

          <!-- container labels -->
          <span v-if="!node.isLeaf" class="node-key" @click="toggle(node.path)">
            <span class="type-badge" :class="node.type">{{ node.type }}</span>
            <span class="key-name">{{ node.key }}</span>
            <span class="key-preview">{{ node.value }}</span>
          </span>

          <!-- leaf values -->
          <template v-else>
            <span class="node-copy" @click="copyPath(node.path)">📋</span>
            <span class="key-name leaf">{{ node.key }}</span>
            <span :class="['val', typeClass(node.type)]">{{ node.value }}</span>
            <span class="type-badge mini" :class="typeClass(node.type)">{{ node.type }}</span>
          
    <UsageGuide toolKey="jsonParser" />
  </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool { max-width: 800px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 1.2rem; }

.textarea {
  width: 100%; padding: 0.75rem;
  border: 1px solid #d0d5dd; border-radius: 8px;
  font-family: 'SF Mono','Consolas',monospace; font-size: 0.85rem; line-height: 1.5;
  resize: vertical; background: #fff; color: #333;
  box-sizing: border-box;
}
.textarea:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 3px rgba(74,144,217,0.1); }

.actions { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.3rem; flex-wrap: wrap; }
.btn {
  padding: 0.4rem 0.9rem; border: 1px solid #d0d5dd; border-radius: 6px;
  background: #fff; font-size: 0.82rem; cursor: pointer; color: #555; transition: all 0.12s;
}
.btn:hover { border-color: #4a90d9; background: #4a90d9; color: #fff; }
.info { font-size: 0.78rem; color: #888; margin-left: auto; }
.error { color: #d32f2f; font-size: 0.82rem; margin-top: 0.3rem; }

.tree-wrap { margin-top: 1rem; border: 1px solid #e0e4ea; border-radius: 8px; overflow: hidden; }
.tree-actions { display: flex; gap: 0.4rem; padding: 0.4rem 0.6rem; background: #f8f9fb; border-bottom: 1px solid #e0e4ea; }
.btn-sm {
  padding: 0.2rem 0.5rem; border: 1px solid #d0d5dd; border-radius: 4px;
  background: #fff; font-size: 0.75rem; cursor: pointer; color: #666;
}
.btn-sm:hover { border-color: #4a90d9; }

.tree { padding: 0.25rem 0; font-family: 'SF Mono','Consolas',monospace; font-size: 0.84rem; }
.node-row { display: flex; align-items: center; gap: 0.25rem; padding: 0.15rem 0; }
.arrow { font-size: 0.7rem; color: #999; cursor: pointer; width: 1rem; text-align: center; transition: transform 0.12s; user-select: none; flex-shrink: 0; }
.arrow.open { transform: rotate(90deg); }
.arrow-spacer { width: 1rem; flex-shrink: 0; }
.node-key { cursor: pointer; display: flex; align-items: center; gap: 0.35rem; }
.node-copy { cursor: pointer; font-size: 0.75rem; opacity: 0.5; flex-shrink: 0; }
.node-copy:hover { opacity: 1; }
.key-name { color: #8a6534; }
.key-preview { color: #999; font-size: 0.78rem; }

.val { }
.val.str { color: #0a7; }
.val.num { color: #4a90d9; }
.val.bool { color: #c96; }
.val.null { color: #999; }

.type-badge {
  font-size: 0.65rem; padding: 0.05rem 0.35rem; border-radius: 3px;
  background: #f0f2f5; color: #777; vertical-align: middle;
  flex-shrink: 0;
}
.type-badge.mini { font-size: 0.6rem; padding: 0.02rem 0.25rem; }
.type-badge.str { background: #e6f7e6; color: #2a7; }
.type-badge.num { background: #e6f0ff; color: #479; }
.type-badge.bool { background: #fff3e6; color: #b75; }
.type-badge.null { background: #f0f0f0; color: #999; }
.type-badge.object { background: #eef; color: #66a; }
.type-badge.array { background: #eef; color: #66a; }

@media (prefers-color-scheme: dark) {
  .textarea { background: #1e1e2e; border-color: #333; color: #ddd; }
  .btn { background: #1e1e2e; border-color: #333; color: #aaa; }
  .btn:hover { background: #4a90d9; color: #fff; }
  .tree-wrap { border-color: #2a2a3a; }
  .tree-actions { background: #1a1a2a; border-color: #2a2a3a; }
  .btn-sm { background: #2a2a3a; border-color: #3a3a4a; color: #aaa; }
  .btn-sm:hover { border-color: #5a8ed9; }
  .key-name { color: #c9a96a; }
  .key-preview { color: #777; }
  .arrow { color: #777; }
  .type-badge { background: #2a2a3a; color: #999; }
  .type-badge.str { background: #1a3a1a; color: #5c5; }
  .type-badge.num { background: #1a2a3a; color: #5af; }
  .type-badge.bool { background: #3a2a1a; color: #da5; }
  .type-badge.null { background: #2a2a2a; color: #888; }
  .type-badge.object, .type-badge.array { background: #1a1a3a; color: #88a; }
}
</style>
