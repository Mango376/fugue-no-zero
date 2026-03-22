import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import saveService from '@/services/saveService'
import {
  BACKGROUND_PAGES,
  DEFAULT_EQUIPMENT_OVERVIEW,
  DEFAULT_GAME_STATE,
  ENVIRONMENT_PHASES,
  HUB_ACTIONS,
  IDENTITY_PAGES,
  PLAYER_PROFILE,
  SYSTEM_SNAPSHOT,
  TITLE_CONTENT
} from '../data/gameContent'

const SCRIPT_ID = 'synesthesia'
const VALID_PHASES = ['background_intro', 'identity_intro', 'hub']

function cloneEquipmentOverview(source = DEFAULT_EQUIPMENT_OVERVIEW) {
  return source.map(item => ({
    ...item,
    modules: Array.isArray(item.modules) ? [...item.modules] : []
  }))
}

function buildDefaultGameState() {
  return {
    phase: DEFAULT_GAME_STATE.phase,
    backgroundPage: DEFAULT_GAME_STATE.backgroundPage,
    identityPage: DEFAULT_GAME_STATE.identityPage,
    credits: DEFAULT_GAME_STATE.credits,
    patientCount: DEFAULT_GAME_STATE.patientCount,
    environmentPhase: DEFAULT_GAME_STATE.environmentPhase,
    playerProfile: { ...PLAYER_PROFILE },
    equipmentOverview: cloneEquipmentOverview()
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function useGameLogic() {
  const router = useRouter()

  const phase = ref('title')
  const hasSave = ref(false)
  const isCheckingSave = ref(true)
  const showConfirmNewGameModal = ref(false)
  const hubNotice = ref('')
  const isMobileLayout = ref(false)
  const equipmentExpanded = ref(true)
  const snapshotExpanded = ref(true)

  const backgroundPage = ref(0)
  const identityPage = ref(0)

  const credits = ref(0)
  const patientCount = ref(0)
  const environmentPhase = ref(1)
  const playerProfile = ref({ ...PLAYER_PROFILE })
  const equipmentOverview = ref(cloneEquipmentOverview())

  const currentBackgroundPage = computed(() => {
    return BACKGROUND_PAGES[backgroundPage.value] ?? BACKGROUND_PAGES[0]
  })

  const currentIdentityPage = computed(() => {
    return IDENTITY_PAGES[identityPage.value] ?? IDENTITY_PAGES[0]
  })

  const currentEnvironment = computed(() => {
    return ENVIRONMENT_PHASES.find(item => item.phase === environmentPhase.value) ?? ENVIRONMENT_PHASES[0]
  })

  const hubStats = computed(() => {
    return [
      {
        label: '当前信用点',
        value: `${credits.value}`,
        meta: '后续将用于设备升级与治疗结算'
      },
      {
        label: '已接待患者',
        value: `${patientCount.value}`,
        meta: '首版流程尚未接入问诊循环'
      },
      {
        label: '环境阶段',
        value: currentEnvironment.value.label,
        meta: currentEnvironment.value.name
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

  function applyGameState(rawState = {}) {
    const fallback = buildDefaultGameState()
    const nextPhase = VALID_PHASES.includes(rawState.phase) ? rawState.phase : fallback.phase

    phase.value = nextPhase
    backgroundPage.value = clamp(Number(rawState.backgroundPage ?? fallback.backgroundPage), 0, BACKGROUND_PAGES.length - 1)
    identityPage.value = clamp(Number(rawState.identityPage ?? fallback.identityPage), 0, IDENTITY_PAGES.length - 1)
    credits.value = Number.isFinite(rawState.credits) ? rawState.credits : fallback.credits
    patientCount.value = Number.isFinite(rawState.patientCount) ? rawState.patientCount : fallback.patientCount

    environmentPhase.value = ENVIRONMENT_PHASES.some(item => item.phase === rawState.environmentPhase)
      ? rawState.environmentPhase
      : fallback.environmentPhase

    playerProfile.value = {
      ...PLAYER_PROFILE,
      ...(rawState.playerProfile ?? {})
    }

    equipmentOverview.value = Array.isArray(rawState.equipmentOverview) && rawState.equipmentOverview.length > 0
      ? cloneEquipmentOverview(rawState.equipmentOverview)
      : cloneEquipmentOverview()
  }

  function buildSavePayload() {
    return {
      phase: phase.value,
      backgroundPage: backgroundPage.value,
      identityPage: identityPage.value,
      credits: credits.value,
      patientCount: patientCount.value,
      environmentPhase: environmentPhase.value,
      playerProfile: { ...playerProfile.value },
      equipmentOverview: cloneEquipmentOverview(equipmentOverview.value)
    }
  }

  async function saveProgress() {
    await saveService.save(SCRIPT_ID, buildSavePayload())
    hasSave.value = true
  }

  async function syncSaveStatus() {
    try {
      const saved = await saveService.load(SCRIPT_ID)
      hasSave.value = !!saved
    } catch (error) {
      console.error('Synesthesia 存档状态检查失败:', error)
      hasSave.value = false
    } finally {
      isCheckingSave.value = false
    }
  }

  async function executeStartNewGame() {
    const snapshot = buildDefaultGameState()
    applyGameState(snapshot)
    hubNotice.value = ''
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
    await saveService.deleteSave(SCRIPT_ID)
    hasSave.value = false
    await executeStartNewGame()
  }

  function cancelStartNewGame() {
    showConfirmNewGameModal.value = false
  }

  async function restoreFromSave(saved) {
    applyGameState(saved)
    hubNotice.value = ''
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
    } catch (error) {
      console.error('Synesthesia 读取存档失败:', error)
      hasSave.value = false
    }
  }

  function goHome() {
    router.push('/')
  }

  function returnToTitle() {
    phase.value = 'title'
    hubNotice.value = ''
  }

  async function goToNextBackgroundPage() {
    if (backgroundPage.value < BACKGROUND_PAGES.length - 1) {
      backgroundPage.value += 1
      await saveProgress()
      return
    }

    phase.value = 'identity_intro'
    identityPage.value = 0
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

  async function goToNextIdentityPage() {
    if (identityPage.value < IDENTITY_PAGES.length - 1) {
      identityPage.value += 1
      await saveProgress()
      return
    }

    phase.value = 'hub'
    await saveProgress()
  }

  async function goToPrevIdentityPage() {
    if (identityPage.value > 0) {
      identityPage.value -= 1
      await saveProgress()
      return
    }

    phase.value = 'background_intro'
    backgroundPage.value = BACKGROUND_PAGES.length - 1
    await saveProgress()
  }

  async function saveHubProgress() {
    await saveProgress()
    hubNotice.value = '当前阶段已保存。'
  }

  function startPatientFlow() {
    hubNotice.value = HUB_ACTIONS.primaryHint
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
      return
    }

    equipmentExpanded.value = true
    snapshotExpanded.value = true
  }

  function toggleEquipmentSection() {
    if (!isMobileLayout.value) return
    equipmentExpanded.value = !equipmentExpanded.value
  }

  function toggleSnapshotSection() {
    if (!isMobileLayout.value) return
    snapshotExpanded.value = !snapshotExpanded.value
  }

  onMounted(() => {
    syncSaveStatus()
    syncResponsiveState()
    window.addEventListener('resize', syncResponsiveState)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncResponsiveState)
  })

  return {
    phase,
    hasSave,
    isCheckingSave,
    isMobileLayout,
    showConfirmNewGameModal,
    hubNotice,
    equipmentExpanded,
    snapshotExpanded,
    backgroundPage,
    identityPage,
    credits,
    patientCount,
    playerProfile,
    currentBackgroundPage,
    currentIdentityPage,
    currentEnvironment,
    hubStats,
    equipmentSummary,
    backgroundTotal: BACKGROUND_PAGES.length,
    identityTotal: IDENTITY_PAGES.length,
    titleContent: TITLE_CONTENT,
    hubActions: HUB_ACTIONS,
    systemSnapshot: SYSTEM_SNAPSHOT,
    startNewGame,
    confirmStartNewGame,
    cancelStartNewGame,
    continueGame,
    restoreFromSave,
    saveProgress,
    goHome,
    returnToTitle,
    goToNextBackgroundPage,
    goToPrevBackgroundPage,
    goToNextIdentityPage,
    goToPrevIdentityPage,
    saveHubProgress,
    startPatientFlow,
    toggleEquipmentSection,
    toggleSnapshotSection
  }
}
