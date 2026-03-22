<template>
  <div class="synesthesia-shell">
    <Transition name="fade">
      <section v-if="phase === 'title'" class="screen title-screen">
        <div class="title-noise"></div>
        <div class="title-glow"></div>

        <div class="title-content">
          <div class="eyebrow">PHASE I / SIMULATOR II</div>
          <h1 class="title-main">{{ gameOverview.title }}</h1>
          <div class="title-sub">{{ gameOverview.subtitle }}</div>
          <p class="title-tagline">{{ gameOverview.tagline }}</p>

          <div class="title-card">
            <p>{{ gameOverview.setting }}</p>
            <p>{{ gameOverview.fantasy }}</p>
          </div>

          <div class="title-actions">
            <button class="primary-btn" @click="enterWorkbench">进入开发骨架</button>
            <button class="ghost-btn" @click="$router.push('/')">返回主界面</button>
          </div>
        </div>
      </section>
    </Transition>

    <Transition name="fade">
      <section v-if="phase === 'workbench'" class="screen workbench-screen">
        <header class="topbar">
          <button class="back-btn" @click="goBackToTitle">‹ 返回</button>
          <div class="topbar-meta">
            <div class="topbar-label">SYNESTHESIA WORKBENCH</div>
            <div class="topbar-sub">第二个模拟器的内容骨架与提示词拆分</div>
          </div>
        </header>

        <main class="workbench-grid">
          <aside class="panel-nav">
            <button
              v-for="panel in panels"
              :key="panel.id"
              class="nav-btn"
              :class="{ active: activePanel === panel.id }"
              @click="setActivePanel(panel.id)"
            >
              {{ panel.label }}
            </button>
          </aside>

          <section class="content-panel">
            <template v-if="activePanel === 'overview'">
              <div class="section-head">
                <div class="section-kicker">Project Overview</div>
                <h2>项目定位</h2>
              </div>

              <div class="info-block">
                <p>{{ gameOverview.setting }}</p>
                <p>{{ gameOverview.fantasy }}</p>
              </div>

              <div class="card-grid two-col">
                <article class="info-card">
                  <div class="card-title">五感系统</div>
                  <div v-for="item in sensorSystem" :key="item.id" class="list-row">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.symptom }}</span>
                  </div>
                </article>

                <article class="info-card">
                  <div class="card-title">异常等级</div>
                  <div v-for="item in anomalyLevels" :key="item.level" class="list-row">
                    <strong>{{ item.level }}</strong>
                    <span>{{ item.desc }}</span>
                  </div>
                </article>
              </div>
            </template>

            <template v-else-if="activePanel === 'loop'">
              <div class="section-head">
                <div class="section-kicker">Core Loop</div>
                <h2>核心游戏循环</h2>
              </div>

              <div class="timeline">
                <article v-for="step in gameLoopSteps" :key="step.id" class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-body">
                    <div class="timeline-title">{{ step.title }}</div>
                    <div class="timeline-text">{{ step.detail }}</div>
                  </div>
                </article>
              </div>

              <div class="info-card">
                <div class="card-title">AI 调用边界</div>
                <div v-for="item in aiTimeline" :key="item.trigger" class="list-row">
                  <strong>{{ item.trigger }}</strong>
                  <span>{{ item.behavior }}</span>
                </div>
              </div>
            </template>

            <template v-else-if="activePanel === 'systems'">
              <div class="section-head">
                <div class="section-kicker">Systems</div>
                <h2>治疗与环境系统</h2>
              </div>

              <div class="card-grid two-col">
                <article class="info-card">
                  <div class="card-title">治疗仪结构</div>
                  <div v-for="device in deviceSystem" :key="device.sense" class="device-row">
                    <div class="device-name">{{ device.sense }}</div>
                    <div class="chip-row">
                      <span v-for="module in device.modules" :key="module" class="chip">{{ module }}</span>
                    </div>
                  </div>
                </article>

                <article class="info-card">
                  <div class="card-title">收费与升级规则</div>
                  <div v-for="rule in economyRules" :key="rule" class="plain-row">{{ rule }}</div>
                </article>
              </div>

              <div class="info-card">
                <div class="card-title">环境干扰池</div>
                <div class="card-grid three-col">
                  <div v-for="factor in environmentFactors" :key="factor.name" class="mini-card">
                    <div class="mini-card-title">{{ factor.name }}</div>
                    <div class="mini-card-text">{{ factor.impact }}</div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="activePanel === 'patients'">
              <div class="section-head">
                <div class="section-kicker">Preset Patients</div>
                <h2>前期样例患者</h2>
              </div>

              <div class="patient-layout">
                <div class="patient-list">
                  <button
                    v-for="patient in presetPatients"
                    :key="patient.id"
                    class="patient-tab"
                    :class="{ active: selectedPatientId === patient.id }"
                    @click="selectPatient(patient.id)"
                  >
                    <div class="patient-tab-name">{{ patient.name }}</div>
                    <div class="patient-tab-job">{{ patient.job }}</div>
                  </button>
                </div>

                <div class="patient-detail info-card">
                  <div class="card-title">{{ selectedPatient.name }}</div>
                  <div class="detail-row">
                    <span class="detail-label">职业定位</span>
                    <span>{{ selectedPatient.job }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">核心牵挂</span>
                    <span>{{ selectedPatient.attachment }}</span>
                  </div>
                  <div class="detail-row vertical">
                    <span class="detail-label">症状样例</span>
                    <div class="chip-row">
                      <span v-for="item in selectedPatient.symptoms" :key="item" class="chip strong">{{ item }}</span>
                    </div>
                  </div>
                  <div class="detail-note">{{ selectedPatient.note }}</div>
                </div>
              </div>

              <div class="prompt-box">
                <div class="prompt-head">
                  <div>
                    <div class="card-title">提示词预览</div>
                    <div class="prompt-sub">把 Prompt 相关代码提前拆出来，后面接 AI 时可以直接用。</div>
                  </div>
                  <div class="prompt-switch">
                    <button
                      class="switch-btn"
                      :class="{ active: promptMode === 'seed' }"
                      @click="setPromptMode('seed')"
                    >
                      档案生成
                    </button>
                    <button
                      class="switch-btn"
                      :class="{ active: promptMode === 'dialogue' }"
                      @click="setPromptMode('dialogue')"
                    >
                      问诊对话
                    </button>
                    <button
                      class="switch-btn"
                      :class="{ active: promptMode === 'treatment' }"
                      @click="setPromptMode('treatment')"
                    >
                      治疗反馈
                    </button>
                  </div>
                </div>

                <pre class="prompt-preview">{{ promptPreview }}</pre>
              </div>
            </template>

            <template v-else-if="activePanel === 'architecture'">
              <div class="section-head">
                <div class="section-kicker">Architecture</div>
                <h2>代码拆分方案</h2>
              </div>

              <div class="card-grid two-col">
                <article class="info-card">
                  <div class="card-title">当前目录结构</div>
                  <div v-for="item in fileStructure" :key="item" class="plain-row">{{ item }}</div>
                </article>

                <article class="info-card">
                  <div class="card-title">开发里程碑</div>
                  <div v-for="item in devMilestones" :key="item" class="plain-row">{{ item }}</div>
                </article>
              </div>

              <div class="card-grid two-col">
                <article class="info-card">
                  <div class="card-title">系统提示词</div>
                  <pre class="plain-pre">{{ systemPrompt }}</pre>
                </article>

                <article class="info-card">
                  <div class="card-title">世界书条目</div>
                  <div v-for="entry in worldBook" :key="entry.id" class="world-row">
                    <strong>{{ entry.title }}</strong>
                    <span>{{ entry.content }}</span>
                  </div>
                </article>
              </div>
            </template>
          </section>
        </main>
      </section>
    </Transition>
  </div>
</template>

<script setup>
import { useGameLogic } from './composables/useGameLogic'

const {
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
  aiTimeline,
  anomalyLevels,
  deviceSystem,
  devMilestones,
  economyRules,
  environmentFactors,
  fileStructure,
  gameLoopSteps,
  gameOverview,
  presetPatients,
  sensorSystem,
  systemPrompt,
  worldBook
} = useGameLogic()
</script>

<style scoped>
.synesthesia-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(38, 73, 91, 0.32), transparent 42%),
    radial-gradient(circle at bottom, rgba(118, 62, 41, 0.22), transparent 46%),
    #071015;
  color: #ddd3c3;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.screen {
  position: absolute;
  inset: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.title-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.title-noise,
.title-glow {
  position: absolute;
  inset: 0;
}

.title-noise {
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.02) 2px,
    transparent 2px,
    transparent 5px
  );
  opacity: 0.35;
  pointer-events: none;
}

.title-glow {
  background:
    radial-gradient(circle at 30% 30%, rgba(70, 130, 150, 0.25), transparent 35%),
    radial-gradient(circle at 70% 70%, rgba(180, 96, 64, 0.2), transparent 30%);
}

.title-content {
  position: relative;
  z-index: 1;
  width: min(720px, calc(100vw - 3rem));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.32em;
  color: rgba(177, 164, 127, 0.72);
}

.title-main {
  margin: 0;
  font-size: clamp(2.8rem, 7vw, 5.2rem);
  font-weight: normal;
  letter-spacing: 0.18em;
  color: #f1e0b1;
  text-shadow: 0 0 24px rgba(234, 205, 121, 0.18);
}

.title-sub {
  font-size: 1rem;
  letter-spacing: 0.28em;
  color: #8da5aa;
}

.title-tagline {
  margin: 0;
  font-size: 1rem;
  line-height: 1.9;
  color: #bbb09c;
}

.title-card {
  padding: 1.3rem 1.5rem;
  background: rgba(8, 17, 22, 0.76);
  border: 1px solid rgba(215, 191, 133, 0.16);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.28);
}

.title-card p {
  margin: 0;
  line-height: 1.95;
  color: #c6baab;
}

.title-card p + p {
  margin-top: 0.9rem;
}

.title-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.primary-btn,
.ghost-btn,
.back-btn,
.nav-btn,
.patient-tab,
.switch-btn {
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-btn,
.ghost-btn,
.back-btn {
  padding: 0.8rem 1.35rem;
  border-radius: 8px;
  font-size: 0.92rem;
  letter-spacing: 0.12em;
}

.primary-btn {
  background: linear-gradient(135deg, rgba(148, 98, 56, 0.94), rgba(104, 65, 34, 0.94));
  border: 1px solid rgba(241, 213, 146, 0.34);
  color: #f7edd4;
}

.primary-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.ghost-btn,
.back-btn {
  background: transparent;
  border: 1px solid rgba(215, 191, 133, 0.2);
  color: #af9f82;
}

.ghost-btn:hover,
.back-btn:hover {
  border-color: rgba(215, 191, 133, 0.42);
  color: #decda8;
}

.workbench-screen {
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.4rem;
  border-bottom: 1px solid rgba(215, 191, 133, 0.08);
  background: rgba(5, 12, 16, 0.72);
}

.topbar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
}

.topbar-label {
  font-size: 0.72rem;
  letter-spacing: 0.32em;
  color: #b4a378;
}

.topbar-sub {
  font-size: 0.82rem;
  color: #6d7d84;
}

.workbench-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 220px 1fr;
}

.panel-nav {
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  border-right: 1px solid rgba(215, 191, 133, 0.08);
  background: rgba(5, 11, 14, 0.64);
}

.nav-btn {
  text-align: left;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(215, 191, 133, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: #90846d;
  font-size: 0.88rem;
}

.nav-btn:hover,
.nav-btn.active {
  border-color: rgba(215, 191, 133, 0.28);
  background: rgba(215, 191, 133, 0.08);
  color: #e2d2a8;
}

.content-panel {
  overflow-y: auto;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.section-head h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: normal;
  letter-spacing: 0.08em;
  color: #f1dfb4;
}

.section-kicker {
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  color: #7f928f;
  font-family: 'Courier New', monospace;
}

.info-block,
.info-card,
.prompt-box {
  background: rgba(8, 16, 20, 0.74);
  border: 1px solid rgba(215, 191, 133, 0.12);
  border-radius: 14px;
  padding: 1.1rem 1.2rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.015);
}

.info-block p,
.plain-row,
.mini-card-text,
.timeline-text,
.detail-note,
.world-row span,
.list-row span,
.plain-pre,
.prompt-sub {
  line-height: 1.85;
  color: #bdb29f;
}

.info-block p {
  margin: 0;
}

.info-block p + p {
  margin-top: 0.7rem;
}

.card-grid {
  display: grid;
  gap: 1rem;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card-title {
  margin-bottom: 0.9rem;
  font-size: 1rem;
  color: #e8d7a9;
  letter-spacing: 0.08em;
}

.list-row,
.world-row,
.detail-row {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  padding: 0.65rem 0;
  border-top: 1px solid rgba(215, 191, 133, 0.08);
}

.list-row:first-of-type,
.world-row:first-of-type,
.detail-row:first-of-type {
  border-top: none;
  padding-top: 0;
}

.list-row strong,
.world-row strong,
.detail-label,
.timeline-title,
.device-name,
.mini-card-title,
.patient-tab-name {
  color: #e6d7b6;
  font-weight: normal;
}

.list-row strong,
.world-row strong,
.detail-label {
  min-width: 7rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.timeline-item {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 0.8rem;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  margin-top: 0.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0c88f, #5f95a7);
  box-shadow: 0 0 12px rgba(224, 200, 143, 0.26);
}

.timeline-body {
  padding: 0.9rem 1rem;
  background: rgba(8, 16, 20, 0.58);
  border: 1px solid rgba(215, 191, 133, 0.08);
  border-radius: 12px;
}

.device-row + .device-row {
  margin-top: 1rem;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.chip {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(215, 191, 133, 0.16);
  background: rgba(215, 191, 133, 0.05);
  color: #bcae8f;
  font-size: 0.72rem;
}

.chip.strong {
  color: #eadcb8;
  border-color: rgba(215, 191, 133, 0.3);
}

.mini-card {
  padding: 0.85rem 0.9rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(215, 191, 133, 0.08);
  border-radius: 12px;
}

.plain-row + .plain-row {
  margin-top: 0.7rem;
}

.patient-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
}

.patient-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.patient-tab {
  padding: 0.95rem 1rem;
  text-align: left;
  border-radius: 12px;
  border: 1px solid rgba(215, 191, 133, 0.08);
  background: rgba(8, 16, 20, 0.62);
}

.patient-tab.active,
.patient-tab:hover {
  border-color: rgba(215, 191, 133, 0.24);
  background: rgba(215, 191, 133, 0.08);
}

.patient-tab-job {
  margin-top: 0.25rem;
  font-size: 0.72rem;
  line-height: 1.65;
  color: #7f8d92;
}

.patient-detail {
  min-height: 100%;
}

.detail-row.vertical {
  flex-direction: column;
  gap: 0.45rem;
}

.detail-note {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(215, 191, 133, 0.08);
}

.prompt-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prompt-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.prompt-switch {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.switch-btn {
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(215, 191, 133, 0.1);
  background: rgba(255, 255, 255, 0.02);
  color: #887b63;
  font-size: 0.75rem;
}

.switch-btn.active,
.switch-btn:hover {
  color: #eadcb6;
  border-color: rgba(215, 191, 133, 0.28);
  background: rgba(215, 191, 133, 0.08);
}

.prompt-preview,
.plain-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: 'Courier New', monospace;
  font-size: 0.73rem;
  line-height: 1.75;
  color: #b9c3c0;
}

.world-row {
  flex-direction: column;
  gap: 0.3rem;
}

@media (max-width: 980px) {
  .workbench-grid,
  .patient-layout,
  .two-col,
  .three-col {
    grid-template-columns: 1fr;
  }

  .panel-nav {
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid rgba(215, 191, 133, 0.08);
  }

  .nav-btn {
    min-width: 132px;
  }

  .prompt-head,
  .title-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
