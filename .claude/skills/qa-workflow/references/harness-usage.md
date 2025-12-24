# QA Harness Usage

Reference guide for running the QA harness in Phase 3 verification.

---

## Overview

The QA harness automates the verification cycle:
1. **Reset** - Clean environment state
2. **Seed** - Load test data scenario
3. **Verify** - Run browser-based checks
4. **Report** - Generate structured results

---

## Commands

### Full Harness Run

```bash
bun run test:qa-harness -- \
  --preview-url=https://mantle-xyz.vercel.app \
  --checklist=.beads/artifacts/bd-a1b2/qa-checklist.md \
  --scenario=with-test-user
```

**Options:**
| Option | Required | Description |
|--------|----------|-------------|
| `--preview-url` | Yes | Vercel preview deployment URL |
| `--checklist` | Yes | Path to qa-checklist.md |
| `--scenario` | No | Seed scenario name (defaults to checklist's scenario) |
| `--headless` | No | Run browser in headless mode (default: true) |
| `--timeout` | No | Test timeout in ms (default: 300000 / 5 min) |

### Health Check Only

Verify preview is accessible before running full harness:

```bash
bun run test:qa-harness:health -- \
  --preview-url=https://mantle-xyz.vercel.app
```

Returns 0 if healthy, 1 if not.

### Seed Only

Reset and seed without running verification:

```bash
bun run test:qa-harness:seed -- \
  --preview-url=https://mantle-xyz.vercel.app \
  --scenario=with-patterns
```

### Verify Only

Run verification without seeding (use existing state):

```bash
bun run test:qa-harness:verify -- \
  --preview-url=https://mantle-xyz.vercel.app \
  --checklist=.beads/artifacts/bd-a1b2/qa-checklist.md
```

---

## Seed Scenarios

Available scenarios in `packages/test-utils/src/scenarios/`:

| Scenario | Description | Data Created |
|----------|-------------|--------------|
| `empty-repo` | Clean state, no data | User account only |
| `with-test-user` | Basic test user | User + auth session |
| `with-patterns` | Sample patterns | User + 5 sample patterns |
| `with-repos` | Connected repos | User + 3 GitHub repos |
| `failing-build` | Error state | User + failed extraction job |

### Creating Custom Scenarios

```typescript
// packages/test-utils/src/scenarios/my-scenario.ts
import { BaseScenario } from './base-scenario';
import { createUser, createPattern } from '../factories';

export class MyScenario extends BaseScenario {
  name = 'my-scenario';

  async seed(db: Database) {
    const user = await db.insert(users).values(
      createUser({ email: 'test@example.com' })
    );

    await db.insert(patterns).values([
      createPattern({ userId: user.id }),
      createPattern({ userId: user.id }),
    ]);
  }

  async cleanup(db: Database) {
    await db.delete(patterns).where(eq(patterns.userId, this.userId));
    await db.delete(users).where(eq(users.id, this.userId));
  }
}
```

---

## Harness Output

### Console Output

```
QA Harness v1.0.0
================

Preview URL: https://mantle-xyz.vercel.app
Checklist: .beads/artifacts/bd-a1b2/qa-checklist.md
Scenario: with-test-user

[1/4] Health check... OK (423ms)
[2/4] Seeding... OK (1.2s)
[3/4] Running verifications...
  ✓ AC1: User can save preferences (2.1s)
  ✓ AC2: User can retrieve preferences (1.8s)
  ✓ AC3: Preferences persist across sessions (3.4s)
  ✓ Test 1: Save and Retrieve Flow (1.9s)
  ✗ Test 2: Invalid Preferences Rejected
    Expected 400, got 500
[4/4] Generating report...

Summary: 4/5 passed
Report: .beads/artifacts/bd-a1b2/qa-report.md
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | One or more checks failed |
| 2 | Environment error (preview not ready) |
| 3 | Seed error |
| 4 | Timeout |

---

## Troubleshooting

### Preview Not Ready

```
Error: Health check failed - 503 Service Unavailable
```

**Solutions:**
1. Wait for Vercel deployment to complete
2. Check Vercel dashboard for build errors
3. Verify preview URL is correct

### Seed Fails

```
Error: Seed endpoint returned 403
```

**Solutions:**
1. Ensure running against preview (not production)
2. Check `VERCEL_ENV` is set correctly
3. Verify seed route is mounted

### Timeout

```
Error: Harness timeout after 300000ms
```

**Solutions:**
1. Increase timeout: `--timeout=600000`
2. Check for infinite loops in tests
3. Verify preview performance

### Screenshot Failures

```
Error: Could not capture screenshot
```

**Solutions:**
1. Check Playwright is installed: `bunx playwright install`
2. Verify browser binary exists
3. Check disk space for screenshot storage

---

## Integration with CI

For GitHub Actions:

```yaml
qa-verify:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Bun
      uses: oven-sh/setup-bun@v1

    - name: Install dependencies
      run: bun install

    - name: Install Playwright
      run: bunx playwright install --with-deps

    - name: Wait for Vercel
      uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        max_timeout: 300

    - name: Run QA Harness
      run: |
        bun run test:qa-harness -- \
          --preview-url=${{ env.VERCEL_PREVIEW_URL }} \
          --checklist=.beads/artifacts/${{ github.event.pull_request.head.ref }}/qa-checklist.md

    - name: Upload Report
      uses: actions/upload-artifact@v4
      with:
        name: qa-report
        path: .beads/artifacts/*/qa-report.md
```

---

## File Locations

| File | Purpose |
|------|---------|
| `e2e/harness/index.ts` | Harness entry point |
| `e2e/harness/qa-harness.ts` | Core harness logic |
| `e2e/harness/seed-preview.ts` | Seed scenario loader |
| `e2e/harness/report-generator.ts` | Report generation |
| `packages/test-utils/src/scenarios/` | Seed scenarios |
