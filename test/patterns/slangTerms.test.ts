/**
 * Unit tests for Slang Terms Pattern Parser
 * =========================================
 * Tests parsing of monetary slang terms (e.g., 'buck', 'quid', 'fiver', 'tenner').
 */

import { ValueOverflowError } from "../../src/errors";
import { matchSlangTerm, parseSlangTerm } from "../../src/patterns/slangTerms";

describe("Slang Terms Pattern Parser", () => {
  describe("parseSlangTerm", () => {
    describe("Singular slang", () => {
      test("should parse 'buck'", () => {
        const res = parseSlangTerm("buck");
        expect(res.value).toBe(1);
        expect(res.currency).toBe("USD");
      });

      test("should parse 'quid'", () => {
        const res = parseSlangTerm("quid");
        expect(res.value).toBe(1);
        expect(res.currency).toBe("GBP");
      });

      test("should parse 'fiver'", () => {
        const res = parseSlangTerm("fiver");
        expect(res.value).toBe(5);
        expect(res.currency).toBe("GBP");
      });

      test("should parse 'tenner'", () => {
        const res = parseSlangTerm("tenner");
        expect(res.value).toBe(10);
        expect(res.currency).toBe("GBP");
      });
    });

    describe("Plural slang with numeric quantity", () => {
      test("should parse '5 bucks'", () => {
        const res = parseSlangTerm("5 bucks");
        expect(res.value).toBe(5);
        expect(res.currency).toBe("USD");
      });

      test("should parse '12 bucks'", () => {
        const res = parseSlangTerm("12 bucks");
        expect(res.value).toBe(12);
        expect(res.currency).toBe("USD");
      });

      test("should parse '3 quid'", () => {
        const res = parseSlangTerm("3 quid");
        expect(res.value).toBe(3);
        expect(res.currency).toBe("GBP");
      });

      test("should parse '4 quids'", () => {
        const res = parseSlangTerm("4 quids");
        expect(res.value).toBe(4);
        expect(res.currency).toBe("GBP");
      });
    });

    describe("Worded quantities", () => {
      test("should parse 'two bucks'", () => {
        const res = parseSlangTerm("two bucks");
        expect(res.value).toBe(2);
        expect(res.currency).toBe("USD");
      });

      test("should parse 'three fivers'", () => {
        const res = parseSlangTerm("three fivers");
        expect(res.value).toBe(15);
        expect(res.currency).toBe("GBP");
      });

      test("should parse 'a buck'", () => {
        const res = parseSlangTerm("a buck");
        expect(res.value).toBe(1);
        expect(res.currency).toBe("USD");
      });
    });

    describe("Case insensitivity and whitespace", () => {
      test("should handle uppercase", () => {
        const res = parseSlangTerm("BUCKS");
        expect(res.value).toBe(1);
      });

      test("should handle mixed case with spaces", () => {
        const res = parseSlangTerm("  Two   Bucks  ");
        expect(res.value).toBe(2);
      });
    });

    describe("Error handling", () => {
      test("should throw for unrecognized slang", () => {
        expect(() => parseSlangTerm("banana")).toThrow(
          "Unrecognized slang term"
        );
      });

      test("should throw for invalid quantity", () => {
        expect(() => parseSlangTerm("abc bucks")).toThrow("Invalid quantity");
      });

      test("should throw for empty input", () => {
        expect(() => parseSlangTerm("" as any)).toThrow(
          "Input must be a non-empty string"
        );
      });

      test("should throw for non-string input", () => {
        expect(() => parseSlangTerm(null as any)).toThrow(
          "Input must be a non-empty string"
        );
      });

      test("should throw ValueOverflowError when exceeding MAX_SAFE_INTEGER", () => {
        // 10^16 bucks will exceed MAX_SAFE_INTEGER
        expect(() => parseSlangTerm("10000000000000000 bucks")).toThrow(
          ValueOverflowError
        );
      });
    });
  });

  describe("matchSlangTerm", () => {
    test("should match and parse 'buck'", () => {
      const res = matchSlangTerm("buck");
      expect(res).not.toBeNull();
      expect(res?.value).toBe(1);
      expect(res?.currency).toBe("USD");
    });

    test("should match and parse '5 bucks'", () => {
      const res = matchSlangTerm("I paid 5 bucks yesterday");
      expect(res).not.toBeNull();
      expect(res?.value).toBe(5);
      expect(res?.currency).toBe("USD");
    });

    test("should match and parse 'three fivers'", () => {
      const res = matchSlangTerm("three fivers on the table");
      expect(res).not.toBeNull();
      expect(res?.value).toBe(15);
      expect(res?.currency).toBe("GBP");
    });

    test("should return null for invalid input", () => {
      expect(matchSlangTerm("no slang here")).toBeNull();
      expect(matchSlangTerm("123")).toBeNull();
    });

    test("should handle case insensitivity", () => {
      const res = matchSlangTerm("TENNER");
      expect(res?.value).toBe(10);
      expect(res?.currency).toBe("GBP");
    });
  });
});
