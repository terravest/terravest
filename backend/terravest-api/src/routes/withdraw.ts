import { Env } from "../index";
import { requireAuth } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";

/**
 * Handle withdrawal request
 * Creates a withdrawal request and deducts balance atomically
 */
export async function handleWithdraw(request: Request, env: Env): Promise<Response> {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    try {
        const body = await request.json() as any;
        const { amount, btc_address } = body;

        // 💰 FINANCIAL INTEGRITY: Amount is in CENTS
        const amountCents = Number(amount);

        if (isNaN(amountCents) || amountCents <= 0) {
            return errorResponse("Amount must be a positive number", 400);
        }

        // $50.00 Limit = 5000 Cents
        if (amountCents < 5000) {
            return errorResponse("Minimum withdrawal amount is $50.00", 400);
        }

        if (!btc_address || btc_address.length < 10) {
            return errorResponse("Invalid Bitcoin address", 400);
        }

        const db = env.terravest_db;

        // Check user's current balance (Cents)
        const currentUser = await db.prepare("SELECT usd_balance FROM users WHERE id = ?").bind(user.id).first();

        if (!currentUser || (currentUser.usd_balance as number) < amountCents) {
            return errorResponse("Insufficient balance", 400);
        }

        // Atomic transaction: deduct balance and create withdrawal request
        await db.batch([
            // Deduct balance (Cents)
            db.prepare("UPDATE users SET usd_balance = usd_balance - ? WHERE id = ?").bind(amountCents, user.id),

            // Create withdrawal request
            db.prepare(`
                INSERT INTO withdrawals (user_id, amount, address, status)
                VALUES (?, ?, ?, 'pending')
            `).bind(user.id, amountCents, btc_address),

            // Log Transaction
            db.prepare("INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'withdraw', ?, ?)")
                .bind(user.id, -amountCents, `Withdrawal to ${btc_address.slice(0, 6)}...`)
        ]);

        return json({
            success: true,
            message: "Withdrawal request submitted successfully"
        });

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
    }
}