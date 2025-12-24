/**
 * Seed Preview - Load test data scenarios into preview deployments
 *
 * Calls the seed API endpoint on the preview to reset and
 * populate with test data for QA verification.
 */

export interface SeedConfig {
  /** Vercel preview deployment URL */
  previewUrl: string;
  /** Scenario name to load */
  scenario: string;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Vercel deployment protection bypass token */
  bypassToken?: string;
}

export interface SeedResult {
  success: boolean;
  scenario: string;
  error?: string;
  duration: number;
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
 * Seed the preview deployment with test data
 */
export async function seedPreview(config: SeedConfig): Promise<SeedResult> {
  const start = Date.now();
  const timeout = config.timeout ?? 30000;
  const seedUrl = applyBypassToken(`${config.previewUrl}/api/seed`, config.bypassToken);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(seedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario: config.scenario }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        scenario: config.scenario,
        error: `Seed endpoint returned ${response.status}: ${errorText}`,
        duration: Date.now() - start,
      };
    }

    return {
      success: true,
      scenario: config.scenario,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      scenario: config.scenario,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    };
  }
}

/**
 * Check if the seed endpoint is available
 */
export async function checkSeedEndpoint(previewUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${previewUrl}/api/seed`, {
      method: 'OPTIONS',
    });
    return response.ok || response.status === 405; // 405 = Method Not Allowed (endpoint exists)
  } catch {
    return false;
  }
}

/**
 * Reset the preview to clean state (no scenario data)
 */
export async function resetPreview(previewUrl: string): Promise<SeedResult> {
  return seedPreview({
    previewUrl,
    scenario: 'empty-repo',
  });
}
