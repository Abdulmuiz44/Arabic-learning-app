import { seed } from '../../data/seed';

export const getQuizForChapter = (chapterId: string) => seed.quizzes.find((quiz) => quiz.chapterId === chapterId);
export const getQuestionsForQuiz = (quizId: string) => seed.questions.filter((question) => question.quizId === quizId);
