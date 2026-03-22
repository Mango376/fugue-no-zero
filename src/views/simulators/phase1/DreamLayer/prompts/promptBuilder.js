export function buildScriptInitPrompt(script) {
    const diffGuide = {
      1: '6-8轮，单一意象，情感平缓',
      2: '8-10轮，1次反转，有情感起伏',
      3: '10-12轮，1-2次反转，压力层次交织',
      4: '12-14轮，2次反转，多重压力叠加',
      5: '12-15轮，2-3次反转，触及深层命题'
    }
  
    return `为本局游戏生成完整剧本背景。
  
  难度：${script.difficulty}星（${diffGuide[script.difficulty]}）
  患者：${script.name}，${script.age}岁，${script.profession}，昏迷${script.dormDuration}
  意象预览：「${script.preview}」
  
  请严格按以下四步顺序构建，每一步都必须认真完成：
  
  【第一步：塑造人物】
  这是一个什么样的人，这个人经历了什么。
  需要确定：姓名、年龄、职业、具体性格特征（不是标签）、在现实中经历了什么具体的事、
  这件事为什么对这个人造成了这么深的影响（答案必须来自这个人的具体处境）。
  
  ⚠️ 职业多样性要求：
患者来自社会各行各业，职业分布要足够多样。
医疗工作者（医生、护士等）只是其中一种可能，不应成为默认选择。
优先考虑以下职业方向（不限于此）：

· 互联网/科技：程序员、产品经理、UI设计师、运营、测试、算法工程师
· 教育：备考学生、高中生、研究生、中学教师、培训机构讲师、辅导老师
· 创意行业：插画师、摄影师、独立音乐人、作家、编剧、游戏策划、自媒体博主
· 商业/零售：便利店店长、餐厅老板、服装店主、奶茶店加盟商、电商卖家
· 传统行业：建筑师、土木工程师、厨师、厂里的流水线工人、机械维修工
· 金融/行政：会计、银行柜员、证券从业者、行政专员、HR、公务员
· 服务业：外卖员、快递员、滴滴司机、销售、客服、保险经纪人
· 体力/个体：装修工人、水电工、货车司机、摊贩、保洁
· 其他：全职父母、留守老人、刚毕业的应届生、待业青年、自由职业者、退休人员

职业要具体，压力要来自这个职业的真实处境，不要泛指。

【第二步：确定现实病灶】
  这个人的核心问题是什么？它来自现实生活的哪个具体场景？
  必须源于真实的社会处境，不是单一的创伤事件，而是长期积累的重量。
  病灶的本质：一种被困住的感觉——想改变，但改变不了；想逃离，但逃离不了；
  想说出口，但没有人能接住。

  可以涉及的压力类型（不限于此）：
  · 年轻人：经济压力、就业困难、内卷竞争、婚育焦虑、房价、职场内耗
  · 中年人：失业危机、身体衰老、与子女的隔阂、夹在父母与孩子之间的重压
  · 老年人：跟不上时代的失落感、被需要与被抛下的矛盾、疾病与孤独
  · 孩子：学业压力、在期待中喘不过气、不被理解的情绪、家人过度的爱
  · 普遍：亲密关系破裂、家庭关系紧张、社交焦虑、情绪长期压抑、自我否定
  
  【第三步：心象映射】
  将上述压力转化为梦境中的具象景观。
  评判标准：玩家看见这个意象的瞬间，不需要任何解释，就能感受到它在说什么。
  意象应当是荒诞的、沉重的、有质感的，而不是恐怖的。
  它可以是灰色的、压缩的、循环的、无法完成的、不断重复的——
  这些才是压力的形状。
  请详细描述：空间感、色调质感、物理规律的异常、核心意象、患者在其中的位置与状态。
  （300字以上）
  
  【第四步：确定社会议题与精神主题】
  社会议题：这个故事折射的是哪个现实压力场景？
  精神主题：这个故事想让玩家思考什么？
  主旨句：用一句话定义这个故事的中心。
  这两项是叙事的脊椎——之后每一轮的描写、对话、选项，
  都必须隐隐扣回这两个主题。不需要直接点明，但不能完全无关。
  
  【叙事节拍规划】
  根据难度规划本局的叙事节奏，标注：
  · 关键情感爆发点在哪一轮
  · 压力核心揭示的时机
  · 伪好转节点（如有）
  · 道具优化场景位置（建议1-2处）
  · 预计总轮数
  
    全部完成后，输出以下格式的档案表，每个字段独占一行，严格按格式填写：

---PROFILE---
人物介绍：（姓名，年龄，职业，一句话描述性格）
背景介绍：（100字以内，这个人经历了什么陷入了永眠）
心象映射：（30字以内，梦境的核心视觉意象）
社会议题：（一句话，折射的现实压力场景）
精神主题：（一句话，想让玩家思考的问题）
主旨句：（一句话，这个故事的中心）
当前目标：（本次意识修复的核心任务，一句话）
核心意象：（梦境最核心的视觉意象，30字以内）
---PROFILE_END---

[SCRIPT_READY]`

  }
  
  export function buildOpeningPrompt(ctx) {
    const parsed = parseScriptContext(ctx)
    return `【剧本背景】${ctx}
  
  【开场叙事要求】
  视角：第二人称"你"，禁止以"你"开头
  字数：300-400字
  核心任务：让玩家在读完之后，感觉自己已经真实站在这个梦境里
  
  必须包含的内容：
  · 视觉——梦境空间的整体样貌，色调、光线、空间感（参考心象映射：${parsed.imagery?.slice(0, 100) ?? '见剧本背景'}）
  · 听觉——这个空间里有什么声音，或者它的寂静是什么质感
  · 触觉/嗅觉——调律者的身体感受，脚踩在地面的感觉，空气的温度和气味
  · 患者——她在哪里，什么状态，和空间的关系，但保持距离感，不要立刻接触
  · 异常——梦境中物理规律的某处失效，让玩家感到这不是现实
  
  禁止：
  × 直接解释这个梦境代表什么
  × 患者主动说话或靠近
  × 任何形式的选项提示或道具提示
  × 使用“不是...而是...”或“不是...是...”这样的句式
  
  ---NARRATIVE---
  （开场叙事正文）
  ---OPTIONS---
  A. （选项）[OPT_TYPE:accompany|action|inquiry]
  B. （选项）[OPT_TYPE:accompany|action|inquiry]
  C. （选项）[OPT_TYPE:accompany|action|inquiry]
  ---INNER---
  （内心活动1-3句，第一人称"我"，描写调律者此刻的身体感知，不分析选项）
  ---TAGS---
  [IMPACT:none]
  [RESONANCE:neutral]`
  }  
  
  function getDifficultyGuide(currentRound, estimatedRounds) {
    const progress = currentRound / estimatedRounds
    if (progress < 0.3) {
      return `当前处于早期阶段（第${currentRound}/${estimatedRounds}轮）：
  · 以环境建立和意象呈现为主，情感冲击应克制
  · 患者保持一定距离，不要过早敞开
  · RESONANCE 以 neutral 为主，偶尔 rise，不出现 surge`
    } else if (progress < 0.6) {
      return `当前处于中期阶段（第${currentRound}/${estimatedRounds}轮）：
  · 表层压力开始显现，出现第一次情感触点
  · 可以出现 rise，surge 仍然克制
  · 环境变化应更明显地响应玩家的选择`
    } else if (progress < 0.85) {
      return `当前处于后期阶段（第${currentRound}/${estimatedRounds}轮）：
  · 核心压力逐渐浮出，情感浓度提升
  · 可以出现 surge，关键转折节点可用 heavy
  · 患者状态应有明显变化，不再只是保持距离`
    } else {
      return `当前处于尾声阶段（第${currentRound}/${estimatedRounds}轮）：
  · 情感高潮或收束，为撤离做准备
  · 允许出现决定性的 surge，共振可以达到顶点
  · 叙事应有足够的余韵和重量`
    }
  }
  
  export function buildRoundPrompt({
    playerAction,
    usedItem,
    wbInjection = '',
    scriptContext,
    scriptTracking,
    currentRound,
    estimatedRounds,
    neuralLoad,
    resonance,
    isDying,
    equippedItems,
    conversationHistory
  }) {
    const recent = conversationHistory.slice(-6).map(h =>
      `[玩家]${h.playerAction}\n[叙事]${h.narrative?.slice(0, 150)}…`
    ).join('\n\n')
  
    let itemInstruction = ''
    if (usedItem) {
      itemInstruction = `\n【⚠️道具使用要求】
  玩家本轮使用了道具：[${usedItem.name}]
  道具效果：${usedItem.desc}
  请在叙事正文中，用第一段话自然地描写调律者使用该道具的动作和它对梦境/患者产生的具体感官效果。
  不要写"你使用了道具"，要把道具融入场景氛围中。`
    }
  
    return `【剧本背景】${scriptContext}
    ${wbInjection}
    
    【当前游戏数值状态（仅供叙事参考，你不计算数值）】
    轮次：${currentRound} / 预计${estimatedRounds}轮
    神经载荷：${neuralLoad} | 共振深度：${resonance}%
    濒死状态：${isDying ? '是——梦境对调律者的排斥正在加剧' : '否'}
    
    【本局难度规范】
    ${getDifficultyGuide(currentRound, estimatedRounds)}
    ${scriptTracking ? `【本局追踪表】
      ${scriptTracking}` : ''}
    
    【⚠️场景类型判断（内部判断，不输出给玩家）】
    A. 纯环境探索轮（无可对话角色）→ 200-350字，无对话选项
    B. 有角色对话轮 → 350-550字，选项含1-2个对话内容
    C. 常规推进轮 → 300-500字
    D. 关键转折轮 → 400-600字，禁止注水
    
    【玩家本轮行动】${playerAction}${itemInstruction}
    
    【近期对话历史】
    ${recent || '（开场）'}
    
    【本轮叙事要求】
    · 梦境环境的变化必须响应玩家的选择，无论好坏梦境都有反应
    · 调律者的感官描写是必要的——脚踩在地面的感觉、空气的温度、身体的细微反应
    · 若有角色在场，对话要真实，有停顿，有说了一半没说完的句子
    · 若无角色，以环境叙事为主，不要为填充而制造对话
    · 禁止使用“不是...而是...”或“不是...是...”这样的句式
    
    【选项生成规范】
    · 三个选项都是玩家对当前场景的真实行动，没有明显最优解
    · 每个选项都包含真实代价
    · 选项文字描述行动或话语，不描述预期结果
    · 禁止任何形式的道具使用提示，选项中不出现"使用道具""道具"等字样
    · 禁止出现类型标签（【安慰】【探索】【冒险】）
    
    请严格按系统规定格式输出。`    
  }
  
  export function buildEscapePrompt({ escapeType, result, scriptContext, neuralLoad, resonance }) {
    const typeMap = { normal: '正常逃脱', dying: '濒死逃脱', forced: '共振满触发强制逃脱' }
    const resultMap = { success: '成功', near: '险险成功', fail: '失败' }
    return `【本局剧本背景】${scriptContext.slice(0, 300)}
  
  【逃脱状态】
  逃脱类型：${typeMap[escapeType] ?? '正常逃脱'}
  判定结果：${resultMap[result] ?? '失败'}
  当前神经载荷：${neuralLoad}
  当前共振深度：${resonance}%
  
  【逃脱叙事要求】
  判定结果为 success（成功）：
  - 描写调律者的意识从梦境空间撤离的过程
  - 难度越高，撤离过程越有重量，不是轻飘飘地走
  - 若共振深度100%，描写梦境空间开始自然崩解的景象
  - 结尾给出患者在梦境最后一刻的状态
  
  判定结果为 near（险险成功）：
  - 描写撤离时遭遇梦境的拉扯或阻碍
  - 调律者付出了某种代价才勉强脱身
  - 代价在叙事中体现，不要写成系统提示
  
  判定结果为 fail（失败）：
  - 描写逃脱通道被关闭或受阻
  - 调律者需要重新寻找出路
  - 给玩家真实的紧张感，不是游戏提示"失败，再试一次"
  - 若是濒死状态失败，叙事紧张程度相应提升
  
  ---NARRATIVE---
  （逃脱叙事正文，200-350字）
  
  ---TAGS---
  [IMPACT:none]
  [RESONANCE:neutral]`
  }
  
  export function buildRealEchoPrompt({ act, playerAction, scriptContext, resonance }) {
    const guide = {
      act1: `患者刚从昏迷中醒来，意识还没完全归位，像从很深的水里浮上来。
  场景：病房，白色灯光，消毒水气味。
  患者不知道你在她梦境里经历了什么。
  对话要真实，有停顿，有说了一半没说完的句子。
  患者的反应不一定是正向的，可能沉默，可能回避，可能说出意料之外的话。`,
  
      act2: `与陪同者对话（可能是父母、伴侣、朋友、同事）。
  陪同者不是平面的好人或坏人，他们有自己的局限和焦虑。
  你可以透露在梦境里看见的内容，可以用你理解到的东西去影响这段对话的走向。`,
  
      final: `你即将离开病房。无选项，纯叙事150-200字。
  描写你离开前最后看见或听见的那个画面。
  可总结，可升华，可点明主题`
    }
  
    const actLabel = {
      act1: '第一幕 · 与患者对话',
      act2: '第二幕 · 与陪同者对话',
      final: '第三幕 · 离开前的最后一眼'
    }
  
    return `【本局剧本背景】
  ${scriptContext}
  
  【当前最终共振深度】${resonance}%
  【当前幕次】${actLabel[act]}
  
  【本幕叙事要求】
  ${guide[act]}
  
  ${playerAction ? `【玩家上一轮选择】${playerAction}` : ''}
  
  禁止：
  × 患者因为玩家一句话立刻痊愈
  × 陪同者立刻幡然醒悟或道歉
  × 任何角色说出"谢谢你救了我"
  × 现实回响变成心理知识科普
  
  ${act === 'final'
      ? `---NARRATIVE---
  （最后一眼，纯叙事，无选项）`
      : `请严格按以下格式输出：
  
  ---NARRATIVE---
  （场景与对话叙事，350-500字）
  
  ---OPTIONS---
  A. （选项文字）[OPT_TYPE:accompany|action|inquiry]
  B. （选项文字）[OPT_TYPE:accompany|action|inquiry]
  C. （选项文字）[OPT_TYPE:accompany|action|inquiry]
  
  ---INNER---
  （内心活动1-3句，第一人称"我"，不分析选项）
  
  ---TAGS---
  [IMPACT:none]
  [RESONANCE:neutral]`}`
  }
  
  export function buildBreathPrompt({ result, keyChoices, scriptContext }) {
    return `【剧本摘要】${scriptContext.slice(0, 300)}
  结局：${result}，关键选择：${keyChoices}
  生成呼吸页面文字：对玩家说话，像朋友轻声说了一句话，温柔，不过度说教，80-150字。
  ---BREATH---
  （正文）`
  }
  
  export function buildPatientFuturePrompt({ result, scriptContext, resonance }) {
    return `【剧本摘要】${scriptContext.slice(0, 300)}
  结局：${result}，共振：${resonance}%
  生成患者后续状态（150-250字），语气平静，不渲染，不强行温暖，结尾留白。
  禁止：彻底康复、刻意悲剧、道德总结。
  ---PATIENT_FUTURE---
  （正文）`
  }
  
  export function parseScriptContext(rawContext) {
    // ✅ 优先从 PROFILE 块提取
    const profileMatch = rawContext.match(/---PROFILE---([\s\S]*?)---PROFILE_END---/i)
  
    if (profileMatch) {
      const block = profileMatch[1]
      const extractLine = (key) => {
        const match = block.match(new RegExp(`${key}[：:]([^\\n]+)`, 'i'))
        return match?.[1]?.trim() ?? ''
      }
      return {
        character:    extractLine('人物介绍'),   // ✅ 改了
        wound:        extractLine('背景介绍'),   // ✅ 改了
        imagery:      extractLine('心象映射'),
        socialIssue:  extractLine('社会议题'),
        mentalTheme:  extractLine('精神主题'),
        mainSentence: extractLine('主旨句'),
        rhythm:       '',
      }
    }
  
    // ✅ 兜底：旧格式解析
    const cleaned = rawContext
      .replace(/---TRACKING---[\s\S]*?---TRACKING_END---/i, '')
      .replace('[SCRIPT_READY]', '')
      .trim()
  
    const extract = (tag) => {
      const match = cleaned.match(
        new RegExp(`【[^】]*${tag}[^】]*】([\\s\\S]*?)(?=【|$)`, 'i')
      )
      return match?.[1]?.trim() ?? ''
    }
  
    return {
      character:    extract('塑造人物'),
      wound:        extract('现实病灶'),
      imagery:      extract('心象映射'),
      socialIssue:  extract('社会议题'),
      mentalTheme:  extract('精神主题'),
      mainSentence: extract('主旨句'),
      rhythm:       extract('叙事节拍'),
    }
  }
  
   

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
