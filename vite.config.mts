import react from '@vitejs/plugin-react';
import path from 'node:path';
import { loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgrPlugin from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devPort = Number.parseInt(env.VITE_DEV_PORT ?? '5173', 10);

  return {
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
      setupFiles: ['./tests/vitest.setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    server: {
      host: env.VITE_DEV_HOST ?? '127.0.0.1',
      port: Number.isNaN(devPort) ? 5173 : devPort,
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});
