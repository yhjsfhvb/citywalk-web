/**
 * 本地登录态存储（F002 业务规则：登录状态本地持久保存）
 * 前台用户与后台管理员使用两套独立的 token，避免在同一浏览器中互相顶号。
 */
export const TOKEN_KEY = 'citywalk_token'
export const USER_INFO_KEY = 'citywalk_user_info'
export const ADMIN_TOKEN_KEY = 'citywalk_admin_token'
export const ADMIN_INFO_KEY = 'citywalk_admin_info'

function readItem(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch (e) {
    return ''
  }
}

function writeItem(key, value) {
  try {
    if (value === null || value === undefined || value === '') localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch (e) {
    /* 隐私模式下 localStorage 不可用时降级为内存态，刷新后丢失登录状态 */
  }
}

function readJSON(key) {
  const raw = readItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

/* ---------------------------- 前台用户 ---------------------------- */
export function getToken() {
  return readItem(TOKEN_KEY)
}
export function setToken(token) {
  writeItem(TOKEN_KEY, token)
}
export function getUserInfo() {
  return readJSON(USER_INFO_KEY)
}
export function setUserInfo(info) {
  writeItem(USER_INFO_KEY, info ? JSON.stringify(info) : '')
}
export function clearUser() {
  writeItem(TOKEN_KEY, '')
  writeItem(USER_INFO_KEY, '')
}

/* ---------------------------- 后台管理员 ---------------------------- */
export function getAdminToken() {
  return readItem(ADMIN_TOKEN_KEY)
}
export function setAdminToken(token) {
  writeItem(ADMIN_TOKEN_KEY, token)
}
export function getAdminInfo() {
  return readJSON(ADMIN_INFO_KEY)
}
export function setAdminInfo(info) {
  writeItem(ADMIN_INFO_KEY, info ? JSON.stringify(info) : '')
}
export function clearAdmin() {
  writeItem(ADMIN_TOKEN_KEY, '')
  writeItem(ADMIN_INFO_KEY, '')
}
