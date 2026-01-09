import { Env } from "./index";

// MANAGEMENT FEE RATE (10%)
// This rate is deducted from gross rent for platform maintenance, taxes, and operational expenses.
const MANAGEMENT_FEE_RATE = 0.10;

export async function distributeRent(env: Env) {
    const db = env.terravest_db;
    const today = new Date().toISOString();

    console.log(`🔄 Daily Rent Calculation Started: ${today}`);

    // 1. Fetch all active properties
    const { results: properties } = await db.prepare("SELECT * FROM properties").all();

    for (const propResult of properties) {
        const prop = propResult as any;

        // A) ANNUAL NET INCOME FORMULA (BASED ON 365 DAYS)
        // Formula: (Property Price * Annual Yield)
        const annualYield = prop.rental_yield || 6; // Default 6%
        const annualGrossRent = prop.price * (annualYield / 100);

        // B) MANAGEMENT FEE DEDUCTION (10%)
        // Platform revenue is separated here.
        const managementFee = annualGrossRent * MANAGEMENT_FEE_RATE;
        const annualNetRent = annualGrossRent - managementFee;

        // C) DAILY NET RENT PER SHARE
        // If total tokens are not in DB, default to 1000.
        const totalShares = prop.total_tokens || 1000;

        // Daily Rent Per Share = (Annual Net Rent / Total Shares) / 365 Days
        const dailyRentPerShare = (annualNetRent / totalShares) / 365;

        // D) UPDATE INVESTORS (BATCH SQL)
        // Instead of updating one by one in a loop, we update all investments for that property in a single query.
        // unclaimed_rewards = Current + (User's Share Amount * Daily Rent Per Share)
        await db.prepare(`
            UPDATE investments 
            SET unclaimed_rewards = unclaimed_rewards + (amount * ?),
                last_rent_calc_date = ?
            WHERE property_id = ?
        `).bind(dailyRentPerShare, today, prop.id).run();
    }

    console.log("✅ Daily rent accrual completed. (Users can withdraw via 'Claim' button)");
}