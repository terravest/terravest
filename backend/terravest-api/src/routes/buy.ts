import { Env } from "../index";
import { BuySchema } from "../lib/validators";
import { requireAuth } from "../lib/auth";
import { json, validationError, errorResponse } from "../lib/errors";

export async function handleBuy(request: Request, env: Env): Promise<Response> {
    // 1️⃣ Auth
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user;

    // 2️⃣ Body + validation
    let body: any;
    try {
        body = await request.json();
    } catch (e) {
        return errorResponse("Invalid JSON body", 400);
    }

    const validation = BuySchema.safeParse(body);
    if (!validation.success) {
        return validationError(validation.error);
    }

    const { propertyId, tokenAmount } = validation.data;

    // 3️⃣ Property
    const property = await env.terravest_db
        .prepare("SELECT * FROM properties WHERE id = ?")
        .bind(propertyId)
        .first();

    if (!property) return errorResponse("Property not found", 404);

    // 💰 FINANCIAL INTEGRITY: Integer Math (Cents)
    // token_price veritabanında Cent olarak saklanır (örn: 5000 = $50.00)
    const pricePerTokenCents = property.token_price;
    const totalCostCents = pricePerTokenCents * tokenAmount;

    // Check user balance (stored in Cents)
    const currentUser = await env.terravest_db
        .prepare("SELECT usd_balance FROM users WHERE id = ?")
        .bind(user.id)
        .first();

    if (!currentUser || (currentUser.usd_balance as number) < totalCostCents) {
        return errorResponse("Insufficient balance", 400);
    }

    // Atomic database operations
    try {
        // Decrease property token stock
        const stockUpdate = await env.terravest_db.prepare(`
            UPDATE properties
            SET available_tokens = available_tokens - ?
            WHERE id = ? AND available_tokens >= ?
        `)
            .bind(tokenAmount, propertyId, tokenAmount)
            .run();

        if (stockUpdate.meta.changes === 0) {
            return errorResponse("Not enough tokens available", 409);
        }

        // Decrease user balance (Cents)
        const balanceUpdate = await env.terravest_db.prepare(`
            UPDATE users
            SET usd_balance = usd_balance - ?
            WHERE id = ? AND usd_balance >= ?
        `)
            .bind(totalCostCents, user.id, totalCostCents)
            .run();

        if (balanceUpdate.meta.changes === 0) {
            // Rollback stock update if balance fails (race condition safety)
            await env.terravest_db.prepare(`
                UPDATE properties
                SET available_tokens = available_tokens + ?
                WHERE id = ?
            `).bind(tokenAmount, propertyId).run();

            return errorResponse("Insufficient funds (race condition)", 409);
        }

        // Create investment record (Storing values in Cents)
        // ON CONFLICT: Add to existing investment if user already owns tokens of this property
        await env.terravest_db.prepare(`
            INSERT INTO investments (
                user_id, property_id, token_amount, purchase_price, 
                total_cost, total_invested, last_rent_calc_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, property_id) DO UPDATE SET 
                token_amount = token_amount + excluded.token_amount,
                total_cost = total_cost + excluded.total_cost,
                total_invested = total_invested + excluded.total_invested
        `)
            .bind(
                user.id,
                propertyId,
                tokenAmount,
                pricePerTokenCents, // Cent
                totalCostCents,     // Cent
                totalCostCents,     // Cent (Total Invested tracking)
                new Date().toISOString()
            )
            .run();

        // Optional: Transaction Log
        await env.terravest_db.prepare(
            "INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, 'buy', ?, ?, CURRENT_TIMESTAMP)"
        ).bind(user.id, -totalCostCents, `Bought ${tokenAmount} tokens`, user.id).run();

        return json({
            message: "Tokens purchased successfully",
            totalCost: totalCostCents, // Backend returns Cents
        }, 201);

    } catch (e: any) {
        console.error(e);
        return errorResponse("Internal server error", 500);
    }
}