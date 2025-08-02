/**
 * useProgress hook tests
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useProgress } from '../useProgress';
import progressReducer from '../../store/slices/progressSlice';
import { AudioTopic } from '../../types';

// Mock the thunks
jest.mock('../../store/thunks/progressThunks', () => ({
  loadProgressData: jest.fn(() => ({ type: 'loadProgressData', payload: {} })),
  startProgressTracking: jest.fn(() => ({ type: 'startProgressTracking', payload: {} })),
  stopProgressTracking: jest.fn(() => ({ type: 'stopProgressTracking', payload: {} })),
  updateProgress: jest.fn(() => ({ type: 'updateProgress', payload: {} })),
  markTopicAsCompleted: jest.fn(() => ({ type: 'markTopicAsCompleted', payload: {} })),
  checkResumeDialog: jest.fn(() => ({ type: 'checkResumeDialog', payload: {} })),
  clearTopicProgress: jest.fn(() => ({ type: 'clearTopicProgress', payload: {} })),
  getProgressStats: jest.fn(() => ({ type: 'getProgressStats', payload: {} })),
}));

describe('useProgress', () => {
  let store: any;
  let mockTopic: AudioTopic;

  const createWrapper = () => {
    store = configureStore({
      reducer: {
        progress: progressReducer,
      },
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    return Wrapper;
  };

  beforeEach(() => {
    mockTopic = {
      id: 'test-topic-1',
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
    };
  });

  it('should initialize with default state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProgress(), { wrapper });

    expect(result.current.progressData).toEqual({});
    expect(result.current.completedTopics).toEqual([]);
    expect(result.current.isTracking).toBe(false);
    expect(result.current.currentTrackingTopicId).toBeNull();
    expect(result.current.resumeDialog.visible).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide utility functions', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProgress(), { wrapper });

    expect(typeof result.current.getTopicProgress).toBe('function');
    expect(typeof result.current.isTopicCompleted).toBe('function');
    expect(typeof result.current.hasTopicProgress).toBe('function');
    expect(typeof result.current.getProgressPercentage).toBe('function');
  });

  it('should provide action functions', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useProgress(), { wrapper });

    expect(typeof result.current.loadProgress).toBe('function');
    expect(typeof result.current.startTracking).toBe('function');
    expect(typeof result.current.stopTracking).toBe('function');
    expect(typeof result.current.updateTopicProgress).toBe('function');
    expect(typeof result.current.markCompleted).toBe('function');
    expect(typeof result.current.checkForResumeDialog).toBe('function');
    expect(typeof result.current.showResume).toBe('function');
    expect(typeof result.current.hideResume).toBe('function');
    expect(typeof result.current.clearProgress).toBe('function');
    expect(typeof result.current.getStats).toBe('function');
  });

  describe('utility functions', () => {
    it('should return correct topic progress', () => {
      const wrapper = createWrapper();
      
      // Add some progress data to the store
      act(() => {
        store.dispatch({
          type: 'progress/setProgressData',
          payload: {
            'test-topic-1': {
              topicId: 'test-topic-1',
              position: 150,
              completed: false,
              lastPlayed: new Date(),
              playCount: 1,
            },
          },
        });
      });

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.getTopicProgress('test-topic-1')).toBe(150);
      expect(result.current.getTopicProgress('non-existent')).toBe(0);
    });

    it('should check if topic is completed', () => {
      const wrapper = createWrapper();
      
      // Add completed topic to the store
      act(() => {
        store.dispatch({
          type: 'progress/setCompletedTopics',
          payload: ['test-topic-1'],
        });
      });

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.isTopicCompleted('test-topic-1')).toBe(true);
      expect(result.current.isTopicCompleted('non-existent')).toBe(false);
    });

    it('should check if topic has progress', () => {
      const wrapper = createWrapper();
      
      // Add progress data to the store
      act(() => {
        store.dispatch({
          type: 'progress/setProgressData',
          payload: {
            'test-topic-1': {
              topicId: 'test-topic-1',
              position: 150,
              completed: false,
              lastPlayed: new Date(),
              playCount: 1,
            },
            'test-topic-2': {
              topicId: 'test-topic-2',
              position: 0,
              completed: false,
              lastPlayed: new Date(),
              playCount: 1,
            },
          },
        });
      });

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.hasTopicProgress('test-topic-1')).toBe(true);
      expect(result.current.hasTopicProgress('test-topic-2')).toBe(false);
      expect(result.current.hasTopicProgress('non-existent')).toBe(false);
    });

    it('should calculate progress percentage correctly', () => {
      const wrapper = createWrapper();
      
      // Add progress data to the store
      act(() => {
        store.dispatch({
          type: 'progress/setProgressData',
          payload: {
            'test-topic-1': {
              topicId: 'test-topic-1',
              position: 150, // 50% of 300 seconds
              completed: false,
              lastPlayed: new Date(),
              playCount: 1,
            },
          },
        });
      });

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.getProgressPercentage('test-topic-1', 300)).toBe(50);
      expect(result.current.getProgressPercentage('test-topic-1', 0)).toBe(0);
      expect(result.current.getProgressPercentage('non-existent', 300)).toBe(0);
    });

    it('should cap progress percentage at 100%', () => {
      const wrapper = createWrapper();
      
      // Add progress data that exceeds duration
      act(() => {
        store.dispatch({
          type: 'progress/setProgressData',
          payload: {
            'test-topic-1': {
              topicId: 'test-topic-1',
              position: 350, // More than 300 seconds duration
              completed: false,
              lastPlayed: new Date(),
              playCount: 1,
            },
          },
        });
      });

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.getProgressPercentage('test-topic-1', 300)).toBe(100);
    });
  });

  describe('resume dialog actions', () => {
    it('should show resume dialog', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.showResume('test-topic-1', 150);
      });

      expect(result.current.resumeDialog.visible).toBe(true);
      expect(result.current.resumeDialog.topicId).toBe('test-topic-1');
      expect(result.current.resumeDialog.resumePosition).toBe(150);
    });

    it('should hide resume dialog', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useProgress(), { wrapper });

      // First show the dialog
      act(() => {
        result.current.showResume('test-topic-1', 150);
      });

      expect(result.current.resumeDialog.visible).toBe(true);

      // Then hide it
      act(() => {
        result.current.hideResume();
      });

      expect(result.current.resumeDialog.visible).toBe(false);
      expect(result.current.resumeDialog.topicId).toBeNull();
      expect(result.current.resumeDialog.resumePosition).toBe(0);
    });
  });
});