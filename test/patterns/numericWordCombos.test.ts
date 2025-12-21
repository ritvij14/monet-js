/**
 * Unit tests for Numeric-Word Combos Pattern Parser
 * ==================================================
 * Tests the parsing of numeric-word combos (e.g., '10k', '5m', '2bn').
 */

import { ValueOverflowError } from "../../src/errors";
import {
  matchNumericWordCombo,
  parseNumericWordCombo,
} from "../../src/patterns/numericWordCombos";

describe("Numeric-Word Combos Pattern Parser", () => {
  describe("parseNumericWordCombo", () => {
    describe("Thousands (k)", () => {
      test('should parse "10k"', () => {
        expect(parseNumericWordCombo("10k")).toBe(10000);
      });

      test('should parse "5k"', () => {
        expect(parseNumericWordCombo("5k")).toBe(5000);
      });

      test('should parse "100k"', () => {
        expect(parseNumericWordCombo("100k")).toBe(100000);
      });

      test('should parse "999k"', () => {
        expect(parseNumericWordCombo("999k")).toBe(999000);
      });
    });

    describe("Millions (m)", () => {
      test('should parse "5m"', () => {
        expect(parseNumericWordCombo("5m")).toBe(5000000);
      });

      test('should parse "10m"', () => {
        expect(parseNumericWordCombo("10m")).toBe(10000000);
      });

      test('should parse "100m"', () => {
        expect(parseNumericWordCombo("100m")).toBe(100000000);
      });

      test('should parse "999m"', () => {
        expect(parseNumericWordCombo("999m")).toBe(999000000);
      });
    });

    describe("Billions (b and bn)", () => {
      test('should parse "2b"', () => {
        expect(parseNumericWordCombo("2b")).toBe(2000000000);
      });

      test('should parse "5b"', () => {
        expect(parseNumericWordCombo("5b")).toBe(5000000000);
      });

      test('should parse "2bn"', () => {
        expect(parseNumericWordCombo("2bn")).toBe(2000000000);
      });

      test('should parse "5bn"', () => {
        expect(parseNumericWordCombo("5bn")).toBe(5000000000);
      });
    });

    describe("Decimal values", () => {
      test('should parse "1.5k"', () => {
        expect(parseNumericWordCombo("1.5k")).toBe(1500);
      });

      test('should parse "2.5m"', () => {
        expect(parseNumericWordCombo("2.5m")).toBe(2500000);
      });

      test('should parse "0.5k"', () => {
        expect(parseNumericWordCombo("0.5k")).toBe(500);
      });

      test('should parse "3.75m"', () => {
        expect(parseNumericWordCombo("3.75m")).toBe(3750000);
      });

      test('should parse "1.25b"', () => {
        expect(parseNumericWordCombo("1.25b")).toBe(1250000000);
      });
    });

    describe("Case insensitivity", () => {
      test("should handle uppercase K", () => {
        expect(parseNumericWordCombo("10K")).toBe(10000);
      });

      test("should handle uppercase M", () => {
        expect(parseNumericWordCombo("5M")).toBe(5000000);
      });

      test("should handle uppercase B", () => {
        expect(parseNumericWordCombo("2B")).toBe(2000000000);
      });

      test("should handle uppercase BN", () => {
        expect(parseNumericWordCombo("2BN")).toBe(2000000000);
      });

      test("should handle mixed case", () => {
        expect(parseNumericWordCombo("10K")).toBe(10000);
        expect(parseNumericWordCombo("5M")).toBe(5000000);
        expect(parseNumericWordCombo("2Bn")).toBe(2000000000);
      });
    });

    describe("Whitespace handling", () => {
      test("should handle leading/trailing whitespace", () => {
        expect(parseNumericWordCombo("  10k  ")).toBe(10000);
        expect(parseNumericWordCombo("  5m  ")).toBe(5000000);
      });

      test("should handle tabs", () => {
        expect(parseNumericWordCombo("\t10k\t")).toBe(10000);
      });
    });

    describe("Error handling", () => {
      test("should throw error for empty input", () => {
        expect(() => parseNumericWordCombo("")).toThrow(
          "Input must be a non-empty string"
        );
      });

      test("should throw error for non-string input", () => {
        expect(() => parseNumericWordCombo(null as any)).toThrow(
          "Input must be a non-empty string"
        );
        expect(() => parseNumericWordCombo(undefined as any)).toThrow(
          "Input must be a non-empty string"
        );
      });

      test("should throw error for missing numeric part", () => {
        expect(() => parseNumericWordCombo("k")).toThrow(
          "Invalid numeric-word combo format"
        );
        expect(() => parseNumericWordCombo("m")).toThrow(
          "Invalid numeric-word combo format"
        );
      });

      test("should throw error for missing suffix", () => {
        expect(() => parseNumericWordCombo("10")).toThrow(
          "Invalid numeric-word combo format"
        );
        expect(() => parseNumericWordCombo("5.5")).toThrow(
          "Invalid numeric-word combo format"
        );
      });

      test("should throw error for unrecognized suffix", () => {
        expect(() => parseNumericWordCombo("10x")).toThrow(
          "Invalid numeric-word combo format"
        );
        expect(() => parseNumericWordCombo("5t")).toThrow(
          "Invalid numeric-word combo format"
        );
      });

      test("should throw error for invalid numeric format", () => {
        expect(() => parseNumericWordCombo("10.5.5k")).toThrow(
          "Invalid numeric-word combo format"
        );
        expect(() => parseNumericWordCombo("abc k")).toThrow(
          "Invalid numeric-word combo format"
        );
      });

      test("should throw ValueOverflowError for numbers exceeding MAX_SAFE_INTEGER", () => {
        // Number.MAX_SAFE_INTEGER is 9,007,199,254,740,991
        // 9,007,199,254,740,992b exceeds MAX_SAFE_INTEGER
        expect(() => parseNumericWordCombo("9007199254740992b")).toThrow(
          ValueOverflowError
        );
      });
    });

    describe("Edge cases", () => {
      test("should handle very large numbers within safe range", () => {
        // 9,000b = 9,000,000,000,000 (within safe range)
        expect(parseNumericWordCombo("9000b")).toBe(9000000000000);
      });

      test("should handle very small decimal multipliers", () => {
        expect(parseNumericWordCombo("0.001k")).toBe(1);
        expect(parseNumericWordCombo("0.1m")).toBe(100000);
      });

      test("should handle zero", () => {
        expect(parseNumericWordCombo("0k")).toBe(0);
        expect(parseNumericWordCombo("0m")).toBe(0);
        expect(parseNumericWordCombo("0b")).toBe(0);
      });
    });
  });

  describe("matchNumericWordCombo", () => {
    test('should match and parse "10k"', () => {
      const result = matchNumericWordCombo("10k");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(10000);
      expect(result?.raw).toBe("10k");
    });

    test('should match and parse "5m"', () => {
      const result = matchNumericWordCombo("5m");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(5000000);
    });

    test('should match and parse "2b"', () => {
      const result = matchNumericWordCombo("2b");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(2000000000);
    });

    test('should match and parse "2bn"', () => {
      const result = matchNumericWordCombo("2bn");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(2000000000);
    });

    test('should match and parse "1.5k"', () => {
      const result = matchNumericWordCombo("1.5k");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(1500);
    });

    test("should match numeric combo in a sentence", () => {
      const result = matchNumericWordCombo("I paid 10k for it");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(10000);
    });

    test("should match numeric combo with surrounding text", () => {
      const result = matchNumericWordCombo("The budget is 5m dollars");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(5000000);
    });

    test("should return null for invalid input", () => {
      expect(matchNumericWordCombo("no numbers here")).toBeNull();
      expect(matchNumericWordCombo("123")).toBeNull();
      expect(matchNumericWordCombo("banana")).toBeNull();
    });

    test("should return null for empty input", () => {
      expect(matchNumericWordCombo("")).toBeNull();
    });

    test("should return null for non-string input", () => {
      expect(matchNumericWordCombo(null as any)).toBeNull();
      expect(matchNumericWordCombo(undefined as any)).toBeNull();
    });

    test("should handle case insensitivity", () => {
      const result = matchNumericWordCombo("10K");
      expect(result?.value).toBe(10000);
    });

    test("should match first occurrence in text with multiple combos", () => {
      const result = matchNumericWordCombo("10k and 5m");
      expect(result).not.toBeNull();
      expect(result?.value).toBe(10000);
      expect(result?.raw).toBe("10k");
    });
  });
});
