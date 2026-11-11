<template>
  <div>
    <section class="cw-card">
      <div class="filter-bar">
        <el-radio-group v-model="status" @change="onFilterChange">
          <el-radio-button value="0">待审核</el-radio-button>
          <el-radio-button value="1">审核通过</el-radio-button>
          <el-radio-button value="2">审核驳回</el-radio-button>
          <el-radio-button value="all">全部</el-radio-button>
        </el-radio-group>

        <el-input
          v-model="keyword"
          placeholder="按路线标题搜索"
          clearable
          style="width: 220px"
          @keyup.enter="onFilterChange"
          @clear="onFilterChange"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>

      <el-table v-loading="loading" :data="list" stripe empty-text="没有符合条件的路线">
        <el-table-column label="路线" min-width="240">
          <template #default="{ row }">
            <div class="route-cell">
              <el-image :src="row.cover" fit="cover" class="thumb" />
              <div class="route-cell-text">
                <div class="cw-title-ellipsis title">{{ row.title }}</div>
                <div class="cw-empty-tip">
                  {{ row.point_count }} 个点位 · 步行 {{ row.duration }} 分钟 ·
                  {{ difficultyInfo(row.difficulty).label }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="user_nickname" label="创作者" width="130" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusInfo(row.status).type" size="small" effect="light">
              {{ statusInfo(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="提交时间" width="150">
          <template #default="{ row }">{{ formatTime(row.create_date) }}</template>
        </el-table-column>

        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" type="primary" @click="openDetail(row)">查看详情</el-button>
            <template v-if="Number(row.status) === 0">
              <el-button text size="small" type="success" @click="audit(row, 'pass')">通过</el-button>
              <el-button text size="small" type="danger" @click="audit(row, 'reject')">驳回</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > query.pageSize"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="query.pageSize"
        :current-page="query.page"
        @current-change="onPageChange"
      />
    </section>

    <!-- F025 审核详情：查看路线基础信息与全部点位后再决定 -->
    <el-drawer v-model="drawerVisible" title="路线审核详情" size="560px">
      <div v-loading="detailLoading" class="detail-body">
        <template v-if="detail">
          <h3 class="detail-title">{{ detail.route.title }}</h3>
          <div class="tags">
            <el-tag v-for="tag in detail.tags" :key="tag._id" size="small" effect="plain">
              {{ tag.name }}
            </el-tag>
          </div>

          <el-image :src="detail.route.cover" fit="cover" class="detail-cover" :preview-src-list="[detail.route.cover]" preview-teleported />

          <el-descriptions :column="2" size="small" border class="detail-desc">
            <el-descriptions-item label="创作者">{{ detail.route.user_nickname }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ formatTime(detail.route.create_date) }}</el-descriptions-item>
            <el-descriptions-item label="步行时长">{{ formatDuration(detail.route.duration) }}</el-descriptions-item>
            <el-descriptions-item label="难度等级">{{ difficultyInfo(detail.route.difficulty).label }}</el-descriptions-item>
            <el-descriptions-item label="点位数量">{{ detail.points.length }} 个</el-descriptions-item>
            <el-descriptions-item label="当前状态">{{ statusInfo(detail.route.status).label }}</el-descriptions-item>
          </el-descriptions>

          <p class="intro">{{ detail.route.intro }}</p>

          <h4 class="points-title">途经点位（按行走顺序）</h4>
          <div class="point-list">
            <div v-for="(point, index) in detail.points" :key="point._id" class="point-item">
              <div class="point-index">{{ index + 1 }}</div>
              <div class="point-text">
                <div class="point-name">{{ point.name }}</div>
                <div class="point-intro">{{ point.intro }}</div>
              </div>
              <el-image :src="point.image" fit="cover" class="point-img" :preview-src-list="[point.image]" preview-teleported />
            </div>
          </div>
        </template>

        <div v-if="detail && Number(detail.route.status) === 0" class="drawer-actions">
          <el-button type="success" @click="audit(detail.route, 'pass')">审核通过</el-button>
          <el-button type="danger" plain @click="audit(detail.route, 'reject')">驳回</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  adminRouteAudit,
  adminRouteAuditDetail,
  adminRouteAuditList
} from '@/api/admin'
import userStore from '@/store/user'
import {
  difficultyInfo,
  formatDuration,
  formatTime,
  statusInfo
} from '@/utils/dict'

const status = ref('0')
const keyword = ref('')
const query = reactive({ page: 1, pageSize: 10 })

const list = ref([])
const total = ref(0)
const loading = ref(false)

const drawerVisible = ref(false)
const detailLoading = ref(false)
const detail = ref(null)

const token = () => userStore.state.adminToken

async function load() {
  loading.value = true
  try {
    const data = await adminRouteAuditList({
      token: token(),
      status: status.value,
      keyword: keyword.value,
      page: query.page,
      pageSize: query.pageSize
    })
    list.value = (data && data.list) || []
    total.value = (data && data.total) || 0
  } catch (e) {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  query.page = 1
  load()
}

function onPageChange(page) {
  query.page = page
  load()
}

async function openDetail(row) {
  drawerVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await adminRouteAuditDetail({ token: token(), routeId: row._id })
  } catch (e) {
    // 错误提示已由 request 统一处理
  } finally {
    detailLoading.value = false
  }
}

/** F025 审核通过 / 驳回 */
async function audit(row, action) {
  let reason = ''
  if (action === 'reject') {
    try {
      const res = await ElMessageBox.prompt(
        '请填写驳回理由，创作者可在「我的发布」中看到该理由并据此修改',
        '驳回路线',
        {
          confirmButtonText: '确认驳回',
          cancelButtonText: '取消',
          inputPlaceholder: '例如：部分点位图片与介绍不匹配，请补充后重新提交',
          inputValidator: (value) => (value && value.trim() ? true : '驳回理由不能为空')
        }
      )
      reason = String(res.value || '').trim()
    } catch (e) {
      return
    }
  } else {
    try {
      await ElMessageBox.confirm(`确定通过路线「${row.title}」吗？通过后将在前台首页对外展示。`, '审核通过', {
        confirmButtonText: '确认通过',
        cancelButtonText: '取消',
        type: 'success'
      })
    } catch (e) {
      return
    }
  }

  try {
    await adminRouteAudit({ token: token(), routeId: row._id, action, reason })
    ElMessage.success(action === 'pass' ? '路线已通过审核' : '路线已驳回')
    drawerVisible.value = false
    load()
  } catch (e) {
    // 错误提示已由 request 统一处理
  }
}

onMounted(load)
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.route-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thumb {
  width: 72px;
  height: 50px;
  border-radius: 6px;
  flex-shrink: 0;
}

.route-cell-text {
  min-width: 0;
}

.title {
  font-size: 14px;
  font-weight: 600;
}

/* 抽屉内容 */
.detail-body {
  min-height: 200px;
}

.detail-title {
  margin: 0 0 10px;
  font-size: 18px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-cover {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.detail-desc {
  margin-bottom: 14px;
}

.intro {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.75;
  color: #5a534d;
}

.points-title {
  margin: 0 0 10px;
  font-size: 15px;
}

.point-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-item {
  display: flex;
  gap: 12px;
  border: 1px solid var(--cw-border);
  border-radius: 10px;
  padding: 12px;
}

.point-index {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.point-text {
  flex: 1;
  min-width: 0;
}

.point-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.point-intro {
  font-size: 13px;
  line-height: 1.7;
  color: var(--cw-text-light);
}

.point-img {
  width: 92px;
  height: 70px;
  border-radius: 6px;
  flex-shrink: 0;
}

.drawer-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>
