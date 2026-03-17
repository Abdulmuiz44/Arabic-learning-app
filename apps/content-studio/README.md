# Content Studio

`apps/content-studio` is a standalone TypeScript workspace for Arabic learning content tooling.

## Scripts

- `npm run validate:content` – runs validation checks for content inputs.
- `npm run export:content` – runs export pipeline scaffolding.
- `npm run content:summary` – prints a quick summary of content workspace readiness.

## Structure

- `src/lib/contracts` – shared contract types/interfaces.
- `src/lib/normalizers` – normalization utilities.
- `src/lib/validators` – validation utilities.
- `src/lib/exporters` – export helpers.
- `src/lib/diagnostics` – diagnostics/reporting helpers.
- `src/features/export` – export feature entry points.
- `src/features/preview` – preview feature entry points.
- `src/features/readiness` – readiness checks.
- `exports/app-bundles` – generated app bundle exports.
