import { Env } from '../index';
// Ensure you have a simple interface for the API response if not imported
interface MempoolAddressResponse {
    address: string;
    chain_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
    mempool_stats: { funded_txo_sum: number; spent_txo_sum: number; tx_count: number };
}

// 1. Process Deposits (BTC -> USD Balance)
export async function processPendingDeposits(env: Env) {
    const db = env.terravest_db;
    const { results } = await db.prepare("SELECT * FROM deposits WHERE status = 'pending'").all();

    if (!results || results.length === 0) return;

    console.log(`🕵️‍♂️ Checking ${results.length} pending deposits...`);

    for (const deposit of results) {
        const address = deposit.address as string;
        const depositId = deposit.id;
        const userId = deposit.user_id;
        // amount_usd is stored in CENTS in the new schema
        const amountUSDCents = deposit.amount_usd as number;

        try {
            const response = await fetch(`https://mempool.space/api/address/${address}`);
            if (!response.ok) continue;

            const data = await response.json() as MempoolAddressResponse;
            const receivedSatoshis = (data.chain_stats.funded_txo_sum || 0) + (data.mempool_stats.funded_txo_sum || 0);

            if (receivedSatoshis === 0) continue;

            console.log(`💰 PAYMENT DETECTED! ID: ${depositId}, Received: ${receivedSatoshis} sats`);

            // Double check status before updating
            const currentDeposit = await db.prepare("SELECT status FROM deposits WHERE id = ?").bind(depositId).first();
            if (currentDeposit?.status !== 'pending') continue;

            await db.batch([
                // Update deposit status
                db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(depositId),
                // Add balance (CENTS)
                db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(amountUSDCents, userId),
                // Log Transaction
                db.prepare("INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'deposit', ?, ?)")
                    .bind(userId, amountUSDCents, `Deposit Approved via ${address.slice(0, 6)}...`)
            ]);

            console.log(`✅ ID ${depositId} completed.`);
        } catch (error) {
            console.error(`Error (ID ${depositId}):`, error);
        }
    }
}

// 2. Distribute Rents (Yield % -> Cents to Users)
export async function distributeRents(env: Env) {
    const db = env.terravest_db;
    console.log("🕒 Distributing Rents...");

    try {
        const properties = await db.prepare("SELECT * FROM properties WHERE status = 'active' AND rental_yield IS NOT NULL").all();
        const results = properties.results || [];

        for (const prop of results) {
            // Parse yield (e.g., "8.5%" -> 8.5)
            let yieldPercent = 0;
            if (typeof prop.rental_yield === 'string') {
                yieldPercent = parseFloat(prop.rental_yield.replace('%', '').replace('~', ''));
            } else {
                yieldPercent = Number(prop.rental_yield);
            }

            if (isNaN(yieldPercent) || yieldPercent <= 0) continue;

            // 💰 INTEGER MATH: Annual Return in Cents
            // prop.price_usd is in Cents. 
            // Formula: (PriceCents * Yield) / 100
            const annualReturnCents = (prop.price_usd as number) * (yieldPercent / 100);

            // Monthly Pool in Cents (Floored to avoid fractions)
            const monthlyRentPoolCents = Math.floor(annualReturnCents / 12);

            if (monthlyRentPoolCents <= 0) continue;

            // Get investors
            const investments = await db.prepare("SELECT id, user_id, token_amount FROM investments WHERE property_id = ?").bind(prop.id).all();
            const invList = investments.results || [];

            if (invList.length === 0) continue;

            const batch = [];
            const now = new Date().toISOString();

            for (const inv of invList) {
                // Share: (Owned / Total Tokens)
                const share = (inv.token_amount as number) / (prop.total_tokens as number);

                // Payout in Cents (Floored)
                const payoutCents = Math.floor(monthlyRentPoolCents * share);

                if (payoutCents > 0) {
                    // Update 'unclaimed_rewards' (Cents)
                    // We DO NOT update last_rent_calc_date here every minute/hour. 
                    // Usually this runs once a month or logic checks dates. 
                    // For demo, we just add to unclaimed.
                    batch.push(
                        db.prepare("UPDATE investments SET unclaimed_rewards = unclaimed_rewards + ? WHERE id = ?").bind(payoutCents, inv.id)
                    );
                }
            }

            if (batch.length > 0) {
                await db.batch(batch);
            }
        }
    } catch (e) {
        console.error("❌ Rent Error:", e);
    }
}

// Main Cron Handler
export async function handleCron(event: ScheduledEvent, env: Env) {
    await processPendingDeposits(env);
    // await distributeRents(env); // Uncomment if you want automatic rent distribution on cron
}