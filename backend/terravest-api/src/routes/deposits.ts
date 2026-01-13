import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../index';
import { requireAuth } from '../lib/auth';
import { validationError, errorResponse } from '../lib/errors';
import { generateWasabiAddress } from '../lib/bitcoin';

const app = new Hono<{ Bindings: Env }>();

// Validation Schema
const DepositRequestSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
});

// Endpoint: POST /api/deposits/generate-address
app.post('/generate-address', async (c) => {
    // 1. Auth Check
    const auth = await requireAuth(c.req.raw, c.env);
    if (auth instanceof Response) return auth;
    const userId = auth.user.id;

    try {
        const body = await c.req.json();

        // Validate input
        const validation = DepositRequestSchema.safeParse(body);
        if (!validation.success) {
            return c.json({ error: validation.error.issues[0]?.message || "Validation failed" }, 400);
        }

        const { amount } = validation.data;
        const db = c.env.terravest_db;
        const masterKey = c.env.WASABI_XPUB; // Get from .dev.vars

        // Security Check: Is XPUB configured?
        if (!masterKey) {
            return c.json({ error: "Server configuration error (Missing XPUB)" }, 500);
        }

        // 2. Find the last used derivation index from DB
        // If table is empty, start from 0.
        const lastRecord = await db.prepare("SELECT MAX(derivation_index) as max_idx FROM deposits").first();

        let nextIndex = 0;
        if (lastRecord && typeof lastRecord.max_idx === 'number') {
            nextIndex = lastRecord.max_idx + 1;
        }

        // 3. Generate NEW Unique Address using Wasabi Logic
        const newAddress = generateWasabiAddress(masterKey, nextIndex);

        // 4. Save to 'deposits' table with status 'pending'
        const result = await db.prepare(`
            INSERT INTO deposits (user_id, amount_usd, deposit_address, derivation_index, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
            RETURNING id
        `).bind(userId, amount, newAddress, nextIndex).first();

        if (!result) {
            throw new Error("Failed to insert deposit record");
        }

        // 5. Return to Frontend
        return c.json({
            success: true,
            depositId: result.id,
            address: newAddress,
            amount: amount,
            index: nextIndex,
            message: "Send Bitcoin to the generated address"
        });

    } catch (e: any) {
        return c.json({ error: e.message || "Failed to generate deposit address" }, 500);
    }
});

export default app;