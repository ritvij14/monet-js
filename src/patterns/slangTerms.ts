/**
 * Slang Terms Pattern Parser
 * ===========================
 * Handles monetary slang terms (e.g., 'buck', 'quid', 'fiver', 'tenner').
 * Maps slang terms to currency codes and unit values, supporting optional numeric/worded quantities.
 */

import { ValueOverflowError } from "../errors";
import { parseWordedNumber } from "./wordedNumbers";

interface SlangUnit {
  currency: string;
  unit: number;
}

const SLANG_MAP: Record<string, SlangUnit> = {
  buck: { currency: "USD", unit: 1 },
  bucks: { currency: "USD", unit: 1 },
  quid: { currency: "GBP", unit: 1 },
  quids: { currency: "GBP", unit: 1 },
  fiver: { currency: "GBP", unit: 5 },
  fivers: { currency: "GBP", unit: 5 },
  tenner: { currency: "GBP", unit: 10 },
  tenners: { currency: "GBP", unit: 10 },
};

export interface SlangParseResult {
  value: number;
  currency: string;
  raw: string;
}

function normalizeInput(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

function parseQuantity(tokens: string[]): number | null {
  if (tokens.length === 0) return 1;
  const candidate = tokens.join(" ").trim();
  if (!candidate) return 1;

  // Article implies 1
  if (candidate === "a" || candidate === "an") {
    return 1;
  }

  // Numeric quantity
  if (/^\d+(?:\.\d+)?$/.test(candidate)) {
    return parseFloat(candidate);
  }

  // Worded number quantity
  try {
    return parseWordedNumber(candidate);
  } catch {
    return null;
  }
}

/**
 * Parses a slang monetary expression and returns amount and currency.
 * Examples:
 * - "buck" -> 1 USD
 * - "two bucks" -> 2 USD
 * - "5 quid" -> 5 GBP
 * - "fiver" -> 5 GBP
 * - "three fivers" -> 15 GBP
 */
export function parseSlangTerm(input: string): SlangParseResult {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalizeInput(input);
  const tokens = normalized.split(" ").filter((t) => t.length > 0);

  const slangIndex = tokens.findIndex((t) => t in SLANG_MAP);
  if (slangIndex === -1) {
    throw new Error(`Unrecognized slang term in: "${input}"`);
  }

  const slangToken = tokens[slangIndex];
  const { currency, unit } = SLANG_MAP[slangToken];

  // Consider up to 3 tokens immediately before slang token as quantity
  const quantityTokens = tokens.slice(Math.max(0, slangIndex - 3), slangIndex);
  const quantity = parseQuantity(quantityTokens);

  if (quantity === null || Number.isNaN(quantity)) {
    throw new Error(`Invalid quantity for slang term: "${input}"`);
  }

  const value = quantity * unit;

  if (value > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${value} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  return {
    value,
    currency,
    raw: tokens.slice(Math.max(0, slangIndex - 3), slangIndex + 1).join(" "),
  };
}

function buildSlangRegex(): RegExp {
  const slangTokens = Object.keys(SLANG_MAP).join("|");

  // Quantity tokens: numeric or limited worded numbers / articles
  const quantityTokens = [
    "\\d+(?:\\.\\d+)?",
    "a",
    "an",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
    "hundred",
    "thousand",
  ].join("|");

  // Up to 3 quantity tokens immediately before the slang term
  const pattern = `(?:(?:${quantityTokens})\\s+){0,3}(?:${slangTokens})`;
  return new RegExp(`\\b(${pattern})\\b`, "gi");
}

const SLANG_REGEX = buildSlangRegex();

/**
 * Attempts to match and parse a slang monetary expression from text.
 * Returns null if not found.
 */
export function matchSlangTerm(input: string): SlangParseResult | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  SLANG_REGEX.lastIndex = 0;
  const match = SLANG_REGEX.exec(input);
  if (!match) {
    return null;
  }

  try {
    return parseSlangTerm(match[1]);
  } catch {
    return null;
  }
}
