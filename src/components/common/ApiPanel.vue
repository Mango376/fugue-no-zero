<template>
  <!-- 触发按钮 -->
  <button
    class="api-trigger"
    :class="{ 'is-hidden': !gameStore.showGlobalApiBtn }" 
    :style="triggerStyle"
    @mousedown="startDragTrigger"
    @touchstart.prevent="startDragTriggerTouch"
    @touchend.prevent="handleTriggerTouchEnd"
    @click="togglePanel"
  >
    <img src="https://drive-cdn.mujian.me/49/5a7cb569-a196-4336-84ce-71de29fddcb1_ai-icon.png" class="api-trigger-img" alt="AI" />
    <span class="api-tooltip">API</span>
  </button>

  <!-- 悬浮面板 -->
  <Teleport to="body">
    <Transition name="fade-overlay">
      <div v-if="isOpen" class="api-panel-overlay" @click="isOpen = false" @touchend.prevent="isOpen = false"></div>
    </Transition>
    <Transition name="panel-fade">
      <div v-if="isOpen" class="api-panel" ref="panelRef">

        <!-- 拖拽头部 -->
        <div class="api-panel-header" @mousedown="startDrag" @touchstart.prevent="startDragTouch">
          <div class="api-panel-title">
            <span class="orn-diamond">🎼</span>
            AI 接入设置
          </div>
          <button class="api-panel-close" @click="togglePanel">✕</button>
        </div>

        <!-- 面板内容 -->
        <div class="api-panel-body">

          <!-- 连接方式选择 -->
          <div class="field-group">
            <label class="field-label">连接方式</label>
            <div class="mode-selector">
              <label class="mode-option" :class="{ active: form.mode === 'custom' }">
                <input type="radio" v-model="form.mode" value="custom" />
                <span>🔧 自定义 API</span>
                <small>自有 API / 酒馆直连</small>
              </label>
            </div>
          </div>

          <!-- 接入提示 -->
          <div class="mode-hint">
            <span>
              🔧 支持 OpenAI 格式的任意接口。在酒馆中游玩时，可填酒馆接口：<br/>
              http://127.0.0.1:8000/api/backends/chat-completions/generate
            </span>
          </div>

          <!-- 仅 custom 模式显示 -->
          <template v-if="form.mode === 'custom'">
            <div class="field-group">
              <label class="field-label">自定义站点</label>
              <input
                v-model="form.endpoint"
                class="field-input"
                placeholder="https://api.example.com/v1"
                @keyup.enter="connectToAI"
              />
              <p class="field-hint">支持 OpenAI 格式的任意接口</p>
            </div>

            <div class="field-group">
              <label class="field-label">API Key</label>
              <div class="input-row">
                <input
                  v-model="form.apiKey"
                  class="field-input"
                  :type="showKey ? 'text' : 'password'"
                  placeholder="sk-..."
                />
                <button class="eye-btn" @click="showKey = !showKey">
                  {{ showKey ? '隐' : '显' }}
                </button>
              </div>
            </div>

            <button
              class="connect-btn"
              :class="{ loading: isConnecting }"
              @click="connectToAI"
              :disabled="isConnecting || !form.endpoint || !form.apiKey"
            >
              <span v-if="!isConnecting">{{ connectStatus }}</span>
              <span v-else class="connecting-text">连接中...</span>
            </button>

            <div v-if="connectError" class="connect-error">
              {{ connectError }}
            </div>

            <Transition name="slide-down">
              <div v-if="models.length > 0" class="field-group">
                <label class="field-label">选择模型</label>
                <select v-model="form.model" class="field-select">
                  <option v-for="model in models" :key="model.id" :value="model.id">
                    {{ model.id }}
                  </option>
                </select>
              </div>
            </Transition>
          </template>

          <div v-if="savedConfig.model && form.mode === 'custom'" class="current-config">
            <span class="orn-diamond small">◆</span>
            当前：{{ savedConfig.model }}
          </div>

          <div class="api-panel-footer">
            <button
              class="save-btn"
              @click="saveConfig"
              :disabled="form.mode === 'custom' && !form.model"
            >
              确认保存
            </button>
            <button class="clear-btn" @click="clearConfig">
              清除配置
            </button>
          </div>

          <Transition name="toast-fade">
            <div v-if="saveToast" class="save-toast" :class="saveToastType">
              {{ saveToast }}
            </div>
          </Transition>

          <p class="privacy-note">⚿ 配置仅存储在本地，不会上传至任何服务器</p>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>


<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import db from '@/db/gameDB'
import { useGameStore } from '@/stores/gameStore'

// ========================
// 面板开关
// ========================
const isOpen = ref(false)
const gameStore = useGameStore()
let closeTimer = null
let lastToggleTime = 0

function openPanel() {
  clearTimeout(closeTimer)
  isOpen.value = true
}

function cancelCloseTimer() {
  clearTimeout(closeTimer)
}

function startCloseTimer() {
  closeTimer = setTimeout(() => {
    isOpen.value = false
  }, 300)
}

// ========================
// 触发按钮拖拽
// ========================
const triggerPos = reactive({ x: 0, y: 0 })
const isTriggerDragging = ref(false)
const triggerDragOffset = reactive({ x: 0, y: 0 })
const dragMoved = ref(false)

const touchStartPos = { x: 0, y: 0 }
const DRAG_THRESHOLD = 8

const triggerStyle = computed(() => ({
  transform: `translate(${triggerPos.x}px, ${triggerPos.y}px)`
}))

function startDragTrigger(e) {
  isTriggerDragging.value = true
  dragMoved.value = false
  triggerDragOffset.x = e.clientX - triggerPos.x
  triggerDragOffset.y = e.clientY - triggerPos.y
  document.addEventListener('mousemove', onDragTrigger)
  document.addEventListener('mouseup', stopDragTrigger)
  e.preventDefault()
}

function startDragTriggerTouch(e) {
  isTriggerDragging.value = true
  dragMoved.value = false
  const touch = e.touches[0]
  touchStartPos.x = touch.clientX
  touchStartPos.y = touch.clientY
  triggerDragOffset.x = touch.clientX - triggerPos.x
  triggerDragOffset.y = touch.clientY - triggerPos.y
  document.addEventListener('touchmove', onDragTriggerTouch, { passive: false })
  document.addEventListener('touchend', stopDragTrigger)
}

function onDragTrigger(e) {
  if (!isTriggerDragging.value) return
  dragMoved.value = true
  triggerPos.x = e.clientX - triggerDragOffset.x
  triggerPos.y = e.clientY - triggerDragOffset.y
}

function onDragTriggerTouch(e) {
  if (!isTriggerDragging.value) return
  const touch = e.touches[0]
  const dx = touch.clientX - touchStartPos.x
  const dy = touch.clientY - touchStartPos.y
  if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
    dragMoved.value = true
  }
  if (dragMoved.value) {
    triggerPos.x = touch.clientX - triggerDragOffset.x
    triggerPos.y = touch.clientY - triggerDragOffset.y
  }
}

function stopDragTrigger() {
  isTriggerDragging.value = false
  document.removeEventListener('mousemove', onDragTrigger)
  document.removeEventListener('mouseup', stopDragTrigger)
  document.removeEventListener('touchmove', onDragTriggerTouch)
  document.removeEventListener('touchend', stopDragTrigger)
  // 重置拖动状态，防止下次点击失效
  setTimeout(() => {
    dragMoved.value = false
  }, 300)
}

function handleTriggerTouchEnd() {
  if (!dragMoved.value) {
    togglePanel()
  }
}

function togglePanel() {
  if (dragMoved.value) return
  // 防止手机端 touch + click 双重触发
  const now = Date.now()
  if (now - lastToggleTime < 500) return
  lastToggleTime = now
  isOpen.value = !isOpen.value
}

// ========================
// 表单数据
// ========================
const form = reactive({
  endpoint: '',
  apiKey: '',
  model: '',
  mode: 'custom'
})

const showKey = ref(false)
const models = ref([])
const isConnecting = ref(false)
const connectError = ref('')
const connectStatus = ref('连接并获取模型')
const saveToast = ref('')
const saveToastType = ref('')
const savedConfig = reactive({
  endpoint: '',
  apiKey: '',
  model: '',
  mode: 'custom'
})

// ========================
// 加载已保存配置
// ========================
async function loadConfig() {
  const endpoint = await db.settings.get('ai_endpoint')
  const apiKey   = await db.settings.get('ai_key')
  const model    = await db.settings.get('ai_model')
  const mode     = await db.settings.get('ai_mode')

  if (endpoint) { form.endpoint = endpoint.value; savedConfig.endpoint = endpoint.value }
  if (apiKey)   { form.apiKey = apiKey.value;     savedConfig.apiKey = apiKey.value }
  if (model)    { form.model = model.value;       savedConfig.model = model.value }
  if (mode)     { form.mode = mode.value;         savedConfig.mode = mode.value }
}

// ========================
// 连接获取模型列表
// ========================
async function connectToAI() {
  if (!form.endpoint || !form.apiKey) return
  isConnecting.value = true
  connectError.value = ''
  models.value = []
  try {
    const base = form.endpoint.replace(/\/+$/, '')
    const response = await axios.get(`${base}/models`, {
      headers: { 'Authorization': `Bearer ${form.apiKey}` },
      timeout: 8000
    })
    if (response.data?.data) {
      models.value = response.data.data
      connectStatus.value = '✓ 连接成功'
      if (savedConfig.model) {
        const found = models.value.find(m => m.id === savedConfig.model)
        if (found) form.model = savedConfig.model
      } else if (models.value.length > 0) {
        form.model = models.value[0].id
      }
    }
  } catch (err) {
    connectError.value = '连接失败，请检查站点地址和 API Key'
    connectStatus.value = '重新连接'
    console.error(err)
  } finally {
    isConnecting.value = false
  }
}

// ========================
// 保存配置
// ========================
async function saveConfig() {
  try {
    await db.settings.put({ key: 'ai_mode',     value: form.mode })
    await db.settings.put({ key: 'ai_endpoint', value: form.endpoint })
    await db.settings.put({ key: 'ai_key',      value: form.apiKey })
    await db.settings.put({ key: 'ai_model',    value: form.model })
    savedConfig.mode     = form.mode
    savedConfig.endpoint = form.endpoint
    savedConfig.apiKey   = form.apiKey
    savedConfig.model    = form.model
    saveToast.value     = '✓ 配置已保存'
    saveToastType.value = 'success'
  } catch (err) {
    saveToast.value     = '✕ 保存失败，请重试'
    saveToastType.value = 'error'
  } finally {
    setTimeout(() => {
      saveToast.value = ''
      if (saveToastType.value === 'success') isOpen.value = false
      saveToastType.value = ''
    }, 2000)
  }
}

// ========================
// 清除配置
// ========================
async function clearConfig() {
  await db.settings.delete('ai_mode')
  await db.settings.delete('ai_endpoint')
  await db.settings.delete('ai_key')
  await db.settings.delete('ai_model')
  form.mode     = 'custom'
  form.endpoint = ''; form.apiKey = ''; form.model = ''
  savedConfig.mode     = 'custom'
  savedConfig.endpoint = ''; savedConfig.apiKey = ''; savedConfig.model = ''
  models.value = []
  connectStatus.value = '连接并获取模型'
}

// ========================
// 面板拖拽
// ========================
const panelRef = ref(null)
const position = reactive({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })

function startDrag(e) {
  isDragging.value = true
  dragOffset.x = e.clientX - position.x
  dragOffset.y = e.clientY - position.y
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function startDragTouch(e) {
  isDragging.value = true
  const touch = e.touches[0]
  dragOffset.x = touch.clientX - position.x
  dragOffset.y = touch.clientY - position.y
  document.addEventListener('touchmove', onDragTouch, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
  if (!isDragging.value) return
  position.x = e.clientX - dragOffset.x
  position.y = e.clientY - dragOffset.y
}

function onDragTouch(e) {
  if (!isDragging.value) return
  e.preventDefault()
  const touch = e.touches[0]
  position.x = touch.clientX - dragOffset.x
  position.y = touch.clientY - dragOffset.y
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDragTouch)
  document.removeEventListener('touchend', stopDrag)
}

// ========================
// 生命周期
// ========================
onMounted(() => { loadConfig() })
onUnmounted(() => {
  stopDrag()
  clearTimeout(closeTimer)
})
</script>

<style scoped>
@charset "UTF-8";

/* ================== 触发按钮 ================== */
.api-trigger {
  position: fixed; 
  top: calc(1.5rem + env(safe-area-inset-top));
  right: calc(1.5rem + env(safe-area-inset-right));
  background: none; 
  border: none;
  padding: 0; 
  cursor: pointer; 
  z-index: 100; 
  box-shadow: none;
  transition: opacity 1.5s ease-in-out; 
  -webkit-tap-highlight-color: transparent;
}

.api-trigger.is-hidden {
  opacity: 0 !important;
  pointer-events: none !important;
}

.api-trigger-img {
  width: 72px; 
  height: 72px; 
  object-fit: contain;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

/* ================== 悬浮提示字 ================== */
.api-tooltip {
  position: absolute; 
  top: calc(50% + ((var(--safe-top, 0px) - var(--safe-bottom, 0px)) / 2));
  left: 50%; 
  transform: translate(-50%, -50%);
  font-size: 0.85rem; 
  font-weight: 900;
  color: #3e2312; 
  letter-spacing: 0.15em;
  font-family: sans-serif;
  text-shadow: 
    0 0 4px rgba(255, 255, 255, 1), 
    0 0 8px rgba(255, 255, 255, 0.9), 
    0 0 15px rgba(255, 255, 255, 0.8);
  opacity: 0; 
  transition: all 0.3s ease; 
  pointer-events: none;
}

.api-trigger:hover .api-tooltip { 
  opacity: 1; 
  transform: translate(-50%, -50%) scale(1.1); 
}

.api-trigger:hover .api-trigger-img {
  transform: scale(1.05); 
  filter: drop-shadow(0 6px 15px rgba(180, 140, 40, 0.6));
}

/* ================== 核心面板 ================== */
.api-panel {
  position: fixed;
  top: calc(50% + ((var(--safe-top, 0px) - var(--safe-bottom, 0px)) / 2));
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(360px, calc(100vw - var(--safe-left, 0px) - var(--safe-right, 0px) - 1.5rem));
  max-height: calc(var(--app-height, 100vh) - var(--safe-top, 0px) - var(--safe-bottom, 0px) - 1.5rem);
  z-index: 200;
  background-color: transparent; 
  border: none; 
  border-radius: 0; 
  overflow: hidden; 
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.25));
}

.api-panel::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('https://drive-cdn.mujian.me/49/1d4d9c17-d3d4-4b88-b20c-8ea0ded78a48_ai-BG.png');
  background-size: cover;
  background-position: center;
  opacity: 0.75; 
  z-index: -1;
}

/* ================== 头部 ================== */
.api-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.2rem 1.5rem 1.5rem 1.5rem; 
  background: transparent;
  cursor: grab; user-select: none;
  position: relative; 
  border-bottom: none;
  -webkit-user-select: none;
  touch-action: none;
}

.api-panel-header:active { cursor: grabbing; }

.api-panel-header::after {
  content: '';
  position: absolute;
  bottom: -5px; 
  left: 5%; 
  width: 90%;
  height: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 20'%3E%3Cpath d='M10,10 C60,10 100,10 130,5 C140,2 145,10 150,10 C155,10 160,2 170,5 C200,10 240,10 290,10' fill='none' stroke='%23c69c3d' stroke-width='2.5' stroke-linecap='round'/%3E%3Cpolygon points='150,4 156,10 150,16 144,10' fill='%23c69c3d'/%3E%3Ccircle cx='130' cy='5' r='2' fill='%23c69c3d'/%3E%3Ccircle cx='170' cy='5' r='2' fill='%23c69c3d'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 1)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

.api-panel-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.15rem; font-weight: bold;
  color: #2b180d; 
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.8);
  font-family: sans-serif;
}

.api-panel-close {
  position: relative;
  width: 28px; 
  height: 28px; 
  background: rgba(255, 255, 255, 0.3);
  border: none; border-radius: 50%; color: #2b180d; font-size: 1rem;
  cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
  -webkit-tap-highlight-color: transparent;
}

.api-panel-close::before {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
}

.api-panel-close:hover { background: rgba(255, 255, 255, 0.8); color: #d03020; }

/* ================== 面板内容 ================== */
.api-panel-body {
  padding: 1.5rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1rem;
  background: transparent;
  max-height: calc(var(--app-height) - var(--safe-top) - var(--safe-bottom) - 10rem);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.api-panel-body::-webkit-scrollbar { display: none; }

.field-group { display: flex; flex-direction: column; gap: 0.4rem; }

.field-label {
  font-size: 0.9rem; font-weight: 800;
  color: #2b180d; letter-spacing: 0.1em;
  text-shadow: 0 0 8px rgba(255, 255, 255, 1), 0 0 15px rgba(255, 255, 255, 0.8);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.field-input, .field-select {
  width: 100%; padding: 0.6rem 0.8rem;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(180, 140, 60, 0.4);
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold; color: #1a1a1a;
  outline: none; transition: all 0.2s ease; box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-appearance: none;
  appearance: none;
}
.field-input::placeholder { color: #888; font-weight: normal; }
.field-input:focus {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(180, 140, 60, 0.8);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}

.field-hint { 
  font-size: 0.80rem; color: #4a2f1d; margin: 0; font-weight: bold;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
}

.input-row { display: flex; gap: 0.5rem; }
.input-row .field-input { flex: 1; }

.eye-btn {
  min-width: 44px;
  padding: 0 0.8rem; 
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(180, 140, 60, 0.4); border-radius: 6px;
  font-size: 0.85rem; color: #2b180d; font-weight: bold;
  cursor: pointer; backdrop-filter: blur(4px);
  -webkit-tap-highlight-color: transparent;
}
.eye-btn:hover { background: rgba(255, 255, 255, 0.9); }

/* ================== 模式选择器 ================== */
.mode-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  padding: 0.6rem 0.8rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(180, 140, 60, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  -webkit-tap-highlight-color: transparent;
}

.mode-option.active {
  background: rgba(255, 248, 220, 0.9);
  border-color: rgba(180, 140, 60, 0.8);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.mode-option input[type="radio"] {
  accent-color: #c69c3d;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.mode-option span {
  font-size: 0.88rem;
  font-weight: bold;
  color: #2b180d;
  text-shadow: 0 0 6px rgba(255,255,255,0.8);
  flex: 1;
}

.mode-option small {
  font-size: 0.75rem;
  color: #7a5030;
  font-weight: bold;
  white-space: nowrap;
}

/* ================== 模式提示 ================== */
.mode-hint {
  font-size: 0.82rem;
  color: #4a2f1d;
  font-weight: bold;
  text-align: center;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  text-shadow: 0 0 6px rgba(255,255,255,0.9);
}

/* ================== 按钮区 ================== */
.connect-btn {
  width: 100%; 
  min-height: 44px;
  padding: 0.7rem;
  background: rgba(245, 235, 210, 0.85);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(180, 140, 60, 0.5); border-radius: 6px;
  font-size: 0.85rem; color: #5a4020; font-weight: bold; letter-spacing: 0.1em;
  cursor: pointer; transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.connect-btn:hover:not(:disabled) { background: rgba(255, 248, 230, 1); }

.api-panel-footer { display: flex; gap: 0.8rem; margin-top: 0.5rem; }

.save-btn {
  flex: 2; 
  min-height: 44px;
  padding: 0.7rem;
  background: rgba(100, 60, 20, 0.9);
  border: 1px solid #4a2b0f; border-radius: 6px;
  color: #f5e8c0; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.1em;
  cursor: pointer; transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.save-btn:hover:not(:disabled) { background: rgba(130, 80, 30, 1); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.clear-btn {
  flex: 1; 
  min-height: 44px;
  padding: 0.7rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(180, 60, 40, 0.4); border-radius: 6px;
  color: #a03020; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.05em;
  cursor: pointer; transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.clear-btn:hover { background: rgba(255, 255, 255, 1); }

/* ================== 其他杂项 ================== */
.connect-error { 
  font-size: 0.85rem; color: #d03020; font-weight: bold; 
  text-align: center; text-shadow: 0 0 6px white;
}
.current-config { 
  display: flex; align-items: center; justify-content: center; 
  gap: 0.4rem; font-size: 0.85rem; color: #2b180d; 
  font-weight: bold; text-shadow: 0 0 8px white;
}
.privacy-note { 
  font-size: 0.8rem; color: #4a2f1d; text-align: center; 
  margin: 0; font-weight: bold; text-shadow: 0 0 6px white; 
}

/* ================== 装饰符号 ================== */
.orn-diamond { 
  color: #c69c3d;
  font-size: 0.95rem; 
  display: inline-block; 
  animation: starPulse 4s infinite ease-in-out; 
}

@keyframes starPulse {
  0%, 100% {
    opacity: 0.8;
    transform: scale(0.9) rotate(0deg);
    text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15) rotate(15deg); 
    text-shadow: 0 0 8px rgba(255, 255, 255, 1), 0 0 15px rgba(198, 156, 61, 0.8);
  }
}

/* ================== 动画 ================== */
.slide-down-enter-active { transition: all 0.3s ease; overflow: hidden; }
.slide-down-leave-active { transition: all 0.2s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 200px; }

.panel-fade-enter-active, .panel-fade-leave-active { transition: all 0.3s ease; }
.panel-fade-enter-from, .panel-fade-leave-to { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }

/* ================== 全屏遮罩 ================== */
.api-panel-overlay {
  position: fixed;
  inset: 0;
  min-height: var(--app-height);
  background: rgba(30, 20, 15, 0.45); 
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 190; 
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.4s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

/* ================== Toast ================== */
.save-toast {
  text-align: center;
  font-size: 0.85rem;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 6px;
}
.save-toast.success { 
  color: #2a6a2a; 
  background: rgba(200, 255, 200, 0.7); 
}
.save-toast.error { 
  color: #d03020; 
  background: rgba(255, 200, 200, 0.7); 
}

.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .api-trigger {
    top: calc(1rem + var(--safe-top));
    right: calc(1rem + var(--safe-right));
  }

  .api-trigger-img {
    width: 64px;
    height: 64px;
  }

  .api-panel {
    width: calc(100vw - var(--safe-left, 0px) - var(--safe-right, 0px) - 1rem);
    max-height: calc(var(--app-height, 100vh) - var(--safe-top, 0px) - var(--safe-bottom, 0px) - 1rem);
  }

  .api-panel-header {
    padding: 1rem 1rem 1.2rem;
  }

  .api-panel-body {
    padding: 1rem;
    max-height: calc(var(--app-height, 100vh) - var(--safe-top, 0px) - var(--safe-bottom, 0px) - 8.75rem);
  }

  .api-panel-footer {
    flex-direction: column;
  }
}
</style>