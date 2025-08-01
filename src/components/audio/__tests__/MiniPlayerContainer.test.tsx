/**
 * Tests for MiniPlayerContainer component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MiniPlayerContainer from '../MiniPlayerContainer';
import audioReducer from '../../../store/slices/audioSlice';
import { AudioTopic } from '../../../types';

// Mock the hooks
jest.mock('../../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    togglePlayback: jest.fn(),
    skipNext: jest.fn(),
    skipPrevious: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useMiniPlayer', () => ({
  useMiniPlayer: () => ({
    isVisible: true,
    hideMiniPlayer: jest.fn(),
  }),
}));

// Mock react-native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback()),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
      })),
    },
  };
});

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
        currentTopic: mockTopic,
        currentPosition: 0,
        duration: 300,
        volume: 1.0,
        playbackRate: 1.0,
        isLoading: false,
        error: null,
        playlist: [mockTopic],
        currentIndex: 0,
        repeatMode: 'none' as const,
        shuffleMode: false,
        ...initialState,
      },
    },
  });
};

const Stack = createStackNavigator();

const TestScreen = () => null;

const NavigationWrapper: React.FC<{ children: React.ReactNode; store: any }> = ({
  children,
  store,
}) => (
  <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="AudioPlayer" component={TestScreen} />
      </Stack.Navigator>
      {children}
    </NavigationContainer>
  </Provider>
);

describe('MiniPlayerContainer', () => {
  let mockStore: ReturnType<typeof createMockStore>;
  let mockTogglePlayback: jest.Mock;
  let mockSkipNext: jest.Mock;
  let mockSkipPrevious: jest.Mock;
  let mockHideMiniPlayer: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = createMockStore();

    mockTogglePlayback = jest.fn();
    mockSkipNext = jest.fn();
    mockSkipPrevious = jest.fn();
    mockHideMiniPlayer = jest.fn();

    // Update mocks
    require('../../../hooks/useAudioPlayer').useAudioPlayer.mockReturnValue({
      togglePlayback: mockTogglePlayback,
      skipNext: mockSkipNext,
      skipPrevious: mockSkipPrevious,
    });

    require('../../../hooks/useMiniPlayer').useMiniPlayer.mockReturnValue({
      isVisible: true,
      hideMiniPlayer: mockHideMiniPlayer,
    });
  });

  it('renders MiniPlayer with correct props', () => {
    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    expect(getByTestId('mini-player')).toBeTruthy();
  });

  it('calls togglePlayback when play/pause is pressed', async () => {
    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-play-pause'));

    await waitFor(() => {
      expect(mockTogglePlayback).toHaveBeenCalledTimes(1);
    });
  });

  it('calls skipNext when next button is pressed', () => {
    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-next'));

    expect(mockSkipNext).toHaveBeenCalledTimes(1);
  });

  it('calls skipPrevious when previous button is pressed', () => {
    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-previous'));

    expect(mockSkipPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls hideMiniPlayer when close button is pressed', () => {
    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-close'));

    expect(mockHideMiniPlayer).toHaveBeenCalledTimes(1);
  });

  it('calls custom onNavigateToPlayer when expand is pressed', () => {
    const mockNavigateToPlayer = jest.fn();
    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer onNavigateToPlayer={mockNavigateToPlayer} />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-expand'));

    expect(mockNavigateToPlayer).toHaveBeenCalledTimes(1);
  });

  it('handles errors in togglePlayback gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockTogglePlayback.mockRejectedValue(new Error('Playback failed'));

    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-play-pause'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to toggle playback from mini player:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('handles errors in skipNext gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockSkipNext.mockImplementation(() => {
      throw new Error('Skip failed');
    });

    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-next'));

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to skip to next track from mini player:',
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  it('handles errors in skipPrevious gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockSkipPrevious.mockImplementation(() => {
      throw new Error('Skip failed');
    });

    const { getByTestId } = render(
      <NavigationWrapper store={mockStore}>
        <MiniPlayerContainer />
      </NavigationWrapper>
    );

    fireEvent.press(getByTestId('mini-player-previous'));

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to skip to previous track from mini player:',
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  describe('Redux State Integration', () => {
    it('passes correct audio state to MiniPlayer', () => {
      mockStore = createMockStore({
        isPlaying: true,
        currentTopic: mockTopic,
      });

      const { getByText } = render(
        <NavigationWrapper store={mockStore}>
          <MiniPlayerContainer />
        </NavigationWrapper>
      );

      expect(getByText('Test Topic')).toBeTruthy();
      expect(getByText('Test Author')).toBeTruthy();
    });

    it('updates when Redux state changes', () => {
      const { rerender, getByText } = render(
        <NavigationWrapper store={mockStore}>
          <MiniPlayerContainer />
        </NavigationWrapper>
      );

      expect(getByText('Test Topic')).toBeTruthy();

      // Update store with new topic
      const newTopic = { ...mockTopic, title: 'New Topic', author: 'New Author' };
      mockStore = createMockStore({
        currentTopic: newTopic,
      });

      rerender(
        <NavigationWrapper store={mockStore}>
          <MiniPlayerContainer />
        </NavigationWrapper>
      );

      expect(getByText('New Topic')).toBeTruthy();
      expect(getByText('New Author')).toBeTruthy();
    });
  });

  describe('Hook Integration', () => {
    it('responds to useMiniPlayer visibility changes', () => {
      // Mock hook to return invisible
      require('../../../hooks/useMiniPlayer').useMiniPlayer.mockReturnValue({
        isVisible: false,
        hideMiniPlayer: mockHideMiniPlayer,
      });

      const { queryByTestId } = render(
        <NavigationWrapper store={mockStore}>
          <MiniPlayerContainer />
        </NavigationWrapper>
      );

      // MiniPlayer should still render but with isVisible=false
      // The actual visibility is handled by the MiniPlayer component's animation
      expect(queryByTestId('mini-player')).toBeTruthy();
    });

    it('integrates with useAudioPlayer hook correctly', () => {
      const customMockPlayer = {
        togglePlayback: jest.fn(),
        skipNext: jest.fn(),
        skipPrevious: jest.fn(),
      };

      require('../../../hooks/useAudioPlayer').useAudioPlayer.mockReturnValue(customMockPlayer);

      const { getByTestId } = render(
        <NavigationWrapper store={mockStore}>
          <MiniPlayerContainer />
        </NavigationWrapper>
      );

      fireEvent.press(getByTestId('mini-player-play-pause'));
      fireEvent.press(getByTestId('mini-player-next'));
      fireEvent.press(getByTestId('mini-player-previous'));

      expect(customMockPlayer.togglePlayback).toHaveBeenCalledTimes(1);
      expect(customMockPlayer.skipNext).toHaveBeenCalledTimes(1);
      expect(customMockPlayer.skipPrevious).toHaveBeenCalledTimes(1);
    });
  });
});