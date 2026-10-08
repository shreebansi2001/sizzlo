import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://cheeragskitchen.in/Sizzlo',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
