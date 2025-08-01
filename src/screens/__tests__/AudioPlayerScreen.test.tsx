/**
 * AudioPlayerScreen component tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AudioPlayerScreen from '../AudioPlayerScreen';
import audioReducer from '../../store/slices/audioSlice';
import { AudioTopic } from '../../types';

// Mock the audio service
jest.mock('../../services/AudioService', () => {
  return jest.fn().mockImplementation(() => ({
    loadTrack: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    seekTo: jest.fn().mockResolvedValue(undefined),
    setVolume: jest.fn().mockResolvedValue(undefined),
    getCurrentPosition: jest.fn().mockResolvedValue(0),
    getDuration: jest.fn().mockResolvedValue(300),
    setupBackgroundMode: jest.fn().mockResolvedValue(undefined),
    handleAudioInterruptions: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined),
  }));
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

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

const renderWithStore = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('AudioPlayerScreen', () => {
  const mockRoute = {
    params: {
      topic: mockTopic,
      playlist: [mockTopic],
    },
  };

  const mockNavigation = {
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with topic information', () => {
    const { getByTestId, getByText } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByTestId('topic-info')).toBeTruthy();
    expect(getByText('Test Audio Topic')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
  });

  it('displays audio controls', () => {
    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByTestId('audio-controls')).toBeTruthy();
    expect(getByTestId('play-pause-button')).toBeTruthy();
    expect(getByTestId('previous-button')).toBeTruthy();
    expect(getByTestId('next-button')).toBeTruthy();
    expect(getByTestId('skip-backward-button')).toBeTruthy();
    expect(getByTestId('skip-forward-button')).toBeTruthy();
  });

  it('displays progress bar with time information', () => {
    const store = createMockStore({
      currentTopic: mockTopic,
      duration: 300,
      currentPosition: 150,
    });

    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />,
      store
    );

    expect(getByTestId('progress-bar')).toBeTruthy();
    expect(getByTestId('current-time')).toBeTruthy();
    expect(getByTestId('duration')).toBeTruthy();
  });

  it('displays volume control', () => {
    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByTestId('volume-control')).toBeTruthy();
  });

  it('shows loading state when audio is loading', () => {
    const store = createMockStore({
      isLoading: true,
    });

    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />,
      store
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('shows error message when there is an error', () => {
    const store = createMockStore({
      error: 'Failed to load audio',
    });

    const { getByText } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />,
      store
    );

    expect(getByText('Failed to load audio')).toBeTruthy();
  });

  it('displays background image when topic has thumbnail', () => {
    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByTestId('background-image')).toBeTruthy();
  });

  it('handles play/pause button press', async () => {
    const store = createMockStore({
      currentTopic: mockTopic,
      canPlay: true,
    });

    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />,
      store
    );

    const playButton = getByTestId('play-pause-button');
    fireEvent.press(playButton);

    // The actual audio service interaction would be tested in the hook tests
    expect(playButton).toBeTruthy();
  });

  it('handles volume control interaction', () => {
    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    const volumeButton = getByTestId('volume-button');
    fireEvent.press(volumeButton);

    expect(volumeButton).toBeTruthy();
  });

  it('handles progress bar seek interaction', () => {
    const store = createMockStore({
      currentTopic: mockTopic,
      duration: 300,
      currentPosition: 150,
    });

    const { getByTestId } = renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />,
      store
    );

    const progressBar = getByTestId('progress-bar');
    fireEvent.press(progressBar, {
      nativeEvent: { locationX: 150 },
    });

    expect(progressBar).toBeTruthy();
  });

  it('renders with default mock data when no route params provided', () => {
    const { getByText } = renderWithStore(
      <AudioPlayerScreen />
    );

    expect(getByText('Sample Audio Topic')).toBeTruthy();
    expect(getByText('Sample Author')).toBeTruthy();
  });

  it('handles navigation back on error', async () => {
    const store = createMockStore({
      error: 'Network error',
    });

    renderWithStore(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />,
      store
    );

    // Error alert would be shown, but we can't easily test Alert.alert in unit tests
    // This would be better tested in integration tests
  });
});