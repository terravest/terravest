import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_URL || 'https://terravest-api.terravest.workers.dev/api';

async function mockTurnstile(page: any) {
  const scriptBody = `
    window.turnstile = {
      render: (el, options) => {
        setTimeout(() => options.callback('test-token'), 0);
        return 'test-widget';
      },
      reset: () => {}
    };
  `;

  await page.addInitScript(() => {
    (window as any).turnstile = {
      render: (_el: any, options: any) => {
        setTimeout(() => options.callback('test-token'), 0);
        return 'test-widget';
      },
      reset: () => {}
    };
  });

  await page.route('**/turnstile/v0/api.js*', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: scriptBody,
    });
  });

  await page.route('**/turnstile/v0/b/**/api.js*', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: scriptBody,
    });
  });
}

test.describe('Email Verification Flow', () => {
  test('Register redirects to verify email pending (EN)', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, requiresVerification: true }),
      });
    });

    await page.goto('/register');

    await page.locator('input[type="text"]').fill('newuser');
    await page.locator('input[type="email"]').fill('newuser@example.com');
    await page.locator('input[type="password"]').first().fill('Password123!');
    await page.locator('input[type="password"]').nth(1).fill('Password123!');

    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/verify-email-pending$/);
    await expect(page.getByText('Please verify your email to continue')).toBeVisible();
  });

  test('Register redirects and renders localized copy (ES)', async ({ page }) => {
    await page.route('**/api/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, requiresVerification: true }),
      });
    });

    await page.goto('/es/register');

    await page.locator('input[type="text"]').fill('nuevo');
    await page.locator('input[type="email"]').fill('nuevo@example.com');
    await page.locator('input[type="password"]').first().fill('Password123!');
    await page.locator('input[type="password"]').nth(1).fill('Password123!');

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/es\/verify-email-pending$/);
    await expect(page.getByText('Verifica tu correo para continuar')).toBeVisible();
  });

  test('Verify email page shows success state', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/pt-br/verify-email?token=valid');
    await expect(page.getByText(/verificado/i)).toBeVisible();
  });

  test('Verify email page shows error state', async ({ page }) => {
    await page.route('**/api/auth/verify-email', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid or expired verification link.' }),
      });
    });

    await page.goto('/fr/verify-email?token=invalid');
    await expect(page.getByText('Le lien de vérification est invalide ou expiré.')).toBeVisible();
  });

  test('Login shows EMAIL_NOT_VERIFIED warning and resend CTA', async ({ page }) => {
    await mockTurnstile(page);
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'EMAIL_NOT_VERIFIED' }),
      });
    });

    await page.goto('/login');

    await page.locator('input[type="text"]').fill('user@example.com');
    await page.locator('input[type="password"]').fill('Password123!');

    const submit = page.getByRole('button', { name: /login/i });
    await expect(submit).toBeEnabled({ timeout: 10000 });
    await submit.click();

    await expect(page.getByText('Please verify your email before logging in.')).toBeVisible();
    await expect(page.getByRole('button', { name: /resend verification email/i })).toBeVisible();
  });
});
