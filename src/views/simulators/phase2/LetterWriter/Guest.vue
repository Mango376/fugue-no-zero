<template>
  <div class="guest-scene">

    <div class="dialogue-area" ref="dialogueArea">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="message-block"
        :class="msg.role"
      >
        <div v-if="msg.role === 'guest'" class="guest-message">
          {{ msg.text }}
        </div>
        <div v-else class="player-message">
          {{ msg.text }}
        </div>
      </div>

      <div v-if="isLoading" class="guest-message loading">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </div>
    </div>

    <div class="input-area">
      <button
        class="btn-write"
        :disabled="messages.length < 2"
        @click="$emit('start-writing')"
      >准备写信</button>

      <div class="input-row">
        <textarea
          v-model="inputText"
          class="chat-input"
          placeholder="说点什么……"
          rows="2"
          :disabled="isLoading"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <button
          class="btn-send"
          :disabled="!inputText.trim() || isLoading"
          @click="sendMessage"
        >发送</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useGuestDialogue } from './composables/useGameLogic'

const props = defineProps({ guest: Object })
const emit  = defineEmits(['start-writing', 'guest-left'])

const { messages, isLoading, sendToGuest } = useGuestDialogue(props.guest, emit)

const inputText    = ref('')
const dialogueArea = ref(null)

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  inputText.value = ''
  await sendToGuest(text)
  await nextTick()
  if (dialogueArea.value) {
    dialogueArea.value.scrollTop = dialogueArea.value.scrollHeight
  }
}
</script>

<style scoped>
.guest-scene {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f2ead8;
  font-family: 'Ma Shan Zheng', cursive, serif;
}

.dialogue-area {
  flex: 1;
  overflow-y: auto;
  padding: 48px 22%;
  display: flex;
  flex-direction: column;
  gap: 28px;
  scroll-behavior: smooth;
}

/* 客人的话：叙事+对话混排，直接渲染字符串 */
.guest-message {
  max-width: 580px;
  align-self: flex-start;
  color: #2c1a00;
  font-size: 0.95rem;
  line-height: 2.1;
  white-space: pre-wrap;
}

/* 玩家的话 */
.player-message {
  align-self: flex-end;
  max-width: 460px;
  background: rgba(139,105,20,0.07);
  padding: 10px 16px;
  border-radius: 2px;
  color: #4a3520;
  font-size: 0.9rem;
  line-height: 1.9;
}

/* 加载中 */
.loading {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 0;
}
.dot {
  width: 6px;
  height: 6px;
  background: #8b7355;
  border-radius: 50%;
  opacity: 0.3;
  animation: blink 1.2s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0.2; }
  40%           { opacity: 0.8; }
}

/* 底部输入区 */
.input-area {
  border-top: 1px solid rgba(139,105,20,0.15);
  padding: 14px 22%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(245,240,232,0.9);
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: 1px solid rgba(139,105,20,0.25);
  border-radius: 2px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 0.9rem;
  color: #2c1a00;
  resize: none;
  line-height: 1.8;
  transition: border-color 0.2s;
}
.chat-input:focus { outline: none; border-color: #8b6914; }
.chat-input::placeholder { color: #b0a08a; }

.btn-send {
  background: #8b6914;
  color: #f5f0e8;
  border: none;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.08em;
  transition: opacity 0.2s;
}
.btn-send:disabled      { opacity: 0.4; cursor: not-allowed; }
.btn-send:hover:not(:disabled) { opacity: 0.85; }

.btn-write {
  align-self: flex-end;
  background: transparent;
  border: 1px solid rgba(139,105,20,0.35);
  color: #8b7355;
  padding: 5px 18px;
  font-family: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.12em;
  transition: all 0.2s;
}
.btn-write:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-write:hover:not(:disabled) { border-color: #8b6914; color: #8b6914; }
</style>
