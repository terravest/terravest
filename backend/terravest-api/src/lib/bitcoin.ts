import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import ecc from '@bitcoinerlab/secp256k1';
import { Buffer } from 'buffer';
import { MempoolAddressResponse } from './types';

// Buffer polyfill for Cloudflare Workers compatibility
if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
}

const bip32 = BIP32Factory(ecc);

/**
 * Generate Native Segwit (bc1q) Bitcoin address from Wasabi/Electrum xpub or zpub master key
 * Derivation path: m/0/index (0 = receive, 1 = change)
 */
export function generateWasabiAddress(masterKey: string, index: number): string {
    try {
        if (!masterKey) throw new Error("Master Key is missing!");

        const network = bitcoin.networks.bitcoin;
        let node;

        // Create node based on key type
        if (masterKey.startsWith('xpub')) {
            // Standard xpub: use normal network settings
            node = bip32.fromBase58(masterKey, network);
        }
        else if (masterKey.startsWith('zpub')) {
            // zpub: configure magic bytes for zpub format
            const zpubNetwork = {
                ...network,
                bip32: {
                    public: 0x04b24746,
                    private: 0x04b2430c
                }
            };
            node = bip32.fromBase58(masterKey, zpubNetwork);
        }
        else {
            throw new Error("Key must start with 'xpub' or 'zpub'");
        }

        // Derive child key (Wasabi standard path: m/0/index)
        // 0 = receive addresses, 1 = change addresses
        const child = node.derive(0).derive(index);

        // Generate Native Segwit address (p2wpkh -> bc1q format)
        // Always outputs bc1q format, even if input is xpub
        const { address } = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network: network,
        });

        return address || "";
    } catch (error) {
        console.error("Address generation error:", error);
        throw new Error("Failed to generate Bitcoin address. Check key format.");
    }
}

/**
 * Check if address has been used by querying Mempool API
 * Returns true if address has no transactions
 */
export async function isAddressUnused(address: string): Promise<boolean> {
    try {
        const response = await fetch(`https://mempool.space/api/address/${address}`);

        if (!response.ok) {
            if (response.status === 404) return true;
            throw new Error("Mempool API error");
        }

        const data = await response.json() as MempoolAddressResponse;

        // Count total transactions (confirmed + unconfirmed)
        const txCount = (data.chain_stats.tx_count || 0) + (data.mempool_stats.tx_count || 0);

        return txCount === 0;
    } catch (error) {
        console.error("Address check error:", error);
        return false;
    }
}