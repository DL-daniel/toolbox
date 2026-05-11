<script setup lang="ts">
import { ref } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
const { t } = useI18nt()
import { PDFDocument, rgb, StandardFonts, RotationTypes } from 'pdf-lib'

const pdfBuffer = ref<ArrayBuffer | null>(null)
const pdfName = ref('')
const watermarkText = ref('Confidential')
const opacity = ref(0.3)
const generating = ref(false)
const resultBlob = ref<Blob | null>(null)
const status = ref('')
const fileInput = ref<HTMLInputElement>()

function openFilePicker() { fileInput.value?.click() }

function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files[0]
  if (!f) return
  pdfName.value = f.name.replace(/\.pdf$/i, '') + '_watermarked.pdf'
  const r = new FileReader()
  r.onload = () => { pdfBuffer.value = r.result as ArrayBuffer }
  r.readAsArrayBuffer(f)
  resultBlob.value = null
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  pdfName.value = f.name.replace(/\.pdf$/i, '') + '_watermarked.pdf'
  const r = new FileReader()
  r.onload = () => { pdfBuffer.value = r.result as ArrayBuffer }
  r.readAsArrayBuffer(f)
  resultBlob.value = null
}

async function addWatermark() {
  if (!pdfBuffer.value) return
  generating.value = true
  status.value = t('pdfWatermark.processing')
  try {
    const doc = await PDFDocument.load(pdfBuffer.value, { ignoreEncryption: true })
    const font = await doc.embedFont(StandardFonts.HelveticaBold)
    const pages = doc.getPages()
    for (const page of pages) {
      const { width, height } = page.getSize()
      const text = watermarkText.value || 'Watermark'
      const size = Math.min(width, height) * 0.08
      page.drawText(text, {
        x: width / 2 - (text.length * size * 0.35) / 2,
        y: height / 2 - size / 2,
        size,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: opacity.value,
        rotate: { type: RotationTypes.Degrees, angle: -30 },
      })
    }
    const bytes = await doc.save()
    resultBlob.value = new Blob([bytes as BlobPart], { type: 'application/pdf' })
    status.value = t('pdfWatermark.done')
  } catch (e: any) {
    status.value = t('pdfWatermark.error', { msg: e.message })
  }
  generating.value = false
}

function download() {
  if (!resultBlob.value) return
  const url = URL.createObjectURL(resultBlob.value)
  const a = document.createElement('a')
  a.href = url; a.download = pdfName.value || 'watermarked.pdf'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="tool">
    <h2>{{ t('pdfWatermark.title') }}</h2>
    <p class="subtitle">{{ t('pdfWatermark.subtitle') }}</p>

    <div class="upload-area" @click="openFilePicker" @dragover.prevent @drop.prevent="onDrop">
      <input ref="fileInput" type="file" accept=".pdf" @change="onFile" hidden />
      <span v-if="!pdfBuffer">{{ t('pdfWatermark.uploadHint') }}</span>
      <span v-else class="uploaded">{{ pdfName.replace('_watermarked.pdf', '.pdf') }}</span>
    </div>

    <div class="controls">
      <div class="ctrl">
        <label>{{ t('pdfWatermark.text') }}</label>
        <input v-model="watermarkText" class="input" />
      </div>
      <div class="ctrl">
        <label>{{ t('pdfWatermark.opacity') }}</label>
        <input v-model.number="opacity" type="range" min="0.05" max="1" step="0.05" class="range" />
        <span class="range-val">{{ Math.round(opacity * 100) }}%</span>
      </div>
    </div>

    <button @click="addWatermark" :disabled="!pdfBuffer || generating" class="btn">
      {{ generating ? t('pdfWatermark.processing') : t('pdfWatermark.apply') }}
    </button>

    <button v-if="resultBlob" @click="download" class="btn download">{{ t('pdfWatermark.download') }}</button>
    <p v-if="status" class="status">{{ status }}</p>
  </div>
</template>

<style scoped>
.tool { max-width: 640px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 1.2rem; }

.upload-area {
  border: 2px dashed #ccc; border-radius: 12px; padding: 2rem;
  text-align: center; cursor: pointer; color: #999; margin-bottom: 1rem;
  transition: border-color 0.15s;
}
.upload-area:hover { border-color: #4a90d9; }
.uploaded { color: #4a90d9; font-weight: 600; }

.controls { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.ctrl { display: flex; flex-direction: column; gap: 0.2rem; }
.ctrl label { font-size: 0.78rem; font-weight: 600; color: #777; }
.input {
  padding: 0.4rem 0.5rem; border: 1px solid #d0d5dd; border-radius: 6px;
  font-size: 0.85rem; background: #fff; color: #333; width: 200px;
}
.input:focus { outline: none; border-color: #4a90d9; }
.range { width: 100px; }
.range-val { font-size: 0.75rem; color: #888; }

.btn {
  padding: 0.45rem 1.2rem; border: none; border-radius: 8px;
  background: #4a90d9; color: #fff; font-size: 0.88rem; cursor: pointer;
  transition: opacity 0.12s; margin-right: 0.5rem;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:not(:disabled):hover { opacity: 0.9; }
.download { background: #2a8; }
.status { font-size: 0.82rem; color: #666; margin-top: 0.5rem; }

@media (prefers-color-scheme: dark) {
  .input { background: #1e1e2e; border-color: #333; color: #ddd; }
  .upload-area { border-color: #444; }
  .status { color: #aaa; }
}
</style>
