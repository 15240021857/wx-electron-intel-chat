import { defineConfig } from 'vite';
// @vitejs/plugin-vue 是esm的，所以需特殊配置tsconfig.json
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'
import path from'path'

// https://vitejs.dev/config
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.join(__dirname,'/src')
    }
  },
  server: {
    port: 5175
  }
});
