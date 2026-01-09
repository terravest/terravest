import { Env } from "../index";
import { requireAuth } from "../middleware/auth";

export const handleDeposits = async (request: Request, env: Env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    if (request.method === "POST") {
        try {
            const { amount } = await request.json() as any;
            if (!amount || amount < 10) return new Response(JSON.stringify({ error: "Minimum deposit is $10" }), { status: 400 });

            const db = env.terravest_db;

            // Kendimize ait statik bir BTC adresi (Gerçekte her sipariş için yeni üretilir)
            const paymentAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

            // 1. Siparişi Oluştur (Property ID yok, NULL olacak)
            const { success, meta } = await db.prepare(`
                INSERT INTO orders (user_id, property_id, amount, total_price, status, payment_address, created_at) 
                VALUES (?, NULL, 0, ?, 'pending', ?, ?)
            `).bind(user.id, amount, paymentAddress, new Date().toISOString()).run();

            if (!success) throw new Error("Database insert failed");

            // 2. Oluşan Siparişi Geri Döndür (ID'si ile birlikte)
            const newOrder = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(meta.last_row_id).first();

            return new Response(JSON.stringify(newOrder), { status: 201 });

        } catch (e: any) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
};