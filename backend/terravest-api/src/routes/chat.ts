import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../index';

const app = new Hono<{ Bindings: Env }>();

// Site Hakkında Bilgi Bankası (AI burayı okuyarak cevap verecek)
const SYSTEM_PROMPT = `
You are the AI Support Assistant for "TerraVest".
TerraVest is a platform for tokenized real estate investments.

KEY INFORMATION:
- Mission: Combine Florida real estate stability with blockchain agility.
- Currency: Users invest in USD/Crypto, receive rents in Bitcoin (BTC).
- Minimum Investment: Starts at just $50.
- Legal: Each property is held by a unique LLC in the US.
- Security: "The property is the safest investment, Bitcoin is the best store of value."
- How it works: We fractionize high-end properties. Users buy tokens representing a share.
- KYC: Identity verification is required for withdrawal but not for browsing.

BEHAVIOR:
- Be polite, professional, and concise.
- Answer primarily in the language the user asks (English, Portuguese, or Spanish).
- If the user asks something technical you don't know, DO NOT make it up.
- IF YOU CANNOT SOLVE THE PROBLEM: Reply exactly with "I cannot solve this specifically. Please contact support." and provide the email "support@terravest.homes".
`;

app.post('/api/chat', async (c) => {
    try {
        // 1. Language parametresini al
        const { message, history, language } = await c.req.json();

        if (!c.env.GEMINI_API_KEY) {
            return c.json({ error: "AI Service not configured" }, 500);
        }

        // 2. Dil Talimatı Oluştur
        let langInstruction = "Answer primarily in English.";
        if (language === 'pt-br') langInstruction = "The user is currently on the Brazilian Portuguese version of the site. PLEASE ANSWER IN PORTUGUESE (PT-BR).";
        else if (language === 'es') langInstruction = "The user is currently on the Spanish version of the site. PLEASE ANSWER IN SPANISH.";
        else if (language === 'fr') langInstruction = "The user is currently on the French version of the site. PLEASE ANSWER IN FRENCH.";

        const DYNAMIC_SYSTEM_PROMPT = `
        You are the AI Support Assistant for "TerraVest".
        TerraVest is a platform for tokenized real estate investments.
        
        CONTEXT:
        ${langInstruction} (This is very important).

        KEY INFORMATION:
        - Mission: Combine Florida real estate stability with blockchain agility.
        - Currency: Users invest in USD/Crypto, receive rents in Bitcoin (BTC).
        - Minimum Investment: Starts at just $50.
        - Legal: Each property is held by a unique LLC in the US.
        - Security: "The property is the safest investment, Bitcoin is the best store of value."
        
        BEHAVIOR:
        - Be polite, professional, and concise.
        - IF YOU CANNOT SOLVE THE PROBLEM: Reply with "I cannot solve this specifically. Please contact support@terravest.homes".
        `;

        const contents = [
            {
                role: "user",
                parts: [{ text: DYNAMIC_SYSTEM_PROMPT }]
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

        // ... fetch isteği aynı kalacak ...
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        // ... (kalan kısımlar aynı)
        const data = await response.json() as any;
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Connection error.";
        return c.json({ response: aiResponse });

    } catch (e: any) {
        // ...
        return c.json({ error: e.message }, 500);
    }
});