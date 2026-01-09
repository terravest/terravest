// src/test-payment.ts
import { checkBitcoinBalance } from './lib/checkPayment';

async function runPaymentTest() {
    console.log("💰 ÖDEME KONTROL TESTİ BAŞLIYOR...");

    // Zengin bir Binance cüzdanı (Test için bakiye görmek adına)
    const richAddress = "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h";

    // Senin az önce ürettiğin boş adres (Index 0)
    // Electrum'da gördüğün adresi buraya yaz:
    const myAddress = "bc1qtkaaeqjg889vxdh7m846va7ah5mat5g4nq3cjp";

    const balanceRich = await checkBitcoinBalance(richAddress);
    const balanceMe = await checkBitcoinBalance(myAddress);

    console.log(`-------------------------------------------`);
    console.log(`🏦 Binance Cüzdanı Bakiyesi: ${balanceRich} BTC`);
    console.log(`🏠 Benim Cüzdan Bakiyem:     ${balanceMe} BTC`);
    console.log(`-------------------------------------------`);

    if (balanceRich > 0) {
        console.log("✅ API çalışıyor! Bakiye çekebiliyoruz.");
    } else {
        console.log("❌ Bir sorun var, bakiye okunamadı.");
    }
}

runPaymentTest();