import { describe, expect, test } from "@jest/globals";
import { RegexPipeline } from "../src/regexPipeline";

describe("RegexPipeline", () => {
  test("detects currency symbol and numeric amount", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("I paid $10 yesterday");

    expect(result.currency).toBe("$");
    expect(result.amount).toBe(10);
  });

  test("detects ISO currency code and amount", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("Total: 25 USD");

    expect(result.currency).toBe("USD");
    expect(result.amount).toBe(25);
  });
});
