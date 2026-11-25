import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PetDetailsPage } from '../pages/PetDetailsPage';
import { QuotePage } from '../pages/QuotePage';
import { SummaryPage } from '../pages/SummaryPage';
import { PaymentPage } from '../pages/PaymentPage';
import { ContactPage } from '../pages/ContactPage';
import { ContentPage } from '../pages/ContentPage';
import { BasePage } from '../pages/BasePage';
import { JourneyHelper } from '../helpers/journey';

type TestFixtures = {
  homePage: HomePage;
  petDetailsPage: PetDetailsPage;
  quotePage: QuotePage;
  summaryPage: SummaryPage;
  paymentPage: PaymentPage;
  contactPage: ContactPage;
  contentPage: ContentPage;
  basePage: BasePage;
  journey: JourneyHelper;
};

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  petDetailsPage: async ({ page }, use) => {
    await use(new PetDetailsPage(page));
  },
  quotePage: async ({ page }, use) => {
    await use(new QuotePage(page));
  },
  summaryPage: async ({ page }, use) => {
    await use(new SummaryPage(page));
  },
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  contentPage: async ({ page }, use) => {
    await use(new ContentPage(page));
  },
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  journey: async ({ page, homePage, petDetailsPage, quotePage, summaryPage, paymentPage }, use) => {
    await use(
      new JourneyHelper(page, homePage, petDetailsPage, quotePage, summaryPage, paymentPage),
    );
  },
});

export { expect };
