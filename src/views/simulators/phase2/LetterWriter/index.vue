<template>
  <div class="letter-writer">

    <!-- ────────── 街道主场景 ────────── -->
    <div v-if="scene === 'street'" class="street" :class="`season-${gameStore.currentSeason}`">

      <!-- 街道细节 -->
      <div class="street-details">
        <span
          v-for="detail in streetDetails"
          :key="detail.id"
          class="detail-item"
          :style="detail.style"
          @click="showDetail(detail.desc)"
        >{{ detail.icon }}</span>
      </div>

      <!-- 桌子 -->
      <div class="table-area">

        <!-- 木牌 + 声望纸条 -->
        <div class="sign-wrapper">
          <div class="sign" :class="signTilt">
            <p>代 写 书 信</p>
            <p class="sign-sub">识字 · 明理 · 诚信</p>
          </div>
          <div class="reputation-notes">
            <div
              v-for="note in reputationNotes"
              :key="note.id"
              class="note"
              :style="note.style"
              @click="notePopup = note.text"
            >{{ note.text }}</div>
          </div>
        </div>

        <!-- 桌面 -->
        <div class="table">
          <div class="archive-box" @click="scene = 'archive'">
            <span>📦</span>
            <span class="box-label">信件</span>
          </div>
          <div v-if="gameStore.currentSeason === 'winter'" class="tea-cup">🍵</div>
        </div>

      </div>

      <!-- 等待 / 客人来了 -->
      <div v-if="guestWaiting" class="guest-approaching">
        <p class="approach-text">有人往这边走过来，在桌子对面站了一下，坐下了。</p>
        <button class="btn-primary" @click="enterGuest">请坐</button>
      </div>
      <div v-else class="waiting-hint">
        <p>{{ waitingText }}</p>
      </div>

      <!-- 细节描述浮现 -->
      <transition name="fade">
        <div v-if="detailDesc" class="detail-desc">{{ detailDesc }}</div>
      </transition>

      <!-- 声望纸条弹出 -->
      <transition name="fade">
        <div v-if="notePopup" class="note-popup" @click="notePopup = null">
          {{ notePopup }}
        </div>
      </transition>

      <!-- 退休入口 -->
      <button class="retire-btn" @click="onRetire">收起笔，回家</button>

    </div>

    <!-- ────────── 对话界面 ────────── -->
    <Guest
      v-else-if="scene === 'guest'"
      :guest="currentGuest"
      @start-writing="scene = 'letter'"
      @guest-left="onGuestLeft"
    />

    <!-- ────────── 写信界面 ────────── -->
    <Letter
      v-else-if="scene === 'letter'"
      :guest="currentGuest"
      @submitted="onLetterSubmitted"
      @back-to-chat="scene = 'guest'"
    />

    <!-- ────────── 信件档案 ────────── -->
    <div v-else-if="scene === 'archive'" class="archive-scene">
      <div class="archive-header">
        <span>已寄出的信</span>
        <button class="btn-close" @click="scene = 'street'">关上盒子</button>
      </div>
      <div class="archive-list">
        <div
          v-for="letter in gameStore.letterArchive"
          :key="letter.id"
          class="archive-item"
          @click="selectedLetter = letter"
        >
          <span class="archive-date">{{ letter.date }}</span>
          <span class="archive-recipient">写给 {{ letter.recipient }}</span>
          <span class="archive-preview">{{ letter.content.slice(0, 30) }}……</span>
          <span v-if="letter.echo" class="archive-echo">有回音</span>
        </div>
        <div v-if="!gameStore.letterArchive.length" class="archive-empty">
          还没有寄出过信。
        </div>
      </div>
      <button class="btn-export" @click="exportLetters">导出所有信件</button>

      <!-- 单封信件查看 -->
      <transition name="fade">
        <div v-if="selectedLetter" class="letter-detail-overlay" @click.self="selectedLetter = null">
          <div class="letter-detail">
            <p class="detail-date">{{ selectedLetter.date }}</p>
            <div class="detail-content">{{ selectedLetter.content }}</div>
            <p class="detail-recipient">收件人：{{ selectedLetter.recipient }}</p>
            <p v-if="selectedLetter.echo" class="detail-echo">回音：{{ selectedLetter.echo }}</p>
            <p v-else class="detail-echo no-echo">暂无回音</p>
            <button class="btn-close" @click="selectedLetter = null">收起</button>
          </div>
        </div>
      </transition>
    </div>

    <!-- ────────── 结局：收摊过场 ────────── -->
    <div v-else-if="scene === 'closing'" class="ending-scene">
      <transition name="slow-fade" appear @after-enter="setTimeout(() => scene = 'stats', 4000)">
        <div class="closing-text">
          <p>桌上的笔放下了。</p>
          <p>木牌被翻过去，反面朝外。</p>
          <p>街上还是有人走过。</p>
          <p>有人往这边看了一眼，又走开了。</p>
          <p>天色慢慢暗下来。</p>
        </div>
      </transition>
    </div>

    <!-- ────────── 结局：生涯统计 ────────── -->
    <div v-else-if="scene === 'stats'" class="ending-scene stats-scene">
      <div class="stats-card">
        <p class="stats-title">代 笔 者 档 案</p>
        <div class="stats-divider" />
        <div class="stats-rows">
          <div class="stats-row">
            <span>执笔岁月</span>
            <span>{{ gameStore.yearsElapsed }} 年</span>
          </div>
          <div class="stats-row">
            <span>写出的信</span>
            <span>{{ gameStore.lettersWritten }} 封</span>
          </div>
          <div class="stats-row">
            <span>收到回音</span>
            <span>{{ gameStore.echosReceived }} 封</span>
          </div>
          <div class="stats-row">
            <span>没有回音</span>
            <span>{{ gameStore.lettersWritten - gameStore.echosReceived }} 封</span>
          </div>
          <div class="stats-row">
            <span>最高声望</span>
            <span>{{ gameStore.reputationPeak }}</span>
          </div>
          <div class="stats-row">
            <span>送走的客人</span>
            <span>{{ gameStore.guestsTurnedAway }} 位</span>
          </div>
        </div>
        <div class="stats-divider" />
        <transition name="fade" appear>
          <p class="stats-footnote">那些没有收到回音的信，不代表没有被读到。</p>
        </transition>
        <button class="btn-next" @click="scene = 'words'">继续</button>
      </div>
    </div>

    <!-- ────────── 结局：文字升华 ────────── -->
    <div v-else-if="scene === 'words'" class="ending-scene words-scene">
      <div class="words-content">
        <p v-for="(line, i) in epilogueLines" :key="i" class="epilogue-line"
           :style="{ animationDelay: `${i * 1.2}s` }">
          {{ line }}
        </p>
        <button
          class="btn-next"
          :style="{ animationDelay: `${epilogueLines.length * 1.2 + 0.5}s` }"
          @click="scene = 'last-letter'"
        >
          继续
        </button>
      </div>
    </div>

    <!-- ────────── 结局：空白信纸 ────────── -->
    <div v-else-if="scene === 'last-letter'" class="ending-scene last-letter-scene">
      <div class="last-paper-wrapper">
        <textarea
          v-model="lastLetterContent"
          class="last-paper"
          placeholder=""
          spellcheck="false"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../../../stores/gameStore'
import { useGameLogic } from './composables/useGameLogic'
import Guest from './Guest.vue'
import Letter from './Letter.vue'

const gameStore = useGameStore()
const { initGame, generateNextGuest } = useGameLogic()

const scene           = ref('street')
const currentGuest    = ref(null)
const guestWaiting    = ref(false)
const detailDesc      = ref('')
const notePopup       = ref(null)
const selectedLetter  = ref(null)
const lastLetterContent = ref('')

// ── 街道细节 ──
const streetDetails = [
  { id: 'passerby', icon: '🚶', desc: '他走得很快，手里拿着什么东西，也许是去赶集。',   style: { left: '15%', top: '45%' } },
  { id: 'leaf',     icon: '🍂', desc: '秋天了。',                                       style: { left: '62%', top: '38%' } },
  { id: 'child',    icon: '🏃', desc: '远处有个小孩，不知道在追什么。',                 style: { left: '80%', top: '52%' } },
  { id: 'wind',     icon: '🪧', desc: '风把木牌吹得动了一下。',                         style: { left: '44%', top: '28%' } },
]

function showDetail(desc) {
  detailDesc.value = desc
  setTimeout(() => { detailDesc.value = '' }, 2500)
}

// ── 声望相关 ──
const signTilt = computed(() => {
  if (gameStore.reputation <= 0)  return 'tilt-heavy'
  if (gameStore.reputation < 20)  return 'tilt-mild'
  return ''
})

const reputationNotes = computed(() => {
  const count =
    gameStore.reputation > 60 ? 4 :
    gameStore.reputation > 40 ? 2 :
    gameStore.reputation > 20 ? 1 : 0

  const texts = [
    '写得好，字也好看。',
    '我邻居说这里写信实在。',
    '帮我写了封难写的信，谢谢。',
    '托人带话，说收到信了。',
  ]
  return texts.slice(0, count).map((text, i) => ({
    id: i, text,
    style: {
      transform: `rotate(${[-3, 2, -1, 4][i]}deg)`,
      top:  `${[0, 8, -4, 12][i]}px`,
      left: `${[0, 20, 40, 10][i]}px`,
    }
  }))
})

const waitingText = computed(() => {
  if (gameStore.reputation <= 0)          return '今天没有人来。'
  if (gameStore.currentSeason === 'summer') return '天热，街上没什么人。'
  return '等着。'
})

// ── 客人流程 ──
async function scheduleNextGuest() {
  const delay = gameStore.reputation > 60
    ? 3000 : gameStore.reputation > 30
    ? 6000 : 10000

  setTimeout(async () => {
    const guest = await generateNextGuest()
    if (guest) {
      currentGuest.value = guest
      guestWaiting.value = true
    }
  }, delay)
}

function enterGuest() {
  guestWaiting.value = false
  scene.value = 'guest'
}

function onGuestLeft() {
  currentGuest.value = null
  scene.value = 'street'
  scheduleNextGuest()
}

function onLetterSubmitted() {
  currentGuest.value = null
  scene.value = 'street'
  scheduleNextGuest()
}

// ── 退休 ──
function onRetire() {
  if (confirm('收起笔，回家？\n还有人在等你写信。')) {
    scene.value = 'closing'
  }
}

// ── 导出 ──
function exportLetters() {
  const lines = ['════════════════════════════════════',
    '代 笔 者 · 信 件 档 案',
    '════════════════════════════════════',
    '',
    `执笔岁月：${gameStore.yearsElapsed}年`,
    `信件总数：${gameStore.lettersWritten}封`,
    '',
    '════════════════════════════════════',
    ''
  ]
  gameStore.letterArchive.forEach((l, i) => {
    lines.push(`【第${i + 1}封】${l.date} → ${l.recipient}`)
    lines.push('')
    lines.push(l.content)
    lines.push('')
    lines.push(`收件人：${l.recipient}`)
    lines.push(l.echo ? `回音：${l.echo}` : '回音：（无）')
    lines.push('────────────────────────────────────')
    lines.push('')
  })
  lines.push('这些信，现在属于你了。')

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = '代笔者_信件档案.txt'
  a.click()
  URL.revokeObjectURL(url)
}

// ── 结局文字 ──
const epilogueLines = [
  '在那个年代，写一封信要花很长时间。',
  '寄出去，要花更长的时间。',
  '等回音，有时候要花一辈子。',
  '',
  '但人们还是写。',
  '因为有些话，不说出来，就真的消失了。',
  '',
  '你替他们说了。',
  '这件事，比你想象的重要。',
  '',
  '感谢你在这里待了这么久。',
]

onMounted(() => {
  initGame()
  scheduleNextGuest()
})
</script>

<style scoped>
.letter-writer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f2ead8;
  font-family: 'Ma Shan Zheng', cursive, serif;
  color: #2c1a00;
}

/* ══════════════════════════════════
   街道场景
══════════════════════════════════ */
.street {
  width: 100%;
  height: 100%;
  position: relative;
  transition: background 2s;
}
.season-spring { background: #f0edd8; }
.season-summer { background: #edecd0; }
.season-autumn { background: #f0e6cc; }
.season-winter { background: #eae8e0; }

.street-details { position: absolute; inset: 0; }

.detail-item {
  position: absolute;
  font-size: 1.4rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  user-select: none;
}
.detail-item:hover { opacity: 1; }

/* 桌子区域 */
.table-area {
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.table {
  width: 300px;
  height: 72px;
  background: #7a5c14;
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

/* 木牌 */
.sign-wrapper { position: relative; }

.sign {
  background: #c4963a;
  color: #2c1a00;
  padding: 10px 22px;
  border-radius: 3px;
  text-align: center;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.18);
  transition: transform 0.6s;
  font-size: 1.05rem;
  letter-spacing: 0.2em;
  cursor: default;
}
.sign-sub {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  opacity: 0.65;
  margin-top: 3px;
}
.tilt-mild  { transform: rotate(-4deg); }
.tilt-heavy { transform: rotate(-13deg); }

/* 声望纸条 */
.reputation-notes {
  position: absolute;
  top: -8px;
  right: -35px;
  width: 80px;
  height: 60px;
}
.note {
  position: absolute;
  background: #fffbe6;
  font-size: 0.52rem;
  padding: 3px 5px;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.12);
  cursor: pointer;
  white-space: nowrap;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

/* 档案盒 */
.archive-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  color: #f5f0e8;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.archive-box:hover { opacity: 1; }
.box-label { font-size: 0.6rem; }
.tea-cup   { font-size: 1.1rem; }

/* 等待 / 客人 */
.waiting-hint {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  color: #8b7355;
  font-size: 0.85rem;
  opacity: 0.5;
  letter-spacing: 0.12em;
}

.guest-approaching {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}
.approach-text {
  color: #4a3520;
  font-size: 0.9rem;
  max-width: 280px;
  line-height: 1.9;
}

/* 细节描述 */
.detail-desc {
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(245, 240, 232, 0.93);
  color: #4a3520;
  font-size: 0.85rem;
  padding: 10px 20px;
  border-radius: 2px;
  max-width: 260px;
  text-align: center;
  line-height: 1.8;
  pointer-events: none;
}

/* 声望弹出 */
.note-popup {
  position: absolute;
  top: 28%;
  left: 50%;
  transform: translateX(-50%);
  background: #fffbe6;
  color: #333;
  font-size: 0.85rem;
  padding: 12px 20px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.12);
  max-width: 200px;
  text-align: center;
  line-height: 1.8;
  cursor: pointer;
}

/* 退休按钮 */
.retire-btn {
  position: absolute;
  bottom: 18px;
  right: 24px;
  background: transparent;
  border: none;
  color: #8b7355;
  font-size: 0.75rem;
  font-family: inherit;
  opacity: 0.35;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: opacity 0.2s;
}
.retire-btn:hover { opacity: 0.75; }

/* ══════════════════════════════════
   信件档案
══════════════════════════════════ */
.archive-scene {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 48px 20%;
  gap: 20px;
  background: #f2ead8;
  overflow: hidden;
}

.archive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  letter-spacing: 0.15em;
  color: #4a3520;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(139,105,20,0.2);
}

.archive-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.archive-item {
  display: grid;
  grid-template-columns: 100px 120px 1fr 60px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,245,0.6);
  border: 1px solid rgba(139,105,20,0.1);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.85rem;
}
.archive-item:hover { background: rgba(255,255,245,0.95); }
.archive-date      { color: #8b7355; }
.archive-recipient { color: #4a3520; }
.archive-preview   { color: #7a6248; }
.archive-echo      { color: #8b6914; font-size: 0.75rem; }

.archive-empty {
  color: #b0a08a;
  font-size: 0.9rem;
  text-align: center;
  padding: 40px 0;
}

.btn-export {
  align-self: flex-end;
  background: transparent;
  border: 1px solid rgba(139,105,20,0.3);
  color: #8b7355;
  padding: 8px 20px;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.1em;
  transition: all 0.2s;
}
.btn-export:hover { border-color: #8b6914; color: #8b6914; }

/* 单封信件查看 */
.letter-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(44,26,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.letter-detail {
  background: #fffef5;
  width: 480px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
.detail-date    { color: #8b7355; font-size: 0.85rem; }
.detail-content { line-height: 2.2; font-size: 0.95rem; white-space: pre-wrap; flex: 1; }
.detail-recipient { color: #7a6248; font-size: 0.8rem; border-top: 1px solid rgba(139,105,20,0.12); padding-top: 12px; }
.detail-echo    { color: #8b6914; font-size: 0.8rem; }
.no-echo        { color: #b0a08a; }

/* ══════════════════════════════════
   结局通用
══════════════════════════════════ */
.ending-scene {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f0e8;
}

/* 收摊过场 */
.closing-text {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}
.closing-text p {
  font-size: 1rem;
  color: #4a3520;
  letter-spacing: 0.1em;
  line-height: 2;
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
}
.closing-text p:nth-child(1) { animation-delay: 0s; }
.closing-text p:nth-child(2) { animation-delay: 0.8s; }
.closing-text p:nth-child(3) { animation-delay: 1.6s; }
.closing-text p:nth-child(4) { animation-delay: 2.4s; }
.closing-text p:nth-child(5) { animation-delay: 3.2s; }

/* 统计页 */
.stats-card {
  background: #fffef5;
  padding: 56px 72px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  min-width: 380px;
}
.stats-title {
  text-align: center;
  font-size: 1.1rem;
  letter-spacing: 0.3em;
  color: #4a3520;
}
.stats-divider {
  height: 1px;
  background: rgba(139,105,20,0.2);
}
.stats-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.stats-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #4a3520;
  letter-spacing: 0.08em;
}
.stats-footnote {
  font-size: 0.8rem;
  color: #8b7355;
  text-align: center;
  letter-spacing: 0.08em;
  line-height: 1.8;
  animation: fadeIn 1.5s ease 0.5s forwards;
  opacity: 0;
}

/* 文字升华 */
.words-scene { background: #f5f2ea; }
.words-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 480px;
  text-align: center;
}
.epilogue-line {
  font-size: 1rem;
  color: #4a3520;
  letter-spacing: 0.1em;
  line-height: 2;
  animation: fadeIn 1s ease forwards;
  opacity: 0;
  min-height: 1.5em;
}

/* 空白信纸 */
.last-letter-scene { background: #f5f2ea; }
.last-paper-wrapper {
  width: 520px;
  height: 640px;
  background: #fffef5;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.last-paper {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  padding: 48px 56px;
  font-family: inherit;
  font-size: 1rem;
  color: #2c1a00;
  line-height: 2.2;
  resize: none;
}
.last-paper:focus { outline: none; }

/* ══════════════════════════════════
   通用按钮
══════════════════════════════════ */
.btn-primary {
  background: transparent;
  border: 1px solid #8b6914;
  color: #8b6914;
  padding: 7px 26px;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.15em;
  transition: all 0.2s;
}
.btn-primary:hover { background: #8b6914; color: #f5f0e8; }

.btn-close {
  background: transparent;
  border: none;
  color: #8b7355;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.btn-close:hover { opacity: 1; }

.btn-next {
  background: transparent;
  border: 1px solid rgba(139,105,20,0.4);
  color: #8b7355;
  padding: 7px 24px;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 2px;
  letter-spacing: 0.12em;
  animation: fadeIn 1s ease forwards;
  opacity: 0;
  transition: all 0.2s;
}
.btn-next:hover { border-color: #8b6914; color: #8b6914; }

/* ══════════════════════════════════
   动画
══════════════════════════════════ */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

.slow-fade-enter-active { transition: opacity 1.2s; }
.slow-fade-enter-from   { opacity: 0; }
</style>
