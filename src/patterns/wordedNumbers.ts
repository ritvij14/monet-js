/**
 * Worded Numbers Pattern Parser
 * ==============================
 * Handles monetary patterns with worded numbers (e.g., 'one hundred dollars', 'twenty-three').
 *
 * Pattern Examples:
 * - "one"
 * - "twenty"
 * - "one hundred"
 * - "two thousand"
 * - "one million"
 * - "twenty-three"
 * - "one hundred fifty"
 * - "two thousand five hundred"
 *
 * This parser converts English worded numbers into their numeric equivalents.
 * It handles basic numbers (0-19), tens (20-90), and scale words (hundred, thousand, million, billion).
 */

import { ValueOverflowError } from "../errors";

/**
 * Mapping of basic number words to their numeric values (0-19)
 */
const BASIC_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

/**
 * Mapping of tens words to their numeric values (20-90)
 */
const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/**
 * Mapping of scale words to their numeric multipliers
 */
const SCALES: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
  million: 1000000,
  billion: 1000000000,
};

/**
 * Mapping of fractional words to their numeric values
 */
const FRACTIONS: Record<string, number> = {
  half: 0.5,
  halves: 0.5,
  quarter: 0.25,
  quarters: 0.25,
  third: 1 / 3,
  thirds: 1 / 3,
};

/**
 * Mapping of multiplier words for fractions (e.g., "two thirds", "three quarters")
 */
const FRACTION_MULTIPLIERS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

/**
 * Result of parsing a worded number pattern.
 */
export interface WordedNumberParseResult {
  value: number;
  raw: string;
}

/**
 * Normalizes a worded number string by:
 * - Converting to lowercase
 * - Removing extra whitespace
 * - Handling hyphens in compound numbers (e.g., "twenty-three")
 *
 * @param input - The input string to normalize
 * @returns Normalized string
 */
function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\band\b/g, "") // Remove "and" (e.g., "one hundred and fifty" -> "one hundred fifty")
    .trim();
}

/**
 * Splits a worded number string into tokens, handling hyphens.
 *
 * @param input - The normalized input string
 * @returns Array of word tokens
 */
function tokenize(input: string): string[] {
  // Split by spaces and hyphens, but keep hyphenated numbers together initially
  const words = input.split(/\s+/);
  const tokens: string[] = [];

  for (const word of words) {
    // Handle hyphenated numbers like "twenty-three"
    if (word.includes("-")) {
      const parts = word.split("-");
      tokens.push(...parts);
    } else {
      tokens.push(word);
    }
  }

  return tokens.filter((t) => t.length > 0);
}

/**
 * Parses a fractional worded number string and returns the numeric value.
 *
 * Handles patterns like:
 * - "half" -> 0.5
 * - "a half" -> 0.5
 * - "quarter" -> 0.25
 * - "a quarter" -> 0.25
 * - "three quarters" -> 0.75
 * - "one third" -> 0.333...
 * - "two thirds" -> 0.666...
 *
 * @param input - The fractional worded number string to parse
 * @returns The parsed numeric value
 * @throws {Error} If the input format is invalid
 */
export function parseFractionalWordedNumber(input: string): number {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalizeInput(input);
  const tokens = tokenize(normalized);

  if (tokens.length === 0) {
    throw new Error(`Invalid fractional worded number: "${input}"`);
  }

  // Filter out "a" tokens for processing
  const filteredTokens = tokens.filter((t) => t !== "a");

  if (filteredTokens.length === 0) {
    throw new Error(`Invalid fractional worded number: "${input}"`);
  }

  // Case 1: Single fraction word (e.g., "half", "quarter", "third")
  if (filteredTokens.length === 1) {
    const word = filteredTokens[0];
    if (word in FRACTIONS) {
      return FRACTIONS[word];
    }
    throw new Error(`Unrecognized fractional word: "${word}"`);
  }

  // Case 2: Multiplier + fraction (e.g., "two thirds", "three quarters")
  if (filteredTokens.length === 2) {
    const [multiplierWord, fractionWord] = filteredTokens;
    if (multiplierWord in FRACTION_MULTIPLIERS && fractionWord in FRACTIONS) {
      const multiplier = FRACTION_MULTIPLIERS[multiplierWord];
      const fraction = FRACTIONS[fractionWord];
      return multiplier * fraction;
    }
    throw new Error(
      `Invalid fractional pattern: "${multiplierWord} ${fractionWord}"`
    );
  }

  throw new Error(`Invalid fractional worded number: "${input}"`);
}

/**
 * Parses a worded number string and returns the numeric value.
 *
 * Algorithm:
 * 1. Tokenize the input into individual words
 * 2. Process tokens left to right
 * 3. Accumulate values based on scale words (hundred, thousand, million, billion)
 * 4. Handle compound numbers (e.g., "twenty-three")
 *
 * @param input - The worded number string to parse (e.g., 'one hundred', 'twenty-three')
 * @returns The parsed numeric value
 * @throws {ValueOverflowError} If the number exceeds Number.MAX_SAFE_INTEGER
 * @throws {Error} If the input format is invalid
 */
export function parseWordedNumber(input: string): number {
  if (!input || typeof input !== "string") {
    throw new Error("Input must be a non-empty string");
  }

  const normalized = normalizeInput(input);
  const tokens = tokenize(normalized);

  if (tokens.length === 0) {
    throw new Error(`Invalid worded number: "${input}"`);
  }

  let total = 0;
  let current = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check if it's a basic number (0-19)
    if (token in BASIC_NUMBERS) {
      current += BASIC_NUMBERS[token];
    }
    // Check if it's a tens word (20-90)
    else if (token in TENS) {
      current += TENS[token];
    }
    // Check if it's a scale word (hundred, thousand, million, billion)
    else if (token in SCALES) {
      const scale = SCALES[token];

      // If current is 0, assume "a" or implicit "one" (e.g., "a hundred" = 100)
      if (current === 0) {
        current = 1;
      }

      current *= scale;

      // For hundred, keep accumulating in current
      // For thousand and above, add to total and reset current
      if (scale >= 1000) {
        total += current;
        current = 0;
      }
    }
    // Handle "a" as implicit "one" (e.g., "a hundred")
    else if (token === "a") {
      // "a" is handled implicitly when we encounter a scale word
      continue;
    } else {
      throw new Error(`Unrecognized word in number: "${token}"`);
    }
  }

  // Add any remaining current value to total
  const result = total + current;

  // Check for overflow
  if (result > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Number ${result} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }

  return result;
}

/**
 * Builds a regex pattern that matches fractional worded numbers in text.
 */
function buildFractionalWordedNumberRegex(): RegExp {
  const fractionWords = Object.keys(FRACTIONS).join("|");
  const multiplierWords = Object.keys(FRACTION_MULTIPLIERS).join("|");

  // Match patterns like:
  // - "half", "quarter", "third"
  // - "a half", "a quarter"
  // - "two thirds", "three quarters"
  // - "two-thirds", "three-quarters" (with hyphens)
  const pattern = `(?:a\\s+)?(?:(?:${multiplierWords})(?:[\\s-])+)?(?:${fractionWords})`;

  return new RegExp(`\\b(${pattern})\\b`, "gi");
}

/**
 * Builds a regex pattern that matches worded numbers in text.
 * This regex is quite complex as it needs to handle various combinations.
 */
function buildWordedNumberRegex(): RegExp {
  const allWords = [
    ...Object.keys(BASIC_NUMBERS),
    ...Object.keys(TENS),
    ...Object.keys(SCALES),
    "a",
    "and",
  ];

  // Create a pattern that matches one or more number words with optional hyphens and spaces
  // This is a greedy pattern that will match sequences of number-related words
  const wordsPattern = allWords.join("|");

  // Match sequences of number words, allowing for:
  // - spaces between words
  // - hyphens between words (e.g., twenty-three)
  // - the word "and" between numbers
  const pattern = `(?:(?:${wordsPattern})(?:[\\s-](?:and[\\s-])?(?:${wordsPattern}))*)`;
  return new RegExp(`\\b(${pattern})\\b`, "gi");
}

// Pre-compile the regexes for performance
const FRACTIONAL_WORDED_NUMBER_REGEX = buildFractionalWordedNumberRegex();
const WORDED_NUMBER_REGEX = buildWordedNumberRegex();

/**
 * Attempts to match and parse a fractional worded number from a string.
 * Returns null if no fractional worded number is found.
 *
 * @param input - The string to search for a fractional worded number
 * @returns Parse result with value and raw match, or null if not found
 */
export function matchFractionalWordedNumber(
  input: string
): WordedNumberParseResult | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Reset the regex lastIndex to avoid state issues with global flag
  FRACTIONAL_WORDED_NUMBER_REGEX.lastIndex = 0;

  const match = FRACTIONAL_WORDED_NUMBER_REGEX.exec(input);
  if (!match) {
    return null;
  }

  try {
    const value = parseFractionalWordedNumber(match[1]);
    return {
      value,
      raw: match[1],
    };
  } catch {
    return null;
  }
}

export function matchWordedNumber(
  input: string
): WordedNumberParseResult | null {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Reset the regex lastIndex to avoid state issues with global flag
  WORDED_NUMBER_REGEX.lastIndex = 0;

  const match = WORDED_NUMBER_REGEX.exec(input);
  if (!match) {
    return null;
  }

  try {
    const value = parseWordedNumber(match[1]);
    return {
      value,
      raw: match[1],
    };
  } catch {
    return null;
  }
}
