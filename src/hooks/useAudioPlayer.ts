/**
 * Custom hook for audio player functionality
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  selectAudioState,
  selectCurrentTopic,
  selectIsPlaying,
  selectCurrentPosition,
  selectDuration,
  selectVolume,
  selectPlaybackRate,
  selectIsLoading,
  selectAudioError,
  selectCanPlay,
  selectHasNextTrack,
  selectHasPreviousTrack,
  selectPlaybackProgress,
  selectFormattedCurrentTime,
  selectFormattedDuration,
} from '../store/selectors';
import {
  setCurrentTopic,
  setPlaybackState,
  setCurrentPosition,
  setDuration,
  setVolume,
  setPlaybackRate,
  setLoading,
  setError,
  nextTrack,
  previousTrack,
} from '../store/slices/audioSlice';
import AudioService from '../services/AudioService';
import { AudioTopic } from '../types';

export interface UseAudioPlayerReturn {
  // State
  currentTopic: AudioTopic | null;
  isPlaying: boolean;
  currentPosition: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
  canPlay: boolean;
  hasNextTrack: boolean;
  hasPreviousTrack: boolean;
  progress: number;
  formattedCurrentTime: string;
  formattedDuration: string;

  // Actions
  loadTopic: (topic: AudioTopic) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolumeLevel: (volume: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  skipNext: () => void;
  skipPrevious: () => void;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
}

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const audioServiceRef = useRef<AudioService | null>(null);
  const positionUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Selectors
  const currentTopic = useSelector(selectCurrentTopic);
  const isPlaying = useSelector(selectIsPlaying);
  const currentPosition = useSelector(selectCurrentPosition);
  const duration = useSelector(selectDuration);
  const volume = useSelector(selectVolume);
  const playbackRate = useSelector(selectPlaybackRate);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAudioError);
  const canPlay = useSelector(selectCanPlay);
  const hasNextTrack = useSelector(selectHasNextTrack);
  const hasPreviousTrack = useSelector(selectHasPreviousTrack);
  const progress = useSelector(selectPlaybackProgress);
  const formattedCurrentTime = useSelector(selectFormattedCurrentTime);
  const formattedDuration = useSelector(selectFormattedDuration);

  // Initialize audio service
  useEffect(() => {
    if (!audioServiceRef.current) {
      audioServiceRef.current = new AudioService();
    }

    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.destroy();
        audioServiceRef.current = null;
      }
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }
    };
  }, []);

  // Position update interval
  useEffect(() => {
    if (isPlaying && audioServiceRef.current) {
      positionUpdateIntervalRef.current = setInterval(async () => {
        try {
          const position = await audioServiceRef.current!.getCurrentPosition();
          dispatch(setCurrentPosition(position));
        } catch (error) {
          console.error('Failed to update position:', error);
        }
      }, 1000);
    } else {
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
        positionUpdateIntervalRef.current = null;
      }
    }

    return () => {
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }
    };
  }, [isPlaying, dispatch]);

  const loadTopic = useCallback(async (topic: AudioTopic) => {
    if (!audioServiceRef.current) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    // Ensure playback is stopped when loading a new topic
    dispatch(setPlaybackState(false));

    try {
      await audioServiceRef.current.loadTrack(topic);
      dispatch(setCurrentTopic(topic));

      const trackDuration = await audioServiceRef.current.getDuration();
      dispatch(setDuration(trackDuration));
      dispatch(setCurrentPosition(0));
    } catch (error) {
      console.error('Failed to load topic:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load topic';
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const play = useCallback(async () => {
    if (!audioServiceRef.current || !canPlay) return;

    try {
      // Update Redux state immediately (optimistic update)
      dispatch(setPlaybackState(true));
      dispatch(setError(null));

      // Start the audio (don't wait for callback)
      audioServiceRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error);
        // Revert the optimistic update if playback fails
        dispatch(setPlaybackState(false));
        dispatch(setError(error.message));
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to play audio';
      dispatch(setError(errorMessage));
      dispatch(setPlaybackState(false));
    }
  }, [dispatch, canPlay]);

  const pause = useCallback(async () => {
    if (!audioServiceRef.current) return;

    try {
      await audioServiceRef.current.pause();
      dispatch(setPlaybackState(false));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause audio';
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback(async (position: number) => {
    if (!audioServiceRef.current) return;

    try {
      await audioServiceRef.current.seekTo(position);
      dispatch(setCurrentPosition(position));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to seek';
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  const setVolumeLevel = useCallback(async (newVolume: number) => {
    if (!audioServiceRef.current) return;

    try {
      await audioServiceRef.current.setVolume(newVolume);
      dispatch(setVolume(newVolume));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set volume';
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  const setRate = useCallback(async (rate: number) => {
    if (!audioServiceRef.current) return;

    try {
      await audioServiceRef.current.setPlaybackRate(rate);
      dispatch(setPlaybackRate(rate));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set playback rate';
      dispatch(setError(errorMessage));
    }
  }, [dispatch]);

  const skipNext = useCallback(() => {
    dispatch(nextTrack());
  }, [dispatch]);

  const skipPrevious = useCallback(() => {
    dispatch(previousTrack());
  }, [dispatch]);

  const skipForward = useCallback(async (seconds: number = 15) => {
    const newPosition = Math.min(currentPosition + seconds, duration);
    await seekTo(newPosition);
  }, [currentPosition, duration, seekTo]);

  const skipBackward = useCallback(async (seconds: number = 15) => {
    const newPosition = Math.max(currentPosition - seconds, 0);
    await seekTo(newPosition);
  }, [currentPosition, seekTo]);

  return {
    // State
    currentTopic,
    isPlaying,
    currentPosition,
    duration,
    volume,
    playbackRate,
    isLoading,
    error,
    canPlay,
    hasNextTrack,
    hasPreviousTrack,
    progress,
    formattedCurrentTime,
    formattedDuration,

    // Actions
    loadTopic,
    play,
    pause,
    togglePlayback,
    seekTo,
    setVolumeLevel: setVolumeLevel,
    setRate,
    skipNext,
    skipPrevious,
    skipForward,
    skipBackward,
  };
};