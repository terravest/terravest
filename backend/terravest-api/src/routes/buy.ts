import { requireAuth } from "../middleware/auth";
import { Env } from "../index";

// BTC Cüzdan Havuzu (Buraya kendi cüzdanlarını ekleyebilirsin)
const BTC_WALLET_POOL = [
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    "bc1q5d7rjq7g6r42y3w0s8t9z1x4u6i7o8p9a0s1d"
];

export async function handleBuy(request: Request, env: Env): Promise<Response> {
    // 1. Auth Check
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    const user = auth.user as any;

    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    try {
        // FRONTEND'DEN GELEN VERİ: Token Adedi (Miktar değil)
        const body = await request.json() as { property_id: number; token_amount: number };
        const { property_id, token_amount } = body;

        // Validation
        if (!property_id || !token_amount || token_amount <= 0) {
            return json({ error: "Invalid property ID or token amount" }, 400);
        }

        // 2. Mülk Bilgilerini Çek
        const property = await env.terravest_db.prepare(
            "SELECT * FROM properties WHERE id = ?"
        ).bind(property_id).first();

        if (!property) {
            return json({ error: "Property not found" }, 404);
        }

        // 3. Fiyat Hesaplama
        const priceUsd = property.price_usd as number;
        const totalTokens = property.total_tokens as number;
        const unitPrice = priceUsd / totalTokens; // 1 Token Fiyatı

        const totalPrice = unitPrice * token_amount; // Toplam Tutar

        // Stok Kontrolü
        if ((property.available_tokens as number) < token_amount) {
            return json({ error: "Not enough tokens available" }, 400);
        }

        // 4. Havuzdan Rastgele Bir BTC Adresi Seç (Load Balancing)
        const selectedAddress = BTC_WALLET_POOL[Math.floor(Math.random() * BTC_WALLET_POOL.length)];

        // 5. SİPARİŞİ KAYDET
        // Not: 'payment_status' yerine şemamızdaki 'status' kullanıyoruz.
        // 'total_price_usd' yerine 'total_price' kullanıyoruz.
        const result = await env.terravest_db.prepare(
            `INSERT INTO orders (user_id, property_id, token_amount, total_price, status, payment_address, order_date)
             VALUES (?, ?, ?, ?, 'pending', ?, ?)`
        ).bind(
            user.id,
            property_id,
            token_amount,
            totalPrice,
            selectedAddress, // Seçilen adres bu siparişe kilitlenir
            new Date().toISOString()
        ).run();

        // Yeni oluşturulan Siparişin ID'sini al (D1 için meta.last_row_id)
        const orderId = result.meta.last_row_id;



        // 6. Başarılı Yanıt Dön
        return json({
            success: true,
            message: "Order created successfully.",
            order: {
                id: orderId,
                property_title: property.title,
                token_amount: token_amount,
                total_price: totalPrice,
                payment_address: selectedAddress,
                status: 'pending'
            }
        });

    } catch (e: any) {
        return json({ error: e.message }, 500);
    }
}

// Helper Function
function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
    });
}