/**
 * 图片上传相关工具
 * 3.2 安全性需求：前端限制图片格式（jpg / png）与单张大小，云函数侧再校验一次
 */
// 图片以 base64 形式通过 HTTP 传给云函数，体积会膨胀约 1/3，
// 为不超过云函数 URL 化单次请求体上限，单张图片限制为 5MB（与云端 config.image.maxSize 一致）
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const ALLOW_IMAGE_EXT = ['jpg', 'jpeg', 'png']

/** 取文件扩展名（小写，不含点） */
export function getExt(filename) {
  const name = String(filename || '')
  const idx = name.lastIndexOf('.')
  return idx === -1 ? '' : name.slice(idx + 1).toLowerCase()
}

/** 图片校验：格式 + 大小，返回 { ok, msg } */
export function validateImage(file) {
  if (!file) return { ok: false, msg: '未选择图片' }
  const ext = getExt(file.name)
  if (ALLOW_IMAGE_EXT.indexOf(ext) === -1) {
    return { ok: false, msg: '仅支持 jpg、png 格式的图片' }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, msg: '单张图片大小不能超过 5MB' }
  }
  return { ok: true, msg: '' }
}

/** 文件 -> base64 字符串（带 data uri 前缀，便于本地预览） */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('图片读取失败，请重试'))
    reader.readAsDataURL(file)
  })
}
