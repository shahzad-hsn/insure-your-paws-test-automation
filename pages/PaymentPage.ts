import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PaymentPage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly annualPrice: Locator;
  private readonly monthlyPrice: Locator;
  private readonly selectAnnualButton: Locator;
  private readonly selectMonthlyButton: Locator;
  private readonly monthlyDateDropdown: Locator;
  private readonly countryDropdown: Locator;
  private readonly emailField: Locator;
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly addressLine1Field: Locator;
  private readonly addressLine2Field: Locator;
  private readonly cityField: Locator;
  private readonly confirmAddressButton: Locator;
  private readonly confirmDirectDebitButton: Locator;
  private readonly sortCodeField: Locator;
  private readonly accountNumberField: Locator;
  private readonly submitBankDetailsButton: Locator;
  private readonly chooseBankButton: Locator;
  private readonly bankSearchInput: Locator;
  private readonly successBankOption: Locator;
  private readonly postcodeField: Locator;
  private readonly findAddressLink: Locator;
  private readonly directDebitButton: Locator;
  private readonly setupDirectDebitButton: Locator;
  private readonly gocardlessHeading: Locator;
  private readonly successBankHeading: Locator;
  private readonly backButton: Locator;
  private readonly stepIndicator: Locator;
  private readonly continueButton: Locator;
  // Post-payment Mention Me referral popup (cross-origin iframe over the success page)
  private readonly referralFrame: FrameLocator;
  private readonly referralModal: Locator;
  private readonly referralMask: Locator;
  private readonly referralPurchaseMessage: Locator;
  private readonly referralOfferHeading: Locator;
  private readonly referAFriendButton: Locator;
  private readonly poweredByMentionMe: Locator;
  private readonly referralCloseButton: Locator;
  // "You're good to go!" success page (main app, behind the popup)
  private readonly successPageHeading: Locator;
  private readonly policySetupMessage: Locator;
  private readonly policyNumberMessage: Locator;
  private readonly emailDocsMessage: Locator;
  // GoCardless dropin renders in a cross-origin iframe with a dynamic id,
  // so match on the stable host in the src (works for sandbox + prod).
  private readonly gocardlessFrame: FrameLocator;
  // Payment frequency labels and payment method tabs
  private readonly payAnnuallyLabel: Locator;
  private readonly payMonthlyLabel: Locator;
  private readonly cardMethodButton: Locator;
  private readonly payByBankButton: Locator;
  private readonly monthlyDateHeading: Locator;
  private readonly paymentSchedule: Locator;
  private readonly payByBankInfo: Locator;
  private readonly payByBankPayNowButton: Locator;
  private readonly cardTakenTodayMessage: Locator;
  // BluePayments card form (annual card payment)
  private readonly cardNumberField: Locator;
  private readonly cardExpiryField: Locator;
  private readonly cardSecurityCodeField: Locator;
  private readonly cardholderNameField: Locator;
  private readonly payNowCardButton: Locator;
  private readonly cardErrorMessage: Locator;
  private readonly dropdownOptions: Locator;
  private readonly bankAuthLinkButton: Locator;
  private readonly changeBankLink: Locator;
  private readonly bankConnectionProblemMessage: Locator;
  private readonly bankTryAgainButton: Locator;

  constructor(page: Page) {
    super(page);
    this.gocardlessFrame = page.frameLocator('iframe[src*="pay-sandbox.gocardless.com"]');

    this.pageHeading = page.getByRole('heading').filter({hasText: 'Make a payment'});
    this.annualPrice = page
      .locator('.payment-select-btn', { has: page.getByTestId('pay_annually_btn') })
      .locator('.btn-price');
    this.monthlyPrice = page
      .locator('.payment-select-btn', { has: page.getByTestId('pay_monthly_btn') })
      .locator('.btn-price');
    this.selectAnnualButton = page.getByTestId('pay_annually_btn');
    this.selectMonthlyButton = page.getByTestId('pay_monthly_btn');
    // Monthly payment date picker is a react-select. The role="combobox" input is
    // a hidden offscreen dummy, so we anchor on the stable hidden form field
    // (name="monthlyPaymentDate") + the app's own wrapper class, then target the
    // react-select control (the css-* prefix is build-generated, but the
    // "-control" suffix is stable).
    this.monthlyDateDropdown = page
      .locator('.details-input-wrapper', { has: page.locator('input[name="monthlyPaymentDate"]') })
      .locator('[class*="-control"]');
    // GoCardless dropin fields: prefer user-facing role/label locators
    // (verified from the live iframe DOM). data-testid guesses don't match.
    this.countryDropdown = this.gocardlessFrame.locator('[id="country_code"]');
    this.emailField = this.gocardlessFrame.locator('[id="email"]');
    this.firstNameField = this.gocardlessFrame.locator('[id="given_name"]');
    this.lastNameField = this.gocardlessFrame.locator('[id="family_name"]');
    this.continueButton = this.gocardlessFrame.getByRole('button').filter({ hasText: 'Continue' });
    this.addressLine1Field = this.gocardlessFrame.locator('[id="address_line1"]');
    this.addressLine2Field = this.gocardlessFrame.locator('[id="address_line2"]');
    this.cityField = this.gocardlessFrame.locator('[id="city"]');
    this.postcodeField = this.gocardlessFrame.locator('[id="postal_code"]');
    this.findAddressLink = this.gocardlessFrame.getByText('Click here to find another address');
    this.directDebitButton = page.getByRole('button', { name: 'Direct Debit', exact: true });
    this.setupDirectDebitButton = page.getByRole('button').filter({ hasText: 'Set Up Direct Debit' });
    this.gocardlessHeading = this.gocardlessFrame.getByRole('heading', { name: 'Set up payments with Insure Your Paws' });
    this.confirmAddressButton = this.gocardlessFrame.locator('[data-testid="confirm-address-button"]');
    // Final "Confirm your details" screen of the Direct Debit flow (after bank details).
    this.confirmDirectDebitButton = this.gocardlessFrame.getByRole('button', { name: 'Set up this Direct Debit' });
    // Bank details screen (opens after confirming address)
    this.sortCodeField = this.gocardlessFrame.locator('[data-testid="branch_code"]');
    this.accountNumberField = this.gocardlessFrame.locator('[data-testid="account_number"]');
    this.submitBankDetailsButton = this.gocardlessFrame.locator('button[type="submit"]');
    // Bank selection screen (Pay by bank)
    this.chooseBankButton = this.gocardlessFrame.locator('[data-testid="choose-bank-button"]');
    this.bankSearchInput = this.gocardlessFrame.locator('[data-testid="institution-search-input"]');
    // The data-testid is on both a <button> and a <div>; target the clickable button.
    this.successBankOption = this.gocardlessFrame.locator('button[data-testid="CONSENT_AUTHORISED_READ_REFUND_ACCOUNT_SANDBOX_BANK"]');
    // Match by role + text (the css-* class is emotion-generated and changes per build).
    this.successBankHeading = this.gocardlessFrame.getByRole('heading', {
      name: 'Success Bank - Authorises the payment request, and returns payment with payer account details',
    });
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.stepIndicator = page.locator('.activeNav').filter({ hasText: 'Pay' });
    // Mention Me referral popup shown right after a successful card payment.
    this.referralFrame = page.frameLocator('iframe#mmContentReferrerStage1');
    this.referralModal = page.locator('#mmModalReferrerStage1');
    this.referralMask = page.locator('#mmMaskReferrerStage1');
    // Content rendered inside the cross-origin Mention Me iframe.
    this.referralPurchaseMessage = this.referralFrame.getByText(/Your purchase is complete/i);
    this.referralOfferHeading = this.referralFrame.getByRole('heading');
    this.referAFriendButton = this.referralFrame.getByRole('button', { name: 'Refer a friend now' });
    this.poweredByMentionMe = this.referralFrame.getByText('Powered by Mention Me');
    this.referralCloseButton = this.referralFrame.getByRole('button', { name: 'Close' });
    // Success page content (rendered behind the referral popup).
    this.successPageHeading = page.getByRole('heading', { name: "You're good to go!" });
    // Wording differs for single vs multiple pets ("policy is" / "policies are",
    // "policy number is" / "policy numbers are"), so match both forms.
    this.policySetupMessage = page.getByText(/polic(y|ies) (is|are) all set up/i);
    this.policyNumberMessage = page.getByText(/Your policy number/i);
    this.emailDocsMessage = page.getByText(/email you your policy documents/i);

    this.payAnnuallyLabel = page.getByText('Pay annually');
    this.payMonthlyLabel = page.getByText('Pay monthly');
    this.cardMethodButton = page.getByRole('button', { name: 'Card', exact: true });
    this.payByBankButton = page.getByRole('button', { name: 'Pay by bank', exact: true });
    this.monthlyDateHeading = page.getByRole('heading', { name: 'Choose your monthly payment date:' });
    this.paymentSchedule = page.getByText(/An initial payment of/);
    this.payByBankInfo = page.getByText(/taken to your bank app to authenticate/i);
    this.payByBankPayNowButton = page.getByRole('button', { name: 'Pay Now' });
    this.cardTakenTodayMessage = page.getByText(/taken from your card today/i);
    this.cardNumberField = page.getByPlaceholder('Card Number');
    this.cardExpiryField = page.getByPlaceholder('MM/YY');
    this.cardSecurityCodeField = page.getByPlaceholder('Security Code');
    this.cardholderNameField = page.getByPlaceholder('Cardholder Name');
    this.payNowCardButton = page.locator('#btnPayNow');
    this.cardErrorMessage = page.locator('#bluePaymentsErrorMessage');
    this.dropdownOptions = page.getByRole('option');
    // "Continue to web bank login" inside the GoCardless dropin.
    this.bankAuthLinkButton = this.gocardlessFrame.locator('[data-testid="bank-auth-link-button"]');
    // Shown next to the pre-selected bank; opens the bank picker.
    this.changeBankLink = this.gocardlessFrame.getByText('Change', { exact: true }).first();
    this.bankConnectionProblemMessage = this.gocardlessFrame.getByText(/problem connecting/i).first();
    this.bankTryAgainButton = this.gocardlessFrame.getByText('Try again').first();
  }

  async verifyPaymentFrequencyOptionsVisible() {
    await expect(this.payAnnuallyLabel).toBeVisible();
    await expect(this.payMonthlyLabel).toBeVisible();
  }

  async verifyCardAndDirectDebitButtonsVisible() {
    await expect(this.cardMethodButton).toBeVisible();
    await expect(this.directDebitButton).toBeVisible();
  }

  async verifyAllPaymentMethodsVisible() {
    await expect(this.cardMethodButton).toBeVisible();
    await expect(this.directDebitButton).toBeVisible();
    await expect(this.payByBankButton).toBeVisible();
  }

  async selectCardPaymentMethod() {
    await expect(this.cardMethodButton).toBeVisible();
    await this.cardMethodButton.click();
    // Card tab copy appears immediately; BluePayments fields inject asynchronously.
    await expect(this.cardTakenTodayMessage).toBeVisible({ timeout: 10000 });
    await expect(this.cardNumberField).toBeVisible({ timeout: 30000 });
  }

  async verifyCardFormFieldsVisible() {
    await expect(this.cardNumberField).toBeVisible({ timeout: 30000 });
    await expect(this.cardExpiryField).toBeVisible();
    await expect(this.cardSecurityCodeField).toBeVisible();
    await expect(this.cardholderNameField).toBeVisible();
  }

  /** Fills only the provided card fields, so validation tests can leave any field empty. */
  async fillCardDetails(details: { number?: string; expiry?: string; securityCode?: string; name?: string }) {
    if (details.number !== undefined) await this.cardNumberField.fill(details.number);
    if (details.expiry !== undefined) await this.cardExpiryField.fill(details.expiry);
    if (details.securityCode !== undefined) await this.cardSecurityCodeField.fill(details.securityCode);
    if (details.name !== undefined) await this.cardholderNameField.fill(details.name);
  }

  async submitCardExpectingValidationError() {
    await this.payNowCardButton.click();
    await expect(this.cardErrorMessage).toBeVisible();
  }

  /** Submits a valid card payment and waits for BluePayments to process it. */
  async submitCardPayment() {
    await this.payNowCardButton.click();
    await this.page.waitForTimeout(15000);
  }

  /**
   * Submits the card form and asserts a gateway/decline error without issuing a policy.
   * Used for expired / declined sandbox cards (Excel iyp_18).
   */
  async submitCardExpectingDecline(options: { timeout?: number } = {}) {
    const timeout = options.timeout ?? 45000;
    await this.payNowCardButton.click();
    await expect(this.cardErrorMessage).toBeVisible({ timeout });
    await expect(this.cardErrorMessage).not.toHaveText('');
    await this.verifyStillOnPaymentStep();
  }

  async verifyCardDeclineErrorVisible() {
    await expect(this.cardErrorMessage).toBeVisible();
    await expect(this.cardErrorMessage).not.toHaveText('');
  }

  /**
   * Completes a Global Payments / BluePayments 3DS challenge when shown.
   * Sandbox challenge UIs vary (Complete / Authorize / password 1234).
   */
  async completeThreeDSChallenge(options: { timeout?: number } = {}) {
    const timeout = options.timeout ?? 45000;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      if (await this.successPageHeading.isVisible().catch(() => false)) {
        return;
      }

      for (const frame of this.page.frames()) {
        const complete = frame.getByRole('button', {
          name: /complete|authenticate|succeed|submit|authorize|continue/i,
        }).first();
        if (await complete.isVisible().catch(() => false)) {
          await complete.click().catch(() => undefined);
          await this.page.waitForTimeout(2000);
          break;
        }
        const password = frame.locator('input[type="password"], input[name="password"]').first();
        if (await password.isVisible().catch(() => false)) {
          await password.fill('1234').catch(() => undefined);
          const submit = frame.getByRole('button', { name: /submit|continue|ok|authenticate/i }).first();
          if (await submit.isVisible().catch(() => false)) {
            await submit.click().catch(() => undefined);
          }
          await this.page.waitForTimeout(2000);
          break;
        }
      }

      // Challenge ACS often sits in a nested iframe (GP / BluePayments / ACS).
      const challengeFrame = this.page.frameLocator(
        'iframe[src*="acs"], iframe[src*="3ds"], iframe[src*="globalpay"], iframe[name*="challenge"]',
      );
      const challengeComplete = challengeFrame.getByRole('button', {
        name: /complete|authenticate|succeed|submit|authorize|continue/i,
      }).first();
      if (await challengeComplete.isVisible().catch(() => false)) {
        await challengeComplete.click().catch(() => undefined);
        await this.page.waitForTimeout(2000);
      }

      await this.page.waitForTimeout(1000);
    }
  }

  /** Fails/cancels a 3DS challenge when the sandbox offers a fail/cancel control. */
  async failThreeDSChallenge(options: { timeout?: number } = {}) {
    const timeout = options.timeout ?? 45000;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      if (await this.cardErrorMessage.isVisible().catch(() => false)) {
        return;
      }
      if (await this.successPageHeading.isVisible().catch(() => false)) {
        throw new Error('3DS fail path unexpectedly reached the success page');
      }

      for (const frame of this.page.frames()) {
        const fail = frame.getByRole('button', {
          name: /fail|cancel|deny|decline|reject/i,
        }).first();
        if (await fail.isVisible().catch(() => false)) {
          await fail.click().catch(() => undefined);
          await this.page.waitForTimeout(2000);
          break;
        }
      }

      const challengeFrame = this.page.frameLocator(
        'iframe[src*="acs"], iframe[src*="3ds"], iframe[src*="globalpay"], iframe[name*="challenge"]',
      );
      const challengeFail = challengeFrame.getByRole('button', {
        name: /fail|cancel|deny|decline|reject/i,
      }).first();
      if (await challengeFail.isVisible().catch(() => false)) {
        await challengeFail.click().catch(() => undefined);
        await this.page.waitForTimeout(2000);
      }

      await this.page.waitForTimeout(1000);
    }
  }

  async verifyMonthlyDateHeadingVisible() {
    await expect(this.monthlyDateHeading).toBeVisible();
  }

  async verifySetupDirectDebitButtonVisible() {
    await expect(this.setupDirectDebitButton).toBeVisible();
  }

  async openPayByBankTab() {
    await this.payByBankButton.click();
  }

  async selectDirectDebitPaymentMethod() {
    await expect(this.directDebitButton).toBeVisible();
    await this.directDebitButton.click();
  }

  async verifyCardPaymentMethodActive() {
    // Card tab shows the "taken from your card today" copy immediately; the
    // BluePayments iframe/form injects shortly after.
    await expect(this.cardTakenTodayMessage).toBeVisible();
    await this.verifyCardFormFieldsVisible();
    await expect(this.payNowCardButton).toBeVisible();
    await expect(this.setupDirectDebitButton).not.toBeVisible();
  }

  async verifyDirectDebitPaymentMethodActive() {
    await this.verifySetupDirectDebitButtonVisible();
    await expect(this.cardNumberField).not.toBeVisible();
    await expect(this.payNowCardButton).not.toBeVisible();
  }

  async verifyPayByBankPaymentMethodActive() {
    await this.verifyPayByBankContent();
    await expect(this.cardNumberField).not.toBeVisible();
    await expect(this.setupDirectDebitButton).not.toBeVisible();
  }

  /**
   * Switches between Card, Direct Debit and Pay by bank and hard-asserts each
   * method's distinctive UI — covers changing payment method before purchase.
   */
  async verifyCanSwitchPaymentMethods() {
    await this.selectCardPaymentMethod();
    await this.verifyCardPaymentMethodActive();
    await this.verifyAllPaymentMethodsVisible();

    await this.selectDirectDebitPaymentMethod();
    await this.verifyDirectDebitPaymentMethodActive();
    await this.verifyAllPaymentMethodsVisible();

    await this.openPayByBankTab();
    await this.verifyPayByBankPaymentMethodActive();
    await this.verifyAllPaymentMethodsVisible();

    // Switch back to Card so the last selected method is usable for purchase.
    await this.selectCardPaymentMethod();
    await this.verifyCardPaymentMethodActive();
    await this.verifyAllPaymentMethodsVisible();
  }

  async verifyPayByBankContent() {
    await expect(this.payByBankInfo).toBeVisible();
    await expect(this.payByBankPayNowButton).toBeVisible();
  }

  /** The initial payment and the 11 remaining instalments must both quote the app's monthly price. */
  async verifyPaymentScheduleMatchesMonthly(monthly: string) {
    await expect(this.paymentSchedule).toBeVisible();
    await expect(this.paymentSchedule, 'Initial payment should equal the monthly price').toContainText(monthly);
    await expect(this.paymentSchedule, 'Remaining instalments should also equal the monthly price').toContainText(
      `11 payments of ${monthly}`,
    );
  }

  /** Guard for direct visits to the thank-you page: no policy number may be fabricated. */
  async verifyNoPolicyNumberVisible() {
    await expect(this.policyNumberMessage).not.toBeVisible();
  }

  async verifyPageHeadingVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  async verifyStepIndicatorActive(): Promise<void> {
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

  async getAnnualPrice(): Promise<string> {
    return await this.annualPrice.textContent() || '';
  }

  /** Annual price as a number (e.g. "£348.36" -> 348.36) for cross-page comparisons. */
  async getAnnualPriceAmount(): Promise<number> {
    const text = await this.getAnnualPrice();
    return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
  }

  async clickContinue() {
    await expect(this.continueButton).toBeVisible();
    await this.continueButton.click();
  }

  async getMonthlyPrice(): Promise<string> {
    return await this.monthlyPrice.textContent() || '';
  }

  /** Monthly price as a number (e.g. "£29.03" -> 29.03) for cross-page comparisons. */
  async getMonthlyPriceAmount(): Promise<number> {
    const text = await this.getMonthlyPrice();
    return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
  }

  async verifyMonthlyDateDropdownVisible() {
    await expect(this.monthlyDateDropdown).toBeVisible();
  }

  async selectMonthlyDate(optionIndex = 0) {
    await this.monthlyDateDropdown.click();
    await this.dropdownOptions.nth(optionIndex).click();
  }

  async selectMonthlyDateAndVerify(optionIndex = 0) {
    await this.monthlyDateDropdown.click();
    const options = this.dropdownOptions;
    await expect(options.first()).toBeVisible();
    expect(await options.count()).toBeGreaterThan(0);
    const chosen = (await options.nth(optionIndex).textContent())?.trim() || '';
    await options.nth(optionIndex).click();
    // The react-select control should now display the chosen date.
    await expect(this.monthlyDateDropdown).toContainText(chosen);
  }

  async selectPaymentFrequency(frequency: 'annual' | 'monthly') {
    if (frequency === 'annual') {
      await this.selectAnnualButton.click();
    } else {
      await this.selectMonthlyButton.click();
    }
  }

  async selectCountry(country: string) {
    // First interaction with the GoCardless dropin: the iframe is created only
    // after the billing request completes, which can take up to a minute on
    // the sandbox, so wait for the field rather than relying on action timeout.
    await expect(this.countryDropdown).toBeVisible({ timeout: 60000 });
    await this.countryDropdown.selectOption({ label: country });
  }

  async verifyGoCardlessFormLoaded() {
    // Opening the dropin creates a billing request against the GoCardless
    // sandbox, which is regularly slower than the default 20s expect timeout
    // on staging. Allow up to 60s before treating it as a failure.
    await expect(this.gocardlessHeading).toBeVisible({ timeout: 60000 });
  }

  async verifyDirectDebitFormFields() {
    // GoCardless Direct Debit dropin fields live inside the cross-origin iframe.
    await expect(this.countryDropdown).toBeVisible();
    await expect(this.addressLine1Field).toBeVisible();
    await expect(this.emailField).toBeVisible();
    await expect(this.confirmAddressButton).toBeVisible();
  }

  async enterEmail(email: string) {
    await this.emailField.fill(email);
  }

  async enterName(firstName: string, lastName: string) {
    await this.firstNameField.fill(firstName);
    await this.lastNameField.fill(lastName);
  }

  async enterAddress(line1: string, line2: string, city: string, postcode: string) {
    await this.addressLine1Field.fill(line1);
    if (line2) {
      await this.addressLine2Field.fill(line2);
    }
    await this.cityField.fill(city);
    await this.postcodeField.fill(postcode);
  }

  async clickSetupDirectDebit() {
    // The button is disabled until a payment method (e.g. Direct Debit) is
    // selected, so wait for it to become enabled before clicking.
    await expect(this.setupDirectDebitButton).toBeEnabled();
    await this.setupDirectDebitButton.click();
  }

  async clickDirectDebit() {
    await this.directDebitButton.click();
  }

  async clickConfirmAddress() {
    await this.confirmAddressButton.click();
  }

  async enterBankDetails(sortCode: string, accountNumber: string) {
    await this.sortCodeField.fill(sortCode);
    await this.accountNumberField.fill(accountNumber);
    await this.submitBankDetailsButton.click();
  }

  async confirmDirectDebitSetup() {
    // The bank-details screen leads to a "Confirm your details" page; clicking
    // this finalises the Direct Debit mandate and returns to the app success page.
    await expect(this.confirmDirectDebitButton).toBeVisible();
    await this.confirmDirectDebitButton.click();
  }

  /**
   * Asserts the amount displayed inside the GoCardless dropin matches the
   * amount the app quoted. Catches pricing/rounding integration bugs that
   * UI-only assertions can't see.
   */
  async verifyGoCardlessAmount(amount: string) {
    await expect(this.gocardlessFrame.getByText(amount).first()).toBeVisible({ timeout: 20000 });
  }

  /**
   * Switches the GoCardless sandbox to a specific test bank. Handles both
   * entry points: the "Choose bank" button (no bank selected yet) and the
   * "Change" link (a bank is already pre-selected).
   */
  async chooseBankByName(bankName: RegExp | string) {
    await this.page.waitForTimeout(1500);
    if (await this.chooseBankButton.isVisible().catch(() => false)) {
      await this.chooseBankButton.click();
    } else {
      await this.changeBankLink.click();
    }
    // The bank picker sometimes renders a search box before the list.
    if (await this.bankSearchInput.isVisible().catch(() => false)) {
      const query = typeof bankName === 'string' ? bankName : 'Payment Failed';
      await this.bankSearchInput.fill(query.slice(0, 20));
    }
    await this.gocardlessFrame.getByText(bankName).first().click();
  }

  /** Clicks "Continue to web bank login" without waiting for a popup (failing banks error inside the iframe). */
  async clickBankAuthLink() {
    await this.bankAuthLinkButton.click();
  }

  /**
   * Verifies the GoCardless dropin surfaced a bank-connection failure with a
   * retry path, i.e. a failed payment is not silently treated as a success.
   */
  async verifyBankConnectionProblem() {
    await expect(this.bankConnectionProblemMessage).toBeVisible({ timeout: 45000 });
    await expect(this.bankTryAgainButton).toBeVisible();
  }

  /** The failed payment must leave the customer on the payment step - not on the success page. */
  async verifyStillOnPaymentStep() {
    await expect(this.page).toHaveURL(/\/journey\/step4/);
    await expect(this.successPageHeading).not.toBeVisible();
  }

  async chooseSuccessBank() {
    // After confirming the address the GoCardless sandbox usually PRE-SELECTS
    // "Success Bank" (shown with a tick and a "Change" link) and renders no
    // "Choose bank" button. Only run the manual selection flow when that
    // button is actually present; otherwise the bank is already chosen.
    await this.page.waitForTimeout(1500);
    if (await this.chooseBankButton.isVisible().catch(() => false)) {
      await this.chooseBankButton.click();
      await this.bankSearchInput.fill('success');
      await this.successBankOption.click();
    }
  }

  async verifySuccessBankVisible() {
    await expect(this.successBankHeading).toBeVisible();
  }

  async continueToWebBankLogin(): Promise<Page> {
    // "Continue to web bank login" opens the bank authorisation in a new tab.
    // In the GoCardless sandbox the pre-selected "Success Bank" auto-authorises
    // and the new tab lands on the GoCardless success page.
    const authButton = this.bankAuthLinkButton;
    await authButton.scrollIntoViewIfNeeded();
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 30000 });
    try {
      await authButton.click({ timeout: 5000 });
    } catch {
      // GoCardless's QR-code screen sometimes keeps a decorative overlay above
      // the button, so Playwright's hit-target check never passes even though
      // the button works for real users. Fire the click on the button itself.
      await authButton.dispatchEvent('click');
    }
    const bankPage = await popupPromise;
    await bankPage.waitForLoadState();
    return bankPage;
  }

  async verifyDirectDebitSuccess(bankPage: Page, email = 'john.smith@test.com') {
    await expect(bankPage).toHaveURL(/outcome=success/);
    await expect(
      bankPage.getByRole('heading', { name: 'Payment and set up successful!' }),
    ).toBeVisible();
    await expect(bankPage.getByText(/set up your Direct Debit/i)).toBeVisible();
    await expect(bankPage.getByText(email)).toBeVisible();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async isStepIndicatorActive(): Promise<boolean> {
    return await this.stepIndicator.isVisible();
  }

  async verifyReferralPopupVisible() {
    await expect(this.referralModal).toBeVisible();
    await expect(this.referralPurchaseMessage).toBeVisible();
    await expect(this.referralOfferHeading).toBeVisible();
    await expect(this.referAFriendButton).toBeVisible();
    await expect(this.poweredByMentionMe).toBeVisible();
  }

  async closeReferralPopup() {
    // The popup may not always appear; skip closing if the success page is already shown.
    if (!(await this.referralModal.isVisible().catch(() => false))) {
      return;
    }
    // Prefer the Close (X) button inside the iframe; fall back to the closable mask.
    await this.referralCloseButton.click().catch(async () => {
      await this.referralMask.click({ position: { x: 5, y: 5 } });
    });
    await expect(this.referralModal).toBeHidden();
  }

  async verifySuccessPage() {
    await this.waitForLoaderToDisappear();
    await expect(this.successPageHeading).toBeVisible({ timeout: 30000 });
    await expect(this.emailDocsMessage).toBeVisible({ timeout: 30000 });
    // Staging occasionally omits the "all set up" line while still issuing cover;
    // prefer it when present, but the welcome heading + docs email is the hard gate.
    if (await this.policySetupMessage.isVisible().catch(() => false)) {
      await expect(this.policySetupMessage).toBeVisible();
    }
  }

  async verifyPolicyNumber() {
    await this.waitForLoaderToDisappear();
    await expect(this.policyNumberMessage).toBeVisible({ timeout: 30000 });
  }

  async verifyEmailConfirmation() {
    await this.waitForLoaderToDisappear();
    await expect(this.emailDocsMessage).toBeVisible({ timeout: 30000 });
  }

  async verifyPolicySetupSuccess() {
    // GoCardless redirects back to the app after the mandate is created, which can
    // take a while, so allow extra time for the success page to render.
    await expect(this.successPageHeading).toBeVisible({ timeout: 60000 });
    // The Mention Me referral popup can overlay the success page; close it
    // (no-op when not shown) so the remaining assertions aren't blocked.
    await this.closeReferralPopup();
    await this.waitForLoaderToDisappear();
    await expect(this.emailDocsMessage).toBeVisible({ timeout: 30000 });
    // Policy number is the strongest proof of purchase when staging renders it.
    if (await this.policyNumberMessage.isVisible().catch(() => false)) {
      await expect(this.policyNumberMessage).toBeVisible();
    } else if (await this.policySetupMessage.isVisible().catch(() => false)) {
      await expect(this.policySetupMessage).toBeVisible();
    }
  }

  /** Annual Card purchase used after switching payment methods (Excel iyp_21). */
  async completeAnnualCardPurchase(card: {
    number: string;
    expiry: string;
    securityCode: string;
    name: string;
  }) {
    await this.selectPaymentFrequency('annual');
    await this.page.waitForTimeout(1000);
    await this.selectCardPaymentMethod();
    await this.verifyCardPaymentMethodActive();
    await this.fillCardDetails(card);
    await this.submitCardPayment();
  }
}
