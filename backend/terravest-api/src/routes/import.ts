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
        // 💰 KÜSÜRATLI TOKEN FİYATLANDIRMA ($50 - $100 Arası)
        // ============================================================

        // 1. Fiyatı Cent'e çevir (Örn: $350,000 -> 35,000,000 Cent)
        const priceInCents = Math.round(price * 100);

        // 2. Token Başına İstenen Fiyat Aralığı (Cent)
        const minTargetPrice = 5000;  // $50.00
        const maxTargetPrice = 10000; // $100.00

        // 3. Olası En Az ve En Çok Token Sayısını Hesapla
        // (Toplam Fiyat / $100) = En Az Token Sayısı
        // (Toplam Fiyat / $50) = En Çok Token Sayısı
        const minTokens = Math.ceil(priceInCents / maxTargetPrice);
        const maxTokens = Math.floor(priceInCents / minTargetPrice);

        // 4. Bu aralıkta RASTGELE bir Token Sayısı seç
        // Örn: 3500 ile 7000 arasında rastgele bir sayı -> 5432
        let totalTokens = Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;

        // Güvenlik: Eğer ev çok ucuzsa token sayısı 0 olmasın
        if (totalTokens < 10) totalTokens = 10;

        // 5. Nihai Token Fiyatını Geri Hesapla
        // 35,000,000 / 5432 = 6443.3 Cent -> $64.43
        // Bu işlem sonucunda fiyatın "düz" ($50.00) çıkma ihtimali neredeyse imkansızdır.
        const finalTokenPrice = Math.floor(priceInCents / totalTokens);

        // 6. Satış Simülasyonu (%20 - %60 arası satılmış göster)
        const soldPercentage = 0.20 + (Math.random() * 0.40);
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
            finalTokenPrice, // Hesaplanan Küsüratlı Fiyat
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