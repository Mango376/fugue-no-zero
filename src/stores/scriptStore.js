import { defineStore } from 'pinia'
import saveService from '../services/saveService'

export const useScriptStore = defineStore('script', {
    state: () => ({
        // 当前剧本ID
        currentScriptId: null,
        // 对话记录
        dialogHistory: [],
        // 当前剧本状态
        gameState: {},
        // 是否正在等待AI回复
        isLoading: false,
        // 是否已结局
        isEnded: false
    }),

    actions: {
        // 初始化剧本
        async initScript(scriptId) {
            this.currentScriptId = scriptId
            this.dialogHistory = []
            this.isEnded = false

            // 尝试读取存档
            const saved = await saveService.load(scriptId)
            if (saved) {
                this.gameState = saved.gameState
                this.dialogHistory = saved.dialogHistory || []
            } else {
                this.gameState = {}
            }
        },

        // 添加对话
        addDialog(content, role = 'system') {
            this.dialogHistory.push({
                role,   // system/player/npc
                content,
                time: new Date().toISOString()
            })
        },

        // 保存当前进度
        async saveProgress() {
            await saveService.save(this.currentScriptId, {
                gameState: this.gameState,
                dialogHistory: this.dialogHistory
            })
        },

        // 设置加载状态
        setLoading(val) {
            this.isLoading = val
        },

        // 结束剧本
        endScript() {
            this.isEnded = true
            this.saveProgress()
        }
    }
})
