import { Pressable, Text } from 'react-native';
import { useTheme } from '../constants/theme';

export const PrimaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const { colors } = useTheme();

  return (
    <Pressable style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' }} onPress={onPress}>
      <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
};
