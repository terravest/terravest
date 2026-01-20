import { Env } from "../index";
import { BuySchema } from "../lib/validators";
import { requireAuth } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";
import { getErrorMessage, getLangFromRequest } from "../lib/i18n";

export async function handleBuy(request: Request, env: Env): Promise<Response> {
    // Auth
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    // Body + validation
    let body: any;
    try {
        body = await request.json();
    } catch {
        const lang = getLangFromRequest(request);
        return errorResponse(getErrorMessage(lang, 'INVALID_JSON'), 400);
    }
    const lang = getLangFromRequest(request, body);

    const validation = BuySchema.safeParse(body);
    if (!validation.success) {
        return errorResponse(getErrorMessage(lang, 'VALIDATION_FAILED'), 400);
    }

    const { propertyId, tokenAmount } = validation.data;

    // Property
    const property = await env.terravest_db
        .prepare("SELECT id, token_price, available_tokens FROM properties WHERE id = ?")
        .bind(propertyId)
        .first();

    if (!property) return errorResponse(getErrorMessage(lang, 'PROPERTY_NOT_FOUND'), 404);

    // Financial integrity: Integer math (cents)
    const pricePerTokenCents = Number(property.token_price);
    const totalCostCents = pricePerTokenCents * tokenAmount;
    const availableTokens = Number(property.available_tokens ?? 0);

    if (availableTokens < tokenAmount) {
        return errorResponse(getErrorMessage(lang, 'NOT_ENOUGH_TOKENS'), 409);
    }

    // Check user balance (stored in cents)
    const currentUser = await env.terravest_db
        .prepare("SELECT usd_balance FROM users WHERE id = ?")
        .bind(user.id)
        .first();

    if (!currentUser || Number(currentUser.usd_balance) < totalCostCents) {
        return errorResponse(getErrorMessage(lang, 'INSUFFICIENT_BALANCE'), 400);
    }

    // Atomic database operations
    try {
        await env.terravest_db.batch([
            env.terravest_db.prepare(`
                UPDATE properties
                SET available_tokens = available_tokens - ?
                WHERE id = ?
            `).bind(tokenAmount, propertyId),
            env.terravest_db.prepare(`
                UPDATE users
                SET usd_balance = usd_balance - ?
                WHERE id = ?
            `).bind(totalCostCents, user.id),
            env.terravest_db.prepare(`
                INSERT INTO investments (
                    user_id, property_id, token_amount, purchase_price,
                    total_cost, total_invested, last_rent_calc_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, property_id) DO UPDATE SET
                    token_amount = token_amount + excluded.token_amount,
                    total_cost = total_cost + excluded.total_cost,
                    total_invested = total_invested + excluded.total_invested
            `).bind(
                user.id,
                propertyId,
                tokenAmount,
                pricePerTokenCents,
                totalCostCents,
                totalCostCents,
                new Date().toISOString()
            ),
            env.terravest_db.prepare(
                "INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, 'buy', ?, ?, CURRENT_TIMESTAMP)"
            ).bind(user.id, -totalCostCents, `Bought ${tokenAmount} tokens`)
        ]);

        return json({
            message: "Tokens purchased successfully",
            totalCost: totalCostCents, // Backend returns Cents
        }, 201);

    } catch (e: any) {
        const errorMessage = String(e?.message || '');
        if (errorMessage.includes('CHECK constraint failed')) {
            const [freshProperty, freshUser] = await Promise.all([
                env.terravest_db.prepare("SELECT available_tokens FROM properties WHERE id = ?").bind(propertyId).first(),
                env.terravest_db.prepare("SELECT usd_balance FROM users WHERE id = ?").bind(user.id).first()
            ]);

            if (!freshProperty || Number(freshProperty.available_tokens) < tokenAmount) {
                return errorResponse(getErrorMessage(lang, 'NOT_ENOUGH_TOKENS'), 409);
            }
            if (!freshUser || Number(freshUser.usd_balance) < totalCostCents) {
                return errorResponse(getErrorMessage(lang, 'INSUFFICIENT_BALANCE'), 409);
            }
            return errorResponse(getErrorMessage(lang, 'BUY_FAILED'), 409);
        }
        console.error(e);
        return errorResponse("Internal server error", 500);
    }
}