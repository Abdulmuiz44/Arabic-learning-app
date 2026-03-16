import * as SQLite from 'expo-sqlite';
import { ThemeSetting } from '../types/models';

let db: SQLite.SQLiteDatabase | null = null;
let initDbPromise: Promise<void> | null = null;

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('awwal-arabic.db');
  }
  return db;
};

export const initDb = async () => {
  if (initDbPromise) {
    return initDbPromise;
  }

  initDbPromise = (async () => {
    const database = await getDb();
    await database.execAsync(`
    CREATE TABLE IF NOT EXISTS progress (
      chapter_id TEXT PRIMARY KEY NOT NULL,
      completed INTEGER DEFAULT 0,
      last_opened_at TEXT,
      best_quiz_score INTEGER DEFAULT 0,
      flashcards_known INTEGER DEFAULT 0,
      flashcards_needs_review INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id TEXT NOT NULL,
      body TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS streak_meta (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_study_date TEXT
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      chapter_id TEXT PRIMARY KEY NOT NULL,
      saved_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO streak_meta (id, current_streak, longest_streak, last_study_date)
    VALUES (1, 0, 0, NULL);

    INSERT OR IGNORE INTO app_settings (key, value) VALUES ('theme', 'system');
    INSERT OR IGNORE INTO app_settings (key, value) VALUES ('onboarding_done', '0');
  `);
  })();

  try {
    await initDbPromise;
  } catch (error) {
    initDbPromise = null;
    throw error;
  }
};

export const setTheme = async (theme: ThemeSetting) => {
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO app_settings (key, value) VALUES ('theme', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    theme,
  );
};

export const getTheme = async (): Promise<ThemeSetting> => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ value: ThemeSetting }>(
    `SELECT value FROM app_settings WHERE key='theme'`,
  );
  return row?.value ?? 'system';
};


export const setOnboardingDone = async () => {
  const database = await getDb();
  await database.runAsync(`INSERT INTO app_settings (key, value) VALUES ('onboarding_done', '1') ON CONFLICT(key) DO UPDATE SET value='1'`);
};

export const getOnboardingDone = async () => {
  const database = await getDb();
  const row = await database.getFirstAsync<{ value: string }>(`SELECT value FROM app_settings WHERE key='onboarding_done'`);
  return row?.value === '1';
};
