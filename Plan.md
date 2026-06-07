# Kitten Companion — Build Strategy & Implementation Plan

**Branch:** DEV  
**Phase:** 3 — Development  
**Date:** May 30, 2026

---

## The Core Principle: Backend First, Frontend Second

The frontend already has placeholder components (`CheckInForm`, `VetSummary`, `ConcernForm`, pages for dashboard/checkin/concern/summary). These are scaffolds — they can't be meaningfully developed until the APIs they call actually exist and return real data.

**Strategy: Build the backend column top-to-bottom, then wire the frontend to it.**

Each service is completed fully (code + tests + local smoke test) before moving to the next. This keeps you from juggling half-finished layers and means you always have something real running at the end of each work session.

---

## Local Dev Workflow (Every Session)

```bash
# 1. Start infrastructure (Postgres, Redis, LocalStack)
docker compose up -d

# 2. Confirm healthy
docker compose ps

# 3. Work on a service
cd services/<service-name>

# 4. Run tests continuously while coding
npm test --watch          # Node services
mvn test                  # Java services

# 5. Smoke test via curl after build
curl -X POST http://localhost:4566/<route> -H "Content-Type: application/json" -d '{...}'

# 6. Shut down when done
docker compose down
```

---

## Build Order

### Phase A — Foundation (Do this once, before any service)

These are shared concerns every service depends on. Getting them right upfront means you never have to redo them.

**A1. Database migrations**
All 8 migration files exist in `database/migrations/`. Mount them into docker-compose and run them:

```bash
# Uncomment in docker-compose.yml:
# - ./database/migrations:/docker-entrypoint-initdb.d
docker compose down -v && docker compose up -d
```

Verify all tables exist in pgAdmin 4:
`users, pets, checkins, acute_events, digest_logs, summary_generations, audit_logs, otp_tokens`

**A2. Shared utilities (per language)**

Node services all need the same logger, error classes, and DB client. Create these once in a `shared/` folder or within the first service (auth) and copy into others:

- `utils/logger.ts` — structured JSON logger
- `utils/errors.ts` — `CustomError` class (statusCode, code, message, context)
- `utils/db.ts` — pg Pool setup using env vars
- `utils/redis.ts` — Redis client setup

Java services all need:
- `BaseException.java` — maps to HTTP status codes
- `ApiResponse.java` — standard JSON wrapper
- `DatabaseConfig.java` — HikariCP pool config
- `RedisConfig.java` — Lettuce/Jedis client

**A3. `.env.local`**
Fill in all required values before writing any service code:
- `DB_PASSWORD=devpassword`
- `JWT_SECRET=<generate: openssl rand -base64 32>`
- `SENDGRID_API_KEY=<from SendGrid>`
- `ANTHROPIC_API_KEY=<from Anthropic console>`

---

### Phase B — Auth Service (Node.js/TypeScript)

**Start here.** Auth is the gate to every other service. Every subsequent API call needs a valid JWT. You cannot test any other service end-to-end without it.

**What to build (TDD Section 2.1, 3.1):**

| Handler | Route | Key Logic |
|---------|-------|-----------|
| `signupHandler` | `POST /auth/signup` | Validate email/name, insert OTP token, send email via SendGrid |
| `verifyHandler` | `POST /auth/verify` | Validate OTP hash, create user in DB, return JWT |
| `refreshHandler` | `POST /auth/refresh` | Validate JWT, return new JWT |
| `logoutHandler` | `POST /auth/logout` | Remove JWT from Redis |

**OTP flow:**
1. Generate 6-digit code
2. Hash it (bcrypt/SHA256) — store the hash, not the plaintext
3. Send email with the code via SendGrid
4. On verify: hash incoming code, compare to stored hash, mark `used_at`

**JWT:**
- HS256, 7-day expiry
- Payload: `{ sub: user_id, email, iat, exp, type: "user" }`
- Store in Redis on issue (for blocklist on logout)

**Scaffold:**
```bash
cd services/auth
npm init -y
npm install express jsonwebtoken bcryptjs pg redis @sendgrid/mail dotenv
npm install --save-dev typescript @types/node @types/express ts-node jest @types/jest ts-jest
```

**Definition of done:**
- [ ] `POST /auth/signup` returns 200, email would be sent (log it locally)
- [ ] `POST /auth/verify` returns JWT
- [ ] `POST /auth/logout` blacklists the token
- [ ] Unit tests: 80%+ coverage on handlers and services
- [ ] curl smoke tests pass against LocalStack

---

### Phase C — User Service (Node.js/TypeScript)

**Depends on:** Auth (needs JWT validation middleware)

**What to build (TDD Section 2.2, 3.2):**

| Handler | Route | Key Logic |
|---------|-------|-----------|
| `getProfileHandler` | `GET /users/{user_id}` | Check Redis cache, fallback to DB |
| `updateProfileHandler` | `PUT /users/{user_id}` | Validate fields, update DB, invalidate Redis |
| `deleteRequestHandler` | `DELETE /users/{user_id}` | Send confirmation email with token |
| `confirmDeletionHandler` | `POST /users/{user_id}/confirm-deletion` | Hard delete user + all related data |

**Key middleware to build first:** JWT auth middleware (extracts user_id from token, checks Redis blocklist). This middleware gets copy-pasted into every subsequent Node service.

**Definition of done:**
- [ ] `GET /users/{user_id}` returns cached user profile
- [ ] `PUT /users/{user_id}` updates and cache-busts
- [ ] `DELETE` two-step flow works end-to-end
- [ ] JWT middleware rejects invalid/expired/blacklisted tokens

---

### Phase D — Pet Service (Java/Spring Boot)

**Depends on:** Auth middleware pattern, DB schema (pets table)

**First Java service — set up the pattern all others will follow.**

**What to build (TDD Section 2.3, 3.3):**

| Endpoint | Route | Key Logic |
|----------|-------|-----------|
| Create pet | `POST /pets` | Validate fields, insert, cache in Redis |
| Get pet | `GET /pets/{pet_id}` | Cache-first read |
| Update pet | `PUT /pets/{pet_id}` | Update JSONB medical_history/household_context |
| List user's pets | `GET /users/{user_id}/pets` | Join query, list response |

**Spring Boot Lambda structure:**
```
src/main/java/com/newcat/pet/
├── PetLambda.java         (AWS Lambda handler — routes to controllers)
├── controller/
│   └── PetController.java
├── service/
│   └── PetService.java
├── entity/
│   └── Pet.java           (JPA entity)
├── dto/
│   ├── CreatePetRequest.java
│   └── PetResponse.java
├── repository/
│   └── PetRepository.java
└── exception/
    └── PetNotFoundException.java
```

**pom.xml key dependencies:**
```xml
<dependency>spring-boot-starter-data-jpa</dependency>
<dependency>aws-lambda-java-core</dependency>
<dependency>aws-lambda-java-events</dependency>
<dependency>software.amazon.awssdk:rds</dependency>
<dependency>com.amazonaws:aws-java-sdk-sqs</dependency>
<dependency>redis.clients:jedis</dependency>
```

**Definition of done:**
- [ ] All 4 endpoints work with real DB
- [ ] JSONB fields (medical_history, household_context) serialize/deserialize correctly
- [ ] Redis caching on reads, cache invalidation on writes
- [ ] JUnit 5 + Mockito unit tests passing

---

### Phase E — Check-In Service (Java/Spring Boot)

**Depends on:** Pet service (pet_id must exist), Auth

**What to build (TDD Section 2.4, 3.4):**

| Endpoint | Route | Key Logic |
|----------|-------|-----------|
| Submit check-in | `POST /checkins` | Validate enum fields, insert, return feedback |
| Get check-in history | `GET /pets/{pet_id}/checkins` | Paginated list, optional date range |
| Get single check-in | `GET /checkins/{checkin_id}` | Direct read |

**The feedback_text logic** (returned in the POST response) is rule-based, not LLM:
- Eating normal + litter normal + activity normal → positive reinforcement message
- Any deviation → flag + gentle guidance message
- Day 1: include confidence_score prompt
- Month 4: include confidence_score prompt

This is pure if/else branching — no Claude call yet.

**One-per-day constraint:** `UNIQUE(pet_id, date)` in DB — catch the constraint violation and return a helpful error.

**Definition of done:**
- [ ] Submit check-in returns 201 with `feedback_text`
- [ ] Duplicate check-in on same day returns 409 with clear error
- [ ] History endpoint returns paginated results
- [ ] Tests cover all enum variants and feedback paths

---

### Phase F — Triage Service (Java/Spring Boot) — First Claude Integration

**Depends on:** Pet service, Check-in service, Auth, Anthropic API key

**This is the most complex service. Build it in two sub-phases.**

**F1 — Synchronous triage (rule-based only):**

| Endpoint | Route | Key Logic |
|----------|-------|-----------|
| Flag concern | `POST /concerns` | Classify concern_type, run rule-based triage |
| Get concern | `GET /concerns/{id}` | Direct read |
| Resolve concern | `POST /concerns/{id}/resolve` | Set followup_resolution |

Rule-based template selection (TDD Section 3.5):
- `not_eating` + `duration < 24h` + `recent adoption` → `benign` template
- `vomiting` + `blood_present = true` → `urgent` template
- `litter_problems` + `blood_present = false` → `concerning` template
- Default fallback → `conservative_default`

**F2 — Add Claude (async via SQS):**

1. `POST /concerns` writes to SQS queue (fire and forget)
2. Triage Worker Lambda picks up the message
3. Worker calls Claude API with the structured prompt (TDD Section 4.1)
4. Worker writes `response_text` back to `acute_events`
5. Frontend polls `GET /concerns/{id}` until `response_text` is populated

**Claude prompt structure (TDD Section 4):**
```
System: You are a veterinary triage assistant for new cat owners...
User: Pet context: {age, breed, history}
      Concern: {concern_type}
      Owner's answers: {followup_answers JSON}
      Template selected: {benign|concerning|urgent}
      
      Provide a response following the {template} pattern...
```

**Definition of done:**
- [ ] Rule-based triage classifies correctly for all concern types
- [ ] Claude integration returns structured response
- [ ] Async flow (SQS → Worker → DB write) works end-to-end
- [ ] 24-hour follow-up prompt queued correctly

---

### Phase G — Pattern Detection Service (Java/Spring Boot)

**Depends on:** Check-in service (reads checkins table), SQS, EventBridge

**Triggered by:** EventBridge schedule (nightly at 2am UTC), not HTTP

**What to build (TDD Section 4.3):**

1. Pull last 7 days of check-ins for all active pets
2. Run rule-based pattern analysis:
   - Eating: any days with `less_than_normal` or `more_than_normal`?
   - Litter: any `diarrhea`, `constipation`, `not_used`?
   - Activity: trending `calm` or `sleeping_most_of_day`?
   - Notes: any "treat" mentions? (keyword scan)
3. Build `patterns` JSONB (see TDD Section 1.6 schema)
4. Call Claude to generate human-readable digest text
5. Insert into `digest_logs`
6. Queue email notification via SQS → Notification service

**EventBridge trigger (add to SAM template):**
```yaml
Events:
  NightlyDigest:
    Type: Schedule
    Properties:
      Schedule: cron(0 2 * * ? *)   # 2am UTC daily
```

**Definition of done:**
- [ ] Pattern analysis produces correct JSONB for all deviation scenarios
- [ ] Claude generates readable digest
- [ ] Digest stored in DB, email queued
- [ ] EventBridge trigger wired in SAM template

---

### Phase H — Vet Summary Service (Java/Spring Boot)

**Depends on:** All data services, Claude API

**What to build (TDD Section 4.4):**

| Endpoint | Route | Key Logic |
|----------|-------|-----------|
| Generate summary | `POST /pets/{pet_id}/summaries` | Fetch all data, multi-step Claude call |
| List summaries | `GET /pets/{pet_id}/summaries` | List audit log entries |

**Multi-step Claude call:**
1. Summarize check-in patterns (last N days) → intermediate text
2. Summarize acute events → intermediate text
3. Combine into vet-ready report format (HTML/plain text)
4. Return to user — not stored (audit log only records metadata)

**Definition of done:**
- [ ] Full summary generates in under 3 seconds
- [ ] Output is structured and readable (would make sense at a vet visit)
- [ ] summary_generations audit log written
- [ ] Error handling for Claude timeout/failure

---

### Phase I — Notification Service (Node.js/TypeScript)

**Depends on:** Auth (user preferences), SQS

**Triggered by:** SQS messages OR EventBridge (7pm daily reminder)

**What to build (TDD Section 3.1 notification section):**

| Trigger | Action |
|---------|--------|
| EventBridge 7pm | Send daily check-in reminder to all users with `enabled: true` |
| SQS `send-email` message | Send one-off email (OTP, digest, follow-up prompt) |

**SendGrid integration:**
```typescript
import { MailService } from '@sendgrid/mail';
const mail = new MailService();
mail.setApiKey(process.env.SENDGRID_API_KEY!);
await mail.send({ to, from: 'noreply@newcatcompanion.app', subject, html });
```

**Definition of done:**
- [ ] Reminder emails send on schedule
- [ ] SQS-triggered emails (OTP, digest) send correctly
- [ ] Failed sends retry (SQS dead-letter queue)

---

### Phase J — Frontend Wiring

**Now** connect the existing placeholder components to real APIs.

**The existing scaffolding:**
- [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx) → calls `GET /users/{id}/pets` + `GET /pets/{id}/checkins`
- [frontend/app/checkin/page.tsx](frontend/app/checkin/page.tsx) → calls `POST /checkins`
- [frontend/app/concern/page.tsx](frontend/app/concern/page.tsx) → calls `POST /concerns`, polls `GET /concerns/{id}`
- [frontend/app/summary/page.tsx](frontend/app/summary/page.tsx) → calls `POST /pets/{id}/summaries`
- [frontend/lib/api.ts](frontend/lib/api.ts) → central API client (fill in actual endpoints)

**Wiring order:**
1. `lib/api.ts` — set `NEXT_PUBLIC_API_URL`, implement all fetch wrappers
2. `lib/auth.ts` — JWT cookie management (httpOnly cookie set/get/clear)
3. Signup/verify flow (no existing page — create `/app/auth/page.tsx`)
4. Pet onboarding flow (create pet form)
5. Dashboard (list pets, recent check-ins)
6. Daily check-in form
7. Concern form + polling for triage response
8. Vet summary page

**Definition of done:**
- [ ] Full user journey works: signup → verify → create pet → check-in → flag concern → get summary
- [ ] JWT stored in httpOnly cookie, sent on every request
- [ ] API errors display as user-friendly messages (not raw JSON)
- [ ] Responsive on mobile (Tailwind is already configured)

---

## Service Build Order Summary

```
A. Foundation (migrations + shared utils)
    ↓
B. Auth Service (Node.js) ← gate to everything
    ↓
C. User Service (Node.js) ← depends on JWT middleware
    ↓
D. Pet Service (Java) ← first Java service, sets the pattern
    ↓
E. Check-in Service (Java) ← depends on pets
    ↓
F. Triage Service (Java) ← first Claude integration
    ↓
G. Pattern Detection (Java) ← depends on check-ins
    ↓
H. Vet Summary (Java) ← depends on all data
    ↓
I. Notification Service (Node.js) ← depends on user prefs + SQS
    ↓
J. Frontend Wiring ← connects everything
```

---

## What to Do When Starting a New Service

Every service follows this exact checklist:

1. **Read the TDD section** for that service before writing a line of code
2. **Scaffold** — `npm init` or `mvn archetype:generate`
3. **Write the test file first** (happy path + error cases) — this forces you to think about the contract
4. **Implement** until tests pass
5. **Smoke test** via curl against LocalStack
6. **Check the API contract** in TDD Section 2 — response shape must match exactly
7. **Commit** before moving on

---

## Testing Strategy Per Service

| Layer | Tool | When |
|-------|------|------|
| Unit tests | Jest (Node) / JUnit 5 + Mockito (Java) | While building |
| Integration tests | Supertest (Node) / Testcontainers (Java) | After service is complete |
| API smoke tests | curl / REST Client | Before marking done |
| End-to-end | Manual full flow | After Phase J |

Target: **80% unit test coverage** per service. Use `npm test -- --coverage` or `mvn test jacoco:report`.

---

## Key Rules While Building

1. **Parameterized queries always** — no string interpolation in SQL (see CLAUDE.md)
2. **Validate at the boundary** — check inputs before any DB operation
3. **Cache reads, invalidate on writes** — Redis TTL 5 minutes for all entity reads
4. **Never block on async work** — LLM calls always go through SQS, not inline
5. **No secrets in code** — all keys come from `.env.local` locally, Secrets Manager in AWS
6. **One commit per service** after smoke tests pass (clean history)

---

## Reference

| Need | Source |
|------|--------|
| DB schema / table definitions | TDD Section 1 |
| API request/response shapes | TDD Section 2 |
| Service business logic | TDD Section 3 |
| Claude prompts | TDD Section 4 |
| Error handling patterns | TDD Section 6 |
| Test examples | TDD Section 7 |
| SAM deployment | TDD Section 9 |
| Security rules | TDD Section 11 |
