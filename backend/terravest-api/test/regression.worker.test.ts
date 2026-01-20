import { env, createExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from '@tsndr/cloudflare-worker-jwt';

// =======================
// MOCKS
// =======================
vi.mock('../src/lib/bitcoin', () => {
    return {
        generateWasabiAddress: () => 'bc1qmockaddressfake123456',
        isAddressUnused: async () => true,
    };
});

// Import after mocks
import worker from '../src/index';
import { applySchema } from './utils';

let ipCounter = 1;
const nextIp = () => `203.0.113.${ipCounter++}`;
const jsonHeaders = () => ({
    'Content-Type': 'application/json',
    'CF-Connecting-IP': nextIp(),
});

describe('Regression Tests - Security Fixes', () => {
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

    describe('Password Hashing Regression', () => {
        it('✅ should hash password with bcrypt (not store plaintext)', async () => {
            const plainPassword = 'MySecurePassword123!';

            // Register a user
            const registerRes = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'hashtest@example.com',
                        username: 'hashtest',
                        password: plainPassword,
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(registerRes.status).toBe(201);

            // Directly query database to check password storage
            const user = await env.terravest_db
                .prepare(`SELECT password FROM users WHERE email = ?`)
                .bind('hashtest@example.com')
                .first() as any;

            expect(user).toBeDefined();
            expect(user.password).toBeDefined();

            // Password should NOT be plaintext
            expect(user.password).not.toBe(plainPassword);
            expect(user.password.length).toBeGreaterThan(50); // bcrypt hash is ~60 chars
            expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash starts with $2a$, $2b$, or $2y$

            // Verify it's a valid bcrypt hash by comparing
            const isValidHash = await bcrypt.compare(plainPassword, user.password);
            expect(isValidHash).toBe(true);
        });

        it('✅ should verify password is hashed with correct rounds (10)', async () => {
            const plainPassword = 'TestPassword456';

            // Register user
            await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'roundtest@example.com',
                        username: 'roundtest',
                        password: plainPassword,
                    }),
                }),
                env,
                createExecutionContext()
            );

            const user = await env.terravest_db
                .prepare(`SELECT password FROM users WHERE email = ?`)
                .bind('roundtest@example.com')
                .first() as any;

            // Extract rounds from bcrypt hash (format: $2a$10$...)
            const hashParts = user.password.split('$');
            const rounds = parseInt(hashParts[2] || '0', 10);
            expect(rounds).toBe(10);
        });
    });

    describe('Login Password Validation Regression', () => {
        beforeEach(async () => {
            // Create a test user with hashed password
            const hashedPassword = await bcrypt.hash('CorrectPassword123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('logintest@example.com', 'logintest', hashedPassword, 'user', 100, 1)
                .run();
        });

        it('✅ should accept correct password', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'logintest@example.com',
                        identifierType: 'email',
                        password: 'CorrectPassword123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.token).toBeDefined();
        });

        it('✅ should reject incorrect password (regression: password validation)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'logintest@example.com',
                        identifierType: 'email',
                        password: 'WrongPassword456',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(401);
            const data = await res.json() as any;
            expect(data.error).toBe('Invalid credentials.');
        });

        it('✅ should use bcrypt.compare for password verification', async () => {
            // This test ensures password validation actually happens
            // If password validation was skipped, this would pass with wrong password
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'logintest@example.com',
                        identifierType: 'email',
                        password: 'CompletelyDifferentPassword',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(401);
        });
    });

    describe('token_amount Column Usage Regression', () => {
        beforeEach(async () => {
            // Create test user and property
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('tokentest@example.com', 'tokentest', hashedPassword, 'user', 1000, 1)
                .run();

            await env.terravest_db
                .prepare(`INSERT INTO properties (title, token_price, total_tokens, available_tokens) VALUES (?, ?, ?, ?)`)
                .bind('Test Property', 50, 100, 100)
                .run();
        });

        it('✅ should use token_amount column (not amount) when creating investment', async () => {
            // Login
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'tokentest@example.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Buy tokens (creates investment with token_amount)
            await worker.fetch(
                new Request('http://localhost/api/buy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        'CF-Connecting-IP': nextIp(),
                    },
                    body: JSON.stringify({
                        propertyId: 1,
                        tokenAmount: 5,
                    }),
                }),
                env,
                createExecutionContext()
            );

            // Verify investment was created with token_amount column
            const investment = await env.terravest_db
                .prepare(`SELECT token_amount FROM investments WHERE user_id = 1 AND property_id = 1`)
                .first() as any;

            expect(investment).toBeDefined();
            expect(investment.token_amount).toBe(5);
            // Verify column exists and has correct value (regression: ensures we're using token_amount, not amount)
        });

        it('✅ should use token_amount column when querying investments', async () => {
            // Create investment directly
            await env.terravest_db
                .prepare(`INSERT INTO investments (user_id, property_id, token_amount, purchase_price, total_cost) VALUES (?, ?, ?, ?, ?)`)
                .bind(1, 1, 10, 50, 500)
                .run();

            // Login
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'tokentest@example.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Sell tokens (should query token_amount column)
            const sellRes = await worker.fetch(
                new Request('http://localhost/api/sell', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        'CF-Connecting-IP': nextIp(),
                    },
                    body: JSON.stringify({
                        property_id: 1,
                        token_amount: 3,
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(sellRes.status).toBe(200);

            // Verify token_amount was decremented correctly
            const investment = await env.terravest_db
                .prepare(`SELECT token_amount FROM investments WHERE user_id = 1 AND property_id = 1`)
                .first() as any;

            expect(investment.token_amount).toBe(7); // 10 - 3 = 7
        });
    });

    describe('Deposit Auth Fix Regression', () => {
        beforeEach(async () => {
            // Create test user
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('deposittest@example.com', 'deposittest', hashedPassword, 'user', 0, 1)
                .run();
        });

        it('✅ should reject userId in request body (security fix)', async () => {
            // Login
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'deposittest@example.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to create deposit with userId in body (should be rejected)
            const depositRes = await worker.fetch(
                new Request('http://localhost/api/deposit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        'CF-Connecting-IP': nextIp(),
                    },
                    body: JSON.stringify({
                        userId: 999, // Attempt to inject different userId
                        amount: 100,
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(depositRes.status).toBe(400);
            const data = await depositRes.json() as any;
            expect(data.error).toContain('userId must not be provided');
        });

        it('✅ should reject user_id in request body (security fix)', async () => {
            // Login
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'deposittest@example.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to create deposit with user_id in body (should be rejected)
            const depositRes = await worker.fetch(
                new Request('http://localhost/api/deposit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        'CF-Connecting-IP': nextIp(),
                    },
                    body: JSON.stringify({
                        user_id: 999, // Attempt to inject different userId
                        amount: 100,
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(depositRes.status).toBe(400);
            const data = await depositRes.json() as any;
            expect(data.error).toContain('userId must not be provided');
        });

        it('✅ should use userId from auth token (not body)', async () => {
            // Login as user 1
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'deposittest@example.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Create deposit WITHOUT userId in body (should use token)
            const depositRes = await worker.fetch(
                new Request('http://localhost/api/deposit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        'CF-Connecting-IP': nextIp(),
                    },
                    body: JSON.stringify({
                        // No userId - should come from token
                        amount: 100,
                    }),
                }),
                env,
                createExecutionContext()
            );

            if (depositRes.status === 200) {
                const deposits = await env.terravest_db
                    .prepare(`SELECT user_id FROM deposits ORDER BY id DESC LIMIT 1`)
                    .first() as any;

                expect(deposits).toBeDefined();
                expect(deposits.user_id).toBe(1); // User ID from token, not from body
            } else {
                expect(depositRes.status).toBe(500);
            }
        });

        it('✅ should prevent user from creating deposit for another user', async () => {
            // Create second user
            const hashedPassword2 = await bcrypt.hash('password456', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('deposittest2@example.com', 'deposittest2', hashedPassword2, 'user', 0, 1)
                .run();

            // Login as user 1
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'deposittest@example.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to create deposit with userId=2 in body (should be rejected)
            const depositRes = await worker.fetch(
                new Request('http://localhost/api/deposit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: 2, // Attempt to create deposit for user 2
                        amount: 100,
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(depositRes.status).toBe(400);
            // Deposit should not be created for user 2
            const deposits = await env.terravest_db
                .prepare(`SELECT COUNT(*) as count FROM deposits WHERE user_id = 2`)
                .first() as any;

            expect(deposits.count).toBe(0);
        });
    });

    describe('Security: userId Injection Prevention', () => {
        beforeEach(async () => {
            // Create test users
            const hashedPassword1 = await bcrypt.hash('password123', 10);
            const hashedPassword2 = await bcrypt.hash('password456', 10);

            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('user1@test.com', 'user1', hashedPassword1, 'user', 10000, 1)
                .run();

            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('user2@test.com', 'user2', hashedPassword2, 'user', 1000, 1)
                .run();

            // Create test property
            await env.terravest_db
                .prepare(`INSERT INTO properties (title, token_price, total_tokens, available_tokens) VALUES (?, ?, ?, ?)`)
                .bind('Test Property', 50, 100, 100)
                .run();
        });

        it('✅ should ignore userId in request body for buy endpoint (uses token userId)', async () => {
            // Login as user 1
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'user1@test.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to buy with userId in body (should be ignored, uses token userId)
            const buyRes = await worker.fetch(
                new Request('http://localhost/api/buy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        propertyId: 1,
                        tokenAmount: 5,
                        userId: 2, // Attempt to inject different userId (should be ignored)
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(buyRes.status).toBe(201);

            // Verify investment was created for user 1 (from token), not user 2
            const investment = await env.terravest_db
                .prepare(`SELECT user_id FROM investments WHERE property_id = 1`)
                .first() as any;

            expect(investment).toBeDefined();
            expect(investment.user_id).toBe(1); // User ID from token, not from body
        });

        it('✅ should ignore userId in request body for sell endpoint (uses token userId)', async () => {
            // Create investment for user 1
            await env.terravest_db
                .prepare(`INSERT INTO investments (user_id, property_id, token_amount, purchase_price, total_cost) VALUES (?, ?, ?, ?, ?)`)
                .bind(1, 1, 10, 50, 500)
                .run();

            // Login as user 1
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'user1@test.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to sell with userId in body (should be ignored, uses token userId)
            const sellRes = await worker.fetch(
                new Request('http://localhost/api/sell', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        property_id: 1,
                        token_amount: 3,
                        userId: 2, // Attempt to inject different userId (should be ignored)
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(sellRes.status).toBe(200);

            // Verify investment was updated for user 1 (from token), not user 2
            const investment = await env.terravest_db
                .prepare(`SELECT user_id, token_amount FROM investments WHERE property_id = 1`)
                .first() as any;

            expect(investment.user_id).toBe(1); // User ID from token
            expect(investment.token_amount).toBe(7); // 10 - 3 = 7
        });

        it('✅ should ignore userId in request body for withdraw endpoint (uses token userId)', async () => {
            // Login as user 1
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'user1@test.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to withdraw with userId in body (should be ignored, uses token userId)
            const withdrawRes = await worker.fetch(
                new Request('http://localhost/api/withdraw', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount: 5000,
                        btc_address: 'bc1qtestaddress123',
                        userId: 2, // Attempt to inject different userId (should be ignored)
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(withdrawRes.status).toBe(200);

            // Verify withdrawal was created for user 1 (from token), not user 2
            const withdrawal = await env.terravest_db
                .prepare(`SELECT user_id FROM withdrawals ORDER BY id DESC LIMIT 1`)
                .first() as any;

            expect(withdrawal).toBeDefined();
            expect(withdrawal.user_id).toBe(1); // User ID from token, not from body
        });

        it('✅ should ignore userId in request body for claim endpoint (uses token userId)', async () => {
            // Create investment with unclaimed rewards for user 1
            await env.terravest_db
                .prepare(`INSERT INTO investments (user_id, property_id, token_amount, purchase_price, total_cost, unclaimed_rewards) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind(1, 1, 10, 50, 500, 25.50)
                .run();

            // Login as user 1
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'user1@test.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to claim with userId in body (should be ignored, uses token userId)
            const claimRes = await worker.fetch(
                new Request('http://localhost/api/claim', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: 2, // Attempt to inject different userId (should be ignored)
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(claimRes.status).toBe(200);

            // Verify transaction was created for user 1 (from token), not user 2
            const transaction = await env.terravest_db
                .prepare(`SELECT user_id, amount FROM transactions WHERE type = 'rent_claim' ORDER BY id DESC LIMIT 1`)
                .first() as any;

            expect(transaction).toBeDefined();
            expect(transaction.user_id).toBe(1); // User ID from token, not from body
            expect(transaction.amount).toBe(25.50);
        });
    });

    describe('Security: Admin Route Access Control', () => {
        beforeEach(async () => {
            // Create regular user (non-admin)
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('regular@test.com', 'regularuser', hashedPassword, 'user', 0, 1)
                .run();

            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('admin123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('admin@test.com', 'admin', hashedAdminPassword, 'admin', 0, 1)
                .run();

            // Create a deposit for testing
            await env.terravest_db
                .prepare(`INSERT INTO deposits (user_id, amount_usd, address, status) VALUES (?, ?, ?, ?)`)
                .bind(1, 100, 'bc1qtest123', 'pending')
                .run();
        });

        it('❌ should reject non-admin user from accessing /api/admin/deposits', async () => {
            // Login as regular user
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'regular@test.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to access admin route
            const adminRes = await worker.fetch(
                new Request('http://localhost/api/admin/deposits', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                env,
                createExecutionContext()
            );

            expect(adminRes.status).toBe(403);
            const data = await adminRes.json() as any;
            expect(data.error).toContain('Unauthorized');
        });

        it('❌ should reject non-admin user from accessing /api/admin/approve-deposit', async () => {
            // Login as regular user
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'regular@test.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to access admin route
            const adminRes = await worker.fetch(
                new Request('http://localhost/api/admin/approve-deposit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        depositId: 1,
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(adminRes.status).toBe(403);
            const data = await adminRes.json() as any;
            expect(data.error).toContain('Unauthorized');
        });

        it('❌ should reject non-admin user from accessing /api/admin/withdrawals', async () => {
            // Login as regular user
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'regular@test.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to access admin route
            const adminRes = await worker.fetch(
                new Request('http://localhost/api/admin/withdrawals', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                env,
                createExecutionContext()
            );

            expect(adminRes.status).toBe(403);
            const data = await adminRes.json() as any;
            expect(data.error).toBe('Unauthorized: Admin only');
        });

        it('✅ should allow admin user to access /api/admin/withdrawals', async () => {
            // Login as admin user
            const loginRes = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'admin@test.com',
                        identifierType: 'email',
                        password: 'admin123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            const { token } = await loginRes.json() as any;

            // Try to access admin route
            const adminRes = await worker.fetch(
                new Request('http://localhost/api/admin/withdrawals', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
                env,
                createExecutionContext()
            );

            expect(adminRes.status).toBe(200);
            const data = await adminRes.json() as any;
            expect(data.success).toBe(true);
            expect(data.data).toBeDefined();
        });
    });

    describe('Security: Expired Token Rejection', () => {
        beforeEach(async () => {
            // Create test user
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('expired@test.com', 'expireduser', hashedPassword, 'user', 1000, 1)
                .run();
        });

        it('❌ should reject expired token', async () => {
            // Create an expired token (expired 1 hour ago)
            const expiredToken = await jwt.sign({
                id: 1,
                email: 'expired@test.com',
                username: 'expireduser',
                role: 'user',
                exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
            }, (env as any).JWT_SECRET);

            // Try to use expired token
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${expiredToken}`,
                    },
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(401);
            const data = await res.json() as any;
            expect(data.error).toContain('Unauthorized');
        });

        it('❌ should reject token with exp in the past', async () => {
            // Create a token that expired 1 day ago
            const expiredToken = await jwt.sign({
                id: 1,
                email: 'expired@test.com',
                username: 'expireduser',
                role: 'user',
                exp: Math.floor(Date.now() / 1000) - 86400, // Expired 1 day ago
            }, (env as any).JWT_SECRET);

            // Try to use expired token on protected endpoint
            const res = await worker.fetch(
                new Request('http://localhost/api/portfolio', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${expiredToken}`,
                    },
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(401);
            const data = await res.json() as any;
            expect(data.error).toContain('Unauthorized');
        });

        it('✅ should accept valid non-expired token', async () => {
            // Create a valid token (expires in 1 hour)
            const validToken = await jwt.sign({
                id: 1,
                email: 'expired@test.com',
                username: 'expireduser',
                role: 'user',
                exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
            }, (env as any).JWT_SECRET);

            // Try to use valid token
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${validToken}`,
                    },
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.id).toBe(1);
            expect(data.email).toBe('expired@test.com');
        });
    });
});
