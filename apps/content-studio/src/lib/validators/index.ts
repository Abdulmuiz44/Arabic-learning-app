export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ContentType =
  | 'books'
  | 'chapters'
  | 'lesson_sections'
  | 'flashcards'
  | 'quizzes'
  | 'questions'
  | 'videos';

export type ValidationIssue = {
  severity: ValidationSeverity;
  contentType: ContentType;
  recordId: string;
  field: string;
  message: string;
};

export type BookRecord = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
};

export type ChapterRecord = {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  description: string;
  estimatedMinutes?: number;
};

export type LessonSectionRecord = {
  id: string;
  chapterId: string;
  heading: string;
  body: string;
};

export type FlashcardRecord = {
  id: string;
  chapterId: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  example?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
};

export type QuizRecord = {
  id: string;
  chapterId: string;
  title: string;
};

export type QuestionRecord = {
  id: string;
  quizId: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D' | string;
  explanation: string;
};

export type VideoRecord = {
  id: string;
  chapterId: string;
  title: string;
  youtubeUrl: string;
};

export type ValidationContent = {
  books: BookRecord[];
  chapters: ChapterRecord[];
  lesson_sections: LessonSectionRecord[];
  flashcards: FlashcardRecord[];
  quizzes: QuizRecord[];
  questions: QuestionRecord[];
  videos: VideoRecord[];
};

export type ValidationResult = {
  issues: ValidationIssue[];
  bySeverity: Record<ValidationSeverity, ValidationIssue[]>;
  byContentType: Record<ContentType, ValidationIssue[]>;
};

const CONTENT_TYPES: ContentType[] = [
  'books',
  'chapters',
  'lesson_sections',
  'flashcards',
  'quizzes',
  'questions',
  'videos',
];

const REQUIRED_TEXT_FIELDS: Record<ContentType, string[]> = {
  books: ['id', 'slug', 'title', 'subtitle', 'description'],
  chapters: ['id', 'bookId', 'title', 'description'],
  lesson_sections: ['id', 'chapterId', 'heading', 'body'],
  flashcards: ['id', 'chapterId', 'arabic', 'transliteration', 'meaning'],
  quizzes: ['id', 'chapterId', 'title'],
  questions: ['id', 'quizId', 'prompt', 'optionA', 'optionB', 'optionC', 'optionD', 'explanation'],
  videos: ['id', 'chapterId', 'title', 'youtubeUrl'],
};

const isTextPresent = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0;

const baseResult = (): ValidationResult => ({
  issues: [],
  bySeverity: { error: [], warning: [], info: [] },
  byContentType: {
    books: [],
    chapters: [],
    lesson_sections: [],
    flashcards: [],
    quizzes: [],
    questions: [],
    videos: [],
  },
});

export const groupIssuesBySeverity = (issues: ValidationIssue[]): ValidationResult['bySeverity'] => ({
  error: issues.filter((issue) => issue.severity === 'error'),
  warning: issues.filter((issue) => issue.severity === 'warning'),
  info: issues.filter((issue) => issue.severity === 'info'),
});

export const groupIssuesByContentType = (issues: ValidationIssue[]): ValidationResult['byContentType'] => ({
  books: issues.filter((issue) => issue.contentType === 'books'),
  chapters: issues.filter((issue) => issue.contentType === 'chapters'),
  lesson_sections: issues.filter((issue) => issue.contentType === 'lesson_sections'),
  flashcards: issues.filter((issue) => issue.contentType === 'flashcards'),
  quizzes: issues.filter((issue) => issue.contentType === 'quizzes'),
  questions: issues.filter((issue) => issue.contentType === 'questions'),
  videos: issues.filter((issue) => issue.contentType === 'videos'),
});

const toContent = (content: Partial<ValidationContent>): ValidationContent => ({
  books: content.books ?? [],
  chapters: content.chapters ?? [],
  lesson_sections: content.lesson_sections ?? [],
  flashcards: content.flashcards ?? [],
  quizzes: content.quizzes ?? [],
  questions: content.questions ?? [],
  videos: content.videos ?? [],
});

export const validateContent = (rawContent: Partial<ValidationContent>): ValidationResult => {
  const content = toContent(rawContent);
  const result = baseResult();

  const pushIssue = (issue: ValidationIssue): void => {
    result.issues.push(issue);
  };

  for (const contentType of CONTENT_TYPES) {
    const items = content[contentType] as Array<Record<string, unknown>>;
    const idSet = new Set<string>();

    for (const item of items) {
      const recordId = isTextPresent(item.id) ? String(item.id) : '__missing_id__';

      for (const field of REQUIRED_TEXT_FIELDS[contentType]) {
        if (!isTextPresent(item[field])) {
          pushIssue({
            severity: 'error',
            contentType,
            recordId,
            field,
            message: `Missing required text for "${field}".`,
          });
        }
      }

      if (isTextPresent(item.id)) {
        const id = String(item.id);
        if (idSet.has(id)) {
          pushIssue({
            severity: 'error',
            contentType,
            recordId: id,
            field: 'id',
            message: `Duplicate ID "${id}".`,
          });
        }
        idSet.add(id);
      }
    }
  }

  const bookIds = new Set(content.books.map((book) => book.id));
  const chapterIds = new Set(content.chapters.map((chapter) => chapter.id));
  const quizIds = new Set(content.quizzes.map((quiz) => quiz.id));

  for (const chapter of content.chapters) {
    if (!bookIds.has(chapter.bookId)) {
      pushIssue({
        severity: 'error',
        contentType: 'chapters',
        recordId: chapter.id,
        field: 'bookId',
        message: `Invalid chapter-book relation: missing book "${chapter.bookId}".`,
      });
    }
  }

  const chapterNumbersByBook = new Map<string, Set<number>>();
  for (const chapter of content.chapters) {
    const numbers = chapterNumbersByBook.get(chapter.bookId) ?? new Set<number>();
    if (numbers.has(chapter.chapterNumber)) {
      pushIssue({
        severity: 'error',
        contentType: 'chapters',
        recordId: chapter.id,
        field: 'chapterNumber',
        message: `Invalid chapter-book relation: duplicate chapterNumber ${chapter.chapterNumber} in book "${chapter.bookId}".`,
      });
    }
    numbers.add(chapter.chapterNumber);
    chapterNumbersByBook.set(chapter.bookId, numbers);
  }

  for (const section of content.lesson_sections) {
    if (!chapterIds.has(section.chapterId)) {
      pushIssue({
        severity: 'error',
        contentType: 'lesson_sections',
        recordId: section.id,
        field: 'chapterId',
        message: `Broken reference: chapter "${section.chapterId}" not found.`,
      });
    }
  }

  for (const flashcard of content.flashcards) {
    if (!chapterIds.has(flashcard.chapterId)) {
      pushIssue({
        severity: 'error',
        contentType: 'flashcards',
        recordId: flashcard.id,
        field: 'chapterId',
        message: `Broken reference: chapter "${flashcard.chapterId}" not found.`,
      });
    }

    if (!isTextPresent(flashcard.example)) {
      pushIssue({
        severity: 'warning',
        contentType: 'flashcards',
        recordId: flashcard.id,
        field: 'example',
        message: 'Missing flashcard example sentence.',
      });
    }

    if (!isTextPresent(flashcard.audioUrl) || typeof flashcard.audioDurationSeconds !== 'number' || flashcard.audioDurationSeconds <= 0) {
      pushIssue({
        severity: 'warning',
        contentType: 'flashcards',
        recordId: flashcard.id,
        field: 'audioUrl',
        message: 'Missing audio metadata (audioUrl and positive audioDurationSeconds).',
      });
    }
  }

  for (const quiz of content.quizzes) {
    if (!chapterIds.has(quiz.chapterId)) {
      pushIssue({
        severity: 'error',
        contentType: 'quizzes',
        recordId: quiz.id,
        field: 'chapterId',
        message: `Broken reference: chapter "${quiz.chapterId}" not found.`,
      });
    }
  }

  for (const question of content.questions) {
    if (!quizIds.has(question.quizId)) {
      pushIssue({
        severity: 'error',
        contentType: 'questions',
        recordId: question.id,
        field: 'quizId',
        message: `Broken reference: quiz "${question.quizId}" not found.`,
      });
    }

    if (!['A', 'B', 'C', 'D'].includes(question.correctOption)) {
      pushIssue({
        severity: 'error',
        contentType: 'questions',
        recordId: question.id,
        field: 'correctOption',
        message: 'Invalid correctOption; expected one of A, B, C, or D.',
      });
    }
  }

  for (const video of content.videos) {
    if (!chapterIds.has(video.chapterId)) {
      pushIssue({
        severity: 'error',
        contentType: 'videos',
        recordId: video.id,
        field: 'chapterId',
        message: `Broken reference: chapter "${video.chapterId}" not found.`,
      });
    }
  }

  for (const chapter of content.chapters) {
    if (!content.quizzes.some((quiz) => quiz.chapterId === chapter.id)) {
      pushIssue({
        severity: 'warning',
        contentType: 'quizzes',
        recordId: chapter.id,
        field: 'chapterId',
        message: 'Missing quiz for chapter.',
      });
    }

    const flashcardsForChapter = content.flashcards.filter((flashcard) => flashcard.chapterId === chapter.id);
    if (flashcardsForChapter.length < 3) {
      pushIssue({
        severity: 'warning',
        contentType: 'flashcards',
        recordId: chapter.id,
        field: 'chapterId',
        message: `Too few flashcards for chapter (found ${flashcardsForChapter.length}, expected at least 3).`,
      });
    }

    if (!content.videos.some((video) => video.chapterId === chapter.id)) {
      pushIssue({
        severity: 'warning',
        contentType: 'videos',
        recordId: chapter.id,
        field: 'chapterId',
        message: 'No videos linked to chapter.',
      });
    }

    if ((chapter.estimatedMinutes ?? 0) > 25) {
      pushIssue({
        severity: 'info',
        contentType: 'chapters',
        recordId: chapter.id,
        field: 'estimatedMinutes',
        message: 'Long chapter detected; consider splitting into smaller lessons.',
      });
    }
  }

  const questionCountByQuiz = new Map<string, number>();
  for (const question of content.questions) {
    questionCountByQuiz.set(question.quizId, (questionCountByQuiz.get(question.quizId) ?? 0) + 1);
  }

  for (const quiz of content.quizzes) {
    if ((questionCountByQuiz.get(quiz.id) ?? 0) < 3) {
      pushIssue({
        severity: 'info',
        contentType: 'quizzes',
        recordId: quiz.id,
        field: 'id',
        message: 'Quiz has fewer than 3 questions; consider adding more for coverage.',
      });
    }
  }

  result.bySeverity = groupIssuesBySeverity(result.issues);
  result.byContentType = groupIssuesByContentType(result.issues);
  return result;
};

export const formatIssueForCli = (issue: ValidationIssue): string =>
  `[${issue.severity.toUpperCase()}] ${issue.contentType}:${issue.recordId}.${issue.field} - ${issue.message}`;

export const formatIssuesForCli = (issues: ValidationIssue[]): string => issues.map(formatIssueForCli).join('\n');

export type UiValidationMessage = {
  tone: ValidationSeverity;
  title: string;
  description: string;
};

export const formatIssueForUi = (issue: ValidationIssue): UiValidationMessage => ({
  tone: issue.severity,
  title: `${issue.contentType} · ${issue.recordId}`,
  description: `${issue.field}: ${issue.message}`,
});

export const formatIssuesForUi = (issues: ValidationIssue[]): UiValidationMessage[] => issues.map(formatIssueForUi);
