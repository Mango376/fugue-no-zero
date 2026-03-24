<template>
  <div class="letter-writer">

    <!-- ══════════ 开始界面 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'title'" class="screen screen-title">
      <div class="title-grid"></div>
      <div class="title-glow"></div>

      <div class="title-content" :class="{ visible: titleReady }">
        <div class="title-tag">LETTER WRITER · 1980s</div>
        <div class="title-main">代 笔 者</div>
        <div class="title-sub">一张桌，一支笔，替人说出口</div>
        <div class="title-divider"></div>
        <div class="title-actions">
          <button class="title-btn primary" @click="onStart">
            <span class="btn-icon">▶</span>开始
          </button>
          <button class="title-btn secondary" @click="$router.back()">
            ‹ 返回演奏厅
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 背景介绍 ══════════ -->
    <Transition name="story-fade">
    <div v-if="scene === 'intro'" class="screen screen-intro">
      <div class="intro-vignette"></div>
      <div class="intro-nav">
        <button class="back-btn" @click="scene = 'title'">‹ 返回</button>
      </div>
      <div class="intro-content" :class="{ visible: introReady }">
        <div class="intro-chapter-tag">序 · 那个年代</div>
        <div class="intro-body">
          <p class="intro-lead">在那个年代，写一封信要花很长时间。</p>
          <p class="intro-text">寄出去，要花更长的时间。等回音，有时候要花一辈子。</p>
          <p class="intro-quote">但人们还是写。因为有些话，不说出来，就真的消失了。</p>
          <p class="intro-text">
            1980年代的中国，很多人想说的话，因为不识字，或者不会写，
            永远困在心里出不来。
          </p>
          <p class="intro-text highlight-block">
            一个会写字的人，能帮助很多不会写字的人说出口。
          </p>
          <p class="intro-text">
            你在南方某个小城的街边摆了一张桌，一块木牌，写着：
            代写书信。
          </p>
          <p class="intro-quote final-quote">
            你怎么对待一个人，他就怎么回应你。
          </p>
        </div>
        <div class="intro-actions">
          <button class="intro-next-btn" @click="enterStreet">
            摆开摊子 ›
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 街道主场景 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'street'" class="screen screen-street" :class="`season-${gameState.currentSeason}`">
      <div class="street-bg-grid"></div>

      <!-- 季节细节 -->
      <div class="street-details">
        <span
          v-for="d in streetDetails" :key="d.id"
          class="detail-item" :style="d.style"
          @click="showDetail(d.desc)"
        >{{ d.icon }}</span>
      </div>

      <!-- 桌子 + 木牌 -->
      <div class="table-area">
        <div class="sign-wrapper">
          <div class="sign" :class="signTilt">
            <p class="sign-main">代 写 书 信</p>
            <p class="sign-sub">识字 · 明理 · 诚信</p>
          </div>
          <div class="reputation-notes">
            <div
              v-for="note in reputationNotes" :key="note.id"
              class="rep-note" :style="note.style"
              @click="notePopup = note.text"
            >{{ note.text }}</div>
          </div>
        </div>

        <div class="table">
          <div class="table-item archive-box" @click="scene = 'archive'">
            <span class="table-icon">📦</span>
            <span class="table-label">信件</span>
          </div>
          <div v-if="gameState.currentSeason === 'winter'" class="table-item">
            <span class="table-icon">🍵</span>
          </div>
        </div>
      </div>

      <!-- 等待 / 客人来了 -->
      <Transition name="fade">
        <div v-if="guestWaiting" class="guest-approaching">
          <div class="approach-card">
            <p class="approach-text">有人往这边走过来，在桌子对面站了一下，坐下了。</p>
            <button class="btn-primary" @click="enterGuest">请坐</button>
          </div>
        </div>
        <div v-else class="waiting-hint">{{ waitingText }}</div>
      </Transition>

      <!-- 细节描述 -->
      <Transition name="fade">
        <div v-if="detailDesc" class="detail-popup">{{ detailDesc }}</div>
      </Transition>

      <!-- 声望纸条弹出 -->
      <Transition name="fade">
        <div v-if="notePopup" class="note-popup" @click="notePopup = null">
          {{ notePopup }}
        </div>
      </Transition>

      <!-- 档案入口 / 退休 -->
      <div class="street-footer">
        <button class="retire-btn" @click="onRetire">收起笔，回家</button>
      </div>
    </div>
    </Transition>

<!-- ══════════ 接客对话界面 ══════════ -->
<Transition name="fade">
<div v-if="scene === 'guest'" class="screen screen-guest">

  <!-- 顶栏 -->
  <div class="guest-topbar">
    <button class="back-btn" @click="onLeaveGuest">‹ 返回街道</button>
  </div>

  <!-- 客人信息条 -->
  <div class="guest-profile-bar">
    <div class="gp-identity">{{ gameState.currentGuest?.identity ?? '' }}</div>
    <div class="gp-purpose">{{ gameState.currentGuest?.surfacePurpose ?? '' }}</div>
  </div>

  <!-- 对话框 -->
  <div class="dialogue-frame">
    <div class="dialogue-scroll" ref="dialogueArea">
      <div
        v-for="(msg, i) in messages" :key="i"
        class="message-wrap" :class="msg.role"
      >
        <div v-if="msg.role === 'guest'" class="bubble guest-bubble">{{ msg.text }}</div>
        <div v-else class="bubble player-bubble">{{ msg.text }}</div>
      </div>

      <div v-if="isDialogueLoading" class="bubble guest-bubble loading-bubble">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </div>
  </div>

  <!-- 底部：输入框 + 写信按钮 -->
  <div class="guest-bottom">
    <button
      class="float-write-btn"
      :disabled="messages.length < 2"
      @click="showLetterPanel = true"
    >✉ 写信</button>

    <div class="input-row">
      <textarea
        v-model="dialogueInput"
        class="chat-input"
        placeholder="说点什么……"
        rows="2"
        :disabled="isDialogueLoading"
        @keydown.enter.exact.prevent="sendDialogue"
      />
      <button
        class="send-btn"
        :disabled="!dialogueInput.trim() || isDialogueLoading"
        @click="sendDialogue"
      >发送</button>
    </div>
  </div>

  <!-- 写信悬浮面板 -->
  <Transition name="panel-up">
  <div v-if="showLetterPanel" class="letter-panel-overlay">
    <div class="letter-panel">
      <div class="lp-header">
        <span class="lp-title">写给：{{ gameState.currentGuest?.recipient }}</span>
        <button class="lp-close" @click="showLetterPanel = false">收起 ▾</button>
      </div>
      <div class="lp-params">
        <div v-for="p in params" :key="p.key" class="param-group">
          <span class="param-label">{{ p.label }}</span>
          <select v-model="paramValues[p.key]" class="param-select">
            <option v-for="opt in p.options" :key="opt">{{ opt }}</option>
          </select>
        </div>
      </div>
      <div class="lp-paper-wrap">
        <textarea
          v-model="letterContent"
          class="lp-paper"
          placeholder="在这里写信……"
          spellcheck="false"
        />
      </div>
      <div class="lp-actions">
        <button class="btn-polish" :disabled="isPolishing" @click="onPolish">
          {{ isPolishing ? '润色中……' : 'AI 润色' }}
        </button>
        <button
          class="btn-primary"
          :disabled="!letterContent.trim()"
          @click="onSubmitLetter"
        >交给客人看</button>
      </div>
    </div>
  </div>
  </Transition>

  <!-- 客人审阅弹层 -->
  <Transition name="panel-up">
  <div v-if="reviewMode" class="review-overlay">
    <div class="review-box">
      <div class="review-tag">◆ 客人回应</div>
      <div class="review-text">{{ reviewText }}</div>
      <div class="review-actions">
        <template v-if="reviewResult === 'satisfied'">
          <button class="btn-primary" @click="onLetterDone">送走客人</button>
        </template>
        <template v-else>
          <p class="edit-hint">{{ editHint }}</p>
          <div style="display:flex;gap:0.6rem">
            <button class="btn-secondary" @click="reviewMode = false; showLetterPanel = true">
              修改一下
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
  </Transition>

</div>
</Transition>


    <!-- ══════════ 信件档案 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'archive'" class="screen screen-archive">
      <div class="archive-nav">
        <button class="back-btn" @click="scene = 'street'">‹ 返回</button>
        <span class="archive-title">已寄出的信</span>
        <button class="btn-export-small" @click="exportLetters">导出</button>
      </div>

      <div class="archive-list">
        <div
          v-for="letter in gameState.letterArchive" :key="letter.id"
          class="archive-card"
          @click="selectedLetter = letter"
        >
          <div class="ac-date">{{ letter.date }}</div>
          <div class="ac-recipient">写给 {{ letter.recipient }}</div>
          <div class="ac-preview">{{ letter.content.slice(0, 40) }}……</div>
          <div v-if="letter.echo" class="ac-echo">有回音</div>
        </div>
        <div v-if="!gameState.letterArchive.length" class="archive-empty">
          还没有寄出过信。
        </div>
      </div>

      <!-- 单封查看 -->
      <Transition name="panel-up">
      <div v-if="selectedLetter" class="letter-detail-overlay" @click.self="selectedLetter = null">
        <div class="letter-detail-box">
          <div class="ld-date">{{ selectedLetter.date }}</div>
          <div class="ld-content">{{ selectedLetter.content }}</div>
          <div class="ld-footer">
            <span>收件人：{{ selectedLetter.recipient }}</span>
            <span :class="selectedLetter.echo ? 'ld-echo' : 'ld-no-echo'">
              {{ selectedLetter.echo ? `回音：${selectedLetter.echo}` : '暂无回音' }}
            </span>
          </div>
          <button class="btn-secondary" style="width:100%" @click="selectedLetter = null">收起</button>
        </div>
      </div>
      </Transition>
    </div>
    </Transition>

    <!-- ══════════ 收摊过场 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'closing'" class="screen screen-ending">
      <div class="closing-lines">
        <p v-for="(line, i) in closingLines" :key="i"
           :style="{ animationDelay: `${i * 0.9}s` }">{{ line }}</p>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 生涯统计 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'stats'" class="screen screen-ending">
      <div class="stats-card">
        <div class="sc-orn">◆</div>
        <div class="sc-title">代 笔 者 档 案</div>
        <div class="sc-divider"></div>
        <div class="sc-rows">
          <div class="sc-row"><span>执笔岁月</span><span>{{ gameState.yearsElapsed }} 年</span></div>
          <div class="sc-row"><span>写出的信</span><span>{{ gameState.lettersWritten }} 封</span></div>
          <div class="sc-row"><span>收到回音</span><span>{{ gameState.echosReceived }} 封</span></div>
          <div class="sc-row"><span>没有回音</span><span>{{ gameState.lettersWritten - gameState.echosReceived }} 封</span></div>
          <div class="sc-row"><span>最高声望</span><span>{{ gameState.reputationPeak }}</span></div>
          <div class="sc-row"><span>送走的客人</span><span>{{ gameState.guestsTurnedAway }} 位</span></div>
        </div>
        <div class="sc-divider"></div>
        <p class="sc-footnote">那些没有收到回音的信，不代表没有被读到。</p>
        <button class="btn-primary" @click="scene = 'words'">继续</button>
        <div class="sc-orn">◆</div>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 文字升华 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'words'" class="screen screen-ending words-bg">
      <div class="words-content">
        <p
          v-for="(line, i) in epilogueLines" :key="i"
          class="epilogue-line"
          :style="{ animationDelay: `${i * 1.2}s` }"
        >{{ line }}</p>
        <button
          class="btn-primary"
          :style="{ animationDelay: `${epilogueLines.length * 1.2 + 0.5}s`, animation: 'fadeIn 1s ease forwards', opacity: 0 }"
          @click="scene = 'last-letter'"
        >继续</button>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 空白信纸 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'last-letter'" class="screen screen-ending last-letter-bg">
      <div class="last-paper-wrap">
        <textarea
          v-model="lastLetterContent"
          class="last-paper"
          spellcheck="false"
        />
      </div>
    </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useGameLogic } from './composables/useGameLogic'

const {
  state:gameState,
  initGame,
  generateNextGuest,
  sendToGuest,
  polishLetter,
  reviewLetter,
  submitLetter,
  changeReputation,
} = useGameLogic()

// ── 场景 ──
const scene          = ref('title')
const titleReady     = ref(false)
const introReady     = ref(false)

onMounted(async () => {
  await initGame()
  setTimeout(() => { titleReady.value = true }, 100)
})

function onStart() {
  scene.value = 'intro'
  setTimeout(() => { introReady.value = true }, 100)
}

async function enterStreet() {
  scene.value = 'street'
  scheduleNextGuest()
}

// ── 街道 ──
const guestWaiting    = ref(false)
const detailDesc      = ref('')
const notePopup       = ref(null)
const selectedLetter  = ref(null)
const lastLetterContent = ref('')

const streetDetails = [
  { id: 'p', icon: '🚶', desc: '他走得很快，手里拿着什么东西，也许是去赶集。', style: { left: '14%', top: '46%' } },
  { id: 'l', icon: '🍂', desc: '秋天了。', style: { left: '63%', top: '36%' } },
  { id: 'c', icon: '🏃', desc: '远处有个小孩，不知道在追什么。', style: { left: '81%', top: '53%' } },
  { id: 'w', icon: '🪧', desc: '风把木牌吹得动了一下。', style: { left: '45%', top: '27%' } },
]

function showDetail(desc) {
  detailDesc.value = desc
  setTimeout(() => { detailDesc.value = '' }, 2500)
}

const signTilt = computed(() => {
  if (gameState.reputation <= 0)  return 'tilt-heavy'
  if (gameState.reputation < 20)  return 'tilt-mild'
  return ''
})

const reputationNotes = computed(() => {
  const count =
    gameState.reputation > 60 ? 4 :
    gameState.reputation > 40 ? 2 :
    gameState.reputation > 20 ? 1 : 0
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
      top: `${[0, 8, -4, 12][i]}px`,
      left: `${[0, 20, 40, 10][i]}px`,
    }
  }))
})

const waitingText = computed(() => {
  if (gameState.reputation <= 0)              return '今天没有人来。'
  if (gameState.currentSeason === 'summer')   return '天热，街上没什么人。'
  return '等着。'
})

async function scheduleNextGuest() {
  const delay = gameState.reputation > 60 ? 3000
    : gameState.reputation > 30 ? 6000 : 10000
  setTimeout(async () => {
    if (scene.value !== 'street') return
    const guest = await generateNextGuest()
    if (guest) guestWaiting.value = true
  }, delay)
}

function enterGuest() {
  guestWaiting.value = false
  messages.value = []
  if (gameState.currentGuest?.openingLine) {
    messages.value.push({ role: 'guest', text: gameState.currentGuest.openingLine })
  }
  scene.value = 'guest'
}

function onLeaveGuest() {
  scene.value = 'street'
  scheduleNextGuest()
}

function onRetire() {
  if (confirm('收起笔，回家？\n还有人在等你写信。')) {
    scene.value = 'closing'
    setTimeout(() => { scene.value = 'stats' }, 5500)
  }
}

// ── 对话 ──
const messages          = ref([])
const dialogueInput     = ref('')
const isDialogueLoading = ref(false)
const dialogueArea      = ref(null)

async function sendDialogue() {
  const text = dialogueInput.value.trim()
  if (!text || isDialogueLoading.value) return
  dialogueInput.value = ''
  messages.value.push({ role: 'player', text })
  isDialogueLoading.value = true

  const reply = await sendToGuest({
    playerMessage: text,
    conversationHistory: messages.value,
  })

  isDialogueLoading.value = false

  if (reply.guestLeft) {
    messages.value.push({ role: 'guest', text: reply.text })
    setTimeout(() => {
      messages.value = []
      scene.value = 'street'
      scheduleNextGuest()
    }, 2000)
    return
  }

  messages.value.push({ role: 'guest', text: reply.text })
  await nextTick()
  if (dialogueArea.value) {
    dialogueArea.value.scrollTop = dialogueArea.value.scrollHeight
  }
}

// ── 写信 ──
const showLetterPanel = ref(false)
const letterContent   = ref('')
const isPolishing     = ref(false)
const reviewMode      = ref(false)
const reviewText      = ref('')
const reviewResult    = ref('')
const editHint        = ref('')
const revisionCount   = ref(0)

const paramValues = ref({ tone: '朴实', length: '适中', focus: '偏感情', signature: '要' })
const params = [
  { key: 'tone',      label: '语气', options: ['朴实','温柔','正式','克制'] },
  { key: 'length',    label: '长度', options: ['简短','适中','详尽'] },
  { key: 'focus',     label: '重点', options: ['偏事情','偏感情','偏请求'] },
  { key: 'signature', label: '落款', options: ['要','不要'] },
]

async function onPolish() {
  isPolishing.value = true
  const result = await polishLetter({
    playerDraft: letterContent.value,
    params: paramValues.value,
    conversationHistory: messages.value,
  })
  if (result) letterContent.value = result
  isPolishing.value = false
}

async function onSubmitLetter() {
  showLetterPanel.value = false
  const raw = await reviewLetter({
    letterContent: letterContent.value,
    revisionCount: revisionCount.value,
    conversationHistory: messages.value,
  })
  reviewText.value   = raw.reaction
  reviewResult.value = raw.result
  editHint.value     = raw.editHint ?? ''
  reviewMode.value   = true
  if (raw.result !== 'satisfied') revisionCount.value++
}

function onLetterDone() {
  submitLetter({
    content:         letterContent.value,
    recipient:       gameState.currentGuest?.recipient,
    reputationDelta: reviewResult.value === 'satisfied' ? 3 : -2,
  })
  reviewMode.value    = false
  showLetterPanel.value = false
  letterContent.value = ''
  revisionCount.value = 0
  messages.value      = []
  scene.value = 'street'
  scheduleNextGuest()
}

// ── 导出 ──
function exportLetters() {
  const lines = [
    '════════════════════════════════════',
    '代 笔 者 · 信 件 档 案',
    '════════════════════════════════════',
    '',
    `执笔岁月：${gameState.yearsElapsed}年`,
    `信件总数：${gameState.lettersWritten}封`,
    '',
    '════════════════════════════════════',
    '',
  ]
  gameState.letterArchive.forEach((l, i) => {
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
  a.href = url
  a.download = '代笔者_信件档案.txt'
  a.click()
  URL.revokeObjectURL(url)
}

// ── 结局 ──
const closingLines = [
  '桌上的笔放下了。',
  '木牌被翻过去，反面朝外。',
  '街上还是有人走过。',
  '有人往这边看了一眼，又走开了。',
  '天色慢慢暗下来。',
]

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
</script>

<style scoped>
/* ══════════════════════════════════════════
   CSS 变量
══════════════════════════════════════════ */
.letter-writer {
  --bg-paper:       #F7F4EB;
  --bg-panel:       rgba(255,255,255,0.65);
  --bg-panel-hover: rgba(255,255,255,0.92);
  --border-brass:   #D4C4A8;
  --border-gold:    #B89947;
  --text-main:      #3C352D;
  --text-muted:     #8C7F70;
  --tech-teal:      #4A8E8B;
  --alert-red:      #B54A4A;
  --shadow-card:    0 2px 12px rgba(60,53,45,0.06);
  --shadow-hover:   0 8px 24px rgba(184,153,71,0.15);

  font-family: 'KaiTi','STKaiti','Noto Serif SC',serif;
  width: 100vw;
  height: 100vh;
  background: var(--bg-paper);
  color: var(--text-main);
  overflow: hidden;
  position: relative;
}

/* 纸张纹理 */
.letter-writer::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: multiply;
}

.screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

/* ══════════════════════════════════════════
   动画
══════════════════════════════════════════ */
.fade-enter-active {
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1), filter 0.7s;
}
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s, filter 0.4s;
}
.fade-enter-from { opacity: 0; transform: translateY(10px) scale(0.99); filter: blur(6px); }
.fade-leave-to   { opacity: 0; transform: translateY(-6px) scale(1.01); filter: blur(3px); }

.story-fade-enter-active { transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
.story-fade-leave-active { transition: opacity 0.35s ease, transform 0.35s; position: absolute; width: 100%; }
.story-fade-enter-from { opacity: 0; transform: translateX(40px); }
.story-fade-leave-to   { opacity: 0; transform: translateX(-30px); }

.panel-up-enter-active { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s; }
.panel-up-leave-active { transition: transform 0.25s ease, opacity 0.2s; }
.panel-up-enter-from { transform: translateY(100%); opacity: 0; }
.panel-up-leave-to   { transform: translateY(100%); opacity: 0; }

@keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes blink     { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 0.8; } }

/* ══════════════════════════════════════════
   通用按钮
══════════════════════════════════════════ */
.btn-primary {
  padding: 0.65rem 1.6rem;
  background: linear-gradient(180deg, #FFF, #F0EBE0);
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(184,153,71,0.15), 0 1px 0 #FFF inset;
}
.btn-primary:hover:not(:disabled) {
  background: #FFF;
  border-color: #9A7D35;
  color: #9A7D35;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(184,153,71,0.25);
}
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  padding: 0.65rem 1.4rem;
  background: transparent;
  border: 1px solid var(--border-brass);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: var(--text-main);
  color: var(--text-main);
  background: rgba(255,255,255,0.5);
}

.back-btn {
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid var(--border-brass);
  border-radius: 2px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s;
}
.back-btn:hover { border-color: var(--border-gold); color: var(--border-gold); }

/* ══════════════════════════════════════════
   开始界面
══════════════════════════════════════════ */
.screen-title {
  align-items: center;
  justify-content: center;
  background: var(--bg-paper);
  overflow: hidden;
}

.title-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(184,153,71,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,153,71,0.1) 1px, transparent 1px);
  background-size: 32px 32px;
}
.title-grid::after {
  content: '';
  position: absolute;
  top: 40%; left: 50%;
  transform: translate(-50%,-50%);
  width: 85vw; height: 85vw;
  max-width: 560px; max-height: 560px;
  border-radius: 50%;
  border: 1px dashed rgba(74,142,139,0.4);
  animation: spin 40s linear infinite;
}
.title-grid::before {
  content: '';
  position: absolute;
  top: 40%; left: 50%;
  transform: translate(-50%,-50%);
  width: 58vw; height: 58vw;
  max-width: 380px; max-height: 380px;
  border-radius: 50%;
  border: 2px dotted rgba(184,153,71,0.4);
  animation: spinR 28s linear infinite;
}
@keyframes spin  { to { transform: translate(-50%,-50%) rotate(360deg); } }
@keyframes spinR { to { transform: translate(-50%,-50%) rotate(-360deg); } }

.title-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 30%, rgba(184,153,71,0.08), transparent 60%),
    radial-gradient(ellipse 50% 45% at 80% 70%, rgba(74,142,139,0.06), transparent 60%);
  animation: glowDrift 12s ease-in-out infinite alternate;
}
@keyframes glowDrift {
  from { opacity: 0.6; }
  to   { opacity: 1; }
}

.title-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 1.2s ease, transform 1.2s ease;
  max-width: 300px;
  width: 100%;
  padding: 0 1.5rem;
}
.title-content.visible { opacity: 1; transform: translateY(0); }

.title-tag {
  font-size: 0.5rem;
  color: var(--border-gold);
  letter-spacing: 0.3em;
  font-family: 'Courier New', monospace;
}
.title-main {
  font-size: 2.2rem;
  font-weight: bold;
  letter-spacing: 0.35em;
  color: var(--text-main);
  animation: titleGlow 5s ease-in-out infinite alternate;
}
@keyframes titleGlow {
  from { text-shadow: 0 2px 8px rgba(184,153,71,0.15); }
  to   { text-shadow: 0 2px 20px rgba(184,153,71,0.35); }
}
.title-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.2em;
}
.title-divider {
  width: 60px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-gold), transparent);
  opacity: 0.6;
  margin: 0.2rem 0;
}
.title-actions { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; }

.title-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.8rem 1.2rem;
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  width: 100%;
}
.title-btn.primary {
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(240,235,224,0.9));
  border: 1px solid var(--border-gold);
  color: var(--border-gold);
  box-shadow: 0 4px 12px rgba(184,153,71,0.15), 0 1px 0 #FFF inset;
}
.title-btn.primary:hover {
  background: #FFF;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(184,153,71,0.25);
}
.title-btn.secondary {
  background: transparent;
  border: 1px dashed var(--border-brass);
  color: var(--text-muted);
}
.title-btn.secondary:hover {
  border-style: solid;
  border-color: var(--border-gold);
  color: var(--border-gold);
  background: rgba(255,255,255,0.5);
  transform: translateY(-1px);
}
.btn-icon { font-size: 0.7rem; opacity: 0.8; }

/* ══════════════════════════════════════════
   背景介绍
══════════════════════════════════════════ */
.screen-intro {
  background: #F5F2E8;
  overflow: hidden;
}
.intro-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(200,190,170,0.3) 100%);
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: multiply;
}
.intro-nav {
  padding: 1.2rem 1.5rem;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 2rem 1rem;
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease, transform 0.7s ease;
  overflow-y: auto;
  position: relative;
  z-index: 10;
}
.intro-content::-webkit-scrollbar { display: none; }
.intro-content.visible { opacity: 1; transform: translateY(0); }

.intro-chapter-tag {
  font-size: 0.88rem;
  color: var(--border-gold);
  letter-spacing: 0.4em;
  margin-bottom: 1.5rem;
}
.intro-body { display: flex; flex-direction: column; gap: 0.9rem; flex: 1; }

.intro-lead {
  font-size: 1.15rem;
  color: var(--text-main);
  letter-spacing: 0.12em;
  line-height: 1.8;
  font-weight: bold;
}
.intro-text {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 2.2;
  letter-spacing: 0.05em;
}
.intro-text.highlight-block {
  background: rgba(184,153,71,0.05);
  border-left: 3px solid var(--border-gold);
  padding: 0.6rem 1rem;
  color: var(--text-main);
  border-radius: 0 3px 3px 0;
}
.intro-quote {
  font-size: 0.88rem;
  color: var(--tech-teal);
  line-height: 2;
  font-style: italic;
  padding: 0.8rem 0;
  border-top: 1px dashed var(--border-brass);
  border-bottom: 1px dashed var(--border-brass);
  text-align: center;
}
.intro-quote.final-quote {
  font-size: 0.95rem;
  border-color: var(--border-gold);
}
.intro-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1.2rem 0 0.5rem;
  flex-shrink: 0;
}
.intro-next-btn {
  padding: 0.65rem 2rem;
  background: transparent;
  border: 1px solid var(--border-gold);
  border-radius: 2px;
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.3s;
}
.intro-next-btn:hover { background: rgba(184,153,71,0.08); transform: translateX(4px); }

/* ══════════════════════════════════════════
   街道
══════════════════════════════════════════ */
.screen-street {
  overflow: hidden;
  transition: background 2s;
}
.season-spring { background: #F0EDD8; }
.season-summer { background: #EDECCE; }
.season-autumn { background: #F0E6CC; }
.season-winter { background: #EAE8E0; }

.street-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(184,153,71,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,153,71,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.street-details { position: absolute; inset: 0; pointer-events: none; }
.detail-item {
  position: absolute;
  font-size: 1.3rem;
  cursor: pointer;
  pointer-events: all;
  opacity: 0.55;
  transition: opacity 0.2s;
  user-select: none;
}
.detail-item:hover { opacity: 1; }

/* 桌子区域 */
.table-area {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.sign-wrapper { position: relative; }
.sign {
  background: #C4963A;
  color: #2C1A00;
  padding: 10px 22px;
  border-radius: 3px;
  text-align: center;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.4) inset;
  transition: transform 0.6s;
}
.sign-main { font-size: 1.05rem; letter-spacing: 0.22em; font-weight: bold; }
.sign-sub  { font-size: 0.6rem; letter-spacing: 0.1em; opacity: 0.65; margin-top: 3px; }
.tilt-mild  { transform: rotate(-4deg); }
.tilt-heavy { transform: rotate(-13deg); }

.reputation-notes {
  position: absolute;
  top: -8px; right: -38px;
  width: 80px; height: 60px;
}
.rep-note {
  position: absolute;
  background: #FFFBE6;
  font-size: 0.5rem;
  padding: 3px 5px;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.12);
  cursor: pointer;
  white-space: nowrap;
  max-width: 75px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.table {
  width: 290px;
  height: 68px;
  background: #7A5C14;
  border-radius: 3px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
}
.table-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  color: #F5F0E8;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.table-item:hover { opacity: 1; }
.table-icon  { font-size: 1.3rem; }
.table-label { font-size: 0.58rem; }

/* 等待 / 到来 */
.waiting-hint {
  position: absolute;
  bottom: 9%;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-muted);
  font-size: 0.85rem;
  opacity: 0.45;
  letter-spacing: 0.12em;
}

.guest-approaching {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
}
.approach-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-brass);
  border-radius: 6px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(6px);
  text-align: center;
}
.approach-text {
  font-size: 0.88rem;
  color: var(--text-main);
  line-height: 1.9;
  max-width: 260px;
}

/* 细节弹出 */
.detail-popup {
  position: absolute;
  top: 16%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(247,244,235,0.94);
  border: 1px solid var(--border-brass);
  color: var(--text-main);
  font-size: 0.85rem;
  padding: 10px 20px;
  border-radius: 3px;
  max-width: 260px;
  text-align: center;
  line-height: 1.8;
  pointer-events: none;
  box-shadow: var(--shadow-card);
}

.note-popup {
  position: absolute;
  top: 26%;
  left: 50%;
  transform: translateX(-50%);
  background: #FFFBE6;
  border: 1px solid var(--border-brass);
  color: #333;
  font-size: 0.85rem;
  padding: 12px 20px;
  border-radius: 3px;
  max-width: 200px;
  text-align: center;
  line-height: 1.8;
  cursor: pointer;
  box-shadow: var(--shadow-card);
}

.street-footer {
  position: absolute;
  bottom: 16px;
  right: 20px;
}
.retire-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-family: inherit;
  opacity: 0.3;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: opacity 0.2s;
}
.retire-btn:hover { opacity: 0.7; }

/* ══════════════════════════════════════════
   接客对话
══════════════════════════════════════════ */
.screen-guest {
  background: var(--bg-paper);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶栏 */
.guest-topbar {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--border-brass);
  background: rgba(247,244,235,0.95);
  backdrop-filter: blur(6px);
  flex-shrink: 0;
}

/* 客人信息条 */
.guest-profile-bar {
  padding: 0.6rem 1.2rem;
  background: rgba(184,153,71,0.06);
  border-bottom: 1px solid var(--border-brass);
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}
.gp-identity {
  font-size: 0.82rem;
  color: var(--text-main);
  font-weight: bold;
  letter-spacing: 0.05em;
  line-height: 1.6;
}
.gp-purpose {
  font-size: 0.72rem;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  line-height: 1.6;
}

/* 对话框 */
.dialogue-frame {
  flex: 1;
  min-height: 0;
  margin: 0.8rem;
  background: #FFF;
  border: 1px solid var(--border-brass);
  border-radius: 6px;
  box-shadow:
    inset 0 0 20px rgba(212,196,168,0.15),
    0 2px 12px rgba(60,53,45,0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 对话框内部光效 */
.dialogue-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 40% at 20% 20%, rgba(184,153,71,0.04), transparent 60%),
    radial-gradient(ellipse 50% 40% at 80% 80%, rgba(74,142,139,0.03), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.dialogue-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
  position: relative;
  z-index: 1;
}
.dialogue-scroll::-webkit-scrollbar { width: 3px; }
.dialogue-scroll::-webkit-scrollbar-thumb { background: var(--border-brass); border-radius: 2px; }

.message-wrap { display: flex; }
.message-wrap.guest  { justify-content: flex-start; }
.message-wrap.player { justify-content: flex-end; }

.bubble {
  max-width: 85%;
  font-size: 0.9rem;
  line-height: 2.1;
  white-space: pre-wrap;
}

/* 客人气泡：左边竖线，像小说段落 */
.guest-bubble {
  background: transparent;
  color: var(--text-main);
  border-left: 2px solid var(--border-brass);
  border-radius: 0 4px 4px 0;
  padding: 8px 14px;
}

/* 玩家气泡 */
.player-bubble {
  background: rgba(184,153,71,0.07);
  border: 1px solid rgba(184,153,71,0.18);
  color: var(--text-main);
  border-radius: 6px 6px 0 6px;
  padding: 8px 14px;
  max-width: 75%;
}

/* 加载气泡 */
.loading-bubble {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 10px 14px;
  min-height: 40px;
}
.dot {
  width: 5px; height: 5px;
  background: var(--text-muted);
  border-radius: 50%;
  opacity: 0.3;
  animation: blink 1.2s infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

/* 底部输入 */
.guest-bottom {
  border-top: 1px solid var(--border-brass);
  padding: 0.6rem 1rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(247,244,235,0.95);
  backdrop-filter: blur(6px);
  flex-shrink: 0;
}

.float-write-btn {
  align-self: flex-end;
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 14px;
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.75rem;
  padding: 4px 14px;
  cursor: pointer;
  letter-spacing: 0.1em;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 2px 6px rgba(184,153,71,0.1);
}
.float-write-btn:hover:not(:disabled) {
  background: rgba(184,153,71,0.08);
  transform: translateY(-1px);
}
.float-write-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.chat-input {
  flex: 1;
  background: rgba(255,255,255,0.85);
  border: 1px solid var(--border-brass);
  border-radius: 4px;
  padding: 8px 12px;
  font-family: inherit;
  font-size: 0.88rem;
  color: var(--text-main);
  resize: none;
  line-height: 1.8;
  transition: border-color 0.2s;
}
.chat-input:focus { outline: none; border-color: var(--border-gold); }
.chat-input::placeholder { color: #C4B49A; }

.send-btn {
  background: var(--border-gold);
  color: #FFF;
  border: none;
  padding: 9px 16px;
  font-family: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  border-radius: 4px;
  letter-spacing: 0.08em;
  transition: opacity 0.2s;
  font-weight: bold;
  white-space: nowrap;
}
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.send-btn:hover:not(:disabled) { opacity: 0.85; }

/* ══════════════════════════════════════════
   写信悬浮面板
══════════════════════════════════════════ */
.letter-panel-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 50;
}
.letter-panel {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  padding: 1rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 72vh;
  box-shadow: 0 -6px 24px rgba(184,153,71,0.12);
}

.lp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.lp-title { font-size: 0.82rem; color: var(--text-muted); letter-spacing: 0.1em; }
.lp-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.lp-close:hover { opacity: 1; }

/* 参数行 */
.lp-params {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 8px 10px;
  background: rgba(247,244,235,0.6);
  border: 1px dashed var(--border-brass);
  border-radius: 4px;
}
.param-group { display: flex; align-items: center; gap: 6px; }
.param-label { font-size: 0.72rem; color: var(--text-muted); }
.param-select {
  background: #FFF;
  border: 1px solid var(--border-brass);
  border-radius: 2px;
  padding: 2px 6px;
  font-family: inherit;
  font-size: 0.72rem;
  color: var(--text-main);
  cursor: pointer;
}
.param-select:focus { outline: none; border-color: var(--border-gold); }

/* 信纸 */
.lp-paper-wrap {
  flex: 1;
  min-height: 160px;
  background: #FFFEF5;
  border: 1px solid rgba(184,153,71,0.2);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.03);
}
.lp-paper {
  width: 100%;
  height: 100%;
  min-height: 160px;
  background: transparent;
  border: none;
  padding: 16px 20px;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--text-main);
  line-height: 2.2;
  resize: none;
}
.lp-paper:focus { outline: none; }
.lp-paper::placeholder { color: #C4B49A; }

/* 操作 */
.lp-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-shrink: 0;
}
.btn-polish {
  background: transparent;
  border: 1px solid rgba(184,153,71,0.3);
  color: var(--text-muted);
  padding: 0.55rem 16px;
  font-family: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  border-radius: 3px;
  letter-spacing: 0.08em;
  transition: all 0.2s;
}
.btn-polish:hover:not(:disabled) { border-color: var(--border-gold); color: var(--border-gold); }
.btn-polish:disabled { opacity: 0.4; cursor: not-allowed; }

/* ══════════════════════════════════════════
   客人审阅
══════════════════════════════════════════ */
.review-overlay {
  position: absolute;
  inset: 0;
  background: rgba(247,244,235,0.88);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 60;
}
.review-box {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 1.5rem 1.8rem 1.8rem;
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 -6px 24px rgba(184,153,71,0.12);
}
.review-tag {
  font-size: 0.6rem;
  color: var(--border-gold);
  letter-spacing: 0.3em;
}
.review-text {
  font-size: 0.95rem;
  line-height: 2.1;
  color: var(--text-main);
  white-space: pre-wrap;
}
.edit-hint { font-size: 0.8rem; color: var(--text-muted); font-style: italic; }
.review-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }

/* ══════════════════════════════════════════
   信件档案
══════════════════════════════════════════ */
.screen-archive {
  background: var(--bg-paper);
  overflow: hidden;
}

.archive-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-brass);
  flex-shrink: 0;
}
.archive-title { font-size: 0.9rem; color: var(--text-main); letter-spacing: 0.15em; }
.btn-export-small {
  background: transparent;
  border: 1px solid var(--border-brass);
  color: var(--text-muted);
  padding: 4px 12px;
  font-family: inherit;
  font-size: 0.72rem;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;
}
.btn-export-small:hover { border-color: var(--border-gold); color: var(--border-gold); }

.archive-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.archive-list::-webkit-scrollbar { width: 3px; }
.archive-list::-webkit-scrollbar-thumb { background: var(--border-brass); }

.archive-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-brass);
  border-radius: 5px;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  display: grid;
  grid-template-columns: 90px 110px 1fr 52px;
  gap: 10px;
  align-items: center;
  font-size: 0.82rem;
  box-shadow: var(--shadow-card);
}
.archive-card:hover {
  border-color: var(--border-gold);
  background: #FFF;
  transform: translateX(3px);
  box-shadow: var(--shadow-hover);
}
.ac-date      { color: var(--text-muted); }
.ac-recipient { color: var(--text-main); }
.ac-preview   { color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ac-echo      { color: var(--border-gold); font-size: 0.7rem; text-align: right; }

.archive-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.88rem;
  padding: 40px 0;
  opacity: 0.6;
}

.letter-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(247,244,235,0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}
.letter-detail-box {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 1.5rem 2rem 2rem;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 -6px 24px rgba(184,153,71,0.1);
}
.ld-date    { font-size: 0.8rem; color: var(--text-muted); }
.ld-content { font-size: 0.9rem; color: var(--text-main); line-height: 2.2; white-space: pre-wrap; flex: 1; }
.ld-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  padding-top: 12px;
  border-top: 1px solid var(--border-brass);
  color: var(--text-muted);
}
.ld-echo    { color: var(--border-gold); }
.ld-no-echo { color: #C4B49A; }

/* ══════════════════════════════════════════
   结局
══════════════════════════════════════════ */
.screen-ending {
  background: #F5F0E8;
  align-items: center;
  justify-content: center;
}

/* 收摊过场 */
.closing-lines {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}
.closing-lines p {
  font-size: 1rem;
  color: var(--text-main);
  letter-spacing: 0.12em;
  line-height: 2;
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
}
.closing-lines p:nth-child(1) { animation-delay: 0s; }
.closing-lines p:nth-child(2) { animation-delay: 0.9s; }
.closing-lines p:nth-child(3) { animation-delay: 1.8s; }
.closing-lines p:nth-child(4) { animation-delay: 2.7s; }
.closing-lines p:nth-child(5) { animation-delay: 3.6s; }

/* 统计卡 */
.stats-card {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  padding: 2.5rem 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: 360px;
  box-shadow: 0 10px 40px rgba(184,153,71,0.1), 0 0 0 6px rgba(255,255,255,0.5);
}
.sc-orn   { font-size: 0.6rem; color: var(--border-brass); }
.sc-title { font-size: 1.1rem; color: var(--text-main); font-weight: bold; letter-spacing: 0.3em; }
.sc-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, var(--border-brass), transparent); }
.sc-rows  { width: 100%; display: flex; flex-direction: column; gap: 12px; }
.sc-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-main);
  letter-spacing: 0.06em;
}
.sc-row span:last-child {
  color: var(--border-gold);
  font-family: 'Courier New', monospace;
  font-weight: bold;
}
.sc-footnote {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  letter-spacing: 0.08em;
  line-height: 1.8;
  animation: fadeIn 1.5s ease 0.5s forwards;
  opacity: 0;
}

/* 文字升华 */
.words-bg { background: #F5F2EA; }
.words-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  max-width: 460px;
  text-align: center;
  padding: 0 2rem;
}
.epilogue-line {
  font-size: 1rem;
  color: var(--text-main);
  letter-spacing: 0.1em;
  line-height: 2;
  animation: fadeIn 1.2s ease forwards;
  opacity: 0;
  min-height: 1.5em;
}

/* 空白信纸 */
.last-letter-bg { background: #F5F2EA; }
.last-paper-wrap {
  width: 500px;
  height: 620px;
  background: #FFFEF5;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(184,153,71,0.15);
  border-radius: 2px;
}
.last-paper {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  padding: 44px 52px;
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--text-main);
  line-height: 2.2;
  resize: none;
}
.last-paper:focus { outline: none; }

/* ══════════════════════════════════════════
   移动端
══════════════════════════════════════════ */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
.guest-bubble, .player-bubble, .review-text,
.ld-content, .lp-paper, .last-paper, .chat-input {
  -webkit-user-select: auto;
  user-select: auto;
}

@media (max-width: 768px) {
  .dialogue-area { padding: 20px 5%; }
  .guest-bottom  { padding: 10px 5%; }
  .lp-params     { gap: 8px; }
  .stats-card    { padding: 2rem 1.8rem; min-width: 0; width: 90%; }
  .last-paper-wrap { width: 90%; height: 70vh; }
  .archive-card {
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto auto;
  }
  .ac-echo { grid-column: 2; }
}
</style>
