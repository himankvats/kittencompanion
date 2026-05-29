/**
 * Shared TypeScript interfaces for the Kitten Companion frontend.
 * Mirrors the database schema (TDD Section 1) and API response shapes (TDD Section 2).
 */

// ------------------------------------------------------------------
// User — TDD Section 1.2
// ------------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  reminder_time: string;            // HH:MM
  reminder_channel: 'email';
  reminder_frequency: 'daily' | 'every_other_day' | 'weekly';
  enabled: boolean;
}

// ------------------------------------------------------------------
// Pet — TDD Section 1.3
// ------------------------------------------------------------------
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  age_months: number;
  gender: 'male' | 'female' | 'unknown';
  neutered_spayed: 'yes' | 'no' | 'unknown';
  breed?: string;
  adoption_date?: string;           // ISO date
  source?: 'shelter' | 'breeder' | 'friend_family' | 'stray' | 'other';
  sibling_bonded?: 'yes' | 'no' | 'unsure';
  medical_history?: MedicalHistory;
  household_context?: HouseholdContext;
  current_concerns?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistory {
  vaccines: Array<{ name: string; date: string; next_due?: string; vet_clinic?: string }>;
  medications: Array<{ name: string; dosage: string; frequency: string; start_date: string; end_date?: string }>;
  flea_tick_preventative: { product: string; frequency: string; last_applied: string } | null;
  known_health_issues: string[];
}

export interface HouseholdContext {
  other_pets: boolean;
  pet_types: string[];
  children_under_12: boolean;
}

// ------------------------------------------------------------------
// CheckIn — TDD Section 1.4
// ------------------------------------------------------------------
export interface CheckIn {
  id: string;
  pet_id: string;
  date: string;                     // ISO date
  eating_level?: 'less_than_normal' | 'normal' | 'more_than_normal';
  eating_notes?: string;
  litter_status?: 'normal' | 'diarrhea' | 'constipation' | 'mixed' | 'not_used' | 'unknown';
  litter_notes?: string;
  activity_level?: 'very_active' | 'normal' | 'calm' | 'sleeping_most_of_day';
  activity_notes?: string;
  owner_notes?: string;
  confidence_score?: number | null;
  created_at: string;
}

// ------------------------------------------------------------------
// AcuteEvent — TDD Section 1.5
// ------------------------------------------------------------------
export interface AcuteEvent {
  id: string;
  pet_id: string;
  concern_type: 'not_eating' | 'vomiting' | 'litter_problems' | 'respiratory' | 'limping' | 'hiding' | 'eye_ear' | 'skin' | 'other';
  followup_answers: Record<string, unknown>;
  template_selected?: string;
  severity: 'manage_at_home' | 'watch' | 'call_vet_now';
  response_text: string;
  followup_resolution?: 'resolved' | 'better' | 'worse' | 'vet_visit' | 'unknown';
  followup_resolved_at?: string;
  created_at: string;
}

// ------------------------------------------------------------------
// DigestLog — TDD Section 1.6
// ------------------------------------------------------------------
export interface DigestLog {
  id: string;
  pet_id: string;
  digest_text: string;
  patterns: Record<string, unknown>;
  data_range_start: string;
  data_range_end: string;
  generated_at: string;
}

// ------------------------------------------------------------------
// SummaryGeneration — TDD Section 1.7
// ------------------------------------------------------------------
export interface SummaryGeneration {
  id: string;
  pet_id: string;
  user_id: string;
  generated_at: string;
  data_range_start: string;
  data_range_end: string;
  checkins_included?: number;
  acute_events_included?: number;
}

// ------------------------------------------------------------------
// Generic API response wrapper — TDD Section 2.7
// ------------------------------------------------------------------
export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string>;
  request_id?: string;
  timestamp?: string;
}
