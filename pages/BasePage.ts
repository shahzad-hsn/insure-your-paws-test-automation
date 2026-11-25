import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;
  protected readonly loaderGif: Locator;
  private readonly pageBody: Locator;
  private readonly journeyStepNav: Locator;
  private readonly rejectCookiesButton: Locator;
  private readonly cookieDarkFilter: Locator;

  private static readonly APPLICATION_ERROR_TEXT = 'Unexpected Application Error';

  constructor(page: Page) {
    this.page = page;
    this.loaderGif = page.getByAltText('LoaderGif');
    this.pageBody = page.locator('body');
    this.journeyStepNav = page.locator('.activeNav').first();
    this.rejectCookiesButton = page.getByRole('button', { name: 'Reject All' });
    this.cookieDarkFilter = page.locator('.onetrust-pc-dark-filter');
  }

  /**
   * Locator factory for the journey step indicator ("Your pet", "Quote",
   * "Summary", "Pay"). Centralised here because every journey page object
   * needs its own step plus its neighbours' for navigation assertions.
   */
  protected journeyStepIndicator(stepName: string): Locator {
    return this.page.locator('.activeNav').filter({ hasText: stepName });
  }

  async waitForLoaderToDisappear() {
    // 60s cap: slow staging operations (repricing, GoCardless billing request
    // creation) regularly keep the loader up well past 30s.
    if (await this.loaderGif.isVisible().catch(() => false)) {
      await expect(this.loaderGif).not.toBeVisible({ timeout: 60000 });
      return;
    }
    try {
      await this.loaderGif.waitFor({ state: 'visible', timeout: 3000 });
      await expect(this.loaderGif).not.toBeVisible({ timeout: 60000 });
    } catch {
      // Loader never appeared — page is already ready.
    }
  }

  async navigate(url: string) {
    // Wait for DOMContentLoaded rather than the full 'load' event: this site
    // pulls in heavy third-party assets/trackers that can keep 'load' pending
    // well past 30s under load, causing spurious navigation timeouts. The DOM
    // is interactive far earlier, and subsequent steps wait on their own
    // elements, so this is both faster and more reliable.
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /** The SPA renders a client-side error boundary instead of a page when a route fails. */
  async verifyNoApplicationError() {
    await expect(this.pageBody).not.toContainText(BasePage.APPLICATION_ERROR_TEXT);
  }

  /** Verifies the journey step navigation is rendered (the user is inside the funnel, whatever the step). */
  async verifyJourneyStepNavVisible() {
    await expect(this.journeyStepNav).toBeVisible({ timeout: 20000 });
  }

  async verifyUrlMatches(pattern: RegExp, timeout = 20000) {
    await expect(this.page).toHaveURL(pattern, { timeout });
  }

  // Returns a date in the past relative to today as zero-padded day/month/year
  // strings, so tests never rely on hard-coded (and eventually stale) dates.
  getPastDate(yearsAgo: number, monthsAgo = 0, daysAgo = 0): { day: string; month: string; year: string } {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(date.getDate() - daysAgo);
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      year: String(date.getFullYear()),
    };
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async rejectCookies() {
    try {
      await this.rejectCookiesButton.waitFor({ state: 'visible', timeout: 8000 });
      await this.rejectCookiesButton.click();
    } catch {
      // Banner not found or already dismissed
    }
    await this.dismissCookieOverlay();
  }

  /**
   * Removes the OneTrust consent SDK and its click-blocking dark-filter overlay.
   * OneTrust can inject/refresh this overlay late (especially under load), after
   * rejectCookies() has already run, and the overlay then intercepts pointer
   * events on the next click. This is idempotent and safe to call just before an
   * interaction to guarantee the overlay can't swallow the click.
   */
  async dismissCookieOverlay() {
    await this.page.evaluate(() => {
      document.getElementById('onetrust-consent-sdk')?.remove();
      document.querySelector('.onetrust-pc-dark-filter')?.remove();
    });
    await expect(this.cookieDarkFilter).toHaveCount(0);
  }
}
