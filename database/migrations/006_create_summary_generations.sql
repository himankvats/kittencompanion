-- File: 006_create_summary_generations.sql
-- Creates the summary_generations table to audit vet summary generation requests (no content stored).
-- See TDD Section 1.7 for schema specification.

-- TODO: Ensure 001_create_users.sql and 002_create_pets.sql have been applied (FK dependencies).

CREATE TABLE summary_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Audit and analytics — the actual generated HTML/text is not persisted
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_range_start DATE NOT NULL,
  data_range_end DATE NOT NULL,

  -- Counts for debugging and analytics
  checkins_included INT,
  acute_events_included INT
);

CREATE INDEX idx_summary_generations_pet_id ON summary_generations(pet_id);
CREATE INDEX idx_summary_generations_user_id ON summary_generations(user_id);
CREATE INDEX idx_summary_generations_generated_at ON summary_generations(generated_at);

GRANT SELECT, INSERT ON summary_generations TO lambda_user;
