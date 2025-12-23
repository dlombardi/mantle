/**
 * Home Page Object Model.
 *
 * Represents the home/landing page of the application.
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Locators
  readonly heading: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.mainContent = page.getByRole('main');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/');
  }
}
