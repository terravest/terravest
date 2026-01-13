import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node', // Saf Node.js ortamı (Crypto sorunsuz çalışır)
        include: ['test/**/*.node.test.ts'], // Sadece .node.test.ts dosyalarını çalıştır
        globals: true,
    },
});