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
        await env.terravest_db.exec(`DELETE FROM properties`);
        await env.terravest_db.exec(`DELETE FROM users`);
    });

    describe('POST /api/auth/register', () => {
        it('✅ should register a new user successfully (happy path)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
            expect(data.message).toBe('User registered successfully');
            expect(data.user.email).toBe('test@example.com');
            expect(data.user.username).toBe('testuser');
            expect(data.user.usd_balance).toBe(0);
        });

        it('❌ should reject duplicate email', async () => {
            // First registration
            await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    headers: { 'Content-Type': 'application/json' },
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
            expect(data.error).toBe('Email already registered');
        });

        it('❌ should reject duplicate username', async () => {
            // First registration
            await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    headers: { 'Content-Type': 'application/json' },
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
            expect(data.error).toBe('Username already taken');
        });

        it('❌ should reject invalid email format', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    headers: { 'Content-Type': 'application/json' },
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
                    headers: { 'Content-Type': 'application/json' },
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
                .prepare(`INSERT INTO users (email, username, password, role, usd_balance) VALUES (?, ?, ?, ?, ?)`)
                .bind('test@example.com', 'testuser', hashedPassword, 'user', 100)
                .run();
        });

        it('✅ should login successfully with email (happy path)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: 'test@example.com',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(200);
            const data = await res.json() as any;
            expect(data.token).toBeDefined();
            expect(data.user.email).toBe('test@example.com');
            expect(data.user.usd_balance).toBe(100);
        });

        it('✅ should login successfully with username (happy path)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: 'testuser',
                        password: 'password123',
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: 'test@example.com',
                        password: 'wrongpassword',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(401);
            const data = await res.json() as any;
            expect(data.error).toBe('Invalid credentials');
        });

        it('❌ should reject invalid credentials (non-existent user)', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: 'nonexistent@example.com',
                        password: 'password123',
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(401);
            const data = await res.json() as any;
            expect(data.error).toBe('Invalid credentials');
        });

        it('❌ should reject missing fields', async () => {
            const res = await worker.fetch(
                new Request('http://localhost/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: 'test@example.com',
                        // password missing
                    }),
                }),
                env,
                createExecutionContext()
            );

            expect(res.status).toBe(400);
        });
    });
});
