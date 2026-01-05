import { jwtVerify } from "jose";
import { Env } from "../index"; // Import Env for type safety

const encoder = new TextEncoder();

export async function requireAuth(
    request: Request,
    env: Env
): Promise<{ user: any } | Response> {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return json({ error: "Missing authorization token" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");

    try {
        const secret = encoder.encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        return {
            user: payload,
        };
    } catch (err) {
        return json({ error: "Invalid or expired token" }, 401);
    }
}

// Helper to return consistent JSON responses
function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}