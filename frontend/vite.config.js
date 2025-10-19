import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Configuración de proxy
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // tu backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})
