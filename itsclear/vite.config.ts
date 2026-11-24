import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'react';
          if (id.includes('/node_modules/three/')) return 'three';
          if (id.includes('/node_modules/jspdf/')) return 'pdf';
          if (id.includes('/node_modules/html2canvas/')) return 'canvas';
          if (id.includes('/node_modules/dompurify/')) return 'sanitize';
          if (id.includes('/node_modules/leaflet/')) return 'maps';
          if (id.includes('/node_modules/lucide-react/')) return 'icons';
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});

