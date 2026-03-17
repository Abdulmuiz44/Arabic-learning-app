import path from 'node:path';
import { loadContentFromFolder } from './io.mjs';

const root = process.cwd();
const dataFolder = path.join(root, 'src', 'data');

const countBy = (items, key) => {
  const map = new Map();
  for (const item of items) map.set(item[key], (map.get(item[key]) || 0) + 1);
  return map;
};

loadContentFromFolder(dataFolder)
  .then((content) => {
    const chaptersByBook = countBy(content.chapters, 'bookId');
    const sectionsByChapter = countBy(content.lesson_sections, 'chapterId');
    const flashcardsByChapter = countBy(content.flashcards, 'chapterId');
    const quizzesByChapter = countBy(content.quizzes, 'chapterId');
    const questionsByQuiz = countBy(content.questions, 'quizId');

    const readyChapterIds = new Set();
    for (const chapter of content.chapters) {
      const chapterQuizIds = content.quizzes.filter((quiz) => quiz.chapterId === chapter.id).map((quiz) => quiz.id);
      const hasReadyQuiz = chapterQuizIds.length > 0 && chapterQuizIds.every((quizId) => (questionsByQuiz.get(quizId) || 0) > 0);

      const ready =
        (sectionsByChapter.get(chapter.id) || 0) > 0 &&
        (flashcardsByChapter.get(chapter.id) || 0) > 0 &&
        (quizzesByChapter.get(chapter.id) || 0) > 0 &&
        hasReadyQuiz;

      if (ready) readyChapterIds.add(chapter.id);
    }

    let readyBooks = 0;
    for (const book of content.books) {
      const bookChapters = content.chapters.filter((chapter) => chapter.bookId === book.id);
      const isReady = bookChapters.length > 0 && bookChapters.every((chapter) => readyChapterIds.has(chapter.id));
      if (isReady) readyBooks += 1;
    }

    console.log('Content summary');
    console.log(`- books: ${content.books.length}`);
    console.log(`- chapters: ${content.chapters.length}`);
    console.log(`- lesson_sections: ${content.lesson_sections.length}`);
    console.log(`- flashcards: ${content.flashcards.length}`);
    console.log(`- quizzes: ${content.quizzes.length}`);
    console.log(`- questions: ${content.questions.length}`);
    console.log(`- videos: ${content.videos.length}`);

    console.log('\nReadiness rollup');
    console.log(`- ready books: ${readyBooks}/${content.books.length}`);
    console.log(`- ready chapters: ${readyChapterIds.size}/${content.chapters.length}`);

    console.log('\nPer-book chapter coverage');
    for (const book of content.books) {
      console.log(`- ${book.id}: ${chaptersByBook.get(book.id) || 0} chapter(s)`);
    }

    console.log('\nPer-chapter readiness');
    for (const chapter of content.chapters) {
      const chapterQuizIds = content.quizzes.filter((quiz) => quiz.chapterId === chapter.id).map((quiz) => quiz.id);
      const readyQuizzes = chapterQuizIds.filter((quizId) => (questionsByQuiz.get(quizId) || 0) > 0).length;
      const isReady = readyChapterIds.has(chapter.id) ? 'ready' : 'needs-content';
      console.log(
        `- ${chapter.id}: ${isReady} (sections=${sectionsByChapter.get(chapter.id) || 0}, flashcards=${flashcardsByChapter.get(chapter.id) || 0}, quizzes=${quizzesByChapter.get(chapter.id) || 0}, quizzes_with_questions=${readyQuizzes}/${chapterQuizIds.length})`,
      );
    }
  })
  .catch((error) => {
    console.error('Unhandled summary error:\n', error);
    process.exit(1);
  });
