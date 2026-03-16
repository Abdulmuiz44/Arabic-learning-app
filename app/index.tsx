import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { palette } from '../src/constants/theme';
import { getOnboardingDone, getTheme } from '../src/db/sqlite';

export default function Index() {
  const [done, setDone] = useState<boolean | null>(null);
  const [loadingTheme, setLoadingTheme] = useState<keyof typeof palette>('light');

  useEffect(() => {
    getOnboardingDone().then(setDone);
    getTheme().then((theme) => {
      setLoadingTheme(theme === 'dark' ? 'dark' : 'light');
    });
  }, []);

  if (done === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette[loadingTheme].bg }}>
        <ActivityIndicator color={palette[loadingTheme].primary} />
      </View>
    );
  }

  return <Redirect href={done ? '/(tabs)' : '/onboarding'} />;
}
