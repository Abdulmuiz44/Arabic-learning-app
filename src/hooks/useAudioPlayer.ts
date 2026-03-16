import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { localAudioRegistry } from '../audio/audioRegistry';

type AudioRef = { audioUrl?: string; localAudioKey?: string };

type PlaybackState = {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  activeSource: string | null;
};

let sharedSound: Audio.Sound | null = null;
let sharedActiveSource: string | null = null;

const resolveAudioSource = (input: AudioRef): string | null => {
  if (input.audioUrl) return input.audioUrl;
  if (input.localAudioKey) return localAudioRegistry[input.localAudioKey] ?? null;
  return null;
};

export const useAudioPlayer = () => {
  const [state, setState] = useState<PlaybackState>({
    isLoading: false,
    isPlaying: false,
    error: null,
    activeSource: null,
  });
  const mountedRef = useRef(true);

  const updateState = useCallback((partial: Partial<PlaybackState>) => {
    if (!mountedRef.current) return;
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const stop = useCallback(async () => {
    if (!sharedSound) {
      updateState({ isPlaying: false, activeSource: null });
      return;
    }

    try {
      await sharedSound.stopAsync();
      await sharedSound.unloadAsync();
    } finally {
      sharedSound = null;
      sharedActiveSource = null;
      updateState({ isPlaying: false, isLoading: false, activeSource: null });
    }
  }, [updateState]);

  const play = useCallback(async (input: AudioRef) => {
    const source = resolveAudioSource(input);
    if (!source) {
      updateState({ error: 'Audio is not available for this item.' });
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      if (sharedSound) {
        await sharedSound.stopAsync();
        await sharedSound.unloadAsync();
        sharedSound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: source },
        { shouldPlay: true },
        (status) => {
          if (!mountedRef.current) return;
          if (!status.isLoaded) {
            if (status.error) {
              updateState({ error: status.error, isPlaying: false, isLoading: false });
            }
            return;
          }
          updateState({
            isLoading: false,
            isPlaying: status.isPlaying,
            activeSource: source,
          });
          if (status.didJustFinish) {
            updateState({ isPlaying: false });
          }
        },
      );

      sharedSound = sound;
      sharedActiveSource = source;
      updateState({ isLoading: false, isPlaying: true, activeSource: source });
    } catch {
      updateState({ error: 'Unable to play audio.', isLoading: false, isPlaying: false });
    }
  }, [updateState]);

  const pause = useCallback(async () => {
    if (!sharedSound || !sharedActiveSource) return;
    await sharedSound.pauseAsync();
    updateState({ isPlaying: false, activeSource: sharedActiveSource });
  }, [updateState]);

  const replay = useCallback(async (input: AudioRef) => {
    const source = resolveAudioSource(input);
    if (!source) {
      updateState({ error: 'Audio is not available for this item.' });
      return;
    }

    if (sharedSound && sharedActiveSource === source) {
      try {
        await sharedSound.replayAsync();
        updateState({ isPlaying: true, error: null, activeSource: source });
        return;
      } catch {
        // fallback to fresh play
      }
    }

    await play(input);
  }, [play, updateState]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      void stop();
    };
  }, [stop]);

  return {
    play,
    pause,
    stop,
    replay,
    isLoading: state.isLoading,
    isPlaying: state.isPlaying,
    error: state.error,
    activeSource: state.activeSource,
    isCurrentSourcePlaying: (input: AudioRef) => {
      const source = resolveAudioSource(input);
      return Boolean(source && source === state.activeSource && state.isPlaying);
    },
  };
};
