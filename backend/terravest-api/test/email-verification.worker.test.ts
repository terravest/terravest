import { describe, it, expect } from 'vitest';
import { compareVerificationToken, generateVerificationToken, getVerificationTokenExpiration, hashVerificationToken } from '../src/lib/email-verification';

describe('Email Verification Helpers', () => {
	it('✅ should generate a 64-char hex token', () => {
		const token = generateVerificationToken();
		expect(token).toMatch(/^[a-f0-9]{64}$/);
	});

	it('✅ should hash and compare verification tokens', async () => {
		const token = generateVerificationToken();
		const hash = await hashVerificationToken(token);

		expect(hash).toBeTruthy();
		expect(hash).not.toBe(token);

		const matches = await compareVerificationToken(token, hash);
		expect(matches).toBe(true);

		const wrongMatch = await compareVerificationToken('wrong-token', hash);
		expect(wrongMatch).toBe(false);
	});

	it('✅ should set expiration to about 24 hours in the future', () => {
		const expiresAt = getVerificationTokenExpiration();
		const expiry = new Date(expiresAt).getTime();
		const now = Date.now();
		const diffHours = (expiry - now) / (1000 * 60 * 60);

		expect(diffHours).toBeGreaterThan(23.5);
		expect(diffHours).toBeLessThan(24.5);
	});
});
