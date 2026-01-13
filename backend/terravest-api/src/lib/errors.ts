import { ZodError } from 'zod';
import { Context } from 'hono';

/**
 * Standard error response format
 * { error: string }
 */
export interface ErrorResponse {
	error: string;
}

/**
 * JSON response helper for consistent API responses
 * NOTE: CORS headers are handled by middleware in index.ts - do not set them here
 */
export function json(data: any, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json"
		},
	});
}

/**
 * Standard error response helper
 * Returns consistent error format: { error: string }
 */
export function errorResponse(message: string, status = 400): Response {
	return json({ error: message }, status);
}

/**
 * Validation error helper for Zod errors
 * Returns first validation error message in standard format
 */
export function validationError(zodError: ZodError): Response {
	const firstError = zodError.issues[0];
	const message = firstError?.message || "Validation failed";
	return errorResponse(message, 400);
}

/**
 * Hono context error response helper
 * Returns consistent error format: { error: string }
 */
export function errorJson(c: Context, message: string, status = 400) {
	return c.json({ error: message }, status);
}

/**
 * Hono context validation error helper
 * Returns first validation error message in standard format
 */
export function validationErrorJson(c: Context, zodError: ZodError) {
	const firstError = zodError.issues[0];
	const message = firstError?.message || "Validation failed";
	return errorJson(c, message, 400);
}
