/**
 * 业务字典与格式化工具
 * 枚举取值与云函数 common/util.js 中的 STATUS / USER_STATUS 严格保持一致
 */

/** 路线 / 评论审核状态 */
export const AUDIT_STATUS = {
  0: { label: '待审核', type: 'warning' },
  1: { label: '审核通过', type: 'success' },
  2: { label: '审核驳回', type: 'danger' }
}

/** 难度等级 */
export const DIFFICULTY = {
  1: { label: '轻松', type: 'success' },
  2: { label: '适中', type: 'warning' },
  3: { label: '挑战', type: 'danger' }
}

/** 用户账号状态 */
export const USER_STATUS = {
  0: { label: '禁用', type: 'danger' },
  1: { label: '正常', type: 'success' }
}

/** 排序方式（F009） */
export const SORT_OPTIONS = [
  { value: 'hot', label: '热门' },
  { value: 'new', label: '最新发布' },
  { value: 'collect', label: '最多收藏' }
]

export function statusInfo(status) {
  return AUDIT_STATUS[Number(status)] || { label: '未知', type: 'info' }
}

export function difficultyInfo(level) {
  return DIFFICULTY[Number(level)] || { label: '未知', type: 'info' }
}

export function userStatusInfo(status) {
  return USER_STATUS[Number(status)] || { label: '未知', type: 'info' }
}

/** 时间戳 -> yyyy-MM-dd HH:mm */
export function formatTime(timestamp) {
  if (!timestamp) return '-'
  const d = new Date(Number(timestamp))
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

/** 时间戳 -> yyyy-MM-dd */
export function formatDate(timestamp) {
  if (!timestamp) return '-'
  const d = new Date(Number(timestamp))
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 分钟 -> 「1 小时 20 分钟」 */
export function formatDuration(minutes) {
  const m = Number(minutes) || 0
  if (m < 60) return `${m} 分钟`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h} 小时 ${rest} 分钟` : `${h} 小时`
}

/** 昵称首字（无头像时作为占位） */
export function nicknameInitial(nickname) {
  return String(nickname || '游').trim().charAt(0).toUpperCase()
}
