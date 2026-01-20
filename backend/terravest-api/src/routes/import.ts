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
        // 💰 AKILLI TOKEN FİYATLANDIRMA ALGORİTMASI
        // ============================================================

        // 1. Fiyatı Cent'e çevir (Tam Sayı)
        const priceInCents = Math.round(price * 100);

        // 2. Evin Değerine Göre Token Fiyatı Seç (Variety)
        let targetTokenPrice = 5000; // Varsayılan $50.00

        if (price < 300000) {
            // Ucuz evler ($300k altı) -> $25.00 Token
            targetTokenPrice = 2500;
        } else if (price > 800000) {
            // Lüks evler ($800k üstü) -> $100.00 Token
            targetTokenPrice = 10000;
        } else {
            // Orta segment -> $50.00 Token
            targetTokenPrice = 5000;
        }

        // Biraz rastgelelik ekle (Hepsi aynı olmasın)
        // %30 ihtimalle standart dışı fiyat ata
        const rand = Math.random();
        if (rand > 0.8) targetTokenPrice = 10000; // Bazen $100
        else if (rand > 0.9) targetTokenPrice = 2000;  // Nadiren $20

        // 3. Toplam Token Sayısını Hesapla (Tam Sayı olmak zorunda)
        const totalTokens = Math.floor(priceInCents / targetTokenPrice);

        // 4. Token Fiyatını Geri Hesapla (Kuruş hatası olmaması için)
        // Örn: Ev $350,050 ise ve 7000 token varsa, fiyat $50.007 olamaz.
        // Bu yüzden token fiyatını, toplam fiyata tam oturacak şekilde revize ediyoruz.
        const finalTokenPrice = Math.floor(priceInCents / totalTokens);

        // 5. Satış Simülasyonu (%15 - %45 arası satılmış gibi göster)
        const soldPercentage = 0.15 + (Math.random() * 0.30);
        const soldTokens = Math.floor(totalTokens * soldPercentage);
        const availableTokens = totalTokens - soldTokens;

        const mainImageUrl = (images && images.length > 0) ? images[0] : null;

        // INSERT
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
            finalTokenPrice, // Hesaplanan Nihai Token Fiyatı (Cent)
            totalTokens,
            availableTokens,
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