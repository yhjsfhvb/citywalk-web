/**
 * 用户账号模块接口（F001 / F002 / F005）
 */
import { request } from './request'

/** F001 用户注册 */
export function userRegister(params) {
  return request('userRegister', params, { authType: 'user' })
}

/** F002 用户登录 */
export function userLogin(params) {
  return request('userLogin', params, { authType: 'user' })
}

/** 登录后刷新当前用户信息（F003 登录态校验） */
export function userInfo(params) {
  return request('userInfo', params, { authType: 'user' })
}

/** F005 修改昵称 / 头像 */
export function userUpdateInfo(params) {
  return request('userUpdateInfo', params, { authType: 'user' })
}

/** F005 修改登录密码 */
export function userUpdatePassword(params) {
  return request('userUpdatePassword', params, { authType: 'user', silent: false })
}
