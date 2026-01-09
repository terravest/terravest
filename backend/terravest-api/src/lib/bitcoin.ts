import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import ecc from '@bitcoinerlab/secp256k1';
import { Buffer } from 'buffer';


// Cloudflare / Node uyumluluğu için Buffer ayarı
if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
}

const bip32 = BIP32Factory(ecc);

// ⚠️ BURAYA KENDİ ZPUB KODUNU YAPIŞTIR
const ZPUB_KEY = "zpub6rtfCkm1nDYkRsgRatR7vgfJATT1apup59Lv7z6dQM9mP3Q4iFSWJNnb6QchDA8wEnZri2mzhjguM4BdMuq5EXa8gg9RW5xPTxeAgr4vJv4";

export function generateDepositAddress(index: number): string {
    try {
        const network = bitcoin.networks.bitcoin;

        // ✅ ÇÖZÜM BURADA:
        // Kütüphaneye zPub'ın "Sihirli Numarasını" (Magic Bytes) öğretiyoruz.
        // zPub için Public Magic: 0x04b24746
        const zpubNetwork = {
            ...network,
            bip32: {
                public: 0x04b24746,
                private: 0x04b2430c // Private key olmasa da format gereği ekledik
            }
        };

        // 1. Anahtarı zPub ayarlarıyla içeri al (Parse et)
        const node = bip32.fromBase58(ZPUB_KEY, zpubNetwork);

        // 2. Türetme (Derivation): 0 (Receive) -> index
        const child = node.derive(0).derive(index);

        // 3. Adresi oluştururken standart ağı kullan (bc1 ön eki için)
        const { address } = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network: network, // Burası standart 'bitcoin' ağı olmalı
        });

        return address || "";
    } catch (error) {
        console.error("Adres üretme hatası:", error);
        return "";
    }
}



export async function isAddressUnused(address: string): Promise<boolean> {
    try {
        // Mempool API'sine soruyoruz (Mainnet)
        const response = await fetch(`https://mempool.space/api/address/${address}`);

        if (!response.ok) {
            // Eğer adres hiç kullanılmadıysa Mempool bazen 404 dönebilir, bu iyi bir şeydir.
            if (response.status === 404) return true;
            throw new Error("Mempool API hatası");
        }

        const data = await response.json() as any;

        // Toplam işlem sayısı (Gelen + Giden)
        const txCount = (data.chain_stats.tx_count || 0) + (data.mempool_stats.tx_count || 0);

        console.log(`🔍 Adres Kontrolü (${address}): ${txCount} işlem bulundu.`);

        // Eğer işlem sayısı 0 ise, bu adres TERTEMİZDİR.
        return txCount === 0;

    } catch (error) {
        console.error("Adres geçmişi kontrol edilemedi:", error);
        // Güvenlik için, hata alırsak "kullanılmış" varsayalım ki riske girmeyelim.
        return false;
    }
}