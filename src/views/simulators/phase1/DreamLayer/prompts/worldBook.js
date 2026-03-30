export const WORLD_BOOK = [
    {
      id: 'world_core',
      name: '世界观核心',
      sendOn: { rounds: [0] },
      content: `【世界观背景】
  时代：2050年前后，信息过载导致部分人意识坍缩进入永眠。
  永眠特征：心跳平稳、呼吸均匀，身体完好，但无法被唤醒。
  梦境层：意识坍缩后，患者在内部建造了封闭的意识空间。
  调律者：经认证可进入他人意识空间进行修复的人员。
  调律者处境：意识侵入者，患者潜意识可能接受也可能排斥。`
    },
  
    {
      id: 'pressure_types',
      name: '压力类型参考',
      sendOn: { rounds: [0, 1, 2] },
      content: `【核心议题：压力】
  压力必须来自长期积累，不是单一事件。
  病灶本质：想改变，但改变不了；想逃离，但逃离不了；
  想说出口，但没有人能接住。
  
  可涉及类型：
  · 年轻人：经济、就业、内卷、婚育、职场内耗
  · 中年人：失业、衰老、与子女隔阂、夹在父母与孩子之间
  · 老年人：跟不上时代、被需要与被抛下的矛盾
  · 孩子：学业压力、在期待中喘不过气
  · 普遍：亲密关系破裂、家庭关系紧张、社交焦虑、自我否定`
    },
  
    {
      id: 'item_guide',
      name: '道具叙事规范',
      sendOn: { trigger: 'has_item' },
      content: `【道具叙事规范】
  道具使用必须在叙事第一段自然体现，不能写"你使用了道具"。
  要把道具融入场景氛围，像一个真实发生的动作。`
    },
  
  ]
  
  export function buildWorldBookInjection({ round, gameStage, hasItem }) {
    const matched = WORLD_BOOK.filter(entry => {
      const { sendOn } = entry
      if (sendOn.rounds && sendOn.rounds.includes(round)) return true
      if (sendOn.trigger === 'escape' && gameStage === 'escape') return true
      if (sendOn.trigger === 'realecho' && gameStage === 'realecho') return true
      if (sendOn.trigger === 'has_item' && hasItem) return true
      return false
    })
  
    if (matched.length === 0) return ''
    return '\n\n' + matched.map(e => e.content).join('\n\n')
  }
  