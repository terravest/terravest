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
        // 💰 TOKEN EKONOMİSİ & SATIŞ SİMÜLASYONU
        // ============================================================

        // 1. Fiyatı Cent'e çevir
        const priceInCents = Math.round(price * 100);

        // 2. Token Fiyatını Belirle ($50 - $100 arası)
        let tokenPriceCents = 5000; // Varsayılan $50.00
        if (priceInCents % 10000 === 0) {
            tokenPriceCents = 10000; // $100.00
        } else if (priceInCents % 5000 === 0) {
            tokenPriceCents = 5000;  // $50.00
        }

        const totalTokens = Math.floor(priceInCents / tokenPriceCents);

        // 3. ✨ YENİ: Satılmış Gösterme Mantığı (%20 - %40 arası satılmış olsun)
        // Math.random() 0.0 ile 1.0 arası sayı üretir.
        // Formül: 0.20 + (0.0~0.20) = 0.20 ile 0.40 arası
        const soldPercentage = 0.20 + (Math.random() * 0.20);
        const soldTokens = Math.floor(totalTokens * soldPercentage);

        // Kalan tokenları hesapla
        const availableTokens = totalTokens - soldTokens;


        const mainImageUrl = (images && images.length > 0) ? images[0] : null;

        // INSERT (available_tokens artık total_tokens ile aynı değil)
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
            priceInCents,
            tokenPriceCents,
            totalTokens,
            availableTokens, // <-- Hesaplanan miktar (%60-%80 arası)
            rental_yield || "N/A",
            mainImageUrl
        ).run();

        const newPropertyId = result.meta.last_row_id;

        // Galeri Resimleri
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