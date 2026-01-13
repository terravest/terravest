import { env, createExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';

// =======================
// MOCKS
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

async function createTestProperty(title: string, tokenPrice: number, totalTokens: number, price: number, rentalYield: number) {
	await env.terravest_db
		.prepare(`INSERT INTO properties (title, token_price, total_tokens, available_tokens, price, rental_yield) VALUES (?, ?, ?, ?, ?, ?)`)
		.bind(title, tokenPrice, totalTokens, totalTokens, price, rentalYield)
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

describe('Canary Test - Full Flow: Deposit → Buy → Claim → Sell', () => {
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

	it('✅ Full flow: Deposit → Buy → Accrue Rewards → Claim → Sell', async () => {
		// ==========================================
		// STEP 1: CREATE USER AND PROPERTY
		// ==========================================
		await createTestUser('canary@test.com', 'canaryuser', 0);
		
		// Property: $10,000 total value, $50 per token, 200 tokens, 5% rental yield
		await createTestProperty('Test Villa', 50, 200, 10000, 5.0);

		const token = await loginUser('canary@test.com');

		// ==========================================
		// STEP 2: SIMULATE DEPOSIT (Set balance directly)
		// ==========================================
		const depositAmount = 1000; // $1000 deposit
		await env.terravest_db
			.prepare(`UPDATE users SET usd_balance = ? WHERE email = ?`)
			.bind(depositAmount, 'canary@test.com')
			.run();

		// Verify deposit
		let user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('canary@test.com')
			.first() as any;
		expect(user.usd_balance).toBe(1000);

		// ==========================================
		// STEP 3: BUY TOKENS
		// ==========================================
		const tokenAmount = 10; // Buy 10 tokens at $50 each = $500
		const buyRes = await worker.fetch(
			new Request('http://localhost/api/buy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					propertyId: 1,
					tokenAmount: tokenAmount,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(buyRes.status).toBe(201);
		const buyData = await buyRes.json() as any;
		expect(buyData.message).toBe('Tokens purchased successfully');
		expect(buyData.totalCost).toBe(500); // 10 × $50

		// Verify balance after buy
		user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('canary@test.com')
			.first() as any;
		expect(user.usd_balance).toBe(500); // 1000 - 500 = 500

		// Verify investment was created
		const investment = await env.terravest_db
			.prepare(`SELECT * FROM investments WHERE user_id = 1 AND property_id = 1`)
			.first() as any;
		expect(investment).toBeDefined();
		expect(investment.token_amount).toBe(10);
		expect(investment.unclaimed_rewards).toBe(0); // No rewards yet
		expect(investment.last_rent_calc_date).toBeDefined(); // Should be set

		// ==========================================
		// STEP 4: SIMULATE TIME PASSING (30 days)
		// ==========================================
		// Update last_rent_calc_date to 30 days ago to simulate 30 days of rewards
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		await env.terravest_db
			.prepare(`UPDATE investments SET last_rent_calc_date = ? WHERE user_id = 1 AND property_id = 1`)
			.bind(thirtyDaysAgo.toISOString())
			.run();

		// ==========================================
		// STEP 5: ACCRUE REWARDS
		// ==========================================
		const accrueRes = await worker.fetch(
			new Request('http://localhost/api/accrue-rewards', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}),
			env,
			createExecutionContext()
		);

		expect(accrueRes.status).toBe(200);
		const accrueData = await accrueRes.json() as any;
		expect(accrueData.success).toBe(true);
		expect(parseFloat(accrueData.rewards_accrued)).toBeGreaterThan(0);

		// Verify rewards were accrued
		// Expected calculation:
		// Property: $10,000, 5% yield, 10% management fee
		// Gross Annual: $10,000 × 0.05 = $500
		// Net Annual: $500 × 0.9 = $450
		// Daily per token: $450 / 200 tokens / 365 = ~$0.00616
		// For 10 tokens over 30 days: $0.00616 × 10 × 30 = ~$1.85
		const investmentAfterAccrue = await env.terravest_db
			.prepare(`SELECT unclaimed_rewards FROM investments WHERE user_id = 1 AND property_id = 1`)
			.first() as any;
		expect(investmentAfterAccrue.unclaimed_rewards).toBeGreaterThan(0);
		expect(investmentAfterAccrue.unclaimed_rewards).toBeGreaterThan(1.5); // Should be around $1.85
		expect(investmentAfterAccrue.unclaimed_rewards).toBeLessThan(2.5); // Allow some margin

		// ==========================================
		// STEP 6: CLAIM REWARDS
		// ==========================================
		const claimRes = await worker.fetch(
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

		expect(claimRes.status).toBe(200);
		const claimData = await claimRes.json() as any;
		expect(claimData.success).toBe(true);
		expect(claimData.message).toContain('Rewards successfully claimed');
		expect(claimData.amount_claimed).toBeGreaterThan(1.5);
		expect(claimData.amount_claimed).toBeLessThan(2.5);

		// Verify balance increased
		user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('canary@test.com')
			.first() as any;
		const expectedBalance = 500 + claimData.amount_claimed;
		expect(user.usd_balance).toBeCloseTo(expectedBalance, 2);

		// Verify unclaimed_rewards were reset
		const investmentAfterClaim = await env.terravest_db
			.prepare(`SELECT unclaimed_rewards FROM investments WHERE user_id = 1 AND property_id = 1`)
			.first() as any;
		expect(investmentAfterClaim.unclaimed_rewards).toBe(0);

		// Verify transaction was created
		const transaction = await env.terravest_db
			.prepare(`SELECT * FROM transactions WHERE user_id = 1 AND type = 'rent_claim'`)
			.first();
		expect(transaction).toBeDefined();

		// ==========================================
		// STEP 7: SELL TOKENS (Partial sale)
		// ==========================================
		const sellAmount = 5; // Sell 5 tokens (half of 10)
		const sellRes = await worker.fetch(
			new Request('http://localhost/api/sell', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					property_id: 1,
					token_amount: sellAmount,
				}),
			}),
			env,
			createExecutionContext()
		);

		expect(sellRes.status).toBe(200);
		const sellData = await sellRes.json() as any;
		expect(sellData.success).toBe(true);
		expect(sellData.message).toContain('Asset sold successfully');
		expect(sellData.amount_added).toBeGreaterThan(0);
		expect(sellData.fee_deducted).toBeGreaterThan(0);

		// Calculate expected net return: 5 tokens × $50 = $250, minus 1.5% fee = $246.25
		const expectedNetReturn = 250 * 0.985; // 1.5% trading fee
		expect(sellData.amount_added).toBeCloseTo(expectedNetReturn, 2);

		// Verify balance increased
		user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('canary@test.com')
			.first() as any;
		expect(user.usd_balance).toBeCloseTo(expectedBalance + expectedNetReturn, 2);

		// Verify investment token amount decreased
		const investmentAfterSell = await env.terravest_db
			.prepare(`SELECT token_amount FROM investments WHERE user_id = 1 AND property_id = 1`)
			.first() as any;
		expect(investmentAfterSell.token_amount).toBe(5); // 10 - 5 = 5

		// Verify property available tokens increased
		const property = await env.terravest_db
			.prepare(`SELECT available_tokens FROM properties WHERE id = 1`)
			.first() as any;
		expect(property.available_tokens).toBe(195); // 200 - 10 (bought) + 5 (sold back) = 195

		// ==========================================
		// FINAL VERIFICATION: Check all balances and states
		// ==========================================
		user = await env.terravest_db
			.prepare(`SELECT usd_balance FROM users WHERE email = ?`)
			.bind('canary@test.com')
			.first() as any;

		// Final balance should be:
		// Initial: $1000
		// - Buy: $500
		// + Claim: ~$1.85
		// + Sell: ~$246.25
		// = ~$748.10
		expect(user.usd_balance).toBeGreaterThan(740);
		expect(user.usd_balance).toBeLessThan(760);

		// Verify investment still exists with remaining tokens
		const finalInvestment = await env.terravest_db
			.prepare(`SELECT token_amount, unclaimed_rewards FROM investments WHERE user_id = 1 AND property_id = 1`)
			.first() as any;
		expect(finalInvestment.token_amount).toBe(5);
		expect(finalInvestment.unclaimed_rewards).toBe(0); // Claimed and reset

		console.log('✅ Canary test completed successfully!');
		console.log(`   Final balance: $${user.usd_balance.toFixed(2)}`);
		console.log(`   Remaining tokens: ${finalInvestment.token_amount}`);
	});
});
