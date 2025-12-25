# Monet.js

Natural-language monetary parser for JavaScript/TypeScript.

## Getting Started

```bash
npm install monet-js
```

```ts
import { parseMoney } from "monet-js";

parseMoney("$12.50");
// => { value: 12.5, currency: 'USD' }
```

## Supported Patterns (high level)

- Plain numbers, numbers with separators, symbols (e.g., `$100`, `1,234.56`)
- ISO abbreviations (e.g., `USD 100`, `50 EUR`)
- Worded numbers (e.g., `one hundred dollars`)
- Numeric-word combos (e.g., `10k`)
- Slang terms (e.g., `buck`, `quid`, `fiver`, `tenner`)
- Contextual phrases, including compound major+minor amounts:
  - `a hundred dollars`
  - `the fifty euros`
  - `a dollar and 23 cents`
  - `five euros and fifty cents`
  - `10 pounds and 5 pence`

## Releasing

We use **Changesets** for automated semantic-versioning and publishing.

1. Run `npm run changeset` in your feature branch and follow the prompts to describe the change (select patch/minor/major).
2. Commit the generated file (in `.changeset/`).
3. Merge your PR into `main`.
4. GitHub Actions will create/maintain a "Version Packages" PR containing the version bump & changelog.
5. When that PR is merged and CI passes, the library is published to npm automatically.
