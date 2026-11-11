<template>
  <div class="cw-page">
    <div class="cw-container">
      <!-- 返回 -->
      <div class="back-bar">
        <el-button text :icon="ArrowLeft" @click="goBack">返回</el-button>
      </div>

      <div v-if="loading" v-loading="loading" class="loading-box" />

      <EmptyState v-else-if="errorMsg" :text="errorMsg">
        <el-button type="primary" @click="load">重新加载</el-button>
      </EmptyState>

      <template v-else-if="detail">
        <!-- F010 路线详情信息 -->
        <section class="detail-head cw-card">
          <div class="cover">
            <el-image :src="detail.route.cover" fit="cover" class="cover-img" />
          </div>

          <div class="head-body">
            <h1 class="title">{{ detail.route.title }}</h1>

            <div class="tags">
              <el-tag v-for="tag in detail.tags" :key="tag._id" effect="plain" size="small">
                {{ tag.name }}
              </el-tag>
            </div>

            <p class="intro">{{ detail.route.intro }}</p>

            <div class="cw-stats stats">
              <span>
                <el-icon><Clock /></el-icon>
                {{ formatDuration(detail.route.duration) }}
              </span>
              <span>
                <el-icon><Odometer /></el-icon>
                {{ difficulty.label }}
              </span>
              <span>
                <el-icon><Location /></el-icon>
                {{ detail.points.length }} 个点位
              </span>
              <span>
                <el-icon><View /></el-icon>
                {{ detail.route.view_count }} 次浏览
              </span>
              <span>
                <el-icon><Star /></el-icon>
                {{ detail.route.collect_count }} 人收藏
              </span>
            </div>

            <div class="head-foot">
              <span class="author">
                创作者：{{ detail.route.user_nickname || '匿名创作者' }} ·
                {{ formatTime(detail.route.create_date) }}
              </span>

              <div class="actions">
                <!-- F016 点赞 -->
                <el-button
                  :type="detail.liked ? 'primary' : 'default'"
                  :icon="Star"
                  round
                  @click="onToggleLike"
                >
                  {{ detail.liked ? '已点赞' : '点赞' }} {{ detail.route.like_count }}
                </el-button>
                <!-- F012 收藏 -->
                <el-button
                  :type="detail.collected ? 'warning' : 'default'"
                  :icon="Collection"
                  round
                  @click="onToggleCollect"
                >
                  {{ detail.collected ? '已收藏' : '收藏' }} {{ detail.route.collect_count }}
                </el-button>
              </div>
            </div>
          </div>
        </section>

        <!-- F011 结构化点位列表 -->
        <section class="cw-card points-card">
          <h2 class="cw-section-title">
            <span>途经点位（按行走顺序）</span>
            <span class="cw-empty-tip">在点位处点击「打卡」记录你的足迹</span>
          </h2>

          <div class="point-list">
            <div v-for="(point, index) in detail.points" :key="point._id" class="point-item">
              <div class="point-index">{{ index + 1 }}</div>

              <div class="point-main">
                <div class="point-text">
                  <h3>{{ point.name }}</h3>
                  <p>{{ point.intro }}</p>
                  <div class="point-actions">
                    <!-- F013 打卡 / F014 打卡上传照片 -->
                    <el-button
                      size="small"
                      :type="isClocked(point._id) ? 'success' : 'primary'"
                      :disabled="isClocked(point._id)"
                      plain
                      @click="openClock(point)"
                    >
                      {{ isClocked(point._id) ? '已打卡' : '打卡' }}
                    </el-button>
                  </div>
                </div>

                <el-image
                  :src="point.image"
                  fit="cover"
                  class="point-img"
                  :preview-src-list="[point.image]"
                  preview-teleported
                />
              </div>
            </div>
          </div>
        </section>

        <!-- F017 提交评论 / F018 查看已审核评论 -->
        <section class="cw-card comments-card">
          <h2 class="cw-section-title">
            <span>游玩心得（{{ detail.comments.length }}）</span>
          </h2>

          <div class="comment-form">
            <el-input
              v-model="commentText"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
              placeholder="写下你的漫步感受、注意事项或推荐时段…（提交后需管理员审核通过才会展示）"
            />
            <div class="form-foot">
              <el-button type="primary" :loading="submittingComment" @click="submitComment">
                提交评论
              </el-button>
            </div>
          </div>

          <el-divider />

          <div v-if="detail.comments.length" class="comment-list">
            <div v-for="comment in detail.comments" :key="comment._id" class="comment-item">
              <el-avatar :size="36" :src="comment.user_avatar || ''">
                {{ nicknameInitial(comment.user_nickname) }}
              </el-avatar>
              <div class="comment-body">
                <div class="comment-head">
                  <span class="nickname">{{ comment.user_nickname }}</span>
                  <span class="time">{{ formatTime(comment.create_date) }}</span>
                </div>
                <p class="content">{{ comment.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="cw-empty-tip">还没有已审核通过的评论，来写第一条心得吧。</div>
        </section>
      </template>
    </div>

    <!-- F014 打卡上传照片（选填） -->
    <el-dialog v-model="clockDialogVisible" title="点位打卡" width="420px">
      <p class="clock-tip">
        打卡点位：<b>{{ clockPoint ? clockPoint.name : '' }}</b>
      </p>
      <ImageUploader
        v-model="clockImage"
        width="200"
        height="140"
        text="上传打卡照片（选填）"
        tip="不上传照片也可以直接完成打卡"
      />
      <template #footer>
        <el-button @click="clockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="clocking" @click="confirmClock">确认打卡</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Collection, Star } from '@element-plus/icons-vue'
import { routeDetail } from '@/api/route'
import { clockAdd, collectToggle, commentAdd, likeToggle } from '@/api/interact'
import userStore from '@/store/user'
import ImageUploader from '@/components/ImageUploader.vue'
import EmptyState from '@/components/EmptyState.vue'
import { difficultyInfo, formatDuration, formatTime, nicknameInitial } from '@/utils/dict'

const currentRoute = useRoute()
const router = useRouter()

const routeId = computed(() => String(currentRoute.params.id || ''))
const token = computed(() => userStore.state.token)
const isLogin = computed(() => !!token.value)

const loading = ref(true)
const errorMsg = ref('')
const detail = ref(null)

const commentText = ref('')
const submittingComment = ref(false)

const clockDialogVisible = ref(false)
const clockPoint = ref(null)
const clockImage = ref('')
const clocking = ref(false)

const difficulty = computed(() =>
  difficultyInfo(detail.value ? detail.value.route.difficulty : 0)
)

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    // F010 打开详情页，云端自动为该路线浏览量 +1
    detail.value = await routeDetail({ routeId: routeId.value, token: token.value })
  } catch (e) {
    detail.value = null
    errorMsg.value = e.message || '路线加载失败'
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function requireLogin() {
  if (isLogin.value) return true
  ElMessage.warning('请先登录后再操作')
  router.push({ name: 'Login', query: { redirect: currentRoute.fullPath } })
  return false
}

/** F016 点赞 / 取消点赞 */
async function onToggleLike() {
  if (!requireLogin()) return
  const data = await likeToggle({ token: token.value, routeId: routeId.value })
  detail.value.liked = data.liked
  detail.value.route.like_count = Math.max(
    0,
    (detail.value.route.like_count || 0) + (data.liked ? 1 : -1)
  )
  ElMessage.success(data.liked ? '点赞成功' : '已取消点赞')
}

/** F012 收藏 / 取消收藏 */
async function onToggleCollect() {
  if (!requireLogin()) return
  const data = await collectToggle({ token: token.value, routeId: routeId.value })
  detail.value.collected = data.collected
  detail.value.route.collect_count = Math.max(
    0,
    (detail.value.route.collect_count || 0) + (data.collected ? 1 : -1)
  )
  ElMessage.success(data.collected ? '已加入「我的收藏」' : '已取消收藏')
}

function isClocked(pointId) {
  return (detail.value.clockedPointIds || []).indexOf(pointId) > -1
}

/** F013 打卡 / F014 打卡照片 */
function openClock(point) {
  if (!requireLogin()) return
  clockPoint.value = point
  clockImage.value = ''
  clockDialogVisible.value = true
}

async function confirmClock() {
  if (!clockPoint.value) return
  clocking.value = true
  try {
    await clockAdd({
      token: token.value,
      routeId: routeId.value,
      pointId: clockPoint.value._id,
      image: clockImage.value
    })
    detail.value.clockedPointIds = (detail.value.clockedPointIds || []).concat([
      clockPoint.value._id
    ])
    clockDialogVisible.value = false
    ElMessage.success('打卡成功，可在「我的打卡」中查看记录')
  } catch (e) {
    // 错误提示已由 request 统一处理
  } finally {
    clocking.value = false
  }
}

/** F017 提交评论（进入待审核状态） */
async function submitComment() {
  if (!requireLogin()) return
  const content = commentText.value.trim()
  if (!content) {
    ElMessage.warning('请输入评论内容')
    return
  }
  submittingComment.value = true
  try {
    await commentAdd({ token: token.value, routeId: routeId.value, content })
    commentText.value = ''
    ElMessage.success('评论已提交，管理员审核通过后即可对外展示')
  } catch (e) {
    // 错误提示已由 request 统一处理
  } finally {
    submittingComment.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.back-bar {
  margin-bottom: 12px;
}

.loading-box {
  height: 260px;
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: var(--cw-card-radius);
}

.detail-head {
  display: flex;
  gap: 24px;
  padding: 22px;
}

.cover {
  width: 380px;
  height: 250px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  display: block;
}

.head-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 24px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.intro {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #5a534d;
}

.stats {
  font-size: 13px;
}

.head-foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.author {
  font-size: 13px;
  color: var(--cw-text-light);
}

.actions {
  display: flex;
  gap: 10px;
}

/* 点位列表 */
.points-card {
  margin-top: 16px;
}

.point-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.point-item {
  display: flex;
  gap: 14px;
  border: 1px solid var(--cw-border);
  border-radius: 10px;
  padding: 14px 16px;
  background: #fffdfb;
}

.point-index {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.point-main {
  flex: 1;
  display: flex;
  gap: 18px;
  min-width: 0;
}

.point-text {
  flex: 1;
  min-width: 0;
}

.point-text h3 {
  margin: 2px 0 8px;
  font-size: 16px;
}

.point-text p {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.75;
  color: #5a534d;
}

.point-img {
  width: 160px;
  height: 110px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
  cursor: zoom-in;
}

/* 评论 */
.comments-card {
  margin-top: 16px;
}

.comment-form .form-foot {
  margin-top: 10px;
  text-align: right;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.nickname {
  font-size: 14px;
  font-weight: 600;
}

.time {
  font-size: 12px;
  color: var(--cw-text-light);
}

.comment-item .content {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #4f4842;
  white-space: pre-wrap;
  word-break: break-word;
}

.clock-tip {
  margin: 0 0 12px;
  font-size: 14px;
}

@media (max-width: 900px) {
  .detail-head {
    flex-direction: column;
  }
  .cover {
    width: 100%;
    height: 200px;
  }
  .point-main {
    flex-direction: column;
  }
  .point-img {
    width: 100%;
    height: 180px;
  }
}
</style>
