/**
 * useAudioPlayer hook tests
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useAudioPlayer } from '../useAudioPlayer';
import audioReducer from '../../store/slices/audioSlice';
import { AudioTopic } from '../../types';

// Mock the audio service
const mockAudioService = {
  loadTrack: jest.fn().mockResolvedValue(undefined),
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  seekTo: jest.fn().mockResolvedValue(undefined),
  setVolume: jest.fn().mockResolvedValue(undefined),
  getCurrentPosition: jest.fn().mockResolvedValue(0),
  getDuration: jest.fn().mockResolvedValue(300),
  setPlaybackRate: jest.fn().mockResolvedValue(undefined),
  setupBackgroundMode: jest.fn().mockResolvedValue(undefined),
  handleAudioInterruptions: jest.fn(),
  destroy: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../services/AudioService', () => {
  return jest.fn().mockImplementation(() => mockAudioService);
});

const mockTopic: AudioTopic = {
  id: '1',
  title: 'Test Audio Topic',
  description: 'This is a test audio topic',
  categoryId: 'category1',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 300,
  author: 'Test Author',
  publishDate: new Date('2023-01-01'),
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  metadata: {
    bitrate: 128,
    format: 'mp3',
    size: 5000000,
  },
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      audio: audioReducer,
    },
    preloadedState: {
      audio: {
        isPlaying: false,
        currentTopic: null,
        currentPosition: 0,
        duration: 0,
        volume: 1.0,
        playbackRate: 1.0,
        isLoading: false,
        error: null,
        playlist: [],
        currentIndex: -1,
        repeatMode: 'none' as const,
        shuffleMode: false,
        ...initialState,
      },
    },
  });
};

const createWrapper = (store = createMockStore()) => {
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useAudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentTopic).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPosition).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(result.current.volume).toBe(1.0);
    expect(result.current.playbackRate).toBe(1.0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.canPlay).toBe(false);
  });

  it('loads a topic successfully', async () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loadTopic(mockTopic);
    });

    expect(mockAudioService.loadTrack).toHaveBeenCalledWith(mockTopic);
    expect(mockAudioService.getDuration).toHaveBeenCalled();
  });

  it('handles load topic error', async () => {
    mockAudioService.loadTrack.mockRejectedValueOnce(new Error('Load failed'));

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loadTopic(mockTopic);
    });

    expect(result.current.error).toBe('Load failed');
    expect(result.current.isLoading).toBe(false);
  });

  it('plays audio successfully', async () => {
    const store = createMockStore({
      currentTopic: mockTopic,
      canPlay: true,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.play();
    });

    expect(mockAudioService.play).toHaveBeenCalled();
  });

  it('pauses audio successfully', async () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.pause();
    });

    expect(mockAudioService.pause).toHaveBeenCalled();
  });

  it('toggles playback correctly', async () => {
    const store = createMockStore({
      currentTopic: mockTopic,
      isPlaying: false,
      canPlay: true,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    // Should play when not playing
    await act(async () => {
      await result.current.togglePlayback();
    });

    expect(mockAudioService.play).toHaveBeenCalled();
  });

  it('seeks to position successfully', async () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.seekTo(150);
    });

    expect(mockAudioService.seekTo).toHaveBeenCalledWith(150);
  });

  it('sets volume successfully', async () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.setVolumeLevel(0.5);
    });

    expect(mockAudioService.setVolume).toHaveBeenCalledWith(0.5);
  });

  it('sets playback rate successfully', async () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.setRate(1.5);
    });

    expect(mockAudioService.setPlaybackRate).toHaveBeenCalledWith(1.5);
  });

  it('skips forward by default amount', async () => {
    const store = createMockStore({
      currentPosition: 100,
      duration: 300,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.skipForward();
    });

    expect(mockAudioService.seekTo).toHaveBeenCalledWith(115); // 100 + 15
  });

  it('skips forward by custom amount', async () => {
    const store = createMockStore({
      currentPosition: 100,
      duration: 300,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.skipForward(30);
    });

    expect(mockAudioService.seekTo).toHaveBeenCalledWith(130); // 100 + 30
  });

  it('skips backward by default amount', async () => {
    const store = createMockStore({
      currentPosition: 100,
      duration: 300,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.skipBackward();
    });

    expect(mockAudioService.seekTo).toHaveBeenCalledWith(85); // 100 - 15
  });

  it('prevents seeking beyond duration when skipping forward', async () => {
    const store = createMockStore({
      currentPosition: 290,
      duration: 300,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.skipForward();
    });

    expect(mockAudioService.seekTo).toHaveBeenCalledWith(300); // Capped at duration
  });

  it('prevents seeking below zero when skipping backward', async () => {
    const store = createMockStore({
      currentPosition: 10,
      duration: 300,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.skipBackward();
    });

    expect(mockAudioService.seekTo).toHaveBeenCalledWith(0); // Capped at 0
  });

  it('handles play error', async () => {
    mockAudioService.play.mockRejectedValueOnce(new Error('Play failed'));

    const store = createMockStore({
      currentTopic: mockTopic,
      canPlay: true,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.play();
    });

    expect(result.current.error).toBe('Play failed');
  });

  it('handles pause error', async () => {
    mockAudioService.pause.mockRejectedValueOnce(new Error('Pause failed'));

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.pause();
    });

    expect(result.current.error).toBe('Pause failed');
  });

  it('handles seek error', async () => {
    mockAudioService.seekTo.mockRejectedValueOnce(new Error('Seek failed'));

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.seekTo(150);
    });

    expect(result.current.error).toBe('Seek failed');
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(),
    });

    unmount();

    expect(mockAudioService.destroy).toHaveBeenCalled();
  });

  it('provides formatted time strings', () => {
    const store = createMockStore({
      currentPosition: 150,
      duration: 300,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.formattedCurrentTime).toBe('2:30');
    expect(result.current.formattedDuration).toBe('5:00');
  });

  it('calculates progress correctly', () => {
    const store = createMockStore({
      currentPosition: 150,
      duration: 300,
    });

    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: createWrapper(store),
    });

    expect(result.current.progress).toBe(0.5); // 150/300
  });
});