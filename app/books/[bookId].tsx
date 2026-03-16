import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';
import { getBookById } from '../../src/features/books/selectors';
import { getChaptersForBook } from '../../src/features/chapters/selectors';

export default function BookDetailScreen() {
  const { colors } = useTheme();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const book = getBookById(bookId);
  const chapters = getChaptersForBook(bookId);

  if (!book) return <Screen><Text style={{ color: colors.text }}>Book not found.</Text></Screen>;

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>{book.title}</Text>
      <Text style={{ color: colors.muted }}>{book.description}</Text>
      {chapters.map((chapter) => (
        <View key={chapter.id} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, gap: 6 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Chapter {chapter.chapterNumber}: {chapter.title}</Text>
          <Text style={{ color: colors.muted }}>{chapter.estimatedMinutes} min • {chapter.description}</Text>
          <Link href={`/chapters/${chapter.id}` as any} style={{ color: colors.link }}>Open lesson</Link>
        </View>
      ))}
    </Screen>
  );
}
