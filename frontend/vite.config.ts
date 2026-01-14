import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // In Development: Proxy API-Calls zum Backend
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    hmr: {
      host: 'localhost',
      clientPort: 3001
    },
    watch: {
      usePolling: true
    }
  }
})
