export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  coverColor: string;
  sortOrder: number;
};

export type Chapter = {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
};

export type LessonSection = {
  id: string;
  chapterId: string;
  heading: string;
  body: string;
  orderIndex: number;
};

export type Flashcard = {
  id: string;
  chapterId: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  example: string;
};

export type Quiz = {
  id: string;
  chapterId: string;
  title: string;
};

export type Question = {
  id: string;
  quizId: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
};

export type Video = {
  id: string;
  chapterId: string;
  title: string;
  youtubeUrl: string;
};

export type ProgressRow = {
  chapterId: string;
  completed: number;
  lastOpenedAt: string;
  bestQuizScore: number;
  flashcardsKnown: number;
  flashcardsNeedsReview: number;
};

export type NoteRow = {
  id: number;
  chapterId: string;
  body: string;
  updatedAt: string;
};

export type StreakMeta = {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
};

export type ThemeSetting = 'light' | 'dark' | 'system';
