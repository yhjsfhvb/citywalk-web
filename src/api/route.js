/**
 * 路线浏览与创作发布接口（F006-F011 / F019-F022）
 */
import { request } from './request'

/** F006 列表 / F007 标签筛选 / F008 关键词搜索 / F009 排序 */
export function routeList(params) {
  return request('routeList', params)
}

/** F010 详情 / F011 点位列表 / F018 已审核评论（一次请求聚合返回） */
export function routeDetail(params) {
  return request('routeDetail', params, { authType: 'user', silent: true })
}

/** F019-F021 新建路线并提交审核 */
export function routeCreate(params) {
  return request('routeCreate', params, { authType: 'user' })
}

/** F022 编辑路线并重新提交审核 */
export function routeUpdate(params) {
  return request('routeUpdate', params, { authType: 'user' })
}

/** F022 删除自己的路线 */
export function routeRemove(params) {
  return request('routeRemove', params, { authType: 'user' })
}

/** F022 我发布的路线列表 */
export function routeMyList(params) {
  return request('routeMyList', params, { authType: 'user' })
}

/** F022 我发布的路线详情（编辑回显） */
export function routeMyDetail(params) {
  return request('routeMyDetail', params, { authType: 'user' })
}
