# Changesets workflow

Run `npm run changeset` in every PR that alters public behaviour or API.

Merging to **main** will trigger an auto-generated "Version Packages" PR; merging that publishes to npm via the CI workflow in `.github/workflows/release.yml`.
