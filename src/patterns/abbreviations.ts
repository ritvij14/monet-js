/**
 * Abbreviations Pattern Parser
 * =============================
 * Handles monetary patterns with ISO 4217 currency abbreviations (e.g., 'USD 100', '50 EUR').
 * 
 * Pattern Examples:
 * - "USD 100"
 * - "EUR 50"
 * - "GBP 20.50"
 * - "100 CAD"
 * - "JPY 1000"
 * 
 * This parser recognizes ISO 4217 three-letter currency codes and maps them to their
 * respective currencies. It handles abbreviations both before and after the numeric value.
 */

import { ValueOverflowError } from '../errors';
import { getCurrencyByCode, getAllCurrencies } from '../currencyData';

/**
 * Result of parsing a currency abbreviation pattern.
 */
export interface AbbreviationParseResult {
  amount: number;
  currencyCode: string;
  abbreviation: string;
  raw: string;
}

/**
 * Builds a regex pattern that matches ISO 4217 currency codes.
 * Uses the currency data to get all valid codes.
 */
function buildAbbreviationRegex(): RegExp {
  const allCurrencies = getAllCurrencies();
  const codes = allCurrencies.map(c => c.code);
  
  // Create pattern that matches: code + number OR number + code
  // Supports numbers with separators and decimals
  const codePattern = codes.join('|');
  const numberPattern = '\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?';
  
  // Match either: code before number or number before code
  // With optional whitespace between them
  return new RegExp(
    `(?:(?<codeBefore>${codePattern})\\s+(?<amountAfterCode>${numberPattern}))|(?:(?<amountBeforeCode>${numberPattern})\\s+(?<codeAfter>${codePattern}))`,
    'i' // case-insensitive
  );
}

// Pre-compile the regex for performance
const ABBREVIATION_PATTERN_REGEX = buildAbbreviationRegex();

/**
 * Parses a string with a currency abbreviation and returns the amount and currency code.
 * 
 * @param input - The string containing a currency abbreviation and amount (e.g., 'USD 100', '50 EUR')
 * @returns Parse result with amount, currency code, abbreviation, and raw match
 * @throws {ValueOverflowError} If the number exceeds Number.MAX_SAFE_INTEGER
 * @throws {Error} If the input format is invalid or abbreviation is not recognized
 */
export function parseAbbreviation(input: string): AbbreviationParseResult {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const trimmed = input.trim();
  const match = ABBREVIATION_PATTERN_REGEX.exec(trimmed);

  if (!match || !match.groups) {
    throw new Error(`No currency abbreviation pattern found in: "${input}"`);
  }

  // Determine which pattern matched (code before or after)
  const abbreviation = (match.groups.codeBefore || match.groups.codeAfter || '').trim().toUpperCase();
  const amountStr = (match.groups.amountAfterCode || match.groups.amountBeforeCode || '').trim();

  if (!abbreviation || !amountStr) {
    throw new Error(`Invalid abbreviation pattern: "${input}"`);
  }

  // Parse the amount (remove commas)
  const normalizedAmount = amountStr.replace(/,/g, '');
  
  const numericValue = normalizedAmount.includes('.') 
    ? parseFloat(normalizedAmount) 
    : parseInt(normalizedAmount, 10);
  
  if (isNaN(numericValue)) {
    throw new Error(`Failed to parse amount: "${amountStr}"`);
  }

  // Check for overflow
  if (numericValue > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Amount ${numericValue} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }
  
  const amount = numericValue;

  // Validate that the currency code exists in our currency data
  const currencyInfo = getCurrencyByCode(abbreviation);
  if (!currencyInfo) {
    throw new Error(`Unknown currency code: "${abbreviation}"`);
  }

  return {
    amount,
    currencyCode: abbreviation,
    abbreviation,
    raw: match[0],
  };
}

/**
 * Attempts to match and parse a currency abbreviation pattern from a string.
 * Returns null if no valid pattern is found.
 * 
 * @param input - The string to search for a currency abbreviation pattern
 * @returns Parse result or null if not found
 */
export function matchAbbreviation(input: string): AbbreviationParseResult | null {
  try {
    return parseAbbreviation(input);
  } catch {
    return null;
  }
}
