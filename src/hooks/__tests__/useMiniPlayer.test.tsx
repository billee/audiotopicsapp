/**
 * Tests for useMiniPlayer hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useMiniPlayer } from '../useMiniPlayer';

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

// Mock Redux selectors
jest.mock('../../store/selectors/audioSelectors', () => ({
  selectCurrentTopic: jest.fn(() => null),
  selectIsPlaying: jest.fn(() => false),
  selectCanPlay: jest.fn(() => false),
}));

// Mock useSelector
jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => selector()),
}));

describe('useMiniPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useMiniPlayer());

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

      expect(AppState.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('cleans up AppState listener on unmount', () => {
      const mockRemove = jest.fn();
      (AppState.addEventListener as jest.Mock).mockReturnValue({
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
      mockStore = createMockStore({
        isPlaying: false,
        currentTopic: null,
      });

      const { result, rerender } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore }),
      });

      expect(result.current.shouldShowMiniPlayer).toBe(false);

      // Update store state
      mockStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
      });

      rerender();

      expect(result.current.shouldShowMiniPlayer).toBe(true);
    });

    it('handles multiple state changes correctly', () => {
      mockStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
      });

      const { result, rerender } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore }),
      });

      expect(result.current.shouldShowMiniPlayer).toBe(true);

      // Stop playing
      mockStore = createMockStore({
        isPlaying: false,
        currentTopic: mockTopic,
        error: 'Network error',
      });

      rerender();

      expect(result.current.shouldShowMiniPlayer).toBe(false);

      // Resume playing
      mockStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
        error: null,
      });

      rerender();

      expect(result.current.shouldShowMiniPlayer).toBe(true);
    });
  });

  describe('Integration with Audio State', () => {
    it('responds to currentTopic changes', () => {
      mockStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
      });

      const { result, rerender } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore }),
      });

      expect(result.current.shouldShowMiniPlayer).toBe(true);

      // Clear current topic
      mockStore = createMockStore({
        isPlaying: true,
        currentTopic: null,
      });

      rerender();

      expect(result.current.shouldShowMiniPlayer).toBe(false);
    });

    it('responds to playback state changes', () => {
      mockStore = createMockStore({
        isPlaying: false,
        currentTopic: mockTopic,
        error: 'Some error',
      });

      const { result, rerender } = renderHook(() => useMiniPlayer(), {
        wrapper: ({ children }) => wrapper({ children, store: mockStore }),
      });

      expect(result.current.shouldShowMiniPlayer).toBe(false);

      // Clear error to enable playback
      mockStore = createMockStore({
        isPlaying: false,
        currentTopic: mockTopic,
        error: null,
      });

      rerender();

      expect(result.current.shouldShowMiniPlayer).toBe(true);
    });
  });
});