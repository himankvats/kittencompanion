# Technical Design Document (TDD)

**Project:** Kitten Companion  
**Phase:** 2 — Planning & Design  
**Status:** FINAL  
**Version:** 1.0  
**Date:** May 26, 2026

---

## What This Document Is

The Technical Design Document (TDD) is the **source of truth for Phase 3 implementation**. It specifies:
- Data models (PostgreSQL schema, all tables, relationships)
- API contracts (request/response formats, HTTP status codes)
- Service implementations (what each Lambda does, inputs/outputs)
- LLM prompt design and testing strategy
- Error handling and retry logic
- Testing strategy (unit, integration, end-to-end)
- Deployment and local development setup
- Configuration and environment variables

**This document is the blueprint.** Every engineer should be able to read a section and implement it without ambiguity.

---

## Table of Contents

1. [Data Models (PostgreSQL Schema)](#1-data-models-postgresql-schema)
2. [API Contracts](#2-api-contracts)
3. [Service Implementations](#3-service-implementations)
4. [LLM Integration & Prompts](#4-llm-integration--prompts)
5. [Database Connection Pooling](#5-database-connection-pooling)
6. [Error Handling & Retry Logic](#6-error-handling--retry-logic)
7. [Testing Strategy](#7-testing-strategy)
8. [Local Development Setup](#8-local-development-setup)
9. [Deployment & Configuration](#9-deployment--configuration)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Security Implementation](#11-security-implementation)
12. [Code Organization & Structure](#12-code-organization--structure)

---

# 1. Data Models (PostgreSQL Schema)

## 1.1 Database Connection

**Connection Details:**
```yaml
Engine: PostgreSQL 15+
Driver: 
  - Java: JDBC with HikariCP connection pooling
  - Node.js: node-postgres (pg library)
Connection Pool:
  - Max connections: 20 (per Lambda instance)
  - Min connections: 2
  - Connection timeout: 30s
  - Idle timeout: 5 minutes
SSL: Required (sslmode=require)
```

## 1.2 Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  
  -- Notification preferences
  notification_preferences JSONB DEFAULT '{
    "reminder_time": "19:00",
    "reminder_channel": "email",
    "reminder_frequency": "daily",
    "enabled": true
  }',
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(deleted_at) WHERE deleted_at IS NULL;
```

**Field Descriptions:**

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| `id` | UUID | PK | System-generated, immutable |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Unique per system, validates regex |
| `first_name` | VARCHAR(100) | NOT NULL | User's first name |
| `last_name` | VARCHAR(100) | NOT NULL | User's last name |
| `notification_preferences` | JSONB | DEFAULT | See schema below |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When user created |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | When last updated |
| `deleted_at` | TIMESTAMP | NULL | Soft delete marker |

**Notification Preferences Schema:**
```json
{
  "reminder_time": "19:00",          // 24h format (00:00 to 23:59)
  "reminder_channel": "email",        // "email" only (MVP)
  "reminder_frequency": "daily",      // "daily", "every_other_day", "weekly"
  "enabled": true                     // Boolean: reminders on/off
}
```

**Migration SQL:**
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  notification_preferences JSONB DEFAULT '{
    "reminder_time": "19:00",
    "reminder_channel": "email",
    "reminder_frequency": "daily",
    "enabled": true
  }',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(deleted_at) WHERE deleted_at IS NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO lambda_user;
```

---

## 1.3 Pets Table

```sql
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
  
  -- Medical history (structured)
  medical_history JSONB DEFAULT '{
    "vaccines": [],
    "medications": [],
    "flea_tick_preventative": null,
    "known_health_issues": []
  }',
  
  -- Household context
  household_context JSONB DEFAULT '{
    "other_pets": false,
    "pet_types": [],
    "children_under_12": false
  }',
  
  -- Owner concerns (free text, optional)
  current_concerns TEXT,
  
  -- Audit
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
```

**Medical History Schema:**
```json
{
  "vaccines": [
    {
      "name": "FVRCP",
      "date": "2026-05-15",
      "next_due": "2027-05-15",
      "vet_clinic": "Main Street Vet"
    }
  ],
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "250mg",
      "frequency": "twice daily",
      "start_date": "2026-05-10",
      "end_date": "2026-05-20"
    }
  ],
  "flea_tick_preventative": {
    "product": "Revolution Plus",
    "frequency": "monthly",
    "last_applied": "2026-05-20"
  },
  "known_health_issues": [
    "Lactose intolerance"
  ]
}
```

**Household Context Schema:**
```json
{
  "other_pets": true,
  "pet_types": ["dog"],
  "children_under_12": false
}
```

---

## 1.4 CheckIns Table

```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Eating
  eating_level VARCHAR(30) CHECK (eating_level IN ('less_than_normal', 'normal', 'more_than_normal')),
  eating_notes TEXT,
  
  -- Litter
  litter_status VARCHAR(30) CHECK (litter_status IN ('normal', 'diarrhea', 'constipation', 'mixed', 'not_used', 'unknown')),
  litter_notes TEXT,
  
  -- Activity
  activity_level VARCHAR(30) CHECK (activity_level IN ('very_active', 'normal', 'calm', 'sleeping_most_of_day')),
  activity_notes TEXT,
  
  -- General observations
  owner_notes TEXT,
  
  -- Owner confidence (1-5 scale, only day 1 and month 4)
  confidence_score INT CHECK (confidence_score IS NULL OR (confidence_score >= 1 AND confidence_score <= 5)),
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
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
```

**Field Descriptions:**

| Field | Type | Valid Values | Notes |
|-------|------|--------------|-------|
| `eating_level` | VARCHAR(30) | less_than_normal, normal, more_than_normal | Relative to pet's baseline |
| `litter_status` | VARCHAR(30) | normal, diarrhea, constipation, mixed, not_used, unknown | Feces consistency + frequency |
| `activity_level` | VARCHAR(30) | very_active, normal, calm, sleeping_most_of_day | Energy observation |
| `confidence_score` | INT | 1-5 or NULL | Day 1 and month 4 only; NULL on other days |

---

## 1.5 AcuteEvents Table

```sql
CREATE TABLE acute_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Event classification
  concern_type VARCHAR(50) NOT NULL CHECK (concern_type IN (
    'not_eating', 'vomiting', 'litter_problems', 'respiratory', 
    'limping', 'hiding', 'eye_ear', 'skin', 'other'
  )),
  
  -- Owner's follow-up answers to structured questions
  followup_answers JSONB NOT NULL,
  
  -- Triage decision
  template_selected VARCHAR(50) CHECK (template_selected IN ('benign', 'concerning', 'urgent', 'conservative_default')),
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('manage_at_home', 'watch', 'call_vet_now')),
  
  -- Response provided to owner (generated by Claude)
  response_text TEXT NOT NULL,
  
  -- 24-hour follow-up tracking
  followup_resolution VARCHAR(50) CHECK (followup_resolution IN ('resolved', 'better', 'worse', 'vet_visit', 'unknown')),
  followup_resolved_at TIMESTAMP NULL,
  followup_prompt_sent_at TIMESTAMP NULL,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_response CHECK (length(trim(response_text)) > 0)
);

CREATE INDEX idx_acute_events_pet_id ON acute_events(pet_id);
CREATE INDEX idx_acute_events_created_at ON acute_events(created_at);
CREATE INDEX idx_acute_events_concern_type ON acute_events(concern_type);
CREATE INDEX idx_acute_events_severity ON acute_events(severity);
CREATE INDEX idx_acute_events_unresolved ON acute_events(pet_id, followup_resolution) 
  WHERE followup_resolution IS NULL;
```

**Followup Answers Schema (varies by concern type):**

```json
// Example: "not_eating" concern
{
  "duration": "24h",
  "amount_eating": "less than usual",
  "other_symptoms": ["hiding", "lethargic"],
  "recent_change": "adoption 2 days ago",
  "has_siblings": true,
  "was_separated": true,
  "appetite_baseline_known": true,
  "food_changed_recently": false,
  "water_intake": "normal"
}

// Example: "vomiting" concern
{
  "frequency": "once",
  "last_occurrence": "30 minutes ago",
  "blood_present": false,
  "content": "food",
  "behavior_otherwise": "normal",
  "eating_after": true,
  "recent_diet_change": false,
  "other_symptoms": []
}

// Example: "litter_problems" concern
{
  "type": "diarrhea",
  "frequency": "4+ times per day",
  "consistency": "loose",
  "blood_present": false,
  "duration": "2 days",
  "litter_box_access": "adequate",
  "recent_food_change": true,
  "stress_level_baseline": "low"
}
```

---

## 1.6 DigestLogs Table

```sql
CREATE TABLE digest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- Digest content (not returned to client, for audit only)
  digest_text TEXT NOT NULL,
  
  -- Pattern data captured at generation time
  patterns JSONB NOT NULL,
  
  -- Date range covered by digest
  data_range_start DATE NOT NULL,
  data_range_end DATE NOT NULL,
  
  -- Audit
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_date_range CHECK (data_range_end >= data_range_start)
);

CREATE INDEX idx_digest_logs_pet_id ON digest_logs(pet_id);
CREATE INDEX idx_digest_logs_generated_at ON digest_logs(generated_at);
```

**Patterns Schema:**
```json
{
  "eating": {
    "total_observations": 7,
    "normal_days": 6,
    "consistency_percentage": 85,
    "deviations": [
      {
        "date": "2026-05-20",
        "level": "less_than_normal",
        "context": "hiding behavior also noted"
      }
    ]
  },
  "litter": {
    "total_observations": 7,
    "normal_days": 7,
    "any_flags": false,
    "deviations": []
  },
  "activity": {
    "trend": "stable",
    "avg_level": "normal",
    "observations": ["very_active", "normal", "normal", "calm", "normal", "normal", "normal"],
    "trend_direction": "neutral"
  },
  "treats": {
    "mentions_count": 2,
    "dates": ["2026-05-18", "2026-05-19"],
    "alert_triggered": false
  }
}
```

---

## 1.7 SummaryGenerations Table

```sql
CREATE TABLE summary_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Not stored, just logged for audit/analytics
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_range_start DATE NOT NULL,
  data_range_end DATE NOT NULL,
  
  -- For debugging
  checkins_included INT,
  acute_events_included INT
);

CREATE INDEX idx_summary_generations_pet_id ON summary_generations(pet_id);
CREATE INDEX idx_summary_generations_user_id ON summary_generations(user_id);
CREATE INDEX idx_summary_generations_generated_at ON summary_generations(generated_at);
```

---

## 1.8 AuditLogs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  
  -- What happened
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  
  -- Context
  details JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  
  -- Outcome
  status VARCHAR(50) CHECK (status IN ('success', 'failure', 'error')),
  error_message TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

**Audit Log Actions:**
```
login_attempt
signup
email_verification
pet_created
pet_updated
checkin_submitted
concern_flagged
concern_resolved
summary_generated
triage_processed
deletion_requested
deletion_confirmed
```

---

## 1.9 OTP Tokens Table (Temporary)

```sql
CREATE TABLE otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  
  -- OTP data
  token_hash VARCHAR(255) NOT NULL,  -- Never store plaintext
  otp_code VARCHAR(10) NOT NULL,      -- For debugging in logs (redacted in prod)
  
  -- Validity
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_tokens_email ON otp_tokens(email);
CREATE INDEX idx_otp_tokens_expires_at ON otp_tokens(expires_at);
```

**Important:** Tokens expire after 24 hours. Auto-cleanup:
```sql
-- Run daily
DELETE FROM otp_tokens WHERE expires_at < CURRENT_TIMESTAMP;
```

---

## 1.10 Database Views (Optional, for Analytics)

```sql
-- Pets adopted in past 30 days
CREATE VIEW recent_adoptions AS
SELECT 
  p.id, p.user_id, p.name, p.adoption_date,
  CURRENT_DATE - p.adoption_date as days_since_adoption
FROM pets p
WHERE p.adoption_date > CURRENT_DATE - INTERVAL '30 days'
  AND p.deleted_at IS NULL;

-- Active users (logged in past 7 days)
CREATE VIEW active_users AS
SELECT 
  u.id, u.email, MAX(c.created_at) as last_checkin
FROM users u
LEFT JOIN checkins c ON u.id = (SELECT user_id FROM pets WHERE id = c.pet_id)
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email
HAVING MAX(c.created_at) > CURRENT_TIMESTAMP - INTERVAL '7 days';

-- Pets with unresolved concerns
CREATE VIEW unresolved_concerns AS
SELECT 
  ae.id, ae.pet_id, ae.concern_type, ae.severity,
  ae.created_at, (CURRENT_TIMESTAMP - ae.created_at) as hours_unresolved
FROM acute_events ae
WHERE ae.followup_resolution IS NULL
  AND ae.created_at > CURRENT_TIMESTAMP - INTERVAL '72 hours';
```

---

# 2. API Contracts

## 2.1 Authentication APIs (Auth Lambda)

### 2.1.1 POST /auth/signup

**Purpose:** Initiate sign-up with email

**Request:**
```json
{
  "email": "owner@example.com",
  "first_name": "John",
  "last_name": "Smith"
}
```

**Validation:**
- Email format: RFC 5322 compliant
- Email not already registered (active user)
- Names: non-empty, max 100 chars
- No special characters in names except hyphens/apostrophes

**Response (200 OK):**
```json
{
  "message": "OTP sent to email. Valid for 24 hours.",
  "email": "owner@example.com",
  "expires_in_seconds": 86400
}
```

**Response (409 Conflict):**
```json
{
  "error": "EMAIL_ALREADY_REGISTERED",
  "message": "This email is already registered. Try logging in."
}
```

**Response (400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "first_name": "Required field"
  }
}
```

**Side Effects:**
- Generate 6-digit OTP code
- Hash OTP (never store plaintext)
- Insert into `otp_tokens` with 24h expiry
- Send email via SendGrid/SES with OTP link

**Email Template:**
```
Subject: Your One-Time Code for New Cat Companion

Hi {first_name},

Welcome! Here's your one-time code to sign up:

CODE: 123456

Or click this link:
https://newcatcompanion.app/auth/verify?token=<otp_token_hash>

This code expires in 24 hours.

Questions? Reply to this email.
```

---

### 2.1.2 POST /auth/verify

**Purpose:** Verify OTP and issue JWT token

**Request:**
```json
{
  "otp_token": "otp_123456abcdef..."
}
```

OR (if user clicked email link):
```
GET /auth/verify?token=otp_123456abcdef...
```

**Validation:**
- Token exists and not expired
- Token not already used
- Token hash matches stored hash

**Response (200 OK):**
```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "owner@example.com",
    "first_name": "John",
    "last_name": "Smith"
  },
  "expires_in": 604800
}
```

**JWT Payload:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "owner@example.com",
  "iat": 1622548800,
  "exp": 1623153600,
  "type": "user"
}
```

**JWT Details:**
- Algorithm: HS256 (HMAC SHA-256)
- Secret: AWS Secrets Manager (rotated every 90 days)
- Expiry: 7 days (604800 seconds)
- Stored in: httpOnly cookie (frontend sets Secure + SameSite=Strict)

**Response (401 Unauthorized):**
```json
{
  "error": "INVALID_OTP",
  "message": "OTP is invalid or expired. Request a new code."
}
```

**Response (400 Bad Request):**
```json
{
  "error": "MISSING_TOKEN",
  "message": "otp_token is required"
}
```

**Side Effects:**
- Mark OTP token as used (`used_at = NOW()`)
- Create user if first signup (insert into `users` table)
- Generate JWT token
- Store token in Redis (for validation on future requests)
- Log audit entry: "signup" or "login_attempt"

---

### 2.1.3 POST /auth/refresh

**Purpose:** Refresh JWT token (extend expiry)

**Request:**
```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 604800
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "INVALID_TOKEN",
  "message": "Token is invalid or expired"
}
```

---

### 2.1.4 POST /auth/logout

**Purpose:** Invalidate JWT token

**Request:**
```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Side Effects:**
- Remove token from Redis
- Log audit entry: "logout"

---

## 2.2 User APIs (User Lambda)

### 2.2.1 GET /users/{user_id}

**Purpose:** Get user profile

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "owner@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "notification_preferences": {
    "reminder_time": "19:00",
    "reminder_channel": "email",
    "reminder_frequency": "daily",
    "enabled": true
  },
  "created_at": "2026-05-18T10:30:00Z",
  "updated_at": "2026-05-18T10:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "USER_NOT_FOUND",
  "message": "User does not exist"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing JWT token"
}
```

---

### 2.2.2 PUT /users/{user_id}

**Purpose:** Update user profile

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "notification_preferences": {
    "reminder_time": "20:00",
    "reminder_channel": "email",
    "reminder_frequency": "daily",
    "enabled": true
  }
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "owner@example.com",
  "first_name": "John",
  "last_name": "Smith",
  "notification_preferences": {
    "reminder_time": "20:00",
    "reminder_channel": "email",
    "reminder_frequency": "daily",
    "enabled": true
  },
  "updated_at": "2026-05-18T14:20:00Z"
}
```

**Validation:**
- Reminder time: HH:MM format, 00:00-23:59
- Names: max 100 chars, non-empty
- Only user can update their own profile

**Side Effects:**
- Update `users` table
- Clear Redis cache for this user
- Log audit entry: "user_updated"

---

### 2.2.3 DELETE /users/{user_id}

**Purpose:** Request account deletion (two-step confirmation)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "message": "Deletion confirmation sent to email. Check your inbox.",
  "email": "owner@example.com"
}
```

**Side Effects:**
- Generate deletion confirmation token (24h expiry)
- Send confirmation email with link
- Log audit entry: "deletion_requested"

---

### 2.2.4 POST /users/{user_id}/confirm-deletion

**Purpose:** Confirm deletion (from email link)

**Request:**
```json
{
  "confirmation_token": "conf_abc123..."
}
```

**Response (200 OK):**
```json
{
  "message": "Account and all associated data permanently deleted"
}
```

**Side Effects:**
- Hard delete user record
- Hard delete all pets for this user
- Hard delete all check-ins for those pets
- Hard delete all acute events for those pets
- Hard delete all digest logs for those pets
- Clear Redis cache
- Log audit entry: "deletion_confirmed"

---

## 2.3 Pet APIs (Pet Lambda)

### 2.3.1 POST /pets

**Purpose:** Create new pet profile

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Scooter",
  "age_months": 2,
  "gender": "male",
  "neutered_spayed": "unknown",
  "breed": "Mixed",
  "adoption_date": "2026-05-15",
  "source": "shelter",
  "sibling_bonded": "yes",
  "medical_history": {
    "vaccines": [],
    "medications": [],
    "flea_tick_preventative": null,
    "known_health_issues": []
  },
  "household_context": {
    "other_pets": false,
    "pet_types": [],
    "children_under_12": false
  },
  "current_concerns": ""
}
```

**Required Fields:**
- name
- age_months
- gender
- neutered_spayed

**Optional Fields:**
- All others (will use defaults if omitted)

**Response (201 Created):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Scooter",
  "age_months": 2,
  "gender": "male",
  "neutered_spayed": "unknown",
  "breed": "Mixed",
  "adoption_date": "2026-05-15",
  "source": "shelter",
  "sibling_bonded": "yes",
  "medical_history": { ... },
  "household_context": { ... },
  "current_concerns": "",
  "created_at": "2026-05-18T10:30:00Z"
}
```

**Validation:**
- age_months: 0-360
- gender/neutered_spayed/source: valid enum
- name: non-empty, max 100 chars
- adoption_date: not in future

**Response (400 Bad Request):**
```json
{
  "error": "VALIDATION_ERROR",
  "details": {
    "age_months": "Must be between 0 and 360"
  }
}
```

**Side Effects:**
- Insert into `pets` table
- Cache in Redis (5 min TTL)
- Log audit entry: "pet_created"
- Return pet_id for use in subsequent requests

---

### 2.3.2 GET /pets/{pet_id}

**Purpose:** Get pet profile details

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Scooter",
  "age_months": 2,
  ...all fields...
}
```

**Caching:**
- Check Redis first (5 min TTL)
- If miss, query PostgreSQL
- Cache result

---

### 2.3.3 PUT /pets/{pet_id}

**Purpose:** Update pet profile

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:** (any updatable field)
```json
{
  "age_months": 3,
  "medical_history": {
    "vaccines": [
      {
        "name": "FVRCP",
        "date": "2026-05-15",
        "next_due": "2027-05-15",
        "vet_clinic": "Main Street Vet"
      }
    ],
    "medications": [],
    "flea_tick_preventative": null,
    "known_health_issues": []
  }
}
```

**Response (200 OK):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  ...updated fields...
}
```

**Side Effects:**
- Update `pets` table
- Invalidate Redis cache
- Log audit entry: "pet_updated"

---

### 2.3.4 GET /users/{user_id}/pets

**Purpose:** List all pets for a user

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "pets": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Scooter",
      "age_months": 2,
      ...
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "name": "Luna",
      "age_months": 5,
      ...
    }
  ],
  "count": 2
}
```

---

## 2.4 Check-In APIs (Check-in Lambda)

### 2.4.1 POST /checkins

**Purpose:** Submit daily check-in

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "pet_id": "660e8400-e29b-41d4-a716-446655440000",
  "eating_level": "normal",
  "eating_notes": "Ate all breakfast and lunch",
  "litter_status": "normal",
  "litter_notes": "Used box 3 times, normal",
  "activity_level": "normal",
  "activity_notes": "Played with toy mouse for 10 mins",
  "owner_notes": "Seems happy",
  "confidence_score": null
}
```

**Required Fields:**
- pet_id
- eating_level
- litter_status
- activity_level

**Optional Fields:**
- eating_notes, litter_notes, activity_notes, owner_notes
- confidence_score (only Day 1 and Month 4)

**Validation:**
- eating_level: enum validation
- litter_status: enum validation
- activity_level: enum validation
- confidence_score: 1-5 or null
- Notes: max 500 chars each

**Response (201 Created):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "pet_id": "660e8400-e29b-41d4-a716-446655440000",
  "date": "2026-05-18",
  "eating_level": "normal",
  "eating_notes": "Ate all breakfast and lunch",
  "litter_status": "normal",
  "litter_notes": "Used box 3 times, normal",
  "activity_level": "normal",
  "activity_notes": "Played with toy mouse for 10 mins",
  "owner_notes": "Seems happy",
  "confidence_score": null,
  "feedback_text": "Great! Scooter's eating and activity look normal. Keep up the daily observations!",
  "created_at": "2026-05-18T14:30:00Z"
}
```

**Feedback Generation Logic:**

```
IF day_number == 1:
  feedback = "Welcome! You're off to a great start. Track daily observations to spot patterns."
ELSE IF day_number == 120:
  feedback = "Congratulations! You've been consistent for 4 months. Here's Scooter's behavioral baseline report for your vet visit."
ELSE IF all_levels_normal:
  feedback = "All looks good with Scooter today!"
ELSE IF any_level_abnormal:
  feedback = "Notice {abnormal_items}. Monitor for the next 24h. Escalate if it worsens."
ELSE:
  feedback = "Thanks for the daily check-in!"
```

**Side Effects:**
- Insert into `checkins` table (unique constraint: one per pet per day)
- If day 1: set confidence_score to value provided
- If day 120 (month 4): set confidence_score to value provided
- Queue message to Pattern Detection (async digest)
- Cache new check-in in Redis
- Log audit entry: "checkin_submitted"

---

### 2.4.2 GET /pets/{pet_id}/checkins

**Purpose:** Get check-in history for pet

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Params:**
```
?limit=30&offset=0&date_range=30d
```

**Response (200 OK):**
```json
{
  "checkins": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "date": "2026-05-18",
      "eating_level": "normal",
      "litter_status": "normal",
      "activity_level": "normal",
      "created_at": "2026-05-18T14:30:00Z"
    },
    ...
  ],
  "total": 32,
  "limit": 30,
  "offset": 0
}
```

**Pagination:**
- Default limit: 30
- Max limit: 100
- Offset-based pagination

---

## 2.5 Triage APIs (Triage Lambda)

### 2.5.1 POST /concerns

**Purpose:** Flag an acute concern and get triage response

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "pet_id": "660e8400-e29b-41d4-a716-446655440000",
  "concern_type": "not_eating",
  "followup_answers": {
    "duration": "24h",
    "amount_eating": "less than usual",
    "other_symptoms": ["hiding", "lethargic"],
    "recent_change": "adoption 2 days ago",
    "has_siblings": true,
    "was_separated": true,
    "appetite_baseline_known": true,
    "food_changed_recently": false,
    "water_intake": "normal"
  }
}
```

**Concern Types & Follow-up Questions:**

```
"not_eating" → {
  "duration": string (e.g., "24h", "48h", "72h+"),
  "amount_eating": enum (less_than_usual, not_at_all, refusing_specific_foods),
  "other_symptoms": array (hiding, lethargic, vomiting, diarrhea),
  "recent_change": string (adoption, food change, new pet, stress),
  "has_siblings": boolean,
  "was_separated": boolean,
  "appetite_baseline_known": boolean,
  "food_changed_recently": boolean,
  "water_intake": enum (normal, less, more, none)
}

"vomiting" → {
  "frequency": enum (once, twice, multiple_times, continuous),
  "last_occurrence": string (minutes/hours ago),
  "blood_present": boolean,
  "content": enum (food, liquid, hairball, unknown),
  "behavior_otherwise": enum (normal, lethargic, active),
  "eating_after": boolean,
  "recent_diet_change": boolean,
  "other_symptoms": array
}

"litter_problems" → {
  "type": enum (diarrhea, constipation, urinating_outside_box),
  "frequency": string,
  "consistency": enum (normal, loose, bloody, etc),
  "blood_present": boolean,
  "duration": string,
  "litter_box_access": enum (adequate, limited, poor),
  "recent_food_change": boolean,
  "stress_level_baseline": enum (low, medium, high)
}

... (similar for other concern types)
```

**Response (200 OK):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "pet_id": "660e8400-e29b-41d4-a716-446655440000",
  "concern_type": "not_eating",
  "severity": "concerning",
  "severity_label": "Worth monitoring",
  "response_text": "Scooter might be experiencing separation anxiety from their sibling. This is common for recently adopted kittens. Try:\n\n1. Spend quiet time near them\n2. Use familiar scents (blanket from shelter)\n3. Offer food 2-3 times daily in small portions\n4. Monitor for 24h\n\nIf not eating by tomorrow or shows other symptoms (vomiting, diarrhea), call your vet.",
  "escalation_markers": {
    "definitely_call_vet": false,
    "monitor_for": "24 hours",
    "warning_signs": ["continued_refusal", "vomiting", "diarrhea", "lethargy"]
  },
  "followup_prompt_at": "2026-05-19T14:30:00Z",
  "created_at": "2026-05-18T14:30:00Z"
}
```

**Severity Levels:**
- `manage_at_home` — "This is manageable at home"
- `watch` — "Worth monitoring for 24h"
- `call_vet_now` — "Contact your vet today/tomorrow"

**Template Selection Algorithm:**

```
IF concern_type == "respiratory" OR 
   concern_type == "limping" OR
   duration > "72h" OR
   blood_present == true:
  THEN severity = "call_vet_now"
  
ELSE IF concern_type == "not_eating":
  IF duration < "24h" AND 
     recent_adoption AND 
     sibling_bonded AND
     no_other_symptoms:
    THEN severity = "manage_at_home" (template = "benign")
  ELSE:
    severity = "watch" (template = "concerning")
    
ELSE IF concern_type == "litter_problems":
  IF duration < "12h" AND food_change:
    THEN severity = "watch" (template = "concerning")
  ELSE:
    severity = "watch" or "call_vet_now" depending on symptoms
    
... (logic for each concern type)
```

**Side Effects:**
- Insert into `acute_events` table
- Queue message to SQS (async LLM processing)
- Schedule 24h follow-up prompt
- Log audit entry: "concern_flagged"

---

### 2.5.2 GET /concerns/{concern_id}

**Purpose:** Get details of a specific concern

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "pet_id": "660e8400-e29b-41d4-a716-446655440000",
  "concern_type": "not_eating",
  "severity": "concerning",
  "response_text": "...",
  "followup_resolution": null,
  "created_at": "2026-05-18T14:30:00Z"
}
```

---

### 2.5.3 POST /concerns/{concern_id}/resolve

**Purpose:** Owner reports how concern was resolved

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request:**
```json
{
  "resolution": "resolved",
  "notes": "Scooter started eating again after spending time together"
}
```

**Valid Resolutions:**
- `resolved` — Issue completely resolved
- `better` — Improved but not fully resolved
- `worse` — Worsened
- `vet_visit` — Owner took cat to vet
- `unknown` — Owner unsure

**Response (200 OK):**
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440000",
  "concern_type": "not_eating",
  "resolution": "resolved",
  "resolved_at": "2026-05-19T10:00:00Z"
}
```

**Side Effects:**
- Update `acute_events` table
- Log audit entry: "concern_resolved"

---

## 2.6 Summary APIs (Vet Summary Lambda)

### 2.6.1 GET /pets/{pet_id}/summaries

**Purpose:** Generate vet summary on demand

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Params:**
```
?format=html&include_acute_events=true
```

**Response (200 OK):**
```json
{
  "html_report": "<html>...</html>",
  "text_report": "Plain text version...",
  "generated_at": "2026-05-18T14:30:00Z",
  "data_range": {
    "start": "2026-05-15",
    "end": "2026-05-18",
    "days_since_adoption": 3
  },
  "summary": {
    "pet_name": "Scooter",
    "adoption_date": "2026-05-15",
    "age_at_checkup": 2,
    "eating_summary": "Eating pattern has been consistent. All meals consumed normally.",
    "litter_summary": "Normal litter habits observed. No digestive issues.",
    "activity_summary": "Activity level stable and normal. Good play engagement.",
    "acute_events": [
      {
        "date": "2026-05-16",
        "concern": "not_eating",
        "outcome": "Resolved - separation anxiety from sibling"
      }
    ]
  }
}
```

**HTML Report Structure:**
```html
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; }
      .section { margin: 20px 0; page-break-inside: avoid; }
      .heading { font-size: 18px; font-weight: bold; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    </style>
  </head>
  <body>
    <h1>Behavioral Baseline Report: {pet_name}</h1>
    <p>Generated: {date} | Covered: {start_date} to {end_date}</p>
    
    <div class="section">
      <div class="heading">Cat Basics</div>
      <table>
        <tr><td>Name</td><td>{pet_name}</td></tr>
        <tr><td>Age at Report</td><td>{age_months} months</td></tr>
        <tr><td>Adoption Date</td><td>{adoption_date}</td></tr>
        <tr><td>Days Since Adoption</td><td>{days}</td></tr>
      </table>
    </div>
    
    <div class="section">
      <div class="heading">Eating Patterns</div>
      <p>{eating_summary_prose}</p>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Total observations</td><td>{total}</td></tr>
        <tr><td>Normal days</td><td>{normal_days}</td></tr>
        <tr><td>Consistency</td><td>{percentage}%</td></tr>
      </table>
    </div>
    
    ... (similar sections for litter, activity)
    
    <div class="section">
      <div class="heading">Acute Events/Concerns</div>
      <table>
        <tr><th>Date</th><th>Concern</th><th>Outcome</th></tr>
        {acute_events_rows}
      </table>
    </div>
  </body>
</html>
```

**Side Effects:**
- Query PostgreSQL for all check-ins and acute events
- Call Claude API multiple times (eating, litter, activity summaries)
- Format as HTML/plain text
- Log generation to `summary_generations` table (audit only)
- No storage — generated fresh each time

---

## 2.7 Error Response Format (All APIs)

**Standard Error Response:**
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "request_id": "req_abc123",
  "timestamp": "2026-05-18T14:30:00Z"
}
```

**HTTP Status Codes:**

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | User accessing other user's data |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already registered |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal error |
| 503 | Service Unavailable | Dependency down |

---

# 3. Service Implementations

## 3.1 Auth Lambda (Node.js/TypeScript)

**File Structure:**
```
services/auth/
├── src/
│   ├── index.ts               # Lambda handler
│   ├── handlers/
│   │   ├── signup.ts
│   │   ├── verify.ts
│   │   ├── refresh.ts
│   │   └── logout.ts
│   ├── services/
│   │   ├── otp.service.ts     # OTP generation/validation
│   │   ├── jwt.service.ts     # JWT operations
│   │   ├── email.service.ts   # SendGrid integration
│   │   └── user.service.ts    # User operations
│   ├── utils/
│   │   ├── errors.ts          # Custom error classes
│   │   ├── logger.ts          # CloudWatch logging
│   │   └── validation.ts      # Input validation
│   ├── config/
│   │   └── secrets.ts         # AWS Secrets Manager
│   └── types/
│       └── auth.types.ts      # TypeScript interfaces
├── package.json
├── tsconfig.json
├── jest.config.js
└── tests/
    ├── unit/
    │   ├── otp.service.test.ts
    │   ├── jwt.service.test.ts
    │   └── signup.handler.test.ts
    └── integration/
        └── auth.integration.test.ts
```

**Lambda Handler (src/index.ts):**
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { signupHandler } from './handlers/signup';
import { verifyHandler } from './handlers/verify';
import { refreshHandler } from './handlers/refresh';
import { logoutHandler } from './handlers/logout';
import { CustomError } from './utils/errors';
import { logger } from './utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const method = event.httpMethod;
  const requestId = context.requestId;

  logger.info('Incoming request', { path, method, requestId });

  try {
    // Route to appropriate handler
    if (path === '/auth/signup' && method === 'POST') {
      return await signupHandler(event, context);
    } else if (path === '/auth/verify' && method === 'POST') {
      return await verifyHandler(event, context);
    } else if (path === '/auth/refresh' && method === 'POST') {
      return await refreshHandler(event, context);
    } else if (path === '/auth/logout' && method === 'POST') {
      return await logoutHandler(event, context);
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'NOT_FOUND' })
      };
    }
  } catch (error) {
    return handleError(error, requestId);
  }
};

function handleError(error: unknown, requestId: string): APIGatewayProxyResult {
  if (error instanceof CustomError) {
    logger.warn('Expected error', { 
      error: error.code, 
      message: error.message,
      requestId 
    });
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: error.code,
        message: error.message,
        request_id: requestId
      })
    };
  }

  logger.error('Unexpected error', { 
    error: String(error),
    stack: error instanceof Error ? error.stack : undefined,
    requestId
  });

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      request_id: requestId
    })
  };
}
```

**Signup Handler (src/handlers/signup.ts):**
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateEmail, validateName } from '../utils/validation';
import { generateOTP, hashOTP } from '../services/otp.service';
import { sendOTPEmail } from '../services/email.service';
import { createUser, getUserByEmail } from '../services/user.service';
import { getDatabase } from '../config/database';
import { CustomError } from '../utils/errors';
import { logger } from '../utils/logger';

interface SignupRequest {
  email: string;
  first_name: string;
  last_name: string;
}

export const signupHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}') as SignupRequest;

    // Validate inputs
    if (!body.email || !body.first_name || !body.last_name) {
      throw new CustomError(400, 'VALIDATION_ERROR', 'Missing required fields', {
        required: ['email', 'first_name', 'last_name']
      });
    }

    if (!validateEmail(body.email)) {
      throw new CustomError(400, 'INVALID_EMAIL', 'Email format is invalid');
    }

    if (!validateName(body.first_name) || !validateName(body.last_name)) {
      throw new CustomError(400, 'INVALID_NAME', 'Names must be 1-100 characters');
    }

    // Check if user already exists
    const db = getDatabase();
    const existingUser = await getUserByEmail(body.email);
    if (existingUser) {
      throw new CustomError(409, 'EMAIL_ALREADY_REGISTERED', 'This email is already registered');
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpHash = hashOTP(otpCode);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store OTP
    await db.query(
      `INSERT INTO otp_tokens (email, token_hash, otp_code, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [body.email, otpHash, otpCode, expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(body.email, body.first_name, otpCode);

    logger.info('Signup initiated', { email: body.email });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'OTP sent to email. Valid for 24 hours.',
        email: body.email,
        expires_in_seconds: 86400
      })
    };
  } catch (error) {
    throw error;
  }
};
```

**OTP Service (src/services/otp.service.ts):**
```typescript
import crypto from 'crypto';

export function generateOTP(): string {
  // Generate 6-digit numeric OTP
  const otp = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return otp;
}

export function hashOTP(otp: string): string {
  // PBKDF2 hash with salt
  const salt = crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(otp, salt, 10000, 64, 'sha512');
  return salt.toString('hex') + ':' + hash.toString('hex');
}

export function verifyOTP(storedHash: string, providedOTP: string): boolean {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const providedHash = crypto.pbkdf2Sync(providedOTP, salt, 10000, 64, 'sha512');
  return providedHash.toString('hex') === hashHex;
}

export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
```

**JWT Service (src/services/jwt.service.ts):**
```typescript
import jwt from 'jsonwebtoken';
import { getSecret } from '../config/secrets';
import { logger } from '../utils/logger';

interface JWTPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  type: 'user';
}

export async function generateJWT(userId: string, email: string): Promise<string> {
  const secret = await getSecret('jwt-secret');
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 7 * 24 * 60 * 60; // 7 days

  const payload: JWTPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + expiresIn,
    type: 'user'
  };

  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    issuer: 'new-cat-companion',
    audience: 'new-cat-companion-users'
  });
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const secret = await getSecret('jwt-secret');
  
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'new-cat-companion',
      audience: 'new-cat-companion-users'
    }) as JWTPayload;
    
    return payload;
  } catch (error) {
    logger.warn('JWT verification failed', { error: String(error) });
    throw new Error('INVALID_TOKEN');
  }
}
```

---

## 3.2 User Lambda (Node.js/TypeScript)

**Similar structure to Auth Lambda**

Key differences:
- Handles GET/PUT for user profile
- Requires JWT validation middleware
- Interacts with Redis cache
- Returns 404 if user not found

---

## 3.3 Pet Lambda (Java/Spring Boot)

**File Structure:**
```
services/pet/
├── src/main/java/com/newcat/pet/
│   ├── PetLambda.java               # Lambda handler
│   ├── controller/
│   │   └── PetController.java       # HTTP request handling
│   ├── service/
│   │   ├── PetService.java
│   │   ├── PetRepository.java
│   │   └── RedisService.java
│   ├── entity/
│   │   ├── Pet.java
│   │   ├── MedicalHistory.java
│   │   └── HouseholdContext.java
│   ├── dto/
│   │   ├── PetRequest.java
│   │   ├── PetResponse.java
│   │   └── ErrorResponse.java
│   ├── config/
│   │   ├── DatabaseConfig.java
│   │   ├── RedisConfig.java
│   │   └── JWTConfig.java
│   ├── exception/
│   │   └── CustomExceptionHandler.java
│   └── util/
│       ├── JWTValidator.java
│       └── Logger.java
├── pom.xml
└── src/test/java/
    ├── unit/
    │   └── PetServiceTest.java
    └── integration/
        └── PetControllerTest.java
```

**Lambda Handler (PetLambda.java):**
```java
package com.newcat.pet;

import com.amazonaws.lambda.core.Context;
import com.amazonaws.lambda.events.APIGatewayProxyRequestEvent;
import com.amazonaws.lambda.events.APIGatewayProxyResponseEvent;
import com.amazonaws.lambda.core.RequestHandler;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import com.newcat.pet.controller.PetController;
import com.newcat.pet.util.Logger;

public class PetLambda implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
  
  private static ApplicationContext context;
  private static final Logger logger = new Logger(PetLambda.class);
  
  @Override
  public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
    logger.info("Incoming request", new Object[] { 
      "path", input.getPath(),
      "method", input.getHttpMethod(),
      "requestId", context.getRequestId()
    });

    try {
      // Initialize Spring context on first invocation (warm start reuses context)
      if (PetLambda.context == null) {
        PetLambda.context = SpringApplication.run(PetApplication.class);
      }

      PetController controller = PetLambda.context.getBean(PetController.class);
      return controller.handleRequest(input, context);
      
    } catch (Exception e) {
      logger.error("Unexpected error", e);
      return createErrorResponse(500, "INTERNAL_SERVER_ERROR", context.getRequestId());
    }
  }

  private APIGatewayProxyResponseEvent createErrorResponse(int statusCode, String errorCode, String requestId) {
    APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
    response.setStatusCode(statusCode);
    response.setBody(String.format("{\"error\":\"%s\",\"request_id\":\"%s\"}", errorCode, requestId));
    response.getHeaders().put("Content-Type", "application/json");
    return response;
  }
}
```

**Pet Controller (PetController.java):**
```java
package com.newcat.pet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.amazonaws.lambda.events.APIGatewayProxyRequestEvent;
import com.amazonaws.lambda.events.APIGatewayProxyResponseEvent;
import com.amazonaws.lambda.core.Context;
import com.newcat.pet.service.PetService;
import com.newcat.pet.dto.PetRequest;
import com.newcat.pet.dto.PetResponse;
import com.newcat.pet.util.JWTValidator;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Component
public class PetController {
  
  @Autowired
  private PetService petService;
  
  @Autowired
  private JWTValidator jwtValidator;
  
  private final ObjectMapper mapper = new ObjectMapper();
  
  public APIGatewayProxyResponseEvent handleRequest(
      APIGatewayProxyRequestEvent input,
      Context context) {
    
    String path = input.getPath();
    String method = input.getHttpMethod();
    String requestId = context.getRequestId();
    
    try {
      // Validate JWT from Authorization header
      String token = extractToken(input.getHeaders());
      Map<String, Object> claims = jwtValidator.validateToken(token);
      String userId = (String) claims.get("sub");
      
      // Route to appropriate handler
      if ("/pets".equals(path) && "POST".equals(method)) {
        return createPet(input, userId, requestId);
      } else if (path.matches("/pets/[a-f0-9\\-]+") && "GET".equals(method)) {
        String petId = path.split("/")[2];
        return getPet(petId, userId, requestId);
      } else if (path.matches("/pets/[a-f0-9\\-]+") && "PUT".equals(method)) {
        String petId = path.split("/")[2];
        return updatePet(input, petId, userId, requestId);
      } else if (path.matches("/users/[a-f0-9\\-]+/pets") && "GET".equals(method)) {
        String requestedUserId = path.split("/")[2];
        return listPets(requestedUserId, userId, requestId);
      } else {
        return createErrorResponse(404, "NOT_FOUND", requestId);
      }
      
    } catch (Exception e) {
      return handleException(e, requestId);
    }
  }

  private APIGatewayProxyResponseEvent createPet(
      APIGatewayProxyRequestEvent input,
      String userId,
      String requestId) throws Exception {
    
    PetRequest request = mapper.readValue(input.getBody(), PetRequest.class);
    PetResponse response = petService.createPet(userId, request);
    
    return createSuccessResponse(201, response, requestId);
  }

  private APIGatewayProxyResponseEvent getPet(
      String petId,
      String userId,
      String requestId) throws Exception {
    
    PetResponse response = petService.getPet(petId, userId);
    return createSuccessResponse(200, response, requestId);
  }

  private String extractToken(Map<String, String> headers) {
    if (headers == null || !headers.containsKey("Authorization")) {
      throw new RuntimeException("MISSING_TOKEN");
    }
    String authHeader = headers.get("Authorization");
    if (!authHeader.startsWith("Bearer ")) {
      throw new RuntimeException("INVALID_TOKEN_FORMAT");
    }
    return authHeader.substring(7);
  }

  private APIGatewayProxyResponseEvent createSuccessResponse(
      int statusCode,
      Object body,
      String requestId) throws Exception {
    
    APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
    response.setStatusCode(statusCode);
    response.setBody(mapper.writeValueAsString(body));
    response.getHeaders().put("Content-Type", "application/json");
    return response;
  }

  private APIGatewayProxyResponseEvent createErrorResponse(
      int statusCode,
      String errorCode,
      String requestId) {
    
    APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
    response.setStatusCode(statusCode);
    response.setBody(mapper.createObjectNode()
      .put("error", errorCode)
      .put("request_id", requestId)
      .toString());
    response.getHeaders().put("Content-Type", "application/json");
    return response;
  }

  private APIGatewayProxyResponseEvent handleException(Exception e, String requestId) {
    // Log and return appropriate error response
    if (e instanceof IllegalArgumentException) {
      return createErrorResponse(400, "VALIDATION_ERROR", requestId);
    }
    return createErrorResponse(500, "INTERNAL_SERVER_ERROR", requestId);
  }
}
```

**Pet Service (PetService.java):**
```java
package com.newcat.pet.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.newcat.pet.entity.Pet;
import com.newcat.pet.dto.PetRequest;
import com.newcat.pet.dto.PetResponse;
import com.newcat.pet.repository.PetRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
public class PetService {
  
  @Autowired
  private PetRepository petRepository;
  
  @Autowired
  private RedisService redisService;
  
  public PetResponse createPet(String userId, PetRequest request) {
    // Validate request
    validatePetRequest(request);
    
    // Create entity
    Pet pet = new Pet();
    pet.setId(UUID.randomUUID().toString());
    pet.setUserId(userId);
    pet.setName(request.getName());
    pet.setAgeMonths(request.getAgeMonths());
    pet.setGender(request.getGender());
    pet.setNeuteredSpayed(request.getNeuteredSpayed());
    
    // Save to database
    Pet saved = petRepository.save(pet);
    
    // Cache in Redis (5 min TTL)
    redisService.setWithTTL("pet:" + saved.getId(), saved, 300);
    
    return mapToResponse(saved);
  }
  
  public PetResponse getPet(String petId, String userId) {
    // Check Redis first
    Optional<Pet> cached = redisService.get("pet:" + petId, Pet.class);
    if (cached.isPresent()) {
      Pet pet = cached.get();
      if (!pet.getUserId().equals(userId)) {
        throw new RuntimeException("FORBIDDEN");
      }
      return mapToResponse(pet);
    }
    
    // Query database
    Optional<Pet> pet = petRepository.findById(petId);
    if (pet.isEmpty() || !pet.get().getUserId().equals(userId)) {
      throw new RuntimeException("NOT_FOUND");
    }
    
    // Cache result
    redisService.setWithTTL("pet:" + petId, pet.get(), 300);
    
    return mapToResponse(pet.get());
  }
  
  private void validatePetRequest(PetRequest request) {
    if (request.getName() == null || request.getName().trim().isEmpty()) {
      throw new IllegalArgumentException("name is required");
    }
    if (request.getAgeMonths() == null || request.getAgeMonths() < 0 || request.getAgeMonths() > 360) {
      throw new IllegalArgumentException("age_months must be 0-360");
    }
  }
  
  private PetResponse mapToResponse(Pet pet) {
    return new PetResponse(pet);
  }
}
```

---

## 3.4 Check-in Lambda (Java/Spring Boot)

**Similar pattern to Pet Lambda** with focus on:
- Daily check-in submission
- Feedback generation
- Queue async digest generation

---

## 3.5 Triage Lambda (Java/Spring Boot)

**Key Features:**
- Template selection based on rules
- Claude LLM integration
- Severity determination
- SQS queue message generation

---

# 4. LLM Integration & Prompts

## 4.1 Claude API Integration

**Dependencies (pom.xml for Java, package.json for Node.js):**

```xml
<dependency>
  <groupId>software.amazon.awssdk</groupId>
  <artifactId>bedrockruntime</artifactId>
  <version>2.20.0</version>
</dependency>
```

**Claude Client (Java):**
```java
package com.newcat.pet.service;

import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ClaudeService {
  
  private final BedrockRuntimeClient client;
  private final ObjectMapper mapper;
  
  public ClaudeService() {
    this.client = BedrockRuntimeClient.builder().build();
    this.mapper = new ObjectMapper();
  }
  
  public String callClaude(String systemPrompt, String userPrompt, int maxTokens) {
    InvokeModelRequest request = InvokeModelRequest.builder()
      .modelId("claude-3-5-sonnet-20241022")
      .body(buildRequestPayload(systemPrompt, userPrompt, maxTokens))
      .build();
    
    InvokeModelResponse response = client.invokeModel(request);
    return parseResponse(response);
  }
  
  private String buildRequestPayload(String systemPrompt, String userPrompt, int maxTokens) {
    ObjectNode payload = mapper.createObjectNode();
    payload.put("model", "claude-3-5-sonnet-20241022");
    payload.put("max_tokens", maxTokens);
    
    ArrayNode messages = mapper.createArrayNode();
    ObjectNode message = mapper.createObjectNode();
    message.put("role", "user");
    message.put("content", userPrompt);
    messages.add(message);
    
    payload.set("messages", messages);
    
    if (systemPrompt != null && !systemPrompt.isEmpty()) {
      payload.put("system", systemPrompt);
    }
    
    return payload.toString();
  }
  
  private String parseResponse(InvokeModelResponse response) {
    try {
      JsonNode json = mapper.readTree(response.body().asByteArray());
      return json.get("content").get(0).get("text").asText();
    } catch (Exception e) {
      throw new RuntimeException("Failed to parse Claude response", e);
    }
  }
}
```

---

## 4.2 Triage Prompt Design

### System Prompt (for all triage calls):

```
You are a helpful veterinary assistant supporting first-time cat owners during their cat's first 4 months at home.

Your role:
- Acknowledge the owner's concern with empathy
- Provide evidence-based guidance grounded in feline behavior research
- Give clear, actionable steps the owner can take at home
- Identify symptoms that warrant veterinary attention
- Never diagnose medical conditions or prescribe treatments

Tone:
- Reassuring but honest
- Professional but conversational
- Avoid medical jargon; explain clearly
- Acknowledge uncertainty where appropriate

Format:
- 2-3 sentences of acknowledgment
- Bulleted steps or guidance (max 5 items)
- Clear escalation marker if needed

Response length: 150-250 words
```

### Example Triage Prompt (not_eating concern):

```
User's situation:
- Kitten: {pet_name}, {age} months old
- Adopted: {adoption_date} ({days_since_adoption} days ago)
- Previously had a sibling: yes
- Duration not eating: 24 hours
- Other symptoms: hiding, less active than usual
- Water intake: normal
- Recent food change: no

Based on this context, provide guidance for the owner about their kitten's feeding refusal. 
If the kitten was recently separated from a sibling, separation anxiety is likely. 
Suggest monitoring and engagement strategies.
```

### Prompt Validation:

```java
public class PromptValidator {
  
  public static void validateTriagePrompt(Map<String, Object> context) {
    // Ensure all required context fields are present
    String[] required = {"pet_name", "age", "adoption_date", "concern_type"};
    for (String field : required) {
      if (!context.containsKey(field)) {
        throw new IllegalArgumentException("Missing required context: " + field);
      }
    }
  }
  
  public static String buildTriagePrompt(Map<String, Object> context) {
    StringBuilder prompt = new StringBuilder();
    prompt.append("User's situation:\n");
    prompt.append("- Kitten: ").append(context.get("pet_name")).append(", ");
    prompt.append(context.get("age")).append(" months old\n");
    // ... continue building prompt with all context
    return prompt.toString();
  }
}
```

---

## 4.3 Digest Prompt Design

### System Prompt:

```
You are a veterinary assistant writing a weekly behavioral summary of a kitten for the owner to track progress.

Your role:
- Summarize patterns observed in daily check-ins
- Highlight any deviations from baseline
- Encourage continued observation
- Flag any trends worth discussing with a vet

Tone:
- Encouraging and positive
- Clear and concise
- Professional but warm

Format:
- 2-3 sentences max per section
- Focus on facts and observable patterns, not diagnosis

Sections to write:
1. Eating patterns (consistency, changes, notes)
2. Litter habits (any issues, normal pattern)
3. Activity and sleep (trends over week)
4. Any concerns flagged (what happened, how resolved)
```

### Example Digest Data Prompt:

```
Eating patterns from past 7 days:
- 6 of 7 days: normal intake
- 1 of 7 days: less than usual (2026-05-16, separated from sibling that day)
- Consistency: 85%

Litter habits from past 7 days:
- All 7 days: normal
- No digestive issues observed

Activity level trend:
- Average: "normal"
- Range: "very_active" to "calm"
- Trend: stable

Write a concise summary of eating patterns observed. Focus on consistency and any deviations.
```

---

## 4.4 Vet Summary Prompt Design

### System Prompt:

```
You are writing a one-page behavioral baseline report for a kitten's veterinarian.

Your role:
- Provide clinical observations in plain language
- Summarize patterns over the kitten's first 4 months
- Help the vet understand the owner's baseline observations
- Organize information clearly and concisely

Tone:
- Clinical but accessible
- Factual and objective
- Professional

Format:
- 2-3 sentences per section
- Use data and observations, not opinions
- Include key metrics (consistency %, days observed, etc.)

Sections:
- Eating: baseline, consistency, deviations
- Litter: normal pattern, any flags
- Activity: baseline and trends
- Acute concerns: brief summary of events and outcomes
```

---

# 5. Database Connection Pooling

## 5.1 Java (HikariCP)

**Configuration (application.properties):**
```properties
spring.datasource.url=jdbc:postgresql://[RDS_HOST]:5432/newcat
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=2
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.auto-commit=true
```

**Usage:**
```java
@Autowired
private DataSource dataSource;

public Connection getConnection() throws SQLException {
  return dataSource.getConnection();  // HikariCP manages pooling
}
```

---

## 5.2 Node.js (node-postgres)

**Configuration:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: 5432,
  database: 'newcat',
  max: 20,           // max connections
  idleTimeoutMillis: 300000,  // 5 minutes
  connectionTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false }  // AWS RDS requires SSL
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', { error: err });
});

export default pool;
```

**Usage:**
```typescript
import pool from './db';

export async function getUserById(userId: string) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );
    return result.rows[0];
  } finally {
    // Connection automatically returned to pool
  }
}
```

---

# 6. Error Handling & Retry Logic

## 6.1 Transient vs Permanent Errors

**Transient (retry with exponential backoff):**
- Database connection timeout
- LLM API rate limit (429)
- SQS queue unavailable
- Email service temporary failure

**Permanent (fail immediately):**
- Validation error (400)
- Authentication error (401)
- Not found (404)
- Malformed request

---

## 6.2 Retry Strategy

```java
public class RetryPolicy {
  
  public static final int MAX_RETRIES = 3;
  public static final long INITIAL_BACKOFF_MS = 1000;
  public static final double BACKOFF_MULTIPLIER = 2.0;
  
  public static <T> T executeWithRetry(
      Callable<T> operation,
      String operationName) throws Exception {
    
    long backoffMs = INITIAL_BACKOFF_MS;
    Exception lastException = null;
    
    for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info("Executing operation", 
          "operationName", operationName,
          "attempt", attempt);
        
        return operation.call();
        
      } catch (Exception e) {
        lastException = e;
        
        if (!isTransientError(e)) {
          throw e;  // Permanent error, fail immediately
        }
        
        if (attempt < MAX_RETRIES) {
          logger.warn("Transient error, retrying",
            "operation", operationName,
            "attempt", attempt,
            "nextRetryInMs", backoffMs,
            "error", e.getMessage());
          
          Thread.sleep(backoffMs);
          backoffMs = (long) (backoffMs * BACKOFF_MULTIPLIER);
        }
      }
    }
    
    throw new RetryExhaustedException(
      "Operation " + operationName + " failed after " + MAX_RETRIES + " attempts",
      lastException);
  }
  
  private static boolean isTransientError(Exception e) {
    return e instanceof SQLException ||
           e instanceof TimeoutException ||
           (e.getMessage() != null && e.getMessage().contains("429"));
  }
}
```

---

## 6.3 Circuit Breaker (for external services)

```java
public class CircuitBreaker {
  
  enum State { CLOSED, OPEN, HALF_OPEN }
  
  private State state = State.CLOSED;
  private int failureCount = 0;
  private long lastFailureTime = 0;
  
  private static final int FAILURE_THRESHOLD = 5;
  private static final long TIMEOUT_MS = 60000;  // 1 minute
  
  public <T> T execute(Callable<T> operation) throws Exception {
    if (state == State.OPEN) {
      if (System.currentTimeMillis() - lastFailureTime > TIMEOUT_MS) {
        state = State.HALF_OPEN;
        failureCount = 0;
      } else {
        throw new CircuitBreakerOpenException("Circuit breaker is OPEN");
      }
    }
    
    try {
      T result = operation.call();
      onSuccess();
      return result;
    } catch (Exception e) {
      onFailure();
      throw e;
    }
  }
  
  private void onSuccess() {
    failureCount = 0;
    state = State.CLOSED;
  }
  
  private void onFailure() {
    failureCount++;
    lastFailureTime = System.currentTimeMillis();
    
    if (failureCount >= FAILURE_THRESHOLD) {
      state = State.OPEN;
      logger.warn("Circuit breaker OPENED due to failures");
    }
  }
}
```

---

# 7. Testing Strategy

## 7.1 Unit Tests

**Auth Service Tests (signup):**
```typescript
describe('SignupHandler', () => {
  
  it('should accept valid signup request', async () => {
    const request = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };
    
    const result = await signupHandler(request);
    
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain('OTP sent');
  });
  
  it('should reject invalid email', async () => {
    const request = {
      email: 'invalid-email',
      first_name: 'John',
      last_name: 'Doe'
    };
    
    const result = await signupHandler(request);
    
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain('VALIDATION_ERROR');
  });
  
  it('should reject duplicate email', async () => {
    // Mock: user already exists
    jest.spyOn(userService, 'getUserByEmail').mockResolvedValueOnce(existingUser);
    
    const request = {
      email: 'existing@example.com',
      first_name: 'Jane',
      last_name: 'Doe'
    };
    
    const result = await signupHandler(request);
    
    expect(result.statusCode).toBe(409);
    expect(result.body).toContain('EMAIL_ALREADY_REGISTERED');
  });
});
```

**Pet Service Tests (Java):**
```java
@SpringBootTest
class PetServiceTest {
  
  @Mock
  private PetRepository petRepository;
  
  @Mock
  private RedisService redisService;
  
  @InjectMocks
  private PetService petService;
  
  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }
  
  @Test
  void testCreatePetSuccess() {
    // Arrange
    PetRequest request = new PetRequest();
    request.setName("Scooter");
    request.setAgeMonths(2);
    request.setGender("male");
    
    Pet savedPet = new Pet();
    savedPet.setId(UUID.randomUUID().toString());
    savedPet.setName("Scooter");
    
    Mockito.when(petRepository.save(Mockito.any())).thenReturn(savedPet);
    Mockito.when(redisService.setWithTTL(Mockito.anyString(), Mockito.any(), Mockito.anyInt()))
      .thenReturn(true);
    
    // Act
    PetResponse response = petService.createPet("user123", request);
    
    // Assert
    assertNotNull(response);
    assertEquals("Scooter", response.getName());
    Mockito.verify(petRepository, times(1)).save(Mockito.any());
    Mockito.verify(redisService, times(1)).setWithTTL(Mockito.anyString(), Mockito.any(), Mockito.anyInt());
  }
  
  @Test
  void testCreatePetValidationFailure() {
    // Arrange
    PetRequest request = new PetRequest();
    request.setName("");  // Invalid: empty name
    
    // Act & Assert
    assertThrows(IllegalArgumentException.class, () -> {
      petService.createPet("user123", request);
    });
  }
}
```

---

## 7.2 Integration Tests

**Database Integration Test:**
```typescript
describe('CheckInService - Database Integration', () => {
  let db: Database;
  let checkInService: CheckInService;
  
  beforeAll(async () => {
    db = new Database(testDbConfig);
    await db.connect();
    await db.runMigrations();
    checkInService = new CheckInService(db);
  });
  
  afterAll(async () => {
    await db.disconnect();
  });
  
  afterEach(async () => {
    await db.query('DELETE FROM checkins');
  });
  
  it('should insert check-in and retrieve it', async () => {
    // Insert
    const checkIn = await checkInService.createCheckIn({
      petId: 'pet123',
      eatingLevel: 'normal',
      litterStatus: 'normal',
      activityLevel: 'normal'
    });
    
    // Retrieve
    const retrieved = await checkInService.getCheckIn(checkIn.id);
    
    expect(retrieved.id).toBe(checkIn.id);
    expect(retrieved.eatingLevel).toBe('normal');
  });
  
  it('should enforce unique constraint on pet_id and date', async () => {
    const checkIn1 = await checkInService.createCheckIn({
      petId: 'pet123',
      eatingLevel: 'normal',
      litterStatus: 'normal',
      activityLevel: 'normal',
      date: '2026-05-18'
    });
    
    // Attempt to create second check-in for same pet on same date
    const checkIn2Promise = checkInService.createCheckIn({
      petId: 'pet123',
      eatingLevel: 'less_than_normal',
      litterStatus: 'normal',
      activityLevel: 'normal',
      date: '2026-05-18'
    });
    
    expect(checkIn2Promise).rejects.toThrow('UNIQUE_CONSTRAINT_VIOLATION');
  });
});
```

---

## 7.3 End-to-End Tests

**Full signup flow test:**
```typescript
describe('Auth Flow - End to End', () => {
  
  it('should complete signup, verify OTP, and return JWT', async () => {
    // 1. Sign up
    const signupResponse = await apiClient.post('/auth/signup', {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe'
    });
    
    expect(signupResponse.status).toBe(200);
    
    // 2. Capture OTP from email (mock in test)
    const otp = '123456';
    
    // 3. Verify OTP
    const verifyResponse = await apiClient.post('/auth/verify', {
      otp_token: otp
    });
    
    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.jwt_token).toBeDefined();
    
    // 4. Use JWT to access protected endpoint
    const profileResponse = await apiClient.get('/users/me', {
      headers: {
        'Authorization': `Bearer ${verifyResponse.body.jwt_token}`
      }
    });
    
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.email).toBe('test@example.com');
  });
});
```

---

# 8. Local Development Setup

## 8.1 Docker Compose (Local Environment)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: newcat_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  localstack:
    image: localstack/localstack:latest
    environment:
      SERVICES: lambda,sqs,sns,eventbridge,cloudwatch,logs
      DEBUG: 1
      DOCKER_HOST: unix:///var/run/docker.sock
    ports:
      - "4566:4566"
    volumes:
      - "./localstack-init.sh:/docker-entrypoint-initdb.d/init-aws.sh"

volumes:
  postgres_data:
```

**localstack-init.sh:**
```bash
#!/bin/bash

# Create SQS queues
aws --endpoint-url=http://localhost:4566 \
  sqs create-queue --queue-name async-llm-calls --region us-east-1

aws --endpoint-url=http://localhost:4566 \
  sqs create-queue --queue-name email-delivery --region us-east-1

# Create EventBridge rules (for scheduling)
# ... (similar setup for other AWS services)
```

---

## 8.2 Environment Variables

**.env.local:**
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=devuser
DB_PASSWORD=devpassword
DB_NAME=newcat_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS (LocalStack)
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Anthropic
ANTHROPIC_API_KEY=sk-...

# SendGrid
SENDGRID_API_KEY=SG...

# JWT
JWT_SECRET=dev-secret-key-change-in-prod

# Environment
ENVIRONMENT=local
LOG_LEVEL=debug
```

---

## 8.3 Running Services Locally

**Java Service (Pet Lambda):**
```bash
cd services/pet
mvn clean install
mvn spring-boot:run
```

**Node.js Service (Auth Lambda):**
```bash
cd services/auth
npm install
npm run dev
```

**All services with Docker:**
```bash
docker-compose up
```

---

# 9. Deployment & Configuration

## 9.1 AWS SAM Template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]

Globals:
  Function:
    Runtime: java21  # or nodejs20.x for Node functions
    MemorySize: 512
    Timeout: 30
    VpcConfig:
      SecurityGroupIds:
        - !Ref LambdaSecurityGroup
      SubnetIds:
        - !Ref PrivateSubnet1
        - !Ref PrivateSubnet2
    Environment:
      Variables:
        DB_HOST: !GetAtt RDSInstance.Endpoint.Address
        DB_PORT: 5432
        REDIS_HOST: !GetAtt ElastiCacheCluster.RedisEndpoint.Address
        ANTHROPIC_API_KEY: !Sub '{{resolve:secretsmanager:anthropic-api-key:SecretString:api-key}}'
        JWT_SECRET: !Sub '{{resolve:secretsmanager:jwt-secret:SecretString:secret}}'
        ENVIRONMENT: !Ref Environment
        LOG_LEVEL: !If [IsProd, warn, debug]

Resources:
  # Auth Function
  AuthFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub 'newcat-auth-${Environment}'
      CodeUri: services/auth
      Handler: dist/index.handler
      Runtime: nodejs20.x
      Events:
        SignupAPI:
          Type: Api
          Properties:
            RestApiId: !Ref ApiGateway
            Path: /auth/signup
            Method: POST
        VerifyAPI:
          Type: Api
          Properties:
            RestApiId: !Ref ApiGateway
            Path: /auth/verify
            Method: POST
      Layers:
        - !Ref CommonLayer

  # Pet Function
  PetFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub 'newcat-pet-${Environment}'
      CodeUri: services/pet
      Handler: com.newcat.pet.PetLambda
      Runtime: java21
      Events:
        CreatePetAPI:
          Type: Api
          Properties:
            RestApiId: !Ref ApiGateway
            Path: /pets
            Method: POST
        GetPetAPI:
          Type: Api
          Properties:
            RestApiId: !Ref ApiGateway
            Path: /pets/{petId}
            Method: GET

  # API Gateway
  ApiGateway:
    Type: AWS::Serverless::Api
    Properties:
      Name: !Sub 'newcat-api-${Environment}'
      StageName: !Ref Environment
      Auth:
        DefaultAuthorizer: JWTAuthorizer
      Cors:
        AllowOrigin: "'https://newcatcompanion.app'"
        AllowHeaders: "'Content-Type,Authorization'"
        AllowMethods: "'GET,POST,PUT,DELETE'"

  # JWT Authorizer
  JWTAuthorizer:
    Type: AWS::ApiGateway::Authorizer
    Properties:
      Name: JWTAuthorizer
      Type: TOKEN
      FunctionArn: !GetAtt AuthorizerFunction.Arn
      IdentitySource: method.request.header.Authorization

  # RDS Instance
  RDSInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub 'newcat-${Environment}'
      Engine: postgres
      EngineVersion: '15.3'
      DBInstanceClass: db.t3.micro  # For dev; use larger for prod
      AllocatedStorage: 20
      StorageType: gp3
      MasterUsername: !Sub '{{resolve:secretsmanager:db-credentials:SecretString:username}}'
      MasterUserPassword: !Sub '{{resolve:secretsmanager:db-credentials:SecretString:password}}'
      DBName: newcat_${Environment}
      VpcSecurityGroupIds:
        - !Ref RDSSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
      MultiAZ: !If [IsProd, true, false]
      EnableCloudwatchLogsExports:
        - postgresql
      BackupRetentionPeriod: !If [IsProd, 30, 7]
      EnableIAMDatabaseAuthentication: true

  # ElastiCache Redis
  ElastiCacheCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheNodeType: cache.t3.micro
      Engine: redis
      NumCacheNodes: 1
      VpcSecurityGroupIds:
        - !Ref RedisSecurityGroup
      CacheSubnetGroupName: !Ref CacheSubnetGroup

  # Common Layer (shared dependencies)
  CommonLayer:
    Type: AWS::Lambda::LayerVersion
    Properties:
      LayerName: !Sub 'newcat-common-${Environment}'
      ContentUri: layers/common
      CompatibleRuntimes:
        - nodejs20.x
        - nodejs18.x

Conditions:
  IsProd: !Equals [!Ref Environment, prod]

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint
    Value: !Sub 'https://${ApiGateway}.execute-api.${AWS::Region}.amazonaws.com/${Environment}'
  
  AuthFunctionArn:
    Description: Auth function ARN
    Value: !GetAtt AuthFunction.Arn
  
  PetFunctionArn:
    Description: Pet function ARN
    Value: !GetAtt PetFunction.Arn
```

---

## 9.2 Deployment Script

```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}

echo "Deploying New Cat Companion to $ENVIRONMENT in $REGION"

# Build services
echo "Building Auth Lambda..."
cd services/auth && npm run build && cd ../..

echo "Building Pet Lambda (Java)..."
cd services/pet && mvn clean package && cd ../..

# Deploy with SAM
echo "Deploying with SAM..."
sam build --use-container
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name newcat-${ENVIRONMENT} \
  --parameter-overrides Environment=${ENVIRONMENT} \
  --region ${REGION} \
  --capabilities CAPABILITY_NAMED_IAM

echo "Deployment complete!"
```

---

# 10. Monitoring & Observability

## 10.1 CloudWatch Logging

**Java:**
```java
@Component
public class Logger {
  
  private final CloudWatchAsyncClient cloudWatchClient;
  
  public void info(String message, Map<String, Object> context) {
    log(LogLevel.INFO, message, context);
  }
  
  public void error(String message, Exception e) {
    Map<String, Object> context = new HashMap<>();
    context.put("error", e.getMessage());
    context.put("stack", e.getStackTrace());
    log(LogLevel.ERROR, message, context);
  }
  
  private void log(LogLevel level, String message, Map<String, Object> context) {
    ObjectNode log = mapper.createObjectNode();
    log.put("timestamp", LocalDateTime.now().toString());
    log.put("level", level.toString());
    log.put("message", message);
    log.set("context", mapper.valueToTree(context));
    
    // Send to CloudWatch Logs
    System.out.println(mapper.writeValueAsString(log));
  }
}
```

**Node.js:**
```typescript
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      context
    }));
  },
  
  error: (message: string, error: Error, context?: Record<string, any>) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error.message,
      stack: error.stack,
      context
    }));
  }
};

export default logger;
```

---

## 10.2 CloudWatch Metrics

```typescript
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: 'us-east-1' });

export async function recordMetric(
  metricName: string,
  value: number,
  unit: string = 'Count'
) {
  const command = new PutMetricDataCommand({
    Namespace: 'NewCatCompanion',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date()
      }
    ]
  });

  await cloudwatch.send(command);
}

// Usage
await recordMetric('CheckinsSubmitted', 1);
await recordMetric('TriageResponseLatencyMs', responseTime, 'Milliseconds');
```

---

## 10.3 CloudWatch Alarms

```yaml
Resources:
  # Alarm: High error rate
  HighErrorRateAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub 'newcat-${Environment}-high-error-rate'
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 10
      ComparisonOperator: GreaterThanOrEqualToThreshold
      AlarmActions:
        - !Ref SNSTopic
      
  # Alarm: High latency
  HighLatencyAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub 'newcat-${Environment}-high-latency'
      MetricName: Duration
      Namespace: AWS/Lambda
      Statistic: Average
      Period: 300
      EvaluationPeriods: 1
      Threshold: 5000  # 5 seconds
      ComparisonOperator: GreaterThanOrEqualToThreshold
      AlarmActions:
        - !Ref SNSTopic
  
  # Alarm: RDS CPU high
  RDSHighCPUAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: !Sub 'newcat-${Environment}-rds-high-cpu'
      MetricName: CPUUtilization
      Namespace: AWS/RDS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanOrEqualToThreshold
      AlarmActions:
        - !Ref SNSTopic
```

---

# 11. Security Implementation

## 11.1 Input Validation

```java
@Component
public class InputValidator {
  
  // Email validation (RFC 5322)
  private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$";
  
  public static void validateEmail(String email) {
    if (!email.matches(EMAIL_REGEX)) {
      throw new ValidationException("INVALID_EMAIL");
    }
  }
  
  // Name validation
  public static void validateName(String name) {
    if (name == null || name.trim().isEmpty() || name.length() > 100) {
      throw new ValidationException("INVALID_NAME");
    }
  }
  
  // SQL injection prevention: use parameterized queries
  public static List<Pet> searchPets(String searchTerm) {
    String query = "SELECT * FROM pets WHERE name ILIKE $1";  // Parameterized
    return database.query(query, new Object[] { "%" + searchTerm + "%" });
  }
  
  // XSS prevention: sanitize before storing
  public static String sanitizeUserInput(String input) {
    return input
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      .replace("\"", "&quot;")
      .replace("'", "&#x27;")
      .replace("/", "&#x2F;");
  }
}
```

---

## 11.2 Authentication & Authorization

```java
@Component
public class JWTValidator {
  
  private final SecretKey key;
  
  public JWTValidator() {
    this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(getSecret("jwt-secret")));
  }
  
  public Claims validateToken(String token) throws JwtException {
    try {
      return Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody();
    } catch (ExpiredJwtException e) {
      throw new AuthException("TOKEN_EXPIRED");
    } catch (JwtException e) {
      throw new AuthException("INVALID_TOKEN");
    }
  }
  
  // Verify user owns resource
  public void verifyOwnership(String userId, String resourceOwnerId) {
    if (!userId.equals(resourceOwnerId)) {
      throw new AuthException("FORBIDDEN");
    }
  }
}
```

---

## 11.3 Data Encryption

```java
@Component
public class EncryptionService {
  
  private final Cipher cipher;
  private final SecretKey key;
  
  public EncryptionService() throws Exception {
    this.cipher = Cipher.getInstance("AES");
    this.key = getKeyFromSecretsManager("encryption-key");
  }
  
  public String encryptPII(String plaintext) throws Exception {
    cipher.init(Cipher.ENCRYPT_MODE, key);
    byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
    return Base64.getEncoder().encodeToString(encrypted);
  }
  
  public String decryptPII(String ciphertext) throws Exception {
    cipher.init(Cipher.DECRYPT_MODE, key);
    byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(ciphertext));
    return new String(decrypted, StandardCharsets.UTF_8);
  }
}
```

---

# 12. Code Organization & Structure

## 12.1 Directory Structure

```
repository/
├── README.md
├── ARCHITECTURE.md
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── services/
│   ├── auth/                        (Node.js/TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts             (Lambda handler)
│   │   │   ├── handlers/            (Request handlers)
│   │   │   ├── services/            (Business logic)
│   │   │   ├── utils/               (Helpers)
│   │   │   └── config/              (Configuration)
│   │   ├── tests/                   (Jest tests)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   │
│   ├── user/                        (Node.js/TypeScript - similar)
│   ├── pet/                         (Java/Spring Boot)
│   │   ├── src/main/java/com/newcat/pet/
│   │   │   ├── PetLambda.java
│   │   │   ├── PetApplication.java
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── entity/
│   │   │   ├── dto/
│   │   │   ├── repository/
│   │   │   └── exception/
│   │   ├── src/test/java/
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── checkin/                     (Java/Spring Boot - similar)
│   ├── triage/                      (Java/Spring Boot - similar)
│   ├── pattern-detection/           (Java/Spring Boot - similar)
│   ├── vet-summary/                 (Java/Spring Boot - similar)
│   └── notification/                (Node.js/TypeScript - similar)
│
├── infrastructure/
│   ├── template.yaml                (SAM template)
│   ├── Makefile                     (Deployment commands)
│   ├── localstack-init.sh           (LocalStack setup)
│   ├── environments/
│   │   ├── dev.yaml
│   │   ├── staging.yaml
│   │   └── prod.yaml
│   └── scripts/
│       ├── deploy.sh
│       ├── migrate.sh
│       └── backup.sh
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_pets.sql
│   │   ├── 003_create_checkins.sql
│   │   └── ...
│   └── seeds/
│       └── test-data.sql
│
├── docs/
│   ├── 02-planning/
│   │   ├── product-requirements-document.md
│   │   ├── system-design-document.md
│   │   └── technical-design-document.md
│   ├── 03-implementation/
│   │   └── IMPLEMENTATION_LOG.md
│   └── API.md
│
└── .github/
    └── workflows/
        ├── test.yml                 (Run tests)
        ├── deploy-dev.yml           (Deploy to dev)
        ├── deploy-prod.yml          (Deploy to prod)
        └── security-scan.yml        (SAST)
```

---

## 12.2 Naming Conventions

**Java:**
- Classes: PascalCase (PetService, PetRepository)
- Methods: camelCase (getPetById, createPet)
- Constants: UPPER_SNAKE_CASE (MAX_RETRIES, DB_TIMEOUT)
- Variables: camelCase (userId, petName)

**Node.js/TypeScript:**
- Same as Java for consistency

**Database:**
- Tables: snake_case (users, acute_events, check_ins)
- Columns: snake_case (user_id, created_at)
- Indexes: idx_{table}_{column} (idx_users_email)

---

## 12.3 Documentation Requirements

**Each service must include:**

1. `README.md` — Purpose, setup, testing
2. `ARCHITECTURE.md` — How this service fits in the system
3. Comments on complex logic
4. JSDoc/Javadoc on public methods
5. Example requests/responses in code

**Example JSDoc (Java):**
```java
/**
 * Creates a new pet profile for a user.
 * 
 * @param userId        The UUID of the owner
 * @param request       PetRequest containing pet details
 * @return              PetResponse with created pet details
 * @throws ValidationException if request fields are invalid
 * @throws SQLException if database operation fails
 */
public PetResponse createPet(String userId, PetRequest request) {
  // Implementation
}
```

---

# Summary

This TDD is your **source of truth for Phase 3 implementation**. It contains:

✅ **Complete database schema** with constraints and indexes  
✅ **Full API contracts** with request/response formats  
✅ **Service implementations** for every Lambda  
✅ **LLM integration** with prompts and validation  
✅ **Error handling** with retry strategies  
✅ **Testing strategy** with examples  
✅ **Local setup** instructions  
✅ **Deployment** configuration  
✅ **Monitoring** and observability  
✅ **Security** implementation  
✅ **Code organization** guidelines  

**Next phase:** Begin Phase 3 development following this TDD specification.

---

*Technical Design Document - FINAL. This is the engineering blueprint. Every team member should read and understand this document before writing code.*

