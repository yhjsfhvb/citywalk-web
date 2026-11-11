<template>
  <section class="cw-card">
    <h2 class="cw-section-title">
      <span>我的收藏</span>
      <span class="cw-empty-tip">共 {{ list.length }} 条</span>
    </h2>

    <div v-loading="loading" class="collect-wrap">
      <div v-if="list.length" class="cw-grid">
        <div v-for="item in list" :key="item.collect_id" class="collect-item">
          <RouteCard :data="item" />
          <div class="collect-foot">
            <span class="cw-empty-tip">收藏于 {{ formatTime(item.collect_date) }}</span>
            <el-button text type="danger" size="small" :icon="Delete" @click="cancel(item)">
              取消收藏
            </el-button>
          </div>
        </div>
      </div>
      <EmptyState v-else text="还没有收藏任何路线，去首页逛逛吧">
        <el-button type="primary" @click="$router.push('/')">去首页看看</el-button>
      </EmptyState>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { collectMyList, collectToggle } from '@/api/interact'
import userStore from '@/store/user'
import RouteCard from '@/components/RouteCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { formatTime } from '@/utils/dict'

const list = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    list.value = (await collectMyList({ token: userStore.state.token })) || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

/** F023 直接取消收藏 */
async function cancel(item) {
  try {
    await collectToggle({ token: userStore.state.token, routeId: item._id })
    ElMessage.success('已取消收藏')
    list.value = list.value.filter((c) => c._id !== item._id)
  } catch (e) {
    // 错误提示已由 request 统一处理
  }
}

onMounted(load)
</script>

<style scoped>
.collect-wrap {
  min-height: 160px;
}

.collect-item {
  display: flex;
  flex-direction: column;
}

.collect-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 0;
}
</style>
