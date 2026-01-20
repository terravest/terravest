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

let ipCounter = 1;
const nextIp = () => `203.0.113.${ipCounter++}`;

async function createTestUser(email: string, username: string, balance: number) {
	const hashedPassword = await bcrypt.hash('password123', 10);
	await env.terravest_db
		.prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
		.bind(email, username, hashedPassword, 'user', balance, 1)
		.run();
}

async function createTestProperty(title: string, tokenPrice: number, totalTokens: number) {
	await env.terravest_db
		.prepare(`INSERT INTO properties (title, token_price, total_tokens, available_tokens) VALUES (?, ?, ?, ?)`)
		.bind(title, tokenPrice, totalTokens, totalTokens)
		.run();
}

async function createTestInvestment(userId: number, propertyId: number, tokenAmount: number, unclaimedRewards: number) {
	await env.terravest_db
		.prepare(`INSERT INTO investments (user_id, property_id, token_amount, purchase_price, total_cost, unclaimed_rewards) VALUES (?, ?, ?, ?, ?, ?)`)
		.bind(userId, propertyId, tokenAmount, 50, tokenAmount * 50, unclaimedRewards)
		.run();
}

async function loginUser(identifier: string) {
	const res = await worker.fetch(
		new Request('http://localhost/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'CF-Connecting-IP': nextIp(),
			},
			body: JSON.stringify({
				identifier,
				identifierType: identifier.includes('@') ? 'email' : 'username',
				password: 'password123',
					turnstileToken: 'test-token',
			}),
		}),
		env,
		createExecutionContext()
	);

	const data = await res.json() as any;
	return data.token;
}

describe('Claim API (Worker Environment)', () => {
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

	it('✅ should claim rewards successfully (happy path)', async () => {
		await createTestUser('claimer@test.com', 'claimer', 0);
		await createTestProperty('Villa', 50, 100);
		await createTestInvestment(1, 1, 10, 25.50); // User has $25.50 in unclaimed rewards

		const token = await loginUser('claimer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(200);
		const data = await res.json() as any;
		expect(data.success).toBe(true);
		expect(data.message).toContain('Rewards successfully claimed');
		expect(data.amount_claimed).toBe(25.50);

		// Verify balance was increased
		const user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('claimer@test.com')
			.first() as any;
		expect(user.usd_balance).toBe(25.50);

		// Verify unclaimed_rewards were reset
		const investment = await env.terravest_db
			.prepare(`SELECT unclaimed_rewards FROM investments WHERE user_id = 1`)
			.first() as any;
		expect(investment.unclaimed_rewards).toBe(0);

		// Verify transaction was created
		const transaction = await env.terravest_db
			.prepare(`SELECT * FROM transactions WHERE user_id = 1 AND type = 'rent_claim'`)
			.first();
		expect(transaction).toBeDefined();
	});

	it('✅ should claim rewards from multiple investments', async () => {
		await createTestUser('claimer@test.com', 'claimer', 0);
		await createTestProperty('Villa 1', 50, 100);
		await createTestProperty('Villa 2', 50, 100);
		await createTestInvestment(1, 1, 10, 15.25); // $15.25
		await createTestInvestment(1, 2, 5, 10.30); // $10.30
		// Total: $25.55

		const token = await loginUser('claimer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(200);
		const data = await res.json() as any;
		expect(data.amount_claimed).toBe(25.55);

		// Verify balance was increased
		const user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('claimer@test.com')
			.first() as any;
		expect(user.usd_balance).toBe(25.55);
	});

	it('❌ should reject unauthorized requests (no token)', async () => {
		const res = await worker.fetch(
			new Request('http://localhost/api/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					// No Authorization header
				},
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
			new Request('http://localhost/api/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer invalid-token',
				},
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(401);
		const data = await res.json() as any;
		expect(data.error).toContain('Unauthorized');
	});

	it('❌ should reject insufficient rewards (< $0.01)', async () => {
		await createTestUser('claimer@test.com', 'claimer', 0);
		await createTestProperty('Villa', 50, 100);
		await createTestInvestment(1, 1, 10, 0.005); // Less than 1 cent

		const token = await loginUser('claimer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
		const data = await res.json() as any;
		expect(data.error).toBe('No claimable rewards yet.');
	});

	it('❌ should reject insufficient rewards (zero)', async () => {
		await createTestUser('claimer@test.com', 'claimer', 0);
		await createTestProperty('Villa', 50, 100);
		await createTestInvestment(1, 1, 10, 0); // No rewards

		const token = await loginUser('claimer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(400);
		const data = await res.json() as any;
		expect(data.error).toBe('No claimable rewards yet.');
	});

	it('❌ should reject GET method (method not allowed)', async () => {
		await createTestUser('claimer@test.com', 'claimer', 0);
		const token = await loginUser('claimer@test.com');

		const res = await worker.fetch(
			new Request('http://localhost/api/claim', {
				method: 'GET', // Wrong method
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			env,
			createExecutionContext()
		);

		expect(res.status).toBe(405);
		const data = await res.json() as any;
		expect(data.error).toBe('Method not allowed.');
	});
});
