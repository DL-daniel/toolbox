<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'

const { t } = useI18nt()

const input = ref('')
const copyFeedback = ref('')

// ── Converters ──────────────────────────────────────

const unicodeEscape = computed(() => {
  let r = ''
  for (const ch of input.value) {
    const cp = ch.codePointAt(0)!
    if (cp < 0x80) {
      r += ch
    } else {
      r += `\\u${cp.toString(16).toUpperCase().padStart(4, '0')}`
    }
  }
  return r
})

const htmlEntities = computed(() => {
  let r = ''
  for (const ch of input.value) {
    const cp = ch.codePointAt(0)!
    if (cp < 0x80 && cp !== 0x26 /* & */ && cp !== 0x3c /* < */ && cp !== 0x3e /* > */ && cp !== 0x22 /* " */) {
      r += ch
    } else {
      r += `&#x${cp.toString(16).toUpperCase()};`
    }
  }
  return r
})

const urlEncoded = computed(() => encodeURIComponent(input.value))

const utf8Hex = computed(() => {
  const encoder = new TextEncoder()
  return Array.from(encoder.encode(input.value))
    .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ')
})

const codePoints = computed(() => {
  const chars = [...input.value]
  return chars.map(ch => {
    const cp = ch.codePointAt(0)!
    return {
      char: ch,
      hex: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      dec: cp,
    }
  })
})

const stats = computed(() => {
  const chars = [...input.value]
  const encoder = new TextEncoder()
  return {
    chars: chars.length,
    bytes: encoder.encode(input.value).length,
    codePoints: chars.length,
    // count CJK
    cjk: chars.filter(c => {
      const cp = c.codePointAt(0)!
      return (cp >= 0x4E00 && cp <= 0x9FFF) ||
             (cp >= 0x3400 && cp <= 0x4DBF) ||
             (cp >= 0x20000 && cp <= 0x2A6DF) ||
             (cp >= 0xF900 && cp <= 0xFAFF)
    }).length,
  }
})

// ── Format conversions ──────────────────────────────

const toFullwidth = computed(() => {
  return [...input.value].map(ch => {
    const cp = ch.codePointAt(0)!
    // Full-width letters a-z → Ａ-Ｚ
    if (cp >= 0x21 && cp <= 0x7E) {
      return String.fromCodePoint(cp + 0xFEE0)
    }
    // Space (0x20) → full-width space (0x3000)
    if (cp === 0x20) return '\u3000'
    return ch
  }).join('')
})

const toHalfwidth = computed(() => {
  return [...input.value].map(ch => {
    const cp = ch.codePointAt(0)!
    if (cp >= 0xFF01 && cp <= 0xFF5E) {
      return String.fromCodePoint(cp - 0xFEE0)
    }
    if (cp === 0x3000) return ' '
    return ch
  }).join('')
})

// ── Clipboard ──────────────────────────────────────

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    copyFeedback.value = `${label} ${t('common.copied')}`
    setTimeout(() => { copyFeedback.value = '' }, 1500)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copyFeedback.value = `${label} ${t('common.copied')}`
    setTimeout(() => { copyFeedback.value = '' }, 1500)
  }
}

// ── Decode from encoded forms ──────────────────────

const decodeInput = ref('')
const decodeMode = ref<'escape' | 'html' | 'url' | 'hex'>('escape')

const decodedResult = computed(() => {
  if (!decodeInput.value) return ''
  try {
    switch (decodeMode.value) {
      case 'escape':
        return decodeInput.value.replace(/\\(u[\dA-Fa-f]{4}|U[\dA-Fa-f]{8}|x[\dA-Fa-f]{2})/g, (_, esc) => {
          const hex = esc.slice(1)
          return String.fromCodePoint(parseInt(hex, 16))
        })
      case 'html':
        return decodeInput.value.replace(/&#x([\dA-Fa-f]+);|&#(\d+);/g, (_, hex, dec) => {
          if (hex) return String.fromCodePoint(parseInt(hex, 16))
          if (dec) return String.fromCodePoint(parseInt(dec, 10))
          return ''
        })
      case 'url':
        return decodeURIComponent(decodeInput.value)
      case 'hex':
        return new TextDecoder().decode(
          new Uint8Array(decodeInput.value.trim().split(/[\s,]+/).map(h => parseInt(h, 16)))
        )
      default:
        return ''
    }
  } catch {
    return t('unicodeTool.decodeError')
  }
})

</script>

<template>
  <div class="unicode-tool">
    <h2>{{ t('unicodeTool.title') }}</h2>
    <p class="subtitle">{{ t('unicodeTool.subtitle') }}</p>

    <!-- Input -->
    <section class="section">
      <label class="section-label">{{ t('unicodeTool.input') }}</label>
      <textarea
        v-model="input"
        :placeholder="t('unicodeTool.inputPlaceholder')"
        rows="6"
        class="textarea"
        spellcheck="false"
      ></textarea>
    </section>

    <!-- Stats bar -->
    <section class="stats-bar">
      <span class="stat-item">
        <strong>{{ t('unicodeTool.statsChars') }}:</strong> {{ stats.chars }}
      </span>
      <span class="stat-item">
        <strong>{{ t('unicodeTool.statsBytes') }}:</strong> {{ stats.bytes }}
      </span>
      <span class="stat-item">
        <strong>{{ t('unicodeTool.statsCJK') }}:</strong> {{ stats.cjk }}
      </span>
    </section>

    <!-- Encoding results -->
    <section class="section result-section" v-if="input">
      <h3>{{ t('unicodeTool.encodingResults') }}</h3>

      <div class="result-row" v-if="unicodeEscape !== input">
        <label>{{ t('unicodeTool.unicodeEscape') }}</label>
        <code class="result-code">{{ unicodeEscape }}</code>
        <button class="btn-copy" @click="copy(unicodeEscape, 'Unicode Escape')">{{ t('common.copy') }}</button>
      </div>

      <div class="result-row">
        <label>{{ t('unicodeTool.htmlEntities') }}</label>
        <code class="result-code">{{ htmlEntities }}</code>
        <button class="btn-copy" @click="copy(htmlEntities, 'HTML Entities')">{{ t('common.copy') }}</button>
      </div>

      <div class="result-row">
        <label>{{ t('unicodeTool.urlEncoded') }}</label>
        <code class="result-code">{{ urlEncoded }}</code>
        <button class="btn-copy" @click="copy(urlEncoded, 'URL Encoded')">{{ t('common.copy') }}</button>
      </div>

      <div class="result-row">
        <label>{{ t('unicodeTool.utf8Hex') }}</label>
        <code class="result-code">{{ utf8Hex }}</code>
        <button class="btn-copy" @click="copy(utf8Hex, 'UTF-8 Hex')">{{ t('common.copy') }}</button>
      </div>
    </section>

    <!-- Code points table -->
    <section class="section cp-section" v-if="input.length > 0 && codePoints.length <= 30">
      <h3>{{ t('unicodeTool.codePoints') }}</h3>
      <div class="cp-table-wrap">
        <table class="cp-table">
          <thead>
            <tr>
              <th>{{ t('unicodeTool.cpChar') }}</th>
              <th>Hex</th>
              <th>Decimal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cp, i) in codePoints" :key="i">
              <td class="cp-char">{{ cp.char }}</td>
              <td class="cp-hex">{{ cp.hex }}</td>
              <td class="cp-dec">{{ cp.dec }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="codePoints.length > 30" class="cp-note">{{ t('unicodeTool.cpTooMany', { n: codePoints.length }) }}</p>
    </section>

    <!-- Format conversions -->
    <section class="section result-section" v-if="input">
      <h3>{{ t('unicodeTool.formatConv') }}</h3>

      <div class="result-row" v-if="toFullwidth !== input">
        <label>{{ t('unicodeTool.fullwidth') }}</label>
        <code class="result-code">{{ toFullwidth }}</code>
        <button class="btn-copy" @click="copy(toFullwidth, 'Fullwidth')">{{ t('common.copy') }}</button>
      </div>

      <div class="result-row" v-if="toHalfwidth !== input">
        <label>{{ t('unicodeTool.halfwidth') }}</label>
        <code class="result-code">{{ toHalfwidth }}</code>
        <button class="btn-copy" @click="copy(toHalfwidth, 'Halfwidth')">{{ t('common.copy') }}</button>
      </div>
    </section>

    <!-- Decode section -->
    <section class="section decode-section">
      <h3>{{ t('unicodeTool.decodeTitle') }}</h3>
      <div class="decode-controls">
        <select v-model="decodeMode" class="select">
          <option value="escape">{{ t('unicodeTool.unicodeEscape') }}</option>
          <option value="html">{{ t('unicodeTool.htmlEntities') }}</option>
          <option value="url">{{ t('unicodeTool.urlEncoded') }}</option>
          <option value="hex">{{ t('unicodeTool.utf8Hex') }}</option>
        </select>
      </div>
      <textarea
        v-model="decodeInput"
        :placeholder="t('unicodeTool.decodePlaceholder')"
        rows="4"
        class="textarea"
        spellcheck="false"
      ></textarea>
      <div class="result-row" v-if="decodedResult && !decodedResult.startsWith('⚠')">
        <label>{{ t('unicodeTool.decodedResult') }}</label>
        <code class="result-code">{{ decodedResult }}</code>
        <button class="btn-copy" @click="copy(decodedResult, t('unicodeTool.decodedResult'))">{{ t('common.copy') }}</button>
      </div>
      <p v-else-if="decodedResult" class="error-hint">{{ decodedResult }}</p>
    </section>

    <!-- Copy feedback -->
    <Transition name="fade">
      <div v-if="copyFeedback" class="toast">{{ copyFeedback }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.unicode-tool {
  max-width: 880px;
  margin: 0 auto;
}

.subtitle {
  color: #888;
  margin-bottom: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #444;
}

.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  font-family: 'SF Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;
  background: #fff;
  color: #1a1a1a;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.textarea:focus {
  outline: none;
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.12);
}

/* Stats */
.stats-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.6rem 0.8rem;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  font-size: 0.82rem;
  color: #555;
  flex-wrap: wrap;
}

.stat-item strong {
  color: #333;
}

/* Result rows */
.result-section h3,
.cp-section h3,
.decode-section h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #eef0f4;
}

.result-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  background: #f8f9fb;
}

.result-row label {
  min-width: 6rem;
  font-size: 0.78rem;
  color: #777;
  flex-shrink: 0;
  padding-top: 0.2rem;
}

.result-code {
  flex: 1;
  font-family: 'SF Mono', 'Consolas', 'Menlo', monospace;
  font-size: 0.84rem;
  color: #333;
  word-break: break-all;
  line-height: 1.5;
  padding: 0.1rem 0;
}

.btn-copy {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  background: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  color: #666;
  flex-shrink: 0;
  transition: all 0.12s;
}

.btn-copy:hover {
  border-color: #4a90d9;
  background: #4a90d9;
  color: #fff;
}

/* Code points table */
.cp-table-wrap {
  overflow-x: auto;
}

.cp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
}

.cp-table th {
  text-align: left;
  padding: 0.4rem 0.6rem;
  background: #f5f7fa;
  color: #555;
  font-weight: 600;
  border-bottom: 1px solid #e0e4ea;
}

.cp-table td {
  padding: 0.35rem 0.6rem;
  border-bottom: 1px solid #f0f2f5;
  font-family: 'SF Mono', 'Consolas', 'Menlo', monospace;
}

.cp-char { font-size: 1.1rem; }
.cp-hex { color: #4a90d9; }
.cp-dec { color: #888; }

.cp-note {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #999;
}

/* Decode */
.decode-section .result-row {
  margin-top: 0.5rem;
}

.decode-controls {
  margin-bottom: 0.5rem;
}

.select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: #4a90d9;
}

.error-hint {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #eee;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  z-index: 100;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .textarea {
    background: #1e1e2e;
    border-color: #333;
    color: #ddd;
  }
  .textarea:focus {
    border-color: #5a8ed9;
    box-shadow: 0 0 0 3px rgba(90, 142, 217, 0.15);
  }
  .stats-bar { background: #1a1a2a; color: #aaa; }
  .stat-item strong { color: #ccc; }
  .result-section h3, .cp-section h3, .decode-section h3 { color: #ccc; border-bottom-color: #2a2a3a; }
  .result-row { background: #1a1a2a; }
  .result-row label { color: #999; }
  .result-code { color: #ddd; }
  .btn-copy { background: #2a2a3a; border-color: #3a3a4a; color: #aaa; }
  .btn-copy:hover { border-color: #5a8ed9; background: #4a90d9; color: #fff; }
  .cp-table th { background: #1a1a2a; color: #aaa; border-bottom-color: #2a2a3a; }
  .cp-table td { border-bottom-color: #222; }
  .cp-dec { color: #888; }
  .select { background: #1e1e2e; border-color: #333; color: #ddd; }
  .section-label { color: #bbb; }
}
</style>
