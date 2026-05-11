<script setup lang="ts">
import { ref } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
const { t } = useI18nt()

const imageUrl = ref('')
const watermarkText = ref('Watermark')
const fontSize = ref(48)
const opacity = ref(0.3)
const position = ref<'tl'|'tr'|'bl'|'br'|'center'>('br')
const resultUrl = ref('')
const fileName = ref('')
const fileInput = ref<HTMLInputElement>()

function openFilePicker() { fileInput.value?.click() }

function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files[0]
  if (!f) return
  fileName.value = f.name.replace(/\.[^.]+$/, '') + '_watermarked.png'
  const r = new FileReader()
  r.onload = () => { imageUrl.value = r.result as string }
  r.readAsDataURL(f)
}

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  fileName.value = file.name.replace(/\.[^.]+$/, '') + '_watermarked.png'
  const reader = new FileReader()
  reader.onload = () => { imageUrl.value = reader.result as string }
  reader.readAsDataURL(file)
}

function drawWatermark() {
  if (!imageUrl.value) return
  const img = new Image()
  img.onload = () => {
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)

    ctx.globalAlpha = opacity.value
    ctx.font = `bold ${fontSize.value}px "Microsoft YaHei","PingFang SC",sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // multiple lines for larger coverage
    const text = watermarkText.value || 'Watermark'
    const lineH = fontSize.value * 3
    const rot = -Math.PI / 6
    ctx.translate(c.width / 2, c.height / 2)
    ctx.rotate(rot)

    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    for (let y = -c.height; y < c.height * 2; y += lineH) {
      for (let x = -c.width; x < c.width * 2; x += ctx.measureText(text).width + 100) {
        ctx.fillText(text, x, y)
      }
    }

    // position-based single watermark
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = Math.min(1, opacity.value * 2.5)
    ctx.textAlign = position.value === 'center' ? 'center' : position.value.includes('l') ? 'left' : 'right'
    ctx.textBaseline = position.value.includes('t') ? 'top' : 'bottom'
    const pad = 30
    const px = position.value === 'center' ? c.width / 2 : position.value.includes('l') ? pad : c.width - pad
    const py = position.value === 'center' ? c.height / 2 : position.value.includes('t') ? pad : c.height - pad
    ctx.fillText(text, px, py)

    resultUrl.value = c.toDataURL('image/png')
  }
  img.src = imageUrl.value
}

function download() {
  if (!resultUrl.value) return
  const a = document.createElement('a')
  a.href = resultUrl.value
  a.download = fileName.value || 'watermarked.png'
  a.click()
}
</script>

<template>
  <div class="tool">
    <h2>{{ t('imageWatermark.title') }}</h2>
    <p class="subtitle">{{ t('imageWatermark.subtitle') }}</p>

    <div class="upload-area" @click="openFilePicker" @dragover.prevent @drop.prevent="onDrop">
      <input ref="fileInput" type="file" accept="image/*" @change="onFile" hidden />
      <span v-if="!imageUrl">{{ t('imageWatermark.uploadHint') }}</span>
      <img v-else :src="imageUrl" class="preview" />
    </div>

    <div class="controls">
      <div class="ctrl">
        <label>{{ t('imageWatermark.text') }}</label>
        <input v-model="watermarkText" class="input" />
      </div>
      <div class="ctrl">
        <label>{{ t('imageWatermark.fontSize') }}</label>
        <input v-model.number="fontSize" type="range" min="16" max="120" class="range" />
        <span class="range-val">{{ fontSize }}px</span>
      </div>
      <div class="ctrl">
        <label>{{ t('imageWatermark.opacity') }}</label>
        <input v-model.number="opacity" type="range" min="0.05" max="1" step="0.05" class="range" />
        <span class="range-val">{{ Math.round(opacity * 100) }}%</span>
      </div>
      <div class="ctrl">
        <label>{{ t('imageWatermark.position') }}</label>
        <select v-model="position" class="select">
          <option value="tl">{{ t('imageWatermark.tl') }}</option>
          <option value="tr">{{ t('imageWatermark.tr') }}</option>
          <option value="bl">{{ t('imageWatermark.bl') }}</option>
          <option value="br">{{ t('imageWatermark.br') }}</option>
          <option value="center">{{ t('imageWatermark.center') }}</option>
        </select>
      </div>
    </div>

    <button @click="drawWatermark" :disabled="!imageUrl" class="btn">{{ t('imageWatermark.apply') }}</button>

    <div v-if="resultUrl" class="result">
      <img :src="resultUrl" class="preview result-img" />
      <button @click="download" class="btn download">{{ t('imageWatermark.download') }}</button>
    </div>
  </div>
</template>

<style scoped>
.tool { max-width: 700px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 1.2rem; }

.upload-area {
  border: 2px dashed #ccc; border-radius: 12px; padding: 2rem;
  text-align: center; cursor: pointer; color: #999; margin-bottom: 1rem;
  transition: border-color 0.15s;
}
.upload-area:hover { border-color: #4a90d9; }
.preview { max-width: 100%; max-height: 300px; border-radius: 8px; display: block; margin: 0 auto; }

.controls { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 1rem; }
.ctrl { display: flex; flex-direction: column; gap: 0.2rem; min-width: 120px; }
.ctrl label { font-size: 0.78rem; font-weight: 600; color: #777; }
.input {
  padding: 0.4rem 0.5rem; border: 1px solid #d0d5dd; border-radius: 6px;
  font-size: 0.85rem; background: #fff; color: #333; width: 160px;
}
.input:focus { outline: none; border-color: #4a90d9; }
.range { width: 100px; }
.range-val { font-size: 0.75rem; color: #888; }
.select {
  padding: 0.4rem 0.5rem; border: 1px solid #d0d5dd; border-radius: 6px;
  font-size: 0.85rem; background: #fff; color: #333; cursor: pointer;
}

.btn {
  padding: 0.45rem 1.2rem; border: none; border-radius: 8px;
  background: #4a90d9; color: #fff; font-size: 0.88rem; cursor: pointer;
  transition: opacity 0.12s;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:not(:disabled):hover { opacity: 0.9; }
.download { margin-top: 0.8rem; }

.result { text-align: center; margin-top: 1rem; }
.result-img { border: 1px solid #e0e4ea; }

@media (prefers-color-scheme: dark) {
  .input, .select { background: #1e1e2e; border-color: #333; color: #ddd; }
  .upload-area { border-color: #444; }
  .result-img { border-color: #333; }
}
</style>
