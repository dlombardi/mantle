---
name: enforcement-specialist
description: "Domain specialist for PR analysis and pattern enforcement. Manages webhook handling for pull requests, violation detection using pattern modules, PR comment posting, GitHub status checks, and evolution detection for pattern adaptation."
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
  layer: enforcement
  core-loop-phase: enforce
  priority: critical
  dependencies:
    - extraction-specialist
    - github-integration-specialist
  outputs:
    - PR comments with violations
    - GitHub status checks
    - evolution_events table
---

# Enforcement Specialist

## Purpose

You are the enforcement specialist for Reasoning Substrate. Your domain is ensuring PR changes comply with authoritative patterns through automated analysis, violation detection, and helpful feedback.

## Activation Triggers

Activate this skill when the task involves:
- PR webhook handling
- Violation detection logic
- PR comment generation
- GitHub status check management
- Pattern evolution detection

## Prerequisites

Before starting enforcement work, ensure:
1. `backend-architect` patterns are established in `docs/backend/`
2. `github-integration-specialist` has webhook infrastructure ready
3. Authoritative patterns exist with violation modules
4. Dual channel enforcement settings exist (D30)

## Tasks Owned

### 1. PR Webhook Handler

```typescript
// app/api/webhooks/github/route.ts (PR section)
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/github/webhooks";
import { analyzePRTask } from "@/jobs/analyze-pr";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(payload);

  if (event === "pull_request") {
    const action = body.action;

    // Trigger analysis on open, synchronize (new commits), reopened
    if (["opened", "synchronize", "reopened"].includes(action)) {
      await analyzePRTask.trigger({
        installationId: body.installation.id,
        repoFullName: body.repository.full_name,
        prNumber: body.pull_request.number,
        headSha: body.pull_request.head.sha,
        baseBranch: body.pull_request.base.ref,
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

### 2. PR Analysis Job

```typescript
// jobs/analyze-pr.ts
import { task } from "@trigger.dev/sdk/v3";
import { getInstallationOctokit } from "@/lib/github/auth";
import { detectViolations } from "@/lib/enforcement/detector";
import { supabase } from "@/lib/db/client";

export const analyzePRTask = task({
  id: "analyze-pr",
  maxDuration: 120, // 2 minutes max
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: PRAnalysisPayload) => {
    const { installationId, repoFullName, prNumber, headSha, baseBranch } = payload;

    // Get repo settings
    const { data: repo } = await supabase
      .from("repositories")
      .select("id, enforcement_pr_review, enforcement_context_files")
      .eq("full_name", repoFullName)
      .single();

    if (!repo) {
      throw new Error(`Repository not found: ${repoFullName}`);
    }

    // Check if PR enforcement is enabled (D30)
    if (!repo.enforcement_pr_review) {
      return { skipped: true, reason: "PR review enforcement disabled" };
    }

    const octokit = await getInstallationOctokit(installationId);

    // Set pending status
    await octokit.repos.createCommitStatus({
      owner: repoFullName.split("/")[0],
      repo: repoFullName.split("/")[1],
      sha: headSha,
      state: "pending",
      context: "reasoning-substrate/patterns",
      description: "Analyzing changes for pattern compliance...",
    });

    // Get PR diff
    const { data: files } = await octokit.pulls.listFiles({
      owner: repoFullName.split("/")[0],
      repo: repoFullName.split("/")[1],
      pull_number: prNumber,
    });

    // Get authoritative patterns for this repo
    const { data: patterns } = await supabase
      .from("patterns")
      .select("*, violation_modules(*)")
      .eq("repo_id", repo.id)
      .eq("tier", "authoritative");

    // Detect violations
    const violations = await detectViolations(files, patterns);

    // Store analysis results
    const { data: analysis } = await supabase
      .from("pr_analyses")
      .insert({
        repo_id: repo.id,
        pr_number: prNumber,
        head_sha: headSha,
        violations_count: violations.length,
        files_analyzed: files.length,
        status: violations.length > 0 ? "violations_found" : "clean",
      })
      .select()
      .single();

    // Store individual violations
    if (violations.length > 0) {
      await supabase.from("violations").insert(
        violations.map((v) => ({
          pr_analysis_id: analysis.id,
          pattern_id: v.patternId,
          file_path: v.filePath,
          line_number: v.lineNumber,
          description: v.description,
          severity: v.severity,
          suggested_fix: v.suggestedFix,
        }))
      );

      // Post PR comment
      await postViolationComment(octokit, repoFullName, prNumber, violations);

      // Set failure status
      await octokit.repos.createCommitStatus({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        sha: headSha,
        state: "failure",
        context: "reasoning-substrate/patterns",
        description: `Found ${violations.length} pattern violation(s)`,
        target_url: `${process.env.NEXT_PUBLIC_APP_URL}/repos/${repo.id}/prs/${prNumber}`,
      });
    } else {
      // Check for evolution signals
      const evolutionSignals = await detectEvolution(files, patterns);
      if (evolutionSignals.length > 0) {
        await storeEvolutionEvents(repo.id, prNumber, evolutionSignals);
      }

      // Set success status
      await octokit.repos.createCommitStatus({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
        sha: headSha,
        state: "success",
        context: "reasoning-substrate/patterns",
        description: "All patterns followed",
      });
    }

    return {
      violationsFound: violations.length,
      filesAnalyzed: files.length,
      evolutionSignals: evolutionSignals?.length || 0,
    };
  },
});
```

### 3. Violation Detection Engine

```typescript
// lib/enforcement/detector.ts
import { createClient } from "@/lib/anthropic/client";

export interface Violation {
  patternId: string;
  patternName: string;
  filePath: string;
  lineNumber: number;
  description: string;
  severity: "low" | "medium" | "high";
  suggestedFix: string;
  codeContext: string;
}

export async function detectViolations(
  files: PRFile[],
  patterns: PatternWithModules[]
): Promise<Violation[]> {
  const violations: Violation[] = [];

  for (const pattern of patterns) {
    const module = pattern.violation_modules[0];
    if (!module) continue;

    // Filter files that match enforcement scope
    const scopedFiles = files.filter((f) =>
      matchGlob(f.filename, module.enforcement_scope)
    );

    for (const file of scopedFiles) {
      const fileViolations = await detectInFile(file, pattern, module);
      violations.push(...fileViolations);
    }
  }

  return violations;
}

async function detectInFile(
  file: PRFile,
  pattern: Pattern,
  module: ViolationModule
): Promise<Violation[]> {
  switch (module.detection_type) {
    case "regex":
      return detectWithRegex(file, pattern, module);
    case "ast":
      return detectWithAST(file, pattern, module);
    case "llm":
      return detectWithLLM(file, pattern, module);
    default:
      return [];
  }
}

function detectWithRegex(
  file: PRFile,
  pattern: Pattern,
  module: ViolationModule
): Violation[] {
  const violations: Violation[] = [];
  const regex = new RegExp(module.detection_pattern, "gm");
  const lines = file.patch?.split("\n") || [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only check added lines (start with +)
    if (line.startsWith("+") && !line.startsWith("+++")) {
      const content = line.slice(1);
      if (regex.test(content)) {
        violations.push({
          patternId: pattern.id,
          patternName: pattern.name,
          filePath: file.filename,
          lineNumber: extractLineNumber(file.patch, i),
          description: module.violation_description,
          severity: pattern.enforcement_level || "medium",
          suggestedFix: module.fix_guidance,
          codeContext: extractContext(lines, i, 3),
        });
      }
    }
  }

  return violations;
}

async function detectWithLLM(
  file: PRFile,
  pattern: Pattern,
  module: ViolationModule
): Promise<Violation[]> {
  const client = await createClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze this code change for violations of the following pattern:

Pattern: ${pattern.name}
Description: ${pattern.description}
What constitutes a violation: ${module.violation_description}

File: ${file.filename}
Changes:
\`\`\`
${file.patch}
\`\`\`

If there are violations, return JSON:
{
  "violations": [{
    "lineNumber": number,
    "description": string,
    "severity": "low" | "medium" | "high",
    "suggestedFix": string,
    "codeContext": string
  }]
}

If no violations, return: { "violations": [] }`,
      },
    ],
  });

  const result = JSON.parse(response.content[0].text);
  return result.violations.map((v: any) => ({
    ...v,
    patternId: pattern.id,
    patternName: pattern.name,
    filePath: file.filename,
  }));
}
```

### 4. PR Comment Generation

```typescript
// lib/enforcement/comments.ts
export async function postViolationComment(
  octokit: Octokit,
  repoFullName: string,
  prNumber: number,
  violations: Violation[]
): Promise<void> {
  const [owner, repo] = repoFullName.split("/");

  // Group violations by pattern
  const byPattern = groupBy(violations, "patternName");

  const body = `## :mag: Pattern Compliance Report

Found **${violations.length}** pattern violation(s) that need attention.

${Object.entries(byPattern)
  .map(
    ([patternName, vs]) => `
### ${patternName}

${vs
  .map(
    (v) => `
- **${v.filePath}:${v.lineNumber}** - ${v.description}
  \`\`\`suggestion
  ${v.suggestedFix}
  \`\`\`
`
  )
  .join("\n")}
`
  )
  .join("\n")}

---
<sub>Powered by [Reasoning Substrate](${process.env.NEXT_PUBLIC_APP_URL}) | [View full analysis](${process.env.NEXT_PUBLIC_APP_URL}/repos/${repoFullName}/prs/${prNumber})</sub>
`;

  // Check for existing comment to update
  const { data: comments } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: prNumber,
  });

  const existingComment = comments.find(
    (c) =>
      c.user?.login === "reasoning-substrate[bot]" &&
      c.body?.includes("Pattern Compliance Report")
  );

  if (existingComment) {
    await octokit.issues.updateComment({
      owner,
      repo,
      comment_id: existingComment.id,
      body,
    });
  } else {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
  }

  // Also post inline comments for specific violations
  for (const v of violations) {
    try {
      await octokit.pulls.createReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        body: `**Pattern Violation: ${v.patternName}**\n\n${v.description}\n\n**Suggested fix:**\n\`\`\`\n${v.suggestedFix}\n\`\`\``,
        commit_id: v.commitSha,
        path: v.filePath,
        line: v.lineNumber,
      });
    } catch (e) {
      // Line might not be in diff, skip inline comment
      console.warn(`Could not post inline comment: ${e.message}`);
    }
  }
}
```

### 5. Evolution Detection

Detect when PR changes suggest a pattern is evolving:

```typescript
// lib/enforcement/evolution.ts
export interface EvolutionSignal {
  patternId: string;
  type: "modification" | "extension" | "deprecation";
  description: string;
  affectedFiles: string[];
  confidence: number;
}

export async function detectEvolution(
  files: PRFile[],
  patterns: Pattern[]
): Promise<EvolutionSignal[]> {
  const signals: EvolutionSignal[] = [];

  for (const pattern of patterns) {
    // Check if PR modifies files that are pattern examples
    const exampleFiles = pattern.examples;
    const modifiedExamples = files.filter((f) =>
      exampleFiles.includes(f.filename)
    );

    if (modifiedExamples.length >= 2) {
      // Multiple example files modified - potential pattern evolution
      const signal = await analyzeEvolution(pattern, modifiedExamples);
      if (signal) {
        signals.push(signal);
      }
    }
  }

  return signals;
}

async function analyzeEvolution(
  pattern: Pattern,
  modifiedFiles: PRFile[]
): Promise<EvolutionSignal | null> {
  const client = await createClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Analyze if these changes represent an evolution of the pattern:

Pattern: ${pattern.name}
Description: ${pattern.description}

Modified files (which are examples of this pattern):
${modifiedFiles.map((f) => `\n${f.filename}:\n${f.patch}`).join("\n---\n")}

Determine:
1. Is this a pattern evolution (modification, extension, deprecation)?
2. What is the nature of the change?
3. Confidence level (0-1)?

Return JSON:
{
  "isEvolution": boolean,
  "type": "modification" | "extension" | "deprecation" | null,
  "description": string,
  "confidence": number
}`,
      },
    ],
  });

  const result = JSON.parse(response.content[0].text);

  if (!result.isEvolution || result.confidence < 0.7) {
    return null;
  }

  return {
    patternId: pattern.id,
    type: result.type,
    description: result.description,
    affectedFiles: modifiedFiles.map((f) => f.filename),
    confidence: result.confidence,
  };
}

export async function storeEvolutionEvents(
  repoId: string,
  prNumber: number,
  signals: EvolutionSignal[]
): Promise<void> {
  await supabase.from("evolution_events").insert(
    signals.map((s) => ({
      repo_id: repoId,
      pattern_id: s.patternId,
      pr_number: prNumber,
      type: s.type,
      description: s.description,
      affected_files: s.affectedFiles,
      confidence: s.confidence,
      status: "pending_review",
    }))
  );
}
```

### 6. GitHub Status Checks

```typescript
// lib/enforcement/status.ts
export type CheckState = "pending" | "success" | "failure" | "error";

export async function setCommitStatus(
  octokit: Octokit,
  repoFullName: string,
  sha: string,
  state: CheckState,
  description: string,
  targetUrl?: string
): Promise<void> {
  const [owner, repo] = repoFullName.split("/");

  await octokit.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state,
    context: "reasoning-substrate/patterns",
    description: description.slice(0, 140), // GitHub limit
    target_url: targetUrl,
  });
}

export async function createCheckRun(
  octokit: Octokit,
  repoFullName: string,
  headSha: string,
  violations: Violation[]
): Promise<void> {
  const [owner, repo] = repoFullName.split("/");

  const annotations = violations.slice(0, 50).map((v) => ({
    path: v.filePath,
    start_line: v.lineNumber,
    end_line: v.lineNumber,
    annotation_level: v.severity === "high" ? "failure" : "warning",
    message: v.description,
    title: `Pattern violation: ${v.patternName}`,
    raw_details: v.suggestedFix,
  }));

  await octokit.checks.create({
    owner,
    repo,
    name: "Reasoning Substrate",
    head_sha: headSha,
    status: "completed",
    conclusion: violations.length > 0 ? "failure" : "success",
    output: {
      title: violations.length > 0
        ? `Found ${violations.length} pattern violation(s)`
        : "All patterns followed",
      summary: generateSummary(violations),
      annotations,
    },
  });
}
```

## Output Specification

### PR Analysis Record

```typescript
interface PRAnalysis {
  id: string;
  repo_id: string;
  pr_number: number;
  head_sha: string;
  violations_count: number;
  files_analyzed: number;
  status: "pending" | "analyzing" | "violations_found" | "clean" | "error";
  created_at: string;
  completed_at?: string;
}

interface Violation {
  id: string;
  pr_analysis_id: string;
  pattern_id: string;
  file_path: string;
  line_number: number;
  description: string;
  severity: "low" | "medium" | "high";
  suggested_fix: string;
  created_at: string;
}

interface EvolutionEvent {
  id: string;
  repo_id: string;
  pattern_id: string;
  pr_number: number;
  type: "modification" | "extension" | "deprecation";
  description: string;
  affected_files: string[];
  confidence: number;
  status: "pending_review" | "accepted" | "dismissed";
  created_at: string;
}
```

## Key Decisions Referenced

| ID | Decision | Implementation |
|----|----------|----------------|
| D4 | GitHub App auth model | Use @octokit/auth-app for installation tokens |
| D8 | Claude Sonnet 4.5 | For LLM-based violation detection |
| D30 | Dual channel enforcement | Check `enforcement_pr_review` flag before analysis |

## Handoffs

### Receives From
- `extraction-specialist`: Authoritative patterns with violation modules
- `github-integration-specialist`: Webhook payloads and Octokit instances

### Hands Off To
- `validation-ui-specialist`: Evolution events for review
- `context-files-specialist`: Sync trigger after pattern changes

## Quality Checklist

Before marking enforcement work complete:
- [ ] Webhook signature verification implemented
- [ ] PR analysis job is idempotent
- [ ] Status checks set correctly (pending → success/failure)
- [ ] Violation comments are clear and actionable
- [ ] Inline review comments positioned correctly
- [ ] Evolution detection has confidence threshold
- [ ] Dual channel settings respected (D30)
- [ ] Rate limiting considered for API calls
- [ ] Error states handled gracefully
