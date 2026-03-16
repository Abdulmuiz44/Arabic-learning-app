import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { setQuizBestScore, updateStreakForAction } from '../../src/db/repositories';
import { getQuestionsForQuiz, getQuizForChapter } from '../../src/features/quiz/selectors';

export default function QuizScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const quiz = getQuizForChapter(chapterId);
  const questions = useMemo(() => (quiz ? getQuestionsForQuiz(quiz.id) : []), [quiz]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  if (!quiz) return <Screen><Text>No quiz available.</Text></Screen>;
  if (questions.length === 0) return <Screen><Text>No questions available for this quiz.</Text></Screen>;

  const question = questions[index];
  const answer = async (option: 'A' | 'B' | 'C' | 'D') => {
    if (hasAnswered) return;

    setSelectedOption(option);
    setHasAnswered(true);

    const correct = option === question.correctOption;
    if (correct) setScore((s) => s + 1);
    setFeedback(`${correct ? 'Correct' : 'Not quite'} — ${question.explanation}`);
  };

  const next = async () => {
    if (!hasAnswered) return;

    if (index < questions.length - 1) {
      setIndex((p) => p + 1);
      setFeedback(null);
      setSelectedOption(null);
      setHasAnswered(false);
      return;
    }
    await setQuizBestScore(chapterId, score);
    await updateStreakForAction();
    router.replace({ pathname: '/quiz/result', params: { score: String(score), total: String(questions.length), chapterId } });
  };

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>{quiz.title}</Text>
      <Text>Question {index + 1} of {questions.length}</Text>
      <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, gap: 8 }}>
        <Text>{question.prompt}</Text>
        {(['A', 'B', 'C', 'D'] as const).map((opt) => (
          <PrimaryButton
            key={opt}
            label={`${selectedOption === opt ? '✓ ' : ''}${opt}. ${question[`option${opt}`]}`}
            onPress={() => answer(opt)}
            disabled={hasAnswered}
          />
        ))}
      </View>
      {feedback ? <Text>{feedback}</Text> : null}
      <PrimaryButton label={index === questions.length - 1 ? 'Finish quiz' : 'Next question'} onPress={next} />
    </Screen>
  );
}
