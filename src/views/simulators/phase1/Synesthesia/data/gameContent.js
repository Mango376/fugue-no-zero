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
    '2157 年，恶意代码“共觉”在仿生人神经网络中蔓延。它不摧毁躯体，只改写感官映射，让看见、听见、触碰、闻到与尝到彼此串线。',
  detail:
    '你经营着一家位于下城区边缘的感官维修店。门面狭窄，设备陈旧，但足够让那些去不起上城区医疗机构的人，暂时拥有一个被认真倾听的地方。',
  continueHint: '继续游戏将恢复到上次离开的阶段。'
}

export const BACKGROUND_PAGES = [
  {
    id: 'virus',
    kicker: '背景介绍 / 01',
    title: '共觉不是伤口，而是一种错位',
    paragraphs: [
      '“共觉”是一段在仿生人神经网络中传播的恶意代码。它不令关节失灵，不令内核熄灭，也不在表面留下任何显眼的裂痕。',
      '它做的事情更隐秘，也更残忍。视觉会牵出味觉，触碰会唤起声音，雨夜的铁锈味可能从眼前的霓虹里冒出来，明明只是听见门轴响动，却像被冰冷的金属沿着脊背缓慢划过。',
      '感染者往往还能正常说话、走路、工作，于是他们更容易被误解成夸张、失控，或者故意把痛苦说得难以理解。'
    ]
  },
  {
    id: 'district',
    kicker: '背景介绍 / 02',
    title: '上城区太贵，下城区太近',
    paragraphs: [
      '上城区有更先进的设备，也有更体面的诊室。但那里的收费高得吓人，足以把一个仿生人接下来几个月的生活彻底掏空。',
      '于是更多人来到下城区，走进巷口、管道、蒸汽和潮气交叠的地方。他们在工厂上夜班，在街边支摊，在地下诊所搬药，在帮派和货运站之间讨生活。',
      '你的店就开在这样的缝隙里。门口没有霓虹招牌，只有一块旧牌和一盏时亮时暗的指示灯，但熟悉这片街区的人都知道，这里能修的，不只是设备。'
    ]
  },
  {
    id: 'tone',
    kicker: '背景介绍 / 03',
    title: '你面对的不是病例，而是生活本身',
    paragraphs: [
      '每一个走进门的人，都带着一种仍想继续活下去的理由。有人想回家吃一顿热饭，有人想撑到给弟妹汇完生活费，有人只是还想把明天的班上完。',
      '所以在这里，问诊不是审判，诊断不是猜谜，治疗也不是把一切修得像新的一样。你要做的，是先听见，再判断，然后尽可能把那些已经错位的感官，一点一点归回原处。',
      '门铃响起时，故事就会真正开始。你会先听到患者的脚步，再听到他们把生活里的裂口一点点讲给你。'
    ]
  }
]

export const PLAYER_PROFILE = {
  title: '下城区仿生人感官维修师',
  workplace: '边缘诊所 / 感官维修台',
  brief: '你负责接待感染“共觉”的仿生人，问诊、诊断、治疗，并在必要时约定复诊。',
  creed: '你不替任何人评判生活，只负责把错乱的感官重新校准。'
}

export const ENVIRONMENT_PHASES = [
  {
    phase: 1,
    label: '环境阶段 I',
    name: '潮湿雨夜',
    description: '雨水顺着铁皮棚边缘往下滴，空气里有潮湿的铁锈味，诊所外的脚步声被积水闷得很浅。'
  },
  {
    phase: 2,
    label: '环境阶段 II',
    name: '蒸汽回流',
    description: '隔壁管道偶尔吐出薄雾，墙体发热，诊室里隐约混着消毒水与金属烫过后的味道。'
  },
  {
    phase: 3,
    label: '环境阶段 III',
    name: '低频震动',
    description: '不远处的地下演出场把低音送进地面，桌角和玻璃杯会在某些停顿里细微共振。'
  }
]

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
    summary: '修复听觉端的串线与误触发。',
    modules: ['视觉映射', '触觉映射', '味觉映射', '嗅觉映射']
  },
  {
    id: 'touch',
    name: '触觉治疗仪',
    level: 1,
    summary: '用于校准触觉反馈回路。',
    modules: ['视觉映射', '听觉映射', '味觉映射', '嗅觉映射']
  },
  {
    id: 'taste',
    name: '味觉治疗仪',
    level: 1,
    summary: '修复味觉回路中的异常联动。',
    modules: ['视觉映射', '听觉映射', '触觉映射', '嗅觉映射']
  },
  {
    id: 'smell',
    name: '嗅觉治疗仪',
    level: 1,
    summary: '修复嗅觉端的错误感官接入。',
    modules: ['视觉映射', '听觉映射', '触觉映射', '味觉映射']
  }
]

export const HUB_ACTIONS = {
  primaryLabel: '接待下一位患者',
  primaryHint: '门铃下一次响起时，就从这里进入完整的问诊闭环。',
  saveLabel: '保存进度'
}

export const CONSULT_OPTION_LIBRARY = [
  {
    id: 'symptom',
    label: '追问异常表现',
    doctorLine: '先别急，把那种错位最明显的一瞬间，再说细一点。',
    promptFocus: '追问患者最直接的感官错乱表现，让患者用自己的语言复述最难受的一幕。'
  },
  {
    id: 'trigger',
    label: '追问触发场景',
    doctorLine: '这种异常通常在什么情况下出现？是在工作的时候，还是在某个固定场景里？',
    promptFocus: '追问异常的触发时机、场景与动作，帮助玩家区分真实映射问题和环境干扰。'
  },
  {
    id: 'impact',
    label: '追问生活影响',
    doctorLine: '它最先影响到你生活里的哪一部分？工作、关系，还是你自己？',
    promptFocus: '追问异常如何影响患者的工作、关系和日常秩序，让症状与生活压力结合。'
  },
  {
    id: 'environment',
    label: '排查环境干扰',
    doctorLine: '进门前后，你周围有没有什么声音、气味、震动或者灯光特别明显？',
    promptFocus: '追问患者所处环境中的噪音、蒸汽、潮气和光线，提醒玩家环境可能会制造误导。'
  }
]

export const PATIENT_NAME_POOL = [
  '林柊',
  '周纱',
  '季衡',
  '祁芮',
  '岑野',
  '夏闻',
  '唐屿',
  '阮烁',
  '邵祈',
  '温珞'
]

export const PATIENT_JOB_POOL = [
  {
    title: '夜班焊接工',
    context: '常年在雨棚和热管之间焊接补缝，工作时耳边总有金属回响和电流味。'
  },
  {
    title: '地下货运分拣员',
    context: '在货运站和升降轨之间搬运包裹，班次混乱，常常靠短暂休息硬撑。'
  },
  {
    title: '街边摊炊烟工',
    context: '每天在油烟、热气和霓虹灯下守摊，习惯一边招呼客人一边记账。'
  },
  {
    title: '旧楼管道维护员',
    context: '负责老旧街区的蒸汽管道检修，长期待在闷热、回声重的狭窄空间里。'
  },
  {
    title: '地下演出场灯控',
    context: '在震动和低频声里熬夜调灯，对节拍、闪烁和人群反应极其敏感。'
  },
  {
    title: '义体清洁技师',
    context: '在诊所后巷帮人维护廉价义体，鼻腔里总混着消毒水和焦塑味。'
  }
]

export const PATIENT_ATTACHMENT_POOL = [
  '想把这个月的工资按时汇回家里。',
  '还得撑着去接弟弟放学，不想再把人认错。',
  '担心夜班再出问题，会被老板直接辞退。',
  '已经拖了太久，不想让伴侣继续觉得自己在发疯。',
  '想在下次复工前把症状压下去，至少先把班上完。',
  '不敢和同事说，怕被丢去做廉价重置。'
]

export const PATIENT_TONE_POOL = [
  '克制得近乎麻木，但每说到关键处都会停一下。',
  '表面平静，实际上一直在压着焦躁和疲惫。',
  '嘴上说没事，语气里却有明显的逞强。',
  '说话谨慎，像是在反复确认自己是不是会被误解。',
  '对自己的异常感到羞耻，因此会回避最难堪的细节。'
]

export const PATIENT_SPEECH_STYLE_POOL = [
  '说话短句居多，偶尔会突然停顿。',
  '叙述会绕弯，需要被追问后才给出关键信息。',
  '对具体场景记得很清楚，但不擅长总结病症。',
  '愿意配合问诊，却会下意识淡化自己的痛苦。',
  '一提到工作就会加快语速，像是怕自己停下来。'
]

export const SYSTEM_SNAPSHOT = [
  '标题页 -> 背景介绍 -> 主界面 -> 单患者问诊 -> 诊断仪 -> 治疗仪 -> 患者反馈',
  '诊断仪每次来诊仅可使用 2 次，只显示已确认正确的映射，不直接指出错误项',
  '治疗后若仍有残留问题且诊断次数耗尽，则预约 7 个游戏日后的复诊',
  '现实 1 小时折算为游戏 1 天，仅在继续游戏或读档时统一结算'
]

export const DIAGNOSIS_LIMIT = 2
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
  treatmentDraft: null,
  revisitQueue: [],
  completedCases: []
}
