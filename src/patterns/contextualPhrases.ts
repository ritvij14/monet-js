/**
 * Contextual Phrases Pattern Parser
 * =================================
 * Handles monetary phrases that include articles and currency names/ISO codes,
 * plus compound major+minor expressions (e.g., "a dollar and 23 cents").
 */

import { getAllCurrencies, getCurrencyByCode } from "../currencyData";
import { ValueOverflowError } from "../errors";
import { parseWordedNumber } from "./wordedNumbers";

interface ContextualParseResult {
  value: number;
  currency: string;
  raw: string;
}

const ARTICLES = new Set(["a", "an", "the"]);

// Build currency name/code lookup similar to regexPipeline
const STOPWORDS = new Set(["and", "the", "of"]);

const NAME_TO_CODE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const cur of getAllCurrencies()) {
    const nameLower = cur.currency.toLowerCase();
    map[nameLower] = cur.code;

    for (const word of nameLower.split(/\s+/)) {
      if (word.length > 2 && !STOPWORDS.has(word)) {
        map[word] = cur.code;
        if (!word.endsWith("s")) {
          map[`${word}s`] = cur.code;
        }
      }
    }
  }

  const overrides: Record<string, string> = {
    dollar: "USD",
    dollars: "USD",
    euro: "EUR",
    euros: "EUR",
    pound: "GBP",
    pounds: "GBP",
    yen: "JPY",
    rupee: "INR",
    rupees: "INR",
    peso: "MXN",
    pesos: "MXN",
  };
  Object.assign(map, overrides);
  return map;
})();

// Minor unit aliases (by token)
const MINOR_UNIT_ALIASES: Record<
  string,
  { currency: string | null; scale: number }
> = {
  cent: { currency: null, scale: 100 }, // allow any currency with 2 digits
  cents: { currency: null, scale: 100 },
  penny: { currency: "GBP", scale: 100 },
  pennies: { currency: "GBP", scale: 100 },
  pence: { currency: "GBP", scale: 100 },
};

function normalize(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

function parseAmountTokens(tokens: string[]): number {
  if (tokens.length === 0) {
    throw new Error("Invalid quantity");
  }

  const stripped = [...tokens];
  while (stripped.length > 0 && ARTICLES.has(stripped[0])) stripped.shift();

  if (stripped.length === 0) {
    return 1;
  }

  const candidate = stripped.join(" ");
  if (/^\d+(?:\.\d+)?$/.test(candidate)) {
    return parseFloat(candidate);
  }

  return parseWordedNumber(candidate);
}

function lookupCurrency(token: string): string | null {
  if (token.length === 3 && /^[a-z]{3}$/i.test(token)) {
    const byCode = getCurrencyByCode(token.toUpperCase());
    if (byCode) return byCode.code;
  }
  return NAME_TO_CODE[token] ?? null;
}

function minorScaleForCurrency(
  currency: string,
  minorToken: string
): number | null {
  const minor = MINOR_UNIT_ALIASES[minorToken];
  if (!minor) return null;
  if (minor.currency && minor.currency !== currency) return null;

  const currencyInfo = getCurrencyByCode(currency);
  const digits = (currencyInfo as any)?.digits ?? 2;
  if (digits === 0) return null;

  return 10 ** digits;
}

/**
 * Parses contextual phrase containing major (and optional minor) units.
 */
export function parseContextualPhrase(input: string): ContextualParseResult {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalize(input);
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length === 0) {
    throw new Error("Input must be a non-empty string");
  }

  // Find major currency token
  let currencyIndex = -1;
  let currencyCode: string | null = null;
  for (let i = 0; i < tokens.length; i++) {
    const code = lookupCurrency(tokens[i]);
    if (code) {
      currencyIndex = i;
      currencyCode = code;
      break;
    }
  }
  if (currencyIndex === -1 || !currencyCode) {
    throw new Error(`Unrecognized currency in: "${input}"`);
  }

  const majorAmountTokens = tokens.slice(0, currencyIndex);
  const majorAmount = parseAmountTokens(majorAmountTokens);

  // Check for optional minor part: "<major> <currency> and <minor> <minorUnit>"
  let value = majorAmount;
  let rawEndIndex = currencyIndex + 1;

  if (tokens[currencyIndex + 1] === "and") {
    const afterAnd = tokens.slice(currencyIndex + 2);
    const minorIndex = afterAnd.findIndex((t) => t in MINOR_UNIT_ALIASES);
    if (minorIndex === -1) {
      throw new Error(`Invalid minor unit in: "${input}"`);
    }
    const minorAmountTokens = afterAnd.slice(0, minorIndex);
    const minorToken = afterAnd[minorIndex];
    const minorAmount = parseAmountTokens(minorAmountTokens);

    const scale = minorScaleForCurrency(currencyCode, minorToken);
    if (!scale) {
      throw new Error(`Minor unit not supported for currency in: "${input}"`);
    }

    value = majorAmount + minorAmount / scale;
    rawEndIndex = currencyIndex + 2 + minorIndex + 1;
  }

  if (value > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${value} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  return {
    value,
    currency: currencyCode,
    raw: tokens.slice(0, rawEndIndex).join(" "),
  };
}

/**
 * Attempts to match and parse a contextual phrase from text.
 * Returns null if not found.
 */
export function matchContextualPhrase(
  input: string
): ContextualParseResult | null {
  if (!input || typeof input !== "string") return null;

  const normalized = normalize(input);
  const currencyPattern = (() => {
    const keys = Array.from(new Set(Object.keys(NAME_TO_CODE)));
    return `(?:${keys.join("|")}|[a-z]{3})`;
  })();
  const minorPattern = (() => {
    const keys = Array.from(new Set(Object.keys(MINOR_UNIT_ALIASES)));
    return `(?:${keys.join("|")})`;
  })();

  const pattern = new RegExp(
    `\\b((?:a|an|the)?\\s*(?:[a-z-]+|\\d+(?:\\.\\d+)?)\\s+${currencyPattern}(?:\\s+and\\s+(?:[a-z-]+|\\d+(?:\\.\\d+)?)\\s+${minorPattern})?)\\b`,
    "i"
  );

  const match = pattern.exec(normalized);
  if (!match) return null;

  try {
    return parseContextualPhrase(match[1]);
  } catch {
    return null;
  }
}

export type { ContextualParseResult };
