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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-animation': ['gsap', 'framer-motion'],
          'vendor-ui': ['lucide-react'],
          'vendor-utils': ['axios', 'date-fns'],
        },
      },
    },
    // Warn when individual chunks exceed 500kb
    chunkSizeWarningLimit: 500,
  },
})
