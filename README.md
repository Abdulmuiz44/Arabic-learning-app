# Awwal Arabic (Expo + TypeScript)

Awwal Arabic is an Android-first Expo React Native MVP for local-first Arabic learning.

## Features

- Onboarding, Home, Books, Chapters, Lesson, Flashcards, Quiz, Notes, Settings.
- Expo Router tab + stack route structure.
- Local seed JSON data for books, chapters, lesson sections, flashcards, quizzes, questions, and videos.
- SQLite persistence for progress, notes, streak meta, bookmarks, and app settings.
- Continue learning from most recently opened chapter.
- Theme setting (light/dark/system) persisted locally.

## Stack

- Expo (React Native) with TypeScript
- Expo Router
- expo-sqlite

## Prerequisites

Before running the app, make sure you have:

- **Node.js** (recommended: active LTS, e.g. Node 20+)
- **npm** (ships with Node)
- **Expo CLI usage mode:** use Expo via **`npx`** (recommended) instead of relying on a globally installed `expo-cli`
- **Android target** for MVP testing:
  - Android Studio Emulator **or**
  - A physical Android device with USB debugging enabled

## Setup and commands

1. Install dependencies

```bash
npm install
```

2. Start the Metro/Expo dev server

```bash
npm run start
```

3. Run Android

```bash
npm run android
```

4. Run web target

```bash
npm run web
```

5. Run TypeScript type-check

```bash
npm run typecheck
```

6. Run linter

```bash
npm run lint
```

## Content pipeline (authoring + validation)

The app runtime reads canonical seed files from `src/data/*.json`.
To make curriculum updates safe, author content in `content-source/` and use the content tooling to validate + generate deterministic runtime files.

### Folder model

- `content-source/` → editable source content for curriculum authors
- `src/data/` → generated canonical runtime files consumed by the app
- `src/content/` → shared schemas, normalization, and validation logic
- `scripts/content/` → CLI tooling for build and validation

### Commands

Validate canonical runtime content:

```bash
npm run content:validate
```

Build canonical runtime files from `content-source/`:

```bash
npm run content:build
```

Both commands fail with a non-zero exit code on invalid content and print actionable errors with file names and record IDs.

### Expected content files

Place one JSON file per entity in both `content-source/` and `src/data/`:

- `books.json`
- `chapters.json`
- `lesson_sections.json`
- `flashcards.json`
- `quizzes.json`
- `questions.json`
- `videos.json`
- `listening_items.json`

### Key validation rules

- duplicate IDs inside any file
- invalid field types or missing required strings
- chapters referencing missing books
- lesson sections, flashcards, listening items, quizzes, and videos referencing missing chapters
- questions referencing missing quizzes
- invalid quiz `correctOption` (must be `A|B|C|D`)
- duplicate `chapterNumber` inside a single book

### Normalization performed during build

- trims all string fields
- collapses repeated whitespace
- enforces deterministic sort order by parent + index/id
- writes prettified canonical JSON with stable ordering

### Common failure cases and fixes

- **`Duplicate id`**: Rename one record ID to a unique stable value.
- **`Missing parent chapter/book/quiz`**: Correct the foreign key (`bookId`, `chapterId`, `quizId`).
- **`... cannot be empty`**: Fill in the required text field with non-empty content.
- **`correctOption` invalid**: Use one of `A`, `B`, `C`, or `D`.
- **`Duplicate chapterNumber`**: Ensure chapter numbers are unique within each book.


## Audio + listening MVP

### Audio metadata fields

Audio can be attached to chapters, flashcards, and listening items with either:

- `audioUrl`: absolute URL to an audio file
- `localAudioKey`: key looked up in `src/audio/audioRegistry.ts`

Examples:

- `chapters.json`: optional `chapterAudioUrl`, `chapterLocalAudioKey`
- `flashcards.json`: optional `audioUrl`, `localAudioKey`
- `listening_items.json`: `id`, `chapterId`, `promptText`, `arabic`, `transliteration`, `translation`, optional audio fields, `difficulty`, `orderIndex`

### Where audio assets belong

- Remote audio: host files and reference by `audioUrl`.
- Local audio: register keys in `src/audio/audioRegistry.ts` and map them to bundled asset URIs.

If audio is missing or not mapped, UI controls remain safe and show an unavailable/error state instead of crashing.

### Listening progress persistence

Listening attempts are stored in SQLite table `listening_progress` with:

- `item_id`
- `chapter_id`
- `completed`
- `correct_count`
- `last_attempted_at`

The app also stores `last_listening_session_at` in `app_settings`.

### MVP limitations

- No speech-to-text or pronunciation scoring.
- No backend sync/auth for listening progress.
- Local audio registry ships as a placeholder map and must be wired to real files for offline playback.

## Data and persistence

- Seed content lives in `src/data/*.json`.
- SQLite initialization and settings are in `src/db/sqlite.ts`.
- Progress, notes, streak, and reset helpers are in `src/db/repositories.ts`.

## First-run flow

1. App bootstraps database tables from `initDb()` in `src/db/sqlite.ts`.
2. On first run, `app_settings` gets default values including:
   - `theme = system`
   - `onboarding_done = 0`
3. Initial route (`app/index.tsx`) checks `onboarding_done`:
   - `0` (or missing) ➜ redirects to `/onboarding`
   - `1` ➜ redirects to `/(tabs)`
4. Pressing **Get Started** on onboarding sets `onboarding_done = 1` and routes to tabs.
5. Static learning content is seeded from local JSON imports in `src/data/seed.ts` (books, chapters, lessons, flashcards, quizzes, questions, videos).
6. User-generated data persists in local SQLite database `awwal-arabic.db` (Expo app sandbox on device/emulator), including progress, notes, streak, bookmarks, and settings.

## Troubleshooting

### 1) Metro cache issues (stale bundle / weird runtime behavior)

Symptoms can include old UI rendering after edits, stale modules, or route files seemingly ignored.

```bash
npx expo start --clear
```

If needed, stop all Expo/Metro processes and rerun:

```bash
npm run start
```

### 2) Stale SQLite DB state

Symptoms can include onboarding not reappearing when expected, old notes/progress still visible, or streak state feeling inconsistent during repeated testing.

- Use **Settings → Reset Progress** for a soft reset of progress, notes, bookmarks, and streak.
- If you need a full reset (including `onboarding_done` and theme), uninstall/reinstall the app on emulator/device to clear app sandbox storage and recreate `awwal-arabic.db`.

### 3) Route mismatch / navigation symptoms

Symptoms can include “Unmatched route”, links landing on the wrong screen, or dynamic route params not resolving.

Checklist:

- Ensure route filenames under `app/` match hrefs exactly (including group segments like `/(tabs)` and dynamic segments like `[chapterId]`).
- Confirm links use expected path patterns, e.g. `/books/:bookId`, `/chapters/:chapterId`, `/flashcards/:chapterId`, `/quiz/:chapterId`, `/videos/:chapterId`.
- Clear Metro cache after route-file changes:

```bash
npx expo start --clear
```

## Manual QA flow (MVP)

Use this concise smoke flow after launching the app:

1. **`/` → `/onboarding`** (fresh install): onboarding appears, tap **Get Started**.
2. **`/(tabs)` Home**: verify streak card renders and “Continue Learning” shows empty state before opening a chapter.
3. **`/(tabs)/books`**: open a book (`/books/[bookId]`), then open a chapter (`/chapters/[chapterId]`).
4. **Chapter actions**: open flashcards (`/flashcards/[chapterId]`), quiz (`/quiz/[chapterId]` + `/quiz/result`), and videos (`/videos/[chapterId]`) and confirm no route errors.
5. Return to **Home** and verify “Continue Learning” now points to the last opened chapter (persisted from progress table).
6. **`/(tabs)/notes`**: create, edit, and delete a note; confirm it remains after tab switching/reload.
7. **`/(tabs)/settings`**: change theme (Light/Dark/System), navigate away/back, and verify setting persists.
8. In **Settings**, tap **Reset Progress**; verify notes/progress/streak reset while app still functions.
9. Restart app and verify:
   - onboarding does **not** show again unless app storage was fully cleared
   - persisted settings/data behavior matches actions above.

## Project structure

- `app/` route files (Expo Router)
- `src/features/` feature selectors and domain helpers
- `src/components/` reusable UI components
- `src/db/` SQLite layer
- `src/data/` seed data
- `src/types/` shared TypeScript models

## Notes

This MVP intentionally excludes authentication, cloud sync, payments, notifications, chat, social/community, and AI tutoring features.
