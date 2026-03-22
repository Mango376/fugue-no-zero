<template>
    <Transition name="ending-fade">
        <div v-if="show" class="ending-overlay">
            <div class="ending-card">

                <!-- 顶部装饰 -->
                <div class="ending-deco">
                    <span class="deco-line"></span>
                    <span class="deco-diamond">◆</span>
                    <span class="deco-line"></span>
                </div>

                <!-- 标签 -->
                <div class="ending-label">{{ label }}</div>

                <!-- 标题 -->
                <h2 class="ending-title">{{ title }}</h2>

                <!-- 分割线 -->
                <div class="ending-divider"></div>

                <!-- 感悟文字 -->
                <p class="ending-insight">{{ insight }}</p>

                <!-- 额外内容插槽 -->
                <slot />

                <!-- 底部按钮 -->
                <div class="ending-actions">
                    <button
                        class="btn-return"
                        @click="$emit('return')"
                    >
                        ‹ 返回演奏厅
                    </button>
                    <button
                        v-if="showReplay"
                        class="btn-replay"
                        @click="$emit('replay')"
                    >
                        ↺ 再次演奏
                    </button>
                </div>

                <!-- 底部装饰 -->
                <div class="ending-deco">
                    <span class="deco-line"></span>
                    <span class="deco-diamond">◆</span>
                    <span class="deco-line"></span>
                </div>

            </div>
        </div>
    </Transition>
</template>

<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: '演奏结束'
    },
    title: {
        type: String,
        default: ''
    },
    insight: {
        type: String,
        default: ''
    },
    showReplay: {
        type: Boolean,
        default: true
    }
})

defineEmits(['return', 'replay'])
</script>

<style scoped>
.ending-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 8, 0, 0.88);
    z-index: 80;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.ending-card {
    background: linear-gradient(160deg, #f5edd8, #eddfc0);
    border: 1px solid rgba(180, 140, 60, 0.4);
    border-radius: 8px;
    padding: 2.5rem 3rem;
    max-width: 520px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.ending-deco {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin: 1rem 0;
}

.deco-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(180, 140, 60, 0.4)
    );
}

.deco-line:last-child {
    background: linear-gradient(
        90deg,
        rgba(180, 140, 60, 0.4),
        transparent
    );
}

.deco-diamond {
    font-size: 0.4rem;
    color: #9a7a40;
    opacity: 0.7;
}

.ending-label {
    font-size: 0.65rem;
    color: #9a7840;
    letter-spacing: 0.4em;
    font-family: 'Courier New', monospace;
    margin-bottom: 0.8rem;
}

.ending-title {
    font-size: 1.8rem;
    color: #1a0e04;
    letter-spacing: 0.3em;
    font-weight: normal;
    font-family: 'KaiTi', 'STKaiti', serif;
    margin: 0 0 0.5rem 0;
}

.ending-divider {
    height: 1px;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(140, 100, 40, 0.3),
        transparent
    );
    margin: 1rem 0;
}

.ending-insight {
    font-size: 0.92rem;
    color: #4a3418;
    line-height: 2.2;
    letter-spacing: 0.06em;
    margin: 0 0 1.5rem 0;
    font-family: 'KaiTi', 'STKaiti', serif;
}

.ending-actions {
    display: flex;
    gap: 0.8rem;
    justify-content: center;
    margin-bottom: 0.5rem;
}

.btn-return {
    padding: 0.7rem 1.8rem;
    background: transparent;
    border: 1px solid rgba(140, 100, 40, 0.35);
    border-radius: 4px;
    color: #7a5e28;
    font-family: 'KaiTi', 'STKaiti', serif;
    font-size: 0.85rem;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.25s ease;
}

.btn-return:hover {
    background: rgba(140, 100, 40, 0.08);
    border-color: rgba(140, 100, 40, 0.55);
}

.btn-replay {
    padding: 0.7rem 1.8rem;
    background: linear-gradient(135deg, #7a5018, #5a3808);
    border: 1px solid #9a6828;
    border-radius: 4px;
    color: #f5e8c0;
    font-family: 'KaiTi', 'STKaiti', serif;
    font-size: 0.85rem;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.25s ease;
}

.btn-replay:hover {
    background: linear-gradient(135deg, #8a6025, #6a4515);
    box-shadow: 0 3px 10px rgba(100, 60, 10, 0.2);
    transform: translateY(-1px);
}

/* 动画 */
.ending-fade-enter-active {
    transition: all 0.6s ease;
}
.ending-fade-leave-active {
    transition: all 0.4s ease;
}
.ending-fade-enter-from,
.ending-fade-leave-to {
    opacity: 0;
}
.ending-fade-enter-from .ending-card {
    transform: translateY(20px) scale(0.97);
}

/* 移动端 */
@media (max-width: 640px) {
    .ending-card {
        padding: 2rem 1.5rem;
    }
    .ending-title {
        font-size: 1.4rem;
    }
    .ending-actions {
        flex-direction: column;
    }
}
</style>
