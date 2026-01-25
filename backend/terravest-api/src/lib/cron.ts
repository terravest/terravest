import { Env } from '../index';
import { checkBitcoinBalance } from './checkPayment'; // Import your utility

// 1. Process Deposits (BTC -> USD Balance)
export async function processPendingDeposits(env: Env) {
    const db = env.terravest_db;
    const { results } = await db.prepare("SELECT * FROM deposits WHERE status = 'pending'").all();

    if (!results || results.length === 0) return;

    console.log(`🕵️‍♂️ Checking ${results.length} pending deposits...`);

    for (const deposit of results) {
        const address = deposit.deposit_address as string; // Changed from 'address' to 'deposit_address' based on DB schema
        const depositId = deposit.id;
        const userId = deposit.user_id;
        const amountUSDCents = deposit.amount_usd as number;

        try {
            // Use the shared utility function
            const btcBalance = await checkBitcoinBalance(address);

            // If balance > 0, payment detected
            if (btcBalance > 0) {
                console.log(`💰 PAYMENT DETECTED! ID: ${depositId}, BTC: ${btcBalance}`);

                // Double check status before updating to avoid race conditions
                const currentDeposit = await db.prepare("SELECT status FROM deposits WHERE id = ?").bind(depositId).first();
                if (currentDeposit?.status !== 'pending') continue;

                await db.batch([
                    // Update deposit status
                    db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(depositId),
                    // Add balance (CENTS)
                    db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(amountUSDCents, userId),
                    // Log Transaction
                    db.prepare("INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'deposit', ?, ?)")
                        .bind(userId, amountUSDCents, `Deposit Approved (${btcBalance} BTC) via ${address.slice(0, 6)}...`)
                ]);

                console.log(`✅ ID ${depositId} completed.`);
            }
        } catch (error) {
            console.error(`Error processing deposit ID ${depositId}:`, error);
        }
    }
}

// 2. Distribute Rents (Unchanged)
export async function distributeRents(env: Env) {
    // ... (Your existing rent distribution logic)
}

// Main Cron Handler
export async function handleCron(event: ScheduledEvent, env: Env) {
    await processPendingDeposits(env);
    // await distributeRents(env);
}