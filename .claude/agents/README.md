# 🤖 Agents

Automated agents that scaffold, test, and maintain the Kitten Companion project.

## Available Agents

### Local Dev Setup Agent
**Command:** `/dev-setup` or `/setup-dev`

Bootstrap your local development environment in one command:
- Verify Docker is running
- Start all services (postgres, redis, localstack)
- Run database migrations
- Seed test data
- Verify API is responding

**File:** [local-dev-setup.md](./local-dev-setup.md)

### Test Coverage Tracker Agent
**Command:** `/coverage-report`

Track test coverage across Node.js and Java services:
- Extract coverage from Jest + JaCoCo reports
- Compare against main branch
- Alert on regressions
- Suggest files needing tests
- Generate JSON reports for CI/CD

**File:** [test-coverage-tracker.md](./test-coverage-tracker.md)

---

## How to Use

### Manual Invocation

```bash
# One-time local setup
/dev-setup

# Check test coverage
/coverage-report
```

### Integration with Git Hooks

These agents are referenced by:
- **Pre-push hook** — May suggest running `/coverage-report` if coverage dropped
- **Pre-commit hook** — May suggest running `/dev-setup` if migrations changed
- **Claude hooks** — May trigger agent scaffolding when you create new services

---

## Development Notes

### Adding New Agents

1. Create a `.md` file in this directory with format:
   ```markdown
   # Agent Name
   **Skill:** `/command-name`
   **Purpose:** What it does
   
   ## Implementation
   ... details ...
   ```

2. Add the agent to `.claude/settings.json` under `agents` section

3. Document in CLAUDE.md Section 8.7 (Agents)

### Agent Conventions

- Use `/command-name` format (lowercase, hyphens)
- Provide clear success/failure output
- Support `--help` flag
- Non-blocking (don't fail CI/CD)
- Idempotent (safe to run multiple times)

---

## See Also

- [Hooks README](./../hooks/README.md)
- [CLAUDE.md Implementation Guide](./../CLAUDE.md)
- [TDD Technical Design Document](./../../../document/Phase\ 2/technical-design-document.md)
