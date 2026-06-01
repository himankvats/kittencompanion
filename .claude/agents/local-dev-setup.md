# Local Dev Setup Agent

**Skill:** `/dev-setup` or `/setup-dev`  
**Purpose:** Bootstrap the local development environment with one command

## What This Agent Does

When invoked, this agent will:

1. **Check Docker** — Verify Docker is running; prompt user to start if not
2. **Pull Latest** — Fetch latest migrations from git
3. **Start Services** — Run `docker-compose up` and wait for all services to be healthy
4. **Run Migrations** — Execute `./infrastructure/scripts/migrate.sh dev`
5. **Seed Data** — Run `./infrastructure/scripts/seed.sh dev` (if exists)
6. **Print Summary** — Display ready-to-use endpoints:
   ```
   ✅ Local Dev Environment Ready!
   
   Frontend:  http://localhost:3000
   API Gateway (LocalStack): http://localhost:4566
   Database: localhost:5432 (devuser/devpassword)
   Redis: localhost:6379
   ```
7. **Smoke Test** — Run a quick test curl to verify API is responding
8. **Error Handling** — If any step fails, show error and suggest next debug steps

## Implementation Notes

- Checks for `.env.local` file; copies from `.env.example` if missing
- Waits for postgres/redis healthchecks before running migrations
- Runs migrations idempotently (safe to run multiple times)
- On failure, prints which step failed and how to debug (e.g., `docker-compose logs postgres`)
- Should be run from the repo root directory

## Usage

```bash
# From repo root
/dev-setup

# Or explicitly
/setup-dev
```

## Expected Output

```
Checking Docker...
✓ Docker is running

Pulling latest migrations...
✓ Already up to date

Starting services (this may take 30 seconds)...
✓ postgres is healthy
✓ redis is healthy
✓ localstack is healthy

Running migrations...
✓ 9 migrations applied (0 new)

Seeding test data...
✓ Added 3 test users, 5 test pets, 15 test check-ins

✅ Local Dev Environment Ready!

Frontend:        http://localhost:3000
API Gateway:     http://localhost:4566
Database:        localhost:5432
Redis:           localhost:6379

Smoke test (POST /auth/signup)...
✓ API is responding

You're all set! Go build something awesome. 🚀
```

## Troubleshooting

If a step fails, the agent will suggest:
- For Docker: "Docker is not running. Start it with: `open /Applications/Docker.app`"
- For migrations: Show the migration error and suggest `docker-compose logs postgres`
- For services: Show logs for the failing service and suggest checking `.env` vars

---

## Technical Details

### File References
- Config: `.env.example`, `.env.local`
- Scripts: `./infrastructure/scripts/migrate.sh`, `./infrastructure/scripts/seed.sh`
- Docker: `docker-compose.yml`
- DB: `./database/migrations/`

### Dependencies
- Docker (for containers)
- docker-compose (for orchestration)
- psql (for migration runner, or embedded in script)
- bash/zsh shell

### Safety
- All commands are idempotent (safe to run multiple times)
- No data is deleted (only migrations applied, test data seeded)
- Easy to rollback: `docker-compose down -v` clears everything
