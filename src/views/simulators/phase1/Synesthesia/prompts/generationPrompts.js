import { buildWorldBookInjection } from './worldBook'
import {
  GENERATION_JSON_HARD_RULES,
  GENERATION_MAPPING_HARD_RULES
} from './sharedPromptRules'

const GENERATION_WORLD_CONTEXT = buildWorldBookInjection()

export const GENERATION_SYSTEM_PROMPT = `你是《共感之境》的病例生成器。你的任务是为游戏生成可直接用于系统逻辑的 JSON 数据。${GENERATION_WORLD_CONTEXT}

硬性规则：
${GENERATION_JSON_HARD_RULES}
${GENERATION_MAPPING_HARD_RULES}
`

export function buildEnvironmentGenerationPrompt({ previousEnvironmentDescription = '' } = {}) {
  return `为《共感之境》生成一个“本次新游戏独有”的下城区室外环境。${previousEnvironmentDescription ? `必须和这段旧环境描述明显不同：${previousEnvironmentDescription}` : ''}

只输出 JSON：{
  "description": "20到30字。只写天气、噪音、气味、湿度、光线、震动、路面或空气状态。必须是现实可感知的环境，不要抽象抒情。只挑选一点描述。"
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

  return `为《共感之境》生成一个全新的仿生人患者病例。当前游戏日：第 ${gameDay} 天。病例序号：${serial}
当前诊所外部大环境：
描述：${globalEnvironment?.description || '未设置'}

以下名字或职业不要重复：
${existingSummary}

职业设定要求：
1. 世界观是 2157 年赛博朋克下城，不是当代县城，也不是二十世纪怀旧题材。
2. 职业必须来自近未来底层城市生态，优先考虑平台调度、数据标注、义体维护、无人机巡检、冷链配送、回收分拣、合成食品加工、地下演出技术、灰产跑腿、廉价医疗辅助、管线维护、终端值守、废料拆解等工种。
3. 禁止出现明显过时的旧时代职业或工作场景，比如胶片冲印暗房操作员、粮站柜员、供销社售货员、老式电报员、打字社录入员、录像厅放映员之类。

只输出 JSON：{
  "name": "患者姓名，2到4字，不要重复，不要常见模板名",
  "job": "职业名称，2到12字，必须具体，不能重复，不要带“下城区”三个字",
  "jobContext": "60到120字，写清工作处境、工作空间、劳动内容和现实压力，要有赛博朋克下城生活细节",
  "attachment": "一句话，写患者此刻最放不下的具体牵挂",
  "emotionalTone": "一句话，写情绪底色",
  "speechStyle": "一句话，写说话方式",
  "environment": {},
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
5. 职业和工作场景必须让人一看就属于 2157 年下城赛博朋克社会。
6. 不要输出 diagnosis、analysis、解释。
7. 不要复用上面列出的名字或职业。`
}
