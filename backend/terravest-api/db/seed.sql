-- ==========================================
-- Terravest API Seed Data
-- Cloudflare D1 (SQLite) Compatible
-- ==========================================
-- This seed file contains sample data for development and testing
-- Execute with: wrangler d1 execute terravest-db --local --file=./db/seed.sql
-- ==========================================
-- NOTE: Run DELETE FROM properties; first if you want to reset and reseed
-- ==========================================

-- ==========================================
-- SAMPLE PROPERTIES
-- ==========================================
-- Insert sample properties matching test schema (title, token_price, total_tokens, available_tokens)
-- These columns match what Buy endpoint expects and what tests use

-- Sample Property 1: Luxury Villa (ID will be 1 if table is empty, or next auto-increment value)
-- Price: $50 * 100 tokens = $5,000 total property value
-- Rental Yield: 5% annual
INSERT INTO properties (title, token_price, total_tokens, available_tokens, price, rental_yield)
VALUES ('Luxury Villa Miami', 50, 100, 100, 5000, 5.0);

-- Sample Property 2: Downtown Apartment
-- Price: $100 * 1000 tokens = $100,000 total property value
-- Rental Yield: 6% annual
INSERT INTO properties (title, token_price, total_tokens, available_tokens, price, rental_yield)
VALUES ('Downtown Apartment Complex', 100, 1000, 1000, 100000, 6.0);

-- Sample Property 3: Commercial Office
-- Price: $150 * 500 tokens = $75,000 total property value
-- Rental Yield: 7% annual
INSERT INTO properties (title, token_price, total_tokens, available_tokens, price, rental_yield)
VALUES ('Commercial Office Building', 150, 500, 500, 75000, 7.0);
