<template>
  <div class="cw-page auth-page">
    <div class="auth-card">
      <h2>注册新账号</h2>
      <p class="sub">账号长度 3 ~ 20 个字符，密码不少于 6 位</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            size="large"
            placeholder="请输入账号"
            :prefix-icon="User"
            clearable
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            size="large"
            type="password"
            show-password
            placeholder="请输入密码（不少于 6 位）"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            size="large"
            type="password"
            show-password
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-button type="primary" size="large" class="submit" :loading="loading" @click="submit">
          注 册
        </el-button>
      </el-form>

      <div class="bottom">
        已有账号？
        <router-link to="/login" class="link">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { userRegister } from '@/api/user'

const router = useRouter()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({ username: '', password: '', confirmPassword: '' })

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度需为 3 ~ 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

function submit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      // F001 注册成功后跳转登录页
      await userRegister({
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword
      })
      ElMessage.success('注册成功，请使用新账号登录')
      router.replace('/login')
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
</style>
