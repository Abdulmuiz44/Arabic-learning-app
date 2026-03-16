import { View } from 'react-native';

export const LoadingCard = () => (
  <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 10 }}>
    <View style={{ height: 18, width: '50%', borderRadius: 8, backgroundColor: '#E2E8F0' }} />
    <View style={{ height: 14, width: '90%', borderRadius: 8, backgroundColor: '#E2E8F0' }} />
    <View style={{ height: 14, width: '75%', borderRadius: 8, backgroundColor: '#E2E8F0' }} />
  </View>
);
