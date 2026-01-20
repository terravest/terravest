import bcrypt from 'bcryptjs';

export function generateVerificationToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashVerificationToken(token: string): Promise<string> {
	return bcrypt.hash(token, 10);
}

export async function compareVerificationToken(token: string, hash: string): Promise<boolean> {
	return bcrypt.compare(token, hash);
}

export function getVerificationTokenExpiration(): string {
	const expiration = new Date();
	expiration.setHours(expiration.getHours() + 24);
	return expiration.toISOString();
}
