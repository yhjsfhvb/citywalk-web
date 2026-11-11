<template>
  <header class="app-header">
    <div class="cw-container header-inner">
      <router-link to="/" class="logo">
        <span class="logo-mark">漫</span>
        <span class="logo-text">城市漫步</span>
      </router-link>

      <nav class="nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/ai-assistant" class="nav-link">AI 助手</router-link>
        <router-link to="/publish" class="nav-link">发布路线</router-link>
        <router-link v-if="isLogin" to="/user/routes" class="nav-link">个人中心</router-link>
        <router-link to="/admin" class="nav-link">后台管理</router-link>
      </nav>

      <div class="right">
        <template v-if="isLogin">
          <el-dropdown trigger="click" @command="onCommand">
            <span class="user-chip">
              <el-avatar :size="30" :src="userInfo.avatar || ''">{{ initial }}</el-avatar>
              <span class="nick cw-title-ellipsis">{{ userInfo.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="routes">我的发布</el-dropdown-item>
                <el-dropdown-item command="collects">我的收藏</el-dropdown-item>
                <el-dropdown-item command="clocks">我的打卡</el-dropdown-item>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button text type="primary" @click="go('/login')">登录</el-button>
          <el-button type="primary" round @click="go('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { nicknameInitial } from '@/utils/dict'

const router = useRouter()

const isLogin = computed(() => !!userStore.state.token)
const userInfo = computed(() => userStore.state.userInfo || {})
const initial = computed(() => nicknameInitial(userInfo.value.nickname))

function go(path) {
  router.push(path)
}

async function onCommand(command) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出当前账号吗？', '退出登录', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch (e) {
      return
    }
    userStore.logout() // F004 清除本地登录状态
    ElMessage.success('已退出登录')
    router.push('/')
    return
  }
  router.push(`/user/${command}`)
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid var(--cw-border);
  box-shadow: 0 1px 6px rgba(47, 42, 38, 0.04);
}

.header-inner {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 15px;
  color: var(--cw-text);
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nav-link.router-link-exact-active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  cursor: pointer;
  outline: none;
  transition: background 0.2s;
}

.user-chip:hover {
  background: var(--el-color-primary-light-9);
}

.nick {
  max-width: 110px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .nav {
    gap: 0;
  }
  .nav-link {
    padding: 6px 8px;
    font-size: 14px;
  }
  .nick {
    display: none;
  }
}
</style>
