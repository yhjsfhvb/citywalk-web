<template>
  <section class="cw-card">
    <div class="filter-bar">
      <el-radio-group v-model="status" @change="onFilterChange">
        <el-radio-button value="0">待审核</el-radio-button>
        <el-radio-button value="1">审核通过</el-radio-button>
        <el-radio-button value="2">审核驳回</el-radio-button>
        <el-radio-button value="all">全部</el-radio-button>
      </el-radio-group>
    </div>

    <el-table v-loading="loading" :data="list" stripe empty-text="没有符合条件的评论">
      <el-table-column label="评论内容" min-width="300">
        <template #default="{ row }">
          <div class="content">{{ row.content }}</div>
        </template>
      </el-table-column>

      <el-table-column label="评论人" width="130" prop="user_nickname" />

      <el-table-column label="所属路线" min-width="180">
        <template #default="{ row }">
          <router-link class="link cw-title-ellipsis" :to="`/route/${row.route_id}`" target="_blank">
            {{ row.route_title || '（路线已删除）' }}
          </router-link>
        </template>
      </el-table-column>

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

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <template v-if="Number(row.status) === 0">
            <el-button text size="small" type="success" @click="audit(row, 'pass')">通过</el-button>
            <el-button text size="small" type="danger" @click="audit(row, 'reject')">驳回</el-button>
          </template>
          <span v-else class="cw-text-muted">已处理</span>
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
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminCommentAudit, adminCommentAuditList } from '@/api/admin'
import userStore from '@/store/user'
import { formatTime, statusInfo } from '@/utils/dict'

const status = ref('0')
const query = reactive({ page: 1, pageSize: 10 })

const list = ref([])
const total = ref(0)
const loading = ref(false)

const token = () => userStore.state.adminToken

async function load() {
  loading.value = true
  try {
    const data = await adminCommentAuditList({
      token: token(),
      status: status.value,
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

/** F026 评论审核：通过则对外展示，驳回则隐藏 */
async function audit(row, action) {
  const isPass = action === 'pass'
  try {
    await ElMessageBox.confirm(
      isPass ? '通过后该评论将在路线详情页对外展示。' : '驳回后该评论不会在路线详情页展示。',
      isPass ? '通过评论' : '驳回评论',
      { confirmButtonText: isPass ? '确认通过' : '确认驳回', cancelButtonText: '取消' }
    )
  } catch (e) {
    return
  }
  try {
    await adminCommentAudit({ token: token(), commentId: row._id, action })
    ElMessage.success(isPass ? '评论已通过' : '评论已驳回')
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

.content {
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.link {
  display: block;
  color: var(--el-color-primary);
  max-width: 100%;
}
</style>
