/**
 * Unit tests for Abbreviations Pattern Parser
 * ============================================
 * Tests the parsing of ISO 4217 currency abbreviations.
 */

import { parseAbbreviation, matchAbbreviation } from '../../src/patterns/abbreviations';
import { ValueOverflowError } from '../../src/errors';

describe('Abbreviations Pattern Parser', () => {
  describe('parseAbbreviation', () => {
    describe('Basic abbreviation parsing', () => {
      test('should parse USD with code before', () => {
        const result = parseAbbreviation('USD 100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
        expect(result.abbreviation).toBe('USD');
        expect(result.raw).toBe('USD 100');
      });

      test('should parse EUR with code before', () => {
        const result = parseAbbreviation('EUR 50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('EUR');
        expect(result.abbreviation).toBe('EUR');
      });

      test('should parse GBP with decimals', () => {
        const result = parseAbbreviation('GBP 20.50');
        expect(result.amount).toBe(20.50);
        expect(result.currencyCode).toBe('GBP');
        expect(result.abbreviation).toBe('GBP');
      });

      test('should parse code after number', () => {
        const result = parseAbbreviation('100 CAD');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('CAD');
        expect(result.abbreviation).toBe('CAD');
      });

      test('should parse JPY after number', () => {
        const result = parseAbbreviation('1000 JPY');
        expect(result.amount).toBe(1000);
        expect(result.currencyCode).toBe('JPY');
        expect(result.abbreviation).toBe('JPY');
      });
    });

    describe('Whitespace handling', () => {
      test('should handle multiple spaces between code and number', () => {
        const result = parseAbbreviation('USD  100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
      });

      test('should handle leading/trailing whitespace', () => {
        const result = parseAbbreviation('  EUR 50  ');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should handle tab characters', () => {
        const result = parseAbbreviation('GBP\t100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('GBP');
      });
    });

    describe('Number formats', () => {
      test('should parse integers', () => {
        const result = parseAbbreviation('USD 1000');
        expect(result.amount).toBe(1000);
      });

      test('should parse decimals', () => {
        const result = parseAbbreviation('EUR 99.99');
        expect(result.amount).toBe(99.99);
      });

      test('should parse numbers with thousands separators', () => {
        const result = parseAbbreviation('GBP 1,234.56');
        expect(result.amount).toBe(1234.56);
      });

      test('should parse large numbers with multiple separators', () => {
        const result = parseAbbreviation('USD 1,234,567.89');
        expect(result.amount).toBe(1234567.89);
      });

      test('should parse numbers with only decimal point', () => {
        const result = parseAbbreviation('CAD 0.99');
        expect(result.amount).toBe(0.99);
      });

      test('should parse whole numbers with trailing zeros in decimal', () => {
        const result = parseAbbreviation('AUD 100.00');
        expect(result.amount).toBe(100.00);
      });
    });

    describe('Global currency codes', () => {
      // Major currencies
      test('should parse USD', () => {
        const result = parseAbbreviation('USD 100');
        expect(result.currencyCode).toBe('USD');
      });

      test('should parse EUR', () => {
        const result = parseAbbreviation('EUR 50');
        expect(result.currencyCode).toBe('EUR');
      });

      test('should parse GBP', () => {
        const result = parseAbbreviation('GBP 75');
        expect(result.currencyCode).toBe('GBP');
      });

      test('should parse JPY', () => {
        const result = parseAbbreviation('JPY 10000');
        expect(result.currencyCode).toBe('JPY');
      });

      test('should parse CNY', () => {
        const result = parseAbbreviation('CNY 500');
        expect(result.currencyCode).toBe('CNY');
      });

      // Asian currencies
      test('should parse INR', () => {
        const result = parseAbbreviation('INR 5000');
        expect(result.currencyCode).toBe('INR');
      });

      test('should parse KRW', () => {
        const result = parseAbbreviation('KRW 100000');
        expect(result.currencyCode).toBe('KRW');
      });

      test('should parse SGD', () => {
        const result = parseAbbreviation('SGD 150');
        expect(result.currencyCode).toBe('SGD');
      });

      test('should parse HKD', () => {
        const result = parseAbbreviation('HKD 800');
        expect(result.currencyCode).toBe('HKD');
      });

      test('should parse THB', () => {
        const result = parseAbbreviation('THB 3500');
        expect(result.currencyCode).toBe('THB');
      });

      test('should parse MYR', () => {
        const result = parseAbbreviation('MYR 450');
        expect(result.currencyCode).toBe('MYR');
      });

      test('should parse IDR', () => {
        const result = parseAbbreviation('IDR 150000');
        expect(result.currencyCode).toBe('IDR');
      });

      test('should parse PHP', () => {
        const result = parseAbbreviation('PHP 5500');
        expect(result.currencyCode).toBe('PHP');
      });

      test('should parse VND', () => {
        const result = parseAbbreviation('VND 230000');
        expect(result.currencyCode).toBe('VND');
      });

      // Middle Eastern currencies
      test('should parse AED', () => {
        const result = parseAbbreviation('AED 370');
        expect(result.currencyCode).toBe('AED');
      });

      test('should parse SAR', () => {
        const result = parseAbbreviation('SAR 375');
        expect(result.currencyCode).toBe('SAR');
      });

      test('should parse ILS', () => {
        const result = parseAbbreviation('ILS 350');
        expect(result.currencyCode).toBe('ILS');
      });

      // European currencies
      test('should parse CHF', () => {
        const result = parseAbbreviation('CHF 100');
        expect(result.currencyCode).toBe('CHF');
      });

      test('should parse SEK', () => {
        const result = parseAbbreviation('SEK 1000');
        expect(result.currencyCode).toBe('SEK');
      });

      test('should parse NOK', () => {
        const result = parseAbbreviation('NOK 950');
        expect(result.currencyCode).toBe('NOK');
      });

      test('should parse DKK', () => {
        const result = parseAbbreviation('DKK 750');
        expect(result.currencyCode).toBe('DKK');
      });

      test('should parse PLN', () => {
        const result = parseAbbreviation('PLN 400');
        expect(result.currencyCode).toBe('PLN');
      });

      test('should parse CZK', () => {
        const result = parseAbbreviation('CZK 2500');
        expect(result.currencyCode).toBe('CZK');
      });

      test('should parse HUF', () => {
        const result = parseAbbreviation('HUF 35000');
        expect(result.currencyCode).toBe('HUF');
      });

      test('should parse RUB', () => {
        const result = parseAbbreviation('RUB 7500');
        expect(result.currencyCode).toBe('RUB');
      });

      test('should parse TRY', () => {
        const result = parseAbbreviation('TRY 1700');
        expect(result.currencyCode).toBe('TRY');
      });

      // Americas currencies
      test('should parse CAD', () => {
        const result = parseAbbreviation('CAD 135');
        expect(result.currencyCode).toBe('CAD');
      });

      test('should parse AUD', () => {
        const result = parseAbbreviation('AUD 150');
        expect(result.currencyCode).toBe('AUD');
      });

      test('should parse NZD', () => {
        const result = parseAbbreviation('NZD 160');
        expect(result.currencyCode).toBe('NZD');
      });

      test('should parse MXN', () => {
        const result = parseAbbreviation('MXN 2000');
        expect(result.currencyCode).toBe('MXN');
      });

      test('should parse BRL', () => {
        const result = parseAbbreviation('BRL 550');
        expect(result.currencyCode).toBe('BRL');
      });

      test('should parse ARS', () => {
        const result = parseAbbreviation('ARS 35000');
        expect(result.currencyCode).toBe('ARS');
      });

      test('should parse CLP', () => {
        const result = parseAbbreviation('CLP 800000');
        expect(result.currencyCode).toBe('CLP');
      });

      test('should parse COP', () => {
        const result = parseAbbreviation('COP 400000');
        expect(result.currencyCode).toBe('COP');
      });

      // African currencies
      test('should parse ZAR', () => {
        const result = parseAbbreviation('ZAR 1750');
        expect(result.currencyCode).toBe('ZAR');
      });

      test('should parse NGN', () => {
        const result = parseAbbreviation('NGN 41000');
        expect(result.currencyCode).toBe('NGN');
      });

      test('should parse EGP', () => {
        const result = parseAbbreviation('EGP 3100');
        expect(result.currencyCode).toBe('EGP');
      });

      test('should parse KES', () => {
        const result = parseAbbreviation('KES 13000');
        expect(result.currencyCode).toBe('KES');
      });
    });

    describe('Case insensitivity', () => {
      test('should handle lowercase codes', () => {
        const result = parseAbbreviation('usd 100');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('USD');
      });

      test('should handle mixed case codes', () => {
        const result = parseAbbreviation('Eur 50');
        expect(result.amount).toBe(50);
        expect(result.currencyCode).toBe('EUR');
      });

      test('should handle lowercase with code after', () => {
        const result = parseAbbreviation('100 gbp');
        expect(result.amount).toBe(100);
        expect(result.currencyCode).toBe('GBP');
      });
    });

    describe('Error handling', () => {
      test('should throw error for empty input', () => {
        expect(() => parseAbbreviation('')).toThrow('Input must be a non-empty string');
      });

      test('should throw error for non-string input', () => {
        expect(() => parseAbbreviation(null as any)).toThrow('Input must be a non-empty string');
        expect(() => parseAbbreviation(undefined as any)).toThrow('Input must be a non-empty string');
        expect(() => parseAbbreviation(123 as any)).toThrow('Input must be a non-empty string');
      });

      test('should throw error for input without currency code', () => {
        expect(() => parseAbbreviation('100')).toThrow('No currency abbreviation pattern found');
      });

      test('should throw error for invalid currency code', () => {
        expect(() => parseAbbreviation('ZZZ 100')).toThrow('No currency abbreviation pattern found');
      });

      test('should throw error for invalid number format', () => {
        expect(() => parseAbbreviation('USD abc')).toThrow('No currency abbreviation pattern found');
      });

      test('should throw error for code without space before number', () => {
        expect(() => parseAbbreviation('USD100')).toThrow('No currency abbreviation pattern found');
      });

      test('should throw error for number without space before code', () => {
        expect(() => parseAbbreviation('100USD')).toThrow('No currency abbreviation pattern found');
      });

      test('should throw ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER', () => {
        const largeNumber = `USD ${Number.MAX_SAFE_INTEGER + 1}`;
        expect(() => parseAbbreviation(largeNumber)).toThrow(ValueOverflowError);
      });

      test('should throw error for two-letter codes', () => {
        expect(() => parseAbbreviation('US 100')).toThrow('No currency abbreviation pattern found');
      });

      test('should throw error for four-letter codes', () => {
        expect(() => parseAbbreviation('USDD 100')).toThrow('No currency abbreviation pattern found');
      });
    });
  });

  describe('matchAbbreviation', () => {
    test('should return parse result for valid input', () => {
      const result = matchAbbreviation('USD 100');
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(100);
      expect(result?.currencyCode).toBe('USD');
    });

    test('should return parse result for code after number', () => {
      const result = matchAbbreviation('50 EUR');
      expect(result).not.toBeNull();
      expect(result?.amount).toBe(50);
      expect(result?.currencyCode).toBe('EUR');
    });

    test('should return null for invalid input', () => {
      expect(matchAbbreviation('no currency here')).toBeNull();
      expect(matchAbbreviation('100')).toBeNull();
      expect(matchAbbreviation('ZZZ 100')).toBeNull();
    });

    test('should return null for empty input', () => {
      expect(matchAbbreviation('')).toBeNull();
    });

    test('should return null for invalid format', () => {
      expect(matchAbbreviation('USD100')).toBeNull();
      expect(matchAbbreviation('100USD')).toBeNull();
    });

    test('should handle case insensitivity', () => {
      const result = matchAbbreviation('gbp 100');
      expect(result?.currencyCode).toBe('GBP');
    });
  });
});
