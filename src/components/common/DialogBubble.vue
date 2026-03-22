<template>
    <div class="bubble-wrapper" :class="role">

        <!-- NPC / 系统消息 -->
        <div v-if="role !== 'player'" class="bubble-left">
            <div class="bubble-avatar" v-if="avatar">{{ avatar }}</div>
            <div class="bubble-body">
                <div class="bubble-name" v-if="name">{{ name }}</div>
                <div class="bubble-text">
                    <Typewriter
                        v-if="animate"
                        :text="text"
                        :speed="speed"
                        @done="$emit('done')"
                    />
                    <span v-else>{{ text }}</span>
                </div>
            </div>
        </div>

        <!-- 玩家消息 -->
        <div v-else class="bubble-right">
            <div class="bubble-body player">
                <div class="bubble-text player-text">{{ text }}</div>
            </div>
        </div>

    </div>
</template>

<script setup>
import Typewriter from './Typewriter.vue'

defineProps({
    role: {
        type: String,
        default: 'system'
        // 'system' | 'npc' | 'player'
    },
    text: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    animate: {
        type: Boolean,
        default: true
    },
    speed: {
        type: Number,
        default: 40
    }
})

defineEmits(['done'])
</script>

<style scoped>
.bubble-wrapper {
    width: 100%;
    display: flex;
    margin-bottom: 1.2rem;
}

/* 左侧（NPC/系统） */
.bubble-left {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    max-width: 85%;
}

.bubble-avatar {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(180, 140, 60, 0.4);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #9a7840;
    background: rgba(255, 250, 238, 0.8);
    flex-shrink: 0;
    letter-spacing: 0.05em;
}

.bubble-body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.bubble-name {
    font-size: 0.65rem;
    color: #9a7840;
    letter-spacing: 0.15em;
    padding-left: 0.2rem;
}

.bubble-text {
    background: rgba(255, 250, 238, 0.85);
    border: 1px solid rgba(180, 140, 60, 0.2);
    border-radius: 0 8px 8px 8px;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    color: #3a2808;
    line-height: 1.9;
    letter-spacing: 0.04em;
}

/* 右侧（玩家） */
.bubble-wrapper.player {
    justify-content: flex-end;
}

.bubble-right {
    max-width: 75%;
    margin-left: auto;
}

.bubble-body.player {
    align-items: flex-end;
}

.player-text {
    background: linear-gradient(
        135deg,
        rgba(120, 80, 20, 0.15),
        rgba(100, 60, 10, 0.1)
    );
    border: 1px solid rgba(180, 140, 60, 0.35);
    border-radius: 8px 0 8px 8px;
    color: #2c1f0e;
}

/* 系统消息居中 */
.bubble-wrapper.system {
    justify-content: center;
}

.bubble-wrapper.system .bubble-text {
    background: transparent;
    border: none;
    border-top: 1px dashed rgba(180, 140, 60, 0.25);
    border-bottom: 1px dashed rgba(180, 140, 60, 0.25);
    border-radius: 0;
    font-size: 0.78rem;
    color: #9a7840;
    text-align: center;
    letter-spacing: 0.15em;
    padding: 0.5rem 1.5rem;
}
</style>
