import { requireAuth } from "../middleware/auth";
import { Env } from "../index";

export async function handleProperties(request: Request, env: Env): Promise<Response> {
    const method = request.method;

    // ----------------------------------------------------
    // GET (PUBLIC): Sadece Aktif Olanları Göster
    // ----------------------------------------------------
    if (method === "GET") {
        try {
            // "status" sütunu olmayan eski kayıtlar varsa onları da görmek için OR status IS NULL ekledik
            const { results } = await env.terravest_db.prepare(
                `SELECT * FROM properties WHERE status IS NOT 'deleted' OR status IS NULL ORDER BY created_at DESC`).all();
            return json(results);
        } catch (e: any) {
            return json({ error: e.message }, 500);
        }
    }

    // ----------------------------------------------------
    // POST (ADMIN): Yeni Ekle
    // ----------------------------------------------------
    if (method === "POST") {
        const auth = await requireAuth(request, env);
        const { title, description, price_usd, total_tokens, image_url, monthly_yield } = body;
        if (auth instanceof Response) return auth;

        try {
            const body = await request.json() as any;
            // 1. image_url'i de alıyoruz
            const { title, description, price_usd, total_tokens, image_url } = body;

            if (!title || !price_usd || !total_tokens) {
                return json({ error: "Missing required fields" }, 400);
            }

            // 2. INSERT sorgusuna image_url sütununu ve değerini ekliyoruz
            await env.terravest_db.prepare(
                `INSERT INTO properties (title, description, price_usd, total_tokens, available_tokens, status, image_url, monthly_yield) 
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
            ).bind(title, description, price_usd, total_tokens, total_tokens, image_url || null, monthly_yield || 0).run();
            // (image_url || null) dedik ki, eğer boş bırakılırsa veritabanına NULL yazılsın.

            return json({ success: true, message: "Property created" });
        } catch (e: any) {
            return json({ error: e.message }, 500);
        }
    }

    // ----------------------------------------------------
    // DELETE (ADMIN): Soft Delete (Pasife Çek)
    // ----------------------------------------------------
    if (method === "DELETE") {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;

        try {
            const body = await request.json() as { id: number };

            if (!body.id) return json({ error: "Property ID required" }, 400);

            // DELETE yerine UPDATE ile status'u 'deleted' yapıyoruz
            await env.terravest_db.prepare(
                "UPDATE properties SET status = 'deleted' WHERE id = ?"
            ).bind(body.id).run();

            return json({ success: true, message: "Property deactivated (Soft Delete)" });
        } catch (e: any) {
            return json({ error: e.message }, 500);
        }
    }

    return json({ error: "Method not allowed" }, 405);
}

// --------------------
// JSON HELPER (TEK SEFER TANIMLANDI)
// --------------------
function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
    });
}