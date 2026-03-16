import { router } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '../src/components/Screen';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { setOnboardingDone } from '../src/db/sqlite';

export default function OnboardingScreen() {
  return (
    <Screen scroll={false}>
      <Text style={{ fontSize: 34, fontWeight: '800', marginTop: 40 }}>Awwal Arabic</Text>
      <Text style={{ fontSize: 16, lineHeight: 24 }}>
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
