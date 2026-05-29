-- File: 007_create_audit_logs.sql
-- Creates the audit_logs table for recording security-relevant actions across all services.
-- See TDD Section 1.8 for schema specification and list of valid audit actions.

-- TODO: No FK on user_id intentionally — audit logs must survive user deletion (TDD Section 1.8).

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nullable: some events (failed login) may not have a resolved user
  user_id UUID,

  -- What happened; valid values listed in TDD Section 1.8
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,

  -- Additional context as arbitrary JSON
  details JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),

  -- Outcome
  status VARCHAR(50) CHECK (status IN ('success', 'failure', 'error')),
  error_message TEXT,

  -- Timestamp (no updated_at — audit rows are immutable)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Lambda user can insert but NOT update or delete audit records
GRANT SELECT, INSERT ON audit_logs TO lambda_user;
