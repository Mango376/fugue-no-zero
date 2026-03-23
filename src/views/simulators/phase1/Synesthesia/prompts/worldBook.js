export const WORLD_BOOK = [
  {
    id: 'world_core',
    title: '世界观核心',
    content:
      '2157 年，“共觉”恶意代码在仿生人神经网络中扩散。它不会摧毁肉体，却会错乱感官映射，使视觉、听觉、触觉、味觉、嗅觉彼此串线。'
  },
  {
    id: 'clinic_position',
    title: '诊所位置',
    content:
      '玩家经营的维修店位于下城区边缘，设备不算先进，但愿意接待那些去不起上城区诊所的人。'
  },
  {
    id: 'tone',
    title: '情绪基调',
    content:
      '整体基调潮湿、冷硬、节制，但人物关系里要保留温情、牵挂和对生活的执拗。'
  },
  {
    id: 'environment',
    title: '环境干扰',
    content:
      '雨夜、蒸汽、低频震动、油烟、霓虹和施工噪音都会对问诊造成额外误导，但不要把它们直接解释成标准答案。'
  }
]

export function buildWorldBookInjection() {
  return WORLD_BOOK.map(entry => `【${entry.title}】\n${entry.content}`).join('\n\n')
}
