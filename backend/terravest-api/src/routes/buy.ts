import { Env } from "../index";
import { requireAuth } from "../middleware/auth";

// SABİT İŞLEM KOMİSYONU (%1.5)
const TRADING_FEE_RATE = 0.015;

export const handleBuy = async (request: Request, env: Env) => {
    // 1. Yetki Kontrolü
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    try {
        const { property_id, token_amount } = await request.json() as any;

        if (!property_id || !token_amount || token_amount <= 0) {
            return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
        }

        const db = env.terravest_db;

        // 2. Mülkü ve Güncel Fiyatı Çek
        const property = await db.prepare("SELECT * FROM properties WHERE id = ?").bind(property_id).first();
        if (!property) return new Response(JSON.stringify({ error: "Property not found" }), { status: 404 });

        // Stok Kontrolü
        if (property.available_tokens < token_amount) {
            return new Response(JSON.stringify({ error: "Not enough tokens available" }), { status: 400 });
        }

        // 3. Maliyet ve Komisyon Hesaplama
        const rawCost = property.price_per_token * token_amount; // Saf Mülk Bedeli
        const fee = rawCost * TRADING_FEE_RATE; // İşlem Ücreti
        const totalCost = rawCost + fee; // Kullanıcıdan çıkacak toplam para

        // 4. Bakiye Kontrolü (Komisyon Dahil)
        const freshUser = await db.prepare("SELECT usd_balance FROM users WHERE id = ?").bind(user.id).first();
        const currentBalance = freshUser?.usd_balance || 0;

        if (currentBalance < totalCost) {
            return new Response(JSON.stringify({
                error: "Insufficient balance to cover cost + fees",
                current_balance: currentBalance,
                required: totalCost,
                fee_amount: fee
            }), { status: 400 });
        }

        // 5. ATOMİK İŞLEM (Transaction)
        const existingInvestment = await db.prepare("SELECT * FROM investments WHERE user_id = ? AND property_id = ?").bind(user.id, property_id).first();
        const queries = [];

        // A) Bakiyeyi Düş (Toplam Maliyet Kadar)
        queries.push(
            db.prepare("UPDATE users SET usd_balance = usd_balance - ? WHERE id = ?").bind(totalCost, user.id)
        );

        // B) Mülk Stoğunu Düş
        queries.push(
            db.prepare("UPDATE properties SET available_tokens = available_tokens - ? WHERE id = ?").bind(token_amount, property_id)
        );

        // C) Yatırımı Kaydet
        // Not: total_invested kısmına maliyetin tamamını (fee dahil) yazıyoruz ki kullanıcının maliyet tabanı (cost basis) doğru olsun.
        if (existingInvestment) {
            // Güncelle
            queries.push(
                db.prepare("UPDATE investments SET amount = amount + ?, total_invested = total_invested + ? WHERE id = ?")
                    .bind(token_amount, totalCost, existingInvestment.id)
            );
        } else {
            // Yeni Ekle
            queries.push(
                db.prepare("INSERT INTO investments (user_id, property_id, amount, total_invested, purchase_date) VALUES (?, ?, ?, ?, ?)")
                    .bind(user.id, property_id, token_amount, totalCost, new Date().toISOString())
            );
        }

        // Hepsini çalıştır
        await db.batch(queries);

        return new Response(JSON.stringify({
            success: true,
            message: "Purchase successful!",
            fee_paid: fee,
            new_balance: currentBalance - totalCost
        }), { status: 200 });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};