export const CONTENT_TYPES = [
  'books',
  'chapters',
  'lesson_sections',
  'flashcards',
  'quizzes',
  'questions',
  'videos',
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationIssue = {
  severity: ValidationSeverity;
  contentType: ContentType;
  recordId: string;
  field: string;
  message: string;
};

export type ValidationContent = {
  books: Array<Record<string, unknown>>;
  chapters: Array<Record<string, unknown>>;
  lesson_sections: Array<Record<string, unknown>>;
  flashcards: Array<Record<string, unknown>>;
  quizzes: Array<Record<string, unknown>>;
  questions: Array<Record<string, unknown>>;
  videos: Array<Record<string, unknown>>;
};

export type ValidationResult = {
  issues: ValidationIssue[];
  bySeverity: Record<ValidationSeverity, ValidationIssue[]>;
  byContentType: Record<ContentType, ValidationIssue[]>;
};

export type UiFormattedIssue = {
  severity: ValidationSeverity;
  title: string;
  subtitle: string;
  contentType: ContentType;
  recordId: string;
  field: string;
};

const CORRECT_OPTIONS = new Set(['A', 'B', 'C', 'D']);
const MIN_FLASHCARDS_PER_CHAPTER = 3;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const asRecordArray = (value: unknown): Array<Record<string, unknown>> =>
  Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      )
    : [];

const emptyValidationContent = (): ValidationContent => ({
  books: [],
  chapters: [],
  lesson_sections: [],
  flashcards: [],
  quizzes: [],
  questions: [],
  videos: [],
});

const toValidationContent = (input: Partial<ValidationContent> | null | undefined): ValidationContent => ({
  books: asRecordArray(input?.books),
  chapters: asRecordArray(input?.chapters),
  lesson_sections: asRecordArray(input?.lesson_sections),
  flashcards: asRecordArray(input?.flashcards),
  quizzes: asRecordArray(input?.quizzes),
  questions: asRecordArray(input?.questions),
  videos: asRecordArray(input?.videos),
});

const getRecordId = (record: Record<string, unknown>): string => {
  const rawId = record.id;
  return isNonEmptyString(rawId) ? rawId : '<missing-id>';
};

const createIssue = (
  severity: ValidationSeverity,
  contentType: ContentType,
  recordId: string,
  field: string,
  message: string,
): ValidationIssue => ({
  severity,
  contentType,
  recordId,
  field,
  message,
});

const getFieldText = (record: Record<string, unknown>, field: string): string => {
  const value = record[field];
  return isNonEmptyString(value) ? value.trim() : '';
};

export const groupIssuesBySeverity = (
  issues: ValidationIssue[],
): Record<ValidationSeverity, ValidationIssue[]> => ({
  error: issues.filter((issue) => issue.severity === 'error'),
  warning: issues.filter((issue) => issue.severity === 'warning'),
  info: issues.filter((issue) => issue.severity === 'info'),
});

export const groupIssuesByContentType = (
  issues: ValidationIssue[],
): Record<ContentType, ValidationIssue[]> => ({
  books: issues.filter((issue) => issue.contentType === 'books'),
  chapters: issues.filter((issue) => issue.contentType === 'chapters'),
  lesson_sections: issues.filter((issue) => issue.contentType === 'lesson_sections'),
  flashcards: issues.filter((issue) => issue.contentType === 'flashcards'),
  quizzes: issues.filter((issue) => issue.contentType === 'quizzes'),
  questions: issues.filter((issue) => issue.contentType === 'questions'),
  videos: issues.filter((issue) => issue.contentType === 'videos'),
});

const REQUIRED_TEXT_FIELDS: Record<ContentType, string[]> = {
  books: ['id', 'slug', 'title', 'subtitle', 'description'],
  chapters: ['id', 'bookId', 'title', 'description'],
  lesson_sections: ['id', 'chapterId', 'heading', 'body'],
  flashcards: ['id', 'chapterId', 'arabic', 'transliteration', 'meaning'],
  quizzes: ['id', 'chapterId', 'title'],
  questions: ['id', 'quizId', 'prompt', 'optionA', 'optionB', 'optionC', 'optionD', 'explanation'],
  videos: ['id', 'chapterId', 'title', 'youtubeUrl'],
};

const collectDuplicates = (records: Array<Record<string, unknown>>, contentType: ContentType): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const recordId = getRecordId(record);
    if (seen.has(recordId)) {
      issues.push(
        createIssue('error', contentType, recordId, 'id', `Duplicate id "${recordId}" found in ${contentType}.`),
      );
    }
    seen.add(recordId);
  }

  return issues;
};

const collectRequiredTextIssues = (
  records: Array<Record<string, unknown>>,
  contentType: ContentType,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  for (const record of records) {
    const recordId = getRecordId(record);
    for (const field of REQUIRED_TEXT_FIELDS[contentType]) {
      if (!isNonEmptyString(record[field])) {
        issues.push(
          createIssue('error', contentType, recordId, field, `Missing required text for "${field}".`),
        );
      }
    }
  }

  return issues;
};

const collectBrokenReferenceIssues = (content: ValidationContent): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const bookIds = new Set(content.books.map(getRecordId));
  const chapterIds = new Set(content.chapters.map(getRecordId));
  const quizIds = new Set(content.quizzes.map(getRecordId));

  for (const chapter of content.chapters) {
    const recordId = getRecordId(chapter);
    const bookId = getFieldText(chapter, 'bookId');

    if (bookId && !bookIds.has(bookId)) {
      issues.push(
        createIssue(
          'error',
          'chapters',
          recordId,
          'bookId',
          `Broken reference: book "${bookId}" was not found.`,
        ),
      );
    }
  }

  for (const section of content.lesson_sections) {
    const recordId = getRecordId(section);
    const chapterId = getFieldText(section, 'chapterId');
    if (chapterId && !chapterIds.has(chapterId)) {
      issues.push(
        createIssue(
          'error',
          'lesson_sections',
          recordId,
          'chapterId',
          `Broken reference: chapter "${chapterId}" was not found.`,
        ),
      );
    }
  }

  for (const flashcard of content.flashcards) {
    const recordId = getRecordId(flashcard);
    const chapterId = getFieldText(flashcard, 'chapterId');
    if (chapterId && !chapterIds.has(chapterId)) {
      issues.push(
        createIssue(
          'error',
          'flashcards',
          recordId,
          'chapterId',
          `Broken reference: chapter "${chapterId}" was not found.`,
        ),
      );
    }
  }

  for (const quiz of content.quizzes) {
    const recordId = getRecordId(quiz);
    const chapterId = getFieldText(quiz, 'chapterId');
    if (chapterId && !chapterIds.has(chapterId)) {
      issues.push(
        createIssue(
          'error',
          'quizzes',
          recordId,
          'chapterId',
          `Broken reference: chapter "${chapterId}" was not found.`,
        ),
      );
    }
  }

  for (const question of content.questions) {
    const recordId = getRecordId(question);
    const quizId = getFieldText(question, 'quizId');
    if (quizId && !quizIds.has(quizId)) {
      issues.push(
        createIssue('error', 'questions', recordId, 'quizId', `Broken reference: quiz "${quizId}" was not found.`),
      );
    }
  }

  for (const video of content.videos) {
    const recordId = getRecordId(video);
    const chapterId = getFieldText(video, 'chapterId');
    if (chapterId && !chapterIds.has(chapterId)) {
      issues.push(
        createIssue(
          'error',
          'videos',
          recordId,
          'chapterId',
          `Broken reference: chapter "${chapterId}" was not found.`,
        ),
      );
    }
  }

  return issues;
};

const collectInvalidCorrectOptionIssues = (questions: Array<Record<string, unknown>>): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  for (const question of questions) {
    const recordId = getRecordId(question);
    const option = getFieldText(question, 'correctOption');
    if (!CORRECT_OPTIONS.has(option)) {
      issues.push(
        createIssue(
          'error',
          'questions',
          recordId,
          'correctOption',
          'Invalid correctOption. Expected one of: A, B, C, D.',
        ),
      );
    }
  }

  return issues;
};

const collectInvalidChapterBookRelationIssues = (
  chapters: Array<Record<string, unknown>>,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const chapterNumbersByBook = new Map<string, Set<number>>();

  for (const chapter of chapters) {
    const recordId = getRecordId(chapter);
    const bookId = getFieldText(chapter, 'bookId');
    const chapterNumberValue = chapter.chapterNumber;
    const chapterNumber = typeof chapterNumberValue === 'number' ? chapterNumberValue : Number.NaN;

    if (!bookId || !Number.isInteger(chapterNumber) || chapterNumber <= 0) {
      continue;
    }

    const existing = chapterNumbersByBook.get(bookId) ?? new Set<number>();
    if (existing.has(chapterNumber)) {
      issues.push(
        createIssue(
          'error',
          'chapters',
          recordId,
          'chapterNumber',
          `Invalid chapter-book relation: chapterNumber ${chapterNumber} is duplicated in book "${bookId}".`,
        ),
      );
    }

    existing.add(chapterNumber);
    chapterNumbersByBook.set(bookId, existing);
  }

  return issues;
};

const collectWarningIssues = (content: ValidationContent): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const quizzesByChapter = new Map<string, number>();
  const flashcardsByChapter = new Map<string, number>();
  const videosByChapter = new Map<string, number>();

  for (const quiz of content.quizzes) {
    const chapterId = getFieldText(quiz, 'chapterId');
    if (!chapterId) continue;
    quizzesByChapter.set(chapterId, (quizzesByChapter.get(chapterId) ?? 0) + 1);
  }

  for (const flashcard of content.flashcards) {
    const chapterId = getFieldText(flashcard, 'chapterId');
    if (!chapterId) continue;
    flashcardsByChapter.set(chapterId, (flashcardsByChapter.get(chapterId) ?? 0) + 1);
  }

  for (const video of content.videos) {
    const chapterId = getFieldText(video, 'chapterId');
    if (!chapterId) continue;
    videosByChapter.set(chapterId, (videosByChapter.get(chapterId) ?? 0) + 1);
  }

  for (const chapter of content.chapters) {
    const chapterId = getRecordId(chapter);
    if (!quizzesByChapter.get(chapterId)) {
      issues.push(
        createIssue('warning', 'quizzes', chapterId, 'chapterId', `Missing quiz for chapter "${chapterId}".`),
      );
    }

    if ((flashcardsByChapter.get(chapterId) ?? 0) < MIN_FLASHCARDS_PER_CHAPTER) {
      issues.push(
        createIssue(
          'warning',
          'flashcards',
          chapterId,
          'chapterId',
          `Too few flashcards for chapter "${chapterId}" (minimum ${MIN_FLASHCARDS_PER_CHAPTER}).`,
        ),
      );
    }

    if (!videosByChapter.get(chapterId)) {
      issues.push(
        createIssue('warning', 'videos', chapterId, 'chapterId', `No videos found for chapter "${chapterId}".`),
      );
    }
  }

  for (const flashcard of content.flashcards) {
    const recordId = getRecordId(flashcard);

    if (!isNonEmptyString(flashcard.example)) {
      issues.push(createIssue('warning', 'flashcards', recordId, 'example', 'Missing flashcard example.'));
    }

    const audioUrl = getFieldText(flashcard, 'audioUrl');
    const audioDurationMs = flashcard.audioDurationMs;
    const hasAudioDuration = typeof audioDurationMs === 'number' && Number.isFinite(audioDurationMs) && audioDurationMs > 0;

    if (!audioUrl || !hasAudioDuration) {
      issues.push(
        createIssue(
          'warning',
          'flashcards',
          recordId,
          'audioMetadata',
          'Missing audio metadata (expected audioUrl and audioDurationMs).',
        ),
      );
    }
  }

  return issues;
};

const collectInfoIssues = (content: ValidationContent): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const questionsPerQuiz = new Map<string, number>();
  for (const question of content.questions) {
    const quizId = getFieldText(question, 'quizId');
    if (!quizId) continue;
    questionsPerQuiz.set(quizId, (questionsPerQuiz.get(quizId) ?? 0) + 1);
  }

  for (const quiz of content.quizzes) {
    const quizId = getRecordId(quiz);
    const questionCount = questionsPerQuiz.get(quizId) ?? 0;
    if (questionCount > 0 && questionCount < 3) {
      issues.push(
        createIssue(
          'info',
          'quizzes',
          quizId,
          'questions',
          `Quiz "${quizId}" has only ${questionCount} question(s); consider adding more for better coverage.`,
        ),
      );
    }
  }

  const sectionsPerChapter = new Map<string, number>();
  for (const section of content.lesson_sections) {
    const chapterId = getFieldText(section, 'chapterId');
    if (!chapterId) continue;
    sectionsPerChapter.set(chapterId, (sectionsPerChapter.get(chapterId) ?? 0) + 1);
  }

  for (const chapter of content.chapters) {
    const chapterId = getRecordId(chapter);
    if ((sectionsPerChapter.get(chapterId) ?? 0) < 2) {
      issues.push(
        createIssue(
          'info',
          'lesson_sections',
          chapterId,
          'chapterId',
          `Chapter "${chapterId}" has fewer than 2 lesson sections.`,
        ),
      );
    }
  }

  return issues;
};

export const validateContent = (input: Partial<ValidationContent> | null | undefined): ValidationResult => {
  const content = input ? toValidationContent(input) : emptyValidationContent();

  const issues = [
    ...collectDuplicates(content.books, 'books'),
    ...collectDuplicates(content.chapters, 'chapters'),
    ...collectDuplicates(content.lesson_sections, 'lesson_sections'),
    ...collectDuplicates(content.flashcards, 'flashcards'),
    ...collectDuplicates(content.quizzes, 'quizzes'),
    ...collectDuplicates(content.questions, 'questions'),
    ...collectDuplicates(content.videos, 'videos'),
    ...collectRequiredTextIssues(content.books, 'books'),
    ...collectRequiredTextIssues(content.chapters, 'chapters'),
    ...collectRequiredTextIssues(content.lesson_sections, 'lesson_sections'),
    ...collectRequiredTextIssues(content.flashcards, 'flashcards'),
    ...collectRequiredTextIssues(content.quizzes, 'quizzes'),
    ...collectRequiredTextIssues(content.questions, 'questions'),
    ...collectRequiredTextIssues(content.videos, 'videos'),
    ...collectBrokenReferenceIssues(content),
    ...collectInvalidCorrectOptionIssues(content.questions),
    ...collectInvalidChapterBookRelationIssues(content.chapters),
    ...collectWarningIssues(content),
    ...collectInfoIssues(content),
  ];

  return {
    issues,
    bySeverity: groupIssuesBySeverity(issues),
    byContentType: groupIssuesByContentType(issues),
  };
};

export const formatIssuesForCli = (issues: ValidationIssue[]): string =>
  issues
    .map(
      (issue) =>
        `[${issue.severity.toUpperCase()}] ${issue.contentType}:${issue.recordId} (${issue.field}) ${issue.message}`,
    )
    .join('\n');

export const formatIssuesForUi = (issues: ValidationIssue[]): UiFormattedIssue[] =>
  issues.map((issue) => ({
    severity: issue.severity,
    contentType: issue.contentType,
    recordId: issue.recordId,
    field: issue.field,
    title: `${issue.contentType} • ${issue.recordId}`,
    subtitle: issue.message,
  }));
