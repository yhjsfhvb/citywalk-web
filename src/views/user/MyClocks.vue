<template>
  <section class="cw-card">
    <h2 class="cw-section-title">
      <span>我的打卡记录</span>
      <span class="cw-empty-tip">共 {{ list.length }} 条</span>
    </h2>

    <div v-loading="loading" class="clock-wrap">
      <div v-if="list.length" class="clock-list">
        <div v-for="item in list" :key="item._id" class="clock-item">
          <el-image v-if="item.image" :src="item.image" fit="cover" class="clock-img" :preview-src-list="[item.image]" preview-teleported />
          <div v-else class="clock-img clock-img--empty">
            <el-icon :size="20"><Picture /></el-icon>
            <span>未上传照片</span>
          </div>

          <div class="clock-text">
            <div class="clock-point">{{ item.point_name }}</div>
            <div class="clock-route">
              <el-icon><Location /></el-icon>
              <router-link :to="`/route/${item.route_id}`" class="link">
                {{ item.route_title }}
              </router-link>
            </div>
            <div class="clock-time cw-empty-tip">
              <el-icon><Clock /></el-icon>
              {{ formatTime(item.clock_date) }}
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-else text="还没有打卡记录，去路线详情页给点位打卡吧">
        <el-button type="primary" @click="$router.push('/')">去找一条路线</el-button>
      </EmptyState>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { clockMyList } from '@/api/interact'
import userStore from '@/store/user'
import EmptyState from '@/components/EmptyState.vue'
import { formatTime } from '@/utils/dict'

const list = ref([])
const loading = ref(false)

/** F015 我的打卡历史记录 */
async function load() {
  loading.value = true
  try {
    list.value = (await clockMyList({ token: userStore.state.token })) || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.clock-wrap {
  min-height: 160px;
}

.clock-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.clock-item {
  display: flex;
  gap: 12px;
  border: 1px solid var(--cw-border);
  border-radius: 10px;
  padding: 12px;
  background: #fffdfb;
}

.clock-img {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
}

.clock-img--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f5f2ee;
  color: var(--cw-text-light);
  font-size: 12px;
}

.clock-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.clock-point {
  font-size: 15px;
  font-weight: 600;
}

.clock-route {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--cw-text-light);
}

.clock-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.link {
  color: var(--el-color-primary);
}
</style>
