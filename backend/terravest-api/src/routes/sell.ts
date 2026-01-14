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

        // Check property existence first
        const property = await db.prepare("SELECT token_price FROM properties WHERE id = ?").bind(property_id).first();

        if (!property || !property.token_price) {
            return errorResponse("Property not found or price not set", 404);
        }

        // Check if user has sufficient investment
        const investment = await db.prepare("SELECT * FROM investments WHERE user_id = ? AND property_id = ?").bind(user.id, property_id).first();
        if (!investment || (investment.token_amount as number) < token_amount) {
            return errorResponse("Insufficient tokens to sell", 400);
        }

        // Calculate price and fees

        const rawReturn = Number(property.token_price) * token_amount; // Gross sale amount
        const fee = rawReturn * TRADING_FEE_RATE; // Trading fee
        const netReturn = rawReturn - fee; // Net amount to credit user

        // Atomic transaction operations
        const queries = [];

        // SECURITY FIX: Decrease investment token amount WITH condition to prevent negative amounts
        // This prevents race conditions where two concurrent requests could both pass the initial check
        queries.push(
            db.prepare("UPDATE investments SET token_amount = token_amount - ?, total_invested = COALESCE(total_invested, 0) - ? WHERE id = ? AND token_amount >= ?")
                .bind(token_amount, rawReturn, investment.id, token_amount)
        );

        // Increase property token stock
        queries.push(
            db.prepare("UPDATE properties SET available_tokens = available_tokens + ? WHERE id = ?").bind(token_amount, property_id)
        );

        // Credit user balance with net amount
        queries.push(
            db.prepare("UPDATE users SET usd_balance = usd_balance + ? WHERE id = ?").bind(netReturn, user.id)
        );

        await db.batch(queries);

        // SECURITY FIX: Verify the investment was actually updated (prevent race conditions)
        const verifyInvestment = await db.prepare("SELECT token_amount FROM investments WHERE id = ?").bind(investment.id).first();
        if (!verifyInvestment || (verifyInvestment.token_amount as number) < 0) {
            // Rollback: reverse all operations
            await db.batch([
                db.prepare("UPDATE investments SET token_amount = token_amount + ?, total_invested = COALESCE(total_invested, 0) + ? WHERE id = ?")
                    .bind(token_amount, rawReturn, investment.id),
                db.prepare("UPDATE properties SET available_tokens = available_tokens - ? WHERE id = ?").bind(token_amount, property_id),
                db.prepare("UPDATE users SET usd_balance = usd_balance - ? WHERE id = ?").bind(netReturn, user.id)
            ]);
            return errorResponse("Insufficient tokens (race condition detected). Please try again.", 409);
        }

        // Clean up: delete investment record if amount reaches zero
        if ((verifyInvestment.token_amount as number) <= 0) {
            await db.prepare("DELETE FROM investments WHERE id = ?").bind(investment.id).run();
        }

        return json({
            success: true,
            message: "Asset sold successfully. Funds added to your balance.",
            fee_deducted: fee,
            amount_added: netReturn
        });

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
    }
};