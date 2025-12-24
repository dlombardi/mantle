# REASONING SUBSTRATE
## Product Exploration Workbook

**The Codebase Consciousness Platform**

Version 0.2 — December 2025  
Status: Active Exploration

---

## AI Agent Instructions

> **Read this entire section before doing anything else. This document is designed for progressive, iterative exploration by an AI agent working with a human.**

### Purpose

This workbook captures the evolving understanding of a product idea. It is **not** meant to be completed in one session. Each session should advance exploration incrementally — deepening understanding, filling gaps, making decisions, and surfacing new questions.

### Session Protocol

**Every session must follow this sequence:**

#### 1. ORIENT (Start of Session)

```
□ Read the Status Summary table (immediately below this section)
□ Check Appendix D: Exploration Roadmap for suggested priorities
□ Scan for [Unexplored] or [Partial] sections relevant to user's request
□ If user doesn't specify focus → recommend the highest-priority gap
```

#### 2. EXPLORE (During Session)

```
□ Dive deep into selected territory/sub-section
□ Ask clarifying questions if intent is ambiguous
□ Generate concrete artifacts: frameworks, models, examples
□ Challenge assumptions — play devil's advocate
□ Connect insights across territories (Solution ↔ Business ↔ GTM)
```

#### 3. UPDATE (During & End of Session)

```
□ Update section content with new insights/conclusions
□ Update status tags: [Unexplored] → [Partial] → [Explored]
□ Update confidence indicators: ●○○ → ●●○ → ●●●
□ Clear ⚠️ GAP warnings when addressed (or refine them)
□ Update the Status Summary table to reflect changes
□ Add entry to Changelog at bottom of document
```

#### 4. DECIDE (When Appropriate)

When a decision is locked (explicitly by user or through logical conclusion):

```
□ Add entry to Appendix A: Decision Log using template
□ Reference decision ID (D1, D2, etc.) in relevant sections
□ Mark related hypotheses in Appendix C if validated/invalidated
□ Change section status to [Decided] if fully resolved
```

#### 5. CAPTURE (Ongoing)

As new questions or hypotheses emerge during exploration:

```
□ Add new questions to Appendix B: Open Questions Backlog
□ Add testable claims to Appendix C: Hypothesis Register
□ Update Appendix D: Exploration Roadmap if priorities shift
```

### Status Conventions

**Section Status Tags:**
| Tag | Meaning |
|-----|---------|
| `[Unexplored]` | Not yet addressed; placeholder or gap warning only |
| `[Partial]` | Some progress; key gaps remain (marked with ⚠️) |
| `[Explored]` | Substantively addressed; may evolve but core is solid |
| `[Decided]` | Locked decision; references Decision Log entry |

**Confidence Indicators:**
| Indicator | Meaning |
|-----------|---------|
| `●○○ Low` | Hypothesis-level; needs validation |
| `●●○ Medium` | Reasoned position; some evidence supports it |
| `●●● High` | Strong conviction; validated or logically sound |

**Gap Markers:**
| Marker | Meaning |
|--------|---------|
| `⚠️ GAP:` | Missing information or unresolved question |
| `⚠️ RISK:` | Threat requiring monitoring or mitigation |
| `⚠️ CRITICAL GAP:` | Blocking issue; prioritize immediately |

### Document Rules

1. **Preserve structure** — Never delete sections; mark `[Decided: N/A]` if irrelevant
2. **Be additive** — Add detail; don't delete unless explicitly superseded
3. **Timestamp changes** — Note `[Updated: Date]` for significant revisions
4. **Cross-reference** — Link sections: "See 2.3" or "Per Decision D2"
5. **Keep appendices current** — They are project memory

### Priority Framework

When choosing what to work on (if user doesn't specify):

1. **Blocking gaps** — `[Unexplored]` sections that downstream work depends on
2. **High-priority questions** — Items in Appendix B marked "High Priority"
3. **Roadmap sequence** — Follow Appendix D phases
4. **Low-confidence areas** — `●○○` sections needing validation

### End-of-Session Checklist

Before concluding any session:

```
□ Updated relevant section content
□ Updated status tags and confidence levels  
□ Added new decisions to Appendix A (if any)
□ Added new questions to Appendix B (if any)
□ Updated Status Summary table
□ Added Changelog entry
□ Stated recommended next focus area
```

---

## Status Summary

| Territory | Status | Confidence | Key Gap | Last Updated |
|-----------|--------|------------|---------|--------------|
| 1. Problem Space | `[Explored]` | ●●● High | Validate with customers | Dec 2025 |
| 2. Solution Space | `[Explored]` | ●●● High | — | Dec 2025 |
| 3. Market Space | `[Explored]` | ●●○ Medium | Positioning untested | Dec 2025 |
| 4. Business Space | `[Deferred]` | — | Intentionally deferred until post-dogfood | Dec 2025 |
| 5. GTM Space | `[Partial]` | ●●○ Medium | No sales motion | Dec 2025 |
| 6. Execution Space | `[Explored]` | ●●● High | — | Dec 2025 |

**Next Recommended Focus:** Begin build (Phase 1) — all pre-build planning complete

---

## Table of Contents

- [AI Agent Instructions](#ai-agent-instructions)
- [Status Summary](#status-summary)
- [0. Executive Summary](#0-executive-summary)
- [1. Problem Space](#1-problem-space)
- [2. Solution Space](#2-solution-space)
- [3. Market Space](#3-market-space)
- [4. Business Space](#4-business-space)
- [5. Go-to-Market Space](#5-go-to-market-space)
- [6. Execution Space](#6-execution-space)
- [Appendix A: Decision Log](#appendix-a-decision-log)
- [Appendix B: Open Questions Backlog](#appendix-b-open-questions-backlog)
- [Appendix C: Hypothesis Register](#appendix-c-hypothesis-register)
- [Appendix D: Exploration Roadmap](#appendix-d-exploration-roadmap)
- [Changelog](#changelog)

---

## 0. Executive Summary
`[Partial]`

### 0.1 One-Liner
`[Updated: Dec 2025]`

> The pattern governance layer for AI-augmented engineering teams — extract once, enforce everywhere, whether code comes from AI agents or human contributors.

### 0.2 Key Bets
`[Updated: Dec 2025]`

1. **Patterns are the right unit of abstraction** — Organizations think in conventions, not files. Codifying this unlocks leverage.
2. **AI extraction + human validation** — Neither pure AI nor pure manual approaches work. The hybrid loop is the product.
3. **Provenance enables AI reasoning** — Decision history and the "Why" behind patterns lets AI agents reason about intent, not just comply with rules.
4. **Dual-channel enforcement is table stakes** — Teams have mixed workflows (AI agents + manual contributors). Governance must cover both.
5. **Filesystem patterns are architectural** — Directory structure and naming conventions are decisions that drift. AI agents need this guidance to generate correctly.

### 0.3 Current Confidence Level

| Dimension | Confidence | Key Gap |
|-----------|------------|---------|
| Problem exists | ●●● High | Need customer validation |
| Solution is right | ●●○ Medium | Cold start / time-to-value untested |
| We can win market | ●●○ Medium | Copilot trajectory unclear |
| Business model works | ●○○ Low | Deferred until post-dogfood |
| We can execute | ●●● High | MVP, build sequence, milestones, risk register complete |

---

## 1. Problem Space
`[Explored]` · Confidence: ●●● High · Last Updated: Dec 2025

### 1.1 Problem Statement
`[Explored]`

**Core Problem:** Codebases accumulate Institutional Memory Loss — context evaporates, documentation rots, and conventions become tribal knowledge.

**Modern Amplifier:** The "Vibe Coding" Bottleneck. AI-generated code amplifies architectural drift at a pace that makes manual senior engineer review impossible to scale. Every Copilot suggestion that ignores your conventions compounds technical debt.

**Business Impact:** Research shows 124% more development time required in unhealthy code (CodeScene, 2024). Pattern violations correlate with defects and extended cycle times.

### 1.2 User Segments
`[Explored]`

| Segment | Core Pain Point | Value Proposition |
|---------|-----------------|-------------------|
| New Hires | Lack of context; slow ramp-up | Knowledge Graph & Evolution Narrative |
| Senior/Staff Eng | Repetitive PR reviews; scaling standards | Observer Agents enforce patterns |
| DevEx/Platform | Executing complex migrations | Actor Agents execute semantic refactoring |
| Managers/VPs | Invisible tech debt; bus factor risk | Cost of Drift metrics; Expertise Map |

### 1.3 Jobs to Be Done
`[Explored]` · Updated: Dec 2025

#### New Hires (Onboarding)

| Type | Job |
|------|-----|
| Functional | When I join a new codebase, I want to understand *why* things are built this way, so I can follow conventions without asking senior engineers constantly |
| Functional | When I'm about to submit my first PR, I want to know if I've violated any patterns, so I can fix issues before review |
| Emotional | When ramping up, I want to feel like I have a knowledgeable guide, so I don't feel lost or like a burden |

#### Senior/Staff Engineers (Pattern Owners — Daily Users)

| Type | Job |
|------|-----|
| Functional | When reviewing PRs, I want violations auto-flagged with context, so I can stop repeating myself about patterns and focus on design decisions |
| Functional | When I establish a new pattern, I want to codify it with ownership and governance rules, so enforcement happens without me being the bottleneck |
| Functional | When a pattern needs to evolve (e.g., styled-components → emotion), I want to see every usage and plan a phased migration, so I can deprecate safely |
| Functional | When I'm away or move teams, I want clear escalation paths and review cadences, so patterns don't rot without me |
| Functional | When Copilot suggests code that violates our patterns, I want it corrected or flagged before it's even committed, so AI velocity doesn't become AI debt |
| Social | When I invest in architectural decisions, I want them to outlast my tenure, so my work has lasting impact |
| Emotional | When I open my PR queue, I want to see design questions not convention violations, so I'm not drained by repetitive feedback |

#### DevEx/Platform (Budget Owner)

| Type | Job |
|------|-----|
| Functional | When rolling out org-wide standards (e.g., outbox pattern), I want to define it once and track adoption across all services, so I know who's compliant and who's not |
| Functional | When planning migrations, I want exact scope, dependencies, and progress tracking, so I can estimate accurately and report status |
| Functional | When justifying DevEx investment, I want metrics on pattern compliance and drift reduction, so I can show ROI to leadership |
| Functional | When assessing the codebase, I want to identify low-coverage "dead zones," so I can surface knowledge silo risks before they become problems |
| Functional | When evaluating new DevEx tools, I want to see value within the first hour, so I can justify the investment without a long implementation cycle |
| Functional | When two teams have conflicting patterns, I want a governance process to resolve it, so we converge instead of fragment |
| Emotional | When AI coding tools scale across the org, I want confidence the output matches our standards, so I'm not creating a governance nightmare |

#### Managers/VPs (Visibility Buyer)

| Type | Job |
|------|-----|
| Functional | When assessing tech debt, I want to see where architectural drift is worst, so I can prioritize remediation investment |
| Functional | When key engineers leave, I want their architectural knowledge captured in the system, so we don't lose institutional memory |
| Functional | When analyzing the codebase, I want to see pattern "dead zones" and areas of idiosyncratic uniqueness, so I can identify where tribal knowledge risk is highest — and potentially where our differentiated value lives |
| Social | When reporting to the C-suite, I want credible before/after metrics on refactors, so I can demonstrate eng investment ROI |

#### Cross-Cutting Jobs (All Engineers)

| Type | Job |
|------|-----|
| Functional | When I'm writing code in my IDE, I want pattern violations surfaced inline before I commit, so I don't waste cycles on avoidable PR feedback |
| Functional | When I inherit a pattern I don't understand, I want to see the original rationale and decision history, so I don't accidentally undo good decisions |

#### Key Dynamics

**Buyer vs. User Gap:** DevEx/Platform owns budget but Senior/Staff Engineers are daily users. Product must deliver:
- **To Budget Owner:** ROI metrics, governance visibility, fast time-to-value for evaluation
- **To Daily User:** Reduced PR burden, pattern codification leverage, provenance preservation

**Pattern Coverage as Strategic Lens:** "Dead zones" (low pattern coverage) reveal both *risk* (knowledge silos, tribal knowledge) and potentially *value* (differentiated competitive advantage). This dual narrative is compelling for VP/C-suite conversations.

### 1.4 Current Alternatives
`[Explored]`

How do organizations solve this problem today?

- **Tribal knowledge + onboarding docs** — Doesn't scale, goes stale, depends on individuals
- **CONTRIBUTING.md + PR templates** — Static, not enforced, easily ignored
- **Linters + static analysis** — Syntax-level only, can't capture semantic patterns
- **ADRs (Architecture Decision Records)** — Good intent, poor discoverability, disconnected from code
- **Manual senior review** — Gold standard but doesn't scale

### 1.5 Why Now?
`[Partial]`

- **AI code generation explosion:** Copilot, Cursor, Claude Code — code is being written faster than ever, but without organizational context.
- **LLM capability inflection:** Models can now understand and extract semantic patterns from code at scale.
- **Cost collapse:** LLM inference prices fell 40x+ per year (2023-2024), making continuous analysis economically viable.

> ⚠️ **GAP:** Need stronger "Why Now" narrative. What's the triggering event that makes this urgent?

---

## 2. Solution Space
`[Explored]` · Confidence: ●●● High · Last Updated: Dec 2025

### 2.1 Core Abstraction: Pattern as First-Class Entity
`[Explored]`

The **Pattern** is the central data structure — a human-validated architectural convention extracted from code.

#### What is a Pattern?

A Pattern is an abstract definition that describes a recurring structure in your codebase. It's not the code itself — it's the *concept* that multiple pieces of code implement.

| Component | Storage | Editable? | Purpose |
|-----------|---------|-----------|---------|
| **Definition** | Our DB | Yes | Name, description — what the LLM uses for violation detection |
| **Evidence** | Pointers to repo files | Add/remove | Concrete code locations that exemplify this pattern |
| **Canonical Example** | One evidence item | Changeable | The best illustration; used as few-shot context for LLM |
| **Confidence** | Our DB (computed) | No | Multi-dimensional scoring: Evidence, Adoption, Establishment, Location |
| **Health Signals** | Our DB (computed) | No | Objective observations about quality concerns |
| **Rationale** | Our DB | Yes | The "Why" — human-authored context |
| **Provenance** | Our DB | Add/remove | Links to PRs, docs, discussions explaining the decision |

#### Pattern Lifecycle

Patterns flow through defined states:

```
Candidate → Authoritative (human validated, enforced)
         → Rejected (dismissed as noise)
         → Deferred (revisit later)

Authoritative → Deprecated (superseded, post-MVP)
```

#### What Makes This Different?

Traditional tools operate at file-level (linters) or service-level (Backstage). Patterns capture **semantic meaning** — the convention itself, independent of where it's implemented.

This enables:
- **Enforcement** at the concept level ("all API routes must handle errors this way")
- **Provenance** linking decisions to patterns, not files
- **Confidence scoring** based on team adoption, not just file count

*Reference: Decision D1*

---

#### Dual Channel Architecture
`[Added: Dec 2025]`

Authoritative patterns serve as a single source of truth consumed through two enforcement channels:

```
                    ┌─────────────────────────┐
                    │   Authoritative Pattern │
                    │   + Provenance ("Why")  │
                    └───────────┬─────────────┘
                                │
                ┌───────────────┴───────────────┐
                ↓                               ↓
    ┌───────────────────────┐       ┌───────────────────────┐
    │   AI Agent Channel    │       │   PR Review Channel   │
    │   (prevention)        │       │   (enforcement)       │
    └───────────────────────┘       └───────────────────────┘
                │                               │
                ↓                               ↓
    ┌───────────────────────┐       ┌───────────────────────┐
    │ Context file sync:    │       │ PR webhook:           │
    │ • CLAUDE.md           │       │ • Violation detection │
    │ • .cursorrules        │       │ • Inline comments     │
    │                       │       │ • Status checks       │
    └───────────────────────┘       └───────────────────────┘
                │                               │
                ↓                               ↓
        AI-generated code               All code changes
        follows patterns                verified on PR
        at generation time              before merge
```

**Why both channels?**

| Scenario | AI Channel | PR Channel |
|----------|------------|------------|
| Team uses only AI agents | Primary | Backup (catches edge cases) |
| Team uses only manual coding | Not applicable | Primary |
| Mixed team (common) | Covers AI contributors | Covers manual contributors |
| AI agent ignores context | — | Catches violations |
| New team member setup | Immediate via context file | Learns from PR feedback |

*Reference: Decision D30*

### 2.2 System Architecture
`[Explored]` · `[Updated: Dec 2025 — reflects D37 stack]`

#### MVP Architecture Overview

The system implements an event-driven loop: **Extract → Validate → Enforce**

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                              │
├─────────────────────────────────────────────────────────────────┤
│  Connect Repo ──► Review Candidates ──► Promote/Reject/Defer    │
└────────┬────────────────────┬───────────────────────┬───────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│   INGESTION     │  │   VALIDATION    │  │    ENFORCEMENT      │
│   (Trigger.dev) │  │   (Web App)     │  │    (Trigger.dev)    │
├─────────────────┤  ├─────────────────┤  ├─────────────────────┤
│ • Index files   │  │ • Triage queue  │  │ • PR webhook        │
│ • Fetch git     │  │ • Confidence UI │  │ • Diff analysis     │
│   history       │  │ • Promote flow  │  │ • Violation detect  │
│ • Fetch PRs     │  │ • Evidence mgmt │  │ • Post PR comments  │
│ • Extract       │  │                 │  │ • Status checks     │
│   patterns      │  │                 │  │                     │
└────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘
         │                    │                       │
         ▼                    ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE (Postgres) + Drizzle ORM                   │
├─────────────────────────────────────────────────────────────────┤
│  Users │ Repos │ Patterns │ Evidence │ PRs │ Violations │ ...   │
└─────────────────────────────────────────────────────────────────┘
```

#### Monorepo Structure

```
mantle/
├── apps/
│   ├── api/                   # Hono backend (port 3001)
│   │   ├── src/
│   │   │   ├── index.ts       # Entry point, middleware
│   │   │   ├── routes/        # API route handlers
│   │   │   └── lib/
│   │   │       ├── db/        # Drizzle schema + client
│   │   │       ├── supabase/  # Supabase admin client
│   │   │       └── trigger/   # Trigger.dev config
│   │   └── drizzle.config.ts
│   │
│   └── web/                   # Vite + React frontend (port 3000)
│       ├── src/
│       │   ├── main.tsx       # React entry point
│       │   ├── routes/        # TanStack Router files
│       │   └── lib/           # Utilities (supabase.ts)
│       └── vite.config.ts
│
├── packages/
│   ├── trpc/                  # Shared tRPC router (@mantle/trpc)
│   └── test-utils/            # Shared testing utilities
│
├── supabase/
│   └── migrations/            # SQL migrations
│
└── turbo.json                 # Turborepo config
```

#### Core Entities

| Entity | Purpose | Key Relationships |
|--------|---------|-------------------|
| **User** | Authenticated GitHub user | Owns repos, validates patterns |
| **Repo** | Connected GitHub repository | Contains patterns, receives PRs |
| **Pattern** | Architectural convention | Has evidence, provenance, violations |
| **PatternEvidence** | Code location exemplifying pattern | Points to files in repo |
| **Provenance** | Link to decision source | Attached to pattern |
| **PullRequest** | Tracked PR for analysis | Analyzed for violations |
| **Violation** | Pattern breach in PR | Links PR to Pattern |

See Section 2.4 for full data model.

#### Background Processing

Long-running tasks execute via Trigger.dev jobs:

| Job | Trigger | Purpose |
|-----|---------|---------|
| `ingestRepo` | Repo connection | Index files, fetch git history, fetch PRs |
| `extractPatterns` | Post-ingestion | LLM identifies patterns, computes confidence |
| `analyzePR` | PR webhook | Detect violations against authoritative patterns |
| `autoArchive` | Daily schedule | Archive stale weak patterns |

#### External Integrations

| Service | Integration Type | Purpose |
|---------|------------------|---------|
| **GitHub** | GitHub App | Repo access, PR webhooks, comments, status checks |
| **Anthropic** | API | Claude Sonnet 4.5 for extraction and violation detection |

*Reference: Decisions D4, D7, D8*

> **Note:** The long-term vision includes a Knowledge Graph interface, persistent agents, and thread-based collaboration. See Appendix E for vision details. MVP implements the focused Extract → Validate → Enforce loop described here.

### 2.3 Agent Model
`[Explored]`

| Agent Type | Function | Risk & Guardrails |
|------------|----------|-------------------|
| **Observer** (Persistent) | Watch code, detect patterns, flag drift, open Threads | Low risk. Detection only. Tunable sensitivity. |
| **Actor** (Ephemeral) | Implement fixes, execute migrations (v1→v2) | Medium risk. PR-gated. Shadow mode available. |
| **Scout** (Pro Feature) | Watch external ecosystem, propose pattern updates | Strategic. Always Candidate status. Expert review required. |

*Reference: Decision D2*

> **MVP Implementation Note:** The "Observer Agent" capabilities are implemented in MVP via Trigger.dev background jobs and webhook handlers rather than a persistent agent architecture. This delivers the same user value (automatic pattern extraction, PR violation detection) through event-driven automation. True persistent agents with autonomous decision loops are a post-MVP architectural evolution.

### 2.4 Data Model
`[Explored]` · Updated: Dec 2025

#### Design Principles

1. **Repo-scoped by default** — All patterns, violations belong to a repo (multi-repo from day 1, per D5)
2. **Provenance is first-class** — Every pattern links to its decision history (per D3)
3. **Status as state machine** — Patterns flow through defined lifecycle states
4. **Evidence-backed** — Patterns link to concrete code locations

#### Entity Relationship Overview
`[Updated: Dec 2025]`

```
User ─────────────────┐
  │                   │
  │ owns              │ validates
  ▼                   ▼
Repo ──────────────► Pattern ◄─────── Provenance
  │                   │    │
  │ has               │    ├──────── PatternEvidence (code-level)
  │                   │    │
  │ has               │    ├──────── FilesystemPatternEvidence (filesystem-level)
  ▼                   │    │
ContextFileConfig     │    └──────── BacktestViolation
                      │
PullRequest ◄─────────┘    
  │                   
  │ has               
  ▼                   
Violation ───────────► Pattern (reference)
```

---

#### Core Interfaces

```typescript
// ============================================
// USERS & AUTH
// ============================================

interface User {
  id: string;                          // Supabase auth UUID
  githubId: number;                    // GitHub user ID
  githubUsername: string;
  email: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// REPOS
// ============================================

interface Repo {
  id: string;                          // UUID
  userId: string;                      // FK to User (who connected it)
  githubId: number;                    // GitHub repo ID
  githubFullName: string;              // e.g., "darien/reasoning-substrate"
  defaultBranch: string;               // e.g., "main"
  private: boolean;                    // MVP: no different handling; stored for future analytics/pricing
  
  // GitHub App installation (D15: only store installation ID, not tokens)
  installationId: number;              // GitHub App installation ID
  
  // Ingestion state
  ingestionStatus: IngestionStatus;
  lastIngestedAt: Date | null;
  lastIngestedCommitSha: string | null;
  fileCount: number | null;
  tokenCount: number | null;             // Estimated tokens in repo; null until calculated; >600k blocks extraction (safety buffer)
  
  // Extraction state
  extractionStatus: ExtractionStatus;
  lastExtractedAt: Date | null;
  patternCount: number | null;           // Candidate patterns found
  
  // Error tracking (task 6.1a)
  lastError: string | null;              // Error message from last failed operation
  
  createdAt: Date;
  updatedAt: Date;
}

type IngestionStatus = 
  | 'pending'          // Repo connected, not yet ingested
  | 'ingesting'        // Ingestion job running
  | 'ingested'         // Successfully ingested
  | 'failed';          // Ingestion failed

type ExtractionStatus =
  | 'pending'          // Ingestion complete, extraction not started
  | 'extracting'       // Extraction job running
  | 'extracted'        // Successfully extracted
  | 'failed';          // Extraction failed

// ============================================
// REPO FILES (for evidence autocomplete and file tracking)
// ============================================

interface RepoFile {
  id: string;                          // UUID
  repoId: string;                      // FK to Repo
  filePath: string;                    // Relative path in repo
  language: string | null;             // Detected language (e.g., "typescript")
  sizeBytes: number;
  tokenEstimate: number | null;        // For context budget tracking
  lastSeenAt: Date;                    // Updated on each ingestion
}

// SQL schema:
// CREATE TABLE repo_files (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
//   file_path TEXT NOT NULL,
//   language TEXT,
//   size_bytes INTEGER NOT NULL,
//   token_estimate INTEGER,
//   last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
//   UNIQUE(repo_id, file_path)
// );
// CREATE INDEX idx_repo_files_repo ON repo_files(repo_id);

// ============================================
// PATTERNS
// ============================================

interface Pattern {
  id: string;                          // UUID
  repoId: string;                      // FK to Repo
  
  // Core identity
  name: string;                        // Human-readable name, e.g., "Error Boundary Pattern"
  description: string;                 // What this pattern is/does
  type: PatternType;
  suggestedType: string | null;        // LLM's suggested type if it chose 'other' (for taxonomy analysis)
  
  // Lifecycle
  status: PatternStatus;
  statusChangedAt: Date;
  statusChangedBy: string | null;      // FK to User (null if AI-generated)
  
  // AI extraction metadata
  extractedAt: Date;
  extractedByModel: string;            // e.g., "claude-sonnet-4-5-20250929"
  extractionReasoning: string | null;  // AI's explanation for identifying this
  
  // Duplicate detection (D29)
  similarToPatternId: string | null;   // FK to Pattern — if set, this candidate is similar to an existing authoritative pattern
  
  // Confidence model discriminator (D34)
  // Code patterns use 4-dimension PatternConfidence
  // Filesystem patterns (file-naming, file-structure) use 2-dimension FilesystemPatternConfidence
  confidenceModel: 'code' | 'filesystem';
  
  // Confidence scoring (D11, D34) — computed during extraction
  // When confidenceModel: 'code' → PatternConfidence (4 dimensions)
  // When confidenceModel: 'filesystem' → FilesystemPatternConfidence (2 dimensions)
  confidenceScore: PatternConfidence | FilesystemPatternConfidence | null;
  
  // Health signals (D11) — objective observations about pattern quality
  healthSignals: PatternHealthSignals | null;  // Null if not yet analyzed or no signals
  
  // Backtest results (D12) — cached impact preview
  backtestSummary: PatternBacktestSummary | null;  // Summary stats; detail in backtest_violations table
  
  // Human validation (populated on promote)
  rationale: string | null;            // The "Why" — human-provided reasoning
  validatedAt: Date | null;
  validatedBy: string | null;          // FK to User
  
  // Ownership (D22: validator becomes owner on promote for MVP)
  // Post-MVP: owner can be transferred; validatedBy is immutable historical record
  ownerId: string | null;              // FK to User — primary maintainer (set to validator on promote)
  
  // Enforcement
  defaultSeverity: ViolationSeverity;  // Severity for violations of this pattern (default: 'warning') (D19)
  
  // Enforcement channels (D30 — added Dec 2025)
  enforcement: {
    prReview: boolean;                 // Check PRs for violations?
    aiContext: boolean;                // Include in AI context files?
  };
  
  // Deferral tracking
  deferCount: number;                  // Increments each time user defers; 3+ = "stuck" in UI
  deferredAt: Date | null;             // When last deferred; used for queue sorting
  
  // Rejection tracking (D18)
  rejectionReason: string | null;      // Optional: why rejected (human-provided or system note)
  
  // Filesystem pattern fields (null for code patterns) — added Dec 2025
  globPattern: string | null;           // e.g., "src/hooks/use*.ts" — for file-naming PR enforcement
  antiPatternExamples: string[] | null; // Illustrative bad examples for context files (not enforced)
  
  createdAt: Date;
  updatedAt: Date;
}

type PatternType =
  // Code-level patterns
  | 'structural'       // Code organization within files, module structure
  | 'behavioral'       // Error handling, logging, retry logic
  | 'api'              // API design conventions, request/response shapes
  | 'testing'          // Test structure, mocking patterns, coverage rules
  | 'naming'           // Variable, function, class naming conventions
  | 'dependency'       // Import rules, dependency management
  
  // Filesystem patterns (added Dec 2025)
  | 'file-naming'      // File and directory naming conventions
  | 'file-structure'   // Directory organization, co-location rules
  
  | 'other';           // Catch-all

// NOTE: 'naming' covers code identifiers; 'file-naming' covers filesystem
// NOTE: 'boundaries' (module/layer restrictions) deferred to post-MVP
// NOTE: These types are predefined for MVP. During dogfooding, evaluate whether
// pattern categories should be emergent (LLM-proposed) rather than fixed enum.
// See Q9 in Open Questions backlog.

type PatternStatus =
  | 'candidate'        // AI-extracted, awaiting human review
  | 'authoritative'    // Human-validated, source of truth
  | 'rejected'         // Reviewed and dismissed (not a real pattern)
  | 'deprecated'       // Was authoritative, now superseded (v1 → v2)
  | 'deferred';        // "Not now" — stays in queue with lower priority, resurfaces periodically

// ============================================
// PATTERN EVIDENCE
// ============================================

// Links a pattern to specific code locations that exemplify it
interface PatternEvidence {
  id: string;                          // UUID
  patternId: string;                   // FK to Pattern
  
  filePath: string;                    // Relative path in repo
  startLine: number | null;            // Line range (optional)
  endLine: number | null;
  
  snippet: string | null;              // Code snippet (see constraints below)
  
  // Metadata
  isCanonical: boolean;                // Is this the "best" example?
  addedAt: Date;
  addedBy: 'extraction' | 'human';     // Who added this evidence
  
  // Git metadata (for confidence scoring - D11)
  // For multi-line ranges, derived from `startLine` via git blame (captures the "signature" line)
  authorUsername: string | null;       // GitHub username from git blame
  commitDate: Date | null;             // When this instance was introduced
  commitSha: string | null;            // Commit that introduced this instance
  
  // Code classification (D25: LLM-based)
  codeCategory: CodeCategory | null;   // core/feature/frontend/backend/test/config/helper
  
  // Staleness tracking (D21)
  capturedAtSha: string;               // Commit SHA when evidence was captured
  isStale: boolean;                    // True if file no longer exists at HEAD
  staleReason: string | null;          // e.g., "File deleted"
}

// Snippet constraints:
// - Max length: 500 characters (truncate from end with "..." indicator)
// - Purpose: Quick visual reference in UI cards and expanded views
// - Full context: Use GitHub link (capturedAtSha) for complete code view
// - Health signals prompt: Uses full snippet (up to 500 chars) for analysis
// - Violation detection: Reads full file content from repo, not snippet
// - Truncation: Preserve complete lines where possible; truncate mid-line only at 500 char limit

// ============================================
// FILESYSTEM PATTERN EVIDENCE (D31 — updated Dec 2025)
// ============================================

// Links a filesystem pattern to example paths that demonstrate the convention
// One row per path (like PatternEvidence for code)
// Used for file-naming and file-structure pattern types only
interface FilesystemPatternEvidence {
  id: string;                          // UUID
  patternId: string;                   // FK to Pattern (where confidenceModel = 'filesystem')
  
  filePath: string;                    // Full relative path (file or directory)
  isDirectory: boolean;                // true for directories (file-structure), false for files (file-naming)
  
  addedAt: Date;
  addedBy: 'extraction' | 'human';
  
  // No git blame — filesystem structure doesn't have meaningful per-path authorship
  // No line numbers — not applicable
  // No snippet — the path itself is the evidence
}

// Note: globPattern and antiPatternExamples are stored on Pattern, not evidence
// - globPattern: the rule for file-naming enforcement (e.g., "src/hooks/use*.ts")
// - antiPatternExamples: illustrative bad paths for context files (not enforced)

// ============================================
// FILESYSTEM PATTERN CONFIDENCE (D34 — added Dec 2025)
// ============================================

// Filesystem patterns use simplified 2-dimension confidence model with derived tier
interface FilesystemPatternConfidence {
  tier: FilesystemConfidenceTier;  // Derived from evidence + adoption
  evidence: number;                // Path count demonstrating pattern
  adoption: number;                // % of matching paths following convention
}

type FilesystemConfidenceTier = 
  | 'strong'      // ≥10 paths, ≥80% adoption — clear convention
  | 'emerging'    // ≥5 paths, ≥60% adoption, <3 months old — growing convention
  | 'moderate'    // Doesn't meet strong/emerging/weak criteria
  | 'weak';       // ≤3 paths OR <40% adoption — questionable convention
  // Note: 'legacy' not applicable — filesystem patterns lack per-path git history

// Tier derivation thresholds
const FILESYSTEM_TIER_THRESHOLDS = {
  strong: {
    minEvidence: 10,      // 10+ matching paths
    minAdoption: 80,      // 80%+ follow convention
  },
  emerging: {
    minEvidence: 5,
    minAdoption: 60,
    // Also requires pattern age <3 months (from Pattern.extractedAt)
  },
  weak: {
    maxEvidence: 3,       // OR condition
    maxAdoption: 40,      // Low adoption = weak signal
  }
  // moderate = everything else
};

// Tier derivation logic (evaluated in order):
// 1. Check strong (evidence ≥10 AND adoption ≥80%)
// 2. Check emerging (evidence ≥5 AND adoption ≥60% AND extractedAt <3 months ago)
// 3. Check weak: (evidence ≤3) OR (adoption <40%)
// 4. Default to moderate

// Pattern stores which confidence model applies
// Pattern.confidenceModel: 'code' | 'filesystem';
// - Code patterns use full 4-dimension PatternConfidence with PatternConfidenceTier
// - Filesystem patterns use 2-dimension FilesystemPatternConfidence with FilesystemConfidenceTier

// ============================================
// CONTEXT FILE CONFIGURATION (D30, D32 — added Dec 2025)
// ============================================

interface ContextFileConfig {
  id: string;                          // UUID
  repoId: string;                      // FK to Repo
  
  // Target format
  format: ContextFileFormat;
  
  // Where in the repo to write the file
  targetPath: string;                  // e.g., "CLAUDE.md", ".cursorrules"
  
  // Sync behavior
  syncEnabled: boolean;                // Generate content for this format?
  autoCommit: boolean;                 // Commit changes to repo automatically? (post-MVP)
  
  // Generation state
  syncStatus: ContextFileSyncStatus;   // Track if content is current or needs download
  lastGeneratedAt: Date | null;
  lastGeneratedContentHash: string | null; // For change detection
  
  createdAt: Date;
  updatedAt: Date;
}

type ContextFileSyncStatus =
  | 'never'             // Newly created, not yet generated
  | 'synced'            // User has downloaded/copied latest content
  | 'pending';          // Content changed, awaiting user download

type ContextFileFormat = 
  | 'claude'           // CLAUDE.md (Claude Code)
  | 'cursor';          // .cursorrules

// Format-specific defaults
const FORMAT_DEFAULTS: Record<ContextFileFormat, { path: string; description: string }> = {
  claude: { 
    path: 'CLAUDE.md', 
    description: 'Claude Code project instructions' 
  },
  cursor: { 
    path: '.cursorrules', 
    description: 'Cursor AI rules file' 
  },
};

// Post-MVP formats (deferred per D32)
// - 'copilot' (.github/copilot-instructions.md)
// - 'aider' (CONVENTIONS.md)
// - 'generic' (AI_PATTERNS.md)

// ============================================
// PROVENANCE
// ============================================

// Links patterns to their decision history
interface Provenance {
  id: string;                          // UUID
  patternId: string;                   // FK to Pattern
  
  type: ProvenanceType;
  url: string;                         // Link to source (PR, doc, Slack, etc.)
  title: string | null;                // Human-readable title
  description: string | null;          // Additional context
  
  addedAt: Date;
  addedBy: string;                     // FK to User
}

type ProvenanceType =
  | 'pull_request'     // GitHub PR where pattern was introduced/discussed
  | 'commit'           // Specific commit
  | 'issue'            // GitHub issue
  | 'document'         // External doc (Notion, Google Doc, etc.)
  | 'slack'            // Slack permalink
  | 'adr'              // Architecture Decision Record
  | 'other';           // Catch-all

// ============================================
// PULL REQUESTS
// ============================================

interface PullRequest {
  id: string;                          // UUID
  repoId: string;                      // FK to Repo
  
  githubPrId: number;                  // GitHub PR ID
  githubPrNumber: number;              // PR number (e.g., #42)
  title: string;
  authorGithubUsername: string;
  
  baseBranch: string;
  headBranch: string;
  headSha: string;                     // Commit SHA being analyzed
  
  // Diff storage (D28)
  diffStoragePath: string | null;      // Supabase Storage path: pr_diffs/{repo_id}/{pr_number}.patch
  
  // Analysis state
  analysisStatus: AnalysisStatus;
  lastAnalyzedAt: Date | null;
  lastError: string | null;              // Error message from last failed analysis (task 6.1a)
  
  // Aggregates
  violationCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

type AnalysisStatus =
  | 'pending'          // PR received, not yet analyzed
  | 'analyzing'        // Analysis job running
  | 'analyzed'         // Successfully analyzed
  | 'failed'           // Analysis failed
  | 'skipped';         // Skipped (no authoritative patterns to check)

// ============================================
// VIOLATIONS
// ============================================

interface Violation {
  id: string;                          // UUID
  pullRequestId: string;               // FK to PullRequest
  patternId: string;                   // FK to Pattern (which pattern was violated)
  
  // Location in diff
  filePath: string;
  startLine: number;
  endLine: number | null;
  
  // Explanation
  description: string;                 // AI-generated explanation of violation
  severity: ViolationSeverity;
  
  // Code context
  violatingSnippet: string | null;     // The code that violates
  suggestedFix: string | null;         // Optional: AI-suggested correction
  
  // GitHub integration
  githubCommentId: number | null;      // ID of posted comment (if any)
  commentPostedAt: Date | null;
  
  // Resolution
  resolution: ViolationResolution;
  resolvedAt: Date | null;
  resolvedBy: string | null;           // FK to User
  
  // Dismissal details (D26)
  dismissalReason: string | null;      // Optional: why dismissed
  isFalsePositive: boolean;            // "This is a false positive" checkbox
  
  createdAt: Date;
}

type ViolationSeverity =
  | 'error'            // Must fix — blocks merge (if strict mode)
  | 'warning'          // Should fix — doesn't block
  | 'info';            // FYI — suggestion only

type ViolationResolution =
  | 'open'             // Not yet addressed
  | 'fixed'            // Code was changed to comply
  | 'dismissed';       // Marked as not applicable / false positive

// ============================================
// PATTERN CONFIDENCE (D11)
// ============================================

// Multi-dimensional confidence scoring for pattern candidates
interface PatternConfidence {
  // Overall tier derived from dimensions
  tier: PatternConfidenceTier;
  
  // Dimension 1: Evidence — Is this real? How consistent?
  evidence: {
    instanceCount: number;                    // How many files contain this pattern
    consistency: 'high' | 'medium' | 'low';   // How similar are implementations
    consistencyNote: string | null;           // e.g., "7 of 8 identical; 1 minor variation"
  };
  
  // Dimension 2: Adoption — Team convention or personal habit?
  adoption: {
    uniqueAuthors: number;                    // Distinct engineers who wrote instances
    authorUsernames: string[];                // GitHub usernames for display
  };
  
  // Dimension 3: Establishment — Proven or experimental?
  establishment: {
    oldestInstanceDate: Date;                 // When pattern first appeared
    newestInstanceDate: Date;                 // Most recent instance
    ageCategory: 'established' | 'maturing' | 'emerging';
    // established: >1 year, maturing: 3-12 months, emerging: <3 months
  };
  
  // Dimension 4: Location — What type of code is this? (D25: LLM-classified, not path-based)
  location: {
    breakdown: {
      core: number;       // Infrastructure, shared utilities, database, auth, logging
      feature: number;    // Business logic, domain-specific functionality
      frontend: number;   // UI components, views, styling, client-side state
      backend: number;    // API routes, server logic, request handlers
      test: number;       // Test files, test utilities, mocks, fixtures
      config: number;     // Configuration, setup, environment, build scripts
      helper: number;     // Small utilities, formatters, validators — leaf code
    };
    primary: 'core' | 'feature' | 'frontend' | 'backend' | 'test' | 'config' | 'helper';
  };
  
  // Generated insight from template system
  insight: string;
  suggestedActions: string[];                 // e.g., ['Promote', 'Reject', 'Defer']
}

type PatternConfidenceTier =
  | 'strong'      // 5+ instances, 3+ authors, established, consistent — safe to enforce
  | 'emerging'    // 3+ instances, <3 months old, spreading — watch or standardize
  | 'moderate'    // Meets some but not all "strong" criteria — needs judgment
  | 'weak'        // 2 instances, single author, or low consistency — questionable
  | 'legacy';     // Established but stagnant (no new instances in 1+ year) — probably deprecated

// ============================================
// CONSISTENCY ASSESSMENT RUBRIC (D20)
// ============================================

// Consistency is LLM-assessed during extraction based on implementation similarity:
//
// | Level  | Criteria                                                              |
// |--------|-----------------------------------------------------------------------|
// | high   | Nearly identical — same structure, naming; minor variations only      |
// | medium | Same structure but notable variations — different messages, ordering  |
// | low    | Same goal but different approaches — different libraries, structure   |
//
// The consistencyNote field captures specific observations, e.g.:
// - "All 8 instances use identical try/catch wrapper"
// - "5 of 7 use async/await; 2 use .then() chains"
// - "Mixed approaches: 3 use axios, 2 use fetch, 1 uses got"
//
// Low consistency may indicate the "pattern" is actually multiple distinct patterns.

// ============================================
// PATTERN HEALTH SIGNALS (D11)
// ============================================

// Objective, verifiable observations about pattern quality
interface PatternHealthSignals {
  hasWarnings: boolean;                       // Quick filter for UI
  signals: HealthSignal[];
}

interface HealthSignal {
  category: HealthSignalCategory;
  severity: 'info' | 'warning' | 'critical';
  message: string;                            // e.g., "No error handling (try/catch or .catch())"
  affectedInstances: number;                  // "in 5 of 7 instances"
  totalInstances: number;
}

type HealthSignalCategory =
  | 'error-handling'    // Missing try/catch, .catch(), error boundaries
  | 'deprecated-api'    // Uses deprecated methods/libraries (LLM-identified, D23)
  | 'consistency'       // Mixed patterns (async/await + callbacks)
  | 'security'          // High-confidence only: SQL concat, innerHTML, hardcoded secrets
  | 'completeness';     // Missing validation, null checks, etc.

// Health Signal Detection Approach (D23)
// - Single prompt per pattern covering all 5 categories
// - Includes pattern definition + canonical example + 2-3 evidence snippets
// - deprecated-api uses two-step: identify libraries → flag deprecated/maintenance/legacy
// - security is NOT full SAST — only obvious, high-confidence issues
// - All signals must be high-objectivity (verifiable in code, no subjective judgments)

// ============================================
// BACKTEST RESULTS (D12)
// ============================================

// Summary stats stored on Pattern
interface PatternBacktestSummary {
  violationCount: number;              // Total violations that would have been caught
  prCount: number;                     // Number of PRs affected
  windowDays: number;                  // How far back we looked (default: 90)
  computedAt: Date;                    // When backtest was run
}

// Individual backtest violations stored in separate table
// Distinct from Violation (which tracks real PR violations post-enforcement)
interface BacktestViolation {
  id: string;                          // UUID
  patternId: string;                   // FK to Pattern
  
  // PR context
  prNumber: number;
  prTitle: string;
  prMergedAt: Date;
  prAuthorUsername: string;
  prUrl: string;                       // GitHub URL for linking
  
  // Violation location
  filePath: string;
  startLine: number;
  endLine: number | null;
  
  // Explanation
  summary: string;                     // One-line AI description of what violated
  
  createdAt: Date;                     // When backtest was run
}

// ============================================
// INSIGHT RULES (D24: json-rules-engine)
// ============================================

// Rules are evaluated using json-rules-engine npm package
// Priority-ordered: highest priority matching rule wins
// Facts derived from pattern confidence, health signals, and backtest results

// Facts passed to rule engine:
interface InsightFacts {
  tier: PatternConfidenceTier | FilesystemConfidenceTier;
  instanceCount: number;
  uniqueAuthors: number;
  consistency: 'high' | 'medium' | 'low';
  ageCategory: 'established' | 'maturing' | 'emerging';
  primaryLocation: CodeCategory;  // D25: LLM-classified code type
  isSpreading: boolean;      // emerging + instanceCount >= 3
  isStagnant: boolean;       // newestInstance > 1 year ago
  isSingleAuthor: boolean;   // uniqueAuthors === 1
  hasHealthWarnings: boolean;
  backtestViolations: number;
  // Filesystem pattern fields (null/false for code patterns)
  isFilesystemPattern: boolean;
  filesystemAdoption: number | null;  // % adoption for filesystem patterns
}

// See D24 in Appendix A for complete starter rule set (18 rules)
// Rules stored in INSIGHT_RULES constant for MVP; move to DB post-MVP

// Tier derivation thresholds (used to compute tier from dimensions)
const CONFIDENCE_THRESHOLDS = {
  strong: {
    minInstances: 5,
    minAuthors: 3,
    requiredAge: 'established' as const,
    requiredConsistency: ['high', 'medium'] as const
  },
  emerging: {
    minInstances: 3,
    maxAgeCategory: 'emerging' as const
  },
  legacy: {
    // D25: Legacy tier now derived from staleness, not file path
    // Pattern is stagnant (no new instances in 1+ year) AND established age
    isStagnant: true,
    requiredAge: 'established' as const
  },
  weak: {
    // ANY of these conditions triggers weak tier:
    maxInstances: 2,                      // OR
    singleAuthorMaxInstances: 5,          // singleAuthor AND instanceCount ≤ 5 (but not singleAuthor alone)
    consistency: 'low' as const
  }
  // moderate = everything else (doesn't meet strong/emerging/legacy/weak)
};

// Tier derivation logic (evaluated in order):
// 1. Check legacy first (stagnant + established) — catches old patterns before strong
// 2. Check strong (all criteria must be met)
// 3. Check emerging (recent + spreading)
// 4. Check weak: (instanceCount ≤ 2) OR (consistency == 'low') OR (singleAuthor AND instanceCount ≤ 5)
//    Note: singleAuthor alone does NOT trigger weak if instanceCount > 5 — high-instance
//    single-author patterns get surfaced via insight rule instead (strong-single-author)
// 5. Default to moderate

// Location classification (D25): LLM-based semantic analysis
// Categories classified by LLM based on code content, not file paths:
// - core: infrastructure, shared utilities, database, auth, logging
// - feature: business logic, domain-specific functionality
// - frontend: UI components, views, styling, client-side state
// - backend: API routes, server logic, request handlers
// - test: tests, test utilities, mocks, fixtures
// - config: configuration, setup, environment, build scripts
// - helper: small utilities, formatters, validators

type CodeCategory = 'core' | 'feature' | 'frontend' | 'backend' | 'test' | 'config' | 'helper';

// ============================================
// PATTERN EVOLUTION REQUESTS (D27)
// ============================================

// Created when a PR modifies a file that's evidence for an authoritative pattern
interface PatternEvolutionRequest {
  id: string;                          // UUID
  patternId: string;                   // FK to Pattern
  pullRequestId: string;               // FK to PullRequest
  evidenceId: string;                  // FK to PatternEvidence (which evidence was modified)
  
  isCanonical: boolean;                // Was it the canonical example?
  
  // Diff context
  filePath: string;
  diffSummary: string;                 // AI-generated summary of what changed
  
  // Review status
  status: PatternEvolutionStatus;
  reviewedAt: Date | null;
  reviewedBy: string | null;           // FK to User (pattern owner or delegate)
  reviewNote: string | null;           // Optional explanation
  
  // Lifecycle tracking
  closedAt: Date | null;               // When PR merged/closed (sets historical/cancelled)
  
  // If rejected, link to created violation
  violationId: string | null;          // FK to Violation (created on rejection)
  
  createdAt: Date;
}

type PatternEvolutionStatus =
  | 'pending'           // Awaiting owner review
  | 'accepted'          // Owner approved evolution
  | 'rejected'          // Owner rejected, violation created
  | 'historical'        // PR merged (preserves audit trail)
  | 'cancelled';        // PR closed without merge

// ============================================
// BACKGROUND JOBS (Trigger.dev)
// ============================================

// Not stored in DB, but documented for reference
interface ExtractionJobPayload {
  repoId: string;
  triggeredBy: 'connection' | 'manual' | 'schedule';
}

interface PRAnalysisJobPayload {
  pullRequestId: string;
  prNumber: number;
  repoId: string;
  headSha: string;
}
```

---

#### Supabase Schema Notes

```sql
-- Key indexes for performance
CREATE INDEX idx_patterns_repo_status ON patterns(repo_id, status);
CREATE INDEX idx_violations_pr ON violations(pull_request_id);
CREATE INDEX idx_pattern_evidence_pattern ON pattern_evidence(pattern_id);
CREATE INDEX idx_provenance_pattern ON provenance(pattern_id);

-- Backtest violations table
CREATE TABLE backtest_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  pr_number INTEGER NOT NULL,
  pr_title TEXT NOT NULL,
  pr_merged_at TIMESTAMPTZ NOT NULL,
  pr_author_username TEXT NOT NULL,
  pr_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_backtest_violations_pattern ON backtest_violations(pattern_id);

-- Repo files table for evidence autocomplete (D21)
CREATE TABLE repo_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(repo_id, file_path)
);

CREATE INDEX idx_repo_files_repo ON repo_files(repo_id);
CREATE INDEX idx_repo_files_path ON repo_files(repo_id, file_path);

-- Filesystem pattern evidence table (D31 — updated Dec 2025)
CREATE TABLE filesystem_pattern_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  is_directory BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by TEXT NOT NULL CHECK (added_by IN ('extraction', 'human'))
);

CREATE INDEX idx_filesystem_evidence_pattern ON filesystem_pattern_evidence(pattern_id);

-- Cascade delete handles re-extraction cleanup automatically
-- When pattern is deleted, backtest violations are removed

-- Pattern evolution requests table (D27)
CREATE TABLE pattern_evolution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  pull_request_id UUID NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES pattern_evidence(id) ON DELETE CASCADE,
  
  is_canonical BOOLEAN NOT NULL DEFAULT false,
  
  file_path TEXT NOT NULL,
  diff_summary TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'historical', 'cancelled')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  review_note TEXT,
  
  closed_at TIMESTAMPTZ,  -- When PR merged (historical) or closed without merge (cancelled)
  
  violation_id UUID REFERENCES violations(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evolution_requests_pattern ON pattern_evolution_requests(pattern_id);
CREATE INDEX idx_evolution_requests_pr ON pattern_evolution_requests(pull_request_id);
CREATE INDEX idx_evolution_requests_status ON pattern_evolution_requests(status);

-- Pattern confidence stored as JSONB for query flexibility
-- Example: SELECT * FROM patterns WHERE confidence_score->>'tier' = 'strong';

-- Enable realtime for progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE repos;
ALTER PUBLICATION supabase_realtime ADD TABLE patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE pattern_evolution_requests;

-- Realtime subscription patterns:
-- | UI Location          | Table                        | Event  | Handler                              |
-- |----------------------|------------------------------|--------|--------------------------------------|
-- | Repo progress page   | repos (id = repoId)          | UPDATE | Update status indicators, completion |
-- | Pattern list         | patterns (repo_id = repoId)  | INSERT | Add pattern to list with animation   |
-- | Dashboard            | pattern_evolution_requests   | INSERT | Show notification badge              |
--
-- Use Supabase JS: channel().on('postgres_changes', ...).subscribe()
-- Unsubscribe on component unmount; handle reconnection gracefully

-- Row Level Security (RLS) policy pattern
-- Users can only see repos they own
CREATE POLICY "Users see own repos" ON repos
  FOR SELECT USING (user_id = auth.uid());

-- Patterns visible if user owns the repo
CREATE POLICY "Users see patterns for own repos" ON patterns
  FOR SELECT USING (
    repo_id IN (SELECT id FROM repos WHERE user_id = auth.uid())
  );
```

---

#### Schema Evolution Notes

| Entity | MVP Scope | Post-MVP Extensions |
|--------|-----------|---------------------|
| User | Basic GitHub auth | Team membership, roles |
| Repo | Single-owner; private/public treated same | Org-level ownership, collaborators; private repo limits on free tier |
| Pattern | Full lifecycle | Version history (v1 → v2), deprecation chains |
| Pattern.evidence | Manual add/remove via Evidence Management UI (D21) | Merge workflow: detect duplicate candidates during re-extraction, add their evidence to existing authoritative patterns (required before automatic re-extraction) |
| Pattern.ownership | Validator becomes owner on promote (D22) | Transfer ownership action, ownership history/audit log, team/group ownership, ownership notifications |
| Pattern.governance | Not implemented | Approval workflows, voting |
| Pattern.watch | Not implemented | Watch functionality with notifications: `watchedAt`, `watchedBy` fields; track instance counts per extraction to detect "spreading"; email/in-app notifications when watched Emerging patterns reach 5+ instances; auto-resurface in queue with "📈 This pattern is spreading" |
| BacktestViolation | Full storage with PR metadata | Diff snippet storage, severity classification |
| Violation | Single dismiss action with false positive flag (D26) | Magic link tokens for one-click dismiss from GitHub; `exempted` resolution status with formal exemption workflow; false positive analytics per pattern; `confidence: number` field for LLM-reported violation certainty (enables filtering/thresholding) |
| PatternConfidence | Full 4-dimension model + tiers | Type-specific thresholds, calibration tracking, trend velocity |
| PatternHealthSignals | 5 categories, single prompt per pattern, LLM-powered deprecation (D23) | Extended categories, web search for recent deprecations, severity auto-adjustment, fix suggestions |
| InsightRules | json-rules-engine with 14 starter rules in code (D24) | Rules in Supabase table, admin UI for editing, per-repo customization, A/B testing |
| Violation | Basic resolution | Exemption requests, audit trail |
| Provenance | Manual URL entry | Auto-link from GitHub PRs, Slack integration |
| PatternEvolutionRequest | Full workflow: detect evidence mods, owner review, accept/reject (D27) | Delegate review to other team members, auto-accept for non-canonical, batch review UI |

### 2.5 Key Workflows
`[Explored]` · Updated: Dec 2025

#### Pattern Mental Model

**Core concept:** A pattern is an *abstract definition* that describes a recurring structure in code — not the code itself.

| Component | Where it lives | Editable? | Purpose |
|-----------|---------------|-----------|---------|
| **Definition** | Our product (DB) | Yes | Name, description, constraints — what the LLM uses for violation detection |
| **Evidence** | Pointers to repo code | Add/remove | "Here are 8 places this pattern appears" — facts from extraction |
| **Canonical example** | One evidence item marked "canonical" | Changeable | The best illustration for humans; used as few-shot context for LLM |
| **Rationale** | Our product (DB) | Yes | The "Why" — human-authored context |
| **Provenance** | Our product (DB) | Add/remove | Links to PRs, docs, discussions that explain the decision |

**What users can edit:**
- Name (AI might call it "Try-Catch Wrapper" but team says "Error Boundary Pattern")
- Description (refine AI's vague or incorrect summary)
- Constraints (add rules AI missed, as freeform text within description)
- Canonical example (pick a better exemplar from evidence)
- Rationale (always human-authored)

**What users cannot edit:**
- Evidence file paths (facts from extraction)
- Evidence snippets (what the code actually says)

**What users can add/remove:**
- Evidence items ("This file isn't actually an example" or "Add this file")
- Provenance links

---

#### Pattern Lifecycle States

```
                    ┌──────────────┐
                    │   Candidate  │ ← AI-extracted, awaiting review
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌─────────────┐   ┌─────────┐
    │ Rejected │    │Authoritative│   │ Deferred│
    └──────────┘    └──────┬──────┘   └────┬────┘
                           │               │
                           │          (resurfaces)
                           ▼               │
                    ┌──────────┐           │
                    │Deprecated│           │
                    └──────────┘           │
                           ▲               │
                           └───────────────┘
```

- **Candidate:** AI-detected structure, linked to code, awaiting human review
- **Authoritative:** Human-validated, prescriptive standard (Source of Truth), enforcement enabled
- **Rejected:** Reviewed and dismissed (not a real pattern, or anti-pattern)
- **Deferred:** "Not now" — stays in queue with lower priority, resurfaces periodically
- **Deprecated:** Was authoritative, now superseded (v1 → v2 migration)

---

#### Workflow 1: Candidate Review (Triage Queue)

**Goal:** Efficiently review AI-extracted pattern candidates, promoting good ones, rejecting noise.

**Target audience:**
- **Who they are:** Senior/Staff engineers — experts who value efficiency, hate patronizing UIs, and are keyboard-native (vim, terminal, IDE shortcuts). They batch-process work (PRs, notifications, email) and get dopamine from "inbox zero."
- **What they want:** Feel smart, move fast, see impact. They'll abandon anything that feels like busywork.

**Comparable products that nail this:**
- **Superhuman** — Keyboard-first email triage, "inbox zero" satisfaction, time-saved metrics
- **Linear** — Dense but scannable cards, cmd+k everything, feels like a tool for pros
- **GitHub PR review** — Familiar mental model, inline context, clear actions

**Design principles:**
- Keyboard-first (vim-style) — respects engineer expertise and speed
- Inbox-zero psychology — progress bar, completion drive
- Smart sorting — highest-value candidates first (confidence tier × backtest impact)
- Decision-critical info visible at a glance — expand for details

**Queue screen layout:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Pattern Candidates                                    7 of 23 reviewed │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────────────────────────────────────────────┤
│  Filter: [All ▾] [All Tiers ▾] [All Types ▾]          [Stuck (3)] [↻]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Strong ↑   Error Boundary Pattern                                │ │
│  │  behavioral · 8 instances · 4 authors · established (2+ yrs)      │ │
│  │                                                                   │ │
│  │  ⚡ Would have caught 4 violations in last 90 days                │ │
│  │                                                                   │ │
│  │  "Consistent try/catch wrapper in all API route handlers with     │ │
│  │   standardized error logging and ApiError response format."       │ │
│  │                                                                   │ │
│  │  [P] Promote   [R] Reject   [D] Defer                   ↵ Expand │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Emerging ◐   Feature Flag Guard                                  │ │
│  │  behavioral · 4 instances · 2 authors · new (< 3 mo)              │ │
│  │  ...                                                              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│                                                          [?] Shortcuts │
└─────────────────────────────────────────────────────────────────────────┘
```

**Duplicate detection card (D29):**

When a candidate is similar to an existing authoritative pattern, it displays differently:

```
┌───────────────────────────────────────────────────────────────────────┐
│  ⚠️ Similar to existing    Error Handling Wrapper                     │
│  behavioral · 5 new instances · matches "Error Boundary Pattern"      │
│                                                                       │
│  This candidate appears similar to an authoritative pattern you       │
│  already have. Review the new evidence locations found.               │
│                                                                       │
│  [M] Merge into "Error Boundary Pattern"                              │
│  [P] Promote as separate   [R] Dismiss                      ↵ Expand │
└───────────────────────────────────────────────────────────────────────┘
```

**Merge action:**
- Adds candidate's evidence to the existing authoritative pattern
- Deletes the candidate (cascades to backtest_violations)
- One click — no manual evidence management needed
- Expanded view shows side-by-side comparison of definitions

**Card anatomy (always visible):**
- **Tier badge:** Strong / Emerging / Moderate / Weak / Legacy (color-coded)
- **Name + type:** What this pattern is
- **Key stats:** Instance count, unique authors, age category
- **Backtest result:** "⚡ Would have caught N violations" — the magic line
- **Description:** AI-generated one-liner summary
- **Actions:** Keyboard shortcuts for triage

**Expanded view (on `Enter`):**
- Confidence dimension breakdown (4 bars: Evidence, Adoption, Establishment, Location)
- Health signals (warnings if any)
- Evidence list with file paths
- Canonical example snippet
- Full AI extraction reasoning

**Keyboard shortcuts:**
| Key | Action | Result |
|-----|--------|--------|
| `j` | Next | Move to next candidate |
| `k` | Previous | Move to previous candidate |
| `p` | Promote | Open promotion modal |
| `r` | Reject | Open rejection modal (D18) |
| `d` | Defer | Move to end of queue / snooze |
| `m` | Merge | Merge into similar pattern (D29) — only shown for duplicates |
| `Enter` | Expand/collapse | Show/hide detail view |
| `?` | Help | Show keyboard shortcuts |

**Filter options:**
- **Status:** All, New (unreviewed), Stuck (deferred 3+ times)
- **Tier:** All Tiers, Strong, Emerging, Moderate, Weak, Legacy
- **Type:** All Types, Structural, Behavioral, API, Testing, Naming, File-Naming, File-Structure, Other
- **[Stuck (N)]:** Badge showing count of stuck patterns — quick access to items needing attention
- **[↻]:** Refresh to re-sort queue after background updates

**Auto-behaviors:**
- Patterns deferred 3x auto-move to "Stuck" bucket (UI filter: `status === 'deferred' && deferCount >= 3`; review quarterly)
- Weak patterns unreviewed for 60 days since extraction auto-archive with `status: 'rejected'` and system note "Auto-dismissed: insufficient evidence" (daily scheduled job)

**Backtest hover preview:**
Hovering on the backtest line shows actual violations found:
```
┌─────────────────────────────────────────────────────────────┐
│ PR #142 (Dec 3): Missing error boundary in UserProfile.tsx  │
│ PR #138 (Nov 28): Missing error boundary in Dashboard.tsx   │
│ PR #131 (Nov 15): Missing error boundary in Settings.tsx    │
│ PR #127 (Nov 8): Missing error boundary in Checkout.tsx     │
│                                                    View all →│
└─────────────────────────────────────────────────────────────┘
```

**The triage flow (step-by-step):**

```
1. User opens Candidate Queue
   → Sees progress bar: "23 patterns to review"
   → First card: highest confidence, highest backtest impact
   
2. User scans card (2-3 seconds)
   → Tier badge: "Strong" ✓
   → Backtest: "Would have caught 4 violations" ✓
   → Presses `p` to promote
   
3. Promotion modal opens (streamlined)
   → Pattern summary shown
   → Rationale field (optional but encouraged): "Standard error handling for API routes"
   → Provenance field (optional): Paste PR/doc link
   → [Promote & Next] button (or `Cmd+Enter`)
   
4. Pattern promoted, next card auto-loads
   → Progress bar: "1 of 23 reviewed"
   → Dopamine hit, continue flow
   
5. User encounters uncertain pattern
   → Presses `Enter` to expand, sees confidence breakdown
   → Health warning: "Missing error handling in 2 of 5 instances"
   → Presses `d` to defer, moves on
   
6. After 23 patterns:
   → Queue completion screen with stats and estimated impact
```

**Queue completion screen:**
```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Queue clear!                                             │
│                                                             │
│  You reviewed 23 patterns in 14 minutes.                    │
│  • 8 promoted to authoritative                              │
│  • 12 rejected                                              │
│  • 3 deferred                                               │
│                                                             │
│  Estimated impact: These patterns will catch ~23 violations │
│  per month based on historical analysis. ⓘ                  │
│                                                             │
│  [View Dashboard]  [Connect Another Repo]                   │
└─────────────────────────────────────────────────────────────┘
```

**Monthly impact projection formula:**
```typescript
// Sum backtest violations across all promoted (authoritative) patterns
const totalBacktestViolations = promotedPatterns.reduce(
  (sum, p) => sum + (p.backtestSummary?.violationCount ?? 0), 
  0
);

// Linear projection from backtest window to 30-day month
const windowDays = promotedPatterns[0]?.backtestSummary?.windowDays ?? 90;
const monthlyProjection = Math.round((totalBacktestViolations / windowDays) * 30);

// Display with ~ prefix to indicate approximation
// Tooltip: "Based on analysis of last {windowDays} days of merged PRs"
```

**Summary:**

| Dimension | Recommendation |
|-----------|----------------|
| Information density | Scannable card (tier, stats, backtest, description) + expand for details |
| Triage mental model | Keyboard-first linear queue, smart-sorted by confidence × impact |
| Primary actions | Promote, Reject, Defer |
| Backtest prominence | Always visible on card — it's the magic moment |

---

#### Workflow 2: Pattern Promotion

**Goal:** Elevate a candidate to authoritative status with human context.

**Trigger:** User presses `p` on a candidate card.

**Promotion modal:**
`[Updated: Dec 2025]`

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Promote Pattern                                                   [×] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ERROR BOUNDARY PATTERN                                                 │
│  behavioral · 8 instances · 4 authors                                   │
│                                                                         │
│  ⚡ Would have caught 4 violations in last 90 days                      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Description                                              [Edit]        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ All API route handlers wrap their logic in try/catch blocks with  │ │
│  │ standardized error logging via logger.error() and return          │ │
│  │ ApiError responses.                                               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Rationale — Why does this pattern exist? (recommended)                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Standardized after the Dec 2023 outage where inconsistent error   │ │
│  │ handling made debugging impossible.                               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Provenance — Link to decision source (optional)                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ https://github.com/acme/api/pull/847                              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  [+ Add another link]                                                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ENFORCEMENT CHANNELS                                                   │
│                                                                         │
│  ☑ PR Review                                                            │
│    Post violation comments on pull requests                             │
│    Severity: ○ Error  ● Warning  ○ Info                                 │
│                                                                         │
│  ☑ AI Agents                                                            │
│    Include in CLAUDE.md, .cursorrules context files                     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                     [Cancel]  [Promote & Next ⌘↵]       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Note:** For `file-structure` patterns, PR Review checkbox is disabled with tooltip: "PR enforcement not available for structure patterns"

**Field behavior:**
- **Description:** Pre-filled from AI extraction, editable
- **Rationale:** Empty, optional but encouraged (tracks completion rate per R6)
- **Provenance:** Optional URL field, can add multiple
- **PR Review:** Checked by default; severity dropdown (default: Warning)
- **AI Agents:** Checked by default; includes pattern in context files

**Default enforcement by pattern type:**
- Code patterns: both channels enabled
- File-naming patterns: both channels enabled  
- File-structure patterns: AI Agents only (PR Review disabled)

**After promotion:**
- Pattern status → `authoritative`
- If AI Agents enabled, triggers context file regeneration (debounced)
- User returns to queue, next candidate auto-loaded
- Progress bar updates

---

#### Workflow 2a: Pattern Rejection

**Goal:** Dismiss a candidate pattern that isn't worth enforcing.

**Trigger:** User presses `r` on a candidate card.

**Rejection modal:**

```
┌─────────────────────────────────────────────────────────────────┐
│  Reject Pattern                                             [×] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ERROR BOUNDARY PATTERN                                         │
│  behavioral · 8 instances                                       │
│                                                                 │
│  Reason (optional)                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  💡 Common reasons: "Not a real pattern", "Anti-pattern",       │
│     "Too specific", "Duplicate of X"                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                  [Cancel]  [Reject ↵]           │
└─────────────────────────────────────────────────────────────────┘
```

**Field behavior:**
- **Reason:** Empty, optional. Placeholder shows common reasons as hints.
- **Submit:** `Enter` key or click "Reject" — reason can be blank
- **Cancel:** `Escape` key or click "Cancel" or `×`

**After rejection:**
- Pattern status → `rejected`
- `rejectionReason` stored (if provided)
- User returns to queue, next candidate auto-loaded
- Progress bar updates

**System rejections (auto-archive per task 6.10):**
- System sets `status: 'rejected'` and `rejectionReason: "Auto-dismissed: insufficient evidence"`
- Distinguishes human decisions from automated cleanup

*Reference: Decision D18*

---

#### Workflow 3: Pattern Detail View

**Goal:** View and manage an authoritative (or candidate) pattern's full details.

**Access:** Click pattern name from dashboard, or from PR violation link.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Error Boundary Pattern                              [Edit] [Disable]   │
│  behavioral · authoritative · enforcement ON · ⚠️ warning severity     │
│  Owned by @darien · Validated Dec 15, 2025                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  DEFINITION                                                             │
│                                                                         │
│  All API route handlers wrap their logic in try/catch blocks with       │
│  standardized error logging via logger.error() and return ApiError      │
│  responses. Must include request context in error logs.                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  RATIONALE                                                              │
│                                                                         │
│  "Standardized after the Dec 2023 outage where inconsistent error       │
│  handling made debugging impossible. See post-mortem for details."      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  PROVENANCE                                                [Add link]   │
│                                                                         │
│  • PR #847: Standardize API error handling                              │
│  • Notion: Post-mortem Dec 2023                                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  CONFIDENCE                                                             │
│                                                                         │
│  Evidence      ████████████████████░░░░  8 instances, high consistency  │
│  Adoption      ████████████████░░░░░░░░  4 authors                      │
│  Establishment ████████████████████████  2+ years old                   │
│  Location      ████████████░░░░░░░░░░░░  75% core, 25% feature          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  HEALTH SIGNALS                                                         │
│                                                                         │
│  ✓ No warnings detected                                                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  CANONICAL EXAMPLE                                      [Change]        │
│                                                                         │
│  src/routes/users.ts:42-58                             [View in GitHub] │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ export async function getUser(req: Request, res: Response) {      │ │
│  │   try {                                                           │ │
│  │     const user = await db.users.find(req.params.id);              │ │
│  │     return res.json(user);                                        │ │
│  │   } catch (err) {                                                 │ │
│  │     logger.error('getUser failed', { err, req });                 │ │
│  │     return res.status(500).json(ApiError.internal());             │ │
│  │   }                                                               │ │
│  │ }                                                                 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ALL EVIDENCE (8 instances)                              [Manage]       │
│                                                                         │
│  ★ src/routes/users.ts:42-58         @darien    Mar 2023               │
│    src/routes/orders.ts:23-41        @alice     Apr 2023               │
│    src/routes/products.ts:15-33      @bob       Jun 2023               │
│    src/routes/checkout.ts:31-49      @darien    Aug 2023               │
│    src/routes/inventory.ts:18-36     @carol     Oct 2023               │
│    ... 3 more                                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  IMPACT                                                                 │
│                                                                         │
│  Last 30 days:  3 violations caught · 2 PRs affected                   │
│  Last 90 days:  7 violations caught · 5 PRs affected                   │
│  All time:      12 violations caught · 9 PRs affected                  │
│                                                                         │
│                                              [View violation history →] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Manage Evidence modal (D21):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Manage Evidence                                            [×] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Add evidence file                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ src/routes/api/█                                            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ src/routes/api/auth.ts                                      ││
│  │ src/routes/api/billing.ts                                   ││
│  │ src/routes/api/webhooks.ts                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Line range (optional): [    ] - [    ]                         │
│                                                                 │
│                                              [Cancel] [Add]     │
├─────────────────────────────────────────────────────────────────┤
│  Current evidence (8)                                           │
│                                                                 │
│  ★ src/routes/api/users.ts:42-58           [Set Canonical] [×]  │
│    src/routes/api/products.ts:31-47        [Set Canonical] [×]  │
│  ⚠️ src/old/legacy.ts (file deleted)       [Set Canonical] [×]  │
│    ...                                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Modal behavior:**
- **Autocomplete:** Dropdown populated from indexed file list (`repo_files` table)
- **Validation:** Path must exist in file index; Add button disabled otherwise
- **Line range:** Optional; if provided, captured with evidence record
- **Commit SHA:** Current HEAD captured as `capturedAtSha` on add
- **Stale evidence:** Shown with ⚠️ and reason (e.g., "file deleted"); user can remove
- **[Set Canonical]:** Marks that evidence as the best example for this pattern
- **[×]:** Removes evidence from pattern (with confirmation if canonical)

---

#### Workflow 4: PR Violation Comment

**Goal:** Surface pattern violations directly in GitHub PR review flow.

**Trigger:** Webhook on PR `opened` or `synchronize` event.

**Comment format:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 Reasoning Substrate                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ **Pattern violation: Error Boundary Pattern**                           │
│                                                                         │
│ This code is missing the standardized error handling wrapper.           │
│                                                                         │
│ **Expected:** API route handlers should wrap logic in try/catch with    │
│ `logger.error()` and return `ApiError` response.                        │
│                                                                         │
│ **Example:** [View canonical implementation](link-to-file)              │
│                                                                         │
│ ---                                                                     │
│ 📖 [View pattern details](link-to-pattern) · Maintained by @darien      │
│ 💬 *"Standardized after Dec 2023 outage — see post-mortem"*            │
│                                                                         │
│ [Dismiss](link-to-violation)                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

*Note (D26): Single "Dismiss" action opens modal with optional reason and "This is a false positive" checkbox. Simplifies from two actions to one.*

**Comment elements:**
- **Pattern name:** Links to pattern detail view in our app
- **Violation description:** AI-generated explanation of what's wrong
- **Expected behavior:** From pattern description
- **Canonical example:** Link to the best implementation
- **Owner attribution:** Who maintains this pattern
- **Rationale snippet:** The "Why" — human context for why this matters
- **Actions:** Links to violation detail page in our app (requires login to act)

**URL formats:**
- Pattern details: `{APP_URL}/patterns/{patternId}`
- Violation dismiss: `{APP_URL}/violations/{violationId}?action=dismiss`
- Canonical example: `https://github.com/{owner}/{repo}/blob/{capturedAtSha}/{filePath}#L{startLine}-L{endLine}`

**Authentication flow for PR comment actions (task 6.11):**

```
1. User clicks "Dismiss" link in GitHub PR comment
   → Browser navigates to: /violations/{id}?action=dismiss

2. If not authenticated:
   → Store original URL in session/cookie: returnTo=/violations/{id}?action=dismiss
   → Redirect to GitHub OAuth

3. After OAuth completes:
   → Read returnTo from session/cookie
   → Redirect to: /violations/{id}?action=dismiss

4. Violation detail page loads:
   → Check ?action=dismiss query param
   → Auto-open dismiss modal (pre-populated)
   → User confirms or cancels

5. On confirm:
   → Violation marked dismissed
   → Success toast shown
   → User can close tab and return to GitHub PR
```

**Supported action values:**
- `dismiss` — Opens dismiss modal on violation detail page
- (Future: `exempt`, `report-false-positive` as separate actions if needed)

**No action param:** Page loads normally without modal pre-opened.

**GitHub status check:**

```
Reasoning Substrate — 2 pattern violations found
  ├─ Error Boundary Pattern (error)
  └─ Logging Format Pattern (warning)
```

Status check behavior:
- `error` severity violations → Status: Failing (blocks merge if branch protection enabled)
- `warning` severity only → Status: Passing with warnings
- No violations → Status: Passing ✓

**Status check configuration (MVP):**
- **Single status check** named "Reasoning Substrate" — not multiple checks
- Status checks automatically posted when repo has ≥1 authoritative pattern with enforcement enabled
- No separate toggle — enforcement ON = status checks ON
- Blocking controlled by: (1) pattern severity set during promotion, (2) GitHub branch protection settings

**Status check states (one check, multiple possible states):**

| Condition | State | Description |
|-----------|-------|-------------|
| No violations, no pending evolution | ✓ Success | "All patterns passed" |
| Warning violations only | ✓ Success | "2 pattern warnings (see PR comments)" |
| Error violations | ✗ Failure | "2 pattern violations found" |
| Canonical evolution pending | ⏳ Pending | "Awaiting review: canonical example modified" |
| Non-canonical evolution only | ✓ Success | "Passed (1 evidence file modified — see PR comments)" |

**Priority when multiple conditions:** Failure > Pending > Success (most restrictive wins)

**Post-MVP extensions:**
- Per-repo "strict mode" toggle (fail on any violation regardless of severity)
- Status check name customization
- Multiple status checks (one per pattern category)

---

#### Workflow 4a: Pattern Evolution Review (D27)

**Goal:** When a PR modifies an evidence file, pattern owner decides if it's an evolution (update standard) or deviation (violation).

**Trigger:** PR diff includes file that matches evidence for an authoritative pattern.

**PR Comment for canonical modification:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📋 Reasoning Substrate — Pattern Review Required                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ This PR modifies `src/routes/api/users.ts`, which is the **canonical    │
│ example** for **Error Boundary Pattern**.                               │
│                                                                         │
│ **What changed:** Error logging now includes request ID and timestamp   │
│                                                                         │
│ @darien (pattern owner) — please review:                                │
│                                                                         │
│ • **Accept as evolution** — This improves the pattern; update the       │
│   standard for future enforcement                                       │
│ • **Reject as deviation** — This violates the pattern; author should    │
│   revert or align with existing standard                                │
│                                                                         │
│ [Review in Reasoning Substrate →](link)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**PR Comment for non-canonical evidence:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📋 Reasoning Substrate — Evidence File Modified                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ This PR modifies `src/routes/api/orders.ts`, which is evidence for      │
│ **Error Boundary Pattern**.                                             │
│                                                                         │
│ @darien (pattern owner) — this may affect pattern documentation.        │
│                                                                         │
│ [Review in Reasoning Substrate →](link)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Status check behavior:**

| Evidence Type | Pending Review | Status Check |
|---------------|----------------|--------------|
| Canonical | Blocks merge | ⏳ Pending — description: "Awaiting review: canonical example modified" |
| Non-canonical | Advisory only | ✓ Success — description: "Passed (1 evidence file modified — see PR comments)" |

**Pattern Evolution Review UI:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Pattern Evolution Review                                          [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ERROR BOUNDARY PATTERN                                                 │
│  ⭐ Canonical example modified in PR #142                               │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  WHAT CHANGED                                                           │
│                                                                         │
│  Error logging now includes request ID and timestamp for better         │
│  debugging. Try/catch structure unchanged.                              │
│                                                                         │
│  [View full diff in GitHub →]                                           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  CURRENT PATTERN DEFINITION                                             │
│                                                                         │
│  All API route handlers wrap their logic in try/catch blocks with       │
│  standardized error logging via logger.error() and return ApiError.     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  YOUR DECISION                                                          │
│                                                                         │
│  ○ Accept as pattern evolution                                          │
│    This is an improvement. Update the standard.                         │
│    ☐ Also update pattern description to reflect change                  │
│                                                                         │
│  ○ Reject as deviation                                                  │
│    This violates the pattern. Record as violation.                      │
│                                                                         │
│  Note (optional)                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                            [Cancel]  [Submit Decision]  │
└─────────────────────────────────────────────────────────────────────────┘
```

**On Accept:**
- PatternEvolutionRequest.status → `accepted`
- Evidence `capturedAtSha` updated to PR head SHA
- Line numbers remain as-is until next re-extraction (may drift — see note below)
- Optionally update pattern description
- PR status check → passing
- Audit trail preserved

**Line number drift note:** After accepting an evolution, `startLine`/`endLine` may become inaccurate if subsequent commits shift code around. GitHub links still work (use `capturedAtSha`), but UI displays may point to wrong lines. Accuracy is restored automatically during re-extraction (task 6.5a). For MVP, this is acceptable — users can manually trigger re-extraction if drift becomes problematic. Post-MVP: consider "Re-sync evidence" per-evidence action or visual indicator when `capturedAtSha` differs from latest extraction SHA.

**On Reject:**
- PatternEvolutionRequest.status → `rejected`
- Create Violation record linked to this PR
- Standard violation comment posted
- PR status check → failing (if pattern severity = error)

---

#### Workflow 5: Validation Workflow (Bottom-Up: Code → Pattern)

**Summary of full flow:**

1. **Observation:** User connects repo → Extraction job runs → AI identifies repeated structures
2. **Scoring:** Confidence dimensions computed (Evidence, Adoption, Establishment, Location)
3. **Health check:** Health signals prompt identifies objective concerns
4. **Backtest:** Historical PRs analyzed for potential violations
5. **Queue:** Candidates surface in triage queue, sorted by tier × impact
6. **Triage:** Engineer reviews, promotes/rejects/defers via keyboard
7. **Promotion:** Human adds rationale, provenance; enables enforcement
8. **Enforcement:** Future PRs checked against authoritative patterns

---

#### Workflow 6: Evolution Workflow (Top-Down: Pattern → Code)

*Post-MVP — documented for future reference*

1. **Proposal:** Human or Scout Agent proposes v2 of existing pattern
2. **Comparison:** Side-by-side diff of v1 vs v2 definition
3. **Migration scope:** System identifies all v1 instances needing update
4. **Implementation:** Actor Agent generates migration PRs (or human does manually)
5. **Tracking:** Dashboard shows migration progress (X of Y instances updated)
6. **Deprecation:** When v1 reaches <5% instances, prompt to mark deprecated

---

#### Workflow 7: Repo Connection

**Goal:** Connect a GitHub repo and surface first patterns as quickly as possible.

**Design principles:**
- Show progress immediately — never a blank screen
- Set expectations — estimated time to completion
- Allow background processing — user can navigate away
- Celebrate arrival — patterns appearing is an "aha" moment

**Step 1: Add Repo (from Dashboard)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Reasoning Substrate                                    @darien ▾       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Your Repos                                            [+ Add Repo]     │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  No repos connected yet                                           │ │
│  │                                                                   │ │
│  │  Connect a GitHub repo to discover architectural patterns.        │ │
│  │                                                                   │ │
│  │                      [+ Add Your First Repo]                      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Step 2: GitHub App Installation (if not already installed)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Install Reasoning Substrate                                       [×] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  To analyze your repos, we need to install our GitHub App.              │
│                                                                         │
│  We request read access to:                                             │
│  • Repository contents (to extract patterns)                            │
│  • Pull requests (to detect violations)                                 │
│  • Commit history (for confidence scoring)                              │
│                                                                         │
│  We request write access to:                                            │
│  • Pull request comments (to post violations)                           │
│  • Commit statuses (to show pass/fail checks)                           │
│                                                                         │
│  🔒 Your code never leaves GitHub — we analyze via API.                 │
│                                                                         │
│                          [Install on GitHub →]                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

→ Redirects to GitHub App installation flow
→ User selects account/org and repos
→ Returns to app

**Step 3: Select Repos to Analyze**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Select Repos to Analyze                                           [×] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  GitHub App installed on: darien (personal)                             │
│                                                                         │
│  Select repos to connect:                                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ [✓] reasoning-substrate     142 files  TypeScript   ✓ Supported  │ │
│  │ [✓] api-server              87 files   TypeScript   ✓ Supported  │ │
│  │ [ ] landing-page            12 files   TypeScript   ✓ Supported  │ │
│  │ [ ] data-pipeline           340 files  Python       ✓ Supported  │ │
│  │ [ ] massive-monorepo        2,847 files             ⚠️ Too large │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ⚠️ massive-monorepo exceeds 600k token limit. Connect subdirectories     │
│     instead, or wait for large repo support (coming soon).              │
│                                                                         │
│  2 repos selected                        [Cancel]  [Connect & Analyze]  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Step 4: Ingestion & Extraction Progress**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Reasoning Substrate                                    @darien ▾       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  reasoning-substrate                                                    │
│  ════════════════════════════════════════════════════════════════════   │
│                                                                         │
│  ◐ Analyzing your codebase...                      ~3 min remaining     │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  45%       │
│                                                                         │
│  ✓ Indexed 142 files                                                    │
│  ✓ Fetched 2 years of commit history                                    │
│  ✓ Retrieved 47 recent PRs for backtest                                 │
│  ◐ Extracting patterns...                                               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Pattern extraction in progress                                    │ │
│  │                                                                   │ │
│  │  We're analyzing your codebase for architectural patterns.        │ │
│  │  This typically takes 2-5 minutes depending on repo size.         │ │
│  │                                                                   │ │
│  │  You'll be notified when extraction completes.                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  💡 Feel free to navigate away — we'll keep working in the background. │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

*Note (D16): Patterns appear all-at-once when extraction completes, not incrementally. Streaming extraction is a post-MVP enhancement.*

**Step 5: Extraction Complete**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Reasoning Substrate                                    @darien ▾       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  reasoning-substrate                                        [Settings]  │
│  ════════════════════════════════════════════════════════════════════   │
│                                                                         │
│  ✓ Analysis complete                                                    │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │       23        │  │        0        │  │       47        │         │
│  │    Patterns     │  │   Authoritative │  │   PRs Analyzed  │         │
│  │   discovered    │  │                 │  │   for backtest  │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Ready to review!                                                 │ │
│  │                                                                   │ │
│  │  We found 23 pattern candidates in your codebase.                 │ │
│  │  7 are high-confidence and would have caught 12 violations        │ │
│  │  in recent PRs.                                                   │ │
│  │                                                                   │ │
│  │                    [Start Reviewing Patterns →]                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Flow summary:**

```
1. User clicks [+ Add Repo]
   → If no GitHub App: show installation modal → redirect to GitHub
   → If GitHub App exists: show repo selector
   
2. User selects repos, clicks [Connect & Analyze]
   → Repos saved to DB with status: 'pending'
   → Trigger.dev jobs queued: ingestRepo, extractPatterns
   → Redirect to repo progress page
   
3. Progress page shows real-time status updates (D16)
   → Ingestion steps check off as completed (via Supabase Realtime on repos table)
   → Extraction status shown as in-progress
   → User can navigate away; job continues in background
   
4. Extraction completes
   → Repo status updates to 'extracted' (Realtime triggers UI update)
   → Summary stats shown
   → Clear CTA to start reviewing
   → Backtest results teased ("would have caught X violations")
```

---

#### Workflow 8: Dashboard & Navigation

**Goal:** Provide clear navigation and at-a-glance status across all repos and patterns.

**Information architecture:**

```
├── Dashboard (home)
│   ├── Repo cards with status
│   └── Global stats
│
├── Repo Detail
│   ├── Pattern candidates (queue)
│   ├── Authoritative patterns
│   ├── PR history
│   └── Settings
│
├── Pattern Detail
│   ├── Definition (editable)
│   ├── Evidence
│   ├── Confidence breakdown
│   └── Violation history
│
└── Settings
    ├── Connected repos
    ├── GitHub App status
    └── Notification preferences
```

**Dashboard (home screen):**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Reasoning Substrate                                    @darien ▾       │
├────────────────┬────────────────────────────────────────────────────────┤
│                │                                                        │
│  Dashboard  ←  │  Overview                               [+ Add Repo]   │
│                │                                                        │
│  Repos         │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  • reasoning-  │  │      12      │ │      47      │ │      8       │   │
│    substrate   │  │ Authoritative│ │  Violations  │ │  Candidates  │   │
│  • api-server  │  │   Patterns   │ │    Caught    │ │   Pending    │   │
│                │  └──────────────┘ └──────────────┘ └──────────────┘   │
│  Settings      │                                                        │
│                │  Last 7 Days                                           │
│                │  ───────────────────────────────────────────────────   │
│                │  🛡️ 7 violations caught                                │
│                │  ⏱️ ~1.5 hours saved                                   │
│                │                                                        │
│                │  Top patterns:                                         │
│                │  • Error Boundary Pattern (3)                          │
│                │  • API Response Format (2)                             │
│                │  • Logging Standard (2)                                │
│                │                                         [View details →]│
│                │                                                        │
│                │  Your Repos                                            │
│                │  ───────────────────────────────────────────────────   │
│                │                                                        │
│                │  ┌─────────────────────────────────────────────────┐   │
│                │  │  reasoning-substrate                            │   │
│                │  │  8 authoritative · 5 candidates · 23 violations │   │
│                │  │  Last PR analyzed: 2 hours ago                  │   │
│                │  │                          [Review Candidates (5)]│   │
│                │  └─────────────────────────────────────────────────┘   │
│                │                                                        │
│                │  ┌─────────────────────────────────────────────────┐   │
│                │  │  api-server                                     │   │
│                │  │  4 authoritative · 3 candidates · 12 violations │   │
│                │  │  Last PR analyzed: 1 day ago                    │   │
│                │  │                          [Review Candidates (3)]│   │
│                │  └─────────────────────────────────────────────────┘   │
│                │                                                        │
└────────────────┴────────────────────────────────────────────────────────┘
```

**Impact widget (task 6.7):**
- Time range: Rolling 7 days (not calendar week)
- Scope: Aggregated across all user's repos
- Time saved: `violations × 15 min / 60` = hours (see D12, H13)
- Top patterns: Top 3 by violation count in last 7 days
- Refresh: On page load (no real-time)

**Repo detail screen:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Reasoning Substrate                                    @darien ▾       │
├────────────────┬────────────────────────────────────────────────────────┤
│                │                                                        │
│  Dashboard     │  reasoning-substrate                      [⟳ Refresh] │
│                │  github.com/darien/reasoning-substrate    [Settings]   │
│  Repos         │                                                        │
│  • reasoning-  │  ┌────────────┬────────────┬────────────┬───────────┐ │
│    substrate ← │  │ Candidates │ Authorized │ PR History │  Insights │ │
│  • api-server  │  └────────────┴────────────┴────────────┴───────────┘ │
│                │                                                        │
│  Settings      │  Candidates (5)                         [Start Triage] │
│                │  ───────────────────────────────────────────────────   │
│                │                                                        │
│                │  Strong (2)                                            │
│                │  ├─ Error Boundary Pattern      ⚡ 4 violations        │
│                │  └─ API Response Format         ⚡ 3 violations        │
│                │                                                        │
│                │  Emerging (1)                                          │
│                │  └─ Feature Flag Guard          ⚡ 1 violation         │
│                │                                                        │
│                │  Moderate (2)                                          │
│                │  ├─ Logger Initialization       ✓ No violations        │
│                │  └─ Config Loader Pattern       ✓ No violations        │
│                │                                                        │
│                │                                                        │
│                │  Authoritative (8)                           [View All]│
│                │  ───────────────────────────────────────────────────   │
│                │  ├─ Authentication Middleware   12 violations caught   │
│                │  ├─ Database Transaction        8 violations caught    │
│                │  ├─ Input Validation            6 violations caught    │
│                │  └─ ... 5 more                                         │
│                │                                                        │
└────────────────┴────────────────────────────────────────────────────────┘
```

**Navigation patterns:**

| From | To | Trigger |
|------|-----|---------|
| Dashboard | Repo detail | Click repo card |
| Dashboard | Triage queue | Click "Review Candidates" |
| Repo detail | Triage queue | Click "Start Triage" |
| Repo detail | Pattern detail | Click pattern name |
| Triage queue | Pattern detail | Click pattern name (or `Enter` then click) |
| PR comment | Pattern detail | Click "View pattern details" link |
| Any screen | Dashboard | Click "Dashboard" in sidebar |

**Global keyboard shortcuts:**

| Key | Action |
|-----|--------|
| `g d` | Go to Dashboard |
| `g r` | Go to Repos list |
| `g s` | Go to Settings |
| `/` | Focus search (future) |
| `?` | Show all shortcuts |

**Empty states:**

| State | Message | CTA |
|-------|---------|-----|
| No repos | "Connect a GitHub repo to discover architectural patterns." | [+ Add Your First Repo] |
| No candidates | "All caught up! No patterns waiting for review." | [View Authoritative Patterns] |
| No authoritative | "Promote patterns from the candidate queue to start enforcement." | [Review Candidates] |
| No violations | "No violations detected yet. Patterns will be checked on new PRs." | — |
| Zero patterns extracted | "No patterns detected in this codebase. This can happen with small repos or highly varied code." | [Re-analyze Repo] [Connect Another Repo] |

---

#### Workflow 9: Context File Setup
`[Added: Dec 2025]`

**Goal:** Configure AI agent context file generation for a repository.

**Trigger:** User clicks "Set up AI Agents" from repo dashboard or first pattern promotion.

**Setup modal:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  AI Agent Configuration                                             [×] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Select AI tools your team uses:                                        │
│                                                                         │
│  ☑ Claude Code                                                          │
│    └─ CLAUDE.md                                           [Edit path]   │
│                                                                         │
│  ☑ Cursor                                                               │
│    └─ .cursorrules                                        [Edit path]   │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  How it works:                                                          │
│  • We append a clearly-marked section to your existing files            │
│  • Your custom content is preserved                                     │
│  • Section auto-updates when patterns change                            │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                        [Cancel]  [Save Configuration]   │
└─────────────────────────────────────────────────────────────────────────┘
```

**On save:**
- Create ContextFileConfig records for each enabled format
- Generate initial context file content
- Show download/copy options for user to commit

*Reference: Decisions D30, D32*

---

#### Workflow 10: Context File Sync
`[Added: Dec 2025]`

**Goal:** Keep context files in sync with authoritative patterns.

**Triggers:**
- Pattern promoted to authoritative
- Pattern description/rationale updated
- Pattern deprecated
- Enforcement channels changed
- User clicks "Regenerate" manually

**Sync process:**

```
1. Pattern change detected
   ↓
2. Debounce (5-10 seconds) — wait for batch of changes
   ↓
3. For each enabled ContextFileConfig for this repo:
   ↓
4. Generate new section content
   ↓
5. Compare hash to lastGeneratedContentHash
   ↓
6. If changed:
   ├─ Update lastGeneratedContentHash, lastGeneratedAt
   └─ Mark as "pending sync" in UI
```

**Content generation (marker-based append):**

```markdown
# ... user's existing CLAUDE.md content stays untouched above ...

<!-- REASONING_SUBSTRATE_START -->
<!-- Auto-generated by Reasoning Substrate. Do not edit this section. -->
<!-- Last updated: 2025-01-15T10:30:00Z -->

## Project Patterns

[generated pattern content here]

<!-- REASONING_SUBSTRATE_END -->
```

**File handling logic (D33):**
1. If file doesn't exist → create with just our section
2. If file exists without markers → append our section at end
3. If file exists with markers → replace only content between markers

**Dashboard widget:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  AI Agent Sync                                               [Settings] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CLAUDE.md              ✓ Synced                          [View] [↓]   │
│                         Last updated: 2 minutes ago                     │
│                                                                         │
│  .cursorrules           ✓ Synced                          [View] [↓]   │
│                         Last updated: 2 minutes ago                     │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  12 patterns included │ 8 code │ 4 filesystem                           │
│                                                                         │
│                                              [Regenerate All]           │
└─────────────────────────────────────────────────────────────────────────┘
```

*Reference: Decision D36*

---

#### Workflow 11: Filesystem Pattern Extraction
`[Added: Dec 2025]`

**Goal:** Identify filesystem conventions from codebase structure.

**Extraction approach:**

Unlike code patterns (read file contents), filesystem patterns analyze:
- Directory tree structure
- File naming conventions
- Co-location patterns

**Extraction prompt additions:**

```
Analyze the repository file structure for filesystem patterns:

1. FILE NAMING CONVENTIONS
   - What naming conventions exist? (PascalCase, camelCase, kebab-case)
   - Are there consistent suffixes? (.test.ts, .spec.ts, .stories.tsx)
   - Do naming patterns correlate with file purpose?

2. DIRECTORY STRUCTURE PATTERNS
   - What organizational patterns exist? (feature folders, layer folders, domain folders)
   - Is there consistent co-location? (tests next to source, styles next to components)
   - What is the standard folder structure for a new feature/module?

For each pattern found, provide:
- Pattern name and type (file-naming or file-structure)
- Example paths demonstrating the pattern
- Counter-examples if violations exist
- Glob pattern for matching (where applicable)
- Confidence assessment (evidence count + adoption rate)
```

**Evidence captured:**

```typescript
// File naming pattern example
{
  type: 'file-naming',
  name: 'React Component Naming',
  description: 'React components use PascalCase with .tsx extension',
  confidenceModel: 'filesystem',
  confidence: {
    evidence: 47,    // 47 files match this pattern
    adoption: 0.94   // 94% of .tsx files in src/components follow convention
  },
  evidence: {
    examplePaths: [
      'src/components/UserProfile.tsx',
      'src/components/NavigationBar.tsx',
      'src/features/auth/LoginForm.tsx'
    ],
    pathGlob: 'src/**/*.tsx',
    antiPatternPaths: [
      'src/components/userProfile.tsx',  // Would violate
      'src/components/user-profile.tsx'  // Would violate
    ]
  }
}

// Directory structure pattern example
{
  type: 'file-structure',
  name: 'Feature Folder Convention',
  description: 'Features organized in self-contained folders with standard structure',
  confidenceModel: 'filesystem',
  confidence: {
    evidence: 8,     // 8 feature folders exist
    adoption: 0.875  // 7 of 8 follow the full structure
  },
  evidence: {
    examplePaths: [
      'src/features/auth/',
      'src/features/billing/',
      'src/features/dashboard/'
    ],
    structureTemplate: `
      {feature}/
        index.ts        # Public exports
        components/     # Feature-specific components
        hooks/          # Feature-specific hooks
        types.ts        # TypeScript types
    `,
    pathGlob: 'src/features/*/'
  }
}
```

**UI display:**
- Filesystem pattern cards show 2 confidence pills (Evidence, Adoption) instead of 4
- Badge indicates `file-naming` or `file-structure` type
- For file-naming: PR Review enabled by default
- For file-structure: PR Review disabled (context-file-only)

*Reference: Decisions D31, D34, D35*

### 2.6 Technical Risks
`[Partial]` · `[Updated: Dec 2025]`

- **Cold start latency:** Full behavioral analysis takes time; need immediate value from static analysis
- **AI confidence calibration:** Wrong pattern promotion destroys trust; need robust confidence framework
- **Scale economics:** Continuous observation at 500+ services could be expensive
- **Filesystem pattern extraction unreliable (R9):** LLM may struggle to infer structural conventions from file tree alone; mitigated by conservative extraction and 2-dimension confidence scoring
- **Context file user content conflicts (R10):** Users may accidentally edit inside auto-generated markers; mitigated by clear warnings and marker-based append (D33)

---

## 3. Market Space
`[Explored]` · Confidence: ●●○ Medium · Last Updated: Dec 2025

### 3.1 Competitive Landscape
`[Explored]`

| Category | Players | Overlap | Our Edge |
|----------|---------|---------|----------|
| AI Code Assistants | Copilot, Cody, Cursor | Codebase-aware suggestions | Persistent patterns + enforcement |
| Tech Debt Tools | CodeScene | Hotspot detection, drift tracking | Concept-level vs file-level |
| Documentation | Swimm | Code-coupled docs, onboarding | Self-enforcing knowledge |
| Dev Portals | Backstage, Cortex | Service catalog, standards | AI extraction vs manual YAML |

### 3.2 Positioning
`[Explored]`

- **vs Copilot:** "Copilot writes code. We ensure it's YOUR code — aligned with your architecture."
- **vs CodeScene:** "CodeScene tells you which files hurt. We tell you which DECISIONS are violated."
- **vs Swimm:** "Swimm documents what you decided. We ensure you actually follow it."
- **vs Backstage:** "Backstage catalogs your services. We catalog your THINKING."

### 3.3 Differentiation & Moat
`[Explored]`

1. **Data Network Effect:** More patterns validated → better extraction models
2. **Provenance Lock-in:** Patterns link to PRs, Slack, JIRA — switching loses decision history
3. **Workflow Integration:** IDE guardrails, PR gates — ripping out breaks CI/CD
4. **Organizational Memory:** Expertise Map, bus factor tracking — this data doesn't exist elsewhere

*Reference: Decision D3*

### 3.4 Market Timing
`[Partial]`

Favorable indicators: AI code generation explosion, LLM cost collapse, proven pain point.

> ⚠️ **RISK:** GitHub Copilot trajectory unclear. If they ship pattern enforcement, we may have 12-18 months before commoditization.

---

## 4. Business Space
`[Partial]` · Confidence: ●○○ Low · Last Updated: Dec 2025

### 4.1 Pricing Model
`[Deferred]`

> ⚠️ **PLACEHOLDER:** The pricing table below is early speculation from initial exploration. Features listed do not reflect MVP scope (e.g., Knowledge Graph, IDE extension, Actor/Scout Agents are all post-MVP). Pricing will be validated post-dogfood based on actual feature set and customer willingness-to-pay research.

| Tier | Price | Includes | Rationale |
|------|-------|----------|-----------|
| Free | $0 | Knowledge Graph (read), 1 repo, 3 users | Onboarding wedge |
| Pro | $15/user/mo | Observer Agents, IDE, unlimited repos | Cody Pro parity |
| Enterprise | $45/user/mo | Actor/Scout Agents, SSO, migrations | Cody Enterprise parity |

**Usage-based add-on:** Actor Agent executions at $0.50/migration PR

### 4.2 Unit Economics
`[Partial]`

**Estimated costs per org (mid-size, 100 devs):**

- Initial analysis: $50-200 (amortized)
- Monthly inference: $200-400
- Storage/compute: $50-100

**At $15/user/mo with 100 devs:** $1,500 revenue vs ~$400-600 cost = 60-73% gross margin

> ⚠️ **GAP:** These are estimates. Need real usage data to validate.

### 4.3 Growth Model
`[Deferred]`

Intentionally deferred until post-dogfood validation. Focus is on proving the product works before modeling how to sell it.

> **Deferred scope:** PLG vs sales-led motion, expansion model, viral coefficients, conversion funnel math.

### 4.4 Funding Requirements
`[Deferred]`

Bootstrap approach confirmed — no external funding until market demand proven through dogfooding.

> **Deferred scope:** Seed requirements, milestone-based funding, burn rate analysis.

---

## 5. Go-to-Market Space
`[Partial]` · Confidence: ●●○ Medium · Last Updated: Dec 2025

### 5.1 Buyer Personas
`[Explored]`

**Primary (writes the check):** Staff+ Engineer or DevEx Lead

- Drowning in PR reviews
- Frustrated by recurring architectural mistakes
- Tasked with "improving developer productivity"

**Secondary (approves budget):** VP Engineering

- Needs ROI justification
- Cares about velocity metrics, risk reduction

### 5.2 Distribution Strategy
`[Unexplored]`

> ⚠️ **GAP:** No distribution strategy defined. Options: PLG (self-serve), sales-assisted, enterprise sales. Need to pick primary motion.

### 5.3 Wedge & Expansion
`[Explored]`

**Wedge (land):** Knowledge Graph + Onboarding — low-risk, universal pain point

**Expansion (expand):** Observer Agents → Actor Agents → Migrations

**Challenge:** Value is org-level but wedge is individual. Need bridge from user adoption to org purchase.

### 5.4 Sales Motion
`[Unexplored]`

> ⚠️ **GAP:** No sales motion defined. What's the typical deal cycle? Who needs to be involved? What objections will we face?

### 5.5 Champion Enablement
`[Explored]`

Tools to help internal champions sell up:

- **Drift Cost Calculator:** Self-serve tool showing hours lost to pattern violations
- **Pilot Proposal Template:** Pre-written doc with problem, scope, metrics
- **Comparison Sheet:** Honest competitive positioning

---

## 6. Execution Space
`[Unexplored]` · Confidence: ●○○ Low · Last Updated: Dec 2025

### 6.1 MVP Definition
`[Explored]` · Updated: Dec 2025

#### MVP Vision

Full Observer Agent loop with GitHub PR integration — the complete extract → validate → enforce cycle.

```
Connect repo → Extract patterns (AI) → Surface candidates → Human validates → Enforce on PRs → Detect violations
```

#### Scope Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform | GitHub only | Largest market share; single integration to build |
| Interface | Web app only | Fastest to ship; VS Code extension is post-MVP |
| Repo support | Multi-repo from day 1 | Dogfooding need; architect once |
| Auth model | GitHub App | Native webhooks, PR comments, status checks |
| Pattern types | All (structural, behavioral, API, testing) | Test broad extraction capability |
| Timeline | 7-10 weeks | Solo build with AI tooling (Claude Code); includes context file generation and filesystem patterns |

*References: Decisions D4, D5, D6*

#### Tech Stack
`[Updated: Dec 2025]`

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Vite + React 18 + TanStack Router | Type-safe file-based routing SPA |
| **Styling** | Tailwind CSS v4 + Base UI | Utility-first CSS with headless components |
| **Backend** | Hono (Bun runtime) | Lightweight, edge-ready API server |
| **API Layer** | tRPC | End-to-end type-safe RPC between frontend and backend |
| **Database** | Supabase (Postgres) + Drizzle ORM | Pattern storage, provenance, user data; type-safe queries |
| **Auth** | Supabase Auth + GitHub App | User login (Supabase); repo access & webhooks (GitHub App) |
| **Background Jobs** | Trigger.dev | Long-running pattern extraction, PR analysis |

*References: Decisions D7, D37*

#### Core Features (In Scope)
`[Updated: Dec 2025]`

| Feature | Description | Hypotheses Tested |
|---------|-------------|-------------------|
| **Repo Connection** | GitHub App install flow; select repos to analyze | — |
| **Pattern Extraction** | LLM analyzes codebase, identifies repeated structures across files/services | H3a |
| **Candidate Queue** | UI to review AI-extracted pattern candidates | H4, H9 |
| **Validation Flow** | Promote pattern to Authoritative; add rationale (the "Why"); set ownership | H4, H12 |
| **Provenance Capture** | Link patterns to PRs, commits, external sources (manual URL for MVP) | H11 |
| **PR Violation Detection** | On PR open/update, analyze diff against validated patterns | H3b |
| **PR Comments** | Post violations as inline comments with pattern context | H1 (proxy) |
| **Status Checks** | GitHub status check: pass/fail based on violations | H9 |
| **Pattern Dashboard** | View all patterns (candidates + validated), filter by repo/status/type | H9 |
| **Impact Preview (Backtest)** | Show "Would have caught X violations in Y PRs" before promoting pattern | H4, H12 |
| **Violation Attribution** | PR comments include pattern owner and rationale snippet | H1, H11 |
| **Queue Depletion UX** | Keyboard-driven triage, progress bar, smart sorting by confidence tier | H4 |
| **Weekly Impact Digest** | Dashboard widget: violations caught, estimated time saved | H1 |
| **Context File Generation** | Transform authoritative patterns into CLAUDE.md, .cursorrules | H14 |
| **AI Agent Sync** | Keep context files updated when patterns change (debounced) | H14 |
| **Filesystem Pattern Extraction** | Identify naming and structure conventions from file tree | H3a, H15 |
| **Dual Channel Promotion** | Choose PR review and/or AI agent enforcement per pattern | — |

#### Out of Scope (Post-MVP)
`[Updated: Dec 2025]`

| Feature | Reason to Defer |
|---------|-----------------|
| VS Code extension | Additional platform; web proves core value first |
| Actor Agents (auto-fix) | Higher risk; requires trust built through Observer phase |
| Scout Agents (external ecosystem) | Premium feature; not needed for initial validation |
| GitLab / Bitbucket | GitHub sufficient for initial market |
| Slack/Jira integrations | Manual URL provenance sufficient for MVP |
| Migration workflows (v1 → v2) | Requires pattern evolution; add after core loop proven |
| Team/org management | Solo dogfood first; add when first external users onboard |
| Usage-based billing | No monetization in MVP |
| Smart chunking for large repos | 1M context handles target size (50-200 files); adds complexity for edge cases (D10) |
| Delta/incremental extraction | Extract-once sufficient for MVP; add when codebase staleness becomes issue (D9) |
| Automatic re-extraction (scheduled/on-push) | MVP includes duplicate detection (D29); automatic re-extraction needs scheduling infrastructure and delta analysis (D9) |
| Auto-commit context files | Manual download/commit for MVP; reduces GitHub App permission concerns |
| Copilot/Aider/Generic formats | Start with Claude + Cursor; add formats based on demand |
| Boundary pattern detection | Import graph analysis complex; context-file-only value unclear |
| File-structure PR enforcement | Violation detection requires intent inference; too ambiguous |
| MCP server for dynamic injection | Static file generation covers primary use cases |
| Context file merge conflict resolution | Edge case; marker-based approach avoids most conflicts |
| Continuous evidence staleness detection | MVP detects staleness only during re-extraction; post-MVP: PR webhook marks evidence stale when files deleted |

#### Hypotheses Tested by MVP

| Hypothesis | How MVP Tests It |
|------------|------------------|
| H1 (Staff+ spend >4hrs on PR feedback) | Proxy: Do violations caught reduce review cycles? Self-observation + future user interviews |
| H3a (LLM extracts patterns >80% precision) | Measure extraction quality on own repos |
| H3b (Violation detection >90% precision, <10% FP) | Track false positive rate in PR comments |
| H4 (>50% candidates get human action in 7 days) | Measure own engagement; observe in future pilots |
| H9 (Value in <15 min) | Time-to-first-useful-pattern on fresh repo |
| H11 (Provenance → retention) | Qualitative: does adding "Why" feel valuable? |
| H12 (Validated > AI-only trust) | Do I actually enable enforcement only on validated patterns? |

#### Success Criteria

MVP is successful if:

1. **Technical:** Can extract 10+ meaningful patterns from a real codebase with >80% precision
2. **Usability:** First useful pattern surfaces within 15 minutes of connecting repo
3. **Loop closure:** End-to-end flow works: extraction → validation → PR violation detection → comment posted
4. **Dogfooding signal:** I actually use it on my own PRs and find violations I would have missed

#### Open Technical Questions

| Question | Status | Resolution |
|----------|--------|------------|
| LLM model choice | ✅ Resolved | Claude Sonnet 4.5 for all tasks (D8) |
| Extraction chunking | ✅ Resolved | Full-repo single-pass with 1M context beta; block >600k tokens for MVP with safety buffer (D10) |
| Pattern schema | ✅ Resolved | See section 2.4 |
| Incremental analysis | ✅ Resolved | Extract-once + manual refresh (D9) |
| Confidence scoring | ✅ Resolved | Multi-dimensional model (Evidence, Adoption, Establishment, Location) stored in `Pattern.confidenceScore`; Health Signals in `Pattern.healthSignals`; Backtest in `Pattern.backtestSummary` + `backtest_violations` table; Template-based insights (D11, D12) |

### 6.2 Build Sequence
`[Explored]` · Updated: Dec 2025

#### Guiding Principle

Build thin vertical slices through the entire stack. Each phase delivers a working increment of the full loop, not a polished piece in isolation.

```
Phase 1: Foundation (infrastructure + data model)
Phase 2: Ingestion (repo connection + code indexing)
Phase 3: Extraction (LLM pattern detection)
Phase 4: Validation (candidate UI + human review)
Phase 5: Enforcement (PR analysis + violation comments)
Phase 6: Polish (UX refinement + edge cases)
```

---

#### Phase 1: Foundation
`[Updated: Dec 2025 — reflects D37 stack migration]`
**Goal:** Infrastructure running, data model implemented, auth working

| Task | Description | Dependency |
|------|-------------|------------|
| 1.1 | Initialize monorepo with Turborepo + Bun workspaces; create `apps/api` (Hono) and `apps/web` (Vite + TanStack Router) | — |
| 1.2 | Set up Supabase project (Postgres + Auth); configure Drizzle ORM in `apps/api` | — |
| 1.3 | Set up Trigger.dev project, connect to API app | — |
| 1.4 | Create GitHub App (dev environment) | — |
| 1.5 | Implement GitHub OAuth flow via Supabase Auth | 1.2, 1.4 |
| 1.6 | Design and migrate core schema with Drizzle: `users`, `repos`, `patterns`, `violations`, `provenance` | 1.2 |
| 1.7 | Implement GitHub App installation flow (user installs app, selects repos) | 1.4, 1.5 |
| 1.8 | Store installation ID and repo metadata in DB; implement `getInstallationToken(installationId)` utility using `@octokit/auth-app` for on-demand token generation (D15) | 1.6, 1.7 |
| 1.9 | Configure environment variables in `.env` files; add to `.env.example` for local dev (D15) | 1.4 |
| 1.10 | Set up tRPC with shared `@mantle/trpc` package for type-safe API calls (D37) | 1.1, 1.2 |

**Deliverable:** User can log in, install GitHub App, select repos — repos appear in dashboard (empty state)

**Estimated effort:** 3-5 days

---

#### Phase 2: Ingestion
**Goal:** Codebase content accessible for analysis

| Task | Description | Dependency |
|------|-------------|------------|
| 2.1 | Implement repo cloning/fetching via GitHub API (or clone to temp storage) | 1.8 |
| 2.2 | Build file tree indexer — catalog all files with metadata (path, language, size) | 2.1 |
| 2.3 | Implement content chunking strategy (file-level initially) | 2.2 |
| 2.4 | Create Trigger.dev job: `ingestRepo` — runs on repo connection | 1.3, 2.1-2.3 |
| 2.5 | Store indexed content in DB (or reference to fetched content) | 2.4 |
| 2.6 | Basic UI: show repo file tree, ingestion status | 2.5 |
| 2.7 | Fetch git commit history (2-year depth) via GitHub Commits API | 2.1 |
| 2.8 | Extract per-file metadata: author username, commit date, commit SHA via git blame; for multi-line evidence ranges, use `startLine` to determine author/commit (deterministic, captures the "signature" line where patterns typically begin) | 2.7 |
| 2.9 | Store file metadata in `repo_files` table (path, language, size, token estimate) for each indexed file; upsert on re-ingestion; enables evidence autocomplete (D21); location classification moved to extraction phase (D25: LLM-based) | 2.2 |
| 2.10 | Fetch recent merged PRs for backtest (D28): (1) List merged PRs from last 90 days via `GET /repos/{owner}/{repo}/pulls?state=closed&sort=updated&direction=desc`; (2) Filter to merged PRs, cap at 100 most recent for MVP; (3) Fetch diff for each PR via `GET /repos/{owner}/{repo}/pulls/{number}/files` with rate limit handling (respect `X-RateLimit-Remaining`, back off if <100 remaining); (4) Store full patch content in Supabase Storage (`pr_diffs/{repo_id}/{pr_number}.patch`); store PR metadata + file paths in DB with `diffStoragePath` reference; if rate limited mid-fetch, proceed with PRs fetched so far | 2.1 |
| 2.11 | Implement ingestion progress tracking: update Repo record with step status (files indexed, git history fetched, PRs fetched); use Supabase Realtime (subscribe to `repos` table UPDATE events) for live UI updates | 2.4 |
| 2.12 | Calculate estimated token count during ingestion (sum of file content lengths × 0.25 tokens/char); store in `Repo.tokenCount`; if >600k tokens, set `ingestionStatus: 'failed'` with reason (600k threshold = 75% of 800k limit, provides safety buffer for token estimation variance across languages); UI shows "⚠️ Too large" in repo selector | 2.2 |
| 2.13 | Store indexed file paths in `repo_files` table (repo_id, file_path) for evidence autocomplete (D21); update on re-ingestion | 2.3 |
| 2.14 | During re-ingestion, mark existing evidence as stale if file path no longer in repo_files index (D21) | 2.13 |

**Deliverable:** Connected repo is ingested; file tree visible in UI; git metadata available for confidence scoring; historical PRs available for backtest; real-time progress updates in UI; repos exceeding token limit blocked with clear messaging

**Estimated effort:** 4-5 days (+1 day for git history, +1 day for PR history)

---

#### Phase 3: Extraction
**Goal:** LLM identifies patterns, stores as candidates with confidence scoring

| Task | Description | Dependency |
|------|-------------|------------|
| 3.1 | Design extraction prompt strategy (what constitutes a "pattern"?) | — |
| 3.2 | Implement LLM extraction pipeline — analyze chunks, identify repeated structures | 2.5, 3.1 |
| 3.3 | Define pattern schema: `type`, `name`, `description`, `evidence` (file locations) | 1.6 |
| 3.4 | Create Trigger.dev job: `extractPatterns` — runs after ingestion; validates `tokenCount < 600k` before proceeding (fail gracefully if exceeded; 600k = safety buffer per D10) | 1.3, 3.2, 2.12 |
| 3.5 | Deduplicate/merge similar patterns (LLM or heuristic) | 3.4 |
| 3.6 | Store candidate patterns in DB with `status: 'candidate'` | 3.5 |
| 3.7 | Compute confidence dimensions from git metadata (adoption, establishment) and LLM classification (location per D25: classify each evidence file as core/feature/frontend/backend/test/config/helper based on code content); validate codeCategory is one of 7 known values, default to 'helper' if LLM returns unexpected value | 2.8, 3.6 |
| 3.8 | Request consistency assessment in extraction prompt; store per-pattern | 3.2 |
| 3.9 | Run health signals prompt per pattern (D23): single prompt covering all 5 categories; includes pattern definition + evidence snippets; deprecated-api uses two-step approach (identify libraries/APIs, then flag deprecated/maintenance/legacy from LLM knowledge); security is high-confidence obvious issues only; store results in `Pattern.healthSignals` | 3.6 |
| 3.10 | Derive confidence tier from dimensions; store full `PatternConfidence` object in `Pattern.confidenceScore` | 3.7, 3.8 |
| 3.11 | Implement insight generation using json-rules-engine (D24): install package, define InsightFacts from pattern data, load starter rule set (14 rules), return highest-priority matching insight + actions | 3.10, 3.9 |
| 3.12 | Basic UI: list candidate patterns with confidence tiers | 3.11 |
| 3.13 | Build violation detection module (pattern + diff → violations) — shared core for backtest & enforcement | 3.6 |
| 3.14 | Add extraction progress to Repo record (extractionStatus: pending/extracting/complete/failed); emit Supabase Realtime event on completion | 3.4 |
| 3.15 | Duplicate detection (D29): after extraction, compare each candidate against existing authoritative patterns; use LLM to judge semantic similarity (bundle with health signals prompt for efficiency); if similar, set `similarToPatternId` field; candidates with matches surface with different UI treatment in queue | 3.6, 3.9 |
| 3.16 | File tree analysis for filesystem patterns: extract directory structure, file names, and path patterns; runs as separate prompt after code extraction completes within same `extractPatterns` job | 3.1 |
| 3.17 | Filesystem pattern extraction prompt: identify file-naming and file-structure conventions | 3.16 |
| 3.18 | FilesystemPatternEvidence storage: store example paths, glob patterns, anti-patterns | 2.1 |
| 3.19 | 2-dimension confidence scoring for filesystem patterns (Evidence + Adoption only); derive tier using FILESYSTEM_TIER_THRESHOLDS: strong (≥10 paths, ≥80% adoption), emerging (≥5 paths, ≥60% adoption, <3 months), weak (≤3 paths OR <40% adoption), else moderate | 3.18 |

**Deliverable:** After repo ingestion, patterns auto-extracted with confidence scores (`confidenceScore`), health signals (`healthSignals`), and contextual insights; duplicate candidates flagged with `similarToPatternId`; filesystem patterns extracted with 2-dimension confidence; violation detection ready for use; real-time extraction status updates

**Estimated effort:** 8.5-10.5 days (+2-3 days for confidence system, +1 day for violation module, +1.5 days for filesystem extraction)

---

#### Phase 4: Validation
**Goal:** Human can review candidates, promote to authoritative, add provenance

| Task | Description | Dependency |
|------|-------------|------------|
| 4.1 | Build pattern confidence card UI — dimension bars, tier badge, health warnings | 3.12 |
| 4.2 | Display contextual insight and suggested actions per pattern | 3.11 |
| 4.3 | Implement validation actions: Promote (modal per Workflow 2 with severity per D19), Reject (modal per Workflow 2a, D18; on reject delete associated `backtest_violations` records), Defer (instant, increments deferCount) | 4.1 |
| 4.4 | On Promote: set `status: 'authoritative'`, `defaultSeverity` from modal (default: 'warning' per D19), `ownerId = currentUser`, `validatedBy = currentUser` (D22), capture timestamp | 4.3 |
| 4.5 | Add rationale field (the "Why") — free text on promote | 4.4 |
| 4.6 | Add provenance linking — manual URL input (PR, doc, Slack permalink) | 4.4 |
| 4.7 | Build pattern detail view — full pattern with provenance, evidence, confidence breakdown | 4.4-4.6 |
| 4.8 | Pattern dashboard — filter by status, tier, repo, type; sort by confidence | 4.7 |
| 4.9 | Run backtest: for each candidate pattern, detect violations across historical PRs (uses 3.13 module); store summary in `Pattern.backtestSummary`; store individual violations in `backtest_violations` table | 3.13, 2.10 |
| 4.10 | Display impact preview in validation UI: "Would have caught X violations in Y PRs" | 4.9 |
| 4.10a | Build "View all violations" modal/page for backtest results — lists all BacktestViolation records for pattern with PR links | 4.9 |
| 4.11 | Queue depletion UX — keyboard-driven triage (j/k/p/r/d), progress bar; implement queue sorting per D17: `tierWeight * 10000 + backtestViolations`, secondary sort by extractedAt; deferred patterns in separate section sorted by deferredAt | 4.8 |
| 4.12 | Build repo progress page with real-time ingestion/extraction status updates: subscribe to `repos` UPDATE events and `patterns` INSERT events via Supabase Realtime; animate pattern list population on extraction complete; unsubscribe on unmount | 2.11, 3.14 |
| 4.13 | Evidence management UI (D21): Manage modal with autocomplete from `repo_files` table, validate path exists, optional line range, capture HEAD SHA on add; display stale evidence with ⚠️ warning badge and reason; set/change canonical example; remove evidence (confirm if canonical) | 4.7, 2.13 |
| 4.14 | Merge action for duplicate candidates (D29): display duplicate card variant in queue; on merge, copy all evidence from candidate to target authoritative pattern, delete candidate (cascades backtest_violations), show success toast with evidence count added | 4.3, 3.15 |
| 4.15 | Filesystem pattern card UI: show 2 confidence pills (Evidence, Adoption) instead of 4; display path examples and glob pattern | 4.1 |
| 4.16 | Enforcement channel toggles in promotion modal: PR Review and AI Agents checkboxes with severity dropdown (default: 'warning') | 4.3 |
| 4.17 | Disabled PR enforcement for file-structure patterns: tooltip "PR enforcement not available for structure patterns" | 4.16 |

**Deliverable:** Full validation workflow with confidence-informed prioritization; impact preview shows real value with "View all" detail; authoritative patterns with rationale and provenance; real-time progress during repo connection; evidence correction for AI mistakes; one-click merge for duplicate candidates; filesystem patterns with appropriate 2-dimension confidence display; dual-channel enforcement configuration

**Estimated effort:** 7.75-9.75 days (+1 day for confidence UI, +2 days for backtest, +1 day for queue UX, +0.5 day for violations detail UI, +0.5 day for merge action, +0.75 days for filesystem UI and enforcement channels)

---

#### Phase 5a: Context File Generation
`[Added: Dec 2025]`
**Goal:** Generate AI agent context files (CLAUDE.md, .cursorrules) from authoritative patterns

| Task | Description | Dependency |
|------|-------------|------------|
| 5a.1 | ContextFileConfig data model + API: store format, targetPath, syncEnabled | 2.1 |
| 5a.2 | Context file setup UI (Workflow 9): Claude + Cursor format selection, path customization | 5a.1, 4.1 |
| 5a.3 | Pattern → markdown transformer (base): convert authoritative patterns to structured markdown; if no patterns with `aiContext: true`, generate section with comment "No patterns configured for AI agents yet"; show info banner in sync dashboard for empty state | 5a.1 |
| 5a.4 | Format adapters (claude, cursor): adjust tone/structure for each tool's conventions | 5a.3 |
| 5a.5 | Filesystem pattern → markdown transformer: convert file-naming and file-structure patterns | 5a.3 |
| 5a.6 | Marker-based file append logic (D33): detect existing markers, replace only between them, preserve user content | 5a.3 |
| 5a.7 | Debounced sync trigger on pattern changes (D36): Trigger.dev job with 5-10s delay; triggers on: pattern promoted/deprecated, description/rationale updated, enforcement.aiContext toggled; only regenerates for patterns with `aiContext: true`; update `syncStatus: 'pending'` on change, `syncStatus: 'synced'` after user download/copy | 5a.3 |
| 5a.8 | Manual download/copy UI: download generated file, copy to clipboard | 5a.3 |
| 5a.9 | AI Agent Sync dashboard widget (Workflow 10): show sync status, last updated, pattern counts, regenerate button | 5a.7 |

**Deliverable:** Authoritative patterns automatically transformed into CLAUDE.md and .cursorrules formats; marker-based append preserves user content; debounced sync reduces regeneration overhead; users can download/copy generated content

**Estimated effort:** 4.25 days

---

#### Phase 5b: PR Enforcement
**Goal:** PRs analyzed against validated patterns, violations surfaced as comments + status checks

| Task | Description | Dependency |
|------|-------------|------------|
| 5b.1 | Set up GitHub webhook endpoint for PR events (`opened`, `synchronize`); verify webhook signature using `@octokit/webhooks-methods` verify() with `GITHUB_WEBHOOK_SECRET` env var matching GitHub App config; reject 401 if invalid; log rejected webhooks for security monitoring | 1.4 |
| 5b.2 | On PR event: fetch diff via GitHub API | 5b.1 |
| 5b.3 | Build code pattern violation detection — compare diff against authoritative patterns where `enforcement.prReview: true` (uses 3.13 module) | 3.13, 5b.2 |
| 5b.4 | File naming violation detection (D35): regex match on new file paths against file-naming patterns where `enforcement.prReview: true` | 5b.1 |
| 5b.5 | Pattern evolution detection (D27): check if diff modifies files that are evidence for authoritative patterns; create PatternEvolutionRequest for each match; flag canonical modifications as high priority | 5b.2 |
| 5b.6 | Generate diff summary for evolution requests using LLM ("What changed in this evidence file?") | 5b.5 |
| 5b.7 | Create Trigger.dev job: `analyzePR` — runs on webhook | 1.3, 5b.3 |
| 5b.8 | Store violations in DB linked to PR and pattern; inherit `severity` from `pattern.defaultSeverity` (D19); ensure idempotency by checking for existing violation with same (pullRequestId, patternId, filePath, startLine) before inserting — GitHub may retry webhooks on 5xx | 5b.7 |
| 5b.9 | Post inline PR comments for each violation with pattern owner attribution and rationale snippet | 5b.8 |
| 5b.10 | Post pattern evolution PR comments (D27): notify pattern owner when evidence modified; different format for canonical vs non-canonical; include diff summary and review link | 5b.6 |
| 5b.11 | Post GitHub status check: name "Reasoning Substrate"; state based on violation severities (any error → failure, warning-only → success, none → success); auto-enabled when repo has enforced patterns | 5b.8 |
| 5b.12 | Status check for pending evolution reviews (D27): canonical modifications → pending state with description "Awaiting review: canonical example modified" (blocks merge); non-canonical → success state with description noting evidence modification | 5b.5 |
| 5b.13 | UI: show PR analysis history, violations per PR | 5b.8 |
| 5b.14 | Build violation detail page (`/violations/[id]`) with Dismiss action (D26: modal with optional reason + false positive checkbox); requires auth; linked from PR comments | 5b.8 |
| 5b.15 | Build pattern evolution review page (D27): show diff summary, current pattern definition, accept/reject decision with optional note; on accept → update evidence, optionally update description; on reject → create violation | 5b.5 |
| 5b.16 | Handle PR merged/closed webhooks for evolution lifecycle: on PR merge → set pending evolution requests to `status: 'historical'`, `closedAt: now()`; on PR closed without merge → set to `status: 'cancelled'`, `closedAt: now()` | 5b.1 |

**Deliverable:** Full loop complete — PR triggers analysis, code and file-naming violations appear as comments (with owner attribution) + status check; evidence modifications detected with pattern owner review workflow; users can act on violations and evolution requests via app

**Estimated effort:** 6-7 days (+2 days for pattern evolution workflow D27, +0.5 day for file-naming detection)

**Combined Phase 5 estimate:** ~10.75 days (5a: 4.25 days + 5b: 6.5 days)

---

#### Phase 6: Polish
**Goal:** Production-ready UX, error handling, edge cases

| Task | Description | Dependency |
|------|-------------|------------|
| 6.1a | Add `lastError: string | null` field to Repo and PullRequest for debugging; store error message on failure | 1.6 |
| 6.1b | Extraction error handling: catch LLM API errors/timeouts, set `extractionStatus: 'failed'`, store error; UI shows "Extraction failed" with retry button | 3.4 |
| 6.1c | Ingestion error handling: catch GitHub API errors, set `ingestionStatus: 'failed'`, store error; UI shows "Ingestion failed" with retry | 2.4 |
| 6.1d | PR analysis error handling: catch errors during analysis, set `analysisStatus: 'failed'`; status check shows "Analysis failed — will retry" | 5b.7 |
| 6.1e | GitHub rate limit handling: check `X-RateLimit-Remaining` header, queue retry with exponential backoff if exhausted | 2.1 |
| 6.1f | LLM rate limit handling: catch Anthropic 429 responses, queue retry with backoff via Trigger.dev | 3.2 |
| 6.2 | Retry logic for Trigger.dev jobs: configure max attempts (3), exponential backoff; integrates with 6.1e/6.1f | 6.1a-f |
| 6.3 | Loading states, progress indicators (extraction in progress) | — |
| 6.4 | Empty states (no patterns yet, no violations) | — |
| 6.5 | Re-extraction trigger (manual "re-analyze repo" button): deletes `candidate` and `deferred` patterns (cascades to backtest_violations via FK); preserves `authoritative` patterns (definition, rationale, ownership intact); runs evidence re-capture (6.5a); clears and recomputes `backtestSummary` + `backtest_violations`; preserves `rejected` patterns (user decision respected); runs fresh extraction for new candidates; if extraction surfaces a candidate similar to an existing authoritative pattern, it appears as a new candidate (user can reject; to capture new evidence, manually add via Evidence Management UI per D21) | 3.4, 6.5a |
| 6.5a | Evidence re-capture for authoritative patterns: for each evidence file path that still exists, LLM re-analyzes to find where pattern appears; updates `startLine`, `endLine`, `snippet`, `capturedAtSha` to current state; if pattern no longer appears in file, mark evidence `isStale: true` with reason "Pattern no longer detected in file"; batch multiple evidence files into single prompt for cost efficiency (~$0.01-0.02 per file) | 3.2 |
| 6.6 | Pattern editing (update description, rationale post-validation) | 4.6 |
| 6.6a | On repo disconnect, delete `pr_diffs/{repo_id}/` folder from Supabase Storage (D28 cleanup) | 1.8 |
| 6.7 | Weekly impact digest dashboard widget: rolling 7-day window, aggregated across all user's repos; shows violations caught + time saved (using `AVG_REVIEW_MINUTES = 15`); lists top 3 patterns by violation count; refresh on page load | 5b.8 |
| 6.8 | Basic settings UI (notification preferences, repo management) | — |
| 6.8a | Dashboard notification badge for pending evolution reviews: subscribe to `pattern_evolution_requests` INSERT events via Supabase Realtime; show badge count on nav (D27) | 5b.5 |
| 6.9 | Logging and observability (Trigger.dev dashboard, Supabase logs) | — |
| 6.10 | Implement daily scheduled job for auto-behaviors: archive weak patterns unreviewed for 60 days (delete associated `backtest_violations`, then set `status: 'rejected'`, set `rejectionReason: 'Auto-dismissed: insufficient evidence'` per D18); runs via Trigger.dev scheduled task at 03:00 UTC (avoids peak GitHub API usage hours) | 3.6 |
| 6.11 | Auth flow deep linking: preserve `returnTo` URL through OAuth flow (store in cookie/session); redirect to original URL post-login; enables seamless GitHub → app → action flow for violation dismissal | 1.5 |

**Deliverable:** Dogfood-ready product; graceful error handling; engagement feedback loop; auto-maintenance of pattern queue; seamless GitHub-to-app flow for violation actions; evidence accuracy maintained automatically; usable daily

**Estimated effort:** 5-6 days (+1 day for digest widget, +0.5 day for auth deep linking, +1 day for evidence re-capture)

---

#### Total Estimated Timeline

| Phase | Effort | Cumulative |
|-------|--------|------------|
| Phase 1: Foundation | 3-5 days | Week 1 |
| Phase 2: Ingestion | 4-5 days | Week 1-2 |
| Phase 3: Extraction | 7-9 days | Week 2-4 |
| Phase 4: Validation | 6-8 days | Week 4-6 |
| Phase 5a: Context Files | 4-5 days | Week 6-7 |
| Phase 5b: PR Enforcement | 6-7 days | Week 7-8 |
| Phase 6: Polish | 5-6 days | Week 8-10 |

**Total: ~35-47 days → 7-10 weeks**
`[Updated: Dec 2025 — added context file generation and filesystem patterns per addendum]`

*Note: Estimates assume AI-assisted development with Claude Code. Parallelization possible in some phases (e.g., UI work alongside backend). Confidence scoring system (D11) adds ~5-6 days across Phases 2-4. Engagement loop features (backtest, queue UX, digest) add ~4-5 days across Phases 4-6. Pattern evolution workflow (D27) adds ~2 days to Phase 5. Evidence re-capture (6.5a) adds ~1 day to Phase 6.*

---

#### Critical Path
`[Updated: Dec 2025]`

The blocking dependency chain:

```
GitHub App setup (1.4) 
  → Installation flow (1.7) 
    → Repo ingestion (2.4) 
      → Git history fetch (2.7) + PR history fetch (2.10)
        → Pattern extraction (3.4) 
          → Filesystem extraction (3.16)
            → Confidence scoring (3.10)
              → Violation detection module (3.13)
                → Backtest (4.9)
                  → Validation flow (4.4) 
                    → Context file generation (5a.3) + PR webhook (5b.1) [parallel]
                      → Context file sync (5a.7) | Violation detection (5b.3)
                        → Evolution detection (5b.5)
                          → PR comments (5b.9) + Evolution comments (5b.10)
```

Context file generation (5a) can proceed in parallel with PR enforcement (5b) after validation UI is complete.

Any delay in this chain delays end-to-end completion. Prioritize unblocking the critical path over polish.

---

#### Parallel Work Opportunities

| While waiting on... | Can work on... |
|---------------------|----------------|
| GitHub App approval | Schema design (1.6), UI scaffolding |
| Long extraction runs | Validation UI (4.1-4.7) |
| PR webhook testing | Pattern dashboard polish (4.7) |

### 6.3 Key Milestones
`[Explored]` · Updated: Dec 2025

#### Milestone Types

| Type | Purpose |
|------|---------|
| **Build Milestone** | Phase completion marker — "this thing works" |
| **Validation Milestone** | Hypothesis testable — "we can now learn X" |
| **Demo Milestone** | Externally showable — "we can show this to others" |

---

#### Milestone Schedule

| ID | Milestone | Type | Target | Success Criteria | Hypotheses Unlocked |
|----|-----------|------|--------|------------------|---------------------|
| M1 | **First Login** | Build | Week 1 | User can authenticate via GitHub, see empty dashboard | — |
| M2 | **First Repo Connected** | Build | Week 1 | GitHub App installed, repo appears in UI with metadata | — |
| M3 | **First Ingestion Complete** | Build | Week 2 | File tree indexed, visible in UI, stored in DB | — |
| M4 | **First Pattern Extracted** | Build + Validation | Week 2-3 | LLM identifies ≥1 pattern from real repo, stored as candidate | H3a (testable) |
| M5 | **Extraction Quality Baseline** | Validation | Week 3 | 10+ patterns extracted; manual precision assessment completed | H3a (measured) |
| M6 | **First Pattern Validated** | Build | Week 3-4 | Pattern promoted to authoritative with rationale and provenance | H4, H12 (testable) |
| M7 | **First PR Webhook Received** | Build | Week 4 | PR opened on connected repo triggers webhook, logged in system | — |
| M8 | **First Violation Detected** | Build + Validation | Week 4-5 | PR analyzed, violation identified against authoritative pattern | H3b (testable) |
| M9 | **First PR Comment Posted** | Build + Demo | Week 5 | Violation comment appears on GitHub PR as app | H9 (testable) |
| M10 | **End-to-End Loop Complete** | Build + Demo | Week 5 | Full flow works: connect → extract → validate → PR → violation → comment | — |
| M11 | **Dogfood Ready** | Build | Week 6 | Error handling, polish complete; usable daily without frustration | H4, H11 (observable) |
| M12 | **Time-to-Value Measured** | Validation | Week 6 | Fresh repo connected; time to first useful pattern recorded | H9 (measured) |

---

#### Detailed Milestone Definitions

**M1: First Login**
- User visits app, clicks "Sign in with GitHub"
- Redirected to GitHub OAuth, grants permissions
- Returns to app, sees authenticated state
- User record created in Supabase

**M2: First Repo Connected**
- User installs GitHub App on their account/org
- Selects at least one repo to connect
- Repo metadata (name, URL, default branch) stored in DB
- Repo appears in dashboard UI

**M3: First Ingestion Complete**
- Trigger.dev job runs `ingestRepo`
- All files cataloged with path, language, size
- File tree visible in UI
- Ingestion status shown as "complete"

**M4: First Pattern Extracted**
- Trigger.dev job runs `extractPatterns`
- LLM analyzes codebase, returns structured pattern data
- At least 1 pattern stored with: name, description, type, evidence (file locations), confidence
- Pattern visible in candidate queue UI

**M5: Extraction Quality Baseline**
- 10+ candidate patterns extracted from dogfood repo
- Manual review: categorize each as True Positive / False Positive / Partial
- Calculate precision: TP / (TP + FP)
- Document baseline in hypothesis tracker (H3a)

**M6: First Pattern Validated**
- User opens candidate pattern in review UI
- Clicks "Promote to Authoritative"
- Adds rationale (free text explaining the "Why")
- Adds provenance link (URL to PR, doc, or discussion)
- Pattern status updated, visible in authoritative patterns list

**M7: First PR Webhook Received**
- GitHub webhook endpoint configured and verified
- PR opened on connected repo
- Webhook payload received, logged
- PR record created in DB

**M8: First Violation Detected**
- PR diff fetched via GitHub API
- LLM compares diff against authoritative patterns
- At least 1 violation identified (code violates pattern)
- Violation stored in DB with: pattern reference, file, line, explanation

**M9: First PR Comment Posted**
- Violation triggers comment creation
- GitHub API call posts inline comment on PR
- Comment appears on correct file/line
- Comment includes: pattern name, violation explanation, link to pattern detail

**M10: End-to-End Loop Complete**
- All previous milestones achieved
- Can demo full flow without workarounds
- No manual database interventions required
- Reproducible on new repo

**M11: Dogfood Ready**
- Error states handled gracefully (failed extractions, webhook errors)
- Loading/progress indicators present
- Empty states designed
- Can use daily without hitting blocking bugs
- Re-extraction available via UI

**M12: Time-to-Value Measured**
- Connect a fresh repo (not previously analyzed)
- Start timer at "Connect" click
- Stop timer when first useful pattern is visible
- Target: <15 minutes (per H9)
- Document actual time, identify bottlenecks

**M13: First Context File Generated**
`[Added: Dec 2025]`
- At least 1 authoritative pattern exists
- User configures Claude or Cursor format
- System generates valid context file content with markers
- User can download or copy to clipboard

**M14: Filesystem Pattern Extracted**
`[Added: Dec 2025]`
- Extraction identifies at least 1 file naming or structure pattern
- Evidence includes example paths and glob pattern
- 2-dimension confidence score displayed
- Pattern appears in candidate queue with correct type badge

**M15: Dual Channel Active**
`[Added: Dec 2025]`
- At least 1 pattern has both `prReview` and `aiContext` enabled
- Context file includes the pattern
- PR against same repo triggers violation check for same pattern

---

#### Go/No-Go Decision Points

| After Milestone | Decision | If Negative |
|-----------------|----------|-------------|
| M5 (Extraction Quality) | Is precision >60%? | Pause; improve prompts/chunking before continuing |
| M8 (Violation Detection) | Is false positive rate <30%? | Pause; refine detection before shipping PR comments |
| M10 (E2E Complete) | Does the loop feel valuable? | Reassess scope; consider pivot or scope reduction |
| M12 (Time-to-Value) | Is time <15 min? | Optimize cold start; consider static analysis fallback |

---

#### Demo Checkpoints

These milestones are suitable for external demonstration (advisors, potential users, investors):

| Milestone | What You Can Show |
|-----------|-------------------|
| M4 | "AI extracted these patterns from my codebase" |
| M6 | "I validated this pattern and added the reasoning behind it" |
| M9 | "When I open a PR, it automatically flags violations" |
| M10 | "Here's the full loop working end-to-end" |
| M13 | "My patterns automatically sync to Claude Code and Cursor context files" |
| M15 | "Same pattern enforces both in AI agents and PR review" |

---

#### Milestone Tracking Template

```markdown
### M#: [Milestone Name]
- **Target:** [Date/Week]
- **Actual:** [Date completed]
- **Status:** 🔴 Not Started / 🟡 In Progress / 🟢 Complete
- **Notes:** [Blockers, learnings, deviations]
```

### 6.4 Risk Register
`[Explored]` · Updated: Dec 2025

#### Risk Assessment Framework

| Likelihood | Definition |
|------------|------------|
| High | >60% chance of occurring |
| Medium | 30-60% chance |
| Low | <30% chance |

| Impact | Definition |
|--------|------------|
| Critical | Project fails or pivots required |
| High | Major delay or scope reduction |
| Medium | Manageable setback |
| Low | Minor inconvenience |

---

#### Technical Risks

**R1. Extraction quality insufficient**
- **Description:** LLMs fail to identify patterns with >80% precision. Core value prop dead — garbage in, garbage out.
- **Likelihood:** Medium
- **Impact:** Critical
- **Hypothesis:** H3a
- **Mitigation:** 
  - Iterative prompt engineering on real repos before committing to full build
  - Multi-pass extraction (initial pass + refinement pass)
  - Confidence scoring (D11) surfaces uncertain extractions for human review
  - Accept lower precision initially if recall is high — users can reject false positives
- **Detection:** M5 (Extraction Quality Baseline) — measure precision on dogfood repo. Kill threshold: <60% precision.
- **Status:** Open — will validate in Phase 3

---

**R2. Violation detection is noisy**
- **Description:** High false positive rate (>10%) on PR comments. Users disable enforcement, trust destroyed.
- **Likelihood:** Medium
- **Impact:** High
- **Hypothesis:** H3b
- **Mitigation:**
  - Conservative initial thresholds — only flag high-confidence violations
  - Severity tiers (error/warning/info) let users tune signal
  - "Dismiss" action trains system (future: feedback loop)
  - Shadow mode: detect but don't post until FP rate validated
- **Detection:** Track dismiss rate per pattern. >20% dismisses = pattern needs review or removal.
- **Status:** Open — will validate in Phase 5

---

**R3. Context window blocks target repos**
- **Description:** More repos exceed 800k token limit than expected, shrinking addressable use cases before smart chunking is built.
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Target explicitly stated as 50-200 files (~60-240k tokens) — well within limits
  - Token count calculated during ingestion; clear error message if exceeded
  - Workaround: user can connect subdirectory or specific packages
  - Post-MVP: smart chunking (D10)
- **Detection:** Track % of connection attempts blocked by token limit. >10% = prioritize chunking.
- **Status:** Accepted — known limitation for MVP

---

#### Product Risks

**R4. Time-to-value too slow**
- **Description:** Takes >15 minutes to see useful patterns. Users abandon before "aha" moment.
- **Likelihood:** Medium
- **Impact:** High
- **Hypothesis:** H9
- **Mitigation:**
  - Extraction runs async; show file tree immediately as "something is happening"
  - Surface first pattern candidates as they're extracted, not batch at end
  - Progress indicator with estimated time remaining
  - Fast confidence scoring means high-tier patterns surface first
- **Detection:** M12 (Time-to-Value Measured) — stopwatch from connection to first actionable pattern. Target: <15 min.
- **Status:** Open — will validate in Phase 3-4

---

**R5. Candidate queue ignored**
- **Description:** Users don't engage with pattern candidates. Human validation loop fails; system becomes noise generator.
- **Likelihood:** Medium (was High, reduced by D12)
- **Impact:** High
- **Hypothesis:** H4
- **Mitigation:** (D12 — Engagement Loop)
  - Impact preview (backtest) shows real value before promoting
  - Queue depletion UX makes triage feel satisfying
  - Confidence tiers prioritize high-signal candidates
  - Weekly digest reminds users of pending queue
- **Detection:** Track candidate → action rate. <30% action in 14 days = engagement problem.
- **Status:** Mitigated — D12 features address this; will validate in dogfooding

---

**R6. Provenance feels like busywork**
- **Description:** Adding rationale ("the Why") is friction without clear payoff. Users skip it, provenance moat (D3) erodes.
- **Likelihood:** Medium (was High, reduced by D12)
- **Impact:** High
- **Hypothesis:** H11
- **Mitigation:** (D12 — Engagement Loop)
  - Violation attribution shows rationale in PR comments — immediate visibility
  - Rationale is optional for MVP; track completion rate
  - Pre-fill suggestions from extraction reasoning
  - Show "patterns with rationale have X% higher enforcement adoption" (once data exists)
- **Detection:** Track % of promoted patterns with rationale filled. <50% = UX problem.
- **Status:** Mitigated — D12 features address this; will validate in dogfooding

---

#### External Risks

**R7. GitHub ships pattern enforcement**
- **Description:** Copilot or GitHub native adds architectural awareness. You have 12-18 months before commoditization.
- **Likelihood:** Medium
- **Impact:** Critical
- **Mitigation:**
  - Provenance moat (D3) — decision history is org-specific, can't be replicated by general tools
  - Move fast — validate core loop before competitive window closes
  - Monitor GitHub announcements (Universe, changelog)
  - If announced: differentiate on depth (behavioral patterns, migrations) vs. their breadth
- **Detection:** GitHub announcements, Copilot changelog, developer Twitter chatter.
- **Status:** Accepted — existential but not controllable; speed is the mitigation

---

#### Execution Risks

**R8. Solo founder bottleneck**
- **Description:** Unexpected complexity, scope creep, or life event derails 7-10 week timeline significantly.
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Critical path documented — prioritize unblocking over polish
  - Milestones with go/no-go gates — kill or pivot early if fundamentals fail
  - AI-assisted development (Claude Code) accelerates implementation
  - Scope already cut (no VS Code extension, no Actor Agents, no multi-platform)
  - Build sequence designed for thin vertical slices — working product at each phase
- **Detection:** Weekly progress check against milestone schedule. 2+ weeks behind = reassess scope.
- **Status:** Accepted — inherent to solo bootstrap; mitigated by scope discipline

---

**R9. Filesystem pattern extraction unreliable**
`[Added: Dec 2025]`
- **Description:** LLM struggles to infer structural conventions from file tree alone. High false positive rate on filesystem patterns.
- **Likelihood:** Medium
- **Impact:** Medium
- **Hypothesis:** H15
- **Mitigation:**
  - Conservative extraction — require multiple examples before suggesting pattern
  - Simplified 2-dimension confidence scoring for filesystem patterns (D34)
  - Allow human definition of filesystem patterns (top-down) as alternative to extraction
- **Detection:** Track promotion rate for filesystem patterns vs. code patterns. If significantly lower, adjust extraction approach.
- **Status:** Open

---

**R10. Context file user content conflicts**
`[Added: Dec 2025]`
- **Description:** Users accidentally edit inside auto-generated markers, losing changes on next sync.
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:**
  - Clear, prominent markers with "Do not edit" warning (D33)
  - UI warning if we detect section was externally modified
  - Content outside markers never touched
- **Detection:** Support tickets about "lost content" in context files.
- **Status:** Open

---

#### Risk Summary
`[Updated: Dec 2025]`

| ID | Risk | L | I | Status |
|----|------|---|---|--------|
| R1 | Extraction quality insufficient | M | Crit | Open |
| R2 | Violation detection noisy | M | High | Open |
| R3 | Context window limits | L | Med | Accepted |
| R4 | Time-to-value too slow | M | High | Open |
| R5 | Candidate queue ignored | M | High | Mitigated (D12) |
| R6 | Provenance feels like busywork | M | High | Mitigated (D12) |
| R7 | GitHub ships pattern enforcement | M | Crit | Accepted |
| R8 | Solo founder bottleneck | M | High | Accepted |
| R9 | Filesystem pattern extraction unreliable | M | Med | Open |
| R10 | Context file user content conflicts | L | Low | Open |

**Top risks to watch:** R1 (extraction quality) and R2 (violation noise) — both are core technical bets that will be validated in Phases 3-5.

### 6.5 Team Requirements
`[Unexplored]`

> ⚠️ **GAP:** No team plan. What roles are needed? What can be done solo vs requires team?

---

## Appendix A: Decision Log

*Record key decisions as they are locked. Reference these IDs in main sections.*

---

### D1. [Dec 2025] Pattern as core abstraction
`[Decided]`

- **Context:** Needed to define the fundamental unit of work
- **Alternatives considered:** File-level (CodeScene), Service-level (Backstage), Rule-level (linters)
- **Rationale:** Patterns capture semantic meaning; files are implementation details; services are too coarse
- **Implications:** Drives data model, UI design, competitive positioning

---

### D2. [Dec 2025] Three-agent model (Observer/Actor/Scout)
`[Decided]`

- **Context:** Needed to define autonomous capabilities with appropriate risk levels
- **Alternatives considered:** Single agent type, human-only workflows
- **Rationale:** Graduated autonomy matches risk to capability; allows trust to build over time
- **Implications:** Affects pricing tiers, technical architecture, trust/safety design

---

### D3. [Dec 2025] Provenance as primary moat
`[Decided]`

- **Context:** GitHub/Copilot could ship adjacent features
- **Alternatives considered:** Speed to market, feature breadth, price competition
- **Rationale:** Decision history is organization-specific and can't be replicated by general tools
- **Implications:** Must prioritize provenance features in MVP; drives integration strategy

---

### D4. [Dec 2025] GitHub App auth model
`[Decided]`

- **Context:** Need to integrate with repos for PR analysis and violation comments
- **Alternatives considered:** GitHub OAuth (user-level), GitHub App (org-level)
- **Rationale:** GitHub App provides native webhooks, PR comments as app identity, status checks integration — all essential for Observer Agent loop
- **Implications:** More setup complexity but better UX and product positioning

---

### D5. [Dec 2025] Multi-repo support from day 1
`[Decided]`

- **Context:** MVP could be single-repo to reduce scope
- **Alternatives considered:** Single repo first, add multi later
- **Rationale:** Dogfooding involves related repos; `repoId` as first-class FK is trivial to add now, painful to migrate later
- **Implications:** Data model includes repo scoping; UI needs repo selector

---

### D6. [Dec 2025] Own database for pattern storage
`[Decided]`

- **Context:** Could store patterns as code in repo (`.reasoning-substrate/patterns.yaml`)
- **Alternatives considered:** Patterns-as-code, own DB
- **Rationale:** Provenance linking, querying, and validation workflows need real DB; patterns-as-code is awkward for decision history moat (D3)
- **Implications:** Need migrations, backup strategy; can add "export to repo" as future feature

---

### D7. [Dec 2025] Tech stack: Supabase + Trigger.dev (Original)
`[Superseded by D37]`

- **Context:** Need hosting for web app, database, and long-running background jobs
- **Original decision:** Supabase + Vercel (Next.js) + Trigger.dev
- **Status:** Superseded — see D37 for current stack

---

### D37. [Dec 2025] Framework migration: Hono + Vite + TanStack Router
`[Decided]`

- **Context:** Initial implementation used Next.js for both frontend and API routes. As the project evolved, the need for a cleaner separation between frontend and backend became apparent, along with faster development iteration.

- **Alternatives considered:**
  - Keep Next.js (rejected: slower dev server, monolithic structure)
  - NestJS for backend (rejected: too heavyweight, decorator-heavy)
  - Express/Fastify (rejected: Hono is lighter and Bun-native)

- **Rationale:**
  - **Hono:** Lightweight, edge-ready, native Bun support, simpler middleware model than NestJS
  - **Vite:** Significantly faster HMR than Next.js, better DX for SPA development
  - **TanStack Router:** Type-safe file-based routing, works perfectly with Vite
  - **tRPC:** End-to-end type safety between frontend and backend, shared schema package
  - **Base UI:** Headless components that work with Tailwind v4's new features

- **Current stack:**
  | Layer | Technology |
  |-------|------------|
  | Runtime | Bun 1.3+ |
  | Frontend | Vite 6 + React 18 + TanStack Router |
  | Backend | Hono 4.6 |
  | API | tRPC 11 (shared @mantle/trpc package) |
  | Styling | Tailwind CSS v4 + Base UI |
  | Database | Supabase Postgres + Drizzle ORM |
  | Testing | Vitest + Playwright |
  | Monorepo | Turborepo + Bun workspaces |

- **Implications:**
  - Separate apps: `apps/api` (Hono) and `apps/web` (Vite)
  - Shared packages: `packages/trpc` (router), `packages/test-utils`
  - API runs on port 3001, frontend on port 3000
  - No Vercel deployment requirement (can deploy anywhere that runs Bun)

---

### D8. [Dec 2025] Claude Sonnet 4.5 for all LLM tasks
`[Decided]`

- **Context:** Needed to choose LLM(s) for extraction and violation detection
- **Alternatives considered:** Multi-model strategy (cheap model for extraction, expensive for detection); GPT-4o; Gemini Flash
- **Rationale:** Simplicity for MVP — one model reduces integration complexity, prompt tuning, and debugging surface. Sonnet offers strong code understanding at reasonable cost ($3/MTok input, $15/MTok output). Can optimize with model differentiation post-MVP if costs warrant.
- **Model string:** `claude-sonnet-4-5-20250929` (verify latest at docs.anthropic.com before implementation)
- **Implications:** Single Anthropic API integration; estimate ~$0.50-1.00 per full repo extraction (50-200 files); ~$0.10-0.30 per PR analysis

---

### D9. [Dec 2025] Extract-once with manual refresh (no incremental analysis for MVP)
`[Decided]`

- **Context:** Needed to decide when/how patterns are re-extracted
- **Alternatives considered:** Delta analysis (only re-extract changed files); continuous re-extraction on every commit
- **Rationale:** MVP simplicity — extract on repo connection, re-extract via manual "Refresh" button. Avoids complexity of tracking file changes and merging pattern deltas.
- **Re-extraction behavior:**
  - `candidate` and `deferred` patterns: Delete and re-extract (cascades to backtest_violations via FK; user hasn't committed; fresh start)
  - `authoritative` patterns: Preserve (definition, rationale, ownership intact); run evidence re-capture to refresh `startLine`, `endLine`, `snippet`, `capturedAtSha` for each evidence file (task 6.5a); clear and recompute `backtestSummary` + backtest_violations (human decision respected)
  - `rejected` patterns: Preserve (user explicitly dismissed; don't resurface)
  - New patterns found: Add as `candidate`
  - Duplicate handling (D29): If extraction surfaces a candidate similar to an existing authoritative pattern, LLM flags it with `similarToPatternId`. User sees distinct card with Merge action to add evidence to existing pattern with one click. No manual evidence management needed.
- **Post-MVP:** Implement delta analysis triggered by push to default branch.
- **Implications:** Users may see stale patterns if codebase evolves significantly; acceptable for MVP validation.

---

### D10. [Dec 2025] Full-repo single-pass extraction with 1M context
`[Decided]`

- **Context:** Needed chunking strategy for pattern extraction given varying repo sizes
- **Alternatives considered:** Smart chunking with aggregation pass; file-by-file analysis; truncation-based approach
- **Rationale:** Claude Sonnet 4.5 supports 1M token context (beta). Target repos (50-200 files, ~60-240k tokens) fit comfortably. Single-pass preserves cross-file pattern detection — the core value. Chunking adds 2-3 days of complexity for edge cases.
- **Implementation:** Use `anthropic-beta: context-1m-2025-08-07` header for extraction calls. Calculate token count during ingestion using 0.25 tokens/char estimate; block extraction if >600k tokens.
  
  **Token budget breakdown:**
  - 1M total context (beta)
  - ~800k usable for repo content (reserving ~150k for system prompt, pattern definitions, and ~50k for output)
  - 600k threshold = 75% of 800k usable limit (safety buffer for token estimation variance across languages)
  
  User-friendly message suggests smaller repo/subset when threshold exceeded.
- **Post-MVP:** Implement smart chunking with directory-based splitting and aggregation pass for large monorepos (500+ files / 800k+ tokens). Consider tiktoken-equivalent for accurate counting.
- **Implications:** MVP limited to small-to-medium repos; acceptable for initial validation. Must track token counts during ingestion.

---

### D11. [Dec 2025] Multi-dimensional confidence scoring with health signals
`[Decided]`

- **Context:** Needed to help users prioritize pattern candidates and identify quality concerns. Simple instance count is insufficient — doesn't distinguish established conventions from copy-pasted tech debt.

- **Alternatives considered:**
  - LLM self-reported confidence percentage (rejected: miscalibrated, destroys trust when wrong)
  - Simple numeric score (rejected: false precision, "why 73%?" questions)
  - Instance count only (rejected: frequency ≠ validity, doesn't catch anti-patterns)
  - Full AI quality judgment (rejected: overreach, context-dependent, opinion-based)

- **Rationale:** Users care about **intentionality** and **significance**, not just frequency. Multi-dimensional model answers distinct questions:
  - **Evidence:** Is this real? How consistent? (instance count + implementation similarity)
  - **Adoption:** Team convention or personal habit? (unique authors from git blame)
  - **Establishment:** Proven or experimental? (age from git history, 2-year lookback)
  - **Location:** Core architecture or peripheral? (path heuristics)
  
  Health Signals add objective, verifiable observations (missing error handling, deprecated APIs, security concerns) without rendering quality verdicts — human decides with their context.

- **Implementation:**
  - Fetch git commit history (2-year depth) during ingestion for author/date metadata
  - Store per-evidence: `authorUsername`, `commitDate`, `commitSha`
  - Compute confidence dimensions during extraction; store in `Pattern.confidenceScore` (JSONB)
  - Derive tier: `strong | emerging | moderate | weak | legacy`
  - Run focused LLM prompt for health signals per pattern (~$0.01-0.02 each); store in `Pattern.healthSignals` (JSONB)
  - Generate insight via priority-ordered template rules (deterministic, fast, debuggable)
  - UI: Pattern card with dimension bars, tier badge, health warnings, contextual insight

- **Tier definitions:**
  - **Strong:** 5+ instances, 3+ authors, established (>1yr), high/medium consistency
  - **Emerging:** 3+ instances, <3 months old, spreading across codebase
  - **Moderate:** Meets some but not all "strong" criteria
  - **Weak:** 2 instances, single author, or low consistency
  - **Legacy:** Located in legacy paths, stagnant (no changes >1yr)

- **Health signal categories (high-objectivity only):**
  - Error handling (missing try/catch)
  - Deprecated APIs (outdated methods/libraries)
  - Consistency issues (mixed async patterns)
  - Security concerns (SQL injection, XSS patterns)
  - Completeness gaps (missing validation)

- **Template insights (examples):**
  - Strong + Established + Core → "Well-established team convention in shared code. High confidence — safe to enforce."
  - Emerging + Spreading → "New pattern spreading across the codebase. Consider standardizing before implementations diverge."
  - Strong + Health Warnings → "Well-established pattern with potential gaps. Review health signals before promoting."
  - Single Author + Established → "Long-standing pattern from one engineer. Validate it's team convention, not personal preference."
  - Legacy + Stagnant → "Old pattern with no recent activity. Consider documenting for historical context or planning migration."

- **Effort:** +5-6 days total across Phases 2-4 (git history fetch, confidence computation, health signals, UI)

- **Post-MVP enhancements:**
  - LLM-polished insights (optional richness layer)
  - Trend tracking ("this pattern is spreading" with velocity)
  - "Watch" functionality for emerging patterns
  - Calibration dashboard (do tiers predict user actions?)
  - Type-specific thresholds (naming patterns vs architectural patterns)

- **Implications:**
  - Ingestion must fetch git history (adds ~30-60s for typical repos)
  - Extraction prompt must request consistency assessment
  - Additional health signals prompt per pattern
  - UI complexity increases (dimension bars, insights, warnings)
  - Strong differentiator — "understands your codebase" vs "counts files"

---

### D12. [Dec 2025] Engagement loop features for validation stickiness
`[Decided]`

- **Context:** Risk that users ignore candidate queue (H4) and skip provenance (H11) — core human-in-the-loop fails without engagement. Need immediate reward for validation actions, not just delayed downstream benefits.

- **Alternatives considered:**
  - Gamification (badges, streaks) — rejected: feels patronizing for senior engineers
  - Pure metrics dashboard — rejected: passive, doesn't connect to action
  - Rely on intrinsic motivation — rejected: insufficient for habit formation

- **Rationale:** Engineers engage when they see their work *working*. Four features create immediate feedback:
  1. **Impact Preview (Backtest)** — Before promoting, show "Would have caught X violations in Y PRs." Makes action feel consequential.
  2. **Violation Attribution** — PR comments include pattern owner and rationale. Your knowledge appears in the wild.
  3. **Queue Depletion UX** — Keyboard-driven triage, progress bar, smart sorting. Make it feel like clearing email, not chores.
  4. **Weekly Impact Digest** — Dashboard widget: violations caught, time saved. Quantified leverage.

- **Implementation:**
  - Backtest requires shared violation detection module (3.13) + historical PR fetch (2.10)
  - Backtest results stored in two parts: summary stats in `Pattern.backtestSummary` (JSONB), individual violations in `backtest_violations` table (supports "View all" UI)
  - CASCADE delete on pattern ensures backtest violations cleaned up on re-extraction
  - Attribution is cheap — template change in PR comment
  - Queue UX is pure frontend polish
  - Digest widget aggregates existing violation data
  - **Time saved formula:** `(violations_caught × 15 minutes) / 60 = hours saved`
    - Assumption: Each violation caught saves ~15 min of PR review back-and-forth (see H13 for validation plan)
    - Display as "~X hours saved" (rounded to nearest 0.5)
    - Constant `AVG_REVIEW_MINUTES = 15` stored in config for future tuning
    - Tooltip: "Estimated based on 15 min average per violation"

- **Effort:** +4-5 days total across Phases 4-6

- **Implications:**
  - Backtest adds to critical path (must build violation detection before validation UI is complete)
  - Historical PR fetch adds ~30-60s to ingestion
  - Sets foundation for future email digests, notifications
  - Differentiator: most pattern tools are "set and forget" — this creates ongoing engagement

---

### D13. [Dec 2025] Pattern mental model and triage UX
`[Decided]`

- **Context:** Needed clarity on what a "pattern" actually is (golden code vs abstract definition) and how the candidate review UX should work.

- **Alternatives considered:**
  - Pattern = golden code file (rejected: too rigid, can't refine without changing repo)
  - Kanban-style triage board (rejected: too visual, not keyboard-optimized)
  - Minimal info on cards (rejected: hides decision-critical signals)

- **Rationale:** 
  - **Pattern = abstract definition.** Pattern is a concept in our DB (name, description, constraints as freeform text). Evidence = pointers to code that exemplifies it. Users can edit the definition without changing their codebase. This enables refinement of AI extractions and human ownership.
  - **Keyboard-first linear queue.** Senior engineers are keyboard-native (vim, terminal). Superhuman-style triage with `j/k/p/r/d` shortcuts respects their expertise. Progress bar creates inbox-zero completion drive.
  - **Backtest always visible.** "Would have caught N violations" is the magic line that makes promoting feel consequential. It's the primary decision input, not hidden behind a click.
  - **Progressive disclosure for details.** Card shows tier, stats, backtest, description. Expand for confidence dimensions, health signals, evidence list. 80% of decisions from card alone.

- **Implementation:**
  - Pattern entity stores definition; PatternEvidence stores code pointers
  - Canonical example = one evidence item marked `isCanonical`
  - Triage queue sorted by confidence tier × backtest impact
  - Actions: Promote, Reject, Defer
  - Promotion modal: edit description, add rationale, add provenance, enable enforcement
  - PR comments include owner attribution and rationale snippet
  - Auto-behaviors: deferred 3x → Stuck bucket (UI filter); weak unreviewed 60d → auto-dismissed (scheduled job)

- **Implications:**
  - UI must be keyboard-navigable throughout
  - Pattern detail view needs edit capabilities for definition, rationale, evidence management
  - PR comment template includes pattern owner and "Why"
  - Constraints are freeform (part of description), not structured — simpler for MVP
  - 8 workflows fully specified with wireframes: Candidate Review, Pattern Promotion, Pattern Detail, PR Comment, Validation, Evolution, Repo Connection, Dashboard & Navigation

---

### D14. [Dec 2025] Vision vs MVP documentation separation
`[Decided]`

- **Context:** Due diligence review identified significant misalignment between Sections 2.1-2.2 (written during early exploration) and the actual MVP scope (defined in 2.4, 6.x, and decisions D1-D13). The early sections described a Knowledge Graph interface, persistent agents with trust scores, Threads, Services/Domains, and Continuous Delta Analysis — none of which exist in MVP.

- **Alternatives considered:**
  - Heavy annotation with `[POST-MVP]` tags inline (rejected: clutters the document, requires readers to mentally filter)
  - Bifurcate into two documents (rejected: overhead of maintaining two docs, cross-referencing complexity)
  - Relegate vision to appendix, rewrite 2.1-2.2 for MVP (chosen)

- **Rationale:** A solo build needs one source of truth for "what am I building." Preserving the vision in an appendix maintains strategic context without creating confusion. Rewritten 2.1-2.2 now align with data model (2.4), workflows (2.5), MVP definition (6.1), and all prior decisions.

- **Changes made:**
  - Section 2.1 rewritten: Pattern described as Definition + Evidence + Confidence + Health Signals + Rationale + Provenance (matching TypeScript interfaces)
  - Section 2.2 rewritten: Event-driven Extract → Validate → Enforce loop with entity table, job table, integration table (matching actual architecture)
  - New Appendix E created: "Long-Term Vision" preserving Knowledge Graph, extended pattern model, agent architecture, delta analysis, thread concepts with explicit "not in MVP" framing
  - Cross-reference added in 2.2 pointing to Appendix E

- **Implications:** 
  - Any future contributor reads 2.1-2.2 and understands exactly what's being built
  - Vision is preserved for future roadmap discussions
  - Sections 2.1, 2.2, 2.3 (Agent Model) now form coherent MVP description
  - No changes needed to 2.4+ (already aligned with MVP)

---

### D15. [Dec 2025] GitHub token handling: on-demand generation, no database storage
`[Decided]`

- **Context:** Due diligence identified that Repo interface included `installationAccessToken` marked "Encrypted" with no encryption implementation. Further analysis revealed storing tokens is the wrong approach — GitHub App installation tokens expire after 1 hour and are designed for on-demand generation.

- **Alternatives considered:**
  - Supabase Vault for encrypted token storage (rejected: tokens expire hourly, adds complexity for little benefit)
  - Application-level encryption with env var key (rejected: same expiry problem, plus key management overhead)
  - On-demand token generation with optional short-lived cache (chosen)

- **Rationale:** GitHub Apps are designed for on-demand authentication:
  1. App private key stored as environment variable (secure, never in DB)
  2. Installation ID stored in Repo record (not sensitive, just a reference)
  3. Fresh installation token requested when needed (JWT signed with private key)
  4. Optional in-memory cache with 5-10 min TTL reduces API calls
  
  This is simpler, more secure, and follows GitHub's intended pattern.

- **Implementation:**
  - Remove `installationAccessToken` and `tokenExpiresAt` from Repo interface
  - Add utility function `getInstallationToken(installationId): Promise<string>`
  - Store `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` in environment variables
  - Use `@octokit/auth-app` for JWT generation and token requests
  - **Token lifecycle:** `@octokit/auth-app` handles caching and refresh automatically — tokens are cached internally and refreshed before expiry (~55 min into 1-hour lifetime). No manual caching code needed. For long-running jobs (e.g., extraction), create one Octokit instance at job start and reuse throughout.

- **Implications:**
  - Simpler Repo schema (fewer fields)
  - No encryption code needed
  - No token refresh logic needed — library handles automatically
  - Private key must be configured in all environments (API server, Trigger.dev, local dev)

---

### D16. [Dec 2025] Batch extraction results for MVP, streaming post-MVP
`[Decided]`

- **Context:** Due diligence identified that Workflow 7 wireframes showed patterns appearing progressively during extraction ("3 patterns found so far...", "Start Reviewing Early →") but no implementation existed — no Supabase Realtime on patterns table, no incremental insert logic, no streaming UI subscription.

- **Alternatives considered:**
  - Implement streaming extraction (rejected for MVP: adds 1-2 days complexity, requires extraction refactor to insert-as-discovered, Realtime subscription management)
  - Fake streaming with staged reveals post-completion (rejected: misleading, complexity without true benefit)
  - Batch completion with simplified wireframes (chosen)

- **Rationale:** The core "aha moment" is seeing patterns extracted from your codebase — whether they appear incrementally or all-at-once is secondary. Batch completion:
  - Simpler extraction job (process all, insert all, mark complete)
  - Simpler UI (subscribe to repo status, render patterns on completion)
  - Supabase Realtime already configured for repos table (tracks extraction status)
  - Patterns table doesn't need Realtime for MVP
  
  Streaming is a genuine UX improvement worth revisiting post-MVP when core loop is proven.

- **Implementation:**
  - Update Workflow 7 wireframes to show spinner/progress during extraction
  - Remove "patterns emerging" incremental UI from Step 4
  - Keep "Extraction complete" screen (Step 5) unchanged
  - Add streaming extraction to post-MVP extensions

- **Implications:**
  - Users see extraction progress (status updates) but not incremental patterns
  - All patterns appear at once when extraction completes
  - Slightly longer perceived wait, but clear completion state
  - ~1-2 days saved in Phase 3-4

---

### D17. [Dec 2025] Queue sorting algorithm: tier buckets with backtest tie-breaking
`[Decided]`

- **Context:** Due diligence identified that multiple places referenced "sorted by confidence tier × backtest impact" but no formula was defined. Developers would have to invent the algorithm during implementation.

- **Alternatives considered:**
  - Pure backtest impact sort (rejected: weak patterns with lucky backtest hits would surface first)
  - Pure tier sort (rejected: no differentiation within tiers, arbitrary ordering)
  - Weighted multiplication (rejected: unclear semantics when multiplying categorical × numeric)
  - Tier buckets with backtest tie-breaking (chosen)

- **Rationale:** Confidence tier represents "should we enforce this?" while backtest impact represents "how much value if we do?" Tier should dominate (strong patterns before weak regardless of impact), with backtest breaking ties within tier. This surfaces highest-confidence, highest-impact patterns first.

- **Implementation:**

  ```typescript
  // Tier priority (higher = surfaces first)
  const TIER_WEIGHT: Record<PatternConfidenceTier, number> = {
    strong: 5,
    emerging: 4,    // High priority — standardize before drift
    moderate: 3,
    weak: 2,
    legacy: 1,      // Low priority — probably not worth enforcing
  };

  // Sort score: tier provides buckets, backtest breaks ties within bucket
  function getQueueSortScore(pattern: Pattern): number {
    const tierScore = TIER_WEIGHT[pattern.confidenceScore?.tier ?? 'weak'] * 10000;
    const impactScore = pattern.backtestSummary?.violationCount ?? 0;
    return tierScore + impactScore;
  }

  // Primary sort: score descending (highest first)
  // Secondary sort: extractedAt ascending (older first, for stability)
  // Deferred patterns: excluded from main queue, shown in separate "Deferred" section
  //   sorted by deferredAt ascending (oldest deferral = most due for review)
  ```

- **Implications:**
  - Queue ordering is deterministic and explainable
  - Emerging patterns get high priority (standardize early)
  - Legacy patterns sink to bottom (low enforcement value)
  - Deferred patterns don't pollute main queue
  - Algorithm is simple enough to implement in SQL or application code

---

### D18. [Dec 2025] Rejection flow: optional reason modal
`[Decided]`

- **Context:** Due diligence identified that Promote had a full modal workflow while Reject was undefined — mentioned as "(optional reason modal)" with no wireframe, no data model field, and no task detail. Task 6.10 also referenced "system note" for auto-archived patterns with no field to store it.

- **Alternatives considered:**
  - Instant rejection, no modal (rejected: loses signal about why patterns fail, no place for system notes)
  - Required reason with categories (rejected: adds friction to obvious rejections, slows triage flow)
  - Optional reason modal (chosen)

- **Rationale:** Rejection should be as fast as promotion for obvious cases (noise, duplicates) while allowing signal capture when useful. Optional text field:
  - Zero friction path: press `r`, hit Enter → rejected
  - Signal path: press `r`, type reason, Enter → rejected with context
  - Handles system notes for auto-archival (task 6.10)
  - Potential future use: analyze rejection reasons to improve extraction

- **Implementation:**
  - Add `rejectionReason: string | null` to Pattern interface
  - Rejection modal with optional reason field (see Workflow 2a)
  - Keyboard flow: `r` → modal opens → Enter submits (reason optional) → Escape cancels
  - Auto-archive sets `rejectionReason: "Auto-dismissed: insufficient evidence"`

- **Implications:**
  - Rejection is nearly as fast as instant (Enter to skip reason)
  - Signal captured when users choose to provide it
  - System notes have a home
  - Future: analyze rejection reasons to tune extraction prompts

---

### D19. [Dec 2025] Violation severity: per-pattern default, set during promotion
`[Decided]`

- **Context:** Due diligence identified that ViolationSeverity existed (error/warning/info) with status check behavior defined, but no explanation of how severity is assigned to violations.

- **Alternatives considered:**
  - Per-violation LLM judgment (rejected: unpredictable, hard to debug, no user control)
  - Hardcoded default for all violations (rejected: no flexibility, all-or-nothing enforcement)
  - Per-pattern severity set during promotion (chosen)

- **Rationale:** Users understand their patterns better than the LLM. Some patterns are critical (auth, security) and should block merges; others are stylistic preferences that shouldn't. Per-pattern severity:
  - Set once during promotion
  - All violations of that pattern inherit severity
  - Default to `warning` (safe — doesn't block until user opts in)
  - Can be changed later in Pattern Detail view

- **Implementation:**
  - Add `defaultSeverity: ViolationSeverity` to Pattern interface (default: 'warning')
  - Update promotion modal with severity dropdown
  - Violations inherit severity from pattern on creation

- **Implications:**
  - Safe default: new patterns don't block merges until explicitly configured
  - User control: severity reflects team's actual enforcement priorities
  - Simple implementation: no LLM judgment calls on severity
  - Violations table doesn't need severity override field for MVP (could add post-MVP)

---

### D20. [Dec 2025] Consistency assessment: LLM-judged with explicit rubric
`[Decided]`

- **Context:** Due diligence identified that PatternConfidence included `consistency: 'high' | 'medium' | 'low'` but no definition of what these levels mean or how they're determined.

- **Alternatives considered:**
  - Code similarity algorithms (rejected: adds complexity, requires AST parsing, overkill for MVP)
  - Skip consistency scoring (rejected: useful signal for pattern quality)
  - LLM assessment with explicit rubric (chosen)

- **Rationale:** The LLM already analyzes the code during extraction — it can assess implementation similarity as part of the same pass. A clear rubric in the extraction prompt ensures consistent judgment:

  | Level | Criteria |
  |-------|----------|
  | **high** | Implementations nearly identical — same structure, same naming, minor variations only (different variable names, comments) |
  | **medium** | Same structure but notable variations — different error messages, additional optional steps, slight ordering differences |
  | **low** | Same goal but different approaches — callbacks vs promises, different libraries, significantly different structure |

- **Implementation:**
  - Include rubric in extraction prompt
  - LLM returns `consistency` level and `consistencyNote` explaining observation
  - Example note: "7 of 8 use try/catch; 1 uses .catch()"
  - No additional code analysis pass needed

- **Implications:**
  - Simple implementation (prompt engineering, no algorithms)
  - Consistency note provides actionable detail for users
  - Low consistency may indicate pattern is actually multiple patterns
  - Future: could validate LLM consistency judgment against code similarity metrics

---

### D21. [Dec 2025] Evidence management: autocomplete with staleness detection
`[Decided]`

- **Context:** Due diligence identified that evidence management UX was undefined — unclear how users add evidence (free text? file browser?) and no handling for evidence that becomes outdated when files are deleted or code changes.

- **Alternatives considered:**
  - Evidence as immutable snapshots only (rejected: becomes stale without indication)
  - Re-validate and auto-update on refresh (rejected: complex line-tracking algorithms)
  - File-only, no line numbers (rejected: loses precision)
  - Hybrid — snapshot with staleness detection (chosen)

- **Rationale:** Evidence should capture a point-in-time snapshot (commit SHA) so GitHub links always work, while also detecting when that snapshot no longer reflects current code. Users stay in control of accuracy.

- **Implementation:**
  - Add `capturedAtSha`, `isStale`, `staleReason` to PatternEvidence
  - Store indexed file paths in `repo_files` table during ingestion
  - Add evidence UI: text input with autocomplete from file list, validates path exists
  - Captures current HEAD commit SHA on add
  - GitHub links use commit SHA (always resolvable)
  - Staleness detection during re-ingestion: if file missing → mark stale
  - UI shows stale evidence with ⚠️ warning and reason

- **Implications:**
  - GitHub links always work (commit SHA in URL)
  - Users see when evidence is outdated
  - No complex line-tracking for MVP
  - Need `repo_files` table for autocomplete (task 2.13)
  - Future: content hash comparison for "significantly changed"

---

### D22. [Dec 2025] Pattern ownership: validator becomes owner for MVP
`[Decided]`

- **Context:** Due diligence identified that Pattern had `ownerId`, `validatedBy`, and `statusChangedBy` fields without clear definition of the relationships between them or default behaviors.

- **Alternatives considered:**
  - Separate owner and validator from day 1 (rejected: adds UI complexity without clear MVP value)
  - Remove ownership entirely for MVP (rejected: attribution in PR comments requires an owner)
  - Validator becomes owner by default (chosen)

- **Rationale:** For MVP, the person who promotes a pattern is the most logical owner — they validated it and took responsibility. Keeping `validatedBy` in the schema preserves the historical record for future use.

- **Implementation (MVP):**
  - On Promote: set `ownerId = currentUser`, `validatedBy = currentUser`, `statusChangedBy = currentUser`
  - Owner displayed in PR comments ("Maintained by @username")
  - Owner displayed in pattern detail view
  - No UI for changing owner in MVP

- **Post-MVP evolution:**
  - **Owner** = current responsible maintainer (can be transferred)
  - **Validator** = historical record of who first promoted (immutable)
  - Add "Transfer ownership" action in pattern detail view
  - Add ownership transfer history/audit log
  - Consider team/group ownership for shared patterns
  - Ownership notifications when patterns need attention

- **Implications:**
  - Simple MVP: one person = owner = validator
  - PR comment attribution works immediately
  - Schema supports future ownership transfer without migration
  - `statusChangedBy` tracks all status changes (promote, reject, defer, etc.)

---

### D23. [Dec 2025] Health signals detection: single prompt with smart deprecation check
`[Decided]`

- **Context:** Due diligence identified that health signals detection approach was vague — unclear whether it's one prompt per pattern or per category, how deprecation is detected, and what scope security checking has.

- **Alternatives considered:**
  - Separate prompt per category (rejected: 5x cost, slower)
  - Static hardcoded deprecated API list (rejected: quickly outdated, limited coverage)
  - Single prompt with LLM-powered deprecation knowledge (chosen)

- **Rationale:** One prompt per pattern is cost-effective. LLM's training knowledge covers most deprecation information. High-objectivity signals only — things verifiably present/absent in code.

- **Implementation:**

  **Single prompt per pattern covering all 5 categories:**
  
  | Category | Detection approach |
  |----------|-------------------|
  | error-handling | Check for missing try/catch, .catch(), error boundaries around risky operations |
  | deprecated-api | Two-step: (1) identify libraries/APIs used, (2) flag deprecated/maintenance/legacy based on LLM knowledge |
  | consistency | Compare evidence items for mixed approaches (async/await + callbacks, different libs for same task) |
  | security | High-confidence obvious issues only — LLM uses language-appropriate patterns: JS/TS (innerHTML with user input, eval()), Python (string formatting in SQL, pickle with untrusted data, shell=True), Go (sql.Query with string concat), all languages (hardcoded secrets, credentials in code) |
  | completeness | Missing null checks, validation, return statements |

  **Deprecation status levels:**
  - `deprecated` = officially deprecated by maintainers
  - `maintenance` = no longer actively developed, successor exists
  - `legacy` = outdated approach, modern alternative preferred

  **Post-MVP enhancement:**
  - Add web search step to check for deprecations beyond training cutoff
  - Query npm registry, library changelogs, or deprecation databases

- **Implications:**
  - One LLM call per pattern (cost-effective)
  - Deprecation detection is smarter than static list
  - Security is NOT full SAST — only obvious high-confidence issues
  - No subjective quality judgments
  - False positive risk managed by high-objectivity constraint

---

### D24. [Dec 2025] Insight rules: json-rules-engine with starter rule set
`[Decided]`

- **Context:** Due diligence identified that InsightRule interface existed but no actual rules were defined. Developers would have to invent rules during implementation.

- **Alternatives considered:**
  - Hardcoded TypeScript switch/case (rejected: hard to modify, can't store in DB)
  - Custom bespoke rule engine (rejected: reinventing the wheel)
  - json-rules-engine npm package (chosen)

- **Rationale:** json-rules-engine is a battle-tested, declarative rule engine that:
  - Supports complex conditions (all, any, not)
  - Rules stored as JSON (can move to DB later)
  - Priority-based evaluation (first matching high-priority rule wins)
  - Future-proofs for admin UI, per-repo customization, A/B testing

- **Implementation:**

  **Install dependency:** `npm install json-rules-engine`

  **Facts derived from pattern:**
  ```typescript
  interface InsightFacts {
    tier: PatternConfidenceTier | FilesystemConfidenceTier;
    instanceCount: number;
    uniqueAuthors: number;
    consistency: 'high' | 'medium' | 'low';
    ageCategory: 'established' | 'maturing' | 'emerging';
    primaryLocation: CodeCategory;  // D25: core/feature/frontend/backend/test/config/helper
    isSpreading: boolean;      // emerging + instanceCount >= 3
    isStagnant: boolean;       // newestInstance > 1 year ago
    isSingleAuthor: boolean;   // uniqueAuthors === 1
    hasHealthWarnings: boolean;
    backtestViolations: number;
    // Filesystem pattern fields (null for code patterns)
    isFilesystemPattern: boolean;
    filesystemAdoption: number | null;  // % adoption for filesystem patterns
  }
  ```

  **Starter rule set (18 rules, priority-ordered):**

  | Priority | Rule | Conditions | Insight |
  |----------|------|------------|---------|
  | 100 | strong-high-impact | tier=strong, backtest≥3 | "High confidence with proven impact. Will catch real violations." |
  | 95 | health-warnings | hasWarnings=true, tier∈[strong,emerging,moderate] | "Has health warnings. Review signals before promoting." |
  | 90 | strong-ready | tier=strong, NOT singleAuthor | "High confidence with broad adoption. Safe to enforce." |
  | 89 | filesystem-strong | isFilesystemPattern, tier=strong | "Clear naming convention with high adoption. Safe to enforce." |
  | 88 | strong-single-author | tier=strong, singleAuthor | "Established pattern from one engineer. Validate it's team convention, not personal style." |
  | 85 | emerging-spreading-impact | tier=emerging, spreading, backtest≥1 | "Spreading pattern catching violations. Standardize now." |
  | 80 | emerging-spreading | tier=emerging, spreading | "Gaining traction. Consider standardizing before drift." |
  | 75 | high-impact-any-tier | backtest≥5, tier≠legacy | "High impact — worth careful review even if moderate confidence." |
  | 70 | emerging-watch | tier=emerging | "New pattern emerging. Watch for adoption before enforcing." |
  | 65 | moderate-core-location | tier=moderate, location=core | "Moderate confidence but in core code. May be worth enforcing." |
  | 50 | moderate-default | tier=moderate | "Moderate confidence. Review evidence to decide." |
  | 45 | weak-single-author | tier=weak, singleAuthor | "Only one engineer uses this. Likely personal style." |
  | 44 | filesystem-low-adoption | isFilesystemPattern, filesystemAdoption<60 | "Convention exists but adoption is low. May need team alignment before enforcing." |
  | 40 | weak-low-consistency | tier=weak, consistency=low | "Implementations vary significantly. May not be real convention." |
  | 35 | weak-default | tier=weak | "Low confidence. Probably not worth enforcing." |
  | 34 | filesystem-weak | isFilesystemPattern, tier=weak | "Few examples found. May not be intentional convention." |
  | 30 | legacy-stagnant | tier=legacy, stagnant | "Old pattern, no recent activity. Not worth enforcing." |
  | 25 | legacy-default | tier=legacy | "Pattern in legacy code. Consider if should be phased out." |

- **Post-MVP evolution:**
  - Move rules to `insight_rules` table in Supabase
  - Admin UI for editing rules without code deploy
  - Per-repo rule customization
  - A/B testing different rule sets
  - Analytics on which rules fire most often

- **Implications:**
  - Adds json-rules-engine dependency (~50KB)
  - Rules are declarative and easy to modify
  - Priority system ensures most specific rule wins
  - Fallback rules (per-tier defaults) catch any pattern
  - Foundation for future rule customization

---

### D25. [Dec 2025] Location classification: LLM-based semantic analysis, not path heuristics
`[Decided]`

- **Context:** Due diligence identified that LOCATION_PATTERNS used hardcoded path strings (`/utils/`, `/core/`, etc.) that don't account for common patterns like `/src/` prefix and vary widely across codebases.

- **Alternatives considered:**
  - Add more path patterns including /src/ variants (rejected: endless variations, still brittle)
  - Strip /src/ prefix before matching (rejected: still relies on path conventions)
  - Simplify to just legacy/test detection (rejected: loses valuable signal)
  - LLM-based semantic classification (chosen)

- **Rationale:** The LLM is already reading evidence files during extraction. Having it classify "what type of code is this" based on actual content is:
  - More accurate than path guessing
  - Works on any codebase regardless of folder conventions
  - Low marginal cost (already in context)
  - Provides richer signal ("pattern spans frontend and backend")

- **Implementation:**

  **7 code type categories:**

  | Category | LLM looks for |
  |----------|---------------|
  | `core` | Infrastructure, shared utilities, database access, auth, logging — foundational code other code depends on |
  | `feature` | Business logic, domain-specific functionality, use-case implementations |
  | `frontend` | UI components, views, styling, client-side state management |
  | `backend` | API routes, server logic, request handlers, middleware |
  | `test` | Test files, test utilities, mocks, fixtures, test helpers |
  | `config` | Configuration, setup, environment, build scripts, deployment |
  | `helper` | Small utilities, formatting, validation — leaf code with few dependencies |

  **Extraction prompt addition:**
  ```
  For each evidence file, classify the code type based on its content and purpose:
  - core: foundational infrastructure other code depends on (database, auth, logging, shared utilities)
  - feature: business/domain logic and use-case implementations
  - frontend: UI components, views, styling, client-side code
  - backend: API routes, server logic, request handlers
  - test: tests, test utilities, mocks, fixtures
  - config: configuration, setup, environment, build scripts
  - helper: small utilities, formatters, validators — leaf code
  
  Classify based on what the code DOES, not where it lives.
  ```

  **Legacy tier derivation updated:** Now based on staleness (no new instances in 1+ year) + established age, not file path.

- **Implications:**
  - More accurate classification across diverse codebases
  - No path convention assumptions
  - Slightly more LLM output per evidence file (one category label)
  - Richer insight rules possible ("backend patterns should have error handling")
  - Removed `LOCATION_PATTERNS` constant
  - Future: could weight confidence differently by category

---

### D26. [Dec 2025] Violation dismissal: single action with optional false positive flag
`[Decided]`

- **Context:** Due diligence identified that PR comment showed two actions ("Dismiss" and "Report false positive") but ViolationResolution only had one 'dismissed' status. The distinction was unclear.

- **Alternatives considered:**
  - Separate resolution statuses for dismiss vs false positive (rejected: adds complexity, both mean "not fixing")
  - Keep both buttons with same backend status (rejected: confusing UX)
  - Single Dismiss action with optional false positive checkbox (chosen)

- **Rationale:** Both actions mean "this violation doesn't apply to me." The only difference is whether the AI was wrong. Capturing this as a checkbox within the dismiss flow:
  - Simpler UX (one action)
  - Still captures false positive signal for extraction tuning
  - Avoids cluttered PR comment

- **Implementation:**
  - Add `dismissalReason: string | null` and `isFalsePositive: boolean` to Violation
  - Single "Dismiss" link in PR comment
  - Dismiss modal: optional reason field + "This is a false positive" checkbox
  - Fast path: just click Dismiss without filling anything

- **Implications:**
  - One action instead of two in PR comments
  - False positive data captured for future extraction improvement
  - Dismissal reason optional (fast path available)
  - Future: analyze false positive rate per pattern to tune detection

---

### D27. [Dec 2025] Pattern evolution: detect evidence modifications in PRs, require owner review
`[Decided]`

- **Context:** Authoritative patterns have evidence files in the codebase. When those files change, the system needs to determine: is this an evolution of the pattern (update the standard) or a deviation from it (violation)?

- **Alternatives considered:**
  - Auto-update patterns when evidence changes (rejected: silent pattern drift, no quality control)
  - Treat all evidence changes as violations (rejected: patterns can never legitimately evolve)
  - Periodic manual staleness review (rejected: too manual, misses the moment of change)
  - Detect evidence modifications in PRs, require owner review (chosen)

- **Rationale:** The moment of change is when context is richest — the PR author knows their intent, the diff is visible, the pattern owner can make an informed decision. Capturing this in the PR workflow:
  - Prevents silent pattern drift
  - Enables legitimate pattern evolution
  - Creates audit trail of pattern changes
  - Keeps pattern owner in the loop

- **Implementation:**

  **New entity: PatternEvolutionRequest**
  - Created when PR modifies file that's evidence for authoritative pattern
  - Tracks: pattern, PR, which evidence, isCanonical flag, AI-generated diff summary
  - Status: pending → accepted/rejected
  - If rejected: creates Violation record

  **Detection flow:**
  1. PR webhook received
  2. Check if any changed files match evidence for authoritative patterns
  3. Create PatternEvolutionRequest for each match
  4. Flag canonical modifications as high priority
  5. Post PR comment notifying pattern owner
  6. Status check blocks merge for pending canonical reviews

  **Owner decision:**
  - **Accept as evolution:** 
    - PatternEvolutionRequest.status → 'accepted', record reviewer and timestamp
    - PatternEvidence: update `capturedAtSha` to PR head SHA, clear `isStale` flag
    - Line numbers (`startLine`, `endLine`) and `snippet` remain as-is — accuracy restored during next re-extraction (task 6.5a)
    - Optionally update pattern description if checkbox selected
    - Other evidence records for same pattern: unchanged (converge organically via future PRs)
    - PR status check → passing
  - **Reject as deviation:** Violation created, standard violation flow applies

  **Status check behavior:**
  - Canonical modified + pending review → Pending state, description: "Awaiting review: canonical example modified"
  - Non-canonical modified → Success state, description: "Passed (1 evidence file modified — see PR comments)"

- **Implications:**
  - Pattern owners notified at moment of change
  - Canonical modifications require explicit approval
  - Audit trail of pattern evolution decisions
  - Patterns can legitimately evolve through this workflow
  - Adds ~2 days to Phase 5 (detection logic, review UI, PR comments)

---

### D28. [Dec 2025] Backtest diff storage in Supabase Storage
`[Decided]`

- **Context:** Pre-dev audit identified that task 2.10 stored only PR file paths, but violation detection (task 3.13) requires actual diff content to identify semantic violations. Backtest promises specific violation descriptions ("Missing error boundary in UserProfile.tsx") which requires analyzing what code changed.

- **Alternatives considered:**
  - Store only file paths, re-fetch diffs lazily during backtest (rejected: 100 API calls per backtest, rate limit risk, slow)
  - Store diffs in Postgres (rejected: blob storage not ideal for DB)
  - Store diffs in Supabase Storage (chosen)

- **Rationale:** Supabase Storage is S3-compatible, cheap (~$0.023/GB/month), and already in the stack. Storage cost is negligible: 100 PRs × 50KB = 5MB per repo. Storing diffs during ingestion means backtest runs instantly without GitHub API calls.

- **Implementation:**
  - Store path: `pr_diffs/{repo_id}/{pr_number}.patch` (uses Repo UUID for uniqueness)
  - Add `diffStoragePath: string | null` to PullRequest interface
  - Backtest reads from storage, no network calls
  - On re-ingestion: overwrite existing diffs (idempotent)
  - Cleanup: delete storage folder when repo disconnected

- **Implications:**
  - Backtest is fast and reliable (no API dependencies)
  - Adds Supabase Storage dependency (already using Supabase)
  - Minimal storage cost even at scale
  - PR analysis for live PRs still fetches fresh diff from GitHub (not from storage)

---

### D29. [Dec 2025] Duplicate detection with merge action for re-extraction
`[Decided]`

- **Context:** Pre-dev audit identified that when re-extraction surfaces candidates similar to existing authoritative patterns, users had no efficient way to capture the new evidence. Options were: (a) reject and lose evidence, or (b) manually add each via Evidence Management UI — tedious for many files.

- **Alternatives considered:**
  - Prompt on reject with evidence checkboxes (reactive, easy to miss)
  - Add "Merge into existing" as fourth action (proactive, but adds cognitive load)
  - Combine both: detect similarity upfront, surface merge as primary action (chosen)

- **Rationale:** Users should see the relationship immediately and act with one click. LLM already analyzes patterns during extraction — adding similarity check is low marginal cost. Merge action captures all evidence without manual work.

- **Implementation:**
  
  **Detection (task 3.15):**
  - After extraction, for each candidate, prompt LLM: "Is this pattern semantically similar to any of these authoritative patterns? [list names + descriptions]"
  - If match found, set `Pattern.similarToPatternId` to the authoritative pattern's ID
  - Bundle with health signals prompt for efficiency (one extra question)
  
  **UI (Workflow 1):**
  - Candidates with `similarToPatternId` display distinct card:
    - Badge: "⚠️ Similar to existing"
    - Shows: "matches [Pattern Name]"
    - Actions: **Merge** (primary), Promote as separate, Dismiss
  - Expanded view shows side-by-side: candidate definition vs authoritative definition
  
  **Merge action (task 4.14):**
  - Copy all evidence from candidate to target authoritative pattern
  - Evidence inherits candidate's git metadata (author, date, SHA)
  - Delete candidate (cascades to backtest_violations)
  - Success toast: "Added 5 evidence locations to Error Boundary Pattern"
  - No modal — instant action like Defer
  
  **Edge cases:**
  - If authoritative pattern was deleted between extraction and merge → show error, refresh queue
  - If user believes patterns are distinct → "Promote as separate" works normally
  - Similarity detection is best-effort — false negatives caught via manual Evidence Management

- **Implications:**
  - One-click evidence capture during re-extraction
  - No evidence loss when patterns resurface as duplicates
  - Enables future automatic re-extraction (scheduling infrastructure still needed)
  - Adds ~0.5 day to Phase 3 (similarity detection) and ~0.5 day to Phase 4 (merge UI)
  - LLM cost: ~$0.01 per extraction for similarity check (bundled with health signals)

---

### D30. [Dec 2025] Dual channel enforcement architecture
`[Decided]`

- **Context:** Teams have mixed workflows — some engineers use AI coding tools (Claude Code, Cursor), others code manually. Pattern governance must cover both scenarios.

- **Alternatives considered:**
  - PR enforcement only (rejected: doesn't prevent violations in AI-generated code)
  - AI context only (rejected: doesn't catch violations from manual contributors)
  - Dual channel with unified pattern source (chosen)

- **Rationale:** Same authoritative pattern serves both channels. Prevention (AI context) is primary for AI-assisted code; enforcement (PR review) is backup and covers manual contributors. Users can enable one or both channels per pattern.

- **Implementation:**
  - Add `enforcement: { prReview: boolean, aiContext: boolean }` to Pattern
  - Default both to true on promotion (except file-structure: aiContext only)
  - Context file generation consumes patterns where `aiContext: true`
  - PR analysis consumes patterns where `prReview: true`

- **Implications:**
  - Users can selectively enable enforcement per pattern per channel
  - File-structure patterns are context-file-only (PR enforcement not meaningful)
  - Both channels update when pattern changes

---

### D31. [Dec 2025] Filesystem patterns as first-class pattern type (scoped)
`[Decided]`

- **Context:** AI coding tools generate files, not just code. Directory structure and naming conventions are architectural decisions that drift without governance.

- **Alternatives considered:**
  - Code patterns only, defer filesystem (rejected: AI agents need filesystem guidance)
  - Full filesystem support including boundaries (rejected: boundary detection complex, value unclear)
  - File-naming + file-structure only, boundaries post-MVP (chosen)

- **Rationale:** 
  - File-naming can be enforced in PRs (regex on new file paths)
  - File-structure provides useful AI context even without PR enforcement
  - Boundaries require import graph analysis that's complex; context-file-only value is weak

- **Implementation:**
  - Add pattern types: `file-naming`, `file-structure`
  - Add `FilesystemPatternEvidence` interface
  - Separate extraction prompt for filesystem analysis
  - Dedicated UI card for filesystem patterns in queue
  - PR enforcement for file-naming only; file-structure is context-file-only

- **Implications:**
  - Extraction pipeline runs two passes: code analysis + filesystem analysis
  - Candidate queue shows mixed pattern types with appropriate badges
  - Context files include dedicated sections for filesystem patterns
  - Boundary patterns deferred to post-MVP

---

### D32. [Dec 2025] Context file formats: Claude + Cursor for MVP
`[Decided]`

- **Context:** Different AI coding tools use different context file formats and conventions.

- **Alternatives considered:**
  - Single generic markdown format (rejected: tools have specific conventions)
  - Support 5 formats (claude, cursor, copilot, aider, generic) (rejected: scope creep)
  - Claude + Cursor only for MVP (chosen)

- **Rationale:** Claude Code and Cursor are the two dominant AI coding tools with established context file conventions. Copilot's custom instructions feature is newer and less adopted. Aider is respected but niche. Adding formats post-MVP is ~1 day per format.

- **Implementation:**
  - `ContextFileFormat` enum: `'claude' | 'cursor'`
  - Base transformer generates canonical markdown
  - Format adapters adjust tone/structure for each tool
  - User can override default paths

- **Implications:**
  - Reduced initial build scope (~1.5 days saved)
  - Add formats post-MVP based on user requests
  - Must track format spec changes as tools evolve

---

### D33. [Dec 2025] Marker-based context file append
`[Decided]`

- **Context:** Teams often have existing CLAUDE.md or .cursorrules files with custom content. Need to preserve user content while managing our generated section.

- **Alternatives considered:**
  - Separate file + user import (rejected: extra setup, depends on import syntax support)
  - Overwrite entire file (rejected: destroys user content)
  - Marker-based append (chosen)

- **Rationale:** 
  - Zero setup for user — no import statement needed
  - User content never touched — we only manage between markers
  - Clear demarcation prevents accidental edits
  - Simple implementation

- **Implementation:**
  - Markers: `<!-- REASONING_SUBSTRATE_START -->` and `<!-- REASONING_SUBSTRATE_END -->`
  - If file doesn't exist → create with just our section
  - If file exists without markers → append our section at end
  - If file exists with markers → replace only content between markers

- **Implications:**
  - Risk: user edits inside markers and loses changes. Mitigation: clear warning in markers, potential UI warning on external modification.
  - Works regardless of tool's import syntax support

---

### D34. [Dec 2025] Simplified confidence scoring for filesystem patterns
`[Decided]`

- **Context:** Code pattern confidence uses 4 dimensions (Evidence, Adoption, Establishment, Location). These don't all translate to filesystem patterns.

- **Alternatives considered:**
  - Same 4-dimension model with adapted definitions (rejected: some dimensions feel forced)
  - No confidence scoring for filesystem (rejected: can't prioritize against code patterns)
  - 2-dimension model: Evidence + Adoption (chosen)

- **Rationale:**
  - Establishment doesn't mean much for filesystems — directory stability doesn't signal intentionality
  - Location could apply but adds complexity with marginal value
  - Evidence + Adoption captures what engineers care about: "Is this real? Is it followed?"

- **Implementation:**
  - `confidenceModel: 'code' | 'filesystem'` field on Pattern
  - Filesystem confidence: `{ evidence: number, adoption: number }`
  - UI shows 2 pills for filesystem patterns, 4 for code patterns

- **Implications:**
  - Different pattern types having different scoring is architecturally honest
  - Establishes precedent for future pattern types to have appropriate scoring

---

### D35. [Dec 2025] File-structure patterns: context-file-only enforcement
`[Decided]`

- **Context:** File-structure patterns (e.g., "feature folders must have index.ts, components/, hooks/") extracted and promoted. Question: should we try to enforce in PRs?

- **Alternatives considered:**
  - Full PR enforcement (rejected: requires intent inference — is the folder incomplete or legitimately minimal?)
  - No extraction at all (rejected: valuable AI guidance)
  - Extract + context-file only (chosen)

- **Rationale:**
  - PR enforcement for structure is ambiguous: "Is this a violation or work-in-progress?"
  - Context file value is clear: "When creating a feature, include these files"
  - File-naming enforcement is unambiguous: wrong case is wrong case

- **Implementation:**
  - `file-structure` patterns have `enforcement.prReview` defaulted to false and disabled in UI
  - Tooltip explains: "PR enforcement not available for structure patterns"
  - Still included in context files when `enforcement.aiContext: true`

- **Implications:**
  - Simpler PR enforcement logic (only code + file-naming)
  - Clear expectation setting in UI

---

### D36. [Dec 2025] Debounced context file regeneration
`[Decided]`

- **Context:** Pattern changes trigger context file regeneration. User promoting 10 patterns in quick succession would cause 10 regenerations.

- **Alternatives considered:**
  - Regenerate on every change (rejected: wasteful)
  - Manual "Sync Now" button only (rejected: friction, "out of sync" becomes normal state)
  - Debounce 5-10 seconds (chosen)

- **Rationale:** Standard pattern for batching rapid changes. User doesn't need instant feedback on background generation. Trigger.dev makes this trivial.

- **Implementation:**
  - On pattern change, queue regeneration job with 5-10s delay
  - If another change arrives before job fires, reset timer
  - After debounce, regenerate once for all accumulated changes

- **Implications:**
  - Efficient resource usage
  - Slight delay before "synced" status updates (acceptable)

---

### Decision Template

```markdown
### D#. [Date] Decision title
`[Decided]`

- **Context:** What prompted this decision?
- **Alternatives considered:** What else could we have done?
- **Rationale:** Why this choice?
- **Implications:** What does this affect downstream?
```

---

## Appendix B: Open Questions Backlog

*Track questions needing answers. Move to "Resolved" when addressed.*

### High Priority (Blocking)

| ID | Question | Territory | Status | Notes |
|----|----------|-----------|--------|-------|
| Q2 | Can we achieve <15min time-to-value? | 2.6 | Open | Static analysis feasibility |
| Q3 | Who writes the check vs who uses? | 5.1 | Addressed | DevEx/Platform = budget; Senior/Staff = daily users. See 1.3 Key Dynamics |

### Medium Priority (Important)

| ID | Question | Territory | Status | Notes |
|----|----------|-----------|--------|-------|
| Q4 | What's real LLM cost at scale? | 4.2 | Open | Need 100/500/1000-service scenarios |
| Q5 | How handle multi-repo orgs? | 2.2 | Open | Cross-repo patterns |
| Q6 | What's Copilot's trajectory? | 3.4 | Open | Monitor GitHub announcements |
| Q9 | Should PatternType be emergent rather than predefined enum? | 2.4 | Addressed | MVP: Keep enum with 'other' catch-all + `suggestedType` field for LLM suggestions. Analyze during dogfooding to refine taxonomy. |

### Lower Priority (Future)

| ID | Question | Territory | Status | Notes |
|----|----------|-----------|--------|-------|
| Q7 | Enterprise security requirements? | 2.4 | Open | SOC2, on-prem, data residency |
| Q8 | International expansion? | 5.2 | Open | Language, pricing, compliance |

### Resolved

| ID | Question | Resolution | Date |
|----|----------|------------|------|
| Q1 | What's the MVP? | Full Observer Agent loop with GitHub PR integration. See section 6.1 | Dec 2025 |

### Question Template

```markdown
| Q# | [Question] | [Section] | Open | [Notes] |
```

---

## Appendix C: Hypothesis Register

*Track testable hypotheses. Update status as evidence emerges.*

### Problem Hypotheses

| ID | Hypothesis | Validation Method | Status | Result |
|----|------------|-------------------|--------|--------|
| H1 | Staff+ engineers spend >4 hours/week on pattern-related PR feedback | Customer interviews (N=10+) with time estimation prompts; optional: shadow sessions or time-tracking | `UNTESTED` | — |
| H2 | AI-generated code accelerates pattern violations | Git history analysis pre/post Copilot adoption; OR qualitative interviews ("Has AI code gen made enforcement harder?") | `UNTESTED` | — |
| H7 | Pattern drift is a human coordination problem — occurs regardless of AI code generation | Interviews with teams not using Copilot/Cursor; compare drift rates AI vs non-AI teams | `UNTESTED` | — |

### Solution Hypotheses
`[Updated: Dec 2025]`

| ID | Hypothesis | Validation Method | Status | Result |
|----|------------|-------------------|--------|--------|
| H3a | LLMs extract patterns from codebases with >80% precision | Technical spike on 3+ codebases; measure precision/recall vs human-identified patterns | `UNTESTED` | — |
| H3b | LLMs detect pattern violations with >90% precision and <10% false positive rate | Technical spike; measure against known violations in test repos | `UNTESTED` | — |
| H4 | >50% of surfaced pattern candidates receive human action (validate/reject/defer) within 7 days | Prototype with 5+ users; track engagement funnel | `UNTESTED` | — |
| H9 | Users perceive meaningful value within 15 minutes of connecting a repo (via static analysis), before deep extraction completes | Time-to-value measurement in pilots; user interviews on first-session experience | `UNTESTED` | — |
| H12 | Users trust human-validated patterns significantly more than AI-only patterns, measured by enforcement opt-in rate | A/B test in product: compare enforcement adoption for validated vs candidate patterns | `UNTESTED` | — |
| H13 | Pattern violations save ~15 min of review time on average (used in time-saved calculation) | Post-launch user survey ("How long does a typical violation take to catch/fix?"); PR cycle time analysis comparing PRs with vs without violations | `UNTESTED` | — |
| H14 | Teams using AI coding tools enable context file sync for >80% of authoritative patterns | Track `enforcement.aiContext` opt-in rate in dogfooding and pilots | `UNTESTED` | — |
| H15 | Filesystem patterns have comparable extraction precision to code patterns (>70%) | Measure precision on filesystem patterns during dogfood extraction | `UNTESTED` | — |

### Business Hypotheses

| ID | Hypothesis | Validation Method | Status | Result |
|----|------------|-------------------|--------|--------|
| H5 | Teams pay $15/user/mo for enforcement | Pricing test, WTP interviews | `UNTESTED` | — |
| H6 | Free tier converts >5% to paid | Launch and measure | `UNTESTED` | — |
| H10 | Daily user satisfaction creates internal champions who initiate budget conversations within 30 days of adoption | Track user-to-buyer pipeline; interview champions on conversion triggers | `UNTESTED` | — |
| H11 | Users who annotate pattern rationale (the "Why") have 2x higher retention than those who don't | Cohort analysis: retention by provenance engagement depth | `UNTESTED` | — |

### Status Values

- `UNTESTED` — Not yet validated
- `TESTING` — Validation in progress
- `VALIDATED` — Evidence supports
- `INVALIDATED` — Evidence contradicts
- `INCONCLUSIVE` — Mixed results

### Hypothesis Template

```markdown
| H# | [Statement] | [Validation method] | `UNTESTED` | — |
```

---

## Appendix D: Exploration Roadmap

*Suggested sequence. Update as priorities shift.*

### Phase 1: Foundation (Lock the Core)
*Goal: Clarity on who we serve and what we're building*

- [x] **1.3 Jobs to Be Done** — Forces clarity on who/what/why
- [x] **2.5 Key Workflows** — Detail UX flows
- [ ] **3.2 Positioning** — Test differentiation messaging

**Exit Criteria:** One-sentence pitch that resonates with target users

### Phase 2: Viability (Does This Work?)
*Goal: Confidence it's buildable and fundable*

- [ ] **4.2 Unit Economics** — Real cost modeling
- [x] **6.1 MVP Definition** — Smallest valuable thing
- [x] **6.4 Risk Register** — Complete risk planning

**Exit Criteria:** Clear MVP spec; viable unit economics

### Phase 3: Path to Market (How Do We Win?)
*Goal: Actionable GTM plan*

- [ ] **5.2 Distribution Strategy** — PLG vs sales
- [ ] **5.3 Wedge & Expansion** — Land-and-expand detail
- [x] **6.2 Build Sequence** — Detailed build order

**Exit Criteria:** Executable plan someone could start on

### Phase 4: Validation (Is This Real?)
*Goal: Market evidence*

- [ ] Validate H1-H2 (Problem)
- [ ] Validate H3-H4 (Solution)
- [ ] Validate H5-H6 (Business)

**Exit Criteria:** Signal to commit or pivot

---

## Changelog

*Track significant document updates.*

| Date | Section | Change | Author |
|------|---------|--------|--------|
| Dec 2025 | All | Initial creation | Claude + Darien |
| Dec 2025 | Top | Added AI Agent Instructions | Claude |
| Dec 2025 | 1.3 | Developed comprehensive JTBDs for all 4 segments + cross-cutting jobs; added buyer vs user dynamics and pattern coverage strategic lens | Claude + Darien |
| Dec 2025 | Appendix C | Refined H1-H4 with measurable criteria and better validation methods; added H7 (drift is human coordination problem), H9 (time-to-value), H10 (user-to-champion pipeline), H11 (provenance retention), H12 (validated vs AI-only trust) | Claude + Darien |
| Dec 2025 | 6.1, Appendix A | Defined full MVP scope: Observer Agent loop with GitHub PR integration; tech stack (Supabase + Vercel + Trigger.dev); added decisions D4-D7; resolved Q1 | Claude + Darien |
| Dec 2025 | 6.2 | Defined 6-phase build sequence with task breakdown, dependencies, critical path, and parallel work opportunities; estimated 6-8 weeks total | Claude + Darien |
| Dec 2025 | 6.3 | Defined 12 milestones (M1-M12) with success criteria, hypothesis links, go/no-go decision points, and demo checkpoints | Claude + Darien |
| Dec 2025 | 2.4 | Full TypeScript interfaces for all MVP entities: User, Repo, Pattern, PatternEvidence, Provenance, PullRequest, Violation; includes ER diagram, Supabase schema notes, and post-MVP extension plan | Claude + Darien |
| Dec 2025 | 6.1, Appendix A | Resolved Open Technical Questions: LLM model (D8: Claude Sonnet 4.5), extraction chunking (D10: full-repo single-pass with 1M context beta header `context-1m-2025-08-07`), incremental analysis (D9: extract-once + manual refresh). Added post-MVP items for smart chunking and delta extraction. | Claude + Darien |
| Dec 2025 | 2.4, 6.1, 6.2, Appendix A | Added D11: Multi-dimensional confidence scoring (Evidence, Adoption, Establishment, Location) with tier derivation (strong/emerging/moderate/weak/legacy), Pattern Health Signals for objective quality observations, and template-based contextual insights. Added TypeScript interfaces: PatternConfidence, PatternHealthSignals, HealthSignal, InsightRule. Updated PatternEvidence with git metadata fields. Updated build sequence Phases 2-4 with new tasks (+5-6 days). Revised total timeline to 6-8 weeks. | Claude + Darien |
| Dec 2025 | 6.1, 6.2, Appendix A | Added D12: Engagement loop features to address candidate queue ignore (H4) and provenance friction (H11) risks. New features: Impact Preview (backtest against historical PRs), Violation Attribution (owner + rationale in PR comments), Queue Depletion UX (keyboard triage, progress bar), Weekly Impact Digest (dashboard widget). Added tasks 2.10, 3.13, 4.9-4.11, 6.7. Updated critical path. Revised total timeline to 6-8 weeks. | Claude + Darien |
| Dec 2025 | 6.4 | Comprehensive risk register with 8 focused risks (R1-R8) across Technical, Product, External, and Execution categories. Each risk includes likelihood, impact, hypothesis link, mitigation strategy, detection signal, and status. Top risks: extraction quality (R1) and violation noise (R2). Two risks pre-mitigated by D12 (R5, R6). | Claude + Darien |
| Dec 2025 | 2.5, Appendix A | Added D13: Comprehensive UX workflows. Clarified pattern mental model (abstract definition + evidence pointers, not golden code). Detailed 8 workflows: Candidate Review (keyboard-first triage queue with Superhuman-style UX, target audience framing, comparable products, auto-behaviors, step-by-step flow), Pattern Promotion (modal with rationale/provenance), Pattern Detail View (full edit capabilities), PR Violation Comment (owner attribution + rationale), Validation flow, Evolution flow (post-MVP), Repo Connection (5-step flow from add to extraction complete with streaming results), Dashboard & Navigation (information architecture, screen wireframes, nav patterns, keyboard shortcuts, empty states). Includes ASCII wireframes for all major screens. | Claude + Darien |
| Dec 2025 | 2.4, 6.2 | Due diligence fixes: Added `deferred` to PatternStatus enum; added `deferCount` and `deferredAt` fields to Pattern interface; added `extractionStatus`, `lastExtractedAt`, `patternCount` to Repo interface; PR comment actions changed to links (require app login); added magic link tokens to post-MVP extensions; added tasks 2.11 (ingestion progress tracking), 3.14 (extraction progress), 4.12 (repo progress page), 5.9 (violation detail page) | Claude + Darien |
| Dec 2025 | 2.4, 2.5, 6.2, Appendix A | Due diligence: Removed Watch from MVP (keyboard shortcuts, validation actions, auto-behaviors); moved full Watch functionality with notifications to post-MVP extensions (Pattern.watch: instance count tracking, spreading detection, email/in-app notifications) | Claude + Darien |
| Dec 2025 | 2.5, 6.2, Appendix A | Due diligence: Clarified auto-behaviors implementation — "Stale" is UI filter not status (`deferCount >= 3`); "untouched 60 days" uses `extractedAt` not new field; added task 6.10 for daily scheduled auto-archive job | Claude + Darien |
| Dec 2025 | 2.4, 6.2 | Due diligence: Added `tokenCount` field to Repo interface; added task 2.12 for token counting during ingestion; updated task 3.4 to validate token count before extraction; enables "Too large" warning per D10 | Claude + Darien |
| Dec 2025 | 6.2, Appendix A | Due diligence: Defined re-extraction behavior in task 6.5 and D9 — deletes candidate/deferred patterns, preserves authoritative (updates evidence), preserves rejected; clarifies "refresh" vs "replace" semantics | Claude + Darien |
| Dec 2025 | 6.1, 6.2, Changelog | Due diligence: Standardized all timeline references to "6-8 weeks" (was inconsistent: 1-2 months, 4-6 weeks, 5-7 weeks in various places) | Claude + Darien |
| Dec 2025 | 6.2 | Due diligence: Added task 4.13 for evidence management UI — remove incorrect evidence, add new evidence by file path, set/change canonical example; supports [Manage] button in Pattern Detail wireframe | Claude + Darien |
| Dec 2025 | 2.3 | Due diligence: Added MVP Implementation Note to Agent Model section clarifying that Observer Agent capabilities are implemented via Trigger.dev jobs/webhooks, not persistent agents; true agent architecture is post-MVP | Claude + Darien |
| Dec 2025 | 2.4 | Due diligence: Removed `exempted` from ViolationResolution enum (unused in MVP workflows); moved to post-MVP extensions with formal exemption workflow (approval process, audit trail) | Claude + Darien |
| Dec 2025 | 2.4, Appendix B | Due diligence: Added Q9 to Open Questions — should PatternType be emergent (LLM-proposed) rather than predefined enum? Keep enum for MVP, validate during dogfooding. Added note in data model referencing Q9. | Claude + Darien |
| Dec 2025 | 2.5 | Due diligence: Added "Zero patterns extracted" empty state to handle repos where extraction finds no patterns (small repos, varied code) | Claude + Darien |
| Dec 2025 | 6.2 | Due diligence: Updated task 5.1 to include webhook signature verification (`X-Hub-Signature-256`) for security | Claude + Darien |
| Dec 2025 | 2.4, 6.2 | Due diligence: Added storage for PatternConfidence (`confidenceScore`), PatternHealthSignals (`healthSignals`), and backtest results to Pattern interface. Removed redundant `confidence: number` field. Backtest uses two-part storage: `PatternBacktestSummary` on Pattern for stats, separate `backtest_violations` table for individual violations (supports "View all" UI). Added BacktestViolation interface and SQL schema with CASCADE delete. Updated ER diagram. Added Supabase Realtime config for repos table. Clarified InsightRules as hardcoded for MVP. Updated tasks 3.9, 3.10, 4.9, 6.5 with storage references. Added task 4.10a for backtest violations UI. | Claude + Darien |
| Dec 2025 | 6.2, Appendix A, 2.4 | Due diligence (high-priority fixes): (1) Added time saved formula to D12: `violations × 15 min / 60 = hours`; updated task 6.7. (2) Added auth deep linking: task 6.11 for `returnTo` URL preservation through OAuth; updated task 5.9 with `?action=` query param support. (3) Token estimation safety buffer: changed threshold from 800k to 600k (75% of limit) to account for estimation variance across languages; updated D10, tasks 2.12, 3.4, Repo.tokenCount comment, UI wireframe, Open Technical Questions. | Claude + Darien |
| Dec 2025 | 2.1, 2.4, 2.5, 6.2, Appendix A, Appendix E | Due diligence resolution session: D14 (vision/MVP separation — created Appendix E for long-term vision); D15 (GitHub token handling — on-demand generation, no storage); D16 (batch extraction results, no streaming for MVP); D17 (queue sorting algorithm — tier buckets with backtest tie-breaking); D18 (rejection flow — optional reason modal, rejectionReason field); D19 (violation severity — per-pattern defaultSeverity set during promotion) | Claude + Darien |
| Dec 2025 | 2.4, 2.5, 6.2, Appendix A | Due diligence resolution session (continued): D20 (consistency assessment — LLM-judged with explicit rubric); D21 (evidence management — autocomplete from repo_files, staleness detection with capturedAtSha/isStale/staleReason fields, Manage Evidence modal wireframe); D22 (pattern ownership — validator becomes owner on promote); D23 (health signals detection — single prompt per pattern, LLM-powered deprecation check); D24 (insight rules — json-rules-engine with 14 starter rules); D25 (location classification — LLM-based semantic analysis, 7 code categories, removed path heuristics) | Claude + Darien |
| Dec 2025 | 2.4, 2.5, 6.2, Appendix A, Appendix C | Due diligence resolution session (continued): D26 (violation dismissal — single action with optional false positive checkbox); D27 (pattern evolution workflow — detect evidence modifications in PRs, require owner review, PatternEvolutionRequest entity, canonical blocks merge); Added H13 hypothesis (15 min time-saved validation); Expanded error handling tasks 6.1a-f; Added Supabase Realtime details; Updated timeline to 6-9 weeks; Added suggestedType field to Pattern for taxonomy analysis; Marked Q9 as addressed | Claude + Darien |
| Dec 2025 | D9, 6.1, 6.2, 2.4 | Pre-dev audit resolution: Clarified re-extraction behavior for authoritative patterns — preserved unchanged (no evidence matching/merging), only backtest recomputed; added duplicate handling note (similar candidates appear as new, user rejects or manually adds evidence via D21); added post-MVP dependency for automatic re-extraction (requires duplicate detection + merge workflow); updated task 6.5; added Pattern.evidence row to Schema Evolution Notes; added automatic re-extraction to Out of Scope table | Claude + Darien |
| Dec 2025 | D9, D27, 6.2 | Pre-dev audit resolution: Added evidence re-capture during re-extraction (task 6.5a) — LLM re-analyzes each authoritative pattern's evidence files to refresh `startLine`, `endLine`, `snippet`, `capturedAtSha`; keeps evidence accurate automatically without manual line number management; updated D27 Accept behavior with detailed mechanics (capturedAtSha updates to PR head, lines stay as-is until re-extraction); updated Phase 6 estimate (+1 day); updated total timeline note | Claude + Darien |
| Dec 2025 | 2.4, 6.2 | Pre-dev audit resolution: Clarified git blame granularity for multi-line evidence ranges — use `startLine` to determine author/commit (deterministic, captures "signature" line); updated task 2.8 and PatternEvidence interface comment | Claude + Darien |
| Dec 2025 | 2.4 | Pre-dev audit resolution: Removed undefined `confidence: number` field from Violation interface — severity (error/warning/info) already handles prioritization; moved to post-MVP extensions in Schema Evolution Notes | Claude + Darien |
| Dec 2025 | Appendix A | Pre-dev audit resolution: Clarified D15 token lifecycle — `@octokit/auth-app` handles caching and refresh automatically (no manual caching needed); added guidance to create one Octokit instance per job for long-running operations; removed misleading `lru-cache` suggestion | Claude + Darien |
| Dec 2025 | 2.4 | Pre-dev audit resolution: Made weak tier criteria explicit in CONFIDENCE_THRESHOLDS — `maxInstances: 2` OR `singleAuthor: true` OR `consistency: 'low'` (any triggers weak); added tier derivation logic comment explaining evaluation order | Claude + Darien |
| Dec 2025 | 2.4, 2.5, Appendix A | Pre-dev audit resolution: Renamed "Stale" UI filter to "Stuck" for patterns deferred 3+ times — avoids confusion with evidence staleness (D21); "Stale" now exclusively refers to evidence with deleted/changed files; "Stuck" = repeatedly deferred candidates; "Auto-dismissed" = weak patterns removed after 60 days | Claude + Darien |
| Dec 2025 | 2.4, 2.5, Appendix A | Pre-dev audit resolution (minor issues): (1) Added canonical model string to D8 (`claude-sonnet-4-5-20250929`), updated extractedByModel example; (2) Clarified status check description format for evolution reviews in D27 and task 5.7a; (3) Changed dashboard "This Week" to "Last 7 Days" for consistency with rolling window; (4) Added URL format documentation for PR comment links (pattern, violation, canonical example); (5) Expanded D23 security examples to be language-agnostic (added Python, Go patterns) | Claude + Darien |
| Dec 2025 | 2.4, 6.2, Appendix A | Pre-dev audit resolution: D28 (backtest diff storage) — store full PR diff content in Supabase Storage (`pr_diffs/{repo_id}/{pr_number}.patch`) during ingestion; enables accurate violation detection for backtest without API calls; added `diffStoragePath` field to PullRequest interface; updated task 2.10 | Claude + Darien |
| Dec 2025 | 2.4, 6.2 | Pre-dev audit fixes: (1) Added `confidenceModel: 'code' \| 'filesystem'` discriminator to Pattern interface (D34); (2) Updated `confidenceScore` type to union `PatternConfidence \| FilesystemPatternConfidence \| null`; (3) Removed redundant `enforcementEnabled` field (derived from `enforcement.prReview \|\| enforcement.aiContext`); (4) Fixed Phase 6 task dependencies after Phase 5 split (6.1d→5b.7, 6.7→5b.8, 6.8a→5b.5); (5) Updated timeline table to show Phase 5a/5b separately; (6) Fixed monthly projection formula to use `windowDays` instead of hardcoded 90; (7) Added codeCategory validation fallback to task 3.7 | Claude + Darien |
| Dec 2025 | 2.4, 2.5, 6.2, D9, Appendix A | Pre-dev audit resolution: D29 (duplicate detection with merge action) — detect when candidates are similar to existing authoritative patterns during extraction; surface with distinct card UI and one-click Merge action to transfer evidence; added `similarToPatternId` field to Pattern interface; added task 3.15 (similarity detection) and task 4.14 (merge action); updated D9 duplicate handling; added `m` keyboard shortcut; updated Out of Scope (automatic re-extraction now closer) | Claude + Darien |
| Dec 2025 | 2.4, Appendix A (D24) | Pre-dev audit resolution: Fixed weak tier over-triggering on single author — single author alone no longer forces Weak tier if instanceCount > 5; updated CONFIDENCE_THRESHOLDS to use `singleAuthorMaxInstances: 5` instead of `singleAuthor: true`; added `strong-single-author` insight rule (priority 88) to surface adoption concern for high-instance single-author patterns; updated `strong-ready` rule to exclude single-author; now 15 rules total | Claude + Darien |
| Dec 2025 | 2.4, 2.5, Appendix A (D10, D27) | Pre-dev audit resolution (minor issues batch): (1) D10 token budget breakdown — clarified 800k usable context after system prompt/output reservation, 600k = 75% safety buffer; (2) Evolution Accept line drift — documented that line numbers may drift until re-extraction, added note about post-MVP re-sync action; (3) PR comment auth flow — expanded with step-by-step flow diagram and supported action values; (4) Evidence snippet constraints — added 500 char max, truncation strategy, usage notes; (5) Status check multiplicity — clarified single check with multiple states (success/failure/pending), added state priority table | Claude + Darien |
| Dec 2025 | 0.1, 0.2, 2.1, 2.4, 2.5, 2.6, 6.1, 6.2, 6.3, 6.4, Appendix A, Appendix C | Addendum integration: Dual channel enforcement (AI context + PR review per D30); filesystem pattern types (file-naming, file-structure per D31); context file generation for Claude + Cursor (D32, D33, D36); marker-based append preserves user content; 2-dimension confidence for filesystem (D34); file-naming PR enforcement only, file-structure context-file-only (D35); updated promotion modal with enforcement channel toggles; added Workflows 9, 10, 11; added tasks 3.16-3.19, 4.15-4.17, Phase 5a (context files); revised build sequence to Phase 5a + 5b split; added D30-D36, H14-H15, R9-R10, M13-M15; revised timeline 7-10 weeks (+3.5 days from 6-9 weeks); updated one-liner and key bets | Claude + Darien |
| Dec 2025 | 2.4 | Pre-dev audit resolution: Refactored FilesystemPatternEvidence to one-row-per-path design (matches PatternEvidence structure); moved `globPattern` and `antiPatternExamples` to Pattern interface (definition-level, not evidence-level); removed `structureTemplate` for MVP (skip mini-schema to avoid false positives on incremental PRs); added `filesystem_pattern_evidence` SQL table; file-structure patterns remain context-file-only with no enforcement | Claude + Darien |
| Dec 2025 | 2.4, 2.5, 6.2, Appendix A | Pre-dev audit resolution (minor fixes): (1) Fixed InsightFacts.primaryLocation type in D24 to use CodeCategory (7 values) instead of incorrect 5-value inline type; (2) Clarified D28 storage path uses Repo UUID; (3) Added execution time to task 6.10 auto-archive job (03:00 UTC); (4) Added idempotency note to task 5b.8 for webhook retry handling; (5) Added filter options to candidate queue wireframe (Status, Tier, Type, Stuck badge); (6) Documented filter dropdown options | Claude + Darien |
| Dec 2025 | 2.4, 6.2, Appendix A | Pre-dev audit resolution (11 issues): **CRITICAL:** Added tier derivation for FilesystemPatternConfidence (FILESYSTEM_TIER_THRESHOLDS: strong/emerging/moderate/weak), 3 filesystem-specific insight rules (priority 89, 44, 34), updated InsightFacts with isFilesystemPattern and filesystemAdoption fields, now 18 rules total. **MAJOR:** Added RepoFile interface and SQL schema for evidence autocomplete; added syncStatus field to ContextFileConfig (never/synced/pending); added backtest_violations cleanup to task 4.3 (reject) and task 6.10 (auto-archive); added PatternEvolutionStatus type with historical/cancelled states and closedAt field for audit trail. **MINOR:** Clarified task 3.16 filesystem extraction timing; added default severity to task 4.16; added task 6.6a for PR diff storage cleanup on repo disconnect; added empty context file handling to task 5a.3; clarified debounce trigger scope in task 5a.7; added continuous staleness detection to Out of Scope; added task 5b.16 for PR lifecycle handling; updated task 2.9 and 3.19 references. | Claude + Darien |
| Dec 2025 | 2.2, 6.1, Appendix A | **D37: Framework migration to Hono + Vite + TanStack Router.** Updated tech stack from Next.js on Vercel to: Hono backend (Bun runtime), Vite + React + TanStack Router frontend, tRPC for type-safe API, Base UI for components, Tailwind CSS v4, Drizzle ORM. Added monorepo structure diagram. Superseded D7, updated D15 (removed Vercel references). Updated Phase 1 tasks to reflect new architecture (tasks 1.1, 1.3, 1.9, 1.10). | Claude |

---

*— End of Document —*