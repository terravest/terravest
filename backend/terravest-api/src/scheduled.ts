import { Env } from "./index";

// MANAGEMENT FEE RATE (10%)
const MANAGEMENT_FEE_RATE = 0.10;

export async function distributeRent(env: Env) {
    const today = new Date().toISOString();
    console.log(`🔄 Daily Rent Calculation Started: ${today}`);

    try {
        // ============================================================
        // 🚀 BULK UPDATE OPTIMIZATION
        // ============================================================
        // Instead of looping through properties and updating users one by one,
        // we use a single SQL update with a subquery.
        // This handles thousands of investments in milliseconds.

        // LOGIC EXPLAINED IN SQL:
        // 1. Get Property Data: Price, Yield, Total Tokens.
        // 2. Gross Annual = Price * (Yield / 100)
        // 3. Net Annual = Gross Annual * (1 - Management Fee)
        // 4. Daily Per Token = (Net Annual / Total Tokens) / 365
        // 5. Add to User: Current Rewards + (User's Token Amount * Daily Per Token)

        const query = `
            UPDATE investments
            SET 
                last_rent_calc_date = ?,
                unclaimed_rewards = unclaimed_rewards + (
                    token_amount * (
                        SELECT 
                            ( (price * (rental_yield / 100.0)) * (1.0 - ?) ) / total_tokens / 365.0
                        FROM properties 
                        WHERE properties.id = investments.property_id
                    )
                )
            WHERE EXISTS (
                SELECT 1 FROM properties WHERE id = investments.property_id
            )
        `;

        // Bind parameters: [Date, ManagementFeeRate]
        const result = await env.terravest_db.prepare(query)
            .bind(today, MANAGEMENT_FEE_RATE)
            .run();

        console.log(`✅ Daily rent accrual completed. Updated ${result.meta.changes} investment records.`);

    } catch (e: any) {
        console.error("❌ CRON ERROR (Rent Distribution):", e);
    }
}