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

## Releasing

We use **Changesets** for automated semantic-versioning and publishing.

1. Run `npm run changeset` in your feature branch and follow the prompts to describe the change (select patch/minor/major).
2. Commit the generated file (in `.changeset/`).
3. Merge your PR into `main`.
4. GitHub Actions will create/maintain a "Version Packages" PR containing the version bump & changelog.
5. When that PR is merged and CI passes, the library is published to npm automatically.
