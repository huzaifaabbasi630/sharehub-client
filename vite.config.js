import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://sharehubbackend-jgf8qxf0.b4a.run',
        changeOrigin: true
      }
    }
  }
})
