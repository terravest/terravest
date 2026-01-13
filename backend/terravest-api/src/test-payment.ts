// src/test-payment.ts
import { checkBitcoinBalance } from './lib/checkPayment';

async function runPaymentTest() {
    console.log("💰 Payment check test starting...");

    // Rich Binance wallet (for testing balance visibility)
    const richAddress = "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h";

    // Your empty address (Index 0)
    // Enter the address you see in Electrum here:
    const myAddress = "bc1qtkaaeqjg889vxdh7m846va7ah5mat5g4nq3cjp";

    const balanceRich = await checkBitcoinBalance(richAddress);
    const balanceMe = await checkBitcoinBalance(myAddress);

    console.log(`-------------------------------------------`);
    console.log(`🏦 Binance Wallet Balance: ${balanceRich} BTC`);
    console.log(`🏠 My Wallet Balance:     ${balanceMe} BTC`);
    console.log(`-------------------------------------------`);

    if (balanceRich > 0) {
        console.log("✅ API is working! We can fetch balance.");
    } else {
        console.log("❌ Error: balance could not be read.");
    }
}

runPaymentTest();