/**
 * Action Parser - Parse machine-readable actions from qa-checklist.md
 *
 * Supported action syntax:
 *
 * Navigation:
 *   navigate: /path              → page.goto(baseUrl + '/path')
 *
 * Clicks:
 *   click: button "Label"        → page.getByRole('button', {name: 'Label'}).click()
 *   click: link "Label"          → page.getByRole('link', {name: 'Label'}).click()
 *   click: text "Label"          → page.getByText('Label').click()
 *
 * Form filling:
 *   fill: "Field Label" = "value" → page.getByLabel('Field Label').fill('value')
 *
 * Assertions:
 *   assertTextVisible: Some text  → expect(page.getByText('Some text')).toBeVisible()
 *   assertTextNotVisible: Text    → expect(page.getByText('Text')).not.toBeVisible()
 *   assertElementVisible: button "X" → expect(page.getByRole('button', {name: 'X'})).toBeVisible()
 *   assertElementNotVisible: button "X" → expect(...).not.toBeVisible()
 *   assertUrl: /path              → expect(page).toHaveURL(/path/)
 *   assertUrlContains: /partial   → expect(page.url()).toContain('/partial')
 *
 * Waiting:
 *   waitForLoadState: networkidle → page.waitForLoadState('networkidle')
 *   waitForLoadState: domcontentloaded → page.waitForLoadState('domcontentloaded')
 *   waitForText: Loading          → page.getByText('Loading').waitFor()
 *   waitForTextGone: Loading      → page.getByText('Loading').waitFor({ state: 'hidden' })
 *   wait: 1000                    → page.waitForTimeout(1000)
 *
 * Screenshots:
 *   screenshot: name              → page.screenshot({path: 'name.png'})
 */

export type ActionType =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'assertTextVisible'
  | 'assertTextNotVisible'
  | 'assertElementVisible'
  | 'assertElementNotVisible'
  | 'assertUrl'
  | 'assertUrlContains'
  | 'waitForLoadState'
  | 'waitForText'
  | 'waitForTextGone'
  | 'wait'
  | 'screenshot';

export type ElementRole = 'button' | 'link' | 'textbox' | 'checkbox' | 'text' | 'heading' | 'img';

export type LoadState = 'load' | 'domcontentloaded' | 'networkidle';

export interface NavigateAction {
  type: 'navigate';
  path: string;
}

export interface ClickAction {
  type: 'click';
  selector:
    | { kind: 'role'; role: ElementRole; name: string }
    | { kind: 'text'; text: string };
}

export interface FillAction {
  type: 'fill';
  label: string;
  value: string;
}

export interface AssertTextVisibleAction {
  type: 'assertTextVisible';
  text: string;
}

export interface AssertTextNotVisibleAction {
  type: 'assertTextNotVisible';
  text: string;
}

export interface AssertElementVisibleAction {
  type: 'assertElementVisible';
  role: ElementRole;
  name: string;
}

export interface AssertElementNotVisibleAction {
  type: 'assertElementNotVisible';
  role: ElementRole;
  name: string;
}

export interface AssertUrlAction {
  type: 'assertUrl';
  path: string;
}

export interface AssertUrlContainsAction {
  type: 'assertUrlContains';
  substring: string;
}

export interface WaitForLoadStateAction {
  type: 'waitForLoadState';
  state: LoadState;
}

export interface WaitForTextAction {
  type: 'waitForText';
  text: string;
}

export interface WaitForTextGoneAction {
  type: 'waitForTextGone';
  text: string;
}

export interface WaitAction {
  type: 'wait';
  ms: number;
}

export interface ScreenshotAction {
  type: 'screenshot';
  name: string;
}

export type Action =
  | NavigateAction
  | ClickAction
  | FillAction
  | AssertTextVisibleAction
  | AssertTextNotVisibleAction
  | AssertElementVisibleAction
  | AssertElementNotVisibleAction
  | AssertUrlAction
  | AssertUrlContainsAction
  | WaitForLoadStateAction
  | WaitForTextAction
  | WaitForTextGoneAction
  | WaitAction
  | ScreenshotAction;

/**
 * Parse a single action line into an Action object
 */
export function parseAction(line: string): Action {
  // Remove leading "- " if present (markdown list item)
  const trimmed = line.replace(/^-\s*/, '').trim();

  // Match action: argument pattern
  const match = trimmed.match(/^(\w+):\s*(.+)$/);
  if (!match) {
    throw new Error(`Invalid action syntax: ${line}`);
  }

  const [, actionType, argument] = match;

  switch (actionType) {
    case 'navigate':
      return { type: 'navigate', path: argument.trim() };

    case 'click':
      return parseClickAction(argument);

    case 'fill':
      return parseFillAction(argument);

    case 'assertTextVisible':
      return { type: 'assertTextVisible', text: argument.trim() };

    case 'assertTextNotVisible':
      return { type: 'assertTextNotVisible', text: argument.trim() };

    case 'assertElementVisible':
      return parseElementAssertAction(argument, 'assertElementVisible');

    case 'assertElementNotVisible':
      return parseElementAssertAction(argument, 'assertElementNotVisible');

    case 'assertUrl':
      return { type: 'assertUrl', path: argument.trim() };

    case 'assertUrlContains':
      return { type: 'assertUrlContains', substring: argument.trim() };

    case 'waitForLoadState':
      return parseWaitForLoadStateAction(argument);

    case 'waitForText':
      return { type: 'waitForText', text: argument.trim() };

    case 'waitForTextGone':
      return { type: 'waitForTextGone', text: argument.trim() };

    case 'wait':
      return { type: 'wait', ms: parseInt(argument.trim(), 10) };

    case 'screenshot':
      return { type: 'screenshot', name: argument.trim() };

    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

/**
 * Parse a click action: `button "Label"` or `link "Label"` or `text "Label"`
 */
function parseClickAction(argument: string): ClickAction {
  // Match: role "label" pattern
  const roleMatch = argument.match(/^(button|link|textbox|checkbox|heading|img)\s+"([^"]+)"$/);
  if (roleMatch) {
    const [, role, name] = roleMatch;
    return {
      type: 'click',
      selector: { kind: 'role', role: role as ElementRole, name },
    };
  }

  // Match: text "label" pattern
  const textMatch = argument.match(/^text\s+"([^"]+)"$/);
  if (textMatch) {
    const [, text] = textMatch;
    return {
      type: 'click',
      selector: { kind: 'text', text },
    };
  }

  throw new Error(`Invalid click syntax: ${argument}. Expected: button "Label" or link "Label" or text "Label"`);
}

/**
 * Parse a fill action: `"Field Label" = "value"`
 */
function parseFillAction(argument: string): FillAction {
  const match = argument.match(/^"([^"]+)"\s*=\s*"([^"]*)"$/);
  if (!match) {
    throw new Error(`Invalid fill syntax: ${argument}. Expected: "Field Label" = "value"`);
  }

  const [, label, value] = match;
  return { type: 'fill', label, value };
}

/**
 * Parse element assertion: `button "Label"` or similar
 */
function parseElementAssertAction(
  argument: string,
  type: 'assertElementVisible' | 'assertElementNotVisible',
): AssertElementVisibleAction | AssertElementNotVisibleAction {
  const match = argument.match(/^(button|link|textbox|checkbox|heading|img)\s+"([^"]+)"$/);
  if (!match) {
    throw new Error(`Invalid element assertion syntax: ${argument}. Expected: role "Label"`);
  }

  const [, role, name] = match;
  return { type, role: role as ElementRole, name };
}

/**
 * Parse waitForLoadState action
 */
function parseWaitForLoadStateAction(argument: string): WaitForLoadStateAction {
  const state = argument.trim();
  if (state !== 'load' && state !== 'domcontentloaded' && state !== 'networkidle') {
    throw new Error(`Invalid load state: ${state}. Expected: load, domcontentloaded, or networkidle`);
  }
  return { type: 'waitForLoadState', state };
}

/**
 * Parse multiple action lines into an array of Actions
 */
export function parseActions(lines: string[]): Action[] {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#')) // Skip empty lines and comments
    .map(parseAction);
}

/**
 * Extract actions from a checklist section
 *
 * Looks for `**Actions:**` followed by a list of actions
 */
export function extractActionsFromSection(content: string): Action[] {
  // Find the **Actions:** section
  const actionsMatch = content.match(/\*\*Actions:\*\*\s*([\s\S]*?)(?=\n\*\*|\n###|$)/);
  if (!actionsMatch) {
    return [];
  }

  const actionsBlock = actionsMatch[1];

  // Extract list items (lines starting with -)
  const lines = actionsBlock
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'));

  return parseActions(lines);
}
