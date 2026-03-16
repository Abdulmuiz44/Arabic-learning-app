import { seed } from '../../data/seed';

export const getFlashcardsForChapter = (chapterId: string) => seed.flashcards.filter((card) => card.chapterId === chapterId);
