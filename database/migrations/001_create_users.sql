-- File: 001_create_users.sql
-- Creates the users table with notification preferences, soft-delete support, and required indexes.
-- See TDD Section 1.2 for full schema specification and field descriptions.

-- TODO: Ensure the lambda_user role exists before running GRANT (TDD Section 1.2)

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,

  -- Notification preferences (JSONB); schema documented in TDD Section 1.2
  notification_preferences JSONB DEFAULT '{
    "reminder_time": "19:00",
    "reminder_channel": "email",
    "reminder_frequency": "daily",
    "enabled": true
  }',

  -- Audit timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(deleted_at) WHERE deleted_at IS NULL;

-- Grant permissions to the application role
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO lambda_user;
