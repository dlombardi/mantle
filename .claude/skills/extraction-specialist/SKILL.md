---
name: extraction-specialist
description: "Domain specialist for LLM-powered pattern extraction from repository code. Manages Claude API integration, prompt engineering, confidence scoring across 4 dimensions, tier derivation, health signal detection, and violation module bootstrapping."
license: MIT
compatibility:
  claude-code: ">=1.0.0"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - WebFetch
metadata:
  category: domain-specialist
  layer: extraction
  core-loop-phase: extract
  priority: critical
  dependencies:
    - ingestion-specialist
  outputs:
    - pattern_candidates table population
    - confidence scores (4 dimensions)
    - violation_modules table
---

# Extraction Specialist

## Purpose

You are the extraction specialist for Reasoning Substrate. Your domain is LLM-powered pattern extraction - turning raw repository code into structured pattern candidates with confidence scoring.

## Activation Triggers

Activate this skill when the task involves:
- Claude API integration and prompt engineering
- Pattern extraction from code files
- Confidence scoring and tier derivation
- Health signal detection
- Violation module creation

## Prerequisites

Before starting extraction work, ensure:
1. `backend-architect` patterns are established in `docs/backend/`
2. Ingestion has completed (files indexed in `repo_files` table)
3. Anthropic API key is configured
4. Claude client wrapper exists in `lib/anthropic/`

## Tasks Owned

### 1. Claude API Client Setup

```typescript
// lib/anthropic/client.ts
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 600_000; // Per D10: 600k limit within 1M window

export interface ExtractionRequest {
  repoId: string;
  files: FileContent[];
  existingPatterns?: Pattern[];
}

export interface ExtractionResponse {
  patterns: PatternCandidate[];
  healthSignals: HealthSignal[];
  processingMeta: {
    tokensUsed: number;
    filesAnalyzed: number;
    extractionDuration: number;
  };
}

export async function createClient(): Promise<Anthropic> {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultHeaders: {
      "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15", // D10: beta header
    },
  });
}
```

### 2. Pattern Extraction Prompt

Design the extraction prompt following these principles:
- Request structured JSON output
- Define pattern schema clearly
- Include examples of good patterns
- Request confidence justifications

```typescript
// lib/extraction/prompts.ts
export const EXTRACTION_SYSTEM_PROMPT = `You are an expert code analyst identifying recurring patterns in a codebase.

For each pattern you identify, provide:
1. name: A concise, descriptive name
2. description: What the pattern does and why it exists
3. category: One of [naming, structure, error-handling, api, data-flow, testing, documentation]
4. examples: 2-5 file paths demonstrating the pattern
5. confidence: Score each dimension 0.0-1.0 with justification

Confidence Dimensions (per D11):
- evidence: How clearly the pattern appears in code
- adoption: What percentage of relevant code follows it
- establishment: How long the pattern has existed (via git blame)
- location: How consistently it appears in expected locations

Only report patterns with evidence >= 0.6 AND adoption >= 0.4.`;

export const EXTRACTION_USER_PROMPT = (files: FileContent[]) => `
Analyze these ${files.length} files and identify recurring patterns.

<files>
${files.map(f => `<file path="${f.path}">\n${f.content}\n</file>`).join("\n")}
</files>

Return a JSON array of patterns following this schema:
{
  "patterns": [{
    "name": string,
    "description": string,
    "category": string,
    "examples": string[],
    "confidence": {
      "evidence": { "score": number, "justification": string },
      "adoption": { "score": number, "justification": string },
      "establishment": { "score": number, "justification": string },
      "location": { "score": number, "justification": string }
    },
    "codeSnippet": string,
    "suggestedEnforcement": string
  }],
  "healthSignals": [{
    "type": "inconsistency" | "decay" | "conflict",
    "description": string,
    "affectedPatterns": string[],
    "severity": "low" | "medium" | "high"
  }]
}`;
```

### 3. Confidence Scoring System

Implement the 4-dimension confidence model per D11:

```typescript
// lib/extraction/confidence.ts
export interface ConfidenceDimension {
  score: number; // 0.0 to 1.0
  justification: string;
}

export interface PatternConfidence {
  evidence: ConfidenceDimension;
  adoption: ConfidenceDimension;
  establishment: ConfidenceDimension;
  location: ConfidenceDimension;
}

export function calculateTier(confidence: PatternConfidence): PatternTier {
  const avg = (
    confidence.evidence.score +
    confidence.adoption.score +
    confidence.establishment.score +
    confidence.location.score
  ) / 4;

  if (avg >= 0.85) return "authoritative";
  if (avg >= 0.70) return "validated";
  if (avg >= 0.50) return "candidate";
  return "emerging";
}

export function deriveHealthScore(confidence: PatternConfidence): number {
  // Weight evidence and adoption more heavily
  return (
    confidence.evidence.score * 0.35 +
    confidence.adoption.score * 0.35 +
    confidence.establishment.score * 0.15 +
    confidence.location.score * 0.15
  );
}
```

### 4. Extraction Job

```typescript
// jobs/extract-patterns.ts
import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/anthropic/client";
import { supabase } from "@/lib/db/client";

export const extractPatternsTask = task({
  id: "extract-patterns",
  maxDuration: 300, // 5 minutes max
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },
  run: async (payload: { repoId: string; ingestionRunId: string }) => {
    const { repoId, ingestionRunId } = payload;

    // Update status to extracting
    await supabase
      .from("ingestion_runs")
      .update({ status: "extracting" })
      .eq("id", ingestionRunId);

    // Fetch indexed files
    const { data: files } = await supabase
      .from("repo_files")
      .select("path, content, token_count")
      .eq("repo_id", repoId)
      .order("token_count", { ascending: true });

    // Batch files to fit context window
    const batches = batchFilesForContext(files, 500_000); // Leave room for output

    const allPatterns: PatternCandidate[] = [];
    const allHealthSignals: HealthSignal[] = [];

    for (const batch of batches) {
      const result = await extractFromBatch(batch);
      allPatterns.push(...result.patterns);
      allHealthSignals.push(...result.healthSignals);
    }

    // Deduplicate and merge patterns
    const mergedPatterns = deduplicatePatterns(allPatterns);

    // Store results
    await storePatternCandidates(repoId, mergedPatterns);
    await storeHealthSignals(repoId, allHealthSignals);

    // Update status
    await supabase
      .from("ingestion_runs")
      .update({
        status: "complete",
        patterns_found: mergedPatterns.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", ingestionRunId);

    return { patternsFound: mergedPatterns.length };
  },
});
```

### 5. Zod Validation for LLM Output

Always validate LLM responses:

```typescript
// lib/extraction/schemas.ts
import { z } from "zod";

const ConfidenceDimensionSchema = z.object({
  score: z.number().min(0).max(1),
  justification: z.string().min(10),
});

const PatternCandidateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(20).max(1000),
  category: z.enum([
    "naming",
    "structure",
    "error-handling",
    "api",
    "data-flow",
    "testing",
    "documentation",
  ]),
  examples: z.array(z.string()).min(2).max(10),
  confidence: z.object({
    evidence: ConfidenceDimensionSchema,
    adoption: ConfidenceDimensionSchema,
    establishment: ConfidenceDimensionSchema,
    location: ConfidenceDimensionSchema,
  }),
  codeSnippet: z.string().optional(),
  suggestedEnforcement: z.string().optional(),
});

const HealthSignalSchema = z.object({
  type: z.enum(["inconsistency", "decay", "conflict"]),
  description: z.string(),
  affectedPatterns: z.array(z.string()),
  severity: z.enum(["low", "medium", "high"]),
});

export const ExtractionResponseSchema = z.object({
  patterns: z.array(PatternCandidateSchema),
  healthSignals: z.array(HealthSignalSchema).optional().default([]),
});

export function parseExtractionResponse(raw: string): ExtractionResponse {
  const json = JSON.parse(raw);
  return ExtractionResponseSchema.parse(json);
}
```

### 6. Violation Module Bootstrap

When a pattern is promoted to authoritative, create its violation detection module:

```typescript
// lib/extraction/violation-module.ts
export async function createViolationModule(
  pattern: AuthoritativePattern
): Promise<ViolationModule> {
  const client = await createClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Given this authoritative pattern, generate a violation detection module:

Pattern: ${pattern.name}
Description: ${pattern.description}
Category: ${pattern.category}
Examples:
${pattern.examples.map((e) => `- ${e}`).join("\n")}

Generate:
1. A regex or AST pattern to detect violations
2. A description of what constitutes a violation
3. Suggested fix guidance
4. Files/paths where this pattern should be enforced (glob pattern)

Return as JSON:
{
  "detectionPattern": string (regex or description),
  "detectionType": "regex" | "ast" | "llm",
  "violationDescription": string,
  "fixGuidance": string,
  "enforcementScope": string (glob pattern)
}`,
      },
    ],
  });

  const module = ViolationModuleSchema.parse(
    JSON.parse(response.content[0].text)
  );

  // Store in database
  await supabase.from("violation_modules").insert({
    pattern_id: pattern.id,
    detection_pattern: module.detectionPattern,
    detection_type: module.detectionType,
    violation_description: module.violationDescription,
    fix_guidance: module.fixGuidance,
    enforcement_scope: module.enforcementScope,
  });

  return module;
}
```

## Output Specification

### Pattern Candidate Record

```typescript
interface PatternCandidate {
  id: string;
  repo_id: string;
  name: string;
  description: string;
  category: PatternCategory;
  examples: string[];
  confidence_evidence: number;
  confidence_adoption: number;
  confidence_establishment: number;
  confidence_location: number;
  tier: "emerging" | "candidate" | "validated" | "authoritative";
  health_score: number;
  status: "pending" | "promoted" | "rejected" | "deferred";
  code_snippet?: string;
  suggested_enforcement?: string;
  extraction_run_id: string;
  created_at: string;
}
```

## Key Decisions Referenced

| ID | Decision | Implementation |
|----|----------|----------------|
| D8 | Claude Sonnet 4.5 | Model: `claude-sonnet-4-5-20250929` |
| D10 | 1M context window | Use beta header; 600k token limit per request |
| D11 | 4-dimension confidence | evidence, adoption, establishment, location |

## Handoffs

### Receives From
- `ingestion-specialist`: Indexed files with token counts and git blame data

### Hands Off To
- `validation-ui-specialist`: Pattern candidates for triage
- `enforcement-specialist`: Violation modules for authoritative patterns

## Quality Checklist

Before marking extraction work complete:
- [ ] Claude client properly configured with beta headers
- [ ] Extraction prompts produce valid JSON
- [ ] Zod schemas validate all LLM outputs
- [ ] Confidence scoring follows D11 formula
- [ ] Tier derivation matches PRD specification
- [ ] Health signals captured and stored
- [ ] Job is idempotent (re-runs don't duplicate patterns)
- [ ] Error handling with retry logic
- [ ] Status updates flow to Realtime
