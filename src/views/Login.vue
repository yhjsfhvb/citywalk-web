<template>
  <div class="cw-page auth-page">
    <div class="auth-card">
      <h2>登录城市漫步</h2>
      <p class="sub">登录后可以收藏路线、点位打卡、发表评论，并发布自己的漫步路线</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            size="large"
            placeholder="请输入账号"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            size="large"
            type="password"
            show-password
            placeholder="请输入密码"
            :prefix-icon="Lock"
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-button type="primary" size="large" class="submit" :loading="loading" @click="submit">
          登 录
        </el-button>
      </el-form>

      <div class="bottom">
        还没有账号？
        <router-link to="/register" class="link">立即注册</router-link>
        <span class="divider">|</span>
        <router-link to="/admin/login" class="link">管理员入口</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import userStore from '@/store/user'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({ username: '', password: '' })

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function submit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login(form.username.trim(), form.password)
      ElMessage.success('登录成功')
      router.replace(String(route.query.redirect || '/'))
    } catch (e) {
      // 错误提示已由 request 统一处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 60px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: 14px;
  padding: 30px 32px 26px;
  box-shadow: 0 12px 32px rgba(47, 42, 38, 0.07);
}

.auth-card h2 {
  margin: 0 0 6px;
  font-size: 22px;
}

.sub {
  margin: 0 0 22px;
  font-size: 13px;
  color: var(--cw-text-light);
  line-height: 1.6;
}

.submit {
  width: 100%;
  margin-top: 4px;
}

.bottom {
  margin-top: 16px;
  font-size: 13px;
  color: var(--cw-text-light);
  text-align: center;
}

.link {
  color: var(--el-color-primary);
}

.divider {
  margin: 0 8px;
  color: var(--cw-border);
}
</style>
