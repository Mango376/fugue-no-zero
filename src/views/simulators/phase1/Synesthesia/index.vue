<template>
  <div class="synesthesia-shell">

    <!-- ========== 标题页 ========== -->
    <Transition name="fade">
      <section v-if="phase === 'title'" class="screen screen-title">
        <!-- 流动网格背景 -->
        <div class="title-grid-bg" aria-hidden="true"></div>

        <!-- 3D 海报卡片 -->
        <div class="title-poster" ref="titlePosterRef">
          <div class="poster-scratch" aria-hidden="true"></div>

          <!-- 全息 HUD：雷达圈 -->
          <div class="hud-radar" aria-hidden="true"></div>

          <!-- 全息 HUD：警戒数据流 -->
          <div class="hud-data" aria-hidden="true">
            <div class="hud-data-track">
              <span>> SYS.BOOT.. CLINIC_2157</span>
              <span>> SENSE.MAP.. CORRUPTED</span>
              <span>> PATIENT.. INCOMING</span>
              <span>> OVERRIDE.. STANDBY</span>
              <span>> SYS.BOOT.. CLINIC_2157</span>
              <span>> SENSE.MAP.. CORRUPTED</span>
              <span>> PATIENT.. INCOMING</span>
              <span>> OVERRIDE.. STANDBY</span>
            </div>
          </div>

          <!-- 主标题区 -->
          <div class="poster-body">
            <div class="poster-eyebrow">SYNESTHESIA CLINIC · 2157</div>

            <!-- 点击触发 3D 翻转的标题 -->
            <h1 class="poster-title" :class="{ 'is-spinning': isTitleSpinning }" @click="playTitleSpin" data-text="共觉之境">共觉之境</h1>
            
            <!-- 黑客乱码解码特效的副标题 -->
            <p class="poster-subtitle" :data-text="displaySubtitle" @mouseenter="playDecodeEffect">
              {{ displaySubtitle }}
            </p>

            <div class="poster-divider"></div>

            <p class="poster-desc">
              VIRUS.ID: SYNESTHESIA<br>
              LOCATION: LOWER DISTRICT · 09<br>
              SENSATION.MAP: CRITICAL<br>
              PROTOCOL: REPAIR OR ARCHIVE
            </p>

            <!-- 扫描进度条 -->
            <div class="poster-scanbar" aria-hidden="true">
              <div class="poster-scanbar-fill"></div>
            </div>

            <!-- 操作按钮 (实体机械按键) -->
            <div class="poster-actions">
              <button class="poster-btn poster-btn--primary" @click="startNewGame">
                <span class="poster-btn-icon">▶</span>
                开始新游戏
              </button>
              <button
                class="poster-btn poster-btn--secondary"
                :class="{ disabled: !hasSave || isCheckingSave }"
                :disabled="!hasSave || isCheckingSave"
                @click="continueGame"
              >继续游戏</button>
            </div>

            <div class="poster-archive-hint">{{ latestArchiveLabel }}</div>
            <button class="poster-back" @click="goHome">⏏ 切断连接</button>
          </div>
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
          <div class="intro-reading-column" :key="backgroundPage">
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

        <!-- 顶栏 -->
        <header class="hub-topbar">
          <div class="hub-profile-card" @click="toggleProfilePanel">
            <div class="hub-profile-avatar">
              <img v-if="playerProfile.avatar" :src="playerProfile.avatar" class="avatar-img" />
              <span v-else>{{ (playerProfile.title || '维').slice(-1) }}</span>
            </div>
            <div class="hub-profile-info">
              <div class="hub-profile-name">{{ playerProfile.title }}</div>
              <div class="hub-profile-credits">💳 <span>{{ credits }}</span></div>
            </div>
            <div class="hub-profile-arrow">›</div>
          </div>
          <button class="back-btn" @click="returnToTitle">⏏ 切断连接</button>
        </header>

        <!-- 主体 -->
        <div class="hub-body">

          <!-- 环境卡 -->
          <div class="hub-environment-card">
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

          <!-- 四个功能按钮 + 3D 全息雷达 -->
          <div class="hub-action-grid">
            <button class="hub-action-btn" @click="hubModalType = 'snapshot'">
              <span class="hub-action-icon">◎</span>
              <span class="hub-action-label">诊断流程</span>
            </button>
            <button class="hub-action-btn" @click="hubModalType = 'equipment'">
              <span class="hub-action-icon">⚙</span>
              <span class="hub-action-label">设备升级</span>
            </button>
            <button class="hub-action-btn" @click="hubModalType = 'revisit'">
              <span class="hub-action-icon">◈</span>
              <span class="hub-action-label">待复诊患者</span>
              <span v-if="dueRevisitCount" class="hub-action-badge">{{ dueRevisitCount }}</span>
            </button>
            <button class="hub-action-btn" @click="openPatientRecords">
              <span class="hub-action-icon">📋</span>
              <span class="hub-action-label">患者档案</span>
              <span v-if="archiveCases.length" class="hub-action-badge">{{ archiveCases.length }}</span>
            </button>
          </div>

          <!-- 接待按钮区 -->
          <div class="hub-reception-area">
            <button
              class="hub-reception-btn"
              :class="{ disabled: !canStartPatientFlow }"
              :disabled="!canStartPatientFlow"
              @click="startPatientFlow"
            >
              <span class="hub-reception-icon">▶</span>
              {{ hubActions.primaryLabel }}
            </button>
            <div class="hub-reception-hint">{{ patientArrivalStatusText }}</div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ========== Hub 功能弹窗 ========== -->
    <Transition name="modal-fade">
      <div v-if="hubModalType" class="modal-overlay" @click.self="hubModalType = null">
        <div class="modal-card hub-modal-card">

          <!-- 诊断流程 -->
          <template v-if="hubModalType === 'snapshot'">
            <div class="modal-kicker">系统说明</div>
            <div class="modal-title">诊断流程</div>
            <div class="hub-modal-list">
              <div v-for="item in systemSnapshot" :key="item" class="hub-modal-row">{{ item }}</div>
            </div>
          </template>

          <!-- 设备升级 -->
          <template v-else-if="hubModalType === 'equipment'">
            <div class="modal-kicker">设备管理</div>
            <div class="modal-title">设备升级</div>
            <div class="hub-modal-scroll">
              <div v-for="item in equipmentModuleRows" :key="item.id" class="equipment-group">
                <div class="equipment-group-name">{{ item.name }}</div>
                <div class="equipment-module-list">
                  <div v-for="module in item.modules" :key="module.id" class="equipment-row">
                    <span class="eq-label">{{ module.label }}</span>
                    <span class="eq-level">Lv.{{ module.level }}</span>
                    <button
                      class="eq-upgrade-btn"
                      :disabled="module.level >= 4"
                      @click.stop="requestUpgrade(
                        item.id, module.targetId,
                        `${item.name} · ${module.label}`,
                        module.level, module.upgradeCost
                      )"
                    >{{ module.level >= 4 ? '满级' : `升级 ${module.upgradeCost}💳` }}</button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 待复诊患者 -->
          <template v-else-if="hubModalType === 'revisit'">
            <div class="modal-kicker">复诊管理</div>
            <div class="modal-title">
              待复诊患者
              <span class="hub-modal-count">到期 {{ dueRevisitCount }} · 排队 {{ pendingRevisitCount }}</span>
            </div>
            <div class="hub-modal-scroll">
              <div v-if="!revisitQueue.length" class="hub-modal-empty">暂无待复诊患者</div>
              <div v-for="patient in revisitQueue" :key="patient.id" class="revisit-row">
                <div class="revisit-row-left">
                  <span class="revisit-name">{{ patient.name }}</span>
                  <span class="revisit-job">{{ patient.job }}</span>
                </div>
                <span
                  class="revisit-day"
                  :class="{ due: Number(patient.returnDay) <= gameDay }"
                >第 {{ patient.returnDay }} 天</span>
              </div>
            </div>
          </template>

          <div class="modal-actions">
            <button class="btn-secondary" @click="hubModalType = null">关闭</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ========== 升级确认弹窗 ========== -->
    <Transition name="modal-fade">
      <div v-if="showUpgradeConfirmModal" class="modal-overlay" @click.self="cancelUpgrade">
        <div class="modal-card">
          <div class="modal-kicker">升级确认</div>
          <div class="modal-title">确认升级模块？</div>
          <div class="upgrade-confirm-detail">
            <div class="upgrade-confirm-row">
              <span class="upgrade-confirm-label">模块</span>
              <span class="upgrade-confirm-value">{{ pendingUpgrade?.label }}</span>
            </div>
            <div class="upgrade-confirm-row">
              <span class="upgrade-confirm-label">当前等级</span>
              <span class="upgrade-confirm-value">Lv.{{ pendingUpgrade?.level }}</span>
            </div>
            <div class="upgrade-confirm-row">
              <span class="upgrade-confirm-label">升级后</span>
              <span class="upgrade-confirm-value">Lv.{{ (pendingUpgrade?.level ?? 0) + 1 }}</span>
            </div>
            <div class="upgrade-confirm-row">
              <span class="upgrade-confirm-label">花费</span>
              <span class="upgrade-confirm-value upgrade-confirm-cost">{{ pendingUpgrade?.cost }} 💳</span>
            </div>
            <div class="upgrade-confirm-row">
              <span class="upgrade-confirm-label">当前余额</span>
              <span
                class="upgrade-confirm-value"
                :class="{ 'upgrade-insufficient': credits < (pendingUpgrade?.cost ?? 0) }"
              >{{ credits }} 💳</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="cancelUpgrade">取消</button>
            <button
              class="btn-primary"
              :disabled="credits < (pendingUpgrade?.cost ?? 0)"
              @click="confirmUpgrade"
            >确认升级</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ========== 患者档案页 ========== -->
    <Transition name="fade">
      <section v-if="phase === 'patient_records'" class="screen screen-patient-records">
        <header class="phase-topbar">
          <button class="back-btn" @click="closePatientRecords">
            ‹ {{ localSelectedArchive ? '返回列表' : '返回' }}
          </button>
          <div class="phase-topbar-center">
            <div class="phase-title">{{ localSelectedArchive ? localSelectedArchive.name : '患者档案' }}</div>
            <div v-if="localSelectedArchive" class="phase-sub">{{ localSelectedArchive.job }}</div>
          </div>
        </header>

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
                <div class="pr-outcome-tag" :class="archive.outcome">{{ archive.outcomeLabel || '已归档' }}</div>
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
              <div class="pr-card-preview">{{ archive.summary || archive.trackingSheet?.symptomSummary || '暂无摘要' }}</div>
              <div class="pr-card-enter">查看详情 ›</div>
            </div>
          </div>
        </div>

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
            <div class="pr-text-card">{{ localSelectedArchive.trackingSheet?.coreConcern || localSelectedArchive.coreConcern }}</div>
          </template>

          <template v-if="localSelectedArchive.summary || localSelectedArchive.trackingSheet?.symptomSummary">
            <div class="pr-section-title">病例摘要</div>
            <div class="pr-text-card">{{ localSelectedArchive.trackingSheet?.symptomSummary || localSelectedArchive.summary }}</div>
          </template>

          <template v-if="localSelectedArchive.archiveStory || (localSelectedArchive.closingNarrative && localSelectedArchive.closingNarrative !== localSelectedArchive.feedbackText)">
            <div class="pr-section-title">背景档案</div>
            <div class="pr-text-card pr-story">
              <p v-for="(para, i) in splitParagraphs(localSelectedArchive.archiveStory || localSelectedArchive.closingNarrative)" :key="i">{{ para }}</p>
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
              <div v-for="(log, i) in localSelectedArchive.trackingSheet.changeLog" :key="i" class="pr-changelog-item">{{ log }}</div>
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
            <div class="patient-env-row">{{ activeEnvironment?.description || '环境信息暂不可用' }}</div>
          </div>

          <button
            v-if="collapsedHistoryCount > 0"
            class="history-toggle-btn"
            @click="showFullHistory = !showFullHistory"
          >
            <span class="toggle-icon">{{ showFullHistory ? '▴' : '▾' }}</span>
            <span>{{ showFullHistory ? '收起历史记录' : `查看历史记录（${collapsedHistoryCount}条）` }}</span>
          </button>

          <div class="frame-content" ref="contentEl">
            <div v-if="!showFullHistory && collapsedHistoryCount > 0" class="history-divider">
              <span class="hd-line"></span>
              <span class="hd-text">以上为历史记录</span>
              <span class="hd-line"></span>
            </div>

            <template v-for="entry in visibleEntries" :key="entry.id">
              <div
                v-if="entry.speaker === 'narration' || entry.speaker === 'narrator' || entry.speaker === 'system'"
                class="entry-narration"
              >
                <template v-if="entry.id === localTypingEntryId">
                  <Typewriter :text="entry.text" :speed="typewriterSpeed" @done="handleTypingDone" />
                </template>
                <template v-else>
                  <p v-for="(para, i) in splitParagraphs(entry.text)" :key="i">{{ para }}</p>
                </template>
              </div>

              <div v-else-if="entry.speaker === 'patient'" class="entry-patient">
                <template v-if="entry.id === localTypingEntryId">
                  <Typewriter :text="entry.text" :speed="typewriterSpeed" @done="handleTypingDone" />
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
              <button class="retry-btn" @click="retryArrivalNarrative">重新加载 ↺</button>
            </div>
          </div>

          <div class="frame-status-bar">
            <div class="status-item">
              <span class="status-label">诊断次数</span>
              <div class="status-pips">
                <span v-for="n in diagnosisAttemptsTotal" :key="n" class="pip" :class="{ used: n > diagnosisAttemptsLeft }"></span>
              </div>
              <span class="status-num">{{ diagnosisAttemptsLeft }}</span>
            </div>
            <div class="status-divider"></div>
            <div class="status-item">
              <span class="status-label">接诊序号</span>
              <span class="status-num">{{ activePatient?.serial ?? patientCount + 1 }}</span>
            </div>
          </div>
        </div>

        <div v-if="isGeneratingText" class="consult-loading-area">
          <div class="loading-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="loading-text">正在整理新的问诊回应</div>
        </div>

        <div v-if="shouldShowConsultOptions" class="consult-choices-area">
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

        <div v-if="shouldShowRetryOptions" class="consult-retry-area">
          <button class="retry-btn" @click="handleRetryOptions">重新生成选项 ↺</button>
        </div>

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

        <!-- 病历记录抽屉 -->
        <div class="notes-tab" :class="{ open: showNotesDrawer }" @click="toggleNotesDrawer">
          <span class="notes-tab-text">病历记录</span>
          <span class="notes-tab-arrow">{{ showNotesDrawer ? '›' : '‹' }}</span>
        </div>

        <Transition name="drawer-fade">
          <aside v-if="showNotesDrawer" class="notes-drawer">
            <div class="notes-backdrop" @click="toggleNotesDrawer"></div>
            <div class="notes-card">
              <div class="notes-head">
                <div class="notes-head-left">
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
                      <label v-for="targetId in senseTargets[sense.id]" :key="`${sense.id}-${targetId}`" class="mapping-option">
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
                  <div v-else class="summary-copy">暂无</div>
                  <div class="summary-meta">{{ diagnosisAttemptLabel }}</div>
                </div>
              </div>

              <div class="notes-actions">
                <button class="btn-secondary" :disabled="!canSubmitDiagnosis" @click="submitDiagnosis">提交至诊断仪</button>
                <button class="btn-primary" :disabled="!canEnterTreatment" @click="openTreatmentScreen">前往治疗仪</button>
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
                <label v-for="targetId in senseTargets[sense.id]" :key="`treatment-${sense.id}-${targetId}`" class="mapping-option">
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
              <button class="btn-primary" :disabled="!canSubmitTreatment" @click="submitTreatment">提交治疗</button>
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
              <div class="feedback-chip" :class="patientFeedbackOutcome">{{ currentSettlementRecord.outcomeLabel }}</div>
              <div class="feedback-body">
                <p v-for="(para, i) in splitParagraphs(currentSettlementRecord.closingNarrative || currentSettlementRecord.feedbackText)" :key="`settlement-${i}`">{{ para }}</p>
              </div>
              <div class="settlement-summary">
                <div class="settlement-stat">
                  <div class="settlement-stat-label">成功治愈</div>
                  <div class="settlement-stat-value">{{ settlementLevelSummary.length ? settlementLevelSummary.map(item => item.label).join('，') : '无' }}</div>
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
            <div class="frame-empty-area">
              <div class="frame-empty-text">正在加载结算信息……</div>
            </div>
          </template>
        </div>
      </section>
    </Transition>

    <!-- ========== 弹窗：手机消息 ========== -->
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

    <!-- ========== 弹窗：覆盖确认 ========== -->
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

    <!-- ========== 弹窗：升级失败 ========== -->
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

    <!-- ========== 弹窗：玩家档案 ========== -->
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

    <!-- ========== 全局后台音频核心 ========== -->
    <audio 
      ref="audioRef" 
      :src="currentTrack.url" 
      @timeupdate="onAudioTimeUpdate" 
      @ended="nextTrack"
    ></audio>

    <!-- ========== 全息拖拽组件 ========== -->
    <template v-if="phase === 'hub' || phase === 'consult'">
       <button 
        class="phone-fab" 
        ref="phoneFabRef"
        :style="fabDragStyle"
        @mousedown="startFabDrag"
        @touchstart.prevent="startFabDrag"
        @click="handleFabClick"
      >
        📱
        <span v-if="unreadPhoneCount" class="phone-badge">{{ unreadPhoneCount }}</span>
      </button>
      <!-- 左下角悬浮按钮 (可拖拽) -->
      <button 
        class="music-fab" 
        ref="musicFabRef"
        :style="musicFabDragStyle"
        @mousedown="startMusicFabDrag"
        @touchstart.prevent="startMusicFabDrag"
        @click="handleMusicFabClick"
      >
        <span class="music-fab-icon">🎵</span>
        <div v-if="isPlaying" class="music-wave-mini">
          <span></span><span></span><span></span>
        </div>
      </button>

      <!-- 播放器展开面板 -->
      <Transition name="drawer-fade">
        <div v-if="showMusicPlayer" class="music-panel">
          <div class="music-panel-head">
            <span class="music-sys-title">SYS.AUDIO // FM_LINK</span>
            <button class="music-close" @click="toggleMusicPlayer">×</button>
          </div>
          
          <div class="music-info">
            <div class="music-title">{{ currentTrack.title }}</div>
            <div class="music-artist">{{ currentTrack.artist }}</div>
          </div>

          <div class="music-progress-bg">
            <div class="music-progress-fill" :style="{ width: audioProgress + '%' }"></div>
          </div>

          <div class="music-controls">
            <button class="music-ctrl-btn" @click="prevTrack">⏮</button>
            <button class="music-ctrl-btn play-btn" @click="togglePlay">
              {{ isPlaying ? '⏸' : '▶' }}
            </button>
            <button class="music-ctrl-btn" @click="nextTrack">⏭</button>
          </div>
        </div>
      </Transition>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import Typewriter from '@/components/common/Typewriter.vue'
import { useGameLogic } from './composables/useGameLogic'

// ============================================================
// 音乐播放器逻辑与拖拽
// ============================================================
import bgm1 from '@/assets/audio/phase1/Synesthesia/Untitled (1).mp3'
import bgm2 from '@/assets/audio/phase1/Synesthesia/Untitled (2).mp3'
import bgm3 from '@/assets/audio/phase1/Synesthesia/Untitled (3).mp3'
import bgm4 from '@/assets/audio/phase1/Synesthesia/Untitled (4).mp3'
import bgm5 from '@/assets/audio/phase1/Synesthesia/Untitled (5).mp3'
import bgm6 from '@/assets/audio/phase1/Synesthesia/Untitled (6).mp3'
import bgm7 from '@/assets/audio/phase1/Synesthesia/Untitled (7).mp3'
import bgm8 from '@/assets/audio/phase1/Synesthesia/Untitled (8).mp3'
import bgm9 from '@/assets/audio/phase1/Synesthesia/Untitled (9).mp3'
import bgm10 from '@/assets/audio/phase1/Synesthesia/Untitled (10).mp3'

const showMusicPlayer = ref(false)
const isPlaying = ref(false)
const audioRef = ref(null)
const audioProgress = ref(0)

const trackList = [
  { title: 'AUDIO_FILE_01', artist: 'PHASE 1 // SYNESTHESIA', url: bgm1 },
  { title: 'AUDIO_FILE_02', artist: 'PHASE 1 // SYNESTHESIA', url: bgm2 },
  { title: 'AUDIO_FILE_03', artist: 'PHASE 1 // SYNESTHESIA', url: bgm3 },
  { title: 'AUDIO_FILE_04', artist: 'PHASE 1 // SYNESTHESIA', url: bgm4 },
  { title: 'AUDIO_FILE_05', artist: 'PHASE 1 // SYNESTHESIA', url: bgm5 },
  { title: 'AUDIO_FILE_06', artist: 'PHASE 1 // SYNESTHESIA', url: bgm6 },
  { title: 'AUDIO_FILE_07', artist: 'PHASE 1 // SYNESTHESIA', url: bgm7 },
  { title: 'AUDIO_FILE_08', artist: 'PHASE 1 // SYNESTHESIA', url: bgm8 },
  { title: 'AUDIO_FILE_09', artist: 'PHASE 1 // SYNESTHESIA', url: bgm9 },
  { title: 'AUDIO_FILE_10', artist: 'PHASE 1 // SYNESTHESIA', url: bgm10 }
]

const currentTrackIndex = ref(Math.floor(Math.random() * trackList.length))
const currentTrack = computed(() => trackList[currentTrackIndex.value])

const unlockAutoPlay = () => {
  if (!isPlaying.value && audioRef.value) {
    audioRef.value.play().then(() => {
      isPlaying.value = true;
      document.removeEventListener('click', unlockAutoPlay);
      document.removeEventListener('touchstart', unlockAutoPlay);
    }).catch(err => console.warn('等待交互以播放音频...'));
  }
}

function toggleMusicPlayer() { showMusicPlayer.value = !showMusicPlayer.value }

function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().catch(e => console.warn('音频播放失败', e))
    isPlaying.value = true
  }
}

function playRandomTrack() {
  let nextIndex = Math.floor(Math.random() * trackList.length)
  while (nextIndex === currentTrackIndex.value && trackList.length > 1) {
    nextIndex = Math.floor(Math.random() * trackList.length)
  }
  currentTrackIndex.value = nextIndex
  if (isPlaying.value) {
    setTimeout(() => audioRef.value?.play(), 50)
  }
}
function nextTrack() { playRandomTrack() }
function prevTrack() { playRandomTrack() }
function onAudioTimeUpdate(e) {
  if (!e.target.duration) return
  audioProgress.value = (e.target.currentTime / e.target.duration) * 100
}

// 音乐悬浮球拖拽逻辑
const musicFabRef = ref(null)
const musicFabPos = ref({ x: null, y: null })
const isMusicFabDragging = ref(false)

const musicFabDragStyle = computed(() => {
  if (musicFabPos.value.x === null) return {}
  return { left: musicFabPos.value.x + 'px', top: musicFabPos.value.y + 'px', right: 'auto', bottom: 'auto' }
})

function startMusicFabDrag(e) {
  const touch = e.touches ? e.touches[0] : e
  const el = musicFabRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const startX = touch.clientX - rect.left
  const startY = touch.clientY - rect.top
  isMusicFabDragging.value = false

  const onMove = (e) => {
    const t = e.touches ? e.touches[0] : e
    isMusicFabDragging.value = true
    const newX = t.clientX - startX
    const newY = t.clientY - startY
    musicFabPos.value = {
      x: Math.max(0, Math.min(newX, window.innerWidth - el.offsetWidth)),
      y: Math.max(0, Math.min(newY, window.innerHeight - el.offsetHeight))
    }
  }
  const onEnd = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onEnd)
}

function handleMusicFabClick() {
  if (!isMusicFabDragging.value) toggleMusicPlayer()
  isMusicFabDragging.value = false
}

// ============================================================
// 标题点击与乱码解码特效
// ============================================================
const isTitleSpinning = ref(false)
function playTitleSpin() {
  if (isTitleSpinning.value) return 
  isTitleSpinning.value = true
  setTimeout(() => { isTitleSpinning.value = false }, 1000)
}

const originalSubtitle = "仿生人感官修复模拟器"
const displaySubtitle = ref(originalSubtitle)
const hackerChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*"
function playDecodeEffect() {
  let iteration = 0;
  clearInterval(playDecodeEffect.interval);
  playDecodeEffect.interval = setInterval(() => {
    displaySubtitle.value = originalSubtitle.split("").map((char, index) => {
      if (index < iteration) return originalSubtitle[index];
      return hackerChars[Math.floor(Math.random() * hackerChars.length)];
    }).join("");
    if (iteration >= originalSubtitle.length) clearInterval(playDecodeEffect.interval);
    iteration += 1 / 3;
  }, 30);
}

// ============================================================
// 游戏核心逻辑解构
// ============================================================
const contentEl = ref(null)
const showFullHistory = ref(false)
const showPhonePanel = ref(false)
const localSelectedArchive = ref(null)
const localTypingEntryId = ref('')
const typewriterSpeed = 45

const hubModalType = ref(null)
const showUpgradeConfirmModal = ref(false)
const pendingUpgrade = ref(null)

const {
  phase, consultStage, consultEntryStage,
  hasSave, hasArchiveSave, isCheckingSave,
  showConfirmNewGameModal, showUpgradeFailureModal, upgradeFailureMessage,
  showProfilePanel, showSettlementModal, showNotesDrawer,
  equipmentExpanded, snapshotExpanded,
  isGeneratingText, typingEntryId, isEnvironmentLoading, narrativeError,
  currentEnvironment, currentEnvironmentDescription, activeEnvironment,
  credits, gameDay, patientCount,
  backgroundPage, backgroundTotal, currentBackgroundPage,
  playerProfile,
  activePatient, activePatientSummary, pendingRevisitCount, dueRevisitCount,
  canStartPatientFlow, patientArrivalStatusText,
  consultationHistory, consultNotes, isConsultNarrativeReady, isConsultOptionsReady, currentConsultOptions,
  diagnosisAttemptLabel, diagnosisAttemptsLeft, diagnosisAttemptsTotal,
  diagnosisDraft, treatmentDraft, confirmedDiagnosisDetails, confirmedDiagnosisSummary, treatmentDraftSummary,
  canSubmitDiagnosis, canEnterTreatment, canSubmitTreatment,
  patientFeedbackText, patientFeedbackOutcome, pendingSettlementRecord, currentSettlementRecord, settlementLevelSummary,
  currentFeedbackActionLabel, feedbackOutcomeLabel,
  archiveCases, latestArchiveLabel,
  phoneMessages, unreadPhoneCount, pendingDebtCount,
  equipmentModuleRows,
  totalEarnings, totalCuredCount, totalEquipmentLevel,
  hubActions, senseConfigs, senseLabels, senseTargets, systemSnapshot,
  startNewGame, confirmStartNewGame, cancelStartNewGame, continueGame, loadArchivedGame, saveManualProgress,
  goHome, returnToHub, returnToTitle, goToNextBackgroundPage, goToPrevBackgroundPage,
  toggleProfilePanel, updatePlayerName, updatePlayerAvatar,
  markPhoneMessagesRead, upgradeEquipmentModule, toggleEquipmentSection, closeUpgradeFailureModal,
  startPatientFlow, continueConsultFlow, chooseConsultOption, handleConsultNotesInput, retryConsultOptions,
  toggleDiagnosisTarget, toggleTreatmentTarget, getTreatmentOptionMeta, submitDiagnosis, openTreatmentScreen, returnToConsult, submitTreatment,
  advanceFromFeedback, confirmSettlementAndReturn,
  toggleSnapshotSection, toggleNotesDrawer,
  revisitQueue
} = useGameLogic()

// 手机悬浮球拖拽逻辑
const phoneFabRef = ref(null)
const fabPos = ref({ x: null, y: null })
const isFabDragging = ref(false)

const fabDragStyle = computed(() => {
  if (fabPos.value.x === null) return {}
  return { left: fabPos.value.x + 'px', top: fabPos.value.y + 'px', right: 'auto', bottom: 'auto' }
})

function startFabDrag(e) {
  const touch = e.touches ? e.touches[0] : e
  const el = phoneFabRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const startX = touch.clientX - rect.left
  const startY = touch.clientY - rect.top
  isFabDragging.value = false

  const onMove = (e) => {
    const t = e.touches ? e.touches[0] : e
    isFabDragging.value = true
    const newX = t.clientX - startX
    const newY = t.clientY - startY
    fabPos.value = {
      x: Math.max(0, Math.min(newX, window.innerWidth - el.offsetWidth)),
      y: Math.max(0, Math.min(newY, window.innerHeight - el.offsetHeight))
    }
  }
  const onEnd = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onEnd)
}

function handleFabClick() {
  if (!isFabDragging.value) togglePhonePanel()
  isFabDragging.value = false
}

function requestUpgrade(sourceId, targetId, label, level, cost) {
  pendingUpgrade.value = { sourceId, targetId, label, level, cost }
  showUpgradeConfirmModal.value = true
}
function confirmUpgrade() {
  if (!pendingUpgrade.value) return
  upgradeEquipmentModule(pendingUpgrade.value.sourceId, pendingUpgrade.value.targetId)
  showUpgradeConfirmModal.value = false
  hubModalType.value = null
  pendingUpgrade.value = null
}
function cancelUpgrade() {
  showUpgradeConfirmModal.value = false
  pendingUpgrade.value = null
}

const safeConsultationHistory = computed(() =>
  (consultationHistory.value || []).map(entry => ({ ...entry, text: String(entry?.text || '') })).filter(entry => entry.text && entry.text.trim())
)

const visibleEntries = computed(() => showFullHistory.value ? safeConsultationHistory.value : safeConsultationHistory.value.slice(-2))
const collapsedHistoryCount = computed(() => Math.max(0, safeConsultationHistory.value.length - 2))

watch(() => safeConsultationHistory.value.length, () => {
  showFullHistory.value = false
  nextTick(() => { if (contentEl.value) contentEl.value.scrollTop = contentEl.value.scrollHeight })
})

watch(() => typingEntryId.value, (newId) => { localTypingEntryId.value = newId || '' })
watch(() => phase.value, () => { showPhonePanel.value = false; localTypingEntryId.value = '' })

const isTypingActive = computed(() => !!localTypingEntryId.value)
function handleTypingDone() { localTypingEntryId.value = ''; typingEntryId.value = '' }

const shouldShowConsultOptions = computed(() =>
  phase.value === 'consult' && consultEntryStage.value === 'questioning' &&
  Boolean(isConsultNarrativeReady.value) && Boolean(isConsultOptionsReady.value) &&
  !isGeneratingText.value && !isTypingActive.value && currentConsultOptions.value.length > 0 && !pendingSettlementRecord.value
)

const shouldShowRetryOptions = computed(() =>
  !isGeneratingText.value && !isTypingActive.value && currentConsultOptions.value.length === 0 &&
  safeConsultationHistory.value.length > 0 && !pendingSettlementRecord.value
)

function togglePhonePanel() {
  showPhonePanel.value = !showPhonePanel.value
  if (showPhonePanel.value) markPhoneMessagesRead()
}

async function retryArrivalNarrative() {
  if (!activePatient.value || isGeneratingText.value) return
  consultEntryStage.value = 'pre_consult'
  await continueConsultFlow()
}

async function handleRetryOptions() {
  localTypingEntryId.value = ''
  typingEntryId.value = ''
  await retryConsultOptions()
}

function openPatientRecords() {
  localSelectedArchive.value = null
  phase.value = 'patient_records'
}
function closePatientRecords() {
  if (localSelectedArchive.value) { localSelectedArchive.value = null } else { phase.value = 'hub' }
}

function splitParagraphs(text = '') {
  const raw = String(text || '').trim()
  if (!raw) return []
  const byLine = raw.split(/\n+/).map(s => s.trim()).filter(Boolean)
  if (byLine.length > 1) return byLine
  const sentences = raw.split(/(?<=[。！？!?])/).map(s => s.trim()).filter(Boolean)
  if (sentences.length <= 2) return [raw]
  const paragraphs = []
  let buffer = ''
  for (const sentence of sentences) {
    if (!buffer) { buffer = sentence; continue }
    if ((buffer + sentence).length <= 38) { buffer += sentence }
    else { paragraphs.push(buffer); buffer = sentence }
  }
  if (buffer) paragraphs.push(buffer)
  return paragraphs
}

function isChecked(mapping, sourceId, targetId) {
  return Array.isArray(mapping?.[sourceId]) && mapping[sourceId].includes(targetId)
}
function handlePlayerNameChange(e) { updatePlayerName(e?.target?.value) }

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
    const d = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(timestamp).replace(/\//g, '.')
    return `第 ${record?.gameDay || '-'} 天 · ${d}`
  }
  return `第 ${record?.gameDay || '-'} 天`
}

function getArchiveEntryTypeLabel(entry) {
  const map = { arrival: '初诊', question: '问诊', answer: '患者反馈', diagnosis: '诊断仪', treatment_feedback: '治疗反馈', narration: '旁白', doctor: '医生', patient: '患者', system: '系统' }
  return map[entry?.type] || map[entry?.speaker] || '记录'
}

// 挂载/卸载事件
onMounted(() => {
  document.addEventListener('click', unlockAutoPlay);
  document.addEventListener('touchstart', unlockAutoPlay);
})

onBeforeUnmount(() => {
  document.removeEventListener('click', unlockAutoPlay);
  document.removeEventListener('touchstart', unlockAutoPlay);
})
</script>

<style scoped>
/* ============================================================
共觉之境 · 赛博朋克多色霓虹版 (最终集成版)
============================================================ */

.synesthesia-shell {
  --neon-cyan: #00f3ff;
  --neon-pink: #ff007c;
  --neon-yellow: #fcee0a;
  --neon-purple: #b026ff;
  --neon-green: #39ff14;
  --dark-bg: #030408;
  --panel-bg: rgba(8, 12, 20, 0.85);

  --bg-wall: var(--dark-bg);
  --bg-paper: rgba(10, 15, 25, 0.95);
  --bg-panel: var(--panel-bg);
  --bg-card: rgba(12, 16, 28, 0.85);
  --bg-card-hover: rgba(0, 243, 255, 0.1);
  --bg-input: rgba(0, 243, 255, 0.05);
  
  --border-paper: rgba(176, 38, 255, 0.4);
  --border-warm: rgba(255, 0, 124, 0.4);
  --border-amber: rgba(252, 238, 10, 0.4);
  --border-cyan: rgba(0, 243, 255, 0.4);
  
  --text-dark: #ffffff;
  --text-main: #d1e8f5;
  --text-muted: #8aaac2;
  --text-dim: #54728c;
  
  --amber: var(--neon-pink);
  --amber-dim: rgba(255, 0, 124, 0.1);
  --cyan: var(--neon-cyan);
  --cyan-dim: rgba(0, 243, 255, 0.08);
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.8);
  --shadow-md: 0 4px 16px rgba(0, 243, 255, 0.15);
  --shadow-lg: 0 8px 30px rgba(255, 0, 124, 0.2);
  
  font-family: 'Courier New', Consolas, 'Noto Sans SC', sans-serif;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: var(--text-main);
  position: relative;
  
  background-color: var(--dark-bg);
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px),
    radial-gradient(circle at 15% 20%, rgba(176, 38, 255, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(0, 243, 255, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(255, 0, 124, 0.05) 0%, transparent 60%);
  background-size: 50px 50px, 50px 50px, 100% 100%, 100% 100%, 100% 100%;
  animation: globalGridPan 20s linear infinite;
}

@keyframes globalGridPan {
  0%   { background-position: 0px 0px, 0px 0px, 0% 0%, 0% 0%, 0% 0%; }
  100% { background-position: 50px 50px, 50px 50px, 0% 0%, 0% 0%, 0% 0%; }
}

.synesthesia-shell::before {
  content: ''; position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px); mix-blend-mode: multiply;
}

.synesthesia-shell::after {
  content: ''; position: absolute; top: -20vh; left: 0; right: 0; height: 15vh;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 243, 255, 0.02) 60%, rgba(0, 243, 255, 0.2) 100%);
  border-bottom: 2px solid rgba(0, 243, 255, 0.6); box-shadow: 0 10px 30px rgba(0, 243, 255, 0.2);
  z-index: 0; pointer-events: none; animation: cyberScanline 7s ease-in-out infinite;
}

@keyframes cyberScanline { 0% { top: -20vh; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100vh; opacity: 0; } }

.screen { position: absolute; inset: 0; display: flex; flex-direction: column; }

/* 业务页透明化以透出动态背景 */
.screen-intro, .screen-hub, .screen-patient-records, .screen-consult, .screen-treatment, .screen-settlement { 
  background: transparent !important; overflow: hidden; position: absolute; z-index: 1;
}

/* ============================================================
通用组件
============================================================ */

.back-btn {
  padding: 0.45rem 1rem;
  background: linear-gradient(180deg, rgba(0, 243, 255, 0.1) 0%, rgba(0, 30, 45, 0.7) 100%);
  border: 1px solid var(--neon-cyan); border-top: 1px solid rgba(150, 250, 255, 0.6);
  border-radius: 4px; color: var(--neon-cyan); font-family: inherit; font-size: 0.78rem;
  font-weight: bold; letter-spacing: 0.15em; cursor: pointer; white-space: nowrap; flex-shrink: 0; text-transform: uppercase; text-shadow: 0 0 3px var(--neon-cyan);
  box-shadow: 0 4px 0 rgba(0, 40, 50, 1), 0 6px 10px rgba(0, 243, 255, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.2);
  transition: all 0.1s ease; transform: translateY(0);
}
.back-btn:hover { background: linear-gradient(180deg, rgba(0, 243, 255, 0.3) 0%, rgba(0, 60, 80, 0.8) 100%); border-color: #fff; color: #fff; text-shadow: 0 0 5px var(--neon-cyan); box-shadow: 0 4px 0 rgba(0, 40, 50, 1), 0 8px 15px rgba(0, 243, 255, 0.3), inset 0 1px 5px rgba(255, 255, 255, 0.4); }
.back-btn:active { transform: translateY(4px); box-shadow: 0 0 0 rgba(0, 40, 50, 1), 0 2px 5px rgba(0, 243, 255, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.6); }

.btn-primary {
  padding: 0.7rem 1.4rem; border-radius: 4px; font-size: 0.85rem; letter-spacing: 0.12em; background: rgba(255, 0, 124, 0.05); border: 1px solid var(--neon-pink); color: var(--neon-pink); font-family: inherit; cursor: pointer; text-shadow: 0 0 5px rgba(255, 0, 124, 0.5); box-shadow: inset 0 0 10px rgba(255, 0, 124, 0.1); transition: all 0.22s ease; text-transform: uppercase;
}
.btn-primary:hover { background: var(--neon-pink); border-color: var(--neon-pink); color: #fff; text-shadow: none; box-shadow: 0 0 15px var(--neon-pink); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; filter: none; transform: none; box-shadow: none; border-style: dashed; color: rgba(255, 0, 124, 0.7); text-shadow: 0 0 3px rgba(255, 0, 124, 0.3); background: rgba(255, 0, 124, 0.02); }

.btn-secondary {
  padding: 0.7rem 1.4rem; border-radius: 4px; font-size: 0.82rem; letter-spacing: 0.08em; background: rgba(176, 38, 255, 0.05); border: 1px dashed var(--border-paper); color: #d896ff; font-family: inherit; cursor: pointer; transition: all 0.2s; text-transform: uppercase;
}
.btn-secondary:hover { border-style: solid; border-color: var(--neon-purple); color: #fff; background: rgba(176, 38, 255, 0.2); box-shadow: 0 0 10px rgba(176, 38, 255, 0.4); }
.btn-secondary.compact { padding: 0.42rem 0.85rem; font-size: 0.74rem; }
.btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; border-style: dashed; color: rgba(176, 38, 255, 0.7); background: transparent; }

.error-box { padding: 0.7rem 0.9rem; border-radius: 4px; background: repeating-linear-gradient(45deg, rgba(255, 0, 124, 0.05), rgba(255, 0, 124, 0.05) 10px, transparent 10px, transparent 20px); border: 1px solid var(--neon-pink); color: var(--neon-pink); font-size: 0.82rem; line-height: 1.8; text-shadow: 0 0 3px rgba(255, 0, 124, 0.5); }
.card-section-label { font-family: 'Courier New', monospace; font-size: 0.62rem; letter-spacing: 0.22em; color: var(--neon-yellow); margin-bottom: 0.4rem; text-transform: uppercase; text-shadow: 0 0 3px rgba(252, 238, 10, 0.5); }
.summary-copy { font-size: 0.82rem; color: var(--text-main); line-height: 1.8; }

/* ============================================================
页面切换动画
============================================================ */
.fade-enter-active { transition: opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease; }
.fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease; position: absolute; width: 100%; }
.fade-enter-from { opacity: 0; transform: translateY(8px) scale(0.99); filter: contrast(1.5) brightness(1.5) blur(2px); }
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
   标题页 3D 动态呼吸网格背景
============================================================ */
.title-grid-bg { 
  position: absolute; inset: 0; z-index: 0; pointer-events: none; 
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.4) 2px, transparent 3px), 
    linear-gradient(90deg, rgba(176, 38, 255, 0.4) 2px, transparent 3px), 
    linear-gradient(rgba(0, 243, 255, 0.4) 2px, transparent 3px), 
    linear-gradient(90deg, rgba(176, 38, 255, 0.4) 2px, transparent 3px); 
  background-size: 60px 60px, 60px 60px, 240px 240px, 240px 240px; 
  transform-origin: center center; 
  /* 使用新的 3D 呼吸网格动画 */
  animation: gridMorph 12s ease-in-out infinite; 
}

/* 一直变换的 3D 网格：除了滚动，还会改变透视角度和缩放，产生空间起伏感 */
@keyframes gridMorph { 
  0% { 
    background-position: 0 0; 
    transform: perspective(600px) rotateX(62deg) translateY(-10%) scale(1); 
  } 
  50% { 
    background-position: 0 400px;
    transform: perspective(600px) rotateX(68deg) translateY(-5%) scale(1.1); /* 视角下压并放大 */
  }
  100% { 
    background-position: 0 800px; 
    transform: perspective(600px) rotateX(62deg) translateY(-10%) scale(1); 
  } 
}

.title-grid-bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, var(--dark-bg) 0%, transparent 32%, transparent 65%, rgba(5, 5, 10, 0.8) 100%); }
.title-grid-bg::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 45%; background: radial-gradient(ellipse at 35% 100%, rgba(176, 38, 255, 0.2) 0%, transparent 55%), radial-gradient(ellipse at 65% 100%, rgba(255, 0, 124, 0.15) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(0, 243, 255, 0.15) 0%, transparent 60%); pointer-events: none; animation: glowBreath 4s ease-in-out infinite alternate; }
@keyframes glowBreath { 0% { opacity: 0.6; transform: scaleX(0.95); } 100% { opacity: 1; transform: scaleX(1.05); } }



.screen-title { align-items: center; justify-content: center; perspective: 1400px; background: var(--dark-bg); overflow: hidden; }
.screen-title::before { content: ''; position: absolute; left: 0; right: 0; height: 15vh; background: linear-gradient(180deg, transparent 0%, rgba(0, 243, 255, 0.05) 50%, transparent 100%); animation: horizScan 6s linear infinite; z-index: 1; pointer-events: none; }
@keyframes horizScan { 0% { top: -20vh; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100vh; opacity: 0; } }
.screen-title::after { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 243, 255, 0.02) 3px, rgba(0, 243, 255, 0.02) 4px); animation: scanlineScroll 12s linear infinite; }
@keyframes scanlineScroll { 0% { background-position: 0 0; } 100% { background-position: 0 80px; } }

.title-poster { 
  position: absolute; inset: 0; z-index: 10; background: transparent; box-shadow: none; 
  padding: 12vh 2.8rem 2.5rem; 
  transform-style: preserve-3d; transition: transform 0.12s ease-out; display: flex; flex-direction: column; overflow: hidden; 
}
.poster-scratch { display: none; }

.hud-radar { 
  position: absolute; top: 12vh; right: 2.5rem; width: 90px; height: 90px; 
  border: 1px dashed var(--neon-cyan); border-radius: 50%; transform: translateZ(70px); 
  animation: radarSpin 10s linear infinite; pointer-events: none; z-index: 21; box-shadow: 0 0 15px rgba(0, 243, 255, 0.2); 
}
.hud-radar::before { content: ''; position: absolute; top: 12px; left: 12px; width: 64px; height: 64px; border: 2px solid rgba(0, 243, 255, 0.1); border-top-color: var(--neon-pink); border-radius: 50%; animation: radarSpin 4s linear infinite reverse; }
.hud-radar::after { content: ''; position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; margin: -2px 0 0 -2px; border-radius: 50%; background: var(--neon-yellow); box-shadow: 0 0 8px var(--neon-yellow); }
@keyframes radarSpin { 100% { transform: translateZ(70px) rotate(360deg); } }

/* 底部数据警戒带 */
.hud-data { 
  position: absolute; bottom: 2.5rem; left: 0; right: 0; height: 32px; overflow: hidden; pointer-events: none; z-index: 22; 
  background: repeating-linear-gradient(-45deg, var(--neon-yellow), var(--neon-yellow) 20px, #111 20px, #111 40px); background-size: 56px 100%; animation: hazardTapeMove 1.5s linear infinite; border-top: 2px solid var(--neon-yellow); border-bottom: 2px solid var(--neon-yellow); box-shadow: 0 0 25px rgba(252, 238, 10, 0.3); display: flex; align-items: center;
}
@keyframes hazardTapeMove { 0% { background-position: 0 0; } 100% { background-position: 56px 0; } }

.hud-data-track { display: flex; flex-direction: row; gap: 4rem; width: max-content; animation: hudScroll 15s linear infinite; align-items: center; }
.hud-data-track span { font-family: 'Courier New', monospace; font-size: 0.85rem; font-weight: 900; color: #000; background: var(--neon-yellow); padding: 2px 10px; border-radius: 2px; white-space: nowrap; text-transform: uppercase; }
@keyframes hudScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

.poster-body {
  position: relative; z-index: 10; display: flex; flex-direction: column; gap: 0.5rem; flex: 1;
  transform-style: preserve-3d; max-width: 520px; perspective: 1200px; align-items: flex-start;
}
.poster-eyebrow { font-family: 'Courier New', monospace; font-size: 0.72rem; letter-spacing: 0.28em; color: var(--neon-yellow); transform: translateZ(8px); text-shadow: 0 0 8px var(--neon-yellow); text-transform: uppercase; }

.poster-title {
  font-size: clamp(2.2rem, 10vw, 3.5rem); font-weight: 900; color: #fff9db; position: relative; line-height: 1.1; cursor: pointer;
  display: inline-block; width: max-content; transform-origin: 50% 50%; transform: translateZ(15px) scale(1) rotateY(0deg);
  transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s; animation: titleOpticalJitter 3s infinite;
}
.poster-title.is-spinning {
  animation: titleSpin360 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
  color: #ffffff; text-shadow: 0 0 40px var(--neon-yellow), 0 0 80px #fff !important; letter-spacing: 0.2em !important;
}
@keyframes titleSpin360 { 0% { transform: translateZ(15px) scale(1) rotateY(0deg); } 50% { transform: translateZ(60px) scale(1.15) rotateY(180deg); } 100% { transform: translateZ(15px) scale(1) rotateY(360deg); } }
@keyframes titleOpticalJitter {
  0%   { text-shadow: 0 0 15px var(--neon-yellow), 0 0 30px rgba(252, 238, 10, 0.5); letter-spacing: 0.15em; }
  45%  { text-shadow: 0 0 25px var(--neon-yellow), 0 0 50px rgba(252, 238, 10, 0.8); letter-spacing: 0.18em; }
  48%  { text-shadow: 0 0 50px #fff, 0 0 80px var(--neon-yellow); letter-spacing: 0.18em; }
  50%  { text-shadow: 0 0 5px var(--neon-yellow); letter-spacing: 0.16em; }
  52%  { text-shadow: 0 0 60px #fff, 0 0 100px var(--neon-yellow); letter-spacing: 0.2em; }
  54%  { text-shadow: 0 0 10px rgba(252, 238, 10, 0.5); letter-spacing: 0.17em; }
  60%  { text-shadow: 0 0 15px var(--neon-yellow), 0 0 30px rgba(252, 238, 10, 0.5); letter-spacing: 0.15em; }
  100% { text-shadow: 0 0 15px var(--neon-yellow), 0 0 30px rgba(252, 238, 10, 0.5); letter-spacing: 0.15em; }
}
.poster-title::before { content: attr(data-text); position: absolute; top: 0; left: 4px; width: 100%; height: 100%; color: var(--neon-cyan); background: transparent; clip: rect(44px, 450px, 56px, 0); animation: glitch1 3s infinite linear alternate-reverse; pointer-events: none; text-shadow: -2px 0 10px rgba(0,243,255,0.8); transform: translateZ(-2px); }
.poster-title::after { content: attr(data-text); position: absolute; top: 0; left: -4px; width: 100%; height: 100%; color: var(--neon-pink); background: transparent; clip: rect(44px, 450px, 56px, 0); animation: glitch2 4s infinite linear alternate-reverse; pointer-events: none; text-shadow: 2px 0 10px rgba(255,0,124,0.8); transform: translateZ(-1px); }
@keyframes glitch1 { 0% { clip: rect(8px, 999px, 40px, 0); transform: translateX(3px) translateZ(-2px); } 20% { clip: rect(55px, 999px, 75px, 0); transform: translateX(-3px) translateZ(-2px); } 40% { clip: rect(10px, 999px, 20px, 0); transform: translateX(3px) translateZ(-2px); } 60% { clip: rect(0,0,0,0); } 100% { clip: rect(48px, 999px, 72px, 0); } }
@keyframes glitch2 { 0% { clip: rect(15px, 999px, 55px, 0); transform: translateX(-3px) translateZ(-1px); } 30% { clip: rect(0,0,0,0); } 60% { clip: rect(38px, 999px, 20px, 0); transform: translateX(3px) translateZ(-1px); } 100% { clip: rect(28px, 999px, 50px, 0); transform: translateX(-3px) translateZ(-1px); } }

.poster-subtitle {
  font-size: 1.1rem; letter-spacing: 0.22em; color: #ffaa00; border-left: 3px solid #ffaa00; padding-left: 0.75rem; font-family: inherit; transform: translateZ(8px); position: relative; display: inline-block; text-shadow: 0 0 8px rgba(255, 170, 0, 0.8), 0 0 15px rgba(255, 170, 0, 0.4); text-transform: uppercase; 
}
.poster-subtitle::before, .poster-subtitle::after { display: none; }

.poster-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, var(--neon-purple), transparent); opacity: 0.8; margin: 0.2rem 0; transform: translateZ(5px); box-shadow: 0 0 5px var(--neon-purple); }
.poster-desc { font-family: 'Courier New', monospace; font-size: 0.82rem; line-height: 2.0; color: var(--text-main); border-bottom: 1px solid rgba(0, 243, 255, 0.2); padding-bottom: 0.75rem; transform: translateZ(5px); }
.poster-scanbar { width: 75%; height: 6px; background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.3); border-radius: 0; overflow: visible; position: relative; transform: translateZ(5px); }
.poster-scanbar::before { content: ''; position: absolute; inset: 0; background-image: repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0, 243, 255, 0.2) 8px, rgba(0, 243, 255, 0.2) 9px); pointer-events: none; }
.poster-scanbar::after { content: ''; position: absolute; top: -3px; width: 3px; height: 12px; background: #ffffff; box-shadow: 0 0 8px var(--neon-cyan); animation: scanCursor 3s linear infinite; border-radius: 1px; }
@keyframes scanCursor { 0% { left: 0%; opacity: 1; } 95% { left: 100%; opacity: 1; } 96% { left: 100%; opacity: 0; } 99% { left: 0%; opacity: 0; } 100% { left: 0%; opacity: 1; } }
.poster-scanbar-fill { height: 100%; width: 100%; background: linear-gradient(90deg, transparent 0%, rgba(0, 243, 255, 0.8) 50%, transparent 100%); background-size: 200% 100%; animation: scanBeam 3s linear infinite; }
@keyframes scanBeam { 0% { background-position: 150% 0; } 100% { background-position: -50% 0; } }

/* 标题页底部操作区 */
.poster-actions { position: absolute; bottom: 20%; left: 50%; transform: translateX(-50%) translateZ(20px); display: flex; flex-direction: column; gap: 0.8rem; width: min(300px, 80vw); align-items: stretch; }
.poster-btn { width: 100%; padding: 0.85rem 1rem; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 0.95rem; font-weight: bold; letter-spacing: 0.25em; transition: all 0.1s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-align: center; text-transform: uppercase; transform: translateY(0); }
.poster-btn--primary { background: linear-gradient(180deg, rgba(255, 0, 124, 0.4) 0%, rgba(150, 0, 70, 0.8) 100%); border: 1px solid var(--neon-pink); border-top: 2px solid rgba(255, 100, 160, 0.9); color: #fff; text-shadow: 0 0 5px var(--neon-pink); box-shadow: 0 6px 0 rgba(100, 0, 40, 1), 0 10px 15px rgba(255, 0, 124, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.4); }
.poster-btn--primary:hover { background: linear-gradient(180deg, rgba(255, 0, 124, 0.6) 0%, rgba(200, 0, 90, 0.9) 100%); box-shadow: 0 6px 0 rgba(100, 0, 40, 1), 0 15px 25px rgba(255, 0, 124, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.6); }
.poster-btn--primary:active { transform: translateY(6px); box-shadow: 0 0 0 rgba(100, 0, 40, 1), 0 2px 10px rgba(255, 0, 124, 0.4), inset 0 4px 10px rgba(0, 0, 0, 0.6); }
.poster-btn--secondary { background: linear-gradient(180deg, rgba(0, 243, 255, 0.2) 0%, rgba(0, 120, 130, 0.6) 100%); border: 1px solid var(--neon-cyan); border-top: 2px solid rgba(150, 250, 255, 0.8); color: #fff; text-shadow: 0 0 5px var(--neon-cyan); box-shadow: 0 6px 0 rgba(0, 70, 80, 1), 0 10px 15px rgba(0, 243, 255, 0.2), inset 0 2px 5px rgba(255, 255, 255, 0.3); }
.poster-btn--secondary:hover:not(.disabled) { background: linear-gradient(180deg, rgba(0, 243, 255, 0.4) 0%, rgba(0, 150, 160, 0.8) 100%); box-shadow: 0 6px 0 rgba(0, 70, 80, 1), 0 15px 25px rgba(0, 243, 255, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.5); }
.poster-btn--secondary:active:not(.disabled) { transform: translateY(6px); box-shadow: 0 0 0 rgba(0, 70, 80, 1), 0 2px 10px rgba(0, 243, 255, 0.2), inset 0 4px 10px rgba(0, 0, 0, 0.6); }
.poster-btn--secondary.disabled { opacity: 0.6; cursor: not-allowed; transform: translateY(3px); background: rgba(0, 100, 120, 0.3); border-color: rgba(0, 243, 255, 0.4); border-top: 1px solid rgba(150, 250, 255, 0.3); color: rgba(255,255,255,0.6); text-shadow: none; box-shadow: 0 3px 0 rgba(0, 70, 80, 0.5), 0 0 10px rgba(0, 243, 255, 0.1); }

.poster-btn-icon { font-size: 0.65rem; opacity: 0.85; }
.poster-archive-hint { position: absolute; bottom: 15%; left: 50%; transform: translateX(-50%) translateZ(8px); font-family: 'Courier New', monospace; font-size: 0.55rem; color: var(--neon-yellow); letter-spacing: 0.12em; text-align: center; white-space: nowrap; opacity: 0.8; }
.poster-back { position: absolute; bottom: 8%; left: 50%; transform: translateX(-50%) translateZ(8px); background: linear-gradient(180deg, rgba(176, 38, 255, 0.15) 0%, rgba(80, 10, 120, 0.6) 100%); border: 1px solid var(--neon-purple); border-top: 1px solid rgba(220, 100, 255, 0.5); border-radius: 4px; padding: 0.4rem 1.2rem; color: #e0b0ff; font-family: inherit; font-size: 0.75rem; letter-spacing: 0.15em; cursor: pointer; white-space: nowrap; text-transform: uppercase; text-shadow: 0 0 3px var(--neon-purple); box-shadow: 0 4px 0 rgba(50, 0, 80, 1), 0 8px 10px rgba(176, 38, 255, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.2); transition: all 0.1s ease; }
.poster-back:hover { color: #fff; border-color: var(--neon-cyan); background: linear-gradient(180deg, rgba(176, 38, 255, 0.3) 0%, rgba(100, 20, 150, 0.8) 100%); text-shadow: 0 0 5px var(--neon-cyan); box-shadow: 0 4px 0 rgba(50, 0, 80, 1), 0 10px 15px rgba(0, 243, 255, 0.3), inset 0 1px 5px rgba(255, 255, 255, 0.4); }
.poster-back:active { transform: translateX(-50%) translateZ(8px) translateY(4px); box-shadow: 0 0 0 rgba(50, 0, 80, 1), 0 2px 5px rgba(0, 243, 255, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.6); }

/* ============================================================
背景介绍页
============================================================ */
.screen-intro { background: transparent !important; overflow: hidden; position: absolute; z-index: 1; }
.intro-topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.4rem; flex-shrink: 0; border-bottom: 1px solid var(--border-paper); background: rgba(5, 5, 10, 0.95); }
.intro-chapter-indicator { display: flex; gap: 7px; align-items: center; }
.chapter-dot { width: 20px; height: 3px; border-radius: 0; background: rgba(176, 38, 255, 0.3); transition: all 0.35s; }
.chapter-dot.active { background: var(--neon-cyan); width: 26px; box-shadow: 0 0 8px var(--neon-cyan); }
.intro-scroll-area { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.intro-scroll-area::-webkit-scrollbar { display: none; }
/* ============================================================
   背景介绍内容区：全息数据刷入动画
============================================================ */

.intro-reading-column { 
  max-width: 560px; margin: 0 auto; padding: 2rem 1.8rem 3.5rem; display: flex; flex-direction: column; 
  /* 每次翻页时触发高科技载入动画 */
  animation: holoDataLoad 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* 赛博朋克终端：伴随模糊、过曝和自上而下的扫描刷入感 */
@keyframes holoDataLoad {
  0% { 
    opacity: 0; 
    transform: translateY(15px); /* 从下方微微浮起 */
    filter: blur(5px) brightness(2); /* 初始过曝且模糊 */
    clip-path: inset(100% 0 0 0); /* 遮罩：让画面从上往下像扫描一样呈现 */
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
    filter: blur(0) brightness(1); /* 恢复清晰 */
    clip-path: inset(0 0 0 0); /* 完全展开 */
  }
}

.intro-chapter-tag { font-family: 'Courier New', monospace; font-size: 0.7rem; letter-spacing: 0.3em; color: var(--neon-yellow); margin-bottom: 1rem; text-shadow: 0 0 5px rgba(252, 238, 10, 0.5); }
.intro-lead { margin: 0 0 1.8rem 0; font-size: clamp(1.4rem, 5vw, 1.85rem); font-weight: bold; line-height: 1.55; color: #fff; letter-spacing: 0.05em; text-shadow: 0 0 10px var(--neon-cyan); }
.intro-body { display: flex; flex-direction: column; }
.intro-paragraph { margin: 0 0 1.1rem 0; font-size: 0.94rem; line-height: 2.1; color: var(--text-main); letter-spacing: 0.04em; text-indent: 2em; }
.intro-paragraph:last-of-type { margin-bottom: 0; }
.intro-blockquote { margin: 1.4rem 0; padding: 0.85rem 0 0.85rem 1.2rem; border-left: 3px solid var(--neon-pink); background: rgba(255, 0, 124, 0.05); border-radius: 0 4px 4px 0; font-size: 0.9rem; line-height: 2; color: #f5d0e3; font-style: italic; letter-spacing: 0.04em; text-indent: 0; }
.intro-footer-nav { display: flex; justify-content: flex-end; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--border-paper); }
.intro-next-btn { padding: 0.68rem 1.8rem; border-radius: 4px; background: rgba(0, 243, 255, 0.05); border: 1px solid var(--border-cyan); color: var(--neon-cyan); font-family: inherit; font-size: 0.85rem; letter-spacing: 0.18em; cursor: pointer; transition: all 0.25s; text-transform: uppercase; }
.intro-next-btn:hover { background: var(--neon-cyan); color: #000; box-shadow: 0 0 15px var(--neon-cyan); transform: translateX(4px); }

/* ============================================================
主界面 Hub (修复层级穿透与电信号)
============================================================ */
.screen-hub { background: transparent !important; overflow: hidden; display: flex; flex-direction: column; position: absolute; z-index: 1; }
.screen-hub::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: linear-gradient(180deg, transparent, var(--neon-cyan), #fff), linear-gradient(0deg, transparent, var(--neon-pink), #fff), linear-gradient(90deg, transparent, var(--neon-cyan), #fff), linear-gradient(-90deg, transparent, var(--neon-yellow), #fff); background-size: 3px 30vh, 3px 30vh, 30vw 3px, 30vw 3px; background-repeat: no-repeat; animation: electricPulses 4s infinite linear; opacity: 0.85; }
@keyframes electricPulses { 0% { background-position: 10% -30vh, 90% 130vh, -30vw 80%, 130vw 20%; } 100% { background-position: 10% 130vh, 90% -30vh, 130vw 80%, -30vw 20%; } }
.screen-hub::after { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(circle at 65% 25%, rgba(0, 243, 255, 0.25) 0%, transparent 35%), radial-gradient(circle at 25% 65%, rgba(255, 0, 124, 0.25) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(252, 238, 10, 0.15) 0%, transparent 50%); animation: signalFlicker 4s infinite; mix-blend-mode: screen; }
@keyframes signalFlicker { 0%, 100% { opacity: 0.1; } 2%, 4% { opacity: 1; } 5%, 15% { opacity: 0.2; } 16%, 18% { opacity: 0.8; } 19%, 50% { opacity: 0.1; } 51%, 53% { opacity: 0.9; } 54%, 80% { opacity: 0.2; } 81%, 84% { opacity: 0.6; } 85%, 99% { opacity: 0.1; } }

.hub-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; flex-shrink: 0; background: transparent; border-bottom: none; gap: 1rem; box-shadow: none; position: relative; z-index: 10; }
.hub-profile-card { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; flex: 1; min-width: 0; padding: 0.35rem 0.8rem 0.35rem 0.35rem; background: linear-gradient(135deg, rgba(0, 243, 255, 0.1) 0%, rgba(5, 8, 12, 0.85) 100%); border: 1px solid rgba(0, 243, 255, 0.3); border-left: 3px solid var(--neon-cyan); border-radius: 4px; clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(0, 243, 255, 0.05); transition: all 0.3s ease; position: relative; overflow: hidden; }
.hub-profile-card::before { content: 'ID.CARD'; position: absolute; right: 25px; top: -8px; font-size: 2.5rem; color: rgba(0, 243, 255, 0.04); font-family: 'Courier New', monospace; font-weight: 900; pointer-events: none; }
.hub-profile-card:hover { border-color: var(--neon-cyan); background: linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(5, 8, 12, 0.95) 100%); box-shadow: 0 0 20px rgba(0, 243, 255, 0.2), inset 0 0 20px rgba(0, 243, 255, 0.1); transform: translateY(-1px); }
.hub-profile-avatar { width: 44px; height: 44px; border-radius: 2px; border: 1px solid var(--neon-cyan); display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.8); color: var(--neon-cyan); font-size: 1.1rem; flex-shrink: 0; overflow: hidden; box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); position: relative; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.hub-profile-avatar::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); animation: avatarScan 3s linear infinite; pointer-events: none; }
@keyframes avatarScan { 0% { top: -5px; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
.hub-profile-info { display: flex; flex-direction: row; align-items: center; gap: 0.4rem; min-width: 0; flex: 1; position: relative; z-index: 1; }
.hub-profile-name { font-size: 0.95rem; color: #ffffff; letter-spacing: 0.05em; white-space: nowrap; overflow: visible; font-weight: bold; text-shadow: 0 0 5px rgba(255,255,255,0.4); }
.hub-profile-credits { font-family: 'Courier New', monospace; font-size: 0.85rem; color: var(--neon-yellow); letter-spacing: 0.05em; font-weight: bold; text-shadow: 0 0 5px rgba(252, 238, 10, 0.5); display: flex; align-items: center; white-space: nowrap; flex-shrink: 0; }
.hub-profile-credits::before { content: ''; display: inline-block; width: 1px; height: 12px; background: rgba(0, 243, 255, 0.4); margin-right: 0.4rem; }
.hub-profile-arrow { color: var(--neon-cyan); font-size: 1.2rem; flex-shrink: 0; animation: arrowPulse 2s infinite alternate; }
@keyframes arrowPulse { 0% { transform: translateX(0); opacity: 0.5; text-shadow: none; } 100% { transform: translateX(3px); opacity: 1; text-shadow: 0 0 8px var(--neon-cyan); } }

.hub-body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 0.85rem 1rem 1.2rem; gap: 0.65rem; overflow-y: auto; scrollbar-width: none; }
.hub-body::-webkit-scrollbar { display: none; }

.hub-environment-card { background: var(--bg-card); border-radius: 6px; border: 1px solid var(--neon-purple); border-left: 4px solid var(--neon-purple); box-shadow: var(--shadow-sm); padding: 0.7rem 0.9rem; display: flex; flex-direction: column; gap: 0.2rem; flex-shrink: 0; }
.hub-env-label { font-family: 'Courier New', monospace; font-size: 0.58rem; letter-spacing: 0.2em; color: var(--neon-yellow); text-shadow: 0 0 3px rgba(252,238,10,0.5);}
.hub-env-desc { font-size: 0.8rem; color: var(--text-main); line-height: 1.7; }

/* 3D全息雷达巨型居中版 */
.hub-action-grid { display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; padding: 0 0 0 1.2rem; margin-top: 3rem; width: 100%; flex-shrink: 0; position: relative; perspective: 1000px; transform-style: preserve-3d; cursor: crosshair; }
.hub-action-grid::before { content: ''; position: absolute; left: 58%; top: 120%; width: 280px; height: 280px; margin-top: -140px; margin-left: -140px; border-radius: 50%; border: 3px solid rgba(0, 243, 255, 0.4); border-top: 3px dashed rgba(0, 243, 255, 0.7); background: radial-gradient(circle, transparent 30%, rgba(0, 243, 255, 0.15) 31%, transparent 32%), radial-gradient(circle, transparent 60%, rgba(0, 243, 255, 0.15) 61%, transparent 62%), linear-gradient(rgba(0, 243, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.15) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 20px 20px, 20px 20px; box-shadow: 0 0 50px rgba(0, 243, 255, 0.15), inset 0 0 60px rgba(0, 243, 255, 0.2); animation: holoFloorSpin 18s linear infinite; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 0; pointer-events: none; }
.hub-action-grid::after { content: ''; position: absolute; left: 58%; top: 120%; width: 140px; height: 140px; margin-top: -210px; margin-left: -70px; border-radius: 50%; border: 5px solid var(--neon-pink); border-left-color: transparent; border-right-color: transparent; background: radial-gradient(circle, rgba(255, 0, 124, 0.3) 0%, transparent 65%); box-shadow: 0 0 40px var(--neon-pink), inset 0 0 30px var(--neon-pink), 0 70px 50px -10px rgba(255, 0, 124, 0.3); animation: holoCoreSpin 6s linear infinite; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 1; pointer-events: none; }
.hub-action-grid:hover::before { box-shadow: 0 0 80px rgba(0, 243, 255, 0.3), inset 0 0 100px rgba(0, 243, 255, 0.4); background-size: 100% 100%, 100% 100%, 25px 25px, 25px 25px; }
.hub-action-grid:hover::after { margin-top: -240px; box-shadow: 0 0 60px var(--neon-pink), inset 0 0 50px var(--neon-pink), 0 100px 60px -10px rgba(255, 0, 124, 0.4); }
.hub-action-grid:active::before { border-color: var(--neon-pink); background: radial-gradient(circle, transparent 30%, rgba(255, 0, 124, 0.2) 31%, transparent 32%), radial-gradient(circle, transparent 60%, rgba(255, 0, 124, 0.2) 61%, transparent 62%), linear-gradient(rgba(255, 0, 124, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 124, 0.25) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 20px 20px, 20px 20px; box-shadow: 0 0 100px rgba(255, 0, 124, 0.4), inset 0 0 100px rgba(255, 0, 124, 0.4); width: 240px; height: 240px; margin-top: -120px; margin-left: -120px; }
.hub-action-grid:active::after { margin-top: -130px; width: 160px; height: 160px; margin-left: -80px; border-color: var(--neon-cyan); border-top-color: transparent; border-bottom-color: transparent; background: radial-gradient(circle, rgba(0, 243, 255, 0.5) 0%, transparent 65%); box-shadow: 0 0 80px var(--neon-cyan), inset 0 0 60px var(--neon-cyan); }
@keyframes holoFloorSpin { 0% { transform: rotateX(70deg) rotateZ(0deg); } 100% { transform: rotateX(70deg) rotateZ(360deg); } }
@keyframes holoCoreSpin { 0% { transform: rotateX(70deg) rotateZ(360deg); } 100% { transform: rotateX(70deg) rotateZ(0deg); } }

.hub-action-btn { width: 44px; height: 44px; padding: 0; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-cyan); box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 5; }
.hub-action-btn:hover { border-color: var(--neon-cyan); transform: translateY(-2px); background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 15px rgba(0, 243, 255, 0.4); }
.hub-action-btn:active { transform: translateY(0); }
.hub-action-icon { font-size: 1.8rem; line-height: 1; color: var(--neon-cyan); filter: drop-shadow(0 0 5px rgba(0, 243, 255, 0.5)); }
.hub-action-label { position: absolute; left: 100%; top: 50%; transform: translateY(-50%) translateX(8px); margin-top: 0; background: var(--panel-bg); border: 1px solid var(--neon-cyan); color: #fff; padding: 0.35rem 0.7rem; border-radius: 4px; font-size: 0.75rem; letter-spacing: 0.1em; white-space: nowrap; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 10; box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); text-transform: uppercase; }
.hub-action-label::before { content: ''; position: absolute; right: 100%; top: 50%; transform: translateY(-50%); border: 5px solid transparent; border-right-color: var(--neon-cyan); }
.hub-action-btn:hover .hub-action-label { opacity: 1; transform: translateY(-50%) translateX(0); }
.hub-action-badge { position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 4px; background: var(--neon-pink); color: #ffffff; font-size: 0.6rem; font-family: 'Courier New', monospace; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(255, 0, 124, 0.4); z-index: 2; }


/* ============================================================
   主界面：接待患者按钮 (升级为机械立体质感)
============================================================ */
.hub-reception-area { display: flex; flex-direction: column; align-items: center; gap: 0.45rem; flex-shrink: 0; padding: 0 1rem; margin-top: 12rem; margin-bottom: 1rem; }

.hub-reception-btn { 
  width: 85%; padding: 0.9rem 1.5rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; 
  font-family: inherit; font-size: 0.95rem; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; 
  transition: all 0.1s ease; /* 极速响应，提升物理按压手感 */
  transform: translateY(0); 

  /* 立体化材质：粉色渐变与顶部高光 */
  background: linear-gradient(180deg, rgba(255, 0, 124, 0.4) 0%, rgba(150, 0, 70, 0.8) 100%); 
  border: 1px solid var(--neon-pink); 
  border-top: 2px solid rgba(255, 100, 160, 0.9); 
  color: #fff; text-shadow: 0 0 5px var(--neon-pink); 

  /* 立体物理厚度与环境发光 */
  box-shadow: 
    0 6px 0 rgba(100, 0, 40, 1), 
    0 10px 15px rgba(255, 0, 124, 0.4), 
    inset 0 2px 5px rgba(255, 255, 255, 0.4); 
}

/* 悬停状态：变亮 */
.hub-reception-btn:hover:not(.disabled) { 
  background: linear-gradient(180deg, rgba(255, 0, 124, 0.6) 0%, rgba(200, 0, 90, 0.9) 100%); 
  box-shadow: 
    0 6px 0 rgba(100, 0, 40, 1), 
    0 15px 25px rgba(255, 0, 124, 0.6), 
    inset 0 2px 8px rgba(255, 255, 255, 0.6); 
}

/* 点击状态：厚度消失，按钮下陷 */
.hub-reception-btn:active:not(.disabled) { 
  transform: translateY(6px); /* 向下位移吃掉厚度 */
  box-shadow: 
    0 0 0 rgba(100, 0, 40, 1), 
    0 2px 10px rgba(255, 0, 124, 0.4), 
    inset 0 4px 10px rgba(0, 0, 0, 0.6); 
}

/* 禁用状态：半陷落，无光泽 */
.hub-reception-btn.disabled { 
  opacity: 0.6; cursor: not-allowed; 
  transform: translateY(3px); /* 视觉上卡在半按下的位置 */
  background: rgba(100, 0, 40, 0.5); 
  border-color: rgba(255, 0, 124, 0.4); 
  border-top: 1px solid rgba(255, 100, 160, 0.3); 
  color: rgba(255,255,255,0.6); text-shadow: none; 
  box-shadow: 
    0 3px 0 rgba(100, 0, 40, 0.5), 
    0 0 10px rgba(255, 0, 124, 0.1); 
}

.hub-reception-icon { font-size: 0.85rem; opacity: 0.85; }
.hub-reception-hint { font-size: 0.72rem; color: var(--neon-yellow); letter-spacing: 0.1em; text-align: center; font-family: 'Courier New', monospace; opacity: 0.8; }


/* ============================================================
弹窗 (高级全息质感)
============================================================ */
.modal-overlay { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 60; padding: 1rem; }
.modal-card { width: min(400px, calc(100vw - 2rem)); border-radius: 4px; padding: 1.4rem; background: linear-gradient(135deg, rgba(5, 8, 15, 0.95) 0%, rgba(10, 20, 35, 0.98) 100%); border: 1px solid rgba(0, 243, 255, 0.2); border-top: 3px solid var(--neon-cyan); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 243, 255, 0.1), inset 0 0 20px rgba(0, 243, 255, 0.05); display: flex; flex-direction: column; gap: 0.85rem; position: relative; }
.modal-card::before { content: ''; position: absolute; top: -3px; left: -1px; width: 15px; height: 15px; border-top: 3px solid #fff; border-left: 3px solid #fff; box-shadow: -2px -2px 8px var(--neon-cyan); pointer-events: none; z-index: 10; }
.modal-card::after { content: ''; position: absolute; bottom: -1px; right: -1px; width: 15px; height: 15px; border-bottom: 3px solid var(--neon-cyan); border-right: 3px solid var(--neon-cyan); box-shadow: 2px 2px 8px var(--neon-cyan); pointer-events: none; z-index: 10; }
.profile-modal { width: min(520px, calc(100vw - 2rem)); }
.phone-modal   { width: min(460px, calc(100vw - 2rem)); }
.hub-modal-card { width: min(420px, calc(100vw - 2rem)); max-height: 75vh; }
.modal-kicker { font-family: 'Courier New', monospace; font-size: 0.6rem; letter-spacing: 0.22em; color: var(--neon-yellow); text-transform: uppercase; text-shadow: 0 0 5px rgba(252,238,10,0.5); }
.modal-title { font-size: 1.3rem; color: #fff; letter-spacing: 0.1em; text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px rgba(0,243,255,0.5); text-transform: uppercase; font-weight: bold; }
.modal-text  { margin: 0; font-size: 0.84rem; color: #d1e8f5; line-height: 1.88; text-shadow: 0 0 2px rgba(255,255,255,0.2); }
.modal-empty { font-size: 0.8rem; color: rgba(255,255,255,0.4); line-height: 1.75; text-align: center;}
.modal-actions { display: flex; gap: 0.65rem; flex-wrap: wrap; margin-top: 0.2rem; }

.hub-modal-scroll { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; display: flex; flex-direction: column; gap: 0.6rem; padding: 0.1rem 0; }
.hub-modal-scroll::-webkit-scrollbar { display: none; }
.hub-modal-list { display: flex; flex-direction: column; }
.hub-modal-row { font-size: 0.8rem; color: #e0f2fe; line-height: 1.75; padding: 0.6rem 0.5rem; background: linear-gradient(90deg, rgba(0, 243, 255, 0.05) 0%, transparent 100%); box-shadow: inset 2px 0 0 var(--neon-cyan); border-bottom: 1px solid rgba(0, 243, 255, 0.15); font-family: 'Courier New', monospace; }
.hub-modal-row:last-child { border-bottom: none; }
.hub-modal-count { font-size: 0.68rem; color: var(--neon-yellow); font-family: 'Courier New', monospace; margin-left: 0.5rem; letter-spacing: 0.08em; text-shadow: 0 0 5px rgba(252,238,10,0.5);}

.revisit-row { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.5rem; background: linear-gradient(90deg, rgba(255, 0, 124, 0.05) 0%, transparent 100%); box-shadow: inset 2px 0 0 var(--neon-pink); border-bottom: 1px solid rgba(255, 0, 124, 0.15); gap: 0.5rem; }
.revisit-row:last-child { border-bottom: none; }
.revisit-row-left { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.revisit-name { font-size: 0.88rem; color: #fff; letter-spacing: 0.05em; text-shadow: 0 0 3px rgba(255,255,255,0.4);}
.revisit-job { font-size: 0.7rem; color: var(--text-muted); }
.revisit-day { font-family: 'Courier New', monospace; font-size: 0.72rem; color: var(--neon-cyan); white-space: nowrap; flex-shrink: 0; }
.revisit-day.due { color: var(--neon-pink); font-weight: bold; text-shadow: 0 0 8px var(--neon-pink); }

.equipment-group { display: flex; flex-direction: column; gap: 0.4rem; }
.equipment-group-name { font-size: 0.76rem; color: var(--neon-cyan); font-weight: bold; letter-spacing: 0.06em; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(0, 243, 255, 0.4); text-transform: uppercase; text-shadow: 0 0 5px var(--neon-cyan); }
.equipment-module-list { display: flex; flex-direction: column; gap: 0.28rem; }
.equipment-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.76rem; color: #d1e8f5; padding: 0.3rem 0.5rem; background: rgba(0,0,0,0.3); border-radius: 2px; }
.equipment-row:hover { background: rgba(0, 243, 255, 0.08); }
.eq-label { flex: 1; text-shadow: 0 0 2px rgba(255,255,255,0.3);}
.eq-level { font-family: 'Courier New', monospace; color: var(--neon-yellow); min-width: 2.5rem; text-shadow: 0 0 5px rgba(252,238,10,0.6); font-weight: bold;}
.eq-upgrade-btn { padding: 0.2rem 0.55rem; border-radius: 4px; border: 1px solid var(--neon-pink); background: rgba(255, 0, 124, 0.1); color: var(--neon-pink); font-family: inherit; font-size: 0.66rem; cursor: pointer; white-space: nowrap; transition: all 0.1s; text-transform: uppercase; box-shadow: inset 0 0 5px rgba(255, 0, 124, 0.2); }
.eq-upgrade-btn:hover:not(:disabled) { background: var(--neon-pink); color: #fff; box-shadow: 0 0 10px var(--neon-pink); transform: translateY(-1px); }
.eq-upgrade-btn:active:not(:disabled) { transform: translateY(1px); }
.eq-upgrade-btn:disabled { opacity: 0.4; cursor: not-allowed; border-style: dashed; color: rgba(255,0,124,0.6); background: transparent; box-shadow: none; }

.phone-message-list { display: flex; flex-direction: column; gap: 0.62rem; max-height: min(50vh, 450px); overflow-y: auto; scrollbar-width: none; }
.phone-message-list::-webkit-scrollbar { display: none; }
.phone-message-item { display: flex; flex-direction: column; gap: 0.3rem; padding: 0.78rem 0.88rem; border-radius: 4px; background: linear-gradient(135deg, rgba(0, 243, 255, 0.05) 0%, rgba(0,0,0,0.6) 100%); border: 1px solid rgba(0, 243, 255, 0.2); transition: all 0.18s; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.phone-message-item.unread { border-color: var(--neon-cyan); background: linear-gradient(135deg, rgba(0, 243, 255, 0.15) 0%, rgba(0,0,0,0.8) 100%); box-shadow: 0 0 15px rgba(0, 243, 255, 0.15), inset 0 0 10px rgba(0, 243, 255, 0.1); }
.phone-message-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-family: 'Courier New', monospace; font-size: 0.68rem; }
.phone-message-head strong { color: var(--neon-cyan); text-shadow: 0 0 5px var(--neon-cyan); font-size: 0.8rem;}
.phone-message-head span  { color: var(--neon-yellow); opacity: 0.8; }
.phone-message-body { font-size: 0.8rem; color: #e0f2fe; line-height: 1.75; }

.profile-modal-head { display: flex; gap: 0.9rem; align-items: center; margin-top: 0.3rem; }
.profile-avatar-wrap { width: 60px; height: 60px; border-radius: 4px; border: 1.5px solid var(--neon-cyan); display: flex; align-items: center; justify-content: center; background: rgba(0, 243, 255, 0.1); color: var(--neon-cyan); font-size: 1.3rem; flex-shrink: 0; overflow: hidden; cursor: pointer; box-shadow: 0 0 15px rgba(0,243,255,0.3); position: relative; }
.profile-avatar-wrap::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); animation: avatarScan 3s linear infinite; pointer-events: none; }
.profile-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.profile-modal-meta { display: flex; flex-direction: column; gap: 0.55rem; flex: 1; }
.profile-input { width: 100%; border-radius: 4px; border: 1px solid rgba(0, 243, 255, 0.3); background: rgba(0,0,0,0.6); color: #fff; padding: 0.58rem 0.75rem; font-family: inherit; font-size: 0.88rem; transition: all 0.2s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.8); }
.profile-input:focus { outline: none; border-color: var(--neon-cyan); background: rgba(0, 243, 255, 0.05); box-shadow: 0 0 10px rgba(0,243,255,0.2), inset 0 2px 5px rgba(0,0,0,0.8); }
.modal-stats-row { display: flex; gap: 0.55rem; }
.modal-stat { flex: 1; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0, 243, 255, 0.05) 100%); border: 1px solid rgba(0, 243, 255, 0.2); border-bottom: 2px solid var(--neon-cyan); border-radius: 4px; padding: 0.65rem 0.7rem; text-align: center; }
.modal-stat-label { font-size: 0.6rem; color: var(--neon-cyan); letter-spacing: 0.1em; font-family: 'Courier New', monospace; text-transform: uppercase; opacity: 0.8; }
.modal-stat-val { font-size: 1.2rem; color: #fff; font-family: 'Courier New', monospace; font-weight: bold; margin-top: 0.2rem; text-shadow: 0 0 10px var(--neon-cyan); }

/* ============================================================
患者档案页 (高级面板与毛玻璃切角)
============================================================ */
.screen-patient-records { background: transparent !important; overflow: hidden; position: absolute; z-index: 1; }
.pr-scroll-area { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding: 1rem 1.1rem 3rem; display: flex; flex-direction: column; gap: 0.7rem; }
.pr-scroll-area::-webkit-scrollbar { display: none; }
.pr-list-header { font-family: 'Courier New', monospace; font-size: 0.6rem; letter-spacing: 0.25em; color: var(--neon-yellow); padding-bottom: 0.5rem; border-bottom: 1px solid rgba(252, 238, 10, 0.3); }
.pr-empty { text-align: center; font-size: 0.78rem; color: rgba(255,255,255,0.4); letter-spacing: 0.12em; padding: 2.5rem 0; font-family: 'Courier New', monospace; }
.pr-list { display: flex; flex-direction: column; gap: 0.6rem; }
.pr-card { background: var(--bg-card); border-radius: 6px; border: 1px solid var(--border-cyan); box-shadow: var(--shadow-sm); padding: 0.95rem 1.05rem; cursor: pointer; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; flex-direction: column; gap: 0.32rem; position: relative; overflow: hidden; }
.pr-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--neon-cyan); border-radius: 0 2px 2px 0; opacity: 0.5; transition: opacity 0.2s; }
.pr-card:hover { transform: translateY(-2px) translateX(2px); border-color: var(--neon-cyan); box-shadow: 0 0 15px rgba(0, 243, 255, 0.2); background: linear-gradient(90deg, rgba(0,243,255,0.05), transparent); }
.pr-card:hover::before { opacity: 1; box-shadow: 0 0 10px var(--neon-cyan); }
.pr-card-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.pr-outcome-tag { font-family: 'Courier New', monospace; font-size: 0.6rem; letter-spacing: 0.1em; padding: 0.18rem 0.55rem; border-radius: 2px; border: 1px solid var(--neon-green); background: rgba(57, 255, 20, 0.05); color: var(--neon-green); }
.pr-outcome-tag.partial, .pr-outcome-tag.revisit { border-color: var(--neon-pink); background: rgba(255, 0, 124, 0.05); color: var(--neon-pink); }
.pr-card-day { font-family: 'Courier New', monospace; font-size: 0.62rem; color: var(--neon-cyan); letter-spacing: 0.1em; }
.pr-card-name { font-size: 1.15rem; color: #fff; letter-spacing: 0.08em; line-height: 1.2; text-shadow: 0 0 5px rgba(255,255,255,0.3); }
.pr-card-meta { display: flex; align-items: center; gap: 0.28rem; font-size: 0.75rem; color: var(--text-muted); flex-wrap: wrap; }
.pr-dot { color: var(--border-cyan); }
.pr-income { color: var(--neon-yellow); font-family: 'Courier New', monospace; }
.pr-card-divider { height: 1px; background: linear-gradient(90deg, var(--border-cyan), transparent); margin: 0.05rem 0; }
.pr-card-preview { font-size: 0.78rem; color: var(--text-main); line-height: 1.65; letter-spacing: 0.03em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pr-card-enter { font-size: 0.65rem; color: var(--border-cyan); letter-spacing: 0.1em; text-align: right; opacity: 0; transition: opacity 0.2s; font-family: 'Courier New', monospace; }
.pr-card:hover .pr-card-enter { opacity: 1; color: var(--neon-cyan); }

.pr-detail-header { position: relative; background: linear-gradient(180deg, rgba(176, 38, 255, 0.15) 0%, rgba(10, 15, 25, 0.85) 100%); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 6px; border: 1px solid rgba(176, 38, 255, 0.3); border-top: 3px solid var(--neon-purple); padding: 1.1rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), inset 0 10px 20px rgba(176, 38, 255, 0.05); display: flex; flex-direction: column; gap: 0.28rem; overflow: hidden; }
.pr-detail-header::before { content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none; background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(176, 38, 255, 0.05) 2px, rgba(176, 38, 255, 0.05) 4px); }
.pr-detail-name, .pr-detail-meta, .pr-detail-income { position: relative; z-index: 1; }
.pr-detail-name { font-size: 1.4rem; color: #fff; letter-spacing: 0.12em; text-shadow: 0 0 10px var(--neon-purple), 0 0 20px rgba(176, 38, 255, 0.5); font-weight: bold; }
.pr-detail-meta { display: flex; align-items: center; gap: 0.28rem; font-size: 0.75rem; color: #a1b8ce; flex-wrap: wrap; font-family: 'Courier New', monospace; }
.pr-detail-income { font-family: 'Courier New', monospace; font-size: 0.72rem; color: var(--neon-yellow); letter-spacing: 0.08em; margin-top: 0.1rem; text-shadow: 0 0 5px rgba(252,238,10,0.6); }

.pr-section-title { font-family: 'Courier New', monospace; font-size: 0.6rem; letter-spacing: 0.25em; color: var(--neon-yellow); padding-bottom: 0.38rem; border-bottom: 1px solid rgba(252, 238, 10, 0.3); margin-top: 0.2rem; text-shadow: 0 0 3px rgba(252,238,10,0.5); }
.pr-text-card { position: relative; background: linear-gradient(135deg, rgba(0, 243, 255, 0.08) 0%, rgba(5, 8, 12, 0.9) 100%); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-radius: 4px; border: 1px solid rgba(0, 243, 255, 0.25); border-left: 3px solid var(--neon-cyan); padding: 0.85rem 1rem; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0, 243, 255, 0.05); font-size: 0.86rem; color: #e0f2fe; line-height: 1.9; letter-spacing: 0.03em; overflow: hidden; }
.pr-text-card::after { content: ''; position: absolute; top: 0; right: 0; width: 24px; height: 24px; background: linear-gradient(225deg, rgba(0, 243, 255, 0.45) 50%, transparent 50%); pointer-events: none; }
.pr-story p { margin: 0 0 0.5rem 0; font-size: 0.86rem; color: #e0f2fe; line-height: 1.95; letter-spacing: 0.04em; text-indent: 2em; text-shadow: 0 0 2px rgba(255,255,255,0.2); }
.pr-story p:last-child { margin-bottom: 0; }

.pr-consult-list { display: flex; flex-direction: column; gap: 0.5rem; }
.pr-consult-entry { position: relative; background: linear-gradient(135deg, rgba(0, 243, 255, 0.06) 0%, rgba(5, 8, 12, 0.85) 100%); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-radius: 4px; border: 1px solid rgba(0, 243, 255, 0.25); border-left: 3px solid var(--neon-cyan); padding: 0.75rem 0.95rem; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.05); display: flex; flex-direction: column; gap: 0.45rem; overflow: hidden; }
.pr-consult-entry::after { content: ''; position: absolute; top: 0; right: 0; width: 16px; height: 16px; background: linear-gradient(225deg, rgba(0, 243, 255, 0.5) 50%, transparent 50%); pointer-events: none; }
.pr-consult-entry.entry-doctor { background: linear-gradient(135deg, rgba(255, 0, 124, 0.06) 0%, rgba(5, 8, 12, 0.85) 100%); border-color: rgba(255, 0, 124, 0.25); border-left-color: var(--neon-pink); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 0, 124, 0.05); }
.pr-consult-entry.entry-doctor::after { background: linear-gradient(225deg, rgba(255, 0, 124, 0.5) 50%, transparent 50%); }
.pr-consult-entry.entry-narration { background: linear-gradient(135deg, rgba(252, 238, 10, 0.06) 0%, rgba(5, 8, 12, 0.85) 100%); border-color: rgba(252, 238, 10, 0.25); border-left-color: var(--neon-yellow); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(252, 238, 10, 0.05); }
.pr-consult-entry.entry-narration::after { background: linear-gradient(225deg, rgba(252, 238, 10, 0.5) 50%, transparent 50%); }

.pr-entry-label { font-family: 'Courier New', monospace; font-size: 0.6rem; letter-spacing: 0.15em; color: var(--neon-cyan); display: block; padding-bottom: 0.35rem; border-bottom: 1px dashed rgba(0, 243, 255, 0.3); }
.pr-consult-entry.entry-doctor .pr-entry-label { color: var(--neon-pink); border-bottom-color: rgba(255, 0, 124, 0.3); }
.pr-consult-entry.entry-narration .pr-entry-label { color: var(--neon-yellow); border-bottom-color: rgba(252, 238, 10, 0.3); }
.pr-entry-text p { margin: 0 0 0.35rem 0; font-size: 0.84rem; color: #ffffff; line-height: 1.9; letter-spacing: 0.03em; text-shadow: 0 0 2px rgba(255,255,255,0.2); }
.pr-entry-text p:last-child { margin-bottom: 0; }
.pr-consult-entry.entry-narration .pr-entry-text p { color: var(--neon-yellow); opacity: 0.9; font-style: italic; text-shadow: 0 0 3px rgba(252,238,10,0.4); }
.pr-consult-entry.entry-doctor .pr-entry-text p { color: var(--neon-pink); text-shadow: 0 0 3px rgba(255,0,124,0.4); }

.pr-changelog { background: linear-gradient(135deg, rgba(0, 243, 255, 0.05) 0%, rgba(5, 8, 12, 0.9) 100%); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-radius: 4px; border: 1px solid rgba(0, 243, 255, 0.25); padding: 0.75rem 1rem; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; }
.pr-changelog-item { font-size: 0.78rem; color: #e0f2fe; line-height: 1.75; padding: 0.32rem 0; border-bottom: 1px dashed rgba(0, 243, 255, 0.2); font-family: 'Courier New', monospace; }
.pr-changelog-item:last-child { border-bottom: none; }
.pr-changelog-item:first-child { padding-top: 0; }

/* ============================================================
问诊页
============================================================ */
.screen-consult { background: transparent !important; overflow: hidden; position: absolute; z-index: 1; }
.consult-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.72rem 1.1rem; flex-shrink: 0; background: var(--panel-bg); border-bottom: 1px solid var(--neon-purple); box-shadow: 0 2px 10px rgba(176, 38, 255, 0.15); gap: 0.7rem; position: relative; z-index: 10; }
.consult-frame { flex: 1; min-height: 0; margin: 0.7rem 0.9rem 0.9rem; border-radius: 6px; border: 1px solid var(--neon-cyan); background: var(--bg-card); box-shadow: 0 0 20px rgba(0, 243, 255, 0.1), inset 0 0 15px rgba(0, 243, 255, 0.05); display: flex; flex-direction: column; overflow: hidden; position: relative; }
.consult-frame::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,243,255,0.03) 2px, rgba(0,243,255,0.03) 4px); }
.frame-header { display: flex; align-items: center; justify-content: center; gap: 0.65rem; padding: 0.52rem 1rem; background: rgba(0, 243, 255, 0.05); border-bottom: 1px solid var(--neon-cyan); flex-shrink: 0; position: relative; z-index: 2; }
.frame-title { font-family: 'Courier New', monospace; font-size: 0.62rem; letter-spacing: 0.3em; color: var(--neon-cyan); text-shadow: 0 0 5px var(--neon-cyan); text-transform: uppercase; }
.frame-orn { font-size: 0.38rem; color: var(--border-cyan); }
.patient-info-bar { padding: 0.55rem 1.05rem 0.5rem; border-bottom: 1px dashed var(--border-cyan); flex-shrink: 0; display: flex; flex-direction: column; gap: 0.18rem; position: relative; z-index: 2; }
.patient-name-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.28rem; font-size: 0.9rem; }
.patient-name { color: var(--neon-cyan); font-weight: bold; font-family: 'Courier New', monospace; text-shadow: 0 0 5px var(--neon-cyan); }
.patient-sep  { color: var(--border-cyan); }
.patient-job  { color: #fff; }
.patient-visit { color: var(--neon-purple); font-family: 'Courier New', monospace; font-size: 0.82rem; }
.patient-env-row { font-size: 0.83rem; color: var(--text-muted); line-height: 1.6; }
.history-toggle-btn { display: flex; align-items: center; gap: 0.38rem; padding: 0.32rem 1.05rem; background: rgba(0, 243, 255, 0.05); border: none; border-bottom: 1px dashed var(--border-cyan); cursor: pointer; color: var(--neon-cyan); font-family: inherit; font-size: 0.68rem; letter-spacing: 0.08em; transition: all 0.18s; flex-shrink: 0; width: 100%; text-align: left; position: relative; z-index: 2; }
.history-toggle-btn:hover { color: #fff; background: rgba(0, 243, 255, 0.1); }
.toggle-icon { font-size: 0.62rem; color: var(--neon-cyan); }
.frame-content { flex: 1; min-height: 0; overflow-y: auto; padding: 0.9rem 1.05rem; display: flex; flex-direction: column; gap: 0.95rem; scrollbar-width: none; position: relative; z-index: 2; }
.frame-content::-webkit-scrollbar { display: none; }
.history-divider { display: flex; align-items: center; gap: 0.55rem; padding: 0.35rem 0; flex-shrink: 0; }
.hd-line { flex: 1; height: 1px; background: var(--border-cyan); }
.hd-text { font-size: 0.58rem; color: var(--neon-cyan); letter-spacing: 0.2em; white-space: nowrap; font-family: 'Courier New', monospace; }
.entry-narration p { margin: 0 0 0.38rem 0; font-size: 0.86rem; line-height: 1.95; color: var(--neon-yellow); opacity: 0.9; font-style: italic; letter-spacing: 0.03em; }
.entry-narration p:last-child { margin-bottom: 0; }
.entry-patient p { margin: 0 0 0.38rem 0; font-size: 0.92rem; line-height: 2; color: #fff; letter-spacing: 0.04em; }
.entry-patient p:last-child { margin-bottom: 0; }
.entry-doctor { font-size: 0.8rem; color: var(--neon-pink); display: flex; align-items: flex-start; gap: 0.38rem; letter-spacing: 0.03em; line-height: 1.7; text-shadow: 0 0 3px rgba(255,0,124,0.4); }
.entry-doctor-arrow { color: var(--neon-pink); flex-shrink: 0; font-size: 0.68rem; margin-top: 0.14rem; }
.frame-empty-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
.frame-empty-text { font-size: 0.75rem; color: var(--border-cyan); letter-spacing: 0.2em; font-family: 'Courier New', monospace; }
.frame-status-bar { display: flex; align-items: center; gap: 0.9rem; padding: 0.5rem 1.05rem; border-top: 1px solid var(--neon-cyan); background: rgba(0,0,0,0.8); flex-shrink: 0; min-height: 42px; position: relative; z-index: 2; }
.status-item { display: flex; align-items: center; gap: 0.45rem; flex: 1; }
.status-label { font-size: 0.65rem; color: var(--neon-cyan); letter-spacing: 0.08em; white-space: nowrap; font-family: 'Courier New', monospace; flex-shrink: 0; }
.status-pips { display: flex; gap: 4px; flex: 1; }
.pip { width: 10px; height: 8px; border-radius: 1px; background: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); transition: all 0.3s; transform: skewX(-15deg); }
.pip.used { background: transparent; border: 1px solid var(--border-cyan); box-shadow: none; }
.status-num { font-family: 'Courier New', monospace; font-size: 0.78rem; color: var(--neon-cyan); font-weight: bold; white-space: nowrap; flex-shrink: 0; text-shadow: 0 0 5px var(--neon-cyan); }
.status-divider { width: 1px; height: 13px; background: var(--border-cyan); flex-shrink: 0; }
.consult-loading-area { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.42rem; padding: 0.85rem 1rem; }
.loading-wave { display: flex; align-items: flex-end; gap: 3px; height: 20px; }
.loading-wave span { display: block; width: 3px; border-radius: 2px; background: var(--neon-cyan); box-shadow: 0 0 5px var(--neon-cyan); animation: waveBar 1.2s cubic-bezier(0.4,0,0.6,1) infinite; }
.loading-wave span:nth-child(1) { animation-delay: 0s; } .loading-wave span:nth-child(2) { animation-delay: 0.1s; } .loading-wave span:nth-child(3) { animation-delay: 0.2s; } .loading-wave span:nth-child(4) { animation-delay: 0.3s; } .loading-wave span:nth-child(5) { animation-delay: 0.4s; }
@keyframes waveBar { 0%, 100% { height: 4px; opacity: 0.3; } 50% { height: 20px; opacity: 1; } }
.loading-text { font-family: 'Courier New', monospace; font-size: 0.62rem; color: var(--neon-cyan); letter-spacing: 0.25em; animation: breathe 2.5s ease-in-out infinite; }
@keyframes breathe { 0%, 100% { opacity: 0.45; letter-spacing: 0.22em; } 50% { opacity: 0.85; letter-spacing: 0.28em; } }
.consult-choices-area { flex-shrink: 0; padding: 0.55rem 0.9rem 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; position: relative; z-index: 2; }
.choices-label { font-family: 'Courier New', monospace; font-size: 0.6rem; letter-spacing: 0.22em; color: var(--neon-yellow); padding-bottom: 0.38rem; border-bottom: 1px solid rgba(252,238,10,0.3); margin-bottom: 0.08rem; }
.choices-list { display: flex; flex-direction: column; gap: 0.38rem; }
.choice-btn { width: 100%; padding: 0.68rem 0.95rem; border-radius: 4px; border: 1px solid var(--border-cyan); border-left: 3px solid transparent; background: rgba(10, 15, 25, 0.8); text-align: left; display: flex; flex-direction: column; gap: 0.14rem; cursor: pointer; font-family: inherit; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5); position: relative; overflow: hidden; }
.choice-btn::before { display: none; }
.choice-btn:hover { border-color: var(--neon-cyan); border-left-color: var(--neon-cyan); background: rgba(0, 243, 255, 0.1); transform: translateX(3px); box-shadow: 0 0 15px rgba(0, 243, 255, 0.2); }
.choice-title { display: block; font-size: 0.86rem; color: #fff; letter-spacing: 0.04em; text-shadow: 0 0 3px rgba(255,255,255,0.5); }
.choice-line  { display: block; font-size: 0.73rem; color: var(--text-muted); line-height: 1.5; }
.consult-settlement-area { border-top: 1px solid var(--border-cyan); }
.consult-settlement-card { background: var(--bg-card); border-radius: 6px; border: 1px solid var(--neon-cyan); padding: 0.9rem 1rem; box-shadow: 0 0 15px rgba(0, 243, 255, 0.1); display: flex; flex-direction: column; gap: 0.6rem; }
.consult-settlement-copy { font-size: 0.78rem; color: var(--text-main); line-height: 1.7; letter-spacing: 0.03em; }
.consult-settlement-btn { align-self: flex-start; }
.consult-retry-area { flex-shrink: 0; display: flex; justify-content: center; padding: 0.75rem 1rem; position: relative; z-index: 2; }
.retry-btn { padding: 0.55rem 1.4rem; border-radius: 4px; border: 1px solid var(--border-cyan); background: rgba(0, 243, 255, 0.05); color: var(--neon-cyan); font-family: inherit; font-size: 0.82rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
.retry-btn:hover { background: rgba(0, 243, 255, 0.2); border-color: var(--neon-cyan); color: #fff; box-shadow: 0 0 10px rgba(0, 243, 255, 0.5); transform: translateY(-1px); }

/* ============================================================
病历记录抽屉 (完全版)
============================================================ */
.notes-tab {
  position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 45; display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
  background: rgba(10, 15, 25, 0.98); border: 1px solid var(--neon-purple); border-right: none; border-radius: 6px 0 0 6px; padding: 0.9rem 0.45rem; cursor: pointer; box-shadow: -3px 0 15px rgba(176, 38, 255, 0.2); transition: all 0.25s ease;
}
.notes-tab:hover { background: #000; box-shadow: -5px 0 20px rgba(176, 38, 255, 0.4); border-color: var(--neon-pink); }
.notes-tab.open { right: min(296px, 84vw); }

.notes-tab-text { writing-mode: vertical-rl; text-orientation: mixed; font-size: 0.72rem; color: var(--neon-purple); letter-spacing: 0.18em; font-family: 'Courier New', monospace; white-space: nowrap; text-shadow: 0 0 5px var(--neon-purple); }
.notes-tab:hover .notes-tab-text { color: var(--neon-pink); text-shadow: 0 0 5px var(--neon-pink); }
.notes-tab-arrow { font-size: 0.7rem; color: var(--neon-purple); transition: transform 0.25s ease; }
.notes-tab:hover .notes-tab-arrow { color: var(--neon-pink); }
.notes-tab.open .notes-tab-arrow { transform: rotate(180deg); }

.notes-drawer { position: fixed; inset: 0; z-index: 40; display: flex; justify-content: flex-end; align-items: center; }
.notes-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); cursor: pointer; }

.notes-card {
  position: relative; z-index: 1; width: min(296px, 84vw); max-height: 85vh; height: auto; display: flex; flex-direction: column; overflow: hidden;
  background: var(--panel-bg); border: 1px solid var(--neon-purple); border-radius: 8px 0 0 8px; border-right: none; box-shadow: -10px 0 30px rgba(176, 38, 255, 0.15);
}
.notes-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.55rem; padding: 0.85rem 0.95rem 0.72rem; border-bottom: 1px solid rgba(176, 38, 255, 0.3); flex-shrink: 0; }
.notes-head-left { display: flex; flex-direction: column; gap: 0.12rem; flex: 1; min-width: 0; }
.notes-doc-title { font-size: 0.95rem; color: #fff; letter-spacing: 0.1em; text-shadow: 0 0 8px var(--neon-cyan), 0 0 15px var(--neon-cyan); font-weight: bold; }
.notes-sub { font-size: 0.66rem; color: #c4d8f0; line-height: 1.55; margin-top: 0.1rem; }

.notes-close-btn { flex-shrink: 0; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid rgba(0, 243, 255, 0.4); background: transparent; color: var(--neon-cyan); font-size: 0.9rem; cursor: pointer; font-family: inherit; transition: all 0.18s; margin-top: 1px; }
.notes-close-btn:hover { border-color: var(--neon-cyan); color: #000; background: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); }

.notes-scroll-body { flex: 1; min-height: 0; overflow-y: auto; padding: 0.72rem 0.95rem; display: flex; flex-direction: column; gap: 0.72rem; scrollbar-width: none; }
.notes-scroll-body::-webkit-scrollbar { display: none; }

.notes-label { display: block; font-family: 'Courier New', monospace; font-size: 0.6rem; letter-spacing: 0.18em; color: var(--neon-cyan); margin-bottom: 0.32rem; text-transform: uppercase; text-shadow: 0 0 5px var(--neon-cyan); }
.notes-textarea { width: 100%; min-height: 68px; max-height: 100px; border-radius: 4px; border: 1px dashed var(--border-cyan); background: rgba(0, 0, 0, 0.6); padding: 0.58rem 0.72rem; resize: vertical; color: #ffffff; text-shadow: 0 0 4px rgba(0, 243, 255, 0.6); font-family: inherit; font-size: 0.78rem; line-height: 1.75; transition: border-color 0.2s; box-sizing: border-box; }
.notes-textarea:focus { outline: none; border-color: var(--neon-cyan); box-shadow: inset 0 0 10px rgba(0,243,255,0.2); }
.notes-textarea::placeholder { color: rgba(0, 243, 255, 0.6); text-shadow: none; }

.mapping-board { display: flex; flex-direction: column; gap: 0.52rem; }
.mapping-group { display: flex; flex-direction: column; gap: 0.28rem; }
.mapping-title { font-size: 0.66rem; color: var(--neon-cyan); text-shadow: 0 0 5px var(--neon-cyan); letter-spacing: 0.1em; font-family: 'Courier New', monospace; }
.mapping-options { display: flex; flex-wrap: wrap; gap: 0.28rem; }
.mapping-option { display: inline-flex; align-items: center; gap: 0.22rem; padding: 0.26rem 0.52rem; border-radius: 4px; background: rgba(0,0,0,0.4); border: 1px dashed var(--border-cyan); font-size: 0.74rem; color: #d1e8f5; cursor: pointer; transition: all 0.18s; user-select: none; }
.mapping-option:hover { border-style: solid; border-color: var(--neon-cyan); background: rgba(0, 243, 255, 0.2); color: #fff; }
.mapping-option input[type="checkbox"] { width: 11px; height: 11px; accent-color: var(--neon-pink); margin: 0; flex-shrink: 0; }
.mapping-option:has(input:checked) { border-style: solid; border-color: var(--neon-cyan); background: rgba(0, 243, 255, 0.2); color: #fff; font-weight: bold; box-shadow: 0 0 10px rgba(0, 243, 255, 0.5); text-shadow: 0 0 5px #ffffff; }
.mapping-option:has(input:disabled) { opacity: 0.4; cursor: not-allowed; }

.notes-summary { padding: 0.58rem 0.72rem; border-radius: 4px; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(176, 38, 255, 0.3); display: flex; flex-direction: column; gap: 0.32rem; }
.summary-title { font-family: 'Courier New', monospace; font-size: 0.58rem; letter-spacing: 0.18em; color: var(--neon-yellow); text-transform: uppercase; text-shadow: 0 0 5px var(--neon-yellow); }
.summary-detail-list { display: flex; flex-direction: column; gap: 0.25rem; }
.summary-detail-item { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.74rem; color: #fff; text-shadow: 0 0 3px rgba(255,255,255,0.4); }
.summary-detail-item strong { color: var(--neon-cyan); font-family: 'Courier New', monospace; font-size: 0.7rem; text-shadow: 0 0 5px var(--neon-cyan); }
.summary-copy { font-size: 0.74rem; color: #fff; line-height: 1.65; text-shadow: 0 0 3px rgba(255,255,255,0.4); }
.summary-meta { font-family: 'Courier New', monospace; font-size: 0.58rem; color: var(--neon-pink); letter-spacing: 0.1em; text-shadow: 0 0 5px var(--neon-pink); font-weight: bold; }

.notes-actions { flex-shrink: 0; display: flex; flex-direction: column; gap: 0.38rem; padding: 0.65rem 0.95rem 0.85rem; border-top: 1px solid rgba(176, 38, 255, 0.3); background: rgba(0, 0, 0, 0.8); }
.notes-actions .btn-secondary, .notes-actions .btn-primary { width: 100%; text-align: center; padding: 0.62rem 1rem; font-size: 0.8rem; letter-spacing: 0.1em; border-radius: 4px; }

/* ============================================================
治疗页
============================================================ */
.screen-treatment { background: transparent !important; overflow: hidden; position: absolute; z-index: 1; }
.phase-topbar { display: flex; align-items: center; gap: 0.7rem; padding: 0.78rem 1.1rem; flex-shrink: 0; background: var(--panel-bg); border-bottom: 1px solid var(--neon-purple); box-shadow: 0 2px 15px rgba(176, 38, 255, 0.1); position: relative; z-index: 10; }
.phase-topbar-center { flex: 1; }
.phase-title { font-size: 0.88rem; letter-spacing: 0.14em; color: var(--neon-purple); text-shadow: 0 0 5px var(--neon-purple); text-transform: uppercase; }
.phase-sub { margin-top: 0.12rem; font-size: 0.68rem; color: var(--text-muted); }
.phase-topbar-actions { display: flex; gap: 0.5rem; align-items: center; }

.treatment-scroll-area { flex: 1; overflow-y: auto; scrollbar-width: none; padding: 0.9rem 1.1rem 2rem; display: flex; flex-direction: column; gap: 0.8rem; position: relative; z-index: 2; }
.treatment-scroll-area::-webkit-scrollbar { display: none; }
.treatment-summary-card { background: var(--bg-card); border-radius: 6px; border: 1px solid var(--border-purple); padding: 0.95rem 1.05rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 0.5rem; }
.treatment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
.treatment-card { background: var(--bg-card); border-radius: 6px; border: 1px solid var(--border-cyan); padding: 0.88rem 0.95rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 0.6rem; transition: border-color 0.2s; }
.treatment-card:hover { border-color: var(--neon-cyan); box-shadow: 0 0 15px rgba(0, 243, 255, 0.2); }
.treatment-card-title { font-size: 0.78rem; letter-spacing: 0.12em; font-family: 'Courier New', monospace; color: var(--neon-cyan); text-transform: uppercase; text-shadow: 0 0 3px rgba(0,243,255,0.5); }
.treatment-submit-card { background: var(--bg-card); border-radius: 6px; border: 1px solid var(--neon-pink); padding: 0.95rem 1.05rem; box-shadow: 0 0 20px rgba(255, 0, 124, 0.1); display: flex; flex-direction: column; gap: 0.65rem; }
.treatment-actions { display: flex; gap: 0.6rem; }

/* ============================================================
结算页
============================================================ */
.screen-settlement { background: transparent !important; overflow: hidden; position: absolute; z-index: 1; }
.feedback-scroll-area { flex: 1; overflow-y: auto; scrollbar-width: none; padding: 0.9rem 1.1rem 2rem; display: flex; align-items: flex-start; justify-content: center; position: relative; z-index: 2; }
.feedback-scroll-area::-webkit-scrollbar { display: none; }
.feedback-card { width: min(680px, 100%); background: var(--bg-card); border-radius: 6px; border: 1px solid var(--neon-cyan); border-top: 4px solid var(--neon-cyan); padding: 1.2rem; box-shadow: 0 0 30px rgba(0, 243, 255, 0.1); display: flex; flex-direction: column; gap: 0.85rem; }
.settlement-page-card { max-width: 680px; }
.feedback-chip { display: inline-block; padding: 0.26rem 0.72rem; border-radius: 2px; font-family: 'Courier New', monospace; font-size: 0.68rem; letter-spacing: 0.14em; align-self: flex-start; text-transform: uppercase; }
.feedback-chip.revisit { border: 1px solid var(--neon-pink); background: rgba(255, 0, 124, 0.1); color: var(--neon-pink); box-shadow: 0 0 10px rgba(255, 0, 124, 0.2); }
.feedback-chip.complete { border: 1px solid var(--neon-green); background: rgba(57, 255, 20, 0.1); color: var(--neon-green); box-shadow: 0 0 10px rgba(57, 255, 20, 0.2); }
.feedback-body { display: flex; flex-direction: column; gap: 0.8rem; }
.feedback-body p { margin: 0; line-height: 1.95; color: var(--text-main); font-size: 0.9rem; }
.feedback-schedule { padding: 0.65rem 0.85rem; border-radius: 4px; background: rgba(255, 0, 124, 0.05); border: 1px dashed var(--neon-pink); font-size: 0.8rem; color: #fff; line-height: 1.75; text-shadow: 0 0 3px rgba(255,0,124,0.5); }
.feedback-actions { display: flex; gap: 0.6rem; margin-top: 0.2rem; }
.settlement-summary { display: flex; flex-direction: column; gap: 0.65rem; }
.settlement-stat { padding: 0.8rem 0.9rem; border-radius: 4px; border: 1px dashed var(--border-cyan); border-left: 3px solid var(--neon-cyan); background: rgba(0,0,0,0.5); }
.settlement-stat-label { font-size: 0.62rem; color: var(--neon-cyan); letter-spacing: 0.14em; font-family: 'Courier New', monospace; text-transform: uppercase; }
.settlement-stat-value { margin-top: 0.28rem; font-size: 0.88rem; color: var(--neon-yellow); line-height: 1.75; font-family: 'Courier New', monospace; font-weight: bold; text-shadow: 0 0 5px var(--neon-yellow); }

/* ============================================================
手机 / 音乐悬浮球组件
============================================================ */

.phone-fab, .music-fab {
  position: fixed; display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  width: 52px; height: 52px; padding: 0; border-radius: 8px; 
  background: rgba(10, 15, 25, 0.9); cursor: pointer; z-index: 50; transition: transform 0.2s;
}

/* 手机样式 */
.phone-fab { right: 1rem; bottom: 1.5rem; border: 1px solid var(--neon-purple); box-shadow: 0 0 15px rgba(176, 38, 255, 0.3); font-size: 2rem; }
.phone-fab:hover { background: rgba(176, 38, 255, 0.2); box-shadow: 0 0 25px rgba(176, 38, 255, 0.5); border-color: #fff; transform: scale(1.05); }
.phone-fab:active { transform: scale(0.95); }
.phone-badge { position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 4px; background: var(--neon-pink); color: #fff; font-size: 0.6rem; font-family: 'Courier New', monospace; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px var(--neon-pink); }

/* 音乐样式 */
.music-fab { left: 1rem; bottom: 1.5rem; border: 1px solid var(--neon-cyan); box-shadow: 0 0 15px rgba(0, 243, 255, 0.2); }
.music-fab:hover { background: rgba(0, 243, 255, 0.15); box-shadow: 0 0 25px rgba(0, 243, 255, 0.4); border-color: #fff; transform: scale(1.05); }
.music-fab:active { transform: scale(0.95); }
.music-fab-icon { font-size: 1.5rem; filter: drop-shadow(0 0 5px var(--neon-cyan)); }
.music-wave-mini { display: flex; gap: 2px; height: 10px; margin-top: 2px; align-items: flex-end; }
.music-wave-mini span { width: 3px; background: var(--neon-cyan); box-shadow: 0 0 5px var(--neon-cyan); animation: waveBounce 1s infinite ease-in-out; }
.music-wave-mini span:nth-child(1) { animation-delay: 0.1s; }
.music-wave-mini span:nth-child(2) { animation-delay: 0.3s; }
.music-wave-mini span:nth-child(3) { animation-delay: 0.2s; }
@keyframes waveBounce { 0%, 100% { height: 3px; } 50% { height: 10px; } }

/* 全息音乐面板 */
.music-panel {
  position: fixed; left: 1rem; bottom: 5.5rem; width: 260px;
  background: linear-gradient(135deg, rgba(0, 243, 255, 0.08) 0%, rgba(5, 8, 12, 0.95) 100%);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 243, 255, 0.4); border-top: 3px solid var(--neon-cyan);
  border-radius: 6px; padding: 1rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 243, 255, 0.1);
  z-index: 49; display: flex; flex-direction: column; gap: 0.8rem;
}
.music-panel-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(0, 243, 255, 0.3); padding-bottom: 0.5rem; }
.music-sys-title { font-family: 'Courier New', monospace; font-size: 0.65rem; color: var(--neon-cyan); letter-spacing: 0.15em; text-shadow: 0 0 5px var(--neon-cyan); }
.music-close { background: transparent; border: none; color: var(--neon-cyan); font-size: 1.2rem; cursor: pointer; line-height: 1; transition: color 0.2s; padding: 0; margin: 0; }
.music-close:hover { color: var(--neon-pink); text-shadow: 0 0 8px var(--neon-pink); }
.music-info { display: flex; flex-direction: column; gap: 0.2rem; }
.music-title { font-size: 0.95rem; color: #fff; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 0 5px rgba(255,255,255,0.4); }
.music-artist { font-family: 'Courier New', monospace; font-size: 0.65rem; color: var(--neon-yellow); opacity: 0.8; }
.music-progress-bg { width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.8); }
.music-progress-fill { height: 100%; background: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); transition: width 0.1s linear; }
.music-controls { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
.music-ctrl-btn { background: linear-gradient(180deg, rgba(0, 243, 255, 0.1) 0%, rgba(0, 30, 45, 0.8) 100%); border: 1px solid var(--neon-cyan); border-radius: 4px; color: var(--neon-cyan); width: 40px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.1s; box-shadow: 0 3px 0 rgba(0, 40, 50, 1), 0 5px 10px rgba(0, 243, 255, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2); }
.music-ctrl-btn:active { transform: translateY(3px); box-shadow: 0 0 0 rgba(0, 40, 50, 1), 0 2px 5px rgba(0, 243, 255, 0.2), inset 0 2px 5px rgba(0, 0, 0, 0.6); }
.play-btn { width: 60px; background: linear-gradient(180deg, rgba(255, 0, 124, 0.2) 0%, rgba(80, 0, 40, 0.8) 100%); border-color: var(--neon-pink); color: #fff; box-shadow: 0 3px 0 rgba(60, 0, 30, 1), 0 5px 10px rgba(255, 0, 124, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3); text-shadow: 0 0 5px var(--neon-pink); }
.play-btn:active { box-shadow: 0 0 0 rgba(60, 0, 30, 1), inset 0 2px 5px rgba(0, 0, 0, 0.6); }

/* ============================================================
移动端适配 (严格保留原生媒体查询规则)
============================================================ */
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }

@media (max-width: 480px) {
  .title-center { margin-top: -3.5rem; width: calc(100vw - 2.5rem); }
  .title-main { font-size: clamp(2.2rem, 11vw, 3.2rem); }
  .intro-reading-column { padding: 1.5rem 1.3rem 3rem; }
  .intro-lead { font-size: 1.25rem; }
  .intro-paragraph { font-size: 0.9rem; line-height: 2; }
  .hub-body { padding: 0.65rem 0.75rem 1rem; gap: 0.5rem; }
  .pr-scroll-area { padding: 0.85rem 0.85rem 3rem; }
  .pr-card-name { font-size: 1rem; }
  .consult-frame { flex: 1; min-height: 0; height: calc(100vh - 185px); margin: 0.7rem 0.9rem 0.9rem; border-radius: 6px; border: 1px solid var(--neon-cyan); background: var(--bg-card); box-shadow: 0 0 15px rgba(0, 243, 255, 0.1); display: flex; flex-direction: column; overflow: hidden; }
  .frame-content { flex: 1; min-height: 0; overflow-y: auto; padding: 0.9rem 1.05rem; display: flex; flex-direction: column; gap: 0.95rem; scrollbar-width: none; }
  .frame-content::-webkit-scrollbar { display: none; }
  .patient-info-bar { padding: 0.5rem 0.88rem 0.45rem; }
  .consult-choices-area { padding: 0.5rem 0.7rem 0.55rem; }
  .choice-btn { padding: 0.62rem 0.88rem; }
  .treatment-grid { grid-template-columns: 1fr; }
  .treatment-scroll-area { padding: 0.8rem 0.85rem 2rem; }
  .modal-card { padding: 1.2rem; }
  .modal-stats-row { flex-direction: column; }
}
</style>
