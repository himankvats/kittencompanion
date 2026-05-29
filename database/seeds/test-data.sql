-- File: test-data.sql
-- Inserts sample data for local development and integration testing.
-- Includes 1 user, 1 pet, 7 check-ins, and 1 acute event.
-- Run via: ./infrastructure/scripts/seed.sh dev

-- NOTE: Ensure all migrations (001–008) have been applied before seeding.
-- TODO: Add more varied seed fixtures as needed for testing edge cases.

-- ------------------------------------------------------------------
-- Sample User
-- ------------------------------------------------------------------
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  notification_preferences,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'testowner@example.com',
  'Jane',
  'Smith',
  '{"reminder_time": "19:00", "reminder_channel": "email", "reminder_frequency": "daily", "enabled": true}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------
-- Sample Pet
-- ------------------------------------------------------------------
INSERT INTO pets (
  id,
  user_id,
  name,
  age_months,
  gender,
  neutered_spayed,
  breed,
  adoption_date,
  source,
  sibling_bonded,
  medical_history,
  household_context,
  current_concerns,
  created_at,
  updated_at
) VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Scooter',
  2,
  'male',
  'unknown',
  'Domestic Shorthair',
  '2026-05-20',
  'shelter',
  'yes',
  '{"vaccines": [], "medications": [], "flea_tick_preventative": null, "known_health_issues": []}',
  '{"other_pets": false, "pet_types": [], "children_under_12": false}',
  'Adjusting to new home',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------
-- Sample Check-ins (7 consecutive days starting 2026-05-20)
-- ------------------------------------------------------------------
INSERT INTO checkins (id, pet_id, date, eating_level, litter_status, activity_level, owner_notes, confidence_score, created_at, updated_at) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '2026-05-20', 'less_than_normal', 'normal', 'calm',        'First day home, seems nervous.', 3, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '2026-05-21', 'normal',          'normal', 'calm',        'Started eating more.', NULL, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '2026-05-22', 'normal',          'normal', 'normal',      'Explored more rooms today.', NULL, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '2026-05-23', 'normal',          'normal', 'very_active', 'Playing with toys!', NULL, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '2026-05-24', 'normal',          'normal', 'normal',      'Happy and settled.', NULL, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '2026-05-25', 'less_than_normal','normal', 'calm',        'Ate less at breakfast but fine by evening.', NULL, NOW(), NOW()),
  ('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', '2026-05-26', 'normal',          'normal', 'normal',      'Back to normal eating.', NULL, NOW(), NOW())
ON CONFLICT (pet_id, date) DO NOTHING;

-- ------------------------------------------------------------------
-- Sample Acute Event
-- ------------------------------------------------------------------
INSERT INTO acute_events (
  id,
  pet_id,
  concern_type,
  followup_answers,
  template_selected,
  severity,
  response_text,
  followup_resolution,
  followup_resolved_at,
  created_at,
  updated_at
) VALUES (
  '990e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440001',
  'not_eating',
  '{
    "duration": "24h",
    "amount_eating": "less than usual",
    "other_symptoms": ["hiding"],
    "recent_change": "adoption 1 day ago",
    "has_siblings": true,
    "was_separated": true,
    "appetite_baseline_known": false,
    "food_changed_recently": false,
    "water_intake": "normal"
  }',
  'benign',
  'manage_at_home',
  'Scooter may be experiencing separation anxiety from their sibling — very common in newly adopted kittens. Offer small meals 2-3 times a day, keep the environment calm, and provide a warm hiding spot. Monitor for 24 hours.',
  'resolved',
  '2026-05-22T10:00:00Z',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
