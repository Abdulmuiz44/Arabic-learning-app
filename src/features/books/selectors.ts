import { seed } from '../../data/seed';

export const getBooks = () => [...seed.books].sort((a, b) => a.sortOrder - b.sortOrder);
export const getBookById = (bookId: string) => seed.books.find((book) => book.id === bookId);
