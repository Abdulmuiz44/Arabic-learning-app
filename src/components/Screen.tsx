import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export const Screen = ({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) => {
  if (scroll) return <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>;
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
});
