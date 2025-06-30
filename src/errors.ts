export class MoneyParseError extends Error {
  /** Original text that failed to parse (optional). */
  constructor(message: string, public readonly input?: string) {
    super(message);
    this.name = "MoneyParseError";
    Object.setPrototypeOf(this, MoneyParseError.prototype);
  }
}

export class ValueOverflowError extends Error {
  /** Numeric value that exceeded the allowed range (optional). */
  constructor(message: string, public readonly value?: number) {
    super(message);
    this.name = "ValueOverflowError";
    Object.setPrototypeOf(this, ValueOverflowError.prototype);
  }
}
