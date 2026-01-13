import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineWorkersConfig({
    test: {
        setupFiles: ['./test/setup.ts'],
        globals: true,
        poolOptions: {
            workers: {
                wrangler: { configPath: './wrangler.jsonc' },
            },
        },
        // 👇 KRİTİK KISIM: Eski kütüphaneleri zorla modern stream'e yönlendiriyoruz
        alias: {
            'readable-stream': 'node:stream',
            'stream': 'node:stream',
        },
    },
    plugins: [
        nodePolyfills({
            // Buffer ve Stream'i özellikle dahil ediyoruz
            include: ['buffer', 'stream', 'util', 'events', 'process'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            protocolImports: true,
        }),
    ],
});