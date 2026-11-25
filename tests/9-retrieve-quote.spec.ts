import { test, expect } from '../fixtures/test';
import type { Page } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import petsData from '../data/index';
import type { PetScenario } from '../types/petsData';
import type { JourneyHelper } from '../helpers/journey';

/**
 * Retrieve-quote (aggregator deep link) coverage.
 *
 * Aggregators send customers to /journey/stepN?quoteNo=... deep links and the
 * app rehydrates the journey by calling POST /Quote/RetrieveQuote. On staging
 * that endpoint only resolves aggregator-originated quotes, so the rehydration
 * tests capture a real getnewquote response from a quote created through the
 * UI and serve it as the RetrieveQuote response — which exercises the app's
 * full hydration path without depending on aggregator data existing.
 */

const RETRIEVE_QUOTE_URL = /\/Quote\/RetrieveQuote/i;

const pet = petsData.flowScenarios.navigation.pet as PetScenario;

/** Creates a quote through the UI and captures the quote API response. */
async function createQuote(
  page: Page,
  journey: JourneyHelper,
  petScenario: PetScenario,
): Promise<{ quoteNo: string; responseBody: unknown }> {
  const quoteResponsePromise = page.waitForResponse(
    (response) => response.url().toLowerCase().includes('getnewquote') && response.ok(),
    { timeout: 90000 },
  );
  await journey.completeToQuotePage(petScenario);
  const response = await quoteResponsePromise;
  const responseBody = await response.json();
  const quoteNo: string = (responseBody as { Data?: { QuoteNo?: string } })?.Data?.QuoteNo || '';
  // Direct-channel quote numbers look like "QIYPU7345F60001--/202634"
  expect(quoteNo, 'getnewquote response should contain a QuoteNo').toMatch(/^QIYP/);
  return { quoteNo, responseBody };
}

test.describe('Retrieve Quote', () => {
  test('test:1:- @smoke should map retrieve deep-link parameters into the RetrieveQuote API request', async ({ page, basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Retrieve Quote');
    await allure.story('API Contract');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('retrieve-quote');

    const params =
      'quoteNo=QIYP-CONTRACT-TEST&coverLevel=LifeTime&vetFees=12000&excess=100&copayment=10&selectedAddOns=1,3&paymentType=M';
    let payload: Record<string, unknown> = {};

    await step('Open the retrieve deep link carrying all supported parameters', async () => {
      const requestPromise = page.waitForRequest(
        (request) => RETRIEVE_QUOTE_URL.test(request.url()),
        { timeout: 30000 },
      );
      await basePage.navigate(`/journey/step3?${params}`);
      const request = await requestPromise;
      payload = request.postDataJSON() as Record<string, unknown>;
    });

    await step('Verify every URL parameter is forwarded in the RetrieveQuote payload', async () => {
      expect(payload.QuoteNo).toBe('QIYP-CONTRACT-TEST');
      expect(payload.CoverLevel).toBe('LifeTime');
      expect(payload.VetFees).toBe('12000');
      expect(payload.Excess).toBe('100');
      expect(payload.Copayment).toBe('10');
      expect(payload.SelectedAddOns).toEqual(['1', '3']);
      expect(payload.PaymentType).toBe('M');
    });
  });

  test('test:2:- @smoke should rehydrate the journey from a retrieved quote (aggregator-style summary landing)', async ({ page, journey, quotePage, summaryPage, basePage }) => {
    test.setTimeout(180000);
    await allure.epic('Pet Insurance');
    await allure.feature('Retrieve Quote');
    await allure.story('Journey Rehydration');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('retrieve-quote');

    let quoteNo = '';
    let responseBody: unknown;
    let createdTotal = 0;

    await step('Create a quote through the UI and capture the quote API response', async () => {
      ({ quoteNo, responseBody } = await createQuote(page, journey, pet));
      createdTotal = await quotePage.getMonthlyTotalAmount();
      expect(createdTotal, 'Created quote should have a monthly price').toBeGreaterThan(0);
    });

    await step('Serve the captured quote as the RetrieveQuote response', async () => {
      await page.route(RETRIEVE_QUOTE_URL, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(responseBody),
        });
      });
    });

    await step('Open the retrieve deep link on the summary step as a fresh visit', async () => {
      await basePage.navigate(`/journey/step3?quoteNo=${encodeURIComponent(quoteNo)}`);
      await basePage.dismissCookieOverlay();
      await basePage.waitForLoaderToDisappear();
    });

    await step('Verify the summary is rehydrated with the stored pet, cover and price', async () => {
      await summaryPage.verifyStepIndicatorActive();
      await summaryPage.verifyPetName(pet.name);
      const retrievedPrice = await summaryPage.getMonthlyPrice();
      const retrievedTotal = parseFloat(retrievedPrice.replace(/[^0-9.]/g, '')) || 0;
      expect(retrievedTotal, 'Retrieved quote should keep the same monthly price').toBe(createdTotal);
    });
  });

  test('test:3:- should fall back gracefully when the quoteNo cannot be retrieved', async ({ basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Retrieve Quote');
    await allure.story('Error Handling');
    await allure.severity('critical');
    await allure.tag('retrieve-quote');
    await allure.tag('negative');

    await step('Open a retrieve deep link with a quoteNo the API cannot resolve', async () => {
      await basePage.navigate('/journey/step2?quoteNo=IYP0000000000');
      await basePage.dismissCookieOverlay();
      await basePage.waitForLoaderToDisappear();
    });

    await step('Verify the app does not crash and the journey remains usable', async () => {
      await basePage.verifyNoApplicationError();
      // The app keeps the user inside the journey (step navigation rendered)
      // instead of dead-ending on a broken screen.
      await basePage.verifyJourneyStepNavVisible();
    });
  });

  test('test:4:- should redirect guarded journey steps to step 1 when no quote exists', async ({ page, basePage, petDetailsPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Retrieve Quote');
    await allure.story('Navigation Guards');
    await allure.severity('normal');
    await allure.tag('retrieve-quote');
    await allure.tag('navigation');

    await step('Open /journey/step2 directly without a quote and verify the redirect', async () => {
      await basePage.navigate('/journey/step2');
      await expect(page).toHaveURL(/\/journey\/step1/, { timeout: 20000 });
      await petDetailsPage.verifyStepIndicatorActive();
    });

    await step('Open /journey/step3 directly without a quote and verify the redirect', async () => {
      await basePage.navigate('/journey/step3');
      await expect(page).toHaveURL(/\/journey\/step1/, { timeout: 20000 });
      await petDetailsPage.verifyStepIndicatorActive();
    });
  });

  test('test:5:- step 2 heading should include the pet name after a retrieve deep link', async ({ page, journey, quotePage, summaryPage, basePage }) => {
    test.setTimeout(180000);
    await allure.epic('Pet Insurance');
    await allure.feature('Retrieve Quote');
    await allure.story('Journey Rehydration');
    await allure.severity('minor');
    await allure.tag('retrieve-quote');

    let quoteNo = '';
    let responseBody: unknown;

    await step('Create a quote through the UI and capture the quote API response', async () => {
      ({ quoteNo, responseBody } = await createQuote(page, journey, pet));
    });

    await step('Serve the captured quote as the RetrieveQuote response', async () => {
      await page.route(RETRIEVE_QUOTE_URL, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(responseBody),
        });
      });
    });

    // Landing directly on step2 renders the heading before the retrieved data
    // arrives, so the pet name never appears (verified manually). Landing on
    // step3 hydrates the journey fully; navigating Back to step2 then renders
    // the heading with the pet name — that's the supported retrieve path.
    await step('Open the retrieve deep link on the summary step as a fresh visit', async () => {
      await basePage.navigate(`/journey/step3?quoteNo=${encodeURIComponent(quoteNo)}`);
      await basePage.dismissCookieOverlay();
      await basePage.waitForLoaderToDisappear();
      await summaryPage.verifyStepIndicatorActive();
    });

    await step('Navigate back from summary to the customise step', async () => {
      await summaryPage.clickBack();
      await quotePage.verifyStepIndicatorActive();
    });

    await step('Verify the heading greets the retrieved pet by name', async () => {
      await quotePage.verifyPageHeading(pet.name);
    });
  });
});
