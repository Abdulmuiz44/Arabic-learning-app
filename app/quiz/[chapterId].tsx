import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';
import { setQuizBestScore, updateStreakForAction } from '../../src/db/repositories';
import { getQuestionsForQuiz, getQuizForChapter } from '../../src/features/quiz/selectors';

export default function QuizScreen() {
  const { colors } = useTheme();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const quiz = getQuizForChapter(chapterId);
  const questions = useMemo(() => (quiz ? getQuestionsForQuiz(quiz.id) : []), [quiz]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!quiz) return <Screen><Text style={{ color: colors.text }}>No quiz available.</Text></Screen>;

  const question = questions[index];
  const answer = async (option: 'A' | 'B' | 'C' | 'D') => {
    const correct = option === question.correctOption;
    if (correct) setScore((s) => s + 1);
    setFeedback(`${correct ? 'Correct' : 'Not quite'} — ${question.explanation}`);
  };

  const next = async () => {
    if (index < questions.length - 1) {
      setIndex((p) => p + 1);
      setFeedback(null);
      return;
    }
    const finalScore = feedback?.startsWith('Correct') ? score + 1 : score;
    await setQuizBestScore(chapterId, finalScore);
    await updateStreakForAction();
    router.replace({ pathname: '/quiz/result', params: { score: String(finalScore), total: String(questions.length), chapterId } });
  };

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{quiz.title}</Text>
      <Text style={{ color: colors.muted }}>Question {index + 1} of {questions.length}</Text>
      <View style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 8, gap: 8 }}>
        <Text style={{ color: colors.text }}>{question.prompt}</Text>
        {(['A', 'B', 'C', 'D'] as const).map((opt) => (
          <PrimaryButton
            key={opt}
            label={`${opt}. ${question[`option${opt}`]}`}
            onPress={() => answer(opt)}
          />
        ))}
      </View>
      {feedback ? <Text style={{ color: colors.text }}>{feedback}</Text> : null}
      <PrimaryButton label={index === questions.length - 1 ? 'Finish quiz' : 'Next question'} onPress={next} />
    </Screen>
  );
}
