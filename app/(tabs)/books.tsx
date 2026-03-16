import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { getBooks } from '../../src/features/books/selectors';
import { getChaptersForBook } from '../../src/features/chapters/selectors';

export default function BooksScreen() {
  const books = getBooks();

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Books</Text>
      {books.map((book) => (
        <SectionCard key={book.id} title={book.title} subtitle={book.subtitle}>
          <Text>{getChaptersForBook(book.id).length} chapters</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#64748B' }}>{book.description}</Text>
            <Link href={`/books/${book.id}` as any}>View</Link>
          </View>
        </SectionCard>
      ))}
    </Screen>
  );
}
