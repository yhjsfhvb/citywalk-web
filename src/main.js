/**
 * 应用入口：注册 Element-Plus（含中文语言包与全量图标）与路由
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './styles/main.css'

const app = createApp(App)

// 全量注册 Element-Plus 图标，模板中可直接使用 <el-icon><Search /></el-icon>
Object.entries(ElementPlusIconsVue).forEach(([name, component]) => {
  app.component(name, component)
})

app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.mount('#app')
