import { describe, expect, test } from "@jest/globals";
import { parseMoney } from "../src/parseMoney";

describe("parseMoney", () => {
  test("parses a basic symbol and amount", () => {
    const res = parseMoney("Paid $10");
    expect(res.currency).toBe("USD");
    expect(res.amount).toBe(10);
  });
});
