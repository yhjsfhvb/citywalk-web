<template>
  <div class="cw-page">
    <div class="cw-container user-layout">
      <aside class="side">
        <div class="side-user">
          <el-avatar :size="54" :src="userInfo.avatar || ''">{{ initial }}</el-avatar>
          <div class="side-name cw-title-ellipsis">{{ userInfo.nickname || '漫步者' }}</div>
          <div class="side-account">@{{ userInfo.username }}</div>
        </div>

        <el-menu :default-active="active" router class="side-menu">
          <el-menu-item index="/user/routes">
            <el-icon><Folder /></el-icon>
            <span>我的发布</span>
          </el-menu-item>
          <el-menu-item index="/user/collects">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item index="/user/clocks">
            <el-icon><Location /></el-icon>
            <span>我的打卡</span>
          </el-menu-item>
          <el-menu-item index="/user/profile">
            <el-icon><Setting /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
        </el-menu>

        <el-button class="publish-btn" type="primary" :icon="Plus" @click="$router.push('/publish')">
          发布新路线
        </el-button>
      </aside>

      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import userStore from '@/store/user'
import { nicknameInitial } from '@/utils/dict'

const route = useRoute()

const userInfo = computed(() => userStore.state.userInfo || {})
const initial = computed(() => nicknameInitial(userInfo.value.nickname))
const active = computed(() => route.path)
</script>

<style scoped>
.user-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.side {
  width: 230px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: var(--cw-card-radius);
  padding: 18px 0 14px;
}

.side-user {
  text-align: center;
  padding: 0 16px 16px;
  border-bottom: 1px solid var(--cw-border);
}

.side-name {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 600;
}

.side-account {
  font-size: 12px;
  color: var(--cw-text-light);
}

.side-menu {
  border-right: none;
}

.publish-btn {
  width: calc(100% - 32px);
  margin: 12px 16px 0;
}

.main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 900px) {
  .user-layout {
    flex-direction: column;
  }
  .side {
    width: 100%;
  }
}
</style>
