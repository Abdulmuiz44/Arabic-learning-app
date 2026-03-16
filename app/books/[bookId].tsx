import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { getBookById } from '../../src/features/books/selectors';
import { getChaptersForBook } from '../../src/features/chapters/selectors';

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const book = getBookById(bookId);
  const chapters = getChaptersForBook(bookId);

  if (!book) return <Screen><Text>Book not found.</Text></Screen>;

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>{book.title}</Text>
      <Text>{book.description}</Text>
      {chapters.map((chapter) => (
        <View key={chapter.id} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, gap: 6 }}>
          <Text style={{ fontWeight: '700' }}>Chapter {chapter.chapterNumber}: {chapter.title}</Text>
          <Text>{chapter.estimatedMinutes} min • {chapter.description}</Text>
          <Link href={`/chapters/${chapter.id}` as any}>Open lesson</Link>
        </View>
      ))}
    </Screen>
  );
}
