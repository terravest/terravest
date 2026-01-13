-- ==========================================
-- Terravest API Database Schema
-- Cloudflare D1 (SQLite) Compatible
-- ==========================================
-- This schema is production-ready and matches the test schema in test/utils.ts
-- Execute with: wrangler d1 execute terravest-db --local --file=./db/schema.sql
-- ==========================================

-- ==========================================
-- TABLES
-- ==========================================

-- USERS: User accounts and authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    balance REAL DEFAULT 0,
    usd_balance REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- PROPERTIES: Real estate properties available for tokenization
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    location TEXT,
    price REAL,
    token_price REAL,
    total_tokens INTEGER,
    available_tokens INTEGER,
    rental_yield TEXT,  -- Changed from REAL to TEXT to support string values like "6-20%", "~12%"
    image_url TEXT,
    monthly_yield REAL,  -- Kept for backward compatibility (can be removed in future)
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- OWNERSHIPS: Legacy ownership tracking (may be deprecated)
CREATE TABLE IF NOT EXISTS ownerships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    property_id INTEGER,
    tokens_owned REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- INVESTMENTS: User investments in properties
CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    token_amount INTEGER NOT NULL,
    purchase_price REAL NOT NULL,
    total_cost REAL NOT NULL,
    unclaimed_rewards REAL DEFAULT 0,
    last_rent_calc_date TEXT,
    total_invested REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- DEPOSITS: Bitcoin deposit requests and tracking
CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount_usd REAL,
    address TEXT,
    address_index INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- WITHDRAWALS: Bitcoin withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    address TEXT,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- TRANSACTIONS: Transaction history/ledger
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS: Order history (optional, for future use)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER,
    order_type TEXT,
    amount REAL,
    status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- PROPERTY_IMAGES: Multiple images per property (gallery support)
CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    is_main INTEGER DEFAULT 0, -- 0 = false, 1 = true (SQLite boolean)
    display_order INTEGER DEFAULT 0, -- Order for sorting (lower = first)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);


-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================
-- Note: UNIQUE constraints automatically create indexes in SQLite
-- So users.email and users.username already have indexes

-- INVESTMENTS: Most frequently queried table
-- user_id: Used in portfolio, claim, sell queries
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);

-- property_id: Used in JOIN queries and sell operations
CREATE INDEX IF NOT EXISTS idx_investments_property_id ON investments(property_id);

-- Composite index for user_id + property_id (used in sell.ts)
CREATE INDEX IF NOT EXISTS idx_investments_user_property ON investments(user_id, property_id);

-- DEPOSITS: Frequently queried for user deposits and cron jobs
-- user_id: Used in user deposit history queries
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);

-- status: Used in cron job to find pending deposits
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);

-- created_at: Used in ORDER BY queries
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC);

-- Composite index for user_id + created_at (common query pattern)
CREATE INDEX IF NOT EXISTS idx_deposits_user_created ON deposits(user_id, created_at DESC);

-- WITHDRAWALS: User withdrawal history queries
-- user_id: Used in transaction history queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);

-- created_at: Used in ORDER BY queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- Composite index for user_id + created_at (common query pattern)
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_created ON withdrawals(user_id, created_at DESC);

-- TRANSACTIONS: User transaction history
-- user_id: Used in transaction history queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- PROPERTIES: Status filtering and ordering
-- created_at: Used in ORDER BY queries
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- PROPERTY_IMAGES: Frequently queried for property galleries
-- property_id: Used in JOIN queries to fetch all images for a property
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
-- Composite index for property_id + display_order (common query pattern)
CREATE INDEX IF NOT EXISTS idx_property_images_property_order ON property_images(property_id, display_order ASC);
