<script setup lang="ts">
import { ref } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
const { t } = useI18nt()
import * as toml from 'smol-toml'
import yaml from 'js-yaml'
import UsageGuide from '@/components/UsageGuide.vue'

const srcFormat = ref<'json' | 'yaml' | 'toml'>('json')
const dstFormat = ref<'json' | 'yaml' | 'toml'>('yaml')
const input = ref('')
const output = ref('')
const error = ref('')

function convert() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  try {
    // parse
    let data: any
    switch (srcFormat.value) {
      case 'json': data = JSON.parse(input.value.trim()); break
      case 'yaml': data = yaml.load(input.value.trim()); break
      case 'toml': data = toml.parse(input.value.trim()); break
    }
    // stringify
    switch (dstFormat.value) {
      case 'json': output.value = JSON.stringify(data, null, 2); break
      case 'yaml': output.value = yaml.dump(data, { indent: 2, lineWidth: 120, noRefs: true }); break
      case 'toml': output.value = toml.stringify(data as any); break
    }
  } catch (e: any) {
    error.value = e.message
  }
}

function swap() {
  const f = srcFormat.value
  srcFormat.value = dstFormat.value
  dstFormat.value = f
  if (output.value) {
    input.value = output.value
    output.value = ''
  }
}

async function copyOutput() {
  if (!output.value) return
  await navigator.clipboard.writeText(output.value)
}
</script>

<template>
  <div class="tool">
    <div class="tool-header">

      <h2>{{ t('formatConv.title') }}</h2>

      <p class="desc">{{ t('formatConv.subtitle') }}</p>

    </div>

    <div class="format-bar">
      <div class="format-pair">
        <select v-model="srcFormat" class="select">
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="toml">TOML</option>
        </select>
        <span class="arrow-icon">→</span>
        <select v-model="dstFormat" class="select">
          <option value="json">JSON</option>
          <option value="yaml">YAML</option>
          <option value="toml">TOML</option>
        </select>
      </div>
      <button @click="swap" class="btn-swap">⇄ {{ t('formatConv.swap') }}</button>
    </div>

    <div class="editor-row">
      <div class="editor-col">
        <label class="editor-label">{{ t('formatConv.input') }} ({{ srcFormat.toUpperCase() }})</label>
        <textarea v-model="input" :placeholder="t('formatConv.inputPlaceholder', { fmt: srcFormat.toUpperCase() })" rows="10" class="textarea" spellcheck="false"></textarea>
      </div>
      <div class="editor-col">
        <label class="editor-label">{{ t('formatConv.output') }} ({{ dstFormat.toUpperCase() }})</label>
        <textarea :value="output" :placeholder="t('formatConv.outputPlaceholder')" rows="10" class="textarea output" readonly spellcheck="false"></textarea>
      </div>
    </div>

    <div class="actions">
      <button @click="convert" class="btn">{{ t('formatConv.convert') }}</button>
      <button v-if="output" @click="copyOutput" class="btn">{{ t('common.copy') }}</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </div>

    <UsageGuide toolKey="formatConverter" />
  </template>

<style scoped>
.tool { max-width: 900px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 1.2rem; }

.format-bar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.format-pair { display: flex; align-items: center; gap: 0.5rem; }
.select {
  padding: 0.4rem 0.6rem; border: 1px solid #d0d5dd; border-radius: 6px;
  font-size: 0.85rem; background: #fff; color: #333; cursor: pointer;
}
.select:focus { outline: none; border-color: #4a90d9; }
.arrow-icon { font-size: 1.2rem; color: #999; }
.btn-swap {
  padding: 0.35rem 0.7rem; border: 1px solid #d0d5dd; border-radius: 6px;
  background: #fff; font-size: 0.8rem; cursor: pointer; color: #666; transition: all 0.12s;
}
.btn-swap:hover { border-color: #4a90d9; background: #4a90d9; color: #fff; }

.editor-row { display: flex; gap: 1rem; margin-bottom: 0.6rem; }
.editor-col { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.editor-label { font-size: 0.78rem; font-weight: 600; color: #777; margin-bottom: 0.3rem; }
.textarea {
  width: 100%; padding: 0.6rem; border: 1px solid #d0d5dd; border-radius: 8px;
  font-family: 'SF Mono','Consolas',monospace; font-size: 0.82rem; line-height: 1.5;
  resize: vertical; background: #fff; color: #333; box-sizing: border-box;
}
.textarea:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 3px rgba(74,144,217,0.1); }
.textarea.output { background: #f8f9fb; }

.actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn {
  padding: 0.4rem 1rem; border: 1px solid #d0d5dd; border-radius: 6px;
  background: #fff; font-size: 0.82rem; cursor: pointer; color: #555; transition: all 0.12s;
}
.btn:hover { border-color: #4a90d9; background: #4a90d9; color: #fff; }
.error { color: #d32f2f; font-size: 0.82rem; margin-top: 0.3rem; }

@media (prefers-color-scheme: dark) {
  .select { background: #1e1e2e; border-color: #333; color: #ddd; }
  .btn-swap { background: #1e1e2e; border-color: #333; color: #aaa; }
  .btn-swap:hover { background: #4a90d9; color: #fff; }
  .textarea { background: #1e1e2e; border-color: #333; color: #ddd; }
  .textarea.output { background: #14141e; }
  .btn { background: #1e1e2e; border-color: #333; color: #aaa; }
  .btn:hover { background: #4a90d9; color: #fff; }
}
</style>
