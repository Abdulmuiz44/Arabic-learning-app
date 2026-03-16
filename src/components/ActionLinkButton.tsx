import { Link, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

export const ActionLinkButton = ({ href, label }: { href: Href; label: string }) => (
  <Link href={href} asChild>
    <Pressable style={{ backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  </Link>
);
