# Planning Workflow

> **Reference:** This skill implements Phase 1 of the Three-Phase Workflow defined in `CLAUDE.md`.
> Read CLAUDE.md first for prerequisites and the complete workflow overview.

Phase 1 agent for the three-phase agentic coding workflow. Creates implementation plans from beads and prepares work for Builder agents.

---

## Activation

Invoke this skill when:
- Starting Phase 1 of the agentic workflow
- A bead needs an implementation plan before coding begins
- User says "plan this bead" or references `bd ready`
- Breaking down a bead into actionable implementation steps

**Trigger keywords:** `plan bead`, `phase 1`, `implementation plan`, `bd ready`, `planning phase`

**Example triggers:**
- "Plan bead #bd-a1b2"
- "Pick a bead from `bd ready` and create a plan"
- "Start Phase 1 for this feature"
- "Create an implementation plan for the auth flow"

---

## Workflow Protocol

### Step 1: Load Bead Context

```bash
# Get list of ready beads (no blockers)
bd ready --json

# Or show specific bead details
bd show <bead-id>

# CRITICAL: Sync immediately after picking a bead to prevent purge
bd sync
```

> ⚠️ **Bead Lifecycle Warning:** Always run `bd sync` immediately after picking a bead.
> Without this, beads can be purged during subsequent sync operations.

Extract from bead:
- Title and description
- Acceptance criteria (if any)
- Priority and labels
- Blocking/blocked-by relationships

### Step 2: Codebase Analysis

Before writing the plan, analyze:
1. **Existing patterns** - How similar features are implemented
2. **File structure** - Where new code should live
3. **Dependencies** - What modules/services to integrate with
4. **Test coverage** - What test patterns exist

### Step 3: Write plan.md Artifact

Create the plan artifact at:
```
.beads/artifacts/<bead-id>/plan.md
```

Use the template structure from `references/plan-template.md`.

### Step 4: Review Gate

Plans should be validated before proceeding to Phase 2. Review criteria:
- [ ] Acceptance criteria addressed
- [ ] File paths are specific and accurate
- [ ] No ambiguous implementation decisions
- [ ] Test strategy defined
- [ ] Risk considerations noted

### Step 5: Transition to Phase 2

After plan approval:
```bash
bd update <bead-id> --status in_progress
bd update <bead-id> --note "Plan approved, transitioning to Phase 2"
bd label add <bead-id> phase:building
```

---

## Plan Quality Criteria

### GOOD Plans Include:
- Specific file paths (not "somewhere in the API")
- Code snippets for complex patterns
- Clear acceptance criteria mapping
- Identified risks and mitigations
- Explicit test scenarios

### BAD Plans Are:
- Vague ("implement the feature")
- Missing file paths
- No test strategy
- Ignoring existing patterns
- Over-engineered without justification

---

## Artifact Location

All artifacts are stored in `.beads/artifacts/<bead-id>/`:

```
.beads/artifacts/bd-a1b2/
├── plan.md           # Implementation plan (Phase 1 output)
├── qa-checklist.md   # Verification steps (Phase 2 output)
└── qa-report.md      # Test results (Phase 3 output)
```

Create the directory if it doesn't exist:
```bash
mkdir -p .beads/artifacts/<bead-id>
```

---

## Handoff Format

When transitioning to Phase 2 (Builder):

```
HANDOFF TO: <domain-skill>
PHASE: 2 (Implementation)
BEAD: <bead-id>
PLAN: .beads/artifacts/<bead-id>/plan.md
CONTEXT: Plan approved, ready for implementation
TASK: Implement according to plan, produce qa-checklist.md
```

---

## Integration with Orchestrator

This skill works alongside `orchestrator-specialist`:
- **Orchestrator** routes tasks and manages beads lifecycle
- **Planning Workflow** creates detailed implementation plans
- Both use the same HANDOFF format for consistency

When unsure which domain skill should implement:
```
HANDOFF TO: orchestrator-specialist
CONTEXT: Plan created, need routing decision
TASK: Route to appropriate implementation skill
FILES: .beads/artifacts/<bead-id>/plan.md
```

---

## Common Planning Patterns

### API Endpoint Feature
1. Route definition (hono-specialist)
2. Zod schema validation
3. Service layer integration (backend-architect)
4. Unit tests for route
5. Integration test for full flow

### UI Component Feature
1. Component structure (frontend-architect)
2. State management approach
3. API integration (if any)
4. Component tests
5. E2E test for user flow

### Database Schema Change
1. Migration file (foundation-specialist)
2. Drizzle schema update
3. API changes to expose data
4. Seed data update
5. Integration tests

---

## Validation Commands

```bash
# Check bead exists and get details
bd show <bead-id>

# Verify artifact directory exists
ls -la .beads/artifacts/<bead-id>/

# Read existing plan
cat .beads/artifacts/<bead-id>/plan.md

# Update bead status
bd update <bead-id> --status in_progress
bd label add <bead-id> phase:building
```

---

## Handoffs

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes planning tasks here |
| User | Directly requests plan for a bead |

| Downstream | When |
|------------|------|
| `hono-specialist` | Plan involves API routes |
| `frontend-architect` | Plan involves UI components |
| `backend-architect` | Plan involves services/data layer |
| `foundation-specialist` | Plan involves config/migrations |
| `testing-consultant` | Plan needs test strategy review |
