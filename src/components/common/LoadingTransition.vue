<template>
  <Transition name="transition-fade">
    <div v-if="visible" class="loading-overlay" :class="phase">

      <!-- 黑幕层 -->
      <div class="loading-bg"></div>

      <!-- 提示文字（中间阶段显示） -->
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

const store = useGameStore()
const visible = ref(false)
const phase = ref('idle') // 'darkening' | 'notice' | 'brightening'

watch(() => store.isTransitioning, async (val) => {
  if (val) {
    // 第一阶段：黑幕出现
    phase.value = 'darkening'
    visible.value = true

    // 第二阶段：显示提示文字
    await delay(800)
    phase.value = 'notice'

    // 第三阶段：提示消失，保持黑屏等待路由加载
    await delay(2000)
    phase.value = 'brightening'

    // 第四阶段：黑幕退出
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

/* 黑幕淡入 */
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

/* 提示文字淡入淡出 */
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

/* 提示文字样式 */
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
