import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import aiService from '@/services/aiService'
import saveService from '@/services/saveService'
import {
  BACKGROUND_PAGES,
  DEFAULT_EQUIPMENT_OVERVIEW,
  DEFAULT_GAME_STATE,
  DIAGNOSIS_LIMIT,
  HUB_ACTIONS,
  PLAYER_PROFILE,
  REAL_MS_PER_GAME_DAY,
  REVISIT_DELAY_DAYS,
  TREATMENT_LIMIT,
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
  buildStoryPrompt,
  buildTrackingSheetPrompt,
  buildTreatmentFeedbackPrompt,
  buildMessagePrompt
} from '../prompts/promptBuilder'
import {
  buildEnvironmentGenerationPrompt,
  buildPatientGenerationPrompt,
  GENERATION_SYSTEM_PROMPT
} from '../prompts/generationPrompts'
import { SYSTEM_PROMPT } from '../prompts/systemPrompt'

const SCRIPT_ID = 'synesthesia'
const ARCHIVE_PREFIX = `${SCRIPT_ID}-archive-`
const VALID_PHASES = ['background_intro', 'hub', 'consult', 'treatment', 'patient_feedback', 'settlement']
const VALID_CONSULT_STAGES = ['arrival_intro', 'questioning']
const VALID_CONSULT_ENTRY_STAGES = ['pre_consult', 'entering_consult', 'questioning']
const AUTOSAVE_DELAY = 400
const PATIENT_QUEUE_MAX = 3
const PATIENT_QUEUE_ROLL_INTERVAL_MS = 60 * 1000
const DEFAULT_SYMPTOM_LEVEL = 1
const MAX_SYMPTOM_LEVEL = 4
const DEBT_BORROW_PROBABILITY = 0.1
const DEBT_REPAY_DAILY_PROBABILITY = 0.1
const TREATMENT_FEE_BY_LEVEL = {
  1: 50,
  2: 100,
  3: 150,
  4: 200
}
const UPGRADE_COST_BY_LEVEL = {
  1: 200,
  2: 400,
  3: 600
}

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
  return { ...environment }
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

function reconcilePatientSeverityWithEquipment(patient, equipmentList = []) {
  const nextPatient = clonePatient(patient)
  if (!nextPatient) return null
  const baseMapping = nextPatient.originalMappings ?? nextPatient.hiddenMappings
  const normalizedLevels = clampLevelMapToEquipment(
    nextPatient.initialMappingLevels ?? {},
    baseMapping,
    equipmentList
  )
  if (Object.keys(normalizedLevels).length > 0) {
    nextPatient.initialMappingLevels = normalizedLevels
  }
  if (Number(nextPatient.visitCount || 1) <= 1 && nextPatient.trackingSheet) {
    nextPatient.trackingSheet.mappingLevels = normalizeMappingLevelsForPairs(
      nextPatient.initialMappingLevels ?? normalizedLevels,
      nextPatient.trackingSheet.unresolvedMappings ?? nextPatient.hiddenMappings
    )
  }
  return nextPatient
}

function cloneCompletedCase(record) {
  if (!record) return null
  return { ...record }
}

function cloneDebtRecord(record) {
  if (!record) return null
  return { ...record }
}

function clonePhoneMessage(message) {
  if (!message) return null
  return { ...message }
}

function cloneTrackingSheet(trackingSheet) {
  if (!trackingSheet) return null
  return {
    ...trackingSheet,
    patientProfile: { ...(trackingSheet.patientProfile ?? {}) },
    environmentFactors: Array.isArray(trackingSheet.environmentFactors) ? [...trackingSheet.environmentFactors] : [],
    symptomLedger: Array.isArray(trackingSheet.symptomLedger) ? [...trackingSheet.symptomLedger] : [],
    changeLog: Array.isArray(trackingSheet.changeLog) ? [...trackingSheet.changeLog] : [],
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

function sanitizeInlineText(text = '') {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[，,]{2,}/g, '，')
    .trim()
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

function makePhoneMessage({ sender, title, text, gameDay, type = 'system', read = false }) {
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
    consultOptions: [],
    consultNotes: '',
    diagnosisDraft: createEmptyMapping(),
    confirmedDiagnosis: createEmptyMapping(),
    diagnosisUsesLeft: DIAGNOSIS_LIMIT,
    treatmentUsesLeft: TREATMENT_LIMIT,
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

function normalizeGeneratedLevelMap(levelMap = {}, mapping = {}) {
  return getMappingPairs(mapping).reduce((acc, pair) => {
    acc[pair.key] = normalizeLevelValue(levelMap?.[pair.key] ?? DEFAULT_SYMPTOM_LEVEL)
    return acc
  }, createEmptyLevelMap())
}

function clampLevelMapToEquipment(levelMap = {}, mapping = {}, equipmentList = []) {
  return getMappingPairs(mapping).reduce((acc, pair) => {
    const requestedLevel = normalizeLevelValue(levelMap?.[pair.key] ?? DEFAULT_SYMPTOM_LEVEL)
    const equipmentLevel = getEquipmentLevel(equipmentList, pair.source, pair.target)
    acc[pair.key] = Math.min(requestedLevel, equipmentLevel)
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
    return normalizeGeneratedLevelMap(patient.initialMappingLevels, patient?.originalMappings ?? {})
  }
  return getMappingPairs(patient?.originalMappings ?? {}).reduce((acc, pair) => {
    if (!rule) {
      acc[pair.key] = pickInitialMappingLevel(patient, pair.source, pair.target)
      return acc
    }
    const { maxLevel, mustHaveLv2 } = rule
    const pairIndex = Object.keys(acc).length
    if (mustHaveLv2 && pairIndex === 0) {
      acc[pair.key] = 2
    } else {
      const seed = (Number(patient?.serial || 1) * 19)
        + (Number(patient?.visitCount || 1) * 7)
        + pair.source.length
        + pair.target.length
        + pairIndex
      acc[pair.key] = maxLevel === 1 ? 1 : 1 + (seed % maxLevel)
    }
    return acc
  }, createEmptyLevelMap())
}

function parseTrackingSheetPayload(text) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('tracking sheet payload must be an object')
  }
  return parsed
}

function requireGeneratedText(value, fieldLabel) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) {
    throw new Error(`AI 生成的${fieldLabel}为空。`)
  }
  return text
}

function requireGeneratedTextList(value, fieldLabel) {
  if (!Array.isArray(value)) {
    throw new Error(`AI 生成的${fieldLabel}格式错误。`)
  }
  const list = value.map(item => String(item).trim()).filter(Boolean)
  if (!list.length) {
    throw new Error(`AI 生成的${fieldLabel}为空。`)
  }
  return list
}

function normalizeTrackingSheet(rawSheet, patient) {
  const originalMappings = cloneMapping(patient.originalMappings)
  const unresolvedMappings = cloneMapping(patient.hiddenMappings)
  const mappingLevels = buildInitialMappingLevels(patient)
  const lockedMappingLevels = normalizeMappingLevelsForPairs(
    patient?.initialMappingLevels ?? mappingLevels,
    unresolvedMappings
  )
  return {
    patientProfile: {
      name: patient.name,
      job: patient.job,
      jobContext: patient.jobContext,
      visitCount: patient.visitCount,
      speechStyle: patient.speechStyle,
      emotionalTone: patient.emotionalTone
    },
    coreConcern: requireGeneratedText(rawSheet?.coreConcern, '后台追踪表核心牵挂'),
    symptomSummary: requireGeneratedText(rawSheet?.symptomSummary, '后台追踪表症状摘要'),
    environmentFactors: requireGeneratedTextList(rawSheet?.environmentFactors, '后台追踪表环境干扰'),
    symptomLedger: requireGeneratedTextList(rawSheet?.symptomLedger, '后台追踪表症状记录'),
    changeLog: requireGeneratedTextList(rawSheet?.changeLog, '后台追踪表变更日志'),
    abnormalCount: countMappings(originalMappings),
    estimatedIncome: buildEstimatedIncome(patient),
    originalMappings,
    unresolvedMappings,
    confirmedMappings: createEmptyMapping(),
    resolvedMappings: createEmptyMapping(),
    mappingLevels: lockedMappingLevels,
    healedMappings: createEmptyMapping(),
    worsenedMappings: createEmptyMapping(),
    newMappings: createEmptyMapping()
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
      appendSymptomLedger(nextSheet, `加重：~~${oldSummary}~~ -> ${sourceLabel} -> ${unresolved[targetPair.source].map(item => SENSE_LABELS[item]).join('、')}`)
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
  nextSheet.environmentFactors = [environment?.name || '', environment?.description || ''].filter(Boolean)
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

function getTreatmentFeeByLevel(level) {
  const normalizedLevel = clamp(Number(level) || DEFAULT_SYMPTOM_LEVEL, 1, MAX_SYMPTOM_LEVEL)
  return TREATMENT_FEE_BY_LEVEL[normalizedLevel] ?? TREATMENT_FEE_BY_LEVEL[DEFAULT_SYMPTOM_LEVEL]
}

function getUpgradeCostByLevel(level) {
  const normalizedLevel = clamp(Number(level) || 1, 1, MAX_SYMPTOM_LEVEL - 1)
  return UPGRADE_COST_BY_LEVEL[normalizedLevel] ?? UPGRADE_COST_BY_LEVEL[1]
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
      fee: getTreatmentFeeByLevel(level)
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
    .map(item => ({ ...item, text: sanitizeNarrativeReply(item.text) }))
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
    .replace(/[—\-–\s，。！？、：:"""'`]/g, '')
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
    .map((item, index) => {
      const label = String(item.label || '').trim()
      const doctorLine = sanitizeDoctorLine(item.doctorLine || '', label)
      const promptFocus = String(item.promptFocus || '').trim()
      return { id: item.id || `dynamic-${index + 1}`, label, doctorLine, promptFocus }
    })
    .filter((item, index, list) => {
      if (!item.label || !item.doctorLine || !item.promptFocus) return false
      return !isRepeatedQuestion(
        item.doctorLine,
        recentDoctorLines,
        list.slice(0, index).map(option => option.doctorLine)
      )
    })
    .slice(0, 4)
  if (selected.length < 4) {
    throw new Error('AI 返回的有效问诊选项不足 4 个。')
  }
  return selected
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
  const showArchivePanel = ref(false)
  const showSettlementModal = ref(false)
  const isGeneratingText = ref(false)
  const typingEntryId = ref('')
  const isEnvironmentLoading = ref(false)
  const environmentGenerationError = ref('')
  const isQueueGenerating = ref(false)
  const statusNotice = ref('')
  const narrativeError = ref('')
  const patientFeedbackText = ref('')
  const patientFeedbackOutcome = ref('')
  const pendingSettlementRecord = ref(null)
  const selectedArchiveCaseId = ref('')

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
  const consultOptions = ref([])
  const consultNotes = ref('')
  const isConsultNarrativeReady = ref(false)
  const isConsultOptionsReady = ref(false)
  const diagnosisDraft = ref(createEmptyMapping())
  const confirmedDiagnosis = ref(createEmptyMapping())
  const diagnosisUsesLeft = ref(DIAGNOSIS_LIMIT)
  const treatmentUsesLeft = ref(TREATMENT_LIMIT)
  const treatmentDraft = ref(createEmptyMapping())
  const revisitQueue = ref([])
  const completedCases = ref([])
  const archiveSaves = ref([])
  const phoneMessages = ref([])
  const debtLedger = ref([])

  let autosaveTimer = null
  let queueTimer = null
  let consultRequestToken = 0
  let environmentGenerationPromise = null
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

  function updateTreatmentUses(value) {
    const nextValue = clamp(Number(value) || 0, 0, TREATMENT_LIMIT)
    treatmentUsesLeft.value = nextValue
    if (activePatient.value) {
      activePatient.value.treatmentUsesLeft = nextValue
    }
  }

  function collectExistingPatientReferences() {
    return [
      ...waitingPatients.value,
      ...revisitQueue.value,
      activePatient.value
    ].filter(Boolean).map(item => ({ name: item.name, job: item.job }))
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

  function normalizeGeneratedEnvironment(rawEnvironment = {}, phaseSeed = null) {
    const description = sanitizeInlineText(rawEnvironment?.description || '')
    if (!description) {
      throw new Error('AI 生成的环境信息不完整。')
    }
    const finalDescription = description.length > 40 ? description.slice(0, 40) : description
    return {
      id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      phase: phaseSeed ?? Date.now(),
      description: finalDescription
    }
  }

  function normalizeGeneratedLevelMap(levelMap = {}, mapping = {}) {
    return getMappingPairs(mapping).reduce((acc, pair) => {
      acc[pair.key] = normalizeLevelValue(levelMap?.[pair.key] ?? DEFAULT_SYMPTOM_LEVEL)
      return acc
    }, createEmptyLevelMap())
  }

  function normalizeGeneratedPatientPayload(rawPatient, { serial, seedBase = 0 }) {
    const name = String(rawPatient?.name || '').trim()
    const job = String(rawPatient?.job || '').trim()
    const jobContext = String(rawPatient?.jobContext || '').trim()
    const attachment = String(rawPatient?.attachment || '').trim()
    const emotionalTone = String(rawPatient?.emotionalTone || '').trim()
    const speechStyle = String(rawPatient?.speechStyle || '').trim()
    if (!name || !job || !jobContext || !attachment || !emotionalTone || !speechStyle) {
      throw new Error('AI 生成的患者基础资料不完整。')
    }
    const generatedMappings = normalizeMapping(rawPatient?.originalMappings)
    const generatedLevelMap = normalizeGeneratedLevelMap(rawPatient?.mappingLevels, generatedMappings)
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
      diagnosisUsesLeft: DIAGNOSIS_LIMIT,
      treatmentUsesLeft: TREATMENT_LIMIT,
      hiddenMappings: cloneMapping(generatedMappings),
      originalMappings: cloneMapping(generatedMappings),
      initialMappingLevels: clampLevelMapToEquipment(generatedLevelMap, generatedMappings, equipmentOverview.value),
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

  async function generateCurrentEnvironmentProfile(previousEnvironmentDescription = '') {
    let lastError = null
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const payload = await generateStructuredReply(
          buildEnvironmentGenerationPrompt({ previousEnvironmentDescription }),
          '环境信息'
        )
        return normalizeGeneratedEnvironment(payload, Date.now() + attempt)
      } catch (error) {
        lastError = error
      }
    }
    throw lastError || new Error('AI 生成环境失败。')
  }

  async function ensureCurrentEnvironmentProfile({ force = false, previousEnvironmentDescription = '' } = {}) {
    if (!force && currentEnvironmentProfile.value) {
      return cloneEnvironmentProfile(currentEnvironmentProfile.value)
    }
    if (!environmentGenerationPromise) {
      environmentGenerationError.value = ''
      isEnvironmentLoading.value = true
      environmentGenerationPromise = (async () => {
        const generatedProfile = await generateCurrentEnvironmentProfile(
          previousEnvironmentDescription || currentEnvironmentProfile.value?.description || ''
        )
        currentEnvironmentProfile.value = cloneEnvironmentProfile(generatedProfile)
        environmentGenerationError.value = ''
        environmentPhase.value = Number(currentEnvironmentProfile.value?.phase || Date.now())
        scheduleProgressSave()
        return cloneEnvironmentProfile(currentEnvironmentProfile.value)
      })()
        .catch(error => {
          currentEnvironmentProfile.value = null
          environmentGenerationError.value = normalizeNarrativeError(error)
          statusNotice.value = `当前环境生成失败：${environmentGenerationError.value}`
          throw error
        })
        .finally(() => {
          isEnvironmentLoading.value = false
          environmentGenerationPromise = null
        })
    }
    return environmentGenerationPromise
  }

  async function generatePatient(serial) {
    const existingPatients = collectExistingPatientReferences()
    const globalEnvironment = currentEnvironmentProfile.value
    let lastError = null
    if (!globalEnvironment) {
      throw new Error('当前环境尚未生成完成。')
    }
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const payload = await generateStructuredReply(
          buildPatientGenerationPrompt({ serial, gameDay: gameDay.value, globalEnvironment, existingPatients }),
          '患者信息'
        )
        const patient = normalizeGeneratedPatientPayload(payload, { serial, seedBase: patientSeedBase.value })
        patient.environmentProfile = cloneEnvironmentProfile(globalEnvironment)
        patient.environmentPhase = globalEnvironment.phase
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
    const safeTarget = clamp(Number(targetCount) || 1, 1, PATIENT_QUEUE_MAX)
    if (waitingPatients.value.length >= safeTarget) return
    if (!queueGenerationPromise) {
      queueGenerationPromise = (async () => {
        while (waitingPatients.value.length < safeTarget && waitingPatients.value.length < PATIENT_QUEUE_MAX) {
          const patient = await generatePatient(nextPatientSerial.value)
          waitingPatients.value = [...waitingPatients.value, patient].slice(0, PATIENT_QUEUE_MAX)
          nextPatientSerial.value += 1
        }
      })()
        .finally(() => {
          queueGenerationPromise = null
        })
    }
    await queueGenerationPromise
  }

  function createPatient() {
    throw new Error('Local patient generation has been disabled.')
  }

  async function refreshPatientQueue(force = false) {
    nowTick.value = Date.now()
    if (phase.value === 'title') return waitingPatients.value.length
    if (isEnvironmentLoading.value || !currentEnvironmentProfile.value) return waitingPatients.value.length
    if (waitingPatients.value.length >= PATIENT_QUEUE_MAX) return waitingPatients.value.length
    if (!force && queueGenerationPromise) return waitingPatients.value.length
    isQueueGenerating.value = true
    try {
      await ensurePatientQueue(PATIENT_QUEUE_MAX)
      return waitingPatients.value.length
    } catch (error) {
      statusNotice.value = `患者生成失败：${normalizeNarrativeError(error)}`
      throw error
    } finally {
      isQueueGenerating.value = false
      lastQueueRollAt.value = Date.now()
      nowTick.value = lastQueueRollAt.value
      scheduleProgressSave()
    }
  }

  function ensureQueueTimer() {
    if (queueTimer) clearInterval(queueTimer)
    queueTimer = setInterval(() => {
      if (isEnvironmentLoading.value || !currentEnvironmentProfile.value) return
      if (waitingPatients.value.length >= PATIENT_QUEUE_MAX || queueGenerationPromise) return
      refreshPatientQueue(true).catch(error => {
        console.warn('Synesthesia 候诊队列生成失败:', error)
      })
    }, PATIENT_QUEUE_ROLL_INTERVAL_MS)
  }

  function popWaitingPatient() {
    if (!waitingPatients.value.length) return null
    const [nextPatient, ...rest] = waitingPatients.value
    waitingPatients.value = rest
    refreshPatientQueue(true).catch(error => {
      console.warn('Synesthesia 候诊队列补位失败:', error)
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
      resolvedAt: Date.now(),
      gameDay: gameDay.value,
      visitCount: activePatient.value.visitCount,
      unresolvedSummary: formatMappingSummary(activePatient.value.hiddenMappings),
      consultationHistory: consultationHistory.value.map(item => ({ ...item })),
      trackingSheet: cloneTrackingSheet(activePatient.value.trackingSheet),
      settlementItems: Array.isArray(extras.settlementItems) ? extras.settlementItems.map(item => ({ ...item })) : [],
      settlementTotal: Number(extras.settlementTotal || 0),
      collectedTotal: Number(extras.collectedTotal ?? extras.settlementTotal ?? 0),
      paymentMode: extras.paymentMode || 'paid',
      feedbackText: extras.feedbackText || '',
      closingNarrative: extras.closingNarrative || '',
      archiveStory: extras.archiveStory || '',
      environmentDescription: activeEnvironment.value?.description || '',
      coreConcern: activePatient.value.trackingSheet?.coreConcern || activePatient.value.attachment || ''
    }
    if (outcome === 'complete') {
      return {
        ...base,
        outcome,
        outcomeLabel: '完全治愈',
        summary: activePatient.value.trackingSheet?.symptomSummary || '本次治疗已让患者当前的感官错位全部归位。'
      }
    }
    return {
      ...base,
      outcome,
      outcomeLabel: '预约复诊',
      returnDay: gameDay.value + REVISIT_DELAY_DAYS,
      summary: activePatient.value.trackingSheet?.symptomSummary || '本次治疗只稳定住部分问题，剩余异常将在后续复诊中继续处理。'
    }
  }

  function pushCompletedCase(record) {
    if (!record) return
    completedCases.value = [record, ...completedCases.value].slice(0, 24)
    if (!selectedArchiveCaseId.value) {
      selectedArchiveCaseId.value = record.id
    }
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
    const returnAfter = Math.floor(Math.random() * 16) + 5
    const repayAmount = Math.floor(amount * 1.2)
    const record = {
      id: `debt-${patient.id}-${Date.now()}`,
      patientId: patient.id,
      patientSnapshot: { name: patient.name, job: patient.job, attachment: patient.attachment, speechStyle: patient.speechStyle },
      amount,
      repayAmount,
      createdDay: gameDay.value,
      createdSerial: nextPatientSerial.value,
      returnAfter,
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
    const returnAfter = Math.floor(Math.random() * 16) + 5
    const repayAmount = Math.floor(amount * 1.2)
    const record = {
      id: `debt-${patient.id}-${Date.now()}`,
      patientId: patient.id,
      patientSnapshot: { name: patient.name, job: patient.job, attachment: patient.attachment, speechStyle: patient.speechStyle },
      amount,
      repayAmount,
      createdDay: gameDay.value,
      createdSerial: nextPatientSerial.value,
      returnAfter,
      paidDay: null,
      status: 'pending'
    }
    debtLedger.value = [record, ...debtLedger.value]
    pushPhoneMessage(makePhoneMessage({
      sender: patient.name,
      title: '赊账申请',
      text: `手头实在紧，今天先欠你 ${amount} 信用点。不会不还的。`,
      gameDay: gameDay.value,
      type: 'debt'
    }))
    return record
  }

  async function checkPendingDebts() {
    const currentSerial = nextPatientSerial.value
    const debtsToRepay = debtLedger.value.filter(record =>
      record.status === 'pending' &&
      (currentSerial - record.createdSerial) >= record.returnAfter
    )
    for (const record of debtsToRepay) {
      record.status = 'paid'
      record.paidDay = gameDay.value
      credits.value += record.repayAmount
      earnedCreditsTotal.value += record.repayAmount
      let messageText = ''
      try {
        const prompt = buildMessagePrompt({
          patient: record.patientSnapshot,
          debtAmount: record.amount,
          returnAmount: record.repayAmount,
          daysSinceDebt: currentSerial - record.createdSerial
        })
        const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
        messageText = sanitizeNarrativeReply(reply?.trim())
      } catch (error) {
        console.warn('Synesthesia 还款短信生成失败:', error)
      }
      if (!messageText) {
        statusNotice.value = '收到还款，但 AI 未生成短信内容。'
        scheduleProgressSave()
        continue
      }
      pushPhoneMessage(makePhoneMessage({
        sender: record.patientSnapshot.name,
        title: '转账与留言',
        text: messageText,
        gameDay: gameDay.value,
        type: 'payment',
        read: false
      }))
    }
    if (debtsToRepay.length > 0) {
      statusNotice.value = '收到新的银行转账与短信留言。'
      scheduleProgressSave()
    }
  }

  function resetCaseState() {
    consultStage.value = 'arrival_intro'
    consultEntryStage.value = 'pre_consult'
    consultationHistory.value = []
    typingEntryId.value = ''
    consultOptions.value = []
    consultNotes.value = ''
    isConsultNarrativeReady.value = false
    isConsultOptionsReady.value = false
    diagnosisDraft.value = createEmptyMapping()
    confirmedDiagnosis.value = createEmptyMapping()
    updateDiagnosisUses(DIAGNOSIS_LIMIT)
    updateTreatmentUses(TREATMENT_LIMIT)
    treatmentDraft.value = createEmptyMapping()
    patientFeedbackText.value = ''
    patientFeedbackOutcome.value = ''
    pendingSettlementRecord.value = null
    narrativeError.value = ''
    showNotesDrawer.value = false
  }

  function clearActiveCase() {
    activePatient.value = null
    resetCaseState()
  }

  async function generateArchiveStory() {
    if (!activePatient.value) return ''
    try {
      const prompt = buildStoryPrompt({
        patient: activePatient.value,
        environment: activeEnvironment.value,
        trackingSheet: activePatient.value.trackingSheet,
        consultationHistory: consultationHistory.value
      })
      const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
      const result = sanitizeNarrativeReply(reply?.trim())
      console.log('[archiveStory]', result?.slice(0, 50))
      return result
    } catch (error) {
      console.warn('Synesthesia 患者背景故事生成失败:', error)
      return ''
    }
  }

  function openArchivePanel(caseId = '') {
    showArchivePanel.value = true
    selectedArchiveCaseId.value = caseId || completedCases.value[0]?.id || ''
  }

  function closeArchivePanel() {
    showArchivePanel.value = false
  }

  function selectArchiveCase(caseId) {
    selectedArchiveCaseId.value = caseId
  }

  async function confirmSettlementAndReturn() {
    const notice = patientFeedbackOutcome.value === 'complete'
      ? '本次接待已经完成。'
      : `患者已预约第 ${activePatient.value?.returnDay} 天后的复诊。`
    pendingSettlementRecord.value = null
    clearActiveCase()
    phase.value = 'hub'
    statusNotice.value = notice
    await saveProgress()
  }

  function buildSavePayload() {
    return {
      phase: phase.value,
      consultStage: consultStage.value,
      consultEntryStage: 'pre_consult',
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
      patientFeedbackOutcome: patientFeedbackOutcome.value,
      pendingSettlementRecord: cloneCompletedCase(pendingSettlementRecord.value),
      phoneMessages: phoneMessages.value.map(item => clonePhoneMessage(item)),
      debtLedger: debtLedger.value.map(item => cloneDebtRecord(item)),
      diagnosisDraft: cloneMapping(diagnosisDraft.value),
      confirmedDiagnosis: cloneMapping(confirmedDiagnosis.value),
      diagnosisUsesLeft: diagnosisUsesLeft.value,
      treatmentUsesLeft: treatmentUsesLeft.value,
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
    const savedPhase = VALID_PHASES.includes(rawState.phase) ? rawState.phase : fallback.phase
    const nextPhase = (savedPhase === 'patient_feedback' || savedPhase === 'settlement')
      ? 'hub'
      : savedPhase
    const nextConsultStage = VALID_CONSULT_STAGES.includes(rawState.consultStage)
      ? rawState.consultStage
      : fallback.consultStage
    const nextConsultEntryStage = VALID_CONSULT_ENTRY_STAGES.includes(rawState.consultEntryStage)
      ? rawState.consultEntryStage
      : fallback.consultEntryStage

    phase.value = nextPhase
    consultStage.value = nextConsultStage
    consultEntryStage.value = nextConsultEntryStage
    environmentGenerationError.value = ''
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
    currentEnvironmentProfile.value = cloneEnvironmentProfile(rawState.currentEnvironmentProfile)
    environmentPhase.value = Number.isFinite(rawState.environmentPhase)
      ? rawState.environmentPhase
      : (currentEnvironmentProfile.value?.phase ?? fallback.environmentPhase)
    playerProfile.value = { ...PLAYER_PROFILE, ...(rawState.playerProfile ?? {}) }
    equipmentOverview.value = Array.isArray(rawState.equipmentOverview) && rawState.equipmentOverview.length > 0
      ? cloneEquipmentOverview(rawState.equipmentOverview)
      : cloneEquipmentOverview()
    waitingPatients.value = Array.isArray(rawState.waitingPatients)
      ? rawState.waitingPatients
        .map(item => reconcilePatientSeverityWithEquipment(item, equipmentOverview.value))
        .filter(Boolean)
        .slice(0, PATIENT_QUEUE_MAX)
      : []
    lastQueueRollAt.value = Number.isFinite(rawState.lastQueueRollAt) ? rawState.lastQueueRollAt : Date.now()
    activePatient.value = reconcilePatientSeverityWithEquipment(rawState.activePatient, equipmentOverview.value)
    if (activePatient.value && !activePatient.value.trackingSheet) {
      activePatient.value.trackingSheetReady = false
    }
    consultationHistory.value = sanitizeHistoryEntries(rawState.consultationHistory)
    consultOptions.value = Array.isArray(rawState.consultOptions) && rawState.consultOptions.length
      ? rawState.consultOptions.map(item => ({ ...item }))
      : []
    consultNotes.value = typeof rawState.consultNotes === 'string' ? rawState.consultNotes : ''
    isConsultNarrativeReady.value = Boolean(rawState.isConsultNarrativeReady)
    isConsultOptionsReady.value = Boolean(rawState.isConsultOptionsReady)
    patientFeedbackText.value = ''
    patientFeedbackOutcome.value = typeof rawState.patientFeedbackOutcome === 'string'
      ? rawState.patientFeedbackOutcome
      : ''
    pendingSettlementRecord.value = cloneCompletedCase(rawState.pendingSettlementRecord)
    showSettlementModal.value = false
    phoneMessages.value = Array.isArray(rawState.phoneMessages)
      ? rawState.phoneMessages.map(item => clonePhoneMessage(item)).filter(Boolean)
      : []
    debtLedger.value = Array.isArray(rawState.debtLedger)
      ? rawState.debtLedger.map(item => cloneDebtRecord(item)).filter(Boolean)
      : []
    diagnosisDraft.value = normalizeMapping(rawState.diagnosisDraft)
    confirmedDiagnosis.value = normalizeMapping(rawState.confirmedDiagnosis)
    updateDiagnosisUses(rawState.diagnosisUsesLeft ?? activePatient.value?.diagnosisUsesLeft ?? DIAGNOSIS_LIMIT)
    updateTreatmentUses(rawState.treatmentUsesLeft ?? activePatient.value?.treatmentUsesLeft ?? TREATMENT_LIMIT)
    treatmentDraft.value = normalizeMapping(rawState.treatmentDraft)
    revisitQueue.value = sortRevisitQueue(
      Array.isArray(rawState.revisitQueue)
        ? rawState.revisitQueue.map(item => {
          const patient = reconcilePatientSeverityWithEquipment(item, equipmentOverview.value)
          if (patient && !patient.trackingSheet) {
            patient.trackingSheetReady = false
          }
          return patient
        })
        : []
    )
    completedCases.value = Array.isArray(rawState.completedCases)
      ? rawState.completedCases.map(item => cloneCompletedCase(item)).filter(Boolean)
      : []

    if ((phase.value === 'consult' || phase.value === 'treatment' || phase.value === 'patient_feedback' || phase.value === 'settlement') && !activePatient.value) {
      phase.value = 'hub'
      resetCaseState()
      return
    }

    if (phase.value === 'consult' && activePatient.value) {
      consultStage.value = 'questioning'
      consultEntryStage.value = 'questioning'
      if (!pendingSettlementRecord.value && (savedPhase === 'patient_feedback' || savedPhase === 'settlement')) {
        const recoveredRecord = completedCases.value.find(item => item.patientId === activePatient.value?.id)
        if (recoveredRecord && (recoveredRecord.outcome === 'complete' || recoveredRecord.outcome === 'revisit')) {
          pendingSettlementRecord.value = cloneCompletedCase(recoveredRecord)
          patientFeedbackOutcome.value = recoveredRecord.outcome
          consultOptions.value = []
          isConsultOptionsReady.value = false
        }
      }
    }
  }

  function settleElapsedGameTime(savedState) {
    const hasActiveCase = !!savedState?.activePatient && ['consult', 'treatment', 'patient_feedback', 'settlement'].includes(savedState?.phase)
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
      gameDay.value += passedDays
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
    const snapshot = buildDefaultGameState()
    applyGameState(snapshot)
    phase.value = 'background_intro'
    lastTimeSyncAt.value = Date.now()
    statusNotice.value = ''
    ensureCurrentEnvironmentProfile({ force: true })
      .then(() => {
        refreshPatientQueue(true).catch(error => {
          console.warn('Synesthesia 新开局候诊队列初始化失败:', error)
        })
      })
      .catch(error => {
        console.warn('Synesthesia 新开局环境初始化失败:', error)
      })
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
    await ensureCurrentEnvironmentProfile({
      force: passedDays > 0 || !currentEnvironmentProfile.value,
      previousEnvironmentDescription: currentEnvironmentProfile.value?.description || ''
    })
    refreshPatientQueue(true).catch(error => {
      console.warn('Synesthesia 读档后候诊队列刷新失败:', error)
    })
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
    const environment = currentEnvironmentProfile.value ?? patient.environmentProfile
    if (!environment) {
      throw new Error('当前环境尚未生成完成。')
    }
    const parsedSheet = await generateStructuredReply(
      buildTrackingSheetPrompt({ patient, environment, estimatedIncome: buildEstimatedIncome(patient) }),
      '后台追踪表'
    )
    return normalizeTrackingSheet(parsedSheet, patient)
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
      const safeText = sanitizeNarrativeReply(trimmed)
      if (!safeText) {
        throw new Error('AI 返回的到诊文本无效。')
      }
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
    const revisitEnvironment = cloneEnvironmentProfile(currentEnvironmentProfile.value)
    if (!revisitEnvironment) {
      statusNotice.value = '当前环境尚未生成完成，暂时无法接待复诊患者。'
      revisitQueue.value = sortRevisitQueue([patient, ...revisitQueue.value])
      return null
    }
    revisitingPatient.visitCount = Number(revisitingPatient.visitCount || 1) + 1
    revisitingPatient.environmentPhase = revisitEnvironment.phase ?? Date.now()
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
      await saveProgress()
      if (consultEntryStage.value === 'pre_consult') {
        await continueConsultFlow()
      }
      return
    }
    resetCaseState()
    const revisitingPatient = pullDueRevisitPatient()
    const nextPatient = revisitingPatient || popWaitingPatient()
    if (!nextPatient) {
      statusNotice.value = '门外暂时没人。'
      await saveProgress()
      return
    }
    nextPatient.trackingSheet = revisitingPatient?.trackingSheet
      ? cloneTrackingSheet(revisitingPatient.trackingSheet)
      : null
    nextPatient.trackingSheetReady = Boolean(revisitingPatient?.trackingSheet)
    activePatient.value = nextPatient
    updateDiagnosisUses(nextPatient.diagnosisUsesLeft)
    updateTreatmentUses(nextPatient.treatmentUsesLeft ?? TREATMENT_LIMIT)
    consultStage.value = 'arrival_intro'
    consultEntryStage.value = 'pre_consult'
    phase.value = 'consult'
    isConsultNarrativeReady.value = false
    isConsultOptionsReady.value = false
    statusNotice.value = revisitingPatient ? `复诊患者 ${nextPatient.name} 已到访。` : '已有患者到访。'
    await saveProgress()
    await continueConsultFlow()
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
    } catch (error) {
      if (isCurrentConsultRequest(requestToken)) {
        consultEntryStage.value = 'pre_consult'
        narrativeError.value = `后台追踪表生成失败：${normalizeNarrativeError(error)}`
      }
    } finally {
      if (isCurrentConsultRequest(requestToken)) {
        isGeneratingText.value = false
        await saveProgress()
      }
    }
  }

  function getConsultOptions() {
    return []
  }

  async function refreshConsultOptions(requestToken = null) {
    // 有待结算记录时不生成选项
    if (pendingSettlementRecord.value) {
      consultOptions.value = []
      return []
    }

    if (!activePatient.value) {
      consultOptions.value = []
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
      if (parsedOptions.length > 0) {
        consultOptions.value = parsedOptions
        return consultOptions.value
      }
      throw new Error('AI 返回的问诊选项为空。')
    } catch (error) {
      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return []
      }
      console.warn('Synesthesia 问诊选项生成失败:', error)
      consultOptions.value = []
      narrativeError.value = `问诊选项生成失败：${normalizeNarrativeError(error)}`
      return []
    }
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
    typingEntryId.value = ''
    isConsultNarrativeReady.value = false
    isConsultOptionsReady.value = false
    narrativeError.value = ''
    try {
      const prompt = buildConsultReplyPrompt({
        patient: activePatient.value,
        environment: activeEnvironment.value,
        trackingSheet: activePatient.value.trackingSheet,
        option,
        consultationHistory: [...historyBeforeChoice, doctorEntry],
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
      const safeText = sanitizeNarrativeReply(trimmed)
      if (!safeText) {
        throw new Error('AI 返回的患者回复无效。')
      }
      const patientEntry = makeHistoryEntry({
        speaker: 'patient',
        label: activePatient.value.name,
        text: safeText,
        type: 'answer'
      })
      consultationHistory.value = [...historyBeforeChoice, doctorEntry, patientEntry]
      typingEntryId.value = patientEntry.id
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
    if (!activePatient.value || treatmentUsesLeft.value <= 0) return
    const referenceMappings = activePatient.value.trackingSheet?.unresolvedMappings ?? activePatient.value.hiddenMappings
    const canBlindTreatment = diagnosisUsesLeft.value <= 0
    const entryMappings = canBlindTreatment ? referenceMappings : confirmedDiagnosis.value
    const treatableMappings = filterTreatableMappings(referenceMappings)
    if (isEmptyMapping(entryMappings) || isEmptyMapping(treatableMappings)) {
      statusNotice.value = '当前没有治疗仪可以处理的异常，先升级设备后再治疗。'
      await saveProgress()
      return
    }
    const availableDraft = canBlindTreatment
      ? treatableMappings
      : intersectMappings(treatableMappings, confirmedDiagnosis.value)
    treatmentDraft.value = intersectMappings(mergeMappings(treatmentDraft.value, availableDraft), treatableMappings)
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

  function appendTreatmentFeedbackToHistory(feedbackText) {
    if (!activePatient.value) return false
    const safeText = sanitizeNarrativeReply(feedbackText)
    if (!safeText) return false
    const lastEntry = consultationHistory.value[consultationHistory.value.length - 1]
    if (
      lastEntry?.speaker === 'patient'
      && lastEntry?.type === 'treatment_feedback'
      && lastEntry?.text === safeText
    ) {
      return false
    }
    consultationHistory.value = [
      ...consultationHistory.value,
      makeHistoryEntry({
        speaker: 'patient',
        label: activePatient.value.name,
        text: safeText,
        type: 'treatment_feedback'
      })
    ]
    return true
  }

  function appendNarrationToHistory(text, type = 'narration') {
    const safeText = sanitizeNarrativeReply(text)
    if (!safeText) return false
    const lastEntry = consultationHistory.value[consultationHistory.value.length - 1]
    if (
      lastEntry?.speaker === 'narrator'
      && lastEntry?.type === type
      && lastEntry?.text === safeText
    ) {
      return false
    }
    consultationHistory.value = [
      ...consultationHistory.value,
      makeHistoryEntry({
        speaker: 'narrator',
        label: '旁白',
        text: safeText,
        type
      })
    ]
    return true
  }

  function moveToConsultAfterTreatment() {
    phase.value = 'consult'
    consultStage.value = 'questioning'
    consultEntryStage.value = 'questioning'
    consultOptions.value = []
    isConsultOptionsReady.value = false
    isConsultNarrativeReady.value = consultationHistory.value.length > 0
  }

  // ================================================================
  // submitTreatment：治疗完成后立即设置 pendingSettlementRecord
  // archiveStory 移到 advanceFromFeedback 时生成
  // ================================================================
  async function submitTreatment() {
    if (!activePatient.value || isGeneratingText.value || isEmptyMapping(treatmentDraft.value) || treatmentUsesLeft.value <= 0) return

    const referenceMappings = activePatient.value.trackingSheet?.unresolvedMappings ?? activePatient.value.hiddenMappings
    const allowedTreatment = filterTreatableMappings(treatmentDraft.value)

    if (isEmptyMapping(allowedTreatment)) {
      statusNotice.value = '当前没有可执行的治疗项目。'
      await saveProgress()
      return
    }

    const resolvedMappings = intersectMappings(allowedTreatment, referenceMappings)
    const remainingMappings = subtractMappings(referenceMappings, resolvedMappings)
    const settlementItems = buildSettlementItems(resolvedMappings, equipmentOverview.value)
    const settlementTotal = settlementItems.reduce((sum, item) => sum + item.fee, 0)
    const debtRecord = activePatient.value?.forceDebt
      ? createForcedDebtRecord(activePatient.value, settlementTotal)
      : maybeCreateDebtRecord(activePatient.value, settlementTotal)

    const collectedTotal = debtRecord ? 0 : settlementTotal
    updateTreatmentUses(treatmentUsesLeft.value - 1)

    activePatient.value = { ...activePatient.value, hiddenMappings: remainingMappings }
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

    // 关掉病历抽屉，回到问诊页
    moveToConsultAfterTreatment()
    showNotesDrawer.value = false
    pendingSettlementRecord.value = null
    showSettlementModal.value = false

    if (!debtRecord) {
      credits.value += settlementTotal
      earnedCreditsTotal.value += settlementTotal
    }

    // 判断结果
    if (isEmptyMapping(remainingMappings)) {
      patientFeedbackOutcome.value = 'complete'
      patientCount.value += 1
      // 立即清空选项，防止重试按钮出现
      consultOptions.value = []
      isConsultOptionsReady.value = false
    } else if (treatmentUsesLeft.value <= 0) {
      patientFeedbackOutcome.value = 'revisit'
      // 立即清空选项
      consultOptions.value = []
      isConsultOptionsReady.value = false
      const returnDay = gameDay.value + REVISIT_DELAY_DAYS
      const revisitPatient = { ...clonePatient(activePatient.value), returnDay }
      activePatient.value = { ...activePatient.value, returnDay }
      revisitQueue.value = sortRevisitQueue([...revisitQueue.value, revisitPatient])
    }

    // 生成治疗反馈
    await generateTreatmentFeedback({
      resolvedMappings,
      remainingMappings,
      outcome: patientFeedbackOutcome.value
    })

    appendTreatmentFeedbackToHistory(patientFeedbackText.value)

    if (patientFeedbackOutcome.value === 'complete' || patientFeedbackOutcome.value === 'revisit') {
      // 立即建好记录，archiveStory 留空，点击结算按钮时再生成
      const record = buildCompletedCaseRecord(patientFeedbackOutcome.value, {
        settlementItems,
        settlementTotal,
        collectedTotal,
        paymentMode: debtRecord ? 'credit' : 'paid',
        feedbackText: patientFeedbackText.value,
        closingNarrative: patientFeedbackText.value,
        archiveStory: ''
      })
      pushCompletedCase(record)
      pendingSettlementRecord.value = record
      statusNotice.value = patientFeedbackOutcome.value === 'complete'
        ? '治疗已完成，点击进入结算。'
        : `已预约第 ${activePatient.value?.returnDay} 天后的复诊，点击进入结算。`
    } else {
      // partial：继续问诊
      patientFeedbackText.value = ''
      statusNotice.value = '患者已经给出治疗后的反应，继续问诊后再决定下一轮治疗。'
      try {
        isGeneratingText.value = true
        narrativeError.value = ''
        const requestToken = beginConsultRequest()
        await refreshConsultOptions(requestToken)
        if (isCurrentConsultRequest(requestToken)) {
          isConsultOptionsReady.value = consultOptions.value.length > 0
        }
      } catch (error) {
        narrativeError.value = normalizeNarrativeError(error)
      } finally {
        isGeneratingText.value = false
      }
    }

    await saveProgress()
  }

  // ================================================================
  // advanceFromFeedback：点击结算按钮时生成 archiveStory，完成后跳转
  // ================================================================
  async function advanceFromFeedback() {
    await checkPendingDebts()
    if (!pendingSettlementRecord.value) return

    // 进入加载状态
    isGeneratingText.value = true
    narrativeError.value = ''

    try {
      // 生成结尾故事
      const archiveStory = await generateArchiveStory()

      if (archiveStory) {
        // 写入对话记录
        appendNarrationToHistory(archiveStory, 'closing_story')

        // 更新 pendingSettlementRecord 里的 archiveStory
        const updatedRecord = {
          ...pendingSettlementRecord.value,
          archiveStory,
          closingNarrative: archiveStory,
          // 同步更新 consultationHistory 快照
          consultationHistory: consultationHistory.value.map(item => ({ ...item }))
        }
        pendingSettlementRecord.value = updatedRecord

        // 同步更新 completedCases 里对应的记录
        completedCases.value = completedCases.value.map(item =>
          item.id === updatedRecord.id
            ? { ...item, archiveStory, closingNarrative: archiveStory, consultationHistory: updatedRecord.consultationHistory }
            : item
        )
      }
    } catch (error) {
      console.warn('Synesthesia 结尾故事生成失败:', error)
      // 生成失败不阻断流程，继续进入结算
    } finally {
      isGeneratingText.value = false
    }

    phase.value = 'settlement'
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
    const currentLevel = getEquipmentLevel(equipmentOverview.value, sourceId, targetId)
    const cost = getUpgradeCostByLevel(currentLevel)
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
    return currentEnvironmentProfile.value ?? null
  })

  const currentEnvironmentDescription = computed(() => {
    if (isEnvironmentLoading.value && !currentEnvironmentProfile.value) return '正在检测环境数据'
    if (environmentGenerationError.value) return `环境生成失败：${environmentGenerationError.value}`
    return currentEnvironment.value?.description || '环境信息暂不可用'
  })

  const activeEnvironment = computed(() => {
    return currentEnvironmentProfile.value
      ?? activePatient.value?.environmentProfile
      ?? null
  })

  const pendingRevisitCount = computed(() => revisitQueue.value.length)

  const dueRevisitCount = computed(() => {
    return revisitQueue.value.filter(item => Number(item.returnDay) <= gameDay.value).length
  })

  const hubStats = computed(() => {
    return [
      { label: '当前信用点', value: `${credits.value}`, meta: '本轮先保留字段，不接入经营结算' },
      { label: '已完成接待', value: `${patientCount.value}`, meta: '仅在完全治愈后增加' },
      { label: '当前游戏日', value: `第 ${gameDay.value} 天`, meta: currentEnvironmentDescription.value },
      { label: '待复诊患者', value: `${pendingRevisitCount.value}`, meta: dueRevisitCount.value > 0 ? `已有 ${dueRevisitCount.value} 名患者到期` : '暂无到期复诊' }
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
        upgradeCost: getUpgradeCostByLevel(getEquipmentLevel(equipmentOverview.value, item.id, targetId))
      }))
    }))
  })

  const waitingPatientCount = computed(() => waitingPatients.value.length)

  const canStartPatientFlow = computed(() => (
    Boolean(activePatient.value)
    || waitingPatients.value.length > 0
    || revisitQueue.value.some(item => Number(item.returnDay) <= gameDay.value)
  ))

  const patientArrivalStatusText = computed(() => {
    if (canStartPatientFlow.value) return '已有患者到访。'
    if (isEnvironmentLoading.value) return '正在检测环境数据。'
    if (environmentGenerationError.value) return '环境生成失败，请重新开始。'
    if (isQueueGenerating.value) return '正在整理候诊档案。'
    return '门外暂时没人。'
  })

  const patientArrivalActionLabel = computed(() => {
    if (activePatient.value) return '进入诊断室'
    if (canStartPatientFlow.value) return '开始就诊'
    if (isEnvironmentLoading.value) return '正在检测环境数据'
    if (environmentGenerationError.value) return '环境生成失败'
    if (isQueueGenerating.value) return '正在生成患者'
    return '门外暂时没人'
  })

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
    const allowBlindTreatment = diagnosisUsesLeft.value <= 0
    const symptomLevel = getMappingLevel(activeTrackingSheet.value?.mappingLevels, sourceId, targetId)
    const equipmentLevel = getEquipmentLevel(equipmentOverview.value, sourceId, targetId)
    if (!confirmed && !allowBlindTreatment) return false
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
    const allowBlindTreatment = diagnosisUsesLeft.value <= 0
    if (!confirmed && !allowBlindTreatment) {
      return { level: symptomLevel, disabled: true, reason: '需先由诊断仪确认' }
    }
    if (equipmentLevel < symptomLevel) {
      return { level: symptomLevel, disabled: true, reason: `需要 Lv.${symptomLevel} 治疗仪` }
    }
    return {
      level: symptomLevel,
      disabled: false,
      reason: confirmed ? `可由 Lv.${equipmentLevel} 治疗仪处理` : `可直接尝试治疗，结果需自行判断`
    }
  }

  const canSubmitDiagnosis = computed(() => {
    return phase.value === 'consult' && diagnosisUsesLeft.value > 0 && !isEmptyMapping(diagnosisDraft.value) && !isGeneratingText.value
  })

  const canEnterTreatment = computed(() => {
    const referenceMappings = activePatient.value?.trackingSheet?.unresolvedMappings ?? activePatient.value?.hiddenMappings
    const hasConfirmed = !isEmptyMapping(confirmedDiagnosis.value)
    const canBlindTreatment = diagnosisUsesLeft.value <= 0 && !isEmptyMapping(referenceMappings)
    return treatmentUsesLeft.value > 0
      && (hasConfirmed || canBlindTreatment)
      && !isEmptyMapping(filterTreatableMappings(referenceMappings))
      && !isGeneratingText.value
  })

  const canSubmitTreatment = computed(() => {
    return phase.value === 'treatment' && treatmentUsesLeft.value > 0 && !isEmptyMapping(filterTreatableMappings(treatmentDraft.value)) && !isGeneratingText.value
  })

  const latestCompletedCase = computed(() => completedCases.value[0] ?? null)
  const currentSettlementRecord = computed(() => pendingSettlementRecord.value ?? null)
  const archiveCases = computed(() => completedCases.value)
  const selectedArchiveCase = computed(() => {
    if (!archiveCases.value.length) return null
    return archiveCases.value.find(item => item.id === selectedArchiveCaseId.value) ?? archiveCases.value[0]
  })

  const settlementLevelSummary = computed(() => {
    const items = currentSettlementRecord.value?.settlementItems ?? []
    const grouped = items.reduce((acc, item) => {
      const level = Number(item.level || 1)
      const label = String(item.label || '').trim()
      const key = `${label}__${level}`
      if (!label) return acc
      if (!acc[key]) { acc[key] = { level, label, count: 0 } }
      acc[key].count += 1
      return acc
    }, {})
    return Object.values(grouped)
      .sort((a, b) => a.level - b.level || a.label.localeCompare(b.label, 'zh-Hans-CN'))
      .map(item => ({
        level: item.level,
        count: item.count,
        label: item.count > 1 ? `${item.label} · Lv.${item.level} × ${item.count}` : `${item.label} · Lv.${item.level}`
      }))
  })

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

  const currentFeedbackActionLabel = computed(() => '进入结算')

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
    return `诊断仪剩余 ${diagnosisUsesLeft.value} / ${DIAGNOSIS_LIMIT} 次 · 治疗仪剩余 ${treatmentUsesLeft.value} / ${TREATMENT_LIMIT} 次`
  })

  onMounted(() => {
    syncSaveStatus()
    syncResponsiveState()
    refreshPatientQueue().catch(error => {
      console.warn('Synesthesia 初始化候诊队列刷新失败:', error)
    })
    ensureQueueTimer()
    window.addEventListener('resize', syncResponsiveState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncResponsiveState)
    if (autosaveTimer) { clearTimeout(autosaveTimer) }
    if (queueTimer) { clearInterval(queueTimer) }
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
    showArchivePanel,
    showSettlementModal,
    isMobileLayout,
    equipmentExpanded,
    snapshotExpanded,
    showNotesDrawer,
    isGeneratingText,
    typingEntryId,
    isEnvironmentLoading,
    isQueueGenerating,
    statusNotice,
    narrativeError,
    patientFeedbackText,
    patientFeedbackOutcome,
    pendingSettlementRecord,
    currentSettlementRecord,
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
    diagnosisAttemptsLeft: diagnosisUsesLeft,
    diagnosisAttemptsTotal: DIAGNOSIS_LIMIT,
    treatmentDraft,
    revisitQueue,
    completedCases,
    archiveCases,
    phoneMessages,
    debtLedger,
    currentBackgroundPage,
    currentEnvironment,
    currentEnvironmentDescription,
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
    selectedArchiveCase,
    settlementLevelSummary,
    curedArchives,
    totalEarnings,
    totalCuredCount,
    totalEquipmentLevel,
    unreadPhoneCount,
    pendingDebtCount,
    latestArchiveLabel,
    canStartPatientFlow,
    patientArrivalStatusText,
    patientArrivalActionLabel,
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
    openArchivePanel,
    closeArchivePanel,
    selectArchiveCase,
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
    confirmSettlementAndReturn,
    toggleEquipmentSection,
    closeUpgradeFailureModal,
    toggleSnapshotSection,
    refreshConsultOptions,
    toggleNotesDrawer
  }
}
