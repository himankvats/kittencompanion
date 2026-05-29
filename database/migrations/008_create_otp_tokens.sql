-- File: 008_create_otp_tokens.sql
-- Creates the otp_tokens table for storing hashed one-time-passcode tokens during signup/login.
-- See TDD Section 1.9 for schema specification. Tokens expire after 24 hours.

-- IMPORTANT: Plaintext OTPs are NEVER stored. token_hash uses PBKDF2 (see TDD Section 3.1).
-- TODO: Set up a daily cleanup job to purge expired tokens (TDD Section 1.9).

CREATE TABLE otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,

  -- Hashed OTP (PBKDF2 — never store plaintext per TDD Section 1.9)
  token_hash VARCHAR(255) NOT NULL,
  -- Raw OTP code — redact in production logs
  otp_code VARCHAR(10) NOT NULL,

  -- Validity window
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,

  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_tokens_email ON otp_tokens(email);
CREATE INDEX idx_otp_tokens_expires_at ON otp_tokens(expires_at);

GRANT SELECT, INSERT, UPDATE ON otp_tokens TO lambda_user;

-- Auto-cleanup of expired tokens (run via cron or pg_cron extension)
-- TODO: Schedule daily: DELETE FROM otp_tokens WHERE expires_at < CURRENT_TIMESTAMP;
