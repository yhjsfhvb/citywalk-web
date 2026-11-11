<template>
  <div class="cw-container ai-page">
    <div class="chat-panel">
      <!-- 顶部标题栏 -->
      <div class="panel-header">
        <div class="header-left">
          <div class="ai-avatar">漫</div>
          <div>
            <div class="ai-name">小漫 · AI 助手</div>
            <div class="ai-status">{{ loading ? '正在思考…' : '在线，随时问我城市漫步的问题' }}</div>
          </div>
        </div>
        <el-button text type="danger" size="small" :disabled="!messages.length || loading" @click="clearChat">
          清空对话
        </el-button>
      </div>

      <!-- 消息列表 -->
      <div ref="msgListRef" class="msg-list">
        <!-- 空状态：欢迎语 + 快捷问题 -->
        <div v-if="!messages.length" class="welcome">
          <div class="welcome-icon">🚶</div>
          <h2>你好，我是小漫</h2>
          <p>你的城市漫步小助手，可以帮你推荐路线、介绍街区、给出徒步建议</p>
          <div class="quick-list">
            <div v-for="q in quickQuestions" :key="q" class="quick-item" @click="askQuick(q)">{{ q }}</div>
          </div>
        </div>

        <!-- 对话气泡 -->
        <template v-for="(m, i) in messages" :key="i">
          <div class="msg-row" :class="m.role">
            <div v-if="m.role === 'assistant'" class="msg-avatar ai">漫</div>
            <div class="msg-bubble" :class="{ error: m.error }">
              <span v-if="m.role === 'assistant'" class="msg-text" v-html="formatText(m.content)"></span>
              <span v-else class="msg-text">{{ m.content }}</span>
            </div>
            <el-avatar v-if="m.role === 'user'" :size="34" :src="userAvatar" class="msg-avatar">{{ userInitial }}</el-avatar>
          </div>
        </template>

        <!-- AI 思考中的打字动画 -->
        <div v-if="loading" class="msg-row assistant">
          <div class="msg-avatar ai">漫</div>
          <div class="msg-bubble thinking"><span></span><span></span><span></span></div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="input-area">
        <el-input
          v-model="input"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="输入你的问题，Enter 发送，Shift + Enter 换行"
          :disabled="loading"
          @keydown.enter.exact.prevent="send"
        />
        <el-button type="primary" round :loading="loading" :disabled="!input.trim()" @click="send">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { aiChat } from '@/api/ai'
import { nicknameInitial } from '@/utils/dict'

// AI 助手功能页面：多轮对话，历史随请求一起发送给云函数，由云函数转发 DeepSeek
const input = ref('')
const loading = ref(false)
const messages = ref([]) // [{ role: 'user'|'assistant', content, error? }]
const msgListRef = ref(null)

const userAvatar = computed(() => (userStore.state.userInfo && userStore.state.userInfo.avatar) || '')
const userInitial = computed(() => nicknameInitial(userStore.state.userInfo && userStore.state.userInfo.nickname))

const quickQuestions = [
  '帮我规划一条上海半日漫步路线',
  '城市漫步需要准备什么装备？',
  '北京有哪些适合拍照的老街区？',
  '怎么在平台上发布自己的路线？'
]

/** 滚动到底部 */
async function scrollToBottom() {
  await nextTick()
  const el = msgListRef.value
  if (el) el.scrollTop = el.scrollHeight
}

/** 简单文本格式化：换行转 <br> */
function formatText(text) {
  return String(text || '').replace(/\n/g, '<br>')
}

/** 发送消息 */
async function send() {
  const content = input.value.trim()
  if (!content || loading.value) return

  messages.value.push({ role: 'user', content })
  input.value = ''
  loading.value = true
  scrollToBottom()

  try {
    // 取最近 20 条历史（10 轮）发给云函数，由云函数转发 DeepSeek
    const history = messages.value.slice(-21, -1).map((m) => ({ role: m.role, content: m.content }))
    const data = await aiChat({ token: userStore.state.token, message: content, history })
    messages.value.push({ role: 'assistant', content: data.reply })
  } catch (e) {
    const msg = e.message || 'AI 服务异常，请稍后重试'
    messages.value.push({ role: 'assistant', content: msg, error: true })
    ElMessage.error(msg)
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

/** 点击快捷问题直接发送 */
function askQuick(q) {
  input.value = q
  send()
}

/** 清空对话 */
function clearChat() {
  messages.value = []
}
</script>

<style scoped>
.ai-page {
  padding: 24px 0;
  max-width: 860px;
}

.chat-panel {
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px - 60px);
  min-height: 480px;
  overflow: hidden;
}

/* ---------- 顶部 ---------- */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--cw-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar,
.msg-avatar.ai {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.ai-name {
  font-size: 15px;
  font-weight: 600;
}

.ai-status {
  font-size: 12px;
  color: var(--cw-text-light);
  margin-top: 2px;
}

/* ---------- 消息区 ---------- */
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome {
  text-align: center;
  padding: 40px 20px;
  color: var(--cw-text);
}

.welcome-icon {
  font-size: 44px;
  margin-bottom: 10px;
}

.welcome h2 {
  font-size: 20px;
  margin-bottom: 8px;
}

.welcome p {
  font-size: 14px;
  color: var(--cw-text-light);
  margin-bottom: 24px;
}

.quick-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 520px;
  margin: 0 auto;
}

.quick-item {
  padding: 12px 16px;
  border: 1px solid var(--cw-border);
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #faf9f7;
}

.quick-item:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

/* ---------- 气泡 ---------- */
.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.msg-row.user {
  flex-direction: row-reverse;
}

.msg-bubble {
  max-width: 72%;
  padding: 11px 15px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.msg-row.assistant .msg-bubble {
  background: #f5f3f0;
  border-top-left-radius: 4px;
}

.msg-row.user .msg-bubble {
  background: var(--el-color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}

.msg-bubble.error {
  background: #fef0f0;
  color: var(--el-color-danger);
}

/* 思考中三点动画 */
.thinking {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 16px 18px;
}

.thinking span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cw-text-light);
  animation: bounce 1.2s infinite ease-in-out;
}

.thinking span:nth-child(2) {
  animation-delay: 0.15s;
}

.thinking span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-5px); opacity: 1; }
}

/* ---------- 输入区 ---------- */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--cw-border);
  background: #faf9f7;
}

.input-area :deep(.el-textarea__inner) {
  border-radius: 10px;
  padding: 10px 12px;
}

@media (max-width: 768px) {
  .quick-list {
    grid-template-columns: 1fr;
  }
  .msg-bubble {
    max-width: 84%;
  }
}
</style>
