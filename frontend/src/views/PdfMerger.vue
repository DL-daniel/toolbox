<script setup lang="ts">
import { ref } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
const { t } = useI18nt()
import { PDFDocument } from 'pdf-lib'

interface PdfFile { id: number; name: string; size: number; buffer: ArrayBuffer; preview?: string }
const files = ref<PdfFile[]>([])
const merging = ref(false)
const mergedBlob = ref<Blob | null>(null)
const mergedName = ref('')
const status = ref('')
let idCounter = 0
const fileInput = ref<HTMLInputElement>()

function openFilePicker() { fileInput.value?.click() }

async function onDrop(e: DragEvent) {
  const dt = e.dataTransfer
  if (!dt?.files) return
  const fls = Array.from(dt.files).filter(f => f.name.endsWith('.pdf'))
  if (files.value.length + fls.length > 20) { status.value = t('pdfMerger.maxFiles'); return }
  for (const f of fls) {
    const buf = await f.arrayBuffer()
    files.value.push({ id: idCounter++, name: f.name, size: f.size, buffer: buf })
  }
  status.value = t('pdfMerger.filesCount', { n: files.value.length })
  mergedBlob.value = null
}

async function addFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const fls = Array.from(input.files || [])
  if (files.value.length + fls.length > 20) {
    status.value = t('pdfMerger.maxFiles')
    return
  }
  for (const f of fls) {
    const buf = await f.arrayBuffer()
    const p: PdfFile = { id: idCounter++, name: f.name, size: f.size, buffer: buf }
    files.value.push(p)
  }
  status.value = t('pdfMerger.filesCount', { n: files.value.length })
  mergedBlob.value = null
}

function removeFile(id: number) {
  files.value = files.value.filter(f => f.id !== id)
  mergedBlob.value = null
}

function moveFile(from: number, dir: -1 | 1) {
  const to = from + dir
  if (to < 0 || to >= files.value.length) return
  ;[files.value[from], files.value[to]] = [files.value[to], files.value[from]]
  mergedBlob.value = null
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function merge() {
  if (files.value.length < 2) return
  merging.value = true
  status.value = t('pdfMerger.merging')
  try {
    const merged = await PDFDocument.create()
    for (const f of files.value) {
      const doc = await PDFDocument.load(f.buffer, { ignoreEncryption: true })
      const pages = await merged.copyPages(doc, doc.getPageIndices())
      pages.forEach(p => merged.addPage(p))
    }
    const bytes = await merged.save()
    mergedBlob.value = new Blob([bytes as BlobPart], { type: 'application/pdf' })
    mergedName.value = `merged_${Date.now()}.pdf`
    status.value = t('pdfMerger.done', { cnt: files.value.length })
  } catch (e: any) {
    status.value = t('pdfMerger.error', { msg: e.message })
  }
  merging.value = false
}

function download() {
  if (!mergedBlob.value) return
  const url = URL.createObjectURL(mergedBlob.value)
  const a = document.createElement('a')
  a.href = url; a.download = mergedName.value; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="tool">
    <h2>{{ t('pdfMerger.title') }}</h2>
    <p class="subtitle">{{ t('pdfMerger.subtitle') }}</p>

    <div class="upload-area" @click="openFilePicker" @dragover.prevent @drop.prevent="onDrop">
      <input ref="fileInput" type="file" accept=".pdf" multiple @change="addFiles" hidden />
      <span v-if="files.length===0">{{ t('pdfMerger.uploadHint') }}</span>
      <div v-else class="uploaded-info">{{ t('pdfMerger.filesCount', { n: files.length }) }}</div>
    </div>

    <div v-if="files.length" class="file-list">
      <div v-for="(f, idx) in files" :key="f.id" class="file-row">
        <div class="file-order">
          <button :disabled="idx===0" @click="moveFile(idx, -1)" class="btn-arrow">↑</button>
          <span class="idx">{{ idx + 1 }}</span>
          <button :disabled="idx===files.length-1" @click="moveFile(idx, 1)" class="btn-arrow">↓</button>
        </div>
        <div class="file-info">
          <span class="file-name">{{ f.name }}</span>
          <span class="file-size">{{ formatSize(f.size) }}</span>
        </div>
        <button @click="removeFile(f.id)" class="btn-del">✕</button>
      </div>
    </div>

    <div class="actions">
      <button @click="merge" :disabled="files.length<2 || merging" class="btn">
        {{ merging ? t('pdfMerger.merging') : t('pdfMerger.merge') }}
      </button>
      <button v-if="mergedBlob" @click="download" class="btn download">{{ t('pdfMerger.download') }}</button>
    </div>
    <p v-if="status" class="status">{{ status }}</p>
  </div>
</template>

<style scoped>
.tool { max-width: 720px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 1.2rem; }

.upload-area {
  border: 2px dashed #ccc; border-radius: 12px; padding: 2rem;
  text-align: center; cursor: pointer; color: #999; margin-bottom: 1rem;
  transition: border-color 0.15s;
}
.upload-area:hover { border-color: #4a90d9; }
.uploaded-info { color: #4a90d9; font-weight: 600; }

.file-list { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
.file-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.7rem; border: 1px solid #e0e4ea; border-radius: 8px; background: #fafbfc;
}
.file-order { display: flex; align-items: center; gap: 0.2rem; flex-shrink: 0; }
.btn-arrow {
  padding: 0.15rem 0.3rem; border: 1px solid #d0d5dd; border-radius: 3px;
  background: #fff; font-size: 0.7rem; cursor: pointer; color: #666; line-height: 1;
}
.btn-arrow:disabled { opacity: 0.3; cursor: default; }
.btn-arrow:not(:disabled):hover { border-color: #4a90d9; }
.idx { font-weight: 600; color: #4a90d9; min-width: 1.2rem; text-align: center; }
.file-info { flex: 1; display: flex; gap: 0.5rem; align-items: center; }
.file-name { font-size: 0.85rem; color: #444; word-break: break-all; }
.file-size { font-size: 0.75rem; color: #999; white-space: nowrap; }
.btn-del {
  border: none; background: none; font-size: 0.85rem; cursor: pointer;
  color: #bbb; transition: color 0.12s;
}
.btn-del:hover { color: #d32f2f; }

.actions { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.btn {
  padding: 0.45rem 1.2rem; border: none; border-radius: 8px;
  background: #4a90d9; color: #fff; font-size: 0.88rem; cursor: pointer;
  transition: opacity 0.12s;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:not(:disabled):hover { opacity: 0.9; }
.download { background: #2a8; }
.status { font-size: 0.82rem; color: #666; }

@media (prefers-color-scheme: dark) {
  .file-row { border-color: #2a2a3a; background: #1a1a2a; }
  .btn-arrow { background: #2a2a3a; border-color: #3a3a4a; color: #aaa; }
  .file-name { color: #ccc; }
  .upload-area { border-color: #444; }
  .status { color: #aaa; }
}
</style>
