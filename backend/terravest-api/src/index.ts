import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;
import { processPendingDeposits } from './lib/cron';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as Sentry from "@sentry/cloudflare";
import { handleRegister, handleLogin, handleMe } from "./routes/auth";
import { handleProperties } from "./routes/properties";
import { handlePortfolio } from "./routes/investments";
import { handleBuy } from "./routes/buy";
import { handleAdminOperations } from "./routes/admin";
// import { handleDeposits } from "./routes/deposits"; // ❌ İPTAL: Manuel tanımladık
import { handleSell } from "./routes/sell";
import { handleClaim } from "./routes/claim";
import { handleWithdraw } from "./routes/withdraw";
import { distributeRent } from "./scheduled";
import { requireAuth } from "./middleware/auth";
import { generateDepositAddress, isAddressUnused } from './lib/bitcoin';

export interface Env {
	terravest_db: D1Database;
	JWT_SECRET: string;
	SENTRY_DSN: string;
}

const app = new Hono<{ Bindings: Env }>();

// --- CORS & ERROR HANDLING ---
app.use('/*', cors({
	origin: '*',
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
}));

app.onError((err, c) => {
	console.error("🔥 APP ERROR:", err);
	Sentry.captureException(err);
	return c.json({
		error: "Internal Server Error",
		message: err.message || "Something went wrong."
	}, 500);
});

// --- GENEL ROTALAR ---

// Test Endpointleri
app.get('/test-btc', (c) => {
	try {
		return c.json({
			status: "success",
			adr0: generateDepositAddress(0),
			adr1: generateDepositAddress(1)
		});
	} catch (e: any) { return c.json({ error: e.message }, 500); }
});

app.get('/api/check-payments', async (c) => {
	console.log("👋 Manuel tetikleme isteği alındı!");
	await processPendingDeposits(c.env);
	return c.json({ success: true, message: "Ödeme kontrolü tetiklendi." });
});

// Auth
app.post('/api/auth/register', (c) => handleRegister(c.req.raw, c.env));
app.post('/api/auth/login', (c) => handleLogin(c.req.raw, c.env));
app.get('/api/auth/me', (c) => handleMe(c.req.raw, c.env));
app.put('/api/auth/change-password', async (c) => {
	const auth = await requireAuth(c.req.raw, c.env);
	if (auth instanceof Response) return auth;
	const body = await c.req.json() as any;
	if (!body.newPassword || body.newPassword.length < 8) return c.json({ error: "Min 8 chars" }, 400);
	await c.env.terravest_db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(body.newPassword, (auth.user as any).id).run();
	return c.json({ success: true });
});

// Market & Portfolio
app.all('/api/properties/*', (c) => handleProperties(c.req.raw, c.env));
app.all('/api/properties', (c) => handleProperties(c.req.raw, c.env));
app.get('/api/portfolio', (c) => handlePortfolio(c.req.raw, c.env));
app.post('/api/buy', (c) => handleBuy(c.req.raw, c.env));
app.post('/api/sell', (c) => handleSell(c.req.raw, c.env));
app.post('/api/claim', (c) => handleClaim(c.req.raw, c.env));
app.post('/api/withdraw', (c) => handleWithdraw(c.req.raw, c.env));

// ==========================================
// 💰 BITCOIN DEPOSIT SİSTEMİ (Core Logic)
// ==========================================

// 1. YENİ DEPOSIT OLUŞTUR (POST) - Gap Detection Dahil
app.post('/api/deposit', async (c) => {
	console.log("🛡️ GÜVENLİ DEPOSIT İSTEĞİ BAŞLADI");
	try {
		const body = await c.req.json() as any;
		const { userId, amount } = body;

		if (!userId || !amount) return c.json({ error: 'Missing userId or amount' }, 400);

		// Son kullanılan index'i bul
		const lastIndexResult = await c.env.terravest_db
			.prepare("SELECT MAX(address_index) as last_index FROM deposits")
			.first();

		let potentialIndex = 0;
		if (lastIndexResult && typeof lastIndexResult.last_index === 'number') {
			potentialIndex = lastIndexResult.last_index + 1;
		}

		console.log(`🔎 Tarama başlangıç: ${potentialIndex}`);

		let btcAddress = "";
		let finalIndex = -1;
		let foundUnused = false;

		// Gap Detection (20 Adres İleri Tara)
		for (let i = 0; i < 20; i++) {
			const currentIndex = potentialIndex + i;
			const candidateAddress = generateDepositAddress(currentIndex);

			console.log(`Checking Index ${currentIndex}...`);
			const isUnused = await isAddressUnused(candidateAddress);

			if (isUnused) {
				console.log(`✅ TEMİZ ADRES: Index ${currentIndex}`);
				btcAddress = candidateAddress;
				finalIndex = currentIndex;
				foundUnused = true;
				break;
			}
		}

		if (!foundUnused) throw new Error("Uygun boş adres bulunamadı.");

		// Kaydet
		const result = await c.env.terravest_db.prepare(`
            INSERT INTO deposits (user_id, amount_usd, address, address_index, status)
            VALUES (?, ?, ?, ?, 'pending')
            RETURNING *
        `).bind(userId, amount, btcAddress, finalIndex).first();

		console.log(`🆕 Sipariş Kaydedildi: ID ${result.id}`);

		return c.json({ success: true, data: { depositId: result.id, address: btcAddress, amount, status: 'pending' } });

	} catch (e: any) {
		console.error("Deposit Error:", e);
		return c.json({ error: e.message }, 500);
	}
});

// 2. TEKİL SİPARİŞ DURUMU (Polling için)
app.get('/api/deposit/:id', async (c) => {
	const id = c.req.param('id');
	const deposit = await c.env.terravest_db.prepare("SELECT * FROM deposits WHERE id = ?").bind(id).first();
	return deposit ? c.json({ success: true, data: deposit }) : c.json({ error: 'Not found' }, 404);
});

// 3. İŞLEM GEÇMİŞİ (GET - Çoğul)
app.get('/api/deposits', async (c) => {
	const userId = c.req.query('userId');
	console.log(`🕵️‍♂️ GEÇMİŞ İSTEĞİ: UserID '${userId}'`);

	if (!userId) return c.json({ success: false, error: 'User ID required' }, 400);

	try {
		const { results } = await c.env.terravest_db
			.prepare("SELECT * FROM deposits WHERE user_id = ? OR user_id = CAST(? AS INTEGER) ORDER BY created_at DESC")
			.bind(userId, userId)
			.all();

		console.log(`✅ SONUÇ: ${results.length} kayıt.`);
		return c.json({ success: true, data: results });
	} catch (e: any) {
		return c.json({ error: e.message }, 500);
	}
});

// ==========================================
// 👑 ADMIN ROUTE'LARI (YENİ EKLENDİ)
// ==========================================

// A. Tüm Depositleri Listele (Admin Paneli İçin)
// ==========================================
// 👑 ADMIN ROUTE'LARI (GÜVENLİ VERSİYON)
// ==========================================

// A. Tüm Depositleri Listele
app.get('/api/admin/deposits', async (c) => {
	// 🔒 1. GÜVENLİK KONTROLÜ: Oturum var mı?
	const auth = await requireAuth(c.req.raw, c.env);
	if (auth instanceof Response) return auth; // Oturum yoksa hata dön

	// 🔒 2. YETKİ KONTROLÜ: Admin mi?
	const user = auth.user as any;
	// Eğer user tablosunda 'role' sütunu varsa burayı açabilirsin:
	if (user.role !== 'admin') {
		return c.json({ error: "Unauthorized access. Admins only." }, 403);
	}

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

// B. Manuel Deposit Onayla (Bakiye Yükle)
app.post('/api/admin/approve-deposit', async (c) => {
	// 🔒 1. GÜVENLİK KONTROLÜ
	const auth = await requireAuth(c.req.raw, c.env);
	if (auth instanceof Response) return auth;

	// 🔒 2. YETKİ KONTROLÜ
	const user = auth.user as any;
	if (user.role !== 'admin') {
		return c.json({ error: "Unauthorized access." }, 403);
	}

	try {
		const body = await c.req.json() as any;
		console.log("📩 ADMIN ONAY İSTEĞİ GELDİ. Body:", body);

		const depositId = body.depositId || body.id || body.orderId;

		if (!depositId) {
			return c.json({ error: "Deposit ID required" }, 400);
		}

		const db = c.env.terravest_db;
		const deposit = await db.prepare("SELECT * FROM deposits WHERE id = ?").bind(depositId).first();

		if (!deposit) return c.json({ error: "Not found" }, 404);
		if (deposit.status === 'completed') return c.json({ error: "Already completed" }, 400);

		console.log(`✅ ONAYLANIYOR: Deposit ID ${depositId}, Tutar: $${deposit.amount_usd}`);

		await db.batch([
			db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(depositId),
			db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(deposit.amount_usd, deposit.user_id)
		]);

		return c.json({ success: true, message: "Approved & Balance Updated" });

	} catch (e: any) {
		console.error("HATA:", e);
		return c.json({ error: e.message }, 500);
	}
});

// Diğer Admin İşlemleri (Mevcut)
app.all('/api/admin/*', (c) => handleAdminOperations(c.req.raw, c.env));

// --- EXPORT ---
export default Sentry.withSentry(
	(env) => ({ dsn: env.SENTRY_DSN, sendDefaultPii: true, debug: true }),
	{
		fetch: app.fetch,
		async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
			try {
				ctx.waitUntil(distributeRent(env));
				ctx.waitUntil(processPendingDeposits(env));
			} catch (e) {
				console.error("Cron Error:", e);
				Sentry.captureException(e);
			}
		},
	}
);