// Type definitions for Mempool.space API responses

export interface MempoolStats {
    funded_txo_count: number;
    funded_txo_sum: number; // Total received Satoshi
    spent_txo_count: number;
    spent_txo_sum: number;  // Total spent Satoshi
    tx_count: number;
}

export interface MempoolAddressResponse {
    address: string;
    chain_stats: MempoolStats;   // Confirmed transactions
    mempool_stats: MempoolStats; // Unconfirmed transactions
}