import { requireAuth } from "../middleware/auth";
import { Env } from "../index";

export async function handleAdminOperations(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const method = request.method;

    if (method === "GET" && url.pathname.endsWith("/orders")) {
        try {
            const { results } = await env.terravest_db.prepare(`
                SELECT o.id, o.user_id, o.property_id, o.token_amount, o.total_price_usd, o.payment_status, o.payment_address, o.created_at, u.email, COALESCE(p.title, 'Deleted Property') as property_title
                FROM orders o JOIN users u ON o.user_id = u.id LEFT JOIN properties p ON o.property_id = p.id
                ORDER BY o.created_at DESC
            `).all();
            return json(results || []);
        } catch (e: any) { return json({ error: e.message }, 500); }
    }

    if (method === "GET" && url.pathname.endsWith("/sell-requests")) {
        try {
            const { results } = await env.terravest_db.prepare(`
                SELECT s.id, s.token_amount, s.total_value_usd, s.payment_details, s.status, s.created_at, 
                       u.email, 
                       COALESCE(p.title, 'CASH REWARD (Dividend)') as property_title
                FROM sell_requests s
                JOIN users u ON s.user_id = u.id
                LEFT JOIN properties p ON s.property_id = p.id
                ORDER BY s.created_at DESC
            `).all();
            return json(results || []);
        } catch (e: any) { return json({ error: e.message }, 500); }
    }


    if (method === "GET" && url.pathname.endsWith("/properties")) {
        try {
            const { results } = await env.terravest_db.prepare("SELECT * FROM properties ORDER BY created_at DESC").all();
            return json(results || []);
        } catch (e: any) { return json({ error: e.message }, 500); }
    }

    if (method === "POST" && url.pathname.endsWith("/approve")) {
        try {
            const body = await request.json() as { order_id: number };
            const order = await env.terravest_db.prepare("SELECT * FROM orders WHERE id = ?").bind(body.order_id).first();
            if (!order) return json({ error: "Order not found" }, 404);
            const o = order as any;
            if (o.payment_status === 'completed') return json({ error: "Already completed" }, 400);

            await env.terravest_db.prepare("UPDATE properties SET available_tokens = available_tokens - ? WHERE id = ?").bind(o.token_amount, o.property_id).run();
            const existing = await env.terravest_db.prepare("SELECT * FROM token_holdings WHERE user_id = ? AND property_id = ?").bind(o.user_id, o.property_id).first();
            if (existing) {
                await env.terravest_db.prepare("UPDATE token_holdings SET token_amount = token_amount + ? WHERE user_id = ? AND property_id = ?").bind(o.token_amount, o.user_id, o.property_id).run();
            } else {
                await env.terravest_db.prepare("INSERT INTO token_holdings (user_id, property_id, token_amount) VALUES (?, ?, ?)").bind(o.user_id, o.property_id, o.token_amount).run();
            }
            await env.terravest_db.prepare("UPDATE orders SET payment_status = 'completed' WHERE id = ?").bind(o.id).run();
            return json({ success: true });
        } catch (e: any) { return json({ error: e.message }, 500); }
    }


    if (method === "POST" && url.pathname.endsWith("/approve-sell")) {
        try {
            const body = await request.json() as { request_id: number };
            if (!body.request_id) return json({ error: "Request ID required" }, 400);

            await env.terravest_db.prepare(
                "UPDATE sell_requests SET status = 'completed' WHERE id = ?"
            ).bind(body.request_id).run();

            return json({ success: true, message: "Sell request approved (Marked as Paid)" });
        } catch (e: any) { return json({ error: e.message }, 500); }
    }

    return json({ error: "Method not allowed" }, 405);
}

function json(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}