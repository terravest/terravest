// Reserved Usernames (Case-Insensitive)
// These usernames are globally reserved and cannot be used for registration
export const RESERVED_USERNAMES = [
    "admin",
    "support",
    "terravest",
    "root",
    "system",
    "moderator",
    "help",
    "api",
    "login",
    "register"
];

/**
 * Check if a username is reserved (case-insensitive)
 * @param username - Username to check
 * @returns true if reserved, false otherwise
 */
export function isReservedUsername(username: string): boolean {
    const normalized = username.toLowerCase();
    return RESERVED_USERNAMES.includes(normalized);
}

/**
 * Username validation regex: alphanumeric + underscore, 3-20 characters
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
