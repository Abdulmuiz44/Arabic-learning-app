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

## Setup

1. Install dependencies

```bash
npm install
```

2. Start the project

```bash
npm run start
```

3. Run Android

```bash
npm run android
```

## Data and persistence

- Seed content lives in `src/data/*.json`.
- SQLite initialization and settings are in `src/db/sqlite.ts`.
- Progress, notes, streak, and reset helpers are in `src/db/repositories.ts`.

## Project structure

- `app/` route files (Expo Router)
- `src/features/` feature selectors and domain helpers
- `src/components/` reusable UI components
- `src/db/` SQLite layer
- `src/data/` seed data
- `src/types/` shared TypeScript models

## Notes

This MVP intentionally excludes authentication, cloud sync, payments, notifications, chat, social/community, and AI tutoring features.
