import { requireAuth } from "../middleware/auth";

export async function handlePortfolio(
    request: Request,
    env: any
): Promise<Response> {
    // 🔐 AUTH
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const userId = auth.user.id;

    // --------------------
    // TOTAL VALUE
    // --------------------
    const totalRow = await env.terravest_db
        .prepare(
            "SELECT COALESCE(SUM(value_usd), 0) as total FROM investments WHERE user_id = ?"
        )
        .bind(userId)
        .first();

    // --------------------
    // GROUP BY TYPE
    // --------------------
    const { results } = await env.terravest_db
        .prepare(
            `SELECT type, SUM(value_usd) as total_usd
			 FROM investments
			 WHERE user_id = ?
			 GROUP BY type`
        )
        .bind(userId)
        .all();

    return json({
        success: true,
        total_usd: totalRow?.total ?? 0,
        by_type: results,
    });
}

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
