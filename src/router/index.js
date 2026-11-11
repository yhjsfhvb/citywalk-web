/**
 * 路由表与权限守卫（F003 登录权限拦截）
 * 采用 hash 模式，打包产物可直接放在任意静态目录下访问，无需服务端 rewrite 配置。
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import userStore from '@/store/user'

const routes = [
  /* ------------------------------ 前台 ------------------------------ */
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/route/:id',
    name: 'RouteDetail',
    component: () => import('@/views/RouteDetail.vue'),
    meta: { title: '路线详情' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/publish',
    name: 'RoutePublish',
    component: () => import('@/views/publish/RoutePublish.vue'),
    meta: { title: '发布路线', requiresAuth: true }
  },
  {
    path: '/ai-assistant',
    name: 'AiAssistant',
    component: () => import('@/views/AiAssistant.vue'),
    meta: { title: 'AI 助手', requiresAuth: true }
  },

  /* --------------------------- 个人中心（受保护） --------------------------- */
  {
    path: '/user',
    component: () => import('@/views/user/UserLayout.vue'),
    redirect: '/user/routes',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人信息' }
      },
      {
        path: 'routes',
        name: 'MyRoutes',
        component: () => import('@/views/user/MyRoutes.vue'),
        meta: { title: '我的发布' }
      },
      {
        path: 'collects',
        name: 'MyCollects',
        component: () => import('@/views/user/MyCollects.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'clocks',
        name: 'MyClocks',
        component: () => import('@/views/user/MyClocks.vue'),
        meta: { title: '我的打卡' }
      }
    ]
  },

  /* ------------------------- 后台管理（管理员专属） ------------------------- */
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { title: '管理员登录', hideHeader: true }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true, hideHeader: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'routes',
        name: 'AdminRouteAudit',
        component: () => import('@/views/admin/RouteAudit.vue'),
        meta: { title: '路线审核' }
      },
      {
        path: 'comments',
        name: 'AdminCommentAudit',
        component: () => import('@/views/admin/CommentAudit.vue'),
        meta: { title: '评论审核' }
      },
      {
        path: 'tags',
        name: 'AdminTagManage',
        component: () => import('@/views/admin/TagManage.vue'),
        meta: { title: '标签管理' }
      },
      {
        path: 'users',
        name: 'AdminUserManage',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理' }
      }
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  // 每次跳转前先与本地存储对齐，避免多标签页 / 手动清理存储后状态不同步
  userStore.syncFromStorage()

  // F003：受保护页面（个人中心、发布路线）未登录时强制跳转登录页
  if (to.meta.requiresAuth && !userStore.isLogin()) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  // 3.2：普通用户不能访问管理员后台
  if (to.meta.requiresAdmin && !userStore.isAdmin()) {
    return { name: 'AdminLogin', query: { redirect: to.fullPath } }
  }

  // 已登录用户不必再访问登录 / 注册页，直接回到目标页
  if (to.name === 'Login' && userStore.isLogin()) {
    return { path: String(to.query.redirect || '/') }
  }
  if (to.name === 'AdminLogin' && userStore.isAdmin()) {
    return { path: String(to.query.redirect || '/admin') }
  }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 城市漫步` : '城市漫步 · 路线分享平台'
})

export default router
