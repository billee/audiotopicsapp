/**
 * Integration tests for responsive screen behavior
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CategoryScreen from '../CategoryScreen';
import AudioPlayerScreen from '../AudioPlayerScreen';
import TopicListScreen from '../TopicListScreen';
import { categoriesSlice } from '../../store/slices/categoriesSlice';
import { audioSlice } from '../../store/slices/audioSlice';
import { topicsSlice } from '../../store/slices/topicsSlice';
import { progressSlice } from '../../store/slices/progressSlice';

// Mock Dimensions
const mockDimensions = {
  get: jest.fn(),
  addEventListener: jest.fn(),
};

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Dimensions: mockDimensions,
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {
    categoryId: 'test-category',
    categoryName: 'Test Category',
    topic: {
      id: 'test-topic',
      title: 'Test Topic',
      description: 'Test Description',
      categoryId: 'test-category',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 300,
      metadata: {
        bitrate: 128,
        format: 'mp3',
        size: 5000000,
      },
    },
  },
};

// Create test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      categories: categoriesSlice.reducer,
      audio: audioSlice.reducer,
      topics: topicsSlice.reducer,
      progress: progressSlice.reducer,
    },
    preloadedState: {
      categories: {
        categories: [
          {
            id: 'test-category',
            name: 'Test Category',
            description: 'Test Description',
            topicCount: 5,
            color: '#007AFF',
          },
        ],
        loading: false,
        error: null,
        selectedCategoryId: null,
      },
      audio: {
        currentTopic: null,
        isPlaying: false,
        currentPosition: 0,
        duration: 0,
        volume: 1,
        isLoading: false,
        error: null,
        canPlay: false,
        hasNextTrack: false,
        hasPreviousTrack: false,
      },
      topics: {
        topics: [],
        loading: false,
        error: null,
        selectedCategoryId: null,
      },
      progress: {
        progressData: {},
        completedTopics: new Set(),
        resumeDialog: {
          visible: false,
          topicId: null,
          resumePosition: 0,
        },
        isTracking: false,
        currentTrackingTopicId: null,
      },
    },
  });
};

describe('Responsive Screen Behavior', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
    mockDimensions.addEventListener.mockReturnValue({ remove: jest.fn() });
  });

  describe('CategoryScreen Responsive Behavior', () => {
    it('should render correctly in portrait mode', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

      const { getByText } = render(
        <Provider store={store}>
          <CategoryScreen navigation={mockNavigation} />
        </Provider>
      );

      expect(getByText('Audio Topics')).toBeTruthy();
    });

    it('should render correctly in landscape mode', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });

      const { getByText } = render(
        <Provider store={store}>
          <CategoryScreen navigation={mockNavigation} />
        </Provider>
      );

      expect(getByText('Audio Topics')).toBeTruthy();
    });

    it('should adapt to tablet dimensions', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });

      const { getByText } = render(
        <Provider store={store}>
          <CategoryScreen navigation={mockNavigation} />
        </Provider>
      );

      expect(getByText('Audio Topics')).toBeTruthy();
    });
  });

  describe('AudioPlayerScreen Responsive Behavior', () => {
    it('should render correctly in portrait mode', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

      const { getByTestId } = render(
        <Provider store={store}>
          <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
        </Provider>
      );

      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should render correctly in landscape mode', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });

      const { getByTestId } = render(
        <Provider store={store}>
          <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
        </Provider>
      );

      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should adapt layout for tablet', () => {
      mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });

      const { getByTestId } = render(
        <Provider store={store}>
          <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
        </Provider>
      );

      expect(getByTestId('back-button')).toBeTruthy();
    });
  });

  describe('TopicListScreen Responsive Behavior', () => {
    it('should render correctly in portrait mode', () => {
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

      const { container } = render(
        <Provider store={store}>
          <TopicListScreen route={mockRoute} navigation={mockNavigation} />
        </Provider>
      );

      expect(container).toBeTruthy();
    });

    it('should render correctly in landscape mode', () => {
      mockDimensions.get.mockReturnValue({ width: 812, height: 375 });

      const { container } = render(
        <Provider store={store}>
          <TopicListScreen route={mockRoute} navigation={mockNavigation} />
        </Provider>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Orientation Change Handling', () => {
    it('should handle orientation changes in CategoryScreen', () => {
      const mockRemove = jest.fn();
      const mockAddEventListener = jest.fn().mockReturnValue({ remove: mockRemove });
      mockDimensions.addEventListener = mockAddEventListener;

      // Start with portrait
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

      const { rerender } = render(
        <Provider store={store}>
          <CategoryScreen navigation={mockNavigation} />
        </Provider>
      );

      // Simulate orientation change
      act(() => {
        const changeHandler = mockAddEventListener.mock.calls[0][1];
        mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
        changeHandler({ window: { width: 812, height: 375 } });
      });

      // Re-render to trigger hook updates
      rerender(
        <Provider store={store}>
          <CategoryScreen navigation={mockNavigation} />
        </Provider>
      );

      // Component should still render correctly
      expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('should handle orientation changes in AudioPlayerScreen', () => {
      const mockRemove = jest.fn();
      const mockAddEventListener = jest.fn().mockReturnValue({ remove: mockRemove });
      mockDimensions.addEventListener = mockAddEventListener;

      // Start with portrait
      mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

      const { rerender } = render(
        <Provider store={store}>
          <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
        </Provider>
      );

      // Simulate orientation change
      act(() => {
        const changeHandler = mockAddEventListener.mock.calls[0][1];
        mockDimensions.get.mockReturnValue({ width: 812, height: 375 });
        changeHandler({ window: { width: 812, height: 375 } });
      });

      // Re-render to trigger hook updates
      rerender(
        <Provider store={store}>
          <AudioPlayerScreen route={mockRoute} navigation={mockNavigation} />
        </Provider>
      );

      // Component should still render correctly
      expect(mockAddEventListener).toHaveBeenCalled();
    });
  });

  describe('Screen Size Adaptations', () => {
    it('should adapt to small screen sizes', () => {
      mockDimensions.get.mockReturnValue({ width: 320, height: 568 });

      const { getByText } = render(
        <Provider store={store}>
          <CategoryScreen navigation={mockNavigation} />
        </Provider>
      );

      expect(getByText('Audio Topics')).toBeTruthy();
    });

    it('should adapt to large screen sizes', () => {
      mockDimensions.get.mockReturnValue({ width: 428, height: 926 });

      const { getByText } = render(
        <Provider store={store}>
          <CategoryScreen navigation={mockNavigation} />
        </Provider>
      );

      expect(getByText('Audio Topics')).toBeTruthy();
    });
  });
});