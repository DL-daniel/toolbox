<script setup lang="ts">
import { ref } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
const { t } = useI18nt()
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import UsageGuide from '@/components/UsageGuide.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url
).toString()

const pdfBuffer = ref<ArrayBuffer | null>(null)
const pdfName = ref('')
const processing = ref(false)
const resultBlob = ref<Blob | null>(null)
const status = ref('')
const progress = ref(0)
const pageCount = ref(0)
const fileInput = ref<HTMLInputElement>()

function openFilePicker() { fileInput.value?.click() }

function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files[0]
  if (!f) return
  pdfName.value = f.name.replace(/\.pdf$/i, '') + '_ocr.pdf'
  const r = new FileReader()
  r.onload = () => { pdfBuffer.value = r.result as ArrayBuffer }
  r.readAsArrayBuffer(f)
  resultBlob.value = null
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  pdfName.value = f.name.replace(/\.pdf$/i, '') + '_ocr.pdf'
  const r = new FileReader()
  r.onload = () => { pdfBuffer.value = r.result as ArrayBuffer }
  r.readAsArrayBuffer(f)
  resultBlob.value = null
}

async function compress() {
  if (!pdfBuffer.value) return
  processing.value = true
  status.value = t('pdfCompressor.loading')
  progress.value = 0

  try {
    // Load PDF with pdfjs
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer.value.slice(0) })
    const pdf = await loadingTask.promise
    pageCount.value = pdf.numPages
    status.value = t('pdfCompressor.pages', { n: pdf.numPages })

    // Create output PDF
    const outDoc = await PDFDocument.create()
    const helv = await outDoc.embedFont(StandardFonts.Helvetica)

    for (let i = 1; i <= pdf.numPages; i++) {
      progress.value = Math.round((i - 1) / pdf.numPages * 100)
      status.value = t('pdfCompressor.processing', { p: i, n: pdf.numPages })

      // Render page to canvas
      const page = await pdf.getPage(i)
      const scale = 1.5
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      const renderCtx = { canvasContext: ctx, viewport, canvas }
      await page.render(renderCtx as any).promise

      // OCR
      status.value = t('pdfCompressor.ocr', { p: i, n: pdf.numPages })
      const { data } = await Tesseract.recognize(canvas, 'eng+chi_sim', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            progress.value = Math.round((i - 1 + m.progress!) / pdf.numPages * 100)
          }
        }
      })

      // Embed page as image
      const imgBytes = canvas.toDataURL('image/jpeg', 0.85)
      const img = await outDoc.embedJpg(imgBytes)
      const outPage = outDoc.addPage([viewport.width, viewport.height])
      outPage.drawImage(img, {
        x: 0, y: 0,
        width: viewport.width,
        height: viewport.height,
      })

      // Draw OCR text as selectable text
      const words = (data as any).words
      if (words && words.length) {
        const pageH = viewport.height
        for (const word of words) {
          if (!word.text || word.text.trim() === '') continue
          const fontSize = Math.max(6, word.bbox.height * 0.7 * viewport.scale)
          outPage.drawText(word.text, {
            x: word.bbox.x0 * viewport.scale,
            y: pageH - word.bbox.y1 * viewport.scale,
            size: fontSize,
            font: helv,
            color: rgb(0, 0, 0),
            opacity: 0,
          })
        }
      }
    }

    progress.value = 100
    const bytes = await outDoc.save()
    resultBlob.value = new Blob([bytes as BlobPart], { type: 'application/pdf' })
    status.value = t('pdfCompressor.done', { n: pdf.numPages })
  } catch (e: any) {
    status.value = t('pdfCompressor.error', { msg: e.message })
  }
  processing.value = false
}

function download() {
  if (!resultBlob.value) return
  const url = URL.createObjectURL(resultBlob.value)
  const a = document.createElement('a')
  a.href = url; a.download = pdfName.value || 'ocr_result.pdf'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="tool">
    <div class="tool-header">

      <h2>{{ t('pdfCompressor.title') }}</h2>

      <p class="desc">{{ t('pdfCompressor.subtitle') }}</p>

    </div>

    <div class="upload-area" @click="openFilePicker" @dragover.prevent @drop.prevent="onDrop">
      <input ref="fileInput" type="file" accept=".pdf" @change="onFile" hidden />
      <span v-if="!pdfBuffer">{{ t('pdfCompressor.uploadHint') }}</span>
      <span v-else class="uploaded">{{ pdfName.replace('_ocr.pdf', '.pdf') }}</span>
    </div>

    <button @click="compress" :disabled="!pdfBuffer || processing" class="btn">
      {{ processing ? t('pdfCompressor.processingBtn') : t('pdfCompressor.start') }}
    </button>

    <div v-if="processing" class="progress-bar-wrap">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>

    <button v-if="resultBlob" @click="download" class="btn download">{{ t('pdfCompressor.download') }}</button>
    <p v-if="status" class="status">{{ status }}</p>
  </div>

    <UsageGuide toolKey="pdfCompressor" />
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

.btn {
  padding: 0.45rem 1.2rem; border: none; border-radius: 8px;
  background: #4a90d9; color: #fff; font-size: 0.88rem; cursor: pointer;
  transition: opacity 0.12s; margin-right: 0.5rem;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:not(:disabled):hover { opacity: 0.9; }
.download { background: #2a8; }

.progress-bar-wrap {
  height: 6px; background: #e0e4ea; border-radius: 3px; margin: 0.8rem 0; overflow: hidden;
}
.progress-bar { height: 100%; background: #4a90d9; border-radius: 3px; transition: width 0.3s; }

.status { font-size: 0.82rem; color: #666; margin-top: 0.5rem; }

@media (prefers-color-scheme: dark) {
  .upload-area { border-color: #444; }
  .progress-bar-wrap { background: #2a2a3a; }
  .status { color: #aaa; }
}
</style>
