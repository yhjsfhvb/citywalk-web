<template>
  <el-container class="admin-layout">
    <el-aside width="210px" class="aside">
      <div class="aside-brand">
        <span class="logo-mark">漫</span>
        <span>后台管理</span>
      </div>

      <el-menu :default-active="active" router class="aside-menu">
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        <el-menu-item index="/admin/routes">
          <el-icon><DocumentChecked /></el-icon>
          <span>路线审核</span>
        </el-menu-item>
        <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论审核</span>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <el-icon><PriceTag /></el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-title">{{ title }}</div>
        <div class="header-right">
          <span class="admin-name">
            <el-avatar :size="28" :src="adminInfo.avatar || ''">
              {{ nicknameInitial(adminInfo.nickname) }}
            </el-avatar>
            {{ adminInfo.nickname || '平台管理员' }}
          </span>
          <el-button text type="primary" @click="$router.push('/')">前台首页</el-button>
          <el-button text type="danger" @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { nicknameInitial } from '@/utils/dict'

const route = useRoute()
const router = useRouter()

const active = computed(() => route.path)
const title = computed(() => route.meta.title || '后台管理')
const adminInfo = computed(() => userStore.state.adminInfo || {})

async function logout() {
  try {
    await ElMessageBox.confirm('确定要退出后台管理吗？', '退出登录', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (e) {
    return
  }
  userStore.adminLogout()
  ElMessage.success('已退出后台')
  router.replace('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.aside {
  background: #2f2a26;
  color: #fff;
}

.aside-brand {
  height: 62px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.aside-menu {
  border-right: none;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: rgba(255, 255, 255, 0.78);
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);
  --el-menu-active-color: #fff;
}

.aside-menu :deep(.el-menu-item.is-active) {
  background: var(--el-color-primary);
  color: #fff;
}

.header {
  height: 62px;
  background: #fff;
  border-bottom: 1px solid var(--cw-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--cw-text-light);
  margin-right: 8px;
}

.main {
  background: var(--cw-bg);
  padding: 20px;
}
</style>
