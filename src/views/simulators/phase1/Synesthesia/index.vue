<template>
  <div class="synesthesia-shell">
    <section v-if="phase === 'title'" class="screen screen-title">
      <div class="title-veil"></div>
      <div class="title-grid"></div>

      <div class="title-panel title-panel-centered">
        <div class="title-eyebrow">{{ titleContent.eyebrow }}</div>
        <h1 class="title-main">{{ titleContent.title }}</h1>
        <div class="title-sub">{{ titleContent.subtitle }}</div>
        <div class="title-divider"></div>

        <div class="title-actions">
          <button class="title-btn primary title-btn-large" @click="startNewGame">开始新游戏</button>
          <button
            class="title-btn secondary"
            :class="{ disabled: !hasSave || isCheckingSave }"
            :disabled="!hasSave || isCheckingSave"
            @click="continueGame"
          >
            继续游戏
          </button>
          <button
            class="title-btn secondary"
            :class="{ disabled: !hasArchiveSave || isCheckingSave }"
            :disabled="!hasArchiveSave || isCheckingSave"
            @click="loadArchivedGame"
          >
            读取存档
          </button>
        </div>
        <div class="title-archive-hint">{{ latestArchiveLabel }}</div>
        <button class="text-link" @click="goHome">返回主界面</button>
      </div>
    </section>

    <section v-else-if="phase === 'background_intro'" class="screen screen-intro">
      <header class="phase-topbar">
        <button class="text-link" @click="goToPrevBackgroundPage">返回</button>
        <div class="phase-topbar-actions">
          <div class="progress-label">背景介绍 {{ backgroundPage + 1 }} / {{ backgroundTotal }}</div>
          <button class="btn-secondary compact" @click="goHome">主界面</button>
        </div>
      </header>

      <div class="intro-card">
        <div class="intro-kicker">{{ currentBackgroundPage.kicker }}</div>
        <h2 class="intro-title">{{ currentBackgroundPage.title }}</h2>
        <div class="intro-divider"></div>

        <div class="intro-body">
          <p v-for="(paragraph, index) in currentBackgroundPage.paragraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>

        <div class="intro-actions single-action">
          <button class="btn-primary" @click="goToNextBackgroundPage">
            {{ backgroundPage + 1 === backgroundTotal ? '进入诊所' : '下一页' }}
          </button>
        </div>
      </div>
    </section>

    <section v-else-if="phase === 'hub'" class="screen screen-hub">
      <header class="hub-topbar hub-topbar-reframed">
        <button class="btn-secondary compact" @click="returnToTitle">返回</button>
        <div class="hub-credit-pill">信用点 {{ credits }}</div>
        <div class="hub-time-pill">第 {{ gameDay }} 天</div>
      </header>
      <main class="hub-main hub-main-reframed">
        <section class="hub-identity-card clickable-card" @click="toggleProfilePanel">
          <div class="profile-kicker">玩家信息</div>
          <div class="profile-card-row">
            <img v-if="playerProfile.avatar" :src="playerProfile.avatar" alt="avatar" class="profile-avatar">
            <div v-else class="profile-avatar placeholder">{{ (playerProfile.title || '调').slice(0, 1) }}</div>
            <div class="profile-name">{{ playerProfile.title }}</div>
          </div>
        </section>
        <section class="hub-environment-card">
          <div class="profile-kicker">当前环境</div>
          <div class="environment-title">{{ currentEnvironment.name }}</div>
          <div class="environment-copy">{{ currentEnvironment.description }}</div>
        </section>
        <section class="hub-folders">
          <article class="hub-folder-card primary-item" @click="startPatientFlow">
            <div class="folder-title">{{ hubActions.primaryLabel }}</div>
            <div class="folder-copy">选择今日要接待的下一位患者</div>
          </article>
          <article class="hub-folder-card collapsible">
            <div class="folder-title">待复诊患者</div>
            <div class="folder-copy">到期复诊 {{ dueRevisitCount }} · 排队中 {{ pendingRevisitCount }}</div>
          </article>
          <article class="hub-folder-card collapsible">
            <div class="folder-title">设备总览</div>
            <div class="folder-copy">查看五感设备等级与模块</div>
            <button class="mini-toggle" type="button" @click.stop="toggleEquipmentSection">
              {{ equipmentExpanded ? '收起' : '展开' }}
            </button>
          </article>
        </section>
        <div v-if="equipmentExpanded" class="hub-expand-panel">
          <div v-for="item in equipmentSummary" :key="item.id" class="equipment-row">
            <div>
              <div class="equipment-name">{{ item.name }}</div>
              <div class="equipment-desc">{{ item.summary }}</div>
            </div>
            <div class="equipment-level">
              <span>{{ item.levelText }}</span>
              <small>{{ item.moduleCount }}</small>
            </div>
          </div>
        </div>
        <section class="hub-menu">
          <article class="hub-menu-item primary-item" @click="startPatientFlow">
            <div class="menu-main">
              <div class="menu-title">{{ hubActions.primaryLabel }}</div>
              <div class="menu-sub">进入今天的问诊与治疗流程。</div>
            </div>
            <div class="menu-state">进入</div>
          </article>

          <article class="hub-menu-item">
            <div class="menu-main">
              <div class="menu-title">当前环境</div>
              <div class="menu-sub">{{ currentEnvironment.description }}</div>
            </div>
            <div class="menu-state">{{ currentEnvironment.label }}</div>
          </article>

          <article class="hub-menu-item">
            <div class="menu-main">
              <div class="menu-title">待复诊患者</div>
              <div class="menu-sub">
                当前共 {{ pendingRevisitCount }} 名患者在排队，{{ dueRevisitCount }} 名已经到约定时间。
              </div>
            </div>
            <div class="menu-state">{{ pendingRevisitCount }}</div>
          </article>

          <article v-if="curedArchives.length" class="hub-menu-item archive-intro">
            <div class="menu-main">
              <div class="menu-title">患者病历</div>
              <div class="menu-sub">查看已经治愈的患者档案、问诊记录与治疗反馈。</div>
            </div>
            <div class="menu-state">{{ curedArchives.length }}</div>
          </article>

          <div v-if="curedArchives.length" class="archive-list">
            <details v-for="archive in curedArchives" :key="archive.id" class="archive-item">
              <summary class="archive-summary">
                <div>
                  <div class="archive-name">{{ archive.name }} · {{ archive.job }}</div>
                  <div class="archive-meta">第 {{ archive.gameDay }} 天 · 收入 {{ archive.settlementTotal || 0 }} 信用点</div>
                </div>
              </summary>

              <div class="archive-body">
                <div class="archive-block">
                  <div class="archive-block-title">病例追踪</div>
                  <div class="archive-copy">{{ archive.trackingSheet?.symptomSummary || '暂无摘要' }}</div>
                  <div class="archive-copy">核心牵挂：{{ archive.trackingSheet?.coreConcern || '暂无' }}</div>
                  <div class="archive-copy">变更记录：{{ archive.trackingSheet?.changeLog?.join(' / ') || '暂无' }}</div>
                </div>

                <div class="archive-block">
                  <div class="archive-block-title">问诊记录</div>
                  <div
                    v-for="entry in archive.consultationHistory"
                    :key="entry.id"
                    class="archive-entry"
                  >
                    <div class="archive-entry-label">{{ entry.label }}</div>
                    <div class="archive-entry-text">{{ entry.text }}</div>
                  </div>
                </div>

                <div class="archive-block">
                  <div class="archive-block-title">治疗反馈</div>
                  <div class="archive-copy">{{ archive.feedbackText || '暂无' }}</div>
                </div>
              </div>
            </details>
          </div>

          <article class="hub-menu-item collapsible">
            <div class="menu-main">
              <div class="menu-title">设备概览</div>
              <div class="menu-sub">桌面端默认展开，手机端默认折叠。</div>
            </div>
            <button class="mini-toggle" type="button" @click.stop="toggleEquipmentSection">
              {{ equipmentExpanded ? '收起' : '展开' }}
            </button>
          </article>

          <div v-if="equipmentExpanded" class="hub-expand-panel">
            <div v-for="item in equipmentSummary" :key="item.id" class="equipment-row">
              <div>
                <div class="equipment-name">{{ item.name }}</div>
                <div class="equipment-desc">{{ item.summary }}</div>
              </div>
              <div class="equipment-level">
                <span>{{ item.levelText }}</span>
                <small>{{ item.moduleCount }}</small>
              </div>
            </div>
          </div>

          <article v-if="latestCompletedCase" class="hub-menu-item">
            <div class="menu-main">
              <div class="menu-title">最近病例</div>
              <div class="menu-sub">
                {{ latestCompletedCase.name }} · {{ latestCompletedCase.outcomeLabel }} · {{ latestCompletedCase.summary }}
              </div>
            </div>
            <div class="menu-state">第 {{ latestCompletedCase.gameDay }} 天</div>
          </article>

          <article class="hub-menu-item collapsible">
            <div class="menu-main">
              <div class="menu-title">系统快照</div>
              <div class="menu-sub">查看当前版本已经接入的主流程节点。</div>
            </div>
            <button class="mini-toggle" type="button" @click.stop="toggleSnapshotSection">
              {{ snapshotExpanded ? '收起' : '展开' }}
            </button>
          </article>

          <div v-if="snapshotExpanded" class="hub-expand-panel">
            <div v-for="item in systemSnapshot" :key="item" class="snapshot-row">
              {{ item }}
            </div>
          </div>
        </section>

        <div v-if="statusNotice" class="status-notice">{{ statusNotice }}</div>
      </main>
    </section>

    <section v-else-if="phase === 'consult'" class="screen screen-consult">
      <header class="phase-topbar consult-topbar">
        <div class="consult-topbar-left">
          <button class="text-link consult-back-link" @click="returnToHub">← 返回主界面</button>
          <div class="diagnosis-chip">{{ diagnosisAttemptLabel }}</div>
        </div>
      </header>

      <main class="consult-main">
        <section class="consult-panel">
          <article class="dialogue-card">
            <div class="card-head consciousness-head">问诊记录</div>
            <div class="consult-context">
              <div class="consult-patient-line">
                {{ activePatient?.name }} · {{ activePatient?.job }} · 第 {{ activePatient?.visitCount || 1 }} 次来诊
              </div>
              <div class="consult-environment-line">
                当前室外环境：{{ activeEnvironment.name }}。{{ activeEnvironment.description }}
              </div>
            </div>

            <div v-if="narrativeError" class="error-box">{{ narrativeError }}</div>

            <button
              v-if="collapsedHistoryCount > 0"
              class="history-toggle"
              type="button"
              @click="showFullHistory = !showFullHistory"
            >
              {{ showFullHistory ? `收起历史记录（${collapsedHistoryCount}）` : `展开历史记录（${collapsedHistoryCount}）` }}
            </button>

            <div class="dialogue-list" :class="{ compact: !showFullHistory && collapsedHistoryCount > 0 }">
              <div
                v-for="entry in visibleConsultationHistory"
                :key="entry.id"
                class="dialogue-entry"
                :class="`entry-${entry.speaker}`"
              >
                <div class="entry-label">{{ entry.label }}</div>
                <div class="entry-body">
                  <p v-for="(paragraph, idx) in splitParagraphs(entry.text)" :key="idx">
                    {{ paragraph }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="consultStage === 'arrival_intro'" class="dialogue-actions">
              <button class="btn-primary" :disabled="isGeneratingText" @click="continueConsultFlow">
                开始问诊
              </button>
            </div>

            <div v-else-if="isGeneratingText" class="question-loading">
              <div class="question-bar-title">正在整理新的问诊回应</div>
              <div class="question-loading-copy">请稍候，新的叙事完成后才会开放下一轮追问。</div>
            </div>

            <div v-else class="question-bar">
              <div class="question-bar-title">做出选择</div>
              <div class="question-grid">
                <button
                  v-for="option in currentConsultOptions"
                  :key="option.id"
                  class="question-btn"
                  :disabled="isGeneratingText"
                  @click="chooseConsultOption(option)"
                >
                  <span class="question-title">{{ option.label }}</span>
                  <small class="question-line">{{ option.doctorLine }}</small>
                </button>
              </div>
            </div>
          </article>
        </section>

        <div
          v-if="isMobileLayout && showNotesDrawer"
          class="notes-backdrop"
          @click="toggleNotesDrawer"
        ></div>

        <aside v-if="!isMobileLayout || showNotesDrawer" class="notes-sidebar" :class="{ mobile: isMobileLayout }">
          <div class="notes-card">
            <div class="notes-head">
              <div>
                <div class="notes-doc-tag">◇ 病历记录 ◇</div>
                <div class="notes-doc-title">病历记录</div>
                <div class="notes-sub">先记笔记，再把结构化诊断提交给诊断仪。</div>
              </div>
              <button v-if="isMobileLayout" class="text-link" @click="toggleNotesDrawer">关闭</button>
            </div>

            <label class="notes-label">自由笔记</label>
            <textarea
              v-model="consultNotes"
              class="notes-textarea"
              placeholder="随时记录患者提到的关键词、触发场景和你对环境干扰的怀疑。"
              @input="handleConsultNotesInput"
            ></textarea>

            <div class="mapping-board">
              <div v-for="sense in senseConfigs" :key="sense.id" class="mapping-group">
                <div class="mapping-title">{{ sense.label }}</div>
                <div class="mapping-options">
                  <label
                    v-for="targetId in senseTargets[sense.id]"
                    :key="`${sense.id}-${targetId}`"
                    class="mapping-option"
                  >
                    <input
                      type="checkbox"
                      :checked="isChecked(diagnosisDraft, sense.id, targetId)"
                      @change="toggleDiagnosisTarget(sense.id, targetId)"
                    />
                    <span>{{ senseLabels[targetId] }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="notes-summary">
              <div class="summary-title">已确认结果</div>
              <div v-if="confirmedDiagnosisDetails.length" class="summary-detail-list">
                <div v-for="item in confirmedDiagnosisDetails" :key="item.key" class="summary-detail-item">
                  <span>{{ item.label }}</span>
                  <strong>Lv.{{ item.level }}</strong>
                </div>
              </div>
              <div v-else class="summary-copy">{{ confirmedDiagnosisSummary }}</div>
              <div class="summary-meta">{{ diagnosisAttemptLabel }}</div>
            </div>

            <div class="notes-actions">
              <button class="btn-secondary" :disabled="!canSubmitDiagnosis" @click="submitDiagnosis">
                提交至诊断仪
              </button>
              <button class="btn-primary" :disabled="!canEnterTreatment" @click="openTreatmentScreen">
                前往治疗仪
              </button>
            </div>
          </div>
        </aside>
      </main>

      <button v-if="isMobileLayout" class="floating-note-btn" @click="toggleNotesDrawer">
        {{ showNotesDrawer ? '收起记录' : '病历记录' }}
      </button>
    </section>

    <section v-else-if="phase === 'treatment'" class="screen screen-treatment">
      <header class="phase-topbar">
        <div>
          <div class="phase-title">治疗仪设置</div>
          <div class="phase-sub">{{ activePatient?.name }} · {{ activePatientSummary }}</div>
        </div>
        <div class="phase-topbar-actions">
          <button class="btn-secondary compact" @click="returnToConsult">返回问诊</button>
          <button class="btn-secondary compact" @click="saveManualProgress">保存</button>
          <button class="btn-secondary compact" @click="goHome">主界面</button>
        </div>
      </header>

      <main class="treatment-main">
        <section class="treatment-summary-card">
          <div class="card-head">当前确认结果</div>
          <div class="summary-copy">{{ confirmedDiagnosisSummary }}</div>
          <div v-if="narrativeError" class="error-box">{{ narrativeError }}</div>
        </section>

        <section class="treatment-grid">
          <article v-for="sense in senseConfigs" :key="sense.id" class="treatment-card">
            <div class="treatment-card-title">{{ sense.label }}</div>
            <div class="mapping-options">
              <label
                v-for="targetId in senseTargets[sense.id]"
                :key="`treatment-${sense.id}-${targetId}`"
                class="mapping-option"
              >
                <input
                  type="checkbox"
                  :checked="isChecked(treatmentDraft, sense.id, targetId)"
                  :disabled="getTreatmentOptionMeta(sense.id, targetId).disabled"
                  @change="toggleTreatmentTarget(sense.id, targetId)"
                />
                <span>{{ senseLabels[targetId] }} · Lv.{{ getTreatmentOptionMeta(sense.id, targetId).level }}</span>
                <small>{{ getTreatmentOptionMeta(sense.id, targetId).reason }}</small>
              </label>
            </div>
          </article>
        </section>

        <section class="treatment-submit-card">
          <div class="summary-title">治疗方向总览</div>
          <div class="summary-copy">{{ treatmentDraftSummary }}</div>
          <div class="notes-actions">
            <button class="btn-secondary" @click="returnToConsult">继续补问诊</button>
            <button class="btn-primary" :disabled="!canSubmitTreatment" @click="submitTreatment">
              提交治疗
            </button>
          </div>
        </section>
      </main>
    </section>

    <section v-else-if="phase === 'patient_feedback'" class="screen screen-feedback">
      <header class="phase-topbar">
        <div>
          <div class="phase-title">{{ feedbackOutcomeLabel }}</div>
          <div class="phase-sub">{{ activePatient?.name }} · {{ activePatientSummary }}</div>
        </div>
        <div class="phase-topbar-actions">
          <button class="btn-secondary compact" @click="saveManualProgress">保存</button>
          <button class="btn-secondary compact" @click="goHome">主界面</button>
        </div>
      </header>

      <main class="feedback-main">
        <article class="feedback-card">
          <div class="card-head">患者反馈</div>
          <div class="feedback-chip" :class="patientFeedbackOutcome">{{ feedbackOutcomeLabel }}</div>

          <div v-if="narrativeError" class="error-box">{{ narrativeError }}</div>

          <div class="feedback-body">
            <p v-for="(paragraph, index) in splitParagraphs(patientFeedbackText)" :key="index">
              {{ paragraph }}
            </p>
          </div>

          <div v-if="patientFeedbackOutcome === 'revisit' && activePatient?.returnDay" class="feedback-schedule">
            已为这位患者预约第 {{ activePatient.returnDay }} 天后的复诊。
          </div>

          <div class="feedback-actions">
            <button class="btn-primary" @click="advanceFromFeedback">{{ currentFeedbackActionLabel }}</button>
          </div>
        </article>
      </main>
    </section>

    <Transition name="modal-fade">
      <div v-if="showConfirmNewGameModal" class="modal-overlay" @click.self="cancelStartNewGame">
        <div class="modal-card">
          <div class="modal-kicker">覆盖确认</div>
          <div class="modal-title">检测到现有存档。</div>
          <p class="modal-text">
            开始新游戏会覆盖当前《共觉之境》的进度，并从背景介绍第一页重新开始。
          </p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="cancelStartNewGame">取消</button>
            <button class="btn-primary" @click="confirmStartNewGame">确认覆盖</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="showProfilePanel" class="modal-overlay" @click.self="toggleProfilePanel">
        <div class="modal-card profile-modal">
          <div class="modal-kicker">玩家档案</div>
          <div class="profile-modal-head">
            <img v-if="playerProfile.avatar" :src="playerProfile.avatar" alt="avatar" class="profile-avatar large">
            <div v-else class="profile-avatar large placeholder">{{ (playerProfile.title || '调').slice(0, 1) }}</div>
            <div class="profile-modal-meta">
              <label class="notes-label">名字</label>
              <input
                :value="playerProfile.title"
                class="profile-input"
                type="text"
                placeholder="输入玩家名字"
                @change="handlePlayerNameChange"
              >
              <label class="btn-secondary compact profile-upload">
                上传头像
                <input type="file" accept="image/*" class="hidden-file" @change="handleAvatarChange">
              </label>
            </div>
          </div>

          <div class="archive-block">
            <div class="archive-block-title">生平</div>
            <div class="archive-copy">{{ playerProfile.brief }}</div>
            <div class="archive-copy">{{ playerProfile.creed }}</div>
          </div>

          <div class="hub-stats-bar compact-stats">
            <div class="hub-stat-item">
              <div class="hub-stat-name">已治愈人数</div>
              <div class="hub-stat-value">{{ totalCuredCount }}</div>
            </div>
            <div class="hub-stat-item">
              <div class="hub-stat-name">累计收入</div>
              <div class="hub-stat-value">{{ totalEarnings }}</div>
            </div>
            <div class="hub-stat-item">
              <div class="hub-stat-name">设备总等级</div>
              <div class="hub-stat-value">{{ totalEquipmentLevel }}</div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" @click="toggleProfilePanel">关闭</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useGameLogic } from './composables/useGameLogic'

const {
  phase,
  consultStage,
  hasSave,
  hasArchiveSave,
  isCheckingSave,
  showConfirmNewGameModal,
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
  gameDay,
  playerProfile,
  activePatient,
  consultationHistory,
  consultNotes,
  diagnosisDraft,
  treatmentDraft,
  currentBackgroundPage,
  currentEnvironment,
  activeEnvironment,
  pendingRevisitCount,
  dueRevisitCount,
  hubStats,
  equipmentSummary,
  currentConsultOptions,
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
  backgroundTotal,
  titleContent,
  hubActions,
  senseConfigs,
  senseLabels,
  senseTargets,
  systemSnapshot,
  startNewGame,
  confirmStartNewGame,
  cancelStartNewGame,
  continueGame,
  loadArchivedGame,
  saveManualProgress,
  toggleProfilePanel,
  updatePlayerName,
  updatePlayerAvatar,
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
  toggleSnapshotSection,
  toggleNotesDrawer
} = useGameLogic()

const showFullHistory = ref(false)

const visibleConsultationHistory = computed(() => {
  if (showFullHistory.value) {
    return consultationHistory.value
  }

  if (consultStage.value === 'arrival_intro') {
    return consultationHistory.value.slice(-1)
  }

  return consultationHistory.value.slice(-2)
})

const collapsedHistoryCount = computed(() => {
  return Math.max(0, consultationHistory.value.length - visibleConsultationHistory.value.length)
})

watch(
  () => consultationHistory.value.length,
  () => {
    showFullHistory.value = false
  }
)

function splitParagraphs(text = '') {
  return String(text)
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean)
}

function isChecked(mapping, sourceId, targetId) {
  return Array.isArray(mapping?.[sourceId]) && mapping[sourceId].includes(targetId)
}

function handlePlayerNameChange(event) {
  updatePlayerName(event?.target?.value)
}

function handleAvatarChange(event) {
  const file = event?.target?.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    updatePlayerAvatar(typeof reader.result === 'string' ? reader.result : '')
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}
</script>

<style scoped>
.synesthesia-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(35, 78, 96, 0.24), transparent 32%),
    radial-gradient(circle at 80% 20%, rgba(164, 85, 55, 0.12), transparent 24%),
    linear-gradient(180deg, #060b11 0%, #04070c 100%);
  color: #ddd3c2;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.screen {
  position: absolute;
  inset: 0;
}

.title-veil,
.title-grid {
  position: absolute;
  inset: 0;
}

.title-veil {
  background:
    radial-gradient(circle at 25% 25%, rgba(82, 133, 148, 0.18), transparent 28%),
    radial-gradient(circle at 70% 70%, rgba(179, 103, 69, 0.14), transparent 24%);
}

.title-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent);
}

.screen-title,
.screen-intro,
.screen-hub,
.screen-consult,
.screen-treatment,
.screen-feedback {
  display: flex;
  flex-direction: column;
}

.screen-title {
  justify-content: center;
  align-items: center;
  position: relative;
}

.title-panel,
.intro-card,
.hub-profile,
.hub-stats-bar,
.hub-menu-item,
.hub-expand-panel,
.case-card,
.dialogue-card,
.notes-card,
.treatment-summary-card,
.treatment-card,
.treatment-submit-card,
.feedback-card,
.modal-card {
  background: rgba(8, 16, 20, 0.84);
  border: 1px solid rgba(219, 194, 139, 0.12);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 18px 48px rgba(0, 0, 0, 0.25);
}

.title-panel {
  position: relative;
  z-index: 1;
  width: min(540px, calc(100vw - 2.75rem));
  border-radius: 0;
  padding: 7rem 2.1rem 6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: transparent;
  border: none;
  box-shadow: none;
}

.title-panel-centered {
  align-items: center;
  text-align: center;
}

.title-eyebrow,
.intro-kicker,
.card-head,
.profile-kicker,
.hub-title-tag,
.phase-title,
.modal-kicker,
.progress-label,
.case-kicker {
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  color: #9aa08b;
}

.title-main,
.intro-title,
.profile-name,
.case-title {
  margin: 0;
  font-weight: normal;
  color: #f0dfb1;
}

.title-main {
  font-size: clamp(3.2rem, 8vw, 5.4rem);
  letter-spacing: 0.18em;
}

.title-sub,
.profile-sub,
.phase-sub,
.case-meta,
.hub-stat-name,
.feedback-chip {
  letter-spacing: 0.08em;
}

.title-sub,
.profile-sub,
.phase-sub,
.case-meta {
  color: #88a0a6;
}

.title-copy,
.intro-body,
.dialogue-list,
.hub-menu,
.feedback-body,
.mapping-board,
.notes-actions,
.feedback-actions {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.title-copy,
.notes-textarea,
.summary-copy,
.menu-sub,
.profile-text,
.profile-creed,
.hub-stat-desc,
.case-copy,
.entry-body p,
.feedback-body p,
.snapshot-row,
.equipment-desc,
.notes-sub,
.summary-meta,
.status-notice,
.error-box,
.feedback-schedule {
  line-height: 1.85;
  color: #c0b4a2;
}

.title-actions,
.modal-actions,
.phase-topbar-actions,
.intro-actions,
.notes-actions,
.feedback-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.title-panel .text-link {
  align-self: center;
  margin-top: 0.85rem;
  color: rgba(215, 199, 157, 0.72);
}

.title-archive-hint {
  color: #8c897b;
  font-size: 0.78rem;
  line-height: 1.6;
}

.title-divider {
  width: 64px;
  height: 1px;
  margin: 0.35rem 0 0.75rem;
  background: linear-gradient(90deg, transparent, rgba(219, 194, 139, 0.35), transparent);
}

.title-btn,
.btn-primary,
.btn-secondary,
.text-link,
.question-btn,
.mini-toggle,
.floating-note-btn {
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.title-btn,
.btn-primary,
.btn-secondary {
  border-radius: 10px;
  padding: 0.78rem 1.3rem;
  font-size: 0.88rem;
  letter-spacing: 0.12em;
}

.title-btn.primary,
.btn-primary {
  border: 1px solid rgba(237, 211, 151, 0.36);
  background: linear-gradient(135deg, #8a5938, #5e3925);
  color: #f6e9cf;
}

.title-btn.secondary,
.btn-secondary {
  border: 1px solid rgba(219, 194, 139, 0.18);
  background: transparent;
  color: #b9ac8e;
}

.title-btn-large {
  min-height: 70px;
}

.title-btn.secondary.disabled,
.title-btn.secondary:disabled,
.btn-secondary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-secondary.compact {
  padding: 0.5rem 0.9rem;
  font-size: 0.76rem;
}

.text-link,
.mini-toggle {
  border: none;
  background: transparent;
  color: #d7c79d;
  padding: 0;
  font-size: 0.8rem;
}

.phase-topbar,
.hub-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.4rem;
  border-bottom: 1px solid rgba(219, 194, 139, 0.08);
  background: rgba(6, 12, 16, 0.84);
}

.consult-topbar {
  justify-content: space-between;
  gap: 1rem;
}

.consult-topbar-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-shrink: 0;
}

.consult-back-link {
  flex-shrink: 0;
}

.diagnosis-chip {
  border: 1px solid rgba(219, 194, 139, 0.16);
  border-radius: 999px;
  padding: 0.28rem 0.72rem;
  color: #d8c89d;
  background: rgba(255, 255, 255, 0.03);
  white-space: nowrap;
}

.hub-main,
.consult-main,
.treatment-main,
.feedback-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem 1.4rem;
}

.intro-card {
  width: min(760px, calc(100vw - 2.5rem));
  margin: auto;
  border-radius: 20px;
  padding: 1.8rem 1.9rem;
}

.intro-title {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.25;
}

.intro-divider {
  width: 100%;
  height: 1px;
  margin: 1rem 0 1.2rem;
  background: linear-gradient(90deg, transparent, rgba(219, 194, 139, 0.25), transparent);
}

.hub-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hub-topbar-reframed {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  align-items: center;
}

.hub-credit-pill,
.hub-time-pill {
  border: 1px solid rgba(219, 194, 139, 0.14);
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  text-align: center;
  color: #e7d7ab;
  background: rgba(255, 255, 255, 0.03);
}

.hub-main-reframed {
  gap: 0.9rem;
}

.hub-identity-card,
.hub-environment-card,
.hub-folder-card,
.hub-secondary-actions {
  border-radius: 18px;
  padding: 1rem 1.1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.hub-folders {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.hub-folder-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.folder-title,
.environment-title {
  color: #ead9af;
  font-size: 1rem;
}

.folder-copy,
.environment-copy {
  color: #c0b4a2;
  line-height: 1.75;
}

.compact-stats {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.hub-secondary-actions {
  display: flex;
  gap: 0.8rem;
}

.clickable-card {
  cursor: pointer;
}

.profile-card-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.profile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(219, 194, 139, 0.16);
}

.profile-avatar.large {
  width: 72px;
  height: 72px;
}

.profile-avatar.placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  color: #ead9af;
}

.hub-menu > :not(.archive-intro):not(.archive-list) {
  display: none;
}

.hub-profile,
.hub-stats-bar,
.hub-expand-panel,
.case-card,
.dialogue-card,
.notes-card,
.treatment-summary-card,
.treatment-submit-card,
.feedback-card {
  border-radius: 18px;
  padding: 1.15rem 1.2rem;
}

.hub-profile {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.profile-name {
  font-size: clamp(1.7rem, 4vw, 2.5rem);
  margin-top: 0.35rem;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 160px;
}

.meta-chip,
.feedback-chip {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(219, 194, 139, 0.14);
  background: rgba(255, 255, 255, 0.03);
  text-align: center;
}

.meta-chip.hot,
.feedback-chip.revisit {
  border-color: rgba(179, 103, 69, 0.32);
  color: #e3bf9b;
}

.feedback-chip.complete {
  border-color: rgba(123, 156, 167, 0.34);
  color: #c5dce2;
}

.hub-stats-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.hub-stat-item,
.hub-menu-item {
  border-radius: 14px;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.hub-stat-value {
  margin-top: 0.45rem;
  font-size: 1.35rem;
  color: #f0dfb1;
}

.hub-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hub-menu-item.primary-item {
  cursor: pointer;
  border-color: rgba(219, 194, 139, 0.2);
  background: rgba(219, 194, 139, 0.05);
}

.menu-title {
  color: #ead9af;
  font-size: 1rem;
}

.menu-state {
  flex-shrink: 0;
  color: #d8c89d;
}

.hub-expand-panel {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.equipment-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.equipment-name {
  color: #e7d7ab;
}

.equipment-level {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  color: #d8c898;
}

.archive-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.archive-item {
  border-radius: 16px;
  border: 1px solid rgba(219, 194, 139, 0.08);
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.archive-summary {
  cursor: pointer;
  list-style: none;
  padding: 0.95rem 1rem;
  color: #ead9af;
}

.archive-summary::-webkit-details-marker {
  display: none;
}

.archive-name {
  color: #ead9af;
}

.archive-meta {
  margin-top: 0.3rem;
  color: #9aa08b;
  font-size: 0.82rem;
}

.archive-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 0 1rem 1rem;
}

.archive-block {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.8rem 0.85rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.06);
}

.archive-block-title,
.archive-entry-label {
  color: #d7c79d;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
}

.archive-copy,
.archive-entry-text {
  color: #c0b4a2;
  line-height: 1.75;
  white-space: pre-wrap;
}

.archive-entry {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  padding: 0.6rem 0;
  border-top: 1px solid rgba(219, 194, 139, 0.06);
}

.archive-entry:first-of-type {
  border-top: none;
  padding-top: 0;
}

.consult-main {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.95fr);
  gap: 1rem;
  position: relative;
  height: calc(100vh - 88px);
  overflow: hidden;
}

.consult-panel {
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.dialogue-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding-bottom: 1rem;
  overflow: hidden;
}

.consciousness-head {
  align-self: center;
  color: #cbb37d;
}

.consult-context {
  padding: 0.1rem 0 0.4rem;
  border-bottom: 1px solid rgba(219, 194, 139, 0.08);
  margin-bottom: 0.4rem;
}

.consult-patient-line,
.consult-environment-line {
  color: #9fc0cf;
  letter-spacing: 0.06em;
  line-height: 1.7;
}

.consult-environment-line {
  color: #89a5af;
  font-size: 0.84rem;
}

.history-toggle {
  align-self: flex-start;
  border: 1px solid rgba(219, 194, 139, 0.14);
  border-radius: 999px;
  padding: 0.36rem 0.74rem;
  background: rgba(255, 255, 255, 0.03);
  color: #cdbd95;
  font-family: inherit;
  font-size: 0.78rem;
}

.dialogue-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.2rem;
  gap: 0.95rem;
}

.dialogue-list.compact {
  min-height: 220px;
}

.dialogue-entry {
  padding: 1rem 1.05rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.06);
}

.entry-label {
  font-size: 0.78rem;
  color: #e2d2a8;
  margin-bottom: 0.55rem;
}

.entry-doctor {
  border-color: rgba(123, 156, 167, 0.18);
}

.entry-system {
  border-color: rgba(179, 103, 69, 0.2);
}

.question-bar {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(219, 194, 139, 0.12);
  flex-shrink: 0;
  max-height: 28vh;
  overflow-y: auto;
}

.question-bar-title {
  position: sticky;
  top: 0;
  z-index: 1;
  margin-bottom: 0.8rem;
  padding-bottom: 0.55rem;
  font-size: 0.86rem;
  letter-spacing: 0.12em;
  color: #cbb37d;
  background: linear-gradient(180deg, rgba(8, 13, 19, 0.98), rgba(8, 13, 19, 0.9));
}

.question-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.72rem;
  padding-bottom: 0.25rem;
}

.question-loading {
  margin-top: auto;
  padding-top: 0.95rem;
  border-top: 1px solid rgba(219, 194, 139, 0.08);
  flex-shrink: 0;
}

.question-loading-copy {
  color: #a89c86;
  line-height: 1.7;
}

.question-btn {
  border-radius: 10px;
  border: 1px solid rgba(219, 194, 139, 0.2);
  background: rgba(224, 216, 201, 0.9);
  color: #2d2518;
  padding: 0.78rem 0.92rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.question-title {
  display: block;
  color: #32291b;
  font-size: 0.88rem;
}

.question-line {
  color: #5f5037;
  line-height: 1.48;
  font-size: 0.78rem;
}

.notes-sidebar {
  position: relative;
  min-height: 0;
}

.notes-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  height: 100%;
  min-height: 0;
  background: rgba(7, 11, 18, 0.96);
  border: 1px solid rgba(179, 156, 98, 0.24);
  box-shadow:
    0 24px 50px rgba(0, 0, 0, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.notes-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px dashed rgba(96, 78, 50, 0.3);
}

.notes-doc-tag {
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  color: #a78d59;
}

.notes-doc-title {
  margin-top: 0.2rem;
  font-size: 1.35rem;
  color: #ead9af;
}

.notes-sub {
  color: #a89b84;
}

.notes-label,
.summary-title,
.mapping-title,
.treatment-card-title {
  color: #ceb37c;
}

.notes-textarea {
  min-height: 110px;
  border-radius: 12px;
  border: 1px solid rgba(179, 156, 98, 0.14);
  background: rgba(255, 255, 255, 0.03);
  padding: 0.9rem;
  resize: vertical;
  color: #ddd3c2;
  font-family: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.mapping-group {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.mapping-board {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.mapping-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.mapping-option {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 156, 98, 0.14);
  font-size: 0.86rem;
  color: #ddd3c2;
}

.mapping-option input {
  accent-color: #8a5938;
}

.mapping-option small {
  margin-left: auto;
  color: #a89b84;
  font-size: 0.72rem;
}

.mapping-option:has(input:disabled) {
  opacity: 0.58;
}

.notes-summary {
  padding: 0.85rem 0.9rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 156, 98, 0.14);
}

.summary-detail-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.summary-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  color: #ddd3c2;
  line-height: 1.55;
}

.summary-detail-item strong {
  color: #ead9af;
  font-size: 0.8rem;
}

.summary-copy {
  color: #ddd3c2;
}

.summary-meta {
  color: #a89b84;
}

.treatment-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.treatment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.treatment-card {
  border-radius: 18px;
  padding: 1.1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.feedback-main {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-card {
  width: min(780px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-notice,
.error-box,
.feedback-schedule {
  padding: 0.8rem 0.9rem;
  border-radius: 12px;
  background: rgba(123, 156, 167, 0.08);
  border: 1px solid rgba(123, 156, 167, 0.18);
}

.error-box {
  background: rgba(179, 103, 69, 0.08);
  border-color: rgba(179, 103, 69, 0.22);
}

.status-notice.subtle {
  margin-top: 0.8rem;
}

.notes-backdrop,
.modal-overlay {
  position: absolute;
  inset: 0;
}

.notes-backdrop {
  background: rgba(0, 0, 0, 0.35);
}

.floating-note-btn {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  border: 1px solid rgba(219, 194, 139, 0.18);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: rgba(8, 16, 20, 0.92);
  color: #ead9af;
  z-index: 12;
}

.modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 6, 8, 0.76);
  backdrop-filter: blur(4px);
  z-index: 20;
}

.modal-card {
  width: min(440px, calc(100vw - 2rem));
  border-radius: 18px;
  padding: 1.5rem;
}

.profile-modal {
  width: min(620px, calc(100vw - 2rem));
}

.profile-modal-head {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.8rem;
  margin-bottom: 1rem;
}

.profile-modal-meta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
}

.profile-input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(219, 194, 139, 0.14);
  background: rgba(255, 255, 255, 0.03);
  color: #ddd3c2;
  padding: 0.7rem 0.8rem;
  font-family: inherit;
}

.profile-upload {
  position: relative;
  display: inline-flex;
  justify-content: center;
}

.hidden-file {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.modal-title {
  margin-top: 0.55rem;
  font-size: 1.5rem;
  color: #f0dfb1;
}

@media (max-width: 900px) {
  .hub-stats-bar,
  .question-grid,
  .treatment-grid,
  .consult-main {
    grid-template-columns: 1fr;
  }

  .phase-topbar,
  .hub-topbar,
  .phase-topbar-actions,
  .hub-topbar-actions,
  .title-actions,
  .intro-actions,
  .notes-actions,
  .feedback-actions,
  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hub-profile,
  .equipment-row {
    flex-direction: column;
  }

  .hub-topbar-reframed {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .compact-stats {
    grid-template-columns: 1fr;
  }

  .hub-secondary-actions {
    flex-direction: column;
  }

  .profile-modal-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-meta {
    min-width: 0;
  }

  .hub-main,
  .consult-main,
  .treatment-main,
  .feedback-main {
    padding: 1rem;
  }

  .consult-main {
    height: calc(100vh - 112px);
  }

  .notes-sidebar.mobile {
    position: absolute;
    inset: 0 0 0 auto;
    width: min(92vw, 380px);
    z-index: 14;
  }

  .consult-topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .consult-topbar-left,
  .consult-patient-line {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
  }
}
</style>

