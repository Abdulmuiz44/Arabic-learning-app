import { getDb } from './sqlite';
import { NoteRow, ProgressRow, StreakMeta } from '../types/models';
import { getChapterById } from '../features/chapters/selectors';

const todayIso = () => new Date().toISOString().slice(0, 10);

export const touchChapter = async (chapterId: string) => {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO progress (chapter_id, last_opened_at) VALUES (?, ?)
     ON CONFLICT(chapter_id) DO UPDATE SET last_opened_at=excluded.last_opened_at`,
    chapterId,
    now,
  );
};

export const completeChapter = async (chapterId: string) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO progress (chapter_id, completed) VALUES (?, 1)
     ON CONFLICT(chapter_id) DO UPDATE SET completed=1`,
    chapterId,
  );
};

export const setQuizBestScore = async (chapterId: string, score: number) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO progress (chapter_id, best_quiz_score) VALUES (?, ?)
     ON CONFLICT(chapter_id) DO UPDATE SET best_quiz_score=MAX(best_quiz_score, excluded.best_quiz_score)`,
    chapterId,
    score,
  );
};

export const setFlashcardStats = async (chapterId: string, known: number, needsReview: number) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO progress (chapter_id, flashcards_known, flashcards_needs_review) VALUES (?, ?, ?)
     ON CONFLICT(chapter_id) DO UPDATE SET
       flashcards_known=excluded.flashcards_known,
       flashcards_needs_review=excluded.flashcards_needs_review`,
    chapterId,
    known,
    needsReview,
  );
};

export const getProgressMap = async () => {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM progress`);
  return rows.reduce<Record<string, ProgressRow>>((acc, row) => {
    acc[row.chapter_id] = {
      chapterId: row.chapter_id,
      completed: row.completed,
      lastOpenedAt: row.last_opened_at ?? '',
      bestQuizScore: row.best_quiz_score,
      flashcardsKnown: row.flashcards_known,
      flashcardsNeedsReview: row.flashcards_needs_review,
    };
    return acc;
  }, {});
};

export const getLastOpenedChapterId = async () => {
  const db = await getDb();
  const row = await db.getFirstAsync<{ chapter_id: string }>(
    `SELECT chapter_id FROM progress WHERE last_opened_at IS NOT NULL ORDER BY last_opened_at DESC LIMIT 1`,
  );
  return row?.chapter_id ?? null;
};

export const listNotes = async (chapterId?: string) => {
  const db = await getDb();
  const rows = chapterId
    ? await db.getAllAsync<any>(`SELECT * FROM notes WHERE chapter_id = ? ORDER BY updated_at DESC`, chapterId)
    : await db.getAllAsync<any>(`SELECT * FROM notes ORDER BY updated_at DESC`);
  return rows.map<NoteRow>((row) => ({ id: row.id, chapterId: row.chapter_id, body: row.body, updatedAt: row.updated_at }));
};

export const addNote = async (chapterId: string, body: string) => {
  if (!getChapterById(chapterId)) {
    throw new Error('Cannot add a note for a chapter that does not exist.');
  }

  const db = await getDb();
  await db.runAsync(`INSERT INTO notes (chapter_id, body, updated_at) VALUES (?, ?, ?)`, chapterId, body, new Date().toISOString());
};

export const updateNote = async (id: number, body: string) => {
  const db = await getDb();
  await db.runAsync(`UPDATE notes SET body=?, updated_at=? WHERE id=?`, body, new Date().toISOString(), id);
};

export const deleteNote = async (id: number) => {
  const db = await getDb();
  await db.runAsync(`DELETE FROM notes WHERE id=?`, id);
};

export const updateStreakForAction = async () => {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(`SELECT * FROM streak_meta WHERE id=1`);
  const today = todayIso();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let current = row?.current_streak ?? 0;

  if (!row?.last_study_date) current = 1;
  else if (row.last_study_date === today) current = row.current_streak;
  else if (row.last_study_date === yesterday) current = row.current_streak + 1;
  else current = 1;

  const longest = Math.max(row?.longest_streak ?? 0, current);

  await db.runAsync(
    `UPDATE streak_meta SET current_streak=?, longest_streak=?, last_study_date=? WHERE id=1`,
    current,
    longest,
    today,
  );
};

export const getStreak = async (): Promise<StreakMeta> => {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(`SELECT * FROM streak_meta WHERE id=1`);
  return {
    currentStreak: row?.current_streak ?? 0,
    longestStreak: row?.longest_streak ?? 0,
    lastStudyDate: row?.last_study_date ?? null,
  };
};

export const resetAllProgress = async () => {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM progress;
    DELETE FROM notes;
    DELETE FROM bookmarks;
    UPDATE streak_meta SET current_streak = 0, longest_streak = 0, last_study_date = NULL WHERE id=1;
  `);
};
