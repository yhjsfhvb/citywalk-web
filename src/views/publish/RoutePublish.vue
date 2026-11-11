<template>
  <div class="cw-page">
    <div v-loading="loading" class="cw-container publish-page">
      <div class="publish-head cw-card">
        <div>
          <h1>{{ isEdit ? '编辑漫步路线' : '发布城市漫步路线' }}</h1>
          <p class="cw-empty-tip">
            F019 - F021：填写路线基础信息 → 动态维护途经点位 → 提交管理员审核，审核通过后才会在首页展示
          </p>
        </div>
        <el-button text :icon="ArrowLeft" @click="goBack">返回</el-button>
      </div>

      <!-- F019 路线基础信息 -->
      <section class="cw-card">
        <h2 class="cw-section-title">路线基础信息</h2>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="left">
          <el-form-item label="路线标题" prop="title">
            <el-input
              v-model="form.title"
              maxlength="40"
              show-word-limit
              placeholder="例如：老城街巷半日漫步"
            />
          </el-form-item>

          <el-form-item label="路线简介" prop="intro">
            <el-input
              v-model="form.intro"
              type="textarea"
              :rows="3"
              maxlength="300"
              show-word-limit
              placeholder="用一两段话介绍这条路线适合谁、沿途会看到什么"
            />
          </el-form-item>

          <el-form-item label="步行时长" prop="duration">
            <el-input-number v-model="form.duration" :min="1" :max="1440" :step="10" />
            <span class="unit">分钟</span>
          </el-form-item>

          <el-form-item label="难度等级" prop="difficulty">
            <el-radio-group v-model="form.difficulty">
              <el-radio-button :value="1">轻松</el-radio-button>
              <el-radio-button :value="2">适中</el-radio-button>
              <el-radio-button :value="3">挑战</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="主题标签" prop="tag_ids">
            <el-select
              v-model="form.tag_ids"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择主题标签（可多选）"
              style="width: 100%"
            >
              <el-option v-for="tag in tags" :key="tag._id" :label="tag.name" :value="tag._id" />
            </el-select>
            <div class="cw-empty-tip">
              标签由平台管理员统一维护，只能从已有标签中选择，如需新增请联系管理员
            </div>
          </el-form-item>

          <el-form-item label="路线封面" required>
            <ImageUploader v-model="form.cover" width="280" height="170" text="上传路线封面图" />
          </el-form-item>
        </el-form>
      </section>

      <!-- F020 动态点位维护 -->
      <section class="cw-card">
        <h2 class="cw-section-title">
          <span>途经点位</span>
          <span class="cw-empty-tip">当前共 {{ form.points.length }} 个点位</span>
        </h2>
        <PointEditor v-model="form.points" />
      </section>

      <!-- F021 提交审核 -->
      <div class="publish-actions">
        <el-button size="large" @click="goBack">取消</el-button>
        <el-button size="large" type="primary" :loading="submitting" @click="submit">
          {{ isEdit ? '保存并重新提交审核' : '提交审核' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { routeCreate, routeMyDetail, routeUpdate } from '@/api/route'
import { tagList } from '@/api/tag'
import userStore from '@/store/user'
import ImageUploader from '@/components/ImageUploader.vue'
import PointEditor from '@/components/PointEditor.vue'

const currentRoute = useRoute()
const router = useRouter()

const editId = computed(() => String(currentRoute.query.edit || ''))
const isEdit = computed(() => !!editId.value)

const tags = ref([])
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  title: '',
  intro: '',
  duration: 60,
  difficulty: 2,
  tag_ids: [],
  cover: '',
  points: []
})

const rules = {
  title: [
    { required: true, message: '请填写路线标题', trigger: 'blur' },
    { max: 40, message: '路线标题不能超过 40 个字', trigger: 'blur' }
  ],
  intro: [
    { required: true, message: '请填写路线简介', trigger: 'blur' },
    { max: 300, message: '路线简介不能超过 300 个字', trigger: 'blur' }
  ],
  duration: [{ required: true, message: '请填写预计步行时长', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
  tag_ids: [
    {
      validator: (rule, value, callback) => {
        if (!value || !value.length) callback(new Error('请至少选择一个主题标签'))
        else callback()
      },
      trigger: 'change'
    }
  ]
}

async function loadTags() {
  try {
    tags.value = await tagList()
  } catch (e) {
    tags.value = []
  }
}

/** F022 编辑回显 */
async function loadForEdit() {
  loading.value = true
  try {
    const data = await routeMyDetail({ token: userStore.state.token, routeId: editId.value })
    const r = data.route || {}
    form.title = r.title || ''
    form.intro = r.intro || ''
    form.duration = r.duration || 60
    form.difficulty = r.difficulty || 2
    form.tag_ids = (r.tag_ids || []).slice()
    form.cover = r.cover || ''
    form.points = (data.points || []).map((p, index) => ({
      _key: p._id || `p_${index}`,
      name: p.name || '',
      intro: p.intro || '',
      image: p.image || ''
    }))
  } catch (e) {
    ElMessage.warning('路线信息加载失败，请返回重试')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/user/routes')
}

/** F021 提交审核（编辑时为重新提交） */
function submit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!form.cover) {
      ElMessage.warning('请上传路线封面图')
      return
    }
    if (!form.points.length) {
      ElMessage.warning('至少需要添加 1 个点位才允许提交')
      return
    }
    const invalidIndex = form.points.findIndex(
      (p) => !String(p.name || '').trim() || !String(p.intro || '').trim() || !p.image
    )
    if (invalidIndex > -1) {
      ElMessage.warning(`第 ${invalidIndex + 1} 个点位的名称、文字介绍与实拍图片都需要填写`)
      return
    }

    submitting.value = true
    try {
      const payload = {
        token: userStore.state.token,
        route: {
          title: form.title.trim(),
          intro: form.intro.trim(),
          duration: Number(form.duration),
          difficulty: Number(form.difficulty),
          tag_ids: form.tag_ids.slice(),
          cover: form.cover
        },
        points: form.points.map((p) => ({
          name: String(p.name).trim(),
          intro: String(p.intro).trim(),
          image: p.image
        }))
      }

      if (isEdit.value) {
        await routeUpdate(Object.assign({ routeId: editId.value }, payload))
        ElMessage.success('已保存并重新提交审核')
      } else {
        await routeCreate(payload)
        ElMessage.success('提交成功，等待平台管理员审核')
      }
      router.push('/user/routes')
    } catch (e) {
      // 错误提示已由 request 统一处理
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  loadTags()
  if (isEdit.value) loadForEdit()
})
</script>

<style scoped>
.publish-page {
  max-width: 900px;
}

.publish-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.publish-head h1 {
  margin: 0 0 6px;
  font-size: 22px;
}

.publish-head p {
  margin: 0;
}

.unit {
  margin-left: 8px;
  font-size: 13px;
  color: var(--cw-text-light);
}

.publish-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}
</style>
