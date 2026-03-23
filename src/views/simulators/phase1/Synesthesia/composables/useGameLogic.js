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
  PATIENT_ATTACHMENT_POOL,
  PATIENT_JOB_POOL,
  PATIENT_NAME_POOL,
  PATIENT_SPEECH_STYLE_POOL,
  PATIENT_TONE_POOL,
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
import { SYSTEM_PROMPT } from '../prompts/systemPrompt'

const SCRIPT_ID = 'synesthesia'
const ARCHIVE_PREFIX = `${SCRIPT_ID}-archive-`
const VALID_PHASES = ['background_intro', 'hub', 'consult', 'treatment', 'patient_feedback']
const VALID_CONSULT_STAGES = ['arrival_intro', 'questioning']
const VALID_CONSULT_ENTRY_STAGES = ['pre_consult', 'entering_consult', 'questioning']
const AUTOSAVE_DELAY = 400
const BASE_TREATMENT_FEE = 30
const DEFAULT_SYMPTOM_LEVEL = 1
const MAX_SYMPTOM_LEVEL = 4

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

function clonePatient(patient) {
  if (!patient) return null

  return {
    ...patient,
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
    environmentPhase: DEFAULT_GAME_STATE.environmentPhase,
    playerProfile: { ...PLAYER_PROFILE },
    equipmentOverview: cloneEquipmentOverview(),
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

function pickInitialMappingLevel(patient, sourceId, targetId) {
  const seed = (Number(patient?.serial || 1) * 19)
    + (Number(patient?.visitCount || 1) * 7)
    + sourceId.length
    + targetId.length

  return seed % 100 < 78 ? 1 : 2
}

function buildInitialMappingLevels(patient) {
  return getMappingPairs(patient?.originalMappings ?? {}).reduce((acc, pair) => {
    acc[pair.key] = pickInitialMappingLevel(patient, pair.source, pair.target)
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

function parseOptionPayload(text, recentDoctorLines = []) {
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
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

function buildGeneratedMappings(seed) {
  const next = createEmptyMapping()
  const sources = rotateArray(SENSE_CONFIGS.map(item => item.id), seed).slice(0, seed % 2 === 0 ? 2 : 3)

  sources.forEach((sourceId, index) => {
    const candidates = rotateArray(SENSE_TARGETS[sourceId], seed + index + 1)
    next[sourceId] = candidates.slice(0, index % 2 === 0 ? 1 : 2)
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
  const patientCount = ref(0)
  const gameDay = ref(1)
  const lastTimeSyncAt = ref(Date.now())
  const nextPatientSerial = ref(1)
  const environmentPhase = ref(1)
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

  let autosaveTimer = null
  let queueTimer = null
  let consultRequestToken = 0

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

  function createPatient(serial, envPhase) {
    const job = pickFrom(PATIENT_JOB_POOL, serial * 7 + envPhase * 3)
    const generatedMappings = buildGeneratedMappings(serial + envPhase)

    return {
      id: `synesthesia-patient-${serial}-${Date.now()}`,
      serial,
      name: pickFrom(PATIENT_NAME_POOL, serial * 5 + envPhase * 2),
      job: job.title,
      jobContext: job.context,
      attachment: pickFrom(PATIENT_ATTACHMENT_POOL, serial * 3 + envPhase),
      emotionalTone: pickFrom(PATIENT_TONE_POOL, serial * 5 + envPhase),
      speechStyle: pickFrom(PATIENT_SPEECH_STYLE_POOL, serial * 7 + envPhase),
      visitCount: 1,
      environmentPhase: envPhase,
      diagnosisUsesLeft: DIAGNOSIS_LIMIT,
      hiddenMappings: cloneMapping(generatedMappings),
      originalMappings: cloneMapping(generatedMappings),
      trackingSheet: null,
      trackingSheetReady: false
    }
  }

  function maybeShiftEnvironment(daysPassed = 1) {
    let nextPhase = environmentPhase.value

    for (let index = 0; index < daysPassed; index += 1) {
      const seed = gameDay.value + index + nextPatientSerial.value
      if (seed % 100 < 42) {
        nextPhase = computeEnvironmentPhase(gameDay.value + index + 1)
      }
    }

    environmentPhase.value = nextPhase
  }

  function refreshPatientQueue() {
    const now = Date.now()
    const elapsed = Math.max(0, now - lastQueueRollAt.value)
    const refreshTurns = Math.max(1, Math.floor(elapsed / (15 * 60 * 1000)))
    let added = 0

    for (let turn = 0; turn < refreshTurns; turn += 1) {
      if (waitingPatients.value.length >= 3) break

      const seed = nextPatientSerial.value + gameDay.value + turn + waitingPatients.value.length
      if (seed % 100 < 48) {
        waitingPatients.value = [
          ...waitingPatients.value,
          createPatient(nextPatientSerial.value, environmentPhase.value)
        ].slice(0, 3)
        nextPatientSerial.value += 1
        added += 1
      }
    }

    if (!waitingPatients.value.length && added === 0) {
      waitingPatients.value = [createPatient(nextPatientSerial.value, environmentPhase.value)]
      nextPatientSerial.value += 1
    }

    lastQueueRollAt.value = now
    nowTick.value = now
  }

  function ensureQueueTimer() {
    if (queueTimer) clearInterval(queueTimer)

    queueTimer = setInterval(() => {
      if (phase.value === 'consult' || phase.value === 'treatment' || phase.value === 'patient_feedback') return
      refreshPatientQueue()
      scheduleProgressSave()
    }, 60000)
  }

  function popWaitingPatient() {
    if (!waitingPatients.value.length) return null

    const [nextPatient, ...rest] = waitingPatients.value
    waitingPatients.value = rest
    refreshPatientQueue()
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
      patientCount: patientCount.value,
      gameDay: gameDay.value,
      lastTimeSyncAt: lastTimeSyncAt.value,
      nextPatientSerial: nextPatientSerial.value,
      environmentPhase: environmentPhase.value,
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
    patientCount.value = Number.isFinite(rawState.patientCount) ? rawState.patientCount : fallback.patientCount
    gameDay.value = Math.max(1, Number(rawState.gameDay ?? fallback.gameDay) || 1)
    lastTimeSyncAt.value = Number.isFinite(rawState.lastTimeSyncAt) ? rawState.lastTimeSyncAt : fallback.lastTimeSyncAt
    nextPatientSerial.value = Math.max(1, Number(rawState.nextPatientSerial ?? fallback.nextPatientSerial) || 1)
    environmentPhase.value = ENVIRONMENT_PHASES.some(item => item.phase === rawState.environmentPhase)
      ? rawState.environmentPhase
      : computeEnvironmentPhase(gameDay.value)

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
      const patientEnvironment = ENVIRONMENT_PHASES.find(item => item.phase === (activePatient.value.environmentPhase ?? environmentPhase.value)) ?? ENVIRONMENT_PHASES[0]
      activePatient.value.trackingSheet = buildFallbackTrackingSheet(activePatient.value, patientEnvironment)
    }
    consultationHistory.value = Array.isArray(rawState.consultationHistory)
      ? rawState.consultationHistory.map(item => ({ ...item }))
      : []
    consultOptions.value = Array.isArray(rawState.consultOptions) && rawState.consultOptions.length
      ? rawState.consultOptions.map(item => ({ ...item }))
      : getConsultOptions()
    consultNotes.value = typeof rawState.consultNotes === 'string' ? rawState.consultNotes : ''
    isConsultNarrativeReady.value = Boolean(rawState.isConsultNarrativeReady)
    isConsultOptionsReady.value = Boolean(rawState.isConsultOptionsReady)
    diagnosisDraft.value = normalizeMapping(rawState.diagnosisDraft)
    confirmedDiagnosis.value = normalizeMapping(rawState.confirmedDiagnosis)
    updateDiagnosisUses(rawState.diagnosisUsesLeft ?? activePatient.value?.diagnosisUsesLeft ?? DIAGNOSIS_LIMIT)
    treatmentDraft.value = normalizeMapping(rawState.treatmentDraft)
    revisitQueue.value = sortRevisitQueue(
      Array.isArray(rawState.revisitQueue)
        ? rawState.revisitQueue.map(item => {
          const patient = clonePatient(item)
          if (patient && !patient.trackingSheet) {
            const patientEnvironment = ENVIRONMENT_PHASES.find(env => env.phase === (patient.environmentPhase ?? environmentPhase.value)) ?? ENVIRONMENT_PHASES[0]
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
      environmentPhase.value = computeEnvironmentPhase(gameDay.value)
      return 0
    }

    const elapsed = Math.max(0, Date.now() - previousSyncAt)
    const passedDays = Math.floor(elapsed / REAL_MS_PER_GAME_DAY)

    if (passedDays > 0) {
      gameDay.value += passedDays
      maybeShiftEnvironment(passedDays)
      refreshPatientQueue()
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
    environmentPhase.value = computeEnvironmentPhase(gameDay.value)
    refreshPatientQueue()
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
    refreshPatientQueue()

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

      consultationHistory.value = [
        makeHistoryEntry({
          speaker: 'narrator',
          label: activePatient.value.visitCount > 1 ? '复诊来访' : '到诊记录',
          text: trimmed,
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

    revisitingPatient.visitCount = Number(revisitingPatient.visitCount || 1) + 1
    revisitingPatient.environmentPhase = environmentPhase.value
    revisitingPatient.returnDay = null
    if (revisitingPatient.trackingSheet) {
      revisitingPatient.trackingSheet.patientProfile.visitCount = revisitingPatient.visitCount
    }
    revisitingPatient = applyRevisitMutation(revisitingPatient, activeEnvironment.value, gameDay.value)

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
    refreshPatientQueue()
    const nextPatient = revisitingPatient || popWaitingPatient()

    if (!nextPatient) {
      statusNotice.value = '当前还没有患者到诊，门外暂时安静。'
      await saveProgress()
      return
    }

    nextPatient.trackingSheet = revisitingPatient?.trackingSheet
      ? cloneTrackingSheet(revisitingPatient.trackingSheet)
      : buildFallbackTrackingSheet(nextPatient, activeEnvironment.value)
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

      consultationHistory.value = [
        ...historyBeforeChoice,
        doctorEntry,
        makeHistoryEntry({
          speaker: 'patient',
          label: activePatient.value.name,
          text: trimmed,
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

      if (!trimmed) {
        throw new Error('AI 返回了空白内容。')
      }

      patientFeedbackText.value = trimmed
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
          `本轮治愈：${formatPairList(resolvedMappings)}；结算 ${settlementTotal} 信用点`
        )
      }
    }

    confirmedDiagnosis.value = intersectMappings(confirmedDiagnosis.value, remainingMappings)
    treatmentDraft.value = cloneMapping(confirmedDiagnosis.value)
    patientFeedbackOutcome.value = 'partial'
    phase.value = 'patient_feedback'
    credits.value += settlementTotal

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
        feedbackText: patientFeedbackText.value
      }))
    } else if (patientFeedbackOutcome.value === 'revisit') {
      pushCompletedCase(buildCompletedCaseRecord('revisit', {
        settlementItems,
        settlementTotal,
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
    return ENVIRONMENT_PHASES.find(item => item.phase === environmentPhase.value) ?? ENVIRONMENT_PHASES[0]
  })

  const activeEnvironment = computed(() => {
    const phaseId = activePatient.value?.environmentPhase ?? environmentPhase.value
    return ENVIRONMENT_PHASES.find(item => item.phase === phaseId) ?? currentEnvironment.value
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
  const totalEarnings = computed(() => completedCases.value.reduce((sum, item) => sum + Number(item.settlementTotal || 0), 0))
  const totalCuredCount = computed(() => completedCases.value.filter(item => item.outcome === 'complete').length)
  const totalEquipmentLevel = computed(() => equipmentOverview.value.reduce((sum, item) => sum + Number(item.level || 0), 0))
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
    refreshPatientQueue()
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
    latestArchiveLabel,
    currentFeedbackActionLabel,
    feedbackOutcomeLabel,
    activePatientSummary,
    diagnosisAttemptLabel,
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

