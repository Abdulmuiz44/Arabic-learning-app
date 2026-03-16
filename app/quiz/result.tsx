import { Link, router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';

export default function QuizResultScreen() {
  const { colors } = useTheme();
  const { score, total, chapterId } = useLocalSearchParams<{ score: string; total: string; chapterId: string }>();
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Quiz complete 🎉</Text>
      <Text style={{ color: colors.muted }}>Your score: {score} / {total}</Text>
      <PrimaryButton label="Retry Quiz" onPress={() => router.replace(`/quiz/${chapterId}` as any)} />
      <Link href={`/chapters/${chapterId}` as any} style={{ color: colors.link }}>Back to lesson</Link>
    </Screen>
  );
}
