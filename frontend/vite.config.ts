import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 도커 컨테이너 외부 접속 허용
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8080', // 백엔드 컨테이너로 프록시
        changeOrigin: true,
      }
    }
  }
})
