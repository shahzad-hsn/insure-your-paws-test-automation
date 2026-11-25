import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import petsData from '../data/index';

const v = petsData.validationScenarios;

test.describe('Homepage Validations', () => {
  
  test('test:1:- @smoke should validate all navigation elements are visible', async ({ journey, homePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Homepage');
    await allure.story('Navigation Elements');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('ui');

    await step('Navigate to homepage', async () => {
      await journey.openHomeWithCookiesDismissed();
    });

    await step('Verify all navigation links are visible', async () => {
      await homePage.verifyNavigationLinksVisible();
    });
  });

  test('test:2:- should validate hero section content', async ({ journey, homePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Homepage');
    await allure.story('Hero Section');
    await allure.severity('normal');
    await allure.tag('ui');

    await step('Navigate to homepage', async () => {
      await journey.openHomeWithCookiesDismissed();
    });

    await step('Verify hero heading text is displayed', async () => {
      await homePage.verifyHeroSectionVisible();
    });
  });

  test('test:3:- should validate page title', async ({ journey, homePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Homepage');
    await allure.story('Page Title');
    await allure.severity('normal');
    await allure.tag('ui');

    await step('Navigate to homepage', async () => {
      await journey.openHomeWithCookiesDismissed();
    });

    await step('Verify page title contains "Insurance"', async () => {
      const title = await homePage.getTitle();
      expect(title).toContain('Insurance');
    });
  });
});

test.describe('Pet Details Form Validations', () => {
  
  test('test:4:- should validate form heading and step indicator', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Page Structure');
    await allure.severity('critical');
    await allure.tag('smoke');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Verify heading and step indicator', async () => {
      await petDetailsPage.verifyPageHeadingVisible();
      await petDetailsPage.verifyStepIndicatorActive();
    });
  });

  test('test:5:- should validate all form fields are present', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Form Fields');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Fill all form fields to verify they exist', async () => {
      await journey.fillPetDetails(v.t5.pet);
    });

    await step('Verify all entered field values are present and correct', async () => {
      const pet = v.t5.pet;
      await petDetailsPage.verifyCompleteFormState(pet.name, pet.type, pet.gender, pet.amount, pet.neutered, pet.postcode);
    });
  });

  test('test:6:- should validate pet type selection options', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Pet Type Selection');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Select cat type', async () => {
      await petDetailsPage.selectPetType('cat');
    });

    await step('Switch to dog type', async () => {
      await petDetailsPage.selectPetType('dog');
    });

    await step('Verify dog type is selected and cat is deselected', async () => {
      await petDetailsPage.verifyPetTypeSelection('dog');
    });
  });

  test('test:7:- should validate gender selection options', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Gender Selection');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Select male gender', async () => {
      await petDetailsPage.selectPetGender('male');
    });

    await step('Switch to female gender', async () => {
      await petDetailsPage.selectPetGender('female');
    });

    await step('Verify female gender is selected and male is deselected', async () => {
      await petDetailsPage.verifyGenderSelection('female');
    });
  });

  test('test:8:- should validate neutered status options', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Neutered Status');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Select neutered yes', async () => {
      await petDetailsPage.selectNeutered(true);
    });

    await step('Switch to neutered no', async () => {
      await petDetailsPage.selectNeutered(false);
    });

    await step('Verify neutered "no" is selected and "yes" is deselected', async () => {
      await petDetailsPage.verifyNeuteredSelection(false);
    });
  });

  test('test:9:- should validate policy start date options', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Policy Start Date');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Select today as start date', async () => {
      await petDetailsPage.selectPolicyStartDate('today');
    });

    await step('Switch to tomorrow as start date', async () => {
      await petDetailsPage.selectPolicyStartDate('tomorrow');
    });

    await step('Verify "tomorrow" policy start date is reflected correctly', async () => {
      await petDetailsPage.verifyPolicyStartDateIsCorrect('tomorrow');
    });
  });

  test('test:10:- should validate manual address entry option', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Manual Address');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Click manual address link', async () => {
      await petDetailsPage.clickManualAddress();
    });

    await step('Verify manual address form fields are displayed', async () => {
      await petDetailsPage.verifyManualAddressFormVisible();
    });
  });

  test('test:11:- should validate "didn\'t pay anything" checkbox functionality', async ({ journey, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Didnt Pay Checkbox');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate to pet details page', async () => {
      await journey.goToPetDetails();
    });

    await step('Check "didn\'t pay" checkbox', async () => {
      await petDetailsPage.checkDidntPay();
    });

    await step('Verify amount field becomes disabled when "didn\'t pay" is checked', async () => {
      await petDetailsPage.verifyAmountFieldState(true);
    });
  });
});

test.describe('Quote Page Validations', () => {
  
  test('test:12:- should validate quote page elements after form submission', async ({ journey, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Page Load');
    await allure.severity('critical');
    await allure.tag('smoke');

    await step('Navigate and fill pet details', async () => {
      await journey.completeToQuotePage(v.t12.pet);
    });

    await step('Verify quote page heading and step indicator', async () => {
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyStepIndicatorActive();
    });
  });

  test('test:13:- should validate monthly total is displayed', async ({ journey, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Price Display');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Navigate and fill pet details', async () => {
      await journey.completeToQuotePage(v.t13.pet);
    });

    await step('Verify monthly total is displayed with valid value', async () => {
      const monthlyTotal = await quotePage.getMonthlyTotal();
      expect(monthlyTotal).toMatch(/£[\d,]+\.\d{2}/);
    });
  });

  test('test:14:- should validate price changes when adjusting vet fees', async ({ journey, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Vet Fees Adjustment');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Navigate and fill pet details', async () => {
      await journey.completeToQuotePage(v.t14.pet);
    });

    await step('Verify initial price is displayed', async () => {
      const initialPrice = await quotePage.getMonthlyTotal();
      expect(initialPrice).toMatch(/£[\d,]+\.\d{2}/);
    });

    await step('Adjust vet fees and verify price changes', async () => {
      const priceBefore = await quotePage.getMonthlyTotal();
      await quotePage.adjustVetFees(v.t14.quote.vetFees);
      await quotePage.waitForProgressBarToDisappear();
      const priceAfter = await quotePage.getMonthlyTotal();
      expect(priceAfter).toMatch(/£[\d,]+\.\d{2}/);
      expect(priceAfter).not.toBe(priceBefore);
    });
  });

  test('test:15:- should validate price changes when adjusting excess', async ({ journey, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Excess Adjustment');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Navigate and fill pet details', async () => {
      await journey.completeToQuotePage(v.t15.pet);
    });

    await step('Verify initial price is displayed', async () => {
      const initialPrice = await quotePage.getMonthlyTotal();
      expect(initialPrice).toMatch(/£[\d,]+\.\d{2}/);
    });

    await step('Adjust excess and verify price changes', async () => {
      const priceBefore = await quotePage.getMonthlyTotal();
      await quotePage.adjustExcess(v.t15.quote.excess);
      await quotePage.waitForProgressBarToDisappear();
      const priceAfter = await quotePage.getMonthlyTotal();
      expect(priceAfter).toMatch(/£[\d,]+\.\d{2}/);
      expect(priceAfter).not.toBe(priceBefore);
    });
  });

  test('test:16:- should validate optional extras are selectable', async ({ journey, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Optional Extras');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate and fill pet details', async () => {
      await journey.completeToQuotePage(v.t16.pet);
    });

    await step('Select optional extra and verify it becomes selected', async () => {
      await quotePage.selectExtra(v.t16.quote.extra);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.verifyExtraSelected(v.t16.quote.extra);
    });
  });
});

test.describe('Summary Page Validations', () => {
  
  test('test:17:- should validate summary page displays cover details', async ({ journey, quotePage, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Cover Details Display');
    await allure.severity('critical');
    await allure.tag('smoke');

    let quotedMonthly = 0;

    await step('Navigate to the quote page and capture the quoted monthly price', async () => {
      await journey.completeToQuotePage(v.t17.pet);
      quotedMonthly = await quotePage.getMonthlyTotalAmount();
      expect(quotedMonthly, 'Quote page should display a monthly price').toBeGreaterThan(0);
    });

    await step('Proceed to the summary page', async () => {
      await journey.proceedQuoteToSummary();
    });

    await step('Verify summary page heading and step indicator', async () => {
      await summaryPage.verifyPageHeading();
      await summaryPage.verifyStepIndicatorActive();
    });

    await step('Verify cover level is displayed', async () => {
      const coverLevel = await summaryPage.getCoverLevel();
      expect(coverLevel).toBe('Lifetime');
    });

    await step('Verify the summary shows the same monthly price as the quote page', async () => {
      const summaryMonthly = await summaryPage.getMonthlyPriceAmount();
      expect(summaryMonthly, 'Summary must show the price quoted on the previous step').toBe(quotedMonthly);
    });
  });

  test('test:18:- should validate all user detail fields are present', async ({ journey, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('User Details Form');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Navigate through pet details and quote', async () => {
      await journey.completeToSummaryPage(v.t18.pet);
    });

    await step('Fill all user detail fields', async () => {
      const user = v.t18.user;
      await summaryPage.enterFirstName(user.firstName);
      await summaryPage.enterLastName(user.lastName);
      await summaryPage.enterEmail(user.email);
      await summaryPage.enterMobile(user.mobile);
      await summaryPage.enterUserDOB(user.dob.day, user.dob.month, user.dob.year);
    });

    await step('Verify all entered user detail values are present', async () => {
      const user = v.t18.user;
      await summaryPage.verifyUserDetailsEntered(user.firstName, user.lastName, user.email, user.mobile, user.dob.day, user.dob.month, user.dob.year);
    });
  });

  test('test:19:- should validate marketing preference options', async ({ journey, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary Page');
    await allure.story('Marketing Preferences');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate through pet details and quote', async () => {
      await journey.completeToSummaryPage(v.t19.pet);
    });

    await step('Select marketing yes and verify it is selected', async () => {
      await summaryPage.selectMarketing(true);
      await summaryPage.verifyMarketingSelected(true);
    });

    await step('Switch to marketing no and verify it is selected', async () => {
      await summaryPage.selectMarketing(false);
      await summaryPage.verifyMarketingSelected(false);
    });
  });
});

test.describe('Payment Page Validations', () => {
  
  test('test:20:- should validate payment page displays pricing options', async ({ journey, quotePage, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Pricing Display');
    await allure.severity('critical');
    await allure.tag('smoke');

    let quotedMonthly = 0;

    await step('Navigate to the quote page and capture the quoted monthly price', async () => {
      await journey.completeToQuotePage(v.t20.pet);
      quotedMonthly = await quotePage.getMonthlyTotalAmount();
      expect(quotedMonthly, 'Quote page should display a monthly price').toBeGreaterThan(0);
    });

    await step('Continue through summary to the payment page', async () => {
      await journey.proceedQuoteToSummary();
      await journey.fillSummaryAndProceedToPayment(v.t20.user);
    });

    await step('Verify payment page heading and step indicator', async () => {
      await paymentPage.verifyPageHeadingVisible();
      await paymentPage.verifyStepIndicatorActive();
    });

    await step('Verify payment options quote the same price the customer configured', async () => {
      const paymentMonthly = await paymentPage.getMonthlyPriceAmount();
      expect(paymentMonthly, 'Monthly payment option must match the quoted price').toBe(quotedMonthly);
      // The monthly instalment is the annual premium / 12 rounded to the
      // nearest penny, so 12x monthly can differ from annual by up to 6p
      // (12 x half a penny of rounding).
      const paymentAnnual = await paymentPage.getAnnualPriceAmount();
      expect(
        Math.abs(paymentAnnual - quotedMonthly * 12),
        'Annual price should be within 6p of 12x the monthly price',
      ).toBeLessThanOrEqual(0.06);
    });
  });

  test('test:21:- should validate payment frequency selection', async ({ journey, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Frequency Selection');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Navigate through full flow to payment', async () => {
      await journey.completeToPaymentPage(v.t21.pet, v.t21.user);
    });

    await step('Select annual payment frequency', async () => {
      await paymentPage.selectPaymentFrequency('annual');
    });

    await step('Switch to monthly frequency and verify the monthly date dropdown appears', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await paymentPage.verifyMonthlyDateDropdownVisible();
    });
  });

  test('test:22:- should validate billing address fields are present', async ({ journey, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Billing Address');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Navigate through full flow to payment', async () => {
      await journey.completeToPaymentPage(v.t22.pet, v.t22.user);
    });

    await step('Open the Direct Debit billing form', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await paymentPage.selectMonthlyDate();
      await paymentPage.clickSetupDirectDebit();
    });

    await step('Verify the billing address form and its fields are present', async () => {
      await paymentPage.verifyGoCardlessFormLoaded();
      await paymentPage.verifyDirectDebitFormFields();
    });

    await step('Fill billing address fields', async () => {
      const payment = v.t22.payment;
      await paymentPage.selectCountry(payment.country);
      await paymentPage.enterEmail(payment.email);
      await paymentPage.enterAddress(payment.address.line1, payment.address.line2, payment.address.town, payment.address.postcode);
    });
  });
});

test.describe('Navigation Flow Validations', () => {
  
  test('test:23:- should validate back button navigation from quote to pet details', async ({ journey, quotePage, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Navigation');
    await allure.story('Back Navigation');
    await allure.severity('critical');
    await allure.tag('navigation');

    await step('Navigate and fill pet details', async () => {
      await journey.completeToQuotePage(v.t23.pet);
    });

    await step('Verify quote page loaded', async () => {
      await quotePage.verifyPageHeadingVisible();
    });

    await step('Click back and verify return to pet details', async () => {
      await quotePage.clickBack();
      await petDetailsPage.verifyPageHeadingVisible();
    });
  });

  test('test:24:- should validate back button navigation from payment to summary', async ({ journey, paymentPage, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Navigation');
    await allure.story('Back Navigation');
    await allure.severity('critical');
    await allure.tag('navigation');

    await step('Navigate through full flow to payment', async () => {
      await journey.completeToPaymentPage(v.t24.pet, v.t24.user);
    });

    await step('Verify payment page loaded', async () => {
      await paymentPage.verifyPageHeadingVisible();
    });

    await step('Click back and verify return to summary', async () => {
      await paymentPage.clickBack();
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyPageHeading();
    });
  });

  test('test:25:- should validate edit cover details navigation from summary to quote', async ({ journey, summaryPage, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Navigation');
    await allure.story('Edit Cover Details');
    await allure.severity('critical');
    await allure.tag('navigation');

    await step('Navigate through pet details and quote', async () => {
      await journey.completeToSummaryPage(v.t25.pet);
    });

    await step('Verify summary page loaded', async () => {
      await summaryPage.verifyPageHeading();
    });

    await step('Click edit cover details and verify return to quote', async () => {
      await summaryPage.clickEditCoverDetails();
      await quotePage.verifyStepIndicatorActive();
      await quotePage.verifyPageHeadingVisible();
    });
  });
});
