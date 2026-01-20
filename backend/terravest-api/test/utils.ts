import { D1Database } from '@cloudflare/workers-types';

export async function applySchema(db: D1Database) {
  // USERS
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user', balance INTEGER DEFAULT 0, usd_balance INTEGER NOT NULL DEFAULT 0 CHECK (usd_balance >= 0), email_verified INTEGER NOT NULL DEFAULT 0, email_verified_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // PROPERTIES
  await db.exec(`CREATE TABLE IF NOT EXISTS properties (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, location TEXT, price INTEGER, token_price INTEGER, total_tokens INTEGER, available_tokens INTEGER NOT NULL DEFAULT 0 CHECK (available_tokens >= 0), rental_yield TEXT, image_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // OWNERSHIPS
  await db.exec(`CREATE TABLE IF NOT EXISTS ownerships (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, property_id INTEGER, tokens_owned INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // INVESTMENTS
  await db.exec(`CREATE TABLE IF NOT EXISTS investments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, property_id INTEGER NOT NULL, token_amount INTEGER NOT NULL, purchase_price INTEGER NOT NULL, total_cost INTEGER NOT NULL, unclaimed_rewards INTEGER DEFAULT 0, last_rent_calc_date TEXT, total_invested INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, property_id));`);

  // DEPOSITS
  await db.exec(`CREATE TABLE IF NOT EXISTS deposits (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, amount_usd INTEGER, address TEXT, address_index INTEGER, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);`);

  // WITHDRAWALS
  await db.exec(`CREATE TABLE IF NOT EXISTS withdrawals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, amount INTEGER, address TEXT, status TEXT DEFAULT 'pending', tx_hash TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);`);

  // TRANSACTIONS (Transaction history/ledger)
  await db.exec(`CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, amount INTEGER NOT NULL, description TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // ORDERS (Order history - optional, can be removed if not needed)
  await db.exec(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, property_id INTEGER, order_type TEXT, amount INTEGER, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // EMAIL VERIFICATION TOKENS
  await db.exec(`CREATE TABLE IF NOT EXISTS email_verification_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);`);

  // PASSWORD RESET TOKENS
  await db.exec(`CREATE TABLE IF NOT EXISTS password_reset_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);`);

  // ==========================================
  // PERFORMANCE INDEXES
  // ==========================================
  // Note: UNIQUE constraints automatically create indexes in SQLite, so email and username already have indexes

  // INVESTMENTS: Most frequently queried table
  // user_id: Used in portfolio, claim, sell queries
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);`);
  
  // property_id: Used in JOIN queries and sell operations
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_investments_property_id ON investments(property_id);`);
  
  // Composite index for user_id + property_id (used in sell.ts)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_investments_user_property ON investments(user_id, property_id);`);

  // DEPOSITS: Frequently queried for user deposits and cron jobs
  // user_id: Used in user deposit history queries
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);`);
  
  // status: Used in cron job to find pending deposits
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);`);
  
  // created_at: Used in ORDER BY queries
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC);`);
  
  // Composite index for user_id + created_at (common query pattern)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_deposits_user_created ON deposits(user_id, created_at DESC);`);

  // WITHDRAWALS: User withdrawal history queries
  // user_id: Used in transaction history queries
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);`);
  
  // created_at: Used in ORDER BY queries
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);`);
  
  // Composite index for user_id + created_at (common query pattern)
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_withdrawals_user_created ON withdrawals(user_id, created_at DESC);`);

  // TRANSACTIONS: User transaction history
  // user_id: Used in transaction history queries
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);`);

  // PROPERTIES: Status filtering and ordering
  // created_at: Used in ORDER BY queries
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);`);
  // Note: properties.status index might not be needed as the query uses IS NOT 'deleted' which is less selective

  // EMAIL VERIFICATION TOKENS
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);`);

  // PASSWORD RESET TOKENS
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);`);
}
