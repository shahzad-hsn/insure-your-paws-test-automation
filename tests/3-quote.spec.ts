import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import { QuotePage } from '../pages/QuotePage';
import { PetDetailsPage } from '../pages/PetDetailsPage';
import petsData from '../data/index';
import type { PetScenario } from '../types/petsData';

test.describe('Quote Page - Complete Coverage', () => {
  let quotePage: QuotePage;
  let petDetailsPage: PetDetailsPage;

  test.beforeEach(async ({ journey, quotePage: qp, petDetailsPage: pdp }) => {
    quotePage = qp;
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

    await journey.completePetDetailsToQuote(quotePet);
    await quotePage.verifyStepIndicatorActive();
  });

  test('test:1:- should display default quote values', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Default Values');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('positive');

    await step('Verify default vet fee cover', async () => {
      await quotePage.verifyVetFeeCoverValue(petsData.quoteTestData.defaultValues.vetFeeCover);
    });

    await step('Verify default excess', async () => {
      await quotePage.verifyExcessValue(petsData.quoteTestData.defaultValues.excess);
    });

    await step('Verify default voluntary excess', async () => {
      await quotePage.verifyVoluntaryExcessValue(petsData.quoteTestData.defaultValues.voluntaryExcess);
    });

    await step('Verify page heading contains pet name', async () => {
      await quotePage.verifyPageHeading(petsData.pets[0].name);
    });

    await step('Verify all optional extras are deselected', async () => {
      await quotePage.verifyAllExtrasDeselected();
    });
  });

  test('test:2:- should adjust vet fee cover using slider', async ({page}) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Vet Fee Slider');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Set vet fee cover to minimum', async () => {
      await quotePage.setVetFeeCoverSlider(petsData.quoteTestData.vetFeeCoverOptions.minimum);
      await quotePage.verifyMonthlyTotalExists();
    });

    await step('Set vet fee cover to maximum', async () => {
      await quotePage.setVetFeeCoverSlider(petsData.quoteTestData.vetFeeCoverOptions.maximum);
      await quotePage.verifyMonthlyTotalExists();
    });

    await step('Verify price updates when vet fee cover changes', async () => {
      await quotePage.verifyPriceChangesAfterSliderAdjustment(async () => {
        await quotePage.setVetFeeCoverSlider(petsData.quoteTestData.vetFeeCoverOptions.testValues[0]);
      });
    });
  });

  test('test:3:- should adjust vet fee cover using +/- buttons', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Vet Fee Buttons');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Get initial vet fee cover value', async () => {
      await quotePage.verifyVetFeeCoverValueExists();
    });

    await step('Click plus button and verify value increases', async () => {
      await quotePage.verifyVetFeeCoverValueChangesAfterPlus();
    });

    await step('Click minus button and verify value decreases', async () => {
      await quotePage.verifyVetFeeCoverValueChangesAfterMinus();
    });
  });

  test('test:4:- should adjust excess per condition', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Excess Slider');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Set excess to different values', async () => {
      for (const value of petsData.quoteTestData.excessOptions.testValues) {
        await quotePage.setExcessSlider(value);
        await quotePage.verifyExcessValueExists();
      }
    });

    await step('Verify price updates when excess changes', async () => {
      await quotePage.setExcessSlider(petsData.quoteTestData.excessOptions.minimum);
      await quotePage.verifyPriceChangesAfterSliderAdjustment(async () => {
        await quotePage.setExcessSlider(petsData.quoteTestData.excessOptions.maximum);
      });
    });
  });

  test('test:5:- should adjust voluntary excess', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Voluntary Excess Slider');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Set voluntary excess to different percentages', async () => {
      for (const value of petsData.quoteTestData.voluntaryExcessOptions.testValues) {
        await quotePage.setVoluntaryExcessSlider(value);
        await quotePage.verifyVoluntaryExcessValueExists();
      }
    });

    await step('Verify price updates when voluntary excess changes', async () => {
      await quotePage.setVoluntaryExcessSlider(petsData.quoteTestData.voluntaryExcessOptions.minimum);
      await quotePage.verifyPriceChangesAfterSliderAdjustment(async () => {
        await quotePage.setVoluntaryExcessSlider(petsData.quoteTestData.voluntaryExcessOptions.maximum);
      });
    });
  });

  test('test:6:- should select single optional extra - Find My Pet', async ({page}) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Optional Extras');
    await allure.severity('critical');
    await allure.tag('functional');

    let priceBefore = 0;

    await step('Get initial price', async () => {
      priceBefore = await quotePage.getMonthlyTotalAmount();
      expect(priceBefore).toBeGreaterThan(0);
    });

    await step('Select Find My Pet', async () => {
      await quotePage.selectFindMyPet();
      await page.waitForTimeout(2000);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.verifyFindMyPetSelected();
    });
    
    await step('Verify price increases after adding the extra', async () => {
      const priceAfter = await quotePage.getMonthlyTotalAmount();
      expect(priceAfter).toBeGreaterThan(priceBefore);
    });
  });
  
  test('test:7:- should select multiple optional extras', async ({page}) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Optional Extras');
    await allure.severity('critical');
    await allure.tag('functional');

    let priceBefore = 0;

    await step('Get initial price', async () => {
      priceBefore = await quotePage.getMonthlyTotalAmount();
      expect(priceBefore).toBeGreaterThan(0);
    });
    
    await step('Select all optional extras', async () => {
      await quotePage.selectFindMyPet();
      await page.waitForTimeout(2000);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.selectStayingGoodbye();
      await page.waitForTimeout(2000);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.selectAwayFromHome();
      await page.waitForTimeout(2000);
      await quotePage.waitForProgressBarToDisappear();
    });

    await step('Verify all extras are selected', async () => {
      await quotePage.verifyAllExtrasSelected();
    });

    await step('Verify price increases with all extras', async () => {
      const priceAfter = await quotePage.getMonthlyTotalAmount();
      expect(priceAfter).toBeGreaterThan(priceBefore);
    });
  });

  test('test:8:- should deselect optional extra', async ({page}) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Optional Extras');
    await allure.severity('normal');
    await allure.tag('functional');

    let priceWithExtra = 0;

    await step('Select Find My Pet', async () => {
      await quotePage.selectFindMyPet();
      await page.waitForTimeout(1000);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.verifyFindMyPetSelected();
    });

    await step('Get price with extra selected', async () => {
      priceWithExtra = await quotePage.getMonthlyTotalAmount();
      expect(priceWithExtra).toBeGreaterThan(0);
    });

    await step('Deselect Find My Pet', async () => {
      await quotePage.deselectFindMyPet();
      await page.waitForTimeout(1000);
      await quotePage.waitForProgressBarToDisappear();
      await quotePage.verifyFindMyPetDeselected();
    });

    await step('Verify price decreases after removing the extra', async () => {
      const priceAfter = await quotePage.getMonthlyTotalAmount();
      expect(priceAfter).toBeLessThan(priceWithExtra);
    });
  });

  test('test:9:- should verify optional extras descriptions are visible', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Optional Extras');
    await allure.severity('minor');
    await allure.tag('ui');

    await step('Verify all optional extras are visible on the quote page', async () => {
      await quotePage.verifyOptionalExtrasVisible();
    });
  });

  test('test:10:- should test minimum values for all sliders', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Slider Boundaries');
    await allure.severity('normal');
    await allure.tag('boundary');

    await step('Set all sliders to minimum', async () => {
      await quotePage.setVetFeeCoverSlider(petsData.quoteTestData.vetFeeCoverOptions.minimum);
      await quotePage.setExcessSlider(petsData.quoteTestData.excessOptions.minimum);
      await quotePage.setVoluntaryExcessSlider(petsData.quoteTestData.voluntaryExcessOptions.minimum);
    });

    await step('Verify minimum price is calculated', async () => {
      await quotePage.verifyMonthlyTotalExists();
    });
  });

  test('test:11:- should test maximum values for all sliders', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Slider Boundaries');
    await allure.severity('normal');
    await allure.tag('boundary');

    await step('Set all sliders to maximum', async () => {
      await quotePage.setVetFeeCoverSlider(petsData.quoteTestData.vetFeeCoverOptions.maximum);
      await quotePage.setExcessSlider(petsData.quoteTestData.excessOptions.maximum);
      await quotePage.setVoluntaryExcessSlider(petsData.quoteTestData.voluntaryExcessOptions.maximum);
    });

    await step('Verify maximum price is calculated', async () => {
      await quotePage.verifyMonthlyTotalExists();
    });
  });

  test('test:12:- should verify slider boundaries', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Slider Boundaries');
    await allure.severity('normal');
    await allure.tag('boundary');

    await step('Verify vet fee cover boundaries', async () => {
      await quotePage.verifyVetFeeCoverBoundaries(
        petsData.quoteTestData.vetFeeCoverOptions.minimum,
        petsData.quoteTestData.vetFeeCoverOptions.maximum
      );
    });

    await step('Verify excess boundaries', async () => {
      await quotePage.verifyExcessBoundaries(
        petsData.quoteTestData.excessOptions.minimum,
        petsData.quoteTestData.excessOptions.maximum
      );
    });

    await step('Verify voluntary excess (bill share) boundaries', async () => {
      await quotePage.verifyVoluntaryExcessBoundaries(
        petsData.quoteTestData.voluntaryExcessOptions.minimum,
        petsData.quoteTestData.voluntaryExcessOptions.maximum
      );
    });
  });

  test('test:13:- should view policy summary', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Policy Summary Modal');
    await allure.severity('critical');
    await allure.tag('functional');

    await step('Click view policy summary link', async () => {
      await quotePage.clickViewPolicySummary();
    });

    await step('Verify policy summary modal is displayed', async () => {
      await quotePage.verifyPolicySummaryModalVisible();
    });

    await step('Verify policy summary details', async () => {
      await quotePage.verifyPolicySummaryDetails();
    });

    await step('Verify optional extras section is displayed', async () => {
      await quotePage.verifyPolicySummaryOptionalExtras();
    });

    await step('Close policy summary modal', async () => {
      await quotePage.closePolicySummaryModal();
    });
  });

  test('test:14:- should navigate to next page', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Navigation');
    await allure.severity('blocker');
    await allure.tag('navigation');

    await step('Click Next button', async () => {
      await quotePage.clickNext();
    });

    await step('Verify navigation to Summary page', async () => {
      await quotePage.verifyNavigationToSummaryPage();
    });
  });

  test('test:15:- should navigate back to pet details page', async ({page}) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Navigation');
    await allure.severity('normal');
    await allure.tag('navigation');

    await step('Click Back link', async () => {
      await quotePage.clickBack();
    });

    await step('Verify navigation back to Pet Details page', async () => {
      await quotePage.verifyNavigationToPetDetailsPage();
    });
  });

  test('test:16:- should display help popup with contact information', async ({page}) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Help Popup');
    await allure.severity('minor');
    await allure.tag('ui');

    await step('Click Help button', async () => {
      await quotePage.clickHelp();
    });

    await step('Verify help popup is visible', async () => {
      await quotePage.verifyHelpPopupVisible();
    });

    await step('Verify contact details are displayed', async () => {
      await quotePage.verifyHelpPopupContactDetails();
    });

    await step('Verify opening hours are displayed', async () => {
      await quotePage.verifyHelpPopupOpeningHours();
    });

    await step('Close help popup', async () => {
      await quotePage.closeHelpPopup();
    });
  });

  // Excel iyp_09: Edit pet details through the Policy Summary popup on step 2
  test('test:17:- should edit pet details from the policy summary popup and rehydrate the quote', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Quote Customisation');
    await allure.story('Edit Pet From Policy Summary Modal');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('iyp_09');

    const pet = petsData.pets[0];
    const originalName = pet.name;
    const updatedName = petsData.summaryData.updatedPetName;

    await step('Open Policy Summary modal and verify Edit pet details is offered', async () => {
      await quotePage.clickViewPolicySummary();
      await quotePage.verifyPolicySummaryModalVisible();
      await quotePage.verifyPolicySummaryDetails();
      await quotePage.verifyPolicySummaryPetName(originalName);
      await quotePage.verifyPolicySummaryEditPetButtonVisible();
    });

    await step('Click Edit pet details and land on step 1', async () => {
      await quotePage.clickEditPetDetailsFromPolicySummaryModal();
      await petDetailsPage.verifyStepIndicatorActive();
      await petDetailsPage.verifyPageHeadingVisible();
    });

    await step('Verify step 1 is pre-filled with the current pet selections', async () => {
      expect(await petDetailsPage.getPetNameValue()).toBe(originalName);
      await petDetailsPage.verifyPetTypeSelection(pet.type);
      await petDetailsPage.verifyGenderSelection(pet.gender);
      await petDetailsPage.verifyNeuteredSelection(pet.neutered);
    });

    await step('Update the pet name and get a new quote', async () => {
      await petDetailsPage.enterPetName(updatedName);
      expect(await petDetailsPage.getPetNameValue()).toBe(updatedName);
      await petDetailsPage.clickGetQuote();
    });

    await step('Verify the quote rehydrates with the updated pet name', async () => {
      await quotePage.verifyStepIndicatorActive();
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyPageHeadingExact(updatedName);
    });

    await step('Re-open Policy Summary and confirm the pet name updated', async () => {
      await quotePage.clickViewPolicySummary();
      await quotePage.verifyPolicySummaryModalVisible();
      await quotePage.verifyPolicySummaryPetName(updatedName);
      await quotePage.closePolicySummaryModal();
    });
  });
});
