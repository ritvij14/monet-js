<context>
# Overview

The **Natural-language Monetary Parser** (`monet-js`) is an open-source, lightweight JavaScript/TypeScript library that converts free-form text containing monetary expressions into structured data. It recognises ten common patterns (plain numbers, numbers with separators, symbols, abbreviations, worded numbers, fractional worded numbers, numeric-word combos, slang terms, contextual phrases, regional formats) and outputs an object `{ amount: number, currency: string }`. The parser is built for **Node ≥ 18** and modern browsers, ships **dual ESM/CJS**, and provides **TypeScript typings**.

# Core Features

- **Currency-first detection** for performance: fast regex scan for any ISO-4217 keyword or symbol before deeper parsing.
- **Pattern parsing** for the 10 specified monetary expression types.
- **Currency normalisation** using the [`currency-codes`](https://www.npmjs.com/package/currency-codes) dataset.
- **Error handling**: throws `MoneyParseError` when the numeric value exceeds `Number.MAX_SAFE_INTEGER` or when currency cannot be determined.
- **Typed API** generated from the TypeScript source.
- **Zero heavy dependencies**; only `currency-codes` plus dev-time tooling.
- **Plugin hook draft** (disabled in MVP): `registerPattern({ id: string, match: (input)=>boolean, parse: (match)=>ParseResult })`.

# User Experience

- **Node usage**: `import { parseMoney } from 'monet-js';`
- **Browser usage**: import via bundler (ESM); demo site includes minified UMD build via `<script>` tag.
- **Helpful errors** guiding developers when inputs are unsupported.
- **Live demo website** showing real-time parsing and JSON output.

# Technical Architecture

- **Language/Build**: TypeScript compiled to dual ESM & CJS; separate minified UMD bundle generated only for the demo site.
- **API (MVP)**:

  ```ts
  interface ParseOptions {
    defaultCurrency?: string; // ISO code fallback
    strict?: boolean; // require explicit currency?
  }

  interface ParseResult {
    amount: number; // ≤ Number.MAX_SAFE_INTEGER
    currency: string; // ISO 4217 code
    match: string; // original matched substring
    index: number; // start index in input
  }

  function parseMoney(input: string, opts?: ParseOptions): ParseResult | null;
  function parseAll(input: string, opts?: ParseOptions): ParseResult[];
  ```

- **Regex pipeline**: currency detection → numeric/word detection → pattern-specific parsing.
- **Currency Data**: `currency-codes` package imported and tree-shaken; optional future custom JSON build step.
- **Custom Errors**: `MoneyParseError`, `ValueOverflowError`.
- **Testing**: Jest + ts-jest, ≥95 % coverage; fixtures per pattern; property-based fuzzing with `fast-check`.
- **Lint**: ESLint (Airbnb-base tuned), enforced in CI.
- **CI/CD**: GitHub Actions — lint → test → size-limit (<5 kB gzip) → build. Releases automated via Changesets (semver).
- **Example Site**: Vite vanilla JS + minimal CSS consuming UMD build; auto-deploy to GitHub Pages.

# Development Roadmap

1. **MVP (v0.1.0)**
   - Core parser with 10 patterns & currency normalisation.
   - Node + browser builds, typings.
   - Jest test suite & CI.
   - Demo website.
2. **Future Enhancements**
   - Range parsing.
   - Additional locales & separators.
   - Public plugin registration.
   - Performance optimisations & BigInt support.

# Logical Dependency Chain

1. Repository tooling (tsconfig, lint, test, CI).
2. Currency data loader implementation.
3. Regex detection pipeline.
4. Pattern parsers (ordered by complexity).
5. Public API & typings exposure.
6. Tests & fixtures.
7. Demo site & UMD bundle.
8. Publish via Changesets.

# Risks and Mitigations

- **Regex catastrophic backtracking** → benchmark each pattern, guard with early currency scan.
- **Number overflow** → cap at `Number.MAX_SAFE_INTEGER`, throw `ValueOverflowError`.
- **Bundle size creep** → size-limit gate in CI.
- **Currency data bloat** → tree-shake or custom JSON strip script.

# Appendix

- Inspired by `chrono-node` architecture.
- Uses [`currency-codes`](https://www.npmjs.com/package/currency-codes) for ISO data.
- Fully open-source under MIT license.
  </context>
  <PRD>

# Technical Architecture

- **Language/Build**: TypeScript compiled to dual ESM & CJS; separate minified UMD bundle generated only for the demo site.
- **API (MVP)**:

  ```ts
  interface ParseOptions {
    defaultCurrency?: string; // ISO code fallback
    strict?: boolean; // require explicit currency?
  }

  interface ParseResult {
    amount: number; // ≤ Number.MAX_SAFE_INTEGER
    currency: string; // ISO 4217 code
    match: string; // original matched substring
    index: number; // start index in input
  }

  function parseMoney(input: string, opts?: ParseOptions): ParseResult | null;
  function parseAll(input: string, opts?: ParseOptions): ParseResult[];
  ```

- **Regex pipeline**: currency detection → numeric/word detection → pattern-specific parsing.
- **Currency Data**: `currency-codes` package imported and tree-shaken; optional future custom JSON build step.
- **Custom Errors**: `MoneyParseError`, `ValueOverflowError`.
- **Testing**: Jest + ts-jest, ≥95 % coverage; fixtures per pattern; property-based fuzzing with `fast-check`.
- **Lint**: ESLint (Airbnb-base tuned), enforced in CI.
- **CI/CD**: GitHub Actions — lint → test → size-limit (<5 kB gzip) → build. Releases automated via Changesets (semver).
- **Example Site**: Vite vanilla JS + minimal CSS consuming UMD build; auto-deploy to GitHub Pages.

# Appendix

- Inspired by `chrono-node` package.
- Uses [`currency-codes`](https://www.npmjs.com/package/currency-codes) for ISO data.
- Fully open-source under MIT license.

</PRD>
