# Orchestrator Specialist

Routes development tasks to specialist skills and manages work tracking with beads. This is the **canonical source** for the Three-Phase Workflow.

---

## Activation

Invoke this skill when:
- Task scope is unclear or spans multiple domains
- User asks "which skill should handle this?"
- Planning a multi-step feature
- Breaking down a large task into subtasks
- Managing dependencies between work items

**Example triggers:**
- "Help me plan the user authentication feature"
- "Which skill should handle adding a new API endpoint?"
- "Break down the pattern validation feature into tasks"
- "I need to add a new page with API backend - where do I start?"
- "Create a bead for the settings page implementation"

---

## Task Routing Decision Tree

```
User Request
    │
    ├─ Contains "route", "middleware", "handler", "API", "tRPC", "service", "job", "drizzle"?
    │   └── api-backend
    │
    ├─ Contains "component", "UI", "state", "hook", "React"?
    │   └── frontend-architect + frontend-design (dual activation)
    │
    ├─ Contains "design", "visual", "style", "typography", "animation", "color", "aesthetic"?
    │   └── frontend-design (+ frontend-architect if creating components)
    │
    ├─ Contains "test", "mock", "fixture", "coverage"?
    │   └── testing-consultant
    │
    └─ Unclear?
        └── Ask clarifying question before routing
```

---

## Multi-Skill Coordination

### Handoff Format
When routing to another skill, provide clear context:

```
HANDOFF TO: <skill-name>
CONTEXT: <what has been done, current state>
TASK: <specific work for this skill>
FILES: <relevant file paths>
BEADS: <active bead ID if any>
```

### Example: "Add new API endpoint with validation and tests"

**Step 1 - Route to api-backend:**
```
HANDOFF TO: api-backend
CONTEXT: New endpoint needed for user preferences
TASK: Create tRPC procedure or REST route with Zod validation
FILES: packages/trpc/src/routers/, apps/api/src/routes/
BEADS: #42
```

**Step 2 - Route to testing-consultant:**
```
HANDOFF TO: testing-consultant
CONTEXT: Preferences endpoint created
TASK: Write unit tests for happy path and validation errors
FILES: packages/trpc/src/routers/preferences.test.ts
BEADS: #42
```

---

## Skill Summary Reference

| Skill | Expertise | Key Files |
|-------|-----------|-----------|
| `api-backend` | tRPC routers, Hono REST, Drizzle, services, jobs | `packages/trpc/`, `apps/api/src/` |
| `frontend-architect` | React components, state, routing | `apps/web/src/` |
| `frontend-design` | Visual design, aesthetics, typography, motion | `apps/web/src/`, `apps/web/src/styles/` |
| `testing-consultant` | Vitest, Playwright, mocks, coverage | `**/*.test.ts`, `e2e/` |

> **Dual Activation:** For UI creation, activate BOTH `frontend-architect` (structure) + `frontend-design` (aesthetics).

---

## When to Create Beads

**DO create beads for:**
- Multi-file features
- Work that spans multiple skills
- Tasks with dependencies
- Anything that might be interrupted

**DON'T create beads for:**
- Quick fixes (< 5 min)
- Single-file edits
- Research/exploration
- Immediate completions

---

## Common Orchestration Patterns

### Feature Development
1. Create parent bead for feature
2. Break into sub-tasks with dependencies
3. Route each sub-task to appropriate skill
4. Track progress through beads

### Bug Investigation
1. Start with exploration (no bead yet)
2. Once root cause found, create bead
3. Route fix to appropriate skill
4. Add tests via testing-consultant

### Refactoring
1. Create bead for refactor scope
2. Route structural changes to domain skill
3. Route test updates to testing-consultant
4. Foundation-specialist for config changes

---

## Three-Phase Workflow (Canonical)

This is the authoritative definition of the three-phase workflow.

```
Phase 1: Planning     →  Phase 2: Implementation  →  Phase 3: Verification
(planning-workflow)      (domain skills)             (qa-workflow)
```

### Preview URLs

| Service | URL |
|---------|-----|
| **Web (Vercel)** | `https://mantle-git-preview-darienlombardi-2455s-projects.vercel.app` |
| **API (Railway)** | `https://mantleapi-preview.up.railway.app` |

### Prerequisites

1. Vercel preview configured (auto-deploys on push)
2. Railway preview with `VERCEL_ENV=preview`
3. `VERCEL_PROTECTION_BYPASS` token in `.env.local`
4. Supabase redirect URLs include preview domain

### Orchestrator Responsibilities by Phase

| Transition | Orchestrator Action |
|------------|---------------------|
| Start → Phase 1 | Route bead to `planning-workflow` |
| Phase 1 → 2 | Route `plan.md` to appropriate domain skill |
| Phase 2 → 3 | Spawn fresh QA agent via Task tool |
| Phase 3 → 2 | On failure, route `qa-report.md` back to builder |
| Phase 3 → Done | On pass, close bead with `qa:passed` |

### Spawning QA Agent (Fresh Context)

Phase 3 **must** run in a fresh subprocess to prevent context bleed:

```typescript
Task({
  subagent_type: 'Explore',
  prompt: `
    FRESH CONTEXT - You are the QA agent for Phase 3.

    Bead: ${beadId}
    Preview URL: https://mantle-git-preview-darienlombardi-2455s-projects.vercel.app
    Iteration: ${iteration}/3

    1. Load the qa-workflow skill
    2. Read .beads/artifacts/${beadId}/qa-checklist.md
    3. Run QA harness (see qa-workflow/SKILL.md for CLI reference)
    4. Write results to .beads/artifacts/${beadId}/qa-report.md
  `
})
```

### Phase 2 Completion Gate

Before transitioning from Phase 2 → Phase 3, verify these artifacts exist:

| Artifact | Location | Purpose |
|----------|----------|---------|
| `qa-checklist.md` | `.beads/artifacts/<bead-id>/qa-checklist.md` | Testable acceptance criteria |
| Code changes | Committed and pushed | Triggers Vercel preview deploy |
| Unit tests | `*.test.ts` files | Verify code logic locally |

**If `qa-checklist.md` is missing**, the builder (domain skill) must create it before Phase 3 can begin.

### Bead Closure Rules

> ⚠️ **CRITICAL: NEVER use `bd close` without Phase 3 completion.**

| Scenario | Action |
|----------|--------|
| Unit tests pass locally | **NOT SUFFICIENT** - Phase 3 still required |
| `qa-checklist.md` missing | Return to Phase 2, create checklist |
| Phase 3 not executed | Spawn QA agent (see above) |
| QA passed | `bd close <id> --reason "QA passed"` |
| QA failed 3x | `bd label add <id> needs-human` (do NOT close) |
| Bead closed successfully | Output Bead Completion Summary (see below) |

**Why Phase 3 matters:**
- Unit tests verify code logic in isolation
- Phase 3 verifies the feature works in the **preview environment** (real Supabase, real Vercel)
- Production issues often stem from integration failures, not unit test gaps

### Routing After QA Failure

When QA fails and iteration < 3, hand back to the original builder skill:

```
HANDOFF TO: <original-domain-skill>
PHASE: 2 (Implementation - Iteration N+1)
BEAD: <bead-id>
CONTEXT: QA failed, see qa-report.md for issues
TASK: Fix issues identified in report, update qa-checklist.md
FILES: .beads/artifacts/<bead-id>/qa-report.md
```

---

## Bead Completion Summary (Required)

After closing a bead with `bd close`, output a structured summary of skill utilization.

### Template

```
## Bead Completion Summary: `<bead-id>`

**Bead:** <title>
**Status:** Closed (QA passed)

### Skills Utilized

| Phase | Skill(s) | Purpose |
|-------|----------|---------|
| **Phase 1: Planning** | `orchestrator-specialist`, `planning-workflow` | <brief purpose> |
| **Phase 2: Implementation** | `<domain-skill(s)>` | <brief purpose> |
| **Phase 3: Verification** | `qa-workflow` | <brief purpose> |

### Skill Activation Details

1. **<skill-name>** — <why activated, what it contributed>
2. ...

### Artifacts Produced

.beads/artifacts/<bead-id>/
├── plan.md           ✓ Phase 1
├── qa-checklist.md   ✓ Phase 2
└── qa-report.md      ✓ Phase 3

### Iterations

| # | Outcome | Issue |
|---|---------|-------|
| 1 | PASS/FAIL | <brief description if failed> |
| ... | ... | ... |
```

### Why This Matters

- **Visibility**: User can inspect how the agent harness employed skills
- **Debugging**: Identifies if skills were missed or incorrectly routed
- **Learning**: Surfaces patterns in skill utilization across beads
