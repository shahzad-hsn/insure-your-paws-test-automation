import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import petData from '../data/petsData.json';
import { REGEX_PATTERNS, VALIDATION_LIMITS } from '../utils/constants';

const errorMessages = petData.errorMessages;
const validationTestData = petData.validationTestData;

export class PetDetailsPage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly petNameField: Locator;
  private readonly catButton: Locator;
  private readonly dogButton: Locator;
  private readonly pedigreeButton: Locator;
  private readonly crossButton: Locator;
  private readonly moggieButton: Locator;
  private readonly breedDropdown: Locator;
  private readonly breedConfirmCheckbox: Locator;
  private readonly maleButton: Locator;
  private readonly femaleButton: Locator;
  private readonly amountPaidField: Locator;
  private readonly didntPayCheckbox: Locator;
  private readonly neuteredYesButton: Locator;
  private readonly neuteredNoButton: Locator;
  private readonly postcodeField: Locator;
  private readonly findButton: Locator;
  private readonly manualAddressLink: Locator;
  private readonly addressLine1Field: Locator;
  private readonly addressLine2Field: Locator;
  private readonly townField: Locator;
  private readonly countyField: Locator;
  private readonly manualPostcodeField: Locator;
  private readonly dobDayField: Locator;
  private readonly dobMonthField: Locator;
  private readonly dobYearField: Locator;
  private readonly todayButton: Locator;
  private readonly tomorrowButton: Locator;
  private readonly customDateLink: Locator;
  private readonly customDatePicker: Locator;
  private readonly addPetButton: Locator;
  private readonly removePetButton: Locator;
  private readonly getQuoteButton: Locator;
  private readonly underEightWeeksError: Locator;
  private readonly stepIndicator: Locator;
  private readonly amountPaidFieldDisabled: Locator;
  private readonly petHeading: Locator;
  private readonly addressDropdown: Locator;
  private readonly addressSelectionError: Locator;
  private readonly dropdownOptions: Locator;
  private readonly quoteStepIndicator: Locator;
  private readonly addressLine1Error: Locator;
  private readonly townCityError: Locator;
  private readonly policyStartDateText: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { name: 'Tell us about your pet' });
    this.petNameField = page.getByTestId('pet_name_fld');
    this.catButton = page.getByTestId('cat_btn');
    this.dogButton = page.getByTestId('dog_btn');
    this.pedigreeButton = page.getByTestId('type_of_animal_pedidree_btn');
    this.crossButton = page.getByTestId('type_of_animal_cross_btn');
    this.moggieButton = page.getByTestId('type_of_animal_mixed_btn');
    this.breedDropdown = page.getByText('Select breed').locator('..');
    this.breedConfirmCheckbox = page.getByRole('checkbox', { name: /breeds that we don.t cover/i });
    this.maleButton = page.getByTestId('pet_gender_male_btn');
    this.femaleButton = page.getByTestId('pet_gender_female_btn');
    this.amountPaidField = page.getByPlaceholder('Enter Amount £');
    this.amountPaidFieldDisabled = page.locator('[name="pets[0].amount_paid"]');
    this.didntPayCheckbox = page.getByTestId('no_pay_btn');
    this.neuteredYesButton = page.getByTestId('pet_neutered_yes_btn');
    this.neuteredNoButton = page.getByTestId('pet_neutered_no_btn');
    this.postcodeField = page.getByTestId('home_address_fld');
    this.findButton = page.getByTestId('find_address_btn');
    this.manualAddressLink = page.getByTestId('manual_address_lnk');
    this.addressLine1Field = page.getByTestId('address_line1_fld');
    this.addressLine2Field = page.getByTestId('address_line2_fld');
    this.townField = page.getByTestId('city_fld');
    this.countyField = page.getByTestId('county_fld');
    this.manualPostcodeField = page.getByTestId('manual_postcode_fld');
    this.dobDayField = page.getByPlaceholder('DD');
    this.dobMonthField = page.getByPlaceholder('MM');
    this.dobYearField = page.getByPlaceholder('YYYY');
    this.todayButton = page.getByTestId('policy_start_date_today_btn');
    this.tomorrowButton = page.getByTestId('policy_start_date_tomorrow_btn');
    this.customDateLink = page.getByText('Custom date', { exact: true });
    this.customDatePicker = page.locator('.compDatepicker, .react-datepicker-wrapper, .picker-container').first();
    this.addPetButton = page.getByTestId('pet_add_btn');
    // Trash control shown beside each multi-pet block heading (not present for a single pet).
    this.removePetButton = page.getByRole('button', { name: 'Remove', exact: true });
    this.getQuoteButton = page.getByTestId('get_quote2_btn');
    this.underEightWeeksError = page.getByText(errorMessages.petDetails.underEightWeeks);
    this.stepIndicator = this.journeyStepIndicator('Your pet');
    this.quoteStepIndicator = this.journeyStepIndicator('Quote');
    this.petHeading = page.locator('.block-title');
    this.addressDropdown = page.getByText('Select address', {exact: true});
    this.addressSelectionError = page.getByText(errorMessages.petDetails.addressSelection);
    this.dropdownOptions = page.getByRole('option');
    this.addressLine1Error = page.getByText(errorMessages.petDetails.addressLine1);
    this.townCityError = page.getByText(errorMessages.petDetails.townCity);
    this.policyStartDateText = page.getByText(new RegExp(errorMessages.policyStartDate.prefix));
  }

  async verifyPageHeadingVisible(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
  }

  async isPageHeadingVisible(): Promise<boolean> {
    try {
      await this.pageHeading.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async enterPetName(name: string) {
    await this.petNameField.last().fill(name);
  }

  async selectPetType(type: 'cat' | 'dog') {
    if (type === 'cat') {
      await this.catButton.last().click();
    } else {
      await this.dogButton.last().click();
    }
  }

  async selectBreedType(breedType: 'pedigree' | 'cross' | 'moggie', breed?: string) {
    if (breedType === 'pedigree') {
      await this.pedigreeButton.last().click();
      if (breed) {
        await this.selectBreed(breed);
      }
    } else if (breedType === 'cross') {
      await this.crossButton.last().click();
      if (breed) {
        await this.selectBreed(breed);
      }
    } else if (breedType === 'moggie') {
      await this.moggieButton.last().click();
      // The same button is "Moggie" for cats (no breed dropdown) and "Mixed"
      // for dogs (which DOES reveal a breed dropdown). Select a breed only when
      // the dropdown is actually present.
      if (await this.breedDropdown.last().isVisible().catch(() => false)) {
        await this.selectBreed(breed);
      }
    }
    // Dogs must confirm their pet isn't one of the excluded breeds before a
    // quote can be generated. This checkbox only renders for dogs (cross/mixed),
    // so we tick it only when it's actually present to avoid penalising cats.
    if (await this.breedConfirmCheckbox.isVisible().catch(() => false)) {
      await this.breedConfirmCheckbox.check();
    }
  }

  async selectBreed(breed?: string) {
    await this.breedDropdown.last().click();
    await this.page.waitForTimeout(300);
    await this.dropdownOptions.first().click();
  }

  async selectPetGender(gender: 'male' | 'female') {
    if (gender === 'male') {
      await this.maleButton.last().click();
    } else {
      await this.femaleButton.last().click();
    }
  }

  async enterAmountPaid(amount: string) {
    await this.amountPaidField.last().fill(amount);
  }

  async checkDidntPay() {
    await this.didntPayCheckbox.last().check();
  }

  async selectNeutered(neutered: boolean) {
    if (neutered) {
      await this.neuteredYesButton.last().click();
    } else {
      await this.neuteredNoButton.last().click();
    }
  }

  async enterPostcode(postcode: string) {
    await this.postcodeField.last().fill(postcode);
    await this.clickFind();
    await this.page.waitForTimeout(1000);
    await this.selectFirstAddressFromDropdown();
  }

  async clickFind() {
    await this.findButton.last().click();
  }

  async enterPostcodeAndFind(postcode: string) {
    // Like enterPostcode but WITHOUT auto-selecting an address, so the
    // "address not selected" negative case can actually be exercised.
    await this.postcodeField.last().fill(postcode);
    await this.clickFind();
  }

  async clickManualAddress() {
    await this.manualAddressLink.last().click();
  }

  async enterManualAddress(
    addressLine1: string,
    addressLine2: string,
    town: string,
    county: string,
    postcode: string
  ) {
    await this.addressLine1Field.last().fill(addressLine1);
    await this.addressLine2Field.last().fill(addressLine2);
    await this.townField.last().fill(town);
    await this.countyField.last().fill(county);
    await this.postcodeField.last().fill(postcode);
  }

  async getManualAddressValues(): Promise<{
    addressLine1: string;
    addressLine2: string;
    town: string;
    county: string;
    postcode: string;
  }> {
    return {
      addressLine1: await this.addressLine1Field.inputValue(),
      addressLine2: await this.addressLine2Field.inputValue(),
      town: await this.townField.inputValue(),
      county: await this.countyField.inputValue(),
      postcode: await this.postcodeField.inputValue()
    };
  }

  async enterDateOfBirth(day: string, month: string, year: string) {
    await this.dobDayField.last().fill(day);
    await this.dobMonthField.last().fill(month);
    await this.dobYearField.last().fill(year);
  }

  async selectPolicyStartDate(when: 'today' | 'tomorrow') {
    if (when === 'today') {
      await this.todayButton.last().click();
    } else {
      await this.tomorrowButton.last().click();
    }
  }

  async clickAddPet() {
    await this.addPetButton.last().click();
  }

  /** Removes the pet block at 0-based index (matches the order of Remove buttons). */
  async clickRemovePet(index = 0) {
    await expect(this.removePetButton.nth(index)).toBeVisible();
    await this.removePetButton.nth(index).click();
  }

  async verifyRemovePetButtonCount(expected: number) {
    await expect(this.removePetButton).toHaveCount(expected);
  }

  async getAllPetNameValues(): Promise<string[]> {
    return this.petNameField.evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement).value),
    );
  }

  async verifyPetNamesExact(expectedNames: string[]) {
    await expect.poll(async () => this.getAllPetNameValues()).toEqual(expectedNames);
  }

  async verifyUnderEightWeeksError() {
    await expect(this.underEightWeeksError).toBeVisible();
  }

  async verifyStillOnPetDetailsStep() {
    await expect(this.stepIndicator).toBeVisible();
    await expect(this.quoteStepIndicator).not.toBeVisible();
  }

  async isAddPetButtonDisabled(): Promise<boolean> {
    return await this.addPetButton.last().isDisabled();
  }

  async verifyAddPetButtonDisabled(): Promise<void> {
    expect(await this.isAddPetButtonDisabled()).toBe(true);
  }

  async getPetHeadingText(petNumber: number): Promise<string> {
    return await this.petHeading.nth(petNumber - 1).textContent() || '';
  }

  async verifyPetHeading(petNumber: number): Promise<void> {
    if (petNumber === 1) {
      return;
    }
    const headingText = await this.getPetHeadingText(petNumber);
    const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
    const expectedOrdinal = ordinals[petNumber - 1];
    expect(headingText.trim()).toContain(expectedOrdinal);
    expect(headingText.trim()).toContain('Pet Details');
  }

  async clickGetQuote(options: { waitForQuote?: boolean } = { waitForQuote: true }) {
    await this.getQuoteButton.click();
    if (options.waitForQuote) {
      await this.waitForQuoteNavigation();
    }
  }

  async waitForQuoteNavigation() {
    await expect(this.quoteStepIndicator).toBeVisible({ timeout: 60000 });
  }

  async isStepIndicatorActive(): Promise<boolean> {
    return await this.stepIndicator.isVisible();
  }

  async verifyStepIndicatorActive() {
    await expect(this.stepIndicator).toBeVisible();
  }

  async selectFirstAddressFromDropdown() {
    // OneTrust's dark filter can reappear after Find and block the react-select.
    await this.dismissCookieOverlay();
    await this.addressDropdown.click();
    await this.dropdownOptions.first().click();
  }

  async isAddressSelectionErrorVisible(): Promise<boolean> {
    return await this.addressSelectionError.isVisible();
  }

  async verifyAddressSelectionError() {
    await expect(this.addressSelectionError).toBeVisible();
  }

  async verifyAddressDropdownVisible(timeout = 20000) {
    await expect(this.addressDropdown).toBeVisible({ timeout });
  }

  async verifyAddressDropdownNotVisible() {
    await expect(this.addressDropdown).not.toBeVisible();
  }

  async verifyManualAddressLinkVisible() {
    await expect(this.manualAddressLink.last()).toBeVisible();
  }

  async verifyManualAddressErrorsCleared() {
    await expect(this.addressLine1Error).not.toBeVisible();
    await expect(this.townCityError).not.toBeVisible();
  }

  getErrorMessage(fieldName: string): Locator {
    return this.page.locator('.error').filter({ hasText: fieldName });
  }

  async isPetNameErrorVisible(): Promise<boolean> {
    return await this.getErrorMessage(errorMessages.petDetails.petName).isVisible();
  }

  async isPetTypeErrorVisible(): Promise<boolean> {
    return await this.getErrorMessage(errorMessages.petDetails.petType).first().isVisible();
  }

  async isPostcodeErrorVisible(): Promise<boolean> {
    return await this.getErrorMessage(errorMessages.petDetails.postcode).isVisible();
  }

  async isDateOfBirthErrorVisible(): Promise<boolean> {
    return await this.getErrorMessage(errorMessages.petDetails.dateOfBirth).isVisible();
  }

  async isPolicyStartErrorVisible(): Promise<boolean> {
    return await this.getErrorMessage(errorMessages.petDetails.policyStart).isVisible();
  }

  async getPolicyStartDateText(): Promise<string> {
    return await this.policyStartDateText.textContent() || '';
  }

  async validatePolicyStartDate(selection: 'today' | 'tomorrow'): Promise<boolean> {
    const dateText = await this.getPolicyStartDateText();
    const dateMatch = dateText.match(REGEX_PATTERNS.DATE_FORMAT);
    
    if (!dateMatch) return false;

    const displayedDate = dateMatch[1];
    const expectedDate = this.getExpectedDate(selection);

    return displayedDate === expectedDate;
  }

  private getExpectedDate(selection: 'today' | 'tomorrow'): string {
    const date = new Date();
    if (selection === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async getPetNameValue(): Promise<string> {
    return await this.petNameField.last().inputValue();
  }

  async getAmountPaidValue(): Promise<string> {
    return await this.amountPaidField.last().inputValue();
  }

  async getPostcodeValue(): Promise<string> {
    return await this.postcodeField.last().inputValue();
  }

  private async isButtonSelected(button: Locator): Promise<boolean> {
    const classList = await button.last().getAttribute('class');
    return classList?.includes('active') || classList?.includes('selected') || false;
  }

  async isPetTypeSelected(type: 'cat' | 'dog'): Promise<boolean> {
    const button = type === 'cat' ? this.catButton : this.dogButton;
    return await this.isButtonSelected(button);
  }

  async isGenderSelected(gender: 'male' | 'female'): Promise<boolean> {
    const button = gender === 'male' ? this.maleButton : this.femaleButton;
    return await this.isButtonSelected(button);
  }

  async isNeuteredSelected(neutered: boolean): Promise<boolean> {
    const button = neutered ? this.neuteredYesButton : this.neuteredNoButton;
    return await this.isButtonSelected(button);
  }

  async isAmountFieldDisabled(): Promise<boolean> {
    return await this.amountPaidFieldDisabled.isDisabled();
  }

  validatePetName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: errorMessages.validation.petName.empty };
    }
    if (name.length < VALIDATION_LIMITS.PET_NAME_MIN_LENGTH) {
      return { isValid: false, error: errorMessages.validation.petName.tooShort };
    }
    if (name.length > VALIDATION_LIMITS.PET_NAME_MAX_LENGTH) {
      return { isValid: false, error: errorMessages.validation.petName.tooLong };
    }
    if (!REGEX_PATTERNS.PET_NAME.test(name)) {
      return { isValid: false, error: errorMessages.validation.petName.invalidFormat };
    }
    return { isValid: true };
  }

  validateAmount(amount: string): { isValid: boolean; error?: string } {
    if (!amount || amount.trim().length === 0) {
      return { isValid: false, error: errorMessages.validation.amount.empty };
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { isValid: false, error: errorMessages.validation.amount.notNumber };
    }
    if (numAmount < 0) {
      return { isValid: false, error: errorMessages.validation.amount.negative };
    }
    if (numAmount > VALIDATION_LIMITS.AMOUNT_MAX) {
      return { isValid: false, error: errorMessages.validation.amount.tooHigh };
    }
    return { isValid: true };
  }

  validatePostcode(postcode: string): { isValid: boolean; error?: string } {
    if (!postcode || postcode.trim().length === 0) {
      return { isValid: false, error: errorMessages.validation.postcode.empty };
    }
    if (!REGEX_PATTERNS.UK_POSTCODE.test(postcode.trim())) {
      return { isValid: false, error: errorMessages.validation.postcode.invalidFormat };
    }
    return { isValid: true };
  }

  validateDateOfBirth(day: string, month: string, year: string): { isValid: boolean; error?: string } {
    if (!day || !month || !year) {
      return { isValid: false, error: errorMessages.validation.dateOfBirth.empty };
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      return { isValid: false, error: errorMessages.validation.dateOfBirth.notNumbers };
    }

    if (dayNum < 1 || dayNum > 31) {
      return { isValid: false, error: errorMessages.validation.dateOfBirth.invalidDay };
    }

    if (monthNum < 1 || monthNum > 12) {
      return { isValid: false, error: errorMessages.validation.dateOfBirth.invalidMonth };
    }

    const currentYear = new Date().getFullYear();
    if (yearNum < VALIDATION_LIMITS.YEAR_MIN || yearNum > currentYear) {
      return { isValid: false, error: errorMessages.validation.dateOfBirth.invalidYear.replace('{currentYear}', currentYear.toString()) };
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1 || date.getFullYear() !== yearNum) {
      return { isValid: false, error: errorMessages.validation.dateOfBirth.invalidDate };
    }

    if (date > new Date()) {
      return { isValid: false, error: errorMessages.validation.dateOfBirth.futureDate };
    }

    return { isValid: true };
  }

  async verifyAllErrorsDisplayed(): Promise<void> {
    await expect(this.getErrorMessage(errorMessages.petDetails.petName)).toBeVisible();
    await expect(this.getErrorMessage(errorMessages.petDetails.petType).first()).toBeVisible();
    await expect(this.getErrorMessage(errorMessages.petDetails.postcode)).toBeVisible();
    await expect(this.getErrorMessage(errorMessages.petDetails.dateOfBirth)).toBeVisible();
    await expect(this.getErrorMessage(errorMessages.petDetails.policyStart)).toBeVisible();
  }

  async verifyPolicyStartDateIsCorrect(selection: 'today' | 'tomorrow'): Promise<void> {
    const policyDateText = await this.getPolicyStartDateText();
    expect(policyDateText).toContain(errorMessages.policyStartDate.prefix);
    const isValid = await this.validatePolicyStartDate(selection);
    expect(isValid).toBe(true);
  }

  async verifyInputValues(expectedName: string, expectedAmount: string, expectedPostcode: string): Promise<void> {
    expect(await this.getPetNameValue()).toBe(expectedName);
    const actualAmount = await this.getAmountPaidValue();
    expect(actualAmount.replace('£', '')).toBe(expectedAmount);
    expect(await this.getPostcodeValue()).toBe(expectedPostcode);
  }

  verifyPetNameValidation(): void {
    validationTestData.petName.invalid.forEach(testCase => {
      expect(this.validatePetName(testCase.input).isValid).toBe(false);
    });
    validationTestData.petName.valid.forEach(testCase => {
      expect(this.validatePetName(testCase.input).isValid).toBe(true);
    });
  }

  verifyAmountValidation(): void {
    validationTestData.amount.invalid.forEach(testCase => {
      expect(this.validateAmount(testCase.input).isValid).toBe(false);
    });
    validationTestData.amount.valid.forEach(testCase => {
      expect(this.validateAmount(testCase.input).isValid).toBe(true);
    });
  }

  verifyPostcodeValidation(): void {
    validationTestData.postcode.invalid.forEach(testCase => {
      expect(this.validatePostcode(testCase.input).isValid).toBe(false);
    });
    validationTestData.postcode.valid.forEach(testCase => {
      expect(this.validatePostcode(testCase.input).isValid).toBe(true);
    });
  }

  verifyDateOfBirthValidation(): void {
    const futureYear = (new Date().getFullYear() + 1).toString();
    
    validationTestData.dateOfBirth.invalid.forEach(testCase => {
      const year = testCase.year === 'FUTURE_YEAR' ? futureYear : testCase.year;
      expect(this.validateDateOfBirth(testCase.day, testCase.month, year).isValid).toBe(false);
    });
    
    validationTestData.dateOfBirth.valid.forEach(testCase => {
      expect(this.validateDateOfBirth(testCase.day, testCase.month, testCase.year).isValid).toBe(true);
    });
  }

  async verifyPetTypeSelection(expectedType: 'cat' | 'dog'): Promise<void> {
    const oppositeType = expectedType === 'cat' ? 'dog' : 'cat';
    expect(await this.isPetTypeSelected(expectedType)).toBe(true);
    expect(await this.isPetTypeSelected(oppositeType)).toBe(false);
  }

  async verifyGenderSelection(expectedGender: 'male' | 'female'): Promise<void> {
    const oppositeGender = expectedGender === 'male' ? 'female' : 'male';
    expect(await this.isGenderSelected(expectedGender)).toBe(true);
    expect(await this.isGenderSelected(oppositeGender)).toBe(false);
  }

  async verifyNeuteredSelection(expectedNeutered: boolean): Promise<void> {
    expect(await this.isNeuteredSelected(expectedNeutered)).toBe(true);
    expect(await this.isNeuteredSelected(!expectedNeutered)).toBe(false);
  }

  async clickBreedTypeButton(breedType: 'pedigree' | 'cross' | 'moggie'): Promise<void> {
    const button =
      breedType === 'pedigree' ? this.pedigreeButton :
      breedType === 'cross' ? this.crossButton :
      this.moggieButton;
    await button.last().click();
  }

  async checkBreedConfirm(): Promise<void> {
    await this.breedConfirmCheckbox.check();
  }

  async isBreedTypeSelected(breedType: 'pedigree' | 'cross' | 'moggie'): Promise<boolean> {
    const button =
      breedType === 'pedigree' ? this.pedigreeButton :
      breedType === 'cross' ? this.crossButton :
      this.moggieButton;
    return await this.isButtonSelected(button);
  }

  async verifyBreedTypeSelection(breedType: 'pedigree' | 'cross' | 'moggie'): Promise<void> {
    expect(await this.isBreedTypeSelected(breedType)).toBe(true);
  }

  async isBreedDropdownVisible(): Promise<boolean> {
    return await this.breedDropdown.last().isVisible().catch(() => false);
  }

  async isBreedConfirmCheckboxVisible(): Promise<boolean> {
    return await this.breedConfirmCheckbox.isVisible().catch(() => false);
  }

  async openCustomDate(): Promise<void> {
    await this.customDateLink.last().click();
  }

  async isCustomDatePickerVisible(): Promise<boolean> {
    return await this.customDatePicker.isVisible().catch(() => false);
  }

  async verifyCustomDatePickerVisible(): Promise<void> {
    await expect(this.customDatePicker).toBeVisible();
  }

  async verifyPolicyStartOptionsPresent(): Promise<void> {
    await expect(this.todayButton.last()).toBeVisible();
    await expect(this.tomorrowButton.last()).toBeVisible();
    await expect(this.customDateLink.last()).toBeVisible();
  }

  async verifyAmountFieldState(shouldBeDisabled: boolean): Promise<void> {
    expect(await this.isAmountFieldDisabled()).toBe(shouldBeDisabled);
  }

  async verifyManualAddressFormVisible(): Promise<void> {
    await expect(this.addressLine1Field.last()).toBeVisible();
    await expect(this.townField.last()).toBeVisible();
    await expect(this.countyField.last()).toBeVisible();
  }

  async verifyAllSelections(
    petType: 'cat' | 'dog',
    gender: 'male' | 'female',
    neutered: boolean
  ): Promise<void> {
    await this.verifyPetTypeSelection(petType);
    await this.verifyGenderSelection(gender);
    await this.verifyNeuteredSelection(neutered);
  }

  async verifyCompleteFormState(
    name: string,
    petType: 'cat' | 'dog',
    gender: 'male' | 'female',
    amount: string,
    neutered: boolean,
    postcode: string
  ): Promise<void> {
    expect(await this.getPetNameValue()).toBe(name);
    await this.verifyPetTypeSelection(petType);
    await this.verifyGenderSelection(gender);
    const actualAmount = await this.getAmountPaidValue();
    expect(actualAmount.replace('£', '')).toBe(amount);
    await this.verifyNeuteredSelection(neutered);
    expect(await this.getPostcodeValue()).toBe(postcode);
  }

  async getSelectedBreed(): Promise<string> {
    const moggieSelected = await this.moggieButton.last().getAttribute('class');
    if (moggieSelected?.includes('active')) {
      return 'Moggie';
    }
    
    const pedigreeSelected = await this.pedigreeButton.last().getAttribute('class');
    if (pedigreeSelected?.includes('active')) {
      const breedText = await this.breedDropdown.last().textContent();
      return breedText?.trim() || '';
    }
    
    const crossSelected = await this.crossButton.last().getAttribute('class');
    if (crossSelected?.includes('active')) {
      const breedText = await this.breedDropdown.last().textContent();
      return breedText?.trim() || '';
    }
    
    return '';
  }
}
