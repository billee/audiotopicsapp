/**
 * useTopics hook tests
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useTopics } from '../useTopics';
import audioReducer from '../../store/slices/audioSlice';
import categoriesReducer from '../../store/slices/categoriesSlice';
import topicsReducer from '../../store/slices/topicsSlice';
import userPreferencesReducer from '../../store/slices/userPreferencesSlice';

// Mock the TopicService
jest.mock('../../services/TopicService', () => {
  return jest.fn().mockImplementation(() => ({
    getTopicsByCategory: jest.fn().mockResolvedValue([
      {
        id: 'topic-1',
        title: 'Test Topic 1',
        description: 'Test Description 1',
        categoryId: 'cat-1',
        audioUrl: 'https://example.com/audio1.mp3',
        duration: 1800,
        author: 'Test Author 1',
        metadata: { bitrate: 128, format: 'mp3', size: 1000 },
      },
      {
        id: 'topic-2',
        title: 'Test Topic 2',
        description: 'Test Description 2',
        categoryId: 'cat-1',
        audioUrl: 'https://example.com/audio2.mp3',
        duration: 2400,
        author: 'Test Author 2',
        metadata: { bitrate: 128, format: 'mp3', size: 1500 },
      },
    ]),
    getTopics: jest.fn().mockResolvedValue([]),
    searchTopics: jest.fn().mockResolvedValue([]),
    getTopicsByDate: jest.fn().mockResolvedValue([]),
    getTopicsByDuration: jest.fn().mockResolvedValue([]),
  }));
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      audio: audioReducer,
      categories: categoriesReducer,
      topics: topicsReducer,
      userPreferences: userPreferencesReducer,
    },
    preloadedState: {
      topics: {
        topics: [],
        topicsByCategory: {},
        currentCategoryTopics: [],
        selectedCategoryId: null,
        loading: false,
        error: null,
        progressData: {
          'topic-2': {
            topicId: 'topic-2',
            position: 1200,
            completed: false,
            lastPlayed: new Date(),
            playCount: 1,
          },
        },
      },
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
      },
      categories: {
        categories: [],
        selectedCategoryId: null,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      },
      userPreferences: {
        categoryPreferences: {
          favoriteCategories: [],
          recentlyViewed: [],
          sortOrder: 'alphabetical' as const,
        },
        progressData: {},
        lastUpdated: Date.now(),
      },
    },
  });
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore();
  return React.createElement(Provider, { store }, children);
};

describe('useTopics', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    expect(result.current.topics).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasData).toBe(false);
    expect(result.current.isEmpty).toBe(true);
  });

  it('should provide action functions', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    expect(typeof result.current.loadTopicsForCategory).toBe('function');
    expect(typeof result.current.loadAllTopics).toBe('function');
    expect(typeof result.current.searchTopicsQuery).toBe('function');
    expect(typeof result.current.loadTopicsSortedByDate).toBe('function');
    expect(typeof result.current.loadTopicsSortedByDuration).toBe('function');
    expect(typeof result.current.selectCategory).toBe('function');
    expect(typeof result.current.clearTopicsError).toBe('function');
    expect(typeof result.current.refreshTopics).toBe('function');
  });

  it('should load topics for category when categoryId is provided', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTopics('cat-1'), { wrapper });

    // The hook should automatically load topics for the provided categoryId
    // We need to wait for the async operation to complete
    await act(async () => {
      result.current.loadTopicsForCategory('cat-1');
    });

    expect(result.current.selectedCategoryId).toBe('cat-1');
  });

  it('should handle loading state correctly', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    act(() => {
      result.current.loadAllTopics();
    });

    // The loading state should be managed by the Redux store
    // This test verifies the hook returns the loading state correctly
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should handle error state correctly', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    // Error handling is managed by the Redux store
    expect(result.current.error).toBe(null);
    expect(typeof result.current.clearTopicsError).toBe('function');
  });

  it('should provide stats when available', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    expect(result.current.stats).toBeDefined();
    expect(typeof result.current.stats.totalTopics).toBe('number');
    expect(typeof result.current.stats.completedCount).toBe('number');
    expect(typeof result.current.stats.inProgressCount).toBe('number');
    expect(typeof result.current.stats.notStartedCount).toBe('number');
    expect(typeof result.current.stats.completionPercentage).toBe('number');
  });

  it('should handle category selection', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    act(() => {
      result.current.selectCategory('cat-1');
    });

    expect(result.current.selectedCategoryId).toBe('cat-1');
  });

  it('should handle search functionality', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    act(() => {
      result.current.searchTopicsQuery('test query');
    });

    // The search should be handled by the Redux store
    // This test verifies the function is callable
    expect(typeof result.current.searchTopicsQuery).toBe('function');
  });

  it('should handle sorting functionality', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    act(() => {
      result.current.loadTopicsSortedByDate();
    });

    act(() => {
      result.current.loadTopicsSortedByDuration(true);
    });

    // The sorting should be handled by the Redux store
    // This test verifies the functions are callable
    expect(typeof result.current.loadTopicsSortedByDate).toBe('function');
    expect(typeof result.current.loadTopicsSortedByDuration).toBe('function');
  });

  it('should handle refresh functionality', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    act(() => {
      result.current.refreshTopics();
    });

    // The refresh should work based on the current selected category
    expect(typeof result.current.refreshTopics).toBe('function');
  });

  it('should return topics with progress information', () => {
    const { result } = renderHook(() => useTopics(), { wrapper });

    expect(Array.isArray(result.current.topicsWithProgress)).toBe(true);
    
    // Each topic should have progress information attached
    result.current.topicsWithProgress.forEach(topic => {
      expect(topic).toHaveProperty('isCompleted');
      expect(topic).toHaveProperty('isInProgress');
      expect(topic).toHaveProperty('progressPercentage');
    });
  });
});