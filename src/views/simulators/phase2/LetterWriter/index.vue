<template>
  <div class="letter-writer">

    <!-- 1. 全局背景层：墙面、暗角、尘埃 -->
    <div class="wall-texture"></div>
    <div class="wall-vignette"></div>
    <div class="dust-container">
      <span v-for="i in 18" :key="i" class="dust-particle" :style="getDustStyle(i)"></span>
    </div>

    <!-- ══════════ 开始界面 (Title) ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'title'" class="screen">
      <div class="vintage-paper-card title-card" :class="{ visible: titleReady, 'sway-anim': true }">
        <div class="pushpin pushpin-tl"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="pushpin pushpin-tr"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="paper-aging-overlay"></div>
        
        <div class="doc-header">
          <div class="doc-serial">NO. 198X-84071</div>
          <div class="doc-type">【 街头代笔营业志 】</div>
        </div>

        <div class="doc-body">
          <div class="doc-watermark"></div>
          <div class="title-group">
            <h1 class="title-main">执笔者</h1>
            <div class="title-pinyin">写信人模拟器</div>
          </div>
          <div class="title-slogan">
            <span class="slogan-line"></span>
            <span class="slogan-text">[一张桌 · 一支笔 · 一份爱的传递]</span>
            <span class="slogan-line"></span>
          </div>
          <div class="vintage-stamp round-stamp">
            <div class="stamp-inner">
              <span class="stamp-top">1980s</span>
              <span class="stamp-mid">专业代笔</span>
              <span class="stamp-bot">Letter Writer</span>
            </div>
          </div>
        </div>

        <div class="doc-footer">
          <ul class="vintage-menu">
            <li>
              <button class="menu-btn" @click="onStart">
                <span class="btn-cursor">☞</span>
                <span class="btn-text">翻 开 新 页</span>
                <span class="btn-dots">................</span>
                <span class="btn-action">[ 始 ]</span>
              </button>
            </li>
            <li>
              <button class="menu-btn" :disabled="!hasSave" @click="onContinueGame">
                <span class="btn-cursor">☞</span>
                <span class="btn-text">墨 迹 未 干</span>
                <span class="btn-dots">...........</span>
                <span class="btn-action">[ 续 ]</span>
                <div v-if="hasSave" class="vintage-stamp square-stamp">有存稿</div>
              </button>
            </li>
            <li class="menu-divider"></li>
            <li>
              <<button class="menu-btn secondary" @click="goBack">
                <span class="btn-text">离 开 摊 位</span>
                <span class="btn-dots"></span>
                <span class="btn-action">退</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 背景介绍 (Intro) ══════════ -->
    <Transition name="story-fade">
    <div v-if="scene === 'intro'" class="screen">
      <div class="vintage-paper-card static-card">
        <div class="pushpin pushpin-tl"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="pushpin pushpin-tr"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="paper-aging-overlay"></div>
        
        <div class="doc-header">
          <div class="doc-serial">BACKGROUND</div>
          <div class="doc-type">【 序 · 那个年代 】</div>
        </div>

        <div class="intro-content" :class="{ visible: introReady }">
          <div class="intro-body typewriter-text">
            <p class="intro-lead">在那个年代，写一封信要花很长时间。</p>
            <p>寄出去，要花更长的时间。等回音，有时候要花一辈子。</p>
            <p class="intro-quote">有些话，不说出来，就真的消失了。</p>
            <p>1980年代的中国，很多人想说的话，因为不识字，或者不会写，永远困在心里出不来。</p>
            <p class="highlight-ink">一个会写字的人，能帮助很多不会写字的人说出口。</p>
            <p>你在南方某个小城的街边摆了一张桌，一块木牌，写着：代写书信。</p>
            <p class="intro-quote final-quote">你怎么对待一个人，他就怎么回应你。</p>
          </div>
        </div>

        <div class="doc-footer">
          <button class="menu-btn" @click="enterStreet">
            <span class="btn-cursor">☞</span>
            <span class="btn-text">摆 开 摊 子</span>
            <span class="btn-dots">................</span>
            <span class="btn-action">[ 摆 ]</span>
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 街道主场景 (Street) ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'street'" class="screen">
      <div class="vintage-paper-card static-card" :class="`season-${gameState.currentSeason}`">
        <div class="pushpin pushpin-tl"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="pushpin pushpin-tr"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="paper-aging-overlay"></div>

        <div class="doc-header">
          <button class="text-icon-btn" @click="returnToTitleScreen">‹ 首页</button>
          <div class="doc-serial">STREET - 198{{gameState.yearsElapsed}}</div>
          <div class="doc-type">【 街 头 】</div>
        </div>

        <div class="street-inner">
          <div class="doc-watermark"></div>

          <!-- 顶部信息区：左侧角色卡，右侧日历 -->
          <div class="street-top-info">
            
            <!-- 左上角：复古个体营业执照 -->
            <div class="vintage-license-card" @click="showProfileModal = true">
              <div class="license-inner-border">
                <div class="license-photo-area">
                  <div class="photo-paper">
                    <img v-if="playerAvatar" :src="playerAvatar" class="real-avatar-img" />
                    <span v-else>相片</span>
                  </div>
                  <div class="license-seal">核</div>
                </div>
                <div class="license-text-area">
                  <div class="license-title">营业许可</div>
                  <div class="license-row">行当 <span class="license-value">代写书信</span></div>
                  <div class="license-row">姓名 <span class="license-value handwritten">{{ playerName }}</span></div>
                </div>
              </div>
            </div>

            <!-- 右上角：实体铁圈台历 -->
            <div class="vintage-desk-calendar">
              <div class="cal-rings">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="cal-paper-layer">
                <div class="cal-left-block">
                  <div class="cal-month">{{ realMonth }}</div>
                  <div class="cal-day">{{ realDay }}</div>
                </div>
                <div class="cal-right-block">
                  <div class="cal-week">{{ realWeekday }}</div>
                  <div class="cal-time">{{ realTime }}</div>
                  <div class="cal-weather">{{ simulatedWeather }}</div>
                </div>
              </div>
              <div class="cal-board-base"></div>
            </div>

          </div>

          <!-- 客人来访弹窗 -->
          <Transition name="fade">
            <div v-if="guestWaiting" class="guest-approaching type-box green-zone">
              <p>有人往这边走过来，在桌子对面站了一下，坐下了。</p>
              <button class="ink-btn-red" @click="enterGuest">[ 请 坐 ]</button>
            </div>
            <div v-else-if="!canResumeWriting" class="waiting-hint green-zone-hint">{{ waitingText }}</div>
          </Transition>

          <!-- 底部桌子区域：收音机组 -> 木牌 -> 档案盒 -->
          <div class="table-area">
            
            <div class="radio-and-resume-group">
             
             <div class="radio-bar" :class="{ playing: isRadioPlaying }">

  <!-- 两根天线 -->
  <div class="radio-antennas">
    <div class="antenna antenna-left"></div>
    <div class="antenna antenna-right"></div>
    <!-- 播放时飘出音符 -->
    <template v-if="isRadioPlaying">
      <span class="music-note note-1">♪</span>
      <span class="music-note note-2">♫</span>
      <span class="music-note note-3">♩</span>
    </template>
  </div>

  <!-- 机身 -->
  <div class="radio-body-bar">
    <!-- 左：喇叭网格 -->
    <div class="radio-speaker-grid">
      <span></span><span></span><span></span>
      <span></span><span></span><span></span>
    </div>

    <!-- 中：标签 + 频谱 -->
    <div class="radio-center">
      <div class="radio-title-text">{{ isRadioPlaying ? 'ON AIR' : 'RADIO' }}</div>
      <div class="radio-spectrum" v-if="isRadioPlaying">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="radio-spectrum off" v-else>
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>

    <!-- 右：按钮 -->
    <div class="radio-btns">
      <button class="radio-btn" @click.stop="toggleRadio">
        {{ isRadioPlaying ? '⏸' : '▶' }}
      </button>
      <button class="radio-btn" @click.stop="switchRandomTrack">
        ⏭
      </button>
    </div>
  </div>

</div>



              <!-- 继续写信按钮 -->
              <Transition name="fade">
                <button v-if="canResumeWriting" class="resume-draft-btn" @click="resumeWriting">
                  <span class="rd-icon">✍</span>
                  <span class="rd-text">继续写信</span>
                </button>
              </Transition>
            </div>

            <div class="sign-wrapper">
              <div class="sign vintage-sign" :class="signTilt">
                <p class="sign-main">代 写 书 信</p>
                <p class="sign-sub">识字 · 明理 · 诚信</p>
              </div>
              <div class="reputation-notes">
                <div v-for="note in reputationNotes" :key="note.id" class="rep-note" :style="note.style" @click="notePopup = note.text">{{ note.text }}</div>
              </div>
            </div>

            <div class="archive-box-ui" @click="scene = 'archive'">
              <div class="box-label">档 案<br>信 件</div>
            </div>
            
          </div>
          
          <Transition name="fade">
            <div v-if="detailDesc" class="type-popup">{{ detailDesc }}</div>
          </Transition>
        </div>

        <div class="doc-footer">
          <button class="menu-btn secondary" @click="onRetire">
            <span class="btn-text">收 起 笔 ， 回 家</span><span class="btn-dots"></span><span class="btn-action">‹ 退</span>
          </button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 接客与写信界面 (Guest) ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'guest'" class="screen">
      <div class="vintage-paper-card static-card">
        <div class="pushpin pushpin-tl"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="pushpin pushpin-tr"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="paper-aging-overlay"></div>

        <div class="doc-header">
          <button class="text-icon-btn" @click="onLeaveGuest">‹ 街头</button>
          <div class="doc-serial">GUEST - 001</div>
          <div class="doc-type">【 接 待 】</div>
        </div>

        <div class="guest-profile-bar">
          <div class="gp-identity">{{ gameState.currentGuest?.identity ?? '' }}</div>
          <div class="gp-purpose">{{ gameState.currentGuest?.surfacePurpose ?? '' }}</div>
        </div>

        <div class="dialogue-frame">
          <div class="dialogue-scroll" ref="dialogueArea">
            <div v-for="(msg, i) in messages" :key="i" class="message-wrap" :class="msg.role">
              <div v-if="msg.role === 'guest'" class="bubble guest-bubble">{{ msg.text }}</div>
              <div v-else class="bubble player-bubble">{{ msg.text }}</div>
            </div>
            <div v-if="isDialogueLoading" class="bubble guest-bubble loading-bubble">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>

        <div class="guest-bottom">
          <button class="float-write-btn" :disabled="messages.length < 1" @click="showLetterPanel = true">
            [ ✍ 起草信件 ]
          </button>
          <div class="input-row">
            <textarea
              v-model="dialogueInput" class="chat-input" placeholder="写下你想说的话……" rows="1"
              :disabled="isDialogueLoading" @keydown.enter.exact.prevent="sendDialogue"
            />
            <button class="send-btn" :disabled="!dialogueInput.trim() || isDialogueLoading" @click="sendDialogue">回应</button>
          </div>
        </div>

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
              <textarea v-model="letterContent" class="lp-paper" placeholder="在这里写信……" spellcheck="false" />
            </div>
            <div class="lp-actions">
              <button class="btn-polish" :disabled="isPolishing" @click="onPolish">
                {{ isPolishing ? '润色中……' : '[ AI 润色 ]' }}
              </button>
              <button class="ink-btn-red" style="margin-top:0;" :disabled="!letterContent.trim()" @click="onSubmitLetter">
                交给客人看
              </button>
            </div>
          </div>
        </div>
        </Transition>
        
        <Transition name="fade">
        <div v-if="isReviewLoading" class="review-loading-overlay">
          <div class="review-loading-card">
            <div class="review-loading-paper" aria-hidden="true">
              <span class="review-loading-line short"></span>
              <span class="review-loading-line"></span>
              <span class="review-loading-line"></span>
            </div>
            <div class="review-loading-title">客人正在看信</div>
            <div class="review-loading-copy">他把信接过去，低头一行一行看着。</div>
          </div>
        </div>
        </Transition>

        <Transition name="panel-up">
        <div v-if="reviewMode" class="review-overlay">
          <div class="review-box">
            <div class="review-loading-title">客人回应</div>
            <div class="review-text">{{ reviewText }}</div>
            <div class="review-actions">
              <template v-if="reviewResult === 'satisfied'">
                <button class="btn-primary" @click="onLetterDone">送走客人</button>
              </template>
              <template v-else>
                <span style="font-size:0.75rem; color:#888;">{{ editHint }}</span>
                <button class="btn-secondary" @click="reviewMode = false; showLetterPanel = true">修改一下</button>
              </template>
            </div>
          </div>
        </div>
        </Transition>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 信件档案 (Archive) 牛皮纸信封版 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'archive'" class="screen">
      <div class="vintage-paper-card static-card">
        <div class="pushpin pushpin-tl"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="pushpin pushpin-tr"><div class="pin-head"></div><div class="pin-shadow"></div></div>
        <div class="paper-aging-overlay"></div>

        <div class="doc-header">
          <button class="text-icon-btn" @click="scene = 'street'">‹ 返回</button>
          <div class="doc-serial">ARCHIVE</div>
          <div class="doc-type">【 寄 出 的 信 】</div>
          <button class="text-icon-btn" style="font-weight:normal;" @click="exportLetters">[ 导出 ]</button>
        </div>

        <div class="archive-list">
          <div v-for="letter in gameState.letterArchive" :key="letter.id" 
               class="envelope-list-item" 
               @click="selectedLetter = letter; isEnvelopeOpened = false">
            <div class="env-top-bar">
              <div class="env-postcodes"><span></span><span></span><span></span><span></span><span></span><span></span></div>
              <div class="env-stamp-box">邮资</div>
            </div>
            <div class="env-address-area">
              <div class="env-to">致：</div>
              <div class="env-recipient">{{ letter.recipient }}</div>
            </div>
            <div v-if="letter.echo" class="env-echo-seal">已回函</div>
          </div>
          
          <div v-if="!gameState.letterArchive.length" class="archive-empty">
            <div class="empty-icon">📁</div>
            还没有寄出过信。
          </div>
        </div>

        <Transition name="fade">
        <div v-if="selectedLetter" class="letter-detail-overlay" @click.self="closeLetterModal">
          <Transition name="flip-fade" mode="out-in">
            <!-- 未拆开的大信封 -->
            <div v-if="!isEnvelopeOpened" class="modal-big-envelope" @click="openEnvelope">
              <div class="env-flap-line"></div>
              <div class="big-env-postcodes"><span></span><span></span><span></span><span></span><span></span><span></span></div>
              <div class="big-env-stamp">8分</div>
              <div class="big-env-address">
                <span class="label">收件人：</span>
                <span class="value">{{ selectedLetter.recipient }}</span>
              </div>
              <div class="open-hint-btn">[ 点击拆开信封 ]</div>
            </div>

            <!-- 拆开后的实体信纸 -->
            <div v-else class="letter-detail-box">
              <div class="ld-header">
                <span class="ld-date">{{ selectedLetter.date }}</span>
              </div>
              <div class="ld-content">{{ selectedLetter.content }}</div>
              <div class="ld-footer">
                <span class="ld-recipient">致：{{ selectedLetter.recipient }}</span>
                <span v-if="selectedLetter.echo" class="ld-echo-stamp">回函：{{ selectedLetter.echo }}</span>
              </div>
              <div class="ld-actions">
                 <button class="btn-secondary" @click="closeLetterModal">放回档案盒</button>
              </div>
            </div>
          </Transition>
        </div>
        </Transition>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 玩家档案修改弹窗 (Profile + 头像上传) ══════════ -->
    <Transition name="fade">
    <div v-if="showProfileModal" class="lw-confirm-overlay" @click.self="showProfileModal = false">
      <div class="lw-confirm-card profile-modal">
        <div class="lw-confirm-title">工作证 / 履历</div>
        
        <div class="profile-form">
          <div class="profile-top-row">
            <div class="avatar-upload-box" @click="triggerUpload">
              <img v-if="playerAvatar" :src="playerAvatar" class="real-avatar-img" />
              <div v-else class="upload-hint">点击<br>贴照片</div>
            </div>
            <input type="file" ref="fileInput" accept="image/*" style="display: none;" @change="onFileChange" />
            
            <div class="name-input-group">
              <label>称呼：</label>
              <input v-model="playerName" type="text" class="vintage-input" maxlength="6" placeholder="输入笔名" />
            </div>
          </div>

          <div class="stats-box">
            <div class="stat-item"><span>代笔信件</span><span>{{ gameState.lettersWritten }} 封</span></div>
            <div class="stat-item"><span>收到回音</span><span>{{ gameState.echosReceived }} 封</span></div>
            <div class="stat-item"><span>累积落笔</span><span>{{ totalWordsWritten }} 字</span></div>
            <div class="stat-item"><span>街头声望</span><span>{{ gameState.reputation }}</span></div>
          </div>
        </div>

        <div class="modal-doc-footer">
          <button class="btn-primary" @click="saveProfile">盖章确认</button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 确认收摊/重开弹窗 -->
    <Transition name="fade">
    <div v-if="showConfirmModal" class="lw-confirm-overlay">
      <div class="lw-confirm-card">
        <div class="lw-confirm-title">{{ confirmModalTitle }}</div>
        <div class="lw-confirm-copy">{{ confirmModalCopyLine1 }}<br>{{ confirmModalCopyLine2 }}</div>
        <div class="modal-doc-footer">
          <button class="btn-secondary" @click="cancelConfirmModal">取消</button>
          <button class="btn-primary" @click="confirmModalProceed">{{ confirmModalConfirmText }}</button>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ══════════ 结局系列动画 ══════════ -->
    <Transition name="fade">
    <div v-if="scene === 'closing'" class="screen">
      <div class="vintage-paper-card static-card">
        <div class="paper-aging-overlay"></div>
        <div class="closing-lines">
          <p v-for="(line, i) in closingLines" :key="i" :style="{ animationDelay: `${i * 0.9}s` }">{{ line }}</p>
        </div>
      </div>
    </div>
    </Transition>

    <Transition name="fade">
    <div v-if="scene === 'stats'" class="screen">
      <div class="vintage-paper-card static-card" style="align-items:center; justify-content:center;">
        <div class="paper-aging-overlay"></div>
        <div class="stats-card">
          <div class="sc-title">执笔档案</div>
          <div class="sc-rows">
            <div class="sc-row"><span>写出的信</span><span>{{ gameState.lettersWritten }} 封</span></div>
            <div class="sc-row"><span>收到回音</span><span>{{ gameState.echosReceived }} 封</span></div>
            <div class="sc-row"><span>最高声望</span><span>{{ gameState.reputationPeak }}</span></div>
            <div class="sc-row"><span>送走的客人</span><span>{{ gameState.guestsTurnedAway }} 位</span></div>
          </div>
          <p class="sc-footnote">那些没有收到回音的信，不代表没有被读到。</p>
          <button class="btn-primary" style="margin-top:20px;" @click="scene = 'words'">继续</button>
        </div>
      </div>
    </div>
    </Transition>

    <Transition name="fade">
    <div v-if="scene === 'words'" class="screen">
      <div class="vintage-paper-card static-card">
        <div class="paper-aging-overlay"></div>
        <div class="closing-lines">
          <p v-for="(line, i) in epilogueLines" :key="i" :style="{ animationDelay: `${i * 1.2}s` }">{{ line }}</p>
          <button class="btn-primary" :style="{ animationDelay: `${epilogueLines.length * 1.2 + 0.5}s`, animation: 'fadeIn 1s ease forwards', opacity: 0 }" style="margin: 30px auto 0;" @click="scene = 'last-letter'">继续</button>
        </div>
      </div>
    </div>
    </Transition>

    <Transition name="fade">
    <div v-if="scene === 'last-letter'" class="screen">
      <div class="vintage-paper-card static-card" style="padding:0;">
        <div class="paper-aging-overlay"></div>
        
        <div class="last-paper-wrap" style="display: flex; flex-direction: column; gap: 15px;">
          <div class="doc-header" style="border-bottom: 1px dashed #5A4A35; margin: 0 0 10px 0; padding-bottom: 5px;">
            <div class="doc-serial">EPILOGUE</div>
            <div class="doc-type">【 终 章 】</div>
          </div>

          <textarea v-model="lastLetterContent" class="last-paper" placeholder="留一封给自己的信吧……" spellcheck="false" style="flex: 1;" />
          
          <div style="display: flex; justify-content: flex-end;">
            <button class="btn-primary" @click="finishGame">放进抽屉（回到主界面）</button>
          </div>
        </div>
        
      </div>
    </div>
    </Transition>

    <!-- ★ 全局背景音乐播放器（保证切换场景不断掉） ★ -->
    <audio ref="audioRef" :src="currentAudioSrc" @ended="playNextTrack" preload="auto" ></audio>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useGameLogic } from './composables/useGameLogic'
import { useRouter } from 'vue-router'          
import { useGameStore } from '@/stores/gameStore' 
import { useAudioStore } from '@/stores/audioStore' 
const {
  state:gameState,
  initGame,
  resetGameState,
  saveProgress,
  loadProgress,
  hasProgress,
  clearProgress,
  abortAllRequests,
  generateNextGuest,
  sendToGuest,
  polishLetter,
  reviewLetter,
  submitLetter,
} = useGameLogic()

// ── 玩家档案与上传头像 ──
const playerName = ref('无名氏')
const playerAvatar = ref(null) 
const fileInput = ref(null)    
const showProfileModal = ref(false)

const totalWordsWritten = computed(() => {
  return gameState.letterArchive.reduce((total, letter) => total + letter.content.length, 0)
})

function saveProfile() {
  showProfileModal.value = false
  persistSession(scene.value)
}

function triggerUpload() {
  if (fileInput.value) fileInput.value.click()
}

function onFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    playerAvatar.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// ── 只要有客人，就能继续写信 ──
const canResumeWriting = computed(() => {
  return !!gameState.currentGuest
})

// ── 真实时间与老黄历 ──
const realTime = ref('')
const realMonth = ref('')
const realDay = ref('')
const realWeekday = ref('')
const simulatedWeather = ref('晴 / 微风')
let clockInterval = null

function updateRealTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  realTime.value = `${hours}:${minutes}`
  
  realMonth.value = `${now.getMonth() + 1}月`
  realDay.value = String(now.getDate())
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  realWeekday.value = `星期${weekdays[now.getDay()]}`

  const weathers = ['晴 / 微风', '多云 / 宜人', '阴 / 沉闷', '小雨 / 湿润', '阵雨 / 微凉']
  simulatedWeather.value = weathers[(now.getDate() + now.getHours()) % weathers.length]
}

// ── 收音机与本地歌单(随机切台+暂停保存进度) ──
const playlist = [
  'https://drive.mujian.me/f/By6Uv/LR-bgm1.mp3',
  'https://drive.mujian.me/f/DZgIw/LR-bgm2.mp3',
  'https://drive.mujian.me/f/NvOUG/LR-bgm3.mp3',
  'https://drive.mujian.me/f/Rv2Il/LR-bgm4.mp3',
  'https://drive.mujian.me/f/Oa1sx/LR-bgm5.mp3',
  'https://drive.mujian.me/f/YaEin/LR-bgm6.mp3',
  'https://drive.mujian.me/f/JWDS5/LR-bgm7.mp3',
  'https://drive.mujian.me/f/k18Fk/LR-bgm8.mp3',
  'https://drive.mujian.me/f/nYRUP/LR-bgm9.mp3',
  'https://drive.mujian.me/f/7x7tv/LR-bgm10.mp3',
  'https://drive.mujian.me/f/9rkSo/LR-bgm11.mp3',
]

const router = useRouter()           // ← 加
const gameStore = useGameStore()     // ← 加
const audioStore = useAudioStore()
const isRadioPlaying = ref(false)
const audioRef = ref(null)
const currentTrackIndex = ref(0)
const hasInitialized = ref(false)

const currentAudioSrc = computed(() => {
  return playlist.length > 0 ? playlist[currentTrackIndex.value] : ''
})
// 首次点击屏幕自动播放收音机
const unlockAutoPlay = () => {
  if (!isRadioPlaying.value && audioRef.value && playlist.length > 0) {
    if (!hasInitialized.value) {
      currentTrackIndex.value = Math.floor(Math.random() * playlist.length)
      hasInitialized.value = true
    }
    nextTick(() => {
      audioRef.value.play()
        .then(() => {
          isRadioPlaying.value = true
          audioStore.register(audioRef.value)
          audioStore.fadeIn(audioRef.value, 0.8, 1500)  // ← 淡入
          document.removeEventListener('click', unlockAutoPlay)
          document.removeEventListener('touchstart', unlockAutoPlay)
        })
        .catch(() => console.warn('等待交互以播放音频...'))
    })
  }
}

function pickRandomTrack() {
  if (playlist.length <= 1) return 0
  let nextIndex
  do {
    nextIndex = Math.floor(Math.random() * playlist.length)
  } while (nextIndex === currentTrackIndex.value)
  return nextIndex
}

function toggleRadio() {
  if (!audioRef.value || playlist.length === 0) return
  
  if (isRadioPlaying.value) {
    audioRef.value.pause()
    isRadioPlaying.value = false
    // 不取消注册，让路由跳转时的淡出来处理
  } else {
    if (!hasInitialized.value) {
      currentTrackIndex.value = Math.floor(Math.random() * playlist.length)
      hasInitialized.value = true
    }
    nextTick(() => {
      audioRef.value.play().then(() => {
        isRadioPlaying.value = true
        audioStore.register(audioRef.value)  // ← 播放时注册
      }).catch(e => console.error("收音机播放失败", e))
    })
  }
}


async function playNextTrack() {
  if (playlist.length === 0) return
  currentTrackIndex.value = pickRandomTrack()
  if (isRadioPlaying.value) {
    await nextTick()
    audioRef.value.play().catch(e => console.error("自动切歌失败", e))
  }
}

async function switchRandomTrack() {
  if (playlist.length === 0) return
  currentTrackIndex.value = pickRandomTrack()
  hasInitialized.value = true
  await nextTick()
  audioRef.value.play().then(() => {
    isRadioPlaying.value = true
    audioStore.register(audioRef.value)  // ← 切台时也注册
  }).catch(e => console.error("切台失败", e))
}
// 退出游戏（回到 Hub），带淡出过渡
async function goBack() {
  gameStore.startTransition(false)  // 不显示耳机提示
  await new Promise(r => setTimeout(r, 800))
  router.back()
}


// ── 场景与存档 ──
const scene          = ref('title')
const titleReady     = ref(false)
const introReady     = ref(false)
const hasSave        = ref(false)
const showConfirmModal = ref(false)
const confirmModalType = ref('')

const confirmModalTitle = computed(() => (
  confirmModalType.value === 'retire' ? '现在收摊回家？' : '覆盖当前进度？'
))

const confirmModalCopyLine1 = computed(() => (
  confirmModalType.value === 'retire'
    ? '今天这张桌子就先收起来。'
    : '开始新游戏会覆盖当前《代笔者》进度。'
))

const confirmModalCopyLine2 = computed(() => (
  confirmModalType.value === 'retire'
    ? '确定不再继续接待这位客人吗？'
    : '现在继续吗？'
))

const confirmModalConfirmText = computed(() => (
  confirmModalType.value === 'retire' ? '收起笔，回家' : '开始新游戏'
))

let titleTimer = null
let introTimer = null
let guestTimer = null
let detailTimer = null
let guestDepartTimer = null

function clearSceneTimers() {
  clearTimeout(titleTimer)
  clearTimeout(introTimer)
  clearTimeout(guestTimer)
  clearTimeout(detailTimer)
  clearTimeout(guestDepartTimer)
  titleTimer = null
  introTimer = null
  guestTimer = null
  detailTimer = null
  guestDepartTimer = null
}

function armTitleReveal() {
  titleReady.value = false
  clearTimeout(titleTimer)
  titleTimer = setTimeout(() => { titleReady.value = true }, 100)
}

function armIntroReveal() {
  introReady.value = false
  clearTimeout(introTimer)
  introTimer = setTimeout(() => { introReady.value = true }, 100)
}

function buildSessionSnapshot(sceneOverride = scene.value) {
  return {
    scene: sceneOverride,
    guestWaiting: guestWaiting.value,
    messages: messages.value.map(item => ({ ...item })),
    dialogueInput: dialogueInput.value,
    letterContent: letterContent.value,
    showLetterPanel: showLetterPanel.value,
    reviewMode: reviewMode.value,
    reviewText: reviewText.value,
    reviewResult: reviewResult.value,
    editHint: editHint.value,
    revisionCount: revisionCount.value,
    paramValues: { ...paramValues.value },
    lastLetterContent: lastLetterContent.value,
    playerName: playerName.value,
    playerAvatar: playerAvatar.value 
  }
}

function restoreSessionSnapshot(snapshot = {}) {
  const savedScene = snapshot.scene
  scene.value = ['guest', 'archive', 'title', 'intro'].includes(savedScene)
    ? 'street'
    : (savedScene || 'street')

  guestWaiting.value = Boolean(snapshot.guestWaiting && !gameState.currentGuest)
  messages.value = Array.isArray(snapshot.messages) ? snapshot.messages.map(item => ({ ...item })) : []
  dialogueInput.value = typeof snapshot.dialogueInput === 'string' ? snapshot.dialogueInput : ''
  letterContent.value = typeof snapshot.letterContent === 'string' ? snapshot.letterContent : ''
  showLetterPanel.value = false
  reviewMode.value = false
  reviewText.value = typeof snapshot.reviewText === 'string' ? snapshot.reviewText : ''
  reviewResult.value = typeof snapshot.reviewResult === 'string' ? snapshot.reviewResult : ''
  editHint.value = typeof snapshot.editHint === 'string' ? snapshot.editHint : ''
  revisionCount.value = Number.isFinite(snapshot.revisionCount) ? snapshot.revisionCount : 0
  paramValues.value = {
    tone: '朴实',
    length: '适中',
    focus: '偏感情',
    signature: '要',
    ...(snapshot.paramValues || {})
  }
  lastLetterContent.value = typeof snapshot.lastLetterContent === 'string' ? snapshot.lastLetterContent : ''
  if(snapshot.playerName) playerName.value = snapshot.playerName
  if(snapshot.playerAvatar) playerAvatar.value = snapshot.playerAvatar
}

async function persistSession(sceneOverride = scene.value) {
  await saveProgress(buildSessionSnapshot(sceneOverride))
  hasSave.value = true
}

function getDustStyle(i) {
  const seed = i * 137.508
  const x = (seed % 100)
  const y = ((seed * 1.618) % 100)
  const size = 1 + (seed % 3)
  const duration = 8 + (seed % 12)
  const delay = -(seed % duration)
  const opacity = 0.15 + (seed % 30) / 100
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  }
}

onMounted(async () => {
  await initGame()
  hasSave.value = await hasProgress()
  armTitleReveal()
  
  updateRealTime()
  clockInterval = setInterval(updateRealTime, 10000)
  document.addEventListener('click', unlockAutoPlay)
  document.addEventListener('touchstart', unlockAutoPlay)
})

onBeforeUnmount(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
  // 延迟清理，给淡出留出时间
  setTimeout(() => {
    audioStore.register(null)
  }, 1000)
  clearSceneTimers()
  abortAllRequests()
  clearInterval(clockInterval)
  document.removeEventListener('click', unlockAutoPlay)
  document.removeEventListener('touchstart', unlockAutoPlay)
})


async function onStart() {
  if (hasSave.value) {
    confirmModalType.value = 'new-game'
    showConfirmModal.value = true
    return
  }
  await startFreshGame()
}

async function enterStreet() {
  scene.value = 'street'
  await persistSession('street')
  scheduleNextGuest()
}

async function onContinueGame() {
  const savedSession = await loadProgress()
  if (!savedSession) {
    hasSave.value = false
    return
  }

  restoreSessionSnapshot(savedSession)
  if (scene.value === 'street' && !gameState.currentGuest && !guestWaiting.value) {
    scheduleNextGuest()
  }
}

async function startFreshGame() {
  abortAllRequests()
  await clearProgress()
  resetGameState()
  hasSave.value = false
  showConfirmModal.value = false
  confirmModalType.value = ''
  guestWaiting.value = false
  messages.value = []
  dialogueInput.value = ''
  showLetterPanel.value = false
  letterContent.value = ''
  reviewMode.value = false
  reviewText.value = ''
  reviewResult.value = ''
  editHint.value = ''
  revisionCount.value = 0
  scene.value = 'intro'
  armIntroReveal()
}

function cancelConfirmModal() {
  showConfirmModal.value = false
  confirmModalType.value = ''
}

async function confirmModalProceed() {
  if (confirmModalType.value === 'retire') {
    showConfirmModal.value = false
    confirmModalType.value = ''
    scene.value = 'closing'
    await persistSession('closing')
    clearTimeout(guestDepartTimer)
    guestDepartTimer = setTimeout(async () => {
      scene.value = 'stats'
      await persistSession('stats')
    }, 5500)
    return
  }

  await startFreshGame()
}

// ── 真正结束游戏，返回开始界面 ──
async function finishGame() {
  abortAllRequests()
  await clearProgress() 
  resetGameState()
  hasSave.value = false
  scene.value = 'title'
  armTitleReveal()
}

// ── 街道 ──
const guestWaiting    = ref(false)
const detailDesc      = ref('')
const notePopup       = ref(null)
const lastLetterContent = ref('')

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
  if (gameState.currentGuest)                 return '桌边那封未完的信，还在等你。'
  if (gameState.reputation <= 0)              return '今天没有人来。'
  if (gameState.currentSeason === 'summer')   return '天热，街上没什么人。'
  return '等着。'
})

const isBackgroundWorking = computed(() =>
  isDialogueLoading.value || isPolishing.value || isReviewLoading.value
)

async function scheduleNextGuest() {
  clearTimeout(guestTimer)
  if (scene.value !== 'street') return
  if (gameState.currentGuest || guestWaiting.value || isBackgroundWorking.value) return

  const delay = gameState.reputation > 60 ? 3000
    : gameState.reputation > 30 ? 6000 : 10000
  guestTimer = setTimeout(async () => {
    if (scene.value !== 'street' || gameState.currentGuest || guestWaiting.value) return
    const guest = await generateNextGuest()
    if (guest) {
      guestWaiting.value = true
      await persistSession('street')
    }
  }, delay)
}

async function enterGuest() {
  guestWaiting.value = false
  if (!messages.value.length && gameState.currentGuest?.openingLine) {
    messages.value.push({ role: 'guest', text: gameState.currentGuest.openingLine })
  }
  scene.value = 'guest'
  await persistSession('guest')
}

async function resumeWriting() {
  await enterGuest()
}

async function onLeaveGuest() {
  scene.value = 'street'
  showLetterPanel.value = false
  await persistSession('street')
  if (!gameState.currentGuest) {
    scheduleNextGuest()
  }
}

async function returnToTitleScreen() {
  abortAllRequests()
  isDialogueLoading.value = false
  isPolishing.value = false
  isReviewLoading.value = false
  showLetterPanel.value = false
  guestWaiting.value = false
  if (scene.value !== 'title') {
    await persistSession('street')
  }
  scene.value = 'title'
  armTitleReveal()
}

async function onRetire() {
  confirmModalType.value = 'retire'
  showConfirmModal.value = true
}

// ── 对话 ──
const messages          = ref([])
const dialogueInput     = ref('')
const isDialogueLoading = ref(false)
const isReviewLoading   = ref(false)
const dialogueArea      = ref(null)

async function sendDialogue() {
  const text = dialogueInput.value.trim()
  if (!text || isDialogueLoading.value) return
  dialogueInput.value = ''
  messages.value.push({ role: 'player', text })
  isDialogueLoading.value = true
  await persistSession('guest')

  const reply = await sendToGuest({
    playerMessage: text,
    conversationHistory: messages.value,
  })

  isDialogueLoading.value = false

  if (reply.aborted) {
    await persistSession(scene.value === 'title' ? 'street' : scene.value)
    return
  }

  if (reply.guestLeft) {
    messages.value.push({ role: 'guest', text: reply.text })
    await persistSession('street')
    clearTimeout(guestDepartTimer)
    guestDepartTimer = setTimeout(async () => {
      messages.value = []
      scene.value = 'street'
      await persistSession('street')
      scheduleNextGuest()
    }, 2000)
    return
  }

  messages.value.push({ role: 'guest', text: reply.text })
  await nextTick()
  if (dialogueArea.value) {
    dialogueArea.value.scrollTop = dialogueArea.value.scrollHeight
  }
  await persistSession('guest')
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
  await persistSession('guest')
  const result = await polishLetter({
    playerDraft: letterContent.value,
    params: paramValues.value,
    conversationHistory: messages.value,
  })
  if (!result.aborted && result.content) letterContent.value = result.content
  isPolishing.value = false
  await persistSession(scene.value === 'title' ? 'street' : scene.value)
}

async function onSubmitLetter() {
  showLetterPanel.value = false
  isReviewLoading.value = true
  await persistSession('guest')
  const raw = await reviewLetter({
    letterContent: letterContent.value,
    revisionCount: revisionCount.value,
    conversationHistory: messages.value,
  })
  isReviewLoading.value = false
  if (raw.aborted) {
    await persistSession(scene.value === 'title' ? 'street' : scene.value)
    return
  }
  reviewText.value   = raw.reaction
  reviewResult.value = raw.result
  editHint.value     = raw.editHint ?? ''
  reviewMode.value   = true
  if (raw.result !== 'satisfied') revisionCount.value++
  await persistSession('guest')
}

async function onLetterDone() {
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
  await persistSession('street')
  scheduleNextGuest()
}

// ── 档案信封拆信逻辑 ──
const selectedLetter  = ref(null)
const isEnvelopeOpened = ref(false) 

function openEnvelope() {
  isEnvelopeOpened.value = true
}

function closeLetterModal() {
  selectedLetter.value = null
  setTimeout(() => { isEnvelopeOpened.value = false }, 300)
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
  '在那个年代，',
  '写信是和远方思念之人沟通方式。',
  '寄一封信，要等几天才能收到。',
  '等回音，有时候要花一辈子。',
  '',
  '信件虽小，情谊无价。',
  '有些话，不说出来，就真的消失了。',
  '',
  '书信寄托着人们的惦念。',
  '这件事，比你想象的重要。',
  '',
  '信件已经寄出，感谢你的付出。',
]
</script>

<style scoped>
/* ══════════════════════════════════════════
   1. CSS 变量与基础设定
══════════════════════════════════════════ */
@font-face {
  font-family: '手写中文';
  src: url('https://drive-cdn.mujian.me/49/47353130-e6fe-435b-b8bf-b7379a01877b_手写中文.ttf') format('truetype');
  font-display: swap;
}


.letter-writer {
  --bg-wall:        #5C4A35;
  --bg-paper:       #D8CBA8;
  --bg-paper-light: #E4D8B8;
  --bg-paper-dark:  #C8BA96;
  
  --text-main:      #2A2118;
  --text-muted:     #5A4A35;
  --text-ink-blue:  #183452;
  --text-ink-red:   #8B2020;
  
  --border-ink:     2px solid var(--text-main);
  --shadow-hard:    4px 4px 0 rgba(0, 0, 0, 0.25);
  --shadow-paper:   0 18px 55px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(150, 120, 70, 0.15);

  font-family: 'SimSun', '宋体', 'STSong', serif;
  width: 100%;
  min-height: var(--app-height);
  background-color: var(--bg-wall);
  color: var(--text-main);
  overflow: hidden;
  position: relative;
  perspective: 1800px;
  perspective-origin: 50% 45%;
}

* {
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

/* ══════════════════════════════════════════
   2. 全局底层环境
══════════════════════════════════════════ */
.wall-texture {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    repeating-linear-gradient(180deg, transparent 0px, transparent 44px, rgba(0,0,0,0.18) 44px, rgba(0,0,0,0.18) 47px),
    repeating-linear-gradient(90deg, transparent 0px, transparent 88px, rgba(0,0,0,0.12) 88px, rgba(0,0,0,0.12) 91px),
    repeating-linear-gradient(90deg, transparent 0px, transparent 44px, rgba(0,0,0,0.09) 44px, rgba(0,0,0,0.09) 47px),
    repeating-linear-gradient(180deg, #6B523D 0px, #6B523D 44px, #634D39 44px, #634D39 91px);
  background-blend-mode: multiply;
}
.wall-texture::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 40% 30% at 15% 25%, rgba(90,65,40,0.55), transparent),
    radial-gradient(ellipse 55% 40% at 88% 72%, rgba(40,28,18,0.45), transparent);
}
.wall-vignette {
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(20,13,8,0.65) 100%);
}
.dust-container { position: absolute; inset: 0; pointer-events: none; z-index: 2; overflow: hidden; }
.dust-particle {
  position: absolute; border-radius: 50%; background: rgba(220,200,160,0.9); filter: blur(0.5px);
  animation: dustFloat linear infinite;
}
@keyframes dustFloat {
  0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  45% { transform: translateY(-38vh) translateX(12px) rotate(180deg); }
  90% { opacity: 0.6; }
  100% { transform: translateY(-90vh) translateX(20px) rotate(360deg); opacity: 0; }
}

/* ══════════════════════════════════════════
   3. 通用物理纸张容器
══════════════════════════════════════════ */
.screen {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 10;
}

.vintage-paper-card {
  position: relative;
  width: 92%; max-width: 480px;
  height: 86vh; max-height: 800px;
  display: flex; flex-direction: column;
  background-color: var(--bg-paper);
  background-image: repeating-linear-gradient(180deg, transparent 0px, transparent 24px, rgba(180,150,100,0.18) 24px, rgba(180,150,100,0.18) 25px);
  border: 3px solid var(--text-main);
  outline: 1.5px solid var(--text-main); outline-offset: -8px;
  box-shadow: var(--shadow-hard), var(--shadow-paper);
  padding: 8px;
  transform-origin: 50% 8%;
}

.vintage-paper-card.title-card { height: auto; min-height: 520px; max-height: 85vh; }
.title-card .doc-body { padding: 10px 20px 20px 20px; justify-content: center; }
.title-card .title-group { margin-bottom: 15px; }

.paper-aging-overlay {
  position: absolute; inset: 0; pointer-events: none; z-index: 0; mix-blend-mode: multiply;
  background:
    radial-gradient(ellipse 18% 12% at 8% 6%, rgba(120,85,40,0.22), transparent),
    radial-gradient(ellipse 22% 16% at 92% 96%, rgba(100,75,35,0.18), transparent),
    radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(80,55,25,0.2) 100%);
}

.pushpin { position: absolute; width: 20px; height: 20px; z-index: 20; }
.pushpin-tl { top: -8px; left: 18px; }
.pushpin-tr { top: -8px; right: 18px; }
.pin-head {
  width: 14px; height: 14px; border-radius: 50%; position: relative; z-index: 2;
  background: radial-gradient(circle at 35% 35%, #E8D5B0, #B8960C 40%, #7A6008);
  box-shadow: 0 2px 4px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,240,180,0.6);
}
.pin-shadow { width: 8px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%; margin: 2px auto 0; filter: blur(2px); }

.sway-anim {
  opacity: 0; transform: perspective(1200px) rotateX(4deg) rotateY(-3deg) rotate(-1.5deg) translateY(20px);
  transition: opacity 1.4s cubic-bezier(0.2,0.8,0.2,1), transform 1.4s cubic-bezier(0.2,0.8,0.2,1);
}
.sway-anim.visible { opacity: 1; animation: cardSway 7s ease-in-out 1.4s infinite; }
@keyframes cardSway {
  0%, 100% { transform: perspective(1200px) rotateX(3deg) rotateY(-2deg) rotate(-1deg); }
  50% { transform: perspective(1200px) rotateX(3.5deg) rotateY(-2.5deg) rotate(-1.6deg); }
}
.static-card { transform: perspective(1200px) rotateX(1deg) rotateY(0deg) rotate(0deg); }

/* ══════════════════════════════════════════
   4. 通用内部排版
══════════════════════════════════════════ */
.doc-header {
  position: relative; z-index: 2; margin: 16px 15px 0; padding-bottom: 8px;
  border-bottom: 2px solid var(--text-main); display: flex; justify-content: space-between; align-items: flex-end;
}
.doc-serial { font-family: 'Courier New', monospace; font-size: 0.72rem; color: var(--text-muted); letter-spacing: 0.05em; }
.doc-type { font-family: 'KaiTi', '楷体', serif; font-size: 0.78rem; font-weight: bold; color: var(--text-main); letter-spacing: 0.1em; }

.doc-footer {
  position: relative; z-index: 2; margin: 0 15px 16px; padding-top: 14px;
  border-top: 1px dashed rgba(42,33,24,0.4); flex-shrink: 0;
}

.text-icon-btn { background: none; border: none; font-family: 'SimSun', serif; font-weight: bold; font-size: 0.8rem; color: var(--text-main); cursor: pointer; padding: 0; }
.text-icon-btn:hover { color: var(--text-ink-red); }

.vintage-menu { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.menu-divider { height: 1px; background: rgba(42,33,24,0.1); margin: 0; }
.menu-btn {
  width: 100%; display: flex; align-items: center; background: transparent; border: none;
  font-family: 'SimSun', '宋体', serif; font-size: 1.05rem; font-weight: bold; color: var(--text-main);
  cursor: pointer; padding: 5px 0; position: relative; text-align: left; transition: color 0.2s;
}
.btn-cursor { width: 0; font-size: 1.1rem; opacity: 0; overflow: hidden; transform: translateX(-5px); transition: all 0.2s; white-space: nowrap; }
.menu-btn:hover:not(:disabled) .btn-cursor { width: 24px; opacity: 1; transform: translateX(0); }
.btn-dots { flex: 1; overflow: hidden; color: rgba(42,33,24,0.25); letter-spacing: 2px; margin: 0 8px; font-weight: normal; }
.btn-action { font-family: 'KaiTi', '楷体', serif; font-size: 0.92rem; }
.menu-btn:hover:not(:disabled) { color: var(--text-ink-red); }
.menu-btn:hover:not(:disabled) .btn-dots { color: rgba(139,32,32,0.3); }
.menu-btn:disabled { opacity: 0.38; cursor: not-allowed; text-decoration: line-through; }
.menu-btn.secondary { font-size: 0.82rem; font-weight: normal; color: var(--text-muted); padding: 3px 0; opacity: 0.7; }
.menu-btn.secondary .btn-dots { color: transparent; }

.vintage-stamp { position: absolute; color: var(--text-ink-red); font-family: 'SimHei', '黑体', sans-serif; pointer-events: none; z-index: 5; }
.round-stamp {
  right: 12px; top: 28px; width: 68px; height: 50px; border: 2px solid var(--text-ink-red); border-radius: 50%;
  transform: rotate(14deg); opacity: 0.65; display: flex; align-items: center; justify-content: center;
}
.stamp-inner { display: flex; flex-direction: column; align-items: center; line-height: 1; }
.stamp-top { font-size: 0.5rem; letter-spacing: 1px; border-bottom: 1px solid var(--text-ink-red); padding-bottom: 2px; margin-bottom: 2px; }
.stamp-mid { font-size: 0.78rem; font-weight: bold; margin: 2px 0; }
.stamp-bot { font-size: 0.38rem; font-family: 'Courier New', monospace; }
.square-stamp {
  right: 0; top: -10px; border: 1.5px solid var(--text-ink-red); padding: 2px 4px;
  font-size: 0.62rem; font-weight: bold; transform: rotate(-8deg); background-color: var(--bg-paper); letter-spacing: 0.1em;
}

/* ══════════════════════════════════════════
   5. 首页与背景介绍
══════════════════════════════════════════ */
.doc-body { position: relative; z-index: 2; padding: 38px 20px; text-align: center; overflow: hidden; flex: 1; display: flex; flex-direction: column; justify-content: center;}
.doc-watermark { position: absolute; inset: 0; background-image: linear-gradient(rgba(42, 33, 24, 0.05) 1px, transparent 1px); background-size: 100% 25px; pointer-events: none; }
.title-group { position: relative; z-index: 2; margin-bottom: 30px; }
.title-main {
  font-size: 4rem; font-weight: 900; letter-spacing: 0.55em; padding-right: 0.55em;
  color: #1A1410; margin: 0; text-shadow: -1px -1px 0 rgba(255,240,200,0.35), 1px 1px 0 rgba(0,0,0,0.7), 2px 3px 3px rgba(0,0,0,0.15);
}
.title-pinyin { font-family: 'Courier New', monospace; font-size: 0.65rem; color: var(--text-muted); margin-top: 5px; letter-spacing: 0.1em; }
.title-slogan { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 12px; }
.slogan-line { height: 1px; flex: 1; background-color: var(--text-main); opacity: 0.25; }
.slogan-text { font-family: 'KaiTi', '楷体', serif; font-size: 0.92rem; font-weight: bold; color: var(--text-main); letter-spacing: 0.15em; white-space: nowrap; }

.intro-content { flex: 1; display: flex; flex-direction: column; padding: 20px 15px; overflow-y: auto; position: relative; z-index: 2; }
.typewriter-text { text-align: left; }
.typewriter-text p { font-family: 'KaiTi', '楷体', serif; font-size: 0.95rem; line-height: 2; margin-bottom: 14px; color: var(--text-main); letter-spacing: 0.05em;}
.typewriter-text .intro-lead { font-size: 1.1rem; font-weight: bold; border-bottom: 2px solid var(--text-main); display: inline-block; padding-bottom: 4px;}
.typewriter-text .intro-quote { font-style: italic; color: var(--text-muted); border-left: 3px solid var(--text-muted); padding-left: 10px;}
.typewriter-text .highlight-ink { color: var(--text-ink-red); font-weight: bold; }
.typewriter-text .final-quote { text-align: center; border: none; border-top: 1px dashed var(--text-main); border-bottom: 1px dashed var(--text-main); padding: 10px 0; margin-top: 20px; font-weight: bold; color: var(--text-main);}

/* ══════════════════════════════════════════
   6. 街道场景 (Street) 顶部排版
══════════════════════════════════════════ */
.street-inner { flex: 1; position: relative; overflow: hidden; z-index: 2;}

.season-spring .doc-watermark { background-image: linear-gradient(rgba(138, 168, 114, 0.08) 1px, transparent 1px); }
.season-summer .doc-watermark { background-image: linear-gradient(rgba(184, 102, 71, 0.08) 1px, transparent 1px); }
.season-autumn .doc-watermark { background-image: linear-gradient(rgba(184, 153, 71, 0.1) 1px, transparent 1px); }
.season-winter .doc-watermark { background-image: linear-gradient(rgba(100, 120, 140, 0.08) 1px, transparent 1px); }

.street-top-info { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 15px 0 15px; position: relative; z-index: 5; }

.vintage-license-card {
  width: 155px; height: 75px; background-color: #FDF9EC;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(44, 90, 61, 0.04) 2px, rgba(44, 90, 61, 0.04) 4px);
  border: 2px solid #2C5A3D; padding: 4px; box-shadow: 3px 3px 0 rgba(0,0,0,0.15), inset 0 0 10px rgba(0,0,0,0.05);
  cursor: pointer; transition: transform 0.1s cubic-bezier(0.34,1.56,0.64,1); transform: rotate(-1deg);
}
.vintage-license-card:hover { transform: rotate(0deg) scale(1.02); }
.vintage-license-card:active { transform: translate(1px, 1px) rotate(0deg); box-shadow: 1px 1px 0 rgba(0,0,0,0.15); }
.license-inner-border { width: 100%; height: 100%; border: 1px solid #2C5A3D; display: flex; align-items: center; gap: 8px; padding: 4px; }
.license-photo-area { position: relative; flex-shrink: 0; }
.photo-paper { width: 32px; height: 42px; background: #A33A3A; border: 2px solid #FFFDF0; box-shadow: 1px 1px 2px rgba(0,0,0,0.3); font-family: 'SimSun', serif; font-size: 0.65rem; color: rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; transform: rotate(2deg); }
.license-seal { position: absolute; right: -6px; bottom: -4px; width: 22px; height: 22px; border: 1.5px solid var(--text-ink-red); border-radius: 50%; color: var(--text-ink-red); font-family: 'SimHei', sans-serif; font-size: 0.6rem; font-weight: bold; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); opacity: 0.85; mix-blend-mode: multiply; }
.license-seal::after { content: ''; position: absolute; inset: 1px; border: 0.5px solid var(--text-ink-red); border-radius: 50%; }
.license-text-area { display: flex; flex-direction: column; justify-content: center; gap: 2px; width: 100%; }
.license-title { font-family: 'SimHei', sans-serif; font-size: 0.75rem; font-weight: bold; color: #2C5A3D; letter-spacing: 0.1em; border-bottom: 1px solid #2C5A3D; padding-bottom: 2px; margin-bottom: 2px; }
.license-row { font-family: 'SimSun', serif; font-size: 0.65rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: baseline;}
.license-value { font-family: 'SimHei', sans-serif; font-size: 0.7rem; color: var(--text-main); }
.license-value.handwritten { font-family: 'KaiTi', serif; font-size: 0.95rem; font-weight: bold; color: var(--text-ink-blue); }

.vintage-desk-calendar {
  position: relative; width: 145px; margin-top: 8px; transform: rotate(1.5deg);
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15), 2px 8px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); cursor: default;
}
.vintage-desk-calendar:hover { transform: rotate(0deg) scale(1.02); }
.cal-rings { position: absolute; top: -10px; left: 14px; right: 14px; display: flex; justify-content: space-between; z-index: 5; }
.cal-rings span { width: 6px; height: 20px; background: linear-gradient(to right, #7A7A7A, #F0F0F0 30%, #555); border: 1px solid #333; border-radius: 3px; box-shadow: 2px 2px 3px rgba(0,0,0,0.4); }
.cal-paper-layer { background: #FFFDF0; border: 1px solid #A89F8B; border-bottom: none; display: flex; padding: 16px 10px 10px 10px; background-image: linear-gradient(to bottom, #FFFBF0, #EAE0C8); }
.cal-left-block { flex: 1; text-align: center; border-right: 1.5px dashed #C4B49A; padding-right: 8px; }
.cal-month { font-family: 'SimHei', sans-serif; font-size: 0.8rem; color: var(--text-ink-red); border-bottom: 2px solid var(--text-ink-red); padding-bottom: 2px; margin-bottom: 4px; }
.cal-day { font-family: 'Times New Roman', serif; font-size: 2.6rem; font-weight: bold; color: var(--text-main); line-height: 0.95; letter-spacing: -1px; }
.cal-right-block { flex: 1.1; padding-left: 10px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.cal-week { font-family: 'KaiTi', serif; font-size: 0.85rem; font-weight: bold; color: var(--text-main); }
.cal-time { font-family: 'Courier New', monospace; font-size: 1rem; font-weight: bold; color: var(--text-ink-blue); }
.cal-weather { font-family: 'KaiTi', serif; font-size: 0.75rem; color: #7A6A55; }
.cal-board-base { height: 8px; background: #6B563D; border: 1px solid #4A3A28; border-top: 1px solid #8C7558; }

.table-area { position: absolute; bottom: 8%; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 18px; z-index: 5; }
.radio-and-resume-group { display: flex; align-items: flex-end; justify-content: center; gap: 15px; }

/* ══ 收音机整体 ══ */
.radio-bar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
}

/* ══ 天线区 ══ */
.radio-antennas {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 30px;
}

.antenna {
  width: 2px;
  height: 36px;
  background: var(--text-main);
  border-radius: 1px;
  transform-origin: bottom center;
  position: relative;
}
.antenna::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-main);
}
.antenna-left  { transform: rotate(-18deg); }
.antenna-right { transform: rotate(18deg); }

/* ══ 飘动音符 ══ */
.music-note {
  position: absolute;
  font-size: 0.9rem;
  color: var(--text-ink-red);
  pointer-events: none;
  animation: noteFloat 2s ease-out infinite;
  opacity: 0;
}
.note-1 { left: 55%;  animation-delay: 0s;    font-size: 0.85rem; }
.note-2 { left: 70%;  animation-delay: 0.7s;  font-size: 0.7rem; }
.note-3 { left: 40%;  animation-delay: 1.3s;  font-size: 0.75rem; }

@keyframes noteFloat {
  0%   { transform: translateY(0)   rotate(0deg);   opacity: 0; }
  15%  { opacity: 1; }
  80%  { opacity: 0.6; }
  100% { transform: translateY(-38px) rotate(20deg); opacity: 0; }
}

/* ══ 机身 ══ */
.radio-body-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-paper-light);
  border: 2px solid var(--text-main);
  padding: 7px 8px;
  box-shadow: 3px 3px 0 var(--text-main);
}
.radio-bar.playing .radio-body-bar {
  border-color: var(--text-ink-red);
  box-shadow: 3px 3px 0 var(--text-ink-red);
}

/* ══ 喇叭网格 ══ */
.radio-speaker-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2px;
  width: 28px;
  flex-shrink: 0;
}
.radio-speaker-grid span {
  display: block;
  height: 2px;
  background: var(--text-muted);
  opacity: 0.5;
  border-radius: 1px;
}

/* ══ 中间标签 + 频谱 ══ */
.radio-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.radio-title-text {
  font-family: 'Courier New', monospace;
  font-size: 0.6rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: var(--text-muted);
}
.radio-bar.playing .radio-title-text {
  color: var(--text-ink-red);
}

/* 频谱柱 */
.radio-spectrum {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.radio-spectrum span {
  display: block;
  width: 3px;
  border-radius: 1px;
  background: var(--text-main);
  animation: specBar 0.8s ease-in-out infinite alternate;
}
.radio-bar.playing .radio-spectrum span { background: var(--text-ink-red); }

.radio-spectrum span:nth-child(1) { height: 5px;  animation-delay: 0s; }
.radio-spectrum span:nth-child(2) { height: 10px; animation-delay: 0.15s; }
.radio-spectrum span:nth-child(3) { height: 14px; animation-delay: 0.3s; }
.radio-spectrum span:nth-child(4) { height: 8px;  animation-delay: 0.45s; }
.radio-spectrum span:nth-child(5) { height: 6px;  animation-delay: 0.6s; }

.radio-spectrum.off span {
  height: 2px !important;
  animation: none;
  opacity: 0.3;
}

@keyframes specBar {
  0%   { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}

/* ══ 按钮组 ══ */
.radio-btns {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
}
.radio-btn {
  width: 22px;
  height: 18px;
  background: transparent;
  border: 1px solid var(--text-main);
  font-size: 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  color: var(--text-main);
  padding: 0;
  box-shadow: 1px 1px 0 var(--text-main);
}
.radio-btn:hover {
  background: var(--text-main);
  color: var(--bg-paper);
}
.radio-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}



.resume-draft-btn { background: var(--bg-paper-light); border: 2px solid var(--text-main); padding: 6px 12px; height: 40px; box-shadow: 2px 2px 0 var(--text-main); display: flex; align-items: center; gap: 6px; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; }
.resume-draft-btn:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--text-main); }
.rd-icon { font-size: 1.1rem; color: var(--text-ink-red); }
.rd-text { font-family: 'KaiTi', serif; font-weight: bold; font-size: 0.9rem; color: var(--text-main); }

.sign-wrapper { position: relative; }
.vintage-sign { background: transparent; border: 2px solid var(--text-main); padding: 8px 20px; text-align: center; box-shadow: 3px 3px 0 var(--text-main); transform-origin: top center; transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1); }
.sign-main { font-size: 1.1rem; letter-spacing: 0.25em; font-weight: bold; color: var(--text-main); margin:0;}
.sign-sub  { font-size: 0.65rem; letter-spacing: 0.15em; color: var(--text-muted); margin-top: 4px; border-top: 1px solid var(--text-main); padding-top: 4px;}
.tilt-mild  { transform: rotate(-5deg); }
.tilt-heavy { transform: rotate(-15deg); }
.reputation-notes { position: absolute; top: -10px; right: -40px; width: 80px; height: 60px; pointer-events: none; }
.rep-note { position: absolute; background: #F4E8C1; font-family: 'KaiTi', serif; font-size: 0.6rem; color: var(--text-ink-blue); padding: 2px 4px; border: 1px solid var(--text-muted); pointer-events: auto; cursor: pointer; box-shadow: 1px 1px 2px rgba(0,0,0,0.15); max-width: 80px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.archive-box-ui { width: 110px; height: 65px; border: 2px solid var(--text-main); background: var(--bg-paper-dark); position: relative; cursor: pointer; box-shadow: 3px 3px 0 var(--text-main); display: flex; align-items: center; justify-content: center; transition: transform 0.1s, box-shadow 0.1s; }
.archive-box-ui:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--text-main); }
.archive-box-ui::before { content: ''; position: absolute; top: 15px; left: 0; right: 0; border-bottom: 1.5px solid var(--text-main); }
.box-label { background: var(--bg-paper-light); border: 1px solid var(--text-main); padding: 4px 10px; font-family: 'SimSun', serif; font-size: 0.8rem; font-weight: bold; color: var(--text-ink-blue); line-height: 1.4; text-align: center; z-index: 2; box-shadow: 1px 1px 0 rgba(0,0,0,0.2); }

.type-box { position: absolute; background: var(--bg-paper-light); border: 1px solid var(--text-main); padding: 12px 16px; text-align: center; box-shadow: 2px 2px 0 var(--text-main); }
.type-box p { font-family: 'KaiTi', serif; font-size: 0.85rem; color: var(--text-main); line-height: 1.8; margin:0;}
.type-popup { position: absolute; top: 15%; left: 50%; transform: translateX(-50%); background: #F4E8C1; border: 1px solid var(--text-main); box-shadow: 2px 2px 0 var(--text-main); font-family: 'KaiTi', serif; font-size: 0.85rem; padding: 10px 15px; width: 80%; text-align: center; line-height: 1.6; z-index: 10; }

.green-zone { top: 42%; left: 50%; transform: translate(-50%, -50%); width: 75%; }
.green-zone-hint { position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%); color: var(--text-muted); font-size: 0.85rem; letter-spacing: 0.1em; opacity: 0.6; }

.ink-btn-red { background: transparent; border: 2px solid var(--text-ink-red); color: var(--text-ink-red); font-family: 'SimSun', serif; font-weight: bold; font-size: 0.9rem; padding: 4px 12px; cursor: pointer; margin-top: 10px; box-shadow: 2px 2px 0 var(--text-ink-red); letter-spacing: 0.1em; transition: all 0.1s; }
.ink-btn-red:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--text-ink-red); }

/* ══════════════════════════════════════════
   7. 对话与接客 (Guest)
══════════════════════════════════════════ */
.guest-profile-bar { padding: 8px 15px; border-bottom: 1px dashed var(--text-muted); display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; z-index: 2; }
.gp-identity { font-size: 0.85rem; color: var(--text-main); font-weight: bold; letter-spacing: 0.05em; }
.gp-purpose { font-size: 0.75rem; color: var(--text-muted); font-family: 'KaiTi', serif; }

.dialogue-frame { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; z-index: 2; margin: 10px 15px; border-left: 1px solid rgba(42,33,24,0.1); border-right: 1px solid rgba(42,33,24,0.1); }
.dialogue-scroll { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 14px; scroll-behavior: smooth; }
.dialogue-scroll::-webkit-scrollbar { width: 4px; }
.dialogue-scroll::-webkit-scrollbar-thumb { background: var(--text-muted); }

.message-wrap { display: flex; flex-direction: column; }
.message-wrap.guest { align-items: flex-start; }
.message-wrap.player { align-items: flex-end; }
.bubble { max-width: 90%; font-size: 0.95rem; line-height: 1.8; font-family: 'KaiTi', serif; padding: 2px 0; }
.guest-bubble { color: var(--text-main); padding-left: 10px; border-left: 3px solid var(--text-main); }
.player-bubble { color: var(--text-ink-blue); text-align: right; padding-right: 10px; border-right: 3px solid var(--text-ink-blue); }

.loading-bubble { display: flex; gap: 4px; align-items: center; padding-left: 10px; border-left: 3px solid var(--text-muted); }
.dot { width: 4px; height: 4px; background: var(--text-main); border-radius: 50%; opacity: 0.4; animation: blink 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

.guest-bottom { padding: 10px 15px; border-top: 2px solid var(--text-main); display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; z-index: 2; }
.float-write-btn { align-self: flex-start; background: transparent; border: 1px solid var(--text-main); color: var(--text-main); font-family: 'SimSun', serif; font-size: 0.75rem; padding: 2px 8px; cursor: pointer; letter-spacing: 0.1em; }
.float-write-btn:hover:not(:disabled) { background: var(--text-main); color: var(--bg-paper); }
.float-write-btn:disabled { opacity: 0.3; border-style: dashed; cursor: not-allowed; }

.input-row { display: flex; gap: 10px; align-items: stretch; }
.chat-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--text-muted); font-family: 'KaiTi', serif; font-size: 0.95rem; color: var(--text-ink-blue); resize: none; line-height: 1.6; padding: 4px 0; white-space: pre-wrap; }
.chat-input:focus { outline: none; border-bottom: 2px solid var(--text-ink-blue); }
.chat-input::placeholder { color: rgba(90,74,53,0.4); font-style: italic; }

.send-btn { background: transparent; color: var(--text-ink-blue); border: 2px solid var(--text-ink-blue); font-family: 'SimSun', serif; font-weight: bold; padding: 0 16px; cursor: pointer; box-shadow: 2px 2px 0 var(--text-ink-blue); transition: all 0.1s; }
.send-btn:hover:not(:disabled) { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--text-ink-blue); }
.send-btn:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; border-style: dashed;}

/* ══════════════════════════════════════════
   8. 信笺悬浮面板
══════════════════════════════════════════ */
.letter-panel-overlay { position: absolute; inset: 0; z-index: 50; display: flex; flex-direction: column; justify-content: flex-end; background: rgba(42,33,24,0.4); }
.letter-panel { background-color: #EAE0C8; border-top: 3px solid var(--text-main); padding: 15px; display: flex; flex-direction: column; gap: 12px; height: 75vh; box-shadow: 0 -10px 30px rgba(0,0,0,0.3); position: relative; }
.letter-panel::before { content: ''; position: absolute; inset: 0; pointer-events: none; background-image: repeating-linear-gradient(180deg, transparent 0px, transparent 28px, rgba(42,33,24,0.1) 28px, rgba(42,33,24,0.1) 29px); }

.lp-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--text-muted); padding-bottom: 6px; position: relative; z-index: 2;}
.lp-title { font-size: 0.85rem; color: var(--text-main); font-weight: bold; }
.lp-close { background: none; border: none; font-size: 0.8rem; font-family: 'SimSun', serif; color: var(--text-main); cursor: pointer; text-decoration: underline; }

.lp-params { display: flex; gap: 12px; flex-wrap: wrap; position: relative; z-index: 2; }
.param-group { display: flex; align-items: center; gap: 4px; }
.param-label { font-size: 0.75rem; color: var(--text-muted); }
.param-select { background: transparent; border: none; border-bottom: 1px solid var(--text-main); font-family: 'KaiTi', serif; font-size: 0.8rem; color: var(--text-main); cursor: pointer; padding-bottom: 2px;}
.param-select:focus { outline: none; }

.lp-paper-wrap { flex: 1; border: 1px solid var(--text-main); background: rgba(255,255,255,0.2); position: relative; z-index: 2;font-family: '手写中文', 'KaiTi', serif;}
.lp-paper { width: 100%; height: 100%; background: transparent; border: none; padding: 10px; font-family: 'KaiTi', serif; font-size: 1.4rem; color: var(--text-ink-blue); line-height: 28px; resize: none; white-space: pre-wrap; font-family: '手写中文', 'KaiTi', serif;}
.lp-paper:focus { outline: none; }

.lp-actions { display: flex; gap: 10px; justify-content: flex-end; position: relative; z-index: 2;}
.btn-polish { background: transparent; border: 1px dashed var(--text-main); color: var(--text-main); padding: 4px 12px; font-family: 'SimSun', serif; font-size: 0.8rem; cursor: pointer; }
.btn-polish:hover:not(:disabled) { border-style: solid; }

/* ══════════════════════════════════════════
   9. 档案界面 (牛皮纸信封)
══════════════════════════════════════════ */
.archive-list { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; z-index: 2; position: relative; }
.archive-list::-webkit-scrollbar { width: 4px; }
.archive-list::-webkit-scrollbar-thumb { background: var(--text-muted); }

.envelope-list-item { background: #D5C5A9; border: 1px solid var(--text-main); padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 15px; cursor: pointer; position: relative; box-shadow: 2px 2px 0 rgba(42,33,24,0.15), inset 0 0 15px rgba(150,120,70,0.1); transition: transform 0.2s, box-shadow 0.2s; }
.envelope-list-item:hover { transform: translateX(4px); background: #DCD0B6; box-shadow: 4px 4px 8px rgba(0,0,0,0.1); }

.env-top-bar { display: flex; justify-content: space-between; align-items: flex-start; }
.env-postcodes { display: flex; gap: 2px; }
.env-postcodes span { display: block; width: 12px; height: 16px; border: 1.5px solid var(--text-ink-red); opacity: 0.8; }
.env-stamp-box { width: 24px; height: 30px; border: 1.5px dashed var(--text-main); font-size: 0.6rem; color: var(--text-muted); display: flex; align-items: center; justify-content: center; opacity: 0.6; }

.env-address-area { display: flex; align-items: flex-start; gap: 5px; }
.env-to { font-family: 'SimHei', sans-serif; font-size: 0.85rem; color: var(--text-main); font-weight: bold; }
.env-recipient { font-family: 'KaiTi', serif; font-size: 1.05rem; font-weight: bold; color: var(--text-ink-blue); line-height: 1.4; word-break: break-all; }

.env-echo-seal { position: absolute; right: 10px; bottom: 10px; border: 2px solid var(--text-ink-red); color: var(--text-ink-red); font-family: 'SimHei', sans-serif; font-size: 0.75rem; font-weight: bold; padding: 2px 6px; transform: rotate(-10deg); box-shadow: 1px 1px 0 rgba(139,32,32,0.2); }

.archive-empty { text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 40px 0; font-family: 'KaiTi', serif; display: flex; flex-direction: column; gap: 10px; opacity: 0.6; }
.empty-icon { font-size: 2rem; filter: grayscale(100%); opacity: 0.5; }

.letter-detail-overlay { position: absolute; inset: 0; background: rgba(42,33,24,0.7); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 60; padding: 20px; }

.modal-big-envelope { width: 100%; max-width: 420px; height: 260px; background: #D5C5A9; border: 2px solid var(--text-main); box-shadow: 4px 4px 0 rgba(0,0,0,0.4), inset 0 0 40px rgba(150,120,70,0.15); position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: transform 0.2s; overflow: hidden; }
.modal-big-envelope:hover { transform: scale(1.02); }
.modal-big-envelope:active { transform: scale(0.98); }

.env-flap-line { position: absolute; top: 0; left: 0; right: 0; height: 40px; border-bottom: 2px solid var(--text-main); background: rgba(255,255,255,0.05); }

.big-env-postcodes { position: absolute; top: 10px; left: 15px; display: flex; gap: 4px; }
.big-env-postcodes span { width: 16px; height: 22px; border: 2px solid var(--text-ink-red); }
.big-env-stamp { position: absolute; top: 15px; right: 15px; width: 35px; height: 45px; border: 2px dashed #4A8E8B; color: #4A8E8B; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; transform: rotate(5deg); }

.big-env-address { margin-top: 80px; width: 80%; text-align: left; display: flex; flex-direction: column; gap: 8px; }
.big-env-address .label { font-family: 'SimHei', sans-serif; font-size: 0.9rem; color: var(--text-main); font-weight: bold; }
.big-env-address .value { font-family: 'KaiTi', serif; font-size: 1.4rem; font-weight: bold; color: var(--text-ink-blue); line-height: 1.5; }

.open-hint-btn { position: absolute; bottom: 20px; right: 20px; font-family: 'SimSun', serif; font-size: 0.9rem; font-weight: bold; color: var(--text-ink-red); animation: floatHint 1.5s infinite alternate; }
@keyframes floatHint { 0% { transform: translateX(0); } 100% { transform: translateX(5px); } }

.letter-detail-box { background: #FFFEF5; background-image: repeating-linear-gradient(180deg, transparent 0px, transparent 28px, rgba(42,33,24,0.08) 28px, rgba(42,33,24,0.08) 29px); border: 1px solid var(--text-main); width: 100%; max-width: 400px; max-height: 95%; display: flex; flex-direction: column; box-shadow: 4px 4px 0 rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2); }
.ld-header { padding: 15px 20px 5px; border-bottom: 2px solid var(--text-main); display: flex; justify-content: flex-end; background: #FFFEF5; }
.ld-date { font-family: 'Courier New', monospace; font-size: 0.8rem; color: var(--text-muted); }
.ld-content { padding: 10px 20px; font-family: 'KaiTi', serif; font-size: 1.05rem; color: var(--text-ink-blue); line-height: 29px; white-space: pre-wrap; overflow-y: auto; flex: 1;font-family: '手写中文', 'KaiTi', serif; }
.ld-content::-webkit-scrollbar { width: 4px; }
.ld-content::-webkit-scrollbar-thumb { background: rgba(42,33,24,0.2); }
.ld-footer { padding: 12px 20px; border-top: 1px dashed var(--text-main); background: rgba(42,33,24,0.03); display: flex; flex-direction: column; gap: 8px; }
.ld-recipient { font-family: 'SimHei', sans-serif; font-size: 0.85rem; font-weight: bold; color: var(--text-main); line-height: 1.4; }
.ld-echo-stamp { font-family: 'KaiTi', serif; font-size: 0.85rem; font-weight: bold; color: var(--text-ink-red); border: 1px solid var(--text-ink-red); padding: 4px 8px; align-self: flex-start; transform: rotate(-2deg); background: rgba(255,255,255,0.5); box-shadow: 1px 1px 0 rgba(139,32,32,0.2); }
.ld-actions { padding: 10px 20px 15px; background: rgba(42,33,24,0.03); display: flex; justify-content: flex-end; }

/* 翻转动画 */
.flip-fade-enter-active, .flip-fade-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.flip-fade-enter-from { opacity: 0; transform: rotateY(90deg) scale(0.9); }
.flip-fade-leave-to { opacity: 0; transform: rotateY(-90deg) scale(0.9); }


/* ══════════════════════════════════════════
   10. 通用弹窗与提示
══════════════════════════════════════════ */
.lw-confirm-overlay, .review-overlay, .review-loading-overlay { position: absolute; inset: 0; background: rgba(42,33,24,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }

.lw-confirm-card, .review-box, .review-loading-card { background: var(--bg-paper-light); border: 2px solid var(--text-main); box-shadow: 4px 4px 0 rgba(0,0,0,0.3); padding: 20px; width: 100%; max-width: 340px; display: flex; flex-direction: column; gap: 15px; position: relative; }
.lw-confirm-title, .review-loading-title { font-size: 1.05rem; font-weight: bold; color: var(--text-main); border-bottom: 2px solid var(--text-main); padding-bottom: 5px; text-align: center;}
.lw-confirm-copy, .review-text, .review-loading-copy { font-family: 'KaiTi', serif; font-size: 0.9rem; line-height: 1.8; color: var(--text-main); white-space: pre-wrap; text-align: center;}

.modal-doc-footer, .review-actions { display: flex; justify-content: space-between; gap: 10px; padding-top: 10px; border-top: 1px dashed var(--text-muted); }
.btn-primary { background: transparent; border: 2px solid var(--text-main); font-family: 'SimSun', serif; font-weight: bold; padding: 6px 14px; cursor: pointer; box-shadow: 2px 2px 0 var(--text-main); transition: all 0.1s; }
.btn-primary:hover { background: var(--text-main); color: var(--bg-paper-light); transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--text-main); }
.btn-secondary { background: transparent; border: 1px solid var(--text-main); font-family: 'SimSun', serif; padding: 6px 14px; cursor: pointer; }

.review-loading-paper { width: 60px; height: 75px; border: 2px solid var(--text-main); background: transparent; margin: 0 auto; display: flex; flex-direction: column; gap: 6px; padding: 8px; animation: paperRead 1.5s ease-in-out infinite alternate;}
.review-loading-line { display: block; height: 2px; background: var(--text-main); width: 100%; }
.review-loading-line.short { width: 60%; }
@keyframes paperRead { 0% { transform: translateY(0); } 100% { transform: translateY(-5px); } }

/* 玩家档案弹窗专用 (含头像上传) */
.profile-modal { width: 320px; }
.profile-form { display: flex; flex-direction: column; gap: 15px; margin: 15px 0 5px 0; }
.profile-top-row { display: flex; align-items: center; gap: 15px; }

.avatar-upload-box {
  width: 50px; height: 65px; border: 1.5px dashed var(--text-main); background: rgba(42,33,24,0.05);
  display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; transition: background 0.2s;
}
.avatar-upload-box:hover { background: rgba(42,33,24,0.1); }
.upload-hint { font-family: 'KaiTi', serif; font-size: 0.75rem; color: var(--text-muted); text-align: center; line-height: 1.4; opacity: 0.8; }
.real-avatar-img { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.3) contrast(1.1); }

.name-input-group { flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: flex-end; }
.name-input-group label { font-family: 'SimSun', serif; font-size: 0.85rem; font-weight: bold; color: var(--text-muted); }
.vintage-input { width: 100%; background: transparent; border: none; border-bottom: 2px solid var(--text-main); font-family: 'KaiTi', serif; font-size: 1.2rem; font-weight: bold; color: var(--text-ink-blue); padding: 4px 0; }
.vintage-input:focus { outline: none; border-color: var(--text-ink-red); }

.stats-box { border: 1px dashed var(--text-muted); padding: 10px; display: flex; flex-direction: column; gap: 8px; background: rgba(0,0,0,0.03); }
.stat-item { display: flex; justify-content: space-between; font-family: 'KaiTi', serif; font-size: 0.85rem; }
.stat-item span:last-child { font-weight: bold; color: var(--text-main); font-family: 'Courier New', monospace; }

/* ══════════════════════════════════════════
   11. 结局与统计
══════════════════════════════════════════ */
.closing-lines { display: flex; flex-direction: column; gap: 20px; text-align: center; justify-content: center; flex: 1; position: relative; z-index: 2;}
.closing-lines p { font-family: 'KaiTi', serif; font-size: 1.05rem; color: var(--text-main); letter-spacing: 0.1em; opacity: 0; animation: fadeIn 1s forwards; }
@keyframes fadeIn { to { opacity: 1; } }

.stats-card { width: 100%; border: 2px solid var(--text-main); padding: 30px 20px; display: flex; flex-direction: column; gap: 15px; position: relative; z-index: 2; align-items: center; box-shadow: inset 0 0 0 4px var(--bg-paper), inset 0 0 0 5px var(--text-main); }
.sc-title { font-size: 1.2rem; font-weight: bold; letter-spacing: 0.3em; text-align: center; border-bottom: 2px solid var(--text-main); padding-bottom: 10px; width: 100%;}
.sc-rows { width: 100%; display: flex; flex-direction: column; gap: 10px; font-family: 'KaiTi', serif; font-size: 0.95rem; }
.sc-row { display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(42,33,24,0.2); padding-bottom: 4px; }
.sc-row span:last-child { font-family: 'Courier New', monospace; font-weight: bold; }
.sc-footnote { font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-top: 10px; }

.last-paper-wrap { width: 100%; height: 100%; padding: 20px; position: relative; z-index: 2; }
.last-paper { width: 100%; height: 100%; background: transparent; border: 1px solid var(--text-main); padding: 20px; font-family: 'KaiTi', serif; font-size: 1.4rem; color: var(--text-ink-blue); line-height: 2.2; resize: none; background-image: repeating-linear-gradient(180deg, transparent 0px, transparent 33px, rgba(42,33,24,0.1) 33px, rgba(42,33,24,0.1) 34px); font-family: '手写中文', 'KaiTi', serif;}
.last-paper:focus { outline: none; }

/* ══════════════════════════════════════════
   12. 动画过渡类
══════════════════════════════════════════ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.story-fade-enter-active { transition: opacity 0.8s, transform 0.8s; }
.story-fade-leave-active { transition: opacity 0.4s; position: absolute; width: 100%; }
.story-fade-enter-from { opacity: 0; transform: translateY(10px); }
.story-fade-leave-to { opacity: 0; }
.panel-up-enter-active { transition: transform 0.4s cubic-bezier(0.2,0.8,0.2,1); }
.panel-up-leave-active { transition: transform 0.3s ease-in; }
.panel-up-enter-from, .panel-up-leave-to { transform: translateY(100%); }

/* ══════════════════════════════════════════
   13. 移动端安全适配
══════════════════════════════════════════ */
@media (max-width: 768px) {
  .vintage-paper-card { width: 96%; height: 90vh; }
  .title-main { font-size: 3rem; }
  .archive-card { grid-template-columns: 70px 1fr; grid-template-rows: auto auto; }
  .ac-date { grid-column: 1 / 3; border-bottom: 1px solid var(--text-muted); }
  .ac-echo { grid-column: 2; justify-self: end; }
  
  .top-left-group { flex-direction: row !important; align-items: center; gap: 8px; }
  .vintage-calendar { transform: scale(0.85); transform-origin: top right; }
}
</style>
