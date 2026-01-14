import { z } from 'zod';
import { USERNAME_REGEX } from './reserved';

// --- REGISTER SCHEMA ---
export const RegisterSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    username: z.string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(20, { message: "Username must be at most 20 characters" })
        .regex(USERNAME_REGEX, { message: "Username must contain only letters, numbers, and underscores" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

// --- LOGIN SCHEMA ---
export const LoginSchema = z.object({
    identifier: z.string().min(1, { message: "Identifier is required" }),
    identifierType: z.enum(["email", "username"], { message: "identifierType must be 'email' or 'username'" }),
    password: z.string().min(1, { message: "Password is required" }),
    turnstileToken: z.string().optional(),
    rememberMe: z.boolean().optional()
});

// --- FORGOT PASSWORD SCHEMA ---
export const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    turnstileToken: z.string().min(1, { message: "Turnstile token is required" })
});

// --- RESET PASSWORD SCHEMA ---
export const ResetPasswordSchema = z.object({
    token: z.string().min(1, { message: "Reset token is required" }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters" })
});

// --- BUY ORDER SCHEMA ---
export const BuySchema = z.object({
    propertyId: z.number().int().positive(),
    tokenAmount: z.number().positive()
});