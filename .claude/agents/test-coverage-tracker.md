# Test Coverage Tracker Agent

**Skill:** `/coverage-report` (manual) or automatic after test runs  
**Purpose:** Track test coverage across all services and alert on regressions

## What This Agent Does

When invoked (manually or automatically after `make test-all`), this agent will:

1. **Extract Coverage Data**
   - Node.js: Parse Jest coverage from stdout or `.coverage/` directory
   - Java: Parse JaCoCo reports from `target/site/jacoco/`
   - Calculate per-service coverage percentage

2. **Compare Against Baseline**
   - Load previous baseline from `.coverage-baseline.json` (if exists)
   - Compare main branch coverage (if available): `git show origin/main:.coverage-baseline.json`
   - Calculate delta (↑ increase, ↓ decrease)

3. **Detect Regressions**
   - ⚠️ Warn if any service drops > 5% coverage
   - ❌ Alert if overall coverage falls below 80% target
   - Suggest files with lowest coverage that need tests

4. **Generate Report**
   ```
   Coverage Report (main branch vs. current)
   ════════════════════════════════════════
   ✅ auth          82% (was 81% on main, +1%)
   ✅ user          91% (was 91% on main,  ±0%)
   ⚠️  pet           75% (was 78% on main, -3%) ← dropped 3%
   ⚠️  checkin       68% (was 72% on main, -4%) ← dropped 4%
   ✅ triage        84% (was 83% on main, +1%)
   ✅ pattern-det   77% (was 76% on main, +1%)
   
   Overall:         80% (target: 80%) ✓
   ────────────────────────────────────────
   Lowest coverage files:
   - pet/src/service/PetService.java (65%)
   - checkin/src/handlers/CheckinHandler.ts (58%)
   ```

5. **Identify Gaps**
   - List functions/classes with zero coverage
   - Suggest specific test cases to write
   - Link to relevant files in codebase

6. **Save Baseline**
   - Write `.coverage-baseline.json` for next comparison
   - Store current coverage snapshot with timestamp

7. **Output Options**
   - Console: Pretty-printed report with colors
   - JSON: `.coverage-report.json` for CI/CD pipelines
   - GitHub: (Optional) Comment on PR with coverage diff

## Implementation Notes

- Runs non-blocking (doesn't fail the build if coverage is low, just warns)
- Compares against `origin/main` if available, otherwise stores as new baseline
- Ignores test files when calculating coverage
- Handles both Node.js (Jest) and Java (JaCoCo) coverage formats
- Can be integrated into CI/CD as a post-test step

## Usage

### Manual
```bash
# Generate coverage report
/coverage-report

# Generate and save to file
/coverage-report --save
```

### Automatic (after tests)
Runs automatically after `make test-all` or `mvn test` + `npm test` in any service.

## Expected Output

```
📊 Generating test coverage report...

Extracting coverage from services...
  ✓ auth (82%)
  ✓ user (91%)
  ✓ pet (75%)
  ✓ checkin (68%)
  ✓ triage (84%)
  ✓ pattern-detection (77%)

Comparing against main branch...
  auth:    +1% (81% → 82%)
  pet:     -3% (78% → 75%) ⚠️
  checkin: -4% (72% → 68%) ⚠️

📈 Coverage Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall: 80% (target: 80%) ✓

Files needing attention:
  1. pet/src/service/PetService.java (65%) — add tests for updatePet edge cases
  2. checkin/src/handlers/CheckinHandler.ts (58%) — add error handling tests
  3. pattern-detection/src/rules.java (52%) — test all rule branches

⚠️ Alert: pet service coverage dropped 3% since main
  → Consider adding tests before merging
```

## Report Files

After running, generates:

- `.coverage-report.json` — Machine-readable JSON with full metrics
- `.coverage-baseline.json` — Current baseline for next comparison
- Console output — Human-readable summary

Example `.coverage-report.json`:
```json
{
  "timestamp": "2026-05-31T21:30:00Z",
  "overall": 80,
  "target": 80,
  "services": {
    "auth": {
      "coverage": 82,
      "previous": 81,
      "delta": 1,
      "files": { "index.ts": 85, "handlers/signup.ts": 78 }
    }
  },
  "lowestCoverage": [
    { "file": "pet/src/service/PetService.java", "coverage": 65 }
  ]
}
```

## CI/CD Integration

### Example: GitHub Actions
```yaml
- name: Test & Report Coverage
  run: make test-all && /coverage-report --save

- name: Comment PR with Coverage
  if: github.event_name == 'pull_request'
  uses: comment-coverage@v1
  with:
    report: .coverage-report.json
```

### Example: GitLab CI
```yaml
test:coverage:
  script:
    - make test-all
    - /coverage-report --save
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: .coverage-report.json
```

---

## Technical Details

### File References
- Coverage reports: `services/*/target/site/jacoco/` (Java) or `.coverage/` (Node.js)
- Baselines: `.coverage-baseline.json`, `.coverage-report.json`
- Git reference: `origin/main` (for comparison)

### Supported Formats
- **Jest** (Node.js): Parses stdout or JSON summary
- **JaCoCo** (Java): Parses HTML reports or XML exports

### Dependencies
- Each service must have test coverage reporting enabled:
  - Node.js: Jest with coverage (add `--coverage` to test script)
  - Java: JaCoCo Maven plugin configured

### Safety
- Read-only operation (only generates reports, doesn't modify source)
- Non-blocking (warnings don't fail CI/CD)
- Works without `origin/main` (uses local baseline as fallback)
