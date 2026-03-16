import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';
import { setFlashcardStats, updateStreakForAction } from '../../src/db/repositories';
import { getFlashcardsForChapter } from '../../src/features/flashcards/selectors';

export default function FlashcardsScreen() {
  const { colors } = useTheme();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const cards = getFlashcardsForChapter(chapterId);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(0);
  const [needsReview, setNeedsReview] = useState(0);

  if (cards.length === 0) return <Screen><Text style={{ color: colors.text }}>No flashcards for this chapter.</Text></Screen>;

  const card = cards[index];
  const persist = async (k: number, n: number) => {
    await setFlashcardStats(chapterId, k, n);
    await updateStreakForAction();
  };

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Flashcards</Text>
      <Text style={{ color: colors.muted }}>{index + 1} / {cards.length}</Text>
      <View style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 36, textAlign: 'center', color: colors.text }}>{card.arabic}</Text>
        <Text style={{ textAlign: 'center', color: colors.muted }}>{card.transliteration}</Text>
        <Text style={{ textAlign: 'center', fontWeight: '700', color: colors.text }}>{card.meaning}</Text>
        <Text style={{ textAlign: 'center', color: colors.text }}>{card.example}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <PrimaryButton label="Known" onPress={async () => { const k = known + 1; setKnown(k); await persist(k, needsReview); }} />
        <PrimaryButton label="Needs review" onPress={async () => { const n = needsReview + 1; setNeedsReview(n); await persist(known, n); }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <PrimaryButton label="Previous" onPress={() => setIndex((p) => Math.max(0, p - 1))} />
        <PrimaryButton label="Next" onPress={() => setIndex((p) => Math.min(cards.length - 1, p + 1))} />
      </View>
    </Screen>
  );
}
