/**
 * Numbers with Separators Pattern Parser
 * ========================================
 * Handles monetary patterns with thousands separators and decimal points (e.g., '1,234.56').
 * 
 * Pattern Examples:
 * - "1,000"
 * - "1.23"
 * - "1,234.56"
 * - "1,234,567.89"
 * - "999,999,999.99"
 * 
 * This parser handles numbers with comma separators for thousands and period for decimal point.
 * It validates proper separator placement and converts to JavaScript numbers.
 */

import { ValueOverflowError } from '../errors';

/**
 * Regex pattern for numbers with separators.
 * Matches:
 * - Optional thousands separators (comma)
 * - Optional decimal point with digits
 * - Validates proper separator placement (every 3 digits)
 */
const NUMBER_WITH_SEPARATORS_REGEX = /^(\d{1,3}(,\d{3})*(\.\d+)?|\d+\.\d+|\d+)$/;

/**
 * Parses a number string with separators and returns the numeric value.
 * 
 * @param input - The number string with separators to parse (e.g., '1,234.56')
 * @returns The parsed numeric value
 * @throws {ValueOverflowError} If the number exceeds Number.MAX_SAFE_INTEGER
 * @throws {Error} If the input is not a valid number with separators
 */
export function parseNumberWithSeparators(input: string): number {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Validate format
  if (!NUMBER_WITH_SEPARATORS_REGEX.test(trimmed)) {
    throw new Error(`Invalid number format: "${input}"`);
  }

  // Remove commas to get the actual number
  const normalized = trimmed.replace(/,/g, '');

  // Parse to number
  const value = parseFloat(normalized);

  // Check for NaN
  if (isNaN(value)) {
    throw new Error(`Failed to parse number: "${input}"`);
  }

  // Check for overflow
  if (value > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${value} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  return value;
}

/**
 * Attempts to match and parse a number with separators from a string.
 * Returns null if no valid number is found.
 * 
 * @param input - The string to search for a number with separators
 * @returns The parsed number or null if not found
 */
export function matchNumberWithSeparators(input: string): number | null {
  // Pattern to find numbers with separators or decimals in text
  // Matches: numbers with commas, or numbers with decimal points
  const match = /\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+)\b/.exec(input);
  if (!match) {
    return null;
  }

  try {
    return parseNumberWithSeparators(match[1]);
  } catch {
    return null;
  }
}
