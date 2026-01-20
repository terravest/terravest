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

const jsonHeaders = () => ({
    'Content-Type': 'application/json',
    'CF-Connecting-IP': nextIp(),
});

describe('Auth API (Worker Environment)', () => {
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
        await env.terravest_db.exec(`DELETE FROM email_verification_tokens`);
        await env.terravest_db.exec(`DELETE FROM properties`);
        await env.terravest_db.exec(`DELETE FROM users`);
    });

    describe('POST /api/auth/register', () => {
        it('✅ should register a new user successfully (happy path)', async () => {
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'test@example.com',
                        username: 'testuser',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(201);
            const data = await res.json() as any;
            expect(data.success).toBe(true);
            expect(data.requiresVerification).toBe(true);
            expect(data.token).toBeUndefined();

            const user = await env.terravest_db
                .prepare(`SELECT email_verified, email_verified_at FROM users WHERE email = ?`)
                .bind('test@example.com')
                .first() as any;
            expect(user.email_verified).toBe(0);
            expect(user.email_verified_at).toBeNull();

            const tokenRow = await env.terravest_db
                .prepare(`SELECT user_id, token_hash, used, expires_at FROM email_verification_tokens`)
                .first() as any;
            expect(tokenRow).toBeDefined();
            expect(tokenRow.used).toBe(0);
            expect(tokenRow.token_hash).toBeTruthy();
            expect(tokenRow.expires_at).toBeTruthy();

            expect(logSpy).toHaveBeenCalled();
            const logCalls = logSpy.mock.calls.flat().join(' ');
            expect(logCalls).toContain('Verification URL:');
            logSpy.mockRestore();
        });

        it('❌ should reject duplicate email', async () => {
            // First registration
            await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'duplicate@example.com',
                        username: 'user1',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            // Second registration with same email
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'duplicate@example.com',
                        username: 'user2',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(409);
            const data = await res.json() as any;
            expect(data.error).toBe('Email already registered.');
        });

        it('❌ should reject duplicate username', async () => {
            // First registration
            await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'user1@example.com',
                        username: 'duplicate',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            // Second registration with same username
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'user2@example.com',
                        username: 'duplicate',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(409);
            const data = await res.json() as any;
            expect(data.error).toBe('Username already taken.');
        });

        it('❌ should reject invalid email format', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'invalid-email',
                        username: 'testuser',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
            const data = await res.json() as any;
            expect(data.error).toContain('email');
        });

        it('❌ should reject short password', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'test@example.com',
                        username: 'testuser',
                        password: 'short',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
            const data = await res.json() as any;
            expect(data.error).toContain('Password');
        });

        it('❌ should reject missing fields', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        email: 'test@example.com',
                        // username missing
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('test@example.com', 'testuser', hashedPassword, 'user', 100, 1)
                .run();
        });

        it('✅ should login successfully with email (happy path)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'test@example.com',
                        identifierType: 'email',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.token).toBeDefined();
            expect(data.user.email).toBe('test@example.com');
        });

        it('✅ should login successfully with username (happy path)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'testuser',
                        identifierType: 'username',
                        password: 'password123',
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.token).toBeDefined();
            expect(data.user.username).toBe('testuser');
        });

        it('❌ should reject invalid credentials (wrong password)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'test@example.com',
                        identifierType: 'email',
                        password: 'wrongpassword',
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

        it('❌ should reject invalid credentials (non-existent user)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        identifier: 'nonexistent@example.com',
                        identifierType: 'email',
                        password: 'password123',
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

        it('❌ should reject missing fields', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: 'test@example.com',
                        identifierType: 'email',
                        // password missing
                        turnstileToken: 'test-token',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
        });

        it('❌ should reject unverified user (EMAIL_NOT_VERIFIED)', async () => {
            const hashedPassword = await bcrypt.hash('password456', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance, email_verified) VALUES (?, ?, ?, ?, ?, ?)`)
                .bind('unverified@example.com', 'unverified', hashedPassword, 'user', 0, 0)
                .run();

            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: 'unverified@example.com',
                        identifierType: 'email',
                        password: 'password456',
                        turnstileToken: 'test-token',
                        lang: 'es-419',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(403);
            const data = await res.json() as any;
            expect(data.error).toBe('EMAIL_NOT_VERIFIED');
            expect(data.message).toBe('Verifica tu correo antes de iniciar sesión.');
            expect(data.token).toBeUndefined();
        });
    });

    describe('POST /api/auth/verify-email', () => {
        it('✅ should verify email with a valid token', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, email_verified) VALUES (?, ?, ?, ?, 0)`)
                .bind('verify@example.com', 'verifyuser', hashedPassword, 'user')
                .run();

            const token = 'plain-token';
            const tokenHash = await bcrypt.hash(token, 10);
            await env.terravest_db
                .prepare(`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, datetime('now', '+1 day'), 0)`)
                .bind(1, tokenHash)
                .run();

            const res = await worker.fetch(
                new Request('http://localhost/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, lang: 'en' }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.success).toBe(true);

            const user = await env.terravest_db
                .prepare(`SELECT email_verified, email_verified_at FROM users WHERE email = ?`)
                .bind('verify@example.com')
                .first() as any;
            expect(user.email_verified).toBe(1);
            expect(user.email_verified_at).toBeTruthy();

            const tokenRow = await env.terravest_db
                .prepare(`SELECT used FROM email_verification_tokens WHERE user_id = 1`)
                .first() as any;
            expect(tokenRow.used).toBe(1);
        });

        it('❌ should reject invalid token', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: 'invalid', lang: 'fr' }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
            const data = await res.json() as any;
            expect(data.error).toBe('Lien de vérification invalide ou expiré.');
        });

        it('❌ should reject expired token', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, email_verified) VALUES (?, ?, ?, ?, 0)`)
                .bind('expiredtoken@example.com', 'expiredtoken', hashedPassword, 'user')
                .run();

            const token = 'expired-token';
            const tokenHash = await bcrypt.hash(token, 10);
            await env.terravest_db
                .prepare(`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, datetime('now', '-1 hour'), 0)`)
                .bind(1, tokenHash)
                .run();

            const res = await worker.fetch(
                new Request('http://localhost/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, lang: 'en' }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
            const data = await res.json() as any;
            expect(data.error).toBe('Invalid or expired verification link.');
        });

        it('❌ should reject used token', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, email_verified) VALUES (?, ?, ?, ?, 0)`)
                .bind('usedtoken@example.com', 'usedtoken', hashedPassword, 'user')
                .run();

            const token = 'used-token';
            const tokenHash = await bcrypt.hash(token, 10);
            await env.terravest_db
                .prepare(`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, datetime('now', '+1 day'), 1)`)
                .bind(1, tokenHash)
                .run();

            const res = await worker.fetch(
                new Request('http://localhost/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, lang: 'en' }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
            const data = await res.json() as any;
            expect(data.error).toBe('Invalid or expired verification link.');
        });
    });

    describe('POST /api/auth/resend-verification', () => {
        it('✅ should invalidate previous tokens and create a new one', async () => {
            const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, email_verified) VALUES (?, ?, ?, ?, 0)`)
                .bind('resend@example.com', 'resenduser', hashedPassword, 'user')
                .run();

            await env.terravest_db
                .prepare(`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, datetime('now', '+1 day'), 0)`)
                .bind(1, 'old-hash')
                .run();

            await env.terravest_db
                .prepare(`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, datetime('now', '-2 days'), 0)`)
                .bind(1, 'expired-hash')
                .run();

            const res = await worker.fetch(
                new Request('http://localhost/api/auth/resend-verification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'resend@example.com', lang: 'pt-BR' }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.success).toBe(true);

            const tokens = await env.terravest_db
                .prepare(`SELECT used FROM email_verification_tokens WHERE user_id = 1 ORDER BY id`)
                .all();
            expect(tokens.results?.length).toBe(2);
            expect((tokens.results as any[])[0].used).toBe(1);
            expect((tokens.results as any[])[1].used).toBe(0);
            expect(logSpy).toHaveBeenCalled();
            logSpy.mockRestore();
        });

        it('❌ should enforce rate limit on resend verification', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await env.terravest_db
                .prepare(`INSERT INTO users (email, username, password, role, email_verified) VALUES (?, ?, ?, ?, 0)`)
                .bind('ratelimit@example.com', 'ratelimit', hashedPassword, 'user')
                .run();

            const makeRequest = () =>
                worker.fetch(
                    new Request('http://localhost/api/auth/resend-verification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'CF-Connecting-IP': '203.0.113.10',
                        },
                        body: JSON.stringify({ email: 'ratelimit@example.com' }),
                    }),
                    env,
                    createExecutionContext()
                );

            await makeRequest();
            await makeRequest();
            await makeRequest();
            const res = await makeRequest();

            expect(res.status).toBe(429);
            const data = await res.json() as any;
            expect(data.error).toBe('Too many requests, please try again later.');
        });
    });
});
