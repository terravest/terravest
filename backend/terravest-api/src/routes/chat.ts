import { Context } from 'hono';
import type { Env } from '../index';

export const chatHandler = async (c: Context<{ Bindings: Env }>) => {
    try {
        let body;
        try {
            body = await c.req.json();
        } catch (e) {
            return c.json({ error: "Invalid JSON body" }, 400);
        }

        const { message, history, language } = body;

        // API Key Kontrolü
        if (!c.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY eksik!");
            return c.json({ error: "Server Configuration Error: GEMINI_API_KEY is missing." }, 500);
        }

        // Dil Talimatı
        let langInstruction = "Answer primarily in English.";
        if (language === 'pt-br') langInstruction = "The user is currently on the Brazilian Portuguese version of the site. PLEASE ANSWER IN PORTUGUESE (PT-BR).";
        else if (language === 'es') langInstruction = "The user is currently on the Spanish version of the site. PLEASE ANSWER IN SPANISH.";
        else if (language === 'fr') langInstruction = "The user is currently on the French version of the site. PLEASE ANSWER IN FRENCH.";

        // GENİŞLETİLMİŞ BİLGİ BANKASI (SYSTEM PROMPT)
        const SYSTEM_PROMPT = `
        You are the AI Support Assistant for "TerraVest".
        TerraVest is a platform for tokenized real estate investments.

        CONTEXT:
        ${langInstruction}
        
        BEHAVIOR:
        - Be polite, professional, and concise.
        - Answer based ONLY on the information below. Do not make up facts.
        - IF YOU CANNOT SOLVE THE PROBLEM: Reply exactly with "I cannot solve this specifically. Please contact support@terravest.homes".

        =========================================
        KNOWLEDGE BASE (CORE INFORMATION)
        =========================================

        1. MISSION & CONCEPT
        - Mission: Combine Florida real estate stability with blockchain agility.
        - What is TerraVest?: A platform where users invest in fractionalized, income-producing U.S. real estate tokens.
        - Tokenization: Converting ownership rights into blockchain tokens. Each token represents a defined share of a property-holding U.S. LLC.
        - Why Tokenization?: Transparency, Liquidity (easier to trade), Global Access (no borders), Lower Barriers (start small).
        - "The property is the safest investment, Bitcoin is the best store of value."

        2. INVESTMENT & CURRENCY
        - Currency Model: Users invest in USD/Crypto, but they receive rental income in BITCOIN (BTC).
        - Minimum Investment: Starts at just $50.
        - Structure: Investors hold tokens representing indirect ownership in a U.S. LLC that owns the property.
        - Risk: Investments involve risk (market fluctuations, vacancies, regulatory changes). Past performance is not indicative of future results.

        3. HOW IT WORKS (4 STEPS)
        - Step 1: Explore Marketplace (Browse vetted U.S. rental properties).
        - Step 2: Buy Tokens (Purchase fractional ownership).
        - Step 3: Daily Rent Accrual (Rent earns daily in the background based on token count).
        - Step 4: Monthly Payout (Accrued rent becomes visible/claimable in the dashboard at the start of each month).

        4. WHO CAN INVEST?
        - Open to investors from most countries worldwide.
        - NO U.S. visa, NO residency, NO American bank account required.
        - Restrictions: Sanctioned or high-risk jurisdictions are restricted.
        - KYC: Identity verification is required for withdrawal but NOT for browsing/depositing.

        5. FEES & COSTS
        - Trading Fee: 1.5% (Applied when buying/selling tokens). Covers operations & legal structuring.
        - Property Management Fee: 10% (Deducted from gross rent before distribution). Covers tenants, maintenance, insurance, taxes.
        - Withdrawal Fee: $5 + 1% (Only when transferring funds to an external wallet).

        6. WALLET & SECURITY
        - Investor Wallet: Integrated wallet to hold tokens and income. Can also connect external wallets.
        - Security: Non-custodial architecture, strong authentication, no private keys stored on TerraVest servers.
        - Income Use: Withdraw or reinvest directly into new tokens.

        7. GLOSSARY
        - U.S. LLC: A legal entity that holds the property title and limits investor liability.
        - Daily Accrual: Rent accumulates daily but shows up monthly.

        8. CONTACT
        - Email: support@terravest.homes
        `;

        const contents = [
            {
                role: "user",
                parts: [{ text: SYSTEM_PROMPT }]
            },
            ...(history || []).map((msg: any) => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            })),
            {
                role: "user",
                parts: [{ text: message }]
            }
        ];

        // 🛡️ AKILLI MODEL SEÇİCİ
        const modelsToTry = [
            "gemini-1.5-flash",        // Öncelikli
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.0-pro"
        ];

        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${c.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents })
                });

                if (response.ok) {
                    const data = await response.json() as any;
                    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (aiResponse) {
                        return c.json({ response: aiResponse });
                    }
                } else {
                    const errorText = await response.text();
                    console.warn(`⚠️ ${modelName} failed: ${response.status}`);
                    lastError = { status: response.status, message: errorText };
                }
            } catch (e: any) {
                console.warn(`⚠️ ${modelName} network error:`, e.message);
                lastError = { message: e.message };
            }
        }

        console.error("❌ All models failed:", lastError);
        return c.json({
            error: "All AI models are currently busy or unavailable.",
            details: lastError
        }, 503);

    } catch (e: any) {
        console.error("🔥 INTERNAL SERVER ERROR:", e);
        return c.json({ error: "Internal Server Error", message: e.message }, 500);
    }
};