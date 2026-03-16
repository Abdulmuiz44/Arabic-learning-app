declare module 'expo-av' {
  export namespace Audio {
    type PlaybackStatus = {
      isLoaded: boolean;
      isPlaying?: boolean;
      didJustFinish?: boolean;
      error?: string;
    };

    class Sound {
      static createAsync(
        source: { uri: string },
        initialStatus?: Record<string, unknown>,
        onPlaybackStatusUpdate?: (status: PlaybackStatus) => void,
      ): Promise<{ sound: Sound }>;
      stopAsync(): Promise<void>;
      unloadAsync(): Promise<void>;
      pauseAsync(): Promise<void>;
      replayAsync(): Promise<void>;
    }

    function setAudioModeAsync(mode: Record<string, unknown>): Promise<void>;
  }
}
