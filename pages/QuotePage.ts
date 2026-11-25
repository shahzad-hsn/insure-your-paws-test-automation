import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import petData from '../data/petsData.json';

export class QuotePage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly stepIndicator: Locator;
  
  private readonly vetFeeCoverSlider: Locator;
  private readonly vetFeeCoverValue: Locator;
  private readonly vetFeeCoverMinusBtn: Locator;
  private readonly vetFeeCoverPlusBtn: Locator;
  
  private readonly excessSlider: Locator;
  private readonly excessValue: Locator;
  private readonly excessMinusBtn: Locator;
  private readonly excessPlusBtn: Locator;
  
  private readonly voluntaryExcessSlider: Locator;
  private readonly voluntaryExcessValue: Locator;
  private readonly voluntaryExcessMinusBtn: Locator;
  private readonly voluntaryExcessPlusBtn: Locator;
  private readonly seeExampleLink: Locator;
  
  private readonly findMyPetSelectBtn: Locator;
  private readonly stayingGoodbyeSelectBtn: Locator;
  private readonly awayFromHomeSelectBtn: Locator;
  
  private readonly monthlyTotal: Locator;
  private readonly viewPolicySummaryLink: Locator;
  private readonly nextButton: Locator;
  private readonly backLink: Locator;
  private readonly helpButton: Locator;
  private readonly helpPopup: Locator;
  private readonly summaryStepIndicator: Locator;
  private readonly petDetailsStepIndicator: Locator;
  private readonly progressBar: Locator;
  // Policy summary modal
  private readonly policySummaryModalBody: Locator;
  private readonly policySummaryHeading: Locator;
  private readonly policySummaryDetailLabels: Locator[];
  private readonly policySummaryExtrasHeading: Locator;
  private readonly policySummaryExtrasLabels: Locator[];
  private readonly modalCloseButton: Locator;
  private readonly policySummaryEditPetButton: Locator;
  private readonly policySummaryEditExtrasButton: Locator;
  // Optional extras cards
  private readonly findMyPetLabel: Locator;
  private readonly sayingGoodbyeLabel: Locator;
  private readonly awayFromHomeLabel: Locator;
  // Help popup content
  private readonly helpPopupHeading: Locator;
  private readonly helpPhoneLink: Locator;
  private readonly helpEmailLink: Locator;
  private readonly helpWeekdaysLabel: Locator;
  private readonly helpWeekdaysTime: Locator;
  private readonly helpSaturdayLabel: Locator;
  private readonly helpSundayLabel: Locator;
  private readonly helpClosedLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.locator('[class*="page-title"]').filter({hasText: "Customise"}).filter({hasText: "Lifetime Cover"});
    this.stepIndicator = page.locator('.activeNav').filter({ hasText: 'Quote' });
    
    this.vetFeeCoverSlider = page.locator('input.range-slider__range').nth(0);
    this.vetFeeCoverValue = page.locator("//h4[contains(text(),'Vet fees')]/following-sibling::p[contains(@class,'current-value')][1]");
    
    this.vetFeeCoverMinusBtn = page.getByAltText('MinusIcon').first();
    this.vetFeeCoverPlusBtn = page.getByAltText('PlusIcon').first();
    
    this.excessSlider = page.locator('input.range-slider__range').nth(1);
    this.excessValue = page.locator("//h4[contains(text(),'Excess')]/following-sibling::p[contains(@class,'current-value')][1]");
    this.excessMinusBtn = page.getByAltText('MinusIcon').nth(1);
    this.excessPlusBtn = page.getByAltText('PlusIcon').nth(1);
    
    this.voluntaryExcessSlider = page.locator('input.range-slider__range').nth(2);
    this.voluntaryExcessValue = page.locator("//h4[contains(text(),'Bill share')]/following-sibling::p[contains(@class,'current-value')][1]");
    this.voluntaryExcessMinusBtn = page.getByAltText('MinusIcon').nth(2);
    this.voluntaryExcessPlusBtn = page.getByAltText('PlusIcon').nth(2);
    this.seeExampleLink = page.getByRole('button').filter({hasText: 'See example'});
    
    this.findMyPetSelectBtn = page.locator('div').filter({hasText: 'Find My Pet'}).filter({has: page.getByRole('button').filter({hasText: 'Select'})}).last().getByRole('button').filter({hasText: 'Select'});
    this.stayingGoodbyeSelectBtn = page.locator('div').filter({hasText: 'Saying Goodbye'}).filter({has: page.getByRole('button').filter({hasText: 'Select'})}).last().getByRole('button').filter({hasText: 'Select'});
    this.awayFromHomeSelectBtn = page.locator('div').filter({hasText: 'Away From Home'}).filter({has: page.getByRole('button').filter({hasText: 'Select'})}).last().getByRole('button').filter({hasText: 'Select'});
    
    this.monthlyTotal = page.locator('.total-price').last();
    // The page renders a duplicate "View Policy Summary" button (a sticky footer
    // copy); both can be visible at once and open the same modal, so target the
    // first visible one to avoid strict-mode violations.
    this.viewPolicySummaryLink = page
      .getByRole('button', { name: 'View Policy Summary' })
      .filter({ visible: true })
      .first();
    this.nextButton = page.getByTestId('next_btn');
    this.backLink = page.getByRole('button').filter({hasText: 'Back'});
    this.helpButton = page.getByAltText('help-icon');
    this.helpPopup = page.locator('.dropdown-menu-wrapper');
    this.summaryStepIndicator = this.journeyStepIndicator('Summary');
    this.petDetailsStepIndicator = this.journeyStepIndicator('Your pet');
    this.progressBar = page.getByRole('progressbar');

    this.policySummaryModalBody = page.locator('.modal-body');
    this.policySummaryHeading = page.getByRole('heading', { name: 'Policy Summary' });
    this.policySummaryDetailLabels = [
      'Cover Level:',
      'Cover Start Date:',
      'Pet name:',
      'Breed:',
      'DOB:',
      'Chosen vet fee limit:',
      'Chosen excess amount:',
      'Your share of the vet bill:',
    ].map((label) => page.getByText(label));
    this.policySummaryExtrasHeading = page.getByText('Optional extras', { exact: true });
    this.policySummaryExtrasLabels = ['Find My Pet', 'Saying Goodbye', 'Away From Home'].map(
      (label) => page.getByRole('dialog').getByText(label),
    );
    this.modalCloseButton = page.getByRole('button', { name: 'Close' });
    // Policy Summary modal actions — staging uses data-id=edit_pet_details_btn
    // (testIdAttribute is data-id). Scope to the dialog so page-level Edit links
    // cannot collide. Optional-extras Edit sits next to the "Optional extras" heading.
    this.policySummaryEditPetButton = page
      .getByRole('dialog')
      .getByTestId('edit_pet_details_btn');
    this.policySummaryEditExtrasButton = page
      .getByRole('dialog')
      .getByRole('heading', { name: 'Optional extras' })
      .locator('xpath=following-sibling::button[normalize-space()="Edit"][1]');

    this.findMyPetLabel = page.getByText('Find My Pet').first();
    this.sayingGoodbyeLabel = page.getByText('Saying Goodbye').first();
    this.awayFromHomeLabel = page.getByText('Away From Home').first();

    this.helpPopupHeading = page.getByRole('heading', { name: petData.helpPopup.heading });
    this.helpPhoneLink = page.getByRole('link', { name: petData.helpPopup.phone });
    this.helpEmailLink = page.getByRole('link', { name: petData.helpPopup.email });
    this.helpWeekdaysLabel = page.getByText(petData.helpPopup.openingHours.weekdays);
    this.helpWeekdaysTime = page.getByText(petData.helpPopup.openingHours.weekdaysTime);
    // getByText does substring matching, so the "Sat: Closed" / "Sunday: Closed"
    // strings from the shared test data match regardless of whether the popup
    // renders the day and "Closed" in one node or two.
    this.helpSaturdayLabel = page.getByText(petData.helpPopup.openingHours.saturday.split(' ')[0]);
    this.helpSundayLabel = page.getByText(petData.helpPopup.openingHours.sunday.split(' ')[0]);
    this.helpClosedLabel = page.getByText(petData.helpPopup.openingHours.saturday.split(' ')[1]).first();
  }

  async verifyStepIndicatorActive() {
    await expect(this.stepIndicator).toBeVisible();
  }

  async isStepIndicatorActive(): Promise<boolean> {
    return await this.stepIndicator.isVisible();
  }


  async isPageHeadingVisible(): Promise<boolean> {
    try {
      await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async verifyPageHeadingVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  async verifyPageHeading(petName: string) {
    await expect(this.pageHeading).toContainText(petName);
  }

  async getVetFeeCoverValue(): Promise<string> {
    return await this.vetFeeCoverValue.textContent() || '';
  }

  async setVetFeeCoverSlider(value: string) {
    await this.vetFeeCoverSlider.waitFor({ state: 'visible', timeout: 10000 });
    await this.vetFeeCoverSlider.evaluate((el, val) => {
      const input = el as HTMLInputElement;
      input.value = val;
      
      // Dispatch all events that a real user interaction would trigger
      input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, value);
    await this.page.waitForTimeout(1000);
  }

  async clickVetFeeCoverPlus() {
    await this.vetFeeCoverPlusBtn.click();
  }

  async clickVetFeeCoverMinus() {
    await this.vetFeeCoverMinusBtn.click();
  }

  async getExcessValue(): Promise<string> {
    return await this.excessValue.textContent() || '';
  }

  async setExcessSlider(value: string) {
    await this.excessSlider.waitFor({ state: 'visible', timeout: 10000 });
    await this.excessSlider.evaluate((el, val) => {
      const input = el as HTMLInputElement;
      input.value = val;
      
      // Dispatch all events that a real user interaction would trigger
      input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, value);
    await this.page.waitForTimeout(1000);
  }

  async clickExcessPlus() {
    await this.excessPlusBtn.click();
  }

  async clickExcessMinus() {
    await this.excessMinusBtn.click();
  }

  async getVoluntaryExcessValue(): Promise<string> {
    return await this.voluntaryExcessValue.textContent() || '';
  }

  async setVoluntaryExcessSlider(value: string) {
    await this.voluntaryExcessSlider.waitFor({ state: 'visible', timeout: 10000 });
    await this.voluntaryExcessSlider.evaluate((el, val) => {
      const input = el as HTMLInputElement;
      input.value = val;
      
      // Dispatch all events that a real user interaction would trigger
      input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, value);
    await this.page.waitForTimeout(1000);
  }

  async clickVoluntaryExcessPlus() {
    await this.voluntaryExcessPlusBtn.click();
  }

  async clickVoluntaryExcessMinus() {
    await this.voluntaryExcessMinusBtn.click();
  }

  async clickSeeExample() {
    await this.seeExampleLink.click();
  }

  private async waitForExtraSelected(button: Locator) {
    await expect(button).toContainText(/selected|deselect/i, { timeout: 15000 });
  }

  async selectFindMyPet() {
    const buttonText = await this.findMyPetSelectBtn.textContent();
    if (buttonText?.toLowerCase().includes('select') && !buttonText?.toLowerCase().includes('selected')) {
      await this.findMyPetSelectBtn.click();
      await this.waitForExtraSelected(this.findMyPetSelectBtn);
    }
  }

  async deselectFindMyPet() {
    const buttonText = await this.findMyPetSelectBtn.textContent();
    if (buttonText?.toLowerCase().includes('selected') || buttonText?.toLowerCase().includes('deselect')) {
      await this.findMyPetSelectBtn.click();
    }
  }

  async isFindMyPetSelected(): Promise<boolean> {
    const buttonText = await this.findMyPetSelectBtn.textContent();
    return buttonText?.toLowerCase().includes('selected') || buttonText?.toLowerCase().includes('deselect') || false;
  }

  async selectStayingGoodbye() {
    const buttonText = await this.stayingGoodbyeSelectBtn.textContent();
    if (buttonText?.toLowerCase().includes('select') && !buttonText?.toLowerCase().includes('selected')) {
      await this.stayingGoodbyeSelectBtn.click();
      await this.waitForExtraSelected(this.stayingGoodbyeSelectBtn);
    }
  }

  async deselectStayingGoodbye() {
    const buttonText = await this.stayingGoodbyeSelectBtn.textContent();
    if (buttonText?.toLowerCase().includes('selected') || buttonText?.toLowerCase().includes('deselect')) {
      await this.stayingGoodbyeSelectBtn.click();
    }
  }

  async isStayingGoodbyeSelected(): Promise<boolean> {
    const buttonText = await this.stayingGoodbyeSelectBtn.textContent();
    return buttonText?.toLowerCase().includes('selected') || buttonText?.toLowerCase().includes('deselect') || false;
  }

  async selectAwayFromHome() {
    const buttonText = await this.awayFromHomeSelectBtn.textContent();
    if (buttonText?.toLowerCase().includes('select') && !buttonText?.toLowerCase().includes('selected')) {
      await this.awayFromHomeSelectBtn.click();
      await this.waitForExtraSelected(this.awayFromHomeSelectBtn);
    }
  }

  async deselectAwayFromHome() {
    const buttonText = await this.awayFromHomeSelectBtn.textContent();
    if (buttonText?.toLowerCase().includes('selected') || buttonText?.toLowerCase().includes('deselect')) {
      await this.awayFromHomeSelectBtn.click();
    }
  }

  async isAwayFromHomeSelected(): Promise<boolean> {
    const buttonText = await this.awayFromHomeSelectBtn.textContent();
    return buttonText?.toLowerCase().includes('selected') || buttonText?.toLowerCase().includes('deselect') || false;
  }

  async getMonthlyTotal(): Promise<string> {
    // Wait for a real price to render (not an empty/mid-recalculation value) so
    // callers never read a stale total during the app's async price update.
    await expect(this.monthlyTotal).toContainText(/\d/, { timeout: 15000 });
    return await this.monthlyTotal.textContent() || '';
  }

  async verifyMonthlyTotal(expectedTotal: string) {
    await expect(this.monthlyTotal).toContainText(expectedTotal);
  }

  async clickViewPolicySummary() {
    await this.viewPolicySummaryLink.click();
  }

  async verifyPolicySummaryModalVisible() {
    await expect(this.policySummaryModalBody).toBeVisible();
    await expect(this.policySummaryHeading).toBeVisible();
  }

  async verifyPolicySummaryDetails() {
    for (const label of this.policySummaryDetailLabels) {
      await expect(label).toBeVisible();
    }
  }

  async verifyPolicySummaryOptionalExtras() {
    await expect(this.policySummaryExtrasHeading).toBeVisible();
    for (const label of this.policySummaryExtrasLabels) {
      await expect(label).toBeVisible();
    }
  }

  async closePolicySummaryModal() {
    await this.modalCloseButton.click();
    await expect(this.policySummaryHeading).not.toBeVisible();
  }

  async verifyPolicySummaryEditPetButtonVisible() {
    await expect(this.policySummaryEditPetButton).toBeVisible();
  }

  async verifyPolicySummaryEditExtrasButtonVisible() {
    await expect(this.policySummaryEditExtrasButton).toBeVisible();
  }

  /** Hard-assert the pet name appears in the open Policy Summary dialog. */
  async verifyPolicySummaryPetName(expectedName: string) {
    await expect(this.page.getByRole('dialog')).toContainText(expectedName);
  }

  async clickEditPetDetailsFromPolicySummaryModal() {
    await expect(this.policySummaryEditPetButton).toBeVisible();
    await this.policySummaryEditPetButton.click();
    await expect(this.petDetailsStepIndicator).toBeVisible({ timeout: 30000 });
  }

  async clickEditOptionalExtrasFromPolicySummaryModal() {
    await expect(this.policySummaryEditExtrasButton).toBeVisible();
    await this.policySummaryEditExtrasButton.click();
    await expect(this.stepIndicator).toBeVisible({ timeout: 30000 });
  }

  /** Opens the Policy Summary modal and clicks Edit pet details (lands on step 1). */
  async editPetDetailsFromPolicySummaryModal() {
    await this.clickViewPolicySummary();
    await this.verifyPolicySummaryModalVisible();
    await this.verifyPolicySummaryEditPetButtonVisible();
    await this.clickEditPetDetailsFromPolicySummaryModal();
  }

  /** Opens the Policy Summary modal and clicks Edit on optional extras (lands on step 2). */
  async editOptionalExtrasFromPolicySummaryModal() {
    await this.clickViewPolicySummary();
    await this.verifyPolicySummaryModalVisible();
    await this.verifyPolicySummaryEditExtrasButtonVisible();
    await this.clickEditOptionalExtrasFromPolicySummaryModal();
  }

  /** Hard-assert the Customise heading greets the exact pet name. */
  async verifyPageHeadingExact(petName: string) {
    await expect(this.pageHeading).toHaveText(
      new RegExp(`^Customise\\s+${petName}'s\\s+Lifetime Cover$`, 'i'),
    );
  }

  async clickNext() {
    // Repricing shows a full-screen loader modal (separate from the price
    // progressbar) that intercepts pointer events. On slow staging it can stay
    // up longer than the 15s action timeout, so wait it out before clicking.
    await this.waitForLoaderToDisappear();
    await this.nextButton.click();
    await expect(this.summaryStepIndicator).toBeVisible({ timeout: 30000 });
  }

  async verifyNavigationToSummaryPage() {
    await expect(this.summaryStepIndicator).toBeVisible();
  }

  async clickBack() {
    await this.backLink.click();
  }

  async verifyNavigationToPetDetailsPage() {
    await expect(this.petDetailsStepIndicator).toBeVisible();
  }

  async verifyVetFeeCoverValue(expectedValue: string) {
    const actualValue = await this.getVetFeeCoverValue();
    expect(actualValue).toContain(expectedValue);
  }

  async verifyExcessValue(expectedValue: string) {
    const actualValue = await this.getExcessValue();
    expect(actualValue).toContain(expectedValue);
  }

  async verifyVoluntaryExcessValue(expectedValue: string) {
    const actualValue = await this.getVoluntaryExcessValue();
    expect(actualValue).toContain(expectedValue);
  }

  async verifyAllExtrasDeselected() {
    expect(await this.isFindMyPetSelected()).toBe(false);
    expect(await this.isStayingGoodbyeSelected()).toBe(false);
    expect(await this.isAwayFromHomeSelected()).toBe(false);
  }

  async adjustVetFees(value: string) {
    await this.setVetFeeCoverSlider(value);
  }

  async adjustExcess(value: string) {
    await this.setExcessSlider(value);
  }

  async adjustCoPayment(value: string) {
    await this.setVoluntaryExcessSlider(value);
  }

  async selectExtra(index: number) {
    if (index === 1) {
      await this.selectFindMyPet();
    } else if (index === 2) {
      await this.selectStayingGoodbye();
    } else if (index === 3) {
      await this.selectAwayFromHome();
    }
  }

  async clickHelp() {
    await this.helpButton.click();
  }

  async verifyHelpPopupVisible() {
    await expect(this.helpPopup).toBeVisible();
    await expect(this.helpPopupHeading).toBeVisible();
  }

  async verifyHelpPopupContactDetails() {
    await expect(this.helpPhoneLink).toBeVisible();
    await expect(this.helpEmailLink).toBeVisible();
  }

  async verifyHelpPopupOpeningHours() {
    await expect(this.helpWeekdaysLabel).toBeVisible();
    await expect(this.helpWeekdaysTime).toBeVisible();
    await expect(this.helpSaturdayLabel).toBeVisible();
    await expect(this.helpClosedLabel).toBeVisible();
    await expect(this.helpSundayLabel).toBeVisible();
  }

  async closeHelpPopup() {
    await this.helpButton.click();
    await expect(this.helpPopup).not.toBeVisible();
  }

  async verifyMonthlyTotalExists() {
    const price = await this.getMonthlyTotal();
    // Prices render as e.g. "£29.03" or "£1,907.80" for multi-pet quotes
    expect(price).toMatch(/£[\d,]+\.\d{2}/);
  }

  async getMonthlyTotalAmount(): Promise<number> {
    const text = await this.getMonthlyTotal();
    return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
  }

  async verifyOptionalExtrasVisible() {
    await expect(this.findMyPetLabel).toBeVisible();
    await expect(this.sayingGoodbyeLabel).toBeVisible();
    await expect(this.awayFromHomeLabel).toBeVisible();
  }

  async verifyVoluntaryExcessBoundaries(minValue: string, maxValue: string) {
    await this.setVoluntaryExcessSlider(minValue);
    const min = await this.getVoluntaryExcessValue();
    await this.setVoluntaryExcessSlider(maxValue);
    const max = await this.getVoluntaryExcessValue();
    expect(min).not.toBe(max);
  }

  async verifyPriceChangesAfterSliderAdjustment(sliderMethod: () => Promise<void>) {
    const priceBefore = await this.getMonthlyTotal();
    await sliderMethod();
    // Repricing happens via an async API call after the slider event; reading
    // the total immediately races that call and can see the stale price.
    // Wait out the recalculation, then poll until the new total lands.
    await this.waitForProgressBarToDisappear();
    await expect
      .poll(() => this.getMonthlyTotal(), { timeout: 20000 })
      .not.toBe(priceBefore);
  }

  async verifyVetFeeCoverValueChangesAfterPlus() {
    const valueBefore = await this.getVetFeeCoverValue();
    await this.clickVetFeeCoverPlus();
    const valueAfter = await this.getVetFeeCoverValue();
    expect(valueAfter).not.toBe(valueBefore);
  }

  async verifyVetFeeCoverValueChangesAfterMinus() {
    const valueBefore = await this.getVetFeeCoverValue();
    await this.clickVetFeeCoverMinus();
    const valueAfter = await this.getVetFeeCoverValue();
    expect(valueAfter).not.toBe(valueBefore);
  }

  async verifyVetFeeCoverValueExists() {
    const value = await this.getVetFeeCoverValue();
    // Vet fee limit renders as e.g. "£10,000"
    expect(value).toMatch(/^£[\d,]+$/);
  }

  async verifyExcessValueExists() {
    const value = await this.getExcessValue();
    // Excess renders as e.g. "£200"
    expect(value).toMatch(/^£\d+$/);
  }

  async verifyVoluntaryExcessValueExists() {
    const value = await this.getVoluntaryExcessValue();
    // Voluntary excess renders as e.g. "0%"
    expect(value).toMatch(/^\d+%$/);
  }

  async verifyFindMyPetSelected() {
    expect(await this.isFindMyPetSelected()).toBe(true);
  }

  async verifyFindMyPetDeselected() {
    expect(await this.isFindMyPetSelected()).toBe(false);
  }

  async verifyExtraSelected(index: number) {
    const isSelected = async () => {
      if (index === 1) return this.isFindMyPetSelected();
      if (index === 2) return this.isStayingGoodbyeSelected();
      if (index === 3) return this.isAwayFromHomeSelected();
      return false;
    };
    await expect.poll(isSelected, { timeout: 15000 }).toBe(true);
  }

  async verifyAllExtrasSelected() {
    expect(await this.isFindMyPetSelected()).toBe(true);
    expect(await this.isStayingGoodbyeSelected()).toBe(true);
    expect(await this.isAwayFromHomeSelected()).toBe(true);
  }

  async verifyVetFeeCoverBoundaries(minValue: string, maxValue: string) {
    await this.setVetFeeCoverSlider(minValue);
    const min = await this.getVetFeeCoverValue();
    await this.setVetFeeCoverSlider(maxValue);
    const max = await this.getVetFeeCoverValue();
    expect(min).not.toBe(max);
  }

  async verifyExcessBoundaries(minValue: string, maxValue: string) {
    await this.setExcessSlider(minValue);
    const min = await this.getExcessValue();
    await this.setExcessSlider(maxValue);
    const max = await this.getExcessValue();
    expect(min).not.toBe(max);
  }

  async waitForProgressBarToDisappear() {
    try {
      await this.progressBar.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Price may have updated without showing a progress bar.
    }
    await expect(this.progressBar).not.toBeVisible({ timeout: 15000 });
    await this.waitForLoaderToDisappear();
    // Back-to-back slider adjustments fire one repricing call each; the first
    // response can update the price (and hide the progressbar) before the
    // second lands. Require the displayed price to hold steady for ~2.5s so
    // callers never capture a stale intermediate value.
    let last = await this.monthlyTotal.textContent();
    let stableChecks = 0;
    await expect(async () => {
      await this.page.waitForTimeout(500);
      const current = await this.monthlyTotal.textContent();
      if (current !== last) {
        last = current;
        stableChecks = 0;
      } else {
        stableChecks++;
      }
      if (stableChecks < 5) {
        throw new Error(`Waiting for price to stabilise (currently ${current})`);
      }
    }).toPass({ timeout: 30000 });
  }
}
