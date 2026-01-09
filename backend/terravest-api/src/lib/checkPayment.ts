import axios from 'axios';

/**
 * Verilen Bitcoin adresindeki bakiyeyi (Onaylanmış + Bekleyen) kontrol eder.
 * @param address Kontrol edilecek BTC adresi (bc1q...)
 * @returns Toplam bakiye (BTC cinsinden, örn: 0.005)
 */
export async function checkBitcoinBalance(address: string): Promise<number> {

    try {
        // Mempool.space API'si (En hızlı ve ücretsiz yöntem)
        // Mainnet için: https://mempool.space/api/address/
        const response = await axios.get(`https://mempool.space/api/address/${address}`);
        const data = response.data;

        // chain_stats: Onaylanmış bakiye (Blok zincirine yazılmış)
        // mempool_stats: Bekleyen bakiye (Henüz onaylanmamış ama yolda)
        const funded = (data.chain_stats.funded_txo_sum || 0) + (data.mempool_stats.funded_txo_sum || 0);
        const spent = (data.chain_stats.spent_txo_sum || 0) + (data.mempool_stats.spent_txo_sum || 0);

        const currentBalanceSatoshi = funded - spent;

        // Satoshi'yi BTC'ye çevir (1 BTC = 100 Milyon Satoshi)
        return currentBalanceSatoshi / 100000000;
    } catch (error) {
        console.error(`API Hatası (${address}):`, error);
        // Hata durumunda 0 dönüyoruz ki sistem işlem yapmasın
        return 0;
    }
}