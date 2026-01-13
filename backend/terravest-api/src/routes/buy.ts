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

    const pricePerToken = Number(property.token_price);
    const totalCost = pricePerToken * tokenAmount;

    // Check user balance
    const currentUser = await env.terravest_db
        .prepare("SELECT usd_balance FROM users WHERE id = ?")
        .bind(user.id)
        .first();

    if (!currentUser || Number(currentUser.usd_balance) < totalCost) {
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

        // Decrease user balance
        const balanceUpdate = await env.terravest_db.prepare(`
            UPDATE users
            SET usd_balance = usd_balance - ?
            WHERE id = ? AND usd_balance >= ?
        `)
            .bind(totalCost, user.id, totalCost)
            .run();

        if (balanceUpdate.meta.changes === 0) {
            // Rollback stock update
            await env.terravest_db.prepare(`
                UPDATE properties
                SET available_tokens = available_tokens + ?
                WHERE id = ?
            `).bind(tokenAmount, propertyId).run();

            return errorResponse("Insufficient funds (race condition)", 409);
        }

        // Create investment record with last_rent_calc_date set to today
        // This ensures rewards start accruing from tomorrow
        await env.terravest_db.prepare(`
            INSERT INTO investments (user_id, property_id, token_amount, purchase_price, total_cost, last_rent_calc_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `)
            .bind(user.id, propertyId, tokenAmount, pricePerToken, totalCost, new Date().toISOString())
            .run();

        return json({
            message: "Tokens purchased successfully",
            totalCost,
        }, 201);

    } catch (e: any) {
        return errorResponse("Internal server error", 500);
    }
}
