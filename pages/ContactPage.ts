import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Contact Us page (/contact-us).
 *
 * Notes for maintainers:
 * - The first name / last name / message inputs only register their value in the
 *   form's state when typed key-by-key; a plain `.fill()` leaves the form
 *   thinking they are empty. We therefore type every text field with
 *   `pressSequentially`.
 * - The form is protected by Google reCAPTCHA, so a genuine end-to-end
 *   submission cannot be automated reliably. These helpers only exercise the
 *   client-side validation, which runs before reCAPTCHA.
 */
export class ContactPage extends BasePage {
  private readonly heading: Locator;
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly mobileField: Locator;
  private readonly messageField: Locator;
  private readonly enquirySelect: Locator;
  private readonly policyHolderSelect: Locator;
  private readonly submitButton: Locator;
  private readonly requiredErrors: Locator[];
  private readonly emailFormatError: Locator;
  private readonly mobileFormatError: Locator;
  private readonly firstNameError: Locator;
  private readonly lastNameError: Locator;
  private readonly messageError: Locator;

  // Exact validation messages the form renders (captured from the live app).
  static readonly REQUIRED_ERRORS = [
    'Please enter your first name',
    'Please enter your surname',
    'Please enter your email address',
    'Please enter your phone number',
    'Please select an option from the list',
    'Please select policy holder',
    'Please add your message',
  ];
  static readonly EMAIL_FORMAT_ERROR = 'Please enter a valid email address';
  static readonly MOBILE_FORMAT_ERROR = 'Please enter a valid telephone / mobile number';

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: "We'd love to hear from you" });
    this.firstNameField = page.getByPlaceholder('Enter first name');
    this.lastNameField = page.getByPlaceholder('Enter last name');
    this.emailField = page.getByPlaceholder('Enter email address');
    this.mobileField = page.getByPlaceholder('Enter mobile number');
    this.messageField = page.getByPlaceholder('Enter Message');
    this.enquirySelect = page.locator('select').nth(0);
    this.policyHolderSelect = page.locator('select').nth(1);
    this.submitButton = page.getByRole('button', { name: 'Submit', exact: true });
    this.requiredErrors = ContactPage.REQUIRED_ERRORS.map((message) => page.getByText(message).first());
    this.emailFormatError = page.getByText(ContactPage.EMAIL_FORMAT_ERROR).first();
    this.mobileFormatError = page.getByText(ContactPage.MOBILE_FORMAT_ERROR).first();
    this.firstNameError = page.getByText(ContactPage.REQUIRED_ERRORS[0]).first();
    this.lastNameError = page.getByText(ContactPage.REQUIRED_ERRORS[1]).first();
    this.messageError = page.getByText(ContactPage.REQUIRED_ERRORS[6]).first();
  }

  async goto(): Promise<void> {
    await this.navigate('/contact-us');
    await this.rejectCookies();
  }

  async verifyLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  /** Types a value key-by-key so the form's controlled inputs register it. */
  private async typeInto(field: Locator, value: string): Promise<void> {
    await field.click();
    await field.fill('');
    await field.pressSequentially(value, { delay: 15 });
  }

  async fillContactDetails(details: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    message?: string;
    enquiry?: boolean;
    policyHolder?: 'Yes' | 'No';
  }): Promise<void> {
    if (details.firstName !== undefined) await this.typeInto(this.firstNameField, details.firstName);
    if (details.lastName !== undefined) await this.typeInto(this.lastNameField, details.lastName);
    if (details.email !== undefined) await this.typeInto(this.emailField, details.email);
    if (details.mobile !== undefined) await this.typeInto(this.mobileField, details.mobile);
    if (details.message !== undefined) await this.typeInto(this.messageField, details.message);
    if (details.enquiry) await this.enquirySelect.selectOption({ index: 1 });
    if (details.policyHolder) await this.policyHolderSelect.selectOption({ label: details.policyHolder });
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click();
  }

  async verifyAllRequiredErrorsVisible(): Promise<void> {
    for (const error of this.requiredErrors) {
      await expect(error).toBeVisible();
    }
  }

  async verifyEmailFormatError(): Promise<void> {
    await expect(this.emailFormatError).toBeVisible();
  }

  async verifyMobileFormatError(): Promise<void> {
    await expect(this.mobileFormatError).toBeVisible();
  }

  /**
   * Asserts none of the field-level validation messages are shown. The app keeps
   * the error nodes in the DOM and toggles their visibility, so we assert they
   * are hidden rather than absent.
   */
  async verifyNoValidationErrors(): Promise<void> {
    await expect(this.firstNameError).toBeHidden();
    await expect(this.lastNameError).toBeHidden();
    await expect(this.messageError).toBeHidden();
    await expect(this.emailFormatError).toBeHidden();
    await expect(this.mobileFormatError).toBeHidden();
  }
}
