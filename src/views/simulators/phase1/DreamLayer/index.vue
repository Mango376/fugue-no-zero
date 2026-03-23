<template>
  <div class="dream-layer">

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
      <div class="dream-aurora"></div>
      <div class="dream-particles">
        <span
          v-for="n in 25"
          :key="n"
          class="particle"
          :style="getParticleStyle(n)"
        ></span>
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
          <p class="story-text">可行的治疗方法是进入他人的意识，修补意识空间，帮助患者从中走出来，这样的人被称为<strong>调率者</strong>。</p>
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
  <div class="hub-topbar">
    <div style="display: flex; align-items: center; gap: 1rem;">
      <button class="back-btn" @click="phase = 'title'">‹ 返回</button>
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
          <div class="menu-title">{{ hasSave ? '继续当前任务' : '接受新任务' }}</div>
          <div class="menu-sub">{{ hasSave ? '恢复上次未完成的意识连接' : '选择今日待调律的意识档案' }}</div>
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

    <div class="hub-menu-item" @click="showDiffGuide = !showDiffGuide">
      <div class="menu-item-left">
        <div class="menu-icon">★</div>
        <div class="menu-text">
          <div class="menu-title">难度说明</div>
          <div class="menu-sub">了解各星级任务的风险等级</div>
        </div>
      </div>
      <div class="menu-arrow">{{ showDiffGuide ? '▴' : '▾' }}</div>
    </div>

    <div v-if="showDiffGuide" class="diff-guide">
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

    <div class="hub-menu-item" @click="showGuide = !showGuide">
      <div class="menu-item-left">
        <div class="menu-icon">？</div>
        <div class="menu-text">
          <div class="menu-title">调律者手册</div>
          <div class="menu-sub">查看操作说明与游戏机制</div>
        </div>
      </div>
      <div class="menu-arrow">{{ showGuide ? '▴' : '▾' }}</div>
    </div>

    <div v-if="showGuide" class="guide-content">
      <div class="guide-item"><div class="guide-num">01</div><div class="guide-text">每轮做出一个选择，影响患者意识空间的走向与你的神经载荷消耗。</div></div>
      <div class="guide-item"><div class="guide-num">02</div><div class="guide-text">共振深度反映患者的治愈程度，不同数值会走向不同结局。</div></div>
      <div class="guide-item"><div class="guide-num">03</div><div class="guide-text">神经载荷归零前，你可以主动撤离。若降到0两轮内未撤出将陷入永眠。</div></div>
      <div class="guide-item"><div class="guide-num">04</div><div class="guide-text">撤离后，进入现实回响阶段，与患者及其身边人（如果有）完成现实中的对话。</div></div>
    </div>

    <!-- ✅ 患者手册移到 hub-menu 内部 -->
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

  </div><!-- hub-menu 结束 -->

  <div class="hub-footer">
    <div class="hub-footer-text">意识接口已就绪 · 随时可以接入梦境</div>
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

    <div v-if="completedScripts.length === 0"
      style="font-size: 0.75rem; color: #4a4030; text-align: center; padding: 2rem;">
      尚无诊断记录
    </div>
  <div
  v-for="(patient, idx) in [...completedScripts].reverse()"
  :key="getPatientKey(patient, idx)"
  class="script-card"
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
        <span>{{ patient.result === 'perfect' ? '完满终止' : patient.result === 'harmony' ? '协奏' : patient.result === 'disqualified' ? '失格' : '离调' }}</span>
      </div>
      <div class="card-divider"></div>
      <div class="card-preview" style="font-size: 0.68rem; color: #4a4030;">
        {{ formatPatientDate(patient.time) }}
      </div>
    </div>
  </div>

  <!-- 详情视图 -->
<div v-if="selectedPatient" class="profile-scroll-container">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
    <button class="back-btn" @click="selectedPatient = null">‹ 返回列表</button>
  </div>

    <!-- 患者基本信息 -->
    <div class="profile-header-card">
      <div style="font-size: 1.2rem; color: #c0a860; letter-spacing: 0.2em; margin-bottom: 0.5rem;">
        {{ selectedPatient.patientName }}
      </div>
      <div style="font-size: 0.68rem; color: #5a5040; display: flex; gap: 0.5rem; margin-bottom: 0.8rem;">
        <span>{{ selectedPatient.patientAge }}岁</span>
        <span>·</span>
        <span>{{ selectedPatient.patientProfession }}</span>
        <span>·</span>
        <span>{{ selectedPatient.result === 'perfect' ? '完满终止' : selectedPatient.result === 'harmony' ? '协奏' : selectedPatient.result === 'disqualified' ? '失格' : '离调' }}</span>
      </div>
      <div style="display: flex; gap: 2px;">
        <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= selectedPatient.diff }">★</span>
      </div>
    </div>

<!-- 背景档案 -->
<div class="section-title">背景档案</div>
<div v-if="selectedPatient.scriptContext" style="display: flex; flex-direction: column; gap: 0.8rem;">
  <template v-for="(label, key) in {
  character: '人物介绍',
  wound: '背景介绍',
  imagery: '心象映射',
  socialIssue: '社会议题',
  mentalTheme: '精神主题',
  mainSentence: '主旨句'
}" :key="key">
    <div v-if="parsedSelectedPatientContext[key]"
      style="background: rgba(0,0,0,0.2); border: 1px solid rgba(200,170,80,0.12); border-radius: 5px; padding: 0.8rem 1rem;">
      <div style="font-size: 0.65rem; color: #8a6838; letter-spacing: 0.2em; margin-bottom: 0.5rem;">
        {{ label }}
      </div>
      <div style="font-size: 0.82rem; color: #a09878; line-height: 2;">
        {{ parsedSelectedPatientContext[key] }}
      </div>
    </div>
  </template>

  <!-- ✅ 如果全部解析失败，显示原始文本 -->
  <div v-if="Object.values(parsedSelectedPatientContext).every(v => !v)"
    style="font-size: 0.82rem; color: #a09878; line-height: 2; background: rgba(0,0,0,0.2); border: 1px solid rgba(200,170,80,0.08); border-radius: 5px; padding: 1rem;">
    {{ selectedPatient.scriptContext }}
  </div>
</div>



    <!-- 诊断经历 -->
    <div class="section-title">诊断经历</div>
    <div style="display: flex; flex-direction: column; gap: 0.6rem;">
      <div
  v-for="(entry, i) in selectedPatient.conversationHistory"
  :key="i"
  style="font-size: 0.82rem; line-height: 1.9; padding: 0.8rem 1rem; background: rgba(0,0,0,0.15); border-radius: 4px; border-left: 2px solid rgba(200,170,80,0.2);"
>
  <div style="color: #a08848; font-size: 0.68rem; margin-bottom: 0.4rem; letter-spacing: 0.1em;">
    第 {{ entry.roundNum }} 轮
  </div>
  <div style="color: #8a7848; margin-bottom: 0.4rem;">
    ▷ {{ entry.playerAction }}
  </div>
  <div style="color: #9a9080; line-height: 2;">
    {{ entry.narrative }}
  </div>
</div>

    </div>

   <!-- 后续调查记录 -->
<div class="section-title">后续调查记录</div>

<div v-if="selectedPatient.statusHistory && selectedPatient.statusHistory.length > 0"
  style="display: flex; flex-direction: column; gap: 0.8rem;">
  <div
    v-for="record in [...selectedPatient.statusHistory].reverse()"
    :key="record.count"
    style="background: rgba(0,0,0,0.2); border: 1px solid rgba(200,170,80,0.08); border-radius: 5px; padding: 0.8rem 1rem;"
  >
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
      <span style="font-size: 0.62rem; color: #8a6838; letter-spacing: 0.15em;">
        第 {{ record.count }} 次回访
      </span>
      <span style="font-size: 0.6rem; color: #4a3820; font-family: 'Courier New', monospace;">
        {{ record.time }}
      </span>
    </div>
    <div style="font-size: 0.82rem; color: #9a9080; line-height: 2;">
      {{ record.content }}
    </div>
  </div>
</div>

<div v-else
  style="font-size: 0.75rem; color: #4a4030; text-align: center; padding: 1rem;">
  尚未进行后续调查
</div>

<!-- 生成按钮 -->
<button
  class="btn-primary"
  style="width: 100%; margin-top: 0.5rem;"
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

    <div style="font-size: 0.6rem; color: rgba(200,170,80,0.4); letter-spacing: 0.4em; font-family: 'Courier New', monospace;">
      FOLLOW-UP REPORT
    </div>

    <div style="font-size: 1rem; color: #c0a860; letter-spacing: 0.2em;">
      {{ selectedPatient?.patientName }} · 当前状态
    </div>

    <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.2), transparent);"></div>

    <div style="
      font-size: 0.88rem;
      color: #b0a890;
      line-height: 2.2;
      text-align: left;
      max-height: 50vh;
      overflow-y: auto;
      letter-spacing: 0.04em;
      padding: 0 0.3rem;
    ">
      {{ patientCurrentStatus }}
    </div>

    <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.2), transparent);"></div>

    <button
      class="btn-secondary"
      style="width: 100%; border-color: rgba(200,170,80,0.35); color: #a09060; font-size: 0.85rem;"
      @click="showPatientStatusModal = false; patientCurrentStatus = ''"
    >
      关闭
    </button>

  </div>
</div>
</Transition>

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

      <div v-else class="scripts-grid">
        <div v-for="(script, i) in scriptPreviews" :key="i"
             class="script-card"
             @click="selectScript(script)">
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
      <div v-if="!isGeneratingScripts" class="select-footer">
        <button class="refresh-btn" :disabled="refreshCount >= 2" @click="refreshScripts">
          {{ refreshCount >= 2 ? '今日刷新已用完' : `重新扫描（剩余${2 - refreshCount}次）` }}
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
          <div class="is-auto-chip">
            <span class="is-auto-icon">✦</span>逻辑缝合针（自动携带，不占栏位）
          </div>
          <div class="is-consumable-grid">
            <div
              v-for="item in shopItems.filter(i => i.type === 'consumable' && i.id !== 'needle' && (ownedConsumables[i.id] || 0) > 0)"
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
              v-if="shopItems.filter(i => i.type === 'consumable' && i.id !== 'needle' && (ownedConsumables[i.id] || 0) > 0).length === 0"
              class="is-empty-hint"
            >
              暂无可携带的消耗型道具<br>
              <span style="font-size:0.65rem; color:#3a3020;">可在调律中枢的补给终端购买</span>
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

    <!-- ========== 梦境主界面（含现实回响） ========== -->
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

      <!-- ✅ 折叠按钮移到 frame-content 外面，固定在顶部 -->
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

        <!-- ✅ history-section 里只保留列表和分割线 -->
        <div v-if="displayHistory.length > 0" class="history-section">
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
          <div v-if="historyCollapsed" class="history-divider">
            <span class="hd-line"></span>
            <span class="hd-text">以上为历史记录</span>
            <span class="hd-line"></span>
          </div>
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
      <div 
       v-if="isDying && !mustEvacuate && !isLoading && !streamingText" 
       class="dying-banner"
    >
       <div class="dying-icon">⚠</div>
       <div class="dying-msg">
         神经载荷归零
         <span class="dying-sub">
           再走 
           <span class="dying-countdown">{{ dyingRoundsLeft }}</span> 
           轮剧情将永久离调
         </span>
       </div>
       <button class="btn-evacuate-now dying-evacuate" @click="initiateEscape">
         立即撤离 ↑
       </button>
     </div>


          <!-- 共振满时强制撤离 -->
          <div v-if="mustEvacuate && !isLoading && !streamingText" class="must-evacuate-banner">
            <div class="evacuate-icon">▲</div>
            <div class="evacuate-msg">
              共振深度已达 100%
              <span class="evacuate-sub">修复已完成，意识连接可以安全断开了</span>
            </div>
            <button class="btn-evacuate-now" @click="initiateEscape">立即撤离 ↑</button>
          </div>

          <!-- 正常选项区（共振满时隐藏） -->
          <template v-if="!mustEvacuate">
            <div v-if="activeItem" class="staged-item-bar">
              <span class="staged-text">✨ 准备配合使用：[{{ activeItem.name }}]</span>
              <button class="cancel-item-btn" @click="activeItem = null">取消使用</button>
            </div>
            <template v-if="!isLoading && !streamingText && choices.length > 0">
              <ChoicePanel :choices="choices" :show="true" hint="" @select="onChoiceSelect" />
            </template>
            <div v-else-if="!isLoading && !streamingText" class="choices-waiting">
              — 等待意识空间响应 —
            </div>
          </template>

          <!-- ✅ 洞察提示栏 -->
          <div v-if="insightHint" class="insight-hint-bar">
            🔍 {{ insightHint }}
          </div>

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
              v-if="equippedItems.some(i => i.id === 'watch' && i.count > 0) && !watchUsed && lastRoundSnapshot"
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
              <div v-for="(item, idx) in equippedItems" :key="idx"
                   class="tool-slot-h"
                   :class="{ active: activeItem?.id === item.id, empty: item.count <= 0 }"
                   @click="selectItemForRound(item)">
                <div class="tool-icon-h">📦</div>
                <div class="tool-name-h">{{ item.name }}</div>
                <div class="tool-count" v-if="item.id !== 'needle' && item.count > 0">剩余:{{ item.count }}</div>
              </div>
              <div v-if="equippedItems.length < 3" class="tool-slot-h empty">— 空 —</div>
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
            <div style="color:#c0a860; margin-bottom:4px;">▶ {{ activeItem.name }}</div>
            <div style="font-size:0.65rem; color:#8a8070;">{{ activeItem.desc }}</div>
            <div style="font-size:0.6rem; color:#a06050; margin-top:6px;">(已选中，请切回「做出选择」点击对话行动)</div>
          </div>
        </div>
      </div>

      <!-- ========== 现实回响阶段底部面板 ========== -->
      <div v-if="gameStage === 'realecho' && !isLoading && !streamingText" class="dream-bottom-panel">
        <div class="panel-tabs" style="pointer-events:none;">
          <div class="panel-tab active" style="flex:1; justify-content:center;">
            <span class="tab-icon">◈</span> {{ echoActLabel }}
          </div>
        </div>
        <div class="panel-slide">
          <template v-if="echoChoices.length > 0">
            <ChoicePanel :choices="echoChoices" :show="true" hint="你会说什么" @select="onEchoChoiceSelect" />
          </template>
          <div v-if="echoPhase === 'final' && echoChoices.length === 0" class="panel-actions" style="justify-content:center;">
            <button class="btn-primary" @click="goToSettlement">进入结算 ›</button>
          </div>
        </div>
      </div>

      <!-- ========== 逃脱面板 ========== -->
      <div v-if="phase === 'escape' && !isLoading" class="dream-choices">
        <div class="escape-result">{{ escapeResultText }}</div>
        <div class="escape-actions">
          <button v-if="escapeCanRetry" class="btn-primary" @click="retryEscape">再次尝试</button>
          <button v-if="escapeDone" class="btn-primary" @click="enterRealEcho">进入现实回响 ›</button>
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
      <div v-if="showBreath" class="breath-screen">
  <div class="breath-text">
    <p
      v-for="(para, i) in splitParagraphs(breathText || '……')"
      :key="i"
      class="breath-para"
    >
      {{ para }}
    </p>
  </div>
  <Transition name="fade">
    <button v-if="showBreathDismissBtn" class="breath-dismiss-btn" @click="dismissBreath">
      查看结算 ›
    </button>
  </Transition>
</div>

      <div v-else class="settlement-card">
        <div class="settle-orn">◆</div>
        <div class="settle-result-label">{{ resultLabel }}</div>
        <div class="settle-result-name">{{ finalResultName }}</div>
        <div class="settle-divider"></div>
        <div class="settle-stats">
          <div class="settle-row"><span class="sl">最终共振深度</span><span class="sr">{{ resonance }}%</span></div>
          <div class="settle-row"><span class="sl">剩余神经载荷</span><span class="sr">{{ neuralLoad }}</span></div>
          <div class="settle-row"><span class="sl">获得纯真滴露</span><span class="sr">+{{ dropsGained }}</span></div>
          <div class="settle-row"><span class="sl">获得经验值</span><span class="sr">+{{ expGained }}</span></div>
        </div>
        <div v-if="patientFuture" class="patient-future">
  <div class="pf-label">· 患者后续 ·</div>
  <div class="pf-scroll">
    <p
      v-for="(para, i) in splitParagraphs(patientFuture)"
      :key="i"
      class="pf-text"
    >
      {{ para }}
    </p>
  </div>
</div>

        <div class="settle-divider"></div>
        <div class="settle-orn">◆</div>

        <!-- ✅ 删除了内联升级文字，由弹窗统一处理 -->

        <div v-if="newAchievements.length > 0" style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 0.6rem; color: #a09050; letter-spacing: 0.2em; text-align: center;">- 解锁新成就 -</div>
          <div v-for="ach in newAchievements" :key="ach" style="background: rgba(200,170,80,0.1); border: 1px solid rgba(200,170,80,0.3); padding: 8px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="color: #d8c890; font-size: 0.8rem; font-weight: bold;">🏆 {{ ACHIEVEMENT_CONFIG[ach].name }}</div>
              <div style="color: #8a7848; font-size: 0.6rem; margin-top: 2px;">{{ ACHIEVEMENT_CONFIG[ach].desc }}</div>
            </div>
            <div v-if="ACHIEVEMENT_CONFIG[ach].drops > 0" style="color: #80c0d0; font-size: 0.75rem;">+{{ ACHIEVEMENT_CONFIG[ach].drops }}💧</div>
            <div v-if="ACHIEVEMENT_CONFIG[ach].title" style="color: #c080a0; font-size: 0.7rem;">[称号]</div>
          </div>
        </div>
        <div class="settle-actions">
          <button class="btn-secondary" @click="phase = 'hub'">返回调律中枢</button>
          <button class="btn-primary" @click="restartSelect">继续修复</button>
        </div>
      </div>
    </div>
    </Transition>
<!-- 调律者陨落弹窗 -->
<Transition name="fade">
<div v-if="showDeathModal" class="pause-overlay">
  <div class="pause-box" style="max-width: 320px; gap: 1.2rem;">

    <div style="font-size: 0.55rem; color: rgba(200,100,80,0.5); letter-spacing: 0.4em; font-family: 'Courier New', monospace;">
      TUNER SIGNAL LOST
    </div>

    <div style="font-size: 1.3rem; color: #c06050; letter-spacing: 0.3em;">
      意识迷失
    </div>

    <div style="font-size: 0.72rem; color: #5a4030; line-height: 2; text-align: center;">
      {{ deathSummary?.playerName }} 调律者的意识<br>
      永远留在了第十三层梦境深处。
    </div>

    <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,100,80,0.2), transparent);"></div>

    <div style="width: 100%; display: flex; flex-direction: column; gap: 0.6rem;">
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
        <span style="color: #5a4030;">最终等级</span>
        <span style="color: #a08060; font-family: 'Courier New', monospace;">LV.{{ deathSummary?.playerLevel }}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
        <span style="color: #5a4030;">共完成调律</span>
        <span style="color: #a08060; font-family: 'Courier New', monospace;">{{ deathSummary?.totalScripts }} 份</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
        <span style="color: #5a4030;">完满终止</span>
        <span style="color: #a08060; font-family: 'Courier New', monospace;">{{ deathSummary?.perfectCount }} 次</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
        <span style="color: #5a4030;">协奏</span>
        <span style="color: #a08060; font-family: 'Courier New', monospace;">{{ deathSummary?.harmonyCount }} 次</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
        <span style="color: #5a4030;">经历意识流转</span>
        <span style="color: #a08060; font-family: 'Courier New', monospace;">{{ deathSummary?.totalRoundsPlayed }} 轮</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
        <span style="color: #5a4030;">提炼纯真滴露</span>
        <span style="color: #a08060; font-family: 'Courier New', monospace;">{{ deathSummary?.totalDropsEarned }} 💧</span>
      </div>
    </div>

    <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,100,80,0.2), transparent);"></div>

    <div style="font-size: 0.65rem; color: #3a2a10; text-align: center; line-height: 2;">
      新的调律者将继承这份使命。<br>
      深渊依然在等待。
    </div>

    <button class="btn-primary"
      style="width: 100%; background: linear-gradient(135deg, #5a2018, #3a1008); border-color: rgba(200,100,60,0.4);"
      @click="confirmDeath">
      新的调律者，上任 ›
    </button>

  </div>
</div>
</Transition>

    <!-- 新游戏覆盖确认弹窗 -->
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
              <span v-else-if="item.type === 'permanent' && ownedPermanents.includes(item.id)">已售空</span>
              <span v-else>兑换</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- ========== 调律者档案详情 ========== -->
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
          <div v-if="unlockedTitles.length === 0" style="font-size:0.7rem; color:#5a5040;">尚无可用称号。请在深渊中证明自己。</div>
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
            <div
              v-for="c in levelUpChoices"
              :key="c.id"
              class="levelup-choice-card"
              @click="confirmLevelUpChoice(c.id)"
            >
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
<!-- 静默者道具获得弹窗 -->
<Transition name="fade">
<div v-if="showSilentOneModal" class="pause-overlay">
  <div class="pause-box">
    <div class="pause-title" style="font-size: 1rem;">✨ 静默者</div>
    <div class="pause-sub" style="line-height: 2;">
      沉默是一种语言。<br>
      因为你的坚持，获得了：
    </div>
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
    <div class="pause-sub" style="line-height: 2;">
      你没能回来。<br>
      以下道具随之消散：
    </div>
    <div style="width: 100%; display: flex; flex-direction: column; gap: 0.5rem;">
      <div
        v-for="item in lostItemsOnDeath"
        :key="item.name"
        style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.8rem; background: rgba(160,50,30,0.1); border: 1px solid rgba(160,50,30,0.25); border-radius: 4px;"
      >
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

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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
const narrativeEl = ref(null)
const EMPTY_PARSED_CONTEXT = Object.freeze({
  character: '',
  wound: '',
  imagery: '',
  socialIssue: '',
  mentalTheme: '',
  mainSentence: ''
})

const {
  phase, gameStage, showGuide, showDiffGuide, bottomTab, historyCollapsed,
  titleReady, hasSave, storyReady, showPauseModal, showConfirmNewGameModal,
  showItemSelectModal, showBreath, activePermanentDesc,
  isGeneratingScripts, scriptPreviews, refreshCount, selectedScript,
  playerName, playerAvatar, pureDrops, playerLevel, totalExp,
  totalRoundsPlayed, totalDropsEarned, completedScripts, achievements,
  unlockedTitles, activeTitles, newAchievements, justLeveledUp,
  ownedConsumables, ownedPermanents, scriptStats,
  neuralLoad, maxLoad, resonance, currentRound, isDying,
  dyingRoundsLeft,
  mustEvacuate, estimatedRounds,
  displayHistory, streamingText, innerText, currentNarrative, choices, isLoading,
  escapeResultText, escapeCanRetry, escapeDone,
  echoPhase, echoChoices, echoActLabel,
  finalResultName, resultLabel, dropsGained, expGained, breathText, patientFuture,
  showLevelUpModal, levelUpRewards, levelUpChoiceNeeded,
  levelUpChoices, insightUsesLeft, insightHint, useInsight,
  confirmLevelUpChoice, skipLevelUpModal,
  silentOneReward, showSilentOneModal,lostItemsOnDeath, showLostItemsModal,
  watchUsed, lastRoundSnapshot, useWatch,
  equippedItems, activeItem, selectedLoadout, maxItemSlots,
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
  splitParagraphs,showHandbook, selectedPatient,
patientCurrentStatus, isGeneratingStatus,
showPatientStatusModal,
generatePatientCurrentStatus,showDeathModal, deathSummary, confirmDeath,showBreathDismissBtn, dismissBreath,

} = useGameLogic(fileInputRef, narrativeEl)

const parsedSelectedPatientContext = computed(() => {
  const scriptContext = selectedPatient.value?.scriptContext
  if (!scriptContext) return EMPTY_PARSED_CONTEXT
  const parsedContext = parseScriptContext(scriptContext)

  return {
    ...EMPTY_PARSED_CONTEXT,
    ...(parsedContext && typeof parsedContext === 'object' ? parsedContext : {})
  }
})

function selectPatient(patient) {
  selectedPatient.value = patient
}

function getPatientKey(patient, idx) {
  return patient?.id
    ?? patient?.time
    ?? `${patient?.patientName ?? 'patient'}-${patient?.patientAge ?? 'unknown'}-${idx}`
}

function formatPatientDate(value) {
  if (!value) return '日期未知'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '日期未知'

  return date.toLocaleDateString('zh-CN')
}

// ✅ 标题页粒子样式生成
function getParticleStyle(n) {
  const x        = ((n * 41 + 7)  % 90) + 5    // x 位置 5%~95%
  const delay    = ((n * 0.37)    % 5 )         // 动画延迟 0~5s
  const duration = 5 + ((n * 1.3) % 8 )         // 持续时长 5~13s
  const size     = 1 + (n % 3)                  // 尺寸 1~3px
  const opacity  = 0.2 + ((n % 5) * 0.12)       // 透明度 0.2~0.68
  return {
    left:              x + '%',
    animationDelay:    delay + 's',
    animationDuration: duration + 's',
    width:             size + 'px',
    height:            size + 'px',
    opacity:           opacity,
  }
}

</script>

<style scoped>
/* ============================================================
   第十三层梦境 · 完整样式表 v4
   设计风格：古典医疗机械风（Light Baroque Tech）—— Gemini设计
   字体尺寸、间距、动画效果：沿用我们版本
============================================================ */


/* ============================================================
   01. CSS 变量系统（Gemini配色）
============================================================ */

.dream-layer {
  --bg-paper:       #F7F4EB;
  --bg-panel:       rgba(255, 255, 255, 0.65);
  --bg-panel-hover: rgba(255, 255, 255, 0.9);

  --border-brass: #D4C4A8;
  --border-gold:  #B89947;

  --text-main:  #3C352D;
  --text-muted: #8C7F70;

  --tech-teal:     #4A8E8B;
  --tech-teal-dim: rgba(74, 142, 139, 0.2);
  --alert-red:     #B54A4A;
  --safe-green:    #6B8E4A;

  --glow-brass: 0 4px 12px rgba(184, 153, 71, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  --glow-teal:  0 0 12px rgba(74, 142, 139, 0.3);
  --glow-red:   0 0 12px rgba(181, 74, 74, 0.3);

  --shadow-card:  0 2px 12px rgba(60, 53, 45, 0.06);
  --shadow-hover: 0 8px 24px rgba(184, 153, 71, 0.15);

  font-family: 'KaiTi', 'STKaiti', 'Noto Serif SC', serif;
  width: 100vw;
  height: 100vh;
  background: var(--bg-paper);
  color: var(--text-main);
  overflow: hidden;
  position: relative;
}

/* 全局纸张纹理 */
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
   02. 页面切换动画（我们的版本：带景深模糊）
============================================================ */

.fade-enter-active {
  transition:
    opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.7s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.7s ease;
}
.fade-leave-active {
  transition:
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.4s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.99);
  filter: blur(6px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(1.01);
  filter: blur(3px);
}

.story-fade-enter-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.story-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.55, 0, 1, 0.45);
  position: absolute;
  width: 100%;
}
.story-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.story-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}


/* ============================================================
   03. 通用组件（Gemini设计 + 我们的字体尺寸）
============================================================ */

/* ---------- 返回按钮 ---------- */
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
.back-btn:hover {
  border-color: var(--border-gold);
  color: var(--border-gold);
  background: rgba(184, 153, 71, 0.05);
}

/* ---------- 货币显示 ---------- */
.currency-display {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--border-brass);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}
.currency-icon { font-size: 0.7rem; }
.currency-value {
  font-size: 0.85rem;
  color: var(--tech-teal);
  font-family: 'Courier New', serif;
  font-weight: bold;
}

/* ---------- 主按钮 ---------- */
.btn-primary {
  position: relative;
  padding: 0.65rem 1.6rem;
  background: linear-gradient(180deg, #FFFFFF, #F0EBE0);
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
  white-space: nowrap;
  box-shadow:
    0 4px 10px rgba(184, 153, 71, 0.15),
    0 1px 0 rgba(255, 255, 255, 1) inset;
}
.btn-primary:hover {
  background: linear-gradient(180deg, #FFF, #F9F4E8);
  border-color: #9A7D35;
  color: #9A7D35;
  transform: translateY(-2px);
  box-shadow:
    0 6px 15px rgba(184, 153, 71, 0.25),
    0 1px 0 rgba(255, 255, 255, 1) inset;
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(184, 153, 71, 0.1);
}

/* ---------- 次按钮 ---------- */
.btn-secondary {
  padding: 0.65rem 1.6rem;
  background: transparent;
  border: 1px solid var(--border-brass);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}
.btn-secondary:hover {
  border-color: var(--text-main);
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}
.btn-secondary:active { transform: translateY(0); }

/* ---------- 导航区 ---------- */
.screen-nav {
  width: 100%;
  max-width: 500px;
  padding: 1.2rem 1.5rem 0;
  flex-shrink: 0;
}


/* ============================================================
   04. 标题页（Gemini的网格+旋转环设计）
============================================================ */

.screen-title {
  align-items: center;
  justify-content: center;
  background: var(--bg-paper);
  overflow: hidden;
}

/* 精密坐标网格 */
.title-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(184, 153, 71, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184, 153, 71, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: center center;
}

/* 旋转测绘刻度环 */
.title-bg::before,
.title-bg::after {
  content: '';
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
}
.title-bg::after {
  width: 90vw; height: 90vw;
  max-width: 600px; max-height: 600px;
  border: 1px dashed rgba(74, 142, 139, 0.5);
  animation: dialSpin 40s linear infinite;
}
.title-bg::before {
  width: 65vw; height: 65vw;
  max-width: 420px; max-height: 420px;
  border: 2px dotted rgba(184, 153, 71, 0.5);
  animation: dialSpinReverse 30s linear infinite;
}
@keyframes dialSpin {
  0%   { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes dialSpinReverse {
  0%   { transform: translate(-50%, -50%) rotate(360deg); }
  100% { transform: translate(-50%, -50%) rotate(0deg); }
}

/* 上下扫描光带 */
.title-scanlines {
  position: absolute;
  inset: -50% 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(74, 142, 139, 0.03) 45%,
    rgba(74, 142, 139, 0.08) 50%,
    rgba(74, 142, 139, 0.03) 55%,
    transparent 100%
  );
  animation: verticalScan 8s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
}
@keyframes verticalScan {
  0%   { transform: translateY(-30%); }
  100% { transform: translateY(30%); }
}

/* 动态光球层（我们的5球系统，Gemini的颜色） */
.dream-orbs {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  mix-blend-mode: multiply;
  opacity: 0.3;
}
.orb-1 {
  width: 55vw; height: 55vw;
  max-width: 340px; max-height: 340px;
  top: -10%; left: -15%;
  background: radial-gradient(circle, rgba(184, 153, 71, 0.25), transparent 70%);
  animation: orbDrift1 18s ease-in-out infinite alternate;
}
.orb-2 {
  width: 50vw; height: 50vw;
  max-width: 300px; max-height: 300px;
  bottom: -5%; right: -10%;
  background: radial-gradient(circle, rgba(74, 142, 139, 0.2), transparent 70%);
  animation: orbDrift2 22s ease-in-out infinite alternate;
}
.orb-3 {
  width: 40vw; height: 40vw;
  max-width: 240px; max-height: 240px;
  top: 30%; right: 5%;
  background: radial-gradient(circle, rgba(184, 153, 71, 0.15), transparent 70%);
  animation: orbDrift3 15s ease-in-out infinite alternate;
}
.orb-4 {
  width: 30vw; height: 30vw;
  max-width: 180px; max-height: 180px;
  top: 35%; left: 15%;
  background: radial-gradient(circle, rgba(74, 142, 139, 0.15), transparent 70%);
  animation: orbDrift4 25s ease-in-out infinite alternate;
}
.orb-5 {
  width: 35vw; height: 35vw;
  max-width: 200px; max-height: 200px;
  bottom: 10%; left: -5%;
  background: radial-gradient(circle, rgba(107, 142, 74, 0.15), transparent 70%);
  animation: orbDrift5 20s ease-in-out infinite alternate;
}
@keyframes orbDrift1 {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(12px, 20px) scale(1.08); }
  66%  { transform: translate(25px, 8px) scale(0.95); }
  100% { transform: translate(10px, 30px) scale(1.05); }
}
@keyframes orbDrift2 {
  0%   { transform: translate(0, 0) scale(1); }
  40%  { transform: translate(-18px, -12px) scale(1.1); }
  100% { transform: translate(-8px, -25px) scale(0.92); }
}
@keyframes orbDrift3 {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.8; }
  50%  { transform: translate(-15px, 18px) scale(1.12); opacity: 1; }
  100% { transform: translate(-5px, 10px) scale(0.9); opacity: 0.7; }
}
@keyframes orbDrift4 {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.6; }
  60%  { transform: translate(20px, -15px) scale(1.2); opacity: 1; }
  100% { transform: translate(8px, -8px) scale(0.85); opacity: 0.5; }
}
@keyframes orbDrift5 {
  0%   { transform: translate(0, 0) scale(1); }
  45%  { transform: translate(16px, -20px) scale(1.15); }
  100% { transform: translate(5px, -10px) scale(0.95); }
}

/* 漂浮粒子（我们的系统，Gemini的颜色） */
.dream-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}
.particle {
  position: absolute;
  bottom: -4px;
  border-radius: 50%;
  background: var(--tech-teal);
  opacity: 0.4;
  animation: particleFloat linear infinite;
}
@keyframes particleFloat {
  0%   { transform: translateY(0) scale(1); opacity: 0; }
  10%  { opacity: 0.6; }
  80%  { opacity: 0.3; }
  100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
}

/* 标题内容 */
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
  width: 100%;
  max-width: 320px;
  padding: 0 1.5rem;
}
.title-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.title-tag {
  font-size: 0.52rem;
  color: var(--border-gold);
  letter-spacing: 0.3em;
  font-family: 'Courier New', serif;
}

/* 主标题 */
.title-main {
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 0.3em;
  color: var(--text-main);
  text-shadow: 0 2px 10px rgba(184, 153, 71, 0.2);
  animation: titleGlow 5s ease-in-out infinite alternate;
}
@keyframes titleGlow {
  0% {
    text-shadow: 0 2px 8px rgba(184, 153, 71, 0.15);
    letter-spacing: 0.28em;
  }
  100% {
    text-shadow: 0 2px 16px rgba(184, 153, 71, 0.35), 0 0 30px rgba(184, 153, 71, 0.1);
    letter-spacing: 0.32em;
  }
}

.title-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  letter-spacing: 0.25em;
  margin-top: -0.3rem;
}
.title-subject {
  font-size: 0.68rem;
  color: var(--tech-teal);
  letter-spacing: 0.15em;
  font-family: 'Courier New', serif;
  opacity: 0.8;
}
.subject-bracket { color: var(--border-brass); }

.title-divider {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-gold), transparent);
  margin: 0.2rem 0;
  opacity: 0.6;
}

.title-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.title-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.75rem 1.2rem;
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 100%;
  position: relative;
}
.title-btn.primary {
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(240,235,224,0.9));
  border: 1px solid var(--border-gold);
  color: var(--border-gold);
  box-shadow: var(--glow-brass);
  backdrop-filter: blur(4px);
}
.title-btn.primary:hover {
  background: #FFF;
  border-color: #9A7D35;
  color: #9A7D35;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(184, 153, 71, 0.25);
}
.title-btn.primary:active { transform: translateY(0); }
.title-btn.secondary {
  background: transparent;
  border: 1px dashed var(--border-brass);
  color: var(--text-muted);
  backdrop-filter: blur(4px);
}
.title-btn.secondary:hover:not(.disabled) {
  border-style: solid;
  border-color: var(--border-gold);
  color: var(--border-gold);
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}
.title-btn.secondary.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-icon { font-size: 0.7rem; opacity: 0.8; }

.title-footer { margin-top: 0.2rem; text-align: center; position: relative; z-index: 10; }
.back-link {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: color 0.3s;
  padding: 0.3rem;
}
.back-link:hover { color: var(--border-gold); }


/* ============================================================
   05. 故事章节页（羊皮纸手帐风）
============================================================ */

.screen-story {
  justify-content: space-between;
  overflow: hidden;
  background: var(--bg-paper);
}
.story-nav-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}
.story-progress { display: flex; gap: 6px; }
.progress-dot {
  width: 20px;
  height: 2px;
  background: rgba(184, 153, 71, 0.2);
  border-radius: 1px;
  transition: background 0.4s;
}
.progress-dot.active { background: var(--border-gold); }

.story-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 2rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s ease, transform 0.7s ease;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.story-content::-webkit-scrollbar { display: none; }
.story-content.visible { opacity: 1; transform: translateY(0); }

.story-chapter-tag {
  font-size: 0.88rem;
  color: var(--border-gold);
  letter-spacing: 0.4em;
  margin-bottom: 1.5rem;
}
.story-body { display: flex; flex-direction: column; gap: 0.9rem; flex: 1; }

.story-lead {
  font-size: 1.15rem;
  color: var(--text-main);
  letter-spacing: 0.12em;
  line-height: 1.8;
  font-weight: bold;
}
.story-text {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 2.2;
  letter-spacing: 0.05em;
}
.story-text.highlight-block {
  background: rgba(184, 153, 71, 0.05);
  border-left: 3px solid var(--border-gold);
  padding: 0.6rem 1rem;
  color: var(--text-main);
  border-radius: 0 3px 3px 0;
}
.story-quote {
  font-size: 0.88rem;
  color: var(--tech-teal);
  line-height: 2;
  letter-spacing: 0.06em;
  font-style: italic;
  padding: 0.8rem 0;
  border-top: 1px dashed var(--border-brass);
  border-bottom: 1px dashed var(--border-brass);
  text-align: center;
}
.story-quote.final-quote {
  font-size: 0.95rem;
  border-color: var(--border-gold);
}

.story-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1.2rem 0 0.5rem;
  flex-shrink: 0;
}
.story-next-btn {
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
.story-next-btn:hover {
  background: rgba(184, 153, 71, 0.08);
  transform: translateX(4px);
}
.story-next-btn.enter-btn {
  background: rgba(184, 153, 71, 0.06);
}

.story-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(200, 190, 170, 0.3) 100%);
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: multiply;
}

/* 各章节背景（统一用羊皮纸色系） */
.story-1 { background: #F5F2E8; }
.story-bg-1 {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(184, 153, 71, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(74, 142, 139, 0.05) 0%, transparent 50%);
  animation: bg1Drift 10s ease-in-out infinite alternate;
}
@keyframes bg1Drift {
  0%   { transform: scale(1) translateX(0); }
  100% { transform: scale(1.05) translateX(-10px); }
}
.story-2 { background: #F3F0E5; }
.story-bg-2 {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 60%, rgba(184, 153, 71, 0.07) 0%, transparent 60%);
  animation: bg2Pulse 6s ease-in-out infinite alternate;
}
@keyframes bg2Pulse {
  0%   { opacity: 0.7; }
  100% { opacity: 1; }
}
.story-3 { background: #F4F1E7; }
.story-bg-3 {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 70% 30%, rgba(74, 142, 139, 0.06) 0%, transparent 55%),
    radial-gradient(ellipse at 30% 70%, rgba(184, 153, 71, 0.06) 0%, transparent 45%);
}
.story-4 { background: #F2EFE4; }
.story-bg-4 {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 40%, rgba(184, 153, 71, 0.08) 0%, transparent 55%);
  animation: bg4Warm 8s ease-in-out infinite alternate;
}
@keyframes bg4Warm {
  0%   { opacity: 0.7; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.03); }
}


/* ============================================================
   06. 调律者中枢 Hub（古典机械仪表盘）
============================================================ */

.screen-hub {
  background: var(--bg-paper);
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  padding-top: 1.5rem;
}

.hub-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
}
.hub-title-tag {
  font-size: 0.5rem;
  color: var(--border-gold);
  letter-spacing: 0.25em;
  font-family: 'Courier New', serif;
}

/* 玩家档案卡片 */
.hub-profile {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 1.5rem 1.2rem;
  padding: 0.9rem 1.1rem;
  background: var(--bg-panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-brass);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03), 0 1px 0 #FFF inset;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.clickable-profile { cursor: pointer; }
.clickable-profile:hover {
  transform: translateX(4px);
  background: var(--bg-panel-hover);
  border-color: var(--border-gold);
  box-shadow: var(--glow-brass);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: var(--border-gold);
  flex-shrink: 0;
  background: #FFF;
  box-shadow: 0 2px 8px rgba(184, 153, 71, 0.2);
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

.profile-info { flex: 1; }
.profile-name {
  font-size: 0.88rem;
  color: var(--text-main);
  font-weight: bold;
  letter-spacing: 0.05em;
}
.profile-meta {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: 'Courier New', serif;
  margin-top: 0.3rem;
}
.profile-badge {
  font-size: 0.65rem;
  color: var(--border-gold);
  font-family: 'Courier New', serif;
  font-weight: bold;
  border: 1px solid var(--border-brass);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
}

/* 数值说明栏 */
.hub-stats-bar {
  margin: 0 1.5rem 1rem;
  padding: 0.8rem 1rem;
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--border-brass);
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.02);
}
.hub-stat-item { display: flex; gap: 0.6rem; flex: 1; align-items: flex-start; }
.hub-stat-icon { font-size: 0.9rem; flex-shrink: 0; margin-top: 0.1rem; }
.load-icon { color: var(--safe-green); }
.res-icon  { color: var(--tech-teal); }
.hub-stat-name {
  font-size: 0.7rem;
  color: var(--text-main);
  font-weight: bold;
  letter-spacing: 0.1em;
  margin-bottom: 0.2rem;
}
.hub-stat-desc {
  font-size: 0.68rem;
  color: var(--text-muted);
  line-height: 1.7;
  letter-spacing: 0.04em;
}
.hub-stat-divider {
  width: 1px;
  background: var(--border-brass);
  align-self: stretch;
  flex-shrink: 0;
}

/* Hub 菜单 */
.hub-menu { display: flex; flex-direction: column; gap: 0.5rem; padding: 0 1.5rem; }

.hub-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  background: var(--bg-panel);
  border: 1px solid var(--border-brass);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
}
/* 左侧金色指示条 */
.hub-menu-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--border-gold);
  opacity: 0;
  transition: opacity 0.3s;
}
.hub-menu-item:hover {
  background: var(--bg-panel-hover);
  border-color: var(--border-gold);
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(184, 153, 71, 0.1);
}
.hub-menu-item:hover::before { opacity: 1; }
.hub-menu-item.primary-item {
  border-color: var(--border-gold);
  background: rgba(255, 255, 255, 0.8);
}

.menu-item-left { display: flex; align-items: center; gap: 0.8rem; }
.menu-icon { font-size: 0.8rem; color: var(--border-gold); width: 20px; text-align: center; }
.menu-title { font-size: 0.85rem; color: var(--text-main); font-weight: bold; letter-spacing: 0.05em; }
.menu-sub { font-size: 0.68rem; color: var(--text-muted); margin-top: 0.25rem; }
.menu-arrow { font-size: 0.8rem; color: var(--border-brass); }

/* 展开内容区 */
.diff-guide,
.guide-content {
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.4);
  border: 1px dashed var(--border-brass);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.diff-row, .guide-item { display: flex; gap: 0.8rem; align-items: flex-start; }
.diff-stars { display: flex; gap: 2px; flex-shrink: 0; padding-top: 0.1rem; }
.diff-star { font-size: 0.6rem; color: #E5DCC5; }
.diff-star.lit { color: var(--border-gold); }
.diff-name {
  font-size: 0.72rem;
  color: var(--text-main);
  font-weight: bold;
  margin-bottom: 0.15rem;
}
.diff-desc, .guide-text {
  font-size: 0.62rem;
  color: var(--text-muted);
  line-height: 1.7;
  letter-spacing: 0.04em;
}
.guide-num { font-size: 0.6rem; color: var(--border-gold); font-family: 'Courier New', serif; font-weight: bold; flex-shrink: 0; }

.hub-footer { padding: 1.5rem; text-align: center; margin-top: auto; }
.hub-footer-text { font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.2em; }


/* ============================================================
   07. 剧本选择页（病历档案风格）
============================================================ */

.screen-select {
  background: var(--bg-paper);
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.select-header {
  text-align: center;
  padding: 0.5rem 1.5rem 0.5rem;
  flex-shrink: 0;
  width: 100%;
}
.select-title {
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: bold;
  letter-spacing: 0.2em;
  margin-bottom: 0.2rem;
}
.select-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

/* 加载状态 */
.scripts-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  width: 100%;
}
.loading-dots { display: flex; gap: 6px; justify-content: center; }
.loading-dots span {
  display: block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--border-gold);
  animation: dotBounce 1.2s infinite ease-in-out;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50%       { transform: translateY(-6px); opacity: 1; }
}
.loading-text {
  font-size: 0.75rem;
  color: var(--border-gold);
  letter-spacing: 0.1em;
  font-weight: bold;
}

/* 剧本卡片列表 */
.scripts-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 500px;
  padding: 0 1.2rem;
  flex: 1;
}

/* 单张卡片：大幅压缩内边距和间距 */
.script-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-brass);
  border-radius: 6px;
  padding: 0.7rem 1rem;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.3s,
    box-shadow 0.3s,
    background 0.3s;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  box-shadow: var(--shadow-card);
}
.script-card:hover {
  border-color: var(--border-gold);
  background: #FFF;
  transform: translateY(-2px) translateX(2px);
  box-shadow: var(--shadow-hover);
}

/* 难度星级：缩小 */
.card-difficulty { display: flex; gap: 2px; }
.star { font-size: 0.65rem; color: rgba(184, 153, 71, 0.25); }
.star.filled { color: var(--border-gold); }

/* 患者名字：字号略降 */
.card-name {
  font-size: 1rem;
  color: var(--text-main);
  font-weight: bold;
  margin-top: 0;
}

/* 基本信息 */
.card-meta {
  font-size: 0.65rem;
  color: var(--text-muted);
  display: flex;
  gap: 0.2rem;
}
.dot { opacity: 0.4; }
/* 分割线：减少视觉占位 */
.card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-brass), transparent);
  margin: 0;
}

/* 意象预览：精简行高 */
.card-preview {
  font-size: 0.78rem;
  color: var(--tech-teal);
  font-style: italic;
  line-height: 1.5;
  border-left: 2px solid var(--border-brass);
  padding-left: 0.6rem;
}

/* 选择提示：隐藏节省空间，hover才显示 */
.card-enter {
  font-size: 0.65rem;
  color: var(--border-brass);
  letter-spacing: 0.1em;
  text-align: right;
  transition: color 0.3s;
  margin-top: 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.script-card:hover .card-enter {
  color: var(--border-gold);
  font-weight: bold;
  opacity: 1;
}

.script-card-loading {
  align-items: center;
  justify-content: center;
  min-height: 120px;
  cursor: default;
}
.script-card-loading:hover {
  transform: none;
  border-color: var(--border-brass);
  background: var(--bg-panel);
  box-shadow: var(--shadow-card);
}
.card-loading-text {
  font-size: 0.68rem;
  color: var(--border-gold);
  letter-spacing: 0.1em;
  margin-top: 0.5rem;
}

/* 底部刷新按钮：减少间距 */
.select-footer {
  width: 100%;
  max-width: 500px;
  padding: 0.4rem 1.5rem 0.8rem;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.refresh-btn {
  padding: 0.5rem 1.4rem;
  background: transparent;
  border: 1px dashed var(--border-brass);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s;
}
.refresh-btn:not(:disabled):hover {
  border-style: solid;
  border-color: var(--border-gold);
  color: var(--border-gold);
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}
.refresh-btn:disabled { opacity: 0.3; cursor: not-allowed; }


/* ============================================================
   08. 道具选择弹窗
============================================================ */

/* 遮罩层：给弹窗留出左右空间 */
.item-select-overlay {
  align-items: flex-end;
  padding: 0 0.8rem;   /* ✅ 左右留出空间让边框可见 */
}
/* 弹窗盒子 */
.item-select-box {
  background: var(--bg-paper);
  border: 1px solid var(--border-gold);   /* ✅ 四面都有边框 */
  border-radius: 10px 10px 0 0;
  padding: 1.5rem 1.5rem 2rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow:
    0 -8px 30px rgba(60, 53, 45, 0.1),
    -1px 0 0 var(--border-gold),    /* ✅ 强化左右边框 */
    1px 0 0 var(--border-gold);
}

.is-title {
  font-size: 1.1rem;
  color: var(--text-main);
  font-weight: bold;
  letter-spacing: 0.2em;
  text-align: center;
}
.is-sub { font-size: 0.68rem; color: var(--text-muted); text-align: center; }
.is-section { display: flex; flex-direction: column; gap: 0.5rem; }
.is-section-label {
  font-size: 0.62rem;
  color: var(--border-gold);
  border-bottom: 1px solid var(--border-brass);
  padding-bottom: 0.3rem;
  letter-spacing: 0.15em;
}
.is-permanent-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.is-permanent-chip {
  font-size: 0.65rem;
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border-brass);
  padding: 0.25rem 0.6rem;
  border-radius: 3px;
}
.is-auto-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  color: var(--text-muted);
  padding: 0.3rem 0;
}
.is-auto-icon { color: var(--border-gold); font-size: 0.6rem; }
.is-consumable-grid { display: flex; flex-direction: column; gap: 0.5rem; }
.is-item-card {
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--border-brass);
  border-radius: 4px;
  padding: 0.7rem 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}
.is-item-card:hover:not(.is-maxed) {
  border-color: var(--border-gold);
  background: #FFF;
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(184, 153, 71, 0.1);
}
.is-item-card.is-selected {
  border-color: var(--tech-teal);
  background: rgba(74, 142, 139, 0.05);
}
.is-item-card.is-maxed { opacity: 0.35; cursor: not-allowed; }
.is-item-name { font-size: 0.88rem; color: var(--text-main); font-weight: bold; }
.is-item-count { font-size: 0.6rem; color: var(--tech-teal); margin: 0.15rem 0; }
.is-item-desc { font-size: 0.68rem; color: var(--text-muted); line-height: 1.6; }
.is-check {
  font-size: 0.9rem;
  color: var(--tech-teal);
  position: absolute;
  right: 0.8rem; top: 0.5rem;
}
.is-empty-hint {
  border: 1px dashed var(--border-brass);
  color: var(--text-muted);
  padding: 1.5rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.75rem;
  line-height: 2;
}
.is-actions { display: flex; gap: 0.8rem; margin-top: 0.5rem; }
.is-actions .btn-primary,
.is-actions .btn-secondary { flex: 1; text-align: center; }


/* ============================================================
   09. 梦境主界面（卷轴质感）
============================================================ */

.screen-dream {
  background: var(--bg-paper);
  display: flex;
  flex-direction: column;
  padding: 0.7rem 0.7rem 0.5rem;
  gap: 0.6rem;
  overflow: hidden;
}

.dream-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.dream-back-btn {
  padding: 0.4rem 0.9rem;
  background: transparent;
  border: 1px solid var(--border-brass);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s;
}
.dream-back-btn:hover {
  border-color: var(--border-gold);
  color: var(--text-main);
  background: #FFF;
}

.dream-round-info { font-size: 0.78rem; color: var(--text-muted); letter-spacing: 0.1em; }
.round-n { color: var(--text-main); font-size: 1rem; font-weight: bold; font-family: 'Courier New', monospace; }
.round-t { color: var(--text-muted); font-family: 'Courier New', monospace; }
.round-sep { color: var(--border-brass); margin: 0 0.2rem; }

.dream-main { flex: 1; min-height: 0; display: flex; }

/* 核心记录框：卷轴质感 */
.dream-frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-brass);
  border-radius: 6px;
  background: #FFF;
  min-height: 0;
  overflow: hidden;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.05),
    inset 0 0 20px rgba(212, 196, 168, 0.2);
}

.frame-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 0.5rem 1rem;
  background: rgba(212, 196, 168, 0.15);
  border-bottom: 1px solid var(--border-brass);
  flex-shrink: 0;
}
.frame-title {
  font-size: 0.65rem;
  color: var(--border-gold);
  letter-spacing: 0.4em;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}
.frame-orn { font-size: 0.35rem; color: var(--border-brass); }

/* 历史折叠按钮 */
.history-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: rgba(249, 246, 240, 0.95);
  border: none;
  border-bottom: 1px dashed var(--border-brass);
  cursor: pointer;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  transition: all 0.2s;
  align-self: flex-start;
  position: sticky;
  top: 0;
  z-index: 5;
  width: 100%;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}
.history-toggle:hover {
  color: var(--border-gold);
  background: #FFF;
}
.toggle-icon { font-size: 0.7rem; color: var(--border-gold); }
.toggle-text { opacity: 0.7; }

/* 内容滚动区 */
.frame-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.frame-content::-webkit-scrollbar { width: 4px; }
.frame-content::-webkit-scrollbar-thumb {
  background: var(--border-brass);
  border-radius: 2px;
}

/* 历史区 */
.history-section { display: flex; flex-direction: column; gap: 0; }
.history-list { display: flex; flex-direction: column; gap: 1.2rem; padding-bottom: 1rem; }
.history-divider {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0;
  margin-bottom: 0.8rem;
}
.hd-line { flex: 1; height: 1px; background: var(--border-brass); opacity: 0.4; }
.hd-text { font-size: 0.58rem; color: var(--text-muted); letter-spacing: 0.2em; white-space: nowrap; }

/* 历史叙事（偏淡） */
.para-narrative p {
  font-size: 0.9rem;
  line-height: 2.2;
  color: #7A7065;
  letter-spacing: 0.05em;
  text-indent: 2em;
  margin: 0;
}

/* 当前叙事（清晰深色） */
.para-current { display: flex; flex-direction: column; gap: 0.7rem; }
.para-current p {
  font-size: 1.05rem;
  line-height: 2.3;
  color: var(--text-main);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-indent: 2em;
  margin: 0;
}

/* 内心活动 */
.para-inner {
  font-size: 0.88rem;
  color: var(--tech-teal);
  font-style: italic;
  line-height: 1.9;
  padding: 0.5rem 1rem;
  border-left: 2px solid var(--tech-teal-dim);
  border-radius: 0 3px 3px 0;
}
.current-inner {
  border-left-color: var(--tech-teal);
  background: rgba(74, 142, 139, 0.05);
}

.para-choice {
  font-size: 0.82rem;
  color: var(--text-muted);
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  letter-spacing: 0.06em;
}
.choice-arrow { color: var(--border-gold); flex-shrink: 0; }
.para-system {
  font-size: 0.72rem;
  color: var(--border-gold);
  text-align: center;
  letter-spacing: 0.2em;
  padding: 0.3rem 0;
}

/* 机械仪表盘状态条 */
.frame-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1.2rem;
  border-top: 1px solid var(--border-brass);
  background: #F9F6F0;
  flex-shrink: 0;
}
.fstat-item { display: flex; align-items: center; gap: 0.6rem; flex: 1; }
.fstat-label {
  font-size: 0.72rem;
  color: var(--text-main);
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.08em;
}
.fstat-track {
  flex: 1;
  height: 5px;
  background: rgba(60, 53, 45, 0.06);
  border: 1px solid var(--border-brass);
  border-radius: 3px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.fstat-fill { height: 100%; border-radius: 2px; }
.fill-load {
  background: var(--safe-green);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.fill-load.danger {
  background: var(--alert-red);
  animation: ecgAlert 0.8s ease-in-out infinite alternate;
}
@keyframes ecgAlert {
  0%   { opacity: 0.6; }
  100% { opacity: 1; background: #E03E3E; }
}
.fill-resonance {
  background: var(--tech-teal);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.fill-resonance.full {
  background: var(--border-gold);
  box-shadow: var(--glow-brass);
  animation: resFull 0.8s ease-in-out infinite alternate;
}
@keyframes resFull {
  0%   { opacity: 0.7; }
  100% { opacity: 1; filter: brightness(1.2); }
}

.fstat-num {
  font-size: 0.78rem;
  color: var(--text-main);
  font-family: 'Courier New', monospace;
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0;
}
.fstat-num.danger {
  color: var(--alert-red);
  animation: numBlink 1s ease-in-out infinite alternate;
}
@keyframes numBlink { 0% { opacity: 1; } 100% { opacity: 0.4; } }
.fstat-divider { width: 1px; height: 16px; background: var(--border-brass); flex-shrink: 0; }

/* Loading（我们的波形动画，Gemini的颜色） */
.dream-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem;
  flex-shrink: 0;
}
.loading-wave { display: flex; align-items: flex-end; gap: 3px; height: 20px; }
.loading-wave span {
  display: block;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--border-gold), rgba(184, 153, 71, 0.2));
  box-shadow: 0 0 6px rgba(184, 153, 71, 0.3);
  animation: wavePulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.loading-wave span:nth-child(1) { animation-delay: 0s; }
.loading-wave span:nth-child(2) { animation-delay: 0.1s; }
.loading-wave span:nth-child(3) { animation-delay: 0.2s; }
.loading-wave span:nth-child(4) { animation-delay: 0.3s; }
.loading-wave span:nth-child(5) { animation-delay: 0.4s; }
@keyframes wavePulse {
  0%, 100% { height: 4px; opacity: 0.3; box-shadow: none; }
  50%       { height: 20px; opacity: 1; box-shadow: 0 0 10px rgba(184, 153, 71, 0.5); }
}
.loading-text-row {
  font-size: 0.65rem;
  color: var(--border-gold);
  letter-spacing: 0.35em;
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { opacity: 0.4; letter-spacing: 0.3em; }
  50%       { opacity: 0.9; letter-spacing: 0.4em; }
}

/* 共振满横幅 */
.must-evacuate-banner {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 4px 15px rgba(184, 153, 71, 0.1);
  animation: evacuatePulse 1.5s ease-in-out infinite alternate;
}
@keyframes evacuatePulse {
  0%   { border-color: rgba(184, 153, 71, 0.4); box-shadow: 0 4px 15px rgba(184, 153, 71, 0.05); }
  100% { border-color: var(--border-gold); box-shadow: 0 4px 20px rgba(184, 153, 71, 0.2); }
}

/* 濒死横幅 */
.dying-banner {
  background: #FFF;
  border: 1px solid var(--alert-red);
  border-radius: 6px;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  animation: dyingPulse 1s ease-in-out infinite alternate;
}
@keyframes dyingPulse {
  0%   { border-color: rgba(181, 74, 74, 0.4); }
  100% { border-color: var(--alert-red); box-shadow: 0 4px 20px rgba(181, 74, 74, 0.15); }
}

.evacuate-icon {
  color: var(--border-gold);
  font-size: 1.2rem;
  animation: iconBlink 0.8s ease-in-out infinite alternate;
}
.dying-icon {
  color: var(--alert-red);
  font-size: 1.2rem;
  animation: iconBlink 0.6s ease-in-out infinite alternate;
}
@keyframes iconBlink { 0% { opacity: 0.5; } 100% { opacity: 1; } }

.evacuate-msg, .dying-msg {
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-weight: bold;
}
.evacuate-msg { color: var(--text-main); }
.dying-msg    { color: var(--alert-red); }
.evacuate-sub, .dying-sub { font-size: 0.65rem; letter-spacing: 0.1em; font-weight: normal; }
.evacuate-sub { color: var(--text-muted); }
.dying-sub    { color: rgba(181, 74, 74, 0.8); }

.dying-countdown {
  font-size: 1.1rem;
  color: var(--alert-red);
  font-family: 'Courier New', monospace;
  font-weight: bold;
  animation: numBlink 0.6s ease-in-out infinite alternate;
}

.btn-evacuate-now {
  padding: 0.55rem 2rem;
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: bold;
  letter-spacing: 0.2em;
  cursor: pointer;
  background: #FFF;
  color: var(--border-gold);
  transition: all 0.2s;
}
.btn-evacuate-now:hover {
  background: var(--border-gold);
  color: #FFF;
  transform: translateY(-1px);
}
.btn-evacuate-now.dying-evacuate {
  border-color: var(--alert-red);
  color: var(--alert-red);
}
.btn-evacuate-now.dying-evacuate:hover {
  background: var(--alert-red);
  color: #FFF;
}

/* 底部操作面板 */
.dream-bottom-panel {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 38vh;
  background: #FFF;
  border: 1px solid var(--border-brass);
  border-radius: 6px;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.03);
}

.panel-tabs {
  display: flex;
  position: relative;
  border-bottom: 1px solid var(--border-brass);
  flex-shrink: 0;
  background: rgba(249, 246, 240, 0.6);
}
.panel-tab {
  flex: 1;
  padding: 0.4rem 0;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}
.panel-tab.active { color: var(--border-gold); }
.tab-icon { font-size: 0.55rem; opacity: 0.7; }
.tab-indicator {
  position: absolute;
  bottom: 0; left: 0;
  width: 50%; height: 2px;
  background: var(--border-gold);
  transition: transform 0.25s ease;
}
.tab-indicator.right { transform: translateX(100%); }

.panel-slide {
  overflow-y: auto;
  padding: 0.5rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: calc(38vh - 36px);
}
.panel-slide::-webkit-scrollbar { width: 3px; }
.panel-slide::-webkit-scrollbar-thumb { background: var(--border-brass); border-radius: 2px; }

.choices-waiting {
  font-size: 0.68rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-align: center;
  padding: 0.8rem;
}
.panel-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  flex-shrink: 0;
  padding-top: 0.3rem;
  border-top: 1px dashed var(--border-brass);
}

/* 道具栏 */
.tools-scroll-area { overflow-x: auto; overflow-y: hidden; padding-bottom: 0.5rem; }
.tools-scroll-area::-webkit-scrollbar { height: 2px; }
.tools-scroll-area::-webkit-scrollbar-thumb { background: var(--border-brass); border-radius: 1px; }
.tools-row { display: flex; gap: 0.8rem; min-width: max-content; padding: 0 0.5rem; }

.tool-slot-h {
  width: 76px;
  height: 90px;
  flex-shrink: 0;
  background: rgba(249, 246, 240, 0.5);
  border: 1px dashed var(--border-brass);
  border-radius: 4px;
  padding: 0.8rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}
.tool-slot-h:hover:not(.empty) {
  border-style: solid;
  border-color: var(--border-gold);
  background: #FFF;
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(184, 153, 71, 0.1);
}
.tool-slot-h.active {
  border-style: solid;
  border-color: var(--tech-teal);
  background: rgba(74, 142, 139, 0.05);
}
.tool-slot-h.empty { opacity: 0.35; cursor: default; }
.tool-icon-h {
  width: 32px; height: 32px;
  border: 1px solid var(--border-gold);
  border-radius: 50%;
  background: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: var(--border-gold);
}
.tool-name-h {
  font-size: 0.65rem;
  color: var(--text-main);
  font-weight: bold;
  text-align: center;
  line-height: 1.2;
}
.tool-count {
  font-size: 0.55rem;
  color: #FFF;
  background: var(--border-gold);
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-family: 'Courier New', monospace;
}

.staged-item-bar {
  background: rgba(74, 142, 139, 0.08);
  border: 1px solid var(--tech-teal);
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}
.staged-text { font-size: 0.75rem; color: var(--tech-teal); font-weight: bold; }
.cancel-item-btn {
  background: transparent;
  border: none;
  color: var(--alert-red);
  font-size: 0.7rem;
  cursor: pointer;
  text-decoration: underline;
}

.active-item-desc {
  margin-top: 1rem;
  padding: 0.8rem;
  background: #FFF;
  border: 1px solid var(--border-brass);
  border-radius: 4px;
  border-left: 3px solid var(--tech-teal);
}

.permanent-tool-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem 0 0;
  border-top: 1px dashed var(--border-brass);
  margin-top: 0.3rem;
}
.permanent-tool-label { font-size: 0.58rem; color: var(--text-muted); letter-spacing: 0.2em; }
.permanent-tool-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.permanent-chip {
  background: #FFF;
  border: 1px solid var(--border-brass);
  color: var(--text-main);
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.permanent-chip:hover { border-color: var(--border-gold); background: rgba(184, 153, 71, 0.05); }
.permanent-chip.expanded { border-color: var(--border-gold); background: rgba(184, 153, 71, 0.05); }
.permanent-chip-name { font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.05em; }
.permanent-chip-arrow { font-size: 0.5rem; color: var(--border-brass); }
.permanent-desc-box {
  background: #FFF;
  border: 1px solid var(--border-brass);
  border-radius: 4px;
  padding: 0.6rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.permanent-desc-name { font-size: 0.7rem; color: var(--border-gold); letter-spacing: 0.08em; font-weight: bold; }
.permanent-desc-text { font-size: 0.63rem; color: var(--text-muted); line-height: 1.7; letter-spacing: 0.04em; }

/* 功能按钮（统一风格） */
.btn-watch,
.btn-insight,
.btn-save,
.btn-escape {
  padding: 0.35rem 0.8rem;
  background: transparent;
  border: 1px solid var(--border-brass);
  border-radius: 3px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-watch:hover,
.btn-insight:hover,
.btn-save:hover {
  border-color: var(--border-gold);
  color: var(--border-gold);
  background: #FFF;
  transform: translateY(-1px);
}
.btn-escape:hover {
  border-color: var(--alert-red);
  color: var(--alert-red);
  transform: translateY(-1px);
}

.insight-hint-bar {
  font-size: 0.68rem;
  color: var(--tech-teal);
  background: rgba(74, 142, 139, 0.06);
  border: 1px solid rgba(74, 142, 139, 0.25);
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  letter-spacing: 0.08em;
  line-height: 1.6;
}


/* ============================================================
   10. 逃脱面板
============================================================ */

.dream-choices { flex-shrink: 0; padding: 0 0.2rem 0.2rem; }
.escape-result {
  font-size: 0.88rem;
  color: var(--tech-teal);
  letter-spacing: 0.1em;
  text-align: center;
  padding: 0.5rem;
  font-weight: bold;
}
.escape-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
}


/* ============================================================
   11. 结算页
============================================================ */

.screen-settlement {
  background: var(--bg-paper);
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

/* 呼吸页 */
.breath-screen { max-width: 460px; text-align: center; padding: 2rem; }
.breath-text { font-size: 0.9rem; color: var(--text-muted); line-height: 2.3; letter-spacing: 0.08em; }
.breath-para { margin: 0 0 1.2rem 0; font-size: 0.92rem; color: var(--text-muted); line-height: 2.3; letter-spacing: 0.08em; }
.breath-para:last-child { margin-bottom: 0; }
.breath-dismiss-btn {
  margin-top: 2rem;
  padding: 0.6rem 2rem;
  background: transparent;
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.3s;
}
.breath-dismiss-btn:hover {
  background: rgba(184, 153, 71, 0.08);
  transform: translateY(-1px);
}

/* 结算卡片 */
.settlement-card {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(184, 153, 71, 0.1);
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.settlement-card::-webkit-scrollbar { width: 3px; }
.settlement-card::-webkit-scrollbar-thumb { background: var(--border-brass); border-radius: 2px; }

.settle-orn { font-size: 0.6rem; color: var(--border-brass); }
.settle-result-label { font-size: 1rem; color: var(--border-gold); letter-spacing: 0.6em; }
.settle-result-name {
  font-size: 2.2rem;
  color: var(--text-main);
  font-weight: bold;
  letter-spacing: 0.3em;
  text-shadow: 0 2px 10px rgba(184, 153, 71, 0.15);
}
.settle-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-brass), transparent);
}
.settle-stats { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
.settle-row { display: flex; justify-content: space-between; font-size: 1rem; }
.sl { color: var(--text-muted); }
.sr { color: var(--border-gold); font-family: 'Courier New', monospace; font-weight: bold; }

.patient-future {
  background: rgba(249, 246, 240, 0.6);
  border: 1px solid var(--border-brass);
  padding: 1rem;
  border-radius: 4px;
  width: 100%;
}
.pf-label {
  font-size: 0.6rem;
  color: var(--border-gold);
  letter-spacing: 0.3em;
  text-align: center;
  margin-bottom: 0.7rem;
}
.pf-scroll {
  max-height: 35vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 0.3rem;
}
.pf-scroll::-webkit-scrollbar { width: 2px; }
.pf-scroll::-webkit-scrollbar-thumb { background: var(--border-brass); border-radius: 1px; }
.pf-text {
  font-size: 0.82rem;
  color: var(--text-main);
  line-height: 2.2;
  margin: 0 0 1rem 0;
  letter-spacing: 0.04em;
}
.pf-text:last-child { margin-bottom: 0; }
.settle-actions { display: flex; gap: 0.8rem; flex-wrap: nowrap; }


/* ============================================================
   12. 档案页 & 患者手册
============================================================ */

.screen-profile {
  background: var(--bg-paper);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}
.profile-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}
.profile-scroll-container::-webkit-scrollbar { width: 3px; }
.profile-scroll-container::-webkit-scrollbar-thumb { background: var(--border-brass); }

.section-title {
  font-size: 0.65rem;
  color: var(--border-gold);
  font-weight: bold;
  letter-spacing: 0.2em;
  border-bottom: 1px solid var(--border-brass);
  padding-bottom: 0.3rem;
  margin-top: 1rem;
}

/* 档案头部卡片 */
.profile-header-card {
  background: #FFF;
  border: 1px solid var(--border-brass);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}
.header-top-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 0.5rem; }

.avatar-edit-container { position: relative; cursor: pointer; border-radius: 50%; flex-shrink: 0; }
.big-avatar {
  width: 64px; height: 64px;
  font-size: 1.8rem;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--border-gold);
  background: rgba(184, 153, 71, 0.1);
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s;
  color: var(--border-gold);
}
.avatar-edit-container:hover .big-avatar { filter: brightness(0.85); }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.edit-hint {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; color: #FFF; opacity: 0;
  transition: opacity 0.3s; pointer-events: none;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  z-index: 10;
}
.avatar-edit-container:hover .edit-hint { opacity: 1; }

.name-edit-row { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.name-input {
  background: transparent;
  border: none;
  border-bottom: 1px dashed var(--border-brass);
  color: var(--text-main);
  font-size: 1.5rem;
  font-weight: bold;
  font-family: inherit;
  letter-spacing: 0.1em;
  padding: 0.2rem 0;
  outline: none;
  width: 100%;
  transition: border-color 0.3s;
}
.name-input:focus { border-bottom-color: var(--border-gold); }

.level-progress-bar {
  height: 4px;
  background: rgba(184, 153, 71, 0.15);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}
.lp-fill {
  height: 100%;
  background: var(--border-gold);
  transition: width 0.5s ease-out;
}
.lp-text {
  font-size: 0.6rem;
  color: var(--text-muted);
  text-align: right;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

/* 统计数据格 */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
.stat-box {
  background: #FFF;
  border: 1px solid var(--border-brass);
  padding: 0.8rem;
  border-radius: 6px;
  text-align: center;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}
.stat-box:hover {
  border-color: var(--border-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(184, 153, 71, 0.1);
}
.s-label { font-size: 0.6rem; color: var(--text-muted); margin-bottom: 0.4rem; }
.s-val { font-size: 1.2rem; color: var(--text-main); font-family: 'Courier New', monospace; font-weight: bold; }
.s-sub { font-size: 0.5rem; color: var(--tech-teal); }

/* 剧本星级统计 */
.stars-record {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.6);
  padding: 1rem;
  border-radius: 6px;
  border: 1px dashed var(--border-brass);
}
.star-row { display: flex; align-items: center; gap: 0.8rem; }
.sr-stars { width: 60px; font-size: 0.6rem; color: var(--border-gold); text-align: right; }
.sr-bar-bg { flex: 1; height: 6px; background: rgba(184, 153, 71, 0.12); border-radius: 3px; overflow: hidden; }
.sr-bar-fill { height: 100%; background: var(--border-gold); border-radius: 3px; transition: width 0.5s; }
.sr-count { width: 20px; font-size: 0.7rem; color: var(--text-main); font-weight: bold; font-family: 'Courier New', monospace; }

/* 称号装配 */
.titles-container { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.title-btn {
  background: transparent;
  border: 1px solid var(--border-brass);
  color: var(--text-muted);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
}
.title-btn:hover {
  border-color: var(--border-gold);
  color: var(--text-main);
  transform: translateY(-1px);
  background: #FFF;
}
.title-btn.active {
  background: rgba(184, 153, 71, 0.1);
  border-color: var(--border-gold);
  color: var(--border-gold);
  font-weight: bold;
}

/* 成就列表 */
.achievements-list { display: flex; flex-direction: column; gap: 0.8rem; }
.ach-card {
  background: rgba(255, 255, 255, 0.4);
  border: 1px dashed var(--border-brass);
  border-radius: 6px;
  padding: 1rem;
  opacity: 0.55;
  filter: grayscale(70%);
  transition: all 0.3s;
}
.ach-card.unlocked {
  opacity: 1;
  filter: none;
  border-style: solid;
  border-color: var(--border-gold);
  background: #FFF;
  box-shadow: 0 2px 8px rgba(184, 153, 71, 0.05);
}
.ach-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; }
.ach-name { font-size: 0.9rem; color: var(--text-main); font-weight: bold; letter-spacing: 0.1em; }
.ach-status { font-size: 0.6rem; color: var(--border-gold); font-family: 'Courier New', monospace; }
.ach-desc { font-size: 0.7rem; color: var(--text-muted); line-height: 1.6; }
.ach-rewards { margin-top: 0.6rem; display: flex; gap: 1rem; font-size: 0.65rem; color: var(--safe-green); font-weight: bold; }


/* ============================================================
   13. 商店页
============================================================ */

.screen-shop {
  background: var(--bg-paper);
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.shop-grid {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
  max-width: 500px;
  padding: 0 1.5rem 2rem;
}

/* 商店卡片 */
.shop-item-card {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--border-brass);
  border-radius: 6px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: var(--shadow-card);
}
.shop-item-card:hover:not(.locked):not(.soldout) {
  border-color: var(--border-gold);
  background: #FFF;
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}
.shop-item-card.locked { opacity: 0.5; filter: grayscale(100%); }
.shop-item-card.soldout { opacity: 0.5; border-style: dashed; }

.item-header { display: flex; justify-content: space-between; align-items: center; }
.item-name { font-size: 1rem; color: var(--text-main); font-weight: bold; letter-spacing: 0.1em; }
.item-owned { font-size: 0.7rem; color: var(--tech-teal); font-family: 'Courier New', monospace; }
.item-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.6; }
.item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem; }
.item-price { font-size: 0.85rem; color: var(--tech-teal); font-family: 'Courier New', monospace; font-weight: bold; }

.buy-btn {
  padding: 0.4rem 1.2rem;
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  color: var(--border-gold);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.buy-btn:hover:not(:disabled) {
  background: rgba(184, 153, 71, 0.1);
  transform: translateY(-1px);
}
.buy-btn:disabled {
  background: transparent;
  border: 1px dashed var(--border-brass);
  color: var(--text-muted);
  cursor: not-allowed;
}


/* ============================================================
   14. 弹窗 & 模态框
============================================================ */

.pause-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(247, 244, 235, 0.88);
  backdrop-filter: blur(6px);
  z-index: 100;
}

.pause-box {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 2rem 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 240px;
  box-shadow:
    0 10px 40px rgba(184, 153, 71, 0.15),
    0 0 0 6px rgba(255, 255, 255, 0.5);
}
.pause-title { font-size: 1.2rem; color: var(--text-main); font-weight: bold; letter-spacing: 0.3em; }
.pause-sub { font-size: 0.7rem; color: var(--text-muted); letter-spacing: 0.15em; line-height: 1.8; }
.pause-actions { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; }

.detail-overlay { align-items: flex-end; }
.detail-box {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 8px 8px 0 0;
  border-bottom: none;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
  box-shadow: 0 -8px 30px rgba(184, 153, 71, 0.1);
}
.detail-topbar { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.detail-difficulty { display: flex; gap: 2px; }
.detail-close-btn {
  background: transparent; border: none;
  color: var(--text-muted); font-size: 0.9rem;
  cursor: pointer; padding: 0.2rem 0.5rem; transition: color 0.2s;
}
.detail-close-btn:hover { color: var(--border-gold); }
.detail-identity { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.5rem; }
.detail-name { font-size: 1.5rem; color: var(--text-main); font-weight: bold; letter-spacing: 0.2em; }
.detail-meta {
  font-size: 0.7rem; color: var(--text-muted);
  letter-spacing: 0.1em;
  display: flex; align-items: center; gap: 0.3rem;
}
.detail-dot { opacity: 0.4; }
.detail-divider { height: 1px; background: var(--border-brass); flex-shrink: 0; margin: 0.5rem 0; }
.detail-preview {
  font-size: 0.82rem; color: var(--tech-teal);
  line-height: 1.9; font-style: italic; padding: 0.5rem 0;
}
.detail-actions { display: flex; gap: 0.8rem; flex-shrink: 0; margin-top: 1rem; }
.detail-actions .btn-primary,
.detail-actions .btn-secondary { flex: 1; text-align: center; }


/* ============================================================
   15. 升级弹窗
============================================================ */

.levelup-box {
  background: #FFF;
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  padding: 2rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-width: 280px;
  max-width: 340px;
  box-shadow:
    0 10px 40px rgba(184, 153, 71, 0.15),
    0 0 0 6px rgba(255, 255, 255, 0.5);
  text-align: center;
}

.levelup-orn {
  font-size: 1rem;
  color: var(--border-gold);
  animation: titleGlow 2s infinite alternate;
}
.levelup-title {
  font-size: 1.3rem;
  color: var(--text-main);
  font-weight: bold;
  letter-spacing: 0.4em;
}
.levelup-level {
  font-size: 0.7rem;
  color: var(--tech-teal);
  letter-spacing: 0.2em;
  font-weight: bold;
}
.levelup-rewards {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.8rem;
  background: rgba(184, 153, 71, 0.05);
  border: 1px solid var(--border-brass);
  border-radius: 4px;
  text-align: left;
}
.levelup-reward-row {
  font-size: 0.78rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.reward-icon { color: var(--border-gold); font-size: 0.6rem; }

.levelup-choice-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.levelup-choice-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.2em;
}
.levelup-choices { display: flex; flex-direction: column; gap: 0.6rem; text-align: left; }
.levelup-choice-card {
  padding: 0.8rem 1rem;
  border: 1px dashed var(--border-brass);
  border-radius: 4px;
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.25s,
    background 0.25s,
    box-shadow 0.25s;
  background: rgba(255, 255, 255, 0.5);
}
.levelup-choice-card:hover {
  border-style: solid;
  border-color: var(--border-gold);
  background: #FFF;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(184, 153, 71, 0.1);
}
.lc-label {
  font-size: 0.88rem;
  color: var(--border-gold);
  font-weight: bold;
  letter-spacing: 0.08em;
  margin-bottom: 0.3rem;
}
.lc-desc { font-size: 0.65rem; color: var(--text-muted); line-height: 1.6; }
.levelup-actions { margin-top: 0.5rem; }


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
  .settlement-card::-webkit-scrollbar { display: none; }
  .frame-content, .panel-slide, .profile-scroll-container, .settlement-card {
    -ms-overflow-style: none;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .back-btn      { padding: 0.6rem 1.2rem; font-size: 0.85rem; }
  .title-btn     { padding: 1rem 1.5rem; font-size: 1rem; }
  .hub-menu-item { padding: 1rem 1.2rem; }
  .panel-tab     { padding: 0.8rem 0; font-size: 0.85rem; }
  .dream-main    { margin-bottom: 0.2rem; }
  .frame-content { padding: 0.8rem 1rem; gap: 1rem; }
  .para-current p { line-height: 2.1; font-size: 1rem; }
  .tool-slot-h   { width: 80px; }
}

</style>
