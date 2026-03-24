import {
  JSON_ARRAY_ONLY_RULE,
  JSON_OBJECT_ONLY_RULE,
  TRACKING_SHEET_MAPPING_RULES
} from './sharedPromptRules'

const SENSE_NAMES = {
  vision:  '视觉',
  hearing: '听觉',
  touch:   '触觉',
  taste:   '味觉',
  smell:   '嗅觉'
}

function formatSensorMap(sensorMap) {
  if (!sensorMap) return '暂无'
  return Object.entries(sensorMap).map(([sensor, signals]) => {
    if (!signals || signals.length === 0) {
      return `${SENSE_NAMES[sensor] || sensor} → [正常]`
    }
    const str = Array.isArray(signals)
      ? signals.map(s => {
          // 兼容两种格式：
          // { type: 'taste', level: 1 } 或直接是 string 'taste'
          if (typeof s === 'string') return SENSE_NAMES[s] || s
          return `${SENSE_NAMES[s.type] || s.type}Lv.${s.level}`
        }).join(', ')
      : ''
    return `${SENSE_NAMES[sensor] || sensor} → [${str}]`
  }).join('\n')
}

function formatChatLog(chatLog = [], maxRounds = 6) {
  if (!Array.isArray(chatLog) || !chatLog.length) return '（问诊刚开始）'
  return chatLog.slice(-maxRounds).map(entry => {
    const label = entry.label || entry.speaker || ''
    const text  = entry.text || entry.content || ''
    if (entry.speaker === 'narrator' || entry.type === 'arrival') return `[旁白] ${text}`
    if (entry.speaker === 'doctor'   || entry.type === 'question') return `[医生] ${text}`
    if (entry.speaker === 'patient'  || entry.type === 'answer')   return `[患者] ${text}`
    if (entry.speaker === 'system'   || entry.type === 'diagnosis') return `[系统] ${text}`
    return `[${label}] ${text}`
  }).filter(Boolean).join('\n')
}

/**
 * 共享底座：患者信息 + 环境 + 追踪表
 */
function buildPatientSeed({ patient, environment, trackingSheet }) {
  return `【患者信息】
姓名：${patient.name}
型号：${patient.model || '型号不明'}
职业：${patient.job}
话语风格：${patient.speechStyle || '根据职业自行判断'}
情绪状态：${patient.emotionalTone || '根据职业自行判断'}
来诊次数：第 ${patient.visitCount || 1} 次

【当前环境干扰】
${environment.name || environment.factor || '暂无'}
${environment.description || environment.effect || ''}

【后台追踪表（隐藏，仅供叙事参考，绝对不可泄露给玩家）】
${formatSensorMap(trackingSheet?.unresolvedMappings || trackingSheet?.sensorMap)}

⚠️ 所有叙事必须以后台追踪表为准。
不要新增表外的病症、环境因素或核心牵挂。
不要对玩家说出"视觉串到嗅觉"这类标准诊断术语。`
}


// ================================================================
// 00. 后台追踪表生成
// buildTrackingSheetPrompt
// useGameLogic → generateTrackingSheet()
// ================================================================

export function buildTrackingSheetPrompt({ patient, environment, estimatedIncome }) {
  return `为《共觉之境》的新患者生成一份后台追踪表。
这份表只给系统使用，不对玩家显示。

【已知基础资料】
患者姓名：${patient.name}
职业：${patient.job}
职业处境：${patient.jobContext || ''}
核心牵挂：${patient.attachment}
话语风格：${patient.speechStyle || ''}
情绪状态：${patient.emotionalTone || ''}
当前来诊次数：第 ${patient.visitCount || 1} 次
环境：${environment.name || ''}
环境描述：${environment.description || ''}
预计收入：${estimatedIncome}

${JSON_OBJECT_ONLY_RULE}

{
  "patientProfile": {
    "name": "${patient.name}",
    "job": "${patient.job}",
    "jobContext": "职业处境",
    "visitCount": ${patient.visitCount || 1},
    "speechStyle": "话语风格",
    "emotionalTone": "情绪状态"
  },
  "coreConcern": "核心牵挂（具体到一件事/一个人/一个约定）",
  "symptomSummary": "面向系统的病症摘要，简短",
  "environmentFactors": [
    "环境干扰描述"
  ],
  "symptomLedger": [
    "初始症状记录"
  ],
  "changeLog": [
    "初诊建档：……"
  ],
  "abnormalCount": 0,
  "estimatedIncome": ${estimatedIncome},
  "originalMappings": {
    "vision": [],
    "hearing": [],
    "touch": [],
    "taste": [],
    "smell": []
  },
  "unresolvedMappings": {
    "vision": [],
    "hearing": [],
    "touch": [],
    "taste": [],
    "smell": []
  },
  "confirmedMappings": {
    "vision": [], "hearing": [], "touch": [], "taste": [], "smell": []
  },
  "resolvedMappings": {
    "vision": [], "hearing": [], "touch": [], "taste": [], "smell": []
  },
  "mappingLevels": {},
  "healedMappings": {
    "vision": [], "hearing": [], "touch": [], "taste": [], "smell": []
  },
  "worsenedMappings": {
    "vision": [], "hearing": [], "touch": [], "taste": [], "smell": []
  },
  "newMappings": {
    "vision": [], "hearing": [], "touch": [], "taste": [], "smell": []
  }
}

${TRACKING_SHEET_MAPPING_RULES}`
}


// ================================================================
// 01. 进门场景（初诊）
// buildArrivalPrompt（原 buildEntrancePrompt，改名匹配 useGameLogic）
// useGameLogic → generateArrivalNarrative()
// ================================================================

export function buildArrivalPrompt({ patient, environment, trackingSheet }) {
  const isRevisit = (patient.visitCount || 1) > 1

  return `${buildPatientSeed({ patient, environment, trackingSheet })}

生成患者走进诊所、落座、开口说第一句话的开场叙事。
${isRevisit ? '这是复诊，患者之前来过，和这个地方有熟悉感。' : '这是初诊，患者第一次来。'}

【要求】
- 先写动作（推门、脚步、停顿、落座），再进入对话
- 旁白视角，冷静观察，50-100字
- 用动作和细节体现感官异常，不用情绪词
- 医生先说一句很短的接待话，自然，不要模板台词
- 患者随后说第一句主诉，只露最表层的不对劲，
  不要一上来把全部病情倒出来
- 环境干扰自然存在于背景中，不要单独标注
${isRevisit ? `- 进门方式和初诊不同，有熟悉感
- 自然体现"上次之后好了一部分，但还有残留"` : ''}

---ENTRANCE---
（进门场景，50-100字）
---FIRST_LINE---
（患者第一句话）`
}


// ================================================================
// 02. 问诊回应
// buildConsultReplyPrompt
// useGameLogic → chooseConsultOption()
// ================================================================

export function buildConsultReplyPrompt({
  patient,
  environment,
  trackingSheet,
  option,               // { doctorLine, label, promptFocus }
  consultationHistory,
  consultNotes,
  diagnosisDraft,
  confirmedDiagnosis,
  visitCount,
  currentRound
}) {
  const logStr = formatChatLog(consultationHistory)
  const isFirstVisit = (visitCount || patient.visitCount || 1) === 1

  return `${buildPatientSeed({ patient, environment, trackingSheet })}

【当前状态】
${isFirstVisit ? '初诊' : `第${visitCount || patient.visitCount}次复诊`}
${currentRound ? `本轮对话：第${currentRound}轮` : ''}

【对话历史】
${logStr}

【玩家记录的笔记】
${consultNotes || '暂无'}

【已确认的诊断】
${Object.values(confirmedDiagnosis || {}).flat().length > 0
  ? formatSensorMap(confirmedDiagnosis)
  : '尚无确认结果'}

【医生本轮提问】
标签：${option.label || ''}
提问内容：${option.doctorLine}
追问目标：${option.promptFocus || '继续追问当前最需要澄清的症状'}

生成患者对这句话的回应。

【要求】
- 100-150字以内
- 只输出患者会说的话，以及必要的极短动作描写
- 允许停顿、修正、回避、犹豫，不要像系统总结
- 自然透露信息，不一次说完
- 对尚未治愈的异常，在回答里留下残留感
- 不要重复医生刚刚的问题
- 1到3段自然文本

---RESPONSE---
（患者回应）`
}


// ================================================================
// 03. 问诊选项
// buildConsultOptionsPrompt
// useGameLogic → refreshConsultOptions()
// ================================================================

export function buildConsultOptionsPrompt({
  patient,
  environment,
  trackingSheet,
  consultationHistory,
  consultNotes,
  diagnosisDraft,
  confirmedDiagnosis,
  diagnosisUsed,
  currentRound
}) {
  const logStr = formatChatLog(consultationHistory)
  const round = currentRound || (consultationHistory?.length
    ? Math.ceil(consultationHistory.filter(e => e.speaker === 'doctor').length)
    : 1)
  const isEarlyRound = round <= 2
  const isLateRound  = round >= 4

  return `${buildPatientSeed({ patient, environment, trackingSheet })}

【当前状态】
${(patient.visitCount || 1) > 1 ? `第${patient.visitCount}次复诊` : '初诊'}
已用诊断次数：${diagnosisUsed || 0} / 2

【玩家记录的笔记】
${consultNotes || '暂无'}

【已确认的诊断】
${Object.values(confirmedDiagnosis || {}).flat().length > 0
  ? formatSensorMap(confirmedDiagnosis)
  : '尚无确认结果'}

【对话历史】
${logStr}

根据当前问诊进度，生成四个下一步行动选项。

================================================================

【可选行动类型】

● 继续追问
  - 追问症状细节（这个感觉是怎么触发的）
  - 追问触发条件（什么情况下有，什么情况下没有）
  - 追问时间频率（多久了，一直有还是时好时坏）
  - 追问近期生活（工作、睡眠、最近有没有变化）
  - 追问和以前的区别（从什么时候开始的）

● 做一个测试
  - 视觉刺激：开灯、手电照、出示某个颜色的东西
  - 听觉刺激：敲桌子、开设备声音、让诊所安静下来
  - 触觉刺激：轻碰手臂、让患者摸某个表面、温度测试
  - 味觉刺激：递一杯水、放试纸
  - 嗅觉刺激：打开消毒液、让患者闻某样东西
  - 感官隔离：让患者闭眼、用隔音耳塞、捂住鼻子
  - 交叉验证：同时做两件事，看哪个触发了反应

================================================================

【选项生成原则】

1. 根据患者刚才说的话选类型，
   选最能帮助排查当前线索的方向。
   不要重复最近2-3轮已经问过的方向。

2. ${isEarlyRound
    ? '问诊早期：多问少测，测试类不超过2个。'
    : isLateRound
    ? '已经问了几轮：多做测试，测试类至少2个。'
    : '问和测试平衡：2个问诊类+2个测试类。'}

3. 四个选项覆盖不同排查方向，不要太相似。

4. 选项格式要求：
   - 第一人称，口语化
   - 描述一个具体的动作或一句具体的话
   - 不超过25字
   - 不写元描述，写具体内容
   - 像下城区诊所的医生会说的话

${JSON_ARRAY_ONLY_RULE}

[
  {
    "id": "option-1",
    "label": "类型标签（追问症状/感官测试等）",
    "doctorLine": "医生说的那句话，口语，不超过25字",
    "promptFocus": "这个选项想追问的方向"
  },
  ...共4个
]`
}


// ================================================================
// 04. 治疗后反馈
// buildTreatmentFeedbackPrompt
// useGameLogic → generateTreatmentFeedback()
// outcome: 'complete' | 'partial' | 'revisit'
// ================================================================

export function buildTreatmentFeedbackPrompt({
  patient,
  environment,
  trackingSheet,
  treatmentDraft,
  resolvedMappings,
  remainingMappings,
  outcome
}) {
  const resolvedStr = formatSensorMap(resolvedMappings)
  const remainingStr = formatSensorMap(remainingMappings)
  const hasRemaining = Object.values(remainingMappings || {}).some(arr => arr.length > 0)

  const scenarioMap = {
    complete: `【完全治愈】
所有症状已全部消除。
患者感受到感官完全恢复正常。

"正常"不是兴奋，不是感动，
是平静地只感知到应该感知的东西——
看东西就只是看，没有别的；听声音就只是声音。

感官逐步归位后的松动感，但不要写成夸张奇迹。
患者可能愣了一下，可能试了试，
可能说一句很短的话，也可能什么都没说。`,

    partial: `【部分治愈·仍有残留·还有诊断次数】
本次治愈了部分症状，
但患者仍有未被诊断到的症状残留。
（后台参考，不可透露：${remainingStr}）

患者感受到部分症状消失，
但还有某种奇怪的感觉仍然在。

描写要模糊：让玩家感到"还有问题"，
但不要透露是哪个感官、什么类型的异常。
患者说不清楚，说不到点上，
让玩家意识到还没完。
语气里有一点不确定，"说不清，但就是还有"。`,

    revisit: `【今日诊断次数用完·约定复诊】
本次治愈了部分症状，
但今天已经用完两次诊断，不能再接诊断仪了。

患者感受到部分症状消失，
但还有某种奇怪的感觉仍然在。
描写模糊，不透露具体是什么。

语气疲惫、平静或有点无奈，符合患者性格即可。
不绝望，但今天能做的都做了。
像是双方心照不宣地达成了某种临时的停战。`
  }

  return `${buildPatientSeed({ patient, environment, trackingSheet })}

【本次治疗结果（代码已计算完毕）】
成功治愈：${resolvedStr}
${hasRemaining ? `仍有残留（隐藏，不可透露）：${remainingStr}` : ''}

================================================================

${scenarioMap[outcome] || scenarioMap.revisit}

================================================================

【通用要求】
- 80-120字
- 反馈必须严格依据追踪表的残留问题，不新增表外异常
- 用患者自己的感官感受来描写，不用技术语言
- 符合患者性格和说话习惯
- 旁白和患者反应都可以有，但不要写满，留白
- 不强行煽情，不拔高
- 结尾停在当下的感受，不升华
- 2到4段自然文本

---TREATMENT_FEEDBACK---
（治疗反馈）`
}


// ================================================================
// 05. 解锁故事（完全治愈后）
// buildStoryPrompt
// ================================================================

export function buildStoryPrompt({ patient, environment, trackingSheet, consultationHistory }) {
  const logStr = formatChatLog(consultationHistory, 12)

  return `${buildPatientSeed({ patient, environment, trackingSheet })}

【核心牵挂】
${patient.attachment || trackingSheet?.coreConcern || ''}

【问诊对话摘要】
${logStr}

生成患者完全治愈后解锁的完整故事。

【要求】
- 300-500字
- 围绕核心牵挂展开
- 写他们每天做的一件很小的事，和那件小事背后的原因
- 有具体的生活细节，有温度
- 不强行煽情，不需要戏剧性情节
- 细节来自下城区，不是田园，不是诗意远方
- 不要总结，不要升华，不要点题
- 结尾停在一个具体的画面或动作上

---STORY---
（患者完整故事）`
}


// ================================================================
// 06. 还款短信
// buildMessagePrompt
// ================================================================

export function buildMessagePrompt({
  patient,
  debtAmount,
  returnAmount,
  daysSinceDebt
}) {
  return `以患者的口吻写一封还款短信。

【患者信息】
姓名：${patient.name}
职业：${patient.job}
核心牵挂：${patient.attachment || ''}
话语风格：${patient.speechStyle || '根据职业自行判断'}

【经济信息】
原赊账金额：${debtAmount}信用点
本次还款：${returnAmount}信用点
距赊账时间：约${daysSinceDebt}个患者之后

【要求】
- 150-200字
- 汇报现在的生活状态，要具体，不要抽象
- 和核心牵挂有所呼应，说一件相关的近况
- 提到治好后生活有什么具体变化
- 感谢要自然，不要肉麻
- 话语风格符合患者性格：话多的人信长，话少的人信短
- 结尾附上转账金额，口语化
- 读完让人觉得，当初赊账是对的

---MESSAGE---
发件人：${patient.name}

（短信正文）

转账：${returnAmount}信用点`
}


// ================================================================
// 07. 环境过渡
// buildTransitionPrompt
// ================================================================

export function buildTransitionPrompt({
  prevEnvironment,
  nextEnvironment,
  timeOfDay
}) {
  const timeMap = {
    morning:   '清晨',
    afternoon: '下午',
    evening:   '傍晚',
    night:     '深夜'
  }

  return `写一段环境变化的过渡描写。

【上一个环境】
${prevEnvironment.name || prevEnvironment.factor || ''}

【新的环境】
${nextEnvironment.name || nextEnvironment.factor || ''}

【当前时间】
${timeMap[timeOfDay] || '不明'}

【要求】
- 80-100字
- 从感官出发：旧的声音、气味或光线消退，新的进来
- 不直接说"环境变了"
- 不直接说影响哪个感官
- 有下城区的生活气息，是真实存在的变化
- 可以带一点诊所内部的细节

---TRANSITION---
（环境过渡描写）`
}
