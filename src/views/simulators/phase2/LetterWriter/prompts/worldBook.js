export const WORLD_BOOK = [
  {
    id: 'era_background',
    title: '时代背景',
    usedIn: ['buildGuestGenerationPrompt', 'buildLetterPolishPrompt'],
    content:
      `1980年代初，中国南方某个小城。
改革开放刚开了个头，人开始往城里走，往外走，往更远的地方走。
但通讯还是老样子，电话也没有很普及。
想跟人说话，只能写信。
一封信从这里寄出去，到湖南，到四川，到五湖四海，
快则三五天，慢则一两个月。等回信，要更久。`
  },
  {
    id: 'letter_weight',
    title: '信在这个年代的重量',
    usedIn: ['buildLetterPolishPrompt'],
    content:
      `在这个年代，一封信不是随便发出去的东西。
写信要花时间，要想清楚说什么。
寄信要钱，要贴邮票，要找到邮局。
收到信的人，会反复读，有时候还邀请识字的人读给自己听。
所以信里的每一句话，都是爱的体现。`
  },
  {
    id: 'letterwriter_role',
    title: '代笔先生的位置',
    usedIn: ['buildGuestDialoguePrompt'],
    content:
      `代笔先生坐在街边，替不会写字的人写信。
来找他的，大多数是进城的外地人，不识字的老人，
还有那些识字，但不知道怎么把心里的话写出来的人。
他不是老师，不是官员，不是什么大人物。
他只是会写字，愿意坐在这里，听人说话。`
  },
  {
    id: 'social_background',
    title: '来访者的社会背景',
    usedIn: ['buildGuestGenerationPrompt'],
    content:
      `这个年代，什么人都可能来找代笔先生。

有些人是进城打工的，有些人是本城居民，
有些人是路过的，有些人是鼓起勇气来了好几次才开口的。
他们来自各种地方，有各种各样的处境——
有人要寄喜事，有人要寄噩耗，有人要道歉，有人要催债，
有人自己也说不清楚到底想说什么，只知道心里憋着一口气。

每个人都不一样，来意也不一样。
不要把他们套进固定的模子里。
一个人的身份不等于他的性格，他的来意不等于他的心思。
他只是一个人，带着他自己的事，坐到了桌子对面。`
  },
  {
    id: 'language_rules',
    title: '语言时代规范',
    usedIn: ['buildGuestGenerationPrompt', 'buildGuestDialoguePrompt',
             'buildLetterPolishPrompt', 'buildReviewPrompt', 'buildFarewellPrompt'],
    content:
      `禁止出现的词汇和概念：
手机、网络、微信、快递、外卖、高铁、互联网、
打工人、内卷、躺平、emo、任何英文缩写。

应该出现的词汇：

日常生活：
单位（最核心的社会组织，几乎每个人都属于某个单位）
介绍信（外出、出差、住宿需要单位开具）
凭票购买、粮票、布票、肉票
供销社、合作社
收音机、广播

农村背景：
公社、大队、生产队、队长

工人背景：
工厂、车间、班组、师傅、学徒、工分
厂里、车间主任

历史背景：
知青（大量知青刚返城，这个群体仍然普遍存在）
户口（城乡二元结构，进城务工者的身份困境）
革委会（已撤销，但年纪大的人口头上可能还会用）

通讯邮寄：
邮局、邮票、挂号信、平信、汇款单

称呼习惯：
同志（正式场合或对陌生人）
师傅（对陌生人或工人阶层，最常用）
老乡（对来自同一地区的人）
对长辈：大爷、大娘、叔、婶`
  }
]

export function buildWorldBookInjection(ids) {
  // 不传参数 → 返回全部条目
  if (!ids || ids.length === 0) {
    return WORLD_BOOK
      .map(entry => `【${entry.title}】\n${entry.content}`)
      .join('\n\n')
  }

  // 开发环境：检查无效 ID
  if (process.env.NODE_ENV !== 'production') {
    const validIds = new Set(WORLD_BOOK.map(e => e.id))
    ids.forEach(id => {
      if (!validIds.has(id)) {
        console.warn(`[WorldBook] 未找到条目："${id}"，请检查 ID 是否拼写正确`)
      }
    })
  }

  const requestedIds = new Set(ids)
  return WORLD_BOOK
    .filter(entry => requestedIds.has(entry.id))
    .map(entry => `【${entry.title}】\n${entry.content}`)
    .join('\n\n')
}
