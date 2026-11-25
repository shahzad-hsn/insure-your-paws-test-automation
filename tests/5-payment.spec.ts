import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import { PetDetailsPage } from '../pages/PetDetailsPage';
import { QuotePage } from '../pages/QuotePage';
import { SummaryPage } from '../pages/SummaryPage';
import { PaymentPage } from '../pages/PaymentPage';
import petsData from '../data/index';
import type { PetScenario } from '../types/petsData';

/** Returns a card expiry one month ahead of today, formatted MM/YY (always in the future). */
function getNextMonthExpiry(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

const cardExpiry = getNextMonthExpiry();

test.describe('Payment Page Tests', () => {
  test.setTimeout(180000);

  let petDetailsPage: PetDetailsPage;
  let quotePage: QuotePage;
  let summaryPage: SummaryPage;
  let paymentPage: PaymentPage;

  test.beforeEach(async ({
    journey,
    quotePage: qp,
    summaryPage: sp,
    paymentPage: pp,
    petDetailsPage: pdp,
  }) => {
    quotePage = qp;
    summaryPage = sp;
    paymentPage = pp;
    petDetailsPage = pdp;

    const pet = petsData.pets[0];
    const quotePet: PetScenario = {
      name: pet.name,
      type: pet.type,
      breedType: 'moggie',
      gender: pet.gender,
      amount: pet.amount,
      neutered: pet.neutered,
      postcode: pet.postcode,
      dob: pet.dob,
      policyStart: pet.policyStart,
    };

    await journey.completeToPaymentPage(quotePet, petsData.userDetails[0]);
  });

  test('test:1:- @smoke should verify Payment page loads with correct heading and step indicator', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Page Load');
    await allure.severity('blocker');
    await allure.tag('smoke');

    await step('Verify page heading is visible', async () => {
      await paymentPage.verifyPageHeadingVisible();
    });

    await step('Verify step indicator shows Pay as active', async () => {
      await paymentPage.verifyStepIndicatorActive();
    });

    await step('Verify both payment options are visible', async () => {
      await paymentPage.verifyPaymentFrequencyOptionsVisible();
    });
  });

  test('test:2:- should verify Pay Annually option selection shows Card and Direct Debit buttons', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Annual Payment');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Select Pay Annually option', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
    });

    await step('Verify payment method buttons appear', async () => {
      await paymentPage.verifyCardAndDirectDebitButtonsVisible();
    });
  });

  test('test:3:- should verify Pay Monthly option selection shows monthly payment date dropdown', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Monthly Payment');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Select Pay Monthly option', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
    });

    await step('Verify monthly payment date dropdown is visible', async () => {
      // The date picker is a custom react-select, not a native <select>.
      await paymentPage.verifyMonthlyDateHeadingVisible();
      await paymentPage.verifyMonthlyDateDropdownVisible();
    });

    await step('Verify dropdown opens, shows date options, and a date can be selected', async () => {
      await paymentPage.selectMonthlyDateAndVerify();
    });
  });

  test('test:4:- should verify card form appears when Card payment is selected', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Card Payment Form');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
    });

    await step('Verify card form fields are visible', async () => {
      await paymentPage.verifyCardFormFieldsVisible();
    });
  });

  test('test:5:- should validate empty card number field', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Card Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
    });

    await step('Fill other fields but leave card number empty', async () => {
      await paymentPage.fillCardDetails({ expiry: cardExpiry, securityCode: '123', name: 'John Doe' });
    });

    await step('Try to submit and verify error', async () => {
      await paymentPage.submitCardExpectingValidationError();
    });
  });

  test('test:6:- should validate invalid card number format', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Card Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
    });

    await step('Enter invalid card number', async () => {
      await paymentPage.fillCardDetails({
        number: '1234',
        expiry: cardExpiry,
        securityCode: '123',
        name: 'John Doe',
      });
    });

    await step('Try to submit and verify error', async () => {
      await paymentPage.submitCardExpectingValidationError();
    });
  });

  test('test:7:- should validate empty expiry date field', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Card Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
    });

    await step('Fill fields except expiry date', async () => {
      await paymentPage.fillCardDetails({
        number: petsData.paymentCards.valid.number,
        securityCode: '123',
        name: 'John Doe',
      });
    });

    await step('Try to submit and verify error', async () => {
      await paymentPage.submitCardExpectingValidationError();
    });
  });

  test('test:8:- should validate empty security code field', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Card Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
    });

    await step('Fill fields except security code', async () => {
      await paymentPage.fillCardDetails({
        number: petsData.paymentCards.valid.number,
        expiry: cardExpiry,
        name: 'John Doe',
      });
    });

    await step('Try to submit and verify error', async () => {
      await paymentPage.submitCardExpectingValidationError();
    });
  });

  test('test:9:- should validate empty cardholder name field', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Card Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
    });

    await step('Fill fields except cardholder name', async () => {
      await paymentPage.fillCardDetails({
        number: petsData.paymentCards.valid.number,
        expiry: cardExpiry,
        securityCode: '123',
      });
    });

    await step('Try to submit and verify error', async () => {
      await paymentPage.submitCardExpectingValidationError();
    });
  });

  test('test:10:- should complete successful card payment and verify Thank You popup', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Successful Payment');
    await allure.severity('blocker');
    await allure.tag('smoke');
    await allure.tag('e2e');

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
    });

    await step('Fill valid card details', async () => {
      await paymentPage.fillCardDetails({
        number: petsData.paymentCards.valid.number,
        expiry: cardExpiry,
        securityCode: petsData.paymentCards.valid.securityCode,
        name: 'John Doe',
      });
    });

    await step('Submit payment', async () => {
      await paymentPage.submitCardPayment();
    });

    await step('Verify referral popup appears', async () => {
      await paymentPage.verifyReferralPopupVisible();
    });
  });

  test('test:11:- should close Thank You popup and verify Success page', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Success Page');
    await allure.severity('critical');
    await allure.tag('e2e');

    await step('Complete payment flow', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
      await paymentPage.fillCardDetails({
        number: petsData.paymentCards.valid.number,
        expiry: cardExpiry,
        securityCode: petsData.paymentCards.valid.securityCode,
        name: 'John Doe',
      });
      await paymentPage.submitCardPayment();
    });

    await step('Close referral popup', async () => {
      await paymentPage.closeReferralPopup();
    });

    await step('Verify Success page is displayed', async () => {
      await paymentPage.verifySuccessPage();
    });
  });

  test('test:12:- should verify policy number is displayed on Success page', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Success Page');
    await allure.severity('critical');
    await allure.tag('e2e');

    await step('Complete payment flow and close popup', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
      await paymentPage.fillCardDetails({
        number: petsData.paymentCards.valid.number,
        expiry: cardExpiry,
        securityCode: petsData.paymentCards.valid.securityCode,
        name: 'John Doe',
      });
      await paymentPage.submitCardPayment();
      await paymentPage.closeReferralPopup();
    });

    await step('Verify policy number is displayed', async () => {
      await paymentPage.verifyPolicyNumber();
    });

    await step('Verify email confirmation message', async () => {
      await paymentPage.verifyEmailConfirmation();
    });
  });

  test('test:13:- should verify Set Up Direct Debit button appears for Pay Monthly', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Direct Debit');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Select Pay Monthly option', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
    });

    await step('Select a monthly payment date', async () => {
      await paymentPage.selectMonthlyDate();
      await page.waitForTimeout(1000);
    });

    await step('Verify Set Up Direct Debit button is visible', async () => {
      await paymentPage.verifySetupDirectDebitButtonVisible();
    });
  });

  test('test:14:- should open Direct Debit modal when Set Up Direct Debit is clicked', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Direct Debit');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Select Pay Monthly and date', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
      await paymentPage.selectMonthlyDate();
      await page.waitForTimeout(1000);
    });

    await step('Click Set Up Direct Debit button', async () => {
      await paymentPage.clickSetupDirectDebit();
    });

    await step('Verify Direct Debit modal appears', async () => {
      await paymentPage.verifyGoCardlessFormLoaded();
    });
  });

  test('test:15:- should verify Direct Debit form has all required fields', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Direct Debit');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Open Direct Debit modal', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
      await paymentPage.selectMonthlyDate();
      await page.waitForTimeout(1000);
      await paymentPage.clickSetupDirectDebit();
    });

    await step('Verify all form fields are present', async () => {
      await paymentPage.verifyDirectDebitFormFields();
    });
  });

  test('test:16:- should complete Direct Debit purchase and verify success', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Successful Payment');
    await allure.severity('blocker');
    await allure.tag('smoke');
    await allure.tag('e2e');

    await step('Select Pay Monthly and a payment date', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
      await paymentPage.selectMonthlyDate();
      await page.waitForTimeout(1000);
    });

    await step('Open GoCardless and confirm address', async () => {
      await paymentPage.clickSetupDirectDebit();
      await paymentPage.verifyGoCardlessFormLoaded();
      await paymentPage.enterEmail('john.smith@test.com');
      await paymentPage.enterAddress('Buckingham Palace', '', 'London', 'SW1A 1AA');
      await paymentPage.clickConfirmAddress();
    });

    await step('Continue with pre-selected Success Bank', async () => {
      await paymentPage.verifySuccessBankVisible();
    });

    await step('Authorise in bank tab and verify success', async () => {
      const bankPage = await paymentPage.continueToWebBankLogin();
      await paymentPage.verifyDirectDebitSuccess(bankPage);
    });

    await step('Verify the app shows the policy success page', async () => {
      await paymentPage.verifyPolicySetupSuccess();
    });
  });
});

/**
 * Payment failure handling and app-to-provider price consistency.
 *
 * The happy paths (card + Direct Debit purchases) are covered above. These
 * tests cover what happens when the money DOESN'T move: a rejecting bank must
 * never produce a policy, and the amount handed to GoCardless must match the
 * amount the app quoted.
 */
test.describe('Payment Failures & Price Consistency', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ journey }) => {
    const pet = petsData.pets[0];
    const quotePet: PetScenario = {
      name: pet.name,
      type: pet.type,
      breedType: 'moggie',
      gender: pet.gender,
      amount: pet.amount,
      neutered: pet.neutered,
      postcode: pet.postcode,
      dob: pet.dob,
      policyStart: pet.policyStart,
    };
    await journey.completeToPaymentPage(quotePet, petsData.userDetails[0]);
  });

  test('test:17:- @smoke should hand the exact quoted monthly amount to GoCardless', async ({ page, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Price Consistency');
    await allure.severity('blocker');
    await allure.tag('smoke');
    await allure.tag('integration');

    let quotedMonthly = '';

    await step('Select Pay Monthly and read the app-quoted price', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
      await paymentPage.selectMonthlyDate();
      quotedMonthly = (await paymentPage.getMonthlyPrice()).trim();
      expect(quotedMonthly, 'App should display a monthly price').toMatch(/£\d/);
    });

    await step('Open the GoCardless dropin', async () => {
      await paymentPage.clickSetupDirectDebit();
      await paymentPage.verifyGoCardlessFormLoaded();
    });

    await step('Verify GoCardless displays the same amount', async () => {
      await paymentPage.verifyGoCardlessAmount(quotedMonthly);
    });
  });

  test('test:18:- should not create a policy when the bank rejects the payment request', async ({ page, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Failed Payment');
    await allure.severity('blocker');
    await allure.tag('negative');
    await allure.tag('e2e');

    await step('Select Pay Monthly and open the GoCardless dropin', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
      await paymentPage.selectMonthlyDate();
      await paymentPage.clickSetupDirectDebit();
      await paymentPage.verifyGoCardlessFormLoaded();
      await paymentPage.enterEmail('john.smith@test.com');
      await paymentPage.enterAddress('Buckingham Palace', '', 'London', 'SW1A 1AA');
      await paymentPage.clickConfirmAddress();
    });

    await step('Switch to the sandbox bank that rejects the payment request', async () => {
      await paymentPage.chooseBankByName(/Payment Failed Bank - Rejects the payment request/);
    });

    await step('Attempt the bank authorisation', async () => {
      await paymentPage.clickBankAuthLink();
    });

    await step('Verify the failure is surfaced with a retry path', async () => {
      await paymentPage.verifyBankConnectionProblem();
    });

    await step('Verify the customer stays on the payment step and no policy is issued', async () => {
      await paymentPage.verifyStillOnPaymentStep();
    });
  });

  test('test:19:- should render the Pay by bank method for annual payments', async ({ page, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Payment Methods');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Select Pay Annually', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
    });

    await step('Verify all three payment methods are offered', async () => {
      await paymentPage.verifyAllPaymentMethodsVisible();
    });

    await step('Open the Pay by bank tab and verify its content', async () => {
      await paymentPage.openPayByBankTab();
      await paymentPage.verifyPayByBankContent();
    });
  });

  // Excel iyp_21: change payment method before purchase, then complete purchase
  // with the finally selected method (Card).
  test('test:20:- should switch payment method and complete purchase with the selected method', async ({
    page,
    paymentPage,
  }) => {
    test.setTimeout(240000);
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Change Payment Method');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('e2e');
    await allure.tag('iyp_21');

    await step('Select Pay Annually so all three methods are offered', async () => {
      await paymentPage.verifyPageHeadingVisible();
      await paymentPage.verifyStepIndicatorActive();
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.verifyAllPaymentMethodsVisible();
    });

    await step('Select Card and verify the card form is active', async () => {
      await paymentPage.selectCardPaymentMethod();
      await paymentPage.verifyCardPaymentMethodActive();
      await paymentPage.verifyAllPaymentMethodsVisible();
    });

    await step('Switch to Direct Debit and verify card UI is replaced', async () => {
      await paymentPage.selectDirectDebitPaymentMethod();
      await paymentPage.verifyDirectDebitPaymentMethodActive();
      await paymentPage.verifyAllPaymentMethodsVisible();
    });

    await step('Switch to Pay by bank and verify its content', async () => {
      await paymentPage.openPayByBankTab();
      await paymentPage.verifyPayByBankPaymentMethodActive();
      await paymentPage.verifyAllPaymentMethodsVisible();
    });

    await step('Switch back to Card as the final purchase method', async () => {
      await paymentPage.selectCardPaymentMethod();
      await paymentPage.verifyCardPaymentMethodActive();
      await paymentPage.verifyAllPaymentMethodsVisible();
      await paymentPage.verifyPageHeadingVisible();
      await paymentPage.verifyStepIndicatorActive();
    });

    await step('Complete purchase with the selected Card method', async () => {
      await paymentPage.fillCardDetails({
        number: petsData.paymentCards.valid.number,
        expiry: cardExpiry,
        securityCode: petsData.paymentCards.valid.securityCode,
        name: 'John Doe',
      });
      await paymentPage.submitCardPayment();
    });

    await step('Verify the policy is purchased via the selected method', async () => {
      await paymentPage.closeReferralPopup();
      await paymentPage.verifySuccessPage();
      await paymentPage.verifyEmailConfirmation();
    });
  });

  // Excel iyp_18: expired card must decline — no policy issued.
  // Hard fail if staging accepts the card and reaches thank-you (product bug).
  test('test:21:- should decline payment with an expired card', async ({ page, paymentPage }) => {
    test.setTimeout(240000); 
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Expired Card');
    await allure.severity('critical');
    await allure.tag('negative');
    await allure.tag('iyp_18');

    const card = petsData.paymentCards.expired;

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
      await paymentPage.verifyCardPaymentMethodActive();
    });

    await step('Submit an expired card and verify the payment is declined', async () => {
      await paymentPage.fillCardDetails({
        number: card.number,
        expiry: card.expiry ?? '01/20',
        securityCode: card.securityCode,
        name: 'Expired Card',
      });
      await paymentPage.submitCardExpectingDecline();
      await paymentPage.verifyCardDeclineErrorVisible();
      await paymentPage.verifyStillOnPaymentStep();
      await paymentPage.verifyNoPolicyNumberVisible();
      await expect(page, 'Expired card must not reach thank-you / issue a policy').not.toHaveURL(
        /thankyou/i,
      );
      await expect(page.getByRole('heading', { name: "You're good to go!" })).not.toBeVisible();
    });

    await step('Verify the customer can retry with another payment method still available', async () => {
      await paymentPage.verifyAllPaymentMethodsVisible();
      await paymentPage.verifyCardFormFieldsVisible();
    });
  });

  // Excel iyp_22: Global Payments 3DS2 frictionless success (4222000006285344).
  test('test:22:- should complete payment after successful 3D Secure authentication', async ({
    page,
    paymentPage,
  }) => {
    test.setTimeout(300000);
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('3D Secure');
    await allure.severity('critical');
    await allure.tag('e2e');
    await allure.tag('iyp_22');

    const card = petsData.paymentCards.threeDSSuccess;

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
      await paymentPage.verifyCardPaymentMethodActive();
    });

    await step('Submit a 3DS sandbox card and complete authentication', async () => {
      await paymentPage.fillCardDetails({
        number: card.number,
        expiry: cardExpiry,
        securityCode: card.securityCode,
        name: 'Three DS Success',
      });
      await paymentPage.submitCardPayment();
      await paymentPage.completeThreeDSChallenge({ timeout: 60000 });
    });

    await step('Verify the annual policy is purchased after 3DS success', async () => {
      await paymentPage.closeReferralPopup();
      await paymentPage.verifySuccessPage();
      await paymentPage.verifyEmailConfirmation();
    });
  });

  // Excel iyp_23: skipped — staging issues a policy on the 3DS fail/cancel path
  // (no reliable Fail ACS control; challenge/frictionless fail cards succeed).
  test.skip('test:23:- should stay on payment after failed 3D Secure authentication', async ({
    page,
    paymentPage,
  }) => {
    test.setTimeout(300000);
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('3D Secure');
    await allure.severity('critical');
    await allure.tag('negative');
    await allure.tag('iyp_23');

    const card = petsData.paymentCards.threeDSChallenge;

    await step('Select Pay Annually and Card payment', async () => {
      await paymentPage.selectPaymentFrequency('annual');
      await page.waitForTimeout(1000);
      await paymentPage.selectCardPaymentMethod();
      await paymentPage.verifyCardPaymentMethodActive();
    });

    await step('Submit a failing 3DS card and cancel/fail authentication', async () => {
      await paymentPage.fillCardDetails({
        number: card.number,
        expiry: cardExpiry,
        securityCode: card.securityCode,
        name: 'Three DS Fail',
      });
      await paymentPage.submitCardPayment();
      await paymentPage.failThreeDSChallenge({ timeout: 60000 });
    });

    await step('Verify payment is not processed and the user remains on Pay', async () => {
      await paymentPage.verifyStillOnPaymentStep();
      await paymentPage.verifyNoPolicyNumberVisible();
      // Prefer an explicit gateway error when staging surfaces one; some 3DS cancel
      // paths return to the form without populating #bluePaymentsErrorMessage.
      const errorVisible = await page.locator('#bluePaymentsErrorMessage').isVisible().catch(() => false);
      if (errorVisible) {
        await paymentPage.verifyCardDeclineErrorVisible();
      }
      await expect(page.getByRole('heading', { name: "You're good to go!" })).not.toBeVisible();
      await paymentPage.verifyCardFormFieldsVisible();
    });
  });
});
