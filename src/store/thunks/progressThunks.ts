/**
 * Progress thunks for async progress operations
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { AudioTopic, ProgressData } from '../../types';
import ProgressService from '../../services/ProgressService';
import StorageService from '../../services/StorageService';
import {
  setProgressData,
  updateTopicProgress,
  setCompletedTopics,
  markTopicCompleted,
  setLoading,
  setError,
} from '../slices/progressSlice';

const progressService = new ProgressService();

/**
 * Load all progress data from storage
 */
export const loadProgressData = createAsyncThunk(
  'progress/loadProgressData',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      const [allProgress, completedTopics] = await Promise.all([
        progressService.getAllProgressData(),
        StorageService.getCompletedTopics(),
      ]);
      
      // Convert array to object for easier lookup
      const progressMap: Record<string, ProgressData> = {};
      allProgress.forEach(progress => {
        progressMap[progress.topicId] = progress;
      });
      
      dispatch(setProgressData(progressMap));
      dispatch(setCompletedTopics(completedTopics));
      dispatch(setError(null));
      
      return { progressMap, completedTopics };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load progress data';
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Start progress tracking for a topic
 */
export const startProgressTracking = createAsyncThunk(
  'progress/startProgressTracking',
  async (topic: AudioTopic, { dispatch }) => {
    try {
      progressService.startProgressTracking(topic);
      dispatch(setError(null));
      return topic.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start progress tracking';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

/**
 * Stop progress tracking
 */
export const stopProgressTracking = createAsyncThunk(
  'progress/stopProgressTracking',
  async (_, { dispatch }) => {
    try {
      progressService.stopProgressTracking();
      dispatch(setError(null));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop progress tracking';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

/**
 * Update progress for current topic
 */
export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async ({ topicId, position }: { topicId: string; position: number }, { dispatch }) => {
    try {
      await progressService.updateProgress(position);
      
      // Get updated progress data
      const progressData = await progressService.getProgressData(topicId);
      if (progressData) {
        dispatch(updateTopicProgress(progressData));
      }
      
      dispatch(setError(null));
      return progressData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update progress';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

/**
 * Mark topic as completed
 */
export const markTopicAsCompleted = createAsyncThunk(
  'progress/markTopicAsCompleted',
  async (topicId: string, { dispatch }) => {
    try {
      await progressService.markCompleted(topicId);
      dispatch(markTopicCompleted(topicId));
      dispatch(setError(null));
      return topicId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark topic as completed';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

/**
 * Check if resume dialog should be shown and get resume position
 */
export const checkResumeDialog = createAsyncThunk(
  'progress/checkResumeDialog',
  async (topicId: string) => {
    try {
      const [shouldShow, resumePosition] = await Promise.all([
        progressService.shouldShowResumeDialog(topicId),
        progressService.getResumePosition(topicId),
      ]);
      
      return {
        shouldShow,
        resumePosition,
        topicId,
      };
    } catch (error) {
      console.error('Failed to check resume dialog:', error);
      return {
        shouldShow: false,
        resumePosition: 0,
        topicId,
      };
    }
  }
);

/**
 * Clear progress for a specific topic
 */
export const clearTopicProgress = createAsyncThunk(
  'progress/clearTopicProgress',
  async (topicId: string, { dispatch }) => {
    try {
      await progressService.clearProgress(topicId);
      dispatch(setError(null));
      return topicId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear topic progress';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

/**
 * Get progress statistics
 */
export const getProgressStats = createAsyncThunk(
  'progress/getProgressStats',
  async (_, { dispatch }) => {
    try {
      const stats = await progressService.getProgressStats();
      dispatch(setError(null));
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get progress statistics';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

export default progressService;