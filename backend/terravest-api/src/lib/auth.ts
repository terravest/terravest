import type { Env } from "../index";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { Context, Next } from "hono";
import { json } from "./errors";

// Re-export json helper for backward compatibility
export { json };

/**
 * Hono middleware for authentication
 * Validates JWT token and adds user to context
 * Returns 401 if authentication fails
 */
export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { user: any } }>, next: Next) {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token using same library as handleLogin
        const isValid = await jwt.verify(token, c.env.JWT_SECRET);

        if (!isValid) {
            return c.json({ error: "Unauthorized: Invalid token" }, 401);
        }

        // Decode token to get payload (already verified above)
        const { payload } = await jwt.decode(token);

        // Add user to context
        c.set('user', payload);

        await next();
    } catch (e) {
        return c.json({ error: "Unauthorized: Token error" }, 401);
    }
}

/**
 * Legacy authentication function (for Request/Env pattern handlers)
 * Validates JWT token and returns user payload or error response
 * @deprecated Use authMiddleware for Hono routes instead
 */
export async function requireAuth(request: Request, env: Env): Promise<{ user: any } | Response> {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return json({ error: "Unauthorized: Missing token" }, 401);
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token using same library as handleLogin
        const isValid = await jwt.verify(token, env.JWT_SECRET);

        if (!isValid) {
            return json({ error: "Unauthorized: Invalid token" }, 401);
        }

        // Decode token to get payload (already verified above)
        const { payload } = await jwt.decode(token);
        return { user: payload };

    } catch (e) {
        return json({ error: "Unauthorized: Token error" }, 401);
    }
}

/**
 * Hono middleware for admin authorization
 * Requires user to be authenticated and have admin role
 * Returns 403 if user is not admin (role MUST be 'admin')
 */
export async function adminMiddleware(c: Context<{ Bindings: Env; Variables: { user: any } }>, next: Next) {
    // First, ensure user is authenticated (should already be done by authMiddleware)
    const user = c.get('user');

    if (!user) {
        return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    // SECURITY: Check admin role ONLY from JWT payload (not from request body)
    // Role MUST be exactly 'admin' - no exceptions (removed user.id === 1 bypass)
    if (user.role !== 'admin') {
        return c.json({ error: "Unauthorized: Admin only" }, 403);
    }

    await next();
}

/**
 * Admin authorization helper for Request/Env pattern handlers
 * Validates JWT token and checks if user has admin role
 * Returns user payload if admin, or 403 error response if not
 * Role MUST be exactly 'admin' - no exceptions
 */
export async function requireAdmin(request: Request, env: Env): Promise<{ user: any } | Response> {
    // First, authenticate the user
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const user = auth.user as any;

    // SECURITY: Check admin role ONLY from JWT payload (not from request body)
    // Role MUST be exactly 'admin' - no exceptions (removed user.id === 1 bypass)
    if (user.role !== 'admin') {
        return json({ error: "Unauthorized: Admin only" }, 403);
    }

    return { user };
}