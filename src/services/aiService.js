import { MujianSdk } from '@mujian/js-sdk'
import '@mujian/js-sdk/lite'
import axios from 'axios'
import db from '../db/gameDB'

const MUJIAN_CHAT_TIMEOUT_MS = 300000

class AIService {
  constructor() {
    this._mode = 'openapi'   // 当前生效的模式
    this._mujian = null      // SDK 实例（sdk模式用）
    this._openapi = null     // { baseURL, apiKey }（openapi模式用）
    this._initDone = false
    this._initPromise = null
  }

  // 读取用户选择的模式，默认 openapi
  async _getMode() {
    const saved = await db.settings.get('ai_mode')
    return saved?.value || 'custom'
  }

  _ensureInit() {
    if (this._initDone) return Promise.resolve()
    if (this._initPromise) return this._initPromise

    this._initPromise = new Promise(async (resolve) => {
      const mode = await this._getMode()

      if (mode === 'openapi') {
        try {
          await Promise.race([
            window.$mujian_lite.init(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('OpenAPI init timeout')), 15000)
            )
          ])
          this._openapi = window.$mujian_lite.openapi
          this._mode = 'openapi'
          console.log('[AIService] ✅ OpenAPI 模式初始化成功')
        } catch (e) {
          this._mode = 'custom'
          console.log('[AIService] OpenAPI 不可用，降级到自定义API模式:', e.message)
        }

      } else if (mode === 'sdk') {
        try {
          this._mujian = MujianSdk.getInstance()
          await Promise.race([
            this._mujian.init(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('SDK init timeout')), 15000)
            )
          ])
          this._mode = 'sdk'
          console.log('[AIService] ✅ SDK 模式初始化成功')
        } catch (e) {
          this._mode = 'custom'
          console.log('[AIService] SDK 不可用，降级到自定义API模式:', e.message)
        }

      } else {
        // custom 模式，不需要初始化SDK
        this._mode = 'custom'
        console.log('[AIService] 自定义 API 模式')
      }

      this._initDone = true
      resolve()
    })

    return this._initPromise
  }

  isReady() {
    return this._mode !== 'custom'
  }

  getCurrentMode() {
    return this._mode
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

    if (this._mode === 'openapi') {
      return this._callViaOpenAPI(messages, systemPrompt, { signal })
    }

    if (this._mode === 'sdk') {
      return this._callViaSdk(messages, systemPrompt, { signal })
    }

    // custom 模式
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
  // sendStream()：流式调用
  // ============================================================
  async sendStream({ messages, systemPrompt = '', onChunk, signal }) {
    await this._ensureInit()

    if (this._mode === 'openapi') {
      return this._streamViaOpenAPI({ messages, systemPrompt, onChunk, signal })
    }

    if (this._mode === 'sdk') {
      return this._streamViaSdk({ messages, systemPrompt, onChunk, signal })
    }

    return this._streamViaDirect({ messages, systemPrompt, onChunk, signal })
  }

  // ============================================================
  // OpenAPI 模式：非流式
  // ============================================================
  async _callViaOpenAPI(messages, systemPrompt = '', options = {}) {
    const { signal } = options
    const { baseURL, apiKey } = this._openapi

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-v3.2',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ]
      }),
      signal
    })

    if (!response.ok) throw new Error(`OpenAPI 请求失败: ${response.status}`)
    const data = await response.json()
    return data.choices[0].message.content
  }

  // ============================================================
  // OpenAPI 模式：流式
  // ============================================================
  async _streamViaOpenAPI({ messages, systemPrompt = '', onChunk, signal }) {
    const { baseURL, apiKey } = this._openapi

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-v3.2',
        stream: true,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ]
      }),
      signal
    })

    if (!response.ok) throw new Error(`OpenAPI 请求失败: ${response.status}`)
    await this._readSSEStream(response, onChunk)
  }

  // ============================================================
  // SDK 模式：非流式
  // ============================================================
  async _callViaSdk(messages, systemPrompt = '', options = {}) {
    const { signal } = options
    const userMsg = [...messages].reverse().find(m => m.role === 'user')
    const query = systemPrompt
      ? `${systemPrompt}\n\n${userMsg?.content || ''}`
      : userMsg?.content || ''

    const ctrl = new AbortController()
    if (signal) {
      if (signal.aborted) ctrl.abort()
      else signal.addEventListener('abort', () => ctrl.abort(), { once: true })
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
        settle(reject, new Error(`幕间 SDK 响应超时`))
      }, MUJIAN_CHAT_TIMEOUT_MS)

      this._mujian.ai.chat.complete(
        query,
        (res) => {
          fullContent = res.fullContent || fullContent
          if (res.isFinished) settle(resolve, fullContent)
        },
        ctrl.signal,
        { parseContent: true }
      ).catch(error => settle(reject, error))
    })
  }

  // ============================================================
  // SDK 模式：流式
  // ============================================================
  async _streamViaSdk({ messages, systemPrompt = '', onChunk, signal }) {
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
  // 自定义 API：流式
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

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`)
    await this._readSSEStream(response, onChunk)
  }

  // ============================================================
  // 公共：SSE 流读取（openapi 和 custom 共用）
  // ============================================================
  async _readSSEStream(response, onChunk) {
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
  // SDK 专属工具方法（仅 sdk 模式可用）
  // ============================================================
  async getProjectInfo() {
    await this._ensureInit()
    return this._mode === 'sdk' ? this._mujian.ai.chat.project.getInfo() : null
  }

  async getPersona() {
    await this._ensureInit()
    return this._mode === 'sdk' ? this._mujian.ai.chat.settings.persona.getActive() : null
  }

  async getHistory() {
    await this._ensureInit()
    return this._mode === 'sdk' ? this._mujian.ai.chat.message.getAll() : []
  }
}

export default new AIService()