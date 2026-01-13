-- ==========================================
-- Migration: Add Property Images Table
-- ==========================================
-- Purpose: Support multiple images per property (gallery feature)
-- Date: 2025-01-XX
-- Execute with: wrangler d1 execute terravest-db --local --file=./db/migration_add_property_images.sql
-- ==========================================

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    is_main INTEGER DEFAULT 0, -- 0 = false, 1 = true (SQLite boolean)
    display_order INTEGER DEFAULT 0, -- Order for sorting (lower = first)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_property_order ON property_images(property_id, display_order ASC);

-- Migrate existing image_url data to property_images table
-- This preserves existing single images as main images
INSERT INTO property_images (property_id, url, is_main, display_order)
SELECT id, image_url, 1, 0
FROM properties
WHERE image_url IS NOT NULL AND image_url != '';

-- Note: After migration, you may want to keep or remove the image_url column from properties table
-- For backward compatibility, we'll keep it for now, but new code should use property_images table
