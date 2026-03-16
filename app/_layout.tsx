import { Stack } from 'expo-router';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useAppBootstrap } from '../src/hooks/useAppBootstrap';

export default function RootLayout() {
  const { status, error, retry } = useAppBootstrap();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
          Unable to start the app
        </Text>
        <Text style={{ textAlign: 'center' }}>{error ?? 'Unknown bootstrap error.'}</Text>
        <Button title="Retry" onPress={() => void retry()} />
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
