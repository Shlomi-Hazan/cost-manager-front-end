/*
 * Course requirement: the application must support exactly these four
 * currency identifiers, and no others. This is the single source of truth
 * for that list so no other module needs to duplicate it.
 *
 * "EURO" is intentionally used instead of the more common "EUR" because the
 * official course specification names the identifier "EURO" explicitly.
 * Do not "fix" this to EUR — that would violate the required identifier set.
 */
export const supportedCurrencies = [
  'USD',
  'ILS',
  'GBP',
  'EURO'
];
