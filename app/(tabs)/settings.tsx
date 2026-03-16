import { useState } from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';
import { resetAllProgress } from '../../src/db/repositories';

export default function SettingsScreen() {
  const { theme, changeTheme, colors } = useTheme();
  const [message, setMessage] = useState('');

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Settings</Text>
      <Text style={{ color: colors.muted }}>Theme: {theme}</Text>
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
      {message ? <Text style={{ color: colors.text }}>{message}</Text> : null}
      <Text style={{ color: colors.muted }}>Awwal Arabic is an original learning MVP with local-first data and offline persistence.</Text>
    </Screen>
  );
}
