import { Pressable, StyleSheet, Text } from 'react-native';

export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <Pressable style={[styles.button, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
    <Text style={styles.text}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: { backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  text: { color: '#fff', fontWeight: '700' },
});
