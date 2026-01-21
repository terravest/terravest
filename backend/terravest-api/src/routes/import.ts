import { Env } from "../index";
import { json, errorResponse } from "../lib/errors";

export async function handleImport(request: Request, env: Env): Promise<Response> {
    const apiKey = request.headers.get("X-IMPORT-KEY");
    if (apiKey !== "terravest-local-import-2024") {
        return errorResponse("Unauthorized", 401);
    }

    if (request.method !== "POST") return errorResponse("Method not allowed", 405);

    try {
        const body = await request.json() as any;
        const {
            title, description, location, price,
            images, rental_yield, bed, bath, sqft
        } = body;

        if (!title || !price || !location) {
            return errorResponse("Missing required fields", 400);
        }

        // Check for duplicates
        const existing = await env.terravest_db.prepare(
            "SELECT id FROM properties WHERE location = ?"
        ).bind(location).first();

        if (existing) {
            return json({ success: true, skipped: true, message: "Property already exists", id: existing.id });
        }

        // ============================================================
        // 💰 FRACTIONAL TOKEN PRICING ($50 - $100 Range)
        // ============================================================

        // 1. Convert Price to Cents (e.g., $350,000 -> 35,000,000 Cents)
        const priceInCents = Math.round(price * 100);

        // 2. Target Price Range Per Token (Cents)
        const minTargetPrice = 5000;  // $50.00
        const maxTargetPrice = 10000; // $100.00

        // 3. Calculate Min and Max Token Count
        // (Total Price / $100) = Min Token Count
        // (Total Price / $50) = Max Token Count
        const minTokens = Math.ceil(priceInCents / maxTargetPrice);
        const maxTokens = Math.floor(priceInCents / minTargetPrice);

        // 4. Select a RANDOM Token Count in this range
        let totalTokens = Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;

        // Safety: Ensure token count is not zero for cheap properties
        if (totalTokens < 10) totalTokens = 10;

        // 5. Recalculate Final Token Price
        const finalTokenPrice = Math.floor(priceInCents / totalTokens);

        // ============================================================
        // 🎲 RISK AND OCCUPANCY SIMULATION
        // ============================================================

        // 1. Risk Score: 1 (Safe) - 5 (Risky)
        // If not provided in body, generate randomly
        const riskScore = body.risk_score || Math.floor(Math.random() * 5) + 1;

        // 2. Initial Occupancy Rate
        // Higher risk -> Lower starting occupancy
        let minOcc = 0, maxOcc = 0;
        switch (riskScore) {
            case 1: minOcc = 90; maxOcc = 100; break;
            case 2: minOcc = 80; maxOcc = 95; break;
            case 3: minOcc = 70; maxOcc = 85; break;
            case 4: minOcc = 50; maxOcc = 75; break;
            case 5: minOcc = 30; maxOcc = 60; break;
            default: minOcc = 70; maxOcc = 90;
        }
        const initialOccupancy = Math.floor(Math.random() * (maxOcc - minOcc + 1)) + minOcc;
        const now = new Date().toISOString();

        // 6. Sales Simulation (20% - 60% sold)
        const soldPercentage = 0.20 + (Math.random() * 0.40);
        const soldTokens = Math.floor(totalTokens * soldPercentage);
        const availableTokens = totalTokens - soldTokens;

        const mainImageUrl = (images && images.length > 0) ? images[0] : null;

        // INSERT
        const result = await env.terravest_db.prepare(`
            INSERT INTO properties (
                title, description, location, price_usd, 
                token_price, total_tokens, available_tokens, 
                rental_yield, image_url, status,
                risk_score, occupancy_rate, last_occupancy_update
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
        `).bind(
            title,
            description || `Imported Property: ${bed}bd, ${bath}ba, ${sqft} sqft`,
            location,
            priceInCents,
            finalTokenPrice,
            totalTokens,
            availableTokens,
            rental_yield || "N/A",
            mainImageUrl,
            riskScore,
            initialOccupancy,
            now
        ).run();

        const newPropertyId = result.meta.last_row_id;

        // Gallery Images
        if (images && Array.isArray(images)) {
            const stmt = env.terravest_db.prepare(`
                INSERT INTO property_images (property_id, url, is_main, display_order) 
                VALUES (?, ?, ?, ?)
            `);
            const batch = images.map((url: string, index: number) =>
                stmt.bind(newPropertyId, url, index === 0 ? 1 : 0, index)
            );
            await env.terravest_db.batch(batch);
        }

        return json({ success: true, id: newPropertyId, message: "Imported successfully" });

    } catch (e: any) {
        console.error("Import Error:", e);
        return errorResponse(e.message || "Import failed", 500);
    }
}