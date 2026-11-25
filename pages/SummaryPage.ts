import { Page, Locator, expect, type Route } from '@playwright/test';
import { BasePage } from './BasePage';
import petData from '../data/petsData.json';

export class SummaryPage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly stepIndicator: Locator;
  private readonly editPetDetailsLink: Locator; 
  private readonly editOptionalExtrasLink: Locator;
  private readonly editCoverDetailsLink: Locator;
  
  private readonly coverLevel: Locator;
  private readonly coverStartDate: Locator;
  private readonly petName: Locator;
  private readonly breed: Locator;
  private readonly dob: Locator;
  private readonly vetFeesLimit: Locator;
  private readonly excess: Locator;
  private readonly voluntaryExcess: Locator;
  
  private readonly findMyPetStatus: Locator;
  private readonly sayingGoodbyeStatus: Locator;
  private readonly awayFromHomeStatus: Locator;
  
  private readonly monthlyPrice: Locator;
  private readonly policyDocumentsLink: Locator;
  private readonly benefitsExclusionsButton: Locator;
  private readonly helpButton: Locator;
  
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly mobileField: Locator;
  private readonly dobDayField: Locator;
  private readonly dobMonthField: Locator;
  private readonly dobYearField: Locator;
  
  private readonly marketingYesButton: Locator;
  private readonly marketingNoButton: Locator;
  
  private readonly agreeCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly nextButton: Locator;
  private readonly backLink: Locator;

  private readonly discountCodeButton: Locator;
  private readonly discountCodeInput: Locator;
  private readonly discountApplyButton: Locator;
  private readonly invalidDiscountCodeError: Locator;
  private readonly discountAppliedMessage: Locator;
  private readonly discountAppliedAmount: Locator;
  private readonly discountAppliedRow: Locator;
  private readonly termsAgreementError: Locator;
  // Journey step indicators for navigation assertions
  private readonly paymentStepIndicator: Locator;
  private readonly quoteStepIndicator: Locator;
  private readonly petDetailsStepIndicator: Locator;
  // Policy documents dropdown
  private readonly policyWordingLink: Locator;
  private readonly ipidLink: Locator;
  // Sections
  private readonly optionalExtrasHeading: Locator;
  // Field validation errors (texts owned by data/petsData.json)
  private readonly firstNameError: Locator;
  private readonly lastNameError: Locator;
  private readonly emailError: Locator;
  private readonly emailFormatError: Locator;
  private readonly mobileError: Locator;
  private readonly mobileFormatError: Locator;
  private readonly dobError: Locator;
  private readonly dobInvalidError: Locator;
  private readonly dobInvalidFormatError: Locator;
  private readonly dobFutureError: Locator;
  // Benefits & exclusions section
  private readonly benefitsHeading: Locator;
  private readonly benefitsDescription: Locator;
  private readonly benefitsReferenceText: Locator;
  private readonly whatsCoveredHeading: Locator;
  private readonly whatsCoveredItems: Locator[];
  private readonly whatsNotCoveredHeading: Locator;
  private readonly whatsNotCoveredItems: Locator[];
  private readonly benefitsHeadingExact: Locator;
  // Help popup
  private readonly helpPopup: Locator;
  private readonly helpPopupHeading: Locator;
  private readonly helpPhoneLink: Locator;
  private readonly helpEmailLink: Locator;
  private readonly helpWeekdaysLabel: Locator;
  private readonly helpWeekdaysTime: Locator;
  private readonly helpSaturdayLabel: Locator;
  private readonly helpSundayLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Summary of cover' });
    this.stepIndicator = page.locator('.activeNav').filter({ hasText: 'Summary' });
    
    this.editPetDetailsLink = page.getByTestId('edit_pet_details_btn');
    this.editCoverDetailsLink = page.getByRole('button').filter({has: page.getByText('Edit', { exact: true })}).first();
    this.editOptionalExtrasLink = page.getByRole('heading', { name: 'Optional extras' }).locator(' +button').filter({hasText: "Edit"}).first(); 
     
    this.coverLevel = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Cover Level'})}).last().locator('.info-desc').first();
    this.coverStartDate = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Cover Start Date'})}).last().locator('.info-desc').first();
    this.petName = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Pet name:'})}).last().locator('.info-desc').first();
    this.breed = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Breed'})}).last().locator('.info-desc').first();
    this.dob = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'DOB'})}).last().locator('.info-desc').first();
    this.vetFeesLimit = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Chosen vet fee limit'})}).last().locator('.info-desc').first();
    this.excess = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Chosen excess amount'})}).last().locator('.info-desc').first();
    this.voluntaryExcess = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Your share of the vet bill'})}).last().locator('.info-desc').first();
       
    this.findMyPetStatus = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Find My Pet'})}).last().locator('.info-desc').first();
    this.sayingGoodbyeStatus = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Saying Goodbye'})}).last().locator('.info-desc').first();
    this.awayFromHomeStatus = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Away From Home'})}).last().locator('.info-desc').first();
    
    this.monthlyPrice = page.locator('div').filter({has: page.getByRole('heading').filter({hasText: 'Total Monthly Price'})}).last().locator('.info-desc').first();
    this.policyDocumentsLink = page.getByTestId('policy_documents_btn');
    this.benefitsExclusionsButton = page.getByTestId('summary_benefits_exclusions_btn');
    this.helpButton = page.getByRole('button', { name: 'Help' });
    
    this.firstNameField = page.getByPlaceholder('Enter first name');
    this.lastNameField = page.getByPlaceholder('Enter last name');
    this.emailField = page.getByPlaceholder('Enter email address');
    this.mobileField = page.getByPlaceholder('Enter mobile number');
    this.dobDayField = page.locator('[name="DOBInsurer-0"]').first();
    this.dobMonthField = page.getByPlaceholder('MM').first();
    this.dobYearField = page.getByPlaceholder('YYYY').first();
    
    this.marketingYesButton = page.getByRole('button', { name: 'Yes' });
    this.marketingNoButton = page.getByRole('button', { name: 'No' });
    
    this.agreeCheckbox = page.getByTestId('assumptions_btn');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    // Rendered as a <button>, not an anchor, on the summary step.
    this.backLink = page.getByRole('button', { name: 'Back' });

    this.discountCodeButton = page.getByTestId('discount_code_btn');
    this.discountCodeInput = page.getByPlaceholder('Enter discount code');
    this.discountApplyButton = page.getByRole('button', { name: /apply/i }).first();
    this.invalidDiscountCodeError = page.getByText(petData.errorMessages.summary.invalidDiscountCode);
    // Price Summary splits the label and amount across sibling nodes, e.g.
    // heading "30% discount code applied" + "-£0.00".
    this.discountAppliedMessage = page
      .getByRole('heading', { name: new RegExp(petData.summaryData.discountAppliedMessageContains, 'i') })
      .first();
    // Same row pattern as Total Monthly Price: heading + .info-desc amount.
    this.discountAppliedRow = page
      .locator('div')
      .filter({ has: this.discountAppliedMessage })
      .last();
    this.discountAppliedAmount = this.discountAppliedRow.locator('.info-desc').first();
    this.termsAgreementError = page.getByText(petData.errorMessages.summary.agreement);

    this.paymentStepIndicator = this.journeyStepIndicator('Pay');
    this.quoteStepIndicator = this.journeyStepIndicator('Quote');
    this.petDetailsStepIndicator = this.journeyStepIndicator('Your pet');

    this.policyWordingLink = page.getByRole('link', { name: 'Policy Wording' });
    this.ipidLink = page.getByRole('link', { name: 'IPID' });

    this.optionalExtrasHeading = page.getByRole('heading', { name: 'Choose your optional extras' });

    this.firstNameError = page.getByText(petData.errorMessages.summary.firstName);
    this.lastNameError = page.getByText(petData.errorMessages.summary.lastName);
    this.emailError = page.getByText(petData.errorMessages.summary.email);
    this.emailFormatError = page.getByText(petData.errorMessages.summary.emailFormat);
    this.mobileError = page.getByText(petData.errorMessages.summary.mobile);
    this.mobileFormatError = page.getByText(petData.errorMessages.summary.mobileFormat);
    this.dobError = page.getByText(petData.errorMessages.summary.dob);
    this.dobInvalidError = page.getByText(petData.errorMessages.summary.dobInvalid);
    this.dobInvalidFormatError = page.getByText(petData.errorMessages.summary.dobInvalidFormat);
    this.dobFutureError = page.getByText(petData.errorMessages.summary.dobFuture);

    this.benefitsHeading = page.getByRole('heading').filter({ hasText: petData.benefitsExclusions.heading });
    this.benefitsHeadingExact = page.getByRole('heading', { name: petData.benefitsExclusions.heading });
    this.benefitsDescription = page.getByText(petData.benefitsExclusions.description);
    this.benefitsReferenceText = page.getByText(petData.benefitsExclusions.referenceText);
    this.whatsCoveredHeading = page
      .getByRole('heading')
      .filter({ hasText: petData.benefitsExclusions.whatsCovered.heading });
    this.whatsCoveredItems = petData.benefitsExclusions.whatsCovered.items.map((item) => page.getByText(item));
    this.whatsNotCoveredHeading = page
      .getByRole('heading')
      .filter({ hasText: petData.benefitsExclusions.whatsNotCovered.heading });
    // The first two items ("Pre-existing conditions", "Routine annual health
    // checks") are substrings of longer sentences elsewhere on the page, so
    // they must be matched exactly; the rest are unique already.
    this.whatsNotCoveredItems = petData.benefitsExclusions.whatsNotCovered.items.map((item, index) =>
      page.getByText(item, { exact: index < 2 }),
    );

    this.helpPopup = page.locator('.dropdown-menu-wrapper');
    this.helpPopupHeading = page.getByRole('heading', { name: petData.helpPopup.heading });
    this.helpPhoneLink = page.getByRole('link', { name: petData.helpPopup.phone }).first();
    this.helpEmailLink = page.getByRole('link', { name: petData.helpPopup.email }).first();
    this.helpWeekdaysLabel = page.getByText(petData.helpPopup.openingHours.weekdays);
    this.helpWeekdaysTime = page.getByText(petData.helpPopup.openingHours.weekdaysTime);
    this.helpSaturdayLabel = page.getByText(petData.helpPopup.openingHours.saturday);
    this.helpSundayLabel = page.getByText(petData.helpPopup.openingHours.sunday);
  }

  async openDiscountCodePanel() {
    // Button toggles the panel — do not click again if the input is already open.
    if (await this.discountCodeInput.isVisible().catch(() => false)) {
      return;
    }
    await this.discountCodeButton.click();
    await expect(this.discountCodeInput).toBeVisible();
  }

  async applyDiscountCode(code: string) {
    await this.discountCodeInput.fill(code);
    await this.discountApplyButton.click();
  }

  /**
   * Clears an applied promotion (Excel iyp_16).
   * Prefers a real Remove/Clear control when present. Otherwise there is no
   * Remove UI — GetNewQuote clears the promo when PromotionCode is "".
   * Yup blocks an empty Apply field, so we type a short placeholder and
   * rewrite the next GetNewQuote body to PromotionCode: "" (never leave a
   * sentinel like __REMOVE_DISCOUNT__ in the field).
   */
  async removeDiscountCode() {
    const removeControl = this.page.getByRole('button', {
      name: /remove (discount|code)|clear (discount|code)/i,
    });
    if (await removeControl.count() > 0) {
      await expect(removeControl.first()).toBeVisible();
      await removeControl.first().click();
      return;
    }

    await this.openDiscountCodePanel();
    await expect(this.discountCodeInput).toBeVisible();
    await expect(this.discountApplyButton).toBeVisible();

    // One-shot: force the next GetNewQuote Apply to clear the promotion.
    let rewritten = false;
    const routeHandler = async (route: Route) => {
      const req = route.request();
      if (req.method() !== 'POST' || rewritten) {
        await route.continue();
        return;
      }
      let data: Record<string, unknown>;
      try {
        data = req.postDataJSON() as Record<string, unknown>;
      } catch {
        await route.continue();
        return;
      }
      rewritten = true;
      data.PromotionCode = '';
      await route.continue({ postData: JSON.stringify(data) });
    };

    await this.page.route(/getnewquote/i, routeHandler);
    try {
      // Placeholder only so Yup enables Apply — rewritten to "" on the wire.
      await this.discountCodeInput.fill('x');
      const responsePromise = this.page.waitForResponse(
        (r) => /getnewquote/i.test(r.url()) && r.request().method() === 'POST',
        { timeout: 20000 },
      );
      await this.discountApplyButton.click();
      const response = await responsePromise;
      await this.discountCodeInput.fill('');
      expect(response.ok(), 'GetNewQuote remove request must succeed').toBe(true);
      const body = await response.json();
      expect(body.Success, 'GetNewQuote Success must be true after remove').toBe(true);
      const summary = body.Data?.PromotionSummary;
      expect(
        summary == null || summary.Description == null || summary.Description === '',
        'PromotionSummary.Description must be cleared after remove',
      ).toBe(true);
      expect(summary?.Error ?? null, 'Remove must not surface an invalid-code error').toBeNull();
    } finally {
      await this.page.unroute(/getnewquote/i, routeHandler);
    }
  }

  async verifyInvalidDiscountCodeError() {
    await expect(this.invalidDiscountCodeError).toBeVisible({ timeout: 20000 });
  }

  async verifyDiscountCodeApplied() {
    await expect(this.discountAppliedMessage).toBeVisible({ timeout: 20000 });
    await expect(this.discountAppliedMessage).toContainText(
      petData.summaryData.discountAppliedMessageContains,
      { ignoreCase: true },
    );
    await expect(this.invalidDiscountCodeError).not.toBeVisible();
  }

  async verifyDiscountNotApplied() {
    await expect(this.discountAppliedMessage).toHaveCount(0, { timeout: 20000 });
    await expect(this.discountAppliedAmount).toHaveCount(0);
    await expect(this.invalidDiscountCodeError).not.toBeVisible();
    await expect(
      this.page.getByRole('heading', { name: /discount code applied/i }),
    ).toHaveCount(0);
  }

  /**
   * Full post-remove gate for iyp_16: no applied row, no invalid error,
   * monthly premium exactly matches the captured standard price.
   */
  async verifyDiscountRemovedAndStandardPrice(standardMonthlyPrice: number) {
    await this.verifyDiscountNotApplied();
    await this.verifyMonthlyPriceFormat();
    await this.verifyStepIndicatorActive();
    const priceAfterRemove = await this.getMonthlyPriceAmount();
    expect(priceAfterRemove).toBeGreaterThan(0);
    expect(
      priceAfterRemove,
      `Premium must return to standard £${standardMonthlyPrice.toFixed(2)} after discount remove`,
    ).toBe(standardMonthlyPrice);
    await this.verifyNextButtonVisible();
  }

  /**
   * Staging renders the applied discount as a Price Summary row:
   * heading "30% discount code applied" + sibling "-£0.00".
   */
  async verifyDiscountAppliedWithAmount() {
    await this.verifyDiscountCodeApplied();
    const applied = await this.getDiscountAppliedText();
    expect(applied).toMatch(/\d+%\s*discount code applied/i);
    await expect(this.discountAppliedAmount).toBeVisible();
    await expect(this.discountAppliedAmount).toHaveText(/-?£[\d,]+\.\d{2}/);
  }

  async getDiscountAppliedText(): Promise<string> {
    return (await this.discountAppliedMessage.textContent())?.trim() || '';
  }

  /** Parses the absolute £ amount from the applied-discount row (0 when absent). */
  async getDiscountMonetaryAmount(): Promise<number> {
    const amountText = (await this.discountAppliedAmount.textContent())?.trim() || '';
    const match = amountText.match(/£([\d,]+\.\d{2})/);
    if (!match) return 0;
    return parseFloat(match[1].replace(/,/g, '')) || 0;
  }

  /** Hard-assert Find My Pet / Saying Goodbye / Away From Home statuses match exactly. */
  async verifyOptionalExtraStatusesExact(
    findMyPet: string,
    sayingGoodbye: string,
    awayFromHome: string,
  ) {
    await expect(this.findMyPetStatus).toHaveText(findMyPet);
    await expect(this.sayingGoodbyeStatus).toHaveText(sayingGoodbye);
    await expect(this.awayFromHomeStatus).toHaveText(awayFromHome);
  }

  async verifyFindMyPetStatusExact(expectedStatus: string) {
    await expect(this.findMyPetStatus).toHaveText(expectedStatus);
  }

  async verifyMonthlyPriceFormat() {
    await expect(this.monthlyPrice).toHaveText(/£[\d,]+\.\d{2}/);
  }

  async verifyNextButtonVisible() {
    await expect(this.nextButton).toBeVisible();
  }

  async verifyTermsAgreementError() {
    await expect(this.termsAgreementError).toBeVisible();
  }

  async verifyStepIndicatorActive() {
    await expect(this.stepIndicator).toBeVisible();
  }

  async isPageHeadingVisible(): Promise<boolean> {
    try {
      await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async verifyPageHeading() {
    await expect(this.pageHeading).toBeVisible();
  }

  async getCoverLevel(): Promise<string> {
    return await this.coverLevel.textContent() || '';
  }

  async getCoverStartDate(): Promise<string> {
    return await this.coverStartDate.textContent() || '';
  }

  async getPetName(): Promise<string> {
    return await this.petName.textContent() || '';
  }

  async getBreed(): Promise<string> {
    return await this.breed.textContent() || '';
  }

  async getDOB(): Promise<string> {
    return await this.dob.textContent() || '';
  }

  async getVetFeesLimit(): Promise<string> {
    return await this.vetFeesLimit.textContent() || '';
  }

  async getExcess(): Promise<string> {
    return await this.excess.textContent() || '';
  }

  async getVoluntaryExcess(): Promise<string> {
    return await this.voluntaryExcess.textContent() || '';
  }

  async getFindMyPetStatus(): Promise<string> {
    return await this.findMyPetStatus.textContent() || '';
  }

  async getSayingGoodbyeStatus(): Promise<string> {
    return await this.sayingGoodbyeStatus.textContent() || '';
  }

  async getAwayFromHomeStatus(): Promise<string> {
    return await this.awayFromHomeStatus.textContent() || '';
  }

  async getMonthlyPrice(): Promise<string> {
    return await this.monthlyPrice.textContent() || '';
  }

  /** Monthly price as a number (e.g. "£29.03" -> 29.03) for cross-page comparisons. */
  async getMonthlyPriceAmount(): Promise<number> {
    const text = await this.getMonthlyPrice();
    return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
  }

  async clickEditPetDetails() {
    await this.editPetDetailsLink.click();
  }

  async clickEditOptionalExtras() {
    await this.editOptionalExtrasLink.click();
  }

  async clickEditCoverDetails() {
    await this.editCoverDetailsLink.click();
  }

  async verifyPetName(expectedName: string) {
    const actualName = await this.getPetName();
    expect(actualName).toContain(expectedName);
  }

  async verifyBreed(expectedBreed: string) {
    const actualBreed = await this.getBreed();
    expect(actualBreed).toContain(expectedBreed);
  }

  async verifyVetFeesLimit(expectedLimit: string) {
    const actualLimit = await this.getVetFeesLimit();
    expect(actualLimit).toContain(expectedLimit);
  }

  async verifyExcess(expectedExcess: string) {
    const actualExcess = await this.getExcess();
    expect(actualExcess).toContain(expectedExcess);
  }

  async verifyVoluntaryExcess(expectedVoluntaryExcess: string) {
    const actualVoluntaryExcess = await this.getVoluntaryExcess();
    expect(actualVoluntaryExcess).toContain(expectedVoluntaryExcess);
  }

  async verifyMonthlyPrice(expectedPrice: string) {
    const actualPrice = await this.getMonthlyPrice();
    expect(actualPrice).toContain(expectedPrice);
  }

  async verifyFindMyPetStatus(expectedStatus: string) {
    const actualStatus = await this.getFindMyPetStatus();
    expect(actualStatus).toContain(expectedStatus);
  }

  async verifySayingGoodbyeStatus(expectedStatus: string) {
    const actualStatus = await this.getSayingGoodbyeStatus();
    expect(actualStatus).toContain(expectedStatus);
  }

  async verifyAwayFromHomeStatus(expectedStatus: string) {
    const actualStatus = await this.getAwayFromHomeStatus();
    expect(actualStatus).toContain(expectedStatus);
  }

  async enterFirstName(firstName: string) {
    await this.firstNameField.fill(firstName);
  }

  async enterLastName(lastName: string) {
    await this.lastNameField.fill(lastName);
  }

  async enterEmail(email: string) {
    await this.emailField.fill(email);
  }

  async enterMobile(mobile: string) {
    await this.mobileField.fill(mobile);
  }

  async enterUserDOB(day: string, month: string, year: string) {
    await this.dobDayField.fill(day);
    await this.dobMonthField.fill(month);
    await this.dobYearField.fill(year);
  }

  async selectMarketing(accept: boolean) {
    // The summary repricing loader modal intercepts pointer events and can stay
    // up longer than the 15s action timeout on slow staging.
    await this.waitForLoaderToDisappear();
    if (accept) {
      await this.marketingYesButton.click();
    } else {
      await this.marketingNoButton.click();
    }
  }

  async clickAgree() {
    await this.waitForLoaderToDisappear();
    await expect(this.agreeCheckbox).toBeVisible();
    await this.agreeCheckbox.click();
  }

  async clickContinue() {
    await this.waitForLoaderToDisappear();
    await expect(this.continueButton).toBeVisible();
    await this.continueButton.click();
  }

  async clickNext() {
    await this.waitForLoaderToDisappear();
    await expect(this.nextButton).toBeVisible();
    await this.nextButton.click();
  }

  async clickBack() {
    await expect(this.backLink).toBeVisible();
    await this.backLink.click();
  }

  async isStepIndicatorActive(): Promise<boolean> {
    return await this.stepIndicator.isVisible();
  }

  async fillUserDetails(firstName: string, lastName: string, email: string, mobile: string, day: string, month: string, year: string) {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterEmail(email);
    await this.enterMobile(mobile);
    await this.enterUserDOB(day, month, year);
  }

  // Soft assertions: report every mismatched field instead of stopping at the
  // first one, so a persistence failure shows the full picture in one run.
  // Short timeout because persisted values are present immediately - no point
  // waiting the default 20s per field when the value is never going to appear.
  async verifyUserDetailsPersisted(firstName: string, lastName: string, email: string, mobile: string, day: string, month: string, year: string) {
    const opts = { timeout: 2000 };
    await expect.soft(this.firstNameField, 'First name should persist after editing cover details').toHaveValue(firstName, opts);
    await expect.soft(this.lastNameField, 'Last name should persist after editing cover details').toHaveValue(lastName, opts);
    await expect.soft(this.emailField, 'Email should persist after editing cover details').toHaveValue(email, opts);
    await expect.soft(this.mobileField, 'Mobile should persist after editing cover details').toHaveValue(mobile, opts);
    await expect.soft(this.dobDayField, 'DOB day should persist after editing cover details').toHaveValue(day, opts);
    await expect.soft(this.dobMonthField, 'DOB month should persist after editing cover details').toHaveValue(month, opts);
    await expect.soft(this.dobYearField, 'DOB year should persist after editing cover details').toHaveValue(year, opts);
  }

  async verifyUserDetailsEntered(firstName: string, lastName: string, email: string, mobile: string, day: string, month: string, year: string) {
    await expect(this.firstNameField).toHaveValue(firstName);
    await expect(this.lastNameField).toHaveValue(lastName);
    await expect(this.emailField).toHaveValue(email);
    await expect(this.mobileField).toHaveValue(mobile);
    await expect(this.dobDayField).toHaveValue(day);
    await expect(this.dobMonthField).toHaveValue(month);
    await expect(this.dobYearField).toHaveValue(year);
  }

  async isMarketingSelected(accept: boolean): Promise<boolean> {
    const button = accept ? this.marketingYesButton : this.marketingNoButton;
    const classList = await button.getAttribute('class');
    return classList?.includes('active') || classList?.includes('selected') || false;
  }

  async verifyMarketingSelected(accept: boolean) {
    expect(await this.isMarketingSelected(accept)).toBe(true);
  }

  async verifyNavigationToPaymentPage() {
    await expect(this.paymentStepIndicator).toBeVisible();
  }

  async verifyNavigationToQuotePage() {
    await expect(this.quoteStepIndicator).toBeVisible();
  }

  async verifyNavigationToPetDetailsPage() {
    await expect(this.petDetailsStepIndicator).toBeVisible();
  }

  async clickPolicyDocuments() {
    await this.policyDocumentsLink.click();
  }

  async verifyPolicyDocumentsDropdownOpen() {
    await expect(this.policyWordingLink).toBeVisible();
    await expect(this.ipidLink).toBeVisible();
  }

  async verifyPolicyDocumentsDropdownClosed() {
    await expect(this.policyWordingLink).not.toBeVisible();
  }

  /**
   * Verifies a policy-document link points at the expected PDF and opens in a
   * new tab, then confirms the PDF is actually reachable over HTTP.
   *
   * We deliberately assert the anchor's href + fetch the file rather than
   * clicking to open a popup: the documents are served from an external CDN and
   * Chromium renders them in an `about:blank` PDF viewer whose URL never
   * resolves to the .pdf path, which made the click-and-check approach hang and
   * flake. Asserting the href and fetching the file is deterministic and still
   * proves the correct, working document is linked.
   */
  async verifyPolicyDocumentLink(linkName: string, expectedPDFName: string): Promise<void> {
    const link = this.page.getByRole('link', { name: linkName });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('href', new RegExp(`${expectedPDFName}.*\\.pdf`, 'i'));

    const href = await link.getAttribute('href');
    expect(href, `${linkName} link should point at a PDF`).toMatch(/\.pdf/i);

    const response = await this.page.request.get(href as string);
    expect(response.status(), `${expectedPDFName} PDF should be reachable at ${href}`).toBeLessThan(400);
  }

  async verifyOptionalExtrasSection() {
    await expect(this.optionalExtrasHeading).toBeVisible();
  }

  async verifyFirstNameError() {
    await expect(this.firstNameError).toBeVisible();
  }

  async verifyLastNameError() {
    await expect(this.lastNameError).toBeVisible();
  }

  async verifyEmailError() {
    await expect(this.emailError).toBeVisible();
  }

  async verifyMobileError() {
    await expect(this.mobileError).toBeVisible();
  }

  async verifyDOBError() {
    await expect(this.dobError).toBeVisible();
  }

  async verifyEmailFormatError() {
    await expect(this.emailFormatError).toBeVisible();
  }

  async verifyEmailFormatErrorNotVisible() {
    await expect(this.emailFormatError).not.toBeVisible();
  }

  async verifyInvalidDateError() {
    await expect(this.dobInvalidFormatError).toBeVisible();
  }

  async verifyFutureDateError() {
    await expect(this.dobFutureError).toBeVisible();
  }

  async verifyDOBErrorsNotVisible() {
    await expect(this.dobInvalidError).not.toBeVisible();
    await expect(this.dobInvalidFormatError).not.toBeVisible();
    await expect(this.dobFutureError).not.toBeVisible();
  }

  async verifyMobileNumberOnlyDigits() {
    const mobileValue = await this.mobileField.inputValue();
    expect(mobileValue).not.toMatch(/[a-zA-Z]/);
  }

  async verifyMobileNumberError() {
    await expect(this.mobileFormatError).toBeVisible();
  }

  async verifyMobileNumberErrorNotVisible() {
    await expect(this.mobileFormatError).not.toBeVisible();
  }

  async verifyMobileNumberValid() {
    const mobileValue = await this.mobileField.inputValue();
    expect(mobileValue).toMatch(/^07\d{9}$/);
  }

  async verifyAgreeButtonActive() {
    await expect(this.agreeCheckbox).toHaveClass(/activeBtn/);
  }

  async clickBenefitsExclusionsButton() {
    await this.benefitsExclusionsButton.click();
  }

  async verifyBenefitsExclusionsSectionExpanded() {
    await expect(this.benefitsHeading).toBeVisible();
  }

  async verifyBenefitsExclusionsContent() {
    await expect(this.benefitsDescription).toBeVisible();
    await expect(this.benefitsReferenceText).toBeVisible();
  }

  async verifyWhatsCoveredSection() {
    await expect(this.whatsCoveredHeading).toBeVisible();
    for (const item of this.whatsCoveredItems) {
      await expect(item).toBeVisible();
    }
  }

  async verifyWhatsNotCoveredSection() {
    await expect(this.whatsNotCoveredHeading).toBeVisible();
    for (const item of this.whatsNotCoveredItems) {
      await expect(item).toBeVisible();
    }
  }

  async verifyBenefitsExclusionsSectionCollapsed() {
    await expect(this.benefitsHeadingExact).not.toBeVisible();
  }

  async clickHelpButton() {
    await this.helpButton.click();
  }

  async verifyHelpPopupVisible() {
    await expect(this.helpPopup).toBeVisible();
    await expect(this.helpPopupHeading).toBeVisible();
  }

  async verifyHelpPopupContent() {
    await expect(this.helpPhoneLink).toBeVisible();
    await expect(this.helpEmailLink).toBeVisible();
    await expect(this.helpWeekdaysLabel).toBeVisible();
    await expect(this.helpWeekdaysTime).toBeVisible();
    await expect(this.helpSaturdayLabel).toBeVisible();
    await expect(this.helpSundayLabel).toBeVisible();
  }

  async verifyHelpPopupClosed() {
    await expect(this.helpPopup).not.toBeVisible();
  }
}
