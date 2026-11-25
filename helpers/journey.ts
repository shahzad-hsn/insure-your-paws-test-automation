import type { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PetDetailsPage } from '../pages/PetDetailsPage';
import { QuotePage } from '../pages/QuotePage';
import { SummaryPage } from '../pages/SummaryPage';
import { PaymentPage } from '../pages/PaymentPage';
import type { PetScenario, UserScenario } from '../types/petsData';

/** Shared navigation helpers — single place for journey setup used across specs. */
export class JourneyHelper {
  constructor(
    private readonly page: Page,
    private readonly homePage: HomePage,
    private readonly petDetailsPage: PetDetailsPage,
    private readonly quotePage: QuotePage,
    private readonly summaryPage: SummaryPage,
    private readonly paymentPage: PaymentPage,
  ) {}

  async openHomeWithCookiesDismissed(): Promise<void> {
    await this.homePage.goto();
    await this.homePage.rejectCookies();
  }

  async goToPetDetails(): Promise<void> {
    await this.openHomeWithCookiesDismissed();
    await this.homePage.clickStartQuote();
    await this.petDetailsPage.verifyStepIndicatorActive();
  }

  async fillPetDetails(pet: PetScenario): Promise<void> {
    const dob = pet.dob ?? this.petDetailsPage.getPastDate(pet.ageYears ?? 5);

    await this.petDetailsPage.enterPetName(pet.name);
    await this.petDetailsPage.selectPetType(pet.type);
    await this.petDetailsPage.selectBreedType(pet.breedType, pet.breed);

    if (pet.didntPay) {
      await this.petDetailsPage.checkDidntPay();
    } else if (pet.amount) {
      await this.petDetailsPage.enterAmountPaid(pet.amount);
    }

    await this.petDetailsPage.selectPetGender(pet.gender);
    await this.petDetailsPage.selectNeutered(pet.neutered);

    if (pet.address) {
      await this.petDetailsPage.clickManualAddress();
      await this.petDetailsPage.enterManualAddress(
        pet.address.line1,
        pet.address.line2 ?? '',
        pet.address.town,
        pet.address.county ?? '',
        pet.address.postcode,
      );
    } else if (pet.postcode) {
      await this.petDetailsPage.enterPostcode(pet.postcode);
    }

    await this.petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
    await this.petDetailsPage.selectPolicyStartDate(pet.policyStart);
  }

  async completePetDetailsToQuote(pet: PetScenario): Promise<void> {
    await this.goToPetDetails();
    await this.fillPetDetails(pet);
    await this.petDetailsPage.clickGetQuote();
    await this.quotePage.verifyStepIndicatorActive();
  }

  async proceedQuoteToSummary(): Promise<void> {
    await this.quotePage.clickNext();
    await this.summaryPage.verifyStepIndicatorActive();
  }

  /** Fills Your details + marketing + agreement on Summary (does not click Next). */
  async fillSummaryDetails(user: UserScenario): Promise<void> {
    await this.summaryPage.fillUserDetails(
      user.firstName,
      user.lastName,
      user.email,
      user.mobile,
      user.dob.day,
      user.dob.month,
      user.dob.year,
    );
    if (user.marketing !== undefined) {
      await this.summaryPage.selectMarketing(user.marketing);
    } else {
      await this.summaryPage.selectMarketing(false);
    }
    await this.summaryPage.clickAgree();
  }

  async fillSummaryAndProceedToPayment(user: UserScenario): Promise<void> {
    await this.fillSummaryDetails(user);
    await this.summaryPage.clickNext();
    await this.paymentPage.verifyStepIndicatorActive();
  }

  async completeToQuotePage(pet: PetScenario): Promise<void> {
    await this.completePetDetailsToQuote(pet);
  }

  async completeToSummaryPage(pet: PetScenario): Promise<void> {
    await this.completePetDetailsToQuote(pet);
    await this.proceedQuoteToSummary();
  }

  async completeToPaymentPage(pet: PetScenario, user: UserScenario): Promise<void> {
    await this.completeToSummaryPage(pet);
    await this.fillSummaryAndProceedToPayment(user);
  }
}
