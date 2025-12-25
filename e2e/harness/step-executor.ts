/**
 * Step Executor - Execute parsed actions using Playwright
 *
 * Takes Action objects from the parser and executes them against a Playwright page.
 * Returns results for each action including pass/fail status and error messages.
 */

import { expect, type Page } from '@playwright/test';
import type { Action } from './action-parser';

export interface ActionResult {
  action: Action;
  success: boolean;
  error?: string;
  duration: number;
}

export interface ExecutionResult {
  passed: boolean;
  results: ActionResult[];
  totalDuration: number;
}

/**
 * Execute a single action against the page
 */
export async function executeAction(
  page: Page,
  action: Action,
  baseUrl: string,
): Promise<ActionResult> {
  const startTime = Date.now();

  try {
    switch (action.type) {
      case 'navigate': {
        const url = new URL(action.path, baseUrl).toString();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        break;
      }

      case 'click': {
        if (action.selector.kind === 'role') {
          await page
            .getByRole(action.selector.role, { name: action.selector.name })
            .click();
        } else {
          await page.getByText(action.selector.text).click();
        }
        break;
      }

      case 'fill': {
        await page.getByLabel(action.label).fill(action.value);
        break;
      }

      case 'assertTextVisible': {
        await expect(page.getByText(action.text)).toBeVisible({ timeout: 10000 });
        break;
      }

      case 'assertTextNotVisible': {
        await expect(page.getByText(action.text)).not.toBeVisible({ timeout: 10000 });
        break;
      }

      case 'assertElementVisible': {
        await expect(
          page.getByRole(action.role, { name: action.name }),
        ).toBeVisible({ timeout: 10000 });
        break;
      }

      case 'assertElementNotVisible': {
        await expect(
          page.getByRole(action.role, { name: action.name }),
        ).not.toBeVisible({ timeout: 10000 });
        break;
      }

      case 'assertUrl': {
        await expect(page).toHaveURL(new RegExp(escapeRegex(action.path) + '/?$'), {
          timeout: 10000,
        });
        break;
      }

      case 'assertUrlContains': {
        const currentUrl = page.url();
        if (!currentUrl.includes(action.substring)) {
          throw new Error(
            `URL assertion failed: expected "${currentUrl}" to contain "${action.substring}"`,
          );
        }
        break;
      }

      case 'waitForLoadState': {
        await page.waitForLoadState(action.state);
        break;
      }

      case 'waitForText': {
        await page.getByText(action.text).waitFor({ state: 'visible', timeout: 30000 });
        break;
      }

      case 'waitForTextGone': {
        await page.getByText(action.text).waitFor({ state: 'hidden', timeout: 30000 });
        break;
      }

      case 'wait': {
        await page.waitForTimeout(action.ms);
        break;
      }

      case 'screenshot': {
        await page.screenshot({
          path: `${action.name}.png`,
          fullPage: false,
        });
        break;
      }

      default: {
        // TypeScript exhaustiveness check
        const _exhaustiveCheck: never = action;
        throw new Error(`Unknown action type: ${(_exhaustiveCheck as Action).type}`);
      }
    }

    return {
      action,
      success: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      action,
      success: false,
      error: message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Execute multiple actions in sequence
 *
 * Stops on first failure by default (use continueOnFailure to override)
 */
export async function executeActions(
  page: Page,
  actions: Action[],
  baseUrl: string,
  options: { continueOnFailure?: boolean } = {},
): Promise<ExecutionResult> {
  const { continueOnFailure = false } = options;
  const results: ActionResult[] = [];
  const startTime = Date.now();
  let passed = true;

  for (const action of actions) {
    const result = await executeAction(page, action, baseUrl);
    results.push(result);

    if (!result.success) {
      passed = false;
      if (!continueOnFailure) {
        break;
      }
    }
  }

  return {
    passed,
    results,
    totalDuration: Date.now() - startTime,
  };
}

/**
 * Format action for human-readable output
 */
export function formatAction(action: Action): string {
  switch (action.type) {
    case 'navigate':
      return `navigate: ${action.path}`;

    case 'click':
      if (action.selector.kind === 'role') {
        return `click: ${action.selector.role} "${action.selector.name}"`;
      }
      return `click: text "${action.selector.text}"`;

    case 'fill':
      return `fill: "${action.label}" = "${action.value}"`;

    case 'assertTextVisible':
      return `assertTextVisible: ${action.text}`;

    case 'assertTextNotVisible':
      return `assertTextNotVisible: ${action.text}`;

    case 'assertElementVisible':
      return `assertElementVisible: ${action.role} "${action.name}"`;

    case 'assertElementNotVisible':
      return `assertElementNotVisible: ${action.role} "${action.name}"`;

    case 'assertUrl':
      return `assertUrl: ${action.path}`;

    case 'assertUrlContains':
      return `assertUrlContains: ${action.substring}`;

    case 'waitForLoadState':
      return `waitForLoadState: ${action.state}`;

    case 'waitForText':
      return `waitForText: ${action.text}`;

    case 'waitForTextGone':
      return `waitForTextGone: ${action.text}`;

    case 'wait':
      return `wait: ${action.ms}`;

    case 'screenshot':
      return `screenshot: ${action.name}`;
  }
}

/**
 * Format execution result as a summary string
 */
export function formatExecutionSummary(result: ExecutionResult): string {
  const lines: string[] = [];

  for (const r of result.results) {
    const status = r.success ? '✓' : '✗';
    const actionStr = formatAction(r.action);
    const line = `${status} ${actionStr} (${r.duration}ms)`;

    if (r.error) {
      lines.push(`${line}\n    Error: ${r.error}`);
    } else {
      lines.push(line);
    }
  }

  const passedCount = result.results.filter((r) => r.success).length;
  const totalCount = result.results.length;

  lines.push('');
  lines.push(`${passedCount}/${totalCount} actions passed (${result.totalDuration}ms total)`);

  return lines.join('\n');
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
