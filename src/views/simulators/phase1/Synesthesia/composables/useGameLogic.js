import { computed, ref } from 'vue'
import {
  AI_TIMELINE,
  ANOMALY_LEVELS,
  DEVICE_SYSTEM,
  DEV_MILESTONES,
  ECONOMY_RULES,
  ENVIRONMENT_FACTORS,
  FILE_STRUCTURE,
  GAME_LOOP_STEPS,
  GAME_OVERVIEW,
  PRESET_PATIENTS,
  SENSOR_SYSTEM
} from '../data/gameContent'
import { buildDialoguePrompt, buildPatientSeedPrompt, buildTreatmentPrompt } from '../prompts/promptBuilder'
import { SYSTEM_PROMPT } from '../prompts/systemPrompt'
import { WORLD_BOOK } from '../prompts/worldBook'

export function useGameLogic() {
  const phase = ref('title')
  const activePanel = ref('overview')
  const selectedPatientId = ref(PRESET_PATIENTS[0]?.id ?? null)
  const promptMode = ref('seed')

  const panels = [
    { id: 'overview', label: '项目概述' },
    { id: 'loop', label: '核心循环' },
    { id: 'systems', label: '系统设计' },
    { id: 'patients', label: '患者样例' },
    { id: 'architecture', label: '技术结构' }
  ]

  const selectedPatient = computed(
    () => PRESET_PATIENTS.find(item => item.id === selectedPatientId.value) ?? PRESET_PATIENTS[0]
  )

  const promptPreview = computed(() => {
    if (!selectedPatient.value) return ''
    if (promptMode.value === 'dialogue') return buildDialoguePrompt(selectedPatient.value)
    if (promptMode.value === 'treatment') return buildTreatmentPrompt(selectedPatient.value)
    return buildPatientSeedPrompt(selectedPatient.value)
  })

  function enterWorkbench() {
    phase.value = 'workbench'
  }

  function goBackToTitle() {
    phase.value = 'title'
  }

  function setActivePanel(panelId) {
    activePanel.value = panelId
  }

  function selectPatient(patientId) {
    selectedPatientId.value = patientId
  }

  function setPromptMode(mode) {
    promptMode.value = mode
  }

  return {
    phase,
    activePanel,
    panels,
    promptMode,
    selectedPatientId,
    selectedPatient,
    promptPreview,
    enterWorkbench,
    goBackToTitle,
    setActivePanel,
    selectPatient,
    setPromptMode,
    aiTimeline: AI_TIMELINE,
    anomalyLevels: ANOMALY_LEVELS,
    deviceSystem: DEVICE_SYSTEM,
    devMilestones: DEV_MILESTONES,
    economyRules: ECONOMY_RULES,
    environmentFactors: ENVIRONMENT_FACTORS,
    fileStructure: FILE_STRUCTURE,
    gameLoopSteps: GAME_LOOP_STEPS,
    gameOverview: GAME_OVERVIEW,
    presetPatients: PRESET_PATIENTS,
    sensorSystem: SENSOR_SYSTEM,
    systemPrompt: SYSTEM_PROMPT,
    worldBook: WORLD_BOOK
  }
}
