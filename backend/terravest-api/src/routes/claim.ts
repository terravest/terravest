import { Env } from "../index";
import { requireAuth } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";
import { accrueRewardsForUser } from "../lib/rewards";

export async function handleClaim(request: Request, env: Env): Promise<Response> {
    // 1. Auth Check
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    if (request.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    try {
        const db = env.terravest_db;

        // 2. Accrue any pending rewards before calculating total
        // This ensures rewards are up-to-date even if cron hasn't run
        await accrueRewardsForUser(env, user.id);

        // 3. Calculate Total Accrued Rewards
        // We sum up 'unclaimed_rewards' from all investments belonging to the user.
        const result = await db.prepare(
            "SELECT SUM(unclaimed_rewards) as total FROM investments WHERE user_id = ?"
        ).bind(user.id).first();

        const totalClaimable = Number(result?.total) || 0;

        // Threshold check: Prevent claiming insignificant amounts (e.g., less than 1 cent)
        const MINIMUM_CLAIM_THRESHOLD = 0.01;
        if (totalClaimable < MINIMUM_CLAIM_THRESHOLD) {
            return errorResponse(
                `No significant rewards to claim yet. Current unclaimed rewards: $${totalClaimable.toFixed(4)}, minimum required: $${MINIMUM_CLAIM_THRESHOLD.toFixed(2)}.`,
                400
            );
        }

        // 4. ATOMIC TRANSACTION (Batch Execution)
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

        return json({
            success: true,
            message: "Rewards successfully claimed and moved to your wallet balance.",
            amount_claimed: totalClaimable,
            target: "USD Balance"
        });

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
    }
}