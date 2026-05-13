<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useI18nt } from '@/i18n/useI18nt'
import UsageGuide from '@/components/UsageGuide.vue'

const { t } = useI18nt()

const videoUrl = ref('')
const videoContainer = ref<HTMLDivElement | null>(null)
const videoElement = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const showControls = ref(true)
const currentTime = ref('00:00')
const duration = ref('00:00')
const progress = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const playbackRate = ref(1)

const demoStreams = [
  { name: 'Big Buck Bunny', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { name: 'Apple HLS (fmp4)', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8' },
  { name: 'Apple HLS (bipbop)', url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8' },
]

let hlsInstance: any = null

async function loadHls() {
  try {
    const Hls = (await import('hls.js')).default
    return Hls
  } catch {
    return null
  }
}

async function startPlay() {
  const url = videoUrl.value.trim()
  if (!url) {
    errorMsg.value = t('m3u8Player.errorUrl')
    return
  }

  if (!/^https?:\/\/.+\.m3u8/.test(url) && !url.endsWith('.m3u8')) {
    errorMsg.value = t('m3u8Player.errorInvalidUrl')
    return
  }

  isLoading.value = true
  errorMsg.value = ''
  destroyPlayer()

  await nextTick()

  const video = document.createElement('video')
  video.className = 'video-element'
  video.playsInline = true
  video.controls = false
  video.crossOrigin = 'anonymous'
  videoContainer.value!.appendChild(video)
  videoElement.value = video

  const Hls = await loadHls()
  if (!Hls) {
    errorMsg.value = t('m3u8Player.errorLoadFailed')
    isLoading.value = false
    return
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    })
    hlsInstance = hls
    hls.loadSource(url)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      isLoading.value = false
      video.play().catch(() => {})
      isPlaying.value = true
    })
    hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            errorMsg.value = `${t('m3u8Player.errorGeneric')}: ${data.type}`
            isLoading.value = false
            break
        }
      }
    })
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    video.addEventListener('loadedmetadata', () => {
      isLoading.value = false
      video.play().catch(() => {})
      isPlaying.value = true
    })
  } else {
    errorMsg.value = t('m3u8Player.errorUnsupportedBrowser')
    isLoading.value = false
    return
  }

  video.addEventListener('timeupdate', updateProgress)
  video.addEventListener('loadedmetadata', updateDuration)
  video.addEventListener('play', () => { isPlaying.value = true })
  video.addEventListener('pause', () => { isPlaying.value = false })
  video.addEventListener('ended', () => { isPlaying.value = false })
  video.addEventListener('waiting', () => { isLoading.value = true })
  video.addEventListener('canplay', () => { isLoading.value = false })
}

function destroyPlayer() {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
  if (videoElement.value) {
    videoElement.value.remove()
    videoElement.value = null
  }
  isPlaying.value = false
  progress.value = 0
  currentTime.value = '00:00'
  duration.value = '00:00'
}

function togglePlay() {
  if (!videoElement.value) return
  if (videoElement.value.paused) {
    videoElement.value.play().catch(() => {})
  } else {
    videoElement.value.pause()
  }
}

function toggleMute() {
  if (!videoElement.value) return
  videoElement.value.muted = !videoElement.value.muted
  isMuted.value = videoElement.value.muted
}

function setVolume(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  if (!videoElement.value) return
  videoElement.value.volume = val
  volume.value = val
  isMuted.value = val === 0
}

function seek(e: Event) {
  if (!videoElement.value) return
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const x = (e as MouseEvent).clientX - rect.left
  const ratio = x / rect.width
  const time = ratio * videoElement.value.duration
  videoElement.value.currentTime = time
}

function changeRate() {
  const rates = [0.5, 1, 1.5, 2]
  const idx = rates.indexOf(playbackRate.value)
  const next = rates[(idx + 1) % rates.length]
  playbackRate.value = next
  if (videoElement.value) {
    videoElement.value.playbackRate = next
  }
}

function toggleFullscreen() {
  if (!videoContainer.value) return
  if (!document.fullscreenElement) {
    videoContainer.value.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function updateProgress() {
  if (!videoElement.value) return
  const v = videoElement.value
  progress.value = v.currentTime / v.duration
  currentTime.value = formatTime(v.currentTime)
}

function updateDuration() {
  if (!videoElement.value) return
  duration.value = formatTime(videoElement.value.duration)
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function setDemoUrl(url: string) {
  videoUrl.value = url
  startPlay()
}

onUnmounted(() => {
  destroyPlayer()
})
</script>

<template>
  <div class="m3u8-player">
    <div class="tool-header">
      <h2>📺 {{ t('m3u8Player.title') }}</h2>
      <p class="desc">{{ t('m3u8Player.desc') }}</p>
    </div>

    <div class="input-section">
      <div class="input-row">
        <input
          type="url"
          class="url-input"
          v-model="videoUrl"
          :placeholder="t('m3u8Player.placeholder')"
          @keyup.enter="startPlay"
        />
        <button class="btn-play" @click="startPlay" :disabled="isLoading">
          {{ isLoading ? t('m3u8Player.loading') : t('m3u8Player.play') }}
        </button>
      </div>
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </div>

    <div class="demo-section">
      <span class="demo-label">{{ t('m3u8Player.testStreams') }}：</span>
      <div class="demo-btns">
        <button
          v-for="stream in demoStreams"
          :key="stream.name"
          class="demo-btn"
          @click="setDemoUrl(stream.url)"
        >
          {{ stream.name }}
        </button>
      </div>
    </div>

    <div
      class="video-wrapper"
      :class="{ active: videoElement }"
      ref="videoContainer"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false"
      @mousemove="showControls = true"
    >
      <div v-if="!videoElement" class="placeholder">
        <div class="placeholder-icon">🎬</div>
        <p>{{ t('m3u8Player.placeholderText') }}</p>
      </div>

      <div v-if="isLoading && videoElement" class="loading-overlay">
        <div class="spinner"></div>
        <span>{{ t('m3u8Player.buffering') }}</span>
      </div>

      <div
        v-if="videoElement"
        class="controls"
        :class="{ visible: showControls || !isPlaying }"
      >
        <div class="progress-bar" @click="seek">
          <div class="progress-fill" :style="{ width: progress * 100 + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progress * 100 + '%' }"></div>
        </div>

        <div class="controls-bottom">
          <div class="controls-left">
            <button class="ctrl-btn" @click="togglePlay" :title="isPlaying ? t('m3u8Player.pauseBtn') : t('m3u8Player.playBtn')">
              {{ isPlaying ? '⏸' : '▶' }}
            </button>
            <span class="time">{{ currentTime }} / {{ duration }}</span>
          </div>

          <div class="controls-center">
            <button class="ctrl-btn" @click="toggleMute" :title="isMuted ? t('m3u8Player.unmute') : t('m3u8Player.mute')">
              {{ isMuted ? '🔇' : volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊' }}
            </button>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              @input="setVolume"
            />
          </div>

          <div class="controls-right">
            <button class="ctrl-btn" @click="changeRate" :title="t('m3u8Player.speed')">
              {{ playbackRate }}x
            </button>
            <button class="ctrl-btn" @click="toggleFullscreen" :title="t('m3u8Player.fullscreen')">
              ⛶
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h3>{{ t('m3u8Player.tips') }}</h3>
      <ul>
        <li>{{ t('m3u8Player.tip1') }}</li>
        <li>{{ t('m3u8Player.tip2') }}</li>
        <li>{{ t('m3u8Player.tip3') }}</li>
        <li>{{ t('m3u8Player.tip4') }}</li>
        <li>{{ t('m3u8Player.tip5') }}</li>
      </ul>
    </div>
  </div>

    <UsageGuide toolKey="m3u8Player" />
  </template>

<style scoped>
.m3u8-player {
  max-width: 800px;
  margin: 0 auto;
}

.tool-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.tool-header h2 {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}

.desc {
  color: #666;
  font-size: 0.95rem;
}

.input-section {
  background: white;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 0.8rem;
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.7rem 1rem;
  font-size: 0.95rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: #667eea;
}

.btn-play {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-play:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-play:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.demo-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.demo-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.demo-btn {
  padding: 0.3rem 0.7rem;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #4338ca;
  transition: background 0.2s;
}

.demo-btn:hover {
  background: #dde4ff;
}

.video-wrapper {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  margin-bottom: 1rem;
}

.video-wrapper.active {
  min-height: 300px;
}

.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  gap: 0.5rem;
}

.placeholder-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.placeholder p {
  font-size: 1rem;
}

.video-element {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  color: white;
  gap: 0.8rem;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg) }
}

.controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.85));
  padding: 2rem 0.8rem 0.6rem;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 20;
}

.controls.visible {
  opacity: 1;
}

.progress-bar {
  position: relative;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: height 0.15s;
}

.progress-bar:hover {
  height: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.1s;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.15s;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.controls-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.controls-left,
.controls-center,
.controls-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ctrl-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border-radius: 4px;
  transition: background 0.2s;
  line-height: 1;
}

.ctrl-btn:hover {
  background: rgba(255,255,255,0.15);
}

.time {
  color: rgba(255,255,255,0.85);
  font-size: 0.8rem;
  font-family: monospace;
  white-space: nowrap;
}

.volume-slider {
  width: 70px;
  height: 3px;
  accent-color: #667eea;
  cursor: pointer;
}

.tips-section {
  background: white;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.tips-section h3 {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  color: #555;
}

.tips-section ul {
  list-style: none;
  padding: 0;
}

.tips-section li {
  padding: 0.3rem 0;
  color: #666;
  font-size: 0.9rem;
}

.tips-section li::before {
  content: '• ';
  color: #667eea;
  font-weight: bold;
}
</style>
