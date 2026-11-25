export const REGEX_PATTERNS = {
  UK_POSTCODE: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  PET_NAME: /^[a-zA-Z\s'-]+$/,
  DATE_FORMAT: /(\d{2}\/\d{2}\/\d{4})/
};

export const VALIDATION_LIMITS = {
  PET_NAME_MIN_LENGTH: 2,
  PET_NAME_MAX_LENGTH: 50,
  AMOUNT_MAX: 10000,
  YEAR_MIN: 1900
};
