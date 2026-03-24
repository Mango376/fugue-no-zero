<template>
  <div class="synesthesia-shell">
    <section v-if="phase === 'title'" class="screen screen-title">
      <div class="title-veil"></div>
      <div class="title-grid"></div>
      <div class="title-scanlines"></div>
      <div class="title-orbs" aria-hidden="true">
        <div class="title-orb orb-1"></div>
        <div class="title-orb orb-2"></div>
        <div class="title-orb orb-3"></div>
        <div class="title-orb orb-4"></div>
      </div>

      <div class="title-stage">
        <div class="title-panel">
          <div class="title-panel-line"></div>
          <div class="title-eyebrow">{{ titleContent.eyebrow }}</div>
          <h1 class="title-main">{{ titleContent.title }}</h1>
          <div class="title-sub">{{ titleContent.subtitle }}</div>
          <p class="title-tagline">{{ titleContent.tagline }}</p>
          <div class="title-divider"></div>
          <div class="title-copy">
            <p>{{ titleContent.summary }}</p>
            <p>{{ titleContent.detail }}</p>
          </div>

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

        <aside class="title-sidebar">
          <div class="title-sidebar-kicker">诊所入口 / 校准前夜</div>
          <div class="title-sidebar-block">
            <div class="title-sidebar-label">接诊原则</div>
            <p>先听见异常如何进入生活，再判断感官错位究竟发生在何处。</p>
          </div>
          <div class="title-sidebar-block">
            <div class="title-sidebar-label">诊疗环境</div>
            <p>下城区边缘诊所，设备旧、空间窄、噪声重，但依旧有人在这里等一个被认真听见的机会。</p>
          </div>
          <div class="title-sidebar-block title-sidebar-senses">
            <div class="title-sidebar-label">五感回路</div>
            <div class="title-sense-row">
              <span>视觉</span>
              <span>听觉</span>
              <span>触觉</span>
              <span>味觉</span>
              <span>嗅觉</span>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <section v-else-if="phase === 'background_intro'" class="screen screen-intro">
      <header class="phase-topbar intro-topbar">
        <button class="text-link" @click="goToPrevBackgroundPage">返回</button>
        <div class="phase-topbar-actions">
          <div class="progress-label">背景介绍 {{ backgroundPage + 1 }} / {{ backgroundTotal }}</div>
          <button class="btn-secondary compact" @click="goHome">主界面</button>
        </div>
      </header>

      <div class="intro-stage">
        <aside class="intro-sidebar">
          <div class="intro-sidebar-header">
            <div class="intro-sidebar-kicker">世界档案</div>
            <div class="intro-sidebar-title">联觉失序记录</div>
          </div>

          <div class="intro-page-list">
            <button
              v-for="page in backgroundPages"
              :key="page.id"
              type="button"
              class="intro-page-tab"
              :class="{ active: page.id === currentBackgroundPage.id }"
            >
              <span>{{ page.kicker }}</span>
              <strong>{{ page.title }}</strong>
            </button>
          </div>

          <div class="intro-sidebar-note">
            门铃响起之前，你会先看见这个世界是如何一步步失去正常感官秩序的。
          </div>
        </aside>

        <div class="intro-card">
          <div class="intro-card-topline"></div>
          <div class="intro-kicker">{{ currentBackgroundPage.kicker }}</div>
          <h2 class="intro-title">{{ currentBackgroundPage.title }}</h2>
          <div class="intro-metadata">
            <span>下城区病例输入</span>
            <span>神经映射异常</span>
            <span>人工校准流程</span>
          </div>
          <div class="intro-divider"></div>

          <div class="intro-body">
            <p v-for="(paragraph, index) in currentBackgroundPage.paragraphs" :key="index">
              {{ paragraph }}
            </p>
          </div>

          <div class="intro-footer">
            <div class="intro-progress-track">
              <div class="intro-progress-fill" :style="{ width: `${((backgroundPage + 1) / backgroundTotal) * 100}%` }"></div>
            </div>

            <div class="intro-actions">
              <button class="btn-secondary" @click="goToPrevBackgroundPage">
                {{ backgroundPage === 0 ? '回到标题' : '上一页' }}
              </button>
              <button class="btn-primary" @click="goToNextBackgroundPage">
                {{ backgroundPage + 1 === backgroundTotal ? '进入诊所' : '下一页' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="phase === 'hub'" class="screen screen-hub">
      <header class="hub-topbar hub-topbar-reframed">
        <div class="hub-topbar-row">
          <button class="btn-secondary compact topbar-action-btn" @click="returnToTitle">返回</button>
          <div class="hub-topbar-text">信用点 {{ credits }}</div>
          <div class="hub-topbar-text">第 {{ gameDay }} 天</div>
        </div>
        <div class="hub-timeflow-row">
          <div class="hub-timeflow-label">时间条</div>
          <div class="timeflow-strip topbar-timeflow">
            <div class="timeflow-fill" :style="{ width: `${timeProgressPercent}%` }"></div>
          </div>
        </div>
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
          <div class="environment-title">当前环境 —— {{ currentEnvironment.name }}</div>
          <div class="environment-copy">{{ currentEnvironment.description }}</div>
        </section>
        <section class="hub-folders">
          <article class="hub-folder-card primary-item">
            <div class="folder-inline">
              <div>
                <div class="folder-title">{{ hubActions.primaryLabel }}</div>
                <div class="folder-copy">当前候诊 {{ waitingPatientCount }} / 3，患者会随时间到达。</div>
              </div>
              <button
                class="btn-primary compact hub-inline-btn"
                :disabled="!activePatient && waitingPatientCount === 0"
                @click="startPatientFlow"
              >
                {{ activePatient ? '继续接诊' : (waitingPatientCount > 0 ? '开始接待' : '暂无到诊') }}
              </button>
            </div>
          </article>
          <article class="hub-folder-card collapsible">
            <div class="folder-title">待复诊患者</div>
            <div class="folder-copy">到期复诊 {{ dueRevisitCount }} · 排队中 {{ pendingRevisitCount }}</div>
          </article>
          <article class="hub-folder-card collapsible">
            <div class="folder-inline">
              <div>
                <div class="folder-title">设备总览</div>
                <div class="folder-copy">查看五感设备等级与模块</div>
              </div>
              <button class="mini-toggle" type="button" @click.stop="toggleEquipmentSection">
                {{ equipmentExpanded ? '收起' : '展开' }}
              </button>
            </div>
          </article>
        </section>
        <div v-if="equipmentExpanded" class="hub-expand-panel">
          <div v-for="item in equipmentModuleRows" :key="item.id" class="equipment-module-card">
            <div class="equipment-name">{{ item.name }}</div>
            <div class="equipment-module-list">
              <div v-for="module in item.modules" :key="module.id" class="equipment-module-row">
                <span>{{ module.label }}</span>
                <strong>Lv.{{ module.level }}</strong>
                <button
                  class="btn-secondary compact equipment-upgrade-btn"
                  type="button"
                  :disabled="module.level >= 4"
                  @click="upgradeEquipmentModule(item.id, module.targetId)"
                >
                  {{ module.level >= 4 ? '满级' : `升级 ${module.upgradeCost}` }}
                </button>
              </div>
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
              <div class="menu-sub">查看五感治疗仪与可升级模块。</div>
            </div>
            <button class="mini-toggle" type="button" @click.stop="toggleEquipmentSection">
              {{ equipmentExpanded ? '收起' : '展开' }}
            </button>
          </article>

          <div v-if="equipmentExpanded" class="hub-expand-panel">
            <div v-for="item in equipmentModuleRows" :key="item.id" class="equipment-module-card">
              <div class="equipment-name">{{ item.name }}</div>
              <div class="equipment-desc">可分别升级另外四种感官的治疗等级，默认 Lv.1，最高 Lv.4。</div>
              <div class="equipment-module-list">
                <div v-for="module in item.modules" :key="module.id" class="equipment-module-row">
                  <span>{{ module.label }}</span>
                  <strong>Lv.{{ module.level }}</strong>
                  <button
                    class="btn-secondary compact equipment-upgrade-btn"
                    type="button"
                    :disabled="module.level >= 4"
                    @click="upgradeEquipmentModule(item.id, module.targetId)"
                  >
                    {{ module.level >= 4 ? '满级' : `升级 ${module.upgradeCost}` }}
                  </button>
                </div>
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
                  <template v-if="typingEntryId === entry.id">
                    <Typewriter :text="entry.text" :speed="22" @done="handleTypingDone" />
                  </template>
                  <template v-else>
                    <p v-for="(paragraph, idx) in splitParagraphs(entry.text)" :key="idx">
                      {{ paragraph }}
                    </p>
                  </template>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="question-panel">
          <div v-if="consultEntryStage === 'pre_consult'" class="question-prestart">
            <div class="question-bar-title">准备开始</div>
            <div class="question-loading-copy">患者已经到诊，点击下方按钮进入诊断室。</div>
            <button class="btn-primary compact consult-start-btn" @click="continueConsultFlow">
              开始诊断
            </button>
          </div>

          <div v-else-if="consultEntryStage === 'entering_consult' || isGeneratingText" class="question-loading">
            <div class="consult-loading-animation" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="question-bar-title">{{ consultationHistory.length ? '正在整理新的问诊回应' : '正在进入诊断室' }}</div>
            <div class="question-loading-copy">
              {{ consultationHistory.length ? '病人的这一轮回应正在生成，请稍候。' : '诊断室门锁已经落下，记录正在同步。' }}
            </div>
          </div>

          <div v-else-if="canShowConsultChoices && !isTypingNarrative" class="question-bar separated">
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

          <div v-else class="question-hidden-state"></div>
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

    <button
      v-if="['hub', 'consult', 'treatment', 'patient_feedback'].includes(phase)"
      class="phone-fab"
      :class="{ consult: phase === 'consult' }"
      @click="togglePhonePanel"
    >
      手机
      <span v-if="unreadPhoneCount" class="phone-badge">{{ unreadPhoneCount }}</span>
    </button>

    <Transition name="modal-fade">
      <div v-if="showPhonePanel" class="modal-overlay" @click.self="togglePhonePanel">
        <div class="modal-card phone-modal">
          <div class="modal-kicker">诊所手机</div>
          <div class="modal-title">短信息</div>
          <p class="modal-text">待回款 {{ pendingDebtCount }} 笔</p>

          <div v-if="phoneMessages.length" class="phone-message-list">
            <article
              v-for="message in phoneMessages"
              :key="message.id"
              class="phone-message-item"
              :class="{ unread: !message.read }"
            >
              <div class="phone-message-head">
                <strong>{{ message.sender }}</strong>
                <span>第 {{ message.gameDay }} 天</span>
              </div>
              <div class="archive-block-title">{{ message.title }}</div>
              <div class="archive-copy">{{ message.text }}</div>
            </article>
          </div>

          <div v-else class="archive-block">
            <div class="archive-copy">暂时没有新的短信息。</div>
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" @click="togglePhonePanel">关闭</button>
          </div>
        </div>
      </div>
    </Transition>

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
      <div v-if="showUpgradeFailureModal" class="modal-overlay" @click.self="closeUpgradeFailureModal">
        <div class="modal-card">
          <div class="modal-kicker">升级失败</div>
          <div class="modal-title">当前无法完成升级。</div>
          <p class="modal-text">{{ upgradeFailureMessage }}</p>
          <div class="modal-actions">
            <button class="btn-primary" @click="closeUpgradeFailureModal">知道了</button>
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
import Typewriter from '@/components/common/Typewriter.vue'
import { useGameLogic } from './composables/useGameLogic'

const {
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
  gameDay,
  playerProfile,
  activePatient,
  consultationHistory,
  consultNotes,
  isConsultNarrativeReady,
  isConsultOptionsReady,
  diagnosisDraft,
  treatmentDraft,
  currentBackgroundPage,
  currentEnvironment,
  activeEnvironment,
  pendingRevisitCount,
  dueRevisitCount,
  waitingPatientCount,
  phoneMessages,
  hubStats,
  equipmentSummary,
  equipmentModuleRows,
  timeProgressPercent,
  currentConsultOptions,
  canShowConsultChoices,
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
  backgroundPages,
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
} = useGameLogic()

const showFullHistory = ref(false)
const showPhonePanel = ref(false)
const typingEntryId = ref('')
const isTypingNarrative = ref(false)

function cleanDisplayText(text = '') {
  return String(text || '')
    .replace(/^\s*---[A-Z_]+---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isPromptLeakText(text = '') {
  const cleaned = cleanDisplayText(text)

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

const safeConsultationHistory = computed(() => {
  return consultationHistory.value
    .map(entry => ({
      ...entry,
      text: cleanDisplayText(entry?.text)
    }))
    .filter(entry => entry.text && !isPromptLeakText(entry.text))
})

const visibleConsultationHistory = computed(() => {
  if (consultEntryStage.value === 'pre_consult') {
    return []
  }

  if (showFullHistory.value) {
    return safeConsultationHistory.value
  }

  if (consultStage.value === 'arrival_intro') {
    return safeConsultationHistory.value.slice(-1)
  }

  return safeConsultationHistory.value.slice(-2)
})

const collapsedHistoryCount = computed(() => {
  return Math.max(0, safeConsultationHistory.value.length - visibleConsultationHistory.value.length)
})

watch(
  () => safeConsultationHistory.value.length,
  () => {
    showFullHistory.value = false
    const latestEntry = safeConsultationHistory.value.at(-1)
    if (latestEntry && latestEntry.speaker !== 'doctor') {
      typingEntryId.value = latestEntry.id
      isTypingNarrative.value = true
      return
    }

    typingEntryId.value = ''
    isTypingNarrative.value = false
  }
)

watch(
  () => phase.value,
  () => {
    showPhonePanel.value = false
  }
)

function handleTypingDone() {
  typingEntryId.value = ''
  isTypingNarrative.value = false
}

function togglePhonePanel() {
  showPhonePanel.value = !showPhonePanel.value

  if (showPhonePanel.value) {
    markPhoneMessagesRead()
  }
}

function splitParagraphs(text = '') {
  return cleanDisplayText(text)
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
    radial-gradient(circle at top, rgba(35, 78, 96, 0.26), transparent 30%),
    radial-gradient(circle at 85% 18%, rgba(164, 85, 55, 0.12), transparent 22%),
    linear-gradient(180deg, #080c14 0%, #04070d 100%);
  color: #ddd3c2;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.screen {
  position: absolute;
  inset: 0;
}

.title-veil,
.title-grid,
.title-scanlines,
.title-orbs {
  position: absolute;
  inset: 0;
}

.title-veil {
  background:
    radial-gradient(circle at 22% 18%, rgba(82, 133, 148, 0.22), transparent 28%),
    radial-gradient(circle at 72% 72%, rgba(179, 103, 69, 0.14), transparent 24%);
}

.title-grid {
  background-image:
    linear-gradient(rgba(219, 194, 139, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(219, 194, 139, 0.035) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.92), transparent);
}

.title-scanlines {
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(74, 142, 139, 0.025) 45%,
    rgba(74, 142, 139, 0.09) 50%,
    rgba(74, 142, 139, 0.025) 55%,
    transparent 100%
  );
  transform: translateY(-30%);
  animation: synesthesiaScan 8s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
}

.title-orbs {
  pointer-events: none;
  overflow: hidden;
}

.title-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.28;
}

.title-orb.orb-1 {
  width: 300px;
  height: 300px;
  top: -8%;
  left: -10%;
  background: radial-gradient(circle, rgba(184, 153, 71, 0.22), transparent 70%);
  animation: synesthesiaOrbDrift1 18s ease-in-out infinite alternate;
}

.title-orb.orb-2 {
  width: 260px;
  height: 260px;
  right: -8%;
  bottom: -5%;
  background: radial-gradient(circle, rgba(74, 142, 139, 0.18), transparent 70%);
  animation: synesthesiaOrbDrift2 22s ease-in-out infinite alternate;
}

.title-orb.orb-3 {
  width: 190px;
  height: 190px;
  right: 8%;
  top: 25%;
  background: radial-gradient(circle, rgba(184, 153, 71, 0.12), transparent 70%);
  animation: synesthesiaOrbDrift3 16s ease-in-out infinite alternate;
}

.title-orb.orb-4 {
  width: 160px;
  height: 160px;
  left: 12%;
  bottom: 12%;
  background: radial-gradient(circle, rgba(74, 142, 139, 0.14), transparent 70%);
  animation: synesthesiaOrbDrift4 20s ease-in-out infinite alternate;
}

@keyframes synesthesiaScan {
  0% {
    transform: translateY(-28%);
  }

  100% {
    transform: translateY(28%);
  }
}

@keyframes synesthesiaOrbDrift1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(16px, 20px) scale(1.05); }
}

@keyframes synesthesiaOrbDrift2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-14px, -16px) scale(1.08); }
}

@keyframes synesthesiaOrbDrift3 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-8px, 12px) scale(0.94); }
}

@keyframes synesthesiaOrbDrift4 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(10px, -14px) scale(1.1); }
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
  align-items: stretch;
  position: relative;
  overflow: hidden;
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
  border: 1px solid rgba(219, 194, 139, 0.14);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 20px 52px rgba(0, 0, 0, 0.28);
}

.title-stage {
  position: relative;
  z-index: 2;
  width: min(1220px, calc(100vw - 3rem));
  margin: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.75fr);
  gap: 1.4rem;
  align-items: end;
}

.title-panel {
  min-height: min(780px, calc(100vh - 4rem));
  padding: clamp(2rem, 4vw, 3.2rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1rem;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(4, 10, 14, 0.48), rgba(4, 10, 14, 0.88)),
    radial-gradient(circle at top left, rgba(91, 159, 176, 0.16), transparent 36%),
    radial-gradient(circle at 82% 78%, rgba(173, 98, 62, 0.16), transparent 28%);
  border: 1px solid rgba(226, 206, 149, 0.15);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.03),
    0 28px 80px rgba(0, 0, 0, 0.38);
}

.title-panel-line {
  width: min(180px, 32vw);
  height: 2px;
  margin-bottom: 0.35rem;
  background: linear-gradient(90deg, rgba(99, 162, 180, 0.9), rgba(232, 208, 151, 0.08));
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
  max-width: 7ch;
  font-size: clamp(3.6rem, 8vw, 7rem);
  line-height: 0.94;
  letter-spacing: 0.12em;
  text-shadow: 0 4px 18px rgba(184, 153, 71, 0.18);
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

.title-tagline {
  max-width: 28rem;
  margin: 0.1rem 0 0;
  font-size: clamp(1rem, 2vw, 1.22rem);
  line-height: 1.8;
  color: #d7ccba;
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
  align-self: flex-start;
  margin-top: 0.55rem;
  color: rgba(215, 199, 157, 0.72);
}

.title-archive-hint {
  color: #8c897b;
  font-size: 0.78rem;
  line-height: 1.6;
}

.title-divider {
  width: min(220px, 42vw);
  height: 1px;
  margin: 0.2rem 0 0.35rem;
  background: linear-gradient(90deg, rgba(219, 194, 139, 0.42), rgba(219, 194, 139, 0.04));
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
  border-radius: 8px;
  padding: 0.78rem 1.3rem;
  font-size: 0.84rem;
  letter-spacing: 0.16em;
}

.title-btn.primary,
.btn-primary {
  border: 1px solid rgba(237, 211, 151, 0.34);
  background: linear-gradient(180deg, rgba(151, 101, 63, 0.96), rgba(92, 57, 35, 0.96));
  color: #f6e9cf;
  box-shadow: 0 8px 20px rgba(110, 67, 40, 0.26);
}

.title-btn.secondary,
.btn-secondary {
  border: 1px solid rgba(219, 194, 139, 0.18);
  background: rgba(255, 255, 255, 0.015);
  color: #b9ac8e;
}

.title-btn-large {
  min-height: 64px;
}

.title-sidebar {
  min-height: min(620px, calc(100vh - 9rem));
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1rem;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(6, 11, 16, 0.46), rgba(6, 11, 16, 0.86)),
    linear-gradient(135deg, rgba(110, 164, 176, 0.08), transparent 48%);
  border: 1px solid rgba(226, 206, 149, 0.1);
  backdrop-filter: blur(10px);
}

.title-sidebar-kicker,
.intro-sidebar-kicker {
  font-family: 'Courier New', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: #98a8a7;
}

.title-sidebar-block {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-top: 0.95rem;
  border-top: 1px solid rgba(219, 194, 139, 0.08);
}

.title-sidebar-label {
  color: #ead9af;
  letter-spacing: 0.08em;
}

.title-sidebar-block p,
.intro-sidebar-note {
  margin: 0;
  line-height: 1.8;
  color: #b9b1a1;
}

.title-sense-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.title-sense-row span,
.intro-metadata span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(219, 194, 139, 0.14);
  background: rgba(255, 255, 255, 0.03);
  color: #d9cba8;
  font-size: 0.78rem;
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
  background: rgba(5, 10, 15, 0.92);
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

.screen-intro {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(112, 162, 172, 0.1), transparent 28%),
    linear-gradient(180deg, rgba(5, 10, 14, 0.98), rgba(7, 12, 17, 0.96));
}

.intro-topbar {
  position: relative;
  z-index: 2;
}

.intro-stage {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 1.2rem;
  padding: 1.2rem 1.4rem 1.4rem;
  min-height: 0;
}

.intro-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.2rem;
  border-radius: 22px;
  background: rgba(7, 12, 17, 0.72);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.intro-sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.intro-sidebar-title {
  font-size: 1.3rem;
  color: #eedfb6;
}

.intro-page-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.intro-page-tab {
  width: 100%;
  border: 1px solid rgba(219, 194, 139, 0.08);
  border-radius: 16px;
  padding: 0.9rem 0.95rem;
  background: rgba(255, 255, 255, 0.02);
  color: #9fa6a1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  pointer-events: none;
}

.intro-page-tab span {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
}

.intro-page-tab strong {
  color: #cbc2b2;
  font-weight: normal;
  line-height: 1.65;
}

.intro-page-tab.active {
  border-color: rgba(219, 194, 139, 0.2);
  background:
    linear-gradient(90deg, rgba(117, 166, 182, 0.12), transparent),
    rgba(255, 255, 255, 0.025);
}

.intro-card {
  width: 100%;
  margin: 0;
  border-radius: 24px;
  padding: clamp(1.5rem, 3vw, 2.3rem);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background:
    linear-gradient(180deg, rgba(8, 15, 21, 0.9), rgba(8, 15, 21, 0.98)),
    radial-gradient(circle at 86% 18%, rgba(118, 168, 176, 0.08), transparent 20%);
}

.intro-card-topline {
  width: min(170px, 28vw);
  height: 2px;
  margin-bottom: 0.75rem;
  background: linear-gradient(90deg, rgba(106, 167, 183, 0.92), rgba(233, 209, 152, 0.08));
}

.intro-title {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.22;
  max-width: 12ch;
}

.intro-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.3rem;
}

.intro-divider {
  width: 100%;
  height: 1px;
  margin: 1rem 0 1.2rem;
  background: linear-gradient(90deg, rgba(219, 194, 139, 0.26), rgba(219, 194, 139, 0.04));
}

.intro-footer {
  margin-top: auto;
  padding-top: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.intro-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.intro-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(99, 162, 180, 0.9), rgba(224, 198, 138, 0.86));
}

.hub-main {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.hub-topbar-reframed {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: stretch;
}

.hub-topbar-row {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 0.8rem;
  align-items: center;
}

.topbar-action-btn {
  justify-self: start;
}

.hub-credit-pill,
.hub-time-pill,
.hub-topbar-text {
  text-align: center;
  color: #e7d7ab;
  justify-self: stretch;
}

.hub-topbar-text {
  font-size: 1.1rem;
  letter-spacing: 0.1em;
}

.hub-timeflow-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.15rem 0;
}

.hub-timeflow-label {
  flex-shrink: 0;
  min-width: 4.2rem;
  color: #d8c89d;
  font-size: 0.9rem;
  letter-spacing: 0.14em;
}

.topbar-timeflow {
  flex: 1;
  height: 16px;
  border: 1px solid rgba(219, 194, 139, 0.12);
  background: rgba(255, 255, 255, 0.035);
  position: relative;
  overflow: hidden;
}

.topbar-timeflow::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 20%,
      rgba(255, 255, 255, 0.09) 50%,
      rgba(255, 255, 255, 0.03) 80%,
      transparent 100%
    );
  transform: translateX(-100%);
  animation: timeflowSweep 3.8s ease-in-out infinite;
  pointer-events: none;
}

.hub-main-reframed {
  gap: 0.9rem;
  position: relative;
}

.hub-main-reframed::after {
  content: '诊断室已就绪 · 随时可以开始下一次接待';
  display: block;
  padding: 0.8rem 0 0.4rem;
  text-align: center;
  font-size: 0.68rem;
  color: #8f8a7b;
  letter-spacing: 0.2em;
}

.timeflow-head,
.folder-inline,
.equipment-module-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.timeflow-strip {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.timeflow-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7ec4cf, #d3b06d);
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 12px rgba(126, 196, 207, 0.22),
    0 0 18px rgba(211, 176, 109, 0.14);
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  animation: timeflowPulse 2.8s ease-in-out infinite;
}

.timeflow-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: -18px;
  width: 56px;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 45%,
    rgba(255, 255, 255, 0.5) 60%,
    transparent 100%
  );
  transform: skewX(-20deg);
  animation: timeflowShimmer 2.4s linear infinite;
}

@keyframes timeflowPulse {
  0%,
  100% {
    filter: saturate(0.95) brightness(0.96);
  }

  50% {
    filter: saturate(1.08) brightness(1.08);
  }
}

@keyframes timeflowShimmer {
  0% {
    transform: translateX(-12px) skewX(-20deg);
    opacity: 0.2;
  }

  50% {
    opacity: 0.8;
  }

  100% {
    transform: translateX(160px) skewX(-20deg);
    opacity: 0.12;
  }
}

@keyframes timeflowSweep {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.hub-identity-card,
.hub-environment-card,
.hub-folder-card,
.hub-secondary-actions {
  border-radius: 10px;
  padding: 1rem 1.1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.hub-folders {
  display: none;
}

.hub-folder-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hub-action-btn {
  align-self: flex-start;
  margin-top: 0.55rem;
}

.hub-inline-btn,
.equipment-upgrade-btn {
  white-space: nowrap;
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

.hub-profile,
.hub-stats-bar,
.hub-expand-panel,
.case-card,
.dialogue-card,
.notes-card,
.treatment-summary-card,
.treatment-submit-card,
.feedback-card {
  border-radius: 10px;
  padding: 1.15rem 1.2rem;
}

.hub-profile {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(10, 18, 24, 0.78);
  border-color: rgba(219, 194, 139, 0.16);
  transition: all 0.28s ease;
}

.hub-profile:hover {
  transform: translateX(4px);
  border-color: rgba(219, 194, 139, 0.3);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 16px 36px rgba(0, 0, 0, 0.3);
}

.hub-identity-card,
.hub-environment-card {
  background: rgba(10, 18, 24, 0.78);
  border-color: rgba(219, 194, 139, 0.14);
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
  align-items: flex-end;
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
  display: flex;
  gap: 0.8rem;
  align-items: stretch;
  background: rgba(9, 15, 21, 0.78);
}

.hub-stat-item,
.hub-menu-item {
  border-radius: 8px;
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
  position: relative;
  overflow: hidden;
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hub-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: rgba(219, 194, 139, 0.86);
  opacity: 0;
  transition: opacity 0.28s ease;
}

.hub-menu-item:hover {
  transform: translateX(5px);
  border-color: rgba(219, 194, 139, 0.22);
  background: rgba(255, 255, 255, 0.035);
}

.hub-menu-item:hover::before {
  opacity: 1;
}

.hub-menu-item.primary-item {
  cursor: pointer;
  border-color: rgba(219, 194, 139, 0.22);
  background: rgba(219, 194, 139, 0.05);
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.menu-icon {
  width: 18px;
  color: #d5c392;
  font-size: 0.76rem;
  text-align: center;
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
  border-radius: 8px;
  background: rgba(8, 14, 20, 0.72);
}

.hub-folders + .hub-expand-panel {
  display: none;
}

.equipment-module-card {
  padding: 0.9rem 0.95rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.equipment-module-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.75rem;
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
  border-radius: 8px;
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
  grid-template-rows: minmax(0, 1fr) auto;
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
  background: rgba(9, 15, 21, 0.9);
  border-color: rgba(219, 194, 139, 0.14);
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
  border-radius: 8px;
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

.question-bar.separated,
.question-prestart,
.question-loading,
.question-panel {
  min-height: 0;
}

.question-bar.separated,
.question-prestart,
.question-loading {
  height: 100%;
  border-radius: 10px;
  padding: 1rem 1.1rem;
  background: rgba(8, 13, 19, 0.96);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.question-bar.separated {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.question-panel {
  overflow: hidden;
}

.question-prestart,
.question-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.9rem;
}

.question-bar-title {
  margin-bottom: 0.8rem;
  padding-bottom: 0.55rem;
  font-size: 0.86rem;
  letter-spacing: 0.12em;
  color: #cbb37d;
  background: none;
}

.question-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.72rem;
  padding: 0.05rem 0.08rem 0.25rem 0;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.question-loading-copy {
  color: #a89c86;
  line-height: 1.7;
}

.consult-start-btn {
  min-width: 148px;
}

.question-hidden-state {
  height: 100%;
}

.consult-loading-animation {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.35rem;
  min-height: 28px;
}

.consult-loading-animation span {
  width: 6px;
  border-radius: 999px;
  background: rgba(219, 194, 139, 0.85);
  animation: consultPulse 1.1s ease-in-out infinite;
}

.consult-loading-animation span:nth-child(1) {
  height: 14px;
}

.consult-loading-animation span:nth-child(2) {
  height: 20px;
  animation-delay: 0.16s;
}

.consult-loading-animation span:nth-child(3) {
  height: 26px;
  animation-delay: 0.32s;
}

.question-btn {
  border-radius: 8px;
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

@keyframes consultPulse {
  0%,
  100% {
    transform: scaleY(0.72);
    opacity: 0.42;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.notes-sidebar {
  position: relative;
  min-height: 0;
  grid-row: 1 / span 2;
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

.phone-fab {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid rgba(219, 194, 139, 0.18);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: rgba(8, 16, 20, 0.94);
  color: #ead9af;
  z-index: 13;
  font-family: inherit;
}

.phone-fab.consult {
  bottom: 5.4rem;
}

.phone-badge {
  min-width: 1.3rem;
  height: 1.3rem;
  padding: 0 0.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #8a5938;
  color: #f6e9cf;
  font-size: 0.72rem;
  line-height: 1;
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
  border-radius: 10px;
  padding: 1.5rem;
}

.profile-modal {
  width: min(620px, calc(100vw - 2rem));
}

.phone-modal {
  width: min(520px, calc(100vw - 2rem));
}

.phone-message-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
  max-height: min(60vh, 520px);
  overflow-y: auto;
  padding-right: 0.2rem;
}

.phone-message-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.9rem 0.95rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.phone-message-item.unread {
  border-color: rgba(219, 194, 139, 0.22);
  background: rgba(219, 194, 139, 0.05);
}

.phone-message-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #d7c79d;
  font-size: 0.8rem;
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
  .title-stage,
  .intro-stage,
  .hub-stats-bar,
  .question-grid,
  .treatment-grid {
    grid-template-columns: 1fr;
  }

  .phase-topbar,
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

  .title-stage {
    width: min(100%, calc(100vw - 2rem));
    padding: 1rem 0;
    gap: 1rem;
  }

  .title-panel {
    min-height: auto;
  }

  .title-sidebar {
    min-height: auto;
    padding: 1.2rem;
  }

  .hub-topbar-reframed {
    gap: 0.7rem;
  }

  .hub-topbar-row {
    grid-template-columns: auto 1fr 1fr;
    align-items: center;
  }

  .hub-timeflow-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.45rem;
  }

  .hub-topbar {
    align-items: stretch;
  }

  .hub-topbar-text {
    font-size: 0.92rem;
    letter-spacing: 0.06em;
  }

  .topbar-action-btn {
    padding-left: 0.85rem;
    padding-right: 0.85rem;
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

  .intro-stage {
    padding: 1rem;
    overflow-y: auto;
  }

  .intro-sidebar {
    order: 2;
  }

  .intro-card {
    order: 1;
  }

  .consult-main {
    height: calc(100vh - 112px);
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(180px, 32vh);
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

  .notes-sidebar {
    grid-row: auto;
  }
}
</style>

