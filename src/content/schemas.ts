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

export type CanonicalContent = {
  books: Book[];
  chapters: Chapter[];
  lesson_sections: LessonSection[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  questions: Question[];
  videos: Video[];
};

export const CONTENT_KEYS = [
  'books',
  'chapters',
  'lesson_sections',
  'flashcards',
  'quizzes',
  'questions',
  'videos',
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];
