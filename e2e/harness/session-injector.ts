/**
 * Session Injector - Inject authenticated test sessions into browser
 *
 * This module handles authentication for QA automation by:
 * 1. Calling the test session API endpoint
 * 2. Injecting the session data into browser localStorage
 * 3. Reloading the page to pick up the authenticated state
 */

import type { Page } from '@playwright/test';

interface TestSessionResponse {
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: 'bearer';
    user: {
      id: string;
      email: string;
      user_metadata: Record<string, unknown>;
    };
  };
  storageKey: string;
  storageData: Record<string, unknown>;
}

interface TestSessionError {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Build the API URL for the test session endpoint
 *
 * @param previewUrl - The preview URL (web app)
 * @param apiUrl - Optional separate API URL (e.g., Railway)
 */
function getTestSessionUrl(previewUrl: string, apiUrl?: string): string {
  if (apiUrl) {
    // Use separate API URL (e.g., Railway)
    const url = new URL(apiUrl);
    return `${url.origin}/api/test/session`;
  }
  // Fallback: API on same host as preview
  const url = new URL(previewUrl);
  return `${url.origin}/api/test/session`;
}

/**
 * Inject an authenticated test session into the browser
 *
 * @param page - Playwright page instance
 * @param previewUrl - The preview URL to authenticate against
 * @param options - Configuration options
 * @param options.bypassToken - Optional Vercel protection bypass token
 * @param options.apiUrl - Optional separate API URL (e.g., Railway)
 * @returns The test user's email for logging
 * @throws Error if session creation or injection fails
 */
export async function injectTestSession(
  page: Page,
  previewUrl: string,
  options: { bypassToken?: string; apiUrl?: string } = {},
): Promise<string> {
  const { bypassToken, apiUrl } = options;
  const sessionUrl = getTestSessionUrl(previewUrl, apiUrl);

  // Prepare headers for the API request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add bypass token if provided (for Vercel deployment protection)
  if (bypassToken) {
    headers['x-vercel-protection-bypass'] = bypassToken;
  }

  // Create the test session via API
  const response = await fetch(sessionUrl, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as TestSessionError;
    throw new Error(
      `Failed to create test session: ${errorBody.error?.message ?? response.statusText}`,
    );
  }

  const data = (await response.json()) as TestSessionResponse;

  // Navigate to the preview URL first (required for localStorage access)
  // We navigate to a simple page that will load quickly
  const targetUrl = new URL(previewUrl);

  // If bypass token is provided, add it as a cookie or header
  if (bypassToken) {
    // Add the bypass token as a header for all requests
    await page.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': bypassToken,
    });
  }

  // Navigate to the target origin
  await page.goto(targetUrl.origin, { waitUntil: 'domcontentloaded' });

  // Inject session data into localStorage
  await page.evaluate(
    ({ storageKey, storageData }) => {
      localStorage.setItem(storageKey, JSON.stringify(storageData));
    },
    { storageKey: data.storageKey, storageData: data.storageData },
  );

  // Reload to pick up the session
  await page.reload({ waitUntil: 'networkidle' });

  // Return the test user's email for logging
  return data.session.user.email;
}

/**
 * Check if the test session endpoint is available
 *
 * @param previewUrl - The preview URL to check
 * @param options - Configuration options
 * @param options.bypassToken - Optional Vercel protection bypass token
 * @param options.apiUrl - Optional separate API URL (e.g., Railway)
 * @returns Whether the endpoint is available
 */
export async function isTestSessionAvailable(
  previewUrl: string,
  options: { bypassToken?: string; apiUrl?: string } = {},
): Promise<boolean> {
  const { bypassToken, apiUrl } = options;
  const sessionUrl = getTestSessionUrl(previewUrl, apiUrl);

  const headers: Record<string, string> = {};
  if (bypassToken) {
    headers['x-vercel-protection-bypass'] = bypassToken;
  }

  try {
    const response = await fetch(sessionUrl, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const data = (await response.json()) as { available: boolean };
      return data.available === true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Clear the test session from the browser
 *
 * @param page - Playwright page instance
 * @param previewUrl - The preview URL (for storage key extraction)
 */
export async function clearTestSession(page: Page, previewUrl: string): Promise<void> {
  // Extract project ref from URL to build storage key
  const url = new URL(previewUrl);

  // Clear all Supabase auth-related localStorage items
  await page.evaluate(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  });
}
