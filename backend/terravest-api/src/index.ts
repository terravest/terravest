import { handleRegister, handleLogin } from "./routes/auth";
import { handleProperties } from "./routes/properties";
import { handlePortfolio } from "./routes/investments";
import { handleBuy } from "./routes/buy";
import { handleAdminOperations } from "./routes/admin";
import { handleDeposits } from "./routes/deposits";
import { handleSell } from "./routes/sell";
import { handleClaim } from "./routes/claim";
import { distributeRent } from "./scheduled"; // <-- Kira Dağıtımı için
import { requireAuth } from "./middleware/auth"; // Auth kontrolü için

export interface Env {
	terravest_db: D1Database;
	JWT_SECRET: string;
}

// Mempool API Tipi (Ödeme Doğrulama için)
interface BitcoinTx {
	txid: string;
	vout: { scriptpubkey_address: string; value: number }[];
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// --- CORS HEADERS ---
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, HEAD, POST, DELETE, PUT, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		};

		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		// Yanıtı CORS headerları ile sarmalayan yardımcı fonksiyon
		const responseWithCors = (response: Response) => {
			const newHeaders = new Headers(response.headers);
			Object.entries(corsHeaders).forEach(([key, value]) => {
				newHeaders.set(key, value);
			});
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: newHeaders
			});
		};

		try {
			let response: Response;

			// --- CRON TEST TRIGGER (Manuel Tetikleme) ---
			if (url.pathname === "/api/cron/test") {
				await distributeRent(env);
				response = new Response(JSON.stringify({ message: "Rent Distributed Manually!" }), {
					status: 200,
					headers: { "Content-Type": "application/json" }
				});
			}

			// --- AUTH ROUTES ---
			else if (url.pathname === "/api/auth/register") response = await handleRegister(request, env);
			else if (url.pathname === "/api/auth/login") response = await handleLogin(request, env);

			// --- CHANGE PASSWORD (YENİ) ---
			else if (url.pathname === "/api/auth/change-password" && request.method === "PUT") {
				const auth = await requireAuth(request, env);
				if (auth instanceof Response) {
					response = auth;
				} else {
					const user = auth.user as any;
					const { newPassword } = await request.json() as any;
					if (!newPassword || newPassword.length < 8) {
						response = new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), { status: 400 });
					} else {
						await env.terravest_db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(newPassword, user.id).run();
						response = new Response(JSON.stringify({ success: true, message: "Password updated" }), { status: 200 });
					}
				}
			}

			// --- PROPERTIES ---
			else if (url.pathname.startsWith("/api/properties")) response = await handleProperties(request, env);

			// --- BUY / SELL / PORTFOLIO ---
			else if (url.pathname === "/api/buy") response = await handleBuy(request, env);
			else if (url.pathname === "/api/sell") response = await handleSell(request, env);
			else if (url.pathname === "/api/portfolio") response = await handlePortfolio(request, env);

			// --- DEPOSITS & CLAIM ---
			else if (url.pathname === "/api/deposits") response = await handleDeposits(request, env);
			else if (url.pathname === "/api/claim") response = await handleClaim(request, env);

			// --- VERIFY PAYMENT (YENİ: Otomatik BTC Kontrolü) ---
			else if (url.pathname === "/api/verify-payment" && request.method === "POST") {
				const { orderId, txHash } = await request.json() as any;

				// 1. Siparişi Bul
				const order = await env.terravest_db.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();

				if (!order) {
					response = new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
				} else if (order.status === 'approved') {
					response = new Response(JSON.stringify({ error: 'Order already approved' }), { status: 400 });
				} else {
					// 2. Mempool API'ye Sor
					const mempoolRes = await fetch(`https://mempool.space/api/tx/${txHash}`);
					if (!mempoolRes.ok) {
						response = new Response(JSON.stringify({ error: 'Transaction not found on Bitcoin blockchain' }), { status: 404 });
					} else {
						const txData = await mempoolRes.json() as BitcoinTx;
						// 3. Bizim adrese para gelmiş mi? (Simülasyon adresi veya siparişteki adres)
						const paymentOutput = txData.vout.find(out => out.scriptpubkey_address === order.payment_address);

						if (!paymentOutput) {
							response = new Response(JSON.stringify({ error: 'Transaction does not match payment address' }), { status: 400 });
						} else {
							// 4. Onayla
							await env.terravest_db.prepare('UPDATE orders SET status = ?, tx_hash = ? WHERE id = ?').bind('approved', txHash, orderId).run();
							response = new Response(JSON.stringify({ success: true, message: 'Payment verified!' }), { status: 200 });
						}
					}
				}
			}

			// --- ADMIN ---
			else if (url.pathname.startsWith("/api/admin")) response = await handleAdminOperations(request, env);

			// --- 404 ---
			else response = new Response("Not Found", { status: 404 });

			return responseWithCors(response);

		} catch (e: any) {
			return new Response(JSON.stringify({ error: e.message }), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
	},

	// 2. ZAMANLANMIŞ GÖREVLER (CRON JOBS)
	// wrangler.toml dosyasında [triggers] crons = ["0 0 1 * *"] ayarlı olmalı
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		ctx.waitUntil(distributeRent(env));
	},
};