import { reactive } from 'vue'
import aiService from '@/services/aiService'
import { buildGuestGenerationPrompt, buildGuestDialoguePrompt, buildLetterPolishPrompt, buildReviewPrompt } from '../prompts/promptBuilder'
import { SYSTEM_PROMPT } from '../prompts/systemPrompt'

// ── AI 调用 ──
async function callAI(userPrompt) {
  try {
    const reply = await aiService.generateReply(userPrompt, SYSTEM_PROMPT)
    return reply ?? ''
  } catch (err) {
    console.error('AI 调用失败：', err)
    return ''
  }
}

// ── 解析客人数据 ──
function parseGuest(raw) {
  const block = raw.match(/---GUEST---([\s\S]*?)---GUEST_END---/)?.[1] ?? ''
  const get = (key) => block.match(new RegExp(`${key}:\\s*([^\\n]+)`))?.[1]?.trim() ?? ''

  return {
    identity:         get('identity'),
    personality:      get('personality'),
    recipient:        get('recipient'),
    surfacePurpose:   get('surfacePurpose'),
    realPurpose:      get('realPurpose'),
    hiddenInfo:       get('hiddenInfo'),
    satisfyCondition: get('satisfyCondition'),
    openingLine:      get('openingLine'),
  }
}

// ── 解析对话回应 ──
function parseDialogueResponse(raw) {
  const text     = raw.match(/---RESPONSE---([\s\S]*?)---MOOD---/)?.[1]?.trim() ?? raw.trim()
  const openness = raw.match(/\[OPENNESS:(\w+)\]/)?.[1] ?? 'neutral'
  const revealed = raw.match(/\[REVEALED:(\w+)\]/)?.[1] ?? 'nothing'
  return { text, openness, revealed }
}

// ── 解析审阅结果 ──
function parseReview(raw) {
  const reaction         = raw.match(/---REACTION---([\s\S]*?)---VERDICT---/)?.[1]?.trim() ?? ''
  const result           = raw.match(/\[RESULT:(\w+)\]/)?.[1] ?? 'unsatisfied'
  const reputationChange = parseInt(raw.match(/\[REPUTATION_CHANGE:([+-]?\d+)\]/)?.[1] ?? '0')
  const editHint         = raw.match(/\[EDIT_HINT:([^\]]+)\]/)?.[1]?.trim() ?? ''
  return { reaction, result, reputationChange, editHint }
}

// ── 解析润色结果 ──
function parseLetter(raw) {
  return raw.match(/---LETTER---([\s\S]*?)---LETTER_END---/)?.[1]?.trim() ?? raw.trim()
}

// ── 游戏日期 ──
function getGameDate(state) {
  const seasonName = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }
  return `198${state.yearsElapsed}年${seasonName[state.currentSeason]}`
}

// ══════════════════════════════════════
export function useGameLogic() {

  // ── 游戏状态 ──
  const state = reactive({
    yearsElapsed:     0,
    currentSeason:    'spring',
    lettersWritten:   0,
    echosReceived:    0,
    reputation:       30,
    reputationPeak:   30,
    guestsTurnedAway: 0,
    recentGuestTypes: [],
    currentGuest:     null,
    letterArchive:    [],
    currentOpenness:  'neutral',
    warningCount:     0,
  })

  // ── 初始化 ──
  async function initGame() {
    state.reputation = 30
  }

  // ── 声望变化 ──
  function changeReputation(delta) {
    state.reputation = Math.max(0, state.reputation + delta)
    if (state.reputation > state.reputationPeak) {
      state.reputationPeak = state.reputation
    }
  }

  // ── 季节推进 ──
  function advanceSeason() {
    const seasons = ['spring', 'summer', 'autumn', 'winter']
    const i = seasons.indexOf(state.currentSeason)
    state.currentSeason = seasons[(i + 1) % 4]
    if (state.currentSeason === 'spring') state.yearsElapsed++
  }

  // ══ 客人生成 ══
  async function generateNextGuest() {
    const prompt = buildGuestGenerationPrompt({
      recentGuestTypes: state.recentGuestTypes
    })

    const raw   = await callAI(prompt)
    const guest = parseGuest(raw)

    if (!guest.identity) return null

    state.recentGuestTypes.push(guest.identity)
    if (state.recentGuestTypes.length > 5) state.recentGuestTypes.shift()

    state.currentGuest    = guest
    state.currentOpenness = 'neutral'
    state.warningCount    = 0

    return guest
  }

  // ══ 客人对话 ══
  async function sendToGuest({ playerMessage, conversationHistory }) {
    if (!state.currentGuest) return { text: '', guestLeft: false }

    const prompt = buildGuestDialoguePrompt({
      guest:           state.currentGuest,
      playerMessage,
      conversationHistory,
      currentOpenness: state.currentOpenness,
      warningCount:    state.warningCount,
    })

    const raw    = await callAI(prompt)
    const parsed = parseDialogueResponse(raw)

    state.currentOpenness = parsed.openness

    if (parsed.openness === 'guarded') state.warningCount++
    if (parsed.openness === 'closing') state.warningCount++

    if (state.warningCount >= 3 || parsed.openness === 'closing') {
      changeReputation(-5)
      state.guestsTurnedAway++
      state.currentGuest = null
      return { text: parsed.text, guestLeft: true }
    }

    return { text: parsed.text, guestLeft: false }
  }

  // ══ 润色信件 ══
  async function polishLetter({ playerDraft, params, conversationHistory }) {
    if (!state.currentGuest) return ''

    const prompt = buildLetterPolishPrompt({
      guest: state.currentGuest,
      conversationHistory,
      playerDraft,
      params,
    })

    const raw = await callAI(prompt)
    return parseLetter(raw)
  }

  // ══ 客人审阅 ══
  async function reviewLetter({ letterContent, revisionCount, conversationHistory }) {
    if (!state.currentGuest) return {}

    const prompt = buildReviewPrompt({
      guest: state.currentGuest,
      letterContent,
      conversationHistory,
      revisionCount,
    })

    const raw = await callAI(prompt)
    return parseReview(raw)
  }

  // ══ 提交信件（客人满意后）══
  function submitLetter({ content, recipient, reputationDelta }) {
    changeReputation(reputationDelta)
    advanceSeason()

    state.letterArchive.unshift({
      id:        Date.now(),
      date:      getGameDate(state),
      recipient: recipient ?? '',
      content,
      echo:      null,
    })

    state.lettersWritten++
    state.currentGuest    = null
    state.currentOpenness = 'neutral'
    state.warningCount    = 0
  }

  return {
    state,
    initGame,
    generateNextGuest,
    sendToGuest,
    polishLetter,
    reviewLetter,
    submitLetter,
    changeReputation,
  }
}
