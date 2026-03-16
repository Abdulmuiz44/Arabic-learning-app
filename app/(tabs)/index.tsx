import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { deleteProgressForChapter, getLastOpenedChapterId, getProgressMap, getStreak } from '../../src/db/repositories';
import { getChapterById } from '../../src/features/chapters/selectors';

export default function HomeScreen() {
  const [streak, setStreak] = useState(0);
  const [lastChapterId, setLastChapterId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [streakMeta, progressMap, chapterId] = await Promise.all([getStreak(), getProgressMap(), getLastOpenedChapterId()]);
      const validChapter = chapterId ? getChapterById(chapterId) : null;

      if (chapterId && !validChapter) {
        await deleteProgressForChapter(chapterId);
      }

      setStreak(streakMeta.currentStreak);
      setCompletedCount(Object.values(progressMap).filter((p) => p.completed).length);
      setLastChapterId(validChapter?.id ?? null);
    };
    load();
  }, []);

  const chapter = lastChapterId ? getChapterById(lastChapterId) : null;

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>Assalāmu ʿalaykum 👋</Text>
      <Text style={{ color: '#64748B' }}>Current streak: {streak} days</Text>

      <SectionCard title="Continue Learning" subtitle={chapter ? chapter.title : 'No valid chapter found yet'}>
        {chapter ? (
          <Link href={`/chapters/${chapter.id}` as any}>Open last lesson</Link>
        ) : (
          <View style={{ gap: 8 }}>
            <Text>Start learning by opening a book and selecting your first chapter.</Text>
            <Link href="/(tabs)/books">Go to Books</Link>
          </View>
        )}
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
        <Text>Keep your daily consistency to grow your streak.</Text>
      </SectionCard>
    </Screen>
  );
}
