import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page object for the marketing/content site around the quote funnel:
 * route health (header, footer, images, links), FAQ, blog, refer page,
 * customer login, policy documents and the cookie banner.
 */
export class ContentPage extends BasePage {
  private readonly siteHeader: Locator;
  private readonly siteFooter: Locator;
  private readonly cookieBanner: Locator;
  private readonly rejectAllCookiesButton: Locator;
  private readonly faqQuestions: Locator;
  private readonly faqAnswers: Locator;
  private readonly expandedFaqAnswer: Locator;
  private readonly blogPostLinks: Locator;
  private readonly articleHeading: Locator;
  private readonly mentionMeEmbed: Locator;
  private readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.siteHeader = page.locator('header').first();
    this.siteFooter = page.locator('footer').first();
    this.cookieBanner = page.locator('#onetrust-banner-sdk');
    this.rejectAllCookiesButton = page.getByRole('button', { name: 'Reject All' });
    this.faqQuestions = page.locator('.faq-collapse');
    this.faqAnswers = page.locator('.faq-list .collapse');
    this.expandedFaqAnswer = page.locator('.collapse.show');
    this.blogPostLinks = page.locator('a[href*="/blog/"]');
    this.articleHeading = page.locator('h1').first();
    this.mentionMeEmbed = page.locator('iframe[src*="mention-me"]');
    this.loginLink = page.getByRole('link', { name: /log ?in/i }).first();
  }

  /** Navigates to a content route with a generous timeout (staging can serve marketing pages slowly) and returns the response status. */
  async openRoute(path: string): Promise<number> {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return response?.status() ?? 0;
  }

  async verifyPageHeading(heading: string, message?: string) {
    await expect(
      this.page.getByRole('heading', { name: heading }).first(),
      message,
    ).toBeVisible({ timeout: 15000 });
  }

  async verifyHeaderAndFooterVisible(path: string) {
    await expect(this.siteHeader, `${path} should render the site header`).toBeVisible();
    await expect(this.siteFooter, `${path} should render the site footer`).toBeVisible();
  }

  /**
   * Fails if any image on the page finished loading with zero natural width
   * (404, bad src, ...). Lazy images below the fold haven't loaded yet
   * (complete=false) and are skipped rather than reported as broken.
   */
  async verifyNoBrokenImages(path: string) {
    const brokenImages = await this.page.$$eval('img', (imgs) =>
      (imgs as HTMLImageElement[])
        .filter((img) => img.getAttribute('src'))
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.src),
    );
    expect(brokenImages, `${path} should have no broken images`).toEqual([]);
  }

  /** Returns every unique same-origin link URL on the current page (hash fragments stripped). */
  async getInternalLinkUrls(): Promise<string[]> {
    return await this.page.$$eval('a[href]', (anchors) =>
      Array.from(
        new Set(
          (anchors as HTMLAnchorElement[])
            .map((a) => a.href.split('#')[0])
            .filter((href) => href.startsWith(location.origin)),
        ),
      ),
    );
  }

  /** Requests the URL (HEAD with GET fallback) and asserts a non-error status. */
  async verifyLinkReachable(url: string, sourcePath: string) {
    let status = (await this.page.request.head(url).catch(() => null))?.status() ?? 0;
    if (status === 0 || status === 405) {
      status = (await this.page.request.get(url)).status();
    }
    expect(status, `${url} (linked from ${sourcePath}) should be reachable`).toBeLessThan(400);
  }

  async verifyFooterLinkPresent(href: string) {
    await expect(
      this.page.locator(`a[href="${href}"]`).first(),
      `Footer should link to ${href}`,
    ).toBeAttached();
  }

  /** Opens the mobile/hamburger nav when header links are collapsed. */
  async openHeaderNavIfCollapsed(linkTestId: string) {
    const link = this.siteHeader.getByTestId(linkTestId).first();
    if (await link.isVisible().catch(() => false)) {
      return;
    }
    const menuToggle = this.siteHeader
      .getByRole('button', { name: /menu|toggle|navigation/i })
      .or(this.siteHeader.locator('button.navbar-toggler, [aria-label*="menu" i], .hamburger, .menu-toggle'))
      .first();
    await expect(menuToggle, 'Header menu toggle should be available when nav is collapsed').toBeVisible();
    await menuToggle.click();
    await expect(link).toBeVisible({ timeout: 10000 });
  }

  /** Clicks a header navigation link and verifies it lands on the expected URL. */
  async navigateViaHeaderLink(testId: string, name: string, urlPart: string) {
    await this.openHeaderNavIfCollapsed(testId);
    await this.siteHeader.getByTestId(testId).first().click();
    await expect(
      this.page,
      `Header "${name}" should navigate to ${urlPart}`,
    ).toHaveURL(new RegExp(urlPart), { timeout: 20000 });
  }

  // --- FAQ ---

  async verifyFirstFaqExpandedByDefault() {
    await expect(this.faqQuestions.first()).toBeVisible();
    await expect(this.expandedFaqAnswer.first()).toBeVisible();
  }

  async expandSecondFaqAndVerifyAnswer() {
    const secondQuestion = this.faqQuestions.nth(1);
    const secondAnswer = this.faqAnswers.nth(1);
    await expect(secondAnswer).not.toHaveClass(/show/);
    await secondQuestion.click();
    await expect(secondAnswer).toHaveClass(/show/, { timeout: 10000 });
  }

  // --- Blog ---

  async openFirstBlogPost() {
    const firstPost = this.blogPostLinks.first();
    await expect(firstPost).toBeVisible();
    await firstPost.click();
    await expect(this.page).toHaveURL(/\/blog\/.+/, { timeout: 20000 });
  }

  async verifyArticleRendered() {
    await this.verifyNoApplicationError();
    await expect(this.articleHeading).toBeVisible({ timeout: 15000 });
    const heading = (await this.articleHeading.textContent())?.trim() || '';
    expect(heading.length, 'Article should have a real title').toBeGreaterThan(5);
  }

  // --- Refer a friend ---

  async verifyMentionMeEmbedAttached() {
    await expect(this.mentionMeEmbed).toBeAttached({ timeout: 20000 });
  }

  // --- Customer login ---

  /** Verifies the Log in link points at the YourPolicy portal and returns its URL. */
  async getLoginPortalUrl(): Promise<string> {
    await expect(this.loginLink).toBeVisible();
    const portalUrl = (await this.loginLink.getAttribute('href')) || '';
    expect(portalUrl, 'Log in should link to the YourPolicy portal').toMatch(/YourPolicy/i);
    return portalUrl;
  }

  async verifyUrlReachable(url: string) {
    const response = await this.page.request.get(url);
    expect(response.status(), `${url} should be reachable`).toBeLessThan(400);
  }

  // --- Policy documents ---

  /** Returns every unique PDF link URL on the current page. */
  async getPdfLinkUrls(): Promise<string[]> {
    return await this.page.$$eval('a[href$=".pdf"]', (anchors) =>
      Array.from(new Set(anchors.map((a) => (a as HTMLAnchorElement).href))),
    );
  }

  async verifyPdfServed(url: string) {
    const response = await this.page.request.head(url);
    expect(response.status(), `${url} should be reachable`).toBeLessThan(400);
    expect(
      response.headers()['content-type'],
      `${url} should be served as a PDF`,
    ).toContain('pdf');
  }

  // --- Cookie consent ---

  /** Explicitly rejects cookies via the banner (fails if the banner never shows, unlike BasePage.rejectCookies). */
  async rejectCookiesViaBanner() {
    await this.rejectAllCookiesButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.rejectAllCookiesButton.click();
    await expect(this.cookieBanner).not.toBeVisible();
  }

  async verifyCookieBannerNotVisible() {
    await expect(this.cookieBanner).not.toBeVisible();
  }
}
