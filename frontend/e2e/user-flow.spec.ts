import { test, expect } from '@playwright/test';

// Production API URL (localhost references removed)
const API_BASE_URL = process.env.API_URL || 'https://terravest-api.terravest.workers.dev/api';

test.describe('User Flow: Login → Deposit → Buy → Portfolio', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TESTpassword123!',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Tam kullanıcı akışı: Login → Deposit → Buy → Portfolio', async ({ page }) => {
    page.on('response', response => {
      if (response.url().includes('/api')) {
        console.log('API Response:', response.url(), 'Status:', response.status());
      }
    });

    let token = '';
    let authHeaders: Record<string, string> = {};

    let targetPropertyId: number | null = null;
    let targetTokenAmount = 1;

    // ==========================================
    // STEP 1: LOGIN
    // ==========================================
    await test.step('Login sayfasına git ve giriş yap', async () => {
      await page.goto('/login');

      const emailInput = page.locator('input[type="email"], input[type="text"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill(testUser.email);
      await passwordInput.fill(testUser.password);

      await Promise.all([
        page
          .waitForResponse(res => {
            const url = res.url();
            return (
              res.request().method() === 'POST' &&
              (url.includes('/api/auth/login') || url.includes('/login'))
            );
          })
          .catch(() => null),
        submitButton.click(),
      ]);

      await expect
        .poll(async () => page.evaluate(() => localStorage.getItem('token')), { timeout: 10000 })
        .toBeTruthy();

      token = (await page.evaluate(() => localStorage.getItem('token'))) || '';
      authHeaders = { Authorization: `Bearer ${token}` };

      await expect(emailInput).toHaveCount(0);
      await expect.poll(() => page.url()).not.toContain('/login');

      console.log('✅ Login state doğrulandı (token + route + form hidden)');
    });

    // ==========================================
    // STEP 1.5: RESET TEST STATE (opsiyonel)
    // ==========================================
    await test.step('Test state reset - Clean user test data', async () => {
      try {
        const resetResp = await page.request.delete(`${API_BASE_URL}/test/reset`, {
          headers: authHeaders,
        });

        if (resetResp.ok()) {
          const resetData = await resetResp.json();
          console.log('✅ Test reset successful:', resetData);
        } else {
          const status = resetResp.status();
          const text = await resetResp.text();
          // 404 is expected in production, so we don't treat it as an error
          if (status === 404) {
            console.log('ℹ️ Test reset endpoint not available (likely production environment)');
          } else {
            console.log('⚠️ Test reset failed:', status, text);
          }
        }
      } catch (e) {
        console.log('⚠️ Test reset endpoint çağrılamadı (yoksa sorun değil):', e);
      }
    });

    // ==========================================
    // STEP 2: ENSURE SUFFICIENT BACKEND BALANCE
    // ==========================================
    let depositId: number | null = null;
    const requiredBalance = 1000;

    await test.step('Backend bakiyesini kontrol et ve gerekirse deposit tamamla', async () => {
      await page.goto('/dashboard');

      const meResponse = await page.request.get(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders,
      });

      expect(meResponse.ok()).toBeTruthy();
      const userData = await meResponse.json();
      const backendBalance = userData.usd_balance || 0;
      console.log('💰 Backend balance:', backendBalance, '(Required:', requiredBalance, ')');

      if (backendBalance >= requiredBalance) {
        console.log('✅ Backend balance is sufficient, skipping deposit');
        return;
      }

      console.log('⚠️ Backend balance insufficient, creating and completing deposit...');

      const headerBalance = page.getByTestId('header-balance');
      await expect(headerBalance).toBeVisible({ timeout: 5000 });

      const depositButton = page.getByTestId('deposit-button');
      await expect(depositButton).toBeVisible({ timeout: 5000 });
      await depositButton.click();

      const depositSubmitButton = page.getByTestId('deposit-submit-button');
      await expect(depositSubmitButton).toBeVisible({ timeout: 5000 });

      const depositAmount = requiredBalance - backendBalance + 100;
      const amountInput = page.locator('input[type="number"]').first();
      await amountInput.fill(depositAmount.toString());

      const depositResponsePromise = page.waitForResponse(
        response =>
          response.url().includes('/api/deposits/generate-address') &&
          response.request().method() === 'POST'
      );

      await depositSubmitButton.click();

      const depositResponse = await depositResponsePromise;
      const depositData = await depositResponse.json();
      depositId = depositData.depositId || depositData.id;
      console.log('✅ Deposit created (ID:', depositId, ', Amount:', depositAmount, ')');

      await page.keyboard.press('Escape');

      if (depositId) {
        try {
          const approveResponse = await page.request.post(
            `${API_BASE_URL}/admin/approve-deposit`,
            {
              headers: { ...authHeaders, 'Content-Type': 'application/json' },
              data: { depositId },
            }
          );

          if (approveResponse.ok()) {
            console.log('✅ Deposit approved via admin endpoint, balance added');
          } else {
            console.log('⚠️ Could not approve deposit via admin:', approveResponse.status(), await approveResponse.text());
          }
        } catch (error) {
          console.log('⚠️ Admin approval failed (test user may not be admin):', error);
        }

        const updatedMeResponse = await page.request.get(`${API_BASE_URL}/auth/me`, {
          headers: authHeaders,
        });

        const updatedUserData = await updatedMeResponse.json();
        const updatedBalance = updatedUserData.usd_balance || 0;
        console.log('💰 Updated backend balance:', updatedBalance);

        if (updatedBalance < requiredBalance) {
          throw new Error(
            `Backend balance (${updatedBalance}) is insufficient for Buy operation (required: ${requiredBalance}). Deposit may not have been approved.`
          );
        }
      }
    });

    // ==========================================
    // STEP 3: MARKETPLACE (buyable property seç)
    // ==========================================
    await test.step('Marketplace ve properties listesi (buyable property seç)', async () => {
      await page.goto('/marketplace');

      const marketplacePage = page.getByTestId('marketplace-page');
      await expect(marketplacePage).toBeVisible({ timeout: 10000 });

      const propsResp = await page.request.get(`${API_BASE_URL}/properties`, {
        headers: authHeaders,
      });
      expect(propsResp.ok()).toBeTruthy();

      const propsJson = await propsResp.json();
      const properties: any[] = Array.isArray(propsJson) ? propsJson : (propsJson.properties ?? []);
      if (!properties.length) throw new Error('No properties returned from /api/properties');

      const getAvailable = (p: any): number => {
        const candidates = [
          p.available_tokens,
          p.tokens_available,
          p.remaining_tokens,
          p.availableTokens,
          p.tokensAvailable,
          p.remainingTokens,
        ];
        for (const v of candidates) {
          const n = Number(v);
          if (Number.isFinite(n)) return n;
        }

        const total = Number(p.total_tokens ?? p.totalTokens);
        const sold = Number(p.sold_tokens ?? p.soldTokens);
        if (Number.isFinite(total) && Number.isFinite(sold)) return Math.max(0, total - sold);

        return 0;
      };

      const desired = 10;
      const candidate = properties.find(p => getAvailable(p) > 0);
      if (!candidate) {
        throw new Error('No buyable property found. All properties have 0 available tokens (or field name mismatch).');
      }

      targetPropertyId = Number(candidate.id ?? candidate.property_id);
      const available = getAvailable(candidate);
      targetTokenAmount = Math.min(desired, Math.max(1, available));

      console.log('✅ Selected buyable property:', { targetPropertyId, available, targetTokenAmount });

      await page
        .waitForSelector('[class*="card"], [class*="grid"], .text-center', { timeout: 5000 })
        .catch(() => console.log('Marketplace page loaded (may be empty/error state)'));
    });

    // ==========================================
    // STEP 4: BUY MODAL / DETAIL (seçilen property)
    // ==========================================
    await test.step('Buy Tokens modal veya detail aç (seçilen property)', async () => {
      if (!targetPropertyId) throw new Error('targetPropertyId is null (property selection failed)');

      // Eğer frontend'e buy-button-<id> eklendiyse onu kullan
      const buyButtonByTestId = page.getByTestId(`buy-button-${targetPropertyId}`);

      // Eğer sadece property-card-<id> ve içinde Buy text'i varsa:
      const buyButtonByCard = page
        .getByTestId(`property-card-${targetPropertyId}`)
        .locator('button:has-text("Buy")')
        .first();

      // Fallback (son çare)
      const fallbackBuyButton = page.locator('button:has-text("Buy")').first();

      if (await buyButtonByTestId.count()) {
        await buyButtonByTestId.click();
      } else if (await buyButtonByCard.count()) {
        await buyButtonByCard.click();
      } else {
        console.log('⚠️ Could not find property-specific Buy button in UI. Falling back to first Buy button.');
        await fallbackBuyButton.click();
      }

      await page.waitForSelector('input[type="number"], [class*="modal"]', { timeout: 5000 });
    });

    // ==========================================
    // STEP 5–6–7: BUY + SUCCESS
    // ==========================================
    let purchasedPropertyId: number | null = null;
    let purchaseVerification: { propertyId: number; tokenAmount: number; apiSuccess: boolean } | null = null;

    await test.step('Token satın al ve başarıyı doğrula', async () => {
      const meResponseBeforeBuy = await page.request.get(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders,
      });
      const userDataBeforeBuy = await meResponseBeforeBuy.json();
      const backendBalanceBeforeBuy = userDataBeforeBuy.usd_balance || 0;
      console.log('💰 Backend balance before Buy:', backendBalanceBeforeBuy);

      const modalContent = page.getByTestId('buy-modal-content');
      await expect(modalContent).toBeVisible({ timeout: 5000 });

      if (!targetPropertyId) throw new Error('targetPropertyId is null');

      const tokenAmount = targetTokenAmount;
      console.log('🔢 Token amount:', tokenAmount);

      const tokenInput = page.locator('input[type="number"]').first();
      await tokenInput.fill(tokenAmount.toString());

      const confirmButton = page.getByTestId('buy-confirm-button');
      await expect(confirmButton).toBeVisible({ timeout: 5000 });
      await expect(confirmButton).toBeEnabled({ timeout: 5000 });

      const buyRequestPromise = page.waitForRequest(
        request => request.url().includes('/api/buy') && request.method() === 'POST'
      );

      const buyResponsePromise = page.waitForResponse(
        response => response.url().includes('/api/buy') && response.request().method() === 'POST'
      );

      await confirmButton.click();

      const buyRequest = await buyRequestPromise;
      const requestBody = await buyRequest.postDataJSON();
      purchasedPropertyId = requestBody.propertyId;
      console.log('✅ Captured property ID from buy request:', purchasedPropertyId);

      const buyApiResponse = await buyResponsePromise;
      const buyStatus = buyApiResponse.status();
      const buyBodyText = await buyApiResponse.text();

      console.log('Buy response status:', buyStatus);
      console.log('Buy response body:', buyBodyText);

      expect(buyStatus).toBeGreaterThanOrEqual(200);
      expect(buyStatus).toBeLessThan(300);

      let buyResponseBody: any = null;
      try {
        buyResponseBody = JSON.parse(buyBodyText);
      } catch {
        buyResponseBody = { message: buyBodyText };
      }

      expect(buyResponseBody).toHaveProperty('message');
      expect(String(buyResponseBody.message)).toMatch(/success/i);

      console.log('✅ Purchase API call successful (status:', buyStatus, ', message:', buyResponseBody.message, ')');

      if (purchasedPropertyId !== null) {
        purchaseVerification = { propertyId: purchasedPropertyId, tokenAmount, apiSuccess: true };
        console.log('✅ Purchase verified: Property', purchasedPropertyId, ', Tokens:', tokenAmount);
      } else {
        throw new Error('Purchase succeeded but property ID was not captured from request');
      }

      await expect(modalContent).toBeHidden({ timeout: 10000 });
      console.log('✅ Buy modal closed after successful purchase');

      const successToast = page
        .locator('[class*="toast"], [role="status"]')
        .filter({ hasText: /success|successful|completed|purchase/i });

      try {
        await expect(successToast.first()).toBeVisible({ timeout: 2000 });
        console.log('ℹ️ Success toast appeared (optional)');
      } catch {
        console.log('ℹ️ Toast not visible (this is OK - API success verified)');
      }
    });

    // ==========================================
    // STEP 8: PORTFOLIO VERIFICATION
    // ==========================================
    await test.step("Portfolio doğrulama - Satın alınan asset'in görünürlüğünü kontrol et", async () => {
      if (!purchaseVerification || !purchaseVerification.apiSuccess) {
        throw new Error('Cannot verify portfolio: Purchase was not successfully verified. Test cannot proceed.');
      }

      const { propertyId, tokenAmount } = purchaseVerification;
      console.log('🔍 Verifying portfolio for property', propertyId, 'with', tokenAmount, 'tokens');

      await page.goto('/dashboard');
      await page.waitForSelector('text=My Account', { timeout: 5000 });

      // Portfolio tab aktif değilse aç (güvenlik için)
      const portfolioTabButton = page.getByRole('button', { name: /portfolio/i });
      if (await portfolioTabButton.count()) {
        await portfolioTabButton.click().catch(() => {});
      }

      const portfolioSection = page.getByTestId('portfolio-section');
      await expect(portfolioSection).toBeVisible({ timeout: 5000 });

      console.log('🔄 Reloading page to force portfolio data refresh...');

      const portfolioResponsePromise = page.waitForResponse(
        response => response.url().includes('/api/portfolio') && response.status() === 200
      );

      await page.reload({ waitUntil: 'networkidle' });
      await expect(portfolioSection).toBeVisible({ timeout: 5000 });

      const portfolioResponse = await portfolioResponsePromise;
      const portfolioData = await portfolioResponse.json();
      console.log('✅ Portfolio API response received (fresh data)');

      const assetsInApi = portfolioData.assets || [];
      const matchingAssetInApi = assetsInApi.find((asset: any) => asset.property_id === propertyId);

      if (!matchingAssetInApi) {
        console.error('❌ Asset NOT found in Portfolio API response:', {
          propertyId,
          tokenAmount,
          assetsInApi: assetsInApi.map((a: any) => ({ property_id: a.property_id, investedAmount: a.investedAmount })),
        });

        throw new Error(
          `Asset for property ${propertyId} NOT found in Portfolio API response. Found ${assetsInApi.length} asset(s).`
        );
      }

      console.log('✅ Asset verified in Portfolio API response:', {
        propertyId: matchingAssetInApi.property_id,
        investedAmount: matchingAssetInApi.investedAmount,
      });

      // Kartlar aynı property için birden fazla olabilir (state birikiyorsa).
      // O yüzden sadece "var mı" diye kontrol edip, token amount'u kartın İÇİNDE arıyoruz.
      const assetCards = page.getByTestId(`portfolio-asset-card-${propertyId}`);

      await expect
        .poll(async () => assetCards.count(), {
          message: `Asset card(s) for property ${propertyId} should appear in UI`,
          timeout: 20000,
          intervals: [500, 1000, 2000],
        })
        .toBeGreaterThan(0);

      console.log('✅ Verified: Asset for property', propertyId, 'exists in portfolio');

      const assetCard = assetCards.first();
      await expect(assetCard).toBeVisible({ timeout: 5000 });

      // STRICT MODE FIX:
      // Token elementini page’den değil, bu kartın içinden seçiyoruz.
      const tokenAmountElement = assetCard.locator(`[data-testid="portfolio-token-amount-${propertyId}"]`);

      await expect(tokenAmountElement).toBeVisible({ timeout: 5000 });
      await expect(tokenAmountElement).toHaveText(new RegExp(`^${tokenAmount}(\\.00)?$`));

      console.log('✅ Portfolio verification completed: Purchase asset is visible and correct');
    });
  });
});