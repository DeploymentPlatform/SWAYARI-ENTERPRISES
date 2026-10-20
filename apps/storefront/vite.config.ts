import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@swayari/shared': path.resolve(process.cwd(), 'packages/shared/src'),
      '@swayari/ui': path.resolve(process.cwd(), 'packages/ui/src'),
      '@': path.resolve(process.cwd(), 'apps/storefront/src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    copyPublicDir: Boolean(process.env.CI)
  }
});
