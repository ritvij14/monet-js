import { ValueOverflowError } from "../../src/errors";
import {
  matchContextualPhrase,
  parseContextualPhrase,
} from "../../src/patterns/contextualPhrases";

describe("Contextual Phrases Parser", () => {
  describe("parseContextualPhrase", () => {
    test("parses simple article + worded number + currency name", () => {
      const res = parseContextualPhrase("a hundred dollars");
      expect(res.value).toBe(100);
      expect(res.currency).toBe("USD");
    });

    test("parses article + numeric + currency name", () => {
      const res = parseContextualPhrase("the fifty euros");
      expect(res.value).toBe(50);
      expect(res.currency).toBe("EUR");
    });

    test("parses worded number + ISO code", () => {
      const res = parseContextualPhrase("one thousand JPY");
      expect(res.value).toBe(1000);
      expect(res.currency).toBe("JPY");
    });

    test("parses article + numeric + ISO code", () => {
      const res = parseContextualPhrase("a 20 usd");
      expect(res.value).toBe(20);
      expect(res.currency).toBe("USD");
    });

    test("parses compound major+minor with cents", () => {
      const res = parseContextualPhrase("a dollar and 23 cents");
      expect(res.value).toBeCloseTo(1.23);
      expect(res.currency).toBe("USD");
    });

    test("parses compound major+minor with worded minor", () => {
      const res = parseContextualPhrase("five euros and fifty cents");
      expect(res.value).toBeCloseTo(5.5);
      expect(res.currency).toBe("EUR");
    });

    test("parses pounds and pence", () => {
      const res = parseContextualPhrase("10 pounds and 5 pence");
      expect(res.value).toBeCloseTo(10.05);
      expect(res.currency).toBe("GBP");
    });

    test("throws on unknown currency", () => {
      expect(() => parseContextualPhrase("a hundred foobars")).toThrow(
        /Unrecognized currency/i
      );
    });

    test("throws on invalid minor unit for currency", () => {
      expect(() => parseContextualPhrase("one yen and 5 cents")).toThrow(
        /Minor unit not supported/i
      );
    });

    test("throws ValueOverflowError on overflow", () => {
      expect(() => parseContextualPhrase("9007199254740993 dollars")).toThrow(
        ValueOverflowError
      );
    });
  });

  describe("matchContextualPhrase", () => {
    test("matches and parses contextual phrase within text", () => {
      const res = matchContextualPhrase("I paid a dollar and 23 cents today");
      expect(res?.value).toBeCloseTo(1.23);
      expect(res?.currency).toBe("USD");
    });

    test("returns null for unsupported minor unit", () => {
      expect(matchContextualPhrase("yen and 5 cents")).toBeNull();
    });

    test("returns null for missing currency", () => {
      expect(matchContextualPhrase("five and twenty")).toBeNull();
    });
  });
});
