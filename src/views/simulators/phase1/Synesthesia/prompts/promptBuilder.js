import { SENSE_CONFIGS, SENSE_LABELS } from '../data/gameContent'
import { buildWorldBookInjection } from './worldBook'

function getTargets(mapping, sourceId) {
  const targets = Array.isArray(mapping?.[sourceId]) ? mapping[sourceId] : []
  return targets.filter(target => target && target !== sourceId)
}

function formatMapping(mapping) {
  const lines = SENSE_CONFIGS.map(source => {
    const targets = getTargets(mapping, source.id)

    if (!targets.length) return ''

    return `${source.label} -> ${targets.map(target => SENSE_LABELS[target]).join('、')}`
  }).filter(Boolean)

  return lines.length ? lines.join('；') : '暂无'
}

function formatHistory(history = []) {
  if (!Array.isArray(history) || !history.length) {
    return '当前尚无问诊历史。'
  }

  return history
    .slice(-8)
    .map(item => {
      const label = item?.label || item?.speaker || '记录'
      return `[${label}] ${item?.text || ''}`
    })
    .join('\n')
}

function stringifyTrackingSheet(trackingSheet) {
  return JSON.stringify(trackingSheet || {}, null, 2)
}

function buildPatientSeedPrompt({ patient, environment, trackingSheet }) {
  return `${buildWorldBookInjection()}

【患者基础信息】
姓名或代号：${patient.name}
职业：${patient.job}
职业处境：${patient.jobContext}
核心牵挂：${patient.attachment}
话语风格：${patient.speechStyle}
情绪状态：${patient.emotionalTone}
当前来诊次数：第 ${patient.visitCount} 次

【环境信息】
环境阶段：${environment.label} / ${environment.name}
环境描述：${environment.description}

【后台追踪表】
${stringifyTrackingSheet(trackingSheet)}

所有叙事都必须以这张后台追踪表为准。
不要擅自新增表外病症、环境因素或核心牵挂。
不要直接对玩家说出“视觉串到嗅觉”这类标准诊断术语。

【写作风格要求】
1. 文字必须像小说片段，而不是系统播报或病历复述。
2. 这是赛博朋克下城区诊所，不是普通现实小城，也不是乡土纪实文本。
3. 允许潮湿、冷白、金属、霓虹、蒸汽、旧设备这些质感自然进入句子，但不要堆术语。
4. 禁止写成过于土俗、絮叨、口水化、像“县城文学”一样的叙事口吻。
5. 禁止网络流行语、短视频文案腔、鸡汤式总结。`
}

export function buildTrackingSheetPrompt({ patient, environment, estimatedIncome }) {
  return `${buildWorldBookInjection()}

你现在要为《共觉之境》的新患者生成一份“后台追踪表”。
这份表只给系统使用，不给玩家看。

【已知基础资料】
- 患者姓名：${patient.name}
- 职业：${patient.job}
- 职业处境：${patient.jobContext}
- 核心牵挂：${patient.attachment}
- 话语风格：${patient.speechStyle}
- 情绪状态：${patient.emotionalTone}
- 当前来诊次数：第 ${patient.visitCount} 次
- 环境阶段：${environment.label} / ${environment.name}
- 环境描述：${environment.description}
- 当前未解决映射：${formatMapping(patient.hiddenMappings)}
- 原始病症总览：${formatMapping(patient.originalMappings)}
- 预计收入：${estimatedIncome}

必须只输出一个 JSON 对象，不要代码块，不要解释，不要额外文本。
JSON 结构如下：
{
  "patientProfile": {
    "name": "患者姓名",
    "job": "职业",
    "jobContext": "职业处境",
    "visitCount": 1,
    "speechStyle": "话语风格",
    "emotionalTone": "情绪状态"
  },
  "coreConcern": "核心牵挂",
  "symptomSummary": "面向系统的病症摘要，不要太长",
  "environmentFactors": [
    "问诊当天会影响感官判断的室外因素1",
    "问诊当天会影响感官判断的室外因素2"
  ],
  "symptomLedger": [
    "原始症状记录1",
    "原始症状记录2"
  ],
  "changeLog": [
    "初诊建档：……"
  ],
  "abnormalCount": 3,
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
  }
}`
}

export function buildArrivalPrompt({ patient, environment, trackingSheet }) {
  return `${buildPatientSeedPrompt({ patient, environment, trackingSheet })}

现在请生成患者走进诊所、医生接待、患者开口说出第一句主诉的开场叙事。

要求：
1. 先写门口、雨水、脚步、停顿、落座这些动作，再进入对话。
2. 医生要先说一句很短的接待话，例如“先坐，慢慢说”这一类，但不要写成模板台词。
3. 患者随后再说第一句主诉。主诉只能露出最表层的不对劲，不能一上来就把全部病情像报告一样倾倒出来。
4. 语气要节制、自然、有画面感，不要机械总结，不要像病历朗读。
5. 如果这是复诊，要自然体现“上次之后好了一部分，但还有残留”的感觉。
6. 禁止使用“想先把这个弄一弄”“先把这个处理一下”这类模板化结尾。
7. 不要直接写出标准诊断答案，不要替玩家下结论。
8. 开场要有小说式镜头感，句子可以有节奏，但必须清楚、克制。
9. 语感保持赛博朋克诊所气质，不要写成普通现实主义小城对话场景。
10. 只输出 2 到 4 段自然文本，不要项目符号。`
}

export function buildConsultReplyPrompt({
  patient,
  environment,
  trackingSheet,
  option,
  consultationHistory,
  consultNotes,
  diagnosisDraft,
  confirmedDiagnosis
}) {
  return `${buildPatientSeedPrompt({ patient, environment, trackingSheet })}

【本轮医生提问】
标签：${option.label}
提问内容：${option.doctorLine}
追问目标：${option.promptFocus}

【玩家当前记录】
自由笔记：${consultNotes || '暂无'}
当前诊断草稿：${formatMapping(diagnosisDraft)}
已确认结果：${formatMapping(confirmedDiagnosis)}

【最近问诊历史】
${formatHistory(consultationHistory)}

请继续生成患者这一次的回答。

要求：
1. 只输出患者会说的话，以及必要的极短动作描写。
2. 回答要真实，允许停顿、修正、回避、犹豫，不要像系统总结。
3. 回答应帮助玩家继续推断后台追踪表里的问题，但不能直接说出标准诊断格式。
4. 如果问到了环境干扰，就让患者描述自己的实际感受，不要替玩家下结论。
5. 对于尚未治愈的异常，要在回答里留下残留感。
6. 不要重复医生刚刚的问题，不要用破折号列点。
7. 回答要像这个世界里真实活着的人会说的话，有职业纹理，但不要写得土俗、松散或像闲聊八卦。
8. 保持小说对白质感，不要掉到普通现实口语流水账。
9. 只输出 1 到 3 段自然文本。`
}

export function buildConsultOptionsPrompt({
  patient,
  environment,
  trackingSheet,
  consultationHistory,
  consultNotes,
  diagnosisDraft,
  confirmedDiagnosis
}) {
  return `${buildPatientSeedPrompt({ patient, environment, trackingSheet })}

【最近问诊历史】
${formatHistory(consultationHistory)}

【玩家当前记录】
自由笔记：${consultNotes || '暂无'}
当前诊断草稿：${formatMapping(diagnosisDraft)}
已确认结果：${formatMapping(confirmedDiagnosis)}

请基于当前问诊进度，生成 4 个下一步问诊选项。

硬性要求：
1. 必须只输出 JSON 数组，不要代码块，不要解释，不要额外文本。
2. 必须固定输出 4 个对象，字段只有：id、label、doctorLine、promptFocus。
3. 四个 label 依次对应这四类方向：
   - 追问异常表现
   - 追问触发场景
   - 追问生活影响
   - 排查环境干扰
4. doctorLine 只能是医生下一句真实会说的话，只写一句，不要写解释，不要写提示，不要用破折号。
5. 不要重复最近 2 到 3 轮已经问过的方向和句式。
6. 不要把 label 内容再复述成一段提示语，不要输出 hint。
7. 每个选项都要推动玩家继续逼近追踪表中的真实问题，但不要直接给答案。
8. doctorLine 要像专业但克制的下城区维修诊所医生会说的话，不要写成心理咨询手册，也不要写成日常闲扯。

JSON 格式示例：
[
  {
    "id": "symptom",
    "label": "追问异常表现",
    "doctorLine": "你先别急，把最明显的那一下再说细一点。",
    "promptFocus": "继续逼近最直接的异常表现"
  },
  {
    "id": "trigger",
    "label": "追问触发场景",
    "doctorLine": "这种情况一般是在什么场合冒出来的？",
    "promptFocus": "继续追问触发条件和动作节点"
  },
  {
    "id": "impact",
    "label": "追问生活影响",
    "doctorLine": "它最先影响到你哪一块日常？",
    "promptFocus": "追问它如何压进工作和生活"
  },
  {
    "id": "environment",
    "label": "排查环境干扰",
    "doctorLine": "你进门前后，外头有没有什么特别显眼的声响或者气味？",
    "promptFocus": "继续排查可能造成误导的环境因素"
  }
]`
}

export function buildTreatmentFeedbackPrompt({
  patient,
  environment,
  trackingSheet,
  treatmentDraft,
  resolvedMappings,
  remainingMappings,
  outcome
}) {
  return `${buildPatientSeedPrompt({ patient, environment, trackingSheet })}

【本次治疗设置】
玩家提交的治疗方向：${formatMapping(treatmentDraft)}
本次实际解决的问题：${formatMapping(resolvedMappings)}
治疗后仍残留的问题：${formatMapping(remainingMappings)}
本次结果：${outcome}

请生成治疗后的患者反馈。

要求：
1. 如果 outcome 是 complete，要写出感官逐步归位后的松动感，但不要写成夸张奇迹。
2. 如果 outcome 是 partial，要明确“好了一部分，但还有哪里不对”，让玩家回到问诊继续排查。
3. 如果 outcome 是 revisit，要写出患者暂时稳定下来、但仍需后续复诊的状态。
4. 反馈必须严格依据后台追踪表中的残留问题，不要新增表外异常。
5. 不要用项目符号，不要总结成系统播报。
6. 保持赛博朋克医疗场景的质感，让归位、失真、残留这些变化落在具体感官与身体细节上。
7. 语言要像小说收束段落，不要像现实鸡汤或县城纪实式感慨。
8. 只输出 2 到 4 段自然文本。`
}
