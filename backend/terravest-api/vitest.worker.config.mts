import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const bitcoinMockPath = resolve(__dirname, 'test/mocks/bitcoin.ts');

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
		include: ['test/**/*.worker.test.ts'],
		globals: true,
		setupFiles: ['./test/setup.ts'],
	},
	plugins: [
		nodePolyfills({
			include: ['buffer', 'stream', 'util', 'events', 'process'],
			globals: { Buffer: true, global: true, process: true },
			protocolImports: true,
		}),
	],
	resolve: {
		alias: [
			{
				find: './lib/bitcoin',
				replacement: bitcoinMockPath,
			},
			{
				find: /[\\/]+lib[\\/]+bitcoin$/,
				replacement: bitcoinMockPath,
			},
		],
	},
});
