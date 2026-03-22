<template>
  <div class="dream-layer">

    <Transition name="fade">
    <div v-if="phase === 'title'" class="screen screen-title">
      <div class="title-bg"></div>
      <div class="title-scanlines"></div>
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
</script>

<style scoped>
.dream-layer {
  width: 100vw;
  height: 100vh;
  background: #06060e;
  color: #d0c8b8;
  font-family: 'KaiTi', 'STKaiti', serif;
  overflow: hidden;
  position: relative;
}

.screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.6s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.story-fade-enter-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.story-fade-leave-active { transition: opacity 0.3s ease; }
.story-fade-enter-from { opacity: 0; transform: translateX(20px); }
.story-fade-leave-to { opacity: 0; }

.back-btn {
  padding: 0.45rem 1rem;
  background: transparent;
  border: 1px solid rgba(200,170,80,0.2);
  border-radius: 3px;
  color: #6a5a38;
  font-family: inherit;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.back-btn:hover { border-color: rgba(200,170,80,0.5); color: #a08850; }

/* ===========================
   标题界面
=========================== */
.screen-title {
  align-items: center;
  justify-content: center;
  background: #04040a;
  overflow: hidden;
}
.title-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(60,40,100,0.3) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 60%, rgba(20,40,80,0.3) 0%, transparent 60%);
  animation: titleBgShift 8s ease-in-out infinite alternate;
}
@keyframes titleBgShift { 0% { opacity: 0.6; } 100% { opacity: 1; } }
.title-scanlines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,80,200,0.02) 2px, rgba(100,80,200,0.02) 4px);
  pointer-events: none;
}
.title-content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  gap: 0.8rem; opacity: 0; transform: translateY(16px);
  transition: opacity 1.2s ease, transform 1.2s ease;
  width: 100%; max-width: 320px; padding: 0 1.5rem;
}
.title-content.visible { opacity: 1; transform: translateY(0); }
.title-tag { font-size: 0.52rem; color: rgba(140,120,200,0.5); letter-spacing: 0.3em; font-family: 'Courier New', monospace; }
.title-main {
  font-size: 2rem; letter-spacing: 0.3em; color: #c8b880;
  text-shadow: 0 0 20px rgba(200,184,128,0.3), 0 0 40px rgba(200,184,128,0.1);
  animation: titleGlow 4s ease-in-out infinite alternate;
}
@keyframes titleGlow {
  0% { text-shadow: 0 0 20px rgba(200,184,128,0.2), 0 0 40px rgba(200,184,128,0.05); }
  100% { text-shadow: 0 0 25px rgba(200,184,128,0.5), 0 0 50px rgba(200,184,128,0.2); }
}
.title-sub { font-size: 0.78rem; color: #6a5838; letter-spacing: 0.25em; }
.title-subject { font-size: 0.68rem; color: rgba(180,160,100,0.5); letter-spacing: 0.15em; font-family: 'Courier New', monospace; }
.subject-bracket { color: rgba(180,160,100,0.3); }
.title-divider { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,180,100,0.3), transparent); margin: 0.2rem 0; }
.title-actions { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; }
.title-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 0.75rem 1.2rem; border-radius: 3px; font-family: inherit;
  font-size: 0.85rem; letter-spacing: 0.15em; cursor: pointer; transition: all 0.25s; width: 100%;
}
.title-btn.primary { background: linear-gradient(135deg, rgba(80,60,20,0.8), rgba(50,35,10,0.8)); border: 1px solid rgba(200,170,80,0.4); color: #d8c890; }
.title-btn.primary:hover { border-color: rgba(200,170,80,0.7); background: linear-gradient(135deg, rgba(100,75,25,0.9), rgba(65,45,15,0.9)); transform: translateX(4px); }
.title-btn.secondary { background: transparent; border: 1px solid rgba(200,170,80,0.15); color: #7a6838; }
.title-btn.secondary:hover:not(.disabled) { border-color: rgba(200,170,80,0.35); color: #a08848; }
.title-btn.secondary.disabled { opacity: 0.3; cursor: not-allowed; }
.btn-icon { font-size: 0.7rem; opacity: 0.7; }
.title-footer { margin-top: 0.2rem; text-align: center; }
.back-link { background: transparent; border: none; color: #3a3028; font-family: inherit; font-size: 0.65rem; letter-spacing: 0.15em; cursor: pointer; transition: color 0.2s; padding: 0.3rem; }
.back-link:hover { color: #6a5838; }

/* ===========================
   故事背景
=========================== */
.screen-story { justify-content: space-between; overflow: hidden; }
.story-nav-top { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem; flex-shrink: 0; position: relative; z-index: 10; }
.story-progress { display: flex; gap: 6px; }
.progress-dot { width: 20px; height: 2px; background: rgba(200,170,80,0.15); border-radius: 1px; transition: background 0.4s; }
.progress-dot.active { background: rgba(200,170,80,0.7); }
.story-content {
  flex: 1; display: flex; flex-direction: column; justify-content: flex-start;
  padding: 1rem 2rem; max-width: 600px; margin: 0 auto; width: 100%;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.7s ease, transform 0.7s ease;
  position: relative; z-index: 5; overflow-y: auto;
  -ms-overflow-style: none; scrollbar-width: none; -webkit-overflow-scrolling: touch;
}
.story-content::-webkit-scrollbar { display: none; }
.story-content.visible { opacity: 1; transform: translateY(0); }
.story-chapter-tag { font-size: 0.6rem; color: rgba(200,170,80,0.4); letter-spacing: 0.5em; font-family: 'Courier New', monospace; margin-bottom: 1.5rem; }
.story-body { display: flex; flex-direction: column; gap: 0.9rem; flex: 1; }
.story-lead { font-size: 1.15rem; color: #c8b880; letter-spacing: 0.12em; line-height: 1.8; font-weight: normal; }
.story-text { font-size: 0.88rem; color: #8a8070; line-height: 2.2; letter-spacing: 0.06em; }
.story-text.highlight-block { background: rgba(200,170,80,0.05); border-left: 2px solid rgba(200,170,80,0.25); padding: 0.6rem 1rem; border-radius: 0 3px 3px 0; color: #a09870; }
.story-quote { font-size: 0.88rem; color: #6a6050; line-height: 2; letter-spacing: 0.06em; font-style: italic; padding: 0.8rem 1.2rem; border-top: 1px solid rgba(200,170,80,0.1); border-bottom: 1px solid rgba(200,170,80,0.1); }
.story-quote.final-quote { color: #9a9080; font-size: 0.95rem; text-align: center; border-color: rgba(200,170,80,0.2); }
.story-actions { display: flex; justify-content: flex-end; padding: 1.2rem 0 0.5rem; flex-shrink: 0; }
.story-next-btn { padding: 0.65rem 2rem; background: transparent; border: 1px solid rgba(200,170,80,0.25); border-radius: 3px; color: #8a7848; font-family: inherit; font-size: 0.82rem; letter-spacing: 0.2em; cursor: pointer; transition: all 0.25s; }
.story-next-btn:hover { border-color: rgba(200,170,80,0.6); color: #c0a860; background: rgba(200,170,80,0.06); }
.story-next-btn.enter-btn { border-color: rgba(200,170,80,0.4); color: #c0a860; }
.story-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 40%, rgba(4,4,10,0.85) 100%); pointer-events: none; z-index: 2; }
.story-1 { background: #04040c; }
.story-bg-1 { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 30%, rgba(40,30,80,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(20,40,60,0.4) 0%, transparent 50%); animation: bg1Drift 10s ease-in-out infinite alternate; }
@keyframes bg1Drift { 0% { transform: scale(1) translateX(0); } 100% { transform: scale(1.05) translateX(-10px); } }
.story-2 { background: #020510; }
.story-bg-2 { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 60%, rgba(10,20,60,0.6) 0%, transparent 60%); animation: bg2Pulse 6s ease-in-out infinite alternate; }
@keyframes bg2Pulse { 0% { opacity: 0.7; } 100% { opacity: 1; } }
.story-3 { background: #040408; }
.story-bg-3 { position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 30%, rgba(40,40,80,0.5) 0%, transparent 55%), radial-gradient(ellipse at 30% 70%, rgba(20,60,60,0.3) 0%, transparent 45%); }
.story-4 { background: #060404; }
.story-bg-4 { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, rgba(80,50,10,0.4) 0%, transparent 55%); animation: bg4Warm 8s ease-in-out infinite alternate; }
@keyframes bg4Warm { 0% { opacity: 0.7; transform: scale(1); } 100% { opacity: 1; transform: scale(1.03); } }

/* ===========================
   调律者中枢
=========================== */
.screen-hub { background: #04040c; overflow-y: auto; padding: 0; display: flex; flex-direction: column; padding-top: 1.5rem; }
.hub-topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; flex-shrink: 0; }
.hub-title-tag { font-size: 0.5rem; color: rgba(200,170,80,0.4); letter-spacing: 0.25em; font-family: 'Courier New', monospace; }
.hub-profile { display: flex; align-items: center; gap: 0.8rem; margin: 0 1.5rem 1.2rem; padding: 0.8rem 1rem; background: rgba(200,170,80,0.04); border: 1px solid rgba(200,170,80,0.12); border-radius: 6px; }
.profile-avatar { width: 40px; height: 40px; border: 1px solid rgba(200,170,80,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: #c0a860; flex-shrink: 0; }
.profile-info { flex: 1; }
.profile-name { font-size: 0.88rem; color: #c0b870; letter-spacing: 0.1em; }
.profile-meta { font-size: 0.72rem; color: #6a5030; letter-spacing: 0.08em; margin-top: 0.3rem; }
.profile-badge { font-size: 0.65rem; color: rgba(200,170,80,0.4); font-family: 'Courier New', monospace; letter-spacing: 0.1em; }
.clickable-profile { cursor: pointer; transition: transform 0.2s, background 0.2s; }
.clickable-profile:hover { transform: translateX(4px); background: rgba(200,170,80,0.08); border-color: rgba(200,170,80,0.3); }
.hub-stats-bar { margin: 0 1.5rem 1rem; padding: 0.8rem 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(200,170,80,0.08); border-radius: 6px; display: flex; gap: 0.8rem; align-items: flex-start; }
.hub-stat-item { display: flex; gap: 0.6rem; flex: 1; align-items: flex-start; }
.hub-stat-icon { font-size: 0.9rem; flex-shrink: 0; margin-top: 0.1rem; }
.load-icon { color: #5ab090; }
.res-icon { color: #5080c0; }
.hub-stat-name { font-size: 0.7rem; color: #8a7848; letter-spacing: 0.1em; margin-bottom: 0.2rem; }
.hub-stat-desc { font-size: 0.72rem; color: #5a4828; line-height: 1.7; letter-spacing: 0.04em; }
.hub-stat-divider { width: 1px; background: rgba(200,170,80,0.08); align-self: stretch; flex-shrink: 0; }
.hub-menu { display: flex; flex-direction: column; gap: 0.5rem; padding: 0 1.5rem; }
.hub-menu-item { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; border: 1px solid rgba(200,170,80,0.1); border-radius: 6px; background: rgba(255,255,255,0.01); cursor: pointer; transition: all 0.2s; }
.hub-menu-item:hover { border-color: rgba(200,170,80,0.3); background: rgba(200,170,80,0.04); }
.hub-menu-item.primary-item { border-color: rgba(200,170,80,0.25); background: rgba(200,170,80,0.06); }
.hub-menu-item.primary-item:hover { border-color: rgba(200,170,80,0.5); background: rgba(200,170,80,0.1); }
.menu-item-left { display: flex; align-items: center; gap: 0.8rem; }
.menu-icon { font-size: 0.8rem; color: rgba(200,170,80,0.5); width: 20px; text-align: center; }
.menu-title { font-size: 0.85rem; color: #c0b060; letter-spacing: 0.1em; }
.menu-sub { font-size: 0.72rem; color: #5a4830; letter-spacing: 0.06em; margin-top: 0.3rem; }
.menu-arrow { font-size: 0.8rem; color: rgba(200,170,80,0.3); }
.diff-guide { padding: 0.5rem 1rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(200,170,80,0.06); border-radius: 4px; display: flex; flex-direction: column; gap: 0.7rem; }
.diff-row { display: flex; gap: 0.8rem; align-items: flex-start; }
.diff-stars { display: flex; gap: 2px; flex-shrink: 0; padding-top: 0.1rem; }
.diff-star { font-size: 0.6rem; color: rgba(200,170,80,0.15); }
.diff-star.lit { color: #c0a860; }
.diff-info { display: flex; flex-direction: column; }
.diff-name { font-size: 0.72rem; color: #8a7848; letter-spacing: 0.08em; margin-bottom: 0.15rem; }
.diff-desc { font-size: 0.62rem; color: #3a3020; line-height: 1.6; letter-spacing: 0.04em; }
.guide-content { padding: 0.5rem 1rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(200,170,80,0.06); border-radius: 4px; display: flex; flex-direction: column; gap: 0.7rem; }
.guide-item { display: flex; gap: 0.8rem; align-items: flex-start; }
.guide-num { font-size: 0.6rem; color: rgba(200,170,80,0.3); font-family: 'Courier New', monospace; flex-shrink: 0; padding-top: 0.1rem; }
.guide-text { font-size: 0.7rem; color: #5a5040; line-height: 1.8; letter-spacing: 0.05em; }
.hub-footer { padding: 1.5rem; text-align: center; margin-top: auto;  }
.hub-footer-text { font-size: 0.7rem; color: #4a3820; letter-spacing: 0.18em; }

/* ===========================
   货币与商店
=========================== */
.currency-display { display: flex; align-items: center; gap: 0.4rem; background: rgba(200,170,80,0.08); border: 1px solid rgba(200,170,80,0.2); padding: 0.3rem 0.8rem; border-radius: 12px; }
.currency-icon { font-size: 0.7rem; }
.currency-value { font-size: 0.85rem; color: #d8d0a8; font-family: 'Courier New', monospace; font-weight: bold; }
.screen-shop { background: #060610; padding: 0; overflow-y: auto; align-items: center; }
.shop-grid { display: flex; flex-direction: column; gap: 0.8rem; width: 100%; max-width: 500px; padding: 0 1.5rem 2rem; }
.shop-item-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(200,170,80,0.15); border-radius: 5px; padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; transition: all 0.3s; }
.shop-item-card:hover:not(.locked):not(.soldout) { border-color: rgba(200,170,80,0.5); background: rgba(200,170,80,0.06); }
.shop-item-card.locked { opacity: 0.4; filter: grayscale(100%); }
.shop-item-card.soldout { opacity: 0.5; border-color: rgba(100,100,100,0.2); }
.item-header { display: flex; justify-content: space-between; align-items: center; }
.item-name { font-size: 1rem; color: #c0a860; letter-spacing: 0.1em; }
.item-owned { font-size: 0.7rem; color: #8a7848; font-family: 'Courier New', monospace; }
.item-desc { font-size: 0.75rem; color: #7a6850; line-height: 1.6; }
.item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.2rem; }
.item-price { font-size: 0.85rem; color: #80c0d0; font-family: 'Courier New', monospace; font-weight: bold; }
.buy-btn { padding: 0.4rem 1.2rem; background: linear-gradient(135deg, rgba(80,60,20,0.6), rgba(50,35,10,0.6)); border: 1px solid rgba(200,170,80,0.3); border-radius: 3px; color: #d8c890; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.buy-btn:hover:not(:disabled) { background: linear-gradient(135deg, rgba(100,75,25,0.8), rgba(65,45,15,0.8)); border-color: rgba(200,170,80,0.6); }
.buy-btn:disabled { background: transparent; border-color: rgba(100,100,100,0.2); color: #6a6050; cursor: not-allowed; }

/* ===========================
   剧本选择
=========================== */
.screen-select { background: #060610; padding: 0; overflow-y: auto; align-items: center; }
.screen-nav { width: 100%; max-width: 500px; padding: 1.2rem 1.5rem 0; flex-shrink: 0; }
.select-header { text-align: center; padding: 0.8rem 1.5rem 1rem; flex-shrink: 0; }
/* 页面标题 */
.select-title { font-size: 1.2rem; color: #c0a860; letter-spacing: 0.3em; margin-bottom: 0.3rem; }
.select-sub { font-size: 0.78rem; color: #6a6050; letter-spacing: 0.2em; }
.select-sub { font-size: 0.68rem; color: #5a5040; letter-spacing: 0.2em; }
.scripts-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; }
.loading-dots { display: flex; gap: 6px; }
.loading-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(200,170,80,0.4); animation: dotBounce 1.2s ease-in-out infinite; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-6px); opacity: 1; } }
.loading-text { font-size: 0.75rem; color: #4a4030; letter-spacing: 0.2em; }
.scripts-grid { display: flex; flex-direction: column; gap: 0.8rem; width: 100%; max-width: 500px; padding: 0 1.5rem; }
.script-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(200,170,80,0.12); border-radius: 5px; padding: 1.1rem 1.3rem; cursor: pointer; transition: all 0.25s ease; display: flex; flex-direction: column; gap: 0.5rem; }
.script-card:hover { border-color: rgba(200,170,80,0.4); background: rgba(200,170,80,0.04); transform: translateX(4px); }
.card-difficulty { display: flex; gap: 2px; }
.star { font-size: 0.7rem; color: rgba(200,170,80,0.15); }
.star.filled { color: #c0a860; }
/* 卡片名字 */
.card-name { font-size: 1.1rem; color: #e0d8b0; letter-spacing: 0.08em; }

/* 卡片基本信息（年龄·职业·昏迷时长） */
.card-meta { font-size: 0.7rem; color: #7a7060; display: flex; gap: 0.2rem; }
.dot { opacity: 0.4; }
.card-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.1), transparent); }
/* 意象预览 */
.card-preview { font-size: 0.85rem; color: #8a8068; line-height: 1.9; font-style: italic; }

/* 选择此患者 */
.card-enter { font-size: 0.7rem; color: rgba(200,170,80,0.4); letter-spacing: 0.2em; text-align: right; transition: color 0.2s; }
.script-card:hover .card-enter { color: rgba(200,170,80,0.8); }
.script-card:hover .card-enter { color: rgba(200,170,80,0.7); }
.script-card-loading { align-items: center; justify-content: center; min-height: 120px; cursor: default; }
.script-card-loading:hover { transform: none; border-color: rgba(200,170,80,0.12); background: rgba(255,255,255,0.02); }
.card-loading-text { font-size: 0.68rem; color: #4a4030; letter-spacing: 0.2em; margin-top: 0.5rem; }
.select-footer { width: 100%; max-width: 500px; padding: 0.8rem 1.5rem 2rem; display: flex; justify-content: center; }
.refresh-btn { padding: 0.5rem 1.4rem; background: transparent; border: 1px solid rgba(200,170,80,0.15); border-radius: 3px; color: #6a6040; font-family: inherit; font-size: 0.78rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
.refresh-btn:not(:disabled):hover { border-color: rgba(200,170,80,0.3); color: #7a6838; }
.refresh-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ===========================
   患者详情弹窗
=========================== */
.detail-overlay { align-items: flex-end; }
.detail-box { background: rgba(6,6,14,0.98); border: 1px solid rgba(200,170,80,0.2); border-radius: 10px 10px 0 0; padding: 1.5rem 1.5rem 2rem; width: 100%; max-width: 500px; margin: 0 auto; max-height: 60vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.detail-topbar { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.detail-difficulty { display: flex; gap: 2px; }
.detail-close-btn { background: transparent; border: none; color: #4a3820; font-size: 0.9rem; cursor: pointer; padding: 0.2rem 0.4rem; transition: color 0.2s; }
.detail-close-btn:hover { color: #8a6838; }
.detail-identity { display: flex; flex-direction: column; gap: 0.3rem; }
.detail-name { font-size: 1.5rem; color: #c0a860; letter-spacing: 0.2em; }
.detail-meta { font-size: 0.7rem; color: #5a5040; letter-spacing: 0.1em; display: flex; align-items: center; gap: 0.3rem; }
.detail-dot { opacity: 0.4; }
.detail-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.15), transparent); flex-shrink: 0; }
.detail-preview { font-size: 0.82rem; color: #6a6050; line-height: 1.9; font-style: italic; text-align: center; padding: 0.3rem 0; }
.detail-actions { display: flex; gap: 0.8rem; flex-shrink: 0; margin-top: 0.5rem; }
.detail-actions .btn-primary,
.detail-actions .btn-secondary { flex: 1; text-align: center; }

/* ===========================
   道具选择弹窗
=========================== */
.item-select-overlay { align-items: flex-end; }
.item-select-box { background: rgba(6,6,14,0.98); border: 1px solid rgba(200,170,80,0.25); border-radius: 10px 10px 0 0; padding: 1.5rem 1.5rem 2rem; width: 100%; max-width: 500px; margin: 0 auto; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
.is-title { font-size: 1.1rem; color: #c0a860; letter-spacing: 0.3em; text-align: center; }
.is-sub { font-size: 0.68rem; color: #5a5040; letter-spacing: 0.15em; text-align: center; }
.is-section { display: flex; flex-direction: column; gap: 0.5rem; }
.is-section-label { font-size: 0.62rem; color: #7a6840; letter-spacing: 0.2em; border-bottom: 1px solid rgba(200,170,80,0.1); padding-bottom: 0.3rem; }
.is-permanent-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.is-permanent-chip { font-size: 0.65rem; color: #a09060; background: rgba(200,170,80,0.08); border: 1px solid rgba(200,170,80,0.2); padding: 0.25rem 0.6rem; border-radius: 12px; }
.is-auto-chip { display: flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; color: #6a5838; padding: 0.3rem 0; }
.is-auto-icon { color: rgba(200,170,80,0.4); font-size: 0.6rem; }
.is-consumable-grid { display: flex; flex-direction: column; gap: 0.5rem; }
.is-item-card { position: relative; background: rgba(255,255,255,0.02); border: 1px solid rgba(200,170,80,0.12); border-radius: 5px; padding: 0.7rem 1rem; cursor: pointer; transition: all 0.2s; }
.is-item-card:hover:not(.is-maxed) { border-color: rgba(200,170,80,0.4); background: rgba(200,170,80,0.05); }
.is-item-card.is-selected { border-color: #c0a860; background: rgba(200,170,80,0.12); }
.is-item-card.is-maxed { opacity: 0.35; cursor: not-allowed; }
.is-item-name { font-size: 0.88rem; color: #d0c090; letter-spacing: 0.08em; }
.is-item-count { font-size: 0.6rem; color: #80c0d0; margin: 0.15rem 0; font-family: 'Courier New', monospace; }
.is-item-desc { font-size: 0.68rem; color: #6a6050; line-height: 1.6; }
.is-check { position: absolute; top: 0.5rem; right: 0.8rem; font-size: 0.9rem; color: #c0a860; }
.is-empty-hint { text-align: center; font-size: 0.75rem; color: #4a3820; padding: 1.5rem; border: 1px dashed rgba(200,170,80,0.1); border-radius: 5px; line-height: 2; }
.is-actions { display: flex; gap: 0.8rem; margin-top: 0.5rem; }
.is-actions .btn-primary,
.is-actions .btn-secondary { flex: 1; text-align: center; }

/* ===========================
   梦境主界面
=========================== */
.screen-dream { background: #04040c; display: flex; flex-direction: column; padding: 0.7rem 0.7rem 0.5rem; gap: 0.6rem; overflow: hidden; }
.dream-topbar { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.dream-back-btn { padding: 0.4rem 0.9rem; background: transparent; border: 1px solid rgba(200,170,80,0.25); border-radius: 3px; color: #7a6838; font-family: inherit; font-size: 0.78rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
.dream-back-btn:hover { border-color: rgba(200,170,80,0.6); color: #c0a860; }
.dream-round-info { font-size: 0.78rem; color: #6a5838; letter-spacing: 0.1em; }
.round-n { color: #c0a860; font-size: 1rem; font-family: 'Courier New', monospace; }
.round-t { color: #8a7040; font-family: 'Courier New', monospace; }
.round-sep { color: #4a3820; margin: 0 0.2rem; }
.dream-main { flex: 1; min-height: 0; display: flex; }
.dream-frame { flex: 1; display: flex; flex-direction: column; border: 1px solid rgba(200,170,80,0.25); border-radius: 6px; background: rgba(0,0,0,0.4); min-height: 0; overflow: hidden; }
.frame-header { display: flex; align-items: center; justify-content: center; gap: 0.8rem; padding: 0.5rem 1rem; border-bottom: 1px solid rgba(200,170,80,0.12); flex-shrink: 0; }
.frame-title { font-size: 0.65rem; color: #5a4830; letter-spacing: 0.4em; font-family: 'Courier New', monospace; }
.frame-orn { font-size: 0.35rem; color: rgba(200,170,80,0.3); }
.frame-content { flex: 1; overflow-y: auto; padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 1.2rem; }
.frame-content::-webkit-scrollbar { width: 3px; }
.frame-content::-webkit-scrollbar-thumb { background: rgba(200,170,80,0.15); border-radius: 2px; }
/* 历史叙事 */
.para-narrative p {
  font-size: 0.95rem;
  line-height: 2.2;
  color: #a8a090;   /* ✅ 加亮 */
  letter-spacing: 0.05em;
  margin: 0;
  text-indent: 2em;
}
.para-narrative p { font-size: 0.9rem; line-height: 2.2; color: #9a9080; letter-spacing: 0.05em; margin: 0; text-indent: 2em; }
.para-current { display: flex; flex-direction: column; gap: 0.7rem; }
/* 叙事正文 */
.para-current p {
  font-size: 1.05rem;
  line-height: 2.3;
  color: #e8e0c8;   /* ✅ 加亮 */
  letter-spacing: 0.05em;
  margin: 0;
  text-indent: 2em;
}
/* 内心活动 */
.para-inner {
  font-size: 0.88rem;
  color: #7a7868;   /* ✅ 加亮 */
  font-style: italic;
  line-height: 1.9;
  padding: 0.5rem 1rem;
  border-left: 2px solid rgba(200,170,80,0.08);
  border-radius: 0 3px 3px 0;
}
.current-inner {
  color: #9a9880;   /* ✅ 加亮 */
  border-left-color: rgba(200,170,80,0.2);
  background: rgba(200,170,80,0.03);
}
.para-choice { font-size: 0.82rem; color: #7a6838; letter-spacing: 0.06em; display: flex; align-items: flex-start; gap: 0.5rem; }
.choice-arrow { color: rgba(200,170,80,0.4); flex-shrink: 0; }
.para-system { font-size: 0.72rem; color: #8a7040; text-align: center; letter-spacing: 0.2em; padding: 0.3rem 0; }
.history-section { display: flex; flex-direction: column; gap: 0; }
.history-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: #04040c;        /* ✅ 改成不透明背景 */
  border: none;
  border-bottom: 1px solid rgba(200,170,80,0.06);  /* ✅ 加底部分割线 */
  cursor: pointer;
  color: #8a7040; 
  font-family: inherit;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  transition: color 0.2s;
  align-self: flex-start;
  position: sticky;
  top: 0;
  z-index: 5;
  width: 100%;
  flex-shrink: 0;
}

.history-toggle:hover { color: #8a6838; }
.toggle-icon { font-size: 0.7rem; color: rgba(200,170,80,0.4); }
.toggle-text { opacity: 0.6; }
.history-list { display: flex; flex-direction: column; gap: 1.2rem; padding-bottom: 1rem; }
.history-divider { display: flex; align-items: center; gap: 0.8rem; padding: 0.5rem 0; margin-bottom: 0.8rem; }
.hd-line { flex: 1; height: 1px; background: rgba(200,170,80,0.08); }
.hd-text { font-size: 0.58rem; color: #3a2a10; letter-spacing: 0.2em; white-space: nowrap; }
.frame-status { display: flex; align-items: center; gap: 1rem; padding: 0.6rem 1.2rem; border-top: 1px solid rgba(200,170,80,0.12); background: rgba(0,0,0,0.3); flex-shrink: 0; }
.fstat-item { display: flex; align-items: center; gap: 0.6rem; flex: 1; }
/* 状态栏文字 */
.fstat-label {
  font-size: 0.72rem;   /* ✅ 放大 */
  color: #7a6840;       /* ✅ 加亮 */
  letter-spacing: 0.08em;
  white-space: nowrap;
  flex-shrink: 0;
}
.fstat-track { flex: 1; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.fstat-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.fill-load { background: linear-gradient(90deg, #3a7060, #5ab090); }
.fill-load.danger { background: linear-gradient(90deg, #802020, #c04040); }
.fill-resonance { background: linear-gradient(90deg, #304080, #5080c0); }
.fstat-num {
  font-size: 0.78rem;   /* ✅ 放大 */
  color: #c0a870;       /* ✅ 加亮 */
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  flex-shrink: 0;
}
.fstat-num.danger { color: #c05040; animation: numBlink 1s ease-in-out infinite alternate; }
@keyframes numBlink { 0% { opacity: 1; } 100% { opacity: 0.4; } }
.fstat-divider { width: 1px; height: 16px; background: rgba(200,170,80,0.1); flex-shrink: 0; }

/* Loading */
.dream-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem; flex-shrink: 0; }
.loading-wave { display: flex; align-items: flex-end; gap: 3px; height: 20px; }
.loading-wave span { display: block; width: 3px; height: 6px; background: rgba(200,170,80,0.5); border-radius: 2px; animation: wavePulse 1s ease-in-out infinite; }
.loading-wave span:nth-child(1) { animation-delay: 0s; }
.loading-wave span:nth-child(2) { animation-delay: 0.1s; }
.loading-wave span:nth-child(3) { animation-delay: 0.2s; }
.loading-wave span:nth-child(4) { animation-delay: 0.3s; }
.loading-wave span:nth-child(5) { animation-delay: 0.4s; }
@keyframes wavePulse { 0%, 100% { height: 4px; background: rgba(200,170,80,0.2); } 50% { height: 18px; background: rgba(200,170,80,0.8); } }
.loading-text-row { font-size: 0.65rem; color: #3a3020; letter-spacing: 0.3em; animation: textFade 2s ease-in-out infinite alternate; }
@keyframes textFade { 0% { opacity: 0.3; } 100% { opacity: 0.8; } }

/* 共振满强制撤离横幅 */
.must-evacuate-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  background: rgba(80, 40, 10, 0.4);
  border: 1px solid rgba(200, 120, 40, 0.5);
  border-radius: 5px;
  animation: evacuatePulse 1.5s ease-in-out infinite alternate;
}
@keyframes evacuatePulse {
  0%  { border-color: rgba(200, 120, 40, 0.3); background: rgba(80, 40, 10, 0.3); }
  100%{ border-color: rgba(200, 120, 40, 0.8); background: rgba(80, 40, 10, 0.6); }
}
.evacuate-icon {
  font-size: 1.2rem;
  color: #d08040;
  animation: iconBlink 0.8s ease-in-out infinite alternate;
}
@keyframes iconBlink {
  0%  { opacity: 0.4; }
  100%{ opacity: 1; }
}
.evacuate-msg {
  font-size: 0.9rem;
  color: #d0a060;
  letter-spacing: 0.15em;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.evacuate-sub {
  font-size: 0.65rem;
  color: #8a6030;
  letter-spacing: 0.1em;
}
.btn-evacuate-now {
  padding: 0.55rem 2rem;
  background: linear-gradient(135deg, rgba(120, 70, 10, 0.8), rgba(80, 40, 5, 0.8));
  border: 1px solid rgba(200, 130, 40, 0.6);
  border-radius: 3px;
  color: #f0c870;
  font-family: inherit;
  font-size: 0.88rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-evacuate-now:hover {
  background: linear-gradient(135deg, rgba(150, 90, 15, 0.9), rgba(100, 55, 8, 0.9));
  border-color: rgba(200, 150, 60, 0.9);
  transform: translateY(-1px);
}

/* 共振条满格闪烁 */
.fill-resonance.full {
  background: linear-gradient(90deg, #806020, #d0a040);
  animation: resFull 0.8s ease-in-out infinite alternate;
}
@keyframes resFull {
  0%  { opacity: 0.6; }
  100%{ opacity: 1; filter: brightness(1.3); }
}

/* 底部面板 */
.dream-bottom-panel { flex-shrink: 0; display: flex; flex-direction: column; border: 1px solid rgba(200,170,80,0.2); border-radius: 6px; background: rgba(0,0,0,0.35); overflow: hidden; max-height: 38vh; }
.panel-tabs { display: flex; position: relative; border-bottom: 1px solid rgba(200,170,80,0.1); flex-shrink: 0; }
.panel-tab { flex: 1; padding: 0.4rem 0; background: transparent; border: none; color: #4a3820; font-family: inherit; font-size: 0.7rem; letter-spacing: 0.15em; cursor: pointer; transition: color 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.3rem; }
.panel-tab.active { color: #c0a860; }
.tab-icon { font-size: 0.55rem; opacity: 0.7; }
.tab-indicator { position: absolute; bottom: 0; left: 0; width: 50%; height: 2px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.6), transparent); border-radius: 1px; transition: transform 0.25s ease; }
.tab-indicator.right { transform: translateX(100%); }
.panel-slide { overflow-y: auto; padding: 0.5rem 0.8rem 0.5rem; display: flex; flex-direction: column; gap: 0.4rem; max-height: calc(38vh - 36px); }
.panel-slide::-webkit-scrollbar { width: 3px; }
.panel-slide::-webkit-scrollbar-thumb { background: rgba(200,170,80,0.15); border-radius: 2px; }
.choices-waiting { font-size: 0.68rem; color: #3a2a10; letter-spacing: 0.2em; text-align: center; padding: 0.8rem; }
.panel-actions { display: flex; gap: 0.6rem; justify-content: flex-end; flex-shrink: 0; padding-top: 0.3rem; }

/* 道具栏 */
.tools-scroll-area { overflow-x: auto; overflow-y: hidden; padding-bottom: 0.5rem; }
.tools-scroll-area::-webkit-scrollbar { height: 2px; }
.tools-scroll-area::-webkit-scrollbar-track { background: transparent; }
.tools-scroll-area::-webkit-scrollbar-thumb { background: rgba(200,170,80,0.2); border-radius: 1px; }
.tools-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(200,170,80,0.4); }
.tools-row { display: flex; gap: 0.8rem; min-width: max-content; padding: 0 0.5rem; }
.tool-slot-h { width: 76px; height: 90px; flex-shrink: 0; background: rgba(200,170,80,0.06); border: 1px solid rgba(200,170,80,0.25); border-radius: 6px; padding: 0.8rem 0.4rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; transition: all 0.2s ease-in-out; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
.tool-slot-h:hover:not(.empty) { border-color: rgba(200,170,80,0.6); background: rgba(200,170,80,0.15); transform: translateY(-2px); }
.tool-slot-h.empty { opacity: 0.25; font-size: 0.6rem; color: #8a7848; cursor: default; border-style: dashed; }
.tool-slot-h.active { border-color: #a0c8d8; background: rgba(80,160,200,0.15); box-shadow: 0 0 10px rgba(80,160,200,0.2); }
.tool-icon-h { width: 32px; height: 32px; border: 1px solid rgba(200,170,80,0.3); border-radius: 50%; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: #d8c890; }
.tool-name-h { font-size: 0.65rem; color: #c0a860; text-align: center; line-height: 1.2; font-weight: bold; letter-spacing: 0.05em; }
.tool-count { font-size: 0.55rem; color: #80c0d0; font-family: 'Courier New', monospace; background: rgba(0,0,0,0.5); padding: 0.1rem 0.3rem; border-radius: 3px; }
.staged-item-bar { background: rgba(80,160,200,0.1); border: 1px solid rgba(80,160,200,0.3); padding: 0.5rem 0.8rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.staged-text { font-size: 0.75rem; color: #a0c8d8; }
.cancel-item-btn { background: transparent; border: none; color: #c06050; font-size: 0.7rem; cursor: pointer; text-decoration: underline; }
.active-item-desc { margin-top: 1rem; padding: 0.8rem; background: rgba(0,0,0,0.4); border-radius: 4px; border-left: 2px solid #a0c8d8; }
.permanent-tool-section { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.5rem 0 0; border-top: 1px solid rgba(200,170,80,0.08); margin-top: 0.3rem; }
.permanent-tool-label { font-size: 0.58rem; color: #4a3820; letter-spacing: 0.2em; }
.permanent-tool-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.permanent-chip { display: flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.7rem; background: rgba(200,170,80,0.05); border: 1px solid rgba(200,170,80,0.15); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.permanent-chip:hover { border-color: rgba(200,170,80,0.4); background: rgba(200,170,80,0.1); }
.permanent-chip.expanded { border-color: rgba(200,170,80,0.5); background: rgba(200,170,80,0.12); }
.permanent-chip-name { font-size: 0.65rem; color: #a09060; letter-spacing: 0.05em; }
.permanent-chip-arrow { font-size: 0.5rem; color: rgba(200,170,80,0.4); }
.permanent-desc-box { background: rgba(0,0,0,0.3); border: 1px solid rgba(200,170,80,0.1); border-radius: 4px; padding: 0.6rem 0.8rem; display: flex; flex-direction: column; gap: 0.3rem; }
.permanent-desc-name { font-size: 0.7rem; color: #c0a860; letter-spacing: 0.08em; }
.permanent-desc-text { font-size: 0.63rem; color: #7a7060; line-height: 1.7; letter-spacing: 0.04em; }
.btn-watch {
  padding: 0.35rem 0.8rem;
  background: rgba(100,80,160,0.15);
  border: 1px solid rgba(120,100,200,0.3);
  border-radius: 3px;
  color: #a090d0;
  font-family: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-watch:hover {
  border-color: rgba(120,100,200,0.6);
  color: #c0b0f0;
}

/* 逃脱 */
.dream-choices { flex-shrink: 0; padding: 0 0.2rem 0.2rem; }
.escape-result { font-size: 0.88rem; color: #9a8858; letter-spacing: 0.1em; text-align: center; padding: 0.5rem; }
.escape-actions { display: flex; gap: 0.8rem; justify-content: center; margin-top: 0.5rem; }
.btn-escape { padding: 0.35rem 0.9rem; background: transparent; border: 1px solid rgba(160,70,50,0.25); border-radius: 3px; color: #7a4030; font-family: inherit; font-size: 0.7rem; cursor: pointer; transition: all 0.2s; }
.btn-escape:hover { border-color: rgba(160,70,50,0.6); color: #c06050; }
.btn-save { padding: 0.35rem 0.8rem; background: transparent; border: 1px solid rgba(200,170,80,0.12); border-radius: 3px; color: #3a2a10; font-family: inherit; font-size: 0.65rem; cursor: pointer; transition: all 0.2s; }
.btn-save:hover { border-color: rgba(200,170,80,0.3); color: #6a5030; }

/* 暂停弹窗 */
.pause-overlay { position: absolute; inset: 0; background: rgba(4,4,10,0.92); z-index: 50; display: flex; align-items: center; justify-content: center; }
.pause-box { background: rgba(8,8,18,0.98); border: 1px solid rgba(200,170,80,0.2); border-radius: 6px; padding: 2rem 2.5rem; text-align: center; display: flex; flex-direction: column; gap: 1rem; min-width: 240px; }
.pause-title { font-size: 1.2rem; color: #c0a860; letter-spacing: 0.3em; }
.pause-sub { font-size: 0.7rem; color: #4a4030; letter-spacing: 0.15em; }
.pause-actions { display: flex; flex-direction: column; gap: 0.6rem; }

/* ===========================
   结算
=========================== */
.screen-settlement { align-items: center; justify-content: center; background: #05050e; padding: 2rem; }
.breath-screen { max-width: 480px; text-align: center; padding: 2rem; }
.breath-text { font-size: 0.9rem; color: #706860; line-height: 2.3; letter-spacing: 0.08em; }
.settlement-card {
  max-width: 480px;
  width: 100%;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(200,170,80,0.1);
  border-radius: 5px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  /* ✅ 删掉 max-height 和 overflow-y */
}


/* 隐藏滚动条但保留功能 */
.settlement-card::-webkit-scrollbar { width: 3px; }
.settlement-card::-webkit-scrollbar-thumb { 
  background: rgba(200,170,80,0.2); 
  border-radius: 2px; 
}

.settle-orn { font-size: 0.6rem; color: #3a3020; }
.settle-result-label { font-size: 1rem; color: #6a6030; letter-spacing: 1em; }
.settle-result-name { font-size: 2.2rem; color: #c0a860; letter-spacing: 0.4em; }
.settle-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,170,80,0.12), transparent); }
.settle-stats { width: 100%; display: flex; flex-direction: column; gap: 0.5rem; }
.settle-row { display: flex; justify-content: space-between; font-size: 1rem; }
.sl { color: #6a6040; }
.sr { color: #b0a060; font-family: 'Courier New', monospace; }
.patient-future { width: 100%; background: rgba(255,255,255,0.01); border: 1px solid rgba(200,170,80,0.07); border-radius: 4px; padding: 1rem; }
.pf-label { font-size: 0.6rem; color: #3a3020; letter-spacing: 0.3em; text-align: center; margin-bottom: 0.7rem; }
.pf-text { font-size: 0.8rem; color: #6a6850; line-height: 2; margin: 0; }
.pf-text {
  font-size: 0.82rem;
  color: #7a7060;
  line-height: 2.2;
  margin: 0 0 1rem 0;
  letter-spacing: 0.04em;
}
.pf-text:last-child {
  margin-bottom: 0;
}
.pf-scroll {
  max-height: 35vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 0.3rem;
}
.pf-scroll::-webkit-scrollbar { width: 2px; }
.pf-scroll::-webkit-scrollbar-thumb {
  background: rgba(200,170,80,0.2);
  border-radius: 1px;
}

.settle-actions { display: flex; gap: 0.8rem; flex-wrap: nowrap; }
.breath-dismiss-btn {
  margin-top: 2rem;
  padding: 0.6rem 2rem;
  background: transparent;
  border: 1px solid rgba(200,170,80,0.25);
  border-radius: 3px;
  color: #6a5838;
  font-family: inherit;
  font-size: 0.82rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.3s;
}
.breath-dismiss-btn:hover {
  border-color: rgba(200,170,80,0.5);
  color: #c0a860;
}
.breath-para {
  margin: 0 0 1.2rem 0;
  font-size: 0.92rem;
  color: #908878;
  line-height: 2.3;
  letter-spacing: 0.08em;
}
.breath-para:last-child {
  margin-bottom: 0;
}
/* ===========================
   档案页
=========================== */
.screen-profile { background: #06060c; display: flex; flex-direction: column; align-items: center; overflow: hidden; }
.profile-scroll-container { flex: 1; overflow-y: auto; padding: 1rem 1.5rem 3rem; display: flex; flex-direction: column; gap: 1.2rem; max-width: 500px; margin: 0 auto; width: 100%; }
.profile-scroll-container::-webkit-scrollbar { width: 3px; }
.profile-scroll-container::-webkit-scrollbar-thumb { background: rgba(200,170,80,0.2); }
.section-title { font-size: 0.65rem; color: #a08850; letter-spacing: 0.2em; border-bottom: 1px solid rgba(200,170,80,0.15); padding-bottom: 0.3rem; margin-top: 1rem; }
.profile-header-card { background: linear-gradient(135deg, rgba(30,25,15,0.8), rgba(10,10,15,0.8)); border: 1px solid rgba(200,170,80,0.2); border-radius: 8px; padding: 1.5rem; }
.header-top-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 0.5rem; }
.avatar-edit-container { position: relative; cursor: pointer; border-radius: 50%; flex-shrink: 0; }
.big-avatar { width: 64px; height: 64px; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(200,170,80,0.4); background: rgba(0,0,0,0.4); border-radius: 50%; overflow: hidden; transition: all 0.3s; color: #c0a860; }
.avatar-edit-container:hover .big-avatar { border-color: #c0a860; filter: brightness(0.7); }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.edit-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #fff; opacity: 0; transition: opacity 0.3s; pointer-events: none; text-shadow: 0 1px 2px #000; z-index: 10; }
.avatar-edit-container:hover .edit-hint { opacity: 1; }
.name-edit-row { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.name-input { background: transparent; border: none; border-bottom: 1px dashed rgba(200,170,80,0.4); color: #d8c890; font-size: 1.5rem; font-family: 'KaiTi', 'STKaiti', serif; letter-spacing: 0.1em; padding: 0.2rem 0; outline: none; width: 100%; transition: border-color 0.3s; }
.name-input:focus { border-bottom-color: #c0a860; box-shadow: 0 2px 5px rgba(200,170,80,0.1); }
.level-progress-bar { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; margin-bottom: 0.4rem; }
.lp-fill { height: 100%; background: linear-gradient(90deg, #8a7040, #c0a860); transition: width 0.5s ease-out; }
.lp-text { font-size: 0.6rem; color: #7a6840; text-align: right; font-family: 'Courier New', monospace; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; }
.stat-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 6px; text-align: center; }
.s-label { font-size: 0.6rem; color: #6a6050; margin-bottom: 0.4rem; }
.s-val { font-size: 1.2rem; color: #c0b880; font-family: 'Courier New', monospace; }
.s-sub { font-size: 0.5rem; color: #5a5040; }
.stars-record { display: flex; flex-direction: column; gap: 0.4rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); }
.star-row { display: flex; align-items: center; gap: 0.8rem; }
.sr-stars { width: 60px; font-size: 0.6rem; color: #a09050; text-align: right; }
.sr-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
.sr-bar-fill { height: 100%; background: rgba(160,140,80,0.6); border-radius: 3px; transition: width 0.5s; }
.sr-count { width: 20px; font-size: 0.7rem; color: #8a8070; font-family: 'Courier New', monospace; }
.titles-container { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.title-btn { background: transparent; border: 1px solid rgba(200,170,80,0.2); color: #7a6840; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
.title-btn:hover { border-color: rgba(200,170,80,0.5); color: #a09060; }
.title-btn.active { background: rgba(200,170,80,0.15); border-color: #c0a860; color: #d8c890; box-shadow: 0 0 10px rgba(200,170,80,0.1); }
.achievements-list { display: flex; flex-direction: column; gap: 0.8rem; }
.ach-card { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; padding: 1rem; opacity: 0.5; filter: grayscale(80%); transition: all 0.3s; }
.ach-card.unlocked { opacity: 1; filter: none; border-color: rgba(200,170,80,0.3); background: linear-gradient(180deg, rgba(200,170,80,0.05), transparent); }
.ach-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; }
.ach-name { font-size: 0.9rem; color: #d0c8b8; font-weight: bold; letter-spacing: 0.1em; }
.ach-status { font-size: 0.6rem; color: #5a5040; font-family: 'Courier New', monospace; }
.ach-card.unlocked .ach-status { color: #a0c080; }
.ach-desc { font-size: 0.7rem; color: #7a7060; line-height: 1.6; }
.ach-rewards { margin-top: 0.6rem; display: flex; gap: 1rem; font-size: 0.65rem; color: #c080a0; }

/* ===========================
   通用按钮
=========================== */
.btn-primary { padding: 0.65rem 1.6rem; background: linear-gradient(135deg, #5a4018, #3a2808); border: 1px solid rgba(200,160,60,0.35); border-radius: 3px; color: #d8c890; font-family: inherit; font-size: 0.82rem; letter-spacing: 0.15em; cursor: pointer; transition: all 0.25s; white-space: nowrap;}
.btn-primary:hover { background: linear-gradient(135deg, #6a5025, #4a3815); transform: translateY(-1px); }
.btn-secondary { padding: 0.65rem 1.6rem; background: transparent; border: 1px solid rgba(200,170,80,0.18); border-radius: 3px; color: #6a5830; font-family: inherit; font-size: 0.82rem; letter-spacing: 0.1em; cursor: pointer; transition: all 0.25s;white-space: nowrap; }
.btn-secondary:hover { border-color: rgba(200,170,80,0.4); color: #9a7840; }
.btn-insight {
  padding: 0.35rem 0.8rem;
  background: rgba(80,120,160,0.15);
  border: 1px solid rgba(80,120,200,0.3);
  border-radius: 3px;
  color: #8ab0d0;
  font-family: inherit;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-insight:hover {
  border-color: rgba(80,120,200,0.6);
  color: #a0c8f0;
}

/* 洞察提示栏 */
.insight-hint-bar {
  font-size: 0.68rem;
  color: #8ab0d0;
  background: rgba(80,120,160,0.1);
  border: 1px solid rgba(80,120,200,0.2);
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  letter-spacing: 0.08em;
  line-height: 1.6;
}

/* 升级弹窗 */
.levelup-box {
  background: rgba(8,8,18,0.98);
  border: 1px solid rgba(200,170,80,0.35);
  border-radius: 8px;
  padding: 2rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  min-width: 280px;
  max-width: 340px;
}
.levelup-orn {
  font-size: 1rem;
  color: rgba(200,170,80,0.5);
  animation: titleGlow 2s infinite alternate;
}
.levelup-title {
  font-size: 1.3rem;
  color: #c0a860;
  letter-spacing: 0.4em;
}
.levelup-level {
  font-size: 0.7rem;
  color: #6a5838;
  letter-spacing: 0.2em;
}
.levelup-rewards {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.8rem;
  background: rgba(200,170,80,0.05);
  border: 1px solid rgba(200,170,80,0.1);
  border-radius: 4px;
}
.levelup-reward-row {
  font-size: 0.78rem;
  color: #a09060;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.reward-icon {
  color: rgba(200,170,80,0.4);
  font-size: 0.6rem;
}
.levelup-choice-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.levelup-choice-label {
  font-size: 0.65rem;
  color: #5a4830;
  letter-spacing: 0.2em;
  text-align: center;
}
.levelup-choices {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.levelup-choice-card {
  padding: 0.8rem 1rem;
  border: 1px solid rgba(200,170,80,0.2);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255,255,255,0.02);
}
.levelup-choice-card:hover {
  border-color: rgba(200,170,80,0.6);
  background: rgba(200,170,80,0.08);
  transform: translateX(4px);
}
.lc-label {
  font-size: 0.88rem;
  color: #d0c090;
  letter-spacing: 0.08em;
  margin-bottom: 0.3rem;
}
.lc-desc {
  font-size: 0.65rem;
  color: #5a5040;
  line-height: 1.6;
}
.levelup-actions {
  margin-top: 0.5rem;
}

/* ===========================
   移动端优化
=========================== */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.para-narrative, .para-current, .para-inner, .history-list, .name-input, .pf-text {
  -webkit-user-select: auto;
  user-select: auto;
}
button, .hub-menu-item, .script-card, .clickable-profile, .tool-slot-h, .avatar-edit-container {
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
  .back-btn { padding: 0.6rem 1.2rem; font-size: 0.85rem; }
  .title-btn { padding: 1rem 1.5rem; font-size: 1rem; }
  .hub-menu-item { padding: 1rem 1.2rem; }
  .panel-tab { padding: 0.8rem 0; font-size: 0.85rem; }
  .dream-main { margin-bottom: 0.2rem; }
  .frame-content { padding: 0.8rem 1rem; gap: 1rem; }
  .para-current p { line-height: 2.1; font-size: 1rem; }
  .tool-slot-h { width: 80px; }
}
</style>
