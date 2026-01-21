-- Risk Skoru: 1 (Düşük Risk) - 5 (Yüksek Risk)
-- Doluluk Oranı: 0 - 100 (Yüzde)
-- Last Occupancy Update: Son güncelleme tarihi (Cron için)

ALTER TABLE properties ADD COLUMN risk_score INTEGER DEFAULT 1;
ALTER TABLE properties ADD COLUMN occupancy_rate INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN last_occupancy_update TEXT;