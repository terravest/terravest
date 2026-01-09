import { Env } from "../index";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { RegisterSchema, LoginSchema } from "../lib/validators";

/* =========================
   REGISTER
========================= */
export async function handleRegister(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json();

        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return new Response(
                JSON.stringify({ error: validation.error.errors[0].message }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { email, username, password } = validation.data;

        const existingUser = await env.terravest_db
            .prepare("SELECT id, email, username FROM users WHERE email = ? OR username = ?")
            .bind(email, username)
            .first();

        if (existingUser) {
            const errorMsg =
                existingUser.email === email
                    ? "Email already registered"
                    : "Username already taken";

            return new Response(JSON.stringify({ error: errorMsg }), {
                status: 409,
                headers: { "Content-Type": "application/json" }
            });
        }

        const role = "user";

        const result = await env.terravest_db
            .prepare(`
                INSERT INTO users (email, username, password, role, usd_balance)
                VALUES (?, ?, ?, ?, 0)
            `)
            .bind(email, username, password, role)
            .run();

        if (!result.success) {
            return new Response(JSON.stringify({ error: "Failed to register user" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(
            JSON.stringify({
                message: "User registered successfully",
                user: { email, username, role, usd_balance: 0 }
            }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/* =========================
   LOGIN
========================= */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json();

        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return new Response(
                JSON.stringify({ error: validation.error.errors[0].message }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { identifier, password } = validation.data;

        const user = await env.terravest_db
            .prepare(`
                SELECT id, email, username, role, usd_balance
                FROM users
                WHERE (email = ? OR username = ?) AND password = ?
            `)
            .bind(identifier, identifier, password)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const safeBalance =
            user.usd_balance === null || user.usd_balance === undefined
                ? 0
                : Number(user.usd_balance);

        const token = await jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
            },
            env.JWT_SECRET
        );

        return new Response(
            JSON.stringify({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    usd_balance: safeBalance
                }
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/* =========================
   AUTH / ME
========================= */
export async function handleMe(request: Request, env: Env): Promise<Response> {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const userId = auth.user.id;

    try {
        const user = await env.terravest_db
            .prepare(`
                SELECT id, email, username, role, usd_balance
                FROM users
                WHERE id = ?
            `)
            .bind(userId)
            .first();

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        const safeBalance =
            user.usd_balance === null || user.usd_balance === undefined
                ? 0
                : Number(user.usd_balance);

        return new Response(
            JSON.stringify({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                usd_balance: safeBalance
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }
        );
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

/* =========================
   AUTH GUARD
========================= */
async function requireAuth(request: Request, env: Env): Promise<any> {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const isValid = await jwt.verify(token, env.JWT_SECRET);
        if (!isValid) {
            return new Response(JSON.stringify({ error: "Invalid token" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const payload = jwt.decode(token);
        return { user: payload };
    } catch {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
}
