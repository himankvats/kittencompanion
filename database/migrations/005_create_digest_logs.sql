-- File: 005_create_digest_logs.sql
-- Creates the digest_logs table for storing weekly behavioral pattern summaries per pet.
-- See TDD Section 1.6 for schema specification and the patterns JSONB schema.

-- TODO: Ensure 002_create_pets.sql has been applied before this migration (pets FK dependency).

CREATE TABLE digest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

  -- Generated digest text (for audit; not returned to client directly)
  digest_text TEXT NOT NULL,

  -- Captured pattern data at time of generation
  -- See TDD Section 1.6 for full patterns JSONB schema (eating, litter, activity, treats)
  patterns JSONB NOT NULL,

  -- Date range covered by this digest
  data_range_start DATE NOT NULL,
  data_range_end DATE NOT NULL,

  -- Audit
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_date_range CHECK (data_range_end >= data_range_start)
);

CREATE INDEX idx_digest_logs_pet_id ON digest_logs(pet_id);
CREATE INDEX idx_digest_logs_generated_at ON digest_logs(generated_at);

GRANT SELECT, INSERT ON digest_logs TO lambda_user;
