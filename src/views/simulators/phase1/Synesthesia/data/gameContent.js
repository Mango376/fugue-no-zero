export const SENSE_CONFIGS = [
  { id: 'vision', label: '视觉' },
  { id: 'hearing', label: '听觉' },
  { id: 'touch', label: '触觉' },
  { id: 'taste', label: '味觉' },
  { id: 'smell', label: '嗅觉' }
]

export const SENSE_LABELS = Object.fromEntries(
  SENSE_CONFIGS.map(item => [item.id, item.label])
)

export const SENSE_TARGETS = Object.fromEntries(
  SENSE_CONFIGS.map(item => [
    item.id,
    SENSE_CONFIGS.filter(other => other.id !== item.id).map(other => other.id)
  ])
)

export const TITLE_CONTENT = {
  eyebrow: 'PHASE I / SIMULATOR II',
  title: '共觉之境',
  subtitle: '仿生人感官修复模拟器',
  tagline: '在错乱的感官之间，听见一座城市仍在努力活下去的声音。',
  summary:
    '2157年，网络病毒“共觉”在仿生人神经网络中蔓延。它改写感官映射，让看见、听见、触碰、闻到与尝到彼此串线。',
  detail:
    '你经营着一家位于下城区的仿生人维修站。',
  continueHint: '继续游戏将恢复到上次离开的阶段。'
}

export const BACKGROUND_PAGES = [
  {
    id: 'virus',
    kicker: '背景介绍 / 01',
    title: '公元2157年',
    paragraphs: [
      '这是一个人类不再孤独的时代，仿生人诞生了。',
      '他们能工作，能学习，能组建自己的家庭。仿生人逐渐成为“新人类”，在社会中承担着属于自己的角色。',
      '但仿生人终究不是万能的，人类尚有自愈能力，但对仿生人来说，一段错误的代码足以致命。',
      '某一天，一种新型的仿生人病毒迅速在仿生人中流散开来。'
    ]
  },
  {
    id: 'district',
    kicker: '背景介绍 / 02',
    title: '共觉症',
    paragraphs: [
      '这是仿生人的精神疾病，来自于庞大的生活压力，持续不断运转的神经接口被攻击，导致很多人都出现了感官共享的问题。',
      '神经网络中的信号开始串扰，感官之间的边界开始模糊。',
      '更换神经模块、升级免疫系统、重置感官隔离——每一项都是天价。有人看到了这里面的商机，把本该是医疗的东西做成了生意，越做越大，越做越黑。'
    ]
  },
  {
    id: 'tone',
    kicker: '背景介绍 / 03',
    title: '关于你',
    paragraphs: [
      '你曾经在上城区做研究。研究什么，不重要。为什么离开，也不重要。',
      '在这里，你要做的，是倾听他人的描述，再判断出现了哪些问题，然后尽可能把那些已经错位的感官，一点一点归回原处。',
      '门铃响起时，故事就会真正开始。你会先听到患者的脚步，再听到他们把生活里的裂口一点点讲给你。'
    ]
  }
]

export const PLAYER_PROFILE = {
  title: '维修师',
  workplace: '下城区仿生人维修站',
  brief: '你负责接待感染“共觉”的仿生人，问诊、诊断、治疗，并在必要时约定复诊。',
  creed: '你不替任何人评判生活，只负责把错乱的感官重新校准。'
}

export const DEFAULT_EQUIPMENT_OVERVIEW = [
  {
    id: 'vision',
    name: '视觉治疗仪',
    level: 1,
    summary: '修复视觉端接收到的错误映射信号。',
    modules: ['听觉映射', '触觉映射', '味觉映射', '嗅觉映射']
  },
  {
    id: 'hearing',
    name: '听觉治疗仪',
    level: 1,
    summary: '修复听觉端接收到的错误映射信号。',
    modules: ['视觉映射', '触觉映射', '味觉映射', '嗅觉映射']
  },
  {
    id: 'touch',
    name: '触觉治疗仪',
    level: 1,
    summary: '修复触觉端接收到的错误映射信号。',
    modules: ['视觉映射', '听觉映射', '味觉映射', '嗅觉映射']
  },
  {
    id: 'taste',
    name: '味觉治疗仪',
    level: 1,
    summary: '修复味觉端接收到的错误映射信号。。',
    modules: ['视觉映射', '听觉映射', '触觉映射', '嗅觉映射']
  },
  {
    id: 'smell',
    name: '嗅觉治疗仪',
    level: 1,
    summary: '修复嗅觉端接收到的错误映射信号。。',
    modules: ['视觉映射', '听觉映射', '触觉映射', '味觉映射']
  }
]

export const HUB_ACTIONS = {
  primaryLabel: '接待下一位患者',
  primaryHint: '门铃下一次响起时，就从这里进入完整的问诊闭环。',
  saveLabel: '保存进度'
}

export const SYSTEM_SNAPSHOT = [
  '你需要等待客人上门，才能开始诊断',
  '你可以通过跟客人对话，来分析患者的具体病症',
  '室外的环境和室内不同，患者的感知或许会受影响',
  '为保证患者的神经接口不会过载，诊断仪每次来诊仅可使用 2 次，只显示已确认正确的映射，不直接指出错误项',
  '治疗后若仍有残留问题且诊断次数耗尽，则预约 7 个游戏日后的复诊',
  '有时候患者的响应会加载失败，你可以重新要求响应',
  '响应失败的时候，请注意你的信号连接线路',
]

export const DIAGNOSIS_LIMIT = 2
export const TREATMENT_LIMIT = 2
export const REVISIT_DELAY_MS = 7 * 30 * 60 * 1000

export const DEFAULT_GAME_STATE = {
  phase: 'background_intro',
  consultStage: 'arrival_intro',
  backgroundPage: 0,
  credits: 0,
  patientCount: 0,
  nextPatientSerial: 1,
  environmentPhase: 1,
  playerProfile: PLAYER_PROFILE,
  equipmentOverview: DEFAULT_EQUIPMENT_OVERVIEW,
  activePatient: null,
  consultationHistory: [],
  consultNotes: '',
  diagnosisDraft: null,
  confirmedDiagnosis: null,
  diagnosisUsesLeft: DIAGNOSIS_LIMIT,
  treatmentUsesLeft: TREATMENT_LIMIT,
  treatmentDraft: null,
  revisitQueue: [],
  completedCases: []
}

// ================================================================
// 前10个患者的症状规则表
// 只约束症状等级上限、异常数量、是否允许一对多
// 不约束患者姓名、职业、牵挂、性格（全部从上方数据池随机生成）
// 不约束环境因素（使用当前 environmentPhase 的实际环境）
// 第11个患者起进入随机期，不再查这张表
// ================================================================

export const PRESET_PATIENT_RULES = [

  // 患者1：一个感官，一个Lv.1异常
  // 最简单，帮助玩家熟悉基本问诊和诊断流程
  {
    serial:              1,
    maxLevel:            1,
    minAbnormal:         1,
    maxAbnormal:         1,
    allowOneToMany:      false,
    maxTargetsPerSource: 1,
    mustHaveLv2:         false,
    isUpgradeTutorial:   false,
    forceDebt:           false
  },

  // 患者2：两个独立的一对一Lv.1异常
  // 开始学习同时追踪多个症状
  {
    serial:              2,
    maxLevel:            1,
    minAbnormal:         2,
    maxAbnormal:         2,
    allowOneToMany:      false,
    maxTargetsPerSource: 1,
    mustHaveLv2:         false,
    isUpgradeTutorial:   false,
    forceDebt:           false
  },

  // 患者3：一个感官，一对多Lv.1异常首次出现
  // 让玩家理解一个感官可以同时接收多种错误信号
  {
    serial:              3,
    maxLevel:            1,
    minAbnormal:         1,
    maxAbnormal:         1,
    allowOneToMany:      true,
    maxTargetsPerSource: 2,
    mustHaveLv2:         false,
    isUpgradeTutorial:   false,
    forceDebt:           false
  },

  // 患者4：两个独立的一对一Lv.1异常
  // 练习同时追踪两个不相关的感官问题
  {
    serial:              4,
    maxLevel:            1,
    minAbnormal:         2,
    maxAbnormal:         2,
    allowOneToMany:      false,
    maxTargetsPerSource: 1,
    mustHaveLv2:         false,
    isUpgradeTutorial:   false,
    forceDebt:           false
  },

  // 患者5：三个独立的一对一Lv.1异常
  // 练手期最复杂，为过渡期做准备
  {
    serial:              5,
    maxLevel:            1,
    minAbnormal:         3,
    maxAbnormal:         3,
    allowOneToMany:      false,
    maxTargetsPerSource: 1,
    mustHaveLv2:         false,
    isUpgradeTutorial:   false,
    forceDebt:           false
  },

  // 患者6：Lv.2首次出现，触发升级教程
  // 两个异常，至少一个Lv.2
  {
    serial:              6,
    maxLevel:            2,
    minAbnormal:         2,
    maxAbnormal:         2,
    allowOneToMany:      false,
    maxTargetsPerSource: 1,
    mustHaveLv2:         true,
    isUpgradeTutorial:   true,
    forceDebt:           false
  },

  // 患者7：一对多 + Lv.2，难度进一步提升
  // 2-3个异常，含一对多和Lv.2
  {
    serial:              7,
    maxLevel:            2,
    minAbnormal:         2,
    maxAbnormal:         3,
    allowOneToMany:      true,
    maxTargetsPerSource: 2,
    mustHaveLv2:         true,
    isUpgradeTutorial:   false,
    forceDebt:           false
  },

  // 患者8：强制赊账，3个异常，含Lv.2
  // 玩家第一次面对"治好了但收不到钱"的处境
  {
    serial:              8,
    maxLevel:            2,
    minAbnormal:         3,
    maxAbnormal:         3,
    allowOneToMany:      false,
    maxTargetsPerSource: 1,
    mustHaveLv2:         true,
    isUpgradeTutorial:   false,
    forceDebt:           true
  },

  // 患者9：一对多 + Lv.2，2-3个异常
  // 一个感官接收两种不同等级的错误信号
  {
    serial:              9,
    maxLevel:            2,
    minAbnormal:         2,
    maxAbnormal:         3,
    allowOneToMany:      true,
    maxTargetsPerSource: 2,
    mustHaveLv2:         true,
    isUpgradeTutorial:   false,
    forceDebt:           false
  },

  // 患者10：预设期最复杂，3-4个异常，含Lv.2
  // 多感官、多映射，为随机期做最后热身
  {
    serial:              10,
    maxLevel:            2,
    minAbnormal:         3,
    maxAbnormal:         4,
    allowOneToMany:      true,
    maxTargetsPerSource: 2,
    mustHaveLv2:         true,
    isUpgradeTutorial:   false,
    forceDebt:           false
  }
]

// ================================================================
// 工具函数：查规则表
// ================================================================

/**
 * 根据序号获取预设规则
 * 第11个患者及以后返回 null，进入随机期
 */
export function getPresetRule(serial) {
  if (serial > 10) return null
  return PRESET_PATIENT_RULES.find(rule => rule.serial === serial) ?? null
}

/**
 * 判断是否处于预设期
 */
export function isPresetPeriod(serial) {
  return serial <= 10
}

/**
 * 判断是否触发升级教程
 */
export function shouldTriggerUpgradeTutorial(serial) {
  return getPresetRule(serial)?.isUpgradeTutorial ?? false
}

/**
 * 判断是否强制赊账
 */
export function shouldForceDebt(serial) {
  return getPresetRule(serial)?.forceDebt ?? false
}
