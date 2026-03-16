import { Linking, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { getVideosForChapter } from '../../src/features/videos/selectors';

export default function VideosScreen() {
  const { chapterId: rawChapterId } = useLocalSearchParams<{ chapterId?: string | string[] }>();
  const chapterId = typeof rawChapterId === 'string' ? rawChapterId : null;
  const videos = chapterId ? getVideosForChapter(chapterId) : [];

  if (!chapterId) return <Screen><Text>Invalid chapter route parameter.</Text></Screen>;

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Chapter videos</Text>
      {videos.length === 0 ? <Text>No videos yet.</Text> : videos.map((video) => (
        <View key={video.id} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, gap: 6 }}>
          <Text style={{ fontWeight: '700' }}>{video.title}</Text>
          <Text style={{ color: '#2563EB' }} onPress={() => Linking.openURL(video.youtubeUrl)}>Open video</Text>
        </View>
      ))}
    </Screen>
  );
}
