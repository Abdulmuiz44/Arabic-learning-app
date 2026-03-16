import { Text, View } from 'react-native';
import { ActionLinkButton } from '../../src/components/ActionLinkButton';
import { EmptyStateCard } from '../../src/components/EmptyStateCard';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { getBooks } from '../../src/features/books/selectors';
import { getChaptersForBook } from '../../src/features/chapters/selectors';

export default function BooksScreen() {
  const books = getBooks();

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Books</Text>
      {books.length === 0 ? (
        <EmptyStateCard
          title="No books yet"
          message="Your library is empty right now."
          ctaLabel="Go to Home"
          ctaHref="/"
        />
      ) : (
        books.map((book) => (
          <SectionCard key={book.id} title={book.title} subtitle={book.subtitle}>
            <Text>{getChaptersForBook(book.id).length} chapters</Text>
            <Text style={{ color: '#64748B' }}>{book.description}</Text>
            <View style={{ maxWidth: 180 }}>
              <ActionLinkButton href={`/books/${book.id}` as const} label="View chapters" />
            </View>
          </SectionCard>
        ))
      )}
    </Screen>
  );
}
