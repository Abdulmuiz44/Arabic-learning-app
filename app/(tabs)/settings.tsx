import { useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { resetAllProgress } from '../../src/db/repositories';
import { useThemeSetting } from '../../src/hooks/useThemeSetting';

export default function SettingsScreen() {
  const { theme, changeTheme } = useThemeSetting();
  const [message, setMessage] = useState('');

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Settings</Text>
      <Text>Theme: {theme}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <PrimaryButton label="Light" onPress={() => changeTheme('light')} />
        <PrimaryButton label="Dark" onPress={() => changeTheme('dark')} />
        <PrimaryButton label="System" onPress={() => changeTheme('system')} />
      </View>
      <PrimaryButton
        label="Reset Progress"
        onPress={async () => {
          await resetAllProgress();
          setMessage('Progress reset complete.');
        }}
      />
      {message ? <Text>{message}</Text> : null}
      <Text style={{ color: '#64748B' }}>Awwal Arabic is an original learning MVP with local-first data and offline persistence.</Text>
    </Screen>
  );
}
