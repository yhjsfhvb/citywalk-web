/**
 * 主题标签接口（F007 前台筛选 / F019 发布选择 / F027 后台管理）
 */
import { request } from './request'

/** F007 / F019 前台标签列表 */
export function tagList() {
  return request('tagList', {})
}

/** F027 新增标签 */
export function adminTagAdd(params) {
  return request('adminTagAdd', params, { authType: 'admin' })
}

/** F027 编辑标签 */
export function adminTagUpdate(params) {
  return request('adminTagUpdate', params, { authType: 'admin' })
}

/** F027 删除标签 */
export function adminTagDelete(params) {
  return request('adminTagDelete', params, { authType: 'admin' })
}
