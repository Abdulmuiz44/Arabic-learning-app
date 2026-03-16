import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { useTheme } from '../../src/constants/theme';
import { getBooks } from '../../src/features/books/selectors';
import { getChaptersForBook } from '../../src/features/chapters/selectors';

export default function BooksScreen() {
  const { colors } = useTheme();
  const books = getBooks();

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Books</Text>
      {books.map((book) => (
        <SectionCard key={book.id} title={book.title} subtitle={book.subtitle}>
          <Text style={{ color: colors.text }}>{getChaptersForBook(book.id).length} chapters</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.muted, flex: 1 }}>{book.description}</Text>
            <Link href={`/books/${book.id}` as any} style={{ color: colors.link }}>View</Link>
          </View>
        </SectionCard>
      ))}
    </Screen>
  );
}
