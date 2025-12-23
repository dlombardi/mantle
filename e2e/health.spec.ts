/**
 * E2E tests for health checks and basic connectivity.
 *
 * Verifies that both the web and API servers are running
 * and can communicate with each other.
 */

import { test, expect } from '@playwright/test';

test.describe('Health Checks', () => {
  test('API health endpoint is accessible', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/live');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('Web app loads successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page loaded (adjust selector based on actual app content)
    await expect(page).toHaveTitle(/Mantle|Reasoning Substrate/i);
  });

  test('API proxy works from web app', async ({ page }) => {
    await page.goto('/');

    // Test that the web app can reach the API through the Vite proxy
    const response = await page.request.get('/api/health/live');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
  });
});

test.describe('Navigation', () => {
  test('home page renders without errors', async ({ page }) => {
    await page.goto('/');

    // Check for no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for initial render
    await page.waitForLoadState('networkidle');

    // Filter out expected errors (like missing env vars in test)
    const unexpectedErrors = errors.filter(
      (e) => !e.includes('Supabase') && !e.includes('environment'),
    );

    expect(unexpectedErrors).toHaveLength(0);
  });
});
