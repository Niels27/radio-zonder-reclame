import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages deployment configuration
  base: '/no-ads-radio-project/',
  define: {
    // Ensure import.meta.env.PROD is available
    '__PROD__': JSON.stringify(process.env.NODE_ENV === 'production')
  },
  build: {
    // Output directory for GitHub Pages
    outDir: 'dist',
    // Ensure assets are properly referenced
    assetsDir: 'assets',
    // Minify console logs in production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production build (optional - our logger handles this)
        drop_console: false, // Keep false since we handle it manually for better control
        drop_debugger: true
      }
    },
    // Generate source maps for debugging (optional, remove if you want smaller builds)
    sourcemap: false,
    // Ensure proper asset handling
    rollupOptions: {
      output: {
        // Ensure consistent asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  // Preview configuration (for local testing of production build)
  preview: {
    port: 4173,
    host: true
  }
})
