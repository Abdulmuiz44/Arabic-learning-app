import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { sharedTypography } from '../../src/constants/typography';
import { completeChapter, touchChapter, updateStreakForAction } from '../../src/db/repositories';
import { getChapterById, getLessonSectionsForChapter } from '../../src/features/chapters/selectors';
import { getFlashcardsForChapter } from '../../src/features/flashcards/selectors';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';

const actionLinks = [
  { label: 'Flashcards', href: (chapterId: string) => `/flashcards/${chapterId}` as any },
  { label: 'Quiz', href: (chapterId: string) => `/quiz/${chapterId}` as any },
  { label: 'Videos', href: (chapterId: string) => `/videos/${chapterId}` as any },
  { label: 'Notes', href: () => '/(tabs)/notes' as any },
  { label: 'Listening', href: (chapterId: string) => `/listening/${chapterId}` as any },
];

export default function ChapterLessonScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const [done, setDone] = useState(false);
  const chapter = getChapterById(chapterId);
  const sections = getLessonSectionsForChapter(chapterId);
  const vocab = getFlashcardsForChapter(chapterId).slice(0, 3);
  const audio = useAudioPlayer();

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
        {vocab.map((item) => {
          const hasAudio = Boolean(item.audioUrl || item.localAudioKey);
          return (
            <View key={item.id} style={styles.vocabularyRow}>
              <View style={{ flex: 1 }}>
                <Text style={[sharedTypography.arabicText, styles.previewArabic]}>{item.arabic}</Text>
                <Text style={sharedTypography.englishText}>{item.meaning}</Text>
              </View>
              <Pressable
                onPress={() => void (audio.isCurrentSourcePlaying({ audioUrl: item.audioUrl, localAudioKey: item.localAudioKey }) ? audio.pause() : audio.replay({ audioUrl: item.audioUrl, localAudioKey: item.localAudioKey }))}
                disabled={!hasAudio || audio.isLoading}
                style={[styles.vocabAudioButton, (!hasAudio || audio.isLoading) && styles.vocabAudioButtonDisabled]}
              >
                <Text style={styles.vocabAudioButtonText}>{hasAudio ? '▶︎' : '—'}</Text>
              </Pressable>
            </View>
          );
        })}
        {audio.isLoading ? <ActivityIndicator size="small" color="#64748B" /> : null}
        {audio.error ? <Text style={styles.errorText}>{audio.error}</Text> : null}
      </View>

      <View style={styles.linksGrid}>
        {actionLinks.map((action) => (
          <View key={action.label} style={styles.actionPill}>
            <Link href={action.href(chapterId)}>{action.label}</Link>
          </View>
        ))}
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
  vocabularyCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, gap: 6 },
  vocabularyRow: { marginVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewArabic: { fontSize: 24, lineHeight: 36, marginBottom: 2 },
  linksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionPill: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  completeLink: { color: '#2563EB' },
  vocabAudioButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  vocabAudioButtonDisabled: { opacity: 0.45 },
  vocabAudioButtonText: { color: '#fff', fontWeight: '700' },
  errorText: { color: '#b91c1c', fontSize: 12 },
});
