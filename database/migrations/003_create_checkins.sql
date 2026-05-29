-- File: 003_create_checkins.sql
-- Creates the checkins table for daily pet health observations (eating, litter, activity).
-- See TDD Section 1.4 for full schema specification and valid enum values.

-- TODO: Ensure 002_create_pets.sql has been applied before this migration (pets FK dependency).

CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Eating observation
  eating_level VARCHAR(30) CHECK (eating_level IN ('less_than_normal', 'normal', 'more_than_normal')),
  eating_notes TEXT,

  -- Litter observation
  litter_status VARCHAR(30) CHECK (litter_status IN ('normal', 'diarrhea', 'constipation', 'mixed', 'not_used', 'unknown')),
  litter_notes TEXT,

  -- Activity observation
  activity_level VARCHAR(30) CHECK (activity_level IN ('very_active', 'normal', 'calm', 'sleeping_most_of_day')),
  activity_notes TEXT,

  -- General owner notes
  owner_notes TEXT,

  -- Confidence score (1-5 scale; only captured on Day 1 and Month 4 per TDD Section 1.4)
  confidence_score INT CHECK (confidence_score IS NULL OR (confidence_score >= 1 AND confidence_score <= 5)),

  -- Audit timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- One check-in per pet per calendar day
  CONSTRAINT unique_checkin_per_day UNIQUE(pet_id, date),
  CONSTRAINT valid_notes CHECK (
    (eating_notes IS NULL OR length(trim(eating_notes)) > 0) AND
    (litter_notes IS NULL OR length(trim(litter_notes)) > 0) AND
    (activity_notes IS NULL OR length(trim(activity_notes)) > 0) AND
    (owner_notes IS NULL OR length(trim(owner_notes)) > 0)
  )
);

CREATE INDEX idx_checkins_pet_id ON checkins(pet_id);
CREATE INDEX idx_checkins_date ON checkins(date);
CREATE INDEX idx_checkins_pet_date ON checkins(pet_id, date);
CREATE INDEX idx_checkins_created_at ON checkins(created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON checkins TO lambda_user;
