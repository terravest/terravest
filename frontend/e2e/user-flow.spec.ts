import { test, expect } from '@playwright/test';

test.describe('User Flow: Login → Buy → Portfolio', () => {
  const mockUser = {
    id: 1,
    email: 'verified@example.com',
    username: 'verified',
    usd_balance: 100000,
    role: 'user',
  };

  const mockProperty = {
    id: 1,
    title: 'Test Villa',
    location: 'Miami, FL',
    price_usd: 1000000,
    total_tokens: 100,
    available_tokens: 50,
    rental_yield: '6.5%',
    image_url: 'https://placehold.co/600x400',
    price_per_token: 10000,
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).turnstile = {
        render: (_el: any, options: any) => {
          setTimeout(() => options.callback('test-token'), 0);
          return 'test-widget';
        },
        reset: () => {}
      };
    });

    await page.route('**/turnstile/v0/api.js*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.turnstile = {
            render: (el, options) => {
              setTimeout(() => options.callback('test-token'), 0);
              return 'test-widget';
            },
            reset: () => {}
          };
        `,
      });
    });

    await page.route('**/turnstile/v0/b/**/api.js*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.turnstile = {
            render: (el, options) => {
              setTimeout(() => options.callback('test-token'), 0);
              return 'test-widget';
            },
            reset: () => {}
          };
        `,
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'mock-token', user: mockUser }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUser),
      });
    });

    await page.route('**/api/properties', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockProperty]),
      });
    });

    await page.route('**/api/properties/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockProperty,
          description: 'Mock property details',
          bed: 2,
          bath: 2,
          sqft: 1200,
          images: [{ url: mockProperty.image_url }],
          monthly_yield: 4500,
          status: 'active',
        }),
      });
    });

    await page.route('**/api/buy', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Tokens purchased successfully', totalCost: 10000 }),
      });
    });

    await page.route('**/api/portfolio', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          assets: [
            {
              id: 1,
              property_id: 1,
              propertyName: mockProperty.title,
              investedAmount: 1,
              price_usd: mockProperty.price_usd,
              total_tokens: mockProperty.total_tokens,
              current_price: 10000,
              unclaimed_rewards: 0,
            },
          ],
        }),
      });
    });

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Mocked flow: login → buy → portfolio', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="text"]').fill('verified@example.com');
    await page.locator('input[type="password"]').fill('Password123!');

    await page.getByRole('button', { name: /login/i }).click();

    await expect
      .poll(async () => page.evaluate(() => sessionStorage.getItem('token') || localStorage.getItem('token')))
      .toBeTruthy();

    await page.goto('/marketplace');
    await expect(page.getByText(mockProperty.title)).toBeVisible();

    await page.getByText(mockProperty.title).click();
    await expect(page).toHaveURL(/\/properties\/1/);

    const buyButton = page.getByRole('button', { name: /confirm/i });
    await expect(buyButton).toBeVisible();
    await buyButton.click();

    await expect(page).toHaveURL(/\/dashboard/);

    const assetCard = page.getByTestId('portfolio-asset-card-1');
    await expect(assetCard).toBeVisible();
  });
});