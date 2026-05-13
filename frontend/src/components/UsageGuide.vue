<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toolTips } from '@/data/toolTips'

const { locale } = useI18n()
const props = defineProps<{ toolKey: string }>()
const tips = toolTips[props.toolKey]
</script>

<template>
  <div v-if="tips && tips.length" class="guide">
    <div class="guide-header">
      <span class="guide-icon">💡</span>
      <span class="guide-title">{{ locale.startsWith('zh') ? '使用说明' : 'How to Use' }}</span>
    </div>
    <div class="guide-body">
      <div v-for="(tip, i) in tips" :key="i" class="guide-item">
        <span class="gi-icon">{{ tip.icon }}</span>
        <span class="gi-text">{{ locale.startsWith('zh') ? tip.zh : tip.en }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide {
  margin-top: 2rem;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.guide-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}
.guide-icon { font-size: 1.1rem; }
.guide-body { padding: 0.8rem 1.2rem 1rem; }
.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.45rem 0;
  font-size: 0.88rem;
  color: #444;
  line-height: 1.5;
  border-bottom: 1px solid #f5f5f5;
}
.guide-item:last-child { border-bottom: none; }
.gi-icon { flex-shrink: 0; font-size: 1rem; margin-top: 1px; }
.gi-text { flex: 1; }

@media (prefers-color-scheme: dark) {
  .guide { background: #1a1a2e; }
  .guide-item { color: #bbb; border-bottom-color: #2a2a3e; }
}
</style>
