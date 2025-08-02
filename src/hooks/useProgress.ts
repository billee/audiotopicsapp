/**
 * Custom hook for progress tracking functionality
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { AudioTopic } from '../types';
import {
  loadProgressData,
  startProgressTracking,
  stopProgressTracking,
  updateProgress,
  markTopicAsCompleted,
  checkResumeDialog,
  clearTopicProgress,
  getProgressStats,
} from '../store/thunks/progressThunks';
import {
  showResumeDialog,
  hideResumeDialog,
  startTracking,
  stopTracking,
} from '../store/slices/progressSlice';

export interface UseProgressReturn {
  // State
  progressData: Record<string, any>;
  completedTopics: string[];
  isTracking: boolean;
  currentTrackingTopicId: string | null;
  resumeDialog: {
    visible: boolean;
    topicId: string | null;
    resumePosition: number;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProgress: () => Promise<void>;
  startTracking: (topic: AudioTopic) => Promise<void>;
  stopTracking: () => Promise<void>;
  updateTopicProgress: (topicId: string, position: number) => Promise<void>;
  markCompleted: (topicId: string) => Promise<void>;
  checkForResumeDialog: (topicId: string) => Promise<{ shouldShow: boolean; resumePosition: number }>;
  showResume: (topicId: string, resumePosition: number) => void;
  hideResume: () => void;
  clearProgress: (topicId: string) => Promise<void>;
  getStats: () => Promise<any>;
  
  // Utility functions
  getTopicProgress: (topicId: string) => number;
  isTopicCompleted: (topicId: string) => boolean;
  hasTopicProgress: (topicId: string) => boolean;
  getProgressPercentage: (topicId: string, duration: number) => number;
}

export const useProgress = (): UseProgressReturn => {
  const dispatch = useAppDispatch();
  
  const {
    progressData,
    completedTopics,
    isTracking,
    currentTrackingTopicId,
    resumeDialog,
    isLoading,
    error,
  } = useAppSelector((state) => state.progress);

  // Load progress data on mount
  useEffect(() => {
    dispatch(loadProgressData());
  }, [dispatch]);

  // Actions
  const loadProgress = useCallback(async () => {
    try {
      await dispatch(loadProgressData()).unwrap();
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, [dispatch]);

  const startTrackingTopic = useCallback(async (topic: AudioTopic) => {
    try {
      await dispatch(startProgressTracking(topic)).unwrap();
      dispatch(startTracking(topic.id));
    } catch (error) {
      console.error('Failed to start tracking:', error);
    }
  }, [dispatch]);

  const stopTrackingTopic = useCallback(async () => {
    try {
      await dispatch(stopProgressTracking()).unwrap();
      dispatch(stopTracking());
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  }, [dispatch]);

  const updateTopicProgress = useCallback(async (topicId: string, position: number) => {
    try {
      await dispatch(updateProgress({ topicId, position })).unwrap();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }, [dispatch]);

  const markCompleted = useCallback(async (topicId: string) => {
    try {
      await dispatch(markTopicAsCompleted(topicId)).unwrap();
    } catch (error) {
      console.error('Failed to mark as completed:', error);
    }
  }, [dispatch]);

  const checkForResumeDialog = useCallback(async (topicId: string) => {
    try {
      const result = await dispatch(checkResumeDialog(topicId)).unwrap();
      return {
        shouldShow: result.shouldShow,
        resumePosition: result.resumePosition,
      };
    } catch (error) {
      console.error('Failed to check resume dialog:', error);
      return { shouldShow: false, resumePosition: 0 };
    }
  }, [dispatch]);

  const showResume = useCallback((topicId: string, resumePosition: number) => {
    dispatch(showResumeDialog({ topicId, resumePosition }));
  }, [dispatch]);

  const hideResume = useCallback(() => {
    dispatch(hideResumeDialog());
  }, [dispatch]);

  const clearProgress = useCallback(async (topicId: string) => {
    try {
      await dispatch(clearTopicProgress(topicId)).unwrap();
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }, [dispatch]);

  const getStats = useCallback(async () => {
    try {
      return await dispatch(getProgressStats()).unwrap();
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }, [dispatch]);

  // Utility functions
  const getTopicProgress = useCallback((topicId: string): number => {
    return progressData[topicId]?.position || 0;
  }, [progressData]);

  const isTopicCompleted = useCallback((topicId: string): boolean => {
    return completedTopics.includes(topicId);
  }, [completedTopics]);

  const hasTopicProgress = useCallback((topicId: string): boolean => {
    return !!progressData[topicId] && progressData[topicId].position > 0;
  }, [progressData]);

  const getProgressPercentage = useCallback((topicId: string, duration: number): number => {
    if (duration === 0) return 0;
    const position = getTopicProgress(topicId);
    return Math.min(100, Math.round((position / duration) * 100));
  }, [getTopicProgress]);

  return {
    // State
    progressData,
    completedTopics,
    isTracking,
    currentTrackingTopicId,
    resumeDialog,
    isLoading,
    error,
    
    // Actions
    loadProgress,
    startTracking: startTrackingTopic,
    stopTracking: stopTrackingTopic,
    updateTopicProgress,
    markCompleted,
    checkForResumeDialog,
    showResume,
    hideResume,
    clearProgress,
    getStats,
    
    // Utility functions
    getTopicProgress,
    isTopicCompleted,
    hasTopicProgress,
    getProgressPercentage,
  };
};