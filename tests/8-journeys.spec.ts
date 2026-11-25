import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import petsData from '../data/index';
import type { PetScenario } from '../types/petsData';

/**
 * Journey coverage beyond the single-cat happy path: a dog (which adds the
 * breed dropdown + excluded-breeds confirmation) and a multi-pet quote.
 */
test.describe('Quote Journeys', () => {
  test('test:1:- @smoke should complete a dog journey through to the summary page', async ({ journey, quotePage, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Journey');
    await allure.story('Dog Journey');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('journey');

    const dog = petsData.flowScenarios.dogNeutered.pet;

    await step('Complete pet details for a dog and reach the quote page', async () => {
      await journey.completeToQuotePage(dog);
      await quotePage.verifyStepIndicatorActive();
      await quotePage.verifyMonthlyTotalExists();
    });

    await step('Proceed to the summary page and verify the dog is carried through', async () => {
      await journey.proceedQuoteToSummary();
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyPetName(dog.name);
    });
  });

  test('test:2:- should complete a multi-pet journey through to the quote page', async ({ journey, petDetailsPage, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Journey');
    await allure.story('Multi-pet Journey');
    await allure.severity('critical');
    await allure.tag('journey');

    const [firstPet, secondPet] = petsData.flowScenarios.multiPet.pets;

    await step('Open the pet details step', async () => {
      await journey.goToPetDetails();
    });

    await step(`Fill details for the first pet (${firstPet.name})`, async () => {
      await journey.fillPetDetails(firstPet);
    });

    await step(`Add and fill details for the second pet (${secondPet.name})`, async () => {
      expect(await petDetailsPage.isAddPetButtonDisabled()).toBe(false);
      await petDetailsPage.clickAddPet();
      await petDetailsPage.verifyPetHeading(2);
      await journey.fillPetDetails(secondPet);
    });

    await step('Get the quote and verify the quote page loads with a price', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyStepIndicatorActive();
      await quotePage.verifyMonthlyTotalExists();
    });
  });

  // Excel iyp_06: add two pets, remove one, purchase — welcome must not mention the removed pet.
  test('test:10:- should remove a pet then purchase without the removed pet', async ({
    page,
    journey,
    petDetailsPage,
    quotePage,
    summaryPage,
    paymentPage,
  }) => {
    test.setTimeout(240000);
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Journey');
    await allure.story('Remove Pet');
    await allure.severity('critical');
    await allure.tag('e2e');
    await allure.tag('multi-pet');
    await allure.tag('iyp_06');

    const [firstPet, secondPet] = petsData.flowScenarios.multiPet.pets;
    const user = petsData.userDetails[0];
    const card = petsData.paymentCards.valid;
    const expiry = (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
    })();

    await step('Open the pet details step and fill the first pet', async () => {
      await journey.goToPetDetails();
      await journey.fillPetDetails(firstPet);
    });

    await step('Add a second pet and verify both Remove controls appear', async () => {
      await petDetailsPage.clickAddPet();
      await petDetailsPage.verifyPetHeading(2);
      await journey.fillPetDetails(secondPet);
      await petDetailsPage.verifyRemovePetButtonCount(2);
      await petDetailsPage.verifyPetNamesExact([firstPet.name, secondPet.name]);
    });

    await step('Remove the second pet and verify only the first remains', async () => {
      await petDetailsPage.clickRemovePet(1);
      await petDetailsPage.verifyRemovePetButtonCount(0);
      await petDetailsPage.verifyPetNamesExact([firstPet.name]);
    });

    await step('Get a quote and confirm summary only lists the kept pet', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyStepIndicatorActive();
      await journey.proceedQuoteToSummary();
      await summaryPage.verifyPetName(firstPet.name);
      await expect(page.getByText(secondPet.name, { exact: true })).toHaveCount(0);
    });

    await step('Purchase annually by card and verify welcome omits the removed pet', async () => {
      await journey.fillSummaryAndProceedToPayment(user);
      await paymentPage.completeAnnualCardPurchase({
        number: card.number,
        expiry,
        securityCode: card.securityCode,
        name: `${user.firstName} ${user.lastName}`,
      });
      await paymentPage.closeReferralPopup();
      await paymentPage.verifySuccessPage();
      await paymentPage.verifyEmailConfirmation();
      const body = await page.locator('main').innerText();
      expect(body).not.toContain(secondPet.name);
    });
  });
});

/**
 * Journey behaviours not covered by the page-focused specs: the discount
 * code feature, co-payment repricing, refresh/direct-URL handling and a
 * pinned known bug.
 */
test.describe('Journey Behaviour', () => {
  test.setTimeout(180000);

  const pet = petsData.flowScenarios.navigation.pet as PetScenario;

  // Excel iyp_08: pet younger than 8 weeks cannot proceed past Get quote.
  test('test:11:- should block Get quote when the pet is younger than 8 weeks', async ({
    journey,
    petDetailsPage,
  }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Pet Age Eligibility');
    await allure.severity('critical');
    await allure.tag('negative');
    await allure.tag('validation');
    await allure.tag('iyp_08');

    const basePet = petsData.flowScenarios.navigation.pet as PetScenario;
    const youngPet: PetScenario = {
      ...basePet,
      name: 'Tiny',
      // ~4 weeks old — under the 8-week minimum.
      dob: undefined,
      ageYears: undefined,
    };

    await step('Fill pet details with a date of birth under 8 weeks', async () => {
      await journey.goToPetDetails();
      const underEightWeeksDob = petDetailsPage.getPastDate(0, 0, 30);
      await journey.fillPetDetails({ ...youngPet, dob: underEightWeeksDob });
    });

    await step('Click Get quote and verify the under-8-weeks error blocks progress', async () => {
      await petDetailsPage.clickGetQuote({ waitForQuote: false });
      await petDetailsPage.verifyUnderEightWeeksError();
      await petDetailsPage.verifyStillOnPetDetailsStep();
    });
  });

  test('test:3:- should reject an invalid discount code with a clear error', async ({ journey, summaryPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Summary');
    await allure.story('Discount Code');
    await allure.severity('critical');
    await allure.tag('negative');

    await step('Reach the summary step', async () => {
      await journey.completeToSummaryPage(pet);
    });

    await step('Open the discount code panel', async () => {
      await summaryPage.openDiscountCodePanel();
    });

    await step('Apply an invalid code and verify the error', async () => {
      await summaryPage.applyDiscountCode('FAKECODE123');
      await summaryPage.verifyInvalidDiscountCodeError();
    });

    await step('Verify the journey is still usable after the rejected code', async () => {
      await summaryPage.verifyNextButtonVisible();
    });
  });

  // Excel iyp_15: fill customer details first, then apply TEST, then purchase.
  test('test:9:- should apply a recognised discount code and purchase with it', async ({
    page,
    journey,
    summaryPage,
    paymentPage,
  }) => {
    test.setTimeout(240000);
    await allure.epic('Pet Insurance');
    await allure.feature('Summary');
    await allure.story('Discount Code');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('e2e');
    await allure.tag('iyp_15');

    const sd = petsData.summaryData;
    const user = petsData.userDetails[0];
    let priceBefore = 0;

    await step('Reach the summary step and capture the pre-discount price', async () => {
      await journey.completeToSummaryPage(pet);
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyPageHeading();
      await summaryPage.verifyMonthlyPriceFormat();
      priceBefore = await summaryPage.getMonthlyPriceAmount();
      expect(priceBefore).toBeGreaterThan(0);
    });

    await step('Fill all customer details on Summary before applying a promo', async () => {
      await journey.fillSummaryDetails(user);
    });

    await step('Open the discount code panel and apply a valid code', async () => {
      await summaryPage.openDiscountCodePanel();
      await summaryPage.applyDiscountCode(sd.validDiscountCode);
    });

    await step('Verify the discount is applied with percent and monetary amount', async () => {
      await summaryPage.verifyDiscountAppliedWithAmount();
      const discountAmount = await summaryPage.getDiscountMonetaryAmount();
      const priceAfter = await summaryPage.getMonthlyPriceAmount();
      expect(priceAfter).toBeGreaterThan(0);
      // When a real monetary discount applies, the monthly total must fall.
      // TEST often applies as £0.00 — then the total may stay the same, but the
      // applied-message amount still proves the promotion was accepted.
      if (discountAmount > 0) {
        expect(priceAfter, 'Premium should drop when a monetary discount applies').toBeLessThan(
          priceBefore,
        );
      } else {
        expect(priceAfter).toBe(priceBefore);
      }
      await summaryPage.verifyNextButtonVisible();
    });

    await step('Continue to payment with the discounted quote', async () => {
      await summaryPage.clickNext();
      await paymentPage.verifyStepIndicatorActive();
      await paymentPage.verifyPageHeadingVisible();
    });

    await step('Purchase annually by card and verify the policy is issued', async () => {
      const expiry = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
      })();
      await paymentPage.completeAnnualCardPurchase({
        number: petsData.paymentCards.valid.number,
        expiry,
        securityCode: petsData.paymentCards.valid.securityCode,
        name: `${user.firstName} ${user.lastName}`,
      });
      await paymentPage.closeReferralPopup();
      await paymentPage.verifySuccessPage();
      await paymentPage.verifyEmailConfirmation();
    });
  });

  // Excel iyp_16: apply discount → remove → standard premium restored → purchase.
  test('test:12:- should remove an applied discount code and purchase at the standard price', async ({
    page,
    journey,
    summaryPage,
    paymentPage,
  }) => {
    test.setTimeout(240000);
    await allure.epic('Pet Insurance');
    await allure.feature('Summary');
    await allure.story('Discount Code');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('e2e');
    await allure.tag('iyp_16');

    const sd = petsData.summaryData;
    const user = petsData.userDetails[0];
    const card = petsData.paymentCards.valid;
    let priceBeforeDiscount = 0; 
    await step('Reach the summary step and capture the standard price', async () => {
      await journey.completeToSummaryPage(pet);
      await summaryPage.verifyPageHeading();
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyMonthlyPriceFormat();
      priceBeforeDiscount = await summaryPage.getMonthlyPriceAmount();
      expect(priceBeforeDiscount, 'Standard monthly premium must be > 0').toBeGreaterThan(0);
      await summaryPage.verifyDiscountNotApplied();
    });

    await step('Fill all customer details on Summary before applying a promo', async () => {
      await journey.fillSummaryDetails(user);
    });

    await step('Apply a valid discount code and verify it is on the Price Summary', async () => {
      await summaryPage.openDiscountCodePanel();
      await summaryPage.applyDiscountCode(sd.validDiscountCode);
      await summaryPage.verifyDiscountAppliedWithAmount();
      const appliedText = await summaryPage.getDiscountAppliedText();
      expect(appliedText).toMatch(/\d+%\s*discount code applied/i);
      const discountAmount = await summaryPage.getDiscountMonetaryAmount();
      const priceWithDiscount = await summaryPage.getMonthlyPriceAmount();
      expect(priceWithDiscount).toBeGreaterThan(0);
      if (discountAmount > 0) {
        expect(
          priceWithDiscount,
          'Monthly premium must fall when monetary discount > £0',
        ).toBeLessThan(priceBeforeDiscount);
      }
    });

    await step('Remove the discount and verify the standard premium is restored', async () => {
      await summaryPage.removeDiscountCode();
      await summaryPage.verifyDiscountRemovedAndStandardPrice(priceBeforeDiscount);
      await expect(page.getByText(/discount code applied/i)).toHaveCount(0);
    });

    await step('Purchase annually by card at the standard (non-discounted) price', async () => {
      await summaryPage.clickNext();
      await paymentPage.verifyPageHeadingVisible();
      await paymentPage.verifyStepIndicatorActive();
      const expiry = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
      })();
      await paymentPage.completeAnnualCardPurchase({
        number: card.number,
        expiry,
        securityCode: card.securityCode,
        name: `${user.firstName} ${user.lastName}`,
      });
      await paymentPage.closeReferralPopup();
      await paymentPage.verifySuccessPage();
      await paymentPage.verifyEmailConfirmation();
      await expect(page).toHaveURL(/thankyou/i);
      await expect(page.getByRole('heading', { name: "You're good to go!" })).toBeVisible();
    });
  });

  test('test:4:- should lower the price when the co-payment share is increased', async ({ journey, quotePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote');
    await allure.story('Co-payment Repricing');
    await allure.severity('critical');
    await allure.tag('functional');

    let priceBefore = 0;

    await step('Reach the quote page and read the starting price', async () => {
      await journey.completeToQuotePage(pet);
      priceBefore = await quotePage.getMonthlyTotalAmount();
      expect(priceBefore).toBeGreaterThan(0);
    });

    await step('Increase the co-payment (bill share) by one step', async () => {
      await quotePage.clickVoluntaryExcessPlus();
      await quotePage.waitForProgressBarToDisappear();
    });

    await step('Verify a higher customer share means a lower premium', async () => {
      await expect
        .poll(() => quotePage.getMonthlyTotalAmount(), { timeout: 20000 })
        .toBeLessThan(priceBefore);
    });
  });

  test('test:5:- should show the initial payment schedule matching the monthly price', async ({ page, journey, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Monthly Payment');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Reach the payment step', async () => {
      await journey.completeToPaymentPage(pet, petsData.userDetails[0]);
    });

    await step('Select Pay Monthly and a payment date', async () => {
      await paymentPage.selectPaymentFrequency('monthly');
      await page.waitForTimeout(1000);
      await paymentPage.selectMonthlyDate();
    });

    await step('Verify the payment schedule quotes the same monthly amount', async () => {
      const monthly = (await paymentPage.getMonthlyPrice()).trim();
      await paymentPage.verifyPaymentScheduleMatchesMonthly(monthly);
    });
  });

  test('test:6:- should return to step 1 when the quote page is refreshed (no quote persistence)', async ({ page, journey, petDetailsPage, basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Journey');
    await allure.story('Session Handling');
    await allure.severity('normal');
    await allure.tag('navigation');

    await step('Reach the quote page', async () => {
      await journey.completeToQuotePage(pet);
    });

    await step('Refresh the browser on step 2', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
    });

    await step('Verify the app restarts the journey at step 1 without crashing', async () => {
      // Quote state is held in memory only, so a refresh loses it. The guard
      // must send the customer back to the start - not error out.
      await basePage.verifyUrlMatches(/\/journey\/step1/, 25000);
      await basePage.verifyNoApplicationError();
      await petDetailsPage.verifyStepIndicatorActive();
    });
  });

  test('test:7:- should not show a policy number when the thank-you page is opened directly', async ({ basePage, paymentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Payment');
    await allure.story('Success Page Guard');
    await allure.severity('normal');
    await allure.tag('negative');
    await allure.tag('navigation');

    await step('Open /journey/thankyou directly without any purchase', async () => {
      await basePage.navigate('/journey/thankyou');
      await basePage.waitForLoaderToDisappear();
    });

    await step('Verify no policy confirmation is fabricated', async () => {
      await basePage.verifyNoApplicationError();
      // Without a BillingRequestID / completed payment there must be no policy
      // number - that would falsely confirm cover that doesn't exist.
      await paymentPage.verifyNoPolicyNumberVisible();
    });
  });

  test('test:8:- address validation errors should clear after picking an address from the dropdown', async ({ journey, petDetailsPage, basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Address Validation');
    await allure.severity('minor');
    await allure.tag('functional');

    await step('Trigger validation with an empty submit', async () => {
      await journey.goToPetDetails();
      await basePage.dismissCookieOverlay();
      await petDetailsPage.clickGetQuote({ waitForQuote: false });
    });
    await step('Search a postcode and select an address from the dropdown', async () => {
      await petDetailsPage.enterPostcode('M1 1AE');
    });
    await step('Verify the address errors have cleared', async () => {
      await petDetailsPage.verifyManualAddressErrorsCleared();
    });
  });
});
