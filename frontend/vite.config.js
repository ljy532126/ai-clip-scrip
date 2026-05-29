import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()]
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3013', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 分包策略：vant/lodash类库单独打包避免主入口过大
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vant')) return 'vant'
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia') || id.includes('node_modules/vue-router')) return 'vendor'
          if (id.includes('node_modules/axios') || id.includes('node_modules/jszip')) return 'utils'
        }
      }
    },
    // 资源内联阈值（小于4KB的CSS内联到JS减少请求）
    assetsInlineLimit: 4096,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 压缩（Vite 8 内置 esbuild minify）
    minify: 'esbuild',
    // chunk大小警告阈值提高到1MB
    chunkSizeWarningLimit: 1000,
    // sourcemap仅开发模式
    sourcemap: false
  },
  // CSS预处理
  css: {
    preprocessorOptions: {},
    devSourcemap: false
  }
})
