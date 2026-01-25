import { Context } from 'hono';
import type { Env } from '../index';

export const chatHandler = async (c: Context<{ Bindings: Env }>) => {
    try {
        // 1. Güvenli JSON parse
        let body;
        try {
            body = await c.req.json();
        } catch (e) {
            return c.json({ error: "Invalid JSON body" }, 400);
        }

        const { message, history, language } = body;

        // 2. API Key Kontrolü
        if (!c.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY eksik!");
            return c.json({ error: "Server Configuration Error: GEMINI_API_KEY is missing." }, 500);
        }

        // 3. Dil Talimatı
        let langInstruction = "Answer primarily in English.";
        if (language === 'pt-br') langInstruction = "The user is currently on the Brazilian Portuguese version of the site. PLEASE ANSWER IN PORTUGUESE (PT-BR).";
        else if (language === 'es') langInstruction = "The user is currently on the Spanish version of the site. PLEASE ANSWER IN SPANISH.";
        else if (language === 'fr') langInstruction = "The user is currently on the French version of the site. PLEASE ANSWER IN FRENCH.";

        const SYSTEM_PROMPT = `
        You are the AI Support Assistant for "TerraVest".
        TerraVest is a platform for tokenized real estate investments.
        
        CONTEXT:
        ${langInstruction}

        KEY INFORMATION:
        - Mission: Combine Florida real estate stability with blockchain agility.
        - Currency: Users invest in USD/Crypto, receive rents in Bitcoin (BTC).
        - Minimum Investment: Starts at just $50.
        - Legal: Each property is held by a unique LLC in the US.
        - Security: "The property is the safest investment, Bitcoin is the best store of value."
        
        BEHAVIOR:
        - Be polite, professional, and concise.
        - IF YOU CANNOT SOLVE THE PROBLEM: Reply exactly with "I cannot solve this specifically. Please contact support@terravest.homes".
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

        // 4. Gemini İsteği
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("🔥 Gemini API Error:", response.status, errorText);
            return c.json({ error: `Gemini API Error: ${response.status}`, details: errorText }, 500);
        }

        const data = await response.json() as any;
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            return c.json({ error: "AI returned empty response", raw: data }, 500);
        }

        return c.json({ response: aiResponse });

    } catch (e: any) {
        console.error("🔥 INTERNAL SERVER ERROR:", e);
        return c.json({ error: "Internal Server Error", message: e.message }, 500);
    }
};