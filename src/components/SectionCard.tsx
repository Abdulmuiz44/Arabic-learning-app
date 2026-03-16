import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const SectionCard = ({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#475569' },
});
