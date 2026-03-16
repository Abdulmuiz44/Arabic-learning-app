import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
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
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Flashcards</Text>
      <Text>{index + 1} / {cards.length}</Text>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 36, textAlign: 'center' }}>{card.arabic}</Text>
        <Text style={{ textAlign: 'center' }}>{card.transliteration}</Text>
        <Text style={{ textAlign: 'center', fontWeight: '700' }}>{card.meaning}</Text>
        <Text style={{ textAlign: 'center' }}>{card.example}</Text>
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
