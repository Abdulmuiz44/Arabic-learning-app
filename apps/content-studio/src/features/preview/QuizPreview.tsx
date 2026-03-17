import { useMemo, useState } from 'react';
import { QuestionExport, QuizExport } from './models';
import { sortQuestionsForPreview } from './normalizePreviewModel';

type QuizPreviewProps = {
  quiz: QuizExport;
  questions: QuestionExport[];
};

const optionKeys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

export function QuizPreview({ quiz, questions }: QuizPreviewProps) {
  const orderedQuestions = useMemo(
    () => sortQuestionsForPreview(questions).filter((question) => question.quizId === quiz.id),
    [questions, quiz.id],
  );
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = orderedQuestions[index];

  if (!question) {
    return (
      <section>
        <h3>{quiz.title}</h3>
        <p>No questions available.</p>
      </section>
    );
  }

  const options = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
  };

  const goTo = (nextIndex: number) => {
    setIndex(nextIndex);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <section>
      <h3>{quiz.title}</h3>
      <p>
        Question {index + 1} / {orderedQuestions.length}
      </p>
      <p>{question.prompt}</p>

      <ul>
        {optionKeys.map((key) => {
          const isSelected = selectedOption === key;
          const isCorrect = showExplanation && key === question.correctOption;
          return (
            <li key={key}>
              <button type="button" onClick={() => setSelectedOption(key)} aria-pressed={isSelected}>
                {key}. {options[key]} {isSelected ? '✓ selected' : ''} {isCorrect ? '✅ correct' : ''}
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={() => setShowExplanation((current) => !current)}>
        {showExplanation ? 'Hide explanation' : 'Reveal explanation'}
      </button>

      {showExplanation && (
        <p>
          <strong>Explanation:</strong> {question.explanation}
        </p>
      )}

      <div>
        <button type="button" disabled={index === 0} onClick={() => goTo(index - 1)}>
          Previous
        </button>
        <button type="button" disabled={index === orderedQuestions.length - 1} onClick={() => goTo(index + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}
