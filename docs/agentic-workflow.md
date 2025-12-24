# Agentic Workflow: Claude Code + Agent Harness

This document describes how Claude Code interacts with the Mantle agent harness to complete beads tasks end-to-end using a three-phase workflow.

---

## Overview

The agentic workflow enables Claude Code to autonomously complete development tasks with built-in quality assurance. Work is tracked through beads (issues), and each task flows through three distinct phases with artifact-based handoffs.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLAUDE CODE SESSION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   CLAUDE.md │───▶│   Skills    │───▶│    Beads    │───▶│  Artifacts  │  │
│  │  (context)  │    │ (.claude/)  │    │ (.beads/)   │    │  (output)   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                  │                  │                  │          │
│         ▼                  ▼                  ▼                  ▼          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      THREE-PHASE WORKFLOW                            │   │
│  │   Phase 1            Phase 2              Phase 3                    │   │
│  │   Planning    →     Implementation   →   Verification               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│                          ┌─────────────────┐                               │
│                          │  Vercel Preview │                               │
│                          │  + Seed API     │                               │
│                          └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Session Lifecycle

### 1. Session Initialization

When Claude Code starts a session:

```
1. Load CLAUDE.md → Project context, conventions, tech stack
2. Identify available skills → .claude/skills/*/SKILL.md
3. Check beads state → bd ready (find actionable work)
```

**Key Files:**
- `CLAUDE.md` - Project overview, API routes, conventions
- `.claude/skills/*/SKILL.md` - Domain expertise definitions

### 2. Skill Selection

Claude Code selects skills based on priority:

| Priority | Trigger | Example |
|----------|---------|---------|
| 1 | Explicit user request | "use the hono-specialist skill" |
| 2 | File path patterns | Editing `apps/api/src/routes/*` → hono-specialist |
| 3 | Task keywords | "plan", "phase 1" → planning-workflow |
| 4 | Default fallback | Ambiguous task → orchestrator-specialist |

### 3. Bead Selection

```bash
# Find available work (no blockers)
bd ready

# Claude picks based on priority or user direction
bd show <bead-id>
```

---

## Phase 1: Planning

### Purpose
Analyze the bead requirements and produce a detailed implementation plan.

### Entry Conditions
- Bead selected from `bd ready`
- No existing `plan.md` artifact
- Phase label not yet set

### Workflow

```
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1: PLANNING                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LOAD SKILL                                               │
│     cat .claude/skills/planning-workflow/SKILL.md            │
│     cat .claude/skills/planning-workflow/references/*        │
│                                                              │
│  2. LOAD BEAD CONTEXT                                        │
│     bd show <bead-id>                                        │
│     → Title, description, acceptance criteria                │
│     → Dependencies, labels, priority                         │
│                                                              │
│  3. ANALYZE CODEBASE                                         │
│     Task tool with Explore agent                             │
│     → Existing patterns                                      │
│     → File structure                                         │
│     → Related implementations                                │
│                                                              │
│  4. WRITE PLAN ARTIFACT                                      │
│     mkdir -p .beads/artifacts/<bead-id>/                     │
│     Write .beads/artifacts/<bead-id>/plan.md                 │
│                                                              │
│  5. TRANSITION                                               │
│     bd update <bead-id> --status in_progress                 │
│     bd label add <bead-id> phase:building                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Plan Artifact Structure

```markdown
# Implementation Plan: <bead-title>

## Bead Reference
- ID: <bead-id>
- Priority: P<N>
- Type: <type>

## Summary
<2-3 sentence overview>

## Acceptance Criteria Mapping
| AC | Implementation Approach |
|----|------------------------|
| AC1 | ... |

## Implementation Steps
1. **Step description**
   - Files: `path/to/file.ts`
   - Changes: ...

## Test Strategy
- Unit tests: ...
- Integration tests: ...
- E2E tests: ...

## Risk Considerations
- Risk 1: <risk> → Mitigation: <approach>
```

### Exit Conditions
- `plan.md` written to `.beads/artifacts/<bead-id>/`
- Bead status updated to `in_progress`
- Label `phase:building` added

---

## Phase 2: Implementation

### Purpose
Implement the code changes according to the approved plan and prepare verification checklist.

### Entry Conditions
- `plan.md` exists and approved
- Label `phase:building` present
- Bead status is `in_progress`

### Workflow

```
┌──────────────────────────────────────────────────────────────┐
│ PHASE 2: IMPLEMENTATION                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LOAD DOMAIN SKILL                                        │
│     Based on plan.md content:                                │
│     - API work → hono-specialist                             │
│     - UI work → frontend-architect                           │
│     - DB work → foundation-specialist                        │
│                                                              │
│  2. READ PLAN                                                │
│     cat .beads/artifacts/<bead-id>/plan.md                   │
│                                                              │
│  3. IMPLEMENT                                                │
│     For each step in plan:                                   │
│     - Create/modify files                                    │
│     - Write tests                                            │
│     - Run local verification (bun test, bun typecheck)       │
│                                                              │
│  4. PUSH TO VERCEL                                           │
│     git add .                                                │
│     git commit -m "feat: <summary>"                          │
│     git push                                                 │
│     → Vercel auto-deploys preview                            │
│                                                              │
│  5. WRITE QA CHECKLIST                                       │
│     Write .beads/artifacts/<bead-id>/qa-checklist.md         │
│                                                              │
│  6. TRANSITION                                               │
│     bd label add <bead-id> phase:verifying                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### QA Checklist Artifact Structure

```markdown
# QA Checklist: <bead-title>

## Test Environment
- **Scenario:** `with-test-user`
- **Preview URL:** <vercel-url>

## Acceptance Criteria Verification

### AC1: <criteria>
**Steps:**
1. Navigate to ...
2. Click ...
3. Verify ...

**Expected Result:** ...
**Pass Criteria:** ...

### AC2: <criteria>
...

## Technical Verification
- [ ] No console errors
- [ ] No 4xx/5xx responses
- [ ] Page loads < 3s
```

### Exit Conditions
- Code implemented and pushed
- Tests passing locally
- Vercel preview deployed
- `qa-checklist.md` written
- Label `phase:verifying` added

---

## Phase 3: Verification

### Purpose
Verify the implementation against acceptance criteria using automated QA.

### Entry Conditions
- `qa-checklist.md` exists
- Vercel preview is live
- Label `phase:verifying` present

### Critical: Fresh Context Isolation

Phase 3 runs in a **fresh subprocess** to prevent context bleed:

```typescript
// Orchestrator spawns QA agent via Task tool
Task({
  subagent_type: 'Explore',  // Fresh context
  prompt: `
    FRESH CONTEXT - You are the QA agent.

    Bead: ${beadId}
    Preview URL: ${previewUrl}
    Iteration: ${iteration}/3

    1. Load qa-workflow skill
    2. Read .beads/artifacts/${beadId}/qa-checklist.md
    3. Run QA harness
    4. Write .beads/artifacts/${beadId}/qa-report.md
  `
})
```

**Why Subprocess?** The QA agent must verify the implementation "as a user would" without knowledge of implementation shortcuts or assumptions made during Phase 2.

### Workflow

```
┌──────────────────────────────────────────────────────────────┐
│ PHASE 3: VERIFICATION (Fresh Subprocess)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LOAD SKILL                                               │
│     cat .claude/skills/qa-workflow/SKILL.md                  │
│                                                              │
│  2. LOAD CHECKLIST                                           │
│     cat .beads/artifacts/<bead-id>/qa-checklist.md           │
│                                                              │
│  3. VERIFY PREVIEW IS READY                                  │
│     curl <preview-url>/api/health/live                       │
│     (Retry 3x with 10s delay if failing)                     │
│                                                              │
│  4. SEED TEST DATA                                           │
│     curl -X POST <preview-url>/api/seed \                    │
│       -d '{"scenario": "<scenario-name>"}'                   │
│                                                              │
│  5. RUN QA HARNESS                                           │
│     bun run test:qa-harness -- \                             │
│       --preview-url=<url> \                                  │
│       --checklist=<path> \                                   │
│       --bead-id=<id>                                         │
│                                                              │
│     QA Harness internally:                                   │
│     - Launches headless Chromium (Playwright)                │
│     - Navigates to preview URL                               │
│     - Runs each verification step                            │
│     - Captures screenshots on failure                        │
│     - Collects console errors                                │
│                                                              │
│  6. GENERATE REPORT                                          │
│     Write .beads/artifacts/<bead-id>/qa-report.md            │
│                                                              │
│  7. DETERMINE OUTCOME & EXIT                                 │
│     See "Exit Conditions" below                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### QA Report Artifact Structure

```markdown
# QA Report: <bead-title>

## Summary
- **Status:** PASS / FAIL
- **Iteration:** 1/3
- **Duration:** 45s
- **Preview URL:** <url>

## Environment
- Health Check: OK (234ms)
- Seed: `with-test-user` OK (567ms)

## Verification Results

| Test | Status | Duration | Notes |
|------|--------|----------|-------|
| AC1: ... | PASS | 1.2s | |
| AC2: ... | FAIL | 2.1s | Console error detected |

## Failures (if any)

### AC2: <criteria>
**Error:** Console error: "TypeError: ..."
**Screenshot:** `failure-AC2.png`
**Suggested Fix:** ...

## Conclusion
<Overall assessment>

## Next Steps
<Based on outcome>
```

### Exit Conditions

| Outcome | Actions |
|---------|---------|
| **PASS** | `bd close <id> --reason "QA passed"` <br> `bd label add <id> qa:passed` |
| **FAIL (iteration < 3)** | `bd update <id> --note "Iteration N failed"` <br> `bd label add <id> qa:iteration-N` <br> Return to Phase 2 |
| **FAIL (iteration = 3)** | `bd label add <id> needs-human` <br> `bd update <id> --note "Max iterations, escalating"` |

---

## Artifact Flow

```
.beads/artifacts/<bead-id>/
│
├── plan.md ─────────────────────────────────────────────────┐
│   Created by: Phase 1 (Planner)                            │
│   Consumed by: Phase 2 (Builder)                           │
│   Content: Implementation approach, file paths, test plan  │
│                                                            │
├── qa-checklist.md ─────────────────────────────────────────┤
│   Created by: Phase 2 (Builder)                            │
│   Consumed by: Phase 3 (QA)                                │
│   Content: Verification steps, expected results, scenario  │
│                                                            │
└── qa-report.md ────────────────────────────────────────────┤
    Created by: Phase 3 (QA)                                 │
    Consumed by: Phase 2 (on failure) or Human (escalation)  │
    Content: Pass/fail results, errors, screenshots          │
```

---

## Label State Machine

```
                    ┌─────────────────┐
                    │   (no label)    │
                    └────────┬────────┘
                             │ bd label add phase:planning
                             ▼
                    ┌─────────────────┐
                    │ phase:planning  │
                    └────────┬────────┘
                             │ plan.md approved
                             │ bd label add phase:building
                             ▼
                    ┌─────────────────┐
    ┌──────────────▶│ phase:building  │◀──────────────┐
    │               └────────┬────────┘               │
    │                        │ qa-checklist.md ready  │
    │                        │ bd label add phase:verifying
    │                        ▼                        │
    │               ┌─────────────────┐               │
    │               │ phase:verifying │               │
    │               └────────┬────────┘               │
    │                        │                        │
    │         ┌──────────────┼──────────────┐        │
    │         ▼              ▼              ▼        │
    │    ┌─────────┐   ┌──────────┐   ┌──────────┐  │
    │    │qa:passed│   │qa:iter-N │   │needs-human│  │
    │    │ DONE    │   │ N < 3    │   │ N = 3     │  │
    │    └─────────┘   └────┬─────┘   └──────────┘  │
    │                       │                        │
    └───────────────────────┘                        │
         Loop back to Phase 2                        │
         with qa-report.md                           │
```

---

## Tool Usage by Phase

| Phase | Primary Tools | Purpose |
|-------|--------------|---------|
| **1** | Read, Grep, Glob, Task (Explore) | Analyze codebase |
| **1** | Bash (`bd show`, `bd update`, `bd label`) | Bead management |
| **1** | Write | Create plan.md |
| **2** | Read, Write, Edit | Code implementation |
| **2** | Bash (`bun test`, `git push`) | Verify & deploy |
| **2** | Write | Create qa-checklist.md |
| **3** | Task (fresh context) | Spawn QA subprocess |
| **3** | Read, Bash (`curl`, harness) | Run verification |
| **3** | Write | Create qa-report.md |

---

## External System Integration

| System | Integration Point | Purpose |
|--------|------------------|---------|
| **Beads** | `bd` CLI | Work tracking, labels, notes |
| **Vercel** | `git push` → auto-deploy | Preview environments |
| **Seed API** | `POST /api/seed` | Test data injection |
| **Playwright** | `e2e/harness/qa-harness.ts` | Browser automation |

---

## Seed Scenario System

The seed API (`/api/seed`) enables test data injection for QA verification.

### Available Scenarios

| Scenario | Description | Use Case |
|----------|-------------|----------|
| `empty-repo` | Clean database state | Reset between tests |
| `with-test-user` | User with known ID | Auth-required features |
| `with-patterns` | User + 5 sample patterns | Pattern CRUD testing |

### API Endpoints

```bash
# List scenarios
GET /api/seed → { scenarios: [...], environment: "preview" }

# Load scenario
POST /api/seed
Body: { "scenario": "with-test-user" }
Response: { success: true, scenario: "with-test-user" }

# Reset to empty
DELETE /api/seed → { success: true, message: "Database reset" }
```

### Security

The seed endpoint is protected by environment check:
- **Allowed:** Local development, Vercel preview deployments
- **Blocked:** Production (`VERCEL_ENV === 'production'`)

---

## QA Harness

The QA harness (`e2e/harness/qa-harness.ts`) automates verification:

```
runQAHarness(config)
│
├── [1/4] Health Check
│   └── GET /api/health/live (3 retries, 10s delay)
│
├── [2/4] Seed
│   └── POST /api/seed with scenario from checklist
│
├── [3/4] Verifications
│   ├── Launch headless Chromium
│   ├── For each verification in checklist:
│   │   ├── Navigate to preview URL
│   │   ├── Wait for networkidle
│   │   ├── Check for console errors
│   │   ├── Run verification logic
│   │   └── On failure: capture screenshot
│   └── Close browser
│
└── [4/4] Generate Report
    └── Write qa-report.md with results
```

### Configuration

```typescript
interface QAHarnessConfig {
  previewUrl: string;      // Vercel preview URL
  checklistPath: string;   // Path to qa-checklist.md
  scenario?: string;       // Override scenario
  headless?: boolean;      // Default: true
  timeout?: number;        // Default: 300000 (5 min)
  beadId: string;          // For artifact output
  iteration: number;       // 1-3
}
```

### Commands

```bash
# Full QA harness run
bun run test:qa-harness -- \
  --preview-url=<url> \
  --checklist=.beads/artifacts/<bead-id>/qa-checklist.md \
  --bead-id=<bead-id>

# List available seed scenarios
curl <preview-url>/api/seed

# Seed preview with test data
curl -X POST <preview-url>/api/seed \
  -H "Content-Type: application/json" \
  -d '{"scenario": "with-test-user"}'
```

---

## Error Handling

### Non-Fatal Errors (Don't Count as Iteration)

| Error Type | Action |
|------------|--------|
| Preview not ready (after retries) | Report as "Environment Error" |
| Seed endpoint fails | Report as "Seed Error" |

### Fatal Errors (Count as Iteration)

| Error Type | Action |
|------------|--------|
| Harness timeout (> 5min) | Report as "Timeout" |
| Verification failure | Report failure, capture screenshot |

### Escalation Path

When `needs-human` label is added:

```bash
# Human can find escalated beads with:
bd ready --label needs-human

# Review artifacts:
cat .beads/artifacts/<bead-id>/qa-report.md

# View failure screenshots:
ls .beads/artifacts/<bead-id>/failure-*.png
```

---

## Session Boundaries

### Single Session Flow

Most beads complete in a single Claude Code session:

```
Session Start
│
├── bd ready → Pick bead
├── Phase 1: Plan
├── Phase 2: Implement
├── Phase 3: Verify (subprocess)
│   └── PASS → bd close
│
└── Session End (bd sync, git push)
```

### Multi-Session Flow

When QA fails and loops back:

```
Session 1                    Session 2
─────────                    ─────────
Phase 1: Plan                (Bead has phase:building label)
Phase 2: Implement           Resume from qa-report.md
Phase 3: Verify → FAIL       Fix issues from report
  └── Writes qa-report.md    Phase 3: Verify again
  └── Adds qa:iteration-1      └── PASS → bd close
```

Claude Code resumes by:
1. Reading bead labels to identify current phase
2. Reading artifacts to understand state
3. Continuing from the appropriate point

---

## Complete Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE END-TO-END WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ① START SESSION                                                            │
│     Load CLAUDE.md → Load skills → bd ready                                 │
│                                                                             │
│  ② PHASE 1: PLANNING                                                        │
│     planning-workflow skill → Analyze → Write plan.md                       │
│     bd label add phase:building                                             │
│                                                                             │
│  ③ PHASE 2: IMPLEMENTATION                                                  │
│     Domain skill → Read plan.md → Write code → Push → Write qa-checklist.md │
│     bd label add phase:verifying                                            │
│                                                                             │
│  ④ PHASE 3: VERIFICATION (Subprocess)                                       │
│     qa-workflow skill → Health check → Seed → Harness → Write qa-report.md  │
│                                                                             │
│  ⑤ EXIT CONDITIONS                                                          │
│     PASS → bd close → done                                                  │
│     FAIL (< 3) → Loop to Phase 2                                            │
│     FAIL (= 3) → needs-human → escalate                                     │
│                                                                             │
│  ⑥ END SESSION                                                              │
│     bd sync → git push                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Files Reference

| Component | Location |
|-----------|----------|
| Project context | `CLAUDE.md` |
| Skills | `.claude/skills/*/SKILL.md` |
| Beads issues | `.beads/issues.jsonl` |
| Workflow artifacts | `.beads/artifacts/<bead-id>/` |
| QA harness | `e2e/harness/` |
| Seed scenarios | `packages/test-utils/src/scenarios/` |
| Seed API | `apps/api/src/routes/seed.ts` |

---

## Related Skills

| Skill | Role in Workflow |
|-------|------------------|
| `planning-workflow` | Phase 1 - Creates implementation plans |
| `qa-workflow` | Phase 3 - Runs verification |
| `orchestrator-specialist` | Coordinates phases, manages handoffs |
| `hono-specialist` | Phase 2 - API implementation |
| `frontend-architect` | Phase 2 - UI implementation |
| `backend-architect` | Phase 2 - Services/data layer |
| `testing-consultant` | Phase 2 - Test patterns |
