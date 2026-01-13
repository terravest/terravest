import { requireAuth } from "../lib/auth";
import { Env } from "../index";

// Tarayıcının erişimine izin veren başlıklar
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function handleUpload(request: Request, env: Env): Promise<Response> {
    // 1. PREFLIGHT (OPTIONS) İSTEĞİNİ YÖNET
    // Tarayıcı "Dosya gönderebilir miyim?" diye sorar, buna "Evet" demeliyiz.
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: corsHeaders
        });
    }

    // 2. Sadece POST isteğine izin ver
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    try {
        // 3. Auth Kontrolü
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) {
            // Auth hatası dönerse bile CORS başlıklarını ekleyerek döndürmeliyiz
            // Yoksa tarayıcı yine "Failed to fetch" der.
            return new Response(auth.body, {
                status: auth.status,
                headers: { 
                    ...corsHeaders, 
                    "Content-Type": "application/json" 
                }
            });
        }

        // 4. Dosyayı al
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 5. Dosya ismini oluştur
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `property-${crypto.randomUUID()}.${fileExtension}`;

        // 6. R2 Bucket'a yükle
        await env.TERRAVEST_BUCKET.put(fileName, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        // 7. Public URL oluştur (Senin verdiğin link)
        const R2_PUBLIC_URL = "https://pub-bd8456f943ae4c68b14a610fc10fa1c6.r2.dev";

        return new Response(JSON.stringify({
            success: true,
            url: `${R2_PUBLIC_URL}/${fileName}`
        }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message || "Upload failed" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
}