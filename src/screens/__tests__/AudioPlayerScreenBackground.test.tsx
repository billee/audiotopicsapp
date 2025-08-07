/**
 * Test for AudioPlayerScreen background image functionality
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import AudioPlayerScreen from '../AudioPlayerScreen';
import { AudioTopic } from '../../types';

// Mock the hooks and components
jest.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    currentTopic: null,
    isPlaying: false,
    currentPosition: 0,
    duration: 0,
    isLoading: false,
    error: null,
    canPlay: true,
    hasNextTrack: false,
    hasPreviousTrack: false,
    progress: 0,
    formattedCurrentTime: '0:00',
    formattedDuration: '0:00',
    loadTopic: jest.fn(),
    togglePlayback: jest.fn(),
    seekTo: jest.fn(),
    skipNext: jest.fn(),
    skipPrevious: jest.fn(),
    skipForward: jest.fn(),
    skipBackward: jest.fn(),
  }),
}));

jest.mock('../../hooks/useProgress', () => ({
  useProgress: () => ({
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    updateTopicProgress: jest.fn(),
    markCompleted: jest.fn(),
  }),
}));

jest.mock('../../hooks/useOrientation', () => ({
  useResponsiveStyles: () => ({
    isLandscape: false,
    isTablet: false,
    getResponsiveStyle: (portrait: any, landscape: any) => portrait,
  }),
  useLayoutConfig: () => ({
    audioPlayer: {
      topicInfoFlex: 1,
      compactLayout: false,
      controlsSpacing: 20,
    },
  }),
}));

jest.mock('../../hooks/useBackgroundImage', () => ({
  useBackgroundImage: () => ({
    getBackgroundImage: jest.fn(() => 'https://example.com/ambient-background.jpg'),
    preloadSpecificImage: jest.fn(() => Promise.resolve(true)),
  }),
}));

jest.mock('../../assets/backgrounds', () => ({
  getRandomAmbientBackground: () => ({
    remote: 'https://example.com/random-ambient.jpg',
    description: 'Random ambient background',
  }),
}));

jest.mock('../../components/common', () => ({
  LoadingSpinner: ({ children }: any) => children,
  ErrorMessage: ({ children }: any) => children,
  BackgroundImage: ({ children, testID }: any) => (
    <div data-testid={testID}>{children}</div>
  ),
}));

jest.mock('../../components/audio', () => ({
  AudioControls: () => <div data-testid="audio-controls" />,
  ProgressBar: () => <div data-testid="progress-bar" />,
  TopicInfo: () => <div data-testid="topic-info" />,
}));

describe('AudioPlayerScreen Background', () => {
  const mockTopic: AudioTopic = {
    id: '1',
    title: 'Test Topic',
    description: 'Test Description',
    categoryId: 'technology',
    audioUrl: 'https://example.com/audio.mp3',
    duration: 300,
    author: 'Test Author',
    publishDate: new Date().toISOString(),
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    metadata: {
      bitrate: 128,
      format: 'mp3',
      size: 5000000,
    },
  };

  const mockRoute = {
    params: {
      topic: mockTopic,
      playlist: [],
    },
  };

  const mockNavigation = {
    goBack: jest.fn(),
  };

  it('renders with BackgroundImage component', () => {
    const { getByTestId } = render(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByTestId('audio-player-background')).toBeTruthy();
  });

  it('renders audio controls and topic info', () => {
    const { getByTestId } = render(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByTestId('audio-controls')).toBeTruthy();
    expect(getByTestId('topic-info')).toBeTruthy();
    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  it('renders back button', () => {
    const { getByTestId } = render(
      <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByTestId('back-button')).toBeTruthy();
  });
});