import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { getOnboardingDone } from '../src/db/sqlite';

export default function Index() {
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    getOnboardingDone().then(setDone);
  }, []);

  if (done === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={done ? '/(tabs)' : '/onboarding'} />;
}
