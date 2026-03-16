import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { sharedTypography } from '../../src/constants/typography';
import { setFlashcardStats, updateStreakForAction } from '../../src/db/repositories';
import { getFlashcardsForChapter } from '../../src/features/flashcards/selectors';

export default function FlashcardsScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const cards = getFlashcardsForChapter(chapterId);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(0);
  const [needsReview, setNeedsReview] = useState(0);

  if (cards.length === 0) return <Screen><Text>No flashcards for this chapter.</Text></Screen>;

  const card = cards[index];
  const persist = async (k: number, n: number) => {
    await setFlashcardStats(chapterId, k, n);
    await updateStreakForAction();
  };

  return (
    <Screen>
      <Text style={styles.title}>Flashcards</Text>
      <Text style={styles.progress}>{index + 1} / {cards.length}</Text>
      <View style={styles.cardContainer}>
        <View style={sharedTypography.arabicBlock}>
          <Text style={[sharedTypography.arabicText, styles.arabic]}>{card.arabic}</Text>
        </View>
        <Text style={[sharedTypography.transliterationText, styles.centered]}>{card.transliteration}</Text>
        <Text style={[sharedTypography.englishText, styles.meaning]}>{card.meaning}</Text>
        <Text style={[sharedTypography.englishText, styles.centered]}>{card.example}</Text>
      </View>
      <View style={styles.buttonRow}>
        <PrimaryButton label="Known" onPress={async () => { const k = known + 1; setKnown(k); await persist(k, needsReview); }} />
        <PrimaryButton label="Needs review" onPress={async () => { const n = needsReview + 1; setNeedsReview(n); await persist(known, n); }} />
      </View>
      <View style={styles.buttonRow}>
        <PrimaryButton label="Previous" onPress={() => setIndex((p) => Math.max(0, p - 1))} />
        <PrimaryButton label="Next" onPress={() => setIndex((p) => Math.min(cards.length - 1, p + 1))} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  progress: { lineHeight: 22 },
  cardContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10 },
  arabic: { textAlign: 'center', fontSize: 42, lineHeight: 56 },
  centered: { textAlign: 'center' },
  meaning: { textAlign: 'center', fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 8 },
});
