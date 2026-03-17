export const CONTENT_KEYS = ['books', 'chapters', 'lesson_sections', 'flashcards', 'quizzes', 'questions', 'videos'];

const CORRECT_OPTIONS = new Set(['A', 'B', 'C', 'D']);

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isPositiveInt = (v) => Number.isInteger(v) && v > 0;
const isNonNegativeInt = (v) => Number.isInteger(v) && v >= 0;

const normalizeText = (value) => value.replace(/\s+/g, ' ').trim();

const normalizeEntity = (item) => {
  const out = { ...item };
  for (const [k, v] of Object.entries(out)) if (typeof v === 'string') out[k] = normalizeText(v);
  return out;
};

const contentTypeFromFile = (file) => file.replace('.json', '');

const createIssue = ({ severity = 'error', file, recordId, message }) => ({
  severity,
  file,
  contentType: contentTypeFromFile(file),
  recordId,
  message,
});

const pushIssue = (issues, issue) => issues.push(createIssue(issue));

export function normalizeContent(content) {
  return {
    books: content.books.map(normalizeEntity).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    chapters: content.chapters.map(normalizeEntity).sort((a, b) => a.bookId.localeCompare(b.bookId) || a.chapterNumber - b.chapterNumber || a.id.localeCompare(b.id)),
    lesson_sections: content.lesson_sections.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.orderIndex - b.orderIndex || a.id.localeCompare(b.id)),
    flashcards: content.flashcards.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
    quizzes: content.quizzes.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
    questions: content.questions.map(normalizeEntity).sort((a, b) => a.quizId.localeCompare(b.quizId) || a.id.localeCompare(b.id)),
    videos: content.videos.map(normalizeEntity).sort((a, b) => a.chapterId.localeCompare(b.chapterId) || a.id.localeCompare(b.id)),
  };
}

const duplicateIssues = (items, file) => {
  const seen = new Set();
  const issues = [];
  for (const item of items) {
    if (seen.has(item.id)) pushIssue(issues, { file, recordId: item.id, message: `Duplicate id "${item.id}" found` });
    seen.add(item.id);
  }
  return issues;
};

const requireStrings = (record, fields, file, recordId, issues) => {
  for (const field of fields) {
    if (!isNonEmptyString(record[field])) {
      pushIssue(issues, { file, recordId, message: `${field} is required and must be a non-empty string` });
    }
  }
};

const validUrl = (value) => {
  if (!isNonEmptyString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export function validateContent(raw) {
  const issues = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { content: null, issues: [createIssue({ file: 'content.json', message: 'Content root must be an object' })] };
  }

  const canonical = {};
  for (const key of CONTENT_KEYS) {
    const arr = raw[key];
    if (!Array.isArray(arr)) {
      pushIssue(issues, { file: `${key}.json`, message: 'Expected top-level array' });
      canonical[key] = [];
      continue;
    }
    canonical[key] = [];
  }

  for (const item of raw.books || []) {
    const file = 'books.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(issues, { file, message: 'Each record must be an object' });
      continue;
    }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item, ['id', 'slug', 'title', 'subtitle', 'description', 'coverColor'], file, recordId, issues);
    if (!isNonNegativeInt(item.sortOrder)) pushIssue(issues, { file, recordId, message: 'sortOrder must be a non-negative integer' });
    if (!isNonEmptyString(item.coverColor) || !/^#[0-9A-Fa-f]{6}$/.test(item.coverColor)) pushIssue(issues, { file, recordId, message: 'coverColor must be hex like #AABBCC' });
    if (isNonEmptyString(item.id)) canonical.books.push(item);
  }

  for (const item of raw.chapters || []) {
    const file = 'chapters.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(issues, { file, message: 'Each record must be an object' });
      continue;
    }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item, ['id', 'bookId', 'title', 'description'], file, recordId, issues);
    if (!isPositiveInt(item.chapterNumber)) pushIssue(issues, { file, recordId, message: 'chapterNumber must be a positive integer' });
    if (!isPositiveInt(item.estimatedMinutes)) pushIssue(issues, { file, recordId, message: 'estimatedMinutes must be a positive integer' });
    if (isNonEmptyString(item.id)) canonical.chapters.push(item);
  }

  for (const item of raw.lesson_sections || []) {
    const file = 'lesson_sections.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(issues, { file, message: 'Each record must be an object' });
      continue;
    }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item, ['id', 'chapterId', 'heading', 'body'], file, recordId, issues);
    if (!isPositiveInt(item.orderIndex)) pushIssue(issues, { file, recordId, message: 'orderIndex must be a positive integer' });
    if (isNonEmptyString(item.id)) canonical.lesson_sections.push(item);
  }

  for (const item of raw.flashcards || []) {
    const file = 'flashcards.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(issues, { file, message: 'Each record must be an object' });
      continue;
    }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item, ['id', 'chapterId', 'arabic', 'transliteration', 'meaning', 'example'], file, recordId, issues);
    if (isNonEmptyString(item.id)) canonical.flashcards.push(item);
  }

  for (const item of raw.quizzes || []) {
    const file = 'quizzes.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(issues, { file, message: 'Each record must be an object' });
      continue;
    }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item, ['id', 'chapterId', 'title'], file, recordId, issues);
    if (isNonEmptyString(item.id)) canonical.quizzes.push(item);
  }

  for (const item of raw.questions || []) {
    const file = 'questions.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(issues, { file, message: 'Each record must be an object' });
      continue;
    }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item, ['id', 'quizId', 'prompt', 'optionA', 'optionB', 'optionC', 'optionD', 'explanation'], file, recordId, issues);
    if (!isNonEmptyString(item.correctOption) || !CORRECT_OPTIONS.has(item.correctOption)) pushIssue(issues, { file, recordId, message: 'correctOption must be one of A, B, C, D' });
    if (isNonEmptyString(item.id)) canonical.questions.push(item);
  }

  for (const item of raw.videos || []) {
    const file = 'videos.json';
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      pushIssue(issues, { file, message: 'Each record must be an object' });
      continue;
    }
    const recordId = typeof item.id === 'string' ? item.id : undefined;
    requireStrings(item, ['id', 'chapterId', 'title', 'youtubeUrl'], file, recordId, issues);
    if (!validUrl(item.youtubeUrl)) pushIssue(issues, { file, recordId, message: 'youtubeUrl must be a valid URL' });
    if (isNonEmptyString(item.id)) canonical.videos.push(item);
  }

  const normalized = normalizeContent(canonical);
  issues.push(...duplicateIssues(normalized.books, 'books.json'));
  issues.push(...duplicateIssues(normalized.chapters, 'chapters.json'));
  issues.push(...duplicateIssues(normalized.lesson_sections, 'lesson_sections.json'));
  issues.push(...duplicateIssues(normalized.flashcards, 'flashcards.json'));
  issues.push(...duplicateIssues(normalized.quizzes, 'quizzes.json'));
  issues.push(...duplicateIssues(normalized.questions, 'questions.json'));
  issues.push(...duplicateIssues(normalized.videos, 'videos.json'));

  const bookIds = new Set(normalized.books.map((x) => x.id));
  const chapterIds = new Set(normalized.chapters.map((x) => x.id));
  const quizIds = new Set(normalized.quizzes.map((x) => x.id));

  for (const x of normalized.chapters) if (!bookIds.has(x.bookId)) pushIssue(issues, { file: 'chapters.json', recordId: x.id, message: `Missing parent book "${x.bookId}"` });
  for (const x of normalized.lesson_sections) if (!chapterIds.has(x.chapterId)) pushIssue(issues, { file: 'lesson_sections.json', recordId: x.id, message: `Missing parent chapter "${x.chapterId}"` });
  for (const x of normalized.flashcards) if (!chapterIds.has(x.chapterId)) pushIssue(issues, { file: 'flashcards.json', recordId: x.id, message: `Missing parent chapter "${x.chapterId}"` });
  for (const x of normalized.quizzes) if (!chapterIds.has(x.chapterId)) pushIssue(issues, { file: 'quizzes.json', recordId: x.id, message: `Missing parent chapter "${x.chapterId}"` });
  for (const x of normalized.questions) if (!quizIds.has(x.quizId)) pushIssue(issues, { file: 'questions.json', recordId: x.id, message: `Missing parent quiz "${x.quizId}"` });
  for (const x of normalized.videos) if (!chapterIds.has(x.chapterId)) pushIssue(issues, { file: 'videos.json', recordId: x.id, message: `Missing parent chapter "${x.chapterId}"` });

  const chapterNumbersByBook = new Map();
  for (const chapter of normalized.chapters) {
    const set = chapterNumbersByBook.get(chapter.bookId) || new Set();
    if (set.has(chapter.chapterNumber)) pushIssue(issues, { file: 'chapters.json', recordId: chapter.id, message: `Duplicate chapterNumber ${chapter.chapterNumber} inside book "${chapter.bookId}"` });
    set.add(chapter.chapterNumber);
    chapterNumbersByBook.set(chapter.bookId, set);
  }

  const chaptersByBook = new Map();
  for (const chapter of normalized.chapters) {
    const list = chaptersByBook.get(chapter.bookId) || [];
    list.push(chapter);
    chaptersByBook.set(chapter.bookId, list);
  }

  const sectionsByChapter = new Map();
  for (const section of normalized.lesson_sections) {
    sectionsByChapter.set(section.chapterId, (sectionsByChapter.get(section.chapterId) || 0) + 1);
  }

  const flashcardsByChapter = new Map();
  for (const flashcard of normalized.flashcards) {
    flashcardsByChapter.set(flashcard.chapterId, (flashcardsByChapter.get(flashcard.chapterId) || 0) + 1);
  }

  const quizzesByChapter = new Map();
  for (const quiz of normalized.quizzes) {
    quizzesByChapter.set(quiz.chapterId, (quizzesByChapter.get(quiz.chapterId) || 0) + 1);
  }

  const questionsByQuiz = new Map();
  for (const question of normalized.questions) {
    questionsByQuiz.set(question.quizId, (questionsByQuiz.get(question.quizId) || 0) + 1);
  }

  for (const book of normalized.books) {
    if (!chaptersByBook.has(book.id)) {
      pushIssue(issues, { severity: 'warning', file: 'books.json', recordId: book.id, message: 'Book has no chapters yet' });
    }
  }

  for (const chapter of normalized.chapters) {
    if (!sectionsByChapter.has(chapter.id)) pushIssue(issues, { severity: 'warning', file: 'lesson_sections.json', recordId: chapter.id, message: 'Chapter has no lesson sections' });
    if (!flashcardsByChapter.has(chapter.id)) pushIssue(issues, { severity: 'warning', file: 'flashcards.json', recordId: chapter.id, message: 'Chapter has no flashcards' });
    if (!quizzesByChapter.has(chapter.id)) pushIssue(issues, { severity: 'warning', file: 'quizzes.json', recordId: chapter.id, message: 'Chapter has no quizzes' });
  }

  for (const quiz of normalized.quizzes) {
    if (!questionsByQuiz.has(quiz.id)) pushIssue(issues, { severity: 'warning', file: 'questions.json', recordId: quiz.id, message: 'Quiz has no questions' });
  }

  return { content: normalized, issues };
}

export const issueCountsBySeverity = (issues) => {
  const counts = { error: 0, warning: 0 };
  for (const issue of issues) counts[issue.severity] = (counts[issue.severity] || 0) + 1;
  return counts;
};

export const groupIssuesBySeverityAndType = (issues) => {
  const grouped = new Map();
  for (const issue of issues) {
    const severityBucket = grouped.get(issue.severity) || new Map();
    const typeBucket = severityBucket.get(issue.contentType) || [];
    typeBucket.push(issue);
    severityBucket.set(issue.contentType, typeBucket);
    grouped.set(issue.severity, severityBucket);
  }
  return grouped;
};

export const formatGroupedIssues = (issues) => {
  if (!issues.length) return 'No validation issues found.';

  const grouped = groupIssuesBySeverityAndType(issues);
  const severities = ['error', 'warning'];
  const lines = [];

  for (const severity of severities) {
    const byType = grouped.get(severity);
    if (!byType) continue;
    lines.push(`${severity.toUpperCase()}S:`);
    const sortedTypes = [...byType.keys()].sort();
    for (const type of sortedTypes) {
      lines.push(`  ${type}:`);
      for (const issue of byType.get(type)) {
        lines.push(`    - ${issue.file}${issue.recordId ? ` [${issue.recordId}]` : ''}: ${issue.message}`);
      }
    }
  }

  return lines.join('\n');
};

export const formatIssues = formatGroupedIssues;
