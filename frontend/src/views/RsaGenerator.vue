<script setup lang="ts">
import { ref } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
const { t } = useI18nt()
import forge from 'node-forge'
import UsageGuide from '@/components/UsageGuide.vue'

const keySize = ref(2048)
const passphrase = ref('')
const generating = ref(false)
const publicKey = ref('')
const privateKey = ref('')
const privateKeyPkcs8 = ref('')
const copyMsg = ref('')
const keySizes = [1024, 2048, 3072, 4096]

async function generate() {
  generating.value = true
  publicKey.value = ''
  privateKey.value = ''
  privateKeyPkcs8.value = ''
  await new Promise(r => setTimeout(r, 50))
  try {
    const pair = forge.pki.rsa.generateKeyPair({ bits: keySize.value, workers: -1 })
    publicKey.value = forge.pki.publicKeyToPem(pair.publicKey)

    const pkcs8Priv = forge.pki.privateKeyToAsn1(pair.privateKey)
    const pkcs8PrivInfo = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
      forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.INTEGER, false, '\x00'),
      forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 0, true, [
        forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OID, false, forge.pki.oids.rsaEncryption),
        forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.NULL, false, ''),
      ]),
      forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 1, true, [pkcs8Priv]),
    ])
    const pkcs8Der = forge.asn1.toDer(pkcs8PrivInfo).getBytes()
    privateKeyPkcs8.value = forge.pem.encode({ type: 'PRIVATE KEY', body: pkcs8Der })

    if (passphrase.value) {
      privateKey.value = forge.pki.encryptRsaPrivateKey(pair.privateKey, passphrase.value)
    } else {
      privateKey.value = forge.pki.privateKeyToPem(pair.privateKey)
    }
  } catch (e: any) {
    publicKey.value = `Error: ${e.message}`
  }
  generating.value = false
}

async function copy(text: string, label: string) {
  await navigator.clipboard.writeText(text)
  copyMsg.value = `${label} ${t('common.copied')}`
  setTimeout(() => { copyMsg.value = '' }, 1500)
}
</script>

<template>
  <div class="tool">
    <div class="tool-header">

      <h2>{{ t('rsaGenerator.title') }}</h2>

      <p class="desc">{{ t('rsaGenerator.subtitle') }}</p>

    </div>

    <div class="controls">
      <div class="ctrl-group">
        <label>{{ t('rsaGenerator.keySize') }}</label>
        <select v-model.number="keySize" class="select">
          <option v-for="s in keySizes" :key="s" :value="s">{{ s }} bit</option>
        </select>
      </div>
      <div class="ctrl-group">
        <label>{{ t('rsaGenerator.passphrase') }}</label>
        <input v-model="passphrase" :placeholder="t('rsaGenerator.passPlaceholder')" class="input" type="password" />
      </div>
    </div>

    <button @click="generate" :disabled="generating" class="btn-gen">
      {{ generating ? t('rsaGenerator.generating') : t('rsaGenerator.generate') }}
    </button>

    <div v-if="publicKey" class="key-section">
      <div class="key-block">
        <div class="key-header">
          <strong>{{ t('rsaGenerator.publicKey') }}</strong>
          <button class="btn-copy" @click="copy(publicKey, 'Public Key')">{{ t('common.copy') }}</button>
        </div>
        <pre class="key-content">{{ publicKey }}</pre>
      </div>

      <div class="key-block">
        <div class="key-header">
          <strong>{{ t('rsaGenerator.privateKey') }} (PKCS#1)</strong>
          <button class="btn-copy" @click="copy(privateKey, 'Private Key')">{{ t('common.copy') }}</button>
        </div>
        <pre class="key-content">{{ privateKey }}</pre>
      </div>

      <div class="key-block">
        <div class="key-header">
          <strong>{{ t('rsaGenerator.privateKeyPkcs8') }} (PKCS#8)</strong>
          <button class="btn-copy" @click="copy(privateKeyPkcs8, 'PKCS#8')">{{ t('common.copy') }}</button>
        </div>
        <pre class="key-content">{{ privateKeyPkcs8 }}</pre>
      </div>
    </div>

    <Transition name="fade"><div v-if="copyMsg" class="toast">{{ copyMsg }}</div></Transition>
  </div>

    <UsageGuide toolKey="rsaGenerator" />
  </template>

<style scoped>
.tool { max-width: 720px; margin: 0 auto; }
.subtitle { color: #888; margin-bottom: 1.2rem; }
.controls { display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.ctrl-group { display: flex; flex-direction: column; gap: 0.3rem; }
.ctrl-group label { font-size: 0.78rem; font-weight: 600; color: #777; }
.select, .input {
  padding: 0.45rem 0.6rem; border: 1px solid #d0d5dd; border-radius: 6px;
  font-size: 0.88rem; background: #fff; color: #333;
}
.input { width: 220px; }
.select:focus, .input:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 3px rgba(74,144,217,0.1); }

.btn-gen {
  padding: 0.5rem 1.5rem; border: none; border-radius: 8px;
  background: #4a90d9; color: #fff; font-size: 0.9rem; cursor: pointer;
  transition: opacity 0.15s; margin-bottom: 1rem;
}
.btn-gen:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-gen:not(:disabled):hover { opacity: 0.9; }

.key-section { display: flex; flex-direction: column; gap: 1rem; }
.key-block { border: 1px solid #e0e4ea; border-radius: 8px; overflow: hidden; }
.key-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 0.8rem; background: #f8f9fb; border-bottom: 1px solid #e0e4ea;
}
.key-header strong { font-size: 0.82rem; color: #555; }
.btn-copy {
  padding: 0.2rem 0.5rem; border: 1px solid #d0d5dd; border-radius: 4px;
  background: #fff; font-size: 0.75rem; cursor: pointer; color: #666; transition: all 0.12s;
}
.btn-copy:hover { border-color: #4a90d9; background: #4a90d9; color: #fff; }
.key-content {
  padding: 0.8rem; margin: 0; font-size: 0.78rem; line-height: 1.4;
  font-family: 'SF Mono','Consolas',monospace; color: #444; background: #fff;
  max-height: 200px; overflow: auto; white-space: pre; word-break: break-all;
}
.toast { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #333; color: #eee; padding: 0.5rem 1.2rem; border-radius: 20px; font-size: 0.85rem; z-index: 100; pointer-events: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (prefers-color-scheme: dark) {
  .select, .input { background: #1e1e2e; border-color: #333; color: #ddd; }
  .key-block { border-color: #2a2a3a; }
  .key-header { background: #1a1a2a; border-color: #2a2a3a; }
  .key-header strong { color: #aaa; }
  .btn-copy { background: #2a2a3a; border-color: #3a3a4a; color: #aaa; }
  .btn-copy:hover { border-color: #5a8ed9; background: #4a90d9; color: #fff; }
  .key-content { background: #1e1e2e; color: #ccc; }
}
</style>
