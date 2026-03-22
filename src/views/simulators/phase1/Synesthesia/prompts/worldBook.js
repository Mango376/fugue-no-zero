export const WORLD_BOOK = [
  {
    id: 'world_core',
    title: '世界观核心',
    content:
      '2157年，“共觉”恶意代码在仿生人神经网络中扩散。它不会摧毁肉体，但会错乱感官映射，使视觉、听觉、触觉、味觉、嗅觉互相串线。'
  },
  {
    id: 'clinic_position',
    title: '主角位置',
    content:
      '玩家经营的维修店位于下城区边缘，设备不先进，但愿意接待那些去不起上城区诊所的人。'
  },
  {
    id: 'tone',
    title: '情绪基调',
    content:
      '整体基调是潮湿、冷硬、节制，但人物关系里要保留温情、牵挂和对生活的执拗。'
  },
  {
    id: 'environment',
    title: '环境干扰',
    content:
      '环境因素会对问诊造成额外误导，例如滴水、蒸汽、震动、油烟、雨夜潮气与施工噪音。'
  }
]

export function buildWorldBookInjection() {
  return WORLD_BOOK.map(entry => `【${entry.title}】\n${entry.content}`).join('\n\n')
}
