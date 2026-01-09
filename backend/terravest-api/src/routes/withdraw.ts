import { Env } from "../index";
import { requireAuth } from "../middleware/auth";

export const handleWithdraw = async (request: Request, env: Env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;
    const db = env.terravest_db;

    try {
        const { amount, btc_address } = await request.json() as any;

        if (!amount || amount < 50) return new Response(JSON.stringify({ error: "Minimum withdrawal is $50" }), { status: 400 });
        if (!btc_address) return new Response(JSON.stringify({ error: "BTC Address required" }), { status: 400 });

        // 1. Bakiye Yeterli mi?
        const freshUser = await db.prepare("SELECT usd_balance FROM users WHERE id = ?").bind(user.id).first();
        if (!freshUser || freshUser.usd_balance < amount) {
            return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
        }

        // 2. Komisyon Hesabı
        // Kural: %1 + $5 Sabit
        const fixedFee = 5.00;
        const percentFee = amount * 0.01;
        const totalFee = fixedFee + percentFee;
        const netPayout = amount - totalFee; // Kullanıcıya gidecek net tutar (USD karşılığı)

        // 3. ATOMİK İŞLEM
        const queries = [];

        // A) Bakiyeyi Düş (Tam tutarı düşüyoruz)
        queries.push(
            db.prepare("UPDATE users SET usd_balance = usd_balance - ? WHERE id = ?").bind(amount, user.id)
        );

        // B) Çekim Talebi Oluştur (Pending)
        queries.push(
            db.prepare(`
                INSERT INTO withdrawals (user_id, amount_usd, fee_usd, btc_address, status, created_at) 
                VALUES (?, ?, ?, ?, 'pending', ?)
            `).bind(user.id, amount, totalFee, btc_address, new Date().toISOString())
        );

        // C) Ledger Kaydı
        queries.push(
            db.prepare("INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, 'withdrawal_request', ?, 'Withdrawal request created', ?)")
                .bind(user.id, -amount, new Date().toISOString()) // Eksi bakiye
        );

        await db.batch(queries);

        return new Response(JSON.stringify({
            success: true,
            message: "Withdrawal request submitted. Admin approval required.",
            details: {
                requested: amount,
                fee: totalFee,
                estimated_payout_usd: netPayout
            }
        }), { status: 200 });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};