export const SENSE_IDS = ['vision', 'hearing', 'touch', 'taste', 'smell']

export const SENSE_IDS_TEXT = SENSE_IDS.join(' / ')

export const JSON_OBJECT_ONLY_RULE = '必须只输出一个 JSON 对象，不要代码块，不要解释，不要额外文本。'

export const JSON_ARRAY_ONLY_RULE = '必须只输出 JSON 数组，不要代码块，不要解释。'

export const GENERATION_JSON_HARD_RULES = `1. 只输出一个 JSON 对象。
2. 不要输出 markdown、代码块、解释、注释。
3. 字段必须完整，字符串必须自然、具体、有人味。`

export const MAPPING_FIELD_RULES = `所有感官映射只能使用这五个 id：
${SENSE_IDS_TEXT}
不允许感官映射到自己。
mappingLevels 的 key 格式必须是 "source:target"，值必须是 1 到 4 的整数。`

export const GENERATION_MAPPING_HARD_RULES = `4. 所有感官映射只能使用这五个 id：
${SENSE_IDS_TEXT}
5. 不允许感官映射到自己。
6. mappingLevels 的 key 格式必须是 "source:target"，值必须是 1 到 4 的整数。`

export const TRACKING_SHEET_MAPPING_RULES = `originalMappings 和 unresolvedMappings 填写规范：
- 正常的感官填空数组 []
- 异常的感官填字符串数组，元素是接收到错误信号的感官 id
  例如视觉接收了味觉信号：vision: ["taste"]
- 可选值：${SENSE_IDS_TEXT}
- 感官不能映射到自身
- mappingLevels 格式："source:target": 等级数字(1-4)
  例如：{ "vision:taste": 1, "touch:hearing": 2 }`
