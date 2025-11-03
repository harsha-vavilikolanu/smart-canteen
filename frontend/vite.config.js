import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Make sure this 'server' block is identical
  server: {
    proxy: {
      '/api': {
        target: 'https://smart-canteen-backend1.onrender.com',
        changeOrigin: true,
        secure: false,      
      },
    }
  }
})
