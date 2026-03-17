# Content Studio Workspace

## Workspace purpose
`apps/content-studio` is the authoring and release workspace for curriculum data. It is responsible for:

- collecting editable source content from authors,
- validating structural and relational correctness,
- computing readiness signals before release,
- powering preview experiences that match app behavior,
- exporting deterministic JSON bundles for downstream clients (current app and future mobile consumers).

This workspace is the **single place** where content quality is evaluated before publishing.

## Source vs exported content model

### Source model (author-friendly)
The source model is optimized for editing and review. Typical traits:

- one logical entity per record (`book`, `chapter`, `lesson_section`, `flashcard`, `quiz`, `question`, `video`),
- stable IDs that humans can reason about,
- optional editorial metadata (draft notes, review status, ownership),
- permissive formatting during authoring (extra whitespace, unsorted records).

In the current repo, source files are represented by the JSON set in `content-source/`:

- `books.json`
- `chapters.json`
- `lesson_sections.json`
- `flashcards.json`
- `quizzes.json`
- `questions.json`
- `videos.json`

### Exported model (runtime-friendly)
The exported model is optimized for deterministic runtime consumption:

- normalized text fields (trimmed and whitespace-collapsed),
- deterministic ordering,
- relationally consistent references,
- no editor-only fields,
- stable file layout and names for cacheability and predictable diffs.

In this repo, canonical exported JSON is written to `src/data/*.json`.

## Validation severities and blocking rules
Validation outcomes should be categorized by severity:

- **Error**: invariant violation that blocks export and release.
- **Warning**: non-blocking quality issue; export may proceed but should be reviewed.
- **Info**: advisory observation.

### Blocking rules
- Export is blocked when one or more **errors** are present.
- Export is allowed when only warnings/info are present.
- CI release gates should fail only on errors, but may enforce warning budgets in stricter environments.

### Current implemented behavior
Current scripts (`scripts/content/lib.mjs`) effectively treat all discovered issues as blocking errors. The validator checks:

- schema-level requirements (required fields, types, allowed values),
- identity constraints (duplicate IDs),
- parent-child references (`bookId`, `chapterId`, `quizId`),
- chapter number uniqueness within a book,
- URL validity for video links.

If any issue exists, validation/build exits non-zero.

## Readiness scoring logic and statuses
Use readiness scoring to summarize publishability at book/chapter granularity.

### Suggested score composition (0–100)
- **Structural validity (40 pts)**: schema correctness and required data present.
- **Relational integrity (25 pts)**: all references resolve.
- **Coverage completeness (25 pts)**: required child entities exist (e.g., chapter has sections + quiz/questions + flashcards).
- **Editorial quality (10 pts)**: warning-level quality checks (length, clarity, metadata completeness).

### Suggested status thresholds
- **Blocked**: any blocking error; score effectively 0 for release purposes.
- **Draft**: 1–59, no hard errors but missing substantial content.
- **Review**: 60–84, structurally sound with moderate gaps/warnings.
- **Ready**: 85–100, no blocking issues and acceptable warning profile.

Readiness should be recalculated from current source state and included in summary output.

## Preview system and data source expectations
Preview should render from the same normalized shape used by runtime consumers, not raw authoring data.

### Expectations
- Preview loads normalized in-memory content derived from source + validation.
- Preview must fail fast (or display explicit error state) on blocking issues.
- Preview data contracts should match bundle contracts exactly to avoid drift.
- Preview should support scoped rendering (by book/chapter) for fast editor feedback.

### Data-source policy
1. Author edits source JSON.
2. Studio validates + normalizes.
3. Preview reads normalized model.
4. Export writes deterministic bundle artifacts.

## Deterministic export folder/file structure
A deterministic layout makes diffs, caching, and mobile ingestion predictable.

```text
exports/
  content/
    manifest.json
    books.json
    chapters.json
    lesson_sections.json
    flashcards.json
    quizzes.json
    questions.json
    videos.json
    bundles/
      by-book/
        <bookId>.bundle.json
      by-chapter/
        <chapterId>.bundle.json
```

### Determinism requirements
- stable sort order for every entity list,
- stable JSON serialization (consistent key order + formatting),
- stable naming by ID,
- manifest with export timestamp/version/hash metadata,
- no non-deterministic fields inside content bundles unless explicitly segregated.

## Command reference
The studio should expose the following command surface:

- `validate:content` — run validations and print severity-organized issues.
- `export:content` — validate, normalize, and emit deterministic export artifacts.
- `content:summary` — output aggregate readiness/coverage summary for authors and CI dashboards.

### Current script mapping in this repository
- `npm run content:validate` is the currently implemented validator.
- `npm run content:build` is the current validate+export flow to canonical app data.

If desired, add aliases so both naming schemes are supported.

## Guidance for future mobile-app consumption of bundle JSON
To support mobile clients reliably:

- treat bundle schema as a versioned contract (`schemaVersion` in manifest),
- prefer additive changes over breaking changes,
- include integrity metadata (`contentHash`) for cache invalidation,
- support partial fetch (by-book/by-chapter bundles) for startup performance,
- keep IDs stable across releases,
- avoid client-side joins requiring unavailable files at first render,
- ship enough metadata in each bundle for offline-first reads,
- document deprecation windows for renamed/removed fields.

## Known limitations and extension points

### Known limitations (current state)
- Validation currently emits one severity class (blocking) rather than error/warn/info tiers.
- No first-class readiness score/status artifacts are emitted.
- No dedicated `content:summary` script yet.
- Export target is canonical `src/data/*.json` rather than a richer manifest + segmented bundle tree.

### Extension points
- add severity metadata to validator issue objects,
- add rule packs for style/editorial heuristics,
- implement readiness calculators per chapter/book,
- emit manifest with schema version and hash data,
- add locale-aware bundles for multilingual content,
- introduce pluggable transforms for future entity types,
- add snapshot tests that assert deterministic export output.
