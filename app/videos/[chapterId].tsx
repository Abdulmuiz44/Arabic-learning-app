import { useLocalSearchParams } from 'expo-router';
import { Linking, Text, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/constants/theme';
import { getVideosForChapter } from '../../src/features/videos/selectors';

export default function VideosScreen() {
  const { colors } = useTheme();
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const videos = getVideosForChapter(chapterId);

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Chapter videos</Text>
      {videos.length === 0 ? <Text style={{ color: colors.muted }}>No videos yet.</Text> : videos.map((video) => (
        <View key={video.id} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 8, gap: 6 }}>
          <Text style={{ fontWeight: '700', color: colors.text }}>{video.title}</Text>
          <Text style={{ color: colors.link }} onPress={() => Linking.openURL(video.youtubeUrl)}>Open video</Text>
        </View>
      ))}
    </Screen>
  );
}
