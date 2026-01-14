import { Env } from "../index";
import jwt from "@tsndr/cloudflare-worker-jwt";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../lib/validators";
import { requireAuth } from "../lib/auth";
import { json, validationError, errorResponse } from "../lib/errors";
import { isReservedUsername, USERNAME_REGEX } from "../lib/reserved";
import { generateResetToken, hashResetToken, compareResetToken, getResetTokenExpiration } from "../lib/password-reset";


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

        // 1. Validation (Zod schema)
        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return validationError(validation.error);
        }

        const { email, password, username } = validation.data;

        // 2. Case normalization (store lowercase)
        const normalizedEmail = email.toLowerCase();
        const normalizedUsername = username.toLowerCase();

        // 3. Validate username format (redundant but safe)
        if (!USERNAME_REGEX.test(username)) {
            return errorResponse("Invalid username format", 400);
        }

        // 4. Check if reserved (case-insensitive)
        if (isReservedUsername(normalizedUsername)) {
            return errorResponse("Username is reserved", 400);
        }

        // 5. Validate email format (redundant but safe)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse("Invalid email format", 400);
        }

        // 6. Hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. Attempt database insert (UNIQUE constraints are the final authority)
        try {
            const result = await env.terravest_db
                .prepare('INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)')
                .bind(normalizedEmail, normalizedUsername, hashedPassword, 'user')
                .run();

            if (!result.success) {
                return errorResponse("Failed to register user", 500);
            }

            const newUserId = result.meta.last_row_id;

            // Generate token (24 hours - "Remember Me" defaults to false after registration)
            const token = await jwt.sign({
                id: newUserId,
                email: normalizedEmail,
                username: normalizedUsername,
                role: 'user',
                exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 Hours
            }, env.JWT_SECRET);

            // Return Token as response
            return json({
                success: true,
                token,
                user: {
                    id: newUserId,
                    email: normalizedEmail,
                    username: normalizedUsername,
                    role: 'user',
                    usd_balance: 0
                }
            }, 201);

        } catch (dbError: any) {
            // Handle UNIQUE constraint violations
            const errorMessage = dbError.message || '';
            
            // Check for username conflict
            if (errorMessage.includes('username') || errorMessage.includes('idx_users_username_unique')) {
                return errorResponse("Username already taken", 409);
            }
            
            // Check for email conflict
            if (errorMessage.includes('email') || errorMessage.includes('idx_users_email_unique')) {
                return errorResponse("Email already registered", 409);
            }
            
            // Re-throw if it's not a constraint violation
            throw dbError;
        }

    } catch (e: any) {
        console.error("Registration error:", e);
        return errorResponse(e.message || "Internal server error", 500);
    }
};

/* =========================
   LOGIN
========================= */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as any;

        // ---------------------------------------------------------
        // 🛡️ SECURITY STEP: TURNSTILE CHECK (MANDATORY)
        // ---------------------------------------------------------
        const turnstileToken = body.turnstileToken;
        const ip = request.headers.get('CF-Connecting-IP') || "";

        if (!turnstileToken) {
            return json({ error: "BOT_VERIFICATION_FAILED" }, 400);
        }

        if (env.TURNSTILE_SECRET) {
            const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
            if (!isHuman) {
                return json({ error: "BOT_VERIFICATION_FAILED" }, 403);
            }
        } else {
            console.warn("⚠️ TURNSTILE_SECRET not set. Skipping bot check.");
        }
        // ---------------------------------------------------------

        // Validation
        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return validationError(validation.error);
        }

        const { identifier, password, identifierType, rememberMe } = validation.data;

        // Normalize identifier for case-insensitive lookup (stored as lowercase)
        const normalizedIdentifier = identifier.toLowerCase();

        // Identifier-aware authentication: Search by email OR username based on identifierType
        let user: any;
        if (identifierType === "email") {
            user = await env.terravest_db
                .prepare('SELECT id, email, username, password, role FROM users WHERE LOWER(email) = ?')
                .bind(normalizedIdentifier)
                .first();
        } else {
            user = await env.terravest_db
                .prepare('SELECT id, email, username, password, role FROM users WHERE LOWER(username) = ?')
                .bind(normalizedIdentifier)
                .first();
        }

        // Constant-time password comparison (bcrypt.compare is constant-time)
        // Return same error for user not found OR password invalid (no leakage)
        const isPasswordValid = user ? await bcrypt.compare(password, user.password as string) : false;
        if (!user || !isPasswordValid) {
            // Log failed attempt for monitoring
            console.warn(`Failed login attempt: identifier=${normalizedIdentifier}, type=${identifierType}, ip=${ip}`);
            return json({ error: "INVALID_CREDENTIALS" }, 401);
        }

        // ---------------------------------------------------------
        // 🕒 TOKEN DURATION (REMEMBER ME)
        // ---------------------------------------------------------
        // If rememberMe is true: long-lived token (7 days), else: short-lived (2 hours)
        const expirationTime = rememberMe
            ? Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
            : Math.floor(Date.now() / 1000) + (60 * 60 * 2); // 2 hours

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
                role: user.role
            }
        });

    } catch (e: any) {
        console.error("Login error:", e);
        return json({ error: e.message || "Internal server error" }, 500);
    }
}

/* =========================
   CHECK USERNAME AVAILABILITY
========================= */
export async function handleCheckUsername(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const username = url.searchParams.get('username');

        if (!username) {
            return json({ available: false, reason: "username_required" }, 400);
        }

        const normalizedUsername = username.toLowerCase();

        // 1. Validate format
        if (!USERNAME_REGEX.test(username)) {
            return json({ available: false, reason: "invalid_format" });
        }

        // 2. Check if reserved (case-insensitive)
        if (isReservedUsername(normalizedUsername)) {
            return json({ available: false, reason: "reserved" });
        }

        // 3. Check database (case-insensitive lookup)
        const existingUser = await env.terravest_db
            .prepare('SELECT id FROM users WHERE LOWER(username) = ?')
            .bind(normalizedUsername)
            .first();

        if (existingUser) {
            return json({ available: false });
        }

        return json({ available: true });
    } catch (e: any) {
        console.error("Check username error:", e);
        return errorResponse("Internal server error", 500);
    }
}

/* =========================
   CHECK EMAIL AVAILABILITY
========================= */
export async function handleCheckEmail(request: Request, env: Env): Promise<Response> {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return json({ available: false, reason: "email_required" }, 400);
        }

        const normalizedEmail = email.toLowerCase();

        // 1. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return json({ available: false, reason: "invalid_email" });
        }

        // 2. Check database (case-insensitive lookup)
        const existingUser = await env.terravest_db
            .prepare('SELECT id FROM users WHERE LOWER(email) = ?')
            .bind(normalizedEmail)
            .first();

        if (existingUser) {
            return json({ available: false });
        }

        return json({ available: true });
    } catch (e: any) {
        console.error("Check email error:", e);
        return errorResponse("Internal server error", 500);
    }
}

/* =========================
   FORGOT PASSWORD
========================= */
export async function handleForgotPassword(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as any;

        // Validate input
        const validation = ForgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return validationError(validation.error);
        }

        const { email, turnstileToken } = validation.data;

        // Verify Turnstile token
        const ip = request.headers.get('CF-Connecting-IP') || "";
        if (env.TURNSTILE_SECRET) {
            if (!turnstileToken) {
                return json({ error: "BOT_VERIFICATION_FAILED" }, 400);
            }
            const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
            if (!isHuman) {
                return json({ error: "BOT_VERIFICATION_FAILED" }, 403);
            }
        }

        const normalizedEmail = email.toLowerCase();

        // Check if user exists (case-insensitive)
        const user = await env.terravest_db
            .prepare('SELECT id FROM users WHERE LOWER(email) = ?')
            .bind(normalizedEmail)
            .first();

        // Always return success (no user enumeration)
        // Only proceed if user exists
        if (user) {
            // Generate reset token
            const resetToken = generateResetToken();
            const tokenHash = await hashResetToken(resetToken);
            const expiresAt = getResetTokenExpiration();

            // Invalidate any existing unused tokens for this user
            await env.terravest_db
                .prepare('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0')
                .bind(user.id)
                .run();

            // Store token hash in database
            await env.terravest_db
                .prepare('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, ?, 0)')
                .bind(user.id, tokenHash, expiresAt)
                .run();

            // Generate reset link
            const frontendUrl = env.FRONTEND_URL || 'https://terravest-frontend.pages.dev';
            const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

            // TODO: Send email with reset link
            // For now, log it (in production, integrate with email service)
            console.log(`Password reset requested for ${normalizedEmail}. Reset link: ${resetLink}`);
            // In production, use Cloudflare Email Workers or external email service:
            // await env.EMAIL_SERVICE.send({
            //     to: email,
            //     subject: "Reset Your Password",
            //     html: `Click here to reset your password: <a href="${resetLink}">${resetLink}</a>`
            // });
        }

        // Always return success (no user enumeration)
        return json({ success: true });
    } catch (e: any) {
        console.error("Forgot password error:", e);
        return json({ error: "Internal server error" }, 500);
    }
}

/* =========================
   RESET PASSWORD
========================= */
export async function handleResetPassword(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json() as any;

        // Validate input
        const validation = ResetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return validationError(validation.error);
        }

        const { token, newPassword } = validation.data;

        // Hash the incoming token to compare with stored hash
        // Note: We need to check all tokens since we can't hash before comparing
        // Get all unused, unexpired tokens
        const tokens = await env.terravest_db
            .prepare(`
                SELECT id, user_id, token_hash, expires_at 
                FROM password_reset_tokens 
                WHERE used = 0 AND expires_at > datetime('now')
            `)
            .all();

        let validToken: any = null;
        for (const row of tokens.results || []) {
            const tokenRow = row as any;
            const matches = await compareResetToken(token, tokenRow.token_hash);
            if (matches) {
                validToken = tokenRow;
                break;
            }
        }

        if (!validToken) {
            return json({ error: "INVALID_OR_EXPIRED_TOKEN" }, 400);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and mark token as used (atomic operation)
        await env.terravest_db.batch([
            env.terravest_db
                .prepare('UPDATE users SET password = ? WHERE id = ?')
                .bind(hashedPassword, validToken.user_id),
            env.terravest_db
                .prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?')
                .bind(validToken.id)
        ]);

        // TODO: Invalidate all active sessions for this user
        // This would require a session tracking mechanism (e.g., storing JWT tokens in DB)
        // For now, tokens will expire naturally based on their expiration time

        return json({ success: true });
    } catch (e: any) {
        console.error("Reset password error:", e);
        return json({ error: "Internal server error" }, 500);
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