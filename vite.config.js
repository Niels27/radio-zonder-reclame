import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure import.meta.env.PROD is available
    '__PROD__': JSON.stringify(process.env.NODE_ENV === 'production')
  },
  build: {
    // Minify console logs in production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production build (optional - our logger handles this)
        drop_console: false, // Keep false since we handle it manually for better control
        drop_debugger: true
      }
    }
  }
})
