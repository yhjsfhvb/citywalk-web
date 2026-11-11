<template>
  <section class="cw-card">
    <h2 class="cw-section-title">
      <span>我发布的路线</span>
      <el-button type="primary" size="small" :icon="Plus" @click="$router.push('/publish')">
        发布新路线
      </el-button>
    </h2>

    <el-table v-loading="loading" :data="list" stripe empty-text="还没有发布过路线">
      <el-table-column label="路线" min-width="240">
        <template #default="{ row }">
          <div class="route-cell">
            <el-image :src="row.cover" fit="cover" class="thumb" />
            <div class="route-cell-text">
              <div class="route-title cw-title-ellipsis">{{ row.title }}</div>
              <div class="cw-empty-tip">
                {{ formatDuration(row.duration) }} · {{ difficultyInfo(row.difficulty).label }} ·
                {{ row.point_count }} 个点位
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusInfo(row.status).type" size="small" effect="light">
            {{ statusInfo(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="驳回理由" min-width="160">
        <template #default="{ row }">
          <span v-if="Number(row.status) === 2" class="reject">{{ row.reject_reason || '未填写' }}</span>
          <span v-else class="cw-text-muted">-</span>
        </template>
      </el-table-column>

      <el-table-column label="数据" width="150">
        <template #default="{ row }">
          <span class="cw-text-muted">浏览 {{ row.view_count }} · 收藏 {{ row.collect_count }}</span>
        </template>
      </el-table-column>

      <el-table-column label="提交时间" width="150">
        <template #default="{ row }">{{ formatTime(row.update_date || row.create_date) }}</template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-if="Number(row.status) === 1" text size="small" type="primary" @click="goDetail(row)">
            查看
          </el-button>
          <el-button v-else text size="small" type="primary" @click="edit(row)">编辑</el-button>
          <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { routeMyList, routeRemove } from '@/api/route'
import userStore from '@/store/user'
import { difficultyInfo, formatDuration, formatTime, statusInfo } from '@/utils/dict'

const router = useRouter()

const list = ref([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    list.value = (await routeMyList({ token: userStore.state.token })) || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

function goDetail(row) {
  router.push(`/route/${row._id}`)
}

/** F022 编辑待审核 / 驳回的路线 */
function edit(row) {
  router.push({ path: '/publish', query: { edit: row._id } })
}

/** F022 删除路线（云端级联删除点位与互动数据） */
async function remove(row) {
  try {
    await ElMessageBox.confirm(
      `删除后该路线的全部点位、收藏、点赞、打卡与评论都会被一并清除，确定删除「${row.title}」吗？`,
      '删除路线',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch (e) {
    return
  }
  try {
    await routeRemove({ token: userStore.state.token, routeId: row._id })
    ElMessage.success('路线已删除')
    load()
  } catch (e) {
    // 错误提示已由 request 统一处理
  }
}

onMounted(load)
</script>

<style scoped>
.route-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thumb {
  width: 72px;
  height: 52px;
  border-radius: 6px;
  flex-shrink: 0;
}

.route-cell-text {
  min-width: 0;
}

.route-title {
  font-size: 14px;
  font-weight: 600;
}

.reject {
  font-size: 13px;
  color: var(--el-color-danger);
}
</style>
