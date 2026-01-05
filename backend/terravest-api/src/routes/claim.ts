import { requireAuth } from "../middleware/auth";
import { Env } from "../index";

export async function handleClaim(request: Request, env: Env): Promise<Response> {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user as any;

    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    try {
        const body = await request.json() as { btc_address: string };
        const { btc_address } = body;

        if (!btc_address || btc_address.length < 10) {
            return json({ error: "Valid BTC address is required" }, 400);
        }

        // 1. Kullanıcının Birikmiş Parasını Kontrol Et
        const userRecord = await env.terravest_db.prepare(
            "SELECT unclaimed_rewards FROM users WHERE id = ?"
        ).bind(user.id).first();

        const amount = userRecord ? (userRecord.unclaimed_rewards as number) : 0;

        if (amount <= 0) {
            return json({ error: "No rewards to claim" }, 400);
        }

        // --- İŞLEM (TRANSACTION) ---

        // A. Kullanıcının Bakiyesini Sıfırla
        await env.terravest_db.prepare(
            "UPDATE users SET unclaimed_rewards = 0 WHERE id = ?"
        ).bind(user.id).run();

        // B. Satış İstekleri Tablosuna Kayıt Aç
        // property_id = NULL (Çünkü bu mülk satışı değil, nakit çekimi)
        // token_amount = 0
        await env.terravest_db.prepare(
            `INSERT INTO sell_requests (user_id, property_id, token_amount, total_value_usd, payment_details, status) 
             VALUES (?, NULL, 0, ?, ?, 'pending')`
        ).bind(user.id, amount, `REWARD CLAIM - BTC: ${btc_address}`).run();

        return json({
            success: true,
            message: "Claim request submitted. Funds will be sent to your BTC address.",
            amount_claimed: amount
        });

    } catch (e: any) {
        return json({ error: e.message }, 500);
    }
}

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}