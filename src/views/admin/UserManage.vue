<template>
  <section class="cw-card">
    <div class="filter-bar">
      <h2 class="cw-section-title no-margin">平台用户管理</h2>
      <el-input
        v-model="keyword"
        placeholder="按账号或昵称搜索"
        clearable
        style="width: 240px"
        @keyup.enter="onSearch"
        @clear="onSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <el-table v-loading="loading" :data="list" stripe empty-text="没有符合条件的用户">
      <el-table-column label="用户" min-width="200">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="32" :src="row.avatar || ''">
              {{ nicknameInitial(row.nickname) }}
            </el-avatar>
            <div>
              <div class="nickname">{{ row.nickname }}</div>
              <div class="username">@{{ row.username }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="角色" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="row.role === 'admin' ? 'warning' : 'info'" effect="plain">
            {{ row.role === 'admin' ? '平台管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="账号状态" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="userStatusInfo(row.status).type" effect="light">
            {{ userStatusInfo(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="注册时间" width="170">
        <template #default="{ row }">{{ formatTime(row.create_date) }}</template>
      </el-table-column>

      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.role !== 'admin'"
            text
            size="small"
            :type="Number(row.status) === 1 ? 'danger' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ Number(row.status) === 1 ? '禁用账号' : '恢复正常' }}
          </el-button>
          <span v-else class="cw-text-muted">-</span>
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
import { adminSetUserStatus, adminUserList } from '@/api/admin'
import userStore from '@/store/user'
import { formatTime, nicknameInitial, userStatusInfo } from '@/utils/dict'

const keyword = ref('')
const query = reactive({ page: 1, pageSize: 10 })

const list = ref([])
const total = ref(0)
const loading = ref(false)

const token = () => userStore.state.adminToken

async function load() {
  loading.value = true
  try {
    const data = await adminUserList({
      token: token(),
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

function onSearch() {
  query.page = 1
  load()
}

function onPageChange(page) {
  query.page = page
  load()
}

/** F028 禁用 / 恢复账号（被禁用账号无法登录前台） */
async function toggleStatus(row) {
  const nextStatus = Number(row.status) === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(
      nextStatus === 0
        ? `禁用后「${row.nickname}」将无法登录前台系统，确定禁用吗？`
        : `确定恢复「${row.nickname}」的账号吗？`,
      nextStatus === 0 ? '禁用账号' : '恢复账号',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
  } catch (e) {
    return
  }
  try {
    await adminSetUserStatus({ token: token(), userId: row._id, status: nextStatus })
    ElMessage.success(nextStatus === 0 ? '账号已禁用' : '账号已恢复正常')
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

.no-margin {
  margin: 0;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nickname {
  font-size: 14px;
  font-weight: 600;
}

.username {
  font-size: 12px;
  color: var(--cw-text-light);
}
</style>
