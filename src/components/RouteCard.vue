<template>
  <article class="route-card" @click="open">
    <div class="cover">
      <el-image :src="data.cover" fit="cover" class="cover-img">
        <template #error>
          <div class="cover-fallback">{{ data.title }}</div>
        </template>
      </el-image>
      <span class="difficulty">{{ difficulty.label }}</span>
    </div>

    <div class="body">
      <h3 class="title cw-title-ellipsis">{{ data.title }}</h3>
      <p class="intro">{{ data.intro }}</p>

      <div class="tags">
        <el-tag v-for="t in data.tag_names || []" :key="t" size="small" type="info" effect="plain">
          {{ t }}
        </el-tag>
      </div>

      <div class="cw-stats meta">
        <span>
          <el-icon><Clock /></el-icon>
          {{ durationText }}
        </span>
        <span>
          <el-icon><Location /></el-icon>
          {{ data.point_count || 0 }} 个点位
        </span>
      </div>

      <div class="foot">
        <span class="author cw-title-ellipsis">{{ data.user_nickname || '匿名创作者' }}</span>
        <span class="cw-stats">
          <span>
            <el-icon><View /></el-icon>
            {{ data.view_count || 0 }}
          </span>
          <span>
            <el-icon><Star /></el-icon>
            {{ data.collect_count || 0 }}
          </span>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { difficultyInfo, formatDuration } from '@/utils/dict'

const props = defineProps({
  data: { type: Object, required: true }
})

const router = useRouter()

const difficulty = computed(() => difficultyInfo(props.data.difficulty))
const durationText = computed(() => formatDuration(props.data.duration))

function open() {
  router.push(`/route/${props.data._id}`)
}
</script>

<style scoped>
.route-card {
  background: #fff;
  border: 1px solid var(--cw-border);
  border-radius: var(--cw-card-radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.route-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(47, 42, 38, 0.1);
}

.cover {
  position: relative;
  height: 170px;
  background: #f2efeb;
}

.cover-img {
  width: 100%;
  height: 100%;
  display: block;
}

.cover-fallback {
  width: 100%;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b5ada5;
  font-size: 15px;
  padding: 0 16px;
  text-align: center;
}

.difficulty {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 10px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
}

.body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.intro {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--cw-text-light);
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 22px;
}

.meta {
  font-size: 12px;
}

.foot {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px dashed var(--cw-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--cw-text-light);
  gap: 10px;
}

.author {
  max-width: 120px;
}
</style>
