/**
 * 轻量登录态管理（3.5 可维护性需求）
 * 使用 reactive 对象 + localStorage 持久化，避免为一个演示项目引入额外的状态库。
 * 前台用户与后台管理员各持一套 token，互不影响。
 */
import { reactive } from 'vue'
import * as userApi from '@/api/user'
import * as adminApi from '@/api/admin'
import {
  getToken,
  setToken,
  getUserInfo,
  setUserInfo,
  clearUser,
  getAdminToken,
  setAdminToken,
  getAdminInfo,
  setAdminInfo,
  clearAdmin
} from '@/utils/storage'

const state = reactive({
  token: '',
  userInfo: null,
  adminToken: '',
  adminInfo: null
})

/** 从本地存储同步登录态（路由守卫、应用启动时调用） */
function syncFromStorage() {
  state.token = getToken()
  state.userInfo = getUserInfo()
  state.adminToken = getAdminToken()
  state.adminInfo = getAdminInfo()
}

/* ---------------------------- 前台用户（F002 / F004） ---------------------------- */

/** F002 登录 */
async function login(username, password) {
  const data = await userApi.userLogin({ username, password })
  setToken(data.token)
  setUserInfo(data.userInfo)
  syncFromStorage()
  return data
}

/** 拉取最新的个人信息，验证 token 是否仍然有效 */
async function refreshUserInfo() {
  if (!state.token) return null
  try {
    const info = await userApi.userInfo({ token: state.token })
    setUserInfo(info)
    syncFromStorage()
    return info
  } catch (e) {
    // 401 时 request 已自动清理本地登录态
    syncFromStorage()
    return null
  }
}

/** F005 更新昵称 / 头像后刷新本地缓存 */
async function updateProfile(payload) {
  await userApi.userUpdateInfo(Object.assign({ token: state.token }, payload))
  return refreshUserInfo()
}

/** F004 退出登录 */
function logout() {
  clearUser()
  syncFromStorage()
}

/* ---------------------------- 后台管理员（F024） ---------------------------- */

async function adminLogin(username, password) {
  const data = await adminApi.adminLogin({ username, password })
  setAdminToken(data.token)
  setAdminInfo(data.userInfo)
  syncFromStorage()
  return data
}

function adminLogout() {
  clearAdmin()
  syncFromStorage()
}

function isLogin() {
  return !!state.token
}

function isAdmin() {
  return !!state.adminToken
}

export const userStore = {
  state,
  syncFromStorage,
  login,
  logout,
  refreshUserInfo,
  updateProfile,
  adminLogin,
  adminLogout,
  isLogin,
  isAdmin
}

export default userStore
