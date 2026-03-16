import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { useTheme } from '../../src/constants/theme';
import { getLastOpenedChapterId, getProgressMap, getStreak } from '../../src/db/repositories';
import { getChapterById } from '../../src/features/chapters/selectors';

export default function HomeScreen() {
  const { colors } = useTheme();
  const [streak, setStreak] = useState(0);
  const [lastChapterId, setLastChapterId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [streakMeta, progressMap, chapterId] = await Promise.all([getStreak(), getProgressMap(), getLastOpenedChapterId()]);
      setStreak(streakMeta.currentStreak);
      setCompletedCount(Object.values(progressMap).filter((p) => p.completed).length);
      setLastChapterId(chapterId);
    };
    load();
  }, []);

  const chapter = lastChapterId ? getChapterById(lastChapterId) : null;

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Assalāmu ʿalaykum 👋</Text>
      <Text style={{ color: colors.muted }}>Current streak: {streak} days</Text>

      <SectionCard title="Continue Learning" subtitle={chapter ? chapter.title : 'No lesson opened yet'}>
        {chapter
          ? <Link href={`/chapters/${chapter.id}` as any} style={{ color: colors.link }}>Open last lesson</Link>
          : <Text style={{ color: colors.text }}>Start from Books.</Text>}
      </SectionCard>

      <SectionCard title="Quick Actions">
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/(tabs)/books" style={{ color: colors.link }}>Books</Link>
          <Link href="/(tabs)/notes" style={{ color: colors.link }}>Notes</Link>
          <Link href="/(tabs)/books" style={{ color: colors.link }}>Flashcards</Link>
          <Link href="/(tabs)/books" style={{ color: colors.link }}>Quizzes</Link>
        </View>
      </SectionCard>

      <SectionCard title="Recent Progress" subtitle={`${completedCount} chapters completed`}>
        <Text style={{ color: colors.text }}>Keep your daily consistency to grow your streak.</Text>
      </SectionCard>
    </Screen>
  );
}
