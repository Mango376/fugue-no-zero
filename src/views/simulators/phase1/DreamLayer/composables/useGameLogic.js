import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import saveService from '@/services/saveService'
import aiService from '@/services/aiService'
import { SYSTEM_PROMPT } from '../prompts/systemPrompt'
import { buildWorldBookInjection } from '../prompts/worldBook'
import {
  buildScriptInitPrompt,
  buildOpeningPrompt,
  buildRoundPrompt,
  buildEscapePrompt,
  buildRealEchoPrompt,
  buildBreathPrompt,
  buildPatientFuturePrompt,
  parseScriptContext
} from '../prompts/promptBuilder'

// ========== 静态配置数据 ==========

export const LEVEL_EXP = [0, 0, 60, 150, 270, 420, 600, 810, 1050, 1320, 1620]

export const ACHIEVEMENT_CONFIG = {
  first_cry:      { name: '初啼',     drops: 100,  title: null,      desc: '完成第一个剧本，结局为完满终止或协奏' },
  perfect_tone:   { name: '完满之音', drops: 0,    title: '治愈者',  desc: '达成3次完满终止结局' },
  abyss_glance:   { name: '深渊回眸', drops: 500,  title: null,      desc: '在神经载荷≤10的情况下完成剧本，累计5次' },
  not_abandon:    { name: '不弃',     drops: 0,    title: '守望者',  desc: '走了弯路，但没有放弃' },
  breakthrough:   { name: '势如破竹', drops: 0,    title: '破局者',  desc: '同一局内使用3个不同道具，且成功通关' },
  silent_listen:  { name: '静默聆听', drops: 500,  title: null,      desc: '有时候什么都不做，才是最难的事' },
  echo_location:  { name: '回声定位', drops: 0,    title: '洞察者',  desc: '无道具辅助触达核心，达成完满终止' },
  survivor:       { name: '生还者',   drops: 200,  title: null,      desc: '在神经载荷归零后，成功完成逃脱判定' },
  brave_game:     { name: '勇者游戏', drops: 0,    title: '孤勇者',  desc: '在不携带道具的情况下完成五星剧本' },
  silent_one:     { name: '静默者',   drops: 0,    title: null,      desc: '连续3个剧本不使用一次性道具通关(≥3星)' },
  mirror_person:  { name: '镜中人',   drops: 3000, title: null,      desc: '完成20个五星剧本，全部达成完满终止' },
  silent_witness: { name: '无声见证', drops: 0,    title: null,      desc: '见证患者在诊断后出现实质性好转' },
}

export const shopItems = [
  { id: 'bandage',      name: '绷带卷',       type: 'consumable', price: 10,   desc: '简单处理意识创伤，神经载荷+8。廉价且实用，适合作为保底手段。',                       minLevel: 1 },
  { id: 'incense',      name: '静谧香薰',     type: 'consumable', price: 30,   desc: '点燃后在周围制造宁静区域，免疫本轮全部神经载荷损伤。',                                 minLevel: 1 },
  { id: 'sponge',       name: '共情海绵',     type: 'consumable', price: 35,   desc: '吸收周围的情感污染，神经载荷+15。使用后该轮进入消化状态，无法再使用其他道具。',         minLevel: 1 },
  { id: 'prism',        name: '记忆棱镜',     type: 'consumable', price: 45,   desc: '折射患者的记忆碎片，显示当前场景隐藏的创伤信息，共振深度+3%。',                       minLevel: 1 },
  { id: 'watch',        name: '锚定怀表',     type: 'consumable', price: 70,   desc: '强行锚定当前时间节点。若本轮选择导致灾难性后果，可回溯至上一轮重新选择。每局限一次。', minLevel: 4 },
  { id: 'tranquilizer', name: '镇定剂',       type: 'consumable', price: 80,   desc: '立即恢复40点神经载荷。可在载荷归零后的濒死状态下使用，每局限一次。',                   minLevel: 4 },
  { id: 'mask',         name: '镜像面具',     type: 'consumable', price: 90,   desc: '戴上后可替患者承受一次致命冲击。自身载荷归零，必须立即进入逃脱判定。',                 minLevel: 4 },
  { id: 'pendulum',     name: '破碎钟摆',     type: 'consumable', price: 125,  desc: '让局部时间流速减缓，危机延后三轮爆发，为玩家争取应对时间。',                         minLevel: 4 },
  { id: 'pass13',       name: '第13层通行证', type: 'consumable', price: 150,  desc: '可直接跳过当前剧本中最困难的一轮危机。每局限一次。',                                 minLevel: 7 },
  { id: 'lullaby',      name: '重生摇篮曲',   type: 'consumable', price: 200,  desc: '载荷归零时自动触发，恢复30点载荷并继续当前剧本，每局限一次。',                       minLevel: 7 },
  { id: 'sutureThread', name: '意识缝合线',   type: 'consumable', price: 400,  desc: '高级修复工具，共振深度直接+30%。使用后神经载荷清零，必须立即进入逃脱判定。',         minLevel: 7 },
  { id: 'candle',       name: '沉默烛台',     type: 'permanent',  price: 1200, desc: '【持续型】每轮自动抵抗2点神经载荷损伤。',                                             minLevel: 1 },
  { id: 'bell',         name: '共鸣铃铛',     type: 'permanent',  price: 1700, desc: '【持续型】共振深度变化效率+20%（按百分比系数计算）。',                                 minLevel: 1 },
  { id: 'overcoat',     name: '守望者大衣',   type: 'permanent',  price: 2300, desc: '【持续型】神经载荷上限+20，逃脱判定+15。',                                             minLevel: 1 },
  { id: 'knapsack',     name: '旅者行囊',     type: 'permanent',  price: 3500, desc: '【持续型】道具栏+2，不占用原有栏位。',                                                 minLevel: 1 },
  { id: 'echoOld',      name: '旧日回响',     type: 'permanent',  price: 4200, desc: '【持续型】每局开始时随机获得一件免费一次性道具（与静默者称号不叠加）。',               minLevel: 1 },
  { id: 'crystal',      name: '回声结晶',     type: 'permanent',  price: 6000, desc: '【持续型】神经载荷上限+10，每轮自动抵抗3点载荷损伤，共振效率+50%。',                   minLevel: 1 },
]

export const diffLevels = [
  { star: 1, name: '平稳', desc: '6-8轮，意识结构简单，适合初次接入的调律者。' },
  { star: 2, name: '轻度', desc: '8-10轮，含1次意识反转，需要一定的共情能力和经验。' },
  { star: 3, name: '中度', desc: '10-12轮，1-2次反转，意识创伤较深，谨慎处理。' },
  { star: 4, name: '重度', desc: '12-14轮，多次反转，高风险，神经载荷消耗剧烈，需要配备一些道具。' },
  { star: 5, name: '危急', desc: '12-15轮，极度不稳定，建议有丰富经验和充足的道具后再接入。' },
]

// ========== 常量 ==========
const PLAYER_SAVE_KEY = 'dream_layer_player_v1'
const SCRIPT_ID = 'dream-layer'

// ========== composable ==========
export function useGameLogic(fileInputRef, narrativeEl) {
  const store = useGameStore()

  // ---------- UI 状态 ----------
  const phase = ref('title')
  const gameStage = ref('dream')
  const showGuide = ref(false)
  const showDiffGuide = ref(false)
  const bottomTab = ref('choices')
  const historyCollapsed = ref(true)
  const titleReady = ref(false)
  const hasSave = ref(false)
  const storyReady = ref(false)
  const aiConfigured = ref(false)
  const showPauseModal = ref(false)
  const showConfirmNewGameModal = ref(false)
  const showItemSelectModal = ref(false)
  const showBreath = ref(false)
  const activePermanentDesc = ref(null)
  const showHandbook = ref(false)
  const selectedPatient = ref(null)
  const patientCurrentStatus = ref('')
  const isGeneratingStatus = ref(false)
  const showPatientStatusModal = ref(false)

  // ---------- 剧本列表 ----------
  const isGeneratingScripts = ref(false)
  const scriptPreviews = ref([])
  const scriptGenError = ref('')
  const selectedScript = ref(null)
  const pendingScript = ref(null)
  const scriptContext = ref('')
  const scriptTracking = ref('')

  // ---------- 重试系统 ----------
  const canRetry = ref(false)
  const retryFn = ref(null)
  const retryLabel = ref('重新生成')

  // ---------- 后台生成 ----------
  const isBackgroundRunning = ref(false)
  const pendingNarrative = ref('')

  // ---------- 玩家数据 ----------
  const playerName = ref('调律者')
  const playerAvatar = ref('')
  const pureDrops = ref(2000)
  const playerLevel = ref(1)
  const totalExp = ref(0)
  const totalRoundsPlayed = ref(0)
  const totalDropsEarned = ref(0)
  const completedScripts = ref([])
  const achievements = ref({})
  const unlockedTitles = ref([])
  const activeTitles = ref([])
  const lowLoadCompletions = ref(0)
  const silentStreakCount = ref(0)
  const newAchievements = ref([])
  const justLeveledUp = ref(false)
  const ownedConsumables = ref({
    bandage: 0, incense: 0, sponge: 0, prism: 0,
    watch: 0, tranquilizer: 0, mask: 0, pendulum: 0,
    pass13: 0, lullaby: 0, sutureThread: 0
  })
  const ownedPermanents = ref([])
  const hasActiveGame = ref(false)

  // ---------- 游戏数值 ----------
  const neuralLoad = ref(100)
  const maxLoad = ref(100)
  const baseMaxLoad = ref(100)
  const resonance = ref(0)
  const currentRound = ref(0)
  const isDying = ref(false)
  const dyingRoundsLeft = ref(0)

  // ---------- 叙事内容 ----------
  const conversationHistory = ref([])
  const displayHistory = ref([])
  const streamingText = ref('')
  const innerText = ref('')
  const currentNarrative = ref('')
  const choices = ref([])
  const isLoading = ref(false)

  // ---------- 逃脱 ----------
  const escapeAttempts = ref(0)
  const escapeResultText = ref('')
  const escapeCanRetry = ref(false)
  const escapeDone = ref(false)
  const escapeSuccess = ref(false)

  // ---------- 现实回响 ----------
  const echoPhase = ref('act1')
  const echoChoices = ref([])
  const echoResonanceDelta = ref(0)

  // ---------- 结算 ----------
  const finalResult = ref('')
  const finalResultName = ref('')
  const resultLabel = ref('')
  const dropsGained = ref(0)
  const expGained = ref(0)
  const breathText = ref('')
  const patientFuture = ref('')
  const showLevelUpModal = ref(false)
  const levelUpRewards = ref([])
  const levelUpChoiceNeeded = ref(false)
  const levelUpChoices = ref([])
  const levelUpChoiceQueue = ref([])
  const pendingLevelUpChoice = ref(null)
  const showBreathDismissBtn = ref(false)

  // ---------- 弹窗提示 ----------
  const silentOneReward = ref(null)
  const showSilentOneModal = ref(false)
  const lostItemsOnDeath = ref([])
  const showLostItemsModal = ref(false)
  const showSettlementModal = ref(false)

  // ---------- 道具 ----------
  const equippedItems = ref([])
  const activeItem = ref(null)
  const selectedLoadout = ref([])
  const watchUsed = ref(false)
  const lastRoundSnapshot = ref(null)
  const pendulumRoundsLeft = ref(0)
  const watchActivatedThisRound = ref(false)

  // ---------- 成就追踪 ----------
  const consecutiveResonanceDrop = ref(0)
  const hasReachedDropThreshold = ref(false)
  const consecutiveAccompanyCount = ref(0)
  const hasReachedAccompanyThreshold = ref(false)
  const watcherProcUsed = ref(false)
  const insightUsesLeft = ref(0)
  const insightHint = ref('')
  const usedItemIds = ref(new Set())

  // ---------- 内部变量 ----------
  let abortController = null
  let scriptGenController = null
  let activeSaveData = null

  // ========== 重试系统函数 ==========

  async function returnToTitle() {
    if (isBackgroundRunning.value) {
      if (abortController) abortController.abort()
      isBackgroundRunning.value = false
      pendingNarrative.value = ''
    }
    await saveProgress()
    phase.value = 'title'
  }

  function setRetry(label, fn) {
    retryLabel.value = label
    retryFn.value = fn
    canRetry.value = true
  }

  function clearRetry() {
    canRetry.value = false
    retryFn.value = null
    retryLabel.value = '重新生成'
  }

  async function executeRetry() {
    if (!canRetry.value || !retryFn.value) return
    const fn = retryFn.value
    clearRetry()
    await fn()
  }

  // ========== computed ==========

  const mustEvacuate = computed(() => resonance.value >= 100)

  const estimatedRounds = computed(() => {
    if (!selectedScript.value) return 8
    return [0, 7, 9, 11, 13, 14][selectedScript.value.difficulty] ?? 10
  })

  const maxItemSlots = computed(() => {
    let slots = 3
    if (playerLevel.value >= 2) slots += 1          // ← 等级2奖励
    if (ownedPermanents.value.includes('knapsack')) slots += 2
    return slots
})

  const echoActLabel = computed(() => ({
    act1: '第一幕 · 患者',
    act2: '第二幕 · 陪同者',
    final: '第三幕 · 离别'
  }[echoPhase.value] ?? ''))

  const scriptStats = computed(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    completedScripts.value.forEach(s => {
      if (s.result === 'perfect' || s.result === 'harmony') {
        stats[s.diff] = (stats[s.diff] || 0) + 1
      }
    })
    return stats
  })

  // ========== 工具函数 ==========

  function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function scrollToBottom(elRef) {
    await nextTick()
    if (elRef?.value) elRef.value.scrollTop = elRef.value.scrollHeight
  }

  function splitParagraphs(text) {
    if (!text) return []
    return text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0)
  }

  function extractSection(text, name) {
    return text.match(new RegExp(`---${name}---([\\s\\S]*?)(?=---|$)`, 'i'))?.[1]?.trim() ?? ''
  }

  function parseAIResponse(rawText) {
    const narrative = extractSection(rawText, 'NARRATIVE')
    const optionsRaw = extractSection(rawText, 'OPTIONS')
    const inner = extractSection(rawText, 'INNER')
    const tagsRaw = extractSection(rawText, 'TAGS') || rawText
    const options = []
    for (const line of optionsRaw.split('\n')) {
      if (!/^[A-C]\./i.test(line.trim())) continue
      const typeMatch = line.match(/\[OPT_TYPE:\s*(accompany|action|inquiry)\]/i)
      const text = line
        .replace(/^[A-C]\.\s*/i, '')
        .replace(/\[OPT_TYPE:\s*[^\]]+\]/gi, '')
        .trim()
      if (text) options.push({ text, value: text, type: typeMatch?.[1] ?? 'action' })
    }
    return {
      narrative: narrative || rawText.split('---')[0].trim(),
      options,
      inner,
      impact: tagsRaw.match(/\[IMPACT:(none|light|medium|heavy|critical)\]/i)?.[1] ?? 'light',
      resonanceTag: tagsRaw.match(/\[RESONANCE:(surge|rise|neutral|fall|drop)\]/i)?.[1] ?? 'neutral',
    }
  }

  // ========== 存档压缩工具 ==========

  function compressRoundForStorage(h) {
    return {
      roundNum:       h.roundNum,
      playerAction:   h.playerAction,
      narrative:      h.narrative?.slice(0, 280) ?? '',
      impactTag:      h.impactTag,
      resonanceTag:   h.resonanceTag,
      loadAfter:      h.loadAfter,
      resonanceAfter: h.resonanceAfter,
    }
  }

  function compressDisplayHistory(history, maxEntries = 50) {
    return history.slice(-maxEntries).map(entry => {
      if (entry.type === 'narrative') {
        return { ...entry, content: entry.content?.slice(0, 400) ?? '' }
      }
      return entry
    })
  }

  // ========== AI 调用 ==========

  async function callAISilent(userPrompt) {
    abortController = new AbortController()
    let result = ''
    await aiService.sendStream({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt: SYSTEM_PROMPT,
      onChunk: (text) => { result = text },
      signal: abortController.signal
    })
    return result
  }

  async function callAISimple(userPrompt) {
    abortController = new AbortController()
    let result = ''
    await aiService.sendStream({
      messages: [{ role: 'user', content: userPrompt }],
      systemPrompt: SYSTEM_PROMPT,
      onChunk: (text) => { result = text; streamingText.value = text },
      signal: abortController.signal
    })
    streamingText.value = ''
    return result
  }

  async function typewriterDisplay(text) {
    streamingText.value = ''
    const speed = 70
    const controller = abortController
    for (let i = 0; i < text.length; i++) {
      if (controller?.signal.aborted) break
      streamingText.value = text.slice(0, i + 1) + '▌'
      if (i % 3 === 0) await scrollToBottom(narrativeEl)
      await new Promise(r => setTimeout(r, speed))
    }
    streamingText.value = text
  }

  // ========== 存读档 ==========

  function savePlayerData() {
    try {
      const scriptsToSave = completedScripts.value.map(s => {
        const compressedHistory = (s.conversationHistory ?? []).map(compressRoundForStorage)
        return { ...s, conversationHistory: compressedHistory }
      })

      const data = {
        version:              2,
        playerName:           playerName.value,
        playerAvatar:         playerAvatar.value,
        pureDrops:            pureDrops.value,
        playerLevel:          playerLevel.value,
        totalExp:             totalExp.value,
        totalRoundsPlayed:    totalRoundsPlayed.value,
        totalDropsEarned:     totalDropsEarned.value,
        ownedConsumables:     ownedConsumables.value,
        ownedPermanents:      ownedPermanents.value,
        completedScripts:     scriptsToSave,
        achievements:         achievements.value,
        unlockedTitles:       unlockedTitles.value,
        activeTitles:         activeTitles.value,
        lowLoadCompletions:   lowLoadCompletions.value,
        silentStreakCount:    silentStreakCount.value,
        pendingLevelUpChoice: pendingLevelUpChoice.value,
        maxLoad:              baseMaxLoad.value,
      }

      const json = JSON.stringify(data)
      console.log('[存档] 数据大小：', (json.length / 1024).toFixed(1), 'KB')
      localStorage.setItem(PLAYER_SAVE_KEY, json)
    } catch (err) {
      console.error('永久存档写入失败：', err)
    }
  }

  function loadPlayerData() {
    try {
      const raw = localStorage.getItem(PLAYER_SAVE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.playerName !== undefined)           playerName.value = data.playerName
      if (data.playerAvatar !== undefined)         playerAvatar.value = data.playerAvatar
      if (data.pureDrops !== undefined)            pureDrops.value = data.pureDrops
      if (data.playerLevel !== undefined)          playerLevel.value = data.playerLevel
      if (data.totalExp !== undefined)             totalExp.value = data.totalExp
      if (data.totalRoundsPlayed !== undefined)    totalRoundsPlayed.value = data.totalRoundsPlayed
      if (data.totalDropsEarned !== undefined)     totalDropsEarned.value = data.totalDropsEarned
      if (data.ownedConsumables !== undefined)     ownedConsumables.value = { ...ownedConsumables.value, ...data.ownedConsumables }
      if (data.ownedPermanents !== undefined)      ownedPermanents.value = data.ownedPermanents
      if (data.achievements !== undefined)         achievements.value = data.achievements
      if (data.unlockedTitles !== undefined)       unlockedTitles.value = data.unlockedTitles
      if (data.activeTitles !== undefined)         activeTitles.value = data.activeTitles
      if (data.lowLoadCompletions !== undefined)   lowLoadCompletions.value = data.lowLoadCompletions
      if (data.silentStreakCount !== undefined)    silentStreakCount.value = data.silentStreakCount
      if (data.pendingLevelUpChoice !== undefined) pendingLevelUpChoice.value = data.pendingLevelUpChoice
      if (data.maxLoad !== undefined)              baseMaxLoad.value = data.maxLoad > 0 ? data.maxLoad : 100
      if (data.completedScripts !== undefined) {
        completedScripts.value = data.completedScripts.map(s => ({
          ...s,
          conversationHistory: s.conversationHistory ?? [],
          patientName:         s.patientName         ?? '未知患者',
          patientAge:          s.patientAge           ?? '??',
          patientProfession:   s.patientProfession    ?? '未知职业',
          scriptContext:       s.scriptContext         ?? '',
          patientFutureText:   s.patientFutureText     ?? '',
          statusHistory:       s.statusHistory         ?? [],
        }))
      }
    } catch (err) {
      console.warn('永久存档读取失败：', err)
    }
  }

  async function saveProgress() {
    try {
      const SESSION_ROUNDS  = 10
      const SESSION_DISPLAY = 50

      const plain = JSON.parse(JSON.stringify({
        phase:            phase.value,
        gameStage:        gameStage.value,
        selectedScript:   selectedScript.value,
        neuralLoad:       neuralLoad.value,
        maxLoad:          maxLoad.value,
        resonance:        resonance.value,
        currentRound:     currentRound.value,
        isDying:          isDying.value,
        scriptContext:    scriptContext.value,
        conversationHistory: conversationHistory.value.slice(-SESSION_ROUNDS),
        displayHistory:   compressDisplayHistory(displayHistory.value, SESSION_DISPLAY),
        escapeSuccess:    escapeSuccess.value,
        innerText:        innerText.value,
        choices:          choices.value,
        echoChoices:      echoChoices.value,
        echoPhase:        echoPhase.value,
        currentNarrative: currentNarrative.value,
        equippedItems:    equippedItems.value,
        usedItemIds:      [...usedItemIds.value],
        hasActiveGame:    !!(selectedScript.value && conversationHistory.value.length > 0),
      }))

      await saveService.save(SCRIPT_ID, plain)
      hasSave.value = true
    } catch (err) {
      console.warn('自动存档失败：', err)
    }
  }

  async function restoreFromSave(saved) {
    phase.value            = saved.phase            ?? 'hub'
    gameStage.value        = saved.gameStage        ?? 'dream'
    selectedScript.value   = saved.selectedScript   ?? null
    neuralLoad.value       = saved.neuralLoad       ?? 100
    maxLoad.value          = saved.maxLoad          ?? 100
    resonance.value        = saved.resonance        ?? 0
    currentRound.value     = saved.currentRound     ?? 0
    isDying.value          = saved.isDying          ?? false
    scriptContext.value    = saved.scriptContext    ?? ''
    conversationHistory.value = saved.conversationHistory ?? []
    displayHistory.value   = saved.displayHistory   ?? []
    escapeSuccess.value    = saved.escapeSuccess    ?? false
    innerText.value        = saved.innerText        ?? ''
    choices.value          = saved.choices          ?? []
    echoChoices.value      = saved.echoChoices      ?? []
    echoPhase.value        = saved.echoPhase        ?? 'act1'
    currentNarrative.value = saved.currentNarrative ?? ''
    equippedItems.value    = saved.equippedItems    ?? []
    usedItemIds.value      = new Set(saved.usedItemIds ?? [])
    hasActiveGame.value    = !!(saved?.hasActiveGame && saved?.selectedScript)


    if (phase.value === 'settlement') {
      phase.value          = 'hub'
      selectedScript.value = null
      scriptContext.value  = ''
      showBreath.value     = false
      showBreathDismissBtn.value = false
      showSettlementModal.value = false
      hasActiveGame.value  = false
    }

    if (gameStage.value === 'realecho') {
      escapeSuccess.value = true
    }

    isLoading.value           = false
    isBackgroundRunning.value = false
    clearRetry()
    await nextTick()
    await scrollToBottom(narrativeEl)
  }

  async function checkSave() {
    const saved = await saveService.load(SCRIPT_ID)
    hasSave.value       = !!saved
    hasActiveGame.value = !!(saved?.hasActiveGame && saved?.selectedScript)
  }

  // ========== 头像 ==========

  function triggerAvatarUpload() {
    if (fileInputRef?.value) fileInputRef.value.click()
  }

  function handleAvatarUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('系统提示：只能注入图像格式的意识数据。'); return }
    if (file.size > 2 * 1024 * 1024) { alert('系统提示：图像数据过大(>2MB)。请压缩后重试。'); return }
    const reader = new FileReader()
    reader.onload = (e) => { playerAvatar.value = e.target.result }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  // ========== 称号 ==========

  function toggleTitle(titleName) {
    if (activeTitles.value.includes(titleName)) {
      activeTitles.value = activeTitles.value.filter(t => t !== titleName)
    } else {
      const maxTitles = playerLevel.value >= 8 ? 2 : 1
      if (activeTitles.value.length >= maxTitles) activeTitles.value.shift()
      activeTitles.value.push(titleName)
    }
    savePlayerData()
  }

  // ========== 商店 ==========

  function buyItem(item) {
    if (playerLevel.value < item.minLevel) return
    if (item.type === 'permanent' && ownedPermanents.value.includes(item.id)) return
    if (pureDrops.value >= item.price) {
      pureDrops.value -= item.price
      if (item.type === 'consumable') {
        ownedConsumables.value[item.id]++
      } else {
        ownedPermanents.value.push(item.id)
      }
      savePlayerData()
    }
  }

  // ========== 剧本选择 ==========

  function selectScript(script) {
    pendingScript.value    = script
    scriptContext.value    = ''
    scriptTracking.value   = ''
    selectedLoadout.value  = []
    showItemSelectModal.value = true
  }

  function toggleLoadoutItem(itemId) {
    const idx = selectedLoadout.value.indexOf(itemId)
    if (idx > -1) {
      selectedLoadout.value.splice(idx, 1)
    } else {
      if (selectedLoadout.value.length >= maxItemSlots.value) return
      if ((ownedConsumables.value[itemId] || 0) <= 0) return
      selectedLoadout.value.push(itemId)
    }
  }

  async function confirmItemSelect() {
    showItemSelectModal.value = false
    const script = pendingScript.value
    pendingScript.value = null
    phase.value = 'dream'
    await startGame(script)
  }

  async function skipItemSelect() {
    selectedLoadout.value = []
    showItemSelectModal.value = false
    const script = pendingScript.value
    pendingScript.value = null
    phase.value = 'dream'
    await startGame(script)
  }

  function rollFreeItemFromEcho() {
    const rand = Math.random()
    let tier
    if (rand < 0.6)      tier = 'initial'
    else if (rand < 0.9) tier = 'advanced'
    else                 tier = 'ultimate'
    const tierItems = {
      initial:  ['bandage', 'incense', 'sponge', 'prism'],
      advanced: ['watch', 'tranquilizer', 'mask', 'pendulum'],
      ultimate: ['pass13', 'lullaby', 'sutureThread']
    }
    const pool = tierItems[tier]
    const id = pool[Math.floor(Math.random() * pool.length)]
    return shopItems.find(i => i.id === id) || null
  }

  function selectItemForRound(item) {
    if (item.count <= 0) return
    if (item.id === 'lullaby') return
    if (item.id === 'watch' && watchUsed.value) return

    if (activeItem.value?.id === item.id) {
      activeItem.value = null
    } else {
      activeItem.value = item
      setTimeout(() => { bottomTab.value = 'choices' }, 300)
    }
  }

  // ========== 洞察者 ==========

  function useInsight() {
    if (insightUsesLeft.value <= 0) return
    insightUsesLeft.value--
    const diff      = selectedScript.value?.difficulty ?? 1
    const round     = currentRound.value
    const estimated = estimatedRounds.value
    let hint = ''
    if (round >= estimated - 2) {
      hint = '下一轮接近尾声，意识空间趋于收束'
    } else if (diff >= 4 && Math.random() < 0.5) {
      hint = '下一轮预计有较强的意识冲击'
    } else if (Math.random() < 0.4) {
      hint = '下一轮患者状态不稳定，谨慎选择'
    } else {
      hint = '下一轮意识空间相对平稳'
    }
    insightHint.value = hint
    displayHistory.value.push({
      type: 'system',
      content: `🔍 洞察者：${hint}（剩余${insightUsesLeft.value}次）`
    })
  }

  // ========== 患者后续状态 ==========

  async function generatePatientCurrentStatus(patient) {
    if (isGeneratingStatus.value) return
    isGeneratingStatus.value = true
    patientCurrentStatus.value = ''

    const keyChoices = patient.conversationHistory
      .slice(-5).map(h => h.playerAction).join('；')

    const prompt = `【患者背景档案】
${patient.scriptContext?.slice(0, 400) ?? '无档案'}

【本次诊断结局】${patient.result}
【最终共振深度】基于结局判断
【诊断时的关键行动】${keyChoices}
【上次生成的患者状态】${patient.patientFutureText ?? '无记录'}

请根据以上信息，生成这位患者在当前时间点的真实状态（150-250字）。

要求：
· 语气像一份简短的跟踪报告，客观陈述
· 患者不一定有所改变，可能只是醒了但问题仍在，可能更差了，也可能有微小的正向变化
· 不渲染，不总结，结尾留白
· 在正文末尾附加判断标记：
[STATUS: positive|neutral|negative]
positive = 患者有具体的、可观察的正向变化
neutral  = 状态无明显变化
negative = 状态更差或有退步

---CURRENT_STATUS---
（正文）`

    // 使用局部 controller，不覆盖全局 abortController
    const statusController = new AbortController()
    try {
      let result = ''
      await aiService.sendStream({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: SYSTEM_PROMPT,
        onChunk: (text) => { result = text },
        signal: statusController.signal
      })

      const text = extractSection(result, 'CURRENT_STATUS') || result.trim()
      patientCurrentStatus.value = text.replace(/\[STATUS:\s*[^\]]+\]/i, '').trim()

      const record = completedScripts.value.find(s => s.time === selectedPatient.value?.time)
      if (record) {
        if (!record.statusHistory) record.statusHistory = []
        record.statusHistory.push({
          count:   record.statusHistory.length + 1,
          time:    new Date().toLocaleDateString('zh-CN'),
          content: patientCurrentStatus.value
        })
        selectedPatient.value = { ...record }
        savePlayerData()
      }

      const statusMatch = result.match(/\[STATUS:\s*(positive|neutral|negative)\]/i)
      if (statusMatch?.[1] === 'positive' && !achievements.value['silent_witness']) {
        unlockAchievement('silent_witness')
      }
    } catch {
      patientCurrentStatus.value = '无法获取当前状态。'
    }

    isGeneratingStatus.value = false
    showPatientStatusModal.value = true
  }

  // ========== 锚定怀表 ==========

  function useWatch() {
    if (!lastRoundSnapshot.value) return
    const snap = lastRoundSnapshot.value
    neuralLoad.value          = snap.neuralLoad
    resonance.value           = snap.resonance
    currentRound.value        = snap.currentRound
    currentNarrative.value    = snap.currentNarrative
    innerText.value           = snap.innerText
    equippedItems.value       = snap.equippedItems
    conversationHistory.value = snap.conversationHistory
    displayHistory.value      = displayHistory.value.slice(0, snap.displayHistoryLen)
    choices.value             = snap.choices
    lastRoundSnapshot.value   = null
    clearRetry()

    watchActivatedThisRound.value = false
    // watchUsed 保持 true，本局不能再用

    displayHistory.value.push({
      type: 'system',
      content: '⌚ 锚定怀表：时间已回溯，重新做出选择'
    })
    bottomTab.value       = 'choices'
    historyCollapsed.value = true
  }

  // ========== 剧本生成 ==========

  function weightedRandom(pool) {
    const entries = Object.entries(pool)
    if (entries.length === 0) return 1
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
    let random = Math.random() * total
    for (const [difficulty, weight] of entries) {
      random -= weight
      if (random <= 0) return Number(difficulty)
    }
    return Number(entries[entries.length - 1][0])
  }

  function generateThreeDifficulties() {
    const basePool = { 1: 25, 2: 30, 3: 25, 4: 15, 5: 5 }
    const currentLvl = playerLevel.value
    const maxDifficulty =
      currentLvl <= 2 ? 2 :
      currentLvl === 3 ? 3 :
      currentLvl <= 5 ? 4 : 5
    const filteredPool = Object.fromEntries(
      Object.entries(basePool).filter(([d]) => Number(d) <= maxDifficulty)
    )
    const firstMax  = Math.min(3, maxDifficulty)
    const firstPool = Object.fromEntries(
      Object.entries(filteredPool).filter(([d]) => Number(d) <= firstMax)
    )
    const first  = weightedRandom(firstPool)
    const second = weightedRandom(filteredPool)
    let third
    if (first <= 2 && second <= 2 && maxDifficulty >= 3) {
      const thirdPool = Object.fromEntries(
        Object.entries(filteredPool).filter(([d]) => Number(d) >= 3)
      )
      third = weightedRandom(thirdPool)
    } else {
      third = weightedRandom(filteredPool)
    }
    return [first, second, third]
  }

  function parsePreview(raw, difficulty) {
    const text = extractSection(raw, 'PREVIEW') || raw
    return {
      name:         text.match(/姓名[：:]\s*(.+)/)?.[1]?.trim() ?? '',
      age:          text.match(/年龄[：:]\s*(\d+)/)?.[1]?.trim() ?? '',
      profession:   text.match(/职业[：:]\s*(.+)/)?.[1]?.trim() ?? '',
      dormDuration: text.match(/昏迷时长[：:]\s*(.+)/)?.[1]?.trim() ?? '',
      preview:      text.match(/意象预览[：:]\s*(.+)/)?.[1]?.trim() ?? '',
      difficulty
    }
  }

  async function generateScripts() {
    isGeneratingScripts.value = true
    scriptGenError.value      = ''
    scriptPreviews.value      = []
    clearRetry()

    const hasConfig = await checkAIConfig()
    if (!hasConfig) {
      scriptGenError.value      = 'AI 尚未配置，请先在全局设置中完成接入配置。'
      isGeneratingScripts.value = false
      return
    }

    const difficulties    = generateThreeDifficulties()
    scriptGenController   = new AbortController()

    for (const d of difficulties) {
      if (scriptGenController.signal.aborted) break
      try {
        const previewPrompt = `请为《第13层梦境》生成一个剧本预览信息。难度：${d}星。
严格按以下格式输出：
---PREVIEW---
姓名：（中文姓名2-3字）
年龄：（数字）
职业：（具体职业不超过8字）
昏迷时长：（如"第12天"）
意象预览：（一句话15-30字，诗意描述梦境某个感官细节，不涉及心理词汇）

注意：患者职业应多样化，避免连续生成医疗工作者，可以是程序员、设计师、教师、学生、店长、厨师、外卖员、司机、工人、会计、销售等各行各业。`

        let result = ''
        await aiService.sendStream({
          messages: [{ role: 'user', content: previewPrompt }],
          systemPrompt: SYSTEM_PROMPT,
          onChunk: (text) => { result = text },
          signal: scriptGenController.signal
        })

        const basicInfo = parsePreview(result, d)
        if (!basicInfo.name || !basicInfo.age || !basicInfo.profession) {
          throw new Error('生成数据不完整')
        }
        scriptPreviews.value.push({ ...basicInfo })

      } catch (err) {
        if (scriptGenController.signal.aborted) break
        console.warn('单张生成失败，跳过此槽位：', err.message)
      }
    }

    if (scriptPreviews.value.length === 0) {
      scriptGenError.value = '全部档案生成失败，请检查 AI 连接后重试。'
      setRetry('重新扫描档案', generateScripts)
    }

    isGeneratingScripts.value = false
  }

  async function refreshScripts() {
    if (scriptGenController) {
      scriptGenController.abort()
      scriptGenController = null
    }
    await generateScripts()
  }

  // ========== 导航 ==========

  async function checkAIConfig() {
    if (aiService.isReady()) return true
    try {
      const config = await aiService.getConfig()
      return !!(config.endpoint && config.apiKey && config.model)
    } catch { return false }
  }

  async function goToScriptSelect() {
    phase.value = 'hub'
    await aiService._ensureInit()
    aiConfigured.value = await checkAIConfig()
  }

  async function enterScriptSelect() {
    phase.value          = 'script_select'
    clearRetry()
    scriptGenError.value = ''
    scriptPreviews.value = []
    if (isGeneratingScripts.value) return
    await generateScripts()
  }

  async function goStory(n) {
    storyReady.value = false
    await delay(150)
    phase.value = `story_${n}`
    await delay(100)
    storyReady.value = true
  }

  function startNewGame() {
    if (hasSave.value) { showConfirmNewGameModal.value = true; return }
    executeStartNewGame()
  }

  async function confirmStartNewGame() {
    showConfirmNewGameModal.value = false
    await saveService.deleteSave(SCRIPT_ID)
    hasSave.value = false
    await executeStartNewGame()
  }

  async function executeStartNewGame() {
    pureDrops.value       = 2000
    playerLevel.value     = 1
    totalExp.value        = 0
    completedScripts.value = []
    achievements.value    = {}
    unlockedTitles.value  = []
    activeTitles.value    = []
    lowLoadCompletions.value  = 0
    silentStreakCount.value    = 0
    newAchievements.value     = []
    justLeveledUp.value       = false
    totalRoundsPlayed.value   = 0
    totalDropsEarned.value    = 0
    ownedConsumables.value    = {
      bandage: 0, incense: 0, sponge: 0, prism: 0,
      watch: 0, tranquilizer: 0, mask: 0, pendulum: 0,
      pass13: 0, lullaby: 0, sutureThread: 0
    }
    ownedPermanents.value     = []
    activeSaveData            = null
    selectedScript.value      = null
    currentRound.value        = 0
    displayHistory.value      = []
    conversationHistory.value = []
    currentNarrative.value    = ''
    streamingText.value       = ''
    innerText.value           = ''
    neuralLoad.value          = 100
    maxLoad.value             = 100
    baseMaxLoad.value         = 100
    resonance.value           = 0
    scriptPreviews.value      = []
    scriptGenError.value      = ''
    pendingLevelUpChoice.value = null
    isBackgroundRunning.value  = false
    pendingNarrative.value     = ''
    showBreath.value           = false   
    showSettlementModal.value  = false 
    clearRetry()
    localStorage.removeItem(PLAYER_SAVE_KEY)
    await goStory(1)
  }

  async function continueGame() {
    if (!hasSave.value) return
    try {
      activeSaveData = await saveService.load(SCRIPT_ID)
      if (!activeSaveData) { hasSave.value = false; return }
      await restoreFromSave(activeSaveData)
      activeSaveData = null
      await aiService._ensureInit()

      if (phase.value === 'hub') return

      if (phase.value === 'dream' || phase.value === 'escape') {
        if (gameStage.value === 'realecho') return
        if (
          choices.value.length === 0 &&
          !isLoading.value &&
          conversationHistory.value.length > 0 &&
          !mustEvacuate.value &&
          !isDying.value
        ) {
          await _generateChoices()
        }
      }
    } catch (err) {
      console.error('读档失败：', err)
      hasSave.value = false
    }
  }

  async function handleHubPrimaryAction() {
    if (hasActiveGame.value) {
      if (!activeSaveData) activeSaveData = await saveService.load(SCRIPT_ID)
      if (activeSaveData) {
        await restoreFromSave(activeSaveData)
        activeSaveData = null

        if (
          phase.value === 'hub' &&
          selectedScript.value &&
          conversationHistory.value.length > 0
        ) {
          phase.value = 'dream'
        }

        if (pendingNarrative.value && phase.value === 'dream') {
          currentNarrative.value = pendingNarrative.value
          pendingNarrative.value = ''
          if (!mustEvacuate.value && !isDying.value) {
            await _generateChoices()
          }
          return
        }

        if (gameStage.value === 'realecho') return

        if (
          choices.value.length === 0 &&
          !isLoading.value &&
          conversationHistory.value.length > 0 &&
          !mustEvacuate.value &&
          !isDying.value
        ) {
          await _generateChoices()
        }
      } else {
        hasActiveGame.value = false
        hasSave.value       = false
        await enterScriptSelect()
      }
    } else {
      await enterScriptSelect()
    }
  }

  async function pauseAndReturn() {
    showPauseModal.value = false

    if (isLoading.value) {
      isBackgroundRunning.value = true
      isLoading.value = false
    } else {
      if (abortController) abortController.abort()
    }

    await saveProgress()
    hasSave.value = true
    phase.value   = 'hub'
  }

  function confirmPause() { showPauseModal.value = true }

  // ========== 结算后返回 Hub ==========

  async function returnToHubFromSettlement() {
    phase.value            = 'hub'
    showBreath.value       = false
    showBreathDismissBtn.value = false
    showSettlementModal.value  = false
    selectedScript.value   = null
    scriptContext.value    = ''
    scriptTracking.value   = ''
    conversationHistory.value = []
    displayHistory.value   = []
    choices.value          = []
    currentNarrative.value = ''
    innerText.value        = ''
    streamingText.value    = ''
    isDying.value          = false
    resonance.value        = 0
    currentRound.value     = 0
    clearRetry()

    await saveProgress()
    hasActiveGame.value = false
  }

  // ========== 游戏核心 ==========

  async function startGame(script) {
    isLoading.value           = true
    gameStage.value           = 'dream'
    activeItem.value          = null
    selectedScript.value      = script
    clearRetry()
    usedItemIds.value         = new Set()
    isBackgroundRunning.value = false
    pendingNarrative.value    = ''

    currentRound.value        = 0
    displayHistory.value      = []
    conversationHistory.value = []
    currentNarrative.value    = ''
    innerText.value           = ''
    choices.value             = []
    echoChoices.value         = []
    echoResonanceDelta.value  = 0
    resonance.value           = 0
    isDying.value             = false
    escapeAttempts.value      = 0
    escapeSuccess.value       = false
    escapeDone.value          = false
    escapeCanRetry.value      = false
    dyingRoundsLeft.value     = 0
    historyCollapsed.value    = true
    bottomTab.value           = 'choices'
    hasReachedDropThreshold.value     = false
    hasReachedAccompanyThreshold.value = false
    consecutiveResonanceDrop.value    = 0
    consecutiveAccompanyCount.value   = 0
    watcherProcUsed.value     = false
    watchUsed.value           = false
    lastRoundSnapshot.value   = null
    watchActivatedThisRound.value = false  // ← 修复：新局重置
    pendulumRoundsLeft.value  = 0
    insightHint.value         = ''

    if (activeTitles.value.includes('洞察者')) {
      const diff = script.difficulty
      insightUsesLeft.value = diff <= 2 ? 1 : diff <= 4 ? 2 : 3
    } else {
      insightUsesLeft.value = 0
    }

    let computedMaxLoad = baseMaxLoad.value > 0 ? baseMaxLoad.value : 100
    if (ownedPermanents.value.includes('overcoat')) computedMaxLoad += 20
    if (ownedPermanents.value.includes('crystal'))  computedMaxLoad += 10
    if (activeTitles.value.includes('孤勇者'))      computedMaxLoad -= 10
    maxLoad.value    = Math.max(10, computedMaxLoad)
    neuralLoad.value = maxLoad.value

    equippedItems.value = []
    for (const itemId of selectedLoadout.value) {
      const itemDef = shopItems.find(i => i.id === itemId)
      const owned   = ownedConsumables.value[itemId] || 0
      if (itemDef && owned > 0) {
        equippedItems.value.push({ ...itemDef, count: owned })
      }
    }

    if (pendingLevelUpChoice.value?.level === 5 && pendingLevelUpChoice.value?.choice === 'item') {
      const freeItem = rollFreeItemFromEcho()
      if (freeItem) {
        const existing = equippedItems.value.find(i => i.id === freeItem.id)
        if (existing) {
          existing.count += 1
        } else {
          equippedItems.value.push({ ...freeItem, count: 1 })
        }
        displayHistory.value.push({ type: 'system', content: `🎁 5级奖励：获赠一件 [${freeItem.name}]` })
      }
    }

    if (ownedPermanents.value.includes('echoOld')) {
      const freeItem = rollFreeItemFromEcho()
      if (freeItem) {
        const existing = equippedItems.value.find(i => i.id === freeItem.id)
        if (existing) {
          existing.count += 1
        } else if (equippedItems.value.length < maxItemSlots.value) {
          equippedItems.value.push({ ...freeItem, count: 1 })
        }
        displayHistory.value.push({ type: 'system', content: `✨ 旧日回响：获赠一件 [${freeItem.name}]` })
      }
    }

    if (achievements.value['silent_one'] && !ownedPermanents.value.includes('echoOld')) {
      const freeItem = rollFreeItemFromEcho()
      if (freeItem) {
        const existing = equippedItems.value.find(i => i.id === freeItem.id)
        if (existing) {
          existing.count += 1
        } else {
          equippedItems.value.push({ ...freeItem, count: 1 })
        }
        silentOneReward.value    = freeItem
        showSilentOneModal.value = true
      }
    }

    selectedLoadout.value = []

    if (pendingLevelUpChoice.value?.level === 6 && pendingLevelUpChoice.value?.choice === 'resonance') {
      resonance.value = 10
    }

    await _generateScriptInit(script)
  }

  async function _generateScriptInit(script) {
    if (!scriptContext.value) {
      displayHistory.value.push({ type: 'system', content: `正在构建 ${script.name} 的意识追踪档案……` })
      try {
        const initRaw = await callAISilent(buildScriptInitPrompt(script))
        scriptContext.value = initRaw.replace('[SCRIPT_READY]', '').trim()
        const trackingMatch = initRaw.match(/---PROFILE---([\s\S]*?)---PROFILE_END---/i)
        scriptTracking.value = trackingMatch ? trackingMatch[1].trim() : ''
      } catch (err) {
        if (abortController?.signal.aborted) { isLoading.value = false; return }
        console.error(err)
        displayHistory.value.push({ type: 'system', content: '⚠ 档案构建失败' })
        setRetry('重新构建档案', () => _generateScriptInit(script))
        isLoading.value = false
        return
      }
    }
    await _generateOpening()
  }

  async function _generateOpening() {
    isLoading.value        = true
    streamingText.value    = ''
    currentNarrative.value = ''
    innerText.value        = ''
    choices.value          = []
    clearRetry()

    displayHistory.value.push({ type: 'system', content: '正在进入意识空间……' })

    try {
      abortController = new AbortController()
      let openingRaw  = ''
      await aiService.sendStream({
        messages: [{ role: 'user', content: buildOpeningPrompt(scriptContext.value) }],
        systemPrompt: SYSTEM_PROMPT,
        onChunk: (text) => { openingRaw = text },
        signal: abortController.signal
      })

      const parsed = parseAIResponse(openingRaw)
      if (!parsed.narrative) throw new Error('开场叙事内容为空')

      isLoading.value = false
      await typewriterDisplay(parsed.narrative)
      streamingText.value    = ''
      currentNarrative.value = parsed.narrative
      if (parsed.inner) innerText.value = parsed.inner

      conversationHistory.value.push({
        roundNum:     0,
        playerAction: '（进入梦境）',
        narrative:    parsed.narrative,
        impactTag:    'none',
        resonanceTag: 'neutral'
      })

      await nextTick()
      await scrollToBottom(narrativeEl)
      saveProgress().catch(err => console.warn('存档失败：', err))
      await _generateChoices()

    } catch (err) {
      if (abortController?.signal.aborted) { isLoading.value = false; return }
      console.error(err)
      isLoading.value = false
      displayHistory.value.push({ type: 'system', content: '⚠ 开场叙事生成失败' })
      setRetry('重新生成开场', _generateOpening)
    }
  }

  async function _generateChoices(contextHistory = null) {
    isLoading.value = true
    choices.value   = []
    clearRetry()
    await nextTick()

    // 修复：使用全局 abortController，使其可被暂停中断
    abortController = new AbortController()
    const historyForPrompt = contextHistory ?? conversationHistory.value

    try {
      const wbInjection = buildWorldBookInjection({
        round:     currentRound.value,
        gameStage: gameStage.value,
        hasItem:   false
      })

      const optionPrompt = `【剧本背景】${scriptContext.value}
${wbInjection}

【当前状态】
轮次：${currentRound.value} / 预计${estimatedRounds.value}轮
神经载荷：${neuralLoad.value} | 共振深度：${resonance.value}%
濒死状态：${isDying.value ? '是' : '否'}

【最近对话历史】
${historyForPrompt.slice(-4).map(h =>
  `[玩家]${h.playerAction}\n[叙事]${h.narrative?.slice(0, 120)}…`
).join('\n\n')}

请根据以上信息，生成三个下一步行动选项。
选项必须符合当前场景，有真实代价，无明显最优解。
禁止提示道具使用。

---OPTIONS---
A. （选项）[OPT_TYPE: accompany|action|inquiry]
B. （选项）[OPT_TYPE: accompany|action|inquiry]
C. （选项）[OPT_TYPE: accompany|action|inquiry]`

      let optRaw = ''
      await aiService.sendStream({
        messages: [{ role: 'user', content: optionPrompt }],
        systemPrompt: SYSTEM_PROMPT,
        onChunk: (text) => { optRaw = text },
        signal: abortController.signal
      })

      const parsed = parseAIResponse(optRaw)
      if (!parsed.options || parsed.options.length === 0) {
        console.error('【AI 原始回复内容】:', optRaw)
        throw new Error('选项内容为空')
      }

      choices.value   = parsed.options
      isLoading.value = false
      await scrollToBottom(narrativeEl)

    } catch (err) {
      if (abortController?.signal.aborted) { isLoading.value = false; return }
      console.error(err)
      isLoading.value = false
      displayHistory.value.push({ type: 'system', content: '⚠ 选项生成失败' })
      setRetry('重新生成选项', () => _generateChoices(contextHistory))
    }
  }

  async function retryChoicesEmergency() {
    isLoading.value = true
    choices.value   = []
    await nextTick()
    await _generateChoices()
  }

  async function generateNextRound(playerAction, usedItem = null) {
  const wasAlreadyDying = isDying.value
  isLoading.value = true
  currentRound.value++
  totalRoundsPlayed.value++
  streamingText.value    = ''
  innerText.value        = ''
  choices.value          = []
  currentNarrative.value = ''
  clearRetry()

  // ✅ 新增：在 AI 调用前保存数值快照
  const loadSnapshot      = neuralLoad.value
  const resonanceSnapshot = resonance.value
  const isDyingSnapshot   = isDying.value

  const wbInjection = buildWorldBookInjection({
    round: currentRound.value,
    gameStage: gameStage.value,
    hasItem: !!usedItem
  })

  try {
    abortController = new AbortController()
    let rawText = ''
    await aiService.sendStream({
      messages: [{
        role: 'user',
        content: buildRoundPrompt({
          playerAction,
          usedItem,
          wbInjection,
          scriptContext: scriptContext.value,
          scriptTracking: scriptTracking.value,
          currentRound: currentRound.value,
          estimatedRounds: estimatedRounds.value,
          neuralLoad: neuralLoad.value,
          resonance: resonance.value,
          isDying: isDying.value,
          equippedItems: equippedItems.value,
          conversationHistory: conversationHistory.value
        })
      }],
      systemPrompt: SYSTEM_PROMPT,
      onChunk: (text) => { rawText = text },
      signal: abortController.signal
    })

    const parsed = parseAIResponse(rawText)
    if (!parsed.narrative) throw new Error('叙事内容为空')

    applyValueChanges(parsed.impact, parsed.resonanceTag, usedItem)

      conversationHistory.value.push({
        roundNum:     currentRound.value,
        playerAction,
        narrative:    parsed.narrative,
        impactTag:    parsed.impact,
        resonanceTag: parsed.resonanceTag,
        loadAfter:    neuralLoad.value,
        resonanceAfter: resonance.value
      })

      // 后台生成完毕
      if (isBackgroundRunning.value) {
  isBackgroundRunning.value = false
  pendingNarrative.value    = parsed.narrative
  isLoading.value           = false
  await saveProgress()         // ✅ 直接存，phase 保持 'hub' 不动
  return
}


      // 正常流程：打字机显示
      isLoading.value = false
      await typewriterDisplay(parsed.narrative)
      streamingText.value    = ''
      currentNarrative.value = parsed.narrative
      if (parsed.inner) innerText.value = parsed.inner

      // 濒死状态处理
      if (!wasAlreadyDying && isDying.value) {
        dyingRoundsLeft.value = 2
        displayHistory.value.push({
          type: 'system',
          content: '⚠ 神经载荷归零——剩余 2 轮，拒绝撤离将永久离调'
        })
        historyCollapsed.value = false
      } else if (wasAlreadyDying && !isDying.value) {
        dyingRoundsLeft.value = 0
      } else if (wasAlreadyDying && isDying.value) {
        dyingRoundsLeft.value--
        if (dyingRoundsLeft.value <= 0) {
          displayHistory.value.push({
            type: 'system',
            content: '✖ 意识彻底断裂——调律者永久离调'
          })
          choices.value = []
          await scrollToBottom(narrativeEl)
          await delay(800)
          escapeSuccess.value = false
          await goToSettlement()
          return
        } else {
          displayHistory.value.push({
            type: 'system',
            content: `⚠ 最后警告：仅剩 ${dyingRoundsLeft.value} 轮，再不撤离将永久离调`
          })
          historyCollapsed.value = false
        }
      }

      if (resonance.value >= 100) {
        displayHistory.value.push({
          type: 'system',
          content: '▲ 共振深度100%——立即撤离'
        })
      }

      await scrollToBottom(narrativeEl)
      saveProgress().catch(err => console.warn('存档失败：', err))

      if (!mustEvacuate.value && !isDying.value) {
        await _generateChoices()
      } else if (isDying.value && dyingRoundsLeft.value > 0) {
        await _generateChoices()
      }

    } catch (err) {
    if (abortController?.signal.aborted) { isLoading.value = false; return }
    console.error(err)

    // ✅ 新增：回滚道具消耗
    if (usedItem) {
      const eqItem = equippedItems.value.find(i => i.id === usedItem.id)
      if (eqItem) eqItem.count++
      if (ownedConsumables.value[usedItem.id] !== undefined) {
        ownedConsumables.value[usedItem.id]++
      }
      usedItemIds.value.delete(usedItem.id)

      // 怀表特殊处理：applyValueChanges 未执行，watchUsed 没有被设为 true
      // 但以防万一也做一次重置
      if (usedItem.id === 'watch') {
        watchUsed.value = false
      }
    }

    // ✅ 新增：回滚游戏数值
    neuralLoad.value = loadSnapshot
    resonance.value  = resonanceSnapshot
    isDying.value    = isDyingSnapshot

    // 原有的回滚
    currentRound.value      = Math.max(0, currentRound.value - 1)
    totalRoundsPlayed.value = Math.max(0, totalRoundsPlayed.value - 1)

    streamingText.value       = ''
    isLoading.value           = false
    isBackgroundRunning.value = false
    displayHistory.value.push({
      type: 'system',
      content: `⚠ AI 响应失败：${err.message || '连接中断'}`
    })
    setRetry('重新生成本轮', () => {
  // ✅ 重试前重新扣减道具
  if (usedItem) {
    const eqItem = equippedItems.value.find(i => i.id === usedItem.id)
    if (eqItem && eqItem.count > 0) eqItem.count--
    if (ownedConsumables.value[usedItem.id] > 0) {
      ownedConsumables.value[usedItem.id]--
    }
    usedItemIds.value.add(usedItem.id)
  }
  return generateNextRound(playerAction, usedItem)
})

  }
}

  async function onChoiceSelect({ choice }) {
  bottomTab.value = 'choices'
  clearRetry()

  if (!watchUsed.value) {
    lastRoundSnapshot.value = {
      neuralLoad: neuralLoad.value,
      resonance: resonance.value,
      currentRound: currentRound.value,
      displayHistoryLen: displayHistory.value.length,
      conversationHistory: JSON.parse(JSON.stringify(conversationHistory.value)),
      choices: JSON.parse(JSON.stringify(choices.value)),
      currentNarrative: currentNarrative.value,
      innerText: innerText.value,
      equippedItems: JSON.parse(JSON.stringify(equippedItems.value)),
    }
  }

  let finalActionText = choice.text
  let usedItem = null

  if (activeItem.value) {
    usedItem = activeItem.value
    finalActionText = `[配合动作：使用了道具「${usedItem.name}」] ${choice.text}`

    const eqItem = equippedItems.value.find(i => i.id === usedItem.id)
    if (eqItem) eqItem.count--
    ownedConsumables.value[usedItem.id]--
    usedItemIds.value.add(usedItem.id)

    // ✅ 删除这里原来的 watchUsed 设置
    // if (usedItem.id === 'watch') {
    //   watchUsed.value = true
    // }

    activeItem.value = null
  }

  if (currentNarrative.value) displayHistory.value.push({ type: 'narrative', content: currentNarrative.value })
  if (innerText.value)        displayHistory.value.push({ type: 'inner',     content: innerText.value })
  historyCollapsed.value = true
  choices.value          = []
  innerText.value        = ''

  if (choice.type === 'accompany') {
    consecutiveAccompanyCount.value++
    if (consecutiveAccompanyCount.value >= 3) hasReachedAccompanyThreshold.value = true
  } else {
    consecutiveAccompanyCount.value = 0
  }

  displayHistory.value.push({ type: 'choice', content: finalActionText })
  await scrollToBottom(narrativeEl)
  await generateNextRound(finalActionText, usedItem)
}


  // ========== 数值计算 ==========

  function applyValueChanges(impact, resonanceTag, usedItem = null) {
    const rand       = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
    const currentDiff = selectedScript.value?.difficulty ?? 1
    const diffIdx    = Math.max(0, Math.min(4, currentDiff - 1))

    const damageMatrix = {
      none:     [ [0,0],   [0,0],   [0,0],   [0,0],   [0,0]   ],
      light:    [ [2,4],   [2,4],   [2,4],   [3,5],   [4,6]   ],
      medium:   [ [4,6],   [4,8],   [6,9],   [8,12],  [10,15] ],
      heavy:    [ [7,9],   [8,12],  [11,16], [14,20], [18,25] ],
      critical: [ [10,14], [13,18], [17,23], [22,28], [28,35] ]
    }

    const safeImpact = damageMatrix[impact] ? impact : 'medium'
    const range      = damageMatrix[safeImpact][diffIdx]
    let loadDelta    = -rand(range[0], range[1])

    if (pendulumRoundsLeft.value > 0 && loadDelta < 0) {
      loadDelta = Math.floor(loadDelta / 2)
      pendulumRoundsLeft.value--
      if (pendulumRoundsLeft.value === 0) {
        displayHistory.value.push({ type: 'system', content: '🕰 破碎钟摆效果结束' })
      }
    }

    const neutralBase = [0, 4, 3, 2, 1, 1][selectedScript.value?.difficulty ?? 1]
    let resDelta = {
      surge:   rand(10, 16),
      rise:    rand(5, 10),
      neutral: rand(neutralBase, neutralBase + 3),
      fall:    -rand(3, 7),
      drop:    -rand(8, 15)
    }[resonanceTag] ?? 0

    if (playerLevel.value >= 10) resDelta += 2

    let isImmune = false
    if (usedItem) {
      switch (usedItem.id) {
        case 'bandage':
          neuralLoad.value = Math.min(maxLoad.value, neuralLoad.value + 8)
          displayHistory.value.push({ type: 'system', content: '🩹 绷带卷：神经载荷+8' })
          break
        case 'incense':
          isImmune = true
          break
        case 'sponge':
          neuralLoad.value = Math.min(maxLoad.value, neuralLoad.value + 15)
          displayHistory.value.push({ type: 'system', content: '🧽 共情海绵：神经载荷+15，进入消化状态' })
          break
        case 'prism':
          resDelta += 3
          displayHistory.value.push({ type: 'system', content: '🔮 记忆棱镜：共振深度+3%' })
          break
        case 'tranquilizer':
          neuralLoad.value = Math.min(maxLoad.value, neuralLoad.value + 40)
          displayHistory.value.push({ type: 'system', content: '💉 镇定剂：神经载荷+40' })
          break
        case 'sutureThread':
          resDelta += 30
          neuralLoad.value = 0
          isDying.value    = true
          displayHistory.value.push({ type: 'system', content: '🧵 意识缝合线：共振深度+30%，载荷清零，必须立即撤离！' })
          break
        case 'pass13':
          loadDelta = 0
          displayHistory.value.push({ type: 'system', content: '🎫 第13层通行证：本轮危机已跳过' })
          break
        case 'watch':
  watchUsed.value = true              // ✅ 从 onChoiceSelect 移到这里
  watchActivatedThisRound.value = true
  displayHistory.value.push({ type: 'system', content: '⌚ 锚定怀表已准备，本轮选择后可回溯' })
  break

        case 'pendulum':
          pendulumRoundsLeft.value = 3
          displayHistory.value.push({ type: 'system', content: '🕰 破碎钟摆：接下来3轮危机冲击将被减半' })
          break
        case 'mask':
          // 本轮免疫伤害，代价在本函数末尾统一结算
          loadDelta = 0
          isImmune  = true
          displayHistory.value.push({ type: 'system', content: '🎭 镜像面具：替患者承受了这一轮的冲击' })
          break
        case 'lullaby':
          break
      }
    }

    if (loadDelta < 0 && ownedPermanents.value.includes('candle'))  loadDelta = Math.min(0, loadDelta + 2)
    if (loadDelta < 0 && ownedPermanents.value.includes('crystal')) loadDelta = Math.min(0, loadDelta + 3)
    if (loadDelta < 0 && playerLevel.value >= 10)                   loadDelta = Math.min(0, loadDelta + 2)

    if (isImmune && loadDelta < 0) {
      loadDelta = 0
      if (usedItem?.id === 'incense') {
        displayHistory.value.push({ type: 'system', content: '✨ 静谧香薰生效：本轮意识侵蚀已被隔离' })
      }
    }

    neuralLoad.value = Math.max(0, Math.min(maxLoad.value, neuralLoad.value + loadDelta))

    if (resDelta > 0 && ownedPermanents.value.includes('bell'))    resDelta = Math.ceil(resDelta * 1.2)
    if (resDelta > 0 && ownedPermanents.value.includes('crystal')) resDelta = Math.ceil(resDelta * 1.5)
    if (resDelta > 0 && activeTitles.value.includes('孤勇者'))     resDelta = Math.ceil(resDelta * 1.3)
    if (activeTitles.value.includes('治愈者') || activeTitles.value.includes('破局者')) resDelta += 1

    const progressRatio = currentRound.value / estimatedRounds.value
    const diff          = selectedScript.value?.difficulty ?? 1
    const resonanceCap  =
      diff <= 2 ? 100 :
      progressRatio < 0.4 ? 60 :
      progressRatio < 0.7 ? 85 : 100

    resonance.value = Math.max(0, Math.min(resonanceCap, resonance.value + resDelta))

    // mask 代价：直接归零（不受 lullaby / 守望者 保护，玩家主动承担）
    if (usedItem?.id === 'mask') {
      neuralLoad.value = 0
      displayHistory.value.push({ type: 'system', content: '🎭 镜像面具代价：神经载荷归零，必须立即撤离！' })
    }

    // 重生摇篮曲（mask 之后不触发）
    if (neuralLoad.value <= 0 && !isDying.value && usedItem?.id !== 'mask') {
      const lullabyItem = equippedItems.value.find(i => i.id === 'lullaby' && i.count > 0)
      if (lullabyItem) {
        lullabyItem.count--
        ownedConsumables.value['lullaby']--
        neuralLoad.value = 30
        displayHistory.value.push({ type: 'system', content: '🎵 重生摇篮曲自动触发：神经载荷恢复至30，继续坚持' })
      }
    }

    // 守望者：30%概率规避一次载荷归零（mask 之后不触发）
    if (neuralLoad.value <= 0 && !isDying.value && usedItem?.id !== 'mask') {
      if (activeTitles.value.includes('守望者') && !watcherProcUsed.value && Math.random() < 0.3) {
        neuralLoad.value   = 1
        watcherProcUsed.value = true
        displayHistory.value.push({ type: 'system', content: '🛡 守望者：意识屏障触发，险险撑住了' })
      }
    }

    if (neuralLoad.value <= 0) {
      isDying.value = true
    } else if (isDying.value) {
      isDying.value         = false
      dyingRoundsLeft.value = 0
      displayHistory.value.push({
        type: 'system',
        content: '✦ 神经载荷已恢复——意识连接重新稳定'
      })
    }

    if (resonanceTag === 'fall' || resonanceTag === 'drop') {
      consecutiveResonanceDrop.value++
      if (consecutiveResonanceDrop.value >= 3) hasReachedDropThreshold.value = true
    } else {
      consecutiveResonanceDrop.value = 0
    }
  }

  // ========== 逃脱 ==========

  function calcEscapeJudge() {
    const diff = selectedScript.value?.difficulty ?? 1
    let val    = [0, 90, 75, 60, 45, 30][diff] ?? 60
    if (neuralLoad.value < 30)  val -= (30 - neuralLoad.value)
    if (resonance.value < 50)   val -= 10
    if (isDying.value)          val -= 10
    if (resonance.value >= 100) val += 20
    const usableCount = equippedItems.value.filter(i => i.count > 0).length
    val += usableCount * 5
    if (ownedPermanents.value.includes('overcoat')) val += 15
    if (activeTitles.value.includes('守望者'))       val += 15
    return val >= 60 ? 'success' : val >= 40 ? 'near' : 'fail'
  }

  async function initiateEscape() {
    choices.value    = []
    innerText.value  = ''
    phase.value      = 'escape'
    isLoading.value  = true
    clearRetry()
    escapeAttempts.value++
    const result     = calcEscapeJudge()
    const escapeType = isDying.value ? 'dying' : 'normal'

    try {
      const raw = await callAISilent(buildEscapePrompt({
        escapeType, result,
        scriptContext: scriptContext.value,
        neuralLoad:    neuralLoad.value,
        resonance:     resonance.value
      }))
      const parsed = parseAIResponse(raw)
      if (!parsed.narrative) throw new Error('逃脱叙事内容为空')

      displayHistory.value.push({ type: 'narrative', content: parsed.narrative })
      await scrollToBottom(narrativeEl)

      if (result === 'success') {
        escapeSuccess.value  = true
        escapeResultText.value = '意识成功撤离梦境。'
        escapeDone.value     = true
      } else if (result === 'near') {
        neuralLoad.value     = Math.max(0, neuralLoad.value - 10)
        escapeSuccess.value  = true
        escapeResultText.value = '险险脱身——代价是额外10点载荷。'
        escapeDone.value     = true
      } else {
        neuralLoad.value     = Math.max(0, neuralLoad.value - 10)
        let maxEscapeAttempts = 2
        if (activeTitles.value.includes('守望者')) maxEscapeAttempts++
        if (pendingLevelUpChoice.value?.level === 9 && pendingLevelUpChoice.value?.choice === 'escape') maxEscapeAttempts++

        if (neuralLoad.value <= 0 || escapeAttempts.value >= maxEscapeAttempts) {
          escapeSuccess.value = false
          await goToSettlement()
        } else {
          escapeResultText.value = '逃脱通道受阻，重新寻找出路。'
          escapeCanRetry.value   = true
        }
      }
      isLoading.value = false

    } catch (err) {
      if (abortController?.signal.aborted) { isLoading.value = false; return }
      console.error(err)
      isLoading.value = false
      displayHistory.value.push({ type: 'system', content: '⚠ 逃脱叙事生成失败' })
      escapeAttempts.value = Math.max(0, escapeAttempts.value - 1)
      setRetry('重新生成逃脱叙事', initiateEscape)
    }
  }

  async function retryEscape() {
    escapeCanRetry.value   = false
    escapeResultText.value = ''
    await initiateEscape()
  }

  async function goToSettlementFromEcho() {
    escapeSuccess.value = true
    await goToSettlement()
  }

  // ========== 现实回响 ==========

  async function enterRealEcho() {
    phase.value            = 'dream'
    gameStage.value        = 'realecho'
    echoPhase.value        = 'act1'
    echoChoices.value      = []
    echoResonanceDelta.value = 0
    isLoading.value        = true
    currentNarrative.value = ''
    innerText.value        = ''
    streamingText.value    = ''
    clearRetry()

    displayHistory.value.push({ type: 'system', content: '— 意识撤离完成 · 现实时间恢复 —' })

    try {
      const raw = await callAISilent(buildRealEchoPrompt({
        act: 'act1', playerAction: '',
        scriptContext: scriptContext.value,
        resonance:     resonance.value
      }))
      const parsed = parseAIResponse(raw)
      if (!parsed.narrative)         throw new Error('现实回响叙事为空')
      if (parsed.options.length === 0) throw new Error('现实回响选项为空')

      isLoading.value = false
      await typewriterDisplay(parsed.narrative)
      streamingText.value    = ''
      currentNarrative.value = parsed.narrative
      echoChoices.value      = parsed.options
      await scrollToBottom(narrativeEl)

    } catch (err) {
      if (abortController?.signal.aborted) { isLoading.value = false; return }
      console.error(err)
      isLoading.value = false
      displayHistory.value.push({ type: 'system', content: '⚠ 现实回响生成失败' })
      setRetry('重新生成现实回响', enterRealEcho)
    }
  }

  async function onEchoChoiceSelect({ choice }) {
    if (currentNarrative.value) {
      displayHistory.value.push({ type: 'narrative', content: currentNarrative.value })
    }
    displayHistory.value.push({ type: 'choice', content: choice.text })

    echoChoices.value      = []
    currentNarrative.value = ''
    isLoading.value        = true
    historyCollapsed.value = true
    clearRetry()

    // 修复：保存旧阶段，出错时正确还原
    const prevPhase = echoPhase.value
    const nextAct   = echoPhase.value === 'act1' ? 'act2' : 'final'
    echoPhase.value = nextAct

    try {
      const raw = await callAISilent(buildRealEchoPrompt({
        act: nextAct, playerAction: choice.text,
        scriptContext: scriptContext.value,
        resonance:     resonance.value
      }))

      if (choice.type === 'accompany') {
        echoResonanceDelta.value += 2
      } else if (choice.type === 'inquiry') {
        echoResonanceDelta.value += 1
      }

      if (nextAct === 'final') {
        const narrative = extractSection(raw, 'NARRATIVE') || raw
        if (!narrative) throw new Error('离别叙事为空')

        const clampedDelta = Math.max(-5, Math.min(5, echoResonanceDelta.value))
        if (clampedDelta !== 0) {
          resonance.value = Math.max(0, Math.min(100, resonance.value + clampedDelta))
          displayHistory.value.push({
            type: 'system',
            content: clampedDelta > 0
              ? `◈ 现实回响：共振深度 +${clampedDelta}%`
              : `◈ 现实回响：共振深度 ${clampedDelta}%`
          })
        }

        if (echoResonanceDelta.value >= 3) {
          const bonus = Math.floor(Math.random() * 11) + 5
          pureDrops.value += bonus
          displayHistory.value.push({ type: 'system', content: `💧 现实回响奖励：+${bonus} 纯真滴露` })
        }

        isLoading.value = false
        await typewriterDisplay(narrative)
        streamingText.value    = ''
        currentNarrative.value = narrative

      } else {
        const parsed = parseAIResponse(raw)
        if (!parsed.narrative)         throw new Error('现实回响叙事为空')
        if (parsed.options.length === 0) throw new Error('现实回响选项为空')

        isLoading.value = false
        await typewriterDisplay(parsed.narrative)
        streamingText.value    = ''
        currentNarrative.value = parsed.narrative
        echoChoices.value      = parsed.options
      }

      await scrollToBottom(narrativeEl)

    } catch (err) {
      if (abortController?.signal.aborted) { isLoading.value = false; return }
      console.error(err)
      isLoading.value = false
      echoPhase.value = prevPhase  // 修复：正确还原旧阶段
      displayHistory.value.push({ type: 'system', content: '⚠ 现实回响生成失败' })
      setRetry('重新生成此幕', () => onEchoChoiceSelect({ choice }))
    }
  }

  // ========== 结算 ==========

  async function goToSettlement() {
  if (!escapeSuccess.value) {

    // ✅ 离调结局，直接设置结算内容
    finalResult.value     = 'lost'
    finalResultName.value = '离调'
    resultLabel.value     = '调律终止'
    dropsGained.value     = 0
    expGained.value       = 0
    newAchievements.value = []

    // 道具损失提示保留
    const lostList = []
    for (const item of equippedItems.value) {
      if (item.count > 0) {
        lostList.push({ name: item.name, count: item.count })
      }
    }
    if (lostList.length > 0) {
      lostItemsOnDeath.value = lostList
      setTimeout(() => { showLostItemsModal.value = true }, 1000)
    }

    await saveService.deleteSave(SCRIPT_ID)
    hasSave.value = false
    savePlayerData()

    phase.value            = 'settlement'
    gameStage.value        = 'dream'
    showBreath.value       = false
    showBreathDismissBtn.value = false
    showSettlementModal.value = true
    clearRetry()
    return
  }

  // ✅ 以下三种结局逻辑完全保持原样
  let result
  if (resonance.value >= 100)     result = 'perfect'
  else if (resonance.value >= 70) result = 'harmony'
  else                            result = 'disqualified'

  finalResult.value = result
  const map = {
    perfect:      { name: '完满终止', label: '演奏结束' },
    harmony:      { name: '协奏',     label: '演奏结束' },
    disqualified: { name: '失格',     label: '演奏中断' },
  }
  finalResultName.value = map[result].name
  resultLabel.value     = map[result].label

  const diff     = selectedScript.value?.difficulty ?? 1
  const baseDrop = [0, 20, 35, 55, 80, 120][diff] ?? 20
  const coeffMap = { perfect: 1, harmony: 0.8, disqualified: 0.4 }
  const coeff    = coeffMap[result] ?? 0
  let dropBonus  = activeTitles.value.includes('引渡者') ? 1.2 : 1.0

  dropsGained.value = Math.floor(baseDrop * coeff * dropBonus)
  if (playerLevel.value === 10) dropsGained.value += Math.floor(baseDrop * coeff * 0.2)
  pureDrops.value       += dropsGained.value
  totalDropsEarned.value += dropsGained.value

  expGained.value = Math.floor(diff * 15 * coeff)
  totalExp.value  += expGained.value

  levelUpRewards.value      = []
  levelUpChoiceNeeded.value = false
  levelUpChoices.value      = []
  levelUpChoiceQueue.value  = []
  checkLevelUp()

  if (justLeveledUp.value) {
    if (levelUpChoiceQueue.value.length > 0) {
      const next = levelUpChoiceQueue.value[0]
      levelUpChoiceNeeded.value = true
      levelUpChoices.value      = next.choices
    }
    showLevelUpModal.value = true
  }

  newAchievements.value = []
  completedScripts.value.push({
    id: `${SCRIPT_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    diff,
    result,
    time: Date.now(),
    patientName:       selectedScript.value?.name       ?? '未知',
    patientAge:        selectedScript.value?.age         ?? '??',
    patientProfession: selectedScript.value?.profession ?? '未知',
    scriptContext:     scriptContext.value,
    conversationHistory: JSON.parse(JSON.stringify(conversationHistory.value)),
    patientFutureText: '',
    statusHistory: [],
  })

  checkAllAchievements({ finalResult: result, escapeSuccess: escapeSuccess.value })
  savePlayerData()

  phase.value     = 'settlement'
  gameStage.value = 'dream'
  showBreath.value           = true
  showBreathDismissBtn.value = false
  clearRetry()

  await _generateSettlementTexts()
}


  async function _generateSettlementTexts() {
    isLoading.value = true
    clearRetry()

    const keyChoices = conversationHistory.value.slice(-3).map(h => h.playerAction).join('；')

    try {
      const [breathRaw, futureRaw] = await Promise.all([
        callAISimple(buildBreathPrompt({
          result:       finalResultName.value,
          keyChoices,
          scriptContext: scriptContext.value
        })).catch(e => { throw new Error(`呼吸页生成失败：${e.message}`) }),
        callAISilent(buildPatientFuturePrompt({
          result:       finalResultName.value,
          scriptContext: scriptContext.value,
          resonance:    resonance.value
        })).catch(e => { throw new Error(`患者后续生成失败：${e.message}`) })
      ])

      breathText.value = breathRaw
        ? (extractSection(breathRaw, 'BREATH') || breathRaw.trim())
        : '一切都过去了。你从那个深处归来，带着你看见的一切。'

      const rawFuture = futureRaw
        ? (extractSection(futureRaw, 'PATIENT_FUTURE') || futureRaw.trim())
        : ''
      patientFuture.value = rawFuture.replace(/\[STATUS:\s*[^\]]+\]/gi, '').trim()

      const last = completedScripts.value[completedScripts.value.length - 1]
      if (last) last.patientFutureText = patientFuture.value

      savePlayerData()
      isLoading.value            = false
      showBreathDismissBtn.value = true

    } catch (err) {
      if (abortController?.signal.aborted) { isLoading.value = false; return }
      console.error(err)
      isLoading.value = false
      if (!breathText.value) {
        breathText.value = '一切都过去了。你从那个深处归来，带着你看见的一切。'
      }
      showBreathDismissBtn.value = true
      setRetry('重新生成结算文本', _generateSettlementTexts)
    }
  }

  async function restartSelect() {
    if (scriptGenController) {
      scriptGenController.abort()
      scriptGenController = null
    }
    phase.value            = 'script_select'
    gameStage.value        = 'dream'
    scriptContext.value    = ''
    scriptTracking.value   = ''
    scriptPreviews.value   = []
    scriptGenError.value   = ''
    neuralLoad.value       = 100
    resonance.value        = 0
    currentRound.value     = 0
    isDying.value          = false
    conversationHistory.value = []
    displayHistory.value   = []
    choices.value          = []
    innerText.value        = ''
    streamingText.value    = ''
    escapeAttempts.value   = 0
    escapeSuccess.value    = false
    escapeDone.value       = false
    escapeCanRetry.value   = false
    echoChoices.value      = []
    selectedScript.value   = null
    showBreath.value       = false
    showBreathDismissBtn.value = false
    showSettlementModal.value  = false
    hasActiveGame.value    = false
    clearRetry()
    generateScripts()
  }

  function dismissBreath() {
    showBreath.value           = false
    showBreathDismissBtn.value = false
    showSettlementModal.value  = true
  }

  function confirmDeath() {
  executeStartNewGame()
}

  // ========== 成就 ==========

  function unlockAchievement(id) {
    if (achievements.value[id]) return
    achievements.value[id] = { unlockedAt: Date.now() }
    newAchievements.value.push(id)
    const conf = ACHIEVEMENT_CONFIG[id]
    if (conf.drops) pureDrops.value += conf.drops
    if (conf.title && !unlockedTitles.value.includes(conf.title)) {
      unlockedTitles.value.push(conf.title)
    }
  }

  function checkAllAchievements(gameResult) {
    if (completedScripts.value.length === 1 && ['perfect', 'harmony'].includes(gameResult.finalResult)) {
      unlockAchievement('first_cry')
    }
    const perfCount = completedScripts.value.filter(s => s.result === 'perfect').length
    if (perfCount >= 3) unlockAchievement('perfect_tone')
    if (neuralLoad.value <= 10) {
      lowLoadCompletions.value++
      if (lowLoadCompletions.value >= 5) unlockAchievement('abyss_glance')
    }
    if (hasReachedDropThreshold.value && gameResult.finalResult === 'perfect') unlockAchievement('not_abandon')
    if (usedItemIds.value.size >= 3 && gameResult.escapeSuccess) unlockAchievement('breakthrough')
    if (hasReachedAccompanyThreshold.value && gameResult.escapeSuccess) unlockAchievement('silent_listen')
    if (isDying.value && gameResult.escapeSuccess) unlockAchievement('survivor')

    const consumableUsed = usedItemIds.value.size
    if (consumableUsed === 0 && gameResult.finalResult === 'perfect') {
      unlockAchievement('echo_location')
    }
    if (selectedScript.value?.difficulty === 5 && consumableUsed === 0 && gameResult.escapeSuccess) {
      unlockAchievement('brave_game')
    }
    if (selectedScript.value?.difficulty >= 3 && consumableUsed === 0 && gameResult.escapeSuccess) {
      silentStreakCount.value++
      if (silentStreakCount.value >= 3) unlockAchievement('silent_one')
    } else {
      silentStreakCount.value = 0
    }
    const fiveStarPerfect = completedScripts.value.filter(s => s.diff === 5 && s.result === 'perfect').length
    if (fiveStarPerfect >= 20) unlockAchievement('mirror_person')
  }

  // ========== 升级系统 ==========

  function checkLevelUp() {
    justLeveledUp.value = false
    let newLevel = 1
    for (let i = 10; i >= 1; i--) {
      if (totalExp.value >= LEVEL_EXP[i]) { newLevel = i; break }
    }
    if (newLevel <= playerLevel.value) return
    for (let lv = playerLevel.value + 1; lv <= newLevel; lv++) {
      applyLevelReward(lv)
    }
    playerLevel.value   = newLevel
    justLeveledUp.value = true
  }

  function applyLevelReward(lv) {
    switch (lv) {
      case 2:
        levelUpRewards.value.push('道具栏容量 +1')
        break
      case 3:
        baseMaxLoad.value += 10
        levelUpRewards.value.push('神经载荷上限 +10')
        break
      case 4:
        levelUpRewards.value.push('解锁商店高级道具购买权')
        break
      case 5:
        levelUpChoiceQueue.value.push({
          level: 5,
          choices: [
            { id: 'load', label: '神经载荷上限 +10', desc: '能在梦境里撑得更久' },
            { id: 'item', label: '每局起始道具 +1', desc: '进入梦境时额外携带一件随机初级道具' }
          ]
        })
        break
      case 6:
        levelUpChoiceQueue.value.push({
          level: 6,
          choices: [
            { id: 'load',      label: '神经载荷上限 +15', desc: '大幅提升意识承载能力' },
            { id: 'resonance', label: '共振深度起始 +10%', desc: '每局开始时共振深度不再从0起步' }
          ]
        })
        break
      case 7:
        levelUpRewards.value.push('解锁商店终极道具购买权')
        break
      case 8:
        levelUpRewards.value.push('称号第二槽位解锁，可同时激活两个称号')
        break
      case 9:
        levelUpChoiceQueue.value.push({
          level: 9,
          choices: [
            { id: 'load',   label: '神经载荷上限 +15',   desc: '大幅提升意识承载能力' },
            { id: 'escape', label: '逃脱判定额外 +1 次机会', desc: '逃脱失败后可多一次尝试' }
          ]
        })
        break
      case 10:
        baseMaxLoad.value += 10
        levelUpRewards.value.push('神经载荷上限 +5')
        levelUpRewards.value.push('每轮自动抵抗 2 点载荷损伤')
        levelUpRewards.value.push('每轮共振深度 +2%')
        levelUpRewards.value.push('纯真滴露结算 +20%')
        break
    }
    if (lv >= 5 && !unlockedTitles.value.includes('引渡者')) {
      unlockedTitles.value.push('引渡者')
    }
  }

  function confirmLevelUpChoice(choiceId) {
    const current = levelUpChoiceQueue.value[0]
    if (!current) return
    const lv = current.level
    if (lv === 5) {
      if (choiceId === 'load') { baseMaxLoad.value += 10; levelUpRewards.value.push('神经载荷上限 +10') }
      else { levelUpRewards.value.push('每局起始道具 +1') }
    }
    if (lv === 6) {
      if (choiceId === 'load') { baseMaxLoad.value += 15; levelUpRewards.value.push('神经载荷上限 +15') }
      else { levelUpRewards.value.push('共振深度起始 +10%') }
    }
    if (lv === 9) {
      if (choiceId === 'load') { baseMaxLoad.value += 15; levelUpRewards.value.push('神经载荷上限 +15') }
      else { levelUpRewards.value.push('逃脱判定额外 +1 次机会') }
    }
    pendingLevelUpChoice.value = { level: lv, choice: choiceId }
    levelUpChoiceQueue.value.shift()
    savePlayerData()
    if (levelUpChoiceQueue.value.length > 0) {
      const next = levelUpChoiceQueue.value[0]
      levelUpChoices.value      = next.choices
      levelUpChoiceNeeded.value = true
    } else {
      levelUpChoiceNeeded.value = false
      levelUpChoices.value      = []
      showLevelUpModal.value    = false
    }
  }

  function skipLevelUpModal() {
    levelUpChoiceNeeded.value = false
    levelUpChoices.value      = []
    levelUpChoiceQueue.value  = []
    showLevelUpModal.value    = false
  }

  // ========== 生命周期 ==========

  onMounted(async () => {
    store.setGlobalApiBtn(true)
    loadPlayerData()
    await checkSave()
    await delay(200)
    titleReady.value = true
  })

  onUnmounted(() => {
    if (abortController)    abortController.abort()
    if (scriptGenController) scriptGenController.abort()
    store.setGlobalApiBtn(false)
  })

  watch(playerName,   () => { savePlayerData() })
  watch(playerAvatar, () => { savePlayerData() })

  // ========== return ==========
  return {
    // UI 状态
    phase, gameStage, bottomTab, historyCollapsed,
    titleReady, hasSave, hasActiveGame, storyReady, aiConfigured,
    showGuide, showDiffGuide,
    showPauseModal, showConfirmNewGameModal, showItemSelectModal,
    showBreath, activePermanentDesc,

    // 剧本
    isGeneratingScripts, scriptPreviews, scriptGenError, selectedScript,
    scriptTracking,

    // 重试系统
    canRetry, retryLabel, executeRetry, retryChoicesEmergency,

    // 后台生成
    isBackgroundRunning, returnToTitle,

    // 玩家数据
    playerName, playerAvatar,
    pureDrops, playerLevel, totalExp,
    totalRoundsPlayed, totalDropsEarned,
    completedScripts, achievements,
    unlockedTitles, activeTitles,
    newAchievements, justLeveledUp,
    ownedConsumables, ownedPermanents,
    scriptStats,

    // 游戏数值
    neuralLoad, maxLoad, baseMaxLoad,
    resonance, currentRound, isDying,
    dyingRoundsLeft,
    mustEvacuate, estimatedRounds,

    // 叙事内容
    conversationHistory, displayHistory,
    streamingText, innerText, currentNarrative,
    choices, isLoading,

    // 逃脱
    escapeAttempts, escapeResultText,
    escapeCanRetry, escapeDone, escapeSuccess,

    // 现实回响
    echoPhase, echoChoices, echoActLabel, echoResonanceDelta, goToSettlementFromEcho,

    // 结算
    finalResult, finalResultName, resultLabel,showSettlementModal, 
    dropsGained, expGained, breathText, patientFuture,
    
    // 升级系统
    showLevelUpModal, levelUpRewards,
    levelUpChoiceNeeded, levelUpChoices, levelUpChoiceQueue,
    confirmLevelUpChoice, skipLevelUpModal,

    // 调律者陨落
    confirmDeath,

    // 弹窗提示
    silentOneReward, showSilentOneModal,
    lostItemsOnDeath, showLostItemsModal, showBreathDismissBtn,

    // 道具
    equippedItems, activeItem, selectedLoadout, maxItemSlots,
    watchUsed, lastRoundSnapshot, useWatch,
    pendulumRoundsLeft, watchActivatedThisRound,

    // 洞察者
    insightUsesLeft, insightHint, useInsight,

    // 患者手册
    showHandbook, selectedPatient,
    patientCurrentStatus, isGeneratingStatus,
    showPatientStatusModal, generatePatientCurrentStatus,

    // 游戏流程函数
    startNewGame, continueGame, confirmStartNewGame,
    goStory, goToScriptSelect,
    handleHubPrimaryAction, enterScriptSelect,
    selectScript, refreshScripts,
    confirmItemSelect, skipItemSelect, toggleLoadoutItem,
    selectItemForRound, buyItem, toggleTitle,
    triggerAvatarUpload, handleAvatarUpload,
    onChoiceSelect, onEchoChoiceSelect,
    confirmPause, pauseAndReturn,
    initiateEscape, retryEscape, enterRealEcho,
    goToSettlement, restartSelect, saveProgress,
    splitParagraphs, dismissBreath,
    returnToHubFromSettlement,

    // 静态配置数据
    LEVEL_EXP, ACHIEVEMENT_CONFIG, shopItems, diffLevels,
  }
}
