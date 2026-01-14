import { z } from 'zod';

// --- REGISTER SCHEMA ---
export const RegisterSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

// --- LOGIN SCHEMA ---
export const LoginSchema = z.object({
    identifier: z.string().min(1, { message: "Email or Username is required" }),
    password: z.string().min(1, { message: "Password is required" }),
    turnstileToken: z.string().optional(),
    rememberMe: z.boolean().optional()
});

// --- BUY ORDER SCHEMA ---
export const BuySchema = z.object({
    propertyId: z.number().int().positive(),
    tokenAmount: z.number().positive()
});