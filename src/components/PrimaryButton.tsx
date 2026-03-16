import { Pressable, StyleSheet, Text } from 'react-native';

export const PrimaryButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: { backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  text: { color: '#fff', fontWeight: '700' },
});
