import { describe, expect, test } from "@jest/globals";
import { RegexPipeline } from "../src/regexPipeline";

describe("RegexPipeline", () => {
  test("detects currency symbol and numeric amount", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("I paid $10 yesterday");

    expect(result.currency).toBe("USD");
    expect(result.amount).toBe(10);
  });

  test("detects ISO currency code and amount", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("Total: 25 USD");

    expect(result.currency).toBe("USD");
    expect(result.amount).toBe(25);
  });

  test("detects additional currency symbols", () => {
    const pipeline = RegexPipeline.default();
    const euro = pipeline.run("Cost was €50");
    expect(euro.currency).toBe("EUR");
    expect(euro.amount).toBe(50);

    const pound = pipeline.run("Paid £30 last week");
    expect(pound.currency).toBe("GBP");
    expect(pound.amount).toBe(30);
  });

  test("detects lowercase iso code", () => {
    const pipeline = RegexPipeline.default();
    const res = pipeline.run("saved 100 gbp");
    expect(res.currency).toBe("GBP");
    expect(res.amount).toBe(100);
  });

  test("detects worded numbers", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("I owe you one hundred forty five GBP");

    expect(result.currency).toBe("GBP");
    expect(result.amount).toBe(145);
  });

  test("detects numeric shorthand suffix (k/m/b)", () => {
    const pipeline = RegexPipeline.default();
    const result = pipeline.run("He won 10k USD");

    expect(result.currency).toBe("USD");
    expect(result.amount).toBe(10000);
  });

  test("detects currency by full name", () => {
    const pipeline = RegexPipeline.default();

    const euro = pipeline.run("He spent 50 Euro on dinner");
    expect(euro.currency).toBe("EUR");
    expect(euro.amount).toBe(50);

    const yen = pipeline.run("Tickets cost 200 yen");
    expect(yen.currency).toBe("JPY");
    expect(yen.amount).toBe(200);

    const dollar = pipeline.run("He paid 100 dollars");
    expect(dollar.currency).toBe("USD");
    expect(dollar.amount).toBe(100);

    const pound = pipeline.run("He paid 100 pounds");
    expect(pound.currency).toBe("GBP");
    expect(pound.amount).toBe(100);

    const rupee = pipeline.run("He paid 100 rupees");
    expect(rupee.currency).toBe("INR");
    expect(rupee.amount).toBe(100);
  });
});
