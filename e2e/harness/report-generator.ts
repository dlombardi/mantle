/**
 * Report Generator - Create structured qa-report.md from verification results
 */

import { writeFile } from 'node:fs/promises';
import type { VerificationResult } from './qa-harness';
import type { SeedResult } from './seed-preview';

export interface ReportConfig {
  outputPath: string;
  beadId: string;
  previewUrl: string;
  iteration: number;
  healthCheck: { ok: boolean; error?: string; duration: number };
  seed: SeedResult;
  verifications: VerificationResult[];
  testSuite: { passed: boolean; output?: string };
}

/**
 * Generate qa-report.md from verification results
 */
export async function generateReport(config: ReportConfig): Promise<void> {
  const now = new Date();
  const timestamp = now.toISOString().replace('T', ' ').slice(0, 16);

  const passedCount = config.verifications.filter((v) => v.status === 'pass').length;
  const totalCount = config.verifications.length;
  const allPassed = passedCount === totalCount;
  const overallStatus = allPassed ? 'PASS' : 'FAIL';

  const report = `# QA Report: ${config.beadId}

**Bead ID:** ${config.beadId}
**Report Date:** ${timestamp}
**Iteration:** ${config.iteration}/3
**Preview URL:** ${config.previewUrl}

---

## Summary

| Category | Status | Details |
|----------|--------|---------|
| **Overall** | ${overallStatus} | ${passedCount}/${totalCount} verifications passed |
| **Health Check** | ${config.healthCheck.ok ? 'PASS' : 'FAIL'} | ${config.healthCheck.ok ? `${config.healthCheck.duration}ms` : config.healthCheck.error} |
| **Seed** | ${config.seed.success ? 'PASS' : 'FAIL'} | Scenario: ${config.seed.scenario} |
| **Test Suite** | ${config.testSuite.passed ? 'PASS' : 'PENDING'} | ${config.testSuite.output ?? 'Not run'} |

---

## Verification Results

${config.verifications.map((v) => formatVerificationResult(v)).join('\n\n')}

---

## Environment Details

- **Preview URL:** ${config.previewUrl}
- **Seed Scenario:** ${config.seed.scenario}
- **Browser:** Chromium (Playwright)
- **Timestamp:** ${now.toISOString()}

---

## Conclusion

${generateConclusion(config, allPassed)}

---

## Next Steps

${generateNextSteps(config.beadId, config.iteration, allPassed)}
`;

  await writeFile(config.outputPath, report, 'utf-8');
}

function formatVerificationResult(v: VerificationResult): string {
  const statusBadge = v.status === 'pass' ? 'PASS' : 'FAIL';
  let result = `### ${v.name}

**Status:** ${statusBadge}
**Duration:** ${v.duration}ms`;

  if (v.details) {
    result += `

**Details:**
${v.details}`;
  }

  if (v.screenshot) {
    result += `

**Screenshot:** \`${v.screenshot}\``;
  }

  return result;
}

function generateConclusion(config: ReportConfig, allPassed: boolean): string {
  if (allPassed) {
    return 'All verifications passed. Ready for merge.';
  }

  const failures = config.verifications.filter((v) => v.status === 'fail');
  const failureList = failures.map((f) => `- ${f.name}: ${f.details ?? 'Failed'}`).join('\n');

  return `**Issues Found:**
${failureList}

**Recommended Actions:**
- Review the failed verifications above
- Check the screenshots for visual context
- Fix the identified issues and re-run QA`;
}

function generateNextSteps(beadId: string, iteration: number, allPassed: boolean): string {
  if (allPassed) {
    return `\`\`\`bash
bd close ${beadId} --reason "QA passed - all verifications successful"
bd label add ${beadId} qa:passed
\`\`\``;
  }

  if (iteration >= 3) {
    return `Max iterations reached. Escalating to human review.

\`\`\`bash
bd label add ${beadId} needs-human
bd update ${beadId} --note "Max iterations (3) reached, escalating to human review"
\`\`\``;
  }

  return `Return to Phase 2 for iteration ${iteration + 1}:

\`\`\`
HANDOFF TO: <original-builder-skill>
PHASE: 2 (Implementation - Iteration ${iteration + 1})
BEAD: ${beadId}
CONTEXT: QA failed on iteration ${iteration}, see qa-report.md
TASK: Fix issues identified in this report
FILES: .beads/artifacts/${beadId}/qa-report.md
\`\`\``;
}
