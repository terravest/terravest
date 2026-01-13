import { Buffer } from 'buffer';
// Buffer polyfill for Cloudflare Workers
globalThis.Buffer = Buffer;

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as Sentry from "@sentry/cloudflare";
import bcrypt from "bcryptjs";

// Route handlers
import { handleRegister, handleLogin, handleMe } from "./routes/auth";
import { handleProperties } from "./routes/properties";
import { handlePortfolio } from "./routes/investments";
import { handleBuy } from "./routes/buy";
import { handleAdminOperations } from "./routes/admin";
import { handleSell } from "./routes/sell";
import { handleClaim } from "./routes/claim";
import { handleWithdraw } from "./routes/withdraw";
import { handleTestReset } from "./routes/test";
import { handleUpload } from "./routes/upload";

// Utilities
import { authMiddleware, requireAuth, adminMiddleware, requireAdmin } from "./lib/auth";
import { generateWasabiAddress, isAddressUnused } from './lib/bitcoin';
import { processPendingDeposits } from './lib/cron';
import { distributeRent } from "./scheduled";
import { accrueRewardsForAll, accrueRewardsForUser } from "./lib/rewards";

// Environment variables interface
export interface Env {
	terravest_db: D1Database;
	TERRAVEST_BUCKET: R2Bucket;
	JWT_SECRET: string;
	SENTRY_DSN: string;
	WASABI_XPUB: string;
	FRONTEND_URL?: string; // Frontend URL for CORS (optional, defaults to localhost for dev)
	ENVIRONMENT?: string; // Environment: 'development', 'test', 'production', 'prod' (optional, defaults to dev)
	NODE_ENV?: string; // Alternative env var name (optional)
}

// Context variables interface (for middleware)
interface Variables {
	user: any;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ==========================================
// MIDDLEWARE (CORS & ERROR HANDLING)
// ==========================================
// SECURITY: Strict CORS policy - only allow whitelisted origins
app.use('/*', async (c, next) => {
	const env = c.env as Env;

	// SECURITY: Determine allowed origins based on environment
	// Production: Only allow FRONTEND_URL
	// Development: Allow localhost only (when FRONTEND_URL is not set)
	const allowedOrigins: string[] = env.FRONTEND_URL
		? [env.FRONTEND_URL] // Production: strict single origin
		: [ // Development: localhost only
			'http://localhost:5173',
			'http://localhost:3000',
			'http://127.0.0.1:5173',
			'http://127.0.0.1:3000'
		];

	// SECURITY: CORS middleware with strict origin whitelist
	// Hono's cors middleware will automatically reject origins not in the whitelist
	return cors({
		origin: (origin) => {
			// SECURITY: Only allow whitelisted origins
			// Return origin if whitelisted, otherwise return null (rejected)
			return allowedOrigins.includes(origin) ? origin : null;
		},
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true, // Required for Authorization header and cookies
		exposeHeaders: ['Content-Length', 'Content-Type'],
		maxAge: 86400, // Cache preflight for 24 hours
	})(c, next);
});

app.onError((err, c) => {
	console.error("🔥 APP ERROR:", err);
	Sentry.captureException(err);
	return c.json({
		error: "Internal Server Error",
		message: err.message || "Something went wrong."
	}, 500);
});

// ==========================================
// TEST ROUTES
// ==========================================

// Bitcoin address generation test
app.get('/test-btc', (c) => {
	try {
		return c.json({
			status: "success",
			adr0: generateWasabiAddress(c.env.WASABI_XPUB, 0),
			adr1: generateWasabiAddress(c.env.WASABI_XPUB, 1)
		});
	} catch (e: any) { return c.json({ error: e.message }, 500); }
});

// Manual cron trigger
app.get('/api/check-payments', async (c) => {
	console.log("👋 Manual payment check triggered!");
	await processPendingDeposits(c.env);
	return c.json({ success: true, message: "Payment check completed." });
});

// Manual reward accrual trigger (for dev/testing)
app.get('/api/accrue-rewards', authMiddleware, async (c) => {
	try {
		const user = c.get('user');
		console.log(`👋 Manual reward accrual triggered for user ${user.id}!`);

		const accrued = await accrueRewardsForUser(c.env, user.id);

		return c.json({
			success: true,
			message: "Rewards accrued successfully.",
			rewards_accrued: accrued.toFixed(4)
		});
	} catch (e: any) {
		return c.json({ error: e.message || "Internal server error" }, 500);
	}
});

// Manual reward accrual for all users (admin/dev only)
app.get('/api/accrue-rewards-all', async (c) => {
	try {
		console.log("👋 Manual reward accrual triggered for all users!");

		const updatedCount = await accrueRewardsForAll(c.env);

		return c.json({
			success: true,
			message: "Rewards accrued for all investments.",
			investments_updated: updatedCount
		});
	} catch (e: any) {
		return c.json({ error: e.message || "Internal server error" }, 500);
	}
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/register', (c) => handleRegister(c.req.raw, c.env));
app.post('/api/auth/login', (c) => handleLogin(c.req.raw, c.env));
app.get('/api/auth/me', (c) => handleMe(c.req.raw, c.env));

app.put('/api/auth/change-password', authMiddleware, async (c) => {
	const user = c.get('user');

	try {
		const body = await c.req.json() as any;
		const { oldPassword, newPassword } = body;

		// Validation
		if (!newPassword || newPassword.length < 8) {
			return c.json({ error: "Password must be at least 8 characters" }, 400);
		}

		// Validate old password
		if (!oldPassword) {
			return c.json({ error: "Old password is required" }, 400);
		}

		// Fetch user's current password
		const dbUser = await c.env.terravest_db
			.prepare('SELECT password FROM users WHERE id = ?')
			.bind(user.id)
			.first();

		if (!dbUser) {
			return c.json({ error: "User not found" }, 404);
		}

		// Verify old password
		const isOldPasswordValid = await bcrypt.compare(oldPassword, dbUser.password as string);
		if (!isOldPasswordValid) {
			return c.json({ error: "Invalid old password" }, 400);
		}

		// Hash new password
		const hashedNewPassword = await bcrypt.hash(newPassword, 10);

		// Update password
		await c.env.terravest_db
			.prepare('UPDATE users SET password = ? WHERE id = ?')
			.bind(hashedNewPassword, user.id)
			.run();

		return c.json({ success: true, message: "Password updated successfully" });
	} catch (e: any) {
		console.error("Change password error:", e);
		return c.json({ error: e.message || "Internal server error" }, 500);
	}
});

// ==========================================
// MARKET & PORTFOLIO ROUTES
// ==========================================
app.all('/api/properties/*', (c) => handleProperties(c.req.raw, c.env));
app.all('/api/properties', (c) => handleProperties(c.req.raw, c.env));
app.get('/api/portfolio', (c) => handlePortfolio(c.req.raw, c.env));

app.post('/api/buy', (c) => handleBuy(c.req.raw, c.env));
app.post('/api/sell', (c) => handleSell(c.req.raw, c.env));
app.all('/api/claim', (c) => handleClaim(c.req.raw, c.env));
app.post('/api/withdraw', (c) => handleWithdraw(c.req.raw, c.env));


// ==========================================
// BITCOIN DEPOSIT SYSTEM (Core Logic)
// ==========================================

/**
 * Create new deposit with gap detection
 * Generates unused Bitcoin address and creates pending deposit record
 */
app.post('/api/deposit', authMiddleware, async (c) => {
	console.log("🛡️ Secure deposit request started");
	try {
		const user = c.get('user');
		const userId = user.id;

		const body = await c.req.json() as any;

		// SECURITY: Explicitly reject userId if present in body (prevent injection attempts)
		if (body.userId || body.user_id) {
			return c.json({ error: 'userId must not be provided in request body' }, 400);
		}

		const { amount } = body;

		// Validate amount
		if (amount === undefined || amount === null) {
			return c.json({ error: 'Missing amount' }, 400);
		}

		// SECURITY: Amount must be positive number
		const amountNum = Number(amount);
		if (isNaN(amountNum) || amountNum <= 0) {
			return c.json({ error: 'Amount must be a positive number' }, 400);
		}

		// Find last used index
		const lastIndexResult = await c.env.terravest_db
			.prepare("SELECT MAX(address_index) as last_index FROM deposits")
			.first();

		let potentialIndex = 0;
		if (lastIndexResult && typeof lastIndexResult.last_index === 'number') {
			potentialIndex = lastIndexResult.last_index + 1;
		}

		console.log(`🔎 Address scan starting. Initial Index: ${potentialIndex}`);

		let btcAddress = "";
		let finalIndex = -1;
		let foundUnused = false;

		// Gap detection (scan 20 addresses ahead)
		for (let i = 0; i < 20; i++) {
			const currentIndex = potentialIndex + i;
			const candidateAddress = generateWasabiAddress(c.env.WASABI_XPUB, currentIndex);

			console.log(`Checking: Index ${currentIndex} -> ${candidateAddress}`);
			const isUnused = await isAddressUnused(candidateAddress);

			if (isUnused) {
				console.log(`✅ UNUSED ADDRESS FOUND: Index ${currentIndex}`);
				btcAddress = candidateAddress;
				finalIndex = currentIndex;
				foundUnused = true;
				break;
			}
		}

		if (!foundUnused) throw new Error("No suitable unused address found. Please try again later.");

		// Save deposit record (Status: Pending)
		// SECURITY: userId is explicitly taken from auth token, not from request body
		const result = await c.env.terravest_db.prepare(`
            INSERT INTO deposits (user_id, amount_usd, address, address_index, status)
            VALUES (?, ?, ?, ?, 'pending')
            RETURNING *
        `).bind(userId, amountNum, btcAddress, finalIndex).first();

		if (!result) throw new Error("Database record error");

		console.log(`🆕 Deposit record created: ID ${result.id}`);

		return c.json({
			success: true,
			data: {
				depositId: result.id,
				address: btcAddress,
				amount: amountNum,
				status: 'pending',
				message: "Send Bitcoin to this address."
			}
		});

	} catch (e: any) {
		console.error("Deposit Error:", e);
		return c.json({ error: e.message }, 500);
	}
});

// Get single deposit status (for polling)
app.get('/api/deposit/:id', authMiddleware, async (c) => {
	const user = c.get('user');
	const userId = user.id;
	const id = c.req.param('id');

	const deposit = await c.env.terravest_db
		.prepare("SELECT * FROM deposits WHERE id = ? AND user_id = ?")
		.bind(id, userId)
		.first();

	if (!deposit) {
		return c.json({ error: 'Deposit not found or unauthorized' }, 404);
	}

	return c.json({ success: true, data: deposit });
});

// Get user's deposit history (user-specific)
app.get('/api/deposits', authMiddleware, async (c) => {
	const user = c.get('user');
	const userId = user.id;

	try {
		const { results } = await c.env.terravest_db
			.prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC")
			.bind(userId)
			.all();

		return c.json({ success: true, data: results });
	} catch (e: any) {
		return c.json({ error: e.message }, 500);
	}
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// List all deposits (Admin panel)
app.get('/api/admin/deposits', authMiddleware, adminMiddleware, async (c) => {
	try {
		const { results } = await c.env.terravest_db
			.prepare(`
                SELECT d.*, u.username, u.email 
                FROM deposits d
                LEFT JOIN users u ON d.user_id = u.id
                ORDER BY d.created_at DESC
            `)
			.all();
		return c.json({ success: true, data: results });
	} catch (e: any) {
		return c.json({ error: e.message }, 500);
	}
});

// Manually approve deposit (credit balance)
app.post('/api/admin/approve-deposit', authMiddleware, adminMiddleware, async (c) => {
	try {
		const body = await c.req.json() as any;
		const depositId = body.depositId || body.id;

		if (!depositId) return c.json({ error: "Deposit ID required" }, 400);

		const db = c.env.terravest_db;
		const deposit = await db.prepare("SELECT * FROM deposits WHERE id = ?").bind(depositId).first();

		if (!deposit) return c.json({ error: "Not found" }, 404);
		if (deposit.status === 'completed') return c.json({ error: "Already completed" }, 400);

		console.log(`✅ ADMIN ONAYI: Deposit ID ${depositId}, Tutar: $${deposit.amount_usd}`);

		await db.batch([
			db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(depositId),
			db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(deposit.amount_usd, deposit.user_id)
		]);

		return c.json({ success: true, message: "Approved & Balance Updated" });

	} catch (e: any) {
		return c.json({ error: e.message }, 500);
	}
});

// Other admin operations (route handler)
app.all('/api/admin/*', (c) => handleAdminOperations(c.req.raw, c.env));


// ==========================================
// TRANSACTION HISTORY (User-specific)
// ==========================================

app.get('/api/transactions', authMiddleware, async (c) => {
	const user = c.get('user');
	const userId = user.id;

	try {
		const { results } = await c.env.terravest_db.prepare(`
            SELECT 
                'deposit' as type,
                id,
                amount_usd as amount,
                status,
                created_at,
                NULL as tx_hash,   
                address as target_address
            FROM deposits 
            WHERE user_id = ?

            UNION ALL

            SELECT 
                'withdrawal' as type,
                id,
                amount,
                status,
                created_at,
                tx_hash,
                address as target_address
            FROM withdrawals 
            WHERE user_id = ?

            ORDER BY created_at DESC
            LIMIT 50
        `).bind(userId, userId).all();

		return c.json({ success: true, data: results });
	} catch (e: any) {
		return c.json({ error: e.message }, 500);
	}
});

// ==========================================
// TEST ROUTES (Development/Test Only)
// ==========================================

/**
 * Test Reset Endpoint
 * 
 * SECURITY: Only available in development/test environments.
 * Returns 404 in production.
 * 
 * Purpose: Clean up test data for authenticated user.
 * Used by E2E tests to start from a clean state.
 * 
 * Method: DELETE /api/test/reset
 * Auth: Required (Bearer token)
 */
app.delete('/api/test/reset', (c) => handleTestReset(c.req.raw, c.env));


// --- EXPORT ---
export default Sentry.withSentry(
	(env) => ({ dsn: env.SENTRY_DSN, sendDefaultPii: true }),
	{
		// 2. FETCH FONKSİYONUNU BU ŞEKİLDE GÜNCELLE
		fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
			const url = new URL(request.url);

			// Eğer istek /api/upload ise, bizim özel handler'ı çalıştır
			if (url.pathname === "/api/upload") {
				return handleUpload(request, env);
			}

			// Diğer tüm istekler için normal Router'a (app) devam et
			return app.fetch(request, env, ctx);
		},

		async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
			try {
				// Route to appropriate handler based on cron schedule
				const cronSchedule = event.cron;

				if (cronSchedule === "*/10 * * * *") {
					// Payment check: runs every 10 minutes
					console.log("🔄 Payment check cron triggered");
					ctx.waitUntil(processPendingDeposits(env));
				} else if (cronSchedule === "0 1 * * *") {
					// Rent distribution: runs daily at 01:00 UTC
					console.log("🔄 Rent distribution cron triggered");
					ctx.waitUntil(distributeRent(env));
				} else {
					console.warn(`Unknown cron schedule: ${cronSchedule}`);
				}
			} catch (e) {
				console.error("Cron Error:", e);
				Sentry.captureException(e);
			}
		},
	}
);