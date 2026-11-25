import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly logo: Locator;
  private readonly faqsLink: Locator;
  private readonly claimsLink: Locator;
  private readonly aboutUsLink: Locator;
  private readonly contactUsLink: Locator;
  private readonly blogLink: Locator;
  private readonly startQuoteButton: Locator;
  private readonly heroHeading: Locator;
  private readonly heroSubtext: Locator;
  // Nav links matched anywhere on the page (not just the visible desktop
  // header): on smaller widths they render inside a collapsed menu, where
  // they are attached to the DOM but not visible.
  private readonly faqsLinkAttached: Locator;
  private readonly claimsLinkAttached: Locator;
  private readonly aboutUsLinkAttached: Locator;
  private readonly contactUsLinkAttached: Locator;
  private readonly petDetailsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator('[class*="mobile-header"]').getByAltText('Insureyourpaws');
    this.faqsLink = page.locator('header').getByTestId('faqs_lnk').first();
    this.claimsLink = page.locator('header').getByTestId('claims_lnk').first();
    this.aboutUsLink = page.locator('header').getByTestId('about_us_lnk').first();
    this.contactUsLink = page.locator('header').getByTestId('contact_us_lnk').first();
    this.blogLink = page.locator('header').getByRole('listitem').filter({ hasText: 'Blog' });
    this.startQuoteButton = page.getByTestId('start_your_quote1_btn');
    this.heroHeading = page.locator('[class="main-banner-title"]');
    this.heroSubtext = page.locator('[class="main-banner-tagline"]');
    this.faqsLinkAttached = page.getByTestId('faqs_lnk').first();
    this.claimsLinkAttached = page.getByTestId('claims_lnk').first();
    this.aboutUsLinkAttached = page.getByTestId('about_us_lnk').first();
    this.contactUsLinkAttached = page.getByTestId('contact_us_lnk').first();
    this.petDetailsHeading = page.getByRole('heading', { name: 'Tell us about your pet' });
  }

  async goto() {
    await this.navigate('/');
  }

  async isLogoVisible(): Promise<boolean> {
    return await this.logo.isVisible();
  }

  async isFaqsLinkVisible(): Promise<boolean> {
    return await this.faqsLink.isVisible();
  }

  async isClaimsLinkVisible(): Promise<boolean> {
    return await this.claimsLink.isVisible();
  }

  async isAboutUsLinkVisible(): Promise<boolean> {
    return await this.aboutUsLink.isVisible();
  }

  async isContactUsLinkVisible(): Promise<boolean> {
    return await this.contactUsLink.isVisible();
  }

  async isBlogLinkVisible(): Promise<boolean> {
    return await this.blogLink.isVisible();
  }

  async verifyNavigationLinksVisible(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.startQuoteButton).toBeVisible();
    // Primary nav links use data-id; they may render in a collapsible header on smaller widths.
    await expect(this.faqsLinkAttached).toBeAttached();
    await expect(this.claimsLinkAttached).toBeAttached();
    await expect(this.aboutUsLinkAttached).toBeAttached();
    await expect(this.contactUsLinkAttached).toBeAttached();
    const desktopNavVisible = await this.faqsLink.isVisible().catch(() => false);
    if (desktopNavVisible) {
      await expect(this.faqsLink).toBeVisible();
      await expect(this.claimsLink).toBeVisible();
      await expect(this.aboutUsLink).toBeVisible();
      await expect(this.contactUsLink).toBeVisible();
      await expect(this.blogLink).toBeVisible();
    }
  }

  async verifyHeroSectionVisible(): Promise<void> {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.heroHeading).not.toBeEmpty();
    await expect(this.heroSubtext).toBeVisible();
  }

  async clickStartQuote() {
    // Clear any late-injected OneTrust overlay right before clicking so it can't
    // intercept the pointer event (a common source of flakiness under load).
    await this.dismissCookieOverlay();
    await this.startQuoteButton.click();
    await this.petDetailsHeading.waitFor({ state: 'visible', timeout: 30000 });
  }

  async clickFaqsLink() {
    await this.faqsLink.click();
  }

  async clickBlogLink() {
    await this.blogLink.click();
  }

  async getHeroHeadingText(): Promise<string> {
    return await this.heroHeading.textContent() || '';
  }

  async getHeroSubtextText(): Promise<string> {
    return await this.heroSubtext.textContent() || '';
  }
}
