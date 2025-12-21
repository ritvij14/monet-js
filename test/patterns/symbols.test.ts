/**
 * Unit tests for Symbols Pattern Parser
 * ======================================
 * Tests the parsing of currency symbols from around the world.
 */

import { parseSymbol, matchSymbol, CURRENCY_SYMBOL_MAP } from '../../src/patterns/symbols';
import { ValueOverflowError } from '../../src/errors';

describe('Symbols Pattern Parser', () => {
  describe('parseSymbol', () => {
    describe('Basic symbol parsing', () => {
      test('should parse US dollar with symbol before', () => {
        const result = parseSymbol('$100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
        expect(result.symbol).toBe('$');
        expect(result.raw).toBe('$100');
      });

      test('should parse Euro with symbol before', () => {
        const result = parseSymbol('€50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('EUR');
        expect(result.symbol).toBe('€');
      });

      test('should parse British Pound with symbol before', () => {
        const result = parseSymbol('£20.50');
        expect(result.amount).toBe(20.50);
        expect(result.currencyCode).toBe('GBP');
        expect(result.symbol).toBe('£');
      });

      test('should parse symbol after number', () => {
        const result = parseSymbol('100$');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
        expect(result.symbol).toBe('$');
      });

      test('should parse Euro after number', () => {
        const result = parseSymbol('50€');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('EUR');
        expect(result.symbol).toBe('€');
      });
    });

    describe('Whitespace handling', () => {
      test('should handle whitespace between symbol and number', () => {
        const result = parseSymbol('$ 100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
      });

      test('should handle whitespace with symbol after', () => {
        const result = parseSymbol('100 €');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should handle leading/trailing whitespace', () => {
        const result = parseSymbol('  $100  ');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
      });
    });

    describe('Number formats', () => {
      test('should parse integers', () => {
        const result = parseSymbol('$1000');
        expect(result.amount).toBe(1000);
      });

      test('should parse decimals', () => {
        const result = parseSymbol('$99.99');
        expect(result.amount).toBe(99.99);
      });

      test('should parse numbers with thousands separators', () => {
        const result = parseSymbol('$1,234.56');
        expect(result.amount).toBe(1234.56);
      });

      test('should parse large numbers with multiple separators', () => {
        const result = parseSymbol('$1,234,567.89');
        expect(result.amount).toBe(1234567.89);
      });

      test('should parse numbers with only decimal point', () => {
        const result = parseSymbol('$0.99');
        expect(result.amount).toBe(0.99);
      });
    });

    describe('Global currency symbols', () => {
      // Asian currencies
      test('should parse Japanese Yen', () => {
        const result = parseSymbol('¥1000');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('JPY');
      });

      test('should parse Indian Rupee', () => {
        const result = parseSymbol('₹500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('INR');
      });

      test('should parse Korean Won', () => {
        const result = parseSymbol('₩5000');
        expect(result.amount).toBe(5000);
        expect(result.currencyCode).toBe('KRW');
      });

      test('should parse Thai Baht', () => {
        const result = parseSymbol('฿100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('THB');
      });

      test('should parse Philippine Peso', () => {
        const result = parseSymbol('₱250');
        expect(result.amount).toBe(250);
        expect(result.currencyCode).toBe('PHP');
      });

      test('should parse Vietnamese Dong', () => {
        const result = parseSymbol('₫50000');
        expect(result.amount).toBe(50000);
        expect(result.currencyCode).toBe('VND');
      });

      test('should parse Chinese Yuan with symbol', () => {
        const result = parseSymbol('元100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('CNY');
      });

      // Middle Eastern currencies
      test('should parse Israeli Shekel', () => {
        const result = parseSymbol('₪100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('ILS');
      });

      test('should parse UAE Dirham', () => {
        const result = parseSymbol('د.إ500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('AED');
      });

      test('should parse Saudi Riyal', () => {
        const result = parseSymbol('ر.س100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('SAR');
      });

      // Eastern European currencies
      test('should parse Russian Ruble', () => {
        const result = parseSymbol('₽1000');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('RUB');
      });

      test('should parse Turkish Lira', () => {
        const result = parseSymbol('₺250');
        expect(result.amount).toBe(250);
        expect(result.currencyCode).toBe('TRY');
      });

      test('should parse Polish Zloty', () => {
        const result = parseSymbol('zł100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('PLN');
      });

      test('should parse Ukrainian Hryvnia', () => {
        const result = parseSymbol('₴500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('UAH');
      });

      test('should parse Czech Koruna', () => {
        const result = parseSymbol('Kč1000');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('CZK');
      });

      test('should parse Hungarian Forint', () => {
        const result = parseSymbol('Ft5000');
        expect(result.amount).toBe(5000);
        expect(result.currencyCode).toBe('HUF');
      });

      // African currencies
      test('should parse South African Rand', () => {
        const result = parseSymbol('R100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('ZAR');
      });

      test('should parse Nigerian Naira', () => {
        const result = parseSymbol('₦5000');
        expect(result.amount).toBe(5000);
        expect(result.currencyCode).toBe('NGN');
      });

      test('should parse Egyptian Pound', () => {
        const result = parseSymbol('E£100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('EGP');
      });

      test('should parse Ghanaian Cedi', () => {
        const result = parseSymbol('GH₵50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('GHS');
      });

      test('should parse Kenyan Shilling', () => {
        const result = parseSymbol('KSh1000');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('KES');
      });

      // Latin American currencies
      test('should parse Brazilian Real', () => {
        const result = parseSymbol('R$100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('BRL');
      });

      test('should parse Mexican Peso', () => {
        const result = parseSymbol('MX$500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('MXN');
      });

      test('should parse Argentine Peso', () => {
        const result = parseSymbol('AR$1000');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('ARS');
      });

      test('should parse Chilean Peso', () => {
        const result = parseSymbol('CL$10000');
        expect(result.amount).toBe(10000);
        expect(result.currencyCode).toBe('CLP');
      });

      test('should parse Colombian Peso', () => {
        const result = parseSymbol('CO$5000');
        expect(result.amount).toBe(5000);
        expect(result.currencyCode).toBe('COP');
      });

      test('should parse Peruvian Sol', () => {
        const result = parseSymbol('S/100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('PEN');
      });

      test('should parse Uruguayan Peso', () => {
        const result = parseSymbol('$U500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('UYU');
      });

      // Other regions
      test('should parse Australian Dollar', () => {
        const result = parseSymbol('A$100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('AUD');
      });

      test('should parse Canadian Dollar', () => {
        const result = parseSymbol('C$75');
        expect(result.amount).toBe(75);
        expect(result.currencyCode).toBe('CAD');
      });

      test('should parse New Zealand Dollar', () => {
        const result = parseSymbol('NZ$50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('NZD');
      });

      test('should parse Singapore Dollar', () => {
        const result = parseSymbol('S$100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('SGD');
      });

      test('should parse Hong Kong Dollar', () => {
        const result = parseSymbol('HK$500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('HKD');
      });

      test('should parse Swiss Franc', () => {
        const result = parseSymbol('CHF 100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('CHF');
      });

      test('should parse Swedish Krona', () => {
        const result = parseSymbol('SEK 500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('SEK');
      });

      test('should parse Norwegian Krone', () => {
        const result = parseSymbol('NOK 750');
        expect(result.amount).toBe(750);
        expect(result.currencyCode).toBe('NOK');
      });

      test('should parse Danish Krone', () => {
        const result = parseSymbol('DKK 400');
        expect(result.amount).toBe(400);
        expect(result.currencyCode).toBe('DKK');
      });

      // Central Asian currencies
      test('should parse Kazakhstani Tenge', () => {
        const result = parseSymbol('₸5000');
        expect(result.amount).toBe(5000);
        expect(result.currencyCode).toBe('KZT');
      });

      test('should parse Georgian Lari', () => {
        const result = parseSymbol('₾100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('GEL');
      });

      test('should parse Armenian Dram', () => {
        const result = parseSymbol('֏1000');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('AMD');
      });

      test('should parse Azerbaijani Manat', () => {
        const result = parseSymbol('₼50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('AZN');
      });

      // Southeast Asian currencies
      test('should parse Indonesian Rupiah', () => {
        const result = parseSymbol('Rp10000');
        expect(result.amount).toBe(10000);
        expect(result.currencyCode).toBe('IDR');
      });

      test('should parse Malaysian Ringgit', () => {
        const result = parseSymbol('RM100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('MYR');
      });

      test('should parse Mongolian Tugrik', () => {
        const result = parseSymbol('₮5000');
        expect(result.amount).toBe(5000);
        expect(result.currencyCode).toBe('MNT');
      });

      test('should parse Cambodian Riel', () => {
        const result = parseSymbol('៛4000');
        expect(result.amount).toBe(4000);
        expect(result.currencyCode).toBe('KHR');
      });

      test('should parse Lao Kip', () => {
        const result = parseSymbol('₭10000');
        expect(result.amount).toBe(10000);
        expect(result.currencyCode).toBe('LAK');
      });

      // Other currencies
      test('should parse Bangladeshi Taka', () => {
        const result = parseSymbol('৳500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('BDT');
      });

      test('should parse Fijian Dollar', () => {
        const result = parseSymbol('FJ$100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('FJD');
      });

      test('should parse Namibian Dollar', () => {
        const result = parseSymbol('N$50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('NAD');
      });
    });

    describe('Ambiguous symbols with defaultCurrency', () => {
      test('should use defaultCurrency for ambiguous $ symbol', () => {
        const result = parseSymbol('$100', 'CAD');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('CAD');
      });

      test('should use defaultCurrency for ¥ symbol (JPY vs CNY)', () => {
        const result = parseSymbol('¥1000', 'CNY');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('CNY');
      });

      test('should use defaultCurrency for kr symbol (SEK, NOK, DKK, ISK)', () => {
        const result = parseSymbol('kr 500', 'NOK');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('NOK');
      });

      test('should default to first currency when defaultCurrency not in list', () => {
        const result = parseSymbol('$100', 'EUR');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD'); // First in the $ list
      });

      test('should default to first currency when no defaultCurrency provided', () => {
        const result = parseSymbol('kr 500');
        expect(result.amount).toBe(500);
        expect(result.currencyCode).toBe('SEK'); // First in the kr list
      });
    });

    describe('Case insensitivity', () => {
      test('should handle lowercase ISO codes', () => {
        const result = parseSymbol('usd 100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
      });

      test('should handle mixed case ISO codes', () => {
        const result = parseSymbol('Eur 50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should handle lowercase text symbols', () => {
        const result = parseSymbol('chf 100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('CHF');
      });
    });

    describe('Error handling', () => {
      test('should throw error for empty input', () => {
        expect(() => parseSymbol('')).toThrow('Input must be a non-empty string');
      });

      test('should throw error for non-string input', () => {
        expect(() => parseSymbol(null as any)).toThrow('Input must be a non-empty string');
        expect(() => parseSymbol(undefined as any)).toThrow('Input must be a non-empty string');
        expect(() => parseSymbol(123 as any)).toThrow('Input must be a non-empty string');
      });

      test('should throw error for input without currency symbol', () => {
        expect(() => parseSymbol('100')).toThrow('No currency symbol pattern found');
      });

      test('should throw error for unknown symbol', () => {
        expect(() => parseSymbol('@100')).toThrow('No currency symbol pattern found');
      });

      test('should throw error for invalid number format', () => {
        expect(() => parseSymbol('$abc')).toThrow('No currency symbol pattern found');
      });

      test('should throw ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER', () => {
        const largeNumber = `$${Number.MAX_SAFE_INTEGER + 1}`;
        expect(() => parseSymbol(largeNumber)).toThrow(ValueOverflowError);
      });
    });
  });

  describe('matchSymbol', () => {
    test('should return parse result for valid input', () => {
      const result = matchSymbol('$100');
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(100);
      expect(result?.currencyCode).toBe('USD');
    });

    test('should return null for invalid input', () => {
      expect(matchSymbol('no currency here')).toBeNull();
      expect(matchSymbol('100')).toBeNull();
      expect(matchSymbol('@100')).toBeNull();
    });

    test('should return null for empty input', () => {
      expect(matchSymbol('')).toBeNull();
    });

    test('should handle defaultCurrency parameter', () => {
      const result = matchSymbol('$100', 'AUD');
      expect(result?.currencyCode).toBe('AUD');
    });
  });

  describe('CURRENCY_SYMBOL_MAP', () => {
    test('should contain all major currency symbols', () => {
      expect(CURRENCY_SYMBOL_MAP['$']).toContain('USD');
      expect(CURRENCY_SYMBOL_MAP['€']).toContain('EUR');
      expect(CURRENCY_SYMBOL_MAP['£']).toContain('GBP');
      expect(CURRENCY_SYMBOL_MAP['¥']).toContain('JPY');
      expect(CURRENCY_SYMBOL_MAP['₹']).toContain('INR');
    });

    test('should map symbols to valid ISO codes', () => {
      Object.values(CURRENCY_SYMBOL_MAP).forEach(codes => {
        codes.forEach(code => {
          expect(code).toMatch(/^[A-Z]{3}$/);
        });
      });
    });

    test('should have unique mappings for specific symbols', () => {
      expect(CURRENCY_SYMBOL_MAP['US$']).toEqual(['USD']);
      expect(CURRENCY_SYMBOL_MAP['A$']).toEqual(['AUD']);
      expect(CURRENCY_SYMBOL_MAP['C$']).toEqual(['CAD']);
    });
  });
});
