import { Env } from "../index";
import { requireAuth } from "../middleware/auth";

export const handlePortfolio = async (request: Request, env: Env) => {
    // 1. Yetki Kontrolü
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;
    const db = env.terravest_db;

    try {
        // 2. Kullanıcının Yatırımlarını Çek (Mülk detaylarıyla birleştirerek)
        // YENİ: i.unclaimed_rewards sütununu da çekiyoruz.
        const { results: investments } = await db.prepare(`
            SELECT 
                i.id,
                i.property_id,
                i.amount as token_count, 
                i.unclaimed_rewards,
                p.title as propertyName,
                p.price_per_token,
                p.total_tokens,
                p.price as total_property_value
            FROM investments i
            JOIN properties p ON i.property_id = p.id
            WHERE i.user_id = ?
        `).bind(user.id).all();

        // 3. Geçmiş Siparişleri ve İşlemleri Çek
        // Dashboard'daki "Recent Activity" tablosu için gerekli.
        const { results: orders } = await db.prepare(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
        `).bind(user.id).all();

        // 4. Veriyi Dashboard'un beklediği formata çevir
        let totalInvested = 0;
        let totalUnclaimed = 0;

        const assets = investments.map((inv: any) => {
            // Hesaplamalar
            const currentValue = inv.token_count * inv.price_per_token;
            totalInvested += currentValue;
            totalUnclaimed += (inv.unclaimed_rewards || 0);

            return {
                id: inv.id,
                property_id: inv.property_id,
                propertyName: inv.propertyName,
                investedAmount: inv.token_count, // Frontend'de 'investedAmount' token adedi olarak kullanılıyor
                price_usd: inv.total_property_value,
                total_tokens: inv.total_tokens,
                current_price: inv.price_per_token,
                unclaimed_rewards: inv.unclaimed_rewards || 0
            };
        });

        // 5. Yanıt Dön
        return new Response(JSON.stringify({
            summary: {
                totalInvested,
                unclaimedRewards: totalUnclaimed
            },
            assets: assets,
            orders: orders
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (e: any) {
        console.error("Portfolio Error:", e.message); // Loglara hatayı basar
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};