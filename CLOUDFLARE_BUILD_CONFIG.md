# Cloudflare Workers Build Configuration Rehberi

Bu rehber, `backend/terravest-api` dizini için Cloudflare Dashboard'daki **Build Configuration** ayarlarını açıklar.

## 📋 Build Configuration Tablosu

| Ayar | Değer | Açıklama |
|------|-------|----------|
| **Build command** | `npm install && npm run deploy` | Bağımlılıkları yükler ve production deploy yapar |
| **Deploy command** | `npm run deploy` | Wrangler ile production'a deploy eder |
| **Non-production branch deploy command** | `npm install && wrangler deploy --env preview` | Preview environment için deploy (eğer preview env varsa) |
| **Path** | `backend/terravest-api` | Monorepo kök dizinine göre proje yolu |
| **Root directory** | `backend/terravest-api` | Çalışma dizini (alternatif olarak kullanılabilir) |

## 🔧 Detaylı Açıklamalar

### Build Command
```bash
npm install && npm run deploy
```
- `npm install`: Tüm bağımlılıkları yükler
- `npm run deploy`: `wrangler deploy` komutunu çalıştırır (package.json'dan)

### Deploy Command
```bash
npm run deploy
```
- Direkt olarak `wrangler deploy` komutunu çalıştırır
- Production environment'a deploy yapar
- `wrangler.jsonc` dosyasındaki ayarları kullanır

### Non-Production Branch Deploy Command
```bash
npm install && wrangler deploy --env preview
```
- Preview branch'leri için kullanılır
- Eğer preview environment'ınız yoksa, bu komutu atlayabilir veya aynı production komutunu kullanabilirsiniz
- Alternatif olarak: `npm install && npm run deploy`

### Path
- **Değer**: `backend/terravest-api`
- Monorepo yapısında, Cloudflare Dashboard'un hangi dizinde çalışacağını belirtir
- Proje kök dizinine göre relatif yol

## ⚙️ Environment Variables (Cloudflare Dashboard)

Dashboard'da aşağıdaki environment variable'ları ayarlayın:

| Variable | Production Value | Açıklama |
|----------|------------------|----------|
| `VITE_API_URL` | `https://terravest-api.terravest.workers.dev/api` | Frontend için API URL (frontend build'inde kullanılacak) |

**Not**: `wrangler.jsonc` dosyasındaki `vars` bölümü zaten `VITE_API_URL`'i içeriyor, ancak Cloudflare Dashboard'daki environment variable'ları da kontrol edilmelidir.

## 🚀 Deployment Adımları

1. **Cloudflare Dashboard** → **Workers & Pages** → **Your Worker** → **Settings**
2. **Build Configuration** bölümüne gidin
3. Yukarıdaki tablodaki değerleri girin
4. **Save** butonuna tıklayın

## 📝 Notlar

- **Monorepo yapısı**: Path değeri monorepo kök dizinine göre ayarlanmalıdır
- **Wrangler CLI**: `wrangler.jsonc` dosyasındaki tüm ayarlar otomatik olarak kullanılır
- **Environment Variables**: `wrangler.jsonc` içindeki `vars` bölümü production için yeterlidir, ancak Dashboard'daki environment variable'ları da kontrol edin
- **Build Time**: `npm install` her build'de çalışacağı için, bağımlılıklar her seferinde yeniden yüklenecektir

## 🔍 Kontrol Listesi

- [ ] Build command doğru dizinde çalışıyor mu?
- [ ] Deploy command `wrangler deploy` komutunu çalıştırıyor mu?
- [ ] Path değeri monorepo yapısına uygun mu?
- [ ] Environment variable'lar Dashboard'da ayarlanmış mı?
- [ ] `wrangler.jsonc` dosyası güncel mi?
