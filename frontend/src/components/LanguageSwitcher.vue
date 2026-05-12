<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const { locale } = useI18n()

// 所有支持的语言列表（后续新增语言只需在这里加一项）
const languages = [
  { code: 'zh-CN', label: '简体中文', short: '中文' },
  { code: 'en', label: 'English', short: 'EN' },
]

// 切换语言并保存偏好
function switchLang(code: string) {
  locale.value = code
  localStorage.setItem('toolbox-lang', code)
  // 刷新页面标题
  document.title = code === 'zh-CN' ? '慕泽工具箱' : 'Toolbox'
}

// 初始化页面标题
watch(locale, (val) => {
  document.title = val === 'zh-CN' ? '慕泽工具箱' : 'Toolbox'
}, { immediate: true })
</script>

<template>
  <div class="lang-switcher">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="['lang-btn', { active: locale === lang.code }]"
      @click="switchLang(lang.code)"
      :title="lang.label"
    >
      {{ lang.short }}
    </button>
  </div>
</template>

<style scoped>
.lang-switcher {
  display: flex;
  gap: 2px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 2px;
}

.lang-btn {
  padding: 0.3rem 0.6rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.lang-btn:hover {
  color: #333;
}

.lang-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
