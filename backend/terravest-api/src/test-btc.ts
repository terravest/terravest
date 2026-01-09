// src/test-btc.ts

// Kendi yazdığımız fonksiyonu çağırıyoruz
// Eğer dosya yolun farklıysa burayı düzelt (örn: ../lib/bitcoin)
import { generateDepositAddress } from './lib/bitcoin';

async function runTest() {
    console.log("\n========================================");
    console.log("🧪 BITCOIN ADRES ÜRETME TESTİ BAŞLIYOR");
    console.log("========================================");

    // Electrum'daki ilk 3 adres ile kıyaslamak için
    const address0 = generateDepositAddress(0);
    const address1 = generateDepositAddress(1);
    const address2 = generateDepositAddress(2);

    console.log(`🔹 Index 0: ${address0}`);
    console.log(`🔹 Index 1: ${address1}`);
    console.log(`🔹 Index 2: ${address2}`);

    console.log("========================================\n");
    console.log("👉 ŞİMDİ ELECTRUM'U AÇ VE 'ADDRESSES' SEKMEKİ İLK 3 ADRESLE KIYASLA.");
}

runTest();