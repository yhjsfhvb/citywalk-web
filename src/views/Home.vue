<template>
  <div class="home">
    <!-- 顶部搜索区（F008 关键词搜索） -->
    <section class="hero">
      <div class="cw-container hero-inner">
        <h1>用脚步丈量城市</h1>
        <p>发现街巷里的历史建筑、市井烟火与文艺小店，跟着路线的点位顺序慢慢走。</p>
        <div class="search-bar">
          <el-input
            v-model="query.keyword"
            size="large"
            placeholder="搜索路线标题或简介，例如「老城街巷」"
            clearable
            @keyup.enter="search"
            @clear="search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button size="large" type="primary" @click="search">搜索</el-button>
        </div>
      </div>
    </section>

    <div class="cw-container cw-page">
      <!-- F007 标签筛选 -->
      <TagFilter :tags="tags" :model-value="query.tagIds" @update:model-value="onTagsChange" />

      <!-- F009 排序切换 -->
      <div class="toolbar">
        <el-radio-group v-model="query.sort" @change="onSortChange">
          <el-radio-button v-for="item in SORT_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
        <span class="total cw-text-muted">共 {{ total }} 条路线</span>
      </div>

      <!-- F006 路线列表展示 -->
      <div v-loading="loading" class="list-wrap">
        <div v-if="list.length" class="cw-grid">
          <RouteCard v-for="item in list" :key="item._id" :data="item" />
        </div>
        <EmptyState v-else text="没有符合条件的路线，换个关键词或标签试试" />
      </div>

      <el-pagination
        v-if="total > query.pageSize"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="query.pageSize"
        :current-page="query.page"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { routeList } from '@/api/route'
import { tagList } from '@/api/tag'
import TagFilter from '@/components/TagFilter.vue'
import RouteCard from '@/components/RouteCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { SORT_OPTIONS } from '@/utils/dict'

const tags = ref([])
const list = ref([])
const total = ref(0)
const loading = ref(false)

const query = reactive({
  tagIds: [],
  keyword: '',
  sort: 'hot',
  page: 1,
  pageSize: 9
})

async function loadTags() {
  try {
    tags.value = await tagList()
  } catch (e) {
    tags.value = []
  }
}

async function loadRoutes() {
  loading.value = true
  try {
    const data = await routeList(Object.assign({}, query))
    list.value = (data && data.list) || []
    total.value = (data && data.total) || 0
  } catch (e) {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onTagsChange(value) {
  query.tagIds = value
  query.page = 1
  loadRoutes()
}

function onSortChange() {
  query.page = 1
  loadRoutes()
}

function search() {
  query.page = 1
  loadRoutes()
}

function onPageChange(page) {
  query.page = page
  loadRoutes()
}

onMounted(() => {
  loadTags()
  loadRoutes()
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #fdf6f1 0%, #f7efe6 60%, #f2e6d8 100%);
  padding: 44px 0 40px;
  border-bottom: 1px solid var(--cw-border);
}

.hero-inner h1 {
  margin: 0 0 8px;
  font-size: 30px;
  letter-spacing: 1px;
}

.hero-inner p {
  margin: 0 0 20px;
  color: var(--cw-text-light);
  font-size: 14px;
}

.search-bar {
  display: flex;
  gap: 10px;
  max-width: 620px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.total {
  font-size: 13px;
}

.list-wrap {
  min-height: 220px;
}

@media (max-width: 768px) {
  .hero-inner h1 {
    font-size: 22px;
  }
}
</style>
