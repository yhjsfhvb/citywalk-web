<template>
  <div class="image-uploader">
    <el-upload
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="doUpload"
      accept="image/jpeg,image/png"
      :disabled="loading"
      class="uploader"
    >
      <div v-loading="loading" class="box" :style="boxStyle" :class="{ 'is-empty': !modelValue }">
        <img v-if="modelValue" :src="modelValue" alt="已上传图片" />
        <div v-else class="placeholder">
          <el-icon :size="22"><Plus /></el-icon>
          <span>{{ text }}</span>
        </div>
      </div>
    </el-upload>
    <div class="tip">{{ tip }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import userStore from '@/store/user'
import { uploadImage } from '@/api/upload'
import { fileToBase64, getExt, validateImage } from '@/utils/upload'

// 统一的图片上传组件：F005 头像 / F014 打卡照片 / F019 路线封面 / F020 点位图片
const props = defineProps({
  modelValue: { type: String, default: '' },
  text: { type: String, default: '上传图片' },
  tip: { type: String, default: '仅支持 jpg / png，单张不超过 5MB' },
  width: { type: [String, Number], default: 120 },
  height: { type: [String, Number], default: 120 },
  // 允许外部传入 token（默认取当前登录用户 token）
  token: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'success'])

const loading = ref(false)

const boxStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

/** 前端基础校验（3.2 安全性需求：限制格式与大小） */
function beforeUpload(file) {
  const result = validateImage(file)
  if (!result.ok) {
    ElMessage.error(result.msg)
    return false
  }
  return true
}

/** 自定义上传：转为 base64 交给云函数写入云存储 */
async function doUpload(options) {
  const file = options && options.file
  if (!file) return
  const token = props.token || userStore.state.token
  if (!token) {
    ElMessage.warning('请先登录后再上传图片')
    return
  }

  loading.value = true
  try {
    const base64 = await fileToBase64(file)
    const data = await uploadImage({ token, base64, ext: getExt(file.name) })
    emit('update:modelValue', data.url)
    emit('success', data)
    ElMessage.success('图片上传成功')
  } catch (e) {
    // 具体错误信息已由 request 统一提示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.image-uploader {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
}

.uploader :deep(.el-upload) {
  display: block;
}

.box {
  border: 1px dashed #d8d2cb;
  border-radius: 10px;
  background: #faf9f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.box:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--cw-text-light);
  font-size: 12px;
  text-align: center;
  padding: 6px;
}

.tip {
  font-size: 12px;
  color: var(--cw-text-light);
}
</style>
