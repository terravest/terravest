import bcrypt from 'bcryptjs';

/**
 * Generate a secure random reset token using Web Crypto API
 * @returns A 32-byte random token (hex encoded = 64 characters)
 */
export function generateResetToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a reset token before storing in database
 * @param token Plain reset token
 * @returns Hashed token
 */
export async function hashResetToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
}

/**
 * Compare a plain token with a hashed token
 * @param token Plain token from user
 * @param hash Hashed token from database
 * @returns true if tokens match
 */
export async function compareResetToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
}

/**
 * Generate expiration time (15 minutes from now)
 * @returns ISO timestamp string
 */
export function getResetTokenExpiration(): string {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);
    return expiration.toISOString();
}
