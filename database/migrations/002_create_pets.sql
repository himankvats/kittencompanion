-- File: 002_create_pets.sql
-- Creates the pets table with medical history and household context JSONB columns.
-- See TDD Section 1.3 for full schema specification, field descriptions, and JSONB schemas.

-- TODO: Ensure 001_create_users.sql has been applied before this migration (users FK dependency).

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(100) NOT NULL,
  age_months INT NOT NULL CHECK (age_months >= 0 AND age_months <= 360),
  gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'unknown')),
  neutered_spayed VARCHAR(20) CHECK (neutered_spayed IN ('yes', 'no', 'unknown')),

  -- Breed and background
  breed VARCHAR(100),
  adoption_date DATE,
  source VARCHAR(50) CHECK (source IN ('shelter', 'breeder', 'friend_family', 'stray', 'other')),
  sibling_bonded VARCHAR(20) CHECK (sibling_bonded IN ('yes', 'no', 'unsure')),

  -- Medical history (structured JSONB); schema documented in TDD Section 1.3
  medical_history JSONB DEFAULT '{
    "vaccines": [],
    "medications": [],
    "flea_tick_preventative": null,
    "known_health_issues": []
  }',

  -- Household context (structured JSONB); schema documented in TDD Section 1.3
  household_context JSONB DEFAULT '{
    "other_pets": false,
    "pet_types": [],
    "children_under_12": false
  }',

  -- Owner concerns (free text, optional)
  current_concerns TEXT,

  -- Audit timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  CONSTRAINT valid_age CHECK (age_months >= 0),
  CONSTRAINT valid_name CHECK (length(trim(name)) > 0)
);

CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_created_at ON pets(created_at);
CREATE INDEX idx_pets_adoption_date ON pets(adoption_date);
CREATE INDEX idx_pets_active ON pets(deleted_at) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON pets TO lambda_user;
