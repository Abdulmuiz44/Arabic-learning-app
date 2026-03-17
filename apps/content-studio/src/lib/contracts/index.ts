export type SourceBook = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  slug: string;
  title: string;
  /**
   * Optional short subtitle shown in previews.
   */
  subtitle?: string;
  /**
   * Optional long-form summary for the book.
   */
  description?: string;
  /**
   * Optional theme color for rendering a cover card.
   */
  coverColor?: string;
  /**
   * Optional ordering hint used when presenting book lists.
   */
  sortOrder?: number;
};

export type SourceChapter = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  /**
   * Explicit foreign key to the parent book.
   */
  bookId: string;
  /**
   * Optional display chapter number.
   */
  chapterNumber?: number;
  title: string;
  /**
   * Optional chapter synopsis.
   */
  description?: string;
  /**
   * Optional estimated completion time in minutes.
   */
  estimatedMinutes?: number;
};

export type SourceLessonSection = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  heading: string;
  body: string;
  /**
   * Optional ordering hint within the chapter.
   */
  orderIndex?: number;
};

export type SourceFlashcard = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  arabic: string;
  /**
   * Optional Latin-script pronunciation.
   */
  transliteration?: string;
  meaning: string;
  /**
   * Optional usage example.
   */
  example?: string;
};

export type SourceQuiz = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  title: string;
  /**
   * Optional short description of quiz scope.
   */
  description?: string;
};

export type SourceQuestion = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  /**
   * Explicit foreign key to the parent quiz.
   */
  quizId: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  /**
   * Optional rationale shown after answering.
   */
  explanation?: string;
};

export type SourceVideo = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  title: string;
  youtubeUrl: string;
  /**
   * Optional companion notes shown with the video.
   */
  notes?: string;
};

export type SourceListeningItem = {
  /**
   * Optional source identifier. If omitted, an ID can be generated during normalization.
   */
  id?: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  title: string;
  audioUrl: string;
  /**
   * Optional transcript text.
   */
  transcript?: string;
  /**
   * Optional translation text.
   */
  translation?: string;
};

export type SourceContentBundle = {
  books: SourceBook[];
  chapters: SourceChapter[];
  lesson_sections: SourceLessonSection[];
  flashcards: SourceFlashcard[];
  quizzes: SourceQuiz[];
  questions: SourceQuestion[];
  videos: SourceVideo[];
  listening_items: SourceListeningItem[];
};

export type ExportBook = {
  /** Stable identifier preserved across exports. */
  id: string;
  slug: string;
  title: string;
  /**
   * Optional short subtitle shown in previews.
   */
  subtitle?: string;
  /**
   * Optional long-form summary for the book.
   */
  description?: string;
  /**
   * Optional theme color for rendering a cover card.
   */
  coverColor?: string;
  /**
   * Optional ordering hint used when presenting book lists.
   */
  sortOrder?: number;
};

export type ExportChapter = {
  /** Stable identifier preserved across exports. */
  id: string;
  /**
   * Explicit foreign key to the parent book.
   */
  bookId: string;
  /**
   * Optional display chapter number.
   */
  chapterNumber?: number;
  title: string;
  /**
   * Optional chapter synopsis.
   */
  description?: string;
  /**
   * Optional estimated completion time in minutes.
   */
  estimatedMinutes?: number;
};

export type ExportLessonSection = {
  /** Stable identifier preserved across exports. */
  id: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  heading: string;
  body: string;
  /**
   * Optional ordering hint within the chapter.
   */
  orderIndex?: number;
};

export type ExportFlashcard = {
  /** Stable identifier preserved across exports. */
  id: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  arabic: string;
  /**
   * Optional Latin-script pronunciation.
   */
  transliteration?: string;
  meaning: string;
  /**
   * Optional usage example.
   */
  example?: string;
};

export type ExportQuiz = {
  /** Stable identifier preserved across exports. */
  id: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  title: string;
  /**
   * Optional short description of quiz scope.
   */
  description?: string;
};

export type ExportQuestion = {
  /** Stable identifier preserved across exports. */
  id: string;
  /**
   * Explicit foreign key to the parent quiz.
   */
  quizId: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  /**
   * Optional rationale shown after answering.
   */
  explanation?: string;
};

export type ExportVideo = {
  /** Stable identifier preserved across exports. */
  id: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  title: string;
  youtubeUrl: string;
  /**
   * Optional companion notes shown with the video.
   */
  notes?: string;
};

export type ExportListeningItem = {
  /** Stable identifier preserved across exports. */
  id: string;
  /**
   * Explicit foreign key to the parent chapter.
   */
  chapterId: string;
  title: string;
  audioUrl: string;
  /**
   * Optional transcript text.
   */
  transcript?: string;
  /**
   * Optional translation text.
   */
  translation?: string;
};

export type ExportContentBundle = {
  books: ExportBook[];
  chapters: ExportChapter[];
  lesson_sections: ExportLessonSection[];
  flashcards: ExportFlashcard[];
  quizzes: ExportQuiz[];
  questions: ExportQuestion[];
  videos: ExportVideo[];
  listening_items: ExportListeningItem[];
};
