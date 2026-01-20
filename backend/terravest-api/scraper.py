import os
import requests
import pandas as pd
import random  # Rastgelelik için eklendi
from homeharvest import scrape_property

# ================= AYARLAR =================
# Worker Adresi (Canlı)
WORKER_URL = "https://terravest-api.terravest.workers.dev/import/property"
IMPORT_KEY = "terravest-local-import-2024"

# Arama Ayarları
LOCATION = "Miami, FL"
LISTING_TYPE = "for_sale"  # for_sale, for_rent, sold
LIMIT = 20  # Kaç ev çekilsin?
# ===========================================


def calculate_smart_yield(price):
    """
    Fiyata göre dinamik 'Rental Yield' hesaplar.
    Mantık: Pahalı evlerin yüzdesel getirisi genelde daha düşüktür (Safe Haven).
    Ucuz evlerin getirisi daha yüksektir (Risk Premium).
    Aralık: %5.00 - %9.99
    """
    # Fiyatı limitle (Hesaplama sapmasın diye: min 100k, max 2M baz alınır)
    clamped_price = max(100_000, min(price, 2_500_000))

    # Ters Orantı Faktörü (0.0 ile 1.0 arası)
    # Fiyat düşükse factor 0'a yakın, fiyat yüksekse 1'e yakın
    price_factor = (clamped_price - 100_000) / (2_500_000 - 100_000)

    # Baz Getiri Hesabı (Ters Orantı)
    # Min Yield (%5.0) + (Ters Factor * Fark)
    # Yani: Fiyat düşükse (factor ~0) -> %9.5 civarı
    #       Fiyat yüksekse (factor ~1) -> %5.5 civarı
    base_yield = 9.5 - (price_factor * 4.5)

    # Biraz rastgelelik ekle (+-%0.8 oynasın) ki hepsi aynı olmasın
    noise = random.uniform(-0.8, 0.8)
    final_yield = base_yield + noise

    # %5.0 ile %9.99 arasına sabitle
    final_yield = max(5.01, min(final_yield, 9.99))

    return f"{final_yield:.2f}%"


def main():
    print(f"🚀 Scraper Başlatılıyor (HomeHarvest)...")
    print(f"📍 Konum: {LOCATION} | Mod: {LISTING_TYPE}")

    try:
        print("⏳ Siteler taranıyor, lütfen bekle...")
        properties = scrape_property(
            location=LOCATION,
            listing_type=LISTING_TYPE,
            past_days=30,
        )

        if properties is None or properties.empty:
            print("❌ Hiç ev bulunamadı.")
            return

        print(f"✅ Toplam {len(properties)} ilan bulundu. İçe aktarılıyor...")

    except Exception as e:
        print(f"❌ Tarama Hatası: {e}")
        return

    success_count = 0

    for index, row in properties.iterrows():
        try:
            if success_count >= LIMIT:
                break

            # Fiyat yoksa atla
            price = row.get("list_price")
            if pd.isna(price) or price == 0:
                continue

            price = int(price)  # Integer'a çevir

            # Adres Oluştur
            street = row.get("street", "")
            city = row.get("city", "")
            state = row.get("state", "")
            zip_code = row.get("zip_code", "")

            full_address = f"{street}, {city}, {state} {zip_code}".strip()
            if full_address == ", ,":
                full_address = "Unknown Location"

            # Resimler
            images = []
            if pd.notna(row.get("primary_photo")):
                images.append(row.get("primary_photo"))
            if pd.notna(row.get("alt_photos")):
                alt = str(row.get("alt_photos"))
                if "http" in alt:
                    urls = [url.strip()
                            for url in alt.split(",") if "http" in url]
                    images.extend(urls[:4])

            # Açıklama Oluşturucu
            raw_desc = str(row.get("description", ""))
            is_too_short = len(raw_desc) < 200
            has_bad_keywords = "call agent" in raw_desc.lower(
            ) or "contact listing" in raw_desc.lower()

            if pd.isna(row.get("description")) or is_too_short or has_bad_keywords:
                d_beds = int(row.get("beds")) if pd.notna(
                    row.get("beds")) else 3
                d_baths = int(row.get("full_baths")) if pd.notna(
                    row.get("full_baths")) else 2
                d_sqft = int(row.get("sqft")) if pd.notna(
                    row.get("sqft")) else 1500
                d_year = int(row.get("year_built")) if pd.notna(
                    row.get("year_built")) else 2015
                d_type = row.get("style", "Single Family Residence")

                description = (
                    f"Discover an exceptional investment opportunity with this beautiful {d_type} located in {city}, {state}. "
                    f"Built in {d_year}, this property features {d_beds} spacious bedrooms and {d_baths} modern bathrooms, "
                    f"spanning approximately {d_sqft} square feet of living space. "
                    f"The home offers a perfect blend of comfort and style, situated in a high-demand neighborhood with excellent potential for capital appreciation and steady rental income. "
                    f"Recently evaluated for tokenization, this asset represents a prime entry point into the {city} real estate market."
                )
            else:
                description = raw_desc
                if len(description) > 800:
                    description = description[:797] + "..."

            # --- YENİ: DİNAMİK YIELD HESAPLAMA ---
            smart_rental_yield = calculate_smart_yield(price)

            # Payload
            payload = {
                "title": street if street else full_address,
                "description": description,
                "location": full_address,
                "price": price,
                "bed": int(row.get("beds")) if pd.notna(row.get("beds")) else 0,
                "bath": int(row.get("full_baths")) if pd.notna(row.get("full_baths")) else 0,
                "sqft": int(row.get("sqft")) if pd.notna(row.get("sqft")) else 0,
                "rental_yield": smart_rental_yield,  # <-- Hesaplanan Değer
                "images": images
            }

            # Gönder
            response = requests.post(
                WORKER_URL,
                json=payload,
                headers={"X-IMPORT-KEY": IMPORT_KEY,
                         "Content-Type": "application/json"}
            )

            if response.status_code == 200:
                try:
                    res_json = response.json()
                    if res_json.get("skipped") is True:
                        print(f"⏩ Pas geçildi (Mevcut): {payload['title']}")
                    else:
                        print(
                            f"✅ Yüklendi: {payload['title']} (${price}) -> Yield: {smart_rental_yield}")
                        success_count += 1
                except:
                    print(f"✅ Yüklendi: {payload['title']}")
                    success_count += 1
            else:
                print(f"⚠️ Yükleme Başarısız: {response.text}")

        except Exception as e:
            print(f"⚠️ Satır işleme hatası: {e}")

    print(f"🎉 İşlem Tamamlandı! {success_count} ev sisteme eklendi.")


if __name__ == "__main__":
    main()
