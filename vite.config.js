import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 城市漫步平台前端构建配置
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './', // 使用相对路径打包，产物可直接放到任意静态目录 / 二级路径下访问
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500
  }
})
