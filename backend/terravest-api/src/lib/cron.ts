import { Env } from '../index';
import { MempoolAddressResponse } from './types'; // ✅ Defined types imported

export async function processPendingDeposits(env: Env) {
    const db = env.terravest_db;

    // 1. Fetch pending transactions
    const { results } = await db.prepare(`
        SELECT * FROM deposits WHERE status = 'pending'
    `).all();

    if (!results || results.length === 0) {
        console.log("💤 No pending deposits.");
        return;
    }

    console.log(`🕵️‍♂️ Checking ${results.length} pending deposits...`);

    for (const deposit of results) {
        const address = deposit.address as string;
        const depositId = deposit.id;
        const userId = deposit.user_id;
        const amountUSD = deposit.amount_usd as number;

        try {
            // 2. Query Blockchain (Mempool API)
            const response = await fetch(`https://mempool.space/api/address/${address}`);

            if (!response.ok) {
                console.error(`API Error (${address}): ${response.statusText}`);
                continue;
            }

            // ✅ TYPING FIX: Cast to MempoolAddressResponse instead of 'any'
            const data = await response.json() as MempoolAddressResponse;

            // 3. Check Balance
            // funded_txo_sum: Total Satoshis received by this address
            // TypeScript now validates 'chain_stats' and 'funded_txo_sum' exist.
            const receivedSatoshis = (data.chain_stats.funded_txo_sum || 0) + (data.mempool_stats.funded_txo_sum || 0);

            // If no funds received yet, skip
            if (receivedSatoshis === 0) {
                console.log(`⏳ Payment pending: ID ${depositId} -> ${address}`);
                continue;
            }

            // 4. Payment Detected! Complete the transaction
            console.log(`💰 PAYMENT DETECTED! ID: ${depositId}, Received: ${receivedSatoshis} sats`);

            // SECURITY FIX: Check if deposit is still pending before processing
            // This prevents double-crediting if cron runs multiple times
            const currentDeposit = await db.prepare("SELECT status FROM deposits WHERE id = ?").bind(depositId).first();
            if (currentDeposit?.status !== 'pending') {
                console.warn(`⚠️ Deposit ${depositId} is already ${currentDeposit?.status}. Skipping to prevent double credit.`);
                continue;
            }

            // Start Transaction: Update deposit status AND add balance to user
            await db.batch([
                // A. Mark deposit as 'completed' ONLY if still pending (prevents double processing)
                db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'").bind(depositId),

                // B. Add USD balance to user
                // NOTE: Ideally, convert received BTC to USD here. 
                // For MVP, we credit the declared USD amount.
                db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(amountUSD, userId)
            ]);

            // Verify the deposit was actually updated (another instance might have processed it)
            const verifyDeposit = await db.prepare("SELECT status FROM deposits WHERE id = ?").bind(depositId).first();
            if (verifyDeposit?.status !== 'completed') {
                console.warn(`⚠️ Deposit ${depositId} was already processed by another instance. Balance credit may have been skipped.`);
                continue;
            }

            console.log(`✅ ID ${depositId} completed and balance updated.`);

        } catch (error) {
            console.error(`Error (ID ${depositId}):`, error);
        }
    }
}