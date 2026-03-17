export type ReadinessStatus = 'Draft' | 'In Progress' | 'Review Ready' | 'Export Ready';

export type ReadinessCriterion = {
  id:
    | 'lessonSections'
    | 'flashcards'
    | 'quiz'
    | 'questionCount'
    | 'videos'
    | 'listeningItems'
    | 'audioCoverage';
  label: string;
  met: boolean;
  weight: number;
  score: number;
  details?: string;
};

export type ChapterReadinessResult = {
  chapterId: string;
  score: number;
  status: ReadinessStatus;
  criteria: ReadinessCriterion[];
  breakdown: {
    lessonSectionCount: number;
    flashcardCount: number;
    quizCount: number;
    questionCount: number;
    videoCount: number;
    listeningItemCount: number;
    minimumQuestionCount: number;
    audioCoverageRatio?: number;
  };
};

export type BookReadinessResult = {
  bookId: string;
  score: number;
  status: ReadinessStatus;
  chapterResults: ChapterReadinessResult[];
  aggregation: {
    strategy: 'weighted-average';
    weightField: 'estimatedMinutes';
    notes: string;
  };
};

type Entity = Record<string, unknown>;

export type NormalizedContent = {
  books?: Entity[];
  chapters?: Entity[];
  lesson_sections?: Entity[];
  flashcards?: Entity[];
  quizzes?: Entity[];
  questions?: Entity[];
  videos?: Entity[];
  listening_items?: Entity[];
  [key: string]: unknown;
};

const DEFAULT_MIN_QUESTION_COUNT = 5;

function toStatus(score: number): ReadinessStatus {
  if (score < 25) return 'Draft';
  if (score < 60) return 'In Progress';
  if (score < 85) return 'Review Ready';
  return 'Export Ready';
}

function asArray(value: unknown): Entity[] {
  return Array.isArray(value) ? (value as Entity[]) : [];
}

function byChapterId(items: Entity[], chapterId: string): Entity[] {
  return items.filter((item) => item.chapterId === chapterId);
}

function asPositiveNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function hasAudioField(item: Entity): boolean {
  const audioKeys = ['audioUrl', 'audio_url', 'audio', 'narrationUrl', 'pronunciationAudioUrl'];
  return audioKeys.some((key) => getString(item[key]) !== null);
}

function safePercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function scoreChapterReadiness(
  chapterId: string,
  normalizedContent: NormalizedContent,
): ChapterReadinessResult {
  const lessonSections = byChapterId(asArray(normalizedContent.lesson_sections), chapterId);
  const flashcards = byChapterId(asArray(normalizedContent.flashcards), chapterId);
  const quizzes = byChapterId(asArray(normalizedContent.quizzes), chapterId);
  const videos = byChapterId(asArray(normalizedContent.videos), chapterId);
  const listeningItems = byChapterId(asArray(normalizedContent.listening_items), chapterId);

  const quizIds = new Set(
    quizzes
      .map((quiz) => getString(quiz.id))
      .filter((id): id is string => id !== null),
  );

  const questionCount = asArray(normalizedContent.questions).filter((question) => {
    const quizId = getString(question.quizId);
    return quizId !== null && quizIds.has(quizId);
  }).length;

  const criteria: ReadinessCriterion[] = [];

  const pushCriterion = (
    criterion: Omit<ReadinessCriterion, 'score'> & { value: number },
  ) => {
    criteria.push({
      ...criterion,
      score: round2(criterion.weight * Math.max(0, Math.min(1, criterion.value))),
    });
  };

  pushCriterion({
    id: 'lessonSections',
    label: 'Lesson sections exist',
    met: lessonSections.length > 0,
    weight: 20,
    value: lessonSections.length > 0 ? 1 : 0,
    details: `${lessonSections.length} section(s)`,
  });

  pushCriterion({
    id: 'flashcards',
    label: 'Flashcards exist',
    met: flashcards.length > 0,
    weight: 20,
    value: flashcards.length > 0 ? 1 : 0,
    details: `${flashcards.length} flashcard(s)`,
  });

  pushCriterion({
    id: 'quiz',
    label: 'Quiz exists',
    met: quizzes.length > 0,
    weight: 20,
    value: quizzes.length > 0 ? 1 : 0,
    details: `${quizzes.length} quiz(zes)`,
  });

  const questionProgress = safePercent(questionCount, DEFAULT_MIN_QUESTION_COUNT);
  pushCriterion({
    id: 'questionCount',
    label: `Minimum question count (${DEFAULT_MIN_QUESTION_COUNT})`,
    met: questionCount >= DEFAULT_MIN_QUESTION_COUNT,
    weight: 20,
    value: questionProgress,
    details: `${questionCount}/${DEFAULT_MIN_QUESTION_COUNT} question(s)`,
  });

  pushCriterion({
    id: 'videos',
    label: 'Videos exist',
    met: videos.length > 0,
    weight: 10,
    value: videos.length > 0 ? 1 : 0,
    details: `${videos.length} video(s)`,
  });

  pushCriterion({
    id: 'listeningItems',
    label: 'Listening items exist',
    met: listeningItems.length > 0,
    weight: 10,
    value: listeningItems.length > 0 ? 1 : 0,
    details: `${listeningItems.length} listening item(s)`,
  });

  const audioCandidateItems = [
    ...lessonSections,
    ...flashcards,
    ...videos,
    ...listeningItems,
  ];

  if (audioCandidateItems.length > 0) {
    const withAudioCount = audioCandidateItems.filter(hasAudioField).length;
    const coverage = safePercent(withAudioCount, audioCandidateItems.length);

    pushCriterion({
      id: 'audioCoverage',
      label: 'Optional audio coverage',
      met: coverage >= 0.8,
      weight: 10,
      value: coverage,
      details: `${withAudioCount}/${audioCandidateItems.length} item(s) with audio`,
    });
  }

  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  const earned = criteria.reduce((sum, criterion) => sum + criterion.score, 0);
  const score = totalWeight > 0 ? round2((earned / totalWeight) * 100) : 0;

  const audioCriterion = criteria.find((criterion) => criterion.id === 'audioCoverage');
  const audioCoverageRatio =
    audioCriterion && audioCriterion.weight > 0
      ? round2(audioCriterion.score / audioCriterion.weight)
      : undefined;

  return {
    chapterId,
    score,
    status: toStatus(score),
    criteria,
    breakdown: {
      lessonSectionCount: lessonSections.length,
      flashcardCount: flashcards.length,
      quizCount: quizzes.length,
      questionCount,
      videoCount: videos.length,
      listeningItemCount: listeningItems.length,
      minimumQuestionCount: DEFAULT_MIN_QUESTION_COUNT,
      audioCoverageRatio,
    },
  };
}

export function scoreBookReadiness(bookId: string, normalizedContent: NormalizedContent): BookReadinessResult {
  const chapters = asArray(normalizedContent.chapters).filter((chapter) => chapter.bookId === bookId);

  const chapterResults = chapters
    .map((chapter) => {
      const chapterId = getString(chapter.id);
      return chapterId ? { chapter, result: scoreChapterReadiness(chapterId, normalizedContent) } : null;
    })
    .filter((v): v is { chapter: Entity; result: ChapterReadinessResult } => v !== null);

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const { chapter, result } of chapterResults) {
    const weight = asPositiveNumber(chapter.estimatedMinutes) ?? 1;
    totalWeightedScore += result.score * weight;
    totalWeight += weight;
  }

  const score = totalWeight > 0 ? round2(totalWeightedScore / totalWeight) : 0;

  return {
    bookId,
    score,
    status: toStatus(score),
    chapterResults: chapterResults.map((x) => x.result),
    aggregation: {
      strategy: 'weighted-average',
      weightField: 'estimatedMinutes',
      notes:
        'Book readiness is the weighted average of chapter readiness scores. Each chapter uses estimatedMinutes as its weight when available; otherwise weight defaults to 1.',
    },
  };
}
