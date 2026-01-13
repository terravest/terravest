import { requireAuth } from "../lib/auth";
import { Env } from "../index";
import { json, errorResponse } from "../lib/errors";

export async function handleProperties(request: Request, env: Env): Promise<Response> {
    const method = request.method;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const propertyId = pathParts[pathParts.length - 1] && pathParts[pathParts.length - 1] !== 'properties'
        ? parseInt(pathParts[pathParts.length - 1])
        : null;

    // GET: Single property by ID (with images) or list all properties
    if (method === "GET") {
        try {
            // If propertyId is provided, return single property with ALL images
            if (propertyId && !isNaN(propertyId)) {
                const property = await env.terravest_db.prepare(
                    `SELECT * FROM properties WHERE id = ?`
                ).bind(propertyId).first();

                if (!property) {
                    return errorResponse("Property not found", 404);
                }

                // Fetch all images for this property, ordered by display_order
                const { results: images } = await env.terravest_db.prepare(
                    `SELECT id, url, is_main, display_order 
                     FROM property_images 
                     WHERE property_id = ? 
                     ORDER BY display_order ASC, id ASC`
                ).bind(propertyId).all();

                // Transform images array: convert is_main (0/1) to boolean
                const imagesArray = (images || []).map((img: any) => ({
                    id: img.id,
                    url: img.url,
                    isMain: img.is_main === 1,
                    displayOrder: img.display_order
                }));

                // If no images in property_images table, fallback to legacy image_url
                if (imagesArray.length === 0 && (property as any).image_url) {
                    imagesArray.push({
                        id: null,
                        url: (property as any).image_url,
                        isMain: true,
                        displayOrder: 0
                    });
                }

                return json({
                    ...property,
                    images: imagesArray
                });
            }

            // LIST ALL PROPERTIES (Updated for Card View)
            // Join with property_images to get the main image as 'image_url' for the frontend card
            const { results } = await env.terravest_db.prepare(`
                SELECT 
                    p.*, 
                    pi.url as image_url 
                FROM properties p 
                LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_main = 1
                ORDER BY p.created_at DESC
            `).all();

            return json(results);

        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    // POST: Create new property (admin only)
    if (method === "POST") {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;

        try {
            const body = await request.json() as any;
            const { title, description, price_usd, total_tokens, image_url, monthly_yield } = body;

            if (!title || !price_usd || !total_tokens) {
                return errorResponse("Missing required fields", 400);
            }

            await env.terravest_db.prepare(
                `INSERT INTO properties (title, description, price_usd, total_tokens, available_tokens, status, image_url, monthly_yield) 
                 VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`
            ).bind(title, description, price_usd, total_tokens, total_tokens, image_url || null, monthly_yield || 0).run();

            return json({ success: true, message: "Property created" });
        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    // DELETE: Soft delete property (admin only)
    if (method === "DELETE") {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;

        try {
            const body = await request.json() as { id: number };

            if (!body.id) return errorResponse("Property ID required", 400);

            // Soft delete: update status instead of deleting record
            await env.terravest_db.prepare(
                "UPDATE properties SET status = 'deleted' WHERE id = ?"
            ).bind(body.id).run();

            return json({ success: true, message: "Property deactivated (Soft Delete)" });
        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    return errorResponse("Method not allowed", 405);
}