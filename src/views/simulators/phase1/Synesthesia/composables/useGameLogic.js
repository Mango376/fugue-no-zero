import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import aiService from '@/services/aiService'
import saveService from '@/services/saveService'
import {
  BACKGROUND_PAGES,
  CONSULT_OPTION_LIBRARY,
  DEFAULT_EQUIPMENT_OVERVIEW,
  DEFAULT_GAME_STATE,
  DIAGNOSIS_LIMIT,
  ENVIRONMENT_PHASES,
  HUB_ACTIONS,
  PLAYER_PROFILE,
  REAL_MS_PER_GAME_DAY,
  REVISIT_DELAY_DAYS,
  SENSE_CONFIGS,
  SENSE_LABELS,
  SENSE_TARGETS,
  SYSTEM_SNAPSHOT,
  TITLE_CONTENT
} from '../data/gameContent'
import {
  buildArrivalPrompt,
  buildConsultOptionsPrompt,
  buildConsultReplyPrompt,
  buildTrackingSheetPrompt,
  buildTreatmentFeedbackPrompt
} from '../prompts/promptBuilder'
import {
  buildEnvironmentGenerationPrompt,
  buildPatientGenerationPrompt,
  GENERATION_SYSTEM_PROMPT
} from '../prompts/generationPrompts'
import { SYSTEM_PROMPT } from '../prompts/systemPrompt'

const SCRIPT_ID = 'synesthesia'
const ARCHIVE_PREFIX = `${SCRIPT_ID}-archive-`
const VALID_PHASES = ['background_intro', 'hub', 'consult', 'treatment', 'patient_feedback']
const VALID_CONSULT_STAGES = ['arrival_intro', 'questioning']
const VALID_CONSULT_ENTRY_STAGES = ['pre_consult', 'entering_consult', 'questioning']
const AUTOSAVE_DELAY = 400
const BASE_TREATMENT_FEE = 50
const DEFAULT_SYMPTOM_LEVEL = 1
const MAX_SYMPTOM_LEVEL = 4
const DEBT_BORROW_PROBABILITY = 0.1
const DEBT_REPAY_DAILY_PROBABILITY = 0.1

function createEmptyMapping() {
  return Object.fromEntries(SENSE_CONFIGS.map(item => [item.id, []]))
}

function createEmptyLevelMap() {
  return {}
}

function buildDefaultModuleLevels(sourceId) {
  return Object.fromEntries((SENSE_TARGETS[sourceId] ?? []).map(targetId => [targetId, 1]))
}

function normalizeTargets(sourceId, targets = []) {
  const allowed = new Set(SENSE_TARGETS[sourceId] ?? [])

  return [...new Set((Array.isArray(targets) ? targets : []).filter(target => allowed.has(target)))]
}

function normalizeMapping(mapping = {}) {
  const next = createEmptyMapping()

  SENSE_CONFIGS.forEach(item => {
    next[item.id] = normalizeTargets(item.id, mapping?.[item.id])
  })

  return next
}

function cloneMapping(mapping) {
  return normalizeMapping(mapping)
}

function mergeMappings(base, extra) {
  const next = createEmptyMapping()

  SENSE_CONFIGS.forEach(item => {
    next[item.id] = [...new Set([
      ...normalizeTargets(item.id, base?.[item.id]),
      ...normalizeTargets(item.id, extra?.[item.id])
    ])]
  })

  return next
}

function intersectMappings(base, reference) {
  const next = createEmptyMapping()

  SENSE_CONFIGS.forEach(item => {
    const referenceSet = new Set(normalizeTargets(item.id, reference?.[item.id]))
    next[item.id] = normalizeTargets(item.id, base?.[item.id]).filter(target => referenceSet.has(target))
  })

  return next
}

function subtractMappings(base, removed) {
  const next = createEmptyMapping()

  SENSE_CONFIGS.forEach(item => {
    const removedSet = new Set(normalizeTargets(item.id, removed?.[item.id]))
    next[item.id] = normalizeTargets(item.id, base?.[item.id]).filter(target => !removedSet.has(target))
  })

  return next
}

function getMappingPairs(mapping) {
  const normalized = normalizeMapping(mapping)

  return SENSE_CONFIGS.flatMap(source =>
    normalized[source.id].map(target => ({
      source: source.id,
      target,
      key: `${source.id}:${target}`
    }))
  )
}

function countMappings(mapping) {
  return getMappingPairs(mapping).length
}

function formatPairLabel(sourceId, targetId) {
  return `${SENSE_LABELS[sourceId]} -> ${SENSE_LABELS[targetId]}`
}

function formatPairList(mapping) {
  const pairs = getMappingPairs(mapping)
  return pairs.length ? pairs.map(item => formatPairLabel(item.source, item.target)).join('；') : '暂无'
}

function isEmptyMapping(mapping) {
  return countMappings(mapping) === 0
}

function formatMappingSummary(mapping) {
  const lines = SENSE_CONFIGS.map(source => {
    const targets = normalizeTargets(source.id, mapping?.[source.id])

    if (!targets.length) return ''

    return `${SENSE_LABELS[source.id]} -> ${targets.map(target => SENSE_LABELS[target]).join('、')}`
  }).filter(Boolean)

  return lines.length ? lines.join('；') : '暂无'
}

function cloneEquipmentOverview(source = DEFAULT_EQUIPMENT_OVERVIEW) {
  return source.map(item => ({
    ...item,
    modules: Array.isArray(item.modules) ? [...item.modules] : [],
    moduleLevels: {
      ...buildDefaultModuleLevels(item.id),
      ...(item.moduleLevels ?? {})
    }
  }))
}

function cloneEnvironmentProfile(environment) {
  if (!environment) return null

  return {
    ...environment
  }
}

function clonePatient(patient) {
  if (!patient) return null

  const { _initialMappingLevels, ...rest } = patient

  return {
    ...rest,
    environmentProfile: cloneEnvironmentProfile(patient.environmentProfile),
    initialMappingLevels: { ...(patient.initialMappingLevels ?? {}) },
    hiddenMappings: cloneMapping(patient.hiddenMappings),
    originalMappings: cloneMapping(patient.originalMappings),
    trackingSheet: cloneTrackingSheet(patient.trackingSheet)
  }
}

function cloneCompletedCase(record) {
  if (!record) return null

  return {
    ...record
  }
}

function cloneDebtRecord(record) {
  if (!record) return null

  return {
    ...record
  }
}

function clonePhoneMessage(message) {
  if (!message) return null

  return {
    ...message
  }
}

function cloneTrackingSheet(trackingSheet) {
  if (!trackingSheet) return null

  return {
    ...trackingSheet,
    patientProfile: {
      ...(trackingSheet.patientProfile ?? {})
    },
    environmentFactors: Array.isArray(trackingSheet.environmentFactors)
      ? [...trackingSheet.environmentFactors]
      : [],
    symptomLedger: Array.isArray(trackingSheet.symptomLedger)
      ? [...trackingSheet.symptomLedger]
      : [],
    changeLog: Array.isArray(trackingSheet.changeLog)
      ? [...trackingSheet.changeLog]
      : [],
    originalMappings: cloneMapping(trackingSheet.originalMappings),
    unresolvedMappings: cloneMapping(trackingSheet.unresolvedMappings),
    confirmedMappings: cloneMapping(trackingSheet.confirmedMappings),
    resolvedMappings: cloneMapping(trackingSheet.resolvedMappings),
    mappingLevels: { ...(trackingSheet.mappingLevels ?? {}) },
    healedMappings: cloneMapping(trackingSheet.healedMappings),
    worsenedMappings: cloneMapping(trackingSheet.worsenedMappings),
    newMappings: cloneMapping(trackingSheet.newMappings)
  }
}

function sortRevisitQueue(queue = []) {
  return [...queue].sort((a, b) => {
    const returnDayDelta = (a.returnDay ?? Number.POSITIVE_INFINITY) - (b.returnDay ?? Number.POSITIVE_INFINITY)

    if (returnDayDelta !== 0) return returnDayDelta

    return (a.serial ?? 0) - (b.serial ?? 0)
  })
}

function rotateArray(list, offset = 0) {
  if (!list.length) return []

  const normalizedOffset = ((offset % list.length) + list.length) % list.length

  return [...list.slice(normalizedOffset), ...list.slice(0, normalizedOffset)]
}

function pickFrom(list, seed) {
  return rotateArray(list, seed)[0]
}

function computeEnvironmentPhase(gameDay) {
  const index = (Math.max(1, gameDay) - 1) % ENVIRONMENT_PHASES.length
  return ENVIRONMENT_PHASES[index].phase
}

function createPatientSeedBase() {
  return Date.now() + Math.floor(Math.random() * 1000000)
}

function shuffleArray(list = []) {
  const next = [...list]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

function createIndexPool(size, avoidFirstIndex = null) {
  if (size <= 0) return []

  const deck = shuffleArray(Array.from({ length: size }, (_, index) => index))

  if (size > 1 && avoidFirstIndex !== null && deck[0] === avoidFirstIndex) {
    const swapIndex = deck.findIndex(index => index !== avoidFirstIndex)
    if (swapIndex > 0) {
      ;[deck[0], deck[swapIndex]] = [deck[swapIndex], deck[0]]
    }
  }

  return deck
}

function normalizeIndexPool(pool, size) {
  const valid = Array.isArray(pool)
    ? [...new Set(pool.filter(index => Number.isInteger(index) && index >= 0 && index < size))]
    : []

  return valid.length ? valid : createIndexPool(size)
}

function pickRandomEnvironmentPhase(excludedPhase = null) {
  const candidates = ENVIRONMENT_PHASES
    .map(item => item.phase)
    .filter(phase => ENVIRONMENT_PHASES.length <= 1 || phase !== excludedPhase)

  if (!candidates.length) {
    return ENVIRONMENT_PHASES[0]?.phase ?? 1
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

function getEnvironmentByPhase(phaseId) {
  return ENVIRONMENT_PHASES.find(item => item.phase === phaseId) ?? ENVIRONMENT_PHASES[0]
}

function makeHistoryEntry({ speaker, label, text, type = 'dialogue' }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    speaker,
    label,
    text,
    type,
    createdAt: Date.now()
  }
}

function makePhoneMessage({
  sender,
  title,
  text,
  gameDay,
  type = 'system',
  read = false
}) {
  return {
    id: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender,
    title,
    text,
    gameDay,
    type,
    read,
    createdAt: Date.now()
  }
}

function buildDefaultGameState() {
  return {
    phase: DEFAULT_GAME_STATE.phase,
    consultStage: DEFAULT_GAME_STATE.consultStage,
    consultEntryStage: 'pre_consult',
    backgroundPage: DEFAULT_GAME_STATE.backgroundPage,
    credits: DEFAULT_GAME_STATE.credits,
    patientCount: DEFAULT_GAME_STATE.patientCount,
    gameDay: DEFAULT_GAME_STATE.gameDay,
    lastTimeSyncAt: Date.now(),
    nextPatientSerial: DEFAULT_GAME_STATE.nextPatientSerial,
    patientSeedBase: createPatientSeedBase(),
    environmentPhase: DEFAULT_GAME_STATE.environmentPhase,
    currentEnvironmentProfile: null,
    playerProfile: { ...PLAYER_PROFILE },
    equipmentOverview: cloneEquipmentOverview(),
    earnedCreditsTotal: 0,
    waitingPatients: [],
    lastQueueRollAt: Date.now(),
    activePatient: null,
    consultationHistory: [],
    consultOptions: CONSULT_OPTION_LIBRARY.map(item => ({ ...item })),
    consultNotes: '',
    diagnosisDraft: createEmptyMapping(),
    confirmedDiagnosis: createEmptyMapping(),
    diagnosisUsesLeft: DIAGNOSIS_LIMIT,
    treatmentDraft: createEmptyMapping(),
    isConsultNarrativeReady: false,
    isConsultOptionsReady: false,
    phoneMessages: [],
    debtLedger: [],
    revisitQueue: [],
    completedCases: []
  }
}

function buildEstimatedIncome(patient) {
  const mappingCount = countMappings(patient?.originalMappings)
  const revisitBonus = Number(patient?.visitCount || 1) > 1 ? 18 : 0
  return 36 + mappingCount * 22 + revisitBonus
}

function normalizeLevelValue(level) {
  return clamp(Number(level || DEFAULT_SYMPTOM_LEVEL), DEFAULT_SYMPTOM_LEVEL, MAX_SYMPTOM_LEVEL)
}

function getMappingLevel(levelMap, sourceId, targetId) {
  return normalizeLevelValue(levelMap?.[`${sourceId}:${targetId}`])
}

function setMappingLevel(levelMap, sourceId, targetId, level) {
  return {
    ...(levelMap ?? {}),
    [`${sourceId}:${targetId}`]: normalizeLevelValue(level)
  }
}

function normalizeMappingLevelsForPairs(levelMap = {}, mapping = {}) {
  return getMappingPairs(mapping).reduce((acc, pair) => {
    acc[pair.key] = normalizeLevelValue(levelMap?.[pair.key] ?? DEFAULT_SYMPTOM_LEVEL)
    return acc
  }, createEmptyLevelMap())
}

function pickInitialMappingLevel(patient, sourceId, targetId) {
  const seed = (Number(patient?.serial || 1) * 19)
    + (Number(patient?.visitCount || 1) * 7)
    + sourceId.length
    + targetId.length

  return seed % 100 < 78 ? 1 : 2
}

function buildInitialMappingLevels(patient, rule = null) {
  if (patient?.initialMappingLevels && Object.keys(patient.initialMappingLevels).length > 0) {
    return normalizeMappingLevelsForPairs(patient.initialMappingLevels, patient?.originalMappings ?? {})
  }

  return getMappingPairs(patient?.originalMappings ?? {}).reduce((acc, pair) => {
    if (!rule) {
      // 随机期：原有逻辑
      acc[pair.key] = pickInitialMappingLevel(patient, pair.source, pair.target)
      return acc
    }

    // 预设期：按规则决定等级
    const { maxLevel, mustHaveLv2 } = rule
    const pairIndex = Object.keys(acc).length

    if (mustHaveLv2 && pairIndex === 0) {
      // 第一个异常强制 Lv.2
      acc[pair.key] = 2
    } else {
      const seed = (Number(patient?.serial || 1) * 19)
        + (Number(patient?.visitCount || 1) * 7)
        + pair.source.length
        + pair.target.length
        + pairIndex

      acc[pair.key] = maxLevel === 1
        ? 1
        : 1 + (seed % maxLevel)
    }

    return acc
  }, createEmptyLevelMap())
}


function buildFallbackTrackingSheet(patient, environment) {
  const estimatedIncome = buildEstimatedIncome(patient)
  const initialPairs = getMappingPairs(patient.originalMappings).map(item => formatPairLabel(item.source, item.target))
  const mappingLevels = buildInitialMappingLevels(patient)

  return {
    patientProfile: {
      name: patient.name,
      job: patient.job,
      jobContext: patient.jobContext,
      visitCount: patient.visitCount,
      speechStyle: patient.speechStyle,
      emotionalTone: patient.emotionalTone
    },
    coreConcern: patient.attachment,
    symptomSummary: `${patient.job}出现 ${countMappings(patient.originalMappings)} 项感官串线异常`,
    environmentFactors: [
      environment.name,
      environment.description
    ],
    symptomLedger: initialPairs,
    changeLog: [
      `初诊建档：${initialPairs.join('；') || '暂无异常'}`
    ],
    abnormalCount: countMappings(patient.originalMappings),
    estimatedIncome,
    originalMappings: cloneMapping(patient.originalMappings),
    unresolvedMappings: cloneMapping(patient.hiddenMappings),
    confirmedMappings: createEmptyMapping(),
    resolvedMappings: createEmptyMapping(),
    mappingLevels,
    healedMappings: createEmptyMapping(),
    worsenedMappings: createEmptyMapping(),
    newMappings: createEmptyMapping()
  }
}

function parseTrackingSheetPayload(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned)

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('tracking sheet payload must be an object')
  }

  return parsed
}

function normalizeTrackingSheet(rawSheet, patient, environment) {
  const fallback = buildFallbackTrackingSheet(patient, environment)

  return {
    patientProfile: {
      ...fallback.patientProfile,
      ...(rawSheet?.patientProfile ?? {})
    },
    coreConcern: typeof rawSheet?.coreConcern === 'string' && rawSheet.coreConcern.trim()
      ? rawSheet.coreConcern.trim()
      : fallback.coreConcern,
    symptomSummary: typeof rawSheet?.symptomSummary === 'string' && rawSheet.symptomSummary.trim()
      ? rawSheet.symptomSummary.trim()
      : fallback.symptomSummary,
    environmentFactors: Array.isArray(rawSheet?.environmentFactors) && rawSheet.environmentFactors.length
      ? rawSheet.environmentFactors.map(item => String(item).trim()).filter(Boolean)
      : fallback.environmentFactors,
    symptomLedger: Array.isArray(rawSheet?.symptomLedger) && rawSheet.symptomLedger.length
      ? rawSheet.symptomLedger.map(item => String(item).trim()).filter(Boolean)
      : fallback.symptomLedger,
    changeLog: Array.isArray(rawSheet?.changeLog) && rawSheet.changeLog.length
      ? rawSheet.changeLog.map(item => String(item).trim()).filter(Boolean)
      : fallback.changeLog,
    abnormalCount: fallback.abnormalCount,
    estimatedIncome: fallback.estimatedIncome,
    originalMappings: cloneMapping(fallback.originalMappings),
    unresolvedMappings: cloneMapping(fallback.unresolvedMappings),
    confirmedMappings: cloneMapping(rawSheet?.confirmedMappings ?? fallback.confirmedMappings),
    resolvedMappings: cloneMapping(rawSheet?.resolvedMappings ?? fallback.resolvedMappings),
    mappingLevels: {
      ...fallback.mappingLevels,
      ...(rawSheet?.mappingLevels ?? {})
    },
    healedMappings: cloneMapping(rawSheet?.healedMappings ?? fallback.healedMappings),
    worsenedMappings: cloneMapping(rawSheet?.worsenedMappings ?? fallback.worsenedMappings),
    newMappings: cloneMapping(rawSheet?.newMappings ?? fallback.newMappings)
  }
}

function buildPseudoSeed(patient, envPhase, currentDay) {
  return (Number(patient?.serial || 1) * 31)
    + (Number(patient?.visitCount || 1) * 17)
    + (Number(envPhase || 1) * 13)
    + (Number(currentDay || 1) * 7)
}

function appendTrackingLog(trackingSheet, line) {
  if (!trackingSheet || !line) return
  trackingSheet.changeLog = [...(trackingSheet.changeLog ?? []), line]
}

function appendSymptomLedger(trackingSheet, line) {
  if (!trackingSheet || !line) return
  trackingSheet.symptomLedger = [...(trackingSheet.symptomLedger ?? []), line]
}

function applyRevisitMutation(patient, environment, currentDay) {
  if (!patient?.trackingSheet) return patient

  const nextPatient = clonePatient(patient)
  const nextSheet = cloneTrackingSheet(nextPatient.trackingSheet)
  const unresolved = cloneMapping(nextSheet.unresolvedMappings)
  const seed = buildPseudoSeed(nextPatient, environment?.phase, currentDay)

  const unresolvedPairs = getMappingPairs(unresolved)
  if (unresolvedPairs.length) {
    const targetPair = unresolvedPairs[seed % unresolvedPairs.length]
    const sourceTargets = unresolved[targetPair.source]
    const sourceLabel = SENSE_LABELS[targetPair.source]
    const availableTargets = SENSE_TARGETS[targetPair.source].filter(target => !sourceTargets.includes(target))

    if (availableTargets.length && seed % 100 < 65) {
      const newTarget = availableTargets[(seed + 3) % availableTargets.length]
      const oldSummary = `${sourceLabel} -> ${sourceTargets.map(item => SENSE_LABELS[item]).join('、')}`
      unresolved[targetPair.source] = [...sourceTargets, newTarget]
      nextSheet.mappingLevels = setMappingLevel(
        nextSheet.mappingLevels,
        targetPair.source,
        newTarget,
        getMappingLevel(nextSheet.mappingLevels, targetPair.source, targetPair.target) + 1
      )
      nextSheet.worsenedMappings[targetPair.source] = [...new Set([
        ...nextSheet.worsenedMappings[targetPair.source],
        ...unresolved[targetPair.source]
      ])]
      appendSymptomLedger(
        nextSheet,
        `加重：~~${oldSummary}~~ -> ${sourceLabel} -> ${unresolved[targetPair.source].map(item => SENSE_LABELS[item]).join('、')}`
      )
      appendTrackingLog(nextSheet, `复诊加深：${formatPairLabel(targetPair.source, newTarget)}`)
    }
  }

  const sourceId = SENSE_CONFIGS[(seed + 5) % SENSE_CONFIGS.length].id
  const addableTargets = SENSE_TARGETS[sourceId].filter(target => !unresolved[sourceId].includes(target))
  if (addableTargets.length && seed % 100 < 45) {
    const newTarget = addableTargets[(seed + 11) % addableTargets.length]
    unresolved[sourceId] = [...unresolved[sourceId], newTarget]
    nextSheet.mappingLevels = setMappingLevel(nextSheet.mappingLevels, sourceId, newTarget, DEFAULT_SYMPTOM_LEVEL)
    nextSheet.newMappings[sourceId] = [...new Set([...nextSheet.newMappings[sourceId], newTarget])]
    appendSymptomLedger(nextSheet, `新增：${formatPairLabel(sourceId, newTarget)}`)
    appendTrackingLog(nextSheet, `复诊新增：${formatPairLabel(sourceId, newTarget)}`)
  }

  nextSheet.environmentFactors = [
    environment?.name || '',
    environment?.description || ''
  ].filter(Boolean)
  nextSheet.unresolvedMappings = cloneMapping(unresolved)
  nextSheet.abnormalCount = countMappings(unresolved)
  nextPatient.hiddenMappings = cloneMapping(unresolved)
  nextPatient.trackingSheet = nextSheet

  return nextPatient
}

function getEquipmentLevel(equipmentOverview, sourceId, targetId = '') {
  const matched = Array.isArray(equipmentOverview)
    ? equipmentOverview.find(item => item.id === sourceId)
    : null

  if (targetId) {
    return Math.max(1, Number(matched?.moduleLevels?.[targetId] || 1))
  }

  return Math.max(1, Number(matched?.level || 1))
}

function buildSettlementItems(resolvedMappings, equipmentList) {
  return getMappingPairs(resolvedMappings).map(pair => {
    const level = getEquipmentLevel(equipmentList, pair.source, pair.target)
    return {
      id: pair.key,
      source: pair.source,
      target: pair.target,
      label: formatPairLabel(pair.source, pair.target),
      level,
      fee: BASE_TREATMENT_FEE * level
    }
  })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizeNarrativeError(error) {
  if (error?.message?.includes('请先配置AI接入设置')) {
    return '当前还没有配置 AI 接入，无法生成问诊叙事。'
  }

  return error?.message || '生成文本时出现问题。'
}

function stripCodeFence(text = '') {
  return String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
}

function stripStructuredMarkers(text = '') {
  return String(text || '')
    .replace(/^\s*---[A-Z_]+---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function looksLikePromptLeak(text = '') {
  const cleaned = stripStructuredMarkers(stripCodeFence(text))

  if (!cleaned) return false

  return (
    /生成\s*4\s*个下一步问诊选项/.test(cleaned)
    || /只输出\s*JSON/.test(cleaned)
    || /"doctorLine"\s*:/.test(cleaned)
    || /"promptFocus"\s*:/.test(cleaned)
    || /"patientProfile"\s*:/.test(cleaned)
    || /"unresolvedMappings"\s*:/.test(cleaned)
    || /【最近问诊历史】|【本轮医生提问】|【玩家当前记录】|【已知基础资料】/.test(cleaned)
  )
}

function sanitizeNarrativeReply(text = '') {
  const cleaned = stripStructuredMarkers(stripCodeFence(text))

  if (!cleaned || looksLikePromptLeak(cleaned)) {
    return ''
  }

  return cleaned
}

function sanitizeHistoryEntries(entries = []) {
  if (!Array.isArray(entries)) return []

  return entries
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      ...item,
      text: sanitizeNarrativeReply(item.text)
    }))
    .filter(item => item.text)
}

function sanitizeDoctorLine(text = '', label = '') {
  return String(text || '')
    .replace(/^[—\-–\s]+/, '')
    .replace(new RegExp(`^${label}[：:、\\s-]*`), '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeQuestionText(text = '') {
  return String(text || '')
    .replace(/[—\-–\s，。！？、：:“”"'`]/g, '')
    .trim()
}

function isRepeatedQuestion(candidate, historyLines = [], currentLines = []) {
  const normalized = normalizeQuestionText(candidate)
  if (!normalized) return true

  return [...historyLines, ...currentLines].some(item => {
    const compare = normalizeQuestionText(item)
    if (!compare) return false
    return normalized === compare || normalized.includes(compare) || compare.includes(normalized)
  })
}

function buildFallbackOptions(recentDoctorLines = []) {
  const selected = []

  CONSULT_OPTION_LIBRARY.forEach((item, index) => {
    const doctorLine = sanitizeDoctorLine(item.doctorLine, item.label)
    if (isRepeatedQuestion(doctorLine, recentDoctorLines, selected.map(option => option.doctorLine))) return

    selected.push({
      id: item.id || `fallback-${index + 1}`,
      label: item.label || `问诊选项 ${index + 1}`,
      doctorLine,
      promptFocus: item.promptFocus || '继续追问当前最需要澄清的症状。'
    })
  })

  return selected.slice(0, 4)
}

function buildFallbackArrivalText(patient, environment) {
  return `${environment?.name || '夜色'}里的水声先贴着门边停了一瞬。你朝门口抬了抬手，示意对方先坐。${patient?.name || '患者'}进门时还带着外头潮气和金属味，坐下后安静了两秒，才低声开口：“这两天总有点不对劲，像是有些感觉会错到一块去。”`
}

function buildFallbackPatientReply(patient, option) {
  const templates = {
    symptom: '他停了一下，把最明显的那一下又重复了一遍，细节比刚才多了一点，但还是像隔着一层雾，没法说得特别准。',
    trigger: '他想了想，把症状冒出来前后的动作和场景往前捋了一遍，提到那种不对劲往往不是平白出现的。',
    impact: '他说最先受影响的还是手头的活，之后才一点点渗进吃东西、走路和休息这些日常里。',
    environment: '他把门外的雨声、铁锈味和低频震动都回忆了一遍，但语气里还是分不清那到底只是环境，还是症状本身在串线。'
  }

  return templates[option?.id] || `${patient?.name || '患者'}沉默了一会儿，把刚才那种不对劲又补充得更细了一点，只是仍旧留着几处说不清的地方。`
}

function parseOptionPayload(text, recentDoctorLines = []) {
  const normalized = stripCodeFence(text)
  const arrayStart = normalized.indexOf('[')
  const arrayEnd = normalized.lastIndexOf(']')
  const cleaned = arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart
    ? normalized.slice(arrayStart, arrayEnd + 1)
    : normalized
  const parsed = JSON.parse(cleaned)

  if (!Array.isArray(parsed)) {
    throw new Error('选项返回格式错误。')
  }

  const selected = parsed
    .filter(item => item && typeof item === 'object')
    .map((item, index) => ({
      id: item.id || `dynamic-${index + 1}`,
      label: item.label || `问诊选项 ${index + 1}`,
      doctorLine: sanitizeDoctorLine(item.doctorLine || item.label || '再说细一点。', item.label || ''),
      promptFocus: item.promptFocus || '继续追问患者当前最明显的不适。'
    }))
    .filter((item, index, list) => {
      if (!item.doctorLine) return false
      return !isRepeatedQuestion(
        item.doctorLine,
        recentDoctorLines,
        list.slice(0, index).map(option => option.doctorLine)
      )
    })
    .slice(0, 4)

  if (selected.length >= 4) {
    return selected
  }

  const fallbackPool = buildFallbackOptions(recentDoctorLines)
  fallbackPool.forEach(item => {
    if (selected.length >= 4) return
    if (isRepeatedQuestion(item.doctorLine, recentDoctorLines, selected.map(option => option.doctorLine))) return
    selected.push(item)
  })

  return selected.slice(0, 4)
}

function buildGeneratedMappings(seed, rule = null) {
  const next = createEmptyMapping()

  if (!rule) {
    // 随机期：原有逻辑
    const sources = rotateArray(
      SENSE_CONFIGS.map(item => item.id), seed
    ).slice(0, seed % 2 === 0 ? 2 : 3)

    sources.forEach((sourceId, index) => {
      const candidates = rotateArray(SENSE_TARGETS[sourceId], seed + index + 1)
      next[sourceId] = candidates.slice(0, index % 2 === 0 ? 1 : 2)
    })

    return next
  }

  // 预设期：按规则生成
  const {
    minAbnormal,
    maxAbnormal,
    allowOneToMany,
    maxTargetsPerSource = 1
  } = rule

  const abnormalCount = minAbnormal === maxAbnormal
    ? minAbnormal
    : minAbnormal + (seed % (maxAbnormal - minAbnormal + 1))

  const shuffledSources = rotateArray(
    SENSE_CONFIGS.map(item => item.id), seed
  ).slice(0, abnormalCount)

  shuffledSources.forEach((sourceId, index) => {
    const candidates = rotateArray(SENSE_TARGETS[sourceId], seed + index + 1)
    next[sourceId] = allowOneToMany
      ? candidates.slice(0, maxTargetsPerSource)
      : candidates.slice(0, 1)
  })

  return next
}


export function useGameLogic() {
  const router = useRouter()

  const phase = ref('title')
  const consultStage = ref('arrival_intro')
  const consultEntryStage = ref('pre_consult')
  const hasSave = ref(false)
  const hasArchiveSave = ref(false)
  const isCheckingSave = ref(true)
  const showConfirmNewGameModal = ref(false)
  const showUpgradeFailureModal = ref(false)
  const upgradeFailureMessage = ref('')
  const showProfilePanel = ref(false)
  const isMobileLayout = ref(false)
  const equipmentExpanded = ref(true)
  const snapshotExpanded = ref(true)
  const showNotesDrawer = ref(false)
  const isGeneratingText = ref(false)
  const statusNotice = ref('')
  const narrativeError = ref('')
  const patientFeedbackText = ref('')
  const patientFeedbackOutcome = ref('')

  const backgroundPage = ref(0)
  const credits = ref(0)
  const earnedCreditsTotal = ref(0)
  const patientCount = ref(0)
  const gameDay = ref(1)
  const lastTimeSyncAt = ref(Date.now())
  const nextPatientSerial = ref(1)
  const patientSeedBase = ref(createPatientSeedBase())
  const environmentPhase = ref(1)
  const currentEnvironmentProfile = ref(null)
  const nowTick = ref(Date.now())
  const playerProfile = ref({ ...PLAYER_PROFILE })
  const equipmentOverview = ref(cloneEquipmentOverview())
  const waitingPatients = ref([])
  const lastQueueRollAt = ref(Date.now())

  const activePatient = ref(null)
  const consultationHistory = ref([])
  const consultOptions = ref(CONSULT_OPTION_LIBRARY.map(item => ({ ...item })))
  const consultNotes = ref('')
  const isConsultNarrativeReady = ref(false)
  const isConsultOptionsReady = ref(false)
  const diagnosisDraft = ref(createEmptyMapping())
  const confirmedDiagnosis = ref(createEmptyMapping())
  const diagnosisUsesLeft = ref(DIAGNOSIS_LIMIT)
  const treatmentDraft = ref(createEmptyMapping())
  const revisitQueue = ref([])
  const completedCases = ref([])
  const archiveSaves = ref([])
  const phoneMessages = ref([])
  const debtLedger = ref([])

  let autosaveTimer = null
  let queueTimer = null
  let consultRequestToken = 0
  let queueGenerationPromise = null

  function beginConsultRequest() {
    consultRequestToken += 1
    return consultRequestToken
  }

  function invalidateConsultRequest() {
    consultRequestToken += 1
  }

  function isCurrentConsultRequest(token) {
    return token === consultRequestToken
  }

  function updateDiagnosisUses(value) {
    const nextValue = clamp(Number(value) || 0, 0, DIAGNOSIS_LIMIT)
    diagnosisUsesLeft.value = nextValue

    if (activePatient.value) {
      activePatient.value.diagnosisUsesLeft = nextValue
    }
  }

  function collectExistingPatientReferences() {
    return [
      ...waitingPatients.value,
      ...completedCases.value,
      ...revisitQueue.value,
      activePatient.value
    ].filter(Boolean).map(item => ({
      name: item.name,
      job: item.job
    }))
  }

  function parseJsonObjectPayload(text, label = 'JSON') {
    const cleaned = stripCodeFence(String(text || '').trim())
    const objectStart = cleaned.indexOf('{')
    const objectEnd = cleaned.lastIndexOf('}')
    const payload = objectStart !== -1 && objectEnd !== -1
      ? cleaned.slice(objectStart, objectEnd + 1)
      : cleaned

    const parsed = JSON.parse(payload)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error(`${label} 返回格式错误。`)
    }

    return parsed
  }

  function normalizeGeneratedEnvironment(rawEnvironment = {}, fallbackPhase = null) {
    const name = String(rawEnvironment?.name || '').trim()
    const description = String(rawEnvironment?.description || '').trim()

    if (!name || !description) {
      throw new Error('AI 生成的环境信息不完整。')
    }

    return {
      id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      phase: fallbackPhase ?? Date.now(),
      name,
      description
    }
  }

  function normalizeGeneratedLevelMap(levelMap = {}, mapping = {}) {
    return normalizeMappingLevelsForPairs(levelMap, mapping)
  }

  function normalizeGeneratedPatientPayload(rawPatient, { serial, globalEnvironment, seedBase = 0 }) {
    const name = String(rawPatient?.name || '').trim()
    const job = String(rawPatient?.job || '').trim()
    const jobContext = String(rawPatient?.jobContext || '').trim()
    const attachment = String(rawPatient?.attachment || '').trim()
    const emotionalTone = String(rawPatient?.emotionalTone || '').trim()
    const speechStyle = String(rawPatient?.speechStyle || '').trim()

    if (!name || !job || !jobContext || !attachment || !emotionalTone || !speechStyle) {
      throw new Error('AI 生成的患者基础资料不完整。')
    }

    const environmentProfile = normalizeGeneratedEnvironment(
      rawPatient?.environment ?? globalEnvironment,
      Date.now() + serial
    )
    const generatedMappings = normalizeMapping(rawPatient?.originalMappings)

    if (isEmptyMapping(generatedMappings)) {
      throw new Error('AI 生成的患者病症为空。')
    }

    return {
      id: `synesthesia-patient-${serial}-${Date.now()}`,
      serial,
      name,
      job,
      jobContext,
      attachment,
      emotionalTone,
      speechStyle,
      visitCount: 1,
      environmentPhase: environmentProfile.phase,
      environmentProfile,
      diagnosisUsesLeft: DIAGNOSIS_LIMIT,
      hiddenMappings: cloneMapping(generatedMappings),
      originalMappings: cloneMapping(generatedMappings),
      initialMappingLevels: normalizeGeneratedLevelMap(rawPatient?.mappingLevels, generatedMappings),
      trackingSheet: null,
      trackingSheetReady: false,
      forceDebt: false,
      patientSeedBase: seedBase
    }
  }

  async function generateStructuredReply(prompt, label) {
    const reply = await aiService.generateReply(prompt, GENERATION_SYSTEM_PROMPT)
    return parseJsonObjectPayload(reply, label)
  }

  async function generateCurrentEnvironmentProfile(previousEnvironmentName = '') {
    const payload = await generateStructuredReply(
      buildEnvironmentGenerationPrompt({ previousEnvironmentName }),
      '环境信息'
    )
    return normalizeGeneratedEnvironment(payload, Date.now())
  }

  async function generatePatient(serial) {
    const existingPatients = collectExistingPatientReferences()
    const globalEnvironment = currentEnvironmentProfile.value ?? getEnvironmentByPhase(environmentPhase.value)
    let lastError = null

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const payload = await generateStructuredReply(
          buildPatientGenerationPrompt({
            serial,
            gameDay: gameDay.value,
            globalEnvironment,
            existingPatients
          }),
          '患者信息'
        )
        const patient = normalizeGeneratedPatientPayload(payload, {
          serial,
          globalEnvironment,
          seedBase: patientSeedBase.value
        })
        const hasDuplicate = existingPatients.some(item => item.name === patient.name || item.job === patient.job)

        if (hasDuplicate) {
          throw new Error('AI 生成了重复的名字或职业。')
        }

        return patient
      } catch (error) {
        lastError = error
      }
    }

    throw lastError || new Error('AI 生成患者失败。')
  }

  async function ensurePatientQueue(targetCount = 1) {
    const safeTarget = clamp(Number(targetCount) || 1, 1, 3)

    if (waitingPatients.value.length >= safeTarget) return

    if (!queueGenerationPromise) {
      queueGenerationPromise = (async () => {
        while (waitingPatients.value.length < safeTarget && waitingPatients.value.length < 3) {
          const patient = await generatePatient(nextPatientSerial.value)
          waitingPatients.value = [...waitingPatients.value, patient].slice(0, 3)
          nextPatientSerial.value += 1
        }
      })()
        .finally(() => {
          queueGenerationPromise = null
        })
    }

    await queueGenerationPromise

    if (waitingPatients.value.length < safeTarget) {
      await ensurePatientQueue(safeTarget)
    }
  }

  function drawFromPool(poolRef, sourceList) {
    if (!Array.isArray(sourceList) || !sourceList.length) return null

    const pool = normalizeIndexPool(poolRef.value, sourceList.length)
    const [nextIndex, ...rest] = pool

    poolRef.value = rest.length
      ? rest
      : createIndexPool(sourceList.length, nextIndex)

    return sourceList[nextIndex] ?? sourceList[0]
  }

  function drawPatientName() {
    return drawFromPool(availablePatientNameIndexes, PATIENT_NAME_POOL) || PATIENT_NAME_POOL[0]
  }

  function drawPatientJob() {
    return drawFromPool(availablePatientJobIndexes, PATIENT_JOB_POOL) || PATIENT_JOB_POOL[0]
  }

  function drawPatientEnvironmentPhase() {
    const environment = drawFromPool(availablePatientEnvironmentIndexes, ENVIRONMENT_PHASES)
    return environment?.phase ?? ENVIRONMENT_PHASES[0]?.phase ?? 1
  }

  function createPatient(serial, envPhase, seedBase = 0) {
  // ✅ 查预设规则表
  const rule = getPresetRule(serial)

  const nextEnvironmentPhase = ENVIRONMENT_PHASES.some(item => item.phase === envPhase)
    ? envPhase
    : drawPatientEnvironmentPhase()
  const variantOffset  = Math.abs(Number(seedBase) || 0) + Math.floor(Math.random() * 1000000)
  const attachmentSeed = variantOffset + (serial * 11) + (nextEnvironmentPhase * 5)
  const toneSeed       = variantOffset + (serial * 3)  + (nextEnvironmentPhase * 7)
  const speechSeed     = variantOffset + (serial * 2)  + (nextEnvironmentPhase * 11) + Math.floor(serial / 2)
  const job            = drawPatientJob()
  const name           = drawPatientName()

  // ✅ 传入 rule，预设期按规则生成，随机期走原有逻辑
  const generatedMappings = buildGeneratedMappings(
    variantOffset + (serial * 11) + (nextEnvironmentPhase * 13),
    rule
  )

  const patient = {
    id:               `synesthesia-patient-${serial}-${Date.now()}`,
    serial,
    name,
    job:              job.title,
    jobContext:       job.context,
    attachment:       pickFrom(PATIENT_ATTACHMENT_POOL, attachmentSeed),
    emotionalTone:    pickFrom(PATIENT_TONE_POOL, toneSeed),
    speechStyle:      pickFrom(PATIENT_SPEECH_STYLE_POOL, speechSeed),
    visitCount:       1,
    environmentPhase: nextEnvironmentPhase,
    diagnosisUsesLeft: DIAGNOSIS_LIMIT,
    hiddenMappings:   cloneMapping(generatedMappings),
    originalMappings: cloneMapping(generatedMappings),
    trackingSheet:    null,
    trackingSheetReady: false,

    // ✅ 预设期专属字段
    isPreset:           !!rule,
    isUpgradeTutorial:  rule?.isUpgradeTutorial ?? false,
    forceDebt:          rule?.forceDebt ?? false
  }

  // ✅ 提前生成等级表，追踪表生成时使用
  return patient
}


  function maybeShiftEnvironment(daysPassed = 1) {
    let nextPhase = environmentPhase.value

    for (let index = 0; index < daysPassed; index += 1) {
      const seed = gameDay.value + index + nextPatientSerial.value
      if (seed % 100 < 42) {
        nextPhase = pickRandomEnvironmentPhase(nextPhase)
      }
    }

    environmentPhase.value = nextPhase
  }

  async function refreshPatientQueue(targetCount = 3) {
    await ensurePatientQueue(targetCount)
    lastQueueRollAt.value = Date.now()
    nowTick.value = Date.now()
  }

  function ensureQueueTimer() {
    if (queueTimer) clearInterval(queueTimer)

    queueTimer = setInterval(() => {
      if (phase.value === 'title' || phase.value === 'consult' || phase.value === 'treatment' || phase.value === 'patient_feedback') return
      refreshPatientQueue(3)
        .then(() => scheduleProgressSave())
        .catch(error => {
          console.warn('Synesthesia 患者队列生成失败:', error)
        })
    }, 60000)
  }

  function popWaitingPatient() {
    if (!waitingPatients.value.length) return null

    const [nextPatient, ...rest] = waitingPatients.value
    waitingPatients.value = rest
    refreshPatientQueue(3).catch(error => {
      console.warn('Synesthesia 患者补位失败:', error)
    })
    return clonePatient(nextPatient)
  }

  function buildCompletedCaseRecord(outcome, extras = {}) {
    if (!activePatient.value) return null

    const base = {
      id: `${activePatient.value.id}-${Date.now()}`,
      patientId: activePatient.value.id,
      name: activePatient.value.name,
      job: activePatient.value.job,
      gameDay: gameDay.value,
      visitCount: activePatient.value.visitCount,
      unresolvedSummary: formatMappingSummary(activePatient.value.hiddenMappings),
      consultationHistory: consultationHistory.value.map(item => ({ ...item })),
      trackingSheet: cloneTrackingSheet(activePatient.value.trackingSheet),
      settlementItems: Array.isArray(extras.settlementItems) ? extras.settlementItems.map(item => ({ ...item })) : [],
      settlementTotal: Number(extras.settlementTotal || 0),
      collectedTotal: Number(extras.collectedTotal ?? extras.settlementTotal ?? 0),
      paymentMode: extras.paymentMode || 'paid',
      feedbackText: extras.feedbackText || ''
    }

    if (outcome === 'complete') {
      return {
        ...base,
        outcome,
        outcomeLabel: '完全治愈',
        summary: '本次治疗已让患者当前的感官错位全部归位。'
      }
    }

    return {
      ...base,
      outcome,
      outcomeLabel: '预约复诊',
      returnDay: gameDay.value + REVISIT_DELAY_DAYS,
      summary: '本次治疗只稳定住部分问题，剩余异常将在后续复诊中继续处理。'
    }
  }

  function pushCompletedCase(record) {
    if (!record) return

    completedCases.value = [record, ...completedCases.value].slice(0, 8)
  }

  function pushPhoneMessage(message) {
    if (!message) return

    phoneMessages.value = [message, ...phoneMessages.value].slice(0, 40)
  }

  function markPhoneMessagesRead() {
    phoneMessages.value = phoneMessages.value.map(item => ({ ...item, read: true }))
    scheduleProgressSave()
  }

  function maybeCreateDebtRecord(patient, amount) {
    if (!patient || amount <= 0) return null
    if (Math.random() >= DEBT_BORROW_PROBABILITY) return null

    const record = {
      id: `debt-${patient.id}-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      amount,
      createdDay: gameDay.value,
      lastCheckedDay: gameDay.value,
      paidDay: null,
      status: 'pending'
    }

    debtLedger.value = [record, ...debtLedger.value]
    pushPhoneMessage(makePhoneMessage({
      sender: patient.name,
      title: '赊账申请',
      text: `我这边今天只能先记账。这次诊疗先欠你 ${amount} 信用点，等手头缓过来会补上。`,
      gameDay: gameDay.value,
      type: 'debt'
    }))

    return record
  }

  function createForcedDebtRecord(patient, amount) {
  if (!patient || amount <= 0) return null

  const record = {
    id:              `debt-${patient.id}-${Date.now()}`,
    patientId:       patient.id,
    patientName:     patient.name,
    amount,
    createdDay:      gameDay.value,
    lastCheckedDay:  gameDay.value,
    paidDay:         null,
    status:          'pending'
  }

  debtLedger.value = [record, ...debtLedger.value]
  pushPhoneMessage(makePhoneMessage({
    sender:  patient.name,
    title:   '赊账申请',
    text:    `手头实在紧，今天先欠你 ${amount} 信用点。不会不还的。`,
    gameDay: gameDay.value,
    type:    'debt'
  }))

  return record
}

  function processDebtRepaymentForDay(targetDay) {
    let repaidCount = 0

    debtLedger.value = debtLedger.value.map(record => {
      if (!record || record.status !== 'pending') return record
      if (targetDay <= Number(record.lastCheckedDay || record.createdDay || 0)) return record

      const nextRecord = {
        ...record,
        lastCheckedDay: targetDay
      }

      if (Math.random() < DEBT_REPAY_DAILY_PROBABILITY) {
        nextRecord.status = 'paid'
        nextRecord.paidDay = targetDay
        credits.value += Number(record.amount || 0)
        earnedCreditsTotal.value += Number(record.amount || 0)
        repaidCount += 1

        pushPhoneMessage(makePhoneMessage({
          sender: '下城区支付终端',
          title: '到账提醒',
          text: `${record.patientName} 已补付之前欠下的 ${record.amount} 信用点。款项已经打进诊所账户。`,
          gameDay: targetDay,
          type: 'payment'
        }))
      }

      return nextRecord
    })

    return repaidCount
  }

  function resetCaseState() {
    consultStage.value = 'arrival_intro'
    consultEntryStage.value = 'pre_consult'
    consultationHistory.value = []
    consultOptions.value = CONSULT_OPTION_LIBRARY.map(item => ({ ...item }))
    consultNotes.value = ''
    isConsultNarrativeReady.value = false
    isConsultOptionsReady.value = false
    diagnosisDraft.value = createEmptyMapping()
    confirmedDiagnosis.value = createEmptyMapping()
    updateDiagnosisUses(DIAGNOSIS_LIMIT)
    treatmentDraft.value = createEmptyMapping()
    patientFeedbackText.value = ''
    patientFeedbackOutcome.value = ''
    narrativeError.value = ''
    showNotesDrawer.value = false
  }

  function clearActiveCase() {
    activePatient.value = null
    resetCaseState()
  }

  function buildSavePayload() {
    return {
      phase: phase.value,
      consultStage: consultStage.value,
      consultEntryStage: consultEntryStage.value,
      backgroundPage: backgroundPage.value,
      credits: credits.value,
      earnedCreditsTotal: earnedCreditsTotal.value,
      patientCount: patientCount.value,
      gameDay: gameDay.value,
      lastTimeSyncAt: lastTimeSyncAt.value,
      nextPatientSerial: nextPatientSerial.value,
      patientSeedBase: patientSeedBase.value,
      environmentPhase: environmentPhase.value,
      currentEnvironmentProfile: cloneEnvironmentProfile(currentEnvironmentProfile.value),
      playerProfile: { ...playerProfile.value },
      equipmentOverview: cloneEquipmentOverview(equipmentOverview.value),
      waitingPatients: waitingPatients.value.map(item => clonePatient(item)),
      lastQueueRollAt: lastQueueRollAt.value,
      activePatient: clonePatient(activePatient.value),
      consultationHistory: consultationHistory.value.map(item => ({ ...item })),
      consultOptions: consultOptions.value.map(item => ({ ...item })),
      consultNotes: consultNotes.value,
      isConsultNarrativeReady: isConsultNarrativeReady.value,
      isConsultOptionsReady: isConsultOptionsReady.value,
      phoneMessages: phoneMessages.value.map(item => clonePhoneMessage(item)),
      debtLedger: debtLedger.value.map(item => cloneDebtRecord(item)),
      diagnosisDraft: cloneMapping(diagnosisDraft.value),
      confirmedDiagnosis: cloneMapping(confirmedDiagnosis.value),
      diagnosisUsesLeft: diagnosisUsesLeft.value,
      treatmentDraft: cloneMapping(treatmentDraft.value),
      revisitQueue: revisitQueue.value.map(item => clonePatient(item)),
      completedCases: completedCases.value.map(item => cloneCompletedCase(item))
    }
  }

  async function saveProgress() {
    await saveService.save(SCRIPT_ID, buildSavePayload())
    hasSave.value = true
  }

  function scheduleProgressSave() {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
    }

    autosaveTimer = setTimeout(() => {
      saveProgress().catch(error => {
        console.warn('Synesthesia 自动保存失败:', error)
      })
      autosaveTimer = null
    }, AUTOSAVE_DELAY)
  }

  function applyGameState(rawState = {}) {
    const fallback = buildDefaultGameState()
    const nextPhase = VALID_PHASES.includes(rawState.phase) ? rawState.phase : fallback.phase
    const nextConsultStage = VALID_CONSULT_STAGES.includes(rawState.consultStage)
      ? rawState.consultStage
      : fallback.consultStage
    const nextConsultEntryStage = VALID_CONSULT_ENTRY_STAGES.includes(rawState.consultEntryStage)
      ? rawState.consultEntryStage
      : fallback.consultEntryStage

    phase.value = nextPhase
    consultStage.value = nextConsultStage
    consultEntryStage.value = nextConsultEntryStage
    backgroundPage.value = clamp(Number(rawState.backgroundPage ?? fallback.backgroundPage), 0, BACKGROUND_PAGES.length - 1)
    credits.value = Number.isFinite(rawState.credits) ? rawState.credits : fallback.credits
    earnedCreditsTotal.value = Number.isFinite(rawState.earnedCreditsTotal)
      ? rawState.earnedCreditsTotal
      : (Array.isArray(rawState.completedCases)
        ? rawState.completedCases.reduce((sum, item) => sum + Number(item?.settlementTotal || 0), 0)
        : 0)
    patientCount.value = Number.isFinite(rawState.patientCount) ? rawState.patientCount : fallback.patientCount
    gameDay.value = Math.max(1, Number(rawState.gameDay ?? fallback.gameDay) || 1)
    lastTimeSyncAt.value = Number.isFinite(rawState.lastTimeSyncAt) ? rawState.lastTimeSyncAt : fallback.lastTimeSyncAt
    nextPatientSerial.value = Math.max(1, Number(rawState.nextPatientSerial ?? fallback.nextPatientSerial) || 1)
    patientSeedBase.value = Number.isFinite(rawState.patientSeedBase) ? rawState.patientSeedBase : fallback.patientSeedBase
    environmentPhase.value = ENVIRONMENT_PHASES.some(item => item.phase === rawState.environmentPhase)
      ? rawState.environmentPhase
      : fallback.environmentPhase
    currentEnvironmentProfile.value = cloneEnvironmentProfile(rawState.currentEnvironmentProfile)

    playerProfile.value = {
      ...PLAYER_PROFILE,
      ...(rawState.playerProfile ?? {})
    }

    equipmentOverview.value = Array.isArray(rawState.equipmentOverview) && rawState.equipmentOverview.length > 0
      ? cloneEquipmentOverview(rawState.equipmentOverview)
      : cloneEquipmentOverview()
    waitingPatients.value = Array.isArray(rawState.waitingPatients)
      ? rawState.waitingPatients.map(item => clonePatient(item)).filter(Boolean).slice(0, 3)
      : []
    lastQueueRollAt.value = Number.isFinite(rawState.lastQueueRollAt) ? rawState.lastQueueRollAt : Date.now()

    activePatient.value = clonePatient(rawState.activePatient)
    if (activePatient.value && !activePatient.value.trackingSheet) {
      const patientEnvironment = cloneEnvironmentProfile(activePatient.value.environmentProfile)
        ?? cloneEnvironmentProfile(currentEnvironmentProfile.value)
        ?? getEnvironmentByPhase(activePatient.value.environmentPhase ?? environmentPhase.value)
      activePatient.value.trackingSheet = buildFallbackTrackingSheet(activePatient.value, patientEnvironment)
    }
    consultationHistory.value = sanitizeHistoryEntries(rawState.consultationHistory)
    consultOptions.value = Array.isArray(rawState.consultOptions) && rawState.consultOptions.length
      ? rawState.consultOptions.map(item => ({ ...item }))
      : getConsultOptions()
    consultNotes.value = typeof rawState.consultNotes === 'string' ? rawState.consultNotes : ''
    isConsultNarrativeReady.value = Boolean(rawState.isConsultNarrativeReady)
    isConsultOptionsReady.value = Boolean(rawState.isConsultOptionsReady)
    phoneMessages.value = Array.isArray(rawState.phoneMessages)
      ? rawState.phoneMessages.map(item => clonePhoneMessage(item)).filter(Boolean)
      : []
    debtLedger.value = Array.isArray(rawState.debtLedger)
      ? rawState.debtLedger.map(item => cloneDebtRecord(item)).filter(Boolean)
      : []
    diagnosisDraft.value = normalizeMapping(rawState.diagnosisDraft)
    confirmedDiagnosis.value = normalizeMapping(rawState.confirmedDiagnosis)
    updateDiagnosisUses(rawState.diagnosisUsesLeft ?? activePatient.value?.diagnosisUsesLeft ?? DIAGNOSIS_LIMIT)
    treatmentDraft.value = normalizeMapping(rawState.treatmentDraft)
    revisitQueue.value = sortRevisitQueue(
      Array.isArray(rawState.revisitQueue)
        ? rawState.revisitQueue.map(item => {
          const patient = clonePatient(item)
          if (patient && !patient.trackingSheet) {
            const patientEnvironment = cloneEnvironmentProfile(patient.environmentProfile)
              ?? cloneEnvironmentProfile(currentEnvironmentProfile.value)
              ?? getEnvironmentByPhase(patient.environmentPhase ?? environmentPhase.value)
            patient.trackingSheet = buildFallbackTrackingSheet(patient, patientEnvironment)
          }
          return patient
        })
        : []
    )
    completedCases.value = Array.isArray(rawState.completedCases)
      ? rawState.completedCases.map(item => cloneCompletedCase(item)).filter(Boolean)
      : []

    if ((phase.value === 'consult' || phase.value === 'treatment' || phase.value === 'patient_feedback') && !activePatient.value) {
      phase.value = 'hub'
      resetCaseState()
    }
  }

  function settleElapsedGameTime(savedState) {
    const hasActiveCase = !!savedState?.activePatient && ['consult', 'treatment', 'patient_feedback'].includes(savedState?.phase)

    if (hasActiveCase) {
      lastTimeSyncAt.value = Date.now()
      return 0
    }

    const previousSyncAt = Number(savedState?.lastTimeSyncAt)

    if (!previousSyncAt) {
      lastTimeSyncAt.value = Date.now()
      return 0
    }

    const elapsed = Math.max(0, Date.now() - previousSyncAt)
    const passedDays = Math.floor(elapsed / REAL_MS_PER_GAME_DAY)

    if (passedDays > 0) {
      const startDay = gameDay.value
      gameDay.value += passedDays
      for (let offset = 1; offset <= passedDays; offset += 1) {
        processDebtRepaymentForDay(startDay + offset)
      }
    }

    lastTimeSyncAt.value = Date.now()

    return passedDays
  }

  async function syncSaveStatus() {
    try {
      const saved = await saveService.load(SCRIPT_ID)
      archiveSaves.value = await saveService.getSavesByPrefix(ARCHIVE_PREFIX)
      hasSave.value = !!saved
      hasArchiveSave.value = archiveSaves.value.length > 0
    } catch (error) {
      console.error('Synesthesia 存档状态检查失败:', error)
      hasSave.value = false
      hasArchiveSave.value = false
      archiveSaves.value = []
    } finally {
      isCheckingSave.value = false
    }
  }

  async function executeStartNewGame() {
    const previousEnvironmentName = currentEnvironmentProfile.value?.name || ''
    const snapshot = buildDefaultGameState()
    applyGameState(snapshot)
    phase.value = 'background_intro'
    lastTimeSyncAt.value = Date.now()
    waitingPatients.value = []
    currentEnvironmentProfile.value = await generateCurrentEnvironmentProfile(previousEnvironmentName)
    environmentPhase.value = currentEnvironmentProfile.value.phase
    await refreshPatientQueue(3)
    statusNotice.value = ''
    await saveProgress()
  }

  async function startNewGame() {
    if (hasSave.value) {
      showConfirmNewGameModal.value = true
      return
    }

    await executeStartNewGame()
  }

  async function confirmStartNewGame() {
    showConfirmNewGameModal.value = false
    const currentSave = await saveService.load(SCRIPT_ID)
    if (currentSave) {
      await saveService.saveArchive(SCRIPT_ID, currentSave, `synesthesia-${new Date().toISOString()}`)
    }
    await saveService.deleteSave(SCRIPT_ID)
    hasSave.value = false
    archiveSaves.value = await saveService.getSavesByPrefix(ARCHIVE_PREFIX)
    hasArchiveSave.value = archiveSaves.value.length > 0
    await executeStartNewGame()
  }

  function cancelStartNewGame() {
    showConfirmNewGameModal.value = false
  }

  async function restoreFromSave(saved) {
    applyGameState(saved)

    const passedDays = settleElapsedGameTime(saved)
    narrativeError.value = ''
    if (waitingPatients.value.some(patient => !patient?.environmentProfile || !patient?.initialMappingLevels)) {
      waitingPatients.value = []
    }
    if (!currentEnvironmentProfile.value) {
      currentEnvironmentProfile.value = await generateCurrentEnvironmentProfile('')
      environmentPhase.value = currentEnvironmentProfile.value.phase
    } else if (passedDays > 0) {
      currentEnvironmentProfile.value = await generateCurrentEnvironmentProfile(currentEnvironmentProfile.value.name)
      environmentPhase.value = currentEnvironmentProfile.value.phase
    }
    await refreshPatientQueue(3)

    if (passedDays > 0) {
      statusNotice.value = `离线期间过去了 ${passedDays} 个游戏日。`
    } else {
      statusNotice.value = ''
    }
  }

  async function continueGame() {
    if (!hasSave.value) return

    try {
      const saved = await saveService.load(SCRIPT_ID)

      if (!saved) {
        hasSave.value = false
        return
      }

      await restoreFromSave(saved)

      if (phase.value === 'background_intro' || phase.value === 'title') {
        phase.value = 'hub'
        await saveProgress()
      }
    } catch (error) {
      console.error('Synesthesia 读取存档失败:', error)
      hasSave.value = false
    }
  }

  async function loadArchivedGame() {
    if (!archiveSaves.value.length) return

    try {
      const latestArchive = archiveSaves.value[0]
      const saved = await saveService.loadById(latestArchive.scriptId)
      if (!saved) return
      await restoreFromSave(saved)
    } catch (error) {
      console.error('Synesthesia 读取归档存档失败:', error)
    }
  }

  async function goHome() {
    if (phase.value !== 'title') {
      try {
        await saveProgress()
      } catch (error) {
        console.warn('Synesthesia 离开前保存失败:', error)
      }
    }

    router.push('/')
  }

  async function returnToHub() {
    invalidateConsultRequest()
    isGeneratingText.value = false

    if (consultEntryStage.value === 'questioning') {
      isConsultNarrativeReady.value = consultationHistory.value.length > 0
      isConsultOptionsReady.value = consultOptions.value.length > 0
    }

    if (consultEntryStage.value === 'entering_consult') {
      if (consultationHistory.value.length) {
        consultEntryStage.value = 'questioning'
        consultStage.value = 'questioning'
        isConsultNarrativeReady.value = true
        if (!consultOptions.value.length) {
          const recentDoctorLines = consultationHistory.value
            .filter(item => item?.speaker === 'doctor')
            .slice(-3)
            .map(item => item.text)
          consultOptions.value = buildFallbackOptions(recentDoctorLines)
        }
        isConsultOptionsReady.value = consultOptions.value.length > 0
      } else {
        consultEntryStage.value = 'pre_consult'
        consultStage.value = 'arrival_intro'
        isConsultNarrativeReady.value = false
        isConsultOptionsReady.value = false
      }
    }

    phase.value = 'hub'
    statusNotice.value = ''

    try {
      await saveProgress()
    } catch (error) {
      console.warn('Synesthesia 返回 hub 前保存失败:', error)
    }
  }

  function returnToTitle() {
    phase.value = 'title'
    statusNotice.value = ''
    narrativeError.value = ''
  }

  async function goToNextBackgroundPage() {
    if (backgroundPage.value < BACKGROUND_PAGES.length - 1) {
      backgroundPage.value += 1
      await saveProgress()
      return
    }

    phase.value = 'hub'
    await saveProgress()
  }

  async function goToPrevBackgroundPage() {
    if (backgroundPage.value > 0) {
      backgroundPage.value -= 1
      await saveProgress()
      return
    }

    returnToTitle()
  }

  async function saveManualProgress() {
    await saveProgress()
    statusNotice.value = '当前阶段已保存。'
  }

  function toggleProfilePanel() {
    showProfilePanel.value = !showProfilePanel.value
  }

  async function updatePlayerName(name) {
    playerProfile.value = {
      ...playerProfile.value,
      title: String(name || '').trim() || PLAYER_PROFILE.title
    }
    await saveProgress()
  }

  async function updatePlayerAvatar(dataUrl) {
    playerProfile.value = {
      ...playerProfile.value,
      avatar: dataUrl || ''
    }
    await saveProgress()
  }

  async function generateTrackingSheet(patient) {
    if (!patient) return null

    const environment = activeEnvironment.value
    const fallbackSheet = buildFallbackTrackingSheet(patient, environment)

    try {
      const prompt = buildTrackingSheetPrompt({
        patient,
        environment,
        estimatedIncome: fallbackSheet.estimatedIncome
      })
      const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
      const parsedSheet = parseTrackingSheetPayload(reply)
      return normalizeTrackingSheet(parsedSheet, patient, environment)
    } catch (error) {
      console.warn('Synesthesia 后台追踪表生成失败，使用兜底表:', error)
      return fallbackSheet
    }
  }

  async function generateArrivalNarrative(requestToken = null) {
    if (!activePatient.value) return

    narrativeError.value = ''

    try {
      const prompt = buildArrivalPrompt({
        patient: activePatient.value,
        environment: activeEnvironment.value,
        trackingSheet: activePatient.value.trackingSheet
      })
      const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
      const trimmed = reply?.trim()

      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return
      }

      if (!trimmed) {
        throw new Error('AI 返回了空白内容。')
      }

      const safeText = sanitizeNarrativeReply(trimmed) || buildFallbackArrivalText(activePatient.value, activeEnvironment.value)

      consultationHistory.value = [
        makeHistoryEntry({
          speaker: 'narrator',
          label: activePatient.value.visitCount > 1 ? '复诊来访' : '到诊记录',
          text: safeText,
          type: 'arrival'
        })
      ]
    } catch (error) {
      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return
      }
      narrativeError.value = normalizeNarrativeError(error)
    }
  }

  function pullDueRevisitPatient() {
    const dueIndex = revisitQueue.value.findIndex(item => Number(item.returnDay) <= gameDay.value)

    if (dueIndex === -1) return null

    const [patient] = revisitQueue.value.splice(dueIndex, 1)
    let revisitingPatient = clonePatient(patient)
    const revisitEnvironment = cloneEnvironmentProfile(currentEnvironmentProfile.value) ?? getEnvironmentByPhase(environmentPhase.value)

    revisitingPatient.visitCount = Number(revisitingPatient.visitCount || 1) + 1
    revisitingPatient.environmentPhase = revisitEnvironment.phase
    revisitingPatient.environmentProfile = cloneEnvironmentProfile(revisitEnvironment)
    revisitingPatient.returnDay = null
    if (revisitingPatient.trackingSheet) {
      revisitingPatient.trackingSheet.patientProfile.visitCount = revisitingPatient.visitCount
    }
    revisitingPatient = applyRevisitMutation(revisitingPatient, revisitEnvironment, gameDay.value)

    return revisitingPatient
  }

  async function startPatientFlow() {
    if (isGeneratingText.value) return

    if (activePatient.value) {
      phase.value = 'consult'
      statusNotice.value = '继续上次诊断。'
      await saveProgress()
      return
    }

    resetCaseState()

    const revisitingPatient = pullDueRevisitPatient()
    if (!revisitingPatient) {
      await refreshPatientQueue(1)
    }
    const nextPatient = revisitingPatient || popWaitingPatient()

    if (!nextPatient) {
      statusNotice.value = '当前还没有患者到诊，门外暂时安静。'
      await saveProgress()
      return
    }

    nextPatient.trackingSheet = revisitingPatient?.trackingSheet
      ? cloneTrackingSheet(revisitingPatient.trackingSheet)
      : buildFallbackTrackingSheet(
        nextPatient,
        cloneEnvironmentProfile(nextPatient.environmentProfile) ?? currentEnvironment.value
      )
    nextPatient.trackingSheetReady = Boolean(revisitingPatient?.trackingSheet)
    activePatient.value = nextPatient
    updateDiagnosisUses(nextPatient.diagnosisUsesLeft)
    consultStage.value = 'arrival_intro'
    consultEntryStage.value = 'pre_consult'
    phase.value = 'consult'
    isConsultNarrativeReady.value = false
    isConsultOptionsReady.value = false
    statusNotice.value = revisitingPatient ? `复诊患者 ${nextPatient.name} 已到诊。` : '新的患者已经到诊。'

    await saveProgress()
  }

  async function continueConsultFlow() {
    if (!activePatient.value || isGeneratingText.value || consultEntryStage.value !== 'pre_consult') return

    const requestToken = beginConsultRequest()
    consultEntryStage.value = 'entering_consult'
    consultStage.value = 'arrival_intro'
    isConsultNarrativeReady.value = false
    isConsultOptionsReady.value = false
    isGeneratingText.value = true
    narrativeError.value = ''
    await saveProgress()

    try {
      if (activePatient.value && !activePatient.value.trackingSheetReady) {
        const generatedTrackingSheet = await generateTrackingSheet(activePatient.value)
        if (!isCurrentConsultRequest(requestToken)) return

        activePatient.value.trackingSheet = generatedTrackingSheet
        activePatient.value.trackingSheetReady = true
      }

      await generateArrivalNarrative(requestToken)
      if (!isCurrentConsultRequest(requestToken)) return

      isConsultNarrativeReady.value = consultationHistory.value.length > 0

      if (!isConsultNarrativeReady.value) {
        consultEntryStage.value = 'pre_consult'
        return
      }

      await refreshConsultOptions(requestToken)
      if (!isCurrentConsultRequest(requestToken)) return

      isConsultOptionsReady.value = consultOptions.value.length > 0
      consultEntryStage.value = 'questioning'
      consultStage.value = 'questioning'
    } finally {
      if (isCurrentConsultRequest(requestToken)) {
        isGeneratingText.value = false
        await saveProgress()
      }
    }
  }

  function getConsultOptions() {
    return CONSULT_OPTION_LIBRARY.map((option, index) => ({
      id: option.id || `library-${index + 1}`,
      label: option.label || `问诊选项 ${index + 1}`,
      doctorLine: sanitizeDoctorLine(option.doctorLine || option.label || '再说细一点。', option.label || ''),
      promptFocus: option.promptFocus || '继续追问患者当前最明显的不适。'
    }))
  }

  async function refreshConsultOptions(requestToken = null) {
    if (!activePatient.value) {
      consultOptions.value = CONSULT_OPTION_LIBRARY.map(item => ({ ...item }))
      return consultOptions.value
    }

    const recentDoctorLines = consultationHistory.value
      .filter(item => item?.speaker === 'doctor')
      .slice(-3)
      .map(item => item.text)

    try {
      const prompt = buildConsultOptionsPrompt({
        patient: activePatient.value,
        environment: activeEnvironment.value,
        trackingSheet: activePatient.value.trackingSheet,
        consultationHistory: consultationHistory.value,
        consultNotes: consultNotes.value,
        diagnosisDraft: diagnosisDraft.value,
        confirmedDiagnosis: confirmedDiagnosis.value
      })
      const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return []
      }

      const parsedOptions = parseOptionPayload(reply, recentDoctorLines)

      if (parsedOptions.length >= 3) {
        consultOptions.value = parsedOptions
        return consultOptions.value
      }
    } catch (error) {
      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return []
      }
      console.warn('Synesthesia 问诊选项生成失败，使用兜底选项:', error)
    }

    consultOptions.value = buildFallbackOptions(recentDoctorLines)
    return consultOptions.value
  }

  async function chooseConsultOption(option) {
    if (!activePatient.value || isGeneratingText.value) return

    const requestToken = beginConsultRequest()
    const historyBeforeChoice = [...consultationHistory.value]
    const doctorEntry = makeHistoryEntry({
      speaker: 'doctor',
      label: '问诊',
      text: option.doctorLine,
      type: 'question'
    })

    consultStage.value = 'questioning'
    consultEntryStage.value = 'questioning'
    isGeneratingText.value = true
    isConsultNarrativeReady.value = false
    isConsultOptionsReady.value = false
    narrativeError.value = ''

    try {
      const prompt = buildConsultReplyPrompt({
        patient: activePatient.value,
        environment: activeEnvironment.value,
        trackingSheet: activePatient.value.trackingSheet,
        option,
        consultationHistory: [
          ...historyBeforeChoice,
          doctorEntry
        ],
        consultNotes: consultNotes.value,
        diagnosisDraft: diagnosisDraft.value,
        confirmedDiagnosis: confirmedDiagnosis.value
      })
      const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
      const trimmed = reply?.trim()

      if (!isCurrentConsultRequest(requestToken)) return

      if (!trimmed) {
        throw new Error('AI 返回了空白内容。')
      }

      const safeText = sanitizeNarrativeReply(trimmed) || buildFallbackPatientReply(activePatient.value, option)

      consultationHistory.value = [
        ...historyBeforeChoice,
        doctorEntry,
        makeHistoryEntry({
          speaker: 'patient',
          label: activePatient.value.name,
          text: safeText,
          type: 'answer'
        })
      ]
      isConsultNarrativeReady.value = true
    } catch (error) {
      if (!isCurrentConsultRequest(requestToken)) return
      narrativeError.value = normalizeNarrativeError(error)
    } finally {
      if (!isCurrentConsultRequest(requestToken)) return

      await refreshConsultOptions(requestToken)
      isConsultOptionsReady.value = consultOptions.value.length > 0
      isGeneratingText.value = false
      await saveProgress()
    }
  }

  function toggleMappingTarget(mappingRef, sourceId, targetId) {
    const nextMapping = cloneMapping(mappingRef.value)
    const currentTargets = new Set(nextMapping[sourceId])

    if (currentTargets.has(targetId)) {
      nextMapping[sourceId] = nextMapping[sourceId].filter(item => item !== targetId)
    } else {
      nextMapping[sourceId] = [...nextMapping[sourceId], targetId]
    }

    mappingRef.value = nextMapping
    scheduleProgressSave()
  }

  function toggleDiagnosisTarget(sourceId, targetId) {
    toggleMappingTarget(diagnosisDraft, sourceId, targetId)
  }

  function toggleTreatmentTarget(sourceId, targetId) {
    if (!isTreatmentOptionEnabled(sourceId, targetId)) return
    toggleMappingTarget(treatmentDraft, sourceId, targetId)
  }

  function handleConsultNotesInput() {
    scheduleProgressSave()
  }

  async function submitDiagnosis() {
    if (!activePatient.value || diagnosisUsesLeft.value <= 0 || isEmptyMapping(diagnosisDraft.value)) return

    updateDiagnosisUses(diagnosisUsesLeft.value - 1)

    const referenceMappings = activePatient.value.trackingSheet?.unresolvedMappings ?? activePatient.value.hiddenMappings
    const matched = intersectMappings(diagnosisDraft.value, referenceMappings)
    const previousConfirmed = cloneMapping(confirmedDiagnosis.value)
    const nextConfirmed = mergeMappings(previousConfirmed, matched)
    const newlyConfirmed = subtractMappings(nextConfirmed, previousConfirmed)

    confirmedDiagnosis.value = nextConfirmed
    treatmentDraft.value = mergeMappings(treatmentDraft.value, nextConfirmed)
    if (activePatient.value.trackingSheet) {
      activePatient.value.trackingSheet.confirmedMappings = cloneMapping(nextConfirmed)
    }

    consultationHistory.value = [
      ...consultationHistory.value,
      makeHistoryEntry({
        speaker: 'system',
        label: '诊断仪',
        text: countMappings(newlyConfirmed) > 0
          ? `诊断仪亮起新的确认标记：${formatMappingSummary(newlyConfirmed)}。`
          : '诊断仪本次没有形成新的有效确认。',
        type: 'diagnosis'
      })
    ]

    statusNotice.value = countMappings(newlyConfirmed) > 0
      ? `诊断仪确认了 ${countMappings(newlyConfirmed)} 条映射。`
      : '本次诊断没有新增确认结果。'

    await saveProgress()
  }

  async function openTreatmentScreen() {
    if (!activePatient.value || isEmptyMapping(confirmedDiagnosis.value)) return

    treatmentDraft.value = intersectMappings(mergeMappings(treatmentDraft.value, confirmedDiagnosis.value), confirmedDiagnosis.value)
    phase.value = 'treatment'
    statusNotice.value = ''
    await saveProgress()
  }

  async function returnToConsult() {
    phase.value = 'consult'
    consultStage.value = 'questioning'
    await saveProgress()
  }

  async function generateTreatmentFeedback({ resolvedMappings, remainingMappings, outcome }) {
    if (!activePatient.value) return

    isGeneratingText.value = true
    narrativeError.value = ''

    try {
      const prompt = buildTreatmentFeedbackPrompt({
        patient: activePatient.value,
        environment: activeEnvironment.value,
        trackingSheet: activePatient.value.trackingSheet,
        treatmentDraft: treatmentDraft.value,
        resolvedMappings,
        remainingMappings,
        outcome
      })
      const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
      const trimmed = reply?.trim()
      const safeText = sanitizeNarrativeReply(trimmed)

      if (!safeText) {
        throw new Error('AI 返回了空白内容。')
      }

      patientFeedbackText.value = safeText
    } catch (error) {
      narrativeError.value = normalizeNarrativeError(error)
      patientFeedbackText.value = ''
    } finally {
      isGeneratingText.value = false
    }
  }

  async function submitTreatment() {
    if (!activePatient.value || isGeneratingText.value || isEmptyMapping(treatmentDraft.value)) return

    const referenceMappings = activePatient.value.trackingSheet?.unresolvedMappings ?? activePatient.value.hiddenMappings
    const allowedTreatment = filterTreatableMappings(treatmentDraft.value)
    const resolvedMappings = intersectMappings(allowedTreatment, referenceMappings)
    const remainingMappings = subtractMappings(referenceMappings, resolvedMappings)
    const settlementItems = buildSettlementItems(resolvedMappings, equipmentOverview.value)
    const settlementTotal = settlementItems.reduce((sum, item) => sum + item.fee, 0)
    const debtRecord = activePatient.value?.forceDebt
  ? createForcedDebtRecord(activePatient.value, settlementTotal)
  : maybeCreateDebtRecord(activePatient.value, settlementTotal)

    const collectedTotal = debtRecord ? 0 : settlementTotal

    activePatient.value = {
      ...activePatient.value,
      hiddenMappings: remainingMappings
    }
    if (activePatient.value.trackingSheet) {
      activePatient.value.trackingSheet.unresolvedMappings = cloneMapping(remainingMappings)
      activePatient.value.trackingSheet.confirmedMappings = intersectMappings(confirmedDiagnosis.value, remainingMappings)
      activePatient.value.trackingSheet.resolvedMappings = mergeMappings(
        activePatient.value.trackingSheet.resolvedMappings,
        resolvedMappings
      )
      activePatient.value.trackingSheet.healedMappings = mergeMappings(
        activePatient.value.trackingSheet.healedMappings,
        resolvedMappings
      )
      activePatient.value.trackingSheet.abnormalCount = countMappings(remainingMappings)
      if (!isEmptyMapping(resolvedMappings)) {
        appendSymptomLedger(
          activePatient.value.trackingSheet,
          `已治愈：~~${formatPairList(resolvedMappings)}~~`
        )
        appendTrackingLog(
          activePatient.value.trackingSheet,
          debtRecord
            ? `本轮治愈：${formatPairList(resolvedMappings)}；应收 ${settlementTotal} 信用点，已记入赊账`
            : `本轮治愈：${formatPairList(resolvedMappings)}；已收 ${settlementTotal} 信用点`
        )
      }
    }

    confirmedDiagnosis.value = intersectMappings(confirmedDiagnosis.value, remainingMappings)
    treatmentDraft.value = cloneMapping(confirmedDiagnosis.value)
    patientFeedbackOutcome.value = 'partial'
    phase.value = 'patient_feedback'
    if (!debtRecord) {
      credits.value += settlementTotal
      earnedCreditsTotal.value += settlementTotal
    }

    if (isEmptyMapping(remainingMappings)) {
      patientFeedbackOutcome.value = 'complete'
      patientCount.value += 1
    } else if (diagnosisUsesLeft.value <= 0) {
      patientFeedbackOutcome.value = 'revisit'
      const returnDay = gameDay.value + REVISIT_DELAY_DAYS
      const revisitPatient = {
        ...clonePatient(activePatient.value),
        returnDay
      }

      activePatient.value = {
        ...activePatient.value,
        returnDay
      }

      revisitQueue.value = sortRevisitQueue([...revisitQueue.value, revisitPatient])
    }

    await generateTreatmentFeedback({
      resolvedMappings,
      remainingMappings,
      outcome: patientFeedbackOutcome.value
    })

    if (patientFeedbackOutcome.value === 'complete') {
      pushCompletedCase(buildCompletedCaseRecord('complete', {
        settlementItems,
        settlementTotal,
        collectedTotal,
        paymentMode: debtRecord ? 'credit' : 'paid',
        feedbackText: patientFeedbackText.value
      }))
    } else if (patientFeedbackOutcome.value === 'revisit') {
      pushCompletedCase(buildCompletedCaseRecord('revisit', {
        settlementItems,
        settlementTotal,
        collectedTotal,
        paymentMode: debtRecord ? 'credit' : 'paid',
        feedbackText: patientFeedbackText.value
      }))
    }

    await saveProgress()
  }

  async function advanceFromFeedback() {
    if (patientFeedbackOutcome.value === 'partial') {
      phase.value = 'consult'
      consultStage.value = 'questioning'
      patientFeedbackText.value = ''
      statusNotice.value = '患者还留有残响，继续问诊后再决定下一轮治疗。'
      await saveProgress()
      return
    }

    const notice = patientFeedbackOutcome.value === 'complete'
      ? '本次接待已经完成。'
      : `患者已预约第 ${activePatient.value?.returnDay} 天后的复诊。`

    clearActiveCase()
    phase.value = 'hub'
    statusNotice.value = notice
    await saveProgress()
  }

  function syncResponsiveState() {
    if (typeof window === 'undefined') return

    const mobile = window.innerWidth <= 900
    const previousMobile = isMobileLayout.value

    isMobileLayout.value = mobile

    if (mobile === previousMobile) return

    if (mobile) {
      equipmentExpanded.value = false
      snapshotExpanded.value = false
      showNotesDrawer.value = false
      return
    }

    equipmentExpanded.value = true
    snapshotExpanded.value = true
    showNotesDrawer.value = true
  }

  function toggleEquipmentSection() {
    equipmentExpanded.value = !equipmentExpanded.value
  }

  async function upgradeEquipmentModule(sourceId, targetId) {
    const cost = 20 * (getEquipmentLevel(equipmentOverview.value, sourceId, targetId) + 1)
    if (credits.value < cost) {
      upgradeFailureMessage.value = '信用点不足，暂时无法升级对应模块。'
      showUpgradeFailureModal.value = true
      return
    }

    equipmentOverview.value = equipmentOverview.value.map(item => {
      if (item.id !== sourceId) return item

      const nextLevel = Math.min(4, getEquipmentLevel(equipmentOverview.value, sourceId, targetId) + 1)
      return {
        ...item,
        moduleLevels: {
          ...buildDefaultModuleLevels(item.id),
          ...(item.moduleLevels ?? {}),
          [targetId]: nextLevel
        }
      }
    })
    credits.value -= cost
    statusNotice.value = `${SENSE_LABELS[sourceId]} -> ${SENSE_LABELS[targetId]} 已升级到 Lv.${getEquipmentLevel(equipmentOverview.value, sourceId, targetId)}。`
    await saveProgress()
  }

  function closeUpgradeFailureModal() {
    showUpgradeFailureModal.value = false
    upgradeFailureMessage.value = ''
  }

  function toggleSnapshotSection() {
    if (!isMobileLayout.value) return
    snapshotExpanded.value = !snapshotExpanded.value
  }

  function toggleNotesDrawer() {
    if (!isMobileLayout.value) return
    showNotesDrawer.value = !showNotesDrawer.value
  }

  const currentBackgroundPage = computed(() => {
    return BACKGROUND_PAGES[backgroundPage.value] ?? BACKGROUND_PAGES[0]
  })

  const currentEnvironment = computed(() => {
    return cloneEnvironmentProfile(currentEnvironmentProfile.value) ?? getEnvironmentByPhase(environmentPhase.value)
  })

  const activeEnvironment = computed(() => {
    return cloneEnvironmentProfile(activePatient.value?.environmentProfile) ?? currentEnvironment.value
  })

  const pendingRevisitCount = computed(() => revisitQueue.value.length)

  const dueRevisitCount = computed(() => {
    return revisitQueue.value.filter(item => Number(item.returnDay) <= gameDay.value).length
  })

  const hubStats = computed(() => {
    return [
      {
        label: '当前信用点',
        value: `${credits.value}`,
        meta: '本轮先保留字段，不接入经营结算'
      },
      {
        label: '已完成接待',
        value: `${patientCount.value}`,
        meta: '仅在完全治愈后增加'
      },
      {
        label: '当前游戏日',
        value: `第 ${gameDay.value} 天`,
        meta: currentEnvironment.value.name
      },
      {
        label: '待复诊患者',
        value: `${pendingRevisitCount.value}`,
        meta: dueRevisitCount.value > 0 ? `已有 ${dueRevisitCount.value} 名患者到期` : '暂无到期复诊'
      }
    ]
  })

  const equipmentSummary = computed(() => {
    return equipmentOverview.value.map(item => ({
      id: item.id,
      name: item.name,
      levelText: `Lv.${item.level}`,
      summary: item.summary,
      moduleCount: `${item.modules.length} 个映射模块`
    }))
  })
  const equipmentModuleRows = computed(() => {
    return equipmentOverview.value.map(item => ({
      id: item.id,
      name: item.name,
      modules: (SENSE_TARGETS[item.id] ?? []).map(targetId => ({
        id: `${item.id}:${targetId}`,
        targetId,
        label: SENSE_LABELS[targetId],
        level: getEquipmentLevel(equipmentOverview.value, item.id, targetId),
        upgradeCost: 20 * (getEquipmentLevel(equipmentOverview.value, item.id, targetId) + 1)
      }))
    }))
  })
  const waitingPatientCount = computed(() => waitingPatients.value.length)
  const timeProgressPercent = computed(() => {
    const elapsed = Math.max(0, nowTick.value - lastTimeSyncAt.value)
    return Math.min(100, (elapsed / REAL_MS_PER_GAME_DAY) * 100)
  })

  const currentConsultOptions = computed(() => consultOptions.value)
  const activeTrackingSheet = computed(() => activePatient.value?.trackingSheet ?? null)
  const confirmedDiagnosisSummary = computed(() => formatMappingSummary(confirmedDiagnosis.value))
  const treatmentDraftSummary = computed(() => formatMappingSummary(treatmentDraft.value))
  const canShowConsultChoices = computed(() => {
    return phase.value === 'consult'
      && consultEntryStage.value === 'questioning'
      && isConsultNarrativeReady.value
      && isConsultOptionsReady.value
      && !isGeneratingText.value
  })
  const confirmedDiagnosisDetails = computed(() => {
    return getMappingPairs(confirmedDiagnosis.value).map(pair => ({
      ...pair,
      label: formatPairLabel(pair.source, pair.target),
      level: getMappingLevel(activeTrackingSheet.value?.mappingLevels, pair.source, pair.target)
    }))
  })

  function isTreatmentOptionEnabled(sourceId, targetId) {
    const confirmed = confirmedDiagnosis.value?.[sourceId]?.includes(targetId)
    if (!confirmed) return false

    const symptomLevel = getMappingLevel(activeTrackingSheet.value?.mappingLevels, sourceId, targetId)
    const equipmentLevel = getEquipmentLevel(equipmentOverview.value, sourceId, targetId)
    return equipmentLevel >= symptomLevel
  }

  function filterTreatableMappings(mapping) {
    const next = createEmptyMapping()

    SENSE_CONFIGS.forEach(item => {
      next[item.id] = normalizeTargets(item.id, mapping?.[item.id]).filter(targetId => {
        return isTreatmentOptionEnabled(item.id, targetId)
      })
    })

    return next
  }

  function getTreatmentOptionMeta(sourceId, targetId) {
    const symptomLevel = getMappingLevel(activeTrackingSheet.value?.mappingLevels, sourceId, targetId)
    const equipmentLevel = getEquipmentLevel(equipmentOverview.value, sourceId, targetId)
    const confirmed = confirmedDiagnosis.value?.[sourceId]?.includes(targetId)

    if (!confirmed) {
      return {
        level: symptomLevel,
        disabled: true,
        reason: '需先由诊断仪确认'
      }
    }

    if (equipmentLevel < symptomLevel) {
      return {
        level: symptomLevel,
        disabled: true,
        reason: `需要 Lv.${symptomLevel} 治疗仪`
      }
    }

    return {
      level: symptomLevel,
      disabled: false,
      reason: `可由 Lv.${equipmentLevel} 治疗仪处理`
    }
  }

  const canSubmitDiagnosis = computed(() => {
    return phase.value === 'consult' && diagnosisUsesLeft.value > 0 && !isEmptyMapping(diagnosisDraft.value) && !isGeneratingText.value
  })

  const canEnterTreatment = computed(() => {
    return !isEmptyMapping(confirmedDiagnosis.value) && !isGeneratingText.value
  })

  const canSubmitTreatment = computed(() => {
    return phase.value === 'treatment' && !isEmptyMapping(filterTreatableMappings(treatmentDraft.value)) && !isGeneratingText.value
  })

  const latestCompletedCase = computed(() => completedCases.value[0] ?? null)
  const curedArchives = computed(() => completedCases.value.filter(item => item.outcome === 'complete'))
  const totalEarnings = computed(() => earnedCreditsTotal.value)
  const totalCuredCount = computed(() => completedCases.value.filter(item => item.outcome === 'complete').length)
  const totalEquipmentLevel = computed(() => equipmentOverview.value.reduce((sum, item) => sum + Number(item.level || 0), 0))
  const unreadPhoneCount = computed(() => phoneMessages.value.filter(item => !item.read).length)
  const pendingDebtCount = computed(() => debtLedger.value.filter(item => item.status === 'pending').length)
  const latestArchiveLabel = computed(() => {
    if (!archiveSaves.value.length) return '暂无可读取的归档'
    const latest = archiveSaves.value[0]
    return latest?.saveTime ? `归档于 ${latest.saveTime.slice(0, 16).replace('T', ' ')}` : '读取最近一次归档'
  })

  const currentFeedbackActionLabel = computed(() => {
    return patientFeedbackOutcome.value === 'partial' ? '继续问诊' : '返回诊所主界面'
  })

  const feedbackOutcomeLabel = computed(() => {
    if (patientFeedbackOutcome.value === 'complete') return '本次治疗完成'
    if (patientFeedbackOutcome.value === 'revisit') return '需要后续复诊'
    return '仍有残留问题'
  })

  const activePatientSummary = computed(() => {
    if (!activePatient.value) return ''

    return `${activePatient.value.job} · 第 ${activePatient.value.visitCount} 次来诊`
  })

  const diagnosisAttemptLabel = computed(() => {
    return `诊断仪剩余 ${diagnosisUsesLeft.value} / ${DIAGNOSIS_LIMIT} 次`
  })

  onMounted(() => {
    syncSaveStatus()
    syncResponsiveState()
    ensureQueueTimer()
    window.addEventListener('resize', syncResponsiveState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncResponsiveState)

    if (autosaveTimer) {
      clearTimeout(autosaveTimer)
    }

    if (queueTimer) {
      clearInterval(queueTimer)
    }
  })

  return {
    phase,
    consultStage,
    consultEntryStage,
    hasSave,
    hasArchiveSave,
    isCheckingSave,
    showConfirmNewGameModal,
    showUpgradeFailureModal,
    upgradeFailureMessage,
    showProfilePanel,
    isMobileLayout,
    equipmentExpanded,
    snapshotExpanded,
    showNotesDrawer,
    isGeneratingText,
    statusNotice,
    narrativeError,
    patientFeedbackText,
    patientFeedbackOutcome,
    backgroundPage,
    credits,
    patientCount,
    gameDay,
    playerProfile,
    activePatient,
    consultationHistory,
    consultNotes,
    isConsultNarrativeReady,
    isConsultOptionsReady,
    diagnosisDraft,
    confirmedDiagnosis,
    diagnosisUsesLeft,
    treatmentDraft,
    revisitQueue,
    completedCases,
    phoneMessages,
    debtLedger,
    currentBackgroundPage,
    currentEnvironment,
    activeEnvironment,
    pendingRevisitCount,
    dueRevisitCount,
    waitingPatientCount,
    hubStats,
    equipmentSummary,
    equipmentModuleRows,
    timeProgressPercent,
    currentConsultOptions,
    canShowConsultChoices,
    activeTrackingSheet,
    confirmedDiagnosisDetails,
    confirmedDiagnosisSummary,
    treatmentDraftSummary,
    canSubmitDiagnosis,
    canEnterTreatment,
    canSubmitTreatment,
    latestCompletedCase,
    curedArchives,
    totalEarnings,
    totalCuredCount,
    totalEquipmentLevel,
    unreadPhoneCount,
    pendingDebtCount,
    latestArchiveLabel,
    currentFeedbackActionLabel,
    feedbackOutcomeLabel,
    activePatientSummary,
    diagnosisAttemptLabel,
    backgroundPages: BACKGROUND_PAGES,
    backgroundTotal: BACKGROUND_PAGES.length,
    titleContent: TITLE_CONTENT,
    hubActions: HUB_ACTIONS,
    senseConfigs: SENSE_CONFIGS,
    senseLabels: SENSE_LABELS,
    senseTargets: SENSE_TARGETS,
    systemSnapshot: SYSTEM_SNAPSHOT,
    startNewGame,
    confirmStartNewGame,
    cancelStartNewGame,
    continueGame,
    loadArchivedGame,
    restoreFromSave,
    saveProgress,
    saveManualProgress,
    toggleProfilePanel,
    updatePlayerName,
    updatePlayerAvatar,
    markPhoneMessagesRead,
    upgradeEquipmentModule,
    goHome,
    returnToHub,
    returnToTitle,
    goToNextBackgroundPage,
    goToPrevBackgroundPage,
    startPatientFlow,
    continueConsultFlow,
    chooseConsultOption,
    handleConsultNotesInput,
    toggleDiagnosisTarget,
    toggleTreatmentTarget,
    getTreatmentOptionMeta,
    submitDiagnosis,
    openTreatmentScreen,
    returnToConsult,
    submitTreatment,
    advanceFromFeedback,
    toggleEquipmentSection,
    closeUpgradeFailureModal,
    toggleSnapshotSection,
    toggleNotesDrawer
  }
}
