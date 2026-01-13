import { Env } from "../index";

// MANAGEMENT FEE RATE (10%)
const MANAGEMENT_FEE_RATE = 0.10;

/**
 * Calculate and accrue rewards for a specific investment.
 * This function calculates rewards for all days since last_rent_calc_date
 * (or since investment creation if last_rent_calc_date is null).
 * 
 * @param env - Environment with database access
 * @param investmentId - The investment ID to accrue rewards for
 * @returns The amount of rewards accrued, or 0 if error
 */
export async function accrueRewardsForInvestment(env: Env, investmentId: number): Promise<number> {
    try {
        // Get investment with property data
        const investment = await env.terravest_db.prepare(`
            SELECT 
                i.id,
                i.property_id,
                i.token_amount,
                i.last_rent_calc_date,
                i.unclaimed_rewards,
                i.created_at,
                p.price,
                p.rental_yield,
                p.total_tokens
            FROM investments i
            JOIN properties p ON i.property_id = p.id
            WHERE i.id = ?
        `).bind(investmentId).first() as any;

        if (!investment) {
            return 0;
        }

        // Validate required fields for reward calculation
        if (!investment.price || !investment.rental_yield || !investment.total_tokens) {
            // Missing required fields - can't calculate rewards
            // This is fine for tests that manually set unclaimed_rewards
            return 0;
        }

        // Calculate days since last calculation (or since investment creation)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day for accurate day calculation

        let lastCalcDate: Date;

        if (investment.last_rent_calc_date) {
            lastCalcDate = new Date(investment.last_rent_calc_date);
        } else if (investment.created_at) {
            lastCalcDate = new Date(investment.created_at);
        } else {
            // Fallback: use today (shouldn't happen, but safe)
            lastCalcDate = today;
        }

        lastCalcDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Calculate days difference
        // If same day, return 0 (no rewards yet - rewards start accruing from tomorrow)
        // Otherwise, calculate actual days difference (minimum 1 day)
        const daysDiff = Math.floor((today.getTime() - lastCalcDate.getTime()) / (1000 * 60 * 60 * 24));

        // No rewards if same day (purchase just happened)
        if (daysDiff <= 0) {
            return 0;
        }

        // Calculate daily reward per token
        // Formula: (Price * (Rental Yield / 100) * (1 - Management Fee)) / Total Tokens / 365
        const grossAnnual = Number(investment.price) * (Number(investment.rental_yield) / 100.0);
        const netAnnual = grossAnnual * (1.0 - MANAGEMENT_FEE_RATE);
        const dailyPerToken = netAnnual / Number(investment.total_tokens) / 365.0;

        // Calculate total reward for this investment
        const rewardForPeriod = Number(investment.token_amount) * dailyPerToken * daysDiff;

        // Update investment with accrued rewards
        await env.terravest_db.prepare(`
            UPDATE investments
            SET 
                last_rent_calc_date = ?,
                unclaimed_rewards = unclaimed_rewards + ?
            WHERE id = ?
        `).bind(today.toISOString(), rewardForPeriod, investmentId).run();

        return rewardForPeriod;
    } catch (e: any) {
        console.error(`❌ Error accruing rewards for investment ${investmentId}:`, e);
        return 0;
    }
}

/**
 * Accrue rewards for all investments belonging to a user.
 * Useful for ensuring rewards are up-to-date before claiming.
 * 
 * @param env - Environment with database access
 * @param userId - The user ID to accrue rewards for
 * @returns Total amount of rewards accrued
 */
export async function accrueRewardsForUser(env: Env, userId: number): Promise<number> {
    try {
        // Get all investments for this user
        const investments = await env.terravest_db.prepare(`
            SELECT id FROM investments WHERE user_id = ?
        `).bind(userId).all() as any;

        let totalAccrued = 0;
        for (const inv of investments.results || []) {
            const accrued = await accrueRewardsForInvestment(env, inv.id);
            totalAccrued += accrued;
        }

        return totalAccrued;
    } catch (e: any) {
        console.error(`❌ Error accruing rewards for user ${userId}:`, e);
        return 0;
    }
}

/**
 * Accrue rewards for all investments in the system.
 * This is the same logic as distributeRent but can be called on-demand.
 * Uses a loop-based approach for better compatibility with D1.
 * 
 * @param env - Environment with database access
 * @returns Number of investments updated
 */
export async function accrueRewardsForAll(env: Env): Promise<number> {
    try {
        // Get all investments
        const investments = await env.terravest_db.prepare(`
            SELECT id FROM investments
        `).all() as any;

        let updatedCount = 0;
        for (const inv of investments.results || []) {
            const accrued = await accrueRewardsForInvestment(env, inv.id);
            if (accrued > 0) {
                updatedCount++;
            }
        }

        return updatedCount;
    } catch (e: any) {
        console.error("❌ Error accruing rewards for all investments:", e);
        return 0;
    }
}
