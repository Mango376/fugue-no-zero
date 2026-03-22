export const GAME_OVERVIEW = {
  title: '共觉之境',
  subtitle: '仿生人感官修复模拟器',
  tagline: '在赛博世界的裂缝里，修复错乱的感官，也修复被现实磨损的生活。',
  setting:
    '2157年，恶意代码“共觉”在仿生人神经网络中蔓延。它不摧毁躯体，只扭曲感官映射：看见会尝到味道，触碰会听见声音，真实与错觉开始重叠。',
  fantasy:
    '你在下城区经营一家不起眼的维修店。来者不拒，问诊、诊断、治疗、复诊，借由每一次修复进入他们的生活缝隙。'
}

export const GAME_LOOP_STEPS = [
  {
    id: 'intake',
    title: '患者进门',
    detail: '生成进门场景、当前环境干扰和患者第一轮交流语境。'
  },
  {
    id: 'interview',
    title: '问诊',
    detail: '通过AI对话了解症状表现、职业处境、情感牵挂和隐性压力。'
  },
  {
    id: 'diagnosis',
    title: '填写诊断单',
    detail: '玩家根据问诊内容记录感官异常映射，诊断单可反复修改。'
  },
  {
    id: 'verify',
    title: '连接诊断仪验证',
    detail: '每次验证消耗1次机会，最多3次，只返回真实存在的异常与等级。'
  },
  {
    id: 'treatment',
    title: '治疗',
    detail: '根据确认结果与设备等级修复异常；修好的收费，未修好的保留到复诊。'
  },
  {
    id: 'followup',
    title: '结局或复诊',
    detail: '完全治愈则解锁完整故事；若仍有异常，则预约复诊并触发变异与环境推进。'
  }
]

export const SENSOR_SYSTEM = [
  {
    id: 'vision',
    name: '视觉',
    symptom: '看见画面时，错误接收到听觉 / 触觉 / 味觉 / 嗅觉信号。'
  },
  {
    id: 'hearing',
    name: '听觉',
    symptom: '听见声音时，同时触发视觉或其他感官的感受。'
  },
  {
    id: 'touch',
    name: '触觉',
    symptom: '被触碰、受压、受热时，感官反馈映射到别的通道。'
  },
  {
    id: 'taste',
    name: '味觉',
    symptom: '尝到食物、金属或药剂时，感受到不属于味觉的信号。'
  },
  {
    id: 'smell',
    name: '嗅觉',
    symptom: '闻到气味时，可能触发画面、声音或其他感受。'
  }
]

export const ANOMALY_LEVELS = [
  { level: 'Lv.1', desc: '淡淡的、轻微的、一闪而过。' },
  { level: 'Lv.2', desc: '清晰的、持续的，已经能分辨细节。' },
  { level: 'Lv.3', desc: '鲜明且带有情绪与叙事感。' },
  { level: 'Lv.4', desc: '完全替代原感官，真假混淆。' }
]

export const DEVICE_SYSTEM = [
  {
    sense: '视觉治疗仪',
    modules: ['听觉映射', '触觉映射', '味觉映射', '嗅觉映射']
  },
  {
    sense: '听觉治疗仪',
    modules: ['视觉映射', '触觉映射', '味觉映射', '嗅觉映射']
  },
  {
    sense: '触觉治疗仪',
    modules: ['视觉映射', '听觉映射', '味觉映射', '嗅觉映射']
  },
  {
    sense: '味觉治疗仪',
    modules: ['视觉映射', '听觉映射', '触觉映射', '嗅觉映射']
  },
  {
    sense: '嗅觉治疗仪',
    modules: ['视觉映射', '听觉映射', '触觉映射', '味觉映射']
  }
]

export const ECONOMY_RULES = [
  '模块初始为 Lv.1，只能治疗 Lv.1 症状。',
  '升级成本按 200 / 400 / 600 信用点递增。',
  '收费只计算本次实际成功治疗的条目。',
  'Lv.1 / Lv.2 / Lv.3 / Lv.4 收费分别为 50 / 100 / 150 / 200 信用点。'
]

export const ENVIRONMENT_FACTORS = [
  {
    name: '管道滴水',
    impact: '低频滴答声，影响听觉判断。'
  },
  {
    name: '蒸汽泄漏',
    impact: '空气中混着灼热与薄雾，干扰视觉和嗅觉。'
  },
  {
    name: '隔壁演出',
    impact: '持续低音震动，干扰触觉和听觉。'
  },
  {
    name: '施工噪音',
    impact: '不规律撞击声，压缩对话的辨识空间。'
  },
  {
    name: '雨夜潮湿',
    impact: '铁锈和湿冷气味上升，影响嗅觉。'
  },
  {
    name: '排档烟火',
    impact: '油烟味漂入店内，可能扰动嗅觉与味觉。'
  }
]

export const PRESET_PATIENTS = [
  {
    id: 'courier',
    name: '底层快递员',
    job: '穿梭于管道与窄巷之间的送件员',
    attachment: '家里有人等他回去吃饭',
    symptoms: ['视觉 → 听觉 Lv.1'],
    note: '新手教学患者，帮助玩家理解单条异常。'
  },
  {
    id: 'stall-owner',
    name: '街边小摊贩',
    job: '在下城区巷口卖吃食',
    attachment: '想给孩子买一件一直想要的东西',
    symptoms: ['听觉 → 触觉 Lv.1', '嗅觉 → 视觉 Lv.1'],
    note: '开始引入多条异常与生活压力。'
  },
  {
    id: 'janitor',
    name: '夜班清洁工',
    job: '打扫公共区域，见过太多不被看见的狼狈',
    attachment: '想继续照顾工作地收养的流浪动物',
    symptoms: ['视觉 → 味觉 Lv.1', '视觉 → 嗅觉 Lv.1'],
    note: '首次出现一对多异常。'
  },
  {
    id: 'assistant',
    name: '地下诊所跑腿助手',
    job: '搬药、送货、扶住失控的病人',
    attachment: '想继续跟着曾救过自己的人',
    symptoms: ['视觉 → 听觉 Lv.2', '嗅觉 → 触觉 Lv.1'],
    note: '自然引出设备升级教学。'
  }
]

export const AI_TIMELINE = [
  {
    trigger: '迎接新患者',
    behavior: '生成后台档案、进门场景和第一轮问诊选项。'
  },
  {
    trigger: '玩家选择问诊项',
    behavior: '生成患者回应与下一轮选项。'
  },
  {
    trigger: '玩家点击诊断',
    behavior: '不调用AI，纯代码返回正确条目与等级。'
  },
  {
    trigger: '玩家点击治疗',
    behavior: '治疗判定走纯代码，治疗过程与反馈文本由AI生成。'
  },
  {
    trigger: '完全治愈 / 环境切换 / 复诊进门',
    behavior: '生成解锁故事、环境过渡和复诊开场。'
  }
]

export const FILE_STRUCTURE = [
  'index.vue：页面壳层与主要布局',
  'composables/useGameLogic.js：界面状态、阶段切换、提示词预览',
  'data/gameContent.js：玩法结构、系统配置、样例患者',
  'prompts/systemPrompt.js：系统级叙事约束',
  'prompts/worldBook.js：世界观注入与上下文扩展',
  'prompts/promptBuilder.js：患者、对话、治疗等提示词拼装'
]

export const DEV_MILESTONES = [
  '先完成标题页、工作台布局和五感治疗仪面板。',
  '把诊断、治疗、收费和升级逻辑先用纯代码跑通。',
  '再接患者生成、对话循环和环境干扰。',
  '最后补复诊、赊账、短信和聊天记录导出。'
]
