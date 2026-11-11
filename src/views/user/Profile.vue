<template>
  <div>
    <!-- F005 修改昵称与头像 -->
    <section class="cw-card">
      <h2 class="cw-section-title">基本信息</h2>

      <el-form label-width="90px" label-position="left" class="profile-form">
        <el-form-item label="账号">
          <el-input :model-value="userInfo.username" disabled />
        </el-form-item>
        <el-form-item label="昵称" required>
          <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <ImageUploader v-model="profileForm.avatar" width="110" height="110" text="上传头像" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="savingProfile" @click="saveProfile">保存修改</el-button>
        </el-form-item>
      </el-form>
    </section>

    <!-- F005 修改登录密码 -->
    <section class="cw-card">
      <h2 class="cw-section-title">修改密码</h2>

      <el-form
        ref="pwdFormRef"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="90px"
        label-position="left"
        class="profile-form"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="不少于 6 位" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="savingPassword" @click="savePassword">
            确认修改
          </el-button>
        </el-form-item>
      </el-form>
    </section>

    <!-- F004 退出登录 -->
    <section class="cw-card">
      <h2 class="cw-section-title">账号操作</h2>
      <el-button type="danger" plain @click="logout">退出登录</el-button>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userUpdatePassword } from '@/api/user'
import userStore from '@/store/user'
import ImageUploader from '@/components/ImageUploader.vue'

const router = useRouter()

const userInfo = computed(() => userStore.state.userInfo || {})

const profileForm = reactive({ nickname: '', avatar: '' })
const savingProfile = ref(false)

// 登录态就绪或变化时回填表单
watch(
  userInfo,
  (info) => {
    profileForm.nickname = info.nickname || ''
    profileForm.avatar = info.avatar || ''
  },
  { immediate: true }
)

async function saveProfile() {
  const nickname = String(profileForm.nickname || '').trim()
  if (!nickname) {
    ElMessage.warning('昵称不能为空')
    return
  }
  savingProfile.value = true
  try {
    await userStore.updateProfile({ nickname, avatar: profileForm.avatar })
    ElMessage.success('个人信息已更新')
  } catch (e) {
    // 错误提示已由 request 统一处理
  } finally {
    savingProfile.value = false
  }
}

const pwdFormRef = ref(null)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const savingPassword = ref(false)

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== pwdForm.newPassword) callback(new Error('两次输入的密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

function savePassword() {
  pwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    savingPassword.value = true
    try {
      await userUpdatePassword({
        token: userStore.state.token,
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      })
      ElMessage.success('密码修改成功，请牢记新密码')
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
      pwdFormRef.value.resetFields()
    } catch (e) {
      // 错误提示已由 request 统一处理
    } finally {
      savingPassword.value = false
    }
  })
}

async function logout() {
  try {
    await ElMessageBox.confirm('确定要退出当前账号吗？', '退出登录', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (e) {
    return
  }
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.profile-form {
  max-width: 460px;
}
</style>
