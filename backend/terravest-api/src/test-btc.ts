// src/test-btc.ts

// Call our custom function
// If file path is different, update here (e.g., ../lib/bitcoin)
import { generateDepositAddress } from './lib/bitcoin';

async function runTest() {
    console.log("\n========================================");
    console.log("🧪 BITCOIN ADDRESS GENERATION TEST STARTING");
    console.log("========================================");

    // Compare with first 3 addresses in Electrum
    const address0 = generateDepositAddress(0);
    const address1 = generateDepositAddress(1);
    const address2 = generateDepositAddress(2);

    console.log(`🔹 Index 0: ${address0}`);
    console.log(`🔹 Index 1: ${address1}`);
    console.log(`🔹 Index 2: ${address2}`);

    console.log("========================================\n");
    console.log("👉 NOW OPEN ELECTRUM AND COMPARE WITH FIRST 3 ADDRESSES IN 'ADDRESSES' TAB.");
}

runTest();