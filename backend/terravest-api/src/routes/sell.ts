import { requireAuth } from "../middleware/auth";
import { Env } from "../index";

export async function handleSell(request: Request, env: Env): Promise<Response> {
    // 1. Auth Check
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user as any;

    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    try {
        const body = await request.json() as { property_id: number; token_amount: number; btc_address: string };
        const { property_id, token_amount, btc_address } = body;

        // 2. Validation
        if (!property_id || !token_amount || token_amount <= 0) {
            return json({ error: "Invalid amount or property" }, 400);
        }
        if (!btc_address || btc_address.length < 20) {
            return json({ error: "Valid BTC address is required for withdrawal" }, 400);
        }

        // 3. Kullanıcının Token Bakiyesini Kontrol Et
        const holding = await env.terravest_db.prepare(
            "SELECT * FROM token_holdings WHERE user_id = ? AND property_id = ?"
        ).bind(user.id, property_id).first();

        const currentTokens = holding ? (holding.token_amount as number) : 0;

        if (currentTokens < token_amount) {
            return json({ error: `Insufficient tokens. You have ${currentTokens}, trying to sell ${token_amount}` }, 400);
        }

        // 4. Mülk Bilgisini Al (Fiyat Hesaplaması İçin)
        const property = await env.terravest_db.prepare("SELECT * FROM properties WHERE id = ?").bind(property_id).first();
        if (!property) return json({ error: "Property not found" }, 404);

        // Token Fiyatını Hesapla
        const tokenPrice = (property.price_usd as number) / (property.total_tokens as number);
        const totalValueUsd = token_amount * tokenPrice;

        // --- TRANSACTION BAŞLIYOR ---

        // A. Kullanıcıdan Tokenları Düş
        // (Tokenları siliyoruz çünkü satış işlemi kesinleşti, sadece ödeme bekliyor)
        await env.terravest_db.prepare(
            "UPDATE token_holdings SET token_amount = token_amount - ? WHERE user_id = ? AND property_id = ?"
        ).bind(token_amount, user.id, property_id).run();

        // B. Mülkün Stokunu Artır (Geri İade)
        await env.terravest_db.prepare(
            "UPDATE properties SET available_tokens = available_tokens + ? WHERE id = ?"
        ).bind(token_amount, property_id).run();

        // C. Satış İsteği Oluştur (BTC Adresiyle)
        await env.terravest_db.prepare(
            `INSERT INTO sell_requests (user_id, property_id, token_amount, total_value_usd, payment_details, status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`
        ).bind(user.id, property_id, token_amount, totalValueUsd, `BTC: ${btc_address}`).run();

        return json({
            success: true,
            message: "Sell request created. Funds will be sent to your BTC address.",
            details: {
                sold_tokens: token_amount,
                payout_usd: totalValueUsd,
                btc_address: btc_address
            }
        });

    } catch (e: any) {
        return json({ error: e.message }, 500);
    }
}

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
    });
}