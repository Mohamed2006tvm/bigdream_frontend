import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Never expose source maps in production (prevents source code leakage)
    sourcemap: false,
    // Use terser for better minification and dead-code elimination
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,       // Remove all console.* calls
        drop_debugger: true,      // Remove debugger statements
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        // Code splitting: split large vendor chunks for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('gsap') || id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
        },
      },
    },
    // Warn when individual chunks exceed 500kb
    chunkSizeWarningLimit: 500,
  },
})
