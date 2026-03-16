import { type Href } from 'expo-router';
import { Text } from 'react-native';
import { ActionLinkButton } from './ActionLinkButton';
import { SectionCard } from './SectionCard';

export const EmptyStateCard = ({
  title,
  message,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: Href;
}) => (
  <SectionCard title={title} subtitle={message}>
    <ActionLinkButton href={ctaHref} label={ctaLabel} />
    <Text style={{ color: '#64748B', fontSize: 12 }}>Tip: small daily practice builds steady progress.</Text>
  </SectionCard>
);
