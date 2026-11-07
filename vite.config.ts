import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages base path - set via GITHUB_PAGES_REPO env var or default to has-prepper-web
const base = process.env.GITHUB_PAGES_REPO
  ? `/${process.env.GITHUB_PAGES_REPO}/`
  : '/has-prepper-web/';

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
            if (id.includes('zimjs')) {
              return 'zim';
            }
            if (id.includes('dexie')) {
              return 'db';
            }
            if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  publicDir: 'public',
});