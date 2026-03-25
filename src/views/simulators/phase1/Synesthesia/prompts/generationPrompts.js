import { buildWorldBookInjection } from './worldBook'
import {
  GENERATION_JSON_HARD_RULES,
  GENERATION_MAPPING_HARD_RULES
} from './sharedPromptRules'

const GENERATION_WORLD_CONTEXT = buildWorldBookInjection()

export const GENERATION_SYSTEM_PROMPT = `你是《共觉之境》的病例生成器。你的任务是为游戏生成可直接用于系统逻辑的 JSON 数据。
${GENERATION_WORLD_CONTEXT}

硬性规则：
${GENERATION_JSON_HARD_RULES}
${GENERATION_MAPPING_HARD_RULES}
`

export function buildEnvironmentGenerationPrompt({ previousEnvironmentDescription = '' } = {}) {
  return `为《共觉之境》生成一个下城区室外环境描述。${previousEnvironmentDescription ? `必须和这段旧描述明显不同：「${previousEnvironmentDescription}」` : ''}

只输出 JSON：{
  "description": "【严格限制】字数必须在20到40字之间，超出则重写。只写以下一种感知：化学气味、机械噪音、蒸汽、积液、管道震动、霓虹散射光、空气颗粒物、腐蚀性气息，只选其一，写具体现象，不要抒情，不要形容词堆叠，不要句号以外的标点。"
}

参考示例（严格按照这个风格和字数）：
- 头顶排气管在漏蒸汽，带着硫磺味，把墙面熏出一片黄渍。
- 地面积着不知道从哪渗出来的液体，踩上去有轻微的化学刺激气味。
- 上层轨道在运行，震动顺着墙壁传下来，脚底能感觉到低频颤动。
- 霓虹管的散射光打在对面的锈蚀钢板上，空气里有金属粉尘和臭氧味。
- 通风竖井在往外排热气，混着机油烟和合成橡胶的焦糊气味。

禁止：超过40字、使用破折号或省略号、出现"诊所""患者""街道"等词、抽象描述情绪或氛围、写自然天气（下雨除外）。`
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

  return `为《共觉之境》生成一个全新的仿生人患者病例。当前游戏日：第 ${gameDay} 天。病例序号：${serial}
当前诊所外部环境：${globalEnvironment?.description || '未设置'}

以下名字或职业不要重复：
${existingSummary}

世界观背景：
2157年，下城区是上层城市排出的废热、废料、废人聚集的地方。管道纵横，层叠的违建钢板遮住了大半天光，霓虹和化学气体的光是这里主要的光源。仿生人在这里做最脏最重最危险的活，神经模块用到过载，感官系统长期在化学污染和高强度劳动下运行，是共觉病毒最容易侵入的群体。

职业设定要求：
1. 职业必须来自 2157 年下城区底层生态，有具体的工作场景和劳动内容。
2. 优先从以下方向选择：
   - 工业类：管道维护工、废料分拣员、义体零件回收员、化工槽清洁工、热力管道焊接工、冷凝水处理员
   - 物流类：地下轨道装卸工、违禁品跑腿、冷链配送员、废弃建材搬运工
   - 服务类：酒吧工作人员、合成食品摊贩、二手义体修理铺学徒、灰市翻译员
   - 演出类：地下拳场报分员、拳手、赌场荷官、酒吧乐手
   - 数字类：黑市数据标注员、监控节点维护员、技术员
   - 黑帮成员：打手、黑警、交易员
3. 禁止出现任何现代都市白领职业、旧时代职业、或明显不属于赛博朋克世界观的职业。
4. 职业名称要具体，能让人一眼看出干什么活，3到12字。

只输出 JSON：{
  "name": "患者姓名，2到4字，不要太俗套，要符合世界观背景",
  "job": "职业名称，3到12字，具体，不能带"下城区"三个字",
  "jobContext": "80到120字。写清这个人每天在哪里干什么，劳动空间是什么样的，身体承受什么样的损耗，和谁打交道，钱够不够用。要有下城区的具体质感：化学气味、噪音、违建空间、义体磨损、生存压力。",
  "attachment": "一句话，写患者此刻最放不下的一件具体的事或一个具体的人，不要抽象",
  "emotionalTone": "一句话，写情绪底色，要符合这个人的处境，不要文艺腔",
  "speechStyle": "一句话，写说话方式，体现职业和性格",
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
2. originalMappings 里只保留真正异常的感官，正常项填 []。
3. 映射要和职业、劳动场景有隐约关联，比如长期接触化学品的工人可能出现嗅觉异常，高噪音环境的工人可能出现听觉异常。
4. 允许一对多，但不要每个病例都做成一对多。
5. mappingLevels 只填有异常的映射对，等级 1 到 4。
6. 不要输出任何解释、分析或注释。
7. 不要复用上面列出的名字或职业。`
}
