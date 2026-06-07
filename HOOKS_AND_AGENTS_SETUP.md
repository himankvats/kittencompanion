# 🚀 Hooks & Agents Quick Start

## What Was Added

This document describes the automated development workflow improvements just added to Kitten Companion.

### Git Hooks (Automatic)
- **Pre-commit** — Linting, type checks, secret scanning, migration validation
- **Pre-push** — Full test suite, compilation, security audit

### Claude Code Hooks (Automatic)
- **On file edit** — Real-time validation when you modify `.env`, migrations, handlers, etc.
- **On file create** — Auto-scaffold services, tests, migration rollback comments

### Agents (On-Demand)
- **`/dev-setup`** — Bootstrap local environment in 1 minute
- **`/coverage-report`** — Track test coverage, catch regressions

---

## Quick Setup

### For New Devs (Cloning Repo)

After `git clone`, run:

```bash
git config core.hooksPath .githooks
```

That's it! Hooks are now active.

### Local Dev Setup

```bash
/dev-setup
```

Returns:
```
✅ Local Dev Environment Ready!
Frontend: http://localhost:3000
API Gateway: http://localhost:4566
Postgres: localhost:5432
Redis: localhost:6379
```

---

## How the Hooks Work

### Pre-Commit (Before Each Commit)

```bash
git commit -m "my changes"
# Hook runs automatically:
# ✓ Lints code (ESLint, Prettier)
# ✓ Type checks (tsc)
# ✓ Validates migrations
# ✓ Scans for secrets
# ✓ Checks dependencies

# If all pass → commit succeeds
# If any fail → commit blocked (see errors above)
```

**Skip with:** `git commit --no-verify`

### Pre-Push (Before Each Push)

```bash
git push origin main
# Hook runs automatically:
# ✓ Compiles all services
# ✓ Runs test suite (for changed services)
# ✓ Security audit (OWASP patterns)

# If all pass → push succeeds
# If tests fail → push blocked

# Skip with: git push --no-verify
```

### Claude Code Hooks (Automatic Prompts)

When you edit or create files, Claude Code prompts appear:

```
📝 Modified: database/migrations/010_add_pet_age_index.sql

Claude says: "Ensure the migration: (1) Is idempotent, 
(2) Has a rollback comment..."
```

These provide real-time guidance — just follow the suggestions!

---

## On-Demand Agents

### `/dev-setup` — Local Environment

```bash
# Bootstrap everything
/dev-setup

# Does:
# - Check Docker is running
# - Start postgres, redis, localstack
# - Run migrations
# - Seed test data
# - Print endpoints
# - Smoke test API
```

### `/coverage-report` — Test Coverage

```bash
# Generate coverage report
/coverage-report

# Output:
# Coverage Report
# ══════════════════
# ✅ auth:     82%
# ✅ user:     91%
# ⚠️  pet:      75% (was 78%, -3%)
# ❌ checkin:  68% (was 72%, -4%)
# 
# Overall: 80% (target met!)
```

---

## Files Added

```
.githooks/
├── pre-commit          # Linting, types, secrets
└── pre-push            # Tests, security audit

.claude/
├── settings.json       # Claude Code hook config
├── hooks/
│   └── README.md       # Hooks documentation
└── agents/
    ├── README.md       # Agents overview
    ├── local-dev-setup.md
    └── test-coverage-tracker.md
```

---

## Troubleshooting

### Hooks not running?

```bash
# Re-configure hooks
git config core.hooksPath .githooks

# Verify they're installed
git config core.hooksPath
# Output: .githooks ✓
```

### "Permission denied" on hooks?

```bash
chmod +x .githooks/*
```

### "Secret detected" but it's just test data?

```bash
# Skip this check for this commit
git commit --no-verify
```

---

## Next Steps

1. ✅ **Try it out:** `git commit` and watch pre-commit hook run
2. ✅ **Setup local dev:** `/dev-setup`
3. ✅ **Check coverage:** `/coverage-report`
4. ✅ **Read full docs:** See `.claude/hooks/README.md` and agent files

---

## Reference

| What | Command | When |
|------|---------|------|
| Run pre-commit checks manually | `./.githooks/pre-commit` | Anytime |
| Run pre-push checks manually | `./.githooks/pre-push` | Anytime |
| Skip pre-commit hook | `git commit --no-verify` | When needed |
| Skip pre-push hook | `git push --no-verify` | When needed |
| Setup dev environment | `/dev-setup` | First time |
| Check test coverage | `/coverage-report` | After testing |

---

**Questions?** See `.claude/hooks/README.md` for full documentation.
