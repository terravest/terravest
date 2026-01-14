-- Migration: Add explicit UNIQUE indexes for username and email
-- This ensures race-condition safe uniqueness checks at the database level
-- Run with: wrangler d1 execute terravest-db --local --file=./db/migrations/0004_unique_indexes_username_email.sql
-- Or for production: wrangler d1 execute terravest-db --remote --file=./db/migrations/0004_unique_indexes_username_email.sql

-- Note: UNIQUE constraints already exist on the columns (which create indexes automatically in SQLite),
-- but explicit indexes are still recommended for clarity and race-condition safety.
-- Case-insensitive uniqueness is handled at the application level by storing lowercase values.

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
