import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import petsData from '../data/index';

const flow = petsData.flowScenarios;

test.describe('Pet Insurance Quote Flow', () => {

  test('test:1:- @smoke should validate homepage elements before starting quote', async ({ homePage, page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Homepage');
    await allure.story('Element Visibility');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('ui');

    await step('Navigate to homepage', async () => {
      await homePage.goto();
      await homePage.rejectCookies();
    });

    await step('Verify navigation elements are visible', async () => {
      await homePage.verifyNavigationLinksVisible();
    });

    await step('Verify hero heading text', async () => {
      await homePage.verifyHeroSectionVisible();
    });
  });

  test('test:2:- @smoke should complete insurance quote for dog with neutered status', async ({
    homePage,
    petDetailsPage,
    quotePage,
    summaryPage,
    paymentPage,
    basePage,
    page,
  }) => {
    // Full purchase through the GoCardless sandbox: billing request, bank
    // authorisation and the redirect back regularly push past the default
    // 120s budget on slow staging. 
    await allure.epic('Pet Insurance');
    await allure.feature('End-to-End Flow');
    await allure.story('Dog Insurance Quote');
    await allure.severity('blocker');
    await allure.tag('e2e');
    await allure.tag('smoke');

    const scenario = flow.dogNeutered;
    const pet = scenario.pet!;
    const user = scenario.user!;
    const payment = scenario.payment!;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Navigate to homepage and start quote', async () => {
      await homePage.goto();
      await homePage.rejectCookies();
      await homePage.clickStartQuote();
    });

    await step('Verify pet details page is loaded', async () => {
      await petDetailsPage.verifyPageHeadingVisible();
      await petDetailsPage.verifyStepIndicatorActive();
    });

    await step('Fill in dog pet details', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
    });
    await step('Submit pet details and navigate to quote page', async () => {
      await petDetailsPage.clickGetQuote();
    });


    await step('Verify quote page is loaded', async () => {
      await quotePage.verifyPageHeadingVisible();
    });

    await step('Verify initial monthly price is displayed', async () => {
      const initialPrice = await quotePage.getMonthlyTotal();
      expect(initialPrice).toMatch(/£[\d,]+\.\d{2}/);
    });

    let quotedMonthly = 0;

    await step('Customise cover options and capture the quoted price', async () => {
      await quotePage.adjustVetFees(scenario.quote.vetFees!);
      await quotePage.adjustExcess(scenario.quote.excess!);
      await quotePage.waitForProgressBarToDisappear();
      quotedMonthly = await quotePage.getMonthlyTotalAmount();
      expect(quotedMonthly, 'Customised quote should have a monthly price').toBeGreaterThan(0);
    });

    await step('Proceed to summary page', async () => {
      await quotePage.clickNext();
    });

    await step('Verify summary page is loaded', async () => {
      await summaryPage.verifyPageHeading();
    });

    await step('Verify cover level and that the quoted price carried over', async () => {
      const coverLevel = await summaryPage.getCoverLevel();
      expect(coverLevel).toBe('Lifetime');
      const summaryMonthly = await summaryPage.getMonthlyPriceAmount();
      expect(summaryMonthly, 'Summary must show the same monthly price as the quote page').toBe(quotedMonthly);
    });

    await step('Fill user personal details', async () => {
      await summaryPage.enterFirstName(user.firstName);
      await summaryPage.enterLastName(user.lastName);
      await summaryPage.enterEmail(user.email);
      await summaryPage.enterMobile(user.mobile);
      await summaryPage.enterUserDOB(user.dob.day, user.dob.month, user.dob.year);
      await summaryPage.selectMarketing(user.marketing);
      await summaryPage.clickAgree();
      await summaryPage.clickNext();
    });

    await step('Verify payment page is loaded', async () => {
      await basePage.waitForLoaderToDisappear();
      await paymentPage.verifyPageHeadingVisible();
    });

    await step('Verify payment options carry the same quoted price', async () => {
      const paymentMonthly = await paymentPage.getMonthlyPriceAmount();
      expect(paymentMonthly, 'Payment page must offer the same monthly price as the quote').toBe(quotedMonthly);
      // The monthly instalment is the annual premium / 12 rounded to the
      // nearest penny, so 12x monthly can differ from annual by up to 6p
      // (12 x half a penny of rounding).
      const paymentAnnual = await paymentPage.getAnnualPriceAmount();
      expect(
        Math.abs(paymentAnnual - quotedMonthly * 12),
        'Annual price should be within 6p of 12x the monthly price',
      ).toBeLessThanOrEqual(0.06);
    });

    await step('Select monthly payment and fill payment details', async () => {
      await paymentPage.selectPaymentFrequency(payment.frequency);
      await paymentPage.clickSetupDirectDebit();
      await basePage.waitForLoaderToDisappear();
      await paymentPage.selectCountry(payment.country!);
      await paymentPage.enterEmail(payment.email);
      await paymentPage.enterAddress(payment.address.line1, payment.address.line2, payment.address.town, payment.address.postcode);
      await paymentPage.clickConfirmAddress()
      await paymentPage.verifySuccessBankVisible();
    });

    await step('Authorise in bank tab and verify policy is set up successfully', async () => {
      const bankPage = await paymentPage.continueToWebBankLogin();
      await paymentPage.verifyDirectDebitSuccess(bankPage, payment.email);
      await paymentPage.verifyPolicySetupSuccess();
    });
  });

  test('test:3:- should complete insurance quote for cat without payment history', async ({
    homePage,
    petDetailsPage,
    quotePage,
    summaryPage,
    paymentPage,
    basePage,
    page,
  }) => {
    // Same GoCardless end-to-end flow as test:2 - needs the extended budget.
    test.setTimeout(240000);
    await allure.epic('Pet Insurance');
    await allure.feature('End-to-End Flow');
    await allure.story('Cat Insurance Quote');
    await allure.severity('blocker');
    await allure.tag('e2e');

    const scenario = flow.catNoPayment;
    const pet = scenario.pet!;
    const user = scenario.user!;
    const payment = scenario.payment!;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Navigate to homepage and start quote', async () => {
      await homePage.goto();
      await homePage.rejectCookies();
      await homePage.clickStartQuote();
    });

    await step('Fill in cat pet details with no payment history', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.checkDidntPay();
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
    });

    await step('Submit pet details', async () => {
      await petDetailsPage.clickGetQuote();
    });

    await step('Customise cover with co-payment adjustment', async () => {
      await quotePage.adjustVetFees(scenario.quote.vetFees!);
      await quotePage.adjustExcess(scenario.quote.excess!);
      await quotePage.adjustCoPayment(scenario.quote.coPayment!);
    });

    await step('Verify adjusted price is displayed', async () => {
      const priceAfterAdjustment = await quotePage.getMonthlyTotal();
      expect(priceAfterAdjustment).toMatch(/£[\d,]+\.\d{2}/);
    });

    await step('Proceed to summary page', async () => {
      await quotePage.clickNext();
    });

    await step('Fill user personal details with marketing opt-in', async () => {
      await summaryPage.enterFirstName(user.firstName);
      await summaryPage.enterLastName(user.lastName);
      await summaryPage.enterEmail(user.email);
      await summaryPage.enterMobile(user.mobile);
      await summaryPage.enterUserDOB(user.dob.day, user.dob.month, user.dob.year);
      await summaryPage.selectMarketing(user.marketing);
      await summaryPage.clickAgree();
      await summaryPage.clickNext();
    });

    await step('Select annual payment and complete', async () => {
      await paymentPage.selectPaymentFrequency(payment.frequency);
      await paymentPage.clickDirectDebit();
      await paymentPage.clickSetupDirectDebit();
      await basePage.waitForLoaderToDisappear();
      await paymentPage.selectCountry(payment.country!);
      await paymentPage.enterEmail(payment.email);
      await paymentPage.enterAddress(payment.address.line1, payment.address.line2, payment.address.town, payment.address.postcode);
      await paymentPage.clickContinue();
      await paymentPage.enterBankDetails(payment.bank!.sortCode, payment.bank!.accountNumber);
      await paymentPage.confirmDirectDebitSetup();
    });

    await step('Verify policy is set up successfully', async () => {
      await paymentPage.verifyPolicySetupSuccess();
    });
  });

  test('test:4:- @smoke should complete insurance quote for older dog with manual address entry', async ({
    homePage,
    petDetailsPage,
    quotePage,
    summaryPage,
    paymentPage,
    basePage,
    page,
  }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('End-to-End Flow');
    await allure.story('Manual Address Entry');
    await allure.severity('critical');
    await allure.tag('e2e');

    const scenario = flow.olderDogManual;
    const pet = scenario.pet!;
    const user = scenario.user!;
    const payment = scenario.payment!;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Navigate to homepage and start quote', async () => {
      await homePage.goto();
      await homePage.rejectCookies();
      await homePage.clickStartQuote();
    });

    await step('Fill in older dog details with manual address', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.clickManualAddress();
      await petDetailsPage.enterManualAddress(pet.address!.line1, pet.address!.line2, pet.address!.town, pet.address!.county, pet.address!.postcode);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
    });
    await step('Submit pet details', async () => {
      await petDetailsPage.clickGetQuote();
    });
    await step('Customise cover with extra and higher vet fees', async () => {
      await quotePage.adjustVetFees(scenario.quote.vetFees!);
      await quotePage.selectExtra(scenario.quote.extra!);
    });

    await step('Proceed to summary page', async () => {
      await quotePage.clickNext();
    });

    await step('Fill user personal details', async () => {
      await summaryPage.enterFirstName(user.firstName);
      await summaryPage.enterLastName(user.lastName);
      await summaryPage.enterEmail(user.email);
      await summaryPage.enterMobile(user.mobile);
      await summaryPage.enterUserDOB(user.dob.day, user.dob.month, user.dob.year);
      await summaryPage.selectMarketing(user.marketing);
      await summaryPage.clickAgree();
      await summaryPage.clickNext();
    });

    await step('Select monthly payment and fill address', async () => {
      await paymentPage.selectPaymentFrequency(payment.frequency);
      await paymentPage.clickSetupDirectDebit();
      await basePage.waitForLoaderToDisappear();
      await paymentPage.verifyGoCardlessFormLoaded();
      await paymentPage.enterEmail(payment.email);
      await paymentPage.enterAddress(payment.address.line1, payment.address.line2, payment.address.town, payment.address.postcode);
      await paymentPage.clickConfirmAddress();
      await paymentPage.chooseSuccessBank();
      await paymentPage.verifySuccessBankVisible();
    });

    await step('Authorise in bank tab and verify policy is set up successfully', async () => {
      const bankPage = await paymentPage.continueToWebBankLogin();
      await paymentPage.verifyDirectDebitSuccess(bankPage, payment.email);
      await paymentPage.verifyPolicySetupSuccess();
    });
  });

  test('test:5:- should validate navigation back and forth through quote process', async ({
    page,
    homePage,
    petDetailsPage,
    quotePage,
    summaryPage,
    paymentPage,
  }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Navigation');
    await allure.story('Back and Forward Navigation');
    await allure.severity('critical');
    await allure.tag('navigation');
    await allure.tag('functional');

    const scenario = flow.navigation;
    const pet = scenario.pet!;
    const user = scenario.user!;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Navigate to homepage and start quote', async () => {
      await homePage.goto();
      await homePage.rejectCookies();
      await homePage.clickStartQuote();
    });

    await step('Fill pet details for cat', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.clickGetQuote();
    });

    await step('Verify quote page loaded', async () => {
      await quotePage.verifyPageHeadingVisible();
    });

    await step('Navigate back to pet details', async () => {
      await quotePage.clickBack();
      await page.waitForTimeout(1000);
    });

    await step('Verify pet details page is displayed again', async () => {
      await petDetailsPage.verifyPageHeadingVisible();
    });

    await step('Re-submit and navigate to summary', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.clickNext();
    });

    await step('Fill user details on summary page', async () => {
      await summaryPage.enterFirstName(user.firstName);
      await summaryPage.enterLastName(user.lastName);
      await summaryPage.enterEmail(user.email);
      await summaryPage.enterMobile(user.mobile);
      await summaryPage.enterUserDOB(user.dob.day, user.dob.month, user.dob.year);
      await summaryPage.selectMarketing(user.marketing);
    });
    await step('Edit cover details from summary', async () => {
      await summaryPage.clickEditCoverDetails();
      await page.waitForTimeout(1000);
    });

    await step('Verify returned to quote page', async () => {
      await quotePage.verifyPageHeadingVisible();
    });

    await step('Adjust vet fees and proceed', async () => {
      await quotePage.adjustVetFees(scenario.quote.vetFees!);
      await quotePage.clickNext();
    });

    // User-details persistence after "Edit cover" is covered by test:8 below.
    await step('Re-enter user details to continue the navigation flow', async () => {
      await summaryPage.fillUserDetails(user.firstName, user.lastName, user.email, user.mobile, user.dob.day, user.dob.month, user.dob.year);
      await summaryPage.selectMarketing(user.marketing);
    });

    await step('Agree to terms and proceed to payment', async () => {
      await summaryPage.clickAgree();
      await summaryPage.clickNext();
    });

    await step('Verify payment page is loaded', async () => {
      await paymentPage.verifyPageHeadingVisible();
    });

    await step('Navigate back from payment to summary', async () => {
      await paymentPage.clickBack();
      await page.waitForTimeout(1000);
    });

    await step('Verify summary page is displayed again', async () => {
      await summaryPage.verifyPageHeading();
    });
  });

  test('test:6:- should complete quote with multiple pets addition flow', async ({
    page,
    homePage,
    petDetailsPage,
    quotePage,
    summaryPage,
    paymentPage,
    basePage,
  }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('End-to-End Flow');
    await allure.story('Multi-Pet Quote');
    await allure.severity('critical');
    await allure.tag('e2e');
    await allure.tag('multi-pet');

    const scenario = flow.multiPet;
    const firstPet = scenario.pets![0];
    const secondPet = scenario.pets![1];
    const user = scenario.user!;
    const payment = scenario.payment!;
    const firstDob = petDetailsPage.getPastDate(firstPet.ageYears);
    const secondDob = petDetailsPage.getPastDate(secondPet.ageYears);

    await step('Navigate to homepage and start quote', async () => {
      await homePage.goto();
      await homePage.rejectCookies();
      await homePage.clickStartQuote();
    });

    await step('Fill first pet details', async () => {
      await petDetailsPage.enterPetName(firstPet.name);
      await petDetailsPage.selectPetType(firstPet.type);
      await petDetailsPage.selectBreedType(firstPet.breedType, firstPet.breed);
      await petDetailsPage.selectPetGender(firstPet.gender);
      await petDetailsPage.enterAmountPaid(firstPet.amount!);
      await petDetailsPage.selectNeutered(firstPet.neutered);
      await petDetailsPage.enterPostcode(firstPet.postcode!);
      await petDetailsPage.enterDateOfBirth(firstDob.day, firstDob.month, firstDob.year);
      await petDetailsPage.selectPolicyStartDate(firstPet.policyStart);
    });

    await step('Add another pet', async () => {
      await petDetailsPage.clickAddPet();
      await petDetailsPage.enterPetName(secondPet.name);
      await petDetailsPage.selectPetType(secondPet.type);
      await petDetailsPage.selectBreedType(secondPet.breedType, secondPet.breed);
      await petDetailsPage.selectPetGender(secondPet.gender);
      await petDetailsPage.enterAmountPaid(secondPet.amount!);
      await petDetailsPage.selectNeutered(secondPet.neutered);
      await petDetailsPage.enterPostcode(secondPet.postcode!);
      await petDetailsPage.enterDateOfBirth(secondDob.day, secondDob.month, secondDob.year);
      await petDetailsPage.selectPolicyStartDate(secondPet.policyStart);
      await page.waitForTimeout(1000);
    });

    await step('Submit all pets and get quote', async () => {
      await petDetailsPage.clickGetQuote();
    });
    await step('Customise cover with extras', async () => {
      await quotePage.adjustVetFees(scenario.quote.vetFees!);
      await quotePage.adjustExcess(scenario.quote.excess!);
      await quotePage.selectExtra(scenario.quote.extra!);
    });

    await step('Proceed to summary', async () => {
      await quotePage.clickNext();
    });

    await step('Fill user details and agree', async () => {
      await summaryPage.enterFirstName(user.firstName);
      await summaryPage.enterLastName(user.lastName);
      await summaryPage.enterEmail(user.email);
      await summaryPage.enterMobile(user.mobile);
      await summaryPage.enterUserDOB(user.dob.day, user.dob.month, user.dob.year);
      await summaryPage.selectMarketing(user.marketing);
      await summaryPage.clickAgree();
      await summaryPage.clickNext();
    });

    await step('Select annual payment', async () => {
      await paymentPage.selectPaymentFrequency(payment.frequency);
    });

    await step('Verify annual price and complete payment', async () => {
      const finalAnnualPrice = await paymentPage.getAnnualPrice();
      expect(finalAnnualPrice).toMatch(/£[\d,]+\.\d{2}/);
      await paymentPage.clickDirectDebit();
      await paymentPage.clickSetupDirectDebit();
      await basePage.waitForLoaderToDisappear();
      await paymentPage.enterEmail(payment.email);
      await paymentPage.enterAddress(payment.address.line1, payment.address.line2, payment.address.town, payment.address.postcode);
      await paymentPage.clickContinue();
      await paymentPage.enterBankDetails(payment.bank!.sortCode, payment.bank!.accountNumber);
      await paymentPage.confirmDirectDebitSetup();
    });

    await step('Verify policy is set up successfully', async () => {
      await paymentPage.verifyPolicySetupSuccess();
    });
  });

  test('test:7:- should validate policy summary view during customization', async ({
    homePage,
    petDetailsPage,
    quotePage, page
  }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Policy Summary View');
    await allure.severity('normal');
    await allure.tag('functional');

    const scenario = flow.policySummary;
    const pet = scenario.pet!;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Navigate to homepage and start quote', async () => {
      await homePage.goto();
      await homePage.rejectCookies();
      await homePage.clickStartQuote();
    });

    await step('Fill cat pet details', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.clickGetQuote();
    });

    await step('Adjust vet fees and view policy summary', async () => {
      await quotePage.adjustVetFees(scenario.quote.vetFees!);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.clickViewPolicySummary();
      await quotePage.verifyPolicySummaryModalVisible();
      await quotePage.closePolicySummaryModal();
    });

    await step('Adjust excess and co-payment', async () => {
      await quotePage.adjustExcess(scenario.quote.excess!);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.adjustCoPayment(scenario.quote.coPayment!);
      await quotePage.waitForProgressBarToDisappear();
    });

    await step('Verify final price is displayed', async () => {
      const finalPrice = await quotePage.getMonthlyTotal();
      expect(finalPrice).toMatch(/£[\d,]+\.\d{2}/);
    });
  });

  test('test:8:- should persist user details after editing cover details', async ({
    journey,
    quotePage,
    summaryPage,
    paymentPage,
  }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Navigation');
    await allure.story('Edit Cover Details');
    await allure.severity('normal');
    await allure.tag('functional');

    const scenario = flow.navigation;
    const user = scenario.user!;

    await step('Complete the journey to the summary page', async () => {
      await journey.completeToSummaryPage(scenario.pet!);
    });

    // Details are only committed to the journey state when the summary form is
    // submitted (verified manually): unsubmitted fields are lost on any
    // navigation away, submitted fields survive the edit round-trip.
    await step('Fill user details and submit the summary form', async () => {
      await journey.fillSummaryAndProceedToPayment(user);
    });

    await step('Return to the summary page from payment', async () => {
      await paymentPage.clickBack();
      await summaryPage.verifyStepIndicatorActive();
    });

    await step('Edit cover details and return to summary', async () => {
      await summaryPage.clickEditCoverDetails();
      await quotePage.verifyStepIndicatorActive();
      await quotePage.clickNext();
      await summaryPage.verifyStepIndicatorActive();
    });

    await step('Verify the previously entered user details are still present', async () => {
      await summaryPage.verifyUserDetailsPersisted(user.firstName, user.lastName, user.email, user.mobile, user.dob.day, user.dob.month, user.dob.year);
    });
  });
});
