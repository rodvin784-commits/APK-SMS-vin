import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code-split agar initial load cepat — tab lain di-load on-demand (React.lazy di App.tsx)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('supabase')) return 'vendor-supabase'
            if (id.includes('react-icons')) return 'vendor-icons'
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
