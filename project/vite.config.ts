import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  resolve: {
    alias: {
      'cloudflare:sockets': '/home/project/src/lib/supabase.ts',
    }
  },
  build: {
    rollupOptions: {
      external: ['cloudflare:sockets'],
    },
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  define: {
    'process.env': {}
  }
});