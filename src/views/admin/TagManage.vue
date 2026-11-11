<template>
  <section class="cw-card">
    <h2 class="cw-section-title">
      <span>主题标签管理</span>
      <el-button type="primary" size="small" :icon="Plus" @click="openAdd">新增标签</el-button>
    </h2>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="前台用户发布路线时只能从下表中选择标签，不能自定义输入；已被路线引用的标签无法删除。"
      class="tip-alert"
    />

    <el-table v-loading="loading" :data="list" stripe empty-text="暂无标签">
      <el-table-column type="index" label="#" width="70" />
      <el-table-column prop="name" label="标签名称" min-width="180" />
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">{{ formatTime(row.create_date) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button text size="small" type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button text size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑标签' : '新增标签'" width="420px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" maxlength="10" show-word-limit placeholder="例如：历史建筑" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">确定</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminTagAdd, adminTagDelete, adminTagUpdate, tagList } from '@/api/tag'
import userStore from '@/store/user'
import { formatTime } from '@/utils/dict'

const list = ref([])
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref(null)
const form = reactive({ tagId: '', name: '' })

const rules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { max: 10, message: '标签名称不能超过 10 个字符', trigger: 'blur' }
  ]
}

const token = () => userStore.state.adminToken

async function load() {
  loading.value = true
  try {
    list.value = (await tagList()) || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  isEdit.value = false
  form.tagId = ''
  form.name = ''
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  form.tagId = row._id
  form.name = row.name
  dialogVisible.value = true
}

function save() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      // F027 新增 / 编辑标签
      if (isEdit.value) {
        await adminTagUpdate({ token: token(), tagId: form.tagId, name: form.name.trim() })
        ElMessage.success('标签已更新')
      } else {
        await adminTagAdd({ token: token(), name: form.name.trim() })
        ElMessage.success('标签已新增')
      }
      dialogVisible.value = false
      load()
    } catch (e) {
      // 错误提示已由 request 统一处理
    } finally {
      saving.value = false
    }
  })
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确定删除标签「${row.name}」吗？`, '删除标签', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (e) {
    return
  }
  try {
    await adminTagDelete({ token: token(), tagId: row._id })
    ElMessage.success('标签已删除')
    load()
  } catch (e) {
    // 错误提示已由 request 统一处理
  }
}

onMounted(load)
</script>

<style scoped>
.tip-alert {
  margin-bottom: 16px;
}
</style>
