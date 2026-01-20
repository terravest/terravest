import { describe, it, expect } from 'vitest';
import { getErrorMessage, getSuccessMessage, normalizeLang } from '../src/lib/i18n';

describe('i18n Helpers', () => {
	it('✅ should normalize language codes', () => {
		expect(normalizeLang('en')).toBe('en');
		expect(normalizeLang('es')).toBe('es-419');
		expect(normalizeLang('es-419')).toBe('es-419');
		expect(normalizeLang('pt')).toBe('pt-BR');
		expect(normalizeLang('pt-br')).toBe('pt-BR');
		expect(normalizeLang('fr')).toBe('fr');
		expect(normalizeLang('unknown')).toBe('en');
	});

	it('✅ should localize EMAIL_NOT_VERIFIED', () => {
		expect(getErrorMessage('es-419', 'EMAIL_NOT_VERIFIED')).toBe('Verifica tu correo antes de iniciar sesión.');
		expect(getErrorMessage('pt-BR', 'EMAIL_NOT_VERIFIED')).toBe('Verifique seu e-mail antes de entrar.');
		expect(getErrorMessage('fr', 'EMAIL_NOT_VERIFIED')).toBe('Veuillez vérifier votre e-mail avant de vous connecter.');
	});

	it('✅ should localize verification errors and fallback to English', () => {
		expect(getErrorMessage('en', 'EMAIL_VERIFICATION_INVALID')).toBe('Invalid or expired verification link.');
		expect(getErrorMessage('es-419', 'EMAIL_VERIFICATION_INVALID')).toBe('Enlace de verificación inválido o vencido.');
		expect(getErrorMessage('invalid' as any, 'EMAIL_VERIFICATION_INVALID')).toBe('Invalid or expired verification link.');
	});

	it('✅ should localize INSUFFICIENT_BALANCE', () => {
		expect(getErrorMessage('pt-BR', 'INSUFFICIENT_BALANCE')).toBe('Saldo insuficiente.');
	});

	it('✅ should localize success messages', () => {
		expect(getSuccessMessage('en', 'EMAIL_VERIFICATION_SUCCESS')).toBe('Email verified successfully.');
		expect(getSuccessMessage('es-419', 'EMAIL_VERIFICATION_SENT')).toBe('Se envió el correo de verificación.');
	});

	it('✅ should localize RATE_LIMIT_EXCEEDED', () => {
		expect(getErrorMessage('en', 'RATE_LIMIT_EXCEEDED')).toBe('Too many requests, please try again later.');
		expect(getErrorMessage('fr', 'RATE_LIMIT_EXCEEDED')).toBe('Trop de requêtes, veuillez réessayer plus tard.');
	});
});
