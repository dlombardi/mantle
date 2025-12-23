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

## Beads Workflow

### Starting Work
```bash
# Check current work context
bd prime

# Create a new task
bd create "Implement user authentication flow"

# Add dependencies if task requires prior work
bd dep add <new-id> <dependency-id>
```

### During Work
```bash
# Mark task as started
bd update <id> -s in-progress

# Check what's ready to work on
bd ready
```

### Completing Work
```bash
# Mark task complete
bd complete <id>

# Verify completion
bd show <id>
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
