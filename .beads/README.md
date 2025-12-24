# Beads - AI-Native Issue Tracking

Welcome to Beads! This repository uses **Beads** for issue tracking - a modern, AI-native tool designed to live directly in your codebase alongside your code.

## What is Beads?

Beads is issue tracking that lives in your repo, making it perfect for AI coding agents and developers who want their issues close to their code. No web UI required - everything works through the CLI and integrates seamlessly with git.

**Learn more:** [github.com/steveyegge/beads](https://github.com/steveyegge/beads)

---

## How This Project Uses Beads

This project follows a **guided autonomy** model for AI-assisted development:

| Document | Purpose | Contains |
|----------|---------|----------|
| **Beads** | Sprint tracking (WHAT) | Acceptance criteria, status, blockers |
| **CLAUDE.md** | Implementation guidance (HOW) | Conventions, patterns, code examples |
| **agents.md / Skills** | Domain expertise | Agent configurations, specialized knowledge |
| **Claude Code** | Decisions | File locations, specific implementations |

### What Beads Should Contain

✅ **Include:**
- **Title**: Clear, actionable description of what to build
- **Acceptance criteria**: What "done" looks like (behavior, not implementation)
- **PRD/Decision refs**: Links to D1, D37, etc. for context
- **Priority & Status**: Sprint tracking essentials
- **Blockers**: Dependencies on other work

❌ **Do NOT include:**
- File paths (Claude decides based on CLAUDE.md conventions)
- Specific code patterns (reference CLAUDE.md sections instead)
- Dependency lists (Claude decides)
- Implementation steps (that's Claude's job)

### Example: Good Bead

```markdown
Title: Add pattern confidence scoring

Acceptance Criteria:
- Patterns display confidence score (0-100)
- Confidence factors from D11 are weighted
- Users can sort patterns by confidence

PRD Refs: D11 (4-dimension confidence)
```

### Example: Bad Bead (over-specified)

```markdown
Title: Add pattern confidence scoring

Files:
- apps/api/src/services/confidence.ts  ❌ Don't specify
- apps/web/src/components/PatternCard.tsx  ❌ Don't specify

Implementation:
1. Create ConfidenceCalculator class  ❌ Don't dictate
2. Add weighted average function  ❌ Claude decides
```

### The Flow

```
User creates bead (WHAT) →
Claude reads acceptance criteria →
Claude checks CLAUDE.md for conventions (HOW) →
Claude makes implementation decisions →
Code follows project patterns
```

---

## Quick Start

### Essential Commands

```bash
# Create new issues
bd create "Add user authentication"

# View all issues
bd list

# View issue details
bd show <issue-id>

# Update issue status
bd update <issue-id> --status in_progress
bd update <issue-id> --status done

# Sync with git remote
bd sync
```

### Working with Issues

Issues in Beads are:
- **Git-native**: Stored in `.beads/issues.jsonl` and synced like code
- **AI-friendly**: CLI-first design works perfectly with AI coding agents
- **Branch-aware**: Issues can follow your branch workflow
- **Always in sync**: Auto-syncs with your commits

## Why Beads?

✨ **AI-Native Design**
- Built specifically for AI-assisted development workflows
- CLI-first interface works seamlessly with AI coding agents
- No context switching to web UIs

🚀 **Developer Focused**
- Issues live in your repo, right next to your code
- Works offline, syncs when you push
- Fast, lightweight, and stays out of your way

🔧 **Git Integration**
- Automatic sync with git commits
- Branch-aware issue tracking
- Intelligent JSONL merge resolution

## Get Started with Beads

Try Beads in your own projects:

```bash
# Install Beads
curl -sSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Initialize in your repo
bd init

# Create your first issue
bd create "Try out Beads"
```

## Learn More

- **Documentation**: [github.com/steveyegge/beads/docs](https://github.com/steveyegge/beads/tree/main/docs)
- **Quick Start Guide**: Run `bd quickstart`
- **Examples**: [github.com/steveyegge/beads/examples](https://github.com/steveyegge/beads/tree/main/examples)

---

*Beads: Issue tracking that moves at the speed of thought* ⚡
