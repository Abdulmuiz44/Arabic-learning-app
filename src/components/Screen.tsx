import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '../constants/theme';

export const Screen = ({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) => {
  const { colors } = useTheme();

  const containerStyle = {
    padding: 16,
    gap: 12,
    flexGrow: 1,
    backgroundColor: colors.bg,
  } as const;

  if (scroll) return <ScrollView contentContainerStyle={containerStyle}>{children}</ScrollView>;
  return <View style={containerStyle}>{children}</View>;
};
