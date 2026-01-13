import { Env } from "../index";
import { requireAdmin } from "../lib/auth";
import { json, errorResponse } from "../lib/errors";

/**
 * Admin operations handler for withdrawals and deposits management
 * Requires admin role (role MUST be 'admin')
 */
export const handleAdminOperations = async (request: Request, env: Env): Promise<Response> => {
    // SECURITY: Use requireAdmin to ensure user has admin role
    // Role is checked ONLY from JWT payload (not from request body)
    const auth = await requireAdmin(request, env);
    if (auth instanceof Response) return auth;

    const user = auth.user as any;

    const url = new URL(request.url);
    const db = env.terravest_db;

    // ==========================================
    // WITHDRAWALS MANAGEMENT
    // ==========================================

    // GET: List all withdrawal requests
    if (request.method === "GET" && url.pathname.endsWith("/admin/withdrawals")) {
        try {
            // Use LEFT JOIN so transaction record doesn't error if user is deleted
            const { results } = await db.prepare(`
                SELECT 
                    w.id,
                    w.user_id,
                    w.amount,
                    w.address,
                    w.status,
                    w.tx_hash,
                    w.created_at,
                    u.username,
                    u.email
                FROM withdrawals w
                LEFT JOIN users u ON w.user_id = u.id
                ORDER BY w.created_at DESC
            `).all();

            return json({ success: true, data: results });
        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    // POST: Approve withdrawal request (with TX hash)
    if (request.method === "POST" && url.pathname.endsWith("/admin/approve-withdraw")) {
        try {
            const body = await request.json() as any;
            const { withdrawId, txHash } = body;

            if (!withdrawId || !txHash) {
                return errorResponse("Missing withdrawId or txHash", 400);
            }

            const result = await db.prepare(`
                UPDATE withdrawals 
                SET status = 'approved', tx_hash = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
                .bind(txHash, withdrawId)
                .run();

            if (result.meta.changes === 0) {
                return errorResponse("Withdrawal not found or update failed", 404);
            }

            return json({ success: true, message: "Withdrawal approved successfully" });

        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    // ==========================================
    // DEPOSITS MANAGEMENT
    // ==========================================

    // GET: List all deposits
    if (request.method === "GET" && url.pathname.endsWith("/admin/deposits")) {
        try {
            const { results } = await db.prepare(`
                SELECT 
                    d.id,
                    d.user_id,
                    d.amount_usd,
                    d.address,
                    d.status,
                    d.created_at,
                    u.username, 
                    u.email 
                FROM deposits d 
                LEFT JOIN users u ON d.user_id = u.id 
                ORDER BY d.created_at DESC
            `).all();
            return json({ success: true, data: results });
        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    // POST: Manually approve deposit
    if (request.method === "POST" && url.pathname.endsWith("/admin/approve-deposit")) {
        try {
            const body = await request.json() as any;
            const depositId = body.depositId || body.id;

            if (!depositId) return errorResponse("Deposit ID required", 400);

            // Find deposit
            const deposit = await db.prepare("SELECT * FROM deposits WHERE id = ?").bind(depositId).first();

            if (!deposit) return errorResponse("Deposit not found", 404);
            if (deposit.status === 'completed') return errorResponse("Already completed", 400);

            // Convert values to numbers
            const amountToAdd = Number(deposit.amount_usd);

            // Atomic transaction (batch)
            await db.batch([
                // Update deposit status
                db.prepare("UPDATE deposits SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(depositId),

                // Increase user balance
                db.prepare(`
                    UPDATE users 
                    SET usd_balance = COALESCE(usd_balance, 0) + ? 
                    WHERE id = ?
                `).bind(amountToAdd, deposit.user_id)
            ]);

            return json({
                success: true,
                message: `Deposit of $${amountToAdd} approved successfully.`
            });

        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    return errorResponse("Admin route not found", 404);
};