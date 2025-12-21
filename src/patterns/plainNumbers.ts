/**
 * Plain Numbers Pattern Parser
 * =============================
 * Handles the simplest monetary pattern: plain numeric strings (e.g., '123', '1', '999999').
 * 
 * Pattern Examples:
 * - "123"
 * - "1"
 * - "999999"
 * - "42"
 * 
 * This parser converts plain numeric strings to JavaScript numbers, handling edge cases
 * like leading zeros and very large numbers that might exceed Number.MAX_SAFE_INTEGER.
 */

import { ValueOverflowError } from '../errors';

/**
 * Parses a plain numeric string and returns the numeric value.
 * 
 * @param input - The plain numeric string to parse (e.g., '123')
 * @returns The parsed numeric value
 * @throws {ValueOverflowError} If the number exceeds Number.MAX_SAFE_INTEGER
 * @throws {Error} If the input is not a valid plain number
 */
export function parsePlainNumber(input: string): number {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Validate that it's a plain number (digits only, no decimals, no separators)
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid plain number format: "${input}"`);
  }

  // Parse to number
  const value = parseInt(trimmed, 10);

  // Check for NaN (shouldn't happen with our regex, but defensive)
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
 * Attempts to match and parse a plain number from a string.
 * Returns null if no plain number is found.
 * 
 * @param input - The string to search for a plain number
 * @returns The parsed number or null if not found
 */
export function matchPlainNumber(input: string): number | null {
  const match = /\b(\d+)\b/.exec(input);
  if (!match) {
    return null;
  }

  try {
    return parsePlainNumber(match[1]);
  } catch {
    return null;
  }
}
