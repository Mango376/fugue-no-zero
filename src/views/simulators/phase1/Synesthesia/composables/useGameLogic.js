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
  REVISIT_DELAY_MS,
  SENSE_CONFIGS,
  SENSE_LABELS,
  SENSE_TARGETS,
  SYSTEM_SNAPSHOT,
  TITLE_CONTENT,
  TREATMENT_LIMIT,
  getPresetRule
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
const VALID_PHASES = ['background_intro', 'hub', 'consult', 'treatment', 'patient_feedback', 'settlement', 'patient_records']
const VALID_CONSULT_STAGES = ['arrival_intro', 'questioning']
const VALID_CONSULT_ENTRY_STAGES = ['pre_consult', 'entering_consult', 'questioning']
const AUTOSAVE_DELAY = 400
const PATIENT_QUEUE_MAX = 3
const PATIENT_QUEUE_ROLL_INTERVAL_MS = 60 * 1000
const DEFAULT_SYMPTOM_LEVEL = 1
const MAX_SYMPTOM_LEVEL = 4
const DEBT_BORROW_PROBABILITY = 0.1
const DEBT_REPAY_CHECK_PROBABILITY = 0.4   // 每次半小时判定的成功概率

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

// ================================================================
// 工具函数
// ================================================================

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

function sortRevisitQueue(queue = []) {
  return [...queue].sort((a, b) => {
    const returnAtDelta = (a.returnAt ?? Number.POSITIVE_INFINITY) - (b.returnAt ?? Number.POSITIVE_INFINITY)
    if (returnAtDelta !== 0) return returnAtDelta
    return (a.serial ?? 0) - (b.serial ?? 0)
  })
}

function rotateArray(list, offset = 0) {
  if (!list.length) return []
  const normalizedOffset = ((offset % list.length) + list.length) % list.length
  return [...list.slice(normalizedOffset), ...list.slice(0, normalizedOffset)]
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
    type,
    read,
    createdAt: Date.now()
  }
}

// ================================================================
// 半小时判定时间计算
// 例：4:40 → 5:00，6:10 → 6:30，6:30:01 → 7:00
// ================================================================
function getNextHalfHourMark(from = Date.now()) {
  const date = new Date(from)
  const clone = new Date(date)
  clone.setSeconds(0, 0)

  if (date.getMinutes() < 30) {
    clone.setMinutes(30)
  } else {
    clone.setMinutes(0)
    clone.setHours(clone.getHours() + 1)
  }

  return clone.getTime()
}

function buildDefaultGameState() {
  return {
    phase: DEFAULT_GAME_STATE.phase,
    consultStage: DEFAULT_GAME_STATE.consultStage,
    consultEntryStage: 'pre_consult',
    backgroundPage: DEFAULT_GAME_STATE.backgroundPage,
    credits: DEFAULT_GAME_STATE.credits,
    patientCount: DEFAULT_GAME_STATE.patientCount,
    nextPatientSerial: DEFAULT_GAME_STATE.nextPatientSerial,
    patientSeedBase: createPatientSeedBase(),
    environmentPhase: DEFAULT_GAME_STATE.environmentPhase,
    currentEnvironmentProfile: null,
    playerProfile: { ...PLAYER_PROFILE },
    equipmentOverview: cloneEquipmentOverview(),
    earnedCreditsTotal: 0,
    patientsSinceEnvChange: 0, 
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
    // pair.key 格式是 "vision:taste"（无空格）
    // AI 有时会返回 "vision: taste"（带空格），两种都要兼容
    const level =
      levelMap?.[pair.key] ??
      levelMap?.[`${pair.source}: ${pair.target}`] ??
      DEFAULT_SYMPTOM_LEVEL
    acc[pair.key] = normalizeLevelValue(level)
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
  const rule = getPresetRule(patient.serial)
  const mappingLevels = buildInitialMappingLevels(patient, rule)
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
        newTarget
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

const JSON_FIELD_NAMES = [
  'response', 'text', 'content', 'reply',
  'narrative', 'answer', 'story', 'message', 'feedback'
]

function tryExtractFromJsonWrapper(text = '') {
  const cleaned = stripCodeFence(text)
  try {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      const parsed = JSON.parse(cleaned.slice(start, end + 1))
      if (parsed && typeof parsed === 'object') {
        for (const key of JSON_FIELD_NAMES) {
          if (typeof parsed[key] === 'string' && parsed[key].trim()) {
            return parsed[key].trim()
          }
        }
      }
    }
  } catch {
    // 解析失败，继续走正则兜底
  }

  const fieldPattern = new RegExp(
    `"(?:${JSON_FIELD_NAMES.join('|')})"\\s*:\\s*"`,
    'i'
  )
  const match = cleaned.match(fieldPattern)
  if (match) {
    const contentStart = match.index + match[0].length
    const raw = cleaned.slice(contentStart)
    const content = raw
      .replace(/"\s*}\s*$/, '')
      .replace(/",?\s*}\s*$/, '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim()
    if (content) return content
  }

  return text
}

function looksLikeWrongLanguage(text = '') {
  if (!text || text.length < 8) return false
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const totalChars = text.replace(/\s/g, '').length
  if (totalChars === 0) return false
  return chineseChars / totalChars < 0.2
}

function sanitizeNarrativeReply(text = '') {
  const extracted = tryExtractFromJsonWrapper(text)
  const cleaned = stripStructuredMarkers(stripCodeFence(extracted))
  if (!cleaned || looksLikePromptLeak(cleaned) || looksLikeWrongLanguage(cleaned)) {
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
    .replace(/[—\-–\s，。！？、：:"'`]/g, '')
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

// ================================================================
// useGameLogic 主体
// ================================================================

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
  const isBackgroundGenerating = ref(false) 
  const pendingTypingEntryId = ref('')
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
  const nextPatientSerial = ref(1)
  const patientSeedBase = ref(createPatientSeedBase())
  const patientsSinceEnvChange = ref(0)
  const environmentPhase = ref(1)
  const currentEnvironmentProfile = ref(null)
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
  let debtCheckTimer = null          // 债务半小时定时器
  let consultRequestToken = Symbol()
  let environmentGenerationPromise = null
  let queueGenerationPromise = null

  function beginConsultRequest() {
    consultRequestToken = Symbol()
    return consultRequestToken
  }

  function invalidateConsultRequest() {
    consultRequestToken = Symbol()
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
      initialMappingLevels: generatedLevelMap,
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
    const rule = getPresetRule(serial)
    let lastError = null

    if (!globalEnvironment) {
      throw new Error('当前环境尚未生成完成。')
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const payload = await generateStructuredReply(
          buildPatientGenerationPrompt({ serial, globalEnvironment, existingPatients, rule }),
          '患者信息'
        )
        const patient = normalizeGeneratedPatientPayload(payload, { serial, seedBase: patientSeedBase.value })
        patient.environmentProfile = cloneEnvironmentProfile(globalEnvironment)
        patient.environmentPhase = globalEnvironment.phase
        if (rule?.forceDebt) {
          patient.forceDebt = true
        }
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

        // 每生成3个患者后，先换环境再继续生成
        if (patientsSinceEnvChange.value >= 3) {
          patientsSinceEnvChange.value = 0
          await ensureCurrentEnvironmentProfile({
            force: true,
            previousEnvironmentDescription: currentEnvironmentProfile.value?.description || ''
          })
        }

        const patient = await generatePatient(nextPatientSerial.value)
        waitingPatients.value = [...waitingPatients.value, patient].slice(0, PATIENT_QUEUE_MAX)
        nextPatientSerial.value += 1
        patientsSinceEnvChange.value += 1
      }
    })()
      .finally(() => {
        queueGenerationPromise = null
      })
  }
  await queueGenerationPromise
}


  async function refreshPatientQueue(force = false) {
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

  // ================================================================
  // 债务定时器：每分钟检查一次是否到了整点/半点
  // ================================================================
  function ensureDebtCheckTimer() {
    if (debtCheckTimer) clearInterval(debtCheckTimer)
    debtCheckTimer = setInterval(() => {
      if (phase.value === 'title') return
      checkPendingDebts().catch(error => {
        console.warn('Synesthesia 债务定时检查失败:', error)
      })
    }, 60 * 1000)
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
      returnAt: Date.now() + REVISIT_DELAY_MS,
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

  // ================================================================
  // 赊账：随机触发
  // ================================================================
  function maybeCreateDebtRecord(patient, amount) {
    if (!patient || amount <= 0) return null
    if (Math.random() >= DEBT_BORROW_PROBABILITY) return null

    const repayAmount = Math.floor(amount * 1.2)
    const record = {
      id: `debt-${patient.id}-${Date.now()}`,
      patientId: patient.id,
      patientSnapshot: {
        name: patient.name,
        job: patient.job,
        attachment: patient.attachment,
        speechStyle: patient.speechStyle
      },
      amount,
      repayAmount,
      createdAt: Date.now(),
      nextCheckAt: getNextHalfHourMark(),   // 下次判定时间（下一个整点或半点）
      paidAt: null,
      status: 'pending'
    }

    debtLedger.value = [record, ...debtLedger.value]

    pushPhoneMessage(makePhoneMessage({
      sender: patient.name,
      title: '赊账申请',
      text: `我这边今天只能先记账。这次诊疗先欠你 ${amount} 信用点，等手头缓过来会补上。`,
      type: 'debt'
    }))

    return record
  }

  // ================================================================
  // 赊账：强制触发
  // ================================================================
  function createForcedDebtRecord(patient, amount) {
    if (!patient || amount <= 0) return null

    const repayAmount = Math.floor(amount * 1.2)
    const record = {
      id: `debt-${patient.id}-${Date.now()}`,
      patientId: patient.id,
      patientSnapshot: {
        name: patient.name,
        job: patient.job,
        attachment: patient.attachment,
        speechStyle: patient.speechStyle
      },
      amount,
      repayAmount,
      createdAt: Date.now(),
      nextCheckAt: getNextHalfHourMark(),
      paidAt: null,
      status: 'pending'
    }

    debtLedger.value = [record, ...debtLedger.value]

    pushPhoneMessage(makePhoneMessage({
      sender: patient.name,
      title: '赊账申请',
      text: `手头实在紧，今天先欠你 ${amount} 信用点。不会不还的。`,
      type: 'debt'
    }))

    return record
  }

  // ================================================================
  // 债务检查：每分钟由定时器触发，到了整点/半点则判定
  // ================================================================
  async function checkPendingDebts() {
    const now = Date.now()

    const debtsToCheck = debtLedger.value.filter(record =>
      record.status === 'pending' && Number(record.nextCheckAt || 0) <= now
    )

    if (!debtsToCheck.length) return

    let anyRepaid = false

    for (const record of debtsToCheck) {
      if (Math.random() < DEBT_REPAY_CHECK_PROBABILITY) {
        // 判定成功：还款
        record.status = 'paid'
        record.paidAt = now
        credits.value += record.repayAmount
        earnedCreditsTotal.value += record.repayAmount

        const hoursSinceDebt = Math.max(1, Math.floor((now - (record.createdAt || now)) / (60 * 60 * 1000)))

        let messageText = ''
        try {
          const prompt = buildMessagePrompt({
            patient: record.patientSnapshot,
            debtAmount: record.amount,
            returnAmount: record.repayAmount,
            hoursSinceDebt
          })
          const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
          messageText = sanitizeNarrativeReply(reply?.trim())
        } catch (error) {
          console.warn('Synesthesia 还款短信生成失败:', error)
        }

anyRepaid = true
if (messageText) {
  pushPhoneMessage(makePhoneMessage({
    sender: record.patientSnapshot.name,
    title: '转账与留言',
    text: messageText,
    type: 'payment',
    read: false
  }))
}

      } else {
        // 判定失败：推迟到下一个整点或半点
        record.nextCheckAt = getNextHalfHourMark(now)
      }
    }

    if (anyRepaid) {
      statusNotice.value = '收到新的银行转账与短信留言。'
    }

    scheduleProgressSave()
  }

  // ================================================================
  // 读档后重排：已超时但未判定的债务推到下一个整点/半点
  // 不立即触发判定，避免刚开游戏就收到一堆还款
  // ================================================================
  function rescheduleOverdueDebts() {
    const now = Date.now()
    let changed = false

    debtLedger.value = debtLedger.value.map(record => {
      if (record.status !== 'pending') return record

      // 兼容旧存档（没有 nextCheckAt 字段），或已过期未判定的
      if (!record.nextCheckAt || record.nextCheckAt <= now) {
        changed = true
        return {
          ...record,
          createdAt: record.createdAt || now,
          nextCheckAt: getNextHalfHourMark(now)
        }
      }

      return record
    })

    if (changed) scheduleProgressSave()
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
      : `患者已预约复诊。`
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
      consultEntryStage: consultEntryStage.value,
      backgroundPage: backgroundPage.value,
      credits: credits.value,
      earnedCreditsTotal: earnedCreditsTotal.value,
      patientCount: patientCount.value,
      nextPatientSerial: nextPatientSerial.value,
      patientSeedBase: patientSeedBase.value,
      patientsSinceEnvChange: patientsSinceEnvChange.value,
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
    nextPatientSerial.value = Math.max(1, Number(rawState.nextPatientSerial ?? fallback.nextPatientSerial) || 1)
    patientSeedBase.value = Number.isFinite(rawState.patientSeedBase) ? rawState.patientSeedBase : fallback.patientSeedBase
    patientsSinceEnvChange.value = Number.isFinite(rawState.patientsSinceEnvChange)
  ? rawState.patientsSinceEnvChange
  : 0

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
      .map(item => clonePatient(item))
      .filter(Boolean)
      .slice(0, PATIENT_QUEUE_MAX)
  : []
    lastQueueRollAt.value = Number.isFinite(rawState.lastQueueRollAt) ? rawState.lastQueueRollAt : Date.now()
    activePatient.value = clonePatient(rawState.activePatient)
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

    // ── 债务读档（兼容旧存档，补 nextCheckAt 字段）──
    debtLedger.value = Array.isArray(rawState.debtLedger)
      ? rawState.debtLedger.map(item => {
          if (!item) return null
          const record = cloneDebtRecord(item)
          if (record && record.status === 'pending' && !record.nextCheckAt) {
            record.createdAt = record.createdAt || Date.now()
            record.nextCheckAt = getNextHalfHourMark()
          }
          return record
        }).filter(Boolean)
      : []

    diagnosisDraft.value = normalizeMapping(rawState.diagnosisDraft)
    confirmedDiagnosis.value = normalizeMapping(rawState.confirmedDiagnosis)
    updateDiagnosisUses(rawState.diagnosisUsesLeft ?? activePatient.value?.diagnosisUsesLeft ?? DIAGNOSIS_LIMIT)
    updateTreatmentUses(rawState.treatmentUsesLeft ?? activePatient.value?.treatmentUsesLeft ?? TREATMENT_LIMIT)
    treatmentDraft.value = normalizeMapping(rawState.treatmentDraft)
    revisitQueue.value = sortRevisitQueue(
      Array.isArray(rawState.revisitQueue)
        ? rawState.revisitQueue.map(item => {
    const patient = clonePatient(item)
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
      rescheduleOverdueDebts()
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

    // 读档后重排超时债务（不立即触发判定）
    rescheduleOverdueDebts()
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
    narrativeError.value = ''
    await ensureCurrentEnvironmentProfile({
      force: !currentEnvironmentProfile.value,
      previousEnvironmentDescription: currentEnvironmentProfile.value?.description || ''
    })
    refreshPatientQueue(true).catch(error => {
      console.warn('Synesthesia 读档后候诊队列刷新失败:', error)
    })
    statusNotice.value = ''
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

  function normalizeConsultStateForSuspension() {
    if (consultEntryStage.value === 'questioning') {
      isConsultNarrativeReady.value = consultationHistory.value.length > 0
      isConsultOptionsReady.value = consultOptions.value.length > 0
      return
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
  }

  async function returnToHub() {
  // 如果 AI 正在生成，转入后台而不是中断
  if (isGeneratingText.value) {
    isBackgroundGenerating.value = true
    isGeneratingText.value = false
    // consultEntryStage 保持 'entering_consult' 不动
    // 不调用 invalidateConsultRequest()，让请求继续跑
  } else {
    // 没有生成中，正常处理阶段转换
    normalizeConsultStateForSuspension()
  }

  phase.value = 'hub'
  statusNotice.value = ''
  try {
    await saveProgress()
  } catch (error) {
    console.warn('Synesthesia 返回 hub 前保存失败:', error)
  }
}


  async function returnToTitle() {
    invalidateConsultRequest()
    isGeneratingText.value = false
    isBackgroundGenerating.value = false
    typingEntryId.value = ''
    pendingTypingEntryId.value = ''
    normalizeConsultStateForSuspension()
    if (phase.value !== 'title') {
      try {
        await saveProgress()
      } catch (error) {
        console.warn('Synesthesia 返回 title 前保存失败:', error)
      }
    }
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
    const referenceMappings = patient.hiddenMappings ?? patient.originalMappings
    const estimatedIncome = getMappingPairs(referenceMappings).reduce((sum, pair) => {
      const level = getMappingLevel(patient.initialMappingLevels ?? {}, pair.source, pair.target)
      return sum + getTreatmentFeeByLevel(level)
    }, 0)
    const parsedSheet = await generateStructuredReply(
      buildTrackingSheetPrompt({ patient, environment, estimatedIncome }),
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

  async function fetchArrivalNarrativeText(requestToken = null) {
    if (!activePatient.value) return ''
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
        return ''
      }
      if (!trimmed) {
        throw new Error('AI 返回了空白内容。')
      }
      const safeText = sanitizeNarrativeReply(trimmed)
      if (!safeText) {
        throw new Error('AI 返回的到诊文本无效。')
      }
      return safeText
    } catch (error) {
      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return ''
      }
      narrativeError.value = normalizeNarrativeError(error)
      return ''
    }
  }

  function pullDueRevisitPatient() {
    const dueIndex = revisitQueue.value.findIndex(item => Number(item.returnAt) <= Date.now())
    if (dueIndex === -1) return null
    const patient = revisitQueue.value[dueIndex]
revisitQueue.value = [
  ...revisitQueue.value.slice(0, dueIndex),
  ...revisitQueue.value.slice(dueIndex + 1)
]
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
    revisitingPatient.returnAt = null
    if (revisitingPatient.trackingSheet) {
      revisitingPatient.trackingSheet.patientProfile.visitCount = revisitingPatient.visitCount
    }
    revisitingPatient = applyRevisitMutation(revisitingPatient, revisitEnvironment, Date.now())
    return revisitingPatient
  }

  async function startPatientFlow() {
    if (isGeneratingText.value) return
    if (activePatient.value) {
  phase.value = 'consult'
  await saveProgress()

  // 情况 A：后台已完成，有待触发的打字机内容
  if (pendingTypingEntryId.value && !isBackgroundGenerating.value) {
    const tid = pendingTypingEntryId.value
    pendingTypingEntryId.value = ''
    typingEntryId.value = tid   // 触发打字机
    return
  }

  // 情况 B：后台仍在运行 → 显示转圈，等它自己完成
  if (isBackgroundGenerating.value) {
    isGeneratingText.value = true
    // 后台任务完成时会自动更新状态和打字机，不需要额外操作
    return
  }

  // 情况 C：正常流程
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
  typingEntryId.value = ''
  narrativeError.value = ''

  await saveProgress()

  try {
    if (activePatient.value && !activePatient.value.trackingSheetReady) {
      const generatedTrackingSheet = await generateTrackingSheet(activePatient.value)
      if (!isCurrentConsultRequest(requestToken)) return
      activePatient.value = {
  ...activePatient.value,
  trackingSheet: generatedTrackingSheet,
  trackingSheetReady: true
}
    }

    const arrivalText = await fetchArrivalNarrativeText(requestToken)
    if (!isCurrentConsultRequest(requestToken)) return

    if (!arrivalText) {
      consultEntryStage.value = 'pre_consult'
      return
    }

    const arrivalEntry = makeHistoryEntry({
      speaker: 'narrator',
      label: activePatient.value.visitCount > 1 ? '复诊来访' : '到诊记录',
      text: arrivalText,
      type: 'arrival'
    })

    const nextHistory = [arrivalEntry]

    const recentDoctorLines = nextHistory
      .filter(item => item?.speaker === 'doctor')
      .slice(-3)
      .map(item => item.text)

    const prompt = buildConsultOptionsPrompt({
      patient: activePatient.value,
      environment: activeEnvironment.value,
      trackingSheet: activePatient.value.trackingSheet,
      consultationHistory: nextHistory.slice(-8),
      consultNotes: consultNotes.value,
      diagnosisDraft: diagnosisDraft.value,
      confirmedDiagnosis: confirmedDiagnosis.value,
      diagnosisUsed: DIAGNOSIS_LIMIT - diagnosisUsesLeft.value
    })

    const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
    if (!isCurrentConsultRequest(requestToken)) return

    const parsedOptions = parseOptionPayload(reply, recentDoctorLines)
    if (!parsedOptions.length) {
      throw new Error('AI 返回的问诊选项为空。')
    }

    // ── 写入状态 ──
    consultationHistory.value = nextHistory
    consultOptions.value = parsedOptions
    isConsultNarrativeReady.value = true
    isConsultOptionsReady.value = true
    consultEntryStage.value = 'questioning'
    consultStage.value = 'questioning'

    // ── 打字机：在问诊页则立即触发，不在则存起来等回来 ──
    if (phase.value === 'consult') {
      typingEntryId.value = arrivalEntry.id
    } else {
      pendingTypingEntryId.value = arrivalEntry.id
    }

  } catch (error) {
    if (isCurrentConsultRequest(requestToken)) {
      consultEntryStage.value = 'pre_consult'
      consultOptions.value = []
      isConsultOptionsReady.value = false
      narrativeError.value = `后台追踪表生成失败：${normalizeNarrativeError(error)}`
    }
  } finally {
    if (isCurrentConsultRequest(requestToken)) {
      isGeneratingText.value = false
      isBackgroundGenerating.value = false
      await saveProgress()
    }
  }
}

  async function refreshConsultOptions(requestToken = null) {
    if (pendingSettlementRecord.value) {
      consultOptions.value = []
      isConsultOptionsReady.value = false
      return []
    }

    if (!activePatient.value) {
      consultOptions.value = []
      isConsultOptionsReady.value = false
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
        consultationHistory: consultationHistory.value.slice(-8),
        consultNotes: consultNotes.value,
        diagnosisDraft: diagnosisDraft.value,
        confirmedDiagnosis: confirmedDiagnosis.value,
        diagnosisUsed: DIAGNOSIS_LIMIT - diagnosisUsesLeft.value
      })
      const reply = await aiService.generateReply(prompt, SYSTEM_PROMPT)
      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return []
      }
      const parsedOptions = parseOptionPayload(reply, recentDoctorLines)
      if (parsedOptions.length > 0) {
        consultOptions.value = parsedOptions
        isConsultOptionsReady.value = true
        return consultOptions.value
      }
      throw new Error('AI 返回的问诊选项为空。')
    } catch (error) {
      if (requestToken !== null && !isCurrentConsultRequest(requestToken)) {
        return []
      }
      console.warn('Synesthesia 问诊选项生成失败:', error)
      consultOptions.value = []
      isConsultOptionsReady.value = false
      narrativeError.value = `问诊选项生成失败：${normalizeNarrativeError(error)}`
      return []
    }
  }

  async function retryConsultOptions() {
    if (!activePatient.value || pendingSettlementRecord.value) return []
    const requestToken = beginConsultRequest()
    isGeneratingText.value = true
    narrativeError.value = ''
    isConsultOptionsReady.value = false

    try {
      const options = await refreshConsultOptions(requestToken)
      if (!isCurrentConsultRequest(requestToken)) return []
      isConsultOptionsReady.value = options.length > 0
      if (options.length > 0) {
        isConsultNarrativeReady.value = true
      }
      return options
    } catch (error) {
      if (!isCurrentConsultRequest(requestToken)) return []
      narrativeError.value = normalizeNarrativeError(error)
      if (consultationHistory.value.length > 0) {
        isConsultNarrativeReady.value = true
      }
      return []
    } finally {
      if (isCurrentConsultRequest(requestToken)) {
        isGeneratingText.value = false
        await saveProgress()
      }
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
        consultationHistory: [...historyBeforeChoice, doctorEntry].slice(-8),
        consultNotes: consultNotes.value,
        diagnosisDraft: diagnosisDraft.value,
        confirmedDiagnosis: confirmedDiagnosis.value,
        visitCount: activePatient.value.visitCount,
        currentRound: historyBeforeChoice.filter(e => e.speaker === 'doctor').length + 1
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

      const nextHistory = [...historyBeforeChoice, doctorEntry, patientEntry]

      const recentDoctorLines = nextHistory
        .filter(item => item?.speaker === 'doctor')
        .slice(-3)
        .map(item => item.text)

      const optionPrompt = buildConsultOptionsPrompt({
        patient: activePatient.value,
        environment: activeEnvironment.value,
        trackingSheet: activePatient.value.trackingSheet,
        consultationHistory: nextHistory.slice(-8),
        consultNotes: consultNotes.value,
        diagnosisDraft: diagnosisDraft.value,
        confirmedDiagnosis: confirmedDiagnosis.value,
        diagnosisUsed: DIAGNOSIS_LIMIT - diagnosisUsesLeft.value
      })

      const optionReply = await aiService.generateReply(optionPrompt, SYSTEM_PROMPT)

      if (!isCurrentConsultRequest(requestToken)) return

      const parsedOptions = parseOptionPayload(optionReply, recentDoctorLines)

      if (!parsedOptions.length) {
        throw new Error('AI 返回的问诊选项为空。')
      }

      consultationHistory.value = nextHistory
      consultOptions.value = parsedOptions
      isConsultNarrativeReady.value = true
      isConsultOptionsReady.value = true
      consultEntryStage.value = 'questioning'
      consultStage.value = 'questioning'
      if (phase.value === 'consult') {
  typingEntryId.value = patientEntry.id
} else {
  pendingTypingEntryId.value = patientEntry.id
}

    } catch (error) {
      if (isCurrentConsultRequest(requestToken)) {
        narrativeError.value = normalizeNarrativeError(error)
        consultOptions.value = []
        isConsultOptionsReady.value = false
        if (consultationHistory.value.length > 0) {
          isConsultNarrativeReady.value = true
        }
      }
    } finally {
      if (isCurrentConsultRequest(requestToken)) {
        isGeneratingText.value = false
        await saveProgress()
      }
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
  activePatient.value = {
    ...activePatient.value,
    trackingSheet: {
      ...activePatient.value.trackingSheet,
      confirmedMappings: cloneMapping(nextConfirmed)
    }
  }
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

    // 先在副本上完成所有 trackingSheet 修改，不污染原始引用
    let nextTrackingSheet = null
    if (activePatient.value.trackingSheet) {
      const sheet = cloneTrackingSheet(activePatient.value.trackingSheet)
      sheet.unresolvedMappings = cloneMapping(remainingMappings)
      sheet.confirmedMappings = intersectMappings(confirmedDiagnosis.value, remainingMappings)
      sheet.resolvedMappings = mergeMappings(sheet.resolvedMappings, resolvedMappings)
      sheet.healedMappings = mergeMappings(sheet.healedMappings, resolvedMappings)
      sheet.abnormalCount = countMappings(remainingMappings)
      if (!isEmptyMapping(resolvedMappings)) {
        appendSymptomLedger(
          sheet,
          `已治愈：~~${formatPairList(resolvedMappings)}~~`
        )
        appendTrackingLog(
          sheet,
          debtRecord
            ? `本轮治愈：${formatPairList(resolvedMappings)}；应收 ${settlementTotal} 信用点，已记入赊账`
            : `本轮治愈：${formatPairList(resolvedMappings)}；已收 ${settlementTotal} 信用点`
        )
      }
      nextTrackingSheet = sheet
    }

    activePatient.value = {
      ...activePatient.value,
      hiddenMappings: remainingMappings,
      trackingSheet: nextTrackingSheet
    }

    confirmedDiagnosis.value = intersectMappings(confirmedDiagnosis.value, remainingMappings)
    treatmentDraft.value = cloneMapping(confirmedDiagnosis.value)
    patientFeedbackOutcome.value = 'partial'

    moveToConsultAfterTreatment()
    showNotesDrawer.value = false
    pendingSettlementRecord.value = null
    showSettlementModal.value = false

    if (!debtRecord) {
      credits.value += settlementTotal
      earnedCreditsTotal.value += settlementTotal
    }

    if (isEmptyMapping(remainingMappings)) {
      patientFeedbackOutcome.value = 'complete'
      patientCount.value += 1
      consultOptions.value = []
      isConsultOptionsReady.value = false
    } else if (treatmentUsesLeft.value <= 0) {
      patientFeedbackOutcome.value = 'revisit'
      consultOptions.value = []
      isConsultOptionsReady.value = false
      const returnAt = Date.now() + REVISIT_DELAY_MS
      const revisitPatient = { ...clonePatient(activePatient.value), returnAt }
      activePatient.value = { ...activePatient.value, returnAt }
      revisitQueue.value = sortRevisitQueue([...revisitQueue.value, revisitPatient])
    }

    await generateTreatmentFeedback({
      resolvedMappings,
      remainingMappings,
      outcome: patientFeedbackOutcome.value
    })

    appendTreatmentFeedbackToHistory(patientFeedbackText.value)

    if (patientFeedbackOutcome.value === 'complete' || patientFeedbackOutcome.value === 'revisit') {
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
        : `已为患者预约复诊，点击进入结算。`
    } else {
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

  async function advanceFromFeedback() {
    await checkPendingDebts()
    if (!pendingSettlementRecord.value) return

    isGeneratingText.value = true
    narrativeError.value = ''

    try {
      const archiveStory = await generateArchiveStory()

      if (archiveStory) {
        appendNarrationToHistory(archiveStory, 'closing_story')

        const updatedRecord = {
          ...pendingSettlementRecord.value,
          archiveStory,
          closingNarrative: archiveStory,
          consultationHistory: consultationHistory.value.map(item => ({ ...item }))
        }
        pendingSettlementRecord.value = updatedRecord

        completedCases.value = completedCases.value.map(item =>
          item.id === updatedRecord.id
            ? { ...item, archiveStory, closingNarrative: archiveStory, consultationHistory: updatedRecord.consultationHistory }
            : item
        )
      }
    } catch (error) {
      console.warn('Synesthesia 结尾故事生成失败:', error)
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

  // ================================================================
  // 计算属性
  // ================================================================

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
    return revisitQueue.value.filter(item => Number(item.returnAt) <= Date.now()).length
  })

  const hubStats = computed(() => {
    return [
      { label: '当前信用点', value: `${credits.value}`, meta: '本轮先保留字段，不接入经营结算' },
      { label: '已完成接待', value: `${patientCount.value}`, meta: '仅在完全治愈后增加' },
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
    || revisitQueue.value.some(item => Number(item.returnAt) <= Date.now())
  ))

  const patientArrivalStatusText = computed(() => {
  if (isBackgroundGenerating.value) return '正在为患者准备诊断资料……'
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

  // ================================================================
  // 生命周期
  // ================================================================

  onMounted(() => {
    syncSaveStatus()
    syncResponsiveState()
    refreshPatientQueue().catch(error => {
      console.warn('Synesthesia 初始化候诊队列刷新失败:', error)
    })
    ensureQueueTimer()
    ensureDebtCheckTimer()   // ← 启动债务半小时定时器
    window.addEventListener('resize', syncResponsiveState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncResponsiveState)
    if (autosaveTimer) { clearTimeout(autosaveTimer) }
    if (queueTimer) { clearInterval(queueTimer) }
    if (debtCheckTimer) { clearInterval(debtCheckTimer) }   // ← 清理债务定时器
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
    treatmentAttemptsLeft: treatmentUsesLeft,
    treatmentAttemptsTotal: TREATMENT_LIMIT,
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
    isBackgroundGenerating,
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
    retryConsultOptions,
    toggleNotesDrawer
  }
}
