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
            // Use subquery to get the main image from property_images table
            // Priority: is_main = 1 first, then smallest id
            const { results } = await env.terravest_db.prepare(`
                SELECT 
                    p.*,
                    COALESCE(
                        (SELECT url FROM property_images 
                         WHERE property_id = p.id 
                         ORDER BY is_main DESC, id ASC 
                         LIMIT 1),
                        p.image_url
                    ) as image_url
                FROM properties p
                WHERE p.status != 'deleted' OR p.status IS NULL
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
            const { title, description, location, price_usd, total_tokens, available_tokens, image_url, rental_yield, images } = body;

            if (!title || !price_usd || !total_tokens) {
                return errorResponse("Missing required fields", 400);
            }

            // Use provided available_tokens or default to total_tokens
            const finalAvailableTokens = available_tokens !== undefined 
                ? parseInt(available_tokens) 
                : parseInt(total_tokens);

            // Validate: available_tokens cannot exceed total_tokens
            if (finalAvailableTokens > parseInt(total_tokens)) {
                return errorResponse("Available tokens cannot exceed total tokens", 400);
            }

            // Determine main image URL (from images array or legacy image_url)
            let mainImageUrl = image_url || null;
            if (images && Array.isArray(images) && images.length > 0) {
                const mainImage = images.find((img: any) => img.isMain === true);
                if (mainImage) {
                    mainImageUrl = mainImage.url;
                } else if (images[0]) {
                    // If no main image specified, use first one
                    mainImageUrl = images[0].url;
                }
            }

            // Insert property (rental_yield is TEXT, can be string like "6-20%", "~12%", etc.)
            // Note: Using price_usd as per migration schema
            const result = await env.terravest_db.prepare(
                `INSERT INTO properties (title, description, location, price_usd, total_tokens, available_tokens, status, image_url, rental_yield) 
                 VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`
            ).bind(title, description, location || null, price_usd, total_tokens, finalAvailableTokens, mainImageUrl, rental_yield || null).run();

            const newPropertyId = result.meta.last_row_id;

            // Insert images into property_images table
            if (images && Array.isArray(images) && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    if (img.url) {
                        await env.terravest_db.prepare(
                            `INSERT INTO property_images (property_id, url, is_main, display_order) 
                             VALUES (?, ?, ?, ?)`
                        ).bind(
                            newPropertyId,
                            img.url,
                            img.isMain === true ? 1 : 0,
                            i // Use array index as display_order
                        ).run();
                    }
                }
            }

            return json({ success: true, message: "Property created", id: newPropertyId });
        } catch (e: any) {
            return errorResponse(e.message || "Internal server error", 500);
        }
    }

    // PUT: Update property (admin only)
    if (method === "PUT" && propertyId && !isNaN(propertyId)) {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;

        try {
            const body = await request.json() as any;
            const { title, description, location, price_usd, total_tokens, available_tokens, rental_yield, images } = body;

            // Check if property exists
            const existingProperty = await env.terravest_db.prepare(
                `SELECT id, total_tokens, available_tokens FROM properties WHERE id = ?`
            ).bind(propertyId).first() as any;

            if (!existingProperty) {
                return errorResponse("Property not found", 404);
            }

            // Determine main image URL (from images array)
            let mainImageUrl = null;
            if (images && Array.isArray(images) && images.length > 0) {
                const mainImage = images.find((img: any) => img.isMain === true);
                if (mainImage) {
                    mainImageUrl = mainImage.url;
                } else if (images[0]) {
                    mainImageUrl = images[0].url;
                }
            }

            // Update property (only update provided fields)
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            if (title !== undefined) {
                updateFields.push("title = ?");
                updateValues.push(title);
            }
            if (description !== undefined) {
                updateFields.push("description = ?");
                updateValues.push(description);
            }
            if (location !== undefined) {
                updateFields.push("location = ?");
                updateValues.push(location);
            }
            if (price_usd !== undefined) {
                updateFields.push("price_usd = ?");
                updateValues.push(price_usd);
            }
            if (total_tokens !== undefined) {
                updateFields.push("total_tokens = ?");
                updateValues.push(total_tokens);
            }
            if (available_tokens !== undefined) {
                // Validate: available_tokens cannot exceed total_tokens
                const finalTotalTokens = total_tokens !== undefined ? parseInt(total_tokens) : existingProperty.total_tokens;
                const finalAvailableTokens = parseInt(available_tokens);
                
                if (finalAvailableTokens > finalTotalTokens) {
                    return errorResponse("Available tokens cannot exceed total tokens", 400);
                }
                
                updateFields.push("available_tokens = ?");
                updateValues.push(finalAvailableTokens);
            }
            if (rental_yield !== undefined) {
                updateFields.push("rental_yield = ?");
                updateValues.push(rental_yield); // Can be string like "6-20%", "~12%", etc.
            }
            if (mainImageUrl !== null) {
                updateFields.push("image_url = ?");
                updateValues.push(mainImageUrl);
            }

            if (updateFields.length > 0) {
                updateValues.push(propertyId);
                await env.terravest_db.prepare(
                    `UPDATE properties SET ${updateFields.join(", ")} WHERE id = ?`
                ).bind(...updateValues).run();
            }

            // Update images: Delete old images and insert new ones
            if (images !== undefined) {
                // Delete all existing images for this property
                await env.terravest_db.prepare(
                    `DELETE FROM property_images WHERE property_id = ?`
                ).bind(propertyId).run();

                // Insert new images
                if (Array.isArray(images) && images.length > 0) {
                    for (let i = 0; i < images.length; i++) {
                        const img = images[i];
                        if (img.url) {
                            await env.terravest_db.prepare(
                                `INSERT INTO property_images (property_id, url, is_main, display_order) 
                                 VALUES (?, ?, ?, ?)`
                            ).bind(
                                propertyId,
                                img.url,
                                img.isMain === true ? 1 : 0,
                                i
                            ).run();
                        }
                    }
                }
            }

            return json({ success: true, message: "Property updated" });
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