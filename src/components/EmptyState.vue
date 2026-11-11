<template>
  <div class="empty-state">
    <el-empty :description="text || '暂无数据'">
      <slot />
    </el-empty>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' }
})
</script>

<style scoped>
.empty-state {
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: var(--cw-card-radius);
  padding: 12px 0;
}
</style>
