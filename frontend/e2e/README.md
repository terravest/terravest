# Playwright E2E Testleri

Bu klasör Terravest frontend uygulaması için end-to-end testleri içerir.

## Kurulum

Playwright zaten kurulmuş olmalı. Eğer kurulu değilse:

```bash
npm install -D @playwright/test
npx playwright install
```

## Test Kullanıcısı

Testlerin çalışması için backend'de bir test kullanıcısı kayıtlı olmalı:

- **Email:** `test@example.com`
- **Password:** `testpassword123`
- **Username:** `testuser`

Bu kullanıcıyı backend'de kaydetmek için:

1. Backend API'yi başlatın: `cd backend/terravest-api && npm run dev`
2. Register endpoint'ini kullanın veya seed data ekleyin

## Testleri Çalıştırma

### Tüm testleri çalıştır
```bash
npm run test:e2e
```

### UI modunda çalıştır (görsel test runner)
```bash
npm run test:e2e:ui
```

### Headed modda çalıştır (browser görünür)
```bash
npm run test:e2e:headed
```

### Debug modda çalıştır
```bash
npm run test:e2e:debug
```

## Test Senaryosu

`user-flow.spec.ts` dosyası şu akışı test eder:

1. ✅ Kullanıcı `/login` sayfasına gider ve giriş yapar
2. ✅ BTC deposit eder
3. ✅ Dashboard'da 'Properties' listesini görür
4. ✅ İlk mülke tıklar (detay sayfası veya buy modal)
5. ✅ 'Buy Tokens' butonuna basar, 10 token girer ve onaylar
6. ✅ İşlem sırasında 'Loading' spinner görüp görmediğini kontrol eder
7. ✅ İşlem bitince 'Success' mesajını (toast) yakalar
8. ✅ Portfolio sayfasına gidip yeni tokenlerin orada listelendiğini doğrular

## Gereksinimler

- Backend API çalışıyor olmalı (`http://127.0.0.1:8787`)
- Frontend dev server çalışıyor olmalı (`http://localhost:5173`)
- Test kullanıcısı backend'de kayıtlı olmalı
- En az bir property backend'de mevcut olmalı

## Notlar

- Testler otomatik olarak dev server'ı başlatır (playwright.config.ts'de `webServer` ayarı)
- Testler paralel çalışabilir
- Başarısız testler otomatik olarak screenshot alır
- CI ortamında testler 2 kez tekrar dener
