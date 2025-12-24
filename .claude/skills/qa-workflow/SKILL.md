# QA Workflow

Phase 3 agent for the three-phase agentic coding workflow. Verifies implementation against acceptance criteria using the QA harness.

---

## Activation

Invoke this skill when:
- Starting Phase 3 verification after implementation
- Builder has completed code and produced `qa-checklist.md`
- A Vercel preview deployment is ready for testing
- User requests QA verification of a bead

**Trigger keywords:** `verify`, `qa`, `phase 3`, `test implementation`, `qa-checklist`

**Example triggers:**
- "Verify bead #bd-a1b2"
- "Run QA for the preferences feature"
- "Start Phase 3 verification"
- "Check if the implementation passes acceptance criteria"

---

## CRITICAL: Fresh Context Protocol

This skill is designed to run in a **fresh subprocess** to prevent context bleed from prior phases.

When spawned via Task tool, the QA agent:
1. **IGNORES** all prior conversation context
2. **ONLY reads** artifacts from `.beads/artifacts/<bead-id>/`
3. **ONLY knows** the preview URL and iteration count passed in prompt

```typescript
// Example Task tool invocation (by orchestrator)
Task({
  subagent_type: 'qa-workflow',
  prompt: `
    FRESH CONTEXT - Ignore prior conversation

    Bead: bd-a1b2
    Preview URL: https://mantle-xyz-abc123.vercel.app
    Iteration: 1/3

    Read: .beads/artifacts/bd-a1b2/qa-checklist.md
    Run QA harness and produce qa-report.md
  `
})
```

---

## Workflow Protocol

### Step 1: Load QA Checklist

Read the checklist produced by Builder in Phase 2:
```
.beads/artifacts/<bead-id>/qa-checklist.md
```

The checklist contains:
- Verification steps from the Builder
- Expected behaviors for each step
- Test data requirements
- Seed scenario to use

### Step 2: Prepare Environment

```bash
# Verify preview is accessible
curl -I <preview-url>/api/health/live

# Seed the preview with test data
curl -X POST <preview-url>/api/seed \
  -H "Content-Type: application/json" \
  -d '{"scenario": "<scenario-name>"}'
```

### Step 3: Run QA Harness

Execute the QA harness script:
```bash
bun run test:qa-harness -- \
  --preview-url=<preview-url> \
  --checklist=.beads/artifacts/<bead-id>/qa-checklist.md
```

The harness will:
1. Reset and seed the preview environment
2. Capture application logs
3. Run browser-based verification (Playwright)
4. Generate structured results

### Step 4: Generate QA Report

Write results to:
```
.beads/artifacts/<bead-id>/qa-report.md
```

Use template from `references/qa-report-template.md`.

### Step 5: Determine Outcome

| Outcome | Action |
|---------|--------|
| **PASS** | Close bead, add `qa:passed` label |
| **FAIL (iteration < 3)** | Update bead note, return to Phase 2 |
| **FAIL (iteration = 3)** | Add `needs-human` label, escalate |

---

## Verification Categories

### Functional Verification
- [ ] Primary user flow works
- [ ] All acceptance criteria met
- [ ] Error handling works correctly
- [ ] Edge cases handled

### Technical Verification
- [ ] No console errors
- [ ] No network errors (4xx, 5xx)
- [ ] Performance acceptable (< 3s load)
- [ ] Accessibility basics pass

### Test Verification
- [ ] Unit tests pass (`bun run test`)
- [ ] E2E tests pass (`bun run test:e2e`)
- [ ] No test regressions

---

## Exit Conditions

### On PASS

```bash
bd close <bead-id> --reason "QA passed - all acceptance criteria verified"
bd label add <bead-id> qa:passed
```

The bead is ready for PR merge.

### On FAIL (Can Retry)

```bash
bd update <bead-id> --note "QA Iteration N failed: [summary of failures]"
bd label add <bead-id> qa:iteration-N
```

Return to Phase 2 with:
```
HANDOFF TO: <original-builder-skill>
PHASE: 2 (Implementation - Iteration N+1)
BEAD: <bead-id>
CONTEXT: QA failed, see qa-report.md
TASK: Fix issues identified in qa-report.md
FILES: .beads/artifacts/<bead-id>/qa-report.md
```

### On FAIL (Max Iterations)

```bash
bd label add <bead-id> needs-human
bd update <bead-id> --note "Max iterations (3) reached, escalating to human review"
```

Human reviews by running:
```bash
bd ready --label needs-human
```

---

## QA Harness Commands

```bash
# Full QA harness run
bun run test:qa-harness -- \
  --preview-url=<url> \
  --checklist=<path>

# Just verify preview is up
bun run test:qa-harness:health -- --preview-url=<url>

# Just seed the preview
bun run test:qa-harness:seed -- \
  --preview-url=<url> \
  --scenario=<name>

# Just run verification (no seed)
bun run test:qa-harness:verify -- \
  --preview-url=<url> \
  --checklist=<path>
```

---

## Artifact Location

```
.beads/artifacts/<bead-id>/
├── plan.md           # From Phase 1 (Planner)
├── qa-checklist.md   # From Phase 2 (Builder)
└── qa-report.md      # From Phase 3 (QA) ← You write this
```

---

## Error Handling

### Preview Not Ready

If preview URL returns non-200:
1. Wait 30 seconds and retry (up to 3 times)
2. If still failing, report in qa-report.md as "Environment Error"
3. This does NOT count as QA iteration failure

### Seed Endpoint Fails

If seeding fails:
1. Check if seed endpoint exists
2. Verify scenario name is valid
3. Report as "Seed Error" in qa-report.md
4. This does NOT count as QA iteration failure

### Harness Timeout

If harness takes > 5 minutes:
1. Capture partial results
2. Report as "Timeout" in qa-report.md
3. This DOES count as QA iteration failure

---

## Handoffs

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes QA tasks here |
| Builder skills | After implementation complete |

| Downstream | When |
|------------|------|
| Builder skills | On failure, return to Phase 2 |
| Human reviewer | On max iterations (needs-human) |

---

## Validation Commands

```bash
# Check bead status
bd show <bead-id>

# Verify artifacts exist
ls -la .beads/artifacts/<bead-id>/

# Check current labels
bd show <bead-id> | grep -i label

# View qa-report
cat .beads/artifacts/<bead-id>/qa-report.md
```
