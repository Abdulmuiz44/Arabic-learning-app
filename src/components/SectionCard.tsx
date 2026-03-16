import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../constants/theme';

export const SectionCard = ({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) => {
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.muted }}>{subtitle}</Text> : null}
      {children}
    </View>
  );
};
