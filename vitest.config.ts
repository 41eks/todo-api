// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true, // 📌 开启全局变量
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',          // 📌 核心：防止 Vitest 去跑 dist 里的 .js 测试文件
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 📌 确保 Vitest 也能识别 @ 别名
    },
  },
})