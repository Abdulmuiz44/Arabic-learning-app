import { Linking, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { EmptyStateCard } from '../../src/components/EmptyStateCard';
import { Screen } from '../../src/components/Screen';
import { SectionCard } from '../../src/components/SectionCard';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { getVideosForChapter } from '../../src/features/videos/selectors';

export default function VideosScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const videos = getVideosForChapter(chapterId);

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Chapter videos</Text>
      {videos.length === 0 ? (
        <EmptyStateCard
          title="No videos yet"
          message="No supporting videos are linked for this chapter yet."
          ctaLabel="Back to lesson"
          ctaHref={`/chapters/${chapterId}` as const}
        />
      ) : videos.map((video) => (
        <SectionCard key={video.id} title={video.title}>
          <PrimaryButton label="Open video" onPress={() => Linking.openURL(video.youtubeUrl)} />
        </SectionCard>
      ))}
    </Screen>
  );
}
