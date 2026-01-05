import { Env } from "../index";
import { jwtVerify } from "jose";

export async function handleDeposits(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    // 1. Token Kontrolü (Kim bu kullanıcı?)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Token required" }), { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.id; // Token'dan gerçek ID'yi alıyoruz!

        const body = await request.json() as { amount: number; currency: string };

        if (!body.amount || body.amount <= 0) {
            return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
        }

        // 2. Veritabanına Gerçek Kullanıcı ID'si ile Kaydet
        const result = await env.terravest_db.prepare(
            "INSERT INTO deposits (user_id, amount, currency, status) VALUES (?, ?, ?, ?) RETURNING id"
        ).bind(userId, body.amount, body.currency || 'TRY', 'Pending').first();

        return new Response(JSON.stringify({
            message: "Deposit request created",
            id: result?.id,
            userId: userId, // Kontrol için ID'yi de dönelim
            status: "Pending"
        }), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}