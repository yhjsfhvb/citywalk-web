<template>
  <div class="point-editor">
    <div v-for="(point, index) in list" :key="point._key || index" class="point-item">
      <div class="point-head">
        <span class="point-index">点位 {{ index + 1 }}</span>
        <span class="point-ops">
          <el-button text size="small" :disabled="index === 0" @click="move(index, -1)">上移</el-button>
          <el-button text size="small" :disabled="index === list.length - 1" @click="move(index, 1)">
            下移
          </el-button>
          <el-button text size="small" type="danger" @click="remove(index)">删除</el-button>
        </span>
      </div>

      <el-form label-width="88px" label-position="left" class="point-form">
        <el-form-item label="点位名称" required>
          <el-input
            v-model="point.name"
            maxlength="30"
            show-word-limit
            placeholder="例如：天主教圣心堂旧址"
          />
        </el-form-item>
        <el-form-item label="文字介绍" required>
          <el-input
            v-model="point.intro"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
            placeholder="介绍这个点位的历史背景、看点与停留建议"
          />
        </el-form-item>
        <el-form-item label="实拍图片" required>
          <ImageUploader v-model="point.image" width="180" height="120" text="上传点位图片" />
        </el-form-item>
      </el-form>
    </div>

    <el-button type="primary" plain :icon="Plus" @click="add">添加点位</el-button>
    <p class="cw-empty-tip">
      F020：可自由新增、删除、上下调动点位；至少需要 1 个点位，列表顺序即实际行走顺序。
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ImageUploader from './ImageUploader.vue'

// F020 动态点位编辑：双向绑定父级点位数组
const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const list = computed(() => props.modelValue || [])

function update(next) {
  emit('update:modelValue', next)
}

function add() {
  update(
    list.value.concat([{ _key: `p_${Date.now()}_${list.value.length}`, name: '', intro: '', image: '' }])
  )
}

function remove(index) {
  const next = list.value.slice()
  next.splice(index, 1)
  update(next)
}

function move(index, delta) {
  const target = index + delta
  if (target < 0 || target >= list.value.length) return
  const next = list.value.slice()
  const temp = next[index]
  next[index] = next[target]
  next[target] = temp
  update(next)
}
</script>

<style scoped>
.point-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.point-item {
  border: 1px solid var(--cw-border);
  border-radius: 10px;
  padding: 14px 16px 4px;
  background: #fffdfb;
}

.point-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.point-index {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.point-form {
  margin-bottom: -10px;
}
</style>
