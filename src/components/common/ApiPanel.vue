<template>
    <!-- 触发按钮 -->
    <button
      class="api-trigger"
      :class="{ 'is-hidden': !gameStore.showGlobalApiBtn }" 
      :style="triggerStyle"
      @mousedown="startDragTrigger"
      @touchstart.prevent="startDragTriggerTouch"
      @click="togglePanel"
    >
     <img src="https://drive.mujian.me/f/B46Cv/ai-icon.png" class="api-trigger-img" alt="AI" />
      <!-- 悬停提示 -->
      <span class="api-tooltip">API</span>
    </button>
  
    <!-- 悬浮面板 -->
    <Teleport to="body">
      <Transition name="fade-overlay">
      <!-- 点击遮罩任意空白处也可以直接关闭面板 -->
      <div v-if="isOpen" class="api-panel-overlay" @click="isOpen = false"></div>
    </Transition>
      <Transition name="panel-fade">
        <div
          v-if="isOpen"
          class="api-panel"
          ref="panelRef"
        >
          <!-- 拖拽头部 -->
          <div
            class="api-panel-header"
            @mousedown="startDrag"
            @touchstart="startDragTouch"
          >
            <div class="api-panel-title">
              <span class="orn-diamond">🎼</span>
              AI 接入设置
            </div>
            <button class="api-panel-close" @click="togglePanel">✕</button>
          </div>
  
          <!-- 面板内容 -->
          <div class="api-panel-body">
  
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
  
            <div v-if="savedConfig.model" class="current-config">
              <span class="orn-diamond small">◆</span>
              当前：{{ savedConfig.model }}
            </div>
  
            <div class="api-panel-footer">
              <button class="save-btn" @click="saveConfig" :disabled="!form.model">
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
  // 悬停控制
  let closeTimer = null
  
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
    triggerDragOffset.x = touch.clientX - triggerPos.x
    triggerDragOffset.y = touch.clientY - triggerPos.y
    document.addEventListener('touchmove', onDragTriggerTouch)
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
    dragMoved.value = true
    const touch = e.touches[0]
    triggerPos.x = touch.clientX - triggerDragOffset.x
    triggerPos.y = touch.clientY - triggerDragOffset.y
  }
  
  function stopDragTrigger() {
    isTriggerDragging.value = false
    document.removeEventListener('mousemove', onDragTrigger)
    document.removeEventListener('mouseup', stopDragTrigger)
    document.removeEventListener('touchmove', onDragTriggerTouch)
    document.removeEventListener('touchend', stopDragTrigger)
  }
  
  function togglePanel() {
    if (dragMoved.value) return
    isOpen.value = !isOpen.value
  }
  
  // ========================
  // 表单数据
  // ========================
  const form = reactive({ endpoint: '', apiKey: '', model: '' })
  const showKey = ref(false)
  const models = ref([])
  const isConnecting = ref(false)
  const connectError = ref('')
  const connectStatus = ref('连接并获取模型')
  const saveToast = ref('')
  const saveToastType = ref('')
  const savedConfig = reactive({ endpoint: '', apiKey: '', model: '' })
  
  // ========================
  // 加载已保存配置
  // ========================
  async function loadConfig() {
    const endpoint = await db.settings.get('ai_endpoint')
    const apiKey = await db.settings.get('ai_key')
    const model = await db.settings.get('ai_model')
    if (endpoint) { form.endpoint = endpoint.value; savedConfig.endpoint = endpoint.value }
    if (apiKey) { form.apiKey = apiKey.value; savedConfig.apiKey = apiKey.value }
    if (model) { form.model = model.value; savedConfig.model = model.value }
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
      await db.settings.put({ key: 'ai_endpoint', value: form.endpoint })
      await db.settings.put({ key: 'ai_key', value: form.apiKey })
      await db.settings.put({ key: 'ai_model', value: form.model })
      savedConfig.endpoint = form.endpoint
      savedConfig.apiKey = form.apiKey
      savedConfig.model = form.model
      saveToast.value = '✓ 配置已保存'
      saveToastType.value = 'success'
    } catch (err) {
      saveToast.value = '✕ 保存失败，请重试'
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
    await db.settings.delete('ai_endpoint')
    await db.settings.delete('ai_key')
    await db.settings.delete('ai_model')
    form.endpoint = ''; form.apiKey = ''; form.model = ''
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
  const panelStyle = computed(() => ({}))
  
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
    document.addEventListener('touchmove', onDragTouch)
    document.addEventListener('touchend', stopDrag)
  }
  
  function onDrag(e) {
    if (!isDragging.value) return
    position.x = e.clientX - dragOffset.x
    position.y = e.clientY - dragOffset.y
  }
  
  function onDragTouch(e) {
    if (!isDragging.value) return
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

/* =========================================================
   《零号赋格》 - 极简通透水彩风 API 面板
   ========================================================= */
/* ================== 触发按钮 (放大版) ================== */
.api-trigger {
  position: fixed; 
  top: 1.5rem; 
  right: 1.5rem; 
  background: none; 
  border: none;
  padding: 0; 
  cursor: pointer; 
  z-index: 100; 
  box-shadow: none;
  transition: opacity 1.5s ease-in-out; 
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
  top: 50%; 
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

/* 悬停时的动画效果 */
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
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 360px; z-index: 200;
  
  /* 【关键修改】：这里不再直接写 background-image */
  background-color: transparent; 
  border: none; 
  border-radius: 0; 
  overflow: visible; 
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.25));
}

/* 【新增】：用伪元素单独做底图，这样可以随意控制底图的透明度，而不影响文字 */
.api-panel::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('https://drive.mujian.me/f/QMofl/ai-BG.png');
  background-size: cover;
  background-position: center;
  
  /* ↓↓↓ 就是这里！控制底图的透明度 ↓↓↓ */
  /* 0.75 表示 75% 不透明。如果你想更淡，就改成 0.6 或 0.5 */
  opacity: 0.75; 
  
  z-index: -1; /* 确保底图呆在文字的下面 */
}

/* ================== 头部与分界线 ================== */
.api-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  /* 稍微增加底部内边距，给下方的高级分界线留出呼吸空间 */
  padding: 1.2rem 1.5rem 1.5rem 1.5rem; 
  background: transparent;
  cursor: grab; user-select: none;
  
  /* 关键：设置为相对定位，为下面的伪元素分界线做基准 */
  position: relative; 
  /* 去掉原有的死板边框 */
  border-bottom: none; 
}

.api-panel-header:active { cursor: grabbing; }
/* 用 ::after 伪元素画一条“两端渐隐的古典金线” */
/* ================== 高级花体装饰分界线 (深金色 + 白发光) ================== */
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

/* ================== 动态装饰符号 (同步换成深金) ================== */
.orn-diamond { 
  color: #c69c3d; /* 统一使用深金色 */
  font-size: 0.95rem; 
  display: inline-block; 
  animation: starPulse 4s infinite ease-in-out; 
}

/* 呼吸动画：暗的时候泛白光，亮的时候爆发金白混合光 */
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

/* 标题：深色 + 强烈白色发光，保证任何底色下都清晰 */
.api-panel-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.15rem; font-weight: bold;
  color: #2b180d; 
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.8);
  font-family: sans-serif;
}

.api-panel-close {
  width: 28px; height: 28px; background: rgba(255, 255, 255, 0.3);
  border: none; border-radius: 50%; color: #2b180d; font-size: 1rem;
  cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
.api-panel-close:hover { background: rgba(255, 255, 255, 0.8); color: #d03020; }

/* ================== 身体与表单 ================== */
.api-panel-body {
  padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;
  background: transparent;
}

.field-group { display: flex; flex-direction: column; gap: 0.4rem; }

/* 标签文字强制使用系统干净字体，防止变成夸张花体 */
.field-label {
  font-size: 0.9rem; font-weight: 800;
  color: #2b180d; letter-spacing: 0.1em;
  text-shadow: 0 0 8px rgba(255, 255, 255, 1), 0 0 15px rgba(255, 255, 255, 0.8);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 输入框：半透明磨砂玻璃，既能看到底图，又能看清输入的字 */
.field-input, .field-select {
  width: 100%; padding: 0.6rem 0.8rem;
  background: rgba(255, 255, 255, 0.65); /* 半透明白底 */
  backdrop-filter: blur(6px); /* 磨砂效果 */
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(180, 140, 60, 0.4);
  border-radius: 6px;
  font-size: 0.85rem; font-weight: bold; color: #1a1a1a;
  outline: none; transition: all 0.2s ease; box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
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
  padding: 0 0.8rem; background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(180, 140, 60, 0.4); border-radius: 6px;
  font-size: 0.85rem; color: #2b180d; font-weight: bold;
  cursor: pointer; backdrop-filter: blur(4px);
}
.eye-btn:hover { background: rgba(255, 255, 255, 0.9); }

/* ================== 按钮区 ================== */
.connect-btn {
  width: 100%; padding: 0.7rem;
  background: rgba(245, 235, 210, 0.85); /* 米黄实体底色 */
  backdrop-filter: blur(4px);
  border: 1px solid rgba(180, 140, 60, 0.5); border-radius: 6px;
  font-size: 0.85rem; color: #5a4020; font-weight: bold; letter-spacing: 0.1em;
  cursor: pointer; transition: all 0.2s ease;
}
.connect-btn:hover:not(:disabled) { background: rgba(255, 248, 230, 1); }

.api-panel-footer { display: flex; gap: 0.8rem; margin-top: 0.5rem; }

.save-btn {
  flex: 2; padding: 0.7rem;
  background: rgba(100, 60, 20, 0.9); /* 深咖啡实色 */
  border: 1px solid #4a2b0f; border-radius: 6px;
  color: #f5e8c0; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.1em;
  cursor: pointer; transition: all 0.2s ease;
}
.save-btn:hover:not(:disabled) { background: rgba(130, 80, 30, 1); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.clear-btn {
  flex: 1; padding: 0.7rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(180, 60, 40, 0.4); border-radius: 6px;
  color: #a03020; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.05em;
  cursor: pointer; transition: all 0.2s ease;
}
.clear-btn:hover { background: rgba(255, 255, 255, 1); }

/* ================== 其他杂项 ================== */
.connect-error { font-size: 0.85rem; color: #d03020; font-weight: bold; text-align: center; text-shadow: 0 0 6px white;}
.current-config { display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.85rem; color: #2b180d; font-weight: bold; text-shadow: 0 0 8px white;}
.privacy-note { font-size: 0.75rem; color: #4a2f1d; text-align: center; margin: 0; font-weight: bold; text-shadow: 0 0 6px white; }
/* ================== 动态装饰符号 ================== */
.orn-diamond { 
  color: #cda869; /* 古典金 */
  font-size: 0.95rem; /* 大小微调 */
  /* 动画必须让元素变成块级或行内块级才能生效旋转和缩放 */
  display: inline-block; 
  /* 绑定名为 starPulse 的动画，耗时4秒，无限循环，平滑过渡 */
  animation: starPulse 4s infinite ease-in-out; 
}

/* 定义星芒呼吸动画 */
@keyframes starPulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(0.9) rotate(0deg);
    text-shadow: 0 0 2px rgba(180,140,60,0.5);
  }
  50% {
    opacity: 1;
    /* 放大1.15倍，并且微微旋转15度，像星星在闪烁/自转 */
    transform: scale(1.15) rotate(15deg); 
    /* 发出强烈的白色轮廓光 */
    text-shadow: 0 0 8px rgba(255, 255, 255, 1), 0 0 15px rgba(205, 168, 105, 0.8);
  }
}

.slide-down-enter-active { transition: all 0.3s ease; overflow: hidden; }
.slide-down-leave-active { transition: all 0.2s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 200px; }
.panel-fade-enter-active, .panel-fade-leave-active { transition: all 0.3s ease; }
.panel-fade-enter-from, .panel-fade-leave-to { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }

/* ================== 全屏模糊遮罩 ================== */
.api-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* 使用偏暖的深褐色半透明，符合游戏的古典调性 */
  background: rgba(30, 20, 15, 0.45); 
  /* 核心魔法：背景毛玻璃模糊效果 */
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(4px);
  /* 层级必须比面板的200小，保证它垫在面板下面 */
  z-index: 190; 
}

/* 遮罩的淡入淡出动画 */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.4s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

  </style>
  
