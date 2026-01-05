import { requireAuth } from "../middleware/auth";
import { Env } from "../index";

// --------------------
// PORTFOLIO & INVESTMENTS
// --------------------

// backend/terravest-api/src/routes/investments.ts

// ... (imports)

export async function handlePortfolio(request: Request, env: Env): Promise<Response> {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user as any;

    try {
        // 1. Kullanıcının birikmiş kirasını çek (YENİ!)
        const userRecord = await env.terravest_db.prepare(
            "SELECT unclaimed_rewards FROM users WHERE id = ?"
        ).bind(user.id).first();

        const rewards = userRecord ? (userRecord.unclaimed_rewards as number) : 0;

        // 2. Varlıkları çek
        const { results: assets } = await env.terravest_db.prepare(`
            SELECT 
                th.token_amount as investedAmount,
                th.created_at as date,
                th.property_id,
                p.id as id, 
                p.title as propertyName,
                p.price_usd,
                p.total_tokens
            FROM token_holdings th
            JOIN properties p ON th.property_id = p.id
            WHERE th.user_id = ?
        `).bind(user.id).all();

        // 3. Siparişleri çek
        const { results: orders } = await env.terravest_db.prepare(`
            SELECT 
                o.id,
                o.total_price_usd,
                o.payment_status,
                o.created_at,
                p.title as propertyName
            FROM orders o
            JOIN properties p ON o.property_id = p.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `).bind(user.id).all();

        const totalInvested = assets.reduce((acc: number, curr: any) => acc + (curr.investedAmount * (curr.price_usd / curr.total_tokens) || 0), 0);

        return json({
            summary: {
                totalInvested,
                unclaimedRewards: rewards, // <-- Frontend'e gönderiyoruz
                netWorth: totalInvested + rewards
            },
            assets: assets || [],
            orders: orders || []
        });

    } catch (e: any) {
        return json({ error: e.message }, 500);
    }
}



// Helper
function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
    });
}