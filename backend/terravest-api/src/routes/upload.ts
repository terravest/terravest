import { requireAuth } from "../lib/auth";
import { Env } from "../index";

// Headers that allow browser access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function handleUpload(request: Request, env: Env): Promise<Response> {
    // 1. HANDLE PREFLIGHT (OPTIONS) REQUEST
    // Browser asks "Can I send a file?", we must say "Yes".
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: corsHeaders
        });
    }

    // 2. Only allow POST requests
    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    try {
        // 3. Auth Check
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) {
            // Even if auth error is returned, we must return with CORS headers
            // Otherwise browser will say "Failed to fetch" again
            return new Response(auth.body, {
                status: auth.status,
                headers: { 
                    ...corsHeaders, 
                    "Content-Type": "application/json" 
                }
            });
        }

        // 4. Get file
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new Response(JSON.stringify({ error: "No file uploaded" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 5. Create file name
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `property-${crypto.randomUUID()}.${fileExtension}`;

        // 6. Upload to R2 Bucket
        await env.TERRAVEST_BUCKET.put(fileName, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        // 7. Create Public URL (Link you provided)
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