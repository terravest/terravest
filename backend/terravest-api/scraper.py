import os
import requests
import pandas as pd
import random
from homeharvest import scrape_property

# ================= SETTINGS =================
# Worker Endpoint (Production)
WORKER_URL = "https://api.terravest.homes/import/property"
IMPORT_KEY = "terravest-local-import-2024"

# Search Settings
LOCATION = "Miami, FL"
LISTING_TYPE = "for_sale"  # for_sale, for_rent, sold
LIMIT = 37  # Target number of properties to import
MIN_IMAGES = 12
MAX_IMAGES = 20
REQUEST_TIMEOUT = 15

# 🛑 PRICE FILTERS (New)
MIN_PRICE = 500_000   # 150k altını (hatalı/küçük) alma
MAX_PRICE = 4_000_000  # 5M üstünü (aşırı lüks/hatalı) alma
# ===========================================


def calculate_smart_yield(price):
    """
    Fiyata göre dinamik 'Rental Yield' hesaplar.
    """
    # Yield hesabı için fiyatı belirli aralıkta sıkıştırıyoruz
    clamped_price = max(100_000, min(price, 2_500_000))
    price_factor = (clamped_price - 100_000) / (2_500_000 - 100_000)

    # Fiyat arttıkça yield düşer mantığı (Base 9.5% -> 5.0%)
    base_yield = 9.5 - (price_factor * 4.5)

    # Biraz rastgelelik ekle
    noise = random.uniform(-0.8, 0.8)
    final_yield = base_yield + noise

    # 5.01% ile 9.99% arasında tut
    return f"{max(5.01, min(final_yield, 9.99)):.2f}%"


def main():
    print("🚀 Starting scraper (HomeHarvest)...")
    print(f"📍 Location: {LOCATION} | Mode: {LISTING_TYPE}")
    print(f"💰 Price Filter: ${MIN_PRICE:,.0f} - ${MAX_PRICE:,.0f}")
    print(f"📸 Image Filter: Min {MIN_IMAGES} photos")

    try:
        print("⏳ Scanning listings, please wait...")
        properties = scrape_property(
            location=LOCATION,
            listing_type=LISTING_TYPE,
            past_days=30,
        )

        if properties is None or properties.empty:
            print("❌ No properties found.")
            return

        print(
            f"✅ Found {len(properties)} listings. Filtering and importing...")

    except Exception as e:
        print(f"❌ Scrape error: {e}")
        return

    success_count = 0

    for index, row in properties.iterrows():
        try:
            if success_count >= LIMIT:
                print("🏁 Target limit reached.")
                break

            # --- PRICE VALIDATION ---
            price = row.get("list_price")

            # Fiyat yoksa atla
            if pd.isna(price) or price == 0:
                continue

            price = int(price)

            # 🚨 YENİ FİLTRE: Fiyat çok düşük veya çok yüksekse atla
            if price < MIN_PRICE:
                # print(f"📉 Skipped low price: ${price:,.0f}") # İstersen commenti aç
                continue

            if price > MAX_PRICE:
                # print(f"📈 Skipped high price: ${price:,.0f}")
                continue
            # ------------------------

            # Build address
            street = row.get("street", "")
            city = row.get("city", "")
            state = row.get("state", "")
            zip_code = row.get("zip_code", "")

            full_address = f"{street}, {city}, {state} {zip_code}".strip()
            if full_address == ", ,":
                full_address = "Unknown Location"

            # ============================================================
            # 📸 IMAGE FILTER
            # ============================================================
            images = []
            if pd.notna(row.get("primary_photo")):
                images.append(row.get("primary_photo"))

            if pd.notna(row.get("alt_photos")):
                alt = str(row.get("alt_photos"))
                if "http" in alt:
                    urls = [url.strip()
                            for url in alt.split(",") if "http" in url]
                    images.extend(urls)

            # Skip listings with too few images
            if len(images) < MIN_IMAGES:
                continue

            # Cap image count to avoid large payloads
            images = images[:MAX_IMAGES]

            # ============================================================

            # --- SMART DESCRIPTION BUILDER ---
            raw_desc = str(row.get("description", ""))
            is_too_short = len(raw_desc) < 200
            has_bad_keywords = "call agent" in raw_desc.lower(
            ) or "contact listing" in raw_desc.lower()

            # Verileri güvenli şekilde al (None kontrolü)
            d_beds = int(row.get("beds")) if pd.notna(row.get("beds")) else 3
            d_baths = int(row.get("full_baths")) if pd.notna(
                row.get("full_baths")) else 2
            d_sqft = int(row.get("sqft")) if pd.notna(
                row.get("sqft")) else 1500
            d_year = int(row.get("year_built")) if pd.notna(
                row.get("year_built")) else 2015
            d_type = row.get("style", "Single Family Residence")

            if pd.isna(row.get("description")) or is_too_short or has_bad_keywords:
                # Templates
                templates = [
                    (
                        f"Discover an exceptional investment opportunity with this beautiful {d_type} located in {city}, {state}. "
                        f"Built in {d_year}, this property features {d_beds} spacious bedrooms and {d_baths} modern bathrooms, spanning approximately {d_sqft} square feet of living space. "
                        f"The home offers a perfect blend of comfort and style, situated in a high-demand neighborhood with excellent potential for capital appreciation and steady rental income. "
                        f"Recently evaluated for tokenization, this asset represents a prime entry point into the {city} real estate market."
                    ),
                    (
                        f"Welcome to this charming {d_type} nestled in the heart of {city}, {state}. Offering a generous {d_sqft} sqft floor plan, "
                        f"this residence includes {d_beds} bedrooms and {d_baths} baths, perfectly designed for modern living. Originally constructed in {d_year}, "
                        f"the property combines classic architectural integrity with contemporary convenience. Its strategic location provides easy access to local amenities, schools, and parks, "
                        f"making it a highly desirable asset for both long-term tenants and investors seeking reliable returns."
                    ),
                    (
                        f"This substantial {d_type} property stands as a testament to quality construction in {city}, {state}. With a build year of {d_year}, "
                        f"it boasts {d_sqft} square feet of well-utilized interior space, comprising {d_beds} bedrooms and {d_baths} bathrooms. "
                        f"The layout flows seamlessly, offering bright and airy rooms that appeal to quality tenants. As part of our tokenized portfolio, "
                        f"this asset has been selected for its structural soundness and its strong position within the local property market cycle."
                    ),
                    (
                        f"We are pleased to present this premium real estate asset located in {city}, {state}. This {d_type}, built in {d_year}, "
                        f"features a robust configuration of {d_beds} beds and {d_baths} baths across {d_sqft} sqft. "
                        f"The property has been identified as a high-yield candidate, benefiting from the area's growing population and economic stability. "
                        f"Investors can expect a combination of immediate rental yield and long-term equity growth from this carefully vetted listing."
                    ),
                    (
                        f"Prime real estate in {city}, {state}! This {d_year}-built {d_type} offers {d_beds} bedrooms, {d_baths} bathrooms, and {d_sqft} sqft of living space. "
                        f"Located in a thriving community, it represents a secure and lucrative addition to any diversified portfolio. "
                        f"With strong fundamentals and a history of consistent occupancy, this property is perfectly suited for fractional ownership and passive income generation."
                    )
                ]
                description = random.choice(templates)
            else:
                description = raw_desc
                if len(description) > 800:
                    description = description[:797] + "..."

            # --- DYNAMIC YIELD CALCULATION ---
            smart_rental_yield = calculate_smart_yield(price)

            # Payload
            payload = {
                "title": street if street else full_address,
                "description": description,
                "location": full_address,
                "price": price,
                "bed": d_beds,
                "bath": d_baths,
                "sqft": d_sqft,
                "rental_yield": smart_rental_yield,
                "images": images
            }

            # Send to API
            try:
                response = requests.post(
                    WORKER_URL,
                    json=payload,
                    headers={"X-IMPORT-KEY": IMPORT_KEY,
                             "Content-Type": "application/json"},
                    timeout=REQUEST_TIMEOUT
                )
            except requests.RequestException as request_error:
                print(f"⚠️ Request failed: {request_error}")
                continue

            if response.status_code == 200:
                try:
                    res_json = response.json()
                    if res_json.get("skipped") is True:
                        print(
                            f"⏩ Skipped (already exists): {payload['title']}")
                    else:
                        print(
                            f"✅ Imported ({len(images)} images): {payload['title']} (${price:,}) -> Yield: {smart_rental_yield}")
                        success_count += 1
                except ValueError:
                    print(f"✅ Imported: {payload['title']}")
                    success_count += 1
            else:
                print(
                    f"⚠️ Import failed ({response.status_code}): {response.text}")

        except Exception as e:
            print(f"⚠️ Row processing error: {e}")

    print(f"🎉 Completed! {success_count} properties imported.")


if __name__ == "__main__":
    main()
