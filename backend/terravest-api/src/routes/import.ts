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

        // Duplicate Kontrolü
        const existing = await env.terravest_db.prepare(
            "SELECT id FROM properties WHERE location = ?"
        ).bind(location).first();

        if (existing) {
            return json({ success: true, skipped: true, message: "Property already exists", id: existing.id });
        }

        // ============================================================
        // 💰 FINANCIAL INTEGRITY FIX: Convert to CENTS (INTEGER)
        // ============================================================
        // Gelen 'price' float olabilir (örn: 500000.50)
        // Veritabanına Cent olarak kaydediyoruz (50000050)
        const priceInCents = Math.round(price * 100);

        // Akıllı Token Fiyatlandırması (Cent bazında)
        // Hedef: $50 - $100 arası (5000 - 10000 cents)
        let tokenPriceCents = 5000; // Varsayılan $50.00

        if (priceInCents % 10000 === 0) { // $100'a tam bölünüyorsa
            tokenPriceCents = 10000; // $100.00
        } else if (priceInCents % 5000 === 0) { // $50'a tam bölünüyorsa
            tokenPriceCents = 5000;  // $50.00
        }

        const totalTokens = Math.floor(priceInCents / tokenPriceCents);
        const mainImageUrl = (images && images.length > 0) ? images[0] : null;

        // INSERT (Integer Değerler)
        const result = await env.terravest_db.prepare(`
            INSERT INTO properties (
                title, description, location, price_usd, 
                token_price, total_tokens, available_tokens, 
                rental_yield, image_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `).bind(
            title,
            description || `Imported Property: ${bed}bd, ${bath}ba, ${sqft} sqft`,
            location,
            priceInCents,    // <-- Cent olarak kaydediliyor
            tokenPriceCents, // <-- Cent olarak kaydediliyor
            totalTokens,
            totalTokens,
            rental_yield || "N/A",
            mainImageUrl
        ).run();

        const newPropertyId = result.meta.last_row_id;

        // Galeri Resimleri (Değişiklik yok)
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