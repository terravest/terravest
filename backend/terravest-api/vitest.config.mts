import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineWorkersConfig({
	test: {
		// Setup dosyası kalsın (bazı global tanımlar için iyi olur)
		setupFiles: ['./test/setup.ts'],

		globals: true,

		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
	},
	// 👇 İŞTE SİHİRLİ DOKUNUŞ BURASI
	plugins: [
		nodePolyfills({
			// Hangi modüllerin polyfill edileceğini seçiyoruz
			include: ['buffer', 'stream', 'util', 'events', 'string_decoder', 'process'],
			// Global değişkenleri (Buffer, process) otomatik ekle
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
			// Node protokolünü (node:buffer) destekle
			protocolImports: true,
		}),
	],
});