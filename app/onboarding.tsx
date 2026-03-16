import { router } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '../src/components/Screen';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useTheme } from '../src/constants/theme';
import { setOnboardingDone } from '../src/db/sqlite';

export default function OnboardingScreen() {
  const { colors } = useTheme();

  return (
    <Screen scroll={false}>
      <Text style={{ fontSize: 34, fontWeight: '800', marginTop: 40, color: colors.text }}>Awwal Arabic</Text>
      <Text style={{ fontSize: 16, lineHeight: 24, color: colors.muted }}>
        Your Arabic learning companion for lessons, flashcards, quizzes, and notes.
      </Text>
      <PrimaryButton
        label="Get Started"
        onPress={async () => {
          await setOnboardingDone();
          router.replace('/(tabs)');
        }}
      />
    </Screen>
  );
}
