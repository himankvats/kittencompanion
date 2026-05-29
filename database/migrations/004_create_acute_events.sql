-- File: 004_create_acute_events.sql
-- Creates the acute_events table to record owner-reported concerns and triage decisions.
-- See TDD Section 1.5 for schema, followup_answers JSONB schemas per concern type, and severity levels.

-- TODO: Ensure 002_create_pets.sql has been applied before this migration (pets FK dependency).

CREATE TABLE acute_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,

  -- Concern classification; 9 valid types per TDD Section 1.5
  concern_type VARCHAR(50) NOT NULL CHECK (concern_type IN (
    'not_eating', 'vomiting', 'litter_problems', 'respiratory',
    'limping', 'hiding', 'eye_ear', 'skin', 'other'
  )),

  -- Owner's answers to structured follow-up questions (varies by concern_type)
  -- See TDD Section 1.5 for per-concern-type JSONB schemas
  followup_answers JSONB NOT NULL,

  -- Triage decision
  template_selected VARCHAR(50) CHECK (template_selected IN ('benign', 'concerning', 'urgent', 'conservative_default')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('manage_at_home', 'watch', 'call_vet_now')),

  -- Claude-generated response text shown to owner
  response_text TEXT NOT NULL,

  -- 24-hour follow-up tracking
  followup_resolution VARCHAR(50) CHECK (followup_resolution IN ('resolved', 'better', 'worse', 'vet_visit', 'unknown')),
  followup_resolved_at TIMESTAMP NULL,
  followup_prompt_sent_at TIMESTAMP NULL,

  -- Audit timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_response CHECK (length(trim(response_text)) > 0)
);

CREATE INDEX idx_acute_events_pet_id ON acute_events(pet_id);
CREATE INDEX idx_acute_events_created_at ON acute_events(created_at);
CREATE INDEX idx_acute_events_concern_type ON acute_events(concern_type);
CREATE INDEX idx_acute_events_severity ON acute_events(severity);
-- Partial index for fast lookup of unresolved concerns (TDD Section 1.5)
CREATE INDEX idx_acute_events_unresolved ON acute_events(pet_id, followup_resolution)
  WHERE followup_resolution IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON acute_events TO lambda_user;
