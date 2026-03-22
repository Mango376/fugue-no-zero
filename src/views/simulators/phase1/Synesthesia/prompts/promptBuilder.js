import { buildWorldBookInjection } from './worldBook'

export function buildPatientSeedPrompt(patient) {
  return `请为《共觉之境》生成患者档案草稿。

${buildWorldBookInjection()}

【患者定位】
姓名代号：${patient.name}
职业描述：${patient.job}
核心牵挂：${patient.attachment}
已知症状：${patient.symptoms.join('；')}

要求：
1. 生成患者基础资料、进门状态、语言习惯。
2. 说明这些症状如何在生活里具体出现。
3. 让职业处境与症状互相咬合，形成真实压力。
4. 保持文风冷静，不要把患者写成单一受害者。`
}

export function buildDialoguePrompt(patient) {
  return `请继续生成《共觉之境》的问诊对话。

【患者信息】
${patient.name}
${patient.job}
核心牵挂：${patient.attachment}
已知症状：${patient.symptoms.join('；')}

要求：
1. 让患者用自己的说法描述异常，不要直接复述诊断语。
2. 对话要能让玩家推断感官映射来源。
3. 语气保留普通人说话的迟疑、拐弯、逞强或沉默。`
}

export function buildTreatmentPrompt(patient) {
  return `请生成《共觉之境》的治疗反馈文本。

【患者】
${patient.name}
职业：${patient.job}
核心牵挂：${patient.attachment}

要求：
1. 描写治疗时感官逐步归位的过程。
2. 如果并未完全治愈，要写出“好了一部分，但仍有残留”的状态。
3. 反馈应同时体现身体感受与情绪松动，不要写成报告。`
}
