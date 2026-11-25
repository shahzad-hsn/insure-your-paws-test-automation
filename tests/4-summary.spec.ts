import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import { SummaryPage } from '../pages/SummaryPage';
import { QuotePage } from '../pages/QuotePage';
import { PetDetailsPage } from '../pages/PetDetailsPage';
import petsData from '../data/index';

const sd = petsData.summaryData;

test.describe('Summary Page - Complete Coverage', () => {
  let summaryPage: SummaryPage;
  let quotePage: QuotePage;
  let petDetailsPage: PetDetailsPage;
  
  let selectedPetName: string;
  let selectedBreed: string;
  let selectedVetFeeCover: string;
  let selectedExcess: string;
  let selectedVoluntaryExcess: string;
  let quotedMonthlyPrice: string;

  test.beforeEach(async ({ journey, summaryPage: sp, quotePage: qp, petDetailsPage: pdp }) => {
    summaryPage = sp;
    quotePage = qp;
    petDetailsPage = pdp;

    const pet = sd.pet;
    selectedPetName = pet.name;

    await journey.goToPetDetails();
    await journey.fillPetDetails(pet);
    selectedBreed = await petDetailsPage.getSelectedBreed();
    await petDetailsPage.clickGetQuote();
    await quotePage.verifyStepIndicatorActive();

    await step('Capture quote page values', async () => {
      selectedVetFeeCover = await quotePage.getVetFeeCoverValue();
      selectedExcess = await quotePage.getExcessValue();
      selectedVoluntaryExcess = await quotePage.getVoluntaryExcessValue();
      quotedMonthlyPrice = await quotePage.getMonthlyTotal();
    });

    await step('Navigate to summary page', async () => {
      await journey.proceedQuoteToSummary();
    });
  });

  test('test:1:- should verify complete policy summary matches previous selections', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Policy Summary Verification');
    await allure.severity('blocker');
    await allure.tag('smoke');
    await allure.tag('e2e');

    await step('Verify pet name matches selected value', async () => {
      await summaryPage.verifyPetName(selectedPetName);
    });

    await step('Verify breed matches selected value', async () => {
      await summaryPage.verifyBreed(selectedBreed);
    });

    await step('Verify DOB is displayed', async () => {
      const dob = await summaryPage.getDOB();
      // DOB renders as DD/MM/YYYY, e.g. "01/01/2020"
      expect(dob).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    await step('Verify cover level is displayed', async () => {
      const coverLevel = await summaryPage.getCoverLevel();
      expect(coverLevel).toContain('Lifetime');
    });

    await step('Verify vet fees limit matches quote page selection', async () => {
      const vetFeesLimit = await summaryPage.getVetFeesLimit();
      expect(vetFeesLimit).toContain(selectedVetFeeCover);
    });

    await step('Verify excess matches quote page selection', async () => {
      const excess = await summaryPage.getExcess();
      expect(excess).toContain(selectedExcess);
    });

    await step('Verify voluntary excess matches quote page selection', async () => {
      const voluntaryExcess = await summaryPage.getVoluntaryExcess();
      expect(voluntaryExcess).toContain(selectedVoluntaryExcess);
    });

    await step('Verify optional extras status (all not included by default)', async () => {
      await summaryPage.verifyFindMyPetStatus(sd.optionalExtraStatus.notIncluded);
      await summaryPage.verifySayingGoodbyeStatus(sd.optionalExtraStatus.notIncluded);
      await summaryPage.verifyAwayFromHomeStatus(sd.optionalExtraStatus.notIncluded);
    });

    await step('Verify monthly price matches quote page price', async () => {
      const summaryMonthlyPrice = await summaryPage.getMonthlyPrice();
      expect(summaryMonthlyPrice).toBe(quotedMonthlyPrice);
    });

    await step('Verify cover start date is displayed', async () => {
      const coverStartDate = await summaryPage.getCoverStartDate();
      // Cover start date renders as DD/MM/YYYY, e.g. "08/07/2026"
      expect(coverStartDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  test('test:2:- should validate all required form fields display errors when empty', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Form Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Click Next without filling form', async () => {
      await summaryPage.clickNext();
    });

    await step('Verify first name error is displayed', async () => {
      await summaryPage.verifyFirstNameError();
    });

    await step('Verify last name error is displayed', async () => {
      await summaryPage.verifyLastNameError();
    });

    await step('Verify email error is displayed', async () => {
      await summaryPage.verifyEmailError();
    });

    await step('Verify mobile number error is displayed', async () => {
      await summaryPage.verifyMobileError();
    });

    await step('Verify date of birth error is displayed', async () => {
      await summaryPage.verifyDOBError();
    });
  });

  test('test:3:- should validate email field accepts only valid email format', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Email Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Enter invalid email without @ symbol', async () => {
      await summaryPage.enterEmail(sd.invalidEmails[0]);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify email format error is displayed', async () => {
      await summaryPage.verifyEmailFormatError();
    });

    await step('Clear and enter invalid email without domain', async () => {
      await summaryPage.enterEmail(sd.invalidEmails[1]);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify email format error persists', async () => {
      await summaryPage.verifyEmailFormatError();
    });

    await step('Enter valid email format', async () => {
      await summaryPage.enterEmail(sd.validEmail);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify email error disappears', async () => {
      await summaryPage.verifyEmailFormatErrorNotVisible();
    });
  });

  test('test:4:- should validate mobile number field accepts only valid UK mobile format', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Mobile Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Enter mobile number with letters', async () => {
      await summaryPage.enterMobile(sd.invalidMobiles[0]);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify mobile number error is displayed for invalid characters', async () => {
      await summaryPage.verifyMobileNumberError();
    });

    await step('Enter mobile number with incorrect length', async () => {
      await summaryPage.enterMobile(sd.invalidMobiles[1]);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify mobile number error is displayed for incorrect length', async () => {
      await summaryPage.verifyMobileNumberError();
    });

    await step('Enter valid UK mobile number', async () => {
      await summaryPage.enterMobile(sd.validMobile);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify valid mobile number format is accepted and error is cleared', async () => {
      await summaryPage.verifyMobileNumberValid();
      await summaryPage.verifyMobileNumberErrorNotVisible();
    });
  });

  test('test:5:- should validate date of birth field accepts only valid dates', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('DOB Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Enter invalid day (32)', async () => {
      await summaryPage.enterUserDOB(sd.invalidDayDOB.day, sd.invalidDayDOB.month, sd.invalidDayDOB.year);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify invalid date error', async () => {
      await summaryPage.verifyInvalidDateError();
    });

    await step('Enter invalid month (13)', async () => {
      await summaryPage.enterUserDOB(sd.invalidMonthDOB.day, sd.invalidMonthDOB.month, sd.invalidMonthDOB.year);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify invalid month error', async () => {
      await summaryPage.verifyInvalidDateError();
    });

    await step('Enter future date', async () => {
      const futureYear = new Date().getFullYear() + 1;
      await summaryPage.enterUserDOB('01', '01', futureYear.toString());
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify future date error', async () => {
      await summaryPage.verifyFutureDateError();
    });

    await step('Enter valid date of birth', async () => {
      await summaryPage.enterUserDOB(sd.validDOB.day, sd.validDOB.month, sd.validDOB.year);
      await summaryPage.enterFirstName(sd.placeholderName);
      await summaryPage.clickNext();
    });

    await step('Verify valid date is accepted without errors', async () => {
      await summaryPage.verifyDOBErrorsNotVisible();
    });
  });

  test('test:6:- should open and verify policy documents dropdown and PDF links', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Policy Documents');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Click Policy Documents button', async () => {
      await summaryPage.clickPolicyDocuments();
    });

    await step('Verify Policy Documents dropdown is open with all links', async () => {
      await summaryPage.verifyPolicyDocumentsDropdownOpen();
    });

    await step('Verify Policy Wording link targets a reachable PDF', async () => {
      await summaryPage.verifyPolicyDocumentLink('Policy Wording', 'PW');
    });

    await step('Verify IPID link targets a reachable PDF', async () => {
      await summaryPage.verifyPolicyDocumentLink('IPID', 'IPID');
    });
  });

  test('test:7:- should edit pet details and return to summary with updated information', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Edit Pet Details');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('navigation');

    await step('Click Edit pet details link', async () => {
      await summaryPage.clickEditPetDetails();
    });

    await step('Verify navigation to pet details page', async () => {
      await summaryPage.verifyNavigationToPetDetailsPage();
    });

    await step('Update pet name', async () => {
      await petDetailsPage.enterPetName(sd.updatedPetName);
    });

    await step('Navigate back to summary', async () => {
      await petDetailsPage.clickGetQuote();
      await page.waitForLoadState('networkidle');
      await quotePage.clickNext();
      await page.waitForLoadState('networkidle');
    });

    await step('Verify updated pet name is displayed', async () => {
      await summaryPage.verifyPetName(sd.updatedPetName);
    });
  });

  test('test:8:- should edit optional extras and return to summary with updated selections', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Edit Optional Extras');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('navigation');

    await step('Click Edit link for optional extras', async () => {
      await summaryPage.clickEditOptionalExtras();
    });

    await step('Verify navigation to quote page optional extras section', async () => {
      await summaryPage.verifyNavigationToQuotePage();
      await summaryPage.verifyOptionalExtrasSection();
    });

    await step('Select Find My Pet optional extra', async () => {
      await quotePage.selectFindMyPet();
      await page.waitForTimeout(2000);
      await quotePage.waitForProgressBarToDisappear();
    });

    await step('Verify Find My Pet is selected', async () => {
      await quotePage.verifyFindMyPetSelected();
    });

    await step('Navigate back to summary', async () => {
      await quotePage.clickNext();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    await step('Verify Find My Pet is now included in summary', async () => {
      await summaryPage.verifyFindMyPetStatus(sd.optionalExtraStatus.included);
    });

    await step('Verify monthly price has increased after adding the extra', async () => {
      const updatedPrice = await summaryPage.getMonthlyPrice();
      expect(updatedPrice).toMatch(/£[\d,]+\.\d{2}/);
      const before = parseFloat(quotedMonthlyPrice.replace(/[^0-9.]/g, '')) || 0;
      const after = parseFloat(updatedPrice.replace(/[^0-9.]/g, '')) || 0;
      expect(after).toBeGreaterThan(before);
    });
  });

  test('test:9:- should validate agreement checkbox is required before continuing', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Terms Agreement');
    await allure.severity('blocker');
    await allure.tag('validation');
    await allure.tag('negative');

    const user = petsData.userDetails[0];

    await step('Fill all user details', async () => {
      await summaryPage.fillUserDetails(
        user.firstName,
        user.lastName,
        user.email,
        user.mobile,
        user.dob.day,
        user.dob.month,
        user.dob.year
      );
    });

    await step('Select marketing preference', async () => {
      await summaryPage.selectMarketing(false);
    });

    await step('Try to continue without agreeing to terms', async () => {
      await summaryPage.clickNext();
    });

    await step('Verify agreement error is displayed', async () => {
      await summaryPage.verifyTermsAgreementError();
    });

    await step('Agree to terms', async () => {
      await summaryPage.clickAgree();
    });

    await step('Click continue successfully', async () => {
      await summaryPage.clickNext();
    });

    await step('Verify navigation to payment page', async () => {
      await summaryPage.verifyNavigationToPaymentPage();
    });
  });

  test('test:10:- should complete entire user journey with valid data and marketing opt-in', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Complete User Journey');
    await allure.severity('blocker');
    await allure.tag('smoke');
    await allure.tag('e2e');

    const user = petsData.userDetails[0];

    await step('Verify all policy summary sections are visible', async () => {
      await summaryPage.verifyPageHeading();
      await summaryPage.verifyStepIndicatorActive();
    });

    await step('Fill first name', async () => {
      await summaryPage.enterFirstName(user.firstName);
    });

    await step('Fill last name', async () => {
      await summaryPage.enterLastName(user.lastName);
    });

    await step('Fill email address', async () => {
      await summaryPage.enterEmail(user.email);
    });

    await step('Fill mobile number', async () => {
      await summaryPage.enterMobile(user.mobile);
    });

    await step('Fill date of birth', async () => {
      await summaryPage.enterUserDOB(user.dob.day, user.dob.month, user.dob.year);
    });

    await step('Select marketing opt-in (Yes)', async () => {
      await summaryPage.selectMarketing(true);
    });

    await step('Verify marketing Yes is selected', async () => {
      await summaryPage.verifyMarketingSelected(true);
    });

    await step('Agree to terms and conditions', async () => {
      await summaryPage.clickAgree();
    });

    await step('Verify I agree button is active', async () => {
      await summaryPage.verifyAgreeButtonActive();
    });

    await step('Click Continue to proceed to payment', async () => {
      await summaryPage.clickNext();
    });

    await step('Verify successful navigation to payment page', async () => {
      await summaryPage.verifyNavigationToPaymentPage();
    });
  });

  test('test:11:- should expand and verify benefits & exclusions section with all details', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Benefits and Exclusions');
    await allure.severity('normal');
    await allure.tag('functional');
    await allure.tag('ui');

    await step('Click View summary of benefits & exclusions button', async () => {
      await summaryPage.clickBenefitsExclusionsButton();
    });

    await step('Verify benefits & exclusions section is expanded', async () => {
      await summaryPage.verifyBenefitsExclusionsSectionExpanded();
    });

    await step('Verify main benefits & exclusions content is displayed', async () => {
      await summaryPage.verifyBenefitsExclusionsContent();
    });

    await step('Verify What\'s covered section with all items', async () => {
      await summaryPage.verifyWhatsCoveredSection();
    });

    await step('Verify What\'s not covered section with all items', async () => {
      await summaryPage.verifyWhatsNotCoveredSection();
    });

    await step('Click button again to collapse section', async () => {
      await summaryPage.clickBenefitsExclusionsButton();
    });

    await step('Verify benefits & exclusions section is collapsed', async () => {
      await summaryPage.verifyBenefitsExclusionsSectionCollapsed();
    });
  });

  test('test:12:- should open Help popup and verify contact details', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Help Popup');
    await allure.severity('minor');
    await allure.tag('ui');

    await step('Click Help button', async () => {
      await summaryPage.clickHelpButton();
    });

    await step('Verify Help popup is visible', async () => {
      await summaryPage.verifyHelpPopupVisible();
    });

    await step('Verify Help popup contains all contact details', async () => {
      await summaryPage.verifyHelpPopupContent();
    });

    await step('Close Help popup by clicking Help button again', async () => {
      await summaryPage.clickHelpButton();
    });

    await step('Verify Help popup is closed', async () => {
      await summaryPage.verifyHelpPopupClosed();
    });
  });

  // Excel iyp_13: edit optional extras from summary, price updates, status reflects change
  test('test:16:- should remove an optional extra via Edit and update the summary price', async ({ page }) => {
    test.setTimeout(240000);
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Edit Optional Extras');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('iyp_13');

    const notIncluded = sd.optionalExtraStatus.notIncluded;
    const included = sd.optionalExtraStatus.included;
    let priceWithExtra = 0;
    let priceBeforeExtra = 0;

    await step('Verify optional extras start as Not included and capture baseline price', async () => {
      await summaryPage.verifyPageHeading();
      await summaryPage.verifyOptionalExtraStatusesExact(notIncluded, notIncluded, notIncluded);
      await summaryPage.verifyMonthlyPriceFormat();
      priceBeforeExtra = await summaryPage.getMonthlyPriceAmount();
      expect(priceBeforeExtra).toBeGreaterThan(0);
    });

    await step('Click Edit for optional extras and land on the quote page', async () => {
      await summaryPage.clickEditOptionalExtras();
      await summaryPage.verifyNavigationToQuotePage();
      await summaryPage.verifyOptionalExtrasSection();
      await quotePage.verifyStepIndicatorActive();
    });

    await step('Select Find My Pet and verify it is selected', async () => {
      await quotePage.selectFindMyPet();
      await page.waitForTimeout(2000);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.verifyFindMyPetSelected();
    });

    await step('Return to summary and verify Find My Pet is Included with a higher price', async () => {
      await quotePage.clickNext();
      await page.waitForLoadState('networkidle');
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyPageHeading();
      await summaryPage.verifyFindMyPetStatusExact(included);
      await summaryPage.verifySayingGoodbyeStatus(notIncluded);
      await summaryPage.verifyAwayFromHomeStatus(notIncluded);
      await summaryPage.verifyMonthlyPriceFormat();
      priceWithExtra = await summaryPage.getMonthlyPriceAmount();
      expect(priceWithExtra, 'Price should rise after adding Find My Pet').toBeGreaterThan(priceBeforeExtra);
    });

    await step('Edit again, deselect Find My Pet, and verify deselection', async () => {
      await summaryPage.clickEditOptionalExtras();
      await summaryPage.verifyNavigationToQuotePage();
      await quotePage.deselectFindMyPet();
      await page.waitForTimeout(2000);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.verifyFindMyPetDeselected();
    });

    await step('Return to summary and verify Find My Pet is removed and price fell', async () => {
      await quotePage.clickNext();
      await page.waitForLoadState('networkidle');
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyOptionalExtraStatusesExact(notIncluded, notIncluded, notIncluded);
      await summaryPage.verifyMonthlyPriceFormat();
      const priceWithoutExtra = await summaryPage.getMonthlyPriceAmount();
      expect(priceWithoutExtra, 'Price should drop after removing Find My Pet').toBeLessThan(priceWithExtra);
      expect(priceWithoutExtra, 'Price should return to the pre-extra baseline').toBe(priceBeforeExtra);
    });
  });

  // Excel iyp_20: edit customer details then continue to payment
  test('test:17:- should allow editing customer details before continuing to payment', async ({ paymentPage }) => {
    test.setTimeout(240000);
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Edit Customer Details');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('iyp_20');

    const user = petsData.userDetails[0];
    const edited = sd.editedCustomerDetails;

    await step('Fill initial customer details and open the payment step', async () => {
      await summaryPage.verifyPageHeading();
      await summaryPage.fillUserDetails(
        user.firstName,
        user.lastName,
        user.email,
        user.mobile,
        user.dob.day,
        user.dob.month,
        user.dob.year,
      );
      await summaryPage.verifyUserDetailsEntered(
        user.firstName,
        user.lastName,
        user.email,
        user.mobile,
        user.dob.day,
        user.dob.month,
        user.dob.year,
      );
      await summaryPage.selectMarketing(false);
      await summaryPage.clickAgree();
      await summaryPage.clickNext();
      await paymentPage.verifyStepIndicatorActive();
      await paymentPage.verifyPageHeadingVisible();
    });

    await step('Navigate back to summary and verify details persisted', async () => {
      await paymentPage.clickBack();
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyPageHeading();
      await summaryPage.verifyUserDetailsEntered(
        user.firstName,
        user.lastName,
        user.email,
        user.mobile,
        user.dob.day,
        user.dob.month,
        user.dob.year,
      );
    });

    await step('Edit customer details and hard-assert the new values', async () => {
      await summaryPage.fillUserDetails(
        edited.firstName,
        edited.lastName,
        edited.email,
        edited.mobile,
        user.dob.day,
        user.dob.month,
        user.dob.year,
      );
      await summaryPage.verifyUserDetailsEntered(
        edited.firstName,
        edited.lastName,
        edited.email,
        edited.mobile,
        user.dob.day,
        user.dob.month,
        user.dob.year,
      );
    });

    await step('Continue to payment again and confirm edited details persist on Back', async () => {
      await summaryPage.clickNext();
      await paymentPage.verifyStepIndicatorActive();
      await paymentPage.verifyPageHeadingVisible();
      await paymentPage.clickBack();
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyUserDetailsEntered(
        edited.firstName,
        edited.lastName,
        edited.email,
        edited.mobile,
        user.dob.day,
        user.dob.month,
        user.dob.year,
      );
      await summaryPage.clickNext();
      await paymentPage.verifyStepIndicatorActive();
      await paymentPage.verifyPageHeadingVisible();
    });
  });
});

/**
 * Owner "must be over 18" rule on the summary step. Dates are derived from
 * today so the boundary stays correct over time:
 *  - exactly 18 today            -> allowed (proceeds to payment)
 *  - turns 18 tomorrow (still 17)-> blocked
 *  - future date of birth        -> blocked
 */
test.describe('Owner Age Validation', () => {
  const pet = petsData.flowScenarios.navigation.pet;

  test('test:13:- @smoke should allow an applicant who is exactly 18 today', async ({ journey, summaryPage, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary');
    await allure.story('Owner Age Validation');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('validation');

    await step('Reach the summary page', async () => {
      await journey.completeToSummaryPage(pet);
    });

    await step('Enter owner details with a DOB of exactly 18 years ago', async () => {
      const dob = summaryPage.getPastDate(18);
      await summaryPage.fillUserDetails('Adult', 'Applicant', 'adult.applicant@example.com', '07700900123', dob.day, dob.month, dob.year);
      await summaryPage.selectMarketing(false);
      await summaryPage.clickAgree();
    });

    await step('Proceed and verify the applicant is accepted onto the payment step', async () => {
      await summaryPage.clickNext();
      await summaryPage.verifyDOBErrorsNotVisible();
      await paymentPage.verifyStepIndicatorActive();
    });
  });

  test('test:14:- should block an applicant who turns 18 tomorrow', async ({ journey, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary');
    await allure.story('Owner Age Validation');
    await allure.severity('critical');
    await allure.tag('validation');

    await step('Reach the summary page', async () => {
      await journey.completeToSummaryPage(pet);
    });

    await step('Enter a DOB that makes the applicant 17 (turns 18 tomorrow)', async () => {
      const dob = summaryPage.getPastDate(18, 0, -1);
      await summaryPage.fillUserDetails('Minor', 'Applicant', 'minor.applicant@example.com', '07700900123', dob.day, dob.month, dob.year);
      await summaryPage.selectMarketing(false);
      await summaryPage.clickAgree();
    });

    await step('Proceed and verify the over-18 error blocks the applicant', async () => {
      await summaryPage.clickNext();
      await summaryPage.verifyFutureDateError();
      await summaryPage.verifyStepIndicatorActive();
    });
  });

  test('test:15:- should block an applicant with a future date of birth', async ({ journey, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary');
    await allure.story('Owner Age Validation');
    await allure.severity('normal');
    await allure.tag('validation');

    await step('Reach the summary page', async () => {
      await journey.completeToSummaryPage(pet);
    });

    await step('Enter a future date of birth', async () => {
      const dob = summaryPage.getPastDate(-1);
      await summaryPage.fillUserDetails('Future', 'Applicant', 'future.applicant@example.com', '07700900123', dob.day, dob.month, dob.year);
      await summaryPage.selectMarketing(false);
      await summaryPage.clickAgree();
    });

    await step('Proceed and verify the applicant is blocked', async () => {
      await summaryPage.clickNext();
      await summaryPage.verifyFutureDateError();
      await summaryPage.verifyStepIndicatorActive();
    });
  });
});
