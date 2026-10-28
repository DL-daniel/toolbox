<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import UsageGuide from '@/components/UsageGuide.vue'

const { t } = useI18nt()
const canvasRef = ref<HTMLCanvasElement | null>(null)

const inputText = ref('Hello, World!')
const fontSize = ref(48)
const fontFamily = ref('Arial')
const fontColor = ref('#333333')
const bgColor = ref('#ffffff')
const canvasWidth = ref(800)
const canvasHeight = ref(400)
const padding = ref(40)
const isBold = ref(false)
const isItalic = ref(false)
const lineHeight = ref(1.4)

const fontFamilies = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana', 'Tahoma', 'Impact', 'Comic Sans MS', 'Microsoft YaHei', 'SimSun', 'SimHei', 'KaiTi', 'FangSong']

const presets = [
  { label: 'OG 1200×630', w: 1200, h: 630 },
  { label: 'Twitter 1200×675', w: 1200, h: 675 },
  { label: 'Instagram 1080×1080', w: 1080, h: 1080 },
  { label: 'Facebook 1200×630', w: 1200, h: 630 },
  { label: 'Pinterest 1000×1500', w: 1000, h: 1500 },
  { label: 'A4 比例', w: 595, h: 842 },
  { label: '宽屏 16:9', w: 1280, h: 720 },
  { label: '正方形 800×800', w: 800, h: 800 },
]

function applyPreset(p: { w: number, h: number }) {
  canvasWidth.value = p.w
  canvasHeight.value = p.h
  nextTick(() => renderImage())
}

const fontStyle = computed(() => {
  const style: string[] = []
  if (isItalic.value) style.push('italic')
  if (isBold.value) style.push('bold')
  return style.join(' ')
})

function renderImage() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = canvasWidth.value
  canvas.height = canvasHeight.value

  ctx.fillStyle = bgColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const text = inputText.value || ' '
  const p = Math.min(padding.value, canvas.width / 4, canvas.height / 4)
  const maxW = canvas.width - p * 2
  const maxH = canvas.height - p * 2

  let fs = fontSize.value
  const lines = text.split('\n')

  for (let attempt = 0; attempt < 20; attempt++) {
    ctx.font = `${fontStyle.value} ${fs}px ${fontFamily.value}`
    const lineH = fs * lineHeight.value
    const totalH = lines.length * lineH
    let maxWLine = 0
    for (const l of lines) {
      maxWLine = Math.max(maxWLine, ctx.measureText(l || ' ').width)
    }
    if (maxWLine <= maxW && totalH <= maxH) break
    fs -= 2
    if (fs < 8) { fs = 8; break }
  }

  ctx.font = `${fontStyle.value} ${fs}px ${fontFamily.value}`
  ctx.fillStyle = fontColor.value
  ctx.textBaseline = 'top'

  const lineH = fs * lineHeight.value
  const totalTextH = lines.length * lineH
  let startY = p + (maxH - totalTextH) / 2

  for (const l of lines) {
    const displayText = l || ' '
    const textW = ctx.measureText(displayText).width
    const x = p + (maxW - textW) / 2
    ctx.fillText(displayText, x, startY)
    startY += lineH
  }
}

function downloadImage() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = 'text-to-image.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

async function copyImage() {
  const canvas = canvasRef.value
  if (!canvas) return
  try {
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'))
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
  } catch {
    downloadImage()
  }
}
</script>

<template>
  <div class="text-to-image">
    <div class="tool-header-area">
      <h2 class="tool-heading">{{ t('textToImage.title') }}</h2>
      <p class="tool-desc">{{ t('textToImage.desc') }}</p>
    </div>

    <div class="tool-main">
      <!-- 左侧控制面板 -->
      <div class="tool-sidebar-controls">
        <!-- 文本输入 -->
        <div class="control-card">
          <div class="card-header">
            <span class="card-icon">✏️</span>
            <span class="card-title">{{ t('textToImage.inputLabel') }}</span>
          </div>
          <textarea
            v-model="inputText"
            :placeholder="t('textToImage.placeholder')"
            rows="5"
            class="text-input"
            @input="renderImage"
          />
        </div>

        <!-- 预设尺寸 -->
        <div class="control-card">
          <div class="card-header">
            <span class="card-icon">📐</span>
            <span class="card-title">{{ t('textToImage.presets') }}</span>
          </div>
          <div class="preset-grid">
            <button
              v-for="p in presets"
              :key="p.label"
              class="preset-btn"
              :style="{
                background: p.w === canvasWidth && p.h === canvasHeight
                  ? 'var(--accent-color, #6366f1)'
                  : '',
                color: p.w === canvasWidth && p.h === canvasHeight
                  ? '#fff' : '',
                borderColor: p.w === canvasWidth && p.h === canvasHeight
                  ? 'var(--accent-color, #6366f1)' : ''
              }"
              @click="applyPreset(p)"
            >{{ p.label }}</button>
          </div>
        </div>

        <!-- 自定义尺寸 -->
        <div class="control-card">
          <div class="card-header">
            <span class="card-icon">📏</span>
            <span class="card-title">{{ t('textToImage.dimensions') }}</span>
          </div>
          <div class="size-row">
            <div class="size-field">
              <span class="size-label">W</span>
              <input v-model.number="canvasWidth" type="number" min="100" max="4000" class="size-input" @input="renderImage" />
            </div>
            <span class="size-sep">×</span>
            <div class="size-field">
              <span class="size-label">H</span>
              <input v-model.number="canvasHeight" type="number" min="100" max="4000" class="size-input" @input="renderImage" />
            </div>
            <span class="size-unit">px</span>
          </div>
        </div>

        <!-- 字体设置 -->
        <div class="control-card">
          <div class="card-header">
            <span class="card-icon">🔤</span>
            <span class="card-title">{{ t('textToImage.font') }}</span>
          </div>
          <select v-model="fontFamily" class="font-select" @change="renderImage">
            <option v-for="f in fontFamilies" :key="f" :value="f">{{ f }}</option>
          </select>

          <div class="slider-row">
            <span class="slider-label">{{ t('textToImage.fontSize') }}</span>
            <input v-model.number="fontSize" type="range" min="12" max="200" class="control-range" @input="renderImage" />
            <span class="slider-value">{{ fontSize }}px</span>
          </div>

          <div class="slider-row">
            <span class="slider-label">{{ t('textToImage.lineHeight') }}</span>
            <input v-model.number="lineHeight" type="range" min="1" max="3" step="0.1" class="control-range" @input="renderImage" />
            <span class="slider-value">{{ lineHeight.toFixed(1) }}</span>
          </div>

          <div class="checkbox-row">
            <label class="toggle-btn" :class="{ active: isBold }">
              <input v-model="isBold" type="checkbox" @change="renderImage" />
              <span class="toggle-icon" style="font-weight: 700">B</span>
            </label>
            <label class="toggle-btn" :class="{ active: isItalic }">
              <input v-model="isItalic" type="checkbox" @change="renderImage" />
              <span class="toggle-icon" style="font-style: italic">I</span>
            </label>
          </div>
        </div>

        <!-- 颜色设置 -->
        <div class="control-card">
          <div class="card-header">
            <span class="card-icon">🎨</span>
            <span class="card-title">{{ t('textToImage.fontColor') }}</span>
          </div>
          <div class="color-row">
            <div class="color-swatch-wrap">
              <input v-model="fontColor" type="color" class="color-picker" @input="renderImage" />
              <div class="color-swatch" :style="{ background: fontColor }" />
            </div>
            <input v-model="fontColor" class="color-hex" @input="renderImage" />
          </div>
        </div>

        <div class="control-card">
          <div class="card-header">
            <span class="card-icon">🖼️</span>
            <span class="card-title">{{ t('textToImage.bgColor') }}</span>
          </div>
          <div class="color-row">
            <div class="color-swatch-wrap">
              <input v-model="bgColor" type="color" class="color-picker" @input="renderImage" />
              <div class="color-swatch" :style="{ background: bgColor }" />
            </div>
            <input v-model="bgColor" class="color-hex" @input="renderImage" />
            <button
              :class="['trans-btn', { active: bgColor === '#ffffff' }]"
              @click="bgColor = '#ffffff'; renderImage()"
            >{{ t('textToImage.transparent') }}</button>
          </div>
        </div>

        <!-- 内边距 -->
        <div class="control-card">
          <div class="card-header">
            <span class="card-icon">⬜</span>
            <span class="card-title">{{ t('textToImage.padding') }}</span>
          </div>
          <div class="slider-row">
            <input v-model.number="padding" type="range" min="0" max="200" class="control-range" @input="renderImage" />
            <span class="slider-value">{{ padding }}px</span>
          </div>
        </div>
      </div>

      <!-- 右侧预览区 -->
      <div class="tool-canvas-area">
        <div class="canvas-panel">
          <div class="canvas-toolbar">
            <span class="canvas-dim">{{ canvasWidth }} × {{ canvasHeight }}px · PNG</span>
            <button class="action-btn secondary" @click="renderImage">
              <span>🔄</span> {{ t('textToImage.render') }}
            </button>
          </div>
          <div class="canvas-wrapper">
            <canvas ref="canvasRef" class="preview-canvas" />
          </div>
        </div>
        <div class="canvas-actions">
          <button class="action-btn primary" @click="downloadImage">
            <span>⬇️</span> {{ t('textToImage.download') }}
          </button>
          <button class="action-btn secondary" @click="copyImage">
            <span>📋</span> {{ t('textToImage.copy') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 操作说明放到下面 -->
    <div class="guide-section">
      <UsageGuide tool-key="textToImage" />
    </div>
  </div>
</template>

<style scoped>
/* ======== 布局 ======== */
.text-to-image {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tool-header-area {
  text-align: center;
  padding: 12px 0 4px;
}
.tool-heading {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--accent-color, #6366f1), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.tool-desc {
  font-size: 14px;
  color: var(--text-secondary, #888);
  margin: 4px 0 0;
}

.tool-main {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* ======== 左侧控制面板 ======== */
.tool-sidebar-controls {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-card {
  background: var(--card-bg, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.2s;
}
.control-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-icon {
  font-size: 15px;
  line-height: 1;
}
.card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color, #333);
  letter-spacing: 0.3px;
}

/* 文本输入 */
.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  line-height: 1.5;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.text-input:focus {
  outline: none;
  border-color: var(--accent-color, #6366f1);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}

/* 预设按钮 */
.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.preset-btn {
  padding: 5px 10px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.preset-btn:hover {
  border-color: var(--accent-color, #6366f1);
  color: var(--accent-color, #6366f1);
}

/* 尺寸行 */
.size-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.size-field {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.size-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary, #666);
  width: 18px;
  text-align: center;
}
.size-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
  transition: border-color 0.2s;
}
.size-input:focus {
  outline: none;
  border-color: var(--accent-color, #6366f1);
}
.size-sep {
  font-size: 14px;
  color: var(--text-secondary, #999);
  font-weight: 300;
}
.size-unit {
  font-size: 11px;
  color: var(--text-secondary, #999);
  font-weight: 500;
  min-width: 20px;
}

/* 字型选择 */
.font-select {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 8px;
  font-size: 13px;
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.2s;
}
.font-select:focus {
  outline: none;
  border-color: var(--accent-color, #6366f1);
}

/* 滑块行 */
.slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.slider-label {
  font-size: 12px;
  color: var(--text-secondary, #666);
  min-width: 60px;
  flex-shrink: 0;
}
.control-range {
  flex: 1;
  accent-color: var(--accent-color, #6366f1);
  cursor: pointer;
}
.slider-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color, #333);
  min-width: 36px;
  text-align: right;
}

/* 样式切换 */
.checkbox-row {
  display: flex;
  gap: 8px;
}
.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bg-color, #fff);
}
.toggle-btn input { display: none; }
.toggle-icon {
  font-size: 15px;
  color: var(--text-secondary, #666);
  user-select: none;
}
.toggle-btn.active {
  background: var(--accent-color, #6366f1);
  border-color: var(--accent-color, #6366f1);
}
.toggle-btn.active .toggle-icon { color: #fff; }

/* 颜色行 */
.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.color-swatch-wrap {
  position: relative;
  width: 36px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color, #d0d5dd);
  flex-shrink: 0;
}
.color-picker {
  position: absolute;
  inset: -4px;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  padding: 0;
  border: none;
  cursor: pointer;
  opacity: 0;
}
.color-swatch {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}
.color-hex {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
  transition: border-color 0.2s;
}
.color-hex:focus {
  outline: none;
  border-color: var(--accent-color, #6366f1);
}
.trans-btn {
  padding: 6px 10px;
  border: 1px solid var(--border-color, #d0d5dd);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.trans-btn.active,
.trans-btn:hover {
  background: var(--accent-color, #6366f1);
  color: #fff;
  border-color: var(--accent-color, #6366f1);
}

/* ======== 右侧画布区 ======== */
.tool-canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 20px;
}

.canvas-panel {
  background: var(--card-bg, #f8f9fa);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-color, #fff);
}
.canvas-dim {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #888);
}

.canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 200px;
  background: repeating-conic-gradient(
    var(--checker-bg, #e8e8e8) 0% 25%,
    var(--checker-alt, #fff) 0% 50%
  ) 0 0 / 20px 20px;
}
.preview-canvas {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.canvas-actions {
  display: flex;
  gap: 10px;
}

/* ======== 通用按钮 ======== */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  flex: 1;
  justify-content: center;
}
.action-btn span { font-size: 16px; line-height: 1; }
.action-btn.primary {
  background: linear-gradient(135deg, var(--accent-color, #6366f1), #7c3aed);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99,102,241,0.25);
}
.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99,102,241,0.35);
}
.action-btn.secondary {
  background: var(--bg-color, #fff);
  border: 1px solid var(--border-color, #d0d5dd);
  color: var(--text-color, #333);
}
.action-btn.secondary:hover {
  background: var(--hover-bg, #f3f4f6);
}

/* ======== 操作说明 ======== */
.guide-section {
  margin-top: 8px;
}

/* ======== 暗色模式修正 ======== */
:root.dark .control-card,
:root.dark .canvas-panel {
  background: var(--card-bg, #1e1e2e);
  border-color: var(--border-color, #2d2d3d);
}
:root.dark .canvas-toolbar {
  background: var(--bg-color, #1a1a2e);
  border-color: var(--border-color, #2d2d3d);
}

/* ======== 移动端 ======== */
@media (max-width: 768px) {
  .tool-main {
    flex-direction: column;
  }
  .tool-sidebar-controls {
    flex: none;
    width: 100%;
  }
  .tool-canvas-area {
    position: static;
  }
}
</style>
