import axios from 'axios';

/**
 * Check Bitcoin balance for given address (confirmed + unconfirmed)
 * @param address Bitcoin address to check (bc1q format)
 * @returns Total balance in BTC (e.g., 0.005)
 */
export async function checkBitcoinBalance(address: string): Promise<number> {

    try {
        // Mempool.space API (fastest and free method)
        // Mainnet: https://mempool.space/api/address/
        const response = await axios.get(`https://mempool.space/api/address/${address}`);
        const data = response.data;

        // chain_stats: Confirmed balance (written to blockchain)
        // mempool_stats: Unconfirmed balance (pending)
        const funded = (data.chain_stats.funded_txo_sum || 0) + (data.mempool_stats.funded_txo_sum || 0);
        const spent = (data.chain_stats.spent_txo_sum || 0) + (data.mempool_stats.spent_txo_sum || 0);

        const currentBalanceSatoshi = funded - spent;

        // Convert Satoshi to BTC (1 BTC = 100,000,000 Satoshi)
        return currentBalanceSatoshi / 100000000;
    } catch (error) {
        console.error(`API Error (${address}):`, error);
        // Return 0 on error to prevent system from processing
        return 0;
    }
}