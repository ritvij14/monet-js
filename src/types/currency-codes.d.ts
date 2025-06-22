declare module "currency-codes" {
  export interface CurrencyCodeEntry {
    code: string;
    currency: string;
    number: string;
    countries: string[];
  }

  interface CurrencyCodes {
    data: CurrencyCodeEntry[];
    code(code: string): CurrencyCodeEntry | undefined;
    number(num: string): CurrencyCodeEntry | undefined;
    country(name: string): CurrencyCodeEntry[];
  }

  const currencyCodes: CurrencyCodes;
  export default currencyCodes;
}
