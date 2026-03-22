<template>
    <div class="choice-panel" :class="{ visible: show }">

        <div class="choice-hint" v-if="hint">
            <span class="orn-diamond">◆</span>
            {{ hint }}
            <span class="orn-diamond">◆</span>
        </div>

        <div class="choice-list">
            <button
                v-for="(choice, index) in choices"
                :key="index"
                class="choice-item"
                :class="{
                    selected: selectedIndex === index,
                    disabled: isDisabled
                }"
                @click="selectChoice(index, choice)"
            >
                <span class="choice-index">{{ indexLabel(index) }}</span>
                <span class="choice-text">{{ choice.text }}</span>
                <span class="choice-arrow">›</span>
            </button>
        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    choices: {
        type: Array,
        default: () => []
        // [{ text: '选项文字', value: '任意值' }]
    },
    hint: {
        type: String,
        default: '请做出选择'
    },
    show: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['select'])
const selectedIndex = ref(null)
const isDisabled = ref(false)

function indexLabel(i) {
    return ['A', 'B', 'C', 'D', 'E'][i] || i + 1
}

function selectChoice(index, choice) {
    if (isDisabled.value) return
    selectedIndex.value = index
    isDisabled.value = true
    emit('select', { index, choice })
}

// 重置（进入下一轮选择时调用）
function reset() {
    selectedIndex.value = null
    isDisabled.value = false
}

defineExpose({ reset })
</script>

<style scoped>
.choice-panel {
    width: 100%;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.4s ease;
    pointer-events: none;
}

.choice-panel.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: all;
}

.choice-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    font-size: 0.7rem;
    color: #9a7840;
    letter-spacing: 0.2em;
    margin-bottom: 0.8rem;
}

.orn-diamond {
    font-size: 0.35rem;
    opacity: 0.6;
}

.choice-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.choice-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    padding: 0.8rem 1rem;
    background: rgba(255, 250, 238, 0.7);
    border: 1px solid rgba(180, 140, 60, 0.2);
    border-left: 3px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.25s ease;
    text-align: left;
    font-family: 'KaiTi', 'STKaiti', serif;
}

.choice-item:hover:not(.disabled) {
    background: rgba(255, 248, 228, 0.92);
    border-color: rgba(180, 140, 60, 0.4);
    border-left-color: #9a7840;
    transform: translateX(4px);
    box-shadow: 0 3px 10px rgba(100, 60, 10, 0.07);
}

.choice-item.selected {
    background: rgba(255, 245, 210, 0.95);
    border-color: rgba(180, 140, 60, 0.5);
    border-left-color: #c8a040;
}

.choice-item.disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.choice-item.disabled:not(.selected) {
    opacity: 0.35;
}

.choice-index {
    width: 22px;
    height: 22px;
    border: 1px solid rgba(180, 140, 60, 0.4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    color: #9a7840;
    flex-shrink: 0;
    font-family: 'Courier New', monospace;
}

.choice-item.selected .choice-index {
    background: #9a7840;
    color: #f5e8c0;
    border-color: #9a7840;
}

.choice-text {
    flex: 1;
    font-size: 0.88rem;
    color: #3a2808;
    letter-spacing: 0.04em;
    line-height: 1.6;
}

.choice-arrow {
    font-size: 1rem;
    color: #c8a040;
    opacity: 0;
    transition: all 0.2s ease;
}

.choice-item:hover:not(.disabled) .choice-arrow {
    opacity: 1;
    transform: translateX(3px);
}
</style>
