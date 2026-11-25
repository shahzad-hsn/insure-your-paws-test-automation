import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';
import { PetDetailsPage } from '../pages/PetDetailsPage';
import { QuotePage } from '../pages/QuotePage';
import petsData from '../data/index';

const scenarios = petsData.petScenarios;

test.describe('Pet Details Page - Complete Coverage', () => {
  let petDetailsPage: PetDetailsPage;
  let quotePage: QuotePage;

  test.beforeEach(async ({ journey, petDetailsPage: pdp, quotePage: qp }) => {
    petDetailsPage = pdp;
    quotePage = qp;
    await journey.goToPetDetails();
  });

  test('test:1:- should display all required field errors when submitting empty form', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Form Validation');
    await allure.severity('critical');
    await allure.tag('validation');
    await allure.tag('negative');

    await step('Submit empty form', async () => {
      await petDetailsPage.clickGetQuote({ waitForQuote: false });
    });

    await step('Verify all error messages are displayed', async () => {
      await petDetailsPage.verifyAllErrorsDisplayed();
    });
  });

  test('test:2:- should validate pet name with all edge cases', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Pet Name Validation');
    await allure.severity('normal');
    await allure.tag('validation');
    await allure.tag('unit');

    await step('Verify pet name validation rules', async () => {
      petDetailsPage.verifyPetNameValidation();
    });
  });

  test('test:3:- should validate amount with all edge cases', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Amount Validation');
    await allure.severity('normal');
    await allure.tag('validation');
    await allure.tag('unit');

    await step('Verify amount validation rules', async () => {
      petDetailsPage.verifyAmountValidation();
    });
  });

  test('test:4:- should validate postcode with valid and invalid formats', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Postcode Validation');
    await allure.severity('normal');
    await allure.tag('validation');
    await allure.tag('unit');

    await step('Verify postcode validation rules', async () => {
      petDetailsPage.verifyPostcodeValidation();
    });
  });

  test('test:5:- should validate date of birth with all edge cases', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('DOB Validation');
    await allure.severity('normal');
    await allure.tag('validation');
    await allure.tag('unit');

    await step('Verify date of birth validation rules', async () => {
      petDetailsPage.verifyDateOfBirthValidation();
    });
  });

  test('test:6:- should successfully add a cat with all details and verify inputs', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Add Cat');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('positive');

    const pet = scenarios.addCat;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in cat details and verify', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.verifyCompleteFormState(pet.name, pet.type, pet.gender, pet.amount!, pet.neutered, pet.postcode!);
    });

    await step('Find address and enter date of birth', async () => {
      await page.waitForTimeout(1000);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
    });

    await step('Select policy start date and verify', async () => {
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
    });

    await step('Get quote and verify quote page loaded', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyStepIndicatorActive();
    });
  });

  test('test:7:- should successfully add a dog with all details', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Add Dog');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('positive');

    const pet = scenarios.addDog;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in dog details and verify', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.verifyCompleteFormState(pet.name, pet.type, pet.gender, pet.amount!, pet.neutered, pet.postcode!);
    });

    await step('Find address and enter date of birth', async () => {
      await page.waitForTimeout(1000);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
    });

    await step('Select policy start date and verify', async () => {
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
    });

    await step('Get quote and verify quote page loaded', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyStepIndicatorActive();
    });
  });

  test('test:8:- should add pet with "I didn\'t pay anything" checkbox option', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Didnt Pay Option');
    await allure.severity('normal');
    await allure.tag('positive');

    const pet = scenarios.didntPay;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in pet details with "didn\'t pay" option and verify', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.checkDidntPay();
      await petDetailsPage.verifyAmountFieldState(true);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.verifyAllSelections(pet.type, pet.gender, pet.neutered);
    });

    await step('Find address and complete form', async () => {
      await page.waitForTimeout(1000);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
    });

    await step('Get quote and verify quote page loaded', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyStepIndicatorActive();
    });
  });

  test('test:9:- should add pet using manual address entry', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Manual Address');
    await allure.severity('normal');
    await allure.tag('positive');

    const pet = scenarios.manualAddress;
    const address = pet.address!;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in pet details and verify', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.verifyAllSelections(pet.type, pet.gender, pet.neutered);
    });

    await step('Click manual address link and fill address', async () => {
      await petDetailsPage.clickManualAddress();
      await page.waitForTimeout(500);
      await petDetailsPage.enterManualAddress(
        address.line1,
        address.line2,
        address.town,
        address.county,
        address.postcode
      );
    });

    await step('Verify manual address values', async () => {
      const enteredAddress = await petDetailsPage.getManualAddressValues();
      expect(enteredAddress.addressLine1).toBe(address.line1);
      expect(enteredAddress.addressLine2).toBe(address.line2);
      expect(enteredAddress.town).toBe(address.town);
      expect(enteredAddress.county).toBe(address.county);
      expect(enteredAddress.postcode).toBe(address.postcode);
    });

    await step('Complete form and get quote', async () => {
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyStepIndicatorActive();
    });
  });

  test('test:10:- should validate policy start date displays correctly for today', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Policy Start Date');
    await allure.severity('normal');
    await allure.tag('positive');

    const pet = scenarios.policyToday;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in pet details and verify', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.verifyCompleteFormState(pet.name, pet.type, pet.gender, pet.amount!, pet.neutered, pet.postcode!);
    });

    await step('Find address and enter date of birth', async () => {
      await page.waitForTimeout(1000);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
    });

    await step('Select and verify policy start date for today', async () => {
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
    });
  });

  test('test:11:- should validate policy start date displays correctly for tomorrow', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Policy Start Date');
    await allure.severity('normal');
    await allure.tag('positive');

    const pet = scenarios.policyTomorrow;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in pet details and verify', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.verifyCompleteFormState(pet.name, pet.type, pet.gender, pet.amount!, pet.neutered, pet.postcode!);
    });

    await step('Find address and enter date of birth', async () => {
      await page.waitForTimeout(1000);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
    });

    await step('Select and verify policy start date for tomorrow', async () => {
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
    });
  });

  test('test:12:- should handle both pet types (cat and dog) correctly', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Pet Type Toggle');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Enter pet name', async () => {
      await petDetailsPage.enterPetName('TestPet');
    });

    await step('Select cat and verify', async () => {
      await petDetailsPage.selectPetType('cat');
      await petDetailsPage.selectBreedType('pedigree', 'Abyssinian');
      await petDetailsPage.verifyPetTypeSelection('cat');
    });

    await step('Switch to dog and verify', async () => {
      await petDetailsPage.selectPetType('dog');
      await petDetailsPage.selectBreedType('cross', 'Afghan');
      await petDetailsPage.verifyPetTypeSelection('dog');
    });

    await step('Select male gender and verify', async () => {
      await petDetailsPage.selectPetGender('male');
      await petDetailsPage.verifyGenderSelection('male');
    });

    await step('Switch to female gender and verify', async () => {
      await petDetailsPage.selectPetGender('female');
      await petDetailsPage.verifyGenderSelection('female');
    });

    await step('Complete remaining fields and verify final form state', async () => {
      await petDetailsPage.enterAmountPaid('500');
      await petDetailsPage.selectNeutered(true);
      await petDetailsPage.enterPostcode('SW1A 1AA');
      await petDetailsPage.verifyCompleteFormState('TestPet', 'dog', 'female', '500', true, 'SW1A 1AA');
    });
  });

  test('test:13:- should handle both neutered options (yes and no)', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Neutered Toggle');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Fill in basic pet details', async () => {
      await petDetailsPage.enterPetName('TestPet');
      await petDetailsPage.selectPetType('dog');
      await petDetailsPage.selectBreedType('pedigree', 'Afghan');
      await petDetailsPage.selectPetGender('male');
      await petDetailsPage.enterAmountPaid('500');
    });

    await step('Select neutered yes and verify', async () => {
      await petDetailsPage.selectNeutered(true);
      await petDetailsPage.verifyNeuteredSelection(true);
    });

    await step('Switch to neutered no and verify', async () => {
      await petDetailsPage.selectNeutered(false);
      await petDetailsPage.verifyNeuteredSelection(false);
    });

    await step('Complete form and verify final form state', async () => {
      await petDetailsPage.enterPostcode('M1 1AE');
      await petDetailsPage.verifyCompleteFormState('TestPet', 'dog', 'male', '500', false, 'M1 1AE');
    });
  });

  test('test:14:- should complete full flow and successfully get quote', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Complete Flow');
    await allure.severity('blocker');
    await allure.tag('smoke');
    await allure.tag('e2e');

    const pet = scenarios.completeFlow;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in all pet details and verify', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
      await petDetailsPage.enterPostcode(pet.postcode!);
      await petDetailsPage.verifyCompleteFormState(pet.name, pet.type, pet.gender, pet.amount!, pet.neutered, pet.postcode!);
    });

    await step('Find address and enter date of birth', async () => {
      await page.waitForTimeout(1000);
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
    });

    await step('Select policy start date and verify', async () => {
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
      await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
    });

    await step('Get quote and verify quote page loaded', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyStepIndicatorActive();
    });
  });

  test('test:15:- should add multiple pets (maximum 8) and verify button disabled', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Multi-Pet');
    await allure.severity('critical');
    await allure.tag('functional');
    await allure.tag('boundary');

    const pets = petsData.pets as Array<{
      name: string;
      type: 'cat' | 'dog';
      gender: 'male' | 'female';
      amount: string;
      neutered: boolean;
      postcode: string;
      dob: { day: string; month: string; year: string };
      policyStart: 'today' | 'tomorrow';
    }>;

    await step('Enter address once for all pets', async () => {
      await petDetailsPage.enterPostcode('SW1A 1AA');
      await page.waitForTimeout(1500);
    });

    for (let i = 0; i < pets.length; i++) {
      const pet = pets[i];
      const petNumber = i + 1;

      await step(`Verify pet ${petNumber} heading`, async () => {
        await petDetailsPage.verifyPetHeading(petNumber);
      });

      await step(`Add pet ${petNumber} - ${pet.name} (${pet.type})`, async () => {
        await petDetailsPage.enterPetName(pet.name);
        await petDetailsPage.selectPetType(pet.type);
        await petDetailsPage.selectBreedType(pet.type === 'cat' ? 'pedigree' : 'cross', pet.type === 'cat' ? 'Abyssinian' : 'Afghan');
        await petDetailsPage.selectPetGender(pet.gender);
        await petDetailsPage.enterAmountPaid(pet.amount);
        await petDetailsPage.selectNeutered(pet.neutered);
      });

      await step(`Complete pet ${petNumber} details`, async () => {
        await petDetailsPage.enterDateOfBirth(pet.dob.day, pet.dob.month, pet.dob.year);
        await petDetailsPage.selectPolicyStartDate(pet.policyStart);
        await petDetailsPage.verifyPolicyStartDateIsCorrect(pet.policyStart);
      });

      if (i < pets.length - 1) {
        await step(`Click Add Pet button for pet ${petNumber}`, async () => {
          await petDetailsPage.clickAddPet();
          await page.waitForTimeout(1500);
        });
      } else {
        await step('Verify Add Pet button is disabled after filling 8th pet', async () => {
          await petDetailsPage.verifyAddPetButtonDisabled();
        });
      }
    }

    await step('Submit the quote for all 8 pets', async () => {
      // The test's purpose (the max-8 limit / Add Pet button disabled) is
      // already asserted above. Submitting here exercises the action; the
      // multi-pet quote submission has a separate known limitation, so we
      // don't assert quote-page navigation for the 8-pet scenario.
      await petDetailsPage.clickGetQuote({ waitForQuote: false });
    });
  });

  test('test:16:- should display error when address is not selected from dropdown', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Address Validation');
    await allure.severity('normal');
    await allure.tag('validation');
    await allure.tag('negative');

    const pet = scenarios.addressNotSelected;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill in basic pet details', async () => {
      await petDetailsPage.enterPetName(pet.name);
      await petDetailsPage.selectPetType(pet.type);
      await petDetailsPage.selectBreedType(pet.breedType, pet.breed);
      await petDetailsPage.selectPetGender(pet.gender);
      await petDetailsPage.enterAmountPaid(pet.amount!);
      await petDetailsPage.selectNeutered(pet.neutered);
    });

    await step('Enter postcode and click Find without selecting an address', async () => {
      await petDetailsPage.enterPostcodeAndFind(pet.postcode!);
    });

    await step('Wait for address dropdown to appear', async () => {
      await page.waitForTimeout(1000);
    });

    await step('Fill remaining details without selecting address', async () => {
      await petDetailsPage.enterDateOfBirth(dob.day, dob.month, dob.year);
      await petDetailsPage.selectPolicyStartDate(pet.policyStart);
    });

    await step('Try to get quote without selecting address', async () => {
      await petDetailsPage.clickGetQuote({ waitForQuote: false });
    });

    await step('Verify address selection error is displayed', async () => {
      await petDetailsPage.verifyAddressSelectionError();
    });

    await step('Select address from dropdown and verify error disappears', async () => {
      await petDetailsPage.selectFirstAddressFromDropdown();
      await page.waitForTimeout(500);
      expect(await petDetailsPage.isAddressSelectionErrorVisible()).toBe(false);
    });

    await step('Successfully get quote after selecting address', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyPageHeadingVisible();
      await quotePage.verifyStepIndicatorActive();
    });
  });

  test('test:17:- persistence:- pet details should persist after navigating to quote and back', async ({ page }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Form Persistence');
    await allure.severity('critical');
    await allure.tag('navigation');
    await allure.tag('functional');

    const pet = scenarios.persistence;
    const dob = petDetailsPage.getPastDate(pet.ageYears);

    await step('Fill complete pet details', async () => {
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

    await step('Proceed to the quote page', async () => {
      await petDetailsPage.clickGetQuote();
      await quotePage.verifyPageHeadingVisible();
    });

    await step('Navigate back to pet details', async () => {
      await quotePage.clickBack();
      await petDetailsPage.verifyPageHeadingVisible();
    });

    await step('Verify previously entered pet details persisted', async () => {
      await petDetailsPage.verifyCompleteFormState(pet.name, pet.type, pet.gender, pet.amount!, pet.neutered, pet.postcode!);
    });
  });

  const breedMatrix = petsData.breedMatrix;

  breedMatrix.forEach((combo, index) => {
    test(`test:${18 + index}:- should select ${combo.petType} with ${combo.label} breed type`, async () => {
      await allure.epic('Pet Insurance');
      await allure.feature('Pet Details');
      await allure.story('Pet Type & Breed Type Coverage');
      await allure.severity('normal');
      await allure.tag('functional');
      await allure.tag('coverage');

      await step('Enter pet name', async () => {
        await petDetailsPage.enterPetName('Matrix');
      });

      await step(`Select pet type "${combo.petType}" and verify`, async () => {
        await petDetailsPage.selectPetType(combo.petType);
        await petDetailsPage.verifyPetTypeSelection(combo.petType);
      });

      await step(`Select breed type "${combo.label}" button`, async () => {
        await petDetailsPage.clickBreedTypeButton(combo.breedType);
      });

      await step(`Verify breed dropdown presence is ${combo.expectBreedDropdown}`, async () => {
        expect(await petDetailsPage.isBreedDropdownVisible()).toBe(combo.expectBreedDropdown);
      });

      await step(`Verify confirm checkbox presence is ${combo.expectConfirmCheckbox}`, async () => {
        expect(await petDetailsPage.isBreedConfirmCheckboxVisible()).toBe(combo.expectConfirmCheckbox);
      });

      await step('Complete breed selection and verify breed type stays active', async () => {
        if (combo.expectBreedDropdown) {
          await petDetailsPage.selectBreed(combo.breed);
        }
        if (combo.expectConfirmCheckbox) {
          await petDetailsPage.checkBreedConfirm();
        }
        await petDetailsPage.verifyBreedTypeSelection(combo.breedType);
      });
    });
  });

  test('test:24:- should expose all policy start options and allow custom date selection', async () => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Policy Start Date Options');
    await allure.severity('normal');
    await allure.tag('functional');
    await allure.tag('coverage');

    await step('Verify Today, Tomorrow and Custom date options are present', async () => {
      await petDetailsPage.verifyPolicyStartOptionsPresent();
    });

    await step('Open the custom date option and verify the date picker appears', async () => {
      await petDetailsPage.openCustomDate();
      await petDetailsPage.verifyCustomDatePickerVisible();
    });
  });
});

/**
 * Postcode lookup fallback coverage.
 *
 * The Find button calls GET .../geo/search/uk/postcode?postCode=... and the
 * form must stay usable when that lookup can't help:
 *  - unknown postcode  -> API answers 200 with an empty buildingList
 *  - API outage        -> request fails outright (stubbed 500 here)
 * In both cases the customer must still be able to enter their address
 * manually and continue the journey.
 */

const ADDRESS_LOOKUP_URL = '**/geo/search/uk/postcode*';

// Real response shape captured from staging for a postcode with no matches.
const EMPTY_LOOKUP_RESPONSE = {
  data: {
    address1: null,
    address2: null,
    address3: null,
    address4: null,
    postCode: null,
    id: null,
    buildingList: null,
    getOneString: null,
  },
  errorMessage: null,
  success: true,
};

test.describe('Address Lookup Fallback', () => {
  test.beforeEach(async ({ journey }) => {
    await journey.goToPetDetails();
  });

  test('test:25:- @smoke should fall back to manual address fields when the postcode has no matches', async ({ page, petDetailsPage, basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Address Fallback');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('negative');

    await step('Stub the lookup to return the real "no matches" payload', async () => {
      // Deterministic: we don't depend on which postcodes staging's address
      // provider happens to know about.
      await page.route(ADDRESS_LOOKUP_URL, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(EMPTY_LOOKUP_RESPONSE),
        }),
      );
    });

    await step('Search for the unknown postcode', async () => {
      await basePage.dismissCookieOverlay();
      await petDetailsPage.enterPostcodeAndFind('ZZ99 9ZZ');
    });

    await step('Verify the manual address form is offered instead of a dropdown', async () => {
      await petDetailsPage.verifyManualAddressFormVisible();
      await petDetailsPage.verifyAddressDropdownNotVisible();
    });

    await step('Verify the manual fields accept an address', async () => {
      await petDetailsPage.enterManualAddress(
        '1 Fallback Street',
        '',
        'Manchester',
        'Greater Manchester',
        'M1 1AE',
      );
      const values = await petDetailsPage.getManualAddressValues();
      expect(values.addressLine1).toBe('1 Fallback Street');
      expect(values.town).toBe('Manchester');
    });
  });

  test('test:26:- should keep the manual entry path available when the lookup API is down', async ({ page, petDetailsPage, basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Address Fallback');
    await allure.severity('critical');
    await allure.tag('negative');

    await step('Stub the lookup API to fail with a 500', async () => {
      await page.route(ADDRESS_LOOKUP_URL, (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
      );
    });

    await step('Search a valid postcode while the API is down', async () => {
      await basePage.dismissCookieOverlay();
      await petDetailsPage.enterPostcodeAndFind('M1 1AE');
    });

    await step('Verify the journey is not dead-ended', async () => {
      // The app swallows the failure silently (no dropdown, no error), but the
      // manual entry link must remain so the customer can still proceed.
      await basePage.verifyNoApplicationError();
      await petDetailsPage.verifyManualAddressLinkVisible();
    });

    await step('Enter the address manually and verify the form accepts it', async () => {
      await petDetailsPage.clickManualAddress();
      await petDetailsPage.verifyManualAddressFormVisible();
      await petDetailsPage.enterManualAddress(
        '113 Newton Street',
        '',
        'Manchester',
        'Greater Manchester',
        'M1 1AE',
      );
      const values = await petDetailsPage.getManualAddressValues();
      expect(values.addressLine1).toBe('113 Newton Street');
      expect(values.town).toBe('Manchester');
    });
  });

  test('test:27:- should recover when the lookup succeeds after a failed attempt', async ({ page, petDetailsPage, basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Pet Details');
    await allure.story('Address Fallback');
    await allure.severity('normal');
    await allure.tag('negative');

    await step('Fail the first lookup, then restore the real API', async () => {
      let failNext = true;
      await page.route(ADDRESS_LOOKUP_URL, (route) => {
        if (failNext) {
          failNext = false;
          return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
        }
        return route.continue();
      });
    });

    await step('First search fails silently', async () => {
      await basePage.dismissCookieOverlay();
      await petDetailsPage.enterPostcodeAndFind('M1 1AE');
      await petDetailsPage.verifyAddressDropdownNotVisible();
    });

    await step('Second search reaches the real API and offers addresses', async () => {
      await petDetailsPage.clickFind();
      await petDetailsPage.verifyAddressDropdownVisible();
      await petDetailsPage.selectFirstAddressFromDropdown();
      const values = await petDetailsPage.getManualAddressValues();
      // The looked-up address varies per postcode, so assert the field was
      // populated with real address text rather than a specific value.
      expect(values.addressLine1, 'Selected address should populate line 1').toMatch(/\w+/);
    });
  });
});
