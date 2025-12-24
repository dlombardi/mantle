/**
 * QA Harness - Automated verification for the three-phase agentic workflow
 *
 * This harness automates Phase 3 verification:
 * 1. Health check the preview deployment
 * 2. Seed the preview with test data
 * 3. Run browser-based verification against qa-checklist.md
 * 4. Generate qa-report.md with results
 */

export { runQAHarness, type QAHarnessConfig, type QAHarnessResult } from './qa-harness';
export { seedPreview, type SeedConfig, type SeedResult } from './seed-preview';
export { generateReport, type ReportConfig } from './report-generator';
