import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionLinkButton } from '../../src/components/ActionLinkButton';
import { EmptyStateCard } from '../../src/components/EmptyStateCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { completeChapter, touchChapter, updateStreakForAction } from '../../src/db/repositories';
import { getChapterById, getLessonSectionsForChapter } from '../../src/features/chapters/selectors';
import { getFlashcardsForChapter } from '../../src/features/flashcards/selectors';

export default function ChapterLessonScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const [done, setDone] = useState(false);
  const chapter = getChapterById(chapterId);
  const sections = getLessonSectionsForChapter(chapterId);
  const vocab = getFlashcardsForChapter(chapterId).slice(0, 3);

  useFocusEffect(useCallback(() => {
    touchChapter(chapterId);
    updateStreakForAction();
  }, [chapterId]));

  if (!chapter) {
    return (
      <Screen>
        <EmptyStateCard
          title="Chapter not found"
          message="This chapter may be unavailable right now."
          ctaLabel="Back to books"
          ctaHref="/(tabs)/books"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>{chapter.title}</Text>
      <Text>{chapter.description}</Text>

      {sections.length === 0 ? (
        <EmptyStateCard
          title="No lesson content yet"
          message="This chapter content is still being prepared."
          ctaLabel="Try chapter flashcards"
          ctaHref={`/flashcards/${chapterId}` as const}
        />
      ) : (
        sections.map((section) => (
          <SectionCard key={section.id} title={section.heading}>
            <Text>{section.body}</Text>
          </SectionCard>
        ))
      )}

      {vocab.length === 0 ? (
        <EmptyStateCard
          title="No vocabulary preview"
          message="You can still continue to practice with quiz or notes."
          ctaLabel="Open quiz"
          ctaHref={`/quiz/${chapterId}` as const}
        />
      ) : (
        <SectionCard title="Vocabulary preview">
          {vocab.map((item) => <Text key={item.id} style={{ fontSize: 18 }}>{item.arabic} — {item.meaning}</Text>)}
        </SectionCard>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <ActionLinkButton href={`/flashcards/${chapterId}` as const} label="Flashcards" />
        <ActionLinkButton href={`/quiz/${chapterId}` as const} label="Quiz" />
        <ActionLinkButton href={`/videos/${chapterId}` as const} label="Videos" />
        <ActionLinkButton href="/(tabs)/notes" label="Notes" />
      </View>

      <PrimaryButton label="Mark chapter complete" onPress={async () => { await completeChapter(chapterId); setDone(true); }} />
      {done ? <Text>Chapter marked complete.</Text> : null}
    </Screen>
  );
}
