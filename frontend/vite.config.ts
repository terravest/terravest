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

  // ✅ Production URL'i kesin olarak belirle (fallback)
  const productionApiUrl = 'https://terravest-api.terravest.workers.dev/api';
  
  // ✅ API URL belirleme mantığı:
  // 1. Cloudflare Dashboard'dan VITE_API_URL varsa onu kullan
  // 2. Production mode'da ve env yoksa production URL kullan
  // 3. Development mode'da da production URL kullan (env yoksa)
  let apiUrl: string;
  
  if (env.VITE_API_URL) {
    // Dashboard'dan gelen değeri kullan
    apiUrl = env.VITE_API_URL;
  } else {
    // Her durumda production URL kullan (env yoksa)
    apiUrl = productionApiUrl;
  }

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
      // ✅ Build-time'da API URL'i gömmek - Dashboard'dan gelirse onu kullan, yoksa fallback
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_TURNSTILE_SITE_KEY': JSON.stringify(env.VITE_TURNSTILE_SITE_KEY || ''),
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