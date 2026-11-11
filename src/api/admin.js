/**
 * 后台管理接口（F024-F030）
 */
import { request } from './request'

/** F024 管理员登录 */
export function adminLogin(params) {
  return request('adminLogin', params, { authType: 'admin' })
}

/** F030 平台活跃数据统计 */
export function adminStats(params) {
  return request('adminStats', params, { authType: 'admin' })
}

/** F029 路线热度排行 */
export function adminRouteHotRank(params) {
  return request('adminRouteHotRank', params, { authType: 'admin' })
}

/** F025 路线审核列表 */
export function adminRouteAuditList(params) {
  return request('adminRouteAuditList', params, { authType: 'admin' })
}

/** F025 路线审核详情 */
export function adminRouteAuditDetail(params) {
  return request('adminRouteAuditDetail', params, { authType: 'admin' })
}

/** F025 路线审核通过 / 驳回 */
export function adminRouteAudit(params) {
  return request('adminRouteAudit', params, { authType: 'admin' })
}

/** F026 评论审核列表 */
export function adminCommentAuditList(params) {
  return request('adminCommentAuditList', params, { authType: 'admin' })
}

/** F026 评论审核通过 / 驳回 */
export function adminCommentAudit(params) {
  return request('adminCommentAudit', params, { authType: 'admin' })
}

/** F028 平台用户列表 */
export function adminUserList(params) {
  return request('adminUserList', params, { authType: 'admin' })
}

/** F028 禁用 / 恢复用户账号 */
export function adminSetUserStatus(params) {
  return request('adminSetUserStatus', params, { authType: 'admin' })
}
