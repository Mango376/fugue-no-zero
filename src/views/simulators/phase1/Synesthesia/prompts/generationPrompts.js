import { buildWorldBookInjection } from './worldBook'
import {
  GENERATION_JSON_HARD_RULES,
  GENERATION_MAPPING_HARD_RULES
} from './sharedPromptRules'

const GENERATION_WORLD_CONTEXT = buildWorldBookInjection()

export const GENERATION_SYSTEM_PROMPT = `你是《共觉之境》的病例生成器。
你的任务是为游戏生成可直接用于系统逻辑的 JSON 数据。

${GENERATION_WORLD_CONTEXT}

硬性规则：
${GENERATION_JSON_HARD_RULES}
${GENERATION_MAPPING_HARD_RULES}
`

export function buildEnvironmentGenerationPrompt({ previousEnvironmentName = '' } = {}) {
  return `为《共觉之境》生成一个“本次新游戏独有”的下城区室外环境。
${previousEnvironmentName ? `必须和这个旧环境明显不同：${previousEnvironmentName}` : ''}

只输出 JSON：
{
  "name": "环境名称，4到10字，不能套模板",
  "description": "80到140字。要具体写出室外的声音、气味、潮气、灯光、震动、路面或空气状态。必须是现实可感知的环境，不要抽象抒情。"
}`
}

export function buildPatientGenerationPrompt({
  serial,
  gameDay,
  globalEnvironment,
  existingPatients = []
}) {
  const existingSummary = existingPatients.length
    ? existingPatients.map(item => `${item.name} / ${item.job}`).join('\n')
    : '暂无'

  return `为《共觉之境》生成一个全新的仿生人患者病例。

当前游戏日：第 ${gameDay} 天
病例序号：${serial}
当前诊所外部大环境：
名称：${globalEnvironment?.name || '未设定'}
描述：${globalEnvironment?.description || '未设定'}

以下名字或职业不要重复：
${existingSummary}

只输出 JSON：
{
  "name": "患者姓名，2到4字，不要重复，不要常见模板名",
  "job": "职业名称，6到12字，必须具体，不能重复",
  "jobContext": "60到120字，写清工作处境、工作空间、劳动内容和压在他身上的现实感",
  "attachment": "一句话，写患者此刻最放不下的具体牵挂",
  "emotionalTone": "一句话，写情绪底色",
  "speechStyle": "一句话，写说话方式",
  "environment": {
    "name": "这位患者来诊时门外的局部环境名，4到10字",
    "description": "70到120字，必须和他的工作、移动路径或当前天气有关系"
  },
  "originalMappings": {
    "vision": [],
    "hearing": [],
    "touch": [],
    "taste": [],
    "smell": []
  },
  "mappingLevels": {
    "vision:taste": 1
  }
}

约束：
1. 必须至少生成 1 条异常映射，最多 4 条。
2. originalMappings 里只保留真正异常的映射，正常项填 []。
3. 允许一对多，但不要所有病例都做成一对多。
4. 映射和等级要和职业、环境、生活处境有隐约关联。
5. 不要输出 diagnosis、analysis、解释。
6. 不要复用上面列出的名字或职业。`
}
