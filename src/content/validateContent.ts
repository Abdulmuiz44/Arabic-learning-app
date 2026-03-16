import { CanonicalContent } from './schemas';

export type ValidationIssue = {
  file: string;
  recordId?: string;
  message: string;
};

const CORRECT_OPTIONS = new Set(['A', 'B', 'C', 'D']);
const LISTENING_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeEntity<T extends Record<string, unknown>>(item: T): T {
  const normalized = { ...item };
  for (const [key, value] of Object.entries(normalized)) {
    if (typeof value === 'string') {
      normalized[key as keyof T] = normalizeText(value) as T[keyof T];
    }
  }
  return normalized;
}

export function normalizeContent(content: CanonicalContent): CanonicalContent {
  return {
    books: content.books.map(normalizeEntity).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    chapters: content.chapters
      .map(normalizeEntity)
      .sort((a, b) => a.bookId.localeCompare(b.bookId) || a.chapterNumber - b.chapterNumber || a.id.localeCompare(b.id)),
    lesson_sections: content.lesson_sections
      .map(normalizeEntity)
      .sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.orderIndex - b.orderIndex || a.id.localeCompare(b.id)),
    flashcards: content.flashcards
      .map(normalizeEntity)
      .sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
    listening_items: content.listening_items
      .map(normalizeEntity)
      .sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.orderIndex - b.orderIndex || a.id.localeCompare(b.id)),
    quizzes: content.quizzes
      .map(normalizeEntity)
      .sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
    questions: content.questions
      .map(normalizeEntity)
      .sort((a, b) => a.quizId.localeCompare(b.quizId) || a.id.localeCompare(b.id)),
    videos: content.videos
      .map(normalizeEntity)
      .sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
  };
}

function detectDuplicateIds(items: Array<{ id: string }>, file: string): ValidationIssue[] {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      issues.push({ file, recordId: item.id, message: `Duplicate id "${item.id}" found` });
    }
    seen.add(item.id);
  }
  return issues;
}

function requireStringFields(
  record: Record<string, unknown>,
  fields: string[],
  file: string,
  recordId: string | undefined,
  issues: ValidationIssue[],
) {
  for (const field of fields) {
    if (!isNonEmptyString(record[field])) {
      issues.push({ file, recordId, message: `${field} is required and must be a non-empty string` });
    }
  }
}

function isValidUrl(value: unknown): boolean {
  if (!isNonEmptyString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateOptionalAudio(
  record: Record<string, unknown>,
  file: string,
  recordId: string | undefined,
  issues: ValidationIssue[],
  urlField: string,
  keyField: string,
) {
  const urlValue = record[urlField];
  const keyValue = record[keyField];

  if (urlValue !== undefined && !isValidUrl(urlValue)) {
    issues.push({ file, recordId, message: `${urlField} must be a valid URL when provided` });
  }

  if (keyValue !== undefined && !isNonEmptyString(keyValue)) {
    issues.push({ file, recordId, message: `${keyField} must be a non-empty string when provided` });
  }
}

export function validateContent(raw: unknown): { content: CanonicalContent | null; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { content: null, issues: [{ file: 'content', message: 'Content root must be an object' }] };
  }

  const root = raw as Record<string, unknown>;

  const canonical: CanonicalContent = {
    books: [],
    chapters: [],
    lesson_sections: [],
    flashcards: [],
    listening_items: [],
    quizzes: [],
    questions: [],
    videos: [],
  };

  for (const [file, key] of [
    ['books.json', 'books'],
    ['chapters.json', 'chapters'],
    ['lesson_sections.json', 'lesson_sections'],
    ['flashcards.json', 'flashcards'],
    ['listening_items.json', 'listening_items'],
    ['quizzes.json', 'quizzes'],
    ['questions.json', 'questions'],
    ['videos.json', 'videos'],
  ] as const) {
    if (!Array.isArray(root[key])) {
      issues.push({ file, message: 'Expected top-level array' });
    }
  }

  for (const item of (root.books as unknown[]) ?? []) {
    const file = 'books.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'slug', 'title', 'subtitle', 'description', 'coverColor'], file, recordId, issues);
    if (!isNonNegativeInteger(record.sortOrder)) issues.push({ file, recordId, message: 'sortOrder must be a non-negative integer' });
    if (!isNonEmptyString(record.coverColor) || !/^#[0-9A-Fa-f]{6}$/.test(record.coverColor)) {
      issues.push({ file, recordId, message: 'coverColor must be hex like #AABBCC' });
    }
    if (isNonEmptyString(record.id)) canonical.books.push(record as CanonicalContent['books'][number]);
  }

  for (const item of (root.chapters as unknown[]) ?? []) {
    const file = 'chapters.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'bookId', 'title', 'description'], file, recordId, issues);
    if (!isPositiveInteger(record.chapterNumber)) issues.push({ file, recordId, message: 'chapterNumber must be a positive integer' });
    if (!isPositiveInteger(record.estimatedMinutes)) issues.push({ file, recordId, message: 'estimatedMinutes must be a positive integer' });
    validateOptionalAudio(record, file, recordId, issues, 'chapterAudioUrl', 'chapterLocalAudioKey');
    if (isNonEmptyString(record.id)) canonical.chapters.push(record as CanonicalContent['chapters'][number]);
  }

  for (const item of (root.lesson_sections as unknown[]) ?? []) {
    const file = 'lesson_sections.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'chapterId', 'heading', 'body'], file, recordId, issues);
    if (!isPositiveInteger(record.orderIndex)) issues.push({ file, recordId, message: 'orderIndex must be a positive integer' });
    if (isNonEmptyString(record.id)) canonical.lesson_sections.push(record as CanonicalContent['lesson_sections'][number]);
  }

  for (const item of (root.flashcards as unknown[]) ?? []) {
    const file = 'flashcards.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'chapterId', 'arabic', 'transliteration', 'meaning', 'example'], file, recordId, issues);
    validateOptionalAudio(record, file, recordId, issues, 'audioUrl', 'localAudioKey');
    if (isNonEmptyString(record.id)) canonical.flashcards.push(record as CanonicalContent['flashcards'][number]);
  }

  for (const item of (root.listening_items as unknown[]) ?? []) {
    const file = 'listening_items.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'chapterId', 'promptText', 'arabic', 'transliteration', 'translation'], file, recordId, issues);
    if (!isPositiveInteger(record.orderIndex)) issues.push({ file, recordId, message: 'orderIndex must be a positive integer' });
    if (!isNonEmptyString(record.difficulty) || !LISTENING_DIFFICULTIES.has(record.difficulty)) {
      issues.push({ file, recordId, message: 'difficulty must be one of easy, medium, hard' });
    }
    validateOptionalAudio(record, file, recordId, issues, 'audioUrl', 'localAudioKey');
    if (isNonEmptyString(record.id)) canonical.listening_items.push(record as CanonicalContent['listening_items'][number]);
  }

  for (const item of (root.quizzes as unknown[]) ?? []) {
    const file = 'quizzes.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'chapterId', 'title'], file, recordId, issues);
    if (isNonEmptyString(record.id)) canonical.quizzes.push(record as CanonicalContent['quizzes'][number]);
  }

  for (const item of (root.questions as unknown[]) ?? []) {
    const file = 'questions.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'quizId', 'prompt', 'optionA', 'optionB', 'optionC', 'optionD', 'explanation'], file, recordId, issues);
    if (!isNonEmptyString(record.correctOption) || !CORRECT_OPTIONS.has(record.correctOption)) {
      issues.push({ file, recordId, message: 'correctOption must be one of A, B, C, D' });
    }
    if (isNonEmptyString(record.id)) canonical.questions.push(record as CanonicalContent['questions'][number]);
  }

  for (const item of (root.videos as unknown[]) ?? []) {
    const file = 'videos.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push({ file, message: 'Each record must be an object' });
      continue;
    }
    const record = item as Record<string, unknown>;
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    requireStringFields(record, ['id', 'chapterId', 'title', 'youtubeUrl'], file, recordId, issues);
    if (!isValidUrl(record.youtubeUrl)) issues.push({ file, recordId, message: 'youtubeUrl must be a valid URL' });
    if (isNonEmptyString(record.id)) canonical.videos.push(record as CanonicalContent['videos'][number]);
  }

  const normalized = normalizeContent(canonical);

  issues.push(...detectDuplicateIds(normalized.books, 'books.json'));
  issues.push(...detectDuplicateIds(normalized.chapters, 'chapters.json'));
  issues.push(...detectDuplicateIds(normalized.lesson_sections, 'lesson_sections.json'));
  issues.push(...detectDuplicateIds(normalized.flashcards, 'flashcards.json'));
  issues.push(...detectDuplicateIds(normalized.listening_items, 'listening_items.json'));
  issues.push(...detectDuplicateIds(normalized.quizzes, 'quizzes.json'));
  issues.push(...detectDuplicateIds(normalized.questions, 'questions.json'));
  issues.push(...detectDuplicateIds(normalized.videos, 'videos.json'));

  const bookIds = new Set(normalized.books.map((item) => item.id));
  const chapterIds = new Set(normalized.chapters.map((item) => item.id));
  const quizIds = new Set(normalized.quizzes.map((item) => item.id));

  for (const chapter of normalized.chapters) {
    if (!bookIds.has(chapter.bookId)) {
      issues.push({ file: 'chapters.json', recordId: chapter.id, message: `Missing parent book "${chapter.bookId}"` });
    }
  }

  for (const section of normalized.lesson_sections) {
    if (!chapterIds.has(section.chapterId)) {
      issues.push({ file: 'lesson_sections.json', recordId: section.id, message: `Missing parent chapter "${section.chapterId}"` });
    }
  }

  for (const flashcard of normalized.flashcards) {
    if (!chapterIds.has(flashcard.chapterId)) {
      issues.push({ file: 'flashcards.json', recordId: flashcard.id, message: `Missing parent chapter "${flashcard.chapterId}"` });
    }
  }

  for (const listeningItem of normalized.listening_items) {
    if (!chapterIds.has(listeningItem.chapterId)) {
      issues.push({ file: 'listening_items.json', recordId: listeningItem.id, message: `Missing parent chapter "${listeningItem.chapterId}"` });
    }
  }

  for (const quiz of normalized.quizzes) {
    if (!chapterIds.has(quiz.chapterId)) {
      issues.push({ file: 'quizzes.json', recordId: quiz.id, message: `Missing parent chapter "${quiz.chapterId}"` });
    }
  }

  for (const question of normalized.questions) {
    if (!quizIds.has(question.quizId)) {
      issues.push({ file: 'questions.json', recordId: question.id, message: `Missing parent quiz "${question.quizId}"` });
    }
  }

  for (const video of normalized.videos) {
    if (!chapterIds.has(video.chapterId)) {
      issues.push({ file: 'videos.json', recordId: video.id, message: `Missing parent chapter "${video.chapterId}"` });
    }
  }

  const chapterNumbersByBook = new Map<string, Set<number>>();
  for (const chapter of normalized.chapters) {
    const chapterNumbers = chapterNumbersByBook.get(chapter.bookId) ?? new Set<number>();
    if (chapterNumbers.has(chapter.chapterNumber)) {
      issues.push({
        file: 'chapters.json',
        recordId: chapter.id,
        message: `Duplicate chapterNumber ${chapter.chapterNumber} inside book "${chapter.bookId}"`,
      });
    }
    chapterNumbers.add(chapter.chapterNumber);
    chapterNumbersByBook.set(chapter.bookId, chapterNumbers);
  }

  return { content: normalized, issues };
}
