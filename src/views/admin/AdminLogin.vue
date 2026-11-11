<template>
  <div class="admin-login">
    <div class="login-card">
      <div class="brand">
        <span class="logo-mark">漫</span>
        <div>
          <h2>城市漫步 · 后台管理</h2>
          <p>路线审核 / 评论审核 / 标签与用户管理 / 数据统计</p>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="管理员账号" prop="username">
          <el-input
            v-model="form.username"
            size="large"
            placeholder="请输入管理员账号"
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
          登录后台
        </el-button>
      </el-form>

      <div class="bottom">
        <router-link to="/" class="link">返回前台首页</router-link>
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
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function submit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      // F024 管理员登录（云端校验 role 必须为 admin）
      await userStore.adminLogin(form.username.trim(), form.password)
      ElMessage.success('登录成功')
      router.replace(String(route.query.redirect || '/admin'))
    } catch (e) {
      // 错误提示已由 request 统一处理
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2f2a26 0%, #4a3f36 55%, #6b5140 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 14px;
  padding: 30px 32px 24px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.logo-mark {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand h2 {
  margin: 0 0 4px;
  font-size: 18px;
}

.brand p {
  margin: 0;
  font-size: 12px;
  color: var(--cw-text-light);
}

.submit {
  width: 100%;
}

.bottom {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
}

.link {
  color: var(--el-color-primary);
}
</style>
