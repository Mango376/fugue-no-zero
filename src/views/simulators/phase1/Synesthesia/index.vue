<template>
  <div class="synesthesia-shell">

    <!-- ========== 标题页 ========== -->
    <Transition name="fade">
    <section v-if="phase === 'title'" class="screen screen-title">
      <div class="title-bg-layer" aria-hidden="true">
        <div class="title-grid"></div>
        <div class="title-circle-outer"></div>
        <div class="title-circle-inner"></div>
        <div class="title-orbs">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
          <div class="orb orb-4"></div>
        </div>
      </div>

      <div class="title-center">
        <div class="title-eyebrow">SYNESTHESIA CLINIC · 2157</div>
        <h1 class="title-main">共觉之境</h1>
        <p class="title-sub">仿生人感官修复模拟器</p>
        <div class="title-tag">
          <span class="tag-bracket">[ </span>Subject · 感官与温情<span class="tag-bracket"> ]</span>
        </div>
        <div class="title-divider"></div>

        <div class="title-actions">
          <button class="title-btn-primary" @click="startNewGame">
            <span class="btn-icon">▶</span>开始新游戏
          </button>
          <button
            class="title-btn-secondary"
            :class="{ disabled: !hasSave || isCheckingSave }"
            :disabled="!hasSave || isCheckingSave"
            @click="continueGame"
          >继续游戏</button>
          <button
            class="title-btn-secondary"
            :class="{ disabled: !hasArchiveSave || isCheckingSave }"
            :disabled="!hasArchiveSave || isCheckingSave"
            @click="loadArchivedGame"
          >读取存档</button>
        </div>

        <div class="title-archive-hint">{{ latestArchiveLabel }}</div>
        <button class="title-back-link" @click="goHome">‹ 返回主界面</button>
      </div>
    </section>
    </Transition>

    <!-- ========== 背景介绍页 ========== -->
    <Transition name="fade">
    <section v-if="phase === 'background_intro'" class="screen screen-intro">
      <header class="intro-topbar">
        <button class="back-btn" @click="goToPrevBackgroundPage">
          ‹ {{ backgroundPage === 0 ? '返回' : '上一章' }}
        </button>
        <div class="intro-chapter-indicator">
          <span
            v-for="n in backgroundTotal"
            :key="n"
            class="chapter-dot"
            :class="{ active: n - 1 === backgroundPage }"
          ></span>
        </div>
      </header>

      <div class="intro-scroll-area">
        <div class="intro-reading-column">
          <div class="intro-chapter-tag">{{ currentBackgroundPage.kicker }}</div>
          <h2 class="intro-lead">{{ currentBackgroundPage.title }}</h2>

          <div class="intro-body">
            <template v-for="(paragraph, index) in currentBackgroundPage.paragraphs" :key="index">
              <blockquote
                v-if="paragraph.startsWith('「') || paragraph.startsWith('&quot;')"
                class="intro-blockquote"
              >{{ paragraph }}</blockquote>
              <p v-else class="intro-paragraph">{{ paragraph }}</p>
            </template>
          </div>

          <div class="intro-footer-nav">
            <button class="intro-next-btn" @click="goToNextBackgroundPage">
              {{ backgroundPage + 1 === backgroundTotal ? '进入诊所 ›' : '下一章 ›' }}
            </button>
          </div>
        </div>
      </div>
    </section>
    </Transition>

    <!-- ========== 主界面 Hub ========== -->
    <Transition name="fade">
    <section v-if="phase === 'hub'" class="screen screen-hub">
      <header class="hub-topbar">
        <button class="back-btn" @click="returnToTitle">‹ 返回</button>
        <div class="hub-topbar-center">
          <span class="hub-credits">💳 {{ credits }}</span>
          <span class="hub-day">第 {{ gameDay }} 天</span>
        </div>
        <div class="hub-system-tag">CLINIC · READY</div>
      </header>

      <div class="hub-scroll-area">
        <div class="hub-card hub-profile-card" @click="toggleProfilePanel">
          <div class="hub-profile-avatar">
            <img v-if="playerProfile.avatar" :src="playerProfile.avatar" class="avatar-img" />
            <span v-else>{{ (playerProfile.title || '维').slice(-1) }}</span>
          </div>
          <div class="hub-profile-info">
            <div class="hub-profile-name">{{ playerProfile.title }}</div>
            <div class="hub-profile-meta">诊所维修师</div>
          </div>
          <div class="hub-profile-arrow">›</div>
        </div>

        <div class="hub-card hub-environment-card">
          <div class="hub-env-label">当前环境</div>
          <template v-if="isEnvironmentLoading && !currentEnvironment?.description">
            <div class="env-loading">
              <div class="env-loading-bars">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="env-loading-text">正在感知环境……</div>
            </div>
          </template>
          <template v-else>
            <div class="hub-env-desc">{{ currentEnvironmentDescription }}</div>
          </template>
        </div>

        <div class="hub-menu-list">
          <div
            class="hub-menu-item hub-menu-primary"
            :class="{ disabled: !canStartPatientFlow }"
            @click="startPatientFlow"
          >
            <div class="menu-icon-wrap primary-icon">▶</div>
            <div class="menu-content">
              <div class="menu-title">{{ hubActions.primaryLabel }}</div>
              <div class="menu-sub">{{ patientArrivalStatusText }}</div>
            </div>
            <div class="menu-arrow">›</div>
          </div>

          <div class="hub-menu-item">
            <div class="menu-icon-wrap">◈</div>
            <div class="menu-content">
              <div class="menu-title">待复诊患者</div>
              <div class="menu-sub">到期复诊 {{ dueRevisitCount }} 名 · 排队中 {{ pendingRevisitCount }} 名</div>
            </div>
            <div class="menu-arrow">›</div>
          </div>

          <div class="hub-menu-item" @click="toggleEquipmentSection">
            <div class="menu-icon-wrap">⚙</div>
            <div class="menu-content">
              <div class="menu-title">设备概览</div>
              <div class="menu-sub">查看五感治疗仪与可升级模块</div>
            </div>
            <div class="menu-arrow">{{ equipmentExpanded ? '▾' : '›' }}</div>
          </div>

          <div v-if="equipmentExpanded" class="hub-expand-panel">
            <div v-for="item in equipmentModuleRows" :key="item.id" class="equipment-group">
              <div class="equipment-group-name">{{ item.name }}</div>
              <div class="equipment-module-list">
                <div v-for="module in item.modules" :key="module.id" class="equipment-row">
                  <span class="eq-label">{{ module.label }}</span>
                  <span class="eq-level">Lv.{{ module.level }}</span>
                  <button
                    class="eq-upgrade-btn"
                    :disabled="module.level >= 4"
                    @click.stop="upgradeEquipmentModule(item.id, module.targetId)"
                  >{{ module.level >= 4 ? '满级' : `升级 ${module.upgradeCost}💳` }}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="hub-menu-item" @click="openPatientRecords">
            <div class="menu-icon-wrap">📋</div>
            <div class="menu-content">
              <div class="menu-title">患者档案</div>
              <div class="menu-sub">
                {{ archiveCases.length ? `已归档 ${archiveCases.length} 份病例记录` : '查看历次诊疗的患者记录' }}
              </div>
            </div>
            <div class="menu-arrow">›</div>
          </div>

          <div class="hub-menu-item" @click="toggleSnapshotSection">
            <div class="menu-icon-wrap">◎</div>
            <div class="menu-content">
              <div class="menu-title">诊断流程</div>
              <div class="menu-sub">针对"共觉"的诊断治疗流程</div>
            </div>
            <div class="menu-arrow">{{ snapshotExpanded ? '▾' : '›' }}</div>
          </div>

          <div v-if="snapshotExpanded" class="hub-expand-panel">
            <div v-for="item in systemSnapshot" :key="item" class="snapshot-row">{{ item }}</div>
          </div>
        </div>

        <div class="hub-footer-hint">诊所已就绪 · 随时可以开始接诊</div>
      </div>

      <button class="phone-fab" @click="togglePhonePanel">
        手机
        <span v-if="unreadPhoneCount" class="phone-badge">{{ unreadPhoneCount }}</span>
      </button>
    </section>
    </Transition>

    <!-- ========== 患者档案页 ========== -->
    <Transition name="fade">
    <section v-if="phase === 'patient_records'" class="screen screen-patient-records">

      <header class="phase-topbar">
        <button class="back-btn" @click="closePatientRecords">
          ‹ {{ localSelectedArchive ? '返回列表' : '返回' }}
        </button>
        <div class="phase-topbar-center">
          <div class="phase-title">
            {{ localSelectedArchive ? localSelectedArchive.name : '患者档案' }}
          </div>
          <div v-if="localSelectedArchive" class="phase-sub">
            {{ localSelectedArchive.job }}
          </div>
        </div>
      </header>

      <!-- 列表视图 -->
      <div v-if="!localSelectedArchive" class="pr-scroll-area">
        <div class="pr-list-header">患者档案 / PATIENT RECORDS</div>

        <div v-if="!archiveCases.length" class="pr-empty">尚无诊断记录</div>

        <div class="pr-list">
          <div
            v-for="(archive, idx) in [...archiveCases].reverse()"
            :key="archive.id || idx"
            class="pr-card"
            @click="localSelectedArchive = archive"
          >
            <div class="pr-card-top">
              <div class="pr-outcome-tag" :class="archive.outcome">
                {{ archive.outcomeLabel || '已归档' }}
              </div>
              <div class="pr-card-day">第 {{ archive.gameDay }} 天</div>
            </div>
            <div class="pr-card-name">{{ archive.name }}</div>
            <div class="pr-card-meta">
              <span>{{ archive.job }}</span>
              <span class="pr-dot">·</span>
              <span>第 {{ archive.visitCount || 1 }} 次来诊</span>
              <span class="pr-dot">·</span>
              <span class="pr-income">+{{ archive.settlementTotal || archive.collectedTotal || 0 }} 信用点</span>
            </div>
            <div class="pr-card-divider"></div>
            <div class="pr-card-preview">
              {{ archive.summary || archive.trackingSheet?.symptomSummary || '暂无摘要' }}
            </div>
            <div class="pr-card-enter">查看详情 ›</div>
          </div>
        </div>
      </div>

      <!-- 详情视图 -->
      <div v-if="localSelectedArchive" class="pr-scroll-area">

        <div class="pr-detail-header">
          <div class="pr-detail-name">{{ localSelectedArchive.name }}</div>
          <div class="pr-detail-meta">
            <span>{{ localSelectedArchive.job }}</span>
            <span class="pr-dot">·</span>
            <span>{{ formatArchiveDate(localSelectedArchive) }}</span>
            <span class="pr-dot">·</span>
            <span>第 {{ localSelectedArchive.visitCount || 1 }} 次来诊</span>
          </div>
          <div class="pr-detail-income">
            收入 {{ localSelectedArchive.settlementTotal || localSelectedArchive.collectedTotal || 0 }} 信用点
          </div>
        </div>

        <template v-if="localSelectedArchive.coreConcern || localSelectedArchive.trackingSheet?.coreConcern">
          <div class="pr-section-title">核心牵挂</div>
          <div class="pr-text-card">
            {{ localSelectedArchive.trackingSheet?.coreConcern || localSelectedArchive.coreConcern }}
          </div>
        </template>

        <template v-if="localSelectedArchive.summary || localSelectedArchive.trackingSheet?.symptomSummary">
          <div class="pr-section-title">病例摘要</div>
          <div class="pr-text-card">
            {{ localSelectedArchive.trackingSheet?.symptomSummary || localSelectedArchive.summary }}
          </div>
        </template>

        <template v-if="localSelectedArchive.archiveStory || (localSelectedArchive.closingNarrative && localSelectedArchive.closingNarrative !== localSelectedArchive.feedbackText)">
  <div class="pr-section-title">背景档案</div>
  <div class="pr-text-card pr-story">
    <p
      v-for="(para, i) in splitParagraphs(localSelectedArchive.archiveStory || localSelectedArchive.closingNarrative)"
      :key="i"
    >{{ para }}</p>
  </div>
</template>

        <template v-if="localSelectedArchive.consultationHistory?.length">
          <div class="pr-section-title">问诊记录</div>
          <div class="pr-consult-list">
            <div
              v-for="(entry, i) in localSelectedArchive.consultationHistory"
              :key="entry.id || i"
              class="pr-consult-entry"
              :class="`entry-${entry.speaker}`"
            >
              <div class="pr-entry-label">第 {{ i + 1 }} 条 · {{ getArchiveEntryTypeLabel(entry) }}</div>
              <div class="pr-entry-text">
                <p v-for="(para, pi) in splitParagraphs(entry.text)" :key="pi">{{ para }}</p>
              </div>
            </div>
          </div>
        </template>

        <template v-if="localSelectedArchive.feedbackText">
          <div class="pr-section-title">治疗反馈</div>
          <div class="pr-text-card">
            <p v-for="(para, i) in splitParagraphs(localSelectedArchive.feedbackText)" :key="i">{{ para }}</p>
          </div>
        </template>

        <template v-if="localSelectedArchive.trackingSheet?.changeLog?.length">
          <div class="pr-section-title">诊断变更</div>
          <div class="pr-changelog">
            <div
              v-for="(log, i) in localSelectedArchive.trackingSheet.changeLog"
              :key="i"
              class="pr-changelog-item"
            >{{ log }}</div>
          </div>
        </template>

      </div>

    </section>
    </Transition>

    <!-- ========== 问诊页 ========== -->
    <Transition name="fade">
    <section v-if="phase === 'consult'" class="screen screen-consult">

      <header class="consult-topbar">
        <button class="back-btn" @click="returnToHub">‹ 返回主界面</button>
      </header>

      <div class="consult-frame">

        <div class="frame-header">
          <span class="frame-orn">·</span>
          <span class="frame-title">问诊记录</span>
          <span class="frame-orn">·</span>
        </div>

        <div class="patient-info-bar">
          <div class="patient-name-row">
            <span class="patient-name">{{ activePatient?.name }}</span>
            <span class="patient-sep">·</span>
            <span class="patient-job">{{ activePatient?.job }}</span>
            <span class="patient-sep">·</span>
            <span class="patient-visit">第 {{ activePatient?.visitCount || 1 }} 次来诊</span>
          </div>
          <div class="patient-env-row">
            {{ activeEnvironment?.description || '环境信息暂不可用' }}
          </div>
        </div>

        <button
          v-if="collapsedHistoryCount > 0"
          class="history-toggle-btn"
          @click="showFullHistory = !showFullHistory"
        >
          <span class="toggle-icon">{{ showFullHistory ? '▴' : '▾' }}</span>
          <span>{{ showFullHistory
            ? '收起历史记录'
            : `查看历史记录（${collapsedHistoryCount}条）`
          }}</span>
        </button>

        <div class="frame-content" ref="contentEl">

          <div v-if="!showFullHistory && collapsedHistoryCount > 0" class="history-divider">
            <span class="hd-line"></span>
            <span class="hd-text">以上为历史记录</span>
            <span class="hd-line"></span>
          </div>

          <template v-for="entry in visibleEntries" :key="entry.id">

            <div v-if="entry.speaker === 'narration' || entry.speaker === 'narrator' || entry.speaker === 'system'" class="entry-narration">
              <p v-for="(para, i) in splitParagraphs(entry.text)" :key="i">{{ para }}</p>
            </div>

            <div v-else-if="entry.speaker === 'patient'" class="entry-patient">
              <template v-if="entry.id === typingEntryId">
                <Typewriter
                  :text="entry.text"
                  :speed="45"
                  @done="handleTypingDone"
                />
              </template>
              <template v-else>
                <p v-for="(para, i) in splitParagraphs(entry.text)" :key="i">{{ para }}</p>
              </template>
            </div>
            <div v-else-if="entry.speaker === 'doctor'" class="entry-doctor">
              <span class="entry-doctor-arrow">▷</span>
              <span>{{ entry.text }}</span>
            </div>

            <div v-else class="entry-patient">
              <p v-for="(para, i) in splitParagraphs(entry.text)" :key="i">{{ para }}</p>
            </div>

          </template>

          <div v-if="safeConsultationHistory.length === 0 && !isGeneratingText" class="frame-empty-area">
  <div class="frame-empty-text">等待患者进入诊断室……</div>
  <button class="retry-btn" @click="retryArrivalNarrative">
    重新加载 ↺
  </button>
</div>

        </div>

        <div class="frame-status-bar">
          <div class="status-item">
            <span class="status-label">诊断次数</span>
            <div class="status-pips">
              <span
                v-for="n in diagnosisAttemptsTotal"
                :key="n"
                class="pip"
                :class="{ used: n > diagnosisAttemptsLeft }"
              ></span>
            </div>
            <span class="status-num">{{ diagnosisAttemptsLeft }}</span>
          </div>
          <div class="status-divider"></div>
          <div class="status-item">
            <span class="status-label">今日患者</span>
            <span class="status-num">{{ activePatient?.visitCount || 1 }}</span>
          </div>
        </div>

      </div>

      <!-- 加载中 -->
      <div v-if="isGeneratingText" class="consult-loading-area">
        <div class="loading-wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="loading-text">正在整理新的问诊回应</div>
      </div>

      <!-- 选项区 -->
      <div
  v-if="!isGeneratingText && !isTypingActive && canShowConsultChoices && currentConsultOptions.length > 0 && !pendingSettlementRecord"
  class="consult-choices-area"
>
        <div class="choices-label">做出选择</div>
        <div class="choices-list">
          <button
            v-for="option in currentConsultOptions"
            :key="option.id"
            class="choice-btn"
            @click="chooseConsultOption(option)"
          >
            <span class="choice-title">{{ option.label }}</span>
            <span class="choice-line">{{ option.doctorLine }}</span>
          </button>
        </div>
      </div>

      <!-- 重试按钮：无选项、不在加载、没有待结算记录时显示 -->
      <div
  v-if="!isGeneratingText && !isTypingActive && currentConsultOptions.length === 0 && safeConsultationHistory.length > 0 && !pendingSettlementRecord"
  class="consult-retry-area"
>
        <button class="retry-btn" @click="handleRetryOptions">
  重新生成选项 ↺
</button>
      </div>

      <!-- 结算入口：治疗完成后显示 -->
     <div
  v-if="!isGeneratingText && !isTypingActive && pendingSettlementRecord"
  class="consult-choices-area consult-settlement-area"
>
        <div class="choices-label">本轮收尾</div>
        <div class="consult-settlement-card">
          <div class="feedback-chip" :class="patientFeedbackOutcome">{{ feedbackOutcomeLabel }}</div>
          <div class="consult-settlement-copy">
            问诊记录已写入本轮反馈{{ patientFeedbackOutcome === 'complete' ? '与结尾剧情' : '' }}，确认后进入结算。
          </div>
          <div v-if="patientFeedbackOutcome === 'revisit' && activePatient?.returnDay" class="feedback-schedule">
            已为这位患者预约第 {{ activePatient.returnDay }} 天后的复诊。
          </div>
          <button class="btn-primary consult-settlement-btn" @click="advanceFromFeedback">
            {{ currentFeedbackActionLabel }}
          </button>
        </div>
      </div>

      <div class="consult-fabs">
        <button class="fab-btn" @click="togglePhonePanel">
          手机
          <span v-if="unreadPhoneCount" class="fab-badge">{{ unreadPhoneCount }}</span>
        </button>
      </div>
<!-- 右侧病历记录标签 -->
<div
  class="notes-tab"
  :class="{ open: showNotesDrawer }"
  @click="toggleNotesDrawer"
>
  <span class="notes-tab-text">病历记录</span>
  <span class="notes-tab-arrow">{{ showNotesDrawer ? '›' : '‹' }}</span>
</div>

      <Transition name="drawer-fade">
      <aside v-if="showNotesDrawer" class="notes-drawer">
        <div class="notes-backdrop" @click="toggleNotesDrawer"></div>
        <div class="notes-card">

          <div class="notes-head">
            <div class="notes-head-left">
              <div class="notes-doc-tag">◇ 病历记录 ◇</div>
              <div class="notes-doc-title">病历记录</div>
              <div class="notes-sub">先记笔记，再把结构化诊断提交给诊断仪。</div>
            </div>
            <button class="notes-close-btn" @click="toggleNotesDrawer">›</button>
          </div>

          <div class="notes-scroll-body">

            <div>
              <label class="notes-label">自由笔记</label>
              <textarea
                v-model="consultNotes"
                class="notes-textarea"
                placeholder="随时记录患者提到的关键词、触发场景和你对环境干扰的怀疑。"
                @input="handleConsultNotesInput"
              ></textarea>
            </div>

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
      </Transition>

    </section>
    </Transition>

    <!-- ========== 治疗页 ========== -->
    <Transition name="fade">
    <section v-if="phase === 'treatment'" class="screen screen-treatment">
      <header class="phase-topbar">
        <button class="back-btn" @click="returnToConsult">‹ 返回问诊</button>
        <div class="phase-topbar-center">
          <div class="phase-title">治疗仪设置</div>
          <div class="phase-sub">{{ activePatient?.name }} · {{ activePatientSummary }}</div>
        </div>
        <div class="phase-topbar-actions">
          <button class="btn-secondary compact" @click="saveManualProgress">保存</button>
          <button class="btn-secondary compact" @click="goHome">主界面</button>
        </div>
      </header>

      <div class="treatment-scroll-area">
        <div class="treatment-summary-card">
          <div class="card-section-label">当前确认结果</div>
          <div class="summary-copy">{{ confirmedDiagnosisSummary }}</div>
          <div v-if="narrativeError" class="error-box">{{ narrativeError }}</div>
        </div>

        <div class="treatment-grid">
          <div v-for="sense in senseConfigs" :key="sense.id" class="treatment-card">
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
              </label>
            </div>
          </div>
        </div>

        <div class="treatment-submit-card">
          <div class="card-section-label">治疗方向总览</div>
          <div class="summary-copy">{{ treatmentDraftSummary }}</div>
          <div class="treatment-actions">
            <button class="btn-secondary" @click="returnToConsult">继续补问诊</button>
            <button class="btn-primary" :disabled="!canSubmitTreatment" @click="submitTreatment">
              提交治疗
            </button>
          </div>
        </div>
      </div>
    </section>
    </Transition>

    <!-- ========== 结算页 ========== -->
    <Transition name="fade">
    <section v-if="phase === 'settlement'" class="screen screen-settlement">
      <header class="phase-topbar">
        <button class="back-btn" @click="goHome">‹ 主界面</button>
        <div class="phase-topbar-center">
          <div class="phase-title">诊疗结算</div>
          <div class="phase-sub">{{ currentSettlementRecord?.name }}</div>
        </div>
        <button class="btn-secondary compact" @click="saveManualProgress">保存</button>
      </header>

      <div class="feedback-scroll-area">
        <template v-if="currentSettlementRecord">
          <div class="feedback-card settlement-page-card">
            <div class="card-section-label">结案记录</div>
            <div class="feedback-chip" :class="patientFeedbackOutcome">
              {{ currentSettlementRecord.outcomeLabel }}
            </div>
            <div class="feedback-body">
              <p
                v-for="(para, i) in splitParagraphs(currentSettlementRecord.closingNarrative || currentSettlementRecord.feedbackText)"
                :key="`settlement-${i}`"
              >{{ para }}</p>
            </div>
            <div class="settlement-summary">
              <div class="settlement-stat">
                <div class="settlement-stat-label">成功治愈</div>
                <div class="settlement-stat-value">
                  {{ settlementLevelSummary.length
                    ? settlementLevelSummary.map(item => item.label).join('，')
                    : '无' }}
                </div>
              </div>
              <div class="settlement-stat">
                <div class="settlement-stat-label">获得信用点</div>
                <div class="settlement-stat-value">{{ currentSettlementRecord.collectedTotal }}</div>
              </div>
            </div>
            <div class="feedback-actions">
              <button class="btn-primary" @click="confirmSettlementAndReturn">返回主界面</button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="frame-empty">正在加载结算信息……</div>
        </template>
      </div>
    </section>
    </Transition>

    <!-- ========== 手机弹窗 ========== -->
    <Transition name="modal-fade">
    <div v-if="showPhonePanel" class="modal-overlay" @click.self="togglePhonePanel">
      <div class="modal-card phone-modal">
        <div class="modal-kicker">诊所手机</div>
        <div class="modal-title">短信息</div>
        <p class="modal-text">待回款 {{ pendingDebtCount }} 笔</p>
        <div v-if="phoneMessages.length" class="phone-message-list">
          <div
            v-for="message in phoneMessages"
            :key="message.id"
            class="phone-message-item"
            :class="{ unread: !message.read }"
          >
            <div class="phone-message-head">
              <strong>{{ message.sender }}</strong>
              <span>第 {{ message.gameDay }} 天</span>
            </div>
            <div class="phone-message-body">{{ message.text }}</div>
          </div>
        </div>
        <div v-else class="modal-empty">暂时没有新的短信息。</div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="togglePhonePanel">关闭</button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ========== 确认覆盖弹窗 ========== -->
    <Transition name="modal-fade">
    <div v-if="showConfirmNewGameModal" class="modal-overlay" @click.self="cancelStartNewGame">
      <div class="modal-card">
        <div class="modal-kicker">覆盖确认</div>
        <div class="modal-title">检测到现有存档</div>
        <p class="modal-text">开始新游戏会覆盖当前进度，并从背景介绍第一页重新开始。</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelStartNewGame">取消</button>
          <button class="btn-primary" @click="confirmStartNewGame">确认覆盖</button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ========== 升级失败弹窗 ========== -->
    <Transition name="modal-fade">
    <div v-if="showUpgradeFailureModal" class="modal-overlay" @click.self="closeUpgradeFailureModal">
      <div class="modal-card">
        <div class="modal-kicker">升级失败</div>
        <div class="modal-title">当前无法完成升级</div>
        <p class="modal-text">{{ upgradeFailureMessage }}</p>
        <div class="modal-actions">
          <button class="btn-primary" @click="closeUpgradeFailureModal">知道了</button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ========== 玩家档案弹窗 ========== -->
    <Transition name="modal-fade">
    <div v-if="showProfilePanel" class="modal-overlay" @click.self="toggleProfilePanel">
      <div class="modal-card profile-modal">
        <div class="modal-kicker">玩家档案</div>
        <div class="profile-modal-head">
          <div class="profile-avatar-wrap" @click="triggerAvatarUpload">
            <img v-if="playerProfile.avatar" :src="playerProfile.avatar" class="profile-avatar-img" />
            <span v-else>{{ (playerProfile.title || '维').slice(-1) }}</span>
          </div>
          <div class="profile-modal-meta">
            <label class="notes-label">代号</label>
            <input
              :value="playerProfile.title"
              class="profile-input"
              type="text"
              placeholder="输入玩家名字"
              @change="handlePlayerNameChange"
            />
          </div>
        </div>
        <div class="modal-stats-row">
          <div class="modal-stat">
            <div class="modal-stat-label">已治愈</div>
            <div class="modal-stat-val">{{ totalCuredCount }}</div>
          </div>
          <div class="modal-stat">
            <div class="modal-stat-label">累计收入</div>
            <div class="modal-stat-val">{{ totalEarnings }}</div>
          </div>
          <div class="modal-stat">
            <div class="modal-stat-label">设备等级</div>
            <div class="modal-stat-val">{{ totalEquipmentLevel }}</div>
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
import { ref, computed, watch, nextTick } from 'vue'
import Typewriter from '@/components/common/Typewriter.vue'
import { useGameLogic } from './composables/useGameLogic'

const contentEl = ref(null)
const showFullHistory = ref(false)
const showPhonePanel = ref(false)
const localSelectedArchive = ref(null)

const {
  phase,
  consultStage, 
  consultEntryStage,
  hasSave, hasArchiveSave, isCheckingSave,
  showConfirmNewGameModal, showUpgradeFailureModal, upgradeFailureMessage,
  showProfilePanel, showSettlementModal, showNotesDrawer,
  isGeneratingText, typingEntryId, isEnvironmentLoading, narrativeError,
  patientFeedbackText, patientFeedbackOutcome, currentSettlementRecord, pendingSettlementRecord,
  backgroundPage, backgroundTotal,
  credits, gameDay,
  playerProfile,
  activePatient, activeEnvironment, currentEnvironment,
  currentEnvironmentDescription,
  consultationHistory, consultNotes,
  diagnosisDraft, treatmentDraft,
  currentBackgroundPage,
  pendingRevisitCount, dueRevisitCount,
  phoneMessages, unreadPhoneCount, pendingDebtCount,
  equipmentModuleRows, systemSnapshot,
  currentConsultOptions, canShowConsultChoices,
  confirmedDiagnosisDetails, confirmedDiagnosisSummary,
  treatmentDraftSummary,
  canSubmitDiagnosis, canEnterTreatment, canSubmitTreatment,
  archiveCases, settlementLevelSummary,
  totalEarnings, totalCuredCount, totalEquipmentLevel,
  latestArchiveLabel,
  canStartPatientFlow, patientArrivalStatusText,
  currentFeedbackActionLabel, feedbackOutcomeLabel,
  activePatientSummary, diagnosisAttemptLabel,
  diagnosisAttemptsLeft, diagnosisAttemptsTotal,
  hubActions, senseConfigs, senseLabels, senseTargets,
  equipmentExpanded, snapshotExpanded,continueConsultFlow,
  startNewGame, confirmStartNewGame, cancelStartNewGame,
  continueGame, loadArchivedGame,
  saveManualProgress, toggleProfilePanel,
  updatePlayerName, updatePlayerAvatar,
  markPhoneMessagesRead,
  upgradeEquipmentModule, goHome,
  returnToHub, returnToTitle,
  goToNextBackgroundPage, goToPrevBackgroundPage,
  startPatientFlow,
  chooseConsultOption,
  handleConsultNotesInput,
  toggleDiagnosisTarget, toggleTreatmentTarget,
  getTreatmentOptionMeta,
  submitDiagnosis, openTreatmentScreen,
  returnToConsult, submitTreatment,
  advanceFromFeedback, confirmSettlementAndReturn,
  toggleEquipmentSection, toggleSnapshotSection,
  closeUpgradeFailureModal, toggleNotesDrawer,
  refreshConsultOptions,
} = useGameLogic()

// ---- 对话历史 ----

const safeConsultationHistory = computed(() => {
  return (consultationHistory.value || [])
    .map(entry => ({ ...entry, text: String(entry?.text || '') }))
    .filter(entry => entry.text && entry.text.trim())
})

const visibleEntries = computed(() => {
  if (showFullHistory.value) return safeConsultationHistory.value
  return safeConsultationHistory.value.slice(-2)
})

const collapsedHistoryCount = computed(() =>
  Math.max(0, safeConsultationHistory.value.length - 2)
)

watch(() => safeConsultationHistory.value.length, () => {
  showFullHistory.value = false
  nextTick(() => {
    if (contentEl.value) {
      contentEl.value.scrollTop = contentEl.value.scrollHeight
    }
  })
})

watch(() => phase.value, () => {
  showPhonePanel.value = false
})

// ---- 手机弹窗 ----

function togglePhonePanel() {
  showPhonePanel.value = !showPhonePanel.value
  if (showPhonePanel.value) markPhoneMessagesRead()
}

// ---- 患者档案页导航 ----

function openPatientRecords() {
  localSelectedArchive.value = null
  phase.value = 'patient_records'
}

function closePatientRecords() {
  if (localSelectedArchive.value) {
    localSelectedArchive.value = null
  } else {
    phase.value = 'hub'
  }
}

// ---- 工具函数 ----

function splitParagraphs(text = '') {
  return String(text).split(/\n+/).map(s => s.trim()).filter(Boolean)
}

function isChecked(mapping, sourceId, targetId) {
  return Array.isArray(mapping?.[sourceId]) && mapping[sourceId].includes(targetId)
}

function handlePlayerNameChange(e) {
  updatePlayerName(e?.target?.value)
}

function triggerAvatarUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updatePlayerAvatar(reader.result)
    reader.readAsDataURL(file)
  }
  input.click()
}

function formatArchiveDate(record) {
  const timestamp = Number(record?.resolvedAt || 0)
  if (timestamp > 0) {
    const d = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(timestamp).replace(/\//g, '.')
    return `第 ${record?.gameDay || '-'} 天 · ${d}`
  }
  return `第 ${record?.gameDay || '-'} 天`
}

function getArchiveEntryTypeLabel(entry) {
  const map = {
    arrival: '初诊', question: '问诊', answer: '患者反馈',
    diagnosis: '诊断仪', treatment_feedback: '治疗反馈',
    narration: '旁白', doctor: '医生', patient: '患者', system: '系统'
  }
  return map[entry?.type] || map[entry?.speaker] || '记录'
}

async function retryArrivalNarrative() {
  if (!activePatient.value || isGeneratingText.value) return
  // 重置状态让 continueConsultFlow 可以执行
  consultEntryStage.value = 'pre_consult'
  await continueConsultFlow()
}

const isTypingActive = computed(() => !!typingEntryId.value)
function handleTypingDone() {
  typingEntryId.value = ''
}

async function handleRetryOptions() {
  typingEntryId.value = ''
  isGeneratingText.value = true
  narrativeError.value = ''
  try {
    await refreshConsultOptions()
  } finally {
    isGeneratingText.value = false
  }
}

</script>

<style scoped>
/* ============================================================
   共觉之境 · 完整样式表
============================================================ */

.synesthesia-shell {
  --bg-wall:       #1c1812;
  --bg-paper:      #f0e6d2;
  --bg-panel:      rgba(240, 230, 210, 0.95);
  --bg-card:       rgba(248, 240, 224, 0.9);
  --bg-card-hover: rgba(255, 250, 240, 0.98);
  --bg-input:      rgba(255, 255, 255, 0.6);

  --border-paper:  rgba(160, 130, 80, 0.2);
  --border-warm:   rgba(180, 140, 70, 0.4);
  --border-amber:  rgba(200, 130, 10, 0.6);
  --border-cyan:   rgba(0, 180, 200, 0.35);

  --text-dark:     #1e1810;
  --text-main:     #3c3020;
  --text-muted:    #7a6848;
  --text-dim:      #b09060;

  --amber:         #c8820a;
  --amber-dim:     rgba(200, 130, 10, 0.1);
  --cyan:          #1a8090;
  --cyan-dim:      rgba(0, 180, 200, 0.08);

  --shadow-sm:     0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md:     0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg:     0 8px 28px rgba(0, 0, 0, 0.18);

  font-family: 'KaiTi', 'STKaiti', 'Noto Serif SC', serif;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-wall);
  color: var(--text-main);
  position: relative;
}

.synesthesia-shell::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
}

.screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

/* ============================================================
   通用组件
============================================================ */

.back-btn {
  padding: 0.45rem 1rem;
  background: transparent;
  border: 1px solid var(--border-paper);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.back-btn:hover {
  border-color: var(--border-amber);
  color: var(--amber);
  background: var(--amber-dim);
}

.btn-primary {
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  background: linear-gradient(180deg, #d49010, #a86808);
  border: 1px solid rgba(200, 150, 20, 0.5);
  color: #fff8e8;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(150, 90, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: all 0.22s ease;
}
.btn-primary:hover {
  background: linear-gradient(180deg, #e09a18, #b87808);
  transform: translateY(-1px);
  box-shadow: 0 5px 14px rgba(150, 90, 0, 0.35);
}
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.38; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-secondary {
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  background: transparent;
  border: 1px solid var(--border-paper);
  color: var(--text-muted);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--border-amber);
  color: var(--amber);
  background: var(--amber-dim);
}
.btn-secondary.compact { padding: 0.42rem 0.85rem; font-size: 0.74rem; }
.btn-secondary:disabled { opacity: 0.32; cursor: not-allowed; }

.error-box {
  padding: 0.7rem 0.9rem;
  border-radius: 6px;
  background: rgba(200, 64, 64, 0.06);
  border: 1px solid rgba(200, 64, 64, 0.2);
  color: #8a3030;
  font-size: 0.82rem;
  line-height: 1.8;
}

.card-section-label {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: var(--amber);
  margin-bottom: 0.4rem;
}

.summary-copy {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.8;
}

/* ============================================================
   页面切换动画
============================================================ */

.fade-enter-active {
  transition: opacity 0.55s ease, transform 0.55s ease, filter 0.55s ease;
}
.fade-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease, filter 0.32s ease;
  position: absolute;
  width: 100%;
}
.fade-enter-from { opacity: 0; transform: translateY(8px) scale(0.99); filter: blur(4px); }
.fade-leave-to   { opacity: 0; transform: translateY(-5px) scale(1.01); filter: blur(2px); }

.modal-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-fade-enter-from { opacity: 0; transform: scale(0.97); }
.modal-fade-leave-to   { opacity: 0; transform: scale(1.02); }

.drawer-fade-enter-active { transition: opacity 0.25s ease; }
.drawer-fade-leave-active { transition: opacity 0.18s ease; }
.drawer-fade-enter-from   { opacity: 0; }
.drawer-fade-leave-to     { opacity: 0; }

/* ============================================================
   标题页
============================================================ */

.screen-title {
  background:
    radial-gradient(ellipse at 15% 25%, rgba(160, 48, 200, 0.05) 0%, transparent 40%),
    radial-gradient(ellipse at 85% 75%, rgba(0, 180, 200, 0.05) 0%, transparent 35%),
    linear-gradient(160deg, #221c14 0%, var(--bg-wall) 100%);
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.title-bg-layer { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

.title-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(200, 130, 10, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 130, 10, 0.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(ellipse 70% 70% at 40% 45%, black 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 70% 70% at 40% 45%, black 20%, transparent 75%);
}

.title-circle-outer {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -52%);
  width: min(88vw, 430px); height: min(88vw, 430px);
  border-radius: 50%;
  border: 1px dashed rgba(160, 130, 80, 0.3);
  animation: circleRotate 40s linear infinite;
}
.title-circle-inner {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -52%);
  width: min(62vw, 295px); height: min(62vw, 295px);
  border-radius: 50%;
  border: 1px dotted rgba(160, 130, 80, 0.2);
  animation: circleRotate 28s linear infinite reverse;
}
@keyframes circleRotate {
  0%   { transform: translate(-50%, -52%) rotate(0deg); }
  100% { transform: translate(-50%, -52%) rotate(360deg); }
}

.title-orbs { position: absolute; inset: 0; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(72px); opacity: 0.22; }
.orb-1 {
  width: 320px; height: 320px; top: -12%; left: -14%;
  background: radial-gradient(circle, rgba(200, 130, 10, 0.4), transparent 65%);
  animation: orbDrift 22s ease-in-out infinite alternate;
}
.orb-2 {
  width: 260px; height: 260px; bottom: -8%; right: -10%;
  background: radial-gradient(circle, rgba(0, 180, 200, 0.3), transparent 65%);
  animation: orbDrift 28s ease-in-out infinite alternate reverse;
}
.orb-3 {
  width: 190px; height: 190px; top: 22%; right: 6%;
  background: radial-gradient(circle, rgba(160, 50, 200, 0.22), transparent 65%);
  animation: orbDrift 18s ease-in-out infinite alternate;
}
.orb-4 {
  width: 170px; height: 170px; bottom: 18%; left: 8%;
  background: radial-gradient(circle, rgba(0, 180, 200, 0.18), transparent 65%);
  animation: orbDrift 24s ease-in-out infinite alternate reverse;
}
@keyframes orbDrift {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(14px, -9px) scale(1.05); }
  100% { transform: translate(-7px, 16px) scale(0.95); }
}

.title-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.65rem;
  width: min(320px, calc(100vw - 3rem));
  margin-top: -2.5rem;
}

.title-eyebrow {
  font-family: 'Courier New', monospace;
  font-size: 0.5rem;
  letter-spacing: 0.32em;
  color: #a08050;
  opacity: 0.75;
}

.title-main {
  margin: 0;
  font-size: clamp(2.4rem, 10vw, 3.8rem);
  font-weight: normal;
  letter-spacing: 0.25em;
  color: #f0e6d2;
  line-height: 1;
  text-shadow: 0 0 40px rgba(200, 130, 10, 0.2), 0 2px 12px rgba(0,0,0,0.4);
  animation: titleGlow 6s ease-in-out infinite alternate;
}
@keyframes titleGlow {
  0%   { text-shadow: 0 0 30px rgba(200,130,10,0.15), 0 2px 12px rgba(0,0,0,0.4); }
  100% { text-shadow: 0 0 50px rgba(200,130,10,0.3), 0 2px 12px rgba(0,0,0,0.4); }
}

.title-sub {
  margin: 0;
  font-size: 0.78rem;
  color: #a08868;
  letter-spacing: 0.22em;
  margin-top: -0.2rem;
}

.title-tag {
  font-size: 0.7rem;
  color: #5a9080;
  letter-spacing: 0.15em;
  font-family: 'Courier New', monospace;
}
.tag-bracket { color: rgba(160, 130, 80, 0.45); }

.title-divider {
  width: 44px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 130, 10, 0.5), transparent);
  margin: 0.05rem 0;
}

.title-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.2rem;
}

.title-btn-primary {
  width: 100%;
  padding: 0.95rem 1.5rem;
  min-height: 56px;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff, #f5edda);
  border: 1px solid rgba(200, 150, 30, 0.45);
  color: #c8820a;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  box-shadow: 0 4px 14px rgba(200,130,10,0.15), inset 0 1px 0 rgba(255,255,255,0.9);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.title-btn-primary:hover {
  background: #ffffff;
  border-color: rgba(200, 150, 30, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(200,130,10,0.25), inset 0 1px 0 rgba(255,255,255,0.9);
}
.title-btn-primary:active { transform: translateY(0); }
.btn-icon { font-size: 0.68rem; opacity: 0.8; }

.title-btn-secondary {
  width: 100%;
  padding: 0.72rem 1.5rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(200, 180, 140, 0.22);
  color: #c0a878;
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition: all 0.2s;
}
.title-btn-secondary:hover:not(.disabled):not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(200, 150, 30, 0.4);
  color: #e0c090;
}
.title-btn-secondary.disabled,
.title-btn-secondary:disabled { opacity: 0.28; cursor: not-allowed; }

.title-archive-hint {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  color: #786040;
  letter-spacing: 0.1em;
  margin-top: -0.15rem;
}

.title-back-link {
  background: transparent;
  border: none;
  color: #786040;
  font-family: inherit;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  cursor: pointer;
  padding: 0.28rem;
  transition: color 0.2s;
  margin-top: 0.25rem;
}
.title-back-link:hover { color: var(--amber); }

/* ============================================================
   背景介绍页
============================================================ */

.screen-intro { background: var(--bg-paper); overflow: hidden; }

.intro-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.4rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-paper);
  background: rgba(240, 230, 210, 0.95);
}

.intro-chapter-indicator { display: flex; gap: 7px; align-items: center; }
.chapter-dot {
  width: 20px; height: 2px;
  border-radius: 1px;
  background: rgba(160, 130, 80, 0.2);
  transition: all 0.35s;
}
.chapter-dot.active { background: var(--amber); width: 26px; }

.intro-scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.intro-scroll-area::-webkit-scrollbar { display: none; }

.intro-reading-column {
  max-width: 560px;
  margin: 0 auto;
  padding: 2rem 1.8rem 3.5rem;
  display: flex;
  flex-direction: column;
}

.intro-chapter-tag {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  color: var(--amber);
  margin-bottom: 1rem;
}

.intro-lead {
  margin: 0 0 1.8rem 0;
  font-size: clamp(1.4rem, 5vw, 1.85rem);
  font-weight: normal;
  line-height: 1.55;
  color: var(--text-dark);
  letter-spacing: 0.05em;
}

.intro-body { display: flex; flex-direction: column; }

.intro-paragraph {
  margin: 0 0 1.1rem 0;
  font-size: 0.94rem;
  line-height: 2.1;
  color: var(--text-main);
  letter-spacing: 0.04em;
  text-indent: 2em;
}
.intro-paragraph:last-of-type { margin-bottom: 0; }

.intro-blockquote {
  margin: 1.4rem 0;
  padding: 0.85rem 0 0.85rem 1.2rem;
  border-left: 3px solid var(--amber);
  background: rgba(200, 130, 10, 0.04);
  border-radius: 0 4px 4px 0;
  font-size: 0.9rem;
  line-height: 2;
  color: #5a4820;
  font-style: italic;
  letter-spacing: 0.04em;
  text-indent: 0;
}

.intro-footer-nav {
  display: flex;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-paper);
}

.intro-next-btn {
  padding: 0.68rem 1.8rem;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border-amber);
  color: var(--amber);
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: all 0.25s;
}
.intro-next-btn:hover { background: var(--amber-dim); transform: translateX(4px); }

/* ============================================================
   主界面 Hub
============================================================ */

.screen-hub { background: var(--bg-wall); overflow: hidden; }

.hub-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.2rem;
  flex-shrink: 0;
  background: rgba(240, 230, 210, 0.96);
  border-bottom: 1px solid var(--border-paper);
  box-shadow: 0 1px 0 rgba(200, 130, 10, 0.08);
  gap: 0.8rem;
}

.hub-topbar-center {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.hub-credits, .hub-day {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  color: var(--amber);
}

.hub-system-tag {
  font-family: 'Courier New', monospace;
  font-size: 0.48rem;
  letter-spacing: 0.2em;
  color: #a08050;
  opacity: 0.65;
}

.hub-scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0.9rem 1.1rem 5rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.hub-scroll-area::-webkit-scrollbar { display: none; }

.hub-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(160, 130, 80, 0.15);
  box-shadow: var(--shadow-sm);
  transition: all 0.22s ease;
}

.hub-profile-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.95rem 1.1rem;
  cursor: pointer;
}
.hub-profile-card:hover {
  transform: translateX(3px);
  border-color: rgba(200, 130, 10, 0.28);
  box-shadow: var(--shadow-md);
}

.hub-profile-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1.5px solid rgba(200, 130, 10, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 130, 10, 0.07);
  color: var(--amber);
  font-size: 1rem;
  flex-shrink: 0;
  overflow: hidden;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.hub-profile-info { flex: 1; }
.hub-profile-name { font-size: 1rem; color: var(--text-dark); letter-spacing: 0.06em; }
.hub-profile-meta {
  margin-top: 0.18rem;
  font-size: 0.68rem;
  color: var(--text-dim);
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
}
.hub-profile-arrow { color: #c0a060; font-size: 1rem; flex-shrink: 0; }

.hub-environment-card {
  padding: 0.95rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.hub-env-label {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: var(--text-dim);
}
.hub-env-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.78;
  margin-top: 0.1rem;
  animation: envContentIn 0.5s ease;
}
@keyframes envContentIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hub-menu-list { display: flex; flex-direction: column; gap: 0.5rem; }

.hub-menu-item {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(160, 130, 80, 0.13);
  box-shadow: var(--shadow-sm);
  padding: 0.9rem 1.05rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.hub-menu-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--amber);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.hub-menu-item:hover { transform: translateX(4px); border-color: rgba(200, 130, 10, 0.22); box-shadow: var(--shadow-md); }
.hub-menu-item:hover::before { opacity: 1; }

.hub-menu-primary {
  border-color: rgba(200, 130, 10, 0.28);
  background: linear-gradient(135deg, #ffffff, rgba(248, 240, 218, 0.7));
}
.hub-menu-primary:hover { border-color: rgba(200, 130, 10, 0.5); }

.hub-menu-item.disabled { opacity: 0.48; cursor: not-allowed; }
.hub-menu-item.disabled:hover { transform: none; border-color: rgba(160,130,80,0.13); box-shadow: var(--shadow-sm); }
.hub-menu-item.disabled:hover::before { opacity: 0; }

.menu-icon-wrap {
  width: 34px; height: 34px;
  border-radius: 9px;
  background: rgba(160, 130, 80, 0.07);
  border: 1px solid rgba(160, 130, 80, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #a08050;
  flex-shrink: 0;
}
.primary-icon {
  background: rgba(200, 130, 10, 0.08);
  border-color: rgba(200, 130, 10, 0.22);
  color: var(--amber);
}

.menu-content { flex: 1; }
.menu-title { font-size: 0.9rem; color: var(--text-dark); letter-spacing: 0.04em; }
.menu-sub { margin-top: 0.2rem; font-size: 0.74rem; color: var(--text-muted); line-height: 1.55; }
.menu-arrow { color: #c0a060; font-size: 0.88rem; flex-shrink: 0; transition: transform 0.2s; }
.hub-menu-item:hover .menu-arrow { transform: translateX(2px); }

.hub-expand-panel {
  background: rgba(235, 224, 202, 0.55);
  border-radius: 10px;
  border: 1px dashed var(--border-paper);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: -0.25rem;
}

.equipment-group { display: flex; flex-direction: column; gap: 0.45rem; }
.equipment-group-name {
  font-size: 0.78rem;
  color: #5a4820;
  font-weight: bold;
  letter-spacing: 0.06em;
  padding-bottom: 0.28rem;
  border-bottom: 1px solid var(--border-paper);
}
.equipment-module-list { display: flex; flex-direction: column; gap: 0.32rem; }
.equipment-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  padding: 0.22rem 0;
}
.eq-label { flex: 1; }
.eq-level { font-family: 'Courier New', monospace; color: var(--cyan); min-width: 2.5rem; }
.eq-upgrade-btn {
  padding: 0.22rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border-amber);
  background: transparent;
  color: var(--amber);
  font-family: inherit;
  font-size: 0.68rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s;
}
.eq-upgrade-btn:hover:not(:disabled) { background: var(--amber-dim); }
.eq-upgrade-btn:disabled { opacity: 0.38; cursor: not-allowed; color: var(--text-muted); border-color: var(--border-paper); }

.snapshot-row {
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.75;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--border-paper);
  font-family: 'Courier New', monospace;
}
.snapshot-row:last-child { border-bottom: none; }

.hub-footer-hint {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 0.58rem;
  color: var(--text-dim);
  letter-spacing: 0.25em;
  opacity: 0.55;
  padding: 0.4rem 0;
}

.phone-fab {
  position: fixed;
  right: 1.2rem;
  bottom: 1.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.68rem 1.2rem;
  border-radius: 18px;
  background: rgba(240, 230, 210, 0.96);
  border: 1px solid var(--border-warm);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  z-index: 50;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
  transition: all 0.2s;
}
.phone-fab:hover { border-color: var(--border-amber); color: var(--amber); transform: translateY(-1px); }
.phone-badge {
  min-width: 16px; height: 16px;
  padding: 0 3px;
  border-radius: 6px;
  background: var(--amber);
  color: #fff8e8;
  font-size: 0.6rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 环境加载动画 */
.env-loading { display: flex; flex-direction: column; gap: 0.55rem; padding: 0.2rem 0; }
.env-loading-bars { display: flex; align-items: flex-end; gap: 3px; height: 18px; }
.env-loading-bars span {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--amber), rgba(200, 130, 10, 0.15));
  animation: envBarWave 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.env-loading-bars span:nth-child(1) { animation-delay: 0s; }
.env-loading-bars span:nth-child(2) { animation-delay: 0.12s; }
.env-loading-bars span:nth-child(3) { animation-delay: 0.24s; }
.env-loading-bars span:nth-child(4) { animation-delay: 0.36s; }
.env-loading-bars span:nth-child(5) { animation-delay: 0.48s; }
@keyframes envBarWave {
  0%, 100% { height: 4px; opacity: 0.25; }
  50%       { height: 18px; opacity: 0.9; }
}
.env-loading-text {
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  color: var(--text-dim);
  letter-spacing: 0.2em;
  animation: envTextBreathe 2.2s ease-in-out infinite;
}
@keyframes envTextBreathe {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.85; }
}

/* ============================================================
   患者档案页
============================================================ */

.screen-patient-records {
  background: var(--bg-paper);
  overflow: hidden;
  z-index: 5;
}

.pr-scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 1rem 1.1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.pr-scroll-area::-webkit-scrollbar { display: none; }

.pr-list-header {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  color: var(--amber);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-paper);
}

.pr-empty {
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-dim);
  letter-spacing: 0.12em;
  padding: 2.5rem 0;
  font-family: 'Courier New', monospace;
}

.pr-list { display: flex; flex-direction: column; gap: 0.6rem; }

.pr-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(160, 130, 80, 0.14);
  box-shadow: var(--shadow-sm);
  padding: 0.95rem 1.05rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  gap: 0.32rem;
  position: relative;
  overflow: hidden;
}
.pr-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--amber);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.pr-card:hover {
  transform: translateY(-2px) translateX(2px);
  border-color: rgba(200, 130, 10, 0.25);
  box-shadow: var(--shadow-md);
}
.pr-card:hover::before { opacity: 1; }

.pr-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.pr-outcome-tag {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  padding: 0.18rem 0.55rem;
  border-radius: 4px;
  border: 1px solid var(--border-amber);
  background: var(--amber-dim);
  color: var(--amber);
}
.pr-outcome-tag.partial,
.pr-outcome-tag.revisit {
  border-color: var(--border-cyan);
  background: var(--cyan-dim);
  color: var(--cyan);
}

.pr-card-day {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  color: var(--text-dim);
  letter-spacing: 0.1em;
}

.pr-card-name {
  font-size: 1.15rem;
  color: var(--text-dark);
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.pr-card-meta {
  display: flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}
.pr-dot { color: rgba(160, 130, 80, 0.35); }
.pr-income { color: var(--amber); font-family: 'Courier New', monospace; }

.pr-card-divider {
  height: 1px;
  background: linear-gradient(90deg, var(--border-paper), transparent);
  margin: 0.05rem 0;
}

.pr-card-preview {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.65;
  letter-spacing: 0.03em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pr-card-enter {
  font-size: 0.65rem;
  color: var(--border-warm);
  letter-spacing: 0.1em;
  text-align: right;
  opacity: 0;
  transition: opacity 0.2s;
  font-family: 'Courier New', monospace;
}
.pr-card:hover .pr-card-enter { opacity: 1; color: var(--amber); }

.pr-detail-header {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(160, 130, 80, 0.15);
  padding: 1.1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
}

.pr-detail-name {
  font-size: 1.4rem;
  color: var(--text-dark);
  letter-spacing: 0.12em;
}

.pr-detail-meta {
  display: flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-wrap: wrap;
  font-family: 'Courier New', monospace;
}

.pr-detail-income {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  color: var(--amber);
  letter-spacing: 0.08em;
  margin-top: 0.1rem;
}

.pr-section-title {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.25em;
  color: var(--amber);
  padding-bottom: 0.38rem;
  border-bottom: 1px solid var(--border-paper);
  margin-top: 0.2rem;
}

.pr-text-card {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid rgba(160, 130, 80, 0.13);
  padding: 0.85rem 1rem;
  box-shadow: var(--shadow-sm);
  font-size: 0.86rem;
  color: var(--text-main);
  line-height: 1.9;
  letter-spacing: 0.03em;
}

.pr-story p {
  margin: 0 0 0.5rem 0;
  font-size: 0.86rem;
  color: var(--text-main);
  line-height: 1.95;
  letter-spacing: 0.04em;
  text-indent: 2em;
}
.pr-story p:last-child { margin-bottom: 0; }

.pr-consult-list { display: flex; flex-direction: column; gap: 0.5rem; }

.pr-consult-entry {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid rgba(160, 130, 80, 0.12);
  border-left: 2px solid rgba(160, 130, 80, 0.2);
  padding: 0.75rem 0.95rem;
  box-shadow: var(--shadow-sm);
}
.pr-consult-entry.entry-doctor { border-left-color: var(--border-cyan); }
.pr-consult-entry.entry-narration {
  border-left-color: rgba(160, 130, 80, 0.3);
  background: rgba(248, 240, 224, 0.5);
}

.pr-entry-label {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: var(--text-dim);
  margin-bottom: 0.38rem;
}
.pr-consult-entry.entry-doctor .pr-entry-label { color: var(--cyan); }
.pr-consult-entry.entry-narration .pr-entry-label { color: var(--amber); }

.pr-entry-text p {
  margin: 0 0 0.35rem 0;
  font-size: 0.84rem;
  color: var(--text-main);
  line-height: 1.9;
  letter-spacing: 0.03em;
}
.pr-entry-text p:last-child { margin-bottom: 0; }
.pr-consult-entry.entry-narration .pr-entry-text p {
  color: #8a7058;
  font-style: italic;
}

.pr-changelog {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid rgba(160, 130, 80, 0.13);
  padding: 0.75rem 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}
.pr-changelog-item {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.75;
  padding: 0.32rem 0;
  border-bottom: 1px solid var(--border-paper);
  font-family: 'Courier New', monospace;
}
.pr-changelog-item:last-child { border-bottom: none; }
.pr-changelog-item:first-child { padding-top: 0; }

/* ============================================================
   问诊页
============================================================ */

.screen-consult { background: var(--bg-paper); overflow: hidden; }

.consult-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.72rem 1.1rem;
  flex-shrink: 0;
  background: rgba(240, 230, 210, 0.96);
  border-bottom: 1px solid var(--border-paper);
  box-shadow: 0 1px 0 rgba(200, 130, 10, 0.06);
  gap: 0.7rem;
}

.diagnosis-chip {
  padding: 0.28rem 0.8rem;
  border-radius: 18px;
  border: 1px solid var(--border-cyan);
  background: var(--cyan-dim);
  color: var(--cyan);
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.consult-frame {
  flex: 1;
  min-height: 0;
  margin: 0.7rem 0.9rem 0;
  border-radius: 10px;
  border: 1px solid var(--border-warm);
  background: #ffffff;
  box-shadow: var(--shadow-md), inset 0 0 18px rgba(200, 180, 140, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.frame-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.52rem 1rem;
  background: rgba(200, 130, 10, 0.05);
  border-bottom: 1px solid rgba(160, 130, 80, 0.13);
  flex-shrink: 0;
}
.frame-title {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  color: var(--amber);
}
.frame-orn { font-size: 0.38rem; color: rgba(160, 130, 80, 0.45); }

.patient-info-bar {
  padding: 0.55rem 1.05rem 0.5rem;
  border-bottom: 1px solid rgba(160, 130, 80, 0.1);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
}
.patient-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.28rem;
  font-size: 0.8rem;
}
.patient-name { color: var(--amber); font-weight: bold; font-family: 'Courier New', monospace; }
.patient-sep  { color: rgba(160, 130, 80, 0.35); }
.patient-job  { color: #5a4820; }
.patient-visit { color: var(--text-dim); font-family: 'Courier New', monospace; font-size: 0.72rem; }
.patient-env-row { font-size: 0.73rem; color: #8a7050; line-height: 1.6; }

.history-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.38rem;
  padding: 0.32rem 1.05rem;
  background: rgba(240, 230, 210, 0.55);
  border: none;
  border-bottom: 1px dashed rgba(160, 130, 80, 0.16);
  cursor: pointer;
  color: var(--text-dim);
  font-family: inherit;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  transition: all 0.18s;
  flex-shrink: 0;
  width: 100%;
  text-align: left;
}
.history-toggle-btn:hover { color: var(--amber); background: rgba(200,130,10,0.04); }
.toggle-icon { font-size: 0.62rem; color: var(--amber); }

.frame-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.9rem 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  scrollbar-width: none;
}
.frame-content::-webkit-scrollbar { display: none; }

.history-divider {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem 0;
  flex-shrink: 0;
}
.hd-line { flex: 1; height: 1px; background: rgba(160, 130, 80, 0.18); }
.hd-text {
  font-size: 0.58rem;
  color: var(--text-dim);
  letter-spacing: 0.2em;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}

.entry-narration p {
  margin: 0 0 0.38rem 0;
  font-size: 0.86rem;
  line-height: 1.95;
  color: #8a7058;
  font-style: italic;
  letter-spacing: 0.03em;
}
.entry-narration p:last-child { margin-bottom: 0; }

.entry-patient p {
  margin: 0 0 0.38rem 0;
  font-size: 0.92rem;
  line-height: 2;
  color: #2e2210;
  letter-spacing: 0.04em;
}
.entry-patient p:last-child { margin-bottom: 0; }

.entry-doctor {
  font-size: 0.8rem;
  color: #8a7050;
  display: flex;
  align-items: flex-start;
  gap: 0.38rem;
  letter-spacing: 0.03em;
  line-height: 1.7;
}
.entry-doctor-arrow { color: var(--amber); flex-shrink: 0; font-size: 0.68rem; margin-top: 0.14rem; }

.frame-empty-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.frame-empty-text {
  font-size: 0.75rem;
  color: var(--text-dim);
  letter-spacing: 0.2em;
  font-family: 'Courier New', monospace;
}

.frame-status-bar {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.5rem 1.05rem;
  border-top: 1px solid rgba(160, 130, 80, 0.13);
  background: rgba(240, 230, 210, 0.38);
  flex-shrink: 0;
}
.status-item { display: flex; align-items: center; gap: 0.45rem; flex: 1; }
.status-label {
  font-size: 0.65rem;
  color: var(--text-dim);
  letter-spacing: 0.08em;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}
.status-pips { display: flex; gap: 4px; flex: 1; }
.pip {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 4px rgba(200,130,10,0.28);
  transition: all 0.3s;
}
.pip.used { background: rgba(160,130,80,0.18); box-shadow: none; }
.status-num {
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: var(--amber);
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
}
.status-divider { width: 1px; height: 13px; background: rgba(160,130,80,0.18); flex-shrink: 0; }

.consult-loading-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
  padding: 0.85rem 1rem;
}

.loading-wave { display: flex; align-items: flex-end; gap: 3px; height: 20px; }
.loading-wave span {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--amber), rgba(200,130,10,0.2));
  box-shadow: 0 0 5px rgba(200,130,10,0.22);
  animation: waveBar 1.2s cubic-bezier(0.4,0,0.6,1) infinite;
}
.loading-wave span:nth-child(1) { animation-delay: 0s; }
.loading-wave span:nth-child(2) { animation-delay: 0.1s; }
.loading-wave span:nth-child(3) { animation-delay: 0.2s; }
.loading-wave span:nth-child(4) { animation-delay: 0.3s; }
.loading-wave span:nth-child(5) { animation-delay: 0.4s; }
@keyframes waveBar {
  0%, 100% { height: 4px; opacity: 0.3; }
  50%       { height: 20px; opacity: 1; }
}

.loading-text {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  color: var(--text-dim);
  letter-spacing: 0.25em;
  animation: breathe 2.5s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { opacity: 0.45; letter-spacing: 0.22em; }
  50%       { opacity: 0.85; letter-spacing: 0.28em; }
}

.consult-choices-area {
  flex-shrink: 0;
  padding: 0.55rem 0.9rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.choices-label {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  color: var(--amber);
  padding-bottom: 0.38rem;
  border-bottom: 1px solid var(--border-paper);
  margin-bottom: 0.08rem;
}

.choices-list { display: flex; flex-direction: column; gap: 0.38rem; }

.choice-btn {
  width: 100%;
  padding: 0.68rem 0.95rem;
  border-radius: 10px;
  border: 1px solid rgba(160, 130, 80, 0.18);
  background: #ffffff;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.14rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.choice-btn::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: var(--amber);
  opacity: 0;
  transition: opacity 0.18s;
}
.choice-btn:hover {
  border-color: rgba(200, 130, 10, 0.32);
  background: rgba(248, 240, 220, 0.8);
  transform: translateX(3px);
  box-shadow: var(--shadow-md);
}
.choice-btn:hover::before { opacity: 1; }
.choice-title { display: block; font-size: 0.86rem; color: var(--text-dark); letter-spacing: 0.04em; }
.choice-line  { display: block; font-size: 0.73rem; color: var(--text-muted); line-height: 1.5; }

/* 结算入口区 */
.consult-settlement-area {
  border-top: 1px solid var(--border-paper);
}

.consult-settlement-card {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid var(--border-amber);
  padding: 0.9rem 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.consult-settlement-copy {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.7;
  letter-spacing: 0.03em;
}

.consult-settlement-btn {
  align-self: flex-start;
}

/* 重试按钮区 */
.consult-retry-area {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 0.75rem 1rem;
}

.retry-btn {
  padding: 0.55rem 1.4rem;
  border-radius: 8px;
  border: 1px solid var(--border-amber);
  background: var(--amber-dim);
  color: var(--amber);
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s;
}
.retry-btn:hover {
  background: rgba(200, 130, 10, 0.18);
  transform: translateY(-1px);
}

.consult-fabs {
  position: fixed;
  right: 1rem;
  bottom: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
  z-index: 50;
}

.fab-btn {
  padding: 0.6rem 1.05rem;
  border-radius: 16px;
  background: rgba(240, 230, 210, 0.96);
  border: 1px solid var(--border-warm);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
  transition: all 0.2s;
  position: relative;
}
.fab-btn:hover { border-color: var(--border-amber); color: var(--amber); transform: translateY(-1px); }
.fab-badge {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 15px; height: 15px;
  padding: 0 3px;
  border-radius: 7px;
  background: var(--amber);
  color: #fff8e8;
  font-size: 0.56rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ============================================================
   病历记录抽屉
============================================================ */
/* 右侧病历标签 */
.notes-tab {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 45;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;

  background: rgba(236, 224, 200, 0.98);
  border: 1px solid var(--border-amber);
  border-right: none;
  border-radius: 8px 0 0 8px;
  padding: 0.9rem 0.45rem;
  cursor: pointer;
  box-shadow: -3px 0 12px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}
.notes-tab:hover {
  background: rgba(248, 240, 224, 0.99);
  box-shadow: -4px 0 16px rgba(200, 130, 10, 0.12);
}
.notes-tab.open {
  right: min(296px, 84vw);
}

.notes-tab-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 0.72rem;
  color: var(--amber);
  letter-spacing: 0.18em;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
}

.notes-tab-arrow {
  font-size: 0.7rem;
  color: var(--text-muted);
  transition: transform 0.25s ease;
}
.notes-tab.open .notes-tab-arrow {
  transform: rotate(180deg);
}

.notes-drawer {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.notes-backdrop {
  position: absolute;
  inset: 0;
  /* 背景变模糊效果 */
  background: rgba(20, 15, 10, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  cursor: pointer;
}

.notes-card {
  position: relative;
  z-index: 1;
  width: min(296px, 84vw);
  /* 不铺满全屏，自适应内容高度 */
  max-height: 85vh;
  height: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(236, 224, 200, 0.99);
  border: 1px solid var(--border-amber);
  /* 左边有圆角，右边贴边 */
  border-radius: 14px 0 0 14px;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}

.notes-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.55rem;
  padding: 0.85rem 0.95rem 0.72rem;
  border-bottom: 1px solid var(--border-paper);
  flex-shrink: 0;
}
.notes-head-left { display: flex; flex-direction: column; gap: 0.12rem; flex: 1; min-width: 0; }
.notes-doc-tag {
  font-family: 'Courier New', monospace;
  font-size: 0.56rem;
  letter-spacing: 0.2em;
  color: var(--amber);
  opacity: 0.75;
}
.notes-doc-title { font-size: 0.92rem; color: var(--text-dark); letter-spacing: 0.1em; }
.notes-sub { font-size: 0.66rem; color: var(--text-muted); line-height: 1.55; margin-top: 0.1rem; }

.notes-close-btn {
  flex-shrink: 0;
  width: 26px; height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--border-paper);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
  margin-top: 1px;
}
.notes-close-btn:hover {
  border-color: var(--border-amber);
  color: var(--amber);
  background: var(--amber-dim);
}

.notes-scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.72rem 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.72rem;
  scrollbar-width: none;
}
.notes-scroll-body::-webkit-scrollbar { display: none; }

.notes-label {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: var(--amber);
  margin-bottom: 0.32rem;
}

.notes-textarea {
  width: 100%;
  min-height: 68px;
  max-height: 100px;
  border-radius: 6px;
  border: 1px solid var(--border-paper);
  background: rgba(255, 255, 255, 0.52);
  padding: 0.58rem 0.72rem;
  resize: vertical;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.78rem;
  line-height: 1.75;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.notes-textarea:focus { outline: none; border-color: var(--border-amber); }
.notes-textarea::placeholder { color: #c0a870; }

.mapping-board { display: flex; flex-direction: column; gap: 0.52rem; }
.mapping-group { display: flex; flex-direction: column; gap: 0.28rem; }
.mapping-title {
  font-size: 0.66rem;
  color: #5a4820;
  letter-spacing: 0.1em;
  font-family: 'Courier New', monospace;
}
.mapping-options { display: flex; flex-wrap: wrap; gap: 0.28rem; }

.mapping-option {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  padding: 0.26rem 0.52rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(160, 130, 80, 0.18);
  font-size: 0.74rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.18s;
  user-select: none;
}
.mapping-option:hover {
  border-color: var(--border-amber);
  background: var(--amber-dim);
  color: #5a3810;
}
.mapping-option input[type="checkbox"] {
  width: 11px; height: 11px;
  accent-color: var(--amber);
  margin: 0; flex-shrink: 0;
}
.mapping-option:has(input:checked) {
  border-color: var(--border-amber);
  background: rgba(200, 130, 10, 0.1);
  color: #5a3810;
}
.mapping-option:has(input:disabled) { opacity: 0.4; cursor: not-allowed; }

.notes-summary {
  padding: 0.58rem 0.72rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid var(--border-paper);
  display: flex;
  flex-direction: column;
  gap: 0.32rem;
}
.summary-title {
  font-family: 'Courier New', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  color: var(--amber);
}
.summary-detail-list { display: flex; flex-direction: column; gap: 0.25rem; }
.summary-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.74rem;
  color: var(--text-main);
}
.summary-detail-item strong {
  color: var(--cyan);
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
}
.summary-copy { font-size: 0.74rem; color: var(--text-muted); line-height: 1.65; }
.summary-meta {
  font-family: 'Courier New', monospace;
  font-size: 0.58rem;
  color: var(--text-dim);
  letter-spacing: 0.1em;
}

.notes-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  padding: 0.65rem 0.95rem 0.85rem;
  border-top: 1px solid var(--border-paper);
  background: rgba(236, 224, 200, 0.99);
}
.notes-actions .btn-secondary,
.notes-actions .btn-primary {
  width: 100%;
  text-align: center;
  padding: 0.62rem 1rem;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  border-radius: 8px;
}

/* ============================================================
   通用顶栏
============================================================ */

.phase-topbar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.78rem 1.1rem;
  flex-shrink: 0;
  background: rgba(240, 230, 210, 0.96);
  border-bottom: 1px solid var(--border-paper);
  box-shadow: 0 1px 0 rgba(200, 130, 10, 0.06);
}
.phase-topbar-center { flex: 1; }
.phase-title { font-size: 0.88rem; letter-spacing: 0.14em; color: var(--amber); }
.phase-sub { margin-top: 0.12rem; font-size: 0.68rem; color: var(--text-muted); }
.phase-topbar-actions { display: flex; gap: 0.5rem; align-items: center; }

/* ============================================================
   治疗页
============================================================ */

.screen-treatment { background: var(--bg-paper); overflow: hidden; }

.treatment-scroll-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0.9rem 1.1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.treatment-scroll-area::-webkit-scrollbar { display: none; }

.treatment-summary-card {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid var(--border-warm);
  padding: 0.95rem 1.05rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.treatment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }

.treatment-card {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid var(--border-paper);
  padding: 0.88rem 0.95rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: border-color 0.2s;
}
.treatment-card:hover { border-color: var(--border-warm); }
.treatment-card-title {
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  font-family: 'Courier New', monospace;
  color: var(--amber);
}

.treatment-submit-card {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid var(--border-amber);
  padding: 0.95rem 1.05rem;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.treatment-actions { display: flex; gap: 0.6rem; }

/* ============================================================
   结算页
============================================================ */

.screen-settlement { background: var(--bg-paper); overflow: hidden; }

.feedback-scroll-area {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0.9rem 1.1rem 2rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.feedback-scroll-area::-webkit-scrollbar { display: none; }

.feedback-card {
  width: min(680px, 100%);
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid var(--border-warm);
  padding: 1.2rem;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.settlement-page-card { max-width: 680px; }

.feedback-chip {
  display: inline-block;
  padding: 0.26rem 0.72rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  align-self: flex-start;
}
.feedback-chip.revisit { border: 1px solid var(--border-amber); background: var(--amber-dim); color: var(--amber); }
.feedback-chip.complete { border: 1px solid var(--border-cyan); background: var(--cyan-dim); color: var(--cyan); }

.feedback-body { display: flex; flex-direction: column; gap: 0.8rem; }
.feedback-body p { margin: 0; line-height: 1.95; color: var(--text-main); font-size: 0.9rem; }

.feedback-schedule {
  padding: 0.65rem 0.85rem;
  border-radius: 6px;
  background: var(--amber-dim);
  border: 1px solid var(--border-amber);
  font-size: 0.8rem;
  color: var(--text-main);
  line-height: 1.75;
}
.feedback-actions { display: flex; gap: 0.6rem; margin-top: 0.2rem; }

.settlement-summary { display: flex; flex-direction: column; gap: 0.65rem; }
.settlement-stat {
  padding: 0.8rem 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--border-paper);
  background: rgba(255,255,255,0.42);
}
.settlement-stat-label {
  font-size: 0.62rem;
  color: var(--text-dim);
  letter-spacing: 0.14em;
  font-family: 'Courier New', monospace;
}
.settlement-stat-value {
  margin-top: 0.28rem;
  font-size: 0.88rem;
  color: var(--text-main);
  line-height: 1.75;
}

/* ============================================================
   弹窗
============================================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(18, 13, 8, 0.72);
  backdrop-filter: blur(5px);
  z-index: 60;
  padding: 1rem;
}

.modal-card {
  width: min(400px, calc(100vw - 2rem));
  border-radius: 12px;
  padding: 1.4rem;
  background: rgba(240, 230, 210, 0.99);
  border: 1px solid var(--border-amber);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.profile-modal { width: min(520px, calc(100vw - 2rem)); }
.phone-modal   { width: min(460px, calc(100vw - 2rem)); }

.modal-kicker {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  color: var(--text-dim);
}
.modal-title { font-size: 1.3rem; color: var(--text-dark); letter-spacing: 0.1em; }
.modal-text  { margin: 0; font-size: 0.84rem; color: var(--text-muted); line-height: 1.88; }
.modal-empty { font-size: 0.8rem; color: var(--text-dim); line-height: 1.75; }
.modal-actions { display: flex; gap: 0.65rem; flex-wrap: wrap; margin-top: 0.2rem; }

.phone-message-list {
  display: flex;
  flex-direction: column;
  gap: 0.62rem;
  max-height: min(50vh, 450px);
  overflow-y: auto;
  scrollbar-width: none;
}
.phone-message-list::-webkit-scrollbar { display: none; }

.phone-message-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.78rem 0.88rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--border-paper);
  transition: border-color 0.18s;
}
.phone-message-item.unread { border-color: var(--border-amber); background: var(--amber-dim); }
.phone-message-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
}
.phone-message-head strong { color: var(--amber); }
.phone-message-head span  { color: var(--text-dim); }
.phone-message-body { font-size: 0.8rem; color: var(--text-muted); line-height: 1.75; }

.profile-modal-head {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  margin-top: 0.3rem;
}
.profile-avatar-wrap {
  width: 60px; height: 60px;
  border-radius: 50%;
  border: 1.5px solid var(--border-amber);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--amber-dim);
  color: var(--amber);
  font-size: 1.3rem;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
}
.profile-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.profile-modal-meta { display: flex; flex-direction: column; gap: 0.55rem; flex: 1; }
.profile-input {
  width: 100%;
  border-radius: 6px;
  border: 1px solid var(--border-paper);
  background: rgba(255,255,255,0.55);
  color: var(--text-main);
  padding: 0.58rem 0.75rem;
  font-family: inherit;
  font-size: 0.88rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.profile-input:focus { outline: none; border-color: var(--border-amber); }

.modal-stats-row { display: flex; gap: 0.55rem; }
.modal-stat {
  flex: 1;
  background: rgba(255,255,255,0.4);
  border: 1px solid var(--border-paper);
  border-radius: 8px;
  padding: 0.65rem 0.7rem;
  text-align: center;
}
.modal-stat-label {
  font-size: 0.6rem;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  font-family: 'Courier New', monospace;
}
.modal-stat-val {
  font-size: 1.2rem;
  color: var(--amber);
  font-family: 'Courier New', monospace;
  font-weight: bold;
  margin-top: 0.2rem;
}

/* ============================================================
   移动端适配
============================================================ */

* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }

@media (max-width: 480px) {
  .title-center { margin-top: -3.5rem; width: calc(100vw - 2.5rem); }
  .title-main { font-size: clamp(2.2rem, 11vw, 3.2rem); }

  .intro-reading-column { padding: 1.5rem 1.3rem 3rem; }
  .intro-lead { font-size: 1.25rem; }
  .intro-paragraph { font-size: 0.9rem; line-height: 2; }

  .hub-scroll-area { padding: 0.8rem 0.85rem 5.5rem; gap: 0.6rem; }

  .pr-scroll-area { padding: 0.85rem 0.85rem 3rem; }
  .pr-card-name { font-size: 1rem; }

  .consult-frame { margin: 0.6rem 0.7rem 0; }
  .frame-content { padding: 0.8rem 0.88rem; }
  .patient-info-bar { padding: 0.5rem 0.88rem 0.45rem; }
  .consult-choices-area { padding: 0.5rem 0.7rem 0.55rem; }
  .choice-btn { padding: 0.62rem 0.88rem; }

  .treatment-grid { grid-template-columns: 1fr; }
  .treatment-scroll-area { padding: 0.8rem 0.85rem 2rem; }

  .modal-card { padding: 1.2rem; }
  .modal-stats-row { flex-direction: column; }
}
</style>
