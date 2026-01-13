import { env, createExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';

// =======================
// MOCKLAR
// =======================
vi.mock('../src/lib/bitcoin', () => {
	return {
		generateWasabiAddress: () => 'bc1qmockaddressfake123456',
		isAddressUnused: async () => true,
	};
});

// Mock'lardan SONRA import
import worker from '../src/index';
import { applySchema } from './utils';

async function createTestUser(email: string, username: string, balance: number) {
	const hashedPassword = await bcrypt.hash('password123', 10);
	await env.terravest_db
		.prepare(`INSERT INTO users (email, username, password, role, usd_balance) VALUES (?, ?, ?, ?, ?)`)
		.bind(email, username, hashedPassword, 'user', balance)
		.run();
}

async function createTestProperty(title: string, tokenPrice: number, totalTokens: number) {
	await env.terravest_db
		.prepare(`INSERT INTO properties (title, token_price, total_tokens, available_tokens) VALUES (?, ?, ?, ?)`)
		.bind(title, tokenPrice, totalTokens, totalTokens)
		.run();
}

async function loginUser(identifier: string) {
	const res = await worker.fetch(
		new Request('http://localhost/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				identifier,
				password: 'password123',
			}),
		}),
		env,
		createExecutionContext()
	);

	const data = await res.json() as any;
	return data.token;
}

describe('Buy API (Worker Environment)', () => {
	beforeAll(async () => {
		await applySchema(env.terravest_db);
	});

	beforeEach(async () => {
		await env.terravest_db.exec(`DELETE FROM investments`);
		await env.terravest_db.exec(`DELETE FROM deposits`);
		await env.terravest_db.exec(`DELETE FROM withdrawals`);
		await env.terravest_db.exec(`DELETE FROM transactions`);
		await env.terravest_db.exec(`DELETE FROM orders`);
		await env.terravest_db.exec(`DELETE FROM ownerships`);
		await env.terravest_db.exec(`DELETE FROM properties`);
		await env.terravest_db.exec(`DELETE FROM users`);
	});

	it('✅ should buy tokens successfully (happy path)', async () => {
		await createTestUser('buyer@test.com', 'buyer', 1000);
		await createTestProperty('Villa', 50, 100);

		const token = await loginUser('buyer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					propertyId: 1,
					tokenAmount: 5, // 5 × 50$ = 250$
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(201);
		const data = await res.json() as any;
		expect(data.message).toBe('Tokens purchased successfully');
		expect(data.totalCost).toBe(250);

		// Verify balance was deducted
		const user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('buyer@test.com')
			.first() as any;
		expect(user.usd_balance).toBe(750);

		// Verify investment was created
		const investment = await env.terravest_db
			.prepare(`SELECT * FROM investments WHERE user_id = 1 AND property_id = 1`)
			.first();
		expect(investment).toBeDefined();
	});

	it('❌ should reject unauthorized requests (no token)', async () => {
		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					// No Authorization header
				},
				body: JSON.stringify({
					propertyId: 1,
					tokenAmount: 5,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(401);
		const data = await res.json() as any;
		expect(data.error).toContain('Unauthorized');
	});

	it('❌ should reject unauthorized requests (invalid token)', async () => {
		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer invalid-token',
				},
				body: JSON.stringify({
					propertyId: 1,
					tokenAmount: 5,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(401);
		const data = await res.json() as any;
		expect(data.error).toContain('Unauthorized');
	});

	it('❌ should reject insufficient balance', async () => {
		await createTestUser('poor@test.com', 'poor', 10); // Only $10
		await createTestProperty('Villa', 50, 100);

		const token = await loginUser('poor@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					propertyId: 1,
					tokenAmount: 1, // 1 × 50$ > 10$
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
		const data = await res.json() as any;
		expect(data.error).toBe('Insufficient balance');
	});

	it('❌ should reject invalid property ID', async () => {
		await createTestUser('buyer@test.com', 'buyer', 1000);
		const token = await loginUser('buyer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					propertyId: 999, // Non-existent property
					tokenAmount: 5,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(404);
		const data = await res.json() as any;
		expect(data.error).toBe('Property not found');
	});

	it('❌ should reject invalid input (missing propertyId)', async () => {
		await createTestUser('buyer@test.com', 'buyer', 1000);
		const token = await loginUser('buyer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					// propertyId missing
					tokenAmount: 5,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
	});

	it('❌ should reject invalid input (negative tokenAmount)', async () => {
		await createTestUser('buyer@test.com', 'buyer', 1000);
		await createTestProperty('Villa', 50, 100);
		const token = await loginUser('buyer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					propertyId: 1,
					tokenAmount: -5, // Invalid: negative
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
	});

	it('❌ should reject invalid input (zero tokenAmount)', async () => {
		await createTestUser('buyer@test.com', 'buyer', 1000);
		await createTestProperty('Villa', 50, 100);
		const token = await loginUser('buyer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					propertyId: 1,
					tokenAmount: 0, // Invalid: zero
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
	});
});
