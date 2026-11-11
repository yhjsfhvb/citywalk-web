/**
 * AI 助手接口（DeepSeek 大模型，云函数代理转发，前端不接触 API Key）
 */
import { request } from './request'

/**
 * 与 AI 助手「小漫」对话
 * @param {{ token: string, message: string, history?: Array }} params
 * @returns {Promise<{ reply: string }>}
 */
export function aiChat(params) {
  // AI 生成较慢，单独设置更长超时（request 默认 20 秒）
  return request('aiChat', params, { authType: 'user', silent: true })
}
