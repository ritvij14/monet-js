import { MoneyParseError, ValueOverflowError } from "../src/errors";

describe("Custom Error Classes", () => {
  it("MoneyParseError behaves correctly", () => {
    const err = new MoneyParseError("Bad input", "abc");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("MoneyParseError");
    expect(err.input).toBe("abc");
  });

  it("ValueOverflowError behaves correctly", () => {
    const err = new ValueOverflowError("Too large", 1e12);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ValueOverflowError");
    expect(err.value).toBe(1e12);
  });
});
