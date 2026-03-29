<template>
<div class="dream-layer">

  <!-- ========== 标题页 ========== -->
  <Transition name="fade">
    <div v-if="phase === 'title'" class="screen screen-title">
      <div class="title-bg"></div>
      <div class="title-scanlines"></div>
      <div class="dream-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
        <div class="orb orb-5"></div>
      </div>
      <div class="dream-particles">
        <span v-for="n in 25" :key="n" class="particle" :style="getParticleStyle(n)"></span>
      </div>
      <div class="title-content" :class="{ visible: titleReady }">
        <div class="title-tag">CONSCIOUSNESS RESTORATION SYSTEM</div>
        <div class="title-main">第十三层梦境</div>
        <div class="title-sub">潜意识修补模拟器</div>
        <div class="title-subject">
          <span class="subject-bracket">[ </span>Subject · 共情与理解<span class="subject-bracket"> ]</span>
        </div>
        <div class="title-divider"></div>
        <div class="title-actions">
          <button class="title-btn primary" @click="startNewGame">
            <span class="btn-icon">▶</span>开始新游戏
          </button>
          <button class="title-btn secondary" :class="{ disabled: !hasSave }" @click="continueGame">
            <span class="btn-icon">◈</span>继续游戏
          </button>
        </div>
        <div class="title-footer">
          <button class="back-link" @click="$router.back()">‹ 返回演奏厅</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========== 故事章节 1-4 ========== -->
  <Transition name="story-fade">
    <div v-if="phase === 'story_1'" class="screen screen-story story-1">
      <div class="story-bg-1"></div>
      <div class="story-vignette"></div>
      <div class="story-nav-top">
        <button class="back-btn" @click="phase = 'title'">‹ 返回</button>
        <div class="story-progress">
          <span v-for="n in 4" :key="n" class="progress-dot" :class="{ active: n === 1 }"></span>
        </div>
      </div>
      <div class="story-content" :class="{ visible: storyReady }">
        <div class="story-chapter-tag">第一章 · 时代</div>
        <div class="story-body">
          <p class="story-lead">人的意识像一条长河，又像是一座高山。</p>
          <p class="story-text">每个人的一生都在经历无数的变革，梦想、思考、幻想，让意识的山河越累越高，越积越深。那些快乐的、痛苦的、说出口的、永远没能说出口的——全都沉在里面，成为一个人之所以是这个人的全部重量。</p>
          <p class="story-text">现如今，信息在光纤和无线信号里以接近光速的速度传播，每个人每天接收的信息量相当于二十世纪初一个普通人一生的总量。注意力成为了稀缺资源，算法用精准的方式争夺它、切割它、把它换算成数据报表里的留存率和点击量。每个人同时活在两个世界里——一个是他真实居住的，有温度和重量的物理世界；另一个是他的数字身份所在的地方，那里的每一句话、每一张照片、每一个沉默，都会被无数双眼睛扫描、解读、评判。</p>
          <p class="story-quote">飞速发展的科技，流逝的时间，像是在追赶什么，从未停下脚步去等什么。</p>
          <p class="story-text">与此同时，竞争的密度达到了前所未有的程度。城市里的年轻人从幼年起就被投入一场他们从未同意参加的比赛，终点线永远在移动，规则永远在改变，而退出从来不是被允许的选项。职场把一个人的时间和精力切割成可量化的单元，用效率和产出来定义一个人的价值。家庭传递爱的方式千差万别——有些是拥抱，有些是期待，有些是沉默，有些是一种你分不清楚究竟是爱还是控制的东西，以至于多年以后，那个被爱着的孩子发现自己无论怎么呼吸，都觉得空气不够用。</p>
          <p class="story-quote">"家庭传递爱的方式千差万别——有些是拥抱，有些是期待，有些是沉默，有些是一种你分不清楚究竟是爱还是控制的东西。"</p>
        </div>
        <div class="story-actions">
          <button class="story-next-btn" @click="goStory(2)">下一章 ›</button>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="story-fade">
    <div v-if="phase === 'story_2'" class="screen screen-story story-2">
      <div class="story-bg-2"></div>
      <div class="story-vignette"></div>
      <div class="story-nav-top">
        <button class="back-btn" @click="goStory(1)">‹ 返回</button>
        <div class="story-progress">
          <span v-for="n in 4" :key="n" class="progress-dot" :class="{ active: n === 2 }"></span>
        </div>
      </div>
      <div class="story-content" :class="{ visible: storyReady }">
        <div class="story-chapter-tag">第二章 · 永眠</div>
        <div class="story-body">
          <p class="story-lead">第一个永眠的人出现时，人们以为他只是睡得有点久。</p>
          <p class="story-text">起初，人们对这件事并没有什么反应，只是觉得这个时代的年轻人太累了，仿佛停下来就跟不上时代的脚步了，多睡会吧。但后来，逐渐发现好像怎么样都叫不醒。</p>
          <p class="story-text highlight-block">心跳平稳，呼吸均匀，体温正常，血液在静脉里安静地流动。</p>
          <p class="story-text">身体好好的，像一栋灯全灭了但结构完好的楼。只是无论用什么方式呼唤，他们都不会醒来。声音不行，疼痛不行。</p>
          <p class="story-text">什么戏剧性的事情都没有发生，只是某一刻，某一个地方，有什么东西悄悄地，不动声色地，选择了退场。</p>
          <p class="story-text">渐渐地，各式各样的，不同年龄不同身份的永眠者出现了。</p>
        </div>
        <div class="story-actions">
          <button class="story-next-btn" @click="goStory(3)">下一章 ›</button>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="story-fade">
    <div v-if="phase === 'story_3'" class="screen screen-story story-3">
      <div class="story-bg-3"></div>
      <div class="story-vignette"></div>
      <div class="story-nav-top">
        <button class="back-btn" @click="goStory(2)">‹ 返回</button>
        <div class="story-progress">
          <span v-for="n in 4" :key="n" class="progress-dot" :class="{ active: n === 3 }"></span>
        </div>
      </div>
      <div class="story-content" :class="{ visible: storyReady }">
        <div class="story-chapter-tag">第三章 · 发现</div>
        <div class="story-body">
          <p class="story-lead">医学界和科学界在巨大的压力下展开了紧急研究。</p>
          <p class="story-text">突破发生在二〇五〇年的秋天，由一个神经科学与量子信息学的跨学科团队完成。他们利用当时最先进的非侵入式神经接口技术，成功在实验室环境下完整读取了一名意识坍缩患者的大脑活动图谱，并首次将其解码成可以被理解的结构性信息。</p>
          <p class="story-text">他们看见的东西震惊了所有人——意识的坍缩。陷入永眠的患者的意识是完整的，是活跃的，是有结构的。</p>
          <p class="story-text">它在内部建造了一个封闭的世界，一个完全由这个人的记忆、情绪和创伤碎片构成的梦境空间。</p>
          <p class="story-quote">"坍缩的原因，来自患者当前最大的压力。"</p>
          <p class="story-text">他们将可观测到的最深层次定为——<strong>第十三层</strong>。</p>
          <p class="story-text">可行的治疗方法是进入他人的意识，修补意识空间，帮助患者从中走出来，这样的人被称为<strong>调律者</strong>。</p>
        </div>
        <div class="story-actions">
          <button class="story-next-btn" @click="goStory(4)">下一章 ›</button>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="story-fade">
    <div v-if="phase === 'story_4'" class="screen screen-story story-4">
      <div class="story-bg-4"></div>
      <div class="story-vignette"></div>
      <div class="story-nav-top">
        <button class="back-btn" @click="goStory(3)">‹ 返回</button>
        <div class="story-progress">
          <span v-for="n in 4" :key="n" class="progress-dot" :class="{ active: n === 4 }"></span>
        </div>
      </div>
      <div class="story-content" :class="{ visible: storyReady }">
        <div class="story-chapter-tag">第四章 · 你</div>
        <div class="story-body">
          <p class="story-lead">你是首批通过训练认证的调律者之一。</p>
          <p class="story-text">你携带着工具，领取了神经接口许可，在一份知情同意书的末尾签下了名字。那份文件用很小的字提醒你，进入患者意识空间的风险由本人承担。</p>
          <p class="story-text">你当时没有太在意那行字，就像没有人在意河流在平静时候，堤坝承受着多少重量。</p>
          <p class="story-text">现在，在你面前的是一份档案。一个陷入永眠的人，意识困在某个梦境深处，不知道门在哪里，也许已经不相信门存在。</p>
          <p class="story-text"><strong>神经接口就位。意识渡入程序待机。</strong></p>
          <p class="story-text">你深吸一口气，感觉到那个熟悉的、每次进入之前都会有的东西——不完全是恐惧，更像是站在一扇门前的感觉，你不知道门后面是什么，但你知道，有人在里面等着。</p>
          <p class="story-quote final-quote">"深渊在等待。而等待在深渊里的，是一个需要被看见的人。"</p>
        </div>
        <div class="story-actions">
          <button class="story-next-btn enter-btn" @click="goToScriptSelect">进入任务 ›</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========== 调律者中枢 ========== -->
  <Transition name="fade">
    <div v-if="phase === 'hub'" class="screen screen-hub">
      <div class="hub-bg-fx">
        <div class="hub-bg-grid"></div>
        <div class="hub-bg-glow"></div>
      </div>
      <div class="hub-topbar">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button class="back-btn" @click="returnToTitle">‹ 返回</button>
          <div class="currency-display">
            <span class="currency-icon">💧</span>
            <span class="currency-value">{{ pureDrops }}</span>
          </div>
        </div>
        <div class="hub-title-tag">TUNER SYSTEM · READY</div>
      </div>

      <div class="hub-profile clickable-profile" @click="phase = 'profile'">
        <div class="profile-avatar">
          <img v-if="playerAvatar" :src="playerAvatar" class="avatar-img" />
          <span v-else-if="playerName && playerName !== '调律者'">{{ playerName.slice(-1) }}</span>
          <span v-else>律</span>
        </div>
        <div class="profile-info">
          <div class="profile-name">{{ playerName }} 的档案</div>
          <div class="profile-meta">EXP: {{ totalExp }} / {{ playerLevel >= 10 ? 'MAX' : LEVEL_EXP[playerLevel + 1] }}</div>
        </div>
        <div class="profile-badge">LV.{{ playerLevel }}</div>
      </div>

      <div class="hub-stats-bar">
        <div class="hub-stat-item">
          <div class="hub-stat-icon load-icon">◎</div>
          <div class="hub-stat-info">
            <div class="hub-stat-name">神经载荷</div>
            <div class="hub-stat-desc">你能承受的意识压力上限，归零时有2轮机会撤离</div>
          </div>
        </div>
        <div class="hub-stat-divider"></div>
        <div class="hub-stat-item">
          <div class="hub-stat-icon res-icon">◈</div>
          <div class="hub-stat-info">
            <div class="hub-stat-name">共振深度</div>
            <div class="hub-stat-desc">患者意识的修补程度，达到100%时需要撤离。</div>
          </div>
        </div>
      </div>

      <div class="hub-menu">
        <div class="hub-menu-item primary-item" @click="handleHubPrimaryAction">
          <div class="menu-item-left">
            <div class="menu-icon">▶</div>
            <div class="menu-text">
              <div class="menu-title">
                {{ hasActiveGame ? '继续当前任务' : '接受新任务' }}
              </div>
              <div class="menu-sub">
                {{ hasActiveGame ? '恢复上次未完成的意识连接' : '选择今日待调律的意识档案' }}
              </div>
            </div>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="hub-menu-item" @click="phase = 'shop'">
          <div class="menu-item-left">
            <div class="menu-icon">🛒</div>
            <div class="menu-text">
              <div class="menu-title">补给终端</div>
              <div class="menu-sub">消耗纯真滴露兑换调律辅助道具</div>
            </div>
          </div>
          <div class="menu-arrow">›</div>
        </div>

         <!-- 难度说明 (改为触发弹窗) -->
        <div class="hub-menu-item" @click="showDiffGuide = true">
          <div class="menu-item-left">
            <div class="menu-icon">★</div>
            <div class="menu-text">
              <div class="menu-title">难度说明</div>
              <div class="menu-sub">了解各星级任务的风险等级</div>
            </div>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <!-- 调律者手册 (改为触发弹窗) -->
        <div class="hub-menu-item" @click="showGuide = true">
          <div class="menu-item-left">
            <div class="menu-icon">？</div>
            <div class="menu-text">
              <div class="menu-title">调律者手册</div>
              <div class="menu-sub">查看操作说明与游戏机制</div>
            </div>
          </div>
          <div class="menu-arrow">›</div>
        </div>

        <div class="hub-menu-item" @click="phase = 'handbook'">
          <div class="menu-item-left">
            <div class="menu-icon">📋</div>
            <div class="menu-text">
              <div class="menu-title">患者手册</div>
              <div class="menu-sub">查看历次诊断的患者档案与当前状态</div>
            </div>
          </div>
          <div class="menu-arrow">›</div>
        </div>
      </div>

      <div class="hub-footer">
        <div v-if="isBackgroundRunning" class="hub-footer-text" style="color: var(--border-gold); animation: breathe 2s ease-in-out infinite;">
          ◎ 意识空间仍在响应，返回后立即呈现
        </div>
        <div v-else class="hub-footer-text">意识接口已就绪 · 随时可以接入梦境</div>
      </div>
    </div>
  </Transition>

   <!-- ========== 患者手册 ========== -->
  <Transition name="fade">
    <div v-if="phase === 'handbook'" class="screen screen-profile">
      <div class="screen-nav">
        <button v-if="!selectedPatient" class="back-btn" @click="phase = 'hub'">‹ 返回中枢</button>
        <button v-if="selectedPatient" class="back-btn" @click="selectedPatient = null">‹ 返回列表</button>
      </div>

      <!-- 列表视图 -->
      <div v-if="!selectedPatient" class="profile-scroll-container">
        <div class="section-title">患者手册 / PATIENT RECORDS</div>
        <div v-if="completedScripts.length === 0" class="empty-hint">
          尚无诊断记录
        </div>
        <div
          v-for="(patient, idx) in [...completedScripts].reverse()"
          :key="getPatientKey(patient, idx)"
          class="script-card elegant-card"
          @click="selectPatient(patient)"
        >
          <div class="card-difficulty">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= patient.diff }">★</span>
          </div>
          <div class="card-name">{{ patient.patientName ?? '未知患者' }}</div>
          <div class="card-meta">
            <span>{{ patient.patientAge }}岁</span>
            <span class="dot">·</span>
            <span>{{ patient.patientProfession }}</span>
            <span class="dot">·</span>
            <span>{{ formatResult(patient.result) }}</span>
          </div>
          <div class="card-divider"></div>
          <div class="card-date">
            {{ formatPatientDate(patient.time) }}
          </div>
        </div>
      </div>

      <!-- 详情视图 -->
      <div v-if="selectedPatient" class="profile-scroll-container">
        
        <!-- 头部信息卡片 -->
        <div class="profile-header-card elegant-card detail-header">
          <div class="detail-name">{{ selectedPatient.patientName }}</div>
          <div class="detail-meta">
            <span>{{ selectedPatient.patientAge }}岁</span>
            <span class="dot">·</span>
            <span>{{ selectedPatient.patientProfession }}</span>
            <span class="dot">·</span>
            <span class="highlight-result">{{ formatResult(selectedPatient.result) }}</span>
          </div>
          <div class="detail-stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= selectedPatient.diff }">★</span>
          </div>
        </div>

        <div class="section-title">背景档案</div>
        <div v-if="selectedPatient.scriptContext" class="record-list">
          <template v-for="(label, key) in {
            character: '人物介绍',
            wound: '背景介绍',
            imagery: '心象映射',
            socialIssue: '社会议题',
            mentalTheme: '精神主题',
            mainSentence: '主旨句'
          }" :key="key">
            <div v-if="parsedSelectedPatientContext[key]" class="record-block">
              <div class="record-label">{{ label }}</div>
              <div class="record-text">{{ parsedSelectedPatientContext[key] }}</div>
            </div>
          </template>
          <div v-if="Object.values(parsedSelectedPatientContext).every(v => !v)" class="record-block">
            <div class="record-text">{{ selectedPatient.scriptContext }}</div>
          </div>
        </div>

        <div class="section-title">诊断经历</div>
        <div class="record-list">
          <div v-for="(entry, i) in selectedPatient.conversationHistory" :key="i" class="history-block">
            <div class="history-round">第 {{ entry.roundNum }} 轮</div>
            <div class="history-action">▷ {{ entry.playerAction }}</div>
            <div class="history-narrative">{{ entry.narrative }}</div>
          </div>
        </div>

        <div class="section-title">后续调查记录</div>
        <div class="record-list">
          <div v-if="selectedPatient.statusHistory && selectedPatient.statusHistory.length > 0">
            <div v-for="record in [...selectedPatient.statusHistory].reverse()" :key="record.count" class="record-block follow-up-block">
              <div class="follow-up-header">
                <span class="follow-up-tag">第 {{ record.count }} 次回访</span>
                <span class="follow-up-time">{{ record.time }}</span>
              </div>
              <div class="record-text">{{ record.content }}</div>
            </div>
          </div>
          <div v-else class="empty-hint">
            尚未进行后续调查
          </div>
        </div>

        <button
          class="btn-primary"
          style="width: 100%; margin-top: 1rem;"
          :disabled="isGeneratingStatus"
          @click="generatePatientCurrentStatus(selectedPatient)"
        >
          {{ isGeneratingStatus ? '调查中……' :
            selectedPatient.statusHistory?.length > 0
              ? `进行第 ${selectedPatient.statusHistory.length + 1} 次回访 ›`
              : '发起后续调查 ›' }}
        </button>
      </div>
    </div>
  </Transition>


  <!-- 现状弹窗 -->
  <Transition name="fade">
    <div v-if="showPatientStatusModal" class="pause-overlay">
      <div class="pause-box" style="max-width: 360px; gap: 1.2rem;">
        <div style="font-size: 0.6rem; color: rgba(200,170,80,0.4); letter-spacing: 0.4em; font-family: 'Courier New', monospace;">FOLLOW-UP REPORT</div>
        <div style="font-size: 1rem; color: #c0a860; letter-spacing: 0.2em;">{{ selectedPatient?.patientName }} · 当前状态</div>
        <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.2), transparent);"></div>
        <div style="font-size: 0.88rem; color: #b0a890; line-height: 2.2; text-align: left; max-height: 50vh; overflow-y: auto; letter-spacing: 0.04em; padding: 0 0.3rem;">
          {{ patientCurrentStatus }}
        </div>
        <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.2), transparent);"></div>
        <button class="btn-secondary" style="width: 100%;"
          @click="showPatientStatusModal = false; patientCurrentStatus = ''">
          关闭
        </button>
      </div>
    </div>
  </Transition>
  <!-- ========== 难度说明弹窗 ========== -->
  <Transition name="fade">
    <div v-if="showDiffGuide" class="pause-overlay" @click.self="showDiffGuide = false">
      <div class="pause-box" style="max-width: 420px; align-items: flex-start; text-align: left;">
        <div class="pause-title" style="width: 100%; text-align: center; margin-bottom: 0.5rem; color: var(--border-gold);">难度说明</div>
        <div class="diff-guide-modal">
          <div class="diff-row" v-for="d in diffLevels" :key="d.star">
            <div class="diff-stars">
              <span v-for="n in 5" :key="n" class="diff-star" :class="{ lit: n <= d.star }">★</span>
            </div>
            <div class="diff-info">
              <div class="diff-name">{{ d.name }}</div>
              <div class="diff-desc">{{ d.desc }}</div>
            </div>
          </div>
        </div>
        <button class="btn-primary" style="width: 100%; margin-top: 1rem;" @click="showDiffGuide = false">知道了</button>
      </div>
    </div>
  </Transition>

  <!-- ========== 调律者手册弹窗 ========== -->
  <Transition name="fade">
    <div v-if="showGuide" class="pause-overlay" @click.self="showGuide = false">
      <div class="pause-box" style="max-width: 420px; align-items: flex-start; text-align: left;">
        <div class="pause-title" style="width: 100%; text-align: center; margin-bottom: 0.5rem; color: var(--border-gold);">调律者手册</div>
        <div class="guide-content-modal">
          <div class="guide-item"><div class="guide-num">01</div><div class="guide-text">每轮做出一个选择，影响患者意识空间的走向与你的神经载荷消耗。</div></div>
          <div class="guide-item"><div class="guide-num">02</div><div class="guide-text">共振深度反映患者的治愈程度，不同数值会走向不同结局。</div></div>
          <div class="guide-item"><div class="guide-num">03</div><div class="guide-text">神经载荷归零前，你可以主动撤离。若降到0两轮内未撤出将陷入永眠。</div></div>
          <div class="guide-item"><div class="guide-num">04</div><div class="guide-text">撤离后，进入现实回响阶段，与患者及其身边人完成现实中的对话。</div></div>
        </div>
        <button class="btn-primary" style="width: 100%; margin-top: 1rem;" @click="showGuide = false">关闭</button>
      </div>
    </div>
  </Transition>

  <!-- ========== 剧本选择 ========== -->
  <Transition name="fade">
    <div v-if="phase === 'script_select'" class="screen screen-select">
      <div class="screen-nav">
        <button class="back-btn" @click="phase = 'hub'">‹ 返回</button>
      </div>
      <div class="select-header">
        <div class="select-title">修复列表</div>
        <div class="select-sub">以下患者正在等待调律者介入</div>
      </div>

      <div v-if="isGeneratingScripts && scriptPreviews.length === 0" class="scripts-loading">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <div class="loading-text">正在扫描意识档案库……</div>
      </div>

      <div v-else-if="scriptGenError && scriptPreviews.length === 0" class="scripts-error-area">
        <div class="scripts-error-text">{{ scriptGenError }}</div>
        <button class="retry-btn-large" @click="refreshScripts" :disabled="isGeneratingScripts">
          ↺ 重新扫描
        </button>
      </div>

      <div v-else class="scripts-grid">
        <div
          v-for="(script, i) in scriptPreviews"
          :key="i"
          class="script-card"
          @click="selectScript(script)"
        >
          <div class="card-difficulty">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= script.difficulty }">★</span>
          </div>
          <div class="card-name">{{ script.name }}</div>
          <div class="card-meta">
            <span>{{ script.age }}岁</span><span class="dot">·</span>
            <span>{{ script.profession }}</span><span class="dot">·</span>
            <span>昏迷{{ script.dormDuration }}</span>
          </div>
          <div class="card-divider"></div>
          <div class="card-preview">「 {{ script.preview }} 」</div>
          <div class="card-enter">选择此患者 ›</div>
        </div>

        <div v-if="isGeneratingScripts" class="script-card script-card-loading">
          <div class="loading-dots"><span></span><span></span><span></span></div>
          <div class="card-loading-text">正在读取档案……</div>
        </div>
      </div>

      <div v-if="!isGeneratingScripts && scriptPreviews.length > 0" class="select-footer">
        <button class="refresh-btn" @click="refreshScripts">
          ↺ 重新扫描档案
        </button>
      </div>
    </div>
  </Transition>

  <!-- ========== 入场道具选择弹窗 ========== -->
  <Transition name="fade">
    <div v-if="showItemSelectModal" class="pause-overlay item-select-overlay">
      <div class="item-select-box">
        <div class="is-title">意识接口就绪</div>
        <div class="is-sub">选择携带进入的道具（最多 {{ maxItemSlots }} 件）</div>

        <div v-if="ownedPermanents.length > 0" class="is-section">
          <div class="is-section-label">◎ 持续型道具（全局生效，自动携带）</div>
          <div class="is-permanent-row">
            <div v-for="pid in ownedPermanents" :key="pid" class="is-permanent-chip">
              {{ shopItems.find(i => i.id === pid)?.name ?? pid }}
            </div>
          </div>
        </div>

        <div class="is-section">
          <div class="is-section-label">◈ 消耗型道具（选择携带，{{ selectedLoadout.length }}/{{ maxItemSlots }}）</div>
          <div class="is-consumable-grid">
            <div
              v-for="item in shopItems.filter(i => i.type === 'consumable' && (ownedConsumables[i.id] || 0) > 0)"
              :key="item.id"
              class="is-item-card"
              :class="{
                'is-selected': selectedLoadout.includes(item.id),
                'is-maxed': !selectedLoadout.includes(item.id) && selectedLoadout.length >= maxItemSlots
              }"
              @click="toggleLoadoutItem(item.id)"
            >
              <div class="is-item-name">{{ item.name }}</div>
              <div class="is-item-count">持有 × {{ ownedConsumables[item.id] }}</div>
              <div class="is-item-desc">{{ item.desc }}</div>
              <div v-if="selectedLoadout.includes(item.id)" class="is-check">✓</div>
            </div>
            <div
              v-if="shopItems.filter(i => i.type === 'consumable' && (ownedConsumables[i.id] || 0) > 0).length === 0"
              class="is-empty-hint"
            >
              暂无可携带的消耗型道具<br>
              <span style="font-size: 0.65rem; color:#3a3020;">可在调律中枢的补给终端购买</span>
            </div>
          </div>
        </div>

        <div class="is-actions">
          <button class="btn-secondary" @click="skipItemSelect">空手进入</button>
          <button class="btn-primary" @click="confirmItemSelect">
            确认携带（{{ selectedLoadout.length }} 件）›
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========== 梦境主界面（含现实回响 + 逃脱） ========== -->
  <Transition name="fade">
    <div v-if="phase === 'dream' || phase === 'escape'" class="screen screen-dream">

      <div class="dream-topbar">
        <button class="dream-back-btn" @click="confirmPause">‹ 暂停</button>
        <div class="dream-round-info">
          <template v-if="gameStage === 'dream'">
            第 <span class="round-n">{{ currentRound }}</span> 轮
            <span class="round-sep">/</span>
            约 <span class="round-t">{{ estimatedRounds }}</span> 轮
          </template>
          <template v-else>
            <span class="round-n">{{ echoActLabel }}</span>
          </template>
        </div>
      </div>

      <div class="dream-main">
        <div class="dream-frame">
          <div class="frame-header">
            <span class="frame-orn">◆</span>
            <span class="frame-title">{{ gameStage === 'realecho' ? '现实回响' : '意识空间' }}</span>
            <span class="frame-orn">◆</span>
          </div>

          <button
            v-if="displayHistory.length > 0"
            class="history-toggle"
            @click="historyCollapsed = !historyCollapsed"
          >
            <span class="toggle-icon">{{ historyCollapsed ? '▾' : '▴' }}</span>
            <span class="toggle-text">
              {{ historyCollapsed ? `查看历史记录（${displayHistory.length}条）` : '收起历史记录' }}
            </span>
          </button>

          <div class="frame-content" ref="narrativeEl">
            <div v-if="displayHistory.length > 0" class="history-section">

              <!-- 展开：显示全部历史 -->
              <div v-if="!historyCollapsed" class="history-list">
                <template v-for="(entry, i) in displayHistory" :key="i">
                  <div v-if="entry.type === 'narrative'" class="para-narrative">
                    <p v-for="(para, pi) in splitParagraphs(entry.content)" :key="pi">{{ para }}</p>
                  </div>
                  <div v-if="entry.type === 'inner'" class="para-inner">「 {{ entry.content }} 」</div>
                  <div v-if="entry.type === 'choice'" class="para-choice">
                    <span class="choice-arrow">▷</span>{{ entry.content }}
                  </div>
                  <div v-if="entry.type === 'system'" class="para-system">— {{ entry.content }} —</div>
                </template>
              </div>

              <!-- 折叠：分割线 + 上一轮叙事 + 内心独白 + 最后选择 -->
              <template v-else>
                <div class="history-divider">
                  <span class="hd-line"></span>
                  <span class="hd-text">以上为历史记录</span>
                  <span class="hd-line"></span>
                </div>
                <template v-for="(entry, i) in collapsedDisplayEntries" :key="`collapsed-${i}`">
                  <div v-if="entry.type === 'narrative'" class="para-narrative">
                    <p v-for="(para, pi) in splitParagraphs(entry.content)" :key="pi">{{ para }}</p>
                  </div>
                  <div v-if="entry.type === 'inner'" class="para-inner">「 {{ entry.content }} 」</div>
                  <div v-if="entry.type === 'choice'" class="para-choice">
                    <span class="choice-arrow">▷</span>{{ entry.content }}
                  </div>
                  <div v-if="entry.type === 'system'" class="para-system">— {{ entry.content }} —</div>
                </template>
              </template>

            </div>

            <div v-if="streamingText" class="para-current">
              <p v-for="(para, pi) in splitParagraphs(streamingText)" :key="pi">{{ para }}</p>
            </div>
            <div v-if="currentNarrative && !streamingText" class="para-current">
              <p v-for="(para, pi) in splitParagraphs(currentNarrative)" :key="pi">{{ para }}</p>
            </div>
            <div v-if="innerText && !isLoading && !streamingText && gameStage === 'dream'" class="para-inner current-inner">
              「 {{ innerText }} 」
            </div>
          </div>

          <div class="frame-status">
            <div class="fstat-item">
              <span class="fstat-label">神经载荷</span>
              <div class="fstat-track">
                <div class="fstat-fill fill-load"
                  :style="{ width: (neuralLoad / maxLoad * 100) + '%' }"
                  :class="{ danger: neuralLoad <= 20 }"></div>
              </div>
              <span class="fstat-num" :class="{ danger: neuralLoad <= 20 }">{{ neuralLoad }}</span>
            </div>
            <div class="fstat-divider"></div>
            <div class="fstat-item">
              <span class="fstat-label">共振深度</span>
              <div class="fstat-track">
                <div class="fstat-fill fill-resonance"
                  :style="{ width: resonance + '%' }"
                  :class="{ full: resonance >= 100 }"></div>
              </div>
              <span class="fstat-num" :class="{ danger: resonance >= 100 }">{{ resonance }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="isLoading" class="dream-loading">
        <div class="loading-wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="loading-text-row">{{ gameStage === 'realecho' ? '现实时间流速校准中' : '意识空间重建中' }}</div>
      </div>

      <!-- ========== 梦境阶段底部面板 ========== -->
      <div v-if="gameStage === 'dream' && phase === 'dream' && !streamingText && !isLoading" class="dream-bottom-panel">
        <div class="panel-tabs">
          <button class="panel-tab" :class="{ active: bottomTab === 'choices' }" @click="bottomTab = 'choices'">
            <span class="tab-icon">◈</span> 做出选择
          </button>
          <button class="panel-tab" :class="{ active: bottomTab === 'tools' }" @click="bottomTab = 'tools'">
            <span class="tab-icon">◇</span> 道具记录
          </button>
          <div class="tab-indicator" :class="{ right: bottomTab === 'tools' }"></div>
        </div>

        <div v-show="bottomTab === 'choices'" class="panel-slide">

          <!-- 濒死倒计时横幅 -->
          <div v-if="isDying && !mustEvacuate && !isLoading && !streamingText" class="dying-banner">
            <div class="dying-icon">⚠</div>
            <div class="dying-msg">
              神经载荷归零
              <span class="dying-sub">
                再走 <span class="dying-countdown">{{ dyingRoundsLeft }}</span> 轮剧情将永久离调
              </span>
            </div>
            <button class="btn-evacuate-now dying-evacuate" @click="initiateEscape">立即撤离 ↑</button>
          </div>

          <!-- 共振满强制撤离 -->
          <div v-if="mustEvacuate && !isLoading && !streamingText" class="must-evacuate-banner">
            <div class="evacuate-icon">▲</div>
            <div class="evacuate-msg">
              共振深度已达 100%
              <span class="evacuate-sub">修复已完成，意识连接可以安全断开了</span>
            </div>
            <button class="btn-evacuate-now" @click="initiateEscape">立即撤离 ↑</button>
          </div>

          <!-- 正常选项区 -->
          <template v-if="!mustEvacuate">
            <div v-if="activeItem" class="staged-item-bar">
              <span class="staged-text">✨ 准备配合使用：[{{ activeItem.name }}]</span>
              <button class="cancel-item-btn" @click="activeItem = null">取消使用</button>
            </div>

            <template v-if="!isLoading && !streamingText && choices.length > 0">
              <ChoicePanel :choices="choices" :show="true" hint="" @select="onChoiceSelect" />
            </template>

            <div v-else-if="!isLoading && !streamingText && canRetry" class="retry-area">
              <div class="retry-hint">— AI 响应失败 —</div>
              <button class="retry-btn-large" @click="executeRetry">↺ {{ retryLabel }}</button>
            </div>

            <div v-else-if="!isLoading && !streamingText && !canRetry && currentRound > 0" class="choices-waiting">
              <div>— 等待意识空间响应 —</div>
              <button class="retry-btn-large" style="margin-top: 0.6rem;" @click="retryChoicesEmergency">
                ↺ 重新生成选项
              </button>
            </div>
          </template>

          <!-- 洞察提示 -->
          <div v-if="insightHint" class="insight-hint-bar">🔍 {{ insightHint }}</div>

          <div class="panel-actions">
            <button class="btn-escape" @click="initiateEscape">↑ 主动撤离</button>
            <button
              v-if="activeTitles.includes('洞察者') && insightUsesLeft > 0"
              class="btn-insight"
              @click="useInsight"
            >
              🔍 洞察（{{ insightUsesLeft }}）
            </button>
            <button
              v-if="watchActivatedThisRound && lastRoundSnapshot"
              class="btn-watch"
              @click="useWatch"
            >
              ⌚ 回溯
            </button>
            <button class="btn-save" @click="saveProgress">存档</button>
          </div>
        </div>

        <div v-show="bottomTab === 'tools'" class="panel-slide">
          <div class="tools-scroll-area">
            <div class="tools-row">
              <div
                v-for="(item, idx) in equippedItems.filter(i => i.id !== 'lullaby')"
                :key="idx"
                class="tool-slot-h"
                :class="{ active: activeItem?.id === item.id, empty: item.count <= 0 }"
                @click="selectItemForRound(item)"
              >
                <div class="tool-icon-h">📦</div>
                <div class="tool-name-h">{{ item.name }}</div>
                <div class="tool-count" v-if="item.count > 0">剩余: {{ item.count }}</div>
              </div>
              <div v-if="equippedItems.filter(i => i.id !== 'lullaby').length === 0" class="tool-slot-h empty">— 未携带道具 —</div>
            </div>
          </div>

          <div v-if="ownedPermanents.length > 0" class="permanent-tool-section">
            <div class="permanent-tool-label">◎ 持续生效</div>
            <div class="permanent-tool-row">
              <div
                v-for="pid in ownedPermanents"
                :key="pid"
                class="permanent-chip"
                :class="{ expanded: activePermanentDesc === pid }"
                @click="activePermanentDesc = activePermanentDesc === pid ? null : pid"
              >
                <span class="permanent-chip-name">{{ shopItems.find(i => i.id === pid)?.name ?? pid }}</span>
                <span class="permanent-chip-arrow">{{ activePermanentDesc === pid ? '▴' : '▾' }}</span>
              </div>
            </div>
            <div v-if="activePermanentDesc" class="permanent-desc-box">
              <div class="permanent-desc-name">▶ {{ shopItems.find(i => i.id === activePermanentDesc)?.name }}</div>
              <div class="permanent-desc-text">{{ shopItems.find(i => i.id === activePermanentDesc)?.desc }}</div>
            </div>
          </div>

          <div v-if="activeItem" class="active-item-desc">
            <div style="color: #c0a860; margin-bottom:4px;">▶ {{ activeItem.name }}</div>
            <div style="font-size: 0.65rem; color:#8a8070;">{{ activeItem.desc }}</div>
            <div style="font-size: 0.6rem; color:#a06050; margin-top:6px;">(已选中，请切回「做出选择」点击对话行动)</div>
          </div>
        </div>
      </div>

      <!-- ========== 现实回响底部面板 ========== -->
      <div v-if="gameStage === 'realecho' && !isLoading && !streamingText" class="dream-bottom-panel">
        <div class="panel-tabs" style="pointer-events: none;">
          <div class="panel-tab active" style="flex: 1; justify-content:center;">
            <span class="tab-icon">◈</span> {{ echoActLabel }}
          </div>
        </div>
        <div class="panel-slide">
          <template v-if="echoChoices.length > 0">
            <ChoicePanel :choices="echoChoices" :show="true" hint="你会说什么" @select="onEchoChoiceSelect" />
          </template>

          <div v-else-if="canRetry" class="retry-area">
            <div class="retry-hint">— AI 响应失败 —</div>
            <button class="retry-btn-large" @click="executeRetry">↺ {{ retryLabel }}</button>
          </div>

          <div v-if="echoPhase === 'final' && echoChoices.length === 0 && !canRetry" class="panel-actions" style="justify-content: center;">
            <button class="btn-primary" @click="goToSettlementFromEcho">进入结算 ›</button>
          </div>
        </div>
      </div>

      <!-- ========== 逃脱面板 ========== -->
      <div v-if="phase === 'escape' && !isLoading" class="dream-choices">
        <div v-if="canRetry" class="retry-area" style="padding: 0.5rem 0;">
          <div class="retry-hint">— 逃脱叙事生成失败 —</div>
          <button class="retry-btn-large" @click="executeRetry">↺ {{ retryLabel }}</button>
        </div>
        <div v-else>
          <div class="escape-result">{{ escapeResultText }}</div>
          <div class="escape-actions">
            <button v-if="escapeCanRetry" class="btn-primary" @click="retryEscape">再次尝试</button>
            <button v-if="escapeDone" class="btn-primary" @click="enterRealEcho">进入现实回响 ›</button>
          </div>
        </div>
      </div>

      <!-- 暂停弹窗 -->
      <div v-if="showPauseModal" class="pause-overlay">
        <div class="pause-box">
          <div class="pause-title">已暂停</div>
          <div class="pause-sub">进度已自动保存</div>
          <div class="pause-actions">
            <button class="btn-primary" @click="showPauseModal = false">继续游戏</button>
            <button class="btn-secondary" @click="pauseAndReturn">返回调律中枢</button>
          </div>
        </div>
      </div>

    </div>
  </Transition>

  <!-- ========== 结算 ========== -->
<Transition name="fade">
  <div v-if="phase === 'settlement'" class="screen screen-settlement">

        <!-- 呼吸页（仅非离调结局显示） -->
    <div v-if="showBreath" class="breath-screen">
      
      <!-- 1. 等待时的立体加载动画 -->
      <div v-if="isLoading" class="breath-loading">
        <div class="cube-loader">
          <div class="cube cube1"></div>
          <div class="cube cube2"></div>
          <div class="cube cube3"></div>
        </div>
        <div class="loading-text">潜意识碎片重组中...</div>
      </div>

      <!-- 2. 生成完毕后的文字显示区 (带缓动动画) -->
      <div v-else-if="breathText" class="breath-text-container">
        <!-- 利用 index 计算出每一段的动画延迟时间，形成依次升起的效果 -->
        <p 
          v-for="(para, i) in splitParagraphs(breathText)" 
          :key="i" 
          class="breath-para"
          :style="{ animationDelay: (i * 0.8) + 's' }"
        >
          {{ para }}
        </p>
      </div>

      <!-- 错误重试 -->
      <div v-if="canRetry && !isLoading" class="retry-area" style="margin-top: 2rem;">
        <div class="retry-hint">— 结算文本生成失败 —</div>
        <button class="retry-btn-large" @click="executeRetry">↺ {{ retryLabel }}</button>
      </div>

      <!-- 查看结算按钮 -->
      <Transition name="fade">
        <button v-if="showBreathDismissBtn && !canRetry" class="breath-dismiss-btn" @click="dismissBreath">
          查看结算 ›
        </button>
      </Transition>
    </div>


    <!-- 结算弹窗 -->
    <Transition name="fade">
      <div v-if="showSettlementModal" class="pause-overlay">
        <div class="settlement-card">

          <div class="settle-orn">◆</div>
          <div class="settle-result-label">{{ resultLabel }}</div>
          <div class="settle-result-name">{{ finalResultName }}</div>
          <div class="settle-divider"></div>

          <!-- 离调结局 -->
          <template v-if="finalResult === 'lost'">
            <div style="font-size: 0.82rem; color: #8a5040; line-height: 2.2; text-align: center; letter-spacing: 0.08em;">
              意识永远留在了第十三层深处。<br>
              新的调律者将继承这份使命。
            </div>
            <div class="settle-divider"></div>
            <div class="settle-orn">◆</div>
            <div class="settle-actions">
              <button class="btn-primary" @click="confirmDeath">返回主页 ›</button>
            </div>
          </template>

          <!-- 完满终止 / 协奏 / 失格 -->
          <template v-else>
            <div class="settle-stats">
              <div class="settle-row"><span class="sl">最终共振深度</span><span class="sr">{{ resonance }}%</span></div>
              <div class="settle-row"><span class="sl">剩余神经载荷</span><span class="sr">{{ neuralLoad }}</span></div>
              <div class="settle-row"><span class="sl">获得纯真滴露</span><span class="sr">+{{ dropsGained }}</span></div>
              <div class="settle-row"><span class="sl">获得经验值</span><span class="sr">+{{ expGained }}</span></div>
            </div>
            <div v-if="patientFuture" class="patient-future">
              <div class="pf-label">· 患者后续 ·</div>
              <div class="pf-scroll">
                <p v-for="(para, i) in splitParagraphs(patientFuture)" :key="i" class="pf-text">{{ para }}</p>
              </div>
            </div>
            <div class="settle-divider"></div>
            <div class="settle-orn">◆</div>
            <div v-if="newAchievements.length > 0" style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 0.6rem; color: #a09050; letter-spacing: 0.2em; text-align: center;">- 解锁新成就 -</div>
              <div v-for="ach in newAchievements" :key="ach"
                style="background: rgba(200,170,80,0.1); border: 1px solid rgba(200,170,80,0.3); padding: 8px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="color: #d8c890; font-size: 0.8rem; font-weight: bold;">🏆 {{ ACHIEVEMENT_CONFIG[ach].name }}</div>
                  <div style="color: #8a7848; font-size: 0.6rem; margin-top: 2px;">{{ ACHIEVEMENT_CONFIG[ach].desc }}</div>
                </div>
                <div v-if="ACHIEVEMENT_CONFIG[ach].drops > 0" style="color: #80c0d0; font-size: 0.75rem;">+{{ ACHIEVEMENT_CONFIG[ach].drops }}💧</div>
                <div v-if="ACHIEVEMENT_CONFIG[ach].title" style="color: #c080a0; font-size: 0.7rem;">[称号]</div>
              </div>
            </div>
            <div class="settle-actions">
              <button class="btn-secondary" @click="returnToHubFromSettlement">返回调律中枢</button>
              <button class="btn-primary" @click="restartSelect">继续修复</button>
            </div>
          </template>

        </div>
      </div>
    </Transition>

  </div>
</Transition>


  <!-- 新游戏覆盖确认 -->
  <div v-if="showConfirmNewGameModal" class="pause-overlay">
    <div class="pause-box">
      <div class="pause-title" style="color: #c06050;">覆盖警告</div>
      <div class="pause-sub" style="line-height: 1.8;">开启新游戏将丢失当前未完成的进度<br>是否确认覆盖？</div>
      <div class="pause-actions">
        <button class="btn-primary" style="background: linear-gradient(135deg, #802020, #c04040); border-color: #c04040;" @click="confirmStartNewGame">确认覆盖</button>
        <button class="btn-secondary" @click="showConfirmNewGameModal = false">取消</button>
      </div>
    </div>
  </div>

  <!-- ========== 补给商店 ========== -->
  <Transition name="fade">
    <div v-if="phase === 'shop'" class="screen screen-shop">
      <div class="screen-nav" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="back-btn" @click="phase = 'hub'">‹ 返回中枢</button>
        <div class="currency-display">
          <span class="currency-icon">💧</span>
          <span class="currency-value">{{ pureDrops }}</span>
        </div>
      </div>
      <div class="select-header">
        <div class="select-title">补给终端</div>
        <div class="select-sub">每一滴纯真，都是在深渊中活下去的筹码</div>
      </div>
      <div class="shop-grid">
        <div v-for="item in shopItems" :key="item.id"
          class="shop-item-card"
          :class="{
            'locked': playerLevel < item.minLevel,
            'soldout': item.type === 'permanent' && ownedPermanents.includes(item.id)
          }">
          <div class="item-header">
            <span class="item-name">{{ item.name }}</span>
            <span v-if="item.type === 'consumable'" class="item-owned">持有: {{ ownedConsumables[item.id] || 0 }}</span>
          </div>
          <div class="item-desc">{{ item.desc }}</div>
          <div class="item-footer">
            <div class="item-price">💧 {{ item.price }}</div>
            <button class="buy-btn"
              :disabled="playerLevel < item.minLevel || pureDrops < item.price || (item.type === 'permanent' && ownedPermanents.includes(item.id))"
              @click="buyItem(item)">
              <span v-if="playerLevel < item.minLevel">Lv.{{ item.minLevel }} 解锁</span>
              <span v-else-if="item.type === 'permanent' && ownedPermanents.includes(item.id)">已拥有</span>
              <span v-else>兑换</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========== 调律者档案 ========== -->
  <Transition name="fade">
    <div v-if="phase === 'profile'" class="screen screen-profile">
      <div class="screen-nav">
        <button class="back-btn" @click="phase = 'hub'">‹ 返回中枢</button>
      </div>
      <div class="profile-scroll-container">
        <div class="profile-header-card">
          <div class="header-top-row">
            <div class="avatar-edit-container" @click="triggerAvatarUpload">
              <div class="profile-avatar big-avatar">
                <img v-if="playerAvatar" :src="playerAvatar" class="avatar-img" />
                <span v-else-if="playerName && playerName !== '调律者'">{{ playerName.slice(-1) }}</span>
                <span v-else>律</span>
              </div>
              <div class="edit-hint">📷 上传</div>
            </div>
            <input type="file" ref="fileInputRef" accept="image/*" style="display: none" @change="handleAvatarUpload" />
            <div class="name-edit-row">
              <span style="font-size: 0.6rem; color: #6a5838; letter-spacing: 0.1em;">代号 / CODENAME</span>
              <input v-model="playerName" class="name-input" type="text" maxlength="8" placeholder="输入调律者代号" />
            </div>
          </div>
          <div class="level-progress-bar" style="margin-top: 1rem;">
            <div class="lp-fill" :style="{ width: playerLevel >= 10 ? '100%' : Math.min((totalExp / LEVEL_EXP[playerLevel + 1]) * 100, 100) + '%' }"></div>
          </div>
          <div class="lp-text">调律权限 LV.{{ playerLevel }}</div>
        </div>

        <div class="section-title">生涯统计 / STATISTICS</div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="s-label">累计调律剧本</div>
            <div class="s-val">{{ completedScripts.length }} <span class="s-sub">份</span></div>
          </div>
          <div class="stat-box">
            <div class="s-label">经历意识流转</div>
            <div class="s-val">{{ totalRoundsPlayed }} <span class="s-sub">轮</span></div>
          </div>
          <div class="stat-box">
            <div class="s-label">累计提炼纯真</div>
            <div class="s-val">{{ totalDropsEarned }} <span class="s-sub">💧</span></div>
          </div>
        </div>

        <div class="stars-record">
          <div v-for="star in 5" :key="star" class="star-row">
            <div class="sr-stars"><span v-for="n in star" :key="n">★</span></div>
            <div class="sr-bar-bg">
              <div class="sr-bar-fill" :style="{ width: (scriptStats[star] / (Math.max(...Object.values(scriptStats)) || 1)) * 100 + '%' }"></div>
            </div>
            <div class="sr-count">{{ scriptStats[star] }}</div>
          </div>
        </div>

        <div class="section-title">称号装配 / TITLES (LV.8解锁双槽)</div>
        <div class="titles-container">
          <div v-if="unlockedTitles.length === 0" style="font-size: 0.7rem; color:#5a5040;">尚无可用称号。请在深渊中证明自己。</div>
          <button v-for="title in unlockedTitles" :key="title"
            class="title-btn"
            :class="{ active: activeTitles.includes(title) }"
            @click="toggleTitle(title)">
            {{ activeTitles.includes(title) ? '★' : '☆' }} {{ title }}
          </button>
        </div>

        <div class="section-title">意识图鉴 / ACHIEVEMENTS</div>
        <div class="achievements-list">
          <div v-for="(achData, achKey) in ACHIEVEMENT_CONFIG" :key="achKey"
            class="ach-card"
            :class="{ unlocked: achievements[achKey] }">
            <div class="ach-head">
              <span class="ach-name">{{ achData.name }}</span>
              <span class="ach-status">{{ achievements[achKey] ? '已达成' : '未解锁' }}</span>
            </div>
            <div class="ach-desc">{{ achData.desc }}</div>
            <div class="ach-rewards" v-if="achievements[achKey]">
              <span v-if="achData.drops">+{{ achData.drops }} 💧</span>
              <span v-if="achData.title">解锁称号 [{{ achData.title }}]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========== 升级奖励弹窗 ========== -->
  <Transition name="fade">
    <div v-if="showLevelUpModal" class="pause-overlay">
      <div class="levelup-box">
        <div class="levelup-orn">✦</div>
        <div class="levelup-title">意识升维</div>
        <div class="levelup-level">调律者等级提升至 LV.{{ playerLevel }}</div>
        <div v-if="levelUpRewards.length > 0" class="levelup-rewards">
          <div v-for="r in levelUpRewards" :key="r" class="levelup-reward-row">
            <span class="reward-icon">◈</span>{{ r }}
          </div>
        </div>
        <div v-if="levelUpChoiceNeeded" class="levelup-choice-section">
          <div class="levelup-choice-label">选择一项永久奖励</div>
          <div class="levelup-choices">
            <div v-for="c in levelUpChoices" :key="c.id" class="levelup-choice-card" @click="confirmLevelUpChoice(c.id)">
              <div class="lc-label">{{ c.label }}</div>
              <div class="lc-desc">{{ c.desc }}</div>
            </div>
          </div>
        </div>
        <div v-if="!levelUpChoiceNeeded" class="levelup-actions">
          <button class="btn-primary" @click="skipLevelUpModal">确认 ›</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 静默者道具弹窗 -->
  <Transition name="fade">
    <div v-if="showSilentOneModal" class="pause-overlay">
      <div class="pause-box">
        <div class="pause-title" style="font-size: 1rem;">✨ 静默者</div>
        <div class="pause-sub" style="line-height: 2;">沉默是一种语言。<br>因为你的坚持，获得了：</div>
        <div style="background: rgba(200,170,80,0.08); border: 1px solid rgba(200,170,80,0.25); border-radius: 5px; padding: 0.8rem 1.2rem; text-align: center; color: #d0c090; font-size: 0.95rem; letter-spacing: 0.1em;">
          {{ silentOneReward?.name }}
        </div>
        <div class="pause-actions">
          <button class="btn-primary" @click="showSilentOneModal = false">携带进入 ›</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 离调道具损失弹窗 -->
  <Transition name="fade">
    <div v-if="showLostItemsModal" class="pause-overlay">
      <div class="pause-box">
        <div class="pause-title" style="color: #c06050; font-size: 1rem;">意识迷失</div>
        <div class="pause-sub" style="line-height: 2;">你没能回来。<br>以下道具随之消散：</div>
        <div style="width: 100%; display: flex; flex-direction: column; gap: 0.5rem;">
          <div v-for="item in lostItemsOnDeath" :key="item.name"
            style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.8rem; background: rgba(160,50,30,0.1); border: 1px solid rgba(160,50,30,0.25); border-radius: 4px;">
            <span style="font-size: 0.85rem; color: #c08070; letter-spacing: 0.08em;">{{ item.name }}</span>
            <span style="font-size: 0.72rem; color: #8a5040; font-family: 'Courier New', monospace;">× {{ item.count }}</span>
          </div>
          <div v-if="lostItemsOnDeath.length === 0" style="font-size: 0.75rem; color: #5a4030; text-align: center; padding: 0.5rem;">
            本局未携带任何道具
          </div>
        </div>
        <div class="pause-actions">
          <button class="btn-secondary" @click="showLostItemsModal = false">知道了</button>
        </div>
      </div>
    </div>
  </Transition>
          <!-- ========== 悬浮留声机 (纯净横条版) ========== -->
    <div 
      class="floating-player-bar" 
      :class="{ 'is-playing': isPlaying }"
      :style="{ left: playerPos.x + 'px', top: playerPos.y + 'px' }"
      @mousedown="startDrag"
      @touchstart.passive="startDrag"
    >
      <audio 
        ref="bgmAudio" 
        :src="playlist[currentTrackIndex].src" 
        @ended="playRandom"
      ></audio>

      <!-- 左侧：旋转黑金唱片 -->
      <div class="bar-disc" :class="{ spinning: isPlaying }">
        <span class="disc-core">◈</span>
      </div>

      <!-- 右侧：三个纯粹的控制按钮 -->
      <div class="bar-controls">
        <button class="ctrl-btn" @click="playRandom">⏮</button>
        <button class="ctrl-btn play-btn" @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="ctrl-btn" @click="playRandom">⏭</button>
      </div>
    </div>

</div>
</template>


<script setup>
import { computed, ref , onMounted, nextTick, watch} from 'vue'
import ChoicePanel from '@/components/common/ChoicePanel.vue'
import {
  useGameLogic,
  LEVEL_EXP,
  ACHIEVEMENT_CONFIG,
  shopItems,
  diffLevels
} from './composables/useGameLogic'
import { parseScriptContext } from './prompts/promptBuilder'

const fileInputRef = ref(null)
const narrativeEl  = ref(null)

// ========== 悬浮播放器逻辑 (极简横条版) ==========
import bgm1 from '@/assets/audio/phase1/DreamLayer/bgm_dream1.mp3'
import bgm2 from '@/assets/audio/phase1/DreamLayer/bgm_dream2.mp3'
import bgm3 from '@/assets/audio/phase1/DreamLayer/bgm_dream3.mp3'
import bgm4 from '@/assets/audio/phase1/DreamLayer/bgm_dream4.mp3'
import bgm5 from '@/assets/audio/phase1/DreamLayer/bgm_dream5.mp3'
import bgm6 from '@/assets/audio/phase1/DreamLayer/bgm_dream6.mp3'
import bgm7 from '@/assets/audio/phase1/DreamLayer/bgm_dream7.mp3'
import bgm8 from '@/assets/audio/phase1/DreamLayer/bgm_dream8.mp3'
import bgm9 from '@/assets/audio/phase1/DreamLayer/bgm_dream9.mp3'
import bgm10 from '@/assets/audio/phase1/DreamLayer/bgm_dream10.mp3'

const playlist = [
  { src: bgm1 }, { src: bgm2 }, { src: bgm3 }, { src: bgm4 }, { src: bgm5 },
  { src: bgm6 }, { src: bgm7 }, { src: bgm8 }, { src: bgm9 }, { src: bgm10 }
]

const bgmAudio = ref(null)
const isPlaying = ref(false)
const playerPos = ref({ x: 0, y: 0 }) 
const currentTrackIndex = ref(Math.floor(Math.random() * playlist.length))

const isDragging = ref(false)
let dragOffset = { x: 0, y: 0 }

function togglePlay(e) {
  if (e) e.stopPropagation()
  if (!bgmAudio.value) return
  if (isPlaying.value) {
    bgmAudio.value.pause()
    isPlaying.value = false
  } else {
    bgmAudio.value.play().catch(err => console.warn('播放被拦截:', err))
    isPlaying.value = true
  }
}

function playRandom(e) {
  if (e) e.stopPropagation()
  if (playlist.length <= 1) return
  let nextIndex = currentTrackIndex.value
  while (nextIndex === currentTrackIndex.value) {
    nextIndex = Math.floor(Math.random() * playlist.length)
  }
  currentTrackIndex.value = nextIndex
  
  if (isPlaying.value) {
    nextTick(() => {
      bgmAudio.value?.play().catch(err => console.warn('切歌失败:', err))
    })
  }
}

function startDrag(e) {
  // 点按钮时不触发拖拽
  if (e.target.tagName.toLowerCase() === 'button') return 
  isDragging.value = true
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY
  
  dragOffset.x = clientX - playerPos.value.x
  dragOffset.y = clientY - playerPos.value.y

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
  if (!isDragging.value) return
  if (e.type.includes('touch') && e.cancelable) e.preventDefault() 
  
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY
  
  // 固定横条的尺寸
  const elementWidth = 140
  const elementHeight = 44
  
  let newX = clientX - dragOffset.x
  let newY = clientY - dragOffset.y
  
  newX = Math.max(0, Math.min(newX, window.innerWidth - elementWidth))
  newY = Math.max(0, Math.min(newY, window.innerHeight - elementHeight))
  
  playerPos.value = { x: newX, y: newY }
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    // 放在右下角：屏幕宽度减去播放器宽度(260)和边距(20)
    playerPos.value = { 
      x: window.innerWidth - 380, 
      y: window.innerHeight - 70 
    }
  }
})






const EMPTY_PARSED_CONTEXT = Object.freeze({
  character: '', wound: '', imagery: '',
  socialIssue: '', mentalTheme: '', mainSentence: ''
})

const {
  // UI 状态
  phase, gameStage, showGuide, showDiffGuide, bottomTab, historyCollapsed,
  titleReady, hasSave, storyReady, showPauseModal, showConfirmNewGameModal,
  showItemSelectModal, showBreath, activePermanentDesc, isBackgroundRunning,
  returnToHubFromSettlement,

  // 剧本
  isGeneratingScripts, scriptPreviews, scriptGenError, selectedScript, scriptTracking,

  // 重试系统
  canRetry, retryLabel, executeRetry, retryChoicesEmergency,

  // 玩家数据
  playerName, playerAvatar, pureDrops, playerLevel, totalExp,
  totalRoundsPlayed, totalDropsEarned, completedScripts, achievements,
  unlockedTitles, activeTitles, newAchievements,
  ownedConsumables, ownedPermanents, scriptStats,

  // 游戏数值
  neuralLoad, maxLoad, resonance, currentRound, isDying,
  dyingRoundsLeft, mustEvacuate, estimatedRounds, hasActiveGame, returnToTitle,

  // 叙事
  displayHistory, streamingText, innerText, currentNarrative, choices, isLoading,

  // 逃脱
  escapeResultText, escapeCanRetry, escapeDone,

  // 现实回响
  echoPhase, echoChoices, echoActLabel, goToSettlementFromEcho,

  // 结算
finalResult, finalResultName, resultLabel,
showSettlementModal,
dropsGained, expGained, breathText, patientFuture,

  // 升级
  showLevelUpModal, levelUpRewards, levelUpChoiceNeeded,
  levelUpChoices, confirmLevelUpChoice, skipLevelUpModal,

  // 死亡
  confirmDeath,

  // 弹窗
  silentOneReward, showSilentOneModal,
  lostItemsOnDeath, showLostItemsModal, showBreathDismissBtn,

  // 道具
  equippedItems, activeItem, selectedLoadout, maxItemSlots,
  watchUsed, lastRoundSnapshot, useWatch,
  pendulumRoundsLeft, watchActivatedThisRound,

  // 洞察
  insightUsesLeft, insightHint, useInsight,

  // 患者手册
  selectedPatient,
  patientCurrentStatus, isGeneratingStatus,
  showPatientStatusModal, generatePatientCurrentStatus,

  // 函数
  startNewGame, continueGame, confirmStartNewGame,
  goStory, goToScriptSelect, handleHubPrimaryAction,
  selectScript, refreshScripts,
  confirmItemSelect, skipItemSelect, toggleLoadoutItem,
  selectItemForRound, buyItem, toggleTitle,
  triggerAvatarUpload, handleAvatarUpload,
  onChoiceSelect, onEchoChoiceSelect,
  confirmPause, pauseAndReturn,
  initiateEscape, retryEscape, enterRealEcho,
  goToSettlement, restartSelect, saveProgress,
  splitParagraphs, dismissBreath,
} = useGameLogic(fileInputRef, narrativeEl)

// ========== 折叠历史：显示上一轮叙事 + 内心独白 + 最后选择 ==========
const collapsedDisplayEntries = computed(() => {
  const history = displayHistory.value
  if (!history.length) return []

  let lastChoiceIdx = -1
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].type === 'choice') {
      lastChoiceIdx = i
      break
    }
  }
  if (lastChoiceIdx === -1) return []

  const preceding = []
  for (let i = lastChoiceIdx - 1; i >= 0; i--) {
    const type = history[i].type
    if (type === 'narrative' || type === 'inner') {
      preceding.unshift(history[i])
    } else if (type === 'system') {
      continue   // ✅ 跳过系统消息，继续往前找
    } else if (type === 'choice') {
      break      // ✅ 遇到上一个玩家选择才停止
    }
  }

  return [...preceding, history[lastChoiceIdx]]
})


// ========== 患者档案上下文解析 ==========
const parsedSelectedPatientContext = computed(() => {
  const ctx = selectedPatient.value?.scriptContext
  if (!ctx) return EMPTY_PARSED_CONTEXT
  const parsed = parseScriptContext(ctx)
  return { ...EMPTY_PARSED_CONTEXT, ...(parsed && typeof parsed === 'object' ? parsed : {}) }
})

function selectPatient(patient) {
  selectedPatient.value = patient
}

function getPatientKey(patient, idx) {
  return patient?.id
    ?? patient?.time
    ?? `${patient?.patientName ?? 'patient'}-${idx}`
}

function formatResult(result) {
  const map = {
    perfect: '完满终止', harmony: '协奏',
    disqualified: '失格', lost: '离调'
  }
  return map[result] ?? result
}

function formatPatientDate(value) {
  if (!value) return '日期未知'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '日期未知'
  return date.toLocaleDateString('zh-CN')
}

function getParticleStyle(n) {
  const x        = ((n * 41 + 7)  % 90) + 5
  const delay    = ((n * 0.37)    % 5)
  const duration = 5 + ((n * 1.3) % 8)
  const size     = 1 + (n % 3)
  const opacity  = 0.2 + ((n % 5) * 0.12)
  return {
    left:              x + '%',
    animationDelay:    delay + 's',
    animationDuration: duration + 's',
    width:             size + 'px',
    height:            size + 'px',
    opacity,
  }
}

</script>

<style scoped>
/* ============================================================
   第十三层梦境 · 完整样式表
============================================================ */

/* ============================================================
   01. CSS 变量系统 (重塑立体光影)
============================================================ */
.dream-layer {
  --bg-paper:       #F7F4EB;
  /* 基础面板：带微量渐变的半透明白 */
  --bg-panel:       linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 246, 240, 0.6) 100%);
  --bg-panel-hover: linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(255, 252, 245, 0.8) 100%);
  --border-brass:   rgba(212, 196, 168, 0.6); /* 变柔和的边框 */
  --border-gold:    #B89947;
  --text-main:      #3C352D;
  --text-muted:     #8C7F70;
  --tech-teal:      #4A8E8B;
  --alert-red:      #B54A4A;
  --safe-green:     #6B8E4A;
  
  /* 核心立体感光影：外层柔和阴影 + 内层顶部高光(模拟物理厚度) */
  --shadow-card:    0 8px 24px rgba(60, 53, 45, 0.04), 0 2px 8px rgba(60, 53, 45, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.9);
  --shadow-hover:   0 12px 32px rgba(184, 153, 71, 0.12), 0 4px 12px rgba(184, 153, 71, 0.08), inset 0 1px 1px rgba(255, 255, 255, 1);
  --shadow-inset:   inset 0 2px 6px rgba(60, 53, 45, 0.05), inset 0 -1px 1px rgba(255, 255, 255, 0.6); /* 凹陷感阴影 */

  font-family: 'KaiTi', 'STKaiti', 'Noto Serif SC', serif;
  width: 100vw;
  height: 100vh;
  background: var(--bg-paper);
  color: var(--text-main);
  overflow: hidden;
  position: relative;
}

.dream-layer::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
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

/* ============================================================
   02. 页面切换动画 (更加深邃、丝滑)
============================================================ */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s cubic-bezier(0.25, 0.8, 0.25, 1),
              transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1),
              filter 0.6s ease;
}
.fade-enter-from { opacity: 0; transform: scale(0.98) translateY(15px); filter: blur(8px); }
.fade-leave-to   { opacity: 0; transform: scale(1.02) translateY(-10px); filter: blur(4px); }

.story-fade-enter-active {
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.story-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.5, 0, 0.8, 0.5);
  position: absolute; width: 100%;
}
.story-fade-enter-from { opacity: 0; transform: translateX(30px); }
.story-fade-leave-to   { opacity: 0; transform: translateX(-20px); }


/* ============================================================
   03. 通用组件
============================================================ */
.back-btn {
  padding: 0.45rem 1rem;
  background: transparent;
  border: 1px solid var(--border-brass);
  border-radius: 2px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}
.back-btn:hover { border-color: var(--border-gold); color: var(--border-gold); background: rgba(184,153,71,0.05); }

.currency-display {
  display: flex; align-items: center; gap: 0.4rem;
  background: rgba(255,255,255,0.5);
  border: 1px solid var(--border-brass);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
}
.currency-icon  { font-size: 0.7rem; }
.currency-value { font-size: 0.85rem; color: var(--tech-teal); font-family: 'Courier New', serif; font-weight: bold; }

/* 修改 btn-primary 增加立体和按下效果 */
.btn-primary {
  position: relative;
  padding: 0.7rem 1.8rem;
  background: linear-gradient(180deg, #FFFFFF, #F0EBE0);
  border: 1px solid var(--border-gold);
  border-radius: 6px; /* 稍微加大圆角 */
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  cursor: pointer;
  /* 弹簧过渡动画 */
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, background 0.2s;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(184,153,71,0.15), inset 0 2px 0 rgba(255,255,255,1);
}
.btn-primary:hover  { 
  background: linear-gradient(180deg,#FFF,#FDFBF5); 
  border-color:#9A7D35; color:#9A7D35; 
  transform:translateY(-2px); 
  box-shadow: 0 6px 16px rgba(184,153,71,0.25), inset 0 2px 0 rgba(255,255,255,1); 
}
/* 物理按压反馈 */
.btn-primary:active { 
  transform:translateY(1px) scale(0.98); 
  box-shadow: 0 2px 4px rgba(184,153,71,0.1), inset 0 2px 4px rgba(184,153,71,0.1); 
}
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

/* 二级按钮同理 */
.btn-secondary {
  padding: 0.7rem 1.8rem;
  background: rgba(255,255,255,0.4);
  backdrop-filter: blur(4px);
  border: 1px solid var(--border-brass);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
  white-space: nowrap;
}
.btn-secondary:hover  { 
  border-color:var(--border-gold); color:var(--text-main); background:#FFF; 
  transform:translateY(-2px); box-shadow: 0 4px 12px rgba(60,53,45,0.08); 
}
.btn-secondary:active { 
  transform:translateY(1px) scale(0.98); 
  box-shadow: inset 0 2px 4px rgba(60,53,45,0.05); 
}


.screen-nav { width: 100%; max-width: 500px; padding: 1.2rem 1.5rem 0; flex-shrink: 0; }

.retry-btn-large {
  padding: 0.55rem 2rem;
  background: transparent;
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.25s;
}
.retry-btn-large:hover   { background: rgba(184,153,71,0.08); transform: translateY(-1px); }
.retry-btn-large:active  { transform: translateY(0); }
.retry-btn-large:disabled { opacity: 0.4; cursor: not-allowed; }

.retry-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 0;
}
.retry-hint {
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.2em;
  font-family: 'Courier New', monospace;
}

.scripts-error-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  padding: 3rem 2rem;
  flex: 1;
}
.scripts-error-text {
  font-size: 0.8rem;
  color: var(--alert-red);
  letter-spacing: 0.1em;
  text-align: center;
  line-height: 1.8;
}

/* ============================================================
   04. 标题页
============================================================ */
.screen-title {
  align-items: center;
  justify-content: center;
  background: var(--bg-paper);
  overflow: hidden;
}

.title-bg {
  position: absolute; inset: 0; z-index: 0;
  background-image:
    linear-gradient(rgba(184,153,71,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,153,71,0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: center center;
}
.title-bg::after {
  content: '';
  position: absolute; top: 40%; left: 50%;
  transform: translate(-50%,-50%);
  width: 90vw; height: 90vw;
  max-width: 600px; max-height: 600px;
  border-radius: 50%;
  border: 1px dashed rgba(74,142,139,0.5);
  animation: dialSpin 40s linear infinite;
}
.title-bg::before {
  content: '';
  position: absolute; top: 40%; left: 50%;
  transform: translate(-50%,-50%);
  width: 65vw; height: 65vw;
  max-width: 420px; max-height: 420px;
  border-radius: 50%;
  border: 2px dotted rgba(184,153,71,0.5);
  animation: dialSpinReverse 30s linear infinite;
}
@keyframes dialSpin        { 0%{transform:translate(-50%,-50%) rotate(0deg)}   100%{transform:translate(-50%,-50%) rotate(360deg)} }
@keyframes dialSpinReverse { 0%{transform:translate(-50%,-50%) rotate(360deg)} 100%{transform:translate(-50%,-50%) rotate(0deg)} }

.title-scanlines {
  position: absolute; inset: -50% 0; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, rgba(74,142,139,0.03) 45%, rgba(74,142,139,0.08) 50%, rgba(74,142,139,0.03) 55%, transparent 100%);
  animation: verticalScan 8s cubic-bezier(0.4,0,0.6,1) infinite alternate;
}
@keyframes verticalScan { 0%{transform:translateY(-30%)} 100%{transform:translateY(30%)} }

.dream-orbs { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(60px); mix-blend-mode: multiply; opacity: 0.3; }
.orb-1 { width:55vw;height:55vw;max-width:340px;max-height:340px; top:-10%;left:-15%; background:radial-gradient(circle,rgba(184,153,71,0.25),transparent 70%); animation:orbDrift1 18s ease-in-out infinite alternate; }
.orb-2 { width:50vw;height:50vw;max-width:300px;max-height:300px; bottom:-5%;right:-10%; background:radial-gradient(circle,rgba(74,142,139,0.2),transparent 70%); animation:orbDrift2 22s ease-in-out infinite alternate; }
.orb-3 { width:40vw;height:40vw;max-width:240px;max-height:240px; top:30%;right:5%; background:radial-gradient(circle,rgba(184,153,71,0.15),transparent 70%); animation:orbDrift3 15s ease-in-out infinite alternate; }
.orb-4 { width:30vw;height:30vw;max-width:180px;max-height:180px; top:35%;left:15%; background:radial-gradient(circle,rgba(74,142,139,0.15),transparent 70%); animation:orbDrift4 25s ease-in-out infinite alternate; }
.orb-5 { width:35vw;height:35vw;max-width:200px;max-height:200px; bottom:10%;left:-5%; background:radial-gradient(circle,rgba(107,142,74,0.15),transparent 70%); animation:orbDrift5 20s ease-in-out infinite alternate; }

@keyframes orbDrift1 { 0%{transform:translate(0,0)scale(1)} 33%{transform:translate(12px,20px)scale(1.08)} 66%{transform:translate(25px,8px)scale(0.95)} 100%{transform:translate(10px,30px)scale(1.05)} }
@keyframes orbDrift2 { 0%{transform:translate(0,0)scale(1)} 40%{transform:translate(-18px,-12px)scale(1.1)} 100%{transform:translate(-8px,-25px)scale(0.92)} }
@keyframes orbDrift3 { 0%{transform:translate(0,0)scale(1);opacity:0.8} 50%{transform:translate(-15px,18px)scale(1.12);opacity:1} 100%{transform:translate(-5px,10px)scale(0.9);opacity:0.7} }
@keyframes orbDrift4 { 0%{transform:translate(0,0)scale(1);opacity:0.6} 60%{transform:translate(20px,-15px)scale(1.2);opacity:1} 100%{transform:translate(8px,-8px)scale(0.85);opacity:0.5} }
@keyframes orbDrift5 { 0%{transform:translate(0,0)scale(1)} 45%{transform:translate(16px,-20px)scale(1.15)} 100%{transform:translate(5px,-10px)scale(0.95)} }

.dream-particles { position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden; }
.particle { position:absolute;bottom:-4px;border-radius:50%;background:var(--tech-teal);opacity:0.4;animation:particleFloat linear infinite; }
@keyframes particleFloat { 0%{transform:translateY(0)scale(1);opacity:0} 10%{opacity:0.6} 80%{opacity:0.3} 100%{transform:translateY(-100vh)scale(0.5);opacity:0} }

.title-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 0.8rem;
  opacity: 0; transform: translateY(16px);
  transition: opacity 1.2s ease, transform 1.2s ease;
  width: 100%; max-width: 320px; padding: 0 1.5rem;
}
.title-content.visible { opacity: 1; transform: translateY(0); }

.title-tag  { font-size:0.52rem;color:var(--border-gold);letter-spacing:0.3em;font-family:'Courier New',serif; }
.title-main { font-size:2rem;font-weight:bold;letter-spacing:0.3em;color:var(--text-main);text-shadow:0 2px 10px rgba(184,153,71,0.2);animation:titleGlow 5s ease-in-out infinite alternate; }
@keyframes titleGlow {
  0%   { text-shadow:0 2px 8px rgba(184,153,71,0.15);  letter-spacing:0.28em; }
  100% { text-shadow:0 2px 16px rgba(184,153,71,0.35),0 0 30px rgba(184,153,71,0.1); letter-spacing:0.32em; }
}
.title-sub     { font-size:0.78rem;color:var(--text-muted);letter-spacing:0.25em;margin-top:-0.3rem; }
.title-subject { font-size:0.68rem;color:var(--tech-teal);letter-spacing:0.15em;font-family:'Courier New',serif;opacity:0.8; }
.subject-bracket { color:var(--border-brass); }
.title-divider { width:60px;height:1px;background:linear-gradient(90deg,transparent,var(--border-gold),transparent);margin:0.2rem 0;opacity:0.6; }
.title-actions { display:flex;flex-direction:column;gap:0.6rem;width:100%; }

.title-btn {
  display:flex;align-items:center;justify-content:center;gap:0.6rem;
  padding:0.75rem 1.2rem;border-radius:3px;font-family:inherit;font-size:0.85rem;
  letter-spacing:0.15em;cursor:pointer;transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);width:100%;
}
.title-btn.primary  { background:linear-gradient(180deg,rgba(255,255,255,0.9),rgba(240,235,224,0.9));border:1px solid var(--border-gold);color:var(--border-gold);box-shadow:var(--glow-brass);backdrop-filter:blur(4px); }
.title-btn.primary:hover { background:#FFF;border-color:#9A7D35;color:#9A7D35;transform:translateY(-2px); }
.title-btn.secondary { background:transparent;border:1px dashed var(--border-brass);color:var(--text-muted);backdrop-filter:blur(4px); }
.title-btn.secondary:hover:not(.disabled) { border-style:solid;border-color:var(--border-gold);color:var(--border-gold);background:rgba(255,255,255,0.6);transform:translateY(-1px); }
.title-btn.secondary.disabled { opacity:0.3;cursor:not-allowed; }
.btn-icon { font-size:0.7rem;opacity:0.8; }

.title-footer { margin-top:0.2rem;text-align:center;position:relative;z-index:10; }
.back-link { background:transparent;border:none;color:var(--text-muted);font-family:inherit;font-size:0.65rem;letter-spacing:0.15em;cursor:pointer;transition:color 0.3s;padding:0.3rem; }
.back-link:hover { color:var(--border-gold); }

/* ============================================================
   05. 故事章节页
============================================================ */
.screen-story { justify-content:space-between;overflow:hidden;background:var(--bg-paper); }
.story-nav-top { display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.5rem;flex-shrink:0;position:relative;z-index:10; }
.story-progress { display:flex;gap:6px; }
.progress-dot   { width:20px;height:2px;background:rgba(184,153,71,0.2);border-radius:1px;transition:background 0.4s; }
.progress-dot.active { background:var(--border-gold); }

.story-content {
  flex:1;display:flex;flex-direction:column;padding:1rem 2rem;max-width:600px;margin:0 auto;width:100%;
  opacity:0;transform:translateY(12px);transition:opacity 0.7s ease,transform 0.7s ease;
  overflow-y:auto;-ms-overflow-style:none;scrollbar-width:none;-webkit-overflow-scrolling:touch;
}
.story-content::-webkit-scrollbar { display:none; }
.story-content.visible { opacity:1;transform:translateY(0); }

.story-chapter-tag { font-size:0.88rem;color:var(--border-gold);letter-spacing:0.4em;margin-bottom:1.5rem; }
.story-body        { display:flex;flex-direction:column;gap:0.9rem;flex:1; }
.story-lead  { font-size:1.15rem;color:var(--text-main);letter-spacing:0.12em;line-height:1.8;font-weight:bold; }
.story-text  { font-size:0.88rem;color:var(--text-muted);line-height:2.2;letter-spacing:0.05em; }
.story-text.highlight-block { background:rgba(184,153,71,0.05);border-left:3px solid var(--border-gold);padding:0.6rem 1rem;color:var(--text-main);border-radius:0 3px 3px 0; }
.story-quote { font-size:0.88rem;color:var(--tech-teal);line-height:2;letter-spacing:0.06em;font-style:italic;padding:0.8rem 0;border-top:1px dashed var(--border-brass);border-bottom:1px dashed var(--border-brass);text-align:center; }
.story-quote.final-quote { font-size:0.95rem;border-color:var(--border-gold); }

.story-actions  { display:flex;justify-content:flex-end;padding:1.2rem 0 0.5rem;flex-shrink:0; }
.story-next-btn { padding:0.65rem 2rem;background:transparent;border:1px solid var(--border-gold);border-radius:2px;color:var(--border-gold);font-family:inherit;font-size:0.82rem;letter-spacing:0.2em;cursor:pointer;transition:all 0.3s; }
.story-next-btn:hover { background:rgba(184,153,71,0.08);transform:translateX(4px); }
.story-next-btn.enter-btn { background:rgba(184,153,71,0.06); }
.story-vignette { position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(200,190,170,0.3) 100%);pointer-events:none;z-index:2;mix-blend-mode:multiply; }

.story-1,.story-bg-1 { background:#F5F2E8; }
.story-bg-1 { position:absolute;inset:0;background:radial-gradient(ellipse at 20% 30%,rgba(184,153,71,0.08) 0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(74,142,139,0.05) 0%,transparent 50%); }
.story-2,.story-bg-2 { background:#F3F0E5; }
.story-bg-2 { position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,rgba(184,153,71,0.07) 0%,transparent 60%); }
.story-3,.story-bg-3 { background:#F4F1E7; }
.story-bg-3 { position:absolute;inset:0;background:radial-gradient(ellipse at 70% 30%,rgba(74,142,139,0.06) 0%,transparent 55%),radial-gradient(ellipse at 30% 70%,rgba(184,153,71,0.06) 0%,transparent 45%); }
.story-4,.story-bg-4 { background:#F2EFE4; }
.story-bg-4 { position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(184,153,71,0.08) 0%,transparent 55%); }

/* ============================================================
   06. 调律者中枢 Hub (立体质感升级)
============================================================ */
.screen-hub { background:var(--bg-paper);overflow-y:auto;padding:0;display:flex;flex-direction:column;padding-top:1.5rem;position:relative; }

/* 背景特效保留 */
.hub-bg-fx { position:fixed;inset:0;z-index:0;pointer-events:none; }
.hub-bg-grid {
  position:absolute;inset:0;
  background-image: linear-gradient(0deg,transparent calc(100% - 1px),rgba(184,153,71,0.06) 100%), linear-gradient(90deg,transparent calc(100% - 1px),rgba(184,153,71,0.04) 100%);
  background-size:50px 50px;
}
.hub-bg-glow::before,.hub-bg-glow::after { content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%; }
.hub-bg-glow::before { border:1px solid rgba(74,142,139,0.4); animation:hubRipple 4s 1.3s ease-out infinite; }
.hub-bg-glow::after  { border:1px solid rgba(184,153,71,0.3); animation:hubRipple 4s 2.6s ease-out infinite; }
.hub-bg-grid::after  { content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:60px;height:60px;border-radius:50%;border:1px solid rgba(184,153,71,0.5);animation:hubRipple 4s ease-out infinite; }
@keyframes hubRipple { 0% { width:40px;height:40px;opacity:0.6;border-color:rgba(184,153,71,0.4); } 100% { width:100vw;height:100vw;opacity:0;border-color:rgba(184,153,71,0); } }

.screen-hub > *:not(.hub-bg-fx) { position:relative;z-index:1; }

.hub-topbar { display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;flex-shrink:0; }
/* 优化右上角标签，给它一点实体感 */
.hub-title-tag { 
  font-size:0.55rem; color:var(--border-gold); letter-spacing:0.25em; font-family:'Courier New',serif; 
  background: rgba(184,153,71,0.08); padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid rgba(184,153,71,0.2);
}

/* 档案卡片 - 立体化 */
.hub-profile { 
  display:flex; align-items:center; gap:1rem; margin:0 1.5rem 1.5rem; padding:1.2rem; 
  background:var(--bg-panel); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border:1px solid var(--border-brass); border-radius:12px; 
  box-shadow:var(--shadow-card); 
  transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease, border-color 0.4s ease; 
}
.clickable-profile { cursor:pointer; }
.clickable-profile:hover { transform:translateY(-4px) scale(1.01); background:var(--bg-panel-hover); border-color:var(--border-gold); box-shadow:var(--shadow-hover); }

.profile-avatar { width:48px; height:48px; border:2px solid var(--border-gold); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; color:var(--border-gold); background: linear-gradient(135deg, #FFF, #F5F0E6); box-shadow: 0 4px 10px rgba(184,153,71,0.2), inset 0 2px 4px rgba(255,255,255,1); }
.avatar-img { width:100%;height:100%;object-fit:cover;border-radius:50%; }
.profile-info { flex:1; }
.profile-name  { font-size:0.95rem;color:var(--text-main);font-weight:bold;letter-spacing:0.08em; text-shadow: 0 1px 1px rgba(255,255,255,0.8); }
.profile-meta  { font-size:0.75rem;color:var(--text-muted);font-family:'Courier New',serif;margin-top:0.4rem; }
.profile-badge { font-size:0.7rem;color:var(--border-gold);font-family:'Courier New',serif;font-weight:bold; border:1px solid var(--border-gold); padding:0.25rem 0.6rem; border-radius:12px; background:rgba(255,255,255,0.8); box-shadow: inset 0 1px 2px rgba(255,255,255,1); }

/* 数值条 - 凹陷雕刻感 */
.hub-stats-bar { 
  margin:0 1.5rem 1.5rem; padding:1rem 1.2rem; display:flex; gap:1rem; align-items:flex-start; 
  background: rgba(245, 242, 235, 0.6); border:1px solid rgba(212, 196, 168, 0.4); border-radius:12px; 
  box-shadow: var(--shadow-inset); /* 关键：内阴影制造凹陷感 */
}
.hub-stat-item { display:flex;gap:0.8rem;flex:1;align-items:flex-start; }
.hub-stat-icon { font-size:1.1rem;flex-shrink:0; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.load-icon { color:var(--safe-green); }
.res-icon  { color:var(--tech-teal); }
.hub-stat-name  { font-size:0.75rem;color:var(--text-main);font-weight:bold;letter-spacing:0.15em;margin-bottom:0.3rem; }
.hub-stat-desc  { font-size:0.68rem;color:var(--text-muted);line-height:1.8; }
.hub-stat-divider { width:1px; background:linear-gradient(180deg, transparent, var(--border-brass), transparent); align-self:stretch; flex-shrink:0; opacity: 0.6; }

/* 菜单列表 - 悬浮与交互 */
.hub-menu { display:flex;flex-direction:column;gap:0.8rem;padding:0 1.5rem; }
.hub-menu-item { 
  display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem;
  background:var(--bg-panel); backdrop-filter:blur(10px);
  border:1px solid var(--border-brass); border-radius:10px; cursor:pointer; 
  box-shadow: var(--shadow-card);
  transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1); position:relative; overflow:hidden; 
}
/* 呼吸感的高光发光条 */
.hub-menu-item::before { content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg, #E6D5A7, var(--border-gold)); opacity:0; transition:opacity 0.4s; box-shadow: 2px 0 8px rgba(184,153,71,0.4); }
.hub-menu-item:hover   { background:var(--bg-panel-hover); border-color:var(--border-gold); transform:translateX(6px) translateY(-2px); box-shadow:var(--shadow-hover); }
.hub-menu-item:hover::before { opacity:1; }
/* 强调色菜单项 */
.hub-menu-item.primary-item { border-color:rgba(184,153,71,0.6); background:linear-gradient(145deg, #FFF, #FDFBF5); }

.menu-item-left { display:flex;align-items:center;gap:1rem; }
.menu-icon  { font-size:1rem;color:var(--border-gold);width:24px;text-align:center; text-shadow: 0 2px 4px rgba(184,153,71,0.2); }
.menu-title { font-size:0.9rem;color:var(--text-main);font-weight:bold;letter-spacing:0.08em; }
.menu-sub   { font-size:0.7rem;color:var(--text-muted);margin-top:0.3rem; }
.menu-arrow { font-size:0.9rem;color:var(--border-brass); transition: transform 0.3s; }
.hub-menu-item:hover .menu-arrow { transform: translateX(3px); color:var(--border-gold); }

/* 弹窗内的排版样式 */
.diff-guide-modal, .guide-content-modal { 
  display: flex; flex-direction: column; gap: 1rem; width: 100%; 
  padding: 0.5rem 0;
}
.diff-row, .guide-item { display: flex; gap: 1rem; align-items: flex-start; }
.diff-stars { display: flex; gap: 2px; flex-shrink: 0; padding-top: 0.1rem; }
.diff-star  { font-size: 0.75rem; color: #E5DCC5; text-shadow: 0 1px 1px #FFF; }
.diff-star.lit { color: var(--border-gold); text-shadow: 0 1px 4px rgba(184,153,71,0.4); }
.diff-name  { font-size: 0.85rem; color: var(--text-main); font-weight: bold; margin-bottom: 0.3rem; }
.diff-desc, .guide-text { font-size: 0.75rem; color: var(--text-muted); line-height: 1.8; }
.guide-num { 
  font-size: 0.75rem; color: var(--border-gold); font-family: 'Courier New', serif; font-weight: bold; 
  flex-shrink: 0; background: rgba(184,153,71,0.1); border: 1px solid rgba(184,153,71,0.3);
  padding: 2px 8px; border-radius: 4px; box-shadow: inset 0 1px 2px #FFF;
}



.hub-footer { padding:2rem 1.5rem;text-align:center;margin-top:auto; }
.hub-footer-text { font-size:0.7rem;color:var(--text-muted);letter-spacing:0.3em; opacity: 0.7; }


/* ============================================================
   07. 剧本选择页
============================================================ */
.screen-select { background:var(--bg-paper);padding:0;overflow-y:auto;display:flex;flex-direction:column;align-items:center;position:relative; }

.screen-select::before {
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(0deg,transparent calc(100% - 1px),rgba(184,153,71,0.08) 100%),
    linear-gradient(90deg,transparent calc(100% - 1px),rgba(184,153,71,0.06) 100%);
  background-size:40px 40px;
  animation:gridPulse 6s ease-in-out infinite alternate;
}
.screen-select::after {
  content:'';position:fixed;left:0;right:0;height:2px;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,transparent 0%,rgba(74,142,139,0) 10%,rgba(74,142,139,0.6) 30%,rgba(184,153,71,0.8) 50%,rgba(74,142,139,0.6) 70%,rgba(74,142,139,0) 90%,transparent 100%);
  animation:signalScan 5s cubic-bezier(0.4,0,0.6,1) infinite;
}
@keyframes gridPulse  { 0%{opacity:0.6} 100%{opacity:1} }
@keyframes signalScan { 0%{top:-2px;opacity:0} 5%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0} }

.screen-select > * { position:relative;z-index:2; }

.select-header { text-align:center;padding:0.5rem 1.5rem 0.5rem;flex-shrink:0;width:100%; }
.select-title  { font-size:1.3rem;color:var(--text-main);font-weight:bold;letter-spacing:0.2em;margin-bottom:0.2rem; }
.select-sub    { font-size:0.8rem;color:var(--text-muted);letter-spacing:0.1em; }

.scripts-loading { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem;width:100%;position:relative; }
.loading-dots { display:flex;gap:6px;justify-content:center; }
.loading-dots span { display:block;width:6px;height:6px;border-radius:50%;background:var(--border-gold);animation:dotBounce 1.2s infinite ease-in-out; }
.loading-dots span:nth-child(2) { animation-delay:0.2s; }
.loading-dots span:nth-child(3) { animation-delay:0.4s; }
@keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.3} 50%{transform:translateY(-6px);opacity:1} }
.loading-text { font-size:0.75rem;color:var(--border-gold);letter-spacing:0.1em;font-weight:bold; }

.scripts-grid { display:flex;flex-direction:column;gap:0.7rem;width:100%;max-width:500px;padding:0 1.2rem;flex:1; }

.script-card { background:var(--bg-panel);border:1px solid var(--border-brass);border-radius:6px;padding:0.7rem 1rem;cursor:pointer;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),border-color 0.3s,box-shadow 0.3s,background 0.3s;display:flex;flex-direction:column;gap:0.3rem;box-shadow:var(--shadow-card); }
.script-card:hover { border-color:var(--border-gold);background:#FFF;transform:translateY(-2px) translateX(2px);box-shadow:var(--shadow-hover); }

.card-difficulty { display:flex;gap:3px; }
.star { font-size:0.65rem;color:rgba(184,153,71,0.25); }
.star.filled { color:var(--border-gold); }
.card-name    { font-size:1.3rem;color:var(--text-main);font-weight:bold; }
.card-meta    { font-size:0.8rem;color:var(--text-muted);display:flex;gap:0.2rem; }
.dot { opacity:0.4; }
.card-divider { height:1.2px;background:linear-gradient(90deg,transparent,var(--border-brass),transparent);margin:0; }
.card-preview { font-size:0.8rem;color:var(--tech-teal);font-style:italic;line-height:1.7;border-left:2px solid var(--border-brass);padding-left:0.6rem; }
.card-enter   { font-size:0.65rem;color:var(--border-brass);letter-spacing:0.1em;text-align:right;opacity:0;transition:opacity 0.2s,color 0.3s; }
.script-card:hover .card-enter { color:var(--border-gold);font-weight:bold;opacity:1; }

.script-card-loading { align-items:center;justify-content:center;min-height:120px;cursor:default; }
.script-card-loading:hover { transform:none;border-color:var(--border-brass);background:var(--bg-panel);box-shadow:var(--shadow-card); }
.card-loading-text { font-size:0.68rem;color:var(--border-gold);letter-spacing:0.1em;margin-top:0.5rem; }

.select-footer { width:100%;max-width:500px;padding:3rem 1.5rem 0.8rem;display:flex;justify-content:center;flex-shrink:0; }
.refresh-btn { padding:0.5rem 1.4rem;background:transparent;border:1px dashed var(--border-brass);border-radius:3px;color:var(--text-muted);font-family:inherit;font-size:0.78rem;letter-spacing:0.1em;cursor:pointer;transition:all 0.3s; }
.refresh-btn:hover { border-style:solid;border-color:var(--border-gold);color:var(--border-gold);background:rgba(255,255,255,0.5);transform:translateY(-1px); }

/* ============================================================
   08. 道具选择弹窗
============================================================ */
.item-select-overlay { align-items:flex-end;padding:0 0.8rem; }
.item-select-box { background:var(--bg-paper);border:1px solid var(--border-gold);border-radius:10px 10px 0 0;padding:1.5rem 1.5rem 2rem;width:100%;max-width:500px;margin:0 auto;max-height:85vh;overflow-y:auto;display:flex;flex-direction:column;gap:1rem;box-shadow:0 -8px 30px rgba(60,53,45,0.1); }

.is-title   { font-size:1.1rem;color:var(--text-main);font-weight:bold;letter-spacing:0.2em;text-align:center; }
.is-sub     { font-size:0.68rem;color:var(--text-muted);text-align:center; }
.is-section { display:flex;flex-direction:column;gap:0.5rem; }
.is-section-label { font-size:0.62rem;color:var(--border-gold);border-bottom:1px solid var(--border-brass);padding-bottom:0.3rem;letter-spacing:0.15em; }
.is-permanent-row { display:flex;flex-wrap:wrap;gap:0.4rem; }
.is-permanent-chip { font-size:0.65rem;color:var(--text-main);background:rgba(255,255,255,0.8);border:1px solid var(--border-brass);padding:0.25rem 0.6rem;border-radius:3px; }
.is-consumable-grid { display:flex;flex-direction:column;gap:0.5rem; }
.is-item-card { background:rgba(255,255,255,0.4);border:1px solid var(--border-brass);border-radius:4px;padding:0.7rem 1rem;cursor:pointer;transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1);position:relative; }
.is-item-card:hover:not(.is-maxed) { border-color:var(--border-gold);background:#FFF;transform:translateX(3px); }
.is-item-card.is-selected { border-color:var(--tech-teal);background:rgba(74,142,139,0.05); }
.is-item-card.is-maxed    { opacity:0.35;cursor:not-allowed; }
.is-item-name  { font-size:0.88rem;color:var(--text-main);font-weight:bold; }
.is-item-count { font-size:0.6rem;color:var(--tech-teal);margin:0.15rem 0; }
.is-item-desc  { font-size:0.68rem;color:var(--text-muted);line-height:1.6; }
.is-check      { font-size:0.9rem;color:var(--tech-teal);position:absolute;right:0.8rem;top:0.5rem; }
.is-empty-hint { border:1px dashed var(--border-brass);color:var(--text-muted);padding:1.5rem;border-radius:4px;text-align:center;font-size:0.75rem;line-height:2; }
.is-actions { display:flex;gap:0.8rem;margin-top:0.5rem; }
.is-actions .btn-primary,.is-actions .btn-secondary { flex:1;text-align:center; }

/* ============================================================
   09. 梦境主界面
============================================================ */
.screen-dream { background:var(--bg-paper);display:flex;flex-direction:column;padding:0.7rem 0.7rem 0.5rem;gap:0.6rem;overflow:hidden; }

.dream-topbar { display:flex;align-items:center;justify-content:space-between;flex-shrink:0; }
.dream-back-btn { padding:0.4rem 0.9rem;background:transparent;border:1px solid var(--border-brass);border-radius:3px;color:var(--text-muted);font-family:inherit;font-size:0.78rem;letter-spacing:0.1em;cursor:pointer;transition:all 0.2s; }
.dream-back-btn:hover { border-color:var(--border-gold);color:var(--text-main);background:#FFF; }

.dream-round-info { font-size:0.78rem;color:var(--text-muted);letter-spacing:0.1em; }
.round-n { color:var(--text-main);font-size:1rem;font-weight:bold;font-family:'Courier New',monospace; }
.round-t { color:var(--text-muted);font-family:'Courier New',monospace; }
.round-sep { color:var(--border-brass);margin:0 0.2rem; }

.dream-main { flex:1;min-height:0;display:flex; }

.dream-frame { flex:1;display:flex;flex-direction:column;border:1px solid var(--border-brass);border-radius:6px;background:#FFF;min-height:0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05),inset 0 0 20px rgba(212,196,168,0.2);position:relative; }

.dream-frame::before {
  content:'';position:absolute;inset:0;z-index:0;pointer-events:none;
  animation:frameLightDrift 12s ease-in-out infinite alternate;
}
.dream-frame::after {
  content:'';position:absolute;top:0;left:-100%;width:40%;height:100%;z-index:0;pointer-events:none;
  background:linear-gradient(105deg,transparent 0%,rgba(255,248,230,0.15) 40%,rgba(255,248,230,0.25) 50%,rgba(255,248,230,0.15) 60%,transparent 100%);
  animation:curtainLight 18s ease-in-out infinite;
}
@keyframes frameLightDrift {
  0%   { background:radial-gradient(ellipse 60% 40% at 20% 30%,rgba(184,153,71,0.05) 0%,transparent 70%),radial-gradient(ellipse 50% 35% at 80% 70%,rgba(74,142,139,0.04) 0%,transparent 70%); }
  50%  { background:radial-gradient(ellipse 50% 50% at 50% 50%,rgba(184,153,71,0.03) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 85% 25%,rgba(74,142,139,0.05) 0%,transparent 70%); }
  100% { background:radial-gradient(ellipse 45% 55% at 15% 75%,rgba(74,142,139,0.04) 0%,transparent 70%),radial-gradient(ellipse 65% 35% at 75% 40%,rgba(184,153,71,0.05) 0%,transparent 70%); }
}
@keyframes curtainLight { 0%{left:-60%;opacity:0} 8%{opacity:1} 40%{left:130%;opacity:1} 48%{opacity:0} 100%{left:130%;opacity:0} }

.frame-header { display:flex;align-items:center;justify-content:center;gap:0.8rem;padding:0.5rem 1rem;background:rgba(212,196,168,0.15);border-bottom:1px solid var(--border-brass);flex-shrink:0; }
.frame-title  { font-size:0.65rem;color:var(--border-gold);letter-spacing:0.4em;font-weight:bold;font-family:'Courier New',monospace; }
.frame-orn    { font-size:0.35rem;color:var(--border-brass); }

.history-toggle { display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.6rem;background:rgba(249,246,240,0.95);border:none;border-bottom:1px dashed var(--border-brass);cursor:pointer;color:var(--text-muted);font-family:inherit;font-size:0.72rem;letter-spacing:0.1em;transition:all 0.2s;position:sticky;top:0;z-index:6;width:100%;flex-shrink:0;backdrop-filter:blur(4px); }
.history-toggle:hover { color:var(--border-gold);background:#FFF; }
.toggle-icon { font-size:0.7rem;color:var(--border-gold); }
.toggle-text { opacity:0.7; }

.frame-content { flex:1;overflow-y:auto;padding:1rem 1.2rem;display:flex;flex-direction:column;gap:1.2rem;position:relative;z-index:1; }
.frame-content::-webkit-scrollbar       { width:4px; }
.frame-content::-webkit-scrollbar-thumb { background:var(--border-brass);border-radius:2px; }

.history-section { display:flex;flex-direction:column;gap:0; }
.history-list    { display:flex;flex-direction:column;gap:1.2rem;padding-bottom:1rem; }
.history-divider { display:flex;align-items:center;gap:0.8rem;padding:0.5rem 0;margin-bottom:0.8rem; }
.hd-line { flex:1;height:1px;background:var(--border-brass);opacity:0.4; }
.hd-text { font-size:0.58rem;color:var(--text-muted);letter-spacing:0.2em;white-space:nowrap;font-family:'Courier New',monospace; }

.para-narrative p  { font-size:0.9rem;line-height:2.2;color:#7A7065;letter-spacing:0.05em;text-indent:2em;margin:0 0 0.38rem 0; }
.para-current      { display:flex;flex-direction:column;gap:0.7rem; }
.para-current p    { font-size:1.05rem;line-height:2.3;color:var(--text-main);font-weight:500;letter-spacing:0.05em;text-indent:2em;margin:0; }
.para-inner        { font-size:0.88rem;color:var(--tech-teal);font-style:italic;line-height:1.9;padding:0.5rem 1rem;border-left:2px solid var(--tech-teal-dim);border-radius:0 3px 3px 0; }
.current-inner     { border-left-color:var(--tech-teal);background:rgba(74,142,139,0.05); }
.para-choice       { font-size:0.82rem;color:var(--text-muted);display:flex;align-items:flex-start;gap:0.5rem;letter-spacing:0.06em; }
.choice-arrow      { color:var(--border-gold);flex-shrink:0; }
.para-system       { font-size:0.72rem;color:var(--border-gold);text-align:center;letter-spacing:0.2em;padding:0.3rem 0; }

.frame-status { display:flex;align-items:center;gap:1rem;padding:0.6rem 1.2rem;border-top:1px solid var(--border-brass);background:#F9F6F0;flex-shrink:0; }
.fstat-item   { display:flex;align-items:center;gap:0.6rem;flex:1; }
.fstat-label  { font-size:0.72rem;color:var(--text-main);font-weight:bold;white-space:nowrap;flex-shrink:0;letter-spacing:0.08em; }
.fstat-track  { flex:1;height:6px;background:rgba(60,53,45,0.08);border:1px solid var(--border-brass);border-radius:3px;overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),inset 0 0 0 1px rgba(255,255,255,0.5); }
.fstat-fill   { height:100%;border-radius:2px; }

.fill-load {
  background:linear-gradient(90deg,var(--safe-green) 0%,#8ab85a 50%,var(--safe-green) 100%);
  background-size:200% 100%;
  transition:width 0.6s cubic-bezier(0.4,0,0.2,1);
  animation:loadFlow 3s linear infinite;
  position:relative;overflow:hidden;
}
.fill-load::after { content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);animation:loadShimmer 2.5s ease-in-out infinite; }
@keyframes loadFlow    { 0%{background-position:0% 0%}    100%{background-position:200% 0%} }
@keyframes loadShimmer { 0%{left:-100%} 60%{left:120%}   100%{left:120%} }

.fill-load.danger {
  background:linear-gradient(90deg,#8a2020 0%,var(--alert-red) 40%,#e05050 60%,var(--alert-red) 100%);
  background-size:200% 100%;
  animation:loadFlow 1.5s linear infinite, dangerGlow 0.8s ease-in-out infinite alternate;
}
@keyframes dangerGlow {
  0%   { box-shadow:0 0 4px rgba(181,74,74,0.3);  filter:brightness(1); }
  100% { box-shadow:0 0 16px rgba(181,74,74,0.8); filter:brightness(1.2); }
}

.fill-resonance {
  position:relative;overflow:hidden;
  background:linear-gradient(90deg,#2a7a78 0%,var(--tech-teal) 40%,#6abfbc 70%,var(--tech-teal) 100%);
  background-size:200% 100%;
  transition:width 0.6s cubic-bezier(0.4,0,0.2,1);
  animation:resFlow 4s linear infinite;
}
.fill-resonance::after { content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent);animation:resShimmer 3s ease-in-out infinite; }
@keyframes resFlow    { 0%{background-position:0% 0%}   100%{background-position:200% 0%} }
@keyframes resShimmer { 0%{left:-100%} 70%{left:120%}   100%{left:120%} }

.fill-resonance.full {
  background:linear-gradient(90deg,#8a6a20 0%,var(--border-gold) 40%,#d4a840 70%,var(--border-gold) 100%);
  background-size:200% 100%;
  animation:resFlow 1.2s linear infinite, resFull 0.8s ease-in-out infinite alternate;
}
.fill-resonance.full::after { background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent);animation:resShimmer 1s ease-in-out infinite; }
@keyframes resFull { 0%{box-shadow:0 0 6px rgba(184,153,71,0.4);filter:brightness(1)} 100%{box-shadow:0 0 16px rgba(184,153,71,0.8),0 0 28px rgba(184,153,71,0.3);filter:brightness(1.2)} }

.fstat-num         { font-size:0.78rem;color:var(--text-main);font-family:'Courier New',monospace;font-weight:bold;white-space:nowrap;flex-shrink:0; }
.fstat-num.danger  { color:var(--alert-red);animation:numBlink 1s ease-in-out infinite alternate; }
@keyframes numBlink { 0%{opacity:1} 100%{opacity:0.4} }
.fstat-divider { width:1px;height:16px;background:var(--border-brass);flex-shrink:0; }

.dream-loading { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;padding:0.6rem;flex-shrink:0; }
.loading-wave  { display:flex;align-items:flex-end;gap:3px;height:20px; }
.loading-wave span { display:block;width:3px;border-radius:3px;background:linear-gradient(180deg,var(--border-gold),rgba(184,153,71,0.2));box-shadow:0 0 6px rgba(184,153,71,0.3);animation:wavePulse 1.2s cubic-bezier(0.4,0,0.6,1) infinite; }
.loading-wave span:nth-child(1){animation-delay:0s}
.loading-wave span:nth-child(2){animation-delay:0.1s}
.loading-wave span:nth-child(3){animation-delay:0.2s}
.loading-wave span:nth-child(4){animation-delay:0.3s}
.loading-wave span:nth-child(5){animation-delay:0.4s}
@keyframes wavePulse { 0%,100%{height:4px;opacity:0.3;box-shadow:none} 50%{height:20px;opacity:1;box-shadow:0 0 10px rgba(184,153,71,0.5)} }
.loading-text-row { font-size:0.65rem;color:var(--border-gold);letter-spacing:0.35em;animation:breathe 3s ease-in-out infinite; }
@keyframes breathe { 0%,100%{opacity:0.4;letter-spacing:0.3em} 50%{opacity:0.9;letter-spacing:0.4em} }

.must-evacuate-banner { background:#FFF;border:1px solid var(--border-gold);border-radius:6px;padding:0.8rem 1rem;display:flex;flex-direction:column;align-items:center;gap:0.6rem;animation:evacuatePulse 1.5s ease-in-out infinite alternate; }
@keyframes evacuatePulse { 0%{border-color:rgba(184,153,71,0.4)} 100%{border-color:var(--border-gold);box-shadow:0 4px 20px rgba(184,153,71,0.2)} }

.dying-banner { background:#FFF;border:1px solid var(--alert-red);border-radius:6px;padding:0.8rem 1rem;display:flex;flex-direction:column;align-items:center;gap:0.6rem;animation:dyingPulse 1s ease-in-out infinite alternate; }
@keyframes dyingPulse { 0%{border-color:rgba(181,74,74,0.4)} 100%{border-color:var(--alert-red);box-shadow:0 4px 20px rgba(181,74,74,0.15)} }

.evacuate-icon { color:var(--border-gold);font-size:1.2rem;animation:iconBlink 0.8s ease-in-out infinite alternate; }
.dying-icon    { color:var(--alert-red);font-size:1.2rem;animation:iconBlink 0.6s ease-in-out infinite alternate; }
@keyframes iconBlink { 0%{opacity:0.5} 100%{opacity:1} }

.evacuate-msg,.dying-msg { font-size:0.9rem;letter-spacing:0.15em;text-align:center;display:flex;flex-direction:column;gap:0.3rem;font-weight:bold; }
.evacuate-msg { color:var(--text-main); }
.dying-msg    { color:var(--alert-red); }
.evacuate-sub,.dying-sub { font-size:0.65rem;letter-spacing:0.1em;font-weight:normal; }
.evacuate-sub { color:var(--text-muted); }
.dying-sub    { color:rgba(181,74,74,0.8); }
.dying-countdown { font-size:1.1rem;color:var(--alert-red);font-family:'Courier New',monospace;font-weight:bold;animation:numBlink 0.6s ease-in-out infinite alternate; }

.btn-evacuate-now { padding:0.55rem 2rem;border:1px solid var(--border-gold);border-radius:3px;font-family:inherit;font-size:0.88rem;font-weight:bold;letter-spacing:0.2em;cursor:pointer;background:#FFF;color:var(--border-gold);transition:all 0.2s; }
.btn-evacuate-now:hover { background:var(--border-gold);color:#FFF;transform:translateY(-1px); }
.btn-evacuate-now.dying-evacuate { border-color:var(--alert-red);color:var(--alert-red); }
.btn-evacuate-now.dying-evacuate:hover { background:var(--alert-red);color:#FFF; }

.dream-bottom-panel { flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;max-height:38vh;background:#FFF;border:1px solid var(--border-brass);border-radius:6px; }
.panel-tabs { display:flex;position:relative;border-bottom:1px solid var(--border-brass);flex-shrink:0;background:rgba(249,246,240,0.6); }
.panel-tab  { flex:1;padding:0.4rem 0;background:transparent;border:none;color:var(--text-muted);font-family:inherit;font-size:0.7rem;font-weight:bold;letter-spacing:0.1em;cursor:pointer;transition:color 0.2s;display:flex;align-items:center;justify-content:center;gap:0.3rem; }
.panel-tab.active { color:var(--border-gold); }
.tab-icon   { font-size:0.55rem;opacity:0.7; }
.tab-indicator { position:absolute;bottom:0;left:0;width:50%;height:2px;background:var(--border-gold);transition:transform 0.25s ease; }
.tab-indicator.right { transform:translateX(100%); }

.panel-slide { overflow-y:auto;padding:0.5rem 0.8rem;display:flex;flex-direction:column;gap:0.4rem;max-height:calc(38vh - 36px); }
.panel-slide::-webkit-scrollbar       { width:3px; }
.panel-slide::-webkit-scrollbar-thumb { background:var(--border-brass);border-radius:2px; }

.choices-waiting { font-size:0.68rem;color:var(--text-muted);letter-spacing:0.1em;text-align:center;padding:0.8rem; }
.panel-actions   { display:flex;gap:0.6rem;justify-content:flex-end;flex-shrink:0;padding-top:0.3rem;border-top:1px dashed var(--border-brass); }

.tools-scroll-area { overflow-x:auto;overflow-y:hidden;padding-bottom:0.5rem; }
.tools-scroll-area::-webkit-scrollbar { height:2px; }
.tools-scroll-area::-webkit-scrollbar-thumb { background:var(--border-brass);border-radius:1px; }
.tools-row { display:flex;gap:0.8rem;min-width:max-content;padding:0 0.5rem; }

.tool-slot-h { width:76px;height:90px;flex-shrink:0;background:rgba(249,246,240,0.5);border:1px dashed var(--border-brass);border-radius:4px;padding:0.8rem 0.4rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.4rem;cursor:pointer;transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),border-color 0.2s,background 0.2s; }
.tool-slot-h:hover:not(.empty) { border-style:solid;border-color:var(--border-gold);background:#FFF;transform:translateY(-3px); }
.tool-slot-h.active { border-style:solid;border-color:var(--tech-teal);background:rgba(74,142,139,0.05); }
.tool-slot-h.empty  { opacity:0.35;cursor:default; }
.tool-icon-h { width:32px;height:32px;border:1px solid var(--border-gold);border-radius:50%;background:#FFF;display:flex;align-items:center;justify-content:center;font-size:0.9rem;color:var(--border-gold); }
.tool-name-h { font-size:0.65rem;color:var(--text-main);font-weight:bold;text-align:center;line-height:1.2; }
.tool-count  { font-size:0.55rem;color:#FFF;background:var(--border-gold);padding:0.1rem 0.4rem;border-radius:10px;font-family:'Courier New',monospace; }

.staged-item-bar   { background:rgba(74,142,139,0.08);border:1px solid var(--tech-teal);padding:0.5rem 0.8rem;border-radius:4px;display:flex;justify-content:space-between;align-items:center;margin-bottom:0.8rem; }
.staged-text       { font-size:0.75rem;color:var(--tech-teal);font-weight:bold; }
.cancel-item-btn   { background:transparent;border:none;color:var(--alert-red);font-size:0.7rem;cursor:pointer;text-decoration:underline; }
.active-item-desc  { margin-top:1rem;padding:0.8rem;background:#FFF;border:1px solid var(--border-brass);border-radius:4px;border-left:3px solid var(--tech-teal); }

.permanent-tool-section { display:flex;flex-direction:column;gap:0.4rem;padding:0.5rem 0 0;border-top:1px dashed var(--border-brass);margin-top:0.3rem; }
.permanent-tool-label   { font-size:0.58rem;color:var(--text-muted);letter-spacing:0.2em; }
.permanent-tool-row     { display:flex;flex-wrap:wrap;gap:0.4rem; }
.permanent-chip         { background:#FFF;border:1px solid var(--border-brass);color:var(--text-main);padding:0.3rem 0.7rem;border-radius:12px;font-size:0.65rem;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:0.3rem; }
.permanent-chip:hover   { border-color:var(--border-gold);background:rgba(184,153,71,0.05); }
.permanent-chip.expanded { border-color:var(--border-gold);background:rgba(184,153,71,0.05); }
.permanent-chip-name  { font-size:0.65rem;color:var(--text-muted); }
.permanent-chip-arrow { font-size:0.5rem;color:var(--border-brass); }
.permanent-desc-box   { background:#FFF;border:1px solid var(--border-brass);border-radius:4px;padding:0.6rem 0.8rem;display:flex;flex-direction:column;gap:0.3rem; }
.permanent-desc-name  { font-size:0.7rem;color:var(--border-gold);letter-spacing:0.08em;font-weight:bold; }
.permanent-desc-text  { font-size:0.63rem;color:var(--text-muted);line-height:1.7; }

.btn-watch,.btn-insight,.btn-save,.btn-escape { padding:0.35rem 0.8rem;background:transparent;border:1px solid var(--border-brass);border-radius:3px;color:var(--text-muted);font-family:inherit;font-size:0.7rem;cursor:pointer;transition:all 0.2s; }
.btn-watch:hover,.btn-insight:hover,.btn-save:hover { border-color:var(--border-gold);color:var(--border-gold);background:#FFF;transform:translateY(-1px); }
.btn-escape:hover { border-color:var(--alert-red);color:var(--alert-red);transform:translateY(-1px); }

.insight-hint-bar { font-size:0.68rem;color:var(--tech-teal);background:rgba(74,142,139,0.06);border:1px solid rgba(74,142,139,0.25);border-radius:4px;padding:0.4rem 0.8rem;letter-spacing:0.08em;line-height:1.6; }

/* ============================================================
   10. 逃脱面板
============================================================ */
.dream-choices  { flex-shrink:0;padding:0 0.2rem 0.2rem; }
.escape-result  { font-size:0.88rem;color:var(--tech-teal);letter-spacing:0.1em;text-align:center;padding:0.5rem;font-weight:bold; }
.escape-actions { display:flex;gap:0.8rem;justify-content:center;align-items:center;margin-top:0.5rem; }

/* ============================================================
   11. 结算页 (立体加载与电影级文字升起)
============================================================ */
.screen-settlement {
  background: radial-gradient(ellipse at 50% 30%, rgba(184,153,71,0.06) 0%, transparent 55%), var(--bg-paper);
  align-items: center; justify-content: center; padding: 1.2rem; overflow: hidden;
}

/* 呼吸页大容器 */
.breath-screen { 
  width: 100%; max-width: 520px; padding: 2rem 1.5rem; 
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 60vh;
}

/* --- 立体加载动画 --- */
.breath-loading {
  display: flex; flex-direction: column; align-items: center; gap: 2rem;
}
.cube-loader {
  display: flex; gap: 16px; align-items: center;
}
/* 晶体方块的立体质感 */
.cube {
  width: 12px; height: 12px;
  background: linear-gradient(135deg, var(--border-gold), #E6D5A7);
  box-shadow: 0 4px 10px rgba(184,153,71,0.3), inset 0 2px 2px rgba(255,255,255,0.9);
  border-radius: 2px;
  transform: rotate(45deg);
  animation: cubeFloat 1.5s ease-in-out infinite alternate;
}
.cube1 { animation-delay: 0s; }
.cube2 { animation-delay: 0.3s; transform: rotate(45deg) scale(1.2); } /* 中间稍大 */
.cube3 { animation-delay: 0.6s; }

@keyframes cubeFloat {
  0% { transform: rotate(45deg) translateY(0) scale(1); opacity: 0.4; box-shadow: 0 2px 4px rgba(184,153,71,0.1); }
  100% { transform: rotate(45deg) translateY(-10px) scale(1.1); opacity: 1; box-shadow: 0 10px 20px rgba(184,153,71,0.6); }
}

.loading-text { 
  font-size: 0.75rem; color: var(--border-gold); letter-spacing: 0.4em; 
  animation: pulseOpacity 2.5s infinite alternate; font-family: 'Courier New', monospace;
}
@keyframes pulseOpacity { 0% { opacity: 0.3; } 100% { opacity: 0.9; } }

/* --- 文本排版与逐段升起动画 --- */
.breath-text-container {
  width: 100%; text-align: left; /* 关键：左对齐 */
  padding: 1rem 0;
}
.breath-para {
  font-size: 0.95rem; color: var(--text-main); line-height: 2.6; letter-spacing: 0.1em;
  margin: 0 0 1.5rem 0;
  text-indent: 2em; /* 首行缩进，更具文学感 */
  opacity: 0; /* 初始完全透明 */
  /* forwards 保证动画结束后保持在 100% 的状态 */
  animation: textRise 1.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}
.breath-para:last-child { margin-bottom: 0; }

@keyframes textRise {
  0% { opacity: 0; transform: translateY(25px); filter: blur(6px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* 按钮样式保持原样 */
.breath-dismiss-btn { 
  margin-top: 3rem; padding: 0.7rem 2.5rem; background: rgba(255, 255, 255, 0.5); 
  border: 1px solid var(--border-gold); border-radius: 4px; color: var(--border-gold); 
  font-family: inherit; font-size: 0.85rem; letter-spacing: 0.2em; cursor: pointer; 
  transition: all 0.3s; display: block; box-shadow: 0 4px 12px rgba(184, 153, 71, 0.1);
}
.breath-dismiss-btn:hover { background: #FFF; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(184, 153, 71, 0.2); }
/* ============================================================
   11.5 结算报告卡片 (电影级谢幕 / 高级档案卷宗质感)
============================================================ */
/* 增加背景的压迫感，让中心的报告卡片像聚光灯下一样亮起 */
.screen-settlement .pause-overlay {
  background: rgba(15, 12, 10, 0.85); 
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}

.settlement-card {
  /* 纯净的复古纸张底色，拒绝廉价的半透明 */
  background: #FDFBF7; 
  /* 极细的外边框 + 内部4px距离的极细内边框，形成双线画框效果 */
  border: 1px solid rgba(184, 153, 71, 0.5);
  border-radius: 2px; /* 锐利的边角，显得极其专业和严肃 */
  padding: 3rem 2.5rem 2.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 0 4px rgba(184, 153, 71, 0.15);
  
  width: 100%; max-width: 460px; max-height: 88vh;
  overflow-y: auto; overflow-x: hidden;
  display: flex; flex-direction: column; align-items: center;
  scrollbar-width: none; -ms-overflow-style: none;
  position: relative;
}
.settlement-card::-webkit-scrollbar { display: none; }

/* --- 顶部：谢幕标题 --- */
.settle-orn { font-size: 0.8rem; color: var(--border-gold); margin-bottom: 0.5rem; opacity: 0.8; }
.settle-result-label { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.8em; text-transform: uppercase; margin-bottom: 1rem; margin-right: -0.8em; }
.settle-result-name { 
  font-size: 2.8rem; color: var(--border-gold); 
  font-family: 'Noto Serif SC', 'KaiTi', serif; /* 强制使用优雅的衬线体 */
  font-weight: normal; letter-spacing: 0.25em; margin: 0 0 1rem 0; margin-right: -0.25em;
  text-shadow: 0 2px 12px rgba(184, 153, 71, 0.2);
}
/* 短小精悍的印金分割线 */
.settle-divider { width: 40px; height: 1px; background: var(--border-gold); margin: 0.5rem 0 2rem 0; opacity: 0.5; }

/* --- 中间：十字阵列数值区 --- */
.settle-stats { 
  width: 100%; 
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; 
  padding: 1.5rem 0; margin-bottom: 2rem;
  /* 上下加虚线，形成报表感 */
  border-top: 1px dashed rgba(184, 153, 71, 0.3);
  border-bottom: 1px dashed rgba(184, 153, 71, 0.3);
}
.settle-row { 
  display: flex; 
  flex-direction: column-reverse; /* 神来之笔：把数值翻转到上面，标签在下面 */
  align-items: center; gap: 0.5rem; 
}
.sr { font-size: 1.6rem; color: var(--text-main); font-family: 'Courier New', monospace; line-height: 1; }
.sl { font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.15em; }

/* --- 下方：档案文字叙事区 --- */
/* 去掉所有背景灰块，让文字自由呼吸 */
.patient-future { width: 100%; padding: 0 0.5rem; margin-bottom: 1.5rem; }
.pf-label { 
  font-size: 0.7rem; color: var(--border-gold); letter-spacing: 0.6em; margin-right: -0.6em;
  display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;
}
/* 标签两侧的延伸细线 */
.pf-label::before, .pf-label::after {
  content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(184,153,71,0.4), transparent); margin: 0 15px;
}
.pf-scroll { max-height: 25vh; overflow-y: auto; padding-right: 0.5rem; }
.pf-scroll::-webkit-scrollbar { width: 2px; }
.pf-scroll::-webkit-scrollbar-thumb { background: rgba(184, 153, 71, 0.3); }

.pf-text { 
  font-size: 0.88rem; color: var(--text-main); line-height: 2.2; 
  letter-spacing: 0.08em; text-indent: 2em; text-align: justify; margin-bottom: 1rem;
}
.pf-text:last-child { margin-bottom: 0; }

/* --- 底部：优雅的按钮 --- */
.settle-actions { display: flex; gap: 1.5rem; justify-content: center; width: 100%; margin-top: 1rem; }
.settle-actions button { min-width: 130px; padding: 0.8rem 1.5rem; font-size: 0.75rem; letter-spacing: 0.2em; }

/* ============================================================
   12. 档案页 & 患者手册
============================================================ */
.screen-profile { background:var(--bg-paper);display:flex;flex-direction:column;align-items:center;overflow:hidden; }
.profile-scroll-container { flex:1;overflow-y:auto;padding:1rem 1.5rem 3rem;display:flex;flex-direction:column;gap:1.2rem;max-width:500px;margin:0 auto;width:100%; }
.profile-scroll-container::-webkit-scrollbar       { width:3px; }
.profile-scroll-container::-webkit-scrollbar-thumb { background:var(--border-brass); }

.section-title { font-size:0.65rem;color:var(--border-gold);font-weight:bold;letter-spacing:0.2em;border-bottom:1px solid var(--border-brass);padding-bottom:0.3rem;margin-top:1rem; }

.profile-header-card { background:#FFF;border:1px solid var(--border-brass);border-radius:8px;padding:1.5rem;box-shadow:0 4px 15px rgba(0,0,0,0.03); }
.header-top-row { display:flex;align-items:center;gap:1.5rem;margin-bottom:0.5rem; }
.avatar-edit-container { position:relative;cursor:pointer;border-radius:50%;flex-shrink:0; }
.big-avatar   { width:64px;height:64px;font-size:1.8rem;display:flex;align-items:center;justify-content:center;border:2px solid var(--border-gold);background:rgba(184,153,71,0.1);border-radius:50%;overflow:hidden;transition:all 0.3s;color:var(--border-gold); }
.avatar-edit-container:hover .big-avatar { filter:brightness(0.85); }
.edit-hint { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#FFF;opacity:0;transition:opacity 0.3s;pointer-events:none;background:rgba(0,0,0,0.4);border-radius:50%;z-index:10; }
.avatar-edit-container:hover .edit-hint { opacity:1; }
.name-edit-row { flex:1;display:flex;flex-direction:column;gap:0.2rem;min-width:0; }
.name-input { background:transparent;border:none;border-bottom:1px dashed var(--border-brass);color:var(--text-main);font-size:1.5rem;font-weight:bold;font-family:inherit;letter-spacing:0.1em;padding:0.2rem 0;outline:none;width:100%;transition:border-color 0.3s; }
.name-input:focus { border-bottom-color:var(--border-gold); }

.level-progress-bar { height:4px;background:rgba(184,153,71,0.15);border-radius:2px;overflow:hidden;margin-bottom:0.4rem; }
.lp-fill { height:100%;background:var(--border-gold);transition:width 0.5s ease-out; }
.lp-text { font-size:0.6rem;color:var(--text-muted);text-align:right;font-weight:bold;font-family:'Courier New',monospace; }

.stats-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:0.8rem; }
.stat-box   { background:#FFF;border:1px solid var(--border-brass);padding:0.8rem;border-radius:6px;text-align:center;transition:all 0.2s; }
.stat-box:hover { border-color:var(--border-gold);transform:translateY(-2px);box-shadow:0 4px 10px rgba(184,153,71,0.1); }
.s-label { font-size:0.6rem;color:var(--text-muted);margin-bottom:0.4rem; }
.s-val   { font-size:1.2rem;color:var(--text-main);font-family:'Courier New',monospace;font-weight:bold; }
.s-sub   { font-size:0.5rem;color:var(--tech-teal); }

.stars-record { display:flex;flex-direction:column;gap:0.4rem;background:rgba(255,255,255,0.6);padding:1rem;border-radius:6px;border:1px dashed var(--border-brass); }
.star-row     { display:flex;align-items:center;gap:0.8rem; }
.sr-stars     { width:60px;font-size:0.6rem;color:var(--border-gold);text-align:right; }
.sr-bar-bg    { flex:1;height:6px;background:rgba(184,153,71,0.12);border-radius:3px;overflow:hidden; }
.sr-bar-fill  { height:100%;background:var(--border-gold);border-radius:3px;transition:width 0.5s; }
.sr-count     { width:20px;font-size:0.7rem;color:var(--text-main);font-weight:bold;font-family:'Courier New',monospace; }

.titles-container { display:flex;flex-wrap:wrap;gap:0.6rem; }
.title-btn { background:transparent;border:1px solid var(--border-brass);color:var(--text-muted);padding:0.4rem 0.8rem;border-radius:20px;font-size:0.75rem;cursor:pointer;font-family:inherit;transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1),border-color 0.2s,color 0.2s,background 0.2s; }
.title-btn:hover { border-color:var(--border-gold);color:var(--text-main);transform:translateY(-1px);background:#FFF; }
.title-btn.active { background:rgba(184,153,71,0.1);border-color:var(--border-gold);color:var(--border-gold);font-weight:bold; }

.achievements-list { display:flex;flex-direction:column;gap:0.8rem; }
.ach-card { background:rgba(255,255,255,0.4);border:1px dashed var(--border-brass);border-radius:6px;padding:1rem;opacity:0.55;filter:grayscale(70%);transition:all 0.3s; }
.ach-card.unlocked { opacity:1;filter:none;border-style:solid;border-color:var(--border-gold);background:#FFF;box-shadow:0 2px 8px rgba(184,153,71,0.05); }
.ach-head    { display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.5rem; }
.ach-name    { font-size:0.9rem;color:var(--text-main);font-weight:bold;letter-spacing:0.1em; }
.ach-status  { font-size:0.6rem;color:var(--border-gold);font-family:'Courier New',monospace; }
.ach-desc    { font-size:0.7rem;color:var(--text-muted);line-height:1.6; }
.ach-rewards { margin-top:0.6rem;display:flex;gap:1rem;font-size:0.65rem;color:var(--safe-green);font-weight:bold; }

/* ============================================================
   13. 商店页
============================================================ */
.screen-shop { background:var(--bg-paper);padding:0;overflow-y:auto;display:flex;flex-direction:column;align-items:center; }
.shop-grid   { display:flex;flex-direction:column;gap:0.8rem;width:100%;max-width:500px;padding:0 1.5rem 2rem; }

.shop-item-card { background:rgba(255,255,255,0.6);border:1px solid var(--border-brass);border-radius:6px;padding:1rem 1.2rem;display:flex;flex-direction:column;gap:0.6rem;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),border-color 0.25s,box-shadow 0.25s;box-shadow:var(--shadow-card); }
.shop-item-card:hover:not(.locked):not(.soldout) { border-color:var(--border-gold);background:#FFF;transform:translateY(-3px);box-shadow:var(--shadow-hover); }
.shop-item-card.locked  { opacity:0.5;filter:grayscale(100%); }
.shop-item-card.soldout { opacity:0.5;border-style:dashed; }

.item-header { display:flex;justify-content:space-between;align-items:center; }
.item-name   { font-size:1rem;color:var(--text-main);font-weight:bold;letter-spacing:0.1em; }
.item-owned  { font-size:0.7rem;color:var(--tech-teal);font-family:'Courier New',monospace; }
.item-desc   { font-size:0.75rem;color:var(--text-muted);line-height:1.6; }
.item-footer { display:flex;justify-content:space-between;align-items:center;margin-top:0.2rem; }
.item-price  { font-size:0.85rem;color:var(--tech-teal);font-family:'Courier New',monospace;font-weight:bold; }

.buy-btn { padding:0.4rem 1.2rem;background:#FFF;border:1px solid var(--border-gold);border-radius:3px;color:var(--border-gold);font-family:inherit;font-size:0.75rem;font-weight:bold;cursor:pointer;transition:all 0.2s; }
.buy-btn:hover:not(:disabled) { background:rgba(184,153,71,0.1);transform:translateY(-1px); }
.buy-btn:disabled { background:transparent;border:1px dashed var(--border-brass);color:var(--text-muted);cursor:not-allowed; }

/* ============================================================
   14. 弹窗 & 模态框 (3D 玻璃质感升级)
============================================================ */
.pause-overlay { 
  position: absolute; inset: 0; 
  display: flex; align-items: center; justify-content: center; 
  background: rgba(30, 26, 22, 0.5); /* 加深背景，让前方弹窗更突出 */
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  z-index: 100; 
  padding: 0 1.5rem; /* 关键：防止在手机端贴边！ */
}

/* 主体弹窗：立体毛玻璃块 */
.pause-box { 
  width: 100%; 
  max-width: 380px; /* 稍微收窄一点，比例更优雅 */
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 245, 238, 0.85) 100%); 
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 196, 168, 0.6); 
  border-radius: 16px; 
  padding: 1.5rem 1.2rem 1.8rem; 
  text-align: center; 
  display: flex; flex-direction: column; align-items: center; gap: 0.8rem; 
  /* 多层阴影制造厚度和悬浮感 */
  box-shadow: 0 16px 40px rgba(60, 53, 45, 0.15), 
              inset 0 1px 2px rgba(255, 255, 255, 0.9), 
              0 0 0 1px rgba(255, 255, 255, 0.4) inset,
              0 8px 20px rgba(184, 153, 71, 0.08); 
  position: relative;
  overflow: hidden;
}

/* 顶部金色高光边缘线 (模拟物理厚度) */
.pause-box::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, transparent, rgba(184, 153, 71, 0.5), transparent);
}

.pause-title { 
  font-size: 1.15rem; color: var(--border-gold); font-weight: bold; letter-spacing: 0.3em; 
  text-shadow: 0 2px 6px rgba(184, 153, 71, 0.2);
  position: relative;
  padding-bottom: 0.8rem;
  width: 100%;
}
/* 标题下方的精致分割线 */
.pause-title::after {
  content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-brass), transparent);
}

.pause-sub { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 0.1em; line-height: 1.8; }
.pause-actions { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; margin-top: 0.5rem; }

/* ============================================================
   弹窗内部的模块排版 (卡片嵌套卡片的立体感)
============================================================ */
.diff-guide-modal, .guide-content-modal { 
  display: flex; flex-direction: column; gap: 0.8rem; width: 100%; 
  padding: 0.5rem 0;
  max-height: 60vh; /* 防止内容过多撑爆屏幕 */
  overflow-y: auto;
  scrollbar-width: none;
}
.diff-guide-modal::-webkit-scrollbar, .guide-content-modal::-webkit-scrollbar { display: none; }

/* 每一行都做成内嵌的微凹槽卡片 */
.diff-row, .guide-item { 
  display: flex; gap: 0.8rem; align-items: flex-start; 
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(212, 196, 168, 0.3);
  padding: 0.8rem;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(60, 53, 45, 0.02);
  transition: all 0.3s ease;
  text-align: left;
}
.diff-row:hover, .guide-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(184, 153, 71, 0.08);
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(184, 153, 71, 0.3);
}

/* 星星与序号样式升级 */
.diff-stars { display: flex; gap: 2px; flex-shrink: 0; padding-top: 0.15rem; }
.diff-star  { font-size: 0.75rem; color: #E5DCC5; text-shadow: inset 0 1px 1px #FFF; }
.diff-star.lit { color: var(--border-gold); text-shadow: 0 2px 6px rgba(184,153,71,0.5); }

.guide-num { 
  font-size: 0.75rem; color: var(--border-gold); font-family: 'Courier New', serif; font-weight: bold; 
  flex-shrink: 0; background: linear-gradient(145deg, #FFF, #F9F6F0); border: 1px solid rgba(184,153,71,0.3);
  padding: 2px 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(184,153,71,0.1);
}

.diff-name  { font-size: 0.85rem; color: var(--text-main); font-weight: bold; margin-bottom: 0.3rem; letter-spacing: 0.05em; }
.diff-desc, .guide-text { font-size: 0.72rem; color: var(--text-muted); line-height: 1.8; letter-spacing: 0.02em; }

/* ============================================================
   15. 升级弹窗
============================================================ */
.levelup-box { background:#FFF;border:1px solid var(--border-gold);border-radius:10px;padding:2rem 2rem 1.5rem;display:flex;flex-direction:column;align-items:center;gap:0.8rem;min-width:280px;max-width:340px;box-shadow:0 10px 40px rgba(184,153,71,0.15),0 0 0 6px rgba(255,255,255,0.5);text-align:center; }
.levelup-orn    { font-size:1rem;color:var(--border-gold);animation:titleGlow 2s infinite alternate; }
.levelup-title  { font-size:1.3rem;color:var(--text-main);font-weight:bold;letter-spacing:0.4em; }
.levelup-level  { font-size:0.7rem;color:var(--tech-teal);letter-spacing:0.2em;font-weight:bold; }
.levelup-rewards { width:100%;display:flex;flex-direction:column;gap:0.4rem;padding:0.8rem;background:rgba(184,153,71,0.05);border:1px solid var(--border-brass);border-radius:4px;text-align:left; }
.levelup-reward-row { font-size:0.78rem;color:var(--text-main);display:flex;align-items:center;gap:0.5rem; }
.reward-icon { color:var(--border-gold);font-size:0.6rem; }

.levelup-choice-section { width:100%;display:flex;flex-direction:column;gap:0.6rem; }
.levelup-choice-label   { font-size:0.65rem;color:var(--text-muted);letter-spacing:0.2em; }
.levelup-choices        { display:flex;flex-direction:column;gap:0.6rem;text-align:left; }
.levelup-choice-card    { padding:0.8rem 1rem;border:1px dashed var(--border-brass);border-radius:4px;cursor:pointer;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),border-color 0.25s,background 0.25s,box-shadow 0.25s;background:rgba(255,255,255,0.5); }
.levelup-choice-card:hover { border-style:solid;border-color:var(--border-gold);background:#FFF;transform:translateX(4px);box-shadow:0 4px 12px rgba(184,153,71,0.1); }
.lc-label { font-size:0.88rem;color:var(--border-gold);font-weight:bold;letter-spacing:0.08em;margin-bottom:0.3rem; }
.lc-desc  { font-size:0.65rem;color:var(--text-muted);line-height:1.6; }
.levelup-actions { margin-top:0.5rem; }

/* ============================================================
   16. 移动端适配
============================================================ */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.para-narrative, .para-current, .para-inner,
.history-list, .name-input, .pf-text {
  -webkit-user-select: auto;
  user-select: auto;
}
button, .hub-menu-item, .script-card,
.clickable-profile, .tool-slot-h, .avatar-edit-container {
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

@media (max-width: 768px) {
  .frame-content::-webkit-scrollbar,
  .panel-slide::-webkit-scrollbar,
  .profile-scroll-container::-webkit-scrollbar,
  .settlement-card::-webkit-scrollbar { display:none; }

  .frame-content,
  .panel-slide,
  .profile-scroll-container,
  .settlement-card {
    -ms-overflow-style: none;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .back-btn      { padding:0.6rem 1.2rem;font-size:0.85rem; }
  .title-btn     { padding:1rem 1.5rem;font-size:1rem; }
  .hub-menu-item { padding:1rem 1.2rem; }
  .panel-tab     { padding:0.8rem 0;font-size:0.85rem; }
  .frame-content { padding:0.8rem 1rem;gap:1rem; }
  .para-current p { line-height:2.1;font-size:1rem; }
  .tool-slot-h   { width:80px; }
  .stats-grid    { grid-template-columns:repeat(2,1fr); }
}

/* ============================================================
   17. 悬浮音乐播放器 (纯净横条版)
============================================================ */
.floating-player-bar {
  position: fixed;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-panel);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-brass);
  border-radius: 30px; /* 圆角胶囊形状 */
  padding: 6px 16px 6px 6px; /* 左边窄(贴着唱片)，右边宽 */
  box-shadow: var(--shadow-card);
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: all 0.3s;
}
.floating-player-bar:active { cursor: grabbing; }

/* 播放时的外框呼吸发光 */
.floating-player-bar.is-playing {
  border-color: var(--border-gold);
  animation: barGlow 2s ease-in-out infinite alternate;
}
@keyframes barGlow {
  0% { box-shadow: 0 0 4px rgba(184, 153, 71, 0.2); }
  100% { box-shadow: 0 0 16px rgba(184, 153, 71, 0.6), inset 0 0 8px rgba(184, 153, 71, 0.1); }
}

/* 唱片样式 */
.bar-disc {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: repeating-radial-gradient(#3C352D, #3C352D 2px, #2A251E 3px, #2A251E 4px);
  border: 2px solid var(--border-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  position: relative;
  z-index: 2;
}
.disc-core { font-size: 0.5rem; color: var(--border-gold); }

/* 播放时的转动和背后的音波涟漪 */
.bar-disc.spinning { animation: discSpin 4s linear infinite; }
@keyframes discSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.bar-disc.spinning::before {
  content: '';
  position: absolute;
  inset: -2px; 
  border-radius: 50%;
  border: 1px solid var(--border-gold);
  z-index: -1; 
  opacity: 0;
  animation: soundRipple 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes soundRipple {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* 右侧三个按钮 */
.bar-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ctrl-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ctrl-btn:hover { color: var(--border-gold); }
.ctrl-btn:active { transform: scale(0.9); }

.play-btn {
  font-size: 1rem; /* 播放键稍微大一点 */
  color: var(--text-main);
}
.is-playing .play-btn {
  color: var(--border-gold);
}
/* ============================================================
   18. 患者手册 深度质感优化
============================================================ */
/* 列表与头部的优雅悬浮卡片 */
.elegant-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 250, 243, 0.8) 100%);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 196, 168, 0.6);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(60, 53, 45, 0.04), inset 0 2px 4px rgba(255, 255, 255, 1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.script-card.elegant-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 12px 32px rgba(184, 153, 71, 0.12), inset 0 2px 4px rgba(255, 255, 255, 1);
  border-color: var(--border-gold);
}
.card-date {
  font-size: 0.7rem; color: var(--border-brass); font-family: 'Courier New', monospace; letter-spacing: 0.05em; margin-top: 0.2rem;
}

/* 详情页头部大卡片特化 */
.detail-header {
  padding: 1.8rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.6rem;
  box-shadow: 0 12px 32px rgba(60, 53, 45, 0.06), inset 0 2px 4px rgba(255, 255, 255, 1);
}
.detail-name { font-size: 1.6rem; color: var(--border-gold); font-weight: bold; letter-spacing: 0.15em; text-shadow: 0 2px 8px rgba(184, 153, 71, 0.2); }
.detail-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 0.6rem; align-items: center; margin-bottom: 0.2rem; }
.highlight-result { color: var(--text-main); font-weight: bold; padding: 2px 8px; background: rgba(184, 153, 71, 0.1); border-radius: 4px; box-shadow: inset 0 1px 2px #FFF; }
.detail-stars { display: flex; gap: 3px; font-size: 0.8rem; }

/* 模块列表容器 */
.record-list { display: flex; flex-direction: column; gap: 1rem; }

/* 基础档案块 (替代原来的大灰块) - 优雅内陷质感 */
.record-block {
  background: rgba(250, 248, 242, 0.6);
  border: 1px solid rgba(212, 196, 168, 0.4);
  border-radius: 8px;
  padding: 1.2rem;
  box-shadow: inset 0 2px 6px rgba(60, 53, 45, 0.04), 0 2px 8px rgba(255, 255, 255, 0.5);
  transition: background 0.3s;
}
.record-block:hover { background: rgba(255, 255, 255, 0.9); }
.record-label { font-size: 0.68rem; color: var(--border-gold); letter-spacing: 0.2em; margin-bottom: 0.6rem; font-weight: bold; text-shadow: 0 1px 1px #FFF; }
.record-text { font-size: 0.85rem; color: var(--text-main); line-height: 2; letter-spacing: 0.05em; }

/* 诊断经历块 (左侧带金色进度条) */
.history-block {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 246, 240, 0.4) 100%);
  border-left: 3px solid var(--border-gold);
  border-radius: 0 8px 8px 0;
  padding: 1rem 1.2rem;
  box-shadow: 0 4px 12px rgba(60, 53, 45, 0.03);
  position: relative;
}
.history-block::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: rgba(255, 255, 255, 0.8);
}
.history-round { color: var(--border-gold); font-size: 0.65rem; margin-bottom: 0.5rem; letter-spacing: 0.15em; font-family: 'Courier New', monospace; font-weight: bold;}
.history-action { color: var(--text-main); margin-bottom: 0.6rem; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.05em; }
.history-narrative { color: var(--text-muted); line-height: 1.9; font-size: 0.8rem; }

/* 后续回访独立块 */
.follow-up-block { background: linear-gradient(145deg, #FFF 0%, rgba(250, 248, 242, 0.8) 100%); }
.follow-up-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; border-bottom: 1px dashed var(--border-brass); padding-bottom: 0.5rem; }
.follow-up-tag { font-size: 0.68rem; color: var(--tech-teal); letter-spacing: 0.15em; font-weight: bold; }
.follow-up-time { font-size: 0.65rem; color: var(--border-brass); font-family: 'Courier New', monospace; }

.empty-hint { font-size: 0.75rem; color: var(--border-brass); text-align: center; padding: 2rem; letter-spacing: 0.1em; }



</style>