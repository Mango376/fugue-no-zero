<template>
  <div class="synesthesia-shell">
    <Transition name="fade">
      <section v-if="phase === 'title'" class="screen screen-title">
        <div class="title-veil"></div>
        <div class="title-grid"></div>

        <div class="title-panel">
          <div class="title-eyebrow">{{ titleContent.eyebrow }}</div>
          <h1 class="title-main">{{ titleContent.title }}</h1>
          <div class="title-sub">{{ titleContent.subtitle }}</div>
          <p class="title-tagline">{{ titleContent.tagline }}</p>

          <div class="title-copy">
            <p>{{ titleContent.summary }}</p>
            <p>{{ titleContent.detail }}</p>
          </div>

          <div class="title-actions">
            <button class="btn-primary" @click="startNewGame">开始新游戏</button>
            <button
              class="btn-secondary"
              :class="{ disabled: !hasSave || isCheckingSave }"
              :disabled="!hasSave || isCheckingSave"
              @click="continueGame"
            >
              继续游戏
            </button>
          </div>

          <div class="title-status">
            <span v-if="isCheckingSave">正在检查存档...</span>
            <span v-else-if="hasSave">{{ titleContent.continueHint }}</span>
            <span v-else>当前没有可继续的进度。</span>
          </div>

          <div class="title-footer">
            <button class="text-link" @click="goHome">返回主界面</button>
          </div>
        </div>
      </section>
    </Transition>

    <Transition name="fade">
      <section v-if="phase === 'background_intro'" class="screen screen-intro">
        <header class="intro-topbar">
          <button class="text-link" @click="goToPrevBackgroundPage">返回</button>
          <div class="progress-label">背景介绍 {{ backgroundPage + 1 }} / {{ backgroundTotal }}</div>
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

          <div class="intro-actions">
            <button class="btn-secondary" @click="returnToTitle">返回标题</button>
            <button class="btn-primary" @click="goToNextBackgroundPage">
              {{ backgroundPage + 1 === backgroundTotal ? '继续介绍' : '下一页' }}
            </button>
          </div>
        </div>
      </section>
    </Transition>

    <Transition name="fade">
      <section v-if="phase === 'identity_intro'" class="screen screen-intro intro-identity">
        <header class="intro-topbar">
          <button class="text-link" @click="goToPrevIdentityPage">返回</button>
          <div class="progress-label">身份介绍 {{ identityPage + 1 }} / {{ identityTotal }}</div>
        </header>

        <div class="intro-card identity-card">
          <div class="intro-kicker">{{ currentIdentityPage.kicker }}</div>
          <h2 class="intro-title">{{ currentIdentityPage.title }}</h2>
          <div class="identity-role">{{ playerProfile.title }}</div>
          <div class="identity-workplace">{{ playerProfile.workplace }}</div>
          <div class="intro-divider"></div>

          <div class="intro-body">
            <p v-for="(paragraph, index) in currentIdentityPage.paragraphs" :key="index">
              {{ paragraph }}
            </p>
          </div>

          <div class="intro-actions">
            <button class="btn-secondary" @click="goToPrevIdentityPage">上一页</button>
            <button class="btn-primary" @click="goToNextIdentityPage">
              {{ identityPage + 1 === identityTotal ? '进入主界面' : '下一页' }}
            </button>
          </div>
        </div>
      </section>
    </Transition>

    <Transition name="fade">
      <section v-if="phase === 'hub'" class="screen screen-hub">
        <header class="hub-topbar">
          <button class="text-link" @click="returnToTitle">标题页</button>
          <div class="hub-topbar-actions">
            <button class="btn-secondary compact" @click="saveHubProgress">{{ hubActions.saveLabel }}</button>
            <button class="btn-secondary compact" @click="goHome">返回主界面</button>
          </div>
        </header>

        <main class="hub-main">
          <section class="hero-card">
            <div class="hero-kicker">CURRENT ROLE</div>
            <h2 class="hero-title">{{ playerProfile.title }}</h2>
            <div class="hero-sub">{{ playerProfile.workplace }}</div>
            <p class="hero-text">{{ playerProfile.brief }}</p>
            <p class="hero-creed">{{ playerProfile.creed }}</p>
          </section>

          <section class="hub-grid">
            <article class="hub-card stats-card">
              <div class="card-head">当前信息</div>
              <div class="stats-grid">
                <div v-for="item in hubStats" :key="item.label" class="stat-tile">
                  <div class="stat-label">{{ item.label }}</div>
                  <div class="stat-value">{{ item.value }}</div>
                  <div class="stat-meta">{{ item.meta }}</div>
                </div>
              </div>
            </article>

            <article class="hub-card environment-card">
              <div class="card-head">当前环境</div>
              <div class="environment-phase">{{ currentEnvironment.label }}</div>
              <div class="environment-name">{{ currentEnvironment.name }}</div>
              <p class="environment-text">{{ currentEnvironment.description }}</p>
            </article>

            <article class="hub-card equipment-card">
              <div class="hub-card-header">
                <div class="card-head">设备概览</div>
                <button
                  v-if="isMobileLayout"
                  class="collapse-btn"
                  type="button"
                  @click="toggleEquipmentSection"
                >
                  {{ equipmentExpanded ? '收起' : '展开' }}
                </button>
              </div>
              <div v-if="isMobileLayout && !equipmentExpanded" class="collapsed-summary">
                {{ equipmentSummary.length }} 台设备已收纳，展开后可查看模块与等级概览。
              </div>
              <div v-show="!isMobileLayout || equipmentExpanded" class="equipment-list">
                <div v-for="item in equipmentSummary" :key="item.id" class="equipment-row">
                  <div class="equipment-meta">
                    <div class="equipment-name">{{ item.name }}</div>
                    <div class="equipment-desc">{{ item.summary }}</div>
                  </div>
                  <div class="equipment-level">
                    <span>{{ item.levelText }}</span>
                    <small>{{ item.moduleCount }}</small>
                  </div>
                </div>
              </div>
            </article>

            <article class="hub-card action-card">
              <div class="card-head">主行动入口</div>
              <p class="action-copy">
                诊所已经准备就绪。下一阶段将从这里接入患者进门、问诊、诊断与治疗的正式循环。
              </p>
              <button class="btn-primary action-btn" @click="startPatientFlow">{{ hubActions.primaryLabel }}</button>
              <div v-if="hubNotice" class="hub-notice">{{ hubNotice }}</div>
            </article>

            <article class="hub-card snapshot-card">
              <div class="hub-card-header">
                <div class="card-head">当前系统快照</div>
                <button
                  v-if="isMobileLayout"
                  class="collapse-btn"
                  type="button"
                  @click="toggleSnapshotSection"
                >
                  {{ snapshotExpanded ? '收起' : '展开' }}
                </button>
              </div>
              <div v-if="isMobileLayout && !snapshotExpanded" class="collapsed-summary">
                {{ systemSnapshot.length }} 条系统说明已收纳，需要时再展开查看。
              </div>
              <div v-show="!isMobileLayout || snapshotExpanded">
                <div v-for="item in systemSnapshot" :key="item" class="snapshot-row">
                  {{ item }}
                </div>
              </div>
            </article>
          </section>
        </main>
      </section>
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
  </div>
</template>

<script setup>
import { useGameLogic } from './composables/useGameLogic'

const {
  phase,
  hasSave,
  isCheckingSave,
  showConfirmNewGameModal,
  hubNotice,
  backgroundPage,
  identityPage,
  playerProfile,
  currentBackgroundPage,
  currentIdentityPage,
  currentEnvironment,
  hubStats,
  equipmentSummary,
  backgroundTotal,
  identityTotal,
  titleContent,
  hubActions,
  systemSnapshot,
  isMobileLayout,
  equipmentExpanded,
  snapshotExpanded,
  startNewGame,
  confirmStartNewGame,
  cancelStartNewGame,
  continueGame,
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
} = useGameLogic()
</script>

<style scoped>
.synesthesia-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(35, 78, 96, 0.24), transparent 32%),
    radial-gradient(circle at 80% 20%, rgba(164, 85, 55, 0.12), transparent 24%),
    linear-gradient(180deg, #081116 0%, #050a0e 100%);
  color: #ddd3c2;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.screen {
  position: absolute;
  inset: 0;
}

.fade-enter-active,
.fade-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to,
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.screen-title {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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

.title-panel,
.intro-card,
.hero-card,
.hub-card,
.modal-card {
  background: rgba(8, 16, 20, 0.82);
  border: 1px solid rgba(219, 194, 139, 0.14);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 18px 48px rgba(0, 0, 0, 0.25);
}

.title-panel {
  position: relative;
  z-index: 1;
  width: min(760px, calc(100vw - 2.5rem));
  border-radius: 22px;
  padding: 2rem 2.1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title-eyebrow,
.intro-kicker,
.hero-kicker,
.card-head,
.modal-kicker,
.progress-label {
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  color: #9aa08b;
}

.title-main,
.intro-title,
.hero-title {
  margin: 0;
  font-weight: normal;
  color: #f0dfb1;
}

.title-main {
  font-size: clamp(2.8rem, 7vw, 5rem);
  letter-spacing: 0.16em;
}

.title-sub,
.hero-sub,
.environment-phase,
.environment-name,
.identity-role,
.identity-workplace {
  letter-spacing: 0.16em;
}

.title-sub {
  font-size: 1rem;
  color: #88a0a6;
}

.title-tagline,
.hero-text,
.hero-creed,
.intro-body p,
.action-copy,
.modal-text,
.environment-text,
.snapshot-row,
.stat-meta,
.equipment-desc,
.title-copy p,
.title-status,
.collapsed-summary {
  line-height: 1.9;
  color: #c0b4a2;
}

.title-tagline,
.title-copy p,
.title-status,
.hero-text,
.hero-creed,
.action-copy,
.modal-text,
.environment-text {
  margin: 0;
}

.title-copy {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.15rem 1.25rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.title-actions,
.intro-actions,
.modal-actions,
.hub-topbar-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.text-link,
.collapse-btn {
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary,
.btn-secondary {
  border-radius: 10px;
  padding: 0.78rem 1.3rem;
  font-size: 0.88rem;
  letter-spacing: 0.12em;
}

.btn-primary {
  border: 1px solid rgba(237, 211, 151, 0.36);
  background: linear-gradient(135deg, #8a5938, #5e3925);
  color: #f6e9cf;
}

.btn-primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.btn-secondary {
  border: 1px solid rgba(219, 194, 139, 0.18);
  background: transparent;
  color: #b9ac8e;
}

.btn-secondary:hover:not(.disabled) {
  border-color: rgba(219, 194, 139, 0.34);
  color: #ead9af;
}

.btn-secondary.disabled,
.btn-secondary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-secondary.compact {
  padding: 0.55rem 1rem;
  font-size: 0.78rem;
}

.text-link {
  border: none;
  background: transparent;
  color: #96876a;
  padding: 0;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.text-link:hover {
  color: #d8c89d;
}

.title-footer {
  padding-top: 0.2rem;
}

.screen-intro,
.screen-hub {
  display: flex;
  flex-direction: column;
}

.intro-topbar,
.hub-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.4rem;
  border-bottom: 1px solid rgba(219, 194, 139, 0.08);
  background: rgba(6, 12, 16, 0.76);
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

.identity-card {
  border-color: rgba(123, 156, 167, 0.16);
}

.identity-role {
  margin-top: 0.8rem;
  font-size: 0.96rem;
  color: #d8c897;
}

.identity-workplace,
.hero-sub {
  margin-top: 0.3rem;
  font-size: 0.78rem;
  color: #7f97a0;
}

.intro-divider {
  width: 100%;
  height: 1px;
  margin: 1rem 0 1.2rem;
  background: linear-gradient(90deg, transparent, rgba(219, 194, 139, 0.25), transparent);
}

.intro-body {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.intro-body p {
  margin: 0;
  font-size: 0.98rem;
}

.intro-actions {
  margin-top: 1.4rem;
  justify-content: space-between;
}

.screen-hub {
  overflow: hidden;
}

.hub-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-card {
  border-radius: 18px;
  padding: 1.5rem 1.6rem;
}

.hero-title {
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  margin-top: 0.4rem;
}

.hero-text {
  margin-top: 0.9rem;
}

.hero-creed {
  margin-top: 0.6rem;
  color: #d4c59d;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.hub-card {
  border-radius: 18px;
  padding: 1.15rem 1.2rem;
}

.hub-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.stats-grid {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.stat-tile {
  padding: 0.9rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.stat-label {
  font-size: 0.72rem;
  color: #948a75;
  letter-spacing: 0.08em;
}

.stat-value {
  margin-top: 0.55rem;
  font-size: 1.45rem;
  color: #f0dfb1;
}

.stat-meta {
  margin-top: 0.45rem;
  font-size: 0.72rem;
}

.environment-phase {
  margin-top: 0.9rem;
  font-size: 0.78rem;
  color: #87a1aa;
}

.environment-name {
  margin-top: 0.35rem;
  font-size: 1.4rem;
  color: #e7d7aa;
}

.environment-text {
  margin-top: 0.75rem;
}

.equipment-list {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.collapsed-summary {
  margin-top: 0.9rem;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.equipment-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(219, 194, 139, 0.08);
}

.equipment-name {
  color: #e7d7ab;
  font-size: 0.96rem;
}

.equipment-desc {
  margin-top: 0.25rem;
  font-size: 0.78rem;
}

.equipment-level {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  color: #d8c898;
}

.equipment-level span {
  font-size: 1rem;
}

.equipment-level small {
  font-size: 0.7rem;
  color: #7f918f;
}

.action-card,
.snapshot-card {
  align-self: stretch;
}

.action-copy {
  margin-top: 0.9rem;
}

.action-btn {
  margin-top: 1rem;
  width: 100%;
}

.collapse-btn {
  border: 1px solid rgba(219, 194, 139, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  color: #b9ac8e;
  padding: 0.28rem 0.75rem;
  font-size: 0.76rem;
  letter-spacing: 0.08em;
}

.collapse-btn:hover {
  border-color: rgba(219, 194, 139, 0.34);
  color: #ead9af;
}

.hub-notice {
  margin-top: 0.8rem;
  padding: 0.8rem 0.9rem;
  border-radius: 12px;
  background: rgba(123, 156, 167, 0.08);
  border: 1px solid rgba(123, 156, 167, 0.18);
  color: #bdd0d6;
  line-height: 1.8;
}

.snapshot-card {
  grid-column: 1 / -1;
}

.snapshot-row + .snapshot-row {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(219, 194, 139, 0.08);
}

.modal-overlay {
  position: absolute;
  inset: 0;
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

.modal-title {
  margin-top: 0.55rem;
  font-size: 1.5rem;
  color: #f0dfb1;
}

.modal-text {
  margin-top: 0.9rem;
}

.modal-actions {
  margin-top: 1.3rem;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .hub-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .intro-actions,
  .title-actions,
  .hub-topbar,
  .intro-topbar,
  .hub-topbar-actions,
  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hub-main {
    padding: 1rem;
  }

  .title-panel,
  .intro-card,
  .hero-card,
  .hub-card {
    padding: 1.1rem;
  }

  .hub-card-header {
    align-items: flex-start;
  }

  .equipment-row {
    flex-direction: column;
  }

  .equipment-level {
    align-items: flex-start;
  }
}
</style>
