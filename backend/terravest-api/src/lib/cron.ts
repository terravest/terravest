import { checkBitcoinBalance } from './checkPayment';
import { Env } from '../index'; // Env tanımını index'ten alacağız

export async function processPendingDeposits(env: Env) {
    console.log("🔄 Cron Job: Bekleyen ödemeler kontrol ediliyor...");

    try {
        // 1. Bekleyen (pending) siparişleri veritabanından çek
        const { results: pendingDeposits } = await env.terravest_db
            .prepare("SELECT * FROM deposits WHERE status = 'pending'")
            .all();

        if (!pendingDeposits || pendingDeposits.length === 0) {
            console.log("✅ Bekleyen ödeme yok.");
            return;
        }

        console.log(`🔎 ${pendingDeposits.length} adet işlem taranacak.`);

        // 2. Güncel Bitcoin Fiyatını Çek (USD)
        let btcPrice = 95000; // Varsayılan (Fallback)
        try {
            // Binance API'si genelde rate-limit koymaz ve çok hızlıdır
            const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
            const priceData = await priceRes.json() as any;

            if (priceData && priceData.price) {
                btcPrice = parseFloat(priceData.price);
                console.log(`✅ Güncel Kur Çekildi: $${btcPrice}`);
            }
        } catch (e) {
            console.error("Fiyat çekilemedi, varsayılan ($95,000) kullanılıyor.");
        }

        // 3. Her bir siparişi kontrol et
        for (const deposit of pendingDeposits) {
            // TypeScript tip güvenliği için cast işlemi
            const d = deposit as any;

            // Mempool API ile bakiyeyi sor
            const currentBtcBalance = await checkBitcoinBalance(d.address);

            // Eğer para geldiyse (Bakiye 0'dan büyükse)
            if (currentBtcBalance > 0) {
                console.log(`💰 ÖDEME YAKALANDI! ID: ${d.id}, Tutar: ${currentBtcBalance} BTC`);

                const addedUsd = currentBtcBalance * btcPrice;

                // ATOMİK İŞLEM: Hem siparişi güncelle hem parayı ekle (Hata olursa ikisi de iptal olur)
                await env.terravest_db.batch([
                    // A. Sipariş durumunu 'completed' yap ve tutarı işle
                    env.terravest_db.prepare(`
                        UPDATE deposits 
                        SET status = 'completed', amount_usd = ?, updated_at = datetime('now') 
                        WHERE id = ?
                    `).bind(addedUsd, d.id),

                    // B. Kullanıcının USD bakiyesini güncelle
                    // (Not: users tablosunda 'usd_balance' sütunu olduğunu varsayıyoruz)
                    env.terravest_db.prepare(`
                        UPDATE users 
                        SET usd_balance = usd_balance + ? 
                        WHERE id = ?
                    `).bind(addedUsd, d.user_id)
                ]);

                console.log(`✅ İşlem Tamamlandı: Kullanıcı ${d.user_id} hesabına $${addedUsd.toFixed(2)} eklendi.`);
            }
        }

    } catch (error) {
        console.error("🔥 Cron Hatası:", error);
    }
}