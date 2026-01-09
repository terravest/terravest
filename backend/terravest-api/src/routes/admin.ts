import { Env } from "../index";
import { requireAuth } from "../middleware/auth";

export const handleAdminOperations = async (request: Request, env: Env) => {
    // 1. Yetki Kontrolü
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    // User ID 1 Admin kabul edilir
    if (auth.user.id !== 1) {
        return new Response(JSON.stringify({ error: "Unauthorized: Admin only" }), { status: 403 });
    }

    const url = new URL(request.url);
    const db = env.terravest_db;

    // --- GET: Bekleyen Siparişler ---
    if (request.method === "GET" && url.pathname.endsWith("/orders")) {
        const { results } = await db.prepare(`
            SELECT o.*, u.email, u.username 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.status = 'pending'
            ORDER BY o.created_at DESC
        `).all();
        return new Response(JSON.stringify(results));
    }

    // --- POST: Para Yatırmayı Onayla ---
    if (request.method === "POST" && url.pathname.endsWith("/approve-deposit")) {
        try {
            const { orderId } = await request.json() as any;

            // A) Siparişi Bul
            const order = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();

            if (!order) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
            if (order.status === 'approved') return new Response(JSON.stringify({ error: "Already approved" }), { status: 400 });
            if (order.property_id !== null) return new Response(JSON.stringify({ error: "Not a deposit order" }), { status: 400 });

            // B) Değerleri Sayıya Çevir (Kritik Nokta)
            const amountToAdd = Number(order.total_price);

            console.log(`👨‍⚖️ ADMIN APPROVE: User ${order.user_id} için ${amountToAdd}$ ekleniyor.`);

            // C) ATOMİK İŞLEM
            await db.batch([
                // 1. Siparişi Onayla
                db.prepare("UPDATE orders SET status = 'approved' WHERE id = ?").bind(orderId),

                // 2. Kullanıcı Bakiyesini Artır (COALESCE ile NULL koruması)
                // usd_balance eğer NULL ise 0 olarak al, sonra üzerine ekle.
                db.prepare(`
                    UPDATE users 
                    SET usd_balance = COALESCE(usd_balance, 0) + ? 
                    WHERE id = ?
                `).bind(amountToAdd, order.user_id)
            ]);

            return new Response(JSON.stringify({
                success: true,
                message: `Deposit of $${amountToAdd} approved successfully.`
            }));

        } catch (e: any) {
            console.error("Admin Error:", e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
};