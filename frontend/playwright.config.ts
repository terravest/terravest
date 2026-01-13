import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Test dosyalarını paralel çalıştırma */
  fullyParallel: true,
  /* CI'da başarısız olursa tekrar dene */
  retries: process.env.CI ? 2 : 0,
  /* Paralel worker sayısı */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter configuration */
  reporter: 'html',
  /* Shared settings for all the projects below */
  use: {
    /* Base URL */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Test projeleri - farklı browser'lar için */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // İsterseniz diğer browser'ları da ekleyebilirsiniz
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Development server'ı test öncesi başlat */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
