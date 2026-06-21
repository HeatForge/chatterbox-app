ALTER TABLE users
  ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE users
  ALTER COLUMN password_hash DROP DEFAULT;

CREATE TABLE email_whitelist (
  id         BIGSERIAL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_whitelist_email ON email_whitelist (email);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
