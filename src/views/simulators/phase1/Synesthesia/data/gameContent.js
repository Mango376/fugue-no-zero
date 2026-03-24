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
  title: '感官错位症',
  subtitle: '下城诊所里的连锁误读与迟发回声',
  tagline:
    '你处理的不是幻觉本身，而是被污染后的感官映射。每一次问诊、诊断与治疗，都会在患者和系统里留下新的偏差。',
  summary:
    '2157 年，零号赋格下城诊所开始接收一批异常病例。患者并没有失去感觉，他们只是把世界接收错了方向。有人把噪音闻成铁锈味，有人把冷风看成光斑，有人触到金属时却在舌根尝到苦味。',
  detail:
    '你是诊所里负责“联觉维修”的维修师。你需要通过有限的问诊与诊断机会，判断是哪一条感官通路被错误连接，并决定如何调整设备、介入治疗，或者在风险过高时安排复诊。',
  continueHint: '继续翻阅背景资料，了解这座下城、这间诊所，以及第一批病人的来处。'
}

export const BACKGROUND_PAGES = [
  {
    id: 'virus',
    kicker: '城市剖面 / 01',
    title: '错位不是疾病爆发，而是基础层被悄悄改写',
    paragraphs: [
      '最早的病例没有集中出现在医院，而是零散地出现在仓储区、回收站、廉价公寓与高架轨道沿线。患者起初只以为自己过劳、缺觉，或者撞上了劣质义体补丁。真正让事情引起注意的，是相同的感官串线模式在不同街区重复出现。',
      '城市维护系统把这类现象临时归档为“低优先级神经噪声”，直到有工人因为把警报声误判成刺鼻消毒水而错过撤离指令。诊所由此被拉进处理链，成了最前线、也最廉价的一道筛网。',
      '后来人们发现，这不是单一病毒，也不是传统精神疾病，而是一种借由环境、设备、记忆残留与长期压力共同放大的联觉错位。你要修的，从来不是一句症状，而是一整套被拖偏的感知回路。'
    ]
  },
  {
    id: 'district',
    kicker: '城市剖面 / 02',
    title: '下城从不安静，噪声、广告与粉尘一起构成日常',
    paragraphs: [
      '高架列车从诊所外墙后掠过时，会带起整面楼体的轻微共振。廉价投影屏循环播送着分期义体广告，通风井里常年有热气、潮气和回收站的金属粉末。住在这里的人很少真正独处，他们只是习惯了被持续干扰。',
      '街区工作依赖短工平台与自动派单系统。人们在冷链仓、无人机塔、数据清洗间、旧件拆解场和灰色物流线上来回流动。收入不稳定，工时被切碎，睡眠和饮食都被挤压到最低限度。',
      '在这样的环境里，感官错位不会显得戏剧化，它更像一根悄悄偏掉的螺丝。多数患者会拖到生活实在受影响时才来求诊，而那时，串线往往已经形成了稳定习惯。'
    ]
  },
  {
    id: 'tone',
    kicker: '城市剖面 / 03',
    title: '诊所不负责拯救谁，它只负责在崩坏前把人勉强扶正',
    paragraphs: [
      '联觉维修诊所挂着“恢复日常功能”的牌子，却很少承诺“彻底治愈”。这里的设备多数是拼装升级而来，诊断仪的精度够用但不奢侈，治疗仪更像一个需要谨慎操作的校准台。',
      '你见过太多病人带着“先凑合一下”的态度进门。有人只想顺利撑完这个月工单，有人怕失去平台评分，有人不愿让家里知道自己感知出了问题。于是，很多决定都不是最优解，而是他们能承受的那个。',
      '这就是这间诊所的现实气味：不浪漫，不高尚，但足够具体。你的判断会改变病人接下来几天、几周甚至几个月的生活方向。'
    ]
  }
]

export const PLAYER_PROFILE = {
  title: '维修师',
  workplace: '下城区联觉维修诊所 / 诊断工位',
  brief:
    '你负责接待出现感官串线的患者，通过问诊、诊断和治疗模块，尽可能在有限资源内找出错位路径并处理。',
  creed: '先确认错位，再动手校正。任何看起来“差不多”的治疗，都可能把患者推向更深一层的混乱。'
}

export const ENVIRONMENT_PHASES = [
  {
    phase: 1,
    label: '环境阶段 I',
    name: '潮湿雨夜',
    description: '夜雨刚停，空气里浮着冷潮与机油味，高架桥滴水，诊所外墙偶尔传来电流贴着金属壳滑过去的轻响。'
  },
  {
    phase: 2,
    label: '环境阶段 II',
    name: '闷热午后',
    description: '午后的热气被风道困在街区里，塑料棚顶发白发亮，远处冷却塔低鸣不止，诊室里连呼吸都显得有些黏。'
  },
  {
    phase: 3,
    label: '环境阶段 III',
    name: '清晨换班',
    description: '天刚亮，街道还没完全醒过来，送货车和换班人流先一步把噪声推到窗边，诊所灯光比外面的天色更稳定。'
  }
]

export const DEFAULT_EQUIPMENT_OVERVIEW = [
  {
    id: 'vision',
    name: '视觉诊断模组',
    level: 1,
    summary: '用于确认视觉通路是否被映射到其他感官。',
    modules: ['听觉校准', '触觉校准', '味觉校准', '嗅觉校准']
  },
  {
    id: 'hearing',
    name: '听觉诊断模组',
    level: 1,
    summary: '用于确认听觉刺激在患者体内的偏移方向。',
    modules: ['视觉校准', '触觉校准', '味觉校准', '嗅觉校准']
  },
  {
    id: 'touch',
    name: '触觉诊断模组',
    level: 1,
    summary: '用于确认接触反馈是否被错误转译。',
    modules: ['视觉校准', '听觉校准', '味觉校准', '嗅觉校准']
  },
  {
    id: 'taste',
    name: '味觉诊断模组',
    level: 1,
    summary: '用于确认味觉与外界刺激之间的异常联动。',
    modules: ['视觉校准', '听觉校准', '触觉校准', '嗅觉校准']
  },
  {
    id: 'smell',
    name: '嗅觉诊断模组',
    level: 1,
    summary: '用于确认嗅觉残留与其他感官的串线强度。',
    modules: ['视觉校准', '听觉校准', '触觉校准', '味觉校准']
  }
]

export const HUB_ACTIONS = {
  primaryLabel: '接待下一位患者',
  primaryHint: '诊断仪和治疗仪次数会在新病例开始时重置，但你每天面对的环境和病例复杂度会继续变化。',
  saveLabel: '保存'
}

export const CONSULT_OPTION_LIBRARY = [
  {
    id: 'symptom',
    label: '追问触发条件',
    doctorLine: '这个感觉通常在什么情况下出现，什么时候会更明显？',
    promptFocus: '引导患者补充症状出现的具体场景、频率和变化趋势。'
  },
  {
    id: 'trigger',
    label: '追问时间频率',
    doctorLine: '这种情况持续多久了？是一阵一阵，还是几乎一直都在？',
    promptFocus: '引导患者补充首次发生时间、持续时长和近期加重节点。'
  },
  {
    id: 'impact',
    label: '追问症状细节',
    doctorLine: '你刚才说的那个感觉，具体像什么？每次都一样吗？',
    promptFocus: '引导患者补充主观感受、细节差异和强度变化。'
  },
  {
    id: 'environment',
    label: '追问近期生活变化',
    doctorLine: '最近工作和住处有没有什么变化？有没有接触新的设备、气味或者环境？',
    promptFocus: '引导患者补充工作内容、环境刺激和可能相关的生活事件。'
  }
]

export const PATIENT_NAME_POOL = [
  '祁渺',
  '阮见',
  '姜穗',
  '林渡',
  '邵闻',
  '白砚',
  '沈槐',
  '孟栖',
  '顾遥',
  '周既'
]

export const PATIENT_JOB_POOL = []

export const PATIENT_ATTACHMENT_POOL = [
  '袖口有未擦净的金属粉，像是刚从设备间匆忙赶来。',
  '鞋边沾着潮水和灰，裤脚有被机械刮擦过的旧线头。',
  '手背留着一次性贴片撕下后的红痕，像是刚做完某种便宜检测。',
  '衣领上有洗不掉的消毒水气味，混着通风井里的陈旧灰尘。',
  '随身包里装着折过几次的排班单，边角已经磨软了。',
  '说话时总会下意识摸一摸耳后接口，像是在确认设备还连着。'
]

export const PATIENT_TONE_POOL = [
  '说话克制，像怕自己描述得不够准确。',
  '语速偏慢，像是一边回忆一边确认自己有没有说错。',
  '表面平静，但细节处透着久拖不治后的疲惫。',
  '有点防备，不愿意一开始就把所有情况摊开。',
  '试图把症状说得轻描淡写，像是不想让它听起来太严重。'
]

export const PATIENT_SPEECH_STYLE_POOL = [
  '句子简短，常常先停一下再继续。',
  '描述具体，会不自觉提到工作里的细节。',
  '不爱用夸张词，更愿意说“像是”“有点像”。',
  '说到关键感觉时会重复某几个词，像在找最接近的表达。',
  '会先否认“没什么”，再慢慢补出真正困扰自己的部分。'
]

export const SYSTEM_SNAPSHOT = [
  '诊断仪状态稳定，当前精度足以支持基础串线判断。',
  '治疗仪校准完成，但每次介入仍应以已确认错位为优先。',
  '今日环境噪声偏高，患者对外界刺激的描述可能更混杂。',
  '复诊队列允许保留未完全治愈病例，等待下一轮观察与处理。'
]

export const DIAGNOSIS_LIMIT = 2
export const TREATMENT_LIMIT = 2
export const REVISIT_DELAY_DAYS = 7
export const REAL_MS_PER_GAME_DAY = 60 * 60 * 1000

export const DEFAULT_GAME_STATE = {
  phase: 'background_intro',
  consultStage: 'arrival_intro',
  backgroundPage: 0,
  credits: 0,
  patientCount: 0,
  gameDay: 1,
  lastTimeSyncAt: 0,
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
// 前 10 位患者使用固定复杂度规则，确保前期难度爬升更平滑。
// serial 为 1-10 时返回对应规则；超过 10 后交给动态生成逻辑处理。
// environmentPhase 只决定环境氛围，不直接改变这些配置。
// ================================================================

export const PRESET_PATIENT_RULES = [
  {
    serial: 1,
    maxLevel: 1,
    minAbnormal: 1,
    maxAbnormal: 1,
    allowOneToMany: false,
    maxTargetsPerSource: 1,
    mustHaveLv2: false,
    isUpgradeTutorial: false,
    forceDebt: false
  },
  {
    serial: 2,
    maxLevel: 1,
    minAbnormal: 2,
    maxAbnormal: 2,
    allowOneToMany: false,
    maxTargetsPerSource: 1,
    mustHaveLv2: false,
    isUpgradeTutorial: false,
    forceDebt: false
  },
  {
    serial: 3,
    maxLevel: 1,
    minAbnormal: 1,
    maxAbnormal: 1,
    allowOneToMany: true,
    maxTargetsPerSource: 2,
    mustHaveLv2: false,
    isUpgradeTutorial: false,
    forceDebt: false
  },
  {
    serial: 4,
    maxLevel: 1,
    minAbnormal: 2,
    maxAbnormal: 2,
    allowOneToMany: false,
    maxTargetsPerSource: 1,
    mustHaveLv2: false,
    isUpgradeTutorial: false,
    forceDebt: false
  },
  {
    serial: 5,
    maxLevel: 1,
    minAbnormal: 3,
    maxAbnormal: 3,
    allowOneToMany: false,
    maxTargetsPerSource: 1,
    mustHaveLv2: false,
    isUpgradeTutorial: false,
    forceDebt: false
  },
  {
    serial: 6,
    maxLevel: 2,
    minAbnormal: 2,
    maxAbnormal: 2,
    allowOneToMany: false,
    maxTargetsPerSource: 1,
    mustHaveLv2: true,
    isUpgradeTutorial: true,
    forceDebt: false
  },
  {
    serial: 7,
    maxLevel: 2,
    minAbnormal: 2,
    maxAbnormal: 3,
    allowOneToMany: true,
    maxTargetsPerSource: 2,
    mustHaveLv2: true,
    isUpgradeTutorial: false,
    forceDebt: false
  },
  {
    serial: 8,
    maxLevel: 2,
    minAbnormal: 3,
    maxAbnormal: 3,
    allowOneToMany: false,
    maxTargetsPerSource: 1,
    mustHaveLv2: true,
    isUpgradeTutorial: false,
    forceDebt: true
  },
  {
    serial: 9,
    maxLevel: 2,
    minAbnormal: 2,
    maxAbnormal: 3,
    allowOneToMany: true,
    maxTargetsPerSource: 2,
    mustHaveLv2: true,
    isUpgradeTutorial: false,
    forceDebt: false
  },
  {
    serial: 10,
    maxLevel: 2,
    minAbnormal: 3,
    maxAbnormal: 4,
    allowOneToMany: true,
    maxTargetsPerSource: 2,
    mustHaveLv2: true,
    isUpgradeTutorial: false,
    forceDebt: false
  }
]

// ================================================================
// 规则查询辅助
// ================================================================

/**
 * 根据患者序号返回固定规则。
 * 前 10 位患者使用预设规则，之后返回 null。
 */
export function getPresetRule(serial) {
  if (serial > 10) return null
  return PRESET_PATIENT_RULES.find(rule => rule.serial === serial) ?? null
}

/**
 * 是否仍处于预设难度阶段。
 */
export function isPresetPeriod(serial) {
  return serial <= 10
}

/**
 * 是否应触发升级教学。
 */
export function shouldTriggerUpgradeTutorial(serial) {
  return getPresetRule(serial)?.isUpgradeTutorial ?? false
}

/**
 * 是否应强制制造经济压力。
 */
export function shouldForceDebt(serial) {
  return getPresetRule(serial)?.forceDebt ?? false
}
