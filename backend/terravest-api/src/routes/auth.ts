import { Env } from "../index";
import jwt from "@tsndr/cloudflare-worker-jwt";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema } from "../lib/validators";
import { requireAuth } from "../lib/auth";
import { json, validationError, errorResponse } from "../lib/errors";


async function verifyTurnstile(token: string, secretKey: string, ip: string) {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
        body: formData,
        method: 'POST',
    });

    const outcome = await result.json() as any;
    return outcome.success;
}

/* =========================
   REGISTER
========================= */
export const handleRegister = async (request: Request, env: Env) => {
    try {
        const body = await request.json();

        // 1. Validation
        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return validationError(validation.error);
        }

        const { email, password, username } = validation.data;

        // 2. Check if user exists
        const existingUser = await env.terravest_db
            .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
            .bind(email, username)
            .first();

        if (existingUser) {
            return errorResponse("Email or username already exists", 409);
        }

        // 3. Hashing and Registration
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await env.terravest_db
            .prepare('INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)')
            .bind(email, username, hashedPassword, 'user')
            .run();

        if (!result.success) {
            return errorResponse("Failed to register user", 500);
        }

        const newUserId = result.meta.last_row_id;

        // Generate token (24 hours - "Remember Me" defaults to false after registration)
        const token = await jwt.sign({
            id: newUserId,
            email: email,
            username: username,
            role: 'user',
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 Hours
        }, env.JWT_SECRET);

        // Return Token as response
        return json({
            success: true,
            token,
            user: {
                id: newUserId,
                email,
                username,
                role: 'user',
                usd_balance: 0
            }
        }, 201);

    } catch (e: any) {
        return json({ error: e.message }, 500);
    }
};

/* =========================
   LOGIN
========================= */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
    try {
        // Take body as "any" so we can access turnstileToken and rememberMe
        // (So LoginSchema doesn't error if it doesn't know these fields)
        const body = await request.json() as any;

        // ---------------------------------------------------------
        // 🛡️ SECURITY STEP: TURNSTILE CHECK
        // ---------------------------------------------------------
        const turnstileToken = body.turnstileToken;
        const ip = request.headers.get('CF-Connecting-IP') || "127.0.0.1";

        // Check if Secret Key is missing (Dev environment) or Token is empty
        if (env.TURNSTILE_SECRET) {
            if (!turnstileToken) {
                return errorResponse("Security check required. Please refresh.", 400);
            }

            const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);

            if (!isHuman) {
                return errorResponse("Security check failed. Are you a robot?", 403);
            }
        } else {
            console.warn("⚠️ TURNSTILE_SECRET not set. Skipping bot check.");
        }
        // ---------------------------------------------------------

        // Normal Validation (Zod)
        const validation = LoginSchema.safeParse(body);

        if (!validation.success) {
            return validationError(validation.error);
        }

        const { identifier, password } = validation.data;

        // Fetch user
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

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password as string);
        if (!isPasswordValid) {
            return errorResponse("Invalid credentials", 401);
        }

        const safeBalance = user.usd_balance == null ? 0 : Number(user.usd_balance);

        // ---------------------------------------------------------
        // 🕒 TOKEN DURATION (REMEMBER ME)
        // ---------------------------------------------------------
        const rememberMe = body.rememberMe || false; // Value from frontend

        // If remember me is checked, 7 days, otherwise 2 hours
        const expirationTime = rememberMe
            ? Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
            : Math.floor(Date.now() / 1000) + (60 * 60 * 2);

        // Generate JWT token
        const token = await jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            exp: expirationTime
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