import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
  // ✅ VITE_ prefix'li tüm değişkenleri yükle
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  const hasSentry =
    env.SENTRY_ORG &&
    env.SENTRY_PROJECT &&
    env.SENTRY_AUTH_TOKEN;

  // ✅ Production URL'i kesin olarak belirle
  const productionApiUrl = 'https://terravest-api.terravest.workers.dev/api';
  const apiUrl = mode === 'production' 
    ? productionApiUrl 
    : (env.VITE_API_URL || 'http://localhost:8787/api');

  console.log(`🔧 Build Mode: ${mode}`);
  console.log(`🌍 API URL: ${apiUrl}`);

  return {
    plugins: [
      react(),
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
    
    define: {
      // ✅ Build-time'da production URL'i garanti et
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_TURNSTILE_SITE_KEY': JSON.stringify(env.VITE_TURNSTILE_SITE_KEY),
      // ✅ Mode bilgisini de aktar
      'import.meta.env.MODE': JSON.stringify(mode),
    },

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