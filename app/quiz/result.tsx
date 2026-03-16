import { Link, router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';

export default function QuizResultScreen() {
  const { score, total, chapterId } = useLocalSearchParams<{ score: string; total: string; chapterId: string }>();
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Quiz complete 🎉</Text>
      <Text>Your score: {score} / {total}</Text>
      <PrimaryButton label="Retry Quiz" onPress={() => router.replace(`/quiz/${chapterId}` as any)} />
      <Link href={`/chapters/${chapterId}` as any}>Back to lesson</Link>
    </Screen>
  );
}
