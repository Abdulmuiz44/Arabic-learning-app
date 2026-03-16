import books from './books.json';
import chapters from './chapters.json';
import lessonSections from './lesson_sections.json';
import flashcards from './flashcards.json';
import quizzes from './quizzes.json';
import questions from './questions.json';
import videos from './videos.json';

import { Book, Chapter, Flashcard, LessonSection, Question, Quiz, Video } from '../types/models';

export const seed = {
  books: books as Book[],
  chapters: chapters as Chapter[],
  lessonSections: lessonSections as LessonSection[],
  flashcards: flashcards as Flashcard[],
  quizzes: quizzes as Quiz[],
  questions: questions as Question[],
  videos: videos as Video[],
};
