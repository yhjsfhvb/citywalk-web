<template>
  <div>
    <!-- F030 平台活跃数据统计 -->
    <div v-loading="loading" class="stat-grid">
      <div v-for="card in cards" :key="card.key" class="stat-card">
        <div class="stat-icon">
          <el-icon :size="20"><component :is="card.icon" /></el-icon>
        </div>
        <div>
          <div class="stat-value">{{ stats[card.key] || 0 }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- F029 路线热度统计 -->
    <section class="cw-card rank-card">
      <h2 class="cw-section-title">
        <span>热门路线排行</span>
        <span class="cw-empty-tip">按「浏览量 + 收藏量」综合排序</span>
      </h2>

      <el-table v-loading="rankLoading" :data="rank" stripe empty-text="暂无已审核通过的路线数据">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="路线" min-width="240">
          <template #default="{ row }">
            <div class="rank-cell">
              <el-image :src="row.cover" fit="cover" class="thumb" />
              <span class="cw-title-ellipsis">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="user_nickname" label="创作者" width="150" />
        <el-table-column prop="view_count" label="浏览量" width="100" sortable />
        <el-table-column prop="collect_count" label="收藏量" width="100" sortable />
        <el-table-column prop="like_count" label="点赞量" width="100" sortable />
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  Bell,
  ChatDotRound,
  Collection,
  Document,
  Location,
  UserFilled
} from '@element-plus/icons-vue'
import { adminRouteHotRank, adminStats } from '@/api/admin'
import userStore from '@/store/user'

const cards = [
  { key: 'userCount', label: '注册用户', icon: UserFilled },
  { key: 'routeCount', label: '路线总数', icon: Document },
  { key: 'pendingRouteCount', label: '待审核路线', icon: Bell },
  { key: 'pendingCommentCount', label: '待审核评论', icon: ChatDotRound },
  { key: 'collectCount', label: '收藏总数', icon: Collection },
  { key: 'clockCount', label: '打卡总数', icon: Location }
]

const stats = ref({})
const rank = ref([])
const loading = ref(false)
const rankLoading = ref(false)

async function load() {
  const token = userStore.state.adminToken
  loading.value = true
  rankLoading.value = true
  try {
    stats.value = (await adminStats({ token })) || {}
  } catch (e) {
    stats.value = {}
  } finally {
    loading.value = false
  }
  try {
    rank.value = (await adminRouteHotRank({ token, limit: 10 })) || []
  } catch (e) {
    rank.value = []
  } finally {
    rankLoading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.stat-card {
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: var(--cw-card-radius);
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--cw-text-light);
}

.rank-card {
  margin-top: 16px;
}

.rank-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.thumb {
  width: 64px;
  height: 42px;
  border-radius: 6px;
  flex-shrink: 0;
}
</style>
