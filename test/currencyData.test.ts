import { describe, expect, test } from "@jest/globals";
import { getCurrencyByCode, getCurrencyByNumber } from "../src/currencyData";

describe("currencyData module", () => {
  test("getCurrencyByCode returns USD info", () => {
    const usd = getCurrencyByCode("USD");
    expect(usd).not.toBeNull();
    expect(usd?.code).toBe("USD");
    expect(usd?.currency.toLowerCase()).toContain("dollar");
  });

  test("getCurrencyByNumber returns USD info", () => {
    const usd = getCurrencyByNumber("840");
    expect(usd).not.toBeNull();
    expect(usd?.code).toBe("USD");
  });
}); 