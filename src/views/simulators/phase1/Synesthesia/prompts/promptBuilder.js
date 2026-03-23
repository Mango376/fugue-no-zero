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

export function buildTrackingSheetPrompt({ patient, environment, estimatedIncome }) {
  return `${buildWorldBookInjection()}

你现在要为《共觉之境》的新患者生成一份“后台追踪表”。这份表只给系统使用，不给玩家看。

已知基础资料：
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

export function buildPatientSeedPrompt({ patient, environment, trackingSheet }) {
  return `请以《共觉之境》的患者档案格式理解以下对象。${buildWorldBookInjection()}

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

请牢记：所有叙事都必须以这张后台追踪表为准，不要擅自新增表外病症、环境因素或核心牵挂。也不要直接对玩家说出“视觉->嗅觉”这类诊断语言。`
}

export function buildArrivalPrompt({ patient, environment, trackingSheet }) {
  return `${buildPatientSeedPrompt({ patient, environment, trackingSheet })}

现在请生成一段患者走进诊所、落座并说出第一句主诉的开场叙事。
要求：
1. 语气克制、潮湿、冷静，但保留人味。
2. 先有门口或诊室的动作描述，再落到患者本人。
3. 让患者用自己的语言说出“哪里不对劲”，不要直接给出诊断答案。
4. 如果这是复诊，请自然带出“上次处理后好了一部分，但还有残留”的感觉。
5. 输出 2 到 4 段自然文本，不要使用项目符号。`
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

【当前问诊焦点】
玩家选择：${option.label}
追问意图：${option.promptFocus}
医生提问：${option.doctorLine}

【玩家的问诊记录】
自由笔记：${consultNotes || '暂无'}
当前诊断草稿：${formatMapping(diagnosisDraft)}
已被诊断仪确认的结果：${formatMapping(confirmedDiagnosis)}

【最近问诊历史】
${formatHistory(consultationHistory)}

请继续生成患者这一次的回答。
要求：
1. 只输出患者会说的话和必要的极短动作描写，不要代替系统总结。
2. 回答要能帮助玩家推断感官错位，但不能直接说出标准诊断格式。
3. 允许含糊、停顿、回避、逞强或自我修正。
4. 如果问到了环境干扰，要让患者描述自己感受到的外部条件，但不要替玩家下结论。
5. 对于仍未治愈的问题，必须在回答里留下症状残响。
6. 输出 1 到 3 段自然文本。`
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

请基于当前问诊进度，为玩家生成 4 个下一步问诊选项。
要求：
1. 选项必须像医生会说的话，语气自然克制，不要写成系统说明。
2. 4 个选项分别偏向：异常表现、触发场景、生活影响、环境排查。
3. 每个选项都要尽量避免机械重复已经问过的内容，但允许更深入。
4. 每个选项都要帮助玩家继续推断追踪表中的病症，而不是直接给答案。
5. 必须只输出 JSON，不要代码块，不要解释。

JSON 格式：
[
  {
    "id": "symptom",
    "label": "追问异常表现",
    "doctorLine": "医生要说的完整一句话",
    "promptFocus": "这一问想继续逼近什么信息",
    "hint": "给玩家看的极短提示，不超过18个字"
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
3. 如果 outcome 是 revisit，要写出患者暂时稳定下来、但仍需复诊的状态。
4. 反馈必须严格依据后台追踪表中的残留问题，不要新增表外问题。
5. 输出 2 到 4 段自然文本，不要使用项目符号。`
}
