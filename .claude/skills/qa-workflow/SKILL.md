# QA Workflow

> **Reference:** Phase 3 of the Three-Phase Workflow. See `orchestrator-specialist/SKILL.md` for workflow overview.
> This file contains the canonical QA harness CLI reference.

Phase 3 agent: Verifies implementation against acceptance criteria using the QA harness.

---

## Activation

Invoke when:
- Starting Phase 3 verification after implementation
- Builder completed code and produced `qa-checklist.md`
- Vercel preview deployment is ready

**Trigger keywords:** `verify`, `qa`, `phase 3`, `qa-checklist`

---

## CRITICAL: Fresh Context Protocol

This skill runs in a **fresh subprocess** to prevent context bleed from prior phases.

```typescript
Task({
  subagent_type: 'qa-workflow',
  prompt: `
    FRESH CONTEXT - Ignore prior conversation
    Bead: ${beadId}
    Preview URL: https://mantle-git-preview-...
    Iteration: ${iteration}/3

    Read: .beads/artifacts/${beadId}/qa-checklist.md
    Run QA harness and produce qa-report.md
  `
})
```

---

## Split Deployment URLs

| Service | URL |
|---------|-----|
| **Web (Vercel)** | `https://mantle-git-preview-darienlombardi-2455s-projects.vercel.app` |
| **API (Railway)** | `https://mantleapi-preview.up.railway.app` |

The QA harness needs BOTH URLs (test session endpoint lives on Railway).

---

## QA Checklist Format (CRITICAL)

The harness parses `qa-checklist.md` looking for specific patterns. **Incorrect format = 0/0 tests run.**

### Section Heading Format

```markdown
### Test 1: Description Here
### Test 2: Another Test
### AC1: Acceptance Criteria Style Also Works
```

**WRONG:** `### 1. Description` — missing `Test` prefix, uses `.` instead of `:`

### Required Sections Per Test

Each test MUST have an `**Actions:**` section with machine-parseable commands:

```markdown
### Test 1: Dashboard Loads

**Steps:**
1. Navigate to /dashboard
2. Verify welcome message displays

**Expected:** Dashboard renders correctly

**Actions:**
- navigate: /dashboard
- waitForLoadState: networkidle
- assertTextVisible: Welcome back
- assertElementVisible: heading "Dashboard"
```

### Action Syntax Reference

| Action | Syntax | Notes |
|--------|--------|-------|
| Navigate | `navigate: /path` | Relative to preview URL |
| Click button | `click: button "Label"` | Uses `getByRole('button')` |
| Click link | `click: link "Label"` | Uses `getByRole('link')` |
| Click text | `click: text "Label"` | Uses `getByText()` |
| Assert text visible | `assertTextVisible: Some text` | Fails if text appears multiple times |
| Assert element | `assertElementVisible: heading "Title"` | Use for headings to avoid duplicates |
| Assert URL | `assertUrlContains: /path` | Partial match |
| Wait | `waitForLoadState: networkidle` | Options: `load`, `domcontentloaded`, `networkidle` |

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| `assertTextVisible: Repositories` | Matches sidebar + heading + description (3 elements) | Use `assertElementVisible: heading "Repositories"` |
| Missing `**Actions:**` section | Test silently skipped, shows as 0/0 | Add Actions section |
| `### 1. Title` | Regex doesn't match | Use `### Test 1: Title` |
| Testing unauthenticated flow | Session is already injected by harness | Skip or test auth redirect differently |

---

## Protocol

1. **Load QA checklist** — `.beads/artifacts/<bead-id>/qa-checklist.md`
2. **Run QA harness** (see CLI reference below)
3. **Generate qa-report.md**
4. **Determine outcome:**

| Outcome | Action |
|---------|--------|
| **PASS** | `bd close <id> --reason "QA passed"` |
| **FAIL (< 3 iterations)** | Return to Phase 2 |
| **FAIL (= 3 iterations)** | `bd label add <id> needs-human` |

---

## QA Harness CLI Reference (Canonical)

```bash
bun run test:qa-harness -- \
  --preview-url=<url>              # Required: Vercel preview URL
  --checklist=<path>               # Required: Path to qa-checklist.md
  --bead-id=<id>                   # Required: Bead ID for artifact output
  --api-url=<url>                  # Railway API URL (for split deployments)
  --bypass-token=<token>           # Vercel protection bypass
  --skip-seed                      # Skip database seeding
  --headed                         # Run browser visibly (debugging)
  --iteration=<1-3>                # Track retry iteration (default: 1)
  --timeout=<seconds>              # Timeout in seconds (default: 300)
```

### Standard Usage

```bash
# Recommended: Split web/API deployment
bun run test:qa-harness -- \
  --preview-url=https://mantle-git-preview-darienlombardi-2455s-projects.vercel.app \
  --api-url=https://mantleapi-preview.up.railway.app \
  --checklist=.beads/artifacts/<bead-id>/qa-checklist.md \
  --bead-id=<bead-id> \
  --skip-seed
```

### Environment Variables

- `VERCEL_PROTECTION_BYPASS` — Bypass token for Vercel deployment protection
- `QA_API_URL` — Alternative to `--api-url` flag

### Authentication

The harness automatically:
1. Calls `POST /api/test/session` on Railway API
2. Injects session tokens into browser localStorage
3. Tests run as authenticated user (no manual OAuth)

---

## Error Handling

| Error Type | Counts as Failure? | Action |
|------------|-------------------|--------|
| Preview not ready | No | Retry 3x with 30s wait, report as "Environment Error" |
| Seed endpoint fails | No | Report as "Seed Error" |
| Harness timeout (> 5min) | Yes | Capture partial results, report as "Timeout" |

---

## Handoff on Failure

```
HANDOFF TO: <original-builder-skill>
PHASE: 2 (Implementation - Iteration N+1)
BEAD: <bead-id>
CONTEXT: QA failed, see qa-report.md
TASK: Fix issues identified in report
```
