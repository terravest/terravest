import { Env } from "../index";
import { requireAuth } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";

/**
 * Get user portfolio with investments, unclaimed rewards, and assets
 * Returns formatted data for dashboard display
 */
export const handlePortfolio = async (request: Request, env: Env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;
    const db = env.terravest_db;

    try {
        // Fetch user investments with property details
        const { results: investments } = await db.prepare(`
            SELECT 
                i.id,
                i.property_id,
                i.token_amount as token_count, 
                i.unclaimed_rewards,
                p.title as propertyName,
                p.token_price as price_per_token,
                p.total_tokens,
                p.price as total_property_value
            FROM investments i
            JOIN properties p ON i.property_id = p.id
            WHERE i.user_id = ?
        `).bind(user.id).all();

        // Orders table not yet implemented, return empty array
        // TODO: Add order tracking functionality
        const orders: any[] = [];

        // Transform data to dashboard format
        let totalInvested = 0;
        let totalUnclaimed = 0;

        const assets = investments.map((inv: any) => {
            const currentValue = inv.token_count * inv.price_per_token;
            totalInvested += currentValue;
            totalUnclaimed += (inv.unclaimed_rewards || 0);

            return {
                id: inv.id,
                property_id: inv.property_id,
                propertyName: inv.propertyName,
                investedAmount: inv.token_count,
                price_usd: inv.total_property_value,
                total_tokens: inv.total_tokens,
                current_price: inv.price_per_token,
                unclaimed_rewards: inv.unclaimed_rewards || 0
            };
        });

        return json({
            summary: {
                totalInvested,
                unclaimedRewards: totalUnclaimed
            },
            assets: assets,
            orders: orders
        });

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
    }
};