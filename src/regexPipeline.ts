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

/** 1) Currency detection step */
const currencyDetectionStep: PipelineStep = (input, ctx) => {
  const out = clone(ctx);

  // ISO code (3 letters) — case-insensitive, verified via currency data.
  const isoMatch = /(?:\b|^)([A-Za-z]{3})(?:\b|$)/.exec(input);

  // Known currency symbols
  const symbolMatch = SYMBOL_REGEX.exec(input);

  if (isoMatch && getCurrencyByCode(isoMatch[1].toUpperCase())) {
    out.currency = isoMatch[1].toUpperCase();
  } else if (symbolMatch) {
    const detected = symbolMatch[0];
    out.currency = SYMBOL_TO_CODE[detected] ?? detected;
  }

  return out;
};

/** 2) Numeric / word-number detection (simple digits & decimals for now) */
const numericDetectionStep: PipelineStep = (input, ctx) => {
  const out = clone(ctx);
  const numMatch = /(?:\b|^)(\d+(?:\.\d+)?)(?:\b|$)/.exec(input);
  if (numMatch) {
    out.amount = parseFloat(numMatch[1]);
  }
  // TODO: Add word-to-number mapping ("ten", "twenty five", etc.) in future.
  return out;
};

/** 3) Placeholder for additional specialized parsing */
const patternSpecificStep: PipelineStep = (input, ctx) => {
  const out = clone(ctx);
  // Future custom regex logic can populate `matches`.
  out.matches = out.matches ?? {};
  return out;
};
