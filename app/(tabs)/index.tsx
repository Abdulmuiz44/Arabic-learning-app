import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionLinkButton } from '../../src/components/ActionLinkButton';
import { EmptyStateCard } from '../../src/components/EmptyStateCard';
import { LoadingCard } from '../../src/components/LoadingCard';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { getLastOpenedChapterId, getProgressMap, getStreak } from '../../src/db/repositories';
import { getChapterById } from '../../src/features/chapters/selectors';

export default function HomeScreen() {
  const [streak, setStreak] = useState(0);
  const [lastChapterId, setLastChapterId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [streakMeta, progressMap, chapterId] = await Promise.all([getStreak(), getProgressMap(), getLastOpenedChapterId()]);
      setStreak(streakMeta.currentStreak);
      setCompletedCount(Object.values(progressMap).filter((p) => p.completed).length);
      setLastChapterId(chapterId);
      setIsLoading(false);
    };
    load();
  }, []);

  const chapter = lastChapterId ? getChapterById(lastChapterId) : null;

  const quickActions = useMemo(() => {
    const fallback = '/(tabs)/books' as const;
    return {
      flashcards: chapter ? (`/flashcards/${chapter.id}` as const) : fallback,
      quiz: chapter ? (`/quiz/${chapter.id}` as const) : fallback,
      videos: chapter ? (`/videos/${chapter.id}` as const) : fallback,
    };
  }, [chapter]);

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Assalāmu ʿalaykum 👋</Text>
      {isLoading ? <Text style={{ color: '#64748B' }}>Loading your progress…</Text> : <Text style={{ color: '#64748B' }}>Current streak: {streak} days</Text>}

      {isLoading ? (
        <LoadingCard />
      ) : chapter ? (
        <SectionCard title="Continue Learning" subtitle={chapter.title}>
          <ActionLinkButton href={`/chapters/${chapter.id}` as const} label="Open last lesson" />
        </SectionCard>
      ) : (
        <EmptyStateCard
          title="Continue Learning"
          message="No lesson opened yet. Start with a book to begin your first chapter."
          ctaLabel="Browse books"
          ctaHref="/(tabs)/books"
        />
      )}

      <SectionCard title="Quick Actions" subtitle={chapter ? 'Resume from your latest chapter' : 'Choose a starting point'}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <ActionLinkButton href="/(tabs)/books" label="Books" />
          <ActionLinkButton href="/(tabs)/notes" label="Notes" />
          <ActionLinkButton href={quickActions.flashcards} label="Flashcards" />
          <ActionLinkButton href={quickActions.quiz} label="Quizzes" />
          <ActionLinkButton href={quickActions.videos} label="Videos" />
        </View>
      </SectionCard>

      {isLoading ? (
        <LoadingCard />
      ) : (
        <SectionCard title="Recent Progress" subtitle={`${completedCount} chapters completed`}>
          <Text>Keep your daily consistency to grow your streak.</Text>
        </SectionCard>
      )}
    </Screen>
  );
}
