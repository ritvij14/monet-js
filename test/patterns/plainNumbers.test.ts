import { describe, expect, test } from '@jest/globals';
import { parsePlainNumber, matchPlainNumber } from '../../src/patterns/plainNumbers';
import { ValueOverflowError } from '../../src/errors';

describe('parsePlainNumber', () => {
  describe('valid plain numbers', () => {
    test('parses single digit', () => {
      expect(parsePlainNumber('1')).toBe(1);
      expect(parsePlainNumber('5')).toBe(5);
      expect(parsePlainNumber('9')).toBe(9);
    });

    test('parses multi-digit numbers', () => {
      expect(parsePlainNumber('123')).toBe(123);
      expect(parsePlainNumber('999999')).toBe(999999);
      expect(parsePlainNumber('42')).toBe(42);
    });

    test('parses large numbers', () => {
      expect(parsePlainNumber('1000000')).toBe(1000000);
      expect(parsePlainNumber('123456789')).toBe(123456789);
    });

    test('handles leading zeros', () => {
      expect(parsePlainNumber('0123')).toBe(123);
      expect(parsePlainNumber('00001')).toBe(1);
    });

    test('handles zero', () => {
      expect(parsePlainNumber('0')).toBe(0);
    });

    test('trims whitespace', () => {
      expect(parsePlainNumber('  123  ')).toBe(123);
      expect(parsePlainNumber('\t456\n')).toBe(456);
    });
  });

  describe('invalid inputs', () => {
    test('throws on empty string', () => {
      expect(() => parsePlainNumber('')).toThrow('Input must be a non-empty string');
    });

    test('throws on non-string input', () => {
      expect(() => parsePlainNumber(null as any)).toThrow('Input must be a non-empty string');
      expect(() => parsePlainNumber(undefined as any)).toThrow('Input must be a non-empty string');
      expect(() => parsePlainNumber(123 as any)).toThrow('Input must be a non-empty string');
    });

    test('throws on decimal numbers', () => {
      expect(() => parsePlainNumber('123.45')).toThrow('Invalid plain number format');
    });

    test('throws on numbers with separators', () => {
      expect(() => parsePlainNumber('1,234')).toThrow('Invalid plain number format');
      expect(() => parsePlainNumber('1 234')).toThrow('Invalid plain number format');
    });

    test('throws on negative numbers', () => {
      expect(() => parsePlainNumber('-123')).toThrow('Invalid plain number format');
    });

    test('throws on numbers with currency symbols', () => {
      expect(() => parsePlainNumber('$123')).toThrow('Invalid plain number format');
      expect(() => parsePlainNumber('123€')).toThrow('Invalid plain number format');
    });

    test('throws on non-numeric strings', () => {
      expect(() => parsePlainNumber('abc')).toThrow('Invalid plain number format');
      expect(() => parsePlainNumber('12a3')).toThrow('Invalid plain number format');
    });
  });

  describe('overflow handling', () => {
    test('throws ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER', () => {
      const tooLarge = (Number.MAX_SAFE_INTEGER + 1).toString();
      expect(() => parsePlainNumber(tooLarge)).toThrow(ValueOverflowError);
      expect(() => parsePlainNumber(tooLarge)).toThrow(/exceeds maximum safe integer/);
    });

    test('accepts numbers at MAX_SAFE_INTEGER', () => {
      const maxSafe = Number.MAX_SAFE_INTEGER.toString();
      expect(parsePlainNumber(maxSafe)).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});

describe('matchPlainNumber', () => {
  test('extracts plain number from string', () => {
    expect(matchPlainNumber('I paid 100 dollars')).toBe(100);
    expect(matchPlainNumber('Total: 42')).toBe(42);
    expect(matchPlainNumber('The answer is 1')).toBe(1);
  });

  test('extracts first plain number when multiple exist', () => {
    expect(matchPlainNumber('I paid 100 and got 50 back')).toBe(100);
  });

  test('returns null when no plain number found', () => {
    expect(matchPlainNumber('no numbers here')).toBeNull();
    expect(matchPlainNumber('')).toBeNull();
  });

  test('extracts integer part from decimal numbers', () => {
    // Note: matchPlainNumber extracts the integer part before the decimal
    expect(matchPlainNumber('$12.50')).toBe(12);
    expect(matchPlainNumber('Price: 99.99')).toBe(99);
  });

  test('handles word boundaries correctly', () => {
    expect(matchPlainNumber('abc123def')).toBeNull(); // Not a word boundary
    expect(matchPlainNumber('abc 123 def')).toBe(123); // Word boundary
  });

  test('returns null for overflow numbers', () => {
    const tooLarge = (Number.MAX_SAFE_INTEGER + 1).toString();
    expect(matchPlainNumber(`Value: ${tooLarge}`)).toBeNull();
  });
});
