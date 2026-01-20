import { test, expect, type Page } from '@playwright/test';

const API_URL = 'https://terravest-api.terravest.workers.dev/api';

type MockUser = {
  id: number;
  email: string;
  username: string;
  usd_balance: number;
  role?: string;
};

const mockUser: MockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  usd_balance: 123456,
  role: 'user',
};

async function mockAuthenticatedApi(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
  });

  await page.route('**/api/**', async (route) => {
    const url = route.request().url();

    if (url.endsWith('/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    }

    if (url.endsWith('/portfolio')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ assets: [] }),
      });
    }

    if (url.endsWith('/transactions')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }

    if (url.startsWith(API_URL)) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    }

    return route.continue();
  });
}

test.describe('Localization', () => {
  test('Public routes and language switching', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Marketplace' })).toBeVisible();

    await page.goto('/pt-br/');
    // Portekizce sayfa kontrolü
    await expect(page.getByRole('link', { name: 'Sobre' })).toBeVisible();

    await page.goto('/');
    // DÜZELTME: { exact: true } eklendi. Başka kelimelerin içindeki "es" hecesiyle karışmaz.
    await page.getByRole('link', { name: 'ES', exact: true }).click();

    await expect(page).toHaveURL(/\/es(\/|$)/);
    await expect(page.getByRole('link', { name: 'Acerca de' })).toBeVisible();
  });

  test('Navigation preserves language prefix', async ({ page }) => {
    await page.goto('/pt-br/');
    await page.getByRole('link', { name: 'Sobre' }).click();
    await expect(page).toHaveURL(/\/pt-br\/about$/);
  });

  test('Dashboard localized strings and pt-BR formatting', async ({ page }) => {
    await mockAuthenticatedApi(page);
    await page.goto('/pt-br/dashboard');

    await expect(page.getByRole('heading', { name: 'Meu Portfólio' })).toBeVisible();
    await expect(page.getByText('Patrimônio Total')).toBeVisible();

    // DÜZELTME: .first() eklendi. Sayfada bu sayı birden fazla yerde (header, grafik vb.) geçiyor.
    await expect(page.getByText(/1\.234,56/).first()).toBeVisible();
  });

  test('EN formatting for currency', async ({ page }) => {
    await mockAuthenticatedApi(page);
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'My Portfolio' })).toBeVisible();

    // DÜZELTME: .first() eklendi.
    await expect(page.getByText(/1,234\.56/).first()).toBeVisible();
  });
});