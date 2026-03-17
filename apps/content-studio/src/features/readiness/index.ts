export type ReadinessStatus = 'Draft' | 'In Progress' | 'Review Ready' | 'Export Ready';

export type ReadinessResult = {
  score: number;
  status: ReadinessStatus;
};

type ChapterLinked = {
  chapterId?: string;
  id?: string;
  [key: string]: unknown;
};

type QuizLinked = {
  id?: string;
  chapterId?: string;
  [key: string]: unknown;
};

type QuestionLinked = {
  quizId?: string;
  [key: string]: unknown;
};

type Chapter = {
  id: string;
  bookId: string;
};

export type NormalizedContent = {
  books?: Array<{ id: string }>;
  chapters?: Chapter[];
  lesson_sections?: ChapterLinked[];
  flashcards?: ChapterLinked[];
  quizzes?: QuizLinked[];
  questions?: QuestionLinked[];
  videos?: ChapterLinked[];
  listening_items?: ChapterLinked[];
  listeningItems?: ChapterLinked[];
};

type Criterion = {
  name: string;
  weight: number;
  score: number;
  applicable?: boolean;
};

const MIN_QUESTION_COUNT = 5;

const STATUS_THRESHOLDS: Array<{ min: number; status: ReadinessStatus }> = [
  { min: 85, status: 'Export Ready' },
  { min: 60, status: 'Review Ready' },
  { min: 25, status: 'In Progress' },
  { min: 0, status: 'Draft' },
];

const hasAudioSignal = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;

  return [
    'audioUrl',
    'audio_url',
    'audio',
    'ttsUrl',
    'tts_url',
    'voiceUrl',
    'voice_url',
    'hasAudio',
  ].some((key) => {
    const field = record[key];
    return field === true || (typeof field === 'string' && field.trim().length > 0);
  });
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const toStatus = (score: number): ReadinessStatus => {
  const safeScore = clamp(score, 0, 100);
  return STATUS_THRESHOLDS.find((threshold) => safeScore >= threshold.min)?.status ?? 'Draft';
};

const getListeningItems = (content: NormalizedContent): ChapterLinked[] =>
  content.listening_items ?? content.listeningItems ?? [];

const scoreFromCriteria = (criteria: Criterion[]): number => {
  const applicableCriteria = criteria.filter((criterion) => criterion.applicable !== false);
  const totalWeight = applicableCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedTotal = applicableCriteria.reduce(
    (sum, criterion) => sum + criterion.weight * clamp(criterion.score, 0, 1),
    0,
  );

  return Math.round((weightedTotal / totalWeight) * 100);
};

/**
 * Scores readiness for a chapter using weighted criteria and maps the score to a status.
 *
 * Optional audio coverage is only included when at least one chapter-linked item carries an
 * audio signal; otherwise the criterion is excluded so chapters are not penalized.
 */
export const scoreChapterReadiness = (
  chapterId: string,
  normalizedContent: NormalizedContent,
): ReadinessResult => {
  const lessonSections = (normalizedContent.lesson_sections ?? []).filter((item) => item.chapterId === chapterId);
  const flashcards = (normalizedContent.flashcards ?? []).filter((item) => item.chapterId === chapterId);
  const quizzes = (normalizedContent.quizzes ?? []).filter((quiz) => quiz.chapterId === chapterId);
  const quizIds = new Set(quizzes.map((quiz) => quiz.id).filter((id): id is string => typeof id === 'string'));
  const questions = (normalizedContent.questions ?? []).filter(
    (question) => typeof question.quizId === 'string' && quizIds.has(question.quizId),
  );
  const videos = (normalizedContent.videos ?? []).filter((item) => item.chapterId === chapterId);
  const listeningItems = getListeningItems(normalizedContent).filter((item) => item.chapterId === chapterId);

  const audioEligibleItems = [...lessonSections, ...flashcards, ...videos, ...listeningItems];
  const audioSignalCount = audioEligibleItems.filter((item) => hasAudioSignal(item)).length;
  const hasAnyAudioSignals = audioEligibleItems.some((item) => hasAudioSignal(item));
  const audioCoverage =
    audioEligibleItems.length > 0 ? clamp(audioSignalCount / audioEligibleItems.length, 0, 1) : 0;

  const criteria: Criterion[] = [
    { name: 'lesson sections existence', weight: 20, score: lessonSections.length > 0 ? 1 : 0 },
    { name: 'flashcards existence', weight: 15, score: flashcards.length > 0 ? 1 : 0 },
    { name: 'quiz existence', weight: 10, score: quizzes.length > 0 ? 1 : 0 },
    { name: 'question count minimum', weight: 20, score: clamp(questions.length / MIN_QUESTION_COUNT, 0, 1) },
    { name: 'videos existence', weight: 15, score: videos.length > 0 ? 1 : 0 },
    { name: 'listening items existence', weight: 10, score: listeningItems.length > 0 ? 1 : 0 },
    {
      name: 'audio coverage (optional)',
      weight: 10,
      score: audioCoverage,
      applicable: hasAnyAudioSignals,
    },
  ];

  const score = scoreFromCriteria(criteria);
  return { score, status: toStatus(score) };
};

/**
 * Scores a book by taking the simple average of its chapter readiness scores.
 *
 * Aggregation method: each chapter contributes equally (unweighted arithmetic mean).
 */
export const scoreBookReadiness = (
  bookId: string,
  normalizedContent: NormalizedContent,
): ReadinessResult => {
  const chapters = (normalizedContent.chapters ?? []).filter((chapter) => chapter.bookId === bookId);
  if (chapters.length === 0) {
    return { score: 0, status: 'Draft' };
  }

  const chapterScores = chapters.map((chapter) => scoreChapterReadiness(chapter.id, normalizedContent).score);
  const averageScore = Math.round(chapterScores.reduce((sum, score) => sum + score, 0) / chapterScores.length);

  return { score: averageScore, status: toStatus(averageScore) };
};
