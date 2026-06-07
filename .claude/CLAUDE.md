# CLAUDE.md - Phase 3 Implementation Guide

**Project:** New Cat Owner Companion  
**Phase:** 3 — Development & Implementation  
**Created:** May 26, 2026  
**Updated:** As needed

---

## What This Document Is

Your **engineering playbook for Phase 3 development**. Everything you need to implement the system is here or linked to the TDD. This is not a specification (see `technical-design-document.md` for that)—this is how to get started, what patterns to follow, and where to find answers.

---
## TDD
- location: /document/Phase2/technical-design-document.md

## Quick Start (5 Minutes)

### 1. Clone the Repository
```bash
```Already Done so ignore
git clone https://github.com/himankvats/kittencompanion.git
cd KITTENCOMPANION

```

### 2. Copy Environment File
```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### 3. Start Local Environment
```bash
docker-compose up
# Wait for all services to be healthy (check logs)
```

### 4. Run Database Migrations
```bash
# In a new terminal
./scripts/migrate.sh dev
```

### 5. You're Ready
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4566 (LocalStack)
- Postgres: localhost:5432
- Redis: localhost:6379

---

## Architecture At A Glance

### The System (High-Level)

```
User's Browser
    ↓ (HTTPS)
Vercel Frontend (Next.js)
    ↓ (REST API)
AWS API Gateway
    ↓ (Invokes)
Lambda Functions (Java + Node.js)
    ↓ (Query/Cache)
PostgreSQL + Redis
    ↓ (Async)
SQS/EventBridge
    ↓ (External APIs)
Claude API + SendGrid
```

### The Services (What You'll Build)

**Node.js/TypeScript Services:**
- `services/auth/` — OTP signup, JWT tokens
- `services/user/` — User profile management
- `services/notification/` — Email sending

**Java/Spring Boot Services:**
- `services/pet/` — Pet profile management
- `services/checkin/` — Daily check-in submission
- `services/triage/` — Concern triage + Claude integration
- `services/pattern-detection/` — Weekly digests
- `services/vet-summary/` — Report generation

---

## File Structure You'll Create

### The Directory Tree

```
new-cat-companion/
├── README.md                          (Project overview)
├── CLAUDE.md                          (This file)
├── Makefile                           (Common commands)
├── .env.example                       (Environment template)
├── docker-compose.yml                 (Local development)
│
├── frontend/
│   ├── app/                           (Next.js app directory)
│   ├── components/                    (React components)
│   ├── lib/                           (Utilities, API clients)
│   ├── pages/                         (Dynamic routes)
│   ├── styles/                        (Tailwind CSS)
│   ├── package.json
│   └── tsconfig.json
│
├── services/
│   ├── auth/
│   │   ├── src/index.ts               (Lambda handler)
│   │   ├── src/handlers/              (signup, verify, etc)
│   │   ├── src/services/              (OTP, JWT, email)
│   │   ├── src/utils/                 (validation, errors)
│   │   ├── tests/                     (Jest tests)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── user/                          (Similar structure)
│   │
│   ├── pet/
│   │   ├── src/main/java/com/newcat/pet/
│   │   │   ├── PetLambda.java         (Handler)
│   │   │   ├── controller/            (HTTP routing)
│   │   │   ├── service/               (Business logic)
│   │   │   ├── entity/                (JPA entities)
│   │   │   ├── dto/                   (Request/response)
│   │   │   ├── repository/            (Database access)
│   │   │   └── exception/             (Error handling)
│   │   ├── src/test/java/             (JUnit/Mockito tests)
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── checkin/                       (Similar to pet)
│   ├── triage/                        (Similar to pet)
│   ├── pattern-detection/             (Similar to pet)
│   ├── vet-summary/                   (Similar to pet)
│   └── notification/                  (Similar to auth)
│
├── infrastructure/
│   ├── template.yaml                  (SAM template)
│   ├── Makefile                       (Deployment commands)
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
│   │   ├── 004_create_acute_events.sql
│   │   ├── 005_create_digest_logs.sql
│   │   └── ... (remaining migrations)
│   └── seeds/
│       └── test-data.sql
│
├── docs/
│   ├── 02-planning/
│   │   ├── PRD-final.md
│   │   ├── system-design-document.md
│   │   └── technical-design-document.md
│   └── 03-implementation/
│       └── IMPLEMENTATION_LOG.md
│
└── .github/
    └── workflows/
        ├── test.yml
        ├── deploy-dev.yml
        └── deploy-prod.yml
```

---

## How to Implement Each Service

### EXAMPLE: Implementing the Auth Service

#### Step 1: Scaffold the Service
```bash
cd services/auth
npm init -y
npm install express jsonwebtoken pg dotenv @types/node typescript ts-node jest @types/jest
npm install --save-dev @types/express
```

#### Step 2: Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### Step 3: Create src/index.ts (Lambda Handler)
```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { signupHandler } from './handlers/signup';
import { verifyHandler } from './handlers/verify';
import { logger } from './utils/logger';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { path, httpMethod } = event;
  logger.info('Incoming request', { path, httpMethod });

  try {
    if (path === '/auth/signup' && httpMethod === 'POST') {
      return await signupHandler(event, context);
    } else if (path === '/auth/verify' && httpMethod === 'POST') {
      return await verifyHandler(event, context);
    }
    return { statusCode: 404, body: 'Not found' };
  } catch (error) {
    logger.error('Unhandled error', error as Error);
    return { statusCode: 500, body: 'Internal server error' };
  }
};
```

#### Step 4: Implement Handlers
Follow the pattern in `technical-design-document.md` Section 3.1 for `SignupHandler` and `VerifyHandler`.

#### Step 5: Write Tests
```bash
npm test
```

#### Step 6: Build
```bash
npm run build
```

#### Step 7: Deploy to AWS
This happens via SAM template (see Deployment section below).

### For Java Services
Same process, but:
- Use `mvn archetype:generate` to scaffold Spring Boot project
- Follow Maven structure (src/main/java, src/test/java)
- Use JUnit 5 + Mockito for testing
- `mvn clean package` to build

---

## Common Commands

### Local Development

**Start all services:**
```bash
docker-compose up
```

**View logs:**
```bash
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f localstack
```

**Run database migrations:**
```bash
./scripts/migrate.sh dev
```

**Seed test data:**
```bash
./scripts/seed.sh dev
```

**Stop all services:**
```bash
docker-compose down
```

**Reset everything (careful!):**
```bash
docker-compose down -v
docker-compose up
./scripts/migrate.sh dev
./scripts/seed.sh dev
```

### Building Services

**Build Node.js service:**
```bash
cd services/auth
npm install
npm run build
npm test
```

**Build Java service:**
```bash
cd services/pet
mvn clean package
mvn test
```

**Build all services:**
```bash
make build-all
```

### Deployment

**Deploy to dev:**
```bash
./infrastructure/scripts/deploy.sh dev us-east-1
```

**Deploy to staging:**
```bash
./infrastructure/scripts/deploy.sh staging us-east-1
```

**Deploy to production:**
```bash
./infrastructure/scripts/deploy.sh prod us-east-1
```

---

## Working With The Database

### Connect to Local Database

**Via psql:**
```bash
psql -h localhost -p 5432 -U devuser -d newcat_dev
```

**Password:** `devpassword` (from docker-compose.yml)

### Run a Migration

**Migrations live in `database/migrations/`**

```bash
# Run all pending migrations
./scripts/migrate.sh dev

# Rollback (careful!)
./scripts/rollback.sh dev
```

### View Data

```sql
-- List all users
SELECT id, email, first_name, last_name FROM users;

-- List all pets for a user
SELECT p.* FROM pets p 
JOIN users u ON u.id = p.user_id 
WHERE u.email = 'test@example.com';

-- List recent check-ins
SELECT c.*, p.name as pet_name FROM checkins c
JOIN pets p ON p.id = c.pet_id
ORDER BY c.created_at DESC
LIMIT 10;
```

### Insert Test Data

```bash
./scripts/seed.sh dev
```

This runs `database/seeds/test-data.sql` which inserts sample users, pets, and check-ins.

---

## Working With APIs

### Test an API Endpoint (Local)

**Using curl:**
```bash
# Sign up
curl -X POST http://localhost:4566/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Verify OTP (you'll see the OTP in logs)
curl -X POST http://localhost:4566/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"otp_token": "ACTUAL_OTP_HERE"}'
```

**Using Postman:**
1. Import `infrastructure/postman-collection.json`
2. Set environment to `Local`
3. Run requests

**Using VS Code REST Client:**
Create `requests.http`:
```http
### Sign up
POST http://localhost:4566/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "first_name": "John",
  "last_name": "Doe"
}

### Verify OTP
POST http://localhost:4566/auth/verify
Content-Type: application/json

{
  "otp_token": "123456"
}
```

---

## Testing

### Unit Tests

**Node.js:**
```bash
cd services/auth
npm test
npm test -- --coverage
```

**Java:**
```bash
cd services/pet
mvn test
mvn test jacoco:report  # Coverage report
```

### Integration Tests

**Run against local database:**
```bash
npm run test:integration
mvn verify
```

### End-to-End Tests

**Run full flow test (after docker-compose up):**
```bash
npm run test:e2e
```

This tests: signup → verify → create pet → submit check-in → flag concern.

### Test Coverage Target

- Unit tests: 80%+ coverage
- Integration tests: Critical paths
- E2E tests: Happy paths + error cases

---

## Debugging

### Debug Node.js Service Locally

**Add debug statement:**
```typescript
console.log('DEBUG:', { userId, petId, eatingLevel });
```

**Or use the VS Code debugger:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Auth Service",
      "program": "${workspaceFolder}/services/auth/dist/index.js",
      "outFiles": ["${workspaceFolder}/services/auth/dist/**/*.js"]
    }
  ]
}
```

### Debug Java Service Locally

**Add breakpoint in IDE (IntelliJ/VS Code):**
1. Click line number to add breakpoint
2. Right-click service in docker-compose.yml
3. Select "Debug"
4. IDE will connect to remote debugger

### View Lambda Logs

**CloudWatch Logs (after deployed):**
```bash
# View auth function logs
aws logs tail /aws/lambda/newcat-auth-dev --follow

# View specific error
aws logs filter-log-events \
  --log-group-name /aws/lambda/newcat-auth-dev \
  --filter-pattern "ERROR"
```

**Locally (via LocalStack logs):**
```bash
docker-compose logs localstack | grep lambda
```

---

## Key Patterns & Conventions

### Error Handling

**All errors should:**
1. Have an error code (e.g., `VALIDATION_ERROR`)
2. Have a message (human-readable)
3. Include context if helpful
4. Log the error with metadata

**Example (Node.js):**
```typescript
class CustomError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
  }
}

throw new CustomError(
  400,
  'INVALID_EMAIL',
  'Email format is invalid',
  { email: providedEmail }
);
```

**Example (Java):**
```java
throw new ValidationException("INVALID_EMAIL", "Email format is invalid");
```

### Input Validation

**Always validate before database operations:**
```typescript
if (!email || !isValidEmail(email)) {
  throw new CustomError(400, 'INVALID_EMAIL', 'Email must be valid');
}

if (!firstName || firstName.length > 100) {
  throw new CustomError(400, 'INVALID_NAME', 'First name must be 1-100 chars');
}
```

### Database Queries

**Always use parameterized queries:**
```typescript
// GOOD ✓
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
  [email]
);

// BAD ✗ (SQL injection risk)
const result = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### Async Operations

**Queue async work, don't block users:**
```typescript
// Don't make user wait for email
sendEmailAsync(email); // Fire and forget

// Return immediately
return { statusCode: 200, body: 'OTP sent' };
```

### Caching

**Cache database reads with TTL:**
```typescript
// Check cache first
const cached = await redis.get('pet:' + petId);
if (cached) return JSON.parse(cached);

// Query database
const pet = await db.query('SELECT * FROM pets WHERE id = $1', [petId]);

// Cache result (5 min TTL)
await redis.setex('pet:' + petId, 300, JSON.stringify(pet));

return pet;
```

---

## Before You Deploy

### Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Code reviewed (or self-reviewed)
- [ ] No console.log() statements left in production code
- [ ] Error handling covers all paths
- [ ] Database migrations tested
- [ ] Environment variables documented in `.env.example`
- [ ] API contracts match TDD exactly
- [ ] No hardcoded secrets (use Secrets Manager)
- [ ] Security headers in place
- [ ] Rate limiting configured
- [ ] Monitoring/logging enabled

### Run Pre-Deployment Tests

```bash
# Build everything
make build-all

# Run all tests
make test-all

# Check code quality
make lint-all

# Verify database migrations
./scripts/migrate.sh dev
./scripts/seed.sh dev

# Manual smoke test
curl http://localhost:4566/auth/signup -d '...'
```

---

## Deployment

### Deploy to AWS

**Prerequisites:**
- AWS account configured
- IAM permissions (Lambda, RDS, ElastiCache, API Gateway)
- Secrets Manager with: `jwt-secret`, `anthropic-api-key`, `sendgrid-api-key`, `db-credentials`

**Deploy:**
```bash
# Development
./infrastructure/scripts/deploy.sh dev us-east-1

# Staging
./infrastructure/scripts/deploy.sh staging us-east-1

# Production
./infrastructure/scripts/deploy.sh prod us-east-1
```

**What this does:**
1. Builds all services
2. Runs tests
3. Creates/updates CloudFormation stack
4. Deploys Lambda functions
5. Provisions RDS + Redis
6. Sets up API Gateway
7. Configures CloudWatch alarms
8. Returns API endpoint URL

### Verify Deployment

```bash
# Get API endpoint
aws apigateway get-rest-apis --region us-east-1

# Test API
curl https://{api-id}.execute-api.us-east-1.amazonaws.com/dev/auth/signup \
  -d '{...}'

# View Lambda logs
aws logs tail /aws/lambda/newcat-auth-dev --follow

# Check RDS connection
psql -h {rds-endpoint} -U admin -d newcat_prod
```

---

## Troubleshooting

### Problem: "Connection refused" to Postgres

**Solution:**
```bash
# Check if postgres container is running
docker-compose ps postgres

# If not, start it
docker-compose up postgres

# Check logs
docker-compose logs postgres
```

### Problem: "EADDRINUSE: address already in use :::5432"

**Solution:**
```bash
# Kill process using port 5432
lsof -i :5432  # Find process
kill -9 {PID}

# Or just use different port in .env
DB_PORT=5433
```

### Problem: Migration failed

**Solution:**
```bash
# Check migration status
psql -h localhost -d newcat_dev -c "SELECT * FROM schema_migrations;"

# If stuck, manually insert:
INSERT INTO schema_migrations (version) VALUES ('001');

# Then re-run
./scripts/migrate.sh dev
```

### Problem: Lambda function timeout

**Solution:**
- Increase timeout in SAM template (default 30s)
- Check for slow database queries
- Add connection pooling
- Review CloudWatch logs for bottleneck

### Problem: "Cannot find module 'xyz'"

**Solution:**
```bash
# Reinstall dependencies
npm ci  # (not npm install - uses lock file)

# For Java
mvn clean install
```

---

## Performance Optimization

### Database

**Optimize slow queries:**
```sql
-- Add index for frequently filtered columns
CREATE INDEX idx_checkins_pet_date ON checkins(pet_id, date);

-- Check query plan
EXPLAIN ANALYZE SELECT * FROM checkins WHERE pet_id = 'xyz';
```

**Connection pooling tuning (see TDD Section 5):**
- Max connections: 20
- Min idle: 2
- Idle timeout: 5 minutes

### Lambda

**Keep cold start low (<500ms):**
- Use provisioned concurrency for frequently-called functions
- Reduce Lambda package size (exclude dev dependencies)
- Use layers for shared code

**Monitor latency:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=newcat-auth-dev \
  --start-time 2026-05-26T00:00:00Z \
  --end-time 2026-05-26T23:59:59Z \
  --period 300 \
  --statistics Average,Maximum
```

### Caching

**Redis best practices:**
- Set TTL on all keys (e.g., 5 minutes)
- Use patterns for cache invalidation
- Monitor Redis memory usage

```typescript
// Good: Set TTL on cache
await redis.setex('user:' + userId, 300, JSON.stringify(user));

// Bad: No TTL (memory leak)
await redis.set('user:' + userId, JSON.stringify(user));
```

---

## Monitoring & Observability

### Logs

**Check logs locally:**
```bash
docker-compose logs -f auth
docker-compose logs -f pet
```

**Check logs in AWS:**
```bash
aws logs tail /aws/lambda/newcat-auth-dev --follow --filter-pattern "ERROR"
```

### Metrics

**Available CloudWatch metrics:**
- Lambda: Duration, Errors, Invocations, Throttles
- RDS: CPUUtilization, DatabaseConnections, QueryLatency
- API Gateway: 4XX, 5XX, Latency
- ElastiCache: CPUUtilization, EvictionRate, NetworkBytesIn

**Custom metrics example:**
```typescript
await cloudwatch.putMetricData({
  Namespace: 'NewCatCompanion',
  MetricData: [{
    MetricName: 'CheckinsSubmitted',
    Value: 1,
    Unit: 'Count',
    Timestamp: new Date()
  }]
});
```

### Alarms

**Key alarms to monitor:**
- Lambda error rate > 1%
- Lambda duration > 5 seconds
- RDS CPU > 80%
- API Gateway 5XX errors

See `technical-design-document.md` Section 10.3 for CloudWatch alarm configuration.

---

## Code Review Checklist

Before merging, ensure:

- [ ] Code follows naming conventions
- [ ] Error handling is comprehensive
- [ ] No hardcoded secrets
- [ ] Parameterized database queries
- [ ] Input validation present
- [ ] Tests pass locally
- [ ] Code is documented (JSDoc/Javadoc)
- [ ] No console.log() in production code
- [ ] Performance is acceptable
- [ ] Security review done
- [ ] Database migrations included
- [ ] API contracts match TDD

---

## Getting Help

### Where to Find Answers

1. **API Contract Questions?** → See `technical-design-document.md` Section 2
2. **Database Schema Questions?** → See `technical-design-document.md` Section 1
3. **Implementation Pattern Questions?** → See `technical-design-document.md` Section 3
4. **Testing Questions?** → See `technical-design-document.md` Section 7
5. **Deployment Questions?** → See `technical-design-document.md` Section 9
6. **Architecture Questions?** → See `system-design-document.md`
7. **Product Questions?** → See `PRD-final.md`

### Common Questions & Answers

**Q: Should I cache this database query?**
A: Yes, if it's accessed frequently and can be 5 minutes stale. See Caching section.

**Q: How do I know if my Lambda is slow?**
A: Check CloudWatch metrics. Target: <1s for most operations, <3s for LLM calls.

**Q: What do I do if a migration fails?**
A: Check logs, identify the issue, don't proceed. Database integrity is critical.

**Q: Can I skip writing tests?**
A: No. Aim for 80%+ coverage. Tests are your documentation.

**Q: What if I disagree with the TDD?**
A: Document your disagreement in a comment and discuss. If justified, update the TDD.

---

## Phase 3 Timeline

### Week 1-2: Auth & User Services
- [ ] Auth Lambda (signup, verify, refresh, logout)
- [ ] User Lambda (profile CRUD)
- [ ] JWT token integration
- [ ] Email/OTP integration
- [ ] Tests (unit + integration)

### Week 3: Pet Service & Check-in
- [ ] Pet Lambda (CRUD)
- [ ] Check-in Lambda (submission + history)
- [ ] Daily check-in feedback logic
- [ ] Redis caching
- [ ] Tests

### Week 4: Triage & LLM Integration
- [ ] Triage Lambda (template selection)
- [ ] Claude API integration
- [ ] Prompt engineering & validation
- [ ] SQS async processing
- [ ] Tests

### Week 5: Pattern Detection & Digest
- [ ] Pattern detection service
- [ ] Rule-based analysis
- [ ] Digest generation
- [ ] Weekly scheduler
- [ ] Tests

### Week 6: Vet Summary
- [ ] Vet summary generation
- [ ] Multi-step LLM calls
- [ ] HTML/PDF formatting
- [ ] Report caching
- [ ] Tests

### Week 7-8: Integration & Deployment
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Monitor & fix issues

---

## Final Notes

### You Have Everything You Need

The TDD is comprehensive. Before coding anything, find the relevant section:
- Need to implement a feature? → TDD Section 3
- Need to write a test? → TDD Section 7
- Need database help? → TDD Section 1
- Need deployment help? → TDD Section 9

### Code Quality Matters

This is a portfolio project. Write code you'd be proud to show in interviews:
- Clean code (no magic numbers, clear variable names)
- Good documentation (comments, JSDoc, README)
- Comprehensive tests
- Error handling
- Performance optimization

### Stay Flexible

Requirements may evolve. If you discover a better approach:
1. Document why
2. Update the TDD
3. Proceed with the new approach
4. Notify the team

### Celebrate Small Wins

Getting first service deployed? Awesome. First end-to-end test passing? Excellent. Keep momentum.

---

## Quick Reference

| Need | See |
|------|-----|
| Database schema | TDD Section 1 |
| API contracts | TDD Section 2 |
| Service code | TDD Section 3 |
| Testing examples | TDD Section 7 |
| Local setup | TDD Section 8 |
| Deployment | TDD Section 9 |
| Monitoring | TDD Section 10 |
| Security | TDD Section 11 |
| Architecture overview | SDD Section 1 |
| Data flows | SDD Section 2 |
| Features | PRD Section 1-2 |
| Success metrics | PRD Section 3 |

---

## You're Ready

You have:
- ✅ Complete specifications (TDD, SDD, PRD)
- ✅ Code examples in Java + Node.js
- ✅ Testing strategy
- ✅ Deployment configuration
- ✅ Local development setup
- ✅ This implementation guide

**Start coding. Reference the TDD. Ask questions. Ship it.**

Good luck! 🚀

---

*CLAUDE.md - Your implementation playbook. Keep this open while coding Phase 3.*

