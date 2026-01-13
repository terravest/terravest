import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineWorkersConfig({
    test: {
        poolOptions: {
            workers: {
                wrangler: { configPath: './wrangler.jsonc' },
            },
        },
        include: ['test/**/*.worker.test.ts'], // Sadece .worker.test.ts dosyalarını çalıştır
        globals: true,
        setupFiles: ['./test/setup.ts'],
    },
    // API kodun import edildiğinde patlamaması için Polyfill yine de lazım
    // Ama ağır testleri burada yapmayacağız.
    plugins: [
        nodePolyfills({
            include: ['buffer', 'stream', 'util', 'events', 'process'],
            globals: { Buffer: true, global: true, process: true },
            protocolImports: true,
        }),
    ],
});