<template>
  <div class="app-wrapper">
    <!-- 后台管理页面使用独立布局（见 views/admin/AdminLayout.vue），隐藏前台头部 -->
    <AppHeader v-if="!route.meta.hideHeader" />

    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>

    <footer v-if="!route.meta.hideHeader" class="app-footer">
      <div class="cw-container">
        城市漫步 · 路线分享平台 &nbsp;|&nbsp; 基于 Vue3 + Element-Plus + uniCloud
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
</script>
