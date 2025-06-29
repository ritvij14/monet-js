/**
 * Regex Parsing Pipeline
 * =================================
 * Implements three-stage detection flow:
 *   1. Currency detection (symbols or ISO-4217 codes)
 *   2. Numeric / word-number detection
 *   3. Pattern-specific parsing (10 canonical patterns to be added in `src/patterns/*`)
 *
 * Core Concepts
 * -------------
 * • `PipelineContext` – a mutable accumulator passed through every stage.
 * • `PipelineStep`   – a **pure** function `(input, ctx) => newCtx`.
 * • `RegexPipeline`  – orchestrates an ordered list of `PipelineStep`s.
 *
 * Design Goals
 * ------------
 * • **Minimal & stateless** – safe for concurrent calls in browser / server.
 * • **Extensible** – use `pipeline.addStep()` or build a custom pipeline.
 * • **Typed** – first-class TypeScript types for DX & downstream API.
 *
 * Quick Start for Contributors
 * ---------------------------
 * ```ts
 * // Use the canonical pipeline
 * const pipeline = RegexPipeline.default();
 * const result   = pipeline.run("I paid $10 USD");
 * // -> { original: "I paid $10 USD", currency: "$", amount: 10 }
 *
 * // Create and register a new pattern step
 * import { wordsToNumberStep } from "./patterns/wordNumber";
 * const custom = RegexPipeline.default().addStep(wordsToNumberStep);
 * ```
 *
 * When adding new regex steps, **clone** the context (see `clone` helper) instead
 * of mutating it in place to prevent accidental side-effects across stages.
 */
export interface PipelineContext {
  original: string; // Original input string
  currency?: string; // Detected currency symbol or ISO code
  amount?: number; // Numeric amount detected in the string
  matches?: Record<string, unknown>; // Placeholder for additional pattern matches
}

/**
 * A pipeline step takes the raw input and the current context, returning an updated context.
 */
export type PipelineStep = (
  input: string,
  ctx: PipelineContext
) => PipelineContext;

/** Utility to clone a simple object (shallow). */
const clone = <T extends object>(obj: T): T => ({ ...obj });

export class RegexPipeline {
  private steps: PipelineStep[];

  constructor(steps: PipelineStep[] = []) {
    this.steps = steps;
  }

  /**
   * Run the input through each configured step in sequence.
   */
  run(input: string): PipelineContext {
    let ctx: PipelineContext = { original: input };
    for (const step of this.steps) {
      ctx = step(input, ctx);
    }
    return ctx;
  }

  /**
   * Append a new step to the pipeline. Returns `this` for fluent chaining.
   */
  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Factory that returns a pipeline pre-configured with the default steps.
   */
  static default(): RegexPipeline {
    return new RegexPipeline([
      currencyDetectionStep,
      numericDetectionStep,
      patternSpecificStep,
    ]);
  }
}

// ---------------------------------------------------------------------------
// Default Step Implementations
// ---------------------------------------------------------------------------
import { getCurrencyByCode } from "./currencyData";

// ---------------------------------------------------------------------------
// Currency helpers
// ---------------------------------------------------------------------------
/**
 * Minimal lookup table for common currency symbols → ISO-4217 code.
 * Note: ambiguous symbols (e.g., "$") are mapped to the symbol itself; the
 *       downstream pipeline can disambiguate once more context is available.
 */
const SYMBOL_TO_CODE: Record<string, string> = {
  $: "USD", // Could be other dollar currencies, but USD is most common.
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY", // ¥ is shared by JPY & CNY – default to JPY.
  "₹": "INR",
  "₽": "RUB",
  "₩": "KRW",
  "฿": "THB",
};

// Build a character class for the known symbols – escape where needed.
const SYMBOL_REGEX = new RegExp(
  `[${Object.keys(SYMBOL_TO_CODE)
    .map((s) => `\\${s}`) // escape metacharacters
    .join("")}]`
);

// ---------------------------------------------------------------------------
// Numeric helpers (word-to-number + suffix multipliers)
// ---------------------------------------------------------------------------
/**
 * Converts an English worded number ("one hundred twenty three", "five thousand") to its numeric value.
 * Handles the most common cases needed for monetary amounts (units, tens, hundreds, thousands, millions, billions).
 * Returns `null` if the string cannot be parsed confidently.
 */
const wordsToNumber = (words: string): number | null => {
  if (!words) return null;
  const tokens = words
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/ and /g, " ")
    .trim()
    .split(/\s+/);

  const SMALL: Record<string, number> = {
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
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
  };
  const MAGNITUDE: Record<string, number> = {
    hundred: 100,
    thousand: 1_000,
    million: 1_000_000,
    billion: 1_000_000_000,
  };

  let total = 0;
  let current = 0;
  for (const token of tokens) {
    if (SMALL[token] !== undefined) {
      current += SMALL[token];
    } else if (token === "hundred") {
      current *= 100;
    } else if (MAGNITUDE[token]) {
      total += current * MAGNITUDE[token];
      current = 0;
    } else {
      // Unknown token – bail out to avoid false positives
      return null;
    }
  }
  return total + current;
};

/** Map shorthand suffixes (k, m, b) to multipliers. */
const SUFFIX_MULTIPLIER: Record<string, number> = {
  k: 1_000,
  m: 1_000_000,
  b: 1_000_000_000,
};

/** 1) Currency detection step */
const currencyDetectionStep: PipelineStep = (input, ctx) => {
  const out = clone(ctx);

  // 1) Known currency symbols first (quick win, 1-char to 3-char tokens)
  const symbolMatch = SYMBOL_REGEX.exec(input);
  if (symbolMatch) {
    const detected = symbolMatch[0];
    out.currency = SYMBOL_TO_CODE[detected] ?? detected;
    return out;
  }

  // 2) ISO code (3 letters) — search all 3-letter word tokens and return the first valid currency.
  const isoCandidates = input.match(/\b[A-Za-z]{3}\b/g) ?? [];
  for (const candidate of isoCandidates) {
    const upper = candidate.toUpperCase();
    if (getCurrencyByCode(upper)) {
      out.currency = upper;
      break;
    }
  }

  return out;
};

/** 2) Numeric / word-number detection (simple digits & decimals for now) */
const numericDetectionStep: PipelineStep = (input, ctx) => {
  const out = clone(ctx);

  // Normalize input: remove common thousand separators (",") to simplify parsing.
  const cleaned = input.replace(/,/g, "");

  // ---------------------------------------------------------------------
  // 1) Numeric value with optional shorthand suffix (k, m, b)
  // ---------------------------------------------------------------------
  const suffixMatch = /(?:\b|^)(\d+(?:\.\d+)?)([kKmMbB])(?:\b|$)/.exec(cleaned);
  if (suffixMatch) {
    const value = parseFloat(suffixMatch[1]);
    const multiplier = SUFFIX_MULTIPLIER[suffixMatch[2].toLowerCase()];
    if (!isNaN(value)) {
      out.amount = value * multiplier;
      return out;
    }
  }

  // ---------------------------------------------------------------------
  // 2) Plain numeric (digits and decimals)
  // ---------------------------------------------------------------------
  const numMatch = /(?:\b|^)(\d+(?:\.\d+)?)(?:\b|$)/.exec(cleaned);
  if (numMatch) {
    out.amount = parseFloat(numMatch[1]);
    return out;
  }

  // ---------------------------------------------------------------------
  // 3) Worded numbers ("one hundred twenty", "two thousand")
  // ---------------------------------------------------------------------
  const wordNumberRegex =
    /\b((?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)(?:[\s-](?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion))*)\b/i;
  const wordMatch = wordNumberRegex.exec(cleaned);
  if (wordMatch) {
    const parsed = wordsToNumber(wordMatch[1]);
    if (parsed !== null) {
      out.amount = parsed;
    }
  }

  return out;
};

/** 3) Placeholder for additional specialized parsing */
const patternSpecificStep: PipelineStep = (input, ctx) => {
  const out = clone(ctx);
  // Future custom regex logic can populate `matches`.
  out.matches = out.matches ?? {};
  return out;
};
