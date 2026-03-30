import axios from 'axios'
import db from '../db/gameDB'
import { MujianSdk } from '@mujian/js-sdk'

const MUJIAN_CHAT_TIMEOUT_MS = 300000

class AIService {
  constructor() {
    this._mujian = null
    this._isMujian = false
    this._initDone = false
    this._initPromise = null // 🆕 新增：初始化状态锁
  }

  // 🆕 注意：这里去掉了方法前面的 async 关键字，改为返回一个 Promise
  _ensureInit() {
    if (this._initDone) return Promise.resolve()
    
    // 🆕 核心安全锁：如果已经正在初始化中了，直接返回正在进行的 Promise，防止并发重复执行
    if (this._initPromise) return this._initPromise

    this._initPromise = new Promise(async (resolve) => {
      const isInPlatform = window.self !== window.top

      if (!isInPlatform) {
        this._isMujian = false
        this._initDone = true
        console.log('[AIService] 独立运行 → 使用玩家API')
        resolve()
        return
      }

      try {
        this._mujian = MujianSdk.getInstance()
        await Promise.race([
          this._mujian.init(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SDK init timeout')), 150000)
          )
        ])
        this._isMujian = true
        console.log('[AIService] ✅ 幕间SDK初始化成功')
      } catch (e) {
        this._isMujian = false
        console.log('[AIService] SDK不可用:', e.message)
      }

      this._initDone = true
      resolve()
    })

    return this._initPromise
  }
  
  // ... 下面的代码 (isReady, getConfig, call 等等) 保持完全不变！...



  isReady() {
    return this._isMujian
  }

  // ============================================================
  // 读取本地配置
  // ============================================================
  async getConfig() {
    const endpoint = await db.settings.get('ai_endpoint')
    const apiKey   = await db.settings.get('ai_key')
    const model    = await db.settings.get('ai_model')
    return {
      endpoint: endpoint?.value || '',
      apiKey:   apiKey?.value   || '',
      model:    model?.value    || ''
    }
  }

  // ============================================================
  // call()：非流式调用
  // ============================================================
  async call(messages, systemPrompt = '', options = {}) {
    await this._ensureInit()
    const { signal } = options

    if (this._isMujian) {
      return this._callViaMujian(messages, systemPrompt, { signal })
    }

    const config = await this.getConfig()
    if (!config.endpoint || !config.apiKey || !config.model) {
      throw new Error('请先配置AI接入设置')
    }

    const base = config.endpoint.replace(/\/+$/, '')
    const response = await axios.post(
      `${base}/chat/completions`,
      {
        model: config.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        signal
      }
    )
    return response.data.choices[0].message.content
  }

  // ============================================================
  // generateReply()：快捷调用
  // ============================================================
  async generateReply(userMessage, systemPrompt, options = {}) {
    return await this.call(
      [{ role: 'user', content: userMessage }],
      systemPrompt,
      options
    )
  }

  // ============================================================
  // sendStream()：流式调用（每次创建独立的 controller）
  // ============================================================
  async sendStream({ messages, systemPrompt = '', onChunk, signal }) {
    await this._ensureInit()

    if (this._isMujian) {
      return this._streamViaMujian({ messages, systemPrompt, onChunk, signal })
    } else {
      return this._streamViaDirect({ messages, systemPrompt, onChunk, signal })
    }
  }

  // ============================================================
  // 幕间：非流式（独立调用，不依赖共享 controller）
  // ============================================================
  async _callViaMujian(messages, systemPrompt = '', options = {}) {
    const { signal } = options
    const userMsg = [...messages].reverse().find(m => m.role === 'user')
    const query = systemPrompt
      ? `${systemPrompt}\n\n${userMsg?.content || ''}`
      : userMsg?.content || ''

    // 每次创建独立的 controller，避免并发覆盖
    const ctrl = new AbortController()
    if (signal) {
      if (signal.aborted) {
        ctrl.abort()
      } else {
        signal.addEventListener('abort', () => ctrl.abort(), { once: true })
      }
    }

    return new Promise((resolve, reject) => {
      let fullContent = ''
      let settled = false
      const settle = (handler, value) => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        handler(value)
      }
      const timeoutId = setTimeout(() => {
        ctrl.abort()
        settle(reject, new Error(`幕间 AI 响应超时（>${MUJIAN_CHAT_TIMEOUT_MS / 1000}s）`))
      }, MUJIAN_CHAT_TIMEOUT_MS)

      this._mujian.ai.chat.complete(
        query,
        (res) => {
          fullContent = res.fullContent || fullContent
          if (res.isFinished) settle(resolve, fullContent)
        },
        ctrl.signal,
        { parseContent: true }
      ).catch(error => {
        settle(reject, error)
      })
    })
  }

  // ============================================================
  // 幕间：流式
  // ============================================================
  async _streamViaMujian({ messages, systemPrompt = '', onChunk, signal }) {
    const userMsg = [...messages].reverse().find(m => m.role === 'user')
    const query = systemPrompt
      ? `${systemPrompt}\n\n${userMsg?.content || ''}`
      : userMsg?.content || ''

    await this._mujian.ai.chat.complete(
      query,
      (res) => { onChunk(res.fullContent, res.isFinished) },
      signal,
      { parseContent: true }
    )
  }

  // ============================================================
  // 本地：流式（fetch + SSE）
  // ============================================================
  async _streamViaDirect({ messages, systemPrompt, onChunk, signal }) {
    const config = await this.getConfig()

    if (!config.endpoint || !config.apiKey || !config.model) {
      throw new Error('请先配置AI接入设置')
    }

    const base = config.endpoint.replace(/\/+$/, '')

    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        stream: true,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ]
      }),
      signal
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const reader  = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) { onChunk(fullContent, true); break }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') { onChunk(fullContent, true); return }
        try {
          const json  = JSON.parse(data)
          const delta = json.choices?.[0]?.delta?.content || ''
          if (delta) {
            fullContent += delta
            onChunk(fullContent, false)
          }
        } catch { /* 忽略解析错误 */ }
      }
    }
  }

  // ============================================================
  // 幕间专属工具方法
  // ============================================================
  async getProjectInfo() {
    await this._ensureInit()
    return this._isMujian ? this._mujian.ai.chat.project.getInfo() : null
  }

  async getPersona() {
    await this._ensureInit()
    return this._isMujian ? this._mujian.ai.chat.settings.persona.getActive() : null
  }

  async getHistory() {
    await this._ensureInit()
    return this._isMujian ? this._mujian.ai.chat.message.getAll() : []
  }
}

export default new AIService()
