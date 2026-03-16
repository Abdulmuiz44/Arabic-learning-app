import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';
import { completeChapter, touchChapter, updateStreakForAction } from '../../src/db/repositories';
import { getChapterById, getLessonSectionsForChapter } from '../../src/features/chapters/selectors';
import { getFlashcardsForChapter } from '../../src/features/flashcards/selectors';

export default function ChapterLessonScreen() {
  const { colors } = useTheme();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const [done, setDone] = useState(false);
  const chapter = getChapterById(chapterId);
  const sections = getLessonSectionsForChapter(chapterId);
  const vocab = getFlashcardsForChapter(chapterId).slice(0, 3);

  useFocusEffect(useCallback(() => {
    touchChapter(chapterId);
    updateStreakForAction();
  }, [chapterId]));

  if (!chapter) return <Screen><Text style={{ color: colors.text }}>Chapter not found.</Text></Screen>;

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{chapter.title}</Text>
      <Text style={{ color: colors.muted }}>{chapter.description}</Text>
      {sections.map((section) => (
        <View key={section.id} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, gap: 4 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{section.heading}</Text>
          <Text style={{ color: colors.text }}>{section.body}</Text>
        </View>
      ))}

      <View style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 8 }}>
        <Text style={{ fontWeight: '700', color: colors.text }}>Vocabulary preview</Text>
        {vocab.map((item) => <Text key={item.id} style={{ fontSize: 18, color: colors.text }}>{item.arabic} — {item.meaning}</Text>)}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Link href={`/flashcards/${chapterId}` as any} style={{ color: colors.link }}>Flashcards</Link>
        <Link href={`/quiz/${chapterId}` as any} style={{ color: colors.link }}>Quiz</Link>
        <Link href={`/videos/${chapterId}` as any} style={{ color: colors.link }}>Videos</Link>
        <Link href="/(tabs)/notes" style={{ color: colors.link }}>Notes</Link>
      </View>

      <Text onPress={async () => { await completeChapter(chapterId); setDone(true); }} style={{ color: colors.link }}>Mark chapter complete</Text>
      {done ? <Text style={{ color: colors.text }}>Chapter marked complete.</Text> : null}
    </Screen>
  );
}
