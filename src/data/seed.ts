import books from './books.json';
import chapters from './chapters.json';
import lessonSections from './lesson_sections.json';
import flashcards from './flashcards.json';
import quizzes from './quizzes.json';
import questions from './questions.json';
import videos from './videos.json';

import { Book, Chapter, Flashcard, LessonSection, Question, Quiz, Video } from '../types/models';

type EntityWithId = { id: string };

function assertSeedCollection(name: string, value: unknown): asserts value is EntityWithId[] {
  if (!Array.isArray(value)) {
    throw new Error(`[seed] ${name}.json must export an array.`);
  }

  for (const item of value) {
    if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'string' || item.id.trim().length === 0) {
      throw new Error(`[seed] ${name}.json contains a record with a missing or invalid id.`);
    }
  }
}

function validateSeedShape() {
  assertSeedCollection('books', books);
  assertSeedCollection('chapters', chapters);
  assertSeedCollection('lesson_sections', lessonSections);
  assertSeedCollection('flashcards', flashcards);
  assertSeedCollection('quizzes', quizzes);
  assertSeedCollection('questions', questions);
  assertSeedCollection('videos', videos);
}

validateSeedShape();

export const seed = {
  books: books as Book[],
  chapters: chapters as Chapter[],
  lessonSections: lessonSections as LessonSection[],
  flashcards: flashcards as Flashcard[],
  quizzes: quizzes as Quiz[],
  questions: questions as Question[],
  videos: videos as Video[],
};
