<template>
    <span class="typewriter-text">{{ displayText }}</span>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
    text: { type: String, default: '' },
    speed: { type: Number, default: 50 }
})

const emit = defineEmits(['done'])
const displayText = ref('')
let timer = null

watch(() => props.text, (newText) => {
    displayText.value = ''
    let i = 0
    clearInterval(timer)
    timer = setInterval(() => {
        if (i < newText.length) {
            displayText.value += newText[i]
            i++
        } else {
            clearInterval(timer)
            emit('done')
        }
    }, props.speed)
}, { immediate: true })

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.typewriter-text {
    font: inherit;
}
</style>
