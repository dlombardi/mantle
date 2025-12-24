# Orchestrator Specialist

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

## Three-Phase Agentic Workflow

For beads that require automated QA verification, use this workflow:

```
Phase 1: Planning     →  Phase 2: Implementation  →  Phase 3: Verification
(planning-workflow)      (domain skills)             (qa-workflow)
```

### Phase 1: Planning

**Trigger:** New bead or `bd ready`

**Agent:** Load `planning-workflow` skill

**Steps:**
1. Pick bead from `bd ready`
2. Analyze codebase for implementation approach
3. Write `plan.md` artifact
4. Review and approve plan

**Output:**
```
.beads/artifacts/<bead-id>/plan.md
```

**Transition:**
```bash
bd update <bead-id> --status in_progress
bd label add <bead-id> phase:building
```

### Phase 2: Implementation

**Trigger:** Approved plan from Phase 1

**Agent:** Domain skill (hono-specialist, frontend-architect, etc.)

**Steps:**
1. Read `plan.md`
2. Implement code changes
3. Write tests
4. Push to trigger Vercel preview
5. Write `qa-checklist.md`

**Output:**
```
.beads/artifacts/<bead-id>/qa-checklist.md
```

**Transition:**
```bash
bd label add <bead-id> phase:verifying
```

### Phase 3: Verification

**Trigger:** Implementation complete, preview deployed

**Agent:** Spawn fresh `qa-workflow` via Task tool

**Steps:**
1. Read `qa-checklist.md`
2. Run QA harness against preview
3. Generate `qa-report.md`
4. Determine pass/fail

**Output:**
```
.beads/artifacts/<bead-id>/qa-report.md
```

**Exit Conditions:**
| Outcome | Action |
|---------|--------|
| PASS | `bd close <id>`, add `qa:passed` |
| FAIL (<3) | Loop to Phase 2 |
| FAIL (=3) | Add `needs-human`, escalate |

### Spawning QA Agent (Fresh Context)

```typescript
// Use Task tool to spawn QA with isolated context
Task({
  subagent_type: 'Explore',  // Or custom qa-workflow type
  prompt: `
    FRESH CONTEXT - You are the QA agent for Phase 3.

    Bead: ${beadId}
    Preview URL: ${previewUrl}
    Iteration: ${iteration}/3

    1. Read .beads/artifacts/${beadId}/qa-checklist.md
    2. Run QA harness: bun run test:qa-harness --preview-url=${previewUrl}
    3. Write results to .beads/artifacts/${beadId}/qa-report.md

    Load the qa-workflow skill for detailed instructions.
  `
})
```

### Artifact Flow

```
Phase 1                    Phase 2                    Phase 3
────────                   ────────                   ────────
plan.md ──────────────────→ (reads)
                           qa-checklist.md ──────────→ (reads)
                                                      qa-report.md
                           ←─────────────────────────── (on failure)
```

### Label Conventions

```bash
# Phase tracking
bd label add <id> phase:planning
bd label add <id> phase:building
bd label add <id> phase:verifying

# Iteration tracking
bd label add <id> qa:iteration-1
bd label add <id> qa:iteration-2
bd label add <id> qa:iteration-3

# Outcomes
bd label add <id> qa:passed
bd label add <id> needs-human
```

### Example: Full Workflow

```bash
# Phase 1: Planning
bd ready                                    # Find work
bd update bd-a1b2 --status in_progress
# Planner creates .beads/artifacts/bd-a1b2/plan.md
bd label add bd-a1b2 phase:building

# Phase 2: Implementation
# Builder reads plan.md, writes code
# Builder writes .beads/artifacts/bd-a1b2/qa-checklist.md
git push                                    # Triggers Vercel preview
bd label add bd-a1b2 phase:verifying

# Phase 3: Verification (spawned as fresh session)
# QA reads qa-checklist.md
# QA runs harness against preview
# QA writes .beads/artifacts/bd-a1b2/qa-report.md

# If PASS:
bd close bd-a1b2 --reason "QA passed"
bd label add bd-a1b2 qa:passed

# If FAIL (iteration < 3):
bd update bd-a1b2 --note "QA iteration 1 failed - see qa-report.md"
bd label add bd-a1b2 qa:iteration-1
# Loop back to Phase 2

# If FAIL (iteration = 3):
bd label add bd-a1b2 needs-human
bd update bd-a1b2 --note "Max iterations reached, escalating"
```
