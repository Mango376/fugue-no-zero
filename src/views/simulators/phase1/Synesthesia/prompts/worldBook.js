export const WORLD_BOOK = [
  {
    id: 'world_core',
    title: '世界背景',
    content:
      '时间是公元 2157 年。“共觉”恶意代码正在仿生人神经网络中扩散。它不会摧毁肉体，却会打乱感官映射，让视觉、听觉、触觉、味觉、嗅觉彼此串线。'
  },
  {
    id: 'clinic_position',
    title: '诊所位置',
    content:
      '诊所位于下城区边缘的夹缝地带，设备陈旧，证照缺失，却愿意接待那些去不起上城区正规诊所的仿生人。'
  },
  {
    id: 'doctor_role',
    title: '玩家身份',
    content:
      '你曾在上城区从事仿生人神经研究，后来流落下城，如今靠修复感官错乱维生。'
  },
  {
    id: 'bioroid_perspective',
    title: '仿生人设定',
    content:
      '仿生人不是机器，是用另一种方式活着的人。他们有名字、职业、牵挂和尊严，每一个推门进来的人都值得被认真对待。'
  }
]

export function buildWorldBookInjection(ids = []) {
  const requestedIds = Array.isArray(ids) && ids.length > 0
    ? new Set(ids)
    : null

  return WORLD_BOOK
    .filter(entry => !requestedIds || requestedIds.has(entry.id))
    .map(entry => `【${entry.title}】\n${entry.content}`)
    .join('\n\n')
}
