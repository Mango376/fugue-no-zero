<template>
  <div class="letter-scene">

    <!-- 左侧：写信 -->
    <div class="letter-panel">
      <div class="letter-header">
        <span class="letter-to">写给：{{ guest.recipient }}</span>
        <button class="btn-back" @click="$emit('back-to-chat')">← 回去问问</button>
      </div>

      <div class="paper-wrapper">
        <textarea
          v-model="letterContent"
          class="paper"
          placeholder="写点什么……"
          spellcheck="false"
        />
      </div>

      <div class="params-row">
        <div v-for="param in params" :key="param.key" class="param-group">
          <span class="param-label">{{ param.label }}</span>
          <select v-model="paramValues[param.key]" class="param-select">
            <option v-for="opt in param.options" :key="opt">{{ opt }}</option>
          </select>
        </div>
      </div>

      <div class="letter-actions">
        <button class="btn-polish" :disabled="isPolishing" @click="onPolish">
          {{ isPolishing ? '润色中……' : 'AI 帮我润色' }}
        </button>
        <button class="btn-submit" :disabled="!letterContent.trim()" @click="onSubmit">
          写好了，给客人看
        </button>
      </div>
    </div>

    <!-- 右侧：参考 -->
    <div class="reference-panel">
      <p class="ref-title">客人说的</p>
      <div class="ref-content">
        <p v-for="(msg, i) in guestMessages" :key="i" class="ref-line">{{ msg }}</p>
      </div>

      <div class="ref-divider" />

      <p class="ref-title">对话记录</p>
      <div class="ref-content">
        <div
          v-for="(msg, i) in conversationHistory"
          :key="i"
          class="log-line"
          :class="msg.role"
        >
          <span class="log-role">{{ msg.role === 'player' ? '我' : '客' }}</span>
          <span class="log-text">{{ msg.text }}</span>
        </div>
      </div>
    </div>

    <!-- 客人审阅弹层 -->
    <transition name="slide-up">
      <div v-if="reviewMode" class="review-overlay">
        <div class="review-box">
          <div class="review-reaction">{{ reviewText }}</div>
          <div class="review-actions">
            <template v-if="reviewResult === 'satisfied'">
              <button class="btn-done" @click="onDone">送走客人</button>
            </template>
            <template v-else>
              <p class="edit-hint">{{ editHint }}</p>
              <button class="btn-revise" @click="reviewMode = false">修改一下</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLetterSystem } from './composables/useGameLogic'

const props = defineProps({ guest: Object })
const emit  = defineEmits(['submitted', 'back-to-chat'])

const {
  conversationHistory,
  polishLetter,
  reviewLetter,
  isPolishing,
} = useLetterSystem(props.guest)

const letterContent = ref('')
const revisionCount = ref(0)
const reviewMode    = ref(false)
const reviewText    = ref('')
const reviewResult  = ref('')
const editHint      = ref('')

const paramValues = ref({ tone: '朴实', length: '适中', focus: '偏感情', signature: '要' })

const params = [
  { key: 'tone',      label: '语气', options: ['朴实','温柔','正式','克制'] },
  { key: 'length',    label: '长度', options: ['简短','适中','详尽'] },
  { key: 'focus',     label: '重点', options: ['偏事情','偏感情','偏请求'] },
  { key: 'signature', label: '落款', options: ['要','不要'] },
]

const guestMessages = computed(() =>
  conversationHistory.value.filter(m => m.role === 'guest').slice(0, 4).map(m => m.text)
)

async function onPolish() {
  const result = await polishLetter({ playerDraft: letterContent.value, params: paramValues.value })
  if (result) letterContent.value = result
}

async function onSubmit() {
  const raw = await reviewLetter({ letterContent: letterContent.value, revisionCount: revisionCount.value })
  reviewText.value   = raw.reaction
  reviewResult.value = raw.result
  editHint.value     = raw.editHint
  reviewMode.value   = true
  if (raw.result !== 'satisfied') revisionCount.value++
}

function onDone() {
  reviewMode.value = false
  emit('submitted')
}
</script>

<style scoped>
.letter-scene {
  width: 100%;
  height: 100%;
  display: flex;
  background: #f2ead8;
  font-family: 'Ma Shan Zheng', cursive, serif;
}

/* ── 左侧 ── */
.letter-panel {
  flex: 1.4;
  display: flex;
  flex-direction: column;
  padding: 32px 40px;
  border-right: 1px solid rgba(139,105,20,0.12);
  gap: 14px;
}

.letter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.letter-to { font-size: 0.85rem; color: #7a6248; letter-spacing: 0.1em; }

.btn-back {
  background: transparent;
  border: none;
  color: #8b7355;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.2s;
}
.btn-back:hover { opacity: 1; }

.paper-wrapper {
  flex: 1;
  background: #fffef5;
  border: 1px solid rgba(139,105,20,0.15);
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.03);
  border-radius: 2px;
  overflow: hidden;
}
.paper {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  padding: 24px 28px;
  font-family: inherit;
  font-size: 1rem;
  color: #2c1a00;
  line-height: 2.2;
  resize: none;
}
.paper:focus { outline: none; }
.paper::placeholder { color: #c4b49a; }

.params-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.param-group { display: flex; align-items: center; gap: 8px; }
.param-label { font-size: 0.78rem; color: #7a6248; }
.param-select {
  background: transparent;
  border: 1px solid rgba(139,105,20,0.25);
  border-radius: 2px;
  padding: 3px 8px;
  font-family: inherit;
  font-size: 0.78rem;
  color: #4a3520;
  cursor: pointer;
}
.param-select:focus { outline: none; border-color: #8b6914; }

.letter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-polish {
  background: transparent;
  border: 1px solid rgba(139,105,20,0.3);
  color: #8b7355;
  padding: 7px 18px;
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.08em;
  transition: all 0.2s;
}
.btn-polish:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-polish:hover:not(:disabled) { border-color: #8b6914; color: #8b6914; }

.btn-submit {
  background: #8b6914;
  color: #f5f0e8;
  border: none;
  padding: 7px 22px;
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.08em;
  transition: opacity 0.2s;
}
.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-submit:hover:not(:disabled) { opacity: 0.85; }

/* ── 右侧 ── */
.reference-panel {
  width: 260px;
  display: flex;
  flex-direction: column;
  padding: 32px 20px;
  gap: 12px;
  overflow-y: auto;
}
.ref-title { font-size: 0.72rem; color: #b0a08a; letter-spacing: 0.15em; }
.ref-content { display: flex; flex-direction: column; gap: 6px; }
.ref-line {
  font-size: 0.82rem;
  color: #4a3520;
  line-height: 1.9;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(139,105,20,0.07);
  white-space: pre-wrap;
}
.ref-divider { height: 1px; background: rgba(139,105,20,0.1); margin: 4px 0; }

.log-line { display: flex; gap: 8px; font-size: 0.78rem; line-height: 1.7; }
.log-role { color: #b0a08a; flex-shrink: 0; width: 14px; }
.log-line.guest  .log-text { color: #4a3520; }
.log-line.player .log-text { color: #7a6248; }

/* ── 审阅弹层 ── */
.review-overlay {
  position: fixed;
  inset: 0;
  background: rgba(44,26,0,0.25);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}
.review-box {
  background: #fffef5;
  width: 100%;
  max-width: 600px;
  padding: 36px 48px;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.review-reaction {
  font-size: 0.95rem;
  line-height: 2.1;
  color: #2c1a00;
  white-space: pre-wrap;
}
.edit-hint { font-size: 0.82rem; color: #7a6248; font-style: italic; }
.review-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }

.btn-done {
  background: #8b6914;
  color: #f5f0e8;
  border: none;
  padding: 8px 28px;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.1em;
}
.btn-revise {
  background: transparent;
  border: 1px solid rgba(139,105,20,0.3);
  color: #8b7355;
  padding: 8px 22px;
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.08em;
}

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
