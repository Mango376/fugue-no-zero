<template>
  <div class="hub">
<!-- ========================
     开场黑屏
     ======================== -->
     <Transition name="splash-fade">
  <div v-if="showSplash" class="splash-screen">
    <div class="splash-text-wrap">
      <div class="splash-line-text" :class="{ visible: splashLine1 }">
        <div class="splash-main">琴弦拨动，奏鸣渐起</div>
        <div class="splash-sub">The strings are struck · the sonata begins</div>
      </div>
    </div>
  </div>
</Transition>


    <!-- 背景 -->
    <div class="bg-base"></div>
    <div class="bg-texture"></div>
    <div class="bg-scanlines"></div>

    <!-- 黑色遮罩（用于过渡） -->
    <Transition name="fade-black">
      <div v-if="showBlackMask" class="black-mask"></div>
    </Transition>

    <!-- ========================
         第一屏：Landing
         ======================== -->
    
         <Transition name="screen-fade">
           <div v-if="screen === 'landing'" class="screen landing-screen">
            <div class="landing-bg">
         <TransitionGroup name="bg-fade">
    <img
      v-for="(img, index) in bgImages"
      v-show="currentBg === index"
      :key="img"
      :src="img"
      class="bg-slide"
      alt=""
    />
  </TransitionGroup>
  <div class="landing-overlay"></div>
</div>

             <div class="landing-content" :class="{ visible: ready }">
               <div class="title-block">
                 <div class="title-left">
          <span>零</span>
          <span>号</span>
        </div>

        <!-- 中间竖线+小字 -->
        <div class="title-center">
          <div class="center-line"></div>
          <div class="center-text">声部交错·人人争鸣·理智与共·善意同行</div>
          <div class="center-line"></div>
        </div>

        <!-- 右字 -->
        <div class="title-right">
          <span>赋</span>
          <span>格</span>
        </div>

      </div>

      <!-- 副标题 -->
      <div class="landing-sub">
        触碰这曲名为理解的乐谱
      </div>

      <!-- 进入按钮 -->
      <button class="enter-btn" @click="enterGame">
        <span class="enter-btn-text">点击进入演奏</span>
      </button>

      <div v-if="hasAnySave" class="landing-save-actions">
  <button class="landing-save-btn" @click="continueGame">
    <span class="save-btn-icon">▶</span>
    继续游戏
  </button>
  <button class="landing-save-btn secondary" @click="openQuickLoad">
    <span class="save-btn-icon">◈</span>
    快速读档
  </button>
</div>
      <!-- 底部信息 -->
      <div class="landing-footer">
        <div class="footer-line">SYS·OBSERVATION·ACTIVE·FREQ</div>
        <div class="footer-line">@ by Mango</div>
      </div>

    </div>
  </div>
</Transition>

<!-- 快速读档弹窗 -->
<Transition name="modal-fade">
  <div v-if="showQuickLoad" class="modal-overlay" @click.self="closeQuickLoad">
    <div class="modal-box quickload-box">

      <!-- 顶部装饰 -->
      <div class="modal-deco-top">
        <span class="orn-line"></span>
        <span class="orn-diamond">◆</span>
        <span class="orn-line"></span>
      </div>

      <!-- 标题 -->
      <div class="modal-title">
        {{ quickLoadStep === 'scripts' ? '选择剧本' : selectedScriptInfo?.name }}
      </div>

      <!-- Step 1：选剧本 -->
      <div v-if="quickLoadStep === 'scripts'" class="ql-list">
        <div
          v-for="item in savesGrouped"
          :key="item.scriptId"
          class="ql-script-item"
          @click="selectScript(item)"
        >
          <div class="ql-script-left">
            <div class="ql-script-name">{{ item.scriptName }}</div>
            <div class="ql-script-phase">{{ item.phaseLabel }}</div>
          </div>
          <div class="ql-script-right">
            <span class="ql-save-count">{{ item.saves.length }} 个存档</span>
            <span class="ql-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- Step 2：选存档 -->
      <div v-if="quickLoadStep === 'saves'" class="ql-list">
        <div
          v-for="(save, index) in selectedScriptSaves"
          :key="save.id"
          class="ql-save-item"
        >
          <div class="ql-save-info">
            <div class="ql-save-slot">存档 {{ index + 1 }}</div>
            <div class="ql-save-time">{{ formatSaveTime(save.savedAt) }}</div>
          </div>
          <button class="ql-load-btn" @click="loadFromQuick(save)">
            读取
          </button>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="ql-footer">
        <button
          v-if="quickLoadStep === 'saves'"
          class="modal-btn secondary"
          @click="quickLoadStep = 'scripts'"
        >
          ‹ 返回
        </button>
        <button class="modal-btn" @click="closeQuickLoad">
          关闭
        </button>
      </div>

      <!-- 底部装饰 -->
      <div class="modal-deco-bottom">
        <span class="orn-line"></span>
        <span class="orn-diamond">◆</span>
        <span class="orn-line"></span>
      </div>

    </div>
  </div>
</Transition>

<!-- 版权弹窗 -->
    <Transition name="modal-fade">
      <div v-if="showCopyright" class="modal-overlay" @click.self="closeCopyright">
        <!-- 【关键修改】：加上 copyright-box 类名 -->
        <div class="modal-box copyright-box" :style="{ '--copy-bg': `url(${copyBgImg})` }">
          <div class="modal-deco-top">
            <span class="orn-line"></span>
            <span class="orn-diamond">◆</span>
            <span class="orn-line"></span>
          </div>
          <!-- ... 里面的内容保持不变 ... -->

          <div class="modal-title">创作声明</div>

<div class="modal-content">
  <div class="copyright-line">本作品灵感、视觉、音乐</div>
  <div class="copyright-line">均由 <span class="highlight">滄璃</span> 独立完成</div>
  <div class="copyright-line highlight-line">不授权任何参考与借鉴</div>
  <div class="copyright-line warning-line">请尊重他人的创作成果</div>
</div>

          <button class="modal-btn" @click="confirmCopyright">
            我已悉知
          </button>
          <div class="modal-deco-bottom">
            <span class="orn-line"></span>
            <span class="orn-diamond">◆</span>
            <span class="orn-line"></span>
          </div>
        </div>
      </div>
    </Transition>

      <!-- ========================
         第二屏：介绍页
         ======================== -->
         <Transition name="screen-fade">
      <div 
        v-if="screen === 'intro'" 
        class="screen intro-screen"
        :style="{ '--intro-bg': `url(${introBgImg})` }"
      >
        <div class="intro-content" :class="{ visible: introReady }">
          <div class="intro-header">
            <div class="intro-ornament">
              <span class="orn-line"></span>
              <span class="orn-diamond">◆</span>
              <span class="orn-text">关于本作</span>
              <span class="orn-diamond">◆</span>
              <span class="orn-line"></span>
            </div>
            <h2 class="intro-title">零号赋格</h2>
            <p class="intro-subtitle">Fugue No · Zero</p>
          </div>

          <div class="intro-body">
            <p class="intro-quote">
              "欢迎触碰这曲名为理解的乐谱。"
            </p>
            <div class="intro-divider"></div>
            <p class="intro-text">
              我们生活在一个声部交错、人人争抢领唱权的时代。
            </p>
            <p class="intro-text">
              《零号赋格》是一部由十四个剧本构成的模拟器集合，
              以赋格曲的结构为骨架，分为四个声部相位。
            </p>
            <p class="intro-text">
              每个剧本都是一次身份体验，一种视角切换，一次
              关于人与人之间如何误读、如何理解、如何和解的思考实验。
            </p>
            <div class="intro-divider"></div>
            <p class="intro-text muted">
              你将扮演那位"作曲家"，
              在十四个处于失序边缘的剧本中，
              寻找那个能让所有人回归 Tonic 的终极共振。
            </p>
            <div class="intro-tags">
              <span class="tag">换位思考</span>
              <span class="tag">人文关怀</span>
              <span class="tag">社会反思</span>
              <span class="tag">叙事模拟</span>
            </div>
          </div>

          <div class="intro-footer">
            <button class="next-btn" @click="goToPhases">
              进入演奏厅
              <span class="next-arrow">›</span>
            </button>
          </div>

        </div>

      </div>
    </Transition>

<!-- ========================
     第三屏：四个板块选择
     ======================== -->
     <Transition name="screen-fade">
      <div 
        v-if="screen === 'phases'" 
        class="screen phases-screen"
        :style="{ '--phases-bg': `url(${phasesBgImg})` }"
      >
        <div class="phases-content" :class="{ visible: phasesReady }">

      <div class="phases-header">
        <div class="phases-ornament">
          <span class="orn-line"></span>
          <span class="orn-diamond">◆</span>
          <span class="orn-text">选择声部</span>
          <span class="orn-diamond">◆</span>
          <span class="orn-line"></span>
        </div>
        <p class="phases-sub">四个声部相位 · 十四个剧本</p>
      </div>

     <!-- 替换原有的 score-table 区域 -->
<div class="score-table">
  <div
    v-for="(phase, index) in phasesWithState"
    :key="phase.id"
    class="score-paper"
    :class="[
      `paper-${index}`,
      { 'paper-locked': phase.id === 'phase3' || phase.id === 'phase4' }
    ]"
    :style="{ backgroundImage: `url(${phaseBgs[index]})` }"
    @click="openPhaseModal(phase)"
  >
    <div class="paper-overlay"></div>

    <!-- 锁定标记（仅三四章显示） -->
    <div v-if="phase.id === 'phase3' || phase.id === 'phase4'" class="paper-lock-badge">
      <span class="lock-icon">🔒</span>
    </div>

    <div class="paper-phase-num">Phase · {{ phase.roman }}</div>
    <div class="paper-title">{{ phase.label.split('·').pop().trim() }}</div>
  </div>
</div>



    </div>
  </div>
</Transition>

<!-- 章节弹窗 -->
<Transition name="modal-fade">
  <div v-if="showPhaseModal" class="modal-overlay" @click.self="closePhaseModal">
    <div class="phase-modal" :style="{ '--dynamic-bg': `url(${currentModalBg})` }">
      
      <!-- 关闭按钮 -->
      <button class="phase-modal-close" @click="closePhaseModal">✕</button>
        
      <div class="modal-deco-top">
        <span class="orn-line"></span>
        <span class="orn-diamond">◆</span>
        <span class="orn-line"></span>
      </div>

      <div class="phase-modal-roman">Phase · {{ activeModalPhase?.roman }}</div>
      <div class="phase-modal-label">{{ activeModalPhase?.label }}</div>
      <div class="phase-modal-name">{{ activeModalPhase?.name }}</div>

      <div class="phase-modal-divider"></div>

      <p class="phase-modal-quote">「 {{ activeModalPhase?.quote }} 」</p>

      <div class="phase-modal-divider"></div>

      <div class="phase-modal-footer">
        <span class="phase-modal-count">
          {{ activeModalPhase?.sims.filter(s => s.unlocked).length }}
          /
          {{ activeModalPhase?.sims.length }} 已解锁
        </span>
        <button class="phase-modal-enter" @click="enterPhase(activeModalPhase); closePhaseModal()">
          进入声部 ›
        </button>
      </div>

      <div class="modal-deco-bottom">
        <span class="orn-line"></span>
        <span class="orn-diamond">◆</span>
        <span class="orn-line"></span>
      </div>

    </div>
  </div>
</Transition>

<!-- 暂未解锁弹窗（第三、四章） -->
<Transition name="modal-fade">
  <div v-if="showLockedPhaseModal" class="modal-overlay" @click.self="closeLockedPhaseModal">
    <div class="modal-box locked-modal-box">

      <div class="modal-deco-top">
        <span class="orn-line"></span>
        <span class="orn-diamond">◆</span>
        <span class="orn-line"></span>
      </div>

      <div class="locked-modal-icon">⊘</div>
      <div class="modal-title">声部封印中</div>
      <div class="modal-content">
        尚未达成解锁此声部的条件。<br/>
        <span class="highlight">请先完成前序声部的体验。</span>
      </div>

      <button class="modal-btn" @click="closeLockedPhaseModal">
        我知道了
      </button>

      <div class="modal-deco-bottom">
        <span class="orn-line"></span>
        <span class="orn-diamond">◆</span>
        <span class="orn-line"></span>
      </div>

    </div>
  </div>
</Transition>


    <!-- ========================
         第四屏：板块详情
         ======================== -->
    <Transition name="screen-fade">
      <div 
        v-if="screen === 'phase-detail'" 
        class="screen detail-screen"
        :style="{ '--detail-bg': `url(${detailBgImg})` }"
      >

        <!-- 左上角返回按钮 -->
        <button class="back-btn" @click="goBackToPhases">
          ‹ 返回选择
        </button>

        <div class="detail-content" :class="{ visible: detailReady }">

          <!-- 板块标题 -->
          <div class="detail-header">
            <div class="detail-roman">{{ currentPhaseWithState?.roman }}</div>
<div class="detail-titles">
  <div class="detail-label">{{ currentPhaseWithState?.label }}</div>
  <div class="detail-name">{{ currentPhaseWithState?.name }}</div>
</div>

          </div>

          <div class="detail-quote">「 {{ currentPhaseWithState?.quote }} 」</div>
          <div class="detail-divider"></div>

          <!-- 模拟器列表 -->
          <div class="sim-list">
            <div v-for="sim in currentPhaseWithState?.sims"
              :key="sim.id"
              class="sim-item"
              :class="{
                unlocked: sim.unlocked,
                locked: !sim.unlocked,
                active: activeSim === sim.id
              }"
              @click="sim.unlocked && toggleSim(sim.id)"
            >
              <!-- 标题行 -->
              <div class="sim-item-header">
                <div class="sim-item-left">
                  <div class="sim-status-icon" :class="{ playing: sim.unlocked }">
                    <span v-if="!sim.unlocked" class="locked-dot">○</span>
                    <div v-else class="audio-bars">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div class="sim-item-titles">
                    <span class="sim-item-name">{{ sim.name }}</span>
                    <span class="sim-item-tag">{{ sim.unlocked ? sim.tag : '待解锁' }}</span>
                  </div>
                </div>
                <span v-if="sim.unlocked" class="sim-item-arrow" :class="{ open: activeSim === sim.id }">›</span>
                <span v-else class="sim-item-lock">暂锁</span>
              </div>

              <!-- 展开详情 -->
              <Transition name="slide-down">
                <div v-if="sim.unlocked && activeSim === sim.id" class="sim-item-detail">

                  <!-- 背景介绍 -->
                  <div class="sim-bg-label">
                    <span class="orn-diamond small">◆</span>
                    剧本背景
                  </div>
                  <p class="sim-item-desc">{{ sim.desc }}</p>

                  <!-- 操作按钮 -->
                  <div class="sim-item-actions">
                    <button class="btn-start" @click.stop="startGame(sim)">
                      ▶ 开始新游戏
                    </button>
                    <button
                      class="btn-load"
                      :class="{ disabled: !sim.hasSave }"
                      @click.stop="sim.hasSave && loadGame(sim)"
                    >
                      {{ sim.hasSave ? '◈ 读取存档' : '暂无存档' }}
                    </button>
                  </div>

                </div>
              </Transition>

            </div>
          </div>

        </div>

      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useAudioStore } from '@/stores/audioStore'
import saveService from '@/services/saveService'
const bg1       = 'https://drive-cdn.mujian.me/49/41e3d912-a974-4a56-98c3-93084db9d013_landing-bg-1.jpg'
const bg2       = 'https://drive-cdn.mujian.me/49/32916e5d-20ad-40cf-a49b-760518d53761_landing-bg-2.jpg'
const bg3       = 'https://drive-cdn.mujian.me/49/d75440a2-115d-41af-8775-5ccb83917b43_landing-bg-3.jpg'
const bg4       = 'https://drive-cdn.mujian.me/49/be8c86d1-8709-4444-9bcb-13b01cf1ad49_landing-bg-4.jpg'
const bg5       = 'https://drive-cdn.mujian.me/49/539d3316-7f0c-4701-a7f8-2b7524f9c9df_landing-bg-5.jpg'
const copyBgImg = 'https://drive-cdn.mujian.me/49/d731e0bf-1f2d-4bc3-abf3-efda12b2437d_copyright-bg.png'
const introBgImg  = 'https://drive-cdn.mujian.me/49/ed924b33-cc28-425b-8531-c4c41ade2005_intro-bg.jpg'
const phasesBgImg = 'https://drive-cdn.mujian.me/49/5704f1ab-0d8d-48aa-8dcb-5c1b8ae38f67_phases-bg.jpg'
const phase1Bg  = 'https://drive-cdn.mujian.me/49/2cdf9e2e-d44f-4542-8f37-e65cb7db90b1_phase1.png'
const phase2Bg  = 'https://drive-cdn.mujian.me/49/308e8166-12df-431e-bb5c-e2521bb41770_phase2.png'
const phase3Bg  = 'https://drive-cdn.mujian.me/49/9ddcafd4-048e-4a55-8281-d7d55bd23d83_phase3.png'
const phase4Bg  = 'https://drive-cdn.mujian.me/49/aa1ad758-f151-4c7b-a201-35c84a2db112_phase4.png'
const detailBg1 = 'https://drive-cdn.mujian.me/49/bb39c4c4-801a-4b1d-a9a8-ce801c0b103f_detail-bg1.jpg'
const detailBg2 = 'https://drive-cdn.mujian.me/49/61f1a867-2661-4a89-942e-f08fc2a3200e_detail-bg2.jpg'
const detailBg3 = 'https://drive-cdn.mujian.me/49/22f5ff98-b398-4eb1-a26e-02c9b9e6a74e_detail-bg3.jpg'
const detailBg4 = 'https://drive-cdn.mujian.me/49/1d548199-9404-4c90-b0c1-87333dc42a31_detail-bg4.jpg'

const hubPlaylist = [
  'https://drive-cdn.mujian.me/49/dd62e196-95ef-415e-99f1-3911349eba98_zore_bg1.mp3',
  'https://drive-cdn.mujian.me/49/a3b00dbb-a202-4d95-bbb5-584182bb84e6_zore_bg.2.mp3',
  'https://drive-cdn.mujian.me/49/95eb33fe-eeae-4a32-abe0-b74214ad7ef4_zore_bg.3.mp3',
  'https://drive-cdn.mujian.me/49/a75eeecf-23b0-49e0-afb0-30db581cbace_zore_bg.4.mp3',
  'https://drive-cdn.mujian.me/49/4a91a7fb-6b91-4430-b5ff-8b37d0997c84_zore_bg.5.mp3',
]


// ========================
// 基础常量
// ========================
const bgImages  = [bg1, bg2, bg3, bg4, bg5]
const phaseBgs  = [phase1Bg, phase2Bg, phase3Bg, phase4Bg]
const detailBgs = [detailBg1, detailBg2, detailBg3, detailBg4]


// ========================
// Store / Router
// ========================
const store      = useGameStore()
const audioStore = useAudioStore()
const router     = useRouter()

// ========================
// Hub 背景音乐
// ========================
const hubAudio = ref(null)
const hubMusicStarted = ref(false)
function startHubMusic() {
  // ← 已经启动过就不再重复创建
  if (hubMusicStarted.value) return
  hubMusicStarted.value = true

  const randomIndex = Math.floor(Math.random() * hubPlaylist.length)
  hubAudio.value = new Audio(hubPlaylist[randomIndex])
  hubAudio.value.loop = false

  hubAudio.value.addEventListener('ended', () => {
    let nextIndex
do {
  nextIndex = Math.floor(Math.random() * hubPlaylist.length)
} while (hubPlaylist[nextIndex] === hubAudio.value.src)
hubAudio.value.src = hubPlaylist[nextIndex]

    hubAudio.value.play().catch(() => {})
  })

  hubAudio.value.play()
    .then(() => {
      audioStore.register(hubAudio.value)
      audioStore.fadeIn(hubAudio.value, 0.5, 2000)
      document.removeEventListener('click',      unlockHubMusic)
      document.removeEventListener('touchstart', unlockHubMusic)
    })
    .catch(() => {
      console.warn('Hub 音乐等待用户交互...')
    })
}


// 首次点击屏幕时解锁音频
const unlockHubMusic = () => {
  if (!hubAudio.value) {
    // 还没创建过，直接启动
    startHubMusic()
  } else if (hubAudio.value.paused) {
    // 已创建但被拦截暂停，继续播放
    hubAudio.value.play()
      .then(() => {
        audioStore.register(hubAudio.value)
        audioStore.fadeIn(hubAudio.value, 0.5, 2000)
      })
      .catch(() => {})
  }
  document.removeEventListener('click',      unlockHubMusic)
  document.removeEventListener('touchstart', unlockHubMusic)
}


// ========================
// 背景图轮播
// ========================
const currentBg = ref(0)
let bgTimer = null

function startBgSlideshow() {
  currentBg.value = Math.floor(Math.random() * bgImages.length)
  bgTimer = setInterval(() => {
    currentBg.value = (currentBg.value + 1) % bgImages.length
  }, 3000)
}

// ========================
// 界面状态
// ========================
const screen      = ref('landing')
const showSplash  = ref(true)
const splashLine1 = ref(false)
const ready       = ref(false)
const introReady  = ref(false)
const phasesReady = ref(false)
const detailReady = ref(false)
const showBlackMask    = ref(false)
const showCopyright    = ref(false)
const showLockedPhaseModal = ref(false)
const showPhaseModal   = ref(false)
const activeModalPhase = ref(null)
const currentPhase     = ref(null)
const activeSim        = ref(null)

// ========================
// 快速读档
// ========================
const showQuickLoad    = ref(false)
const quickLoadStep    = ref('scripts')
const allSaves         = ref([])
const selectedScriptId = ref(null)
const hasSaves         = ref({})

const hasAnySave = computed(() => Object.keys(hasSaves.value).length > 0)

const selectedScriptInfo = computed(() => {
  if (!selectedScriptId.value) return null
  for (const phase of phases.value) {
    const sim = phase.sims.find(s => s.id === selectedScriptId.value)
    if (sim) return { name: sim.name, route: sim.route }
  }
  return null
})

const savesGrouped = computed(() => {
  const map = {}
  for (const save of allSaves.value) {
    if (!map[save.scriptId]) map[save.scriptId] = []
    map[save.scriptId].push(save)
  }
  return Object.entries(map).map(([scriptId, saves]) => {
    let scriptName = scriptId, phaseLabel = '', route = ''
    for (const phase of phases.value) {
      const sim = phase.sims.find(s => s.id === scriptId)
      if (sim) { scriptName = sim.name; phaseLabel = phase.label; route = sim.route; break }
    }
    return { scriptId, scriptName, phaseLabel, route, saves }
  })
})

const selectedScriptSaves = computed(() =>
  savesGrouped.value.find(g => g.scriptId === selectedScriptId.value)?.saves || []
)

async function openQuickLoad() {
  allSaves.value = await saveService.getAllSaves()
  quickLoadStep.value = 'scripts'
  selectedScriptId.value = null
  showQuickLoad.value = true
}
function closeQuickLoad() { showQuickLoad.value = false }
function selectScript(item) { selectedScriptId.value = item.scriptId; quickLoadStep.value = 'saves' }
function loadFromQuick(save) {
  showQuickLoad.value = false
  const group = savesGrouped.value.find(g => g.scriptId === save.scriptId)
  if (group?.route) router.push({ path: group.route, query: { load: save.id } })
}
function formatSaveTime(ts) {
  if (!ts) return '未知时间'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// ========================
// 章节弹窗
// ========================
const currentModalBg = computed(() => {
  if (!activeModalPhase.value) return ''
  const index = phases.value.findIndex(p => p.id === activeModalPhase.value.id)
  return index !== -1 && phaseBgs[index] ? phaseBgs[index] : ''
})

function openPhaseModal(phase) {
  if (phase.id === 'phase3' || phase.id === 'phase4') {
    showLockedPhaseModal.value = true
    return
  }
  activeModalPhase.value = phase
  showPhaseModal.value = true
}
function closePhaseModal()       { showPhaseModal.value = false; activeModalPhase.value = null }
function closeLockedPhaseModal() { showLockedPhaseModal.value = false }

// ========================
// 详情背景图
// ========================
const detailBgImg = computed(() => {
  if (!currentPhase.value) return detailBg1
  const index = phases.value.findIndex(p => p.id === currentPhase.value.id)
  return index !== -1 ? detailBgs[index] : detailBg1
})

const currentPhaseWithState = computed(() =>
  phasesWithState.value.find(p => p.id === currentPhase.value?.id) || null
)

// ========================
// 游戏流程
// ========================
async function continueGame() {
  showBlackMask.value = true
  await delay(600)
  screen.value = 'phases'
  showBlackMask.value = false
  phasesReady.value = true
}

async function enterGame() {
  showBlackMask.value = true
  await delay(1200)
  showCopyright.value = true
}

async function loadHasSaves() {
  const all = await saveService.getAllSaves()
  const map = {}
  all.forEach(s => { map[s.scriptId] = true })
  hasSaves.value = map
}

function closeCopyright() {}

async function confirmCopyright() {
  showCopyright.value = false
  await delay(400)
  screen.value = 'intro'
  showBlackMask.value = false
  introReady.value = false
  await delay(200)
  introReady.value = true
}

async function goToPhases() {
  showBlackMask.value = true
  await delay(600)
  screen.value = 'phases'
  showBlackMask.value = false
  phasesReady.value = false
  await delay(200)
  phasesReady.value = true
}

async function enterPhase(phase) {
  showBlackMask.value = true
  await delay(500)
  currentPhase.value = phase
  activeSim.value = null
  screen.value = 'phase-detail'
  showBlackMask.value = false
  detailReady.value = false
  await delay(200)
  detailReady.value = true
}

async function goBackToPhases() {
  showBlackMask.value = true
  await delay(400)
  screen.value = 'phases'
  currentPhase.value = null
  activeSim.value = null
  showBlackMask.value = false
  phasesReady.value = true
}

function toggleSim(id) {
  activeSim.value = activeSim.value === id ? null : id
}

async function startGame(sim) {
  sessionStorage.setItem('hubReturn', JSON.stringify({ phaseId: currentPhase.value?.id }))
  store.startTransition()
  await delay(800)
  router.push(sim.route)
}

async function loadGame(sim) {
  sessionStorage.setItem('hubReturn', JSON.stringify({ phaseId: currentPhase.value?.id }))
  store.startTransition()
  await delay(800)
  router.push({ path: sim.route, query: { load: 'true' } })
}

// ========================
// 工具函数
// ========================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ========================
// 数据
// ========================
const phases = ref([
  {
    id: 'phase1',
    roman: 'I',
    label: '映·幽境初明',
    name: '看见',
    quote: '在演奏开始之前，你先看到的是演奏者',
    sims: [
      { id: 'dream-layer',  name: '调率者：梦域', tag: '潜意识修补模拟器', desc: '在科技发达的时代，人们在高强度的压力下努力前进，思维变得越发活跃却也逐渐脆弱，当人们终于扛不住压力时，意识的坍缩的风暴席卷而来。', alwaysUnlocked: true, hasSave: false, route: '/phase1/dream-layer' },
      { id: 'echo-city',    name: '未解锁', tag: '论坛管理员模拟器', desc: '你是一名论坛管理员。通过删帖、禁言、处理申诉来控制对立情绪。', unlocked: false, hasSave: false, route: '/phase1/echo-city' },
      { id: 'synesthesia',  name: '共觉之境', tag: '感官修复模拟器', desc: '2157年，一场仿生人的"流感"席卷而来，在这个机器可以随时被淘汰的时代，每个"人"都在努力的活着。', alwaysUnlocked: true, hasSave: false, route: '/phase1/synesthesia' },
      { id: 'unsent',       name: '未解锁', tag: '草稿箱模拟器', desc: '你意外收到了一个陌生人临终前的手机。里面全是从未发送的草稿。', unlocked: false, hasSave: false, route: '/phase1/unsent' },
    ]
  },
  {
    id: 'phase2',
    roman: 'II',
    label: '闻·弦动乐起',
    name: '倾听',
    quote: '当乐声渐起，每个声部都有自己的故事',
    sims: [
      { id: 'letter-writer', name: '执笔者', tag: '代写书信模拟器', desc: '1980年代，某个南方小城。你在街边摆了一张桌子，为不识字或不会写信的人代笔。', alwaysUnlocked: true, hasSave: false, route: '/phase2/letter-writer' },
      { id: 'listener',      name: '未解锁', tag: '危机热线模拟器', desc: '你是一条危机热线的接线员。', unlocked: false, hasSave: false, route: '/phase2/listener' },
      { id: 'listener2',     name: '未解锁', tag: '危机热线模拟器', desc: '你是一条危机热线的接线员。', unlocked: false, hasSave: false, route: '/phase2/listener' },
      { id: 'listener3',     name: '未解锁', tag: '危机热线模拟器', desc: '你是一条危机热线的接线员。', unlocked: false, hasSave: false, route: '/phase2/listener' },
    ]
  },
  {
    id: 'phase3',
    roman: 'III',
    label: '知·理乐共振',
    name: '理解',
    quote: '如果你能听见千年前的余震，你就会明白当下的每一声叹息',
    sims: [
      { id: 'ai-day-one',     name: 'AI的第一天',   tag: '算法视角模拟器',     desc: '身份反转。你扮演一个刚刚觉醒的AI。', unlocked: false, hasSave: false, route: '/phase3/ai-day-one' },
      { id: 'digital-estate', name: '社交遗产',     tag: '数字遗产管理模拟器', desc: '有人三天前突然离世，你受委托管理他的社交账号。', unlocked: false, hasSave: false, route: '/phase3/digital-estate' },
      { id: 'last-witness',   name: '最后的见证人', tag: '消逝记录模拟器',     desc: '你的工作是记录正在消失的事物。', unlocked: false, hasSave: false, route: '/phase3/last-witness' },
    ]
  },
  {
    id: 'phase4',
    roman: 'IV',
    label: '敬·曲终韵止',
    name: '尊重',
    quote: '最后，当碳基的呼吸遇上硅基的脉冲，我们终将听见那场未完成的进化',
    sims: [
      { id: 'crumbling-language', name: '即将瓦解的语言', tag: '语义熵减模拟器',     desc: '系统陆续通知你："概念\'颜色\'已从公共词库移除"。', unlocked: false, hasSave: false, route: '/phase4/crumbling-language' },
      { id: 'grey-scales',        name: '灰色的天平',     tag: '道德困境模拟器',     desc: '资源极度匮乏的未来，你是资源分配算法的人类审核员。', unlocked: false, hasSave: false, route: '/phase4/grey-scales' },
      { id: 'last-archive',       name: '最后一份档案',   tag: '意义与自动化模拟器', desc: '高度自动化的未来，你是一名档案管理员。', unlocked: false, hasSave: false, route: '/phase4/last-archive' },
    ]
  }
])

const phasesWithState = computed(() =>
  phases.value.map(phase => ({
    ...phase,
    sims: phase.sims.map(sim => ({
      ...sim,
      unlocked: sim.alwaysUnlocked || store.isUnlocked(sim.id),
      hasSave:  hasSaves.value[sim.id] || false
    }))
  }))
)

// ========================
// 生命周期
// ========================
onMounted(async () => {
  const saved = sessionStorage.getItem('hubReturn')

  // ✅ 只注册监听器，不创建 Audio
  if (!saved) {
    document.addEventListener('click',      unlockHubMusic)
    document.addEventListener('touchstart', unlockHubMusic)
  }

  store.setGlobalApiBtn(false)

  // 开场动画
  await delay(3000)
  splashLine1.value = true
  await delay(3500)
  splashLine1.value = false
  await delay(1500)
  showSplash.value = false

  store.setGlobalApiBtn(true)
  startBgSlideshow()
  await store.loadUnlocked()
  await loadHasSaves()

  if (saved) {
    sessionStorage.removeItem('hubReturn')
    const { phaseId } = JSON.parse(saved)
    const phase = phasesWithState.value.find(p => p.id === phaseId)
    if (phase) {
      currentPhase.value = phase
      screen.value       = 'phase-detail'
      detailReady.value  = true
      phasesReady.value  = true
      ready.value        = true
      store.setGlobalApiBtn(true)
      await delay(1500)
      startHubMusic()
      document.removeEventListener('click',      unlockHubMusic)
      document.removeEventListener('touchstart', unlockHubMusic)
      return
    }
  }

  setTimeout(() => { ready.value = true }, 300)
  startHubMusic()
})


onUnmounted(() => {
  if (bgTimer) clearInterval(bgTimer)

  document.removeEventListener('click',      unlockHubMusic)
  document.removeEventListener('touchstart', unlockHubMusic)

  setTimeout(() => {
    hubAudio.value?.pause()
    audioStore.register(null)
  }, 1000)
})
</script>


<style scoped>
/* ========================
   基础
   ======================== */
.hub {
  width: 100%;
  min-height: var(--app-height);
  height: var(--app-height);
  position: fixed;   /* ← 改成fixed */
  inset: 0;
  overflow: hidden;
  color: #2c1f0e;
  font-family: '正文中文', 'KaiTi', serif;
}

/* 1. 底层保持暖色，但加入中心高光（探照灯/聚焦感） */
.bg-base {
  position: fixed;
  inset: 0;
  /* 使用径向渐变，四周暗，中间亮 */
  background: radial-gradient(circle at 50% 50%, #f6eee0 0%, #e8d5b5 45%, #c8b080 100%);
  z-index: 0;
}

/* 2. 噪点层加入微弱的“呼吸”动画 */
.bg-texture {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  z-index: 0;
  pointer-events: none;
  animation: textureBreathing 8s ease-in-out infinite alternate;
}

/* 3. 新增：微弱的水平扫描线（既像老式监视器，又像乐谱的五线谱底纹） */
.bg-scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(140, 100, 40, 0.03) 2px,
    rgba(140, 100, 40, 0.03) 4px
  );
  z-index: 0;
  pointer-events: none;
}

/* 呼吸动画 */
@keyframes textureBreathing {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

/* ========================
   全局遮罩
   ======================== */
.black-mask {
  position: fixed;
  inset: 0;
  background: #0a0800;
  z-index: 50;
}
.fade-black-enter-active,
.fade-black-leave-active {
  transition: opacity 0.8s ease;
}
.fade-black-enter-from,
.fade-black-leave-to { opacity: 0; }
.fade-black-enter-to,
.fade-black-leave-from { opacity: 1; }

/* ========================
   版权弹窗
   ======================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  min-height: var(--app-height);
  background: rgba(10, 8, 0, 0.85);
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    calc(2rem + var(--safe-top))
    calc(2rem + var(--safe-right))
    calc(2rem + var(--safe-bottom))
    calc(2rem + var(--safe-left));
}
.modal-box {
  background: linear-gradient(160deg, #f5edd8, #eddfc0);
  border: 1px solid rgba(180, 140, 60, 0.4);
  border-radius: 8px;
  padding: 2.5rem 3rem;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;
  max-height: calc(var(--app-height) - var(--safe-top) - var(--safe-bottom) - 4rem);
  overflow-y: auto;
}

/* ========================
   专属版权弹窗样式 (带背景图版)
   ======================== */
.copyright-box {
  background: transparent; 
  border: none;
  box-shadow: none;
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.4));
  border-radius: 4px; /* 保留一点点圆角 */
  overflow: hidden; /* 保证背景图不会溢出圆角 */
}

/* 使用伪元素做背景，方便控制叠加层 */
.copyright-box::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0; /* 垫在文字下面 */
  
  background-image: 
    var(--copy-bg); 
    
  background-size: cover;
  background-position: center;
}

.copyright-box > * {
  position: relative;
  z-index: 1;
}

.copyright-box .modal-title,
.copyright-box .modal-content,
.copyright-box .modal-warning {
  text-shadow: 
    0 0 6px rgba(255, 255, 255, 1), 
    0 0 12px rgba(255, 255, 255, 0.8);
}

.modal-deco-top,
.modal-deco-bottom {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.modal-deco-bottom {
  margin-bottom: 0;
  margin-top: 1.5rem;
}
.modal-title {
  font-size: 1.2rem;
  color: #3a2808;
  letter-spacing: 0.3em;
  margin-bottom: 1.5rem;
  font-family: '正文中文', 'KaiTi', serif;
}
.modal-content {
  font-size: 0.9rem;
  color: #5a4020;
  line-height: 2;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}
.highlight {
  color: #8a3010;
  font-weight: bold;
}
.modal-warning {
  font-size: 0.95rem;
  color: #c03020;
  letter-spacing: 0.15em;
  margin-bottom: 1.8rem;
  font-weight: bold;
}
.modal-btn {
  position: relative;
  overflow: hidden;
  padding: 0.75rem 2.8rem;
  background: linear-gradient(
    180deg,
    #a07228 0%,
    #7a5018 40%,
    #5a3808 100%
  );
  border: none;
  border-radius: 5px;
  color: #f5e8c0;
  font-family: '正文中文', 'KaiTi', serif;
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              background 0.25s ease;
  box-shadow:
    inset 0  1px 0 rgba(255, 220, 120, 0.35),
    inset 0 -2px 0 rgba(30, 12, 0, 0.35),
    0 0 0 1px rgba(80, 40, 5, 0.55),
    0 4px 10px rgba(60, 28, 4, 0.30),
    0 8px 20px rgba(60, 28, 4, 0.15);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.modal-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45%;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.18),
    rgba(255, 255, 255, 0));
  border-radius: 5px 5px 0 0;
  pointer-events: none;
}

.modal-btn:hover {
  background: linear-gradient(
    180deg,
    #b08235 0%,
    #8a6025 40%,
    #6a4515 100%
  );
  transform: translateY(-2px);
  box-shadow:
    inset 0  1px 0 rgba(255, 228, 130, 0.4),
    inset 0 -2px 0 rgba(30, 12, 0, 0.40),
    0 0 0 1px rgba(90, 48, 8, 0.6),
    0 6px 16px rgba(60, 28, 4, 0.38),
    0 12px 28px rgba(60, 28, 4, 0.18);
}

.modal-btn:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 2px 5px rgba(30, 12, 0, 0.35),
    0 0 0 1px rgba(80, 40, 5, 0.5),
    0 2px 6px rgba(60, 28, 4, 0.20);
}

.modal-btn.secondary {
  background: transparent;
  border: 1px solid rgba(140, 100, 40, 0.3);
  color: #7a5830;
  box-shadow: none;
}
.modal-btn.secondary::before { display: none; }
.modal-btn.secondary:hover {
  background: rgba(200, 160, 70, 0.08);
  transform: translateY(-1px);
  box-shadow: none;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.4s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}


/* ========================
   左右竖排文字
   ======================== */
.side-text {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  opacity: 0;
  transition: opacity 2s ease 0.5s;
  z-index: 5;
  pointer-events: none;
}
.side-text.visible { opacity: 1; }
.side-left { left: 1.8rem; }
.side-right { right: 1.8rem; }
.side-text span {
  font-size: 0.7rem;
  color: rgba(140, 100, 40, 0.28);
  writing-mode: vertical-rl;
}
.side-dot { color: rgba(140, 100, 40, 0.15) !important; margin: 0.2rem 0; }

/* ========================
   通用装饰元素
   ======================== */
.orn-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(140, 100, 40, 0.6));
  animation: lineBreathe 3s ease-in-out infinite alternate;
}
.orn-line:last-child {
  background: linear-gradient(90deg, rgba(140, 100, 40, 0.6), transparent);
  animation: lineBreathe 3s ease-in-out infinite alternate-reverse;
}
.orn-diamond { 
  font-size: 0.45rem; 
  color: #9a7a40; 
  opacity: 0.7; 
  display: inline-block; 
  animation: diamondPulse 4s ease-in-out infinite;
}
.orn-diamond.small { 
  font-size: 0.35rem; 
}

@keyframes lineBreathe {
  0% {
    opacity: 0.4;
    filter: drop-shadow(0 0 0px rgba(180, 140, 60, 0));
  }
  100% {
    opacity: 1;
    filter: drop-shadow(0 1px 3px rgba(180, 140, 60, 0.6));
  }
}

/* 菱形的动画：极其缓慢的缩小放大、发光，并伴随45度的旋转（像星星闪烁） */
@keyframes diamondPulse {
  0%, 100% {
    transform: scale(0.9) rotate(0deg);
    filter: drop-shadow(0 0 2px rgba(180, 140, 60, 0.2));
  }
  50% {
    transform: scale(1.15) rotate(45deg); /* 旋转45度 */
    filter: drop-shadow(0 0 6px rgba(200, 160, 64, 0.9)); /* 亮起时增加发光 */
  }
}

.orn-text {
  font-size: 0.62rem;
  letter-spacing: 0.35em;
  color: #9a7a40;
  font-family: '内容英文', 'Courier New', monospace;
  opacity: 0.8;
  white-space: nowrap;
}

/* ========================
   屏幕切换动画
   ======================== */
.screen {
  position: fixed;   /* ← 改成fixed */
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  z-index: 2;
  box-sizing: border-box;
  min-height: var(--app-height);
}

.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 0.6s ease;
}
.screen-fade-enter-from,
.screen-fade-leave-to { opacity: 0; }

/* ========================
Landing 屏
======================== */
.landing-screen {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.landing-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.landing-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

/* ========================
   Landing 存档按钮组
   ======================== */
.landing-save-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: -0.4rem;
}

.landing-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.62rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: '正文中文', 'KaiTi', serif;
  font-size: 0.85rem;
  color: #221205;
  letter-spacing: 0.15em;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: linear-gradient(
    155deg,
    rgba(255, 251, 236, 0.80) 0%,
    rgba(246, 236, 210, 0.72) 100%
  );
  box-shadow:
    inset 0  1px 0 rgba(255, 240, 170, 0.75),
    inset 0 -2px 0 rgba(90, 45, 5, 0.16),
    0 0 0 1px rgba(140, 100, 35, 0.25),
    0 3px 8px  rgba(90, 45, 5, 0.12),
    0 6px 16px rgba(90, 45, 5, 0.07);
  text-shadow: 0 1px 0 rgba(255, 225, 130, 0.5);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.landing-save-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 48%;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.42),
    rgba(255, 255, 255, 0));
  border-radius: 4px 4px 0 0;
  pointer-events: none;
}

.landing-save-btn:hover {
  background: linear-gradient(
    155deg,
    rgba(255, 253, 242, 0.94) 0%,
    rgba(250, 240, 216, 0.88) 100%
  );
  box-shadow:
    inset 0  1px 0 rgba(255, 245, 185, 0.90),
    inset 0 -2px 0 rgba(90, 45, 5, 0.22),
    0 0 0 1px rgba(160, 118, 40, 0.45),
    0 5px 14px rgba(90, 45, 5, 0.18),
    0 8px 22px rgba(90, 45, 5, 0.10);
  transform: translateY(-2px);
  color: #160c02;
}

.landing-save-btn:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 2px 4px rgba(90, 45, 5, 0.18),
    0 0 0 1px rgba(140, 100, 35, 0.3),
    0 1px 4px rgba(90, 45, 5, 0.12);
}

.landing-save-btn.secondary {
  background: linear-gradient(
    155deg,
    rgba(248, 243, 228, 0.60) 0%,
    rgba(238, 228, 204, 0.52) 100%
  );
  box-shadow:
    inset 0  1px 0 rgba(255, 235, 155, 0.55),
    inset 0 -2px 0 rgba(90, 45, 5, 0.10),
    0 0 0 1px rgba(140, 100, 35, 0.18),
    0 2px 6px rgba(90, 45, 5, 0.08);
}

.save-btn-icon {
  font-size: 0.72rem;
  opacity: 0.75;
  position: relative;
  z-index: 1;
}


/* ========================
   快速读档弹窗
   ======================== */
.quickload-box {
  max-width: 520px;
  max-height: 80vh;
  overflow-y: auto;
}

.ql-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem 0 1.5rem;
  max-height: 40vh;
  overflow-y: auto;
}

/* 剧本条目 */
.ql-script-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  background: rgba(255, 250, 238, 0.6);
  border: 1px solid rgba(180, 140, 60, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ql-script-item:hover {
  background: rgba(255, 248, 228, 0.9);
  border-color: rgba(180, 140, 60, 0.45);
  transform: translateX(3px);
}
.ql-script-name {
  font-size: 0.95rem;
  color: #2c1f0e;
  letter-spacing: 0.05em;
  margin-bottom: 0.2rem;
  ont-family: '正文中文', 'KaiTi', serif;
}
.ql-script-phase {
  font-size: 0.65rem;
  color: #9a7a40;
  letter-spacing: 0.08em;
  font-family: '正文中文', 'KaiTi', serif; 
}
.ql-script-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.ql-save-count {
  font-size: 0.68rem;
  ccolor: #8a6a30; 
  font-family: '正文中文', 'KaiTi', serif; 
}
.ql-arrow {
  font-size: 1.1rem;
  color: #9a7a40;
  font-family: '正文中文', 'KaiTi', serif;
}

/* 存档条目 */
.ql-save-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  background: rgba(255, 250, 238, 0.6);
  border: 1px solid rgba(180, 140, 60, 0.2);
  border-radius: 4px;
}
.ql-save-slot {
  font-size: 0.85rem;
  color: #3a2808;
  margin-bottom: 0.2rem;
  letter-spacing: 0.05em;
  font-family: '正文中文', 'KaiTi', serif;
}
.ql-save-time {
  font-size: 0.65rem;
  color: #9a7a40;
  font-family: '正文中文', 'KaiTi', serif;
  letter-spacing: 0.05em;
}
.ql-load-btn {
  padding: 0.4rem 1.1rem;
  background: linear-gradient(135deg, #7a5018, #5a3808);
  border: 1px solid #9a6828;
  border-radius: 4px;
  color: #f5e8c0;
  font-family: '正文中文', 'KaiTi', serif;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ql-load-btn:hover {
  background: linear-gradient(135deg, #8a6025, #6a4515);
  transform: translateY(-1px);
}

/* 弹窗底部按钮组 */
.ql-footer {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 0.5rem;
}
.modal-btn.secondary {
  background: transparent;
  border-color: rgba(140, 100, 40, 0.3);
  color: #7a5830;
}
.modal-btn.secondary:hover {
  background: rgba(200, 160, 70, 0.08);
}

.bg-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 1.5s ease;
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

.landing-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(240, 230, 215, 0.2);
  background: linear-gradient(
    to bottom,
    rgba(240, 230, 215, 0.3) 0%,    /* 顶部几乎透明 */
    rgba(240, 230, 215, 0.5) 50%,   /* 中间轻微 */
    rgba(240, 230, 215, 0.7) 100%   /* 底部稍重 */
  );
}

/* ========================
   Landing 内容容器
   ======================== */
.landing-content {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem; /* 整体间距收紧 */
  padding: 2rem;
  box-sizing: border-box;
  opacity: 0;
  transform: translateY(15px); 
  transition: opacity 1.8s ease, transform 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.landing-content.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ========================
   主标题块 (重新调校的优雅错位比例)
   ======================== */
.title-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1.2rem; /* 缩小左右两边的间距，让它们更有整体感 */
  margin-top: -2rem; 
}

.title-left { transform: translateY(-1.5rem); }
.title-right { transform: translateY(1.5rem); }

.title-left span,
.title-right span {
  display: block; /* 确保垂直排列 */
  font-size: 3.8rem; /* 缩小字号，适应窄屏 */
  font-family: '正文中文', 'KaiTi', serif;
  color: #1a110a; /* 极深的墨水色 */
  line-height: 1.15;
  text-shadow: 0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.7);
}

/* ========================
   中间纤细的书脊线
   ======================== */
.title-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.center-line {
  width: 1px;
  height: 6rem; 
  background: linear-gradient(to bottom, transparent, rgba(160, 120, 40, 0.5), transparent);
}

.center-text {
  writing-mode: vertical-rl;
  font-size: 0.75rem;
  color: #3e2a18;
  letter-spacing: 0.25em; 
  line-height: 1.6;
  text-shadow: 0 0 6px rgba(255,255,255,0.9);
}

/* ========================
   副标题
   ======================== */
@keyframes textBreathe {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
    letter-spacing: 0.22em;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.022);
    letter-spacing: 0.30em;
    text-shadow:
      0 0 10px rgba(255, 255, 255, 1),
      0 0 24px rgba(200, 150, 40, 0.4),
      0 0 48px rgba(200, 150, 40, 0.15);
  }
}

.landing-sub {
  font-size: 0.95rem;
  color: #3e2a18;
  font-family: '正文中文', 'KaiTi', serif;
  margin-top: 1rem;
  display: inline-block;
  transform-origin: center center;
  animation: textBreathe 4.2s ease-in-out infinite;
}


/* ========================
   进入按钮 (古典透明画框)
   ======================== */
@keyframes btnShimmer {
  0%      { left: -80%; }
  60%, 100% { left: 130%; }
}

@keyframes btnGlow {
  0%, 100% { box-shadow:
    inset 0  1px 0 rgba(255, 242, 180, 0.85),
    inset 0 -2px 0 rgba(90, 45, 5, 0.22),
    0 0 0 1px rgba(155, 110, 35, 0.38),
    0 0 0 2.5px rgba(210, 165, 60, 0.10),
    0 4px 10px rgba(90, 45, 5, 0.18),
    0 8px 22px rgba(90, 45, 5, 0.10);
  }
  50% { box-shadow:
    inset 0  1px 0 rgba(255, 248, 200, 0.95),
    inset 0 -2px 0 rgba(90, 45, 5, 0.28),
    0 0 0 1px rgba(185, 140, 55, 0.55),
    0 0 0 3px rgba(220, 180, 70, 0.18),
    0 5px 14px rgba(90, 45, 5, 0.22),
    0 10px 28px rgba(90, 45, 5, 0.13);
  }
}

.enter-btn {
  position: relative;
  overflow: hidden;
  margin-top: 0.5rem;
  padding: 0.9rem 3rem;
  background: linear-gradient(
    170deg,
    rgba(255, 253, 240, 0.94) 0%,
    rgba(250, 240, 212, 0.90) 45%,
    rgba(242, 228, 195, 0.88) 100%
  );
  border: none;
  border-radius: 5px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: btnGlow 3.5s ease-in-out infinite;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
              background 0.3s ease;
}

.enter-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 5px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.10) 45%,
    transparent 100%
  );
  pointer-events: none;
}

.enter-btn::after {
  content: '';
  position: absolute;
  top: -30%;
  left: -80%;
  width: 45%;
  height: 160%;
  background: linear-gradient(
    108deg,
    transparent 35%,
    rgba(255, 235, 140, 0.30) 50%,
    transparent 65%
  );
  animation: btnShimmer 5s ease-in-out infinite;
  pointer-events: none;
}

.enter-btn:hover {
  transform: translateY(-3px) scale(1.02);
  background: linear-gradient(
    170deg,
    rgba(255, 254, 244, 0.98) 0%,
    rgba(253, 244, 218, 0.95) 50%,
    rgba(246, 234, 202, 0.93) 100%
  );
}

.enter-btn:active {
  transform: translateY(1px) scale(0.99);
  animation: none;
  box-shadow:
    inset 0 2px 5px rgba(90, 45, 5, 0.20),
    0 0 0 1px rgba(140, 95, 28, 0.4),
    0 2px 6px rgba(90, 45, 5, 0.15);
}

.enter-btn-text {
  position: relative;
  z-index: 1;
  font-size: 0.92rem;
  color: #221205;
  letter-spacing: 0.28em;
  font-family: '正文中文', 'KaiTi', serif;
  font-weight: bold;
  text-shadow:
    0  1px 0 rgba(255, 220, 110, 0.6),
    0 -1px 0 rgba(0, 0, 0, 0.05);
}



/* ========================
   底部信息 (居中贴底 & 花体修复版)
   ======================== */
.landing-footer {
  position: absolute;  /* 绝对定位，脱离中间内容块的影响 */
  bottom: 1.5rem;      /* 距离屏幕最底部的安全距离（防手机底栏遮挡） */
  left: 0;
  width: 100%;         /* 强制宽度 100%，确保内容绝对居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;         /* 两行字之间的紧凑间距 */
  pointer-events: none; 
  z-index: 10;
}

.footer-line {
  font-family: '内容英文', 'Brush Script MT', cursive; 
  font-size: 0.45rem;  /* 花体字通常偏小偏细，字号稍微调大一点点 */
  color: #3e2a18;      /* 质感深咖啡色 */
  letter-spacing: 0.1em; /* 花体字的字距不能拉太大，否则单词会断开 */
  text-shadow: 
    0 0 6px rgba(255, 255, 255, 1), 
    0 0 12px rgba(255, 255, 255, 0.8);
}

/* ========================
   移动端专属适配保障
   ======================== */
@media (max-width: 640px) {
  .title-left span,
  .title-right span {
    font-size: 3.2rem; /* 手机上再稍微缩小一点，保证绝对不拥挤 */
  }
  .center-line {
    height: 4.5rem;
  }
  .title-block {
    gap: 0.8rem; /* 左右靠得更紧一点，像一个整体的印章 */
  }
  .landing-footer {
    bottom: 1rem; /* 手机端让它更贴紧底部一点 */
  }
  .footer-line {
    font-size: 0.45rem; /* 手机端稍微缩小一点字号 */
  }
}

/* ========================
   Intro 屏 (带独立背景 & 紧凑排版)
   ======================== */
.intro-screen {
  background-image: 
    linear-gradient(rgba(245, 237, 216, 0.5), rgba(240, 230, 210, 0.7)),
    var(--intro-bg);
  background-size: cover;
  background-position: center;
  padding:
    calc(2rem + var(--safe-top))
    calc(1.5rem + var(--safe-right))
    calc(2rem + var(--safe-bottom))
    calc(1.5rem + var(--safe-left));
  align-items: center; /* 居中显示 */
  justify-content: center;
}

.intro-content {
  max-width: 620px;
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.8s ease, transform 0.8s ease;
  max-height: calc(var(--app-height) - var(--safe-top) - var(--safe-bottom) - 4rem);
  display: flex;
  flex-direction: column;
}
.intro-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.intro-header {
  text-align: center;
  margin-bottom: 0.6rem; /* 收紧间距 */
  flex-shrink: 0;
  text-shadow: 
    0 0 6px rgba(255, 255, 255, 1),
    0 0 12px rgba(255, 255, 255, 0.9),
    0 0 15px rgba(255, 255, 255, 0.8);
}

.intro-ornament .orn-text {
  font-size: 1rem; /* 稍微放大 */
  letter-spacing: 0.35em;
  font-weight: 900; 
  -webkit-text-stroke: 0.4px #1a0f05; 
}
.intro-ornament .orn-diamond { 
  color: #8a6a30;
  font-weight: 900; 
  -webkit-text-stroke: 0.4px #1a0f05; 
 }
.intro-ornament {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 0.5rem;
}
.intro-title {
  font-size: 1.8rem; /* 稍微缩小标题 */
  letter-spacing: 0.3em;
  color: #1a0e04;
  font-weight: bold;
  margin: 0 0 0.2rem 0;
  text-shadow: 0 0 8px rgba(255,255,255,0.8);
}
.intro-subtitle {
  font-size: 0.7rem;
  color: #9a7a40;
  font-family: '标题英文', 'Snell Roundhand', 'Georgia', serif; 
  letter-spacing: 0.15em;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255,255,255,0.8);
}

/* 文本主体框 */
.intro-body {
  background: rgba(252, 246, 232, 0.3); 
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(180, 140, 60, 0.5);
  border-radius: 6px;
  padding: 1.8rem 2rem; 
  margin-bottom: 1.5rem;
  box-shadow: 0 15px 40px rgba(0,0,0,0.25);
  max-height: 55vh; 
  overflow-y: auto; 
}

.intro-quote {
  font-size: 0.95rem;
  color: #5a4020;
  text-align: center;
  letter-spacing: 0.15em;
  line-height: 1.8; 
  margin: 0 0 1rem 0;
  font-weight: bold;
}
.intro-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(140, 100, 40, 0.4), transparent);
  margin: 1.2rem 0; /* 分割线上下留出空间 */
}
.intro-text {
  font-size: 0.85rem; 
  color: #3a2510;
  line-height: 2.2; /* 【关键修改】：行高恢复到 2.2，这是中文长文本最舒服的比例 */
  letter-spacing: 0.08em;
  margin: 0 0 1rem 0; /* 恢复段落之间的间距 */
  text-align: justify; /* 两端对齐，边缘更整齐 */
}

.intro-text.muted { 
  color: #7a5e30; 
  font-weight: bold;
}

.intro-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.8rem;
}
.tag {
  padding: 0.2rem 0.6rem;
  background: rgba(160, 120, 40, 0.08);
  border: 1px solid rgba(160, 120, 40, 0.3);
  border-radius: 4px; /* 改成小圆角更古典 */
  font-size: 0.65rem; /* 缩小标签字号 */
  color: #8a6a30;
  letter-spacing: 0.1em;
}

.intro-footer {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.next-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 2.8rem;
  background: linear-gradient(
    180deg,
    #a07228 0%,
    #7a5018 40%,
    #5a3808 100%
  );
  border: none;
  border-radius: 5px;
  color: #f5e8c0;
  font-family: '正文中文', 'KaiTi', serif;
  font-size: 0.88rem;
  letter-spacing: 0.22em;
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
              background 0.25s ease;
  box-shadow:
    inset 0  1px 0 rgba(255, 220, 120, 0.35),
    inset 0 -2px 0 rgba(30, 12, 0, 0.35),
    0 0 0 1px rgba(80, 40, 5, 0.55),
    0 4px 12px rgba(60, 28, 4, 0.30),
    0 10px 24px rgba(60, 28, 4, 0.15);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.next-btn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45%;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.18),
    rgba(255, 255, 255, 0));
  border-radius: 5px 5px 0 0;
  pointer-events: none;
}

.next-btn:hover {
  background: linear-gradient(
    180deg,
    #b08235 0%,
    #8a6025 40%,
    #6a4515 100%
  );
  transform: translateY(-3px) scale(1.015);
  box-shadow:
    inset 0  1px 0 rgba(255, 228, 130, 0.4),
    inset 0 -2px 0 rgba(30, 12, 0, 0.40),
    0 0 0 1px rgba(90, 48, 8, 0.6),
    0 7px 18px rgba(60, 28, 4, 0.35),
    0 14px 32px rgba(60, 28, 4, 0.18);
}

.next-btn:active {
  transform: translateY(1px) scale(0.99);
  box-shadow:
    inset 0 2px 5px rgba(30, 12, 0, 0.30),
    0 0 0 1px rgba(80, 40, 5, 0.5),
    0 2px 6px rgba(60, 28, 4, 0.18);
}

.next-arrow {
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}
.next-btn:hover .next-arrow { transform: translateX(4px); }


@media (max-width: 640px) {
  .intro-screen {
    padding: 1.5rem 1rem; 
  }
  
  .intro-body {
    padding: 1.5rem 1.2rem; /* 手机上内边距稍微缩一点 */
    max-height: 50vh; /* 手机上限制文本框高度，保证底部按钮永远露在外面 */
  }
  
  .intro-title {
    font-size: 1.5rem;
  }
  
  .intro-text {
    font-size: 0.8rem; 
    line-height: 1.8; /* 手机上行高稍微收一点，但不能低于 1.8 */
    margin-bottom: 0.8rem;
  }
}


/* ========================
   Phases 屏
   ======================== */
.phases-screen {
  padding:
    calc(2rem + var(--safe-top))
    calc(1.5rem + var(--safe-right))
    calc(2rem + var(--safe-bottom))
    calc(1.5rem + var(--safe-left));
  align-items: center;
  justify-content: center;
  background-image: 
    linear-gradient(rgba(242, 235, 217, 0.6), rgba(228, 213, 186, 0.4)),
    var(--phases-bg);
  background-size: cover;
  background-position: center;
}
.phases-content {
  max-width: 500px;
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.phases-content.visible {
  opacity: 1;
  transform: translateY(0);
}
.phases-header {
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 
    0 0 8px rgba(255, 255, 255, 1),
    0 0 15px rgba(255, 255, 255, 0.8);
}
.phases-ornament {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
}
.phases-ornament .orn-text {
  font-size: 1.3rem; /* 原来约 0.62rem */
  letter-spacing: 0.4em;
  font-weight: 900; 
}
.phases-sub {
  font-size: 1.1rem;
  color: #9a7a40;
  font-weight: bold; /* 加粗 */
  letter-spacing: 0.2em;
  margin: 0;
  opacity: 1;
  text-shadow: 
    0 0 6px rgba(255, 255, 255, 1),
    0 0 10px rgba(255, 255, 255, 0.9);
}

/* ========================
   封面网格
   ======================== */
.score-table {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem 1.2rem;
}

/* ========================
   封面网格 (去边框，展现真实纸张边缘)
   ======================== */
   .score-paper {
  position: relative;
  aspect-ratio: 3 / 4;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent; /* 确保底色绝对透明 */
  
  /* 【关键清理】：彻底干掉死板的边框和内阴影 */
  border: none; 
  border-radius: 0;
  box-shadow: none; 
  
  /* 【核心魔法】：使用滤镜阴影，让阴影完全贴合你水彩图片的不规则边缘 */
  filter: drop-shadow(0 8px 16px rgba(80, 50, 10, 0.15));

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  padding: 1.2rem 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 悬停时的状态也要保持无边框，只加深滤镜阴影 */
.score-paper:hover {
  transform: translateY(-8px) scale(1.03) !important;
  box-shadow: none !important; /* 强制覆盖原有方块阴影 */
  border-color: transparent;
  filter: drop-shadow(0 15px 24px rgba(80, 50, 10, 0.25)); 
}

/* 隐藏原本用 CSS 画的生硬右上角折角，展现图片原本的边缘 */
.score-paper::after {
  display: none;
}


/* 随机微倾 */
.paper-0 { transform: rotate(-2.2deg); }
.paper-1 { transform: rotate(1.8deg); }
.paper-2 { transform: rotate(1.5deg); }
.paper-3 { transform: rotate(-1.6deg); }

/* 悬停 */
.score-paper:hover {
  transform: rotate(0deg) translateY(-10px) scale(1.03) !important;
  box-shadow:
    4px 18px 36px rgba(80, 50, 10, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(180, 140, 60, 0.6);
}
.score-paper:hover::after {
  border-width: 0 18px 18px 0;
  border-color: transparent rgba(255, 255, 255, 0.3) transparent transparent;
}

/* ========================
   封面文字 (纯正墨水质感版)
   ======================== */
.paper-phase-num {
  position: relative;
  z-index: 1;
  font-size: 0.85rem; /* 稍微放大一点 */
  font-family: '标题英文', 'Cinzel', serif;
  font-style: italic;
  font-weight: bold;
  letter-spacing: 0.15em;
  margin-bottom: 0.3rem;

  color: #2b180d; /* 统一使用深墨水/咖啡色 */
  background: none;
  -webkit-text-fill-color: initial;
  -webkit-text-stroke: 0; /* 彻底去掉生硬的描边 */
  
  /* 用白光把字托起来，确保在深色水彩上也能看清 */
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.9), 0 0 12px rgba(255, 255, 255, 0.8);
}

.paper-title {
  position: relative;
  z-index: 1;
  font-size: 1.5rem;
  font-family: '手写中文', cursive;
  letter-spacing: 0.1em;
  line-height: 1.6;

  color: #2b180d;
  background: none;
  -webkit-text-fill-color: initial;
  -webkit-text-stroke: 0; 
  text-shadow: 0 0 8px rgba(255, 255, 255, 1), 0 0 16px rgba(255, 255, 255, 0.6);
}

/* ========================
   章节弹窗
   ======================== */
   .phase-modal {
  /* ← 加这一行，用纸张色垫底，彻底消灭白边 */
  background-color: #e8d9b8;
  
  border: none; 
  border-radius: 6px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  filter: none;
  overflow: hidden;
  aspect-ratio: 3 / 4; 
  max-width: 400px; 
  width: 88%;
  padding: 3rem 2.2rem 2.5rem 2.2rem; 
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: calc(var(--app-height) - var(--safe-top) - var(--safe-bottom) - 4rem);
  overflow-y: auto;
}

.phase-modal::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: 
    linear-gradient(
      rgba(232, 217, 184, 0.7),
      rgba(232, 217, 184, 0.7)
    ),
    var(--dynamic-bg);
  background-size: cover;
  background-position: center;
  filter: none;
}


.phase-modal > * {
  position: relative;
  z-index: 1;
}

.phase-modal-close {
  position: absolute;
  top: 1.2rem; right: 1.2rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  border: none; border-radius: 50%;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; color: #3e2511; 
  cursor: pointer; opacity: 0.7; transition: all 0.2s ease;
  z-index: 10; 
}
.phase-modal-close:hover { 
  opacity: 1; 
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

.phase-modal-roman {
  font-size: 3.5rem;
  font-family: 'Times New Roman', serif;
  font-style: italic;
  color: rgba(160, 120, 40, 0.35); 
  line-height: 1;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(255,255,255,0.8);
}

.phase-modal-label,
.phase-modal-name,
.phase-modal-quote {
  text-shadow: 0 0 6px rgba(255, 255, 255, 1), 0 0 10px rgba(255, 255, 255, 0.9);
}

.phase-modal-close {
  position: absolute;
  top: 1rem;  
  right: 1rem; 
  background: rgba(250, 243, 230, 0.9); 
  backdrop-filter: blur(4px);
  border: 1px solid rgba(180, 140, 60, 0.4);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #3e2511; 
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10; 
}
.phase-modal-close:hover { 
  background: #fff;
  color: #d03020;
  transform: scale(1.1) rotate(90deg);
}

.phase-modal-roman {
  font-size: 2.8rem;
  font-family: 'Times New Roman', serif;
  font-style: italic;
  color: rgba(160, 120, 40, 0.4); 
  line-height: 1;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(255,255,255,0.8);
}
.phase-modal-label {
  font-size: 1.3rem;
  color: #1a0f05; 
  font-weight: bold;
  letter-spacing: 0.08em;
  margin-bottom: 0.2rem;
}
.phase-modal-name {
  font-size: 0.85rem;
  color: #b09060;
  font-family: '内容英文', 'Courier New', monospace;
  font-style: italic;
  letter-spacing: 0.15em;
}
.phase-modal-divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(140, 100, 40, 0.4), transparent);
  margin: 1rem 0;
}
.phase-modal-quote {
  font-size: 0.85rem;
  color: #3e2511; 
  font-weight: bold;
  line-height: 2;
  letter-spacing: 0.06em;
  margin: 0;
}
.phase-modal-footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.phase-modal-count {
  font-size: 0.8rem;
  color: #9a7a40;
  font-family: '正文中文', 'Georgia', serif; 
  font-weight: bold;
  letter-spacing: 0.1em;
}

.phase-modal-enter {
  position: relative;
  overflow: hidden;
  padding: 0.62rem 1.6rem;
  background: linear-gradient(
    180deg,
    #a07228 0%,
    #7a5018 40%,
    #5a3808 100%
  );
  border: none;
  border-radius: 4px;
  color: #f5e8c0;
  font-family: '正文中文', 'KaiTi', serif;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              background 0.25s ease;
  box-shadow:
    inset 0  1px 0 rgba(255, 220, 120, 0.32),
    inset 0 -2px 0 rgba(30, 12, 0, 0.32),
    0 0 0 1px rgba(80, 40, 5, 0.50),
    0 3px 8px  rgba(60, 28, 4, 0.28),
    0 7px 18px rgba(60, 28, 4, 0.13);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.phase-modal-enter::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 45%;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.16),
    rgba(255, 255, 255, 0));
  border-radius: 4px 4px 0 0;
  pointer-events: none;
}

.phase-modal-enter:hover {
  background: linear-gradient(
    180deg,
    #b08235 0%,
    #8a6025 40%,
    #6a4515 100%
  );
  transform: translateY(-2px);
  box-shadow:
    inset 0  1px 0 rgba(255, 228, 130, 0.38),
    inset 0 -2px 0 rgba(30, 12, 0, 0.38),
    0 0 0 1px rgba(90, 48, 8, 0.55),
    0 5px 14px rgba(60, 28, 4, 0.32),
    0 10px 24px rgba(60, 28, 4, 0.15);
}

.phase-modal-enter:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 2px 4px rgba(30, 12, 0, 0.28),
    0 0 0 1px rgba(80, 40, 5, 0.45),
    0 1px 4px rgba(60, 28, 4, 0.16);
}


/* 移动端 */
@media (max-width: 640px) {
  .score-table { gap: 1rem 0.8rem; }
  .paper-roman { font-size: 2.2rem; }
  .paper-title { font-size: 1.3rem; }

}

.copyright-line {
  font-size: 0.9rem;
  color: #5a4020;
  letter-spacing: 0.08em;
  line-height: 2.2;
  text-align: center;
  text-shadow: 
    0 0 6px rgba(255, 255, 255, 1), 
    0 0 12px rgba(255, 255, 255, 0.8);
}

.highlight-line {
  color: #8a3010;
  font-weight: bold;
}

.warning-line {
  color: #c03020;
  font-weight: bold;
  letter-spacing: 0.15em;
  margin-top: 0.2rem;
}


/* ========================
   Detail 屏
   ======================== */
.detail-screen {
  padding:
    calc(5rem + var(--safe-top))
    calc(2rem + var(--safe-right))
    calc(4rem + var(--safe-bottom))
    calc(2rem + var(--safe-left));
  align-items: flex-start;
  justify-content: center;
  background-image: 
    linear-gradient(rgba(245, 237, 216, 0.6), rgba(240, 230, 210, 0.6)),
    var(--detail-bg);
  background-size: cover;
  background-position: center;
  background-attachment: fixed; 
}

/* 返回按钮 */
.back-btn {
  position: fixed;
  top: calc(1.5rem + var(--safe-top));
  left: calc(1.5rem + var(--safe-left));
  z-index: 20;
  padding: 0.5rem 1.2rem;
  background: linear-gradient(160deg, rgba(255, 252, 242, 0.95) 0%, rgba(245, 235, 210, 0.9) 100%);
  border: 1px solid rgba(180, 140, 60, 0.35);
  border-bottom: 2px solid rgba(140, 100, 30, 0.4);
  border-radius: 6px;
  font-family: '正文中文', 'KaiTi', serif;
  font-size: 0.82rem;
  color: #5a3e10;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(8px);
  letter-spacing: 0.1em;
  box-shadow: 
    0 4px 12px rgba(100, 60, 10, 0.12),
    0 1px 3px rgba(100, 60, 10, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.back-btn:hover {
  background: linear-gradient(160deg, #fffdf5 0%, #fdf5e0 100%);
  border-color: rgba(180, 140, 60, 0.6);
  border-bottom-color: rgba(140, 100, 30, 0.7);
  box-shadow: 
    0 6px 18px rgba(100, 60, 10, 0.18),
    0 2px 6px rgba(100, 60, 10, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  color: #3a2808;
}
.back-btn:active {
  transform: translateY(1px);
  box-shadow: 
    0 2px 6px rgba(100, 60, 10, 0.1),
    inset 0 2px 4px rgba(140, 100, 30, 0.1);
  border-bottom-width: 1px;
}



.detail-content {
  max-width: 680px;
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.detail-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1rem;
}
.detail-roman {
  font-size: 3rem;
  color: rgba(140, 100, 40, 0.6);
  font-family: '内容英文', 'Courier New', monospace;
  font-style: italic;
  line-height: 1;
}
.detail-label {
  font-size: 1.5rem;
  color: #5a4020;
  letter-spacing: 0.08em;
  margin-bottom: 0.2rem;
}
.detail-name {
  font-size: 1rem;
  color: #6a4e20;
  font-family: '内容英文', 'Courier New', monospace;
  font-style: italic;
}

.detail-quote {
  font-size: 0.85rem;
  color: #7a5e28;
  letter-spacing: 0.08em;
  line-height: 2;
  margin-bottom: 1rem;
}
.detail-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(140, 100, 40, 0.3), transparent);
  margin-bottom: 1.2rem;
}

.detail-label,
.detail-name,
.detail-roman,
.detail-quote,
.sim-item-name {
  text-shadow: 
    0 0 8px rgba(255, 255, 255, 1),
    0 0 16px rgba(255, 255, 255, 0.9);
}

/* ========================
   模拟器列表
   ======================== */
.sim-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sim-item {
  background: linear-gradient(160deg, rgba(255, 252, 242, 0.85) 0%, rgba(250, 242, 220, 0.7) 100%);
  border: 1px solid rgba(180, 140, 60, 0.2);
  border-left: 3px solid transparent;
  border-bottom: 2px solid rgba(160, 120, 40, 0.12);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 4px 16px rgba(100, 60, 10, 0.06),
    0 1px 4px rgba(100, 60, 10, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.sim-item.unlocked:hover {
  border-color: rgba(180, 140, 60, 0.45);
  border-left-color: #9a7840;
  border-bottom-color: rgba(140, 100, 30, 0.35);
  background: linear-gradient(160deg, rgba(255, 253, 245, 0.95) 0%, rgba(253, 245, 225, 0.9) 100%);
  box-shadow: 
    0 8px 24px rgba(100, 60, 10, 0.12),
    0 3px 8px rgba(100, 60, 10, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateX(6px) translateY(-2px);
  cursor: pointer;
}
.sim-item.unlocked:active {
  transform: translateX(3px) translateY(1px);
  box-shadow: 
    0 2px 8px rgba(100, 60, 10, 0.08),
    inset 0 2px 4px rgba(140, 100, 30, 0.06);
}
.sim-item.locked {
  opacity: 0.38;
  cursor: not-allowed;
  box-shadow: none;
}
.sim-item.active {
  border-color: rgba(180, 140, 60, 0.5);
  border-left-color: #b08840;
  border-bottom-color: rgba(140, 100, 30, 0.4);
  background: linear-gradient(160deg, rgba(255, 252, 235, 0.95) 0%, rgba(252, 242, 215, 0.92) 100%);
  box-shadow: 
    0 6px 20px rgba(100, 60, 10, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1),
    inset 0 0 20px rgba(200, 160, 60, 0.04);
}


.sim-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
}
.sim-item-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.sim-status-icon {
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.locked-dot {
  font-size: 0.5rem;
  color: #b0a070;
}
.audio-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}
.audio-bars span {
  display: block;
  width: 2px;
  background-color: #c8a040;
  border-radius: 1px;
  box-shadow: 0 0 4px rgba(200, 160, 64, 0.8); /* 加上金光 */
}
.audio-bars span:nth-child(1) { height: 4px; animation: eq 1s ease-in-out infinite alternate; }
.audio-bars span:nth-child(2) { height: 10px; animation: eq 1.2s ease-in-out infinite alternate-reverse; }
.audio-bars span:nth-child(3) { height: 6px; animation: eq 0.8s ease-in-out infinite alternate; }

@keyframes eq {
  0% { height: 2px; }
  100% { height: 12px; }
}

.sim-item-titles {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.sim-item-name {
  font-size: 1rem;
  color: #1e1206;
  letter-spacing: 0.04em;
}
.sim-item.locked .sim-item-name { color: #8a7860; }
.sim-item-tag {
  font-size: 0.68rem;
  color: #9a7840;
}
.sim-item.locked .sim-item-tag { color: #b0a070; }
.sim-item-arrow {
  font-size: 1.2rem;
  color: #a08040;
  transition: transform 0.3s ease;
}
.sim-item-arrow.open { transform: rotate(90deg); }
.sim-item-lock {
  font-size: 0.65rem;
  color: #c0a870;
  letter-spacing: 0.05em;
  opacity: 0.5;
}

/* 详情展开 */
.sim-item-detail {
  padding: 0 1.2rem 1.2rem;
  border-top: 1px dashed rgba(180, 140, 60, 0.2);
  margin: 0 1.2rem;
  padding-top: 1rem;
}
.sim-bg-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: #9a7840;
  letter-spacing: 0.15em;
  margin-bottom: 0.6rem;
}
.sim-item-desc {
  font-size: 0.87rem;
  color: #4a3418;
  line-height: 2;
  margin: 0 0 1.2rem 0;
  letter-spacing: 0.03em;
}
.sim-item-actions {
  display: flex;
  gap: 0.8rem;
}
.btn-start {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: '正文中文', 'KaiTi', serif;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: linear-gradient(180deg, #9a6828 0%, #7a5018 40%, #5a3808 100%);
  border: 1px solid #7a5018;
  border-bottom: 2px solid #3a2005;
  color: #f5e8c0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  box-shadow: 
    0 4px 14px rgba(80, 40, 5, 0.3),
    0 1px 4px rgba(80, 40, 5, 0.2),
    inset 0 1px 0 rgba(255, 220, 120, 0.25);
}
.btn-start:hover {
  background: linear-gradient(180deg, #aa7830 0%, #8a6025 40%, #6a4515 100%);
  border-bottom-color: #4a2808;
  box-shadow: 
    0 6px 20px rgba(80, 40, 5, 0.4),
    0 2px 6px rgba(80, 40, 5, 0.25),
    inset 0 1px 0 rgba(255, 220, 120, 0.35);
  transform: translateY(-3px);
  color: #fff8e0;
}
.btn-start:active {
  transform: translateY(1px);
  border-bottom-width: 1px;
  box-shadow: 
    0 2px 6px rgba(80, 40, 5, 0.2),
    inset 0 2px 4px rgba(40, 20, 0, 0.2);
}

.btn-load {
  flex: 1;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: '正文中文', 'KaiTi', serif;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: linear-gradient(160deg, rgba(255, 252, 242, 0.9) 0%, rgba(245, 235, 210, 0.8) 100%);
  border: 1px solid rgba(140, 100, 40, 0.35);
  border-bottom: 2px solid rgba(120, 80, 20, 0.25);
  color: #7a5a20;
  box-shadow: 
    0 3px 10px rgba(100, 60, 10, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}
.btn-load:hover:not(.disabled) {
  border-color: rgba(140, 100, 40, 0.55);
  border-bottom-color: rgba(120, 80, 20, 0.5);
  background: linear-gradient(160deg, #fffdf5 0%, #fdf5e0 100%);
  box-shadow: 
    0 6px 16px rgba(100, 60, 10, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transform: translateY(-3px);
  color: #5a3e10;
}
.btn-load:active:not(.disabled) {
  transform: translateY(1px);
  border-bottom-width: 1px;
  box-shadow: inset 0 2px 4px rgba(100, 60, 10, 0.08);
}
.btn-load.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}


/* ========================
   展开动画
   ======================== */
.slide-down-enter-active {
  transition: all 0.35s ease;
  overflow: hidden;
}
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 800px;
}

/* ========================
   四角装饰
   ======================== */
   .corner {
  position: fixed;
  z-index: 10;
  pointer-events: none;
}
.corner-tl { top: 0; left: 0; }
.corner-tr { top: 0; right: 0; }
.corner-bl { bottom: 0; left: 0; }
.corner-br { bottom: 0; right: 0; }

.ql-save-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
/* ========================
   开场画面 (电影级仪式感)
   ======================== */
   .splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #060503; /* 极深的暖黑，比纯黑更有质感 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-text-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* 包含中英文的文字组，初始状态为透明、轻微缩小、重度模糊 */
.splash-line-text {
  opacity: 0;
  transform: scale(0.95);
  filter: blur(10px);
  /* 极度缓慢的 2.5秒 过渡，模拟从深海浮出水面的感觉 */
  transition: opacity 2.5s ease-in-out, transform 3s ease-out, filter 2.5s ease-out;
}

/* 文字出现时的状态 */
.splash-line-text.visible {
  opacity: 1;
  transform: scale(1);
  filter: blur(0px);
}

.splash-main {
  font-size: 1.4rem;
  font-family: '正文中文', 'KaiTi', serif;
  color: #d8c398; /* 古典暗金 */
  letter-spacing: 0.6em; /* 字距拉得非常大，增加史诗感 */
  margin-left: 0.6em; /* 补偿字距导致的视觉不居中 */
  margin-bottom: 0.8rem;
  text-shadow: 0 0 15px rgba(216, 195, 152, 0.4); /* 微微的发光 */
}

.splash-sub {
  font-size: 0.75rem;
  font-family: '内容英文', 'Georgia', serif;
  color: rgba(216, 195, 152, 0.5);
  letter-spacing: 0.3em;
  font-style: italic;
}

/* 大幕拉开（黑屏褪去）的动画：耗时 2.5 秒，极其平滑 */
.splash-fade-leave-active {
  transition: opacity 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.splash-fade-leave-to {
  opacity: 0;
}





/* ========================
   暂未解锁弹窗
   ======================== */
.locked-modal-box {
  max-width: 380px;
  text-align: center;
}

.locked-modal-icon {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  opacity: 0.4;
  color: #5a4020;
  line-height: 1;
}

/* 三四章封面：整体灰暗处理 */
.score-paper.paper-locked {
  filter: drop-shadow(0 8px 16px rgba(80, 50, 10, 0.1))
          grayscale(0.4)
          brightness(0.85);
  cursor: pointer; /* 保留可点击感，点了才出提示 */
}

.score-paper.paper-locked:hover {
  filter: drop-shadow(0 12px 20px rgba(80, 50, 10, 0.2))
          grayscale(0.3)
          brightness(0.9) !important;
}

/* 锁定徽章 */
.paper-lock-badge {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  z-index: 2;
  background: rgba(20, 12, 4, 0.55);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  font-size: 0.75rem;
  filter: grayscale(1);
  opacity: 0.8;
}





/* ========================
   移动端
   ======================== */
@media (max-width: 640px) {
  .landing-title { font-size: 3rem; }
  .side-text { display: none; }
  .corner svg { width: 50px; height: 50px; }
  .intro-screen,
  .phases-screen,
  .detail-screen {
    padding:
      calc(4rem + var(--safe-top))
      calc(1rem + var(--safe-right))
      calc(3rem + var(--safe-bottom))
      calc(1rem + var(--safe-left));
  }
  .modal-box { padding: 2rem 1.5rem; }
  .back-btn {
    top: calc(1rem + var(--safe-top));
    left: calc(1rem + var(--safe-left));
  }

   /* phases 专属 */
   .phases-grid { 
    grid-template-columns: 1fr; 
    gap: 0.6rem;
  }
  .phase-card { padding: 0.9rem 1rem; }
  .phase-card-label { font-size: 0.78rem; }
  .phase-card-quote { 
    font-size: 0.7rem; 
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .phase-card-roman { font-size: 5rem; }
  .phases-header { margin-bottom: 0.8rem; }
}
</style>
