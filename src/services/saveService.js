import db from '../db/gameDB'

class SaveService {

    // 保存进度
    async save(scriptId, gameState) {
        try {
          const existing = await db.saves
            .where('scriptId')
            .equals(scriptId)
            .first()
      
          if (existing) {
            await db.saves.update(existing.id, {
              scriptId,
              saveName: scriptId,
              savedAt: Date.now(),
              saveTime: new Date().toISOString(),
              gameState
            })
          } else {
            await db.saves.add({
              scriptId,
              saveName: scriptId,
              savedAt: Date.now(),
              saveTime: new Date().toISOString(),
              gameState
            })
          }
        } catch (err) {
          console.error('saveService.save 失败:', err)
          throw err
        }      
    }

    // 读取存档
    async load(scriptId) {
        const save = await db.saves
            .where('scriptId')
            .equals(scriptId)
            .first()
        return save ? save.gameState : null
    }

    // 删除存档
    async deleteSave(scriptId) {
        await db.saves
            .where('scriptId')
            .equals(scriptId)
            .delete()
    }

    // 获取所有存档（用于主菜单显示进度）
    async getAllSaves() {
        return await db.saves.toArray()
    }

    // 导出存档为文件
    async exportSave() {
        const saves = await db.saves.toArray()
        const settings = await db.settings.toArray()
        const blob = new Blob(
            [JSON.stringify({ saves, settings })],
            { type: 'application/json' }
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '零号赋格_存档.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    // 导入存档文件
    async importSave(file) {
        const text = await file.text()
        const data = JSON.parse(text)
        await db.saves.bulkPut(data.saves)
        await db.settings.bulkPut(data.settings)
    }
}

export default new SaveService()
