import { Env } from "../index";
import { requireAuth } from "../middleware/auth";

export async function handleClaim(request: Request, env: Env): Promise<Response> {
    // 1. Auth Check
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    try {
        const db = env.terravest_db;

        // 2. Calculate Total Accrued Rewards
        // We sum up 'unclaimed_rewards' from all investments belonging to the user.
        const result = await db.prepare(
            "SELECT SUM(unclaimed_rewards) as total FROM investments WHERE user_id = ?"
        ).bind(user.id).first();

        const totalClaimable = result?.total as number || 0;

        // Threshold check: Prevent claiming insignificant amounts (e.g., less than 1 cent)
        if (totalClaimable < 0.01) {
            return new Response(JSON.stringify({ error: "No significant rewards to claim yet." }), { status: 400 });
        }

        // 3. ATOMIC TRANSACTION (Batch Execution)
        const queries = [];

        // A) Credit User Wallet Balance (USD)
        queries.push(
            db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?")
                .bind(totalClaimable, user.id)
        );

        // B) Reset 'unclaimed_rewards' to 0 for all user's investments
        queries.push(
            db.prepare("UPDATE investments SET unclaimed_rewards = 0 WHERE user_id = ?")
                .bind(user.id)
        );

        // C) Create Ledger Entry (Transaction History)
        queries.push(
            db.prepare("INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, 'rent_claim', ?, 'Daily rent rewards claimed', ?)")
                .bind(user.id, totalClaimable, new Date().toISOString())
        );

        // Execute all queries at once
        await db.batch(queries);

        return new Response(JSON.stringify({
            success: true,
            message: "Rewards successfully claimed and moved to your wallet balance.",
            amount_claimed: totalClaimable,
            target: "USD Balance"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}