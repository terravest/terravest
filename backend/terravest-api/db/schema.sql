-- ==========================================
-- Terravest API Database Schema (FINAL CONSOLIDATED)
-- Cloudflare D1 (SQLite) Compatible
-- Includes: Financial Integrity (Integers) + Safety Checks (No Negative Balance)
-- ==========================================

-- ==========================================
-- TABLES
-- ==========================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    balance INTEGER DEFAULT 0,      -- Stored in Satoshis (1 BTC = 100,000,000 Sats)
    usd_balance INTEGER NOT NULL DEFAULT 0 CHECK (usd_balance >= 0),
    email_verified INTEGER NOT NULL DEFAULT 0,
    email_verified_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- PROPERTIES
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    location TEXT,
    price_usd INTEGER,              -- Stored in Cents
    token_price INTEGER,            -- Stored in Cents
    total_tokens INTEGER,
    available_tokens INTEGER NOT NULL DEFAULT 0 CHECK (available_tokens >= 0),
    rental_yield TEXT,              -- "8.5%" (TEXT support from migration)
    image_url TEXT,
    monthly_yield INTEGER,          -- Stored in Cents
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- OWNERSHIPS
CREATE TABLE IF NOT EXISTS ownerships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    property_id INTEGER,
    tokens_owned INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- INVESTMENTS
CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    token_amount INTEGER NOT NULL,
    purchase_price INTEGER NOT NULL, -- Cents
    total_cost INTEGER NOT NULL,     -- Cents
    unclaimed_rewards INTEGER DEFAULT 0, -- Cents
    last_rent_calc_date TEXT,
    total_invested INTEGER DEFAULT 0, -- Cents
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)     -- Required for ON CONFLICT upserts
);

-- DEPOSITS
CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount_usd INTEGER,             -- Cents
    address TEXT,
    address_index INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- WITHDRAWALS
CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount INTEGER,                 -- Cents/Sats
    address TEXT,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,        -- Cents/Sats
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER,
    order_type TEXT,
    amount INTEGER,                 -- Cents
    status TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- PROPERTY_IMAGES (From Migration)
CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    is_main INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- PASSWORD_RESET_TOKENS (From Migration 0005 - RESTORED)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0, -- 0 = false, 1 = true
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EMAIL_VERIFICATION_TOKENS
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0, -- 0 = false, 1 = true
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- INDEXES
-- ==========================================

-- INVESTMENTS
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_property_id ON investments(property_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_property ON investments(user_id, property_id);

-- DEPOSITS
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_user_created ON deposits(user_id, created_at DESC);

-- WITHDRAWALS
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_created ON withdrawals(user_id, created_at DESC);

-- TRANSACTIONS
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- PROPERTIES
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- PROPERTY_IMAGES
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_property_order ON property_images(property_id, display_order ASC);

-- PASSWORD_RESET_TOKENS
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- EMAIL_VERIFICATION_TOKENS
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);