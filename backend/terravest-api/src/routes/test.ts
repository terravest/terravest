import { Env } from "../index";
import { requireAuth } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";

/**
 * Test Reset Endpoint
 * 
 * SECURITY: This endpoint is ONLY available in development/test environments.
 * It will return 404 in production to prevent accidental data deletion.
 * 
 * Purpose: Clean up test data for a specific authenticated user.
 * This helps E2E tests run deterministically by starting from a clean state.
 * 
 * Method: DELETE /api/test/reset
 * Auth: Required (Bearer token)
 * 
 * Deletes all user-related test data:
 * - transactions (user_id)
 * - investments (user_id)
 * - deposits (user_id)
 * - withdrawals (user_id)
 * - orders (user_id)
 * - ownerships (user_id)
 * 
 * Note: Does NOT delete:
 * - users table (user account remains)
 * - properties table (global data)
 * - user balance (usd_balance remains unchanged)
 */
export const handleTestReset = async (request: Request, env: Env): Promise<Response> => {
	// SECURITY: Check environment - only allow in dev/test
	// In production, this endpoint should return 404
	const environment = (env as any).ENVIRONMENT || (env as any).NODE_ENV;
	const isProduction = environment === 'production' || environment === 'prod';
	
	if (isProduction) {
		// Return 404 in production to hide the endpoint
		return json({ error: "Not found" }, 404);
	}

	// Require authentication
	const auth = await requireAuth(request, env);
	if (auth instanceof Response) return auth;
	const user = auth.user;
	const userId = user.id;

	const db = env.terravest_db;

	try {
		// Delete user-related data in correct order (respecting foreign key constraints)
		// Order: child tables first, then parent tables
		
		// 1. Transactions (may reference other tables, but safe to delete by user_id)
		await db.prepare("DELETE FROM transactions WHERE user_id = ?").bind(userId).run();

		// 2. Investments (user's property investments)
		await db.prepare("DELETE FROM investments WHERE user_id = ?").bind(userId).run();

		// 3. Deposits (user's deposit requests)
		await db.prepare("DELETE FROM deposits WHERE user_id = ?").bind(userId).run();

		// 4. Withdrawals (user's withdrawal requests)
		await db.prepare("DELETE FROM withdrawals WHERE user_id = ?").bind(userId).run();

		// 5. Orders (user's order history)
		await db.prepare("DELETE FROM orders WHERE user_id = ?").bind(userId).run();

		// 6. Ownerships (legacy ownership tracking, if exists)
		await db.prepare("DELETE FROM ownerships WHERE user_id = ?").bind(userId).run();

		return json({ ok: true });

	} catch (e: any) {
		console.error("Test reset error:", e);
		return errorResponse(e.message || "Internal server error", 500);
	}
};
