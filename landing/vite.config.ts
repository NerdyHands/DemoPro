import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import { seoPlugin } from './scripts/vite-seo-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Ensure static assets are copied
    copyPublicDir: true,
    // Generate source maps for debugging
    sourcemap: false,
    // Optimize for production
    minify: 'esbuild',
    // Set target for better browser compatibility
    target: 'es2015',
    rollupOptions: {
      output: {
        // Ensure SEO files and redirect files are at root level
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sitemap.xml' || assetInfo.name === 'robots.txt' || 
              assetInfo.name === '_redirects' || assetInfo.name === '.htaccess') {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // Manual chunking to reduce bundle size
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-bootstrap', 'framer-motion'],
          seo: ['react-helmet-async']
        }
      }
    }
  }
})
