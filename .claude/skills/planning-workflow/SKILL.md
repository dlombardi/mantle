# Planning Workflow

> **Reference:** Phase 1 of the Three-Phase Workflow. See `orchestrator-specialist/SKILL.md` for workflow overview.

Phase 1 agent: Creates implementation plans from beads and prepares work for Builder agents.

---

## Activation

Invoke when:
- Starting Phase 1 (bead needs implementation plan)
- User says "plan this bead" or references `bd ready`

**Trigger keywords:** `plan bead`, `phase 1`, `implementation plan`, `bd ready`

---

## Goal

**Input:** Bead from `bd ready`

**Output:** `.beads/artifacts/<bead-id>/plan.md`

**Quality criteria:**
- Specific file paths (not "somewhere in the API")
- Code snippets for complex patterns
- Clear acceptance criteria mapping
- Test strategy defined
- Risks identified

---

## Protocol

1. **Load bead context**
   ```bash
   bd ready --json && bd show <bead-id>
   bd sync  # CRITICAL: Sync immediately to prevent purge
   ```

2. **Analyze codebase** — read relevant skills, check existing patterns, identify file structure

3. **Write plan.md** — use template from `references/plan-template.md`

4. **Review gate** — verify acceptance criteria, file paths, test strategy

5. **Transition to Phase 2**
   ```bash
   bd update <bead-id> --status in_progress
   bd label add <bead-id> phase:building
   ```

---

## Handoff Format

```
HANDOFF TO: <domain-skill>
PHASE: 2 (Implementation)
BEAD: <bead-id>
PLAN: .beads/artifacts/<bead-id>/plan.md
TASK: Implement according to plan, produce qa-checklist.md
```

---

## Common Planning Patterns

| Feature Type | Key Steps |
|--------------|-----------|
| API Endpoint | Route → Zod schema → Service layer → Tests |
| UI Component | Component → State → API integration → Tests |
| Database Schema | Migration → Drizzle schema → API changes → Seeds |
