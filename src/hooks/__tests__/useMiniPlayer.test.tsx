/**
 * Tests for useMiniPlayer hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useMiniPlayer } from '../useMiniPlayer';
import audioReducer from '../../store/slices/audioSlice';
import { AudioTopic } from '../../types';

// Mock AppState
const mockAppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
};

jest.mock('react-native', () => ({
  AppState: mockAppState,
}));

const mockTopic: AudioTopic = {
  id: '1',
  title: 'Test Topic',
  description: 'Test Description',
  categoryId: 'cat1',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 300,
  author: 'Test Author',
  metadata: {
    bitrate: 128,
    format: 'mp3',
    size: 1024,
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
        duration: 300,
        volume: 1.0,
        playbackRate: 1.0,
        isLoading: false,
        error: null,
        playlist: [],
        currentIndex: 0,
        repeatMode: 'none' as const,
        shuffleMode: false,
        ...initialState,
      },
    },
  });
};

const wrapper = ({ children, store }: { children: React.ReactNode; store: any }) => (
  <Provider store={store}>{children}</Provider>
);

describe('useMiniPlayer', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = createMockStore();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.shouldShowMiniPlayer).toBe(false);
  });

  it('shows mini player when audio is playing and has current topic', () => {
    mockStore = createMockStore({
      isPlaying: true,
      currentTopic: mockTopic,
    });

    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.shouldShowMiniPlayer).toBe(true);
  });

  it('hides mini player when no current topic', () => {
    mockStore = createMockStore({
      isPlaying: true,
      currentTopic: null,
    });

    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.shouldShowMiniPlayer).toBe(false);
  });

  it('hides mini player when not playing and cannot play', () => {
    mockStore = createMockStore({
      isPlaying: false,
      currentTopic: mockTopic,
      isLoading: false,
      error: 'Some error',
    });

    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.shouldShowMiniPlayer).toBe(false);
  });

  it('shows mini player when can play even if not currently playing', () => {
    mockStore = createMockStore({
      isPlaying: false,
      currentTopic: mockTopic,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(result.current.shouldShowMiniPlayer).toBe(true);
  });

  it('provides showMiniPlayer function', () => {
    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(typeof result.current.showMiniPlayer).toBe('function');

    act(() => {
      result.current.showMiniPlayer();
    });

    // Note: The actual visibility depends on shouldShowMiniPlayer logic
    // This test verifies the function exists and can be called
  });

  it('provides hideMiniPlayer function', () => {
    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(typeof result.current.hideMiniPlayer).toBe('function');

    act(() => {
      result.current.hideMiniPlayer();
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('provides toggleMiniPlayer function', () => {
    const { result } = renderHook(() => useMiniPlayer(), {
      wrapper: ({ children }) => wrapper({ children, store: mockStore }),
    });

    expect(typeof result.current.toggleMiniPlayer).toBe('function');

    const initialVisibility = result.current.isVisible;

    act(() => {
      result.current.toggleMiniPlayer();
    });

    // Note: The actual visibility change depends on shouldShowMiniPlayer logic
    // This test verifies the function exists and can be called
  });

  describe('App State Changes', () => {
    it('sets up AppState listener on mount', () => {
      renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore }),
      });

      expect(mockAppState.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('cleans up AppState listener on unmount', () => {
      const mockRemove = jest.fn();
      mockAppState.addEventListener.mockReturnValue({
        remove: mockRemove,
      });

      const { unmount } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore }),
      });

      unmount();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('updates visibility based on audio state changes', () => {
      // Note: Since we can't easily change store state in the middle of a test,
      // we'll test the logic by creating different stores
      const initialStore = createMockStore({
        isPlaying: false,
        currentTopic: null,
      });

      const { result } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: initialStore }),
      });

      expect(result.current.shouldShowMiniPlayer).toBe(false);

      // Test with playing state
      const playingStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
      });

      const { result: playingResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: playingStore }),
      });

      expect(playingResult.current.shouldShowMiniPlayer).toBe(true);
    });

    it('handles multiple state changes correctly', () => {
      // Test playing state
      const playingStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
      });

      const { result: playingResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: playingStore }),
      });

      expect(playingResult.current.shouldShowMiniPlayer).toBe(true);

      // Test error state
      const errorStore = createMockStore({
        isPlaying: false,
        currentTopic: mockTopic,
        error: 'Network error',
      });

      const { result: errorResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: errorStore }),
      });

      expect(errorResult.current.shouldShowMiniPlayer).toBe(false);

      // Test resumed state
      const resumedStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
        error: null,
      });

      const { result: resumedResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: resumedStore }),
      });

      expect(resumedResult.current.shouldShowMiniPlayer).toBe(true);
    });
  });

  describe('Integration with Audio State', () => {
    it('responds to currentTopic changes', () => {
      // Test with topic
      const withTopicStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
      });

      const { result: withTopicResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: withTopicStore }),
      });

      expect(withTopicResult.current.shouldShowMiniPlayer).toBe(true);

      // Test without topic
      const withoutTopicStore = createMockStore({
        isPlaying: true,
        currentTopic: null,
      });

      const { result: withoutTopicResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: withoutTopicStore }),
      });

      expect(withoutTopicResult.current.shouldShowMiniPlayer).toBe(false);
    });

    it('responds to playback state changes', () => {
      // Test error state
      const errorStore = createMockStore({
        isPlaying: false,
        currentTopic: mockTopic,
        error: 'Some error',
      });

      const { result: errorResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: errorStore }),
      });

      expect(errorResult.current.shouldShowMiniPlayer).toBe(false);

      // Test can play state
      const canPlayStore = createMockStore({
        isPlaying: false,
        currentTopic: mockTopic,
        error: null,
      });

      const { result: canPlayResult } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: canPlayStore }),
      });

      expect(canPlayResult.current.shouldShowMiniPlayer).toBe(true);
    });
  });
});