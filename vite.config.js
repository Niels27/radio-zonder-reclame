import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Use HTTPS for the dev server only if local certs are present.
// Generate them yourself (they are gitignored) - see README "Local HTTPS".
const keyPath = path.resolve(__dirname, '127.0.0.1-key.pem')
const certPath = path.resolve(__dirname, '127.0.0.1.pem')
const httpsConfig = fs.existsSync(keyPath) && fs.existsSync(certPath)
  ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages deployment configuration
  base: '/radio-zonder-reclame/',
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
        drop_debugger: true,
        pure_funcs: ['console.log'],  // Strip console.log in production, keep warn/error
      }
    },
    // Generate source maps for debugging (optional, remove if you want smaller builds)
    sourcemap: false,    // Ensure proper asset handling
    rollupOptions: {
      output: {
        // Ensure consistent asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },  // Development server configuration
  server: {
    ...(httpsConfig ? { https: httpsConfig } : {}),
    host: '127.0.0.1',
    port: 4178,
    strictPort: true,
    open: '/radio-zonder-reclame/'
  },
  // Preview configuration (for local testing of production build)
  preview: {
    port: 4173,
    host: true
  }
})
