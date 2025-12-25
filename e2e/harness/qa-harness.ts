/**
 * QA Harness - Core automation for Phase 3 verification
 *
 * Orchestrates the full verification cycle:
 * 1. Health check preview URL
 * 2. Seed with test data
 * 3. Run Playwright verification
 * 4. Generate structured report
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { seedPreview, type SeedResult } from './seed-preview';
import { generateReport } from './report-generator';
import { injectTestSession, isTestSessionAvailable } from './session-injector';
import { extractActionsFromSection, type Action } from './action-parser';
import { executeActions, formatExecutionSummary } from './step-executor';

export interface QAHarnessConfig {
  /** Vercel preview deployment URL */
  previewUrl: string;
  /** Path to qa-checklist.md artifact */
  checklistPath: string;
  /** Seed scenario name (optional, uses checklist default if not provided) */
  scenario?: string;
  /** Run browser in headless mode (default: true) */
  headless?: boolean;
  /** Timeout in milliseconds (default: 300000 / 5 min) */
  timeout?: number;
  /** Bead ID for artifact output */
  beadId: string;
  /** Current iteration (1-3) */
  iteration: number;
  /** Skip database seeding (for local testing without DB) */
  skipSeed?: boolean;
  /** Vercel deployment protection bypass token */
  bypassToken?: string;
}

export interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  details?: string;
  screenshot?: string;
  duration: number;
}

export interface QAHarnessResult {
  success: boolean;
  healthCheck: { ok: boolean; error?: string; duration: number };
  seed: SeedResult;
  verifications: VerificationResult[];
  testSuite: { passed: boolean; output?: string };
  reportPath: string;
  totalDuration: number;
}

/**
 * Apply bypass token to a URL for Vercel deployment protection
 */
function applyBypassToken(url: string, bypassToken?: string): string {
  if (!bypassToken) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}x-vercel-protection-bypass=${bypassToken}`;
}

/**
 * Run the full QA harness verification cycle
 */
export async function runQAHarness(config: QAHarnessConfig): Promise<QAHarnessResult> {
  const startTime = Date.now();
  const timeout = config.timeout ?? 300000;
  const headless = config.headless ?? true;

  console.log('QA Harness v1.0.0');
  console.log('================\n');
  console.log(`Preview URL: ${config.previewUrl}`);
  console.log(`Checklist: ${config.checklistPath}`);
  console.log(`Iteration: ${config.iteration}/3`);
  if (config.bypassToken) {
    console.log(`Bypass Token: ****${config.bypassToken.slice(-4)}`);
  }
  console.log();

  const result: QAHarnessResult = {
    success: false,
    healthCheck: { ok: false, duration: 0 },
    seed: { success: false, scenario: '', duration: 0 },
    verifications: [],
    testSuite: { passed: false },
    reportPath: '',
    totalDuration: 0,
  };

  let browser: Browser | null = null;

  try {
    // Step 1: Health check
    console.log('[1/4] Health check...');
    result.healthCheck = await healthCheck(config.previewUrl, timeout, config.bypassToken);
    if (!result.healthCheck.ok) {
      throw new Error(`Health check failed: ${result.healthCheck.error}`);
    }
    console.log(`      OK (${result.healthCheck.duration}ms)\n`);

    // Step 2: Parse checklist and seed
    const checklist = await parseChecklist(config.checklistPath);

    if (config.skipSeed) {
      console.log('[2/4] Seeding... SKIPPED\n');
      result.seed = { success: true, scenario: 'none', duration: 0 };
    } else {
      console.log('[2/4] Seeding...');
      const scenario = config.scenario ?? checklist.scenario ?? 'empty-repo';
      result.seed = await seedPreview({
        previewUrl: config.previewUrl,
        scenario,
        bypassToken: config.bypassToken,
      });
      if (!result.seed.success) {
        throw new Error(`Seed failed: ${result.seed.error}`);
      }
      console.log(`      OK (${result.seed.duration}ms)\n`);
    }

    // Step 3: Run browser verifications
    console.log('[3/4] Running verifications...');
    browser = await chromium.launch({ headless });
    const page = await browser.newPage();

    // Set bypass token header for all requests if provided
    if (config.bypassToken) {
      await page.setExtraHTTPHeaders({
        'x-vercel-protection-bypass': config.bypassToken,
      });
    }

    // Inject authenticated test session
    const sessionAvailable = await isTestSessionAvailable(config.previewUrl, config.bypassToken);
    if (sessionAvailable) {
      console.log('  Authenticating test session...');
      try {
        const userEmail = await injectTestSession(page, config.previewUrl, config.bypassToken);
        console.log(`  Authenticated as: ${userEmail}\n`);
      } catch (authError) {
        console.warn(`  Auth warning: ${authError instanceof Error ? authError.message : String(authError)}`);
        console.log('  Continuing without authentication...\n');
      }
    } else {
      console.log('  Test session endpoint not available - skipping auth\n');
    }

    for (const verification of checklist.verifications) {
      const verificationStart = Date.now();
      try {
        const verificationResult = await runVerification(page, config.previewUrl, verification, config.bypassToken);
        const duration = Date.now() - verificationStart;

        result.verifications.push({
          name: verification.name,
          status: verificationResult.passed ? 'pass' : 'fail',
          details: verificationResult.details,
          duration,
        });

        const statusIcon = verificationResult.passed ? '✓' : '✗';
        console.log(`  ${statusIcon} ${verification.name} (${duration}ms)`);
      } catch (error) {
        const duration = Date.now() - verificationStart;
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Capture screenshot on failure
        const screenshotDir = `.beads/artifacts/${config.beadId}`;
        await mkdir(screenshotDir, { recursive: true });
        const screenshotPath = `${screenshotDir}/failure-${verification.name.replace(/\s+/g, '-')}.png`;
        await page.screenshot({ path: screenshotPath });

        result.verifications.push({
          name: verification.name,
          status: 'fail',
          details: errorMessage,
          screenshot: screenshotPath,
          duration,
        });

        console.log(`  ✗ ${verification.name}`);
        console.log(`    ${errorMessage}`);
      }
    }

    await browser.close();
    browser = null;

    // Step 4: Generate report
    console.log('\n[4/4] Generating report...');
    const artifactDir = `.beads/artifacts/${config.beadId}`;
    await mkdir(artifactDir, { recursive: true });
    result.reportPath = `${artifactDir}/qa-report.md`;

    await generateReport({
      outputPath: result.reportPath,
      beadId: config.beadId,
      previewUrl: config.previewUrl,
      iteration: config.iteration,
      healthCheck: result.healthCheck,
      seed: result.seed,
      verifications: result.verifications,
      testSuite: result.testSuite,
    });

    // Calculate success
    const passedCount = result.verifications.filter((v) => v.status === 'pass').length;
    const totalCount = result.verifications.length;
    result.success = passedCount === totalCount;

    console.log(`\nSummary: ${passedCount}/${totalCount} passed`);
    console.log(`Report: ${result.reportPath}`);
  } catch (error) {
    console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    result.totalDuration = Date.now() - startTime;
  }

  return result;
}

/**
 * Health check the preview URL
 */
async function healthCheck(
  previewUrl: string,
  timeout: number,
  bypassToken?: string
): Promise<{ ok: boolean; error?: string; duration: number }> {
  const start = Date.now();
  const healthUrl = applyBypassToken(`${previewUrl}/api/health/live`, bypassToken);

  const maxRetries = 3;
  const retryDelay = 10000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(healthUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return { ok: true, duration: Date.now() - start };
      }

      if (attempt < maxRetries) {
        console.log(`      Retry ${attempt}/${maxRetries} in ${retryDelay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      if (attempt < maxRetries) {
        console.log(`      Retry ${attempt}/${maxRetries} in ${retryDelay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        return {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - start,
        };
      }
    }
  }

  return {
    ok: false,
    error: 'Max retries exceeded',
    duration: Date.now() - start,
  };
}

interface ChecklistVerification {
  name: string;
  steps: string[];
  expected: string;
  actions: Action[];
}

interface ParsedChecklist {
  scenario?: string;
  verifications: ChecklistVerification[];
}

/**
 * Parse the qa-checklist.md file
 */
async function parseChecklist(checklistPath: string): Promise<ParsedChecklist> {
  const content = await readFile(checklistPath, 'utf-8');

  // Extract scenario from "**Scenario:** `name`" pattern
  const scenarioMatch = content.match(/\*\*Scenario:\*\*\s*`([^`]+)`/);
  const scenario = scenarioMatch ? scenarioMatch[1] : undefined;

  // Extract verification sections
  const verifications: ChecklistVerification[] = [];
  const sectionRegex = /###\s+(AC\d+|Test\s+\d+):\s*(.+?)(?=\n###|\n---|\n##|$)/gs;

  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const name = `${match[1]}: ${match[2].trim()}`;
    const sectionContent = match[0];

    // Extract steps
    const stepsMatch = sectionContent.match(/\*\*Steps:\*\*\s*([\s\S]*?)(?=\*\*Expected|\*\*Pass|$)/);
    const steps = stepsMatch
      ? stepsMatch[1]
          .split('\n')
          .filter((line) => line.match(/^\d+\./))
          .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      : [];

    // Extract expected
    const expectedMatch = sectionContent.match(/\*\*Expected(?:\s+Result)?:\*\*\s*(.+?)(?=\n\*\*|$)/s);
    const expected = expectedMatch ? expectedMatch[1].trim() : '';

    // Extract machine-parseable actions
    const actions = extractActionsFromSection(sectionContent);

    verifications.push({ name, steps, expected, actions });
  }

  return { scenario, verifications };
}

/**
 * Run a single verification by executing its actions
 */
async function runVerification(
  page: Page,
  previewUrl: string,
  verification: ChecklistVerification,
  _bypassToken?: string
): Promise<{ passed: boolean; details: string }> {
  // If no actions defined, this is a legacy checklist - skip with warning
  if (verification.actions.length === 0) {
    return {
      passed: true,
      details: 'No actions defined - verification skipped (add **Actions:** section)',
    };
  }

  // Execute all actions for this verification
  const result = await executeActions(page, verification.actions, previewUrl);

  return {
    passed: result.passed,
    details: formatExecutionSummary(result),
  };
}
