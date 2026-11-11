/**
 * 图片上传接口
 * F005 头像 / F014 打卡照片 / F019 路线封面 / F020 点位图片 全部走此接口，
 * 图片以 base64 形式传给云函数，由云函数写入 uniCloud 云存储并返回可访问 url。
 */
import { request } from './request'

export function uploadImage(params) {
  return request('uploadImage', params, { authType: 'user' })
}

/** 部署辅助：幂等初始化管理员与默认标签（详见《部署说明.md》） */
export function systemInit() {
  return request('systemInit', {})
}
