-- File: 009_add_names_to_otp_tokens.sql
-- Adds first_name and last_name to otp_tokens so the verify handler can create
-- the user row with correct names (TDD Section 2.1.2 — user created at verify time).

ALTER TABLE otp_tokens
  ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN last_name  VARCHAR(100) NOT NULL DEFAULT '';
