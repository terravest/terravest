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

            // Start Transaction: Update deposit status AND add balance to user
            await db.batch([
                // A. Mark deposit as 'completed'
                db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(depositId),

                // B. Add USD balance to user
                // NOTE: Ideally, convert received BTC to USD here. 
                // For MVP, we credit the declared USD amount.
                db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(amountUSD, userId)
            ]);

            console.log(`✅ ID ${depositId} completed and balance updated.`);

        } catch (error) {
            console.error(`Error (ID ${depositId}):`, error);
        }
    }
}