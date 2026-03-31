<template>
  <Transition name="transition-fade">
    <div v-if="visible" class="loading-overlay">
      <div class="loading-bg"></div>

      <Transition name="notice-fade">
        <div v-if="phase === 'notice'" class="loading-notice">
          <div class="notice-ornament">
            <span class="notice-line"></span>
            <span class="notice-diamond">◆</span>
            <span class="notice-line"></span>
          </div>
          <div class="notice-text">建议佩戴耳机</div>
          <div class="notice-sub">Best experienced with headphones</div>
          <div class="notice-ornament">
            <span class="notice-line"></span>
            <span class="notice-diamond">◆</span>
            <span class="notice-line"></span>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useAudioStore } from '@/stores/audioStore'

const store = useGameStore()
const audioStore = useAudioStore()
const visible = ref(false)
const phase = ref('idle')

watch(() => store.isTransitioning, async (val) => {
  if (val) {
    phase.value = 'darkening'
    visible.value = true
    audioStore.fadeOutCurrent(800)

    await delay(800)

    // ← 只有 withNotice 为 true 时才显示提示
    if (store.showHeadphoneNotice) {
      phase.value = 'notice'
      await delay(2000)
    }

    phase.value = 'brightening'
    await delay(1000)
    visible.value = false
    store.endTransition()
  }
})


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-bg {
  position: absolute;
  inset: 0;
  background: #060503;
}

.transition-fade-enter-active {
  transition: opacity 0.8s ease;
}
.transition-fade-leave-active {
  transition: opacity 1.2s ease;
}
.transition-fade-enter-from,
.transition-fade-leave-to {
  opacity: 0;
}

.notice-fade-enter-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.notice-fade-leave-active {
  transition: opacity 0.6s ease;
}
.notice-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.notice-fade-leave-to {
  opacity: 0;
}

.loading-notice {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.notice-text {
  font-size: 1.1rem;
  font-family: '正文中文', 'KaiTi', serif;
  color: #d8c398;
  letter-spacing: 0.5em;
  margin-left: 0.5em;
  text-shadow: 0 0 15px rgba(216, 195, 152, 0.4);
}

.notice-sub {
  font-size: 0.65rem;
  font-family: '内容英文', 'Georgia', serif;
  color: rgba(216, 195, 152, 0.45);
  letter-spacing: 0.2em;
  font-style: italic;
}

.notice-ornament {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 200px;
}

.notice-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(216, 195, 152, 0.3));
}
.notice-line:last-child {
  background: linear-gradient(90deg, rgba(216, 195, 152, 0.3), transparent);
}

.notice-diamond {
  font-size: 0.4rem;
  color: rgba(216, 195, 152, 0.5);
}
</style>
