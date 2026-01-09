import { Env } from "../index";
import { requireAuth } from "../middleware/auth";

// SABİT İŞLEM KOMİSYONU (%1.5)
const TRADING_FEE_RATE = 0.015;

export const handleSell = async (request: Request, env: Env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    try {
        const { property_id, token_amount } = await request.json() as any;
        const db = env.terravest_db;

        // 1. Yatırım Kontrolü
        const investment = await db.prepare("SELECT * FROM investments WHERE user_id = ? AND property_id = ?").bind(user.id, property_id).first();
        if (!investment || investment.amount < token_amount) {
            return new Response(JSON.stringify({ error: "Insufficient tokens to sell" }), { status: 400 });
        }

        // 2. Fiyat ve Komisyon Hesaplama
        const property = await db.prepare("SELECT price_per_token FROM properties WHERE id = ?").bind(property_id).first();

        const rawReturn = property.price_per_token * token_amount; // Brüt Satış Geliri
        const fee = rawReturn * TRADING_FEE_RATE; // Kesinti
        const netReturn = rawReturn - fee; // Kullanıcının cebine girecek NET para

        // 3. ATOMİK İŞLEM
        const queries = [];

        // A) Yatırımı Azalt
        // Yatırımdan çıkarken total_invested'ı oransal düşürmek mantıklıdır.
        // Ancak basitlik için burada sadece miktarı düşüyoruz, maliyet analizi için daha karmaşık muhasebe gerekebilir.
        // Şimdilik sadece miktarı ve yaklaşık maliyeti düşelim.
        queries.push(
            db.prepare("UPDATE investments SET amount = amount - ?, total_invested = total_invested - ? WHERE id = ?")
                .bind(token_amount, rawReturn, investment.id)
        );

        // B) Mülk Stoğunu Geri Artır
        queries.push(
            db.prepare("UPDATE properties SET available_tokens = available_tokens + ? WHERE id = ?").bind(token_amount, property_id)
        );

        // C) Kullanıcı Bakiyesini Artır (+NET USD)
        queries.push(
            db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(netReturn, user.id)
        );

        await db.batch(queries);

        // Eğer yatırım miktarı 0'a indiyse satırı silebiliriz (Temizlik)
        if (investment.amount - token_amount <= 0) {
            await db.prepare("DELETE FROM investments WHERE id = ?").bind(investment.id).run();
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Asset sold successfully. Funds added to your balance.",
            fee_deducted: fee,
            amount_added: netReturn
        }), { status: 200 });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};