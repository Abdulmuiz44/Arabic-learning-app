import { seed } from '../../data/seed';

export const getVideosForChapter = (chapterId: string) => seed.videos.filter((video) => video.chapterId === chapterId);
