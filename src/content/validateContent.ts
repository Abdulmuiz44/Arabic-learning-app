import { CanonicalContent } from './schemas';

export type ValidationIssue = {
  file: string;
  recordId?: string;
  message: string;
};

const CORRECT_OPTIONS = new Set(['A', 'B', 'C', 'D']);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

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

function validateArray(raw: Record<string, unknown>, key: keyof CanonicalContent, issues: ValidationIssue[]): unknown[] {
  const value = raw[key];
  if (!Array.isArray(value)) {
    issues.push({ file: `${key}.json`, message: 'Expected top-level array' });
    return [];
  }
  return value;
}

function ensureRequiredStrings(
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

export function validateContent(raw: unknown): { content: CanonicalContent | null; issues: ValidationIssue[] } {
  const root = asRecord(raw);
  const issues: ValidationIssue[] = [];
  if (!root) {
    return { content: null, issues: [{ file: 'content', message: 'Content root must be an object' }] };
  }

  const books = validateArray(root, 'books', issues);
  const chapters = validateArray(root, 'chapters', issues);
  const lesson_sections = validateArray(root, 'lesson_sections', issues);
  const flashcards = validateArray(root, 'flashcards', issues);
  const quizzes = validateArray(root, 'quizzes', issues);
  const questions = validateArray(root, 'questions', issues);
  const videos = validateArray(root, 'videos', issues);

  const canonical: CanonicalContent = {
    books: [], chapters: [], lesson_sections: [], flashcards: [], quizzes: [], questions: [], videos: [],
  };

  for (const item of books) {
    const record = asRecord(item); const file = 'books.json';
    if (!record) { issues.push({ file, message: 'Each record must be an object' }); continue; }
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    ensureRequiredStrings(record, ['id', 'slug', 'title', 'subtitle', 'description', 'coverColor'], file, recordId, issues);
    if (!isNonNegativeInteger(record.sortOrder)) issues.push({ file, recordId, message: 'sortOrder must be a non-negative integer' });
    if (!isNonEmptyString(record.coverColor) || !/^#[0-9A-Fa-f]{6}$/.test(record.coverColor)) issues.push({ file, recordId, message: 'coverColor must be hex like #AABBCC' });
    if (issues.length === 0 || isNonEmptyString(record.id)) canonical.books.push(record as unknown as CanonicalContent['books'][number]);
  }

  for (const item of chapters) {
    const record = asRecord(item); const file = 'chapters.json';
    if (!record) { issues.push({ file, message: 'Each record must be an object' }); continue; }
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    ensureRequiredStrings(record, ['id', 'bookId', 'title', 'description'], file, recordId, issues);
    if (!isPositiveInteger(record.chapterNumber)) issues.push({ file, recordId, message: 'chapterNumber must be a positive integer' });
    if (!isPositiveInteger(record.estimatedMinutes)) issues.push({ file, recordId, message: 'estimatedMinutes must be a positive integer' });
    if (isNonEmptyString(record.id)) canonical.chapters.push(record as unknown as CanonicalContent['chapters'][number]);
  }

  for (const item of lesson_sections) {
    const record = asRecord(item); const file = 'lesson_sections.json';
    if (!record) { issues.push({ file, message: 'Each record must be an object' }); continue; }
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    ensureRequiredStrings(record, ['id', 'chapterId', 'heading', 'body'], file, recordId, issues);
    if (!isPositiveInteger(record.orderIndex)) issues.push({ file, recordId, message: 'orderIndex must be a positive integer' });
    if (isNonEmptyString(record.id)) canonical.lesson_sections.push(record as unknown as CanonicalContent['lesson_sections'][number]);
  }

  for (const item of flashcards) {
    const record = asRecord(item); const file = 'flashcards.json';
    if (!record) { issues.push({ file, message: 'Each record must be an object' }); continue; }
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    ensureRequiredStrings(record, ['id', 'chapterId', 'arabic', 'transliteration', 'meaning', 'example'], file, recordId, issues);
    if (isNonEmptyString(record.id)) canonical.flashcards.push(record as unknown as CanonicalContent['flashcards'][number]);
  }

  for (const item of quizzes) {
    const record = asRecord(item); const file = 'quizzes.json';
    if (!record) { issues.push({ file, message: 'Each record must be an object' }); continue; }
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    ensureRequiredStrings(record, ['id', 'chapterId', 'title'], file, recordId, issues);
    if (isNonEmptyString(record.id)) canonical.quizzes.push(record as unknown as CanonicalContent['quizzes'][number]);
  }

  for (const item of questions) {
    const record = asRecord(item); const file = 'questions.json';
    if (!record) { issues.push({ file, message: 'Each record must be an object' }); continue; }
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    ensureRequiredStrings(record, ['id', 'quizId', 'prompt', 'optionA', 'optionB', 'optionC', 'optionD', 'explanation'], file, recordId, issues);
    if (!isNonEmptyString(record.correctOption) || !CORRECT_OPTIONS.has(record.correctOption)) issues.push({ file, recordId, message: 'correctOption must be one of A, B, C, D' });
    if (isNonEmptyString(record.id)) canonical.questions.push(record as unknown as CanonicalContent['questions'][number]);
  }

  for (const item of videos) {
    const record = asRecord(item); const file = 'videos.json';
    if (!record) { issues.push({ file, message: 'Each record must be an object' }); continue; }
    const recordId = typeof record.id === 'string' ? record.id : undefined;
    ensureRequiredStrings(record, ['id', 'chapterId', 'title', 'youtubeUrl'], file, recordId, issues);
    if (!isValidUrl(record.youtubeUrl)) issues.push({ file, recordId, message: 'youtubeUrl must be a valid URL' });
    if (isNonEmptyString(record.id)) canonical.videos.push(record as unknown as CanonicalContent['videos'][number]);
  }

  const normalized = normalizeContent(canonical);

  issues.push(...detectDuplicateIds(normalized.books, 'books.json'));
  issues.push(...detectDuplicateIds(normalized.chapters, 'chapters.json'));
  issues.push(...detectDuplicateIds(normalized.lesson_sections, 'lesson_sections.json'));
  issues.push(...detectDuplicateIds(normalized.flashcards, 'flashcards.json'));
  issues.push(...detectDuplicateIds(normalized.quizzes, 'quizzes.json'));
  issues.push(...detectDuplicateIds(normalized.questions, 'questions.json'));
  issues.push(...detectDuplicateIds(normalized.videos, 'videos.json'));

  const bookIds = new Set(normalized.books.map((v) => v.id));
  const chapterIds = new Set(normalized.chapters.map((v) => v.id));
  const quizIds = new Set(normalized.quizzes.map((v) => v.id));

  for (const chapter of normalized.chapters) {
    if (!bookIds.has(chapter.bookId)) issues.push({ file: 'chapters.json', recordId: chapter.id, message: `Missing parent book "${chapter.bookId}"` });
  }
  for (const section of normalized.lesson_sections) {
    if (!chapterIds.has(section.chapterId)) issues.push({ file: 'lesson_sections.json', recordId: section.id, message: `Missing parent chapter "${section.chapterId}"` });
  }
  for (const flashcard of normalized.flashcards) {
    if (!chapterIds.has(flashcard.chapterId)) issues.push({ file: 'flashcards.json', recordId: flashcard.id, message: `Missing parent chapter "${flashcard.chapterId}"` });
  }
  for (const quiz of normalized.quizzes) {
    if (!chapterIds.has(quiz.chapterId)) issues.push({ file: 'quizzes.json', recordId: quiz.id, message: `Missing parent chapter "${quiz.chapterId}"` });
  }
  for (const question of normalized.questions) {
    if (!quizIds.has(question.quizId)) issues.push({ file: 'questions.json', recordId: question.id, message: `Missing parent quiz "${question.quizId}"` });
  }
  for (const video of normalized.videos) {
    if (!chapterIds.has(video.chapterId)) issues.push({ file: 'videos.json', recordId: video.id, message: `Missing parent chapter "${video.chapterId}"` });
  }

  const chapterNumbersByBook = new Map<string, Set<number>>();
  for (const chapter of normalized.chapters) {
    const set = chapterNumbersByBook.get(chapter.bookId) ?? new Set<number>();
    if (set.has(chapter.chapterNumber)) {
      issues.push({ file: 'chapters.json', recordId: chapter.id, message: `Duplicate chapterNumber ${chapter.chapterNumber} inside book "${chapter.bookId}"` });
    }
    set.add(chapter.chapterNumber);
    chapterNumbersByBook.set(chapter.bookId, set);
  }

  return { content: normalized, issues };
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((issue) => `- ${issue.file}${issue.recordId ? ` [${issue.recordId}]` : ''}: ${issue.message}`).join('\n');
}
