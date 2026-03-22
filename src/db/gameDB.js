import Dexie from 'dexie'

const db = new Dexie('FugueNoZeroDB')

db.version(1).stores({
  saves: '++id, scriptId, saveName, saveTime',
  settings: 'key, value',
  storyLog: '++id, scriptId, day, content'
})

// 升级到版本2，加上 savedAt 字段
db.version(2).stores({
  saves: '++id, scriptId, saveName, saveTime, savedAt',
  settings: 'key, value',
  storyLog: '++id, scriptId, day, content'
})

export default db
