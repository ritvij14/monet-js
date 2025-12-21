import { describe, expect, test } from '@jest/globals';
import { parseNumberWithSeparators, matchNumberWithSeparators } from '../../src/patterns/numbersWithSeparators';
import { ValueOverflowError } from '../../src/errors';

describe('parseNumberWithSeparators', () => {
  describe('valid numbers with separators', () => {
    test('parses numbers with thousands separator', () => {
      expect(parseNumberWithSeparators('1,000')).toBe(1000);
      expect(parseNumberWithSeparators('10,000')).toBe(10000);
      expect(parseNumberWithSeparators('100,000')).toBe(100000);
    });

    test('parses numbers with multiple thousands separators', () => {
      expect(parseNumberWithSeparators('1,234,567')).toBe(1234567);
      expect(parseNumberWithSeparators('999,999,999')).toBe(999999999);
      expect(parseNumberWithSeparators('12,345,678,901')).toBe(12345678901);
    });

    test('parses decimal numbers without separators', () => {
      expect(parseNumberWithSeparators('1.23')).toBe(1.23);
      expect(parseNumberWithSeparators('0.99')).toBe(0.99);
      expect(parseNumberWithSeparators('123.456')).toBe(123.456);
    });

    test('parses numbers with separators and decimals', () => {
      expect(parseNumberWithSeparators('1,234.56')).toBe(1234.56);
      expect(parseNumberWithSeparators('1,234,567.89')).toBe(1234567.89);
      expect(parseNumberWithSeparators('999,999.99')).toBe(999999.99);
    });

    test('parses plain numbers without separators or decimals', () => {
      expect(parseNumberWithSeparators('123')).toBe(123);
      expect(parseNumberWithSeparators('999')).toBe(999);
      expect(parseNumberWithSeparators('1')).toBe(1);
    });

    test('parses numbers with trailing zeros after decimal', () => {
      expect(parseNumberWithSeparators('1,234.50')).toBe(1234.5);
      expect(parseNumberWithSeparators('100.00')).toBe(100);
    });

    test('trims whitespace', () => {
      expect(parseNumberWithSeparators('  1,234.56  ')).toBe(1234.56);
      expect(parseNumberWithSeparators('\t1,000\n')).toBe(1000);
    });
  });

  describe('invalid inputs', () => {
    test('throws on empty string', () => {
      expect(() => parseNumberWithSeparators('')).toThrow('Input must be a non-empty string');
    });

    test('throws on non-string input', () => {
      expect(() => parseNumberWithSeparators(null as any)).toThrow('Input must be a non-empty string');
      expect(() => parseNumberWithSeparators(undefined as any)).toThrow('Input must be a non-empty string');
      expect(() => parseNumberWithSeparators(123 as any)).toThrow('Input must be a non-empty string');
    });

    test('throws on improperly placed separators', () => {
      expect(() => parseNumberWithSeparators('1,23')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators('12,3456')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators(',123')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators('123,')).toThrow('Invalid number format');
    });

    test('throws on multiple decimal points', () => {
      expect(() => parseNumberWithSeparators('1.23.45')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators('1,234.56.78')).toThrow('Invalid number format');
    });

    test('throws on negative numbers', () => {
      expect(() => parseNumberWithSeparators('-1,234')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators('-123.45')).toThrow('Invalid number format');
    });

    test('throws on numbers with currency symbols', () => {
      expect(() => parseNumberWithSeparators('$1,234')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators('1,234€')).toThrow('Invalid number format');
    });

    test('throws on non-numeric strings', () => {
      expect(() => parseNumberWithSeparators('abc')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators('1,2a3')).toThrow('Invalid number format');
    });

    test('throws on numbers with spaces as separators', () => {
      expect(() => parseNumberWithSeparators('1 234')).toThrow('Invalid number format');
      expect(() => parseNumberWithSeparators('1 234.56')).toThrow('Invalid number format');
    });
  });

  describe('overflow handling', () => {
    test('throws ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER', () => {
      const tooLarge = '9,007,199,254,740,992'; // Number.MAX_SAFE_INTEGER + 1
      expect(() => parseNumberWithSeparators(tooLarge)).toThrow(ValueOverflowError);
      expect(() => parseNumberWithSeparators(tooLarge)).toThrow(/exceeds maximum safe integer/);
    });

    test('accepts numbers at MAX_SAFE_INTEGER', () => {
      const maxSafe = '9,007,199,254,740,991'; // Number.MAX_SAFE_INTEGER
      expect(parseNumberWithSeparators(maxSafe)).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});

describe('matchNumberWithSeparators', () => {
  test('extracts number with separators from string', () => {
    expect(matchNumberWithSeparators('I paid 1,000 dollars')).toBe(1000);
    expect(matchNumberWithSeparators('Total: 1,234.56')).toBe(1234.56);
    expect(matchNumberWithSeparators('The price is 999,999.99')).toBe(999999.99);
  });

  test('extracts decimal numbers', () => {
    expect(matchNumberWithSeparators('Price: 12.50')).toBe(12.5);
    expect(matchNumberWithSeparators('Total is 0.99')).toBe(0.99);
  });

  test('extracts first valid number when multiple exist', () => {
    expect(matchNumberWithSeparators('I paid 1,000 and got 500.50 back')).toBe(1000);
  });

  test('returns null when no valid number found', () => {
    expect(matchNumberWithSeparators('no numbers here')).toBeNull();
    expect(matchNumberWithSeparators('')).toBeNull();
  });

  test('handles word boundaries correctly', () => {
    expect(matchNumberWithSeparators('abc1,234def')).toBeNull(); // Not a word boundary
    expect(matchNumberWithSeparators('abc 1,234 def')).toBe(1234); // Word boundary
  });

  test('returns null for overflow numbers', () => {
    const tooLarge = '9,007,199,254,740,992';
    expect(matchNumberWithSeparators(`Value: ${tooLarge}`)).toBeNull();
  });

  test('returns null for improperly formatted numbers', () => {
    expect(matchNumberWithSeparators('Value: 1,23')).toBeNull();
    expect(matchNumberWithSeparators('Price: ,123')).toBeNull();
  });
});
