import { Env } from "../index";
import jwt from "@tsndr/cloudflare-worker-jwt";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../lib/validators";
import { requireAuth } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";
import { isReservedUsername, USERNAME_REGEX } from "../lib/reserved";
import { generateResetToken, hashResetToken, compareResetToken, getResetTokenExpiration } from "../lib/password-reset";
import { compareVerificationToken, generateVerificationToken, getVerificationTokenExpiration, hashVerificationToken } from "../lib/email-verification";
import { sendEmailVerificationPlaceholder } from "../lib/email-sender";
import { getErrorMessage, getLangFromRequest, getSuccessMessage, type Lang } from "../lib/i18n";
import type { ZodError } from "zod";


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

function getValidationMessage(lang: Lang, zodError: ZodError): string {
    const issue = zodError.issues[0];
    const field = issue?.path?.[0];

    switch (field) {
        case 'email':
            return getErrorMessage(lang, 'INVALID_EMAIL_FORMAT');
        case 'username':
            return getErrorMessage(lang, 'INVALID_USERNAME_FORMAT');
        case 'password':
        case 'newPassword':
            return getErrorMessage(lang, 'PASSWORD_TOO_SHORT');
        case 'identifier':
            return getErrorMessage(lang, 'IDENTIFIER_REQUIRED');
        case 'turnstileToken':
            return getErrorMessage(lang, 'BOT_VERIFICATION_FAILED');
        case 'token':
            return getErrorMessage(lang, 'RESET_TOKEN_INVALID');
        default:
            return getErrorMessage(lang, 'VALIDATION_FAILED');
    }
}

function getFrontendLangPath(lang: Lang): string {
    if (lang === 'es-419') return 'es';
    if (lang === 'pt-BR') return 'pt-br';
    if (lang === 'fr') return 'fr';
    return '';
}

function buildVerificationUrl(baseUrl: string, token: string, lang: Lang): string {
    const sanitizedBase = baseUrl.replace(/\/$/, '');
    const langPath = getFrontendLangPath(lang);
    const prefix = langPath ? `/${langPath}` : '';
    return `${sanitizedBase}${prefix}/verify-email?token=${encodeURIComponent(token)}`;
}

/* =========================
   REGISTER
========================= */
export const handleRegister = async (request: Request, env: Env) => {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            const lang = getLangFromRequest(request);
            return errorResponse(getErrorMessage(lang, 'INVALID_JSON'), 400);
        }
        const lang = getLangFromRequest(request, body);

        // 1. Validation (Zod schema)
        const validation = RegisterSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(getValidationMessage(lang, validation.error), 400);
        }

        const { email, password, username } = validation.data;

        // 2. Case normalization (store lowercase)
        const normalizedEmail = email.toLowerCase();
        const normalizedUsername = username.toLowerCase();

        // 3. Validate username format (redundant but safe)
        if (!USERNAME_REGEX.test(username)) {
            return errorResponse(getErrorMessage(lang, 'INVALID_USERNAME_FORMAT'), 400);
        }

        // 4. Check if reserved (case-insensitive)
        if (isReservedUsername(normalizedUsername)) {
            return errorResponse(getErrorMessage(lang, 'USERNAME_RESERVED'), 400);
        }

        // 5. Validate email format (redundant but safe)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse(getErrorMessage(lang, 'INVALID_EMAIL_FORMAT'), 400);
        }

        // 6. Hashing
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const verificationTokenHash = await hashVerificationToken(verificationToken);
        const verificationExpiresAt = getVerificationTokenExpiration();

        // 7. Attempt database insert (UNIQUE constraints are the final authority)
        try {
            const result = await env.terravest_db
                .prepare('INSERT INTO users (email, username, password, role, email_verified, email_verified_at) VALUES (?, ?, ?, ?, 0, NULL)')
                .bind(normalizedEmail, normalizedUsername, hashedPassword, 'user')
                .run();

            if (!result.success) {
                return errorResponse(getErrorMessage(lang, 'REGISTER_FAILED'), 500);
            }

            const newUserId = result.meta.last_row_id;

            await env.terravest_db
                .prepare('UPDATE email_verification_tokens SET used = 1 WHERE user_id = ? AND used = 0')
                .bind(newUserId)
                .run();

            await env.terravest_db
                .prepare('INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, ?, 0)')
                .bind(newUserId, verificationTokenHash, verificationExpiresAt)
                .run();

            const frontendUrl = env.FRONTEND_URL || 'https://terravest-frontend.pages.dev';
            const verificationUrl = buildVerificationUrl(frontendUrl, verificationToken, lang);
            sendEmailVerificationPlaceholder(normalizedEmail, verificationUrl, lang);

            return json({
                success: true,
                requiresVerification: true,
                message: getSuccessMessage(lang, 'EMAIL_VERIFICATION_SENT')
            }, 201);

        } catch (dbError: any) {
            // Handle UNIQUE constraint violations
            const errorMessage = dbError.message || '';

            // Check for username conflict
            if (errorMessage.includes('username') || errorMessage.includes('idx_users_username_unique')) {
                return errorResponse(getErrorMessage(lang, 'USERNAME_TAKEN'), 409);
            }

            // Check for email conflict
            if (errorMessage.includes('email') || errorMessage.includes('idx_users_email_unique')) {
                return errorResponse(getErrorMessage(lang, 'EMAIL_TAKEN'), 409);
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
        let body: any;
        try {
            body = await request.json();
        } catch {
            const lang = getLangFromRequest(request);
            return errorResponse(getErrorMessage(lang, 'INVALID_JSON'), 400);
        }
        const lang = getLangFromRequest(request, body);

        // ---------------------------------------------------------
        // SECURITY STEP: TURNSTILE CHECK (MANDATORY)
        // ---------------------------------------------------------
        const turnstileToken = body.turnstileToken;
        const ip = request.headers.get('CF-Connecting-IP') || "";

        if (!turnstileToken) {
            return errorResponse(getErrorMessage(lang, 'BOT_VERIFICATION_FAILED'), 400);
        }

        if (env.TURNSTILE_SECRET) {
            const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
            if (!isHuman) {
                return errorResponse(getErrorMessage(lang, 'BOT_VERIFICATION_FAILED'), 403);
            }
        } else {
            console.warn("⚠️ TURNSTILE_SECRET not set. Skipping bot check.");
        }
        // ---------------------------------------------------------

        // Validation
        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(getValidationMessage(lang, validation.error), 400);
        }

        const { identifier, password, identifierType, rememberMe } = validation.data;

        // Normalize identifier for case-insensitive lookup (stored as lowercase)
        const normalizedIdentifier = identifier.toLowerCase();

        // Identifier-aware authentication: Search by email OR username based on identifierType
        let user: any;
        if (identifierType === "email") {
            user = await env.terravest_db
                .prepare('SELECT id, email, username, password, role, email_verified FROM users WHERE LOWER(email) = ?')
                .bind(normalizedIdentifier)
                .first();
        } else {
            user = await env.terravest_db
                .prepare('SELECT id, email, username, password, role, email_verified FROM users WHERE LOWER(username) = ?')
                .bind(normalizedIdentifier)
                .first();
        }

        // Constant-time password comparison (bcrypt.compare is constant-time)
        // Return same error for user not found OR password invalid (no leakage)
        const isPasswordValid = user ? await bcrypt.compare(password, user.password as string) : false;
        if (!user || !isPasswordValid) {
            // Log failed attempt for monitoring
            console.warn(`Failed login attempt: identifier=${normalizedIdentifier}, type=${identifierType}, ip=${ip}`);
            return errorResponse(getErrorMessage(lang, 'INVALID_CREDENTIALS'), 401);
        }

        if (Number(user.email_verified) !== 1) {
            return json({ error: "EMAIL_NOT_VERIFIED", message: getErrorMessage(lang, 'EMAIL_NOT_VERIFIED') }, 403);
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
        return errorResponse(e.message || "Internal server error", 500);
    }
}

/* =========================
   VERIFY EMAIL
========================= */
export async function handleVerifyEmail(request: Request, env: Env): Promise<Response> {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            const lang = getLangFromRequest(request);
            return errorResponse(getErrorMessage(lang, 'INVALID_JSON'), 400);
        }
        const lang = getLangFromRequest(request, body);
        const token = body?.token;

        if (!token || typeof token !== 'string') {
            return errorResponse(getErrorMessage(lang, 'EMAIL_VERIFICATION_INVALID'), 400);
        }

        const db = env.terravest_db;

        await db.prepare("DELETE FROM email_verification_tokens WHERE expires_at < datetime('now') OR used = 1").run();

        const tokens = await db.prepare(`
            SELECT id, user_id, token_hash
            FROM email_verification_tokens
            WHERE used = 0 AND expires_at > datetime('now')
        `).all();

        let matched: { id: number; user_id: number } | null = null;
        for (const row of tokens.results || []) {
            const tokenRow = row as any;
            const matches = await compareVerificationToken(token, tokenRow.token_hash);
            if (matches) {
                matched = { id: tokenRow.id, user_id: tokenRow.user_id };
                break;
            }
        }

        if (!matched) {
            return errorResponse(getErrorMessage(lang, 'EMAIL_VERIFICATION_INVALID'), 400);
        }

        await db.batch([
            db.prepare("UPDATE users SET email_verified = 1, email_verified_at = CURRENT_TIMESTAMP WHERE id = ?")
                .bind(matched.user_id),
            db.prepare("UPDATE email_verification_tokens SET used = 1 WHERE id = ?")
                .bind(matched.id)
        ]);

        return json({
            success: true,
            message: getSuccessMessage(lang, 'EMAIL_VERIFICATION_SUCCESS')
        });
    } catch (e: any) {
        console.error("Verify email error:", e);
        return errorResponse(e.message || "Internal server error", 500);
    }
}

/* =========================
   RESEND VERIFICATION
========================= */
export async function handleResendVerification(request: Request, env: Env): Promise<Response> {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            const lang = getLangFromRequest(request);
            return errorResponse(getErrorMessage(lang, 'INVALID_JSON'), 400);
        }
        const lang = getLangFromRequest(request, body);
        const email = body?.email;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
            return errorResponse(getErrorMessage(lang, 'INVALID_EMAIL_FORMAT'), 400);
        }

        const normalizedEmail = email.toLowerCase();
        const db = env.terravest_db;

        await db.prepare("DELETE FROM email_verification_tokens WHERE expires_at < datetime('now') OR used = 1").run();

        const user = await db
            .prepare('SELECT id, email_verified FROM users WHERE LOWER(email) = ?')
            .bind(normalizedEmail)
            .first();

        if (!user || Number(user.email_verified) === 1) {
            return json({ success: true, message: getSuccessMessage(lang, 'EMAIL_VERIFICATION_SENT') });
        }

        const verificationToken = generateVerificationToken();
        const verificationTokenHash = await hashVerificationToken(verificationToken);
        const verificationExpiresAt = getVerificationTokenExpiration();

        await db.prepare('UPDATE email_verification_tokens SET used = 1 WHERE user_id = ? AND used = 0')
            .bind(user.id)
            .run();

        await db.prepare('INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, used) VALUES (?, ?, ?, 0)')
            .bind(user.id, verificationTokenHash, verificationExpiresAt)
            .run();

        const frontendUrl = env.FRONTEND_URL || 'https://terravest-frontend.pages.dev';
        const verificationUrl = buildVerificationUrl(frontendUrl, verificationToken, lang);
        sendEmailVerificationPlaceholder(normalizedEmail, verificationUrl, lang);

        return json({ success: true, message: getSuccessMessage(lang, 'EMAIL_VERIFICATION_SENT') });
    } catch (e: any) {
        console.error("Resend verification error:", e);
        return errorResponse(e.message || "Internal server error", 500);
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
        let body: any;
        try {
            body = await request.json();
        } catch {
            const lang = getLangFromRequest(request);
            return errorResponse(getErrorMessage(lang, 'INVALID_JSON'), 400);
        }
        const lang = getLangFromRequest(request, body);

        // Validate input
        const validation = ForgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(getValidationMessage(lang, validation.error), 400);
        }

        const { email, turnstileToken } = validation.data;

        // Verify Turnstile token
        const ip = request.headers.get('CF-Connecting-IP') || "";
        if (env.TURNSTILE_SECRET) {
            if (!turnstileToken) {
                return errorResponse(getErrorMessage(lang, 'BOT_VERIFICATION_FAILED'), 400);
            }
            const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip);
            if (!isHuman) {
                return errorResponse(getErrorMessage(lang, 'BOT_VERIFICATION_FAILED'), 403);
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
        return errorResponse("Internal server error", 500);
    }
}

/* =========================
   RESET PASSWORD
========================= */
export async function handleResetPassword(request: Request, env: Env): Promise<Response> {
    try {
        let body: any;
        try {
            body = await request.json();
        } catch {
            const lang = getLangFromRequest(request);
            return errorResponse(getErrorMessage(lang, 'INVALID_JSON'), 400);
        }
        const lang = getLangFromRequest(request, body);

        // Validate input
        const validation = ResetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(getValidationMessage(lang, validation.error), 400);
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
            return errorResponse(getErrorMessage(lang, 'RESET_TOKEN_INVALID'), 400);
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
        return errorResponse("Internal server error", 500);
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