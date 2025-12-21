/**
 * Numeric-Word Combos Pattern Parser
 * ==================================
 * Handles monetary patterns with numeric-word combinations (e.g., '10k', '5m', '2bn').
 *
 * Pattern Examples:
 * - "10k" -> 10,000
 * - "5m" -> 5,000,000
 * - "2b" -> 2,000,000,000
 * - "1.5k" -> 1,500
 * - "2.5m" -> 2,500,000
 *
 * This parser converts numeric values with magnitude suffixes into their full numeric equivalents.
 */

import { ValueOverflowError } from "../errors";

/**
 * Mapping of magnitude suffixes to their numeric multipliers
 */
const MAGNITUDE_MULTIPLIERS: Record<string, number> = {
  k: 1000,
  m: 1000000,
  b: 1000000000,
  bn: 1000000000,
};

/**
 * Result of parsing a numeric-word combo pattern.
 */
export interface NumericWordComboParseResult {
  value: number;
  raw: string;
}

/**
 * Normalizes a numeric-word combo string by:
 * - Converting to lowercase
 * - Removing extra whitespace
 *
 * @param input - The input string to normalize
 * @returns Normalized string
 */
function normalizeInput(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Parses a numeric-word combo string and returns the numeric value.
 *
 * Handles patterns like:
 * - "10k" -> 10,000
 * - "5m" -> 5,000,000
 * - "2b" -> 2,000,000,000
 * - "1.5k" -> 1,500
 * - "2.5m" -> 2,500,000
 *
 * @param input - The numeric-word combo string to parse
 * @returns The parsed numeric value
 * @throws {Error} If the input format is invalid
 * @throws {ValueOverflowError} If the number exceeds Number.MAX_SAFE_INTEGER
 */
export function parseNumericWordCombo(input: string): number {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalizeInput(input);

  // Match pattern: optional digits, optional decimal point with digits, then magnitude suffix
  const match = /^(\d+(?:\.\d+)?)(bn|[kmb])$/i.exec(normalized);

  if (!match) {
    throw new Error(`Invalid numeric-word combo format: "${input}"`);
  }

  const [, numericPart, suffixPart] = match;
  const numericValue = parseFloat(numericPart);
  const suffix = suffixPart.toLowerCase();

  if (!(suffix in MAGNITUDE_MULTIPLIERS)) {
    throw new Error(`Unrecognized magnitude suffix: "${suffix}"`);
  }

  const multiplier = MAGNITUDE_MULTIPLIERS[suffix];
  const result = numericValue * multiplier;

  // Check for overflow
  if (result > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${result} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  return result;
}

/**
 * Builds a regex pattern that matches numeric-word combos in text.
 */
function buildNumericWordComboRegex(): RegExp {
  // Match patterns like: 10k, 5m, 2b, 1.5k, 2.5m, 2bn
  const pattern = "(\\d+(?:\\.\\d+)?(?:bn|[kmb]))";
  return new RegExp(`\\b${pattern}\\b`, "gi");
}

// Pre-compile the regex for performance
const NUMERIC_WORD_COMBO_REGEX = buildNumericWordComboRegex();

/**
 * Attempts to match and parse a numeric-word combo from a string.
 * Returns null if no numeric-word combo is found.
 *
 * @param input - The string to search for a numeric-word combo
 * @returns Parse result with value and raw match, or null if not found
 */
export function matchNumericWordCombo(
  input: string
): NumericWordComboParseResult | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Reset the regex lastIndex to avoid state issues with global flag
  NUMERIC_WORD_COMBO_REGEX.lastIndex = 0;

  const match = NUMERIC_WORD_COMBO_REGEX.exec(input);
  if (!match) {
    return null;
  }

  try {
    const value = parseNumericWordCombo(match[1]);
    return {
      value,
      raw: match[1],
    };
  } catch {
    return null;
  }
}
