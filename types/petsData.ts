export type PetType = 'cat' | 'dog';
export type BreedType = 'pedigree' | 'cross' | 'moggie';
export type PetGender = 'male' | 'female';
export type PolicyStart = 'today' | 'tomorrow';

export interface DateParts {
  day: string;
  month: string;
  year: string;
}

export interface Address {
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
}

export interface PetScenario {
  name: string;
  type: PetType;
  breedType: BreedType;
  breed?: string;
  gender: PetGender;
  amount?: string;
  didntPay?: boolean;
  neutered: boolean;
  postcode?: string;
  ageYears?: number;
  dob?: DateParts;
  policyStart: PolicyStart;
  address?: Address;
}

export interface QuoteScenario {
  vetFees?: string;
  excess?: string;
  coPayment?: string;
  extra?: number;
}

export interface UserScenario {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dob: DateParts;
  marketing?: boolean;
}

export interface PaymentAddress {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
}

export interface PaymentScenario {
  frequency?: 'monthly' | 'annual';
  country?: string;
  email: string;
  address?: PaymentAddress;
  bank?: { sortCode: string; accountNumber: string };
}

export interface FlowScenario {
  pet?: PetScenario;
  pets?: PetScenario[];
  quote?: QuoteScenario;
  user?: UserScenario;
  payment?: PaymentScenario;
}

export interface ValidationScenario {
  pet: PetScenario;
  quote?: QuoteScenario;
  user?: UserScenario;
  payment?: PaymentScenario;
}

export interface BreedMatrixEntry {
  petType: PetType;
  breedType: BreedType;
  label: string;
  breed?: string;
  expectBreedDropdown: boolean;
  expectConfirmCheckbox: boolean;
}

export interface SummaryData {
  pet: PetScenario;
  placeholderName: string;
  updatedPetName: string;
  validEmail: string;
  validMobile: string;
  validDOB: DateParts;
  invalidEmails: string[];
  invalidMobiles: string[];
  invalidDayDOB: DateParts;
  invalidMonthDOB: DateParts;
  optionalExtraStatus: { notIncluded: string; included: string };
  validDiscountCode: string;
  discountAppliedMessageContains: string;
  editedCustomerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
}

export interface PaymentCardDetails {
  number: string;
  securityCode: string;
  expiry?: string;
  notes?: string;
}

export interface PaymentCardsData {
  valid: PaymentCardDetails;
  expired: PaymentCardDetails;
  threeDSSuccess: PaymentCardDetails;
  threeDSFail: PaymentCardDetails;
  threeDSChallenge: PaymentCardDetails;
}

export interface QuoteTestData {
  defaultValues: {
    vetFeeCover: string;
    excess: string;
    voluntaryExcess: string;
    basePrice: string;
  };
  vetFeeCoverOptions: {
    minimum: string;
    maximum: string;
    testValues: string[];
  };
  excessOptions: {
    minimum: string;
    maximum: string;
    testValues: string[];
  };
  voluntaryExcessOptions: {
    minimum: string;
    maximum: string;
    testValues: string[];
  };
  optionalExtras: Record<string, { name: string; price: string }>;
}

export interface PetsData {
  flowScenarios: Record<string, FlowScenario>;
  validationScenarios: Record<string, ValidationScenario>;
  petScenarios: Record<string, PetScenario>;
  summaryData: SummaryData;
  paymentCards: PaymentCardsData;
  breedMatrix: BreedMatrixEntry[];
  pets: Array<PetScenario & { dob: DateParts }>;
  userDetails: UserScenario[];
  quoteTestData: QuoteTestData;
  errorMessages: Record<string, unknown>;
  validationTestData: Record<string, unknown>;
}
