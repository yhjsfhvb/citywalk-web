<template>
  <div class="tag-filter">
    <span class="label">
      <el-icon><PriceTag /></el-icon>
      主题标签
    </span>

    <el-check-tag
      v-for="tag in tags"
      :key="tag._id"
      :checked="selected.includes(tag._id)"
      class="tag-item"
      @change="toggle(tag._id)"
    >
      {{ tag.name }}
    </el-check-tag>

    <span v-if="!tags.length" class="cw-empty-tip">暂无可用标签</span>

    <el-button v-if="selected.length" text size="small" type="primary" @click="clear">清除筛选</el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// F007 主题标签筛选：支持同时选中多个标签（命中任一标签的路线即展示）
const props = defineProps({
  tags: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const selected = computed(() => props.modelValue || [])

function toggle(id) {
  const list = selected.value.slice()
  const index = list.indexOf(id)
  if (index > -1) list.splice(index, 1)
  else list.push(id)
  emit('update:modelValue', list)
}

function clear() {
  emit('update:modelValue', [])
}
</script>

<style scoped>
.tag-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: var(--cw-card-radius);
  padding: 12px 16px;
}

.label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--cw-text-light);
  margin-right: 4px;
}

.tag-item {
  font-size: 13px;
}
</style>
