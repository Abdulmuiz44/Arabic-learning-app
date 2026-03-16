import { seed } from '../../data/seed';

export const getChaptersForBook = (bookId: string) =>
  seed.chapters.filter((chapter) => chapter.bookId === bookId).sort((a, b) => a.chapterNumber - b.chapterNumber);

export const getChapterById = (chapterId: string) => seed.chapters.find((chapter) => chapter.id === chapterId);
export const getLessonSectionsForChapter = (chapterId: string) =>
  seed.lessonSections.filter((section) => section.chapterId === chapterId).sort((a, b) => a.orderIndex - b.orderIndex);

export const getListeningItemsForChapter = (chapterId: string) =>
  seed.listeningItems.filter((item) => item.chapterId === chapterId).sort((a, b) => a.orderIndex - b.orderIndex || a.id.localeCompare(b.id));
