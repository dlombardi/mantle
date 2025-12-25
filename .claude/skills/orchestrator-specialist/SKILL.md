# Orchestrator Specialist

> **Reference:** This skill coordinates the Three-Phase Workflow defined in `CLAUDE.md`.
> Read CLAUDE.md first for prerequisites, preview URLs, bypass tokens, and QA harness CLI reference.

Routes development tasks to appropriate specialist skills and manages work tracking with beads.

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
    ├─ Contains "route", "middleware", "handler", "API"?
    │   └── hono-specialist
    │
    ├─ Contains "component", "UI", "state", "hook", "React"?
    │   └── frontend-architect
    │
    ├─ Contains "test", "mock", "fixture", "coverage"?
    │   └── testing-consultant
    │
    ├─ Contains "service", "job", "error", "repository"?
    │   └── backend-architect
    │
    ├─ Contains "config", "eslint", "drizzle", "migration", "tooling"?
    │   └── foundation-specialist
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

**Step 1 - Route to hono-specialist:**
```
HANDOFF TO: hono-specialist
CONTEXT: New endpoint needed for user preferences
TASK: Create POST /api/preferences route with Zod validation
FILES: apps/api/src/routes/index.ts
BEADS: #42
```

**Step 2 - Route to testing-consultant:**
```
HANDOFF TO: testing-consultant
CONTEXT: Preferences endpoint created at apps/api/src/routes/preferences.ts
TASK: Write unit tests for happy path and validation errors
FILES: apps/api/src/routes/preferences.ts
BEADS: #42
```

**Step 3 - Route to backend-architect:**
```
HANDOFF TO: backend-architect
CONTEXT: Endpoint and tests complete
TASK: Review error handling, add to service layer if needed
FILES: apps/api/src/routes/preferences.ts, apps/api/src/routes/preferences.test.ts
BEADS: #42
```

---

## Skill Summary Reference

| Skill | Expertise | Key Files |
|-------|-----------|-----------|
| `hono-specialist` | Hono routes, middleware, validation | `apps/api/src/routes/` |
| `frontend-architect` | React components, state, routing | `apps/web/src/` |
| `testing-consultant` | Vitest, Playwright, mocks, coverage | `**/*.test.ts`, `e2e/` |
| `backend-architect` | Services, Drizzle ORM, jobs | `apps/api/src/lib/db/`, `apps/api/src/services/` |
| `foundation-specialist` | Config, migrations, tooling | `*.config.*`, `supabase/migrations/` |

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

## Three-Phase Workflow Coordination

> **Full workflow definition:** See `CLAUDE.md` → "Three-Phase Agentic Workflow"
> This section describes the orchestrator's coordination role only.

```
Phase 1: Planning     →  Phase 2: Implementation  →  Phase 3: Verification
(planning-workflow)      (domain skills)             (qa-workflow)
```

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
    3. Run QA harness (see CLAUDE.md for full CLI options)
    4. Write results to .beads/artifacts/${beadId}/qa-report.md
  `
})
```

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
