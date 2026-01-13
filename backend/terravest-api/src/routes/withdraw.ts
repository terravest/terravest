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

        // Validation
        if (!amount || amount < 50) {
            return errorResponse("Minimum withdrawal amount is $50", 400);
        }
        if (!btc_address || btc_address.length < 10) {
            return errorResponse("Invalid Bitcoin address", 400);
        }

        const db = env.terravest_db;

        // Check user's current balance
        const currentUser = await db.prepare("SELECT usd_balance FROM users WHERE id = ?").bind(user.id).first();

        if (!currentUser || Number(currentUser.usd_balance) < amount) {
            return errorResponse("Insufficient balance", 400);
        }

        // Atomic transaction: deduct balance and create withdrawal request
        // Note: Frontend sends 'btc_address', stored as 'address' in database
        await db.batch([
            // Deduct balance immediately to prevent double withdrawal
            db.prepare("UPDATE users SET usd_balance = usd_balance - ? WHERE id = ?").bind(amount, user.id),

            // Create withdrawal request
            db.prepare(`
                INSERT INTO withdrawals (user_id, amount, address, status)
                VALUES (?, ?, ?, 'pending')
            `).bind(user.id, amount, btc_address)
        ]);

        return json({
            success: true,
            message: "Withdrawal request submitted successfully"
        });

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
    }
}