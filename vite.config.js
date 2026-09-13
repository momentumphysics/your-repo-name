import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        birthday: resolve(import.meta.dirname, 'views/birthday.html'),
        newemail: resolve(import.meta.dirname, 'views/newemail.html'),
        pending: resolve(import.meta.dirname, 'views/pending.html'),
        verificationlocate: resolve(import.meta.dirname, 'views/verificationlocate.html'),
      },
    },
  },
});
