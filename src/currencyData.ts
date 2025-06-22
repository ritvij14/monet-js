import currencyCodes from "currency-codes";

// Lightweight wrapper/interface for currency-codes entries that we actually consume internally.
export interface CurrencyInfo {
  code: string; // ISO 4217 three-letter code, e.g. "USD"
  number: string; // ISO 4217 numeric code, e.g. "840"
  currency: string; // Official currency name, e.g. "US Dollar"
  countries: string[]; // List of countries that use the currency
}

/**
 * Returns the currency information for a given ISO 4217 three-letter code.
 * @param code "USD", "EUR", etc.
 */
export function getCurrencyByCode(code: string): CurrencyInfo | null {
  if (!code) return null;
  const entry = (currencyCodes as any).code(code.toUpperCase()) as
    | CurrencyInfo
    | undefined;
  return entry ?? null;
}

/**
 * Returns the currency information for a given ISO 4217 numeric code.
 * @param numericCode "840", "978", etc.
 */
export function getCurrencyByNumber(numericCode: string): CurrencyInfo | null {
  if (!numericCode) return null;
  const entry = (currencyCodes as any).number(numericCode) as
    | CurrencyInfo
    | undefined;
  return entry ?? null;
}

/**
 * Exposes the raw currency data array from the underlying package.
 * Useful for advanced look-ups or tooling.
 */
export function getAllCurrencies(): CurrencyInfo[] {
  return (currencyCodes as any).data as CurrencyInfo[];
}
