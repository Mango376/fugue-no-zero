import { reactive } from 'vue'
import aiService from '@/services/aiService'
import saveService from '@/services/saveService'
import {
  buildGuestGenerationPrompt,
  buildGuestDialoguePrompt,
  buildLetterPolishPrompt,
  buildReviewPrompt,
  buildForcedAcceptance
} from '../prompts/promptBuilder'
import { SYSTEM_PROMPT } from '../prompts/systemPrompt'

const SCRIPT_ID = 'phase2-letter-writer'

function buildInitialState() {
  return {
    yearsElapsed: 0,
    currentSeason: 'spring',
    lettersWritten: 0,
    echosReceived: 0,
    reputation: 30,
    reputationPeak: 30,
    guestsTurnedAway: 0,
    recentGuestTypes: [],
    currentGuest: null,
    letterArchive: [],
    currentOpenness: 'neutral'
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

async function callAI(userPrompt, { signal } = {}) {
  try {
    const reply = await aiService.generateReply(userPrompt, SYSTEM_PROMPT, { signal })
    return reply ?? ''
  } catch (error) {
    if (isAbortError(error)) return ''
    console.error('LetterWriter AI 调用失败:', error)
    return ''
  }
}

function isAbortError(error) {
  return error?.name === 'AbortError'
    || error?.code === 'ERR_CANCELED'
    || /aborted|canceled|cancelled/i.test(String(error?.message || ''))
}

function parseGuest(raw) {
  const block = raw.match(/---GUEST---([\s\S]*?)---GUEST_END---/)?.[1] ?? ''
  const get = key => block.match(new RegExp(`${key}:\\s*([^\\n]+)`))?.[1]?.trim() ?? ''

  return {
    identity: get('identity'),
    personality: get('personality'),
    recipient: get('recipient'),
    surfacePurpose: get('surfacePurpose'),
    realPurpose: get('realPurpose'),
    satisfyCondition: get('satisfyCondition'),
    openingLine: get('openingLine')
  }
}

function parseDialogueResponse(raw) {
  const cleaned = String(raw || '')
    .replace(/---RESPONSE---/g, '')
    .replace(/---MOOD---[\s\S]*$/i, '')
    .replace(/--\s*MOOD\s*--[\s\S]*$/i, '')
    .replace(/\[OPENNESS:[^\]]+\][\s\S]*$/i, '')
    .replace(/\\\[\s*OPENNESS\s*:[^\]]+\][\s\S]*$/i, '')
    .replace(/\[REVEALED:[^\]]+\][\s\S]*$/i, '')
    .replace(/\\\[\s*REVEALED\s*:[^\]]+\][\s\S]*$/i, '')
    .trim()

  const text = cleaned
  const openness = raw.match(/\[OPENNESS:(\w+)\]/)?.[1] ?? 'neutral'
  const revealed = raw.match(/\[REVEALED:(\w+)\]/)?.[1] ?? 'nothing'
  return { text, openness, revealed }
}

function parseReview(raw) {
  const reaction = raw.match(/---REACTION---([\s\S]*?)---VERDICT---/)?.[1]?.trim() ?? ''
  const result = raw.match(/\[RESULT:(\w+)\]/)?.[1] ?? 'unsatisfied'
  const reputationChange = parseInt(raw.match(/\[REPUTATION_CHANGE:([+-]?\d+)\]/)?.[1] ?? '0', 10)
  const editHint = raw.match(/\[EDIT_HINT:([^\]]+)\]/)?.[1]?.trim() ?? ''
  return { reaction, result, reputationChange, editHint }
}

function parseLetter(raw) {
  return raw.match(/---LETTER---([\s\S]*?)---LETTER_END---/)?.[1]?.trim() ?? raw.trim()
}

function getGameDate(state) {
  const seasonName = {
    spring: '春',
    summer: '夏',
    autumn: '秋',
    winter: '冬'
  }
  return `198${state.yearsElapsed}年${seasonName[state.currentSeason] || ''}`
}

export function useGameLogic() {
  const state = reactive(buildInitialState())
  const activeControllers = new Set()

  function resetGameState() {
    Object.assign(state, buildInitialState())
  }

  function buildGameSnapshot() {
    return clone(state)
  }

  function applyGameSnapshot(snapshot = {}) {
    Object.assign(state, buildInitialState(), clone(snapshot))
  }

  async function saveProgress(sessionState = {}) {
    await saveService.save(SCRIPT_ID, {
      gameState: buildGameSnapshot(),
      sessionState: clone(sessionState)
    })
  }

  async function loadProgress() {
    const saved = await saveService.load(SCRIPT_ID)
    if (!saved) return null

    if (saved.gameState) {
      applyGameSnapshot(saved.gameState)
      return clone(saved.sessionState || {})
    }

    applyGameSnapshot(saved)
    return null
  }

  async function hasProgress() {
    const saved = await saveService.load(SCRIPT_ID)
    return !!saved
  }

  async function clearProgress() {
    await saveService.deleteSave(SCRIPT_ID)
  }

  function createRequestController() {
    const controller = new AbortController()
    activeControllers.add(controller)
    controller.signal.addEventListener('abort', () => {
      activeControllers.delete(controller)
    }, { once: true })
    return controller
  }

  function releaseRequestController(controller) {
    activeControllers.delete(controller)
  }

  function abortAllRequests() {
    activeControllers.forEach(controller => controller.abort())
    activeControllers.clear()
  }

  async function initGame() {
    if (!Number.isFinite(state.reputation)) {
      resetGameState()
    }
  }

  function changeReputation(delta) {
    state.reputation = Math.max(0, state.reputation + delta)
    if (state.reputation > state.reputationPeak) {
      state.reputationPeak = state.reputation
    }
  }

  function advanceSeason() {
    const seasons = ['spring', 'summer', 'autumn', 'winter']
    const index = seasons.indexOf(state.currentSeason)
    state.currentSeason = seasons[(index + 1) % 4]
    if (state.currentSeason === 'spring') state.yearsElapsed += 1
  }

  async function generateNextGuest() {
    const controller = createRequestController()
    try {
      const prompt = buildGuestGenerationPrompt({
        recentGuestTypes: state.recentGuestTypes
      })
      const raw = await callAI(prompt, { signal: controller.signal })
      if (!raw || controller.signal.aborted) return null

      const guest = parseGuest(raw)
      if (!guest.identity) return null

      state.recentGuestTypes.push(guest.identity)
      if (state.recentGuestTypes.length > 5) state.recentGuestTypes.shift()

      state.currentGuest = guest
      state.currentOpenness = 'neutral'
      return guest
    } finally {
      releaseRequestController(controller)
    }
  }

  async function sendToGuest({ playerMessage, conversationHistory }) {
    if (!state.currentGuest) return { text: '', guestLeft: false, aborted: false }

    const controller = createRequestController()
    try {
      const prompt = buildGuestDialoguePrompt({
        guest: state.currentGuest,
        playerMessage,
        conversationHistory,
        currentOpenness: state.currentOpenness
      })

      const raw = await callAI(prompt, { signal: controller.signal })
      if (!raw || controller.signal.aborted) {
        return { text: '', guestLeft: false, aborted: true }
      }

      const parsed = parseDialogueResponse(raw)
      state.currentOpenness = parsed.openness

      if (parsed.openness === 'closing') {
        changeReputation(-5)
        state.guestsTurnedAway += 1
        state.currentGuest = null
        return { text: parsed.text, guestLeft: true, aborted: false }
      }

      return { text: parsed.text, guestLeft: false, aborted: false }
    } finally {
      releaseRequestController(controller)
    }
  }

  async function polishLetter({ playerDraft, params, conversationHistory }) {
    if (!state.currentGuest) return { content: '', aborted: false }

    const controller = createRequestController()
    try {
      const prompt = buildLetterPolishPrompt({
        guest: state.currentGuest,
        conversationHistory,
        playerDraft,
        params
      })

      const raw = await callAI(prompt, { signal: controller.signal })
      if (!raw || controller.signal.aborted) {
        return { content: '', aborted: true }
      }

      return { content: parseLetter(raw), aborted: false }
    } finally {
      releaseRequestController(controller)
    }
  }

  async function reviewLetter({ letterContent, revisionCount, conversationHistory }) {
    if (!state.currentGuest) return { aborted: false }

    if (revisionCount >= 2) {
      return { ...buildForcedAcceptance(), aborted: false }
    }

    const controller = createRequestController()
    try {
      const prompt = buildReviewPrompt({
        guest: state.currentGuest,
        letterContent,
        conversationHistory,
        revisionCount
      })

      const raw = await callAI(prompt, { signal: controller.signal })
      if (!raw || controller.signal.aborted) {
        return { aborted: true }
      }

      return { ...parseReview(raw), aborted: false }
    } finally {
      releaseRequestController(controller)
    }
  }

  function submitLetter({ content, recipient, reputationDelta }) {
    changeReputation(reputationDelta)
    advanceSeason()

    state.letterArchive.unshift({
      id: Date.now(),
      date: getGameDate(state),
      recipient: recipient ?? '',
      content,
      echo: null
    })

    state.lettersWritten += 1
    state.currentGuest = null
    state.currentOpenness = 'neutral'
  }

  return {
    state,
    initGame,
    resetGameState,
    buildGameSnapshot,
    applyGameSnapshot,
    saveProgress,
    loadProgress,
    hasProgress,
    clearProgress,
    abortAllRequests,
    generateNextGuest,
    sendToGuest,
    polishLetter,
    reviewLetter,
    submitLetter,
    changeReputation
  }
}
