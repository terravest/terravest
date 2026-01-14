import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const hasSentry =
    env.SENTRY_ORG &&
    env.SENTRY_PROJECT &&
    env.SENTRY_AUTH_TOKEN;

  return {
    plugins: [
      react(),

      // ✅ Sentry: env yoksa plugin eklenmez (Cloudflare build kırılmaz)
      ...(hasSentry
        ? [
          sentryVitePlugin({
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            authToken: env.SENTRY_AUTH_TOKEN,
          }),
        ]
        : []),
    ],

    // ✅ Cloudflare Pages için ZORUNLU
    base: '/',

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'esnext',
      minify: 'esbuild',

      rollupOptions: {
        output: {
          // ✅ Güvenli manuel chunking
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router-dom')
              ) {
                return 'vendor-react';
              }

              if (
                id.includes('framer-motion') ||
                id.includes('lucide-react') ||
                id.includes('react-hot-toast')
              ) {
                return 'vendor-ui';
              }
            }
          },
        },
      },
    },
  };
});
