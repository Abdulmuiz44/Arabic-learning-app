import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { getLastOpenedChapterId, getListeningCompletedCount, getProgressMap, getStreak } from '../../src/db/repositories';
import { getChapterById } from '../../src/features/chapters/selectors';

export default function HomeScreen() {
  const [streak, setStreak] = useState(0);
  const [lastChapterId, setLastChapterId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [listeningCompletedCount, setListeningCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [streakMeta, progressMap, chapterId, listeningCount] = await Promise.all([
        getStreak(),
        getProgressMap(),
        getLastOpenedChapterId(),
        getListeningCompletedCount(),
      ]);
      setStreak(streakMeta.currentStreak);
      setCompletedCount(Object.values(progressMap).filter((p) => p.completed).length);
      setListeningCompletedCount(listeningCount);
      setLastChapterId(chapterId);
    } catch {
      setLoadError('Could not refresh home data. Pull to refresh by revisiting this tab.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const chapter = lastChapterId ? getChapterById(lastChapterId) : null;

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Assalāmu ʿalaykum 👋</Text>
      <Text style={{ color: '#64748B' }}>Current streak: {streak} days</Text>
      {isLoading ? (
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator size="small" color="#64748B" />
          <Text style={{ color: '#64748B' }}>Refreshing progress…</Text>
        </View>
      ) : null}
      {loadError ? <Text style={{ marginTop: 8, color: '#DC2626' }}>{loadError}</Text> : null}

      <SectionCard title="Continue Learning" subtitle={chapter ? chapter.title : 'No lesson opened yet'}>
        {chapter ? <Link href={`/chapters/${chapter.id}` as any}>Open last lesson</Link> : <Text>Start from Books.</Text>}
      </SectionCard>

      <SectionCard title="Quick Actions">
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/(tabs)/books">Books</Link>
          <Link href="/(tabs)/notes">Notes</Link>
          <Link href="/(tabs)/books">Flashcards</Link>
          <Link href="/(tabs)/books">Quizzes</Link>
        </View>
      </SectionCard>

      <SectionCard title="Recent Progress" subtitle={`${completedCount} chapters completed`}>
        <Text>Listening items completed: {listeningCompletedCount}</Text>
        <Text>Keep your daily consistency to grow your streak.</Text>
      </SectionCard>
    </Screen>
  );
}
