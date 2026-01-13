import { Env } from "../index";
import jwt from "@tsndr/cloudflare-worker-jwt";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema } from "../lib/validators";
import { requireAuth } from "../lib/auth";
import { json, validationError, errorResponse } from "../lib/errors";

/* =========================
   REGISTER
========================= */
export async function handleRegister(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json();
        const validation = RegisterSchema.safeParse(body);

        if (!validation.success) {
            return validationError(validation.error);
        }

        const { email, username, password } = validation.data;

        // Check if user already exists
        const existingUser = await env.terravest_db
            .prepare("SELECT id, email, username FROM users WHERE email = ? OR username = ?")
            .bind(email, username)
            .first();

        if (existingUser) {
            const errorMsg = existingUser.email === email ? "Email already registered" : "Username already taken";
            return errorResponse(errorMsg, 409);
        }

        // Hash password with bcrypt (10 rounds - secure and performant)
        const hashedPassword = await bcrypt.hash(password, 10);

        const role = "user";

        const result = await env.terravest_db
            .prepare(`INSERT INTO users (email, username, password, role, usd_balance) VALUES (?, ?, ?, ?, 0)`)
            .bind(email, username, hashedPassword, role)
            .run();

        if (!result.success) return errorResponse("Failed to register user", 500);

        return json({
            message: "User registered successfully",
            user: { email, username, role, usd_balance: 0 }
        }, 201);

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
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
            return validationError(validation.error);
        }

        const { identifier, password } = validation.data;

        // Fetch user including password field for verification
        const user = await env.terravest_db
            .prepare(`
    SELECT id, email, username, password, role, usd_balance
    FROM users
    WHERE email = ? OR username = ?
  `)
            .bind(identifier, identifier)
            .first();

        if (!user) {
            return errorResponse("Invalid credentials", 401);
        }

        // Verify password by comparing with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password as string);
        if (!isPasswordValid) {
            return errorResponse("Invalid credentials", 401);
        }

        const safeBalance = user.usd_balance == null ? 0 : Number(user.usd_balance);

        // Generate JWT token
        const token = await jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 saat
        }, env.JWT_SECRET);

        return json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                usd_balance: safeBalance
            }
        });

    } catch (e: any) {
        return json({ error: e.message }, 500);
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
            .prepare(`SELECT id, email, username, role, usd_balance FROM users WHERE id = ?`)
            .bind(userId)
            .first();

        if (!user) return errorResponse("User not found", 404);

        const safeBalance = user.usd_balance == null ? 0 : Number(user.usd_balance);

        return json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            usd_balance: safeBalance
        });

    } catch (e: any) {
        return errorResponse(e.message || "Internal server error", 500);
    }
}