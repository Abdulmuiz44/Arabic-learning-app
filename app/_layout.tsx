import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppBootstrap } from '../src/hooks/useAppBootstrap';

export default function RootLayout() {
  const ready = useAppBootstrap();

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="books/[bookId]" />
      <Stack.Screen name="chapters/[chapterId]" />
      <Stack.Screen name="flashcards/[chapterId]" />
      <Stack.Screen name="quiz/[chapterId]" />
      <Stack.Screen name="quiz/result" />
      <Stack.Screen name="videos/[chapterId]" />
    </Stack>
  );
}
