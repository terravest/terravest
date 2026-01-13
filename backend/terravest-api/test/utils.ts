import { D1Database } from '@cloudflare/workers-types';

export async function applySchema(db: D1Database) {
  // USERS
  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, username TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user', balance REAL DEFAULT 0, usd_balance REAL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // PROPERTIES
  await db.exec(`CREATE TABLE IF NOT EXISTS properties (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, location TEXT, price REAL, token_price REAL, total_tokens INTEGER, available_tokens INTEGER, rental_yield REAL, image_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // OWNERSHIPS
  await db.exec(`CREATE TABLE IF NOT EXISTS ownerships (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, property_id INTEGER, tokens_owned REAL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // INVESTMENTS
  await db.exec(`CREATE TABLE IF NOT EXISTS investments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, property_id INTEGER NOT NULL, token_amount INTEGER NOT NULL, purchase_price REAL NOT NULL, total_cost REAL NOT NULL, unclaimed_rewards REAL DEFAULT 0, last_rent_calc_date TEXT, total_invested REAL DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // DEPOSITS
  await db.exec(`CREATE TABLE IF NOT EXISTS deposits (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, amount_usd REAL, address TEXT, address_index INTEGER, status TEXT DEFAULT 'pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);`);

  // WITHDRAWALS
  await db.exec(`CREATE TABLE IF NOT EXISTS withdrawals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, amount REAL, address TEXT, status TEXT DEFAULT 'pending', tx_hash TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT);`);

  // TRANSACTIONS (Transaction history/ledger)
  await db.exec(`CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, amount REAL NOT NULL, description TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

  // ORDERS (Order history - optional, can be removed if not needed)
  await db.exec(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, property_id INTEGER, order_type TEXT, amount REAL, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);

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
}
