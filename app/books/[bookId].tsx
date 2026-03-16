import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { ActionLinkButton } from '../../src/components/ActionLinkButton';
import { EmptyStateCard } from '../../src/components/EmptyStateCard';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { getBookById } from '../../src/features/books/selectors';
import { getChaptersForBook } from '../../src/features/chapters/selectors';

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const book = getBookById(bookId);
  const chapters = getChaptersForBook(bookId);

  if (!book) {
    return (
      <Screen>
        <EmptyStateCard
          title="Book not found"
          message="This book may have been removed or the link is invalid."
          ctaLabel="Back to books"
          ctaHref="/(tabs)/books"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>{book.title}</Text>
      <Text>{book.description}</Text>
      {chapters.length === 0 ? (
        <EmptyStateCard
          title="No chapters yet"
          message="This book does not have chapters available right now."
          ctaLabel="Browse other books"
          ctaHref="/(tabs)/books"
        />
      ) : (
        chapters.map((chapter) => (
          <SectionCard key={chapter.id} title={`Chapter ${chapter.chapterNumber}: ${chapter.title}`} subtitle={`${chapter.estimatedMinutes} min`}>
            <Text>{chapter.description}</Text>
            <View style={{ maxWidth: 180 }}>
              <ActionLinkButton href={`/chapters/${chapter.id}` as const} label="Open lesson" />
            </View>
          </SectionCard>
        ))
      )}
    </Screen>
  );
}
