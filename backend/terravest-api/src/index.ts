import { Buffer } from 'buffer';
// Buffer polyfill for Cloudflare Workers
globalThis.Buffer = Buffer;

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers'; // ✅ Added Security Headers
import * as Sentry from "@sentry/cloudflare";
import bcrypt from "bcryptjs";
import { rateLimiter } from "hono-rate-limiter";

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
	TURNSTILE_SECRET: string;
	JWT_SECRET: string;
	SENTRY_DSN: string;
	WASABI_XPUB: string;
	FRONTEND_URL?: string;
	ENVIRONMENT?: string;
	NODE_ENV?: string;
}

// Context variables interface
interface Variables {
	user: any;
}

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ==========================================
// 🛡️ MIDDLEWARE: SECURITY HEADERS (HELMET)
// ==========================================
// Adds security headers like X-XSS-Protection, X-Frame-Options, etc.
app.use('*', secureHeaders({
	xXssProtection: "1; mode=block",
	xFrameOptions: "DENY",
	xContentTypeOptions: "nosniff",
	strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
	referrerPolicy: "strict-origin-when-cross-origin",
	contentSecurityPolicy: {
		defaultSrc: ["'self'"],
		imgSrc: ["'self'", "data:", "https://terravest-images.*"],
	}
}));

// ==========================================
// MIDDLEWARE (CORS & ERROR HANDLING)
// ==========================================
app.use('/*', async (c, next) => {
	const env = c.env as Env;

	// Determine allowed origins based on environment
	const allowedOrigins: string[] = env.FRONTEND_URL
		? [env.FRONTEND_URL] // Production: Strict
		: [                  // Development: Allow local
			'http://localhost:5173',
			'http://localhost:3000',
			'http://127.0.0.1:5173',
			'http://127.0.0.1:3000'
		];

	return cors({
		origin: (origin) => {
			return allowedOrigins.includes(origin) ? origin : null;
		},
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		exposeHeaders: ['Content-Length', 'Content-Type'],
		maxAge: 86400,
	})(c, next);
});

// GLOBAL ERROR HANDLER
app.onError((err, c) => {
	console.error("🔥 APP ERROR:", err);

	// Report to Sentry
	Sentry.captureException(err);

	// Secure Error Handling:
	// Only show detailed errors in development. In production, show generic message.
	const isDev = c.env.ENVIRONMENT === 'development';

	return c.json({
		error: "Internal Server Error",
		message: isDev ? (err.message || "Unknown error") : "Something went wrong. Please try again later."
	}, 500);
});

// ==========================================
// 🛡️ SECURITY MIDDLEWARE (LAZY RATE LIMITING)
// ==========================================
// Lazy initialization is required for Cloudflare Workers (no global timers allowed on startup)
let limiterMiddleware: any;

const getLimiter = () => {
	if (!limiterMiddleware) {
		limiterMiddleware = rateLimiter({
			windowMs: 15 * 60 * 1000, // 15 minutes
			limit: 10, // Max requests per IP per window
			standardHeaders: true,
			keyGenerator: (c) => c.req.header('CF-Connecting-IP') || "unknown",
			message: { error: "Too many attempts, please try again later." }
		});
	}
	return limiterMiddleware;
};

// Apply rate limiting to Auth & Deposit routes
app.use('/api/auth/*', async (c, next) => {
	const limiter = getLimiter();
	return limiter(c, next);
});

app.use('/api/deposit', async (c, next) => {
	const limiter = getLimiter();
	return limiter(c, next);
});

// ==========================================
// TEST ROUTES
// ==========================================

app.get('/test-btc', (c) => {
	try {
		return c.json({
			status: "success",
			adr0: generateWasabiAddress(c.env.WASABI_XPUB, 0),
			adr1: generateWasabiAddress(c.env.WASABI_XPUB, 1)
		});
	} catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.get('/api/check-payments', async (c) => {
	// Manually trigger deposit check (Cron job logic)
	await processPendingDeposits(c.env);
	return c.json({ success: true, message: "Payment check completed." });
});

app.get('/api/accrue-rewards', authMiddleware, async (c) => {
	try {
		const user = c.get('user');
		const accrued = await accrueRewardsForUser(c.env, user.id);
		return c.json({ success: true, message: "Rewards accrued.", rewards_accrued: accrued.toFixed(4) });
	} catch (e: any) {
		return c.json({ error: e.message || "Internal server error" }, 500);
	}
});

app.get('/api/accrue-rewards-all', async (c) => {
	try {
		const updatedCount = await accrueRewardsForAll(c.env);
		return c.json({ success: true, message: "Rewards accrued for all.", investments_updated: updatedCount });
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

		if (!newPassword || newPassword.length < 8) return c.json({ error: "Password must be at least 8 characters" }, 400);
		if (!oldPassword) return c.json({ error: "Old password is required" }, 400);

		const dbUser = await c.env.terravest_db.prepare('SELECT password FROM users WHERE id = ?').bind(user.id).first();
		if (!dbUser) return c.json({ error: "User not found" }, 404);

		const isOldPasswordValid = await bcrypt.compare(oldPassword, dbUser.password as string);
		if (!isOldPasswordValid) return c.json({ error: "Invalid old password" }, 400);

		const hashedNewPassword = await bcrypt.hash(newPassword, 10);
		await c.env.terravest_db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashedNewPassword, user.id).run();

		return c.json({ success: true, message: "Password updated successfully" });
	} catch (e: any) {
		console.error("Change password error:", e);
		return c.json({ error: "Internal server error" }, 500);
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
// BITCOIN DEPOSIT SYSTEM
// ==========================================
app.post('/api/deposit', authMiddleware, async (c) => {
	try {
		const user = c.get('user');
		const userId = user.id;
		const body = await c.req.json() as any;

		// Security check: reject if userId is spoofed in body
		if (body.userId || body.user_id) return c.json({ error: 'userId must not be provided in request body' }, 400);

		const { amount } = body;
		const amountNum = Number(amount);
		if (isNaN(amountNum) || amountNum <= 0) return c.json({ error: 'Amount must be a positive number' }, 400);

		// Find the last used address index
		const lastIndexResult = await c.env.terravest_db.prepare("SELECT MAX(address_index) as last_index FROM deposits").first();
		let potentialIndex = 0;
		if (lastIndexResult && typeof lastIndexResult.last_index === 'number') potentialIndex = lastIndexResult.last_index + 1;

		let btcAddress = "";
		let finalIndex = -1;
		let foundUnused = false;

		// Gap detection loop (Scans ahead for unused addresses)
		for (let i = 0; i < 20; i++) {
			const currentIndex = potentialIndex + i;
			const candidateAddress = generateWasabiAddress(c.env.WASABI_XPUB, currentIndex);

			const isUnused = await isAddressUnused(candidateAddress);

			if (isUnused) {
				btcAddress = candidateAddress;
				finalIndex = currentIndex;
				foundUnused = true;
				break;
			}
		}

		if (!foundUnused) throw new Error("No suitable unused address found. Please try again later.");

		const result = await c.env.terravest_db.prepare(`
            INSERT INTO deposits (user_id, amount_usd, address, address_index, status)
            VALUES (?, ?, ?, ?, 'pending')
            RETURNING *
        `).bind(userId, amountNum, btcAddress, finalIndex).first();

		if (!result) throw new Error("Database record error");

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

app.get('/api/deposit/:id', authMiddleware, async (c) => {
	const user = c.get('user');
	const userId = user.id;
	const id = c.req.param('id');

	const deposit = await c.env.terravest_db
		.prepare("SELECT * FROM deposits WHERE id = ? AND user_id = ?")
		.bind(id, userId)
		.first();

	if (!deposit) return c.json({ error: 'Deposit not found or unauthorized' }, 404);
	return c.json({ success: true, data: deposit });
});

app.get('/api/deposits', authMiddleware, async (c) => {
	const user = c.get('user');
	try {
		const { results } = await c.env.terravest_db
			.prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC")
			.bind(user.id)
			.all();
		return c.json({ success: true, data: results });
	} catch (e: any) { return c.json({ error: e.message }, 500); }
});

// ==========================================
// ADMIN ROUTES
// ==========================================
app.get('/api/admin/deposits', authMiddleware, adminMiddleware, async (c) => {
	try {
		const { results } = await c.env.terravest_db.prepare(`
            SELECT d.*, u.username, u.email 
            FROM deposits d
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
        `).all();
		return c.json({ success: true, data: results });
	} catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.post('/api/admin/approve-deposit', authMiddleware, adminMiddleware, async (c) => {
	try {
		const body = await c.req.json() as any;
		const depositId = body.depositId || body.id;
		if (!depositId) return c.json({ error: "Deposit ID required" }, 400);

		const db = c.env.terravest_db;
		const deposit = await db.prepare("SELECT * FROM deposits WHERE id = ?").bind(depositId).first();

		if (!deposit) return c.json({ error: "Not found" }, 404);
		if (deposit.status === 'completed') return c.json({ error: "Already completed" }, 400);

		// AUDIT LOG (Important for Admin Actions)
		console.log(`AUDIT: Admin approved deposit ${depositId} ($${deposit.amount_usd}) for user ${deposit.user_id}`);

		// SECURITY FIX: Check if deposit is still pending before processing
		if (deposit.status !== 'pending') {
			return c.json({ error: `Deposit is already ${deposit.status}` }, 400);
		}

		await db.batch([
			// SECURITY FIX: Only update if still pending (prevents double processing)
			db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'").bind(depositId),
			db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(deposit.amount_usd, deposit.user_id)
		]);

		// Verify the deposit was actually updated
		const verifyDeposit = await db.prepare("SELECT status FROM deposits WHERE id = ?").bind(depositId).first();
		if (verifyDeposit?.status !== 'completed') {
			return c.json({ error: "Deposit was already processed by another request" }, 409);
		}

		return c.json({ success: true, message: "Approved & Balance Updated" });
	} catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.all('/api/admin/*', (c) => handleAdminOperations(c.req.raw, c.env));

// ==========================================
// TRANSACTION HISTORY
// ==========================================
app.get('/api/transactions', authMiddleware, async (c) => {
	const user = c.get('user');
	try {
		const { results } = await c.env.terravest_db.prepare(`
            SELECT 'deposit' as type, id, amount_usd as amount, status, created_at, NULL as tx_hash, address as target_address
            FROM deposits WHERE user_id = ?
            UNION ALL
            SELECT 'withdrawal' as type, id, amount, status, created_at, tx_hash, address as target_address
            FROM withdrawals WHERE user_id = ?
            ORDER BY created_at DESC LIMIT 50
        `).bind(user.id, user.id).all();
		return c.json({ success: true, data: results });
	} catch (e: any) { return c.json({ error: e.message }, 500); }
});

// ==========================================
// TEST RESET (Development Only)
// ==========================================
app.delete('/api/test/reset', (c) => handleTestReset(c.req.raw, c.env));

// --- EXPORT ---
export default Sentry.withSentry(
	(env) => ({ dsn: env.SENTRY_DSN, sendDefaultPii: true }),
	{
		// Custom Fetch Handler
		fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
			const url = new URL(request.url);

			// Handle image uploads via custom handler (bypass Hono router for file stream)
			if (url.pathname === "/api/upload") {
				return handleUpload(request, env);
			}

			// Pass everything else to Hono router
			return app.fetch(request, env, ctx);
		},

		// Cron Job Handler
		async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
			try {
				const cronSchedule = event.cron;

				// 1. Payment Check (Every 10 mins)
				if (cronSchedule === "*/10 * * * *") {
					ctx.waitUntil(processPendingDeposits(env));
				}
				// 2. Rent Distribution (Daily at 01:00 UTC)
				else if (cronSchedule === "0 1 * * *") {
					ctx.waitUntil(distributeRent(env));
				}
				else {
					console.warn(`Unknown cron schedule: ${cronSchedule}`);
				}
			} catch (e) {
				console.error("Cron Error:", e);
				Sentry.captureException(e);
			}
		},
	}
);