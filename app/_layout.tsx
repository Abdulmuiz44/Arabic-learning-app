import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { ThemeProvider, palette } from '../src/constants/theme';
import { useAppBootstrap } from '../src/hooks/useAppBootstrap';
import { useThemeSetting } from '../src/hooks/useThemeSetting';

export default function RootLayout() {
  const ready = useAppBootstrap();
  const { theme, resolvedTheme, changeTheme } = useThemeSetting();
  const colors = palette[resolvedTheme];

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider theme={theme} resolvedTheme={resolvedTheme} changeTheme={changeTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="books/[bookId]" />
        <Stack.Screen name="chapters/[chapterId]" />
        <Stack.Screen name="flashcards/[chapterId]" />
        <Stack.Screen name="quiz/[chapterId]" />
        <Stack.Screen name="quiz/result" />
        <Stack.Screen name="videos/[chapterId]" />
      </Stack>
    </ThemeProvider>
  );
}
