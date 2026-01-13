-- ==========================================
-- Migration: Final Fix for Old Schema
-- ==========================================

PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

-- 1. Yeni tabloyu oluştur (Gelişmiş şema)
CREATE TABLE IF NOT EXISTS properties_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    location TEXT,
    price_usd REAL,
    total_tokens INTEGER,
    available_tokens INTEGER,
    rental_yield TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Verileri kopyala
-- DİKKAT: Eski tabloda olmayan sütunlar için varsayılan değerler kullanıyoruz.
INSERT INTO properties_new (
    id, title, description, location, price_usd, 
    total_tokens, available_tokens, rental_yield, image_url, 
    status, created_at
)
SELECT 
    id, 
    title, 
    description, 
    location, 
    price,         -- Eski isim: price -> Yeni isim: price_usd
    total_tokens, 
    total_tokens,  -- Eski tabloda 'available' yoksa, total'i kopyala
    -- Yield dönüşümü (Sayıyı metne çevirip % ekle)
    CASE 
        WHEN rental_yield IS NOT NULL THEN CAST(rental_yield AS TEXT) || '%'
        ELSE NULL
    END,
    image_url,
    'active',      -- Eski tabloda 'status' yok, hepsini 'active' yap
    created_at
FROM properties;

-- 3. Eski tabloyu sil
DROP TABLE properties;

-- 4. Yeni tablonun ismini değiştir
ALTER TABLE properties_new RENAME TO properties;

COMMIT;

PRAGMA foreign_keys=on;