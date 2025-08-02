/**
 * Progress slice for managing audio progress tracking state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgressData } from '../../types';

interface ProgressState {
  progressData: Record<string, ProgressData>;
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
}

const initialState: ProgressState = {
  progressData: {},
  completedTopics: [],
  isTracking: false,
  currentTrackingTopicId: null,
  resumeDialog: {
    visible: false,
    topicId: null,
    resumePosition: 0,
  },
  isLoading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgressData: (state, action: PayloadAction<Record<string, ProgressData>>) => {
      state.progressData = action.payload;
    },
    
    updateTopicProgress: (state, action: PayloadAction<ProgressData>) => {
      const { topicId } = action.payload;
      state.progressData[topicId] = action.payload;
    },
    
    setCompletedTopics: (state, action: PayloadAction<string[]>) => {
      state.completedTopics = action.payload;
    },
    
    markTopicCompleted: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      if (!state.completedTopics.includes(topicId)) {
        state.completedTopics.push(topicId);
      }
      
      // Update progress data if it exists
      if (state.progressData[topicId]) {
        state.progressData[topicId].completed = true;
      }
    },
    
    startTracking: (state, action: PayloadAction<string>) => {
      state.isTracking = true;
      state.currentTrackingTopicId = action.payload;
    },
    
    stopTracking: (state) => {
      state.isTracking = false;
      state.currentTrackingTopicId = null;
    },
    
    showResumeDialog: (state, action: PayloadAction<{ topicId: string; resumePosition: number }>) => {
      state.resumeDialog = {
        visible: true,
        topicId: action.payload.topicId,
        resumePosition: action.payload.resumePosition,
      };
    },
    
    hideResumeDialog: (state) => {
      state.resumeDialog = {
        visible: false,
        topicId: null,
        resumePosition: 0,
      };
    },
    
    clearTopicProgress: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      delete state.progressData[topicId];
      state.completedTopics = state.completedTopics.filter(id => id !== topicId);
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },
    
    resetProgress: (state) => {
      state.progressData = {};
      state.completedTopics = [];
      state.isTracking = false;
      state.currentTrackingTopicId = null;
      state.resumeDialog = {
        visible: false,
        topicId: null,
        resumePosition: 0,
      };
      state.error = null;
    },
  },
});

export const {
  setProgressData,
  updateTopicProgress,
  setCompletedTopics,
  markTopicCompleted,
  startTracking,
  stopTracking,
  showResumeDialog,
  hideResumeDialog,
  clearTopicProgress,
  setLoading,
  setError,
  resetProgress,
} = progressSlice.actions;

export default progressSlice.reducer;