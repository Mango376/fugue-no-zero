// ============================================================
// mujianService.js
// 负责：初始化幕间SDK，并判断当前是否运行在幕间环境中
// ============================================================

import { MujianSdk } from '@mujian/js-sdk'

let _instance = null
let _initialized = false
let _isMujianEnv = false

/**
 * 尝试初始化幕间SDK
 * 成功 → 说明在幕间平台运行
 * 失败 → 说明在本地运行，静默降级
 */
export async function initMujian() {
  if (_initialized) return _isMujianEnv

  try {
    _instance = MujianSdk.getInstance()
    await _instance.init()
    _isMujianEnv = true
    console.log('[幕间SDK] 初始化成功，使用幕间模式')
  } catch (e) {
    _isMujianEnv = false
    console.log('[幕间SDK] 未检测到幕间环境，使用本地API模式')
  }

  _initialized = true
  return _isMujianEnv
}

/**
 * 获取SDK实例（仅幕间环境有效）
 */
export function getMujianInstance() {
  return _instance
}

/**
 * 当前是否在幕间环境
 */
export function isMujianEnv() {
  return _isMujianEnv
}
