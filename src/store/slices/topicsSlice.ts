/**
 * Topics slice for managing topic data and state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioTopic, ProgressData } from '../../types';

interface TopicsState {
  topics: AudioTopic[];
  topicsByCategory: Record<string, AudioTopic[]>;
  currentCategoryTopics: AudioTopic[];
  selectedCategoryId: string | null;
  loading: boolean;
  error: string | null;
  progressData: Record<string, ProgressData>;
}

const initialState: TopicsState = {
  topics: [],
  topicsByCategory: {},
  currentCategoryTopics: [],
  selectedCategoryId: null,
  loading: false,
  error: null,
  progressData: {},
};

const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    setTopics: (state, action: PayloadAction<AudioTopic[]>) => {
      state.topics = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setTopicsByCategory: (state, action: PayloadAction<{ categoryId: string; topics: AudioTopic[] }>) => {
      const { categoryId, topics } = action.payload;
      state.topicsByCategory[categoryId] = topics;
      state.loading = false;
      state.error = null;
    },
    
    setCurrentCategoryTopics: (state, action: PayloadAction<AudioTopic[]>) => {
      state.currentCategoryTopics = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setSelectedCategoryId: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
      // Update current category topics if we have them cached
      if (action.payload && state.topicsByCategory[action.payload]) {
        state.currentCategoryTopics = state.topicsByCategory[action.payload];
      }
    },
    
    updateTopicProgress: (state, action: PayloadAction<ProgressData>) => {
      const progressData = action.payload;
      state.progressData[progressData.topicId] = progressData;
    },
    
    setTopicProgressData: (state, action: PayloadAction<Record<string, ProgressData>>) => {
      state.progressData = action.payload;
    },
    
    markTopicCompleted: (state, action: PayloadAction<string>) => {
      const topicId = action.payload;
      if (state.progressData[topicId]) {
        state.progressData[topicId].completed = true;
        state.progressData[topicId].lastPlayed = new Date();
        state.progressData[topicId].playCount += 1;
      } else {
        state.progressData[topicId] = {
          topicId,
          position: 0,
          completed: true,
          lastPlayed: new Date(),
          playCount: 1,
        };
      }
    },
    
    updateTopicPosition: (state, action: PayloadAction<{ topicId: string; position: number }>) => {
      const { topicId, position } = action.payload;
      if (state.progressData[topicId]) {
        state.progressData[topicId].position = position;
        state.progressData[topicId].lastPlayed = new Date();
      } else {
        state.progressData[topicId] = {
          topicId,
          position,
          completed: false,
          lastPlayed: new Date(),
          playCount: 0,
        };
      }
    },
    
    clearTopics: (state) => {
      state.topics = [];
      state.topicsByCategory = {};
      state.currentCategoryTopics = [];
      state.selectedCategoryId = null;
      state.loading = false;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setTopics,
  setTopicsByCategory,
  setCurrentCategoryTopics,
  setSelectedCategoryId,
  updateTopicProgress,
  setTopicProgressData,
  markTopicCompleted,
  updateTopicPosition,
  clearTopics,
  clearError,
} = topicsSlice.actions;

export default topicsSlice.reducer;