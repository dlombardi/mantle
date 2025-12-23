/**
 * Base Page Object Model class.
 *
 * Provides common functionality for all page objects.
 */

import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to this page.
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for the page to be fully loaded.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the current page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get the current URL.
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Take a screenshot for debugging.
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}
