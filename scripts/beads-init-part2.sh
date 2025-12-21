#!/bin/bash
set -e

# ============================================
# Reasoning Substrate - Beads Issue Database
# Part 2: Validation, Context Files, PR Enforcement, Polish
# Run this AFTER beads-init.sh
# ============================================

echo "============================================"
echo "Beads Init Part 2: Remaining Epics"
echo "============================================"
echo ""

# Get existing story IDs (assumes beads-init.sh was run)
echo "Fetching existing stories..."

# --- Epic 4: Validation Tasks ---

echo ""
echo "=== Creating Validation Tasks ==="
echo ""

TASK_4_1=$(bd create "Build pattern confidence card UI" \
  --type feature \
  --priority 0 \
  --description "Display dimension bars, tier badge, health warnings, insight.

## PRD References
- Task 4.1
- D11 (Confidence)
- D13 (Pattern mental model)

## Acceptance Criteria
- [ ] Four dimension bars for code patterns
- [ ] Two dimension pills for filesystem patterns
- [ ] Tier badge with color coding
- [ ] Health warnings with category icons
- [ ] Contextual insight text

## Implementation Details

### Files to Create/Modify
- components/patterns/confidence-card.tsx
- components/patterns/dimension-bar.tsx
- components/patterns/health-warnings.tsx
- components/patterns/insight-panel.tsx

### Notes
Per D13: Progressive disclosure.
80% of decisions from card alone.

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.1 ($TASK_4_1)"

TASK_4_2=$(bd create "Display contextual insight and suggested actions" \
  --type feature \
  --priority 1 \
  --description "Show generated insight with actionable suggestions.

## PRD References
- Task 4.2

## Acceptance Criteria
- [ ] Insight text displayed prominently
- [ ] Suggested actions as clickable buttons

## Implementation Details

### Files to Create/Modify
- components/patterns/insight-display.tsx

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.2 ($TASK_4_2)"

TASK_4_3=$(bd create "Implement Promote, Reject, Defer actions" \
  --type feature \
  --priority 0 \
  --description "Core action handlers for all three validation workflows.

## PRD References
- Task 4.3
- D18 (Rejection flow)
- D19 (Severity)

## Acceptance Criteria
- [ ] Promote opens modal with configuration
- [ ] Reject opens modal with optional reason
- [ ] Defer is instant, increments deferCount

## Implementation Details

### Files to Create/Modify
- components/patterns/actions/promote-modal.tsx
- components/patterns/actions/reject-modal.tsx
- lib/db/patterns.ts

### Notes
Per D18: Fast path - press r, hit Enter.
Per D19: Severity dropdown, default 'warning'.

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.3 ($TASK_4_3)"

TASK_4_4=$(bd create "Implement Promote action with ownership and severity" \
  --type feature \
  --priority 0 \
  --description "On promote: set status, owner, severity.

## PRD References
- Task 4.4
- D19 (Severity)
- D22 (Ownership)

## Acceptance Criteria
- [ ] status changed to 'authoritative'
- [ ] ownerId and validatedBy set
- [ ] defaultSeverity from modal
- [ ] statusChangedAt timestamp

## Implementation Details

### Files to Create/Modify
- lib/db/patterns.ts
- app/api/patterns/[id]/promote/route.ts

### Notes
Per D22: Validator becomes owner for MVP.

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
bd label add "$TASK_4_4" critical-path 2>/dev/null || true
echo "Created: task-4.4 ($TASK_4_4)"

TASK_4_5=$(bd create "Add rationale field (the 'Why') on promote" \
  --type feature \
  --priority 1 \
  --description "Free text field for human-provided reasoning.

## PRD References
- Task 4.5
- D3 (Provenance moat)

## Acceptance Criteria
- [ ] Rationale text field in promote modal
- [ ] Optional but encouraged
- [ ] Stored in Pattern.rationale

## Implementation Details

### Files to Create/Modify
- components/patterns/actions/promote-modal.tsx

### Notes
Per D3: Rationale is the 'Why' that makes pattern valuable.

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.5 ($TASK_4_5)"

TASK_4_6=$(bd create "Add provenance linking with URL input" \
  --type feature \
  --priority 1 \
  --description "Link patterns to PRs, docs, Slack threads.

## PRD References
- Task 4.6
- D3 (Provenance moat)

## Acceptance Criteria
- [ ] URL input field in promote modal
- [ ] Type selection (PR, doc, Slack)
- [ ] Provenance records created

## Implementation Details

### Files to Create/Modify
- components/patterns/actions/provenance-input.tsx
- lib/db/provenance.ts

### Notes
Auto-detect type from URL if possible.

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.6 ($TASK_4_6)"

TASK_4_7=$(bd create "Build pattern detail view" \
  --type feature \
  --priority 0 \
  --description "Full pattern page with provenance, evidence, confidence.

## PRD References
- Task 4.7
- D13 (Pattern mental model)

## Acceptance Criteria
- [ ] Pattern name, description, type, status
- [ ] Confidence breakdown
- [ ] Evidence list with GitHub links
- [ ] Provenance links
- [ ] Edit buttons for authoritative

## Implementation Details

### Files to Create/Modify
- app/patterns/[id]/page.tsx
- components/patterns/pattern-header.tsx
- components/patterns/evidence-list.tsx
- components/patterns/provenance-list.tsx

### Notes
GitHub links use capturedAtSha for stable URLs.

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.7 ($TASK_4_7)"

TASK_4_8=$(bd create "Build pattern dashboard with filtering and sorting" \
  --type feature \
  --priority 1 \
  --description "Full dashboard with filters by status, tier, repo.

## PRD References
- Task 4.8
- D17 (Queue sorting)

## Acceptance Criteria
- [ ] Filter by status, tier, repo, type
- [ ] Sort by confidence score
- [ ] Queue sorting algorithm implemented

## Implementation Details

### Files to Create/Modify
- app/patterns/page.tsx
- components/patterns/filter-bar.tsx
- components/patterns/pattern-grid.tsx

### Notes
Per D17: tierWeight * 10000 + backtestViolations

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.8 ($TASK_4_8)"

TASK_4_9=$(bd create "Run backtest against historical PRs" \
  --type feature \
  --priority 0 \
  --description "Detect violations across stored PR diffs.

## PRD References
- Task 4.9
- D12 (Engagement loop)
- D28 (Diff storage)

## Acceptance Criteria
- [ ] Each candidate tested against PRs
- [ ] Summary in Pattern.backtestSummary
- [ ] Details in backtest_violations table
- [ ] CASCADE delete on pattern deletion

## Implementation Details

### Files to Create/Modify
- lib/backtest/run-backtest.ts
- lib/db/backtest-violations.ts

### Notes
Per D28: Diffs from Supabase Storage.

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
bd label add "$TASK_4_9" critical-path 2>/dev/null || true
echo "Created: task-4.9 ($TASK_4_9)"

TASK_4_10=$(bd create "Display impact preview in validation UI" \
  --type feature \
  --priority 0 \
  --description "Show 'Would have caught X violations' on cards.

## PRD References
- Task 4.10
- D12 (Engagement loop)

## Acceptance Criteria
- [ ] Backtest results on pattern card
- [ ] Violation and PR count
- [ ] Click through to details

## Implementation Details

### Files to Create/Modify
- components/patterns/backtest-preview.tsx

### Notes
Makes action feel consequential.

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.10 ($TASK_4_10)"

TASK_4_10a=$(bd create "Build 'View all violations' modal for backtest results" \
  --type feature \
  --priority 1 \
  --description "Modal listing all BacktestViolation records.

## PRD References
- Task 4.10a

## Acceptance Criteria
- [ ] List all backtest violations
- [ ] Links to original PRs
- [ ] File and line information

## Implementation Details

### Files to Create/Modify
- components/patterns/backtest-detail-modal.tsx

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.10a ($TASK_4_10a)"

TASK_4_11=$(bd create "Implement keyboard-driven triage queue" \
  --type feature \
  --priority 0 \
  --description "Superhuman-style queue with j/k/p/r/d shortcuts.

## PRD References
- Task 4.11
- D13 (Pattern mental model)
- D17 (Queue sorting)

## Acceptance Criteria
- [ ] j/k for next/previous
- [ ] p for Promote, r for Reject, d for Defer
- [ ] Progress bar
- [ ] Deferred patterns separate section

## Implementation Details

### Files to Create/Modify
- app/patterns/triage/page.tsx
- components/patterns/triage-queue.tsx
- hooks/use-keyboard-navigation.ts

### Notes
Per D13: Keyboard-first linear queue.

## Effort
8 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.11 ($TASK_4_11)"

TASK_4_12=$(bd create "Build repo progress page with Realtime updates" \
  --type feature \
  --priority 1 \
  --description "Live progress during ingestion and extraction.

## PRD References
- Task 4.12

## Acceptance Criteria
- [ ] Subscribe to repos UPDATE events
- [ ] Subscribe to patterns INSERT events
- [ ] Animate pattern list on completion
- [ ] Unsubscribe on unmount

## Implementation Details

### Files to Create/Modify
- app/repos/[id]/progress/page.tsx
- hooks/use-extraction-progress.ts

### Notes
Per D16: Batch completion, not streaming.

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.12 ($TASK_4_12)"

TASK_4_13=$(bd create "Build evidence management UI with autocomplete" \
  --type feature \
  --priority 1 \
  --description "Modal for evidence management with file path autocomplete.

## PRD References
- Task 4.13
- D21 (Evidence management)

## Acceptance Criteria
- [ ] Autocomplete from repo_files table
- [ ] Validate path exists
- [ ] Set/change canonical example
- [ ] Stale evidence warning badge

## Implementation Details

### Files to Create/Modify
- components/patterns/evidence-modal.tsx
- components/patterns/file-autocomplete.tsx
- app/api/patterns/[id]/evidence/route.ts

### Notes
Per D21: Capture HEAD SHA on add.

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.13 ($TASK_4_13)"

TASK_4_14=$(bd create "Implement merge action for duplicate candidates" \
  --type feature \
  --priority 1 \
  --description "One-click merge to transfer evidence.

## PRD References
- Task 4.14
- D29 (Duplicate detection)

## Acceptance Criteria
- [ ] Duplicate card variant
- [ ] Merge copies evidence to target
- [ ] Candidate deleted
- [ ] Success toast

## Implementation Details

### Files to Create/Modify
- components/patterns/duplicate-card.tsx
- app/api/patterns/[id]/merge/route.ts

### Notes
Keyboard shortcut: 'm' for merge.

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.14 ($TASK_4_14)"

TASK_4_15=$(bd create "Filesystem pattern card UI with 2 confidence pills" \
  --type feature \
  --priority 1 \
  --description "Display filesystem patterns with 2-dimension confidence.

## PRD References
- Task 4.15
- D34 (2-dimension confidence)

## Acceptance Criteria
- [ ] 2 confidence pills (Evidence, Adoption)
- [ ] Path examples and glob pattern
- [ ] Type badge

## Implementation Details

### Files to Create/Modify
- components/patterns/filesystem-card.tsx

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.15 ($TASK_4_15)"

TASK_4_16=$(bd create "Enforcement channel toggles in promotion modal" \
  --type feature \
  --priority 1 \
  --description "Add PR Review and AI Agents checkboxes.

## PRD References
- Task 4.16
- D30 (Dual channel)

## Acceptance Criteria
- [ ] PR Review checkbox (default: true)
- [ ] AI Agents checkbox (default: true)
- [ ] Severity dropdown per channel

## Implementation Details

### Files to Create/Modify
- components/patterns/actions/enforcement-toggles.tsx

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.16 ($TASK_4_16)"

TASK_4_17=$(bd create "Disable PR enforcement for file-structure patterns" \
  --type task \
  --priority 2 \
  --description "Show tooltip for file-structure PR enforcement.

## PRD References
- Task 4.17
- D35 (Context-file-only)

## Acceptance Criteria
- [ ] PR Review disabled for file-structure
- [ ] Tooltip explains why

## Implementation Details

### Files to Create/Modify
- components/patterns/actions/enforcement-toggles.tsx

## Effort
1 hour" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-4.17 ($TASK_4_17)"

# --- Epic 5a: Context Files Tasks ---

echo ""
echo "=== Creating Context Files Tasks ==="
echo ""

TASK_5a_1=$(bd create "ContextFileConfig data model and API" \
  --type task \
  --priority 0 \
  --description "Store format, targetPath, syncEnabled per repo.

## PRD References
- Task 5a.1
- D32 (Claude + Cursor formats)

## Acceptance Criteria
- [ ] ContextFileConfig table created
- [ ] CRUD API for config
- [ ] Default configs on repo connection

## Implementation Details

### Files to Create/Modify
- lib/db/context-configs.ts
- app/api/repos/[id]/context-config/route.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.1 ($TASK_5a_1)"

TASK_5a_2=$(bd create "Context file setup UI (Workflow 9)" \
  --type feature \
  --priority 1 \
  --description "UI for selecting formats and customizing paths.

## PRD References
- Task 5a.2

## Acceptance Criteria
- [ ] Format selection (Claude, Cursor)
- [ ] Path customization
- [ ] Sync toggle

## Implementation Details

### Files to Create/Modify
- app/repos/[id]/context/setup/page.tsx
- components/context/format-selector.tsx

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.2 ($TASK_5a_2)"

TASK_5a_3=$(bd create "Pattern → markdown transformer (base)" \
  --type feature \
  --priority 0 \
  --description "Convert authoritative patterns to markdown.

## PRD References
- Task 5a.3
- D30 (Dual channel)

## Acceptance Criteria
- [ ] Patterns with aiContext=true included
- [ ] Structured markdown
- [ ] Evidence references included

## Implementation Details

### Files to Create/Modify
- lib/context-files/transform.ts

### Notes
Per D30: Only enforcement.aiContext=true patterns.

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
bd label add "$TASK_5a_3" critical-path 2>/dev/null || true
echo "Created: task-5a.3 ($TASK_5a_3)"

TASK_5a_4=$(bd create "Format adapters for Claude and Cursor" \
  --type task \
  --priority 0 \
  --description "Adjust tone and structure for each tool.

## PRD References
- Task 5a.4
- D32 (Formats)

## Acceptance Criteria
- [ ] Claude format: CLAUDE.md structure
- [ ] Cursor format: .cursorrules structure
- [ ] Tool-specific conventions respected

## Implementation Details

### Files to Create/Modify
- lib/context-files/adapters/claude.ts
- lib/context-files/adapters/cursor.ts

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.4 ($TASK_5a_4)"

TASK_5a_5=$(bd create "Filesystem pattern → markdown transformer" \
  --type task \
  --priority 1 \
  --description "Convert filesystem patterns for context files.

## PRD References
- Task 5a.5
- D31 (Filesystem patterns)

## Acceptance Criteria
- [ ] Dedicated section for filesystem
- [ ] Glob patterns shown
- [ ] Anti-pattern examples included

## Implementation Details

### Files to Create/Modify
- lib/context-files/filesystem-transform.ts

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.5 ($TASK_5a_5)"

TASK_5a_6=$(bd create "Marker-based file append logic" \
  --type task \
  --priority 0 \
  --description "Detect markers and replace only managed section.

## PRD References
- Task 5a.6
- D33 (Marker-based append)

## Acceptance Criteria
- [ ] Markers: <!-- REASONING_SUBSTRATE_START/END -->
- [ ] User content outside markers preserved
- [ ] New files created with just managed section

## Implementation Details

### Files to Create/Modify
- lib/context-files/marker-append.ts

### Notes
Never touch content outside markers.

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.6 ($TASK_5a_6)"

TASK_5a_7=$(bd create "Debounced sync trigger on pattern changes" \
  --type task \
  --priority 0 \
  --description "Trigger.dev job with 5-10s delay.

## PRD References
- Task 5a.7
- D36 (Debounced sync)

## Acceptance Criteria
- [ ] Pattern changes queue regeneration
- [ ] 5-10s debounce window
- [ ] Batch multiple changes

## Implementation Details

### Files to Create/Modify
- jobs/sync-context-files.ts

### Dependencies
- @trigger.dev/sdk

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.7 ($TASK_5a_7)"

TASK_5a_8=$(bd create "Manual download/copy UI for context files" \
  --type feature \
  --priority 1 \
  --description "Download or copy generated content.

## PRD References
- Task 5a.8

## Acceptance Criteria
- [ ] Download generated file
- [ ] Copy to clipboard
- [ ] Preview in modal

## Implementation Details

### Files to Create/Modify
- components/context/download-modal.tsx

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.8 ($TASK_5a_8)"

TASK_5a_9=$(bd create "AI Agent Sync dashboard widget (Workflow 10)" \
  --type feature \
  --priority 1 \
  --description "Show sync status and manual regenerate.

## PRD References
- Task 5a.9

## Acceptance Criteria
- [ ] Sync status indicator
- [ ] Last updated timestamp
- [ ] Pattern counts per format
- [ ] Manual regenerate button

## Implementation Details

### Files to Create/Modify
- components/dashboard/context-sync-widget.tsx

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5a.9 ($TASK_5a_9)"

# --- Epic 5b: PR Enforcement Tasks ---

echo ""
echo "=== Creating PR Enforcement Tasks ==="
echo ""

TASK_5b_1=$(bd create "Set up GitHub webhook endpoint with signature verification" \
  --type feature \
  --priority 0 \
  --description "Endpoint for PR events with security verification.

## PRD References
- Task 5b.1

## Acceptance Criteria
- [ ] Endpoint at /api/github/webhook
- [ ] Signature verified
- [ ] 401 for invalid signatures
- [ ] Rejected webhooks logged

## Implementation Details

### Files to Create/Modify
- app/api/github/webhook/route.ts
- lib/github/webhook-verify.ts

### Dependencies
- @octokit/webhooks-methods

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
bd label add "$TASK_5b_1" critical-path 2>/dev/null || true
echo "Created: task-5b.1 ($TASK_5b_1)"

TASK_5b_2=$(bd create "Fetch PR diff on webhook event" \
  --type task \
  --priority 0 \
  --description "Retrieve diff for PR analysis.

## PRD References
- Task 5b.2

## Acceptance Criteria
- [ ] Diff fetched from GitHub API
- [ ] Full diff available for analysis

## Implementation Details

### Files to Create/Modify
- lib/github/diff.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.2 ($TASK_5b_2)"

TASK_5b_3=$(bd create "Build code pattern violation detection for PRs" \
  --type feature \
  --priority 0 \
  --description "Compare PR diff against authoritative patterns.

## PRD References
- Task 5b.3
- D30 (Dual channel)

## Acceptance Criteria
- [ ] Only prReview=true patterns checked
- [ ] Uses shared violation module
- [ ] Returns violations

## Implementation Details

### Files to Create/Modify
- lib/enforcement/pr-analysis.ts

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
bd label add "$TASK_5b_3" critical-path 2>/dev/null || true
echo "Created: task-5b.3 ($TASK_5b_3)"

TASK_5b_4=$(bd create "File naming violation detection via regex" \
  --type task \
  --priority 1 \
  --description "Match new file paths against globs.

## PRD References
- Task 5b.4
- D35 (File-naming enforcement)

## Acceptance Criteria
- [ ] New files checked against globs
- [ ] Only prReview=true patterns
- [ ] Violations created

## Implementation Details

### Files to Create/Modify
- lib/enforcement/file-naming.ts

### Dependencies
- minimatch

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.4 ($TASK_5b_4)"

TASK_5b_5=$(bd create "Detect pattern evolution in PR diffs" \
  --type feature \
  --priority 0 \
  --description "Check if diff modifies evidence files.

## PRD References
- Task 5b.5
- D27 (Evolution detection)

## Acceptance Criteria
- [ ] Changed files compared against evidence
- [ ] PatternEvolutionRequest created
- [ ] isCanonical flag set

## Implementation Details

### Files to Create/Modify
- lib/enforcement/evolution-detect.ts
- lib/db/pattern-evolution.ts

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
bd label add "$TASK_5b_5" critical-path 2>/dev/null || true
echo "Created: task-5b.5 ($TASK_5b_5)"

TASK_5b_6=$(bd create "Generate diff summary for evolution requests" \
  --type task \
  --priority 1 \
  --description "LLM summarizes evidence file changes.

## PRD References
- Task 5b.6
- D27 (Evolution)

## Acceptance Criteria
- [ ] LLM generates concise summary
- [ ] Stored in PatternEvolutionRequest

## Implementation Details

### Files to Create/Modify
- lib/enforcement/diff-summary.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.6 ($TASK_5b_6)"

TASK_5b_7=$(bd create "Create Trigger.dev analyzePR job" \
  --type task \
  --priority 0 \
  --description "Background job for PR analysis.

## PRD References
- Task 5b.7

## Acceptance Criteria
- [ ] Job triggered on webhook
- [ ] Updates analysisStatus
- [ ] Errors captured

## Implementation Details

### Files to Create/Modify
- jobs/analyze-pr.ts

### Dependencies
- @trigger.dev/sdk

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.7 ($TASK_5b_7)"

TASK_5b_8=$(bd create "Store violations with idempotency" \
  --type task \
  --priority 0 \
  --description "Store violations with duplicate prevention.

## PRD References
- Task 5b.8
- D19 (Severity)

## Acceptance Criteria
- [ ] Violations stored with references
- [ ] Severity from pattern.defaultSeverity
- [ ] Idempotent storage

## Implementation Details

### Files to Create/Modify
- lib/db/violations.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.8 ($TASK_5b_8)"

TASK_5b_9=$(bd create "Post inline PR comments for violations" \
  --type feature \
  --priority 0 \
  --description "Post comments with owner attribution.

## PRD References
- Task 5b.9
- D12 (Attribution)

## Acceptance Criteria
- [ ] Inline comment at violation location
- [ ] Pattern name and type
- [ ] Owner attribution
- [ ] Rationale snippet
- [ ] Dismiss link

## Implementation Details

### Files to Create/Modify
- lib/github/comments.ts
- lib/enforcement/comment-template.ts

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
bd label add "$TASK_5b_9" critical-path 2>/dev/null || true
echo "Created: task-5b.9 ($TASK_5b_9)"

TASK_5b_10=$(bd create "Post pattern evolution PR comments" \
  --type feature \
  --priority 1 \
  --description "Notify pattern owner on evidence modification.

## PRD References
- Task 5b.10
- D27 (Evolution)

## Acceptance Criteria
- [ ] Comment when evidence modified
- [ ] Different format for canonical
- [ ] Diff summary included
- [ ] Review link

## Implementation Details

### Files to Create/Modify
- lib/enforcement/evolution-comment.ts

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.10 ($TASK_5b_10)"

TASK_5b_11=$(bd create "Post GitHub status check based on violations" \
  --type feature \
  --priority 0 \
  --description "Update commit status check.

## PRD References
- Task 5b.11

## Acceptance Criteria
- [ ] Status check: 'Reasoning Substrate'
- [ ] Any error → failure
- [ ] Warning only → success
- [ ] None → success

## Implementation Details

### Files to Create/Modify
- lib/github/status-check.ts

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.11 ($TASK_5b_11)"

TASK_5b_12=$(bd create "Status check for pending evolution reviews" \
  --type feature \
  --priority 1 \
  --description "Block merge for canonical modifications.

## PRD References
- Task 5b.12
- D27 (Evolution)

## Acceptance Criteria
- [ ] Canonical modified → pending state
- [ ] Non-canonical → success with note

## Implementation Details

### Files to Create/Modify
- lib/github/status-check.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.12 ($TASK_5b_12)"

TASK_5b_13=$(bd create "Build PR analysis history UI" \
  --type feature \
  --priority 2 \
  --description "Show PR analysis history.

## PRD References
- Task 5b.13

## Acceptance Criteria
- [ ] List of analyzed PRs
- [ ] Violation count per PR
- [ ] Click through to details

## Implementation Details

### Files to Create/Modify
- app/repos/[id]/prs/page.tsx
- components/prs/pr-list.tsx

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.13 ($TASK_5b_13)"

TASK_5b_14=$(bd create "Build violation detail page with dismiss action" \
  --type feature \
  --priority 0 \
  --description "View and dismiss violations from PR comments.

## PRD References
- Task 5b.14
- D26 (Dismissal)

## Acceptance Criteria
- [ ] Violation details displayed
- [ ] Dismiss with optional reason
- [ ] False positive checkbox
- [ ] Auth required

## Implementation Details

### Files to Create/Modify
- app/violations/[id]/page.tsx
- components/violations/dismiss-modal.tsx

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.14 ($TASK_5b_14)"

TASK_5b_15=$(bd create "Build pattern evolution review page" \
  --type feature \
  --priority 0 \
  --description "Review page for accepting/rejecting changes.

## PRD References
- Task 5b.15
- D27 (Evolution)

## Acceptance Criteria
- [ ] Diff summary displayed
- [ ] Current pattern definition shown
- [ ] Accept: update evidence
- [ ] Reject: create violation

## Implementation Details

### Files to Create/Modify
- app/patterns/[id]/evolution/[requestId]/page.tsx
- components/patterns/evolution-review.tsx

## Effort
6 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.15 ($TASK_5b_15)"

TASK_5b_16=$(bd create "Handle PR merged/closed webhooks for evolution lifecycle" \
  --type task \
  --priority 1 \
  --description "Update evolution request on PR lifecycle.

## PRD References
- Task 5b.16
- D27 (Evolution)

## Acceptance Criteria
- [ ] PR merge → status='historical'
- [ ] PR closed → status='cancelled'

## Implementation Details

### Files to Create/Modify
- app/api/webhooks/github/route.ts
- lib/evolution/lifecycle.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-5b.16 ($TASK_5b_16)"

# --- Epic 6: Polish Tasks ---

echo ""
echo "=== Creating Polish Tasks ==="
echo ""

TASK_6_1a=$(bd create "Add lastError field to Repo and PullRequest" \
  --type task \
  --priority 0 \
  --description "Store error messages for debugging.

## PRD References
- Task 6.1a

## Acceptance Criteria
- [ ] lastError on Repo and PullRequest
- [ ] Cleared on successful operation

## Implementation Details

### Files to Create/Modify
- supabase/migrations/002_error_fields.sql

## Effort
1 hour" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.1a ($TASK_6_1a)"

TASK_6_1b=$(bd create "Extraction error handling with UI feedback" \
  --type task \
  --priority 0 \
  --description "Catch LLM errors, show retry button.

## PRD References
- Task 6.1b

## Acceptance Criteria
- [ ] LLM errors caught and logged
- [ ] extractionStatus set to 'failed'
- [ ] UI shows retry

## Implementation Details

### Files to Create/Modify
- jobs/extract-patterns.ts
- components/repos/extraction-error.tsx

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.1b ($TASK_6_1b)"

TASK_6_1e=$(bd create "GitHub rate limit handling with backoff" \
  --type task \
  --priority 0 \
  --description "Check rate limits, exponential backoff.

## PRD References
- Task 6.1e

## Acceptance Criteria
- [ ] Check rate limit headers
- [ ] Back off when <100 remaining
- [ ] Exponential backoff on 403

## Implementation Details

### Files to Create/Modify
- lib/github/rate-limit.ts

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.1e ($TASK_6_1e)"

TASK_6_1f=$(bd create "LLM rate limit handling with Trigger.dev retry" \
  --type task \
  --priority 0 \
  --description "Catch Anthropic 429, queue retry.

## PRD References
- Task 6.1f

## Acceptance Criteria
- [ ] 429 responses caught
- [ ] Retry queued via Trigger.dev
- [ ] Exponential backoff

## Implementation Details

### Files to Create/Modify
- lib/anthropic/rate-limit.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.1f ($TASK_6_1f)"

TASK_6_2=$(bd create "Configure Trigger.dev job retry logic" \
  --type task \
  --priority 0 \
  --description "Set max attempts and exponential backoff.

## PRD References
- Task 6.2

## Acceptance Criteria
- [ ] Max 3 attempts configured
- [ ] Exponential backoff
- [ ] Integrates with error handling

## Implementation Details

### Files to Create/Modify
- trigger.config.ts
- jobs/*.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.2 ($TASK_6_2)"

TASK_6_3=$(bd create "Add loading states and progress indicators" \
  --type task \
  --priority 1 \
  --description "Loading spinners and progress indicators.

## PRD References
- Task 6.3

## Acceptance Criteria
- [ ] Loading spinner for data fetching
- [ ] Progress during extraction
- [ ] Skeleton loaders

## Implementation Details

### Files to Create/Modify
- components/ui/loading.tsx
- components/ui/skeleton.tsx

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.3 ($TASK_6_3)"

TASK_6_4=$(bd create "Add empty states for all views" \
  --type task \
  --priority 1 \
  --description "Helpful empty states.

## PRD References
- Task 6.4

## Acceptance Criteria
- [ ] Empty state for no patterns
- [ ] Empty state for no violations
- [ ] Empty state for no repos

## Implementation Details

### Files to Create/Modify
- components/ui/empty-state.tsx

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.4 ($TASK_6_4)"

TASK_6_5=$(bd create "Implement re-extraction trigger" \
  --type feature \
  --priority 0 \
  --description "Manual 're-analyze repo' button.

## PRD References
- Task 6.5
- D9 (Re-extraction)

## Acceptance Criteria
- [ ] Button triggers re-extraction
- [ ] Candidates/deferred deleted
- [ ] Authoritative preserved
- [ ] Rejected preserved

## Implementation Details

### Files to Create/Modify
- components/repos/re-extract-button.tsx
- app/api/repos/[id]/re-extract/route.ts

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.5 ($TASK_6_5)"

TASK_6_5a=$(bd create "Evidence re-capture for authoritative patterns" \
  --type task \
  --priority 0 \
  --description "Re-analyze evidence files to refresh line numbers.

## PRD References
- Task 6.5a

## Acceptance Criteria
- [ ] Evidence files re-analyzed
- [ ] startLine, endLine, snippet updated
- [ ] capturedAtSha updated

## Implementation Details

### Files to Create/Modify
- lib/extraction/evidence-recapture.ts

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.5a ($TASK_6_5a)"

TASK_6_7=$(bd create "Build weekly impact digest dashboard widget" \
  --type feature \
  --priority 1 \
  --description "Rolling 7-day window with time saved.

## PRD References
- Task 6.7
- D12 (Engagement loop)

## Acceptance Criteria
- [ ] Last 7 days violations count
- [ ] Time saved (violations × 15 min)
- [ ] Top 3 patterns

## Implementation Details

### Files to Create/Modify
- components/dashboard/impact-digest.tsx
- lib/metrics/impact.ts

### Notes
AVG_REVIEW_MINUTES = 15

## Effort
4 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.7 ($TASK_6_7)"

TASK_6_8=$(bd create "Basic settings UI" \
  --type feature \
  --priority 2 \
  --description "Settings for notifications and repo management.

## PRD References
- Task 6.8

## Acceptance Criteria
- [ ] Notification preferences
- [ ] Repo management (disconnect)
- [ ] User profile

## Implementation Details

### Files to Create/Modify
- app/settings/page.tsx
- app/settings/repos/page.tsx

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.8 ($TASK_6_8)"

TASK_6_10=$(bd create "Implement daily auto-archive scheduled job" \
  --type task \
  --priority 1 \
  --description "Archive weak patterns unreviewed for 60 days.

## PRD References
- Task 6.10
- D18 (Rejection)

## Acceptance Criteria
- [ ] Daily job at 03:00 UTC
- [ ] Weak patterns 60+ days auto-rejected
- [ ] rejectionReason set

## Implementation Details

### Files to Create/Modify
- jobs/auto-archive.ts

### Dependencies
- @trigger.dev/sdk

## Effort
3 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.10 ($TASK_6_10)"

TASK_6_11=$(bd create "Implement auth flow deep linking with returnTo" \
  --type task \
  --priority 1 \
  --description "Preserve original URL through OAuth.

## PRD References
- Task 6.11

## Acceptance Criteria
- [ ] returnTo stored in cookie/session
- [ ] Redirect to original URL post-login
- [ ] Works for violation dismissal

## Implementation Details

### Files to Create/Modify
- app/auth/callback/route.ts
- lib/auth/deep-link.ts

## Effort
2 hours" \
  --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Created: task-6.11 ($TASK_6_11)"

# ============================================
# SUMMARY
# ============================================

echo ""
echo "============================================"
echo "=== Part 2 Complete ==="
echo "============================================"
echo ""
echo "Additional tasks created:"
echo "- Validation: 17 tasks"
echo "- Context Files: 9 tasks"
echo "- PR Enforcement: 16 tasks"
echo "- Polish: 12 tasks"
echo ""
echo "Total additional: 54 tasks"
echo ""
echo "Run 'bd list --status open' to see all issues"
echo "Run 'bd ready' to see ready tasks"
