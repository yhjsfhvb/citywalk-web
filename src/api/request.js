/**
 * ============================================================================
 *  axios 统一封装（3.5 可维护性需求：axios 接口统一封装）
 * ----------------------------------------------------------------------------
 *  后端为 uniCloud 云对象 URL 化的 HTTP 接口，约定：
 *    1. 请求：POST {VITE_UNICLOUD_URL}/{方法名}
 *       Content-Type 固定为 text/plain;charset=UTF-8，Body 为 JSON 字符串。
 *       这样浏览器不会发送 CORS 预检请求（OPTIONS），本地调试与部署都不必额外配置跨域。
 *       token 不放在请求头，而是随业务参数一起放在 Body 里。
 *    2. 响应：{ code: 0, msg, data }，code === 0 视为成功并直接返回 data；
 *       否则抛出异常，并统一提示 msg。
 * ============================================================================
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { clearUser, clearAdmin } from '@/utils/storage'

const BASE_URL = String(import.meta.env.VITE_UNICLOUD_URL || '').replace(/\/+$/, '')

const CONFIG_ERROR =
  '云函数地址未配置：请在 citywalk-web/.env 中填写 VITE_UNICLOUD_URL，然后重新执行 npm run build'

const http = axios.create({ timeout: 20000 })

/** 登录态失效时跳转页面（使用 hash 路由，直接改 hash 即可） */
function jump(target) {
  const hash = `#${target}`
  if (window.location.hash !== hash) window.location.hash = hash
}

/**
 * 统一处理登录态失效
 * @param {number} code 业务错误码（401 未登录/登录过期，403 无权限）
 * @param {string} authType 'user' 前台用户 | 'admin' 后台管理员
 */
function handleAuthError(code, authType) {
  if (code === 401) {
    if (authType === 'admin') {
      clearAdmin()
      jump('/admin/login')
    } else {
      clearUser()
      jump('/login')
    }
    return true
  }
  return false
}

/**
 * 发起云函数调用
 * @param {string} method   云对象方法名（对应 URL 化的最后一段路径）
 * @param {object} params   业务参数（含 token）
 * @param {object} [options] { authType: 'user'|'admin', silent: 是否静默不弹提示 }
 * @returns {Promise<any>}  成功时返回响应体中的 data
 */
export function request(method, params = {}, options = {}) {
  const { authType = 'user', silent = false } = options

  if (!BASE_URL) {
    if (!silent) ElMessage.error(CONFIG_ERROR)
    return Promise.reject(new Error(CONFIG_ERROR))
  }

  const body = params && typeof params === 'object' ? params : {}

  return http
    .post(`${BASE_URL}/${method}`, JSON.stringify(body), {
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    })
    .then((res) => {
      const payload = res.data
      if (!payload || typeof payload !== 'object') {
        throw new Error('服务返回数据格式异常')
      }
      if (Number(payload.code) === 0) return payload.data
      const err = new Error(payload.msg || '请求失败')
      err.bizCode = Number(payload.code)
      throw err
    })
    .catch((err) => {
      // 网络层异常（云函数未部署、URL 配置错误、超时等）
      if (err.bizCode === undefined) {
        if (err.code === 'ECONNABORTED') err.message = '请求超时，请检查网络后重试'
        else if (!err.message || err.message === 'Network Error') {
          err.message = '无法连接云函数，请检查 VITE_UNICLOUD_URL 配置与网络'
        }
      }
      const redirected = handleAuthError(err.bizCode, authType)
      if (!silent && !redirected) ElMessage.error(err.message || '操作失败')
      throw err
    })
}

export default request
