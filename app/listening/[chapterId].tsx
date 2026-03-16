import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { getListeningProgressForChapter, updateStreakForAction, upsertListeningAttempt } from '../../src/db/repositories';
import { getChapterById, getListeningItemsForChapter } from '../../src/features/chapters/selectors';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';

export default function ListeningPracticeScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const chapter = getChapterById(chapterId);
  const items = getListeningItemsForChapter(chapterId);
  const audio = useAudioPlayer();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getListeningProgressForChapter(chapterId).then((map) => {
        if (!active) return;
        setCompletedCount(Object.values(map).filter((x) => x.completed).length);
      });
      return () => {
        active = false;
      };
    }, [chapterId]),
  );

  const item = items[index];
  const choices = useMemo(() => {
    if (!item) return [];
    const distractors = items
      .filter((x) => x.id !== item.id)
      .slice(0, 2)
      .map((x) => x.translation);
    return [item.translation, ...distractors].sort((a, b) => a.localeCompare(b));
  }, [item, items]);

  if (!chapter) return <Screen><Text>Chapter not found.</Text></Screen>;
  if (items.length === 0) return <Screen><Text>No listening practice yet for this chapter.</Text></Screen>;

  const finishItem = async (wasCorrect: boolean) => {
    setIsSaving(true);
    await upsertListeningAttempt({ itemId: item.id, chapterId, wasCorrect });
    await updateStreakForAction();
    const updated = await getListeningProgressForChapter(chapterId);
    setCompletedCount(Object.values(updated).filter((x) => x.completed).length);
    setRevealed(false);
    setIndex((current) => Math.min(current + 1, items.length - 1));
    setIsSaving(false);
  };

  return (
    <Screen>
      <Text style={styles.title}>Listening Practice</Text>
      <Text style={styles.subtitle}>{chapter.title}</Text>
      <Text style={styles.meta}>Item {index + 1} / {items.length} • completed {Math.min(completedCount, items.length)}</Text>

      <View style={styles.card}>
        <Text style={styles.prompt}>{item.promptText}</Text>
        <PrimaryButton
          label={audio.isCurrentSourcePlaying({ audioUrl: item.audioUrl, localAudioKey: item.localAudioKey }) ? 'Pause audio' : 'Play audio'}
          onPress={() => void (audio.isCurrentSourcePlaying({ audioUrl: item.audioUrl, localAudioKey: item.localAudioKey }) ? audio.pause() : audio.replay({ audioUrl: item.audioUrl, localAudioKey: item.localAudioKey }))}
          disabled={!item.audioUrl && !item.localAudioKey}
        />
        {!item.audioUrl && !item.localAudioKey ? <Text style={styles.muted}>Audio unavailable for this item.</Text> : null}
        {audio.isLoading ? <ActivityIndicator size="small" color="#64748B" /> : null}
        {audio.error ? <Text style={styles.error}>{audio.error}</Text> : null}

        {!revealed ? (
          <>
            <Text style={styles.muted}>Choose a likely meaning, then reveal the answer.</Text>
            {choices.map((choice) => (
              <View key={choice} style={styles.choiceChip}>
                <Text>{choice}</Text>
              </View>
            ))}
            <PrimaryButton label="Reveal answer" onPress={() => setRevealed(true)} />
          </>
        ) : (
          <>
            <Text style={styles.arabic}>{item.arabic}</Text>
            <Text style={styles.translit}>{item.transliteration}</Text>
            <Text style={styles.translation}>{item.translation}</Text>
            <View style={styles.actions}>
              <PrimaryButton label="I got it" onPress={() => void finishItem(true)} disabled={isSaving} />
              <PrimaryButton label="Needs review" onPress={() => void finishItem(false)} disabled={isSaving} />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#475569' },
  meta: { color: '#64748B' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 10 },
  prompt: { fontWeight: '700' },
  muted: { color: '#64748B' },
  choiceChip: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  arabic: { fontSize: 36, textAlign: 'center' },
  translit: { textAlign: 'center', color: '#475569' },
  translation: { textAlign: 'center', fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  error: { color: '#b91c1c', fontSize: 12 },
});
