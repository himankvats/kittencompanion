# 🪝 Hooks & Agents Setup

This directory contains automated development workflow enhancements for Kitten Companion.

## Git Hooks (`.githooks/`)

Automatically configured via `git config core.hooksPath = .githooks`. These hooks enforce code quality before commits and pushes.

### Pre-commit Hook (`.githooks/pre-commit`)

Runs **before every commit** to validate staged changes:

- **Linting & Formatting** — ESLint for Node.js, Prettier formatting checks
- **Type Checking** — TypeScript (`tsc --noEmit`)
- **Migration Validation** — Ensures migrations are idempotent and have rollbacks
- **Secret Scanning** — Detects hardcoded API keys, passwords, tokens
- **Dependency Audit** — `npm audit` for vulnerable packages

**Bypass:** `git commit --no-verify`

### Pre-push Hook (`.githooks/pre-push`)

Runs **before every push** to validate the full changeset:

- **Compilation** — Ensures all services compile (`npm run build`, `mvn clean compile`)
- **Test Suite** — Runs tests for changed services only
- **Security Audit** — OWASP Top 10 pattern scanning (SQL injection, secrets, JWT validation)

**Bypass:** `git push --no-verify`

---

## Claude Code Hooks (`.claude/settings.json`)

Provide real-time guidance when you edit or create files:

### File Modification Hooks

**`.env.example`** — Validates environment variables are documented  
**`pom.xml` / `package.json`** — Checks for dependency version conflicts  
**Database migrations** — Ensures migrations are idempotent with rollbacks  
**Lambda handlers** — Verifies they match API contracts  

### File Creation Hooks

**New Java services** — Auto-scaffold repository + tests  
**New TypeScript handlers** — Auto-scaffold types + tests  
**New migrations** — Auto-add rollback comment block  

---

## Agents

### Local Dev Setup Agent (`/dev-setup`)

One-command local environment setup:

```bash
/dev-setup
```

Does:
- ✅ Check Docker is running
- ✅ Pull latest migrations
- ✅ Start `docker-compose up`
- ✅ Run migrations
- ✅ Seed test data
- ✅ Print ready-to-use endpoints
- ✅ Smoke test the API

**See:** [local-dev-setup.md](./agents/local-dev-setup.md)

### Test Coverage Tracker Agent (`/coverage-report`)

Track test coverage across all services:

```bash
/coverage-report
```

Does:
- 📊 Extract coverage from Jest (Node) + JaCoCo (Java)
- 🔄 Compare against main branch
- ⚠️ Alert on regressions (>5% drop)
- 📈 Generate JSON + console reports
- 💡 Suggest files needing tests

**See:** [test-coverage-tracker.md](./agents/test-coverage-tracker.md)

---

## Setup Verification

After cloning the repo, hooks are **automatically configured**:

```bash
# Verify hooks are installed
git config core.hooksPath
# Output: .githooks

# List hook files
ls -la .githooks/
# pre-commit  pre-push
```

No additional setup required! 🎉

---

## Quick Reference

| Trigger | When | How to Skip |
|---------|------|-----------|
| **pre-commit** | Before `git commit` | `git commit --no-verify` |
| **pre-push** | Before `git push` | `git push --no-verify` |
| **File modification** | After you edit `.env.example`, migrations, etc. | Prompts appear in Claude Code |
| **File creation** | After you create new service/handler/migration | Prompts appear in Claude Code |
| `/dev-setup` | When you run the command | Manual, one-shot |
| `/coverage-report` | When you run the command or after tests | Manual or automatic |

---

## Troubleshooting

### "Hooks not running after clone"

Git doesn't auto-configure hooks on clone. Run this once:

```bash
git config core.hooksPath .githooks
```

Or set it globally:

```bash
git config --global core.hooksPath .githooks
```

### "pre-commit failed: No such file or directory"

The hook scripts may not be executable:

```bash
chmod +x .githooks/*
```

### "Claude hooks not triggering"

Ensure `.claude/settings.json` exists:

```bash
ls -la .claude/settings.json
```

If missing, check Claude Code settings in your IDE.

---

## Documentation

- **CLAUDE.md** — Implementation guide (Section 8.5 & 8.6)
- **TDD** — API contracts (Section 2)
- **Makefile** — Build targets

---

**Questions?** See [CLAUDE.md](.claude/CLAUDE.md) Section 8.5-8.6 for full documentation.
