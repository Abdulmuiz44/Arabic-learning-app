import {
  ChapterPreviewExport,
  FlashcardExport,
  LessonSectionExport,
  ListeningExport,
  QuestionExport,
  QuizExport,
  VideoExport,
} from './models';

const byId = <T extends { id: string }>(a: T, b: T) => a.id.localeCompare(b.id);

const byOrderThenId = <T extends { id: string; orderIndex: number }>(a: T, b: T) =>
  a.orderIndex - b.orderIndex || byId(a, b);

const byQuizIdThenId = <T extends { id: string; quizId: string }>(a: T, b: T) =>
  a.quizId.localeCompare(b.quizId) || byId(a, b);

export const sortLessonSectionsForPreview = (items: LessonSectionExport[]) => [...items].sort(byOrderThenId);

export const sortFlashcardsForPreview = (items: FlashcardExport[]) => [...items].sort(byId);

export const sortQuizzesForPreview = (items: QuizExport[]) => [...items].sort(byId);

export const sortQuestionsForPreview = (items: QuestionExport[]) => [...items].sort(byQuizIdThenId);

export const sortListeningItemsForPreview = (items: ListeningExport[]) => [...items].sort(byOrderThenId);

export const sortVideosForPreview = (items: VideoExport[]) => [...items].sort(byId);

export const normalizeChapterPreviewModel = (model: ChapterPreviewExport): ChapterPreviewExport => ({
  ...model,
  lessonSections: sortLessonSectionsForPreview(model.lessonSections),
  flashcards: sortFlashcardsForPreview(model.flashcards),
  quizzes: sortQuizzesForPreview(model.quizzes),
  questions: sortQuestionsForPreview(model.questions),
  listeningItems: sortListeningItemsForPreview(model.listeningItems),
  videos: sortVideosForPreview(model.videos),
});
