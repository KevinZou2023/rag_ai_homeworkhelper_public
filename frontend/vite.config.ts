import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 🔥🔥🔥 核心修复：设置 1 分钟 (60000ms) 的超时时间 🔥🔥🔥
        timeout: 60000,      // 请求超时
        proxyTimeout: 60000, // 代理超时
      },
    },
  },
})