import { defineStore } from 'pinia'
import db from '../db/gameDB'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        platform: 'wenxin',
        apiKey: '',
        bgmVolume: 0.8,
        sfxVolume: 1.0
    }),

    actions: {
        // 从IndexedDB加载设置
        async loadSettings() {
            const platform = await db.settings.get('ai_platform')
            const apiKey = await db.settings.get('api_key')
            const bgmVolume = await db.settings.get('bgm_volume')

            if (platform) this.platform = platform.value
            if (apiKey) this.apiKey = apiKey.value
            if (bgmVolume) this.bgmVolume = bgmVolume.value
        },

        // 保存设置到IndexedDB
        async savePlatform(platform) {
            this.platform = platform
            await db.settings.put({ key: 'ai_platform', value: platform })
        },

        async saveApiKey(key) {
            this.apiKey = key
            await db.settings.put({ key: 'api_key', value: key })
        },

        async saveBgmVolume(volume) {
            this.bgmVolume = volume
            await db.settings.put({ key: 'bgm_volume', value: volume })
        }
    }
})
