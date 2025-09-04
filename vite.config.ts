import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',   // your Express backend
        changeOrigin: true,
      },
    },
  },
});
