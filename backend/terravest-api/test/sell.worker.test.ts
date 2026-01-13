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

async function createTestInvestment(userId: number, propertyId: number, tokenAmount: number) {
	await env.terravest_db
		.prepare(`INSERT INTO investments (user_id, property_id, token_amount, purchase_price, total_cost) VALUES (?, ?, ?, ?, ?)`)
		.bind(userId, propertyId, tokenAmount, 50, tokenAmount * 50)
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

describe('Sell API (Worker Environment)', () => {
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

	it('✅ should sell tokens successfully (happy path)', async () => {
		await createTestUser('seller@test.com', 'seller', 0);
		await createTestProperty('Villa', 50, 100);
		await createTestInvestment(1, 1, 10); // User has 10 tokens

		const token = await loginUser('seller@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					property_id: 1,
					token_amount: 5, // Selling 5 tokens
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(200);
		const data = await res.json() as any;
		expect(data.success).toBe(true);
		expect(data.message).toContain('Asset sold successfully');
		expect(data.amount_added).toBeGreaterThan(0);
		expect(data.fee_deducted).toBeGreaterThan(0);

		// Verify balance was increased (net return after fee)
		const user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('seller@test.com')
			.first() as any;
		expect(user.usd_balance).toBeGreaterThan(0);

		// Verify investment token amount was decreased
		const investment = await env.terravest_db
			.prepare(`SELECT token_amount FROM investments WHERE user_id = 1 AND property_id = 1`)
			.first() as any;
		expect(investment.token_amount).toBe(5); // 10 - 5 = 5
	});

	it('❌ should reject unauthorized requests (no token)', async () => {
		const res = await worker.fetch(
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					// No Authorization header
				},
				body: JSON.stringify({
					property_id: 1,
					token_amount: 5,
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
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer invalid-token',
				},
				body: JSON.stringify({
					property_id: 1,
					token_amount: 5,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(401);
		const data = await res.json() as any;
		expect(data.error).toContain('Unauthorized');
	});

	it('❌ should reject insufficient tokens', async () => {
		await createTestUser('seller@test.com', 'seller', 0);
		await createTestProperty('Villa', 50, 100);
		await createTestInvestment(1, 1, 5); // User has only 5 tokens

		const token = await loginUser('seller@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					property_id: 1,
					token_amount: 10, // Trying to sell 10 tokens (only have 5)
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
		const data = await res.json() as any;
		expect(data.error).toBe('Insufficient tokens to sell');
	});

	it('❌ should reject invalid property ID', async () => {
		await createTestUser('seller@test.com', 'seller', 0);
		await createTestInvestment(1, 1, 10);

		const token = await loginUser('seller@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					property_id: 999, // Non-existent property
					token_amount: 5,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(404);
		const data = await res.json() as any;
		expect(data.error).toBe('Property not found or price not set');
	});

	it('❌ should reject invalid input (missing property_id)', async () => {
		await createTestUser('seller@test.com', 'seller', 0);
		const token = await loginUser('seller@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					// property_id missing
					token_amount: 5,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(500); // JSON parse error or missing field
	});

	it('❌ should reject invalid input (missing token_amount)', async () => {
		await createTestUser('seller@test.com', 'seller', 0);
		const token = await loginUser('seller@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					property_id: 1,
					// token_amount missing
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
		const data = await res.json() as any;
		expect(data.error).toContain('token_amount');
	});
});
