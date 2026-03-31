import { defineStore } from 'pinia'
import { ref } from 'vue'
import db from '../db/gameDB'

export const useGameStore = defineStore('game', () => {

    const unlockedSims = ref({})
    
    // 【新增】：全局 API 按钮的显示状态（默认不显示，等黑屏结束才亮起）
    const showGlobalApiBtn = ref(false)

    // 【新增】：修改状态的方法
    function setGlobalApiBtn(status) {
        showGlobalApiBtn.value = status
    }

    async function loadUnlocked() {
        const item = await db.settings.get('unlocked')
        if (item) unlockedSims.value = item.value
    }

    async function unlockSim(id) {
        unlockedSims.value[id] = true
        await db.settings.put({
            key: 'unlocked',
            value: unlockedSims.value
        })
    }

    function isUnlocked(id) {
        return !!unlockedSims.value[id]
    }

    async function devUnlockAll(phases) {
        phases.forEach(phase => {
            phase.sims.forEach(sim => {
                unlockedSims.value[sim.id] = true
            })
        })
        await db.settings.put({
            key: 'unlocked',
            value: unlockedSims.value
        })
    }



const isTransitioning = ref(false)
const showHeadphoneNotice = ref(false)
function startTransition(withNotice = true) {  // ← 加参数，默认显示
  showHeadphoneNotice.value = withNotice
  isTransitioning.value = true
}

function endTransition() {
  isTransitioning.value = false
}
    return {
        unlockedSims,
        showGlobalApiBtn, // 【新增】：导出状态
        setGlobalApiBtn,  // 【新增】：导出方法
        loadUnlocked,
        unlockSim,
        isUnlocked,
        devUnlockAll,
        isTransitioning,
        showHeadphoneNotice,
  startTransition,
  endTransition
    }
})
