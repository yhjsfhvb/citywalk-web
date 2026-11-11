/**
 * 登录用户互动接口（F012-F018）
 */
import { request } from './request'

/** F012 收藏 / 取消收藏 */
export function collectToggle(params) {
  return request('collectToggle', params, { authType: 'user' })
}

/** F023 我的收藏列表 */
export function collectMyList(params) {
  return request('collectMyList', params, { authType: 'user' })
}

/** F016 点赞 / 取消点赞 */
export function likeToggle(params) {
  return request('likeToggle', params, { authType: 'user' })
}

/** F013 点位打卡 / F014 打卡照片 */
export function clockAdd(params) {
  return request('clockAdd', params, { authType: 'user' })
}

/** F015 我的打卡历史 */
export function clockMyList(params) {
  return request('clockMyList', params, { authType: 'user' })
}

/** F017 提交评论（提交后进入待审核） */
export function commentAdd(params) {
  return request('commentAdd', params, { authType: 'user' })
}
