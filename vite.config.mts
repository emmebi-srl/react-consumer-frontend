import react from '@vitejs/plugin-react';
import path from 'node:path';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgrPlugin from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), svgrPlugin(), createHtmlPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['vitest-canvas-mock'],
      },
    },
    testTimeout: 10000,
    setupFiles: './tests/vitest.setup',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});
