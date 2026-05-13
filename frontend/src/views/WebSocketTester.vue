<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UsageGuide from '@/components/UsageGuide.vue'
const { t } = useI18n()
const url = ref('wss://echo.websocket.org')
const message = ref('')
const log = ref<string[]>([])
const connected = ref(false)
let ws: WebSocket | null = null

function connect() {
  if (!url.value) return
  try {
    ws = new WebSocket(url.value)
    ws.onopen = () => { connected.value = true; addLog(t('webSocketTester.connected')) }
    ws.onclose = () => { connected.value = false; addLog(t('webSocketTester.disconnected')) }
    ws.onerror = () => { addLog(t('webSocketTester.error')) }
    ws.onmessage = (e) => { addLog(t('webSocketTester.received') + ': ' + e.data) }
  } catch { addLog(t('webSocketTester.connFailed')) }
}

function disconnect() {
  if (ws) { ws.close(); ws = null }
}

function send() {
  if (!ws || !message.value) return
  ws.send(message.value)
  addLog(t('webSocketTester.sent') + ': ' + message.value)
  message.value = ''
}

function addLog(msg: string) {
  log.value.unshift(new Date().toLocaleTimeString() + ' ' + msg)
  if (log.value.length > 100) log.value.pop()
}

function clearLog() { log.value = [] }
</script>

<template>
  <div class="ws-tester">
    <div class="tool-header">
      <h2>{{ t('webSocketTester.title') }}</h2>
      <p class="desc">{{ t('webSocketTester.desc') }}</p>
    </div>
    <div class="url-row">
      <input v-model="url" :placeholder="t('webSocketTester.urlPlaceholder')" class="input" />
      <button v-if="!connected" class="btn" @click="connect">{{ t('webSocketTester.connect') }}</button>
      <button v-else class="btn danger" @click="disconnect">{{ t('webSocketTester.disconnect') }}</button>
    </div>
    <div class="status" :class="{ online: connected }">{{ connected ? t('webSocketTester.connectedLabel') : t('webSocketTester.disconnectedLabel') }}</div>
    <div class="send-row" v-if="connected">
      <input v-model="message" :placeholder="t('webSocketTester.msgPlaceholder')" class="input" @keyup.enter="send" />
      <button class="btn" @click="send">{{ t('webSocketTester.send') }}</button>
    </div>
    <div class="log-area">
      <div class="log-header"><span>{{ t('webSocketTester.log') }}</span><button class="btn-sm" @click="clearLog">{{ t('common.clear') }}</button></div>
      <div class="log-entries">
        <div v-for="(l, i) in log" :key="i" class="log-line">{{ l }}</div>
        <p v-if="!log.length" class="no-log">{{ t('webSocketTester.noLog') }}</p>
      </div>
    </div>
  </div>

    <UsageGuide toolKey="websocketTester" />
  </template>

<style scoped>
.ws-tester { max-width: 600px; margin: 0 auto; }
.url-row { display:flex; gap:0.5rem; margin:0.5rem 0; }
.input { flex:1; padding:0.6rem; border:1px solid #ddd; border-radius:6px; font-size:0.95rem; }
.btn { padding:0.6rem 1.2rem; background:#667eea; color:#fff; border:none; border-radius:6px; cursor:pointer; white-space:nowrap; }
.danger { background:#e53935; }
.btn-sm { padding:0.3rem 0.8rem; background:#667eea; color:#fff; border:none; border-radius:4px; font-size:0.8rem; cursor:pointer; }
.status { padding:0.3rem 0.8rem; border-radius:12px; display:inline-block; font-size:0.8rem; background:#f5f5f5; color:#666; margin:0.5rem 0; }
.status.online { background:#e8f5e9; color:#2e7d32; }
.send-row { display:flex; gap:0.5rem; margin:0.5rem 0; }
.log-area { background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05); margin-top:0.5rem; }
.log-header { display:flex; justify-content:space-between; align-items:center; padding:0.6rem 1rem; background:#f8f9fa; border-bottom:1px solid #eee; font-size:0.85rem; color:#666; }
.log-entries { max-height:300px; overflow-y:auto; padding:0.5rem 1rem; }
.log-line { padding:0.3rem 0; font-size:0.8rem; color:#555; font-family:monospace; border-bottom:1px solid #f5f5f5; word-break:break-all; }
.no-log { color:#ccc; text-align:center; padding:1rem; }
@media (prefers-color-scheme: dark) {
  .input { background:#1a1a2e; border-color:#333; color:#eee; }
  .status:not(.online) { background:#2a2a2a; color:#888; }
  .status.online { background:#1b3d1b; color:#81c784; }
  .log-area { background:#1a1a2e; }
  .log-header { background:#252545; border-color:#333; color:#999; }
  .log-line { color:#aaa; border-color:#333; }
  .no-log { color:#555; }
}
</style>