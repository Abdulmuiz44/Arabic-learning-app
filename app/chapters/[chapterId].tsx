import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
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

  if (!chapter) return <Screen><Text>Chapter not found.</Text></Screen>;

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>{chapter.title}</Text>
      <Text>{chapter.description}</Text>
      {sections.map((section) => (
        <View key={section.id} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, gap: 4 }}>
          <Text style={{ fontWeight: '700' }}>{section.heading}</Text>
          <Text>{section.body}</Text>
        </View>
      ))}

      <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8 }}>
        <Text style={{ fontWeight: '700' }}>Vocabulary preview</Text>
        {vocab.map((item) => <Text key={item.id} style={{ fontSize: 18 }}>{item.arabic} — {item.meaning}</Text>)}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Link href={`/flashcards/${chapterId}` as any}>Flashcards</Link>
        <Link href={`/quiz/${chapterId}` as any}>Quiz</Link>
        <Link href={`/videos/${chapterId}` as any}>Videos</Link>
        <Link href="/(tabs)/notes">Notes</Link>
      </View>

      <Text onPress={async () => { await completeChapter(chapterId); setDone(true); }} style={{ color: '#2563EB' }}>Mark chapter complete</Text>
      {done ? <Text>Chapter marked complete.</Text> : null}
    </Screen>
  );
}
