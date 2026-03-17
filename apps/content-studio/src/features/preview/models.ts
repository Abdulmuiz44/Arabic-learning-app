export type LessonSectionExport = {
  id: string;
  chapterId: string;
  heading: string;
  body: string;
  orderIndex: number;
};

export type FlashcardExport = {
  id: string;
  chapterId: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  example: string;
  audioUrl?: string;
  localAudioKey?: string;
};

export type QuestionExport = {
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

export type QuizExport = {
  id: string;
  chapterId: string;
  title: string;
};

export type ListeningExport = {
  id: string;
  chapterId: string;
  promptText: string;
  arabic: string;
  transliteration: string;
  translation: string;
  orderIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  audioUrl?: string;
  localAudioKey?: string;
};

export type VideoExport = {
  id: string;
  chapterId: string;
  title: string;
  youtubeUrl: string;
};

export type ChapterPreviewExport = {
  chapterId: string;
  lessonSections: LessonSectionExport[];
  flashcards: FlashcardExport[];
  quizzes: QuizExport[];
  questions: QuestionExport[];
  listeningItems: ListeningExport[];
  videos: VideoExport[];
};
