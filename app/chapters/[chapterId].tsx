import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { sharedTypography } from '../../src/constants/typography';
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
      <Text style={styles.title}>{chapter.title}</Text>
      <Text style={styles.description}>{chapter.description}</Text>
      {sections.map((section) => (
        <View key={section.id} style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>{section.heading}</Text>
          <Text style={styles.description}>{section.body}</Text>
        </View>
      ))}

      <View style={styles.vocabularyCard}>
        <Text style={styles.sectionHeading}>Vocabulary preview</Text>
        {vocab.map((item) => (
          <View key={item.id} style={styles.vocabularyRow}>
            <Text style={[sharedTypography.arabicText, styles.previewArabic]}>{item.arabic}</Text>
            <Text style={sharedTypography.englishText}>{item.meaning}</Text>
          </View>
        ))}
      </View>

      <View style={styles.linksRow}>
        <Link href={`/flashcards/${chapterId}` as any}>Flashcards</Link>
        <Link href={`/quiz/${chapterId}` as any}>Quiz</Link>
        <Link href={`/videos/${chapterId}` as any}>Videos</Link>
        <Link href="/(tabs)/notes">Notes</Link>
      </View>

      <Text onPress={async () => { await completeChapter(chapterId); setDone(true); }} style={styles.completeLink}>Mark chapter complete</Text>
      {done ? <Text>Chapter marked complete.</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  description: { lineHeight: 22 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, gap: 4 },
  sectionHeading: { fontWeight: '700' },
  vocabularyCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, gap: 4 },
  vocabularyRow: { marginVertical: 6 },
  previewArabic: { fontSize: 24, lineHeight: 36, marginBottom: 2 },
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  completeLink: { color: '#2563EB' },
});
