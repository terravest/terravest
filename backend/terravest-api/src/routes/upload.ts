import { requireAuth } from "../lib/auth";
import { Env } from "../index";
import { json, errorResponse } from "../lib/errors";

export async function handleUpload(request: Request, env: Env): Promise<Response> {
    // 1. Sadece Adminler yükleyebilir (Auth kontrolü)
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    if (request.method !== "POST") return errorResponse("Method not allowed", 405);

    try {
        // 2. Dosyayı form-data olarak al
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) return errorResponse("No file uploaded", 400);

        // 3. Dosyaya benzersiz bir isim ver (çakışmasın diye)
        const fileExtension = file.name.split('.').pop();
        const fileName = `property-${crypto.randomUUID()}.${fileExtension}`;

        // 4. R2 Bucket'a kaydet
        await env.TERRAVEST_BUCKET.put(fileName, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        // 5. Public URL'i döndür (BURAYA ADIM 3'TEKİ KENDİ R2 LINKINI YAZ)
        // Örn: https://pub-123456.r2.dev
        const R2_PUBLIC_URL = "https://pub-bd8456f943ae4c68b14a610fc10fa1c6.r2.dev";

        return json({
            success: true,
            url: `${R2_PUBLIC_URL}/${fileName}`
        });

    } catch (e: any) {
        return errorResponse(e.message || "Upload failed", 500);
    }
}