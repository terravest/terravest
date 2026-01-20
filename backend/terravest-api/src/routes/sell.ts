import { Env } from "../index";
import { requireAuth } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";

// Trading fee rate (1.5%)
const TRADING_FEE_RATE = 0.015;

export const handleSell = async (request: Request, env: Env) => {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    try {
        const body = await request.json() as any;
        const { property_id, token_amount } = body;
        const db = env.terravest_db;

        // Input validation
        if (token_amount === undefined || token_amount === null || typeof token_amount !== 'number' || token_amount <= 0) {
            return errorResponse("token_amount is required and must be a positive number", 400);
        }

        // Check property existence
        // token_price is stored in CENTS
        const property = await db.prepare("SELECT token_price FROM properties WHERE id = ?").bind(property_id).first();

        if (!property || !property.token_price) {
            return errorResponse("Property not found or price not set", 404);
        }

        // Check if user has sufficient investment
        const investment = await db.prepare("SELECT * FROM investments WHERE user_id = ? AND property_id = ?").bind(user.id, property_id).first();
        if (!investment || (investment.token_amount as number) < token_amount) {
            return errorResponse("Insufficient tokens to sell", 400);
        }

        // 💰 FINANCIAL INTEGRITY: Integer Math (Cents)
        const unitPriceCents = property.token_price as number;

        const rawReturnCents = unitPriceCents * token_amount; // Gross sale amount (Cents)
        const feeCents = Math.floor(rawReturnCents * TRADING_FEE_RATE); // Trading fee (Cents) - Floored
        const netReturnCents = rawReturnCents - feeCents; // Net amount to credit user (Cents)

        // Atomic transaction operations
        const queries = [];

        // Decrease investment token amount
        queries.push(
            db.prepare("UPDATE investments SET token_amount = token_amount - ?, total_invested = MAX(0, COALESCE(total_invested, 0) - ?) WHERE id = ? AND token_amount >= ?")
                .bind(token_amount, rawReturnCents, investment.id, token_amount)
        );

        // Increase property token stock (Tokens return to pool)
        queries.push(
            db.prepare("UPDATE properties SET available_tokens = available_tokens + ? WHERE id = ?").bind(token_amount, property_id)
        );

        // Credit user balance with net amount (Cents)
        queries.push(
            db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(netReturnCents, user.id)
        );

        // Log Transaction
        queries.push(
            db.prepare("INSERT INTO transactions (user_id, type, amount, description) VALUES (?, 'sell', ?, ?)")
                .bind(user.id, netReturnCents, `Sold ${token_amount} tokens`)
        );

        await db.batch(queries);

        // Race condition check (Double validation)
        const verifyInvestment = await db.prepare("SELECT token_amount FROM investments WHERE id = ?").bind(investment.id).first();
        if (!verifyInvestment || (verifyInvestment.token_amount as number) < 0) {
            // Critical error: Negative balance implies race condition.
            // In a real production system with proper locking this is rare, 
            // but for SQLite D1 we rely on the WHERE clause in UPDATE.
            return errorResponse("Transaction failed verification. Please contact support.", 500);
        }

        // Cleanup: If 0 tokens left, we can keep the record for history or mark as inactive.
        // Keeping it is better for history.

        return json({
            success: true,
            message: "Asset sold successfully. Funds added to your balance.",
            fee_deducted: feeCents, // Cents
            amount_added: netReturnCents // Cents
        });

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
    }
};