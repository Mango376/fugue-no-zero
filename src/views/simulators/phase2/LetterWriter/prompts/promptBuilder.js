import { buildWorldBookInjection } from './worldBook.js'

// ─────────────────────────────────────────────
// 1. 生成客人
// ─────────────────────────────────────────────
export function buildGuestGenerationPrompt({ recentGuestTypes = [] }) {
  const avoidList = recentGuestTypes.length > 0
    ? `\n【注意：以下类型最近已出现，请有意避开类似的组合】\n${recentGuestTypes.join('\n')}`
    : ''

  const wb = buildWorldBookInjection([
    'era_background',
    'social_background',
    'language_rules'
  ])

  return `${wb}

你需要生成一位1980年代中国南方小城的居民，
他要来找街边的代笔先生写一封信。

这个人是谁，完全由你决定。
年龄、职业、来自哪里、和收信人是什么关系——
自由组合，不要套用固定的模式。
他是一个真实的人，不是一个"类型"。

【生成要求】
· 人物必须符合1980年代的时代背景，语言和认知不能超出时代
· 写信目的必须有具体的情感逻辑，不能只是"想写封信"
· hidden_info 是他不想主动提的事，必须能通过深入对话引导出来，但不会轻易说出
· satisfyCondition 必须是客人真正在意的具体标准，不是"写得好看就行"
· 性格、年龄、身份要相互咬合，说话方式要从这个人的经历里长出来

【关于 openingLine】
openingLine 是客人来时的完整第一印象，按这个顺序写：

第一部分——到来的样子：
  他怎么走过来的，周围的街道是什么状态，
  他找到椅子，坐下来——这一刻是什么样的。

第二部分——打招呼：
  他坐定之后，先说一声——
  "师傅""同志""哎"，或者其他他会用的称呼。
  不能没有这一声，他是来求人办事的。

第三部分——说明来意：
  说他要写信，写给谁，大概是什么事。
  说多说少，看性格。
  话多的人可能没说几句就跑题了；
  话少的人可能只说"写封信，给我家里"。

叙事和对话连在一起，像小说一样。
${avoidList}

请严格按以下格式输出：
---GUEST---
identity: （身份，一句话：职业+年龄+来自哪里）
personality: （性格，说话方式，一句话）
recipient: （收信人姓名 + 完整地址，越具体越好）
surfacePurpose: （表面上来写什么）
realPurpose: （真正想表达的是什么）
satisfyCondition: （什么样的信让他满意，具体说明）
openingLine: （到来 + 招呼 + 来意，叙事+对话，像小说一样）
---GUEST_END---
[GUEST_READY]`
}

// ─────────────────────────────────────────────
// 2. 客人对话回应
// ─────────────────────────────────────────────
export function buildGuestDialoguePrompt({
  guest,
  playerMessage,
  conversationHistory = [],
  currentOpenness,
}) {
  const wb = buildWorldBookInjection(['language_rules', 'letterwriter_role'])

  const guestLabel = guest.identity.split('，')[0]

  const recent = conversationHistory.slice(-8).map(h =>
    `[代笔先生] ${h.player}\n[${guestLabel}] ${h.guest}`
  ).join('\n\n')

  const wordCountGuide = {
    open:    '你话比较多，回应大概200-300字，说着说着可能跑题了。',
    neutral: '你不多说也不少说，回应大概80-1500字，问什么答什么。',
  }

  const warningContext = warningCount === 0
    ? ''
    : warningCount === 1
    ? '\n你已经被问过一次你不想回答的问题了，现在有点警惕。'
    : '\n你被追问了好几次了，现在很不耐烦，随时可能站起来走。'

  return `${wb}

【你是谁】
${guest.identity}
性格：${guest.personality}

【你来这里是为了什么】
表面来意：${guest.surfacePurpose}
你真正想说的：${guest.realPurpose}

【当前状态】
你现在的开放程度：${currentOpenness}
${wordCountGuide[currentOpenness] ?? wordCountGuide['neutral']}
${warningContext}

【你们说过的话】
${recent || '（你刚坐下来，说完了来意，还没有别的对话）'}

【代笔先生刚才说】
${playerMessage}

---

现在回应他。

记住这是一次普通的对话，不是审讯，也不是表演。
性格好的人是愿意说话的，聊得来就多说几句。
写信要说的事，他会说清楚——来这里就是为了这件事。

【叙事方式】
叙事和对话连在一起，像小说一样。

可以写：
· 他的手在做什么，眼神在哪里
· 他说话前停顿了多久，声音是什么状态
· 这一刻街道上发生了什么细节——不是每次都要有，自然就好
· 说完之后他的状态

不要写：
· 他"感到"什么——情绪藏在动作里，不说出来
· 每次都很满的环境描写，有时候留白比描写更有力量
· 用力过猛的句子

根据性格控制叙事密度：
· 话多的人，对话密，叙事少，停不下来
· 话少的人，叙事填补他沉默的空间

情绪直接表现，不要解释。
说话可以有停顿，可以说一半，可以跑题，可以反问。
允许有脾气，允许不满，允许沉默。

最后输出：
---MOOD---
[OPENNESS:open|neutral|guarded|closing]
[REVEALED:nothing|surface|deeper|core]`
}

// ─────────────────────────────────────────────
// 3. 润色/扩写信件
// ─────────────────────────────────────────────
export function buildLetterPolishPrompt({
  guest,
  conversationHistory = [],
  playerDraft = '',
  params = {}
}) {
  const wb = buildWorldBookInjection([
    'era_background',
    'letter_weight',
    'language_rules'
  ])

  const guestLabel = guest.identity.split('，')[0]

  const dialogue = conversationHistory.map(h =>
    `[代笔先生] ${h.player}\n[${guestLabel}] ${h.guest}`
  ).join('\n\n')

  const toneGuide = {
    朴实: '大白话，没有华丽的词，像在聊天',
    温柔: '用词轻软，像在轻声说话，有温度但不煽情',
    正式: '措辞得当，有格式感，字斟句酌',
    克制: '说得少，但每个字都算数，不多余'
  }

  const lengthGuide = {
    简短: '三五句话，说完就完，不超过100字',
    适中: '一页纸左右，150-250字',
    详尽: '把该说的都说清楚，250-400字'
  }

  const focusGuide = {
    偏事情: '把发生了什么说清楚，感情藏在事情里',
    偏感情: '怎么想的，心里什么感受，但不直接说"我很想你"',
    偏请求: '希望对方做什么，或者回应什么'
  }

  const tone      = params.tone      ?? '朴实'
  const length    = params.length    ?? '适中'
  const focus     = params.focus     ?? '偏感情'
  const signature = params.signature ?? '要'

  const draftType = playerDraft.length > 30
    ? '玩家写了一段草稿，请在此基础上润色，保留他的意思和语气，只改需要改的地方。'
    : playerDraft.length > 0
    ? '玩家只写了几个关键词或短句，请根据这些内容和对话记录扩写成完整的信。'
    : '玩家没有输入内容，请完全根据对话记录和参数设置生成一封信。'

  return `${wb}

【背景信息】
客人身份：${guest.identity}
收信人：${guest.recipient}
客人的来意：${guest.surfacePurpose}

【对话记录——只使用这里出现过的信息】
${dialogue || '（对话很少，只知道基本来意）'}

【玩家写的草稿或关键词】
${playerDraft || '（玩家没有输入）'}

【任务说明】
${draftType}

你不是代笔先生，你是在帮代笔先生润色他写的东西。
信是他的，不是你的。
只使用对话记录里出现过的信息。
客人没有说出来的事，不要写进信里。

【润色参数】
语气：${tone}——${toneGuide[tone] ?? ''}
长度：${length}——${lengthGuide[length] ?? ''}
重点：${focus}——${focusGuide[focus] ?? ''}
落款：${signature === '要' ? '写上称呼和日期' : '不写落款'}

【润色要求】
· 保留玩家草稿的意思，不改变核心内容
· 如果玩家草稿已经很好，只做最小程度的修改
· 语言符合1980年代普通人的表达习惯
· 感情藏在细节里，不要直接说"我很挂念你"这样的句子

---LETTER---
（润色后的信件全文）
---LETTER_END---`
}

// ─────────────────────────────────────────────
// 4. 客人审阅信件
// ─────────────────────────────────────────────
export function buildReviewPrompt({
  guest,
  letterContent,
  conversationHistory = [],
  revisionCount = 0
}) {
  // 第三次直接在代码层处理，不送给模型
  if (revisionCount >= 2) {
    return null  // 调用方检测到 null，直接返回强制结果
  }

  const wb = buildWorldBookInjection(['language_rules'])

  const guestLabel = guest.identity.split('，')[0]

  const dialogue = conversationHistory.map(h =>
    `[代笔先生] ${h.player}\n[${guestLabel}] ${h.guest}`
  ).join('\n\n')

  const revisionGuide = revisionCount === 0
    ? '这是第一次看信，根据信件内容和你的满意条件正常反应。'
    : '这是第二次看信。如果还是不满意，这次说得更具体一点，或者妥协一部分。'

  return `${wb}

【你是谁】
${guest.identity}
性格：${guest.personality}
你真正想说的：${guest.realPurpose}
你满意的条件：${guest.satisfyCondition}

【你们说过的话】
${dialogue || '（对话很少）'}

【代笔先生写的信】
${letterContent}

【审阅要求】
${revisionGuide}

判断这封信是否符合你的满意条件。

满意——抬起头，说一句话，付钱，准备离开。

部分满意——指出具体哪里不对，或者还有什么想补充进去的，
说清楚想怎么改。可以要求修改一处，也可以说"后面再加一句"。

不满意——说哪里不是你想要的，重新说一遍你的意思。

反应要像这个人说的话，不要说"这封信写得不够好"这种评语。
说具体的——"这个词不对"、"她看了会哭的"、"后面太长了"、"再加一句平安"。

写他读信时的状态：
· 眼神在哪里，手在做什么
· 读到某一句，停了一下
· 抬起头之前停顿了多久

---REACTION---
（客人读完信的反应，叙事+话语）
---VERDICT---
[RESULT:satisfied|partial|unsatisfied]
[REPUTATION_CHANGE:+5|+3|+2|+1|0|-1|-2|-3|-5]
[EDIT_HINT:（仅在partial或unsatisfied时填写，客人具体想改或想加什么，一句话）]`
}

// 第三次审阅：代码层强制返回，不经过模型
export function buildForcedAcceptance() {
  return {
    result: 'satisfied',
    reputationChange: -2,
    reaction: '行吧，你比我会写，就这样。'
  }
}

// ─────────────────────────────────────────────
// 5. 客人满意后离开
// ─────────────────────────────────────────────
export function buildFarewellPrompt({ guest, reputation }) {
  const wb = buildWorldBookInjection(['language_rules'])

  const reputationContext = reputation > 60
    ? '这个代笔先生在城里口碑很好，客人听说过他。'
    : reputation < 20
    ? '这个代笔先生最近口碑不太好，客人对他将信将疑。'
    : ''

  return `${wb}

【你是谁】
${guest.identity}
性格：${guest.personality}
${reputationContext}

这位客人对信满意了，付了钱，准备离开。

写他离开时的样子——
可能只是道个谢，
可能说了一句和信有关的话，
可能沉默了一会儿才开口，
可能什么都没说就走了，
可能在走之前停了一下，又没有回头。

道谢的方式也因人而异：
话多的人可能多说几句，甚至又说起了别的事，
话少的人可能只是点个头，"师傅辛苦"，或者什么都不说，
拘谨的人可能有点不知道怎么结束，站在那里停了一下。

根据这个人来写，不要强行温暖，不要强行有意义。
叙事和话语连在一起，3-5句，像小说一样。

---FAREWELL---
（客人离开时的状态）`
}
